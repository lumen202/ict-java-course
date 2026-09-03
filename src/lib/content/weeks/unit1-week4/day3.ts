// unit1-week4 · Day 3 — Values from outside: PreparedStatement and SQL injection
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "Letting a person supply a value — and why the obvious way is the famous bug",
  warmupGame: {
    kind: "order",
    id: "warmup-two-paths",
    title: "🧩 Warm-up: two ways to put a value in a query",
    intro:
      "Yesterday every query you sent was a fixed string you wrote yourself. Today one piece of it comes from a person — a name they typed, an id they picked. There are exactly two ways to do that, and only one of them is safe. Build both, then look at what's different.",
    rounds: [
      {
        prompt:
          "The obvious way: glue the typed name into the SQL. Assemble it as Java would build the string.",
        lines: [
          "String sql = \"SELECT * FROM snacks WHERE name = '\"",
          "    + typedName",
          "    + \"'\";",
        ],
        explain:
          "Read what this really produces: one string, where the quotes around the value are supplied by YOU and the value is supplied by THEM. Whoever controls the text between those quotes controls where the value ends — and that is the whole vulnerability, visible in three lines, before any attacker turns up.",
      },
      {
        prompt:
          "The safe way: leave a hole and hand the value over separately. Three steps, in order.",
        lines: [
          "String sql = \"SELECT * FROM snacks WHERE name = ?\";",
          "PreparedStatement ps = conn.prepareStatement(sql);",
          "ps.setString(1, typedName);",
        ],
        distractors: [
          "String sql = \"SELECT * FROM snacks WHERE name = '?'\";",
          "ps.setString(0, typedName);",
        ],
        explain:
          "Both distractors are the mistakes people make on their first day with placeholders. Quoting the ? turns it into a literal question-mark character, so the query looks for a snack actually named '?' and calmly returns nothing. And setString counts from 1, like everything else in JDBC — there is no parameter 0.",
      },
      {
        prompt:
          "What actually travels to the server, in order, when you use a placeholder.",
        lines: [
          "The SQL goes first, with the ? still in it — the server now knows the SHAPE of the statement",
          "The value goes separately, labelled as a value",
          "The server plugs the value into the hole it already parsed",
        ],
        explain:
          "This is the mechanism, and it's why placeholders are safe rather than merely tidy. The server decides what the statement MEANS before it has ever seen the value. Nothing a person types afterwards can change that meaning — it arrives too late to be read as SQL, whatever characters are in it.",
      },
    ],
  },
  videos: [
    {
      title: "PreparedStatement",
      youtubeId: "T0P-cfsD45o",
      length: "8:30",
      practice: {
        intro: "Watch this one BEFORE the console below, then:",
        steps: [
          "Type a prepareStatement with one placeholder and one setter, against your own table.",
          "Write down, in one sentence, the reason the video gives for using it — then compare that with the reason you find for yourself in the next activity.",
        ],
        note: "Most explanations of this stop at 'it prevents SQL injection'. Today you find out what that sentence actually means by doing the injection yourself, in about ten seconds.",
      },
    },
  ],
  activities: [{
      kind: "sql-console",
      id: "the-attack",
      title: "🖥️ Mini server: run the attack yourself",
      intro:
        "You are about to be the attacker. This console holds the canteen's snack list, and a 'look up a snack by name' screen built the obvious way — the typed name glued straight into the SQL. Your job is to type something into that box that the person who wrote it did not plan for. Reading about SQL injection convinces nobody; doing it once takes ten seconds and you never forget it.",
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
            "The screen working normally. Somebody types Turon, and the program builds:  SELECT * FROM snacks WHERE name = 'Turon';  Run exactly that.",
          solution: "SELECT * FROM snacks WHERE name = 'Turon';",
          hint: "SELECT * FROM snacks WHERE name = 'Turon';",
          explain:
            "1 row, exactly as intended. Nothing is wrong yet, and that's the point — this code passes every test its author would think to write, because its author types snack names into it.",
        },
        {
          goal:
            "Now be the attacker. They type  x' OR price > 0  into the box. The program glues it in the same way, producing:  SELECT * FROM snacks WHERE name = 'x' OR price > 0;  Run it.",
          solution: "SELECT * FROM snacks WHERE name = 'x' OR price > 0;",
          hint: "Type the whole statement from the goal, exactly — including the quote after name = and the one after x.",
          predict: {
            question: "The program was asked for ONE snack called x. What comes back?",
            choices: [
              "0 rows — there is no snack called x",
              "All 6 rows — the typed text closed the quote early and added a condition that is true for every snack",
              "An error, because the quotes are unbalanced",
            ],
            answer: 1,
            explain:
              "Count the quotes: the program opened one, the attacker's x closed it, and everything after that stopped being a value and started being SQL. The statement is perfectly valid — it just isn't the one anybody wrote.",
          },
          explain:
            "6 rows. The whole table, from a search box. Look closely at what happened: the attacker never broke anything, never caused an error, and never needed to know Java. They only needed to know that their text would be pasted between two quotes — and they ended the value early with one apostrophe. That is SQL injection in its entirety.",
        },
        {
          goal:
            "Prove it wasn't a fluke about prices. Same trick, aimed at a different column: run  SELECT * FROM snacks WHERE name = 'x' OR snack_id > 0;",
          solution: "SELECT * FROM snacks WHERE name = 'x' OR snack_id > 0;",
          explain:
            "6 rows again. The attacker can name ANY column they can guess, and column names are rarely secret — yours are snack_id, name, price, and anybody who has seen your app can guess most of that. 'They'd never guess our schema' is not a defence; it's a hope.",
        },
        {
          goal:
            "Now imagine the same box on a screen that shows one person their own sales. The program builds  SELECT * FROM sales WHERE sale_id = 3;  from a picked row. Run that first, honestly.",
          solution: "SELECT * FROM sales WHERE sale_id = 3;",
          explain:
            "1 row, sale 3. Numbers feel safer than text because there are no quotes to close — and that feeling is exactly why the numeric version of this bug survives longer. Watch.",
        },
        {
          goal:
            "The numeric attack: they supply  3 OR qty > 0  instead of 3, and the program builds  SELECT * FROM sales WHERE sale_id = 3 OR qty > 0;  Run it.",
          solution: "SELECT * FROM sales WHERE sale_id = 3 OR qty > 0;",
          predict: {
            question: "There were no quotes to escape this time. Does the attack still work?",
            choices: [
              "No — numbers are safe from injection because there's no quote to close",
              "Yes — with no quotes there's nothing to escape in the first place; the text is simply pasted into the statement",
              "No — MySQL rejects a WHERE with two conditions from one input",
            ],
            answer: 1,
            explain:
              "Quotes were never the vulnerability. Concatenation is. A numeric field is if anything EASIER, because the attacker doesn't even have to close a string first.",
          },
          explain:
            "9 rows instead of 1 — every sale with a quantity, including everyone else's. The lesson people take from this bug is usually 'escape the quotes', and it's wrong. There is nothing to escape here. The defect is that a value and a command travelled in the same string.",
        },
        {
          goal:
            "Now see what the SAFE version ends up asking. With a placeholder the value can only ever land in the hole, so the attacker's text is searched for as a NAME. Run that:  SELECT * FROM snacks WHERE name = 'x OR price > 0';",
          solution: "SELECT * FROM snacks WHERE name = 'x OR price > 0';",
          hint: "One pair of quotes, wrapped around the attacker's whole string — it is a snack name now, not a condition.",
          predict: {
            question: "The attacker's whole string is now a single value. What comes back?",
            choices: [
              "6 rows — the attack works regardless of how the value is sent",
              "0 rows — there is no snack whose name is the literal text  x OR price > 0",
              "Every snack whose price is above zero",
            ],
            answer: 1,
            explain:
              "The attack text becomes a harmless, if odd, snack name. Nothing matches it, so nothing comes back — which is the correct answer to 'find the snack called that'.",
          },
          explain:
            "0 rows, and no error. That is what safe looks like: the attack wasn't blocked, filtered or detected — it simply never stopped being a value. (The real attacker's string also carries an apostrophe, and a PreparedStatement handles that correctly too, without you writing a single line about quotes. Getting quoting right by hand is a fourth-best defence; the placeholder is the first.)",
        },
        {
          goal:
            "One more thing a placeholder canNOT do, so you don't try it. A ? stands for a VALUE, never a column or a keyword. Run the query somebody writes when they think ? is text substitution:  SELECT * FROM snacks WHERE name = '?';",
          solution: "SELECT * FROM snacks WHERE name = '?';",
          explain:
            "0 rows — it looked for a snack literally named '?'. This is the single most common PreparedStatement bug: quoting the placeholder. The ? goes in bare, with no quotes around it, whatever the column's type is. If you ever find yourself wanting to parameterise a TABLE name or an ORDER BY column, placeholders can't do it — you need a whitelist of allowed values in your Java instead.",
        },
        {
          goal:
            "Last one, composed by you: the honest query behind your app's 'search snacks by name' screen — everything about the snack called Kwek-kwek.",
          solution: "SELECT * FROM snacks WHERE name = 'Kwek-kwek';",
          explain:
            "1 row. That is the query you want your program to send every time, no matter what anybody types into the box — and by the end of today, it's the only kind it CAN send.",
        },
      ],
    },
{
      kind: "typing",
      id: "typing-prepared",
      title: "⌨️ Type the safe version",
      caseSensitive: true,
      intro:
        "The safe version is barely longer than the dangerous one — that's what makes the dangerous one indefensible. Case-sensitive, as always. After today, `Statement` with a value glued into it should feel physically uncomfortable to type.",
      rounds: [
        {
          prompt: "The SQL with a hole in it. Type the value the WHERE compares against.",
          template: "String sql = \"SELECT * FROM snacks WHERE name = {?}\";",
          explain:
            "Bare, no quotes, whatever the column's type. Quoting it — '?' — turns it into a literal question mark and your query silently finds nothing.",
        },
        {
          prompt: "Ask the connection for a prepared statement instead of a plain one.",
          template: "PreparedStatement ps = {conn.prepareStatement(sql)};",
          explain:
            "prepareStatement takes the SQL NOW, unlike createStatement which takes nothing. That's the whole difference: the server is told the shape of the statement before any value exists.",
        },
        {
          prompt: "Fill the first hole with a piece of text.",
          template: "{ps.setString(1, typedName)};",
          explain:
            "Parameter 1, not 0. The number is the position of the ? in the SQL, counting from the left, starting at one.",
        },
        {
          prompt: "Fill a hole with a whole number instead.",
          template: "{ps.setInt(1, snackId)};",
          explain:
            "setInt for INT columns, setString for text, setDate for dates — the mirror image of the getters you learned yesterday. Match the method to the column's type.",
        },
        {
          prompt: "Run it. Type the call — and note what you do NOT pass.",
          template: "ResultSet rs = {ps.executeQuery()};",
          explain:
            "Empty parentheses. The SQL was handed over at prepareStatement time, so passing it again here is both wrong and dangerous — the version that takes a String is the plain Statement method, and using it throws the SQL you carefully prepared straight in the bin.",
        },
        {
          prompt: "Two holes, in order. Type both setters for  WHERE snack_id = ? AND qty > ?",
          template: "{ps.setInt(1, snackId); ps.setInt(2, minQty);}",
          explain:
            "Left to right: the first ? is 1, the second is 2. Getting them backwards is a bug the compiler cannot see and the database will not complain about — it will simply answer a different question.",
        },
        {
          prompt: "Resources again: prepare and execute inside one try. Type the two resources.",
          template:
            "try ({PreparedStatement ps = conn.prepareStatement(sql); ResultSet rs = ps.executeQuery()})",
          explain:
            "You can't do this in one try block when the setters have to run between preparing and executing — a detail you'll meet in the lab. When that happens, prepare in the try's resource list and execute inside the body.",
        },
        {
          prompt:
            "From memory, the whole safe lookup: prepare the SQL, set the name as parameter 1, run it.",
          template:
            "{PreparedStatement ps = conn.prepareStatement(sql); ps.setString(1, typedName); ResultSet rs = ps.executeQuery();}",
          explain:
            "Three lines, and the injection you ran in the console becomes impossible — not harder, not filtered, impossible, because the value never travels as part of the command. This is the shape you will use for the rest of your career.",
        },
      ],
    },
{
      kind: "order",
      id: "order-safe-lookup",
      title: "🧩 Puzzle: rewrite the vulnerable screen",
      intro:
        "Here is the vulnerable lookup, and here are the parts of its safe replacement. Rebuild it — and notice, when you're done, how little you had to change to close a hole this size.",
      rounds: [
        {
          prompt:
            "The safe lookup, top to bottom: SQL with a hole, prepare, set, execute, read the one row, print it.",
          lines: [
            "String sql = \"SELECT snack_id, price FROM snacks WHERE name = ?\";",
            "try (PreparedStatement ps = conn.prepareStatement(sql)) {",
            "    ps.setString(1, typedName);",
            "    try (ResultSet rs = ps.executeQuery()) {",
            "        if (rs.next()) {",
            "            System.out.println(rs.getInt(\"snack_id\") + \" costs \" + rs.getInt(\"price\"));",
            "        } else {",
            "            System.out.println(\"No snack called \" + typedName);",
            "        }",
            "    }",
            "}",
          ],
          distractors: [
            "    ResultSet rs = ps.executeQuery(sql);",
            "String sql = \"SELECT snack_id, price FROM snacks WHERE name = '\" + typedName + \"'\";",
          ],
          explain:
            "Two impostors, and both are the ones people actually write. `executeQuery(sql)` is the inherited Statement method — it ignores everything you prepared and sends a raw string, quietly reopening the hole you just closed. The concatenated SQL is the vulnerable line itself. Note the else branch too: 'not found' is a normal outcome your screen has to say something about.",
        },
        {
          prompt:
            "Reusing one prepared statement for several values — the payoff nobody mentions. Six lines.",
          lines: [
            "String sql = \"INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, ?, ?)\";",
            "try (PreparedStatement ps = conn.prepareStatement(sql)) {",
            "    for (Sale s : salesToRecord) {",
            "        ps.setInt(1, s.snackId);",
            "        ps.setString(2, s.soldOn);",
            "        ps.setInt(3, s.qty);",
            "        ps.executeUpdate();",
            "    }",
            "}",
          ],
          explain:
            "One prepare, many executions. The server parses and plans the statement once and reuses that work for every row, which is why PreparedStatement is usually FASTER than concatenation as well as safer. The security argument is the one people quote; this is the one that wins arguments with people who don't care about security.",
        },
        {
          prompt:
            "The defence that is NOT the answer. Put these three in order of how much you should rely on them, best first.",
          lines: [
            "Use a PreparedStatement with placeholders",
            "Validate the input against what you actually expect (a number, a name from a known list)",
            "Try to strip or escape dangerous characters from the input by hand",
          ],
          explain:
            "Placeholders first, always — they remove the possibility rather than defending against it. Validation is real defence in depth and catches nonsense early, but it is not a substitute. Hand-written escaping is last for a reason: you have to be right about every character, every encoding and every edge case, forever, and the attacker only has to find one you missed.",
        },
      ],
    },
{
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: attack your own app, then fix it",
      intro:
        "You are going to write the vulnerable version deliberately, break into your own database with it, and then fix it — in that order. Writing the bug on purpose, once, in a place where it can't hurt anybody, is the only way this stops being a thing you've read about.",
      missions: [
        {
          task: "New file, LookupSnack.java. Take a snack name from args[0], build the SQL by concatenation the way the warm-up showed, run it with a plain Statement, and print every row it returns. Run it with a real name — Turon — and confirm it works normally.",
          check: {
            question: "Before you attack it: what makes this program vulnerable, in one line?",
            choices: [
              "It uses a Statement instead of a PreparedStatement",
              "A value from outside the program travelled to the server inside the command string, so the person supplying it can decide where the value ends",
              "It doesn't validate that the snack exists",
            ],
            answer: 1,
            explain:
              "Statement versus PreparedStatement is the symptom; the concatenation is the disease. You can write a perfectly safe program with a Statement — as long as no part of the SQL came from outside.",
          },
        },
        {
          task: "Attack it. Run your own program with the argument  x' OR price > 0  (quote it for your shell — on macOS or Linux: java LookupSnack \"x' OR price > 0\"). Print the SQL string your program built, just before it runs it, so you can see the statement you actually sent.",
          check: {
            question: "What did your program print?",
            choices: [
              "Nothing — the attack failed against a real database",
              "Every snack in the table, from a program written to return one",
              "A syntax error, because real MySQL is stricter than the mini server",
            ],
            answer: 1,
            explain:
              "Same result as the console, on your real server, from your own code. Printing the built SQL is the part worth keeping as a habit: when a query misbehaves, look at the string you actually sent rather than the string you meant to send.",
          },
        },
        {
          task: "Now fix it. Rewrite LookupSnack.java with a PreparedStatement and one placeholder — nothing else changes. Run it with Turon (still works), then run the exact same attack argument again.",
          check: {
            question: "What happens to the attack now, and what does the program print?",
            choices: [
              "It errors with 'invalid input detected'",
              "Nothing comes back and no error occurs — the attack text became one long snack name that matches nothing",
              "The program refuses to run and logs a security warning",
            ],
            answer: 1,
            explain:
              "No error, no warning, no drama. Correct behaviour here is boring: the attacker's text was treated as a name, no name matched, zero rows. That silence is what 'immune' looks like.",
          },
        },
        {
          task: "Go back through the programs you wrote on Day 2. Any of them that will ever take a value from outside — an argument, a Scanner, a config file — gets converted to a PreparedStatement now. Then add a section to week4-notes.md: the attack string you used, the SQL your vulnerable version built, and what the fixed version returned.",
          input:
            "Paste your fixed LookupSnack.java, the exact SQL string the vulnerable version built with your attack argument, and what the fixed version printed for the same input",
        },
      ],
    },
{
      kind: "quest",
      id: "how-it-works",
      title: "🔬 Quest: why the placeholder actually works",
      intro:
        "Plenty of people know to use PreparedStatement and cannot say why it helps — which means they don't know when it stops helping. Four questions that fix that, and the last one is the reason so many tutorials are misleading about this.",
      missions: [
        {
          task: "Say it in one sentence before you check: why can't a value passed to setString ever change what the query does?",
          check: {
            question: "Which explanation is right?",
            choices: [
              "setString escapes dangerous characters before pasting the value into the SQL",
              "The SQL and the value travel separately — the server parses the statement's shape first, so the value arrives after the meaning is already fixed",
              "The driver scans the value for keywords like OR and DROP and rejects them",
            ],
            answer: 1,
            explain:
              "Separation, not sanitisation. Nothing inspects your value or judges it; it simply arrives too late to be read as SQL. That's why placeholders are immune to attacks nobody has invented yet — there is no blocklist to get out of date.",
          },
        },
        {
          task: "Now the limit of it. You want the user to choose which column to sort by, so you try:  ORDER BY ?  and setString(1, \"price\"). Predict what happens.",
          check: {
            question: "What does the database do?",
            choices: [
              "It sorts by price, as intended",
              "It doesn't sort by that column — a ? is a VALUE, so it sorts by the constant string 'price' and the order looks random or unchanged; some drivers reject it outright",
              "It throws a SQL injection warning",
            ],
            answer: 1,
            explain:
              "Placeholders stand for values, never for column names, table names or keywords. This is the moment people give up and go back to concatenation — and the correct answer instead is a whitelist: map the user's choice to one of a few column names YOU wrote in your code, and concatenate only that.",
          },
        },
        {
          task: "The claim you'll hear: 'injection lets an attacker DROP your tables'. Test it against how JDBC actually behaves. MySQL's Connector/J refuses to run several statements in one call unless the connection is explicitly configured to allow it.",
          check: {
            question: "So what does that mean about the classic  '; DROP TABLE sales; --  attack?",
            choices: [
              "It usually fails on a default MySQL/JDBC setup — but the OR-style attack you ran works perfectly, so injection is still a full compromise of your data",
              "It means MySQL is immune to SQL injection",
              "It means concatenation is safe as long as you use MySQL",
            ],
            answer: 0,
            explain:
              "The famous example is not the realistic one. The realistic attack reads data that isn't yours, bypasses a check, or changes one row — quietly, with no error and nothing in a log that looks unusual. An attack that destroys a table announces itself; the one you ran does not.",
          },
        },
        {
          task: "Write the argument you'd use on a teammate who says 'it's an internal tool, nobody would attack it'. Two or three sentences, and include at least one reason that has nothing to do with attackers.",
          input:
            "Paste your argument — and name the non-security reason PreparedStatement wins anyway",
        },
      ],
    },
{
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic: placeholder edition",
      intro:
        "Six patients, all using PreparedStatement — and every one of them getting it slightly wrong. Three throw, three don't. As always, the silent ones are the expensive ones.",
      missions: [
        {
          task: "Patient 1. The query is  SELECT * FROM snacks WHERE name = '?'  and the code calls ps.setString(1, \"Turon\"). It throws: java.sql.SQLException: Parameter index out of range (1 > number of parameters, which is 0).",
          check: {
            question: "Why does the driver say there are ZERO parameters?",
            choices: [
              "Because setString was called before executeQuery",
              "Because the ? is inside quotes, so it's a literal question-mark character in a string, not a placeholder at all",
              "Because the query needs to be prepared twice",
            ],
            answer: 1,
            explain:
              "Quote a placeholder and it stops being one. The error is oddly helpful — 'which is 0' is the driver telling you it found no holes in your SQL. Take the quotes off; the ? never needs them, whatever the column type.",
          },
        },
        {
          task: "Patient 2. java.sql.SQLException: No value specified for parameter 2. The SQL has two ? and the code calls setInt(1, id) and then executeQuery().",
          check: {
            question: "The fix?",
            choices: [
              "Set every placeholder before executing — the second one was never filled",
              "Reduce the query to one placeholder",
              "Call executeQuery(sql) with the SQL string instead",
            ],
            answer: 0,
            explain:
              "Every hole must be filled, every time, before every execution. This is a good error to get: it fails loudly rather than guessing a value. Notice how much better that is than the concatenation version, which would have produced valid-looking SQL with a gap in it.",
          },
        },
        {
          task: "Patient 3. java.sql.SQLException: Can not issue data manipulation statements with executeQuery(). The statement was an INSERT.",
          check: {
            question: "What went wrong?",
            choices: [
              "executeQuery is for SELECT only — anything that changes rows uses executeUpdate",
              "INSERT statements cannot use placeholders",
              "The connection is read-only",
            ],
            answer: 0,
            explain:
              "executeQuery returns a ResultSet, and an INSERT has no rows to return — so the driver refuses rather than handing back something meaningless. Tomorrow is entirely about executeUpdate and the number it gives you back.",
          },
        },
        {
          task: "Patient 4, silent. The SQL is  WHERE snack_id = ? AND qty > ?  and the code calls setInt(1, minQty) then setInt(2, snackId). It runs cleanly and returns rows.",
          check: {
            question: "What's wrong?",
            choices: [
              "Nothing — the driver matches parameters by type",
              "The parameters are swapped: it's asking for snack_id = the quantity, and qty > the snack id. Both are ints, so nothing can detect it",
              "setInt cannot be called twice on one statement",
            ],
            answer: 1,
            explain:
              "Two parameters of the same type, in the wrong order, and every layer of the system is happy: it compiles, it runs, it returns rows, and the rows are wrong. This is why the numbers deserve a second look every time you write more than one setter.",
          },
        },
        {
          task: "Patient 5, silent. A search screen was 'fixed' by rejecting any input containing an apostrophe, and still concatenates.",
          check: {
            question: "Is it safe now?",
            choices: [
              "Yes — no apostrophe means no way to close the string",
              "No — numeric fields need no apostrophe at all, and blocklists only stop the attacks somebody already thought of",
              "Yes, as long as the input is also trimmed",
            ],
            answer: 1,
            explain:
              "You ran the numeric attack in the console yourself: no quotes involved anywhere. A blocklist also has to stay correct forever, across every encoding and every future feature, while the attacker needs one gap. Placeholders make the question disappear instead of answering it.",
          },
        },
        {
          task: "Patient 6, silent and the worst of the six. Someone carefully rewrote a screen to use PreparedStatement — placeholders, setters, everything — and finished the line  ResultSet rs = ps.executeQuery(sql);  because their IDE offered it and it compiled.",
          check: {
            question: "What does that program actually send to the server?",
            choices: [
              "The prepared statement with its values filled in",
              "The raw sql string — the inherited Statement method ignores everything that was prepared, so the placeholders are never used and the hole is wide open again",
              "Both, one after the other",
            ],
            answer: 1,
            explain:
              "It compiles, it runs, and it undoes the entire fix in one argument. The tell is that empty-parentheses executeQuery() is the PreparedStatement version. If you ever see a String going into executeQuery on a PreparedStatement, the security work in that file is decoration.",
          },
        },
        {
          task: "Discharge notes: six lines, symptom and cause and fix. Then one more: which of these six could get through a code review that wasn't looking for it, and why?",
          input:
            "Paste your six discharge notes plus your answer about which ones survive review",
        },
      ],
    }],
  game: {
    kind: "boss-battle",
    id: "boss-injector",
    title: "⚔️ Boss battle: The Injector",
    intro:
      "The Injector doesn't break your program. It types into it — politely, in the box you provided — and walks out with everything. You've already done its job once today. Prove you know how to shut it out.",
    boss: { name: "the Injector", emoji: "💉" },
    questions: [
      {
        prompt: "Someone types  x' OR price > 0  into a search box and gets every row back. What is the defect?",
        choices: [
          "The input wasn't validated",
          "A value from outside travelled to the server inside the command string, so the sender got to decide where the value ended",
          "The database user has too many permissions",
        ],
        answer: 1,
        explain:
          "Validation and permissions are worth having and neither is the defect. Concatenation is. The fix is to stop putting values in the command at all.",
      },
      {
        prompt: "Why is a value passed with setString safe, whatever characters it contains?",
        choices: [
          "The driver escapes dangerous characters",
          "The driver rejects values containing SQL keywords",
          "The SQL is parsed by the server BEFORE the value arrives, so the value can't change the statement's meaning",
        ],
        answer: 2,
        explain:
          "Separation, not sanitisation. Nothing judges your value — it just arrives too late to be read as a command. That's why placeholders defeat attacks nobody has thought of yet.",
      },
      {
        prompt: "What does this query find?",
        code: "SELECT * FROM snacks WHERE name = '?'",
        choices: [
          "Whatever you pass to setString(1, …)",
          "A snack literally named ? — the quotes turned the placeholder into an ordinary character, and setString will throw 'parameter index out of range'",
          "Every snack, because ? matches anything",
        ],
        answer: 1,
        explain:
          "Placeholders are never quoted, for any column type. The driver telling you there are 0 parameters is it saying it found no holes in your SQL.",
      },
      {
        prompt: "A numeric field is built by concatenation:  WHERE sale_id = \" + input. Is it safe because there are no quotes?",
        choices: [
          "No — with no quotes there is nothing to close in the first place; the text is pasted straight into the statement",
          "Yes — injection requires closing a string",
          "Yes, as long as the input is parsed as an int first",
        ],
        answer: 0,
        explain:
          "You ran this one yourself. Numeric concatenation is if anything easier to attack. (Parsing to an int first genuinely does help — but then the value is an int, and you may as well have used setInt.)",
      },
      {
        prompt: "You want the user to pick a sort column, so you write ORDER BY ? and setString(1, \"price\").",
        choices: [
          "It works — placeholders substitute any part of a query",
          "It doesn't sort by that column: a ? is a value, so this sorts by a constant string, and some drivers reject it outright",
          "It throws a SQL injection warning",
        ],
        answer: 1,
        explain:
          "Placeholders stand for values only — never column names, table names or keywords. The right answer for a user-chosen column is a whitelist in your Java: map their choice to one of a few names YOU wrote.",
      },
      {
        prompt: "What's wrong with this line, in a method that carefully prepared a statement?",
        code: "ResultSet rs = ps.executeQuery(sql);",
        choices: [
          "Nothing — passing the SQL again is harmless",
          "It calls the inherited Statement method and sends the raw string, so every placeholder is ignored and the hole is reopened",
          "executeQuery always requires the SQL as an argument",
        ],
        answer: 1,
        explain:
          "PreparedStatement's version takes no arguments. This compiles, runs, and silently undoes the entire fix — which makes it the most dangerous line in today's clinic.",
      },
      {
        prompt: "Which of these is the WEAKEST defence against injection?",
        choices: [
          "Placeholders",
          "Validating that input matches what you expect",
          "Stripping or escaping dangerous characters from the input by hand",
        ],
        answer: 2,
        explain:
          "Hand-escaping requires being right about every character, encoding and edge case forever; the attacker needs one gap. Placeholders remove the possibility; validation is genuine defence in depth on top.",
      },
      {
        prompt: "Besides security, why is PreparedStatement usually the better choice in a loop?",
        choices: [
          "It's shorter to write",
          "The server parses and plans the statement once and reuses that work for every execution",
          "It automatically batches inserts into one network call",
        ],
        answer: 1,
        explain:
          "Prepare once, execute many. It's the argument that persuades people who don't care about security — and it's why 'prepared' is the word: the work is done up front.",
      },
      {
        prompt: "In  WHERE snack_id = ? AND sold_on = ?, which parameter number is sold_on?",
        choices: ["2 — counting the ? marks left to right, starting at 1", "1", "0"],
        answer: 0,
        explain:
          "Left to right from 1. Two same-typed parameters in the wrong order is a bug nothing detects: it compiles, runs, returns rows, and answers the wrong question.",
      },
      {
        prompt:
          "SQL recall: your safe lookup returns 0 rows for a name that definitely exists. Which of these is NOT a possible cause?",
        choices: [
          "The placeholder was quoted, so the query searched for the literal text ?",
          "The value was set on the wrong parameter number",
          "The PreparedStatement escaped the value, so it no longer matches anything in the table",
        ],
        answer: 2,
        explain:
          "There is no escaping step that alters what your value matches — a placeholder value is compared exactly as you supplied it. If a lookup that should match returns nothing, look at the SQL string and the parameter numbers, not for imaginary mangling.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The attack string you used on your own program, and the SQL your vulnerable version built from it.",
      "Why a placeholder is safe, in one sentence, without using the word 'escape'.",
      "One thing a placeholder cannot do, and what you do instead.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
      "Paste your fixed LookupSnack.java.",
    ],
    note: "You broke into your own database this morning and closed the hole by lunchtime, with three lines of Java. Tomorrow your program stops only asking questions and starts changing things — which is where the locks you built in week 3 come back, in Java, wearing the same error numbers.",
  },
};
