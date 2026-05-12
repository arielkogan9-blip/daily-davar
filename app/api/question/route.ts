import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Difficulty, Question, FALLBACK_QUESTIONS } from "@/lib/types";
import { getGregorianDateString, getTodayKey } from "@/lib/jewishDate";
import { getTodaysPeriod } from "@/lib/jewishCalendar";
import { QUESTION_BANK, BankQuestion } from "@/lib/questions";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Deterministic date-based hash ───────────────────────────────────────────

function dateHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
    h |= 0; // keep 32-bit
  }
  return Math.abs(h);
}

// ─── Bank selection ───────────────────────────────────────────────────────────

const MIN_PERIOD_POOL = 3; // fall back to general if fewer than this

// Parasha periods that fall during the Sefirat HaOmer season (post-Pesach → Shavuot).
// During these weeks the Omer question pool is added so Omer-themed questions surface
// alongside the weekly parasha questions.
const OMER_SEASON_PERIODS = new Set([
  "Shemini", "TazriaMetzora", "AchreiMotKedoshim", "Emor", "BeharBechukotai", "Bamidbar",
]);

function selectFromBank(
  difficulty: Difficulty,
  period: string,
  today: string,
): BankQuestion | null {
  const byDifficulty = QUESTION_BANK.filter((q) => q.difficulty === difficulty);

  const periodPool  = byDifficulty.filter((q) => q.relevantPeriod === period);
  const generalPool = byDifficulty.filter((q) => q.relevantPeriod === "general");

  // Omer overlay: blend in Omer questions during the 7 post-Pesach parasha weeks.
  const omerPool = OMER_SEASON_PERIODS.has(period)
    ? byDifficulty.filter((q) => q.relevantPeriod === "Omer")
    : [];

  // Shabbat overlay: if today is Saturday (getDay() === 6) blend in Shabbat questions
  // so Shabbat-themed content surfaces regardless of the weekly parasha.
  const dayOfWeek = new Date(today + "T12:00:00").getDay();
  const shabbatPool = dayOfWeek === 6
    ? byDifficulty.filter((q) => q.relevantPeriod === "Shabbat")
    : [];

  // Build primary pool: prefer period-specific; fall back to general when thin.
  const primaryPool =
    periodPool.length >= MIN_PERIOD_POOL
      ? periodPool
      : dedupe([...periodPool, ...generalPool]);

  // Merge overlays (deduped). Overlays extend — never replace — the primary pool.
  const pool = dedupe([...primaryPool, ...omerPool, ...shabbatPool]);

  if (pool.length === 0) return null;

  // Sort by id for stable ordering, then pick deterministically by date.
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const idx = dateHash(today + difficulty + period) % sorted.length;
  return sorted[idx];
}

function dedupe(arr: BankQuestion[]): BankQuestion[] {
  const seen = new Set<string>();
  return arr.filter((q) => {
    if (seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
}

// ─── Claude fallback ──────────────────────────────────────────────────────────

async function generateFromClaude(
  difficulty: Difficulty,
  period: string,
): Promise<Question> {
  const date = getGregorianDateString();

  const systemPrompt = `You generate daily quiz questions for Daily Davar, a Jewish knowledge game tied to the Hebrew calendar. Today is ${date}. The current Jewish calendar period is: "${period}".

Difficulty: '${difficulty}'
- easy → type must be 'multiple_choice'. Basic Torah and holidays knowledge. options array must have exactly 4 strings with the correct answer shuffled in.
- medium → type must be 'wordle' if the answer is a single word of 4–8 uppercase letters with no spaces; otherwise 'text_box'. Intermediate Jewish knowledge.
- hard → type must be 'text_box'. Deep halachic or rabbinic knowledge.

Respond ONLY with valid JSON and nothing else — no markdown fences, no explanation:
{"parasha":"topic name","topic_category":"Torah|Talmud|Jewish Law|Holidays|Jewish History","context":"2–3 educational sentences that do NOT reveal the answer","question":"the question text","type":"multiple_choice|wordle|text_box","answer":"exact answer, transliterated English, correct spelling required","options":["A","B","C","D"],"hint":"a helpful hint that does not give away the answer"}

Rules: easy options must contain exactly 4 items including the correct answer. wordle answer must be a single uppercase word 4–8 letters. Tailor the question to the current period ("${period}") where possible. All content must be factually accurate.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: "user", content: "Generate today's question." }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("No text block");

  const raw = textBlock.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(raw);

  if (!parsed.parasha || !parsed.question || !parsed.type || !parsed.answer) {
    throw new Error("Response missing required fields");
  }
  return parsed as Question;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  let difficulty: Difficulty = "easy";

  try {
    const body = await req.json();
    difficulty = body.difficulty as Difficulty;

    const today = getTodayKey();
    const period = getTodaysPeriod();

    // 1. Try the local question bank first
    const bankQuestion = selectFromBank(difficulty, period, today);
    if (bankQuestion) {
      // Strip the bank-only fields before returning
      const { id: _id, relevantPeriod: _rp, difficulty: _diff, ...question } = bankQuestion;
      return NextResponse.json(question);
    }

    // 2. Fall back to Claude (passes calendar context in the prompt)
    const claudeQuestion = await generateFromClaude(difficulty, period);
    return NextResponse.json(claudeQuestion);
  } catch (err) {
    console.error("[/api/question] error:", err);
    return NextResponse.json(FALLBACK_QUESTIONS[difficulty], { status: 200 });
  }
}
