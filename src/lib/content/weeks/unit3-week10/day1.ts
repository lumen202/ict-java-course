// unit3-week10 · Day 1 — Soft delete: take a snack off the menu without erasing it
//
// Week 9 ended on an honest problem: a snack that has ever been sold can't be removed (409), and
// the only way through, cancelling its sales, erases history. Today's fix is not to delete at all:
// a column `available BOOLEAN NOT NULL DEFAULT TRUE`, and every path that BUILDS THE MENU asks for
// WHERE available = TRUE. Old orders, sales and the board JOIN to snacks and do not filter, so
// history survives. The filter is built twice on purpose: the first version filters only the plain
// list, and the student sees a retired snack still answer to ?name=, ?sort=, ?maxPrice= and /api/find.
// Observed on a real Spring Boot 4.1.1 + MySQL 8.0 build (2026-11-18, see the log entry):
//  - DESCRIBE snacks shows available as tinyint(1), NOT NULL, default 1; existing rows read 1;
//  - first version (D1A/D1B): /api/snacks hides a retired snack; ?name=, ?sort=price, ?sort=name,
//    ?maxPrice= and /api/find?name= still show it; /api/snacks/{id} answers 200 for it;
//  - PUT /api/snacks/{id}/available: 200 {"snack_id":8000,"available":false}; 404 "No snack with id
//    99999" (GET and PUT); {} → 400 "JSON parse error: Cannot map `null` into type `boolean` …";
//    "yes" → 400 "JSON parse error: Cannot deserialize value of type `boolean` from String "yes" …";
//    /api/snacks/abc/available → 400 "Method parameter 'id': Failed to convert value …";
//  - before the 409: POST /api/orders for a retired snack answers 201 and writes a sale;
//  - finished: 409 "Snack 8000 is not available", 404 for 99999, 400 for qty 99; the sale count is
//    unchanged by a refused order; orders, sales and /api/snacks/{id} still show a retired Kutsinta;
//  - a retired Kutsinta makes GET /api/special answer 404 "No special today" when its special is the only one (the special's snack is
//    off the menu), and PUT/DELETE /api/special too, because they share the same newest-special lookup.
// Video (transcript read with yt-dlp 2026-11-18): CodeOpinion, "Should you Delete or Soft Delete?"
//  (lDYXtj95Jy8, 6:38): watch 0:28 to 1:58 only. From about 1:59 he says he rarely deletes or soft deletes anything and models events instead (re-read 2026-11-18).

import type { DayPlan } from "../../types";
import { day1Part2 } from "./day1-part2";
import { EX, PREV } from "./captured";
import {
  AVAILABLE_EVERY_PATH,
  AVAILABLE_MISSING,
  AVAILABLE_ROUNDTRIP,
  HISTORY_SURVIVES,
  ORDER_REFUSED,
  consolePut,
  orderThenCancel,
} from "./commands";
import { mc, mission, paste, bq } from "./helpers";
import {
  AVAILABLE_RECORDS,
  CONTROLLER_D1,
  FILTERED_PATHS,
  FILTER_PLAIN_LINE,
  FILTER_PLAIN_WAS,
  GET_AVAILABLE,
  ORDER_REFUSE_LINES,
  SET_AVAILABLE,
  SQL_ADD_AVAILABLE,
  SQL_CLEAN_CHECKS,
  SQL_CLEAN_CHECK_SALES,
  SQL_DESCRIBE_SNACKS,
  SQL_MENU_ONLY_AVAILABLE,
  SQL_PRACTICE_SNACK,
  SQL_RESTORE_PRACTICE,
  SQL_RETIRE_PRACTICE,
  SQL_SEE_AVAILABLE,
  CONTROLLER_D1C,
} from "./snippets";

const PATHS = FILTERED_PATHS.map((p) => `${p.path}\n    ${p.sql}`).join("\n\n");

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Soft delete: an available column, a menu that asks for it everywhere, and history that survives",
  warmupGame: {
    kind: "quest",
    id: "warmup-retire",
    title: "🗃️ Warm-up: delete, or just hide?",
    intro: "Week 9 ended with a snack you couldn't remove. Start with why, and with the idea this week is built on.",
    missions: [
      mission(
        "Last week, DELETE /api/snacks/90 answered 409 with a sentence. Think back to Week 9's Thursday: what did the sentence say, and which table made it happen?",
        "Week 9 Day 4: the foreign key from sales (and specials) to snacks.",
        mc(
          "Why can't a snack that has been sold simply be removed?",
          "Sales point at it through a foreign key, so MySQL refuses; removing it would mean erasing the sales first",
          ["The app has no DELETE for snacks", "The price is too low"],
          "That is the wall from Week 9. It protected the ledger, and it left one question open: what do you do with a snack you no longer sell?",
        ),
      ),
      mission(
        "A real canteen stops selling Kutsinta in December. Its orders from last year must still print on the board, with the name and the price paid. Two ideas: (a) DELETE the row; (b) keep the row and add a column that says whether the snack is on the menu today.",
        "Which idea leaves the old sales with a snack to point at?",
        mc(
          "Which idea keeps last year's orders readable?",
          "(b): the row stays, so every old sale still has a snack to join to",
          ["(a): deleting is the only clean way", "Neither: old orders can't be kept"],
          "Keeping the row and flagging it is called a soft delete. The word 'delete' is a little misleading: nothing is deleted. The snack is hidden from the menu.",
        ),
      ),
      mission(
        "You will add a column to snacks with  ALTER TABLE snacks ADD COLUMN available BOOLEAN NOT NULL DEFAULT TRUE;  (you met ALTER TABLE … ADD COLUMN in Week 1, and again with price_paid). Every snack already in your table has no value for it yet.",
        "DEFAULT TRUE is the clue.",
        mc(
          "What will the existing snacks have in the new column?",
          "TRUE: MySQL fills every existing row with the default",
          ["NULL, because they were there before the column", "FALSE, to be safe"],
          "NOT NULL plus DEFAULT TRUE means every snack, old or new, starts on the menu. You will see it in a SELECT in the lab.",
        ),
      ),
    ],
  },
  videos: [
    {
      title: "Should you delete or soft delete? (CodeOpinion)",
      youtubeId: "lDYXtj95Jy8",
      length: "6:38",
      practice: {
        intro:
          "Watch 0:28 to 1:58 only: what a hard delete is, what a soft delete is, and the column he adds. Stop there. He starts with a sponsor message (0:17 to 0:27), and from about 1:59 he says he rarely deletes or soft deletes anything at all and models events instead (a termination with a date and a reason), and later moves on to event-driven design. That is a different design from yours. His column is called 'is deleted', the opposite way round from yours: your available is TRUE for a snack that IS on the menu.",
        steps: [
          "Write in notes.md, in your own words: what is the difference between a hard delete and a soft delete, in the part you watched?",
          "Write: his column is named is deleted and yours is named available. Which value means 'show it on the menu' in each?",
        ],
        note: "He also says foreign keys are what make a hard delete impossible (about 1:03 to 1:20). That is true for your ledger, and it is exactly Week 9's 409.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: take a snack off the menu",
      intro:
        "You will add the column in SQL, build the menu filter the quick way and watch it miss a path, fix it everywhere, add an endpoint that retires and restores a snack, and refuse orders for a retired one. Restart after every change to a .java file. Every test snack is number 8000, made and removed in the lab.",
      missions: [
        mission(
          "SQL first. In queries.sql run these two statements (" +
            "Ctrl+E twice each), then look at the table:\n\n" +
            SQL_ADD_AVAILABLE +
            "\n\n" +
            SQL_SEE_AVAILABLE +
            "\n\n" +
            SQL_DESCRIBE_SNACKS +
            "\n\nWrite in notes.md what the new column holds for each of your snacks, and the Type that DESCRIBE shows for it.",
          "If the ALTER is refused with 'Duplicate column name', the column is already there: carry on. The Type is tinyint(1): MySQL stores TRUE as 1 and FALSE as 0, and BOOLEAN is only another name for it.",
          mc(
            "What does SELECT * show in the available column, and why?",
            "1 for every snack: TRUE is stored as 1, and DEFAULT TRUE filled the old rows",
            ["The word TRUE, as you typed it", "NULL for every old snack"],
            "BOOLEAN is tinyint(1) in MySQL: 1 is TRUE, 0 is FALSE.",
          ),
        ),
        mission(
          "A snack to retire. Run  SELECT * FROM snacks WHERE snack_id = 8000;  first. If it returns a row, STOP: use the next free number everywhere this week says 8000. Otherwise add the snack, retire it, and read the menu the way your Java will:\n\n" +
            SQL_PRACTICE_SNACK +
            "\n\n" +
            SQL_RETIRE_PRACTICE +
            "\n\n" +
            SQL_SEE_AVAILABLE +
            "\n\n" +
            SQL_MENU_ONLY_AVAILABLE +
            "\n\nThe last statement is the menu. Write what is different between the two SELECTs.",
          "The last SELECT has a WHERE that keeps only the rows with available = TRUE. The retired snack is still in the table, and not in the menu.",
          mc(
            "Where is the retired snack now?",
            "Still in the snacks table, and left out of any SELECT that says WHERE available = TRUE",
            ["Gone from the table", "In a second table"],
            "Nothing was deleted. The WHERE is what hides it, in every query that has one.",
          ),
        ),
        mission(
          "The quick filter. In SnackController.java, in listSnacks, find the line that reads the whole list:\n\n" +
            FILTER_PLAIN_WAS +
            "\n\nand change ONLY that line to:\n\n" +
            FILTER_PLAIN_LINE +
            "\n\nRestart. Open localhost:8080/api/snacks: snack 8000 is gone. Now PREDICT first, write it in notes.md, and then open each of these and write what you see:\n\nlocalhost:8080/api/snacks?name=Prac\nlocalhost:8080/api/snacks?sort=price\nlocalhost:8080/api/snacks?maxPrice=1000\nlocalhost:8080/api/find?name=Practice",
          "listSnacks has FIVE different SELECTs (the plain list, ?name, ?sort=price, ?sort=name and ?maxPrice) and /api/find has a sixth. You changed one. The Practice snack still shows in the others.",
          mc(
            "What happened?",
            "The plain list hides snack 8000, but every other path that reads snacks still shows it: each has its own SELECT",
            ["Nothing: the filter works everywhere", "The app crashed"],
            "A retired snack that still appears in a search or a sorted list is worse than one that never left: it looks like a bug in the filter, and it is a missing line in the code.",
          ),
        ),
        mission(
          "A way to retire and restore from your app. Inside the class, as the very last thing, just above the final closing brace, add these records and the two methods. (PutMapping, GetMapping and ResponseStatusException are imported already.) The records are the shape of the body and of the answer:\n\n" +
            AVAILABLE_RECORDS +
            "\n\n" +
            GET_AVAILABLE +
            "\n\n" +
            SET_AVAILABLE +
            "\n\nRead setAvailable out loud: the same UPDATE … WHERE snack_id = ? as Monday of last week, the same count, the same 404. Restart, and test from localhost:8080/menu.html → F12 → Console, one line at a time:\n\nputting snack 8000 back on the menu:\n\n" +
            consolePut('"/api/snacks/8000/available"', "{ available: true }") +
            "\n\nand off again:\n\n" +
            consolePut('"/api/snacks/8000/available"', "{ available: false }") +
            "\n\nthen the snack that doesn't exist:\n\n" +
            consolePut('"/api/snacks/99999/available"', "{ available: true }"),
          "Expect 200 with {\"snack_id\":8000,\"available\":true}, then false, then 404 with No snack with id 99999. A 404 whose message says No static resource means setAvailable isn't registered yet (restart, and check @PutMapping and the address). Use  localhost:8080/api/snacks/8000/available  in the address bar to read the flag.",
          mc(
            "Why does the endpoint have its own address, /api/snacks/{id}/available, and not just reuse PUT /api/snacks/{id}?",
            "PUT /api/snacks/{id} replaces the name and price and demands both; the flag is one fact on its own, and the staff page will change it without sending the rest",
            ["Because a path can't be used twice", "Because MySQL needs it"],
            "One small address for one small fact. It also leaves Week 9's PUT /api/snacks/{id} and its checks untouched.",
          ),
        ),
        mission(
          "Now fix the filter everywhere. With snack 8000 turned off, change every SELECT that builds a menu. There are six, and each gets the same idea:  AND available = TRUE  after the WHERE that is already there, or  WHERE available = TRUE  where there was none. Do the first (the plain list) as you already have it, then the other five:\n\n" +
            PATHS +
            "\n\nRestart, and open the four addresses from before. Snack 8000 must show in none of them.",
          "In the ?name branch the new part goes after the LIKE test with AND. In the two ?sort SELECTs there is no WHERE yet, so you add one before ORDER BY. /api/find's SELECT is the one at the bottom, written  WHERE name = ?. ",
          mc(
            "Why is the new test written inside each SELECT, and not as a loop in Java that removes retired snacks from the list?",
            "The database does the filtering, so the list that comes back is already the menu; Java never sees a retired snack",
            ["Because Java can't read a boolean", "Because a loop is slower than nothing"],
            "It is Week 8's lesson again: ask MySQL for what you want, don't fetch everything and throw some away.",
          ),
        ),
        mission(
          "Two more SELECTs build the front of the menu: today's special. GET /api/special and the private newestSpecialId() both read the newest special through the SAME join. A special for a snack that is off the menu would advertise something nobody can order. In BOTH places, add one line under the  INNER JOIN snacks ON specials.snack_id = snacks.snack_id  line, inside the triple-quoted text:\n\nWHERE snacks.available = TRUE\n\nRestart. Nothing you can see changes yet: the special's snack is Kutsinta, and Kutsinta is on the menu. The checkpoint will take it off the menu for a moment and put it back.",
          "Two places, the same line, so GET, PUT and DELETE on /api/special keep agreeing about which special is today's, exactly as they did in Week 9. If you add it in only one place, GET and PUT will disagree.",
          mc(
            "Why must both SELECTs get the line?",
            "GET, PUT and DELETE must all agree what 'today's special' is; one filtered and one not would let PUT change a special the page can't see",
            ["Because Java needs two copies", "Because the second one is faster"],
            "Week 9 made newestSpecialId() the one shared lookup for exactly this reason; the filter has to go in both because both are written out.",
          ),
        ),
        mission(
          "One snack is deliberately NOT filtered: GET /api/snacks/{id}. Check it. With 8000 retired, open localhost:8080/api/snacks/8000. Write what it answers, and why the edit page (Part 2) needs it that way.",
          "It answers 200 with the snack. A staff member must be able to open a retired snack to put it back on the menu.",
          mc(
            "Why does GET /api/snacks/8000 still answer for a retired snack?",
            "Staff need to find a retired snack by its number to put it back; only the menu is filtered",
            ["Because the filter has a bug", "Because 8000 is a practice number"],
            "'On the menu' and 'exists' are different facts. This endpoint answers the second.",
          ),
        ),
        mission(
          "One more path should refuse. Today an order for a retired snack is accepted. See it before you stop it: this line places ONE order for snack 8000 and cancels it again in the same line:\n\n" +
            orderThenCancel("8000") +
            "\n\nWrite the status it printed. Then in placeOrder, directly under the line  Snack snack = getSnack(request.snack_id());  add:\n\n" +
            ORDER_REFUSE_LINES +
            "\n\nRestart and run the same line again.",
          "Before the fix it prints 201 and an order for Practice (and cancelled_again true: the line removed it). After the fix: 409, and the message Snack 8000 is not available. The new SELECT reads one boolean with .query(Boolean.class).single().",
          mc(
            "Why is the answer a 409 and not a 404?",
            "The snack exists (a 404 would say it doesn't); it is refused because of its state right now, the same family as 409 'Snack N already exists'",
            ["Because 409 is the number for orders", "Because the status is chosen at random"],
            "404 means 'no such thing'. 409 means 'the thing is there, and what you ask conflicts with how it is'.",
          ),
        ),
        mission(
          "Put the practice snack away with SQL, then compare. Restore it, delete it, and check the menu is back to what it was:\n\n" +
            SQL_RESTORE_PRACTICE +
            "\n\nDELETE FROM snacks WHERE snack_id = 8000;\n\nAfter Part 1 your SnackController.java should look like this (line 1 is your own package line; blank lines and method order don't matter):\n\n" +
            CONTROLLER_D1,
          "Common differences: a missing  AND available = TRUE  in one of the six SELECTs; the new records outside the class; getSnack filtered by mistake (it must not be).",
        ),
        paste(
          "Write Part 1 into notes.md: what the first version of the filter missed, the six places the new test went, why GET /api/snacks/{id} is not filtered, and why the refused order is a 409.",
          "In your own words. The key sentence: 'The first version only changed the line I looked at, but …'.",
          "Paste Part 1 of notes.md",
        ),
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-available",
      title: "🧪 Part 1 · Checkpoint: a menu that really hides",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080), prints the answer and copies it; paste it here. Every line makes its own snack (named Check and a number) and removes it again, or changes Kutsinta and puts it back in the same line. If a line leaves a snack behind, remove the leftovers with  " +
        SQL_CLEAN_CHECKS +
        "  (nothing points at them, as long as your app is right: if a wrong version of your app ever let a sale be written for a Check snack, run  " +
        SQL_CLEAN_CHECK_SALES +
        "  first, because the foreign key refuses to remove a snack that has a sale). If a mistake of yours takes snacks off the menu, put them back with  UPDATE snacks SET available = TRUE WHERE snack_id > 0;  before going on (a WHERE written on purpose: every snack has a number above 0, so it chooses every row). Last week's app has no such endpoint, so it cannot pass any of these.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It adds a snack, takes it off the menu with PUT, looks at the menu and at the snack by its number, puts it back, and removes it. It also checks every OTHER snack is still on the menu. Paste what it copies.",
          command: AVAILABLE_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {. Did you run the line in the Console of a localhost:8080 page?" },
            { path: "put_status", equals: 200, message: "The PUT should answer 200. A 404 saying No static resource means setAvailable isn't registered (restart, and check @PutMapping and the address /api/snacks/{id}/available)." },
            { path: "answer_says_false", equals: true, message: "The answer to the PUT should say  \"available\":false  after you sent false. Does setAvailable return new Availability(id, change.available())?" },
            { path: "hidden_from_menu", equals: true, message: "The snack is still on /api/snacks after being taken off. Is the plain list's SELECT  WHERE available = TRUE  ?" },
            { path: "still_found_by_number", equals: true, message: "GET /api/snacks/{id} should still find a retired snack. Don't filter getSnack: staff need it to put a snack back." },
            { path: "others_unchanged", equals: true, message: "Other snacks left the menu too! Check the UPDATE has  WHERE snack_id = ?  and the snack number as its second .param: without the WHERE every snack is taken off the menu. Put your menu right in SQLTools first (UPDATE snacks SET available = TRUE WHERE snack_id > 0;)." },
            { path: "back_on_menu", equals: true, message: "After available:true the snack should be on the menu again." },
          ],
          hint: "The line adds a snack, retires it, reads /api/snacks and /api/snacks/{id}, restores it and deletes it. If 'others_unchanged' is false, your UPDATE touched more than one row.",
          solution: SET_AVAILABLE,
          example: EX.d1Roundtrip,
          previousStage: PREV.d1Roundtrip,
          explain: "A flag in a table, changed by one endpoint and read by another: the row stayed, and the menu stopped asking for it.",
        },
        {
          goal: "Every path that reads snacks. Run this line on a localhost:8080 page and paste what it copies. It adds a snack, takes it off the menu, and asks six different addresses whether it still shows.",
          command: AVAILABLE_EVERY_PATH,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "paths_checked", equals: 6, message: "The line should have asked six addresses. Paste exactly what it copied." },
            { path: "paths_failing", exact: 0, message: "At least one of the six addresses did not answer 200 with a list (read  paths_failing  in the answer): its SELECT probably has a mistake. Open that address in the browser and read the error; a path that fails is not 'hidden', it is broken." },
            { path: "hidden_everywhere", equals: true, message: "A retired snack still shows in at least one path: read  still_shown_by  in the answer. Each name there is a SELECT that has no  available = TRUE  yet." },
            { path: "cleaned_up", equals: true, message: "The line couldn't remove its snack again. Remove  Check …  snacks in SQLTools with the cleanup statement above." },
          ],
          hint: "still_shown_by lists the addresses that still show the snack, and paths_failing the ones that answered an error. Open listSnacks and findByName and look for the SELECT behind each one.",
          solution: CONTROLLER_D1C,
          example: EX.d1EveryPath,
          previousStage: PREV.d1EveryPath,
          explain: "Six paths, six SELECTs, one rule. The first version filtered one of them.",
        },
        {
          goal: "A snack that doesn't exist. Run this line on a localhost:8080 page and paste what it copies. It asks GET and PUT (with available true, so a mistake can't hurt your menu) for snack 99999, and compares the whole menu before and after.",
          command: AVAILABLE_MISSING,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "put_status", equals: 404, message: "The PUT should answer 404. If it is 200, the count isn't checked: keep .update()'s number in changed and throw when it is 0." },
            { path: "put_message", equals: "No snack with id 99999", message: "The message should be exactly  No snack with id 99999  with the number in it." },
            { path: "get_status", equals: 404, message: "GET /api/snacks/99999/available should answer 404 too." },
            { path: "nothing_changed", equals: true, message: "The menu changed although snack 99999 doesn't exist: the UPDATE has no WHERE (or the wrong one). Look at the SELECT * FROM snacks in SQLTools, put anything wrong right, then fix the WHERE." },
          ],
          hint: "int changed = jdbc.sql(…).update();  then  if (changed == 0) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id); }",
          solution: SET_AVAILABLE,
          example: EX.d1Missing,
          previousStage: PREV.d1Missing,
          explain: "The same count as Week 9, doing the same job on a different column.",
        },
        {
          goal: "An order for a snack that is off the menu. Run this line on a localhost:8080 page and paste what it copies. It adds a snack, takes it off the menu, tries to order it, puts it back, orders it, cancels the order, and removes the snack.",
          command: ORDER_REFUSED,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "refused_status", equals: 409, message: "An order for a retired snack should answer 409. A 201 means placeOrder doesn't look at the flag yet." },
            { path: "refused_message", contains: "is not available", message: "The message should end with  is not available,  starting  Snack  and the number." },
            { path: "no_sale_written", equals: true, message: "A sale was written for the retired snack. The check must come BEFORE the INSERT." },
            { path: "after_putting_back_status", equals: 201, message: "After putting the snack back, the order should be accepted (201)." },
            { path: "cleaned_up", equals: true, message: "The line couldn't remove its own snack: if a sale is left pointing at it, cancel that order, then remove the snack." },
          ],
          hint: "Under  Snack snack = getSnack(…);  read the flag with  .query(Boolean.class).single()  and throw a 409 when it is false.",
          solution: ORDER_REFUSE_LINES,
          example: EX.d1Order,
          previousStage: PREV.d1Order,
          explain: "The menu hides a snack and the till refuses it: two places that must agree.",
        },
        {
          goal: "History survives. Run this line on a localhost:8080 page and paste what it copies. It takes Kutsinta off the menu, checks that the old orders and sales still show it, checks that its special is neither shown nor changeable while it is off the menu, and ALWAYS puts it back (and the special's price) before it finishes.",
          command: HISTORY_SURVIVES,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "has_sales", equals: true, message: "Kutsinta has no sale in /api/sales, so there is no history to check. Add Week 8's test sales for snack 90 first." },
            { path: "has_special", equals: true, message: "Kutsinta is not today's special, so there is nothing to check about the special. Insert Week 8's special for snack 90 (the lab's INSERT INTO specials …) first." },
            { path: "off_the_menu", equals: true, message: "While retired, Kutsinta should not be on /api/snacks." },
            { path: "orders_still_show_it", equals: true, message: "The old orders should still show Kutsinta by name. Did you add  available = TRUE  to the orders SELECTs? Only the menu is filtered; history is not." },
            { path: "sales_still_show_it", equals: true, message: "The sales list should still show snack 90's sales." },
            { path: "found_by_number", equals: true, message: "GET /api/snacks/90 should still find it." },
            { path: "special_hidden", equals: true, message: "While Kutsinta is off the menu, GET /api/special still answered Kutsinta's special. The special's SELECT needs  WHERE snacks.available = TRUE  under its INNER JOIN." },
            { path: "special_untouched", equals: true, message: "A PUT to /api/special changed Kutsinta's special while Kutsinta was off the menu (the line put the old price back). newestSpecialId()'s SELECT needs  WHERE snacks.available = TRUE  too: GET, PUT and DELETE must agree which special is today's." },
            { path: "put_back", equals: true, message: "The line could not put Kutsinta back on the menu. Run  UPDATE snacks SET available = TRUE WHERE snack_id = 90;  in SQLTools." },
          ],
          hint: "Only the SELECTs that BUILD THE MENU get the new test (and the two that find today's special). The JOINs in listOrders, getOrder, and listSales read history: leave them alone.",
          solution: CONTROLLER_D1,
          example: EX.d1History,
          previousStage: PREV.d1History,
          explain: "A soft delete changes what the menu shows and nothing about what happened: last year's orders still print.",
        },
      ],
    },
    ...day1Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five students, five hidden snacks",
      intro: "Each patient is a real failure of this kind of lab. For each, say what is wrong and what you would change.",
      missions: [
        mission(
          "Patient 1. The menu page hides the retired snack, but typing the search box still finds it. The student changed one SELECT.",
          "Week 8 had one SELECT per way of asking. Which addresses read snacks?",
          mc(
            "What is the fix?",
            "Add the same available test to every SELECT that reads snacks for the public: the plain list, ?name, ?sort (two) and ?maxPrice, and /api/find",
            ["Hide it in menu.js", "Restart the app a second time"],
            "A filter in one place is a rule with holes. The checkpoint lists the paths still showing the snack.",
          ),
        ),
        mission(
          "Patient 2. A student sends  {\"available\": \"yes\"}  and gets a 400 beginning  JSON parse error: Cannot deserialize value of type `boolean` from String \"yes\".  Sending {} also answers 400, with Cannot map `null` into type `boolean`.",
          "Which Java type is available in the record, and what does Jackson accept for it?",
          mc(
            "Is this an UPDATE problem?",
            "No: Spring refused before setAvailable ran, because the field is a boolean and the body has no true or false for it; no SQL was sent",
            ["Yes: MySQL refused the text", "Yes: the WHERE is wrong"],
            "Only true and false (without quotes) become a boolean. Observed: both bodies are 400 and nothing changed.",
          ),
        ),
        mission(
          "Patient 3. A student wrote the UPDATE as  \"UPDATE snacks SET available = ?\"  and kept only the first .param. It compiled. The first retire from the page answered 200.",
          "Where is the WHERE? Week 9 had a patient exactly like this.",
          mc(
            "What does the menu look like afterwards?",
            "Empty: with no WHERE the UPDATE applies to every row, so every snack left the menu",
            ["Only snack 8000 is gone", "Nothing changed"],
            "A 200 and an empty menu. The checkpoint's  others_unchanged  exists to catch this one: it reads the whole menu before and after.",
          ),
        ),
        mission(
          "Patient 4. A student filtered getSnack too (AND available = TRUE). The menu is right, but the edit page for a retired snack says  Sorry: No snack with id 8000,  and ordering a retired snack answers 404 instead of 409.",
          "What does each of those two places call to find the snack?",
          mc(
            "Why did the edit page and placeOrder break?",
            "Both ask getSnack for the snack; a filtered getSnack says 'no such snack' for a retired one, so staff can't put it back and the till can't tell 'retired' from 'missing'",
            ["The page has a typo", "MySQL cache"],
            "Filter what the CUSTOMER sees (the menu). Leave 'does it exist?' alone.",
          ),
        ),
        mission(
          "Patient 5, a story. A student, tired of the filters, wrote  SELECT * FROM snacks  in the plain list so that 'everything is simple', and put the available test in menu.js instead.",
          "Who can call /api/snacks without your page?",
          mc(
            "What is wrong with hiding it only in the page?",
            "The rule isn't in the app: any other page, the console, or a different program calling /api/snacks still gets the retired snack",
            ["Nothing: pages are enough", "JavaScript can't read booleans"],
            "Anything that can send a request bypasses your page. The rule lives where the data comes from, as Week 9's checks did.",
          ),
        ),
        paste(
          "Write your discharge notes: one line per patient with the first thing you would check, and then one line that starts: 'When I add a rule that hides something, I make sure …'.",
          "Patient 1 and 4 give you the line.",
          "Paste your five notes and your rule",
        ),
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own flag",
      intro: "Make the menu do one more thing with a flag. Do at least one idea; if you have time, do more. There's no upper limit.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Run any SQL in queries.sql first, and keep every checkpoint passing. Ideas: (1) a second flag,  special_only,  or a  note  column (VARCHAR) on snacks, shown on the menu page; (2) in setAvailable, print the change to the terminal with System.out.println(\"Snack \" + id + \" available: \" + change.available()); (3) GET /api/snacks?available=false is NOT safe on the public menu: say in notes.md who should be able to ask that, and why; (4) a page line on menu.html that says how many snacks are shown (it already does) and how many are off the menu (you will need the staff list on Wednesday); (5) harder: make placeOrder refuse a retired snack with ONE SELECT that reads name, price and available together, instead of getSnack plus a second SELECT.",
          hint: "Ideas 1 and 5 change Java: restart after each edit. For 5, the new SELECT returns the three columns; use a small record or Snack plus a boolean.",
        },
        paste(
          "Paste what you added: the new lines (and which file), how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          "How you tested it can be one sentence.",
          "Paste your new lines, how you tested, and what it answered",
        ),
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-flag",
    title: "⚔️ Boss battle: The Ghost Snack",
    intro: "The Ghost Snack haunts menus it was supposed to leave. Banish it everywhere.",
    boss: { name: "the Ghost Snack", emoji: "👻" },
    questions: [
      bq("What does a soft delete do to a row?", "Keeps the row and marks it, so queries can leave it out", ["Removes the row but keeps a copy somewhere", "Moves the row to another database"], "Nothing is deleted: a column says whether the row counts today."),
      bq("Which SQL adds the column?", "ALTER TABLE snacks ADD COLUMN available BOOLEAN NOT NULL DEFAULT TRUE;", ["UPDATE snacks ADD available;", "INSERT INTO snacks (available) VALUES (TRUE);"], "ALTER TABLE changes the table's shape; DEFAULT TRUE fills the rows already there."),
      bq("MySQL's BOOLEAN is really which type, and what does TRUE look like in SELECT *?", "tinyint(1), shown as 1", ["bit, shown as TRUE", "varchar, shown as 'TRUE'"], "BOOLEAN is another name for tinyint(1): 1 is TRUE and 0 is FALSE."),
      bq("The first version filtered the plain list only. What did a search for  ?name=Prac  still show?", "The retired snack: that SELECT had no available test", ["Nothing", "An error"], "Each way of asking has its own SELECT, so each needs the rule."),
      bq("Why is the filter written inside each SELECT?", "The database hands back only the menu, so Java and every page get it right for free", ["Because Java can't loop", "Because SQL is faster than JSON"], "Filter at the source."),
      bq("Why is GET /api/snacks/{id} NOT filtered?", "Staff must be able to open a retired snack to put it back", ["It was forgotten", "A snack number can't be hidden"], "The menu is filtered; 'does it exist' is not."),
      bq("An order for a retired snack answers:", "409 Conflict, 'Snack N is not available'", ["404 Not Found", "201 Created"], "It exists, so not 404; it conflicts with its state."),
      bq("Where must the availability check in placeOrder sit?", "Before the INSERT, so no sale is written for a retired snack", ["After the INSERT, to be sure it worked", "In menu.js"], "Check first, write second: Week 7's lesson on qty, again."),
      bq("Why do /api/orders and /api/sales still show a retired snack's old sales?", "They JOIN to snacks and don't filter on available: history is not the menu", ["They cache the old list", "Retiring doesn't touch them by accident"], "Only the SELECTs that build the menu got the new test."),
      bq("A retired snack's UPDATE has no WHERE. What happens?", "Every snack goes off the menu and the app still answers 200", ["Only the first row changes", "MySQL refuses"], "The WHERE is the only protection, one more time."),
      bq("Why is  { \"available\": \"yes\" }  refused with a 400?", "A boolean field accepts true or false, not text", ["MySQL has no yes", "The address is wrong"], "Spring refuses before the method runs."),
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what is a soft delete, and why is it the right answer to a snack that has been sold?",
      "Which six SELECTs build the menu, and which SELECTs did you leave alone on purpose (and why)?",
      "What did the first version of the filter get wrong, and how did you find out?",
      "Why is an order for a retired snack a 409 and not a 404?",
      "What would have happened to the menu with an UPDATE that had no WHERE?",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "A snack can leave the menu and keep its history. Part 2 puts the button on the edit page; tomorrow the pages stop copying each other.",
  },
};
