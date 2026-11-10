// unit3-week9 · Day 3 — Cancel an order: DELETE, 204, and the WHERE habit
//
// DELETE /api/orders/{id} runs DELETE FROM sales WHERE sale_id = ? AND snack_id IS NOT NULL and
// answers 204 No Content (no body) when .update() reports a row removed, or 404 "No order with id N"
// when it reports 0. Like Day 1 the lab builds it twice: the first version never reads the count and
// answers 204 for an order that was never there. The "forgot WHERE" disaster is shown only on a COPY
// table, sales_practice (CREATE TABLE … AS SELECT), never on sales.
// Observed on a real build (2026-11-03):
//  - DELETE of a test order → 204, no body; GET of it afterwards → 404; a second DELETE → 404 "No
//    order with id N" (first version: 204 again); DELETE /api/orders/99999 → 404; DELETE /api/orders/7
//    (no snack) → 404 and the sale stays; /api/orders/abc → 400;
//  - response.json() on a 204 throws a SyntaxError: Node says "Unexpected end of JSON input", Chrome 156 says
//    "Failed to execute 'json' on 'Response': Unexpected end of JSON input" (the wording in the lesson);
//  - DELETE FROM sales_practice (no WHERE) empties the copy; sales is untouched.
// Videos (transcripts read 2026-11-03):
//  - Be Software Engineer, "DELETE APIs Explained — Your CRUD Set is Complete" (OCB-BpuV8Ak, 4:03):
//    returns 200 with a message and says 204 comes in the next video; presents 404-or-204 for a missing
//    id as a choice (this course picks 404).
//  - Gyan Darpan, "JdbcClient DELETE Query in Spring Boot – Part 107" (bMIN69vbbcw, 3:54): named
//    parameters, a repository class and Postman; the point is that DELETE also uses .update().
//  - Frontend Techies (QC2fZqKcgZQ) 9:00–13:30: fetch with method "DELETE". Afterwards he calls
//    response.json(), which only works on his fake API (it answers 200 with {}), never on a 204.

import type { DayPlan } from "../../types";
import { day3Part2 } from "./day3-part2";
import { EX, PREV } from "./captured";
import { CANCEL_ROUNDTRIP, consoleDelete } from "./commands";
import {
  CANCEL_ORDER,
  CANCEL_ORDER_A,
  CONTROLLER_D3,
  IMPORT_DELETE,
  SQL_CLEAN_TEST_ORDERS,
  SQL_PRACTICE_COPY,
  SQL_PRACTICE_DROP,
} from "./snippets";

const SQL = "Ctrl+E, then Ctrl+E again";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "Cancel an order: DELETE … WHERE in SQL, DELETE through your API, a 204 with nothing in it, and the habit that keeps a table full",
  warmupGame: {
    kind: "quest",
    id: "warmup-delete-shape",
    title: "🗑️ Warm-up: a success with nothing to say",
    intro: "Every answer so far had something in it: a list, a snack, an order, an error. Removing something is different, and so is the habit that makes it safe.",
    missions: [
      {
        task: "Week 2 taught two habits for DELETE. A DELETE without a WHERE removes every row of the table. And a DELETE can't be undone: there is no bin.",
        hint: "Week 2 Day 2: what did you do before every DELETE?",
        check: {
          question: "Which habit makes a DELETE safe?",
          choices: [
            "Run it twice to be sure",
            "Write the SELECT with the same WHERE first and read the rows it shows: those are exactly the rows the DELETE will remove",
            "Run it at night",
          ],
          answer: 1,
          explain: "A SELECT only looks. Change the first word to DELETE only after you've seen that the rows are the ones you mean.",
        },
      },
      {
        task: "A cancelled order is gone. When a customer asks the app to cancel order 40 and it is done, there is nothing left to send back: no order, no list.",
        hint: "Week 7 Day 4 had a table of statuses (200, 201, 400, 404, 500). One more completes the list for a DELETE: which one means 'worked, and there's nothing to show'?",
        check: {
          question: "Which status means 'it worked and there is no body'?",
          choices: [
            "404 Not Found",
            "201 Created",
            "204 No Content",
          ],
          answer: 2,
          explain: "204 is a success with an empty body. A page must not try to read JSON from it, because there isn't any.",
        },
      },
      {
        task: "The cancel request is  DELETE /api/orders/40,  and the SQL is  DELETE FROM sales WHERE sale_id = N.  Think about asking for the same cancellation twice.",
        hint: "After the first DELETE, how many sales have the number 40?",
        check: {
          question: "What should the second DELETE of order 40 answer?",
          choices: [
            "204 again: it is gone either way",
            "404: there is no order 40 any more, and the count of rows removed is 0",
            "500",
          ],
          answer: 1,
          explain: "The count of rows removed is the app's only way to know. It is the same idea as Monday's PUT: zero rows means there was no such order.",
        },
      },
    ],
  },
  videos: [
    {
      title: "DELETE APIs explained: your CRUD set is complete (Be Software Engineer)",
      youtubeId: "OCB-BpuV8Ak",
      length: "4:03",
      practice: {
        intro: "Watch it all. His code returns a plain message with a 200, and he says the right status comes in the next video: you will do it with 204 today. Pay attention to why a DELETE has no body, and to his question about what to answer when the id doesn't exist.",
        steps: [
          "Write in notes.md: why does he say a DELETE shouldn't have a request body?",
          "He says a missing id could be a 404 or a 204. Write which one you will use today and why (you decided on Monday: zero rows means 404).",
        ],
        note: "His related-data problems come in a later module of his; yours come on Thursday.",
      },
    },
    {
      title: "JdbcClient DELETE query in Spring Boot, part 107 (Gyan Darpan)",
      youtubeId: "bMIN69vbbcw",
      length: "3:54",
      practice: {
        intro: "Watch it all. He uses :employeeId style names, a repository class and Postman; you use ?, one controller and the console. Listen for what he says .update() returns for a DELETE.",
        steps: [
          "Write in notes.md: what does .update() return for a DELETE, in his words, and what will you do with that number?",
        ],
        note: "He shows a 204 in Postman but not the code that produces it: you will write that today with @ResponseStatus.",
      },
    },
    {
      title: "Handle PUT and DELETE requests with the JavaScript Fetch API, the DELETE part (Frontend Techies)",
      youtubeId: "QC2fZqKcgZQ",
      length: "13:54",
      practice: {
        intro: "Watch only 9:00 to 13:30, the DELETE part. A DELETE needs only  { method: \"DELETE\" }:  no headers, no body. WARNING: after the DELETE he calls  response.json().  That only works on his fake test API, which answers 200 with an empty object. Your app answers 204 with nothing at all, and response.json() on nothing is an error: the lab shows it.",
        steps: [
          "Write in notes.md: what does his fetch for a DELETE look like, compared with a PUT (which parts are missing, and why)?",
          "Predict: what happens if a page calls response.json() on an answer with no body? Write your prediction; the lab tests it.",
        ],
        note: "He doesn't check response.ok. Your pages check response.ok for JSON answers and response.status === 204 for a DELETE.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: DELETE /api/orders/{id}",
      intro:
        "First the SQL habit, on a COPY of your table so nothing real is ever at risk. Then the endpoint, built the quick way first and fixed with the count, as on Monday. Restart after every change to a .java file.",
      missions: [
        {
          task:
            "Make a practice copy of your sales table. CREATE TABLE … AS SELECT makes a new table and fills it with the rows a SELECT returns (it copies the data, not the keys). In queries.sql run these two, one at a time (" +
            SQL +
            "):\n\n" +
            SQL_PRACTICE_COPY +
            "\n\nSELECT * FROM sales_practice;\n\nThe second shows the same rows as sales. From now on the DELETEs of this mission touch ONLY sales_practice. Read the name after FROM before every run.",
          hint: "If CREATE TABLE says the table already exists, an earlier try left it: run  DROP TABLE sales_practice;  first, then start again. The copy has no primary key or foreign key, which is fine for practice.",
          check: {
            question: "Why practise a DELETE on a copy?",
            choices: [
              "A copy deletes faster",
              "A mistake in the copy costs nothing: the real table is never touched",
              "MySQL requires it",
            ],
            answer: 1,
            explain: "There is no undo for a DELETE. Practising the dangerous statement where it can't hurt is how professionals learn it too.",
          },
        },
        {
          task:
            "The habit, on the copy. Run the SELECT first and read the rows. Then change its first word and run the DELETE. Then SELECT again:\n\nSELECT * FROM sales_practice WHERE qty = 7;\n\nDELETE FROM sales_practice WHERE qty = 7;\n\nSELECT * FROM sales_practice;\n\nWrite in notes.md which rows disappeared, and what the SELECT showed you BEFORE you ran the DELETE.",
          hint: "The first SELECT shows the rows the DELETE will remove: the Kutsinta test sale of 7 from Week 8 and any other sale with exactly 7. The last SELECT shows the table without them. Only the copy changed.",
          check: {
            question: "What did the first SELECT tell you?",
            choices: [
              "Nothing: it's only a look",
              "Exactly which rows the DELETE would remove, so you could stop if they were the wrong ones",
              "How long the DELETE takes",
            ],
            answer: 1,
            explain: "The WHERE of the SELECT and the WHERE of the DELETE are the same text, so the SELECT is a preview of the DELETE.",
          },
        },
        {
          task:
            "Now the disaster, on the copy only. Read the table name after FROM, twice. Then run:\n\nDELETE FROM sales_practice;\n\nand then SELECT * FROM sales_practice; Then check that your REAL table is untouched with  SELECT * FROM sales;  and finally remove the practice table:\n\n" +
            SQL_PRACTICE_DROP +
            "\n\nIf your SQL tool refuses the DELETE (with Error 1175, a 'safe update mode' that Workbench turns on), read the message and carry on: the lesson is that most tools, and every program, do not refuse.",
          hint: "The DELETE with no WHERE answers as if nothing were wrong and removes every row of the copy: the SELECT shows an empty table. sales still has all its rows, because the statement named sales_practice. Type the name carefully: the same statement aimed at sales would have done this to your real ledger.",
          check: {
            question: "What does  DELETE FROM sales_practice;  with no WHERE do?",
            choices: [
              "Removes every row of sales_practice, with no question asked",
              "Removes nothing, because it has no WHERE",
              "Removes the first row",
            ],
            answer: 0,
            explain: "No WHERE means every row. This is why the Java you write today always has one, and why the SELECT comes first.",
          },
        },
        {
          task:
            "First version of the endpoint. (1) Under the other import lines of SnackController.java add:\n\n" +
            IMPORT_DELETE +
            "\n\n(2) Inside the class, as the very last thing, just above the final closing brace, type:\n\n" +
            CANCEL_ORDER_A +
            "\n\nRead it: @DeleteMapping is the verb, @ResponseStatus(NO_CONTENT) makes the answer a 204, and the method returns void: nothing to send back. The SQL names the sale AND requires a snack, like Tuesday's UPDATE. Restart the app.",
          hint: "A red DeleteMapping means the import is missing. The method is void and has no return line, so it has nothing to say: Spring sends the status you chose and an empty body.",
          check: {
            question: "Why does cancelOrder return void?",
            choices: [
              "A cancelled order has nothing left to send: the answer is a 204 with an empty body",
              "Because Java methods can't return a Snack",
              "Because the SQL has no result",
            ],
            answer: 0,
            explain: "@ResponseStatus decides the status; void means no body. Nothing to read, so nothing for a page to parse.",
          },
        },
        {
          task:
            "Cancel a real test order. This line places a test order of 19 Kutsinta (the 19 marks it as a test) and then cancels THAT order, using the number the app just gave it, so it can't touch any other order. In the Console of localhost:8080/menu.html run it, and write the three lines it prints:\n\nfetch(\"/api/orders\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 90, qty: 19 }) }).then(r => r.json()).then(o => { console.log(\"order\", o.order_id); return fetch(\"/api/orders/\" + o.order_id, { method: \"DELETE\" }); }).then(r => { console.log(r.status, r.ok); return r.text(); }).then(t => console.log(\"[\" + t + \"]\"))\n\nThen look for that order on localhost:8080/orders.html and with  SELECT * FROM sales ORDER BY sale_id DESC;  (it is gone).",
          hint: "The first printed line is order and its number, the second is 204 true, and the third is [], square brackets with nothing between them: the body is empty. The order is gone from the board and from the table.",
          check: {
            question: "The console printed  204 true  and then  [].  What does the empty pair of brackets prove?",
            choices: [
              "That the delete failed",
              "That the answer had no body: a 204 carries nothing",
              "That the order is still there",
            ],
            answer: 1,
            explain: "r.text() of a 204 is an empty string, and the brackets I put around it make the emptiness visible.",
          },
        },
        {
          task:
            "The first version's lie. PREDICT, then run in the Console of localhost:8080/menu.html:\n\n" +
            consoleDelete('"/api/orders/99999"') +
            "\n\nWhat will an order that doesn't exist answer?",
          hint: "Monday's first version of updateSnack. Nothing in cancelOrder reads what .update() returns, and a DELETE that matches no row is not an error.",
          check: {
            question: "What does the first version answer for order 99999?",
            choices: [
              "404",
              "500",
              "204: it never looked at the count, so 'nothing was there' looks exactly like 'it was removed'",
            ],
            answer: 2,
            explain: "The same lie as Monday. 'Removed' and 'was never there' end in the same table, but the customer deserves to know which one happened.",
          },
        },
        {
          task:
            "Fix it with the count. Replace the whole cancelOrder method with this one: it keeps .update()'s number in a variable called removed and throws when it is 0. Restart and run the 99999 line again:\n\n" +
            CANCEL_ORDER +
            "\n\nThen run this line, which places a test order of 19, cancels it, and cancels the SAME order a second time. Write the two statuses it prints:\n\nfetch(\"/api/orders\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 90, qty: 19 }) }).then(r => r.json()).then(o => fetch(\"/api/orders/\" + o.order_id, { method: \"DELETE\" }).then(a => fetch(\"/api/orders/\" + o.order_id, { method: \"DELETE\" }).then(b => console.log(a.status, b.status))))",
          hint: "Compare with Monday's updateSnack: int removed = jdbc.sql(…).update(); then if (removed == 0) throw a 404. The line prints 204 404: the first DELETE answers 204 and the second 404 with No order with id N.",
          check: {
            question: "The same DELETE sent twice answers 204 and then 404. Is the table different after the second one?",
            choices: [
              "Yes: another order is removed",
              "No: the table is the same after both; only the answer changed, because the second time there was nothing to remove",
              "Yes: the order comes back",
            ],
            answer: 1,
            explain: "Sending a DELETE again leaves the table exactly as the first one did. That is what idempotent means (the video's word): the effect is the same, even though the answer differs.",
          },
        },
        {
          task:
            "The mistake a page makes with a 204. This line places a test order of 19 and cancels it, but asks for JSON from the answer, which has none:\n\nfetch(\"/api/orders\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 90, qty: 19 }) }).then(r => r.json()).then(o => fetch(\"/api/orders/\" + o.order_id, { method: \"DELETE\" })).then(r => r.json()).then(console.log).catch(e => console.log(e.name + \": \" + e.message))\n\nWrite what it printed. The order IS deleted: check the board.",
          hint: "In Chrome it prints SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input. The delete worked; the page's own .json() call failed on an answer with nothing in it. So a page must look at response.status (or ok) and not call .json() for a 204.",
          check: {
            question: "The error says the JSON input ended unexpectedly, and yet the order was deleted. What went wrong?",
            choices: [
              "The app sent broken JSON",
              "MySQL lost the connection",
              "The delete worked; the page tried to read JSON from an answer that has no body at all",
            ],
            answer: 2,
            explain: "A page that blindly calls .json() on every answer shows an error for a success. Check response.status === 204 first, and only read JSON for the answers that have some.",
          },
        },
        {
          task:
            "Compare. After today's lab your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter). Then remove any test orders that are left. WARNING first: this DELETE removes every Kutsinta sale of exactly 19, which is only your tests:\n\n" +
            SQL_CLEAN_TEST_ORDERS +
            "\n\n" +
            CONTROLLER_D3,
          hint: "Common differences: the DeleteMapping import missing; void turned into a type; removed declared but never tested; AND snack_id IS NOT NULL missing from the SQL; @ResponseStatus left off (then the answer is 200, not 204).",
        },
        {
          task:
            "Add Part 1 to notes.md: the SQL habit in one sentence, what the first version of cancelOrder answered for a missing order and why, what a page must do with a 204, and why sending the same DELETE twice leaves the same table.",
          hint: "Write it in your own words. Your habit sentence starts with 'Before a DELETE I …'.",
          input: "Paste Part 1 of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-cancel-order",
      title: "🧪 Part 1 · Checkpoint: an order that really goes",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080), prints the answer and copies it. A DELETE has no body, so these lines copy a small summary instead. The first task makes its own order and removes it again, so it leaves nothing behind. Yesterday's app answers 405 to every DELETE.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It orders 19 Kutsinta, cancels the order, looks it up, cancels it again, and checks that no other order went with it. Paste what it copies.",
          command: CANCEL_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "first_status", equals: 204, message: "The first DELETE should answer 204. A 405 means cancelOrder isn't registered (restart, and check @DeleteMapping); a 200 means @ResponseStatus(HttpStatus.NO_CONTENT) is missing." },
            { path: "first_body_empty", equals: true, message: "A 204 has no body. If this is false, the method returns something: make it void." },
            { path: "lookup_status", equals: 404, message: "After the DELETE, asking for the order should give 404. If it is 200 the DELETE didn't remove the row: is the WHERE on sale_id with .param(id)?" },
            { path: "second_status", equals: 404, message: "The second DELETE of the same order should answer 404. If it is 204, the count isn't checked yet." },
            { path: "second_message", contains: "No order with id", message: "The second answer's message should say  No order with id N." },
            { path: "other_orders_kept", equals: true, message: "Another order disappeared with it! Check the WHERE: it must name only sale_id = ?." },
          ],
          hint: "The line orders, deletes, looks up, deletes again, and counts the orders. If other_orders_kept is false, the WHERE is wrong or missing.",
          solution: CANCEL_ORDER,
          example: EX.d3Roundtrip,
          previousStage: PREV.d3Roundtrip,
          explain: "A row went from your sales table, only that row, and the app can tell the difference between 'removed' and 'never there'.",
        },
        {
          goal: "An order that doesn't exist. Run this line on a localhost:8080 page and paste what it copies.",
          command: consoleDelete('"/api/orders/99999"'),
          checks: [
            { is: "object", message: "This should be a small object starting with {." },
            { path: "status", equals: 404, message: "The status should be 404. A 204 means the count isn't checked: the first version's lie." },
            { path: "message", equals: "No order with id 99999", message: "The message should be exactly  No order with id 99999  with the number in it." },
          ],
          hint: "int removed = …update();  if (removed == 0) throw 404 \"No order with id \" + id.",
          solution: CANCEL_ORDER,
          example: EX.d3NotFound,
          previousStage: PREV.d3NotFound,
          explain: "The first version answered 204 to this very line.",
        },
      ],
    },
    ...day3Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five ways to cancel the wrong thing",
      intro: "Two of these patients are stories to learn from and never to run: they describe a DELETE that would remove more than it should. Say what's wrong and what you would change.",
      missions: [
        {
          task: "Patient 1, a story. A student's SQL is  DELETE FROM sales WHERE snack_id = ?  and the .param is  id,  the order number. DELETE /api/orders/90 answered 204.",
          hint: "Which column is snack_id, and what is 90 in Week 8's ledger? How many rows have it?",
          check: {
            question: "What did that request do?",
            choices: [
              "Removed order 90",
              "Removed EVERY sale of snack 90: the WHERE compares the wrong column, so it matched all of Kutsinta's sales, history included",
              "Nothing",
            ],
            answer: 1,
            explain: "A WHERE on the wrong column is as dangerous as no WHERE. The count that came back was large, and nothing in the first version looked at it.",
          },
        },
        {
          task: "Patient 2, a story. A student wrote the SQL as  \"DELETE FROM sales\"  with no WHERE and kept  .param(id).  The first DELETE answered with a 500 about parameters, and nothing was deleted. The student 'fixed' the error by deleting the .param line.",
          hint: "A ? mark has to exist for every .param. What does the SQL now say about which rows to remove?",
          check: {
            question: "What does the 'fixed' version do?",
            choices: [
              "Removes order 40",
              "Nothing: DELETE needs a .param",
              "Removes every row of sales: the error was the only thing protecting the ledger, and 'fixing' it removed the protection",
            ],
            answer: 2,
            explain: "A statement with no WHERE has nothing for .param to fill, and the error was a warning. Read the SQL before you silence an error.",
          },
        },
        {
          task: "Patient 3. Run shows red under  DeleteMapping  and 'Build failed, do you want to continue?'. The student presses Continue.",
          hint: "Which line did Day 3 say to add under the other imports? And which button must you never press?",
          check: {
            question: "What do you tell them?",
            choices: [
              "Continue is fine: the old code will run",
              "Never Continue: add the import  import org.springframework.web.bind.annotation.DeleteMapping;  then run again",
              "Delete the method",
            ],
            answer: 1,
            explain: "Continue runs the LAST WORKING build, so the new endpoint silently doesn't exist and every test says 405. Fix the red first.",
          },
        },
        {
          task: "Patient 4. The board's Cancel button writes nothing, the row stays, and the Console shows a red SyntaxError ending  Unexpected end of JSON input.  The student's code is  fetch(…, { method: \"DELETE\" }).then(response => response.json()).then(data => { … }).  In SQLTools the order is gone.",
          hint: "Look at what you did in the lab's eighth mission.",
          check: {
            question: "What is wrong?",
            choices: [
              "The app didn't delete the order",
              "The browser blocked the request",
              "The page calls response.json() on a 204, which has no body: check response.status === 204 first, then write the message and load the list again",
            ],
            answer: 2,
            explain: "The delete worked; the page failed afterwards. The row only seems to 'stay' because loadOrders() was never called.",
          },
        },
        {
          task: "Patient 5. Two staff members have the board open. One cancels order 40. The other, whose table is out of date, presses Cancel on the same row. The message says  Sorry: No order with id 40.  She says 'the site is broken'.",
          hint: "What was true of the table in her tab, and what was true of MySQL?",
          check: {
            question: "Is it broken?",
            choices: [
              "Yes: a cancel should always work",
              "No: her tab showed an old list; the app told her the truth (404, the order is already gone), and a refresh brings her up to date",
              "Yes: the app should have said 204",
            ],
            answer: 1,
            explain: "The 404 is the feature working: the app knew the order was gone. A stale page is not a bug in the app. (You'll try this exact thing in Part 2.)",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you would check, and then your own WHERE rule: what three things do you check before you run any DELETE?",
          hint: "Patient 1 says what the WHERE compares; the lab says what to run first; Patient 2 says what to read.",
          input: "Paste your five notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own cancel",
      intro:
        "Make the canteen's cancelling smarter. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Ideas: (1) print each cancellation to the terminal with System.out.println(\"Cancelled order \" + id); (2) make the board's message say WHAT was cancelled, for example 'Order 40 (2 × Kutsinta) is cancelled', by reading the row's own cells in cancelOrder before the fetch; (3) after a cancel, let the board offer an Undo button that places the same order again with POST (it gets a new number); (4) change the Cancel button's text to the order's name ('Cancel Kutsinta'); (5) harder: refuse to cancel an order from an earlier day with 409 \"Only today's orders can be cancelled\", by first asking MySQL (SELECT sale_id FROM sales WHERE sale_id = ? AND sold_on < CURRENT_DATE, read with .query(Integer.class).optional()) and throwing before the DELETE when it finds a row.",
          hint:
            "Keep every checkpoint passing: don't change cancelOrder's answers for today's orders. For idea 5, remember that the history sales of Week 8 are from 2000, so they would be refused: that's the point, and a test order placed today still cancels. Test a new endpoint in the Console with a line like today's.",
        },
        {
          task: "Paste what you added: the new lines (and which file), how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I cancelled a test order and the board said Order 40 (19 × Kutsinta) is cancelled.'",
          input: "Paste your new lines, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-empty-table",
    title: "⚔️ Boss battle: The Empty Table",
    intro: "The Empty Table wipes a table with one forgotten word. Keep the WHERE.",
    boss: { name: "the Empty Table", emoji: "🪑" },
    questions: [
      {
        prompt: "What does a DELETE with no WHERE do to its table?",
        choices: [
          "Removes every row of that table",
          "Removes nothing: it has no WHERE",
          "Removes the newest row",
        ],
        answer: 0,
        explain: "No WHERE means every row. Nothing in MySQL or JDBC stops it.",
      },
      {
        prompt: "Which habit shows you which rows a DELETE will remove?",
        choices: [
          "Writing the SELECT with the same WHERE and reading its rows first",
          "Running the DELETE twice",
          "Restarting MySQL",
        ],
        answer: 0,
        explain: "The SELECT is a preview of the DELETE.",
      },
      {
        prompt: "What does a 204 mean?",
        choices: [
          "The request failed",
          "A new row was created",
          "It worked, and there is no body to read",
        ],
        answer: 2,
        explain: "A success with an empty body. Nothing to parse.",
      },
      {
        prompt: "Why does cancelOrder return void?",
        choices: [
          "A cancelled order has nothing to send back",
          "Because Java requires it",
          "Because DELETE can't return JSON in any case",
        ],
        answer: 0,
        explain: "@ResponseStatus(NO_CONTENT) makes the status; void makes the empty body.",
      },
      {
        prompt: "The first version of cancelOrder answered 204 for order 99999. Why?",
        choices: [
          "MySQL removed it",
          "Order 99999 existed",
          "It never looked at the count, and a DELETE that matches no row is not an error",
        ],
        answer: 2,
        explain: "Same as Monday: no error is not the same as something done.",
      },
      {
        prompt: "A page runs  response.json()  on a 204. What happens?",
        choices: [
          "It returns an empty object",
          "It returns null",
          "It throws 'Unexpected end of JSON input': there is no JSON to read",
        ],
        answer: 2,
        explain: "Check response.status === 204 first. The order was deleted; only the page's reading failed.",
      },
      {
        prompt: "The same DELETE is sent twice. Which is true?",
        choices: [
          "The table after the second is the same as after the first, though the second answers 404",
          "The second removes another row",
          "The second answers 204 again, in the finished app",
        ],
        answer: 0,
        explain: "Idempotent: the effect is the same. The answer differs, because the second time there was nothing to remove.",
      },
      {
        prompt: "A student's SQL is  DELETE FROM sales WHERE snack_id = ?  with  .param(id)  where id is an ORDER number. What is wrong?",
        choices: [
          "Nothing",
          "It compares the order number with the snack column, so it can remove every sale of one snack",
          "The ? is in the wrong place",
        ],
        answer: 1,
        explain: "A wrong WHERE can be as bad as none.",
      },
      {
        prompt: "Why does the board ask the app for the list again after a cancel?",
        choices: [
          "The browser needs a refresh",
          "To restart the app",
          "The page draws what it last fetched, and that list is now out of date",
        ],
        answer: 2,
        explain: "After a change, fetch again so the page shows the truth.",
      },
      {
        prompt: "What does  confirm(\"Cancel order 40?\")  do in a browser?",
        choices: [
          "Shows an OK / Cancel box and returns true or false, so the page can stop before sending anything",
          "Cancels order 40",
          "Prints to the terminal",
        ],
        answer: 0,
        explain: "It's a cheap safety: a click on the board can't remove an order by accident. (The app's own checks still matter.)",
      },
      {
        prompt: "Two staff have the board open. One cancels order 40, the other cancels it a moment later. The second sees 'Sorry: No order with id 40'. What is the right reading?",
        choices: [
          "The app told the truth: the order was already gone",
          "A bug in the app",
          "MySQL lost the order",
        ],
        answer: 0,
        explain: "404 from the count. A stale page isn't a broken app.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what happens, step by step, from pressing Cancel on the orders board to a row leaving the sales table. Name the verb, the status and every layer.",
      "What does a DELETE with no WHERE do, what three things do you check before you run any DELETE, and why did you practise on a copy?",
      "What did the first version of cancelOrder answer for an order that wasn't there, and what one line fixed it?",
      "What is a 204, and what must a page do (and not do) with it?",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Orders can be changed and cancelled. Tomorrow you remove a snack from the menu, and the database is going to say no: a snack that has been sold is pointed at by sales, and MySQL won't let a pointed-at row disappear.",
  },
};
