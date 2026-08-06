import Link from "next/link";
import { notFound } from "next/navigation";
import { weeks, getWeek } from "@/lib/content";
import { SelfCheck } from "@/components/SelfCheck";
import { ReflectionForm } from "@/components/ReflectionForm";

export function generateStaticParams() {
  return weeks.map((w) => ({ slug: w.slug }));
}

export default async function WeekPage({ params }: PageProps<"/week/[slug]">) {
  const { slug } = await params;
  const week = getWeek(slug);
  if (!week) notFound();

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
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="font-semibold text-sm mb-2">🎬 Video track</p>
            <a
              href={week.video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {week.video.title} ↗
            </a>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {week.video.watchNotes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
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
          good shape. Fewer? Revisit your track — that&apos;s normal, not failure.
        </p>
        <SelfCheck items={week.selfCheck} />
      </Section>

      <Section title="💬 Weekly reflection (2 minutes, required)">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          This is how I know what to explain better next week. Honest answers
          only — &quot;it was all easy&quot; helps nobody, including you.
        </p>
        <ReflectionForm weekSlug={week.slug} />
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}
