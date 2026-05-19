"use client";

type LandingPageProps = {
  onPlay: () => void;
  onLogin: () => void;
};

const FEATURES = [
  {
    emoji: "📅",
    title: "Calendar-Aware",
    desc: "Every question is drawn from the current parasha, holiday, or Jewish season — updated daily at midnight Jerusalem time.",
  },
  {
    emoji: "🎓",
    title: "Three Difficulty Levels",
    desc: "Aleph (multiple choice), Bet (word guessing), and Gimel (open answer for educators and scholars).",
  },
  {
    emoji: "🔥",
    title: "Daily Streaks",
    desc: "Answer correctly each day to grow your streak. Sign in to sync across devices and track your history.",
  },
];

const SAMPLE = {
  context: "Parashat Bereishit opens the Torah with the creation narrative. On the seventh day, God rested and sanctified the day — the first Shabbat.",
  question: "On which day did God rest and sanctify Shabbat?",
  options: ["The fifth day", "The sixth day", "The seventh day", "The eighth day"],
  answer: "The seventh day",
};

export default function LandingPage({ onPlay, onLogin }: LandingPageProps) {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 20px 60px" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "52px 0 36px" }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 16 }}>📜</div>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(38px, 8vw, 56px)",
          fontWeight: 700, color: "var(--navy)",
          letterSpacing: "4px", textTransform: "uppercase",
          lineHeight: 0.95, margin: "0 0 10px",
        }}>
          Daily Davar
        </h1>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 28, color: "var(--gold)", letterSpacing: "8px", marginBottom: 18,
        }}>
          דָּבָר
        </div>
        <p style={{
          fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75,
          maxWidth: 420, margin: "0 auto 32px",
          fontStyle: "italic",
        }}>
          A daily Jewish knowledge game tied to the Hebrew calendar.
          One question. Three levels. New every day.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onPlay}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--navy-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--navy)"; }}
            style={{
              background: "var(--navy)", color: "var(--gold-pale)",
              border: "none", borderRadius: 10,
              padding: "16px 36px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 18, fontWeight: 600, letterSpacing: "1px",
              cursor: "pointer", transition: "background 0.15s",
            }}
          >
            Play Today&apos;s Question →
          </button>
          <button
            onClick={onLogin}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.color = "var(--navy)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            style={{
              background: "none", border: "1.5px solid var(--border)",
              borderRadius: 10, padding: "16px 28px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16, fontWeight: 600, color: "var(--text-muted)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div style={{ width: 50, height: 1.5, background: "var(--gold)", margin: "0 auto 44px" }} />

      {/* ── Feature grid ──────────────────────────────────────────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 52 }}>
        {FEATURES.map((f) => (
          <div
            key={f.title}
            style={{
              background: "var(--card)", border: "1.5px solid var(--border)",
              borderRadius: 12, padding: "22px 18px", textAlign: "center",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{f.emoji}</div>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17, fontWeight: 700, color: "var(--navy)", marginBottom: 8,
            }}>
              {f.title}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, margin: 0 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </section>

      {/* ── Sample question ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: 52 }}>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 13, color: "var(--gold)", letterSpacing: "3px",
          textTransform: "uppercase", textAlign: "center", marginBottom: 18,
        }}>
          Sample Question
        </div>

        {/* Context */}
        <div style={{
          background: "var(--card)", border: "1.5px solid var(--border)",
          borderRadius: 10, padding: "14px 16px", marginBottom: 10,
          fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, fontStyle: "italic",
        }}>
          {SAMPLE.context}
        </div>

        {/* Question */}
        <div style={{
          background: "var(--card)", border: "1.5px solid var(--border)",
          borderRadius: 10, padding: "16px 18px", marginBottom: 12,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 20, fontWeight: 600, color: "var(--navy)",
        }}>
          {SAMPLE.question}
        </div>

        {/* Options (non-interactive preview) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SAMPLE.options.map((opt) => {
            const isAnswer = opt === SAMPLE.answer;
            return (
              <div
                key={opt}
                style={{
                  background: isAnswer ? "var(--correct-pale)" : "var(--card)",
                  border: `1.5px solid ${isAnswer ? "var(--correct)" : "var(--border)"}`,
                  borderRadius: 8, padding: "12px 16px",
                  fontSize: 14, color: isAnswer ? "var(--correct)" : "var(--text-muted)",
                  fontWeight: isAnswer ? 600 : 400,
                  display: "flex", alignItems: "center", gap: 10,
                }}
              >
                {isAnswer && <span>✓</span>}
                {opt}
              </div>
            );
          })}
        </div>

        <p style={{
          textAlign: "center", marginTop: 14,
          fontSize: 12, color: "var(--text-muted)", fontStyle: "italic",
        }}>
          Today&apos;s actual question is different — play to find out!
        </p>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center" }}>
        <div style={{ width: 50, height: 1.5, background: "var(--gold)", margin: "0 auto 28px" }} />
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 8,
        }}>
          Ready to test your knowledge?
        </div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 22 }}>
          Free to play. No account required to start.
        </p>
        <button
          onClick={onPlay}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--navy-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--navy)"; }}
          style={{
            background: "var(--navy)", color: "var(--gold-pale)",
            border: "none", borderRadius: 10,
            padding: "15px 40px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18, fontWeight: 600, letterSpacing: "1px",
            cursor: "pointer", transition: "background 0.15s",
          }}
        >
          Play Today →
        </button>
        <div style={{ marginTop: 16 }}>
          <a href="/pricing" style={{
            fontSize: 13, color: "var(--text-muted)",
            textDecoration: "underline", fontFamily: "Lora, Georgia, serif",
          }}>
            View membership plans
          </a>
        </div>
      </section>
    </div>
  );
}
