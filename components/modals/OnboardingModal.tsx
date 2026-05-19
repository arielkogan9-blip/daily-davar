"use client";

import { useState } from "react";

const STEPS = [
  {
    emoji: "📜",
    title: "Welcome to Daily Davar",
    subtitle: "דָּבָר — A word of Torah, every day",
    body: "Daily Davar is a daily Jewish knowledge game tied to the Hebrew calendar. Each day brings a fresh question drawn from the current parasha, holiday, or season.",
  },
  {
    emoji: "🎯",
    title: "How it works",
    subtitle: "Three levels, one question each",
    bullets: [
      "Choose your level — Aleph (Easy), Bet (Medium), or Gimel (Advanced)",
      "Read the context card, then answer the question",
      "Get it right to grow your 🔥 streak — questions reset at midnight Jerusalem time",
    ],
  },
  {
    emoji: "⭐",
    title: "Ready to begin?",
    subtitle: "Pick a difficulty and play today's question",
    body: "You can play all three levels each day. Sign in to save your streak across devices. Good luck!",
  },
];

type Props = { onClose: () => void };

export default function OnboardingModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function dismiss() {
    if (typeof window !== "undefined") {
      localStorage.setItem("dd_onboarded", "1");
    }
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        className="phase-enter"
        style={{
          background: "var(--bg)",
          borderRadius: 16,
          maxWidth: 400, width: "100%",
          padding: "32px 28px 28px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 16, textAlign: "center",
        }}
      >
        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, alignSelf: "center" }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 20 : 7,
                height: 7,
                borderRadius: 99,
                background: i === step ? "var(--navy)" : "var(--border)",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 52, lineHeight: 1 }}>{current.emoji}</div>

        {/* Title */}
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 26, fontWeight: 700, color: "var(--navy)", lineHeight: 1.2,
        }}>
          {current.title}
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 15, color: "var(--gold)", fontStyle: "italic",
        }}>
          {current.subtitle}
        </div>

        {/* Body / bullets */}
        {"bullets" in current ? (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
            {current.bullets!.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--gold)", fontWeight: 700, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{b}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
            {current.body}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 6 }}>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                flex: 1, padding: "12px 0",
                background: "none", border: "1.5px solid var(--border)",
                borderRadius: 8, cursor: "pointer",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 15, color: "var(--text-muted)",
              }}
            >
              ← Back
            </button>
          )}
          <button
            onClick={isLast ? dismiss : () => setStep((s) => s + 1)}
            style={{
              flex: 1, padding: "12px 0",
              background: "var(--navy)", border: "none",
              borderRadius: 8, cursor: "pointer",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16, fontWeight: 600, color: "var(--gold-pale)",
              letterSpacing: "0.5px",
            }}
          >
            {isLast ? "Let's Play →" : "Next →"}
          </button>
        </div>

        {/* Skip */}
        <button
          onClick={dismiss}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, color: "var(--text-muted)",
            textDecoration: "underline", fontFamily: "Lora, Georgia, serif",
          }}
        >
          Skip tutorial
        </button>
      </div>
    </div>
  );
}
