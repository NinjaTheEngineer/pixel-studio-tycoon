import { describe, expect, it } from "vitest";
import {
  advanceOffline,
  buyUpgrade,
  canPublish,
  createInitialState,
  getUpgradeCost,
  queueProject,
  tap,
} from "./engine";

describe("game economy", () => {
  it("completes the first project through tapping", () => {
    const state = createInitialState();
    for (let index = 0; index < 25; index += 1) tap(state);
    expect(canPublish(state)).toBe(true);
    expect(state.focus).toBe(100);
  });

  it("allows automation to publish repeatedly without tapping", () => {
    const state = createInitialState();
    state.money = getUpgradeCost(state, "team") + getUpgradeCost(state, "pipeline");
    expect(buyUpgrade(state, "team")).toBe(true);
    expect(buyUpgrade(state, "pipeline")).toBe(true);
    const published = advanceOffline(state, 100);
    expect(published).toBeGreaterThanOrEqual(4);
    expect(state.gamesPublished).toBe(published);
  });

  it("keeps queued projects behind the automation upgrade", () => {
    const state = createInitialState();
    expect(queueProject(state, "tiny-adventure")).toBe(false);
    state.money = getUpgradeCost(state, "pipeline");
    buyUpgrade(state, "pipeline");
    expect(queueProject(state, "tiny-adventure")).toBe(true);
  });
});
