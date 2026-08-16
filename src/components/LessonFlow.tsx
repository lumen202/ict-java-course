"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

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
//
// And one rule keeps a student from being trapped: a step that has no
// completion of its own (a game you have to get right, a box you can't fill)
// still offers a way out. Several games only finish on a correct answer, so
// without this a student who can't solve one never reaches the rest of the
// day — not even the turn-in box they'd have used to say they're stuck
// (BUG-008). Unlocking is the teacher's call, not the student's: the button
// here only raises a flag (POST /api/unstuck-requests) for the "Someone
// stuck?" panel; the actual unlock is the `day_unlocks` grant, which arrives
// here as `unlockAtLeast`.

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
  /**
   * Challenge-tier step: badged, and skippable at the frontier without asking
   * the teacher. The skip is self-serve on purpose — a gate that only opens on
   * success traps whoever can't succeed, and optional stretch work must never
   * be that gate.
   */
  optional?: boolean;
  /** Server-known completion (a saved turn-in) — pre-unlocks past this step. */
  done?: boolean;
  /** The last node gets the ✓ styling. */
  final?: boolean;
};

export function LessonFlow({
  storageKey,
  weekSlug,
  dayNumber,
  steps,
  gated,
  unlockAtLeast = 0,
  requestedStep,
  children,
}: {
  storageKey: string;
  /** Identifies the day for the "I'm stuck" flag — see `weekSlug`/`dayNumber` on `/api/unstuck-requests`. */
  weekSlug: string;
  dayNumber: number;
  steps: FlowStep[];
  gated: boolean;
  /**
   * A floor on how many steps are open, from the teacher's `day_unlocks` grant
   * for this student and day. It's a floor rather than a `gated={false}`
   * switch so that unsticking one part of a day leaves the rest of it gated —
   * the student carries on step by step from where they were let past.
   */
  unlockAtLeast?: number;
  /** The step key this student already flagged as stuck on, if any (server-known, survives reload). */
  requestedStep?: string | null;
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
    ? Math.min(steps.length, Math.max(stored, serverUnlocked, unlockAtLeast, 1))
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

  // Saving a turn-in doesn't re-render this page (it's a fetch, not a Server
  // Action), so the count stamped on stored progress stays at whatever it was
  // when the page loaded — usually 0 for a student working straight through.
  // A later hand-back would then look like no change at all and the gate would
  // never close. Catch the baseline up on load instead, once the server render
  // has told us the real number.
  useEffect(() => {
    const { u, c } = readProgress(storageKey);
    if (serverDone > c) writeUnlocked(storageKey, u, serverDone);
  }, [storageKey, serverDone]);

  const remaining = steps.length - unlocked;

  const [asked, setAsked] = useState(requestedStep ?? null);
  const [asking, setAsking] = useState(false);

  const askForHelp = useCallback(
    async (key: string) => {
      setAsking(true);
      try {
        const res = await fetch("/api/unstuck-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekSlug, dayNumber, step: key }),
        });
        if (res.ok) setAsked(key);
      } finally {
        setAsking(false);
      }
    },
    [weekSlug, dayNumber],
  );

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
            {s.optional && (
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                ⭐ Challenge — optional
              </p>
            )}
            {children[i]}
            {gated &&
              i === unlocked - 1 &&
              unlocked < steps.length &&
              (s.manual ? (
                <button
                  type="button"
                  onClick={() => complete(s.key)}
                  className="btn-ghost mt-3"
                >
                  ✅ Done with this — continue
                </button>
              ) : s.optional ? (
                // Optional challenge: the way past is a self-serve skip, not a
                // teacher flag — stretch work must never block the day.
                <button
                  type="button"
                  onClick={() => complete(s.key)}
                  className="btn-ghost mt-3"
                >
                  ⏭️ Skip this challenge — continue
                </button>
              ) : asked === s.key ? (
                // The flag went through — no way to skip themselves past it,
                // just confirmation that the teacher can now see it.
                <p className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  🙋 Your teacher has been notified — they can open this for you.
                </p>
              ) : (
                // Deliberately quiet: the way through is to finish the step,
                // and this is the door out when that isn't happening. It only
                // raises a flag for the teacher — the student can't unlock
                // anything themselves.
                <button
                  type="button"
                  disabled={asking}
                  onClick={() => askForHelp(s.key)}
                  className="mt-3 text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-zinc-800 dark:hover:text-zinc-200 disabled:opacity-60"
                >
                  {asking ? "Letting your teacher know…" : "Stuck on this one? Ask your teacher for help →"}
                </button>
              ))}
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
                {steps[unlocked].optional ? " (optional challenge)" : ""}
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
