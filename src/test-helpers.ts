import { canPublish, publish, tap } from "./engine";
import type { GameState } from "./types";

export function workUntilReady(state: GameState, maximumActions = 100_000): number {
  let actions = 0;
  while (!canPublish(state) && actions < maximumActions) {
    tap(state);
    actions += 1;
  }
  if (!canPublish(state)) throw new Error(`Project did not complete within ${maximumActions} actions`);
  return actions;
}

export function completeAndPublish(state: GameState): number {
  const actions = workUntilReady(state);
  if (!publish(state)) throw new Error("Ready project failed to publish");
  return actions;
}
