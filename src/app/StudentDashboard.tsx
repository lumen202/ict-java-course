import Link from "next/link";
import { weeks } from "@/lib/content";
import { CurriculumList } from "@/components/CurriculumList";
import { WeekDoneBadge } from "@/components/WeekProgress";
import type { CurrentUser } from "@/lib/auth";

// Student view of the dashboard: what to do now, then the full curriculum for
// context. No teacher links of any kind appear here.
export function StudentDashboard({ user }: { user: CurrentUser }) {
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

      {current && (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Your current week
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

      <section>
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Curriculum
        </h2>
        <p className="mb-5 text-sm text-zinc-600 dark:text-zinc-400">
          The whole course, so you always know where this is going. Weeks unlock
          as we reach them.
        </p>
        <CurriculumList />
      </section>

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
