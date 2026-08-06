"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { setCurrentLesson, type ReleaseState } from "./actions";
import type { Week } from "@/lib/content/types";
import type { CourseState } from "@/lib/release";

const selectCls =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ReleaseControls({ weeks, state }: { weeks: Week[]; state: CourseState }) {
  // Local week selection so the day list re-renders without a round trip.
  const [weekSlug, setWeekSlug] = useState(state.currentWeekSlug);
  const [action, formAction] = useActionState(setCurrentLesson, {} as ReleaseState);

  const week = weeks.find((w) => w.slug === weekSlug) ?? weeks[0];
  const days = week?.video.days ?? [];

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label htmlFor="week" className="block text-sm font-medium mb-1">
            Week
          </label>
          <select
            id="week"
            name="weekSlug"
            value={weekSlug}
            onChange={(e) => setWeekSlug(e.target.value)}
            className={selectCls}
          >
            {weeks.map((w) => (
              <option key={w.slug} value={w.slug}>
                {w.title}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="day" className="block text-sm font-medium mb-1">
            Day
          </label>
          <select
            id="day"
            name="day"
            defaultValue={
              weekSlug === state.currentWeekSlug ? String(state.currentDay) : "1"
            }
            className={selectCls}
          >
            {days.map((d, i) => (
              <option key={d.day} value={i + 1}>
                {d.day} — {d.focus}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end sm:col-span-1">
          <SubmitButton label="Release this day" />
        </div>
      </form>

      {action.error && <p className="text-sm text-red-600 dark:text-red-400">{action.error}</p>}
      {action.notice && (
        <p className="rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm">
          {action.notice}
        </p>
      )}
    </div>
  );
}
