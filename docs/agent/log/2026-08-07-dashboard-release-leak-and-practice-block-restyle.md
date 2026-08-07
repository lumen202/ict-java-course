# Dashboard release leak fixed; practice instructions restructured as steps

**Date:** 2026-08-07 · previous entry:
[`2026-08-07-week2-and-per-day-content-files.md`](2026-08-07-week2-and-per-day-content-files.md)

## What shipped

1. **Students no longer see unreleased weeks on the dashboard** (BUG-006).
   `StudentDashboard.tsx`'s "Earlier weeks" filtered on content
   `status === "available"` only, so publishing Week 2 in the registry showed its
   title to students while the class was still on Week 1. It now also requires
   `isWeekOpen(w, state)` — the same `lib/release.ts` rule the sidebar,
   `/lessons`, and the week page already applied. The teacher's release pointer
   is the only thing that puts a week in front of students.

2. **The "✍️ Now do this" block under each video was restyled** — from a full
   `card-accent` box to a quiet left-rail annotation (emerald `border-l-2`,
   `section-label` heading, muted body). The teacher flagged that the old box
   "does not belong"; the diagnosis was weight: `card-accent` is the vocabulary
   for top-level "do this now" step cards (today card, turn-in), so using it
   *inside* a video step made a sub-instruction compete with the step itself.
   The closing "🏁 To finish the day" card kept its card styling on purpose —
   it *is* a top-level step.

3. **Practice instructions became incremental steps, not paragraphs** (teacher
   request, same session). New `Practice` type in `lib/content/types.ts`:
   `string | { intro?, steps[], note? }`, used by both `VideoAssignment.practice`
   and the day's closing `practice`. One renderer (`PracticeContent` in
   `week/[slug]/page.tsx`) shows intro, numbered emerald-markered steps, and a
   muted 💡 note. All 20 existing practice strings across weeks 1–2 were
   converted — the exit tickets were already "(1)…(2)…(3)…" paragraphs, so the
   split was mechanical; voice preserved throughout.

4. **Copy rule surfaced by the teacher while converting:** fallback notes must
   not carry hard time limits. "If MySQL still won't install after 30 minutes"
   became a condition-based fallback (slow internet / stubborn installer → DB
   Fiddle today, finish install at home). Recorded in
   [`../codebase-map/course-content.md`](../codebase-map/course-content.md).

## Watch out for

- Any new student surface that lists weeks must filter through `lib/release.ts`
  (`isWeekOpen` / `releasedDayCount`), never content `status` alone. The
  dashboard was the one surface that got this wrong.
- `card-accent` means "the top-level thing to do now". Don't reach for it for
  sub-blocks nested inside a timeline step.
- New practice copy should default to the `{ intro?, steps[], note? }` form
  whenever it's sequential; plain strings are for genuine one-liners.

## What's next

- No open threads from this session. Resume point remains Week 3 content
  authoring per the previous entry.
