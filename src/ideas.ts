import type { IdeaProfile, ProjectIdea } from "./types";

const CONCEPTS = [
  ["Lantern Vale", "A gentle adventure about restoring light to an abandoned valley."],
  ["Parcel Paradox", "A delivery puzzle where every shortcut changes the timeline."],
  ["Mushroom Meadow", "A cozy management game about rebuilding a tiny woodland farm."],
  ["Night Shift Necromancer", "A workplace comedy about raising skeletons after office hours."],
  ["Orbital Accountant", "A strategy game about balancing budgets on a collapsing space station."],
  ["Dungeon Food Truck", "A cooking adventure serving increasingly dangerous heroes."],
] as const;

const PROFILE_RULES: Record<IdeaProfile, Pick<ProjectIdea, "potentialMin" | "potentialMax" | "risk" | "workMultiplier">> = {
  safe: { potentialMin: 50, potentialMax: 70, risk: 15, workMultiplier: 0.9 },
  promising: { potentialMin: 60, potentialMax: 90, risk: 35, workMultiplier: 1 },
  wild: { potentialMin: 35, potentialMax: 110, risk: 65, workMultiplier: 1.2 },
};

export function generateIdeaOptions(releaseNumber: number): ProjectIdea[] {
  const profiles: IdeaProfile[] = ["safe", "promising", "wild"];
  return profiles.map((profile, index) => {
    const concept = CONCEPTS[(releaseNumber * 3 + index) % CONCEPTS.length];
    return {
      id: `${releaseNumber}-${profile}`,
      profile,
      title: concept[0],
      pitch: concept[1],
      ...PROFILE_RULES[profile],
    };
  });
}
