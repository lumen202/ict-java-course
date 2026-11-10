// unit3-week9 · Day 4 — Remove a snack: the foreign-key wall, and a 409
//
// DELETE /api/snacks/{id} runs DELETE FROM snacks WHERE snack_id = ?. Built twice: the first version
// has no catch, so a snack that sales (or a special) point at gives a 500 that carries MySQL's Error
// 1451 text; the finished version catches DataIntegrityViolationException and throws a 409 "Snack N is
// used by a sale or a special", then turns a count of 0 into a 404. The lesson of the day: MySQL's
// foreign key is the wall that protects the ledger, and the way through it is to remove the children
// first (cancel the sales), never to switch the wall off.
// Observed on a real build (2026-11-03):
//  - first version: DELETE /api/snacks/90 → 500, message "PreparedStatementCallback; SQL [DELETE FROM
//    snacks WHERE snack_id = ?]; Cannot delete or update a parent row: a foreign key constraint fails
//    (`school`.`sales`, CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`snack_id`) REFERENCES `snacks`
//    (`snack_id`))"; the terminal's stack names org.springframework.dao.DataIntegrityViolationException
//    and java.sql.SQLIntegrityConstraintViolationException; a special pointing at the snack gives the
//    same 500 with `school`.`specials`; a snack nothing points at → 204, then 404;
//  - finished version: 409 "Snack N is used by a sale or a special"; cancel the sale (DELETE the order),
//    then the snack goes → 204; Kutsinta (90) stays on the menu;
//  - in SQL the same refusal is "ERROR 1451 (23000): Cannot delete or update a parent row: a foreign
//    key constraint fails (`school`.`sales`, CONSTRAINT `sales_ibfk_1` …)"; deleting the child rows first
//    (DELETE FROM sales WHERE snack_id = 8100) lets the parent go;
//  - SET FOREIGN_KEY_CHECKS = 0 lets the DELETE through and leaves a sale pointing at a snack that no
//    longer exists: it is still in /api/sales (snack_id 8200) and the INNER JOIN of /api/orders silently
//    drops it. This is the video's mistake; the lesson never runs it on sales, only describes it.
// Video (transcript read 2026-11-03): Bro Code, "MySQL: ON DELETE" (vANfY96ccOY, 7:30): only 0:00–1:10 is
// assigned (the refusal). At about 1:05 he switches the check off (SET FOREIGN_KEY_CHECKS = 0) and leaves
// an orphaned row; the rest is ON DELETE SET NULL and CASCADE, which this course doesn't use.
// The gauntlet's facts were observed in SQL on a real supplies/purchases ledger (Error 1451, 0 rows
// affected for a missing id, "Rows matched: 1  Changed: 0", a DELETE of the child rows letting the parent go).

import type { DayPlan } from "../../types";
import { day4Part2 } from "./day4-part2";
import { EX, PREV } from "./captured";
import { KUTSINTA_STAYS, SNACK_LIFECYCLE, SNACK_WALL, consoleDelete } from "./commands";
import {
  CONTROLLER_D4,
  DELETE_SNACK,
  DELETE_SNACK_A,
  IMPORT_INTEGRITY,
  SQL_CLEAN_CHECKS,
  SQL_CLEAN_TEST_ORDERS,
} from "./snippets";

const SQL = "Ctrl+E, then Ctrl+E again";

export const day4: DayPlan = {
  day: "Day 4",
  focus: "Remove a snack: DELETE through your API, the wall MySQL puts around a snack that was ever sold, and a 409 that says so",
  warmupGame: {
    kind: "quest",
    id: "warmup-the-wall",
    title: "🧱 Warm-up: who points at whom?",
    intro: "Week 3 gave sales a foreign key to snacks. Until now it only refused bad INSERTs. Today it refuses something else.",
    missions: [
      {
        task: "In your tables, every row of sales has a snack_id, and the foreign key says: that number must exist in snacks. So a sale POINTS AT a snack. The snack is the parent, the sale is the child.",
        hint: "Week 3 Day 1: which table did you create first, and why?",
        check: {
          question: "Which row can't be deleted while the other exists?",
          choices: [
            "The sale, while its snack exists",
            "The snack, while any sale points at it: otherwise the sale would point at nothing",
            "Neither: MySQL allows both",
          ],
          answer: 1,
          explain: "A pointer to nothing is the worst thing a ledger can hold, so MySQL refuses to delete the parent while children point at it. Deleting the child is always allowed.",
        },
      },
      {
        task: "Week 8 showed this wall from the other side: an order for snack 99 was refused by Error 1452. Removing a snack that has sales is the mirror image, and MySQL's number for it is 1451.",
        hint: "The foreign key checks both directions: no child without a parent, and no parent while it has children.",
        check: {
          question: "What does Error 1451 say, in short?",
          choices: [
            "The snack doesn't exist",
            "The password is wrong",
            "Cannot delete or update a parent row: a foreign key constraint fails",
          ],
          answer: 2,
          explain: "'Parent row' is the snack. 'Constraint fails' is the foreign key doing its job.",
        },
      },
      {
        task: "Suppose your app tries to delete snack 90 and MySQL refuses. The customer did nothing wrong, and the server didn't break; the request simply conflicts with data that exists. In Week 8 a duplicate snack number was a request like that, and it got a 409.",
        hint: "Week 8 Day 3 Part 2: DuplicateKeyException became which status?",
        check: {
          question: "Which status fits 'this can't be done, because of what the table already holds'?",
          choices: [
            "500 Internal Server Error",
            "409 Conflict",
            "204 No Content",
          ],
          answer: 1,
          explain: "A 500 says 'the server broke'. Here the server is working perfectly and saying no, and the page needs to say why.",
        },
      },
    ],
  },
  videos: [
    {
      title: "MySQL: ON DELETE, only the first minute (Bro Code)",
      youtubeId: "vANfY96ccOY",
      length: "7:30",
      practice: {
        intro: "Watch ONLY 0:00 to 1:10. He tries to delete a customer that transactions point at, and MySQL refuses with 'Cannot delete or update a parent row'. STOP at about 1:05: right after, he runs  SET FOREIGN_KEY_CHECKS = 0  to switch the protection off and force the delete through. Do not copy that: it leaves rows pointing at something that no longer exists. Everything after 1:10 is ON DELETE SET NULL and CASCADE, which you won't use.",
        steps: [
          "Write in notes.md: what is his parent table and what is his child table, and which one did he try to delete from?",
          "Write: what did he do at about 1:05 to get around the refusal, and in one sentence why that leaves the ledger worse than before?",
        ],
        note: "Your parent is snacks and your child is sales. The wall he got around is the one that protects your history of sales: today the app keeps it and says why.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: DELETE /api/snacks/{id}",
      intro:
        "First the wall in SQL, on a practice snack with a practice sale, so nothing real is at risk. Then the endpoint: first the quick version, which reaches the wall and fails, then the version that says why. Restart after every change to a .java file.",
      missions: [
        {
          task:
            "The wall in SQL. In queries.sql run these five, one at a time (" +
            SQL +
            "), and write in notes.md what each one answered. First run  SELECT * FROM snacks WHERE snack_id = 8100;  If it shows a row, 8100 is taken: use 8101 (or the next free number, checking the same way) in every statement below. The practice snack is number 8100 and its sale has qty 19, so nothing real matches these statements:\n\nINSERT INTO snacks (snack_id, name, price) VALUES (8100, 'Practice', 5);\n\nINSERT INTO sales (snack_id, sold_on, qty) VALUES (8100, CURRENT_DATE, 19);\n\nDELETE FROM snacks WHERE snack_id = 8100;\n\nDELETE FROM sales WHERE snack_id = 8100;\n\nDELETE FROM snacks WHERE snack_id = 8100;\n\nThe third one is refused. If it is NOT refused, your ledger was built without Week 3's foreign key, so it has no wall. Write that in notes.md, run  DELETE FROM sales WHERE snack_id = 8100;  and Week 3 Day 4's line  ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);  and then do this mission again from the first INSERT. Do NOT delete Kutsinta (snack 90) anywhere today until the third statement is refused.",
          hint:
            "The third statement answers Error 1451 Cannot delete or update a parent row: a foreign key constraint fails, with the names of your tables in the brackets. The fourth removes the practice sale (nothing else has snack_id 8100), and after it the fifth works. If your snack number 8100 was taken, you are using the next free number everywhere.",
          check: {
            question: "Why did the last DELETE work when the third one didn't?",
            choices: [
              "MySQL forgot the rule",
              "The practice sale, the only row pointing at the snack, was gone: children go first, then the parent",
              "The second try is always allowed",
            ],
            answer: 1,
            explain: "The foreign key says no parent may go while a child points at it. Remove the child and the parent is free. The order matters: the wall protects the history.",
          },
        },
        {
          task:
            "First version of the endpoint. The DeleteMapping import is already there from Wednesday. Inside SnackController, as the very last thing, just above the final closing brace, type:\n\n" +
            DELETE_SNACK_A +
            "\n\nIt is Wednesday's cancelOrder for the snacks table, with the same two parts: the count and the 404. Restart the app.",
          hint: "If the snacks table has a snack nobody has ordered, this works; the next missions find out what happens when somebody has. The method name is deleteSnack and the address is  /api/snacks/{id},  the same address as getSnack and updateSnack, with the verb DELETE.",
          check: {
            question: "getSnack, updateSnack and deleteSnack all use the address  /api/snacks/{id}.  How does Spring tell them apart?",
            choices: [
              "By the verb: GET, PUT and DELETE are different mappings for the same address",
              "By the method's name",
              "It can't: it picks the first",
            ],
            answer: 0,
            explain: "An address names a thing; the verb says what to do with it. That's the whole REST idea you've been building since Week 7.",
          },
        },
        {
          task:
            "A snack nobody has ordered. Add one with the Console of localhost:8080/menu.html (this is Week 8's POST /api/snacks), then remove it, then remove it again. Write all three statuses:\n\n" +
            "fetch(\"/api/snacks\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 8101, name: \"Nobody orders me\", price: 5 }) }).then(r => console.log(r.status))\n\n" +
            consoleDelete('"/api/snacks/8101"') +
            "\n\n(run the second line twice)",
          hint: "The POST prints 201. The first DELETE copies {\"status\":204,…} and the second {\"status\":404,…} with No snack with id 8101: the count idea again, now a third time. If the POST answers 409, snack 8101 is taken: use another number in all three lines (add 10, for example).",
          check: {
            question: "Why does the first DELETE answer 204 and the second 404?",
            choices: [
              "The first removed a row (count 1) and the second found none (count 0)",
              "The second one is slower",
              "The browser cached the first",
            ],
            answer: 0,
            explain: "The same count that told you a snack was missing on Monday and an order on Wednesday.",
          },
        },
        {
          task:
            "Now the wall, through your app. First check that Kutsinta really has sales:  SELECT * FROM sales WHERE snack_id = 90;  must show rows (Week 8's test sales). If it shows none, skip this mission and every other step of today that removes Kutsinta. Then run this in the Console of localhost:8080/menu.html. It is Kutsinta, which has sales, so MySQL will refuse. Write the status and the message, then look at the terminal where the app runs and find the line that names the exception:\n\n" +
            consoleDelete('"/api/snacks/90"') +
            "\n\nThen check Kutsinta is still on the menu page.",
          hint:
            "The answer is 500 with a long message that starts PreparedStatementCallback; SQL [DELETE FROM snacks WHERE snack_id = ?]; Cannot delete or update a parent row…  In the terminal the first line of the stack says  org.springframework.dao.DataIntegrityViolationException  and a line further down says  java.sql.SQLIntegrityConstraintViolationException.  Kutsinta is safe: MySQL refused.",
          check: {
            question: "What is wrong with answering 500 here?",
            choices: [
              "Nothing: it is a server error",
              "The customer did nothing wrong and the server didn't break: it's a conflict with data that exists, and the answer shows part of your SQL",
              "The status should have been 404",
            ],
            answer: 1,
            explain: "Spring turns MySQL's refusal into DataIntegrityViolationException, and an exception nobody catches becomes a 500 with its message. The app knows what happened, so it should say so.",
          },
        },
        {
          task:
            "Catch it. (1) Under the other import lines add:\n\n" +
            IMPORT_INTEGRITY +
            "\n\n(2) Replace the whole deleteSnack method with this one. The DELETE now sits inside a try, and the catch turns the refusal into a 409 with a sentence. Declaring  int removed;  before the try lets the count test come after it:\n\n" +
            DELETE_SNACK +
            "\n\nRestart, and run the Kutsinta line again.",
          hint: "It is the same shape as addSnack's DuplicateKeyException catch from Week 8. The catch's type is DataIntegrityViolationException: it covers the foreign-key refusal. If removed is red ('might not have been initialized'), the line  int removed;  is missing above the try.",
          check: {
            question: "Which exception does the catch name, and what does it cover?",
            choices: [
              "DuplicateKeyException: the same as Week 8",
              "ResponseStatusException",
              "DataIntegrityViolationException: the refusal when a write would break a rule of the data, including the foreign key",
            ],
            answer: 2,
            explain: "DuplicateKeyException is one kind of data-integrity problem; a foreign key refusal is another, and both are subtypes of DataIntegrityViolationException. Naming it catches the refusal you meant.",
          },
        },
        {
          task:
            "Unwind it through the app, in four lines. In the Console of localhost:8080/menu.html run these in order, one at a time. They add a snack, order it once, try to remove the snack (refused), cancel the order, and remove the snack (allowed). The second line keeps the new order's number in the browser (window.testOrder), and the fourth line cancels exactly that order, so a typo can't cancel another one; run the lines in order:\n\n" +
            "fetch(\"/api/snacks\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 8102, name: \"Wall test\", price: 5 }) }).then(r => console.log(r.status))\n\n" +
            "fetch(\"/api/orders\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 8102, qty: 19 }) }).then(r => r.json()).then(o => { window.testOrder = o.order_id; console.log(o.order_id); })\n\n" +
            consoleDelete('"/api/snacks/8102"') +
            "\n\n" +
            consoleDelete('"/api/orders/" + window.testOrder') +
            "\n\n" +
            consoleDelete('"/api/snacks/8102"') +
            "\n\nWrite the five answers in notes.md, in order.",
          hint: "201, the order number, then 409 Snack 8102 is used by a sale or a special, then 204 for the order, then 204 for the snack. If the fourth line says 400, the second line didn't run: run it first.",
          check: {
            question: "Why did the snack go the second time?",
            choices: [
              "The app tried harder",
              "Cancelling the order removed the only sale pointing at it, so the wall had nothing left to hold",
              "MySQL expires its rules",
            ],
            answer: 1,
            explain: "Exactly the SQL order: children first, then the parent. The app just lets you do it in that order.",
          },
        },
        {
          task:
            "A special is a child too. If an INSERT below is refused as a duplicate, that number is taken: use another everywhere in this mission. In queries.sql run these one at a time and write what each answered, then try the DELETE through the app (Console line below), then clean up. Today's special is whichever row has the highest special_id, so the practice special you insert becomes today's special for a minute, which is why the last statement removes it:\n\nINSERT INTO snacks (snack_id, name, price) VALUES (8103, 'Special test', 9);\n\nINSERT INTO specials (snack_id, special_price) VALUES (8103, 4);\n\n" +
            consoleDelete('"/api/snacks/8103"') +
            "\n\nDELETE FROM specials WHERE snack_id = 8103;\n\nDELETE FROM snacks WHERE snack_id = 8103;\n\nFinally reload localhost:8080/index.html: it should show Kutsinta's special again.",
          hint: "The Console line answers 409 Snack 8103 is used by a sale or a special: the same wall, from specials this time, and the same message. After the two cleanup DELETEs the newest special is Kutsinta's again.",
          check: {
            question: "Why does the message say 'a sale or a special'?",
            choices: [
              "Two different tables point at snacks (sales and specials), and either one makes MySQL refuse",
              "It is a guess",
              "Specials are the same table as sales",
            ],
            answer: 0,
            explain: "Both tables carry a snack_id with a foreign key. The app doesn't need to know which one blocked it: the answer is honest for both.",
          },
        },
        {
          task:
            "Compare. After today's lab your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter). Then remove the leftovers from this week: the Check and Renamed snacks, and any test orders. WARNING: the first removes only snacks whose name starts with Check or Renamed; the second only Kutsinta sales of exactly 19:\n\n" +
            SQL_CLEAN_CHECKS +
            "\n\n" +
            SQL_CLEAN_TEST_ORDERS +
            "\n\n" +
            CONTROLLER_D4,
          hint: "Common differences: the DataIntegrityViolationException import missing; int removed declared inside the try (then the if can't see it); the catch throwing NOT_FOUND instead of CONFLICT. If the first DELETE refuses (a snack named Check… that has a sale), cancel that sale first.",
        },
        {
          task:
            "Add Part 1 to notes.md: the five SQL answers from the first mission, what the first version of deleteSnack answered for Kutsinta and why, what the 409 says and what produced it, and the order in which things have to be removed.",
          hint: "Write it in your own words. The last sentence starts: 'To remove a snack that has been sold, you first have to …'.",
          input: "Paste Part 1 of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-delete-snack",
      title: "🧪 Part 1 · Checkpoint: a snack that goes, and one that can't",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080), prints the answer and copies it. The lines that add a snack use a Check name and a big random number, and remove it again themselves. Wednesday's app answers 405 to every DELETE of a snack.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It adds a snack nobody has ordered, removes it, looks it up, and removes it again. Paste what it copies.",
          command: SNACK_LIFECYCLE,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "created_status", equals: 201, message: "The snack should be created with 201: POST /api/snacks is Week 8's and must still work." },
            { path: "delete_status", equals: 204, message: "The DELETE should answer 204. A 405 means deleteSnack isn't registered (restart, and check @DeleteMapping); a 500 means read the terminal." },
            { path: "delete_body_empty", equals: true, message: "A 204 has no body. If this is false, deleteSnack returns something: make it void." },
            { path: "lookup_status", equals: 404, message: "After the DELETE, GET /api/snacks/{its number} should be 404. If it is 200 the DELETE didn't remove the row." },
            { path: "delete_again_status", equals: 404, message: "The second DELETE should answer 404. If it is 204 the count isn't checked." },
          ],
          hint: "The line adds, deletes, looks up and deletes again. If the second DELETE says 204, check removed == 0 throws the 404.",
          solution: DELETE_SNACK,
          example: EX.d4Lifecycle,
          previousStage: PREV.d4Lifecycle,
          explain: "A row left your snacks table, and the app can tell 'removed' from 'never there'.",
        },
        {
          goal: "The wall. Run this line on a localhost:8080 page and paste what it copies. It adds a snack, orders it, tries to remove the snack, cancels the order, and removes the snack.",
          command: SNACK_WALL,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "wall_status", equals: 409, message: "While a sale points at the snack, DELETE should answer 409. A 500 means the DataIntegrityViolationException isn't caught; a 405 means DELETE isn't registered." },
            { path: "wall_message", contains: "is used by a sale or a special", message: "The message should say  Snack N is used by a sale or a special  with the snack number in it." },
            { path: "cancel_status", equals: 204, message: "Cancelling the order (Wednesday's DELETE) should answer 204." },
            { path: "delete_after_cancel_status", equals: 204, message: "With the sale gone, the snack should be removable: 204." },
          ],
          hint: "The catch must wrap the DELETE and throw  new ResponseStatusException(HttpStatus.CONFLICT, \"Snack \" + id + \" is used by a sale or a special\").",
          solution: DELETE_SNACK,
          example: EX.d4Wall,
          previousStage: PREV.d4Wall,
          explain: "MySQL said no, your app said why, and the snack went only after its history was removed.",
        },
        {
          goal: "A snack that doesn't exist. Run this line on a localhost:8080 page and paste what it copies.",
          command: consoleDelete('"/api/snacks/99999"'),
          checks: [
            { is: "object", message: "This should be a small object starting with {." },
            { path: "status", equals: 404, message: "The status should be 404. A 204 means the count isn't checked." },
            { path: "message", equals: "No snack with id 99999", message: "The message should be exactly  No snack with id 99999  with the number in it." },
          ],
          hint: "if (removed == 0) throw 404 \"No snack with id \" + id, after the try/catch.",
          solution: DELETE_SNACK,
          example: EX.d4NotFound,
          previousStage: PREV.d4NotFound,
          explain: "The count again, a third table in.",
        },
        {
          goal: "Kutsinta has sales, so it must stay. Run this line on a localhost:8080 page and paste what it copies. It first checks in /api/sales that Kutsinta really has a sale, and only then tries the delete; MySQL refuses it, so nothing is lost.",
          command: KUTSINTA_STAYS,
          checks: [
            { is: "object", message: "This should be a small object starting with {." },
            { path: "has_sales", equals: true, message: "Kutsinta has no sales in your ledger, so the line didn't try the delete. Week 8's test sales (Kutsinta, 2000-01-01 and the other two) should be there: put them back from Week 8 Day 1 and Day 4, and check the foreign key from Week 3 Day 4." },
            { path: "delete_status", equals: 409, message: "DELETE of a snack that has sales should answer 409, not 500." },
            { path: "message", contains: "is used by a sale or a special", message: "The message should say  Snack 90 is used by a sale or a special." },
            { path: "still_on_menu", equals: true, message: "Kutsinta must still be on the menu afterwards: GET /api/snacks/90 should be 200." },
          ],
          hint: "If still_on_menu is false, your ledger has no foreign key wall, so Kutsinta was really deleted. Put it back yourself: run  INSERT INTO snacks (snack_id, name, price) VALUES (90, 'Kutsinta', 10);  then Week 3 Day 4's  ALTER TABLE sales ADD FOREIGN KEY (snack_id) REFERENCES snacks (snack_id);  and run this line again.",
          solution: DELETE_SNACK,
          example: EX.d4Kutsinta,
          previousStage: PREV.d4Kutsinta,
          explain: "The first version answered 500 to this very line. The foreign key held both times: only the answer got better.",
        },
      ],
    },
    ...day4Part2,
    {
      kind: "quest",
      id: "week9-gauntlet",
      inline: true,
      title: "🏁 Gauntlet: Kuya Jun's school-supplies shop",
      intro:
        "A shop you have never seen. Kuya Jun keeps two tables, built the way you built yours. supplies (item_id INT PRIMARY KEY, name VARCHAR(50), price INT) holds 1 Notebook 20, 2 Pen 8, 3 Ruler 5, 4 Eraser 3, 5 Crayons 30. purchases (purchase_id INT PRIMARY KEY AUTO_INCREMENT, item_id INT, qty INT, FOREIGN KEY (item_id) REFERENCES supplies (item_id)) holds three purchases: item 5 twice and item 2 once. His app was written exactly like yours. Predict first, then answer.",
      missions: [
        {
          task: "Kuya Jun's app gets  DELETE /api/items/5,  and his deleteItem is written like your finished deleteSnack (try/catch for DataIntegrityViolationException, then the count test). Item 5 has two purchases.",
          hint: "Which table points at supplies, and how many rows point at item 5?",
          check: {
            question: "What does the app answer?",
            choices: [
              "204: the delete worked",
              "404: item 5 doesn't exist",
              "409: MySQL refuses because purchases point at item 5, and the catch turns it into a 409",
            ],
            answer: 2,
            explain: "Same wall, different tables. The code is the same because the idea is the same.",
          },
        },
        {
          task: "The same app gets  DELETE /api/items/99.  No item has that number.",
          hint: "Look at the count. What does a DELETE report when its WHERE matches nothing?",
          check: {
            question: "What does it answer?",
            choices: [
              "409",
              "404: no row was removed, so the count is 0",
              "500",
            ],
            answer: 1,
            explain: "0 rows removed, and nothing was blocked: that is 'no such item'.",
          },
        },
        {
          task: "To remove item 5 properly, Kuya Jun runs  DELETE FROM purchases WHERE item_id = 5;  and then calls the app's DELETE /api/items/5 again.",
          hint: "Which rows were pointing at item 5, and are they still there?",
          check: {
            question: "What does it answer the second time?",
            choices: [
              "409 again",
              "404",
              "204: the purchases are gone, so nothing points at item 5 and the DELETE removes it",
            ],
            answer: 2,
            explain: "Children first, then the parent. The first DELETE also changed history: Kuya Jun's purchases of crayons are gone. That is the price of removing something that was sold.",
          },
        },
        {
          task: "A helper runs  UPDATE supplies SET price = 9;  to 'fix the price of the pen' and presses run without looking.",
          hint: "Where is the WHERE?",
          check: {
            question: "What happens to the table?",
            choices: [
              "Only the pen changes",
              "Nothing: no WHERE is an error",
              "Every item now costs 9",
            ],
            answer: 2,
            explain: "Without a WHERE every row is chosen. The count would have been 5 (or however many rows there are), and a PUT written like Monday's first version would have called that a success.",
          },
        },
        {
          task: "A PUT sends the pen (item 2) its own name and price again:  {\"name\": \"Pen\", \"price\": 8}.  His updateItem is written like your finished updateSnack.",
          hint: "Remember Monday's surprise: the count is rows matched.",
          check: {
            question: "What does the app answer?",
            choices: [
              "404: nothing changed",
              "200: the row matched the WHERE, so the count is 1 even though no value differed",
              "409",
            ],
            answer: 1,
            explain: "Matched is not changed. (SQL itself reports 'Rows matched: 1  Changed: 0' for the same statement.)",
          },
        },
        {
          task: "A student suggests: 'Let's declare the foreign key with ON DELETE CASCADE, so deleting an item removes its purchases automatically and Kuya Jun never sees 409.'",
          hint: "What would happen to the total sales in the ledger when an item is removed? Who decided that history should go?",
          check: {
            question: "Why is that a risky idea for a ledger?",
            choices: [
              "It makes the database slower",
              "It is not allowed in MySQL",
              "It silently erases the purchase history of anything that is removed: the wall was protecting it on purpose",
            ],
            answer: 2,
            explain: "A refusal is a question: 'are you sure you want to lose these?'. CASCADE answers yes for you, every time, with no record.",
          },
        },
        {
          task: "Write your answers to the six scenarios in one line each, and add a seventh of your own: a request Kuya Jun's app could get that you are not sure how it would answer. Predict it, and say how you would find out.",
          hint: "How you'd find out: run the SQL by hand, or send the request and read the status.",
          input: "Paste your seven lines",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five ways to get past the wall (and why not to)",
      intro: "Some of these patients 'solved' the 409. For each, say what happened and what you'd do instead.",
      missions: [
        {
          task: "Patient 1. The console line says  500  and the message starts  PreparedStatementCallback; SQL [DELETE FROM snacks WHERE snack_id = ?]; Cannot delete or update a parent row.  The student's deleteSnack has no try/catch.",
          hint: "Which exception does Spring make out of MySQL's Error 1451, and what happens to an exception nobody catches?",
          check: {
            question: "What do you add?",
            choices: [
              "A try/catch for DataIntegrityViolationException around the DELETE, throwing a 409 with a sentence",
              "A second DELETE",
              "A restart",
            ],
            answer: 0,
            explain: "The first version of the lab. The foreign key is fine: the app just has to explain it.",
          },
        },
        {
          task: "Patient 2, a story. A student watched the video, ran  SET FOREIGN_KEY_CHECKS = 0;  in SQLTools, deleted Kutsinta, and ran  SET FOREIGN_KEY_CHECKS = 1;.  No error. Then orders.html listed several orders fewer than ledger.html has sales, and index.html said No special today.",
          hint: "What do Kutsinta's sales point at now? And what does an INNER JOIN do with a row that has no partner?",
          check: {
            question: "What did switching the check off do?",
            choices: [
              "Nothing visible: the app is fine",
              "It let a parent go while its sales still pointed at it: those sales (and the special) are still in the tables but belong to a snack that no longer exists, and every JOIN silently drops them: the orders, and the special on the home page",
              "It deleted the sales too",
            ],
            answer: 1,
            explain: "The wall wasn't an obstacle, it was the guarantee. Without it the ledger holds pointers to nothing, and totals are wrong without any error. (Observed on a build: the sales stayed in /api/sales, the orders list lost every Kutsinta order, and /api/special answered 404.)",
          },
        },
        {
          task: "Patient 3. A student's catch block says  throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"Snack \" + id + \" is used by a sale or a special\");  The page shows the right sentence, but the status in the Console is 404.",
          hint: "Which status did the lab say for 'conflicts with data that exists'?",
          check: {
            question: "What is wrong?",
            choices: [
              "Nothing: the sentence is right",
              "The sentence is too long",
              "The status must be CONFLICT (409): 404 means 'there is no such snack', which is false, and a page or a test that reads the status will believe it",
            ],
            answer: 2,
            explain: "The words and the number have to tell the same story. A 404 for a snack that exists is a lie a program will act on.",
          },
        },
        {
          task: "Patient 4. DELETE /api/snacks/8103 answers 409, but the student is certain no sale was ever made for it. 'There's nothing pointing at it!'",
          hint: "Which other table has a snack_id and a foreign key? Look at Part 1's mission about specials.",
          check: {
            question: "What do you check first?",
            choices: [
              "SELECT * FROM specials WHERE snack_id = 8103; and SELECT * FROM sales WHERE snack_id = 8103; to see which table still points at it",
              "Restart MySQL",
              "Try the DELETE five more times",
            ],
            answer: 0,
            explain: "A refusal comes from some child. When you don't know which, look in every table that has a snack_id.",
          },
        },
        {
          task: "Patient 5. The student wants staff to remove a snack from the menu so customers stop seeing it, but the snack has years of sales. Every way you've seen today either refuses or erases history.",
          hint: "Think about what the menu really needs: that the customer can't order it, not that the row is gone.",
          check: {
            question: "What does the real problem look like?",
            choices: [
              "There isn't one: just cancel the sales",
              "A snack that has ever been sold can never be removed without destroying its history; the menu needs a way to HIDE a snack while keeping the row",
              "Use CASCADE",
            ],
            answer: 1,
            explain: "That's the honest problem at the end of Week 9, and the way out is next week's: don't delete, retire.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you would check, and then one sentence: why is a foreign key a feature and not a nuisance?",
          hint: "Patient 2 gives you the answer: what is a ledger worth with pointers to nothing?",
          input: "Paste your five notes and your sentence",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own removal",
      intro:
        "Make removing a snack friendlier. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Ideas: (1) print each removal to the terminal with System.out.println(\"Removed snack \" + id) after the 404 test; (2) on the edit page, hide the form after a successful removal:  document.getElementById(\"edit-form\").hidden = true;  inside the 204 branch; (3) make the 409 message say how many sales block it, by counting them first:  jdbc.sql(\"SELECT sale_id FROM sales WHERE snack_id = ?\").param(id).query(Integer.class).list().size()  (needs the catch to have the number: ask before the DELETE, not inside the catch); (4) an endpoint  GET /api/snacks/{id}/sales  listing the sales that block a removal, using the Sale record (a plain SELECT … WHERE snack_id = ? ORDER BY sale_id); (5) harder: an endpoint  GET /api/snacks/removable  listing the snacks nothing points at, with  WHERE NOT EXISTS (SELECT 1 FROM sales WHERE sales.snack_id = snacks.snack_id) AND NOT EXISTS (SELECT 1 FROM specials WHERE specials.snack_id = snacks.snack_id)  (NOT EXISTS is a question asked of a second SELECT; read about it before you type it).",
          hint:
            "Keep every checkpoint passing: don't change deleteSnack's answers. For idea 3, remember the 409 message is checked by the checkpoint with contains 'is used by a sale or a special', so keep that phrase. For idea 5, compare your list with what DELETE actually accepts: every snack in the list must answer 204, and Kutsinta must not be in it.",
        },
        {
          task: "Paste what you added: the new lines (and which file), how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I asked for the sales of snack 90 and got the three test sales.'",
          input: "Paste your new lines, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-parent-row",
    title: "⚔️ Boss battle: The Parent Row",
    intro: "The Parent Row can't be removed while anyone points at it. Know why, and know the way round that doesn't break anything.",
    boss: { name: "the Parent Row", emoji: "🧱" },
    questions: [
      {
        prompt: "In your ledger, which table is the parent and which is the child?",
        choices: [
          "sales is the parent, snacks the child",
          "They're equal",
          "snacks is the parent, sales the child: a sale points at a snack",
        ],
        answer: 2,
        explain: "The child holds the foreign key and points at the parent.",
      },
      {
        prompt: "What does MySQL do when you DELETE a snack that a sale points at?",
        choices: [
          "Deletes the snack and the sale",
          "Refuses with Error 1451 (cannot delete a parent row)",
          "Deletes the snack and leaves the sale",
        ],
        answer: 1,
        explain: "That is the point of a foreign key: no pointer to nothing.",
      },
      {
        prompt: "An uncaught DataIntegrityViolationException reaches the customer as…",
        choices: [
          "A 404",
          "A 409",
          "A 500 whose message contains part of your SQL",
        ],
        answer: 2,
        explain: "Anything nobody catches is a 500. That's why Part 1 catches it.",
      },
      {
        prompt: "Which status says 'I can't do that, because of what the table already holds'?",
        choices: ["409 Conflict", "204 No Content", "404 Not Found"],
        answer: 0,
        explain: "The server is fine and the request is understood; it conflicts with existing data.",
      },
      {
        prompt: "In what order must things go to remove a snack that has been sold?",
        choices: [
          "The snack first, then its sales",
          "Both together in one statement",
          "Its sales first (the children), then the snack (the parent)",
        ],
        answer: 2,
        explain: "The foreign key allows a child to go at any time and a parent only when no child is left.",
      },
      {
        prompt: "deleteSnack declares  int removed;  before the try. Why?",
        choices: [
          "So the count test after the try/catch can still see it",
          "Java requires it",
          "To save memory",
        ],
        answer: 0,
        explain: "A variable declared inside the try can't be seen after it. Declare it outside, assign it inside.",
      },
      {
        prompt: "A student runs  SET FOREIGN_KEY_CHECKS = 0  to get a delete through. What does the ledger have afterwards?",
        choices: [
          "A clean ledger with the snack removed",
          "Sales that point at a snack that no longer exists, which every JOIN silently drops",
          "An error in the next query",
        ],
        answer: 1,
        explain: "The wall protects the ledger. Switching it off damages it without any error.",
      },
      {
        prompt: "Why is ON DELETE CASCADE risky for a ledger?",
        choices: [
          "It deletes the history of anything removed, without asking",
          "It is slow",
          "It stops INSERTs",
        ],
        answer: 0,
        explain: "A refusal is a question; CASCADE answers it for you.",
      },
      {
        prompt: "DELETE /api/snacks/99999, a snack that doesn't exist, answers…",
        choices: ["204", "409", "404 from the count"],
        answer: 2,
        explain: "Zero rows removed and nothing refused means no such snack.",
      },
      {
        prompt: "A snack has a special but no sale. DELETE /api/snacks/{its number} answers…",
        choices: [
          "204: a special isn't a sale",
          "404",
          "409: specials point at snacks too, so the wall holds",
        ],
        answer: 2,
        explain: "Any table with a foreign key to snacks can block the removal.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what is a foreign key, which of your tables is the parent, and what does MySQL refuse because of it?",
      "What did the first version of deleteSnack answer for Kutsinta, what did the finished one answer, and which line made the difference?",
      "In what order do you remove a snack that has been sold, and what does that do to the history?",
      "Why is switching the foreign-key check off never the answer?",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "A snack that has ever been sold can never be removed from the menu without erasing its sales. Tomorrow you finish the week with the last row you can edit and remove, and then you will think about what that means.",
  },
};
