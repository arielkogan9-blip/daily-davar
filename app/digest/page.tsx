"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type DigestQuestion = {
  question:     string;
  answer:       string;
  explanation?: string;
  parasha:      string;
  hint:         string;
  context:      string;
};

type DayRow = {
  date:     string;
  isFuture: boolean;
  easy:     DigestQuestion | null;
  medium:   DigestQuestion | null;
  hard:     DigestQuestion | null;
};

type DigestData = {
  weekRange: { start: string; end: string };
  parasha:   string;
  days:      DayRow[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtShort(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function fmtRange(start: string, end: string) {
  const s = new Date(start + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const e = new Date(end   + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `${s} – ${e}`;
}

const DIFF_META = {
  easy:   { label: "א Aleph — Easy",    color: "var(--correct)", pale: "var(--correct-pale)" },
  medium: { label: "ב Bet — Medium",    color: "var(--gold)",    pale: "var(--gold-muted)"   },
  hard:   { label: "ג Gimel — Advanced",color: "var(--wrong)",   pale: "var(--wrong-pale)"   },
} as const;

// ─── Answer toggle ────────────────────────────────────────────────────────────

function QuestionRow({ q, date, diff }: { q: DigestQuestion; date: string; diff: keyof typeof DIFF_META }) {
  const [open, setOpen] = useState(false);
  const meta = DIFF_META[diff];

  return (
    <div className="digest-q" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>{fmtShort(date)}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{q.parasha}</span>
      </div>
      <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 14, color: "var(--text)", lineHeight: 1.6, marginBottom: 8 }}>
        {q.question}
      </div>
      <button
        className="no-print"
        onClick={() => setOpen((o) => !o)}
        style={{
          background: "none", border: "none", padding: 0,
          fontSize: 12, color: meta.color, cursor: "pointer",
          fontFamily: "Lora, Georgia, serif",
        }}
      >
        {open ? "▲ Hide answer" : "▼ Reveal answer"}
      </button>
      <div className={open ? "answer-block" : "answer-block answer-hidden"} style={{ marginTop: open ? 8 : 0 }}>
        <div style={{
          background: meta.pale, borderLeft: `3px solid ${meta.color}`,
          borderRadius: "0 6px 6px 0", padding: "10px 12px",
          fontFamily: "Lora, Georgia, serif", fontSize: 13,
        }}>
          <span style={{ fontWeight: 700, color: meta.color }}>Answer: </span>
          <span style={{ color: "var(--text)" }}>{q.answer}</span>
        </div>
        {q.explanation && (
          <div style={{ marginTop: 6, padding: "8px 12px", background: "var(--bg)", borderRadius: 6, fontSize: 12, lineHeight: 1.7, color: "var(--text-muted)", fontStyle: "italic" }}>
            {q.explanation}
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
      <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
        Weekly Digest
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
        The Weekly Digest compiles all 21 questions from the past 7 days across every difficulty level — perfect for teaching, review, or Shabbat table discussion. Available to Scholar members.
      </p>
      <a href="/pricing" style={{
        display: "inline-block", background: "var(--navy)", color: "var(--gold-pale)",
        borderRadius: 8, padding: "14px 32px",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18, fontWeight: 600, letterSpacing: "1px", textDecoration: "none",
      }}>
        Upgrade to Scholar →
      </a>
    </div>
  );
}

// ─── Suggestion form ──────────────────────────────────────────────────────────

function SuggestionForm() {
  const [text,    setText]    = useState("");
  const [email,   setEmail]   = useState("");
  const [state,   setState]   = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg,  setErrMsg]  = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setState("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/digest/suggest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), suggestion: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setState("error"); setErrMsg(data.error ?? "Failed to send."); return; }
      setState("sent");
    } catch {
      setState("error"); setErrMsg("Something went wrong. Please try again.");
    }
  }

  const INPUT: React.CSSProperties = {
    width: "100%", padding: "10px 13px",
    border: "1.5px solid var(--border)", borderRadius: 8,
    fontFamily: "Lora, Georgia, serif", fontSize: 13,
    color: "var(--text)", background: "var(--card)",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div className="no-print" style={{ marginTop: 48, borderTop: "1.5px solid var(--border)", paddingTop: 32 }}>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>
        Suggest a Topic
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.7 }}>
        Have a subject you&apos;d like to see covered in Daily Davar? We read every suggestion.
      </p>

      {state === "sent" ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✉️</div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 600, color: "var(--correct)" }}>
            Thank you! Your suggestion has been sent.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {errMsg && (
            <div style={{ background: "var(--wrong-pale)", border: "1px solid var(--wrong)", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "var(--wrong)" }}>
              {errMsg}
            </div>
          )}
          <textarea
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Describe your suggested topic, question, or area of Jewish study…"
            rows={4}
            style={{ ...INPUT, resize: "vertical" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
            required
          />
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email (optional — for a reply)"
            style={INPUT}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          <button
            type="submit" disabled={state === "sending" || !text.trim()}
            style={{
              background: "var(--navy)", color: "var(--gold-pale)", border: "none",
              borderRadius: 8, padding: 12,
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16, fontWeight: 600, letterSpacing: "1px",
              cursor: state === "sending" ? "not-allowed" : "pointer",
              opacity: !text.trim() || state === "sending" ? 0.5 : 1,
            }}
          >
            {state === "sending" ? "Sending…" : "Send Suggestion →"}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DigestPage() {
  const { data: session, status } = useSession();
  const router   = useRouter();
  const tier     = (session?.user as { tier?: string })?.tier ?? "free";
  const printRef = useRef<HTMLDivElement>(null);

  const [digest,  setDigest]  = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || tier !== "scholar") { setLoading(false); return; }
    fetch("/api/digest")
      .then((r) => r.json())
      .then((data) => { setDigest(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status, tier]);

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
      </div>
    );
  }

  if (tier !== "scholar") return <UpgradePrompt />;

  const DIFFS: (keyof typeof DIFF_META)[] = ["easy", "medium", "hard"];

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; font-size: 12pt; }
          .no-print { display: none !important; }
          .answer-hidden { display: block !important; }
          .answer-hidden .answer-block { display: block !important; }
          header, nav { display: none !important; }
          @page { size: A4; margin: 20mm 15mm; }
          .digest-section { page-break-inside: avoid; }
          .digest-q { page-break-inside: avoid; }
          * { color: #000 !important; background: #fff !important; border-color: #ccc !important; }
        }
        .answer-hidden .answer-block { display: none; }
        .answer-block { display: block; }
      `}</style>

      <div ref={printRef} style={{ maxWidth: 620, margin: "0 auto", padding: "36px 20px 60px" }}>
        {/* Print / Save button */}
        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button
            onClick={() => window.print()}
            style={{
              background: "var(--navy)", color: "var(--gold-pale)", border: "none",
              borderRadius: 8, padding: "10px 20px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            🖨️ Print / Save as PDF
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, color: "var(--gold)", letterSpacing: "4px", textTransform: "uppercase", marginBottom: 6 }}>
            Daily Davar
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 36, fontWeight: 700, color: "var(--navy)", lineHeight: 1.1, marginBottom: 10 }}>
            Weekly Digest
          </div>
          {digest && (
            <>
              <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                {fmtRange(digest.weekRange.start, digest.weekRange.end)}
              </div>
              <div style={{ marginTop: 8, display: "inline-block", background: "var(--gold-muted)", color: "var(--gold)", borderRadius: 999, padding: "3px 14px", fontSize: 12, fontWeight: 600, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {digest.parasha}
              </div>
            </>
          )}
          <div style={{ width: 50, height: 1.5, background: "var(--gold)", margin: "20px auto 0" }} />
        </div>

        {/* Three difficulty sections */}
        {DIFFS.map((diff) => {
          const meta = DIFF_META[diff];
          const questions = digest?.days.filter((d) => !d.isFuture && d[diff] !== null) ?? [];

          return (
            <div key={diff} className="digest-section" style={{ marginBottom: 40 }}>
              {/* Section header */}
              <div style={{
                background: "var(--navy)", borderRadius: "10px 10px 0 0",
                padding: "14px 20px", display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: meta.color }}>
                  {meta.label}
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 11, color: "var(--gold-pale)", opacity: 0.65 }}>
                  {questions.length} question{questions.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div style={{ border: "1.5px solid var(--border)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "20px 20px 6px" }}>
                {questions.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic", paddingBottom: 14 }}>
                    No questions available yet for this section this week.
                  </p>
                ) : (
                  questions.map((day) => {
                    const q = day[diff];
                    if (!q) return null;
                    return <QuestionRow key={day.date} q={q} date={day.date} diff={diff} />;
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* Suggestion form */}
        <SuggestionForm />
      </div>
    </>
  );
}
