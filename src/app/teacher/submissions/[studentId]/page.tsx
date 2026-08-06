import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { getWeek } from "@/lib/content";
import { studentDisplayNames } from "@/lib/student-names";

export const metadata: Metadata = { title: "Submissions" };

// Levels 2 and 3 of the submissions drill-down, on one route: without ?week &
// ?day it lists the student's days as cards; with them it shows that day's
// turn-ins. RLS already scopes reads — a non-teacher gets redirected and would
// see nothing anyway.

type Submission = {
  id: string;
  updated_at: string;
  week_slug: string;
  day_number: number;
  item: string;
  student_name: string;
  content: string;
};

export default async function StudentSubmissionsPage({
  params,
  searchParams,
}: PageProps<"/teacher/submissions/[studentId]">) {
  await requireTeacher("/teacher/submissions");
  const { studentId } = await params;
  const { week, day } = await searchParams;
  const weekSlug = typeof week === "string" ? week : null;
  const dayNumber = Number(Array.isArray(day) ? day[0] : day) || null;

  const supabase = await createClient();
  const [{ data }, names] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, updated_at, week_slug, day_number, item, student_name, content")
      .eq("user_id", studentId)
      .order("updated_at", { ascending: false })
      .limit(1000),
    studentDisplayNames(),
  ]);

  const submissions = (data ?? []) as Submission[];
  if (submissions.length === 0) notFound();

  const name = names.get(studentId) || submissions[0].student_name;

  // Day view: ?week=…&day=… shows that day's turn-ins.
  if (weekSlug && dayNumber) {
    const dayWork = submissions
      .filter((s) => s.week_slug === weekSlug && s.day_number === dayNumber)
      .reverse(); // oldest first reads in the order the day was worked
    const focus = getWeek(weekSlug)?.video.days[dayNumber - 1]?.focus;

    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
        <div className="mb-6">
          <BackLink href={`/teacher/submissions/${studentId}`} label={name} />
        </div>
        <p className="section-label text-emerald-700 dark:text-emerald-400">
          {weekSlug} · Day {dayNumber}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {focus ?? `Day ${dayNumber}`}
        </h1>
        <p className="mt-1 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
          {name} — {dayWork.length} turn-in{dayWork.length === 1 ? "" : "s"}, in
          the order they were worked.
        </p>

        <ul className="space-y-4">
          {dayWork.map((s) => (
            <li key={s.id} className="card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {s.item === "day" ? "day wrap-up" : s.item}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(s.updated_at).toLocaleString()}
                </span>
              </div>
              <pre className="mt-2 max-h-96 overflow-auto rounded-xl bg-zinc-900/[0.04] dark:bg-white/5 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {s.content}
              </pre>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  // Student view: their days, newest first.
  const days = new Map<string, { week_slug: string; day_number: number; count: number; latest: string }>();
  for (const s of submissions) {
    const key = `${s.week_slug}:${s.day_number}`;
    const d = days.get(key);
    if (d) d.count += 1;
    else
      days.set(key, {
        week_slug: s.week_slug,
        day_number: s.day_number,
        count: 1,
        latest: s.updated_at,
      });
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
      <div className="mb-6">
        <BackLink href="/teacher/submissions" label="All students" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        {days.size} day{days.size === 1 ? "" : "s"} with turned-in work. Open one
        to read it.
      </p>

      <ul className="space-y-2">
        {[...days.values()].map((d) => {
          const focus = getWeek(d.week_slug)?.video.days[d.day_number - 1]?.focus;
          return (
            <li key={`${d.week_slug}:${d.day_number}`}>
              <Link
                href={`/teacher/submissions/${studentId}?week=${encodeURIComponent(d.week_slug)}&day=${d.day_number}`}
                className="card flex flex-wrap items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
              >
                <span className="chip shrink-0 bg-emerald-600 text-white shadow-[0_2px_8px_-2px_rgb(16_185_129/0.6)]">
                  Day {d.day_number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {focus ?? d.week_slug}
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {d.week_slug} · {d.count} turn-in{d.count === 1 ? "" : "s"} ·{" "}
                    {new Date(d.latest).toLocaleDateString()}
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
    </main>
  );
}
