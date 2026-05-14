// Quick sanity check for the no-repeat selection logic
// Simulates the core algorithm without importing the full TS stack

function dateHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Simulate BeharBechukotai period (starts 2026-05-09, 7 days)
const PERIOD_START = "2026-05-09";
const PERIOD       = "BeharBechukotai";
const DIFFICULTY   = "easy";

// Fake pool of 45 question IDs (simulating bhbt + general + omer)
const pool = Array.from({ length: 45 }, (_, i) => `q-${String(i+1).padStart(2,"0")}`);

const seed     = dateHash(PERIOD_START + DIFFICULTY + PERIOD);
const shuffled = seededShuffle(pool, seed);

const dates = ["2026-05-09","2026-05-10","2026-05-11","2026-05-12",
               "2026-05-13","2026-05-14","2026-05-15"];

console.log("=== No-repeat selection across 7-day BeharBechukotai period ===\n");
const seen = new Set();
let repeats = 0;

for (const d of dates) {
  const startMs  = new Date(PERIOD_START + "T12:00:00").getTime();
  const todayMs  = new Date(d           + "T12:00:00").getTime();
  const dayOffset = Math.max(0, Math.round((todayMs - startMs) / 86_400_000));
  const selected  = shuffled[dayOffset % shuffled.length];
  const isRepeat  = seen.has(selected);
  if (isRepeat) repeats++;
  seen.add(selected);
  console.log(`${d}  day+${dayOffset}  → ${selected}${isRepeat ? "  ⚠️ REPEAT" : ""}`);
}

console.log(`\n${repeats === 0 ? "✅ Zero repeats across all 7 days." : `❌ ${repeats} repeat(s) found.`}`);
console.log(`Pool size: ${pool.length}  |  Days covered: ${dates.length}`);
