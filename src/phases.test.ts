import { describe, expect, it } from "vitest";
import { buyUpgrade, createInitialState, getClickPower, getCurrentPhase, tap } from "./engine";
import { chooseDefaultIdea } from "./test-helpers";

describe("development phases", () => {
  it.each([
    [0, "Concept", 0],
    [14, "Concept", 0],
    [15, "Pre-production", 1],
    [34, "Pre-production", 1],
    [35, "Production", 2],
    [69, "Production", 2],
    [70, "Polish & QA", 3],
    [89, "Polish & QA", 3],
    [90, "Launch prep", 4],
    [100, "Launch prep", 4],
  ])("maps %i work to %s", (work, name, index) => {
    const state = createInitialState();
    state.work = work;
    expect(getCurrentPhase(state)).toMatchObject({ index, phase: { name } });
  });

  it("reports normalized progress inside the active phase", () => {
    const state = createInitialState();
    state.work = 7.5;
    expect(getCurrentPhase(state).progress).toBeCloseTo(0.5);
    state.work = 25;
    expect(getCurrentPhase(state).progress).toBeCloseTo(0.5);
  });

  it("applies a phase upgrade only during its matching phase", () => {
    const state = createInitialState();
    state.money = 35;
    expect(buyUpgrade(state, "research")).toBe(true);
    expect(getClickPower(state)).toBe(1.5);
    state.work = 15;
    expect(getClickPower(state)).toBe(1);
  });

  it("never lets manual work overflow beyond the project requirement", () => {
    const state = createInitialState();
    chooseDefaultIdea(state);
    state.work = 99.5;
    tap(state);
    expect(state.work).toBe(100);
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
