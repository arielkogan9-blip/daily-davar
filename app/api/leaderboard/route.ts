import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    // Top 20 users by current streak, with their name and win stats
    const topStreaks = await prisma.userStreak.findMany({
      where: { currentStreak: { gt: 0 } },
      orderBy: { currentStreak: "desc" },
      take: 20,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // For each user, fetch total games + wins
    const leaderboard = await Promise.all(
      topStreaks.map(async (row) => {
        const [total, won] = await Promise.all([
          prisma.gameResult.count({ where: { userId: row.userId } }),
          prisma.gameResult.count({ where: { userId: row.userId, won: true } }),
        ]);
        const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
        const displayName =
          row.user.name ?? row.user.email?.split("@")[0] ?? "Player";
        const isMe = row.userId === session.user!.id;
        return {
          userId: row.userId,
          displayName,
          currentStreak:  row.currentStreak,
          longestStreak:  row.longestStreak,
          totalPlayed:    total,
          winRate,
          isMe,
        };
      })
    );

    // Find requesting user's rank even if not in top 20
    const myRank = leaderboard.findIndex((r) => r.isMe) + 1;

    return NextResponse.json({ leaderboard, myRank: myRank || null });
  } catch (err) {
    console.error("[/api/leaderboard]", err);
    return NextResponse.json({ error: "Failed to fetch leaderboard." }, { status: 500 });
  }
}
