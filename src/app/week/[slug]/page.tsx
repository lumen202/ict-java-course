import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { weeks, getWeek } from "@/lib/content";
import { SelfCheck } from "@/components/SelfCheck";
import { ReflectionForm } from "@/components/ReflectionForm";
import { VideoEmbed } from "@/components/VideoEmbed";
import { MarkWeekDone } from "@/components/WeekProgress";
import { requireUser } from "@/lib/auth";
import { getCourseState, releasedDayCount } from "@/lib/release";

export function generateStaticParams() {
  return weeks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/week/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const week = getWeek(slug);
  if (!week) return {};
  return { title: week.title, description: week.summary };
}

// One day at a time. The sidebar lists the released days; clicking one lands
// here with ?day=N and this page renders that day's lesson only. Everything
// week-level (the build, self-check, reflection) sits below or waits for the
// final day, so a student opening the page sees today's work and nothing else.
export default async function WeekPage({ params, searchParams }: PageProps<"/week/[slug]">) {
  const { slug } = await params;
  const week = getWeek(slug);
  if (!week) notFound();

  const user = await requireUser(`/week/${slug}`);

  // Students see only what the teacher has released; teachers see everything,
  // so they can review a week before opening it to the class.
  const state = await getCourseState();
  const released =
    user.role === "teacher" ? week.video.days.length : releasedDayCount(week, state);

  if (released === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight">{week.title}</h1>
        <p className="mt-4 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          This week hasn&apos;t started yet. Your teacher opens it one day at a
          time — it&apos;ll appear in the sidebar when it&apos;s your turn.
        </p>
      </main>
    );
  }

  const { day: dayParam } = await searchParams;
  const requested = Number(Array.isArray(dayParam) ? dayParam[0] : dayParam);
  // Default to the newest released day — that's "today" for the class.
  const dayNumber =
    Number.isInteger(requested) && requested >= 1 && requested <= released ? requested : released;

  const day = week.video.days[dayNumber - 1];
  const isLastDay = dayNumber === week.video.days.length;
  const prev = dayNumber > 1 ? dayNumber - 1 : null;
  const next = dayNumber < released ? dayNumber + 1 : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      {/* The lesson is the page. The week is context, not the headline — a
          student opening this should see today's topic, not a week banner. */}
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {week.unit} · {day.day}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight leading-snug">{day.focus}</h1>
        <p className="mt-2 text-xs text-zinc-500">
          {day.videos.length === 0
            ? "No video today — practice only."
            : `${totalMinutes(day.videos)} min of video, then the practice below.`}
        </p>
      </header>

      {/* Day switcher — the sidebar does this too, but this keeps it reachable
          on mobile where the sidebar is behind a drawer. */}
      {released > 1 && (
        <nav className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: released }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/week/${week.slug}?day=${n}`}
              aria-current={n === dayNumber ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                n === dayNumber
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              Day {n}
            </Link>
          ))}
        </nav>
      )}

      <section className="mb-10">
        {/* One video per row, each followed by the task it enables. Two videos
            side by side meant watching both and then trying to remember the
            first one. */}
        <div className="space-y-8">
          {day.videos.map((v, i) => (
            <div key={v.youtubeId}>
              <p className="mb-2 text-sm font-medium">
                <span className="mr-2 text-zinc-400">{i + 1}.</span>
                {v.title}
                <span className="ml-2 text-xs font-normal text-zinc-500">{v.length}</span>
              </p>
              <VideoEmbed youtubeId={v.youtubeId} title={v.title} />
              {v.practice && (
                <div className="mt-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
                  <p className="text-sm font-semibold">✍️ Now do this</p>
                  <p className="mt-1 text-sm leading-relaxed">{v.practice}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {day.practice && (
          <div
            className={`rounded-lg border p-4 ${
              day.videos.length > 0
                ? "mt-8 border-zinc-200 dark:border-zinc-800"
                : "mt-0 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
            }`}
          >
            <p className="text-sm font-semibold">
              {day.videos.length > 0 ? "🏁 To finish the day" : "✍️ Today's work"}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{day.practice}</p>
          </div>
        )}

        <ul className="mt-4 space-y-1.5 text-xs text-zinc-500 leading-relaxed">
          {week.video.watchNotes.map((n) => (
            <li key={n}>• {n}</li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between text-sm">
          {prev ? (
            <Link
              href={`/week/${week.slug}?day=${prev}`}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              ← Day {prev}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/week/${week.slug}?day=${next}`}
              className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Day {next} →
            </Link>
          )}
        </div>
      </section>

      {/* Reading track — the alternative to today's video, always available */}
      <details className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
        <summary className="cursor-pointer text-sm font-semibold">
          📖 Prefer reading? Same material, in text
        </summary>
        <ul className="mt-3 space-y-3">
          {week.reading.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                {r.label} ↗
              </a>
              {r.note && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {r.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      </details>

      {/* End-of-week work appears only once the final day is open. The week's
          activity used to sit on every day as a "what you're building" block —
          removed, because its steps are exactly what the daily practice already
          says. What's left that a day can't cover is the twist and the
          hand-in list, and both belong at the end. */}
      {isLastDay && dayNumber === released && (
        <>
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">
              🛠️ Finish {week.activity.title}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">The goal:</span>{" "}
              {week.activity.goal}
            </p>
            <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
              <p className="text-sm font-semibold mb-1">⭐ Your twist (required)</p>
              <p className="text-sm leading-relaxed">{week.activity.twist}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">📦 What to turn in</p>
              <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
                {week.activity.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">✅ Check yourself</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Answer each one out loud or on paper <em>before</em> revealing the
              answer. Four out of {week.selfCheck.length} means you&apos;re in good
              shape; fewer means go back a day, which is completely normal.
            </p>
            <SelfCheck items={week.selfCheck} />
          </section>

          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">🧭 Where are you at?</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Two minutes. Answering honestly is what turns a week of typing into
              something you can actually repeat — and you&apos;ll get a plan back.
            </p>
            <ReflectionForm
              weekSlug={week.slug}
              studentName={user.fullName}
              helpLinks={week.reading.map((r) => ({ label: r.label, url: r.url }))}
            />
          </section>

          <MarkWeekDone slug={week.slug} />
        </>
      )}
    </main>
  );
}

/** Sum "mm:ss" video lengths, rounded up to whole minutes. */
function totalMinutes(videos: { length: string }[]): number {
  const secs = videos.reduce((sum, v) => {
    return sum + v.length.split(":").reduce((s, part) => s * 60 + Number(part), 0);
  }, 0);
  return Math.ceil(secs / 60);
}
