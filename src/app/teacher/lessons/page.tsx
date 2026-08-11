import type { Metadata } from "next";
import { requireTeacher } from "@/lib/auth";
import { weeks, getWeek } from "@/lib/content";
import { daySteps } from "@/lib/lesson-steps";
import { createClient } from "@/lib/supabase/server";
import { getCourseState, currentLesson, releasedDayCount } from "@/lib/release";
import { studentDisplayNames } from "@/lib/student-names";
import LessonReleaseList, {
  type ReleaseWeek,
} from "@/components/LessonReleaseList";
import {
  UnstuckPanel,
  type UnstuckDay,
  type UnstuckStep,
  type UnstuckStudent,
} from "../UnstuckPanel";

export const metadata: Metadata = { title: "Lessons" };

// Where the teacher decides what the class can see. Students only get the days
// released here — everything after is hidden, so nobody skims ahead or drifts.
// The same page carries the per-student unstuck control, since that answers the
// same question one person at a time.
export default async function LessonsPage({ searchParams }: PageProps<"/teacher/lessons">) {
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

  // Every day the unstuck picker can target, and which one it's showing: the
  // day named in ?unstuck=slug:day, else the day the class is on, else day 1 of
  // the first published week (so the panel is usable before anything is
  // released).
  const unstuckDays: UnstuckDay[] = releaseWeeks.flatMap((w) =>
    w.days.map((d, i) => ({
      weekSlug: w.slug,
      weekTitle: w.title,
      day: i + 1,
      focus: d.focus,
    })),
  );

  const { unstuck } = await searchParams;
  const [askedSlug, askedDay] = String(Array.isArray(unstuck) ? unstuck[0] : (unstuck ?? "")).split(
    ":",
  );
  const selected =
    unstuckDays.find((d) => d.weekSlug === askedSlug && d.day === Number(askedDay)) ??
    unstuckDays.find(
      (d) => lesson && d.weekSlug === lesson.week.slug && d.day === lesson.dayNumber,
    ) ??
    unstuckDays[0];

  // Both reads are RLS-scoped to the teacher's own cohort, so a demo teacher
  // sees only their throwaway classmates.
  const supabase = await createClient();
  const [{ data: profiles }, names, { data: unlocks }, { data: requests }] = await Promise.all([
    supabase.from("profiles").select("id, email").eq("role", "student"),
    studentDisplayNames(),
    selected
      ? supabase
          .from("day_unlocks")
          .select("user_id, open_past")
          .eq("week_slug", selected.weekSlug)
          .eq("day_number", selected.day)
      : Promise.resolve({ data: [] as { user_id: string; open_past: string | null }[] }),
    // Students who flagged themselves stuck on the selected day — see
    // src/app/api/unstuck-requests/route.ts. Granting an unlock clears the
    // row (setDayUnlock), so this only ever shows who's still waiting.
    selected
      ? supabase
          .from("unstuck_requests")
          .select("user_id, step")
          .eq("week_slug", selected.weekSlug)
          .eq("day_number", selected.day)
      : Promise.resolve({ data: [] as { user_id: string; step: string | null }[] }),
  ]);

  // The parts of the chosen day, from the same helper the week page renders —
  // so the names in the picker are the headings the student is looking at.
  const selectedWeek = selected ? getWeek(selected.weekSlug) : undefined;
  const steps: UnstuckStep[] = selectedWeek
    ? daySteps(selectedWeek.video.days[selected.day - 1]).map((s) => ({
        key: s.key,
        title: s.title,
      }))
    : [];

  // `undefined` = no grant, `null` = the whole day, a key = let past that part.
  const grantByUser = new Map(
    (unlocks ?? []).map((u) => [u.user_id as string, (u.open_past as string | null) ?? null]),
  );
  const requestByUser = new Map(
    (requests ?? []).map((r) => [r.user_id as string, (r.step as string | null) ?? null]),
  );
  const students: UnstuckStudent[] = (profiles ?? [])
    .map((p) => ({
      id: p.id as string,
      name: names.get(p.id as string) || (p.email as string | null) || "Unknown",
      ...(grantByUser.has(p.id as string) ? { openPast: grantByUser.get(p.id as string)! } : {}),
      ...(requestByUser.has(p.id as string)
        ? { requestedStep: requestByUser.get(p.id as string)! }
        : {}),
    }))
    // Waiting on the teacher floats to the top — that's who this panel is for.
    .sort((a, b) => {
      const waiting = Number(b.requestedStep !== undefined) - Number(a.requestedStep !== undefined);
      return waiting !== 0 ? waiting : a.name.localeCompare(b.name);
    });

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

      {selected && (
        <UnstuckPanel
          days={unstuckDays}
          selected={selected}
          steps={steps}
          students={students}
        />
      )}

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
