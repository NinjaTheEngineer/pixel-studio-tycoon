import { describe, expect, it } from "vitest";
import { advanceRealtime, buyUpgrade, createInitialState, getBaseProduction, getPatronIncomePerSecond, getUpgradeCost, isUpgradeUnlocked } from "./engine";

describe("upgrades", () => {
  it("requires both its unlock milestone and enough money", () => {
    const state = createInitialState();
    state.money = 10_000;
    expect(isUpgradeUnlocked(state, "team")).toBe(false);
    expect(buyUpgrade(state, "team")).toBe(false);
    state.gamesPublished = 3;
    expect(isUpgradeUnlocked(state, "team")).toBe(true);
    state.money = 299;
    expect(buyUpgrade(state, "team")).toBe(false);
  });

  it("deducts the exact cost and increases future costs", () => {
    const state = createInitialState();
    state.money = 1_000;
    expect(getUpgradeCost(state, "research")).toBe(35);
    expect(buyUpgrade(state, "research")).toBe(true);
    expect(state.money).toBe(965);
    expect(getUpgradeCost(state, "research")).toBe(84);
  });

  it("cannot exceed an upgrade's maximum level", () => {
    const state = createInitialState();
    state.money = 100_000;
    expect(buyUpgrade(state, "research")).toBe(true);
    expect(buyUpgrade(state, "research")).toBe(true);
    expect(buyUpgrade(state, "research")).toBe(true);
    expect(buyUpgrade(state, "research")).toBe(false);
    expect(state.upgradeLevels.research).toBe(3);
  });

  it("scales passive team production by level", () => {
    const state = createInitialState();
    expect(getBaseProduction(state)).toBe(0);
    state.upgradeLevels.team = 1;
    expect(getBaseProduction(state)).toBe(1);
    state.upgradeLevels.team = 2;
    expect(getBaseProduction(state)).toBeCloseTo(2.64);
  });

  it("turns rare Patrons into recurring income", () => {
    const state = createInitialState();
    expect(getPatronIncomePerSecond(state)).toBe(0);
    state.fans = 1;
    expect(getPatronIncomePerSecond(state)).toBeCloseTo(0.05);
    advanceRealtime(state, 10);
    expect(state.money).toBeCloseTo(0.5);
  });

  it("increases each Patron's contribution through its income upgrade", () => {
    const state = createInitialState();
    state.fans = 10;
    state.upgradeLevels.patronSupport = 2;
    expect(getPatronIncomePerSecond(state)).toBeCloseTo(1);
  });

  it("enables automatic publishing when the pipeline is purchased", () => {
    const state = createInitialState();
    state.gamesPublished = 8;
    state.money = getUpgradeCost(state, "pipeline");
    expect(buyUpgrade(state, "pipeline")).toBe(true);
    expect(state.autoPublish).toBe(true);
  });
});
