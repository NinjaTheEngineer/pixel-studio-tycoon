import { describe, expect, it } from "vitest";
import { chooseIdea, chooseTeammate, createInitialState, getBaseProduction } from "./engine";
import { completeAndPublish } from "./test-helpers";

function reachSmallIndieStudio() {
  const state = createInitialState();
  completeAndPublish(state);
  completeAndPublish(state);
  completeAndPublish(state);
  return state;
}

describe("small indie teammate milestone", () => {
  it("unlocks a free teammate choice after the third release", () => {
    const state = reachSmallIndieStudio();
    expect(state.gamesPublished).toBe(3);
    expect(chooseTeammate(state, "programmer")).toBe(true);
    expect(state.teammateRole).toBe("programmer");
    expect(state.money).toBe(300);
  });

  it("does not allow an early hire or replacing the chosen role", () => {
    const state = createInitialState();
    expect(chooseTeammate(state, "artist")).toBe(false);
    const smallIndie = reachSmallIndieStudio();
    expect(chooseTeammate(smallIndie, "artist")).toBe(true);
    expect(chooseTeammate(smallIndie, "designer")).toBe(false);
  });

  it("gives each teammate passive work only in their specialty phases", () => {
    const state = reachSmallIndieStudio();
    chooseTeammate(state, "designer");
    const idea = state.ideaOptions.find((option) => option.profile === "promising");
    expect(idea && chooseIdea(state, idea.id)).toBe(true);
    expect(getBaseProduction(state)).toBeCloseTo(0.35);
    state.work = 200;
    expect(getBaseProduction(state)).toBe(0);
  });

  it("scales teammate output through Shared Studio Desks", () => {
    const state = reachSmallIndieStudio();
    chooseTeammate(state, "programmer");
    const idea = state.ideaOptions.find((option) => option.profile === "promising");
    expect(idea && chooseIdea(state, idea.id)).toBe(true);
    state.work = 200;
    expect(getBaseProduction(state)).toBeCloseTo(0.35);
    state.upgradeLevels.team = 1;
    expect(getBaseProduction(state)).toBeCloseTo(0.6125);
  });
});
