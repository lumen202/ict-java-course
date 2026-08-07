# Course Content — The Data Model for Weeks

All course material lives in `src/lib/content/` as **data**. `app/week/[slug]/page.tsx` renders
any week from its `Week` object, so adding material never means writing JSX. This is the single
most important convention in the repo.

```
types.ts               the Week type and its parts
weeks/
  unit1-week1/
    index.ts           the Week shell: title, objectives, watchNotes, days: [day1…day5],
                       reading, activity, selfCheck
    day1.ts … day5.ts  one DayPlan each — the bulk of the content
  unit1-week2/         same shape
index.ts               weeks[] · roadmap[] · getWeek(slug)
```

**One file per day, not per week.** A finished day runs ~430–670 lines, so a
five-day week in one file was ~3,000 lines and every edit meant scrolling past
four irrelevant days. Each `dayN.ts` exports `const dayN: DayPlan`, and the
week's `index.ts` imports them and lists them in `days: [...]` — array order is
day order. A week folder resolves through its `index.ts`, so
`from "./weeks/unit1-week1"` still works and nothing outside `weeks/` knows
about the split.

## The `Week` shape

- `slug`, `unit`, `title`, `summary`, `objectives[]`, `status` (`available` | `coming-soon`)
- `video` — **a day-by-day plan**, not one long video:
  - `title`, `playlistUrl`, `watchNotes[]` (how to watch actively; applies to every day)
  - `days: DayPlan[]` — each `{ day, focus, warmup?, videos: VideoAssignment[], activities?, practice }`
  - `VideoAssignment` is `{ title, youtubeId, length, practice? }`. **Give every video its own
    `practice`**: it renders directly beneath that player, so the student does the thing the
    video just taught before starting the next one. The day's own `practice` is the closing task
    ("to finish the day"), or the entire lesson on a no-video day.
  - `practice` (both kinds) is a `Practice`: a plain string for a one-liner, or
    `{ intro?, steps[], note? }` — steps render as a numbered list, `note` as a muted 💡 aside
    (fallback plan, outlook). **Prefer the steps form for anything sequential**: a paragraph of
    "do X, then Y, then Z" was the teacher-flagged wall-of-text this shape replaced. Notes must
    never set hard time limits ("after 30 minutes") — condition-based fallbacks only, so a
    slow-internet day doesn't read as failure.
  - `warmup` / `activities[]` are `DayActivity`: `{ id, title, steps[], tip?, submit? }`,
    rendered as numbered-step cards on the day's timeline — warmup before the videos, activities
    after them, closing `practice` last, day turn-in box always at the end. These fill the class
    session: a class day is **~5 hours**, and 15 minutes of video with two blurbs is a thin day.
    Hard content rules from the teacher: **everything is computer-based** (no paper — files,
    notes apps, spreadsheets); **designed for self-learning** — no "ask/interview a classmate"
    steps; **plain language, no game-flavored prose** ("level", "boss", points-in-text) — the
    teacher explicitly rejected gamified wording; real interactivity belongs in `game`;
    **every activity has its own turn-in** (`submit` says what to paste; `id` keys the saved
    work — never change it once students have submitted); and no time estimates on activities.
    See week 1 day 1 for the reference shape.
  - `warmupGame` / `game` are `DayGame` — **playable mini-games**, the interactivity the
    teacher asked for (actual games, not gamified prose). Eight kinds:
    - `kind: "row-hunt"` (`components/RowHunt.tsx`) — a table on screen, queries asked in
      words, answered by clicking matching rows, real SQL revealed after each round; ideal as
      the warm-up. `matches: []` (zero-row answers) is supported.
    - `kind: "typing"` (`components/TypingGame.tsx`) — fill-in-the-blank SQL escalating to
      whole commands from memory; `{braces}` in `template` mark what the student types.
    - `kind: "quest"` (`components/Quest.tsx`) — real work in Workbench/files broken into
      missions shown **one at a time**, each cleared by a quick check (retry until right) or a
      paste box that lands in the turn-in.
    - `kind: "boss-battle"` (`components/BossBattle.tsx`) — quiz RPG with boss HP, 5 hearts,
      wrong answers re-queued; plays in a full-screen `GameModal`; ideal as the day's finale.
    - `kind: "sql-console"` (`components/SqlConsole.tsx`) — **the in-page mini DB Fiddle**: a
      tiny real MySQL engine (`lib/minisql.ts`, unit-tested by hand-run smoke tests) executes
      the weeks 1–2 command set — CREATE/DROP/SHOW DATABASES, USE, CREATE/DROP TABLE,
      SHOW TABLES, DESCRIBE (and its `DESC` alias), INSERT (with or without a column list),
      SELECT + WHERE/AND/OR/NOT/ORDER BY,
      ALTER TABLE (ADD COLUMN · ADD [CONSTRAINT] PRIMARY KEY · AUTO_INCREMENT = n), UPDATE,
      DELETE, PRIMARY KEY / AUTO_INCREMENT, SET SQL_SAFE_UPDATES — with genuine MySQL error
      codes/wording. Tasks carry a canonical `solution` and are judged **by effect** (state +
      result/error comparison), so any correct spelling clears them, and a task whose
      `solution` errors is cleared by hitting the same error — error labs are live-fire.
      `setup` seeds databases/tables/USE (a column may carry `pk` / `autoInc`, and a seeded
      cell may be `null`, which is how week 2 stages its "clean the table, then lock it" lab);
      a wrong run rolls back so tasks stay winnable; engine state persists across tasks.
    - `kind: "workbench-sim"` (`components/WorkbenchSim.tsx`) — a clickable mock of the
      Workbench window (SCHEMAS panel + refresh, both lightning bolts, editor, result grid,
      Output panel). Missions name a hotspot to click; wrong clicks explain what was clicked.
      Tool familiarity without (or before) the real install.
    - `kind: "order"` (`components/OrderGame.tsx`) — shuffled SQL lines clicked into correct
      order (file order, clause order). Author rounds so only ONE order is valid — pin
      interchangeable lines via the prompt ("id first, then name…"), and remember any-column
      order and comment placement can create ambiguity.
    - `kind: "answer-sheet"` (`components/AnswerSheet.tsx`) — an in-site answer sheet:
      questions one at a time with a jump-around picker, each answered by the same 2–3
      labeled boxes (`fields`, e.g. prediction → SQL run → real answer); all boxes required;
      everything compiles into one turn-in document. Replaced the "make a .txt answer sheet"
      `DayActivity` at the teacher's request — don't reintroduce create-a-text-file busywork
      for structured Q&A.

    **All eight kinds share one shell contract** (`components/GameModal.tsx`): the timeline
    shows a compact door card and play happens in the full-screen `GameModal`. Seven kinds
    use the shared `GameDoor`/`GameModalHeader`/`GameModalBody`; `boss-battle` hand-rolls its
    violet door card and its own pinned arena header, but honors the same contract. Closing
    the modal
    (✕/Escape) always means **pause, never reset** — state (including typed quest/sheet
    inputs and the console's server) is kept, the door card shows a "paused at…" status and
    offers Continue — which is why **nothing student-facing ever asks "are you sure?"**, and
    why no student-facing surface may use `window.confirm` (the teacher explicitly rejected
    native prompts; the one remaining confirmation in the app is teacher-side, guarding the
    deletion of a student's work, and it is an in-app dialog — see
    `app/teacher/submissions/ConfirmButton.tsx`). The pause contract matters most for quests:
    missions send students to Workbench or a file, and they close the modal while they work.

    `activities[]` accepts games alongside plain `DayActivity` cards — **prefer interactive
    kinds over step-list activities**; the teacher flagged that students with low reading
    comprehension drown in multi-step text blocks, and explicitly prefers doing-in-page
    (console, sim) over multiple-choice checks. Results auto-save as turn-ins under the
    game's `id`. Give every day games tailored around that day's videos.
  - **Days are gated** (`components/LessonFlow.tsx`): students see steps one at a time — games
    unlock the next step on finish, activities on turning in, videos via a "done watching"
    button — with a 🔒 "up next" teaser. Teachers see the whole day. Progress is
    localStorage + server-known turn-ins, so it survives reloads and follows submissions
    across browsers.
- `reading[]` — `{ label, url, note? }`, a genuine text alternative covering the same material
- `activity` — `{ title, goal, steps[], twist, deliverables[] }`
- `selfCheck[]` — `{ question, answer }`

## Choosing a format for each lesson

Every video needs a companion block, and the *kind* of block is a deliberate choice, not a coin
flip. The rule of thumb: **match the format to what the video actually taught.**

| What the video taught | Use | Why |
|---|---|---|
| A concept the student has no words for yet (rows, filtering, sorting) | `row-hunt` as `warmupGame`, *before* the video | They do the thing by hand first, then meet its name. Days 1–4 of both weeks open this way; each Day 5 warms up with a `typing` recap instead. |
| Commands to actually run — the tightest video companion there is | `sql-console` | The in-page mini DB Fiddle runs their SQL for real, checked by effect not spelling. **First choice** whenever the video taught runnable commands. |
| Errors and failure modes | `sql-console` with error-`solution` tasks | Run the broken command, see the REAL error message, matched by error code. Replaced week 1's multiple-choice "break it" quests. |
| The tool's own UI (panels, buttons, where things live) | `workbench-sim` | Click the mock window's real places; wrong clicks teach too. Rehearses Workbench before the install — and covers the DB Fiddle-fallback student. |
| Exact syntax that has to be typed right (keywords, brackets, quotes) | `typing` | Video builds recognition; only typing builds recall. Escalate from one blank to whole-command-from-memory. |
| Sequence and structure (file order, clause order, statement anatomy) | `order` | Assemble shuffled lines into the only order that runs. Make each round unambiguous via the prompt. |
| A procedure in the student's REAL Workbench / real files | `quest` | One mission at a time, cleared by a check or a paste. Use for work that must touch their actual database — the console rehearses, the quest does it for real. |
| Judgement the student must exercise themselves (design a table, invent a column, ask a real question) | `quest` ending in an `input` mission | The paste box *is* the deliverable — this is where a day's twist lives. |
| Recall across everything the day covered | `boss-battle` as the day's `game` | Wrong answers re-queue, so every concept is answered right by the end. One per day, ~12 questions. |
| Structured Q&A with fixed per-question boxes (predict → run → record) | `answer-sheet` | An in-site sheet, all boxes required, one compiled turn-in. Use sparingly — one per week is plenty. |
| A checklist/audit the student marks against their own work | plain `DayActivity` + `submit` | The last remaining use for step-list cards (see Day 5's self-audit). |

The console-vs-quest split matters: `sql-console` gives everyone a guaranteed-working server
(no install required) and instant verification, but it's a fresh sandbox each game — the
student's own `school` database lives only in their real Workbench, so the day's lasting work
(their table, their rows, their twist) still happens in a quest against the real tool. Rehearse
in-page, then do it for real.

**The pre-boss real lab (teacher's hard rule).** On days 1–4, the LAST item in `activities[]`,
immediately before the day's boss battle, is a `quest` with id `real-lab` done on the student's
own computer — real Workbench (or DB Fiddle) plus their growing `weekN.sql` file — so the day
ends with a tangible artifact that exists off this site, not just in-page play. (Each Day 5 is
the exception: a wrap-up day whose activities end with the `self-audit` checklist instead.) The in-page
games rehearse; the lab produces the real output; the boss then quizzes a day the student has
actually done twice. Week 2 keeps the shape and lets it pay off: its Day 3 lab makes the
student lock their real table, which is what finally makes Workbench's safe-update mode accept
their Day 1 `WHERE id = …` updates.

**Dangerous commands get a sandbox before the real table.** From week 2 on, a day whose verb
can destroy data (UPDATE, DELETE) does the destroying inside the console — including one task
that runs the catastrophe *on purpose* with the seatbelt off — before the `real-lab` quest goes
anywhere near the student's own database, and the lab plants its own junk rows to practice on
rather than risking real ones. The teaching order is: feel it where it's free, then act where
it counts.

Two structural constraints when planning a day:

- **Order is fixed by the template**: `warmupGame` → *all* videos → `activities[]` → `game` →
  `practice` → day turn-in. You cannot interleave an activity between two videos. What a student
  does immediately after video 1 must go in that video's own `practice` string; the deeper work
  goes in `activities[]` afterwards.
- **Each item is a gated step.** A day of ~10 steps (warm-up, 2 videos, 4–5 activities, boss,
  closing, turn-in) is the shape that fills a 5-hour session. Week 1 Day 1 and Day 2 are the
  reference.

A running artifact ties the week together: the cheat-sheet quest recurs on days 1–4 and grows
(Day 5 has none — the wrap-up day assembles the file instead), and
each day's turn-in ends with the same three-part exit ticket (in your own words / what surprised
you or broke / one open question). The `.sql` file is per-week (`week1.sql`, `week2.sql`) and
each one continues the last: week 2's file opens with `USE school;` rather than
`CREATE DATABASE`, so running the files in order replays the whole course history on an empty
server — a point the content makes explicitly, because it's how students learn that files build
on files.

**Ids repeat across weeks, and that's fine.** Turn-ins are keyed by
(`week_slug`, `day_number`, `item`), so week 2 reuses `warmup`, `real-lab`, `cheat-sheet`,
`answer-sheet` and `self-audit` without colliding with week 1's. Ids must stay unique *within a
day*, must match `/^[a-z0-9-]{1,40}$/` (the submissions API silently records anything else
under `"day"`), and must never change once students have submitted.

## Adding a week

1. Create `weeks/unit1-week3/` with an `index.ts` (copy week 2's shell) and one `dayN.ts` per
   day, each exporting `const dayN: DayPlan`.
2. Import the week in `content/index.ts` and add it to `weeks[]` (array order = display order).
3. Delete its "coming soon" line from `roadmap[]` in the same file, so it doesn't appear twice.
4. If the week teaches SQL the console can't run yet, **extend `lib/minisql.ts` first** and
   re-run a smoke test — content that a console can't execute is content that can't be shipped.

Nothing else changes: `/week/<slug>` renders it, the teacher's Lessons page gains its release
row, and `releasedDayCount()` keeps it closed to students until the teacher releases a day of
it (`lib/release.ts` compares week positions in `weeks[]`). Students see nothing of it —
including its dashboard listing — until that first release (BUG-006: every student-facing week
list filters through `isWeekOpen`, never content `status` alone).

**Validate every console task before shipping.** Run each `sql-console` game's `solution`
sequence through the engine in order (a scratch `tsx` script that mirrors `SqlConsole.execute`:
run on a clone, commit on success, keep prior state on error) and check the reported output
against the story the `explain` text tells. A 1064 means the engine can't parse the solution;
any other error code should be one the task deliberately teaches.

⚠️ Tooling gotcha: `lib/minisql.ts` contains a literal NUL byte, so `grep`/`rg` treat the file
as binary and skip it unless given `-a` / `--text`. Don't conclude a symbol "isn't there"
because a search over that file came back empty.

## Content rules

- **Slugs are permanent** once shared with students. Format `unit<N>-week<N>`.
- **Pace the video day-by-day.** These students have no prior foundation: ~10–20 minutes of video
  per day, always paired with `practice` that makes them type. Tell them to budget roughly 2× the
  video length in real time. A final day with `videos: []` (pure practice/wrap-up) works well.
- **One task per video.** Two videos followed by a single lump of practice loses the first one.
- **`activity.steps` are not rendered to students** — the days' practice covers the same ground.
  Only `activity.twist` and `activity.deliverables` appear, on the final day. Write `steps` as
  planning notes for yourself, or skip them.
- **Both tracks must genuinely cover the same material** — at least one student struggles with
  video learning, so the reading track is an alternative, not a footnote.
- **Every activity needs a real twist** that can't be satisfied by typing along with the
  tutorial. It's what makes "done" mean something.
- **Aim for ~5 self-check items** — the week page's copy says 4 out of N means you're in good shape.
- **Write to the student**: second person, plain language, encouraging about being stuck.
- **Never mention grading, in either direction** — see [`ui-and-copy.md`](ui-and-copy.md).

## Unit 1 source playlist

The unit's video track is Bro Code's **"MySQL tutorial for beginners"** playlist
(`PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ`): 31 short videos, ~2h59m of video total.

- **Week 1** — videos #1–5 plus logical operators and ORDER BY, over 5 days.
- **Week 2** — UPDATE/DELETE (`OB2leB2iZ6U`, 3:32), PRIMARY KEYS (`620DzFVz41o`, 5:25) and
  AUTO_INCREMENT (`ALht4W2QxqY`, 3:55) — only ~13 minutes of video all week, deliberately: the
  commands change data, so the hours go into careful practice, not watching. Days 2 and 5 have
  `videos: []`.

Remaining videos, roughly mapped for future weeks: joins (#16) for week 3 (the shipped
`roadmap[]` in `content/index.ts` is the authority — currently "Week 3 — Joins", "Week 4 —
JDBC"), with constraints (#9–12), FOREIGN KEYS (#15), functions (#17), wildcards (#19), LIMIT
(#21), UNIONS (#22), SELF JOINS (#23) and GROUP BY (#27) folded in where they fit.
Views/indexes/subqueries/procedures/triggers (#24–26, #30–31) are later-unit material.

Note when authoring from these videos: the PRIMARY KEY video's example table uses a `DECIMAL`
column. Real Workbench is fine with it; the mini console only knows INT / VARCHAR(n) / DATE, so
week 2's video note warns students rather than letting them hit a confusing 1064.

Playlist metadata can be re-scraped from the playlist page's `ytInitialData` — the lockup entries
carry `contentId` (video ID) and a badge `text` (duration).
