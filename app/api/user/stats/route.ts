import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/tierAccess";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!hasFeature(session.user.tier, "stats"))
    return NextResponse.json({ error: "Stats require a Plus or Scholar membership." }, { status: 403 });

  try {
    const userId = session.user.id;

    const [results, streakRow] = await Promise.all([
      prisma.gameResult.findMany({ where: { userId } }),
      prisma.userStreak.findUnique({ where: { userId } }),
    ]);

    const totalPlayed = results.length;
    const totalWon    = results.filter((r) => r.won).length;
    const winRate     = totalPlayed === 0 ? 0 : Math.round((totalWon / totalPlayed) * 100);

    const byDifficulty = (["easy", "medium", "hard"] as const).reduce((acc, diff) => {
      const bucket = results.filter((r) => r.difficulty === diff);
      const won    = bucket.filter((r) => r.won).length;
      acc[diff] = {
        played:  bucket.length,
        won,
        winRate: bucket.length === 0 ? 0 : Math.round((won / bucket.length) * 100),
      };
      return acc;
    }, {} as Record<string, { played: number; won: number; winRate: number }>);

    return NextResponse.json({
      totalPlayed,
      totalWon,
      winRate,
      currentStreak:  streakRow?.currentStreak  ?? 0,
      longestStreak:  streakRow?.longestStreak   ?? 0,
      lastPlayedDate: streakRow?.lastPlayedDate  ?? null,
      accuracyByDifficulty: byDifficulty,
    });
  } catch (err) {
    console.error("[/api/user/stats]", err);
    return NextResponse.json({ error: "Failed to load stats." }, { status: 500 });
  }
}
