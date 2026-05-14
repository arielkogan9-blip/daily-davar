"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type HistoryResult = {
  id: string;
  date: string;
  difficulty: "easy" | "medium" | "hard";
  won: boolean;
  attemptsUsed: number;
  hintUsed: boolean;
  question: {
    question:    string;
    answer:      string;
    explanation?: string;
    parasha:     string;
  } | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

const DIFF_META: Record<string, { label: string; bg: string; color: string }> = {
  easy:   { label: "א Aleph",  bg: "var(--correct-pale)", color: "var(--correct)" },
  medium: { label: "ב Bet",    bg: "var(--gold-muted)",   color: "var(--gold)"    },
  hard:   { label: "ג Gimel",  bg: "var(--wrong-pale)",   color: "var(--wrong)"   },
};

// ─── History card ─────────────────────────────────────────────────────────────

function HistoryCard({ r, tier }: { r: HistoryResult; tier: string }) {
  const [open, setOpen] = useState(false);
  const meta = DIFF_META[r.difficulty] ?? DIFF_META.easy;
  const canSeeExplanation = tier === "plus" || tier === "scholar";

  return (
    <div style={{
      border: "1.5px solid var(--border)",
      borderRadius: 10, overflow: "hidden",
      background: "var(--card)",
    }}>
      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px",
        borderBottom: "1px solid var(--border)",
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, fontStyle: "italic", color: "var(--text-muted)", flexGrow: 1 }}>
          {fmtDate(r.date)}
        </span>
        <span style={{
          background: meta.bg, color: meta.color,
          fontSize: 11, fontWeight: 600,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          padding: "2px 8px", borderRadius: 999,
        }}>
          {meta.label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: r.won ? "var(--correct)" : "var(--wrong)" }}>
          {r.won ? "✓ Won" : "✗ Lost"}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {r.attemptsUsed} attempt{r.attemptsUsed !== 1 ? "s" : ""}
        </span>
        {r.hintUsed && <span title="Hint used" style={{ fontSize: 14 }}>💡</span>}
      </div>

      {/* Question + answer */}
      <div style={{ padding: "12px 14px" }}>
        {r.question ? (
          <>
            <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginBottom: 8 }}>
              {r.question.question}
            </div>
            <div style={{ fontSize: 12 }}>
              <span style={{ color: "var(--text-muted)" }}>Answer: </span>
              <span style={{ fontWeight: 600, color: "var(--navy)" }}>{r.question.answer}</span>
            </div>

            {/* Collapsible explanation */}
            {canSeeExplanation && r.question.explanation && (
              <div style={{ marginTop: 10 }}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  style={{
                    background: "none", border: "none", padding: 0,
                    fontSize: 12, color: "var(--gold)", cursor: "pointer",
                    fontFamily: "Lora, Georgia, serif",
                  }}
                >
                  {open ? "▲ Hide explanation" : "▼ Show explanation"}
                </button>
                {open && (
                  <div style={{
                    marginTop: 8, padding: "10px 12px",
                    background: "var(--gold-muted)", borderRadius: 7,
                    fontFamily: "Lora, Georgia, serif", fontSize: 13,
                    lineHeight: 1.75, color: "var(--text)",
                    borderLeft: "3px solid var(--gold)",
                  }}>
                    {r.question.explanation}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
            Question data unavailable for this date.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Upgrade prompt ───────────────────────────────────────────────────────────

function UpgradePrompt() {
  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
        Your History
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
        Unlock your full answer history, review past questions, and read explanations with a Plus or Scholar membership.
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router  = useRouter();
  const tier    = (session?.user as { tier?: string })?.tier ?? "free";

  const [results, setResults]     = useState<HistoryResult[]>([]);
  const [loading, setLoading]     = useState(true);
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const [wonFilter,  setWonFilter]  = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (tier === "free") { setLoading(false); return; }

    fetch("/api/user/history?days=90")
      .then((r) => r.json())
      .then(({ results: r }) => { setResults(r ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, tier]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
      </div>
    );
  }

  if (tier === "free") return <UpgradePrompt />;

  // Filtered results
  const filtered = results.filter((r) => {
    if (diffFilter !== "all" && r.difficulty !== diffFilter) return false;
    if (wonFilter  === "won"  && !r.won)  return false;
    if (wonFilter  === "lost" && r.won)   return false;
    return true;
  });

  const FILTER_BTN = (active: boolean): React.CSSProperties => ({
    background: active ? "var(--navy)" : "transparent",
    color: active ? "var(--gold-pale)" : "var(--text-muted)",
    border: `1.5px solid ${active ? "var(--navy)" : "var(--border)"}`,
    borderRadius: 6, padding: "5px 12px",
    fontFamily: "Lora, Georgia, serif", fontSize: 12,
    cursor: "pointer", transition: "all 0.12s",
  });

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "36px 20px 60px" }}>
      {/* Title */}
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
        Answer History
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Last 90 days · {results.length} game{results.length !== 1 ? "s" : ""}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {/* Difficulty filter */}
        {[["all", "All"], ["easy", "א Aleph"], ["medium", "ב Bet"], ["hard", "ג Gimel"]].map(([v, l]) => (
          <button key={v} style={FILTER_BTN(diffFilter === v)} onClick={() => setDiffFilter(v)}>{l}</button>
        ))}
        <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
        {/* Won filter */}
        {[["all", "All results"], ["won", "Won ✓"], ["lost", "Lost ✗"]].map(([v, l]) => (
          <button key={v} style={FILTER_BTN(wonFilter === v)} onClick={() => setWonFilter(v)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 14 }}>
          {results.length === 0
            ? "No games played yet — complete today's question to start your history!"
            : "No results match the selected filters."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((r) => (
            <HistoryCard key={r.id} r={r} tier={tier} />
          ))}
        </div>
      )}
    </div>
  );
}
