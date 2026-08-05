import { describe, expect, it } from "vitest";
import { createInitialState } from "./engine";
import { getUpgradeStructureKey, isTeammateChoicePending } from "./ui-model";

describe("UI regression contracts", () => {
  it("keeps upgrade cards stable while Patron income changes money every frame", () => {
    const state = createInitialState();
    const initialKey = getUpgradeStructureKey(state);
    state.money = 131.75;
    expect(getUpgradeStructureKey(state)).toBe(initialKey);
    state.upgradeLevels.research = 1;
    expect(getUpgradeStructureKey(state)).not.toBe(initialKey);
  });

  it("gives the first-teammate milestone priority over brainstorming", () => {
    const state = createInitialState();
    state.gamesPublished = 3;
    expect(isTeammateChoicePending(state)).toBe(true);
    state.teammateRole = "programmer";
    expect(isTeammateChoicePending(state)).toBe(false);
  });
});
