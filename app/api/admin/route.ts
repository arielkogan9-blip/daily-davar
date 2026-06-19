import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = new Set(["arielkogan9@gmail.com", "dailydavar1@gmail.com"]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.has(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const [
    totalUsers,
    freeUsers,
    plusUsers,
    scholarUsers,
    totalGames,
    totalWins,
    recentFeedback,
    recentSuggestions,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { tier: "free" } }),
    prisma.user.count({ where: { tier: "plus" } }),
    prisma.user.count({ where: { tier: "scholar" } }),
    prisma.gameResult.count(),
    prisma.gameResult.count({ where: { won: true } }),
    prisma.suggestion.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.suggestion.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 10,
      select: { id: true, name: true, email: true, tier: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    users: { total: totalUsers, free: freeUsers, plus: plusUsers, scholar: scholarUsers },
    games: { total: totalGames, wins: totalWins, winRate: totalGames ? Math.round((totalWins / totalGames) * 100) : 0 },
    recentUsers,
    recentFeedback,
    recentSuggestions,
  });
}
