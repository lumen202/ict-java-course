// unit3-week8 · Day 3, Part 2 — "a second write: add a snack"
//
// Day 3's required work took a fast student about an hour (reviews, 2026-10-28),
// so the day continues with a second INSERT on the other table:
//  - POST /api/snacks inserts into snacks and answers 201 with the new snack;
//    400 for a snack_id below 1, a blank (or missing) name, a name over 50 characters
//    or a price outside 1 to 1000; 409 for a duplicate snack_id, from
//    DuplicateKeyException;
//  - a new staff page add-snack.html + add-snack.js (the receipt pattern: a
//    message written on the page for success and for every refusal);
//  - the new snack is on the menu and orderable with no restart.
// snacks.snack_id has NO AUTO_INCREMENT in Week 3's schema, and it can't be given
// one: ALTER TABLE snacks MODIFY snack_id INT AUTO_INCREMENT is refused with
// Error 1833 "Cannot change column 'snack_id': used in a foreign key constraint
// 'sales_ibfk_1' of table 'school.sales'" (observed). So, unlike placeOrder, the
// staff form sends the snack number and there is no KeyHolder.
// Observed on a real Spring Boot 4.1.1 + MySQL 8.0 build:
//  - a new snack → 201 {"snack_id":1234,"name":"Check 1234","price":14}; the same
//    snack_id again → 409 "Snack 1234 already exists" (also for snack 1); snack_id 0 →
//    400 "snack_id must be 1 or more"; name "   " or missing → 400 "name must not be
//    blank"; 51 characters → 400 "name must be at most 50 characters"; price 0 or
//    1001 → 400 "price must be from 1 to 1000"; a missing snack_id or price key →
//    400 "JSON parse error: Cannot map `null` into type `int` …"; price "abc" → 400
//    "JSON parse error: Cannot deserialize value of type `int` from String "abc" …";
//    DELETE /api/snacks/1234 → 405;
//  - a name "  Padded  " is stored with its spaces (the lab doesn't trim);
//  - the INSERT is plain SQL: a duplicate is MySQL's Error 1062 "Duplicate entry
//    '91' for key 'snacks.PRIMARY'" in SQLTools.

import type { DayGame } from "../../types";
import {
  ADD_SNACK,
  ADD_SNACK_HTML,
  ADD_SNACK_JS,
  CONTROLLER_D3,
  NEW_IMPORT_DUP,
} from "./snippets";
import {
  ADD_SNACK_PAGE_COMMAND,
  NEW_PAGE_FILE,
  consoleAddSnack,
  consoleAddSnackThenGet,
} from "./commands";

const SQL = "Ctrl+E, then Ctrl+E again";

export const day3Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-add-snack",
    inline: true,
    title: "🛠️ Part 2 · Lab: add a snack from a page",
    intro:
      "Part 1 wrote orders into sales. Part 2 writes the other table: a staff page adds a new snack to the menu, with its own refusals, and the new snack is orderable at once. You will write the SQL first, then the endpoint, then the page. Restart after every change to a .java file; a page file needs only Ctrl+Shift+R.",
    missions: [
      {
        task:
          "SQL first. In queries.sql run these three, one at a time (" +
          SQL +
          "), and write in notes.md what each one answered:\n\nINSERT INTO snacks (snack_id, name, price) VALUES (91, 'Sample', 12);\n\nINSERT INTO snacks (snack_id, name, price) VALUES (91, 'Sample', 12);\n\nDELETE FROM snacks WHERE snack_id = 91;\n\nThe second one is refused: you met it in Week 2 as the duplicate key. The DELETE removes only snack 91, and nothing points at it, so it is safe. Note the first INSERT names the snack_id: snacks has no counter, and MySQL won't let you add one (the link from sales to snacks blocks it), so the number comes with the request.",
        hint:
          "The second statement answers Error 1062 Duplicate entry '91' for key 'snacks.PRIMARY'. The third removes the sample, so snack 91 is free again for the console tests. If snack 91 was already in your table, change 91 to 95 everywhere in this lab.",
        check: {
          question: "Why does the second INSERT fail?",
          choices: [
            "The primary key snack_id must be different in every row, and 91 is already there (Error 1062)",
            "The name Sample is used twice",
            "The price 12 is too low",
          ],
          answer: 0,
          explain: "PRIMARY KEY means unique. Your app will turn this exact refusal into a polite 409 so the page can say 'already exists' instead of showing a 500.",
        },
      },
      {
        task:
          "Add the endpoint. (1) Under the other import lines add:\n\n" +
          NEW_IMPORT_DUP +
          "\n\n(2) Inside SnackController, anywhere, add this method. It checks four things BEFORE anything is written (each one is a 400), then runs the INSERT, and turns MySQL's duplicate refusal into a 409:\n\n" +
          ADD_SNACK +
          "\n\nRestart the app.",
        hint:
          "@RequestBody Snack snack reuses the Snack record you already have: the JSON {snack_id, name, price} fills it. The name test checks == null first: calling .isBlank() on a missing name would crash. try { … } catch (DuplicateKeyException e) { … } is Week 4's try/catch, aimed at one specific refusal. .update() with nothing inside is right here: there is no id to fetch back.",
        check: {
          question: "Which line stops the app from writing a snack with a price of 0?",
          choices: [
            "The INSERT itself",
            "The test  snack.price() < 1 || snack.price() > 1000  before the INSERT: it throws a 400, so nothing is written",
            "The catch for DuplicateKeyException",
          ],
          answer: 1,
          explain: "Check first, write second, like placeOrder. MySQL would happily store a price of 0: only your own checks keep it out.",
        },
      },
      {
        task:
          "Test it from the console, as you did for orders. Open localhost:8080/menu.html, press F12 → Console and run these lines one at a time (Enter after each; if Chrome warns about pasting, type  allow pasting  and press Enter first). Write the status and the answer of each in notes.md:\n\na new snack:\n\n" +
          consoleAddSnack('{ snack_id: 91, name: "Sample", price: 12 }') +
          "\n\nthe same snack number again:\n\n" +
          consoleAddSnack('{ snack_id: 91, name: "Sample", price: 12 }') +
          "\n\na blank name:\n\n" +
          consoleAddSnack('{ snack_id: 92, name: "   ", price: 12 }') +
          "\n\na price of 0:\n\n" +
          consoleAddSnack('{ snack_id: 92, name: "Sample", price: 0 }') +
          "\n\nThen remove the sample again: in queries.sql run  DELETE FROM snacks WHERE snack_id = 91;",
        hint:
          "The answers are 201 with the snack, then 409 Snack 91 already exists, then 400 name must not be blank, then 400 price must be from 1 to 1000. Each console line prints the status first (for example  201 true ) and then the answer. Chrome also prints its own red line for a 4xx: that is the browser reporting the status, not a mistake. A 405 means POST isn't allowed at that address: addSnack is missing or has the wrong @PostMapping.",
        check: {
          question: "The second line answered 409, not 500. Which part of addSnack made that happen?",
          choices: [
            "Spring does it for every duplicate",
            "The catch block: it catches DuplicateKeyException (MySQL's Error 1062) and throws a ResponseStatusException with CONFLICT",
            "The browser retries with a new number",
          ],
          answer: 1,
          explain: "Without the catch, the same refusal would reach the customer as a 500 with part of your SQL in it. A planned 409 tells the page exactly what to say.",
        },
      },
      {
        task:
          NEW_PAGE_FILE("add-snack.html") +
          "\n\n" +
          ADD_SNACK_HTML +
          "\n\nOpen localhost:8080/add-snack.html: a form with three boxes and a button. It does nothing yet.",
        hint: "It is order.html's cousin: a form with an id, three inputs with ids, and a paragraph with id result that will show the app's answer. The numbers have min and max so the browser stops obvious mistakes, but the app checks again: never trust the page alone.",
        check: {
          question: "The form says  max=\"1000\"  on the price box, and addSnack checks the price too. Why both?",
          choices: [
            "The page's check is a courtesy for the person at the keyboard; the app's check protects the ledger from every sender, including a console line like the one you just used",
            "The page's check is not needed at all",
            "The app's check is not needed at all",
          ],
          answer: 0,
          explain: "Anyone can send a request without your page. The app and the database are the only checks you can count on.",
        },
      },
      {
        task:
          NEW_PAGE_FILE("add-snack.js") +
          "\n\n" +
          ADD_SNACK_JS +
          "\n\nPress Ctrl+Shift+R on localhost:8080/add-snack.html.",
        hint:
          "Read it in two halves. The first builds the snack from the three boxes, using Number(…) for the two numbers. The second is order.js's pattern: POST the JSON, and if response.ok write a success line, else write Sorry: and the app's own message. The key names snack_id, name and price match the Snack record exactly.",
        check: {
          question: "Why does the script write  Sorry:  and  data.message  instead of just 'Failed'?",
          choices: [
            "The app's message says WHY (already exists, blank name, bad price), so the person can fix it",
            "Because response.ok is always false",
            "Because Spring needs it",
          ],
          answer: 0,
          explain: "That is why the refusals have words: 'Snack 92 already exists' reaches the person who typed 92, word for word.",
        },
      },
      {
        task:
          "Use the page like a person. On localhost:8080/add-snack.html add: snack number 92, name  Halo-halo,  price 35. Read the message. Then add the SAME form again, unchanged. Then try snack number 93 with the name made of three spaces (the browser accepts spaces) and price 35. Write all three messages in notes.md.",
        hint: "The first says Added: Halo-halo (snack 92) at ₱35. The second says Sorry: Snack 92 already exists. The third says Sorry: name must not be blank. If snack 92 already exists in your table, use another number from 92 upwards that is free.",
        check: {
          question: "The second click said Sorry: Snack 92 already exists. Where did that exact sentence come from?",
          choices: [
            "From add-snack.js",
            "From the browser",
            "From addSnack in Java, built from the snack number, and shown by the page word for word",
          ],
          answer: 2,
          explain: "The page only displays what the app sends. Changing the sentence means changing one line of Java.",
        },
      },
      {
        task:
          "Prove the chain, with no restart. (1) Reload localhost:8080/menu.html: Halo-halo is there. (2) Open order.html, choose Halo-halo, quantity 2, and press Place order: the receipt says its total. (3) Open localhost:8080/ledger.html: the newest row is the sale you just made, and the snack number is the one you typed in the form.",
        hint: "Three pages, no restart: the page wrote to snacks through your app, the menu read it back, the order used it through getSnack, and the ledger shows the sale. If the order says No snack with id 92, getSnack is still searching a Java list: it shouldn't be after Tuesday.",
        check: {
          question: "You never restarted the app, yet the new snack was orderable. Why?",
          choices: [
            "The app restarts itself when a snack is added",
            "Every request asks MySQL for the snack: the INSERT is in the table, so every page sees it at once",
            "The browser remembered the form",
          ],
          answer: 1,
          explain: "This is what a Java list could never do. One table, read fresh by every endpoint: add once, available everywhere.",
        },
      },
      {
        task:
          "Compare. After Part 2 your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter), add-snack.html and add-snack.js are exactly as above, and your project now has these pages in static: index, menu, order, orders, tables, ledger, add-snack:\n\n" +
          CONTROLLER_D3,
        hint: "Common differences: a missing DuplicateKeyException import, the return snack; line missing at the end, addSnack declared with @GetMapping, and a try block whose closing brace swallowed the return. Part 1's methods are unchanged.",
      },
      {
        task:
          "Add Part 2 to notes.md: the SQL half (what the duplicate gave), the four statuses from the console (201, 409, 400, 400) with the exact messages, what the page showed for each of its three tries, and why the snack number comes from the form while the sale number came from MySQL.",
        hint: "Write it in your own words. The last sentence is about the AUTO_INCREMENT counters: which table has one, and which doesn't.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-add-snack",
    title: "🧪 Part 2 · Checkpoint: a snack that reaches MySQL",
    intro:
      "Each task runs one line in the console of a page of YOUR app (localhost:8080), prints the answer and copies it; paste it here. The first and last tasks add a snack named Check and a number: when you have finished the day, remove them with  DELETE FROM snacks WHERE name LIKE 'Check %';  (nothing points at them). Part 1's app answers 405 to every POST /api/snacks and has no add-snack.html, so it cannot pass any of these.",
    tasks: [
      {
        goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It adds a snack with a new number, then reads it back with GET /api/snacks/{its number} and copies what that answered. Paste it here.",
        command: consoleAddSnackThenGet,
        checks: [
          { is: "object", message: "This should be ONE snack, starting with {. If it is an error body, POST /api/snacks didn't add the snack (405 means the method is missing; 500 means read the terminal)." },
          { keys: ["snack_id", "name", "price"], message: "The snack needs snack_id, name and price. The error body of a refused request has none of them: read its message." },
          { path: "name", contains: "Check", message: "The snack read back should be called Check followed by a number. Did addSnack insert the name it was given?" },
          { path: "price", equals: 14, message: "The price should be 14: the line posted 14. Is .param(snack.price()) the third .param, after the snack number and the name?" },
        ],
        hint: "The line posts a new snack and then asks MySQL for it by number. If the second step finds nothing, the INSERT never ran.",
        solution: ADD_SNACK,
        example: "{\"snack_id\":1812,\"name\":\"Check 1793131028889\",\"price\":14}",
        previousStage: "{\"timestamp\":\"2026-10-27T19:57:26.284Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No snack with id 7221\",\"path\":\"/api/snacks/7221\"}",
        explain: "Written by one endpoint and read back by another: the row is really in your snacks table.",
      },
      {
        goal: "A snack number that already exists. Run this line on a localhost:8080 page and paste what it copies. It tries to add another snack with number 90 (Kutsinta).",
        command: consoleAddSnack('{ snack_id: 90, name: "Again", price: 5 }'),
        checks: [
          { is: "object", message: "This should be the app's error body, starting with {." },
          { path: "status", equals: 409, message: "The status should be 409. A 500 means the DuplicateKeyException isn't caught; a 405 means POST /api/snacks doesn't exist." },
          { path: "message", equals: "Snack 90 already exists", message: "The message should be exactly  Snack 90 already exists  with the snack number in it." },
        ],
        hint: "The catch block must wrap the INSERT, and its message is built with  \"Snack \" + snack.snack_id() + \" already exists\".",
        solution: ADD_SNACK,
        example: "{\"timestamp\":\"2026-10-27T19:57:10.840Z\",\"status\":409,\"error\":\"Conflict\",\"message\":\"Snack 90 already exists\",\"path\":\"/api/snacks\"}",
        previousStage: "{\"timestamp\":\"2026-10-27T19:57:28.106Z\",\"status\":405,\"error\":\"Method Not Allowed\",\"message\":\"Method 'POST' is not supported.\",\"path\":\"/api/snacks\"}",
        explain: "MySQL's Error 1062 turned into the answer a page can show.",
      },
      {
        goal: "A blank name. Run this line on a localhost:8080 page and paste what it copies.",
        command: consoleAddSnack('{ snack_id: 5000, name: "   ", price: 5 }'),
        checks: [
          { is: "object", message: "This should be the app's error body, starting with {." },
          { path: "status", equals: 400, message: "The status should be 400. A 201 means the blank name was saved: the check is missing or comes after the INSERT." },
          { path: "message", equals: "name must not be blank", message: "The message should be exactly  name must not be blank." },
        ],
        hint: "snack.name() == null || snack.name().isBlank() must be tested before the INSERT.",
        solution: ADD_SNACK,
        example: "{\"timestamp\":\"2026-10-27T19:57:12.676Z\",\"status\":400,\"error\":\"Bad Request\",\"message\":\"name must not be blank\",\"path\":\"/api/snacks\"}",
        previousStage: "{\"timestamp\":\"2026-10-27T19:57:29.933Z\",\"status\":405,\"error\":\"Method Not Allowed\",\"message\":\"Method 'POST' is not supported.\",\"path\":\"/api/snacks\"}",
        explain: "Refused before anything was written.",
      },
      {
        goal: "A price that is too high. Run this line on a localhost:8080 page and paste what it copies.",
        command: consoleAddSnack('{ snack_id: 5000, name: "Pricey", price: 1001 }'),
        checks: [
          { is: "object", message: "This should be the app's error body, starting with {." },
          { path: "status", equals: 400, message: "The status should be 400. A 201 means a price of 1001 was saved." },
          { path: "message", equals: "price must be from 1 to 1000", message: "The message should be exactly  price must be from 1 to 1000." },
        ],
        hint: "The test is  snack.price() < 1 || snack.price() > 1000,  and it throws a 400 with that message.",
        solution: ADD_SNACK,
        example: "{\"timestamp\":\"2026-10-27T19:57:14.506Z\",\"status\":400,\"error\":\"Bad Request\",\"message\":\"price must be from 1 to 1000\",\"path\":\"/api/snacks\"}",
        previousStage: "{\"timestamp\":\"2026-10-27T19:57:31.759Z\",\"status\":405,\"error\":\"Method Not Allowed\",\"message\":\"Method 'POST' is not supported.\",\"path\":\"/api/snacks\"}",
        explain: "The database would have stored 1001. Only your own check keeps it out.",
      },
      {
        goal: "Open localhost:8080/add-snack.html, press F12 → Console, and run this line. It fills the form like a person, presses the button, waits a moment, and then asks MySQL for the snack. Paste what it copies.",
        command: ADD_SNACK_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did you run the line in the console of localhost:8080/add-snack.html?" },
          { path: "on_add_snack_page", equals: true, message: "There is no  #snack-form  on this page. Run the line on localhost:8080/add-snack.html." },
          { path: "message_on_page", contains: "Added", message: "The page didn't write an  Added: …  message. Check add-snack.js writes it when response.ok, and press Ctrl+Shift+R. The Console shows any red error." },
          { path: "name_in_mysql", contains: "Check", message: "The snack the page sent isn't in MySQL. Did the form send snack_id, name and price, with those exact key names?" },
          { path: "price_in_mysql", equals: 14, message: "The price in MySQL should be 14." },
        ],
        hint: "If message_on_page is empty, the script isn't loaded or isn't writing into the paragraph with id result. If it says Sorry, read the message after it.",
        solution: ADD_SNACK_HTML + "\n\n// add-snack.js:\n" + ADD_SNACK_JS,
        example: "{\"on_add_snack_page\":true,\"message_on_page\":\"Added: Check 6344 (snack 6344) at ₱14\",\"name_in_mysql\":\"Check 6344\",\"price_in_mysql\":14}",
        previousStage: "{\"on_add_snack_page\":false}",
        explain: "A form, an endpoint and a table, working as one: the page's click became a row you can SELECT.",
      },
    ],
  },
];
