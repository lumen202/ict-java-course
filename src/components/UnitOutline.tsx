import { weeks } from "@/lib/content";

// A quiet, one-line-per-unit map of the course. Deliberately does NOT list the
// individual locked weeks: a wall of 🔒 rows is noise that invites skimming
// ahead, and the teacher releases material one day at a time anyway.
const units = [
  { n: 1, icon: "🗄️", name: "Databases & SQL", outcome: "Store and query real data, then reach it from Java." },
  { n: 2, icon: "🖥️", name: "JavaFX", outcome: "Turn that into a desktop app people can click." },
  { n: 3, icon: "🌐", name: "REST APIs", outcome: "Put your data on the web with Spring Boot." },
  { n: 4, icon: "🚀", name: "Capstone", outcome: "Your app talking to your own API." },
];

export function UnitOutline({ currentWeekSlug }: { currentWeekSlug: string }) {
  const currentUnit = weeks.find((w) => w.slug === currentWeekSlug)?.unit ?? "";

  return (
    <ol className="space-y-2">
      {units.map((u) => {
        const isCurrent = currentUnit.startsWith(`Unit ${u.n}`);
        return (
          <li
            key={u.n}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
              isCurrent
                ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
                : "border-zinc-200 dark:border-zinc-800"
            }`}
          >
            <span aria-hidden="true" className="text-lg">
              {u.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">
                Unit {u.n} — {u.name}
                {isCurrent && (
                  <span className="ml-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    you&apos;re here
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">{u.outcome}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
