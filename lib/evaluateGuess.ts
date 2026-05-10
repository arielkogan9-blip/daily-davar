import { LetterStatus } from "@/lib/types";

export function evaluateGuess(guess: string, answer: string): LetterStatus[] {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const result: LetterStatus[] = new Array(g.length).fill("absent");
  const answerPool = [...a];

  // First pass: correct positions
  for (let i = 0; i < g.length; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
      answerPool[i] = "";
    }
  }

  // Second pass: present letters (not already matched)
  for (let i = 0; i < g.length; i++) {
    if (result[i] === "correct") continue;
    const poolIndex = answerPool.indexOf(g[i]);
    if (poolIndex !== -1) {
      result[i] = "present";
      answerPool[poolIndex] = "";
    }
  }

  return result;
}
