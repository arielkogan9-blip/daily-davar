"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";

type LeaderboardRow = {
  userId: string;
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  totalPlayed: number;
  winRate: number;
  isMe: boolean;
};

type LeaderboardData = {
  leaderboard: LeaderboardRow[];
  myRank: number | null;
};

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const tier = (session?.user as { tier?: string })?.tier ?? "free";

  const [data,    setData]    = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
      </div>
    );
  }

  // Free users see upgrade prompt
  if (tier === "free") {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
          Leaderboard
        </div>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
          See how your streak and win rate compare to other Daily Davar players. Available to Plus and Scholar members.
        </p>
        <a href="/pricing" style={{
          display: "inline-block", background: "var(--navy)", color: "var(--gold-pale)",
          borderRadius: 8, padding: "14px 32px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 600, letterSpacing: "1px", textDecoration: "none",
        }}>
          Upgrade to Plus →
        </a>
      </div>
    );
  }

  const rows = data?.leaderboard ?? [];

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 20px 60px" }}>
      <BackButton />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🏆</div>
        <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 700, color: "var(--navy)" }}>
          Leaderboard
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
          Top players by current streak
        </div>
        {data?.myRank && (
          <div style={{
            marginTop: 10, display: "inline-block",
            background: "var(--gold-muted)", color: "var(--gold)",
            borderRadius: 999, padding: "3px 14px",
            fontSize: 12, fontWeight: 600,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}>
            Your rank: #{data.myRank}
          </div>
        )}
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 15, fontStyle: "italic" }}>
          No streak data yet — play a few games to appear here!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row, i) => (
            <div
              key={row.userId}
              style={{
                background: row.isMe ? "var(--navy)" : "var(--card)",
                border: `1.5px solid ${row.isMe ? "var(--navy)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              {/* Rank */}
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: i < 3 ? 24 : 17,
                fontWeight: 700,
                color: row.isMe ? "var(--gold)" : "var(--text-muted)",
                minWidth: 32, textAlign: "center",
              }}>
                {i < 3 ? MEDAL[i] : `#${i + 1}`}
              </div>

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 17, fontWeight: 700,
                  color: row.isMe ? "var(--gold-pale)" : "var(--navy)",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {row.displayName} {row.isMe && <span style={{ fontSize: 12, opacity: 0.7 }}>(you)</span>}
                </div>
                <div style={{ fontSize: 12, color: row.isMe ? "rgba(240,223,168,0.6)" : "var(--text-muted)", marginTop: 2 }}>
                  {row.totalPlayed} played · {row.winRate}% win rate
                </div>
              </div>

              {/* Streak */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 22, fontWeight: 700,
                  color: row.isMe ? "var(--gold)" : "var(--navy)",
                }}>
                  🔥 {row.currentStreak}
                </div>
                <div style={{ fontSize: 11, color: row.isMe ? "rgba(240,223,168,0.55)" : "var(--text-muted)" }}>
                  best: {row.longestStreak}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
