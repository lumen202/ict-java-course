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
          hint: "One INSERT, two groups: VALUES ('Marco'), ('Jen');",
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
          explain:
            "Error 1136: column count doesn't match. Without a column list the server expects a value for EVERY column — including id. Two escapes: provide both values, or (better) name the columns you're providing. The column list isn't decoration; it's the contract.",
        },
        {
          goal: "Add Paolo properly.",
          solution: "INSERT INTO visitors (name) VALUES ('Paolo');",
          hint: "The modern way: INSERT INTO visitors (name) VALUES ('Paolo');",
          explain: "Ticket 4 for Paolo. Error read, lesson learned, row in.",
        },
        {
          goal: "Paolo leaves. Delete his row (aim with his id — it's a real key now, so the aim is guaranteed).",
          solution: "DELETE FROM visitors WHERE id = 4;",
          hint: "DELETE FROM visitors WHERE id = 4;",
          explain:
            "1 row affected. Monday's verb, Wednesday's aim, no seatbelt complaint — a WHERE on a key column is exactly the aim safe mode trusts. Now… what happened to the number 4?",
        },
        {
          goal: "Add Ana and then look at the table — watch which id she gets.",
          solution: "INSERT INTO visitors (name) VALUES ('Ana');\nSELECT * FROM visitors;",
          hint: "Insert her (name only), then SELECT * to see the ids.",
          explain:
            "1, 2, 3, 5 — Ana got FIVE, not 4. The counter remembers the biggest number it ever issued and never reuses one. The 4 is retired with Paolo's row: if ticket 4 is written down anywhere else in the world, it can never accidentally mean Ana. Gaps aren't damage; they're integrity.",
        },
        {
          goal: "Move the counter: make the next visitor's number 100.",
          solution: "ALTER TABLE visitors AUTO_INCREMENT = 100;",
          hint: "ALTER TABLE visitors AUTO_INCREMENT = 100;",
          explain:
            "Counter repositioned. (It only jumps forward — the server won't let it move back into numbers already used.) The video did this with 1000 for order numbers; same idea.",
        },
        {
          goal: "Prove it: add Ramon and show the table.",
          solution: "INSERT INTO visitors (name) VALUES ('Ramon');\nSELECT * FROM visitors;",
          hint: "Insert (name only), then SELECT.",
          explain:
            "Ramon holds ticket 100. From 1-2-3-5 straight to 100 — and the next visitor gets 101. You now know everything the machine does: counts forward, never repeats, never fills gaps, and takes id-typing off your hands forever.",
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
            "A fresh start, the modern way: pick the database, build the self-numbering table, add a visitor (name only), then look.",
          lines: [
            "USE school;",
            "CREATE TABLE visitors ( id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) );",
            "INSERT INTO visitors (name) VALUES ('Liza');",
            "SELECT * FROM visitors;",
          ],
          explain:
            "The week-1 skeleton (USE → table → rows → question) with week-2 muscles: the key and the machine are in the CREATE, and the INSERT names only what you provide.",
        },
        {
          prompt:
            "One CREATE TABLE, assembled: the self-numbering id first, then name, then adopted_on — mind the commas.",
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
            "The repair ritual, in ceremony order: preview the junk, remove it, then inspect the whole table.",
          lines: [
            "SELECT * FROM students WHERE name = 'test';",
            "DELETE FROM students WHERE name = 'test';",
            "SELECT * FROM students;",
          ],
          explain:
            "Preview, delete, verify — the WHERE identical in steps one and two, the final SELECT confirming the survivors. This order is not style; it's the safety system.",
        },
        {
          prompt:
            "Wednesday's whole drama in four lines: repair the duplicate, lock the table, and only then trust an insert with a fresh id.",
          lines: [
            "UPDATE students SET id = 4 WHERE name = 'Paolo';",
            "ALTER TABLE students ADD PRIMARY KEY (id);",
            "INSERT INTO students VALUES (9, 'Ana', 9);",
            "SELECT * FROM students ORDER BY id;",
          ],
          explain:
            "Clean → lock → grow → verify. The ALTER would refuse to run before the UPDATE (duplicate 3!), and the INSERT after the lock is checked by the server itself. Dependencies decide the order, exactly like week 1's puzzle taught.",
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
              "Which columns YOU are providing — everything else is the server's job",
              "Which columns exist in the table",
              "The order rows will be sorted in",
            ],
            answer: 0,
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
              "Yesterday's judgement call: unless a column is truly unique and never blank, rows need a manufactured true name",
              "Every table legally requires exactly four columns",
              "The id makes the table alphabetical",
            ],
            answer: 0,
            explain:
              "Songs repeat titles, players share names, stock items share prices. The manufactured id is the honest answer for most real tables — and now the server maintains it for free.",
          },
        },
        {
          task: "Fill it: at least five rows of your real data, using column-list INSERTs — never typing an id. Then SELECT * and watch the numbers the server chose.",
          check: {
            question: "What should the id column show after five inserts?",
            choices: [
              "1 through 5, in insert order, chosen by the server",
              "Five random numbers",
              "NULL until you fill them in",
            ],
            answer: 0,
            explain:
              "Fresh machine, five tickets, perfect sequence. Every future row extends it without you thinking about ids ever again.",
          },
        },
        {
          task: "Make a ghost: DELETE one middle row (aim by id — enjoy how safe that feels on a keyed table), then INSERT one more row and SELECT. Find the gap and the new number.",
          check: {
            question: "You deleted id 3 and inserted a new row. The new row's id is…",
            choices: [
              "6 — the counter continues past the biggest ever issued; 3 is retired",
              "3 — the machine fills gaps first",
              "0 — deleted numbers reset the counter",
            ],
            answer: 0,
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
      kind: "upload",
      id: "export-own-table",
      title: "📤 Export the table you designed yourself",
      intro:
        "The table you sketched on a piece of paper in week 1 is now a real table on a real server, built the professional way. Export it — this is the first thing in this course that is entirely your own idea, built entirely by you.",
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
          "Fills the key column of each new row with the next number, automatically",
          "Speeds up SELECT queries",
          "Counts how many times a table is used",
        ],
        answer: 0,
        explain:
          "A numbered-ticket machine on the key column: you provide the data, it provides the identity.",
      },
      {
        prompt: "Which line creates a self-numbering key?",
        code: "A) id INT PRIMARY KEY AUTO_INCREMENT\nB) id INT AUTO_NUMBER\nC) id COUNTER PRIMARY KEY",
        choices: ["A", "B", "C"],
        answer: 0,
        explain:
          "One word, one underscore: AUTO_INCREMENT, riding on the key. The week's flagship line.",
      },
      {
        prompt: "Why does the machine need to sit on a KEY column?",
        choices: [
          "Its whole point is producing unique identifiers — MySQL requires the auto column to be a key",
          "Keys make counting faster",
          "It doesn't — any column works",
        ],
        answer: 0,
        explain:
          "An auto-number that could repeat or go missing would be pointless. MySQL enforces the pairing: auto columns must be defined as a key.",
      },
      {
        prompt: "INSERT INTO visitors VALUES ('Paolo'); fails on a two-column auto-id table. Why?",
        choices: [
          "Without a column list, the server expects a value for EVERY column — one value for two columns is Error 1136",
          "Paolo is a reserved word",
          "Auto tables forbid INSERT entirely",
        ],
        answer: 0,
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
          "An old id may still be written down elsewhere — reusing it would make old records silently point at the wrong row",
          "It isn't — it wastes numbers",
          "Big numbers look more professional",
        ],
        answer: 0,
        explain:
          "Paolo's ticket 4 might live on in a receipt, a message, a report. If Ana got 4 later, every old reference would quietly lie. Gaps are the price of truth, and they're cheap.",
      },
      {
        prompt: "Gaps in an id column (1, 2, 5, 8) usually mean…",
        choices: [
          "Rows were deleted — the gaps are ghosts, and they're completely normal",
          "The table is corrupted",
          "Someone typed the ids wrong",
        ],
        answer: 0,
        explain:
          "A healthy, well-used table accumulates gaps. Trying to 'fix' them by renumbering is how old references get broken.",
      },
      {
        prompt: "What does ALTER TABLE orders AUTO_INCREMENT = 1000; do?",
        choices: [
          "Moves the counter so the next row gets id 1000",
          "Deletes the first 1000 rows",
          "Limits the table to 1000 rows",
        ],
        answer: 0,
        explain:
          "Handy for meaningful starting points — order numbers from 1000, this year's tickets from 2600001. Forward only; it won't re-enter used territory.",
      },
      {
        prompt: "Can you still insert an EXPLICIT id into an auto table?",
        choices: [
          "Yes — and the counter adjusts to continue past it",
          "No — the machine has exclusive control",
          "Only on Sundays",
        ],
        answer: 0,
        explain:
          "Provide an id and it's used (the key still checks it's unique); insert id 500 and the next auto row gets 501. The machine yields to explicit choices, then keeps counting from the front.",
      },
      {
        prompt: "Where do you SEE that an unfamiliar table has an auto-numbering id?",
        choices: [
          "DESCRIBE — the id row shows Extra: auto_increment",
          "The table's name ends in _auto",
          "You can't tell without inserting a row",
        ],
        answer: 0,
        explain:
          "DESCRIBE is the table's honest résumé: types, Null, Key: PRI, and Extra: auto_increment. Read it before you insert into anything you didn't build.",
      },
      {
        prompt: "Yesterday you typed ids by hand (Paolo gets 4, Ana gets 5). What does today make of that job?",
        choices: [
          "The server's job now — humans stop choosing ids, so human id mistakes stop happening",
          "Still necessary for small tables",
          "Illegal",
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
    note: "Tomorrow: no new commands at all — you assemble the whole week into week2.sql, rebuild what deserves rebuilding, and face the Warden.",
  },
};
