import { Difficulty } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserStats = {
  totalPlayed: number;
  totalWon: number;
  currentStreak: number;
  bestStreak: number;
  byDifficulty: Record<Difficulty, { played: number; won: number }>;
};

const EMPTY_STATS: UserStats = {
  totalPlayed: 0,
  totalWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  byDifficulty: {
    easy:   { played: 0, won: 0 },
    medium: { played: 0, won: 0 },
    hard:   { played: 0, won: 0 },
  },
};

// ─── Persistence ─────────────────────────────────────────────────────────────

export function loadStats(): UserStats {
  if (typeof window === "undefined") return EMPTY_STATS;
  try {
    const raw = localStorage.getItem("dd_stats");
    if (!raw) return EMPTY_STATS;
    const parsed = JSON.parse(raw) as Partial<UserStats>;
    return {
      ...EMPTY_STATS,
      ...parsed,
      byDifficulty: {
        ...EMPTY_STATS.byDifficulty,
        ...(parsed.byDifficulty ?? {}),
      },
    };
  } catch {
    return EMPTY_STATS;
  }
}

export function saveStats(stats: UserStats): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("dd_stats", JSON.stringify(stats));
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Records the result of one completed game and returns the updated stats object.
 * Pass the already-computed newStreak value from page-level streak logic.
 */
export function recordGame(
  stats: UserStats,
  difficulty: Difficulty,
  won: boolean,
  newStreak: number,
): UserStats {
  const prev = stats.byDifficulty[difficulty];
  const updated: UserStats = {
    totalPlayed:   stats.totalPlayed + 1,
    totalWon:      stats.totalWon + (won ? 1 : 0),
    currentStreak: newStreak,
    bestStreak:    Math.max(stats.bestStreak, newStreak),
    byDifficulty: {
      ...stats.byDifficulty,
      [difficulty]: {
        played: prev.played + 1,
        won:    prev.won + (won ? 1 : 0),
      },
    },
  };
  saveStats(updated);
  return updated;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the win rate as an integer percentage (0–100). */
export function winRatePct(played: number, won: number): number {
  return played === 0 ? 0 : Math.round((won / played) * 100);
}
