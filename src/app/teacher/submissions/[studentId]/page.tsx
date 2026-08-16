import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BackLink } from "@/components/BackLink";
import { getWeek } from "@/lib/content";
import { turnInCount } from "@/lib/lesson-steps";
import { studentDisplayNames, teacherUserIds } from "@/lib/student-names";
import { deleteSubmission, dismissClientError, resetStudentDay } from "../../actions";
import { ConfirmButton } from "@/components/ConfirmButton";

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
  pasted: boolean;
  started_at: string | null;
  file_path: string | null;
  file_name: string | null;
};

type ClientErrorLog = {
  id: string;
  created_at: string;
  context: string;
  message: string;
  week_slug: string | null;
  day_number: number | null;
  user_agent: string | null;
};

/**
 * How many turn-ins this day asks for, or 0 when the week/day isn't in the
 * content model any more (an old submission for renamed content) — in which
 * case the count is simply not shown rather than compared against a guess.
 */
function expectedTurnIns(weekSlug: string, dayNumber: number): number {
  const day = getWeek(weekSlug)?.video.days[dayNumber - 1];
  return day ? turnInCount(day) : 0;
}

/** "42s" / "3m 10s" — how long between the box appearing and this landing. */
function elapsedLabel(startedAt: string, updatedAt: string): string {
  const ms = new Date(updatedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

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
  const [{ data }, names, teacherIds, { data: errorData }] = await Promise.all([
    supabase
      .from("submissions")
      .select(
        "id, updated_at, week_slug, day_number, item, student_name, content, pasted, started_at, file_path, file_name",
      )
      .eq("user_id", studentId)
      .order("updated_at", { ascending: false })
      .limit(1000),
    studentDisplayNames(),
    teacherUserIds(),
    // What their browser actually said when something client-side failed —
    // see lib/report-client-error.ts. Shown once, on the student's own page,
    // not per-day: the failure isn't necessarily tied to whichever day is
    // open, and a student stuck badly enough to trigger one is worth seeing
    // regardless of which day they were on.
    supabase
      .from("client_error_logs")
      .select("id, created_at, context, message, week_slug, day_number, user_agent")
      .eq("user_id", studentId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // Guards the same hole as the listing page, for anyone who reaches this
  // route directly (an old link, a typed-in id): a teacher's own account is
  // never a valid "student" to drill into here. Everyone else is fair game,
  // including an account whose profiles row hasn't landed yet.
  if (teacherIds.has(studentId)) notFound();

  const submissions = (data ?? []) as Submission[];
  if (submissions.length === 0) notFound();

  const name = names.get(studentId) || submissions[0].student_name;

  // Day view: ?week=…&day=… shows that day's turn-ins.
  if (weekSlug && dayNumber) {
    const dayWork = submissions
      .filter((s) => s.week_slug === weekSlug && s.day_number === dayNumber)
      .reverse(); // oldest first reads in the order the day was worked
    const focus = getWeek(weekSlug)?.video.days[dayNumber - 1]?.focus;

    // How many turn-in boxes this day actually has, derived from the same
    // content the student walks — so "3 of 11" means three of the eleven
    // things today asks for, not three of some number kept in sync by hand.
    const expected = expectedTurnIns(weekSlug, dayNumber);

    // The `turn-ins` bucket is private, so a stored path isn't directly
    // openable. Sign each one for this render only; the teacher's own session
    // does the signing, so RLS scopes it exactly like every other read.
    const signedByPath = new Map<string, string>();
    await Promise.all(
      dayWork
        .filter((s) => s.file_path)
        .map(async (s) => {
          const { data: signed } = await supabase.storage
            .from("turn-ins")
            .createSignedUrl(s.file_path!, 60 * 60);
          if (signed?.signedUrl) signedByPath.set(s.file_path!, signed.signedUrl);
        }),
    );

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
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {name} —{" "}
          {expected
            ? `${Math.min(dayWork.length, expected)} of ${expected} turned in`
            : `${dayWork.length} turn-in${dayWork.length === 1 ? "" : "s"}`}
          , in the order they were worked.
        </p>

        {/* Handing work back is the point of these controls: the student's
            lesson page unlocks from these rows, so deleting them re-locks
            that part of the day and they walk it again. */}
        <form action={resetStudentDay} className="mt-4 mb-8">
          <input type="hidden" name="userId" value={studentId} />
          <input type="hidden" name="weekSlug" value={weekSlug} />
          <input type="hidden" name="day" value={dayNumber} />
          <ConfirmButton
            className="btn-ghost text-sm"
            confirmLabel="Yes, hand it back"
            message={`Hand back all of Day ${dayNumber} to ${name}?\n\nEvery turn-in for this day is deleted and they redo the whole day. This can't be undone.`}
          >
            ↩ Hand back the whole day
          </ConfirmButton>
        </form>

        <ul className="space-y-4">
          {dayWork.map((s) => (
            <li key={s.id} className="card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {s.item === "day" ? "day wrap-up" : s.item}
                  </span>
                  {/* Advisory only — see src/lib/submission-integrity.ts. Neither
                      badge means anything on its own: pasting your own earlier
                      work is normal, and finishing fast can just mean fast. */}
                  {s.pasted && (
                    <span
                      className="chip bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      title="Some of this was pasted in, not typed"
                    >
                      📋 pasted
                    </span>
                  )}
                  {s.started_at &&
                    (() => {
                      const label = elapsedLabel(s.started_at, s.updated_at);
                      if (!label) return null;
                      const ms =
                        new Date(s.updated_at).getTime() - new Date(s.started_at).getTime();
                      const fast = ms < 30_000;
                      return (
                        <span
                          className={
                            fast
                              ? "chip bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "chip bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }
                          title="Time between the box appearing and this turn-in landing"
                        >
                          ⏱ {label}
                        </span>
                      );
                    })()}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">
                    {new Date(s.updated_at).toLocaleString()}
                  </span>
                  <form action={deleteSubmission}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton
                      className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                      message={`Delete this turn-in (${s.item === "day" ? "day wrap-up" : s.item}) from ${name}?\n\nThey'll need to do it again. This can't be undone.`}
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </span>
              </div>
              <pre className="mt-2 max-h-96 overflow-auto rounded-xl bg-zinc-900/[0.04] dark:bg-white/5 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {s.content}
              </pre>
              {/* An uploaded file (an UploadTask step). The link is a signed
                  URL minted for this render only — the bucket is private, so
                  it expires rather than becoming a shareable public address. */}
              {s.file_path &&
                (signedByPath.has(s.file_path) ? (
                  <a
                    href={signedByPath.get(s.file_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost mt-3 text-sm"
                  >
                    ⬇ Download {s.file_name ?? "their file"}
                  </a>
                ) : (
                  <p className="mt-3 text-xs text-zinc-500">
                    {s.file_name ?? "A file"} was uploaded, but the download link
                    couldn&apos;t be prepared — reload to try again.
                  </p>
                ))}
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

  const clientErrors = (errorData ?? []) as ClientErrorLog[];

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

      {/* What their browser actually said when something client-side failed
          — see lib/report-client-error.ts. A vague "it didn't work" from a
          student becomes readable here instead of staying a black box. */}
      {clientErrors.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-1 text-sm font-semibold text-red-700 dark:text-red-400">
            ⚠ {clientErrors.length} client-side error{clientErrors.length === 1 ? "" : "s"}
          </h2>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            What their browser actually reported — no need to ask them to open
            devtools.
          </p>
          <ul className="space-y-2">
            {clientErrors.map((e) => (
              <li
                key={e.id}
                className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="flex flex-wrap items-center gap-1.5">
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
            ))}
          </ul>
        </section>
      )}

      <ul className="space-y-2">
        {[...days.values()].map((d) => {
          const focus = getWeek(d.week_slug)?.video.days[d.day_number - 1]?.focus;
          const expected = expectedTurnIns(d.week_slug, d.day_number);
          const complete = expected > 0 && d.count >= expected;
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
                    {d.week_slug} ·{" "}
                    {expected ? (
                      <span
                        className={
                          complete ? "text-emerald-700 dark:text-emerald-400 font-medium" : undefined
                        }
                      >
                        {Math.min(d.count, expected)} of {expected} turned in
                      </span>
                    ) : (
                      `${d.count} turn-in${d.count === 1 ? "" : "s"}`
                    )}{" "}
                    · {new Date(d.latest).toLocaleDateString()}
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
