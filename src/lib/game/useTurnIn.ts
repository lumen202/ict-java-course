"use client";

import { useCallback, useState } from "react";
import { useFlowComplete } from "@/components/LessonFlow";
import { usePasteFlag, useStepShownAt } from "@/lib/submission-integrity";

// The one place a game hands its result in.
//
// Every game used to carry its own copy of this: the same fetch, the same
// `setSaved(r.ok)`, the same `flowComplete(id)` — ten copies of six lines. It
// looked harmless until a field was added to the payload. When `pasted` and
// `startedAt` (see lib/submission-integrity.ts) were introduced, they reached
// the three games that happened to be edited that day and silently skipped the
// other five: no error, no type failure, just a signal the teacher believed
// was on that was two-thirds absent. Nothing about a duplicated literal makes
// the copies you didn't edit announce themselves.
//
// So the payload is built exactly once, here. A future field is one edit and
// every game gets it — which is the only reason this hook exists.
//
// Callers keep their own phase state: a quest's missions and a boss battle's
// hearts have nothing in common, and a shared "game phase" machine would be an
// abstraction over things that only look alike from a distance.

export type TurnInPayload = {
  /** What the teacher reads — the game's own summary of how it went. */
  content: string;
  /** Set by an UploadTask step; the bucket path its file landed at. */
  filePath?: string;
  fileName?: string;
};

/**
 * `error` carries the server's own wording when it has some — the API says
 * useful things ("the box is empty", "that's too long"), and a caller that
 * shows a generic message instead throws that away.
 */
export type TurnInResult = { ok: boolean; error?: string };

export type TurnIn = {
  /** Hand the result in, and unlock the next step of the day. */
  submit: (payload: TurnInPayload) => Promise<TurnInResult>;
  /** True once the server has it — games show "✓ Turned in" off this. */
  saved: boolean;
  /** Attach to any text input the student types into (paste tracking). */
  onPaste: () => void;
};

export function useTurnIn({
  weekSlug,
  dayNumber,
  item,
}: {
  weekSlug: string;
  dayNumber: number;
  /** The turn-in box this saves into — a game's `id`, or "day". */
  item: string;
}): TurnIn {
  const [saved, setSaved] = useState(false);
  const flowComplete = useFlowComplete();
  const { pasted, onPaste } = usePasteFlag();
  const startedAt = useStepShownAt();

  const submit = useCallback(
    async ({ content, filePath, fileName }: TurnInPayload) => {
      // Unlock first, save second — deliberately. A student who finished the
      // step has finished it; a failed request is our problem to retry, not a
      // reason to lock them out of the rest of the day (see BUG-008).
      flowComplete(item);

      try {
        const res = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weekSlug,
            dayNumber,
            item,
            content,
            pasted,
            startedAt,
            ...(filePath ? { filePath, fileName } : {}),
          }),
        });
        setSaved(res.ok);
        if (res.ok) return { ok: true };
        const data = await res.json().catch(() => ({}));
        return { ok: false, error: (data as { error?: string }).error };
      } catch {
        setSaved(false);
        return { ok: false };
      }
    },
    [weekSlug, dayNumber, item, pasted, startedAt, flowComplete],
  );

  return { submit, saved, onPaste };
}
