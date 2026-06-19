"use client";

import { useState, useEffect } from "react";
import { Difficulty } from "@/lib/types";
import { getHebrewDateString } from "@/lib/jewishDate";

// ─── Jerusalem midnight countdown ─────────────────────────────────────────────

function getSecondsUntilJerusalemMidnight(): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jerusalem",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const get = (t: string) =>
      parseInt(parts.find((p) => p.type === t)?.value ?? "0", 10);
    const elapsed = get("hour") * 3600 + get("minute") * 60 + get("second");
    return Math.max(0, 86400 - elapsed);
  } catch {
    return 0;
  }
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function CountdownTimer() {
  const [secs, setSecs] = useState(getSecondsUntilJerusalemMidnight);

  useEffect(() => {
    const id = setInterval(() => setSecs(getSecondsUntilJerusalemMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 10,
        fontSize: 12,
        color: "var(--text-muted)",
        fontStyle: "italic",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontStyle: "normal" }}>⏳</span>
      <span>
        New questions in{" "}
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 14,
            fontWeight: 600,
            fontStyle: "normal",
            color: "var(--navy)",
            letterSpacing: "0.5px",
          }}
        >
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
      </span>
      <span style={{ color: "var(--border-dark)" }}>·</span>
      <span>resets midnight Jerusalem time</span>
    </div>
  );
}

type HomeScreenProps = {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onHowToPlay: () => void;
  /** Which difficulties have been completed today — used for unlock gating. */
  todayCompleted?: Partial<Record<Difficulty, boolean>>;
};

const difficulties: {
  level: Difficulty;
  letter: string;
  letterColor: string;
  name: string;
  subtitle: string;
  desc: string;
}[] = [
  {
    level: "easy",
    letter: "א",
    letterColor: "#2E7A50",
    name: "Aleph",
    subtitle: "Beginner",
    desc: "Multiple choice, weekly parasha & holidays",
  },
  {
    level: "medium",
    letter: "ב",
    letterColor: "#B8891E",
    name: "Bet",
    subtitle: "Intermediate",
    desc: "Word guessing & short answers across Jewish texts",
  },
  {
    level: "hard",
    letter: "ג",
    letterColor: "#8B1A1A",
    name: "Gimel",
    subtitle: "Advanced",
    desc: "In-depth questions for scholars, educators & rabbis",
  },
];

const todayFormatted = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function HomeScreen({ onSelectDifficulty, onHowToPlay, todayCompleted }: HomeScreenProps) {
  const hebrewDate = getHebrewDateString();

  // Difficulty unlock: Medium requires Easy done; Hard requires Medium done
  const easyDone   = !!todayCompleted?.easy;
  const mediumDone = !!todayCompleted?.medium;
  const isLocked: Partial<Record<Difficulty, string>> = {
    medium: easyDone   ? undefined : "Complete Aleph (Easy) first",
    hard:   mediumDone ? undefined : "Complete Bet (Medium) first",
  };

  return (
    <div
      style={{
        maxWidth: 540,
        width: "100%",
        margin: "0 auto",
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Section 1 — Hero */}
      <section
        style={{
          textAlign: "center",
          paddingTop: 40,
          paddingBottom: 28,
          width: "100%",
        }}
      >
        <div style={{ fontSize: 44, lineHeight: 1 }}>📜</div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 52,
            fontWeight: 700,
            color: "var(--navy)",
            letterSpacing: "4px",
            textTransform: "uppercase",
            lineHeight: 0.95,
            marginTop: 12,
          }}
        >
          Daily Davar
        </div>

        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 26,
            color: "var(--gold)",
            letterSpacing: "8px",
            marginTop: 6,
          }}
        >
          דָּבָר
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
            fontSize: 13,
            color: "var(--text-muted)",
            fontStyle: "italic",
            flexWrap: "wrap",
          }}
        >
          <span>{todayFormatted}</span>
          <span style={{ color: "var(--border-dark)" }}>·</span>
          <span dir="rtl">{hebrewDate}</span>
        </div>
        <CountdownTimer />
      </section>

      {/* Section 2 — Divider */}
      <div
        style={{
          width: 50,
          height: 1.5,
          background: "var(--gold)",
          margin: "24px auto",
        }}
      />

      {/* Section 3 — Difficulty picker */}
      <section style={{ width: "100%" }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--navy)",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Choose your level of study
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {difficulties.map(({ level, letter, letterColor, name, subtitle, desc }) => (
            <DifficultyCard
              key={level}
              letter={letter}
              letterColor={letterColor}
              name={name}
              subtitle={subtitle}
              desc={desc}
              locked={isLocked[level]}
              onClick={() => {
                if (isLocked[level]) return;
                onSelectDifficulty(level);
              }}
            />
          ))}
        </div>
      </section>

      {/* Section 4 — How to play */}
      <div style={{ marginTop: 28, marginBottom: 24 }}>
        <HowToPlayButton onClick={onHowToPlay} />
      </div>
    </div>
  );
}

function DifficultyCard({
  letter,
  letterColor,
  name,
  subtitle,
  desc,
  locked,
  onClick,
}: {
  letter: string;
  letterColor: string;
  name: string;
  subtitle: string;
  desc: string;
  locked?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={locked}
      onMouseEnter={(e) => {
        if (locked) return;
        const el = e.currentTarget;
        el.style.borderColor = "var(--navy)";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 6px 20px rgba(24, 40, 90, 0.1)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = locked ? "var(--border)" : "var(--border)";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
      style={{
        background: locked ? "var(--bg)" : "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "20px 12px 16px",
        cursor: locked ? "not-allowed" : "pointer",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        transition: "all 0.2s",
        transform: "translateY(0)",
        boxShadow: "none",
        opacity: locked ? 0.55 : 1,
        position: "relative",
      }}
    >
      {locked && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "var(--radius)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(250,245,236,0.7)",
          zIndex: 1, gap: 4, padding: "0 8px",
        }}>
          <span style={{ fontSize: 20 }}>🔒</span>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>
            {locked}
          </span>
        </div>
      )}
      <span
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 36,
          fontWeight: 700,
          color: letterColor,
          lineHeight: 1,
        }}
      >
        {letter}
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--navy)",
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          color: "var(--text-muted)",
        }}
      >
        {subtitle}
      </span>
      <span
        style={{
          fontSize: 11,
          fontStyle: "italic",
          color: "var(--text-muted)",
          lineHeight: 1.5,
        }}
      >
        {desc}
      </span>
    </button>
  );
}

function HowToPlayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "var(--navy)";
        el.style.color = "var(--navy)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "var(--border)";
        el.style.color = "var(--text-muted)";
      }}
      style={{
        background: "transparent",
        border: "1.5px solid var(--border)",
        borderRadius: 8,
        padding: "8px 20px",
        fontFamily: "Lora, Georgia, serif",
        fontSize: 13,
        color: "var(--text-muted)",
        cursor: "pointer",
        transition: "border-color 0.2s, color 0.2s",
      }}
    >
      ? How to Play
    </button>
  );
}
