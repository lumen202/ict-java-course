// unit1-week2 · Day 5 — Prove it — assemble the week and face the final boss
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Prove it — assemble the week and face the final boss",
  warmupGame: {
    kind: "typing",
    id: "warmup-day5",
    title: "⌨️ Warm-up: the whole week, from memory",
    intro:
      "No video today, no new syntax — just proof. Ten commands covering everything week 2 taught: the careful verbs, the ritual, the seatbelt, the lock, the machine. If these flow out of your fingers without looking, the week is genuinely yours.",
    rounds: [
      {
        prompt: "Repair a value: move the student with id 3 to grade 10.",
        template: "{UPDATE students SET grade_level = 10 WHERE id = 3;}",
        explain: "Aim, then change. Monday's whole lesson in one line.",
      },
      {
        prompt: "The ritual, step 1: preview every row named 'test' — without touching it.",
        template: "{SELECT * FROM students WHERE name = 'test';}",
        explain: "Same WHERE you're about to delete with, harmless verb first.",
      },
      {
        prompt: "The ritual, step 2: now remove them.",
        template: "{DELETE FROM students WHERE name = 'test';}",
        explain: "Identical aim, heavier verb. The counts should agree — that's your receipt.",
      },
      {
        prompt: "The seatbelt, off — because you decided.",
        template: "{SET SQL_SAFE_UPDATES = 0;}",
        explain: "A deliberate act, never a reflex.",
      },
      {
        prompt: "And back on, when the dangerous work is done.",
        template: "{SET SQL_SAFE_UPDATES = 1;}",
        explain:
          "The half of the habit people forget. Seatbelt on is the resting state — especially now that your keyed WHEREs pass through it freely.",
      },
      {
        prompt: "Lock a table that already exists: give students its key.",
        template: "{ALTER TABLE students ADD PRIMARY KEY (id);}",
        explain: "Clean first, then this. The server checks both promises before agreeing.",
      },
      {
        prompt: "The flagship: create a visitors table with a self-numbering id and a name up to 50.",
        template: "{CREATE TABLE visitors ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) );}",
        explain: "How every table you make begins, from this week to the end of the course.",
      },
      {
        prompt: "The modern INSERT: add Liza, name only.",
        template: "{INSERT INTO visitors (name) VALUES ('Liza');}",
        explain: "Name what you provide; the machine provides identity.",
      },
      {
        prompt: "Move the machine: next visitor gets number 100.",
        template: "{ALTER TABLE visitors AUTO_INCREMENT = 100;}",
        explain: "Forward only — it never re-enters used numbers.",
      },
      {
        prompt: "Read a table's guarantees: where would you SEE the key and the machine?",
        template: "{DESCRIBE visitors;}",
        explain:
          "Null: NO, Key: PRI, Extra: auto_increment. Every table's promises, one command away. That's the week — all of it, from memory.",
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "order",
      id: "order-week2-file",
      title: "🧩 Puzzle: the week in the right order",
      intro:
        "Before you assemble your real week2.sql, assemble a model one. Each build only runs top to bottom in one order — the order the week itself taught you. Dependencies decide everything; find them.",
      rounds: [
        {
          prompt:
            "A week2.sql in miniature: header comment first, USE next, the repair before the lock, and the junk-removal comment directly above its DELETE.",
          lines: [
            "-- week2.sql — cleaning and keys",
            "USE school;",
            "UPDATE students SET name = 'Kristine' WHERE id = 5;",
            "-- Remove the junk row planted in testing",
            "DELETE FROM students WHERE name = 'test';",
            "ALTER TABLE students ADD PRIMARY KEY (id);",
          ],
          explain:
            "week2.sql opens with USE, not CREATE DATABASE — it continues week1.sql's story. Repairs and cleanup run before the ALTER, because the server refuses to lock dirty data. Comment above its statement, as always.",
        },
        {
          prompt:
            "The deliberate demolition, as a ceremony: seatbelt off, the one dangerous line, seatbelt back on.",
          lines: [
            "SET SQL_SAFE_UPDATES = 0;",
            "DELETE FROM practice_rows;",
            "SET SQL_SAFE_UPDATES = 1;",
          ],
          explain:
            "Off, act, on — the dangerous line lives in the smallest possible window. Leaving the seatbelt off 'because you'll need it later' is how accidents happen on the lines you DIDN'T plan.",
        },
        {
          prompt:
            "A table's whole modern life: born with the machine, fed by column-list, pruned by keyed aim, grown again — then the conclusion, written where a comment belongs: at the end, stating what you observed.",
          lines: [
            "CREATE TABLE visitors ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) );",
            "INSERT INTO visitors (name) VALUES ('Liza');",
            "DELETE FROM visitors WHERE id = 1;",
            "INSERT INTO visitors (name) VALUES ('Marco');",
            "-- Marco is id 2, not 1: numbers retire with their rows",
          ],
          explain:
            "Create, insert, delete, insert — and Marco proves the machine's law. A closing comment recording what you OBSERVED is the other legitimate place for a comment to live.",
        },
      ],
    },
    {
      kind: "quest",
      id: "teach-it-back",
      title: "🧠 Quest: teach it back",
      intro:
        "Week 1's rule still stands: you understand what you can explain to someone who doesn't know it. Four ideas from this week, your own words, no SQL keywords unless you explain them as you go.",
      missions: [
        {
          task: "Explain to someone who uses spreadsheets: the difference between changing a cell, deleting a row, and deleting the whole sheet — and which SQL verb is which.",
          check: {
            question: "Which mapping is right?",
            choices: [
              "Change a cell = UPDATE · delete a row = DELETE · delete the sheet = DROP",
              "Change a cell = DELETE · delete a row = DROP · delete the sheet = UPDATE",
              "They're all UPDATE with different options",
            ],
            answer: 0,
            explain:
              "Three verbs, three sizes of change. The spreadsheet picture keeps them straight — and highlights what SQL adds: the WHERE, the seatbelt, and no undo.",
          },
        },
        {
          task: "Explain the preview ritual to a friend about to delete rows for the first time — including WHY the counts matter.",
          check: {
            question: "The core of the ritual, in one sentence:",
            choices: [
              "Aim with a harmless SELECT first, fire the DELETE with the identical WHERE, and check both counts agree",
              "Type the DELETE quickly so you don't lose your nerve",
              "Always delete everything and re-insert what you wanted to keep",
            ],
            answer: 0,
            explain:
              "Same aim, escalating verbs, matching receipts. If your friend remembers only one thing from this week, make it this.",
          },
        },
        {
          task: "Explain a PRIMARY KEY to someone at home using a real-world identifier — an LRN, a plate number, a receipt number — including the two promises.",
          check: {
            question: "Why do those real-world numbers make good explanations?",
            choices: [
              "Each exists precisely so one thing can be told apart from every other — unique and never blank, enforced by an institution the way the server enforces a key",
              "They're all secretly stored in MySQL",
              "They don't — SQL keys are nothing like them",
            ],
            answer: 0,
            explain:
              "A key is society's oldest trick, adopted by databases: give the thing a number that means it and nothing else, and guard the number.",
          },
        },
        {
          task: "Explain why a ticket machine that never reuses numbers is TRUSTWORTHY, not wasteful — to someone bothered by the gaps.",
          check: {
            question: "The heart of that explanation:",
            choices: [
              "A number, once issued, may be written down anywhere — reuse would make every old copy quietly point at the wrong thing",
              "Reusing numbers wears them out",
              "Gaps make the table smaller",
            ],
            answer: 0,
            explain:
              "Identity has to be stable to be identity. The gap is the machine keeping an old promise to a row that no longer exists — which is exactly why you can trust its promises to the rows that do.",
          },
        },
        {
          task: "Final mission: pick the explanation you found hardest and deliver it OUT LOUD to an actual person at home (or a voice recording). Note where you stumbled.",
          input:
            "Paste your four explanations, and name the spot where saying it out loud was harder than thinking it",
        },
      ],
    },
    {
      kind: "quest",
      id: "assemble-file",
      title: "📦 Quest: assemble week2.sql",
      intro:
        "Four days of maintenance, cleanup, locks and machines — scattered across labs and Workbench tabs. Turn it into one file that reads top to bottom like the week's story. The reader, as always, is you in three weeks.",
      missions: [
        {
          task: "Open week2.sql. Check the skeleton: header comment, then USE school;, then a '-- Day N' section per day in order. Anything you did in a lab but never filed, rescue it from Workbench's history now.",
          check: {
            question: "week1.sql began with CREATE DATABASE. week2.sql begins with USE. Why the difference?",
            choices: [
              "week2.sql maintains a world that week1.sql already created — run in order, the two files replay the whole history",
              "CREATE DATABASE stops working after week 1",
              "USE is the newer command",
            ],
            answer: 0,
            explain:
              "Files build on files. Anyone (including future you) can rebuild everything from nothing: week1.sql, then week2.sql, top to bottom.",
          },
        },
        {
          task: "Order check inside the file: your UPDATE repairs and junk DELETEs must appear BEFORE the ALTER TABLE … ADD PRIMARY KEY line. If they don't, reorder until the file would actually run.",
          check: {
            question: "Why would the file break if the ALTER came before the repairs?",
            choices: [
              "The server refuses to lock a column that still contains duplicates or NULLs — the repairs are what make the lock possible",
              "ALTER statements must always be last in a file",
              "It wouldn't — order inside a file is cosmetic",
            ],
            answer: 0,
            explain:
              "You lived this on Wednesday: clean, then lock. A .sql file is a recipe, and this week's recipe has a load-bearing middle.",
          },
        },
        {
          task: "Comment pass: every UPDATE and DELETE gets a why-comment above it (the repair reason, the junk's origin), every preview SELECT sits above its DELETE, and your Day 4 ghost experiment ends with an observed-result comment.",
          check: {
            question: "For a DELETE, what does the comment above it preserve that the SQL cannot?",
            choices: [
              "Why those rows deserved to go — the rows themselves are gone, so the comment is the only surviving witness",
              "The exact time of deletion",
              "A backup of the deleted data",
            ],
            answer: 0,
            explain:
              "After a DELETE runs, the file's comment is the only place the story survives. That's why maintenance files need comments even more than building files did.",
          },
        },
        {
          task: "Read the whole file aloud, top to bottom, saying what each line does and why it's in that position. Fix anything you can't justify.",
          input:
            "Paste your file from the header through the ALTER TABLE … ADD PRIMARY KEY line, and write the number of statements the full file now contains",
        },
      ],
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own work",
      steps: [
        "Open week2.sql and your Workbench next to this page, and mark each line below ✅ or ❌ honestly.",
        "week2.sql exists, starts with a header comment and USE school;, and has a '-- Day N' section for each day.",
        "At least three UPDATEs that repaired real values, each with a why-comment and the rows-affected count I expected.",
        "My junk rows were deleted using the full ritual — a preview SELECT sits above each DELETE in the file.",
        "DESCRIBE students; shows id with Key: PRI and Null: NO on my real server.",
        "The repairs in my file come BEFORE the ADD PRIMARY KEY line, so the file would actually run.",
        "My own designed table exists with id INT PRIMARY KEY AUTO_INCREMENT and at least five rows, inserted with column-list INSERTs.",
        "My table shows a genuine gap in its ids from the ghost experiment, and I can say which row made it.",
        "Safe update mode is back ON in my session, and my keyed UPDATEs run fine with it on.",
        "Every UPDATE and DELETE in the file has a why-comment above it.",
        "For every ❌: fix it now. Everything you need is in this week's four days, and the day is yours.",
      ],
      tip: "Auditing your own work against a list before anyone else sees it is a professional habit — and this particular list is one you'll reuse: every table you ever build should pass lines 5 and 7.",
      submit:
        "Paste the checklist with your ✅ / ❌ marks, and note what you had to go back and fix.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week-two-warden",
    title: "⚔️ Final boss: The Week Two Warden",
    intro:
      "The Warden guards the gate to week 3 and asks about everything — Monday's repairs, Tuesday's demolitions, Wednesday's locks, Thursday's machine. Nothing here is new; all of it is yours. Take the gate.",
    boss: { name: "the Week Two Warden", emoji: "👑" },
    questions: [
      {
        prompt: "The four verbs — INSERT, SELECT, UPDATE, DELETE. Which two CHANGE rows that already exist?",
        choices: [
          "UPDATE (rewrites values) and DELETE (removes rows)",
          "INSERT and SELECT",
          "All four",
        ],
        answer: 0,
        explain:
          "The careful verbs. INSERT adds, SELECT reads — neither can damage what's there. UPDATE and DELETE can, which is why they got a whole week of safety habits.",
      },
      {
        prompt: "Every safe UPDATE and DELETE starts with the same decision. Which?",
        choices: [
          "The WHERE — who exactly is this aimed at?",
          "The table name",
          "Whether to use a semicolon",
        ],
        answer: 0,
        explain: "Aim before verb. Decide the WHERE, preview it with SELECT, and only then attach the dangerous word.",
      },
      {
        prompt: "'0 row(s) affected', green circle, no error. What happened?",
        choices: [
          "The statement was valid and the WHERE matched nobody — a quiet miss",
          "The change worked",
          "The table is locked",
        ],
        answer: 0,
        explain:
          "Both careful verbs miss silently. The rows-affected count is the only witness — reading it is a reflex now, not a tip.",
      },
      {
        prompt: "Safe update mode (Error 1175) blocks…",
        choices: [
          "UPDATEs and DELETEs whose WHERE can't guarantee its aim — like no WHERE at all, or a WHERE without a key column",
          "All UPDATEs, always",
          "Only DROP TABLE",
        ],
        answer: 0,
        explain:
          "One seatbelt, both verbs. And since Wednesday, your keyed WHEREs pass through it freely — the seatbelt only ever distrusted unguaranteed aims.",
      },
      {
        prompt: "DELETE FROM students; ran (seatbelt off). What survives?",
        choices: [
          "The table itself — columns, types, key — holding zero rows",
          "Nothing — the table is gone",
          "The rows, in a recycle bin",
        ],
        answer: 0,
        explain:
          "Empty, not gone. DROP TABLE is the one that erases the shape — and after it, even DESCRIBE errors.",
      },
      {
        prompt: "The preview ritual, complete:",
        choices: [
          "SELECT with the WHERE → check the rows and count → DELETE with the identical WHERE → check the counts agree",
          "DELETE → SELECT to see what's left → apologize",
          "Backup → DELETE → restore if wrong",
        ],
        answer: 0,
        explain:
          "Same aim, escalating verbs, matching receipts. It costs ten seconds and has saved careers.",
      },
      {
        prompt: "The two promises of a PRIMARY KEY:",
        choices: [
          "Every value unique, no value ever NULL — enforced by the server on every insert and update",
          "Fast queries and alphabetical order",
          "Rows can never be deleted",
        ],
        answer: 0,
        explain: "A true name for every row: one of a kind, never missing. The server is the enforcer, not your carefulness.",
      },
      {
        prompt: "Which error says the key's uniqueness promise just SAVED you?",
        choices: [
          "1062: Duplicate entry … for key … — the colliding row bounced off",
          "1046: No database selected",
          "1136: Column count doesn't match",
        ],
        answer: 0,
        explain:
          "1062 is the wall working. The refused row never gets in, and the message names the value that collided.",
      },
      {
        prompt: "ALTER TABLE students ADD PRIMARY KEY (id); on a table with two id-3 rows:",
        choices: [
          "Refused with 1062 — clean the duplicates first, then lock",
          "Works — the key deletes one of them",
          "Works — duplicates are grandfathered in",
        ],
        answer: 0,
        explain:
          "A key certifies existing data, never repairs it. Clean → lock is the permanent order — the server itself enforces it.",
      },
      {
        prompt: "Why does nearly every real table get an id column instead of using a 'natural' column as its key?",
        choices: [
          "Most real columns can repeat or go blank — a manufactured id is the only honest guarantee, and the server can even assign it",
          "ids make tables faster to type",
          "It's tradition with no reason",
        ],
        answer: 0,
        explain:
          "Names twin, prices repeat, dates collide. The judgement you exercised in choose-the-key generalizes: when the real world won't promise uniqueness, manufacture it.",
      },
      {
        prompt: "id INT PRIMARY KEY AUTO_INCREMENT — what does each part contribute?",
        choices: [
          "INT: whole numbers · PRIMARY KEY: unique and never NULL · AUTO_INCREMENT: the server assigns the next number itself",
          "Three synonyms for 'number column'",
          "INT is optional decoration",
        ],
        answer: 0,
        explain:
          "Type, promises, machine — the flagship line is three guarantees stacked on one column. It opens every table you'll create from now on.",
      },
      {
        prompt: "On an auto-id table, the professional INSERT looks like…",
        choices: [
          "INSERT INTO visitors (name) VALUES ('Liza'); — name your columns, let the machine number the row",
          "INSERT INTO visitors VALUES (17, 'Liza'); — pick a number you like",
          "INSERT id ONLY, add the name later",
        ],
        answer: 0,
        explain:
          "The column list is the contract: yours vs. the server's. Hand-picked ids are how Tuesday's duplicate-3 disaster happened in the first place.",
      },
      {
        prompt: "ids run 1, 2, 4, 7. A new row arrives. Its id?",
        choices: ["8", "3", "5"],
        answer: 0,
        explain:
          "Biggest ever issued plus one. Gaps are retired numbers — the machine never fills them, and that's a feature protecting every old reference in the world.",
      },
      {
        prompt: "This week in one sentence. Which is it?",
        choices: [
          "Learn the verbs that can destroy data, build the habits that aim them, then build the structure that makes the aim guaranteed",
          "Memorize four new commands",
          "Avoid UPDATE and DELETE because they're dangerous",
        ],
        answer: 0,
        explain:
          "Careful verbs → careful habits → structure that replaces vigilance. Week 3 stacks more structure on top: rules about what values columns accept, and keys that connect tables to each other. The gate is yours.",
      },
    ],
  },
  practice: {
    intro: "Last three things.",
    steps: [
      "Paste your complete week2.sql into the turn-in box below — every UPDATE, DELETE, ALTER and INSERT, with the comment above each.",
      "Work through the self-check further down the page, answering each out loud before revealing the answer.",
      "Send the two-minute reflection — it's how you get a plan back for next week.",
    ],
    note: "Done early? The SQLBolt lessons in the reading track cover this exact week in the browser — the best extra reps there are.",
  },
};
