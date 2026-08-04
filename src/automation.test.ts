import { describe, expect, it } from "vitest";
import { MAX_OFFLINE_SECONDS, advanceOffline, applyProduction, createInitialState, queueProject } from "./engine";
import { chooseDefaultIdea } from "./test-helpers";

describe("automation and queues", () => {
  it("locks the queue behind the pipeline and caps it at three entries", () => {
    const state = createInitialState();
    expect(queueProject(state, "tiny-adventure")).toBe(false);
    state.upgradeLevels.pipeline = 1;
    expect(queueProject(state, "tiny-adventure")).toBe(true);
    expect(queueProject(state, "tiny-adventure")).toBe(true);
    expect(queueProject(state, "tiny-adventure")).toBe(true);
    expect(queueProject(state, "tiny-adventure")).toBe(false);
  });

  it("clears stale queues when a new company stage selects its project family", () => {
    const state = createInitialState();
    state.gamesPublished = 8;
    state.fans = 100;
    state.upgradeLevels.pipeline = 1;
    state.autoPublish = true;
    queueProject(state, "pocket-puzzler");
    queueProject(state, "cozy-farm");
    applyProduction(state, 140);
    expect(state.currentProjectId).toBe("cozy-farm");
    expect(state.projectQueue).toEqual([]);
  });

  it("preserves overflow through repeated automatic releases", () => {
    const state = createInitialState();
    state.upgradeLevels.pipeline = 1;
    state.autoPublish = true;
    expect(applyProduction(state, 250)).toBe(2);
    expect(state.work).toBe(32);
    expect(state.gamesPublished).toBe(2);
  });

  it("stops at a completed project when auto-publish is disabled", () => {
    const state = createInitialState();
    chooseDefaultIdea(state);
    expect(applyProduction(state, 250)).toBe(0);
    expect(state.work).toBe(100);
    expect(state.gamesPublished).toBe(0);
  });

  it("caps offline progress at the configured duration", () => {
    const capped = createInitialState();
    const excessive = createInitialState();
    for (const state of [capped, excessive]) {
      state.upgradeLevels.team = 1;
      state.upgradeLevels.pipeline = 1;
      state.autoPublish = true;
    }
    advanceOffline(capped, MAX_OFFLINE_SECONDS);
    advanceOffline(excessive, MAX_OFFLINE_SECONDS * 10);
    expect(excessive).toMatchObject({ work: capped.work, gamesPublished: capped.gamesPublished, money: capped.money, fans: capped.fans });
  });

  it("ignores negative production amounts", () => {
    const state = createInitialState();
    expect(applyProduction(state, -100)).toBe(0);
    expect(state.work).toBe(0);
  });
});
