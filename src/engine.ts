import { DEVELOPMENT_PHASES, PROJECT_BY_ID, PROJECT_TITLES, PROJECTS, UPGRADE_BY_ID, UPGRADES } from "./data";
import type { DevelopmentPhase, GameState, ProjectDefinition, ProjectId, UpgradeId } from "./types";

export const SAVE_KEY = "pixel-studio-tycoon-save-v2";
export const MAX_OFFLINE_SECONDS = 60 * 60 * 4;

export function createInitialState(now = Date.now()): GameState {
  return {
    version: 2,
    work: 0,
    money: 0,
    fans: 0,
    gamesPublished: 0,
    currentGameName: PROJECT_TITLES["tiny-adventure"][0],
    currentProjectId: "tiny-adventure",
    selectedProjectId: "tiny-adventure",
    projectQueue: [],
    upgradeLevels: { research: 0, prototype: 0, workstation: 0, playtesting: 0, storefront: 0, team: 0, pipeline: 0 },
    autoPublish: false,
    focus: 0,
    lastSavedAt: now,
  };
}

export function getCurrentProject(state: GameState): ProjectDefinition {
  return PROJECT_BY_ID[state.currentProjectId];
}

export function getClickPower(state: GameState): number {
  const phase = getCurrentPhase(state).phase;
  const upgrade = UPGRADES.find((item) => item.phaseId === phase.id);
  const level = upgrade ? state.upgradeLevels[upgrade.id] : 0;
  return 10 * (1 + level * (upgrade?.efficiencyPerLevel ?? 0));
}

export function getBaseProduction(state: GameState): number {
  const level = state.upgradeLevels.team;
  if (level === 0) return 0;
  return level * Math.pow(1.32, Math.max(0, level - 1));
}

export function getUpgradeCost(state: GameState, id: UpgradeId): number {
  const definition = UPGRADE_BY_ID[id];
  const level = state.upgradeLevels[id];
  return Math.round(definition.baseCost * Math.pow(definition.costGrowth, level));
}

export function isUpgradeUnlocked(state: GameState, id: UpgradeId): boolean {
  return state.gamesPublished >= UPGRADE_BY_ID[id].unlockGames;
}

export function getFanReward(state: GameState, project = getCurrentProject(state)): number {
  return project.fanReward;
}

export function getGeneratedGameName(projectId: ProjectId, releaseNumber: number): string {
  const titles = PROJECT_TITLES[projectId];
  const base = titles[releaseNumber % titles.length];
  const cycle = Math.floor(releaseNumber / titles.length);
  return cycle === 0 ? base : `${base} ${cycle + 1}`;
}

export function getCurrentPhase(state: GameState): { phase: DevelopmentPhase; index: number; progress: number } {
  const total = getCurrentProject(state).workRequired;
  const ratio = Math.min(1, state.work / total);
  let start = 0;
  for (let index = 0; index < DEVELOPMENT_PHASES.length; index += 1) {
    const phase = DEVELOPMENT_PHASES[index];
    const end = start + phase.share;
    if (ratio < end || index === DEVELOPMENT_PHASES.length - 1) {
      return { phase, index, progress: Math.min(1, Math.max(0, (ratio - start) / phase.share)) };
    }
    start = end;
  }
  return { phase: DEVELOPMENT_PHASES[DEVELOPMENT_PHASES.length - 1], index: DEVELOPMENT_PHASES.length - 1, progress: 1 };
}

export function isProjectUnlocked(state: GameState, id: ProjectId): boolean {
  const project = PROJECT_BY_ID[id];
  return state.gamesPublished >= project.unlockGames && state.fans >= project.unlockFans;
}

export function tap(state: GameState): void {
  const project = getCurrentProject(state);
  const directWork = getClickPower(state);
  state.work = Math.min(project.workRequired, state.work + directWork);
}

export function canPublish(state: GameState): boolean {
  return state.work >= getCurrentProject(state).workRequired;
}

export function publish(state: GameState): boolean {
  if (!canPublish(state)) return false;
  const project = getCurrentProject(state);
  state.money += project.moneyReward;
  state.fans += getFanReward(state, project);
  state.gamesPublished += 1;
  state.work = 0;
  startNextProject(state);
  state.currentGameName = getGeneratedGameName(state.currentProjectId, state.gamesPublished);
  return true;
}

export function startNextProject(state: GameState): void {
  const queued = state.projectQueue.shift();
  if (queued && isProjectUnlocked(state, queued)) {
    state.currentProjectId = queued;
    state.selectedProjectId = queued;
    return;
  }
  if (isProjectUnlocked(state, state.selectedProjectId)) {
    state.currentProjectId = state.selectedProjectId;
    return;
  }
  state.currentProjectId = "tiny-adventure";
  state.selectedProjectId = "tiny-adventure";
}

export function selectProject(state: GameState, id: ProjectId): boolean {
  if (!isProjectUnlocked(state, id) || state.work > 0) return false;
  state.currentProjectId = id;
  state.selectedProjectId = id;
  state.currentGameName = getGeneratedGameName(id, state.gamesPublished);
  return true;
}

export function queueProject(state: GameState, id: ProjectId): boolean {
  if (state.upgradeLevels.pipeline < 1 || !isProjectUnlocked(state, id)) return false;
  if (state.projectQueue.length >= 3) return false;
  state.projectQueue.push(id);
  return true;
}

export function buyUpgrade(state: GameState, id: UpgradeId): boolean {
  const definition = UPGRADE_BY_ID[id];
  const level = state.upgradeLevels[id];
  if (!isUpgradeUnlocked(state, id) || level >= definition.maxLevel) return false;
  const cost = getUpgradeCost(state, id);
  if (state.money < cost) return false;
  state.money -= cost;
  state.upgradeLevels[id] += 1;
  if (id === "pipeline") state.autoPublish = true;
  return true;
}

export function advanceRealtime(state: GameState, seconds: number): number {
  const production = getBaseProduction(state) * seconds;
  return applyProduction(state, production);
}

export function advanceOffline(state: GameState, seconds: number): number {
  return applyProduction(state, getBaseProduction(state) * Math.min(seconds, MAX_OFFLINE_SECONDS));
}

export function applyProduction(state: GameState, amount: number): number {
  let remaining = Math.max(0, amount);
  let published = 0;
  let safety = 0;
  while (remaining > 0 && safety < 10_000) {
    safety += 1;
    const project = getCurrentProject(state);
    const needed = project.workRequired - state.work;
    const applied = Math.min(needed, remaining);
    state.work += applied;
    remaining -= applied;
    if (!canPublish(state)) break;
    if (!state.autoPublish || state.upgradeLevels.pipeline < 1) break;
    if (publish(state)) published += 1;
  }
  return published;
}

export function unlockedProjects(state: GameState): ProjectDefinition[] {
  return PROJECTS.filter((project) => isProjectUnlocked(state, project.id));
}

export function formatNumber(value: number): string {
  if (value < 1_000) return Math.floor(value).toLocaleString();
  const suffixes = ["K", "M", "B", "T"];
  let scaled = value;
  let index = -1;
  while (scaled >= 1_000 && index < suffixes.length - 1) {
    scaled /= 1_000;
    index += 1;
  }
  return `${scaled.toFixed(scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2)}${suffixes[index]}`;
}
