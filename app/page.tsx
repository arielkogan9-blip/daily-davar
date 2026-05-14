"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  GamePhase, Difficulty, Question, Attempt, WordleCell, ArchiveEntry, FALLBACK_QUESTIONS,
} from "@/lib/types";
import { getTodayKey, getYesterdayKey } from "@/lib/jewishDate";
import { UserStats, loadStats, recordGame } from "@/lib/stats";
import Header from "@/components/Header";
import HomeScreen from "@/components/HomeScreen";
import GameScreen from "@/components/GameScreen";
import ResultScreen from "@/components/ResultScreen";
import SettingsModal from "@/components/modals/SettingsModal";
import AuthModal from "@/components/modals/AuthModal";
import ArchiveModal from "@/components/modals/ArchiveModal";

const MAX_ATT = 5;

function loadArchive(): Record<string, ArchiveEntry> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("dd_archive") ?? "{}"); }
  catch { return {}; }
}

function getTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem("dd_theme") ?? "light") as "light" | "dark";
}

// Map the /api/user/stats response shape → UserStats
function apiToUserStats(api: {
  totalPlayed: number; totalWon: number;
  currentStreak: number; longestStreak: number;
  accuracyByDifficulty: Record<string, { played: number; won: number }>;
}): UserStats {
  return {
    totalPlayed:   api.totalPlayed,
    totalWon:      api.totalWon,
    currentStreak: api.currentStreak,
    bestStreak:    api.longestStreak,
    byDifficulty: {
      easy:   { played: api.accuracyByDifficulty.easy?.played   ?? 0, won: api.accuracyByDifficulty.easy?.won   ?? 0 },
      medium: { played: api.accuracyByDifficulty.medium?.played ?? 0, won: api.accuracyByDifficulty.medium?.won ?? 0 },
      hard:   { played: api.accuracyByDifficulty.hard?.played   ?? 0, won: api.accuracyByDifficulty.hard?.won   ?? 0 },
    },
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const tier = (session?.user as { tier?: string })?.tier ?? "free";

  // ── Game state ─────────────────────────────────────────────────────────────
  const [gamePhase,   setGamePhase]   = useState<GamePhase>("home");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [difficulty,  setDifficulty]  = useState<Difficulty | null>(null);
  const [question,    setQuestion]    = useState<Question | null>(null);
  const [attempts,    setAttempts]    = useState<Attempt[]>([]);
  const [wordleRows,  setWordleRows]  = useState<WordleCell[][]>([]);
  const [won,         setWon]         = useState(false);
  const [gameOver,    setGameOver]    = useState(false);
  const [hintShown,   setHintShown]   = useState(false);
  const [isPractice,  setIsPractice]  = useState(false);

  // ── Persistent state ───────────────────────────────────────────────────────
  const [archive,   setArchive]   = useState<Record<string, ArchiveEntry>>(loadArchive);
  const [streak,    setStreak]    = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("dd_streak") ?? "0", 10);
  });
  const [userStats, setUserStats] = useState<UserStats>(() => loadStats());
  const [theme,     setTheme]     = useState<"light" | "dark">(getTheme);

  // ── Sync localStorage streak to state ─────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) localStorage.setItem("dd_streak", String(streak));
  }, [streak, isLoggedIn]);

  // ── Load server stats when user signs in ──────────────────────────────────
  const loadServerStats = useCallback(async () => {
    try {
      const res = await fetch("/api/user/stats");
      if (!res.ok) return; // free tier returns 403 — that's fine
      const data = await res.json();
      const mapped = apiToUserStats(data);
      setUserStats(mapped);
      setStreak(data.currentStreak ?? 0);
    } catch { /* network error — keep local stats */ }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadServerStats();
  }, [isLoggedIn, loadServerStats]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function saveToArchive(q: Question, diff: Difficulty, attArr: Attempt[], didWin: boolean) {
    const today = getTodayKey();
    const key   = `${today}_${diff}`;
    const entry: ArchiveEntry = { date: today, difficulty: diff, question: q, won: didWin, attempts: attArr.length };
    const updated = { ...loadArchive(), [key]: entry };
    localStorage.setItem("dd_archive", JSON.stringify(updated));
    setArchive(updated);
  }

  function handleToggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("dd_theme", next);
    if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else                 document.documentElement.removeAttribute("data-theme");
  }

  /** Save a completed game result to the server (authenticated users only). */
  async function persistResult(
    diff: Difficulty, didWin: boolean, attemptsUsed: number, hintUsed: boolean,
  ) {
    if (!isLoggedIn || isPractice) return;
    try {
      await fetch("/api/user/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: diff, won: didWin, attemptsUsed, hintUsed }),
      });
      // Refresh stats from server (includes updated streak)
      await loadServerStats();
    } catch { /* non-fatal — local stats still updated */ }
  }

  // ── Streak helper (local, for non-logged-in users) ────────────────────────
  function applyLocalStreak(): number {
    const today     = getTodayKey();
    const lastPlayed = localStorage.getItem("dd_last_played");
    if (lastPlayed === today) return streak;
    const newStreak = lastPlayed === getYesterdayKey() ? streak + 1 : 1;
    setStreak(newStreak);
    localStorage.setItem("dd_streak", String(newStreak));
    localStorage.setItem("dd_last_played", today);
    return newStreak;
  }

  // ── Game start ─────────────────────────────────────────────────────────────

  async function handleSelectDifficulty(diff: Difficulty) {
    setDifficulty(diff);
    setGamePhase("loading");
    setAttempts([]); setWordleRows([]);
    setWon(false); setGameOver(false); setHintShown(false); setIsPractice(false);

    try {
      const res    = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: diff }),
      });
      setQuestion(await res.json());
    } catch {
      setQuestion(FALLBACK_QUESTIONS[diff]);
    }
    setGamePhase("game");
  }

  function handlePractice(q: Question, diff: Difficulty) {
    setDifficulty(diff); setQuestion(q);
    setAttempts([]); setWordleRows([]);
    setWon(false); setGameOver(false); setHintShown(false);
    setIsPractice(true);
    setActiveModal(null);
    setGamePhase("game");
  }

  // ── Answer submission ──────────────────────────────────────────────────────

  function handleSubmitAnswer(answer: string) {
    if (gameOver || !question || !difficulty) return;
    const correct     = answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    const newAttempts = [...attempts, { answer, correct }];
    setAttempts(newAttempts);

    if (correct) {
      setWon(true); setGameOver(true);
      if (!isPractice) {
        const newStreak = isLoggedIn ? streak : applyLocalStreak();
        if (!isLoggedIn) {
          setUserStats(recordGame(userStats, difficulty, true, newStreak));
        }
        saveToArchive(question, difficulty, newAttempts, true);
        persistResult(difficulty, true, newAttempts.length, hintShown);
      }
      setTimeout(() => setGamePhase("result"), 1800);

    } else if (newAttempts.length >= MAX_ATT) {
      setGameOver(true);
      if (!isPractice) {
        if (!isLoggedIn) setUserStats(recordGame(userStats, difficulty, false, 0));
        saveToArchive(question, difficulty, newAttempts, false);
        persistResult(difficulty, false, newAttempts.length, hintShown);
      }
      setTimeout(() => setGamePhase("result"), 1500);
    }
  }

  function handleSelfGrade(correct: boolean, userText: string) {
    if (gameOver || !question || !difficulty) return;
    const newAttempts = [...attempts, { answer: userText, correct }];
    setAttempts(newAttempts);
    setGameOver(true);

    if (correct) {
      setWon(true);
      if (!isPractice) {
        const newStreak = isLoggedIn ? streak : applyLocalStreak();
        if (!isLoggedIn) setUserStats(recordGame(userStats, difficulty, true, newStreak));
        saveToArchive(question, difficulty, newAttempts, true);
        persistResult(difficulty, true, newAttempts.length, hintShown);
      }
      setTimeout(() => setGamePhase("result"), 1600);
    } else {
      if (!isPractice) {
        if (!isLoggedIn) setUserStats(recordGame(userStats, difficulty, false, 0));
        saveToArchive(question, difficulty, newAttempts, false);
        persistResult(difficulty, false, newAttempts.length, hintShown);
      }
      setTimeout(() => setGamePhase("result"), 1400);
    }
  }

  function handleRevealHint() { setHintShown(true); }

  function handleBackToHome() {
    const wasP = isPractice;
    setGamePhase("home"); setDifficulty(null); setQuestion(null);
    setAttempts([]); setWordleRows([]);
    setWon(false); setGameOver(false); setHintShown(false); setIsPractice(false);
    setActiveModal(wasP ? "archive" : null);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Header
        streak={streak}
        onSettings={() => setActiveModal("settings")}
        onArchive={() => setActiveModal("archive")}
        onLogin={() => setActiveModal("login")}
      />

      {gamePhase === "home" && (
        <HomeScreen
          onSelectDifficulty={handleSelectDifficulty}
          onHowToPlay={() => setActiveModal("settings")}
        />
      )}

      {gamePhase === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 320, paddingTop: 60 }}>
          <div className="animate-spin" style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontStyle: "italic", color: "var(--text-muted)" }}>
            Preparing today&apos;s question…
          </div>
          <div style={{ fontSize: 28 }}>📜</div>
        </div>
      )}

      {gamePhase === "game" && question && difficulty && (
        <GameScreen
          question={question}
          difficulty={difficulty}
          attempts={attempts}
          won={won}
          hintShown={hintShown}
          gameOver={gameOver}
          tier={tier}
          onSubmitAnswer={handleSubmitAnswer}
          onSelfGrade={handleSelfGrade}
          onRevealHint={handleRevealHint}
          onWordleRowsChange={setWordleRows}
        />
      )}

      {gamePhase === "result" && question && difficulty && (
        <ResultScreen
          question={question}
          attempts={attempts}
          won={won}
          streak={streak}
          difficulty={difficulty}
          wordleRows={wordleRows}
          hintShown={hintShown}
          tier={tier}
          onBackToHome={handleBackToHome}
        />
      )}

      {/* ── Modals ── */}
      {activeModal === "settings" && (
        <SettingsModal
          stats={userStats}
          theme={theme}
          isLoggedIn={isLoggedIn}
          streak={streak}
          onToggleTheme={handleToggleTheme}
          onLogin={() => { setActiveModal(null); setTimeout(() => setActiveModal("login"), 10); }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "login" && (
        <AuthModal
          onClose={() => setActiveModal(null)}
          onSuccess={() => { /* session updates automatically via useSession */ }}
        />
      )}

      {activeModal === "archive" && (
        <ArchiveModal
          userArchive={archive}
          onPractice={handlePractice}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
