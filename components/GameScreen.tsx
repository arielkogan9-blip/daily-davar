"use client";

import { useCallback, useEffect, useState } from "react";
import { Question, Difficulty, Attempt, LetterStatus, WordleCell } from "@/lib/types";
import { evaluateGuess } from "@/lib/evaluateGuess";
import { getHebrewDateString } from "@/lib/jewishDate";
import ContextCard from "@/components/game/ContextCard";
import AttemptDots from "@/components/game/AttemptDots";
import MultipleChoice from "@/components/game/MultipleChoice";
import WordleGrid from "@/components/game/WordleGrid";
import WordleKeyboard from "@/components/game/WordleKeyboard";
import TextBox from "@/components/game/TextBox";
import HintPanel from "@/components/game/HintPanel";

const MAX_ATTEMPTS = 5;

const STATUS_PRIORITY: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };

const DIFFICULTY_BADGE: Record<Difficulty, { label: string; bg: string; color: string }> = {
  easy: { label: "א Aleph", bg: "var(--correct-pale)", color: "var(--correct)" },
  medium: { label: "ב Bet", bg: "var(--gold-muted)", color: "var(--gold)" },
  hard: { label: "ג Gimel", bg: "var(--wrong-pale)", color: "var(--wrong)" },
};

type GameScreenProps = {
  question: Question;
  difficulty: Difficulty;
  attempts: Attempt[];
  won: boolean;
  hintShown: boolean;
  gameOver: boolean;
  onSubmitAnswer: (answer: string) => void;
  onRevealHint: () => void;
  onWordleRowsChange?: (rows: WordleCell[][]) => void;
};

export default function GameScreen({
  question,
  difficulty,
  attempts,
  won,
  hintShown,
  gameOver,
  onSubmitAnswer,
  onRevealHint,
  onWordleRowsChange,
}: GameScreenProps) {
  const [shaking, setShaking] = useState(false);

  // Wordle-specific state owned here
  const [wordleRows, setWordleRows] = useState<WordleCell[][]>([]);
  const [wordleCurrent, setWordleCurrent] = useState<string[]>([]);
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});

  const hebrewDate = getHebrewDateString();
  const badge = DIFFICULTY_BADGE[difficulty];
  const isWordle = question.type === "wordle";
  const wordLen = question.answer.replace(/\s/g, "").length;
  const wrongAttempts = attempts.filter((a) => !a.correct);

  // Lift wordleRows to parent for result/share
  useEffect(() => {
    onWordleRowsChange?.(wordleRows);
  }, [wordleRows]); // eslint-disable-line react-hooks/exhaustive-deps

  // Shake on wrong attempt
  useEffect(() => {
    if (attempts.length === 0) return;
    const last = attempts[attempts.length - 1];
    if (!last.correct) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [attempts.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWordleKey = useCallback(
    (key: string) => {
      if (gameOver) return;

      if (key === "DEL") {
        setWordleCurrent((p) => p.slice(0, -1));
        return;
      }

      if (key === "ENTER") {
        if (wordleCurrent.length !== wordLen) return;
        const guess = wordleCurrent.join("");
        const statuses = evaluateGuess(guess, question.answer);
        const rowData: WordleCell[] = wordleCurrent.map((char, i) => ({
          char,
          status: statuses[i],
        }));

        setWordleRows((rows) => [...rows, rowData]);

        setLetterStatuses((prev) => {
          const updated = { ...prev };
          wordleCurrent.forEach((char, i) => {
            const st = statuses[i];
            if (!updated[char] || STATUS_PRIORITY[st] > STATUS_PRIORITY[updated[char]]) {
              updated[char] = st;
            }
          });
          return updated;
        });

        onSubmitAnswer(guess);
        setWordleCurrent([]);
        return;
      }

      if (/^[A-Z]$/.test(key) && wordleCurrent.length < wordLen) {
        setWordleCurrent((p) => [...p, key]);
      }
    },
    [gameOver, wordleCurrent, wordLen, question.answer, onSubmitAnswer],
  );

  // Physical keyboard listener
  useEffect(() => {
    if (!isWordle) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") return handleWordleKey("DEL");
      if (e.key === "Enter") return handleWordleKey("ENTER");
      const letter = e.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) handleWordleKey(letter);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isWordle, handleWordleKey]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: 540,
        margin: "0 auto",
        padding: "16px 16px",
        gap: 12,
      }}
    >
      {/* Row 1 — Game header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <span style={{ fontSize: 12, fontStyle: "italic", color: "var(--text-muted)" }}>
          📅 {hebrewDate}
        </span>
        <div
          style={{
            background: badge.bg,
            color: badge.color,
            padding: "4px 12px",
            borderRadius: 999,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          {badge.label}
        </div>
      </div>

      {/* Row 2 — Context card */}
      <ContextCard
        parasha={question.parasha}
        topic_category={question.topic_category}
        context={question.context}
      />

      {/* Row 3 — Question card */}
      <div
        className={shaking ? "animate-shake" : ""}
        style={{
          background: "#fff",
          border: "1.5px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 20,
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "2px",
            color: "var(--text-muted)",
            marginBottom: 8,
          }}
        >
          Question
        </div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 21,
            fontWeight: 600,
            color: "var(--navy)",
            lineHeight: 1.45,
          }}
        >
          {question.question}
        </div>
      </div>

      {/* Row 4 — Attempt dots (non-wordle) */}
      {!isWordle && (
        <AttemptDots attempts={attempts} maxAttempts={MAX_ATTEMPTS} gameOver={gameOver} />
      )}

      {/* Row 5 — Previous wrong answers (non-wordle) */}
      {!isWordle && wrongAttempts.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, width: "100%" }}>
          {wrongAttempts.map((att, i) => (
            <span
              key={i}
              style={{
                background: "var(--wrong-pale)",
                borderRadius: 6,
                padding: "6px 12px",
                fontSize: 13,
                fontStyle: "italic",
                color: "var(--wrong)",
              }}
            >
              ✗ &ldquo;{att.answer}&rdquo;
            </span>
          ))}
        </div>
      )}

      {/* Row 6 — Input component */}
      {question.type === "multiple_choice" && (
        <MultipleChoice
          options={question.options}
          answer={question.answer}
          gameOver={gameOver}
          onSubmit={onSubmitAnswer}
        />
      )}

      {isWordle && (
        <>
          <WordleGrid
            completedRows={wordleRows}
            currentRow={wordleCurrent}
            wordLength={wordLen}
            maxAttempts={MAX_ATTEMPTS}
            gameOver={gameOver}
          />
          {!gameOver && (
            <WordleKeyboard letterStatuses={letterStatuses} onKey={handleWordleKey} />
          )}
        </>
      )}

      {question.type === "text_box" && (
        <TextBox gameOver={gameOver} onSubmit={onSubmitAnswer} />
      )}

      {/* Row 7 — Hint panel */}
      <HintPanel
        visible={attempts.length >= 2 && !gameOver}
        hintText={question.hint}
        hintShown={hintShown}
        onReveal={onRevealHint}
      />

      {/* Row 8 — Answer reveal (game over, not won) */}
      {gameOver && !won && (
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
            The Answer Was
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--gold)",
            }}
          >
            {question.answer}
          </div>
        </div>
      )}
    </div>
  );
}
