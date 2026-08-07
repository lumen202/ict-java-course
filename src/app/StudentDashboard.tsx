import Link from "next/link";
import { weeks } from "@/lib/content";
import { WeekDoneBadge } from "@/components/WeekProgress";
import { getCourseState, currentLesson, isWeekOpen } from "@/lib/release";
import type { CurrentUser } from "@/lib/auth";

// Student view: today's lesson, and almost nothing else. Unit outlines and
// "how a week works" explainers were removed as noise — the sidebar already
// lists the released days, and anything a student doesn't need today is a
// distraction from the thing they're meant to be doing now.
export async function StudentDashboard({ user }: { user: CurrentUser }) {
  const state = await getCourseState();
  const lesson = currentLesson(state);
  // Only weeks the teacher has actually opened. Content `status` says a week
  // is written, not that the class has reached it — filtering on it alone
  // previewed future weeks' titles on the dashboard.
  const earlier = weeks.filter(
    (w) =>
      w.status === "available" &&
      w.slug !== lesson?.week.slug &&
      isWeekOpen(w, state),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Here&apos;s where the class is today.</p>
      </header>

      {lesson ? (
        <section className="mb-10">
          <div className="card-accent p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <span
                aria-hidden="true"
                className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_10px_24px_-8px_rgb(16_185_129/0.7)]"
              >
                <span className="text-center leading-none">
                  <span className="block text-[10px] font-bold uppercase tracking-widest">Day</span>
                  <span className="block text-3xl font-extrabold">{lesson.dayNumber}</span>
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="section-label text-emerald-700 dark:text-emerald-400">
                    Today&apos;s lesson
                  </p>
                  <WeekDoneBadge slug={lesson.week.slug} />
                </div>
                <p className="mt-1 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                  {lesson.day.focus}
                </p>
                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lesson.day.videos.length === 0
                    ? "No new video today — practice and catch up."
                    : `${lesson.day.videos.length} short video${
                        lesson.day.videos.length > 1 ? "s" : ""
                      }, hands-on activities, then turn in your work.`}
                </p>
              </div>
              <Link
                href={`/week/${lesson.week.slug}?day=${lesson.dayNumber}`}
                className="btn-primary shrink-0 px-6 py-3"
              >
                Start the lesson →
              </Link>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-500">{lesson.week.title}</p>
        </section>
      ) : (
        <section className="mb-10 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing to open yet — your teacher will start the first lesson soon.
        </section>
      )}

      {earlier.length > 0 && (
        <section>
          <h2 className="section-label mb-3">Earlier weeks</h2>
          <ul className="space-y-2">
            {earlier.map((w) => (
              <li key={w.slug}>
                <Link
                  href={`/week/${w.slug}`}
                  className="card flex flex-wrap items-center gap-2 px-4 py-3 text-sm transition-transform hover:-translate-y-0.5"
                >
                  <span aria-hidden="true">📗</span>
                  <span className="font-medium">{w.title}</span>
                  <WeekDoneBadge slug={w.slug} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
