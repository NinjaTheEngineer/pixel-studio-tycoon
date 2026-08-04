import "./styles.css";
import { BadgeDollarSign, BookOpen, BriefcaseBusiness, CircleDollarSign, FlaskConical, Gamepad2, HandCoins, Laptop, Megaphone, PackageCheck, Rocket, Settings, TestTubeDiagonal, Users, Wrench, createIcons } from "lucide";
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
  getClickPower,
  getCompanyStage,
  getPatronIncomePerSecond,
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
  research: "book-open",
  prototype: "flask-conical",
  workstation: "laptop",
  playtesting: "test-tube-diagonal",
  storefront: "megaphone",
  patronSupport: "hand-coins",
  team: "users",
  pipeline: "rocket",
};
const PHASE_ICONS: Record<string, string> = { concept: "book-open", preproduction: "flask-conical", production: "settings", polish: "test-tube-diagonal", launch: "package-check" };

function element<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing required element: ${id}`);
  return value as T;
}

const ui = {
  money: element("money-value"),
  fans: element("fans-value"),
  games: element("games-value"),
  stageLabel: element("stage-label"),
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
  studioPanel: element<HTMLElement>("work-view"),
  computerArea: element<HTMLElement>("computer-area"),
  tapPopup: element("tap-popup"),
  computerActionLabel: element("computer-action-label"),
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
  tutorialStepCount: element("tutorial-step-count"),
  tutorialTitle: element("tutorial-title"),
  tutorialCopy: element("tutorial-copy"),
  tutorialBack: element<HTMLButtonElement>("tutorial-back"),
  tutorialNext: element<HTMLButtonElement>("tutorial-next"),
};

const TUTORIAL_STEPS = [
  { title: "Choose a project idea", copy: "Every game begins with three concepts: Safe, Promising, and Wild. Compare their potential and visible workload before committing." },
  { title: "Tap the computer to work", copy: "The computer is your Work button. Each tap advances the current objective; the label changes when your game is ready to publish." },
  { title: "Milestones pay early", copy: "Concept, Pre-production, Production, and Polish each pay part of the contract. Patrons are rare, but each one supports you with recurring cash." },
  { title: "Build a real studio", copy: "Spend milestone money on upgrades. Use the bottom tabs to move between your computer, upgrades, and larger future projects." },
] as const;
let tutorialStep = 0;

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

function performComputerAction(): void {
  if (!state.currentIdea) return;
  if (canPublish(state)) {
    const project = getCurrentProject(state);
    const gameName = state.currentGameName;
    const fanReward = getFanReward(state, project);
    const releasePayment = getReleasePayment(state);
    if (publish(state)) message = `${gameName} launched! Final payment: $${formatNumber(releasePayment)} plus ${formatNumber(fanReward)} Patron${fanReward === 1 ? "" : "s"}.`;
    saveAndRender();
    return;
  }
  const moneyBefore = state.money;
  const tapAmount = getClickPower(state);
  tap(state);
  ui.tapPopup.textContent = `+${formatNumber(tapAmount)}`;
  ui.tapPopup.classList.remove("show");
  ui.computerArea.classList.remove("shake");
  void ui.tapPopup.offsetWidth;
  ui.tapPopup.classList.add("show");
  ui.computerArea.classList.add("shake");
  const phase = getCurrentPhase(state).phase;
  const milestonePayment = state.money - moneyBefore;
  message = canPublish(state)
    ? "Development is complete. Publish when you are ready."
    : milestonePayment > 0
      ? `${phase.name} milestone funded: +$${formatNumber(milestonePayment)}.`
      : phase.action;
  saveAndRender();
}

ui.studioPanel.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).closest("button, a, input")) return;
  performComputerAction();
});
ui.computerArea.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  performComputerAction();
});
ui.computerArea.addEventListener("animationend", () => ui.computerArea.classList.remove("shake"));

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
  showView("work-view");
  saveAndRender();
});

ui.helpButton.addEventListener("click", () => {
  tutorialStep = 0;
  renderTutorialStep();
  if (!ui.tutorialDialog.open) ui.tutorialDialog.showModal();
});
ui.tutorialBack.addEventListener("click", () => {
  tutorialStep = Math.max(0, tutorialStep - 1);
  renderTutorialStep();
});
ui.tutorialNext.addEventListener("click", () => {
  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
    tutorialStep += 1;
    renderTutorialStep();
    return;
  }
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
    patronSupport: clampLevel(candidate.upgradeLevels?.patronSupport, "patronSupport"),
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
  const companyStage = getCompanyStage(state);

  ui.money.textContent = `$${formatNumber(state.money)}`;
  ui.fans.textContent = formatNumber(state.fans);
  ui.games.textContent = `${companyStage.current} / ${companyStage.total}`;
  ui.stageLabel.textContent = companyStage.name;
  ui.production.textContent = `$${getPatronIncomePerSecond(state).toFixed(2)}/s`;
  ui.projectTitle.textContent = state.currentGameName;
  ui.projectType.textContent = `${project.name} / ${currentPhase.phase.name}`;
  ui.work.textContent = state.currentIdea ? `${formatNumber(state.work)} / ${formatNumber(requiredWork)} work` : "Brainstorming required";
  ui.projectProgress.setAttribute("aria-valuemax", String(requiredWork));
  ui.projectProgress.setAttribute("aria-valuenow", String(Math.floor(state.work)));
  ui.progressFill.style.width = `${progress}%`;
  ui.phaseProgressLabel.textContent = state.currentIdea
    ? `${currentPhase.phase.name} / Objective ${currentObjective.index + 1}/${currentObjective.count} / ${Math.floor(currentPhase.progress * 100)}%`
    : "Waiting for a project idea";
  ui.currentPhaseIcon.innerHTML = `<i data-lucide="${PHASE_ICONS[currentPhase.phase.id]}"></i>`;
  ui.phaseAction.textContent = state.currentIdea ? currentPhase.phase.action : "Brainstorm your next game";
  ui.phaseDescription.textContent = state.currentIdea ? currentPhase.phase.description : "Compare three concepts and choose the milestone your bedroom studio will commit to.";
  ui.phaseList.innerHTML = DEVELOPMENT_PHASES.map((phase, index) => {
    const status = index < currentPhase.index ? "complete" : index === currentPhase.index ? "active" : "pending";
    return `<div class="phase-step ${status}"><span aria-hidden="true"><i data-lucide="${PHASE_ICONS[phase.id]}"></i></span><strong>${phase.name}</strong></div>`;
  }).join("");
  ui.computerArea.setAttribute("aria-disabled", String(!state.currentIdea));
  ui.computerArea.tabIndex = state.currentIdea ? 0 : -1;
  ui.computerActionLabel.textContent = !state.currentIdea
    ? "CHOOSE A PROJECT IDEA"
    : canPublish(state)
      ? "TAP COMPUTER TO PUBLISH"
      : `TAP ANYWHERE / +${formatNumber(getClickPower(state))} WORK`;
  ui.autoPublishToggle.disabled = !pipelineUnlocked;
  ui.autoPublishToggle.checked = pipelineUnlocked && state.autoPublish;
  ui.status.textContent = message;
  ui.queueCapacity.textContent = pipelineUnlocked ? `Queue ${state.projectQueue.length} / 3` : "Queue locked";

  renderUpgrades();
  renderIdeas();
  renderProjects();
  renderQueue();
  renderLucideIcons();
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
      <dl><div><dt>Potential</dt><dd>${idea.potentialMin}-${idea.potentialMax}</dd></div><div><dt>Scope</dt><dd>${idea.profile === "safe" ? "Compact" : idea.profile === "wild" ? "Ambitious" : "Balanced"}</dd></div><div><dt>Work</dt><dd>x${idea.workMultiplier.toFixed(1)}</dd></div></dl>
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
        <span class="upgrade-icon" aria-hidden="true"><i data-lucide="${UPGRADE_ICONS[upgrade.id]}"></i></span>
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
          <div><dt>Base work</dt><dd>${formatNumber(item.workRequired)}</dd></div>
          <div><dt>Reward</dt><dd>$${formatNumber(item.moneyReward)}</dd></div>
          <div><dt>Patrons</dt><dd>${formatNumber(getFanReward(state, item))}</dd></div>
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

function renderLucideIcons(): void {
  createIcons({
    icons: { BadgeDollarSign, BookOpen, BriefcaseBusiness, CircleDollarSign, FlaskConical, Gamepad2, HandCoins, Laptop, Megaphone, PackageCheck, Rocket, Settings, TestTubeDiagonal, Users, Wrench },
    attrs: { "stroke-width": 1.8 },
  });
}

function renderTutorialStep(): void {
  const step = TUTORIAL_STEPS[tutorialStep];
  ui.tutorialStepCount.textContent = `${tutorialStep + 1} / ${TUTORIAL_STEPS.length}`;
  ui.tutorialTitle.textContent = step.title;
  ui.tutorialCopy.textContent = step.copy;
  ui.tutorialBack.disabled = tutorialStep === 0;
  ui.tutorialNext.textContent = tutorialStep === TUTORIAL_STEPS.length - 1 ? "Start brainstorming" : "Next";
}

const viewIds = ["work-view", "upgrades-view", "projects-view"] as const;
const viewButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-view-target]"));
function showView(viewId: string): void {
  viewIds.forEach((id) => element(id).classList.toggle("active-view", id === viewId));
  viewButtons.forEach((button) => button.classList.toggle("active", button.dataset.viewTarget === viewId));
}
viewButtons.forEach((button) => button.addEventListener("click", () => showView(button.dataset.viewTarget ?? "work-view")));

renderTutorialStep();
render();
if (localStorage.getItem(TUTORIAL_KEY) !== "complete") ui.tutorialDialog.showModal();
window.requestAnimationFrame(frame);
