// unit1-week2 · Day 2 — Remove rows on purpose with DELETE
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.
//
// Reworked to the pacing redesign pattern — see day1.ts (the template) and
// docs/agent/log/2026-08-16-pacing-research-and-day-redesign-plan.md:
// faded console hints, compose-from-scratch tasks whose goal is a question,
// predict-before-run on surprising outcomes, plausible MCQ distractors with
// varied answer positions, and an optional challenge tier after the real lab.

import type { DayPlan } from "../../types";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "Remove rows on purpose with DELETE",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup-day2",
    title: "🕹️ Warm-up game: the great cleanup",
    intro:
      "The school fair's signup table collected some garbage: test rows someone forgot to remove, and a double signup. DELETE removes whole rows — and reading a DELETE means seeing two lists at once: what goes, and what survives. Click what each round asks for, then press Run.",
    tableName: "signups",
    columns: ["id", "name", "booth"],
    rows: [
      ["1", "Liza", "Food stall"],
      ["2", "test", "Food stall"],
      ["3", "Marco", "Games"],
      ["4", "zzz", "Games"],
      ["5", "Jen", "Exhibits"],
      ["6", "Marco", "Games"],
      ["7", "Paolo", "Exhibits"],
    ],
    rounds: [
      {
        question: "Two obviously fake signups snuck in during testing. Click both junk rows.",
        matches: [1, 3],
        sql: "DELETE FROM signups\nWHERE name = 'test' OR name = 'zzz';",
        explain:
          "DELETE takes no column list — it removes ENTIRE rows. The WHERE aims it exactly like an UPDATE's WHERE. Same aim, heavier verb.",
      },
      {
        question: "Marco signed up twice. Click the EXTRA copy — the one with the higher id.",
        matches: [5],
        sql: "DELETE FROM signups WHERE id = 6;",
        explain:
          "To remove one of two look-alike rows you need something only that row has — here, its id. Hold onto this feeling: it's the whole reason Thursday exists.",
      },
      {
        question:
          "The Games booth is cancelled. Click every row that DELETE FROM signups WHERE booth = 'Games'; removes.",
        matches: [2, 3, 5],
        sql: "DELETE FROM signups WHERE booth = 'Games';",
        explain:
          "Three rows gone in one statement — a WHERE that matches a group deletes the whole group. The rows-affected count (3) is how you confirm the blast radius.",
      },
      {
        question:
          "Flip your thinking: click every row that SURVIVES DELETE FROM signups WHERE booth = 'Exhibits';",
        matches: [0, 1, 2, 3, 5],
        sql: "DELETE FROM signups WHERE booth = 'Exhibits';\n-- survivors: everyone whose booth is NOT 'Exhibits'",
        explain:
          "A DELETE is defined by what it removes, but its consequences are what remains. Before running one, picture both lists — if you can't, you're not ready to run it.",
      },
      {
        question: "Click every row that DELETE FROM signups WHERE id = 99; removes.",
        matches: [],
        sql: "DELETE FROM signups WHERE id = 99;",
        explain:
          "Nobody — '0 row(s) affected', no error. The same quiet miss as yesterday's UPDATE. The count is the only witness, for both verbs.",
      },
      {
        question: "The nightmare: DELETE FROM signups; — no WHERE. Click everything it removes.",
        matches: [0, 1, 2, 3, 4, 5, 6],
        sql: "DELETE FROM signups;\n-- every row. the table survives, empty.",
        explain:
          "All of it. The table's shape survives, holding nothing. Safe update mode blocks this one too — today you'll hit that wall on purpose.",
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "typing",
      id: "typing-delete",
      title: "⌨️ Type the removals",
      intro:
        "No new video today — yesterday's covered DELETE, and today you master it. DELETE's shape is smaller than UPDATE's, which is exactly what makes it dangerous: less typing between you and an empty table.",
      rounds: [
        {
          prompt: "Remove the signup with id 4 — start with the two command words.",
          template: "{DELETE FROM} signups WHERE id = 4;",
          explain:
            "DELETE FROM, always together. There's no column list, because DELETE removes whole rows — you can't delete half a row.",
        },
        {
          prompt: "Remove every signup named 'test'.",
          template: "DELETE FROM signups {WHERE} name = 'test';",
          explain: "The WHERE is the only thing standing between one junk row and the whole table.",
        },
        {
          prompt: "Before deleting the Games rows, PREVIEW them — the professional's first move.",
          template: "{SELECT * FROM} signups WHERE booth = 'Games';",
          explain:
            "The ritual: SELECT with the WHERE first, count what comes back, then swap SELECT * for DELETE. Same aim, harmless verb first.",
        },
        {
          prompt: "Now that the preview looked right, do the removal.",
          template: "{DELETE FROM} signups WHERE booth = 'Games';",
          explain:
            "Preview, delete, verify — the WHERE stays identical through all three. That's what makes the ritual trustworthy.",
        },
        {
          prompt: "A different beast entirely: remove the whole signups TABLE — shape and all.",
          template: "{DROP TABLE} signups;",
          explain:
            "DELETE empties; DROP erases. After DROP there's no table left to describe, let alone select from. Know which one you're typing.",
        },
        {
          prompt: "From memory: remove the signup with id 6.",
          template: "{DELETE FROM signups WHERE id = 6;}",
          explain: "Two words, a table, an aim. Small statement, permanent consequences.",
        },
        {
          prompt: "From memory: the preview that belongs BEFORE that delete.",
          template: "{SELECT * FROM signups WHERE id = 6;}",
          explain:
            "If you typed this without thinking, the ritual is becoming a reflex — which is the whole point of today.",
        },
        {
          prompt: "Last one, from memory — type the most dangerous line in SQL, so you'll recognize it forever.",
          template: "{DELETE FROM signups;}",
          explain:
            "No WHERE, no survivors. You typed it here so that if your fingers ever produce it on a real table, an alarm goes off in your head before you press run.",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "delete-console",
      title: "🖥️ Mini server: the demolition site",
      intro:
        "The fair's signup table is live on the mini server, junk and all — plus a scratch table nobody needs. Clean up the signups with the preview ritual, hit the safety wall on purpose, and finish by learning the difference between emptying a table and erasing one. Then, with nothing left to copy, you rebuild scratch and settle a late arrival entirely on your own.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "signups",
                columns: [
                  { name: "id", type: "INT" },
                  { name: "name", type: "VARCHAR(50)" },
                  { name: "booth", type: "VARCHAR(30)" },
                ],
                rows: [
                  ["1", "Liza", "Food stall"],
                  ["2", "test", "Food stall"],
                  ["3", "Marco", "Games"],
                  ["4", "zzz", "Games"],
                  ["5", "Jen", "Exhibits"],
                  ["6", "Marco", "Games"],
                  ["7", "Paolo", "Exhibits"],
                ],
              },
              {
                name: "scratch",
                columns: [
                  { name: "id", type: "INT" },
                  { name: "note", type: "VARCHAR(30)" },
                ],
                rows: [
                  ["1", "testing 123"],
                  ["2", "delete me"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal: "Baseline first: show every signup.",
          solution: "SELECT * FROM signups;",
          hint: "SELECT * FROM signups;",
          explain:
            "Seven rows — including two fakes and a double signup. Count before you cut: every removal today should end with a number you predicted.",
        },
        {
          goal: "The ritual, step 1 — PREVIEW the junk: show the rows named 'test' or 'zzz' without touching them.",
          solution: "SELECT * FROM signups WHERE name = 'test' OR name = 'zzz';",
          hint: "SELECT with the aim you'll delete with: WHERE name = 'test' OR name = 'zzz'.",
          explain:
            "Two rows, exactly the fakes. This SELECT is a dress rehearsal — same WHERE, harmless verb. Now the aim is proven.",
        },
        {
          goal: "The ritual, step 2 — pull the trigger: delete those junk rows.",
          solution: "DELETE FROM signups WHERE name = 'test' OR name = 'zzz';",
          hint: "Swap SELECT * for DELETE, keep the WHERE identical.",
          explain:
            "2 rows affected — the same 2 your preview showed. When the preview count and the delete count match, you removed exactly what you meant to.",
        },
        {
          goal: "The ritual, step 3 — verify: show the whole table again.",
          solution: "SELECT * FROM signups;",
          explain:
            "Five rows, no fakes. Preview, delete, verify — that's the full ritual, and you just ran it perfectly.",
        },
        {
          goal: "Marco is signed up twice. Remove ONLY the extra copy — the one with id 6.",
          solution: "DELETE FROM signups WHERE id = 6;",
          hint: "Aim at the id — it's the only thing the two Marco rows don't share.",
          explain:
            "1 row affected. Notice what saved you: the id. WHERE name = 'Marco' would have deleted BOTH Marcos. When rows look alike, only a unique column can tell them apart — Thursday makes that guarantee official.",
        },
        {
          goal: "Try to delete the signup with id 99.",
          solution: "DELETE FROM signups WHERE id = 99;",
          predict: {
            question: "There is no signup with id 99. What will the server say when you run it?",
            choices: [
              "An error — DELETE refuses to run against a row that doesn't exist",
              "0 row(s) affected — no complaint at all",
              "It deletes the last row in the table instead, since 99 is closest to it",
            ],
            answer: 1,
            explain:
              "No error, no fallback target — DELETE only ever removes what the WHERE finds, even when that's nothing.",
          },
          explain:
            "0 rows affected — the quiet miss again, now wearing DELETE's clothes. No error, nothing removed. Both careful verbs miss silently; both report it only in the count.",
        },
        {
          goal: "Meet the wall: try to delete EVERY signup — no WHERE.",
          solution: "DELETE FROM signups;",
          predict: {
            question: "No WHERE, and the seatbelt (safe update mode) is still on. What happens?",
            choices: [
              "7 row(s) affected — every signup is removed",
              "MySQL asks you to confirm such a big change first",
              "An error — the statement is refused and nothing changes",
            ],
            answer: 2,
            explain:
              "MySQL never asks 'are you sure?'. Safe update mode simply refuses the statement outright — that refusal IS the protection.",
          },
          explain:
            "Error 1175 — the same seatbelt that caught yesterday's UPDATE catches a WHERE-less DELETE. Safe update mode guards both of the careful verbs.",
        },
        {
          goal: "Take the seatbelt off, deliberately.",
          solution: "SET SQL_SAFE_UPDATES = 0;",
          explain:
            "Off — your decision, your responsibility. The next few tasks are exactly why we practice this on a toy server.",
        },
        {
          goal: "The scratch table is genuinely trash. EMPTY it — remove all its rows.",
          solution: "DELETE FROM scratch;",
          explain:
            "2 rows affected — the table is now empty. But is it GONE? That's the next question, and the answer matters.",
        },
        {
          goal: "Prove the empty table still EXISTS: ask for its shape.",
          solution: "DESCRIBE scratch;",
          predict: {
            question: "scratch now has 0 rows. What will DESCRIBE scratch; show?",
            choices: [
              "Error 1146 — the table doesn't exist anymore",
              "The two columns, still declared — the table's shape survives",
              "Nothing at all — DESCRIBE only works on tables that still have rows",
            ],
            answer: 1,
            explain:
              "DELETE empties the container; the container remains. DESCRIBE reads the shape, not the rows — so it doesn't care that scratch is empty.",
          },
          explain:
            "Two columns, still declared, still enforcing their types — the shape survived. DELETE empties the container; the container remains. An empty table and a missing table are completely different things.",
        },
        {
          goal: "Now actually erase it: remove the scratch table entirely.",
          solution: "DROP TABLE scratch;",
          explain:
            "Gone — rows, columns, rules, everything. The server just says 'Query OK' and moves on; it won't tell you how much you destroyed. The next task makes it tell you.",
        },
        {
          goal: "Don't take the server's word for it. Ask the erased table for its shape — the exact command that worked one task ago.",
          solution: "DESCRIBE scratch;",
          predict: {
            question:
              "One task ago, DESCRIBE scratch; printed two columns. The table has since been DROPped. What does the very same command report now?",
            choices: [
              "The same two columns as before — DROP only removes the rows, like DELETE does",
              "Error 1146 — the table doesn't exist",
              "0 columns — an empty shape, but the table is still there to describe",
            ],
            answer: 1,
            explain:
              "DROP erases the table itself — rows, columns, rules, name, everything. There's nothing left to describe.",
          },
          explain:
            "Error 1146: Table 'school.scratch' doesn't exist. You ran the identical command twice a few tasks apart: after DELETE it answered with two columns, after DROP it can't answer at all. That is the difference between an empty table and a missing one, proved by the server rather than promised by us. DELETE and DROP are different weight classes; never confuse them.",
        },
        {
          goal: "Final check: list the tables left in this database.",
          solution: "SHOW TABLES;",
          explain:
            "Only signups remains. Today's whole arsenal in review: DELETE removes rows (aim it, preview it), DROP removes tables (be very sure), and the count verifies everything. From here on, nobody hands you the statement — each task is a question, and you compose the SQL yourself.",
        },
        {
          goal: "The crew wants a fresh scratch table for notes on tomorrow's cleanup — same shape as the one you just erased: id INT, note VARCHAR(30). Build it.",
          solution: "CREATE TABLE scratch (id INT, note VARCHAR(30));",
          explain:
            "Rebuilt from nothing but a memory of its shape. CREATE, DELETE and DROP all showed up today — knowing which one a job calls for is the actual skill.",
        },
        {
          goal: "Leave today's note in scratch: id 1, note 'Games active, signups clean'.",
          solution:
            "INSERT INTO scratch (id, note) VALUES (1, 'Games active, signups clean');",
          explain: "One row, one note — scratch is doing its job again.",
        },
        {
          goal: "Jomar arrives late wanting the Exhibits booth — add him as id 8. Then, in the confusion, he gets entered a second time by accident, as id 9 with the exact same details. Add both rows.",
          solution:
            "INSERT INTO signups (id, name, booth) VALUES (8, 'Jomar', 'Exhibits');\nINSERT INTO signups (id, name, booth) VALUES (9, 'Jomar', 'Exhibits');",
          explain:
            "Two rows in, one genuine signup and one accidental copy — a fresh mess for you to clean up yourself, the same way real ones show up.",
        },
        {
          goal: "Which Jomar row is the accidental copy, and how do you remove only that one?",
          solution: "DELETE FROM signups WHERE id = 9;",
          explain:
            "1 row affected — the duplicate, and only the duplicate. Same lesson as Marco's double signup this morning: when two rows look alike, the id is what tells them apart.",
        },
        {
          goal: "The fair organizer wants a final list: everyone still signed up for Exhibits, most recently added first.",
          solution: "SELECT * FROM signups WHERE booth = 'Exhibits' ORDER BY id DESC;",
          explain:
            "Jomar, then Paolo, then Jen — ORDER BY id DESC puts the newest arrival on top, since a bigger id means it was inserted later. No one showed you this query; you turned a question about the data into SQL, which is the actual job.",
        },
      ],
    },
    {
      kind: "answer-sheet",
      id: "answer-sheet",
      title: "📝 Answer sheet: the deletion drill",
      intro:
        "Time to do it for real — in YOUR Workbench, on a practice table you'll build and then destroy. For each question: predict first, then run, then record what actually happened. Where prediction and reality disagree, that's the lesson. (Seatbelt reminder: some steps will need SET SQL_SAFE_UPDATES = 0; — notice WHICH ones, that's part of the drill.)",
      fields: [
        "My prediction — before running anything",
        "The SQL I ran in Workbench",
        "What actually happened",
      ],
      items: [
        {
          question:
            "Build the practice range: in your school database, create a table practice_rows (id INT, label VARCHAR(20)) and insert five rows with ids 1 to 5. How many rows does SELECT * FROM practice_rows; show?",
          note: "Week-1 muscles: CREATE TABLE, then one multi-row INSERT.",
        },
        {
          question: "Delete the row with id 3. How many rows affected — and how many remain?",
        },
        {
          question: "Run SELECT * FROM practice_rows; — which ids do you expect to see?",
        },
        {
          question: "Delete every row with id greater than 3. Predict the rows-affected count before you run.",
        },
        {
          question: "Delete the row with id 99. What does MySQL say, exactly?",
        },
        {
          question:
            "Try DELETE FROM practice_rows; with NO WHERE. What does Workbench do, and what error number is in the message?",
          note: "Don't fix it yet — this question's answer IS the refusal.",
        },
        {
          question:
            "Turn safe update mode off, run that delete-everything again, then SELECT * FROM practice_rows;. What comes back — an error, or something else?",
          note: "Think about yesterday's lesson on empty results before you predict.",
        },
        {
          question:
            "Run DESCRIBE practice_rows; — does the table still exist? Now DROP TABLE practice_rows; and run DESCRIBE again. What changed?",
          note: "The two DESCRIBE results, side by side, are the whole DELETE-vs-DROP lesson in one picture.",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet-day2",
      title: "📓 Quest: cheat sheet, day 2",
      intro:
        "Today's section is the one future-you will read with sweaty palms before touching production data one day. Write it like it matters — it does.",
      missions: [
        {
          task: "Add a Day 2 heading. From memory, write: delete one row, delete a group, and the preview SELECT that belongs before each. Write the preview ABOVE each delete, the way you'd actually run them.",
          check: {
            question: "Why write the preview SELECT into your cheat sheet at all?",
            choices: [
              "The preview line is mainly there to catch syntax errors before you run anything risky",
              "So the ritual is part of the recipe — copying the delete without the preview should feel incomplete",
              "MySQL requires a SELECT to run immediately before every DELETE, or the DELETE is rejected",
            ],
            answer: 1,
            explain:
              "A cheat sheet teaches habits, not just syntax — and MySQL never requires a preview, which is exactly why it's easy to skip. If yours shows preview-then-delete as one unit, that's how your fingers will learn it.",
          },
        },
        {
          task: "Add a boxed line (draw it with = signs or emoji, make it LOUD): 'DELETE removes rows. DROP removes the table. Empty ≠ gone.' Then add error 1175 to your errors section with the fix and when it's okay to use the fix.",
          input:
            "Paste your Day 2 cheat-sheet section — the preview-delete pairs, your loud DELETE/DROP line, and the 1175 entry",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: demolition license, earned on your own table",
      intro:
        "The drill table is gone; now the real thing. Your students table gets some junk — planted by you, removed by you, with the full ritual. Practicing demolition on scaffolding you built is how professionals stay calm around real data.",
      missions: [
        {
          task: "Plant the junk: INSERT two fake students into your real students table with ids 998 and 999 and obviously fake names. Verify with SELECT that they're in.",
          check: {
            question: "Why give the junk rows ids like 998 and 999?",
            choices: [
              "AUTO_INCREMENT always jumps into the 900s for the next batch of rows, so those ids were free anyway",
              "Rows inserted in the same INSERT statement always land in the high 900s automatically",
              "They're easy to aim at and could never be confused with your real students",
            ],
            answer: 2,
            explain:
              "Nothing about AUTO_INCREMENT or a shared INSERT statement pushes ids into the 900s on its own — you're choosing 998 and 999 on purpose. Junk you can aim at precisely is junk you can remove safely. Ambiguous junk is how real tables end up haunted.",
          },
        },
        {
          task: "The ritual, on real data: preview with SELECT * FROM students WHERE id >= 998; — confirm exactly your two fakes come back — then swap SELECT * for DELETE and run it. (Seatbelt: your table still has no key, so safe mode may refuse even this WHERE — switch it off for the session if so.)",
          check: {
            question: "The preview showed 2 rows. The DELETE reported '2 row(s) affected'. What does that pair of numbers prove?",
            choices: [
              "DELETE always echoes back whatever number the last SELECT reported, whether they match the real rows or not",
              "You removed exactly what you previewed — nothing more, nothing less",
              "The WHERE clause ran twice, once for the SELECT and once for the DELETE, so the count naturally doubled and then matched",
            ],
            answer: 1,
            explain:
              "The DELETE doesn't echo anything and the WHERE doesn't run twice — it evaluates the table fresh each time. Matching counts close the loop: aim proven by the SELECT, blast radius confirmed by the DELETE. That's the whole ritual doing its job on real data.",
          },
        },
        {
          task: "Verify your real students all survived: SELECT * FROM students; and check the row count matches what you had before the planting. Then add a '-- Day 2' section to week2.sql: the two INSERTs, the preview, the DELETE — each with its why-comment.",
          input:
            "Paste your Day 2 section of week2.sql, and the row count of your students table after the cleanup (it should match Monday's)",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "bug-hospital",
      optional: true,
      title: "🏥 Challenge: the bug hospital",
      intro:
        "Six broken DELETEs came in overnight from the school's storage room cleanup — each one written by someone in a hurry, each one wrong in a different way. Read the patient, work out what its author MEANT, and run the statement that actually does it. Nobody hands you the answer in here; that's what makes it the good ward.",
      setup: {
        databases: [
          {
            name: "storage_room",
            tables: [
              {
                name: "bins",
                columns: [
                  { name: "id", type: "INT" },
                  { name: "item", type: "VARCHAR(50)" },
                  { name: "shelf", type: "VARCHAR(10)" },
                  { name: "status", type: "VARCHAR(20)" },
                ],
                rows: [
                  ["1", "Extension cord", "A1", "usable"],
                  ["2", "Broken stapler", "A2", "junk"],
                  ["3", "Duct tape roll", "B1", "usable"],
                  ["4", "Empty markers", "C4", "junk"],
                  ["5", "Spare chair leg", "B3", "junk"],
                  ["6", "Old projector bulb", "A3", "junk"],
                  ["7", "Broken stapler", "A2", "junk"],
                  ["8", "Chalk stub", "D1", "junk"],
                ],
              },
            ],
          },
        ],
        use: "storage_room",
      },
      tasks: [
        {
          goal: "Patient 1 refuses to run: DELETE bins WHERE id = 7; — id 7 is an accidental duplicate stapler entry, and it really does need to go. Fix the statement and run it.",
          solution: "DELETE FROM bins WHERE id = 7;",
          explain:
            "DELETE always needs FROM right after it — unlike SELECT, there's no shorthand. One missing word, dead statement.",
        },
        {
          goal: "Patient 2's ticket says 'clear the empty markers off shelf C4' (id 4) and someone wrote DROP TABLE bins; — that would erase every shelf, not just one item. Remove just that row.",
          solution: "DELETE FROM bins WHERE id = 4;",
          explain:
            "DROP would have taken the whole table down — usable items and all. DELETE with a WHERE removes just the row that matches; the table survives to hold what's left.",
        },
        {
          goal: "Patient 3 previewed SELECT * FROM bins WHERE id = 6; (confirmed: the old projector bulb) — then ran DELETE FROM bins WHERE id = 5; a completely different row. Run the DELETE that actually matches what was previewed.",
          solution: "DELETE FROM bins WHERE id = 6;",
          explain:
            "The preview and the delete have to share the same WHERE — that's the whole ritual. A DELETE aimed differently than its preview removes something nobody actually checked.",
        },
        {
          goal: "Patient 4 wanted the spare chair leg on shelf B3 (id 5) gone, but wrote DELETE FROM bins WHERE item = 'B3'; — 'B3' is the shelf, not the item's name, so it silently matched nothing. Aim at the correct column.",
          solution: "DELETE FROM bins WHERE shelf = 'B3';",
          explain:
            "'B3' is a shelf label, not anybody's item name — WHERE item = 'B3' matches nothing. The column has to match what the value actually describes, and a wrong column misses just as quietly as a wrong value.",
        },
        {
          goal: "Patient 5 tried DELETE FROM bins WHERE id = 'two'; hoping to remove the broken stapler (id 2) — 0 row(s) affected, no error. Run the DELETE that actually removes it.",
          solution: "DELETE FROM bins WHERE id = 2;",
          explain:
            "id is a number column, and no number equals the word 'two' — quotes don't turn text into a number. The WHERE matched nothing and reported a cheerful 0 rows. The quiet miss again, this time hiding behind punctuation.",
        },
        {
          goal: "Last patient: DELETE * FROM bins WHERE id = 8; — copying the star from a SELECT. Instant syntax error; DELETE never takes a column list, not even a star. Remove the chalk stub (id 8) correctly.",
          solution: "DELETE FROM bins WHERE id = 8;",
          explain:
            "SELECT * means 'every column' — DELETE has no column list to select from, because it always removes the whole row. The star doesn't belong here at all. Ward's empty; you just debugged six statements a working DBA could have written on a bad day.",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      optional: true,
      title: "🔬 Challenge: your own junk drawer",
      intro:
        "Everything today happened to tables I gave you. This one is yours: a junk-drawer table about something you actually have clutter in, junk you plant yourself, a preview-then-delete ritual you run yourself — in your real Workbench, with no script to copy.",
      missions: [
        {
          task: "Pick something you'd genuinely want a junk drawer for on your computer — downloads you never opened, old bookmarks, screenshots, game saves, anything. In your real Workbench (USE school;), create a small table for it: an id column, at least two more columns, and one column that marks each row 'junk' or 'keep'. INSERT at least 6 rows, with at least half marked junk.",
          input: "Paste your CREATE TABLE and INSERT statements",
        },
        {
          task: "Run the preview half of the ritual: write a SELECT with a WHERE that shows only the rows marked junk. Read the count before you touch anything.",
          check: {
            question: "Why preview with SELECT before running the DELETE, even on a table only you will ever see?",
            choices: [
              "Workbench refuses to run a DELETE unless a SELECT with the same WHERE ran first",
              "The SELECT count is the only way to know the DELETE's blast radius before it's permanent",
              "SELECT automatically fixes typos in the WHERE clause before the DELETE runs",
            ],
            answer: 1,
            explain:
              "Workbench doesn't enforce the ritual and SELECT doesn't fix anything — it's a habit you keep because there's no undo. The preview count is the only warning you get before the DELETE makes it permanent.",
          },
        },
        {
          task: "Now the delete half: run the DELETE with the SAME WHERE as your preview, then SELECT * one more time to check what's left.",
          check: {
            question: "Your preview showed 3 rows and the DELETE reported '3 row(s) affected'. What does that prove?",
            choices: [
              "Nothing on its own — the DELETE always reports whatever the last SELECT reported",
              "The table only had 3 rows total",
              "The DELETE removed exactly the rows the preview showed — the aim was correct",
            ],
            answer: 2,
            explain:
              "The DELETE isn't echoing the SELECT and the table can hold far more than 3 rows — the match is the WHERE landing the same way twice. That's the proof the aim was right.",
          },
        },
        {
          task: "Turn in the drawer's paperwork.",
          input:
            "Paste your maintenance log: the table name, the preview SELECT and how many rows it found, the DELETE and its rows-affected count, and the final SELECT proving what survived",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-data-reaper",
    title: "⚔️ Boss battle: The Data Reaper",
    intro:
      "The Data Reaper harvests rows from the careless. It only fears people who preview before they delete — which, as of today, is you.",
    boss: { name: "the Data Reaper", emoji: "💀" },
    questions: [
      {
        prompt: "What does DELETE remove?",
        choices: [
          "Whole rows — never single values, never columns",
          "Whichever columns you list, like a SET clause but for removal",
          "The table itself, same as DROP TABLE",
        ],
        answer: 0,
        explain:
          "Rows, entire. To blank a single value you'd UPDATE it to NULL; to remove the table you'd DROP it. DELETE lives exactly in between.",
      },
      {
        prompt: "DELETE FROM students; versus DROP TABLE students; — the difference?",
        choices: [
          "They do the same thing — both remove everything from the table",
          "DROP only removes rows temporarily; DELETE is the permanent one",
          "DELETE empties the table but keeps its shape; DROP erases the table entirely",
        ],
        answer: 2,
        explain:
          "You proved it on the mini server: after DELETE, DESCRIBE still works; after DROP, even DESCRIBE errors. Empty ≠ gone — and neither DROP nor DELETE is the 'temporary' one.",
      },
      {
        prompt: "What's the preview ritual?",
        choices: [
          "Back up the whole database before every delete, then run it",
          "SELECT with your WHERE first, check what comes back, then swap in DELETE with the SAME WHERE",
          "Run the DELETE with a broader WHERE first, then narrow it down after checking results",
        ],
        answer: 1,
        explain:
          "Same aim, harmless verb first. If the SELECT surprises you, you just avoided a disaster for free — no backup, no broad-then-narrow guesswork needed.",
      },
      {
        prompt: "Your preview SELECT returned 5 rows. The DELETE then reported '5 row(s) affected'. That means…",
        choices: [
          "You removed exactly what you previewed",
          "The table only had 5 rows total, so of course both numbers matched",
          "Matching counts are a coincidence and don't prove the DELETE aimed correctly",
        ],
        answer: 0,
        explain:
          "Matching counts are the ritual's receipt, not a coincidence — and the table can hold far more than 5 rows elsewhere. A mismatch would mean the data changed between preview and delete, or your WHERE did.",
      },
      {
        prompt: "DELETE FROM students WHERE id = 500; runs on a table with no id 500. Result?",
        choices: [
          "Error: row not found",
          "'0 row(s) affected' — a quiet miss, no error",
          "The nearest matching row gets deleted instead, since the exact id is missing",
        ],
        answer: 1,
        explain:
          "Same quiet miss as UPDATE's. The careful verbs never complain about missing targets and never pick a substitute — they just report the count.",
      },
      {
        prompt: "With safe update mode ON, DELETE FROM students; (no WHERE) gets you…",
        choices: [
          "An empty table — every row gets removed",
          "A confirmation dialog asking you to type YES",
          "Error 1175 — the seatbelt blocks WHERE-less deletes too",
        ],
        answer: 2,
        explain:
          "One seatbelt, both verbs. No dialog, nothing removed. And the fix is the same deliberate choice: SET SQL_SAFE_UPDATES = 0; — followed by extra care.",
      },
      {
        prompt: "After DELETE FROM scratch; succeeds, SELECT * FROM scratch; returns…",
        choices: [
          "The column headings with no rows — a valid, empty result",
          "Error 1146: table doesn't exist",
          "Every column holding NULL, since the rows still exist but empty",
        ],
        answer: 0,
        explain:
          "The table exists and answers honestly: nothing in here, not NULL-filled rows. Only after a DROP would the SELECT itself fail.",
      },
      {
        prompt: "Two identical-looking rows, and you must delete only one. What do you need?",
        choices: [
          "Running the DELETE with LIMIT 1 so only one of the matching rows gets removed",
          "A column where they differ — like a unique id",
          "There's no way to pick just one — you must always delete both",
        ],
        answer: 1,
        explain:
          "WHERE name = 'Marco' hits every Marco, and this course's DELETE doesn't take a LIMIT. Only something unique to one row can aim at one row — tomorrow makes that guarantee a built-in feature.",
      },
      {
        prompt: "Is there an undo for DELETE?",
        choices: [
          "Yes, Ctrl+Z works in Workbench, even after you've run the statement",
          "Deleted rows move to a hidden recycle-bin table you can restore from",
          "No — which is exactly why the preview ritual exists",
        ],
        answer: 2,
        explain:
          "No recycle bin, no undo, not even Ctrl+Z once the statement has run. Every safety habit this week — preview, seatbelt, counts — exists because deletion is forever.",
      },
      {
        prompt: "Which statement is in the wrong weight class for its job?",
        code: "Job: remove the test rows from signups.\nA) DELETE FROM signups WHERE name = 'test';\nB) DROP TABLE signups;",
        choices: [
          "B — it destroys the whole table to remove a few rows",
          "A — DELETE can only remove one row per statement, so it can't clear all the test rows",
          "Both are equally safe choices here",
        ],
        answer: 0,
        explain:
          "DROP does technically remove the test rows… along with everything else forever. And a WHERE can match a whole group in one DELETE. Matching the verb to the job is the skill.",
      },
      {
        prompt: "Why did you PLANT junk rows before deleting them in today's lab?",
        choices: [
          "So the AUTO_INCREMENT counter has room to grow before real data starts",
          "Practicing demolition on rows you built keeps your real data out of the blast zone",
          "MySQL flags newly-inserted junk rows as specifically safe to delete",
        ],
        answer: 1,
        explain:
          "AUTO_INCREMENT doesn't need 'room' and MySQL has no idea which rows are junk — the reason is entirely yours: controlled practice on scaffolding, not the house. It's how you get calm, and calm people read their WHEREs.",
      },
      {
        prompt: "What single habit makes both UPDATE and DELETE safe?",
        choices: [
          "Always including ORDER BY so rows are processed in a predictable sequence",
          "Decide and preview the WHERE before touching the dangerous verb",
          "Running every command twice, just to be sure",
        ],
        answer: 1,
        explain:
          "ORDER BY only affects display order, and running a dangerous verb twice just doubles the risk. The WHERE is the aim, and both verbs fire wherever it points — aim first, verb second, count last.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "DELETE vs DROP, in your own words, including what 'empty is not gone' means.",
      "The preview ritual and why the counts matter.",
      "One question you still have.",
      "Paste today's SQL too.",
    ],
    note: "Done with time to spare? The two challenge steps above — the bug hospital and your own junk drawer — are waiting, and they're where the preview ritual gets some real teeth. Chew on this overnight too: when you deleted Marco's double signup, only the id could tell the two Marcos apart — but NOTHING in your table actually forces ids to be unique. Tomorrow we fix that hole for good.",
  },
};
