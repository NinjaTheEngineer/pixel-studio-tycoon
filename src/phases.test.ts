import { describe, expect, it } from "vitest";
import { buyUpgrade, createInitialState, getClickPower, getCurrentPhase, tap } from "./engine";
import { chooseDefaultIdea } from "./test-helpers";

describe("development phases", () => {
  it.each([
    [0, "Concept", 0],
    [149, "Concept", 0],
    [150, "Pre-production", 1],
    [349, "Pre-production", 1],
    [350, "Production", 2],
    [699, "Production", 2],
    [700, "Polish & QA", 3],
    [899, "Polish & QA", 3],
    [900, "Launch prep", 4],
    [1000, "Launch prep", 4],
  ])("maps %i work to %s", (work, name, index) => {
    const state = createInitialState();
    state.work = work;
    expect(getCurrentPhase(state)).toMatchObject({ index, phase: { name } });
  });

  it("reports normalized progress inside the active phase", () => {
    const state = createInitialState();
    state.work = 75;
    expect(getCurrentPhase(state).progress).toBeCloseTo(0.5);
    state.work = 250;
    expect(getCurrentPhase(state).progress).toBeCloseTo(0.5);
  });

  it("applies a phase upgrade only during its matching phase", () => {
    const state = createInitialState();
    state.money = 35;
    expect(buyUpgrade(state, "research")).toBe(true);
    expect(getClickPower(state)).toBe(15);
    state.work = 150;
    expect(getClickPower(state)).toBe(10);
  });

  it("never lets manual work overflow beyond the project requirement", () => {
    const state = createInitialState();
    chooseDefaultIdea(state);
    state.work = 995;
    tap(state);
    expect(state.work).toBe(1000);
  });

  it("pays each completed development milestone exactly once", () => {
    const state = createInitialState();
    chooseDefaultIdea(state);
    for (let index = 0; index < 15; index += 1) tap(state);
    expect(state.money).toBe(5);
    tap(state);
    expect(state.money).toBe(5);
    for (let index = 16; index < 35; index += 1) tap(state);
    expect(state.money).toBe(15);
    expect(state.milestonePaymentsClaimed).toEqual([0, 1]);
  });
});
