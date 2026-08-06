import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { weeks, getWeek } from "@/lib/content";
import { SelfCheck } from "@/components/SelfCheck";
import { ReflectionForm } from "@/components/ReflectionForm";
import { VideoEmbed } from "@/components/VideoEmbed";
import { MarkWeekDone } from "@/components/WeekProgress";
import { requireUser } from "@/lib/auth";

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

export default async function WeekPage({ params }: PageProps<"/week/[slug]">) {
  const { slug } = await params;
  const week = getWeek(slug);
  if (!week) notFound();

  // The whole course is behind sign-in — /login is the only public page.
  const user = await requireUser(`/week/${slug}`);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← All weeks
      </Link>

      <header className="mt-4 mb-10">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          {week.unit}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{week.title}</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">{week.summary}</p>
      </header>

      <Section title="🎯 By the end of this week you can…">
        <ul className="list-disc pl-5 space-y-1.5 text-sm leading-relaxed">
          {week.objectives.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </Section>

      <Section title="📚 Pick your track">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Both tracks cover the same material — choose whichever way you learn
          best, or mix them. The activity below is the same for everyone.
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-sm">🎬 Video track — {week.video.title}</p>
              <a
                href={week.video.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Full playlist on YouTube ↗
              </a>
            </div>
            <ul className="mt-2 mb-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {week.video.watchNotes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
            <div className="space-y-4">
              {week.video.days.map((d) => (
                <div
                  key={d.day}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">
                      <span className="mr-2 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                        {d.day}
                      </span>
                      {d.focus}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {d.videos.length === 0
                        ? "no video — practice day"
                        : `${totalMinutes(d.videos)} min of video`}
                    </p>
                  </div>
                  {d.videos.length > 0 && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {d.videos.map((v) => (
                        <div key={v.youtubeId}>
                          <VideoEmbed youtubeId={v.youtubeId} title={v.title} />
                          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                            {v.title}{" "}
                            <span className="text-zinc-400 dark:text-zinc-500">
                              · {v.length}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold">✍️ Then do:</span> {d.practice}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="font-semibold text-sm mb-2">📖 Reading track</p>
            <ul className="space-y-3">
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
          </div>
        </div>
      </Section>

      <Section title={`🛠️ Activity: ${week.activity.title}`}>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">Goal:</span>{" "}
          {week.activity.goal}
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
          {week.activity.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="mt-5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
          <p className="text-sm font-semibold mb-1">⭐ Your twist (required)</p>
          <p className="text-sm leading-relaxed">{week.activity.twist}</p>
        </div>
        <div className="mt-5">
          <p className="text-sm font-semibold mb-2">📦 What to turn in</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {week.activity.deliverables.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="✅ Check yourself (nothing is recorded)">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Answer each question out loud or on paper <em>before</em> revealing
          the answer. If you get 4 out of {week.selfCheck.length}, you&apos;re in
          good shape. Fewer? Revisit your track — totally normal.
        </p>
        <SelfCheck items={week.selfCheck} />
      </Section>

      <Section title="💬 Weekly reflection (2 minutes, required)">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          This is how I know what to explain better next week. Honest answers
          only — &quot;it was all easy&quot; helps nobody, including you.
        </p>
        <ReflectionForm weekSlug={week.slug} studentName={user.fullName} />
      </Section>

      <MarkWeekDone slug={week.slug} />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}
