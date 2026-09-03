// unit1-week4 · Day 2 — Reading: Statement, ResultSet, and the cursor
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "Ask and read back — walking a ResultSet without falling off either end",
  warmupGame: {
    kind: "order",
    id: "warmup-read-lifecycle",
    title: "🧩 Warm-up: the shape of a read",
    intro:
      "Yesterday you opened a connection and did nothing with it. Reading is four more steps — always the same four, always in this order. Assemble them before you meet the code.",
    rounds: [
      {
        prompt: "The four steps of every read, from a live connection to a printed row.",
        lines: [
          "Ask the connection for a Statement — the object that carries SQL",
          "Give the Statement your SELECT, and get back a ResultSet",
          "Move the cursor onto a row, and keep moving while rows remain",
          "Pull the columns out of the row you are standing on",
        ],
        explain:
          "Connection → Statement → ResultSet → row. Each comes from the one before it, which is why they close in the opposite order and why closing a Connection takes everything else with it. Learn the chain once and every JDBC read you ever write is this chain.",
      },
      {
        prompt: "Where the cursor is at each moment. Put the four positions in the order they happen.",
        lines: [
          "The ResultSet comes back: the cursor sits BEFORE the first row",
          "The first next() returns true: the cursor is on row 1",
          "next() keeps returning true, one row at a time",
          "next() returns false: the cursor is past the last row and there is nothing to read",
        ],
        explain:
          "The cursor starting BEFORE row 1 is the single most important fact about a ResultSet, and it is why the loop is `while (rs.next())`. You must move before you read — every time, including for a result you know has exactly one row.",
      },
      {
        prompt:
          "Two things that are true about a ResultSet, in the order you'd discover them. One line in the pile is false — leave it out.",
        lines: [
          "It is a window onto rows the server is still holding, not a copy of the data inside your program",
          "It stops working the moment its Statement or Connection closes",
        ],
        distractors: ["It is a List you can loop over twice, sort, or hold on to"],
        explain:
          "A ResultSet is a live cursor, not a collection. That's why you can't loop it twice, why it dies with its Statement, and why the standard move is to copy what you need into your own objects while the cursor is still open. Treat it as something to drain, not something to keep.",
      },
    ],
  },
  videos: [
    {
      title: "Statement",
      youtubeId: "pv7pc-pitHI",
      length: "11:30",
      practice: {
        intro: "The object that carries your SQL. Straight after watching:",
        steps: [
          "Type a createStatement + executeQuery pair into your own file, against your own snacks table.",
          "Note which method the video uses for a SELECT and which for an INSERT — you will be asked to tell them apart all week.",
        ],
      },
    },
    {
      title: "ResultSet",
      youtubeId: "HiSXE1rAan0",
      length: "8:17",
      practice: {
        intro: "The answer coming back. After watching:",
        steps: [
          "Type the while (rs.next()) loop from memory, then check it against the video.",
          "Pause on the getters: note whether the video reads columns by NAME or by NUMBER, and keep the by-name habit whatever it does.",
        ],
        note: "One thing no video will warn you about: what these getters do when a column is NULL. That gap is the second half of today, and it is the reason your ledger still has one blank row in it.",
      },
    },
  ],
  activities: [{
      kind: "sql-console",
      id: "queries-to-send",
      title: "🖥️ Mini server: write the questions before you write the loop",
      intro:
        "A Java read is a SQL query plus a loop. The loop is identical every time; the query is where the thinking lives. Work out the exact queries your program will send today — including one whose answer contains a NULL, because that one is going to behave strangely in Java in about ten minutes.",
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
          goal: "Screen one of your app — the menu. Name and price, cheapest first.",
          solution: "SELECT name, price FROM snacks ORDER BY price;",
          hint: "SELECT name, price FROM snacks ORDER BY price;",
          explain:
            "6 rows, two columns. Note the column HEADERS — name and price — because in a few minutes your Java will ask for them by exactly those strings. The result's headers and your getString argument have to agree, and nothing but a running program will tell you if they don't.",
        },
        {
          goal: "Screen two — the day's sales. Snack name, quantity and date for everything sold on 2026-08-10.",
          solution:
            "SELECT snacks.name, sales.qty, sales.sold_on FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE sales.sold_on = '2026-08-10';",
          hint: "Join for the name, WHERE for the date.",
          explain:
            "2 rows. Look at the headers this time: name, qty, sold_on — NOT sales.qty. The dots disambiguate inside the query; what comes back is labelled with the plain column name, and that plain name is what your Java has to ask for.",
        },
        {
          goal:
            "Screen three — the full ledger, hiding nothing. Every sale with its snack's name and quantity, keeping the sales no snack explains. Show sale_id, name, qty.",
          solution:
            "SELECT sales.sale_id, snacks.name, sales.qty FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          predict: {
            question: "10 sales, one of them with a NULL snack_id. What comes back?",
            choices: [
              "10 rows, with NULL in the name column of exactly one of them",
              "9 rows — the unmatched sale is dropped",
              "10 rows, with an empty string where the missing name would be",
            ],
            answer: 0,
            explain:
              "LEFT JOIN protects every sale. Sale 7 has no snack to name, so its name cell is NULL — not empty, not zero, not blank. NULL.",
          },
          explain:
            "10 rows, and look hard at sale 7: the name cell says NULL. On this screen that's just a word in a grid. In Java that same cell arrives as a real Java null, and calling any method on it kills your program — on one row out of ten. Today's second half is entirely about that one cell.",
        },
        {
          goal: "The version your program should probably show instead: the same ledger, but only the sales that DO name a snack.",
          solution:
            "SELECT sales.sale_id, snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id;",
          explain:
            "9 rows — sale 7 is gone. Both screens are legitimate; they answer different questions. 'Show me the ledger' includes the unexplained row, 'show me what we sold' does not. Choosing between them is design work, and it happens in the SQL, not in the loop.",
        },
        {
          goal: "The one your program needs for a report: which snacks have never sold at all? Name only.",
          solution:
            "SELECT snacks.name FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id WHERE sales.sale_id IS NULL;",
          hint: "Last week's anti-join: LEFT JOIN, then WHERE the optional side IS NULL.",
          explain:
            "2 rows — Gulaman and Pastillas. Two rows, one column: the easiest thing in the world to loop over and print, and a real answer to a real question. Good queries make simple Java.",
        },
        {
          goal: "A result with exactly ONE row, which your program will handle differently: the price of Siopao.",
          solution: "SELECT price FROM snacks WHERE name = 'Siopao';",
          predict: {
            question: "You know this returns one row. In Java, do you still need to call rs.next()?",
            choices: [
              "No — a single-row result puts the cursor on that row automatically",
              "Yes, at least an if (rs.next()) — the cursor starts before the first row no matter how many rows there are",
              "No — call rs.getInt(\"price\") directly and JDBC finds the row",
            ],
            answer: 1,
            explain:
              "There is no special case. One row, a thousand rows, zero rows — the cursor always starts before the first, so you always move before you read. For a one-row result the idiomatic form is `if (rs.next())`, which handles the zero-row case for free.",
          },
          explain:
            "1 row, one column: 25. Remember this shape — 'one value out of the database' is the most common thing a program ever asks for, and it's exactly where people skip next() because it feels unnecessary.",
        },
        {
          goal:
            "Last one, composed by you: the report screen 'what did we sell on 2026-08-14, and at what price' — snack name, quantity, and the snack's price.",
          solution:
            "SELECT snacks.name, sales.qty, snacks.price FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE sales.sold_on = '2026-08-14';",
          explain:
            "2 rows, three columns, both Kwek-kwek. Everything your program prints this week comes out of a query shaped like this one, and every one of those columns is about to be pulled out by name inside a loop.",
        },
      ],
    },
{
      kind: "typing",
      id: "typing-read",
      title: "⌨️ Type the read",
      caseSensitive: true,
      intro:
        "Still case-sensitive, because Java still is. These eight rounds are the entire read loop. By the end you should be able to write it without thinking — which matters, because from tomorrow it becomes the part of the program you stop thinking about.",
      rounds: [
        {
          prompt: "Ask the connection for the object that carries SQL.",
          template: "Statement stmt = {conn.createStatement()};",
          explain:
            "createStatement, not `new Statement()`. Every JDBC object comes from the one above it — a Connection makes Statements, a Statement makes ResultSets. You never construct any of them yourself.",
        },
        {
          prompt: "Send a SELECT and catch the answer. Type the variable's type and the method.",
          template: "{ResultSet rs = stmt.executeQuery}(sql);",
          explain:
            "executeQuery is the SELECT method, and it always returns a ResultSet — never null, even when the query matched nothing. A zero-row result is still a perfectly good ResultSet; it just says false the first time you call next().",
        },
        {
          prompt: "The loop that walks every row. Type the whole while line.",
          template: "{while (rs.next())}",
          explain:
            "next() does two jobs at once: it moves the cursor forward AND reports whether there was anywhere to move to. That double duty is why one call is the entire loop condition.",
        },
        {
          prompt: "Read a text column out of the current row, by its label.",
          template: "String name = {rs.getString(\"name\")};",
          explain:
            "By LABEL, in quotes — the same string as the column header in your result. There is a by-number version too, and you'll meet its sharp edge shortly.",
        },
        {
          prompt: "Read a whole-number column the same way.",
          template: "int qty = {rs.getInt(\"qty\")};",
          explain:
            "getInt for INT, getString for VARCHAR, getDate for DATE. The method has to suit the column's type — asking getInt for a name is an error, not a conversion.",
        },
        {
          prompt: "The NULL test: after reading a column, ask whether what you just read was actually NULL.",
          template: "if ({rs.wasNull()})",
          explain:
            "wasNull() asks about the column you read MOST RECENTLY, so it goes immediately after the get and before any other get. It exists because getInt has no way to say 'nothing there' — 0 is a real number.",
        },
        {
          prompt: "Nest the resources so all three close themselves. Type the second and third resources.",
          template:
            "try (Connection conn = DriverManager.getConnection(url, user, password); {Statement stmt = conn.createStatement(); ResultSet rs = stmt.executeQuery(sql)})",
          explain:
            "Three resources, one try, separated by semicolons — and they close in reverse order automatically, which is the only order that works. One block instead of three nested ones, and nothing left open on the failure path.",
        },
        {
          prompt:
            "From memory: the whole loop body for the menu screen — read name and price, print them as \"name - price\".",
          template:
            "{System.out.println(rs.getString(\"name\") + \" - \" + rs.getInt(\"price\"));}",
          explain:
            "That is a working database-backed screen: one line of loop, one line of body. Everything else you build this week is this, with a better query and a nicer format.",
        },
      ],
    },
{
      kind: "order",
      id: "order-read-program",
      title: "🧩 Puzzle: the read program, in order",
      intro:
        "Same drill as yesterday, one step further: a program that asks a question and prints the answer. The distractors are the ways people get the loop wrong, and every one of them is a real bug with a real error message.",
      rounds: [
        {
          prompt:
            "The menu screen, end to end: the query as a String, all three resources in one try, the loop, the printed line, the catch.",
          lines: [
            "String sql = \"SELECT name, price FROM snacks ORDER BY price\";",
            "try (Connection conn = DriverManager.getConnection(url, user, password);",
            "     Statement stmt = conn.createStatement();",
            "     ResultSet rs = stmt.executeQuery(sql)) {",
            "    while (rs.next()) {",
            "        System.out.println(rs.getString(\"name\") + \" - \" + rs.getInt(\"price\"));",
            "    }",
            "} catch (SQLException e) {",
            "    System.out.println(e.getErrorCode() + \": \" + e.getMessage());",
            "}",
          ],
          distractors: ["    rs.close();"],
          explain:
            "No manual close, again. And notice the query String has NO semicolon inside it: JDBC sends one statement, so the semicolon you type in Workbench is unnecessary here. Dropping that habit today saves you a confusing afternoon later.",
        },
        {
          prompt: "Reading exactly one value — Siopao's price. Four lines, and two lines in the pile would break it.",
          lines: [
            "ResultSet rs = stmt.executeQuery(\"SELECT price FROM snacks WHERE name = 'Siopao'\");",
            "if (rs.next()) {",
            "    System.out.println(\"Siopao costs \" + rs.getInt(\"price\"));",
            "}",
          ],
          distractors: ["int price = rs.getInt(\"price\");", "while (rs.next()) { }"],
          explain:
            "The first distractor reads BEFORE moving the cursor — that's 'Before start of result set', the most common ResultSet exception there is. The second drains the cursor to the end before you read anything, so a get afterwards fails for the opposite reason. `if (rs.next())` is the right shape for one row, and it quietly does the right thing when the query matches nothing.",
        },
        {
          prompt: "Handling the NULL name from the LEFT JOIN screen, safely. Five lines in order.",
          lines: [
            "while (rs.next()) {",
            "    int saleId = rs.getInt(\"sale_id\");",
            "    String name = rs.getString(\"name\");",
            "    System.out.println(saleId + \": \" + (name == null ? \"(unknown snack)\" : name));",
            "}",
          ],
          distractors: ["    System.out.println(saleId + \": \" + name.toUpperCase());"],
          explain:
            "getString returns a real Java null for a SQL NULL, so any method call on it throws — and it happens on ONE row out of ten, which is precisely how this kind of bug survives testing and reaches a user. The ternary is unglamorous and correct: decide what the absence should look like on screen, and say so.",
        },
      ],
    },
{
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: the canteen app prints its first screen",
      intro:
        "Yesterday's program proved a connection. Today's does something a person would actually want — and by the end of it you'll have a small app with three screens, running against your own locked ledger.",
      missions: [
        {
          task: "New file, ListMenu.java. Same connection block as yesterday, but now with a Statement and a ResultSet in the SAME try-with-resources, running SELECT name, price FROM snacks ORDER BY price. Loop it and print each row as \"Pastillas - 8\". Run it.",
          check: {
            question: "You put all three resources in one try(...), separated by semicolons. In what order do they close?",
            choices: [
              "In the order declared: Connection, then Statement, then ResultSet",
              "In reverse order: ResultSet, then Statement, then Connection — the only order that makes sense",
              "All at once, in no defined order",
            ],
            answer: 1,
            explain:
              "Reverse declaration order, guaranteed by the language. It matters because a ResultSet belongs to its Statement — closing the Statement first would pull the floor out from under it. try-with-resources gets this right for free, which is one more reason not to hand-roll it.",
          },
        },
        {
          task: "Second screen: ListSales.java, running the LEFT JOIN — sale_id, snacks.name, sales.qty, every sale kept. Print each row. Run it, and look carefully at the line for your NULL sale.",
          check: {
            question: "What did that row print, before you did anything about it?",
            choices: [
              "The word NULL, the way Workbench shows it",
              "The literal text \"null\", because println prints a null String as the four characters n-u-l-l",
              "An empty line",
            ],
            answer: 1,
            explain:
              "println is being kind to you here — it prints 'null' rather than crashing. That kindness is the trap: the moment you call a method on that String instead of just printing it, the same row throws. The bug is already there; concatenation is hiding it.",
          },
        },
        {
          task: "Now make it right: handle the NULL name explicitly and print something a human understands — \"(unknown snack)\" or similar. Then, deliberately, write the broken version too: call .toUpperCase() on the name and run it, so you see the NullPointerException with your own eyes and see which row it dies on.",
          check: {
            question: "Your program crashed on one row out of ten. Why is that worse than crashing on all ten?",
            choices: [
              "It isn't worse — a crash is a crash",
              "Because it works in testing and fails in front of a user, on whichever row happens to be unusual — and nothing in the code looks wrong",
              "Because NullPointerException is harder to catch than SQLException",
            ],
            answer: 1,
            explain:
              "This is why data-shaped bugs are expensive. The code reviews clean, the demo works, and the failure waits for the one row nobody thought about. Your ledger has exactly one such row, on purpose, and it has been sitting there since week 3.",
          },
        },
        {
          task: "Third screen: NeverSold.java, running last week's anti-join — the snacks that have never sold — printed as a short list under a heading. Then add all three files to your week4-notes.md with one line each saying what question that screen answers.",
          input:
            "Paste ListMenu.java and the loop from ListSales.java (with your NULL handling), plus one sentence on what the NullPointerException taught you",
        },
      ],
    },
{
      kind: "quest",
      id: "the-cursor",
      title: "🎯 Quest: the cursor, and the three ways it bites",
      intro:
        "A ResultSet is not a list. It's a finger pointing at one row of a result the server is still holding, and almost every ResultSet bug is a misunderstanding about where that finger is. Four short investigations.",
      missions: [
        {
          task: "Think it through before you code it. You run a query that matches nothing at all — SELECT name FROM snacks WHERE price > 1000. What does executeQuery hand back?",
          check: {
            question: "What do you get?",
            choices: [
              "null — there were no rows to build a ResultSet from",
              "A ResultSet with zero rows: not null, and rs.next() returns false the first time you call it",
              "A SQLException, because the query found nothing",
            ],
            answer: 1,
            explain:
              "executeQuery NEVER returns null. That's why `while (rs.next())` handles the empty case for free — the body simply never runs. `if (rs == null)` is a line you'll see in old code and never need to write.",
          },
        },
        {
          task: "The by-number getters. Predict: for SELECT name, price FROM snacks, what does rs.getString(1) return, and what does rs.getString(0) do?",
          check: {
            question: "Pick the correct pair.",
            choices: [
              "getString(1) is name; getString(0) throws — JDBC columns are numbered from 1, not 0",
              "getString(1) is price; getString(0) is name",
              "getString(0) is name and getString(1) is price, like array indexes",
            ],
            answer: 0,
            explain:
              "JDBC counts from 1. It is the one place in your Java where an index doesn't start at zero, and it catches everybody once. It's also the argument for labels: rs.getString(\"name\") cannot be off by one, and it survives somebody reordering the SELECT list.",
          },
        },
        {
          task: "The NULL trap the console already showed you. Your screen reads rs.getInt(\"snack_id\") on the row for sale 7, whose snack_id is NULL. Predict what that int holds.",
          check: {
            question: "What is in the int?",
            choices: [
              "0 — getInt cannot return null, so a SQL NULL arrives as zero, indistinguishable from a real zero",
              "null — the variable is set to null",
              "-1, JDBC's marker for a missing value",
            ],
            answer: 0,
            explain:
              "An int can't be null, so JDBC gives you 0 and says nothing. If a real 0 is possible in that column, your program cannot tell 'no value' from 'the value zero' — which is exactly the lie week 3 spent a day teaching you to detect in SQL. The Java fix is rs.wasNull() immediately after the get, or reading the column as an Integer object instead.",
          },
        },
        {
          task: "Write it out for yourself: the three cursor rules in your own words, with the error or wrong answer each one prevents. Then add a fourth line — what you now do by default when a column you're printing might be NULL.",
          input:
            "Paste your four rules: where the cursor starts, where columns start counting, what getInt does with a NULL, and your default for printing a possibly-NULL column",
        },
      ],
    },
{
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic: reading edition",
      intro:
        "Six patients, all of them programs that connect perfectly and then go wrong while reading. Diagnose each from its message. Two of them throw nothing at all, which is what makes those two the dangerous ones.",
      missions: [
        {
          task: "Patient 1. java.sql.SQLException: Before start of result set — thrown on the line that calls rs.getString(\"name\").",
          check: {
            question: "What's missing?",
            choices: [
              "The call to rs.next(). The cursor starts before row 1, so it isn't on a row yet and there is nothing to read",
              "The column label is wrong",
              "The ResultSet was closed too early",
            ],
            answer: 0,
            explain:
              "The message is unusually literal: you are standing before the start. Every read needs a next() first, even for a query you're certain returns one row.",
          },
        },
        {
          task: "Patient 2. java.sql.SQLException: Column 'snackid' not found. The query was SELECT sales.snack_id, snacks.name FROM …",
          check: {
            question: "Where is the mistake, and why didn't the compiler catch it?",
            choices: [
              "In the SQL — the column should be spelled snackid there too",
              "In the getter: the label has to match the result's column name exactly — snack_id, with the underscore. The compiler can't check it, because it's just a String",
              "The query needs an alias before Java can read that column",
            ],
            answer: 1,
            explain:
              "Every column label in your Java is an unchecked string. That's the price of SQL-inside-Java, and it's why the DESCRIBE on Day 1 wasn't busywork. At least the error names the label it couldn't find, which makes it a one-second fix once you actually read it.",
          },
        },
        {
          task: "Patient 3. java.sql.SQLException: Operation not allowed after ResultSet closed. The program ran one query, printed it, then ran a second query on the SAME Statement and went back to the first ResultSet.",
          check: {
            question: "What happened?",
            choices: [
              "A Statement holds one ResultSet at a time — running a second query closes the first one's result",
              "The connection timed out between the two queries",
              "You cannot run two queries in one program",
            ],
            answer: 0,
            explain:
              "One Statement, one live ResultSet. Reuse the Statement and the previous result is gone. Either finish reading before the next query or use a second Statement — and it's one more reason to copy what you need OUT of a ResultSet rather than passing it around.",
          },
        },
        {
          task: "Patient 4. java.lang.NullPointerException on System.out.println(name.toUpperCase()); — but only sometimes, and only on some rows.",
          check: {
            question: "Diagnosis?",
            choices: [
              "getString returned a real Java null for a SQL NULL on that row, and any method call on null throws",
              "The ResultSet was empty",
              "toUpperCase is not allowed on strings from a database",
            ],
            answer: 0,
            explain:
              "SQL NULL becomes Java null, faithfully. 'Only some rows' is the signature of a data-shaped bug: the code is identical for every row, so the difference must be in the data.",
          },
        },
        {
          task: "Patient 5, no exception at all. A report says 3 sales had a quantity of 0 this week. The qty column allows NULL, and the code reads it with rs.getInt(\"qty\").",
          check: {
            question: "What is the report probably actually saying?",
            choices: [
              "Exactly what it says — 3 sales of zero items",
              "That 3 rows had NULL in qty, which getInt turned into 0 — 'not recorded' has been silently reported as 'sold nothing'",
              "That the query is missing a WHERE clause",
            ],
            answer: 1,
            explain:
              "Nothing threw, nothing logged, and the number is wrong in a way that looks entirely plausible. rs.wasNull() straight after the get is the only way to tell them apart — the same 'unknown versus zero' distinction week 3 drilled with IS NULL, arriving in Java wearing different clothes.",
          },
        },
        {
          task: "Patient 6, also silent. A program prints a list of every sale and always prints nothing — no rows, no error, no crash. The same query works fine pasted into Workbench.",
          check: {
            question: "Which explanation fits ALL of those symptoms?",
            choices: [
              "The connection failed and the catch block is empty, so the program printed nothing and reported nothing",
              "The table is empty",
              "The loop is while (rs.next()) and should be if",
            ],
            answer: 0,
            explain:
              "The clue is 'no error'. If the query had run and matched nothing that would be possible — but it works in Workbench, so the likeliest story is that it never ran and the failure was swallowed. Yesterday's Patient 5 in a new disguise: an empty catch turns every distinct failure into the same symptom.",
          },
        },
        {
          task: "Discharge notes: for each patient, one line — symptom, cause, fix. Then answer in a sentence: which TWO of these is your own code most likely to produce, and what will you do differently because of them?",
          input:
            "Paste your six discharge notes, plus your answer about the two you're most at risk of writing",
        },
      ],
    }],
  game: {
    kind: "boss-battle",
    id: "boss-cursor",
    title: "⚔️ Boss battle: The Cursor",
    intro:
      "The Cursor never lies to you, and it never volunteers anything either. It waits before the first row, it turns unknowns into zeroes without a word, and it counts from one. Show that you always know where it is.",
    boss: { name: "the Cursor", emoji: "👉" },
    questions: [
      {
        prompt: "Where is the cursor the instant executeQuery returns?",
        choices: [
          "On the first row, ready to read",
          "Before the first row — you must call next() before reading anything",
          "On the last row, so you read backwards",
        ],
        answer: 1,
        explain:
          "Always before the first row. That one fact is why the loop is `while (rs.next())` and why reading without moving throws 'Before start of result set'.",
      },
      {
        prompt: "Your query matches no rows at all. What does executeQuery return?",
        choices: ["null", "A ResultSet whose first next() returns false", "It throws a SQLException"],
        answer: 1,
        explain:
          "Never null. The empty case needs no special handling — the while loop's body simply doesn't run.",
      },
      {
        prompt: "For SELECT name, price FROM snacks, what is rs.getString(1)?",
        choices: [
          "price — indexes start at 0, so 1 is the second column",
          "name — JDBC columns are numbered from 1",
          "An exception; you must use labels",
        ],
        answer: 1,
        explain:
          "One-based — the one place in your Java that isn't zero-based. Labels sidestep the question entirely and survive somebody reordering the SELECT list.",
      },
      {
        prompt: "Sale 7 has NULL in snack_id. What does rs.getInt(\"snack_id\") return for that row?",
        choices: [
          "0 — an int can't be null, so NULL and zero become indistinguishable",
          "null",
          "It throws a SQLException for reading a NULL as an int",
        ],
        answer: 0,
        explain:
          "Silently 0. If a real zero is possible in that column, your program has just lost the difference between 'unknown' and 'none' — the exact distinction you learned to defend in SQL last week.",
      },
      {
        prompt: "So how do you tell a real 0 from a NULL?",
        code: "int qty = rs.getInt(\"qty\");",
        choices: [
          "Call rs.wasNull() immediately after the get — it reports on the column read most recently",
          "Compare qty to -1",
          "Check the ResultSet's row count",
        ],
        answer: 0,
        explain:
          "wasNull() describes the LAST column read, so it must come straight after the get and before any other get. Reading the column as an Integer object instead is the other standard answer.",
      },
      {
        prompt: "What does rs.getString(\"name\") return when that column is SQL NULL?",
        choices: [
          "The four-character string \"null\"",
          "An empty string",
          "A real Java null — so println shows \"null\", and any method call on it throws",
        ],
        answer: 2,
        explain:
          "println is what prints the word 'null'; the value itself is null. That's why the bug hides through a demo built on println and appears the moment somebody formats the value.",
      },
      {
        prompt: "Why does a ResultSet stop working once its Statement is closed?",
        choices: [
          "Because it is a live cursor over rows the server is still holding, not a copy of the data",
          "Because Java frees all objects when one is closed",
          "It doesn't — a ResultSet is independent once created",
        ],
        answer: 0,
        explain:
          "It's a window, not a list. Hence the rule: drain what you need into your own objects while it's open, and never return a ResultSet from a method whose try block is about to end.",
      },
      {
        prompt: "You run a second query on the same Statement while still reading the first result. What happens?",
        choices: [
          "Both results stay usable",
          "The first ResultSet is closed — a Statement holds one at a time",
          "The second query waits until the first result is fully read",
        ],
        answer: 1,
        explain:
          "One Statement, one live ResultSet. The error you eventually get — 'Operation not allowed after ResultSet closed' — is reported far away from the line that actually caused it.",
      },
      {
        prompt: "In what order do these close?",
        code: "try (Connection conn = ...;\n     Statement stmt = ...;\n     ResultSet rs = ...) { }",
        choices: [
          "ResultSet, Statement, Connection — reverse of declaration, the only order that works",
          "Connection, Statement, ResultSet — the order written",
          "Undefined",
        ],
        answer: 0,
        explain:
          "Reverse order, guaranteed by the language, and it matters: each object depends on the one declared before it. Hand-rolled cleanup gets this wrong regularly.",
      },
      {
        prompt: "SQL recall: your program sends the anti-join for snacks that never sold. Which query is it?",
        choices: [
          "snacks LEFT JOIN sales ON … WHERE sales.sale_id IS NULL",
          "snacks INNER JOIN sales ON … WHERE sales.sale_id IS NULL",
          "snacks LEFT JOIN sales ON … WHERE sales.sale_id = NULL",
        ],
        answer: 0,
        explain:
          "Unchanged by living inside a Java String — and the two wrong answers fail exactly as they did last week: the INNER version cancels itself out, and `= NULL` returns nothing while raising no error at all.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The four steps of a read, in order, from Connection to a printed row.",
      "The three cursor rules: where it starts, where columns start counting, and what getInt does with a NULL.",
      "Why rs.getString on a NULL column is more dangerous than it looks, and what you now do about it.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
      "Paste today's Java.",
    ],
    note: "Your program can now ask questions and read the answers — everything Workbench does for reading, but yours. Tomorrow you let a person supply a value, and find out why the obvious way to do that is the most attacked bug in the history of software.",
  },
};
