// unit3-week9 · Day 2 — Change an order: PUT /api/orders/{id}, and a price that must not move
//
// PUT /api/orders/{id} takes {qty} and runs UPDATE sales SET qty = ? WHERE sale_id = ?
// AND snack_id IS NOT NULL, then answers with getOrder(id) (so the total in the answer is
// the one the database calculates, COALESCE(price_paid, price) × qty). 400 for qty outside
// 1 to 20 (checked first), 404 "No order with id N" when the count is 0. The price paid is
// never touched: the lab proves it on Week 8's history sale (Kutsinta, 2000-01-03, price
// paid 7). AND snack_id IS NOT NULL keeps PUT in step with GET /api/orders/{id}: Week 3's
// sale with no snack is not an order (GET says 404), and without the guard a PUT would
// change its qty and THEN answer 404 (observed: sale 7 went to qty 4, answer 404).
// Observed on a real build (2026-11-03):
//  - history sale qty 2 → 3: total 14 → 21 (3 × 7), price_paid stays 7; putting 2 back
//    restores 14; an order placed today at 10, changed to 19 → total 190;
//  - qty 0 and 21 → 400 "qty must be from 1 to 20" even for an order that doesn't exist
//    (the check runs first); PUT /api/orders/99999 qty 3 → 404 "No order with id 99999";
//  - PUT /api/orders/7 (no snack) qty 4 → 404, qty stays 1; with the guard removed → 404 AND
//    the stored qty becomes 4;
//  - swapped .param calls (id first, qty second) change the WRONG sale and answer with the
//    unchanged order: see the clinic.
// Videos (transcripts read 2026-11-03):
//  - Be Software Engineer, "ResponseEntity & HTTP Status Codes in Spring Boot" (E275p1GgFQ8,
//    5:49): the status table (GET/PUT 200, POST 201, DELETE 204, missing 404). ResponseEntity
//    is a second way to set a status; this course uses ResponseStatusException/@ResponseStatus.
//  - Frontend Techies, "Handle PUT and Delete request in Javascript Fetch API" (QC2fZqKcgZQ,
//    13:54): PUT part 0:32–9:00 today (the DELETE part is Day 3). It uses a fake API, never checks
//    response.ok, and says header names must be capitalised (they are not case-sensitive).

import type { DayPlan } from "../../types";
import { day2Part2 } from "./day2-part2";
import { EX, PREV } from "./captured";
import {
  HISTORY_PRICE_KEPT,
  PUT_ORDER_MISSING,
  PUT_ORDER_ROUNDTRIP,
  consolePut,
} from "./commands";
import {
  CONTROLLER_D2,
  SQL_CLEAN_TEST_ORDERS,
  UPDATE_ORDER,
} from "./snippets";

const SQL = "Ctrl+E, then Ctrl+E again";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "Change an order's quantity: PUT /api/orders/{id}, the same 404 idea, and a price paid that stays put",
  warmupGame: {
    kind: "quest",
    id: "warmup-order-change",
    title: "✏️ Warm-up: what may a change touch?",
    intro: "Yesterday's PUT replaced a snack's two editable columns. An order is different: some of what it holds must never change.",
    missions: [
      {
        task: "A sale has these columns: sale_id, snack_id, sold_on, qty, price_paid. A customer says 'I ordered 3, not 2'. Last week you stored the price paid with each sale so that history doesn't move when a price does.",
        hint: "Which column holds the count of snacks? Which columns say WHAT was sold, WHEN, and at WHAT price?",
        check: {
          question: "Which column should the change touch?",
          choices: [
            "qty only",
            "qty and price_paid, so the total is recalculated",
            "Every column",
          ],
          answer: 0,
          explain: "The customer is correcting a count. The snack, the day and the price they paid were true when the sale was made; only the count was wrong.",
        },
      },
      {
        task: "The orders list shows a total for each order, and it isn't a column: Week 8 calculates it as qty × COALESCE(price_paid, price). So after you change qty, the total should follow by itself.",
        hint: "Week 8 Day 4 Part 2: where does total come from?",
        check: {
          question: "Does the app need to UPDATE the total?",
          choices: [
            "Yes: it must write the new total",
            "No: the total is calculated by the SELECT every time, so changing qty is enough",
            "Yes, but only for old sales",
          ],
          answer: 1,
          explain: "A value that can be calculated shouldn't be stored twice, because two copies can disagree. Change qty and every list and receipt is right.",
        },
      },
      {
        task: "Week 8 found that one sale in your ledger has no snack (snack_id is NULL): an INNER JOIN drops it, so GET /api/orders/{its number} answers 404 'it isn't an order'. Now think about an UPDATE aimed at that sale's number.",
        hint: "UPDATE sales SET qty = 4 WHERE sale_id = N: does that statement know about the JOIN, or about 'orders'?",
        check: {
          question: "What does a plain  UPDATE sales SET qty = ? WHERE sale_id = ?  do to that sale?",
          choices: [
            "Nothing: it isn't an order",
            "It changes it: the UPDATE only sees the sales table, and a sale is a sale",
            "It is refused with an error",
          ],
          answer: 1,
          explain: "The UPDATE doesn't know the app's idea of an order. Today's endpoint adds  AND snack_id IS NOT NULL  so PUT agrees with GET about what an order is.",
        },
      },
    ],
  },
  videos: [
    {
      title: "ResponseEntity and HTTP status codes in Spring Boot (Be Software Engineer)",
      youtubeId: "E275p1GgFQ8",
      length: "5:49",
      practice: {
        intro: "Watch it all. He sets statuses with ResponseEntity; you set them with  throw new ResponseStatusException(…)  and  @ResponseStatus(…),  which do the same job in the code you already have. Take his table of which verb gets which status.",
        steps: [
          "Write his table of verbs and statuses in notes.md (GET, POST, PUT, DELETE and a missing id).",
          "He says a missing id gives 404. Write which line of YOUR updateSnack from yesterday decides that, and what it reads to decide.",
        ],
        note: "His 404 comes from a null check on something a repository returns. Yours comes from the count .update() returns. Postman appears in his tasks: you have the console instead.",
      },
    },
    {
      title: "Handle PUT and DELETE requests with the JavaScript Fetch API (Frontend Techies)",
      youtubeId: "QC2fZqKcgZQ",
      length: "13:54",
      practice: {
        intro: "Watch only 0:32 to 9:00 today: fetch with method \"PUT\", the headers, and JSON.stringify(...) for the body, with the request shown in the browser's Network tab. The DELETE part (9:00 on) is Wednesday's.",
        steps: [
          "Write in notes.md: the three things inside the second argument of his fetch for a PUT (method, headers, body), and which one tells the server the body is JSON.",
          "Compare with the fetch in yesterday's edit-snack.js: write one difference you can find (hint: he doesn't check response.ok, and you do).",
        ],
        note: "He calls a fake test API, not yours, and says header names must be capitalised: they are not case-sensitive, so Content-Type and content-type are the same. He never checks response.ok; your pages always do.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: PUT /api/orders/{id}",
      intro:
        "One new method, built on yesterday's idea: the count .update() returns. Restart after every change to a .java file. The qty check (1 to 20) stays in front, as in placeOrder.",
      missions: [
        {
          task:
            "SQL first, on the test sale from Week 8 (Kutsinta, 2000-01-03, price paid 7). In queries.sql run these, one at a time (" +
            SQL +
            "), and write in notes.md what each one showed:\n\nSELECT sale_id, snack_id, qty, price_paid FROM sales WHERE snack_id = 90 AND sold_on = '2000-01-03';\n\nThen, using the sale_id you just read in place of the words THE_SALE_ID (type the number; it is your own):\n\nUPDATE sales SET qty = 3 WHERE sale_id = THE_SALE_ID;\n\nSELECT sale_id, qty, price_paid FROM sales WHERE sale_id = THE_SALE_ID;\n\nand put it back:\n\nUPDATE sales SET qty = 2 WHERE sale_id = THE_SALE_ID;",
          hint:
            "Read the sale_id from your own first SELECT, as your own number. The row's qty goes 2, 3, 2, and price_paid stays 7 the whole time, because the UPDATE named only qty in its SET.",
          check: {
            question: "After the first UPDATE, what is price_paid on that sale?",
            choices: [
              "Still 7: SET named only qty, so no other column is touched",
              "NULL: UPDATE clears the columns it doesn't mention",
              "3, the new quantity",
            ],
            answer: 0,
            explain: "An UPDATE changes only the columns in its SET, in only the rows its WHERE chooses. That's what lets the app change a quantity without touching the price paid.",
          },
        },
        {
          task:
            "Add the endpoint. The import  PutMapping  is already there from yesterday. Inside SnackController, as the very last thing, just above the final closing brace, type the record and the method. Read the SQL aloud: UPDATE sales, SET qty to this, WHERE the sale is this one AND it has a snack. The method ends by returning getOrder(id), the method you wrote in Week 7 and rewrote in Week 8, so the answer carries the total MySQL calculates:\n\n" +
            UPDATE_ORDER +
            "\n\nRestart the app.",
          hint:
            "The checks come in the same order as placeOrder: qty first, then the write, then the 404. If getOrder is red, you are outside the class. If a console line answers 404 'No order with id N' for an order you just placed, the guard or the .param order is wrong: the first .param is qty and the second is the sale number.",
          check: {
            question: "Why does updateOrder end with  return getOrder(id);  and not  return new Order(…)  built from the request?",
            choices: [
              "Java requires it",
              "getOrder reads the row back, so the answer shows what MySQL really has: the new qty and the total it calculated",
              "getOrder is faster",
            ],
            answer: 1,
            explain: "An answer built from the request only repeats what was sent. Reading the row back proves the UPDATE happened and shows the calculated total.",
          },
        },
        {
          task:
            "Test it with an order of your own. This line places an order of 2 Kutsinta, then changes THAT order (the number the app just gave it) to 19, and prints the answer. In the Console of localhost:8080/menu.html run it and read what it prints:\n\nfetch(\"/api/orders\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 90, qty: 2 }) }).then(r => r.json()).then(o => fetch(\"/api/orders/\" + o.order_id, { method: \"PUT\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ qty: 19 }) })).then(r => r.text()).then(console.log)\n\nThen open localhost:8080/orders.html and find the order. The quantity 19 is on purpose, as in Week 8: it marks a test order, which you delete at the end of the day with  " +
            SQL_CLEAN_TEST_ORDERS,
          hint:
            "The answer is the order with qty 19 and a total of 19 times Kutsinta's price. orders.html shows the same after a refresh. If you get a 405, the method isn't registered or the app wasn't restarted.",
          check: {
            question: "The answer shows total 190 (19 × 10). Where was that total calculated?",
            choices: [
              "In updateOrder, in Java",
              "In the browser",
              "By getOrder's SELECT: qty × COALESCE(price_paid, price), after the UPDATE changed qty",
            ],
            answer: 2,
            explain: "The UPDATE changes one column. The calculation lives in the SELECT, so every endpoint that shows an order agrees.",
          },
        },
        {
          task:
            "The refusals, from the Console of localhost:8080/menu.html. Write the status and the answer of each in notes.md.\n\nqty 0:\n\n" +
            consolePut('"/api/orders/99999"', '{ qty: 0 }') +
            "\n\nqty 21:\n\n" +
            consolePut('"/api/orders/99999"', '{ qty: 21 }') +
            "\n\nqty 3 on an order that doesn't exist:\n\n" +
            consolePut('"/api/orders/99999"', '{ qty: 3 }'),
          hint:
            "The first two are 400 qty must be from 1 to 20, even though order 99999 doesn't exist: the qty check runs first, like in placeOrder. The third is 404 No order with id 99999. Chrome prints its own red line for a 4xx: that is the browser reporting the status, not a mistake.",
          check: {
            question: "qty 0 for order 99999 answered 400, not 404. Which check ran first?",
            choices: [
              "The count check",
              "The qty check: it sits before the UPDATE, so it refuses bad values whether or not the order exists",
              "Neither: Spring decided",
            ],
            answer: 1,
            explain: "Check the request first, then touch the database. A refusal can't depend on what is in the table.",
          },
        },
        {
          task:
            "The price paid must not move. In the Console of localhost:8080/menu.html run the line below. It finds Week 8's history sale (Kutsinta, 2000-01-03, price paid 7), changes its quantity with your new endpoint, reads the total, and then puts the quantity back:\n\n" +
            HISTORY_PRICE_KEPT +
            "\n\nWrite down what it printed. Then answer in notes.md: Kutsinta costs 10 today, so what would the total have been if the app had used today's price?",
          hint:
            "The line prints qty_after, total_after and kept_price_paid_7. The total is the new qty times 7 (21 for qty 3), not times 10 (30). If it says false, your UPDATE touches more than qty, or getOrder isn't the COALESCE version.",
          check: {
            question: "Why is the total 7 times the quantity and not 10 times?",
            choices: [
              "The UPDATE copied 7 into qty",
              "The app remembers yesterday's price",
              "The sale keeps its own price_paid of 7, and the SELECT prefers it to today's price",
            ],
            answer: 2,
            explain: "That's last week's reason for storing the price paid. A correction to the quantity must not rewrite what the customer was charged per snack.",
          },
        },
        {
          task:
            "The sale with no snack. In queries.sql run  SELECT sale_id FROM sales WHERE snack_id IS NULL;  If it shows a number (Week 3's sale usually does), put your own number in place of N in this line and run it in the Console of localhost:8080/menu.html, then run the SELECT of that sale's qty again to see it didn't change:\n\nfetch(\"/api/orders/N\", { method: \"PUT\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ qty: 4 }) }).then(r => r.text()).then(console.log)\n\nSELECT sale_id, qty FROM sales WHERE sale_id = N;\n\nIf the first SELECT shows nothing, your ledger has no such sale: skip to the next mission.",
          hint:
            "The answer is 404 No order with id N, and the qty in the table is whatever it was before. The guard  AND snack_id IS NOT NULL  made the UPDATE match nothing. IS NULL is Week 2's word for 'has no value'; IS NOT NULL is its opposite.",
          check: {
            question: "Why does PUT answer 404 for a sale that really exists in the sales table?",
            choices: [
              "The sale was deleted",
              "The app's idea of an order is a sale WITH a snack: the guard makes the UPDATE ignore the others, so PUT and GET agree",
              "MySQL hides it",
            ],
            answer: 1,
            explain: "GET /api/orders/N says 404 for that sale, so PUT must too. Without the guard it would change the row and then answer 404 for a row it just changed (the clinic shows it).",
          },
        },
        {
          task:
            "Compare. After today's lab your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter). Then delete your test orders. WARNING first: this DELETE removes every Kutsinta sale of exactly 19, which is only your tests:\n\n" +
            SQL_CLEAN_TEST_ORDERS +
            "\n\n" +
            CONTROLLER_D2,
          hint: "Common differences: the record outside the class; the guard missing from the SQL; return getOrder(id) missing, so the method has no return; .param(id) before .param(change.qty()).",
        },
        {
          task:
            "Add Part 1 to notes.md: the statuses of the three refusals, what the history sale's total was before and after, and in one sentence why the endpoint changes only qty.",
          hint: "Write it in your own words. The last sentence is about the price paid and the total.",
          input: "Paste Part 1 of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-put-order",
      title: "🧪 Part 1 · Checkpoint: an order that really changes",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080), prints the answer and copies it; paste it here. The first task places an order of 2 Kutsinta and changes it to 19; remove such test orders at the end of the day with  " +
        SQL_CLEAN_TEST_ORDERS +
        "  Yesterday's app answers 405 to every PUT on an order, so it cannot pass any of these.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It orders 2 Kutsinta, changes the order to 19 with PUT, reads it back and checks the total. Paste what it copies.",
          command: PUT_ORDER_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "put_status", equals: 200, message: "The PUT should answer 200. A 405 means updateOrder isn't registered (restart, and check @PutMapping); a 404 for the order you just placed means the guard or the .param order is wrong." },
            { path: "qty", equals: 19, message: "The order read back should have qty 19. Is the first .param the quantity and the second the sale number?" },
            { path: "total_is_qty_times_price_paid", equals: true, message: "The total should be 19 times the price. Does updateOrder return getOrder(id) so the total is calculated from the stored row?" },
            { path: "others_unchanged", equals: true, message: "Another sale's quantity changed too! Check the UPDATE has  WHERE sale_id = ?  and the sale number as its second .param: without that WHERE every sale gets the new quantity. Put your quantities right in SQLTools (the history sale is 2000-01-03, qty 2) before going on." },
          ],
          hint: "The line places an order, PUTs qty 19, and asks for the order again. If qty is still 2, the UPDATE matched nothing or never ran.",
          solution: UPDATE_ORDER,
          example: EX.d2Roundtrip,
          previousStage: PREV.d2Roundtrip,
          explain: "One endpoint wrote it, another read it back: the quantity really changed in your sales table.",
        },
        {
          goal: "The price paid must not move. Run this line on a localhost:8080 page and paste what it copies. It changes the history sale's quantity (Kutsinta, 2000-01-03, price paid 7), reads the total, and puts the quantity back.",
          command: HISTORY_PRICE_KEPT,
          checks: [
            { is: "object", message: "This should be one small object starting with {. If it is a message that the history sale isn't in /api/sales, redo Week 8 Day 4 Part 2's history sale." },
            { path: "qty_changed", equals: true, message: "The quantity didn't change at all. Is the first .param the new quantity and the second the sale number?" },
            { path: "kept_price_paid_7", equals: true, message: "The total after the change should be the new quantity times 7, the price paid on that sale. If it is times 10, your UPDATE touches price_paid or getOrder isn't the COALESCE version." },
          ],
          hint: "SET qty = ? and nothing else, and the totals in getOrder must be qty * COALESCE(sales.price_paid, snacks.price).",
          solution: UPDATE_ORDER,
          example: EX.d2History,
          previousStage: PREV.d2History,
          explain: "A correction to a quantity left the price the customer paid alone.",
        },
        {
          goal: "A quantity that is too high, on an order that doesn't exist. Run this line on a localhost:8080 page and paste what it copies.",
          command: consolePut('"/api/orders/99999"', '{ qty: 25 }'),
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {." },
            { path: "status", equals: 400, message: "The status should be 400: the qty check runs before the UPDATE. A 404 means the check is missing or comes after the count test." },
            { path: "message", equals: "qty must be from 1 to 20", message: "The message should be exactly  qty must be from 1 to 20." },
          ],
          hint: "if (change.qty() < 1 || change.qty() > 20) at the top of the method, before any SQL.",
          solution: UPDATE_ORDER,
          example: EX.d2Qty25,
          previousStage: PREV.d2Qty25,
          explain: "The request is refused whether or not the order exists.",
        },
        {
          goal: "An order that doesn't exist. Run this line on a localhost:8080 page and paste what it copies. It also compares the whole sales table before and after.",
          command: PUT_ORDER_MISSING,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "status", equals: 404, message: "The status should be 404. A 200 means the count isn't checked; a 500 means read the terminal." },
            { path: "message", equals: "No order with id 99999", message: "The message should be exactly  No order with id 99999  with the number in it." },
            { path: "nothing_changed", equals: true, message: "A sale changed although order 99999 doesn't exist: the UPDATE has no WHERE (or the wrong one), so it changed other sales, and getOrder only said 404 afterwards. Put your quantities right in SQLTools, then fix the WHERE." },
          ],
          hint: "int changed = …update();  if (changed == 0) throw 404 \"No order with id \" + id.",
          solution: UPDATE_ORDER,
          example: EX.d2NotFound,
          previousStage: PREV.d2NotFound,
          explain: "Yesterday's idea, on a second table: zero rows changed means no such order.",
        },
      ],
    },
    ...day2Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five students, five orders",
      intro: "For each patient, say what is wrong and what you would change. Two of them involve a change that went to the WRONG row, which is the dangerous kind: nothing complained.",
      missions: [
        {
          task: "Patient 1. The page sends  {\"quantity\": 5}  and the answer is a 400 starting  JSON parse error: Cannot map `null` into type `int`.  The order didn't change.",
          hint: "OrderChange has one field. What is it called, and which key did the page send?",
          check: {
            question: "What is wrong?",
            choices: [
              "The key must be spelt qty, the record's field name: Spring found no qty, and an int can't be null",
              "The order doesn't exist",
              "MySQL refused 5",
            ],
            answer: 0,
            explain: "The record's field names are the JSON keys, exactly. Extra keys are ignored, so a misspelling shows up as a MISSING key.",
          },
        },
        {
          task: "Patient 2. A student's updateOrder has these lines:  .param(id)  then  .param(change.qty()).  The SQL is  SET qty = ? WHERE sale_id = ?.  PUT /api/orders/30 with qty 3 answers 200 with order 30 completely unchanged. Later the student notices that a DIFFERENT order, number 3, now has qty 30.",
          hint: "The first ? is qty, the second is the sale number. Which value did .param(id) put in the first?",
          check: {
            question: "What happened?",
            choices: [
              "The marks were filled in order: qty became 30 (the id) and the WHERE looked for sale 3 (the qty), so another order changed and the answer never noticed",
              "MySQL changed the wrong row on its own",
              "The page sent the wrong number",
            ],
            answer: 0,
            explain: "Two int columns swapped is the silent kind of bug: no error, a plausible answer, and the damage in another row. Always read the TABLE after a write, and prefer a test that checks the order you meant to change.",
          },
        },
        {
          task: "Patient 3. The student deleted  AND snack_id IS NOT NULL  because 'it looked unnecessary'. Now PUT /api/orders/N for the sale with no snack answers 404 No order with id N, which looks right. But SELECT of that sale shows its qty is now 4.",
          hint: "Which happens first, the UPDATE or the getOrder at the end? What does getOrder do for a sale with no snack?",
          check: {
            question: "What is the problem?",
            choices: [
              "Nothing: 404 is the right answer",
              "MySQL is slow",
              "The UPDATE changed the row (a sale is a sale to the UPDATE), and then getOrder, which only knows orders, answered 404: the customer was told 'not found' after a change was made",
            ],
            answer: 2,
            explain: "A write followed by a refusal is the worst order of events. The guard makes the UPDATE refuse at the same moment GET would.",
          },
        },
        {
          task: "Patient 4. The board changes the quantity and writes 'Order 40 now has 19 × Kutsinta = ₱190' under the table, but the row in the table still says 2 and ₱20 until the student presses Refresh.",
          hint: "Which function draws the rows? Where in changeQty would it need to be called?",
          check: {
            question: "What is missing in changeQty?",
            choices: [
              "A restart of the app",
              "A call to loadOrders() after a successful change, so the table asks the app again",
              "A second PUT",
            ],
            answer: 1,
            explain: "The page draws from what it last fetched. After a change, fetch again: the table is then the truth, not a memory of it.",
          },
        },
        {
          task: "Patient 5. The student's change box says 25 and the Change button is pressed. The browser doesn't stop them, though the box says max=\"20\". The message line says 'Sorry: qty must be from 1 to 20'.",
          hint: "Is the Change button inside a form? What decides when a browser checks min and max?",
          check: {
            question: "Why didn't the box's max stop the request, and which layer did?",
            choices: [
              "The box's min and max are only checked when a FORM is submitted, and this button isn't in a form; the app's own check refused it",
              "max doesn't work on number boxes",
              "The app has no check",
            ],
            answer: 0,
            explain: "Browser checks belong to forms. A button that calls fetch skips them, which is one more reason the app must check by itself.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you would check, and then your rule for what to do after ANY change that went wrong: which table do you read, and what do you compare it with?",
          hint: "Patients 2 and 3 are both solved by looking at the table. Which rows?",
          input: "Paste your five notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own order change",
      intro:
        "Make the canteen correct one more thing about an order. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Ideas: (1) print each change to the terminal with System.out.println(\"Order \" + id + \" now \" + change.qty()) before the return; (2) in orders.js's changeQty, refuse on the page without calling the app when the new quantity equals the current one (write a message such as 'Nothing to change'); (3) make the message say what it WAS:  Order 40: 2 → 19  (pass the old quantity into changeQty as a third argument); (4) a message in orders.js when the box is empty (Number(\"\") is 0, so the app would answer 400: catch it on the page first); (5) harder: a staff endpoint  PUT /api/sales/{id}/date  taking  {\"sold_on\": \"2000-01-05\"}  that changes the date of a sale, refusing text that isn't a date with a 400 (use LocalDate.parse inside try { … } catch (DateTimeParseException e) { … } and pass the text to the UPDATE).",
          hint:
            "Keep every checkpoint passing: don't change updateOrder's answers. Test a new endpoint in the Console with a fetch like today's. For idea 5, remember what Week 8 observed about a bad date reaching MySQL (a 500): refusing it yourself turns it into a 400. Put any date you change back afterwards.",
        },
        {
          task: "Paste what you added: the new lines (and which file), how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I changed order 40 to 19 on the board and the message said 2 → 19.'",
          input: "Paste your new lines, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-wrong-total",
    title: "⚔️ Boss battle: The Wrong Total",
    intro: "The Wrong Total changes the price when it should only change the count. Keep each change to the column that was meant.",
    boss: { name: "the Wrong Total", emoji: "🧮" },
    questions: [
      {
        prompt: "In  UPDATE sales SET qty = 3 WHERE sale_id = N,  what happens to price_paid?",
        choices: ["It becomes 3", "It becomes NULL", "It stays as it was"],
        answer: 2,
        explain: "Only the columns in SET change, and only in the rows WHERE chooses.",
      },
      {
        prompt: "Why does PUT /api/orders/{id} change only qty?",
        choices: [
          "Because a correction of the count shouldn't change what was sold, when, or the price paid",
          "Because MySQL allows only one column",
          "Because PUT can't have a body",
        ],
        answer: 0,
        explain: "The other columns were true when the sale was made.",
      },
      {
        prompt: "The orders list's total isn't stored. After qty changes, how does the total change?",
        choices: [
          "updateOrder writes it",
          "A trigger writes it",
          "It doesn't need to: every SELECT calculates qty × the price paid",
        ],
        answer: 2,
        explain: "A calculated value is never stored twice, so it can't disagree with itself.",
      },
      {
        prompt: "What does  AND snack_id IS NOT NULL  do in the UPDATE?",
        choices: [
          "Makes it faster",
          "Keeps PUT in step with GET: a sale with no snack isn't an order, so the UPDATE ignores it",
          "Stops duplicate orders",
        ],
        answer: 1,
        explain: "Without it the sale would be changed and then answered with a 404.",
      },
      {
        prompt: "A PUT for qty 0 on an order that doesn't exist. What does the finished app answer?",
        choices: [
          "400: the qty check runs first",
          "404: the order isn't there",
          "200",
        ],
        answer: 0,
        explain: "Refusing a bad request never depends on what's in the table.",
      },
      {
        prompt: "The price paid of the history sale is 7 and Kutsinta costs 10 today. The quantity changes from 2 to 3. What is the total?",
        choices: ["30", "14", "21"],
        answer: 2,
        explain: "3 × 7: the sale keeps the price it was made at.",
      },
      {
        prompt: "Why does updateOrder end with  return getOrder(id)?",
        choices: [
          "To save typing",
          "Because Java needs a return",
          "To answer with the row as MySQL now has it, total included, and not a copy of the request",
        ],
        answer: 2,
        explain: "Read it back: only the table tells the truth.",
      },
      {
        prompt: "Two .param calls are swapped in an UPDATE of two int columns. What happens?",
        choices: [
          "MySQL refuses",
          "The wrong row gets the wrong value and the app answers as if all were well",
          "The app restarts",
        ],
        answer: 1,
        explain: "That is why you read the table after writing, not just the answer.",
      },
      {
        prompt: "A button that calls fetch has  min=\"1\" max=\"20\"  on its box. Does the browser enforce them?",
        choices: [
          "No: only a form's submit checks them, so the app's own check must",
          "Yes, always",
          "Only in Chrome",
        ],
        answer: 0,
        explain: "Browser checks belong to forms. The app's check is the one you can count on.",
      },
      {
        prompt: "After a successful change, the board must call loadOrders(). Why?",
        choices: [
          "To restart the app",
          "To clear the message line",
          "So the table is drawn again from what the app now says, not from the old list",
        ],
        answer: 2,
        explain: "A page that shows a list should fetch the list again after changing it.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what happens, step by step, from pressing Change on the orders board to a new total in the table. Name the verb and every layer.",
      "Which columns does updateOrder change, which does it deliberately leave alone, and why?",
      "What does  AND snack_id IS NOT NULL  do, and what would happen without it?",
      "The history sale's total before and after you changed its quantity, and why it didn't use today's price.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "You can now correct an order. Tomorrow an order can be cancelled altogether: DELETE, a 204 with nothing in it, and the habit that stops a DELETE from emptying a table.",
  },
};
