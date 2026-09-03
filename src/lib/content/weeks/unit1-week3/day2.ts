// unit1-week3 · Day 2 — Read two notebooks as one with INNER JOIN
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "Read two notebooks as one with INNER JOIN",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup-day2",
    title: "🕹️ Warm-up game: match the notebooks",
    intro:
      "Aling Nena's ORIGINAL messy sales log is back on your screen — the paper one, from before your foreign key existed. The snack notebook still lists: 1 Banana cue, 2 Turon, 3 Kwek-kwek, 4 Gulaman, 5 Siopao, 6 Pastillas. Yesterday you guarded the link; today you'll READ across it — and this warm-up is you doing, by hand, exactly what a join does.",
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
          "Yesterday's recall first: click every sale that could NEVER get into your locked table — the ghosts pointing at a snack that doesn't exist.",
        matches: [3, 9],
        sql: "SELECT * FROM sales WHERE snack_id = 9;\n-- your FOREIGN KEY refuses these with Error 1452.",
        explain:
          "Sales 4 and 10, still pointing at the imaginary snack 9. In this paper log they survive. Remember them — they're about to do a disappearing act.",
      },
      {
        question:
          "Now the big one. Click EVERY sale that has a partner in the snack notebook — a snack_id that appears in the list 1 to 6.",
        matches: [0, 1, 2, 4, 5, 7, 8],
        sql: "-- you just predicted an INNER JOIN:\nSELECT * FROM sales\nINNER JOIN snacks ON sales.snack_id = snacks.snack_id;\n-- 7 rows: exactly the ones you clicked.",
        explain:
          "Seven survivors. The two ghosts have no partner, and the smudged NULL matches nothing. Pairing rows that share a value IS the join — you just ran one in your head, before writing a single line of its syntax.",
      },
      {
        question:
          "A join matches ON a shared value. Click every sale the pairing rule 'sales.snack_id = 3' would connect to Kwek-kwek.",
        matches: [1, 8],
        sql: "SELECT * FROM sales\nINNER JOIN snacks ON sales.snack_id = snacks.snack_id\nWHERE snacks.name = 'Kwek-kwek';",
        explain:
          "Sales 2 and 9 both carry snack_id 3, so both pair with the Kwek-kwek row. One parent, many children — the ON rule connects each child to its match.",
      },
      {
        question:
          "Week-1 recall to finish: if you sorted this log by qty from LARGEST to smallest, which sale comes first? Click it.",
        matches: [4],
        sql: "SELECT * FROM sales ORDER BY qty DESC;",
        explain:
          "Sale 5 — six Turon in one go, the biggest sale on record. ORDER BY still works after a join, and you'll use exactly that this afternoon.",
      },
    ],
  },
  videos: [
    {
      title: "Learn MySQL joins in 5 minutes!",
      youtubeId: "G3lJAxg1cy8",
      length: "5:04",
      practice: {
        intro:
          "Five minutes, three kinds of join. Today is the INNER JOIN only — type along in a sandbox in your own Workbench:",
        steps: [
          "Pause at the INNER JOIN example and type it out yourself before he runs it.",
          "Say out loud what the ON line is comparing — which column of which table, to which column of which other table.",
        ],
        note: "The video also shows LEFT and RIGHT joins. Don't practice those yet — you'll rewatch exactly those parts tomorrow, when the missing rows become the whole lesson.",
      },
    },
  ],
  activities: [
    {
      kind: "typing",
      id: "typing-join",
      title: "⌨️ Type the join",
      intro:
        "A join has three parts your fingers must own: the JOIN itself, the ON rule that pairs the rows, and the table.column dots that say exactly which column you mean. Blanks first, whole thing from memory by the end.",
      rounds: [
        {
          prompt:
            "Read snack names next to sale quantities — start with the two words that combine the tables.",
          template:
            "SELECT snacks.name, sales.qty FROM sales {INNER JOIN} snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "INNER JOIN bolts a second table onto your FROM. 'Inner' means: keep only the rows that find a partner.",
        },
        {
          prompt: "Same query — now type the keyword that introduces the pairing rule.",
          template:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks {ON} sales.snack_id = snacks.snack_id;",
          explain:
            "ON is the matchmaker: it says which values must be equal for two rows to become one answer row. A join without ON has no idea who pairs with whom.",
        },
        {
          prompt: "Type the full pairing rule — both sides of the equals sign, dots included.",
          template:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON {sales.snack_id = snacks.snack_id};",
          explain:
            "table.column on both sides. Both tables have a column called snack_id, so the dots aren't decoration — they're the only way to say which one you mean.",
        },
        {
          prompt:
            "The select list needs dots too. Ask for the snack's NAME and the sale's QTY, fully qualified.",
          template:
            "SELECT {snacks.name}, {sales.qty} FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "snacks.name, sales.qty — table dot column. With two tables in play, get in the habit of dotting everything; it reads better and it can never be ambiguous.",
        },
        {
          prompt:
            "Add an aim: the same join, but only rows where the snack is Banana cue. Type the WHERE.",
          template:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id {WHERE snacks.name = 'Banana cue'};",
          explain:
            "ON pairs the rows; WHERE filters the pairs. Two different jobs — mixing them up is tomorrow's favorite bug, so learn the split today.",
        },
        {
          prompt: "From memory now: the whole basic join — snack names beside sale quantities.",
          template:
            "{SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;}",
          explain:
            "The full shape, from your own fingers: SELECT dotted columns, FROM child, INNER JOIN parent, ON the shared id. Every join you write this week is this skeleton wearing different clothes.",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "join-console",
      title: "🖥️ Mini server: side by side",
      intro:
        "This server holds BOTH of Aling Nena's original notebooks, mess included — the ghosts and the smudge got in, because this copy has no foreign key. That's on purpose: you're auditing the paper originals. Read each notebook alone, then join them and watch very carefully how many rows come back.",
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
              {
                name: "sales",
                columns: [
                  { name: "sale_id", type: "INT", pk: true },
                  { name: "snack_id", type: "INT" },
                  { name: "sold_on", type: "DATE" },
                  { name: "qty", type: "INT" },
                ],
                rows: [
                  ["1", "1", "2026-08-10", "4"],
                  ["2", "3", "2026-08-10", "2"],
                  ["3", "1", "2026-08-11", "5"],
                  ["4", "9", "2026-08-11", "3"],
                  ["5", "2", "2026-08-12", "6"],
                  ["6", "1", "2026-08-12", "2"],
                  ["7", null, "2026-08-13", "1"],
                  ["8", "5", "2026-08-13", "3"],
                  ["9", "3", "2026-08-14", "4"],
                  ["10", "9", "2026-08-14", "2"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal: "Read the snack notebook alone first. Note how many rows it has.",
          solution: "SELECT * FROM snacks;",
          hint: "SELECT * FROM snacks;",
          explain:
            "6 snacks, ids 1 to 6, honest prices. This notebook is clean — the mess is all in the other one.",
        },
        {
          goal: "Now the sales log alone. Count its rows too, and spot the trouble.",
          solution: "SELECT * FROM sales;",
          hint: "SELECT * FROM sales;",
          explain:
            "10 sales — including the two ghosts pointing at snack 9 and the smudged NULL. Hold both numbers in your head: 6 snacks, 10 sales. The next task's number matters.",
        },
        {
          goal:
            "Read them together: join the notebooks so every sale shows its snack's name and qty — SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          hint: "The exact statement is in the goal — type it dot for dot.",
          predict: {
            question: "10 sales went in. How many rows will this join return?",
            choices: [
              "7 — sales whose snack_id finds no partner simply drop out",
              "10 — a join shows every sale, matched or not",
              "16 — 6 snacks plus 10 sales, combined",
            ],
            answer: 0,
            explain:
              "INNER JOIN keeps only the rows that pair up. No partner, no appearance — no warning either.",
          },
          explain:
            "7 rows. Not an error, not a warning — three sales are just… gone. The ghosts (snack 9 twice) and the smudge (NULL) found no partner in snacks, and INNER JOIN silently leaves non-matches out. THE most important fact about joins: count what comes back.",
        },
        {
          goal:
            "Ask for the plain snack_id column from the join — SELECT snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id; — and see what the server thinks of that.",
          solution:
            "SELECT snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          predict: {
            question:
              "BOTH notebooks have a column called snack_id. What does the server do with the undotted name?",
            choices: [
              "Uses sales.snack_id — the first table in the FROM wins",
              "Shows both columns side by side",
              "Refuses to guess — it throws an 'ambiguous' error",
            ],
            answer: 2,
            explain:
              "The server would rather fail loudly than guess silently. Two candidates, zero dots — that's an error, every time.",
          },
          explain:
            "Error 1052: Column 'snack_id' in field list is ambiguous. 'Ambiguous' means: two tables both have one, and you didn't say which. The server refuses to pick for you — the fix is yours to type, next task.",
        },
        {
          goal:
            "Fix it with a dot: same query, but say WHICH snack_id you mean — the one from sales — alongside snacks.name.",
          solution:
            "SELECT sales.snack_id, snacks.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          hint: "Dot the column you were refused: sales.snack_id. Keep snacks.name next to it.",
          explain:
            "7 rows, no complaint. table.column is the cure for 1052 — and once two tables are in play, dotting EVERYTHING is the habit that means you never see 1052 again.",
        },
        {
          goal:
            "One more wrong turn, on purpose: ask the join for sales.name — SELECT sales.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          solution:
            "SELECT sales.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          predict: {
            question: "The sales table has NO name column — snacks does. What happens?",
            choices: [
              "Error — the server says the column is unknown, and its message names where it looked",
              "The server quietly borrows name from snacks, since the tables are joined",
              "Every row comes back with empty text in that column",
            ],
            answer: 0,
            explain:
              "A join pairs rows; it does NOT pour one table's columns into the other. Each column still belongs to its own table.",
          },
          explain:
            "Error 1054: Unknown column 'sales.name' in 'field list'. Read the message like a detective: it blames sales — you dotted the RIGHT way but at the WRONG table. 1052 means 'you didn't say which table'; 1054 means 'that table doesn't have it'. Different bugs, different fixes.",
        },
        {
          goal:
            "Now use the join to answer like an auditor: show the qty and date of every BANANA CUE sale — by name, not by number.",
          solution:
            "SELECT sales.qty, sales.sold_on FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snacks.name = 'Banana cue';",
          hint: "Join first, then aim the WHERE at snacks.name.",
          explain:
            "3 rows — sales 1, 3 and 6, found by NAME. Yesterday you memorized 'Banana cue is snack 1'; today the join looks it up for you. That's the whole point of reading two notebooks as one.",
        },
        {
          goal:
            "Auditors like order: show every matched sale as snacks.name, snacks.price, sales.qty — sorted by price, cheapest snack first.",
          solution:
            "SELECT snacks.name, snacks.price, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id ORDER BY snacks.price;",
          hint: "Your week-1 ORDER BY, dotted: ORDER BY snacks.price.",
          explain:
            "7 rows, Turon's 12-peso sales at the top, Siopao's 25 at the bottom. Everything you learned in weeks 1 and 2 — WHERE, ORDER BY — still works after a join; just remember the dots.",
        },
        {
          goal:
            "Look at what the join did to the SNACK side. Ask for just the names of every matched sale: SELECT snacks.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          solution:
            "SELECT snacks.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          predict: {
            question:
              "Banana cue is ONE row in the snacks notebook, and it was sold three times. How many times does its name appear here?",
            choices: [
              "Once — a snack is one row, so it appears once",
              "Three times — the join outputs one row per PAIR, and Banana cue pairs with three sales",
              "Six times — every snack pairs with every sale",
            ],
            answer: 1,
            explain:
              "A join returns pairs, not tables. One snack row paired with three sale rows is three pairs, so three output rows.",
          },
          explain:
            "Banana cue three times, Kwek-kwek twice, Turon and Siopao once each — 7 rows out of a 6-row notebook. This is the most confusing thing about joins in real work: a result can have MORE rows than either table you started with, and nothing is wrong. A join's row count is the number of matching PAIRS, and nothing else.",
        },
        {
          goal:
            "Does the order of the tables matter? Run the same read starting FROM snacks instead: snacks.name and sales.qty, snacks INNER JOIN sales.",
          solution:
            "SELECT snacks.name, sales.qty FROM snacks INNER JOIN sales ON snacks.snack_id = sales.snack_id;",
          predict: {
            question: "You swapped which table is named first. What changes?",
            choices: [
              "Nothing — the same 7 pairs; INNER JOIN protects neither side, so neither table is privileged",
              "You get 6 rows now, one per snack",
              "Error — the ON clause no longer matches the table order",
            ],
            answer: 0,
            explain:
              "INNER keeps pairs and only pairs. With nothing to protect, there is no left or right that matters — which is exactly what stops being true tomorrow.",
          },
          explain:
            "The same 7 rows. Remember this, because tomorrow it reverses: the moment a join has a protected side, which table you name first decides the whole answer. INNER JOIN is the one join where you can be careless about order, and that is not a habit worth forming.",
        },
        {
          goal:
            "Prove the pair-counting rule on one snack: show snacks.name and sales.sold_on for every Banana cue sale.",
          solution:
            "SELECT snacks.name, sales.sold_on FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snacks.name = 'Banana cue';",
          explain:
            "3 rows, all saying Banana cue, each with a different date. One notebook entry, three real events. If anyone ever asks you 'why does my report list this product three times?', this is the answer — and the fix is a question about what they wanted counted, not a bug in the join.",
        },
        {
          goal:
            "No help from here. The council asks: which snacks were sold on 2026-08-12, and how many of each? Answer with names and quantities.",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE sales.sold_on = '2026-08-12';",
          explain:
            "2 rows: 6 Turon and 2 Banana cue. You composed that from a plain-language question — join for the names, WHERE for the date. That's real auditing.",
        },
        {
          goal:
            "Last question, also on your own: on which dates did the canteen sell Kwek-kwek, and how many each time?",
          solution:
            "SELECT sales.sold_on, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snacks.name = 'Kwek-kwek';",
          explain:
            "2 rows — 2026-08-10 and 2026-08-14. Ten sales went into this console; your joins have been quietly showing you seven of them all along. Tomorrow's whole lesson is the other three.",
        },
      ],
    },
    {
      kind: "quest",
      id: "case-of-the-missing-rows",
      title: "🕵️ Quest: the case of the missing rows",
      intro:
        "Ten sales went into the join. Seven came out. No error, no warning, no note in the margin — three rows of real canteen history just didn't appear. An auditor who can't explain a disappearance isn't done. Explain all three.",
      missions: [
        {
          task: "Open the mini server's results in your memory (or re-run the join in the console above): 10 sales in, 7 rows out. First identify the missing.",
          check: {
            question: "Which three sales vanished from the INNER JOIN?",
            choices: [
              "Sales 8, 9 and 10 — the last three, joins cut off at seven rows",
              "Sales 4, 7 and 10 — the two snack-9 ghosts and the smudged NULL",
              "Sales 1, 2 and 3 — the oldest entries",
            ],
            answer: 1,
            explain:
              "Nothing about position or age — only about partners. The three rows whose snack_id matches no snack are exactly the three that vanished.",
          },
        },
        {
          task: "Take sale 4 alone: snack_id 9, three items, 2026-08-11. Explain its disappearance precisely.",
          check: {
            question: "Why is sale 4 not in the join result?",
            choices: [
              "The ON rule found no snacks row with snack_id 9, so sale 4 never formed a pair — and INNER JOIN only outputs pairs",
              "The join deleted it from the sales table",
              "MySQL raised an error on it and skipped it",
            ],
            answer: 0,
            explain:
              "The row is safe in sales — SELECT * FROM sales still shows all ten. The join didn't touch it; it just had nothing to pair it with, and unpaired rows don't appear.",
          },
        },
        {
          task: "Now sale 7 — the smudge, snack_id NULL. Yesterday the foreign key let this row IN. Today the join leaves it OUT. Reconcile that.",
          check: {
            question: "Why does the smudged sale survive the FK but vanish from the INNER JOIN?",
            choices: [
              "It doesn't vanish — NULL pairs with the first snack in the table",
              "The FK deleted its value, so the join can't see the row",
              "The FK permits NULL as 'honestly unknown', but ON needs an actual matching value — NULL equals nothing, so no pair forms",
            ],
            answer: 2,
            explain:
              "Two different questions: 'may this row exist?' (FK says yes) and 'does this row match?' (ON says no). NULL passes the first and fails the second. Unknown rows exist — they just can't shake hands.",
          },
        },
        {
          task: "Sale 10 is the second ghost — snack_id 9 again. One last angle: what would make it APPEAR in the join?",
          check: {
            question: "Which change would put sale 10 into the INNER JOIN result?",
            choices: [
              "Running the join twice — the second pass catches stragglers",
              "Adding ORDER BY sale_id so the join checks every row",
              "Giving it a partner: either fix its snack_id to a real snack, or add a snack with id 9",
            ],
            answer: 2,
            explain:
              "Appearance is about matching, nothing else. Repair the pointer or create the pointed-at — on Thursday you'll do the repair for real, and the join will show all the fixed rows.",
          },
        },
        {
          task: "Close the case in writing.",
          input:
            "In two or three sentences: where does INNER JOIN 'send' rows that have no match, and why is that more dangerous than an error message?",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet-day2",
      title: "📓 Quest: cheat sheet, day 2",
      intro:
        "Today's section is the join skeleton and the two column errors. Short entries, heavy use — every remaining day of this week writes joins on top of what you record now.",
      missions: [
        {
          task: "Add a Day 2 heading. From memory: the full INNER JOIN skeleton (SELECT dotted columns FROM child INNER JOIN parent ON child.col = parent.col). Under it, two one-liners: what ON does, and what WHERE does after a join. Then the dot rule in your own words.",
          check: {
            question: "Which one-liner pair belongs on the sheet?",
            choices: [
              "ON pairs rows across tables; WHERE then filters the paired rows",
              "ON filters rows; WHERE pairs the tables",
              "ON and WHERE are interchangeable after a join",
            ],
            answer: 0,
            explain:
              "Pair first, filter second. Keeping those jobs separate on your sheet keeps them separate in your queries.",
          },
        },
        {
          task: "Errors section, two new residents: 1052 (ambiguous — two tables have that column and you didn't dot it; fix: table.column) and 1054 (unknown column — you asked a table for a column it doesn't have; fix: read which table the message blames, dot the right one). One line each on when you met them today.",
          input:
            "Paste your Day 2 section — the join skeleton, the ON/WHERE one-liners, the dot rule, and both error entries with fixes",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: audit your own ledger",
      intro:
        "The console audited Aling Nena's messy paper originals. Your Workbench holds the REAL ledger — the one you built yesterday with the foreign key from birth. Run the same joins on it and notice how differently a guarded table behaves.",
      missions: [
        {
          task: "In your real Workbench: USE school; then run the audit join on your own pair — SELECT snacks.name, sales.qty, sales.sold_on FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id; — and COUNT the rows that come back against the rows in your sales table.",
          check: {
            question: "Your sales table has 8 rows. The console's had 10 and lost 3 in the join. How many does YOUR join lose, and why?",
            choices: [
              "3 — the same three rows always vanish from this data",
              "0 — a foreign key makes joins keep every row",
              "1 — only the smudged NULL sale; the ghosts never got into your table, because the FK refused them yesterday",
            ],
            answer: 2,
            explain:
              "This is the week's two lessons shaking hands: the FK kept the lies out at the door, so the join has almost nothing to lose. Only the honest unknown — NULL — still drops out.",
          },
        },
        {
          task: "Add a '-- Day 2' section to week3.sql. Record that join with a comment above it saying how many rows it returns and WHICH sale is missing (say it in the comment: the ghosts aren't missing — they were never let in).",
          check: {
            question: "Why is 'the join returns 7 of 8 rows' worth a comment in an audit file?",
            choices: [
              "A row count in a comment proves you READ the result, and tells the next reader what to expect before they run it",
              "Comments make the join run faster on big tables",
              "MySQL requires a comment above every join",
            ],
            answer: 0,
            explain:
              "Counting what comes back is the join discipline — writing the count down is what turns a query into an audit.",
          },
        },
        {
          task: "Fire today's errors on purpose, in the real tool: run SELECT snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id; and read the real 1052. Then fix it with a dot and run the fixed version. Add both to week3.sql — the broken one commented out with the error code noted.",
          check: {
            question: "Workbench shows the 1052 in the Output panel. What EXACTLY do you change to fix it?",
            choices: [
              "Remove the ON clause — it's confusing the server",
              "Nothing about the query — just the column name: write sales.snack_id (or snacks.snack_id) instead of plain snack_id",
              "Rename one table's snack_id column so the names differ",
            ],
            answer: 1,
            explain:
              "One dot, bug gone. (Renaming a column to dodge an error would break your foreign key AND your week3.sql — the cure is always to say which, never to make the question impossible.)",
          },
        },
        {
          task: "Finish the section: add one join query of YOUR OWN design that answers something you actually want to know about your canteen data (by name, with a WHERE or an ORDER BY), with a comment saying the question in plain words.",
          input:
            "Paste your Day 2 section of week3.sql — the audit join with its count comment, the commented 1052 pair, and your own question-plus-query",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "bug-hospital",
      title: "🏥 The bug hospital",
      intro:
        "Six patients, all joins that don't do what their author meant. Each task shows the broken statement — diagnose it and run the CORRECTED version. Five of them fail loudly; one runs perfectly and answers the wrong question, which is the one worth slowing down for. Both notebooks are already on the server.",
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
                ],
              },
              {
                name: "sales",
                columns: [
                  { name: "sale_id", type: "INT", pk: true },
                  { name: "snack_id", type: "INT" },
                  { name: "qty", type: "INT" },
                ],
                rows: [
                  ["1", "1", "4"],
                  ["2", "3", "2"],
                  ["3", "1", "5"],
                  ["4", "2", "6"],
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
            "Patient 1 — refuses to run:  SELECT snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;  The auditor wants the snack number of every sale. Run the corrected statement.",
          solution:
            "SELECT sales.snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "Both notebooks have a snack_id, so the bare name is ambiguous — 1052. One dot fixes it. (Either table's copy is right here, since the ON clause forces them equal; the server just refuses to guess which you meant.)",
        },
        {
          goal:
            "Patient 2 — refuses to run:  SELECT sales.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;  The auditor wants each sale's snack name and quantity. Run the corrected statement.",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "1054, not 1052 — the dot was confident and wrong. sales has no name column; only snacks does. A join doesn't merge the two tables into one pool of columns: each dotted name is checked against the table you actually named.",
        },
        {
          goal:
            "Patient 3 — refuses to run:  SELECT snacks.name FROM sales INNER JOIN snakcs ON sales.snack_id = snakcs.snack_id;  Run the corrected statement.",
          solution:
            "SELECT snacks.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "1146 — the table itself doesn't exist. Two letters swapped, and note the typo had to be fixed in BOTH places: the JOIN and the ON. A misspelled table name is the cheapest bug on this ward and the easiest to stare straight past.",
        },
        {
          goal:
            "Patient 4 — this one RUNS, with no error at all, and its answer is nonsense:  SELECT sales.sale_id, snacks.name FROM sales INNER JOIN snacks ON sales.sale_id = snacks.snack_id;  It should show each sale's id beside the snack that sale actually sold. Run the corrected statement.",
          solution:
            "SELECT sales.sale_id, snacks.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "The ON matched the sale's own id against the snack's id — a rule the server is perfectly happy to follow and which pairs completely unrelated rows. This is the most dangerous bug of the six, because nothing goes red. The ON clause is the whole meaning of a join; when a result looks odd, read it before you read anything else.",
        },
        {
          goal:
            "Patient 5 — refuses to run:  SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snack_id = 1;  The auditor wants only the Banana cue sales. Run the corrected statement.",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snacks.snack_id = 1;",
          explain:
            "1052 again — and read where it says it happened: 'in where clause'. Ambiguity isn't a SELECT-list problem, it's a whole-statement problem. Every place a shared name appears needs its dot.",
        },
        {
          goal:
            "Patient 6, last one — refuses to run:  SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id ORDER BY snack_id;  The auditor wants the list ordered by snack number. Run the corrected statement.",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id ORDER BY snacks.snack_id;",
          explain:
            "'in order clause' this time. Three clauses, one rule: once two tables are in play, a name they share is never safe undotted. Six patients, and four of them were a missing dot or a wrong one — which is exactly the proportion you'll meet in real work.",
        },
      ],
    },
    {
      kind: "quest",
      id: "write-a-bug",
      title: "🐞 Write a bug",
      intro:
        "Fixing bugs is skill; PLANTING one that fails exactly the way you intend is mastery. Author one broken join on purpose, predict its exact error, and prove your prediction in Workbench.",
      missions: [
        {
          task: "Design your bug: write a join query against your snacks/sales pair that will fail with EITHER 1052 (an undotted column both tables share) or 1054 (a dotted column the table doesn't have). Write it down — and before running it, write your answer key: the error code you expect and one line on why.",
          check: {
            question: "Your bugged query asks for snacks.sold_on. Which error is that, and why?",
            choices: [
              "1054 — snacks has no sold_on column; the dot points at the wrong table",
              "1052 — sold_on is ambiguous between the tables",
              "1452 — sold_on violates the foreign key",
            ],
            answer: 0,
            explain:
              "Only sales has sold_on, so blaming snacks for it is an unknown column — 1054. It could only be 1052 if BOTH tables had it and the dot were missing. If you can classify a bug before running it, you own both error codes.",
          },
        },
        {
          task: "Run your bugged query in Workbench and compare the real error against your answer key. If the server disagreed with your prediction, figure out why — that disagreement is the most valuable thing this challenge can produce. Then write the FIXED version and run it clean.",
          input:
            "Paste three things: your bugged query, your answer key (predicted error code + why), and what the server actually said — plus the fixed query if your prediction missed",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-silent-dropper",
    title: "⚔️ Boss battle: The Silent Dropper",
    intro:
      "The Silent Dropper never throws an error — it just makes rows quietly not appear and bets you won't count. You counted all day. Finish the audit.",
    boss: { name: "the Silent Dropper", emoji: "🕳️" },
    questions: [
      {
        prompt: "What does the ON clause in a join actually do?",
        choices: [
          "It filters the final result, like a second WHERE",
          "It states the pairing rule — which values must be equal for a row from each table to combine",
          "It chooses which columns appear in the output",
        ],
        answer: 1,
        explain:
          "ON is the matchmaker, nothing more: child.col = parent.col. Filtering is WHERE's job and the select list picks the columns — three clauses, three jobs.",
      },
      {
        prompt: "Which rows does an INNER JOIN keep?",
        choices: [
          "Only rows that find a partner under the ON rule — from either table, no partner means no appearance",
          "Every row of the first table, matched or not",
          "Every row of both tables, paired where possible",
        ],
        answer: 0,
        explain:
          "Inner = intersection. The keep-everything versions exist too — they're called LEFT and RIGHT, and they're tomorrow.",
      },
      {
        prompt: "10 sales joined against 6 snacks came back as 7 rows. Why 7 and not 10?",
        choices: [
          "Joins return at most 7 rows unless you add ORDER BY",
          "The server hit an error on the 8th row and stopped",
          "Three sales' snack_id values (9, 9 and NULL) matched no snack, so those rows formed no pair",
        ],
        answer: 2,
        explain:
          "The two ghosts and the smudge. The number 7 isn't magic — it's 10 minus every row without a partner. Counting in equals counting out, minus the unmatched.",
      },
      {
        prompt: "Where does an INNER JOIN 'send' the rows that don't match?",
        choices: [
          "Into a warnings list you can inspect afterwards",
          "Nowhere — they stay untouched in their table and simply don't appear in the result",
          "It deletes them, which is why you count rows",
        ],
        answer: 1,
        explain:
          "The most dangerous part is the silence: no error, no warning, tables unchanged. The only alarm that ever rings is you, comparing the row count to what you expected.",
      },
      {
        prompt: "Error 1052: Column 'snack_id' in field list is ambiguous. Translate.",
        choices: [
          "Both joined tables have a snack_id column and you didn't say which — fix it with table.column",
          "snack_id doesn't exist in either table",
          "snack_id contains NULL values, which can't be selected",
        ],
        answer: 0,
        explain:
          "Two candidates, zero dots. The server refuses to guess for you — one table.column dot ends the argument.",
      },
      {
        prompt: "And Error 1054: Unknown column 'sales.name' in 'field list'?",
        choices: [
          "name is ambiguous between the two tables",
          "The join hasn't finished loading the name column yet",
          "You asked the sales table for a column it doesn't have — name lives in snacks",
        ],
        answer: 2,
        explain:
          "The message names the table it searched. 1052 = you didn't say which table; 1054 = you said one, and it was wrong. Read the code, know the fix.",
      },
      {
        prompt: "What comes back?",
        code: "SELECT snack_id FROM sales\nINNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
        choices: [
          "7 rows of snack ids from the sales side",
          "Error 1052 — snack_id is ambiguous",
          "Error 1054 — snack_id is unknown after a join",
        ],
        answer: 1,
        explain:
          "The undotted snack_id could be either table's. Ironically the values would be identical — the server still refuses, because guessing is not its job.",
      },
      {
        prompt: "ON versus WHERE, after a join — which is the true division of labor?",
        choices: [
          "ON pairs rows across the tables; WHERE then filters the paired results",
          "ON filters, WHERE pairs",
          "They're interchangeable — pick whichever reads better",
        ],
        answer: 0,
        explain:
          "Pair, then filter. Your Banana cue query used both correctly: ON matched sales to snacks, WHERE kept only the pairs whose name was Banana cue.",
      },
      {
        prompt: "When two tables are joined, when do you need table.column dots?",
        choices: [
          "Only in the ON clause — everywhere else plain names are fine",
          "Never — the server works out what you mean from context",
          "Whenever a plain column name could belong to either table — and dotting everything is the habit that never bites",
        ],
        answer: 2,
        explain:
          "Strictly, only ambiguous names NEED dots. But 'is this one ambiguous?' is exactly the thought that slips — dot everything and the question disappears.",
      },
      {
        prompt: "Day-1 recall: what does FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) promise?",
        choices: [
          "Every sales.snack_id that holds a value points at a snack that really exists",
          "Every snack has at least one sale",
          "sales.snack_id values are unique",
        ],
        answer: 0,
        explain:
          "Existence, child-to-parent, values only (NULL passes). Yesterday's promise is why today's join on your REAL table lost almost nothing.",
      },
      {
        prompt: "Day-1 recall: 1452 and 1451 — which is which?",
        choices: [
          "1452 blocks deleting any row; 1451 blocks inserting any row",
          "1452 = child pointing at nothing (bad insert/update); 1451 = parent still pointed at (blocked delete)",
          "Both mean the foreign key was created incorrectly",
        ],
        answer: 1,
        explain:
          "Child lies → 1452. Parent leaves → 1451. Two directions of the same promise, and you fired both on purpose yesterday.",
      },
      {
        prompt:
          "The console's paper table lost 3 rows in the join; your real FK-guarded table lost only the NULL sale. What explains the difference?",
        choices: [
          "Real Workbench joins are more thorough than the mini server's",
          "Your table is smaller, and small tables match better",
          "The FK refused the ghosts at insert time, so your table holds no unmatched values except the honest NULL",
        ],
        answer: 2,
        explain:
          "Guard the door and the join has nothing to silently drop — except NULL, which the FK deliberately permits and the ON can never match. That NULL is tomorrow's opening mystery.",
      },
      {
        prompt: "Day-1 recall: the smudged sale has snack_id NULL. Which statements are true?",
        choices: [
          "The FK rejects it, and the join would show it if it existed",
          "The FK rejects it, and so does the join",
          "The FK accepts it, and the INNER JOIN leaves it out",
        ],
        answer: 2,
        explain:
          "Allowed to exist, unable to match. One row, both of this week's big ideas — if this question felt easy, today did its job.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "What INNER JOIN keeps and what it silently drops, in your own words.",
      "What surprised you or broke today (the vanishing rows? 1052?), and why it happened.",
      "One question you still have.",
      "Then paste the SQL you ran today.",
    ],
    note: "Three rows of canteen history are still missing from every join you ran. Tomorrow you learn the joins that refuse to lose anything — and find every last one. Finished early? The write-a-bug challenge above is open.",
  },
};
