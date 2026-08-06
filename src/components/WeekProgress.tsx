"use client";

import { useSyncExternalStore } from "react";

// Client-side week progress, stored in localStorage only — deliberately no
// teacher visibility (docs/agent/codebase-map/week-experience.md). A checklist on
// the student's own device, not data the teacher sees; the reflection form is
// the teacher-facing signal.
//
// Read via useSyncExternalStore: the server snapshot is always `false`, and
// React re-reads the real value after hydration, so there's no mismatch and no
// setState-in-effect (which the react-hooks lint rules reject).

const KEY_PREFIX = "jch-done:";

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Also react to changes made in other tabs.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function emit() {
  for (const l of listeners) l();
}

function readDone(slug: string): boolean {
  try {
    return localStorage.getItem(KEY_PREFIX + slug) === "1";
  } catch {
    return false; // storage blocked (private mode etc.) — degrade silently
  }
}

function writeDone(slug: string, done: boolean) {
  try {
    if (done) localStorage.setItem(KEY_PREFIX + slug, "1");
    else localStorage.removeItem(KEY_PREFIX + slug);
  } catch {
    // storage blocked — the toggle just won't persist
  }
  emit();
}

function useWeekDone(slug: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => readDone(slug),
    () => false, // server snapshot: render "not done" during SSR
  );
}

/** Big toggle at the bottom of a week page: "I finished this week". */
export function MarkWeekDone({ slug }: { slug: string }) {
  const done = useWeekDone(slug);

  return (
    <button
      type="button"
      onClick={() => writeDone(slug, !done)}
      aria-pressed={done}
      className={`w-full rounded-lg border p-5 text-left transition-colors ${
        done
          ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40"
          : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500"
      }`}
    >
      <p className="font-semibold">
        {done ? "✅ Week marked as done — nice work!" : "⬜ Mark this week as done"}
      </p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {done
          ? "This only lives in your browser. Tap again to un-mark it."
          : "Sent your reflection? Then you've earned this. Saved in your browser only — your personal checklist."}
      </p>
    </button>
  );
}

/** Small "✓ Done" chip on home-page week cards. Renders nothing until done. */
export function WeekDoneBadge({ slug }: { slug: string }) {
  const done = useWeekDone(slug);

  if (!done) return null;
  return (
    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
      ✓ Done
    </span>
  );
}
