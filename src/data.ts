import type { DevelopmentPhase, ProjectDefinition, ProjectId, UpgradeDefinition, UpgradeId } from "./types";

export const DEVELOPMENT_PHASES: DevelopmentPhase[] = [
  { id: "concept", name: "Concept", description: "You are researching references, defining the audience, and writing the core game idea.", action: "Researching the game concept", icon: "âœ¦", share: 0.15 },
  { id: "preproduction", name: "Pre-production", description: "You are testing the core loop, cutting risky ideas, and planning a realistic solo scope.", action: "Building and reviewing prototypes", icon: "â—‡", share: 0.2 },
  { id: "production", name: "Production", description: "You are programming systems, creating content, and assembling the playable game.", action: "Developing the playable build", icon: "âŒ˜", share: 0.35 },
  { id: "polish", name: "Polish & QA", description: "You are finding bugs, tuning balance, and improving usability and feedback.", action: "Testing, fixing, and polishing", icon: "âœ“", share: 0.2 },
  { id: "launch", name: "Launch prep", description: "You are preparing screenshots, the store page, the final build, and release notes.", action: "Preparing the game for release", icon: "â†‘", share: 0.1 },
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
    workRequired: 1000,
    moneyReward: 100,
    fanReward: 4,
    unlockGames: 0,
    unlockFans: 0,
  },
  {
    id: "pocket-puzzler",
    name: "Pocket Puzzler",
    description: "A sharper project that rewards a growing studio.",
    workRequired: 3500,
    moneyReward: 550,
    fanReward: 15,
    unlockGames: 3,
    unlockFans: 12,
  },
  {
    id: "cozy-farm",
    name: "Cozy Farm",
    description: "A larger production for an established indie audience.",
    workRequired: 12000,
    moneyReward: 2200,
    fanReward: 48,
    unlockGames: 8,
    unlockFans: 90,
  },
];

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: "research",
    name: "Design Reference Library",
    path: "Concept",
    description: "Books, talks, and reference games make concept decisions faster.",
    maxLevel: 3,
    baseCost: 35,
    costGrowth: 2.4,
    unlockGames: 0,
    phaseId: "concept",
    efficiencyPerLevel: 0.5,
  },
  {
    id: "prototype",
    name: "Prototype Toolkit",
    path: "Pre-production",
    description: "Reusable input, camera, and UI experiments accelerate prototypes.",
    maxLevel: 3,
    baseCost: 60,
    costGrowth: 2.35,
    unlockGames: 1,
    phaseId: "preproduction",
    efficiencyPerLevel: 0.5,
  },
  {
    id: "workstation",
    name: "Home Workstation",
    path: "Production",
    description: "More memory, a second monitor, and faster builds improve daily production.",
    maxLevel: 4,
    baseCost: 90,
    costGrowth: 2.5,
    unlockGames: 1,
    phaseId: "production",
    efficiencyPerLevel: 0.5,
  },
  {
    id: "playtesting",
    name: "Playtest Circle",
    path: "Polish & QA",
    description: "Trusted players expose bugs and confusing design before release.",
    maxLevel: 3,
    baseCost: 140,
    costGrowth: 2.4,
    unlockGames: 2,
    phaseId: "polish",
    efficiencyPerLevel: 0.5,
  },
  {
    id: "storefront",
    name: "Store Page Kit",
    path: "Launch",
    description: "Reusable screenshots, copy, and press materials shorten launch preparation.",
    maxLevel: 3,
    baseCost: 180,
    costGrowth: 2.4,
    unlockGames: 2,
    phaseId: "launch",
    efficiencyPerLevel: 0.5,
  },
  {
    id: "team",
    name: "Development Team",
    path: "Idle",
    description: "Add permanent passive production that works while you are away.",
    maxLevel: 8,
    baseCost: 300,
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
