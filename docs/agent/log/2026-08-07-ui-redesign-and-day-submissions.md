  x# UI redesign (structure, not paint), day turn-ins, content de-papered

**Date:** 2026-08-07 (same day as the day-activities entry; this continues it)

## Why

Teacher feedback in quick succession: the UI felt generic ("the design itself, not just
theming"), activity minutes felt bureaucratic, activities wrongly assumed paper and fixed
classmate counts (students all work on computers), students needed to **turn in each day's
output** to feel involved, the sidebar looked bad and then needed collapsing, the teacher
couldn't open a lesson from the release list, and collapsed-rail space was being eaten by
narrow `max-w` containers.

## What shipped

- **Design system** in `globals.css` (`@layer components`): `.card`, `.card-accent`,
  `.btn-primary`, `.btn-ghost`, `.input`, `.chip`, `.section-label`, plus fixed radial
  emerald/teal body glows. All pages/forms swept onto these classes.
- **Sidebar rebuilt** as a dark brand rail (both themes): icon tiles, day-number bullets with a
  "Today" chip, avatar user card, emerald glow matching the login panel. **Collapsible** to an
  icon-only strip (« / » buttons, `jch-rail-collapsed` in localStorage); content is `flex-1` so
  it expands. Collapsed avatar expands the rail — deliberately does *not* sign out.
- **Lesson page restructured as a numbered timeline**: warmup → videos+practice → activities →
  closing task → **turn-in step** (✓ node). Day hero with gradient Day-N tile. Watch notes
  collapsed under the last video.
- **Student dashboard hero** (big day tile + CTA), **login split-screen** (dark brand panel +
  form), teacher pages restyled and widened (`max-w-7xl`; lesson page `max-w-4xl`).
- **Turn-ins, per activity**: `submissions` table keyed on `(user, week, day, item)` where
  `item` is `'day'` or a `DayActivity.id` — **every activity card embeds its own compact
  turn-in box** (placeholder = the activity's `submit` text), plus the closing day box.
  `/api/submissions` upserts; `components/SubmissionForm.tsx` is shared (item/label/
  placeholder/rows props); `/teacher/submissions` shows an item chip per row (reusable
  `WeekFilter basePath`), sidebar item 📤.
  **⚠️ Human must re-run `supabase/schema.sql` in the SQL Editor** — until then the turn-in
  boxes POST fails politely. The migration also drops the short-lived 3-column unique
  constraint in favour of the 4-column unique index.
- **Content redesigned for solo self-learning** (teacher's direction, refined twice): no
  classmate/seatmate steps anywhere; activities are plain hands-on tasks (a "levels/boss/points"
  prose framing was tried and **explicitly rejected** — don't reintroduce it). Also
  computer-based only (files/notes apps/spreadsheets, no paper), `minutes` removed from
  `DayActivity`, exit ticket + Day 5 + deliverables route through the turn-in boxes.
- **Real mini-games instead**: `DayGame` is a union of three playable engines, and the teacher
  confirmed this is exactly what they want — they also flagged that multi-step text activities
  are hard on students with low reading comprehension, so `components/Quest.tsx` turns real
  Workbench/file work into missions shown one at a time (quick checks retry until right;
  `input` missions collect pasted work). Day 1's scavenger hunt, error lab, and design-a-table
  are now quests (same ids, so existing turn-ins still attach); only the short cheat-sheet
  remains a plain activity card. `components/BossBattle.tsx` (quiz RPG: boss HP =
  question count, 3 hearts, wrong answers re-queued, `explain` teaches every pick) and
  `components/RowHunt.tsx` ("you are the database": an on-screen table, queries asked in plain
  words, answered by clicking matching rows, the real SQL revealed after each round). Both
  auto-submit results as turn-ins (item = game `id`). Day 1 ships a row-hunt warm-up
  (6 rounds sneak-previewing SELECT/WHERE/AND/OR) and "⚔️ The Data Dragon" finale (7
  questions on rows/columns, CREATE/SHOW/DROP, server-vs-database, schema refresh).
- **Days are gated** (`components/LessonFlow.tsx`): students get steps one at a time — games
  unlock the next on finish (win or lose, deliberately), turn-in boxes on save, videos via a
  "done watching" button — with a 🔒 "up next" teaser for anticipation. Teachers see the whole
  day. State: `jch-flow:<slug>:<day>` in localStorage merged with server-known turn-ins;
  components signal completion via `useFlowComplete()` (no-op outside a flow).
- Teacher's `/teacher/lessons`: week titles and day rows link into the lesson itself.

Late additions in the same session: a fourth game kind `typing`
(`components/TypingGame.tsx`, fill-in-the-blank SQL → whole commands from memory; Day 1 ships
"⌨️ Type the spells"); the cheat-sheet activity became a quest, so **Day 1 now has zero
step-list activities — every block is watch or play**; `/teacher/submissions` became a
student → day → turn-ins drill-down **across separate pages** (accordions were tried and
rejected as clutter) that prefers current profile names over snapshots (an email showing
there means the profile has no name — editable on `/teacher/students`); and boss battles got
the arena treatment — always-dark stage with glow, animated boss HP bar, hit-shake /
strike-back animations (`hit-shake`/`boss-loom`/`float-up` keyframes in `globals.css`),
5 hearts, and the Data Dragon grew to 12 questions.

Names follow-up: the teacher's test account showed as an email because class-list names never
reach the profile without the admin key. Fixed three ways: `lib/student-names.ts` resolves
profile → class list → snapshot on the teacher pages; `handle_new_user()` now falls back to
class-list names at signup; and `schema.sql` gained an idempotent backfill copying class-list
names into empty profiles. **Human must re-run `supabase/schema.sql`** (or at least the
`handle_new_user` block + backfill) for the database side.

## Watch out for

- The dark rail styles against dark only (`white/5` etc.) — no `dark:` variants belong there.
- `.card*` classes use v4 `bg-linear-to-*` gradients; `@apply` with variants works because
  `globals.css` imports tailwind.
- Submissions page/dashboard queries fail soft until the schema is re-run.
- Copy bans still hold — checked via the grep in `ui-and-copy.md` (only `grade_level` +
  "degrade" comments hit).

## What's next

- Days 2–5 remain thin — expand with the Day 1 pattern (computer-based, no fixed counts, each
  day's closing practice should address the turn-in box).
- Consider surfacing submission counts on the teacher dashboard (a 5th stat or replacing one).
- Consider per-student drill-down joining submissions + reflections.
