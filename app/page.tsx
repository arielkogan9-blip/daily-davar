"use client";

import { useState, useEffect } from "react";
import {
  GamePhase,
  Difficulty,
  Question,
  Attempt,
  WordleCell,
  ArchiveEntry,
  FALLBACK_QUESTIONS,
} from "@/lib/types";
import { getTodayKey, getYesterdayKey } from "@/lib/jewishDate";
import Header from "@/components/Header";
import HomeScreen from "@/components/HomeScreen";
import GameScreen from "@/components/GameScreen";
import ResultScreen from "@/components/ResultScreen";
import HowToPlayModal from "@/components/modals/HowToPlayModal";
import AuthModal from "@/components/modals/AuthModal";
import ArchiveModal from "@/components/modals/ArchiveModal";

const MAX_ATT = 5;

function loadArchive(): Record<string, ArchiveEntry> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("dd_archive") ?? "{}");
  } catch {
    return {};
  }
}

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("home");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [wordleRows, setWordleRows] = useState<WordleCell[][]>([]);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dd_logged_in") === "1";
  });

  const [archive, setArchive] = useState<Record<string, ArchiveEntry>>(loadArchive);

  const [streak, setStreak] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(localStorage.getItem("dd_streak") ?? "0", 10);
  });

  // Persist streak (read-only sync — writes happen explicitly in handleSubmitAnswer)
  useEffect(() => {
    localStorage.setItem("dd_streak", String(streak));
  }, [streak]);

  function handleLogin() {
    setIsLoggedIn(true);
    localStorage.setItem("dd_logged_in", "1");
  }

  function saveToArchive(q: Question, diff: Difficulty, attArr: Attempt[], didWin: boolean) {
    const today = getTodayKey();
    const key = `${today}_${diff}`;
    const entry: ArchiveEntry = {
      date: today,
      difficulty: diff,
      question: q,
      won: didWin,
      attempts: attArr.length,
    };
    const updated = { ...loadArchive(), [key]: entry };
    localStorage.setItem("dd_archive", JSON.stringify(updated));
    setArchive(updated);
  }

  async function handleSelectDifficulty(diff: Difficulty) {
    setDifficulty(diff);
    setGamePhase("loading");
    setAttempts([]);
    setWordleRows([]);
    setWon(false);
    setGameOver(false);
    setHintShown(false);

    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: diff }),
      });
      const result: Question = await res.json();
      setQuestion(result);
    } catch {
      setQuestion(FALLBACK_QUESTIONS[diff]);
    }

    setGamePhase("game");
  }

  function handleSubmitAnswer(answer: string) {
    if (gameOver || !question || !difficulty) return;

    const correct =
      answer.toLowerCase().trim() === question.answer.toLowerCase().trim();
    const newAttempts: Attempt[] = [...attempts, { answer, correct }];
    setAttempts(newAttempts);

    if (correct) {
      setWon(true);
      setGameOver(true);

      // Update streak once per calendar day
      const today = getTodayKey();
      const lastPlayed = localStorage.getItem("dd_last_played");
      if (lastPlayed !== today) {
        const newStreak = lastPlayed === getYesterdayKey() ? streak + 1 : 1;
        setStreak(newStreak);
        localStorage.setItem("dd_streak", String(newStreak));
        localStorage.setItem("dd_last_played", today);
      }

      saveToArchive(question, difficulty, newAttempts, true);
      setTimeout(() => setGamePhase("result"), 1800);
    } else if (newAttempts.length >= MAX_ATT) {
      setGameOver(true);
      saveToArchive(question, difficulty, newAttempts, false);
      setTimeout(() => setGamePhase("result"), 1500);
    }
  }

  /**
   * Called by the self-grade buttons on open-ended text_box questions.
   * The user has already seen the model answer and decided whether they
   * knew it — we record a single attempt and immediately end the game.
   */
  function handleSelfGrade(correct: boolean, userText: string) {
    if (gameOver || !question || !difficulty) return;

    const newAttempts: Attempt[] = [...attempts, { answer: userText, correct }];
    setAttempts(newAttempts);
    setGameOver(true);

    if (correct) {
      setWon(true);
      const today = getTodayKey();
      const lastPlayed = localStorage.getItem("dd_last_played");
      if (lastPlayed !== today) {
        const newStreak = lastPlayed === getYesterdayKey() ? streak + 1 : 1;
        setStreak(newStreak);
        localStorage.setItem("dd_streak", String(newStreak));
        localStorage.setItem("dd_last_played", today);
      }
      saveToArchive(question, difficulty, newAttempts, true);
      setTimeout(() => setGamePhase("result"), 1600);
    } else {
      saveToArchive(question, difficulty, newAttempts, false);
      setTimeout(() => setGamePhase("result"), 1400);
    }
  }

  function handleRevealHint() {
    setHintShown(true);
  }

  function handleBackToHome() {
    setGamePhase("home");
    setActiveModal(null);
    setDifficulty(null);
    setQuestion(null);
    setAttempts([]);
    setWordleRows([]);
    setWon(false);
    setGameOver(false);
    setHintShown(false);
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Header
        streak={streak}
        isLoggedIn={isLoggedIn}
        onHowToPlay={() => setActiveModal("howToPlay")}
        onArchive={() => setActiveModal("archive")}
        onLogin={() => setActiveModal("login")}
      />

      {gamePhase === "home" && (
        <HomeScreen
          onSelectDifficulty={handleSelectDifficulty}
          onHowToPlay={() => setActiveModal("howToPlay")}
        />
      )}

      {gamePhase === "loading" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            minHeight: 320,
            paddingTop: 60,
          }}
        >
          <div
            className="animate-spin"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--gold)",
            }}
          />
          <div
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 17,
              fontStyle: "italic",
              color: "var(--text-muted)",
            }}
          >
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
          onBackToHome={handleBackToHome}
        />
      )}

      {activeModal === "howToPlay" && (
        <HowToPlayModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === "login" && (
        <AuthModal
          onClose={() => setActiveModal(null)}
          onLogin={handleLogin}
        />
      )}

      {activeModal === "archive" && (
        <ArchiveModal
          isLoggedIn={isLoggedIn}
          archive={archive}
          onLogin={() => setActiveModal("login")}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
