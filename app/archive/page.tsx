"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getTodayKey } from "@/lib/jewishDate";
import { Question, Attempt, Difficulty, WordleCell } from "@/lib/types";
import GameScreen from "@/components/GameScreen";
import ResultScreen from "@/components/ResultScreen";

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function buildCalendarDays(): string[] {
  const today = getTodayKey();
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(Date.now() - (364 - i) * 86400000);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  });
}

function monthLabel(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function fmtFull(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type HistoryEntry = { date: string; won: boolean };

type GameState = {
  phase:      "calendar" | "game" | "result";
  date:       string;
  difficulty: Difficulty;
  question:   Question | null;
  attempts:   Attempt[];
  wordleRows: WordleCell[][];
  won:        boolean;
  gameOver:   boolean;
  hintShown:  boolean;
};

type GameAction =
  | { type: "START"; date: string; difficulty: Difficulty; question: Question }
  | { type: "SUBMIT"; attempts: Attempt[]; won: boolean; gameOver: boolean }
  | { type: "SELF_GRADE"; correct: boolean; userText: string }
  | { type: "WORDLE_ROWS"; rows: WordleCell[][] }
  | { type: "HINT" }
  | { type: "RESULT" }
  | { type: "BACK" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
      return { ...state, phase: "game", date: action.date, difficulty: action.difficulty, question: action.question, attempts: [], wordleRows: [], won: false, gameOver: false, hintShown: false };
    case "SUBMIT":
      return { ...state, attempts: action.attempts, won: action.won, gameOver: action.gameOver };
    case "SELF_GRADE":
      return { ...state, attempts: [...state.attempts, { answer: action.userText, correct: action.correct }], won: action.correct, gameOver: true };
    case "WORDLE_ROWS":
      return { ...state, wordleRows: action.rows };
    case "HINT":
      return { ...state, hintShown: true };
    case "RESULT":
      return { ...state, phase: "result" };
    case "BACK":
      return { ...state, phase: "calendar" };
    default:
      return state;
  }
}

const INITIAL_GAME: GameState = {
  phase: "calendar", date: "", difficulty: "easy",
  question: null, attempts: [], wordleRows: [],
  won: false, gameOver: false, hintShown: false,
};

const MAX_ATT = 5;

// ─── Upgrade prompt ───────────────────────────────────────────────────────────

function UpgradePrompt({ tier }: { tier: string }) {
  const isPlus = tier === "plus";
  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
        Question Archive
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 28 }}>
        {isPlus
          ? "The full question archive is available to Scholar members. Upgrade to browse and replay any past question."
          : "Browse and replay every past Daily Davar question with a Scholar membership."}
      </p>
      <a href="/pricing" style={{
        display: "inline-block",
        background: "var(--navy)", color: "var(--gold-pale)",
        borderRadius: 8, padding: "14px 32px",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 18, fontWeight: 600, letterSpacing: "1px",
        textDecoration: "none",
      }}>
        {isPlus ? "Upgrade to Scholar →" : "Upgrade to Scholar →"}
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArchivePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const tier   = (session?.user as { tier?: string })?.tier ?? "free";

  const [history,  setHistory]  = useState<HistoryEntry[]>([]);
  const [loadHist, setLoadHist] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameState, dispatch]   = useReducer(gameReducer, INITIAL_GAME);
  const [fetchingQ, setFetchingQ] = useState(false);

  // Auth redirect
  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  // Load history for calendar colouring
  useEffect(() => {
    if (status !== "authenticated" || tier !== "scholar") { setLoadHist(false); return; }
    fetch("/api/user/history?days=365")
      .then((r) => r.json())
      .then(({ results }) => {
        setHistory((results ?? []).map((r: { date: string; won: boolean }) => ({ date: r.date, won: r.won })));
        setLoadHist(false);
      })
      .catch(() => setLoadHist(false));
  }, [status, tier]);

  // ── Game handlers ────────────────────────────────────────────────────────────

  const handleDayClick = useCallback(async (date: string) => {
    const today = getTodayKey();
    if (date >= today) return; // can't play today or future via archive
    setFetchingQ(true);
    try {
      const res = await fetch(`/api/question/archive?date=${date}&difficulty=${difficulty}`);
      if (!res.ok) return;
      const { question } = await res.json();
      dispatch({ type: "START", date, difficulty, question });
    } finally {
      setFetchingQ(false);
    }
  }, [difficulty]);

  function handleSubmitAnswer(answer: string) {
    if (gameState.gameOver || !gameState.question) return;
    const correct = answer.toLowerCase().trim() === gameState.question.answer.toLowerCase().trim();
    const newAttempts = [...gameState.attempts, { answer, correct }];
    const gameOver = correct || newAttempts.length >= MAX_ATT;
    dispatch({ type: "SUBMIT", attempts: newAttempts, won: correct, gameOver });
    if (gameOver) setTimeout(() => dispatch({ type: "RESULT" }), correct ? 1800 : 1500);
  }

  function handleSelfGrade(correct: boolean, userText: string) {
    if (gameState.gameOver || !gameState.question) return;
    dispatch({ type: "SELF_GRADE", correct, userText });
    setTimeout(() => dispatch({ type: "RESULT" }), correct ? 1600 : 1400);
  }

  // ── Render: loading / upgrade guard ─────────────────────────────────────────

  if (status === "loading" || loadHist) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="animate-spin" style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
      </div>
    );
  }

  if (tier !== "scholar") return <UpgradePrompt tier={tier} />;

  // ── Render: game/result view ─────────────────────────────────────────────────

  if (gameState.phase === "game" && gameState.question) {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        {/* Archive banner */}
        <div style={{
          background: "var(--gold)", color: "#fff",
          textAlign: "center", padding: "8px 16px", fontSize: 13, fontWeight: 600,
          fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.5px",
        }}>
          📅 Playing archive — {fmtFull(gameState.date)}
        </div>
        <GameScreen
          question={gameState.question}
          difficulty={gameState.difficulty}
          attempts={gameState.attempts}
          won={gameState.won}
          hintShown={gameState.hintShown}
          gameOver={gameState.gameOver}
          tier={tier}
          onSubmitAnswer={handleSubmitAnswer}
          onSelfGrade={handleSelfGrade}
          onRevealHint={() => dispatch({ type: "HINT" })}
          onWordleRowsChange={(rows) => dispatch({ type: "WORDLE_ROWS", rows })}
        />
      </div>
    );
  }

  if (gameState.phase === "result" && gameState.question) {
    return (
      <div style={{ position: "relative", minHeight: "100vh" }}>
        <div style={{
          background: "var(--gold)", color: "#fff",
          textAlign: "center", padding: "8px 16px", fontSize: 13, fontWeight: 600,
          fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.5px",
        }}>
          📅 Playing archive — {fmtFull(gameState.date)}
        </div>
        <ResultScreen
          question={gameState.question}
          attempts={gameState.attempts}
          won={gameState.won}
          streak={0}
          difficulty={gameState.difficulty}
          wordleRows={gameState.wordleRows}
          hintShown={gameState.hintShown}
          tier={tier}
          onBackToHome={() => dispatch({ type: "BACK" })}
        />
      </div>
    );
  }

  // ── Render: calendar view ────────────────────────────────────────────────────

  const today     = getTodayKey();
  const allDays   = buildCalendarDays();
  const histMap   = new Map(history.map((h) => [h.date, h.won]));

  // Group days into columns of 7 (weeks), starting from the oldest day
  const weeks: string[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  // Month labels: track which week a new month appears
  const monthLabels: Record<number, string> = {};
  let lastMonth = "";
  weeks.forEach((week, wi) => {
    const m = monthLabel(week[0]);
    if (m !== lastMonth) { monthLabels[wi] = m; lastMonth = m; }
  });

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "36px 20px 60px" }}>
      {/* Title */}
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 34, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
        Question Archive
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
        Click any past date to replay its question. Archive games do not affect your streak.
      </div>

      {/* Difficulty selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>Play as:</span>
        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            style={{
              background: difficulty === d ? "var(--navy)" : "transparent",
              color: difficulty === d ? "var(--gold-pale)" : "var(--text-muted)",
              border: `1.5px solid ${difficulty === d ? "var(--navy)" : "var(--border)"}`,
              borderRadius: 6, padding: "5px 14px",
              fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.12s",
            }}
          >
            {d === "easy" ? "א Aleph" : d === "medium" ? "ב Bet" : "ג Gimel"}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { color: "var(--correct)", label: "Won" },
          { color: "var(--wrong)",   label: "Lost" },
          { color: "var(--border)",  label: "Not played" },
          { color: "var(--bg)",      label: "Future", border: "var(--border)" },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: color, border: border ? `1px solid ${border}` : "none", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "var(--border)", outline: "2px solid var(--gold)", outlineOffset: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Today</span>
        </div>
      </div>

      {/* Loading overlay while fetching question */}
      {fetchingQ && (
        <div style={{ textAlign: "center", padding: "12px 0 20px", color: "var(--text-muted)", fontSize: 13, fontStyle: "italic" }}>
          Loading question…
        </div>
      )}

      {/* Calendar grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 3, minWidth: "max-content" }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Month label above first week of each month */}
              <div style={{ height: 16, display: "flex", alignItems: "flex-end" }}>
                <span style={{ fontSize: 9, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {monthLabels[wi] ?? ""}
                </span>
              </div>
              {week.map((date) => {
                const isFuture = date > today;
                const isToday  = date === today;
                const result   = histMap.get(date);
                const hasResult = result !== undefined;
                const isPast   = date < today;

                let bg = "var(--border)"; // not played
                if (isFuture) bg = "var(--bg)";
                else if (result === true)  bg = "var(--correct)";
                else if (result === false) bg = "var(--wrong)";

                return (
                  <button
                    key={date}
                    title={`${fmtFull(date)}${hasResult ? (result ? " — Won ✓" : " — Lost ✗") : ""}`}
                    onClick={() => isPast ? handleDayClick(date) : undefined}
                    style={{
                      width: 12, height: 12, borderRadius: 3,
                      background: bg,
                      border: isToday ? "2px solid var(--gold)" : "none",
                      outline: "none",
                      cursor: isPast ? "pointer" : "default",
                      padding: 0,
                      transition: "transform 0.1s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { if (isPast) e.currentTarget.style.transform = "scale(1.5)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
        Showing past 365 days · {history.length} game{history.length !== 1 ? "s" : ""} played
      </div>
    </div>
  );
}
