import Link from "next/link";
import { weeks, roadmap } from "@/lib/content";
import { WeekDoneBadge } from "@/components/WeekProgress";

// Home page — the course map. Everything here comes from src/lib/content:
// adding a week to `weeks[]` makes it appear here, no edits to this file.

const units = [
  { icon: "🗄️", name: "Databases & SQL", detail: "Tables, queries, JDBC from Java" },
  { icon: "🖥️", name: "JavaFX", detail: "Real desktop apps with a real UI" },
  { icon: "🌐", name: "REST APIs", detail: "Spring Boot — your data on the web" },
  { icon: "🚀", name: "Capstone", detail: "Your app talking to your own API" },
];

export default function Home() {
  const available = weeks.filter((w) => w.status === "available");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      {/* Hero */}
      <header className="mb-12 max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          ICT · Java track
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Learn Java the way it&apos;s{" "}
          <span className="text-emerald-600 dark:text-emerald-400">actually used</span>.
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Databases → desktop apps → web APIs → one capstone that connects them
          all. Two ways to learn every topic, and one thing you actually build
          each week.
        </p>
        {available.length > 0 && (
          <Link
            href={`/week/${available[available.length - 1].slug}`}
            className="mt-6 inline-block rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Start the current week →
          </Link>
        )}
      </header>

      {/* Course arc */}
      <section className="mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {units.map((u, i) => (
          <div
            key={u.name}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4"
          >
            <p className="text-2xl" aria-hidden="true">
              {u.icon}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Unit {i + 1}
            </p>
            <p className="font-semibold">{u.name}</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {u.detail}
            </p>
          </div>
        ))}
      </section>

      {/* How a week works */}
      <section className="mb-12 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
        <h2 className="text-sm font-semibold mb-4">How a week works</h2>
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
        <p className="mt-5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Follow the daily pacing inside each week. If you get stuck, say so in
          the reflection — that&apos;s exactly what it&apos;s for, and it decides
          what gets covered next.
        </p>
      </section>

      {/* Available weeks */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-3">Available now</h2>
        <ul className="space-y-3">
          {available.map((week) => (
            <li key={week.slug}>
              <Link
                href={`/week/${week.slug}`}
                className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 transition-colors hover:border-emerald-500 dark:hover:border-emerald-500"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    {week.unit}
                  </p>
                  <WeekDoneBadge slug={week.slug} />
                </div>
                <p className="mt-1 font-semibold">{week.title}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {week.summary}
                </p>
                <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Start this week →
                </p>
              </Link>
            </li>
          ))}
          {available.length === 0 && (
            <li className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-sm text-zinc-600 dark:text-zinc-400">
              The first week is being written — check back shortly.
            </li>
          )}
        </ul>
      </section>

      {/* Roadmap */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Coming up</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 leading-relaxed">
          The whole course, so you can see where this is going. Each week opens
          up as we get to it.
        </p>
        <div className="space-y-6 border-l-2 border-zinc-200 dark:border-zinc-800 pl-5">
          {roadmap.map((group) => (
            <div key={group.unit} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"
              />
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {group.unit}
              </p>
              <ul className="mt-2 space-y-1.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-zinc-500 leading-relaxed"
                  >
                    <span aria-hidden="true" className="mt-px">
                      🔒
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
