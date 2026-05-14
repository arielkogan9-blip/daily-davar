// TODO: integrate a real Hebrew calendar library (e.g. hebcal) to compute these dynamically

// "en-CA" locale gives ISO YYYY-MM-DD format from toLocaleDateString.
// Both functions use the Asia/Jerusalem timezone so the daily question reset
// matches the countdown timer on the home screen exactly.

export function getTodayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

export function getYesterdayKey(): string {
  // Subtract 24 h then convert — always lands on the previous Jerusalem date.
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return yesterday.toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}
export function getHebrewDateString(): string {
  return "כ׳ אייר תשפ״ו";
}

export function getGregorianDateString(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}
