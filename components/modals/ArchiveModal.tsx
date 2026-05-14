"use client";

import { useState, useMemo } from "react";
import { Question, Difficulty, ArchiveEntry } from "@/lib/types";
import { QUESTION_BANK, BankQuestion } from "@/lib/questions";

const PAGE_SIZE = 15;

type ArchiveModalProps = {
  userArchive: Record<string, ArchiveEntry>;
  onPractice: (question: Question, difficulty: Difficulty) => void;
  onClose: () => void;
};

const DIFF_META: Record<Difficulty, { label: string; bg: string; color: string }> = {
  easy:   { label: "א Aleph — Easy",    bg: "var(--correct-pale)", color: "var(--correct)" },
  medium: { label: "ב Bet — Medium",    bg: "var(--gold-muted)",   color: "var(--gold)"    },
  hard:   { label: "ג Gimel — Hard",    bg: "var(--wrong-pale)",   color: "var(--wrong)"   },
};

// Build a set of question texts the user has already tried (from personal archive)
function buildTriedSet(archive: Record<string, ArchiveEntry>): Set<string> {
  const s = new Set<string>();
  for (const entry of Object.values(archive)) {
    s.add(entry.question.question);
  }
  return s;
}

export default function ArchiveModal({ userArchive, onPractice, onClose }: ArchiveModalProps) {
  const [tab, setTab]   = useState<Difficulty>("easy");
  const [page, setPage] = useState(0);

  const triedSet = useMemo(() => buildTriedSet(userArchive), [userArchive]);

  // Questions for the active tab, stable order
  const tabQuestions = useMemo(
    () => QUESTION_BANK.filter((q) => q.difficulty === tab),
    [tab],
  );

  const totalPages = Math.ceil(tabQuestions.length / PAGE_SIZE);
  const pageSlice  = tabQuestions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function switchTab(d: Difficulty) {
    setTab(d);
    setPage(0);
  }

  function launch(bq: BankQuestion) {
    // Strip bank-only fields before passing to the game engine
    const { id: _id, relevantPeriod: _rp, difficulty, ...question } = bq;
    onPractice(question, difficulty);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: 14,
          maxWidth: 480, width: "100%",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          position: "relative", overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "20px 22px 0",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
            background: "var(--bg)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 24, fontWeight: 700, color: "var(--navy)",
                }}
              >
                Question Library
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Browse &amp; practise any question — answers hidden
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              style={{
                background: "none", border: "none", fontSize: 20,
                cursor: "pointer", color: "var(--text-muted)", padding: 0, lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Difficulty tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 14 }}>
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
              const active = tab === d;
              const meta   = DIFF_META[d];
              return (
                <button
                  key={d}
                  onClick={() => switchTab(d)}
                  style={{
                    flex: 1, padding: "9px 4px", border: "none", background: "none",
                    cursor: "pointer",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    color: active ? meta.color : "var(--text-muted)",
                    borderBottom: active ? `2.5px solid ${meta.color}` : "2.5px solid transparent",
                    transition: "all 0.12s",
                  }}
                >
                  {meta.label.split(" — ")[0]}
                  <span style={{ display: "block", fontSize: 10, opacity: 0.7, marginTop: 1 }}>
                    {QUESTION_BANK.filter((q) => q.difficulty === d).length} questions
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Question list ── */}
        <div style={{ overflowY: "auto", flex: 1, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {pageSlice.map((bq) => {
            const tried = triedSet.has(bq.question);
            return (
              <div
                key={bq.id}
                style={{
                  border: "1.5px solid var(--border)",
                  borderRadius: 10,
                  padding: "13px 14px",
                  background: "var(--card)",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}
              >
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10, fontStyle: "italic",
                        color: "var(--text-muted)",
                      }}
                    >
                      {bq.parasha}
                    </span>
                    {tried && (
                      <span
                        style={{
                          fontSize: 10, fontWeight: 600,
                          color: "var(--correct)", background: "var(--correct-pale)",
                          padding: "1px 6px", borderRadius: 999,
                        }}
                      >
                        ✓ tried
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "Lora, Georgia, serif",
                      fontSize: 13, color: "var(--text)", lineHeight: 1.5,
                    }}
                  >
                    {bq.question}
                  </div>
                </div>

                {/* Practice button */}
                <button
                  onClick={() => launch(bq)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--navy)";
                    e.currentTarget.style.color = "var(--gold-pale)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--navy)";
                  }}
                  style={{
                    background: "transparent",
                    border: "1.5px solid var(--navy)",
                    borderRadius: 7, padding: "7px 11px",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontSize: 13, fontWeight: 600, color: "var(--navy)",
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    transition: "all 0.13s",
                  }}
                >
                  Try it →
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 12, padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              flexShrink: 0, background: "var(--bg)",
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                background: "none", border: "1.5px solid var(--border)",
                borderRadius: 6, padding: "5px 14px",
                cursor: page === 0 ? "not-allowed" : "pointer",
                opacity: page === 0 ? 0.35 : 1,
                color: "var(--text-muted)", fontSize: 13,
              }}
            >
              ← Prev
            </button>

            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {page + 1} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              style={{
                background: "none", border: "1.5px solid var(--border)",
                borderRadius: 6, padding: "5px 14px",
                cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                opacity: page === totalPages - 1 ? 0.35 : 1,
                color: "var(--text-muted)", fontSize: 13,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
