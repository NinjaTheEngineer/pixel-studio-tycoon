import type { GameState } from "./types";

export function getUpgradeStructureKey(state: GameState): string {
  return `${state.gamesPublished}|${Object.values(state.upgradeLevels).join("|")}`;
}

export function isTeammateChoicePending(state: GameState): boolean {
  return state.gamesPublished >= 3 && !state.teammateRole;
}
