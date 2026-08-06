import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth";
import { weeks } from "@/lib/content";
import { getCourseState, currentLesson } from "@/lib/release";
import { ReleaseControls } from "../ReleaseControls";

export const metadata: Metadata = { title: "Lessons" };

// Where the teacher decides what the class can see. Students only get the days
// released here — everything after is hidden, so nobody skims ahead or drifts.
export default async function LessonsPage() {
  await requireTeacher("/teacher/lessons");

  const state = await getCourseState();
  const lesson = currentLesson(state);
  const available = weeks.filter((w) => w.status === "available");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Lessons</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Control what the class can open today.
      </p>


      <section className="mb-8 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5">
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
      </section>

      <section className="mb-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5">
        <h2 className="text-sm font-semibold mb-1">Release a day</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Students see every day up to and including this one, plus any earlier
          week in full. Later days stay hidden until you move this forward.
        </p>
        <ReleaseControls weeks={available} state={state} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">What each day covers</h2>
        <div className="space-y-4">
          {available.map((w) => (
            <div
              key={w.slug}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{w.unit}</p>
              <p className="font-semibold">{w.title}</p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {w.video.days.map((d, i) => {
                  const isCurrent =
                    w.slug === state.currentWeekSlug && i + 1 === state.currentDay;
                  return (
                    <li key={d.day} className="flex flex-wrap items-baseline gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isCurrent
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {d.day}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300">{d.focus}</span>
                      <span className="text-xs text-zinc-500">
                        {d.videos.length === 0
                          ? "practice only"
                          : `${d.videos.length} video${d.videos.length > 1 ? "s" : ""}`}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
