"use client";

import { useRouter } from "next/navigation";

// Week filter for the teacher views (reflections, submissions). The pages are
// server components, so the filter travels in the URL (?week=…) — that also
// makes a filtered view linkable and survives a refresh.
export function WeekFilter({
  weeks,
  current,
  basePath = "/teacher",
}: {
  weeks: string[];
  current: string;
  basePath?: string;
}) {
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
          router.push(
            value === "all" ? basePath : `${basePath}?week=${encodeURIComponent(value)}`,
          );
        }}
        className="input w-auto"
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
