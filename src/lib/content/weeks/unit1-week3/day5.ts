// unit1-week3 · Day 5 — Prove it — assemble the audit and face the final boss
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Prove it — assemble the audit and face the final boss",
  warmupGame: {
    kind: "typing",
    id: "warmup-day5",
    title: "⌨️ Warm-up: the whole week, from memory",
    intro:
      "No video today, no new syntax — just proof. Twelve statements covering everything week 3 taught: the link, the errors it fires, and all three ways of reading two tables as one. Every round is one whole statement from memory. If these flow out of your fingers, the audit is genuinely yours.",
    rounds: [
      {
        prompt: "Every session, every file: work inside the school database.",
        template: "{USE school;}",
        explain: "week3.sql opens with this line — it continues a world week 1 created.",
      },
      {
        prompt:
          "The flagship: create the sales table born linked — sale_id INT as primary key, snack_id INT, sold_on DATE, qty INT, and the foreign key pointing snack_id at snacks(snack_id).",
        template:
          "{CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT, FOREIGN KEY (snack_id) REFERENCES snacks(snack_id) );}",
        explain:
          "The whole week in one statement: a child table that refuses lies from birth. FOREIGN KEY names the local column; REFERENCES names the parent and its column.",
      },
      {
        prompt: "Read the sales table's guarantees — where would you SEE the link?",
        template: "{DESCRIBE sales;}",
        explain: "snack_id shows Key: MUL — the server's own note that this column points at another table.",
      },
      {
        prompt:
          "Read both notebooks as one: every sale that has a partner — snack name and quantity, matching sales to snacks on snack_id.",
        template:
          "{SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;}",
        explain:
          "INNER keeps only the matches. On the messy ledger this returned 7 of 10 sales — the other three vanished without a word.",
      },
      {
        prompt:
          "The flop hunt: every snack, with its sales beside it — keeping ALL the snacks, even the ones that never sold. Select snacks.name and sales.qty.",
        template:
          "{SELECT snacks.name, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;}",
        explain:
          "LEFT keeps every row of the left table. The snacks nobody bought show up with NULL partners — that's how you found Gulaman and Pastillas.",
      },
      {
        prompt:
          "The same full-snack-list audit, written the other way around: start FROM sales, and use the join that keeps all of snacks.",
        template:
          "{SELECT snacks.name, sales.qty FROM sales RIGHT JOIN snacks ON sales.snack_id = snacks.snack_id;}",
        explain:
          "sales RIGHT JOIN snacks keeps all of snacks — the same rows as the LEFT JOIN above, tables swapped. Direction is about which table keeps all its rows, not about left and right on your screen.",
      },
      {
        prompt: "Lock a ledger that already exists: add the foreign key to sales, pointing snack_id at snacks(snack_id).",
        template: "{ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks(snack_id);}",
        explain:
          "The Day 4 move. The server checks every existing row first — one ghost left in the table and this refuses with 1452. Clean, then lock.",
      },
      {
        prompt:
          "Before anyone even THINKS about deleting Turon (snack 2) from the snack list: preview which sales reference it.",
        template: "{SELECT * FROM sales WHERE snack_id = 2;}",
        explain:
          "Rows here mean the DELETE would be refused with 1451 — the link protects every parent that's still referenced. The preview tells you before the server has to.",
      },
      {
        prompt: "The Day 4 repair: ghost sale 4 was mis-written Kwek-kwek — point its snack_id at 3.",
        template: "{UPDATE sales SET snack_id = 3 WHERE sale_id = 4;}",
        explain: "Aim, then change — week 2's careful verb doing week 3's repair work.",
      },
      {
        prompt:
          "The professional INSERT: add a new snack to the list — snack_id 7, named 'Taho', price 10 — naming your columns.",
        template: "{INSERT INTO snacks (snack_id, name, price) VALUES (7, 'Taho', 10);}",
        explain: "The column list is the contract: name what you provide, in the order you provide it.",
      },
      {
        prompt:
          "A question only a join can answer: snack names and quantities for every sale, biggest quantity first.",
        template:
          "{SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id ORDER BY sales.qty DESC;}",
        explain: "Join first, then aim the ORDER BY — qualified names all the way through.",
      },
      {
        prompt:
          "The smudged entry: record sale 11 with NO snack number — snack_id unknown — sold on '2026-08-15', quantity 1.",
        template: "{INSERT INTO sales (sale_id, snack_id, sold_on, qty) VALUES (11, NULL, '2026-08-15', 1);}",
        explain:
          "The lock lets this through: a foreign key refuses fake parents, not unknown ones. NULL means 'not recorded', and that honesty is allowed. That's the week — all of it, from memory.",
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "sql-console",
      id: "week3-gauntlet",
      title: "🖥️ The whole week, on a ledger you've never seen",
      intro:
        "Not the canteen. The school library keeps two records — the books it owns and every loan it has ever written down — and they disagree in exactly the ways you now know how to find. Everything this week taught is in here, deliberately out of order: you'll join before you lock, and read errors from Monday next to errors from Thursday, because that's how they'll actually turn up.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "books",
                columns: [
                  { name: "book_id", type: "INT", pk: true },
                  { name: "title", type: "VARCHAR(50)" },
                  { name: "shelf", type: "VARCHAR(20)" },
                ],
                rows: [
                  ["1", "Noli Me Tangere", "A1"],
                  ["2", "Florante at Laura", "A2"],
                  ["3", "Dekada 70", "B1"],
                  ["4", "Mga Ibong Mandaragit", "B2"],
                  ["5", "Banaag at Sikat", "C1"],
                ],
              },
              {
                name: "loans",
                columns: [
                  { name: "loan_id", type: "INT", pk: true },
                  { name: "book_id", type: "INT" },
                  { name: "borrowed_on", type: "DATE" },
                ],
                rows: [
                  ["1", "1", "2026-08-10"],
                  ["2", "3", "2026-08-10"],
                  ["3", "9", "2026-08-11"],
                  ["4", "1", "2026-08-11"],
                  ["5", null, "2026-08-12"],
                  ["6", "2", "2026-08-12"],
                  ["7", "9", "2026-08-13"],
                  ["8", "3", "2026-08-13"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal: "Read the shelf list first: every book the library owns.",
          solution: "SELECT * FROM books;",
          hint: "SELECT * FROM books;",
          explain:
            "Five books, each with a real book_id. This is the parent record — the one the loans are supposed to point at.",
        },
        {
          goal: "Now the loan book: every loan on record. Count the rows and look hard at the book_id column.",
          solution: "SELECT * FROM loans;",
          hint: "SELECT * FROM loans;",
          explain:
            "Eight loans — and book 9 appears twice, though no such book exists, while loan 5 has no book_id at all. Nobody has stopped the librarian writing either of those down, because nothing links these two tables yet.",
        },
        {
          goal: "Read them together: every loan with the title of the book it names. Show the title and the date.",
          solution:
            "SELECT books.title, loans.borrowed_on FROM loans INNER JOIN books ON loans.book_id = books.book_id;",
          hint: "INNER JOIN books ON loans.book_id = books.book_id — and qualify both columns you select.",
          predict: {
            question: "Eight loans went in. How many rows does this INNER JOIN give back?",
            choices: [
              "8 — a join never loses rows, it only adds columns",
              "5 — the three loans with no real partner drop out silently",
              "6 — only the two book-9 loans are lost; the NULL still matches",
            ],
            answer: 1,
            explain:
              "INNER JOIN outputs pairs. The two book-9 loans have no partner, and NULL matches nothing at all — so three loans vanish without a word of warning.",
          },
          explain:
            "Five rows out of eight. No error, no note — the three problem loans simply aren't in the answer. This is why the whole week exists.",
        },
        {
          goal: "Ask the join for the plain book_id column — SELECT book_id, without saying which table.",
          solution: "SELECT book_id FROM loans INNER JOIN books ON loans.book_id = books.book_id;",
          predict: {
            question: "BOTH tables have a column called book_id. What does the server do?",
            choices: [
              "Picks the left table's copy, since that's the one named first",
              "Returns both copies side by side and lets you choose",
              "Refuses to guess — it throws an 'ambiguous' error",
            ],
            answer: 2,
            explain:
              "The server will not pick for you. When a name exists on both sides of a join, you have to say which one you mean.",
          },
          explain:
            "Error 1052: Column 'book_id' in field list is ambiguous. Once two tables are in play, unqualified names stop being safe.",
        },
        {
          goal: "Fix it with a dot: the same query, but say you mean the loans table's copy.",
          solution: "SELECT loans.book_id FROM loans INNER JOIN books ON loans.book_id = books.book_id;",
          explain:
            "One dot, no ambiguity. Get in the habit of qualifying everything in a join and 1052 stops happening to you.",
        },
        {
          goal: "Now the other direction — show what the INNER JOIN hid on the BOOKS side: every book's title next to its loan id, keeping every book even if nobody borrowed it.",
          solution:
            "SELECT books.title, loans.loan_id FROM books LEFT JOIN loans ON books.book_id = loans.book_id;",
          hint: "LEFT JOIN keeps every row of the table written to the LEFT of the join words.",
          predict: {
            question: "Five books, five matched loans. How many rows come back?",
            choices: [
              "7 — the 5 matches, plus one row each for the two books nobody borrowed",
              "5 — one row per book, always",
              "8 — one row per loan, always",
            ],
            answer: 0,
            explain:
              "A LEFT JOIN keeps every left-hand row. Matched books appear once per loan; unmatched books appear once, with NULL where the loan would be.",
          },
          explain:
            "Seven rows — and two of them have NULL in loan_id. Those are the books gathering dust, and the INNER JOIN never mentioned them.",
        },
        {
          goal: "Flip it to audit the loans instead: every loan with its book's title, keeping every loan even when the book doesn't exist.",
          solution:
            "SELECT loans.loan_id, books.title FROM loans LEFT JOIN books ON loans.book_id = books.book_id;",
          predict: {
            question: "How many rows, and how many of them have NULL in the title column?",
            choices: [
              "5 rows, 0 NULLs — same as the INNER JOIN",
              "8 rows, 2 NULLs — only the two book-9 loans are unexplained",
              "8 rows, 3 NULLs — both book-9 loans AND the one with no book_id",
            ],
            answer: 2,
            explain:
              "Every loan is kept. Three of them can't be explained: loans 3 and 7 point at a book that doesn't exist, and loan 5 points at nothing at all.",
          },
          explain:
            "Eight rows, three NULLs — the exact three the INNER JOIN threw away. Same data, opposite question: LEFT JOIN is how you find what's missing.",
        },
        {
          goal: "Thursday's move. Try to lock the loan book as it stands: add a FOREIGN KEY on loans.book_id pointing at books.book_id.",
          solution:
            "ALTER TABLE loans ADD FOREIGN KEY (book_id) REFERENCES books (book_id);",
          predict: {
            question: "Loans 3 and 7 still point at book 9, which doesn't exist. What happens?",
            choices: [
              "The lock is refused — the server checks every existing row before agreeing to enforce it",
              "The lock goes on and the two bad loans are deleted automatically",
              "The lock goes on — a foreign key only checks rows added from now on",
            ],
            answer: 0,
            explain:
              "A constraint is a promise about the whole table, present and future. The server won't make one the data already breaks.",
          },
          explain:
            "Error 1452. Exactly like Wednesday's primary key: clean first, then lock. Now go find what's dirty.",
        },
        {
          goal: "Pin down the damage: show every loan whose book_id is 9 — the book that doesn't exist.",
          solution: "SELECT * FROM loans WHERE book_id = 9;",
          hint: "A plain week-1 WHERE on the loans table — no join needed for this one.",
          explain:
            "Loans 3 and 7. The LEFT JOIN told you three loans were unexplained; this tells you exactly which two share a single cause. Loan 5's blank is a different problem, and you're going to leave that one alone.",
        },
        {
          goal: "The librarian remembers: both book-9 loans were really Dekada 70, which is book 3. Repair loan 3.",
          solution: "UPDATE loans SET book_id = 3 WHERE loan_id = 3;",
          hint: "A week-2 UPDATE, aimed by the loan's own key.",
          explain:
            "One row affected. Week 2's verb doing week 3's work — the skills stop being separate from here on.",
        },
        {
          goal: "Repair the other one the same way: loan 7 was also Dekada 70.",
          solution: "UPDATE loans SET book_id = 3 WHERE loan_id = 7;",
          explain:
            "Both ghosts gone. Loan 5 still has no book_id — and that one you're going to leave exactly as it is.",
        },
        {
          goal: "Lock it now: add the FOREIGN KEY again.",
          solution: "ALTER TABLE loans ADD FOREIGN KEY (book_id) REFERENCES books (book_id);",
          predict: {
            question: "The ghosts are fixed, but loan 5's book_id is still NULL. Does that block the lock?",
            choices: [
              "Yes — a foreign key column can never hold NULL",
              "No — a foreign key checks values that are present; NULL is an honest 'unknown', not a lie",
              "Yes, unless you delete loan 5 first",
            ],
            answer: 1,
            explain:
              "This is the one rule people get wrong all week. A foreign key forbids POINTING AT NOTHING REAL. It permits not pointing at all.",
          },
          explain:
            "Locked, NULL and all. The library's two records can no longer contradict each other.",
        },
        {
          goal: "Prove the lock is live: try to write a new loan for book 9 again — loan 9, book 9, on 2026-08-14.",
          solution: "INSERT INTO loans VALUES (9, 9, '2026-08-14');",
          predict: {
            question: "Book 9 still doesn't exist, but now the lock is on. What happens?",
            choices: [
              "It's accepted — the constraint only checked the rows that existed when you added it",
              "It's accepted but book_id is silently set to NULL",
              "Error 1452 — the exact write that succeeded an hour ago now bounces",
            ],
            answer: 2,
            explain:
              "The difference between a clean table and a guarded one: before the lock this row went straight in and nobody noticed for days.",
          },
          explain:
            "Refused, at the moment of writing. The error you spent Thursday hunting can no longer be created in the first place.",
        },
        {
          goal: "Attack from the parent side: try to remove Dekada 70 (book 3) from the shelf list.",
          solution: "DELETE FROM books WHERE book_id = 3;",
          predict: {
            question: "Loans 2, 3, 7 and 8 all point at book 3 now. What does the server say?",
            choices: [
              "Error 1451 — deleting it would strand every loan pointing at it",
              "Error 1452 — the same error as the bad insert",
              "It's deleted, and those loans' book_id becomes NULL",
            ],
            answer: 0,
            explain:
              "1452 guards the child ('you may not point at nothing'); 1451 guards the parent ('you may not remove what is still pointed at'). Two directions, two codes.",
          },
          explain:
            "Error 1451. The link protects both ends — you cannot orphan a row from either side.",
        },
        {
          goal: "Try the same delete on a book nobody has ever borrowed: remove Banaag at Sikat, book 5.",
          solution: "DELETE FROM books WHERE book_id = 5;",
          predict: {
            question: "No loan points at book 5. What happens this time?",
            choices: [
              "Refused — once a foreign key exists, no parent row can ever be deleted",
              "Allowed — no loan points at it, so no promise would be broken",
              "Refused, unless you drop the foreign key first",
            ],
            answer: 1,
            explain:
              "The constraint isn't a blanket ban on deleting parents. It blocks exactly the deletions that would break a promise, and nothing else.",
          },
          explain:
            "Gone, no complaint. That's the difference between a rule and a wall — and the LEFT JOIN in task 6 is what told you this book was safe to remove.",
        },
        {
          goal: "One last error, on purpose: ask the join for loans.title.",
          solution: "SELECT loans.title FROM loans INNER JOIN books ON loans.book_id = books.book_id;",
          predict: {
            question: "The loans table has no title column — books does. What comes back?",
            choices: [
              "1052 — the name is ambiguous between the two tables",
              "It works — the join merges the tables, so any column is reachable by any name",
              "1054 — unknown column, and the message names exactly where it looked",
            ],
            answer: 2,
            explain:
              "A join doesn't merge the tables into one thing. Each dotted name is checked against the table you named, and 'loans.title' isn't there.",
          },
          explain:
            "Error 1054: Unknown column 'loans.title' in 'field list'. 1052 means 'which one did you mean?'; 1054 means 'that isn't there at all'. Read the code, not just the red.",
        },
        {
          goal: "No help from here. The librarian wants Dekada 70's borrowing history: every loan of book 3, showing the title and the date, most recent first.",
          solution:
            "SELECT books.title, loans.borrowed_on FROM loans INNER JOIN books ON loans.book_id = books.book_id WHERE books.book_id = 3 ORDER BY loans.borrowed_on DESC;",
          explain:
            "Four loans — the two Dekada 70 already had, plus the two you repaired into it. A join, a filter and a sort in one statement, composed from nothing but the question.",
        },
        {
          goal: "Last one, entirely your own: prove the ledger is clean. Show every loan id together with its book's title, ordered by the book's title — and confirm the only blank left is the one you chose to keep.",
          solution:
            "SELECT loans.loan_id, books.title FROM loans LEFT JOIN books ON loans.book_id = books.book_id ORDER BY books.title;",
          explain:
            "Eight loans, one NULL — loan 5, the honest unknown. You started with three unexplained rows and finished with a locked pair of tables where only the truth can be written. That's the week.",
        },
      ],
    },
    {
      kind: "order",
      id: "order-week3-file",
      title: "🧩 Puzzle: the audit in the right order",
      intro:
        "Before you assemble your real week3.sql, assemble a model one. This week the order isn't just good style — the foreign key ENFORCES it: parent before child, clean before lock. Two rounds also hide lines that must be left out entirely; picking one tells you why the server would have refused it.",
      rounds: [
        {
          prompt:
            "A week3.sql in miniature: header comment first, USE next, both CREATEs before any rows (parent table first — the child's foreign key needs it to exist), then the parent's row before the child's row, and the question-comment directly above its query.",
          lines: [
            "-- week3.sql — the canteen ledger audit",
            "USE school;",
            "CREATE TABLE snacks ( snack_id INT PRIMARY KEY, name VARCHAR(50), price INT );",
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT, FOREIGN KEY (snack_id) REFERENCES snacks(snack_id) );",
            "INSERT INTO snacks VALUES (1, 'Banana cue', 15);",
            "INSERT INTO sales VALUES (1, 1, '2026-08-10', 4);",
            "-- Which snacks sold, and how many?",
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          ],
          explain:
            "week3.sql opens with USE, not CREATE DATABASE — it continues the story week1.sql started. The foreign key dictates the rest: snacks must exist before sales can reference it, and Banana cue must be on the list before a sale of it can be logged. Dependencies decide everything.",
        },
        {
          prompt:
            "Day 4's clean-then-lock ceremony: hunt the ghosts with the LEFT JOIN first, repair sale 4 before sale 10, and lock last. One line in the pile does not belong in this build at all — leave it out.",
          lines: [
            "SELECT sales.sale_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
            "UPDATE sales SET snack_id = 3 WHERE sale_id = 4;",
            "UPDATE sales SET snack_id = 3 WHERE sale_id = 10;",
            "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks(snack_id);",
          ],
          distractors: [
            "DELETE FROM snacks WHERE snack_id = 1;",
          ],
          explain:
            "Find with LEFT JOIN, repair with aimed UPDATEs, lock with ALTER — the ritual in full. The DELETE had to stay out: Banana cue has sales pointing at it, so once the lock is on, the server refuses that line with 1451 — and before the lock, running it would have manufactured brand-new ghosts.",
        },
        {
          prompt:
            "Rebuild a linked pair from nothing: parent table born first, child born linked, both tables built before any rows, parent row before child row. One CREATE in the pile is an impostor — leave it out.",
          lines: [
            "CREATE TABLE snacks ( snack_id INT PRIMARY KEY, name VARCHAR(50), price INT );",
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT, FOREIGN KEY (snack_id) REFERENCES snacks(snack_id) );",
            "INSERT INTO snacks VALUES (5, 'Siopao', 25);",
            "INSERT INTO sales VALUES (8, 5, '2026-08-13', 3);",
          ],
          distractors: [
            "CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT );",
          ],
          explain:
            "The impostor is the sales table WITHOUT the foreign key — tempting, because it's the only line in the pile that could run before its parent exists. That freedom is exactly what's wrong with it: an unlinked ledger accepts every ghost. Born linked or not at all.",
        },
      ],
    },
    {
      kind: "quest",
      id: "teach-it-back",
      title: "🧠 Quest: teach it back",
      intro:
        "The week's strongest test, back again: you understand what you can explain to someone who doesn't know it. Imagine a younger cousin who helps at the canteen. Five ideas, your own words — no SQL keywords unless you explain them as you go.",
      missions: [
        {
          task: "Explain to your cousin why the canteen keeps TWO notebooks — a snack list and a sales log — instead of writing everything into one big one.",
          check: {
            question: "The heart of that explanation:",
            choices: [
              "One notebook would fill up faster, and paper is expensive",
              "Each snack's name and price live in ONE place — write them into every sale and the two-hundredth Turon entry can disagree with the first",
              "Two notebooks look more professional to the student council",
            ],
            answer: 1,
            explain:
              "Say a fact once, reference it everywhere. If 'Turon, 12 pesos' were copied into every sale, one typo makes the notebooks argue with themselves — and nobody knows which copy is true.",
          },
        },
        {
          task: "Explain what the link between the notebooks PROMISES — and who does the enforcing.",
          check: {
            question: "Which is the promise a foreign key actually makes?",
            choices: [
              "Every snack on the list will eventually appear in the sales log",
              "The two tables always have the same number of rows",
              "Every snack number written in the sales log must exist in the snack list — and the SERVER refuses any entry that breaks this, not your carefulness",
            ],
            answer: 2,
            explain:
              "The promise points from child to parent: no sale may claim a snack that isn't real. It says nothing about snacks that never sold — flops are legal, lies are not. And the server is the enforcer, every insert, every time.",
          },
        },
        {
          task: "Explain what a join DOES — how one question can be answered from two notebooks — including what the matching rule (the ON) is for.",
          check: {
            question: "The best picture of a join:",
            choices: [
              "For each sale, look up its snack number in the snack list and read the two rows side by side as one answer — the matching rule says which columns must agree",
              "Copy both tables into one bigger table permanently",
              "The server guesses which rows belong together by their position",
            ],
            answer: 0,
            explain:
              "It's the finger-on-two-pages move you did by hand in Monday's warm-up, done by the server at full speed. Nothing is copied or changed — the combined rows exist only in the answer.",
          },
        },
        {
          task: "Explain the difference between the strict reading (INNER) and the keep-everything reading (LEFT) — and why the canteen audit needed both.",
          check: {
            question: "Which pairing is right?",
            choices: [
              "INNER shows every row from both tables; LEFT shows only matches",
              "INNER keeps only rows with a partner — non-matches vanish silently; LEFT keeps every row of one chosen table and fills the missing partners with NULL",
              "They return the same rows in a different order",
            ],
            answer: 1,
            explain:
              "The audit needed both because each hides what the other reveals: INNER answered 'what sold?', but only LEFT could expose the flops that never sold and the ghost sales nothing could explain.",
          },
        },
        {
          task: "Final mission: deliver the two-notebooks explanation OUT LOUD to an actual person at home — or to yourself in a voice recording. Note where you stumbled.",
          input:
            "Paste your explanations, and name the spot where saying it out loud was harder than thinking it",
        },
      ],
    },
    {
      kind: "quest",
      id: "assemble-file",
      title: "📦 Quest: assemble week3.sql",
      intro:
        "Four days of links, joins, repairs and locks — scattered across labs and Workbench tabs. Turn it into one file that reads top to bottom like the audit's story. The reader, as always, is you in three weeks.",
      missions: [
        {
          task: "Open week3.sql. Check the skeleton: header comment, then USE school;, then a '-- Day N' section per day in order. Anything you did in a lab but never filed, rescue it from Workbench's history now.",
          check: {
            question: "week1.sql, week2.sql, week3.sql — run in order on a completely empty server, what happens?",
            choices: [
              "Only week1.sql runs — the others need the originals",
              "They replay the entire course: week 1 builds the world, week 2 cleans and locks it, week 3 links it — which is why week3.sql opens with USE, not CREATE DATABASE",
              "Nothing — .sql files can't run without the Workbench tabs that made them",
            ],
            answer: 1,
            explain:
              "Files build on files. Three files now rebuild everything you've made since the first day of the course, from nothing — that replay-ability is the whole reason order and comments matter.",
          },
        },
        {
          task: "Order check: CREATE snacks must come before CREATE sales, every INSERT into snacks before the sales rows that reference it, and your Day 4 ghost repairs BEFORE the ALTER TABLE … ADD FOREIGN KEY line. If any of that is out of order, fix it until the file would actually run.",
          check: {
            question: "Who enforces this week's file order?",
            choices: [
              "Nobody — it's a style preference",
              "Workbench, which sorts statements before running them",
              "The server itself: a child CREATE fails without its parent, a child row bounces off 1452 without its parent row, and the lock refuses a table that still holds ghosts",
            ],
            answer: 2,
            explain:
              "In week 1 the order was good manners; this week it's law. Every dependency in the file is one the foreign key physically enforces — a wrongly ordered week3.sql doesn't just read badly, it stops.",
          },
        },
        {
          task: "Comment pass: every audit query gets its question written above it; every repair UPDATE gets its why; and each deliberate error — the ghost insert that fired 1452, the Turon delete that fired 1451 — ends with a comment recording what the server said.",
          check: {
            question: "Your file contains statements you KNEW would fail when you ran them. Why do they belong in it?",
            choices: [
              "With the observed-error comment, each one is a recorded experiment — proof of what the lock refuses and why, which the succeeding lines can't show",
              "They don't — a clean file should hold only statements that succeed",
              "Failed statements run faster the second time",
            ],
            answer: 0,
            explain:
              "The successes show what the ledger accepts; the refusals show what it protects against. An audit that never poked the lock never really tested it — the comment is what turns an error into evidence.",
          },
        },
        {
          task: "Read the whole file aloud, top to bottom, saying what each line does and why it sits in that position. Fix anything you can't justify.",
          input:
            "Paste your file from the header through the ALTER TABLE … ADD FOREIGN KEY line, and write the number of statements the full file now contains",
        },
      ],
    },
    {
      kind: "upload",
      id: "export-week3-db",
      title: "📤 Export the whole week and hand it in",
      intro:
        "The unit's closing export. Your school database now holds linked pairs — the canteen ledger locked tight, and the pair you designed yourself. Export it as it stands at the end of week 3 and hand it in. Next week, a Java program connects to exactly this.",
      steps: [
        "In MySQL Workbench: Server → Data Export.",
        "Tick the `school` schema and every table inside it — `students`, your own week-2 table, `snacks`, `sales`, and the child table you designed on Day 4.",
        'Choose "Export to Self-Contained File", name it `week3-final-<yourname>.sql`.',
        'Keep "Include Create Schema" ticked, then Start Export and wait for the green tick.',
        "Upload the file below.",
      ],
      proves:
        "the week's work on YOUR data: `sales` carrying a real `FOREIGN KEY` back to `snacks`, the smudged NULL sale the lock allowed in, the repaired ghosts pointing at snack 3 — and beside them, the parent/child pair YOU designed on Day 4, with your own foreign key and the rows you chose. Nobody else's file has that pair.",
      screenshotFallback:
        "Still fighting the export? Upload a screenshot of the SCHEMAS panel with all your tables expanded, plus a SELECT * from `sales` and from your own child table, and say so in today's turn-in box. Bring the export problem to class — you'll want it working before the Java week.",
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own work",
      steps: [
        "Open week3.sql and your Workbench next to this page, and mark each line below ✅ or ❌ honestly.",
        "week3.sql exists, starts with a header comment and USE school;, and has a '-- Day N' section for each day.",
        "The `snacks` and `sales` tables exist on my real server, and DESCRIBE sales; shows snack_id with Key: MUL.",
        "My sales table refuses ghosts: I inserted a sale with snack_id 9 on purpose and got error 1452 — the attempt and the server's answer are recorded as a comment in my file.",
        "I tried to DELETE a snack that still has sales and got 1451; deleting one with no sales worked — and I can say why the server treated them differently.",
        "The smudged NULL sale is in my table — proof I know the foreign key permits an unknown parent, just never a fake one.",
        "My file has an INNER JOIN, a LEFT JOIN and a RIGHT JOIN query, each with its question written as a comment above it.",
        "In my file, both ghost repairs come BEFORE the ALTER TABLE … ADD FOREIGN KEY line, so the lock lands on a clean table.",
        "My own parent/child pair from Day 4 exists: my week-2 table is the parent, my designed child carries a foreign key to it, and both hold rows I chose.",
        "I met 1452, 1451, 1052 and 1054 on purpose at least once this week, and for each I can say in one sentence what it refuses and what the fix is.",
        "For every ❌: fix it now. Everything you need is in this week's four days, and the day is yours.",
      ],
      tip: "This list is the audit the student council would run on Aling Nena's books — you're just running it on your own. Lines 3 and 8 are ones every linked pair you ever build should pass.",
      submit:
        "Paste the checklist with your ✅ / ❌ marks, and note what you had to go back and fix.",
    },
    {
      kind: "quest",
      id: "data-story",
      optional: true,
      title: "🏔️ Challenge: a data story of your own",
      intro:
        "The whole week ran on the canteen's question. This challenge runs on yours: one question about school life you actually wonder about that takes TWO linked tables to answer — then you build the tables, link them, fill them, and let a join answer it.",
      missions: [
        {
          task: "Choose your question and your pair. It must genuinely need two tables — one list of things, one log of events about those things (players and their match scores, books and their borrowings, org members and their attendance). Decide which table is the parent.",
          input:
            "Write your question, name both tables, and say which one is the parent and why",
        },
        {
          task: "Build the pair in your real Workbench: CREATE the parent with a primary key, then the child born linked — its foreign key pointing at the parent. Run DESCRIBE on both to check the lock took.",
          input: "Paste both CREATE TABLE statements",
        },
        {
          task: "Fill it with honest data — at least 4 parent rows and 8 child rows, drawn from real life as best you can remember it. Then write the join that answers your question, and run it.",
          input: "Paste your INSERTs and the join query",
        },
        {
          task: "Read your result grid and answer your own question in plain words — one or two sentences, like you were telling a friend what the data said. Add the whole experiment to week3.sql under a '-- Data story' comment.",
          input:
            "Write your question's answer in plain words, and one thing the data told you that you didn't expect",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week-three-warden",
    title: "⚔️ Final boss: The Week Three Warden",
    intro:
      "The Warden guards the gate to the Java weeks and asks about everything — Monday's link, Tuesday's strict reading, Wednesday's full audit, Thursday's repair and lock. Nothing here is new; all of it is yours. Take the gate.",
    boss: { name: "the Week Three Warden", emoji: "👑" },
    questions: [
      {
        prompt: "The exact promise of this clause:",
        code: "FOREIGN KEY (snack_id) REFERENCES snacks(snack_id)",
        choices: [
          "The two tables will always have the same number of rows",
          "Every snack_id written into sales must already exist in snacks — the server refuses anything else",
          "Every snack in snacks must appear in sales at least once",
        ],
        answer: 1,
        explain:
          "The promise points from child to parent: no fake parents, ever. It says nothing about parents that go unreferenced — Pastillas never selling breaks no rule.",
      },
      {
        prompt: "The canteen pair: snacks and sales. Which table carries the FOREIGN KEY, and why?",
        choices: [
          "snacks — the parent should control its children",
          "Both tables carry one, pointing at each other",
          "sales — the child carries the link, because each sale is the one making a claim ('I sold snack 9') that needs checking",
        ],
        answer: 2,
        explain:
          "The FK lives where the claims are made. The snack list asserts nothing about sales; every sales row asserts a snack exists — so that's the side the server must check.",
      },
      {
        prompt: "Error 1452 appears. What just happened?",
        choices: [
          "A child row tried to reference a parent that doesn't exist — the ghost bounced off the lock",
          "Someone deleted a parent that still had children",
          "Two rows tried to share a primary key",
        ],
        answer: 0,
        explain:
          "1452 is the wall working on the way IN: an insert or update offered a snack_id the snack list can't vouch for, and the server refused it. The fix: correct the id, or add the parent first.",
      },
      {
        prompt: "And error 1451?",
        choices: [
          "A SELECT referenced a column that doesn't exist",
          "A DELETE (or key change) aimed at a parent that children still reference — refused, or its sales would become orphans",
          "The same as 1452, from an older MySQL version",
        ],
        answer: 1,
        explain:
          "1451 guards the other door: nothing referenced may vanish. Delete or repoint the child rows first, and only then may the parent go.",
      },
      {
        prompt: "The smudged entry — a sale with NO snack number:",
        code: "INSERT INTO sales (sale_id, snack_id, sold_on, qty) VALUES (7, NULL, '2026-08-13', 1);",
        choices: [
          "Refused with 1452 — NULL isn't in the snack list",
          "Refused — foreign key columns can never be empty",
          "Accepted — a foreign key refuses fake parents, not unknown ones",
        ],
        answer: 2,
        explain:
          "NULL means 'not recorded', and the lock lets honesty through. Unknown is legal; fake is not. That one sale taught the finest distinction of the week.",
      },
      {
        prompt: "Ten sales, six snacks, and the INNER JOIN returned 7 rows. Where did the other three go?",
        choices: [
          "Nowhere visible — INNER JOIN keeps only rows with a partner, so the two ghosts and the NULL sale vanished silently",
          "They were deleted from the sales table by the join",
          "They appear at the bottom of the grid with empty cells",
        ],
        answer: 0,
        explain:
          "No error, no warning — just 7 where you expected 10. INNER JOIN's silence is exactly why the audit needed Wednesday's LEFT and RIGHT to find what it hid. The tables themselves never change.",
      },
      {
        prompt: "After a join, this fails with error 1052. Why?",
        code: "SELECT snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
        choices: [
          "snack_id doesn't exist in either table",
          "BOTH tables have a snack_id column, and a bare name won't say which — qualify it: sales.snack_id",
          "You can only SELECT * after a join",
        ],
        answer: 1,
        explain:
          "1052 is 'ambiguous', not 'unknown' — the server found the column twice and refuses to guess. The dot rule fixes it: table.column, always, once two tables are in play.",
      },
      {
        prompt: "And this one fails with 1054. What does the message tell you?",
        code: "SELECT sales.name FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
        choices: [
          "It names the exact wrong claim: there is no `name` in sales — that column lives on snacks",
          "The join direction is wrong",
          "The ON clause is missing a table name",
        ],
        answer: 0,
        explain:
          "1054 means the qualified name pointed at a table that doesn't have that column. Read which table the message blames — the fix is usually just re-aiming the dot: snacks.name.",
      },
      {
        prompt: "The student council asks: 'which snacks NEVER sold?' Which query finds them?",
        choices: [
          "An INNER JOIN — the unsold snacks appear at the top",
          "SELECT * FROM snacks WHERE qty = 0;",
          "snacks LEFT JOIN sales, then read the grid for snacks whose sales columns came back NULL",
        ],
        answer: 2,
        explain:
          "Keep ALL the snacks, let the log fill in what it can — the flops are the rows with NULL partners. INNER can never find them: no partner means no row at all.",
      },
      {
        prompt: "True or false: `snacks LEFT JOIN sales` returns the same rows as `sales RIGHT JOIN snacks`.",
        choices: [
          "False — LEFT and RIGHT are different operations entirely",
          "True — both keep every row of snacks; the direction word names which side keeps all its rows, and swapping the tables swaps the word",
          "True, but only when the tables have the same number of rows",
        ],
        answer: 1,
        explain:
          "One idea, two spellings. Before any join, say out loud which table keeps all its rows — that sentence decides both the word and the table order.",
      },
      {
        prompt: "Day 4, the messy ledger, and you run this as-is:",
        code: "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks(snack_id);",
        choices: [
          "Refused with 1452 — the ghosts are still in the table, and a lock certifies existing data, never repairs it",
          "Accepted — the ghosts are deleted automatically",
          "Accepted — old rows are grandfathered in, only new inserts get checked",
        ],
        answer: 0,
        explain:
          "Same law as week 2's primary key: clean, then lock. The ritual is find (LEFT JOIN) → repair (aimed UPDATEs) → lock (ALTER) — and the server enforces that order by refusing every shortcut.",
      },
      {
        prompt: "With the lock on, someone runs DROP TABLE snacks; while sales still references it. Result?",
        choices: [
          "Both tables are deleted together",
          "snacks is dropped and sales keeps working with numbers that point at nothing",
          "Refused — the server won't drop a parent that a child table still references",
        ],
        answer: 2,
        explain:
          "The link protects the parent's very existence, not just its rows. To take the snack list down you'd have to unlink or drop the sales side first — the server never lets references dangle.",
      },
      {
        prompt: "Week 2 retrieval: PRIMARY KEY versus FOREIGN KEY, in one line each.",
        choices: [
          "PRIMARY KEY: this row's own identity — unique, never NULL. FOREIGN KEY: a pointer to ANOTHER table's identity, checked by the server",
          "They're two names for the same constraint",
          "PRIMARY KEY links tables; FOREIGN KEY numbers rows",
        ],
        answer: 0,
        explain:
          "The two keys are a team: the primary key gives a row a true name, and the foreign key is how other tables use that name safely. Week 2 built the first; week 3 aimed the second at it.",
      },
      {
        prompt: "This week in one sentence. Which is it?",
        choices: [
          "Memorize three join keywords",
          "Keep everything in one big table so no links are needed",
          "Link tables so lies can't get in, then read the linked tables as one answer — choosing the join that shows exactly what the question needs",
        ],
        answer: 2,
        explain:
          "Structure, then sight: the foreign key guards what gets written, the joins govern what you see. Next week a Java program starts asking these same tables questions — the gate is yours.",
      },
    ],
  },
  practice: {
    intro: "Last three things.",
    steps: [
      "Paste your complete week3.sql into the turn-in box below — every CREATE, INSERT, UPDATE, ALTER and join query, with the comment above each.",
      "Work through the self-check further down the page, answering each out loud before revealing the answer.",
      "Send the two-minute reflection — it's how you get a plan back for next week.",
    ],
    note: "Done early? The data-story challenge step above is an open ceiling — a linked pair about anything you actually care about. And a look ahead: next week Java itself starts talking to this database (JDBC) — every table you linked and locked this week is about to get a program for a customer.",
  },
};
