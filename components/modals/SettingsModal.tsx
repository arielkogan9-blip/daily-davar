"use client";

import { useState } from "react";
import { UserStats, winRatePct } from "@/lib/stats";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "stats" | "appearance" | "howtoplay" | "feedback";

type SettingsModalProps = {
  stats: UserStats;
  theme: "light" | "dark";
  isLoggedIn: boolean;
  streak: number;
  onToggleTheme: () => void;
  onLogin: () => void;
  onClose: () => void;
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const LABEL: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "2px",
  color: "var(--text-muted)",
  marginBottom: 6,
};

const SECTION_HEAD: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 15,
  fontWeight: 600,
  color: "var(--navy)",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: 8,
};

const BODY: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.75,
  color: "var(--text-muted)",
};

// ─── Wordle example cell (How to Play section) ────────────────────────────────

type CellVariant = "correct" | "present" | "absent" | "blank";

function WordleCell({ letter, variant }: { letter: string; variant: CellVariant }) {
  const styles: Record<CellVariant, React.CSSProperties> = {
    correct: { background: "var(--correct)", borderColor: "var(--correct)", color: "#fff" },
    present: { background: "var(--present)", borderColor: "var(--present)", color: "#fff" },
    absent:  { background: "var(--absent)",  borderColor: "var(--absent)",  color: "#fff" },
    blank:   { background: "var(--card)",    borderColor: "var(--border)",  color: "var(--text)" },
  };
  return (
    <div
      style={{
        width: 38, height: 38, border: "1.5px solid", borderRadius: 5,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 700,
        ...styles[variant],
      }}
    >
      {letter}
    </div>
  );
}

function WordleRow({ cells, note }: { cells: { letter: string; variant: CellVariant }[]; note: string }) {
  return (
    <div style={{ marginTop: 8, marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {cells.map((c, i) => <WordleCell key={i} letter={c.letter} variant={c.variant} />)}
      </div>
      <div style={{ ...BODY, marginTop: 5 }}>{note}</div>
    </div>
  );
}

// ─── Stats tab ────────────────────────────────────────────────────────────────

function StatBar({ pct }: { pct: number }) {
  return (
    <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
      <div
        style={{
          height: "100%", borderRadius: 99,
          width: `${pct}%`,
          background: pct >= 70 ? "var(--correct)" : pct >= 40 ? "var(--gold)" : "var(--wrong)",
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

const DIFF_META = {
  easy:   { label: "א Aleph",    bg: "var(--correct-pale)", color: "var(--correct)" },
  medium: { label: "ב Bet",      bg: "var(--gold-muted)",   color: "var(--gold)"    },
  hard:   { label: "ג Gimel",    bg: "var(--wrong-pale)",   color: "var(--wrong)"   },
} as const;

function StatsTab({ stats, streak, isLoggedIn, onLogin }: {
  stats: UserStats; streak: number; isLoggedIn: boolean; onLogin: () => void;
}) {
  const overall = winRatePct(stats.totalPlayed, stats.totalWon);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Overall win rate */}
      <div
        style={{
          background: "var(--navy)",
          borderRadius: 12,
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ ...LABEL, color: "rgba(240,223,168,0.65)", marginBottom: 4 }}>Overall Win Rate</div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 56,
            fontWeight: 700,
            color: "var(--gold)",
            lineHeight: 1,
          }}
        >
          {overall}%
        </div>
        <div style={{ color: "var(--gold-pale)", fontSize: 13, marginTop: 6, opacity: 0.7 }}>
          {stats.totalWon} wins from {stats.totalPlayed} games
        </div>
      </div>

      {/* Streak row */}
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { label: "Current Streak", value: `🔥 ${streak}` },
          { label: "Best Streak",    value: `⭐ ${stats.bestStreak}` },
          { label: "Total Played",   value: String(stats.totalPlayed) },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              flex: 1, background: "var(--card)", border: "1.5px solid var(--border)",
              borderRadius: 10, padding: "12px 8px", textAlign: "center",
            }}
          >
            <div style={{ ...LABEL, fontSize: 9 }}>{s.label}</div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 22, fontWeight: 700, color: "var(--navy)",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* By difficulty */}
      <div>
        <div style={{ ...SECTION_HEAD }}>By Difficulty</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(["easy", "medium", "hard"] as const).map((diff) => {
            const { played, won } = stats.byDifficulty[diff];
            const pct = winRatePct(played, won);
            const meta = DIFF_META[diff];
            return (
              <div
                key={diff}
                style={{
                  background: "var(--card)", border: "1.5px solid var(--border)",
                  borderRadius: 10, padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      background: meta.bg, color: meta.color,
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontWeight: 600, fontSize: 13, padding: "2px 10px", borderRadius: 999,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 700, color: "var(--navy)" }}>
                    {pct}%
                  </span>
                </div>
                <StatBar pct={pct} />
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
                  {won}/{played} correct
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Login / account */}
      {!isLoggedIn && (
        <div
          style={{
            textAlign: "center", padding: "10px 0 4px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={{ ...BODY, marginBottom: 12 }}>
            Sign in to sync your stats and streak across devices.
          </p>
          <button
            onClick={onLogin}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--navy-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--navy)"; }}
            style={{
              background: "var(--navy)", color: "var(--gold-pale)", border: "none",
              borderRadius: 8, padding: "11px 24px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16, fontWeight: 600, letterSpacing: "1px", cursor: "pointer",
              transition: "background 0.15s",
            }}
          >
            Sign In / Register
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Appearance tab ───────────────────────────────────────────────────────────

function AppearanceTab({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
  const isDark = theme === "dark";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ ...SECTION_HEAD }}>Theme</div>
        <p style={{ ...BODY, marginBottom: 16 }}>
          Switch between the warm parchment light theme and a night-friendly dark theme.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {(["light", "dark"] as const).map((t) => {
            const active = theme === t;
            return (
              <button
                key={t}
                onClick={() => { if (!active) onToggle(); }}
                style={{
                  flex: 1, padding: "14px 8px", borderRadius: 10, cursor: active ? "default" : "pointer",
                  border: `1.5px solid ${active ? "var(--navy)" : "var(--border)"}`,
                  background: active ? "var(--navy)" : "var(--card)",
                  color: active ? "var(--gold-pale)" : "var(--text-muted)",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 17, fontWeight: 600, letterSpacing: "0.5px",
                  transition: "all 0.15s",
                }}
              >
                {t === "light" ? "☀️  Light" : "🌙  Dark"}
                {active && (
                  <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.7 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ ...SECTION_HEAD }}>About</div>
        <p style={{ ...BODY }}>
          Daily Davar is a Jewish knowledge game tied to the Hebrew calendar. Each day brings
          a new question matched to the current parasha or holiday. Questions range from
          beginner-friendly multiple choice to advanced halachic text answers.
        </p>
      </div>
    </div>
  );
}

// ─── How to Play tab ──────────────────────────────────────────────────────────

function HowToPlayTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={BODY}>
        A new Jewish knowledge challenge every day, tied to the Hebrew calendar. Read the
        context, then answer the question. A fresh puzzle arrives at midnight Jerusalem time.
      </p>

      <div>
        <div style={SECTION_HEAD}>Difficulty Levels</div>
        <div style={BODY}>
          <strong style={{ color: "var(--correct)" }}>א Aleph (Easy)</strong> — Multiple choice. Accessible to everyone.
          <br /><br />
          <strong style={{ color: "var(--gold)" }}>ב Bet (Medium)</strong> — Word guessing or short answer. Solid Torah knowledge needed.
          <br /><br />
          <strong style={{ color: "var(--wrong)" }}>ג Gimel (Hard)</strong> — Open text. For educators, rabbis, and advanced students.
        </div>
      </div>

      <div>
        <div style={SECTION_HEAD}>Word Guessing — Bet Level</div>
        <p style={BODY}>Guess the Hebrew word letter by letter. You have 5 tries.</p>
        <WordleRow
          cells={[
            { letter: "E", variant: "correct" },
            { letter: "M", variant: "blank"   },
            { letter: "O", variant: "blank"   },
            { letter: "R", variant: "blank"   },
          ]}
          note="🟩 E is in the correct position."
        />
        <WordleRow
          cells={[
            { letter: "N", variant: "blank"   },
            { letter: "O", variant: "present" },
            { letter: "A", variant: "blank"   },
            { letter: "C", variant: "blank"   },
            { letter: "H", variant: "blank"   },
          ]}
          note="🟨 O is in the word but in the wrong position."
        />
        <WordleRow
          cells={[
            { letter: "S", variant: "blank"  },
            { letter: "H", variant: "absent" },
            { letter: "M", variant: "blank"  },
            { letter: "A", variant: "blank"  },
          ]}
          note="⬛ H is not in the word at all."
        />
      </div>

      <div>
        <div style={SECTION_HEAD}>Open Answer — Gimel Level</div>
        <p style={BODY}>
          Type your best answer. After submitting, the model answer is shown as key points — then
          you self-grade: <em>I knew it</em> or <em>I didn&apos;t know</em>. The game ends immediately after your choice.
        </p>
      </div>

      <div>
        <div style={SECTION_HEAD}>Hints</div>
        <p style={BODY}>
          After 2 wrong attempts, a 💡 Reveal Hint button appears. Using a hint is recorded
          on your result card.
        </p>
      </div>

      <div>
        <div style={SECTION_HEAD}>Streaks &amp; Sharing</div>
        <p style={BODY}>
          Answer correctly each day to grow your 🔥 streak. Share your result as a
          spoiler-free emoji grid. Sign in to save your streak across devices.
        </p>
      </div>
    </div>
  );
}

// ─── Feedback tab ─────────────────────────────────────────────────────────────

type SendState = "idle" | "sending" | "sent" | "error";

function FeedbackTab() {
  const [text,  setText]  = useState("");
  const [state, setState] = useState<SendState>("idle");

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || state === "sending") return;

    setState("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error("non-ok");
      setState("sent");
      setText("");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <div style={{ fontSize: 40 }}>✉️</div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 22, fontWeight: 700, color: "var(--correct)",
          }}
        >
          Message sent!
        </div>
        <p style={{ ...BODY, maxWidth: 280 }}>
          Thank you — your feedback has been sent directly to the Daily Davar team.
        </p>
        <button
          onClick={() => setState("idle")}
          style={{
            marginTop: 4, background: "none", border: "none",
            color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
            textDecoration: "underline", fontFamily: "Lora, Georgia, serif",
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  const canSend = !!text.trim() && state !== "sending";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={SECTION_HEAD}>Send Feedback</div>
      <p style={BODY}>
        Found a mistake in a question? Have a suggestion or idea? Write it below — your
        message goes directly to the Daily Davar team, no email app needed.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your feedback here…"
        rows={5}
        disabled={state === "sending"}
        style={{
          width: "100%", padding: "12px 14px",
          border: "1.5px solid var(--border)", borderRadius: 8,
          fontFamily: "Lora, Georgia, serif", fontSize: 14,
          color: "var(--text)", background: "var(--card)",
          outline: "none", resize: "vertical",
          boxSizing: "border-box",
          opacity: state === "sending" ? 0.6 : 1,
        }}
      />

      {state === "error" && (
        <p style={{ fontSize: 13, color: "var(--wrong)", margin: 0 }}>
          Something went wrong — please try again.
        </p>
      )}

      <button
        onClick={handleSend}
        disabled={!canSend}
        onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = "var(--navy-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--navy)"; }}
        style={{
          background: "var(--navy)", color: "var(--gold-pale)", border: "none",
          borderRadius: 8, padding: "13px",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 16, fontWeight: 600, letterSpacing: "1px",
          cursor: canSend ? "pointer" : "not-allowed",
          opacity: canSend ? 1 : 0.45, transition: "all 0.15s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {state === "sending" ? (
          <>
            <span
              className="animate-spin"
              style={{
                display: "inline-block", width: 14, height: 14, borderRadius: "50%",
                border: "2px solid rgba(240,223,168,0.3)",
                borderTopColor: "var(--gold-pale)",
              }}
            />
            Sending…
          </>
        ) : (
          "Send Feedback →"
        )}
      </button>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function SettingsModal({
  stats, theme, isLoggedIn, streak, onToggleTheme, onLogin, onClose,
}: SettingsModalProps) {
  const [tab, setTab] = useState<Tab>("stats");

  const TABS: { id: Tab; label: string }[] = [
    { id: "stats",      label: "📊 Stats"      },
    { id: "appearance", label: "🎨 Appearance"  },
    { id: "howtoplay",  label: "📖 How to Play" },
    { id: "feedback",   label: "✉️  Feedback"   },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: 14,
          maxWidth: 480, width: "100%",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 22px 0",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 24, fontWeight: 700, color: "var(--navy)",
              }}
            >
              Settings
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              style={{
                background: "none", border: "none", fontSize: 20, cursor: "pointer",
                color: "var(--text-muted)", padding: 0, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, overflowX: "auto" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 12px",
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "Lora, Georgia, serif", fontSize: 12,
                  fontWeight: tab === t.id ? 600 : 400,
                  color: tab === t.id ? "var(--navy)" : "var(--text-muted)",
                  borderBottom: tab === t.id ? "2px solid var(--navy)" : "2px solid transparent",
                  whiteSpace: "nowrap", transition: "all 0.12s",
                  flexShrink: 0,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ padding: "22px 22px 28px", overflowY: "auto", flex: 1 }}>
          {tab === "stats"      && <StatsTab stats={stats} streak={streak} isLoggedIn={isLoggedIn} onLogin={onLogin} />}
          {tab === "appearance" && <AppearanceTab theme={theme} onToggle={onToggleTheme} />}
          {tab === "howtoplay"  && <HowToPlayTab />}
          {tab === "feedback"   && <FeedbackTab />}
        </div>
      </div>
    </div>
  );
}
