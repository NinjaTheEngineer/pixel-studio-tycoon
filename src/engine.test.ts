import { describe, expect, it } from "vitest";
import {
  advanceOffline,
  buyUpgrade,
  canPublish,
  createInitialState,
  getClickPower,
  getCurrentPhase,
  getGeneratedGameName,
  getUpgradeCost,
  queueProject,
  tap,
} from "./engine";

describe("game economy", () => {
  it("completes the first project through tapping", () => {
    const state = createInitialState();
    for (let index = 0; index < 120; index += 1) tap(state);
    expect(canPublish(state)).toBe(true);
    expect(state.focus).toBe(100);
  });

  it("allows automation to publish repeatedly without tapping", () => {
    const state = createInitialState();
    state.gamesPublished = 8;
    state.money = getUpgradeCost(state, "team") + getUpgradeCost(state, "pipeline");
    expect(buyUpgrade(state, "team")).toBe(true);
    expect(buyUpgrade(state, "pipeline")).toBe(true);
    const published = advanceOffline(state, 600);
    expect(published).toBe(5);
    expect(state.gamesPublished).toBe(8 + published);
  });

  it("keeps queued projects behind the automation upgrade", () => {
    const state = createInitialState();
    expect(queueProject(state, "tiny-adventure")).toBe(false);
    state.gamesPublished = 8;
    state.money = getUpgradeCost(state, "pipeline");
    buyUpgrade(state, "pipeline");
    expect(queueProject(state, "tiny-adventure")).toBe(true);
  });

  it("buys an affordable upgrade and applies its effect", () => {
    const state = createInitialState();
    state.money = 35;

    expect(buyUpgrade(state, "tools")).toBe(true);
    expect(state.money).toBe(0);
    expect(state.upgradeLevels.tools).toBe(1);
    expect(getClickPower(state)).toBe(2);
  });

  it("keeps the team locked until three games are published", () => {
    const state = createInitialState();
    state.money = 1_000;
    expect(buyUpgrade(state, "team")).toBe(false);
    state.gamesPublished = 3;
    expect(buyUpgrade(state, "team")).toBe(true);
  });

  it("moves through named development phases", () => {
    const state = createInitialState();
    expect(getCurrentPhase(state).phase.name).toBe("Concept");
    state.work = 60;
    expect(getCurrentPhase(state).phase.name).toBe("Production");
    state.work = 118;
    expect(getCurrentPhase(state).phase.name).toBe("Launch prep");
  });

  it("generates distinct release names for repeated project types", () => {
    expect(getGeneratedGameName("tiny-adventure", 0)).not.toBe(getGeneratedGameName("tiny-adventure", 1));
  });
});
