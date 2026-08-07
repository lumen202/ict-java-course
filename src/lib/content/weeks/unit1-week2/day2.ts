// unit1-week2 · Day 2 — Remove rows on purpose with DELETE
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

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
        "The fair's signup table is live on the mini server, junk and all — plus a scratch table nobody needs. Clean up the signups with the preview ritual, hit the safety wall on purpose, and finish by learning the difference between emptying a table and erasing one.",
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
          explain:
            "0 rows affected — the quiet miss again, now wearing DELETE's clothes. No error, nothing removed. Both careful verbs miss silently; both report it only in the count.",
        },
        {
          goal: "Meet the wall: try to delete EVERY signup — no WHERE.",
          solution: "DELETE FROM signups;",
          explain:
            "Error 1175 — the same seatbelt that caught yesterday's UPDATE catches a WHERE-less DELETE. Safe update mode guards both of the careful verbs.",
        },
        {
          goal: "Take the seatbelt off, deliberately.",
          solution: "SET SQL_SAFE_UPDATES = 0;",
          hint: "SET SQL_SAFE_UPDATES = 0;",
          explain:
            "Off — your decision, your responsibility. The next two tasks are exactly why we practice this on a toy server.",
        },
        {
          goal: "The scratch table is genuinely trash. EMPTY it — remove all its rows.",
          solution: "DELETE FROM scratch;",
          hint: "DELETE FROM scratch; — with the seatbelt off, it runs.",
          explain:
            "2 rows affected — the table is now empty. But is it GONE? That's the next question, and the answer matters.",
        },
        {
          goal: "Prove the empty table still EXISTS: ask for its shape.",
          solution: "DESCRIBE scratch;",
          hint: "DESCRIBE scratch;",
          explain:
            "Two columns, still declared, still enforcing their types — the shape survived. DELETE empties the container; the container remains. An empty table and a missing table are completely different things.",
        },
        {
          goal: "Now actually erase it: remove the scratch table entirely.",
          solution: "DROP TABLE scratch;",
          hint: "DROP TABLE scratch; — DROP is the shape-remover.",
          explain:
            "Gone — rows, columns, rules, everything. Run DESCRIBE scratch; now and you'd get Error 1146: the table doesn't exist. DELETE and DROP are different weight classes; never confuse them.",
        },
        {
          goal: "Final check: list the tables left in this database.",
          solution: "SHOW TABLES;",
          explain:
            "Only signups remains. Today's whole arsenal in review: DELETE removes rows (aim it, preview it), DROP removes tables (be very sure), and the count verifies everything.",
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
              "So the ritual is part of the recipe — copying the delete without the preview should feel incomplete",
              "SELECT is harder to remember than DELETE",
              "To make the cheat sheet longer",
            ],
            answer: 0,
            explain:
              "A cheat sheet teaches habits, not just syntax. If yours shows preview-then-delete as one unit, that's how your fingers will learn it.",
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
              "They're easy to aim at and could never be confused with your real students",
              "High numbers insert faster",
              "MySQL requires test rows to use high ids",
            ],
            answer: 0,
            explain:
              "Junk you can aim at precisely is junk you can remove safely. Ambiguous junk is how real tables end up haunted.",
          },
        },
        {
          task: "The ritual, on real data: preview with SELECT * FROM students WHERE id >= 998; — confirm exactly your two fakes come back — then swap SELECT * for DELETE and run it. (Seatbelt: your table still has no key, so safe mode may refuse even this WHERE — switch it off for the session if so.)",
          check: {
            question: "The preview showed 2 rows. The DELETE reported '2 row(s) affected'. What does that pair of numbers prove?",
            choices: [
              "You removed exactly what you previewed — nothing more, nothing less",
              "The table is now empty",
              "Nothing — the numbers are a coincidence",
            ],
            answer: 0,
            explain:
              "Matching counts close the loop: aim proven by the SELECT, blast radius confirmed by the DELETE. That's the whole ritual doing its job on real data.",
          },
        },
        {
          task: "Verify your real students all survived: SELECT * FROM students; and check the row count matches what you had before the planting. Then add a '-- Day 2' section to week2.sql: the two INSERTs, the preview, the DELETE — each with its why-comment.",
          input:
            "Paste your Day 2 section of week2.sql, and the row count of your students table after the cleanup (it should match Monday's)",
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
          "Whichever columns you list",
          "The table itself",
        ],
        answer: 0,
        explain:
          "Rows, entire. To blank a single value you'd UPDATE it to NULL; to remove the table you'd DROP it. DELETE lives exactly in between.",
      },
      {
        prompt: "DELETE FROM students; versus DROP TABLE students; — the difference?",
        choices: [
          "DELETE empties the table but keeps its shape; DROP erases the table entirely",
          "They do the same thing",
          "DROP is temporary, DELETE is permanent",
        ],
        answer: 0,
        explain:
          "You proved it on the mini server: after DELETE, DESCRIBE still works; after DROP, even DESCRIBE errors. Empty ≠ gone.",
      },
      {
        prompt: "What's the preview ritual?",
        choices: [
          "SELECT with your WHERE first, check what comes back, then swap in DELETE with the SAME WHERE",
          "Back up the whole database before every delete",
          "Run the DELETE twice to be sure",
        ],
        answer: 0,
        explain:
          "Same aim, harmless verb first. If the SELECT surprises you, you just avoided a disaster for free.",
      },
      {
        prompt: "Your preview SELECT returned 5 rows. The DELETE then reported '5 row(s) affected'. That means…",
        choices: [
          "You removed exactly what you previewed",
          "Something went wrong — the counts should differ",
          "The table had only 5 rows",
        ],
        answer: 0,
        explain:
          "Matching counts are the ritual's receipt. A mismatch means the data changed between preview and delete — or your WHERE did.",
      },
      {
        prompt: "DELETE FROM students WHERE id = 500; runs on a table with no id 500. Result?",
        choices: [
          "'0 row(s) affected' — a quiet miss, no error",
          "Error: row not found",
          "The nearest row is deleted instead",
        ],
        answer: 0,
        explain:
          "Same quiet miss as UPDATE's. The careful verbs never complain about missing targets — they just report the count.",
      },
      {
        prompt: "With safe update mode ON, DELETE FROM students; (no WHERE) gets you…",
        choices: [
          "Error 1175 — the seatbelt blocks WHERE-less deletes too",
          "An empty table",
          "A confirmation dialog",
        ],
        answer: 0,
        explain:
          "One seatbelt, both verbs. And the fix is the same deliberate choice: SET SQL_SAFE_UPDATES = 0; — followed by extra care.",
      },
      {
        prompt: "After DELETE FROM scratch; succeeds, SELECT * FROM scratch; returns…",
        choices: [
          "The column headings with no rows — a valid, empty result",
          "Error 1146: table doesn't exist",
          "The deleted rows, greyed out",
        ],
        answer: 0,
        explain:
          "The table exists and answers honestly: nothing in here. Only after a DROP would the SELECT itself fail.",
      },
      {
        prompt: "Two identical-looking rows, and you must delete only one. What do you need?",
        choices: [
          "A column where they differ — like a unique id",
          "Luck",
          "You must always delete both",
        ],
        answer: 0,
        explain:
          "WHERE name = 'Marco' hits every Marco. Only something unique to one row can aim at one row — tomorrow makes that guarantee a built-in feature.",
      },
      {
        prompt: "Is there an undo for DELETE?",
        choices: [
          "No — which is exactly why the preview ritual exists",
          "Yes, Ctrl+Z works in Workbench",
          "Deleted rows go to a recycle bin table",
        ],
        answer: 0,
        explain:
          "No recycle bin, no undo. Every safety habit this week — preview, seatbelt, counts — exists because deletion is forever.",
      },
      {
        prompt: "Which statement is in the wrong weight class for its job?",
        code: "Job: remove the test rows from signups.\nA) DELETE FROM signups WHERE name = 'test';\nB) DROP TABLE signups;",
        choices: [
          "B — it destroys the whole table to remove a few rows",
          "A — DELETE can't take a WHERE",
          "Both are fine",
        ],
        answer: 0,
        explain:
          "DROP does technically remove the test rows… along with everything else forever. Matching the verb to the job is the skill.",
      },
      {
        prompt: "Why did you PLANT junk rows before deleting them in today's lab?",
        choices: [
          "Practicing demolition on rows you built keeps your real data out of the blast zone",
          "MySQL requires junk rows before a delete",
          "To make the table bigger",
        ],
        answer: 0,
        explain:
          "Controlled practice on scaffolding, not the house. It's how you get calm — and calm people read their WHEREs.",
      },
      {
        prompt: "What single habit makes both UPDATE and DELETE safe?",
        choices: [
          "Decide and preview the WHERE before touching the dangerous verb",
          "Typing fast so mistakes have less time to happen",
          "Running commands twice",
        ],
        answer: 0,
        explain:
          "The WHERE is the aim, and both verbs fire wherever it points. Aim first, verb second, count last — this week in nine words.",
      },
    ],
  },
  practice:
    "Exit ticket — type three things into the turn-in box below: (1) DELETE vs DROP, in your own words, including what 'empty is not gone' means; (2) the preview ritual and why the counts matter; (3) one question you still have. Paste today's SQL too. And chew on this overnight: when you deleted Marco's double signup, only the id could tell the two Marcos apart — but NOTHING in your table actually forces ids to be unique. Tomorrow we fix that hole for good.",
};
