/**
 * Normalize editorial deadlines to a valid YYYY-MM-DD date for Postgres.
 * Accepts ISO dates and common human-readable dates with ordinal suffixes
 * or parenthetical notes. Empty optional deadlines are stored as null.
 */
export function normalizeContentDeadline(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;

  const raw = String(value).trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
      ? raw
      : undefined;
  }

  const cleaned = raw
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const timestamp = Date.parse(cleaned);
  if (!Number.isFinite(timestamp)) return undefined;

  const date = new Date(timestamp);
  return date.getUTCFullYear().toString().padStart(4, "0") + "-" +
    (date.getUTCMonth() + 1).toString().padStart(2, "0") + "-" +
    date.getUTCDate().toString().padStart(2, "0");
}
