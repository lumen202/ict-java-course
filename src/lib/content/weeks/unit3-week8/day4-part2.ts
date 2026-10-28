// unit3-week8 · Day 4, Part 2 — "the price at the time of sale"
//
// Part 1 calculates every total from TODAY's price (sales.qty * snacks.price). The
// reviews pointed out that this rewrites history whenever a price changes, and the
// first version of this day wrongly called it "right every time". Part 2 fixes it
// the way real ledgers do:
//  - ALTER TABLE sales ADD COLUMN price_paid INT (ADD COLUMN is Week 1 Day 4);
//    every existing sale gets NULL: its true price is unknown;
//  - placeOrder stores the snack's current price in price_paid;
//  - the JOIN's total is qty * COALESCE(price_paid, price): COALESCE (new, taught as
//    one small idea; nothing in Unit 1 uses it) returns its first value that isn't
//    NULL, so a sale with no price_paid still falls back to today's price;
//  - the keys and meaning of `total` do not change, and /api/sales does not gain a
//    key (its shape is Day 1's promise).
// The calculation lives in THREE SELECTs (the whole list, the ?date= list inside
// listOrders, and getOrder), so the checkpoint has a task for each copy.
// Observed on a real Spring Boot 4.1.1 + MySQL 8.0 build:
//  - ADD COLUMN price_paid INT leaves every old row NULL;
//  - COALESCE(NULL, 5) = 5 and COALESCE(7, 5) = 7; an old sale's total still follows
//    the snack's current price, a new sale's total stays at the price it was sold at;
//  - ORDER BY total DESC LIMIT 1 works on an AS name in MySQL 8;
//  - a sale inserted with price_paid 7 for Kutsinta (price 10), qty 2 → total 14 from
//    /api/orders and /api/orders/{id}, 20 from Part 1's SELECT;
//  - after UPDATE snacks SET price = 15 and an order of 1 Kutsinta, the order's total
//    is 15 and stays 15 after the price goes back to 10, while NULL-price sales show 10.

import type { DayGame } from "../../types";
import {
  CONTROLLER_D4,
  GET_ORDER_D4_PAID,
  INSERT_BLOCK_PAID,
  LAB_SNACK,
  LIST_ORDERS_D4_PAID,
  PLACE_ORDER_D4_PAID,
  SQL_JOIN_PAID,
} from "./snippets";
import { FETCH_ORDER_BY_HISTORY_SALE, FETCH_SUMMARY_AGREES, SQL_RUN } from "./commands";

const HISTORY_SALE = "INSERT INTO sales (snack_id, sold_on, qty, price_paid) VALUES (90, '2000-01-03', 2, 7);";

export const day4Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-price-paid",
    inline: true,
    title: "🛠️ Part 2 · Lab: the price at the time of sale",
    intro:
      "Part 1's totals follow today's price. Part 2 makes the ledger remember what each customer actually paid. You will see the problem first, add one column, teach the JOIN to use it, change placeOrder to fill it, and prove that an old order's total no longer moves when a price does. The price experiments are on " +
      LAB_SNACK +
      " only, and always end with its price back at 10. Restart after every change to a .java file.",
    missions: [
      {
        task:
          "See the problem. Open localhost:8080/api/orders and find your Kutsinta orders (Monday's test sale, qty 7, says total 70). Then run:\n\nUPDATE snacks SET price = 15 WHERE snack_id = 90;\n\nReload /api/orders. Look at the same Kutsinta orders. Then put the price back, ALWAYS on Kutsinta and ALWAYS to 10:\n\nUPDATE snacks SET price = 10 WHERE snack_id = 90;",
        hint: "No restart needed: only the table changed. The qty 7 order read 70 before and 105 after (7 × 15), and goes back to 70 when the price is 10 again.",
        check: {
          question: "The Kutsinta orders from Monday were sold at ₱10. After the UPDATE, what does their total say?",
          choices: [
            "70, because nothing was reordered",
            "105: the total is calculated from the CURRENT price, so history was rewritten",
            "An error",
          ],
          answer: 1,
          explain: "A real canteen's old receipts don't change when tomorrow's price does. The ledger must remember what was paid. That means storing the price with the sale.",
        },
      },
      {
        task:
          "Add the column. You met ALTER TABLE … ADD COLUMN in Week 1. Run once, then look at the table (" +
          SQL_RUN +
          "):\n\nALTER TABLE sales ADD COLUMN price_paid INT;\n\nSELECT * FROM sales ORDER BY sale_id DESC;",
        hint: "If it says Duplicate column name 'price_paid', you already ran it: that's fine, go on. Every existing sale has NULL in the new column.",
        check: {
          question: "Every sale you already had shows NULL in price_paid. What does NULL mean here?",
          choices: [
            "The price was 0",
            "Unknown: nobody wrote down the price at the time, so the ledger can't say",
            "The sale was cancelled",
          ],
          answer: 1,
          explain: "NULL is 'unknown', as in Week 3. Old sales can't be corrected, because the real price is lost. New sales will carry theirs.",
        },
      },
      {
        task:
          "One new SQL idea: COALESCE. COALESCE(a, b) returns a if a is not NULL, otherwise b. Run these two and write what they return:\n\nSELECT COALESCE(NULL, 5), COALESCE(7, 5);\n\nSELECT sale_id, price_paid, COALESCE(price_paid, 99) FROM sales ORDER BY sale_id;\n\nThen run the join with the new calculation, and compare its totals with the Part 1 query's:\n\n" +
          SQL_JOIN_PAID,
        hint: "COALESCE(NULL, 5) is 5 and COALESCE(7, 5) is 7: it picks the first value that isn't NULL. In the join, price_paid is NULL for every old sale, so each total falls back to snacks.price and equals the Part 1 total.",
        check: {
          question: "In  sales.qty * COALESCE(sales.price_paid, snacks.price) ,  what price does a sale use if price_paid is NULL?",
          choices: [
            "None: the total is NULL",
            "Zero",
            "The snack's price today",
          ],
          answer: 2,
          explain: "So old sales still look like Part 1, and new sales (which will have a price_paid) use what was paid. Both cases in one formula.",
        },
      },
      {
        task:
          "Make new orders remember their price. Delete the whole placeOrder method and type this in its place. The INSERT gets a fourth column and a third ? with the snack's price at this moment:\n\n" +
          PLACE_ORDER_D4_PAID +
          "\n\nThe changed block alone, to see it clearly:\n\n" +
          INSERT_BLOCK_PAID,
        hint: "Three ?: snack_id, qty, price_paid, filled by three .param calls in that order. snack.price() is the price MySQL returned a moment ago from getSnack. If you swap two .param calls nothing complains and the wrong number is stored: check with a SELECT.",
        check: {
          question: "Why does placeOrder store snack.price() instead of letting the JOIN look the price up later?",
          choices: [
            "Because MySQL can't read the snacks table",
            "Because a later lookup would find the price of THAT day, not the price of the day of the sale",
            "Because it is faster",
          ],
          answer: 1,
          explain: "The row records what was true at the moment of the sale. Tomorrow's price changes can't touch it.",
        },
      },
      {
        task:
          "Teach the board to use it. Delete the whole listOrders method and type this in its place, then delete getOrder and type its new version. Both only changed the total line:\n\n" +
          LIST_ORDERS_D4_PAID +
          "\n\n" +
          GET_ORDER_D4_PAID +
          "\n\nRestart. Open localhost:8080/api/orders and orders.html: the totals are the same as before.",
        hint: "Three copies of the calculation must change in step: the whole-list query, the date query inside listOrders, and getOrder's query. If one still says qty * snacks.price, that endpoint ignores the stored price. The placeOrder answer is not changed: it builds its own total from the price it just read.",
        check: {
          question: "Why are the totals on the board still the same as before the change?",
          choices: [
            "Nothing was saved",
            "The page cached them",
            "Every existing sale has price_paid NULL, and COALESCE falls back to the current price, which hasn't changed yet",
          ],
          answer: 2,
          explain: "The formula is backwards-compatible: it does nothing different until a sale has a price_paid. That makes it safe to deploy over an old ledger.",
        },
      },
      {
        task:
          "Insert a sale from the past, with its price. Pretend Kutsinta cost 7 on the third of January 2000. First run the SELECT. Only if it returns NO rows, run the INSERT after it, once:\n\nSELECT * FROM sales WHERE sold_on = '2000-01-03';\n\n" +
          HISTORY_SALE +
          "\n\nThen open localhost:8080/api/orders?date=2000-01-03 (the date filter from Part 1, now with the new total).",
        hint: "The sale is 2 Kutsinta, each sold at 7. The answer's total is 14 even though Kutsinta costs 10 today: the stored 7 wins over the current price. If you ran the INSERT twice, run  DELETE FROM sales WHERE sold_on = '2000-01-03';  (only this test sale has that date) and insert once.",
        check: {
          question: "Kutsinta costs 10 today. What does the order dated 2000-01-03 show as its total?",
          choices: [
            "20, because 2 × 10",
            "7",
            "14, because the ledger remembers it was sold at 7",
          ],
          answer: 2,
          explain: "The row's price_paid is not NULL, so COALESCE uses it. Today's price is ignored for this sale, forever.",
        },
      },
      {
        task:
          "The proof. (1) Run  UPDATE snacks SET price = 15 WHERE snack_id = 90;  (2) On order.html order 1 Kutsinta (quantity 1): the receipt says ₱15. (3) Put the price back: UPDATE snacks SET price = 10 WHERE snack_id = 90;  (4) Open /api/orders and look at: the new order (qty 1), the 2000-01-03 sale (qty 2), and Monday's test sale (qty 7).",
        hint: "Expected: the new order still says 15, because it was sold at 15 and the ledger remembers. The 2000-01-03 sale says 14. Monday's qty 7 sale says 70 (it has no stored price, so it follows today's 10). If the new order says 10, placeOrder isn't storing the price: check the INSERT block.",
        check: {
          question: "The price is back at 10. What is the total of the order you placed at 15?",
          choices: [
            "10, because the price is 10 again",
            "It disappears",
            "15, because it was sold at 15 and the ledger remembers it",
          ],
          answer: 2,
          explain: "That is the whole difference between a calculation and a record. Keep this order in your ledger: the checkpoint looks for it. (Old sales with a NULL price_paid will keep following the price: that is the honest limit of what the ledger knows.)",
        },
      },
      {
        task:
          "Compare. After Part 2 your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter). The only things that changed since Part 1 are placeOrder, listOrders and getOrder:\n\n" +
          CONTROLLER_D4,
        hint: "Common differences: one of the three SELECTs still using qty * snacks.price, the INSERT with three columns but four ?, and the .param(snack.price()) missing or placed second.",
      },
      {
        task:
          "Add Part 2 to notes.md: what changed in the totals when you changed the price in the first mission (and why), what NULL in price_paid means, what COALESCE does in your own words, and the totals of the three orders in the last mission after the price went back to 10. Then, one sentence: which kinds of sales does the ledger remember correctly, and which not?",
        hint: "Write it in your own words. The last sentence is the honest one: sales from before the column existed have no recorded price.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-price-paid",
    title: "🧪 Part 2 · Checkpoint: history that doesn't move",
    intro:
      "Open each address, or run each console line, on a page of YOUR app at localhost:8080. They need the two sales from the lab: the history sale (" +
      LAB_SNACK +
      ", 2000-01-03, qty 2, price paid 7) and the order of 1 " +
      LAB_SNACK +
      " that you placed while its price was 15. Kutsinta's price today must be 10. Part 1's app calculates every total from today's price, so it cannot pass the first three tasks.",
    tasks: [
      {
        goal: "Paste what your app answers at /api/orders?date=2000-01-03. The sale you inserted with price_paid 7 is the only one on that day.",
        url: "localhost:8080/api/orders?date=2000-01-03",
        checks: [
          { is: "array", message: "This should be a list, starting with [." },
          { exact: 1, message: "Exactly ONE order is dated 2000-01-03. If it is empty, run the lab's INSERT dated 2000-01-03 once (and check the date filter works)." },
          { some: { snack_id: 90, name: "Kutsinta", qty: 2, total: 14 }, message: "The total should be 14 (2 × the stored price 7), not 20. listOrders' SELECTs must calculate  sales.qty * COALESCE(sales.price_paid, snacks.price) AS total,  in BOTH queries (with and without the date)." },
        ],
        hint: "If total is 20, the query still multiplies by today's price. Check the date query inside listOrders, the second SELECT.",
        solution: LIST_ORDERS_D4_PAID,
        example: "[{\"order_id\":14,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":14}]",
        previousStage: "[{\"order_id\":14,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":20}]",
        explain: "The ledger remembers the price the sale was made at.",
      },
      {
        goal: "Paste what your app answers at /api/orders. It must include the order of 1 Kutsinta you placed at ₱15, still totalling 15 now that Kutsinta costs 10.",
        url: "localhost:8080/api/orders",
        checks: [
          { is: "array", message: "This should be a list, starting with [." },
          { keys: ["order_id", "snack_id", "name", "qty", "total"], message: "An order needs order_id, snack_id, name, qty and total." },
          { types: { order_id: "number", snack_id: "number", name: "string", qty: "number", total: "number" }, message: "order_id, snack_id, qty and total must be numbers and name must be text." },
          { some: { snack_id: 90, qty: 1, total: 15 }, message: "No order of 1 Kutsinta with total 15. Redo the lab's proof: set the price to 15, place an order for quantity 1 on order.html, and put the price back to 10. If you did, placeOrder isn't storing the price, or listOrders' first SELECT still uses today's price." },
          { some: { snack_id: 90, qty: 7, total: 70 }, message: "Monday's test sale (qty 7) should total 70: it has no stored price, so it follows today's price of 10. Is Kutsinta's price back to 10?" },
        ],
        hint: "Both queries in listOrders must use COALESCE. A new order stored at 15 shows 15; Monday's old order has no stored price and shows 70 (7 × 10).",
        solution: PLACE_ORDER_D4_PAID + "\n\n" + LIST_ORDERS_D4_PAID,
        example: "[{\"order_id\":1,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":4,\"total\":60},{\"order_id\":2,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":2,\"total\":40},{\"order_id\":3,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":5,\"total\":75},{\"order_id\":4,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":3,\"total\":60},{\"order_id\":5,\"snack_id\":2,\"name\":\"Turon\",\"qty\":6,\"total\":72},{\"order_id\":6,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":2,\"total\":30},{\"order_id\":8,\"snack_id\":5,\"name\":\"Siopao\",\"qty\":3,\"total\":75},{\"order_id\":9,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":4,\"total\":80},{\"order_id\":10,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":2,\"total\":40},{\"order_id\":11,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":7,\"total\":70},{\"order_id\":12,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":3,\"total\":30},{\"order_id\":13,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":20},{\"order_id\":14,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":14},{\"order_id\":15,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":1,\"total\":15}]",
        previousStage: "[{\"order_id\":1,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":4,\"total\":60},{\"order_id\":2,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":2,\"total\":40},{\"order_id\":3,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":5,\"total\":75},{\"order_id\":4,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":3,\"total\":60},{\"order_id\":5,\"snack_id\":2,\"name\":\"Turon\",\"qty\":6,\"total\":72},{\"order_id\":6,\"snack_id\":1,\"name\":\"Banana cue\",\"qty\":2,\"total\":30},{\"order_id\":8,\"snack_id\":5,\"name\":\"Siopao\",\"qty\":3,\"total\":75},{\"order_id\":9,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":4,\"total\":80},{\"order_id\":10,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":2,\"total\":40},{\"order_id\":11,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":7,\"total\":70},{\"order_id\":12,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":3,\"total\":30},{\"order_id\":13,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":20},{\"order_id\":14,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":20},{\"order_id\":15,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":1,\"total\":10}]",
        explain: "Two Kutsinta orders at two different totals for the same price today: one remembers, one follows.",
      },
      {
        goal: "One order by its id. Open localhost:8080/order.html, press F12 → Console, and run this line. It finds the history sale in /api/sales, asks /api/orders/{its id} and copies THAT answer. Paste it here.",
        command: FETCH_ORDER_BY_HISTORY_SALE,
        checks: [
          { is: "object", message: "This should be ONE order, starting with {." },
          { keys: ["order_id", "snack_id", "name", "qty", "total"], message: "The order needs order_id, snack_id, name, qty and total. If you see a  message  about the history sale, run the lab's INSERT dated 2000-01-03 once." },
          { path: "qty", equals: 2, message: "qty should be 2." },
          { path: "total", equals: 14, message: "total should be 14 (2 × the stored price 7). getOrder has its own SELECT: change it to  sales.qty * COALESCE(sales.price_paid, snacks.price) AS total  too." },
        ],
        hint: "getOrder is a separate query from listOrders: both must change.",
        solution: GET_ORDER_D4_PAID,
        example: "{\"order_id\":14,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":14}",
        previousStage: "{\"order_id\":14,\"snack_id\":90,\"name\":\"Kutsinta\",\"qty\":2,\"total\":20}",
        explain: "Every endpoint that calculates a total must agree, so each one changed.",
      },
      {
        goal: "The summary, the list and the raw ledger must still agree. Run this line in the console of a localhost:8080 tab and paste what it copies.",
        command: FETCH_SUMMARY_AGREES,
        checks: [
          { is: "object", message: "This should be a small object with count_matches, sales_match and every_sale_with_a_snack_is_an_order." },
          { path: "count_matches", equals: true, message: "total_orders doesn't equal the number of orders in /api/orders." },
          { path: "sales_match", equals: true, message: "total_sales doesn't equal the sum of the totals in /api/orders. The summary adds up what listOrders(null) returns: check it still calls it." },
          { path: "every_sale_with_a_snack_is_an_order", equals: true, message: "/api/orders and the raw /api/sales disagree about how many sales have a snack." },
        ],
        hint: "summary() needs no change: it adds up the totals listOrders(null) returns, so it follows the new calculation by itself.",
        solution: "// summary() is unchanged:\n" + LIST_ORDERS_D4_PAID,
        example: "{\"count_matches\":true,\"sales_match\":true,\"every_sale_with_a_snack_is_an_order\":true}",
        explain: "The summary follows the new totals without a single edit, because it adds up the same list.",
      },
    ],
  },
];
