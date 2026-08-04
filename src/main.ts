import "./styles.css";
import { DEVELOPMENT_PHASES, PROJECTS, PROJECT_BY_ID, UPGRADES } from "./data";
import { generateIdeaOptions } from "./ideas";
import {
  SAVE_KEY,
  advanceOffline,
  advanceRealtime,
  buyUpgrade,
  canPublish,
  chooseIdea,
  createInitialState,
  formatNumber,
  getBaseProduction,
  getCurrentPhase,
  getCurrentProject,
  getFanReward,
  getReleasePayment,
  getCurrentObjective,
  getProjectStepCount,
  getRequiredWork,
  getUpgradeCost,
  isProjectUnlocked,
  isUpgradeUnlocked,
  publish,
  queueProject,
  selectProject,
  tap,
} from "./engine";
import type { GameState, ProjectId, UpgradeId } from "./types";

const OLD_SAVE_KEY = "pixel-studio-tycoon-save-v1";
const TUTORIAL_KEY = "pixel-studio-tycoon-tutorial-v1";
const UPGRADE_ICONS: Record<UpgradeId, string> = {
  research: "â–¤",
  prototype: "â—‡",
  workstation: "â–£",
  playtesting: "âœ“",
  storefront: "â–±",
  team: "+",
  pipeline: "â†»",
};

function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing required element: ${id}`);
  return value as T;
}

const ui = {
  money: element("money-value"),
  fans: element("fans-value"),
  games: element("games-value"),
  production: element("production-value"),
  projectTitle: element("current-project-title"),
  projectType: element("current-project-type"),
  work: element("work-value"),
  projectProgress: element("project-progress"),
  progressFill: element("progress-fill"),
  phaseProgressLabel: element("phase-progress-label"),
  currentPhaseIcon: element("current-phase-icon"),
  phaseAction: element("phase-action"),
  phaseDescription: element("phase-description"),
  phaseList: element("phase-list"),
  status: element("status-message"),
  saveStatus: element("save-status"),
  workButton: element<HTMLButtonElement>("work-button"),
  autoPublishToggle: element<HTMLInputElement>("auto-publish-toggle"),
  upgradeList: element("upgrade-list"),
  projectList: element("project-list"),
  brainstormPanel: element("brainstorm-panel"),
  ideaList: element("idea-list"),
  projectComplexity: element("project-complexity"),
  queueList: element("queue-list"),
  queueCapacity: element("queue-capacity"),
  resetButton: element<HTMLButtonElement>("reset-button"),
  helpButton: element<HTMLButtonElement>("help-button"),
  resetDialog: element<HTMLDialogElement>("reset-dialog"),
  confirmReset: element<HTMLButtonElement>("confirm-reset"),
  ideaDialog: element<HTMLDialogElement>("idea-dialog"),
  tutorialDialog: element<HTMLDialogElement>("tutorial-dialog"),
  tutorialDone: element<HTMLButtonElement>("tutorial-done"),
};

let state = loadState();
let message = "Your bedroom studio is ready. Begin the concept phase.";
let lastFrame = performance.now();
let upgradeRenderKey = "";
let projectRenderKey = "";
let queueRenderKey = "";
let ideaRenderKey = "";
let ideaDialogScheduled = false;

const elapsedOffline = Math.max(0, Math.floor((Date.now() - state.lastSavedAt) / 1000));
if (elapsedOffline > 2) {
  const before = state.gamesPublished;
  advanceOffline(state, elapsedOffline);
  const published = state.gamesPublished - before;
  if (published > 0) message = `Your studio published ${published} game${published === 1 ? "" : "s"} while you were away.`;
  else if (state.work > 0) message = `Your team made ${formatNumber(state.work)} work while you were away.`;
}

ui.workButton.addEventListener("click", () => {
  if (canPublish(state)) {
    const project = getCurrentProject(state);
    const gameName = state.currentGameName;
    const fanReward = getFanReward(state, project);
    const releasePayment = getReleasePayment(state);
    if (publish(state)) message = `${gameName} launched! Final payment: $${formatNumber(releasePayment)} plus ${formatNumber(fanReward)} fans.`;
    saveAndRender();
    return;
  }
  const moneyBefore = state.money;
  tap(state);
  const phase = getCurrentPhase(state).phase;
  const milestonePayment = state.money - moneyBefore;
  message = canPublish(state)
    ? "Development is complete. Publish when you are ready."
    : milestonePayment > 0
      ? `${phase.name} milestone funded: +$${formatNumber(milestonePayment)}.`
      : phase.action;
  saveAndRender();
});

ui.autoPublishToggle.addEventListener("change", () => {
  state.autoPublish = ui.autoPublishToggle.checked && state.upgradeLevels.pipeline > 0;
  message = state.autoPublish ? "The release pipeline will publish and continue automatically." : "Automatic publishing paused.";
  saveAndRender();
});

ui.upgradeList.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-upgrade]");
  if (!button) return;
  const id = button.dataset.upgrade as UpgradeId;
  if (!buyUpgrade(state, id)) return;
  const upgrade = UPGRADES.find((item) => item.id === id);
  message = `${upgrade?.name ?? "Upgrade"} improved to level ${state.upgradeLevels[id]}.`;
  saveAndRender();
});

ui.projectList.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-project-action]");
  if (!button) return;
  const id = button.dataset.projectId as ProjectId;
  if (button.dataset.projectAction === "select" && selectProject(state, id)) {
    message = `${PROJECT_BY_ID[id].name} selected as the current project.`;
  }
  if (button.dataset.projectAction === "queue" && queueProject(state, id)) {
    message = `${PROJECT_BY_ID[id].name} added to the production queue.`;
  }
  saveAndRender();
});

ui.ideaList.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-idea-id]");
  if (!button || !chooseIdea(state, button.dataset.ideaId ?? "")) return;
  message = `${state.currentGameName} selected. Development begins with Concept.`;
  ui.ideaDialog.close();
  saveAndRender();
});

ui.helpButton.addEventListener("click", () => {
  if (!ui.tutorialDialog.open) ui.tutorialDialog.showModal();
});
ui.tutorialDone.addEventListener("click", () => {
  localStorage.setItem(TUTORIAL_KEY, "complete");
  ui.tutorialDialog.close();
  if (!state.currentIdea && !ui.ideaDialog.open) ui.ideaDialog.showModal();
});
ui.ideaDialog.addEventListener("cancel", (event) => event.preventDefault());

ui.queueList.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-remove-queue]");
  if (!button) return;
  const index = Number(button.dataset.removeQueue);
  if (!Number.isInteger(index)) return;
  state.projectQueue.splice(index, 1);
  message = "Project removed from the queue.";
  saveAndRender();
});

ui.resetButton.addEventListener("click", () => ui.resetDialog.showModal());
ui.confirmReset.addEventListener("click", () => {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(OLD_SAVE_KEY);
  state = createInitialState();
  message = "A new bedroom studio has been started.";
  saveAndRender();
});

window.addEventListener("pagehide", saveState);
window.setInterval(saveState, 5_000);

function frame(now: number): void {
  const seconds = Math.min(1, (now - lastFrame) / 1_000);
  lastFrame = now;
  const before = state.gamesPublished;
  advanceRealtime(state, seconds);
  if (state.gamesPublished > before) {
    const count = state.gamesPublished - before;
    message = `Release pipeline published ${count} game${count === 1 ? "" : "s"} automatically.`;
  }
  render();
  window.requestAnimationFrame(frame);
}

function loadState(): GameState {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as Partial<GameState> | null;
    if (saved?.version === 2) return sanitizeState({ ...createInitialState(), ...saved } as GameState);
    const old = JSON.parse(localStorage.getItem(OLD_SAVE_KEY) ?? "null") as Record<string, unknown> | null;
    if (old?.version === 1) return migrateOldState(old);
  } catch {
    // Corrupt saves fall back to a fresh studio.
  }
  return createInitialState();
}

function sanitizeState(candidate: GameState): GameState {
  const clean = createInitialState();
  clean.work = Math.max(0, numberValue(candidate.work));
  clean.money = Math.max(0, numberValue(candidate.money));
  clean.fans = Math.max(0, numberValue(candidate.fans));
  clean.gamesPublished = Math.max(0, Math.floor(numberValue(candidate.gamesPublished)));
  clean.ideaOptions = generateIdeaOptions(clean.gamesPublished);
  clean.milestonePaymentsClaimed = Array.isArray(candidate.milestonePaymentsClaimed)
    ? candidate.milestonePaymentsClaimed.filter((value) => Number.isInteger(value) && value >= 0 && value < 4)
    : [];
  const savedIdeaId = candidate.currentIdea?.id;
  clean.currentIdea = clean.ideaOptions.find((idea) => idea.id === savedIdeaId) ?? null;
  if (!clean.currentIdea && numberValue(candidate.work) > 0) clean.currentIdea = clean.ideaOptions.find((idea) => idea.profile === "promising") ?? null;
  clean.upgradeLevels = {
    research: clampLevel(candidate.upgradeLevels?.research, "research"),
    prototype: clampLevel(candidate.upgradeLevels?.prototype, "prototype"),
    workstation: clampLevel(candidate.upgradeLevels?.workstation, "workstation"),
    playtesting: clampLevel(candidate.upgradeLevels?.playtesting, "playtesting"),
    storefront: clampLevel(candidate.upgradeLevels?.storefront, "storefront"),
    team: clampLevel(candidate.upgradeLevels?.team, "team"),
    pipeline: clampLevel(candidate.upgradeLevels?.pipeline, "pipeline"),
  };
  clean.currentProjectId = PROJECT_BY_ID[candidate.currentProjectId] ? candidate.currentProjectId : "tiny-adventure";
  clean.selectedProjectId = PROJECT_BY_ID[candidate.selectedProjectId] ? candidate.selectedProjectId : clean.currentProjectId;
  clean.projectQueue = Array.isArray(candidate.projectQueue)
    ? candidate.projectQueue.filter((id): id is ProjectId => Boolean(PROJECT_BY_ID[id])).slice(0, 3)
    : [];
  clean.autoPublish = Boolean(candidate.autoPublish) && clean.upgradeLevels.pipeline > 0;
  clean.currentGameName = clean.currentIdea?.title ?? (typeof candidate.currentGameName === "string" && candidate.currentGameName.trim()
    ? candidate.currentGameName.trim().slice(0, 40)
    : "Choose your next project");
  clean.focus = Math.max(0, Math.min(100, numberValue(candidate.focus)));
  clean.lastSavedAt = numberValue(candidate.lastSavedAt) || Date.now();
  clean.work = Math.min(clean.work, getRequiredWork(clean));
  return clean;
}

function clampLevel(value: unknown, id: UpgradeId): number {
  const maximum = UPGRADES.find((upgrade) => upgrade.id === id)?.maxLevel ?? 0;
  return Math.max(0, Math.min(maximum, Math.floor(numberValue(value))));
}

function migrateOldState(old: Record<string, unknown>): GameState {
  const migrated = createInitialState();
  migrated.work = numberValue(old.code);
  migrated.money = numberValue(old.money);
  migrated.fans = numberValue(old.fans);
  migrated.gamesPublished = numberValue(old.games);
  migrated.upgradeLevels.workstation = old.keyboardPurchased ? 1 : 0;
  migrated.upgradeLevels.team = old.developerHired ? 1 : 0;
  migrated.lastSavedAt = numberValue(old.lastSavedAt) || Date.now();
  return migrated;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function saveAndRender(): void {
  saveState();
  render();
}

function saveState(): void {
  try {
    state.lastSavedAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    ui.saveStatus.textContent = "Saved locally";
  } catch {
    ui.saveStatus.textContent = "Save unavailable";
  }
}

function render(): void {
  const project = getCurrentProject(state);
  const requiredWork = getRequiredWork(state);
  const progress = Math.min(100, state.work / requiredWork * 100);
  const pipelineUnlocked = state.upgradeLevels.pipeline > 0;
  const currentPhase = getCurrentPhase(state);
  const currentObjective = getCurrentObjective(state);

  ui.money.textContent = `$${formatNumber(state.money)}`;
  ui.fans.textContent = formatNumber(state.fans);
  ui.games.textContent = formatNumber(state.gamesPublished);
  ui.production.textContent = `${getBaseProduction(state).toFixed(1)}/s`;
  ui.projectTitle.textContent = state.currentGameName;
  ui.projectType.textContent = `${project.name} Â· ${currentPhase.phase.name}`;
  ui.work.textContent = state.currentIdea ? `${formatNumber(state.work)} / ${formatNumber(requiredWork)} work` : "Brainstorming required";
  ui.projectProgress.setAttribute("aria-valuemax", String(requiredWork));
  ui.projectProgress.setAttribute("aria-valuenow", String(Math.floor(state.work)));
  ui.progressFill.style.width = `${progress}%`;
  ui.phaseProgressLabel.textContent = state.currentIdea
    ? `${currentPhase.phase.name} Â· Objective ${currentObjective.index + 1}/${currentObjective.count} Â· ${Math.floor(currentPhase.progress * 100)}%`
    : "Waiting for a project idea";
  ui.currentPhaseIcon.textContent = currentPhase.phase.icon;
  ui.phaseAction.textContent = state.currentIdea ? currentPhase.phase.action : "Brainstorm your next game";
  ui.phaseDescription.textContent = state.currentIdea ? currentPhase.phase.description : "Compare three concepts and choose the milestone your bedroom studio will commit to.";
  ui.phaseList.innerHTML = DEVELOPMENT_PHASES.map((phase, index) => {
    const status = index < currentPhase.index ? "complete" : index === currentPhase.index ? "active" : "pending";
    return `<div class="phase-step ${status}"><span aria-hidden="true">${phase.icon}</span><strong>${phase.name}</strong></div>`;
  }).join("");
  ui.workButton.textContent = canPublish(state) ? "Publish" : "Work";
  ui.workButton.disabled = !state.currentIdea;
  ui.autoPublishToggle.disabled = !pipelineUnlocked;
  ui.autoPublishToggle.checked = pipelineUnlocked && state.autoPublish;
  ui.status.textContent = message;
  ui.queueCapacity.textContent = pipelineUnlocked ? `Queue ${state.projectQueue.length} / 3` : "Queue locked";

  renderUpgrades();
  renderIdeas();
  renderProjects();
  renderQueue();
  if (!state.currentIdea && !ideaDialogScheduled && !ui.ideaDialog.open && !ui.tutorialDialog.open && localStorage.getItem(TUTORIAL_KEY) === "complete") {
    ideaDialogScheduled = true;
    window.setTimeout(() => {
      ideaDialogScheduled = false;
      if (!state.currentIdea && !ui.ideaDialog.open && !ui.tutorialDialog.open) ui.ideaDialog.showModal();
    }, 0);
  }
}

function renderIdeas(): void {
  const steps = getProjectStepCount(state);
  ui.projectComplexity.textContent = `${steps} objective${steps === 1 ? "" : "s"} per phase`;
  ui.brainstormPanel.classList.toggle("selected", Boolean(state.currentIdea));
  const nextKey = `${state.currentIdea?.id ?? "none"}|${state.ideaOptions.map((idea) => idea.id).join("|")}`;
  if (nextKey === ideaRenderKey) return;
  ideaRenderKey = nextKey;
  ui.ideaList.innerHTML = state.ideaOptions.map((idea) => {
    const selected = state.currentIdea?.id === idea.id;
    return `<article class="idea-card ${idea.profile} ${selected ? "selected" : ""}">
      <span class="idea-profile">${idea.profile}</span>
      <h3>${idea.title}</h3>
      <p>${idea.pitch}</p>
      <dl><div><dt>Potential</dt><dd>${idea.potentialMin}â€“${idea.potentialMax}</dd></div><div><dt>Risk</dt><dd>${idea.risk}%</dd></div><div><dt>Work</dt><dd>x${idea.workMultiplier.toFixed(1)}</dd></div></dl>
      <button class="button button-small" type="button" data-idea-id="${idea.id}" ${state.currentIdea ? "disabled" : ""}>${selected ? "Selected" : "Choose idea"}</button>
    </article>`;
  }).join("");
}

function renderUpgrades(): void {
  const nextKey = `${state.money}|${state.gamesPublished}|${Object.values(state.upgradeLevels).join("|")}`;
  if (nextKey === upgradeRenderKey) return;
  upgradeRenderKey = nextKey;
  ui.upgradeList.innerHTML = UPGRADES.map((upgrade) => {
    const level = state.upgradeLevels[upgrade.id];
    const maxed = level >= upgrade.maxLevel;
    const unlocked = isUpgradeUnlocked(state, upgrade.id);
    const cost = getUpgradeCost(state, upgrade.id);
    const disabled = !unlocked || maxed || state.money < cost;
    return `
      <article class="upgrade-item">
        <span class="upgrade-icon" aria-hidden="true">${UPGRADE_ICONS[upgrade.id]}</span>
        <div>
          <span class="path-label">${upgrade.path} path</span>
          <h3>${upgrade.name}</h3>
          <p>${upgrade.description}</p>
          <span>${unlocked ? `Level ${level} / ${upgrade.maxLevel}` : `Unlocks after game ${upgrade.unlockGames}`}</span>
        </div>
        <button class="button button-small" type="button" data-upgrade="${upgrade.id}" ${disabled ? "disabled" : ""}>
          ${!unlocked ? "Locked" : maxed ? "Maxed" : `Buy - $${formatNumber(cost)}`}
        </button>
      </article>`;
  }).join("");
}

function renderProjects(): void {
  const nextKey = `${state.gamesPublished}|${state.fans}|${state.currentProjectId}|${state.work === 0}|${state.upgradeLevels.pipeline}|${state.projectQueue.length}`;
  if (nextKey === projectRenderKey) return;
  projectRenderKey = nextKey;
  ui.projectList.innerHTML = PROJECTS.map((item) => {
    const unlocked = isProjectUnlocked(state, item.id);
    const current = state.currentProjectId === item.id;
    const canSelect = unlocked && state.work === 0 && !current;
    const canQueue = unlocked && state.upgradeLevels.pipeline > 0 && state.projectQueue.length < 3;
    return `
      <article class="project-card ${unlocked ? "" : "locked"} ${current ? "current" : ""}">
        <div>
          <span class="project-status">${current ? "In production" : unlocked ? "Available" : `Unlock: ${item.unlockGames} games + ${item.unlockFans} fans`}</span>
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
        <dl>
          <div><dt>Work</dt><dd>${formatNumber(item.workRequired)}</dd></div>
          <div><dt>Reward</dt><dd>$${formatNumber(item.moneyReward)}</dd></div>
          <div><dt>Fans</dt><dd>${formatNumber(getFanReward(state, item))}</dd></div>
        </dl>
        <div class="project-actions">
          <button class="button button-small" type="button" data-project-action="select" data-project-id="${item.id}" ${canSelect ? "" : "disabled"}>Select</button>
          <button class="button button-small" type="button" data-project-action="queue" data-project-id="${item.id}" ${canQueue ? "" : "disabled"}>Queue</button>
        </div>
      </article>`;
  }).join("");
}

function renderQueue(): void {
  const nextKey = `${state.upgradeLevels.pipeline}|${state.selectedProjectId}|${state.projectQueue.join(",")}`;
  if (nextKey === queueRenderKey) return;
  queueRenderKey = nextKey;
  if (state.upgradeLevels.pipeline < 1) {
    ui.queueList.innerHTML = '<p class="empty-state">Buy the Release Pipeline to queue and repeat projects automatically.</p>';
    return;
  }
  if (state.projectQueue.length === 0) {
    ui.queueList.innerHTML = `<p class="empty-state">The queue is empty. Auto publish will repeat ${PROJECT_BY_ID[state.selectedProjectId].name}.</p>`;
    return;
  }
  ui.queueList.innerHTML = state.projectQueue.map((id, index) => `
    <div class="queue-item">
      <span>${index + 1}. ${PROJECT_BY_ID[id].name}</span>
      <button class="text-button" type="button" data-remove-queue="${index}">Remove</button>
    </div>`).join("");
}

render();
if (localStorage.getItem(TUTORIAL_KEY) !== "complete") ui.tutorialDialog.showModal();
window.requestAnimationFrame(frame);
