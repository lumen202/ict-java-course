import type { Metadata } from "next";
import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { studentDisplayNames, teacherUserIds } from "@/lib/student-names";
import { dismissClientError } from "../actions";

export const metadata: Metadata = { title: "Error Logs" };

// A flat, class-wide feed of client-side failures — see
// src/lib/report-client-error.ts and supabase/schema.sql's client_error_logs.
// Unlike /teacher/submissions (a drill-down, because there's a lot of normal
// work to browse), errors are rare and urgent: reverse-chronological, no
// paging into a student first, dismiss right here once read. A student's own
// page (/teacher/submissions/<id>) still shows their errors in place too —
// this route is for "is anyone stuck right now," across the whole class, in
// one look.

type ErrorRow = {
  id: string;
  created_at: string;
  user_id: string;
  context: string;
  message: string;
  week_slug: string | null;
  day_number: number | null;
  user_agent: string | null;
};

export default async function TeacherErrorsPage() {
  await requireTeacher("/teacher/errors");

  const supabase = await createClient();
  const [{ data, error }, nameById, teacherIds] = await Promise.all([
    supabase
      .from("client_error_logs")
      .select("id, created_at, user_id, context, message, week_slug, day_number, user_agent")
      .order("created_at", { ascending: false })
      .limit(500),
    studentDisplayNames(),
    teacherUserIds(),
  ]);

  // Same reasoning as the submissions grid: a teacher testing a lesson can
  // trigger this from their own account, and that's not a student to worry
  // about.
  const rows = ((data ?? []) as ErrorRow[]).filter((r) => !teacherIds.has(r.user_id));

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight">Error logs</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        What a student&apos;s browser actually reported when something client-side
        failed — no need to ask them to open devtools. Newest first; dismiss
        once read.
      </p>

      {error && (
        <p className="mb-6 rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4 text-sm">
          Couldn&apos;t load error logs: {error.message}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing reported. This fills in when a student&apos;s browser hits
          something like a rejected upload.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((e) => {
            const name = nameById.get(e.user_id) || "Unknown student";
            return (
              <li
                key={e.id}
                className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/teacher/submissions/${e.user_id}`}
                      className="font-semibold hover:underline"
                    >
                      {name}
                    </Link>
                    <span className="chip bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                      {e.context}
                    </span>
                    {e.week_slug && e.day_number && (
                      <span className="chip bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {e.week_slug} · Day {e.day_number}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                    <form action={dismissClientError}>
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      >
                        Dismiss
                      </button>
                    </form>
                  </span>
                </div>
                <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-zinc-900/[0.04] dark:bg-white/5 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {e.message}
                </pre>
                {e.user_agent && (
                  <p className="mt-2 truncate text-xs text-zinc-500" title={e.user_agent}>
                    {e.user_agent}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
