// unit3-week8 · Day 1, Part 2 — "the raw ledger"
//
// Added after the first reviews: each day's required work took a fast student
// about an hour, so every day now continues with a labelled Part 2 (see
// docs/agent/log/2026-10-28-week8-reviews-and-part-2.md). Day 1's Part 2:
//  - the sales table is shown exactly as it is: a Sale record (sold_on as a
//    String, snack_id as an Integer because Week 3's sale 7 has NULL) and
//    GET /api/sales, which does NOT join, so nothing is left out;
//  - a new staff page, ledger.html + ledger.js (the menu/orders pattern, with a
//    response.ok check so a failure is written on the page);
//  - the AUTO_INCREMENT check lives here (Week 3's CREATE TABLE left the counter
//    out, BUG-035), so every later day can INSERT a sale without a sale_id.
// Observed on a real Spring Boot 4.1.1 + MySQL 8.0 build:
//  - ALTER TABLE sales MODIFY sale_id INT AUTO_INCREMENT keeps the primary key
//    and the foreign key, and the next sale_id is the highest + 1;
//  - a refused INSERT (Error 1452) still uses up a sale_id: the next good one skips it;
//  - /api/sales lists every row, with "snack_id":null for Week 3's sale 7, and
//    a DATE arrives as "2026-08-14";
//  - ledger.html in real Chrome shows as many rows as /api/sales, "(no snack)" for
//    the NULL, and a written "Sorry: …" when MySQL is away.

import type { DayGame } from "../../types";
import { LAB_SNACK, LEDGER_HTML, LEDGER_JS, LIST_SALES, SALE_RECORD, CONTROLLER_D1 } from "./snippets";
import { NEW_PAGE_FILE, NEW_RECORD_FILE, SQL_RUN } from "./commands";

const LEDGER_PAGE_COMMAND =
  'fetch("/api/sales").then(r => r.json()).then(list => JSON.stringify({ rows_in_api: list.length, rows_on_page: document.querySelectorAll("#sale-rows tr").length, page_matches_api: Array.isArray(list) && list.length > 0 && document.querySelectorAll("#sale-rows tr").length === list.length })).then(t => { console.log(t); return t; }).then(copy)';

const TEST_SALE = "INSERT INTO sales (snack_id, sold_on, qty) VALUES (90, '2000-01-01', 7);";

export const day1Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-ledger",
    inline: true,
    title: "🛠️ Part 2 · Lab: the whole sales table, and a staff page for it",
    intro:
      "Part 1 put your snacks table behind the API. Part 2 puts the sales table behind it exactly as it is, with no JOIN and nothing hidden, and builds a staff page that shows it. Nothing you made in Part 1 changes. Restart after every change to a .java file; a page file needs only a reload (Ctrl+Shift+R).",
    missions: [
      {
        task:
          "Check the counter on sale_id. In queries.sql run  DESCRIBE sales;  and read the Extra column on the sale_id row. If it says auto_increment, go on to the next mission. If it is EMPTY, run this once (it keeps sale_id as the primary key and keeps the link to snacks; running it twice does no harm), then DESCRIBE again to see auto_increment appear:\n\nALTER TABLE sales MODIFY sale_id INT AUTO_INCREMENT;",
        hint:
          "Week 3's CREATE TABLE gave sale_id no counter, and Week 4's RecordSale never gave it a value, so on a ledger built exactly as Week 3 says, that INSERT is refused with Error 1364 \"Field 'sale_id' doesn't have a default value\". The ALTER adds the counter; every sale you add from now on gets the next number by itself.",
        check: {
          question: "Why do you need auto_increment on sale_id before you insert a sale without giving it a number?",
          choices: [
            "Without it, MySQL has no way to make up a sale_id, and refuses the INSERT with Error 1364",
            "Without it, the table can't be read",
            "It makes the INSERT faster",
          ],
          answer: 0,
          explain: "Every INSERT in this week names only snack_id, sold_on and qty. The counter is what fills in the fourth column, and it counts up from the highest number already in your table.",
        },
      },
      {
        task:
          "Put one known sale into your ledger, once. It is a sale of Kutsinta on a date nobody else used, so it is the same row on every ledger. Run the INSERT, then the SELECT, and write the new sale_id in notes.md:\n\n" +
          TEST_SALE +
          "\n\nSELECT * FROM sales ORDER BY sale_id DESC;\n\n(" + SQL_RUN + ") Leave this sale in the table for the rest of the week: later checkpoints look for it.",
        hint:
          "ORDER BY sale_id DESC puts the highest number first, so your new sale is the top row. Its number is normally one more than the highest sale_id you had, which depends on YOUR ledger (the counter never goes back, so it can be higher). If a refused INSERT happens in between (a snack that doesn't exist), the counter still moves on, so you may see a gap.",
        check: {
          question: "Your new sale got a sale_id you never typed. Where did the number come from?",
          choices: [
            "MySQL's counter: AUTO_INCREMENT hands out the next number, normally one more than the highest sale_id so far",
            "From the date",
            "From the quantity",
          ],
          answer: 0,
          explain: "The same counter Week 4's getGeneratedKeys asked about. The date is year 2000 on purpose: no other sale of yours can be on that day.",
        },
      },
      {
        task:
          NEW_RECORD_FILE("Sale") +
          "\n\n" +
          SALE_RECORD +
          "\n\nIt is Snack.java's twin for the sales table: one field per column, with the same names. Two things are new: sold_on is a String (a DATE arrives in a String as 2026-08-14), and snack_id is an Integer with a capital I.",
        hint:
          "Line 1 is your package line, copied from CanteenWebApplication.java. The capital I matters: an int can't hold NULL, and sale 7 in your Week 3 ledger has snack_id NULL (if your ledger has no NULL sale, keep the Integer anyway).",
        check: {
          question: "Why is snack_id an Integer and not an int?",
          choices: [
            "A column that can be NULL needs a type that can be 'nothing': Integer can be null, int cannot",
            "Integer is a bigger number",
            "Records can only have Integer fields",
          ],
          answer: 0,
          explain: "With int, the first NULL would fail with 'A null value cannot be assigned to a primitive type'. That is Week 4's NULL trap again, this time in a record.",
        },
      },
      {
        task:
          "Add the endpoint. In SnackController.java, anywhere inside the class, add:\n\n" +
          LIST_SALES +
          "\n\nRestart. Open localhost:8080/api/sales. Count the sales in the answer and the rows of  SELECT * FROM sales;  in SQLTools: they must be equal.",
        hint:
          "No JOIN: the query reads only the sales table, so no row can go missing. If the browser says Whitelabel 500, read the terminal's 'with root cause' line: Column 'x' not found means the record and the SELECT disagree on a name.",
        check: {
          question: "Sale 7 (the one with no snack) in /api/sales shows…",
          choices: [
            "\"snack_id\":null, and the row is still there",
            "Nothing: the row is missing",
            "\"snack_id\":0",
          ],
          answer: 0,
          explain: "A JOIN would drop it (that is Thursday's lesson). A plain SELECT keeps every row, and the Integer lets the NULL through as JSON null. If your ledger has no NULL sale, you simply see every sale.",
        },
      },
      {
        task:
          NEW_PAGE_FILE("ledger.html") +
          "\n\n" +
          LEDGER_HTML +
          "\n\nOpen localhost:8080/ledger.html: you should see the headings and an empty table. The page is staff-only, so nothing links to it: you type its address.",
        hint: "It is orders.html with different columns. The tbody has id sale-rows, the paragraph has id status, and the last line loads ledger.js, which doesn't exist yet. Red lines in the Console about ledger.js not found are expected for now.",
        check: {
          question: "Why is the table empty?",
          choices: [
            "The HTML only holds the empty table and a script tag. The rows are drawn by ledger.js, which comes next",
            "MySQL is off",
            "Spring blocks new pages",
          ],
          answer: 0,
          explain: "Same split as menu.html and menu.js: the page is the frame, the script fills it with what the API says.",
        },
      },
      {
        task:
          NEW_PAGE_FILE("ledger.js") +
          "\n\n" +
          LEDGER_JS +
          "\n\nPress Ctrl+Shift+R on localhost:8080/ledger.html. Every sale appears, and sale 7 (if you have it) says (no snack).",
        hint:
          "Two parts: showSales draws one row per sale, then the fetch at the bottom asks /api/sales and calls showSales. Note  sale.snack_id === null  (three equals signs: Week 6). The  if (response.ok)  line is the lesson Friday's drill will show: a page must check before it uses an answer.",
        check: {
          question: "The page checks  response.ok  before it draws. What does it do when the answer is an error?",
          choices: [
            "It writes  Sorry:  and the app's own message on the page, instead of crashing",
            "It draws an empty table without saying anything",
            "It reloads the page",
          ],
          answer: 0,
          explain: "An error body is an object, not a list. Without the check, the loop would throw and the page would blame the connection. Checking first lets the page say what really happened.",
        },
      },
      {
        task:
          "Prove the page follows the table, and the foreign key still guards it. Run each of these in turn, reloading localhost:8080/ledger.html after each one:\n\n(1) INSERT INTO sales (snack_id, sold_on, qty) VALUES (90, '2000-01-01', 13);\n\n(2) INSERT INTO sales (snack_id, sold_on, qty) VALUES (99, '2000-01-01', 1);\n\n(3) DELETE FROM sales WHERE snack_id = 90 AND qty = 13;\n\nThe first adds a row, the second is refused by Week 3's lock (no snack 99), and the third removes only that one test sale: no other sale of yours has Kutsinta with quantity 13. Warning for the next days: the WHERE comes from this step, so never write a DELETE without one.",
        hint:
          "Run them one at a time. After (1) the page has one more row and the counter in the status line is one higher. After (2) SQLTools shows Error 1452 and the page is unchanged. After (3) the page is back to what it was. If (3) is refused with Error 1175 (Week 2's safe update mode), run  SET SQL_SAFE_UPDATES = 0;  first and then (3) again.",
        check: {
          question: "After step (2) was refused with Error 1452, how many sales did it add?",
          choices: ["None: the foreign key stopped it before anything was written", "One, with snack_id NULL", "One, with snack 99"],
          answer: 0,
          explain: "The lock from Week 3 protects the table from every program, including yours. A refused INSERT still uses up one sale number, though, so the next good sale skips it: gaps in sale_id are normal.",
        },
      },
      {
        task:
          "Compare. After Part 2, your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter), and Sale.java, ledger.html and ledger.js are exactly as above:\n\n" +
          CONTROLLER_D1,
        hint: "Common differences: listSales placed outside the class's closing brace, a missing import (none are needed for Sale: it is in the same folder), and a ledger.js that still says  response.json().then(data => showSales(data))  without the ok check.",
      },
      {
        task:
          "Add Part 2 to notes.md: the DESCRIBE result before and after (and whether you had to run the ALTER), the sale_id the test sale got and why it isn't 11 on every ledger, one sentence on how /api/sales differs from /api/snacks, and what ledger.html showed for the sale with no snack.",
        hint: "Write it in your own words.",
        input: "Paste Part 2 of notes.md (never application.properties)",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-ledger-page",
    title: "🧪 Part 2 · Checkpoint: the raw ledger and its page",
    intro:
      "Your app and your new page, checked. The first task needs the test sale from the lab (" +
      LAB_SNACK +
      ", 2000-01-01, qty 7): no earlier week put it in your table, so only an app that really reads your sales table can show it. Today's Part 1 app has no /api/sales at all.",
    tasks: [
      {
        goal: "Paste what your app answers at /api/sales.",
        url: "localhost:8080/api/sales",
        checks: [
          { is: "array", message: "This isn't a list: JSON for a list starts with [. A 404 means /api/sales doesn't exist yet: is listSales in SnackController, and did you restart?" },
          { min: 1, message: "The list is empty. Your sales table has rows: does listSales run  SELECT sale_id, snack_id, sold_on, qty FROM sales  and return the list?" },
          { keys: ["sale_id", "snack_id", "sold_on", "qty"], message: "A sale is missing sale_id, snack_id, sold_on or qty. The SELECT names all four columns and the Sale record has all four fields, spelled the same." },
          { types: { sale_id: "number", sold_on: "string", qty: "number" }, message: "sale_id and qty must be numbers, and sold_on must be text like \"2000-01-01\". In Sale.java, sold_on is a String." },
          { some: { snack_id: 90, sold_on: "2000-01-01", qty: 7 }, message: "No sale of snack 90 on 2000-01-01 with qty 7. Run the lab's INSERT once, and check Kutsinta is snack 90." },
        ],
        hint: "If the 2000-01-01 sale is missing, the INSERT in queries.sql didn't run (or failed with Error 1364: then sale_id has no counter yet, see the first mission). If the list is the snacks, listSales returns the wrong table.",
        solution: SALE_RECORD + "\n\n// in SnackController:\n" + LIST_SALES + "\n\n// and in queries.sql, run once:\n" + TEST_SALE,
        example: "[{\"sale_id\":1,\"snack_id\":1,\"sold_on\":\"2026-08-10\",\"qty\":4},{\"sale_id\":2,\"snack_id\":3,\"sold_on\":\"2026-08-10\",\"qty\":2},{\"sale_id\":3,\"snack_id\":1,\"sold_on\":\"2026-08-11\",\"qty\":5},{\"sale_id\":4,\"snack_id\":3,\"sold_on\":\"2026-08-11\",\"qty\":3},{\"sale_id\":5,\"snack_id\":2,\"sold_on\":\"2026-08-12\",\"qty\":6},{\"sale_id\":6,\"snack_id\":1,\"sold_on\":\"2026-08-12\",\"qty\":2},{\"sale_id\":7,\"snack_id\":null,\"sold_on\":\"2026-08-13\",\"qty\":1},{\"sale_id\":8,\"snack_id\":5,\"sold_on\":\"2026-08-13\",\"qty\":3},{\"sale_id\":9,\"snack_id\":3,\"sold_on\":\"2026-08-14\",\"qty\":4},{\"sale_id\":10,\"snack_id\":3,\"sold_on\":\"2026-08-14\",\"qty\":2},{\"sale_id\":11,\"snack_id\":90,\"sold_on\":\"2000-01-01\",\"qty\":7}]",
        previousStage: "{\"timestamp\":\"2026-10-27T19:55:42.146Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No static resource api/sales.\",\"path\":\"/api/sales\"}",
        explain: "The whole table, as it is: Week 3's sale with no snack comes through as null, because nothing joins it away.",
      },
      {
        goal: "Open localhost:8080/ledger.html, press F12 → Console, and run this line. It asks /api/sales and counts the table rows on the page, then tells you whether they agree. Paste what it copies.",
        command: LEDGER_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did you run the line in the console of localhost:8080/ledger.html? On another page there is no  #sale-rows  table." },
          { path: "page_matches_api", equals: true, message: "The page and the API disagree (or the page is empty). ledger.html needs  <tbody id=\"sale-rows\">  and ledger.js must add one row per sale. Press Ctrl+Shift+R, and read the red lines in the Console." },
        ],
        hint: "Open the Console on the ledger page itself. If rows_on_page is 0, ledger.js didn't fill the table: check the script tag at the bottom of ledger.html and the id sale-rows.",
        solution: LEDGER_HTML + "\n\n// ledger.js:\n" + LEDGER_JS,
        example: "{\"rows_in_api\":11,\"rows_on_page\":11,\"page_matches_api\":true}",
        previousStage: "{\"rows_on_page\":0,\"page_matches_api\":false}",
        explain: "A page that shows exactly the rows the API returns: three layers (table, endpoint, page) agreeing.",
      },
    ],
  },
];
