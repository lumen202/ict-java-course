import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { weeks } from "@/lib/content";
import { getCourseState, releasedDayCount } from "@/lib/release";

export const metadata: Metadata = { title: "Lessons" };

// The list of lessons a student can open. Clicking "Lessons" in the sidebar
// lands here rather than dropping straight into a day — there has to be a way
// back to the list once you're inside one.
export default async function LessonsPage() {
  const user = await requireUser("/lessons");
  const state = await getCourseState();

  const published = weeks.filter((w) => w.status === "available");
  const groups = published
    .map((week) => {
      const released =
        user.role === "teacher" ? week.video.days.length : releasedDayCount(week, state);
      return { week, days: week.video.days.slice(0, released) };
    })
    .filter((g) => g.days.length > 0)
    .reverse(); // newest week first

  const isCurrent = (slug: string, dayNumber: number) =>
    slug === state.currentWeekSlug && dayNumber === state.currentDay;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Lessons</h1>
      <p className="mt-1 mb-8 text-sm text-zinc-600 dark:text-zinc-400">
        Everything opened so far. Newest first — the green dot is where the class is now.
      </p>

      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          Nothing has been opened yet. Your teacher starts the first lesson soon.
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(({ week, days }) => (
            <section key={week.slug}>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {week.unit}
              </h2>
              <p className="mb-3 text-sm font-medium">{week.title}</p>

              <ul className="space-y-2">
                {days.map((d, i) => {
                  const dayNumber = i + 1;
                  const now = isCurrent(week.slug, dayNumber);
                  return (
                    <li key={d.day}>
                      <Link
                        href={`/week/${week.slug}?day=${dayNumber}`}
                        className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                          now
                            ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-500"
                        }`}
                      >
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            now
                              ? "bg-emerald-600 text-white"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {d.day}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-snug">
                            {d.focus}
                          </span>
                          <span className="mt-0.5 block text-xs text-zinc-500">
                            {d.videos.length === 0
                              ? "Practice only"
                              : `${d.videos.length} video${d.videos.length > 1 ? "s" : ""}`}
                          </span>
                        </span>
                        {now && (
                          <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
