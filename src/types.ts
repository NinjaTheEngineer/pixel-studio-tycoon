export type ProjectId = "tiny-adventure" | "pocket-puzzler" | "cozy-farm";
export type UpgradeId = "research" | "prototype" | "workstation" | "playtesting" | "storefront" | "team" | "pipeline";

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  action: string;
  share: number;
}

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
  unlockGames: number;
  phaseId?: string;
  efficiencyPerLevel?: number;
}

export interface GameState {
  version: 2;
  work: number;
  money: number;
  fans: number;
  gamesPublished: number;
  currentGameName: string;
  currentProjectId: ProjectId;
  selectedProjectId: ProjectId;
  projectQueue: ProjectId[];
  upgradeLevels: Record<UpgradeId, number>;
  autoPublish: boolean;
  focus: number;
  lastSavedAt: number;
}
