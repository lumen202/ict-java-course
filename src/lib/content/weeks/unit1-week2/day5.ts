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
      "No video today, no new syntax — just proof. Thirteen statements covering everything week 2 taught, plus a few week 1 staples that deserve to stay sharp: the careful verbs, the ritual, the seatbelt, the lock, the machine. If these flow out of your fingers without looking, the week is genuinely yours.",
    rounds: [
      {
        prompt: "From week 1, still the very first line of the story: start the database this whole course lives in.",
        template: "{CREATE DATABASE school;}",
        explain: "You won't run this one again on your real server — it already exists — but the fingers should never forget it.",
      },
      {
        prompt: "Every session, every file: work inside it.",
        template: "{USE school;}",
        explain: "week2.sql opens with this line, not CREATE DATABASE — it continues week 1's story instead of starting over.",
      },
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
        prompt:
          "From week 1, still exactly how you'd answer it: every grade 9 student's name, alphabetically.",
        template: "{SELECT name FROM students WHERE grade_level = 9 ORDER BY name;}",
        explain:
          "Filter, then order — the shape doesn't age. Every UPDATE and DELETE this week aimed with the same WHERE you just typed here.",
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
      kind: "sql-console",
      id: "week2-gauntlet",
      title: "🖥️ The whole week, on data you've never seen",
      intro:
        "A different school, a different table, the same four skills. This is the week's real test: nothing here is the students table you practised on, so nothing can be answered from memory of last time — only from knowing what each verb actually does. The tasks deliberately jump between days rather than marching through them in order, because that's how these skills will arrive from now on.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "club_members",
                columns: [
                  { name: "id", type: "INT" },
                  { name: "name", type: "VARCHAR(50)" },
                  { name: "club", type: "VARCHAR(30)" },
                  { name: "year_level", type: "INT" },
                ],
                rows: [
                  ["1", "Liza", "Robotics", "8"],
                  ["2", "Marco", "Chess", "10"],
                  ["3", "Jen", "Robotics", "9"],
                  ["3", "Paolo", "Debate", "10"],
                  ["5", "test", "Chess", "9"],
                  [null, "Ana", "Debate", "9"],
                  ["7", "Kristine", "Chess", "8"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal: "Week 1 reflex first: look at what you're working with — every column, every row of club_members.",
          solution: "SELECT * FROM club_members;",
          hint: "SELECT * FROM club_members; — the star means all columns.",
          explain:
            "Seven rows, and already three problems if you look closely: two members share id 3, one has no id at all, and somebody called 'test' got left behind. You'll fix all three before the day is out — but not in that order.",
        },
        {
          goal: "Week 1 again, sharper: just the names of the Chess club members, alphabetically.",
          solution: "SELECT name FROM club_members WHERE club = 'Chess' ORDER BY name;",
          hint: "Three clauses after the SELECT: FROM, then WHERE, then ORDER BY.",
          explain:
            "Filter, then order. This shape hasn't changed since week 1 and won't change all course — and every UPDATE and DELETE you're about to aim uses the same WHERE.",
        },
        {
          goal: "Monday's verb: Paolo switched clubs — he's in Robotics now. Change only his row.",
          solution: "UPDATE club_members SET club = 'Robotics' WHERE name = 'Paolo';",
          hint: "UPDATE … SET … WHERE. Aim with something that identifies Paolo and nothing else.",
          explain:
            "One row affected. Aim, then change — and note you aimed by name, not by id, because id 3 would have hit two people at once.",
        },
        {
          goal: "Tuesday's ritual, step 1: before deleting anything, PREVIEW it. Show the junk row named 'test'.",
          solution: "SELECT * FROM club_members WHERE name = 'test';",
          hint: "Same WHERE you're about to delete with — but with the harmless verb.",
          explain:
            "One row, and you can see exactly what it is before it disappears. This step costs three seconds and is the only thing standing between you and deleting the wrong rows.",
        },
        {
          goal: "Tuesday's ritual, step 2: now remove it — the identical aim, the heavier verb.",
          solution: "DELETE FROM club_members WHERE name = 'test';",
          explain:
            "1 row affected — the same count the preview showed. When those two numbers agree, you did what you meant to do.",
        },
        {
          goal: "Now the wall. Try to empty the whole table — a DELETE with no WHERE at all.",
          solution: "DELETE FROM club_members;",
          predict: {
            question: "No WHERE, and the seatbelt is still on. What does the server do?",
            choices: [
              "Deletes all six remaining rows — you asked for it clearly",
              "An error — the statement is refused and nothing changes",
              "Asks you to confirm such a large deletion first",
            ],
            answer: 1,
            explain:
              "MySQL never asks 'are you sure?'. Safe update mode refuses the statement outright — that refusal IS the protection.",
          },
          explain:
            "Error 1175 — the seatbelt caught it, exactly as it did on Monday and Tuesday. Nothing was deleted, and you don't need the seatbelt off today.",
        },
        {
          goal: "Wednesday's arc begins. Try to lock the table as it stands: make id the primary key.",
          solution: "ALTER TABLE club_members ADD PRIMARY KEY (id);",
          predict: {
            question: "Two members still share id 3, and Ana still has no id at all. What happens?",
            choices: [
              "It works — the key is added and the bad rows are fixed automatically",
              "Error 1138 — it complains about Ana's missing id first",
              "Error 1062 — it refuses because id 3 is duplicated",
            ],
            answer: 2,
            explain:
              "The server checks uniqueness before it checks for NULLs, so the duplicate is what it names first. Both promises have to be true before the lock goes on.",
          },
          explain:
            "Error 1062: Duplicate entry '3'. The lock is a promise about data that already exists — the server won't make a promise the table is already breaking.",
        },
        {
          goal: "Investigate before you repair: show every row holding id 3, so you know who you're about to renumber.",
          solution: "SELECT * FROM club_members WHERE id = 3;",
          explain:
            "Jen and Paolo. Look before you edit — the same instinct as previewing a DELETE, applied to a repair.",
        },
        {
          goal: "Repair the duplicate: give Paolo id 4. (You can't aim by id — it's the very thing that's ambiguous.)",
          solution: "UPDATE club_members SET id = 4 WHERE name = 'Paolo';",
          hint: "Aim with the name, set the id.",
          explain:
            "This is why Monday came before Wednesday: repairing data is what makes locking it possible.",
        },
        {
          goal: "Try the lock again.",
          solution: "ALTER TABLE club_members ADD PRIMARY KEY (id);",
          predict: {
            question: "The duplicate is gone, but Ana's id is still NULL. What now?",
            choices: [
              "Error 1138 — a key can never be missing, so the NULL is refused",
              "It works — NULL is allowed in a primary key as long as only one row has it",
              "Error 1062 again — the duplicate check simply runs a second time",
            ],
            answer: 0,
            explain:
              "One promise satisfied, the second one now checked: every value unique AND no value ever missing. Both, or no key.",
          },
          explain:
            "Error 1138: Invalid use of NULL value. The second promise gets its turn once the first is satisfied.",
        },
        {
          goal: "Give Ana the number 6, then lock the table for real — both statements, in the only order that works.",
          solution:
            "UPDATE club_members SET id = 6 WHERE name = 'Ana'; ALTER TABLE club_members ADD PRIMARY KEY (id);",
          hint: "Repair first, then lock. Two statements, each ending in a semicolon.",
          explain:
            "Clean, then lock — Wednesday's whole lesson in two lines. The table now guarantees every member has an id and no two share one.",
        },
        {
          goal: "Prove the guarantee is live: try to add a new member using id 6, the number Ana now holds.",
          solution: "INSERT INTO club_members VALUES (6, 'Ramon', 'Chess', 9);",
          predict: {
            question: "The key is on and id 6 is taken. What does the server do with this row?",
            choices: [
              "Accepts it — INSERT doesn't check the primary key, only ALTER does",
              "Accepts it, quietly renumbering Ramon to the next free id",
              "Error 1062 — refused, because the promise is now enforced on every write",
            ],
            answer: 2,
            explain:
              "A key isn't a one-time check. It guards every INSERT and UPDATE from the moment it exists.",
          },
          explain:
            "Refused. The table can now defend itself — which is the entire reason Wednesday existed.",
        },
        {
          goal: "Thursday's verb, on a fresh table: build club_log with a self-numbering id (whole numbers, the machine picks them) and a note up to 40 characters.",
          solution: "CREATE TABLE club_log ( id INT PRIMARY KEY AUTO_INCREMENT, note VARCHAR(40) );",
          hint: "The flagship line: id INT PRIMARY KEY AUTO_INCREMENT — column, constraint, machine.",
          explain:
            "How every table you build from here on begins. You stop typing ids by hand, and the server stops trusting you to get them right.",
        },
        {
          goal: "Add the first entry the modern way — provide only the note: 'Roster cleaned and locked'.",
          solution: "INSERT INTO club_log (note) VALUES ('Roster cleaned and locked');",
          hint: "Name what you're providing in brackets after the table name; the machine provides the rest.",
          explain:
            "Id 1, chosen by the server. You named the column you had a value for and stayed silent about the one you didn't.",
        },
        {
          goal: "Now the classic stumble: add another entry the OLD way, with no column list — just VALUES ('Ramon refused by the key').",
          solution: "INSERT INTO club_log VALUES ('Ramon refused by the key');",
          predict: {
            question:
              "The table has two columns; you're supplying one value and no column list. What comes back?",
            choices: [
              "It works — the machine fills the id and your value goes in the note",
              "Error 1136 — column count doesn't match value count",
              "It works, but your text lands in the id column",
            ],
            answer: 1,
            explain:
              "With no column list you're promising a value for EVERY column, including the one the machine owns. Two columns, one value — the counts disagree and MySQL says so.",
          },
          explain:
            "Error 1136. AUTO_INCREMENT doesn't change how INSERT counts — it changes which columns you should name. Once a table has a machine in it, always use the column list.",
        },
        {
          goal: "Fix your own error: put that same note in properly.",
          solution: "INSERT INTO club_log (note) VALUES ('Ramon refused by the key');",
          explain:
            "Id 2 — the machine kept counting. Reading the error and correcting it is the actual skill; nobody writes it right every time.",
        },
        {
          goal: "No help from here. The Robotics club wants its roster: every Robotics member's name and year level, highest year level first.",
          solution:
            "SELECT name, year_level FROM club_members WHERE club = 'Robotics' ORDER BY year_level DESC;",
          explain:
            "Three of week 1's clauses working together on a table you repaired yourself — including Paolo, the member you moved on Monday.",
        },
        {
          goal: "Last one, entirely your own: the adviser wants the Chess club listed with the lowest year level first. Answer it.",
          solution: "SELECT * FROM club_members WHERE club = 'Chess' ORDER BY year_level;",
          explain:
            "You started this console with a table full of contradictions and finished able to ask it anything. Every verb of week 2 ran at least once — on data you had never seen before today.",
        },
      ],
    },
    {
      kind: "order",
      id: "order-week2-file",
      title: "🧩 Puzzle: the week in the right order",
      intro:
        "Before you assemble your real week2.sql, assemble a model one. Each build only runs top to bottom in one order — the order the week itself taught you. Dependencies decide everything; find them.",
      rounds: [
        {
          prompt:
            "A week2.sql in miniature: header comment first, USE next, then the repair UPDATE, then the junk-removal comment directly above its DELETE, then the lock last. One line in the pile does not belong in a repair file at all — leave it out.",
          lines: [
            "-- week2.sql — cleaning and keys",
            "USE school;",
            "UPDATE students SET name = 'Kristine' WHERE id = 5;",
            "-- Remove the junk row planted in testing",
            "DELETE FROM students WHERE name = 'test';",
            "ALTER TABLE students ADD PRIMARY KEY (id);",
          ],
          distractors: ["DROP TABLE students;"],
          explain:
            "week2.sql opens with USE, not CREATE DATABASE — it continues week1.sql's story. Repairs and cleanup run before the ALTER, because the server refuses to lock dirty data. The DROP TABLE had to stay out: this file is about maintaining students, not erasing it — a repair file that drops its own patient isn't a repair file. Comment above its statement, as always.",
        },
        {
          prompt:
            "The deliberate demolition, as a ceremony: seatbelt off, the one dangerous line, seatbelt back on. One line in the pile is a second catastrophe that doesn't belong in this ceremony at all — leave it out.",
          lines: [
            "SET SQL_SAFE_UPDATES = 0;",
            "DELETE FROM practice_rows;",
            "SET SQL_SAFE_UPDATES = 1;",
          ],
          distractors: ["UPDATE students SET grade_level = 7;"],
          explain:
            "Off, act, on — the dangerous line lives in the smallest possible window. The UPDATE had to stay out: it aims at students, not practice_rows, and it carries no WHERE at all — exactly the no-WHERE disaster Monday's mini server let you feel on purpose. A ceremony built to contain ONE dangerous line is not the place to smuggle in a second, unrelated one.",
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
            question:
              "Your listener asks: 'If DELETE removes a row, why isn't DROP just a bigger DELETE?' What's the accurate answer?",
            choices: [
              "DELETE removes rows but leaves the table's shape — its columns and types — standing; DROP removes the shape itself, so a dropped table has nothing left to even query",
              "They differ only in speed — DROP is a bulk-optimized version of DELETE for removing many rows at once",
              "DROP only works once a table is already empty, so a full DELETE has to run first",
            ],
            answer: 0,
            explain:
              "DROP isn't 'DELETE, but all the rows' — DELETE FROM students; still leaves a students table with zero rows, columns and types intact. DROP TABLE students; leaves nothing: no shape, no name, nothing DESCRIBE could even ask about. Different targets, not different sizes.",
          },
        },
        {
          task: "Explain the preview ritual to a friend about to delete rows for the first time — including WHY the counts matter.",
          check: {
            question:
              "Your friend previews with a SELECT and gets 3 rows back, then runs the DELETE with the exact same WHERE and it reports '1 row(s) affected'. What does that mismatch mean?",
            choices: [
              "Nothing to worry about — SELECT and DELETE are allowed to count rows differently",
              "The DELETE silently only removes the first matching row unless you add LIMIT",
              "Something changed the data between the SELECT and the DELETE — a mismatched count means stop and look again with a fresh SELECT before doing anything else",
            ],
            answer: 2,
            explain:
              "SELECT and DELETE count the exact same way — the only honest explanation for a mismatch is that the table itself changed in between (another session, a forgotten earlier statement). The ritual's whole point is that the two counts should always agree; when they don't, that disagreement is the finding, not a technicality to wave away.",
          },
        },
        {
          task: "Explain a PRIMARY KEY to someone at home using a real-world identifier — an LRN, a plate number, a receipt number — including the two promises.",
          check: {
            question:
              "Your listener says: 'My sister and I share a last name, so families basically already use surnames as an ID at home — isn't that a primary key?' What's the accurate reply?",
            choices: [
              "Yes — any label people commonly use to tell each other apart counts as a key",
              "No — a surname can repeat across totally unrelated people and can be missing entirely (no last name on record), while a real key like an LRN is manufactured specifically so it can never repeat and never be blank",
              "No — primary keys must always be numbers, and a surname is text, so it's disqualified on format alone",
            ],
            answer: 1,
            explain:
              "The disqualifying fact isn't the datatype — VARCHAR columns can be primary keys. It's that a surname makes no uniqueness promise at all: two unrelated Santos families exist, and someone can have no surname on file. A key isn't 'a label people use' — it's a label an institution GUARANTEES is one-of-a-kind and never absent.",
          },
        },
        {
          task: "Explain why a ticket machine that never reuses numbers is TRUSTWORTHY, not wasteful — to someone bothered by the gaps.",
          check: {
            question:
              "Your listener suggests: 'Just hand out retired numbers again once the row is deleted — nobody's using ticket 7 anymore.' What's actually wrong with that plan?",
            choices: [
              "It works fine — the number is free to reuse the moment its row is deleted",
              "It would only make the table slightly slower to search, nothing more",
              "Any old reference to that number — a printed receipt, a note, another table's row — would suddenly point at a completely different ticket the moment it's reused, silently breaking every promise ever made with it",
            ],
            answer: 2,
            explain:
              "The danger isn't inside the database — it's everywhere the number already escaped to. A parent who wrote down 'ticket 7' last week has no way to know the machine handed 7 to someone new. A gap is the cost of a promise that stays kept forever; reuse is a promise quietly broken.",
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
      kind: "upload",
      id: "export-week2-db",
      title: "📤 Export the whole week and hand it in",
      intro:
        "Last one for the unit. Both your tables, locked with real keys and counting themselves — export the database as it stands at the end of week 2 and hand it in. This is the state everything in unit 2 will build on.",
      steps: [
        "In MySQL Workbench: Server → Data Export.",
        "Tick the `school` schema and every table inside it — `students` and the table you designed.",
        'Choose "Export to Self-Contained File", name it `week2-final-<yourname>.sql`.',
        'Keep "Include Create Schema" ticked, then Start Export and wait for the green tick.',
        "Upload the file below.",
      ],
      proves:
        "the week's work on YOUR data: `students` carrying the column you invented in week 1, your own designed table beside it, and a real `PRIMARY KEY` plus `AUTO_INCREMENT` on the id columns. The AUTO_INCREMENT number in the file is your own row count — nobody else's will match.",
      screenshotFallback:
        "Still fighting the export? Upload a screenshot of the SCHEMAS panel with both your tables expanded, plus a SELECT * from each, and say so in today's turn-in box. Bring the export problem to class — you'll want it working before unit 2.",
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own work",
      steps: [
        "Open week2.sql and your Workbench next to this page, and mark each line below ✅ or ❌ honestly.",
        "The file's first three lines, in order, are: a header comment, USE school;, and a '-- Day 1' comment — and every later day has its own '-- Day N' comment before its statements.",
        "I can point to at least three UPDATE lines that repaired real typos or values, each with a why-comment directly above it, and I still remember the rows-affected number each one reported.",
        "Every DELETE in the file has a SELECT with the identical WHERE sitting directly above it — I can point to each preview-then-delete pair, not just recall that I did one somewhere.",
        "Running DESCRIBE students; right now on my real server shows id with Key: PRI and Null: NO — checked live, not remembered.",
        "Scanning the file top to bottom, every UPDATE and DELETE line appears BEFORE the ALTER TABLE … ADD PRIMARY KEY line, with none after it.",
        "My own designed table's CREATE TABLE line reads id INT PRIMARY KEY AUTO_INCREMENT, and I can count at least five INSERT INTO … (column, list) VALUES lines under it.",
        "Running SELECT * FROM my table; shows a genuine gap in the id numbers, and I can name the exact DELETE line in the file that made that gap.",
        "Running SELECT @@SQL_SAFE_UPDATES; (or just trying a keyed UPDATE) right now shows safe mode is back on, and the UPDATE runs with no 1175 error.",
        "I picked three UPDATE or DELETE lines in the file at random — not the ones I remember best — and each one still has a why-comment directly above it.",
        "For every ❌: fix it now. Everything you need is in this week's four days, and the day is yours.",
      ],
      tip: "Auditing your own work against a list before anyone else sees it is a professional habit — and this particular list is one you'll reuse: every table you ever build should pass lines 5 and 7.",
      submit:
        "Paste the checklist with your ✅ / ❌ marks, and note what you had to go back and fix.",
    },
    {
      kind: "quest",
      id: "data-story",
      optional: true,
      title: "🏔️ Challenge: a data story of your own",
      intro:
        "One more table, and this time nobody hands you the columns. Pick something about your own life this week — games played, chores done, money spent, anything you actually tracked or could — and build it the professional way: a real id, real questions, real queries.",
      missions: [
        {
          task: "Pick your topic and write down three real questions about it that a query could answer — not 'show everything', but something specific: a total, a filter, an order. ('Which day did I play the most?' not 'what did I play?')",
          input: "Write your topic and your three questions",
        },
        {
          task: "In your real Workbench, CREATE the table the professional way: id INT PRIMARY KEY AUTO_INCREMENT first, then at least three columns that hold what your questions need.",
          check: {
            question:
              "Your first question needs to know WHICH DAY something happened. Which column choice actually supports that later?",
            choices: [
              "A DATE column — the day is data your WHERE and ORDER BY can act on",
              "Leave it out — you can always remember the day without a column for it",
              "Put the day inside the name column, like 'Chess (Monday)'",
            ],
            answer: 0,
            explain:
              "If a question needs it, it needs its own column and the right type — a date baked into a text column can't be sorted or filtered as a date. Design the columns AFTER you know the questions, not before.",
          },
        },
        {
          task: "Fill it with honest data — at least six rows, inserted the professional way (a column-list INSERT naming every column but id). Then write and run the three queries that answer your three questions.",
          input: "Paste your CREATE TABLE, your INSERTs, and your three queries",
        },
        {
          task: "Read your three results and answer your own questions in plain words, like you're telling a friend what the week actually looked like. Add the whole thing to week2.sql under a '-- Data story' comment.",
          input:
            "Paste the answers to your three questions in plain words, and one thing a result told you that you didn't expect",
        },
      ],
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
          "INSERT and SELECT",
          "UPDATE (rewrites values) and DELETE (removes rows)",
          "All four — every one of them changes something about the table, even SELECT changes what you currently see",
        ],
        answer: 1,
        explain:
          "The careful verbs. INSERT adds, SELECT reads — neither can damage what's there, and looking at data isn't the same as changing it. UPDATE and DELETE can damage existing rows, which is why they got a whole week of safety habits.",
      },
      {
        prompt: "Every safe UPDATE and DELETE starts with the same decision. Which?",
        choices: [
          "The table name — you have to know where you're working before anything else",
          "Whether to use a semicolon — nothing runs without one",
          "The WHERE — who exactly is this aimed at?",
        ],
        answer: 2,
        explain: "Aim before verb. Decide the WHERE, preview it with SELECT, and only then attach the dangerous word.",
      },
      {
        prompt: "'0 row(s) affected', green circle, no error. What happened?",
        choices: [
          "The statement was valid and the WHERE matched nobody — a quiet miss",
          "The change worked, but MySQL only reports a count when rows are actually touched",
          "MySQL is waiting for you to confirm before it actually applies the change",
        ],
        answer: 0,
        explain:
          "Both careful verbs miss silently, and MySQL never waits for confirmation on anything — the count is printed every single time, including when it's zero. The rows-affected count is the only witness — reading it is a reflex now, not a tip.",
      },
      {
        prompt: "Safe update mode (Error 1175) blocks…",
        choices: [
          "All UPDATEs, always — safe mode refuses to run any UPDATE or DELETE at all",
          "UPDATEs and DELETEs whose WHERE can't guarantee its aim — like no WHERE at all, or a WHERE without a key column",
          "Only DROP TABLE and other statements that change a table's structure",
        ],
        answer: 1,
        explain:
          "One seatbelt, both verbs — but a keyed WHERE passes through it freely, so it never blocks every UPDATE, and DROP was never its job to begin with. The seatbelt only ever distrusted unguaranteed aims.",
      },
      {
        prompt: "DELETE FROM students; ran (seatbelt off). What survives?",
        choices: [
          "Nothing — the table is gone, same as if you'd dropped it",
          "The rows, sitting in a recycle bin you can restore from",
          "The table itself — columns, types, key — holding zero rows",
        ],
        answer: 2,
        explain:
          "Empty, not gone, and MySQL keeps no recycle bin. DROP TABLE is the one that erases the shape — and after it, even DESCRIBE errors.",
      },
      {
        prompt: "The preview ritual, complete:",
        choices: [
          "SELECT with the WHERE → check the rows and count → DELETE with the identical WHERE → check the counts agree",
          "DELETE first, then SELECT afterward to see what's left, in case you need to explain it",
          "Back up the whole table before every DELETE, and restore it if the count looks wrong",
        ],
        answer: 0,
        explain:
          "Same aim, escalating verbs, matching receipts — checking after the DELETE is too late, and a full backup before every delete is overkill this week never asked for. It costs ten seconds and has saved careers.",
      },
      {
        prompt: "The two promises of a PRIMARY KEY:",
        choices: [
          "Fast queries and alphabetical order — a side effect of having a key",
          "Every value unique, no value ever NULL — enforced by the server on every insert and update",
          "Rows can never be deleted once they hold a primary key value",
        ],
        answer: 1,
        explain: "A true name for every row: one of a kind, never missing. The server is the enforcer, not your carefulness — and a keyed row can still be deleted, it just can't be duplicated or left blank.",
      },
      {
        prompt: "Which error says the key's uniqueness promise just SAVED you?",
        choices: [
          "1046: No database selected — you forgot to USE first",
          "1136: Column count doesn't match — the VALUES list didn't match the columns",
          "1062: Duplicate entry … for key … — the colliding row bounced off",
        ],
        answer: 2,
        explain:
          "1062 is the wall working. The refused row never gets in, and the message names the value that collided — 1046 and 1136 are real errors too, but neither one is the key doing its job.",
      },
      {
        prompt: "ALTER TABLE students ADD PRIMARY KEY (id); on a table with two id-3 rows:",
        choices: [
          "Refused with 1062 — clean the duplicates first, then lock",
          "Works — the ALTER keeps the first matching row and quietly deletes the rest",
          "Works — the duplicate rows are grandfathered in as an exception",
        ],
        answer: 0,
        explain:
          "A key certifies existing data, never repairs it — it doesn't pick a survivor and delete for you, and it doesn't make exceptions once it's on. Clean → lock is the permanent order — the server itself enforces it.",
      },
      {
        prompt: "Why does nearly every real table get an id column instead of using a 'natural' column as its key?",
        choices: [
          "Because SQL requires every table to have a column literally named id",
          "Most real columns can repeat or go blank — a manufactured id is the only honest guarantee, and the server can even assign it",
          "Because natural columns like name are usually unique enough in practice",
        ],
        answer: 1,
        explain:
          "There's no such requirement — column names are your choice, and 'usually unique' is exactly the gap that bit Monday's duplicate-3 disaster. Names twin, prices repeat, dates collide. When the real world won't promise uniqueness, manufacture it.",
      },
      {
        prompt: "id INT PRIMARY KEY AUTO_INCREMENT — what does each part contribute?",
        choices: [
          "Three synonyms that all mean the same thing: 'number column'",
          "INT is optional decoration — PRIMARY KEY AUTO_INCREMENT alone would do the same job",
          "INT: whole numbers · PRIMARY KEY: unique and never NULL · AUTO_INCREMENT: the server assigns the next number itself",
        ],
        answer: 2,
        explain:
          "Type, promises, machine — three DIFFERENT guarantees stacked on one column, and INT is the type declaration the other two sit on top of, not decoration. It opens every table you'll create from now on.",
      },
      {
        prompt: "On an auto-id table, the professional INSERT looks like…",
        choices: [
          "INSERT INTO visitors (name) VALUES ('Liza'); — name your columns, let the machine number the row",
          "INSERT INTO visitors VALUES (17, 'Liza'); — pick a number you like, the server renumbers on collision",
          "INSERT INTO visitors (id) VALUES (DEFAULT); — insert the id alone, add the name in a follow-up UPDATE",
        ],
        answer: 0,
        explain:
          "The column list is the contract: yours vs. the server's. Hand-picked ids are how Tuesday's duplicate-3 disaster happened in the first place — the server doesn't renumber around a collision, it just refuses it.",
      },
      {
        prompt: "ids run 1, 2, 4, 7. A new row arrives. Its id?",
        choices: ["3", "8", "5"],
        answer: 1,
        explain:
          "Biggest ever issued plus one. Gaps are retired numbers — the machine never fills them, and that's a feature protecting every old reference in the world, not a hole waiting to be patched.",
      },
      {
        prompt: "This week in one sentence. Which is it?",
        choices: [
          "Memorize four new commands and their exact syntax",
          "Avoid UPDATE and DELETE entirely — they're too dangerous to use casually",
          "Learn the verbs that can destroy data, build the habits that aim them, then build the structure that makes the aim guaranteed",
        ],
        answer: 2,
        explain:
          "Careful verbs → careful habits → structure that replaces vigilance — avoidance was never the lesson; aiming well was. Week 3 stacks more structure on top: rules about what values columns accept, and keys that connect tables to each other. The gate is yours.",
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
    note: "Done early? The data-story challenge step above is an open ceiling — a table about your own week, built the professional way, your own questions answered. The SQLBolt lessons in the reading track are good extra reps too, if you'd rather stay in the browser.",
  },
};
