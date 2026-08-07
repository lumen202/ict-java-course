import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth";
import { weeks } from "@/lib/content";
import { getCourseState, currentLesson, releasedDayCount } from "@/lib/release";
import LessonReleaseList, {
  type ReleaseWeek,
} from "@/components/LessonReleaseList";

export const metadata: Metadata = { title: "Lessons" };

// Where the teacher decides what the class can see. Students only get the days
// released here — everything after is hidden, so nobody skims ahead or drifts.
export default async function LessonsPage() {
  await requireTeacher("/teacher/lessons");

  const state = await getCourseState();
  const lesson = currentLesson(state);

  // Flattened for the list component: everything it needs to render and nothing
  // it doesn't, so the release UI never has to reach into the content model.
  const releaseWeeks: ReleaseWeek[] = weeks
    .filter((w) => w.status === "available")
    .map((w) => ({
      slug: w.slug,
      unit: w.unit,
      title: w.title,
      isCurrent: w.slug === state.currentWeekSlug,
      currentDay: state.currentDay,
      openDays: releasedDayCount(w, state),
      days: w.video.days.map((d) => ({
        label: d.day,
        focus: d.focus,
        videos: d.videos.length,
      })),
    }));

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
          any earlier week in full. Releasing an earlier day rolls the class
          back.
        </p>

        <LessonReleaseList weeks={releaseWeeks} />
      </section>
    </main>
  );
}
