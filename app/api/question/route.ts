import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Difficulty, FALLBACK_QUESTIONS } from "@/lib/types";
import { getGregorianDateString } from "@/lib/jewishDate";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  let difficulty: Difficulty = "easy";

  try {
    const body = await req.json();
    difficulty = body.difficulty as Difficulty;

    const date = getGregorianDateString();

    const systemPrompt = `You generate daily quiz questions for Daily Davar, a Jewish knowledge game tied to the Hebrew calendar. Today is ${date} (approximately Iyar 5786, the week of Parashat Emor/Behar-Bechukotai).

Difficulty: '${difficulty}'
- easy → type must be 'multiple_choice'. Basic Torah and holidays knowledge. options array must have exactly 4 strings with the correct answer shuffled in.
- medium → type must be 'wordle' if the answer is a single word of 4–8 uppercase letters with no spaces; otherwise 'text_box'. Intermediate Jewish knowledge across Torah, Talmud, holidays.
- hard → type must be 'text_box'. Deep halachic or rabbinic knowledge suitable for educators and rabbis. No multiple choice.

Respond ONLY with valid JSON and nothing else — no markdown fences, no explanation:
{"parasha":"topic name","topic_category":"Torah|Talmud|Jewish Law|Holidays|Jewish History","context":"2–3 educational sentences that do NOT reveal the answer","question":"the question text","type":"multiple_choice|wordle|text_box","answer":"exact answer, transliterated English, correct spelling required","options":["A","B","C","D"],"hint":"a helpful hint that does not give away the answer"}

Rules: easy options must contain exactly 4 items including the correct answer. wordle answer must be a single uppercase word 4–8 letters. All content must be factually accurate.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: "Generate today's question." }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("No text block in response");

    const raw = textBlock.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(raw);

    if (!parsed.parasha || !parsed.question || !parsed.type || !parsed.answer) {
      throw new Error("Response missing required fields");
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[/api/question] error:", err);
    return NextResponse.json(FALLBACK_QUESTIONS[difficulty], { status: 200 });
  }
}
