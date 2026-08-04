export type ProjectId = "tiny-adventure" | "pocket-puzzler" | "cozy-farm";
export type UpgradeId = "tools" | "team" | "pipeline";

export interface ProjectDefinition {
  id: ProjectId;
  name: string;
  description: string;
  workRequired: number;
  moneyReward: number;
  fanReward: number;
  unlockGames: number;
  unlockFans: number;
}

export interface UpgradeDefinition {
  id: UpgradeId;
  name: string;
  path: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
}

export interface GameState {
  version: 2;
  work: number;
  money: number;
  fans: number;
  gamesPublished: number;
  currentProjectId: ProjectId;
  selectedProjectId: ProjectId;
  projectQueue: ProjectId[];
  upgradeLevels: Record<UpgradeId, number>;
  autoPublish: boolean;
  focus: number;
  lastSavedAt: number;
}

