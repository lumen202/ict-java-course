import Link from "next/link";
import { weeks, roadmap } from "@/lib/content";

// Home page — the course map. Everything here comes from src/lib/content:
// adding a week to `weeks[]` makes it appear here, no edits to this file.
export default function Home() {
  const available = weeks.filter((w) => w.status === "available");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          ICT · Java track
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Java Course Hub</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Everything for this course lives here. Each week gives you two ways to
          learn the same material — a video track and a reading track — then one
          activity you actually build, and a short reflection so I know what to
          go over next time.
        </p>
      </header>

      <section className="mb-10 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5">
        <h2 className="text-sm font-semibold mb-3">How a week works</h2>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Pick a track</span> —
            video or reading. Same material, your choice.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Do the activity</span> —
            including its twist, which can&apos;t be copied from the tutorial.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Check yourself</span> —
            questions with hidden answers. Nothing is recorded.
          </li>
          <li>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">Reflect</span> — two
            minutes, and it&apos;s the part I actually read.
          </li>
        </ol>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Work at your own pace. Nothing here is graded — being stuck is
          information, not failure, so say so in the reflection.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-3">Available now</h2>
        <ul className="space-y-3">
          {available.map((week) => (
            <li key={week.slug}>
              <Link
                href={`/week/${week.slug}`}
                className="block rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 transition-colors hover:border-emerald-500 dark:hover:border-emerald-500"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                  {week.unit}
                </p>
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

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-1">Coming up</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
          The whole course, so you can see where this is going. Each week opens
          up as we get to it.
        </p>
        <div className="space-y-5">
          {roadmap.map((group) => (
            <div key={group.unit}>
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

      <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-6 text-sm text-zinc-500">
        <Link href="/teacher" className="hover:underline">
          Teacher view
        </Link>
      </footer>
    </main>
  );
}
