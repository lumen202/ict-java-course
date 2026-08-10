import type { DayActivity, DayGame, DayPlan, Practice, VideoAssignment } from "@/lib/content/types";

// The ordered steps of one lesson day, derived from the day's content.
//
// This exists because two places need the same list and must not drift: the
// week page renders it as the gated timeline, and the teacher's unstuck panel
// names the parts of a day so one of them can be opened for one student. When
// those two disagree, a teacher unsticks a step that isn't the one the student
// is looking at.
//
// It carries structure, not markup: each step names its source object and the
// week page decides how to draw it. Adding a kind here means adding a branch
// there — deliberately, so a new kind can't be silently unrenderable.

export type LessonStep = { key: string; title: string } & (
  | { kind: "game"; game: DayGame }
  | { kind: "activity"; activity: DayActivity }
  | { kind: "video"; video: VideoAssignment; index: number; isLast: boolean }
  | { kind: "closing"; practice: Practice }
  | { kind: "turn-in" }
);

/**
 * The turn-in box this step saves into (`submissions.item`), or null for the
 * steps with no server record — videos and text cards, which are cleared by a
 * button and exist only in the student's own browser.
 */
export function stepItem(step: LessonStep): string | null {
  if (step.kind === "game" || step.kind === "activity") return step.key;
  if (step.kind === "turn-in") return "day";
  return null;
}

/** Steps with no completion of their own get a "continue" button. */
export function stepIsManual(step: LessonStep): boolean {
  return step.kind === "video" || step.kind === "closing";
}

/**
 * The day in order: warm-up game → warm-up activity → each video (with its
 * practice) → the activities → the day's game → the closing task → the turn-in.
 *
 * Keys are what the student's local progress and the teacher's unlock grant are
 * both recorded against, so they must stay stable: games and activities are
 * keyed by their content `id`, videos by `youtubeId` (two identical ids in one
 * day would collide), the closing task by the literal `"closing"` and the final
 * box by `"turn-in"`.
 */
export function daySteps(day: DayPlan): LessonStep[] {
  const steps: LessonStep[] = [];

  if (day.warmupGame) {
    steps.push({
      kind: "game",
      key: day.warmupGame.id,
      title: day.warmupGame.title,
      game: day.warmupGame,
    });
  }

  if (day.warmup) {
    steps.push({
      kind: "activity",
      key: day.warmup.id,
      title: day.warmup.title,
      activity: day.warmup,
    });
  }

  for (const [index, video] of day.videos.entries()) {
    steps.push({
      kind: "video",
      key: video.youtubeId,
      title: `Watch: ${video.title}`,
      video,
      index,
      isLast: index === day.videos.length - 1,
    });
  }

  for (const a of day.activities ?? []) {
    steps.push(
      "kind" in a
        ? { kind: "game", key: a.id, title: a.title, game: a }
        : { kind: "activity", key: a.id, title: a.title, activity: a },
    );
  }

  if (day.game) {
    steps.push({ kind: "game", key: day.game.id, title: day.game.title, game: day.game });
  }

  if (day.practice) {
    steps.push({
      kind: "closing",
      key: "closing",
      title: "Finish the day",
      practice: day.practice,
    });
  }

  steps.push({ kind: "turn-in", key: "turn-in", title: "📤 Turn in today's work" });

  return steps;
}

/**
 * How many steps a `day_unlocks` grant opens.
 *
 * `openPast` is the key of the step the student was stuck on, so the grant has
 * to reach one past it — the same arithmetic `LessonFlow.complete()` does when
 * a step finishes normally. A null key means the teacher opened the whole day.
 * An unrecognised key (content renamed since the grant) opens nothing rather
 * than guessing, and the teacher can re-grant against the current list.
 */
export function unlockedByGrant(steps: LessonStep[], openPast: string | null): number {
  if (openPast === null) return steps.length;
  const i = steps.findIndex((s) => s.key === openPast);
  return i === -1 ? 0 : i + 2;
}
