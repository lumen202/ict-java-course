# Week 2 shipped (UPDATE/DELETE, PRIMARY KEY, AUTO_INCREMENT); week files split per day; release list rebuilt to scale

**Date:** 2026-08-07

## Why

The [previous entry](2026-08-07-minisql-console-sim-and-order-games.md) ended with week 2 as the
named next step, including the two engine extensions it would need. Mid-session the teacher also
flagged the file-size problem directly: a finished week in one file was ~3,000 lines and "if we
increase further this will make this file very very long — modular approach is better."

Week 2 landing then exposed the same scaling problem in the UI: the teacher's Lessons page listed
every day of every week flat, and with two weeks on screen the teacher's verdict was "scrolling
just to find that lesson is not ideal." Two follow-ups came from seeing it: the native `<select>`
and `window.confirm` "look out of place with our app."

## What shipped

### `lib/minisql.ts` — week-2 surface

Extensions, all with real MySQL codes/wording, all judged by the existing effect-matcher:

- **`DELETE FROM … [WHERE …]`** — behind the same safe-update seatbelt as UPDATE (1175). The
  AUTO_INCREMENT counter deliberately does **not** reset on delete; the "ghost of a deleted row"
  is a Day 4 teaching point.
- **`PRIMARY KEY`** — column-level (`id INT PRIMARY KEY`), table-level (`PRIMARY KEY (id)`), and
  after the fact (`ALTER TABLE t ADD [CONSTRAINT] PRIMARY KEY (col)`). Enforces both promises on
  INSERT and UPDATE: 1062 duplicate entry, 1048 cannot be null. Declaring it late re-checks the
  existing data and **reports duplicates (1062) before NULLs (1138)** — deliberate, so the Day 3
  lab's cleanup proceeds one problem at a time, the way the content narrates it.
- **`AUTO_INCREMENT`** — on the key column only (1075 otherwise, 1063 on a non-INT), counter
  moves forward past explicit ids, `ALTER TABLE t AUTO_INCREMENT = n` repositions it (never
  backwards past existing data, like InnoDB).
- **INSERT with a column list** (`INSERT INTO t (a, b) VALUES …`) — unlisted columns take NULL,
  or the next auto value; omitting a non-auto pk is 1364. Without a list the old all-columns
  rule still holds, which is exactly the 1136 the Day 4 console teaches.
- `ConsoleTableSetup` columns now accept `pk` / `autoInc`, and a seeded cell may be `null` —
  that's how Day 3 stages a table that already violates both promises.

A 57-assertion smoke test (scratchpad, not committed) covers every new path plus week-1
regressions; all pass.

### Week 2 content — `weeks/unit1-week2/`

Five days, week-1's shape throughout (warm-up game → videos → activities → boss → closing →
turn-in), ~13 minutes of video all week because the verbs change data:

- **Day 1 — UPDATE.** Row-hunt "repair shop" (be the WHERE) → video #6 → typing → console that
  repairs typos, hits the quiet 0-rows miss, meets the 1175 wall, and then — with the seatbelt
  deliberately off — **destroys a whole column on purpose**, so the catastrophe is felt once,
  for free. Then a real-Workbench repair quest, cheat sheet, and `week2.sql` started in the lab.
- **Day 2 — DELETE.** No video (Day 1's covered both verbs; today masters one). The **preview
  ritual** — SELECT with the WHERE, DELETE with the identical WHERE, verify the counts agree —
  is the day's spine. Console ends by emptying a table and then DROPping it, proving
  "empty ≠ gone" with a DESCRIBE either side. Answer sheet is the deletion drill on a
  build-then-destroy practice table.
- **Day 3 — PRIMARY KEY.** Warm-up stages the twins problem (two Jens, two id-3s, one NULL id)
  so every aim fails. Video #13. Console builds a keyed table, attacks it twice (1062, 1048),
  then **fails to lock the messy table twice** (1062 → fix → 1138 → fix → success) — the
  clean-then-lock order taught by the server itself. `choose-the-key` quest is pure judgement
  (LRN, plate number, a sales table with no natural key). The lab locks the student's real
  table, which is where Day 1's safe-mode annoyance finally pays off.
- **Day 4 — AUTO_INCREMENT.** Ticket-machine warm-up, video #14, console proving the three laws
  (counts forward, never reuses, never fills gaps) including the classic 1136 from forgetting
  the column list. Order puzzle covers the modern recipe. The lab finally builds the table the
  student **designed in week 1** — key first, machine on, column-list INSERTs.
- **Day 5 — no new syntax.** Typing warm-up over the whole week from memory, order puzzle
  (including seatbelt-off/act/seatbelt-on as a three-line ceremony), teach-it-back,
  assemble-`week2.sql`, self-audit, final boss.

Six self-check items; reading track points at SQLBolt 16–18 and the W3Schools key pages.
Registered in `content/index.ts`; its roadmap line removed.

### Per-day content files (both weeks)

`weeks/unit1-week1.ts` (2,966 lines) and `weeks/unit1-week2.ts` (2,525) are now
`weeks/unit1-week1/{index,day1..day5}.ts` and the same for week 2 — 428–664 lines per day, ~100
per shell. Each `dayN.ts` exports `const dayN: DayPlan`; the week's `index.ts` imports them and
lists them in `days: [...]`. Because a folder resolves through its `index.ts`, the import path
`./weeks/unit1-week1` is unchanged and nothing outside `weeks/` knows the split happened.

The split was done mechanically (a scratchpad script over the uniform formatting) and verified
content-neutral: `JSON.stringify(weeks)` before and after is byte-identical.

### The teacher's release list, rebuilt to scale (`components/LessonReleaseList.tsx`)

`/teacher/lessons` is now a thin server wrapper that maps the content model into a flat
serializable `ReleaseWeek[]` and hands it to one client component:

- **Weeks are collapsible cards.** Only the week the class is on starts open; each card's chip
  says `Day 3 of 5 released` / `All 5 days open for review` / `Not started`.
- **A filter box** matches days by focus text or label, and **force-expands** the weeks that
  matched — a hit hidden inside a collapsed card would defeat searching for it.
- **A jump menu** scrolls to any week and expands it. This started as a native `<select>` and was
  replaced within minutes: the OS popup is drawn in the system's own style (bright blue on a dark
  page) and reads as another application's UI. It's now a button + panel in the app's own
  language, closed by Escape and click-outside, with real buttons as items so tab order works.
  The search input's webkit clear button was suppressed and replaced for the same reason.
- **Expand all / Collapse all are two buttons, not one toggle** — with the current week open by
  default, a toggle reads "Expand all" while a week is open, leaving no visible way to close it.
  Each disables when it would do nothing.
- It is a Client Component **only** for the interaction. Release still happens through plain
  `<form action={releaseDay}>` Server Actions imported from `app/teacher/actions.ts` (legal
  because that's a dedicated `"use server"` file), so releasing works before hydration.

### The one remaining confirmation is now an in-app dialog

`app/teacher/submissions/ConfirmButton.tsx` guarded "delete this turn-in" and "hand back the whole
day" with `window.confirm`. Same complaint, same fix: it now portals an app-styled dialog
(headline + detail split on the message's blank line, Cancel focused by default, destructive
action in red, Escape and backdrop to dismiss) and submits the form via `requestSubmit()` from
outside it. The confirmation itself stays — this deletes a student's work and can't be undone.
The no-`window.confirm` rule in `course-content.md` was reworded accordingly: it is a
student-facing rule, and this teacher-side guard was never the thing the teacher rejected.

`npx tsc --noEmit`, `npm run lint`, `npm run build` all pass.

## Watch out for

- **The engine and the content are coupled both ways.** Every week-2 console `solution` was
  replayed through the engine in order (scratchpad script mirroring `SqlConsole.execute`) and
  its output read against the `explain` text. Do this for any new console game — a 1064 means
  the engine can't parse a solution, and a silently-different error code makes an `explain` lie.
- **1062-before-1138 in `ADD PRIMARY KEY` is load-bearing**, not incidental. Day 3's console
  narrates two different refusals in sequence; swapping the check order breaks that story.
- **Step ids repeat across weeks on purpose** (`warmup`, `real-lab`, `cheat-sheet`,
  `answer-sheet`, `self-audit`). Safe because turn-ins are keyed by
  (`week_slug`, `day_number`, `item`) — but ids must stay unique within a day, and never change
  once students have submitted.
- **The PRIMARY KEY video uses a `DECIMAL` column**, which the console doesn't support. Day 3's
  video note warns students rather than letting them hit a confusing 1064. Any future week whose
  video introduces a new type needs the same treatment — or the engine extended.
- **Nothing is released yet.** Week 2 appears on the teacher's Lessons page with its own five
  Release rows and stays closed to students until a week-2 day is released; releasing one also
  opens all of week 1 (past weeks are fully open by design — `lib/release.ts`).
- Splitting future weeks: keep the per-day file convention. A week authored as one file will
  work fine and will also be the next thing someone has to break up.
- **`lesson-release.md` described a `ReleaseControls` component that no longer existed** — it had
  been deleted in an earlier session without the doc being updated. Fixed while rewriting that
  section. Worth a glance at the surrounding prose whenever you touch a subsystem: these are
  living docs, and a stale component name is the cheapest kind of wrong.
- **Native form controls are a recurring papercut in this UI.** `<select>` popups, webkit's
  search-clear button, `window.confirm` — all OS-drawn, all visibly foreign against this theme,
  and all flagged by the teacher on sight. Prefer an in-app control whenever one is reasonable.

## What's next

- **Week 3 — constraints (#9–12) and FOREIGN KEYS (#15).** The console needs UNIQUE / NOT NULL /
  CHECK / DEFAULT, then foreign keys with their own error family (1452 on a bad reference, 1451
  on deleting a referenced parent) — a bigger engine lift than week 2's, and worth doing before
  writing a line of content. Two-table SELECTs (joins) are the week after and will need real
  parser work.
- The free-play console (no tasks) on the dashboard or week page is still unbuilt; the engine has
  supported it since week 1's session.
- Still unplaytested on a phone: the `workbench-sim` SCHEMAS-panel layout.
