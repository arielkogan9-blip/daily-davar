import { getTodayKey } from "./jewishDate";

// Known Rosh Hashana dates for nearby Hebrew years (Gregorian date of 1 Tishrei)
const RH_ANCHORS: { hebrew: number; greg: string }[] = [
  { hebrew: 5784, greg: "2023-09-16" },
  { hebrew: 5785, greg: "2024-10-03" },
  { hebrew: 5786, greg: "2025-09-22" },
  { hebrew: 5787, greg: "2026-09-11" },
  { hebrew: 5788, greg: "2027-10-01" },
  { hebrew: 5789, greg: "2028-09-20" },
];

// Calendar for 5786 (2025–2026) — sorted start dates.
// Holidays take priority over parashiyot; list holidays after parasha defaults
// so later entries win when ranges overlap (see normalize logic below).
const STARTS_5786: { date: string; period: string }[] = [
  // Before the year begins: summer general period
  { date: "2025-07-01", period: "general" },

  // High Holidays
  { date: "2025-09-22", period: "RoshHashana" },
  { date: "2025-09-25", period: "AseretYemeiTeshuva" },
  { date: "2025-10-01", period: "YomKippur" },
  { date: "2025-10-03", period: "general" },  // between YK and Sukkot

  // Sukkot / Shemini Atzeret
  { date: "2025-10-06", period: "Sukkot" },
  { date: "2025-10-14", period: "SheminiAtzeret" },
  { date: "2025-10-15", period: "SimchatTorah" }, // Simchat Torah (diaspora) — VeZot HaBracha is read on this day

  // Bereishit cycle
  { date: "2025-10-18", period: "Bereishit" },
  { date: "2025-10-25", period: "Noach" },
  { date: "2025-11-01", period: "LechLecha" },
  { date: "2025-11-08", period: "Vayera" },
  { date: "2025-11-15", period: "ChayeiSarah" },
  { date: "2025-11-22", period: "Toldot" },
  { date: "2025-11-29", period: "Vayetzei" },
  { date: "2025-12-06", period: "Vayishlach" },
  { date: "2025-12-13", period: "Vayeshev" },

  // Chanukah (overrides Vayeshev / Miketz week)
  { date: "2025-12-14", period: "Chanukah" },
  { date: "2025-12-22", period: "Miketz" },

  { date: "2025-12-27", period: "Vayigash" },

  // Shemot cycle
  { date: "2026-01-03", period: "Vayechi" },
  { date: "2026-01-10", period: "Shemot" },
  { date: "2026-01-17", period: "Vaera" },
  { date: "2026-01-24", period: "Bo" },
  { date: "2026-01-31", period: "TuBShvat" },   // 15 Shevat 5786
  { date: "2026-02-02", period: "Beshalach" },
  { date: "2026-02-07", period: "Yitro" },
  { date: "2026-02-14", period: "Mishpatim" },
  { date: "2026-02-21", period: "Terumah" },
  { date: "2026-02-28", period: "Tetzaveh" },

  // Purim (overrides Ki Tisa week)
  { date: "2026-03-01", period: "Purim" },
  { date: "2026-03-04", period: "KiTisa" },
  { date: "2026-03-14", period: "VayakhelPekudei" },

  // Vayikra cycle
  { date: "2026-03-21", period: "Vayikra" },
  { date: "2026-03-28", period: "Tzav" },

  // Pesach
  { date: "2026-04-02", period: "Pesach" },

  // Sefirat HaOmer (post-Pesach through Shavuot)
  { date: "2026-04-10", period: "Shemini" },
  { date: "2026-04-17", period: "TazriaMetzora" },   // combined in non-leap year
  { date: "2026-04-25", period: "AchreiMotKedoshim" }, // combined in non-leap year
  { date: "2026-05-02", period: "Emor" },
  { date: "2026-05-09", period: "BeharBechukotai" },   // combined in non-leap year

  // Bamidbar cycle
  { date: "2026-05-16", period: "Bamidbar" },

  // Shavuot
  { date: "2026-05-21", period: "Shavuot" },

  { date: "2026-05-24", period: "Naso" },
  { date: "2026-05-30", period: "Behaolotcha" },
  { date: "2026-06-06", period: "Shelach" },
  { date: "2026-06-13", period: "Korach" },
  { date: "2026-06-20", period: "Chukat" },
  { date: "2026-06-27", period: "Balak" },
  { date: "2026-07-04", period: "Pinchas" },
  { date: "2026-07-11", period: "MatotMasei" },

  // Three Weeks (17 Tammuz – 9 Av, approx Jul 1–22)
  { date: "2026-07-01", period: "ThreeWeeks" },

  // Devarim cycle
  { date: "2026-07-18", period: "Devarim" },   // Shabbat Chazon (last Shabbat before 9 Av)
  { date: "2026-07-23", period: "Vaetchanan" }, // Shabbat Nachamu
  { date: "2026-08-01", period: "Eikev" },
  { date: "2026-08-08", period: "Reeh" },
  { date: "2026-08-15", period: "Shoftim" },
  { date: "2026-08-22", period: "KiTeitzei" },
  { date: "2026-08-29", period: "KiTavo" },
  { date: "2026-09-05", period: "NitzavimVayelech" },
  { date: "2026-09-12", period: "Haazinu" },

  // Bridge to next RH
  { date: "2026-09-18", period: "general" },
];

// ─── Normalise any date to its equivalent in the 5786 anchor year ────────────

function toMs(dateStr: string): number {
  return new Date(dateStr).getTime();
}

function normaliseToAnchorYear(input: Date): Date {
  const ms = input.getTime();

  // Find which pair of RH anchors brackets this date
  for (let i = 0; i < RH_ANCHORS.length - 1; i++) {
    const thisMs = toMs(RH_ANCHORS[i].greg);
    const nextMs = toMs(RH_ANCHORS[i + 1].greg);

    if (ms >= thisMs && ms < nextMs) {
      const hebrewYear = RH_ANCHORS[i].hebrew;

      // If already in anchor year, return as-is
      if (hebrewYear === 5786) return input;

      // Compute fractional position through the input year (0–1)
      const fraction = (ms - thisMs) / (nextMs - thisMs);

      // Map to anchor year 5786
      const anchorStart = toMs("2025-09-22");
      const anchorEnd = toMs("2026-09-11");
      const anchorMs = anchorStart + fraction * (anchorEnd - anchorStart);

      return new Date(anchorMs);
    }
  }

  // Outside known range — fall back to the input date unchanged
  return input;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the Jewish calendar period for today (e.g. "Bereishit", "Pesach",
 * "Omer", "ThreeWeeks", or "general").
 */
export function getTodaysPeriod(): string {
  const todayKey = getTodayKey();             // "YYYY-MM-DD"
  const todayNorm = normaliseToAnchorYear(new Date(todayKey + "T12:00:00"));
  const normKey = todayNorm.toISOString().slice(0, 10);

  // Walk backwards through sorted starts to find the most-recent match
  const sorted = [...STARTS_5786].sort((a, b) => a.date.localeCompare(b.date));
  let match = "general";
  for (const entry of sorted) {
    if (entry.date <= normKey) {
      match = entry.period;
    } else {
      break;
    }
  }
  return match;
}
