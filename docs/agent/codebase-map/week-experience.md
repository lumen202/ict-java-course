# The Lesson Page

`app/week/[slug]/page.tsx` renders **one day at a time**, not a whole week. The URL is
`/week/<slug>?day=N`; without `?day` it shows the newest released day, which is "today" for the
class. `requireUser()` gates it, and unknown slugs `notFound()`.

`app/lessons/page.tsx` is the **index**: every released day, newest week first, with the current
one dotted. The sidebar's "Lessons" points here, not into a day — without it there was no way
back out of a lesson.

**A lesson is the page.** The heading is the day's `focus`, with the week and day as a small
label above it — not a week banner. Showing the whole week at once invited skimming ahead, which
is the exact thing the release control exists to prevent.

## Section order

1. **Day hero** — unit label, a gradient Day-N tile, the day's focus as `<h1>`, and a subtitle
   summarising video vs. hands-on load.
2. **Day switcher** — pills for each released day (only when more than one). The sidebar does
   this too; these keep it reachable on mobile, where the sidebar is behind a drawer.
3. **The gated timeline** (`components/LessonFlow.tsx`) — the day as ordered, numbered steps on
   a connecting rail: `warmupGame` → each video with its "✍️ Now do this" practice (watch notes
   collapse under the last video) → each `DayActivity` card (each with its own turn-in box) →
   the day's `game` → the closing practice → the **day turn-in step** (✓ node). For students,
   steps unlock one at a time (games on finish via `useFlowComplete`, boxes on save, videos via
   a "done watching" button) with a 🔒 "up next" teaser; teachers see everything. Unlock state:
   `jch-flow:<slug>:<day>` in localStorage, merged with server-known turn-ins. Two rules that
   are easy to break by "simplifying":
   - The server unlock comes from the **last** step with a turn-in, not the first step without
     one. Videos and text cards have no server record, so a first-gap rule walked a student who
     had finished the whole day back to video 1 on any other device.
   - The stored value is `{u, c}` — unlocked count plus **the turn-in count when it was
     written**. If the server now has fewer, a teacher deleted work, so the stored progress is
     discarded and the gate genuinely closes again on the student's own browser.
4. **Prev / next day** buttons, bounded by what's released.
5. **`<details>` Reading track** — the text alternative, collapsed.
6. **Final day only**: finish-the-activity (goal, the amber **twist**, what to turn in), the
   self-check, the "Where are you at?" reflection, and `<MarkWeekDone>`.

The activity's `steps` are **not rendered anywhere**: they say the same thing as the days'
`practice`, which is what a student is actually following. Only the twist and the hand-in list
survive at week level. Keep it that way — a "what you're building this week" block on every day
duplicated the daily instruction and reintroduced the week framing lessons were split up to
avoid.

`totalMinutes()` sums `"mm:ss"` lengths and rounds up.

## Components involved

- `components/VideoEmbed.tsx` — server component, a plain lazy `<iframe>` on
  `youtube-nocookie.com`. Ships **zero client JS** and sets no tracking cookies until play. There
  is deliberately no thumbnail facade: that would need client state plus an `<img>` from
  `i.ytimg.com`, which trips `@next/next/no-img-element`.
- `components/SelfCheck.tsx` — client, local reveal state only.
- `components/ReflectionForm.tsx` — client. **Its first job is the student's learning, not the
  teacher's inbox.** Three inputs: a confidence choice (`Not yet` / `Getting there` / `Solid`),
  where they got stuck and what they tried, and what they'll redo. On submit it returns a
  **tailored plan** — rebuild-from-blank, revisit the specific day, or stretch further — plus the
  week's reading links when confidence is low. Copy must never imply "wait for the teacher to
  explain it"; the teacher is supervisory. No name field: identity comes from the session.
- `components/BossBattle.tsx` / `components/RowHunt.tsx` / `components/Quest.tsx` — client. The
  playable mini-games (see [`course-content.md`](course-content.md)). BossBattle: RPG quiz with
  boss HP, 3 hearts, and wrong-answer re-queueing, so a win means every concept was answered
  correctly. RowHunt: click the rows that match a spoken query, then see it as real SQL. Quest:
  real Workbench/file work as one-mission-at-a-time cards with a progress bar — checks retry
  until right, `input` missions collect pasted work into the turn-in. All three auto-submit
  their result (item = the game's `id`; replays overwrite) and signal the flow via
  `useFlowComplete`.
- `components/WeekProgress.tsx` — client. `MarkWeekDone` (week page) and `WeekDoneBadge`
  (dashboard). **localStorage only** (`jch-done:<slug>`): a personal checklist, never sent to the
  teacher, so it doesn't create a surveillance signal. Reads go through `useSyncExternalStore`
  with a `false` server snapshot — not setState-in-effect, which the `react-hooks` lint rules
  reject and which would cause hydration mismatches.
- `components/SubmissionForm.tsx` — client. The **turn-in box**: a monospace textarea the
  student pastes work into. Every `DayActivity` embeds one (item = the activity's `id`,
  compact, "📤 Turn in this level", placeholder = the activity's `submit` text) and the day ends
  with the closing box (item = `'day'`). One row per student/day/item (upsert), so boxes stay
  editable after submitting — "Update my work". The page preloads all of the day's existing
  submissions server-side so each box reopens with the student's work. Copy stresses "turn in
  what you have" over polish; never imply the work is judged.

## Submitting work

Two API routes, same shape and rules:

- `app/api/reflections/route.ts` — the end-of-week reflection.
- `app/api/submissions/route.ts` — the per-day turn-in. Also validates the slug/day against the
  content registry and 20 000-char bound, and **upserts** on
  `(user_id, week_slug, day_number)`.

Both:

1. require a session (401 otherwise),
2. validate presence and length bounds,
3. read the display name from the **profile**, not the request body,
4. write with `user_id = auth.uid()`, which RLS enforces independently,
5. log the real error server-side and return a friendly one.

The teacher reads turn-ins at `/teacher/submissions` (see
[`teacher-area.md`](teacher-area.md)).
