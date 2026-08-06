# Lesson Release — what students can see today

The teacher moves the class forward one day at a time. Students see the current
day's lesson and the days already released; everything after that is hidden.
The point is focus: a week page showing five days at once invites skimming ahead
and drifting.

## State

A single row in `course_state` (`id boolean primary key default true` with a
`check (id)` constraint — that's the singleton trick):

| Column | Meaning |
|---|---|
| `current_week_slug` | which week the class is on |
| `current_day` | 1-based index into that week's `video.days`; **0 means nothing is released** |
| `updated_at` / `updated_by` | audit trail |

RLS: any signed-in user may `SELECT`; only teachers may `UPDATE`.

## Rules (`lib/release.ts`)

`releasedDayCount(week, state)` decides visibility by comparing positions in
`weeks[]`:

- **Earlier week** → all days (catching up and revision stay possible).
- **Current week** → days 1…`current_day`.
- **Later week** → nothing; the week page shows "hasn't started yet".

`currentLesson(state)` resolves the state into `{ week, day, dayNumber }` for
the dashboards. `isWeekOpen()` is the boolean form.

**Teachers bypass all of this** — `week/[slug]/page.tsx` passes the full day
count when `role === "teacher"`, so a week can be reviewed before it's opened.

## Surfaces

- **`/teacher/lessons`** — the control. Shows what the class is on, a week + day
  selector (`ReleaseControls`, a client component so the day list re-renders on
  week change), and every day of every published week with its focus line, so
  the teacher can see what they're about to release.
  - **Releasing is reversible.** "↩ Take back a day" (`undoRelease`) decrements
    `current_day`, floored at 0; students lose that day on their next
    navigation, and submitted reflections are never touched. Opening the wrong
    day shouldn't need a database edit to undo. The day selector can also jump
    backwards directly — same effect, one step.
- **Student dashboard** — a single "Today" card with the day's focus, linking
  straight to `?day=N`. Nothing else: the unit outline and "how a week works"
  blocks were removed as noise.
- **`/lessons`** — the index of everything released, newest week first, current
  day dotted. The sidebar's Lessons entry points here.
- **Week page** — one released day at a time (`?day=N`), defaulting to the
  newest.

## Gotchas

- `current_day` is 1-based, array indices are 0-based, and **0 is a real state**
  meaning nothing released. `currentLesson()` returns null for it; a naive
  `day - 1` would silently resolve to day 1 and re-expose the lesson you just
  took back.
- Releasing is `revalidatePath("/", "layout")`, so every student's dashboard and
  week page pick it up on their next navigation. Nothing is pushed live.
- If `weeks[]` is reordered, "earlier/later" changes meaning. Append new weeks;
  don't reshuffle published ones.
