"use client";

import { useState } from "react";

type TextBoxProps = {
  onSubmit: (answer: string) => void;
  gameOver: boolean;
};

export default function TextBox({ onSubmit, gameOver }: TextBoxProps) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || gameOver) return;
    onSubmit(trimmed);
    setValue("");
  }

  const canSubmit = !!value.trim() && !gameOver;

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
        placeholder="Type your answer…"
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
        Submit Answer
      </button>
    </div>
  );
}
