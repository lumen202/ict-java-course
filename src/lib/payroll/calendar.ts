// The payroll form's columns are the class days of one month, so everything
// here works in *calendar* days, never in instants. A Date built from
// (year, monthIndex, day) and read back through getDate()/getDay() stays in
// the local zone the whole way; toISOString() would hand back UTC and roll the
// day over for anyone west of it — the classic off-by-one that only shows up
// in the afternoon.

export type Weekday = "M" | "T" | "W" | "Th" | "F";

/** One column of the time roll. `date` is a local YYYY-MM-DD key. */
export type ClassDay = {
  date: string;
  /** Day of the month, 1-31 — what's printed in the "Date" header row. */
  day: number;
  weekday: Weekday;
  /** 1-based week within the month; a new one starts on each Monday. */
  week: number;
};

const WEEKDAY_LETTER: Record<number, Weekday> = { 1: "M", 2: "T", 3: "W", 4: "Th", 5: "F" };

export const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** `2025-08-04` for (2025, 8, 4). Month is 1-based, like the rest of this file. */
export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * The local calendar day a timestamp fell on, as a YYYY-MM-DD key. Call this
 * where the person's own clock is what matters — in the browser for the
 * teacher's timezone, never on a server that is probably running in UTC.
 */
export function localDateKey(at: Date): string {
  return dateKey(at.getFullYear(), at.getMonth() + 1, at.getDate());
}

/** Days in `month` (1-based), leap years included. */
export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return new Date(year, month, 0).getDate();
}

/**
 * Every Monday-to-Friday of the month, in order — the default set of columns
 * for that month's roll. Weekends never appear; individual holidays are for
 * the teacher to drop in the preview, since nothing here knows the calendar.
 */
export function weekdaysOfMonth(year: number, month: number): ClassDay[] {
  const days: ClassDay[] = [];
  let week = 1;

  for (let day = 1; day <= daysInMonth(year, month); day++) {
    const dow = new Date(year, month - 1, day).getDay();
    const weekday = WEEKDAY_LETTER[dow];
    if (!weekday) continue;
    // A month can open mid-week (Aug 2025 starts on a Friday); that stub is
    // week 1, and the first real Monday opens week 2.
    if (dow === 1 && days.length > 0) week++;
    days.push({ date: dateKey(year, month, day), day, weekday, week });
  }

  return days;
}

/** "AUGUST 2025" — the period the form is for. Fixed English, like the form. */
export function periodLabel(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** Splits `2025-08` into its parts, or null if it isn't one. */
export function parseMonthKey(value: string | undefined | null): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec((value ?? "").trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return null;
  return { year, month };
}

/** `2025-08` for (2025, 8) — the shape the ?month= parameter takes. */
export function monthKey(year: number, month: number): string {
  return `${year}-${pad(month)}`;
}
