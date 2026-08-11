import type { Metadata } from "next";
import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { studentDisplayNames, teacherUserIds } from "@/lib/student-names";

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
  const [{ data, error }, nameById, teacherIds] = await Promise.all([
    supabase
      .from("submissions")
      .select("updated_at, user_id, week_slug, day_number, student_name")
      .order("updated_at", { ascending: false })
      .limit(2000),
    studentDisplayNames(),
    teacherUserIds(),
  ]);

  // A teacher testing a lesson leaves turn-ins under their own account just
  // like a student would — keep those out of the class list. Everyone else
  // stays in, even an account whose profiles row hasn't landed yet.
  const rows = ((data ?? []) as SubmissionRow[]).filter((r) => !teacherIds.has(r.user_id));

  // Newest-first input → students ordered by most recent activity.
  const students = new Map<
    string,
    { name: string; latest: string; total: number; days: Set<string> }
  >();
  for (const r of rows) {
    let s = students.get(r.user_id);
    if (!s) {
      s = {
        name: nameById.get(r.user_id) || r.student_name,
        latest: r.updated_at,
        total: 0,
        days: new Set(),
      };
      students.set(r.user_id, s);
    }
    s.total += 1;
    s.days.add(`${r.week_slug}:${r.day_number}`);
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
            return (
              <li key={userId}>
                <Link
                  href={`/teacher/submissions/${userId}`}
                  className="card flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white"
                  >
                    {initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.name}</span>
                    <span className="block text-xs text-zinc-500">
                      {s.days.size} day{s.days.size === 1 ? "" : "s"} · {s.total}{" "}
                      turn-in{s.total === 1 ? "" : "s"}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      latest {new Date(s.latest).toLocaleDateString()}
                    </span>
                  </span>
                  <span aria-hidden="true" className="text-zinc-400">
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
