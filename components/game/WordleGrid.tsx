import { LetterStatus } from "@/lib/types";

type CompletedCell = { char: string; status: LetterStatus };

type WordleGridProps = {
  completedRows: CompletedCell[][];
  currentRow: string[];
  wordLength: number;
  maxAttempts: number;
  gameOver: boolean;
};

const STATUS_STYLE: Record<LetterStatus, React.CSSProperties> = {
  correct: { background: "var(--correct)", borderColor: "var(--correct)", color: "#fff" },
  present: { background: "var(--present)", borderColor: "var(--present)", color: "#fff" },
  absent: { background: "var(--absent)", borderColor: "var(--absent)", color: "#fff" },
};

const CELL_BASE: React.CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: 6,
  border: "1.5px solid",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 22,
  fontWeight: 700,
  textTransform: "uppercase",
  transition: "background 0.25s, border-color 0.25s, color 0.25s",
};

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 6 }}>{children}</div>;
}

export default function WordleGrid({
  completedRows,
  currentRow,
  wordLength,
  maxAttempts,
  gameOver,
}: WordleGridProps) {
  const showCurrentRow = !gameOver && completedRows.length < maxAttempts;
  const emptyRowCount = maxAttempts - completedRows.length - (showCurrentRow ? 1 : 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
      {/* Completed rows */}
      {completedRows.map((row, ri) => (
        <Row key={ri}>
          {row.map((cell, ci) => (
            <div
              key={ci}
              style={{
                ...CELL_BASE,
                borderColor: "transparent",
                ...STATUS_STYLE[cell.status],
              }}
            >
              {cell.char}
            </div>
          ))}
        </Row>
      ))}

      {/* Current input row */}
      {showCurrentRow && (
        <Row>
          {Array.from({ length: wordLength }).map((_, ci) => {
            const letter = currentRow[ci];
            return (
              <div
                key={ci}
                style={{
                  ...CELL_BASE,
                  borderColor: letter ? "var(--border-dark)" : "var(--border)",
                  color: letter ? "var(--text)" : "transparent",
                  background: "#fff",
                }}
              >
                {letter ?? ""}
              </div>
            );
          })}
        </Row>
      )}

      {/* Empty remaining rows */}
      {Array.from({ length: Math.max(0, emptyRowCount) }).map((_, ri) => (
        <Row key={`empty-${ri}`}>
          {Array.from({ length: wordLength }).map((_, ci) => (
            <div
              key={ci}
              style={{
                ...CELL_BASE,
                borderColor: "var(--border)",
                background: "#fff",
                color: "transparent",
              }}
            />
          ))}
        </Row>
      ))}
    </div>
  );
}
