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
import LandingPage from "@/components/LandingPage";
import GameScreen from "@/components/GameScreen";
import ResultScreen from "@/components/ResultScreen";
import SettingsModal, { type SettingsTab } from "@/components/modals/SettingsModal";
import AuthModal from "@/components/modals/AuthModal";
import ArchiveModal from "@/components/modals/ArchiveModal";
import OnboardingModal from "@/components/modals/OnboardingModal";

const MAX_ATT = 5;

// ─── Streak freeze helpers ─────────────────────────────────────────────────────

function getWeekKey(): string {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function loadFreezeCount(): number {
  if (typeof window === "undefined") return 1;
  const savedWeek = localStorage.getItem("dd_freeze_week");
  const weekKey = getWeekKey();
  if (savedWeek !== weekKey) {
    // New week — reset to 1 freeze
    localStorage.setItem("dd_freeze_week", weekKey);
    localStorage.setItem("dd_freeze_count", "1");
    return 1;
  }
  return parseInt(localStorage.getItem("dd_freeze_count") ?? "1", 10);
}

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
  const [activeModal,  setActiveModal]  = useState<string | null>(null);
  const [settingsTab,  setSettingsTab]  = useState<SettingsTab>("stats");
  const [difficulty,  setDifficulty]  = useState<Difficulty | null>(null);
  const [question,    setQuestion]    = useState<Question | null>(null);
  const [attempts,    setAttempts]    = useState<Attempt[]>([]);
  const [wordleRows,  setWordleRows]  = useState<WordleCell[][]>([]);
  const [won,         setWon]         = useState(false);
  const [gameOver,    setGameOver]    = useState(false);
  const [hintShown,   setHintShown]   = useState(false);
  const [isPractice,  setIsPractice]  = useState(false);

  // ── Landing page / onboarding ──────────────────────────────────────────────
  /** Logged-out users who clicked "Play" on the landing page */
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── Streak freeze ──────────────────────────────────────────────────────────
  const [freezeCount, setFreezeCount] = useState<number>(() => loadFreezeCount());
  const [toast,       setToast]       = useState<string | null>(null);

  // ── Persistent state ───────────────────────────────────────────────────────
  const [archive,   setArchive]   = useState<Record<string, ArchiveEntry>>(loadArchive);
  const [streak,    setStreak]    = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("dd_streak") ?? "0", 10);
  });
  const [userStats, setUserStats] = useState<UserStats>(() => loadStats());
  const [theme,     setTheme]     = useState<"light" | "dark">(getTheme);

  // ── Onboarding: show on first visit ───────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("dd_onboarded")) {
      const t = setTimeout(() => setShowOnboarding(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  // ── Toast auto-dismiss ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

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
    const today      = getTodayKey();
    const lastPlayed = localStorage.getItem("dd_last_played");
    if (lastPlayed === today) return streak;

    let newStreak: number;
    if (lastPlayed === getYesterdayKey()) {
      // Consecutive day — extend streak
      newStreak = streak + 1;
    } else if (streak > 0 && lastPlayed && lastPlayed < getYesterdayKey()) {
      // Missed a day — check for freeze
      const currentFreeze = loadFreezeCount();
      if (currentFreeze > 0) {
        // Consume freeze, preserve streak
        const remaining = currentFreeze - 1;
        localStorage.setItem("dd_freeze_count", String(remaining));
        setFreezeCount(remaining);
        setToast("❄️ Streak freeze used — streak preserved!");
        newStreak = streak + 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

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

  // ── Derived state ──────────────────────────────────────────────────────────
  const today = getTodayKey();
  const todayCompleted: Partial<Record<Difficulty, boolean>> = {
    easy:   !!archive[`${today}_easy`],
    medium: !!archive[`${today}_medium`],
    hard:   !!archive[`${today}_hard`],
  };

  // Show landing page for logged-out users who haven't clicked "Play" yet
  const showLandingPage = !isLoggedIn && status !== "loading" && gamePhase === "home" && !hasStartedPlaying;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Header
        streak={streak}
        onSettings={() => { setSettingsTab("account"); setActiveModal("settings"); }}
        onArchive={() => setActiveModal("archive")}
        onLogin={() => setActiveModal("login")}
      />

      {/* Toast notification */}
      {toast && <div className="toast-msg">{toast}</div>}

      {/* Landing page for logged-out users */}
      {showLandingPage ? (
        <div key="landing" className="phase-enter">
          <LandingPage
            onPlay={() => setHasStartedPlaying(true)}
            onLogin={() => setActiveModal("login")}
          />
        </div>
      ) : (
        <>
          {gamePhase === "home" && (
            <div key="home" className="phase-enter">
              <HomeScreen
                onSelectDifficulty={handleSelectDifficulty}
                onHowToPlay={() => { setSettingsTab("howtoplay"); setActiveModal("settings"); }}
                todayCompleted={todayCompleted}
              />
            </div>
          )}

          {gamePhase === "loading" && (
            <div key="loading" className="phase-enter" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minHeight: 320, paddingTop: 60 }}>
              <div className="animate-spin" style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--gold)" }} />
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 17, fontStyle: "italic", color: "var(--text-muted)" }}>
                Preparing today&apos;s question…
              </div>
              <div style={{ fontSize: 28 }}>📜</div>
            </div>
          )}

          {gamePhase === "game" && question && difficulty && (
            <div key="game" className="phase-enter">
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
            </div>
          )}

          {gamePhase === "result" && question && difficulty && (
            <div key="result" className="phase-enter">
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
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}
      {activeModal === "settings" && (
        <SettingsModal
          initialTab={settingsTab}
          stats={userStats}
          theme={theme}
          isLoggedIn={isLoggedIn}
          streak={streak}
          freezeCount={freezeCount}
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

      {/* Onboarding modal for first-time visitors */}
      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
