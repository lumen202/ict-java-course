// unit3-week8 · Day 4 — Read the ledger back
//
// GET /api/orders, GET /api/orders/{id} and GET /api/summary now read the
// student's own sales table JOINed to snacks, with the SQL aliases the Order
// record needs (sale_id AS order_id, qty * price AS total). The last Java list
// (`orders`) is deleted, so the Week 7 orders board shows the WHOLE ledger,
// including every Week 3/4 sale. A small ?date= filter reuses the `?` idea.
// The week's predict-the-answer gauntlet lives here, as in Week 7.
//
// Observed on a real Spring Boot 4.1.1 + MySQL 8 build (ledger rebuilt from
// Weeks 3-4, ten sales, one with snack_id NULL):
//  - INNER JOIN returns 9 of the 10 sales: the sale with no snack (7) is not an
//    order, /api/orders/7 is a 404 "No order with id 7";
//  - sale_id AS order_id and sales.qty * snacks.price AS total map straight onto
//    Order(int order_id, int snack_id, String name, int qty, int total) with
//    .query(Order.class) (the INT * INT product maps to int fine);
//  - without AS: root cause "Column 'order_id' not found." / "Column 'total' not
//    found." (the browser only says "bad SQL grammar [the SQL]");
//  - a LEFT JOIN lets NULLs through and the record's int fields refuse them:
//    browser "Failed to convert from type [null] to type [int] for value [null]",
//    terminal root cause "IllegalArgumentException: A null value cannot be
//    assigned to a primitive type";
//  - /api/summary is still a Java loop (no SUM, no GROUP BY: Unit 1 never taught
//    them), and agrees with the list;
//  - ?date=2000-01-02 returns that day's order (the String binds to the DATE
//    column); ?date=abc is a 500 "...error code [1525]; Incorrect DATE value: 'abc'";
//  - a text block opened with text after the quotes is a javac error "illegal text
//    block open delimiter sequence, missing line terminator" (VS Code wording
//    NOT verified);
//  - changing listOrders() to take a String parameter breaks summary()'s
//    listOrders() call at compile time.
//
// Revised after the first two reviews (docs/agent/log/2026-10-28-week8-reviews-and-part-2.md):
//  - every checkpoint answer must be one Day 3's real app can't give: the board
//    must hold the Day 1 test sale (Kutsinta, 2000-01-01, qty 7), /api/orders/{id}
//    is asked about THAT sale, the list must equal the raw ledger's sales that have
//    a snack, and ?date= is asked about a day with exactly one sale and a day with
//    none (previousStage on each);
//  - the "total is calculated, so it's right every time" claim was wrong: a total
//    calculated from TODAY's price rewrites old sales when a price changes. Part 1
//    still calculates (and the warm-up now says what is wrong with it); Part 2 stores
//    the price paid (price_paid, COALESCE) and proves it;
//  - counts of rows are the student's own ("one fewer"), not 10 and 9.
// Video (transcript read): Charles Boisvert, "SQL2 - aliases, calculations,
// order" (obdfrqq1osU, 5:21; Oracle-style tables, double-quoted aliases).

import type { DayPlan } from "../../types";
import { day4Part2 } from "./day4-part2";
import { FETCH_ORDER_BY_TEST_SALE, FETCH_SUMMARY_AGREES, FETCH_DAYS } from "./commands";
import {
  CONTROLLER_D4A,
  GET_ORDER_D4,
  LIST_ORDERS_D4,
  LIST_ORDERS_D4_DATE,
  PLACE_ORDER_D4,
  SUMMARY_D4,
  SUMMARY_D4_NO_DATE,
  SQL_JOIN_TODAY,
} from "./snippets";

export const day4: DayPlan = {
  day: "Day 4",
  focus: "Read the ledger back: a JOIN with name tags, and the orders board shows everything",
  warmupGame: {
    kind: "quest",
    id: "warmup-name-tags",
    title: "🏷️ Warm-up: the sales table doesn't say 'name' or 'total'",
    intro: "Your pages expect an order to look like  {order_id, snack_id, name, qty, total}.  The sales table looks different. Work out the gap before writing any Java.",
    missions: [
      {
        task: "Week 3 Day 2: an INNER JOIN keeps only the rows that have a partner. If your sales table has an honest NULL, the sale whose snack nobody knew, the JOIN will leave it out.",
        hint: "Week 3: 'A snack that never sold leaves no row at all'. The same idea works from the other side for a sale with no snack.",
        check: {
          question: "Imagine a sales table with ten rows, and one of them has snack_id NULL. How many rows does  sales INNER JOIN snacks  return? (Yours has its own number of rows; the idea is the same.)",
          choices: ["Ten", "One", "Nine: the NULL sale has no partner in snacks, so it disappears"],
          answer: 2,
          explain: "An order needs a snack to have a name and a total. A sale with no snack can't be shown as an order, so the board will skip it. You'll see that today.",
        },
      },
      {
        task: "Compare the two shapes. The sales table: sale_id, snack_id, sold_on, qty. An order in your API: order_id, snack_id, name, qty, total.",
        hint: "One key is the same column renamed, one comes from another table, one is calculated.",
        check: {
          question: "Which is right?",
          choices: [
            "order_id = sale_id renamed; name from snacks through the JOIN; total = qty × price calculated",
            "All five are columns of sales",
            "name and total are stored in sales",
          ],
          answer: 0,
          explain: "Renaming and calculating are two small new tools in SQL, and the video today teaches both: the word AS.",
        },
      },
      {
        task: "The ledger doesn't store each sale's total. A column total with 60 for 4 Banana cue at 15 would go stale if the price changed, so the SELECT will calculate it: quantity × price. But think about WHICH price. Banana cue cost 15 when the 4 were sold last month, and today it costs 20.",
        hint: "A calculation uses whatever the snacks table holds NOW.",
        check: {
          question: "What does a total calculated from TODAY's price say for that old sale of 4?",
          choices: [
            "60, what the customer paid",
            "An error, because the price changed",
            "80: the old sale is rewritten by the new price",
          ],
          answer: 2,
          explain: "Calculating on the way out keeps one source of truth, but it also rewrites history whenever a price changes. Today you calculate from today's price, and say so. In Part 2 you fix it the way real ledgers do: store the price paid with the sale.",
        },
      },
    ],
  },
  videos: [
    {
      title: "SQL2: aliases, calculations, order (Charles Boisvert)",
      youtubeId: "obdfrqq1osU",
      length: "5:21",
      practice: {
        intro: "He teaches the two tools you need: AS to rename a column in the result, and a formula such as  balance * 0.1  as a column. Build the exact query your Java will send, one piece at a time, in queries.sql.",
        steps: [
          "Run this first and count its rows. Compare with the number of rows in SELECT * FROM sales: they are equal, unless your table has a sale with no snack, and then the JOIN has one row fewer:\n\nSELECT sales.sale_id, sales.snack_id, snacks.name, sales.qty, snacks.price\nFROM sales\nINNER JOIN snacks ON sales.snack_id = snacks.snack_id\nORDER BY sales.sale_id;",
          "Now rename the first column: change  sales.sale_id  to  sales.sale_id AS order_id.  Run it and look at the column heading.",
          "Replace the last column,  snacks.price,  with  sales.qty * snacks.price AS total.  Run it. Check ONE row by hand: pick a row and multiply its quantity by its snack's price on a calculator. Does total match?",
          "In notes.md write which sale went missing, its sale_id and why, using the words INNER JOIN and NULL (if none went missing, write that, and why: every sale of yours has a snack).",
          "Your finished query should read like this (indentation and line breaks don't matter to MySQL). Keep it: it goes into your Java in the lab.\n\n" + SQL_JOIN_TODAY,
        ],
        note: "He uses an accounts table, and double quotes around an alias with a space. In MySQL a one-word alias needs no quotes, and that is all you use. He also shows ORDER BY: you've used it since Week 1. In MySQL, * is multiplication, just like in Java.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: the orders board reads your ledger",
      intro:
        "Three methods change and the last Java list disappears. Then the orders board shows what it has never shown before. Restart after every change to a .java file.",
      missions: [
        {
          task:
            "Replace listOrders. Delete the whole old listOrders method (the one that only says  return orders;)  and type this in its place. The SQL sits between triple quotes: that is a text block, a string that may run over several lines (Java 15 and later; you have 17 or newer). The opening \"\"\" must be the last thing on its line, and the closing \"\"\" goes on a line of its own:\n\n" +
            LIST_ORDERS_D4 +
            "\n\nThe AS names are the record's field names, order_id and total, so  .query(Order.class)  can fill an Order for every row.",
          hint:
            "Type the SQL exactly as you built it in queries.sql, inside the triple quotes. Nothing may follow the opening \"\"\" on its line, and a text block never ends with a semicolon inside it. The  ;  after  .list()  ends the whole return statement.",
          check: {
            question: "Why does the SELECT say  sales.sale_id AS order_id  and  … AS total ?",
            choices: [
              "AS is optional decoration",
              "MySQL requires AS in every SELECT",
              "The record Order has fields order_id and total. .query(Order.class) matches column NAMES to field names, so the columns must be labelled order_id and total",
            ],
            answer: 2,
            explain: "The same rule as Day 1: column names are matched to record fields by name. AS lets one SQL column answer to the name the JSON needs.",
          },
        },
        {
          task:
            "Replace getOrder. Delete the whole old getOrder method (the loop over  orders)  and type this in its place:\n\n" +
            GET_ORDER_D4 +
            "\n\nIt is getSnack's shape again: one ?, .param(id), .optional(), and a 404 with Week 7's message when nothing matches.",
          hint: "The SELECT is the same one with a WHERE added. The Order record is unchanged. The text block's closing \"\"\" sits on its own line before .param(id).",
          check: {
            question: "How is this method like getSnack?",
            choices: [
              "It isn't: it loops over a list",
              "It returns a list",
              "Same pattern: SELECT … WHERE key = ?, .param(id), .optional(), and orElseThrow with the 404 message",
            ],
            answer: 2,
            explain: "Learn the pattern once. 'One thing by its id, or a 404' is the same five lines for snacks, orders, and anything you add later.",
          },
        },
        {
          task:
            "Replace summary. Delete the whole old summary method and type this in its place. It is still a Java loop: Unit 1 never taught SUM, so you keep adding up the totals yourself, now over the rows MySQL returned:\n\n" +
            SUMMARY_D4_NO_DATE,
          hint: "listOrders() is a method of your own class: calling it runs the SELECT. The loop is Week 7's, with  all  where it said  orders.",
          check: {
            question: "Where do the numbers in /api/summary come from now?",
            choices: [
              "From the same JOIN as /api/orders: summary() asks listOrders() for the rows and adds them up in a loop",
              "From a Java list",
              "From a stored total column",
            ],
            answer: 0,
            explain: "One query defines what an 'order' is. Two endpoints use it, so they can never disagree about it.",
          },
        },
        {
          task:
            "Delete the last Java list. (1) Delete the field  private final List<Order> orders = new ArrayList<>();.  (2) Delete the whole placeOrder method and type this in its place. It is Wednesday's, minus the list: the last lines build the Order and return it directly:\n\n" +
            PLACE_ORDER_D4 +
            "\n\n(3) You may delete the line  import java.util.ArrayList;  too. A leftover import is harmless.",
          hint: "If VS Code shows red after the delete, some line still mentions  orders: read the message, and the line it points to. After this step the word orders should appear nowhere in SnackController.java except inside method names.",
          check: {
            question: "Wednesday's placeOrder ended with  orders.add(order);  and  return order;.  Why can both go?",
            choices: [
              "The order is already saved by the INSERT, in the ledger, which is now the only place orders live",
              "Orders don't need saving any more",
              "They can't; the code won't compile",
            ],
            answer: 0,
            explain: "The INSERT IS the saving. A second copy in Java was only there to keep the board alive for a day.",
          },
        },
        {
          task:
            "Restart and open localhost:8080/orders.html. Look at the table and the summary line. Then in SQLTools run  SELECT * FROM sales;  and compare the number of rows.",
          hint: "The board lists every row of the JOIN, oldest first. Count both: the board should have one row fewer than sales if you still have the NULL sale.",
          check: {
            question: "You never placed these orders from the website, yet the board lists them. Why?",
            choices: [
              "A bug: they should not be there",
              "Spring invented them",
              "The board shows the whole sales table (joined to snacks): the sales you inserted in Weeks 3 and 4 are rows of the same ledger, so they are 'orders' too",
            ],
            answer: 2,
            explain: "This is the payoff of using your real ledger instead of a new table: the website and your Unit 1 work are the same data now. The sale with no snack is the only one the JOIN can't show.",
          },
        },
        {
          task:
            "Find the missing sale. Run  SELECT * FROM sales WHERE snack_id IS NULL;  in SQLTools (if it returns no row, you have no unknown sale: skip to the next mission). Then open localhost:8080/api/orders/ followed by THAT sale's sale_id (for example /api/orders/7).",
          hint: "The sale exists in the table, but with no snack there is no name and no price to build an order from.",
          check: {
            question: "The sale exists, yet /api/orders/7 answers 404 'No order with id 7'. Is the 404 right?",
            choices: [
              "No: the sale exists, so it should return it",
              "It's a bug in MySQL",
              "Yes: the JOIN finds no snack for it, so there is no order to show. The ledger's honest NULL stays honest",
            ],
            answer: 2,
            explain: "Week 3 Day 2 in action. If you wanted the sale shown with a blank name, you'd need a LEFT JOIN and a record that allows NULL: see the error clinic.",
          },
        },
        {
          task:
            "Prove the orders really outlive a restart. On order.html place an order: Kutsinta, qty 3. Open the board and find it. Then stop the app (red square), Run it again, and reload the board.",
          hint: "In Week 7 this order would be gone. Look for the newest row at the bottom of the board, and for the summary line growing by one order and ₱30.",
          check: {
            question: "After the restart, is your Kutsinta order on the board?",
            choices: [
              "Yes: the board reads the sales table, and the table kept the order",
              "No: the app restarted so it starts empty",
              "Only if you reload twice",
            ],
            answer: 0,
            explain: "This is the whole point of the week: the program and the ledger have different lifetimes now. The app can stop and start; the ledger stays.",
          },
        },
      ],
    },
    {
      kind: "quest",
      id: "lab-date-filter",
      inline: true,
      title: "🛠️ Part 1 · Lab: orders for one day",
      intro:
        "The ledger has a date on every sale, and no page uses it yet. Add an optional ?date= to /api/orders. It's the ? from Tuesday on a different column, and it changes a method's signature, which breaks something else.",
      missions: [
        {
          task:
            "Put a sale on a day nobody else uses. First run the SELECT. Only if it returns NO rows, run the INSERT after it, once:\n\nSELECT * FROM sales WHERE sold_on = '2000-01-02';\n\nINSERT INTO sales (snack_id, sold_on, qty) VALUES (90, '2000-01-02', 2);\n\nThen run the SELECT again: exactly one row.",
          hint: "The date is written as year-month-day in quotes, like the dates in your Week 3 sales. Kutsinta is snack 90. If you ran the INSERT twice by accident and now see two rows, run  DELETE FROM sales WHERE sold_on = '2000-01-02';  (this day has only these test sales) and then the INSERT once.",
          check: {
            question: "Why use the year 2000?",
            choices: [
              "No other sale can be on that day, so the answer to 'what happened on 2000-01-02?' is exactly this one sale, on every student's ledger",
              "It is a required test date",
              "MySQL doesn't accept recent dates",
            ],
            answer: 0,
            explain: "A test you can predict is a test you can check. Your own ledger's dates differ from your classmates', but this one row is the same for everyone.",
          },
        },
        {
          task:
            "Replace listOrders again, with the version that takes an optional date. Delete the whole listOrders method and type this in its place. When date is missing it returns everything, as before; when it is there, it adds  WHERE sales.sold_on = ?  and .param(date):\n\n" +
            LIST_ORDERS_D4_DATE,
          hint: "The two queries are the same except for the WHERE line and the .param. The parameter is a String: MySQL turns '2000-01-02' into a date when it compares it with the DATE column.",
          check: {
            question: "VS Code now underlines  listOrders()  inside summary() in red. Why?",
            choices: [
              "summary() is wrong and must be deleted",
              "Spring Boot doesn't allow methods to call each other",
              "listOrders now needs one argument (the date), and summary() calls it with none: change that call to listOrders(null), which means 'no date filter'",
            ],
            answer: 2,
            explain: "Changing a method's inputs breaks every caller. Java tells you where, at compile time, which is much kinder than finding out from a customer.",
          },
        },
        {
          task:
            "Fix summary. Delete the whole summary method and type this in its place, then restart:\n\n" +
            SUMMARY_D4,
          hint: "The only change from the version you typed earlier is  listOrders(null)  where it said  listOrders().",
          check: {
            question: "What does  listOrders(null)  ask for?",
            choices: [
              "Orders dated null",
              "No orders at all",
              "All orders: a null date means 'no filter', so the first query runs",
            ],
            answer: 2,
            explain: "The query that runs depends on the argument. The caller says null, the method sees null and returns everything.",
          },
        },
        {
          task:
            "Test the filter. Open localhost:8080/api/orders?date=2000-01-02 (just your test sale). Then /api/orders?date=2026-08-14 (whatever you sold that day, or [] if nothing). Then /api/orders?date=abc and read the status and message.",
          hint: "The first answers a list of one: Kutsinta, qty 2, total 20. The third is a 500 whose message ends  Incorrect DATE value: 'abc'.",
          check: {
            question: "?date=abc answers 500 with  Incorrect DATE value: 'abc'.  Whose mistake is it, and what would be better?",
            choices: [
              "The server's: 500 is right",
              "The customer's: it should be a 400 telling them to use year-month-day. A 500 means 'the server broke', and nothing broke",
              "MySQL's: it should accept abc",
            ],
            answer: 1,
            explain: "It works, but it blames the wrong party. A 400 for a malformed date is one of the make-your-own ideas. The dangerous part is not the 500: it's that the message shows your SQL. Only a customer's typo can make it appear.",
          },
        },
        {
          task:
            "Compare. After today your SnackController.java should look like this (line 1 is your own package line; blank lines, import order, method order and leftover import lines don't matter):\n\n" +
            CONTROLLER_D4A +
            "\n\nThen search the project for leftovers: Ctrl+Shift+F, search  List.of(  and then  ArrayList.  The only List.of left in your whole project may be in RowsController.java, which you'll change tomorrow.",
          hint: "Common differences: summary() still calling listOrders(), a quote or bracket missing at the end of a text block, a second copy of a method you replaced. The Week 7 methods info() and findByName are unchanged.",
        },
        {
          task: "Add today to notes.md: the query you built step by step, the missing sale and why, what the board showed after the change (and why it has orders you never placed), and the three ?date= results.",
          hint: "Write it in your own words.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-ledger",
      title: "🧪 Part 1 · Checkpoint: the ledger, read back",
      intro:
        "Open each address, or run each console line, on a page of YOUR app at localhost:8080. Your ledger holds different rows from your classmates', so these tasks check shapes and the Kutsinta sales you put there yourself: Monday's test sale (qty 7) and today's (2000-01-02, qty 2). Kutsinta's price must be 10. Yesterday's app keeps its orders in a Java list, so it cannot show Monday's sale.",
      tasks: [
        {
          goal: "Paste what your app answers at /api/orders.",
          url: "localhost:8080/api/orders",
          checks: [
            { is: "array", message: "This should be a list, starting with [. Did the app fail? A Whitelabel page means read the terminal." },
            { min: 1, message: "The list is empty. Is listOrders still returning an empty Java list?" },
            { keys: ["order_id", "snack_id", "name", "qty", "total"], message: "An order needs order_id, snack_id, name, qty and total. Check the SELECT labels them with AS order_id and AS total." },
            { types: { order_id: "number", snack_id: "number", name: "string", qty: "number", total: "number" }, message: "order_id, snack_id, qty and total must be numbers and name must be text." },
            { some: { snack_id: 90, name: "Kutsinta", qty: 7, total: 70 }, message: "Monday's test sale is missing: Kutsinta, qty 7, total 70 (price 10 × 7). It was written to MySQL on Monday, before this app ever ran: only a listOrders that reads the sales table can show it. Is listOrders reading MySQL, and is Kutsinta's price 10?" },
          ],
          hint: "If the answer is [] or only holds orders from this session, listOrders still returns a Java list. The test sale from Monday's Part 2 is the proof the board reads the ledger: if it's missing, check ledger.html has it.",
          solution: LIST_ORDERS_D4,
          example: "[{\"order_id\":1,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":4,\"total\":60},{\"order_id\":2,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":2,\"total\":40},{\"order_id\":3,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":5,\"total\":75},{\"order_id\":4,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":3,\"total\":60},{\"order_id\":5,\"snack_id\":2,\"name\":\"Turon\",\"qty\":6,\"total\":72},{\"order_id\":6,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":2,\"total\":30},{\"order_id\":8,\"snack_id\":5,\"name\":\"Siopao\",\"qty\":3,\"total\":75},{\"order_id\":9,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":4,\"total\":80},{\"order_id\":10,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":2,\"total\":40},{\"order_id\":11,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":7,\"total\":70},{\"order_id\":12,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":3,\"total\":30},{\"order_id\":13,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":20}]",
          previousStage: "[]",
          explain: "Your whole ledger, one JSON array, with name tags and totals that were never stored. Monday's test sale is in it, so this list cannot be the Java list.",
        },
        {
          goal: "One order by its id. Open localhost:8080/order.html, press F12 → Console, and run this line. It finds Monday's test sale in /api/sales, asks /api/orders/{its id}, and copies THAT answer. Paste it here.",
          command: FETCH_ORDER_BY_TEST_SALE,
          checks: [
            { is: "object", message: "This should be ONE order, starting with {." },
            { keys: ["order_id", "snack_id", "name", "qty", "total"], message: "The order needs order_id, snack_id, name, qty and total. If you see a  message  about the test sale, run Monday's INSERT of the test sale (Kutsinta, 2000-01-01, qty 7). If you see  status 404, getOrder does not find a sale that is in your table: it must read MySQL." },
            { path: "name", equals: "Kutsinta", message: "The name should be Kutsinta, from the JOIN." },
            { path: "qty", equals: 7, message: "qty should be 7." },
            { path: "total", equals: 70, message: "total should be 70: qty 7 × price 10." },
          ],
          hint: "getOrder must ask MySQL: a sale from Monday is not in any Java list.",
          solution: GET_ORDER_D4,
          example: "{\"order_id\":11,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":7,\"total\":70}",
          previousStage: "{\"timestamp\":\"2026-10-27T19:58:00.756Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No order with id 11\",\"path\":\"/api/orders/11\"}",
          explain: "An order that was written long before the app started, found by its id: write and read agree, through the ledger.",
        },
        {
          goal: "An order that doesn't exist. Run this line in the console of a localhost:8080 tab and paste what it copies.",
          command:
            'fetch("/api/orders/99999").then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)',
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {." },
            { path: "status", equals: 404, message: "The status should be 404." },
            { path: "message", equals: "No order with id 99999", message: "The message should be exactly  No order with id 99999.  Check the orElseThrow line in getOrder." },
          ],
          hint: "getOrder ends with .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, \"No order with id \" + id)).",
          solution: GET_ORDER_D4,
          example: "{\"timestamp\":\"2026-10-27T19:57:47.061Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No order with id 99999\",\"path\":\"/api/orders/99999\"}",
          explain: "Same 404 and message as Week 7, from a different home.",
        },
        {
          goal: "The summary, the list and the raw ledger must agree. Run this line in the console of a localhost:8080 tab. It asks /api/orders, /api/summary and /api/sales, adds the totals up itself, and tells you whether they match. Paste it here.",
          command: FETCH_SUMMARY_AGREES,
          checks: [
            { is: "object", message: "This should be a small object with count_matches, sales_match and every_sale_with_a_snack_is_an_order." },
            { path: "count_matches", equals: true, message: "total_orders doesn't equal the number of orders in /api/orders. summary() should use  all.size()  from listOrders(null)." },
            { path: "sales_match", equals: true, message: "total_sales doesn't equal the sum of the totals in /api/orders. Check the loop adds o.total() for every order." },
            { path: "every_sale_with_a_snack_is_an_order", equals: true, message: "/api/orders has a different number of orders from the sales in /api/sales that have a snack. The board should show EVERY sale that has a snack: is it still the Java list, or is the JOIN filtered by something?" },
          ],
          hint: "summary() must read the same rows as /api/orders, so both numbers come from  listOrders(null).  And /api/orders must list one order per sale that has a snack.",
          solution: SUMMARY_D4,
          example: "{\"count_matches\":true,\"sales_match\":true,\"every_sale_with_a_snack_is_an_order\":true}",
          previousStage: "{\"count_matches\":true,\"sales_match\":true,\"every_sale_with_a_snack_is_an_order\":false}",
          explain: "One definition of an order, two endpoints that agree, and a raw ledger they can be compared with.",
        },
        {
          goal: "Paste what your app answers at /api/orders?date=2000-01-02. The sale you inserted in the lab is the only one on that day.",
          url: "localhost:8080/api/orders?date=2000-01-02",
          checks: [
            { is: "array", message: "This should be a list, starting with [." },
            { exact: 1, message: "Exactly ONE order is dated 2000-01-02. If you see more, the date is ignored (the second query must run when date isn't null); if you see none, run the lab's INSERT dated 2000-01-02 once." },
            { some: { snack_id: 90, name: "Kutsinta", qty: 2, total: 20 }, message: "No Kutsinta order of 2 with total 20. Check the lab's INSERT: snack 90, qty 2, and Kutsinta's price is 10." },
          ],
          hint: "If it lists every order, the date is ignored: the second query must run when date isn't null. If it lists two Kutsinta orders you inserted the lab sale twice: run  DELETE FROM sales WHERE sold_on = '2000-01-02';  and then the INSERT once.",
          solution: LIST_ORDERS_D4_DATE,
          example: "[{\"order_id\":13,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":20}]",
          previousStage: "[]",
          explain: "Same JOIN, narrowed by a ? on a DATE column. One more question your ledger can answer.",
        },
        {
          goal: "A day with no sales, next to a day with one. Run this line in the console of a localhost:8080 tab and paste what it copies.",
          command: FETCH_DAYS,
          checks: [
            { is: "object", message: "This should be a small object." },
            { path: "orders_on_2000_01_02", equals: 1, message: "Exactly one order is dated 2000-01-02." },
            { path: "orders_on_1999_12_31", equals: 0, message: "No sale is dated 1999-12-31, so that answer should be an empty list. If it holds orders, the ?date= filter is being ignored." },
          ],
          hint: "The two answers must differ. A filter that does nothing would give the same list for both days.",
          solution: LIST_ORDERS_D4_DATE,
          example: "{\"orders_on_2000_01_02\":1,\"orders_on_1999_12_31\":0}",
          previousStage: "{\"orders_on_2000_01_02\":0,\"orders_on_1999_12_31\":0}",
          explain: "Both an empty answer and a one-order answer: the filter really filters.",
        },
      ],
    },
    ...day4Part2,
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro:
        "Every message below was copied from a real app. The browser says  bad SQL grammar [the SQL]  or a short sentence; the cause is in the terminal after 'with root cause'.",
      missions: [
        {
          task:
            "Patient 1. The board is empty and /api/orders answers 500. The SQL runs fine in SQLTools. The terminal says  java.sql.SQLSyntaxErrorException: Column 'order_id' not found.  The student's SELECT starts  SELECT sales.sale_id, sales.snack_id, snacks.name, …",
          hint: "Who is looking for a column called order_id?",
          check: {
            question: "Diagnosis?",
            choices: [
              "MySQL has no column order_id: add one to the table",
              "The Order record has a field order_id, and no column of the result is labelled that: add  AS order_id  after sales.sale_id",
              "The text block is broken",
            ],
            answer: 1,
            explain: "Same shape as Tuesday's  Column 'price' not found.  The message names a record field the SELECT doesn't label.",
          },
        },
        {
          task:
            "Patient 2. Same symptoms, and the terminal says  Column 'total' not found.  The SELECT ends  …, sales.qty * snacks.price  with nothing after it.",
          hint: "A calculated column has no name of its own unless you give it one.",
          check: {
            question: "What do you add?",
            choices: [
              "AS total after the calculation",
              "A column called total to the sales table",
              "A comma",
            ],
            answer: 0,
            explain: "Without AS, MySQL labels the column with the formula itself, which is no name Java can match.",
          },
        },
        {
          task:
            "Patient 3. The student wanted the NULL sale on the board too, so changed INNER JOIN to LEFT JOIN. The board broke: /api/orders answers 500 with  Failed to convert from type [null] to type [int] for value [null].  The terminal says  java.lang.IllegalArgumentException: A null value cannot be assigned to a primitive type.",
          hint: "A LEFT JOIN keeps the sale with no snack and fills the missing columns with NULL. Which Order fields are int?",
          check: {
            question: "Why did it break, and what are the options?",
            choices: [
              "LEFT JOIN is not allowed in Java",
              "The NULL sale produces NULL for snack_id and total, and an int field can't hold NULL. Go back to INNER JOIN, or change those record fields to Integer and handle the blanks on the page",
              "The table is locked",
            ],
            answer: 1,
            explain: "Week 4's NULL trap, on the web. Deciding which sales count as orders is a design decision: the lab chose INNER JOIN.",
          },
        },
        {
          task:
            "Patient 4. The student changed listOrders to take  String date.  VS Code now shows a red underline under  listOrders()  inside summary().",
          hint: "Which method calls listOrders?",
          check: {
            question: "What is the fix?",
            choices: [
              "Delete summary()",
              "Pass the new argument: listOrders(null)",
              "Rename listOrders",
            ],
            answer: 1,
            explain: "A method that gained a parameter needs every caller updated. null here means 'no filter'.",
          },
        },
        {
          task:
            "Patient 5. A student's code shows a red error on the line with the opening triple quotes. They wrote  jdbc.sql(\"\"\"SELECT sales.sale_id …  all on one line, with the SQL straight after the quotes.",
          hint: "The rule for a text block's first line.",
          check: {
            question: "What is the rule?",
            choices: [
              "After the opening \"\"\" the line must end: the text starts on the NEXT line (the closing \"\"\" may sit wherever you like)",
              "Text blocks can't contain SQL",
              "You must use single quotes",
            ],
            answer: 0,
            explain: "javac's own words are 'illegal text block open delimiter sequence, missing line terminator'. Put a line break straight after the opening quotes. Only the opening delimiter has this rule.",
          },
        },
        {
          task:
            "Patient 6. A student looks at the new board and says: 'There are a lot more orders here than the 2 I placed today. Someone put orders in my app.'",
          hint: "Where did the others come from?",
          check: {
            question: "What do you tell them?",
            choices: [
              "Someone hacked the app",
              "The board shows the whole sales ledger: those are the sales from Weeks 3 and 4, in the same table",
              "It's a MySQL bug",
            ],
            answer: 1,
            explain: "They are real: you typed them. Your website, your SQL files and your Java program from Week 4 all share one ledger now.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you'd check, then your rule: when a result won't map into a record, which two lists do you compare?",
          hint: "Patients 1 and 2 both come down to comparing two lists of names. Which two?",
          input: "Paste your six notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "week8-gauntlet",
      title: "🧪 The week's gauntlet: predict the answer",
      intro:
        "Kuya Jun's school-supplies shop has a ledger like yours.  supplies:  (1, Notebook, 30) (2, Pencil, 5) (3, Eraser, 8) (4, Ruler, 15), columns item_id, name, price.  purchases:  (1, item 1, 2026-09-01, qty 2) (2, item 3, 2026-09-01, qty 4) (3, item NULL, 2026-09-02, qty 1) (4, item 2, 2026-09-02, qty 10), columns purchase_id, item_id, bought_on, qty, with a foreign key from purchases.item_id to supplies.item_id. Their Spring Boot app works like yours. Predict each answer. The questions jump between the week's days on purpose.",
      missions: [
        {
          task: "His application.properties has the right username but an extra x on the end of the password. He starts the app.",
          hint: "Day 1: when does the app first try to use the password?",
          check: {
            question: "What happens?",
            choices: [
              "It stops at startup with APPLICATION FAILED TO START",
              "It starts normally; the first request that needs MySQL answers 500 'Failed to obtain JDBC Connection', with 'Access denied … (using password: YES)' in the terminal",
              "It starts and every request works",
            ],
            answer: 1,
            explain: "Day 1: a missing url or driver stops the start; a refused login waits for the first request.",
          },
        },
        {
          task: "His controller runs  SELECT item_id, name, price FROM supplies WHERE price <= ?  with  .param(8).",
          hint: "Day 2: <= includes the boundary.",
          check: {
            question: "Which names come back?",
            choices: ["Pencil and Eraser", "Pencil only", "Pencil, Eraser and Ruler"],
            answer: 0,
            explain: "Pencil 5 and Eraser 8 (8 <= 8). Ruler is 15 and Notebook is 30.",
          },
        },
        {
          task: "His search glues the name in:  \"… WHERE name = '\" + name + \"'\".  A customer sends  x' OR '1'='1.",
          hint: "Day 2: what does the WHERE become?",
          check: {
            question: "What does the app answer?",
            choices: ["[]", "A 400", "All four supplies"],
            answer: 2,
            explain: "The text became part of the SQL, so the WHERE is always true.",
          },
        },
        {
          task: "His order INSERT is  INSERT INTO purchases (item_id, bought_on, qty) VALUES (?, CURRENT_DATE, ?)  but the Java says  .param(request.qty())  first and  .param(request.item_id())  second. A customer orders item 2, qty 7.",
          hint: "Day 3: .param fills the ? marks in order.",
          check: {
            question: "What is stored?",
            choices: [
              "item_id 2, qty 7, with no error",
              "item_id 7 and qty 2, saved with no error",
              "Nothing: the foreign key refuses item_id 7 because there is no item 7, so the customer sees a 500 (error 1452 in the terminal)",
            ],
            answer: 2,
            explain: "Swapped values go into the wrong columns. Here item 7 doesn't exist, so the foreign key catches it. With an item that existed, nothing would complain.",
          },
        },
        {
          task: "His board's SELECT is  FROM purchases INNER JOIN supplies ON purchases.item_id = supplies.item_id.  A LEFT JOIN would be  FROM purchases LEFT JOIN supplies ON …  with the same ON.",
          hint: "Day 4: purchase 3 has no item.",
          check: {
            question: "How many rows do the INNER JOIN and the LEFT JOIN return?",
            choices: ["3 and 4", "4 and 4", "3 and 3"],
            answer: 0,
            explain: "INNER drops the purchase with no item; LEFT keeps it with NULLs. With int fields in the record, those NULLs would then break the mapping.",
          },
        },
        {
          task: "His SELECT is  SELECT purchases.purchase_id, supplies.name, purchases.qty * supplies.price AS total …  and his record is  Line(int purchase_id, String name, int total).",
          hint: "Day 4: a record field needs a column with its name.",
          check: {
            question: "What does the terminal say?",
            choices: [
              "It works",
              "Column 'total' not found.",
              "Column 'purchase_id' not found.",
            ],
            answer: 0,
            explain: "All three fields are labelled: purchase_id (the column's own name), name, and total (the AS). A mapping error needs a MISSING label.",
          },
        },
        {
          task: "His summary adds the totals of the INNER JOIN rows in a Java loop.",
          hint: "Day 4: purchases 1, 2 and 4 have items. Notebook 30 × 2, Eraser 8 × 4, Pencil 5 × 10.",
          check: {
            question: "What does his summary answer?",
            choices: [
              "{\"total_orders\":4,\"total_sales\":142}",
              "{\"total_orders\":3,\"total_sales\":142}",
              "{\"total_orders\":3,\"total_sales\":152}",
            ],
            answer: 1,
            explain: "60 + 32 + 50 = 142, from 3 rows. The unknown purchase isn't an order, so it isn't counted.",
          },
        },
        {
          task: "A customer opens  /api/supplies/9  and his getSupply uses  .optional().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, \"No supply with id \" + id)).",
          hint: "Day 2: no row is not an error to MySQL.",
          check: {
            question: "What does the customer get?",
            choices: [
              "500: no row means the server broke",
              "200 with null",
              "404 with  No supply with id 9",
            ],
            answer: 2,
            explain: "A planned 404 with the planned message.",
          },
        },
        {
          task: "His purchases table was made with  purchase_id INT PRIMARY KEY  and no AUTO_INCREMENT. His INSERT doesn't mention purchase_id.",
          hint: "Day 3: the same trap as your own sales table.",
          check: {
            question: "What does the first order answer?",
            choices: [
              "500, with error code 1364: Field 'purchase_id' doesn't have a default value",
              "201",
              "400",
            ],
            answer: 0,
            explain: "The counter has to be declared on the column. ALTER TABLE purchases MODIFY purchase_id INT AUTO_INCREMENT; fixes it.",
          },
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own question for the ledger",
      intro:
        "Teach your orders API one more trick. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own, and build it with what the week has taught. Write and run the SELECT in queries.sql first. Ideas: (1) GET /api/snacks/{id}/orders lists the orders for ONE snack (the same JOIN with  WHERE sales.snack_id = ?  and  .param(id)), and answers 404 'No snack with id …' for a snack that doesn't exist (call getSnack(id) first); (2) GET /api/orders/latest answers the newest order only (ORDER BY sales.sale_id DESC, then the first item of the list), with a 404 if there are none; (3) GET /api/orders/between?from=2026-08-10&to=2026-08-12 lists the orders with  WHERE sales.sold_on >= ? AND sales.sold_on <= ?  and two .param calls, in order; (4) GET /api/orders/big lists the orders with a quantity of 10 or more (WHERE sales.qty >= 10, the 10 typed in the SQL); (5) GET /api/orders/biggest answers the one order with the highest total (ORDER BY total DESC, then the first item; MySQL lets ORDER BY use the AS name), 404 if there are none; (6) on orders.html (Week 7), show the date of each order as a new column: add  sales.sold_on  to the three SELECTs, a sixth field  String sold_on  to the Order record, and one more  <th>  and  <td>  to the page (a new key is allowed, a renamed one is not); (7) harder: GET /api/orders/between answers 400  from must not be after to  when the dates are the wrong way round: compare the two Strings with  from.compareTo(to) > 0  before any SQL runs.",
          hint:
            "Keep every checkpoint passing: don't rename a key, don't change a status code. Copy the JOIN from listOrders, add your WHERE, and keep the AS names so .query(Order.class) still maps. In Part 2 the total is  sales.qty * COALESCE(sales.price_paid, snacks.price) AS total:  copy that line, not the older one. For idea 2, .list() gives a list: .get(0) is its first item, but only after you check the list isn't empty. Test each new address by opening it in the browser.",
        },
        {
          task: "Paste what you added: the new Java lines (and which file), the SQL you ran first, how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I opened /api/orders/latest and it answered my newest Kutsinta order.'",
          input: "Paste your new lines, the SQL, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-hidden-total",
    title: "⚔️ Boss battle: The Hidden Total",
    intro: "The Hidden Total isn't stored anywhere, so you can't find it in a table. Make it appear.",
    boss: { name: "the Hidden Total", emoji: "🧮" },
    questions: [
      {
        prompt: "What does  sales.sale_id AS order_id  do?",
        choices: ["Renames the column in the table", "Labels the column in the RESULT as order_id", "Copies the column"],
        answer: 1,
        explain: "The table is untouched. Only the result carries the new label.",
      },
      {
        prompt: "How does the app produce each order's total?",
        choices: [
          "It reads a stored total column",
          "The SELECT calculates qty * price and labels it AS total",
          "The browser multiplies",
        ],
        answer: 1,
        explain: "Calculated on the way out, never stored.",
      },
      {
        prompt: "Why does the orders board show sales from Week 3?",
        choices: [
          "They are in the same sales table, and the JOIN returns every sale that has a snack",
          "Spring copied them",
          "The browser remembered them",
        ],
        answer: 0,
        explain: "One ledger for Weeks 3, 4 and 8.",
      },
      {
        prompt: "A sale has snack_id NULL. With INNER JOIN, what happens to it on the board?",
        choices: ["Shown with a blank name", "It is left out", "The app crashes"],
        answer: 1,
        explain: "No partner, no row. The 404 for that id is on purpose.",
      },
      {
        prompt: "getOrder's pattern is…",
        choices: [
          "SELECT … WHERE key = ?, .param, .optional(), orElseThrow with a 404",
          "A loop over a list",
          ".single() with no check",
        ],
        answer: 0,
        explain: "Same five lines as getSnack.",
      },
      {
        prompt: "A text block's opening quotes must be…",
        choices: [
          "Followed by the SQL on the same line",
          "The last thing on their line: the text starts on the next line",
          "On a line of their own, with the closing quotes",
        ],
        answer: 1,
        explain: "javac: 'illegal text block open delimiter sequence, missing line terminator'.",
      },
      {
        prompt: "You give listOrders a String date parameter. What else must change?",
        choices: ["Nothing", "Every caller: summary() must now call listOrders(null)", "The record Order"],
        answer: 1,
        explain: "A method's parameters are part of how it is called.",
      },
      {
        prompt: "Restart the app after placing an order. The board shows…",
        choices: [
          "An empty list",
          "The order, because it was written to the sales table",
          "Only the Week 3 sales",
        ],
        answer: 1,
        explain: "The ledger outlives the program.",
      },
      {
        prompt: "Banana cue cost 15 when 4 were sold, and costs 20 today. A total calculated from today's price says 80 for that old sale. What fixes this?",
        choices: [
          "Storing the price paid with the sale (price_paid), so the total uses what the customer actually paid",
          "Deleting the old sale",
          "Never changing a price",
        ],
        answer: 0,
        explain: "Real ledgers store the price at the time of sale. A calculation over a fact that has changed rewrites history.",
      },
      {
        prompt: "?date=abc answers 500 'Incorrect DATE value'. What is the better answer?",
        choices: [
          "200 with an empty list",
          "400: the customer's date is malformed",
          "404: no such date",
        ],
        answer: 1,
        explain: "A bad request is the caller's fault: 4xx. 5xx means the server broke.",
      },
      {
        prompt: "/api/summary sums the totals in a Java loop, not with SQL SUM. Why?",
        choices: [
          "SUM doesn't exist",
          "Unit 1 never taught aggregates, and the loop uses only what you know",
          "Loops are faster",
        ],
        answer: 1,
        explain: "Both work. SUM and GROUP BY are a later lesson.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: how does one row of the sales table become one JSON order, step by step? Name the JOIN, the AS and the calculation.",
      "Why does the orders board now show sales you never placed from the website?",
      "What did you learn from the sale with no snack?",
      "Why a total calculated from today's price is wrong after a price change, and what price_paid and COALESCE do about it.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "No Java list is left in your orders, and an old sale keeps the price it was sold at. Tomorrow the tables page switches from rows you typed to rows from your own Week 3 JOIN, you clean up, audit the whole app, and hand it in.",
  },
};
