# Course Content — The Data Model for Weeks

All course material lives in `src/lib/content/` as **data**. `app/week/[slug]/page.tsx` renders
any week from its `Week` object, so adding material never means writing JSX. This is the single
most important convention in the repo.

```
types.ts          the Week type and its parts
weeks/            one file per week (unit1-week1.ts)
index.ts          weeks[] · roadmap[] · getWeek(slug)
```

## The `Week` shape

- `slug`, `unit`, `title`, `summary`, `objectives[]`, `status` (`available` | `coming-soon`)
- `video` — **a day-by-day plan**, not one long video:
  - `title`, `playlistUrl`, `watchNotes[]` (how to watch actively; applies to every day)
  - `days: DayPlan[]` — each `{ day, focus, videos: VideoAssignment[], practice }`, where a
    `VideoAssignment` is `{ title, youtubeId, length }`
- `reading[]` — `{ label, url, note? }`, a genuine text alternative covering the same material
- `activity` — `{ title, goal, steps[], twist, deliverables[] }`
- `selfCheck[]` — `{ question, answer }`

## Adding a week

1. Copy `weeks/unit1-week1.ts` to `weeks/unit1-week2.ts` and rewrite it.
2. Import it in `index.ts` and add it to `weeks[]` (array order = display order).
3. Delete its "coming soon" line from `roadmap[]` in the same file, so it doesn't appear twice.

Nothing else changes: the dashboard lists it, `/week/<slug>` renders it, `generateStaticParams()`
picks it up.

## Content rules

- **Slugs are permanent** once shared with students. Format `unit<N>-week<N>`.
- **Pace the video day-by-day.** These students have no prior foundation: ~10–20 minutes of video
  per day, always paired with `practice` that makes them type. Tell them to budget roughly 2× the
  video length in real time. A final day with `videos: []` (pure practice/wrap-up) works well.
- **Both tracks must genuinely cover the same material** — at least one student struggles with
  video learning, so the reading track is an alternative, not a footnote.
- **Every activity needs a real twist** that can't be satisfied by typing along with the
  tutorial. It's what makes "done" mean something.
- **Aim for ~5 self-check items** — the week page's copy says 4 out of N means you're in good shape.
- **Write to the student**: second person, plain language, encouraging about being stuck.
- **Never mention grading, in either direction** — see [`ui-and-copy.md`](ui-and-copy.md).

## Unit 1 source playlist

Week 1's video track is Bro Code's **"MySQL tutorial for beginners"** playlist
(`PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ`): 31 short videos, ~2h59m of video total. Week 1 uses
videos #1–5 plus logical operators and ORDER BY, spread over 5 days.

Remaining videos, roughly mapped for future weeks: UPDATE/DELETE (#6) and PRIMARY KEYS /
AUTO_INCREMENT (#13–14) for week 2; constraints (#9–12) and FOREIGN KEYS (#15) for week 3; joins
(#16), functions (#17), wildcards (#19), LIMIT (#21), UNIONS (#22), SELF JOINS (#23) and GROUP BY
(#27) thereafter. Views/indexes/subqueries/procedures/triggers (#24–26, #30–31) are later-unit
material.

Playlist metadata can be re-scraped from the playlist page's `ytInitialData` — the lockup entries
carry `contentId` (video ID) and a badge `text` (duration).
