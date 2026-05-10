import { Difficulty, Attempt, LetterStatus, QuestionType, WordleCell } from "@/lib/types";

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: "א · Aleph",
  medium: "ב · Bet",
  hard: "ג · Gimel",
};

const EMOJI: Record<LetterStatus, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

export function generateShareText(
  difficulty: Difficulty,
  attempts: Attempt[],
  won: boolean,
  wordleRows: WordleCell[][],
  hintShown: boolean,
  questionType: QuestionType,
): string {
  const diffLabel = DIFF_LABEL[difficulty];
  const result = won ? `${attempts.length}/5` : "X/5";

  let grid: string;
  if (questionType === "wordle") {
    grid = wordleRows
      .map((row) => row.map((cell) => EMOJI[cell.status]).join(""))
      .join("\n");
  } else {
    grid =
      attempts.map((att) => (att.correct ? "🟩" : "🟥")).join("") +
      (hintShown ? " 💡" : "");
  }

  return `Daily Davar 📜 ${diffLabel}\n${result}\n\n${grid}\n\ndailydavar.com`;
}

export async function shareResult(text: string): Promise<void> {
  try {
    await navigator.share({ text });
  } catch {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      alert("Copy this result:\n\n" + text);
    }
  }
}
