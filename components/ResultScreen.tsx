"use client";

import { useState } from "react";
import { Question, Attempt, Difficulty, WordleCell } from "@/lib/types";
import { generateShareText, shareResult } from "@/lib/share";
import WordleGrid from "@/components/game/WordleGrid";

type ResultScreenProps = {
  question: Question;
  attempts: Attempt[];
  won: boolean;
  streak: number;
  difficulty: Difficulty;
  wordleRows: WordleCell[][];
  hintShown: boolean;
  onBackToHome: () => void;
};

const STAT_CARD: React.CSSProperties = {
  flex: 1,
  background: "#fff",
  border: "1.5px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 16,
  textAlign: "center",
};

export default function ResultScreen({
  question,
  attempts,
  won,
  streak,
  difficulty,
  wordleRows,
  hintShown,
  onBackToHome,
}: ResultScreenProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = generateShareText(
      difficulty,
      attempts,
      won,
      wordleRows,
      hintShown,
      question.type,
    );
    await shareResult(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const wordLen = question.answer.replace(/\s/g, "").length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: 540,
        margin: "0 auto",
        padding: "40px 16px",
        gap: 20,
      }}
    >
      {/* Row 1 — Trophy/book emoji */}
      <div className="animate-pop-in" style={{ fontSize: 52, lineHeight: 1 }}>
        {won ? "🏆" : "📖"}
      </div>

      {/* Row 2 — Title */}
      <div
        className="animate-fade-up"
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 34,
          fontWeight: 700,
          color: "var(--navy)",
          textAlign: "center",
        }}
      >
        {won ? "Well done!" : "Keep learning"}
      </div>

      {/* Row 3 — Message */}
      <p
        style={{
          fontSize: 15,
          color: "var(--text-muted)",
          textAlign: "center",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {won ? (
          <>
            You answered correctly in {attempts.length}{" "}
            {attempts.length === 1 ? "attempt" : "attempts"}!
          </>
        ) : (
          <>
            The correct answer was:{" "}
            <strong style={{ color: "var(--navy)" }}>{question.answer}</strong>
          </>
        )}
      </p>

      {/* Row 4 — Wordle grid replay */}
      {question.type === "wordle" && wordleRows.length > 0 && (
        <div style={{ pointerEvents: "none" }}>
          <WordleGrid
            completedRows={wordleRows}
            currentRow={[]}
            wordLength={wordLen}
            maxAttempts={5}
            gameOver={true}
          />
        </div>
      )}

      {/* Row 5 — Answer card */}
      <div
        style={{
          background: "var(--navy)",
          borderRadius: "var(--radius)",
          padding: 16,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--gold-pale)",
            opacity: 0.8,
            marginBottom: 6,
          }}
        >
          Today&apos;s Answer
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: "var(--gold)",
          }}
        >
          {question.answer}
        </div>
      </div>

      {/* Row 6 — Stats row */}
      <div style={{ display: "flex", gap: 12, width: "100%" }}>
        <div style={STAT_CARD}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 34,
              fontWeight: 700,
              color: "var(--navy)",
            }}
          >
            {won ? attempts.length : "X"}
          </div>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Attempts
          </div>
        </div>
        <div style={STAT_CARD}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 34,
              fontWeight: 700,
              color: "var(--navy)",
            }}
          >
            {streak}
          </div>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Streak 🔥
          </div>
        </div>
      </div>

      {/* Row 7 — Share button */}
      <button
        onClick={handleShare}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#A07818";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--gold)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        style={{
          width: "100%",
          background: "var(--gold)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "16px 0",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "1px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          transition: "all 0.15s",
        }}
      >
        {copied ? "✓ Copied!" : "📤 Share Result"}
      </button>

      {/* Row 8 — Back button */}
      <button
        onClick={onBackToHome}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--navy)";
          e.currentTarget.style.color = "var(--navy)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.color = "var(--text-muted)";
        }}
        style={{
          width: "100%",
          background: "none",
          border: "1.5px solid var(--border)",
          borderRadius: 8,
          padding: "12px 0",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 16,
          color: "var(--text-muted)",
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        ← Back to home
      </button>
    </div>
  );
}
