import { describe, expect, it } from "vitest";
import { chooseIdea, createInitialState, getCurrentObjective, getProjectStepCount, getRequiredWork, tap } from "./engine";
import { generateIdeaOptions } from "./ideas";

describe("project brainstorming", () => {
  it("generates exactly one safe, promising, and wild idea", () => {
    expect(generateIdeaOptions(0).map(({ profile }) => profile)).toEqual(["safe", "promising", "wild"]);
  });

  it("is deterministic for the same release and changes for the next release", () => {
    expect(generateIdeaOptions(2)).toEqual(generateIdeaOptions(2));
    expect(generateIdeaOptions(2).map(({ id }) => id)).not.toEqual(generateIdeaOptions(3).map(({ id }) => id));
  });

  it("offers visible tradeoffs instead of one dominant profile", () => {
    const [safe, promising, wild] = generateIdeaOptions(0);
    expect(safe.risk).toBeLessThan(promising.risk);
    expect(promising.risk).toBeLessThan(wild.risk);
    expect(safe.workMultiplier).toBeLessThan(wild.workMultiplier);
    expect(wild.potentialMax).toBeGreaterThan(safe.potentialMax);
    expect(wild.potentialMin).toBeLessThan(safe.potentialMin);
  });

  it("requires a valid choice before work can begin", () => {
    const state = createInitialState();
    tap(state);
    expect(state.work).toBe(0);
    expect(chooseIdea(state, "missing")).toBe(false);
    expect(chooseIdea(state, state.ideaOptions[1].id)).toBe(true);
    tap(state);
    expect(state.work).toBe(1);
    expect(chooseIdea(state, state.ideaOptions[0].id)).toBe(false);
  });

  it("makes riskier ideas require more work", () => {
    const safeState = createInitialState();
    const wildState = createInitialState();
    chooseIdea(safeState, safeState.ideaOptions[0].id);
    chooseIdea(wildState, wildState.ideaOptions[2].id);
    expect(getRequiredWork(safeState)).toBe(90);
    expect(getRequiredWork(wildState)).toBe(120);
  });

  it("adds more production steps to the second and third milestone projects", () => {
    const state = createInitialState();
    expect(getProjectStepCount(state)).toBe(1);
    state.gamesPublished = 1;
    expect(getProjectStepCount(state)).toBe(2);
    state.gamesPublished = 2;
    expect(getProjectStepCount(state)).toBe(3);
    state.gamesPublished = 20;
    expect(getProjectStepCount(state)).toBe(3);
  });

  it("advances visible objectives inside each phase", () => {
    const state = createInitialState();
    state.gamesPublished = 2;
    state.ideaOptions = generateIdeaOptions(2);
    chooseIdea(state, state.ideaOptions[1].id);
    expect(getCurrentObjective(state)).toEqual({ index: 0, count: 3 });
    state.work = 70;
    expect(getCurrentObjective(state)).toEqual({ index: 1, count: 3 });
    state.work = 140;
    expect(getCurrentObjective(state)).toEqual({ index: 2, count: 3 });
  });
});
