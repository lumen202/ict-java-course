// unit1-week3 · Day 4 — Repair and lock the ledger
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day4: DayPlan = {
  day: "Day 4",
  focus: "Repair and lock the ledger",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup-day4",
    title: "🕹️ Warm-up game: everything you've caught this week",
    intro:
      "The messy sales log is back on your screen one last time, mistakes and all. The snack notebook still lists: 1 Banana cue, 2 Turon, 3 Kwek-kwek, 4 Gulaman, 5 Siopao, 6 Pastillas. Today you stop finding problems and start fixing them — but first, prove you can still spot every one.",
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
        question: "Click every ghost — a sale whose snack_id points at a snack that doesn't exist.",
        matches: [3, 9],
        sql: "SELECT * FROM sales WHERE snack_id = 9;",
        explain:
          "Sales 4 and 10, still claiming snack 9. Monday you learned a FOREIGN KEY would refuse these on the way in — today you find out what happens when they're already sitting in the table.",
      },
      {
        question: "Click the one smudged entry — the sale with no snack number at all.",
        matches: [6],
        sql: "SELECT * FROM sales WHERE snack_id IS NULL;",
        explain:
          "Sale 7, honestly unknown. Keep it separate in your head from the ghosts — one of these two problems is fixable this morning, the other one isn't a problem at all.",
      },
      {
        question:
          "Yesterday's tool, one more time: click every sale an INNER JOIN against the snack notebook would KEEP.",
        matches: [0, 1, 2, 4, 5, 7, 8],
        sql: "SELECT * FROM sales\nINNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
        explain:
          "Seven survivors, same seven as Tuesday. Nothing about the data has changed yet — you're just warming up every muscle you'll need for the repair.",
      },
      {
        question:
          "The notebook lists Gulaman (4) and Pastillas (6), and neither one sold all week. Click every sale here that names snack 4 or snack 6.",
        matches: [],
        sql: "SELECT * FROM sales WHERE snack_id = 4 OR snack_id = 6;",
        explain:
          "Nothing to click — and that IS the answer. A snack that never sold leaves no row in this ledger at all, so no amount of staring at sales will ever find it; only snacks LEFT JOIN sales can, because it starts from the notebook and keeps every snack whether a sale turned up or not. A flop isn't a repair job either — nobody buying Pastillas is a legal, honest fact. Only the ghosts are today's targets.",
      },
      {
        question:
          "Day-1 recall, aimed at a row you can actually see: on your real LOCKED table, DELETE FROM snacks WHERE snack_id = 2; (Turon) is refused, while deleting Pastillas would go straight through. Click the sale that is doing the refusing.",
        matches: [4],
        sql: "DELETE FROM snacks WHERE snack_id = 2;\n-- Error 1451 — sale 5 still points at Turon",
        explain:
          "Sale 5 — the only row still pointing at Turon. A lock doesn't just stop bad inserts: it protects a parent for as long as anything depends on it, and 1451 always means one specific child row is standing in the way. Nothing points at Pastillas, which is why deleting that one would be allowed. You'll fire this exact refusal for real today.",
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "typing",
      id: "typing-mixed",
      title: "⌨️ Type the whole toolkit, from memory",
      intro:
        "No new syntax today — one new arrangement of syntax you already own. Every round below is whole, from memory: the link, all three joins, and the move that locks a table that already has data in it.",
      rounds: [
        {
          prompt: "From memory: create sales linked from birth — sale_id (INT, PK), snack_id (INT), sold_on (DATE), qty (INT), FK on snack_id referencing snacks(snack_id).",
          template:
            "{CREATE TABLE sales ( sale_id INT PRIMARY KEY, snack_id INT, sold_on DATE, qty INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) );}",
          explain: "Monday's flagship line. Today you meet the version where the table was built WITHOUT this — and has to earn it.",
        },
        {
          prompt:
            "From memory: the strict read — each sale's snack name beside its quantity, keeping only matches. Select snacks.name then sales.qty, starting FROM sales.",
          template:
            "{SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;}",
          explain: "The strict read. Silent about anything unmatched — which is exactly why it's the wrong tool for hunting ghosts.",
        },
        {
          prompt:
            "From memory: every sale, even the ones no snack can explain — the ghost-hunting query. Select sales.sale_id then snacks.name, starting FROM sales.",
          template:
            "{SELECT sales.sale_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;}",
          explain: "This is today's detective. A ghost shows up as a real row with a NULL name — visible, not vanished.",
        },
        {
          prompt:
            "From memory: the same audit, written as a RIGHT JOIN instead — same two columns in the same order, but start FROM snacks, so sales is the table on the right.",
          template:
            "{SELECT sales.sale_id, snacks.name FROM snacks RIGHT JOIN sales ON snacks.snack_id = sales.snack_id;}",
          explain: "Same rows, mirrored spelling — sales stays protected because it's the table named after RIGHT JOIN.",
        },
        {
          prompt: "Now the new arrangement: lock a table that already exists and already has rows — start with the two words that begin every ALTER.",
          template: "{ALTER TABLE} sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);",
          explain: "ALTER TABLE changes a live table, the same way it added a PRIMARY KEY to your students table last week.",
        },
        {
          prompt: "Same statement — type the clause that adds the link to an existing table.",
          template: "ALTER TABLE sales {ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id)};",
          explain:
            "ADD FOREIGN KEY (col) REFERENCES parent(col) — the exact clause from Monday's CREATE, now bolted onto a table after the fact. The server checks every existing row before it agrees.",
        },
        {
          prompt: "From memory, the whole thing: lock a table called signups, adding a FOREIGN KEY on student_id referencing students(student_id).",
          template:
            "{ALTER TABLE signups ADD FOREIGN KEY (student_id) REFERENCES students (student_id);}",
          explain:
            "Different table, same move. Any child table you build without its FK on day one can still be locked later — as long as its data already deserves the lock.",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "cleanup-console",
      title: "🖥️ Mini server: lock the ledger",
      intro:
        "This server holds Aling Nena's messy originals — ghosts, smudge and all — with NO foreign key on sales. Your job: find every ghost, repair it, and only then add the lock. The server will refuse the lock until the data deserves it — exactly like your students table did last week.",
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
          goal:
            "Try the lock as-is: add a FOREIGN KEY to sales on snack_id, referencing snacks (snack_id).",
          solution:
            "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);",
          predict: {
            question:
              "Sales 4 and 10 point at snack 9, which doesn't exist. What happens when you try to lock this table?",
            choices: [
              "The lock succeeds — ALTER only checks NEW rows, not the ones already there",
              "The lock is refused — the server checks every existing row before it agrees to enforce the promise",
              "The lock succeeds, and the two ghost rows are deleted automatically to make room",
            ],
            answer: 1,
            explain:
              "A foreign key can't be a promise with exceptions already baked in. Before it agrees, the server checks the whole table — same as last week's PRIMARY KEY refusing dirty ids.",
          },
          explain:
            "Error 1452: Cannot add or update a child row: a foreign key constraint fails. The server named the exact same error your ghost INSERT hit on Monday — except this time it's protecting the table's PAST, not just its future. Clean first. Time to hunt.",
        },
        {
          goal:
            "Hunt every ghost and the smudge in one query: every sale with its snack's name, keeping sales that no snack can explain.",
          solution:
            "SELECT sales.sale_id, sales.snack_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          hint:
            "Wednesday's auditor query: FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id.",
          explain:
            "10 rows, 3 with NULL where a name should be: sales 4 and 10 (snack 9 — a ghost), and sale 7 (no snack_id at all). The LEFT JOIN doesn't just find problems — it just handed you the ghosts' exact sale_ids, which is exactly what a repair needs.",
        },
        {
          goal:
            "Turn that grid into a worklist. Yesterday's anti-join: the same LEFT JOIN, filtered down to only the rows that found no partner. Show sale_id and the sale's snack_id.",
          solution:
            "SELECT sales.sale_id, sales.snack_id FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snacks.snack_id IS NULL;",
          hint: "Keep the LEFT JOIN; add WHERE snacks.snack_id IS NULL — test the optional side.",
          explain:
            "3 rows: sales 4, 7 and 10. Ten rows became three, and those three are the entire job. On a ledger of ten you could have squinted at the previous grid; a repair list is what you'd need on a ledger of ten thousand, and it's the same two lines of SQL either way.",
        },
        {
          goal:
            "Now the distinction the whole week has been building to. Two of those three rows are LIES (a snack_id that names nothing) and one is an honest UNKNOWN (no snack_id at all). Get just the lies: add AND sales.snack_id IS NOT NULL.",
          solution:
            "SELECT sales.sale_id, sales.snack_id FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snacks.snack_id IS NULL AND sales.snack_id IS NOT NULL;",
          predict: {
            question: "Which sales survive both conditions?",
            choices: [
              "All three — 4, 7 and 10",
              "Only 7 — it's the one with a NULL",
              "4 and 10 — they have a snack_id (9), it just doesn't exist; sale 7 has none at all",
            ],
            answer: 2,
            explain:
              "IS NULL on the snacks side means 'found no partner'. IS NOT NULL on the sales side means 'did claim something'. Together: claimed something, and the claim was false.",
          },
          explain:
            "Sales 4 and 10 — and this is your ACTUAL repair list, because sale 7 must not be repaired. A row that says 'I don't know' is telling the truth and needs nothing from you; a row that names snack 9 is wrong and needs fixing. Two IS NULLs on opposite sides told those apart, and that difference is the difference between an audit and a mess.",
        },
        {
          goal:
            "Story beat: Aling Nena remembers now — the ghost sales were really Kwek-kwek, just mis-written as snack 9. Repair sale 4: set its snack_id to 3.",
          solution: "UPDATE sales SET snack_id = 3 WHERE sale_id = 4;",
          hint: "UPDATE sales SET snack_id = 3 WHERE sale_id = 4;",
          explain:
            "1 row affected. Aim by sale_id — a true key, so the aim is exact. One ghost repaired; sale 4 now honestly points at Kwek-kwek.",
        },
        {
          goal: "Repair the second ghost the same way: sale 10 was also Kwek-kwek. Fix it.",
          solution: "UPDATE sales SET snack_id = 3 WHERE sale_id = 10;",
          hint: "Same move, new sale_id: UPDATE sales SET snack_id = 3 WHERE sale_id = 10;",
          explain:
            "1 row affected. Both ghosts now point at a real snack. Only the smudge — sale 7 — is left unmatched. Before you touch it, think about whether it even needs touching.",
        },
        {
          goal:
            "Check your work: run the ghost-hunt query again and confirm only the smudge is still unexplained.",
          solution:
            "SELECT sales.sale_id, sales.snack_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          predict: {
            question:
              "Both ghosts are repaired. Sale 7's snack_id is still NULL. Will the lock you're about to add refuse it?",
            choices: [
              "Yes — any row with a missing snack_id will be treated as a ghost",
              "No — a FOREIGN KEY only checks values that are actually present; NULL is honestly 'unknown', not a lie",
              "It depends on whether qty is also NULL",
            ],
            answer: 1,
            explain:
              "Monday's lesson, back for a reason: the FK forbids fakes, not unknowns. Sale 7 doesn't need fixing to pass the lock — it needs to stay exactly as it is.",
          },
          explain:
            "10 rows, 1 NULL name now — sale 7, still honestly unknown. That's fine. Unlike the ghosts, this row was never a lie, so there's nothing to repair. Time to try the lock again.",
        },
        {
          goal:
            "Check it properly, the way you'd have to on a real ledger: re-run the LIES-ONLY query — the anti-join with AND sales.snack_id IS NOT NULL. An empty result is the green light.",
          solution:
            "SELECT sales.sale_id, sales.snack_id FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id WHERE snacks.snack_id IS NULL AND sales.snack_id IS NOT NULL;",
          predict: {
            question: "You repaired both ghosts. What should this return now?",
            choices: [
              "0 rows — no sale claims a snack that doesn't exist any more",
              "1 row — sale 7, which still has no snack",
              "3 rows — the query doesn't know about the repairs until you reload",
            ],
            answer: 0,
            explain:
              "Sale 7 is filtered out by IS NOT NULL, and the two ghosts now find Kwek-kwek. Nothing left to report — which is the answer you want from an audit query, and the only time an empty result is good news.",
          },
          explain:
            "0 rows. Notice the discipline here: you did not decide the ledger was clean by looking at it, you asked the question that would have shown you if it wasn't. That is the difference between 'it looks fine' and 'I checked' — and the lock is about to check exactly the same thing.",
        },
        {
          goal: "Lock it: add the FOREIGN KEY again.",
          solution:
            "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);",
          explain:
            "Query OK. Every existing snack_id now either names a real snack or is honestly NULL — the server checked, and this time it agreed. Clean, then lock: the same order that locked your students table, aimed at a different promise.",
        },
        {
          goal: "Admire the shape: describe sales and find the lock.",
          solution: "DESCRIBE sales;",
          hint: "DESCRIBE sales;",
          explain:
            "snack_id shows MUL. Same table, same data as five minutes ago — but now the server itself refuses to let it go wrong again.",
        },
        {
          goal:
            "Prove the lock is live: try to insert a NEW ghost — sale 11, snack 9, 2026-08-15, qty 2.",
          solution: "INSERT INTO sales VALUES (11, 9, '2026-08-15', 2);",
          predict: {
            question: "Snack 9 still doesn't exist. What happens now that the lock is on?",
            choices: [
              "Refused with Error 1452 — the exact attack that succeeded before the lock now bounces",
              "Accepted — the lock only protects rows that existed at the moment it was added",
              "Accepted, and snack 9 is created automatically to satisfy the reference",
            ],
            answer: 0,
            explain:
              "A lock protects the table going forward, not just the moment it was applied. Every future insert gets the same check the cleanup just survived.",
          },
          explain:
            "Error 1452. The ghosts you spent this morning repairing walked into this ledger unchallenged, because it had no lock; the very next one bounces. This table can never grow a new ghost again — you didn't just clean the mess, you made it impossible to repeat.",
        },
        {
          goal:
            "Now attack from the parent side: try to DELETE snack 2 (Turon) from the notebook.",
          solution: "DELETE FROM snacks WHERE snack_id = 2;",
          predict: {
            question: "Sale 5 points at Turon. What happens?",
            choices: [
              "Refused with Error 1451 — deleting Turon would strand the sale that points at it",
              "Accepted — the lock only checks inserts into sales, not deletes from snacks",
              "Accepted, and sale 5 is deleted along with it",
            ],
            answer: 0,
            explain:
              "The lock guards both doors. 1452 stopped the new ghost from getting in; 1451 stops a referenced parent from walking out.",
          },
          explain:
            "Error 1451: Cannot delete or update a parent row: a foreign key constraint fails. Same guard, other direction — you fired both halves of the lock in the last two tasks.",
        },
        {
          goal:
            "Re-run the audit on the now-clean, now-locked ledger: how many sales does an INNER JOIN return now, compared to Tuesday's 7?",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          hint: "The join you've written all week — nothing new, just run it and count.",
          explain:
            "9 rows, not 7. Sales 4 and 10 finally have a real partner (Kwek-kwek), so the INNER JOIN keeps them now. Only sale 7 — honestly unknown — still can't match anything. Cleaning the ledger didn't just satisfy the lock; it repaired the audit too.",
        },
        {
          goal:
            "Compose it yourself, no help: the council wants proof the cleanup worked. Show every sale of Kwek-kwek (snack 3) — sale_id, sold_on and qty, name not required.",
          solution: "SELECT sale_id, sold_on, qty FROM sales WHERE snack_id = 3;",
          explain:
            "4 rows now, not 2 — sales 2 and 9 (honest Kwek-kwek all along) plus the two repaired ghosts, 4 and 10. The repair didn't just fix an error code; it changed a real business answer.",
        },
        {
          goal:
            "Last one, entirely your own: write a question the audit could still ask, and answer it with a join or a WHERE against the clean ledger. (For example: which snacks sold on 2026-08-14, and how many of each?)",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE sales.sold_on = '2026-08-14';",
          explain:
            "2 rows, both Kwek-kwek: a qty of 4 from sale 9 (honest all along) and a qty of 2 from sale 10 — the ghost you repaired an hour ago, now answering a question about a real day's trading. A week ago this would have been unanswerable without knowing which rows to trust; now every row in the table already deserves to be trusted.",
        },
      ],
    },
    {
      kind: "quest",
      id: "choose-the-join",
      title: "🗝️ Quest: choose the join",
      intro:
        "Declaring a join is typing. CHOOSING which one — and reading the answer once it runs — is the actual audit skill. Real questions, real judgement, misconceptions called out by name.",
      missions: [
        {
          task:
            "A club tracks members (member_id, name) and dues (dues_id, member_id, amount, paid_on). The officer wants one list: every member who has never paid dues. Nobody may be left off it just because they have no payment to show.",
          check: {
            question:
              "To find members who have never paid dues, which join do you reach for?",
            choices: [
              "members INNER JOIN dues — the members with no dues simply won't appear, so read the missing names off the smaller result",
              "members LEFT JOIN dues — every member appears, and the ones with NULL in the dues columns are the answer, sitting right in the grid",
              "dues LEFT JOIN members — every payment appears, which isn't the question being asked",
            ],
            answer: 1,
            explain:
              "The question is about ALL members, so members has to be the protected side. INNER would just make the non-payers vanish — the exact silent failure this whole week has been about.",
          },
        },
        {
          task:
            "A library tracks books (book_id, title) and borrowings (borrow_id, book_id, borrower, due_on). Officer asks: 'which borrowings reference a book that's been removed from the catalog?'",
          check: {
            question: "Which join surfaces a borrowing whose book_id no longer exists in books?",
            choices: [
              "books LEFT JOIN borrowings — protects books, not what's being asked about",
              "books INNER JOIN borrowings — matches only vanish, they don't get flagged",
              "borrowings LEFT JOIN books — every borrowing survives, and the ones with NULL in the book columns are exactly the orphaned references",
            ],
            answer: 2,
            explain:
              "'Which child rows point at nothing' always means: protect the child, LEFT JOIN the parent, read the NULLs. This is the ghost-hunt query wearing a library's clothes.",
          },
        },
        {
          task:
            "A jeepney co-op tracks jeepneys (plate_number, route) and trips (trip_id, plate_number, on_date). The dispatcher asks a plain question: 'how many trips did each jeepney make?' — no jeepney should be left off the report, even ones that made zero trips.",
          check: {
            question: "For a report that must list EVERY jeepney, even ones with zero trips, which join?",
            choices: [
              "jeepneys INNER JOIN trips — some jeepneys disappear from the report entirely",
              "jeepneys LEFT JOIN trips — every jeepney gets a row; zero-trip jeepneys show NULL in the trip columns",
              "trips INNER JOIN jeepneys — same silent drop, different word order",
            ],
            answer: 1,
            explain:
              "'Must include every X, even ones with nothing' is always a LEFT JOIN with X protected. A report that can silently lose rows isn't a report, it's a rumor.",
          },
        },
        {
          task:
            "One misconception to retire for good: a classmate says 'LEFT JOIN is just INNER JOIN but slower, so I'll always use LEFT JOIN just in case.' Is that safe?",
          check: {
            question: "What's actually wrong with 'always use LEFT JOIN just in case'?",
            choices: [
              "Nothing — LEFT JOIN is strictly safer and there's no reason to ever pick INNER",
              "LEFT JOIN can hand back rows full of NULLs that a query never expected — if you then treat those NULLs as real data (a real name, a real price), you've traded one silent bug for another",
              "LEFT JOIN is slower on every server, so INNER should always be preferred instead",
            ],
            answer: 1,
            explain:
              "The right join is the one that answers the actual question. 'Which snacks never sold' NEEDS the NULLs; 'what did we sell' would be confused by them. Choosing is judgement, not a default.",
          },
        },
        {
          task:
            "Your turn to write the questions. For each of the three joins — INNER, LEFT, RIGHT — write one real question (about school life, or the canteen) that ONLY that join answers correctly.",
          input:
            "Write three questions, one per join kind, and name which join answers each one and why the other two would give a wrong or incomplete answer",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet-day4",
      title: "📓 Quest: cheat sheet, day 4",
      intro:
        "Today's entry is a ritual, not a fact — the exact order that turns a messy child table into a locked one. Write it as steps; you'll follow it for real in a minute.",
      missions: [
        {
          task:
            "Add a Day 4 heading. From memory, write the cleanup ritual as four numbered steps: 1) find every unexplained child row with the anti-join — child LEFT JOIN parent WHERE parent.key IS NULL, 2) narrow it to the LIES with AND child.key IS NOT NULL, 3) repair each one with an aimed UPDATE, 4) lock with ALTER TABLE … ADD FOREIGN KEY. Under it, one line: what happens if you try step 4 before steps 1–3?",
          check: {
            question: "What belongs on the sheet as step 1 of the ritual?",
            choices: [
              "ALTER TABLE … ADD FOREIGN KEY — lock first, fix whatever complains",
              "child LEFT JOIN parent, read the NULL rows — find every reference the parent can't back up",
              "DELETE every row you're not sure about",
            ],
            answer: 1,
            explain:
              "Find before you fix, fix before you lock — the same order last week used for PRIMARY KEY, aimed at a different constraint. A LEFT JOIN from the child is always the finder.",
          },
        },
        {
          task:
            "Side-by-side entry: 1451 vs 1452, one line each, worded so you'd never confuse them at 2am — plus the NULL-in-FK note: 'a foreign key blocks fakes, never unknowns', and beside it the query proof, 'the same distinction step 2 makes with IS NOT NULL'.",
          check: {
            question:
              "Why does the ritual have step 2 at all, instead of repairing everything step 1 finds?",
            choices: [
              "Step 1 is unreliable and step 2 double-checks it",
              "Step 1 also finds rows whose key is honestly NULL — those are legal under the lock and must not be repaired",
              "Step 2 is only needed on tables with more than one foreign key",
            ],
            answer: 1,
            explain:
              "Repairing a NULL would be inventing data. The lock will accept that row exactly as it is, because unknown is not the same as fake — so the query that drives your repairs has to make the same distinction the constraint does.",
          },
        },
        {
          task:
            "Last entry: write out the finished repair-list query in full, with blanks where the table and column names go, and one line saying why you would run it BEFORE the lock and again AFTER.",
          input:
            "Paste your Day 4 section — the four-step ritual, the 'before step 1–3' line, the 1451/1452 side-by-side, the NULL note, and the repair-list query",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: design and build your own linked pair",
      intro:
        "Your canteen pair was born locked on Monday, so it never needed today's repair ritual. This lab is where the day's other half happens: you become the designer. Your week-2 table (the one you built with AUTO_INCREMENT) becomes a PARENT — you design and build a CHILD for it, linked with your own foreign key, from scratch.",
      missions: [
        {
          task:
            "Pick your parent: your real week-2 table (players, episodes, stock — whatever you built, with its AUTO_INCREMENT id). Sketch a child table for it in a text file first: what event or record happens TO one of your parent's rows, repeatedly? (A player has match results; an episode has viewer ratings; a stock item has restock deliveries.)",
          check: {
            question: "Your child table's foreign key column should point at…",
            choices: [
              "your parent table's AUTO_INCREMENT id column — the true name every child row needs to reference",
              "your parent table's name column — names are easier to read",
              "a brand-new column in the parent that doesn't exist yet",
            ],
            answer: 0,
            explain:
              "The id is the parent's true name for exactly this reason — unique, never missing, never needs to change. A foreign key always reaches for the parent's KEY, not a column that merely looks unique.",
          },
        },
        {
          task:
            "Build it for real, in your Workbench: CREATE your child table with its own id (INT PRIMARY KEY AUTO_INCREMENT), whatever columns your design needs, and a FOREIGN KEY back to your parent's id column. Run DESCRIBE on it to confirm the MUL.",
          check: {
            question: "Why give the CHILD table its own AUTO_INCREMENT id, separate from the foreign key column?",
            choices: [
              "You don't need to — the foreign key column can serve as the child's own primary key too",
              "The child needs its own true name (its own row identity) in addition to the pointer column that names its parent — two different jobs, two different columns",
              "MySQL requires every table to have at least two INT columns",
            ],
            answer: 1,
            explain:
              "sales.sale_id names the SALE; sales.snack_id names which SNACK it's about. One column is 'who am I', the other is 'who do I point at' — conflating them is how a child table loses the ability to hold more than one row per parent.",
          },
        },
        {
          task:
            "Seed it: insert at least 4 rows of real, honest data, all pointing at parent rows that really exist.",
          check: {
            question: "Before running your INSERTs, what's worth double-checking?",
            choices: [
              "That every foreign key value you're about to type is an id that actually exists in your parent table right now",
              "That every row has a different qty",
              "That the table name is spelled in all capitals",
            ],
            answer: 0,
            explain:
              "The FK will catch a lie for you, but checking first is faster than reading an error and re-typing. Look up the real ids with a quick SELECT on the parent if you're not sure.",
          },
        },
        {
          task:
            "Fire one deliberate 1452 on purpose: try to insert a child row whose foreign key points at a parent id that doesn't exist, and read the real error in your own Workbench.",
          check: {
            question: "Why deliberately break your OWN new table before moving on?",
            choices: [
              "To prove the lock actually works on data you designed yourself, not just Aling Nena's — an untested constraint is just a hopeful comment",
              "It's required by MySQL before a foreign key becomes active",
              "It makes the table run faster afterward",
            ],
            answer: 0,
            explain:
              "A lock nobody has tried to pick isn't proven, it's assumed. Firing 1452 on your own design is you signing off on your own work the way an auditor would.",
          },
        },
        {
          task:
            "Write two join queries against YOUR pair that answer questions you actually wonder about — at least one INNER and one LEFT (or RIGHT). Add all of it to week3.sql under a '-- Day 4: my own pair' comment, with the question in plain words above each query.",
          input:
            "Paste your Day 4 section of week3.sql — both CREATEs, your seed INSERTs, the commented 1452 attempt, and your two join queries with their questions",
        },
      ],
    },
    {
      kind: "upload",
      id: "export-own-pair",
      title: "📤 Export the pair you designed yourself",
      intro:
        "The canteen pair was built from a script you were handed. This pair is entirely yours — your parent, your child, your foreign key, your questions. Export it and hand it in.",
      steps: [
        "In MySQL Workbench: Server → Data Export.",
        "Tick the `school` schema, then tick BOTH of your new tables — your week-2 parent table and the child table you designed today.",
        'Choose "Export to Self-Contained File", name it `week3-day4-<yourname>.sql`.',
        'Keep "Include Create Schema" ticked, then Start Export and wait for the green tick.',
        "Upload the file below.",
      ],
      proves:
        "the pair you designed yourself: your parent table's `CREATE TABLE` with its `AUTO_INCREMENT` id, your child table's `CREATE TABLE` showing a `FOREIGN KEY` clause that references it, and the real rows you chose to seed both with. Nobody else's file has this exact pair.",
      screenshotFallback:
        "Export not cooperating? Upload a screenshot instead: your child table's CREATE statement (right-click → Copy to Clipboard → Create Statement) plus a SELECT * from both tables. Say so in today's turn-in box, and bring the export problem to class.",
    },
    {
      kind: "sql-console",
      id: "bug-hospital",
      title: "🏥 The bug hospital",
      intro:
        "Five patients from the locking ward, six statements to run — every one of them a link that won't go on, won't come off, or won't let go. Each task shows the broken statement; diagnose it and run the CORRECTED version. The two notebooks are here unlinked, and sale 3 still points at a snack that never existed.",
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
                  ["3", "9", "1"],
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
            "Patient 1 — this lock is refused with 1452:  ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);  Sale 3 was really Kwek-kwek. Don't run the ALTER yet — run the ONE statement that has to happen first.",
          solution: "UPDATE sales SET snack_id = 3 WHERE sale_id = 3;",
          explain:
            "Clean, then lock. 1452 on an ALTER is never a problem with the ALTER — it's the server reporting that the data already breaks the promise you're asking it to keep. Repair the row and the same statement will work untouched.",
        },
        {
          goal: "Patient 1, second half — now run the lock that failed before, unchanged.",
          solution: "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);",
          explain:
            "Identical SQL, different world. Nothing was ever wrong with the statement — only with when it ran, exactly like the parent-before-child bug on Monday's ward.",
        },
        {
          goal:
            "Patient 2 — the keeper wants a restocks notebook, and this CREATE is refused:  CREATE TABLE restocks ( restock_id INT PRIMARY KEY, snack_id INT, FOREIGN KEY (snack_id) REFERENCES snacks (snak_id) );  The bug is a misspelling in the PARENT's column. Run the corrected statement.",
          solution:
            "CREATE TABLE restocks ( restock_id INT PRIMARY KEY, snack_id INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id) );",
          explain:
            "3734 — 'Missing column snak_id in the referenced table'. Note which END of the link the error blames: Monday's ward had the CHILD's column misspelled, and this is the same typo one word to the right. REFERENCES snacks (…) must name a column snacks actually has, and the message tells you which half to go and look at.",
        },
        {
          goal:
            "Patient 3 — refuses to run:  DELETE FROM snacks WHERE snack_id = 3;  The keeper wants to retire a snack, and sales 2 and 3 both point at Kwek-kwek now. Gulaman is the one nothing points at. Run the corrected delete.",
          solution: "DELETE FROM snacks WHERE snack_id = 4;",
          explain:
            "1451 guards the parent. It isn't a wall against ever deleting a snack — it's a wall against deleting one that is still spoken for. Pick a parent with no children, or deal with the children first.",
        },
        {
          goal:
            "Patient 4 — refuses to run:  INSERT INTO sales VALUES (4, 7, 3);  The canteen really sold 3 Turon. Run the corrected insert.",
          solution: "INSERT INTO sales VALUES (4, 2, 3);",
          explain:
            "1452 on a write, now that the lock is live. Snack 7 doesn't exist; Turon is snack 2. Before the lock this row would have gone straight in and become next week's ghost — the error IS the feature.",
        },
        {
          goal:
            "Patient 5, last one — refuses to run:  DROP TABLE snacks;  The keeper wants to start the snack notebook over from scratch. Run the statement that has to happen FIRST before the parent can be dropped.",
          solution: "DROP TABLE sales;",
          explain:
            "3730 — you cannot drop a table another table's foreign key points at. Children first, then the parent: the exact reverse of the order you build them in. That symmetry is worth remembering — creation runs parent-first, destruction runs child-first.",
        },
      ],
    },
    {
      kind: "quest",
      id: "second-child",
      inline: true,
      title: "🏔️ A second child, or a broken-statement gauntlet",
      intro:
        "Pick ONE path. Both stretch the same muscle further: real design judgement, applied without a script to follow.",
      missions: [
        {
          task:
            "Path A — a second child: give the SAME parent from today's real lab a second child table (a different kind of event about the same parent rows — if your first child was 'match results', a second could be 'training attendance'). Design it, CREATE it with its own foreign key back to the same parent, and seed it with honest rows. Path B — the gauntlet: instead, write THREE broken FK or join statements against your own pair (a misspelled REFERENCES table, an ambiguous undotted column after a self-joinish setup, a DELETE your own lock would refuse) plus an answer key of the exact error each one throws and why.",
          input:
            "Say which path you chose, then paste the work: Path A's CREATE + seed INSERTs, or Path B's three broken statements with your answer key (predicted error code + one line why for each)",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-ledger-wrecker",
    title: "⚔️ Boss battle: The Ledger Wrecker",
    intro:
      "The Ledger Wrecker's whole strategy is timing: lock a table before it's clean, delete a parent before its children are dealt with, ask for the wrong join and trust nobody checks the row count. You've spent four days learning exactly this order. Finish it off.",
    boss: { name: "the Ledger Wrecker", emoji: "🧨" },
    questions: [
      {
        prompt: "Step 1 of the cleanup ritual, on a ledger you've never seen. Which query gives you the repair list?",
        choices: [
          "SELECT * FROM sales WHERE snack_id = 9 — find the bad id and filter on it",
          "sales LEFT JOIN snacks ON … WHERE snacks.snack_id IS NULL AND sales.snack_id IS NOT NULL",
          "sales INNER JOIN snacks ON … — whatever is missing from the result is the repair list",
        ],
        answer: 1,
        explain:
          "WHERE snack_id = 9 needs someone to have told you the answer first, and the INNER JOIN hands you the rows that are FINE. The anti-join hands you the broken ones, and the second condition keeps the honest blanks off a list you're about to start editing.",
      },
      {
        prompt:
          "Your repair list has three rows: two name a snack that doesn't exist, one names no snack at all. How many do you repair?",
        choices: [
          "Two — the blank is honest; repairing it would mean inventing data, and the lock accepts it as is",
          "Three — the lock will refuse the blank as well",
          "None — repairs are the librarian's job, not the auditor's",
        ],
        answer: 0,
        explain:
          "A foreign key forbids fakes, not unknowns. The NULL row passes the lock untouched, so touching it would be replacing a truthful 'I don't know' with a guess.",
      },
      {
        prompt: "You try ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks(snack_id); on a table that still has ghost rows. What happens?",
        choices: [
          "Refused with 1452 — the server checks every existing row before it agrees to the promise",
          "Accepted — ALTER only checks rows inserted after the lock",
          "Accepted, and the ghost rows are silently deleted to make the lock possible",
        ],
        answer: 0,
        explain:
          "A constraint that ignored existing lies wouldn't be a promise. Same law as last week's PRIMARY KEY refusing dirty ids: clean first, then lock.",
      },
      {
        prompt: "What is the correct order of the cleanup ritual?",
        choices: [
          "Lock the table, then hunt for problems the lock reveals",
          "Hunt with a LEFT JOIN from the child, repair with aimed UPDATEs, then lock with ALTER TABLE … ADD FOREIGN KEY",
          "Repair everything you're unsure about, skip the hunt, then lock",
        ],
        answer: 1,
        explain:
          "Find, then fix, then lock. Skipping the find step means guessing which rows to repair — and the LEFT JOIN hands you their exact ids for free.",
      },
      {
        prompt: "Which query finds every sale a snack notebook can't explain?",
        choices: [
          "snacks LEFT JOIN sales — protects the wrong table for this question",
          "sales INNER JOIN snacks — unexplained sales just don't appear",
          "sales LEFT JOIN snacks — every sale survives, and the unexplained ones carry NULL where the snack name should be",
        ],
        answer: 2,
        explain:
          "Protect the side you need every row of. The question is about sales, so sales must be the LEFT side — same query, four days running.",
      },
      {
        prompt: "Ghost sales 4 and 10 both really meant Kwek-kwek (snack 3). What repairs them?",
        code: "UPDATE sales SET snack_id = 3 WHERE sale_id = 4;\nUPDATE sales SET snack_id = 3 WHERE sale_id = 10;",
        choices: [
          "Exactly that — two aimed UPDATEs, using the sale's own key to hit one row each",
          "One UPDATE with no WHERE, since both need the same fix",
          "DELETE both rows and re-INSERT them with the correct snack_id",
        ],
        answer: 0,
        explain:
          "Aim with the true key, repair, done. An UPDATE with no WHERE would repoint every sale in the table at Kwek-kwek — the exact week-1 mistake this course keeps guarding against.",
      },
      {
        prompt: "The smudged sale (snack_id NULL) survives the entire cleanup untouched. Why leave it alone?",
        choices: [
          "NULL rows are automatically excluded from every constraint check, so it doesn't matter either way",
          "It's a bug that should have been caught but wasn't",
          "A foreign key forbids fake references, not honest unknowns — NULL was never a lie, so there's nothing to repair",
        ],
        answer: 2,
        explain:
          "The whole week's finest distinction, one more time: fake gets refused, unknown gets allowed. 'Repairing' an honest NULL by inventing a snack_id would turn a true unknown into a lie.",
      },
      {
        prompt: "With the lock finally on, you try INSERT INTO sales VALUES (11, 9, '2026-08-15', 2);. Result?",
        choices: [
          "Accepted, with snack 9 created automatically",
          "Accepted — the lock only applied to rows that existed when it was added",
          "Refused with 1452 — snack 9 still doesn't exist, and the lock now checks every future insert too",
        ],
        answer: 2,
        explain:
          "A lock isn't a one-time inspection — it's a standing rule. Every insert from now on gets the same check the cleanup just passed.",
      },
      {
        prompt: "With the lock on, DELETE FROM snacks WHERE snack_id = 2; (Turon) is refused. Why?",
        choices: [
          "Turon's price is too high to delete",
          "A sale still references Turon — deleting it would strand that sale, so the server refuses with 1451",
          "Only snacks with even-numbered ids can be deleted",
        ],
        answer: 1,
        explain:
          "The lock guards the parent's exit as hard as the child's entry. Delete or repoint the referencing sales first, and only then may Turon go.",
      },
      {
        prompt: "After the repair, an INNER JOIN of sales and snacks now returns 9 rows instead of Tuesday's 7. Why the change?",
        choices: [
          "The lock secretly deleted one row, which is why the count went up relative to the total",
          "INNER JOIN got faster after the ALTER ran",
          "The two repaired ghosts (sales 4 and 10) now have a real partner, so INNER JOIN keeps them; only the honest NULL sale still can't match",
        ],
        answer: 2,
        explain:
          "Cleaning the data changed a real answer, not just a constraint. The two rows that used to vanish silently now belong in every honest audit.",
      },
      {
        prompt: "A club's officer wants a report listing EVERY member, even ones with zero dues payments. Which join?",
        choices: [
          "members INNER JOIN dues",
          "members LEFT JOIN dues, keeping members on the protected side",
          "dues INNER JOIN members",
        ],
        answer: 1,
        explain:
          "'Every X, even ones with nothing' always means: protect X with a LEFT JOIN, read the NULLs as the ones with nothing.",
      },
      {
        prompt: "Day-2 recall: SELECT snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id; fails. Which error, and why?",
        choices: [
          "1054 — snack_id doesn't exist in either table",
          "1052 — both tables have a snack_id column and the plain name doesn't say which one you mean",
          "1452 — snack_id violates the foreign key inside a SELECT",
        ],
        answer: 1,
        explain:
          "Ambiguous, not missing. Two candidates, zero dots — table.column ends the argument, same as it did on Day 2.",
      },
      {
        prompt: "Day-1 recall: a sale arrives with NULL for snack_id, on a table that already has its FOREIGN KEY. The server…",
        choices: [
          "accepts it, but only once per table",
          "refuses it with 1452 — the pointer must always point at something",
          "accepts it — the FK checks values that are present, and NULL honestly says 'unknown'",
        ],
        answer: 2,
        explain:
          "Locked or unlocked, the rule never changes: fakes get refused, unknowns get through. This is why the smudge needed zero repair all week.",
      },
      {
        prompt: "This week's whole arc, in one sentence — which is it?",
        choices: [
          "Find every problem a table has, then leave them all documented for later",
          "Link tables from birth where you can (Day 1), read them as one answer (Days 2–3), and where a table wasn't born linked, clean it and lock it after the fact (Day 4) — either path ends at the same guarantee",
          "Joins replace foreign keys entirely, so locking a table is optional once you know how to LEFT JOIN",
        ],
        answer: 1,
        explain:
          "Born locked or locked later, the destination is identical: a table that can no longer lie to the tables around it. Tomorrow you prove the whole week works together in one file.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The cleanup ritual in your own words — find, narrow to the lies, repair, lock — and what the server does if you try to skip a step.",
      "What surprised you or broke today (the NULL that needed no repair? the 1452 that appeared on a table that had been fine for years?), and why it happened.",
      "One question you still have.",
      "Then paste the SQL you ran today.",
    ],
    note: "Your real ledger is clean and locked, and you've built and locked a second linked pair entirely of your own design. Tomorrow adds no new commands at all — you assemble everything from this week into one file that replays the whole audit from nothing.",
  },
};
