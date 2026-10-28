// unit3-week8 · Day 5, Part 2 — "today's special", one feature through every layer
//
// Friday's required work took a fast student about an hour (reviews, 2026-10-28), so
// the day gets its own Part 2: one small feature that touches every layer the week
// built, in the order a real feature is built, from the bottom up:
//   SQL table (specials, with a foreign key to snacks)
//   → Java record (Special) and endpoint (GET /api/special, a JOIN to snacks)
//   → the page (index.js stops typing the special and asks the API).
// Week 6 Day 1 had students type today's special into index.js and promised "when
// your API exists, special and price will come from your own ledger"; this keeps it.
// Needs no aggregate, no PUT/DELETE endpoint and no new SQL beyond ORDER BY … DESC
// and LIMIT 1 (both Unit 1). Observed on a real Spring Boot 4.1.1 + MySQL 8.0 build:
//  - CREATE TABLE specials (special_id INT PRIMARY KEY AUTO_INCREMENT, snack_id INT,
//    special_price INT, FOREIGN KEY (snack_id) REFERENCES snacks (snack_id)) runs on a
//    ledger built from Weeks 2–4;
//  - GET /api/special → {"snack_id":90,"name":"Kutsinta","price":10,"special_price":7};
//    the newest row (highest special_id) wins; with no row → 404 "No special today";
//  - a nested non-public record Special serialises like CanteenInfo does;
//  - index.html in real Chrome: "Today's special: Kutsinta — ₱7", and
//    "No special today." when the table is empty; with MySQL away the page shows the
//    same line (it checks response.ok, so it never breaks, but it also cannot tell a 404
//    "no special" from a 500 "database unreachable": that is a Day 5 make-your-own idea).

import type { DayGame } from "../../types";
import {
  CONTROLLER_D5,
  INDEX_SPECIAL_NEW,
  INDEX_SPECIAL_OLD,
  LAB_SNACK,
  SPECIALS_CREATE,
  SPECIAL_INSERT,
  SPECIAL_METHOD,
  SPECIAL_RECORD,
  SQL_SPECIAL,
} from "./snippets";
import { INDEX_SPECIAL_COMMAND, SPECIAL_JOIN_COMMAND, SQL_RUN } from "./commands";

export const day5Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-special",
    inline: true,
    title: "🛠️ Part 2 · Lab: today's special, from table to home page",
    intro:
      "Part 1 put your own tables behind tables.html. Part 2 builds one small feature through every layer you have: a SQL table, a Java record and endpoint, and the home page. Since Week 6, index.js has a special typed into it (const special = …). Today it comes from your ledger. Build from the bottom: the table first, then the endpoint that reads it, then the page that shows it. Restart after every change to a .java file; a page file needs only Ctrl+Shift+R.",
    missions: [
      {
        task:
          "The table. A special is its own fact: which snack, and at what price today. It is NOT the snack's normal price, so it gets its own table, linked to snacks like sales is. In queries.sql run, then DESCRIBE (" +
          SQL_RUN +
          "):\n\n" +
          SPECIALS_CREATE +
          "\n\nDESCRIBE specials;",
        hint:
          "Read it as Weeks 2 and 3: special_id counts up by itself (PRIMARY KEY AUTO_INCREMENT), snack_id says which snack, special_price is the offer, and the FOREIGN KEY lock stops a special for a snack that doesn't exist. If it says Table 'specials' already exists, you ran it before: go on.",
        check: {
          question: "Why is special_price a column of specials and not an UPDATE of the price in snacks?",
          choices: [
            "Changing snacks.price would change the real menu price for everybody, and lose it. A special is an extra fact kept beside the snack",
            "Because snacks has no price column",
            "Because UPDATE is not allowed",
          ],
          answer: 0,
          explain: "Same principle as price_paid: one fact in one place. The normal price lives in snacks, the offer lives in specials, and a JOIN puts them side by side.",
        },
      },
      {
        task:
          "Put the first special in, and read it back the way your Java will. Run the INSERT, then the SELECT with the JOIN:\n\n" +
          SPECIAL_INSERT +
          "\n\n" +
          SQL_SPECIAL +
          "\n\nWrite in notes.md the row you get. The ORDER BY … DESC LIMIT 1 means: the NEWEST special wins (the highest special_id).",
        hint: "You joined two tables in Week 3. The JOIN brings the snack's name and normal price in beside the special price. LIMIT 1 keeps only the first row of the sorted result, so the newest special.",
        check: {
          question: "The query returns one row with name, price and special_price. Which table does each come from?",
          choices: [
            "All three from specials",
            "name and price from snacks (through the JOIN), special_price from specials",
            "name from specials, the others from snacks",
          ],
          answer: 1,
          explain: "specials only knows the snack's number. The JOIN fetches the snack's name and normal price, which is what the page needs to say 'usually ₱10'.",
        },
      },
      {
        task:
          "The record. In SnackController.java, inside the class and next to the CanteenInfo record, add:\n\n" +
          SPECIAL_RECORD +
          "\n\nIt has one field per column of the query's result, with the same names, in the same order.",
        hint: "It is a nested record like CanteenInfo: no separate file needed. The four field names are exactly the four names in the SELECT list: snack_id, name, price, special_price.",
        check: {
          question: "What decides that the Special record needs exactly these four fields?",
          choices: [
            "The columns the SELECT returns: .query(Special.class) matches each column to a field by name",
            "The order of the pages",
            "The table specials has four columns",
          ],
          answer: 0,
          explain: "The same naming rule as every record this week. The specials TABLE has three columns, but the RESULT has four, because the JOIN added two and the table's own special_id isn't selected.",
        },
      },
      {
        task:
          "The endpoint. Add this method anywhere inside SnackController, then restart and open localhost:8080/api/special:\n\n" +
          SPECIAL_METHOD +
          "\n\nIt is getSnack's shape: a SELECT, .optional(), and a planned 404 when there is no row.",
        hint: "Compare the JSON with the row you wrote in notes.md: it should be the same four values. A 500 with Column 'x' not found means a record field has no matching column label. A 404 'No special today' means the specials table is empty: run the INSERT.",
        check: {
          question: "What does the answer look like?",
          choices: [
            "A list with one special",
            "An object with snack_id, name, price and special_price: .optional() gives ONE record, not a list",
            "A page",
          ],
          answer: 1,
          explain: "One special, one JSON object. A list would have square brackets, and the page would have to open it. The method returns Special, not List<Special>.",
        },
      },
      {
        task:
          "The page. Open static/index.js. Week 6 left three lines that type today's special and write it onto the page (yours has your own special's name and price). Replace those three lines with the fetch below, then press Ctrl+Shift+R on localhost:8080/index.html. For reference, the lines to replace look like this:\n\n" +
          INDEX_SPECIAL_OLD +
          "\n\nand the new code is:\n\n" +
          INDEX_SPECIAL_NEW,
        hint:
          "Delete the const special, the const price and the getElementById line together, and type the new block there. Everything else in index.js (the greeting) stays. The page checks response.ok, like ledger.js: success writes the special, anything else writes a plain sentence. The element with id special is the paragraph from Week 6.",
        check: {
          question: "The page says  Today's special: Kutsinta — ₱7.  Where does the ₱7 come from?",
          choices: [
            "Typed in index.js",
            "Typed in Java",
            "The specials table: the page asked /api/special, and the endpoint's JOIN read special_price from MySQL",
          ],
          answer: 2,
          explain: "Nothing is typed in the page or in Java any more. The number lives in one place, the table, and every layer above only passes it along.",
        },
      },
      {
        task:
          "The empty case, through every layer. Run this DELETE (it removes only the specials for Kutsinta, which is the one you added; a DELETE always needs its WHERE):\n\nDELETE FROM specials WHERE snack_id = 90;\n\nThen look at localhost:8080/api/special and localhost:8080/index.html. Then run the INSERT of the second mission again and reload both.",
        hint: "With no special, /api/special answers 404 with 'No special today' (the orElseThrow), and the page writes 'No special today.' instead of breaking. No restart is needed at any point.",
        check: {
          question: "The specials table is empty. What did the home page do?",
          choices: [
            "It broke with an error",
            "It showed the old typed special",
            "It wrote No special today., because the endpoint answered 404 and the page checks response.ok",
          ],
          answer: 2,
          explain: "A planned 404 at the bottom becomes a planned sentence at the top. The same discipline in every layer, so nothing ever shows 'undefined'.",
        },
      },
      {
        task:
          "Prove each layer is real. (1) Run  UPDATE specials SET special_price = 6 WHERE snack_id = 90;  and reload index.html with no restart. (2) Set it back:  UPDATE specials SET special_price = 7 WHERE snack_id = 90;  (3) Say, in notes.md, one sentence for each layer: what the table holds, what the record and endpoint do, and what the page does.",
        hint: "The page shows ₱6 after (1) and ₱7 after (2). The change travelled upward from the table to the page without a single line of code changing.",
        check: {
          question: "You changed one number in a table and the home page changed. Which layers did you have to edit?",
          choices: [
            "All four",
            "None: only the data changed. The code was already asking the layer below it",
            "Only the page",
          ],
          answer: 1,
          explain: "That is what separating data from drawing buys you: data in the table, questions in the endpoint, drawing in the page.",
        },
      },
      {
        task:
          "Compare. After Part 2 your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter), and your index.js ends with the fetch above:\n\n" +
          CONTROLLER_D5,
        hint: "Common differences: Special placed outside the class, special() returning List<Special>, a missing orElseThrow, and the old three typed lines still in index.js beside the new fetch (then the page would show whichever ran last).",
      },
      {
        task:
          "Add Part 2 to notes.md: the CREATE TABLE and the INSERT, the JSON from /api/special, the sentence you saw on the page with a special and without one, and your one sentence for each of the four layers.",
        hint: "Write it in your own words.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-special",
    title: "🧪 Part 2 · Checkpoint: one feature, every layer",
    intro:
      "Each task proves one layer of today's special. They need the special from the lab: " +
      LAB_SNACK +
      " at ₱7 (put it back with the INSERT if you deleted it, and make sure it is the NEWEST special). Part 1's app has no /api/special and a typed special on its home page, so it cannot pass any of these.",
    tasks: [
      {
        goal: "The endpoint. Paste what your app answers at /api/special.",
        url: "localhost:8080/api/special",
        checks: [
          { is: "object", message: "This should be ONE special, starting with {. A 404 'No static resource' means the method or its @GetMapping is missing; 'No special today' means the specials table is empty." },
          { keys: ["snack_id", "name", "price", "special_price"], message: "A special needs snack_id, name, price and special_price. Check the record's four fields and the SELECT's four labels." },
          { types: { snack_id: "number", name: "string", price: "number", special_price: "number" }, message: "snack_id, price and special_price must be numbers and name must be text." },
          { path: "name", equals: "Kutsinta", message: "The special should be Kutsinta: the newest row of specials. Is the lab's INSERT (snack 90, special_price 7) the newest row?" },
          { path: "special_price", equals: 7, message: "special_price should be 7, the number you inserted into the specials table." },
        ],
        hint: "If special_price is wrong, the newest row of specials isn't the lab's INSERT. SELECT * FROM specials; shows them all. If name is missing, the JOIN to snacks is missing.",
        solution: SPECIAL_RECORD + "\n\n" + SPECIAL_METHOD,
        example: "{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10,\"special_price\":7}",
        previousStage: "{\"timestamp\":\"2026-10-27T19:59:12.803Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No static resource api/special.\",\"path\":\"/api/special\"}",
        explain: "A number only your specials table holds, joined to a name only your snacks table holds.",
      },
      {
        goal: "The JOIN. Run this line in the console of a localhost:8080 tab. It asks /api/special, then asks /api/snacks/{the special's snack_id}, and compares the two. Paste what it copies.",
        command: SPECIAL_JOIN_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did the line run on a localhost:8080 tab, and does /api/special answer?" },
          { path: "special_name_is_the_snack_name", equals: true, message: "The special's name doesn't match the snack it points at. The SELECT must JOIN specials to snacks ON specials.snack_id = snacks.snack_id and read snacks.name." },
          { path: "special_normal_price_is_the_snack_price", equals: true, message: "The special's price isn't the snack's normal price. Select snacks.price (not specials.special_price) as price." },
          { path: "special_price_is_lower", equals: true, message: "A special should be cheaper than the normal price. Is special_price below price? Check the INSERT inserted 7 for Kutsinta (price 10)." },
        ],
        hint: "Three things must be true at once: the name is the snack's name, the price is the snack's normal price, and special_price is lower. Each comes from a different place.",
        solution: SPECIAL_METHOD,
        example: "{\"special_name_is_the_snack_name\":true,\"special_normal_price_is_the_snack_price\":true,\"special_price_is_lower\":true}",
        previousStage: "{\"special_name_is_the_snack_name\":false,\"special_normal_price_is_the_snack_price\":false,\"special_price_is_lower\":false}",
        explain: "The endpoint agrees with the snacks table it joins to: the layers are consistent.",
      },
      {
        goal: "The page. Open localhost:8080/index.html, press F12 → Console, and run this line. It waits a moment, reads the paragraph that holds today's special and the price in it, and checks that the page really asked /api/special. Paste what it copies.",
        command: INDEX_SPECIAL_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did you run the line on localhost:8080/index.html?" },
          { path: "special_text", contains: "Kutsinta", message: "The home page doesn't say Kutsinta. It must come from /api/special. Replace the three typed lines of index.js with the fetch, and press Ctrl+Shift+R." },
          { path: "price_on_page", equals: 7, message: "The page should show the special price, exactly ₱7 (not ₱70 or ₱17): data.special_price from the endpoint." },
          { path: "asked_the_app", equals: true, message: "The page never asked /api/special: the special is typed into index.js, or the browser kept the old file. The text must come from the fetch to /api/special. Put the fetch in index.js (the typed lines go), press Ctrl+Shift+R, reload the page and run the line again." },
        ],
        hint: "If the page still says your Week 6 special, the typed lines are still in index.js (or the browser kept the old file: press Ctrl+Shift+R).",
        solution: INDEX_SPECIAL_NEW,
        example: "{\"special_text\":\"Today's special: Kutsinta — ₱7\",\"price_on_page\":7,\"asked_the_app\":true}",
        previousStage: "{\"special_text\":\"Today's special: Turon — ₱12\",\"price_on_page\":12,\"asked_the_app\":false}",
        explain: "The home page now says what your ledger says: table, record, endpoint and page, one chain.",
      },
    ],
  },
];
