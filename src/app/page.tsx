import Link from "next/link";
import { weeks, roadmap } from "@/lib/content";
import { WeekDoneBadge } from "@/components/WeekProgress";
import { requireUser } from "@/lib/auth";

// Course dashboard — the syllabus, not a sales page. Signed-out visitors never
// see this: requireUser() sends them to /login, which is the only public page.
// Everything here comes from src/lib/content, so adding a week to `weeks[]`
// makes it appear with no edits to this file.

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

export default async function Home() {
  const user = await requireUser("/");
  const available = weeks.filter((w) => w.status === "available");
  const current = available[available.length - 1];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          ICT · Java track
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user.fullName.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Four units, one week at a time. Each week has a video track and a
          reading track covering the same material — take whichever suits you —
          something to build, and a short reflection at the end.
        </p>
      </header>

      {/* Continue where you left off */}
      {current && (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Continue
          </h2>
          <Link
            href={`/week/${current.slug}`}
            className="block rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 transition-colors hover:border-emerald-500"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {current.unit}
              </p>
              <WeekDoneBadge slug={current.slug} />
            </div>
            <p className="mt-1 font-semibold">{current.title}</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {current.summary}
            </p>
            <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Open this week →
            </p>
          </Link>
        </section>
      )}

      {/* The curriculum */}
      <section>
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Curriculum
        </h2>
        <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
          The whole course, so you always know where this is going. Weeks unlock
          as we reach them.
        </p>

        <div className="space-y-4">
          {units.map((unit) => {
            const unitWeeks = available.filter((w) => w.unit.startsWith(`Unit ${unit.n}`));
            const upcoming =
              roadmap.find((g) => g.unit.startsWith(`Unit ${unit.n}`))?.items ?? [];

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
                        <WeekDoneBadge slug={w.slug} />
                        <span className="text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
                          open →
                        </span>
                      </Link>
                    </li>
                  ))}
                  {upcoming.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 py-1 text-sm text-zinc-500"
                    >
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
      </section>

      {/* How a week works — reference, kept below the fold */}
      <section className="mt-10 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          How a week works
        </h2>
        <ol className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pick a track", "Video or reading — same material, your choice."],
            ["Do the activity", "Including its twist, which can't be copied from the tutorial."],
            ["Check yourself", "Questions with hidden answers. Nothing is recorded."],
            ["Reflect", "Two minutes, and it's the part I actually read."],
          ].map(([title, detail], i) => (
            <li key={title} className="flex gap-3">
              <span
                aria-hidden="true"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white"
              >
                {i + 1}
              </span>
              <span>
                <span className="block font-medium">{title}</span>
                <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
