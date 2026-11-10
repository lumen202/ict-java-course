// unit3-week9 · Day 5 (no video) — Edit and remove today's special, the audit, and the hand-in
//
// Part 1: PUT /api/special {special_price} changes the newest special's price (two statements:
// SELECT the newest special_id with .query(Integer.class) in a private helper newestSpecialId(), which
// uses the same FROM and INNER JOIN as Week 8's GET /api/special so PUT, DELETE and GET agree on "newest",
// then UPDATE … WHERE special_id = ?; 400 outside 1–1000; 404 "No special today" when there is no special)
// and DELETE /api/special removes only the NEWEST special (DELETE FROM specials WHERE special_id = ?, the id
// from the same helper), so the one before it is today's special again; 204, or 404 "No special today" when
// there was none). Part 2: special.html + special.js (the staff page for both). Then the self-audit
// and a hand-in that can't be copied from Week 8: a snack named after the student goes through every
// verb of the week and leaves again.
// Observed on a real build (2026-11-03): PUT special_price 9 → 200 {"snack_id":90,"name":"Kutsinta","price":10,
// "special_price":9}; 0 → 400 "special_price must be from 1 to 1000"; DELETE → 204, GET → the older special (or 404 "No special today" when none is left),
// DELETE until none is left → 404, PUT with no special → 404; after INSERT again GET shows the new special. special.html
// in headless Chrome 156: shows "Kutsinta: ₱7 (usually ₱10)", the price box changes it ("The special is now
// ₱8"), Remove (confirm answered OK by the checker) writes "The special is removed." and the page shows
// "No special today.".

import type { DayPlan } from "../../types";
import { day5Part2 } from "./day5-part2";
import { EX, PREV } from "./captured";
import { SPECIAL_PUT_ROUNDTRIP, SPECIAL_REMOVE_ROUNDTRIP, consolePut } from "./commands";
import {
  CONTROLLER_D5,
  REMOVE_SPECIAL,
  NEWEST_SPECIAL_ID,
  SPECIAL_REINSERT_TWO,
  UPDATE_SPECIAL,
} from "./snippets";

const SQL = "Ctrl+E, then Ctrl+E again";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Edit and remove today's special, an audit of the whole week, and a hand-in that goes through every verb",
  warmupGame: {
    kind: "quest",
    id: "warmup-four-verbs",
    title: "🗺️ Warm-up: the four verbs",
    intro: "Last week your app could read and add. This week it learned to change and to remove. Look at what it can do now.",
    missions: [
      {
        task: "Your app now has these ways to touch a snack: GET /api/snacks/{id}, POST /api/snacks, PUT /api/snacks/{id} and DELETE /api/snacks/{id}. The same address, the same table, four verbs.",
        hint: "Which verbs change the table, and which only look?",
        check: {
          question: "Which of the four change the snacks table?",
          choices: [
            "All four",
            "POST, PUT and DELETE: GET only looks",
            "Only DELETE",
          ],
          answer: 1,
          explain: "Add, change and remove are the three ways to write; GET is the only one that leaves the table as it found it. Together the four verbs are what programmers call CRUD: create, read, update, delete.",
        },
      },
      {
        task: "Monday's PUT and Wednesday's DELETE each had a first version that told a lie (200, or 204, for something that was never there), and the second told the truth: the difference was ONE number, what .update() returned. Thursday's first version failed in a different way (a 500 that showed MySQL's text), and a catch fixed that.",
        hint: "Monday's PUT, Wednesday's DELETE, and the 404 that Thursday's DELETE also keeps. What did a count of 0 become?",
        check: {
          question: "What does a count of 0 become in your finished app?",
          choices: [
            "A 200, because nothing went wrong",
            "A 500",
            "A 404 (no such row), and for a snack that is in use, a 409 from the foreign key",
          ],
          answer: 2,
          explain: "0 rows means there was no such thing. A wall from MySQL means there was such a thing and it can't go. Two different problems, two different statuses.",
        },
      },
      {
        task: "Today's special is in the specials table, and Week 8 made GET /api/special read the NEWEST row. Today you add a way to change its price and a way to remove it.",
        hint: "If a table can hold many specials, which one does 'change today's special' mean?",
        check: {
          question: "To change today's special, what does the app have to find out first?",
          choices: [
            "Which row is the newest: the one GET /api/special shows",
            "The name of the snack",
            "The date",
          ],
          answer: 0,
          explain: "The page only knows 'the special'. The app has to find the row that means 'the special' before it can change it.",
        },
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "quest",
      id: "twist-special-edit",
      inline: true,
      title: "🛠️ Part 1 · Lab: change and remove today's special",
      intro:
        "No video today. Two endpoints on the specials table, built on the week's two ideas: the count that .update() returns, and a WHERE that says exactly which rows. Restart after every change to a .java file.",
      missions: [
        {
          task:
            "SQL first. In queries.sql run these one at a time (" +
            SQL +
            "), and write in notes.md what each one showed. First look at the table, newest first. Then use the special_id of the TOP row in place of THE_SPECIAL_ID (it is your own number) to change its price, look again, and put the price back to what it was:\n\nSELECT * FROM specials ORDER BY special_id DESC;\n\nUPDATE specials SET special_price = 9 WHERE special_id = THE_SPECIAL_ID;\n\nSELECT * FROM specials ORDER BY special_id DESC;",
          hint:
            "Only the top row's special_price changes; the other rows (specials from Week 8, if you have more than one) are untouched, because the WHERE names one special_id. Put the price back with another UPDATE with the old number. Your table may have one special or several.",
          check: {
            question: "Why does the UPDATE use  WHERE special_id = …  and not  WHERE snack_id = 90?",
            choices: [
              "snack_id would change EVERY special for that snack, old ones too; special_id names exactly one row",
              "snack_id can't be used in a WHERE",
              "There is no difference",
            ],
            answer: 0,
            explain: "A WHERE on a column many rows share changes them all. The primary key names exactly one row: it's the safe way to point at 'this one'.",
          },
        },
        {
          task:
            "Make sure there are two Kutsinta specials in the table, an older one at ₱6 and a newer one at ₱7, whatever you left there last week. Run these two statements, one at a time (the table is a history of specials and the newest row is today's; later missions change and remove the newest one, and the older one is how you will see that it stays):\n\n" +
            SPECIAL_REINSERT_TWO +
            "\n\nThen reload localhost:8080/index.html: Today's special: Kutsinta at ₱7. The checkpoint's first and third tasks each use up the newest special, so run this pair again before every run of the checkpoint (older rows piling up is fine).",
          hint: "GET /api/special reads the row with the highest special_id, so a new INSERT always becomes today's special. If index.html still shows an old special, reload with Ctrl+Shift+R.",
          check: {
            question: "Why does inserting a row change what index.html shows?",
            choices: [
              "The page re-reads the file",
              "GET /api/special reads the NEWEST row, and index.js asks it every time the page opens",
              "MySQL tells the page",
            ],
            answer: 1,
            explain: "Week 8's chain: the table, the endpoint's ORDER BY special_id DESC LIMIT 1, and the page's fetch. Change the table and the page follows.",
          },
        },
        {
          task:
            "Add the PUT. The PutMapping import is already there. Inside SnackController, as the very last thing, type the record and the method. First a small helper that PUT and DELETE will both use. It finds the newest special's id with the SAME FROM and INNER JOIN as GET /api/special, so the three always agree about which special is the newest (a query that returns just one number says .query(Integer.class)); it throws the 404 when there is no special:\n\n" +
            NEWEST_SPECIAL_ID +
            "\n\nThen the record and the method. The UPDATE changes THAT row by its id:\n\n" +
            UPDATE_SPECIAL +
            "\n\nRestart the app.",
          hint: "The method's last line calls special(), the GET method from Week 8, so the answer is the special as it now is, with the name and the usual price. A red special() means you are outside the class. .optional().orElseThrow(…) is the same shape as getSnack's.",
          check: {
            question: "Why two statements instead of one UPDATE?",
            choices: [
              "The page doesn't know the special's id, so the app first finds the newest one, then changes it by its id",
              "MySQL can't update and select at once",
              "To make it slower on purpose",
            ],
            answer: 0,
            explain: "GET /api/special doesn't send the special_id, only snack_id, name, price and special_price. The app does the finding.",
          },
        },
        {
          task:
            "Test it in the Console of localhost:8080/menu.html. Write the status and the answer of each in notes.md:\n\nthe price to 9:\n\n" +
            consolePut('"/api/special"', '{ special_price: 9 }') +
            "\n\na price of 0:\n\n" +
            consolePut('"/api/special"', '{ special_price: 0 }') +
            "\n\nand put it back to 7:\n\n" +
            consolePut('"/api/special"', '{ special_price: 7 }'),
          hint: "The first answers 200 with the special and special_price 9; reloading index.html shows ₱9. The second is 400 special_price must be from 1 to 1000, and the third restores 7. Chrome prints its own red line for the 400: that is the browser reporting the status.",
          check: {
            question: "The answer to the PUT shows the special with the new price. Where did the app get it?",
            choices: [
              "It built it from the request",
              "It called special(), which reads the row back from MySQL, so the answer shows what the table now holds",
              "From the browser",
            ],
            answer: 1,
            explain: "Same as Tuesday's updateOrder: read it back, so the answer is the truth and not a copy of what was sent.",
          },
        },
        {
          task:
            "Add the DELETE. Below updateSpecial type the method. It removes only the NEWEST special, by its own special_id from the same helper, so the special before it becomes today's special again: the specials table is a history, and taking away today's must not wipe the days before.\n\n" +
            REMOVE_SPECIAL +
            "\n\nRestart the app.",
          hint: "It is Wednesday's cancelOrder with a different table; the .param is the id the helper found. The helper throws the 404 when there is no special at all, and the count test is the same belt-and-braces check as on every other DELETE.",
          check: {
            question: "After DELETE /api/special, what does GET /api/special show when an older special exists?",
            choices: [
              "404 No special today, because a removal always empties the table",
              "The older special: only the newest row was removed, so the one before it is today's special again",
              "An empty list",
            ],
            answer: 1,
            explain: "WHERE special_id = ? names exactly one row. Had it said WHERE snack_id = 90, every special that snack ever had would have gone with it.",
          },
        },
        {
          task:
            "Test it, and put the specials back. In the Console of localhost:8080/menu.html run this line and write what it answers; then reload localhost:8080/index.html (the older special is today's); then keep running the line until it answers 404 (each run removes one special, and the 404 means none are left), and reload index.html once more; then run the pair of INSERTs of the second mission again in queries.sql:\n\nfetch(\"/api/special\", { method: \"DELETE\" }).then(r => { console.log(r.status); return r.text(); }).then(t => console.log(\"[\" + t + \"]\"))",
          hint: "Each run prints 204 and [] while a special is left, and index.html shows the previous one. The run that finds none prints 404 and the JSON body with No special today (so the brackets hold more than nothing), and index.html says No special today. The pair of INSERTs makes the page show Kutsinta again.",
          check: {
            question: "After the LAST special has been removed, GET /api/special answers…",
            choices: [
              "200 with an old special",
              "404 No special today, because the table has no rows left",
              "An empty list",
            ],
            answer: 1,
            explain: "Week 8's 404 for an empty specials table, now reachable from the other side. The home page shows its fallback sentence.",
          },
        },
        {
          task:
            "Compare. After today's lab your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter). It is the whole week's controller:\n\n" +
            CONTROLLER_D5,
          hint: "Common differences: SpecialChange's field spelt specialPrice (it must be special_price, the JSON key); .query(Integer.class) written as .query(int.class); the method returning void.",
        },
        {
          task:
            "Add Part 1 to notes.md: how PUT /api/special finds the row to change and why it doesn't use snack_id, why PUT and DELETE both use the newestSpecialId() helper, what a DELETE of the newest special leaves behind, and the statuses of your console lines.",
          hint: "Write it in your own words. The key idea: PUT and DELETE each name ONE row by its special_id, found by the same helper that GET agrees with.",
          input: "Paste Part 1 of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-special-edit",
      title: "🧪 Part 1 · Checkpoint: change and remove today's special",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080). The first and the third task each USE UP the newest special (they change it and then remove it, to prove an older one is untouched and stays), so before the checkpoint run the pair of INSERTs of the second mission, and run it again after the third task. Today's special must be Kutsinta's. Yesterday's app answers 405 to every PUT and DELETE on /api/special.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It changes today's special to ₱777 with PUT, reads it, removes the newest special with DELETE, and checks an OLDER special is still there and was not changed to 777. Paste what it copies. It needs two specials: run the pair of INSERTs first.",
          command: SPECIAL_PUT_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {. If it is an error body, GET /api/special has no special: run the INSERT from the second mission." },
            { path: "name", equals: "Kutsinta", message: "Today's special should be Kutsinta's: run the pair of INSERTs of the second mission and try again." },
            { path: "changed", equals: true, message: "The price didn't change. A 405 means updateSpecial isn't registered (restart, and check @PutMapping); also check the UPDATE has .param(change.special_price()) first and .param(specialId) second." },
            { path: "answer_agrees", equals: true, message: "The PUT's own answer should show the new price: does updateSpecial end with return special();?" },
            { path: "delete_status", equals: 204, message: "The DELETE after it should answer 204: is removeSpecial registered?" },
            { path: "older_special_unchanged", equals: true, message: "No older special is left, or an older special was changed to 777 too. First run the pair of INSERTs. If it still fails, the UPDATE changes more than one row: it must say  WHERE special_id = ?  with the newest special's id, not WHERE snack_id = … and not no WHERE at all. Put the specials' prices right in SQLTools before going on." },
          ],
          hint: "The line marks the newest special with 777, reads it, removes the newest special and then looks at what is left. If changed is false, the UPDATE matched nothing or the .param order is swapped. If older_special_unchanged is false, either there was only one special or the UPDATE changed several rows.",
          solution: UPDATE_SPECIAL,
          example: EX.d5SpecialPut,
          previousStage: PREV.d5SpecialPut,
          explain: "One endpoint changed it, another read it: the special's price really changed in the table.",
        },
        {
          goal: "A price of 0. Run this line on a localhost:8080 page and paste what it copies.",
          command: consolePut('"/api/special"', '{ special_price: 0 }'),
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {." },
            { path: "status", equals: 400, message: "The status should be 400. A 200 means a special price of 0 was saved: put the right price back, then fix the check." },
            { path: "message", equals: "special_price must be from 1 to 1000", message: "The message should be exactly  special_price must be from 1 to 1000." },
          ],
          hint: "The check comes before the SELECT and the UPDATE.",
          solution: UPDATE_SPECIAL,
          example: EX.d5SpecialZero,
          previousStage: PREV.d5SpecialZero,
          explain: "Refused before MySQL ever saw it.",
        },
        {
          goal: "Run this line on a localhost:8080 page and paste what it copies. It marks the newest special with 777 and then REMOVES the newest special, and checks the marked one is gone. Older specials stay. Afterwards run the pair of INSERTs from the second mission.",
          command: SPECIAL_REMOVE_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "marked", equals: true, message: "The PUT that marks the newest special with 777 didn't work: is updateSpecial registered? Run the pair of INSERTs first if there is no special." },
            { path: "first_status", equals: 204, message: "The DELETE should answer 204. A 405 means removeSpecial isn't registered; a 404 means there was no special to remove (run the pair of INSERTs first)." },
            { path: "first_body_empty", equals: true, message: "A 204 has no body: make removeSpecial void." },
            { path: "marked_special_gone", equals: true, message: "The special marked 777 is still there: the DELETE must remove the NEWEST special by its special_id (WHERE special_id = ?), the one newestSpecialId() found." },
          ],
          hint: "newestSpecialId() finds the row (and throws the 404 when there is none), then  DELETE FROM specials WHERE special_id = ?  with .param(specialId).",
          solution: REMOVE_SPECIAL,
          example: EX.d5SpecialRemove,
          previousStage: PREV.d5SpecialRemove,
          explain: "The whole week's idea once more: 204 when something went, 404 when nothing was there.",
        },
      ],
    },
    ...day5Part2,
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own special",
      intro:
        "Make the special more useful. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Ideas: (1) in special.js, show what is saved:  Saves ₱3  (data.price - data.special_price) beside the special; (2) print each change to the terminal with System.out.println(\"Special now \" + change.special_price()) before the return; (3) in updateSpecial, refuse a special price that is not lower than the snack's usual price with a 400 \"special must be lower than the usual price\" (read the usual price with the GET method's special() first); (4) a way to SET a special:  POST /api/special  taking  {\"snack_id\": 90, \"special_price\": 7}  that INSERTs a row and answers 201 with the special, with a 404 \"No snack with id N\" when the snack doesn't exist (catch DataIntegrityViolationException: it is the foreign key's Error 1452); (5) harder: a second endpoint,  DELETE /api/specials  (plural), that removes EVERY special with  DELETE FROM specials WHERE special_id > 0  (a WHERE true for every row, written on purpose: say so in a comment), answering 204, and decide when a canteen would want that and when it would not.",
          hint:
            "Keep every checkpoint passing. For idea 4, use the same body shape as Week 8's POST /api/snacks and the same catch as Thursday's; the new row becomes today's special at once. For idea 5, read the table with SELECT * FROM specials first, and put your specials back afterwards with the pair of INSERTs.",
        },
        {
          task: "Paste what you added: the new lines (and which file), how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I posted snack 90 at 6 and index.html showed ₱6.'",
          input: "Paste your new lines, how you tested, and what it answered",
        },
      ],
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own app",
      steps: [
        "Run your app, open each page and address at localhost:8080, and mark each line ✅ or ❌ honestly, by doing it, not from memory. Things that change data use a snack of your own or test orders of 19, and you remove them afterwards. The lines are in order of the week, Part 1 then Part 2 of each day.",
        "Monday, Part 1. PUT /api/snacks/{id} changes a snack's name and price (the answer is the snack as it now is), answers 404 'No snack with id 99999' for a snack that doesn't exist, 400 for a blank name or a price outside 1 to 1000, and 200 for a PUT that changes nothing.",
        "Monday, Part 2. edit-snack.html?id=90 opens with the name and price filled in, Save changes the snack and says Saved:, and ?id=99999 says Sorry: No snack with id 99999. I put Kutsinta back to price 10.",
        "Tuesday, Part 1. PUT /api/orders/{id} changes only qty (the answer is the order with the total MySQL calculates), answers 400 for a qty outside 1 to 20 even for an order that doesn't exist, 404 for an order that doesn't exist, and 404 for a sale with no snack (if I have one) without changing it. The history sale (price paid 7) still totals the new quantity times 7.",
        "Tuesday, Part 2. orders.html has a box and a Change button on every row, a change shows Order N now has … and the row redraws, and a quantity of 25 is refused with the app's own sentence.",
        "Wednesday, Part 1. DELETE /api/orders/{id} answers 204 with no body and the order is gone from /api/orders and from sales; the same DELETE again answers 404 'No order with id N'; no other order went with it.",
        "Wednesday, Part 2. Every row of orders.html has a Cancel button that asks first, removes the order, writes Order N is cancelled. and draws the table again; pressing Cancel on an order the other tab already cancelled says Sorry: No order with id N.",
        "Thursday, Part 1. DELETE /api/snacks/{id} answers 204 for a snack nobody has ordered and then 404; answers 409 'Snack N is used by a sale or a special' for Kutsinta; and removes a snack once the sale that pointed at it has been cancelled. I can say in one sentence why the foreign key is a feature.",
        "Thursday, Part 2. edit-snack.html has a Remove button that asks first, writes Snack N is off the menu. for a snack nobody ordered, and writes Sorry: Snack 90 is used by a sale or a special for Kutsinta, which stays on the menu.",
        "Friday, Part 1. PUT /api/special changes the newest special's price and answers the special; a price of 0 answers 400 'special_price must be from 1 to 1000'; DELETE /api/special removes only the NEWEST special (204; the one before it is today's again) and answers 404 'No special today' only when none is left. Kutsinta's two specials are back in the table afterwards.",
        "Friday, Part 2. special.html shows the special with its usual price, changes the price from the box, and removes the special; index.html follows each change with no restart.",
        "Every GET, POST and page from Weeks 5 to 8 still works: /api/snacks (with ?maxPrice, ?name, ?sort), /api/snacks/{id}, /api/sales, /api/orders, /api/orders/{id}, /api/summary, /api/special, /api/rows, menu.html, order.html, orders.html, ledger.html, add-snack.html, tables.html and index.html.",
        "No UPDATE or DELETE in my Java or in my SQLTools history has a missing WHERE, apart from the DELETE on the practice copy of sales on Wednesday, and I dropped sales_practice afterwards.",
        "My ledger has no leftovers: no snack named Check… or Renamed…, no test orders of exactly 19, and the history sale is back to quantity 2.",
        "My notes.md has Monday's lying-first-version story, Tuesday's price-paid note, Wednesday's WHERE rule and 204 note, Thursday's order of removal, and today's note on why PUT and DELETE both use the newest special's special_id.",
        "For every ❌: fix it now. Everything you need is in this week's four days and in today's labs, and the day is yours.",
      ],
      tip: "Not sure how to fix a ❌? Go back to the day it came from: updateSnack, the count and edit-snack.html → Monday. updateOrder, the price paid and the Change column → Tuesday. cancelOrder, the 204, the WHERE habit and the Cancel column → Wednesday. deleteSnack, the 409 and the Remove button → Thursday. The special's PUT and DELETE and special.html → today. Each day's checkpoint still works: paste your answers in again and it tells you the first thing that's wrong.",
      submit: "Paste the list with your ✅/❌ marks (never any part of application.properties), and for each ❌ you fixed, one line on what was wrong",
    },
    {
      kind: "upload",
      id: "screenshot-whole-loop",
      title: "📸 Hand in: a snack that went through every verb",
      intro: "Proof that all four verbs work from pages YOU built, on a snack that exists only in your ledger and is gone again at the end.",
      steps: [
        "Choose a snack number nobody has used: 500 plus the day of the month you were born (for example 517). Open localhost:8080/add-snack.html and add a snack named YOUR FIRST NAME with that number and price 12. If the page says Sorry: Snack … already exists, add 100 to your number and try again.",
        "Open localhost:8080/edit-snack.html?id=YOUR NUMBER (your own number), change the price to 15, press Save, and read Saved:. Then reload the page: 15 is in the box.",
        "On localhost:8080/order.html order YOUR snack, qty 2. Open localhost:8080/orders.html, find the row and change its quantity to 3 with Change.",
        "Go back to edit-snack.html?id=YOUR NUMBER and press Remove (answer OK). It must say Sorry: Snack YOUR NUMBER is used by a sale or a special. Keep that sentence for the screenshot.",
        "On orders.html press Cancel on YOUR order (answer OK). Then on the edit page press Remove again: it must say Snack YOUR NUMBER is off the menu.",
        "Close the application.properties tab in VS Code (it holds your password). Don't open it again before the screenshot.",
        "Arrange the browser (the edit page with the line  Snack … is off the menu.) and VS Code with SQLTools showing the result of  SELECT * FROM snacks WHERE name = 'YOUR FIRST NAME';  with no rows. Both must be visible, with your number in the page's address and in the line.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots, and upload it below.",
      ],
      proves: "that your own pages added a snack, changed it, took an order for it, changed the order, were refused when they tried to remove a snack that had a sale (the 409 from your Java), cancelled the order, and then removed the snack: every verb of the week, end to end, on a number that only you chose.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week9",
    title: "⚔️ Boss battle: The Last Row",
    intro: "The Last Row remembers every rule of the week. Answer for all four verbs.",
    boss: { name: "the Last Row", emoji: "🏁" },
    questions: [
      {
        prompt: "What does .update() return, and what does your app do when it is 0?",
        choices: [
          "The new row; it answers 200",
          "The number of rows matched or removed; it answers 404, because no such row existed",
          "true or false; it answers 500",
        ],
        answer: 1,
        explain: "The count turned a silent lie into an honest answer on three endpoints.",
      },
      {
        prompt: "A PUT sets a row to the values it already has. What does the finished app answer?",
        choices: [
          "404, because nothing changed",
          "409",
          "200, because the row matched the WHERE",
        ],
        answer: 2,
        explain: "The count is rows matched. Not found and not changed are different.",
      },
      {
        prompt: "Why does PUT /api/orders/{id} change only qty and not the price paid?",
        choices: [
          "The price paid was true when the sale was made, and a correction of the count shouldn't rewrite it",
          "MySQL allows one column",
          "Because PUT can't carry two values",
        ],
        answer: 0,
        explain: "The price paid is history. Only the count was wrong.",
      },
      {
        prompt: "What status does a successful DELETE answer, and what is in its body?",
        choices: [
          "200 with a message",
          "201 with the removed row",
          "204 with nothing",
        ],
        answer: 2,
        explain: "204 No Content: it worked and there's nothing to say. A page must not read JSON from it.",
      },
      {
        prompt: "Which habit shows you which rows a DELETE will remove?",
        choices: [
          "Run it on a copy of the table first",
          "Run it twice",
          "Write the SELECT with the same WHERE and read its rows first",
        ],
        answer: 2,
        explain: "The SELECT is a preview of the DELETE. (A copy is for practising the disaster.)",
      },
      {
        prompt: "MySQL refuses to DELETE a snack that a sale points at. What does your finished app answer?",
        choices: [
          "409 Conflict with a sentence, from the catch for DataIntegrityViolationException",
          "500 with MySQL's text",
          "204, and the sale is removed too",
        ],
        answer: 0,
        explain: "The wall protects the ledger and the app explains it.",
      },
      {
        prompt: "In what order do you remove a snack that has been sold?",
        choices: [
          "The snack, then its sales",
          "Its sales (children), then the snack (parent): and that erases the history of those sales",
          "Both with one statement",
        ],
        answer: 1,
        explain: "That's the honest problem at the end of the week.",
      },
      {
        prompt: "What does an UPDATE with no WHERE do?",
        choices: [
          "Changes the first row",
          "Is refused",
          "Changes every row",
        ],
        answer: 2,
        explain: "And a PUT written without looking at the count would answer 200.",
      },
      {
        prompt: "DELETE /api/special removes the newest special with  WHERE special_id = ?.  Why not  WHERE snack_id = 90?",
        choices: [
          "It would remove every special that snack ever had, wiping the history; special_id names exactly one row",
          "Without it MySQL refuses",
          "snack_id can't be used in a WHERE",
        ],
        answer: 0,
        explain: "A WHERE on a column many rows share removes them all. The primary key names one row.",
      },
      {
        prompt: "Why does the orders board call loadOrders() after every successful change or cancel?",
        choices: [
          "To restart the app",
          "Because Spring requires it",
          "Because the table was drawn from an older answer, and the truth now has to be asked for again",
        ],
        answer: 2,
        explain: "A page shows what it last fetched. After a write, fetch again.",
      },
      {
        prompt: "Which swap is the dangerous one: two .param calls of two int columns, or an int and a String?",
        choices: [
          "Neither: both are caught",
          "The int and the String is silent",
          "Two ints: it is saved with the values in the wrong columns, with no error at all",
        ],
        answer: 2,
        explain: "MySQL refuses text in an INT column, but two ints swap without a word. Read the table after writing.",
      },
      {
        prompt: "A snack that has ever been sold can't be removed without erasing its sales. What does the menu really need?",
        choices: [
          "ON DELETE CASCADE",
          "To switch the foreign key check off",
          "A way to hide a snack while keeping its row: don't delete, retire",
        ],
        answer: 2,
        explain: "That's next week's change to the ledger.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "Write the four verbs of the week with one example address each, and say which ones change a table.",
      "What did the first versions of PUT and DELETE answer for something that didn't exist, and what one number fixed that?",
      "Why can't a snack that has been sold simply be removed, and what are the two honest ways through (and what does each cost)?",
      "Which of your pages now changes the ledger, and which of them still only reads it?",
      "What surprised you or broke this week, and why it happened.",
      "One question you still have.",
    ],
    note: "Your canteen can now add, change and remove from pages you built. One thing it still can't do well: take a snack off the menu without erasing its history. Next week the menu learns to retire a snack instead of deleting it, and the pages learn to share their code.",
  },
};
