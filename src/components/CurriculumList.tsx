import Link from "next/link";
import { weeks, roadmap } from "@/lib/content";
import { WeekDoneBadge } from "@/components/WeekProgress";

// The whole course, unit by unit. Available weeks link out; everything still
// being written shows as locked. Driven entirely by src/lib/content, so adding
// a week to `weeks[]` makes it appear here with no edits.

const units = [
  {
    n: 1,
    icon: "🗄️",
    name: "Databases & SQL",
    outcome: "Store and query real data, then reach it from Java with JDBC.",
  },
  {
    n: 2,
    icon: "🖥️",
    name: "JavaFX",
    outcome: "Turn your database work into a desktop app people can click.",
  },
  {
    n: 3,
    icon: "🌐",
    name: "REST APIs",
    outcome: "Put your data on the web with Spring Boot and test it properly.",
  },
  {
    n: 4,
    icon: "🚀",
    name: "Capstone",
    outcome: "Your JavaFX app talking to your own API — a real client–server system.",
  },
];

export function CurriculumList({ showProgress = true }: { showProgress?: boolean }) {
  const available = weeks.filter((w) => w.status === "available");

  return (
    <div className="space-y-4">
      {units.map((unit) => {
        const unitWeeks = available.filter((w) => w.unit.startsWith(`Unit ${unit.n}`));
        const upcoming = roadmap.find((g) => g.unit.startsWith(`Unit ${unit.n}`))?.items ?? [];

        return (
          <div
            key={unit.n}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5"
          >
            <div className="flex items-start gap-3">
              <span aria-hidden="true" className="text-xl">
                {unit.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Unit {unit.n}
                </p>
                <p className="font-semibold">{unit.name}</p>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {unit.outcome}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-1.5 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
              {unitWeeks.map((w) => (
                <li key={w.slug}>
                  <Link
                    href={`/week/${w.slug}`}
                    className="group flex flex-wrap items-center gap-2 rounded-md py-1 text-sm hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <span aria-hidden="true">📗</span>
                    <span className="font-medium">{w.title}</span>
                    {showProgress && <WeekDoneBadge slug={w.slug} />}
                    <span className="text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
                      open →
                    </span>
                  </Link>
                </li>
              ))}
              {upcoming.map((item) => (
                <li key={item} className="flex items-start gap-2 py-1 text-sm text-zinc-500">
                  <span aria-hidden="true">🔒</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
              {unitWeeks.length === 0 && upcoming.length === 0 && (
                <li className="py-1 text-sm text-zinc-500">Planned.</li>
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
