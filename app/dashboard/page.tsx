"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getTodayKey } from "@/lib/jewishDate";

// ─── Types ────────────────────────────────────────────────────────────────────

type DiffStats = { played: number; won: number; winRate: number };

type Stats = {
  totalPlayed:   number;
  totalWon:      number;
  winRate:       number;
  currentStreak: number;
  longestStreak: number;
  accuracyByDifficulty: { easy: DiffStats; medium: DiffStats; hard: DiffStats };
};

type DayResult = { date: string; won: boolean };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function last7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - i * 86400000);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  }).reverse();
}

function dayLabel(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UpgradePrompt() {
  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
        Your Dashboard
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
        Unlock your personal stats, streak history, and detailed performance breakdowns with a Plus or Scholar membership.
      </p>
      <a href="/pricing" style={{
        display: "inline-block",
        background: "var(--navy)", color: "var(--gold-pale)",
        borderRadius: 8, padding: "14px 32px",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18, fontWeight: 600, letterSpacing: "1px",
        textDecoration: "none",
      }}>
        Upgrade to Plus →
      </a>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "var(--card)", border: "1.5px solid var(--border)",
      borderRadius: 10, padding: "16px 14px", textAlign: "center", flex: 1,
    }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--text-muted)", marginTop: 5 }}>
        {label}
      </div>
    </div>
  );
}

function WinBar({ label, pct, played }: { label: string; pct: number; played: number }) {
  const color = pct >= 70 ? "var(--correct)" : pct >= 40 ? "var(--gold)" : "var(--wrong)";
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 600, color: "var(--navy)" }}>{label}</span>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{pct}% <span style={{ fontSize: 11 }}>({played} played)</span></span>
      </div>
      <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 99, width: `${pct}%`, background: color, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const tier = (session?.user as { tier?: string })?.tier ?? "free";

  const [stats,   setStats]   = useState<Stats | null>(null);
  const [history, setHistory] = useState<DayResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  // Fetch data for plus/scholar
  useEffect(() => {
    if (status !== "authenticated") return;
    if (tier === "free") { setLoading(false); return; }

    async function load() {
      const [statsRes, histRes] = await Promise.all([
        fetch("/api/user/stats"),
        fetch("/api/user/history?days=7"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());

      if (histRes.ok) {
        const { results } = await histRes.json();
        setHistory(results.map((r: { date: string; won: boolean }) => ({ date: r.date, won: r.won })));
      }

      setLoading(false);
    }
    load();
  }, [status, tier]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
      </div>
    );
  }

  if (tier === "free") return <UpgradePrompt />;

  const today      = getTodayKey();
  const days       = last7Days();
  const dayResults = days.map((d) => history.find((r) => r.date === d) ?? null);

  // Played this week
  const playedThisWeek = dayResults.filter(Boolean).length;

  // Favourite difficulty
  const byDiff = stats?.accuracyByDifficulty;
  const favDiff: "easy" | "medium" | "hard" | null = byDiff
    ? (["easy", "medium", "hard"] as ("easy" | "medium" | "hard")[])
        .slice()
        .sort((a, b) => (byDiff[b]?.played ?? 0) - (byDiff[a]?.played ?? 0))[0] ?? null
    : null;
  const favLabels: Record<string, string> = { easy: "א Aleph", medium: "ב Bet", hard: "ג Gimel" };

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "36px 20px 60px" }}>
      {/* Title */}
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
        Your Dashboard
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}>
        All-time performance across every Daily Davar session
      </div>

      {/* Streak hero */}
      <div style={{
        background: "var(--navy)", borderRadius: 12,
        padding: "22px 24px", display: "flex", gap: 0, marginBottom: 20,
      }}>
        {[
          { icon: "🔥", value: stats?.currentStreak ?? 0, label: "Current Streak" },
          { icon: "⭐", value: stats?.longestStreak  ?? 0, label: "Longest Streak" },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i === 0 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
            <div style={{ fontSize: 26 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 48, fontWeight: 700, color: "var(--gold)", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--gold-pale)", opacity: 0.7, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* 4 stat cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label="Total Played" value={stats?.totalPlayed ?? 0} />
        <StatCard label="Win Rate"     value={`${stats?.winRate ?? 0}%`} />
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        <StatCard label="Played This Week" value={playedThisWeek} sub={`of 7 days`} />
        <StatCard label="Favourite"        value={favDiff ? favLabels[favDiff] : "—"} sub={favDiff && byDiff ? `${byDiff[favDiff]?.played ?? 0} games` : undefined} />
      </div>

      {/* Win rate bars */}
      <div style={{
        background: "var(--card)", border: "1.5px solid var(--border)",
        borderRadius: 12, padding: "20px 20px 8px", marginBottom: 24,
      }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "2px", color: "var(--text-muted)", marginBottom: 16 }}>
          Win Rate by Difficulty
        </div>
        <WinBar label="א Aleph (Easy)"    pct={byDiff?.easy?.winRate   ?? 0} played={byDiff?.easy?.played   ?? 0} />
        <WinBar label="ב Bet (Medium)"    pct={byDiff?.medium?.winRate ?? 0} played={byDiff?.medium?.played ?? 0} />
        <WinBar label="ג Gimel (Advanced)"pct={byDiff?.hard?.winRate   ?? 0} played={byDiff?.hard?.played   ?? 0} />
      </div>

      {/* Last 7 days activity */}
      <div style={{
        background: "var(--card)", border: "1.5px solid var(--border)",
        borderRadius: 12, padding: "20px 20px 16px",
      }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "2px", color: "var(--text-muted)", marginBottom: 16 }}>
          Last 7 Days
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 4 }}>
          {days.map((d, i) => {
            const result  = dayResults[i];
            const isToday = d === today;
            const dotColor = result
              ? result.won ? "var(--correct)" : "var(--wrong)"
              : "var(--border)";

            return (
              <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: dotColor,
                  border: isToday ? "2.5px solid var(--gold)" : "2px solid transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>
                  {result ? (result.won ? "✓" : "✗") : ""}
                </div>
                <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", textAlign: "center" }}>
                  {dayLabel(d)}
                  {isToday && <span style={{ display: "block", color: "var(--gold)", fontWeight: 700 }}>Today</span>}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{fmtDate(d)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
