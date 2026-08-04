import { canPublish, chooseIdea, publish, tap } from "./engine";
import type { GameState } from "./types";

export function workUntilReady(state: GameState, maximumActions = 100_000): number {
  chooseDefaultIdea(state);
  let actions = 0;
  while (!canPublish(state) && actions < maximumActions) {
    tap(state);
    actions += 1;
  }
  if (!canPublish(state)) throw new Error(`Project did not complete within ${maximumActions} actions`);
  return actions;
}

export function chooseDefaultIdea(state: GameState): void {
  if (state.currentIdea) return;
  const idea = state.ideaOptions.find((option) => option.profile === "promising") ?? state.ideaOptions[0];
  if (!idea || !chooseIdea(state, idea.id)) throw new Error("Could not choose a default project idea");
}

export function completeAndPublish(state: GameState): number {
  const actions = workUntilReady(state);
  if (!publish(state)) throw new Error("Ready project failed to publish");
  return actions;
}
