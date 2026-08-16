// unit1-week2 · Day 4 — Let the server count for you with AUTO_INCREMENT
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day4: DayPlan = {
  day: "Day 4",
  focus: "Let the server count for you with AUTO_INCREMENT",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup-day4",
    title: "🕹️ Warm-up game: next number, please",
    intro:
      "A food stall hands every customer a numbered ticket from a machine — nobody ever chooses their own number. Some customers have been served and their rows deleted, which left gaps. Read the queue like the machine does: it's exactly how your tables will number their rows from today on.",
    tableName: "tickets",
    columns: ["ticket_no", "customer", "ordered"],
    rows: [
      ["1", "Liza", "Siopao"],
      ["2", "Marco", "Gulaman"],
      ["3", "Jen", "Siopao"],
      ["5", "Paolo", "Banana-cue"],
      ["7", "Kristine", "Gulaman"],
    ],
    rounds: [
      {
        question: "Tickets go out in order, one number each, no repeats. Click the customer holding the FIRST ticket ever issued.",
        matches: [0],
        sql: "-- The machine, in SQL:\nticket_no INT PRIMARY KEY AUTO_INCREMENT",
        explain:
          "AUTO_INCREMENT is a numbered-ticket machine bolted onto a key column: each new row automatically gets the next number. Nobody types ticket numbers; nobody CAN get them wrong.",
      },
      {
        question: "Click the NEWEST customer — the one holding the biggest number.",
        matches: [4],
        sql: "SELECT * FROM tickets ORDER BY ticket_no DESC;\n-- the top row is the newest",
        explain:
          "Kristine, ticket 7. The machine's memory is simple: the biggest number it has ever handed out. That's all it needs to know what comes next.",
      },
      {
        question: "Tickets 4 and 6 are missing from the queue. Click every row holding one of them.",
        matches: [],
        sql: "SELECT * FROM tickets\nWHERE ticket_no = 4 OR ticket_no = 6;\n-- 0 rows",
        explain:
          "Those customers were served and their rows DELETED — and their numbers left with them. Gaps in an AUTO_INCREMENT column are the ghosts of deleted rows, and they're completely normal.",
      },
      {
        question:
          "A new customer walks up. Click the row whose ticket tells you what number the machine gives NEXT.",
        matches: [4],
        sql: "INSERT INTO tickets (customer, ordered)\nVALUES ('Ramon', 'Siopao');\n-- Ramon gets ticket 8",
        explain:
          "Biggest ever handed out is 7, so next is 8 — NOT the vacant 4 or 6. The machine never reuses a number: ticket 4 might still be written on Paolo's old receipt somewhere, and 8 can never be mistaken for it.",
      },
      {
        question:
          "Last one: the stall owner types the customer and the order, never the number. Click every row whose ticket_no the MACHINE chose.",
        matches: [0, 1, 2, 3, 4],
        sql: "INSERT INTO tickets (customer, ordered) VALUES ('…', '…');\n-- name only the columns YOU provide",
        explain:
          "All of them — that's the deal. You provide the data, the machine provides the identity. From today, your INSERTs name only the columns you're filling, and the id fills itself.",
      },
    ],
  },
  videos: [
    {
      title: "AUTO_INCREMENT is awesome",
      youtubeId: "ALht4W2QxqY",
      length: "3:55",
      practice: {
        intro: "Type along in a sandbox.",
        steps: [
          "The video moves the counter with ALTER TABLE … AUTO_INCREMENT = 1000; — do that too, and insert a row to see it land at 1000.",
          "Then the key move: insert three rows into your practice table naming ONLY the non-id columns.",
          "SELECT to watch the server hand out 1, 2, 3 by itself.",
        ],
      },
    },
  ],
  activities: [
    {
      kind: "typing",
      id: "typing-auto",
      title: "⌨️ Type the ticket machine",
      intro:
        "One new word on the key column, and a new INSERT shape to go with it. The flagship line of this whole week is in here — by the last round you'll own it from memory.",
      rounds: [
        {
          prompt: "Create a visitors table whose id numbers itself.",
          template: "CREATE TABLE visitors ( id INT PRIMARY KEY {AUTO_INCREMENT}, name VARCHAR(50) );",
          explain:
            "One word, with the underscore: AUTO_INCREMENT. It rides on the PRIMARY KEY — a counter needs a key column to live on.",
        },
        {
          prompt: "Add Liza WITHOUT typing an id — name the column you're providing.",
          template: "INSERT INTO visitors {(name)} VALUES ('Liza');",
          explain:
            "The column list in brackets says 'I'm providing name; server, you handle the rest'. The id fills itself with the next number.",
        },
        {
          prompt: "Add Marco and Jen in one statement, still no ids.",
          template: "INSERT INTO visitors (name) VALUES {('Marco'), ('Jen')};",
          explain:
            "Multi-row works exactly like week 1 — one bracketed group per row, commas between. The machine numbers them in order.",
        },
        {
          prompt: "Move the counter so the next visitor gets number 100.",
          template: "ALTER TABLE visitors {AUTO_INCREMENT = 100};",
          explain:
            "Useful when you want ids to start somewhere meaningful (1000 for orders, a new year's block…). The counter jumps; it still never goes backwards.",
        },
        {
          prompt: "From memory: add a visitor named Ana, the modern way.",
          template: "{INSERT INTO visitors (name) VALUES ('Ana');}",
          explain: "Column list, value, done. You may never type an id in an INSERT again.",
        },
        {
          prompt: "From memory, the flagship line of week 2: create the visitors table, self-numbering id and a name up to 50.",
          template: "{CREATE TABLE visitors ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) );}",
          explain:
            "id INT PRIMARY KEY AUTO_INCREMENT — from now on, this is how every table you create begins. Week 1's tables were missing exactly these three words.",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "auto-console",
      title: "🖥️ Mini server: the ticket machine",
      intro:
        "Build the machine, feed it visitors, then poke at its strangest habit: what happens to the numbers when rows die. Every id in this console will be chosen by the server — your hands never touch one.",
      setup: {
        databases: [{ name: "school" }],
        use: "school",
      },
      tasks: [
        {
          goal: "Build it: a visitors table with a self-numbering id (whole numbers, primary key) and a name (text up to 50).",
          solution: "CREATE TABLE visitors ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) );",
          hint: "CREATE TABLE visitors ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) );",
          explain:
            "The machine exists, counter set to 1. Yesterday's promises (unique, never NULL) plus today's upgrade: the server fills the column itself.",
        },
        {
          goal: "Check the shape: describe visitors and find the machine in the output.",
          solution: "DESCRIBE visitors;",
          hint: "DESCRIBE visitors;",
          explain:
            "There it is — Extra: auto_increment, sitting next to Key: PRI. Any time you inherit an unfamiliar table, this is how you find out whether ids type themselves.",
        },
        {
          goal: "First visitor: add Liza — provide ONLY her name.",
          solution: "INSERT INTO visitors (name) VALUES ('Liza');",
          hint: "INSERT INTO visitors (name) VALUES ('Liza'); — the brackets name what you're providing.",
          explain:
            "1 row affected, and you never typed an id. The column list is the new habit: name what you provide, the machine provides identity.",
        },
        {
          goal: "Two more in one statement: Marco, then Jen — still no ids.",
          solution: "INSERT INTO visitors (name) VALUES ('Marco'), ('Jen');",
          hint: "Same column list, two bracketed groups separated by a comma.",
          explain: "2 rows, numbered in order by the machine. Multi-row INSERT and the column list work together perfectly.",
        },
        {
          goal: "Look at what the machine chose: show the whole table.",
          solution: "SELECT * FROM visitors;",
          explain:
            "1, 2, 3 — clean, unique, untouched by human hands. Compare that with Tuesday's hand-typed mess of duplicate 3s. Machines don't get bored and reuse a number.",
        },
        {
          goal: "Now the classic stumble. Try to add Paolo the OLD way — no column list, just VALUES ('Paolo');",
          solution: "INSERT INTO visitors VALUES ('Paolo');",
          predict: {
            question: "No column list this time — just VALUES ('Paolo');. What will the server say?",
            choices: [
              "It works — the machine fills in the missing id on its own",
              "Error 1136 — column count doesn't match value count",
              "Paolo gets inserted with id NULL",
            ],
            answer: 1,
            explain:
              "Without a column list the server expects a value for EVERY column, id included — one value can't stand in for two columns, machine or not.",
          },
          explain:
            "Error 1136: column count doesn't match. Without a column list the server expects a value for EVERY column — including id. Two escapes: provide both values, or (better) name the columns you're providing. The column list isn't decoration; it's the contract.",
        },
        {
          goal: "Add Paolo properly.",
          solution: "INSERT INTO visitors (name) VALUES ('Paolo');",
          explain: "Ticket 4 for Paolo. Error read, lesson learned, row in.",
        },
        {
          goal: "Paolo leaves. Delete his row (aim with his id — it's a real key now, so the aim is guaranteed).",
          solution: "DELETE FROM visitors WHERE id = 4;",
          explain:
            "1 row affected. Monday's verb, Wednesday's aim, no seatbelt complaint — a WHERE on a key column is exactly the aim safe mode trusts. Now… what happened to the number 4?",
        },
        {
          goal: "Add Ana and then look at the table — watch which id she gets.",
          solution: "INSERT INTO visitors (name) VALUES ('Ana');\nSELECT * FROM visitors;",
          predict: {
            question: "Paolo's row (id 4) is gone. What id does Ana get?",
            choices: [
              "4 — the machine reuses the first free number it finds",
              "5 — the machine only ever moves forward, past the biggest number it has ever issued",
              "1 — deleting a row resets the counter back to the start",
            ],
            answer: 1,
            explain:
              "The counter has no memory of gaps, only of the biggest number it ever handed out. 4 is retired the moment Paolo's row is gone.",
          },
          explain:
            "1, 2, 3, 5 — Ana got FIVE, not 4. The counter remembers the biggest number it ever issued and never reuses one. The 4 is retired with Paolo's row: if ticket 4 is written down anywhere else in the world, it can never accidentally mean Ana. Gaps aren't damage; they're integrity.",
        },
        {
          goal: "Move the counter: make the next visitor's number 100.",
          solution: "ALTER TABLE visitors AUTO_INCREMENT = 100;",
          explain:
            "Counter repositioned. (It only jumps forward — the server won't let it move back into numbers already used.) The video did this with 1000 for order numbers; same idea.",
        },
        {
          goal: "Prove it: add Ramon and show the table.",
          solution: "INSERT INTO visitors (name) VALUES ('Ramon');\nSELECT * FROM visitors;",
          predict: {
            question: "The counter was just moved to start at 100. What id does Ramon get?",
            choices: [
              "100 — exactly where the counter now points",
              "6 — ALTER TABLE was cosmetic; the machine just continues from the last real row",
              "99 — one before the number you set, since counting starts at 0",
            ],
            answer: 0,
            explain:
              "ALTER TABLE really did move the counter, not just relabel it — the very next row lands exactly there.",
          },
          explain:
            "Ramon holds ticket 100. From 1-2-3-5 straight to 100 — and the next visitor gets 101. You now know everything the machine does: counts forward, never repeats, never fills gaps, and takes id-typing off your hands forever.",
        },
        {
          goal: "Kristine walks up next. Add her to the queue — you already know what number the machine is about to hand her.",
          solution: "INSERT INTO visitors (name) VALUES ('Kristine');",
          explain:
            "101, exactly as predicted. Once you understand the machine's one rule (biggest-ever plus one), its next move is never a surprise again.",
        },
        {
          goal: "Two friends, Ben and Elena, walk up together. Add them both in one statement, then check who holds which ticket.",
          solution: "INSERT INTO visitors (name) VALUES ('Ben'), ('Elena');\nSELECT * FROM visitors;",
          explain:
            "102 for Ben, 103 for Elena — a multi-row INSERT still hands out consecutive numbers in the order the rows are listed.",
        },
        {
          goal: "Ben changes his mind and leaves before he's served. Take him out of the queue.",
          solution: "DELETE FROM visitors WHERE id = 102;",
          explain:
            "1 row affected, and 102 is retired for good — same rule as Paolo's 4, just further down the line.",
        },
        {
          goal: "A new batch of tickets starts today, and they need to begin at 200. Move the machine ahead of everything issued so far.",
          solution: "ALTER TABLE visitors AUTO_INCREMENT = 200;",
          explain:
            "The counter jumps clean over 104–199 — nobody will ever hold those numbers, and that's fine. Forward is the only direction it moves.",
        },
      ],
    },
    {
      kind: "order",
      id: "order-modern-recipe",
      title: "🧩 Puzzle: the modern recipe",
      intro:
        "Week 1's recipes built tables the old way. These builds use everything week 2 added — keys, machines, the ritual — and like every recipe, they only run in one order. Assemble each so it runs top to bottom without an error.",
      rounds: [
        {
          prompt:
            "Assemble a fresh-start script that runs top to bottom without an error, and leave out the one line that can't run yet.",
          lines: [
            "USE school;",
            "CREATE TABLE visitors ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) );",
            "INSERT INTO visitors (name) VALUES ('Liza');",
            "SELECT * FROM visitors;",
          ],
          distractors: ["INSERT INTO visitors VALUES ('Liza');"],
          explain:
            "The week-1 skeleton (USE → table → rows → question) with week-2 muscles: the key and the machine are in the CREATE, and the INSERT names only what you provide. The distractor skips the column list on a two-column table — one value for two columns is Error 1136, so it can never belong here.",
        },
        {
          prompt:
            "Assemble the CREATE TABLE for a self-numbering pets table — mind the commas, and remember which column always leads.",
          lines: [
            "CREATE TABLE pets (",
            "  id INT PRIMARY KEY AUTO_INCREMENT,",
            "  name VARCHAR(30),",
            "  adopted_on DATE",
            ");",
          ],
          explain:
            "The id line leads — the true name comes first by convention, so every reader finds it instantly. Commas BETWEEN columns, none after the last: week-1 rules, unchanged.",
        },
        {
          prompt:
            "Assemble the repair ritual for a table with junk test rows, and leave out the line that doesn't belong in it yet.",
          lines: [
            "SELECT * FROM students WHERE name = 'test';",
            "DELETE FROM students WHERE name = 'test';",
            "SELECT * FROM students;",
          ],
          distractors: ["ALTER TABLE students AUTO_INCREMENT = 100;"],
          explain:
            "Preview, delete, verify — the WHERE identical in steps one and two, the final SELECT confirming the survivors. This order is not style; it's the safety system. The distractor moves a counter that doesn't exist yet: students has no AUTO_INCREMENT column until the ALTER two rounds from now.",
        },
        {
          prompt:
            "Assemble Wednesday's whole drama in the order the week taught it: repair the duplicate first, lock the table next, and let Ana enrol only once the key is already guarding the door — then finish with the check that proves it.",
          lines: [
            "UPDATE students SET id = 4 WHERE name = 'Paolo';",
            "ALTER TABLE students ADD PRIMARY KEY (id);",
            "INSERT INTO students VALUES (9, 'Ana', 9);",
            "SELECT * FROM students ORDER BY id;",
          ],
          explain:
            "Clean → lock → grow → verify. The first two are forced: the ALTER would refuse to run before the UPDATE, because id 3 is still duplicated. Ana's row is placed after the lock on purpose — her INSERT runs either way, but only on this side of the ALTER does the server check her id before accepting it. Enrolling into a guarded table is the whole point of Wednesday.",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet-day4",
      title: "📓 Quest: cheat sheet, day 4",
      intro:
        "The flagship line goes in your book today. Short section, permanent habits.",
      missions: [
        {
          task: "Add a Day 4 heading and write, from memory: the flagship CREATE line (id INT PRIMARY KEY AUTO_INCREMENT), the column-list INSERT, and the counter-mover (ALTER TABLE … AUTO_INCREMENT = n).",
          check: {
            question: "In INSERT INTO visitors (name) VALUES ('Liza'); — what do the brackets after the table name declare?",
            choices: [
              "Which columns exist in the table",
              "Which columns YOU are providing — everything else is the server's job",
              "The order rows will be sorted in",
            ],
            answer: 1,
            explain:
              "The column list is a contract: these are mine, the rest are yours. It's what lets the machine fill the id.",
          },
        },
        {
          task: "Add the machine's three laws to your notes, in your own words: it counts forward, it never reuses a number, and it never fills gaps. Then errors section: 1136 gets a second line — 'also happens when I forget the column list on an auto-id table'.",
          input:
            "Paste your Day 4 section — the three commands, the machine's three laws, and the updated 1136 entry",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: your week-1 design, built the professional way",
      intro:
        "In week 1 you DESIGNED a table about something you love — playlists, players, episodes, stock — in a text file. It's been waiting. Today it becomes a real table in your real database, built the way you'd build it at a job: key first, machine on, column-list INSERTs.",
      missions: [
        {
          task: "Open your week-1 design (the design-table quest turn-in has it if you lost the file). In your real Workbench, in your school database: CREATE the table for real — id INT PRIMARY KEY AUTO_INCREMENT first, then YOUR columns with sensible week-1 types.",
          check: {
            question: "Your design already had its own columns. Why add an id column anyway?",
            choices: [
              "Since you already picked meaningful columns, one of them is probably unique enough without an id",
              "MySQL requires a column literally named 'id' before it will run any query",
              "Yesterday's judgement call: unless a column is truly unique and never blank, rows need a manufactured true name",
            ],
            answer: 2,
            explain:
              "Songs repeat titles, players share names, stock items share prices. The manufactured id is the honest answer for most real tables — and now the server maintains it for free.",
          },
        },
        {
          task: "Fill it: at least five rows of your real data, using column-list INSERTs — never typing an id. Then SELECT * and watch the numbers the server chose.",
          check: {
            question: "What should the id column show after five inserts?",
            choices: [
              "Five random numbers",
              "1 through 5, in insert order, chosen by the server",
              "NULL until you fill them in",
            ],
            answer: 1,
            explain:
              "Fresh machine, five tickets, perfect sequence. Every future row extends it without you thinking about ids ever again.",
          },
        },
        {
          task: "Make a ghost: DELETE one middle row (aim by id — enjoy how safe that feels on a keyed table), then INSERT one more row and SELECT. Find the gap and the new number.",
          check: {
            question: "You deleted id 3 and inserted a new row. The new row's id is…",
            choices: [
              "3 — the machine fills gaps first",
              "0 — deleted numbers reset the counter",
              "6 — the counter continues past the biggest ever issued; 3 is retired",
            ],
            answer: 2,
            explain:
              "The gap stays, the count goes on. Your table now demonstrates the machine's laws with your own data — the best kind of proof.",
          },
        },
        {
          task: "Record it: '-- Day 4' section in week2.sql — the CREATE, your INSERTs, the ghost experiment — comments above each explaining why.",
          input:
            "Paste your Day 4 section of week2.sql, and the id sequence your table shows now (e.g. 1, 2, 4, 5, 6) with one sentence on where the gap came from",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "bug-hospital",
      optional: true,
      title: "🏥 Challenge: the bug hospital",
      intro:
        "Six broken statements came in from the school clinic's new booking system overnight — every one written by someone still getting used to AUTO_INCREMENT. Read the patient, work out what its author MEANT, and run the statement that actually does it. Nobody hands you the answer in here.",
      setup: {
        databases: [{ name: "clinic" }],
        use: "clinic",
      },
      tasks: [
        {
          goal: "Patient 1 refuses to run:  CREATE TABLE patients ( id INT AUTO_INCREMENT, name VARCHAR(30), reason VARCHAR(30) );  — Error 1075: there can be only one auto column and it must be defined as a key. Build the table the author meant.",
          solution:
            "CREATE TABLE patients ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30), reason VARCHAR(30) );",
          explain:
            "AUTO_INCREMENT can't stand alone — it has to ride on the PRIMARY KEY. A counter with no key to be unique on isn't a counter, it's a suggestion.",
        },
        {
          goal: "Patient 2 also refuses:  INSERT INTO patients VALUES ('Ana', 'checkup');  — Error 1136: column count doesn't match value count. Ana really did come in for a checkup — record it correctly.",
          solution: "INSERT INTO patients (name, reason) VALUES ('Ana', 'checkup');",
          explain:
            "Two values for a three-column table, because id was left out of the count along with the VALUES. Name what you're providing and the machine covers the rest.",
        },
        {
          goal: "Patient 3 tried to book two people at once and got a syntax error:  INSERT INTO patients (name, reason) VALUES ('Ben', 'sprain') AND ('Cara', 'fever');  — Ben and Cara both need to be added, in one statement.",
          solution:
            "INSERT INTO patients (name, reason) VALUES ('Ben', 'sprain'), ('Cara', 'fever');",
          explain:
            "AND joins conditions in a WHERE — it has no job inside VALUES. A comma is what chains one row onto the next.",
        },
        {
          goal: "Patient 4 ran clean and changed nothing:  DELETE FROM patients WHERE id = 'three';  — Cara (the third patient added) has left without being seen. Remove her row for real.",
          solution: "DELETE FROM patients WHERE id = 3;",
          explain:
            "id is a number column, and no number equals the word 'three' — so the WHERE matched nothing and the server reported a cheerful 0 rows affected. Quotes around a word that was never meant to be text, same trap as an UPDATE's quiet miss.",
        },
        {
          goal: "Patient 5 is a second table, and it won't build:  CREATE TABLE followups ( note VARCHAR(30) PRIMARY KEY AUTO_INCREMENT, visit_date DATE );  — Error 1063: incorrect column specifier. Build a followups table with a proper self-numbering id, plus the note and visit_date columns.",
          solution:
            "CREATE TABLE followups ( id INT PRIMARY KEY AUTO_INCREMENT, note VARCHAR(30), visit_date DATE );",
          explain:
            "AUTO_INCREMENT only works on a whole-number column — a text 'note' column can be the key, but it can never count itself upward. The fix is the same every time: a dedicated INT id, not a repurposed text field.",
        },
        {
          goal: "Patient 6, typo edition:  ALTER TABLE followupz AUTO_INCREMENT = 50;  — Error 1146: table doesn't exist. The clinic wants followups' next id to start at 50 — run the line that actually reaches it.",
          solution: "ALTER TABLE followups AUTO_INCREMENT = 50;",
          explain:
            "One missing letter and the whole statement aims at nothing. Ward's empty — six statements a working developer could have written on a rushed morning, and you fixed every one by reading what the server actually said.",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      optional: true,
      title: "🔬 Challenge: your second table, built like a professional",
      intro:
        "real-lab turned your week-1 design into a real table. This one starts from nothing: a second table, your own idea, built the professional way from the first keystroke — with one deliberate mistake and one experiment you run on purpose.",
      missions: [
        {
          task: "Pick a second thing to track — something different from your first table (a workout log, a reading list, matches in a game, anything). In your real Workbench (USE school;), write the flagship CREATE line from memory — id INT PRIMARY KEY AUTO_INCREMENT — followed by at least 3 columns of your own with sensible types, and run it.",
          check: {
            question: "You typed the flagship line without looking it up. What are its three parts, in order?",
            choices: [
              "id INT, then PRIMARY KEY, then AUTO_INCREMENT — column, constraint, machine",
              "AUTO_INCREMENT first so the server reserves the counter, then id INT PRIMARY KEY",
              "PRIMARY KEY first, since nothing else can be defined without it",
            ],
            answer: 0,
            explain:
              "The column comes first, then what kind of column it is (a key), then the upgrade (self-numbering). Every table you build from now on opens the same way.",
          },
        },
        {
          task: "Fill it with at least 5 rows of real data, using column-list INSERTs — never typing an id. Then run one INSERT with NO column list on purpose, so you hit Error 1136 for real, and read exactly what it says.",
          check: {
            question: "Why deliberately trigger an error you already know how to avoid?",
            choices: [
              "So Workbench logs it as a warning instead of a real error next time",
              "It doesn't help — errors you cause on purpose don't teach anything",
              "Reading a real 1136 on your own table cements what the column list is actually for, better than being told",
            ],
            answer: 2,
            explain:
              "Errors you triggered on purpose are errors you'll recognize instantly when they happen by accident. That recognition is the whole point of doing it here, safely, on data you can rebuild.",
          },
        },
        {
          task: "Run the ghost-gap experiment on your own data: DELETE one row from the middle (aim by id), INSERT one more row, then SELECT * and find the gap.",
          check: {
            question: "You deleted id 3 out of 1–5, then inserted a new row. What id does it get?",
            choices: [
              "3 — the machine notices the gap and fills it",
              "6 — the counter continues past the biggest id it has ever issued, gap or no gap",
              "It depends on how many rows the table has left",
            ],
            answer: 1,
            explain:
              "Same law as visitors, Ramon, and everyone else today — your table is just proving it with data only you invented.",
          },
        },
        {
          task: "Turn in the paperwork.",
          input:
            "Paste your maintenance log: the CREATE TABLE, your column-list INSERTs, the exact 1136 error text you triggered, and the id sequence your table shows now (e.g. 1, 2, 4, 5, 6) with one sentence on where the gap came from",
        },
      ],
    },
    {
      kind: "upload",
      id: "export-own-table",
      title: "📤 Export the table you designed yourself",
      intro:
        "The table you sketched in a text file in week 1 is now a real table on a real server, built the professional way. Export it — this is the first thing in this course that is entirely your own idea, built entirely by you.",
      steps: [
        "In MySQL Workbench: Server → Data Export.",
        "Tick the `school` schema, then tick BOTH tables beside it — `students` and the one you designed.",
        'Choose "Export to Self-Contained File" and name it `week2-<yourname>.sql`.',
        'Keep "Include Create Schema" ticked, then Start Export.',
        "Upload the file below.",
      ],
      proves:
        "your own table — the one whose name and columns you invented in week 1 (playlists, players, episodes, stock, whatever you chose). Its CREATE TABLE should show `id INT PRIMARY KEY AUTO_INCREMENT` first, then your columns, and it should hold real rows of your own data.",
      screenshotFallback:
        "Export not cooperating? Upload a screenshot instead: your table's CREATE statement (right-click the table → Copy to Clipboard → Create Statement, pasted somewhere visible) plus a SELECT * showing your rows. Say you did this in today's turn-in box.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-counting-golem",
    title: "⚔️ Boss battle: The Counting Golem",
    intro:
      "The Counting Golem never forgets a number it has issued and never hands one out twice. Beat it by thinking exactly the way it does.",
    boss: { name: "the Counting Golem", emoji: "🗿" },
    questions: [
      {
        prompt: "What does AUTO_INCREMENT do?",
        choices: [
          "Speeds up SELECT queries",
          "Fills the key column of each new row with the next number, automatically",
          "Recalculates every id whenever the table is queried",
        ],
        answer: 1,
        explain:
          "A numbered-ticket machine on the key column: you provide the data, it provides the identity.",
      },
      {
        prompt: "Which line creates a self-numbering key?",
        code: "A) id INT PRIMARY KEY AUTO_INCREMENT\nB) id INT AUTO_NUMBER\nC) id COUNTER PRIMARY KEY",
        choices: [
          "id INT PRIMARY KEY AUTO_INCREMENT",
          "id INT AUTO_NUMBER",
          "id COUNTER PRIMARY KEY",
        ],
        answer: 0,
        explain:
          "One word, one underscore: AUTO_INCREMENT, riding on the key. The week's flagship line.",
      },
      {
        prompt: "Why does the machine need to sit on a KEY column?",
        choices: [
          "It doesn't — any column works",
          "Keys make counting faster",
          "Its whole point is producing unique identifiers — MySQL requires the auto column to be a key",
        ],
        answer: 2,
        explain:
          "An auto-number that could repeat or go missing would be pointless. MySQL enforces the pairing: auto columns must be defined as a key.",
      },
      {
        prompt: "INSERT INTO visitors VALUES ('Paolo'); fails on a two-column auto-id table. Why?",
        choices: [
          "MySQL still needs an explicit NULL typed in for the id, even though it's automatic",
          "Without a column list, the server expects a value for EVERY column — one value for two columns is Error 1136",
          "Auto tables forbid INSERT entirely",
        ],
        answer: 1,
        explain:
          "The fix is the column list: INSERT INTO visitors (name) VALUES ('Paolo'); — name what you provide, the machine covers the id.",
      },
      {
        prompt: "Your table's ids are 1, 2, 3. You DELETE id 3, then INSERT a new row. Its id is…",
        choices: ["4", "3", "1"],
        answer: 0,
        explain:
          "The counter tracks the biggest number ever issued — deleting a row doesn't give its number back. 3 is retired.",
      },
      {
        prompt: "Why is never-reusing numbers a GOOD thing?",
        choices: [
          "It isn't — it wastes numbers",
          "It makes the table take up less storage",
          "An old id may still be written down elsewhere — reusing it would make old records silently point at the wrong row",
        ],
        answer: 2,
        explain:
          "Paolo's ticket 4 might live on in a receipt, a message, a report. If Ana got 4 later, every old reference would quietly lie. Gaps are the price of truth, and they're cheap.",
      },
      {
        prompt: "Gaps in an id column (1, 2, 5, 8) usually mean…",
        choices: [
          "The table is corrupted",
          "Rows were deleted — the gaps are ghosts, and they're completely normal",
          "Someone typed the ids wrong",
        ],
        answer: 1,
        explain:
          "A healthy, well-used table accumulates gaps. Trying to 'fix' them by renumbering is how old references get broken.",
      },
      {
        prompt: "What does ALTER TABLE orders AUTO_INCREMENT = 1000; do?",
        choices: [
          "Moves the counter so the next row gets id 1000",
          "Renumbers all of the table's existing rows starting at 1000",
          "Limits the table to 1000 rows",
        ],
        answer: 0,
        explain:
          "Handy for meaningful starting points — order numbers from 1000, this year's tickets from 2600001. Forward only; it won't re-enter used territory. Existing rows keep the ids they already have.",
      },
      {
        prompt: "Can you still insert an EXPLICIT id into an auto table?",
        choices: [
          "No — the machine has exclusive control",
          "Yes, but only on a table that has no rows yet",
          "Yes — and the counter adjusts to continue past it",
        ],
        answer: 2,
        explain:
          "Provide an id and it's used (the key still checks it's unique); insert id 500 and the next auto row gets 501. The machine yields to explicit choices, then keeps counting from the front.",
      },
      {
        prompt: "Where do you SEE that an unfamiliar table has an auto-numbering id?",
        choices: [
          "The CREATE TABLE statement is the only place it's ever recorded",
          "DESCRIBE — the id row shows Extra: auto_increment",
          "You can't tell without inserting a row",
        ],
        answer: 1,
        explain:
          "DESCRIBE is the table's honest résumé: types, Null, Key: PRI, and Extra: auto_increment. Read it before you insert into anything you didn't build.",
      },
      {
        prompt: "Yesterday you typed ids by hand (Paolo gets 4, Ana gets 5). What does today make of that job?",
        choices: [
          "The server's job now — humans stop choosing ids, so human id mistakes stop happening",
          "Still necessary for small tables",
          "Optional, depending on whether the table already has data in it",
        ],
        answer: 0,
        explain:
          "Tuesday's duplicate 3 existed because a human chose it. Structure beats vigilance, part two: give the machine the boring job it can't get wrong.",
      },
      {
        prompt: "The complete modern INSERT for a visitors(id auto, name) table:",
        code: "A) INSERT INTO visitors (name) VALUES ('Liza');\nB) INSERT INTO visitors VALUES (NULL, 'Liza');\nC) Both A and B put Liza in with a machine-chosen id",
        choices: ["Only A works", "Only B works", "C — both work, and A is the habit to keep"],
        answer: 2,
        explain:
          "NULL into an auto column also triggers the machine — but the column list says what you MEAN. Write A; recognize B when you see it in the wild.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The machine's three laws in your own words.",
      "Why a deleted id never coming back protects old records.",
      "One question you still have.",
      "Paste today's SQL.",
    ],
    note: "Done with time to spare? The two challenge steps above — the bug hospital and your second table — are waiting, and they're where today's skills get properly interesting. Tomorrow: no new commands at all — you assemble the whole week into week2.sql, rebuild what deserves rebuilding, and face the Warden.",
  },
};
