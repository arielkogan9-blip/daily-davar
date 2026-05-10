import { LetterStatus } from "@/lib/types";

const KB_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

const STATUS_STYLE: Record<LetterStatus, React.CSSProperties> = {
  correct: { background: "var(--correct)", color: "#fff" },
  present: { background: "var(--present)", color: "#fff" },
  absent: { background: "var(--absent)", color: "#ccc" },
};

type WordleKeyboardProps = {
  letterStatuses: Record<string, LetterStatus>;
  onKey: (key: string) => void;
};

export default function WordleKeyboard({ letterStatuses, onKey }: WordleKeyboardProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", width: "100%" }}>
      {KB_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 4 }}>
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "DEL";
            const status = letterStatuses[key];
            const statusStyle = status ? STATUS_STYLE[status] : {};

            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                style={{
                  minWidth: isWide ? 52 : 33,
                  height: 48,
                  background: "var(--border)",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: isWide ? 12 : 14,
                  fontWeight: 700,
                  color: "var(--text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 6px",
                  transition: "all 0.15s",
                  filter: "brightness(1)",
                  ...statusStyle,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.9)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
