import { describe, expect, it } from "vitest";
import { DEVELOPMENT_PHASES, PROJECTS, PROJECT_TITLES, UPGRADES } from "./data";

describe("content integrity", () => {
  it("defines unique phase, project, and upgrade IDs", () => {
    for (const definitions of [DEVELOPMENT_PHASES, PROJECTS, UPGRADES]) {
      const ids = definitions.map(({ id }) => id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("defines phase shares that total exactly one", () => {
    expect(DEVELOPMENT_PHASES.reduce((total, phase) => total + phase.share, 0)).toBeCloseTo(1, 10);
    expect(DEVELOPMENT_PHASES.every((phase) => phase.share > 0)).toBe(true);
  });

  it("keeps all economic values positive and unlocks non-negative", () => {
    for (const project of PROJECTS) {
      expect(project.workRequired).toBeGreaterThan(0);
      expect(project.moneyReward).toBeGreaterThan(0);
      expect(project.fanReward).toBeGreaterThanOrEqual(0);
      expect(project.unlockGames).toBeGreaterThanOrEqual(0);
      expect(project.unlockFans).toBeGreaterThanOrEqual(0);
    }
    for (const upgrade of UPGRADES) {
      expect(upgrade.baseCost).toBeGreaterThan(0);
      expect(upgrade.costGrowth).toBeGreaterThanOrEqual(1);
      expect(upgrade.maxLevel).toBeGreaterThan(0);
      expect(upgrade.unlockGames).toBeGreaterThanOrEqual(0);
    }
  });

  it("references valid phases and provides release names for every project", () => {
    const phaseIds = new Set(DEVELOPMENT_PHASES.map(({ id }) => id));
    for (const upgrade of UPGRADES) {
      if (upgrade.phaseId) expect(phaseIds.has(upgrade.phaseId)).toBe(true);
    }
    for (const project of PROJECTS) expect(PROJECT_TITLES[project.id].length).toBeGreaterThanOrEqual(3);
  });
});
