"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

// Combat animation triggers, and the one place that decides whether motion
// happens at all.
//
// The reduced-motion check lives HERE rather than only in the stylesheet, on
// purpose. A `@media (prefers-reduced-motion: reduce)` block can switch an
// animation off, but the component still believes it played one — so anything
// timed to the animation (a pose held for its duration, a flash of damage)
// keeps running invisibly. Asking the hook instead means the caller knows it
// is in a no-motion world and can render the calm version deliberately.
//
// The standard this is written to is "reduce, don't strip" (WCAG SC 2.3.3 /
// W3C technique C39): under `reduce` the fight still reports who hit whom, it
// just doesn't lunge, shake or shudder to say so. A student who gets motion
// sick must still be able to tell a right answer from a wrong one.

export type CombatMove =
  | "player-attacks"
  | "boss-attacks"
  /** The blow that ends it — a longer, bigger version of an ordinary hit. */
  | "player-finishes"
  | "boss-finishes"
  | null;

export type CombatFx = {
  /** Which side is swinging right now — drives the CSS class on each fighter. */
  move: CombatMove;
  /**
   * Bumped on every trigger. Used as a React `key` so the element remounts and
   * the CSS animation replays: a one-shot keyframe will not re-run just
   * because a class was re-applied to the same node.
   */
  tick: number;
  /** True when the OS asks for reduced motion — render the still version. */
  stillness: boolean;
  play: (move: Exclude<CombatMove, null>) => void;
  clear: () => void;
};

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribed rather than read once, because this is a setting a person can
 * change mid-session — and on some systems it flips on its own (battery
 * saver, focus modes). Reading it at mount alone would strand whoever turned
 * it on while a battle was already open.
 *
 * Via `useSyncExternalStore` for the reason LessonFlow and WeekProgress use
 * it: no hydration mismatch, and no setState-in-effect.
 */
function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function readMotion() {
  return window.matchMedia(MOTION_QUERY).matches;
}

/** The server can't know the preference; the client corrects on first paint. */
function readMotionOnServer() {
  return false;
}

export function useCombatFx(): CombatFx {
  const [move, setMove] = useState<CombatMove>(null);
  const [tick, setTick] = useState(0);
  const stillness = useSyncExternalStore(subscribeMotion, readMotion, readMotionOnServer);

  const play = useCallback((next: Exclude<CombatMove, null>) => {
    setMove(next);
    setTick((n) => n + 1);
  }, []);

  const clear = useCallback(() => setMove(null), []);

  return { move, tick, stillness, play, clear };
}
