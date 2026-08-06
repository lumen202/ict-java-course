import type { Metadata } from "next";
import Link from "next/link";
import { requireTeacher } from "@/lib/auth";
import { weeks } from "@/lib/content";
import { getCourseState, currentLesson } from "@/lib/release";
import { releaseDay, undoRelease } from "../actions";

export const metadata: Metadata = { title: "Lessons" };

// Where the teacher decides what the class can see. Students only get the days
// released here — everything after is hidden, so nobody skims ahead or drifts.
export default async function LessonsPage() {
  await requireTeacher("/teacher/lessons");

  const state = await getCourseState();
  const lesson = currentLesson(state);
  const available = weeks.filter((w) => w.status === "available");

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-10">
      <h1 className="text-2xl font-bold tracking-tight">Lessons</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Control what the class can open today.
      </p>


      <section className="card-accent mb-8 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Students are on
            </p>
            {lesson ? (
              <>
                <p className="mt-1 font-semibold">
                  {lesson.week.title} — Day {lesson.dayNumber}
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {lesson.day.focus}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm">
                Nothing released — students see the week as not started yet.
              </p>
            )}
          </div>

        </div>

      </section>

      {/* Every day carries its own control. A separate week/day picker existed
          here and was redundant — the list already names every day, so the
          button belongs on the row you're looking at. */}
      <section>
        <h2 className="mb-1 text-sm font-semibold">Every day of the course</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Students can open every day up to and including the released one, plus
          any earlier week in full. Releasing an earlier day rolls the class back.
        </p>

        <div className="space-y-4">
          {available.map((w) => {
            const weekIsCurrent = w.slug === state.currentWeekSlug;
            return (
              <div
                key={w.slug}
                className="card p-5"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {w.unit}
                </p>
                <p className="font-semibold">
                  <Link href={`/week/${w.slug}`} className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline">
                    {w.title}
                  </Link>
                </p>

                <ol className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {w.video.days.map((d, i) => {
                    const dayNumber = i + 1;
                    const isCurrent = weekIsCurrent && dayNumber === state.currentDay;
                    const isOpen = weekIsCurrent && dayNumber <= state.currentDay;

                    return (
                      <li
                        key={d.day}
                        className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 text-sm"
                      >
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isCurrent
                              ? "bg-emerald-600 text-white"
                              : isOpen
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {d.day}
                        </span>

                        <span className="min-w-0 flex-1 text-zinc-700 dark:text-zinc-300">
                          {/* The row links to the lesson itself — reviewing a
                              day before releasing it shouldn't need a detour. */}
                          <Link
                            href={`/week/${w.slug}?day=${dayNumber}`}
                            className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline"
                          >
                            {d.focus}
                          </Link>
                          <span className="ml-2 text-xs text-zinc-500">
                            {d.videos.length === 0
                              ? "practice only"
                              : `${d.videos.length} video${d.videos.length > 1 ? "s" : ""}`}
                          </span>
                        </span>

                        {isCurrent ? (
                          <form action={undoRelease} className="shrink-0">
                            <button
                              type="submit"
                              title={
                                state.currentDay > 1
                                  ? `Roll back to Day ${state.currentDay - 1}`
                                  : "Close the week — students see nothing"
                              }
                              className="rounded-md border border-amber-400 dark:border-amber-700 px-2.5 py-1 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            >
                              ↩ Take back
                            </button>
                          </form>
                        ) : (
                          <form action={releaseDay} className="shrink-0">
                            <input type="hidden" name="weekSlug" value={w.slug} />
                            <input type="hidden" name="day" value={dayNumber} />
                            <button
                              type="submit"
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                isOpen
                                  ? "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  : "bg-linear-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_-2px_rgb(16_185_129/0.6)] hover:from-emerald-400 hover:to-emerald-500"
                              }`}
                            >
                              {isOpen ? "Roll back to here" : "Release"}
                            </button>
                          </form>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
