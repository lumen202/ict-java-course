import { setDayUnlock } from "./actions";
import { PendingButton } from "@/components/PendingButton";

// "Someone stuck?" — the per-student escape hatch, next to the class-wide
// release controls because it answers the same question ("what can they open?")
// one person at a time.
//
// A day is walked part by part, and several of those parts only finish when the
// student gets them right. Here the teacher names the part someone is stuck on
// and opens the day past it: the rest of the day stays gated, so this is a nudge
// forward rather than an exemption from the lesson. "The whole day" is offered
// too, for when the point is to let someone catch up.
//
// It's per day on purpose — not a standing pass. Tomorrow starts gated again.
//
// Lives here rather than under /teacher/submissions because a stuck student
// often has nothing turned in at all, and that route 404s for them.

export type UnstuckDay = { weekSlug: string; weekTitle: string; day: number; focus: string };
/** One part of the chosen day, in the order the student meets them. */
export type UnstuckStep = { key: string; title: string };
export type UnstuckStudent = {
  id: string;
  name: string;
  /** The step they've been let past, `null` for a whole-day grant, undefined for no grant. */
  openPast?: string | null;
};

export function UnstuckPanel({
  days,
  selected,
  steps,
  students,
}: {
  /** Every day the teacher can pick, in course order. */
  days: UnstuckDay[];
  selected: { weekSlug: string; day: number };
  steps: UnstuckStep[];
  students: UnstuckStudent[];
}) {
  const value = `${selected.weekSlug}:${selected.day}`;
  const titleOf = new Map(steps.map((s) => [s.key, s.title]));

  return (
    <section className="card mb-8 p-5">
      <h2 className="text-sm font-semibold">Someone stuck?</h2>
      <p className="mt-1 mb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        A lesson day opens part by part, and some parts only open the next one
        when they&apos;re answered correctly. Pick the part a student is stuck on
        and they&apos;ll be let past it — the rest of their day carries on as
        normal.
      </p>

      {/* Plain GET form: the chosen day lives in the URL, so the panel is
          linkable and survives a refresh. */}
      <form method="get" className="mb-5 flex flex-wrap items-end gap-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <span className="mb-1 block">Which day</span>
          <select name="unstuck" defaultValue={value} className="input w-auto text-sm">
            {days.map((d) => (
              <option key={`${d.weekSlug}:${d.day}`} value={`${d.weekSlug}:${d.day}`}>
                {d.weekTitle} — Day {d.day}: {d.focus}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-ghost text-sm">
          Show
        </button>
      </form>

      {students.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 text-sm text-zinc-600 dark:text-zinc-400">
          No student accounts yet.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {students.map((s) => {
            const openPast = s.openPast;
            const granted = openPast !== undefined;
            return (
              <li key={s.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.name}</span>
                  {openPast !== undefined && (
                    <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      🔓{" "}
                      {openPast === null
                        ? "whole day open"
                        : `past ${titleOf.get(openPast) ?? openPast}`}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <form action={setDayUnlock} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="userId" value={s.id} />
                    <input type="hidden" name="weekSlug" value={selected.weekSlug} />
                    <input type="hidden" name="day" value={selected.day} />
                    <input type="hidden" name="grant" value="1" />
                    <label className="sr-only" htmlFor={`step-${s.id}`}>
                      Which part {s.name} is stuck on
                    </label>
                    <select
                      id={`step-${s.id}`}
                      name="step"
                      defaultValue={s.openPast ?? ""}
                      className="input w-auto max-w-full text-xs"
                    >
                      {steps.map((st) => (
                        <option key={st.key} value={st.key}>
                          Stuck on: {st.title}
                        </option>
                      ))}
                      <option value="">Open the whole day</option>
                    </select>
                    <PendingButton
                      pendingLabel="Opening…"
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    >
                      🔓 Let them past
                    </PendingButton>
                  </form>

                  {granted && (
                    <form action={setDayUnlock}>
                      <input type="hidden" name="userId" value={s.id} />
                      <input type="hidden" name="weekSlug" value={selected.weekSlug} />
                      <input type="hidden" name="day" value={selected.day} />
                      <input type="hidden" name="grant" value="0" />
                      <PendingButton
                        pendingLabel="Locking…"
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-900/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                      >
                        Lock it again
                      </PendingButton>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
        Only this day, only this student — tomorrow is gated again. Nothing
        they&apos;ve turned in is touched either way, and re-picking a different
        part replaces the previous one.
      </p>
    </section>
  );
}
