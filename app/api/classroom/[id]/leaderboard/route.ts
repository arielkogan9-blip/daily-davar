import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayKey } from "@/lib/jewishDate";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    const { id: classroomId } = await params;
    const today = getTodayKey();

    // Verify requester is a member of this classroom
    const membership = await prisma.classroomMember.findUnique({
      where: { classroomId_userId: { classroomId, userId: session.user.id } },
    });
    if (!membership)
      return NextResponse.json({ error: "You are not a member of this classroom." }, { status: 403 });

    // Fetch all members with their user info and today's game results
    const members = await prisma.classroomMember.findMany({
      where: { classroomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            streak: { select: { currentStreak: true } },
            gameResults: {
              where: { date: today },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    // Build leaderboard entries
    const entries = members.map(({ user, role }) => {
      // Pick the best result today (prefer won, then fewest attempts)
      const todayResults = user.gameResults;
      const best = todayResults.sort((a, b) => {
        if (a.won !== b.won) return a.won ? -1 : 1;
        return a.attemptsUsed - b.attemptsUsed;
      })[0] ?? null;

      return {
        userId:        user.id,
        name:          user.name ?? user.email.split("@")[0],
        role,
        played:        todayResults.length > 0,
        won:           best?.won ?? false,
        attemptsUsed:  best?.attemptsUsed ?? null,
        difficulty:    best?.difficulty ?? null,
        currentStreak: user.streak?.currentStreak ?? 0,
      };
    });

    // Sort: played+won first → played+lost → not played; within played+won: fewest attempts
    entries.sort((a, b) => {
      if (a.won !== b.won) return a.won ? -1 : 1;
      if (a.played !== b.played) return a.played ? -1 : 1;
      if (a.attemptsUsed !== null && b.attemptsUsed !== null)
        return a.attemptsUsed - b.attemptsUsed;
      return 0;
    });

    return NextResponse.json({ date: today, leaderboard: entries });
  } catch (err) {
    console.error("[/api/classroom/[id]/leaderboard]", err);
    return NextResponse.json({ error: "Failed to load leaderboard." }, { status: 500 });
  }
}
