import type { DevelopmentPhase, ProjectDefinition, ProjectId, UpgradeDefinition, UpgradeId } from "./types";

export const DEVELOPMENT_PHASES: DevelopmentPhase[] = [
  { id: "concept", name: "Concept", description: "Choose the idea, audience, and core promise.", share: 0.12 },
  { id: "preproduction", name: "Pre-production", description: "Prototype the loop and plan the scope.", share: 0.18 },
  { id: "production", name: "Production", description: "Build the systems, content, and interface.", share: 0.42 },
  { id: "polish", name: "Polish", description: "Fix bugs, tune balance, and improve feedback.", share: 0.2 },
  { id: "launch", name: "Launch prep", description: "Prepare the build, store page, and release.", share: 0.08 },
];

export const PROJECT_TITLES: Record<ProjectId, string[]> = {
  "tiny-adventure": ["Lantern Vale", "Mossbound", "Clockwork Trail", "Moonlit Courier", "The Last Campfirefly", "Pebble Knight"],
  "pocket-puzzler": ["Glyph Grid", "Loop & Latch", "Parcel Paradox", "Tiny Tangle", "Neon Nudge", "Puzzle Post"],
  "cozy-farm": ["Cloverstead", "Dewdrop Acres", "Sunday Soil", "Little Harvest", "Honeyhill Farm", "Mushroom Meadow"],
};

export const PROJECTS: ProjectDefinition[] = [
  {
    id: "tiny-adventure",
    name: "Tiny Adventure",
    description: "A compact first release built from a bedroom desk.",
    workRequired: 120,
    moneyReward: 35,
    fanReward: 4,
    unlockGames: 0,
    unlockFans: 0,
  },
  {
    id: "pocket-puzzler",
    name: "Pocket Puzzler",
    description: "A sharper project that rewards a growing studio.",
    workRequired: 360,
    moneyReward: 135,
    fanReward: 15,
    unlockGames: 3,
    unlockFans: 12,
  },
  {
    id: "cozy-farm",
    name: "Cozy Farm",
    description: "A larger production for an established indie audience.",
    workRequired: 1100,
    moneyReward: 520,
    fanReward: 48,
    unlockGames: 8,
    unlockFans: 90,
  },
];

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: "tools",
    name: "Workspace Tools",
    path: "Active",
    description: "Increase direct work per tap and make active sessions count.",
    maxLevel: 6,
    baseCost: 35,
    costGrowth: 2.25,
    unlockGames: 0,
  },
  {
    id: "marketing",
    name: "Devlog Routine",
    path: "Audience",
    description: "Document development and earn more fans from every release.",
    maxLevel: 5,
    baseCost: 55,
    costGrowth: 2.1,
    unlockGames: 1,
  },
  {
    id: "team",
    name: "Development Team",
    path: "Idle",
    description: "Add permanent passive production that works while you are away.",
    maxLevel: 8,
    baseCost: 50,
    costGrowth: 2.15,
    unlockGames: 3,
  },
  {
    id: "pipeline",
    name: "Release Pipeline",
    path: "Automation",
    description: "Unlock automatic publishing, repeat production, and a project queue.",
    maxLevel: 1,
    baseCost: 900,
    costGrowth: 1,
    unlockGames: 8,
  },
];

export const PROJECT_BY_ID = Object.fromEntries(
  PROJECTS.map((project) => [project.id, project]),
) as Record<ProjectId, ProjectDefinition>;

export const UPGRADE_BY_ID = Object.fromEntries(
  UPGRADES.map((upgrade) => [upgrade.id, upgrade]),
) as Record<UpgradeId, UpgradeDefinition>;
