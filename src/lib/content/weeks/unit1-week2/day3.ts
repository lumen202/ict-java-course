// unit1-week2 · Day 3 — Give every row a true name with PRIMARY KEY
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

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
        "Two jobs today. First, build a fresh table WITH a key and watch it refuse bad rows all by itself. Then the real work: this server holds the messy hand-kept table from your warm-up — duplicate id, missing id and all — and you are going to clean it and lock it. The server will refuse the lock until the data deserves it. Twice.",
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
          explain:
            "Error 1062: Duplicate entry '1' for key 'teachers.PRIMARY'. The row bounced — the table still has two teachers. THIS is the promise: not a guideline, a wall. Read that message carefully; it names the duplicate value and the key that refused it.",
        },
        {
          goal: "Attack it differently: try to insert a teacher with NULL as the id.",
          solution: "INSERT INTO teachers VALUES (NULL, 'Ghost');",
          explain:
            "Error 1048: Column 'id' cannot be null. The second promise — a key can never be missing, so no row can ever become unreachable like Ana. Two attacks, two refusals, zero bad rows.",
        },
        {
          goal: "Now the messy table. Try to lock it as-is: add a primary key on students.id.",
          solution: "ALTER TABLE students ADD PRIMARY KEY (id);",
          explain:
            "Error 1062: Duplicate entry '3'. The server won't promise uniqueness over data that already breaks it — and it even tells you WHICH value is the problem. The lock is refused until the mess is fixed. So: find the mess.",
        },
        {
          goal: "Investigate the duplicate: show every row with id 3.",
          solution: "SELECT * FROM students WHERE id = 3;",
          hint: "SELECT * FROM students WHERE id = 3;",
          explain:
            "Jen AND Paolo, sharing one id — your warm-up, live. Someone must move. Paolo gets the free id 4.",
        },
        {
          goal: "Fix the duplicate: change PAOLO's id to 4. (Careful — you can't aim by id here. What does only Paolo have?)",
          solution: "UPDATE students SET id = 4 WHERE name = 'Paolo';",
          hint: "Aim by name: WHERE name = 'Paolo'. It only works because there's exactly one Paolo — pure luck, which is the whole problem with keyless tables.",
          explain:
            "1 row affected. Notice the irony: to repair the id column you had to aim with a name — and that only worked because Paolo has no twin. On a keyed table you'll never depend on luck again.",
        },
        {
          goal: "Try the lock again.",
          solution: "ALTER TABLE students ADD PRIMARY KEY (id);",
          explain:
            "A DIFFERENT error this time — 1138: Invalid use of NULL value. One promise satisfied, so the server checked the next one and found Ana's missing id. Errors in sequence like this are the server working through your cleanup list with you.",
        },
        {
          goal: "Fix the missing id: give Ana the number 5.",
          solution: "UPDATE students SET id = 5 WHERE name = 'Ana';",
          hint: "Same move as Paolo: UPDATE students SET id = 5 WHERE name = 'Ana';",
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
          explain:
            "Error 1062 — refused, automatically, forever. Yesterday, deleting the right Marco depended on you being careful. Today the table itself is careful. That's the entire point of a PRIMARY KEY.",
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
              "lrn — one per student, never shared, never blank",
              "name — everyone has one",
              "barangay — it rarely changes",
            ],
            answer: 0,
            explain:
              "The LRN exists precisely to be a student's true name in every school system. Names have twins; barangays are shared by thousands. Unique + never missing is the whole test.",
          },
        },
        {
          task: "A city tracks jeepneys: plate_number, driver_name, route, fare.",
          check: {
            question: "Best key?",
            choices: [
              "plate_number — the law already forces it to be unique per vehicle",
              "driver_name — drivers know their own names",
              "fare — it's a number",
            ],
            answer: 0,
            explain:
              "'It's a number' is not the test — many jeepneys share a fare. When the real world already enforces uniqueness (plates, LRNs, receipt numbers), borrow its work.",
          },
        },
        {
          task: "A sari-sari store logs sales: what was sold, when, how much. Columns: item, sold_on, price. The owner asks: which column is the key?",
          check: {
            question: "What's the honest answer?",
            choices: [
              "None qualifies — the same item sells at the same price on the same day; add an id column that exists only to identify rows",
              "item — each product is unique",
              "sold_on — dates never repeat",
            ],
            answer: 0,
            explain:
              "Sell two Sky Flakes on Tuesday and every column collides. When no real-world column can promise uniqueness, you MANUFACTURE one: an id column whose only job is being the row's true name. That's most tables, honestly — and it's why tomorrow's lesson exists.",
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
              "Every value unique, and no value ever missing (NULL)",
              "Fast queries and pretty output",
              "Rows stay in insert order and never change",
            ],
            answer: 0,
            explain:
              "Unique + never NULL. Everything else people say about keys — aim, safety, speed — flows from those two.",
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
              "The server will refuse the key if the column already breaks the promises — clean first, then lock",
              "Auditing makes the ALTER run faster",
              "No reason — the key fixes bad data automatically",
            ],
            answer: 0,
            explain:
              "You watched the mini server refuse the lock twice today. A key certifies existing data; it never repairs it. Clean, then lock.",
          },
        },
        {
          task: "Lock it: run ALTER TABLE students ADD PRIMARY KEY (id); then DESCRIBE students; and find the PRI.",
          code: "ALTER TABLE students ADD PRIMARY KEY (id);\nDESCRIBE students;",
          check: {
            question: "What does the PRI in DESCRIBE's Key column mean for every future INSERT?",
            choices: [
              "The server checks each new row's id against every existing id, automatically, forever",
              "New rows will be inserted faster",
              "Nothing until you also restart MySQL",
            ],
            answer: 0,
            explain:
              "The checking is now the server's job, not your carefulness. Duplicate ids and missing ids simply cannot happen to this table anymore.",
          },
        },
        {
          task: "Now Monday's payoff. Turn the seatbelt back ON (SET SQL_SAFE_UPDATES = 1;) and run a small UPDATE aimed WHERE id = … at one of your students. On Monday, safe mode blocked this. Watch what happens now.",
          check: {
            question: "Why does safe mode allow this UPDATE today when it refused on Monday?",
            choices: [
              "The WHERE now aims with a KEY column — exactly the guarantee safe mode was waiting for all along",
              "Safe mode gives up after a few days",
              "UPDATEs with small numbers are always allowed",
            ],
            answer: 0,
            explain:
              "Safe mode never hated your updates — it distrusted your aim. A WHERE on a true key provably hits exactly the rows it names, so the seatbelt and you finally agree. Locked table, seatbelt on: this is how you work from now on.",
          },
        },
        {
          task: "Record it: add a '-- Day 3' section to week2.sql — any id repairs from your audit, the ALTER TABLE line, and a comment on what changed about safe mode.",
          input:
            "Paste your Day 3 section of week2.sql, and one sentence: what do the two promises of your new key make impossible in your table from today on?",
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
          "Two students can share a name — nothing can force names to be unique",
          "Names are too long to store",
          "Text columns can't be searched",
        ],
        answer: 0,
        explain:
          "The twins problem. Any column whose values CAN repeat in the real world fails the test — which is most columns, which is why id columns exist.",
      },
      {
        prompt: "You INSERT a row whose id already exists in a keyed column. MySQL…",
        choices: [
          "Refuses with Error 1062: Duplicate entry — the row never gets in",
          "Accepts it and renumbers the old row",
          "Accepts it — keys are only advice",
        ],
        answer: 0,
        explain:
          "The row bounces, the table stays truthful. 1062 even names the colliding value and the key that refused it.",
      },
      {
        prompt: "And a row with NULL in the keyed column?",
        choices: [
          "Refused with Error 1048: Column 'id' cannot be null",
          "Accepted — NULL is unique enough",
          "The server invents a number for it",
        ],
        answer: 0,
        explain:
          "The second promise. (Tomorrow you'll meet a special setup where the server DOES invent the number — but that's a feature you ask for, not a default.)",
      },
      {
        prompt: "ALTER TABLE students ADD PRIMARY KEY (id); fails with 'Duplicate entry 3'. What is the server telling you?",
        choices: [
          "The existing data already breaks the uniqueness promise — clean it up, then lock",
          "The command syntax is wrong",
          "The table is too big for a key",
        ],
        answer: 0,
        explain:
          "A key certifies data; it never repairs it. The refusal names the guilty value — your cleanup list, written by the server.",
      },
      {
        prompt: "In DESCRIBE's output, a primary key column shows…",
        choices: [
          "Key: PRI and Null: NO",
          "Key: YES and Null: PRI",
          "Nothing — keys are invisible",
        ],
        answer: 0,
        explain: "The promises, printed in the shape. Reading DESCRIBE is how you check any unfamiliar table's guarantees.",
      },
      {
        prompt: "How many primary keys can one table have?",
        choices: ["One", "One per column", "Up to ten"],
        answer: 0,
        explain:
          "One table, one true name. Trying to declare a second gets Error 1068: Multiple primary key defined.",
      },
      {
        prompt: "With a key on id, what does WHERE id = 7 now GUARANTEE?",
        choices: [
          "It matches at most one row — exactly the one that is id 7, or nobody",
          "It matches at least one row",
          "It runs without a semicolon",
        ],
        answer: 0,
        explain:
          "At most one — uniqueness makes the aim exact, and 'or nobody' is your familiar quiet miss. No WHERE on a keyed id can ever hit two rows.",
      },
      {
        prompt: "Why did Workbench's safe mode start trusting your WHERE id updates today?",
        choices: [
          "The WHERE now uses a KEY column — the guarantee safe mode always wanted",
          "Safe mode resets every Thursday",
          "It doesn't — you must always disable it",
        ],
        answer: 0,
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
          "Fix the duplicate ids, then lock the table",
          "Lock the table, then fix the duplicate ids",
          "Either order works",
        ],
        answer: 0,
        explain:
          "Clean first, then lock — the server enforces this by refusing the key over dirty data, as it did to you twice today.",
      },
      {
        prompt: "Yesterday you deleted the right Marco by being careful. What does today change about that story?",
        choices: [
          "With a key, the table itself guarantees each row is aimable — safety stops depending on you being careful",
          "Nothing — DELETE still works the same way",
          "Marcos can no longer be deleted",
        ],
        answer: 0,
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
    note: "One thorn remains: you're still choosing id numbers BY HAND — you gave Paolo 4 and Ana 5 yourself. Tomorrow the server takes over the counting, and you never type an id again.",
  },
};
