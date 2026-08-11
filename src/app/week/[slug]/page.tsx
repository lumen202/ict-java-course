import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { weeks, getWeek } from "@/lib/content";
import type { DayActivity, DayGame, Practice } from "@/lib/content/types";
import {
  daySteps,
  stepItem,
  stepIsManual,
  unlockedByGrant,
  type LessonStep,
} from "@/lib/lesson-steps";
import { LessonFlow, type FlowStep } from "@/components/LessonFlow";
import { RowHunt } from "@/components/RowHunt";
import { Quest } from "@/components/Quest";
import { TypingGame } from "@/components/TypingGame";
import { WorkbenchSim } from "@/components/WorkbenchSim";
import { SqlConsole } from "@/components/SqlConsole";
import { OrderGame } from "@/components/OrderGame";
import { AnswerSheet } from "@/components/AnswerSheet";
import { SelfCheck } from "@/components/SelfCheck";
import { ReflectionForm } from "@/components/ReflectionForm";
import { SubmissionForm } from "@/components/SubmissionForm";
import { BossBattle } from "@/components/BossBattle";
import { VideoEmbed } from "@/components/VideoEmbed";
import { MarkWeekDone } from "@/components/WeekProgress";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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

// One day at a time, rendered as a guided timeline: warm-up, then each video
// with its practice, then the activities, then the closing task, and finally
// the turn-in box. The numbered rail makes "work through it in order" the
// visible structure of the page, not a rule the student has to remember.
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
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-bold tracking-tight">{week.title}</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
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

  // The student's existing turn-ins for this day (one per activity plus the
  // closing 'day' box), so each box reopens with their work in it. Errors
  // (e.g. table not created yet) degrade to empty boxes.
  const supabase = await createClient();
  const [{ data: existingRows }, { data: unlockRow }, { data: requestRow }] = await Promise.all([
    supabase
      .from("submissions")
      .select("item, content, updated_at")
      .eq("user_id", user.id)
      .eq("week_slug", week.slug)
      .eq("day_number", dayNumber),
    // The teacher's "unstuck" grant for this exact day, if there is one — it
    // opens the whole day at once. Students can only read their own row (RLS),
    // and there is no student-side way to create one.
    supabase
      .from("day_unlocks")
      .select("open_past")
      .eq("user_id", user.id)
      .eq("week_slug", week.slug)
      .eq("day_number", dayNumber)
      .maybeSingle(),
    // A flag this student already raised for this day, if any — so the "ask
    // your teacher" confirmation survives a reload instead of resetting.
    supabase
      .from("unstuck_requests")
      .select("step")
      .eq("user_id", user.id)
      .eq("week_slug", week.slug)
      .eq("day_number", dayNumber)
      .maybeSingle(),
  ]);
  const existingByItem = new Map(
    (existingRows ?? []).map((r) => [r.item as string, r]),
  );

  const activityForm = (a: DayActivity) => {
    const saved = existingByItem.get(a.id);
    return (
      <SubmissionForm
        weekSlug={week.slug}
        dayNumber={dayNumber}
        item={a.id}
        label="📤 Turn in this activity"
        placeholder={a.submit ?? "Type or paste this activity's result here."}
        rows={4}
        initialContent={saved?.content ?? ""}
        turnedInAt={saved?.updated_at ?? null}
      />
    );
  };

  const renderGame = (g: DayGame) =>
    g.kind === "row-hunt" ? (
      <RowHunt weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    ) : g.kind === "quest" ? (
      <Quest weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    ) : g.kind === "typing" ? (
      <TypingGame weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    ) : g.kind === "workbench-sim" ? (
      <WorkbenchSim weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    ) : g.kind === "sql-console" ? (
      <SqlConsole weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    ) : g.kind === "order" ? (
      <OrderGame weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    ) : g.kind === "answer-sheet" ? (
      <AnswerSheet weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    ) : (
      <BossBattle weekSlug={week.slug} dayNumber={dayNumber} game={g} />
    );

  // The day's steps come from `lib/lesson-steps.ts` so that the teacher's
  // unstuck panel names exactly the parts this page renders. Everything below
  // is presentation: `manual` steps (videos, text cards) get a "continue"
  // button, and games and turn-in boxes unlock the next step by themselves.
  const stepList = daySteps(day);

  const renderStep = (s: LessonStep): React.ReactNode => {
    switch (s.kind) {
      case "game":
        return renderGame(s.game);
      case "activity":
        return <ActivityCard activity={s.activity} form={activityForm(s.activity)} />;
      case "video":
        return (
          <div>
            <p className="mb-2 text-sm font-medium">
              {s.video.title}
              <span className="ml-2 text-xs font-normal text-zinc-500">{s.video.length}</span>
            </p>
            <VideoEmbed youtubeId={s.video.youtubeId} title={s.video.title} />
            {s.video.practice && (
              <div className="mt-4 border-l-2 border-emerald-500/70 pl-4 text-zinc-700 dark:text-zinc-300">
                <p className="section-label text-emerald-700 dark:text-emerald-400">
                  ✍️ Now do this
                </p>
                <PracticeContent practice={s.video.practice} />
              </div>
            )}
            {s.isLast && week.video.watchNotes.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                  How to watch so it sticks
                </summary>
                <ul className="mt-2 space-y-1.5 text-xs text-zinc-500 leading-relaxed">
                  {week.video.watchNotes.map((n) => (
                    <li key={n}>• {n}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        );
      case "closing":
        return (
          <div className={day.videos.length > 0 ? "card p-4" : "card-accent p-4"}>
            <p className="text-sm font-semibold">
              {day.videos.length > 0 ? "🏁 To finish the day" : "✍️ Today's work"}
            </p>
            <PracticeContent practice={s.practice} />
          </div>
        );
      case "turn-in":
        return (
          <div className="card-accent p-5">
            <p className="text-base font-semibold">📤 Turn in today&apos;s work</p>
            <p className="mt-1 mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              This is the part that makes today count: your queries, your answers,
              your questions — in your own words.
            </p>
            <SubmissionForm
              weekSlug={week.slug}
              dayNumber={dayNumber}
              initialContent={existingByItem.get("day")?.content ?? ""}
              turnedInAt={existingByItem.get("day")?.updated_at ?? null}
            />
          </div>
        );
    }
  };

  const steps: (FlowStep & { body: React.ReactNode })[] = stepList.map((s) => {
    const item = stepItem(s);
    return {
      key: s.key,
      title: s.title,
      manual: stepIsManual(s) || undefined,
      done: item ? existingByItem.has(item) : undefined,
      final: s.kind === "turn-in" || undefined,
      body: renderStep(s),
    };
  });

  // The teacher's grant, if any: `open_past` names the step they were stuck on
  // and the grant reaches one past it; a null key means the whole day.
  const openPast = unlockRow ? ((unlockRow.open_past as string | null) ?? null) : null;
  const unlockAtLeast = unlockRow ? unlockedByGrant(stepList, openPast) : 0;
  const unstuckStep = openPast ? stepList.find((s) => s.key === openPast) : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10 lg:px-10">
      {/* Day hero: the lesson is the page, the week is context. */}
      <header className="mb-8">
        <p className="section-label text-emerald-700 dark:text-emerald-400">{week.unit}</p>
        <div className="mt-3 flex items-start gap-4">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_8px_20px_-8px_rgb(16_185_129/0.7)]"
          >
            <span className="text-center leading-none">
              <span className="block text-[9px] font-bold uppercase tracking-widest">Day</span>
              <span className="block text-xl font-extrabold">{dayNumber}</span>
            </span>
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight leading-snug">{day.focus}</h1>
            <p className="mt-1 text-xs text-zinc-500">{daySubtitle(day)}</p>
          </div>
        </div>
      </header>

      {/* Shown immediately, not buried at the end of the day — a heads-up only
          means something if it arrives before the choice it's about, not after.
          Friendly, not a warning: pasting your own earlier work is normal and
          explicitly encouraged elsewhere in this flow. */}
      {user.role !== "teacher" && (
        <p className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 p-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          💡 Quick heads up: your teacher can see whether an answer was pasted
          in and roughly how long a box took to fill — not a big deal, pasting
          your own earlier work is totally fine. It&apos;s just there so they
          have context if something looks off.
        </p>
      )}

      {/* Day switcher — the sidebar does this too, but this keeps it reachable
          on mobile where the sidebar is behind a drawer. */}
      {released > 1 && (
        <nav className="mb-10 flex flex-wrap gap-2">
          {Array.from({ length: released }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/week/${week.slug}?day=${n}`}
              aria-current={n === dayNumber ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                n === dayNumber
                  ? "bg-linear-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_4px_12px_-4px_rgb(16_185_129/0.6)]"
                  : "bg-zinc-900/5 text-zinc-600 hover:bg-zinc-900/10 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10"
              }`}
            >
              Day {n}
            </Link>
          ))}
        </nav>
      )}

      {/* The gated timeline: steps unlock one at a time for students (games on
          finish, boxes on save, videos via "done watching"), so the day is a
          path with a next thing to look forward to — not a page to skim.
          Teachers see everything at once, and so does a student the teacher has
          unstuck for this day. */}
      <section className="mb-12">
        {unlockAtLeast > 0 && user.role !== "teacher" && (
          <p className="mb-6 rounded-2xl border border-emerald-300/80 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/30 p-4 text-sm leading-relaxed">
            {unstuckStep ? (
              <>
                🔓 Your teacher opened the next part of today for you — carry on
                past <span className="font-medium">{unstuckStep.title}</span>. You
                can still come back to it.
              </>
            ) : (
              <>
                🔓 Your teacher opened the whole of today for you. Work through it
                in whatever order helps — nothing here is locked.
              </>
            )}
          </p>
        )}
        <LessonFlow
          storageKey={`jch-flow:${week.slug}:${dayNumber}`}
          weekSlug={week.slug}
          dayNumber={dayNumber}
          gated={user.role !== "teacher"}
          unlockAtLeast={unlockAtLeast}
          requestedStep={requestRow ? ((requestRow.step as string | null) ?? null) : undefined}
          steps={steps.map(({ key, title, manual, done, final }) => ({
            key,
            title,
            manual,
            done,
            final,
          }))}
        >
          {steps.map((s) => (
            <div key={s.key}>{s.body}</div>
          ))}
        </LessonFlow>

        <div className="mt-10 flex items-center justify-between">
          {prev ? (
            <Link href={`/week/${week.slug}?day=${prev}`} className="btn-ghost">
              ← Day {prev}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/week/${week.slug}?day=${next}`} className="btn-primary">
              Day {next} →
            </Link>
          )}
        </div>
      </section>

      {/* Reading track — the alternative to today's video, always available */}
      <details className="card mb-6 p-4">
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

      {/* End-of-week work appears only once the final day is open. What a day
          can't cover is the twist and the hand-in list, and both belong at the
          end of the week. */}
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
            <div className="rounded-2xl border border-amber-300/80 bg-linear-to-br from-amber-50/95 to-orange-50/60 dark:border-amber-800 dark:from-amber-950/40 dark:to-orange-950/20 p-4">
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
              Answer each one out loud or in your notes <em>before</em> revealing the
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

/** A practice instruction: a sentence, or an intro + numbered steps + aside. */
function PracticeContent({ practice }: { practice: Practice }) {
  if (typeof practice === "string") {
    return <p className="mt-1.5 text-sm leading-relaxed">{practice}</p>;
  }
  return (
    <>
      {practice.intro && (
        <p className="mt-1.5 text-sm leading-relaxed">{practice.intro}</p>
      )}
      <ol className="mt-2 list-decimal pl-5 space-y-1.5 text-sm leading-relaxed marker:font-semibold marker:text-emerald-600 dark:marker:text-emerald-400">
        {practice.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {practice.note && (
        <p className="mt-2.5 text-xs text-zinc-500 leading-relaxed">
          💡 {practice.note}
        </p>
      )}
    </>
  );
}

function ActivityCard({
  activity,
  form,
}: {
  activity: DayActivity;
  form?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-sky-300/80 bg-linear-to-br from-sky-50/95 to-cyan-50/60 dark:border-sky-800/80 dark:from-sky-950/40 dark:to-cyan-950/20 p-5">
      <p className="text-sm font-semibold">{activity.title}</p>
      <ol className="mt-2.5 list-decimal pl-5 space-y-2 text-sm leading-relaxed marker:font-semibold marker:text-sky-600 dark:marker:text-sky-400">
        {activity.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {activity.tip && (
        <p className="mt-3 border-t border-sky-200/80 dark:border-sky-900 pt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          💡 {activity.tip}
        </p>
      )}
      {form && (
        <div className="mt-4 border-t border-sky-200/80 dark:border-sky-900 pt-4">
          {activity.submit && (
            <p className="mb-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {activity.submit}
            </p>
          )}
          {form}
        </div>
      )}
    </div>
  );
}

/** Hero subtitle: what this day holds beyond the videos. */
function daySubtitle(day: {
  videos: { length: string }[];
  warmup?: unknown;
  warmupGame?: unknown;
  game?: unknown;
  activities?: unknown[];
}): string {
  const hasActivities =
    Boolean(day.warmup) ||
    Boolean(day.warmupGame) ||
    Boolean(day.game) ||
    (day.activities?.length ?? 0) > 0;
  if (day.videos.length === 0)
    return hasActivities
      ? "No video today — activities and practice only."
      : "No video today — practice only.";
  if (!hasActivities) return `${totalMinutes(day.videos)} min of video, then the practice below.`;
  return `${totalMinutes(day.videos)} min of video plus games and hands-on work — each step unlocks the next.`;
}

/** Sum "mm:ss" video lengths, rounded up to whole minutes. */
function totalMinutes(videos: { length: string }[]): number {
  const secs = videos.reduce((sum, v) => {
    return sum + v.length.split(":").reduce((s, part) => s * 60 + Number(part), 0);
  }, 0);
  return Math.ceil(secs / 60);
}
