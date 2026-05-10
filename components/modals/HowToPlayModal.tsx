"use client";

type HowToPlayModalProps = {
  onClose: () => void;
};

const SECTION_TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  fontSize: 15,
  fontWeight: 600,
  color: "var(--navy)",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: 7,
};

const BODY_STYLE: React.CSSProperties = {
  fontSize: 13,
  lineHeight: 1.75,
  color: "var(--text-muted)",
};

const SECTION_GAP = 20;

type CellVariant = "correct" | "present" | "absent" | "blank";

function WordleCell({ letter, variant }: { letter: string; variant: CellVariant }) {
  const styles: Record<CellVariant, React.CSSProperties> = {
    correct: {
      background: "var(--correct)",
      borderColor: "var(--correct)",
      color: "#fff",
    },
    present: {
      background: "var(--present)",
      borderColor: "var(--present)",
      color: "#fff",
    },
    absent: {
      background: "var(--absent)",
      borderColor: "var(--absent)",
      color: "#fff",
    },
    blank: {
      background: "#fff",
      borderColor: "var(--border)",
      color: "var(--text)",
    },
  };

  return (
    <div
      style={{
        width: 40,
        height: 40,
        border: "1.5px solid",
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18,
        fontWeight: 700,
        ...styles[variant],
      }}
    >
      {letter}
    </div>
  );
}

function WordleExample({
  cells,
  note,
}: {
  cells: { letter: string; variant: CellVariant }[];
  note: string;
}) {
  return (
    <div style={{ marginTop: 10, marginBottom: 10 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {cells.map((c, i) => (
          <WordleCell key={i} letter={c.letter} variant={c.variant} />
        ))}
      </div>
      <div style={{ ...BODY_STYLE, marginTop: 5 }}>{note}</div>
    </div>
  );
}

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 14,
          padding: "28px 26px",
          maxWidth: 460,
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--text-muted)",
            lineHeight: 1,
            padding: 0,
          }}
        >
          ✕
        </button>

        {/* Title */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--navy)",
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          How to Play
        </div>

        {/* Section 1 — Intro */}
        <p style={BODY_STYLE}>
          A new Jewish knowledge challenge every day, tied to the Jewish calendar. Read the
          context, then answer the question. New puzzle at midnight Jerusalem time.
        </p>

        {/* Section 2 — Difficulty Levels */}
        <div style={{ marginTop: SECTION_GAP }}>
          <div style={SECTION_TITLE_STYLE}>Difficulty Levels</div>
          <div style={BODY_STYLE}>
            <strong>א Aleph (Beginner)</strong> — Multiple choice. Accessible to everyone.
            <br />
            <br />
            <strong>ב Bet (Intermediate)</strong> — Word guessing or short answer. Solid Torah
            and Jewish knowledge needed.
            <br />
            <br />
            <strong>ג Gimel (Advanced)</strong> — Open text answer. For educators, rabbis, and
            advanced students.
          </div>
        </div>

        {/* Section 3 — Word Guessing */}
        <div style={{ marginTop: SECTION_GAP }}>
          <div style={SECTION_TITLE_STYLE}>Word Guessing — Bet Level</div>
          <p style={BODY_STYLE}>Guess the answer letter by letter. You have 5 tries.</p>

          <WordleExample
            cells={[
              { letter: "E", variant: "correct" },
              { letter: "M", variant: "blank" },
              { letter: "O", variant: "blank" },
              { letter: "R", variant: "blank" },
            ]}
            note="🟩 E is in the correct position."
          />
          <WordleExample
            cells={[
              { letter: "N", variant: "blank" },
              { letter: "O", variant: "present" },
              { letter: "A", variant: "blank" },
              { letter: "C", variant: "blank" },
              { letter: "H", variant: "blank" },
            ]}
            note="🟨 O is in the word but wrong position."
          />
          <WordleExample
            cells={[
              { letter: "S", variant: "blank" },
              { letter: "H", variant: "absent" },
              { letter: "M", variant: "blank" },
              { letter: "A", variant: "blank" },
            ]}
            note="⬛ H is not in the word at all."
          />
        </div>

        {/* Section 4 — Hints */}
        <div style={{ marginTop: SECTION_GAP }}>
          <div style={SECTION_TITLE_STYLE}>Hints</div>
          <p style={BODY_STYLE}>
            After 2 wrong attempts, a 💡 Reveal Hint button appears. Using a hint is recorded
            on your shared result card.
          </p>
        </div>

        {/* Section 5 — Streaks & Sharing */}
        <div style={{ marginTop: SECTION_GAP }}>
          <div style={SECTION_TITLE_STYLE}>Streaks &amp; Sharing</div>
          <p style={BODY_STYLE}>
            Answer correctly each day to grow your 🔥 streak. Share your result as a
            spoiler-free emoji grid. Sign in to save your streak across devices.
          </p>
        </div>
      </div>
    </div>
  );
}
