export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "multiple_choice" | "wordle" | "text_box";

export type Question = {
  parasha: string;
  topic_category: string;
  context: string;
  question: string;
  type: QuestionType;
  answer: string;
  options: string[];
  hint: string;
};

export type Attempt = {
  answer: string;
  correct: boolean;
};

export type LetterStatus = "correct" | "present" | "absent";

export type GamePhase = "home" | "loading" | "game" | "result";

export type WordleCell = { char: string; status: LetterStatus };

export type ArchiveEntry = {
  date: string;        // YYYY-MM-DD
  difficulty: Difficulty;
  question: Question;
  won: boolean;
  attempts: number;
};

export const FALLBACK_QUESTIONS: Record<Difficulty, Question> = {
  easy: {
    parasha: "Parashat Emor",
    topic_category: "Torah",
    context:
      "Parashat Emor in Vayikra details the laws of the Kohanim and the Jewish festival calendar, including Shabbat, Pesach, Shavuot, Rosh Hashana, Yom Kippur, and Sukkot. It also introduces the commandment to count the Omer — the 49 days between Pesach and Shavuot.",
    question: "Which book of the Torah contains Parashat Emor?",
    type: "multiple_choice",
    answer: "Vayikra",
    options: ["Bereishit", "Shemot", "Vayikra", "Bamidbar"],
    hint: "This is the third book of the Torah, known in English as Leviticus.",
  },
  medium: {
    parasha: "Parashat Emor",
    topic_category: "Torah",
    context:
      "Parashat Emor details the festival cycle. Among the holidays described is a pilgrimage festival celebrated 50 days after Pesach, marking the giving of the Torah at Sinai. The Temple received a unique offering of two leavened loaves on this day.",
    question: "What is the name of the festival celebrated 50 days after Pesach?",
    type: "wordle",
    answer: "SHAVUOT",
    options: [],
    hint: "Its name comes from the Hebrew word for 'weeks' — it follows seven complete weeks of counting.",
  },
  hard: {
    parasha: "Parashat Emor",
    topic_category: "Jewish Law",
    context:
      "Parashat Emor commands the counting of 49 days from the Omer. The Talmud in Tractate Menachot discusses this obligation in depth. Maimonides rules on whether it applies after the Temple's destruction.",
    question:
      "According to Maimonides in the Mishneh Torah, what category of commandment is the counting of the Omer in the present day — Torah-level or rabbinic?",
    type: "text_box",
    answer: "Torah-level",
    options: [],
    hint: "Maimonides rules that this commandment applies in all generations, not merely when the Temple stands.",
  },
};
