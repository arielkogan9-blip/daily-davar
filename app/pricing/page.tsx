"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WaitlistModal from "@/components/modals/WaitlistModal";

// ─── Feature row ──────────────────────────────────────────────────────────────

function Feature({ text, included }: { text: string; included: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "5px 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <span style={{
        flexShrink: 0, fontSize: 14, fontWeight: 700,
        color: included ? "var(--correct)" : "var(--wrong)",
        lineHeight: "22px",
      }}>
        {included ? "✓" : "✗"}
      </span>
      <span style={{
        fontSize: 13, lineHeight: 1.6,
        color: included ? "var(--text)" : "var(--text-muted)",
        textDecoration: included ? "none" : "none",
      }}>
        {text}
      </span>
    </div>
  );
}

// ─── Price display ────────────────────────────────────────────────────────────

function Price({ main, sub }: { main: string; sub?: string }) {
  return (
    <div style={{ margin: "20px 0 24px" }}>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 36, fontWeight: 700, color: "var(--navy)", lineHeight: 1,
      }}>
        {main}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 5 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const router  = useRouter();
  const [waitlist, setWaitlist] = useState<"plus" | "scholar" | null>(null);

  const CTA_BTN = (primary: boolean): React.CSSProperties => ({
    width: "100%", padding: "14px",
    background: primary ? "var(--navy)" : "transparent",
    color: primary ? "var(--gold-pale)" : "var(--navy)",
    border: `1.5px solid ${primary ? "var(--navy)" : "var(--navy)"}`,
    borderRadius: 8,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 17, fontWeight: 600, letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "all 0.15s",
    marginTop: "auto",
  });

  return (
    <>
      {waitlist && (
        <WaitlistModal tier={waitlist} onClose={() => setWaitlist(null)} />
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 20px 80px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 46, fontWeight: 700, color: "var(--navy)",
            letterSpacing: "1px", lineHeight: 1.05, marginBottom: 14,
          }}>
            Simple, honest pricing
          </div>
          <p style={{
            fontSize: 16, color: "var(--text-muted)", lineHeight: 1.7,
            maxWidth: 520, margin: "0 auto",
          }}>
            Daily Davar is free forever for daily play. Premium tiers unlock deeper learning
            tools for students, educators, and Torah enthusiasts.
          </p>
        </div>

        {/* Cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20, alignItems: "start",
        }}>

          {/* ── FREE ── */}
          <div style={{
            background: "var(--card)",
            border: "1.5px solid var(--border)",
            borderRadius: 14,
            padding: "28px 24px",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 4,
            }}>
              Free
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", minHeight: 36 }}>
              Everything you need for daily Jewish learning.
            </div>
            <Price main="$0" sub="Forever — no credit card needed" />
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28, flex: 1 }}>
              <Feature text="All 3 difficulty levels (Aleph, Bet, Gimel)" included />
              <Feature text="Daily calendar-tied questions"                included />
              <Feature text="Streak tracking (browser only)"               included />
              <Feature text="Share results as emoji grid"                  included />
              <Feature text="Streak saved across devices"                  included={false} />
              <Feature text="Full question history and stats"              included={false} />
              <Feature text="Answer explanations"                          included={false} />
              <Feature text="Archive — replay any past puzzle"             included={false} />
              <Feature text="Classroom and group mode"                     included={false} />
            </div>
            <button
              style={CTA_BTN(false)}
              onClick={() => router.push("/")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--navy)";
                e.currentTarget.style.color = "var(--gold-pale)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--navy)";
              }}
            >
              Play Free →
            </button>
          </div>

          {/* ── PLUS ── */}
          <div style={{
            background: "var(--card)",
            border: "2px solid var(--gold)",
            borderRadius: 14,
            padding: "28px 24px",
            display: "flex", flexDirection: "column",
            position: "relative",
            boxShadow: "0 8px 32px rgba(184,137,30,0.12)",
          }}>
            {/* Most Popular badge */}
            <div style={{
              position: "absolute", top: -13, left: "50%",
              transform: "translateX(-50%)",
              background: "var(--gold)", color: "#fff",
              borderRadius: 999, padding: "4px 16px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.5px",
              whiteSpace: "nowrap",
            }}>
              ★ Most Popular
            </div>

            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 4,
            }}>
              Plus
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", minHeight: 36 }}>
              For learners who want to track and deepen their progress.
            </div>
            <Price main="$4/month" sub="or $40/year — save 2 months" />
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28, flex: 1 }}>
              <Feature text="Everything in Free"                   included />
              <Feature text="Streak saved across all devices"      included />
              <Feature text="Full question history (90 days)"      included />
              <Feature text="Answer explanations for every question" included />
              <Feature text="Stats dashboard with win-rate charts" included />
              <Feature text="Archive — replay any past puzzle"      included={false} />
              <Feature text="Classroom and group mode"             included={false} />
              <Feature text="Weekly printable digest"              included={false} />
            </div>
            <button
              style={{ ...CTA_BTN(true), background: "var(--gold)", borderColor: "var(--gold)" }}
              onClick={() => setWaitlist("plus")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#A07818";
                e.currentTarget.style.borderColor = "#A07818";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--gold)";
                e.currentTarget.style.borderColor = "var(--gold)";
              }}
            >
              Upgrade to Plus →
            </button>
          </div>

          {/* ── SCHOLAR ── */}
          <div style={{
            background: "var(--navy)",
            border: "1.5px solid var(--navy)",
            borderRadius: 14,
            padding: "28px 24px",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24, fontWeight: 700, color: "var(--gold)", marginBottom: 4,
            }}>
              Scholar
            </div>
            <div style={{ fontSize: 12, color: "var(--gold-pale)", opacity: 0.7, minHeight: 36 }}>
              For educators, rabbis, and serious Torah students.
            </div>
            <div style={{ margin: "20px 0 24px" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 36, fontWeight: 700, color: "var(--gold)", lineHeight: 1,
              }}>
                $10/month
              </div>
              <div style={{ fontSize: 12, color: "var(--gold-pale)", opacity: 0.65, marginTop: 5 }}>
                or $100/year — save 2 months
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 28, flex: 1 }}>
              {[
                "Everything in Plus",
                "Parasha context with every question",
                "Archive — replay any past puzzle",
                "Classroom and group leaderboard mode",
                "Weekly printable digest (21 questions)",
                "Topic suggestion submissions",
              ].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ flexShrink: 0, fontSize: 14, fontWeight: 700, color: "var(--gold)", lineHeight: "22px" }}>✓</span>
                  <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--gold-pale)", opacity: 0.9 }}>{text}</span>
                </div>
              ))}
            </div>
            <button
              style={{
                width: "100%", padding: "14px",
                background: "transparent", color: "var(--gold)",
                border: "1.5px solid var(--gold)", borderRadius: 8,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 17, fontWeight: 600, letterSpacing: "0.5px",
                cursor: "pointer", transition: "all 0.15s", marginTop: "auto",
              }}
              onClick={() => setWaitlist("scholar")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--gold)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--gold)";
              }}
            >
              Upgrade to Scholar →
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: "center", fontSize: 12, color: "var(--text-muted)",
          marginTop: 40, lineHeight: 1.7,
        }}>
          Plus and Scholar memberships are launching soon. Join the waitlist to be notified first.
          <br />
          All tiers include access to all 1,200+ questions in the daily rotation.
        </p>
      </div>
    </>
  );
}
