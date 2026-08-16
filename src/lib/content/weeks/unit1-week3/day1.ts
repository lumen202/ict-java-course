// unit1-week3 · Day 1 — Link the notebooks with FOREIGN KEY
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Link the notebooks with FOREIGN KEY",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup",
    title: "🕹️ Warm-up game: the ghost sales",
    intro:
      "The canteen keeper, Aling Nena, keeps two notebooks: a snack list and a sales log. The student council is auditing the concession, and the sales log is on your screen. The snack notebook says the canteen sells exactly six things: 1 Banana cue, 2 Turon, 3 Kwek-kwek, 4 Gulaman, 5 Siopao, 6 Pastillas. Keep that list in view — every round asks you to check the log against it.",
    tableName: "sales",
    columns: ["sale_id", "snack_id", "sold_on", "qty"],
    rows: [
      ["1", "1", "2026-08-10", "4"],
      ["2", "3", "2026-08-10", "2"],
      ["3", "1", "2026-08-11", "5"],
      ["4", "9", "2026-08-11", "3"],
      ["5", "2", "2026-08-12", "6"],
      ["6", "1", "2026-08-12", "2"],
      ["7", "NULL", "2026-08-13", "1"],
      ["8", "5", "2026-08-13", "3"],
      ["9", "3", "2026-08-14", "4"],
      ["10", "9", "2026-08-14", "2"],
    ],
    rounds: [
      {
        question:
          "Warm your week-2 muscles first: click every sale of 4 or more items.",
        matches: [0, 2, 4, 8],
        sql: "SELECT * FROM sales WHERE qty >= 4;",
        explain:
          "Four big sales. A WHERE with a comparison — you've been aiming these since week 1. Today the aiming gets a new target: another notebook.",
      },
      {
        question: "One more recall round: click every sale made on 2026-08-12.",
        matches: [4, 5],
        sql: "SELECT * FROM sales WHERE sold_on = '2026-08-12';",
        explain:
          "Two sales that day — Turon and Banana cue, if you check the snack list. You just looked something up across two notebooks. Hold that thought.",
      },
      {
        question:
          "Now the audit. The snack notebook lists ids 1 to 6, nothing else. Click every sale whose snack_id is NOT in the snack notebook.",
        matches: [3, 9],
        sql: "SELECT * FROM sales WHERE snack_id = 9;\n-- snack 9 does not exist. these sales point at nothing.",
        explain:
          "Sales 4 and 10 claim the canteen sold snack number 9 — a snack that isn't on the list. Rows like these are called orphans: children pointing at a parent that doesn't exist. Nothing stopped Aling Nena from writing them down.",
      },
      {
        question:
          "One entry got smudged — the snack number never made it onto the page. Click it.",
        matches: [6],
        sql: "SELECT * FROM sales WHERE sale_id = 7;\n-- snack_id: NULL. something sold — nobody knows what.",
        explain:
          "Sale 7 has no snack_id at all. That's different from pointing at a fake snack: this one honestly says 'unknown'. Keep the difference in mind — it matters again this afternoon.",
      },
      {
        question:
          "Last round: Banana cue is snack 1 in the snack notebook. Click every sale of Banana cue.",
        matches: [0, 2, 5],
        sql: "-- you matched snack_id across two notebooks by eye.\n-- today the server learns to guard that link:\n-- FOREIGN KEY (snack_id) REFERENCES snacks (snack_id)",
        explain:
          "Three sales, matched by carrying an id from one notebook to the other in your head. That id-to-id link is the whole idea of today — and by the end of the day, the server itself will refuse any sale that breaks it.",
      },
    ],
  },
  videos: [
    {
      title: "MySQL: FOREIGN KEYS are easy (kind of)",
      youtubeId: "rFssfx37UJw",
      length: "8:17",
      practice: {
        intro:
          "Type along in your own Workbench, in a sandbox database — not in school. Then, after the video:",
        steps: [
          "Insert a child row whose parent id does not exist in the parent table.",
          "Read Error 1452 out loud, twice — that message is the link doing its job.",
        ],
        note: "The video may use clauses the mini servers on this page don't speak (ON DELETE, DECIMAL columns). Real Workbench is fine with them; the consoles here only know INT, VARCHAR and DATE, and no ON DELETE — so type those parts in Workbench only.",
      },
    },
  ],
  activities: [
    {
      kind: "typing",
      id: "typing-fk",
      title: "⌨️ Type the link",
      intro:
        "One clause turns two separate tables into linked notebooks: FOREIGN KEY (column) REFERENCES parent (column). Your fingers need it cold before the console asks for it.",
      rounds: [
        {
          prompt:
            "Create the sales table with a link on snack_id — start with the two words that declare the link.",
          template:
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, {FOREIGN KEY} (snack_id) REFERENCES snacks (snack_id) );",
          explain:
            "FOREIGN KEY marks a column as a pointer into another table. It lives in the CHILD table — the one doing the pointing.",
        },
        {
          prompt: "Same statement — this time type the word that names the table being pointed at.",
          template:
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, FOREIGN KEY (snack_id) {REFERENCES} snacks (snack_id) );",
          explain:
            "REFERENCES names the parent. Read the clause as a sentence: this column REFERENCES that table's column.",
        },
        {
          prompt: "Now type the whole aim: which column points, and where it points to.",
          template:
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, FOREIGN KEY {(snack_id) REFERENCES snacks (snack_id)} );",
          explain:
            "Child column first, then the parent table and its column. Both ends of the link, spelled out.",
        },
        {
          prompt: "Type the entire link clause from memory — everything after the last comma.",
          template:
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, {FOREIGN KEY (snack_id) REFERENCES snacks (snack_id)} );",
          explain:
            "That one clause is today's whole lesson in eleven-ish words: this column may only hold values that exist over there.",
        },
        {
          prompt: "Check your work the week-2 way: show the shape of the sales table.",
          template: "{DESCRIBE} sales;",
          explain:
            "In the Key column you'll see PRI on sale_id — and MUL on snack_id. MUL is how DESCRIBE marks a foreign key column: many sales may point at the same snack.",
        },
        {
          prompt:
            "From memory, the whole thing: create a table called signups with a keyed id (INT) and a student_id (INT) that references students (student_id).",
          template:
            "{CREATE TABLE signups ( id INT PRIMARY KEY, student_id INT, FOREIGN KEY (student_id) REFERENCES students (student_id) );}",
          explain:
            "A different pair of tables, the same shape. Every linked pair you ever build is this pattern: child table, pointer column, FOREIGN KEY … REFERENCES parent.",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "fk-console",
      title: "🖥️ Mini server: born linked",
      intro:
        "This server holds the snack notebook — and nothing else. You're going to build the sales notebook yourself, linked from birth, and then attack the link from every direction: a ghost sale, a forbidden delete, a smudged entry. Watch which attacks bounce and which get through. Nothing here can hurt anything: this server forgets everything when you leave.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "snacks",
                columns: [
                  { name: "snack_id", type: "INT", pk: true },
                  { name: "name", type: "VARCHAR(50)" },
                  { name: "price", type: "INT" },
                ],
                rows: [
                  ["1", "Banana cue", "15"],
                  ["2", "Turon", "12"],
                  ["3", "Kwek-kwek", "20"],
                  ["4", "Gulaman", "10"],
                  ["5", "Siopao", "25"],
                  ["6", "Pastillas", "8"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal:
            "Build the sales notebook, linked from birth: a sales table with sale_id (INT, PRIMARY KEY), snack_id (INT), sold_on (DATE), qty (INT) — and a FOREIGN KEY on snack_id that references snacks (snack_id).",
          solution:
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) );",
          hint:
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) );",
          explain:
            "Done — and from this moment the server checks every snack_id that anyone ever writes into sales against the snack notebook. Aling Nena never had a guard like this.",
        },
        {
          goal: "Look at the shape: describe sales and find the link in the result.",
          solution: "DESCRIBE sales;",
          hint: "DESCRIBE sales;",
          explain:
            "sale_id says PRI — the true name you built last week. snack_id says MUL: a foreign key column, where many sales may point at one snack. The link is part of the table's shape now, not a rule in your head.",
        },
        {
          goal:
            "Log the first page of honest sales in ONE statement: sale 1 was 4 Banana cue (snack 1) on 2026-08-10; sale 2 was 2 Kwek-kwek (snack 3) the same day; sale 3 was 5 Banana cue on 2026-08-11.",
          solution:
            "INSERT INTO sales VALUES (1, 1, '2026-08-10', 4), (2, 3, '2026-08-10', 2), (3, 1, '2026-08-11', 5);",
          hint: "One INSERT, three bracketed groups, separated by commas — week-1 muscles.",
          explain:
            "3 rows in. Every snack_id you wrote — 1, 3, 1 — exists in the snack notebook, so the link let them all straight through. Honest rows don't feel the guard at all.",
        },
        {
          goal:
            "Now the ghost from your warm-up: try to log sale 4 — 3 of snack number 9 on 2026-08-11.",
          solution: "INSERT INTO sales VALUES (4, 9, '2026-08-11', 3);",
          predict: {
            question:
              "There is no snack 9 in the snack notebook. What will the server do with this sale?",
            choices: [
              "Accept it — sales is its own table, and this row is valid sales data",
              "Accept it, but add a snack 9 to snacks automatically",
              "Refuse it with an error — snack_id must point at a real snack",
            ],
            answer: 2,
            explain:
              "The FOREIGN KEY makes snack 9 impossible to reference. The row never gets in.",
          },
          explain:
            "Error 1452: Cannot add or update a child row: a foreign key constraint fails. Read it slowly — it names the constraint and both tables. In Aling Nena's paper notebook this ghost got written down twice; on your server it cannot be written down at all.",
        },
        {
          goal:
            "Attack from the other side: Banana cue is unpopular with the council. Try to DELETE snack 1 from the snack notebook.",
          solution: "DELETE FROM snacks WHERE snack_id = 1;",
          predict: {
            question:
              "Sales 1 and 3 point at snack 1. What happens if the snack itself is deleted?",
            choices: [
              "The delete works — the FK only checks INSERTs into sales, not deletes from snacks",
              "The server refuses — deleting the snack would turn its sales into orphans",
              "The delete works, and sales 1 and 3 are deleted along with it",
            ],
            answer: 1,
            explain:
              "The link is guarded from BOTH ends. A parent that children point at cannot quietly disappear.",
          },
          explain:
            "Error 1451: Cannot delete or update a parent row: a foreign key constraint fails. Same guard, other direction: 1452 stops a child pointing at nothing, 1451 stops a parent abandoning its children. Two error numbers, one promise.",
        },
        {
          goal:
            "Try the same delete on Pastillas instead: remove snack 6 from the notebook.",
          solution: "DELETE FROM snacks WHERE snack_id = 6;",
          predict: {
            question: "No sale in the log points at snack 6. What happens this time?",
            choices: [
              "Refused — once a table has a foreign key, no snack can ever be deleted",
              "Refused — deletes on parent tables always need the seatbelt off first",
              "Allowed — no sale points at Pastillas, so no promise would be broken",
            ],
            answer: 2,
            explain:
              "1451 only fires when a delete would strand actual children. A parent nobody references is free to go.",
          },
          explain:
            "1 row affected. The server isn't stubborn — it's precise. It refused snack 1 because sales point at it; it released snack 6 because nothing does. The FK never blocks more than the promise requires.",
        },
        {
          goal:
            "Keep the log going: sale 5 was 6 Turon (snack 2) on 2026-08-12. Log it.",
          solution: "INSERT INTO sales VALUES (5, 2, '2026-08-12', 6);",
          hint: "Same INSERT shape as before — one bracketed group this time.",
          explain:
            "In it goes. Turon exists, the link is satisfied, and the biggest single sale of the week is on the books.",
        },
        {
          goal:
            "The smudged entry: sale 7 sold 1 of SOMETHING on 2026-08-13, but the snack number is unreadable. Log it with NULL as the snack_id.",
          solution: "INSERT INTO sales VALUES (7, NULL, '2026-08-13', 1);",
          predict: {
            question:
              "snack_id is the foreign key column. Will the server accept NULL in it?",
            choices: [
              "No — a foreign key column must always name a real snack",
              "Yes — NULL means 'unknown', and the link only checks values that are actually there",
              "No — NULL is never allowed in any column of any table",
            ],
            answer: 1,
            explain:
              "A FOREIGN KEY forbids LIES (snack 9), not honest UNKNOWNS (NULL). Unknown is not the same as fake.",
          },
          explain:
            "Accepted. This surprises almost everyone: the same column that refused snack 9 lets NULL through. The FK's promise is 'if there IS a value, it points at something real' — it doesn't force a value to exist. If you need that too, that's a job for NOT NULL, a different tool.",
        },
        {
          goal:
            "Question for the log: how many Banana cue sales are on the books? Show every sale of snack 1.",
          solution: "SELECT * FROM sales WHERE snack_id = 1;",
          explain:
            "Two rows — sales 1 and 3, exactly the honest ones. Tomorrow you'll ask this kind of question with the snack's NAME instead of memorizing its number.",
        },
        {
          goal:
            "Last entry of the day, no help: on 2026-08-13 the canteen sold 3 Siopao. Give it sale_id 8 and write the whole INSERT yourself. (The snack notebook is a SELECT away if you forgot Siopao's number.)",
          solution: "INSERT INTO sales VALUES (8, 5, '2026-08-13', 3);",
          explain:
            "Six rows on the books now, every one either pointing at a real snack or honestly unknown. That's what a linked notebook looks like. Your real one gets built this afternoon.",
        },
      ],
    },
    {
      kind: "quest",
      id: "link-detective",
      title: "🔎 Quest: link detective",
      intro:
        "Declaring a link is one line. DECIDING the link — which table is the parent, which is the child, which column carries the pointer — is judgement. Three real pairs of notebooks, then one of your own.",
      missions: [
        {
          task: "A school tracks club signups. Two tables: students (student_id, name, grade_level) and signups (signup_id, student_id, club, joined_on). One of them needs the FOREIGN KEY.",
          check: {
            question: "Which table gets the FOREIGN KEY clause?",
            choices: [
              "signups — it's the child, its student_id points at a student that must exist",
              "students — it's the bigger, more important table",
              "Both — each table references the other",
            ],
            answer: 0,
            explain:
              "The FK always lives in the table doing the POINTING. A signup makes no sense without its student; a student is perfectly fine with zero signups. Pointer column, child table.",
          },
        },
        {
          task: "A clinic keeps patients (patient_id, name, birthdate) and appointments (appointment_id, patient_id, on_date). Same question, but think about the direction of the promise.",
          check: {
            question: "What does FOREIGN KEY (patient_id) REFERENCES patients (patient_id) — written inside appointments — actually promise?",
            choices: [
              "Every patient must have at least one appointment",
              "Appointments are deleted whenever their patient is",
              "Every appointment's patient_id names a patient that really exists in patients",
            ],
            answer: 2,
            explain:
              "The promise runs child-to-parent, one direction only. Patients with no appointments are fine; an appointment for patient 999 who doesn't exist is exactly what the FK forbids.",
          },
        },
        {
          task: "A city logs jeepney trips: jeepneys (plate_number, route) and trips (trip_id, plate_number, on_date, passengers). The FK is on trips.plate_number. Now flip your thinking: what does the link forbid on the PARENT side?",
          check: {
            question: "The city tries to DELETE a jeepney that has trips on record. What happens, and why?",
            choices: [
              "It's deleted — parents are never blocked, only children are checked",
              "Error 1451 — deleting it would leave trips pointing at a jeepney that no longer exists",
              "The jeepney and all its trips are deleted together",
            ],
            answer: 1,
            explain:
              "1451 is the parent-side half of the promise. A jeepney with history can't vanish while that history points at it — first the trips would have to go (or point elsewhere).",
          },
        },
        {
          task: "Your turn to be the detective. Think of a parent/child pair from your OWN life — playlists and songs, teams and players, orders and items, a game and its saved matches. Decide which is the parent, which is the child, and which column carries the link.",
          input:
            "Name your two tables, say which is the parent and which is the child, name the linking column, and one sentence: what does the FK make impossible in your pair?",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet",
      title: "📓 Quest: cheat sheet, week 3 begins",
      intro:
        "New week, new section. Today's entries are the link clause and its two guard errors — you'll lean on these all week, so write them like you mean it.",
      missions: [
        {
          task: "Open your cheatsheet file and add a heading: 'Week 3 — linked tables'. Under it, from memory: a CREATE TABLE with a FOREIGN KEY clause, and one line in your own words saying what the FK promises.",
          check: {
            question: "Which sentence belongs on your sheet as THE foreign key promise?",
            choices: [
              "A foreign key makes queries between two tables run faster",
              "A foreign key copies the parent's rows into the child table",
              "Every value in this column points at a row that really exists in the parent table — the server enforces it",
            ],
            answer: 2,
            explain:
              "That's the whole promise, including who keeps it: the server, on every insert, update and delete, forever. Speed and copying have nothing to do with it.",
          },
        },
        {
          task: "Errors section, two new residents: 1452 (child pointing at nothing — fix the child's value, or add the missing parent) and 1451 (parent still pointed at — deal with the children first). For each, one line on when you met it today.",
          input:
            "Paste your Week 3 section — the CREATE with its FK clause, your promise sentence, and both error entries with their fixes",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: start week3.sql",
      intro:
        "The mini server's canteen was a rehearsal. Now build the real one in YOUR school database — linked from birth — and start week3.sql, the file that will hold the whole audit by Friday.",
      missions: [
        {
          task: "Create week3.sql next to your week2.sql. Header comment — your name, 'Week 3' — then the first real line: USE school; Below it, CREATE the snacks table: snack_id INT PRIMARY KEY, name VARCHAR(50), price INT. Run it.",
          check: {
            question: "Today you'll create snacks AND sales. Why must snacks be created first?",
            choices: [
              "sales has a FOREIGN KEY that REFERENCES snacks — you can't point at a table that doesn't exist yet",
              "Alphabetical order — MySQL processes tables by name",
              "Parent tables are always smaller, and small tables go first",
            ],
            answer: 0,
            explain:
              "The REFERENCES clause is checked the moment the child is created. Parent before child isn't style — it's the only order that runs. Remember this when you assemble the file on Friday.",
          },
        },
        {
          task: "Now the child, linked from birth: CREATE sales with sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT, and FOREIGN KEY (snack_id) REFERENCES snacks (snack_id). Then seed the snack notebook — the six snacks with their prices: (1,'Banana cue',15), (2,'Turon',12), (3,'Kwek-kwek',20), (4,'Gulaman',10), (5,'Siopao',25), (6,'Pastillas',8).",
          code: "CREATE TABLE sales (\n  sale_id INT PRIMARY KEY,\n  snack_id INT,\n  sold_on DATE,\n  qty INT,\n  FOREIGN KEY (snack_id) REFERENCES snacks (snack_id)\n);",
          check: {
            question: "Run DESCRIBE sales; — what does the Key column show for snack_id?",
            choices: [
              "PRI — it's a key, so it must be primary",
              "MUL — a foreign key column, where many sales may point at one snack",
              "Nothing — foreign keys don't appear in DESCRIBE",
            ],
            answer: 1,
            explain:
              "MUL for 'multiple': lots of sales, one snack. Next to sale_id's PRI you can now read both of your table's guarantees straight off its shape.",
          },
        },
        {
          task: "Seed the sales log — but only the entries that can survive the link: sales (1,1,'2026-08-10',4), (2,3,'2026-08-10',2), (3,1,'2026-08-11',5), (5,2,'2026-08-12',6), (6,1,'2026-08-12',2), (7,NULL,'2026-08-13',1), (8,5,'2026-08-13',3), (9,3,'2026-08-14',4). Comment above the INSERT saying these are the honest sales.",
          check: {
            question: "Sale 7 has NULL for snack_id. Will your new FK let it in?",
            choices: [
              "No — the whole INSERT fails on that row",
              "Only if the seatbelt is off",
              "Yes — the FK checks values that exist; NULL is an honest 'unknown', not a lie",
            ],
            answer: 2,
            explain:
              "Same as the console this morning: the smudged entry goes in, the ghosts won't. Unknown and fake are different things, and the FK only fights fakes.",
          },
        },
        {
          task: "Now fire the guard on purpose: try to insert the ghost — sale 4, snack 9, 2026-08-11, qty 3 — and watch the real Error 1452 appear in YOUR Workbench. Then put the statement in week3.sql commented out, with a note that it can never run.",
          check: {
            question: "Why keep a statement in your file that can never run?",
            choices: [
              "It's evidence — the audit file shows the ghost was tried and the link refused it",
              "Commented statements still run, just more slowly",
              "In case snack 9 is added later",
            ],
            answer: 0,
            explain:
              "week3.sql is the story of the audit, and 'the server refused the ghost' is a plot point. A comment is how a .sql file remembers something that deliberately didn't happen.",
          },
        },
        {
          task: "Read your Day 1 section top to bottom once, then turn it in.",
          input:
            "Paste your Day 1 section of week3.sql (USE, both CREATEs, the seeds, the commented ghost), and one sentence: what can never happen in your sales table from today on?",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "bug-hospital",
      optional: true,
      title: "🏥 Challenge: the bug hospital",
      intro:
        "Six patients, all suffering from broken links. Each task shows a statement that fails (or does the wrong thing) — your job is to diagnose the bug and run the CORRECTED version. The snack notebook is already on the server.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "snacks",
                columns: [
                  { name: "snack_id", type: "INT", pk: true },
                  { name: "name", type: "VARCHAR(50)" },
                  { name: "price", type: "INT" },
                ],
                rows: [
                  ["1", "Banana cue", "15"],
                  ["2", "Turon", "12"],
                  ["3", "Kwek-kwek", "20"],
                  ["4", "Gulaman", "10"],
                  ["5", "Siopao", "25"],
                  ["6", "Pastillas", "8"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal:
            "Patient 1 — this CREATE fails because the parent's name is misspelled. Diagnose it, then run the corrected statement:  CREATE TABLE orders ( order_id INT PRIMARY KEY, snack_id INT, qty INT, FOREIGN KEY (snack_id) REFERENCES snak (snack_id) );",
          solution:
            "CREATE TABLE orders ( order_id INT PRIMARY KEY, snack_id INT, qty INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) );",
          explain:
            "REFERENCES snacks, not snak. A foreign key can only point at a table that exists — a typo in the parent's name kills the whole CREATE.",
        },
        {
          goal:
            "Patient 2 — this insert fails with 1452:  INSERT INTO orders VALUES (1, 99, 2);  The order was really for Kwek-kwek. Run the corrected insert.",
          solution: "INSERT INTO orders VALUES (1, 3, 2);",
          explain:
            "99 points at nothing; Kwek-kwek is snack 3. When 1452 fires, the fix is almost always the child's value — check the parent notebook and write the id that's really there.",
        },
        {
          goal:
            "Patient 3 — this CREATE fails because the POINTER column's name is misspelled inside the FK clause:  CREATE TABLE deliveries ( delivery_id INT PRIMARY KEY, snack_id INT, FOREIGN KEY (snacks_id) REFERENCES snacks (snack_id) );  Run the corrected statement.",
          solution:
            "CREATE TABLE deliveries ( delivery_id INT PRIMARY KEY, snack_id INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) );",
          explain:
            "The table has snack_id; the FK clause said snacks_id. The FK's column must be a column the table actually has — both ends of the link have to be spelled exactly right.",
        },
        {
          goal:
            "Patient 4 — someone wrote these two CREATEs in this order and the first one failed:  1) CREATE TABLE stock ( stock_id INT PRIMARY KEY, supplier_id INT, FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) );  2) CREATE TABLE suppliers ( supplier_id INT PRIMARY KEY, name VARCHAR(50) );  Run what should have run FIRST.",
          solution: "CREATE TABLE suppliers ( supplier_id INT PRIMARY KEY, name VARCHAR(50) );",
          explain:
            "suppliers is the parent, so it goes first. The child's REFERENCES is checked at creation time, not later — order is part of correctness.",
        },
        {
          goal: "Patient 4, second half — now run the child that failed before.",
          solution:
            "CREATE TABLE stock ( stock_id INT PRIMARY KEY, supplier_id INT, FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id) );",
          explain:
            "Same statement, new world: the parent exists, so the link has something to hold onto. Nothing was wrong with the SQL — only with when it ran.",
        },
        {
          goal:
            "Patient 5 — the keeper wants to retire the snack nobody has ordered. The script says  DELETE FROM snacks WHERE snack_id = 3;  but that fails with 1451 (order 1 points at Kwek-kwek). Gulaman is the one with no orders. Run the corrected delete.",
          solution: "DELETE FROM snacks WHERE snack_id = 4;",
          explain:
            "Snack 4 goes quietly — nothing points at it. 1451 isn't a dead end; it's the server telling you to pick a parent without children, or deal with the children first.",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-orphan-maker",
    title: "⚔️ Boss battle: The Orphan Maker",
    intro:
      "The Orphan Maker fills sales logs with ghosts and deletes parents out from under their children. Every trick it knows, a FOREIGN KEY refuses — and you watched the refusals happen today.",
    boss: { name: "the Orphan Maker", emoji: "👻" },
    questions: [
      {
        prompt: "What does a FOREIGN KEY promise about its column?",
        choices: [
          "Its values are always unique within the child table",
          "Every value in it points at a row that really exists in the parent table",
          "It automatically copies data from the parent table",
        ],
        answer: 1,
        explain:
          "Existence, not uniqueness — many sales can point at the same snack. Unique-and-never-missing is the PRIMARY KEY's promise; really-exists-over-there is the FOREIGN KEY's.",
      },
      {
        prompt: "The FOREIGN KEY clause is written inside which table?",
        choices: [
          "The child — the table whose column does the pointing",
          "The parent — the table being pointed at",
          "A third table that stores all the links",
        ],
        answer: 0,
        explain:
          "The pointer lives with the pointing column. snacks never mentions sales; sales declares FOREIGN KEY (snack_id) REFERENCES snacks (snack_id).",
      },
      {
        prompt: "Error 1452 fires when…",
        choices: [
          "you delete a parent row that children still point at",
          "you insert a duplicate primary key value",
          "you insert or update a child row whose pointer names a parent that doesn't exist",
        ],
        answer: 2,
        explain:
          "1452 is the child-side guard: no lies in the pointer column. Your ghost sale of snack 9 met it this morning.",
      },
      {
        prompt: "And Error 1451?",
        choices: [
          "You tried to delete (or renumber) a parent row that children still point at",
          "You inserted a child row pointing at nothing",
          "You created the child table before the parent",
        ],
        answer: 0,
        explain:
          "1451 is the parent-side guard. Banana cue couldn't leave while sales 1 and 3 pointed at it — Pastillas, with no sales, walked free.",
      },
      {
        prompt: "You hit 1452 inserting a sale. What's the usual fix?",
        choices: [
          "Turn safe update mode off and run it again",
          "Check the parent notebook and write a snack_id that really exists (or add the missing snack first)",
          "Remove the FOREIGN KEY — it's blocking your data",
        ],
        answer: 1,
        explain:
          "Either the child's value is wrong or the parent is genuinely missing — fix whichever is the lie. Removing the guard because it caught something is the one answer that's always wrong.",
      },
      {
        prompt: "A sale arrives with NULL in the foreign key column snack_id. The server…",
        choices: [
          "refuses it with 1452 — the pointer must always point somewhere",
          "refuses it with 1048 — keys can never be NULL",
          "accepts it — the FK checks values that are present, and NULL honestly says 'unknown'",
        ],
        answer: 2,
        explain:
          "The smudged entry taught you this: an FK forbids fake values, not missing ones. (1048 belongs to NOT NULL columns and primary keys — different promise.)",
      },
      {
        prompt: "Why must the parent table be created before the child?",
        choices: [
          "The child's REFERENCES clause is checked immediately — it can't point at a table that doesn't exist yet",
          "Parents are usually smaller, and small tables create faster",
          "It doesn't matter — MySQL sorts it out at the end",
        ],
        answer: 0,
        explain:
          "Order is part of correctness with linked tables. This is why week3.sql creates snacks before sales — and why Friday's file assembly has only one valid order.",
      },
      {
        prompt:
          "Sales 1 and 3 point at snack 1; nothing points at snack 6. Which DELETE succeeds?",
        code: "A) DELETE FROM snacks WHERE snack_id = 1;\nB) DELETE FROM snacks WHERE snack_id = 6;",
        choices: [
          "A — snack 1 was created first, so it can be deleted first",
          "B — no child points at snack 6, so no promise is broken",
          "Neither — parents can never be deleted once the FK exists",
        ],
        answer: 1,
        explain:
          "The guard is precise: it blocks exactly the deletes that would strand children, and no others. You proved both halves on the console today.",
      },
      {
        prompt: "In DESCRIBE's Key column, a foreign key column shows…",
        choices: ["FOR", "PRI", "MUL"],
        answer: 2,
        explain:
          "MUL, for 'multiple' — many child rows may point at the same parent. PRI marks the primary key; FOR isn't a thing, however reasonable it sounds.",
      },
      {
        prompt: "Week-2 recall: the TWO promises a PRIMARY KEY makes about its column?",
        choices: [
          "Values are numbers, and they start at 1",
          "Every value unique, and no value ever NULL",
          "Rows stay sorted, and inserts run faster",
        ],
        answer: 1,
        explain:
          "Unique + never missing. Notice how the two keys divide the work: the PRIMARY KEY gives a row a true name; the FOREIGN KEY lets another table use that name safely.",
      },
      {
        prompt: "Week-2 recall: you INSERT a row whose sale_id already exists. MySQL answers…",
        choices: [
          "Error 1062: Duplicate entry — the primary key refuses the row",
          "Error 1452: a foreign key constraint fails",
          "0 row(s) affected — a quiet miss",
        ],
        answer: 0,
        explain:
          "1062 is the primary key's wall, from week 2. Keep the guard dogs straight: 1062 duplicate name, 1452 child lying, 1451 parent leaving.",
      },
      {
        prompt:
          "Week-2 recall: what did AUTO_INCREMENT add to your primary key column?",
        choices: [
          "It made the column accept NULL values",
          "It let two rows share an id if they arrive quickly",
          "The server picks the next id itself — you stop typing ids by hand",
        ],
        answer: 2,
        explain:
          "The server counts so you can't collide. Your own designed table uses it — and on Thursday that table becomes a PARENT with a child of its own.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "What a FOREIGN KEY promises and who enforces it, in your own words.",
      "What surprised you or broke today (the NULL that got in? the delete that didn't?), and why it happened.",
      "One question you still have.",
      "Then paste the SQL you ran today.",
    ],
    note: "Your week3.sql now holds two linked tables and a ghost that couldn't get in. Tomorrow you read both notebooks as ONE answer — and discover that a join can quietly lose rows. Finished early? The bug hospital above is open.",
  },
};
