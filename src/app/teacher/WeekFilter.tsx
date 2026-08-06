"use client";

import { useRouter } from "next/navigation";

// Week filter for the teacher view. The page itself is a server component, so
// the filter travels in the URL (?week=…) — that also makes a filtered view
// linkable and survives a refresh.
export function WeekFilter({ weeks, current }: { weeks: string[]; current: string }) {
  const router = useRouter();

  return (
    <div>
      <label htmlFor="week-filter" className="block text-xs font-medium mb-1 text-zinc-500">
        Week
      </label>
      <select
        id="week-filter"
        value={current}
        onChange={(e) => {
          const value = e.target.value;
          router.push(value === "all" ? "/teacher" : `/teacher?week=${encodeURIComponent(value)}`);
        }}
        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
      >
        <option value="all">All weeks</option>
        {weeks.map((slug) => (
          <option key={slug} value={slug}>
            {slug}
          </option>
        ))}
      </select>
    </div>
  );
}
