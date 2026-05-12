"use client";

import { useState } from "react";

// ─── Key-point parser ────────────────────────────────────────────────────────
// Breaks a model answer into display bullets. Handles several common formats
// used in the question bank (numbered lists, semicolons, plain sentences).

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseKeyPoints(answer: string): string[] {
  const s = answer.trim();

  // (1) ... (2) ... numbered format
  const numbered = s.match(/\(\d+\)[^(]{8,}/g);
  if (numbered && numbered.length >= 2) {
    return numbered
      .map((p) => capitalize(p.replace(/^\(\d+\)\s*/, "").replace(/;\s*$/, "").trim()))
      .filter(Boolean);
  }

  // Semicolon-separated list
  if (s.includes("; ")) {
    const parts = s.split("; ").filter((p) => p.trim().length > 6);
    if (parts.length >= 2) return parts.map((p) => capitalize(p.trim().replace(/[.;]$/, "")));
  }

  // Em-dash separated (used in some answers)
  if ((s.match(/\s—\s/g) ?? []).length >= 2) {
    const parts = s.split(/\s—\s/).filter((p) => p.trim().length > 6);
    if (parts.length >= 2) return parts.map((p) => capitalize(p.trim().replace(/[.;]$/, "")));
  }

  // Split on ". " at sentence boundaries
  const sentences = s
    .split(/\.\s+(?=[A-Z"(])/)
    .map((p) => capitalize(p.trim().replace(/\.$/, "")))
    .filter((p) => p.length > 10);
  if (sentences.length >= 2) return sentences;

  // Fallback — single bullet
  return [capitalize(s)];
}

// ─── Component ────────────────────────────────────────────────────────────────

type TextBoxProps = {
  /** Called when a normal (short-answer) question is submitted. */
  onSubmit: (answer: string) => void;
  /**
   * Called for open-ended questions after the user has reviewed the model
   * answer and decided whether they got it right.
   */
  onSelfGrade?: (correct: boolean, userText: string) => void;
  /**
   * When provided the component switches to "open-ended / self-grade" mode:
   * the user types their answer, submits, sees the model answer as key points,
   * and then self-grades with one click.
   */
  modelAnswer?: string;
  gameOver: boolean;
};

type Phase = "input" | "reviewing";

export default function TextBox({
  onSubmit,
  onSelfGrade,
  modelAnswer,
  gameOver,
}: TextBoxProps) {
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [savedInput, setSavedInput] = useState("");

  const isOpenEnded = !!modelAnswer && !!onSelfGrade;

  // ── submit handler ────────────────────────────────────────────────────────
  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || gameOver) return;

    if (isOpenEnded) {
      // Switch to review phase — don't call onSubmit yet
      setSavedInput(trimmed);
      setValue("");
      setPhase("reviewing");
    } else {
      onSubmit(trimmed);
      setValue("");
    }
  }

  // ── self-grade handlers ───────────────────────────────────────────────────
  function handleKnewIt() {
    onSelfGrade!(true, savedInput);
  }

  function handleDidntKnow() {
    onSelfGrade!(false, savedInput);
  }

  const canSubmit = !!value.trim() && !gameOver;
  const keyPoints = modelAnswer ? parseKeyPoints(modelAnswer) : [];

  // ── REVIEW PHASE ──────────────────────────────────────────────────────────
  if (phase === "reviewing" && isOpenEnded) {
    return (
      <div
        style={{
          width: "100%",
          background: "var(--navy)",
          borderRadius: "var(--radius)",
          padding: "20px 20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--gold)",
            opacity: 0.85,
          }}
        >
          📖 Model Answer
        </div>

        {/* Key points */}
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {keyPoints.map((point, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  color: "var(--gold)",
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.55,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                •
              </span>
              <span
                style={{
                  fontFamily: "Lora, Georgia, serif",
                  fontSize: 14,
                  color: "var(--gold-pale)",
                  lineHeight: 1.55,
                }}
              >
                {point}
              </span>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 2 }}
        />

        {/* Prompt */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 15,
            fontStyle: "italic",
            color: "var(--gold-pale)",
            opacity: 0.75,
            textAlign: "center",
          }}
        >
          How did you do?
        </div>

        {/* Self-grade buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleKnewIt}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--correct)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(52,168,83,0.18)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            style={{
              flex: 1,
              background: "rgba(52,168,83,0.18)",
              color: "#6fcf97",
              border: "1.5px solid rgba(52,168,83,0.35)",
              borderRadius: 8,
              padding: "13px 8px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ✓ I knew it
          </button>

          <button
            onClick={handleDidntKnow}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(220,53,69,0.28)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(220,53,69,0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            style={{
              flex: 1,
              background: "rgba(220,53,69,0.15)",
              color: "#f28b82",
              border: "1.5px solid rgba(220,53,69,0.3)",
              borderRadius: 8,
              padding: "13px 8px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            ✗ I didn&apos;t know
          </button>
        </div>
      </div>
    );
  }

  // ── INPUT PHASE ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        disabled={gameOver}
        placeholder={isOpenEnded ? "Write your answer, then see the key points…" : "Type your answer…"}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--navy)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "1.5px solid var(--border)",
          borderRadius: 8,
          fontFamily: "Lora, Georgia, serif",
          fontSize: 15,
          color: "var(--text)",
          background: "#fff",
          outline: "none",
          transition: "border-color 0.15s",
          opacity: gameOver ? 0.6 : 1,
          cursor: gameOver ? "not-allowed" : "text",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        onMouseEnter={(e) => {
          if (!canSubmit) return;
          e.currentTarget.style.background = "var(--navy-hover)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--navy)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
        style={{
          width: "100%",
          background: "var(--navy)",
          color: "var(--gold-pale)",
          border: "none",
          borderRadius: 8,
          padding: 14,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "1px",
          cursor: canSubmit ? "pointer" : "not-allowed",
          opacity: canSubmit ? 1 : 0.45,
          transition: "all 0.15s",
        }}
      >
        {isOpenEnded ? "Submit & See Answer" : "Submit Answer"}
      </button>
    </div>
  );
}
