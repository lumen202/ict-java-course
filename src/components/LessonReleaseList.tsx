"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { releaseDay, undoRelease } from "@/app/teacher/actions";
import { PendingButton } from "@/components/PendingButton";

// The teacher's release list. The course gains a week at a time and every week
// is five days, so by the end of a unit a flat list is a long scroll to reach
// one lesson. Three controls fix that, in order of how often they're used:
// weeks collapse (only the current one is open), a filter box finds a day by
// what it teaches, and a jump menu goes straight to a week.
//
// This is a Client Component only for that interaction — the release buttons
// are still the same Server Actions the page used before, submitted by real
// <form>s, so releasing works before (and without) hydration.

export type ReleaseDay = {
  /** "Day 1" — the label as authored. */
  label: string;
  focus: string;
  videos: number;
};

export type ReleaseWeek = {
  slug: string;
  unit: string;
  title: string;
  /** The week the class is currently on. */
  isCurrent: boolean;
  /** Released day of the current week; 0 when the teacher has pulled it all back. */
  currentDay: number;
  /** How many days students can open — whole week for past weeks, 0 for future ones. */
  openDays: number;
  days: ReleaseDay[];
};

/**
 * Week picker. A native <select> renders with the operating system's own popup
 * — light blue on a dark page, wrong font, wrong radius — so this is a plain
 * button + panel styled like the rest of the app. Escape and click-outside
 * close it, and the items are real buttons, so tabbing through them works.
 */
function WeekJumpMenu({
  weeks,
  onPick,
}: {
  weeks: ReleaseWeek[];
  onPick: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="btn-ghost px-3 py-2 text-xs"
      >
        Jump to week
        <span aria-hidden="true" className="text-zinc-400">
          ▾
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="card absolute left-0 z-20 mt-2 max-h-80 w-80 overflow-y-auto p-1.5"
        >
          {weeks.map((w) => (
            <button
              key={w.slug}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onPick(w.slug);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="block text-sm font-medium">{w.title}</span>
              <span className="block text-xs text-zinc-500">
                {weekStatus(w)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function weekStatus(w: ReleaseWeek): string {
  if (w.isCurrent) {
    return w.openDays > 0
      ? `Day ${w.openDays} of ${w.days.length} released`
      : "Nothing released yet";
  }
  return w.openDays > 0
    ? `All ${w.days.length} days open for review`
    : "Not started";
}

export default function LessonReleaseList({ weeks }: { weeks: ReleaseWeek[] }) {
  const [query, setQuery] = useState("");
  // Which weeks the teacher has opened. Starts on the week the class is on —
  // the one they came here to change.
  const [openSlugs, setOpenSlugs] = useState<string[]>(() =>
    weeks.filter((w) => w.isCurrent).map((w) => w.slug),
  );
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const searchId = useId();

  const needle = query.trim().toLowerCase();

  // While filtering, a week shows only its matching days — unless the week
  // itself is what matched, in which case all of its days are the answer.
  const filtered = useMemo(() => {
    if (!needle)
      return weeks.map((w) => ({ week: w, days: w.days, matched: false }));
    return weeks
      .map((w) => {
        const weekMatches =
          w.title.toLowerCase().includes(needle) ||
          w.unit.toLowerCase().includes(needle);
        const days = weekMatches
          ? w.days
          : w.days.filter(
              (d) =>
                d.focus.toLowerCase().includes(needle) ||
                d.label.toLowerCase().includes(needle),
            );
        return { week: w, days, matched: true };
      })
      .filter((r) => r.days.length > 0);
  }, [weeks, needle]);

  const hits = needle ? filtered.reduce((n, r) => n + r.days.length, 0) : 0;

  function toggle(slug: string) {
    setOpenSlugs((open) =>
      open.includes(slug) ? open.filter((s) => s !== slug) : [...open, slug],
    );
  }

  function jumpTo(slug: string) {
    if (!slug) return;
    setQuery("");
    setOpenSlugs((open) => (open.includes(slug) ? open : [...open, slug]));
    // The card may be about to expand, so scroll on the next frame.
    requestAnimationFrame(() => {
      cardRefs.current[slug]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  const allOpen = openSlugs.length === weeks.length;
  const noneOpen = openSlugs.length === 0;

  return (
    <div>
      {/* Navigation on the left, filtering on the right. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <WeekJumpMenu weeks={weeks} onPick={jumpTo} />

        {/* Two buttons rather than one toggle: with the current week open by
            default, a toggle would read "Expand all" while a week was open,
            leaving no visible way to close it. */}
        <button
          type="button"
          onClick={() => setOpenSlugs(weeks.map((w) => w.slug))}
          disabled={allOpen}
          className="btn-ghost px-3 py-2 text-xs"
        >
          Expand all
        </button>

        <button
          type="button"
          onClick={() => setOpenSlugs([])}
          disabled={noneOpen}
          className="btn-ghost px-3 py-2 text-xs"
        >
          Collapse all
        </button>

        <div className="relative ml-auto w-full sm:w-80">
          <label htmlFor={searchId} className="sr-only">
            Find a day
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a day — UPDATE, primary key, sort…"
            // The webkit search input draws its own clear button, which looks
            // borrowed from another app; ours is below.
            className="input w-full pr-9 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear the filter"
              className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {needle && (
        <p
          aria-live="polite"
          className="mb-3 text-sm text-zinc-600 dark:text-zinc-400"
        >
          {hits === 0
            ? `No day matches “${query.trim()}”.`
            : `${hits} day${hits > 1 ? "s" : ""} match “${query.trim()}”.`}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map(({ week: w, days, matched }) => {
          // A filtered week is always expanded — hiding the hit behind a
          // collapsed card would defeat searching for it.
          const expanded = matched || openSlugs.includes(w.slug);
          const panelId = `week-panel-${w.slug}`;

          return (
            <div
              key={w.slug}
              ref={(el) => {
                cardRefs.current[w.slug] = el;
              }}
              className="card scroll-mt-4"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => toggle(w.slug)}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl p-5 text-left hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                >
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-zinc-400 transition-transform ${
                      expanded ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {w.unit}
                    </span>
                    <span className="block font-semibold">{w.title}</span>
                  </span>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      w.isCurrent && w.openDays > 0
                        ? "bg-emerald-600 text-white"
                        : w.openDays > 0
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {weekStatus(w)}
                  </span>
                </button>
              </h3>

              <div id={panelId} hidden={!expanded} className="px-5 pb-5">
                <Link
                  href={`/week/${w.slug}`}
                  className="text-xs font-medium text-zinc-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline"
                >
                  Open the week page ↗
                </Link>

                <ol className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {days.map((d) => {
                    const dayNumber = w.days.indexOf(d) + 1;
                    const isCurrent = w.isCurrent && dayNumber === w.currentDay;
                    const isOpen = w.isCurrent && dayNumber <= w.currentDay;

                    return (
                      <li
                        key={d.label}
                        className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 text-sm"
                      >
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            isCurrent
                              ? "bg-emerald-600 text-white"
                              : isOpen
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {d.label}
                        </span>

                        <span className="min-w-0 flex-1 text-zinc-700 dark:text-zinc-300">
                          {/* The row links to the lesson itself — reviewing a
                              day before releasing it shouldn't need a detour. */}
                          <Link
                            href={`/week/${w.slug}?day=${dayNumber}`}
                            className="hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline"
                          >
                            {d.focus}
                          </Link>
                          <span className="ml-2 text-xs text-zinc-500">
                            {d.videos === 0
                              ? "practice only"
                              : `${d.videos} video${d.videos > 1 ? "s" : ""}`}
                          </span>
                        </span>

                        {isCurrent ? (
                          <form action={undoRelease} className="shrink-0">
                            <PendingButton
                              pendingLabel="Taking back…"
                              title={
                                w.currentDay > 1
                                  ? `Roll back to Day ${w.currentDay - 1}`
                                  : "Close the week — students see nothing"
                              }
                              className="rounded-md border border-amber-400 dark:border-amber-700 px-2.5 py-1 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/40 disabled:opacity-60"
                            >
                              ↩ Take back
                            </PendingButton>
                          </form>
                        ) : (
                          <form action={releaseDay} className="shrink-0">
                            <input
                              type="hidden"
                              name="weekSlug"
                              value={w.slug}
                            />
                            <input type="hidden" name="day" value={dayNumber} />
                            <PendingButton
                              pendingLabel={isOpen ? "Rolling back…" : "Releasing…"}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-60 ${
                                isOpen
                                  ? "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                  : "bg-linear-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_-2px_rgb(16_185_129/0.6)] hover:from-emerald-400 hover:to-emerald-500"
                              }`}
                            >
                              {isOpen ? "Roll back to here" : "Release"}
                            </PendingButton>
                          </form>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
