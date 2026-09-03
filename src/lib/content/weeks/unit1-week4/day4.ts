// unit1-week4 · Day 4 — Writing: executeUpdate, generated keys, and the locks in Java
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day4: DayPlan = {
  day: "Day 4",
  focus: "Changing things — row counts, generated ids, and week 3's locks refusing you in Java",
  warmupGame: {
    kind: "order",
    id: "warmup-write-shapes",
    title: "🧩 Warm-up: reading versus writing",
    intro:
      "Everything so far has been read-only: your program could be wrong and the data was never in danger. That ends this morning. Line up what changes.",
    rounds: [
      {
        prompt:
          "The two halves of JDBC, matched to what they return. Put the read pair first, then the write pair.",
        lines: [
          "executeQuery — for SELECT",
          "…returns a ResultSet you walk with next()",
          "executeUpdate — for INSERT, UPDATE and DELETE",
          "…returns an int: how many rows changed",
        ],
        explain:
          "Two methods, two return types, and calling the wrong one throws rather than guessing. The int is the part people ignore, and it's the only thing your program will ever be told about whether the write did what you meant.",
      },
      {
        prompt:
          "What an int of 0 back from executeUpdate means. Put the true readings first; one line in the pile is false.",
        lines: [
          "The statement ran perfectly — the server is not complaining about anything",
          "It matched no rows, so nothing changed",
          "Usually that means your WHERE aimed at something that isn't there",
        ],
        distractors: ["The statement failed and an exception was thrown"],
        explain:
          "0 is a success, not an error. That's exactly what makes it dangerous: 'I updated the record' and 'I updated nothing' come back through the same code path, and only the number tells them apart. Check it, or your program will cheerfully report that it saved something it didn't.",
      },
      {
        prompt:
          "The order of a transaction — several writes that must all happen or none of them. Five steps.",
        lines: [
          "conn.setAutoCommit(false)",
          "run the first statement",
          "run the second statement",
          "conn.commit() — both become real together",
          "in the catch: conn.rollback() — neither ever happened",
        ],
        explain:
          "Without setAutoCommit(false), every statement commits itself the instant it runs — which is fine for one write and disastrous for two related ones, because a failure halfway leaves the first change permanent and the second missing. That state is what a transaction exists to make impossible.",
      },
    ],
  },
  videos: [
    {
      title: "JDBC Transactions with Example",
      youtubeId: "SqeKIQlGvnE",
      length: "7:41",
      practice: {
        intro: "A different channel for this one — Java Guides. Watch it after the console, not before. Then:",
        steps: [
          "Write down the three calls it uses: the one that turns autocommit off, the one that makes the work real, and the one that throws it away.",
          "Note WHERE it puts each of the three. Two of them are easy; the third is in the catch block, and forgetting it is the bug in today's clinic.",
        ],
      },
    },
  ],
  activities: [
    {
      kind: "sql-console",
      id: "writes-and-refusals",
      title: "🖥️ Mini server: every write your program will attempt",
      intro:
        "Before Java changes anything, work out exactly what the server will say. Two of these get refused — by the same lock you built on Thursday of week 3, throwing the same numbers — and one of them shows you a safety net that will NOT be there when your Java runs. That last one matters more than it looks.",
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
                  ["4", "3", "2026-08-11", "3"],
                  ["5", "2", "2026-08-12", "6"],
                  ["6", "1", "2026-08-12", "2"],
                  ["7", null, "2026-08-13", "1"],
                  ["8", "5", "2026-08-13", "3"],
                  ["9", "3", "2026-08-14", "4"],
                  ["10", "3", "2026-08-14", "2"],
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
            "This mini server holds the ledger's data but not its lock. Put the lock back on, exactly as you did in week 3: a FOREIGN KEY on sales.snack_id referencing snacks(snack_id).",
          solution: "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);",
          hint: "ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);",
          explain:
            "Query OK — the data was already clean, so the server agreed. Everything below now happens on a locked pair, which is the state your real database has been in since last Thursday. The refusals you're about to trigger are the ones your Java program will meet.",
        },
        {
          goal: "The ordinary write. Log sale 11: snack 2 (Turon), 2026-08-15, quantity 3.",
          solution: "INSERT INTO sales VALUES (11, 2, '2026-08-15', 3);",
          hint: "INSERT INTO sales VALUES (11, 2, '2026-08-15', 3);",
          explain:
            "1 row affected. Remember that number — in Java it comes back as the int from executeUpdate, and it is the ONLY confirmation your program gets that the sale was recorded.",
        },
        {
          goal:
            "Now the write your program must survive: a sale of snack 9, which doesn't exist. Try sale 12, snack 9, 2026-08-15, quantity 1.",
          solution: "INSERT INTO sales VALUES (12, 9, '2026-08-15', 1);",
          predict: {
            question: "The lock is on. What does the server do?",
            choices: [
              "Refuses with 1452 — the same foreign key error you triggered by hand in week 3",
              "Accepts it; foreign keys only apply to statements typed by a person",
              "Accepts it and creates snack 9",
            ],
            answer: 0,
            explain:
              "The lock lives in the database, not in whichever program is talking to it. Workbench, your Java, anything else — same table, same promise, same refusal.",
          },
          explain:
            "Error 1452. In Java this arrives as a SQLException whose getErrorCode() returns exactly 1452 — the number you already know. Your program doesn't need to check whether a snack exists before inserting; the database will tell it. What your program DOES need is to catch that and say something a canteen worker can understand.",
        },
        {
          goal: "An ordinary correction: sale 5 was really 7 items, not 6. Fix it.",
          solution: "UPDATE sales SET qty = 7 WHERE sale_id = 5;",
          hint: "UPDATE sales SET qty = 7 WHERE sale_id = 5;",
          explain:
            "1 row affected. Aimed by the primary key, so exactly one row could ever match — which is what you want every UPDATE from a program to be able to say for itself.",
        },
        {
          goal:
            "The silent one. Correct a sale that isn't there: set qty to 9 where sale_id = 999.",
          solution: "UPDATE sales SET qty = 9 WHERE sale_id = 999;",
          predict: {
            question: "There is no sale 999. What happens?",
            choices: [
              "Error — you cannot update a row that doesn't exist",
              "0 rows affected, no error at all: the statement ran perfectly and changed nothing",
              "It creates sale 999",
            ],
            answer: 1,
            explain:
              "Matching nothing is not a failure. The statement did exactly what it was told; there was simply nothing to change.",
          },
          explain:
            "0 rows affected, green light. This is the number your Java has to look at. A program that runs this and then prints 'Sale updated!' is lying, and no exception will ever correct it — the only difference between success and doing nothing is an int that most people throw away.",
        },
        {
          goal:
            "The refusal from the other side: the canteen drops Kwek-kwek from the menu. DELETE snack 3.",
          solution: "DELETE FROM snacks WHERE snack_id = 3;",
          predict: {
            question: "Sales 2, 4, 9 and 10 point at Kwek-kwek. What does the server do?",
            choices: [
              "Refuses with 1451 — deleting it would leave those sales pointing at nothing",
              "Deletes it and sets those sales' snack_id to NULL",
              "Deletes it along with all four sales",
            ],
            answer: 0,
            explain:
              "1451 guards the parent side, exactly as it did in week 3. The database will not let your program orphan rows, however confidently the program asks.",
          },
          explain:
            "Error 1451. Worth noticing what this means for your app's design: 'delete this snack' cannot be a button that always works. Either the screen explains why it was refused, or it offers to deal with the sales first. The constraint just told you something true about the business.",
        },
        {
          goal: "The same delete on a snack nothing points at: remove Gulaman, snack 4.",
          solution: "DELETE FROM snacks WHERE snack_id = 4;",
          explain:
            "1 row affected. Gulaman never sold — you found that with the anti-join last week — so nothing depends on it and it goes quietly. Same statement, same lock, opposite outcome, decided entirely by the data.",
        },
        {
          goal:
            "The safety net you're about to lose. Try an UPDATE with no WHERE at all: set every sale's qty to 1.",
          solution: "UPDATE sales SET qty = 1;",
          predict: {
            question: "This mini server emulates Workbench's safe-update mode. What happens?",
            choices: [
              "Error 1175 — safe update mode refuses an UPDATE that isn't aimed by a key",
              "Every sale is set to 1",
              "Error 1451, because sales are referenced",
            ],
            answer: 0,
            explain:
              "1175 is Workbench's seatbelt, and it has saved a lot of people from a very bad afternoon.",
          },
          explain:
            "Error 1175, refused. Now the part that should make you sit up: that seatbelt is a WORKBENCH setting, not a database rule. Your Java program connects without it. The exact statement you were just protected from runs, silently, and updates every row in the table. From today, the WHERE clause is the only thing standing between your program and the whole table.",
        },
        {
          goal:
            "Compose it yourself, and check your aim first: record today's sale — sale 13, Siopao, 2026-08-15, quantity 2. Look up Siopao's id in the snack list rather than guessing it.",
          solution: "INSERT INTO sales VALUES (13, 5, '2026-08-15', 2);",
          explain:
            "1 row affected — Siopao is snack 5. Your Java will do exactly this: find the id, then write the row. And when the id is wrong, it will meet 1452 rather than quietly writing a lie, which is the entire reason last week existed.",
        },
      ],
    },
    {
      kind: "typing",
      id: "typing-write",
      title: "⌨️ Type the write",
      caseSensitive: true,
      intro:
        "Same shape as yesterday, one method different — and one new trick for getting back the id the server invented. Case-sensitive, as always.",
      rounds: [
        {
          prompt: "The write method, and what it hands back. Type the type and the call.",
          template: "{int rows = ps.executeUpdate()};",
          explain:
            "executeUpdate for anything that changes rows, and it returns a count, not a ResultSet. Empty parentheses on a PreparedStatement — same rule as executeQuery.",
        },
        {
          prompt: "Check the count instead of assuming. Type the condition for 'nothing changed'.",
          template: "if ({rows == 0})",
          explain:
            "The line that separates a program that reports the truth from one that just says 'Saved!' whatever happened. 0 is a legal, silent, exception-free outcome.",
        },
        {
          prompt: "Prepare a statement that will hand back the id MySQL generates. Type the second argument.",
          template:
            "PreparedStatement ps = conn.prepareStatement(sql, {Statement.RETURN_GENERATED_KEYS});",
          explain:
            "You have to ask for it up front — the driver won't collect the id unless you said you wanted it before executing. That's the part people miss, and the symptom is an empty result later with no error.",
        },
        {
          prompt: "Collect the generated key after the insert. Type the call.",
          template: "ResultSet keys = {ps.getGeneratedKeys()};",
          explain:
            "It comes back as a ResultSet — one row, one column — so all of yesterday's cursor rules apply, including having to call next() before reading it.",
        },
        {
          prompt: "Read the new id out of that ResultSet. Type both parts.",
          template: "int newId = {keys.getInt(1)}; // only after {keys.next()} returns true",
          explain:
            "By number here, because the column has no useful name — this is the rare place where getInt(1) is the normal way to write it. And remember: 1, not 0.",
        },
        {
          prompt: "Start a transaction. Type the call that stops each statement committing itself.",
          template: "{conn.setAutoCommit(false)};",
          explain:
            "By default every statement commits the instant it runs. Turning that off is what makes 'both or neither' possible — and once you turn it off, nothing is saved until you say so.",
        },
        {
          prompt: "The two calls that end a transaction, in the two places they belong.",
          template: "{conn.commit()}; // and in the catch: {conn.rollback()};",
          explain:
            "Commit at the end of the happy path, rollback in the catch. Forget the rollback and a failed transaction sits there holding locks until the connection closes — everything after it in that connection is running inside a transaction nobody meant to open.",
        },
        {
          prompt:
            "From memory: the whole safe insert — prepare with generated keys, set two values, execute, capture the count.",
          template:
            "{PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS); ps.setInt(1, snackId); ps.setInt(2, qty); int rows = ps.executeUpdate();}",
          explain:
            "Placeholders from yesterday, executeUpdate from today, and a count you are about to actually look at. That's the write half of every database program you will ever write.",
        },
      ],
    },
    {
      kind: "order",
      id: "order-write-program",
      title: "🧩 Puzzle: writes that tell the truth",
      intro:
        "Three programs. The first records a sale honestly, the second recovers a generated id, the third makes two writes inseparable. Every distractor is a line that compiles and lies.",
      rounds: [
        {
          prompt:
            "Record a sale and report what actually happened. Note where the row count is used.",
          lines: [
            "String sql = \"INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, ?, ?)\";",
            "try (PreparedStatement ps = conn.prepareStatement(sql)) {",
            "    ps.setInt(1, snackId);",
            "    ps.setString(2, soldOn);",
            "    ps.setInt(3, qty);",
            "    int rows = ps.executeUpdate();",
            "    System.out.println(rows == 1 ? \"Sale recorded.\" : \"Nothing was recorded.\");",
            "}",
          ],
          distractors: [
            "    ps.executeUpdate();",
            "    System.out.println(\"Sale recorded.\");",
          ],
          explain:
            "The two distractors together are the version almost everyone writes first: run the statement, throw the count away, announce success. It is right most of the time, which is precisely why the times it's wrong go unnoticed for months.",
        },
        {
          prompt:
            "Insert a snack and find out what id the server gave it — the AUTO_INCREMENT you set up in week 2. Seven lines.",
          lines: [
            "String sql = \"INSERT INTO snacks (name, price) VALUES (?, ?)\";",
            "try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {",
            "    ps.setString(1, name);",
            "    ps.setInt(2, price);",
            "    ps.executeUpdate();",
            "    try (ResultSet keys = ps.getGeneratedKeys()) {",
            "        if (keys.next()) System.out.println(\"New snack id: \" + keys.getInt(1));",
            "    }",
            "}",
          ],
          distractors: [
            "    try (PreparedStatement ps = conn.prepareStatement(sql)) {",
            "        int newId = keys.getInt(1);",
          ],
          explain:
            "Two impostors. The plain prepareStatement is the reason getGeneratedKeys so often comes back empty — you have to ask for the keys BEFORE executing, not after. And reading the key without calling next() is yesterday's 'before start of result set', in a place people forget a ResultSet even is one.",
        },
        {
          prompt:
            "Two writes that must not happen separately: record the sale AND reduce the stock count. Assemble the transaction.",
          lines: [
            "conn.setAutoCommit(false);",
            "try {",
            "    recordSale(conn, snackId, qty);",
            "    reduceStock(conn, snackId, qty);",
            "    conn.commit();",
            "} catch (SQLException e) {",
            "    conn.rollback();",
            "    System.out.println(\"Nothing was saved: \" + e.getMessage());",
            "}",
          ],
          distractors: ["    conn.setAutoCommit(true);"],
          explain:
            "The impostor is the line that turns autocommit back ON in the middle of the work — which commits the transaction then and there, so the two writes stop being all-or-nothing without a single visible change to either of them. Put the connection back to autocommit AFTER the commit or rollback, never between the writes.",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: the canteen app starts writing",
      intro:
        "Your program has been a reader all week. Today it becomes something Aling Nena could actually use to record a sale — including the part where it tells her, honestly, when it couldn't.",
      missions: [
        {
          task: "New file, RecordSale.java. Take snack_id, date and quantity from args, insert the sale with a PreparedStatement, capture the int from executeUpdate, and print 'Sale recorded.' only when that int is 1. Run it with a real snack id and check the row landed with a SELECT.",
          check: {
            question: "Why print based on the count rather than just after the call?",
            choices: [
              "Because executeUpdate can succeed without changing anything, and a message that ignores the count is a claim you never verified",
              "Because printing before the call would be out of order",
              "Because executeUpdate is asynchronous",
            ],
            answer: 0,
            explain:
              "Every honest write reports what it actually did. It costs one if statement, and it's the difference between an app that can be trusted and one that is usually right.",
          },
        },
        {
          task: "Now make your own lock fire from Java. Run RecordSale with a snack id that does not exist in your snacks table. Catch the SQLException and print e.getErrorCode() alongside a message a canteen worker would understand — something like 'There's no snack with that number.'",
          check: {
            question: "What error code did your program print?",
            choices: [
              "1452 — the same foreign key violation you triggered by hand in week 3, arriving in Java",
              "1064, a syntax error",
              "0, because the exception came from the driver",
            ],
            answer: 0,
            explain:
              "That number crossing from Workbench into your Java is the whole unit joining up. The lock is in the database, so it protects the data from every program equally — and your app's job is not to re-implement the check, but to translate the refusal into something a person can act on.",
          },
        },
        {
          task: "Recover a generated id. Write AddSnack.java: insert a new snack with a PreparedStatement prepared with Statement.RETURN_GENERATED_KEYS, then read the new snack_id out of getGeneratedKeys and print it. (If your snacks table has no AUTO_INCREMENT id, use the table you designed in week 3 that does.)",
          check: {
            question: "Why does the server have to tell you the id instead of your program working it out?",
            choices: [
              "Because the id is random",
              "Because only the server knows what it assigned — anything your program computes, like 'the highest id plus one', is a guess that two users running at the same time will both get wrong",
              "Because AUTO_INCREMENT ids are not stored in the table",
            ],
            answer: 1,
            explain:
              "SELECT MAX(id) + 1 is the classic wrong answer, and it works perfectly until two people press the button in the same second. Ask the server what it did; don't predict it.",
          },
        },
        {
          task: "Make two writes inseparable. In TransferSale.java, do two updates in one transaction — move a sale from one snack to another, however that makes sense in your data — with setAutoCommit(false), a commit at the end and a rollback in the catch. Then break the second statement on purpose (aim it at a column that doesn't exist), run it, and confirm with a SELECT that the FIRST update did not survive.",
          check: {
            question: "What did the SELECT show after the deliberate failure?",
            choices: [
              "The first update was still applied — rollback only affects the failed statement",
              "Neither update was applied — rollback undid the whole transaction, which is the entire point",
              "The table was locked and unreadable",
            ],
            answer: 1,
            explain:
              "Both or neither. Seeing the first write vanish is the moment transactions stop being a word and start being a tool — and it's worth noticing that WITHOUT the transaction, that half-finished state would have been permanent and completely silent.",
          },
        },
        {
          task: "Add today's work to week4-notes.md: the row counts you saw, the error code your lock produced, the id the server generated, and what the SELECT showed after your rollback.",
          input:
            "Paste RecordSale.java, plus the error code your foreign key produced and one sentence on what the rollback proved",
        },
      ],
    },
    {
      kind: "quest",
      id: "the-count",
      title: "🔢 Quest: the number nobody looks at",
      intro:
        "executeUpdate hands you an int and most programs drop it on the floor. Four questions about what that number is actually telling you — and one about the seatbelt you no longer have.",
      missions: [
        {
          task: "Predict before you check. Your program runs UPDATE sales SET qty = 5 WHERE sale_id = 999, and there is no sale 999.",
          check: {
            question: "What does executeUpdate return, and what does your catch block see?",
            choices: [
              "It throws a SQLException, and the catch reports it",
              "It returns 0 and throws nothing — the catch block never runs, and only that 0 distinguishes this from success",
              "It returns -1 to signal 'not found'",
            ],
            answer: 1,
            explain:
              "'Nothing matched' is a successful statement. If your program only reacts to exceptions, it cannot tell 'I saved your change' from 'I did nothing at all' — and it will confidently print the first one.",
          },
        },
        {
          task: "Now the opposite mistake. Your program runs UPDATE sales SET qty = 1 with no WHERE clause, against a table of 500 rows.",
          check: {
            question: "What happens, given that your JDBC connection has no Workbench safe-update mode?",
            choices: [
              "Error 1175, the same refusal you saw in the console",
              "500 rows affected — every row rewritten, no warning, no undo unless you were inside a transaction",
              "It updates only the first row",
            ],
            answer: 1,
            explain:
              "Safe updates is a Workbench setting, not a database rule, and your program didn't ask for it. This is the single most expensive difference between typing SQL and sending it from code: the seatbelt was never in the car. Autocommit makes it permanent immediately.",
          },
        },
        {
          task: "Think about what that means for how you write. Which habit actually protects you from the previous question?",
          check: {
            question: "Pick the one that works.",
            choices: [
              "Always aim an UPDATE or DELETE by a key, and check the returned count against the number of rows you expected to change",
              "Run every statement inside a transaction and hope you notice",
              "Enable safe update mode from Java with a SET statement at the start of every program",
            ],
            answer: 0,
            explain:
              "Aim, then verify. 'I expected 1 and got 47' is a bug your program can catch by itself, in the same breath as the write — and inside a transaction, it can still choose not to commit. (You CAN send a SET statement, but relying on remembering it is the kind of protection that fails on the one program where you forget.)",
          },
        },
        {
          task: "The generated key. You insert a snack into a table whose snack_id is AUTO_INCREMENT — your week 2 work — and call getGeneratedKeys, and it comes back empty with no error.",
          check: {
            question: "What did you forget?",
            choices: [
              "To call keys.next() before reading — and possibly to prepare the statement with Statement.RETURN_GENERATED_KEYS in the first place",
              "To commit the transaction",
              "To declare the column AUTO_INCREMENT",
            ],
            answer: 0,
            explain:
              "Both are silent failures. The driver only collects generated keys if you asked before executing, and the keys arrive as a ResultSet, so the cursor rules apply — an empty-looking result is usually a missing next().",
          },
        },
        {
          task: "Write your own rule for writes, in three lines: what you always check after an executeUpdate, what you always include in an UPDATE or DELETE, and when you turn autocommit off. Keep it short enough to actually follow.",
          input: "Paste your three-line rule for writing from Java",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic: writing edition",
      intro:
        "Six patients that change data — or believe they do. Four are silent. Writing is where silent bugs stop being embarrassing and start being expensive, because the wrong answer is now stored.",
      missions: [
        {
          task: "Patient 1. java.sql.SQLException: Can not issue data manipulation statements with executeQuery(). The statement is an UPDATE.",
          check: {
            question: "The fix?",
            choices: [
              "Use executeUpdate — executeQuery is for statements that return rows",
              "Add a SELECT to the end of the UPDATE",
              "Set autocommit to false first",
            ],
            answer: 0,
            explain:
              "An UPDATE has no rows to hand back, so the driver refuses rather than returning something meaningless. A good, loud error — it fails at the call, not later.",
          },
        },
        {
          task: "Patient 2, silent. A program records sales all day and users report that some 'saved' sales aren't there the next morning. The code calls ps.executeUpdate(); and then prints 'Saved!'",
          check: {
            question: "What is the program failing to notice?",
            choices: [
              "That executeUpdate returned 0 for those sales — the statement ran, matched or inserted nothing, and the success message was printed anyway",
              "That the database is dropping rows overnight",
              "That the connection closed too early",
            ],
            answer: 0,
            explain:
              "Every one of those users saw a confirmation. The count was there the whole time and nobody read it. Note the shape of the report — 'some, not all' — which is the same data-shaped signature as the NULL bug on Tuesday.",
          },
        },
        {
          task: "Patient 3, silent and expensive. A maintenance script ran UPDATE sales SET qty = 1 from Java. It was tested in Workbench first, where it refused to run.",
          check: {
            question: "What happened when it ran from Java?",
            choices: [
              "It refused there too — safe updates is a server setting",
              "It updated every row in the table, because safe-update mode is a Workbench feature the JDBC connection never had",
              "It updated nothing, because there was no WHERE clause",
            ],
            answer: 1,
            explain:
              "The Workbench refusal gave a false sense that the statement was protected by the database. It wasn't; it was protected by the client. Testing in one client proves nothing about another one — and this is why an UPDATE or DELETE without a WHERE should look wrong to you on sight from now on.",
          },
        },
        {
          task: "Patient 4. java.sql.SQLIntegrityConstraintViolationException with getErrorCode() 1452, when inserting a sale.",
          check: {
            question: "What is the right response IN YOUR PROGRAM?",
            choices: [
              "Catch it and tell the user the snack number doesn't exist — the database did the checking, your job is to translate the refusal",
              "Remove the foreign key so the insert can succeed",
              "Retry the insert until it works",
            ],
            answer: 0,
            explain:
              "1452 is the lock working. Deleting the constraint to make an error go away recreates exactly the mess week 3 spent five days cleaning up — and the alternative, checking in Java first, still can't be relied on, because between your check and your insert somebody else can delete the snack.",
          },
        },
        {
          task: "Patient 5, silent. A transaction is opened with setAutoCommit(false), both statements run without error, the program prints 'Done' and exits. Nothing is in the table afterwards.",
          check: {
            question: "What's missing?",
            choices: [
              "conn.commit() — with autocommit off, nothing is real until you commit, and closing the connection instead rolls the work back",
              "A second setAutoCommit(true)",
              "The statements needed executeUpdate rather than executeQuery",
            ],
            answer: 0,
            explain:
              "This is the classic first transaction bug, and it's the mirror of Patient 3: turning autocommit off changes the rules for everything that follows, and forgetting the commit silently discards a whole session's work.",
          },
        },
        {
          task: "Patient 6, silent. A transaction fails, the catch block prints the error, and the program carries on using the same connection for other work. Later statements behave strangely and some changes vanish.",
          check: {
            question: "What did the catch block forget?",
            choices: [
              "conn.rollback() — the failed transaction is still open, so everything afterwards is running inside it",
              "To close the ResultSet",
              "To re-prepare the statement",
            ],
            answer: 0,
            explain:
              "Printing an error is not handling it. Without a rollback the connection is still mid-transaction, holding locks and accumulating work that a later failure — or a close — will throw away wholesale. Catch, roll back, THEN report.",
          },
        },
        {
          task: "Discharge notes, six lines. Then answer this: four of these six threw nothing at all. What single habit would have caught the most of them?",
          input:
            "Paste your six discharge notes plus your answer about the one habit that catches the most silent write bugs",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-ledger-keeper",
    title: "⚔️ Boss battle: The Ledger Keeper",
    intro:
      "The Ledger Keeper allows every write and reports none of them. It answers 'did that work?' with silence, and it is perfectly happy to let you believe you saved something. Make it account for every row.",
    boss: { name: "the Ledger Keeper", emoji: "📓" },
    questions: [
      {
        prompt: "executeUpdate returns 0 after your UPDATE. What happened?",
        choices: [
          "The statement failed and an exception is coming",
          "The statement ran fine and matched no rows — a success that changed nothing",
          "The connection was closed",
        ],
        answer: 1,
        explain:
          "0 is a legal outcome, not an error. Only reading that int distinguishes 'saved your change' from 'did nothing' — nothing else in the program will ever mention it.",
      },
      {
        prompt: "Which method for an INSERT, and what comes back?",
        choices: [
          "executeQuery, returning a ResultSet of the inserted rows",
          "executeUpdate, returning an int — the number of rows changed",
          "Either; they're interchangeable for writes",
        ],
        answer: 1,
        explain:
          "executeQuery on an INSERT throws 'Can not issue data manipulation statements with executeQuery()'. The methods are not interchangeable, and the driver says so at the call.",
      },
      {
        prompt:
          "You run UPDATE sales SET qty = 1 (no WHERE) from Java against 500 rows. Workbench refused this exact statement yesterday.",
        choices: [
          "It refuses too — 1175 comes from the server",
          "All 500 rows are rewritten: safe-update mode is a Workbench setting your JDBC connection never had",
          "Only the first row changes",
        ],
        answer: 1,
        explain:
          "The seatbelt belonged to the client, not the car. With autocommit on it is permanent the instant it runs — the single most expensive difference between typing SQL and sending it from a program.",
      },
      {
        prompt: "getGeneratedKeys comes back empty, with no error, after an insert into an AUTO_INCREMENT table.",
        choices: [
          "The statement wasn't prepared with Statement.RETURN_GENERATED_KEYS, or next() was never called on the keys",
          "The table needs a PRIMARY KEY",
          "Generated keys only work inside a transaction",
        ],
        answer: 0,
        explain:
          "You must ask for the keys BEFORE executing, and what comes back is a ResultSet — so yesterday's cursor rules apply, including moving before reading.",
      },
      {
        prompt: "Why ask the server for the generated id instead of computing MAX(id) + 1 yourself?",
        choices: [
          "Because MAX is slow on large tables",
          "Because only the server knows what it assigned — two users inserting at the same moment would both compute the same 'next' id",
          "Because AUTO_INCREMENT ids aren't stored in the table",
        ],
        answer: 1,
        explain:
          "The classic wrong answer, and it works flawlessly until the day two people press the button in the same second. Ask what happened; don't predict it.",
      },
      {
        prompt: "Your insert throws with getErrorCode() 1452. What is the correct response in your app?",
        choices: [
          "Drop the foreign key so the insert succeeds",
          "Catch it and tell the user the referenced row doesn't exist — the database did the checking, you translate the refusal",
          "Retry until it succeeds",
        ],
        answer: 1,
        explain:
          "1452 is the lock doing its job, unchanged from week 3. Checking in Java first isn't a substitute either: between your check and your insert, somebody else can delete the parent.",
      },
      {
        prompt: "What does conn.setAutoCommit(false) change?",
        choices: [
          "Statements stop committing themselves, so nothing is permanent until conn.commit()",
          "It makes all statements read-only",
          "It disables foreign key checks for the connection",
        ],
        answer: 0,
        explain:
          "It changes the rules for everything that follows on that connection — which is why forgetting the commit silently discards the work, and forgetting the rollback in a catch leaves the transaction open underneath everything after it.",
      },
      {
        prompt: "A transaction fails. The catch prints the message and carries on with the same connection. What's wrong?",
        choices: [
          "Nothing — reporting the error is handling it",
          "The missing rollback leaves the failed transaction open, so everything afterwards runs inside it",
          "The connection should have been closed and reopened",
        ],
        answer: 1,
        explain:
          "Catch, roll back, then report. Printing an error is not handling it — the connection is still mid-transaction, holding locks, accumulating work that will be discarded wholesale later.",
      },
      {
        prompt: "Which habit catches the most silent write bugs?",
        choices: [
          "Wrapping everything in try/catch",
          "Aiming every UPDATE and DELETE by a key, and comparing the returned count against the number of rows you expected",
          "Logging every SQL statement you send",
        ],
        answer: 1,
        explain:
          "Try/catch never fires for these, because none of them throw. 'I expected 1 and got 47' — or 0 — is a bug your program can catch in the same breath as the write, and inside a transaction it can still decide not to commit.",
      },
      {
        prompt:
          "SQL recall: your program deletes a snack and gets 1451. Which fact from week 3 explains it, and what else fires the same code?",
        choices: [
          "Sales still reference that snack — and the same 1451 fires if you try to UPDATE the snack's id, because the constraint protects the relationship, not the row",
          "The snack doesn't exist; 1451 means 'not found'",
          "The table is locked by another connection",
        ],
        answer: 0,
        explain:
          "1452 keeps fakes out, 1451 keeps a referenced parent in place — for deletes AND key updates — and 3730 stops the parent table being dropped. Same three doors, now arriving in Java through getErrorCode().",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "What executeUpdate returns, and what a 0 means.",
      "The safety net you lost by moving from Workbench to Java, and what you do instead.",
      "The two calls that make several writes inseparable, and where each one goes.",
      "The error code your own foreign key produced from Java, and what your program said to the user about it.",
      "What surprised you or broke today, and why it happened.",
      "Paste today's Java.",
    ],
    note: "Your program can now read and write, safely, and it reports honestly when it didn't. That is a real application — small, but real. Tomorrow you put the whole week together on a database you've never seen, and hand in the thing you built.",
  },
};
