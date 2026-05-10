type HintPanelProps = {
  visible: boolean;
  hintText: string;
  hintShown: boolean;
  onReveal: () => void;
};

export default function HintPanel({ visible, hintText, hintShown, onReveal }: HintPanelProps) {
  if (!visible) return null;

  if (!hintShown) {
    return (
      <button
        onClick={onReveal}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gold-muted)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        style={{
          width: "100%",
          background: "transparent",
          border: "1.5px dashed var(--gold)",
          borderRadius: 8,
          padding: "10px 0",
          fontFamily: "Lora, Georgia, serif",
          fontSize: 13,
          color: "var(--gold)",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        💡 Reveal Hint
      </button>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        background: "var(--gold-muted)",
        border: "1px solid var(--gold)",
        borderRadius: 8,
        padding: "12px 14px",
        fontFamily: "Lora, Georgia, serif",
        fontSize: 13,
        fontStyle: "italic",
        color: "#7A5810",
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      <span style={{ flexShrink: 0 }}>💡</span>
      <span>{hintText}</span>
    </div>
  );
}
