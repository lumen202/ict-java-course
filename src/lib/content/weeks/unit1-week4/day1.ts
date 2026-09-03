// unit1-week4 · Day 1 — The handshake: connect Java to MySQL
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "The handshake — one Java program, one live connection to your database",
  warmupGame: {
    kind: "order",
    id: "warmup-url",
    title: "🧩 Warm-up: build the address",
    intro:
      "Before any Java runs, your program needs to know WHERE the database is. That address is one string with a fixed shape, and every part of it answers a question. Assemble it, then take it apart again.",
    rounds: [
      {
        prompt:
          "Assemble the connection URL for the school database on your own machine. Five pieces, in order, nothing between them.",
        lines: ["jdbc:", "mysql:", "//localhost", ":3306", "/school"],
        explain:
          "jdbc: names the family of driver. mysql: names the engine — change that one word and the same program talks to Postgres. //localhost is the machine (yours). :3306 is MySQL's port, the door number on that machine. /school is the database, doing the job your USE statement has been doing all along. Read together: jdbc:mysql://localhost:3306/school",
      },
      {
        prompt:
          "Now the address for a database called canteen on a school server at 192.168.1.50, still on MySQL's usual port.",
        lines: ["jdbc:", "mysql:", "//192.168.1.50", ":3306", "/canteen"],
        distractors: [":8080"],
        explain:
          "Only two pieces changed — the machine and the database. 8080 is a WEB server's port; MySQL isn't listening there, and a program aimed at it doesn't say 'wrong port', it says the connection was refused. The URL is the entire difference between 'my program' and 'my program, running against the real school server'.",
      },
      {
        prompt:
          "Assemble the three things DriverManager.getConnection needs, in the order it takes them.",
        lines: ["the URL", "the username", "the password"],
        distractors: ["the table name", "the SQL query"],
        explain:
          "URL, user, password — and nothing else. Notice what is NOT in that list: no table, no query. Connecting and asking are separate acts, and today is only the first one. A connection knows which database it points at; it knows nothing about what you plan to do there.",
      },
    ],
  },
  videos: [
    {
      title: "Connection",
      youtubeId: "M9EGxxvmu_Q",
      length: "8:31",
      practice: {
        intro: "Watch it once through, then again with your editor open. After the second pass:",
        steps: [
          "Type the connection block into ConnectTest.java yourself — do not paste it — and put YOUR database name in the URL.",
          "Run it and read what it prints. Anything other than a success message is today's real lesson, not a setback.",
          "Write down one thing the video did that this page does NOT ask you to do, and check Day 1's classpath quest for why.",
        ],
        note: "If the video opens with Class.forName, that's the line to skip — the quest below explains it. If it closes the connection by hand at the end, the puzzle below shows you the better way.",
      },
    },
  ],
  activities: [
    {
      kind: "sql-console",
      id: "the-target",
      title: "🖥️ Mini server: know exactly what you're connecting to",
      intro:
        "Your Java program is about to talk to the canteen ledger you locked last week. A program can only ask for columns that exist, spelled exactly right — so before writing a line of Java, confirm the shape of what's on the other end. This is the ledger as you left it on Friday: repaired, locked, one honest NULL.",
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
          goal: "The first question a program asks about a database it's never seen: what tables are in here?",
          solution: "SHOW TABLES;",
          hint: "SHOW TABLES;",
          explain:
            "snacks and sales. Your Java program will carry these two names as text inside its SQL and nothing else — and a typo here becomes a runtime exception there, because SQL inside a Java program is just a String to the compiler. Nothing checks it until it runs.",
        },
        {
          goal: "Now the exact column names and types of sales — the spelling your Java code has to match.",
          solution: "DESCRIBE sales;",
          hint: "DESCRIBE sales;",
          explain:
            "sale_id, snack_id, sold_on, qty. Write those four names down — from tomorrow you'll be fetching them by name out of a result, and 'snack_id' typed as 'snackid' is a mistake nothing catches until the program is running. (This mini server carries the ledger's DATA, not its lock, so the Key column is empty here. Run DESCRIBE sales on your real server and snack_id still shows MUL — that's the difference between a copy of the numbers and the real table.)",
        },
        {
          goal: "Confirm the ledger is still as you left it: every sale, all columns.",
          solution: "SELECT * FROM sales;",
          hint: "SELECT * FROM sales;",
          explain:
            "10 rows. Sales 4 and 10 point at snack 3 now — Thursday's repairs — and sale 7 still honestly says NULL. This is the data your program will be printing to a screen by Wednesday.",
        },
        {
          goal:
            "Write the query your Java program will send first: every sale with its snack's name and quantity, keeping the sales nothing explains. Show sale_id, name, qty.",
          solution:
            "SELECT sales.sale_id, snacks.name, sales.qty FROM sales LEFT JOIN snacks ON sales.snack_id = snacks.snack_id;",
          hint: "Last week's auditor query — LEFT JOIN so nothing is hidden.",
          predict: {
            question: "The ledger is repaired and locked now. How many rows come back, and how many have NULL in name?",
            choices: [
              "10 rows, 1 NULL — only sale 7, the honest unknown, has no snack",
              "10 rows, 3 NULLs — same as last week",
              "9 rows, 0 NULLs — the lock removed the unmatched row",
            ],
            answer: 0,
            explain:
              "The repairs gave sales 4 and 10 a real snack, and the lock guarantees no new ghost can appear. Sale 7 is untouched and always will be — a NULL foreign key is legal.",
          },
          explain:
            "10 rows, one NULL name. Hold on to that NULL. Tomorrow, when Java reads this same result, that one cell behaves differently from every other cell in the grid — and it's the first thing that catches people out.",
        },
        {
          goal: "One a program would really be asked for: the canteen's menu, cheapest first — name and price only.",
          solution: "SELECT name, price FROM snacks ORDER BY price;",
          explain:
            "6 rows, Pastillas first at 8. Small, tidy, ordered — the sort of result that fits on a phone screen. When you design what your program prints, remember that you are CHOOSING this, not dumping a table.",
        },
        {
          goal:
            "Compose it yourself: your program's 'what sold today' screen for 2026-08-14 — snack name and quantity.",
          solution:
            "SELECT snacks.name, sales.qty FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id WHERE sales.sold_on = '2026-08-14';",
          explain:
            "2 rows, both Kwek-kwek. Every screen in the app you build this week is one query like this plus a loop that prints it. The SQL is the hard half, and you already own it.",
        },
      ],
    },
    {
      kind: "typing",
      id: "typing-connect",
      title: "⌨️ Type the handshake",
      caseSensitive: true,
      intro:
        "New rule for this week: Java is CASE-SENSITIVE, so these rounds are too. `string` is not `String`, `preparedstatement` is not `PreparedStatement`, and the compiler will not forgive it — so neither does this game. Capitals matter from here to the end of the course.",
      rounds: [
        {
          prompt: "The import that brings in all of JDBC — one line, top of the file.",
          template: "{import java.sql.*;}",
          explain:
            "Everything you touch this week — Connection, Statement, ResultSet, PreparedStatement, SQLException — lives in java.sql. One wildcard import covers the lot.",
        },
        {
          prompt: "The address, as a Java variable called url. Type the value, quotes included.",
          template: "String url = {\"jdbc:mysql://localhost:3306/school\"};",
          explain:
            "The five pieces from the warm-up, now a plain String. To Java this is only text — it has no idea whether that database exists. Everything the URL claims is checked at RUN time by the driver, never at compile time.",
        },
        {
          prompt: "The one call that opens a connection — type the class and the method.",
          template: "Connection conn = {DriverManager.getConnection}(url, user, password);",
          explain:
            "DriverManager is the switchboard: hand it a URL, it finds the driver that understands `jdbc:mysql:` and hands back a live Connection. You never construct a Connection yourself.",
        },
        {
          prompt: "Same line — type the three arguments, in order.",
          template: "Connection conn = DriverManager.getConnection({url, user, password});",
          explain:
            "Always that order. Swap the last two and you get 'Access denied' with your password sitting in the username slot of the error message — an embarrassing and very common five minutes.",
        },
        {
          prompt: "Open it so it closes itself no matter what happens — type the two characters-plus-word that start the block.",
          template: "{try (}Connection conn = DriverManager.getConnection(url, user, password))",
          explain:
            "try-with-resources. A Connection is an open socket to another program, so leaving it open is a real leak. Anything declared in those parentheses is closed when the block ends — normally, or by an exception.",
        },
        {
          prompt: "Catch what connecting can throw. Type the whole catch clause, exception type included.",
          template: "{catch (SQLException e)}",
          explain:
            "SQLException is CHECKED, so the compiler forces you to deal with it. That is the language telling you something true: a database call is a request to another program that may refuse, and pretending otherwise doesn't compile.",
        },
        {
          prompt:
            "Inside the catch, print the two things that actually identify the problem — MySQL's error number and the message.",
          template: "System.out.println({e.getErrorCode() + \": \" + e.getMessage()});",
          explain:
            "getErrorCode() returns the SAME numbers you spent last week learning — 1045, 1049, 1452, 1451. Your Java program receives MySQL's own complaint. Printing only e.getMessage() throws away the number, which is the part you can look up.",
        },
        {
          prompt:
            "From memory, the whole handshake in one line: open a connection to url with user and password, inside a try-with-resources.",
          template: "{try (Connection conn = DriverManager.getConnection(url, user, password))}",
          explain:
            "That line is the entire day. Everything for the rest of the week happens INSIDE that block, because everything needs a live connection to happen on.",
        },
      ],
    },
    {
      kind: "order",
      id: "order-connect-block",
      title: "🧩 Puzzle: the whole program, in order",
      intro:
        "A first JDBC program is short — under twenty lines — and every line has exactly one place it can go. Assemble it. Lines that don't belong are in the pile too, and leaving one out is as much the answer as placing the others.",
      rounds: [
        {
          prompt:
            "The smallest program that proves the connection works: import, class, main, the three settings, the try-with-resources, a success message, the catch.",
          lines: [
            "import java.sql.*;",
            "public class ConnectTest {",
            "    public static void main(String[] args) {",
            "        String url = \"jdbc:mysql://localhost:3306/school\";",
            "        String user = \"root\";",
            "        String password = \"your-password\";",
            "        try (Connection conn = DriverManager.getConnection(url, user, password)) {",
            "            System.out.println(\"Connected to \" + conn.getCatalog());",
            "        } catch (SQLException e) {",
            "            System.out.println(e.getErrorCode() + \": \" + e.getMessage());",
            "        }",
            "    }",
            "}",
          ],
          distractors: ["        conn.close();"],
          explain:
            "The explicit close() is the impostor, and it's the line most people add out of habit. try-with-resources already closes conn at the end of the block — and worse, that line would sit OUTSIDE the try, where the variable no longer exists, so it wouldn't even compile. When a language gives you automatic cleanup, manual cleanup isn't extra safety; it's a second, worse mechanism competing with the first.",
        },
        {
          prompt:
            "The order the driver works in once you call getConnection. Four steps.",
          lines: [
            "DriverManager reads the URL and looks for a driver that understands 'jdbc:mysql:'",
            "The MySQL driver opens a network socket to localhost on port 3306",
            "The server checks the username and password",
            "The server switches to the 'school' database and hands back a live Connection",
          ],
          explain:
            "Knowing this order is how you read a failure. 'No suitable driver' = step 1, so the jar isn't on your classpath. 'Communications link failure' = step 2, so the server isn't running or the port is wrong. 'Access denied' = step 3, credentials. 'Unknown database' = step 4, and the first three all worked. Every error tells you how far it got.",
        },
        {
          prompt:
            "A safer arrangement of the same two lines: read the password from outside the code, then use it.",
          lines: [
            "String password = System.getenv(\"DB_PASSWORD\");",
            "try (Connection conn = DriverManager.getConnection(url, user, password)) {",
          ],
          distractors: ["String password = \"MyRealPassword123\";"],
          explain:
            "A password typed into source code goes wherever the source goes — your turn-in, a USB stick, a repository — and changing it means editing and recompiling. System.getenv reads it from the environment instead, so the code can be shared and the secret can't. You'll use a literal today while you get things working; the point is knowing it's a placeholder, not the finished shape.",
        },
      ],
    },
    {
      kind: "quest",
      id: "the-classpath",
      inline: true,
      title: "🔌 Quest: put the driver where Java can find it",
      intro:
        "Java does not know how to speak MySQL. That knowledge lives in a separate file — the MySQL Connector/J driver — and the single most common reason a first JDBC program fails is that Java can't find it. Get this right once and it stops being a problem for the rest of the course.",
      missions: [
        {
          task: "Download the driver: go to dev.mysql.com/downloads/connector/j, choose 'Platform Independent', and take the ZIP (not the installer). Unzip it and find the file inside called mysql-connector-j-<version>.jar. Put it where you'll find it again — a lib folder next to your project is ideal.",
          check: {
            question: "What IS that .jar file?",
            choices: [
              "A copy of MySQL itself, so your program doesn't need the server running",
              "Java code, written by MySQL, that turns Java method calls into the network messages the MySQL server understands",
              "A configuration file listing your databases",
            ],
            answer: 1,
            explain:
              "It's a translator — and it's the reason the same JDBC code can talk to Postgres or SQLite by swapping one jar and one word in the URL. The server still has to be running; the driver only knows how to talk to it.",
          },
        },
        {
          task: "Put the jar on your project's classpath. IntelliJ: File → Project Structure → Modules → Dependencies → + → JARs or directories → pick the jar. VS Code: put the jar in a lib folder and add it to .vscode/settings.json under java.project.referencedLibraries. Command line: javac -cp .:lib/mysql-connector-j.jar ConnectTest.java (use ; instead of : on Windows).",
          check: {
            question: "You skip this step and run the program anyway. It compiles fine. What happens?",
            choices: [
              "A compile error naming DriverManager",
              "It runs and connects — the driver is built into Java",
              "It runs, then fails at getConnection with 'No suitable driver found for jdbc:mysql://…'",
            ],
            answer: 2,
            explain:
              "It COMPILES, because DriverManager and Connection are part of Java itself — only the MySQL-speaking part is missing, and nothing needs that until run time. 'No suitable driver' always means the same thing: the jar isn't on the classpath. It never means your URL is wrong.",
          },
        },
        {
          task: "One thing NOT to do, which nearly every older tutorial opens with: Class.forName(\"com.mysql.jdbc.Driver\"). Look it up if you like, then leave it out. Drivers have registered themselves automatically since JDBC 4.0 — anything you'd download this decade.",
          check: {
            question: "Why does so much online JDBC code still start with Class.forName?",
            choices: [
              "It's still required for MySQL specifically",
              "It was required before 2007, and tutorials get copied from tutorials — the class name inside it is the OLD one too, which now warns or fails",
              "It makes the connection faster",
            ],
            answer: 1,
            explain:
              "This matters well beyond one line. JDBC is old enough that most code you'll find online targets a version you aren't running — so when something you copied doesn't work, check the snippet's age before you doubt your own understanding.",
          },
        },
        {
          task: "Write down, in your own words, the four failures from the puzzle and what each one means: no suitable driver, communications link failure, access denied, unknown database. Keep the list where you can see it — you will meet all four this week.",
          input:
            "Paste your four-line failure guide: the error text, what it tells you, and what you'd check first",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: your first Java program that talks to a database",
      intro:
        "Everything so far has been on paper. Now the real thing, in your real editor, against your real ledger — the one you locked last week. Small program, big moment: this is the line between 'I can write SQL' and 'my software uses a database'.",
      missions: [
        {
          task: "Make a project (or a folder) called canteen, with a lib folder holding the Connector/J jar, and a file called ConnectTest.java. Set the classpath the way the quest described.",
          check: {
            question: "Before writing any code — what has to be true for this program to succeed?",
            choices: [
              "Only that the jar is on the classpath",
              "The MySQL server must be running, the school database must exist, the credentials must be right, AND the jar must be on the classpath",
              "Only that MySQL Workbench is open",
            ],
            answer: 1,
            explain:
              "Four separate things, four different error messages. Workbench being open is irrelevant — it's just another client. But if Workbench CAN connect, that proves the first three, which makes it a fast way to narrow down where the problem is.",
          },
        },
        {
          task: "Write ConnectTest.java exactly as you assembled it: import, class, main, url/user/password, try-with-resources around DriverManager.getConnection, print \"Connected to \" + conn.getCatalog(), catch SQLException and print the error code and message. Use YOUR MySQL password. Run it.",
          check: {
            question: "It printed 'Connected to school'. What does getCatalog() return, and why print it?",
            choices: [
              "The name of the database this connection is pointed at — proof you reached the right one, not just some server",
              "The list of all tables",
              "The name of the driver jar",
            ],
            answer: 0,
            explain:
              "'It connected' and 'it connected to the database I meant' are different claims. Printing the catalog makes the program prove the second one — which starts to matter the day there's a school database on two different machines.",
          },
        },
        {
          task: "Now break it on purpose, four times, one at a time — and READ each error before fixing it. (1) Change the database in the URL to schoool. (2) Put it back; use a wrong password. (3) Put it back; change the port to 3307. (4) Put it back; remove the jar from the classpath. Note the error code and the first line of the message each time.",
          check: {
            question: "Which of your four breakages produced an error with NO MySQL error code — a 0?",
            choices: [
              "The wrong password — authentication failures carry no code",
              "The wrong database name",
              "The missing jar and the wrong port — the server was never reached, so there was no server to send a number",
            ],
            answer: 2,
            explain:
              "An error code comes FROM MySQL. Wrong database (1049) and wrong password (1045) mean you reached the server and it answered you. A missing driver or a refused connection means you never got that far, so the code is 0 and the message is all you have. That split tells you instantly whether the problem is on your side of the wire or theirs.",
          },
        },
        {
          task: "Start a file called week4-notes.md (the same habit as week3.sql). Record your working URL, the four breakages with their exact error codes and messages, and one line on what each one proves.",
          input:
            "Paste your notes: the URL you used, plus your four breakages with the exact error code and first line of each message",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro:
        "The bug hospital, in Java. Each patient is a program that fails, shown with the error it produced — diagnose it from the message alone. That skill IS the job: a running program is the only thing that will ever tell you what's wrong with it, and it tells you in exactly this form.",
      missions: [
        {
          task: "Patient 1. Compiles, runs, then stops with:  Exception in thread \"main\" java.sql.SQLException: No suitable driver found for jdbc:mysql://localhost:3306/school",
          check: {
            question: "What's wrong — and what is definitely NOT yet known to be wrong?",
            choices: [
              "The URL is malformed; 'no suitable driver' means it couldn't be parsed",
              "The Connector/J jar isn't on the classpath. The server, the password and the database name are all still untested — nothing got far enough to check them",
              "The MySQL server isn't running",
            ],
            answer: 1,
            explain:
              "DriverManager looked through the drivers it knows and none claimed 'jdbc:mysql:'. It never opened a socket, so it learned nothing about your server or your credentials. Fix the classpath and the NEXT error tells you the next thing.",
          },
        },
        {
          task: "Patient 2. Access denied for user 'root'@'localhost' (using password: YES) — error code 1045.",
          check: {
            question: "What does '(using password: YES)' add to the diagnosis?",
            choices: [
              "That a password WAS sent and was rejected — so the problem is its value, not a missing argument. 'NO' would mean you sent an empty one",
              "That the password is right but the user lacks permission",
              "That MySQL wants the password encrypted",
            ],
            answer: 0,
            explain:
              "It separates 'wrong password' from 'no password'. Seeing 'using password: NO' when you're sure you set one usually means the variable was empty — or that the arguments went in the wrong order, which catches people constantly.",
          },
        },
        {
          task: "Patient 3. Unknown database 'schoool' — error code 1049.",
          check: {
            question: "What does this error PROVE about the rest of the setup?",
            choices: [
              "Nothing — any other error could still be hiding behind it",
              "That the driver loaded, the server was reached, and the username and password were accepted. Only the last step failed",
              "That the school database was deleted",
            ],
            answer: 1,
            explain:
              "This is the most reassuring error in JDBC. Getting 1049 means clearing every earlier hurdle, so it says 'everything works, you named the wrong database'. Read errors for what they rule OUT, not only for what they say.",
          },
        },
        {
          task: "Patient 4. com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure — and getErrorCode() returns 0.",
          check: {
            question: "Which two causes do you check first?",
            choices: [
              "A misspelled table name, or a syntax error in the SQL",
              "The MySQL server isn't running, or the host/port in the URL is wrong — nothing on the other end answered",
              "The password expired",
            ],
            answer: 1,
            explain:
              "Error code 0 means the message came from the DRIVER, not from MySQL — nobody answered, so nobody sent a number. Start the server, or check the port. The SQL is irrelevant here: the program never got close enough to send any.",
          },
        },
        {
          task: "Patient 5. This one compiles, connects, prints nothing, and exits with status 0 — a total success by every visible sign. The entire body of main is:  try (Connection conn = DriverManager.getConnection(url, user, password)) { }  catch (SQLException e) { }",
          check: {
            question: "What is the actual defect?",
            choices: [
              "The empty catch block. If the connection fails, the exception is caught and thrown away, so a broken program is indistinguishable from a working one",
              "The empty try block — you must run a query inside it",
              "Nothing; a program with nothing to report should print nothing",
            ],
            answer: 0,
            explain:
              "An empty catch is the worst line in the file, and this is the only patient today with no error message — because it deleted its own. `catch (SQLException e) { }` turns every failure into silence. Print it, log it, or rethrow it, but never swallow it. You will be tempted the first time a red stack trace annoys you.",
          },
        },
        {
          task: "Write the clinic's discharge notes: for each of the five patients, one line on what the message told you and what you'd check first. Then add the one general rule you'd give somebody starting JDBC tomorrow.",
          input:
            "Paste your five discharge notes plus your general rule for reading JDBC failures",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-gatekeeper",
    title: "⚔️ Boss battle: The Gatekeeper",
    intro:
      "The Gatekeeper stands between your program and your data, and it only ever says no in four ways. You've met all four today. Name them and it has to let you through.",
    boss: { name: "the Gatekeeper", emoji: "🚪" },
    questions: [
      {
        prompt: "Read the URL. Which part names the DATABASE?",
        code: "jdbc:mysql://localhost:3306/school",
        choices: [
          "localhost — the machine holding it",
          "school — the segment after the last slash",
          "3306 — the port it lives on",
        ],
        answer: 1,
        explain:
          "The last segment is the database, doing the job your USE statement used to do. localhost is the machine, 3306 is the door on that machine.",
      },
      {
        prompt: "'No suitable driver found for jdbc:mysql://localhost:3306/school' means:",
        choices: [
          "The Connector/J jar isn't on the classpath — nothing has tried to reach the server yet",
          "Your password is wrong",
          "The school database doesn't exist",
        ],
        answer: 0,
        explain:
          "DriverManager found nothing that speaks jdbc:mysql:. At that point the server, the credentials and the database name are all still completely untested.",
      },
      {
        prompt: "Error code 1049, 'Unknown database'. Which of these is now PROVEN to work?",
        choices: [
          "Nothing yet — 1049 comes from the driver, not the server",
          "Only the classpath",
          "The classpath, the server, the port, and your username and password — the failure is at the last step",
        ],
        answer: 2,
        explain:
          "A MySQL error code means MySQL itself answered you, which is only possible once everything before it worked. Errors rule things out as much as they report them.",
      },
      {
        prompt: "Why is SQLException CHECKED — one the compiler forces you to handle?",
        choices: [
          "Because databases are slow",
          "Because a database call is a request to another program that can legitimately refuse, so a correct program must say what it does when that happens",
          "Because Java requires all exceptions to be checked",
        ],
        answer: 1,
        explain:
          "Failure here isn't a bug, it's an outcome. Java reserves checked exceptions for exactly this: things that go wrong for reasons your code cannot prevent, so the caller needs a plan.",
      },
      {
        prompt: "What does try-with-resources do that a plain try/catch does not?",
        code: "try (Connection conn = DriverManager.getConnection(url, user, password)) {\n    // ...\n}",
        choices: [
          "It closes anything declared in its parentheses when the block ends — normally OR by exception",
          "It retries the connection if it fails",
          "It makes SQLException unchecked",
        ],
        answer: 0,
        explain:
          "The 'or by exception' is the whole point. A hand-written close() on the last line of a try block never runs on the failure path — which is exactly when you most need the socket released.",
      },
      {
        prompt: "What's wrong with this catch block?",
        code: "} catch (SQLException e) { }",
        choices: [
          "Nothing — catching the exception is the requirement",
          "It should catch Exception instead, to be safe",
          "It throws the diagnosis away, so a failed program looks exactly like a working one",
        ],
        answer: 2,
        explain:
          "The message and error code you'd need are handed to you and then dropped. An empty catch doesn't handle a failure, it hides it — from you, later, when you have no idea what changed.",
      },
      {
        prompt: "Where does e.getErrorCode() get its number from?",
        choices: [
          "MySQL itself — the same codes as 1452, 1451, 1045 and 1049 from your SQL weeks",
          "Java assigns them in order as exceptions occur",
          "The Connector/J jar version",
        ],
        answer: 0,
        explain:
          "Your Java program receives the server's own complaint, unedited. Everything you learned about those numbers still applies; only the delivery changed. A code of 0 means the message came from the driver, because the server was never reached.",
      },
      {
        prompt: "Should you keep Class.forName(\"com.mysql.jdbc.Driver\") at the top, as older tutorials show?",
        choices: [
          "Yes — MySQL still requires it",
          "No — drivers have registered themselves automatically since JDBC 4.0, and that class name is the outdated one",
          "Only when using try-with-resources",
        ],
        answer: 1,
        explain:
          "It's a fossil. The wider lesson: JDBC is old enough that most code you find online targets a version you aren't running, so check a snippet's age before doubting yourself.",
      },
      {
        prompt:
          "SQL recall, because your program is about to send some. What does snacks LEFT JOIN sales, filtered WHERE sales.sale_id IS NULL, return?",
        choices: [
          "Every snack with at least one sale",
          "Every snack that has never sold — the join found no partner",
          "Nothing, ever — sale_id is a primary key, so it can't be NULL",
        ],
        answer: 1,
        explain:
          "The anti-join. And yes, sale_id CAN be NULL here — not in the table, but in the joined RESULT, where a snack with no partner carries NULLs across every sales column. Your program reads those NULLs tomorrow.",
      },
      {
        prompt: "Your program has String password = \"Canteen2026\"; in it. What's the practical problem?",
        choices: [
          "It's slower than reading from the environment",
          "MySQL rejects passwords that appear in source files",
          "The secret goes wherever the file goes — your turn-in, a shared folder, a repository — and changing it means editing and recompiling",
        ],
        answer: 2,
        explain:
          "Today it's a placeholder so you can get connected, and that's fine. Knowing it's a placeholder is the part that matters: the finished shape reads it from the environment, so the code can be shared and the secret cannot.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "Your working connection URL, with the parts labelled: machine, port, database.",
      "The four ways connecting can fail, and the ONE thing each error tells you to check.",
      "Why an empty catch block is worse than no try/catch at all.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
      "Paste ConnectTest.java as it stands.",
    ],
    note: "You have a live wire between Java and your data now — the hardest single step of the week, and the one that fails for the most different reasons. Tomorrow you send your first question down it and read the answer back.",
  },
};
