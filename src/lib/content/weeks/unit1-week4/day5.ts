// unit1-week4 · Day 5 — Prove it: the whole week, on a database you've never seen
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Prove it — assemble the app, face an unfamiliar database, and hand it in",
  warmupGame: {
    kind: "typing",
    id: "warmup-day5",
    title: "⌨️ Warm-up: the whole week, from memory",
    caseSensitive: true,
    intro:
      "No new syntax today, and nothing here you haven't typed already. Ten statements covering the entire week — connect, read, send a value safely, write, and make two writes inseparable. Case-sensitive, whole lines. If these come out of your fingers without thinking, the week is yours.",
    rounds: [
      {
        prompt: "The one import that brings in all of JDBC.",
        template: "{import java.sql.*;}",
        explain: "Connection, Statement, PreparedStatement, ResultSet, SQLException — all of it, one line.",
      },
      {
        prompt: "From memory: open a connection to url with user and password, so it closes itself.",
        template: "{try (Connection conn = DriverManager.getConnection(url, user, password))}",
        explain:
          "Monday's line, and still the one everything else happens inside. Nothing this week works without a live Connection.",
      },
      {
        prompt: "Ask the connection for a plain statement, then send a SELECT.",
        template: "{Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql);}",
        explain:
          "The read path — safe only while every part of that SQL was written by you. The moment a value comes from outside, this becomes the wrong tool.",
      },
      {
        prompt: "The loop that walks every row of a result.",
        template: "{while (rs.next())}",
        explain: "The cursor starts before row 1, so you move before you read — every time, for any number of rows.",
      },
      {
        prompt: "Read a text column and a number column out of the current row, by label.",
        template: "{String name = rs.getString(\"name\"); int qty = rs.getInt(\"qty\");}",
        explain: "By label, not by number. And remember what getInt does with a NULL: hands you 0 and says nothing.",
      },
      {
        prompt: "The test that tells a real 0 from a NULL, immediately after reading the column.",
        template: "{if (rs.wasNull())}",
        explain:
          "It describes the column you read most recently, so it goes straight after the get. Tuesday's silent bug, in one line.",
      },
      {
        prompt: "From memory: prepare a lookup with one hole, fill it with a typed name, and run it.",
        template:
          "{PreparedStatement ps = conn.prepareStatement(sql); ps.setString(1, typedName); ResultSet rs = ps.executeQuery();}",
        explain:
          "Wednesday's three lines. Parameter 1, no quotes around the ?, and empty parentheses on executeQuery. This is the shape you use for the rest of your career.",
      },
      {
        prompt: "Run a write and keep the number it gives back.",
        template: "{int rows = ps.executeUpdate();}",
        explain:
          "The int is the only confirmation your program ever gets. 0 means the statement ran perfectly and changed nothing.",
      },
      {
        prompt: "Prepare an insert so the server will hand back the id it generates.",
        template: "{PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);}",
        explain:
          "Asked for up front, never afterwards. Forget it and getGeneratedKeys comes back empty with no error at all.",
      },
      {
        prompt: "The three calls that make several writes all-or-nothing — off, commit, roll back.",
        template: "{conn.setAutoCommit(false); conn.commit(); conn.rollback();}",
        explain:
          "Off before the work, commit at the end of the happy path, rollback in the catch. Forget the third and everything after the failure runs inside a transaction nobody meant to leave open. That's the week.",
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "sql-console",
      id: "week4-gauntlet",
      title: "🖥️ The whole unit, on a ledger you've never seen",
      intro:
        "Not the canteen. The school's chess club keeps a member list and a record of every membership payment, and they disagree in ways you now recognise on sight. Work out every query and every write your program would need — including the two it will be refused. Everything from weeks 3 and 4 is in here, deliberately out of order.",
      setup: {
        databases: [
          {
            name: "school",
            tables: [
              {
                name: "members",
                columns: [
                  { name: "member_id", type: "INT", pk: true },
                  { name: "name", type: "VARCHAR(50)" },
                  { name: "year_level", type: "INT" },
                ],
                rows: [
                  ["1", "Rosa", "9"],
                  ["2", "Emil", "10"],
                  ["3", "Nena", "9"],
                  ["4", "Ligaya", "11"],
                  ["5", "Tomas", "10"],
                ],
              },
              {
                name: "dues",
                columns: [
                  { name: "due_id", type: "INT", pk: true },
                  { name: "member_id", type: "INT" },
                  { name: "paid_on", type: "DATE" },
                  { name: "amount", type: "INT" },
                ],
                rows: [
                  ["1", "1", "2026-08-03", "50"],
                  ["2", "3", "2026-08-03", "50"],
                  ["3", "7", "2026-08-04", "50"],
                  ["4", "1", "2026-08-10", "50"],
                  ["5", null, "2026-08-10", "25"],
                  ["6", "2", "2026-08-11", "50"],
                  ["7", "7", "2026-08-11", "50"],
                  ["8", "3", "2026-08-12", "50"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal: "Learn the shape before writing a line of Java: what columns does dues actually have?",
          solution: "DESCRIBE dues;",
          hint: "DESCRIBE dues;",
          explain:
            "due_id, member_id, paid_on, amount. Those four strings are what your getters will ask for, and nothing but a running program will tell you if you misspell one. Monday's first habit, on an unfamiliar database.",
        },
        {
          goal: "Read the parent list: every member.",
          solution: "SELECT * FROM members;",
          hint: "SELECT * FROM members;",
          explain: "5 members, ids 1 to 5. Nothing here is wrong — the mess, as always, is in the child table.",
        },
        {
          goal: "Now the payments, all of them. Look hard at member_id.",
          solution: "SELECT * FROM dues;",
          hint: "SELECT * FROM dues;",
          explain:
            "8 payments — and member 7 appears twice, though no such member exists, while payment 5 names nobody at all. Same two problems as the canteen, different names, and nothing links these tables yet.",
        },
        {
          goal:
            "The screen your app would show: every payment with the member's name and the amount, keeping only payments that name a real member.",
          solution:
            "SELECT dues.due_id, members.name, dues.amount FROM dues INNER JOIN members ON dues.member_id = members.member_id;",
          predict: {
            question: "8 payments went in. How many rows come back?",
            choices: [
              "8 — a join never loses rows",
              "5 — the two payments naming member 7 and the one naming nobody all drop out silently",
              "6 — only the NULL is dropped",
            ],
            answer: 1,
            explain:
              "INNER keeps pairs. Three payments have no partner — two ghosts and one NULL — so three vanish without a word of warning.",
          },
          explain:
            "5 rows out of 8. If this were your app's only screen, the club would be missing 150 pesos of payments and would never know. INNER JOIN is right for 'the payments we can explain' and wrong for 'the payments'.",
        },
        {
          goal:
            "The audit screen: every payment with its member's name, keeping the ones nothing explains. Show due_id, member_id and name.",
          solution:
            "SELECT dues.due_id, dues.member_id, members.name FROM dues LEFT JOIN members ON dues.member_id = members.member_id;",
          explain:
            "8 rows, 3 with NULL in name. That NULL is no longer just a display detail: in Java, rs.getString(\"name\") hands back a real null on those three rows, and rs.getInt(\"member_id\") turns payment 5's missing id into 0. Both of Tuesday's traps live on this single result.",
        },
        {
          goal:
            "Turn it into a repair list a program could act on: only the payments that NAME a member who doesn't exist — not the one that names nobody.",
          solution:
            "SELECT dues.due_id, dues.member_id FROM dues LEFT JOIN members ON dues.member_id = members.member_id WHERE members.member_id IS NULL AND dues.member_id IS NOT NULL;",
          hint: "The anti-join, then AND dues.member_id IS NOT NULL to drop the honest blank.",
          predict: {
            question: "Which payments survive both conditions?",
            choices: [
              "3, 5 and 7 — everything unexplained",
              "3 and 7 — they name member 7, which is false; payment 5 names nobody, which is honest",
              "Only 5",
            ],
            answer: 1,
            explain:
              "The join failed on the members side AND the payment did make a claim. Lies get repaired; blanks do not.",
          },
          explain:
            "2 rows — payments 3 and 7. Week 3's most reusable query, on a database you'd never seen ten minutes ago, and it took you one attempt.",
        },
        {
          goal: "Try to lock the child table as it stands: a FOREIGN KEY on dues.member_id referencing members(member_id).",
          solution: "ALTER TABLE dues ADD FOREIGN KEY (member_id) REFERENCES members (member_id);",
          predict: {
            question: "Payments 3 and 7 still name member 7. What does the server do?",
            choices: [
              "Refuses with 1452 — it checks every existing row before agreeing to enforce the promise",
              "Locks it and deletes the two bad payments",
              "Locks it — a constraint only applies to future rows",
            ],
            answer: 0,
            explain: "Clean first, then lock. A constraint is a promise about the whole table, past included.",
          },
          explain:
            "Error 1452 — the same refusal in the same order as the canteen ledger, and the same order your program has to follow if it ever repairs data itself.",
        },
        {
          goal: "The treasurer says both member-7 payments were really Ligaya, member 4. Repair payment 3.",
          solution: "UPDATE dues SET member_id = 4 WHERE due_id = 3;",
          hint: "Aim it by the payment's own key.",
          explain:
            "1 row affected — and that 1 is the number your Java would read out of executeUpdate. A 0 here would mean you aimed at a payment that isn't there, silently.",
        },
        {
          goal: "Repair the other one the same way: payment 7 was also Ligaya.",
          solution: "UPDATE dues SET member_id = 4 WHERE due_id = 7;",
          explain:
            "1 row affected. Both lies are truths now. Payment 5 is still blank and still must not be touched — inventing a member for it would be worse than leaving it unknown.",
        },
        {
          goal: "Check your work the way an auditor would: re-run the repair-list query. An empty result is the green light.",
          solution:
            "SELECT dues.due_id, dues.member_id FROM dues LEFT JOIN members ON dues.member_id = members.member_id WHERE members.member_id IS NULL AND dues.member_id IS NOT NULL;",
          explain:
            "0 rows. You ran this before the repair and got 2, and after it and got 0 — which is what makes the empty result mean something. An audit query you only run afterwards proves nothing.",
        },
        {
          goal: "Now lock it.",
          solution: "ALTER TABLE dues ADD FOREIGN KEY (member_id) REFERENCES members (member_id);",
          explain:
            "Query OK. Every member_id in dues now either names a real member or is honestly NULL — the server checked, and this time it agreed.",
        },
        {
          goal:
            "Prove the lock is live, the way your Java will meet it: try to record a payment for member 9 — due 9, member 9, 2026-08-15, 50.",
          solution: "INSERT INTO dues VALUES (9, 9, '2026-08-15', 50);",
          predict: {
            question: "What does your Java program get back from this?",
            choices: [
              "A SQLException whose getErrorCode() returns 1452",
              "An int of 0 from executeUpdate, and no exception",
              "An int of 1 — the row goes in and is cleaned up later",
            ],
            answer: 0,
            explain:
              "A refused write throws; a write that matched nothing returns 0. Two completely different outcomes that beginners routinely confuse — and your program has to handle both.",
          },
          explain:
            "Error 1452, and in Java that number arrives through getErrorCode(). This is the whole unit in one line: the lock is in the DATABASE, so it protects the data from every program equally, and your app's job is to translate the refusal into something a club treasurer can understand.",
        },
        {
          goal: "The other door: the club tries to remove Ligaya (member 4) from the list.",
          solution: "DELETE FROM members WHERE member_id = 4;",
          predict: {
            question: "Two repaired payments now point at Ligaya. What happens?",
            choices: [
              "Refused with 1451 — removing her would strand the payments that reference her",
              "She's deleted and the payments go with her",
              "She's deleted and the payments' member_id becomes NULL",
            ],
            answer: 0,
            explain:
              "1451 guards the parent side. Note that this refusal exists because of YOUR repair two steps ago — the data decided what the database would allow.",
          },
          explain:
            "Error 1451. Your app cannot have a 'remove member' button that always works, and that isn't a limitation to code around: it's a business rule showing up where it can actually be enforced.",
        },
        {
          goal: "The report the treasurer actually wants: which members have never paid anything at all? Name and year level.",
          solution:
            "SELECT members.name, members.year_level FROM members LEFT JOIN dues ON members.member_id = dues.member_id WHERE dues.due_id IS NULL;",
          explain:
            "1 row — Tomas. The parent-side anti-join, aimed at a question a real person asked. One line of SQL is the entire feature; the Java around it is a loop and a println.",
        },
        {
          goal:
            "Last one, entirely your own: the screen for one member's payment history. Show every payment Rosa has made — the date and the amount, most recent first.",
          solution:
            "SELECT dues.paid_on, dues.amount FROM dues INNER JOIN members ON dues.member_id = members.member_id WHERE members.name = 'Rosa' ORDER BY dues.paid_on DESC;",
          explain:
            "2 rows. And note what this becomes in Java: the member's name is a value from OUTSIDE — typed, picked, passed in — so this is exactly the query that must go through a placeholder. Concatenate it and you have rebuilt Wednesday's vulnerability on a fresh database.",
        },
      ],
    },
    {
      kind: "order",
      id: "order-the-app",
      title: "🧩 Puzzle: assemble the app",
      intro:
        "Four rounds, four shapes — the ones you'll use for the rest of the course. Every distractor is a line somebody has shipped for real.",
      rounds: [
        {
          prompt: "A lookup screen taking a value from outside, done properly, top to bottom.",
          lines: [
            "String sql = \"SELECT paid_on, amount FROM dues INNER JOIN members ON dues.member_id = members.member_id WHERE members.name = ?\";",
            "try (Connection conn = DriverManager.getConnection(url, user, password);",
            "     PreparedStatement ps = conn.prepareStatement(sql)) {",
            "    ps.setString(1, memberName);",
            "    try (ResultSet rs = ps.executeQuery()) {",
            "        while (rs.next()) {",
            "            System.out.println(rs.getString(\"paid_on\") + \": \" + rs.getInt(\"amount\"));",
            "        }",
            "    }",
            "} catch (SQLException e) {",
            "    System.out.println(e.getErrorCode() + \": \" + e.getMessage());",
            "}",
          ],
          distractors: ["     Statement stmt = conn.createStatement();", "        ResultSet rs = ps.executeQuery(sql);"],
          explain:
            "Both impostors reopen Wednesday's hole. The plain Statement is the vulnerable path, and executeQuery(sql) on a PreparedStatement calls the inherited method that ignores everything you prepared — it compiles, it runs, and it silently undoes the fix.",
        },
        {
          prompt: "A write that reports the truth. The two lines left out are the ones that make it lie.",
          lines: [
            "String sql = \"INSERT INTO dues (member_id, paid_on, amount) VALUES (?, ?, ?)\";",
            "try (PreparedStatement ps = conn.prepareStatement(sql)) {",
            "    ps.setInt(1, memberId);",
            "    ps.setString(2, paidOn);",
            "    ps.setInt(3, amount);",
            "    int rows = ps.executeUpdate();",
            "    System.out.println(rows == 1 ? \"Payment recorded.\" : \"Nothing was recorded.\");",
            "} catch (SQLException e) {",
            "    if (e.getErrorCode() == 1452) System.out.println(\"There's no member with that number.\");",
            "}",
          ],
          distractors: ["    ps.executeUpdate();", "    System.out.println(\"Payment recorded.\");"],
          explain:
            "Throwing the count away and announcing success is the version almost everyone writes first. Note the catch too: 1452 is not an internal error to dump on a treasurer — it's a sentence about a member number, and translating it is your program's job.",
        },
        {
          prompt: "Two writes that must not happen separately. Put the transaction together.",
          lines: [
            "conn.setAutoCommit(false);",
            "try {",
            "    insertPayment(conn, memberId, amount);",
            "    markMemberPaid(conn, memberId);",
            "    conn.commit();",
            "} catch (SQLException e) {",
            "    conn.rollback();",
            "    System.out.println(\"Nothing was saved: \" + e.getMessage());",
            "}",
          ],
          distractors: ["    conn.setAutoCommit(true);"],
          explain:
            "The impostor turns autocommit back ON mid-transaction, which quietly commits what has run so far — so the two writes stop being all-or-nothing while every line still looks deliberate. Its failure mode is the reason transactions exist: the payment recorded, the member not marked, and nothing anywhere reporting that the two disagree.",
        },
        {
          prompt: "Order these four by how much you'd rely on them to keep a value from becoming SQL. Best first.",
          lines: [
            "A PreparedStatement placeholder",
            "Validating the value against what you actually expect",
            "Escaping quotes in the value by hand",
            "Assuming nobody would bother attacking an internal tool",
          ],
          explain:
            "The placeholder removes the possibility; validation is real defence in depth on top of it; hand-escaping means being right forever while an attacker needs one gap; and the fourth isn't a defence at all — it's a prediction about people, made by somebody who won't be there when it turns out wrong.",
        },
      ],
    },
    {
      kind: "quest",
      id: "teach-it-back",
      title: "🧠 Quest: teach it back",
      intro:
        "The strongest test, back again: you understand what you can explain to someone who doesn't know it. Imagine a classmate who writes good Java and has never touched a database. Five ideas, your own words, no jargon you don't unpack.",
      missions: [
        {
          task: "Explain what JDBC actually IS — what the jar does, and why the same Java code could talk to a different database by changing one word and one file.",
          check: {
            question: "The heart of that explanation:",
            choices: [
              "JDBC is a set of Java interfaces that every database vendor writes their own implementation of, so your code talks to the interface and the driver does the translating",
              "JDBC is a copy of MySQL that runs inside Java",
              "JDBC converts Java objects into tables automatically",
            ],
            answer: 0,
            explain:
              "Interface plus driver. That's why Connection and ResultSet live in java.sql — part of Java itself — while the thing that knows MySQL's network protocol ships in a jar from MySQL.",
          },
        },
        {
          task: "Explain why a ResultSet is not a list, and what goes wrong for somebody who treats it like one.",
          check: {
            question: "The consequence they most need to hear:",
            choices: [
              "It's slower than a list",
              "It's a live cursor over rows the server is still holding — so it can't be looped twice, it dies with its Statement, and it must be drained into your own objects before the try block ends",
              "It can only hold 1000 rows",
            ],
            answer: 1,
            explain:
              "'Returning a ResultSet from a method' is the mistake this prevents, and it's a very natural one for somebody used to collections.",
          },
        },
        {
          task: "Explain SQL injection in under a minute, without using the word 'escape', and say why the fix is not 'clean the input'.",
          check: {
            question: "Which framing actually explains the mechanism?",
            choices: [
              "Attackers can type SQL keywords, so you must block words like OR and DROP",
              "The value and the command travelled in one string, so whoever supplies the value decides where it ends — placeholders send the command first, so the value arrives after the meaning is fixed",
              "The database trusts input from Java too much",
            ],
            answer: 1,
            explain:
              "Separation, not sanitisation. A blocklist has to anticipate every attack; separation makes the whole category impossible, including attacks nobody has invented yet.",
          },
        },
        {
          task: "Explain what a foreign key does for a PROGRAM — why your Java doesn't need to check that a snack exists before inserting a sale.",
          check: {
            question: "The strongest version of that argument:",
            choices: [
              "The check lives in the database, so it applies to every program equally — and checking in Java first can't be relied on anyway, because the parent can be deleted between your check and your insert",
              "It's faster to let the database check",
              "Foreign keys automatically create missing parent rows",
            ],
            answer: 0,
            explain:
              "The race is the part people miss. A check in your program describes a moment that has already passed by the time you write; the constraint is enforced at the instant of the write, for everyone.",
          },
        },
        {
          task: "Last one: explain why a program that prints 'Saved!' after every executeUpdate is lying, and what one line fixes it. Then write the whole teach-it-back out properly.",
          input: "Paste your five explanations, written as if to a classmate who knows Java and no SQL",
        },
      ],
    },
    {
      kind: "quest",
      id: "assemble-app",
      inline: true,
      title: "📦 Quest: assemble the canteen app",
      intro:
        "Everything you wrote this week is scattered across five files that each do one thing. Today it becomes one program somebody could run — the artifact you hand in, and the thing you give a real interface in Unit 2.",
      missions: [
        {
          task: "Make CanteenApp.java: a main method printing a simple menu — 1) list the menu, 2) list sales, 3) record a sale, 4) snacks that never sold, 0) quit — reading the choice with a Scanner and looping until 0.",
          check: {
            question: "Where should the connection be opened, given the user may choose several options?",
            choices: [
              "Once, around the whole menu loop, so one connection serves every action",
              "Inside every method, opening and closing per action",
              "Once at the start and never closed",
            ],
            answer: 0,
            explain:
              "One connection for the session, in a try-with-resources around the loop, is the right shape at this size. Opening one per action isn't wrong so much as wasteful; never closing it is a leak. Real applications use a connection pool, which is a refinement of the same idea.",
          },
        },
        {
          task: "Move each of the week's programs in as a method taking the Connection as its first parameter — listMenu(conn), listSales(conn), recordSale(conn, snackId, date, qty), neverSold(conn). Every one uses a PreparedStatement wherever a value comes from the user.",
          check: {
            question: "Why pass the Connection in rather than opening one inside each method?",
            choices: [
              "Because a method that opens its own connection can't take part in a transaction with any other method",
              "Because it's fewer characters",
              "Because Connection objects can only be created once per program",
            ],
            answer: 0,
            explain:
              "This is why real code passes connections around. Two methods that each open their own connection cannot be made all-or-nothing, however carefully you write them — the transaction lives on the connection.",
          },
        },
        {
          task: "Make the app honest about failure: every write reports the row count, every catch prints the error code, and 1452 gets a human sentence instead of a stack trace. Then run every menu option once, including a deliberate bad snack id.",
          check: {
            question: "What should option 3 print when the user enters a snack number that doesn't exist?",
            choices: [
              "The full stack trace, so the problem is visible",
              "A plain sentence naming the real problem — 'There's no snack with that number' — with the error code kept for you, in a log or a debug line",
              "'Sale recorded.' — the error was handled, so it succeeded",
            ],
            answer: 1,
            explain:
              "A stack trace tells a canteen worker nothing and tells an attacker something. The error code is for you; the sentence is for them. Keeping both, in the right places, is what 'handled' actually means.",
          },
        },
        {
          task: "Point it at YOUR data. Add one more menu option answering a question about the parent/child pair you designed in week 3 — a question only you would think to ask. Write the SQL first, then the method.",
          input:
            "Paste CanteenApp.java's main method and your own extra option's method, plus one sentence saying what question it answers and why you wanted to know",
        },
      ],
    },
    {
      kind: "upload",
      id: "export-week4-app",
      title: "📤 Hand in the app you built",
      intro:
        "The unit's closing hand-in — and not a database export this time. The program. This is the first software you've written that keeps its data somewhere real, and in Unit 2 you give it a window instead of a console.",
      steps: [
        "Put every .java file from this week in one folder: ConnectTest, ListMenu, ListSales, LookupSnack, RecordSale and CanteenApp.",
        "Open CanteenApp.java and check the top of the file: your MySQL password must NOT be sitting in it as a literal. Read it from an environment variable, or from a config file you don't hand in, and leave a comment saying which.",
        "Add a comment block at the top of CanteenApp.java listing your menu options and, for your own extra option, the question it answers.",
        "Zip the folder as week4-app-<yourname>.zip.",
        "Upload it below.",
      ],
      proves:
        "the week's work as running code on YOUR data: your own connection settings (without the password), your menu, the PreparedStatement version of the lookup you attacked on Wednesday, your row-count check after every write, your 1452 message in your own words — and the extra option you wrote against the pair of tables you designed yourself in week 3. Nobody else's zip has that option, because nobody else asked that question.",
      screenshotFallback:
        "Zip refusing to upload, or your project living somewhere awkward? Upload a screenshot instead: your editor showing CanteenApp.java, plus your terminal showing one successful run and one run where the foreign key refused you. Say so in today's turn-in box.",
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own work",
      steps: [
        "Open your project and this page side by side, and mark each line below ✅ or ❌ honestly.",
        "My program connects with a URL I can read out loud, naming the machine, the port and the database.",
        "I have met all four connection failures on purpose — no suitable driver, communications link failure, access denied, unknown database — and I can say what each one rules OUT.",
        "Every resource I open is in a try-with-resources, and there is no hand-written close() anywhere in my code.",
        "No catch block in my project is empty, and every one prints or logs the error code, not just the message.",
        "Every read walks its ResultSet with next() before reading, and reads columns by label rather than by number.",
        "I have handled at least one column that can be NULL — a null check on a String, or wasNull() after a getInt — and I can say what would have happened if I hadn't.",
        "Every value that comes from outside my program travels as a PreparedStatement placeholder. There is no string concatenation anywhere in any SQL I send.",
        "I attacked my own vulnerable version with a string that returned rows it shouldn't have, and I have that string written down.",
        "Every write checks the int from executeUpdate before telling the user anything, and no message claims success on a count of 0.",
        "Every UPDATE and DELETE I send is aimed by a key, and I know JDBC has no safe-update mode to catch me if it isn't.",
        "I have caught a foreign key violation in Java, identified it by getErrorCode(), and turned it into a sentence a non-programmer would understand.",
        "I have run a transaction, made it fail on purpose, and confirmed with a SELECT that the first write did not survive.",
        "For every ❌: fix it now. Everything you need is in this week's four days, and the day is yours.",
      ],
      tip: "Lines 7 and 9 are the two that would fail a professional code review on their own — the injection hole and the unchecked write count. If both are ✅ across your whole project, you are ahead of a lot of shipped software.",
      submit: "Paste the checklist with your ✅ / ❌ marks, and note what you had to go back and fix.",
    },
    {
      kind: "quest",
      id: "data-story",
      inline: true,
      title: "🏔️ A program of your own",
      intro:
        "The week ran on the canteen's question. This one runs on yours: a small program against your own pair of tables, answering something you actually wonder about — and that nobody could have written for you, because nobody else has your data.",
      missions: [
        {
          task: "Choose the question. It has to need both of your tables — a join — and it has to have an answer you don't already know. Write it in plain words first, before any SQL exists.",
          input: "Write your question in one sentence, and say which two tables it needs",
        },
        {
          task: "Write the SQL and run it in Workbench until it answers the question properly. Then decide what the screen looks like: what does your program print, in what order, and what does it say when the answer is empty?",
          input: "Paste your query and describe what your program will print, including the empty case",
        },
        {
          task: "Write the program: PreparedStatement for anything from outside, a loop that prints the result, a message for the empty case, and a catch that reports the error code. Run it.",
          input: "Paste the program",
        },
        {
          task: "Read your own result and answer your question in plain words — one or two sentences, as if telling a friend. Then note one thing the data told you that you didn't expect, or say honestly that nothing surprised you and why.",
          input: "Write your question's answer in plain words, plus the one thing that surprised you (or why nothing did)",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week-four-architect",
    title: "⚔️ Final boss: The Architect",
    intro:
      "The Architect asks about all of it — Monday's handshake, Tuesday's cursor, Wednesday's hole, Thursday's counts and locks — and about week 3, because a program that talks to a database is only as trustworthy as the database it talks to. Nothing here is new. Take the gate.",
    boss: { name: "the Architect", emoji: "🏛️" },
    questions: [
      {
        prompt: "Your program fails with 'No suitable driver found'. What has NOT yet been tested?",
        choices: [
          "Nothing — the driver checks the credentials as it loads",
          "The server, the port, the username, the password and the database name — none of them, because nothing opened a socket",
          "Only the password",
        ],
        answer: 1,
        explain:
          "Errors rule things out as much as they report. This one fires before any network contact, so everything downstream of it is still unknown.",
      },
      {
        prompt: "getErrorCode() returns 0. What does that tell you?",
        choices: [
          "The message came from the driver, not the server — nothing on the other end ever answered",
          "The statement succeeded",
          "The error is unknown to JDBC",
        ],
        answer: 0,
        explain:
          "A numbered code comes FROM MySQL, so getting one proves the server received and answered you. A 0 points at the wire: server down, wrong port, missing driver.",
      },
      {
        prompt: "Where is the cursor when executeQuery returns, and what does that force you to do?",
        choices: [
          "On row 1; you can read immediately",
          "Before row 1; you must call next() before reading anything, however many rows there are",
          "Wherever the last query left it",
        ],
        answer: 1,
        explain:
          "One rule, no exceptions — which is why `if (rs.next())` is the shape for a single-row result and why reading first throws 'Before start of result set'.",
      },
      {
        prompt: "rs.getInt(\"amount\") on a row where amount is SQL NULL returns:",
        choices: [
          "0, indistinguishable from a real zero unless you call rs.wasNull() straight afterwards",
          "null",
          "An exception",
        ],
        answer: 0,
        explain:
          "The same 'unknown versus zero' confusion week 3 taught you to defend against in SQL, arriving in Java through a method with no way to say 'nothing there'.",
      },
      {
        prompt: "Which line is the actual vulnerability?",
        code: "String sql = \"SELECT * FROM members WHERE name = '\" + typed + \"'\";\nStatement stmt = conn.createStatement();\nResultSet rs = stmt.executeQuery(sql);",
        choices: [
          "The createStatement — Statement is unsafe by nature",
          "The first line: a value from outside travelled inside the command string, so whoever supplies it decides where it ends",
          "The executeQuery — it should be executeUpdate",
        ],
        answer: 1,
        explain:
          "Statement is not unsafe by nature; a Statement running SQL you wrote entirely yourself is fine. Concatenating outside values into a command is the defect.",
      },
      {
        prompt: "Why is a value passed with setString safe no matter what it contains?",
        choices: [
          "The driver escapes dangerous characters",
          "The server is given the statement's shape first, so the value arrives after the meaning is decided and can't change it",
          "The driver rejects values containing SQL keywords",
        ],
        answer: 1,
        explain:
          "Separation, not sanitisation — which is why it also defeats attacks nobody has thought of yet. There's no blocklist to fall behind.",
      },
      {
        prompt: "executeUpdate returns 0. What do you tell the user?",
        choices: [
          "'Saved.' — no exception was thrown, so it worked",
          "That nothing changed. 0 is a successful statement that matched no rows, and it's the only signal you get",
          "Nothing; retry silently",
        ],
        answer: 1,
        explain:
          "A program that announces success on a count of 0 is lying, and no exception will ever correct it. One if statement is the whole fix.",
      },
      {
        prompt: "You send UPDATE dues SET amount = 50 with no WHERE, from Java, against 500 rows. Workbench refused this yesterday.",
        choices: [
          "It refuses here too",
          "All 500 rows change — safe-update mode is a Workbench setting, and your JDBC connection never had it",
          "Only the first row changes",
        ],
        answer: 1,
        explain:
          "The seatbelt belonged to the client, not the database. With autocommit on it's permanent immediately — the most expensive difference between typing SQL and sending it from a program.",
      },
      {
        prompt: "Your insert throws with error code 1452. What should the program do?",
        choices: [
          "Catch it and say, in plain words, that the referenced row doesn't exist — the database did the checking, you translate the refusal",
          "Drop the foreign key",
          "Insert the missing parent row automatically and retry",
        ],
        answer: 0,
        explain:
          "The lock is doing its job. Checking in Java first isn't a real substitute either: between your check and your insert, another program can delete the parent.",
      },
      {
        prompt: "A transaction's catch block prints the error and carries on with the same connection. What was forgotten?",
        choices: [
          "conn.rollback() — the failed transaction is still open, so everything afterwards runs inside it",
          "conn.close()",
          "A second setAutoCommit(false)",
        ],
        answer: 0,
        explain: "Catch, roll back, then report. Printing an error is not handling it.",
      },
      {
        prompt: "Week 3 recall: which query lists the parents with no children — members who never paid?",
        choices: [
          "members LEFT JOIN dues ON … WHERE dues.due_id IS NULL",
          "members INNER JOIN dues ON … WHERE dues.due_id IS NULL",
          "members LEFT JOIN dues ON … WHERE dues.due_id = NULL",
        ],
        answer: 0,
        explain:
          "The anti-join, unchanged by living inside a Java String. The INNER version cancels itself out; `= NULL` returns nothing and raises no error, which is the worst possible failure for a report.",
      },
      {
        prompt:
          "Last one. Your app has one connection and two methods that each need to write. Why must the Connection be passed in rather than opened inside each method?",
        choices: [
          "Because Connection objects are expensive to create",
          "Because a transaction lives on a connection — two methods with their own connections can never be made all-or-nothing",
          "Because JDBC allows only one connection per program",
        ],
        answer: 1,
        explain:
          "Creating connections IS expensive, and that's a real secondary reason — but the structural one is the transaction. It's why professional code passes connections, or a pool, around instead of opening them wherever convenient.",
      },
    ],
  },
  practice: {
    intro: "Last exit ticket of the unit — type these into the turn-in box below:",
    steps: [
      "The four steps of a read and the two halves of a write, from memory.",
      "The one sentence you'd use to explain SQL injection to a classmate, without the word 'escape'.",
      "Two things your program must check that will never throw an exception.",
      "What you can build now that you couldn't four weeks ago, in your own words.",
      "One question you still have.",
      "Paste your CanteenApp.java.",
    ],
    note: "Four weeks ago you had never written a SELECT. You now have a program that connects to a real database, reads it, writes to it safely, and tells the truth about what it did — with a database underneath that refuses to be lied to. Unit 2 gives that program a window.",
  },
};
