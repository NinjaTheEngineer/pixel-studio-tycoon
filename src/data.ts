import type { ProjectDefinition, ProjectId, UpgradeDefinition, UpgradeId } from "./types";

export const PROJECTS: ProjectDefinition[] = [
  {
    id: "tiny-adventure",
    name: "Tiny Adventure",
    description: "A compact first release built from a bedroom desk.",
    workRequired: 25,
    moneyReward: 20,
    fanReward: 5,
    unlockGames: 0,
    unlockFans: 0,
  },
  {
    id: "pocket-puzzler",
    name: "Pocket Puzzler",
    description: "A sharper project that rewards a growing studio.",
    workRequired: 90,
    moneyReward: 85,
    fanReward: 18,
    unlockGames: 2,
    unlockFans: 10,
  },
  {
    id: "cozy-farm",
    name: "Cozy Farm",
    description: "A larger production for an established indie audience.",
    workRequired: 280,
    moneyReward: 290,
    fanReward: 55,
    unlockGames: 5,
    unlockFans: 55,
  },
];

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: "tools",
    name: "Developer Tools",
    path: "Active",
    description: "Increase direct work per tap and make active sessions count.",
    maxLevel: 5,
    baseCost: 20,
    costGrowth: 2.4,
  },
  {
    id: "team",
    name: "Development Team",
    path: "Idle",
    description: "Add permanent passive production that works while you are away.",
    maxLevel: 8,
    baseCost: 50,
    costGrowth: 2.15,
  },
  {
    id: "pipeline",
    name: "Release Pipeline",
    path: "Automation",
    description: "Unlock automatic publishing, repeat production, and a project queue.",
    maxLevel: 1,
    baseCost: 120,
    costGrowth: 1,
  },
];

export const PROJECT_BY_ID = Object.fromEntries(
  PROJECTS.map((project) => [project.id, project]),
) as Record<ProjectId, ProjectDefinition>;

export const UPGRADE_BY_ID = Object.fromEntries(
  UPGRADES.map((upgrade) => [upgrade.id, upgrade]),
) as Record<UpgradeId, UpgradeDefinition>;

