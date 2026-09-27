import { weeks, getWeek } from "@/lib/content";
import type { Week } from "@/lib/content/types";

// The release rules as pure functions over (week, state) — no auth, no
// database — so they can be unit-tested (release-rules.test.ts). Reading the
// state is lib/release.ts's job, and it re-exports everything here.

export type CourseState = {
  currentWeekSlug: string;
  currentDay: number; // 1-based index into week.video.days
};

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

/**
 * True for a week the class has moved PAST — review territory. The week page
 * turns off the student's step gate for these (teacher, 2026-09-27: "so the
 * students who did not finish their lessons can review them"), so every part
 * of every day is readable and redoable without first clearing the parts
 * before it. The current and later weeks stay gated.
 *
 * Fails closed: an unknown week or an unknown current week is NOT past, unlike
 * releasedDayCount's visibility fallback — this one removes a gate.
 */
export function isPastWeek(week: Week, state: CourseState): boolean {
  const here = weekIndex(week.slug);
  const current = weekIndex(state.currentWeekSlug);
  return here !== -1 && current !== -1 && here < current;
}

/**
 * Review mode on the week page: a past week, or the current week when the
 * teacher has flagged it `openForReview`. Same fail-closed rule — never a week
 * the class hasn't reached, never on an unknown current week.
 */
export function isReviewWeek(week: Week, state: CourseState): boolean {
  if (isPastWeek(week, state)) return true;
  const here = weekIndex(week.slug);
  return here !== -1 && here === weekIndex(state.currentWeekSlug) && week.openForReview === true;
}

/**
 * How many days of `week` a student may OPEN — the released days, or all of
 * them for a week in review mode. Use for what a student sees (week page,
 * lesson list, nav). Never for "what has been released": streaks and the
 * teacher's release list read releasedDayCount, and an unreleased day counted
 * as released there reads as a missed turn-in.
 */
export function visibleDayCount(week: Week, state: CourseState): number {
  return isReviewWeek(week, state) ? week.video.days.length : releasedDayCount(week, state);
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
