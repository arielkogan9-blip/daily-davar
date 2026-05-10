"use client";

import { ArchiveEntry, Difficulty } from "@/lib/types";

type ArchiveModalProps = {
  isLoggedIn: boolean;
  archive: Record<string, ArchiveEntry>;
  onLogin: () => void;
  onClose: () => void;
};

const DIFF_LABEL: Record<Difficulty, { label: string; bg: string; color: string }> = {
  easy: { label: "א Aleph", bg: "var(--correct-pale)", color: "var(--correct)" },
  medium: { label: "ב Bet", bg: "var(--gold-muted)", color: "var(--gold)" },
  hard: { label: "ג Gimel", bg: "var(--wrong-pale)", color: "var(--wrong)" },
};

function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("_")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArchiveModal({ isLoggedIn, archive, onLogin, onClose }: ArchiveModalProps) {
  const entries = Object.entries(archive).sort(([a], [b]) => b.localeCompare(a));

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
            marginBottom: 6,
          }}
        >
          Question Archive
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Past Daily Davar questions
        </div>

        {/* Auth gate */}
        {!isLoggedIn ? (
          <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔒</div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 20,
                fontWeight: 600,
                color: "var(--navy)",
                marginBottom: 10,
              }}
            >
              Members only
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              Create a free account to access the full archive of past Daily Davar questions,
              track your history, and preserve your streak across devices.
            </p>
            <button
              onClick={() => { onClose(); onLogin(); }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--navy-hover)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--navy)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              style={{
                background: "var(--navy)",
                color: "var(--gold-pale)",
                border: "none",
                borderRadius: 8,
                padding: "12px 28px",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "1px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              Sign In / Register
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📜</div>
            No games played yet. Complete your first Daily Davar to start your archive!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.map(([key, entry]) => {
              const badge = DIFF_LABEL[entry.difficulty];
              return (
                <div
                  key={key}
                  style={{
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "14px 16px",
                    background: entry.won ? "var(--correct-pale)" : "var(--wrong-pale)",
                    borderColor: entry.won ? "var(--correct)" : "var(--wrong)",
                    opacity: entry.won ? 1 : 0.85,
                  }}
                >
                  {/* Entry header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                      {formatDate(key)}
                    </span>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          fontSize: 11,
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {badge.label}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: entry.won ? "var(--correct)" : "var(--wrong)",
                        }}
                      >
                        {entry.won ? `✓ ${entry.attempts}/5` : "✗ X/5"}
                      </span>
                    </div>
                  </div>

                  {/* Parasha */}
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "var(--navy)",
                      marginBottom: 4,
                    }}
                  >
                    {entry.question.parasha}
                  </div>

                  {/* Question */}
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      marginBottom: 6,
                    }}
                  >
                    {entry.question.question}
                  </div>

                  {/* Answer */}
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: "var(--text-muted)" }}>Answer: </span>
                    <span style={{ fontWeight: 600, color: "var(--navy)" }}>
                      {entry.question.answer}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
