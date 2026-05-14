import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/tierAccess";
import { getTodayKey } from "@/lib/jewishDate";
import { questionForDate } from "@/lib/questionSelection";
import type { Difficulty } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!hasFeature(session.user.tier, "history"))
    return NextResponse.json({ error: "History requires a Plus or Scholar membership." }, { status: 403 });

  try {
    const userId = session.user.id;
    const url    = new URL(req.url);
    const days   = Math.min(parseInt(url.searchParams.get("days") ?? "90", 10), 365);

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

    const today = getTodayKey();

    const rawResults = await prisma.gameResult.findMany({
      where: { userId, date: { gte: cutoff, lte: today } },
      orderBy: { date: "desc" },
    });

    // Enrich each result with the deterministic question for that date
    const results = rawResults.map((r) => {
      const bq = questionForDate(r.date, r.difficulty as Difficulty);
      const question = bq
        ? (({ id: _id, relevantPeriod: _rp, difficulty: _d, ...q }) => q)(bq)
        : null;
      return { ...r, question };
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[/api/user/history]", err);
    return NextResponse.json({ error: "Failed to load history." }, { status: 500 });
  }
}
