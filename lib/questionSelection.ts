/**
 * Deterministic question-bank selection logic, shared between
 * /api/question (today's game) and /api/question/archive (past dates).
 */

import { Difficulty } from "@/lib/types";
import { QUESTION_BANK, BankQuestion } from "@/lib/questions";
import { getTodaysPeriodForDate } from "@/lib/jewishCalendar";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_PERIOD_POOL = 3;

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

// ─── Main selector ────────────────────────────────────────────────────────────

/**
 * Deterministically pick one question from the bank for a given
 * date string (YYYY-MM-DD), difficulty, and period.
 *
 * Identical logic to the original route — extracted here so
 * the archive endpoint and history enrichment can reuse it.
 */
export function selectFromBank(
  difficulty: Difficulty,
  period: string,
  dateKey: string,
): BankQuestion | null {
  const byDifficulty = QUESTION_BANK.filter((q) => q.difficulty === difficulty);

  const periodPool  = byDifficulty.filter((q) => q.relevantPeriod === period);
  const generalPool = byDifficulty.filter((q) => q.relevantPeriod === "general");

  const omerPool = OMER_SEASON_PERIODS.has(period)
    ? byDifficulty.filter((q) => q.relevantPeriod === "Omer")
    : [];

  const dayOfWeek   = new Date(dateKey + "T12:00:00").getDay();
  const shabbatPool = dayOfWeek === 6
    ? byDifficulty.filter((q) => q.relevantPeriod === "Shabbat")
    : [];

  const primaryPool =
    periodPool.length >= MIN_PERIOD_POOL
      ? periodPool
      : dedupe([...periodPool, ...generalPool]);

  const pool = dedupe([...primaryPool, ...omerPool, ...shabbatPool]);
  if (pool.length === 0) return null;

  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const idx = dateHash(dateKey + difficulty + period) % sorted.length;
  return sorted[idx];
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
