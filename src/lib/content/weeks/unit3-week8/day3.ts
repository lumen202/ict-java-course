// unit3-week8 · Day 3 — Write to the ledger
//
// POST /api/orders now INSERTs a row into the student's own `sales` table
// (snack_id, sold_on = CURRENT_DATE, qty) and takes the new order number from
// the id MySQL generated (JdbcClient .update(KeyHolder), the JdbcClient
// version of Week 4's getGeneratedKeys). Validation (400) and the unknown
// snack (404, from getSnack) still run first. The Java `orders` list is KEPT
// for one more day so the Week 7 board and GET /api/orders/{id} keep working;
// after a restart the board is empty while the ledger still holds the order,
// which is Day 4's set-up.
//
// A finding that shaped the day: Week 3's CREATE TABLE sales has
// `sale_id INT PRIMARY KEY` with NO AUTO_INCREMENT, and Week 4's RecordSale
// inserts without a sale_id. Observed on MySQL 8: that INSERT fails with
// Error 1364 "Field 'sale_id' doesn't have a default value" (BUG-035). So the
// student checks DESCRIBE sales and runs ALTER TABLE sales MODIFY sale_id INT
// AUTO_INCREMENT if the Extra column is empty (observed: keeps the primary key,
// next id = highest + 1, harmless to run twice). That repair now lives in
// Day 1 Part 2; Day 3 only relies on it.
//
// Observed on a real Spring Boot 4.1.1 + MySQL 8 build:
//  - first web order after the ledger's sale 10 is sale 11; deleted ids are
//    not reused (the next order gets the next number, leaving a gap);
//  - INSERT ... VALUES (?, CURRENT_DATE, ?) stores the database server's
//    today; the response is 201 with the Order JSON;
//  - qty 0 / 21 -> 400 "qty must be from 1 to 20"; unknown snack -> 404 "No
//    snack with id 99" (getSnack runs before the INSERT); a missing qty key ->
//    400 "Cannot map `null` into type `int`"; DELETE -> 405;
//  - skipping getSnack would reach the foreign key: 500 "...Cannot add or update
//    a child row: a foreign key constraint fails (`school`.`sales`, CONSTRAINT
//    `sales_ibfk_1` ...)";
//  - swapped .param order stores qty 90 for snack 2 with NO error (silent);
//  - VALUES (?, ?) for three columns: "Column count doesn't match value count at
//    row 1";
//  - .update() without the KeyHolder then keys.getKey().intValue(): NPE
//    "...KeyHolder.getKey() is null" (500);
//  - catching DuplicateKeyException gives a clean 409 (make-your-own idea).
//
// Revised after the first two reviews (docs/agent/log/2026-10-28-week8-reviews-and-part-2.md):
//  - the first checkpoint task proves the write by reading it BACK from MySQL: it
//    POSTs an order, then looks the order up in GET /api/sales (Day 1, Part 2).
//    The Java `orders` list still keeps the board alive until Day 4, so the
//    Day 2 app's answers (order_id 1, nothing in sales) fail it (previousStage);
//  - test rows are created and deleted by a condition only they satisfy
//    (snack 90 with qty 19), never by a sale_id the student has to guess;
//  - receipt numbers are relative to the student's own table, and a refused INSERT
//    uses up a number (observed), so gaps are explained;
//  - the AUTO_INCREMENT repair moved to Day 1 Part 2; SELECT LAST_INSERT_ID() as a
//    separate Ctrl+E ran on a different connection, so it was dropped;
//  - the day continues with Part 2: POST /api/snacks and add-snack.html.
// Video (transcript read): Gyan Darpan, "JdbcClient INSERT in Spring Boot
// (Multiple Approaches)" (6YQfGr9Y2PU, 31:36). Only the first 15 minutes are
// assigned (positional .param + KeyHolder); the JDBC-index and named-parameter
// versions after that are not used.

import type { DayPlan } from "../../types";
import { day3Part2 } from "./day3-part2";
import { consoleOrder, consoleOrderThenSales } from "./commands";
import {
  CONTROLLER_D3A,
  INSERT_BLOCK,
  NEW_IMPORTS_KEYS,
  PLACE_ORDER_D3,
} from "./snippets";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "Write to the ledger: POST /api/orders becomes an INSERT, and the order outlives a restart",
  warmupGame: {
    kind: "quest",
    id: "warmup-insert-shape",
    title: "✍️ Warm-up: who fills which column?",
    intro: "Week 4's RecordSale inserted a sale with three question marks. An order form on the web does the same, with a different split of who knows what.",
    missions: [
      {
        task: "The sales table has four columns: sale_id, snack_id, sold_on, qty. Week 5 Day 3 asked the same question for the order form: which of them does a person at the counter decide?",
        hint: "Week 5 Day 3: 'People choose only what people know.' The form's boxes were named snack_id and qty.",
        check: {
          question: "Which two columns does the browser send in the order?",
          choices: ["sale_id and sold_on", "snack_id and sold_on", "snack_id and qty"],
          answer: 2,
          explain: "The customer chooses the snack and how many. Today's date and the sale's own number are not theirs to choose.",
        },
      },
      {
        task: "So the app fills the other two. Today's date can come from MySQL itself: the word CURRENT_DATE inside the SQL means 'today, on the database server'. The sale's number is AUTO_INCREMENT's job.",
        hint: "Week 2 Day 4: what does AUTO_INCREMENT do when an INSERT doesn't mention the id column?",
        check: {
          question: "In  INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, CURRENT_DATE, ?),  how many ? marks are there and why?",
          choices: [
            "Four: one for every column",
            "None",
            "Two: only snack_id and qty come from outside; the date is a MySQL word and the sale_id isn't mentioned at all",
          ],
          answer: 2,
          explain: "Fewer gaps means fewer ways to get it wrong. Whatever the app can decide itself, it shouldn't ask the customer for.",
        },
      },
      {
        task: "Week 4 Day 4: after the INSERT, your program asked the server what id it had given (getGeneratedKeys). A web app must do the same, because the receipt shows the order number.",
        hint: "Week 4: why not compute MAX(id) + 1 yourself?",
        check: {
          question: "Why must the app ask MySQL for the new order number instead of working it out?",
          choices: [
            "Only MySQL knows what it assigned; a guess like 'highest number + 1' is wrong as soon as two orders arrive at the same moment",
            "Because the number is random",
            "Because Java can't count",
          ],
          answer: 0,
          explain: "Ask the server what it did; don't predict it. Today you do it with a KeyHolder.",
        },
      },
    ],
  },
  videos: [
    {
      title: "JdbcClient INSERT in Spring Boot, multiple approaches (Gyan Darpan)",
      youtubeId: "6YQfGr9Y2PU",
      length: "31:36",
      practice: {
        intro: "Watch only the first 15 minutes: up to where he says 'chaining style, order is everything' and starts talking about a JDBC index (about 15:40). That is positional ? marks, .param(…) one by one, and a KeyHolder. First do the SQL half in SQLTools, as Week 4 did.",
        steps: [
          "In queries.sql run  DESCRIBE sales;  and read the Extra column on the sale_id row. It should say auto_increment: you checked it in Monday's Part 2. If it is EMPTY, run  ALTER TABLE sales MODIFY sale_id INT AUTO_INCREMENT;  now (Monday's first Part 2 mission explains it) and DESCRIBE again.",
          "Predict, then run this test sale for Kutsinta and look at the top of the table. The quantity 19 is on purpose: no sale you want to keep has it, which is what lets you delete test sales safely. Write the new sale's sale_id and sold_on in notes.md:\n\nINSERT INTO sales (snack_id, sold_on, qty) VALUES (90, CURRENT_DATE, 19);\n\nSELECT * FROM sales ORDER BY sale_id DESC;",
          "WARNING before you run this: a DELETE removes real rows, so its WHERE must match only what you mean to remove. This one removes only the Kutsinta sales of exactly 19 (your test sale), and nothing else in your table qualifies:\n\nDELETE FROM sales WHERE snack_id = 90 AND qty = 19;\n\nThen run the INSERT of step 2 again and look at the new sale_id: is the number you deleted used again?",
          "Try the lock from Weeks 3 and 4 on purpose, and write down the error number:\n\nINSERT INTO sales (snack_id, sold_on, qty) VALUES (99, CURRENT_DATE, 1);\n\nThen run the Kutsinta test INSERT of step 2 once more and compare its sale_id with the one before: the refused INSERT used up a number too. Finally delete your test sales again with the DELETE of step 3.",
        ],
        note: "He uses an Employee table, Postman and DBeaver, a @Repository class, and passes the key column name to update(keyHolder, \"employee_id\"). You will pass no column name:  .update(keys)  and then  keys.getKey().  Stop him when he starts the JDBC-index and named-parameter versions: you won't use them. If your Extra column was empty and the ALTER made it auto_increment, that fixes a gap from Week 3: its sales table was created without the counter.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: Place order writes into sales",
      intro:
        "One method changes today: placeOrder. Restart after every change to a .java file. The checks (qty 1 to 20, a snack that exists) stay in front, exactly as they were.",
      missions: [
        {
          task:
            "Make placeOrder write to MySQL. (1) Under the other import lines add:\n\n" +
            NEW_IMPORTS_KEYS +
            "\n\n(2) Delete the whole placeOrder method and type this in its place. The INSERT block is new; everything else is last week's code (Week 7 Day 4), with newId where the old line counted the list:\n\n" +
            PLACE_ORDER_D3 +
            "\n\nRead the new part: a KeyHolder is an empty box; .update(keys) runs the INSERT and puts the generated id in the box; keys.getKey() opens it. The two .param calls fill the two ? marks in order: snack_id first, then qty.",
          hint:
            "The line  orders.add(order);  stays for now: the orders board still reads that list until tomorrow. Red under KeyHolder or GeneratedKeyHolder means an import line is missing. The INSERT block is:\n\n" +
            INSERT_BLOCK,
          check: {
            question: "Which of the four sales columns does the Java code give a value for, and which does MySQL fill?",
            choices: [
              "Java gives snack_id and qty; MySQL fills sold_on (CURRENT_DATE) and sale_id (AUTO_INCREMENT)",
              "Java gives all four",
              "Java gives sale_id; MySQL does the rest",
            ],
            answer: 0,
            explain: "Two values come from the customer's order, one is MySQL's word for today, and the id is the counter's.",
          },
        },
        {
          task:
            "Restart, open localhost:8080/order.html, order Kutsinta, qty 3, and press Place order. Read the receipt. Then open localhost:8080/ledger.html (Monday's page) and look at the bottom row, and in SQLTools run  SELECT * FROM sales ORDER BY sale_id DESC;  and compare the top row with the receipt.",
          hint: "If the receipt says Sorry with a long message, read the error clinic first: patient 1 is the most likely. The top row of the query is the newest sale; on ledger.html it is the last row.",
          check: {
            question: "The receipt says Order N (your own number: one more than the highest sale number you have had, so it can differ from your classmates'). What do the newest row in SQLTools and the last row of ledger.html show?",
            choices: [
              "Nothing: the order is only in Java",
              "A row with sale_id 1",
              "sale_id N, snack_id 90, today's date and qty 3: the receipt number IS the sale_id MySQL generated",
            ],
            answer: 2,
            explain: "Order numbers are sale numbers now. The first web order continues from the numbers in YOUR ledger, so it is not 1: your Week 3 and Week 4 sales and Monday's test sale came first.",
          },
        },
        {
          task:
            "Do the numbers go backwards? Place a test order on order.html: Kutsinta, qty 19, and note its receipt number. Then delete it. WARNING first: this DELETE removes every Kutsinta sale of exactly 19, which is only your test (nothing else this week uses 19):\n\nDELETE FROM sales WHERE snack_id = 90 AND qty = 19;\n\nThen place another order of qty 19 and read the receipt number. When you have read it, run that same DELETE once more to remove this second test order too.",
          hint: "Think of the SQL half of the video practice: did a deleted number come back there? Remember that a refused INSERT used up a number too.",
          check: {
            question: "You deleted the newest sale and ordered again. What number does the new receipt show?",
            choices: [
              "The same number as the deleted one, because it is free again",
              "Always 1",
              "A higher number than the deleted one: AUTO_INCREMENT never reuses an id, so the ledger can have gaps (and a refused INSERT leaves one too)",
            ],
            answer: 2,
            explain: "A counter only counts up. Gaps are normal, and an order number is a name for one sale, not a count of sales.",
          },
        },
        {
          task:
            "Test the three refusals from the console. Open localhost:8080/order.html, press F12 → Console, and run these lines one at a time (Enter after each). Each prints the status and the answer. If Chrome warns about pasting, type  allow pasting  and press Enter first.\n\nqty 0:\n\n" +
            consoleOrder(3, 0) +
            "\n\nqty 25:\n\n" +
            consoleOrder(3, 25) +
            "\n\nan unknown snack:\n\n" +
            consoleOrder(99, 1) +
            "\n\nThen run  SELECT * FROM sales ORDER BY sale_id DESC;  again.",
          hint: "The first two answer 400 with  qty must be from 1 to 20.  The third answers 404 with  No snack with id 99.  Chrome also prints its own red line for a 4xx: that's the browser reporting the status, not a mistake. After all three, the newest sale in the table is the same as before: refused orders write nothing.",
          check: {
            question: "After the three refused orders, how many NEW rows are in the sales table?",
            choices: [
              "Three: every request writes a row",
              "One, for the unknown snack",
              "None: the checks run before the INSERT, so a refused order never reaches MySQL",
            ],
            answer: 2,
            explain: "Validation first, write second. The 404 comes from getSnack, which asks MySQL for the snack before anything is inserted.",
          },
        },
        {
          task:
            "Why does the app check the snack itself, when the foreign key from Week 3 would also refuse snack 99? In SQLTools run  INSERT INTO sales (snack_id, sold_on, qty) VALUES (99, CURRENT_DATE, 1);  and read the error. If the app skipped its own check, the INSERT would hit that error and the customer would get a 500 whose message starts  PreparedStatementCallback; SQL [INSERT INTO sales …]; Cannot add or update a child row: a foreign key constraint fails.",
          hint: "Compare what a page can do with 'No snack with id 99' and with a 500 that shows part of your SQL. Which one can order.js show kindly?",
          check: {
            question: "Why is the app's own 404 kinder than letting the foreign key refuse?",
            choices: [
              "It isn't: the foreign key is enough",
              "A 404 is faster",
              "The 404 gives the customer a clear message and the right status, without leaking the SQL; the foreign key stays as the last guard if the app ever forgets",
            ],
            answer: 2,
            explain: "The database's rule protects the data from every program. Your check protects the customer from a confusing answer. You want both.",
          },
        },
        {
          task:
            "Restart the app (stop, then Run). Open localhost:8080/orders.html, then localhost:8080/ledger.html, then run  SELECT * FROM sales ORDER BY sale_id DESC;  in SQLTools. Compare the three.",
          hint: "orders.html reads /api/orders, which still returns the Java list that a restart just emptied. ledger.html reads /api/sales, which reads the sales table. The ledger is untouched.",
          check: {
            question: "The orders board says there are no orders, but ledger.html and the table hold your Kutsinta order. Is the order lost?",
            choices: [
              "Yes: a restart deletes orders, as in Week 7",
              "Yes, but it comes back after an hour",
              "No: the order is safe in the sales table (ledger.html proves it). The BOARD is still reading the old Java list, which restarts empty. Tomorrow it reads the table too",
            ],
            answer: 2,
            explain: "This is the first week your orders survive a restart. Half of the app (the writing) is on MySQL; the reading side catches up tomorrow.",
          },
        },
        {
          task:
            "Compare. After today your SnackController.java should look like this (line 1 is your own package line; blank lines, import order, method order and any leftover import lines don't matter):\n\n" +
            CONTROLLER_D3A,
          hint: "Common differences: the KeyHolder imports missing, the two .param calls swapped, a missing semicolon after .update(keys), or  new Order(orders.size() + 1, …)  still in place of newId.",
        },
        {
          task: "Add today to notes.md: the DESCRIBE result before and after, the receipt number and the matching sale_id, what happened to a deleted number, the three refusals and their statuses, and why the board was empty after the restart.",
          hint: "Write it in your own words.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-writes",
      title: "🧪 Part 1 · Checkpoint: orders that reach MySQL",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080). The line sends an order, prints the answer, and copies it; paste it here. If copy doesn't work, select the printed answer by hand. Kutsinta (id 90, price 10) is the snack: its price must be 10. Only the first task proves the write reached MySQL: Tuesday's app, which keeps orders in a Java list, cannot pass it. The other two check that the refusals still come first.",
      tasks: [
        {
          goal: "Open localhost:8080/order.html, press F12 → Console, and run this line. It orders 3 Kutsinta, then asks /api/sales whether that very sale (its number, its snack, its quantity) is in the sales table, and copies the result. Paste it here.",
          command: consoleOrderThenSales(90, 3),
          checks: [
            { is: "object", message: "This should be the order, starting with {. Did the line run on localhost:8080/order.html? A Whitelabel answer means the order failed: read the terminal." },
            { keys: ["order_id", "snack_id", "name", "qty", "total"], message: "The order needs order_id, snack_id, name, qty and total. Check the last line of placeOrder builds new Order(newId, snack.snack_id(), snack.name(), request.qty(), …)." },
            { types: { order_id: "number", snack_id: "number", name: "string", qty: "number", total: "number" }, message: "order_id, snack_id, qty and total must be numbers and name must be text." },
            { path: "name", equals: "Kutsinta", message: "The name should be Kutsinta, read from the snack MySQL returned." },
            { path: "qty", equals: 3, message: "qty should be 3." },
            { path: "total", equals: 30, message: "total should be 30: price 10 × qty 3. Is Kutsinta's price back to 10?" },
            { path: "in_sales_table", equals: true, message: "The order was NOT found in your sales table (GET /api/sales). Is placeOrder running the INSERT, and is its newId the number the INSERT got? An order that only lives in a Java list never reaches MySQL." },
          ],
          hint: "If it says Sorry or 500, read the terminal for the line after 'with root cause'. If in_sales_table is false, the receipt number was made up in Java (orders.size() + 1) instead of coming from the KeyHolder.",
          solution: PLACE_ORDER_D3,
          example: "{\"order_id\":12,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":3,\"total\":30,\"in_sales_table\":true}",
          previousStage: "{\"order_id\":1,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":3,\"total\":30,\"in_sales_table\":false}",
          explain: "The order number came from MySQL's counter, the total from the price MySQL returned, and /api/sales proves the row is really in the table: three places agreeing.",
        },
        {
          goal: "An order for a snack that doesn't exist. Run this line on localhost:8080/order.html and paste what it copies.",
          command: consoleOrder(99, 1),
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {." },
            { path: "status", equals: 404, message: "The status should be 404. A 500 here means the INSERT ran and the foreign key refused it: the getSnack line must stay BEFORE the INSERT." },
            { path: "message", equals: "No snack with id 99", message: "The message should be  No snack with id 99.  It comes from getSnack." },
          ],
          hint: "placeOrder should call  Snack snack = getSnack(request.snack_id());  before the KeyHolder lines.",
          solution: PLACE_ORDER_D3,
          example: "{\"timestamp\":\"2026-10-27T19:56:47.396Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No snack with id 99\",\"path\":\"/api/orders\"}",
          explain: "Refused politely, before anything was written.",
        },
        {
          goal: "An order that is too big. Run this line on localhost:8080/order.html and paste what it copies.",
          command: consoleOrder(3, 25),
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {." },
            { path: "status", equals: 400, message: "The status should be 400." },
            { path: "message", equals: "qty must be from 1 to 20", message: "The message should be exactly  qty must be from 1 to 20.  That check still comes first in placeOrder." },
          ],
          hint: "The qty check is the first thing in placeOrder: if it moved below the INSERT, a bad order is saved before it is refused.",
          solution: PLACE_ORDER_D3,
          example: "{\"timestamp\":\"2026-10-27T19:56:49.221Z\",\"status\":400,\"error\":\"Bad Request\",\"message\":\"qty must be from 1 to 20\",\"path\":\"/api/orders\"}",
          explain: "Same refusal as Week 7, now with a database behind it that never saw the order.",
        },
      ],
    },
    ...day3Part2,
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro:
        "Every message below was copied from a real app. The browser shows PreparedStatementCallback and part of the SQL; the cause is the text after the last semicolon, and in the terminal on the 'with root cause' line.",
      missions: [
        {
          task:
            "Patient 1. Place order shows  Sorry: PreparedStatementCallback; uncategorized SQLException for SQL [INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, CURRENT_DATE, ?)]; SQL state [HY000]; error code [1364]; Field 'sale_id' doesn't have a default value.",
          hint: "The INSERT never mentions sale_id. So MySQL wants to know where its value comes from. Run DESCRIBE sales; and read the Extra column.",
          check: {
            question: "Diagnosis?",
            choices: [
              "The qty is too big",
              "sale_id has no AUTO_INCREMENT, so MySQL has no value for it: run  ALTER TABLE sales MODIFY sale_id INT AUTO_INCREMENT;",
              "The foreign key is wrong",
            ],
            answer: 1,
            explain: "The same error would have hit Week 4's RecordSale. Seeing error code 1364 in the message is the clue: it is MySQL's own number, so the server answered and refused.",
          },
        },
        {
          task:
            "Patient 2. The customer ordered snack 99 and the browser shows a 500 with  …Cannot add or update a child row: a foreign key constraint fails (`school`.`sales`, CONSTRAINT …).  Last week the same order got a polite 404.",
          hint: "Which of Tuesday's lines turns an unknown snack into a 404, and where does it have to sit?",
          check: {
            question: "What is wrong with the code?",
            choices: [
              "The line  Snack snack = getSnack(request.snack_id());  is missing or comes after the INSERT",
              "Week 3's foreign key should be removed",
              "The sales table is full",
            ],
            answer: 0,
            explain: "The foreign key did its job, so no bad row was saved. But the customer saw a 500 and part of your SQL. Check first, write second.",
          },
        },
        {
          task:
            "Patient 3. Everything works and the receipt looks right: 2 × Kwek-kwek = ₱40. But in SQLTools the new sale is  snack_id 2, qty 3.  The student's INSERT lines are  .param(request.qty())  then  .param(snack.snack_id()).",
          hint: "Two ? marks: the first is snack_id, the second is qty. Which .param call fills which?",
          check: {
            question: "Why did nothing complain?",
            choices: [
              "The two columns are both int, so MySQL accepts either way: the .param calls fill the ? marks in ORDER, and swapped values go into the wrong columns without an error",
              "MySQL checks column names against the .param names",
              "The receipt is saved separately",
            ],
            answer: 0,
            explain: "The worst bugs are silent. The receipt is built from the request, the ledger from the INSERT, and only reading the table showed the difference. Always check the ledger, not just the page.",
          },
        },
        {
          task:
            "Patient 4. Place order shows  …SQL [INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, ?)]; …Column count doesn't match value count at row 1.",
          hint: "Count the columns in the first parentheses, then the values in the second. You met this as Error 1136 in Week 2.",
          check: {
            question: "What do you fix?",
            choices: [
              "The number of values must equal the number of columns: here three columns need three values, such as  (?, CURRENT_DATE, ?)",
              "Rename the table",
              "Add a fourth column",
            ],
            answer: 0,
            explain: "Same error as in Workbench, now arriving through Java. Run the INSERT in SQLTools with test values to see it quicker.",
          },
        },
        {
          task:
            "Patient 5. Place order answers 500. The terminal says  java.lang.NullPointerException: Cannot invoke \"java.lang.Number.intValue()\" because the return value of \"org.springframework.jdbc.support.KeyHolder.getKey()\" is null.  The student wrote  .update();  with nothing inside the brackets.",
          hint: "Who puts the generated id into the KeyHolder?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The sale was not inserted",
              "The row WAS inserted, but .update() was not given the KeyHolder, so the box stayed empty. Write  .update(keys)",
              "int is too small",
            ],
            answer: 1,
            explain: "Note the dangerous part: the sale is saved and the customer saw an error. They would order again. Check the ledger after any 500 on a write.",
          },
        },
        {
          task:
            "Patient 6. A student restarted the app and says: 'Last week an order was lost when I restarted. Today the board is empty again. Where did my order go?'",
          hint: "Did you look in the table?",
          check: {
            question: "What do you tell them?",
            choices: [
              "It is lost, as in Week 7",
              "It is in the sales table: SELECT * FROM sales ORDER BY sale_id DESC; shows it. The board still reads the old Java list. Tomorrow the board reads the table too",
              "Press F5 on the board",
            ],
            answer: 1,
            explain: "Different from Week 7, where a restart really did lose the order. When in doubt, ask the ledger.",
          },
        },
        {
          task:
            "Patient 7. The customer's browser sends  {\"snack_id\":90}  with no qty. The answer is 400:  JSON parse error: Cannot map `null` into type `int`.",
          hint: "You met this in Week 7 Day 3. Is it an INSERT problem?",
          check: {
            question: "Is that a database problem?",
            choices: [
              "Yes: MySQL refused the NULL",
              "No: Spring refuses before placeOrder runs, because qty is an int and the key is missing. No SQL was sent",
              "Yes: sale_id is missing",
            ],
            answer: 1,
            explain: "Same as Week 7. It's worth noticing which layer said no: the first layers (Spring's types, your qty check) protect the database from ever seeing nonsense.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you'd check, then your rule for what to do after ANY failed write: which two places do you look?",
          hint: "Patients 3, 5 and 6 are all solved by one tool. Which?",
          input: "Paste your seven notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own write",
      intro:
        "Make your canteen record one more thing that you choose. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own, and build it with what the week has taught. Run the SQL in queries.sql first. Ideas: (1) print each new order to the terminal with System.out.println(\"New order \" + newId); (2) in add-snack.js, empty the form after a successful add (JavaScript: form.reset() inside the  if (response.ok)  branch); (3) in addSnack, store the name without spaces at either end: Java's  snack.name().trim()  gives the trimmed text, so use it for the .param and the returned Snack (a new Snack(snack.snack_id(), trimmed, snack.price()) record); (4) under the form in add-snack.html, show the list of snacks you already have: add a <ul id=\"all\"> and, in add-snack.js, a fetch of /api/snacks that makes one <li> per snack (the menu.js pattern); (5) POST /api/sales takes  {snack_id, sold_on, qty}  and inserts a sale with the date the customer sends: use ? for all three values, answer 404 for an unknown snack (call getSnack first), 400 for a qty outside 1 to 20, and 201 with a Sale that has the new sale_id from a KeyHolder; (6) harder: the same POST /api/sales, but answer 400  Use a date like 2026-08-14  when sold_on is not a real date: LocalDate.parse(sold_on) inside a try, catching DateTimeParseException (import java.time.LocalDate and java.time.format.DateTimeParseException), before anything is written.",
          hint:
            "Keep every checkpoint passing: don't change placeOrder's answers or the shape of addSnack's. Test a new endpoint in the console with a fetch like today's, changing the address and the body. Any snack you add while testing can be removed again with  DELETE FROM snacks WHERE snack_id = …;  as long as no sale points at it (a sale does, if you ordered it). For idea 5, copy placeOrder's validation and INSERT, and change the columns.",
        },
        {
          task: "Paste what you added: the new Java lines (and which file), the SQL you ran first, how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I posted snack 91 twice: 201 the first time, 409 the second.'",
          input: "Paste your new lines, the SQL, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-vanishing-order",
    title: "⚔️ Boss battle: The Vanishing Order",
    intro: "The Vanishing Order lives in memory and disappears with every restart. Pin it to the ledger.",
    boss: { name: "the Vanishing Order", emoji: "👻" },
    questions: [
      {
        prompt: "Which part of INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, CURRENT_DATE, ?) says 'today'?",
        choices: ["CURRENT_DATE, a MySQL word the database fills in", "The first ?", "sold_on, the column name"],
        answer: 0,
        explain: "The browser never sends a date. The database decides what today is.",
      },
      {
        prompt: "Why does placeOrder run getSnack before the INSERT?",
        choices: [
          "To make the INSERT faster",
          "An unknown snack becomes a polite 404 before anything is written, and the price is read from MySQL",
          "Because Java requires it",
        ],
        answer: 1,
        explain: "Check, then write. The foreign key stays as the last guard.",
      },
      {
        prompt: "What does a KeyHolder do?",
        choices: ["Locks the table", "Holds the id MySQL generated for the new row, once you pass it to .update(keys)", "Stores your password"],
        answer: 1,
        explain: "It is JdbcClient's version of Week 4's getGeneratedKeys.",
      },
      {
        prompt: "You delete the newest sale and place another order. Its number is…",
        choices: ["The deleted number again", "Always 1", "The next number up: AUTO_INCREMENT doesn't reuse ids"],
        answer: 2,
        explain: "A counter only counts up. Gaps are normal.",
      },
      {
        prompt: "Two .param calls are swapped in an INSERT of two int columns. What happens?",
        choices: ["MySQL refuses", "The row is saved with the values in the wrong columns, and nothing complains", "The app restarts"],
        answer: 1,
        explain: "That is why you read the table after writing, not just the receipt.",
      },
      {
        prompt: "Error 1364 'Field sale_id doesn't have a default value' means…",
        choices: [
          "The INSERT didn't supply sale_id and the column has no AUTO_INCREMENT to fill it",
          "The snack doesn't exist",
          "The password is wrong",
        ],
        answer: 0,
        explain: "Fix with ALTER TABLE sales MODIFY sale_id INT AUTO_INCREMENT;",
      },
      {
        prompt: "After a restart the orders board is empty but SELECT * FROM sales shows your order. Why?",
        choices: [
          "The order is lost",
          "The board still reads the Java list; the order is safe in MySQL",
          "MySQL needs a restart too",
        ],
        answer: 1,
        explain: "Tomorrow the board reads the table.",
      },
      {
        prompt: "A refused order (qty 25). How many rows does it add to sales?",
        choices: ["One, with qty 25", "One, with qty 20", "None: the check runs before the INSERT"],
        answer: 2,
        explain: "Refused orders never reach MySQL.",
      },
      {
        prompt: "POST /api/snacks gets a snack_id that already exists. Which answer is right, and what does the app catch?",
        choices: [
          "500: the database failed",
          "200: it replaces the old snack",
          "409 Conflict: the app catches DuplicateKeyException from the INSERT and turns it into a planned answer",
        ],
        answer: 2,
        explain: "A duplicate primary key (Week 2's Error 1062) is the customer's conflict, not the server's failure.",
      },
      {
        prompt: "addSnack checks  snack.name() == null  before  snack.name().isBlank().  Why in that order?",
        choices: [
          "isBlank is slower",
          "Calling a method on null crashes with a NullPointerException, so the null test must come first (|| stops at the first true)",
          "No reason",
        ],
        answer: 1,
        explain: "A missing name key arrives as null. The first test catches it before the second can crash.",
      },
      {
        prompt: "An order is saved but the customer got a 500 (a bug after the INSERT). What do you do before telling them to try again?",
        choices: ["Nothing", "Look in the sales table: the row may already be there", "Restart MySQL"],
        answer: 1,
        explain: "A failed answer doesn't mean a failed write. Check the ledger.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what happens, step by step, from pressing Place order to a new row appearing in sales.",
      "Which values does the browser send, which does the app add, and which does MySQL fill in?",
      "Why check the ledger as well as the receipt after a write?",
      "How POST /api/snacks answers each case (new snack, same snack number, blank name, price 0), and why the snack number comes from the form but the sale number from MySQL.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your orders now outlive the app, and you can add a snack from a page without opening SQLTools. The last Java list is the one the orders board still reads: tomorrow it goes, the board shows the whole ledger, and you'll meet a SQL JOIN with a name tag.",
  },
};
