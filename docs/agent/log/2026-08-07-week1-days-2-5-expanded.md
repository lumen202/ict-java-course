# Week 1 Days 2–5 expanded to Day 1's depth; a format-per-lesson rule

**Date:** 2026-08-07

## Why

Day 1 had been rebuilt as the model for a full 5-hour session (warm-up game, videos with their own
practice, four quests, a boss battle, an exit ticket) — but Days 2–5 were still the original thin
shape: one or two videos plus a one-line `practice`. The resume point in
[`2026-08-07-day-activities-fill-the-class-session.md`](2026-08-07-day-activities-fill-the-class-session.md)
named exactly this.

The teacher also asked the second-order question: *which* kind of block should each lesson get —
a quest, a text card, an answer sheet? That was being decided ad hoc per day with nothing written
down.

## What shipped

All of it is content — `src/lib/content/weeks/unit1-week1.ts` only. No component or type changes.

- **Day 2 — "Build your students table and fill it with people."** Row-hunt warm-up "quality
  control" (spot the values a typed column would reject — teaches types before the syntax exists),
  both videos with beefed-up practice, then: typing game on `CREATE TABLE` / `USE` / `DESCRIBE`,
  quest *build the students table*, quest *fill it with people* (to 10 rows), quest *break the
  INSERT on purpose* (column-count mismatch, missing quotes, wrong type), cheat-sheet quest, and
  boss battle **The Schema Serpent**.
- **Day 3 — "Ask your table questions."** Row-hunt warm-up *you are the WHERE clause* — harder
  than Day 1's, and it includes a round whose correct answer is **zero rows** (select nothing and
  run), which sets up the empty-vs-error distinction the whole day leans on. Then a 10-round
  typing game, quest *interrogate your table*, the week's one **answer sheet** (`DayActivity`:
  ten questions, predict → query → real answer → mark the disagreements), quest *break the SELECT*,
  cheat-sheet quest, boss **The Filter Phantom**.
- **Day 4 — "Sort your results, then make the table yours."** Row-hunt warm-up *first in line*
  (sorting by clicking, incl. a tie broken by a second column, and a filter-then-sort round),
  typing game, quest *sort your students every which way*, and the big one — quest **make the
  table yours**, which is the week's twist turned into missions: `ALTER TABLE ADD COLUMN`, the
  Workbench safe-update-mode wall, `UPDATE … WHERE id =`, then their own question written as a
  `--` comment above the query that answers it. Boss **The Sorting Sphinx**.
- **Day 5 — "Prove it."** No video. Typing warm-up: twelve commands, the whole week, mostly
  from memory. Then quest *assemble week1.sql* (order the file so it rebuilds the week top to
  bottom; comment every query), a self-audit `DayActivity` checklist, quest *teach it back*
  (explain four ideas in own words, with a non-students example), and the 15-question final boss
  **The Week One Warden**, which draws on all four days.
- **Week `objectives`** grew from 4 to 6 — column types, AND/OR/NOT, reading errors, and
  ALTER/UPDATE are all genuinely taught now and weren't listed.
- **Docs:** [`codebase-map/course-content.md`](../codebase-map/course-content.md) gained a
  *Choosing a format for each lesson* table (what-the-video-taught → which block type) plus the
  two structural constraints that keep tripping day planning up.

`npx tsc --noEmit`, `npm run lint` and `npm run build` all pass.

## Watch out for

- **Order is fixed by the template.** `page.tsx` renders `warmupGame` → *all* videos →
  `activities[]` → `game` → `practice`. There is no interleaving an activity between two videos —
  anything that must happen straight after video 1 belongs in that video's own `practice` string.
  Days 2 and 3 are written around this.
- **Day 4 teaches `ALTER TABLE` and `UPDATE`, which are not in this week's videos.** The quest
  gives the exact syntax and the reasoning, so it's self-contained — but the week's video mapping
  in `course-content.md` still lists UPDATE under week 2's videos. When week 2 uses that video,
  treat it as a second pass, not a first introduction.
- **`SET SQL_SAFE_UPDATES = 0;` is taught deliberately.** Their `students.id` is not a PRIMARY KEY
  (that's week 2), so Workbench blocks `UPDATE … WHERE id = 1`. Rather than hide it, the quest
  makes the block a mission — predict the error, then take the seatbelt off knowingly. If week 2
  adds a primary key, that mission's framing needs revisiting.
- **RowHunt handles `matches: []` correctly** (checked in `components/RowHunt.tsx`: sizes match, so
  clicking nothing and pressing Run is scored right). Day 3 relies on that.
- Row-hunt `matches` are indexes into `rows` — an index past the end makes a round impossible to
  clear. One was written and caught before shipping; check every index when adding rounds.
- Copy bans re-checked across all four days: no grading in either direction, no attendance, no
  "ask a classmate". Game/quest prose is flavoured (wizards, bosses); `DayActivity` cards stay
  plain, per the teacher's rejection of gamified wording in instructions.

## What's next

- Week 1 is complete. **Week 2 is the next content job** — `UPDATE`/`DELETE` (#6) and
  PRIMARY KEYS / AUTO_INCREMENT (#13–14) per the playlist mapping. Copy Day 2's shape; the
  cheat-sheet quest and the three-part exit ticket should continue as running artifacts.
- The `id` column students created in week 1 has no key on it. Week 2's primary-key material is
  the natural place to fix their existing table rather than rebuild it — which also gives the
  safe-update-mode mission a satisfying payoff.
- `activity.steps` at week level are still planning-notes-only (not rendered). Day 5's self-audit
  checklist now covers the same ground for students; consider whether `activity.steps` is worth
  keeping at all.
