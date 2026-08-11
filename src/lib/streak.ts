import { weeks } from "@/lib/content";
import { releasedDayCount, type CourseState } from "@/lib/release";

// A "day" turned in, not a calendar date — the class doesn't meet daily, so a
// streak counts released days in a row with a turn-in, not consecutive dates.
// Rewards showing up, not being right: unlike a leaderboard or score, this
// stays fine to show a struggling student the same as a strong one, which is
// the same reason no game here hard-blocks on a wrong answer.

export type DayKey = string; // `${weekSlug}:${dayNumber}`

export function dayKey(weekSlug: string, dayNumber: number): DayKey {
  return `${weekSlug}:${dayNumber}`;
}

/** Every released day, in course order (oldest first). */
function releasedDayKeys(state: CourseState): DayKey[] {
  const keys: DayKey[] = [];
  for (const week of weeks) {
    const count = releasedDayCount(week, state);
    for (let day = 1; day <= count; day++) {
      keys.push(dayKey(week.slug, day));
    }
  }
  return keys;
}

/**
 * How many of the most recently released days, walking backward from the
 * newest, this student has a closing turn-in for. Stops at the first gap —
 * a released day with no turn-in — so it resets the moment one is missed
 * rather than counting total days done.
 */
export function currentStreak(state: CourseState, turnedInDays: ReadonlySet<DayKey>): number {
  const keys = releasedDayKeys(state);
  let streak = 0;
  for (let i = keys.length - 1; i >= 0; i--) {
    if (!turnedInDays.has(keys[i])) break;
    streak++;
  }
  return streak;
}
