import { describe, expect, it } from "vitest";
import { canPublish, createInitialState, getGeneratedGameName, isProjectUnlocked, publish, selectProject } from "./engine";

describe("projects and releases", () => {
  it("refuses an unfinished release without changing rewards", () => {
    const state = createInitialState();
    expect(canPublish(state)).toBe(false);
    expect(publish(state)).toBe(false);
    expect(state).toMatchObject({ money: 0, fans: 0, gamesPublished: 0, work: 0 });
  });

  it("awards the configured release rewards and resets work", () => {
    const state = createInitialState();
    state.work = 1000;
    expect(publish(state)).toBe(true);
    expect(state).toMatchObject({ money: 100, fans: 4, gamesPublished: 1, work: 0 });
  });

  it("generates distinct names and stable numbered cycles", () => {
    expect(getGeneratedGameName("tiny-adventure", 0)).toBe("Lantern Vale");
    expect(getGeneratedGameName("tiny-adventure", 1)).not.toBe("Lantern Vale");
    expect(getGeneratedGameName("tiny-adventure", 6)).toBe("Lantern Vale 2");
  });

  it("requires both games and fans for project unlocks", () => {
    const state = createInitialState();
    state.gamesPublished = 3;
    state.fans = 11;
    expect(isProjectUnlocked(state, "pocket-puzzler")).toBe(false);
    state.fans = 12;
    expect(isProjectUnlocked(state, "pocket-puzzler")).toBe(true);
  });

  it("selects only unlocked projects while no work is in progress", () => {
    const state = createInitialState();
    expect(selectProject(state, "pocket-puzzler")).toBe(false);
    state.gamesPublished = 3;
    state.fans = 12;
    state.work = 10;
    expect(selectProject(state, "pocket-puzzler")).toBe(false);
    state.work = 0;
    expect(selectProject(state, "pocket-puzzler")).toBe(true);
    expect(state.currentProjectId).toBe("pocket-puzzler");
  });
});
