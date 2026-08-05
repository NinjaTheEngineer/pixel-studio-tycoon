export type ProjectId = "tiny-adventure" | "pocket-puzzler" | "cozy-farm";
export type UpgradeId = "research" | "prototype" | "workstation" | "playtesting" | "storefront" | "patronSupport" | "team" | "pipeline";
export type IdeaProfile = "safe" | "promising" | "wild";
export type TeammateRole = "designer" | "programmer" | "artist";

export interface ProjectIdea {
  id: string;
  profile: IdeaProfile;
  title: string;
  pitch: string;
  potentialMin: number;
  potentialMax: number;
  risk: number;
  workMultiplier: number;
}

export interface DevelopmentPhase {
  id: string;
  name: string;
  description: string;
  action: string;
  icon: string;
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
  version: 3;
  work: number;
  money: number;
  fans: number;
  gamesPublished: number;
  currentIdea: ProjectIdea | null;
  ideaOptions: ProjectIdea[];
  milestonePaymentsClaimed: number[];
  currentGameName: string;
  currentProjectId: ProjectId;
  selectedProjectId: ProjectId;
  projectQueue: ProjectId[];
  upgradeLevels: Record<UpgradeId, number>;
  autoPublish: boolean;
  teammateRole: TeammateRole | null;
  teammateIntroSeen: boolean;
  focus: number;
  lastSavedAt: number;
}
