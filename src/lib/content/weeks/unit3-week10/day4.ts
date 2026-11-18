// unit3-week10 · Day 4 — Repositories: the SQL moves out of the controller, and nothing a client sees changes
//
// SnackController has done everything since Week 8: the HTTP (addresses, statuses, the 400/404/409
// decisions) AND every SQL statement. Today the SQL moves into three @Repository classes
// (SnackRepository, OrderRepository, SpecialRepository), each holding the JdbcClient; the controller keeps
// every decision and every status, and gets the repositories by constructor injection. The success
// criterion is BEHAVIOURAL: every checkpoint of Weeks 9 and 10 passes before and after. The lab moves one
// group of methods at a time (the app compiles and answers at every step) and runs the battery after each.
// Observed on a real build (2026-11-18):
//  - the split app (CONTROLLER_D4 + three repositories + StaffSnack/Special/CanteenInfo as their own files)
//    answers the whole battery (SPLIT_BATTERY: 0 mismatches) and every Day 1 and Day 3 checkpoint task, and
//    Week 9's snack wall, exactly as the unsplit app did;
//  - a SnackRepository without @Repository: the app does NOT start. "APPLICATION FAILED TO START",
//    Description: "Parameter 0 of constructor in com.example.canteen.SnackController required a bean of
//    type 'com.example.canteen.SnackRepository' that could not be found.", Action: "Consider defining a bean
//    of type 'com.example.canteen.SnackRepository' in your configuration.";
//  - a repository's delete() that runs the DELETE and returns 1 whatever happened: DELETE /api/snacks/99999
//    answers 204 (a lie), where the right count answers 404;
//  - a column that doesn't exist in a SELECT: 500 "PreparedStatementCallback; bad SQL grammar [SELECT …]".
// The gauntlet's six predictions were run in SQL on a real supplies/purchases ledger (MySQL 8.0.46):
//  retire item 5 → 4 rows with in_stock = TRUE; the purchases JOIN still returns 3 rows; DELETE of the retired
//  item → Error 1451; retiring it again → "Rows matched: 1  Changed: 0"; UPDATE with no WHERE → 0 rows left in
//  stock (it matched 5, changed 4 because item 5 was already off); a column added WITHOUT NOT NULL and a row
//  inserted with NULL → 6 rows, 5 with TRUE, 1 NULL, and WHERE on_sale = TRUE does not return the NULL one.
// Video (transcript read with yt-dlp 2026-11-18): IntelliJ IDEA, "Spring JdbcClient: A better alternative to
//  JdbcTemplate" (oF7vlaJhySE, 14:01): watch 2:32 to 3:41, 5:49 to 7:09, 8:38 to 9:50.

import type { DayPlan } from "../../types";
import { day4Part2 } from "./day4-part2";
import { EX } from "./captured";
import {
  AVAILABLE_EVERY_PATH,
  AVAILABLE_ROUNDTRIP,
  ORDER_REFUSED,
  SNACK_WALL,
  SPLIT_BATTERY,
  STAFF_LIST_ROUNDTRIP,
} from "./commands";
import { mc, mission, paste, bq } from "./helpers";
import {
  CANTEEN_INFO_FILE,
  CONTROLLER_D4,
  D4_FINAL_CONSTRUCTOR,
  D4_METHODS,
  D4_MIGRATING_CONSTRUCTOR,
  D4_OLD_CONSTRUCTOR,
  ORDER_REPOSITORY,
  SNACK_REPOSITORY,
  SPECIAL_RECORD_FILE,
  SPECIAL_REPOSITORY,
  SQL_CLEAN_CHECKS,
} from "./snippets";

const group = (...keys: string[]) => keys.map((k) => D4_METHODS[k]).join("\n\n");
const SNACK_METHODS = group("listSnacks", "getSnack", "addSnack", "findByName", "updateSnack", "deleteSnack", "getAvailable", "setAvailable", "staffSnacks");
const ORDER_METHODS = group("listSales", "listOrders", "placeOrder", "getOrder", "updateOrder", "cancelOrder");
const SPECIAL_METHODS = group("special", "newestSpecialId", "updateSpecial", "removeSpecial");

export const day4: DayPlan = {
  day: "Day 4",
  focus: "Repositories: the SQL moves out of the controller, the decisions stay, and every checkpoint passes before and after",
  warmupGame: {
    kind: "quest",
    id: "warmup-who-does-what",
    title: "🧱 Warm-up: who should know the SQL?",
    intro: "Open SnackController.java and scroll. Count what it does for each endpoint: it reads the request, decides, runs SQL, and answers.",
    missions: [
      mission(
        "Look at updateSnack. It checks the name and the price (400), runs an UPDATE, reads the count (404), and returns the snack. Some of that is HTTP, some of it is SQL.",
        "Which lines would change if you moved from MySQL to another database? Which would not?",
        mc(
          "Which part of updateSnack would have to change with a different database?",
          "The SQL statement and its .param calls; the checks and the statuses are the same",
          ["The 404 and the 400 checks", "The @PutMapping line"],
          "The SQL knows about tables. The checks know about customers. They change for different reasons, so they belong in different places.",
        ),
      ),
      mission(
        "A repository is a class whose only job is to talk to the database. It has one method for each thing the app asks of the ledger: listAvailable(), findById(id), update(id, name, price). It holds the JdbcClient; the controller doesn't.",
        "A repository method returns what the SQL returned: a list, an Optional, a count.",
        mc(
          "Who decides to answer 404 when update() returns 0?",
          "The controller: it owns the HTTP, so it decides which status a count of 0 means",
          ["The repository", "MySQL"],
          "A repository returns facts (the count was 0). The controller turns facts into answers (404).",
        ),
      ),
      mission(
        "Spring makes the repository for you if the class has @Repository, and hands it to the controller through the constructor: you already use that for JdbcClient. The controller asks for a SnackRepository in its constructor and Spring supplies it.",
        "What did Spring supply to SnackController's constructor since Week 8?",
        mc(
          "What does constructor injection mean?",
          "The class lists what it needs in its constructor, and Spring creates those things and passes them in",
          ["The class builds everything with new", "Spring copies the class"],
          "You wrote  SnackController(JdbcClient jdbc)  in Week 8 and never created a JdbcClient. Today's classes use the same mechanism.",
        ),
      ),
    ],
  },
  videos: [
    {
      title: "Spring JdbcClient: a better alternative to JdbcTemplate (IntelliJ IDEA)",
      youtubeId: "oF7vlaJhySE",
      length: "14:01",
      practice: {
        intro:
          "Watch three short parts: 2:32 to 3:41 (a repository class with @Repository and a JdbcClient from the constructor), 5:49 to 7:09 (finding one row), and 8:38 to 9:50 (update and delete). Skip the rest: 0:00 to 1:23 compares it with JdbcTemplate, 1:36 to 2:08 sets up Flyway and an in-memory H2 database (you use MySQL), 3:41 to 5:49 is row mappers (your records do that), 7:22 to 8:37 is generated keys (you did that in Week 8), and everything after 10:31 is tests, which you don't write this week. His delete example is a real DELETE; yours will be a soft delete wherever it can.",
        steps: [
          "Write in notes.md: which annotation does he put on his repository class, and what does he say it makes the class?",
          "Write: how does his repository get its JdbcClient, and where have you seen the same thing?",
          "Write: what does he say update() returns?",
        ],
        note: "He names his model Bookmark and uses named parameters (:id). You keep your records and your ? marks with .param(…), in order. No JPA anywhere in these parts: if you hear 'entity' or 'JpaRepository' in another video, that is a different tool.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: move the SQL, one group at a time",
      intro:
        "You will not rewrite the app. You will move SQL, in three steps, and after every step the app must answer exactly as before. A battery line, run before and after, is how you know. Restart after every change to a .java file, and read the red errors before you press Run: if the Problems panel has any, fix them first.",
      missions: [
        mission(
          "BEFORE. First run every checkpoint you have passed in Weeks 9 and 10 once more (paste each answer again; they should all clear) and write down any that don't. Then, on localhost:8080/menu.html, run this one line and write what it copied. It makes and removes its own snack, and lists by name anything that doesn't match what the app answered before today:\n\n" +
            SPLIT_BATTERY,
          "You want  \"mismatches\":[]  and  \"everything_same\":true.  If it lists something now, fix that first: you can't tell what the split broke if the app was already off.",
          mc(
            "Why run the checks BEFORE you change anything?",
            "A refactor promises 'the same answers'; you can only check that against a recorded 'before'",
            ["To warm up the database", "The app needs it to compile"],
            "If a check fails after, you need to know it passed before.",
          ),
        ),
        mission(
          "The files. In the folder with SnackController.java make THREE repository files and TWO record files, each with your package line first. (1) SnackRepository.java:\n\n" +
            SNACK_REPOSITORY +
            "\n\n(2) OrderRepository.java:\n\n" +
            ORDER_REPOSITORY +
            "\n\n(3) SpecialRepository.java:\n\n" +
            SPECIAL_REPOSITORY +
            "\n\nA repository would have to write  SnackController.Special  to use a record nested inside the controller, which ties the repository to the controller. So two of them become files of their own, and every class says plain  Special  and  CanteenInfo. Special.java:\n\n" +
            SPECIAL_RECORD_FILE +
            "\n\nCanteenInfo.java:\n\n" +
            CANTEEN_INFO_FILE +
            "\n\nThen DELETE the nested  record Special(…)  and the nested  record CanteenInfo(…)  from SnackController.java (the controller finds the new files by name). Restart. Nothing has changed for anyone: the repositories exist but nobody uses them yet.",
          "Each repository file has the same shape: the annotation, a JdbcClient field, a constructor that sets it, and one method per question. Read SnackRepository's methods: listAvailableByPrice is the old ?sort=price SELECT, and so on. The app should start. If it doesn't, read the first red line in the terminal.",
          mc(
            "What does @Repository do?",
            "It tells Spring to create one of this class and keep it, so another class can ask for it in its constructor",
            ["It connects to MySQL", "It makes the class faster"],
            "Without it Spring doesn't know the class exists as something to hand out. The clinic shows what the app says when it's missing.",
          ),
        ),
        mission(
          "Step 1 of 3: the snacks. In SnackController.java replace the old fields and constructor with these, which ask Spring for all three repositories and still keep the JdbcClient for the moment:\n\n" +
            D4_OLD_CONSTRUCTOR +
            "\n\nbecomes\n\n" +
            D4_MIGRATING_CONSTRUCTOR +
            "\n\nThen replace the nine methods that touch snacks with these (one at a time, each replaces the method with the same name; placeOrder waits for step 2):\n\n" +
            SNACK_METHODS +
            "\n\nRestart, and run the battery again. Its answer must be what it was before.",
          "Each method lost its SQL and kept its checks, its statuses and its messages: look at updateSnack, it still has the three 400 checks and the 404 test, and its UPDATE is now  snacks.update(id, change.name(), change.price()).  If the app won't start, check each repository file has @Repository and the controller's constructor lists all four things.",
          mc(
            "In the new updateSnack, who throws the 404?",
            "The controller: snacks.update(…) only returns the count; the controller turns 0 into a 404",
            ["The repository", "MySQL"],
            "A repository returns facts. The controller owns the statuses.",
          ),
        ),
        mission(
          "Step 2 of 3: the orders. Replace these six methods (listSales, listOrders, placeOrder, getOrder, updateOrder, cancelOrder). placeOrder now asks both repositories: snacks for the flag, orders for the INSERT:\n\n" +
            ORDER_METHODS +
            "\n\nRestart and run the battery again.",
          "summary() is untouched: it calls listOrders(null) and adds up, with no SQL of its own. placeOrder's new line  snacks.isAvailable(…).orElse(false)  returns an Optional: 'false' means 'no such flag', but getSnack has already thrown a 404 for a missing snack by then.",
          mc(
            "placeOrder now uses two repositories. Where does the rule 'a retired snack can't be ordered' live?",
            "In the controller: the repository tells it the flag, the controller decides to refuse with a 409",
            ["In OrderRepository", "In SnackRepository"],
            "The same split as before: repositories answer questions, the controller makes decisions.",
          ),
        ),
        mission(
          "Step 3 of 3: the special, then tidy up. Replace the four special methods:\n\n" +
            SPECIAL_METHODS +
            "\n\nNow nothing in the controller uses the JdbcClient. Replace the migrating fields and constructor with the final ones:\n\n" +
            D4_FINAL_CONSTRUCTOR +
            "\n\nand delete the imports that turn grey (JdbcClient, GeneratedKeyHolder, KeyHolder). Press Ctrl+Shift+F and search the whole project for  jdbc.sql  : it must appear only in the three repository files. Restart and run the battery a last time.",
          "If the compiler complains about 'jdbc', one method still has its old body: search for  jdbc.  in the controller. The search is your proof that the controller holds no SQL: your browser can't check that, only your own search can.",
          mc(
            "How do you know the controller has no SQL left?",
            "A project-wide search for jdbc.sql finds it only in the repository files",
            ["The app starts", "The battery passes"],
            "The battery proves the answers are the same. Only reading the code proves where the SQL is.",
          ),
        ),
        mission(
          "AFTER. Run every checkpoint of Week 9 and Weeks 10 so far again, and compare with your BEFORE list. They must clear exactly as they did. Then compare your SnackController.java with this one (line 1 is your own package line; blank lines and method order don't matter):\n\n" +
            CONTROLLER_D4,
          "Common differences: a method still holding a jdbc.sql; a missing  @Repository; getAvailable or staffSnacks forgotten (the staff page then fails); the nested Special record still in the controller.",
        ),
        paste(
          "Write Part 1 into notes.md: what a repository holds and what the controller keeps, how you proved nothing changed (what you ran before and after), and the one search that shows the controller has no SQL.",
          "In your own words. The key sentence: 'The repository answers …, the controller decides …'.",
          "Paste Part 1 of notes.md",
        ),
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-split",
      title: "🧪 Part 1 · Checkpoint: the same answers after the split",
      intro:
        "A refactor changes nothing you can see, so these lines are the checks you already know: if the split is right they pass exactly as they did before it. Each makes its own snack (named Check and a number) and removes it. If one leaves a snack behind, remove it with  " +
        SQL_CLEAN_CHECKS +
        "  Week 9's checkpoints and this week's Monday and Wednesday checkpoints should pass again as well: run them too.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It sends a battery of requests (the menu, a sort, a bad sort, a missing snack, an add and a duplicate, a change, an order and its change and its cancel, a removal, Kutsinta's wall, the summary, the staff list, the info and the special) and names anything that doesn't answer as it did. Paste what it copies.",
          command: SPLIT_BATTERY,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "mismatches", exact: 0, message: "Something answers differently from before the split: read the names in  mismatches.  Each name is one request; compare that endpoint's method in the controller with the compare block and with its repository method." },
            { path: "everything_same", equals: true, message: "everything_same should be true: mismatches must be empty." },
          ],
          hint: "The names in mismatches say which request: e.g. 'POST twice is 409' means addSnack lost its DuplicateKeyException catch.",
          solution: CONTROLLER_D4,
          example: EX.d4Battery,
        },
        {
          goal: "Monday's retire-and-restore check, run again on the split app. Run this line on a localhost:8080 page and paste what it copies.",
          command: AVAILABLE_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "put_status", equals: 200, message: "The PUT should answer 200: setAvailable moved into the controller and the repository; check the repository's setAvailable returns the count." },
            { path: "hidden_from_menu", equals: true, message: "The retired snack should be hidden from the menu: SnackRepository.listAvailable() needs  WHERE available = TRUE." },
            { path: "still_found_by_number", equals: true, message: "GET /api/snacks/{id} should still find it: findById has no available test." },
            { path: "others_unchanged", equals: true, message: "Other snacks left the menu: SnackRepository.setAvailable's UPDATE needs  WHERE snack_id = ?.  Put your menu right in SQLTools first (UPDATE snacks SET available = TRUE WHERE snack_id > 0;)." },
            { path: "back_on_menu", equals: true, message: "After available:true the snack should be back on the menu." },
            { path: "cleaned_up", equals: true, message: "The line couldn't remove its snack; use the cleanup statement above." },
          ],
          hint: "If this passed on Monday and fails now, the SQL was moved wrongly: compare the repository method with the SELECT or UPDATE it replaced.",
          solution: SNACK_REPOSITORY,
          example: EX.d4Roundtrip,
        },
        {
          goal: "Monday's every-path check, again. Run this line on a localhost:8080 page and paste what it copies.",
          command: AVAILABLE_EVERY_PATH,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "paths_failing", exact: 0, message: "At least one of the six addresses did not answer 200 with a list: read  paths_failing.  Its repository method probably has a mistake in its SQL: open that address and read the error." },
            { path: "hidden_everywhere", equals: true, message: "A retired snack still shows in at least one path: read  still_shown_by.  Each path is one SnackRepository method; check each has  AND available = TRUE  or  WHERE available = TRUE." },
            { path: "paths_checked", equals: 6, message: "The line should have asked six addresses." },
          ],
          hint: "Six paths, six repository methods: listAvailable, searchAvailable, listAvailableByPrice, listAvailableByName, listAvailableUpTo, findAvailableNamed.",
          solution: SNACK_REPOSITORY,
          example: EX.d4EveryPath,
        },
        {
          goal: "Monday's refused order, again. Run this line on a localhost:8080 page and paste what it copies.",
          command: ORDER_REFUSED,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "refused_status", equals: 409, message: "An order for a retired snack should answer 409: placeOrder asks snacks.isAvailable(…) and the controller throws." },
            { path: "refused_message", contains: "is not available", message: "The message should end with  is not available." },
            { path: "no_sale_written", equals: true, message: "A sale was written for a retired snack: the check must come before orders.insert(…)." },
            { path: "after_putting_back_status", equals: 201, message: "A snack back on the menu should be orderable (201)." },
          ],
          hint: "The refusal is the controller's decision; the flag comes from SnackRepository.isAvailable.",
          solution: D4_METHODS.placeOrder,
          example: EX.d4Order,
        },
        {
          goal: "Wednesday's staff list, again. Run this line on a localhost:8080 page and paste what it copies.",
          command: STAFF_LIST_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "staff_status", equals: 200, message: "GET /api/staff/snacks should answer 200: did the controller's staffSnacks call snacks.listAll()?" },
            { path: "staff_shows_it", equals: true, message: "The staff list should show a retired snack: SnackRepository.listAll() has no WHERE." },
            { path: "staff_says_unavailable", equals: true, message: "The staff list should say available:false." },
            { path: "menu_keys_unchanged", equals: true, message: "The public menu should still have only snack_id, name and price." },
          ],
          hint: "listAll() returns List<StaffSnack>; the controller just returns it.",
          solution: SNACK_REPOSITORY,
          example: EX.d4Staff,
        },
        {
          goal: "Last week's wall, again. Run this line on a localhost:8080 page and paste what it copies. It adds a snack, orders it, tries to remove it (refused), cancels the order, and removes it.",
          command: SNACK_WALL,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "wall_status", equals: 409, message: "Removing a snack with a sale should answer 409: the DataIntegrityViolationException from snacks.delete(…) must be caught in deleteSnack, in the controller." },
            { path: "wall_message", contains: "is used by a sale or a special", message: "The message should be  Snack N is used by a sale or a special." },
            { path: "cancel_status", equals: 204, message: "Cancelling the order should answer 204." },
            { path: "delete_after_cancel_status", equals: 204, message: "After the sale is cancelled, removing the snack should answer 204." },
          ],
          hint: "The catch stays in the controller, around  snacks.delete(id).  The repository lets the exception through.",
          solution: D4_METHODS.deleteSnack,
          example: EX.d4Wall,
        },
      ],
    },
    {
      kind: "quest",
      id: "week10-gauntlet",
      inline: true,
      title: "🏁 Gauntlet: Kuya Jun's school-supplies shop, again",
      intro:
        "Kuya Jun has copied your week. His tables: supplies (item_id INT PRIMARY KEY, name VARCHAR(50), price INT, in_stock BOOLEAN NOT NULL DEFAULT TRUE) holds 1 Notebook 20, 2 Pen 8, 3 Ruler 5, 4 Eraser 3, 5 Crayons 30. purchases (purchase_id INT PRIMARY KEY AUTO_INCREMENT, item_id INT, qty INT, FOREIGN KEY (item_id) REFERENCES supplies (item_id)) holds three purchases: item 5 twice and item 2 once. Predict first, then answer. These were all run on a real MySQL.",
      missions: [
        mission(
          "He retires the crayons:  UPDATE supplies SET in_stock = FALSE WHERE item_id = 5;  and then asks for the shop window:  SELECT * FROM supplies WHERE in_stock = TRUE;",
          "Five items, one retired.",
          mc(
            "How many rows does the window show?",
            "4: the retired item is still in the table, and not in the window",
            ["5", "0"],
            "Same as your menu: nothing is deleted, and the WHERE hides it.",
          ),
        ),
        mission(
          "Next, his purchase list:  SELECT * FROM purchases INNER JOIN supplies ON purchases.item_id = supplies.item_id;  The crayons are still retired. There were three purchases.",
          "Does the JOIN have an in_stock test?",
          mc(
            "How many rows does the purchase list show?",
            "3: the JOIN doesn't filter, so history is untouched",
            ["1: only the pen", "0"],
            "Retiring changes what the window shows, not what happened.",
          ),
        ),
        mission(
          "He is tired of seeing the crayons in the table and runs  DELETE FROM supplies WHERE item_id = 5;  on the retired item.",
          "Week 9, Thursday.",
          mc(
            "What does MySQL answer?",
            "Error 1451: purchases still point at item 5, retired or not",
            ["It deletes the item, because it is retired", "0 rows affected"],
            "Retiring doesn't touch the foreign key. A snack with history stays in the table for good, which is the point.",
          ),
        ),
        mission(
          "A helper retires the crayons a second time, with the same statement as before, in the MySQL command line. His Java app does the same through JdbcClient.",
          "Week 9, Monday: rows matched and rows changed.",
          mc(
            "What does the command line report, and what would his PUT answer?",
            "Rows matched: 1, Changed: 0; through JdbcClient the count is rows matched (1), so the PUT answers 200, not 404",
            ["0 rows affected, so 404", "An error: it's already retired"],
            "Not found and not changed are different, as in Week 9's Monday. A second retire is still a success.",
          ),
        ),
        mission(
          "A tired helper runs  UPDATE supplies SET in_stock = FALSE;  to retire one item and forgets the WHERE. Afterwards:  SELECT * FROM supplies WHERE in_stock = TRUE;",
          "Which rows does an UPDATE with no WHERE choose?",
          mc(
            "What does the window show?",
            "Nothing: every item is off the shop window",
            ["Only the first item", "All items, unchanged"],
            "The WHERE is the whole safety, one more time. (It matched 5 rows and changed 4, because the crayons were already off.)",
          ),
        ),
        mission(
          "Kuya Jun adds a new column the lazy way:  ALTER TABLE supplies ADD COLUMN on_sale BOOLEAN DEFAULT TRUE;  with NO  NOT NULL.  Later a helper inserts Glue with  on_sale  set to NULL. He asks for  SELECT * FROM supplies WHERE on_sale = TRUE;",
          "Is NULL equal to TRUE? Week 2 on NULL.",
          mc(
            "Is the Glue in the result, and what does it teach you about NOT NULL?",
            "No: NULL = TRUE is not true, so the row falls through both WHERE on_sale = TRUE and WHERE on_sale = FALSE; NOT NULL DEFAULT TRUE is why your column can't lose a row",
            ["Yes: NULL counts as TRUE", "An error: NULL isn't allowed"],
            "Observed: 6 rows, 5 with TRUE, 1 with NULL, and the NULL one is in neither list. Your column is NOT NULL, so every snack is on one side.",
          ),
        ),
        paste(
          "Write your answers to the six scenarios in one line each, and add a seventh of your own: a query on Kuya Jun's tables that you are not sure about. Predict it, and say how you would find out.",
          "How you'd find out: run the SQL by hand on a copy, or write the SELECT first.",
          "Paste your seven lines",
        ),
      ],
    },
    ...day4Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five students, five repositories",
      intro: "Each patient is a real failure of this kind of lab. The first, second and fifth were observed on a real build.",
      missions: [
        mission(
          "Patient 1. A student forgot the annotation (and its import) on SnackRepository. The app does not start. The terminal says  APPLICATION FAILED TO START  and, under Description,  Parameter 0 of constructor in com.example.canteen.SnackController required a bean of type 'com.example.canteen.SnackRepository' that could not be found.",
          "Which file does the message name as missing, and what makes Spring create a class?",
          mc(
            "What is the fix?",
            "Add @Repository (and its import, org.springframework.stereotype.Repository) above SnackRepository: without it Spring has nothing to hand to the controller",
            ["Add @RestController to the repository", "Restart MySQL"],
            "Constructor injection can only supply what Spring knows about. The message names the type it couldn't find.",
          ),
        ),
        mission(
          "Patient 2. A student's SnackRepository.delete runs the DELETE and returns the number 1 'to be safe'. DELETE /api/snacks/99999 answers 204.",
          "What does the controller do with the count?",
          mc(
            "What went wrong?",
            "The repository lied about the count, so the controller couldn't answer 404: the count must be exactly what .update() returned",
            ["The controller's 404 test is wrong", "99999 exists"],
            "Week 9 Wednesday's first lie (a DELETE that answered 204 for an order that was never there), one layer down. The battery's 404 check on a missing snack catches it.",
          ),
        ),
        mission(
          "Patient 3. A student put the three 400 checks and the 404 into SnackRepository.update, so 'the repository is complete'. The first time a second kind of caller needs the same update, they can't give it a different answer.",
          "Who should decide what a customer is told?",
          mc(
            "Why is that the wrong place?",
            "A repository answers questions about the ledger; what to tell the customer is the controller's decision, and putting it in the repository ties every caller to HTTP",
            ["Repositories can't throw", "Controllers can't call repositories"],
            "Facts down below, decisions up above.",
          ),
        ),
        mission(
          "Patient 4. A student wrote  new SnackRepository()  inside the controller instead of asking for it in the constructor. It does not compile: SnackRepository has no constructor without a JdbcClient.",
          "Who creates a SnackRepository, and what does it need?",
          mc(
            "What is the fix?",
            "Ask for the SnackRepository in the controller's constructor and let Spring create and pass it, with its JdbcClient",
            ["Create a JdbcClient with new", "Make the field static"],
            "You never write new for things Spring owns: you ask for them.",
          ),
        ),
        mission(
          "Patient 5. A student moved the menu's SQL and mistyped a column. The app starts, and every request to /api/snacks answers 500 with a message that starts  PreparedStatementCallback; bad SQL grammar [SELECT …].",
          "What does 'bad SQL grammar' say, and what does the message show after it?",
          mc(
            "What is the first thing you check?",
            "The SQL inside the brackets in the message: it is the statement MySQL refused, and a mistyped column or table name is the usual reason",
            ["The page's JavaScript", "The foreign key"],
            "The app prints the statement. Observed with a SELECT that named a column that didn't exist yet.",
          ),
        ),
        paste(
          "Write your discharge notes: one line per patient with the first thing you would check, and then one line that starts: 'When I move code into another class, I prove nothing changed by …'.",
          "Patient 2 and the battery give you the line.",
          "Paste your five notes and your rule",
        ),
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own repository method",
      intro: "Add something through the new layers. Do at least one idea; if you have time, do more.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Keep every checkpoint passing. Ideas: (1) SnackRepository.count() with  SELECT COUNT(*) FROM snacks WHERE available = TRUE  and an endpoint GET /api/snacks/count that answers a small record; (2) OrderRepository.listForSnack(int snackId) and GET /api/snacks/{id}/orders, with a 404 when the snack doesn't exist (the repository returns the list, the controller decides); (3) move the 400 checks out of addSnack and updateSnack into ONE private method in the controller (they are written twice), and run the battery; (4) write in notes.md which of the three repositories would get a method for 'the five newest sales', and why; (5) harder: an InfoRepository for the hard-coded CanteenInfo is tomorrow's job: sketch its one method on paper first.",
          hint: "Ideas 1 and 2 add a method to a repository and one to the controller; restart after each. For idea 3, the private method takes the name and the price and throws; the two endpoints call it.",
        },
        paste(
          "Paste what you added: the new lines (and which file), how you tested it, and what it answered.",
          "How you tested it can be one sentence.",
          "Paste your new lines, how you tested, and what it answered",
        ),
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-layers",
    title: "⚔️ Boss battle: The Tangled Controller",
    intro: "The Tangled Controller does everything and knows too much. Give each layer one job.",
    boss: { name: "the Tangled Controller", emoji: "🪢" },
    questions: [
      bq("What does a repository hold?", "The SQL, and the JdbcClient that runs it", ["The HTTP statuses", "The page's JavaScript"], "It talks to the database and nothing else."),
      bq("What does the controller keep after the split?", "The addresses, the checks, and every status: 400, 404, 409", ["The SQL", "The JdbcClient"], "Decisions about the customer's answer."),
      bq("What does @Repository do?", "Tells Spring to create one of the class so it can be handed to others", ["Opens the database", "Makes methods public"], "Without it, nothing for the constructor to receive."),
      bq("How does the controller get its repositories?", "It asks for them in its constructor and Spring passes them in", ["It creates them with new", "It reads them from a file"], "Constructor injection: the same as JdbcClient since Week 8."),
      bq("What does the app say when a repository has no @Repository?", "APPLICATION FAILED TO START: the controller's constructor required a bean of that type that could not be found", ["A 404 on the first request", "Nothing: it still works"], "Observed. It names the type."),
      bq("Who decides to answer 404 when a repository's update() returns 0?", "The controller", ["The repository", "MySQL"], "The repository returns the count; the controller turns it into a status."),
      bq("A repository's delete() returns 1 no matter what. What does DELETE /api/snacks/99999 answer?", "204: the controller believed the count", ["404", "409"], "Observed. A repository must return exactly what .update() returned."),
      bq("How do you prove a refactor changed nothing?", "Run the same checks before and after, and compare the answers", ["Count the files", "Read it twice"], "The battery and last week's checkpoints."),
      bq("How do you prove the controller holds no SQL?", "Search the project for jdbc.sql: it must appear only in repository files", ["The app starts", "The battery passes"], "The browser can't see where SQL lives."),
      bq("After retiring item 5, how many purchases does Kuya Jun's JOIN still show?", "All of them (3): a JOIN that doesn't filter keeps history", ["None", "Only the pen's"], "Run in SQL: 3."),
      bq("A column is added without NOT NULL and a row gets NULL. WHERE on_sale = TRUE:", "Doesn't return that row: NULL = TRUE is not true", ["Returns it", "Is an error"], "Run in SQL: 5 rows with TRUE, 1 NULL, the NULL row in neither list."),
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what does each of the three repositories hold, and what does the controller keep?",
      "What did you run before the split and after it, and what told you nothing had changed?",
      "What happens at startup if a repository has no @Repository, and how do you fix it?",
      "Why must a repository's update() or delete() return exactly the count it got?",
      "Which gauntlet scenario surprised you, and what did you learn from it?",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "The controller is thinner and the SQL has a home. Part 2 puts a summary line on the dashboard. Tomorrow you look for data typed in by hand.",
  },
};
