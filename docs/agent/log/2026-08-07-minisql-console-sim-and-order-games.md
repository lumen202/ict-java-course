# Four new game engines: mini DB Fiddle, Workbench sim, order puzzles, answer sheet — all games now modal

**Date:** 2026-08-07

## Why

Teacher evaluation of week 1 after the days 2–5 expansion
([previous entry](2026-08-07-week1-days-2-5-expanded.md)): every day had settled into the same
rhythm (row-hunt → typing → quests → boss), quests dominated with multiple-choice checks, nothing
on the page ever *ran* the student's SQL, and nothing built familiarity with the tool the videos
actually show (Workbench). The teacher asked for more engine variety, tool interaction, and —
explicitly — "our own mini db-fiddle.com instead of redirecting to an external link", judged more
meaningful than multiple-choice quest checks.

## What shipped

### `lib/minisql.ts` — a tiny real MySQL engine (~600 lines, dependency-free)

Tokenizer → recursive-descent parser → evaluator covering the whole week-1 surface:
CREATE/DROP/SHOW DATABASES (system schemas visible + protected), USE, SHOW TABLES, CREATE/DROP
TABLE (INT / VARCHAR(n) / DATE), DESCRIBE, INSERT (multi-row, strict type validation), SELECT
with WHERE (=, !=, <>, <, >, <=, >=, AND/OR/NOT, parens) and multi-column ORDER BY ASC/DESC,
ALTER TABLE ADD COLUMN, UPDATE (validate-before-apply so errors can't half-update), and
SET SQL_SAFE_UPDATES with Workbench's Error-1175 seatbelt. Errors carry **real MySQL codes and
wording** (1007, 1046, 1049, 1050, 1054 field/where variants, 1064 "near X", 1136, 1146, 1175,
1366, 1406…) because reading them is curriculum. Statements require semicolons (the course's
habit); batches stop at first error like Workbench. `runBatch`, `cloneState`, `statesEqual`,
`resultsEqual` support the task checker. A 45-assertion smoke test (scratchpad, not committed)
passed on every command, error code, and equality rule.

### Three new `DayGame` kinds (types + components + `page.tsx` wiring)

- **`sql-console`** (`components/SqlConsole.tsx`) — the mini DB Fiddle. Dark console with
  editor, ⚡ Run (and Ctrl+Enter), Workbench-style per-statement output lines, result grid,
  status bar (current db, safe-updates), reset-server. Tasks are judged **by effect**: run the
  student's batch on a clone, run the canonical `solution` against the same starting state,
  compare end states + results (`ordered` only when the solution used ORDER BY) — so any correct
  spelling clears, and a task whose solution *errors* clears on matching error code (live-fire
  error labs). Wrong runs don't commit, so the task sequence stays winnable; cleared runs
  persist, so a console feels like one server across its tasks.
- **`workbench-sim`** (`components/WorkbenchSim.tsx`) — clickable mock Workbench: SCHEMAS panel
  with refresh, run-all vs run-under-cursor bolts, editor, result grid, Output panel. Missions
  name a hotspot; wrong clicks explain what was clicked (2 misses → hint). Scene per step
  (editor text, schemas, output, result) is fully authored in content.
- **`order`** (`components/OrderGame.tsx`) — shuffled lines clicked into the correct order;
  wrong positions flag red for rebuilding. Shuffle never deals the solved order.

All three follow the house game contract: intro → play → 🏆, first-try scoring, `useFlowComplete`
unlock, auto-turn-in POST under the game `id`.

### Games open as modals; closing = pause; no confirm dialogs (later same-session teacher asks)

Since steps are gated anyway, EVERY game kind — quest included, at the teacher's explicit
follow-up — now renders a compact **`GameDoor`** card on the timeline and plays inside
**`GameModal`**, using new shared `GameDoor` / `GameModalHeader` / `GameModalBody` components
in `GameModal.tsx` (door tones: violet/teal/indigo/slate/rose/amber/sky). Closing the modal
(✕/Escape) **pauses** — full state (the console's server, quest inputs, sheet answers) is kept
and the door offers "▶ Continue" with a paused-at status — which made BossBattle's
`window.confirm("Leave the battle?")` unnecessary; it's gone, per the teacher's explicit
rejection of generic confirmation dialogs. BossBattle also got a screenshot-reported scroll
fix: the modal body now scrolls to top on each new question and brings the feedback panel into
view, so a long question no longer leaves the next prompt hidden above the fold.

### Fourth engine: `answer-sheet` (another same-session teacher ask)

"Make a .txt answer sheet" was judged busywork — Day 3's answer sheet is now an in-site game:
`kind: "answer-sheet"` (`components/AnswerSheet.tsx`), questions one at a time with a
jump-around number picker, each answered in the same labeled boxes (prediction → SQL run →
real answer), all boxes required, compiled into a single turn-in document under the same id
(`answer-sheet`), so nothing orphaned. Content: the ten Day 3 questions moved into `items[]`
with per-question notes for the two that need more than one query.

### Week 1 content rework (`weeks/unit1-week1.ts`)

- **Day 1**: + console `mini-server` (first CREATE/SHOW/DROP for real, then the three classic
  errors — **replaces the `break-it` quest**), + sim `cockpit-tour` before the real-Workbench
  scavenger hunt.
- **Day 2**: + console `mini-server-day2` (USE → CREATE TABLE → DESCRIBE → INSERT → multi-row →
  the three INSERT errors → prove junk stayed out — **replaces `break-insert`**), + order
  `order-recipe` (recipe order, CREATE TABLE anatomy, session rhythm).
- **Day 3**: + console `query-console` seeded with the warm-up's 7-student table (7 query tasks
  + unquoted-text error + unknown-column error + a **zero-rows-is-an-answer** task — **replaces
  `break-select`**).
- **Day 4**: + console `sort-update-console` on the warm-up's leaderboard: 5 sorts (incl.
  tie-break and filter-then-sort), then ALTER → **the 1175 safe-update wall met on purpose** →
  SET SQL_SAFE_UPDATES = 0 → targeted UPDATE → verify. Rehearses the twist quest exactly.
- **Day 5**: + order `order-week-file` (clause order; a miniature week1.sql with comment
  placement; the Day-4 dependency chain).
- Prose references to the removed error quests retargeted to "the mini server".
- **Pre-boss real labs** (a follow-up teacher rule mid-session): every day's LAST activity
  before the boss battle is now a `quest` with id `real-lab` done on the student's own machine
  — real Workbench + the growing `week1.sql` — so each day ends with a tangible off-site
  artifact, not just in-page play. Day 1 starts the file (was Day 2's closing note); Days 2–4
  each add a `-- Day N` section and verify the real database; Day 5 was reordered
  (teach-it-back moved before assemble-file + self-audit) so the real-output work sits last
  before the final boss. Closing `practice` texts trimmed where they duplicated the labs'
  file work. Rule documented in `course-content.md` ("The pre-boss real lab").

Docs: `codebase-map/course-content.md` — seven-kind inventory with authoring caveats, format
table gained console/sim/order rows, and a **console-vs-quest rule**: the console is a fresh
sandbox each game, so lasting work (their real `school` db) still happens in real-Workbench
quests — rehearse in-page, do it for real.

`npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.

## Watch out for

- **Three quest ids were removed** (`break-it`, `break-insert`, `break-select`) and replaced by
  console games under new ids. Fine only because no students have submitted yet — after launch,
  removing an id orphans saved turn-ins; check `submissions` first.
- **The engine and the checker are load-bearing for content.** A console task's `solution` must
  parse in `minisql.ts` (subset! e.g. no INSERT column-list form, no LIKE/LIMIT, only
  INT/VARCHAR(n)/DATE). If a future week's syntax isn't supported, extend the engine first and
  re-run a smoke test.
- **Effect-matching quirks**: any 1064 matches a 1064-solution task (acceptable — the goal is
  "meet a syntax error"); a student can't pre-disable safe updates to dodge the 1175 task,
  because non-matching runs roll back.
- **`order` rounds must have a single valid order** — column lists and comment placement are
  ambiguous unless the prompt pins them ("id first, then name…", "comment directly above its
  query").
- The react-hooks `refs` lint rule forbids reading refs in render — the console's engine
  therefore lives in `useState` with clone-per-run, not a ref. Keep it that way.
- Boss battles use `GameModal`; the three new kinds render inline like RowHunt/TypingGame.

## What's next

- Week 2 content (UPDATE/DELETE, PRIMARY KEY / AUTO_INCREMENT): the console engine needs
  `DELETE FROM` and `PRIMARY KEY` / `AUTO_INCREMENT` in CREATE TABLE to cover it — small,
  planned extensions. Week-2 flavor: safe-update seatbelt pays off once `id` becomes a real key.
- Consider a free-play console (no tasks) on the dashboard or week page — the engine already
  supports it; it's a rendering decision.
- Playtest the sim on a phone-sized screen: the SCHEMAS panel + editor grid is the tightest
  layout of the new components.
