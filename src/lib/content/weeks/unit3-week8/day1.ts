// unit3-week8 · Day 1 — Your app opens the ledger
//
// First MySQL day. Milestone: pom.xml + application.properties connect the
// canteen-web app to the student's own `school` database (Week 3's tables), and
// GET /api/snacks is READ from the snacks table through Spring's JdbcClient.
// Nothing else changes: every address, status code and JSON key is the Week 7
// one, so the Week 5–7 pages keep working untouched.
//
// Every behaviour this day states was observed on a real Spring Boot 4.1.1
// build (Initializr defaults, spring-boot-starter-jdbc + mysql-connector-j
// 9.7.0, Spring Framework 7.0.9) against a MySQL 8 container holding the Week
// 3–4 ledger rebuilt from the course content:
//  - a wrong password / unknown database / refused port does NOT stop the app
//    starting; the first request that needs MySQL answers 500 "Failed to obtain
//    JDBC Connection", and the terminal's "with root cause" line names the cause
//    (Access denied ... (using password: YES) / Unknown database 'schoool' /
//    java.net.ConnectException: Connection refused);
//  - no datasource lines (or a typo such as spring.datasource.ulr, or a commented
//    out url) DOES stop the start: "Failed to configure a DataSource: 'url'
//    attribute is not specified";
//  - a missing mysql-connector-j stops the start, last Caused by
//    ClassNotFoundException: com.mysql.cj.jdbc.Driver;
//  - an empty spring.datasource.username falls back to the operating-system
//    user name (Access denied for user '<that name>');
//  - the pool reconnects by itself once MySQL is back;
//  - .query(Snack.class) maps snake_case columns onto the record's snake_case
//    components with no configuration.
// Videos (transcripts read): Gyan Darpan, JdbcClient intro (ErSHYE8JQYU, 3:44);
// Tech with Monir, connect Spring Boot to MySQL (_Drg6kful2U, 7:30; Boot 2.7,
// Gradle, JPA — all covered by the week's watch notes).
//
// NOT verified: the VS Code project-reload popup after editing pom.xml, and the
// exact "Connection refused" wording on Windows.
//
// Revised after the first two reviews (see
// docs/agent/log/2026-10-28-week8-reviews-and-part-2.md):
//  - the lab snack is Kutsinta (id 90), not Taho: Week 3 Day 5 has students insert
//    a Taho (id 7), so a name search for "Taho" found two on many ledgers;
//  - the price experiments run on Kutsinta, never on the student's own Turon;
//  - the checkpoint no longer counts snacks (Week 3 may have deleted one) and
//    its first task is failed by Week 7's Java list (previousStage);
//  - the day continues with Part 2, "the raw ledger" (day1Part2 below).

import type { DayPlan } from "../../types";
import {
  CONTROLLER_D1A,
  DATASOURCE_LINES,
  JDBC_FIELD,
  LIST_SNACKS_D1,
  LAB_SNACK_INSERT,
  NEW_IMPORT_JDBC,
  POM_DEPS,
  PROPERTIES_FILE,
} from "./snippets";
import { day1Part2 } from "./day1-part2";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Your app opens the ledger: pom.xml, application.properties, and GET /api/snacks read from MySQL",
  warmupGame: {
    kind: "quest",
    id: "warmup-chain",
    title: "🔗 Warm-up: three programs, two doors",
    intro: "Weeks 4 to 7 each built one end of a chain. This week you join the ends.",
    missions: [
      {
        task:
          "Week 4: your Java program connected to MySQL at port 3306. Weeks 5 to 7: the browser connects to your app at port 8080. This week an order will travel browser → your app → MySQL, and back.",
        hint: "A client is the one that starts the conversation by asking. Who asks MySQL for rows?",
        check: {
          question: "In  browser → your app → MySQL,  who is the CLIENT of MySQL?",
          choices: [
            "The browser",
            "The page's JavaScript",
            "Your Spring Boot app: it asks MySQL, exactly like your Week 4 program did",
          ],
          answer: 2,
          explain: "Your app is the server for the browser and the client of MySQL at the same time. Both doors are ones you have already opened.",
        },
      },
      {
        task: "Week 4's address for the ledger was  jdbc:mysql://localhost:3306/school.  Read it left to right: the kind of database, the machine, the door number, the database.",
        hint: "Week 4 Day 1 explained each part. The last part does the job of the USE statement.",
        check: {
          question: "Which part of that address picks WHICH database on the server?",
          choices: ["localhost", "3306", "/school"],
          answer: 2,
          explain: "/school is the USE school; of a URL. Next to it, 3306 is the door number, and localhost is the machine.",
        },
      },
      {
        task: "In Week 7 the six snacks lived in a Java list inside SnackController, and a restart rebuilt the list from the code.",
        hint: "Where did the snacks and the orders live last week, and what happened to the orders when the app restarted?",
        check: {
          question: "What changes this week?",
          choices: [
            "The pages: every page is rewritten",
            "The home of the data: the snacks and the orders move from Java lists into your MySQL tables, and the addresses, status codes and JSON keys stay exactly as they are",
            "The port: the app moves to 3306",
          ],
          answer: 1,
          explain: "That is why your menu, order form and orders board need no change to work with MySQL. They never knew where the data lived.",
        },
      },
    ],
  },
  videos: [
    {
      title: "JdbcClient in Spring Boot: the modern JDBC alternative (Gyan Darpan)",
      youtubeId: "ErSHYE8JQYU",
      length: "3:44",
      practice: {
        intro: "He lists what JdbcClient does for you. Week 4 did all of that by hand. Match them up, then look at the real ledger your app is about to open.",
        steps: [
          "In notes.md, write Week 4's four chores and, beside each, who does it this week: (1) DriverManager.getConnection(url, user, password), (2) a PreparedStatement with ? marks, (3) the while (rs.next()) loop that copies a row into an object, (4) closing everything. Use the video's words: JdbcClient, built-in row mapping, auto-configured.",
          "Open queries.sql (at the top of your project, next to pom.xml). In VS Code, open the SQLTools panel (the cylinder icon on the left) and connect to your ledger. Type  SELECT * FROM snacks;  then press Ctrl+E, then Ctrl+E again. Write in notes.md how many rows snacks has and each name and price.",
          "Run  SELECT * FROM sales;  and count the rows: write the number in notes.md. Run  DESCRIBE sales;  and look at the Extra column of sale_id: write down whether it is empty or says auto_increment. You need that in Part 2 today.",
        ],
        note: "He says JdbcClient exists from Spring Boot 3.2. Your project is Spring Boot 4, which has it too. If SQLTools can't connect, look at its error: it is Week 4's wrong-password or MySQL-not-running problem again.",
      },
    },
    {
      title: "How to connect Spring Boot with MySQL (Tech with Monir)",
      youtubeId: "_Drg6kful2U",
      length: "7:30",
      practice: {
        intro: "He connects an app to MySQL with three lines in application.properties. Do the same to canteen-web, then break it once on purpose.",
        steps: [
          "Make sure MySQL is running. In PowerShell:  Get-Service MySQL*  should say Running. (SQLTools connecting in the last step already proved it.)",
          "Open pom.xml. Find the line  </dependencies>  and, just above it, paste these two blocks (inside <dependencies>, after the last </dependency>). The first is Spring's JDBC tools. The second is Week 4's Connector/J jar, now fetched by Maven for you:\n\n" +
            POM_DEPS,
          "Save pom.xml. If VS Code asks whether to synchronize the Java classpath or configuration, click Yes. Give it a minute: the status bar at the bottom may say Importing or Downloading while Maven fetches the jars.",
          "Open src/main/resources/application.properties. Leave the lines already there. Click at the very end of the last line, press Enter, and type these three lines, using YOUR MySQL user and password (the same as in Week 4's ConnectTest) in place of root and YOUR_MYSQL_PASSWORD:\n\n" +
            DATASOURCE_LINES,
          "Save, stop the app if it is running (red square) and run it (Run above main). The terminal should end with  Started CanteenWebApplication.  Open localhost:8080/menu.html: nothing has changed yet.",
          "Now break it on purpose: put a # at the very start of the spring.datasource.url line, save, and Run again. Read what the terminal says (it stops, with a boxed APPLICATION FAILED TO START message), then delete the # and run again.",
        ],
        note: "He uses Boot 2.7, Gradle, IntelliJ and JPA, and a different port. None of that matters here: pom.xml is your Gradle file, you use the JDBC API, not JPA, and the three property names are the same in Boot 4. This file now holds your MySQL password: never paste it into a turn-in or a screenshot.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: /api/snacks, from your own MySQL",
      intro:
        "One file changes today: SnackController.java. Restart the app after every change to a .java file, and reload the page after every SQL change.",
      missions: [
        {
          task:
            "Ask Spring for a JdbcClient. In SnackController.java: (1) under the other import lines add:\n\n" +
            NEW_IMPORT_JDBC +
            "\n\n(2) Under the line  public class SnackController {  add a blank line and then:\n\n" +
            JDBC_FIELD +
            "\n\nThis is constructor injection. Spring builds your SnackController itself; it sees that the constructor needs a JdbcClient, builds one from your three datasource lines, and hands it in.",
          hint:
            "The field is  private final JdbcClient jdbc;  and the constructor copies the argument into it with  this.jdbc = jdbc;.  Put both inside the class braces, above the other fields. A red JdbcClient means the import line is missing, or VS Code hasn't reloaded pom.xml yet (wait for the status bar, then see the error clinic).",
          check: {
            question: "Who calls  new SnackController(…)  and passes in the JdbcClient?",
            choices: [
              "You do, in CanteenWebApplication",
              "Spring does, when the app starts, because the constructor asks for one",
              "The browser, on the first request",
            ],
            answer: 1,
            explain: "You never write new SnackController. Spring finds the class (because of @RestController), reads its constructor, and supplies what it asks for.",
          },
        },
        {
          task:
            "Replace listSnacks. Delete the whole old listSnacks method (from  @GetMapping(\"/api/snacks\")  down to its closing }) and type this in its place. The first three lines are new; the rest is last week's maxPrice loop, now looping over the rows MySQL gave you:\n\n" +
            LIST_SNACKS_D1,
          hint:
            "Three new lines build  all :  jdbc.sql(…)  holds your SQL,  .query(Snack.class)  says 'turn each row into a Snack',  .list()  says 'give me all of them'. The loop and the two returns below are Week 7's. Leave the  private final List<Snack> snacks = List.of(…)  field where it is: getSnack still uses it until tomorrow.",
          check: {
            question: "The SQL returns the columns snack_id, name and price. How does  .query(Snack.class)  know which goes where?",
            choices: [
              "By the order: the first column goes in the first field",
              "By the names: each column goes in the record field with the same name, which is why Snack uses snack_id and not snackId",
              "You must write a loop with  rs.getInt(\"snack_id\")  like Week 4",
            ],
            answer: 1,
            explain: "The same naming decision as Week 7 pays off again: one name from the MySQL column to the Java field to the JSON key to the page.",
          },
        },
        {
          task:
            "Restart the app and open localhost:8080/api/snacks. Look at the VS Code terminal as well: the first time you ask, it prints  HikariPool-1 - Starting…  (that is Spring opening its connections to MySQL).",
          hint:
            "A Whitelabel error with status 500 and the words Failed to obtain JDBC Connection means Spring couldn't reach MySQL: scroll the terminal to the line that starts  java.sql  after 'with root cause', and see the error clinic below. Status 404 means the restart didn't happen.",
          check: {
            question: "The answer has the same shape as last week's. Where did the snacks come from this time?",
            choices: [
              "From the Java list, as before",
              "From your snacks table in MySQL, read when you asked",
              "From rows.json",
            ],
            answer: 1,
            explain: "Same JSON, different home. You can prove it in the next step.",
          },
        },
        {
          task:
            "Put a snack into the ledger from SQL, and watch your app notice. This is a snack that only this week uses, with a name no earlier week used, so every answer about it is the same on every ledger. In queries.sql, run once:\n\n" +
            LAB_SNACK_INSERT +
            "\n\nThen reload localhost:8080/menu.html WITHOUT restarting the app. (If you get Error 1062 Duplicate entry, snack 90 already exists: that's fine. If your ledger already holds a Taho from Week 3, leave it alone: it is yours and this week never touches it.)",
          hint: "id 90 is on purpose: it can't clash with the ids you made in Weeks 2 to 4, and this week's checkpoints use it. Never change Kutsinta's price except in the experiments below, and always put it back to 10.",
          check: {
            question: "The Java list in SnackController still holds the six old snacks. Does Kutsinta show up on the menu?",
            choices: [
              "No: not until the app is restarted",
              "Yes: menu.js asks /api/snacks, which reads MySQL on every request, and the row is in MySQL",
              "No: the menu only ever shows six snacks",
            ],
            answer: 1,
            explain: "The menu never knew where the snacks lived. It asked the API, the API now asks MySQL, and MySQL has seven or more rows.",
          },
        },
        {
          task:
            "Prove it with a price. The price experiments this week are always done on Kutsinta, so putting the price back can never overwrite one of YOUR prices. Run this, then reload localhost:8080/api/snacks and localhost:8080/menu.html WITHOUT restarting the app:\n\nUPDATE snacks SET price = 99 WHERE snack_id = 90;\n\nThen put it back and reload once more:\n\nUPDATE snacks SET price = 10 WHERE snack_id = 90;",
          hint: "Only the SQL ran. The app keeps no copy of the snacks any more: every request asks MySQL again, so it sees the new price straight away.",
          check: {
            question: "Before you reload: what will /api/snacks say for Kutsinta after the first UPDATE, with no restart?",
            choices: ["₱10, until the app restarts", "₱99, immediately", "An error, because the data changed"],
            answer: 1,
            explain: "A Java list is a snapshot that was copied in when the app started. A table is the live ledger, and every request reads it fresh. Menu, order form and orders board all follow.",
          },
        },
        {
          task:
            "Now see what is still in Java. Open localhost:8080/order.html, choose Kutsinta, set quantity 2 and read the total under the form. Then press Place order and read the receipt.",
          hint:
            "The drop-down and the total under the form come from /api/snacks, which reads MySQL now. The receipt is the app's answer to POST /api/orders, and placeOrder calls getSnack, which still searches the Java list.",
          check: {
            question: "What do the total under the form and the receipt say?",
            choices: [
              "The total says ₱20 and the receipt says Order 1: 2 × Kutsinta = ₱20",
              "The total says ₱20, and the receipt says Sorry: No snack with id 90, because getSnack still searches the Java list, which has only the six",
              "Both say Sorry",
            ],
            answer: 1,
            explain: "Half your app is on MySQL and half is on Java. The form offers a snack the receipt can't find. Tomorrow getSnack moves too, and day by day the Java list shrinks until it is gone.",
          },
        },
        {
          task:
            "Compare. Your SnackController.java should now look like this (line 1 is your own package line, which isn't shown; blank lines, the order of import lines and the order of methods don't matter). Then compare application.properties; yours has your real password where this says YOUR_MYSQL_PASSWORD. SnackController first:\n\n" +
            CONTROLLER_D1A +
            "\n\n// ---- application.properties ----\n\n" +
            PROPERTIES_FILE,
          hint: "The most common differences: the import line for JdbcClient, a second  private final List<Snack> snacks  field you deleted too early, and a missing } at the end of listSnacks. The Week 7 methods below listSnacks are unchanged.",
        },
        {
          task: "Add today to notes.md: the Week 4 chores and who does them now, what the app did when the url line was commented out, and the price test (what you changed and what the page did without a restart).",
          hint: "Write it in your own words, like you'd explain it to a classmate who missed today. Don't paste application.properties: it has your password.",
          input: "Paste today's part of notes.md (never application.properties)",
        },
      ],
    },
    {
      kind: "quest",
      id: "lab-break-it",
      inline: true,
      title: "🔧 Part 1 · Lab: break the connection four ways",
      intro:
        "The four ways a connection fails are the four you met in Week 4's ConnectTest, and they look different in a web app. Break each one on purpose, read the real error, and put it back. Each mission is: edit, save, restart, THEN open localhost:8080/api/snacks (the app only connects when a request needs MySQL).",
      missions: [
        {
          task:
            "Wrong password. In application.properties change the end of the password line to something wrong, for example add an x to the end of your password. Save, restart, and open localhost:8080/api/snacks. The browser shows status 500. In the terminal, scroll up to the long ERROR line that ends  with root cause  and read the line under it.\n\nThen put the password back and restart.",
          hint: "The browser only says  Failed to obtain JDBC Connection.  The cause is in the terminal, on the line that starts with  java.sql.SQLException  just after 'with root cause'.",
          check: {
            question: "The app started fine (Started CanteenWebApplication) with the wrong password. Why did the start not fail?",
            choices: [
              "Spring doesn't check passwords",
              "The app only connects to MySQL when a request first needs it, so the failure arrives with that request",
              "The password is saved somewhere else",
            ],
            answer: 1,
            explain: "The root-cause line read  Access denied for user 'root'@… (using password: YES).  It is Week 4's error 1045 again: the server answered and refused. The browser could only say 500.",
          },
        },
        {
          task:
            "Wrong database name. Change  /school  in the url line to  /schoool  (three o's). Save, restart, open /api/snacks, and read the root-cause line in the terminal. Then fix the url and restart.",
          hint: "Week 4's 'Unknown database' error, number 1049. The terminal line mentions the name MySQL couldn't find.",
          check: {
            question: "What does the root-cause line say?",
            choices: [
              "Access denied for user …",
              "java.net.ConnectException: Connection refused",
              "java.sql.SQLSyntaxErrorException: Unknown database 'schoool'",
            ],
            answer: 2,
            explain: "MySQL answered, so the server and the password were fine; only the database name was wrong. The error names the exact spelling it was given, which makes a typo easy to spot.",
          },
        },
        {
          task:
            "Wrong port (this is also what an app sees when the MySQL service is stopped). Change  3306  in the url line to  3307.  Save, restart, open /api/snacks and read the root-cause line. Fix the url and restart.",
          hint: "Nothing is listening at 3307, so nobody answers at all. Week 4's 'Communications link failure' came from the same cause.",
          check: {
            question: "What does the root-cause line start with?",
            choices: [
              "Unknown database",
              "Access denied",
              "java.net.ConnectException: Connection refused",
            ],
            answer: 2,
            explain: "Refused means no program was listening at that door. A stopped MySQL service gives the same line. On Windows, words may follow 'Connection refused'. When MySQL starts again, your running app reconnects by itself on the next request, with no restart.",
          },
        },
        {
          task:
            "Forgotten username. Put a # at the start of the spring.datasource.username line. Save, restart, open /api/snacks and read the root-cause line: the name in it is not root. Remove the # and restart.",
          hint: "With no username, the driver falls back to the name of the Windows account you are logged in with.",
          check: {
            question: "Why does the error name a user you never typed?",
            choices: [
              "MySQL invents a user for every failed login",
              "With no spring.datasource.username, the connection uses the operating-system user name, and MySQL has no such user (or no such password)",
              "Your password was changed",
            ],
            answer: 1,
            explain: "A missing line is not an error to Spring: it silently uses a default. That makes 'Access denied for user <your own name>' the clue that a line is missing or misspelled.",
          },
        },
        {
          task:
            "Check you're back to normal: localhost:8080/api/snacks lists your snacks again. Then write a four-row table in notes.md: for each of the four breaks, WHICH setting you broke, what the BROWSER showed, and the root-cause line from the TERMINAL. Name the setting (password, database name, port, username) but do NOT copy the line itself: for the password break, write  password=…(wrong)  instead of the real line, because the real line is your MySQL password.",
          hint: "The browser shows the same words every time, and the four terminal lines are all different. That difference is the point of the table. For the password row, write exactly  password=…(wrong).  The Access denied line in the terminal shows only your user name, never the password.",
          input: "Paste your four-row table (the password row says password=…(wrong), never your real password)",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-snacks-from-mysql",
      title: "🧪 Part 1 · Checkpoint: the menu comes from MySQL",
      intro:
        "Open each address with your app running, select everything (Ctrl+A), copy it (Ctrl+C), and paste it here. Kutsinta (id 90) was inserted in SQLTools, not in Java, so only an app that reads your table can show it: last week's app cannot pass the first two tasks.",
      tasks: [
        {
          goal: "Paste what your app answers at /api/snacks.",
          url: "localhost:8080/api/snacks",
          checks: [
            { is: "array", message: "This isn't a list: JSON for a list starts with [. Did you open /api/snacks? A Whitelabel page means the app failed: read the terminal." },
            { min: 1, message: "The list is empty. Does your snacks table have rows, and does listSnacks read it?" },
            { keys: ["snack_id", "name", "price"], message: "A snack is missing snack_id, name or price. Check the SELECT names all three columns, spelled exactly." },
            { types: { snack_id: "number", name: "string", price: "number" }, message: "snack_id and price must be numbers and name must be text." },
            { some: { snack_id: 90, name: "Kutsinta", price: 10 }, message: "No Kutsinta (id 90, price 10). That row only exists in MySQL: run the INSERT from the lab, and check listSnacks reads  SELECT snack_id, name, price FROM snacks.  If the price isn't 10, run  UPDATE snacks SET price = 10 WHERE snack_id = 90;" },
          ],
          hint: "If Kutsinta is missing, listSnacks is still returning the Java list: its first line should call jdbc.sql(…). If Kutsinta's price isn't 10, run  UPDATE snacks SET price = 10 WHERE snack_id = 90;",
          solution:
            LIST_SNACKS_D1 + "\n\n// and in queries.sql, run once:\n" + LAB_SNACK_INSERT,
          example: "[{\"snack_id\":1,\"name\":\"Banana cue\",\"price\":15},{\"snack_id\":2,\"name\":\"Turon\",\"price\":12},{\"snack_id\":3,\"name\":\"Kwek-kwek\",\"price\":20},{\"snack_id\":4,\"name\":\"Gulaman\",\"price\":10},{\"snack_id\":5,\"name\":\"Siopao\",\"price\":25},{\"snack_id\":6,\"name\":\"Pastillas\",\"price\":8},{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}]",
          previousStage: "[{\"snack_id\":1,\"name\":\"Banana cue\",\"price\":15},{\"snack_id\":2,\"name\":\"Turon\",\"price\":12},{\"snack_id\":3,\"name\":\"Kwek-kwek\",\"price\":20},{\"snack_id\":4,\"name\":\"Gulaman\",\"price\":10},{\"snack_id\":5,\"name\":\"Siopao\",\"price\":25},{\"snack_id\":6,\"name\":\"Pastillas\",\"price\":8}]",
          explain: "A row you typed in SQLTools, answered by your Java. The Java list could never have shown it.",
        },
        {
          goal: "Paste what your app answers at /api/snacks?maxPrice=10. Kutsinta costs exactly 10, so it should be in the answer.",
          url: "localhost:8080/api/snacks?maxPrice=10",
          checks: [
            { is: "array", message: "This should be a list, starting with [. Check the address ends  ?maxPrice=10." },
            { everyAtMost: { key: "price", max: 10 }, message: "A snack costs more than 10. The maxPrice filter from Week 7 must still skip those: check the  s.price() <= maxPrice  line in the loop." },
            { some: { snack_id: 90, name: "Kutsinta", price: 10 }, message: "Kutsinta (price 10) should be in the answer: the filter keeps prices up to AND including 10. Is the loop's test  <=  and the list the one read from MySQL?" },
          ],
          hint: "Last week's filter still works. It now filters the rows MySQL returned.",
          solution: LIST_SNACKS_D1,
          example: "[{\"snack_id\":4,\"name\":\"Gulaman\",\"price\":10},{\"snack_id\":6,\"name\":\"Pastillas\",\"price\":8},{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}]",
          previousStage: "[{\"snack_id\":4,\"name\":\"Gulaman\",\"price\":10},{\"snack_id\":6,\"name\":\"Pastillas\",\"price\":8}]",
          explain: "Week 7's loop, over MySQL's rows. Tomorrow the filter itself moves into SQL.",
        },
        {
          goal: "Paste what your app answers at /api/info. It should be exactly as it was last week: not everything has to come from MySQL.",
          url: "localhost:8080/api/info",
          checks: [
            { is: "object", message: "This should be ONE object, starting with {." },
            { keys: ["name", "opens", "closes"], message: "The object needs name, opens and closes: you shouldn't have changed info() today." },
            { path: "opens", equals: "7:00", message: "opens should be \"7:00\": info() is unchanged from Week 7." },
          ],
          hint: "If /api/info broke, an edit went too far: compare info() with the whole-file block in the lab.",
          solution: '@GetMapping("/api/info")\npublic CanteenInfo info() {\n    return new CanteenInfo("Aling Nena\'s Canteen", "7:00", "16:00");\n}',
          example: "{\"name\":\"Aling Nena's Canteen\",\"opens\":\"7:00\",\"closes\":\"16:00\"}",
          explain: "The canteen's name and hours aren't rows in your ledger, so they stay in Java. Putting data in a database is a decision, not a rule.",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-mysql-menu",
      title: "📸 Part 1 · Hand in: the menu, and the row it came from",
      intro: "Proof that the menu comes from your MySQL ledger and not from Java.",
      steps: [
        "Close the application.properties tab in VS Code (it holds your password), and don't open it again before the screenshot.",
        "Put the browser and VS Code side by side. In the browser, open localhost:8080/api/snacks so the Kutsinta row is visible.",
        "In VS Code, run  SELECT * FROM snacks;  in SQLTools so its result grid, with Kutsinta in it, is visible beside the browser.",
        "Press Windows+Shift+S and capture both. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves: "that your own Spring Boot app lists a snack that exists only as a row in your MySQL snacks table, so its data comes from your ledger, at localhost:8080.",
    },
    ...day1Part2,
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Each patient is an app that won't start or won't answer. Read the real message, then diagnose. Every message below was copied from a real Spring Boot 4 app.",
      missions: [
        {
          task:
            "Patient 1. Run stops at once with a boxed message:  APPLICATION FAILED TO START … Failed to configure a DataSource: 'url' attribute is not specified and no embedded datasource could be configured.  The student did add datasource lines to application.properties.",
          hint: "Compare the property names letter by letter with the ones from the video: spring.datasource.url. A misspelled name isn't an error to Spring, it is simply ignored.",
          check: {
            question: "What is the most likely cause?",
            choices: [
              "The url line is missing, commented out, or its name is misspelled (for example spring.datasource.ulr), so Spring sees no url",
              "MySQL is turned off",
              "The password is wrong",
            ],
            answer: 0,
            explain: "A wrong password or a stopped MySQL never stops the start: they show up on the first request. A missing url does, because Spring can't build a connection pool at all.",
          },
        },
        {
          task:
            "Patient 2. The app starts and says Started CanteenWebApplication. localhost:8080/api/snacks shows a 500 page with  Failed to obtain JDBC Connection.  The terminal's line after 'with root cause' says  java.sql.SQLException: Access denied for user 'root'@… (using password: YES).",
          hint: "Which Week 4 error number is this? It means the server was reached and said no.",
          check: {
            question: "Which line of application.properties do you check first?",
            choices: [
              "spring.datasource.url: the database name",
              "spring.datasource.port",
              "spring.datasource.password (and username): they don't match any MySQL user",
            ],
            answer: 2,
            explain: "'using password: YES' says a password was sent and refused. Test the same pair in SQLTools: if it connects there, copy exactly what you typed there.",
          },
        },
        {
          task:
            "Patient 3. Same 500 page. The root-cause line says  java.sql.SQLSyntaxErrorException: Unknown database 'schoool'.",
          hint: "Read the name inside the quotes. That is the spelling the app sent.",
          check: {
            question: "What do you fix?",
            choices: [
              "The password",
              "MySQL's port",
              "The database name at the end of spring.datasource.url: it should end /school",
            ],
            answer: 2,
            explain: "A name in quotes in an error is the exact text you sent. Compare it with what you meant.",
          },
        },
        {
          task:
            "Patient 4. Same 500 page. The root-cause line says  java.net.ConnectException: Connection refused.",
          hint: "Nobody answered. Two things make that happen: the wrong door number, or nothing running behind the door.",
          check: {
            question: "What do you check?",
            choices: [
              "The password: it must be wrong",
              "The port in the url (3306) and that the MySQL service is running: in PowerShell,  Get-Service MySQL*  should say Running",
              "Whether snacks has any rows",
            ],
            answer: 1,
            explain: "No answer at all means the server isn't there. When it is back, your running app recovers by itself on the next request: no restart.",
          },
        },
        {
          task:
            "Patient 5. Run stops with a long stack trace (no boxed message). Its last 'Caused by' line says  java.lang.ClassNotFoundException: com.mysql.cj.jdbc.Driver.",
          hint: "Week 4 Day 1: the driver is a jar that Java must find. Which block of pom.xml is that jar now?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The password is wrong",
              "MySQL isn't installed",
              "The mysql-connector-j block is missing from pom.xml, or VS Code hasn't reloaded pom.xml since you added it. It is Week 4's 'No suitable driver' with a new name",
            ],
            answer: 2,
            explain: "The driver is the jar that knows how to speak MySQL. If the dependency isn't in pom.xml, or isn't loaded yet, no connection is attempted at all. Check the block, save pom.xml, and wait for the import to finish.",
          },
        },
        {
          task:
            "Patient 6. VS Code underlines JdbcClient in red:  JdbcClient cannot be resolved to a type,  in a file that has the import line.",
          hint: "The import line names a package from the spring-boot-starter-jdbc jar. If the jar isn't known to VS Code, the import is red too.",
          check: {
            question: "Which is the likely cause?",
            choices: [
              "The class was renamed in Spring Boot 4",
              "spring-boot-starter-jdbc is missing from pom.xml, or VS Code hasn't reloaded pom.xml yet",
              "The record Snack is missing",
            ],
            answer: 1,
            explain: "Check the block is inside <dependencies> and saved, then give the status bar time to finish importing. Never click Continue on 'Build failed': fix the red first.",
          },
        },
        {
          task:
            "Patient 7. The student added Kutsinta to the ledger. /api/snacks shows the old snacks and no Kutsinta, even after a restart. The terminal is clean and listSnacks still starts with  return snacks;.",
          hint: "Where does the list come from in that code?",
          check: {
            question: "Diagnosis?",
            choices: [
              "MySQL didn't save the INSERT",
              "The browser cached the answer",
              "listSnacks never calls MySQL: it still returns the Java list. The INSERT is in the table, and nobody reads it",
            ],
            answer: 2,
            explain: "A page can look right for the wrong reason. Kutsinta is the proof: a row that only exists in the table can only appear if the code reads the table.",
          },
        },
        {
          task:
            "Patient 8. The student found a typo in the password line, fixed it and saved application.properties. The app was still running, and /api/snacks still answers the same 500 'Failed to obtain JDBC Connection'.",
          hint: "What did last week's watch note say about changes to .java files? Properties are read once, when the app starts.",
          check: {
            question: "What was missing?",
            choices: [
              "A restart: application.properties is read when the app STARTS, so stop the app (red square) and Run again",
              "Nothing: MySQL keeps the old password",
              "A new browser tab",
            ],
            answer: 0,
            explain: "Same rule as for Java files. The running app holds the settings it started with.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you'd check, then your rule for telling 'the app can't START' from 'the app starts but a request fails'.",
          hint: "Patients 1, 5 and 6 are the first kind: the app never reaches Started. Patients 2, 3 and 4 are the second: it starts and a request answers 500.",
          input: "Paste your eight notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own endpoint",
      intro:
        "Add one more endpoint that reads your ledger. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own, and build it with what today taught. Run the SELECT in queries.sql first, then put it in Java. Ideas: (1) GET /api/snacks/cheapest returns the one cheapest snack (a SELECT with ORDER BY price, then return the first item of the list with .get(0)); (2) GET /api/snacks/priciest returns the most expensive one (ORDER BY price DESC, then .get(0)); (3) GET /api/snacks/names returns just the names: a SELECT name FROM snacks and  .query(String.class).list(); (4) GET /api/snacks/budget returns the snacks that cost 10 or less, with the 10 typed inside the SQL (WHERE price <= 10, no ? needed because no customer sends it); (5) GET /api/sales/unknown returns only the sales whose snack nobody knew (WHERE snack_id IS NULL, from Week 3), as a list of Sale; (6) in ledger.js, make every sale with qty 10 or more bold on the page (an if inside showSales that sets  tr.style.fontWeight = \"bold\"  on that row); (7) harder: GET /api/sales/latest returns the newest sale: ORDER BY sale_id DESC and return the first item, but answer 404 with  The ledger is empty  when the list is empty (check list.isEmpty() first, and throw the same ResponseStatusException you used in Week 7).",
          hint:
            "Keep every checkpoint passing: don't change the existing addresses or keys. Build it in two steps: write the SELECT in queries.sql and run it, then put exactly that text in  jdbc.sql(\"…\"). Each new endpoint is a new method with its own @GetMapping, added anywhere inside the class. For idea 5 the record is the Sale you made in Part 2 (snack_id is Integer so the NULL fits). For idea 7, .get(0) on an empty list is an error, so test isEmpty() first.",
        },
        {
          task: "Paste what you added: the new Java lines (and which file), the SQL you ran first, how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "Copy the lines from VS Code. How you tested it can be one sentence, like: 'I opened /api/sales and it listed every sale, and the one with no snack showed snack_id null.'",
          input: "Paste your new lines, the SQL, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-sealed-ledger",
    title: "⚔️ Boss battle: The Sealed Ledger",
    intro: "The Sealed Ledger holds every sale and answers nobody. Open it.",
    boss: { name: "the Sealed Ledger", emoji: "📒" },
    questions: [
      {
        prompt: "What does spring-boot-starter-jdbc give your project?",
        choices: [
          "Spring's JDBC tools, including JdbcClient, set up from your datasource lines",
          "The MySQL driver",
          "A copy of MySQL",
        ],
        answer: 0,
        explain: "The driver is the other block, mysql-connector-j. The starter is the Spring side; the connector is the MySQL side.",
      },
      {
        prompt: "Which property holds the database address?",
        choices: ["spring.datasource.name", "spring.datasource.address", "spring.datasource.url"],
        answer: 2,
        explain: "jdbc:mysql://localhost:3306/school, the same address as Week 4's ConnectTest.",
      },
      {
        prompt: "Why can the app start fine and still answer a request with 500 'Failed to obtain JDBC Connection'?",
        choices: [
          "Spring checks the password only at the first request that needs MySQL, so a wrong password or database name appears then, not at startup",
          "Spring Boot hides errors at startup",
          "The 500 is always a Java mistake",
        ],
        answer: 0,
        explain: "A missing url or driver stops the start; a refused login or unknown database waits for the first request.",
      },
      {
        prompt: "The browser only says 'Failed to obtain JDBC Connection'. Where is the real cause?",
        choices: ["In the address bar", "In the terminal, on the line after 'with root cause'", "In Network → Headers"],
        answer: 1,
        explain: "The browser gets a short message on purpose. The terminal keeps the whole story.",
      },
      {
        prompt: "You change a price in SQLTools. Do you restart the app to see it on /api/snacks?",
        choices: ["Yes, always", "No: every request reads MySQL again, so reloading the page is enough", "Only on Windows"],
        answer: 1,
        explain: "Live table, live answer. A Java list needs a restart because it is rebuilt only when the app starts.",
      },
      {
        prompt: "`.query(Snack.class).list()` puts each row into a Snack. How does it match columns to fields?",
        choices: ["By name: snack_id to snack_id", "By position only", "It can't; you must write rs.getInt()"],
        answer: 0,
        explain: "Names. That's why the record, the columns and the JSON keys all say snack_id.",
      },
      {
        prompt: "Constructor injection: public SnackController(JdbcClient jdbc). Who supplies the JdbcClient?",
        choices: ["The browser", "You, with new", "Spring, when it creates your controller"],
        answer: 2,
        explain: "Spring builds the controller and hands over what its constructor asks for.",
      },
      {
        prompt: "Kutsinta is in the table but not on the menu, and the terminal is clean. What do you check first?",
        choices: [
          "Whether listSnacks actually calls jdbc.sql(…) rather than returning the old Java list",
          "Whether Kutsinta is a good name",
          "Whether the port is 3306",
        ],
        answer: 0,
        explain: "A row nobody reads can't appear. Code first, then data.",
      },
      {
        prompt: "Why does the Sale record declare snack_id as Integer and not int?",
        choices: [
          "Integer can hold NULL and your ledger has a sale with no snack; int cannot",
          "Integer is faster",
          "Records can only hold Integer",
        ],
        answer: 0,
        explain: "An int field refuses NULL with 'A null value cannot be assigned to a primitive type'. Week 4's NULL trap, on the web.",
      },
      {
        prompt: "GET /api/sales returns every row of the sales table, while /api/orders (Wednesday and Thursday) will skip one. Which table feature makes the difference?",
        choices: [
          "/api/sales reads the table alone; /api/orders will JOIN it to snacks, and an INNER JOIN drops a sale with no snack",
          "/api/sales is cached",
          "They read different databases",
        ],
        answer: 0,
        explain: "No JOIN, nothing dropped. You will see both lists side by side on Thursday.",
      },
      {
        prompt: "The password line is in application.properties. Where must it never go?",
        choices: ["Only that file", "A turn-in, a screenshot, or a chat message", "Your own machine"],
        answer: 1,
        explain: "That file holds a secret now. Show the line with a placeholder when you must show the file.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what happens, step by step, when you open localhost:8080/api/snacks now.",
      "The difference between a failure that stops the app starting and one that appears on a request, with one example of each.",
      "Why a price change in SQLTools shows without a restart, but a change in Java does not.",
      "What /api/sales shows that /api/snacks doesn't, and why the sale with no snack comes through as null.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your menu now comes from the ledger you built in Weeks 2 to 4, and your staff page ledger.html shows the sales table as it is. Tomorrow the app asks MySQL questions with ? marks: one snack by its id, the cheap ones only, a search box, a safe sort, and a lesson about gluing strings into SQL.",
  },
};
