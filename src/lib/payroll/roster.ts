import type { PayrollCandidate } from "./model";
import { assignedTransportRate } from "./rates";

// Turning the class list and the accounts table into payroll lines: three name
// columns, and the rate each person is already assigned. Kept out of the page
// so both halves can be tested — the name splitting has four fallbacks, and the
// exclusion below is the kind of check that quietly eats a real record if it is
// written loosely.

export type NameColumns = { last: string; first: string; middle: string };

type NameSource =
  | {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
      full_name?: string | null;
      email?: string | null;
    }
  | null
  | undefined;

/**
 * Surname / first name / middle initial, the three name columns the form has.
 * Best source first: the account's own parts (what the student registered as,
 * or what the teacher corrected), then the class list (the teacher's spelling),
 * then whatever `full_name` holds, read as "everything, then the surname".
 */
export function nameParts(profile: NameSource, listed: NameSource): NameColumns {
  const last = profile?.last_name?.trim() || listed?.last_name?.trim() || "";
  const first = profile?.first_name?.trim() || listed?.first_name?.trim() || "";
  if (last || first) return { last, first, middle: middleInitial(profile?.middle_name ?? "") };

  const words = (profile?.full_name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return { last: words[words.length - 1], first: words.slice(0, -1).join(" "), middle: "" };
  }
  if (words.length === 1) return { last: words[0], first: "", middle: "" };

  const email = profile?.email ?? listed?.email ?? "";
  return { last: email.split("@")[0] || "Unknown", first: "", middle: "" };
}

function middleInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  return trimmed.length <= 2 && trimmed.endsWith(".") ? trimmed : `${trimmed[0].toUpperCase()}.`;
}

// Accounts that exist so the app can be tested, not so anyone gets paid. The
// payroll only knows a person by name, so a name is what this matches on — as a
// *whole* name, in either order, never as a substring. A substring rule would
// eventually drop a real surname off a payroll and nobody would notice, which
// is a worse failure than one extra row the teacher deletes.
//
// Deleting the account (or its class-list row) on /teacher/students takes it
// out everywhere rather than only here.
const NOT_ON_THE_PAYROLL = new Set(["TESTACCOUNT"]);

function letters(text: string): string {
  return text.toUpperCase().replace(/[^A-Z]/g, "");
}

export function onThePayroll(person: { first: string; last: string }): boolean {
  const first = letters(person.first);
  const last = letters(person.last);
  return !NOT_ON_THE_PAYROLL.has(first + last) && !NOT_ON_THE_PAYROLL.has(last + first);
}

/**
 * Opens the line at the rate this person is already assigned, or at nothing.
 *
 * Names are upper-cased here rather than at render time, because the preview
 * and the workbook both read these fields and they have to agree — the form is
 * written in capitals, and a name that looked one way on screen and another in
 * the filed document would be this page's one job done wrong.
 */
export function payrollLine(id: string, name: NameColumns): PayrollCandidate {
  return {
    id,
    last: name.last.toUpperCase(),
    first: name.first.toUpperCase(),
    middle: name.middle.toUpperCase(),
    transportRate: assignedTransportRate(name.last, name.first),
    // Every sheet in the workbook leaves the meal column empty.
    mealRate: 0,
  };
}
