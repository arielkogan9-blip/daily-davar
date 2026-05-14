import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasFeature } from "@/lib/tierAccess";
import { questionForDate } from "@/lib/questionSelection";
import { getTodayKey } from "@/lib/jewishDate";
import { getTodaysPeriodForDate } from "@/lib/jewishCalendar";
import type { Difficulty } from "@/lib/types";

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  if (!hasFeature(session.user.tier, "stats"))
    return NextResponse.json({ error: "Digest requires a Scholar membership." }, { status: 403 });

  try {
    const days  = last7Days();
    const today = getTodayKey();

    // Current parasha based on today
    const parasha = getTodaysPeriodForDate(today);

    const weekDays = days.map((date) => {
      const easy   = questionForDate(date, "easy"   as Difficulty);
      const medium = questionForDate(date, "medium" as Difficulty);
      const hard   = questionForDate(date, "hard"   as Difficulty);

      function strip(bq: typeof easy) {
        if (!bq) return null;
        const { id: _id, relevantPeriod: _rp, difficulty: _d, ...q } = bq;
        return q;
      }

      return {
        date,
        isFuture: date > today,
        easy:   strip(easy),
        medium: strip(medium),
        hard:   strip(hard),
      };
    });

    return NextResponse.json({
      weekRange: { start: days[0], end: days[days.length - 1] },
      parasha,
      days: weekDays,
    });
  } catch (err) {
    console.error("[/api/digest]", err);
    return NextResponse.json({ error: "Failed to load digest." }, { status: 500 });
  }
}
