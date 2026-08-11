"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/Select";

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
      <span className="block text-xs font-medium mb-1 text-zinc-500">Week</span>
      <Select
        ariaLabel="Week"
        value={current}
        onChange={(value) => {
          router.push(
            value === "all" ? basePath : `${basePath}?week=${encodeURIComponent(value)}`,
          );
        }}
        options={[{ value: "all", label: "All weeks" }, ...weeks.map((slug) => ({ value: slug, label: slug }))]}
      />
    </div>
  );
}
