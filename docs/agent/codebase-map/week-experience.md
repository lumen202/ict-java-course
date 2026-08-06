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

1. **Header** — `Unit · Day N` label, the day's focus as `<h1>`, and the video-minutes line.
2. **Day switcher** — pills for each released day (only when more than one). The sidebar does
   this too; these keep it reachable on mobile, where the sidebar is behind a drawer.
3. **The lesson** — the day's embedded players (2-col grid), the "✍️ Then do this" practice box,
   and the week's watch notes.
4. **Prev / next day** links, bounded by what's released.
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
- `components/WeekProgress.tsx` — client. `MarkWeekDone` (week page) and `WeekDoneBadge`
  (dashboard). **localStorage only** (`jch-done:<slug>`): a personal checklist, never sent to the
  teacher, so it doesn't create a surveillance signal. Reads go through `useSyncExternalStore`
  with a `false` server snapshot — not setState-in-effect, which the `react-hooks` lint rules
  reject and which would cause hydration mismatches.

## Submitting a reflection

`app/api/reflections/route.ts` — the only API route. It:

1. requires a session (401 otherwise),
2. validates `weekSlug` + `hardestPart` presence and 2000-char bounds,
3. reads the display name from the **profile**, not the request body,
4. inserts with `user_id = auth.uid()`, which RLS enforces independently,
5. logs the real error server-side and returns a friendly one.
