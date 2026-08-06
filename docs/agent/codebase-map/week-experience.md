# The Week Page

One generic template, `app/week/[slug]/page.tsx`, renders every week from its `Week` object (see
[`course-content.md`](course-content.md)). `requireUser()` gates it; `generateMetadata()` gives
each week its own `<title>`; unknown slugs call `notFound()` and land on the custom 404.

## Section order

1. **Objectives** — "by the end of this week you can…"
2. **Pick your track** — video and reading, stacked (not side-by-side) so the player gets full
   width:
   - **Video track**: playlist name + link out, the global watch notes, then one card per day —
     day chip, focus line, computed "N min of video" (or "no video — practice day"), the day's
     embedded players in a 2-col grid, and a "✍️ Then do:" practice box.
   - **Reading track**: labelled links with notes.
3. **Activity** — goal, steps, the amber **twist** callout, deliverables.
4. **Self-check** — `<SelfCheck>`, answers hidden behind a reveal button, nothing recorded.
5. **Reflection** — `<ReflectionForm>`; everyone here is signed in, so it always renders.
6. **`<MarkWeekDone>`** — the personal done toggle.

`totalMinutes()` in the page sums `"mm:ss"` lengths and rounds up.

## Components involved

- `components/VideoEmbed.tsx` — server component, a plain lazy `<iframe>` on
  `youtube-nocookie.com`. Ships **zero client JS** and sets no tracking cookies until play. There
  is deliberately no thumbnail facade: that would need client state plus an `<img>` from
  `i.ytimg.com`, which trips `@next/next/no-img-element`.
- `components/SelfCheck.tsx` — client, local reveal state only.
- `components/ReflectionForm.tsx` — client. Takes `weekSlug` + `studentName`; there is **no name
  field**, because identity comes from the session, so nobody can submit as someone else. POSTs
  to `/api/reflections`.
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
