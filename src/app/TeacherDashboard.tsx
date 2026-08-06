import Link from "next/link";
import { weeks } from "@/lib/content";
import { CurriculumList } from "@/components/CurriculumList";
import { createClient } from "@/lib/supabase/server";
import { getCourseState, currentLesson } from "@/lib/release";
import type { CurrentUser } from "@/lib/auth";

// Teacher view of the dashboard: the class at a glance, then the same
// curriculum the students see. All counts come from RLS-scoped queries — the
// "teachers read all" policies are what make them non-empty.
export async function TeacherDashboard({ user }: { user: CurrentUser }) {
  const supabase = await createClient();

  const [{ data: profiles }, { data: reflections }, { count: totalReflections }] =
    await Promise.all([
      supabase.from("profiles").select("id, role, onboarded_at"),
      supabase
        .from("reflections")
        .select("id, created_at, week_slug, student_name, hardest_part")
        .order("created_at", { ascending: false })
        .limit(5),
      // head:true → count only, no rows transferred.
      supabase.from("reflections").select("id", { count: "exact", head: true }),
    ]);

  const students = (profiles ?? []).filter((p) => p.role === "student");
  const pending = students.filter((p) => !p.onboarded_at).length;
  const recent = reflections ?? [];

  const state = await getCourseState();
  const lesson = currentLesson(state);

  const stats = [
    { label: "Students", value: students.length - pending, hint: "set up" },
    { label: "Invites pending", value: pending, hint: "not accepted yet" },
    { label: "Reflections", value: totalReflections ?? 0, hint: "newest below" },
    {
      label: "Weeks published",
      value: weeks.filter((w) => w.status === "available").length,
      hint: "of the full course",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
      <header className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Teacher dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>
      </header>

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-3xl font-bold tabular-nums tracking-tight">{s.value}</p>
            <p className="mt-1 text-sm font-medium">{s.label}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{s.hint}</p>
          </div>
        ))}
      </section>

      {lesson && (
        <section className="card-accent mb-8 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            Class is on
          </p>
          <p className="mt-1 font-semibold">
            {lesson.week.title} — {lesson.day.day}
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {lesson.day.focus}
          </p>
          <Link
            href="/teacher/lessons"
            className="mt-3 inline-block text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Release the next day →
          </Link>
        </section>
      )}

      <section className="mb-10">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="section-label">Latest reflections</h2>
          {recent.length > 0 && (
            <Link href="/teacher" className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline">
              See all →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-sm text-zinc-600 dark:text-zinc-400">
            No reflections yet. They appear here as students finish their weeks.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{r.student_name}</p>
                  <p className="text-xs text-zinc-500">
                    {r.week_slug} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {r.hardest_part}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-label mb-1">Curriculum</h2>
        <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
          What students see. Open any published week to review it as they do.
        </p>
        <CurriculumList showProgress={false} />
      </section>
    </main>
  );
}
