// unit1-week3 · Day 3 — What the join hid: LEFT and RIGHT JOIN
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "What the join hid: see every row with LEFT and RIGHT JOIN",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup-day3",
    title: "🕹️ Warm-up game: the missing evidence",
    intro:
      "Yesterday's INNER JOIN read both canteen notebooks as one — and quietly dropped every row without a partner. Today you get them all back. The snack notebook is on screen; the sales notebook says: snack ids 1, 3, 1, 9, 2, 1, (blank), 5, 3, 9. Click what each round asks for, then press Run.",
    tableName: "snacks",
    columns: ["snack_id", "name", "price"],
    rows: [
      ["1", "Banana cue", "15"],
      ["2", "Turon", "12"],
      ["3", "Kwek-kwek", "20"],
      ["4", "Gulaman", "10"],
      ["5", "Siopao", "25"],
      ["6", "Pastillas", "8"],
    ],
    rounds: [
      {
        question:
          "Recall first. The sales notebook lists snack ids 1, 3, 1, 9, 2, 1, (blank), 5, 3, 9. Click every snack that yesterday's INNER JOIN kept — the ones with at least one matching sale.",
        matches: [0, 1, 2, 4],
        sql: "SELECT snacks.name, sales.qty\nFROM snacks INNER JOIN sales\nON snacks.snack_id = sales.snack_id;",
        explain:
          "Banana cue, Turon, Kwek-kwek, Siopao — matched, kept. Gulaman and Pastillas never appear in the sales log, so INNER JOIN acts as if they don't exist. That silence is today's subject.",
      },
      {
        question:
          "A LEFT JOIN starting from snacks keeps EVERY snack, matched or not. Click the snacks that would show up with NULL where their sale should be.",
        matches: [3, 5],
        sql: "SELECT snacks.name, sales.sale_id\nFROM snacks LEFT JOIN sales\nON snacks.snack_id = sales.snack_id;\n-- Gulaman and Pastillas appear — with NULL beside them",
        explain:
          "LEFT JOIN keeps all of the left table. A snack with no partner still gets its row — the sale columns are just filled with NULL. NULL beside a snack means: exists, never sold. The flops.",
      },
      {
        question:
          "The audit's first recommendation: of the two snacks that never sold, click the one with the LOWEST price — first candidate to drop from the menu.",
        matches: [5],
        sql: "-- The evidence behind the recommendation:\nSELECT snacks.name, snacks.price, sales.sale_id\nFROM snacks LEFT JOIN sales\nON snacks.snack_id = sales.snack_id\nORDER BY snacks.price;",
        explain:
          "Pastillas — never sold, and at 8 pesos it earns the least even when it does. Notice what just happened: a join plus your eyes answered a real business question. That's what joins are for.",
      },
      {
        question:
          "Join in your head: the sales log again — 1, 3, 1, 9, 2, 1, (blank), 5, 3, 9. Click the ONE snack whose id appears most often.",
        matches: [0],
        sql: "SELECT snacks.name, sales.sale_id\nFROM snacks INNER JOIN sales\nON snacks.snack_id = sales.snack_id;\n-- Banana cue appears 3 times — the bestseller",
        explain:
          "Banana cue, three sales. You matched ids across two lists by eye — every join you type today is the server doing exactly this, only faster and without missing anything.",
      },
      {
        question:
          "Day-1 recall, new clothes: in your REAL locked tables, DELETE refuses any snack that sales still points at (error 1451). Click every snack DELETE could remove WITHOUT an error.",
        matches: [3, 5],
        sql: "DELETE FROM snacks WHERE snack_id = 6;\n-- OK — no sale references Pastillas\nDELETE FROM snacks WHERE snack_id = 1;\n-- Error 1451 — Banana cue has sales",
        explain:
          "The same two rows as the LEFT JOIN NULLs. 'Safe to delete' and 'never sold' are one fact wearing two costumes — the FK and the LEFT JOIN are both reading the same partnerships.",
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "typing",
      id: "typing-left-right",
      title: "⌨️ Type the joins that keep everything",
      intro:
        "No new video today — the joins video you watched yesterday already showed LEFT and RIGHT near the end (rewatch that part if you want, it's three minutes). The syntax is one word different from INNER; the meaning is a different world. Your fingers learn both here.",
      rounds: [
        {
          prompt: "Keep EVERY snack, matched or not — start with the join words.",
          template:
            "SELECT snacks.name, sales.sale_id FROM snacks {LEFT JOIN} sales ON snacks.snack_id = sales.snack_id;",
          explain:
            "LEFT JOIN: all of the left table survives. The left table is the one named before the join words — here, snacks.",
        },
        {
          prompt: "Same query — this time type the matching rule.",
          template:
            "SELECT snacks.name, sales.sale_id FROM snacks LEFT JOIN sales {ON snacks.snack_id = sales.snack_id};",
          explain:
            "The ON clause doesn't change between join kinds. Only the keep-rule changes: INNER keeps matches, LEFT keeps all of the left side.",
        },
        {
          prompt: "Now start from the sales side: keep EVERY sale, even ones no snack can explain.",
          template:
            "SELECT sales.sale_id, snacks.name FROM sales {LEFT JOIN} snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "Same two words — but now sales is on the left, so every SALE survives and unexplained ones carry NULL where the snack name should be.",
        },
        {
          prompt: "RIGHT JOIN keeps all of the RIGHT table. Type the join words.",
          template:
            "SELECT snacks.name, sales.sale_id FROM sales {RIGHT JOIN} snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "sales RIGHT JOIN snacks keeps every snack — exactly what snacks LEFT JOIN sales does. Same result, opposite wording.",
        },
        {
          prompt:
            "Prove that flip from memory: write the LEFT JOIN that returns the same rows as the RIGHT JOIN you just typed. Select snacks.name then sales.sale_id, starting FROM snacks.",
          template:
            "{SELECT snacks.name, sales.sale_id FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;}",
          explain:
            "A LEFT JOIN B keeps all of A; B RIGHT JOIN A keeps all of A too. Most people pick one habit (usually LEFT) and read the other — now you can do both.",
        },
        {
          prompt:
            "From memory: every sale with its snack's name, keeping the sales that can't be explained. Select sales.sale_id then snacks.name, starting FROM sales.",
          template:
            "{SELECT sales.sale_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;}",
          explain:
            "This is the auditor's query — the one that exposes ghosts. You'll run it for real on the mini server next.",
        },
        {
          prompt:
            "Last one, from memory: yesterday's INNER JOIN, so the contrast stays sharp. Select snacks.name then sales.qty, starting FROM sales.",
          template:
            "{SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;}",
          explain:
            "Three joins, one skeleton, one word of difference. What changes is only the answer to: who is allowed to survive without a partner?",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "left-right-console",
      title: "🖥️ Mini server: the full audit",
      intro:
        "Both canteen notebooks are live on the mini server, mess and all — the ghosts, the smudge, the flops. Yesterday you saw what matches. Today you make the server show you EVERYTHING, including every row the INNER JOIN was hiding.",
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
          goal: "Baselines first: show the whole snack notebook.",
          solution: "SELECT * FROM snacks;",
          hint: "SELECT * FROM snacks;",
          explain:
            "6 snacks. Hold that number — every join today either keeps all 6 or quietly drops some, and you should always know which.",
        },
        {
          goal: "And the whole sales notebook.",
          solution: "SELECT * FROM sales;",
          hint: "SELECT * FROM sales;",
          explain:
            "10 sales — two pointing at snack 9 (which doesn't exist) and one with no snack at all. 6 snacks, 10 sales: the two honest counts every join answer must be measured against.",
        },
        {
          goal: "Now the join that hides nothing on the snack side: every snack's name with its sale ids and quantities, keeping snacks that never sold. Start FROM snacks and LEFT JOIN sales.",
          solution:
            "SELECT snacks.name, sales.sale_id, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;",
          hint: "SELECT snacks.name, sales.sale_id, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;",
          predict: {
            question:
              "Yesterday the INNER JOIN gave 7 rows. How many rows will snacks LEFT JOIN sales return?",
            choices: [
              "7 — a join only ever returns matches",
              "9 — the 7 matches, plus one row each for the two snacks that never sold",
              "6 — one row per snack, matched or not",
            ],
            answer: 1,
            explain:
              "LEFT JOIN keeps all of the left table: 7 matched rows plus Gulaman and Pastillas riding along with NULLs. Not 6 — a snack with three sales gets three rows.",
          },
          explain:
            "9 rows. Read the grid slowly: two names sit beside NULL — Gulaman and Pastillas, present in the snack notebook, absent from every sale. The INNER JOIN never told you they existed.",
        },
        {
          goal: "Make the flops easier to spot: run the same LEFT JOIN sorted by snack_id, so each snack's rows sit together.",
          solution:
            "SELECT snacks.name, sales.sale_id, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id ORDER BY snacks.snack_id;",
          hint: "Same join as before — then aim an ORDER BY at snacks.snack_id.",
          explain:
            "Now the story reads top to bottom: Banana cue three times, Turon once, Kwek-kwek twice, Gulaman — NULL. Siopao once, Pastillas — NULL. A sorted LEFT JOIN is an audit report.",
        },
        {
          goal: "Flip the direction: every SALE with its snack's name, keeping sales that no snack can explain. Show sale_id, the sale's snack_id, and the name.",
          solution:
            "SELECT sales.sale_id, sales.snack_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          hint: "Start FROM sales this time, LEFT JOIN snacks — the keep-everything side is whichever table you name first.",
          predict: {
            question: "10 sales in the notebook. How many rows will this return, and how many will have NULL in the name column?",
            choices: [
              "7 rows, 0 NULLs — the unexplained sales get dropped like yesterday",
              "10 rows, 2 NULLs — only the ghost sales lack a name",
              "10 rows, 3 NULLs — both ghost sales AND the smudged blank one",
            ],
            answer: 2,
            explain:
              "All 10 survive — sales is the left table now. The two ghosts (snack 9) find no partner, and the smudged sale has no snack_id to match with, so NULL joins to nothing. Three NULL names.",
          },
          explain:
            "10 rows, 3 with NULL where the name belongs: sales 4 and 10 point at a snack that doesn't exist, and sale 7 points at nothing at all. Every problem in the ledger, on one screen. This is THE auditor's query.",
        },
        {
          goal: "Now say the same thing backwards: get those exact 9 snack-side rows again, but using RIGHT JOIN. Select snacks.name, sales.sale_id, sales.qty — starting FROM sales.",
          solution:
            "SELECT snacks.name, sales.sale_id, sales.qty FROM sales RIGHT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          hint: "RIGHT JOIN keeps all of the table named AFTER the join words — so put snacks there.",
          predict: {
            question: "sales RIGHT JOIN snacks — which table keeps all its rows?",
            choices: [
              "snacks — RIGHT keeps the table on the right of the join words",
              "sales — the FROM table always keeps its rows",
              "Both — RIGHT JOIN never drops anything from either side",
            ],
            answer: 0,
            explain:
              "RIGHT points at the survivor: the table written after the join words. sales RIGHT JOIN snacks protects snacks — the same 9 rows as snacks LEFT JOIN sales.",
          },
          explain:
            "9 rows, identical to your LEFT JOIN. A LEFT JOIN B and B RIGHT JOIN A are the same question in mirror writing — which is why most people write everything as LEFT and simply reorder the tables.",
        },
        {
          goal: "One more flip to lock it in: the 10-row sales-side audit, written as a RIGHT JOIN. Show sales.sale_id, sales.snack_id, snacks.name.",
          solution:
            "SELECT sales.sale_id, sales.snack_id, snacks.name FROM snacks RIGHT JOIN sales ON snacks.snack_id = sales.snack_id;",
          hint: "Which table must sit on the right of the join words so every SALE survives?",
          explain:
            "10 rows, 3 NULL names — the same audit as before, mirrored. You can now read either spelling in the wild and know instantly who survives.",
        },
        {
          goal: "Contrast check: run yesterday's INNER JOIN — snacks.name and sales.qty, FROM sales INNER JOIN snacks.",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          predict: {
            question: "After everything you've seen today — how many rows will the INNER JOIN return?",
            choices: [
              "10 — joins return every sale",
              "9 — it drops only the smudged NULL sale",
              "7 — only rows with a partner on BOTH sides survive",
            ],
            answer: 2,
            explain:
              "INNER is the strict one: 7 matches, nothing else. The 2 ghosts and the smudge vanish without a message — which you now know how to catch.",
          },
          explain:
            "7 rows. Same tables, same ON — three different joins gave you 7, 9 and 10 rows. The join kind is a decision about who survives, and now you make it on purpose.",
        },
        {
          goal: "Aim a WHERE at the full picture: from the snacks-side LEFT JOIN, show only Gulaman's row — name and sale_id.",
          solution:
            "SELECT snacks.name, sales.sale_id FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id WHERE snacks.name = 'Gulaman';",
          predict: {
            question: "Gulaman never sold. What will the LEFT JOIN + WHERE snacks.name = 'Gulaman' return?",
            choices: [
              "1 row — Gulaman with NULL in the sale column",
              "0 rows — no sale matches, so nothing comes back",
              "Error 1054 — Gulaman isn't a column",
            ],
            answer: 0,
            explain:
              "The LEFT JOIN already granted Gulaman a row before the WHERE ever looked. The WHERE filters the joined rows — and Gulaman's NULL-partnered row passes it.",
          },
          explain:
            "1 row: Gulaman, NULL. If this had been an INNER JOIN, the answer would have been 0 rows — and 0 rows can't tell you WHY. A LEFT JOIN row with NULL says it plainly: exists, never sold.",
        },
        {
          goal: "Compose it yourself — the audit's first question: WHICH SNACKS NEVER SOLD? Show every snack's name beside its sale ids; the names sitting next to NULL are your answer.",
          solution:
            "SELECT snacks.name, sales.sale_id FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;",
          explain:
            "Gulaman and Pastillas — the only names beside NULL. No secret command needed to 'find the NULLs': the LEFT JOIN puts them on screen and your eyes do the rest.",
        },
        {
          goal: "And the audit's second question, from scratch: WHICH SALES CAN'T BE EXPLAINED? Show every sale's id beside its snack's name.",
          solution:
            "SELECT sales.sale_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "Sales 4, 7 and 10 — NULL where a name should be. Two point at a snack that was never in the notebook, one points at nothing. Tomorrow you repair all three and lock the ledger so this can never happen again.",
        },
      ],
    },
    {
      kind: "answer-sheet",
      id: "answer-sheet",
      title: "📝 Answer sheet: predict the survivors",
      intro:
        "The week's one answer sheet, and it works like a bet: for each question, write your prediction FIRST, then run the query in the mini server above (open it again any time — any task will run whatever you type, and looking never breaks anything; 'Run it all again' resets the ledger to its messy start). Where prediction and reality disagree, that's the lesson — write down what actually happened, not what should have.",
      fields: [
        "My prediction — before running anything",
        "The SQL I ran",
        "What actually came back",
      ],
      items: [
        {
          question:
            "snacks INNER JOIN sales, matching on snack_id: how many rows come back?",
          note: "The notebooks hold 6 snacks and 10 sales. Yesterday's number — can you still explain it?",
        },
        {
          question:
            "snacks LEFT JOIN sales: how many rows now — and exactly which snack names appear with NULL beside them?",
        },
        {
          question:
            "sales LEFT JOIN snacks: how many rows have NULL in the name column, and which sale_ids are they?",
          note: "Predict the sale_ids specifically — the audit needs names and numbers, not vibes.",
        },
        {
          question:
            "sales RIGHT JOIN snacks (matching on snack_id): which earlier query does this return the exact same rows as, and how many rows is that?",
        },
        {
          question:
            "Take the snacks LEFT JOIN sales query and add WHERE snacks.name = 'Pastillas'. What exactly comes back?",
        },
        {
          question:
            "Now the same WHERE snacks.name = 'Pastillas' — but on an INNER JOIN instead. What comes back this time, and why the difference?",
          note: "If your two predictions for this and the last question are identical, one of them is wrong.",
        },
        {
          question:
            "Add ORDER BY snacks.price to the snacks LEFT JOIN sales query. Which snack's row appears FIRST, and does it have a sale beside it?",
        },
        {
          question:
            "The canteen keeper asks: 'which snacks should I stop stocking?' Which of the three joins answers that question, and which rows of its result ARE the answer?",
          note: "This one is the whole day in one question — take your time.",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet-day3",
      title: "📓 Quest: cheat sheet, day 3",
      intro:
        "Three joins, three one-line pictures. This is the section you'll consult for years — every database job interview on Earth asks some version of it.",
      missions: [
        {
          task: "Add a Day 3 heading. From memory, write the three pictures, one line each: INNER JOIN keeps only matched rows; LEFT JOIN keeps ALL of the left table (NULLs fill the gaps); RIGHT JOIN keeps ALL of the right table. Under them, add the flip rule: A LEFT JOIN B returns the same rows as B RIGHT JOIN A.",
          check: {
            question: "In snacks LEFT JOIN sales, which table is guaranteed to keep every row?",
            choices: [
              "sales — the join word points at it",
              "Both tables — LEFT JOIN drops nothing",
              "snacks — the table on the left of the join words",
            ],
            answer: 2,
            explain:
              "The survivor is the table written BEFORE the join words. If you ever hesitate, say the query out loud: 'snacks — left join — sales' — the protected table is the one you said first.",
          },
        },
        {
          task: "Now the part that makes the sheet earn its keep: a which-join-answers-which-question table. Three rows: 'rows that exist in BOTH notebooks' → INNER · 'which parents have no children (snacks that never sold)' → parent LEFT JOIN child, look for NULL · 'which children have no parent (sales nothing explains)' → child LEFT JOIN parent, look for NULL. Write each row with the canteen example beside it.",
          input:
            "Paste your Day 3 section — the three one-line pictures, the flip rule, and your which-join-for-which-question table",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: audit your own ledger",
      intro:
        "The mini server's mess was staged. Your real canteen pair — the one you built Monday with the FK from birth — now gets the same full audit, in your real Workbench. One difference will jump out, and it's the best news of the week.",
      missions: [
        {
          task: "Before touching the keyboard, predict: on YOUR real pair, sales LEFT JOIN snacks — how many rows can possibly have NULL in the name column? Think about what Monday's FOREIGN KEY let in and what it refused.",
          check: {
            question: "How many NULL-name rows will your real audit show?",
            choices: [
              "3 — same as the mini server: two ghosts and the smudge",
              "1 — only the smudged NULL sale; the FK physically kept the ghosts out",
              "0 — a foreign key removes all NULLs",
            ],
            answer: 1,
            explain:
              "The ghosts never got in — you watched Error 1452 bounce them on Monday. But the FK permits NULL (unknown is not the same as fake), so the smudged sale is in your table and shows up with a NULL name. One row, not three.",
          },
        },
        {
          task: "Now run it: SELECT sales.sale_id, sales.snack_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id; in your Workbench. Count the NULL-name rows and compare with your prediction.",
          check: {
            question: "Your audit shows exactly one unexplained sale, where the mini server's messy ledger showed three. What made the difference?",
            choices: [
              "The FOREIGN KEY — bad references were refused at the door, so there's almost nothing to audit",
              "Real MySQL handles joins more accurately than the mini server",
              "Workbench automatically cleans NULL rows",
            ],
            answer: 0,
            explain:
              "Same query, cleaner answer — because Monday-you locked the door. This is the week's whole argument in one screen: constraints prevent the mess that audits can only discover.",
          },
        },
        {
          task: "Find your flops: run snacks LEFT JOIN sales (select snacks.name and sales.sale_id) on your real pair and read which snack names sit beside NULL. Then rewrite that exact query as a RIGHT JOIN that returns the same rows, run both, and confirm the grids match.",
          check: {
            question: "Your LEFT JOIN starts FROM snacks. To get the same rows from a RIGHT JOIN, you write…",
            choices: [
              "FROM snacks RIGHT JOIN sales — keep the FROM table, flip the word",
              "FROM sales RIGHT JOIN snacks — the protected table moves to the right of the join words",
              "You can't — RIGHT JOIN always returns different rows than LEFT JOIN",
            ],
            answer: 1,
            explain:
              "The survivor must sit where the join word points. snacks LEFT JOIN sales protects snacks from the left; sales RIGHT JOIN snacks protects it from the right. Two spellings, one grid.",
          },
        },
        {
          task: "Record it: add a '-- Day 3' section to week3.sql — the sales-side audit query, the snacks-side flop-finder, and your RIGHT JOIN rewrite, each with a comment saying what question it answers.",
          input:
            "Paste your Day 3 section of week3.sql, plus two sentences: which snacks are YOUR flops, and why your real audit found only one unexplained sale where the mini server found three",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "bug-hospital",
      optional: true,
      title: "🏥 Challenge: the bug hospital",
      intro:
        "Six patients, all outer joins that lost something. Each task shows the broken statement — diagnose it and run the CORRECTED version. Today's ward is harder than Monday's on purpose: half of these RUN without a single red line and still answer the wrong question, because the rows they dropped left no trace. Gulaman has never sold, and sale 4 points at a snack that doesn't exist.",
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
                  ["3", "2", "6"],
                  ["4", "9", "1"],
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
            "Patient 1 — the council asked for EVERY snack with its sale quantities, including the ones nobody bought. The script says:  SELECT snacks.name, sales.qty FROM snacks INNER JOIN sales ON snacks.snack_id = sales.snack_id;  It runs fine and Gulaman is missing. Run the corrected statement.",
          solution:
            "SELECT snacks.name, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;",
          explain:
            "INNER keeps only rows with a partner, so the snack with no sales silently vanished — the exact question being asked was the one INNER cannot answer. One word changed, and Gulaman reappears with NULL beside it.",
        },
        {
          goal:
            "Patient 2 — this one wants every SALE with its snack's name, including sale 4 whose snack doesn't exist. The script says:  SELECT sales.sale_id, snacks.name FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;  Sale 4 is nowhere in the output. Run the corrected statement.",
          solution:
            "SELECT sales.sale_id, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "LEFT was the right word and the tables were the wrong way round. LEFT JOIN protects whatever is written to its LEFT — this kept every snack when the question was about keeping every sale. Direction is the whole decision.",
        },
        {
          goal:
            "Patient 3 — the council wants every snack next to the SALE ID of each of its sales, unsold snacks included. The author reached for RIGHT:  SELECT snacks.name, sales.sale_id FROM snacks RIGHT JOIN sales ON snacks.snack_id = sales.snack_id;  Gulaman is missing again. Run the corrected statement.",
          solution:
            "SELECT snacks.name, sales.sale_id FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;",
          explain:
            "RIGHT keeps the table on the RIGHT — which here is sales, the opposite of what was wanted. The join type was outer and the protected side was still wrong. Say out loud which table must keep all its rows, then pick the word that points at it.",
        },
        {
          goal:
            "Patient 4 — the council wanted every snack with its price AND its sale quantities, and someone added a filter for real sales only:  SELECT snacks.name, snacks.price, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id WHERE sales.qty > 0;  It runs clean, and Gulaman has disappeared yet again. Get every snack back, still showing name, price and qty.",
          solution:
            "SELECT snacks.name, snacks.price, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id;",
          explain:
            "The nastiest bug of the week. The LEFT JOIN kept Gulaman with NULL in qty — then the WHERE asked whether NULL is greater than 0, which is not true, so the row was thrown away after all. A WHERE aimed at the nullable side of an outer join quietly turns it back into an INNER JOIN. Filter the kept side, never the optional one.",
        },
        {
          goal:
            "Patient 5 — refuses to run:  SELECT snacks.name, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id ORDER BY snack_id;  Run the corrected statement, ordered by the snack's number.",
          solution:
            "SELECT snacks.name, sales.qty FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id ORDER BY snacks.snack_id;",
          explain:
            "1052 in the order clause. Outer joins get no exemption from the dot rule — both notebooks still carry a snack_id, and the server still refuses to guess which you meant.",
        },
        {
          goal:
            "Patient 6, last one — refuses to run:  SELECT sales.qty, snacks.flavour FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;  The council wants every sale's quantity next to its snack's NAME, sale 4 included. Run the corrected statement.",
          solution:
            "SELECT sales.qty, snacks.name FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "1054 — snacks has no flavour column; the auditor invented it. Read the error's column name before you start rewriting the join: this one's LEFT JOIN was already perfect, and only the column was wrong. Six patients, and the joins themselves were correct in three of them.",
        },
      ],
    },
    {
      kind: "quest",
      id: "full-reconciliation",
      optional: true,
      title: "🔎 Challenge: the full reconciliation report",
      intro:
        "Real auditors end with a written reconciliation: every single discrepancy between the two records, each with the evidence that exposes it. Write the canteen's — using the mini server's messy ledger, where all the problems still exist.",
      missions: [
        {
          task: "Count the discrepancies first. In the messy ledger there are snacks that never sold, sales pointing at a snack that doesn't exist, and one sale pointing at nothing. Tally every individual discrepancy.",
          check: {
            question: "How many individual discrepancies does the full reconciliation list?",
            choices: [
              "3 — one per problem type",
              "4 — two flops and two ghosts; the smudge is not a discrepancy",
              "5 — two flops (Gulaman, Pastillas), two ghost sales (4 and 10), one smudged sale (7)",
            ],
            answer: 2,
            explain:
              "Five lines in the report: each flop, each ghost, and the smudge each get their own entry. An auditor who writes 'some rows have issues' gets asked to do it again.",
          },
        },
        {
          task: "Write the report as five numbered lines. Each line: WHAT is wrong (in plain words), WHICH rows prove it (names or sale_ids), and the exact query that exposes it. Two queries cover all five lines — say which query exposes which discrepancies.",
          input:
            "Paste your five-line reconciliation report, with the two queries and which lines each one proves",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-ghost-vendor",
    title: "⚔️ Boss battle: The Ghost Vendor",
    intro:
      "The Ghost Vendor sells snacks that don't exist and hides flops in plain sight. It thrived while INNER JOIN was your only lens — but you see everything now.",
    boss: { name: "the Ghost Vendor", emoji: "👻" },
    questions: [
      {
        prompt: "The canteen keeper asks: 'which snacks never sold?' Which query answers it?",
        choices: [
          "snacks INNER JOIN sales — then look for missing names",
          "snacks LEFT JOIN sales — then read which names sit beside NULL",
          "sales LEFT JOIN snacks — then count the rows",
        ],
        answer: 1,
        explain:
          "The question is about ALL snacks, so snacks must be the protected side. The never-sold ones are the rows whose sale columns came back NULL — INNER JOIN would have hidden exactly the rows you're looking for.",
      },
      {
        prompt: "In snacks LEFT JOIN sales, where do NULLs appear?",
        choices: [
          "In the snack columns, for sales without a snack",
          "Nowhere — LEFT JOIN fills gaps with 0",
          "In the sales columns, on rows for snacks that matched no sale",
        ],
        answer: 2,
        explain:
          "The protected table's rows always arrive whole. It's the OTHER side that may have nothing to offer — so the NULLs land in the un-protected table's columns.",
      },
      {
        prompt: "In sales LEFT JOIN snacks on the messy ledger, what do the ghost sales (snack_id 9) look like?",
        choices: [
          "They appear, with NULL in the snack's name and price columns",
          "They're dropped — no snack matches them",
          "They cause Error 1452",
        ],
        answer: 0,
        explain:
          "sales is protected, so the ghosts survive — dragging NULLs where snack data should be. (1452 is the FK refusing an INSERT; a SELECT never fires it.)",
      },
      {
        prompt: "snacks LEFT JOIN sales returns the same rows as…",
        choices: [
          "sales RIGHT JOIN snacks",
          "sales LEFT JOIN snacks",
          "snacks INNER JOIN sales",
        ],
        answer: 0,
        explain:
          "Same protected table (snacks), pointed at from the other side. LEFT and RIGHT are mirror spellings of one idea: name the survivor.",
      },
      {
        prompt: "The messy ledger: 6 snacks, 10 sales, 7 matches. Row counts for INNER, snacks LEFT JOIN sales, and sales LEFT JOIN snacks?",
        choices: [
          "7 · 9 · 10",
          "7 · 6 · 10",
          "10 · 9 · 7",
        ],
        answer: 0,
        explain:
          "INNER: the 7 matches. Snacks-side LEFT: 7 + the 2 never-sold snacks = 9. Sales-side LEFT: all 10 sales, three of them dragging NULLs. If you can rebuild these three numbers, you own today.",
      },
      {
        prompt: "A LEFT JOIN row shows Gulaman with NULL in every sale column. What is the row telling you?",
        choices: [
          "The query has a bug — NULL means error",
          "Gulaman exists in snacks but matched no sale",
          "Gulaman was deleted from snacks",
        ],
        answer: 1,
        explain:
          "NULL on the un-protected side is information, not damage: this row exists, its partner doesn't. That one sentence is most of today.",
      },
      {
        prompt: "Same WHERE, two joins — why the different results?",
        code: "-- LEFT JOIN + WHERE snacks.name = 'Pastillas'  → 1 row (NULL beside it)\n-- INNER JOIN + WHERE snacks.name = 'Pastillas' → 0 rows",
        choices: [
          "The WHERE runs before the LEFT JOIN but after the INNER JOIN",
          "Pastillas is misspelled in one of them",
          "The LEFT JOIN granted Pastillas a row despite having no sale; INNER dropped it before the WHERE could find it",
        ],
        answer: 2,
        explain:
          "INNER JOIN removed Pastillas from the world, so the WHERE had nothing to find. The LEFT JOIN kept it — 0 rows versus 1 row is the whole INNER-vs-LEFT decision in miniature.",
      },
      {
        prompt: "The smudged sale — snack_id is NULL. In sales LEFT JOIN snacks it…",
        choices: [
          "matches every snack, appearing 6 times",
          "appears once, with NULL for the snack's name — NULL matches nothing",
          "is dropped, because NULL can't join",
        ],
        answer: 1,
        explain:
          "NULL never equals anything, so the ON finds no partner — but sales is protected, so the row still arrives, NULLs and all. Dropped is what the INNER JOIN would do.",
      },
      {
        prompt: "Day-2 recall: the INNER JOIN returned 7 rows from 10 sales. Where did the other 3 go?",
        choices: [
          "They were deleted from the sales table",
          "MySQL moved them to a temporary table",
          "Nowhere — they're still in sales; INNER JOIN just doesn't return rows without a match",
        ],
        answer: 2,
        explain:
          "A join never changes the tables — it builds an answer from them. The 3 rows sat in sales the whole time, waiting for today's LEFT JOIN to reveal them.",
      },
      {
        prompt: "Day-2 recall: SELECT snack_id FROM sales INNER JOIN snacks ON … fails with Error 1052. Why, and what's the fix?",
        choices: [
          "Both tables have a snack_id column — qualify it: sales.snack_id or snacks.snack_id",
          "snack_id doesn't exist in either table — rename it",
          "INNER JOIN can't select id columns — use SELECT *",
        ],
        answer: 0,
        explain:
          "Ambiguous: the server won't guess which snack_id you meant. The dot names the table, and 1052 disappears. (1054 is its cousin: a column that exists NOWHERE in the join.)",
      },
      {
        prompt: "Day-1 recall: what does FOREIGN KEY (snack_id) REFERENCES snacks(snack_id) promise?",
        choices: [
          "Every sale's snack_id gets filled in automatically",
          "Every non-NULL snack_id in sales must exist in snacks — fakes bounce with Error 1452",
          "The two tables are merged into one",
        ],
        answer: 1,
        explain:
          "The door policy: reference something real or stay out. And as your real lab showed today, a locked ledger barely needs auditing — the FK made the ghosts impossible.",
      },
      {
        prompt: "Day-1 recall: on your locked pair, DELETE FROM snacks WHERE snack_id = 1; is refused with Error 1451. Why?",
        choices: [
          "Snack 1 has NULL values that can't be deleted",
          "Safe update mode blocks all deletes on parent tables",
          "Sales rows still reference snack 1 — deleting it would orphan them",
        ],
        answer: 2,
        explain:
          "The FK guards both doors: 1452 stops fake children coming in, 1451 stops referenced parents going out. Today's LEFT JOIN is how you SEE those relationships; the FK is how they're enforced.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The three joins, one line each in your own words: which rows each keeps, and where the NULLs appear.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
      "Paste today's SQL too.",
    ],
    note: "You can now see every problem in the ledger — the flops, the ghosts, the smudge, each with the query that exposes it. Tomorrow you fix all of it, and lock the ledger so it stays fixed.",
  },
};
