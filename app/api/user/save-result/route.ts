import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayKey, getYesterdayKey } from "@/lib/jewishDate";
import { rateLimit, getIP } from "@/lib/ratelimit";

export async function POST(req: Request) {
  if (!rateLimit(`save-result:${getIP(req)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const { difficulty, won, attemptsUsed, hintUsed } = await req.json() as {
      difficulty: string;
      won: boolean;
      attemptsUsed: number;
      hintUsed: boolean;
    };

    const userId = session.user.id;
    const today  = getTodayKey();
    const yesterday = getYesterdayKey();

    // ── Idempotency: skip if result already saved for this date+difficulty ──
    const existing = await prisma.gameResult.findFirst({
      where: { userId, date: today, difficulty },
    });
    if (existing) return NextResponse.json({ ok: true, skipped: true });

    // ── Save game result ─────────────────────────────────────────────────────
    await prisma.gameResult.create({
      data: { userId, date: today, difficulty, won, attemptsUsed, hintUsed },
    });

    // ── Update streak ────────────────────────────────────────────────────────
    if (won) {
      const streakRow = await prisma.userStreak.findUnique({ where: { userId } });

      let newCurrent = 1;
      if (streakRow?.lastPlayedDate === yesterday) {
        newCurrent = (streakRow.currentStreak ?? 0) + 1;
      } else if (streakRow?.lastPlayedDate === today) {
        // Already counted today — no change
        newCurrent = streakRow.currentStreak;
      }

      const newLongest = Math.max(streakRow?.longestStreak ?? 0, newCurrent);

      await prisma.userStreak.upsert({
        where:  { userId },
        create: { userId, currentStreak: newCurrent, longestStreak: newLongest, lastPlayedDate: today },
        update: { currentStreak: newCurrent, longestStreak: newLongest, lastPlayedDate: today },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/user/save-result]", err);
    return NextResponse.json({ error: "Failed to save result." }, { status: 500 });
  }
}
