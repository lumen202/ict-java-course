import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WeekFilter } from "./WeekFilter";

export const metadata: Metadata = { title: "Reflections" };

// Teacher view. Access is enforced twice over: requireTeacher() redirects
// non-teachers, and the database's RLS policy only returns other people's rows
// to a user whose profile says teacher. A student hitting this URL directly
// gets bounced, and even if they weren't, the query would come back empty.

type Reflection = {
  id: string;
  created_at: string;
  week_slug: string;
  student_name: string;
  hardest_part: string;
  want_explained: string | null;
};

export default async function TeacherPage({ searchParams }: PageProps<"/teacher">) {
  await requireTeacher("/teacher");
  const { week } = await searchParams;
  const weekFilter = typeof week === "string" ? week : "all";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reflections")
    .select("id, created_at, week_slug, student_name, hardest_part, want_explained")
    .order("created_at", { ascending: false })
    .limit(500);

  const reflections = (data ?? []) as Reflection[];
  const weekSlugs = [...new Set(reflections.map((r) => r.week_slug))].sort();
  const visible =
    weekFilter === "all" ? reflections : reflections.filter((r) => r.week_slug === weekFilter);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight">Student reflections</h1>
      <header className="mt-1 mb-8 flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          What students found hardest — {reflections.length} total, newest first.
        </p>
        {weekSlugs.length > 1 && <WeekFilter weeks={weekSlugs} current={weekFilter} />}
      </header>

      {error && (
        <p className="mb-6 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm">
          Couldn&apos;t load reflections: {error.message}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          No reflections yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{r.student_name}</p>
                <p className="text-xs text-zinc-500">
                  {r.week_slug} · {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Hardest part
                </p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{r.hardest_part}</p>
              </div>
              {r.want_explained && (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Wants explained again
                  </p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {r.want_explained}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
