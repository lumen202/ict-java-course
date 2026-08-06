import Link from "next/link";
import { weeks } from "@/lib/content";
import { WeekDoneBadge } from "@/components/WeekProgress";
import { getCourseState, currentLesson } from "@/lib/release";
import type { CurrentUser } from "@/lib/auth";

// Student view: today's lesson, and almost nothing else. Unit outlines and
// "how a week works" explainers were removed as noise — the sidebar already
// lists the released days, and anything a student doesn't need today is a
// distraction from the thing they're meant to be doing now.
export async function StudentDashboard({ user }: { user: CurrentUser }) {
  const state = await getCourseState();
  const lesson = currentLesson(state);
  const published = weeks.filter((w) => w.status === "available");
  const earlier = published.filter((w) => w.slug !== lesson?.week.slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>
      </header>

      {lesson ? (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Today
          </h2>
          <Link
            href={`/week/${lesson.week.slug}#day-${lesson.dayNumber}`}
            className="block rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-6 transition-colors hover:border-emerald-500"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {lesson.day.day}
              </span>
              <WeekDoneBadge slug={lesson.week.slug} />
            </div>
            <p className="mt-3 text-lg font-semibold leading-snug">{lesson.day.focus}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {lesson.day.videos.length === 0
                ? "No new video today — practice and catch up."
                : `${lesson.day.videos.length} short video${
                    lesson.day.videos.length > 1 ? "s" : ""
                  }, then the practice underneath it.`}
            </p>
            <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Start today&apos;s lesson →
            </p>
          </Link>
          <p className="mt-2 text-xs text-zinc-500">{lesson.week.title}</p>
        </section>
      ) : (
        <section className="mb-10 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing to open yet — your teacher will start the first lesson soon.
        </section>
      )}

      {earlier.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Earlier weeks
          </h2>
          <ul className="space-y-2">
            {earlier.map((w) => (
              <li key={w.slug}>
                <Link
                  href={`/week/${w.slug}`}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm hover:border-emerald-500"
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
