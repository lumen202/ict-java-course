"use client";

import { useState } from "react";

// Two advisory signals attached to a turn-in, for the teacher to weigh —
// neither blocks a submission or scores it. Pasting your own earlier work is
// legitimate (Day 1's exit ticket explicitly asks students to paste their
// Workbench history), and finishing fast is what mastery looks like for some
// students — so this is context for a human, never an automated gate. See
// docs/agent/bugs/BUG-008-unsolvable-step-locks-the-rest-of-the-day.md for
// why a gate that gets this wrong is worse than no signal at all.

/** Sticky once true: at least one paste landed in a tracked field this attempt. */
export function usePasteFlag() {
  const [pasted, setPasted] = useState(false);
  const onPaste = () => setPasted(true);
  return { pasted, onPaste };
}

/**
 * ISO timestamp captured once, the moment this hook first runs — a cheap
 * proxy for "when this box became visible to the student," since these boxes
 * only render once their step unlocks. Resets on remount (e.g. reloading the
 * page mid-attempt), so it reads as "time since this visit began," not
 * cumulative work time — good enough to flag a same-visit sprint, not a
 * forensic timer.
 */
export function useStepShownAt(): string {
  const [shownAt] = useState(() => new Date().toISOString());
  return shownAt;
}
