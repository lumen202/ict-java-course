// unit1-week2 · Day 3 — Give every row a true name with PRIMARY KEY
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.
//
// Reworked to the pacing-redesign pattern (see day1.ts, the template, and
// docs/agent/log/2026-08-16-pacing-research-and-day-redesign-plan.md):
// faded console hints, compose-from-scratch tasks whose goal is a question,
// predict-before-run on surprising outcomes, plausible MCQ distractors with
// varied answer positions, and an optional challenge tier after the real lab.

import type { DayPlan } from "../../types";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "Give every row a true name with PRIMARY KEY",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup-day3",
    title: "🕹️ Warm-up game: the twins problem",
    intro:
      "This table was kept by hand, and it shows: two students share a name, two rows share an id, and one id is missing entirely. Yesterday you aimed DELETEs; today, try to aim at ONE row in this mess and watch every aim fail. By the end of the morning you'll know exactly what a PRIMARY KEY promises — because you'll have felt what its absence costs.",
    tableName: "students",
    columns: ["id", "name", "grade_level", "favorite_subject"],
    rows: [
      ["1", "Liza", "8", "Math"],
      ["2", "Jen", "10", "Science"],
      ["3", "Jen", "9", "Math"],
      ["3", "Paolo", "7", "English"],
      ["NULL", "Ana", "9", "Math"],
      ["6", "Ramon", "9", "PE"],
    ],
    rounds: [
      {
        question:
          "You want to update the younger Jen's subject. Click every row that WHERE name = 'Jen' actually hits.",
        matches: [1, 2],
        sql: "UPDATE students SET favorite_subject = 'Art'\nWHERE name = 'Jen';\n-- 2 row(s) affected — both Jens changed!",
        explain:
          "Two Jens, one WHERE, two casualties. A name can't aim at one person because nothing stops two people sharing it. This is the twins problem.",
      },
      {
        question: "Fine — aim with the id instead. Click every row that WHERE id = 3 hits.",
        matches: [2, 3],
        sql: "SELECT * FROM students WHERE id = 3;\n-- 2 rows: Jen AND Paolo?!",
        explain:
          "Still two! These ids were typed by hand, and someone reused 3. An id column only solves the twins problem if something FORCES it to be unique — and right now, nothing does.",
      },
      {
        question: "Ana's id was never filled in. Click every row that WHERE id = 5 finds.",
        matches: [],
        sql: "SELECT * FROM students WHERE id = 5;\n-- 0 rows. Ana is unreachable by id.",
        explain:
          "Ana exists but has no number — no WHERE id can ever reach her. An identifier that can be missing isn't an identifier at all.",
      },
      {
        question:
          "A PRIMARY KEY makes two promises about a column: every value unique, no value missing. Click every row that BREAKS one of those promises.",
        matches: [2, 3, 4],
        sql: "-- The fix, coming this morning:\nALTER TABLE students ADD PRIMARY KEY (id);\n-- (after cleaning these three rows up)",
        explain:
          "The two id-3 rows break 'unique'; Ana's NULL breaks 'never missing'. A PRIMARY KEY is the server itself enforcing both promises on every insert and update, forever.",
      },
      {
        question: "Now feel the difference: click the ONE row that WHERE id = 1 identifies.",
        matches: [0],
        sql: "SELECT * FROM students WHERE id = 1;\n-- exactly one row. always. guaranteed.",
        explain:
          "One id, one row, no doubt. With a PRIMARY KEY, every WHERE id feels like this — a true name that means one row and nothing else. That's what you're building today.",
      },
    ],
  },
  videos: [
    {
      title: "PRIMARY KEYS are easy",
      youtubeId: "620DzFVz41o",
      length: "5:25",
      practice: {
        intro:
          "Type along in your own Workbench, in a sandbox database. Then, after the video:",
        steps: [
          "Insert two rows with the SAME id into your practice table.",
          "Read Error 1062 out loud, twice — that message is the sound of a promise being kept.",
        ],
        note: "The video's table uses a DECIMAL column — fine in real Workbench; just know the mini servers on this page only speak INT, VARCHAR and DATE.",
      },
    },
  ],
  activities: [
    {
      kind: "typing",
      id: "typing-pk",
      title: "⌨️ Type the promises",
      intro:
        "Two ways to declare a key: at birth (inside CREATE TABLE) and later in life (ALTER TABLE on a table that already exists). Your fingers need both.",
      rounds: [
        {
          prompt: "Create a teachers table whose id is the key, plus a name column of text up to 50.",
          template: "CREATE TABLE teachers ( id INT {PRIMARY KEY}, name VARCHAR(50) );",
          explain:
            "PRIMARY KEY rides right on the column definition — two words that turn an ordinary INT into a true name.",
        },
        {
          prompt: "Same table, but finish the name column yourself this time.",
          template: "CREATE TABLE teachers ( id INT PRIMARY KEY, name {VARCHAR(50)} );",
          explain:
            "The key column is still just a column — the other columns around it don't change at all.",
        },
        {
          prompt: "Your students table already exists and already has data. Give its id column the key — later in life.",
          template: "ALTER TABLE students {ADD PRIMARY KEY} (id);",
          explain:
            "ALTER TABLE changes a live table. ADD PRIMARY KEY makes the two promises retroactive — which is why the data has to be clean FIRST.",
        },
        {
          prompt: "Check where the key shows up in a table's shape.",
          template: "{DESCRIBE} students;",
          explain:
            "Look at the Key column of the result: PRI marks the primary key, and its Null column says NO. The promises, printed in the shape.",
        },
        {
          prompt: "From memory: create a table called books with a keyed id and a title of text up to 100.",
          template: "{CREATE TABLE books ( id INT PRIMARY KEY, title VARCHAR(100) );}",
          explain: "The at-birth version, from your own fingers. This is how every table you make from now on begins.",
        },
        {
          prompt: "From memory: give an existing table called games a primary key on its id column.",
          template: "{ALTER TABLE games ADD PRIMARY KEY (id);}",
          explain:
            "The later-in-life version. You'll run exactly this on your real students table before the day ends.",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "pk-console",
      title: "🖥️ Mini server: the locksmith",
      intro:
        "Three jobs today. First, build a fresh table WITH a key and watch it refuse bad rows all by itself. Then the real work: this server holds the messy hand-kept table from your warm-up — duplicate id, missing id and all — and you are going to clean it and lock it. The server will refuse the lock until the data deserves it. Twice. Then, once it's locked, the school year keeps moving and nobody hands you the next statement — you compose it yourself.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "students",
                columns: [
                  { name: "id", type: "INT" },
                  { name: "name", type: "VARCHAR(50)" },
                  { name: "grade_level", type: "INT" },
                ],
                rows: [
                  ["1", "Liza", "8"],
                  ["2", "Marco", "10"],
                  ["3", "Jen", "9"],
                  ["3", "Paolo", "7"],
                  [null, "Ana", "9"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal: "Build a table born with a key: teachers, with id (whole numbers, PRIMARY KEY) and name (text up to 50).",
          solution: "CREATE TABLE teachers ( id INT PRIMARY KEY, name VARCHAR(50) );",
          hint: "CREATE TABLE teachers ( id INT PRIMARY KEY, name VARCHAR(50) );",
          explain:
            "Done — and from this moment the server itself guards that id column. You're about to watch it work.",
        },
        {
          goal: "Look at the shape: describe teachers and find the key in the result.",
          solution: "DESCRIBE teachers;",
          hint: "DESCRIBE teachers;",
          explain:
            "id says Null: NO and Key: PRI. The promises aren't in your head or your file — they're part of the table itself now.",
        },
        {
          goal: "Add two teachers in one statement: id 1 'Reyes' and id 2 'Cruz'.",
          solution: "INSERT INTO teachers VALUES (1, 'Reyes'), (2, 'Cruz');",
          hint: "One INSERT, two bracketed groups — week-1 muscles.",
          explain: "2 rows in, both with fresh ids. The lock lets honest rows straight through.",
        },
        {
          goal: "Now attack the lock: try to insert ANOTHER teacher with id 1.",
          solution: "INSERT INTO teachers VALUES (1, 'Copycat');",
          predict: {
            question: "Reyes already has id 1. What happens when you try to insert a second teacher with id 1?",
            choices: [
              "Error 1062: the row is refused — a PRIMARY KEY can't hold two rows with id 1.",
              "It's accepted — VALUES doesn't check against existing rows, only column types.",
              "It replaces Reyes's row with Copycat's data, since they share an id.",
            ],
            answer: 0,
            explain:
              "MySQL never overwrites on INSERT and never skips its own promise just because the row looks fine otherwise — the whole row bounces.",
          },
          explain:
            "Error 1062: Duplicate entry '1' for key 'teachers.PRIMARY'. The row bounced — the table still has two teachers. THIS is the promise: not a guideline, a wall. Read that message carefully; it names the duplicate value and the key that refused it.",
        },
        {
          goal: "Attack it differently: try to insert a teacher with NULL as the id.",
          solution: "INSERT INTO teachers VALUES (NULL, 'Ghost');",
          predict: {
            question: "id is the primary key on this table. What happens when you insert a row with id set to NULL?",
            choices: [
              "It's accepted — NULL just means 'not decided yet', and keys allow exactly one NULL.",
              "Error 1048: Column 'id' cannot be null — a key can never be missing.",
              "MySQL invents the next free id automatically instead of using NULL.",
            ],
            answer: 1,
            explain:
              "Auto-numbering is a real feature — you'll meet it tomorrow — but it's opt-in. Without it, a NULL into a key column is just refused.",
          },
          explain:
            "Error 1048: Column 'id' cannot be null. The second promise — a key can never be missing, so no row can ever become unreachable like Ana. Two attacks, two refusals, zero bad rows.",
        },
        {
          goal: "Now the messy table. Try to lock it as-is: add a primary key on students.id.",
          solution: "ALTER TABLE students ADD PRIMARY KEY (id);",
          predict: {
            question: "students still has two rows with id 3. What happens when you try to lock it?",
            choices: [
              "The ALTER succeeds, and MySQL silently renumbers one of the duplicate rows.",
              "Error 1062: the ALTER is refused — the existing duplicate breaks the promise before the key even starts.",
              "The ALTER succeeds, but future INSERTs will still be allowed to duplicate id 3.",
            ],
            answer: 1,
            explain:
              "MySQL never silently renumbers your data, and a key that let its own value duplicate wouldn't be a promise at all.",
          },
          explain:
            "Error 1062: Duplicate entry '3'. The server won't promise uniqueness over data that already breaks it — and it even tells you WHICH value is the problem. The lock is refused until the mess is fixed. So: find the mess.",
        },
        {
          goal: "Investigate the duplicate: show every row with id 3.",
          solution: "SELECT * FROM students WHERE id = 3;",
          hint: "Aim the WHERE at the value that's causing the trouble.",
          explain:
            "Jen AND Paolo, sharing one id — your warm-up, live. Someone must move. Paolo gets the free id 4.",
        },
        {
          goal: "Fix the duplicate: change PAOLO's id to 4. (Careful — you can't aim by id here. What does only Paolo have?)",
          solution: "UPDATE students SET id = 4 WHERE name = 'Paolo';",
          hint: "Only one column is safe to aim at right now — think about what only Paolo has.",
          explain:
            "1 row affected. Notice the irony: to repair the id column you had to aim with a name — and that only worked because Paolo has no twin. On a keyed table you'll never depend on luck again.",
        },
        {
          goal: "Try the lock again.",
          solution: "ALTER TABLE students ADD PRIMARY KEY (id);",
          predict: {
            question: "The duplicate id is fixed, but Ana's row still has id = NULL. What happens this time?",
            choices: [
              "Error 1138: Invalid use of NULL value — the second promise gets checked once the first is satisfied.",
              "It succeeds, and Ana's NULL row is just left out of the locked table.",
              "The same 1062 error as before, because the server rechecks everything from scratch.",
            ],
            answer: 0,
            explain:
              "One promise at a time — clear the duplicate and the server moves straight on to check the next one, which is exactly what a real cleanup checklist feels like.",
          },
          explain:
            "A DIFFERENT error this time — 1138: Invalid use of NULL value. One promise satisfied, so the server checked the next one and found Ana's missing id. Errors in sequence like this are the server working through your cleanup list with you.",
        },
        {
          goal: "Fix the missing id: give Ana the number 5.",
          solution: "UPDATE students SET id = 5 WHERE name = 'Ana';",
          explain: "1 row affected. Every row now has an id, and every id is one of a kind. The table finally deserves its lock.",
        },
        {
          goal: "Third time's the charm: add the primary key.",
          solution: "ALTER TABLE students ADD PRIMARY KEY (id);",
          explain:
            "Query OK — the lock is ON. Clean first, then lock: that's the permanent order of this operation, because a key isn't decoration, it's a certificate that the data already tells the truth.",
        },
        {
          goal: "Admire the shape: describe students.",
          solution: "DESCRIBE students;",
          explain: "id — Null: NO, Key: PRI. Same table, same data, new guarantee. From here on the server does the checking.",
        },
        {
          goal: "Prove the guarantee is live: try to insert a student with the already-taken id 3.",
          solution: "INSERT INTO students VALUES (3, 'Intruder', 9);",
          predict: {
            question: "students is now locked on id, and id 3 already exists (Jen). What happens when you insert another row with id 3?",
            choices: [
              "It's accepted this once — new INSERTs get a grace period right after a table is first locked.",
              "It's accepted, because tables that were fixed by hand allow reusing an id that was only ever duplicated, not deleted.",
              "Error 1062: refused — the same wall you saw on teachers now protects this table too.",
            ],
            answer: 2,
            explain:
              "There's no grace period and no memory of how the id got clean — the moment the key exists, every INSERT is checked the same way, forever.",
          },
          explain:
            "Error 1062 — refused, automatically, forever. Yesterday, deleting the right Marco depended on you being careful. Today the table itself is careful. That's the entire point of a PRIMARY KEY.",
        },
        {
          goal: "The school just hired a third teacher. Give Santos id 3 in the teachers table.",
          solution: "INSERT INTO teachers VALUES (3, 'Santos');",
          explain:
            "1 row added — Santos gets id 3 in teachers, a completely different table from students, so the two 3's never collide. Every table keeps its own promise, separately.",
        },
        {
          goal: "Which teacher currently holds id 2?",
          solution: "SELECT * FROM teachers WHERE id = 2;",
          explain:
            "One row: Cruz. A locked id column means a WHERE like this can never surprise you with a second match — that's what you're buying with today's cleanup.",
        },
        {
          goal: "Ana's grade level was recorded wrong — she's actually in grade level 10 now, not 9. Fix just her row.",
          solution: "UPDATE students SET grade_level = 10 WHERE id = 5;",
          explain:
            "1 row affected. The lock never stops you from correcting a value; it only stops the id column itself from ever lying to you again.",
        },
        {
          goal: "A new student enrols: id 6, name 'Miguel', grade level 8. Add him.",
          solution: "INSERT INTO students VALUES (6, 'Miguel', 8);",
          explain:
            "1 row affected — Miguel is in. The lock checked id 6 against every existing id automatically and let him straight through, the same way it will for every enrolment from now on.",
        },
        {
          goal: "See who's left in grade level 9 after today's corrections.",
          solution: "SELECT * FROM students WHERE grade_level = 9;",
          explain:
            "Just Jen — grade 9 is thinner than it looks once Ana's fix is counted. Nobody showed you this query; you turned a real question about the roster into SQL yourself. That's the whole job.",
        },
      ],
    },
    {
      kind: "quest",
      id: "choose-the-key",
      title: "🗝️ Quest: choose the key",
      intro:
        "Declaring a key is one line. CHOOSING one is judgement — and judgement is what separates a database designer from someone typing tutorials. Four real tables, four decisions.",
      missions: [
        {
          task: "A school enrols students. In the Philippines every student already carries a government-issued Learner Reference Number (LRN). The table's columns: lrn, name, grade_level, barangay.",
          check: {
            question: "Which column should be the primary key?",
            choices: [
              "grade_level — it's a number, and numbers make good keys",
              "lrn — one per student, never shared, never blank",
              "name — most schools rarely have two students named exactly the same",
            ],
            answer: 1,
            explain:
              "The LRN exists precisely to be a student's true name in every school system. 'Rarely' isn't 'never' — two students can absolutely share a name — and grade_level is a number that repeats across an entire cohort. Unique + never missing is the whole test, not 'looks numeric' or 'seems uncommon.'",
          },
        },
        {
          task: "A city tracks jeepneys: plate_number, driver_name, route, fare.",
          check: {
            question: "Best key?",
            choices: [
              "route — many drivers share the same route number",
              "driver_name — one driver can own more than one jeepney",
              "plate_number — the law already forces it to be unique per vehicle",
            ],
            answer: 2,
            explain:
              "The law already enforces uniqueness on the plate — borrow that work instead of reinventing it. A driver can own several jeepneys, so any WHERE aimed at their name would silently hit all of them; a shared route number fails the exact same way.",
          },
        },
        {
          task: "A sari-sari store logs sales: what was sold, when, how much. Columns: item, sold_on, price. The owner asks: which column is the key?",
          check: {
            question: "What's the honest answer?",
            choices: [
              "None qualifies — the same item sells at the same price on the same day; add an id column that exists only to identify rows",
              "item — the same product can't appear twice in one day's sales",
              "sold_on — no two sales happen at the exact same moment",
            ],
            answer: 0,
            explain:
              "Sell two Sky Flakes in one day and 'item' collides; two sales can land in the same recorded day too — precision feels safe until it isn't. When no real-world column can promise uniqueness, you MANUFACTURE one: an id column whose only job is being the row's true name. That's most tables, honestly — and it's why tomorrow's lesson exists.",
          },
        },
        {
          task: "Your turn to exercise the judgement. Look at the table YOU designed in week 1 (your Day-1 design quest — playlists, players, episodes, stock…). Decide: does any existing column truly qualify (unique for every row, can never be blank, will never need to change)? Or does your table need a manufactured id?",
          input:
            "Name your table, name the key you chose (an existing column or 'a new id column'), and one sentence on why every OTHER column failed the test",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet-day3",
      title: "📓 Quest: cheat sheet, day 3",
      intro:
        "Today's entries are short and heavy: two ways to declare a key, two promises, three errors. The shortest section of your cheat sheet, and the one every later week leans on.",
      missions: [
        {
          task: "Add a Day 3 heading. From memory: create a table with a key at birth, and add a key to a table later in life. Under them, write the two promises a PRIMARY KEY makes, in your own words.",
          check: {
            question: "Which pair are the two promises?",
            choices: [
              "The column becomes read-only — once a row is inserted its key can never change",
              "Rows are automatically kept in key order when you SELECT * with no ORDER BY",
              "Every value unique, and no value ever missing (NULL)",
            ],
            answer: 2,
            explain:
              "A key CAN still be updated carefully — 'read-only' isn't the promise. And SELECT * with no ORDER BY never guarantees row order, key or no key. Unique + never NULL is the whole promise; everything else people say about keys rides along separately.",
          },
        },
        {
          task: "Errors section, three new residents: 1062 (duplicate entry — the wall works), 1048 (cannot be null — the second promise), 1138 (invalid use of NULL — trying to lock a table with missing values). For each: one line on when you met it today and the fix.",
          input:
            "Paste your Day 3 section — both declarations, the two promises, and your three error entries",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: lock your own table",
      intro:
        "The mini server's mess was staged. Your students table is real, and today it gets its lock — plus the payoff for Monday's annoyance: once id is a true key, Workbench's seatbelt finally trusts your aim.",
      missions: [
        {
          task: "Audit first: in your real Workbench, run SELECT * FROM students ORDER BY id; and check the id column with your own eyes — any duplicates? Any NULLs? (Ten rows is an eyeball job; fixing anything you find is Day 1's UPDATE skill.)",
          check: {
            question: "Why audit BEFORE running ALTER TABLE … ADD PRIMARY KEY?",
            choices: [
              "No reason — ADD PRIMARY KEY automatically fixes any duplicate or missing values it finds",
              "The server will refuse the key if the column already breaks the promises — clean first, then lock",
              "Auditing is only needed the first time; after that MySQL remembers which columns are safe",
            ],
            answer: 1,
            explain:
              "You watched the mini server refuse the lock twice today, and it never once repaired anything on its own. A key certifies existing data; it never touches it. Clean, then lock.",
          },
        },
        {
          task: "Lock it: run ALTER TABLE students ADD PRIMARY KEY (id); then DESCRIBE students; and find the PRI.",
          code: "ALTER TABLE students ADD PRIMARY KEY (id);\nDESCRIBE students;",
          check: {
            question: "What does the PRI in DESCRIBE's Key column mean for every future INSERT?",
            choices: [
              "New rows are inserted a little faster, since MySQL skips checking them",
              "Nothing changes until you restart MySQL or reopen Workbench",
              "The server checks each new row's id against every existing id, automatically, forever",
            ],
            answer: 2,
            explain:
              "The checking is now the server's job, not your carefulness, and it starts immediately — no restart, no ramp-up. Duplicate ids and missing ids simply cannot happen to this table anymore.",
          },
        },
        {
          task: "Now Monday's payoff. Turn the seatbelt back ON (SET SQL_SAFE_UPDATES = 1;) and run a small UPDATE aimed WHERE id = … at one of your students. On Monday, safe mode blocked this. Watch what happens now.",
          check: {
            question: "Why does safe mode allow this UPDATE today when it refused on Monday?",
            choices: [
              "Safe mode only blocks UPDATEs during your first few days of using Workbench",
              "The WHERE now aims with a KEY column — exactly the guarantee safe mode was waiting for all along",
              "Safe mode was turned off earlier this week and never came back on by itself",
            ],
            answer: 1,
            explain:
              "Safe mode never hated your updates — it distrusted your aim specifically, because a WHERE on an unkeyed column could always widen without warning. A WHERE on a true key can't widen, so the seatbelt and you finally agree.",
          },
        },
        {
          task: "Record it: add a '-- Day 3' section to week2.sql — any id repairs from your audit, the ALTER TABLE line, and a comment on what changed about safe mode.",
          input:
            "Paste your Day 3 section of week2.sql, and one sentence: what do the two promises of your new key make impossible in your table from today on?",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "key-forensics",
      optional: true,
      title: "🔍 Challenge: key forensics",
      intro:
        "A club roster came in from another teacher. Something's wrong with it — nobody's telling you what. Diagnose it yourself, clean it, and lock it.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "members",
                columns: [
                  { name: "id", type: "INT" },
                  { name: "name", type: "VARCHAR(50)" },
                  { name: "join_year", type: "INT" },
                ],
                rows: [
                  ["1", "Dela Cruz", "2023"],
                  ["2", "Santos", "2022"],
                  ["2", "Reyes", "2023"],
                  [null, "Bautista", "2024"],
                  ["5", "Garcia", "2021"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal: "Before anything else, try to lock members.id as the primary key.",
          solution: "ALTER TABLE members ADD PRIMARY KEY (id);",
          explain:
            "Error 1062: Duplicate entry '2'. Something in this roster already breaks a promise — find out what.",
        },
        {
          goal: "Find out exactly what's wrong with id 2.",
          solution: "SELECT * FROM members WHERE id = 2;",
          explain: "Two members, one id: Santos and Reyes. Someone has to move.",
        },
        {
          goal: "Move Reyes off the taken id — give Reyes id 6. (You can't aim by id here — what does only Reyes have?)",
          solution: "UPDATE members SET id = 6 WHERE name = 'Reyes';",
          explain: "1 row affected. One promise closer to a lock.",
        },
        {
          goal: "Try the lock again.",
          solution: "ALTER TABLE members ADD PRIMARY KEY (id);",
          explain:
            "A different error now — 1138: Invalid use of NULL value. The duplicate is gone, so the server moved on to the next promise and found a gap.",
        },
        {
          goal: "Look at the whole roster again and find the row with no id at all.",
          solution: "SELECT * FROM members;",
          explain:
            "Five rows, and one of them — Bautista — has nothing in the id column. That's your gap.",
        },
        {
          goal: "Give Bautista id 7.",
          solution: "UPDATE members SET id = 7 WHERE name = 'Bautista';",
          explain: "1 row affected. Every member now has an id, and every id is one of a kind.",
        },
        {
          goal: "Lock it for real.",
          solution: "ALTER TABLE members ADD PRIMARY KEY (id);",
          explain: "Query OK. Diagnose, clean, lock — the exact same order as this morning, on a roster nobody walked you through.",
        },
        {
          goal: "Confirm the lock held.",
          solution: "DESCRIBE members;",
          explain: "id — Null: NO, Key: PRI. Forensics closed.",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own-keys",
      optional: true,
      title: "🔬 Challenge: make your own keys",
      intro:
        "Every table today was mine. Pick one that's genuinely yours, choose its key, and defend the choice in writing — then build it and lock it for real, with no script to copy.",
      missions: [
        {
          task: "Pick a table idea of your own — something with a real candidate column, not just an obvious id (a library of books you own, tournaments you've played, a shop's inventory, anything). Name the table and list every column you'd give it.",
          input: "Your table name and its columns",
        },
        {
          task: "Decide your key. Now defend it in writing: name TWO other columns a beginner might mistake for the key, and for each one say exactly which promise it breaks (can repeat, or can be blank) — or why it's simply the wrong kind of column to aim a WHERE at.",
          input: "Your chosen key, and your two-column defense",
        },
        {
          task: "Say you accidentally try to insert a row into your table with a value that repeats an existing value in your chosen key column. What will MySQL do?",
          check: {
            question: "What happens?",
            choices: [
              "It's accepted — MySQL only checks for duplicates in columns you mark UNIQUE, not PRIMARY KEY",
              "Error 1062: Duplicate entry — the row is refused, the same wall you triggered on teachers and students today",
              "It's accepted, and the older row with that value is quietly deleted",
            ],
            answer: 1,
            explain:
              "PRIMARY KEY already means UNIQUE — no extra keyword needed — and MySQL never deletes your data to make room for a new row. The refusal is the whole point.",
          },
        },
        {
          task: "Build it for real, in your own Workbench: CREATE (or ALTER) the table with your chosen key declared PRIMARY KEY, INSERT at least 4 rows, then run DESCRIBE and confirm PRI shows against your key column.",
          input: "Paste your CREATE/ALTER TABLE statement, your INSERT statements, and the DESCRIBE output",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-identity-thief",
    title: "⚔️ Boss battle: The Identity Thief",
    intro:
      "The Identity Thief thrives in tables where rows can't prove who they are — duplicate ids, missing ids, shared names. You locked its favorite door today; now finish it off.",
    boss: { name: "the Identity Thief", emoji: "🎭" },
    questions: [
      {
        prompt: "The two promises a PRIMARY KEY makes about its column:",
        choices: [
          "Every value is unique, and no value is ever NULL",
          "Values are numbers, and they start at 1",
          "Rows stay sorted, and queries run faster",
        ],
        answer: 0,
        explain:
          "Unique + never missing. Both are enforced by the server on every insert and update — not suggestions, walls.",
      },
      {
        prompt: "Why is name a terrible primary key for students?",
        choices: [
          "Text columns can't be searched",
          "Two students can share a name — nothing can force names to be unique",
          "Names are too long to store",
        ],
        answer: 1,
        explain:
          "The twins problem. Any column whose values CAN repeat in the real world fails the test — which is most columns, which is why id columns exist.",
      },
      {
        prompt: "You INSERT a row whose id already exists in a keyed column. MySQL…",
        choices: [
          "Accepts it and renumbers the old row",
          "Accepts it — keys are only advice",
          "Refuses with Error 1062: Duplicate entry — the row never gets in",
        ],
        answer: 2,
        explain:
          "The row bounces, the table stays truthful. 1062 even names the colliding value and the key that refused it.",
      },
      {
        prompt: "And a row with NULL in the keyed column?",
        choices: [
          "Refused with Error 1048: Column 'id' cannot be null",
          "The server invents a number for it",
          "Accepted — NULL is unique enough",
        ],
        answer: 0,
        explain:
          "The second promise. (Tomorrow you'll meet a special setup where the server DOES invent the number — but that's a feature you ask for, not a default.)",
      },
      {
        prompt: "ALTER TABLE students ADD PRIMARY KEY (id); fails with 'Duplicate entry 3'. What is the server telling you?",
        choices: [
          "The command syntax is wrong",
          "The existing data already breaks the uniqueness promise — clean it up, then lock",
          "The table is too big for a key",
        ],
        answer: 1,
        explain:
          "A key certifies data; it never repairs it. The refusal names the guilty value — your cleanup list, written by the server.",
      },
      {
        prompt: "In DESCRIBE's output, a primary key column shows…",
        choices: [
          "Key: YES and Null: PRI",
          "Key: UNI and Null: YES",
          "Key: PRI and Null: NO",
        ],
        answer: 2,
        explain: "The promises, printed in the shape. Reading DESCRIBE is how you check any unfamiliar table's guarantees.",
      },
      {
        prompt: "How many primary keys can one table have?",
        choices: ["One", "Two — one for reads, one for writes", "One per unique-looking column, if you declare them"],
        answer: 0,
        explain:
          "One table, one true name. Trying to declare a second gets Error 1068: Multiple primary key defined.",
      },
      {
        prompt: "With a key on id, what does WHERE id = 7 now GUARANTEE?",
        choices: [
          "It matches at least one row",
          "It matches at most one row — exactly the one that is id 7, or nobody",
          "It runs without a semicolon",
        ],
        answer: 1,
        explain:
          "At most one — uniqueness makes the aim exact, and 'or nobody' is your familiar quiet miss. No WHERE on a keyed id can ever hit two rows.",
      },
      {
        prompt: "Why did Workbench's safe mode start trusting your WHERE id updates today?",
        choices: [
          "Safe mode resets every Thursday",
          "It doesn't — you must always disable it",
          "The WHERE now uses a KEY column — the guarantee safe mode always wanted",
        ],
        answer: 2,
        explain:
          "Monday's annoyance, explained: safe mode distrusts aims that can silently widen. A key column's aim can't. Locked table, seatbelt on — the professional's resting state.",
      },
      {
        prompt: "A sari-sari sales table has no column that's naturally unique. The fix?",
        choices: [
          "Add an id column whose only job is identifying the row",
          "Use the price — numbers feel unique",
          "Tables like that can't have keys",
        ],
        answer: 0,
        explain:
          "Manufacture the identity. Most real tables do exactly this — and tomorrow the server starts filling that column for you.",
      },
      {
        prompt: "Which order works?",
        code: "A) Lock the table, then fix the duplicate ids\nB) Fix the duplicate ids, then lock the table",
        choices: [
          "Lock the table, then fix the duplicate ids",
          "Fix the duplicate ids, then lock the table",
          "Either order works",
        ],
        answer: 1,
        explain:
          "Clean first, then lock — the server enforces this by refusing the key over dirty data, as it did to you twice today.",
      },
      {
        prompt: "Yesterday you deleted the right Marco by being careful. What does today change about that story?",
        choices: [
          "Nothing — DELETE still works the same way",
          "Marcos can no longer be deleted",
          "With a key, the table itself guarantees each row is aimable — safety stops depending on you being careful",
        ],
        answer: 2,
        explain:
          "That's the week's turn: Days 1–2 made YOU careful; Day 3 builds the care into the table. Structure beats vigilance, every time.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The two promises of a PRIMARY KEY and who enforces them, in your own words.",
      "The strangest moment of today's cleanup-then-lock sequence and why it happened.",
      "One question you still have.",
      "Paste today's SQL.",
    ],
    note: "Two challenge steps above — key forensics and building your own keyed table — are waiting for early finishers, and they're where today's judgment gets tested for real. One thorn remains regardless: you're still choosing id numbers BY HAND — you gave Paolo 4 and Ana 5 yourself. Tomorrow the server takes over the counting, and you never type an id again.",
  },
};
