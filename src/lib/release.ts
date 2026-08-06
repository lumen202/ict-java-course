import { weeks, getWeek } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import type { Week } from "@/lib/content/types";

// What the class is working on right now. The teacher moves this forward a day
// at a time; students only see what has been released, so the week page shows
// today's lesson rather than the whole week.

export type CourseState = {
  currentWeekSlug: string;
  currentDay: number; // 1-based index into week.video.days
};

const FALLBACK: CourseState = {
  currentWeekSlug: weeks[0]?.slug ?? "",
  currentDay: 1,
};

export async function getCourseState(): Promise<CourseState> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("course_state")
    .select("current_week_slug, current_day")
    .single();

  if (!data) return FALLBACK;
  return {
    currentWeekSlug: data.current_week_slug ?? FALLBACK.currentWeekSlug,
    currentDay: data.current_day ?? 1,
  };
}

/** Position of a week in the published order; -1 when unknown. */
function weekIndex(slug: string): number {
  return weeks.findIndex((w) => w.slug === slug);
}

/**
 * How many days of `week` a student may see.
 * Past weeks are fully open (for catching up and revision), the current week is
 * open up to the released day, and future weeks are closed entirely.
 */
export function releasedDayCount(week: Week, state: CourseState): number {
  const total = week.video.days.length;
  const here = weekIndex(week.slug);
  const current = weekIndex(state.currentWeekSlug);

  if (here === -1 || current === -1) return total;
  if (here < current) return total;
  if (here > current) return 0;
  return Math.max(0, Math.min(state.currentDay, total));
}

export function isWeekOpen(week: Week, state: CourseState): boolean {
  return releasedDayCount(week, state) > 0;
}

/**
 * The week + day the class is on, resolved against the content registry.
 * `currentDay` of 0 means the teacher has pulled everything back — nothing is
 * released, so there is no current lesson.
 */
export function currentLesson(state: CourseState) {
  const week = getWeek(state.currentWeekSlug);
  if (!week || state.currentDay < 1) return null;
  const dayIndex = Math.min(state.currentDay, week.video.days.length) - 1;
  return { week, day: week.video.days[dayIndex], dayNumber: dayIndex + 1 };
}
