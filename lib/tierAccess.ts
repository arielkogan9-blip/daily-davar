export type Tier = "free" | "plus" | "scholar";

export type TierFeatures = {
  allDifficulties: boolean;
  savedStreak:     boolean;
  history:         boolean;
  stats:           boolean;
  explanations:    boolean;
  parashaContext:  boolean;
  archive:         boolean;
};

export const TIER_FEATURES: Record<Tier, TierFeatures> = {
  free: {
    allDifficulties: true,
    savedStreak:     false,
    history:         false,
    stats:           false,
    explanations:    false,
    parashaContext:  false,
    archive:         false,
  },
  plus: {
    allDifficulties: true,
    savedStreak:     true,
    history:         true,
    stats:           true,
    explanations:    true,
    parashaContext:  false,
    archive:         false,
  },
  scholar: {
    allDifficulties: true,
    savedStreak:     true,
    history:         true,
    stats:           true,
    explanations:    true,
    parashaContext:  true,
    archive:         true,
  },
};

/** Returns true if the given tier has the requested feature. */
export function hasFeature(tier: string, feature: keyof TierFeatures): boolean {
  const t = (tier ?? "free") as Tier;
  return TIER_FEATURES[t]?.[feature] ?? false;
}
