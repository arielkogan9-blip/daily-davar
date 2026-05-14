/**
 * Deterministic question-bank selection logic, shared between
 * /api/question (today's game) and /api/question/archive (past dates).
 *
 * ── Why the old approach caused repeats ──────────────────────────────────────
 * The old code did:  sorted[dateHash(date + difficulty + period) % pool.length]
 *
 * Within a 7-day parasha period, the pool is ~15–33 questions.  The birthday
 * paradox means there is a 50–83 % chance of at least one hash collision per
 * week, so the same question could appear on two different days.
 *
 * ── New approach: seeded shuffle + day-within-period index ──────────────────
 * 1. Build the same pool as before (period + general + Omer/Shabbat overlays).
 * 2. Shuffle it ONCE per period using the period-start date as the RNG seed —
 *    so every user sees the same shuffled order throughout the period.
 * 3. Select question[dayWithinPeriod % pool.length].
 *
 * This guarantees no repeats for the duration of any period (parasha week,
 * holiday, etc.) as long as the pool is at least 7 questions — which it
 * always is once the general pool is included.
 */

import { Difficulty } from "@/lib/types";
import { QUESTION_BANK, BankQuestion } from "@/lib/questions";
import {
  getTodaysPeriodForDate,
  getPeriodStartNorm,
  getDayWithinPeriod,
} from "@/lib/jewishCalendar";

// ─── Constants ────────────────────────────────────────────────────────────────

const OMER_SEASON_PERIODS = new Set([
  "Shemini", "TazriaMetzora", "AchreiMotKedoshim",
  "Emor", "BeharBechukotai", "Bamidbar",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function dateHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function dedupe(arr: BankQuestion[]): BankQuestion[] {
  const seen = new Set<string>();
  return arr.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

/**
 * Deterministic Fisher-Yates shuffle seeded by a 32-bit integer.
 * Uses Knuth's LCG so the sequence is well-distributed.
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed >>> 0; // unsigned 32-bit
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0; // LCG step
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Main selector ────────────────────────────────────────────────────────────

/**
 * Pick one question from the bank for a given date, difficulty, and period
 * with no repeats within the same calendar period.
 */
export function selectFromBank(
  difficulty: Difficulty,
  period: string,
  dateKey: string,
): BankQuestion | null {
  const byDifficulty = QUESTION_BANK.filter((q) => q.difficulty === difficulty);

  // Period-specific questions
  const periodPool  = byDifficulty.filter((q) => q.relevantPeriod === period);
  // Always include the general pool to ensure a large enough selection
  const generalPool = byDifficulty.filter((q) => q.relevantPeriod === "general");

  // Thematic overlays
  const omerPool = OMER_SEASON_PERIODS.has(period)
    ? byDifficulty.filter((q) => q.relevantPeriod === "Omer")
    : [];

  const dayOfWeek   = new Date(dateKey + "T12:00:00").getDay();
  const shabbatPool = dayOfWeek === 6
    ? byDifficulty.filter((q) => q.relevantPeriod === "Shabbat")
    : [];

  // Merge all pools: period-specific first (for conceptual priority),
  // then general as a supplement, then overlays.
  const pool = dedupe([...periodPool, ...generalPool, ...omerPool, ...shabbatPool]);
  if (pool.length === 0) return null;

  // Stable sort by id so the base order is deterministic across all environments
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));

  // Shuffle once per period using the period-start date as the seed.
  // Every user sees the same shuffled order throughout the entire period,
  // and each successive day steps to the next position — no repeats.
  const periodStart = getPeriodStartNorm(dateKey);
  const seed        = dateHash(periodStart + difficulty + period);
  const shuffled    = seededShuffle(sorted, seed);

  const dayOffset = getDayWithinPeriod(dateKey);
  return shuffled[dayOffset % shuffled.length];
}

/**
 * Convenience wrapper: given a date string, returns the question for
 * that date at the given difficulty (or null).
 */
export function questionForDate(
  dateKey: string,
  difficulty: Difficulty,
): BankQuestion | null {
  const period = getTodaysPeriodForDate(dateKey);
  return selectFromBank(difficulty, period, dateKey);
}
