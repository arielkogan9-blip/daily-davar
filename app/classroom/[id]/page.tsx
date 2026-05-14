"use client";

import BackButton from "@/components/BackButton";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeaderboardEntry = {
  userId:        string;
  name:          string;
  role:          string;
  played:        boolean;
  won:           boolean;
  attemptsUsed:  number | null;
  difficulty:    string | null;
  currentStreak: number;
};

type ClassroomInfo = {
  id: string; name: string; code: string;
  memberCount: number; isOwner: boolean;
};

const DIFF_LABEL: Record<string, string> = {
  easy: "א", medium: "ב", hard: "ג",
};

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

// ─── Rank medal ───────────────────────────────────────────────────────────────

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: 20 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: 20 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: 20 }}>🥉</span>;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 700, color: "var(--text-muted)",
    }}>
      {rank}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClassroomLeaderboardPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const params  = useParams();
  const id      = params.id as string;

  const [classroom,    setClassroom]    = useState<ClassroomInfo | null>(null);
  const [leaderboard,  setLeaderboard]  = useState<LeaderboardEntry[]>([]);
  const [date,         setDate]         = useState("");
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [infoRes, lbRes] = await Promise.all([
        fetch(`/api/classroom/${id}`),
        fetch(`/api/classroom/${id}/leaderboard`),
      ]);

      if (infoRes.ok) {
        const { classroom: c } = await infoRes.json();
        setClassroom(c);
      } else if (infoRes.status === 403) {
        router.push("/classroom");
        return;
      }

      if (lbRes.ok) {
        const { leaderboard: lb, date: d } = await lbRes.json();
        setLeaderboard(lb ?? []);
        setDate(d ?? "");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    load();
  }, [status, load]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
      </div>
    );
  }

  function copyCode() {
    if (!classroom?.code) return;
    navigator.clipboard.writeText(classroom.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "36px 20px 60px" }}>
      <BackButton />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 30, fontWeight: 700, color: "var(--navy)" }}>
            {classroom?.name ?? "Classroom"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            {classroom?.memberCount ?? 0} members · {date ? fmtDate(date) : ""}
          </div>
        </div>

        {/* Owner join code */}
        {classroom?.isOwner && (
          <div
            onClick={copyCode}
            title="Click to copy join code"
            style={{
              background: "var(--navy)", borderRadius: 8, padding: "10px 16px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 22, fontWeight: 700, letterSpacing: "5px", color: "var(--gold)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
            }}
          >
            {classroom.code}
            <span style={{ fontSize: 12, fontFamily: "Lora, serif", letterSpacing: 0, color: "var(--gold-pale)", opacity: 0.7 }}>
              {copied ? "Copied ✓" : "Copy"}
            </span>
          </div>
        )}
      </div>

      {/* Refresh button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          style={{
            background: "none", border: "1.5px solid var(--border)", borderRadius: 6,
            padding: "5px 14px", fontFamily: "Lora, Georgia, serif", fontSize: 12,
            color: "var(--text-muted)", cursor: refreshing ? "not-allowed" : "pointer",
            opacity: refreshing ? 0.5 : 1,
          }}
        >
          {refreshing ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 14 }}>
          No members yet. Share the join code to get started!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {leaderboard.map((entry, i) => {
            const rank = i + 1;
            return (
              <div
                key={entry.userId}
                style={{
                  background: "var(--card)",
                  border: `1.5px solid ${entry.won ? "var(--correct)" : entry.played ? "var(--wrong)" : "var(--border)"}`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 14,
                  opacity: entry.played ? 1 : 0.65,
                }}
              >
                {/* Rank */}
                <div style={{ flexShrink: 0, width: 32, display: "flex", justifyContent: "center" }}>
                  <Medal rank={rank} />
                </div>

                {/* Name + role */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 600, color: "var(--navy)", display: "flex", alignItems: "center", gap: 6 }}>
                    {entry.name}
                    {entry.role === "owner" && (
                      <span style={{ fontSize: 9, background: "var(--gold-muted)", color: "var(--gold)", padding: "1px 5px", borderRadius: 999, fontWeight: 700, letterSpacing: "0.5px" }}>OWNER</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    {entry.currentStreak > 0 && `🔥 ${entry.currentStreak} streak`}
                  </div>
                </div>

                {/* Result info */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {entry.played ? (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                        {entry.difficulty && (
                          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 16, fontWeight: 700, color: "var(--text-muted)" }}>
                            {DIFF_LABEL[entry.difficulty] ?? ""}
                          </span>
                        )}
                        <span style={{ fontSize: 16, fontWeight: 700, color: entry.won ? "var(--correct)" : "var(--wrong)" }}>
                          {entry.won ? "✓" : "✗"}
                        </span>
                      </div>
                      {entry.attemptsUsed !== null && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {entry.attemptsUsed} attempt{entry.attemptsUsed !== 1 ? "s" : ""}
                        </div>
                      )}
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Not played</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
