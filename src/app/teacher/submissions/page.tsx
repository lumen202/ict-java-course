import type { Metadata } from "next";
import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { studentDisplayNames, teacherUserIds } from "@/lib/student-names";
import { getWeek } from "@/lib/content";
import { turnInCount } from "@/lib/lesson-steps";

export const metadata: Metadata = { title: "Submissions" };

// Turned-in work, level 1 of the drill-down: one card per student. Clicking a
// card opens /teacher/submissions/<id> — that page lists the student's days,
// and a day opens its turn-ins. Separate pages, not accordions: with 5 days a
// week per student, inline expansion would clutter fast.
//
// Names: submissions snapshot student_name at submit time (falls back to the
// email for accounts that never set a name); the current profile name wins
// when present. Fix names on /teacher/students and they correct here too.

type SubmissionRow = {
  updated_at: string;
  user_id: string;
  week_slug: string;
  day_number: number;
  student_name: string;
};

export default async function SubmissionsPage() {
  await requireTeacher("/teacher/submissions");

  const supabase = await createClient();
  const [{ data, error }, nameById, teacherIds, { data: errorRows }] = await Promise.all([
    supabase
      .from("submissions")
      .select("updated_at, user_id, week_slug, day_number, student_name")
      .order("updated_at", { ascending: false })
      .limit(2000),
    studentDisplayNames(),
    teacherUserIds(),
    // Undismissed client-side failures (see report-client-error.ts) — just a
    // count here, so a teacher can spot who to actually worry about without
    // opening every card. The full messages are on their submissions page.
    supabase.from("client_error_logs").select("user_id").limit(2000),
  ]);

  // A teacher testing a lesson leaves turn-ins under their own account just
  // like a student would — keep those out of the class list. Everyone else
  // stays in, even an account whose profiles row hasn't landed yet.
  const rows = ((data ?? []) as SubmissionRow[]).filter((r) => !teacherIds.has(r.user_id));

  const errorCountByUser = new Map<string, number>();
  for (const r of errorRows ?? []) {
    const uid = r.user_id as string;
    errorCountByUser.set(uid, (errorCountByUser.get(uid) ?? 0) + 1);
  }

  // Newest-first input → students ordered by most recent activity, and the
  // first row seen for each student is also their most recent turn-in — which
  // doubles as a decent guess at where they currently are, without a click.
  const students = new Map<
    string,
    {
      name: string;
      latest: string;
      total: number;
      days: Set<string>;
      currentWeekSlug: string;
      currentDay: number;
      /** Turn-ins recorded for that current day specifically. */
      currentDayCount: number;
    }
  >();
  for (const r of rows) {
    let s = students.get(r.user_id);
    if (!s) {
      s = {
        name: nameById.get(r.user_id) || r.student_name,
        latest: r.updated_at,
        total: 0,
        days: new Set(),
        currentWeekSlug: r.week_slug,
        currentDay: r.day_number,
        currentDayCount: 0,
      };
      students.set(r.user_id, s);
    }
    s.total += 1;
    s.days.add(`${r.week_slug}:${r.day_number}`);
    if (r.week_slug === s.currentWeekSlug && r.day_number === s.currentDay) {
      s.currentDayCount += 1;
    }
  }

  /** "unit1-week2" -> "Week 2" — short enough for a card, unlike the full week title. */
  function weekLabel(slug: string): string {
    const n = /week(\d+)/.exec(slug)?.[1];
    return n ? `Week ${n}` : slug;
  }

  /** How many turn-in boxes that day actually has, for the "X of Y today" fraction. */
  function dayTurnInTotal(weekSlug: string, day: number): number | null {
    const d = getWeek(weekSlug)?.video.days[day - 1];
    return d ? turnInCount(d) : null;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight">Turned-in work</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        {students.size} student{students.size === 1 ? "" : "s"} · {rows.length}{" "}
        turn-in{rows.length === 1 ? "" : "s"}. Open a student to see their days.
      </p>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm">
          Couldn&apos;t load submissions: {error.message}
        </p>
      )}

      {students.size === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing turned in yet. Submissions appear here as students work through
          each day&apos;s lesson.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...students.entries()].map(([userId, s]) => {
            const initials =
              s.name
                .split(" ")
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "?";
            const todayTotal = dayTurnInTotal(s.currentWeekSlug, s.currentDay);
            const errorCount = errorCountByUser.get(userId) ?? 0;
            return (
              <li key={userId}>
                <Link
                  href={`/teacher/submissions/${userId}`}
                  className="card flex items-start gap-3 p-4 transition-transform hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white"
                  >
                    {initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold break-words">{s.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {weekLabel(s.currentWeekSlug)} · Day {s.currentDay}
                      </span>
                      {errorCount > 0 && (
                        <span
                          className="chip bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                          title="Client-side errors their browser hit — open their page to read them"
                        >
                          ⚠ {errorCount} error{errorCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      {/* Capped: optional challenge turn-ins aren't in the
                          total, so an over-achiever shows 11 of 11, not 12. */}
                      {todayTotal !== null
                        ? Math.min(s.currentDayCount, todayTotal)
                        : s.currentDayCount}
                      {todayTotal !== null ? ` of ${todayTotal}` : ""} turn-in
                      {todayTotal === 1 ? "" : "s"} today · {s.total} total
                    </span>
                    <span className="block text-xs text-zinc-500">
                      latest {new Date(s.latest).toLocaleDateString()}
                    </span>
                  </span>
                  <span aria-hidden="true" className="mt-2 shrink-0 text-zinc-400">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
