import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { teacherUserIds } from "@/lib/student-names";
import { MONTH_NAMES, parseMonthKey } from "@/lib/payroll/calendar";
import { DEFAULT_CAP, DEFAULT_HEADER, type PayrollCandidate } from "@/lib/payroll/model";
import { countAssigned } from "@/lib/payroll/rates";
import { nameParts, onThePayroll, payrollLine } from "@/lib/payroll/roster";
import { PayrollEditor } from "./PayrollEditor";

export const metadata: Metadata = { title: "Payroll" };

// General Form No. 7(A) — the Time Book and Payroll the coordinator files for
// each month. The form's width is the month: one column per Monday-to-Friday,
// so choosing a different month is choosing a different sheet.
//
// The page's job is to hand the editor a roster and the raw material for a
// first guess at who was in. It deliberately does not decide who was present:
// that needs the *teacher's* calendar day, and this code runs on a server
// that is almost certainly in UTC. So the timestamps go to the browser as
// they are and the bucketing happens there.

type AllowedRow = {
  email: string;
  first_name: string;
  last_name: string;
  added_at: string;
};

type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  role: "student" | "teacher";
};

export default async function PayrollPage({ searchParams }: PageProps<"/teacher/payroll">) {
  await requireTeacher("/teacher/payroll");

  const { month } = await searchParams;
  const now = new Date();
  // Only a starting point. At a month boundary the server's own clock can be a
  // day ahead of or behind the teacher's, which is exactly why the picker is
  // the first control on the page rather than a detail in a menu.
  const period =
    parseMonthKey(typeof month === "string" ? month : undefined) ??
    { year: now.getFullYear(), month: now.getMonth() + 1 };

  const supabase = await createClient();
  const [{ data: allowed }, { data: profiles }, teacherIds] = await Promise.all([
    supabase
      .from("allowed_students")
      .select("email, first_name, last_name, added_at")
      .order("added_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("id, email, first_name, middle_name, last_name, full_name, role"),
    teacherUserIds(),
  ]);

  const classList = (allowed ?? []) as AllowedRow[];
  const people = ((profiles ?? []) as ProfileRow[]).filter((p) => !teacherIds.has(p.id));
  const profileByEmail = new Map(
    people.filter((p) => p.email).map((p) => [p.email!.toLowerCase(), p]),
  );

  const roster: PayrollCandidate[] = [];
  const seen = new Set<string>();

  for (const row of classList) {
    const profile = profileByEmail.get(row.email.toLowerCase());
    if (profile) seen.add(profile.id);
    roster.push(payrollLine(profile?.id ?? `email:${row.email.toLowerCase()}`, nameParts(profile, row)));
  }
  // Someone with an account but no class-list row (the row was removed, or the
  // account predates the list) still worked the month and still gets paid —
  // better an extra line the teacher deletes than a name that silently isn't
  // on the roll.
  for (const profile of people) {
    if (seen.has(profile.id)) continue;
    roster.push(payrollLine(profile.id, nameParts(profile, null)));
  }

  const students = roster
    .filter(onThePayroll)
    .sort((a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first));
  const withKnownRate = countAssigned(students);

  // A window wide enough that no timezone can push a day of the month outside
  // it — the browser trims it down to the teacher's own calendar days. The
  // one-day padding is arithmetic on UTC instants, where a day really is 24
  // hours, not a step across a local day boundary.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const from = new Date(Date.UTC(period.year, period.month - 1, 1) - DAY_MS).toISOString();
  const to = new Date(Date.UTC(period.year, period.month, 1) + DAY_MS).toISOString();

  const { data: turnIns } = await supabase
    .from("submissions")
    .select("user_id, created_at")
    .gte("created_at", from)
    .lt("created_at", to)
    .limit(5000);

  const activity: Record<string, string[]> = {};
  for (const row of turnIns ?? []) {
    const id = row.user_id as string;
    if (teacherIds.has(id)) continue;
    (activity[id] ??= []).push(row.created_at as string);
  }

  const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <main className="mx-auto w-full max-w-[110rem] px-6 py-10 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        General Form No. 7(A), one month at a time. Pick a month and the roll becomes that
        month&apos;s weekdays — ticked in advance wherever someone turned work in that day. Fix
        whatever the turn-ins got wrong, then download the .xlsx.
      </p>
      <p className="mt-1 mb-8 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {withKnownRate > 0
          ? `Daily rates for ${withKnownRate} of ${students.length} came from last year's workbook — check them, and type the rest.`
          : "No daily rates carried over — nobody on this roster is named in last year's workbook, so every rate starts at 0."}
      </p>

      <PayrollEditor
        year={period.year}
        month={period.month}
        monthOptions={MONTH_NAMES.map((name, i) => ({ value: String(i + 1), label: name }))}
        yearOptions={years.map((y) => ({ value: String(y), label: String(y) }))}
        students={students}
        activity={activity}
        header={DEFAULT_HEADER}
        cap={DEFAULT_CAP}
      />
    </main>
  );
}
