import type { ClassDay } from "./calendar";

// The shape of one payroll sheet, shared by the preview (which edits it) and
// the workbook builder (which renders it). Deliberately plain data with no
// Supabase or React in sight: the API route re-validates whatever the browser
// posts back through parseSheet() before it reaches the writer.

/** What the "Total Amount Received" column is capped at, per student, per month. */
export const DEFAULT_CAP = 1300;

export const PRESENT_MARK = "✓";

export type PayrollPerson = {
  /** The student's account id, or a stable synthetic id for a roster-only row. */
  id: string;
  last: string;
  first: string;
  /** Middle initial as printed, e.g. "P." — often empty. */
  middle: string;
};

export type PayrollRow = PayrollPerson & {
  /** Date keys (YYYY-MM-DD) this student is marked present for. */
  present: string[];
  transportRate: number;
  mealRate: number;
};

/** A roster line before any day is ticked — a row minus its attendance. */
export type PayrollCandidate = Omit<PayrollRow, "present">;

export type Signatory = { name: string; title: string };

export type PayrollHeader = {
  formNo: string;
  title: string;
  project: string;
  venue: string;
  certifier: Signatory;
  approver: Signatory;
  payer: Signatory;
  motto: string;
};

export type PayrollSheet = {
  year: number;
  /** 1-based. */
  month: number;
  /** The columns of the roll, in order — weekdays of the month minus any the teacher dropped. */
  days: ClassDay[];
  rows: PayrollRow[];
  header: PayrollHeader;
  cap: number;
};

// The standing text on the form. Editable in the preview because the coordinator
// and the governor change; kept here so a fresh month starts filled in rather
// than blank.
export const DEFAULT_HEADER: PayrollHeader = {
  formNo: "GENERAL FORM NO. 7(A)",
  title: "TIME BOOK AND PAYROLL",
  project: "Baybay Data Center",
  venue: "Baybay Nat'l High School, Baybay City, Leyte",
  certifier: { name: "JESCYN KATE N. RAMOS", title: "E2P - ICT Coordinator" },
  approver: { name: "CARLOS JERICHO L. PETILLA", title: "Provincial Governor" },
  payer: { name: "JOAN FLORLYN JUSTISA", title: "E2P - ICT" },
  motto: '"IPAKITA SA MUNDO, UMAASENSO NA TAYO"',
};

export function daysPresent(row: PayrollRow, days: ClassDay[]): number {
  const marked = new Set(row.present);
  return days.reduce((n, d) => n + (marked.has(d.date) ? 1 : 0), 0);
}

export function transportAmount(row: PayrollRow, days: ClassDay[]): number {
  return daysPresent(row, days) * row.transportRate;
}

export function mealAmount(row: PayrollRow, days: ClassDay[]): number {
  return daysPresent(row, days) * row.mealRate;
}

/**
 * What the student actually receives. The paper form's formula caps the
 * transportation total on its own because the meal column was never filled in;
 * summing both first is the same number whenever meal is empty, and the honest
 * one when it isn't.
 */
export function totalReceived(row: PayrollRow, days: ClassDay[], cap: number): number {
  return Math.min(transportAmount(row, days) + mealAmount(row, days), cap);
}

export function grandTotal(sheet: PayrollSheet): number {
  return sheet.rows.reduce((sum, row) => sum + totalReceived(row, sheet.days, sheet.cap), 0);
}

/** Surname first, the way the roll reads it. */
export function fullName(person: PayrollPerson): string {
  return [person.last, [person.first, person.middle].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Validation. Everything below re-derives the sheet from untrusted JSON — the
// browser posts the preview's state back to /api/payroll, and the writer must
// never see a string where it expects a number or a 400-column month.
// ---------------------------------------------------------------------------

const MAX_ROWS = 500;
const MAX_DAYS = 31;

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function money(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

function signatory(value: unknown, fallback: Signatory): Signatory {
  const raw = (value ?? {}) as Record<string, unknown>;
  return {
    name: str(raw.name, 120) || fallback.name,
    title: str(raw.title, 120) || fallback.title,
  };
}

/** Returns the sheet, or a reason it can't be one. */
export function parseSheet(input: unknown): { sheet: PayrollSheet } | { error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;

  const year = Number(raw.year);
  const month = Number(raw.month);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return { error: "Bad year." };
  if (!Number.isInteger(month) || month < 1 || month > 12) return { error: "Bad month." };

  const days = Array.isArray(raw.days) ? raw.days : [];
  if (days.length === 0) return { error: "The roll has no days in it." };
  if (days.length > MAX_DAYS) return { error: "Too many days." };

  const cleanDays: ClassDay[] = [];
  for (const d of days) {
    const day = (d ?? {}) as Record<string, unknown>;
    const dayOfMonth = Number(day.day);
    const weekday = str(day.weekday, 2);
    const week = Number(day.week);
    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return { error: "Bad day in the roll." };
    }
    if (!["M", "T", "W", "Th", "F"].includes(weekday)) return { error: "Bad weekday in the roll." };
    cleanDays.push({
      date: str(day.date, 10),
      day: dayOfMonth,
      weekday: weekday as ClassDay["weekday"],
      week: Number.isInteger(week) && week > 0 ? week : 1,
    });
  }

  const rows = Array.isArray(raw.rows) ? raw.rows : [];
  if (rows.length > MAX_ROWS) return { error: "Too many students." };

  const dates = new Set(cleanDays.map((d) => d.date));
  const cleanRows: PayrollRow[] = rows.map((r, i) => {
    const row = (r ?? {}) as Record<string, unknown>;
    const present = Array.isArray(row.present) ? row.present : [];
    return {
      id: str(row.id, 64) || `row-${i}`,
      last: str(row.last, 80),
      first: str(row.first, 80),
      middle: str(row.middle, 20),
      // Ticks for days that aren't columns any more (a dropped holiday) would
      // silently inflate the COUNTIF the workbook writes, so drop them here.
      present: [...new Set(present.map((p) => str(p, 10)).filter((p) => dates.has(p)))],
      transportRate: money(row.transportRate),
      mealRate: money(row.mealRate),
    };
  });

  const header = (raw.header ?? {}) as Record<string, unknown>;
  const capValue = money(raw.cap);

  return {
    sheet: {
      year,
      month,
      days: cleanDays,
      rows: cleanRows,
      cap: capValue > 0 ? capValue : DEFAULT_CAP,
      header: {
        formNo: str(header.formNo, 120) || DEFAULT_HEADER.formNo,
        title: str(header.title, 120) || DEFAULT_HEADER.title,
        project: str(header.project, 200) || DEFAULT_HEADER.project,
        venue: str(header.venue, 200) || DEFAULT_HEADER.venue,
        certifier: signatory(header.certifier, DEFAULT_HEADER.certifier),
        approver: signatory(header.approver, DEFAULT_HEADER.approver),
        payer: signatory(header.payer, DEFAULT_HEADER.payer),
        motto: str(header.motto, 200) || DEFAULT_HEADER.motto,
      },
    },
  };
}
