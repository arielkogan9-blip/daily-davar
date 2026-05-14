import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasFeature } from "@/lib/tierAccess";
import { questionForDate } from "@/lib/questionSelection";
import { getTodayKey } from "@/lib/jewishDate";
import type { Difficulty } from "@/lib/types";

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!hasFeature(session.user.tier, "archive"))
    return NextResponse.json({ error: "Archive requires a Scholar membership." }, { status: 403 });

  const url        = new URL(req.url);
  const date       = url.searchParams.get("date") ?? "";
  const difficulty = url.searchParams.get("difficulty") ?? "easy";

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });

  if (!VALID_DIFFICULTIES.has(difficulty))
    return NextResponse.json({ error: "Invalid difficulty." }, { status: 400 });

  // Cannot request today or future dates via archive
  const today = getTodayKey();
  if (date >= today)
    return NextResponse.json({ error: "Archive is only available for past dates." }, { status: 400 });

  const bq = questionForDate(date, difficulty as Difficulty);
  if (!bq)
    return NextResponse.json({ error: "No question found for that date." }, { status: 404 });

  // Strip bank-only fields before returning
  const { id: _id, relevantPeriod: _rp, difficulty: _diff, ...question } = bq;
  return NextResponse.json({ date, difficulty, question });
}
