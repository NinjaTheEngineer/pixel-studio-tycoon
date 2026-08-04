import { describe, expect, it } from "vitest";
import { buyUpgrade, createInitialState, formatNumber, isProjectUnlocked, isUpgradeUnlocked } from "./engine";
import { completeAndPublish, workUntilReady } from "./test-helpers";

describe("early-game progression", () => {
  it("completes the first release in exactly 100 unupgraded work actions", () => {
    expect(workUntilReady(createInitialState())).toBe(100);
  });

  it("earns the first upgrade through normal play", () => {
    const state = createInitialState();
    completeAndPublish(state);
    expect(state.money).toBe(100);
    expect(buyUpgrade(state, "research")).toBe(true);
    expect(state.money).toBe(65);
  });

  it("reaches team and second-project unlocks through three real releases", () => {
    const state = createInitialState();
    const actions = [completeAndPublish(state), completeAndPublish(state), completeAndPublish(state)];
    expect(actions).toEqual([100, 100, 100]);
    expect(state).toMatchObject({ gamesPublished: 3, money: 300, fans: 12 });
    expect(isUpgradeUnlocked(state, "team")).toBe(true);
    expect(isProjectUnlocked(state, "pocket-puzzler")).toBe(true);
    expect(buyUpgrade(state, "team")).toBe(true);
    expect(state.money).toBe(0);
  });

  it("formats economy values consistently", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1000)).toBe("1.00K");
    expect(formatNumber(12_500)).toBe("12.5K");
    expect(formatNumber(2_000_000)).toBe("2.00M");
  });
});
