"use client";

import { useState } from "react";

const LETTERS = ["A", "B", "C", "D", "E"];

type MultipleChoiceProps = {
  options: string[];
  answer: string;
  gameOver: boolean;
  onSubmit: (answer: string) => void;
};

export default function MultipleChoice({ options, answer, gameOver, onSubmit }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  function handleSubmit() {
    if (!selected || gameOver) return;
    onSubmit(selected);
    setSelected(null);
  }

  const canSubmit = !!selected && !gameOver;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {options.map((option, i) => {
        const isSelected = selected === option;
        const isHovered = hoveredIndex === i;
        const isDisabled = gameOver;

        const borderColor = isSelected
          ? "var(--navy)"
          : isHovered && !isDisabled
          ? "var(--gold)"
          : "var(--border)";

        const bg = isSelected
          ? "rgba(24, 40, 90, 0.05)"
          : isHovered && !isDisabled
          ? "var(--gold-muted)"
          : "#fff";

        const circleBg = isSelected ? "var(--navy)" : "var(--bg)";
        const circleColor = isSelected ? "#fff" : "var(--text)";
        const circleBorder = isSelected ? "var(--navy)" : "var(--border)";

        return (
          <button
            key={option}
            onClick={() => !isDisabled && setSelected(option)}
            onMouseEnter={() => !isDisabled && setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            disabled={isDisabled}
            style={{
              width: "100%",
              background: bg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 8,
              padding: "12px 16px",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontFamily: "Lora, Georgia, serif",
              fontSize: 15,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.15s",
              opacity: isDisabled ? 0.6 : 1,
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: circleBg,
                border: `1px solid ${circleBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 14,
                fontWeight: 700,
                color: circleColor,
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {LETTERS[i]}
            </span>
            <span style={{ color: "var(--text)" }}>{option}</span>
          </button>
        );
      })}

      {/* Submit button */}
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
          marginTop: 4,
          background: "var(--navy)",
          color: "var(--gold-pale)",
          border: "none",
          borderRadius: 8,
          padding: "14px",
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
