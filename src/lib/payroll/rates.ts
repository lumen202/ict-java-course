// The daily rates already assigned in the teacher's own workbook
// (` E2PS ICT PHASE 2 Payroll 2026-2027.xlsx`), so a new month opens with the
// numbers the last one was filed with instead of a column of zeroes.
//
// Read off the AUGUST sheet and confirmed identical in SEPTEMBER through
// DECEMBER; JULY is the previous cohort, kept for the same reason. The meal
// column is empty on every sheet, so meal rates start at 0.
//
// This is a lookup table, not a source of truth, and it is keyed on a name —
// so it goes quiet the moment the class changes. An unmatched student starts at
// 0 and the teacher types the rate, exactly as before. When that starts to
// grate, the fix is a `payroll_rates` table keyed by student id, not more rows
// here.

type AssignedRate = {
  last: string;
  first: string;
  /** Pesos per day of attendance. */
  transport: number;
  /** What the workbook meant, where it wrote the rate as a formula. */
  note?: string;
};

const ASSIGNED: AssignedRate[] = [
  // Phase 2 — the AUGUST sheet onwards.
  { last: "DELIMA", first: "LUCKY JADE", transport: 60 },
  { last: "IMPUESTO", first: "KHORVIN CARL", transport: 50 },
  { last: "MORILLA", first: "NICO", transport: 50 },
  { last: "MONTALBAN", first: "KER", transport: 132, note: "66 each way" },
  { last: "MARAPOC", first: "MARK LESTER", transport: 162, note: "81 each way" },

  // Phase 1 — the JULY sheet.
  { last: "BALANSAG", first: "EMMANUEL JAY", transport: 200 },
  { last: "DAPITON", first: "HANNA", transport: 120 },
  { last: "POLIQUIT", first: "RAPLH JERIC", transport: 200 },
  { last: "DEVILLENA", first: "JAYPEE", transport: 200 },
];

/** Letters only, upper case — so "de la Cruz" and "DELACRUZ" are one key. */
function key(name: string): string {
  return name.toUpperCase().replace(/[^A-Z]/g, "");
}

/** First given name only; the roster may hold one where the workbook held two. */
function firstToken(name: string): string {
  return key(name.trim().split(/\s+/)[0] ?? "");
}

const byName = new Map(ASSIGNED.map((r) => [`${key(r.last)}|${firstToken(r.first)}`, r]));

// A surname is only a key while no two people share one. The moment two do,
// this map holds null for it and only the surname+first-name match applies —
// better a rate the teacher has to type than quietly paying one of them the
// other's.
const bySurname = new Map<string, AssignedRate | null>();
for (const rate of ASSIGNED) {
  const surname = key(rate.last);
  bySurname.set(surname, bySurname.has(surname) ? null : rate);
}

/**
 * The transportation rate already assigned to this person, or 0 when the
 * workbook never named them.
 */
export function assignedTransportRate(last: string, first: string): number {
  const exact = byName.get(`${key(last)}|${firstToken(first)}`);
  if (exact) return exact.transport;
  return bySurname.get(key(last))?.transport ?? 0;
}

/** How many of the roster the table recognises — surfaced so a total miss is visible. */
export function countAssigned(people: { last: string; first: string }[]): number {
  return people.reduce((n, p) => n + (assignedTransportRate(p.last, p.first) > 0 ? 1 : 0), 0);
}
