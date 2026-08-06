"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

// Gated lesson timeline: steps reveal one at a time, so the day is a path to
// walk, not a page to skim. A step unlocks the next when it's completed —
// games on finishing, turn-in boxes on saving, videos via an explicit
// "done watching" button — and a 🔒 teaser names what's coming, so there's
// always a next thing to anticipate.
//
// Progress lives in localStorage (per week+day) merged with what the server
// already knows. Teachers see everything ungated. Reads go through
// useSyncExternalStore — same pattern as WeekProgress — so there's no
// hydration mismatch and no setState-in-effect.
//
// Two rules make revisiting sane:
//
//   1. The server unlock is based on the LAST step with a saved turn-in, not
//      the first one without. Videos and text cards have no server record
//      (they're cleared by a button), so a first-gap rule would walk a student
//      who finished the whole day back to video 1 on a different device.
//   2. The stored value carries the number of turn-ins that existed when it
//      was written. If the server now has FEWER, the teacher deleted work —
//      the stored progress is stale and gets discarded, so the gate really
//      does close again on the student's own browser.

const FlowCtx = createContext<(key: string) => void>(() => {});

/** Call with your step's key when the student completes it. No-op outside a flow. */
export function useFlowComplete() {
  return useContext(FlowCtx);
}

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** `{ u: unlocked step count, c: turn-ins on the server when written }` */
type Progress = { u: number; c: number };

function readProgress(key: string): Progress {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "");
    if (parsed && typeof parsed.u === "number" && typeof parsed.c === "number") {
      return parsed as Progress;
    }
  } catch {
    // Missing, blocked, or the older plain-number format — start fresh.
  }
  return { u: 0, c: 0 };
}

/**
 * How far this browser has walked, ignoring progress recorded against more
 * turn-ins than the server still has (the teacher deleted some, so it's stale).
 */
function storedUnlocked(key: string, serverDone: number): number {
  const { u, c } = readProgress(key);
  return c > serverDone ? 0 : u;
}

function writeUnlocked(key: string, value: number, serverDone: number) {
  try {
    localStorage.setItem(key, JSON.stringify({ u: value, c: serverDone } as Progress));
  } catch {
    // Storage blocked — gating still works for this page view via re-render.
  }
  for (const l of listeners) l();
}

export type FlowStep = {
  /** Stable id; completion is reported against it. */
  key: string;
  /** Shown in the 🔒 "up next" teaser. */
  title: string;
  /** Steps with no built-in completion signal (videos, text cards) get a "continue" button. */
  manual?: boolean;
  /** Server-known completion (a saved turn-in) — pre-unlocks past this step. */
  done?: boolean;
  /** The last node gets the ✓ styling. */
  final?: boolean;
};

export function LessonFlow({
  storageKey,
  steps,
  gated,
  children,
}: {
  storageKey: string;
  steps: FlowStep[];
  gated: boolean;
  children: React.ReactNode[];
}) {
  // How many of this day's steps the server has a turn-in for.
  const serverDone = steps.reduce((n, s) => (s.done ? n + 1 : n), 0);

  const stored = useSyncExternalStore(
    subscribe,
    () => storedUnlocked(storageKey, serverDone),
    () => 0,
  );

  // Unlock through the LAST step with a saved turn-in — see the header note.
  let lastDone = -1;
  steps.forEach((s, i) => {
    if (s.done) lastDone = i;
  });
  const serverUnlocked = lastDone + 2;

  const unlocked = gated
    ? Math.min(steps.length, Math.max(stored, serverUnlocked, 1))
    : steps.length;

  const complete = useCallback(
    (key: string) => {
      const i = steps.findIndex((s) => s.key === key);
      if (i === -1) return;
      if (i + 2 > storedUnlocked(storageKey, serverDone)) {
        writeUnlocked(storageKey, i + 2, serverDone);
      }
    },
    [steps, storageKey, serverDone],
  );

  const remaining = steps.length - unlocked;

  return (
    <FlowCtx.Provider value={complete}>
      <ol className="relative space-y-10">
        <span
          aria-hidden="true"
          className="absolute left-[17px] top-4 bottom-4 w-px bg-linear-to-b from-emerald-400/50 via-zinc-300/70 to-emerald-400/50 dark:from-emerald-600/40 dark:via-zinc-700 dark:to-emerald-600/40"
        />
        {steps.slice(0, unlocked).map((s, i) => (
          <li key={s.key} className="relative pl-12 sm:pl-14">
            <span
              aria-hidden="true"
              className={`absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                s.final
                  ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-[0_4px_12px_-4px_rgb(16_185_129/0.7)]"
                  : "border border-zinc-300 bg-white text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {s.final ? "✓" : i + 1}
            </span>
            {children[i]}
            {gated && s.manual && i === unlocked - 1 && unlocked < steps.length && (
              <button
                type="button"
                onClick={() => complete(s.key)}
                className="btn-ghost mt-3"
              >
                ✅ Done with this — continue
              </button>
            )}
          </li>
        ))}

        {gated && unlocked < steps.length && (
          <li className="relative pl-12 sm:pl-14">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full border border-dashed border-zinc-400 dark:border-zinc-600 bg-white/60 dark:bg-zinc-900/60 text-sm"
            >
              🔒
            </span>
            <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4">
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Up next: {steps[unlocked].title}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Finish the step above to unlock it
                {remaining > 1 ? ` — ${remaining} steps left today` : " — it's the last one!"}
              </p>
            </div>
          </li>
        )}
      </ol>
    </FlowCtx.Provider>
  );
}
