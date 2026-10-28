// unit3-week8 · Day 5 — The twist, the clean-up, and the audit
//
// Wrap-up day, no video. The twist: /api/rows stops being rows typed into
// RowsController and becomes the student's OWN Week 3 JOIN, read from MySQL
// into their own Row record, with tables.js unchanged (it already draws columns
// from the keys of the first row, in record-field order). Then the clean-up (no
// Java list is left anywhere), a drill for the one thing the pages can't yet
// do (MySQL away), a self-audit of every endpoint, and a hand-in that can't be
// faked from Week 7.
//
// Observed on a real Spring Boot 4.1.1 + MySQL 8 build:
//  - a record Row(String name, int price, String sold_on) over
//    SELECT snacks.name, snacks.price, sales.sold_on ... maps with no
//    configuration; a DATE column arrives as "2026-08-10" in a String field; a
//    DECIMAL maps to double (12.5); TRUE to boolean; a DATETIME to String
//    ("2026-08-14 10:30:00"); a NULL needs an Integer (an int field fails with
//    "A null value cannot be assigned to a primitive type");
//  - tables.html draws exactly the columns of the first row in JSON key order
//    (= record-field order), and an empty list makes tables.js throw, because
//    rows[0] is undefined;
//  - with MySQL unreachable the app answers 500 JSON and the pages degrade
//    like this (real headless Chrome): menu.html shows an empty table and an
//    empty count ("TypeError: list is not iterable" in the console); orders.html
//    shows "undefined orders · ₱undefined in sales" AND "Can't reach the canteen
//    app. Is it running?" (misleading: the app is running, the 500 body was
//    treated as data); order.html has an empty drop-down; tables.html an empty
//    table. This is the week's single honest gap in "the pages don't change";
//    the fix is a make-your-own idea.
//
// Revised after the first two reviews (docs/agent/log/2026-10-28-week8-reviews-and-part-2.md):
//  - the /api/rows checkpoint was cleared by Week 7's typed RowsController. It now needs
//    a first column `id` (the child table's primary key, labelled AS id) that the typed
//    rows can't have, and ids that are all different (previousStage);
//  - "changing three things" named two: fixed;
//  - the MySQL-away drill explains exactly why orders.html prints "undefined orders",
//    and what the response.ok pages do instead;
//  - the day continues with Part 2, "today's special" (day5-part2.ts): a new table,
//    a record and endpoint, and the home page, proved layer by layer; the self-audit
//    and the hand-in now cover the Part 2 work of all five days.
// Pages checked against the MySQL-backed app in headless Chrome: menu.html (7
// snacks incl. Kutsinta), orders.html (summary and rows from the ledger),
// tables.html (columns from the new record), unchanged.

import type { DayPlan } from "../../types";
import { day5Part2 } from "./day5-part2";
import { ROWS_CHECK_COMMAND } from "./commands";
import { CONTROLLER_D5, ROWS_CONTROLLER_MODEL } from "./snippets";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Your tables page from your own JOIN, a clean-up, the whole-app audit, and the hand-in",
  warmupGame: {
    kind: "quest",
    id: "warmup-whole-chain",
    title: "🗺️ Warm-up: the whole chain, read and write",
    intro: "Four days ago your app held its data in memory. Look at what it does with MySQL now.",
    missions: [
      {
        task: "Your app has these addresses: GET /api/snacks (with ?maxPrice, ?name and ?sort), GET /api/snacks/{id}, GET /api/find, GET /api/sales, GET /api/orders, GET /api/orders/{id}, GET /api/summary, GET /api/info, GET /api/rows, POST /api/orders and POST /api/snacks.",
        hint: "Which of them changes the ledger? Think of the verb, not the noun.",
        check: {
          question: "How many of them WRITE to MySQL?",
          choices: ["All eleven", "None", "Exactly two: POST /api/orders and POST /api/snacks"],
          answer: 2,
          explain: "Everything else only asks questions. Next week's lessons add the other two verbs: changing a row and deleting one.",
        },
      },
      {
        task: "Weeks 5 to 7: tables.html showed rows from a file you typed (rows.json), then from RowsController, where YOU typed the rows in Java. Both were copies of your Week 3 tables.",
        hint: "Today there is no copy. Where does the table have to get its rows from?",
        check: {
          question: "After today, where do the sample rows on tables.html come from?",
          choices: [
            "A file in static/",
            "A Java list in RowsController",
            "Your Week 3 tables in MySQL, joined by your own query, every time the page loads",
          ],
          answer: 2,
          explain: "No more copies to go out of date. The page is a window onto the ledger.",
        },
      },
      {
        task: "Last Friday the board broke if the app was off. Today you test the opposite: the app is on and MySQL is away.",
        hint: "Which layer notices first, and which layer has no idea?",
        check: {
          question: "When MySQL can't be reached, which part of the chain knows?",
          choices: [
            "Only your Spring app: it gets the error. The browser just gets a 500 and your pages have to cope",
            "The browser, which talks to MySQL itself",
            "Nobody",
          ],
          answer: 0,
          explain: "The page only ever talks to the app, so the app is the only one that can tell it something went wrong. You'll see what your pages do about it.",
        },
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "quest",
      id: "twist-rows-from-mysql",
      inline: true,
      title: "🛠️ Part 1 · Your own endpoint: /api/rows from your Week 3 tables",
      intro:
        "tables.html still shows rows that RowsController has in a Java list. Today they come from your own tables. This is the one part of the week nobody else can copy: your tables, your columns, your query.",
      missions: [
        {
          task:
            "Find your own query. Open static/rows.json (the keys in it are the column labels your page expects: for example title and borrower). Then, in queries.sql, write the Week 3 JOIN that produces EXACTLY those columns, labelled with AS to match the keys, over your own tables from Week 3 (the pair you designed, or the canteen's snacks and sales). ONE addition: put a new FIRST column in front of them, the primary key of your child table (the table that holds the foreign key, such as loan_id or sale_id), labelled  AS id.  The page will show one extra column, id, in front of the others. Run it and look at the first rows. Paste the query and its first three rows into the box.",
          hint:
            "The pattern is  SELECT c.loan_id AS id, a.column AS key1, b.column AS key2 FROM parent a INNER JOIN child c ON …  Write the keys of rows.json first, then find which table each comes from. If your rows.json has two keys, your SELECT has three columns: id and the two keys. If you don't know where a column lives, run DESCRIBE on both tables. The id is what tells the rows apart, so it must be a whole-number primary key. The canteen model below uses  SELECT sales.sale_id AS id, snacks.name, snacks.price, sales.sold_on FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id.",
          input: "Paste your query and the first three rows it returned",
        },
        {
          task:
            "Give it a record that fits. Every column of your SELECT becomes one field of a record, with the SAME name, in the SAME order: first  int id,  then the fields for your rows.json keys. Types: a whole number is int, text is String, a DATE or DATETIME is String too (it arrives as 2026-08-10), a number with a decimal point is double, and a column that can be NULL is Integer, Double or String, never int or double. Then, in RowsController.java, keep line 1 (your package line) and replace everything under it with the model below, changing two things: the record's fields and the SQL between the triple quotes. Nothing else changes.\n\n" +
            ROWS_CONTROLLER_MODEL,
          hint:
            "The model is the canteen's own JOIN, so you can see the shape: Row(int id, String name, int price, String sold_on) goes with SELECT … AS id, name, price, sold_on. Yours has your own field names, with id first. The constructor with JdbcClient is the same as in SnackController. The old List<Row> rows() method with the typed new Row(…) lines is replaced completely.",
          check: {
            question: "Your SELECT labels its columns  id,  title  and  borrower.  What must the record be?",
            choices: [
              "Row(int id, String title, String borrower): the same names, in the order tables.html should show its columns",
              "Row(String borrower, String title, int id) in any order, and the columns will be reordered",
              "Row(String a, String b, String c), because the names don't matter",
            ],
            answer: 0,
            explain: "Names must match, as in every record this week. The ORDER of the fields is the order of the JSON keys, and tables.js draws its columns in that order.",
          },
        },
        {
          task: "Restart and open localhost:8080/api/rows, then localhost:8080/tables.html. Do not touch tables.js or tables.html: they must show your rows, one table row per result row, with the new id column first.",
          hint:
            "Column names with 'not found' in the terminal mean a record field has no matching label in your SELECT. A 500 with 'null value cannot be assigned to a primitive type' means a column that can be NULL is declared int: use Integer. A table with no rows at all and an error in the console means the list was empty.",
          check: {
            question: "tables.js is exactly as it was last Friday. How does it know what your columns are called?",
            choices: [
              "It reads them from the keys of the first row: Object.keys(rows[0]), so whatever your record calls its fields is what the table heads say",
              "It has them typed in",
              "It asks MySQL directly",
            ],
            answer: 0,
            explain: "Same page, different data: that was Week 6's point about keeping data and drawing apart. The page works for any record.",
          },
        },
        {
          task:
            "Prove the page has no copy of the data any more. (1) In VS Code's Explorer, right-click static/rows.json → Delete: nothing reads it. Reload tables.html: nothing changes. (2) In SQLTools change one value that your query shows, for example an UPDATE of one name. Reload tables.html WITHOUT restarting the app: the page shows the change. (3) Put the value back.",
          hint: "Deleting rows.json is safe: since Week 7 Day 5, tables.js fetches /api/rows. If the page broke, tables.js is still asking for rows.json: change that first line to  fetch(\"/api/rows\").",
          check: {
            question: "You changed a value in MySQL and reloaded: the table updated with no restart. What does that prove?",
            choices: [
              "The rows are read from MySQL on every request, with no copy in Java or in a file",
              "The browser cached it",
              "The app restarted by itself",
            ],
            answer: 0,
            explain: "A table only your database knows, drawn by a page that never changed. That's the whole architecture from the warm-up, working.",
          },
        },
        {
          task: "Paste your RowsController.java (no password in it), and the JSON your app answers at localhost:8080/api/rows.",
          hint: "Copy the file from VS Code and the JSON with Ctrl+A, Ctrl+C in the browser. RowsController.java never contains your password: that's only in application.properties.",
          input: "Paste RowsController.java and the JSON from /api/rows",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-rows-mysql",
      title: "🧪 Part 1 · Checkpoint: /api/rows from MySQL",
      intro: "Open localhost:8080/api/rows with your app running, copy everything and paste it here. Your tables are yours, so this checks the shape, and one column that only YOUR query produces: the id of each row of your child table. Last week's typed rows have no id.",
      tasks: [
        {
          goal: "Paste what your app answers at /api/rows.",
          url: "localhost:8080/api/rows",
          checks: [
            { is: "array", message: "This should be a list of rows, starting with [. Your method should return List<Row>." },
            { min: 1, message: "The list is empty. Does your JOIN return rows on your ledger? Run it in SQLTools." },
            { path: "0", is: "object", message: "Each row should be an object like {\"id\":1,\"title\":\"…\"}. Is the record's field list the same as the columns of your SELECT?" },
            { keys: ["id"], message: "Each row needs an id key: the primary key of your child table, labelled AS id in the SELECT and int id in the record. Last week's typed rows have none." },
            { types: { id: "number" }, message: "id must be a number: declare it int in the record, and select a whole-number primary key." },
          ],
          hint: "A Whitelabel 500 means read the terminal: 'Column … not found' is a label that doesn't match a field, and a null error needs Integer. If rows come back without id, the SELECT has no  AS id  column or the record has no id field.",
          solution: ROWS_CONTROLLER_MODEL,
          example: "[{\"id\":1,\"name\":\"Banana cue\",\"price\":15,\"sold_on\":\"2026-08-10\"},{\"id\":2,\"name\":\"Kwek-kwek\",\"price\":20,\"sold_on\":\"2026-08-10\"},{\"id\":3,\"name\":\"Banana cue\",\"price\":15,\"sold_on\":\"2026-08-11\"},{\"id\":4,\"name\":\"Kwek-kwek\",\"price\":20,\"sold_on\":\"2026-08-11\"},{\"id\":5,\"name\":\"Turon\",\"price\":12,\"sold_on\":\"2026-08-12\"},{\"id\":6,\"name\":\"Banana cue\",\"price\":15,\"sold_on\":\"2026-08-12\"},{\"id\":8,\"name\":\"Siopao\",\"price\":25,\"sold_on\":\"2026-08-13\"},{\"id\":9,\"name\":\"Kwek-kwek\",\"price\":20,\"sold_on\":\"2026-08-14\"},{\"id\":10,\"name\":\"Kwek-kwek\",\"price\":20,\"sold_on\":\"2026-08-14\"},{\"id\":11,\"name\":\"Kutsinta\",\"price\":10,\"sold_on\":\"2000-01-01\"},{\"id\":12,\"name\":\"Kutsinta\",\"price\":10,\"sold_on\":\"2026-10-27\"},{\"id\":13,\"name\":\"Kutsinta\",\"price\":10,\"sold_on\":\"2000-01-02\"},{\"id\":14,\"name\":\"Kutsinta\",\"price\":10,\"sold_on\":\"2000-01-03\"},{\"id\":15,\"name\":\"Kutsinta\",\"price\":10,\"sold_on\":\"2026-10-27\"}]",
          previousStage: "[{\"title\":\"Noli Me Tangere\",\"borrower\":\"Ana Reyes\"},{\"title\":\"El Filibusterismo\",\"borrower\":\"Ben Cruz\"},{\"title\":\"Florante at Laura\",\"borrower\":\"Ana Reyes\"}]",
          explain: "Your own tables' rows, answered by your own Java from your own MySQL, each with the id of its row.",
        },
        {
          goal: "Run this line in the console of a localhost:8080 tab. It asks /api/rows and checks that every row has an id, that the ids are all different, and which column comes first. Paste what it copies.",
          command: ROWS_CHECK_COMMAND,
          checks: [
            { is: "object", message: "This should be a small object. Did the line run on a localhost:8080 tab?" },
            { path: "ids_are_distinct", equals: true, message: "The ids are missing or not all different. Each row of the child table has its own primary key: select it with AS id, as a number." },
            { path: "first_column", equals: "id", message: "id should be the FIRST column: put  int id  first in the record and  … AS id  first in the SELECT." },
          ],
          hint: "The order of the record's fields is the order of the keys in the JSON, and tables.html draws its columns in that order.",
          solution: ROWS_CONTROLLER_MODEL,
          example: "{\"row_count\":14,\"ids_are_distinct\":true,\"first_column\":\"id\"}",
          previousStage: "{\"row_count\":3,\"ids_are_distinct\":false,\"first_column\":\"title\"}",
          explain: "A key only your own JOIN produces, first on the page: the typed rows of Week 7 could never have had it.",
        },
      ],
    },
    ...day5Part2,
    {
      kind: "quest",
      id: "lab-cleanup",
      inline: true,
      title: "🛠️ Lab: clean up, restart, and see what happens when MySQL is away",
      intro:
        "A finished app has no scaffolding left in it. Then you shake it: a full restart, and a deliberate break to see what your pages do.",
      missions: [
        {
          task:
            "Look for leftovers. In VS Code press Ctrl+Shift+F and search these, one at a time, across the whole project: (1) List.of(  (2) new ArrayList  (3) rows.json  (4) orders.add. Delete anything that is still a copy of ledger data. An unused  import java.util.ArrayList;  line can go too.",
          hint: "After the lab there should be NO list of snacks, orders or rows typed in Java anywhere. A search hit in a comment or in notes.md is fine. If a hit is in tables.js, it is the old file name from Week 6.",
          check: {
            question: "You search for List.of( and find none. What is the Java side of your canteen now?",
            choices: [
              "Pure plumbing: Java only decides the addresses, validates input, and passes questions to MySQL and answers back. The data lives only in the ledger",
              "Empty: no code is left",
              "A copy of MySQL",
            ],
            answer: 0,
            explain: "That separation is why the web part of the course finishes here: from now on, new features are new SQL and new endpoints, not new copies of data.",
          },
        },
        {
          task:
            "Restart-proof run. Stop the app, Run it, and open each of these in turn. Nothing should need a number or a name you typed in Java: /api/snacks, /api/snacks/90, /api/sales, /api/orders, /api/orders/ followed by any id you can see in /api/orders, /api/summary, /api/rows, /api/special, and the pages index.html, menu.html, order.html, orders.html, tables.html, ledger.html and add-snack.html.",
          hint: "If one fails, the day's checkpoint for that area still works: paste your answers in again and it names the first thing that is wrong.",
          check: {
            question: "Which address would answer a 404 even though the app is fine?",
            choices: [
              "/api/snacks/90",
              "/api/rows",
              "/api/orders/ followed by the sale_id of a sale whose snack_id is NULL",
            ],
            answer: 2,
            explain: "The INNER JOIN has no snack for that sale, so there is no order to show. Everything else answers.",
          },
        },
        {
          task:
            "The drill. MySQL is away (you'll fake it with a wrong password). In application.properties add an x to the end of the password, save, restart, and open each page: menu.html, orders.html, order.html, tables.html, ledger.html and index.html. Write down for each what you see on the page, then press F12 → Console and write down the red error. When you're done, put the password back and restart.",
          hint:
            "The app is running, so the pages load. Their data requests answer 500 with an error body, not a list. Don't fix the pages today: just look, and give each page about three seconds, because the app tries to get a connection for a moment before it answers 500. menu.html shows an empty table, orders.html shows a strange summary line AND a status message, order.html an empty drop-down, tables.html an empty table. ledger.html (which you wrote with a response.ok check) writes Sorry: and the app's message. index.html says No special today. Its code checks response.ok, so it doesn't break, but the sentence is not true: the special may well exist and the database just can't be reached. The page can't tell a 404 (no special today) from a 500 (can't reach the database) unless it looks at response.status.",
          check: {
            question: "orders.html says  undefined orders · ₱undefined in sales  AND  Can't reach the canteen app. Is it running?  although the app IS running. What exactly happened?",
            choices: [
              "The app is down, and the page found out twice",
              "The status message is random",
              "The 500 answer is an error OBJECT, but the page treats whatever arrives as data. The summary's .then reads data.total_orders and data.total_sales, which an error object doesn't have, so it writes undefined. The list's .then loops over the object, which isn't a list, so it throws, and the .catch blames the connection",
            ],
            answer: 2,
            explain: "Both lines come from one mistake: nobody checked response.ok before using the answer. ledger.html does check it, so it says Sorry and the app's own message. That is the make-your-own idea for the other pages. index.html checks response.ok too, but it can't tell a missing special from an unreachable database, so it tells a customer something false: that is an idea as well.",
          },
        },
        {
          task:
            "Compare. Your SnackController.java should be exactly this now (line 1 is your own package line; blank lines, import order, method order and leftover imports don't matter). Your project's Java files should be CanteenWebApplication, Snack, OrderRequest, Order, Summary, Sale, SnackController and RowsController (at least these: a make-your-own idea may have added more):\n\n" +
            CONTROLLER_D5,
          hint: "Anything that looks different from this file is either a make-your-own idea you added, or a mistake. Run the day checkpoints again if unsure.",
        },
      ],
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own app",
      steps: [
        "Run your app, open each address at localhost:8080, and mark each line ✅ or ❌ honestly, by opening and looking, not from memory. The lines are in order of the week, Part 1 then Part 2 of each day.",
        "Monday, Part 1. pom.xml has spring-boot-starter-jdbc and mysql-connector-j, and application.properties has the three spring.datasource lines (the password line is the only one I never show anyone).",
        "Monday, Part 1. /api/snacks lists my snacks from the snacks table and includes Kutsinta (id 90, ₱10). I changed Kutsinta's price in SQLTools and /api/snacks followed it with no restart (and I put it back to 10).",
        "Monday, Part 2. sale_id has auto_increment; /api/sales lists EVERY row of my sales table, with null as the snack_id of a sale with no snack (if I have one); ledger.html shows the same number of rows and writes (no snack) for that one.",
        "Tuesday, Part 1. /api/snacks/90 answers Kutsinta; /api/snacks/9999 answers 404 'No snack with id 9999'; /api/snacks/abc answers 400; /api/snacks?maxPrice=10 includes Kutsinta and ?maxPrice=0 answers [] with status 200.",
        "Tuesday, Part 1. /api/find?name=Kutsinta answers one snack, and the attack text  zzz' OR '1'='1  answers [].",
        "Tuesday, Part 2. /api/snacks?name=utsin answers only Kutsinta; ?name=Aling's and the attack text answer [] with status 200; /api/snacks?sort=price and ?sort=name are sorted, and ?sort=bogus answers 400 'sort must be price or name'; the menu page's search box asks /api/snacks?name=… and the sorted method with the glued ORDER BY is gone.",
        "Wednesday, Part 1. A POST to /api/orders for 3 Kutsinta answers 201 with order_id, snack_id, name, qty and total 30; qty 0 or 25 answers 400; snack 99 answers 404. (A POST can't be typed in the address bar: use the console lines from Wednesday's checkpoint.) The order is a new row in sales with today's date and the same number as the receipt, and ledger.html shows it.",
        "Wednesday, Part 2. POST /api/snacks answers 201 for a new snack, 409 'Snack 90 already exists' for a snack number in use, and 400 for a blank name or a price outside 1 to 1000; add-snack.html adds a snack that appears on menu.html and can be ordered with no restart.",
        "Thursday, Part 1. /api/orders lists every sale that has a snack, including my Week 3 and 4 sales and Monday's test sale; /api/orders/{id} answers one order for an id I can see in /api/orders, and 404 'No order with id 99999' for one that doesn't exist; /api/orders?date=2000-01-02 answers exactly my test sale and ?date=1999-12-31 answers []; /api/summary's total_orders and total_sales match the list. I restarted the app and my orders were still there on orders.html.",
        "Thursday, Part 2. sales has a price_paid column; the order I placed at ₱15 still totals 15 although Kutsinta costs 10; the 2000-01-03 sale totals 14; listOrders (both SELECTs) and getOrder all use COALESCE(sales.price_paid, snacks.price).",
        "Friday, Part 1. /api/rows answers rows from my own Week 3 JOIN, each with an id first, tables.html shows them without my touching tables.js, and static/rows.json is gone.",
        "Friday, Part 2. The specials table exists and holds Kutsinta at ₱7; /api/special answers it with name, price and special_price; index.html says Today's special: Kutsinta — ₱7; with the special deleted, /api/special answers 404 'No special today' and the page says No special today.",
        "No List.of( or ArrayList holding snacks, orders or rows is left anywhere in my project, and menu.html, order.html, orders.html and tables.html still work at localhost:8080.",
        "With the wrong password the app still starts, the pages show the empty states I wrote down, and with the right password and a restart everything is back.",
        "My notes.md has the failure table (four rows, the password row written as password=…(wrong)) from Monday, the glued-SQL and glued-sort lessons from Tuesday, Wednesday's note on checking the ledger after a write, and Thursday's note on the price at the time of sale.",
        "For every ❌: fix it now. Everything you need is in this week's four days and in today's labs, and the day is yours.",
      ],
      tip: "Not sure how to fix a ❌? Go back to the day it came from: pom.xml, the properties lines, /api/snacks, /api/sales and ledger.html → Monday. getSnack, ?maxPrice, /api/find, the search and the sort whitelist → Tuesday. POST /api/orders, POST /api/snacks, the KeyHolder, AUTO_INCREMENT and add-snack.html → Wednesday. The JOIN, AS, getOrder, summary, ?date and price_paid → Thursday. /api/rows, /api/special and the clean-up → today. Each day's checkpoint still works: paste your answers in again and it tells you the first thing that's wrong.",
      submit: "Paste the list with your ✅/❌ marks (never any part of application.properties), and for each ❌ you fixed, one line on what was wrong",
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own improvement",
      intro:
        "Make your canteen app do one more thing that you choose. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own, and build it with what this week taught. Write and run the SQL in queries.sql first. Ideas: (1) GET /api/orders/today lists today's orders: the same JOIN with  WHERE sales.sold_on = CURRENT_DATE  and no ? at all; (2) make the pages cope with a 500: in menu.js and orders.js check  response.ok  before using the data and write the app's own message on the page, the way ledger.js does; (3) GET /api/orders?snack_id=3 lists only the orders for that snack (a second WHERE with a ?); (4) add a  sold_on  key to every order in /api/orders (a new key is allowed; a renamed one is not), showing it as a column on orders.html; (5) on index.html, show the usual price next to the special: Today's special: Kutsinta — ₱7 (usually ₱10), using the price key /api/special already sends; (6) a second special: change /api/special so ?snack_id=90 answers the newest special for that snack only, and 404 'No special for that snack' when it has none; (7) make index.html honest: tell a missing special (404) from an unreachable database (500) by checking  response.status  in the else branch, so it writes No special today. only for a 404 and Sorry, the canteen can't load the special right now. for anything else (test it with the wrong-password drill and with the DELETE FROM specials WHERE snack_id = 90; of Part 2); (8) harder: ?date=abc answers 400 'Use a date like 2026-08-14' instead of a 500 (parse with LocalDate.parse(date) inside a try, and catch DateTimeParseException to throw a ResponseStatusException with HttpStatus.BAD_REQUEST); or POST /api/special takes {snack_id, special_price}, answers 404 for an unknown snack and 400 for a special_price below 1, inserts into specials and answers 201 with the new Special.",
          hint:
            "Keep every checkpoint passing: don't rename a key, don't change a status code, keep /api/summary's two keys. A NEW key is fine; a renamed one breaks the checkpoint. Start small: write the one new SELECT in queries.sql, run it, then put exactly that text in jdbc.sql(…). For idea 2, copy ledger.js's pattern:  response.json().then(data => { if (response.ok) { … } else { … data.message … } })  and test it with the wrong-password drill. For idea 4 the Order record gets a sixth field and the three SELECTs gain  sales.sold_on  (the field is a String). For idea 7, inside the else branch of index.js use  if (response.status === 404) { … } else { … } . For idea 8, the check goes at the top of listOrders when date isn't null (the import is java.time.LocalDate and java.time.format.DateTimeParseException).",
        },
        {
          task: "Paste what you added: the new Java lines (and which file), the SQL you ran first, any new HTML or JavaScript, how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "Copy the lines from VS Code. How you tested it can be one sentence: 'I opened /api/sales/today and it listed the two orders I placed this morning.'",
          input: "Paste your new lines, the SQL, how you tested, and what it answered",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-final-mysql",
      title: "📸 Hand in: an order that exists only in MySQL",
      intro: "Proof that your whole canteen runs on your ledger and not on anything left over from Week 7.",
      steps: [
        "Choose a snack number nobody has used: 100 plus the day of the month you were born (for example 117). Open localhost:8080/add-snack.html and add a snack named YOUR FIRST NAME with that number and price 12. If the page says Sorry: Snack … already exists, add 100 more to your number and try again.",
        "Without restarting the app, open localhost:8080/order.html, choose YOUR snack in the drop-down, qty 2, and press Place order. Keep the receipt on the page.",
        "Close the application.properties tab in VS Code (it holds your password). Don't open it again before the screenshot.",
        "Arrange the browser (the order page with the receipt) and VS Code with SQLTools showing the result of  SELECT * FROM sales ORDER BY sale_id DESC;  so the newest row, with your snack's number, is on top. Both must be visible.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots.",
        "Upload it below. Afterwards you may delete your own snack's sale, and then your snack, if you like.",
      ],
      proves: "that your own Spring Boot app took a new snack from a form on a page you built, put it into your snacks table, then took an order for it and wrote that into your sales table, so the whole chain from browser to app to MySQL is yours, at localhost:8080.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week8",
    title: "⚔️ Boss battle: The Memory Keeper",
    intro: "The Memory Keeper forgets everything when the power goes. Show it a ledger.",
    boss: { name: "the Memory Keeper", emoji: "🧠" },
    questions: [
      {
        prompt: "Which two blocks in pom.xml connect the app to MySQL?",
        choices: [
          "spring-boot-starter-webmvc and spring-boot-starter-test",
          "spring-boot-starter-jdbc and mysql-connector-j",
          "mysql and java",
        ],
        answer: 1,
        explain: "Spring's JDBC tools, and the driver that speaks MySQL.",
      },
      {
        prompt: "Your app starts with a wrong password. When do you first notice?",
        choices: ["Never", "At startup", "On the first request that needs MySQL: 500 'Failed to obtain JDBC Connection'"],
        answer: 2,
        explain: "A missing url or driver stops the start; a refused login waits for a request.",
      },
      {
        prompt: "`.param(x)` and `?` — what is the rule?",
        choices: [
          "Values go through .param so they are never read as SQL, in the order of the ? marks",
          "Glue values into the string with +",
          ".param is only for numbers",
        ],
        answer: 0,
        explain: "Week 4's rule, on the web.",
      },
      {
        prompt: "`.optional().orElseThrow(() -> new ResponseStatusException(NOT_FOUND, …))` is for…",
        choices: [
          "A list of rows",
          "One row by its key: no row becomes a planned 404",
          "An INSERT",
        ],
        answer: 1,
        explain: "getSnack and getOrder use it.",
      },
      {
        prompt: "After a restart, which orders are still there?",
        choices: ["None", "Every order in the sales table", "Only the ones from Week 3"],
        answer: 1,
        explain: "The ledger outlives the program.",
      },
      {
        prompt: "How does the new order number get into the receipt?",
        choices: [
          "The app counts the list",
          "A KeyHolder holds the id MySQL generated for the INSERT",
          "The browser sends it",
        ],
        answer: 1,
        explain: "Ask the server what it did; don't predict it.",
      },
      {
        prompt: "`sales.qty * snacks.price AS total` — where is total stored?",
        choices: ["In the sales table", "Nowhere: it is calculated for each result row", "In the snacks table"],
        answer: 1,
        explain: "Calculated on the way out.",
      },
      {
        prompt: "The sale with snack_id NULL is not on the orders board. Why?",
        choices: [
          "It was deleted",
          "INNER JOIN drops a sale with no snack, so it is not an order",
          "Spring hides it",
        ],
        answer: 1,
        explain: "Week 3 Day 2.",
      },
      {
        prompt: "Moving the snacks and orders from Java lists into MySQL: which of your pages did that force you to change?",
        choices: ["All four", "menu.html only", "None: the addresses, status codes and JSON keys stayed as they were"],
        answer: 2,
        explain: "That was the point of Week 7's decisions. (Pages you edited for a new feature, like the menu's search box or the home page's special, were your choice, not something MySQL forced.)",
      },
      {
        prompt: "The password line is in application.properties. Which of these may you share?",
        choices: [
          "The whole file in a turn-in",
          "A screenshot of the file",
          "Nothing from that file: when you must show it, show the line with a placeholder",
        ],
        answer: 2,
        explain: "It holds a secret now.",
      },
      {
        prompt: "/api/special is built from four layers. Which order is right, from the bottom up?",
        choices: [
          "page, endpoint, record, table",
          "table, record and endpoint, then the page that shows it",
          "record, page, table, endpoint",
        ],
        answer: 1,
        explain: "Each layer reads the one beneath it: the page asks the endpoint, the endpoint's SQL reads the table. Build and test from the bottom.",
      },
      {
        prompt: "The specials table is empty. What does /api/special answer, and what does index.html say?",
        choices: [
          "500, and the page breaks",
          "404 'No special today', and the page says No special today.",
          "200 with an empty special",
        ],
        answer: 1,
        explain: "No row is not an error: .optional().orElseThrow turns it into a planned 404, and the page checks response.ok.",
      },
      {
        prompt: "?date=abc answers 500. The better answer is…",
        choices: ["400: the customer's date is malformed", "404", "200 with []"],
        answer: 0,
        explain: "4xx means the caller's mistake.",
      },
      {
        prompt: "When MySQL is away, why does orders.html say 'Can't reach the canteen app'?",
        choices: [
          "The app really is off",
          "The page treats the 500 error body as data, throws, and its .catch blames the connection",
          "Chrome blocks it",
        ],
        answer: 1,
        explain: "Check response.ok before using data.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: describe the whole journey of ONE order from the click on Place order to a row in sales, and back to the receipt. Name each place it passes through.",
      "Which of this week's failures were the app's fault, which MySQL's, and which yours?",
      "Pick ONE feature from Part 2 of any day and name every layer it passes through (table, record, endpoint, page), and the file that holds each.",
      "What did your audit find that you hadn't noticed?",
      "What surprised you or broke this week, and why it happened.",
      "One question you still have.",
    ],
    note: "Your canteen is finished as a reader and a writer: the pages, the API and the ledger are one program. Next week your pages gain the two verbs they don't have yet: change a row and remove one.",
  },
};
