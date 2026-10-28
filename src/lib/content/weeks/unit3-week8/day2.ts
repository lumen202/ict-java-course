// unit3-week8 · Day 2 — Ask the ledger a question
//
// getSnack and the maxPrice filter move from the Java list into SQL with `?`
// placeholders (Week 4's PreparedStatement idea, now `.param(...)`), the Java
// list of snacks is deleted, and a deliberately glued /api/find?name= shows
// the injection from Week 4 Day 3 working on the web before it is fixed.
//
// Observed on a real Spring Boot 4.1.1 + MySQL 8 build (see snippets.ts):
//  - .optional().orElseThrow(...) on an empty result answers the same 404 and
//    message as Week 7 ("No snack with id 99");
//  - ?maxPrice=0 answers [] (200); ?maxPrice=abc answers 400 from Spring's
//    own conversion, before any SQL runs;
//  - /api/find?name=zzz' OR '1'='1 on the glued version returns every snack,
//    on the `?` version []; a name with an apostrophe (Aling's) is a 500 on the
//    glued version (root cause: "You have an error in your SQL syntax …
//    near 's'' at line 1") and [] on the safe one;
//  - missing .param(...): "No value specified for parameter 1"; column typo:
//    "Unknown column 'nme' in 'field list'"; record field with no column:
//    "Column 'price' not found."; table typo: "Table 'school.snack' doesn't
//    exist"; SELEC typo: "Statement.executeQuery() cannot issue statements that
//    do not produce result sets."; .single() on no row: "Incorrect result size:
//    expected 1, actual 0" (500). Each browser message is "bad SQL grammar [SQL]"
//    or similar; the cause is in the terminal after "with root cause".
//
// Revised after the first two reviews (docs/agent/log/2026-10-28-week8-reviews-and-part-2.md):
// the lab snack is Kutsinta (a Week 3 Taho made /api/find?name=Taho return two),
// the price experiment runs on Kutsinta instead of overwriting the student's own
// Turon, the checkpoint is failed by the Day 1 app (previousStage), and the day
// continues with Part 2: LIKE search wired to the menu page, and a sort chosen
// from a whitelist (day2-part2.ts).
// Video (transcript read): IntelliJ IDEA, "Spring JdbcClient: A better alternative
// to JdbcTemplate" (oF7vlaJhySE, 14:02): the first 7:22 (findAll, findById with
// optional()) are assigned; named parameters, H2 and Flyway are in the watch notes.

import type { DayPlan } from "../../types";
import { day2Part2 } from "./day2-part2";
import {
  CONTROLLER_D2A,
  FIND_GLUED,
  FIND_SAFE,
  GET_SNACK_D2,
  LIST_SNACKS_D2,
} from "./snippets";

const SQL_RUN = "Ctrl+E, then Ctrl+E again";

const ATTACK_ADDRESS = "localhost:8080/api/find?name=zzz' OR '1'='1";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "Ask the ledger a question: one snack by id, the cheap ones, and why we never glue",
  warmupGame: {
    kind: "quest",
    id: "warmup-question-marks",
    title: "❓ Warm-up: the ? from Week 4",
    intro: "Week 4 Day 3 taught one rule that decides today: values travel separately from the SQL.",
    missions: [
      {
        task: "Week 4's PreparedStatement:  SELECT * FROM snacks WHERE snack_id = ?  and then  ps.setInt(1, 3).  The ? is a gap in the SQL that is filled with a value afterwards.",
        hint: "Week 4 Day 3: what could a value like  3 OR qty > 0  do if it were glued into the text?",
        check: {
          question: "Why does Week 4 fill the ? with setInt instead of gluing the value into the string with + ?",
          choices: [
            "Gluing is slower",
            "Java doesn't allow + in a string",
            "A glued value becomes part of the SQL itself, so a value like  3 OR qty > 0  rewrites the question. A ? keeps the value as a value, never as SQL",
          ],
          answer: 2,
          explain: "That is SQL injection, which you carried out yourself on Wednesday of Week 4. Today your web app is the one exposed to strangers' input.",
        },
      },
      {
        task: "snack_id is the primary key of snacks (Week 2). A WHERE on a primary key can match at most one row.",
        hint: "What does a primary key promise about its values?",
        check: {
          question: "SELECT … FROM snacks WHERE snack_id = 99 and there is no snack 99. What does MySQL answer?",
          choices: [
            "Error 1452",
            "One row full of NULLs",
            "No error: a result with 0 rows",
          ],
          answer: 2,
          explain: "A query that finds nothing is not an error. Turning 'no row' into the right answer is the app's job. For a web app, that answer is 404.",
        },
      },
      {
        task: "Week 7's getSnack answered an unknown id with status 404 and the message  No snack with id 99.",
        hint: "The Week 7 pages read that message and show it on the screen.",
        check: {
          question: "Should moving the data to MySQL change that 404 and its message?",
          choices: [
            "No: the address, status code and message are the API's promise to the pages. Only the home of the data changes",
            "Yes: MySQL's own error should show",
            "Yes: it becomes 500",
          ],
          answer: 0,
          explain: "Your pages were written against that promise. Keeping it is what lets you swap the Java list for MySQL without touching a page.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Spring JdbcClient: a better alternative to JdbcTemplate (IntelliJ IDEA)",
      youtubeId: "oF7vlaJhySE",
      length: "14:02",
      practice: {
        intro: "Watch the first 7 minutes: up to where he says 'Next, let us implement save()'. That is findAll (a list) and findById (one row, or none). Then run in SQLTools the three questions your Java will ask.",
        steps: [
          "In queries.sql run  SELECT snack_id, name, price FROM snacks WHERE snack_id = 2;  (" + SQL_RUN + " to run it). One row. Now change 2 to 99 and run it again: how many rows, and is there an error?",
          "Run  SELECT snack_id, name, price FROM snacks WHERE price <= 12 ORDER BY snack_id;  and write in notes.md how many rows come back and which snacks. Your Kutsinta (price 10) should be among them.",
          "Run  SELECT snack_id, name, price FROM snacks WHERE name = 'Kutsinta';  Then run it with the name  Kutsintaa.  Write what each gave.",
          "In notes.md write three differences between his code and the code you will type: (1) his SQL says  WHERE id = :id  with a NAME, yours says  WHERE snack_id = ?  with a question mark; (2) his lives in a @Repository class, yours stays in the controller; (3) his answer is an Optional, yours turns it into a 404. Add one more difference you noticed.",
        ],
        note: "He uses named parameters (:id and .param(\"id\", id)), an H2 test database with Flyway migrations, and Spring Boot 3.2. Your SQL uses ? and  .param(id),  in the same order as the question marks, like Week 4's setInt(1, …). A video that says  .single()  is shown below in the error clinic: it answers 500 when there's no row, so we use  .optional()  instead.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: one snack, by its id",
      intro:
        "getSnack is the method placeOrder uses to check a snack and read its price. When it moves to MySQL, the receipt, the 404s and the order drop-down all follow. Restart after every change to a .java file.",
      missions: [
        {
          task:
            "Replace getSnack. Delete the whole old getSnack method (the one with the  for (Snack s : snacks)  loop) and type this in its place:\n\n" +
            GET_SNACK_D2 +
            "\n\nRead it from the top: the SQL has one ? ; .param(id) fills it with the id from the address; .query(Snack.class) turns the row into a Snack; .optional() hands back an Optional, a box that holds one Snack or is empty; .orElseThrow(…) opens the box, and if it is empty, throws what the arrow  () -> …  builds: the same 404 and message as Week 7. (The arrow is a recipe in a line; you met arrows in JavaScript in Week 6.)",
          hint:
            "No import line is needed: Optional is never named in your code. The 404 line is Week 7's, with the same message. Don't forget the closing ) and ; on the orElseThrow line. Red under HttpStatus or ResponseStatusException means you deleted an import line: they are still needed.",
          check: {
            question: "In SQLTools,  WHERE snack_id = 99  gave 0 rows and no error. What does your app turn that into?",
            choices: [
              "A 500, because there is no row",
              "A 200 with an empty snack",
              "A 404 with  No snack with id 99:  .optional() is empty, so .orElseThrow runs",
            ],
            answer: 2,
            explain: "MySQL said 'nothing found', which isn't an error. Your app decides what 'nothing found' means to the page: here 404 and your message.",
          },
        },
        {
          task:
            "Restart and test. Open localhost:8080/api/snacks/2, then /api/snacks/90, then /api/snacks/99, then /api/snacks/abc. Write each status and answer in notes.md (F12 → Network, or the page itself).",
          hint:
            "/2 and /90 answer one snack. /99 is Week 7's 404 with your message. /abc is a 400 from Spring itself: it can't turn abc into an int, so your method never even runs and no SQL is sent.",
          check: {
            question: "/api/snacks/abc answers 400 and not 404. Why?",
            choices: [
              "getSnack ran and found no snack called abc",
              "MySQL refused it",
              "Spring can't convert abc into the int the method asks for, so it refuses before getSnack runs and before any SQL is sent",
            ],
            answer: 2,
            explain: "Typed parameters are the first guard: Spring checks the type, so only a real int reaches your SQL.",
          },
        },
        {
          task:
            "Delete the Java list: find the field  private final List<Snack> snacks = List.of(  … );  (eight lines, with the six  new Snack(…)  lines) and delete all of it. Save, restart, and reload /api/snacks and /api/snacks/2. Then open order.html and order Kutsinta (qty 1): the receipt should say  Order 1: 1 × Kutsinta = ₱10  (Order 1, because the orders still live in a Java list that a restart just emptied).",
          hint:
            "If VS Code underlines something in red after you delete the field, some line still uses  snacks: read the red message. Nothing should: yesterday's listSnacks uses  all.  The order NUMBER is 1 because the orders still live in a Java list; Wednesday changes that.",
          check: {
            question: "Yesterday ordering Kutsinta said 'No snack with id 90'. Why does it work now?",
            choices: [
              "getSnack reads MySQL now, and Kutsinta is a row in your table",
              "Kutsinta was added to the Java list",
              "The browser cached it",
            ],
            answer: 0,
            explain: "One method changed, and the Java list of snacks lost its last job. There is now exactly one place the snack prices live.",
          },
        },
        {
          task:
            "Check the two prices agree. Yesterday the form offered Kutsinta and the receipt refused it. Run  UPDATE snacks SET price = 13 WHERE snack_id = 90;  and on order.html choose Kutsinta, qty 2: read the total under the form, press Place order and read the receipt. Then put the price back, always on Kutsinta and always to 10:  UPDATE snacks SET price = 10 WHERE snack_id = 90;",
          hint: "Yesterday the form showed a total and the receipt said Sorry. Now the total and the receipt both come from the same row.",
          check: {
            question: "What do the total under the form and the receipt say now?",
            choices: [
              "The total says ₱26 (13 × 2) and the receipt says 2 × Kutsinta = ₱26: one row, one price",
              "The total says ₱26 and the receipt says Sorry: No snack with id 90",
              "The total says ₱20 and the receipt says ₱26",
            ],
            answer: 0,
            explain: "One row, one price. The drop-down, the total and the receipt all ask MySQL, directly or through getSnack. (Reminder: put the price back to 10 now, or the checkpoints will tell you.)",
          },
        },
      ],
    },
    {
      kind: "quest",
      id: "lab-filters",
      inline: true,
      title: "🛠️ Part 1 · Real lab: the cheap snacks, and one lesson about gluing",
      intro:
        "Two more questions for MySQL: which snacks cost at most this much, and which snack has exactly this name. The second one is where Week 4's lesson comes back.",
      missions: [
        {
          task:
            "Move the filter into SQL. Delete the whole listSnacks method and type this in its place. The loop is gone: MySQL does the filtering with a WHERE, and your Java just passes the number:\n\n" +
            LIST_SNACKS_D2,
          hint:
            "Two queries: one with no WHERE when maxPrice is null, one with  WHERE price <= ?  and  .param(maxPrice).  The ArrayList import stays; the orders still use it until Thursday.",
          check: {
            question: "Where is the 'price is at most maxPrice' test done now?",
            choices: [
              "In a Java loop, as in Week 7",
              "In the browser",
              "In MySQL's WHERE, so only the matching rows ever reach Java",
            ],
            answer: 2,
            explain: "Letting the database filter is what it is for. With a thousand snacks, Java would no longer have to copy them all first.",
          },
        },
        {
          task:
            "Restart and test: localhost:8080/api/snacks?maxPrice=12 (the cheap ones; Kutsinta included), then ?maxPrice=10 (Kutsinta still included: <= means 'up to and including'), then ?maxPrice=0 (an empty list, with status 200), then ?maxPrice=abc.",
          hint: "A list with no matches is still a correct answer: status 200 and []. It's /abc that is refused, again by Spring, with 400.",
          check: {
            question: "?maxPrice=0 answers  []  with status 200. Why not a 404?",
            choices: [
              "It should be a 404: nothing was found",
              "Because 0 is a bad number",
              "The address is right and the question is fine: 'which snacks cost 0 or less?' has the correct answer 'none'. 404 is for a thing that should exist and doesn't",
            ],
            answer: 2,
            explain: "Same line as Week 7: /api/snacks/99 asks for one specific thing (404 if it's missing); a filter asks for a list, and an empty list is a list.",
          },
        },
        {
          task:
            "A search by exact name, written the WRONG way on purpose. Add this method anywhere inside the class, restart, and open localhost:8080/api/find?name=Kutsinta (one Kutsinta) and  localhost:8080/api/find?name=Aling's  (watch what happens):\n\n" +
            FIND_GLUED,
          hint:
            "The name goes into the middle of the SQL text with  + name +  and the two single quotes around it. Open the terminal and read the line after 'with root cause' for the /find?name=Aling's request.",
          check: {
            question: "A customer types  Aling's  with an apostrophe. Nobody is attacking anyone. What happens?",
            choices: [
              "A 500: the apostrophe ends the quoted name early, so MySQL gets broken SQL and reports a syntax error",
              "It finds nothing and answers []",
              "It finds Aling Nena's snack",
            ],
            answer: 0,
            explain: "Even an honest customer can break glued SQL. The root cause line said  You have an error in your SQL syntax … near 's'' : the stray apostrophe ended the quotes.",
          },
        },
        {
          task:
            "Now be the attacker. First predict. Then open this exact address (spaces and quotes as written; the browser fixes them itself):\n\n" +
            ATTACK_ADDRESS +
            "\n\nThere is no snack named zzz.",
          hint: "The SQL became  WHERE name = 'zzz' OR '1'='1'.  Is '1'='1' ever false?",
          check: {
            question: "What did the app answer?",
            choices: [
              "[] : there is no snack called zzz",
              "A 400",
              "Every snack in the table: the stranger's text rewrote the WHERE so it is always true",
            ],
            answer: 2,
            explain: "That is Week 4's injection, on the web. A stranger never needed your password or your tables: just a text box and an apostrophe. With a different second half, the same trick can read other tables.",
          },
        },
        {
          task:
            "Fix it. Delete the findByName method and type this in its place, then restart and open the SAME attack address and the Aling's address again:\n\n" +
            FIND_SAFE,
          hint: "The name is no longer part of the text: the SQL ends  name = ?  and  .param(name)  hands the value over separately. Kutsinta should still be found.",
          check: {
            question: "Now the attack address answers  []  and Aling's answers  [] . Why?",
            choices: [
              "The whole text, quotes and all, is treated as ONE name to look for, and no snack has that name",
              "The server blocks the word OR",
              "Spring cleans the quotes out first",
            ],
            answer: 0,
            explain: "With a ?, the value can never become SQL. Same rule as Week 4: values travel separately. The glued version isn't in your project any more, and it must never be written again.",
          },
        },
        {
          task:
            "Compare. After today your SnackController.java should look like this (line 1 is your own package line; blank lines, import order, method order and any leftover import lines don't matter):\n\n" +
            CONTROLLER_D2A,
          hint: "Common differences: the old  snacks  field still there, the old loop still inside listSnacks, two findByName methods (the glued one must be gone), a missing orElseThrow line. Everything under findByName is last week's code, unchanged.",
        },
        {
          task: "Add today to notes.md: the SQL questions and what they returned, your three differences from the video, what the glued version did on Aling's and on the attack address, and why the ? version doesn't.",
          hint: "Write it in your own words. Quote the root-cause line for Aling's.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-questions",
      title: "🧪 Part 1 · Checkpoint: questions for MySQL",
      intro:
        "Open each address with your app running (or run the console line in a tab of localhost:8080), copy the answer, and paste it. They use Kutsinta (id 90, price 10) from yesterday: its price must be back to 10. Yesterday's app cannot pass the tasks about /api/snacks/90, /api/find and the attack: it has no such answers.",
      tasks: [
        {
          goal: "Paste what your app answers at /api/snacks/90.",
          url: "localhost:8080/api/snacks/90",
          checks: [
            { is: "object", message: "This should be ONE snack, starting with {. A Whitelabel page or a list means getSnack isn't answering. Read the terminal." },
            { keys: ["snack_id", "name", "price"], message: "A snack needs snack_id, name and price: check getSnack's SELECT names all three." },
            { path: "name", equals: "Kutsinta", message: "The name should be Kutsinta. Is getSnack reading MySQL (WHERE snack_id = ?) and not the old Java list?" },
            { path: "price", equals: 10, message: "Kutsinta's price should be 10: run  UPDATE snacks SET price = 10 WHERE snack_id = 90;" },
          ],
          hint: "If it is a 404 saying 'No snack with id 90', getSnack still searches a Java list.",
          solution: GET_SNACK_D2,
          example: "{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}",
          previousStage: "{\"timestamp\":\"2026-10-27T19:56:03.824Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No snack with id 90\",\"path\":\"/api/snacks/90\"}",
          explain: "A snack that only exists in MySQL, answered by one method that asks for exactly one row.",
        },
        {
          goal: "A snack that doesn't exist. Open localhost:8080/ in a tab, press F12 → Console, and run this line. It prints the app's answer for snack 9999 and copies it. Paste it here.",
          command:
            "fetch(\"/api/snacks/9999\").then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)",
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {. Did the line run on localhost:8080?" },
            { path: "status", equals: 404, message: "The status should be 404. If it says 500, getSnack may be calling .single(); use .optional() and .orElseThrow." },
            { path: "message", equals: "No snack with id 9999", message: "The message should be exactly  No snack with id 9999  with the id at the end. Check the orElseThrow line, and spring.web.error.include-message=always in application.properties." },
          ],
          hint: "The message is built in the arrow:  \"No snack with id \" + id.  The setting that puts it in the answer is the one from Week 7 Day 2.",
          solution: GET_SNACK_D2,
          example: "{\"timestamp\":\"2026-10-27T19:55:54.144Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No snack with id 9999\",\"path\":\"/api/snacks/9999\"}",
          explain: "Same 404 and message as Week 7, from a different home. Your pages never noticed.",
        },
        {
          goal: "Paste what your app answers at /api/snacks?maxPrice=12.",
          url: "localhost:8080/api/snacks?maxPrice=12",
          checks: [
            { is: "array", message: "This should be a list, starting with [." },
            { everyAtMost: { key: "price", max: 12 }, message: "A snack costs more than 12. The WHERE price <= ? must keep only the cheap ones." },
            { some: { snack_id: 90, name: "Kutsinta", price: 10 }, message: "Kutsinta (price 10) should be in the answer. Is the query  WHERE price <= ?  and is .param(maxPrice) there?" },
          ],
          hint: "Check the second query in listSnacks: WHERE price <= ? ORDER BY snack_id, then .param(maxPrice).",
          solution: LIST_SNACKS_D2,
          example: "[{\"snack_id\":2,\"name\":\"Turon\",\"price\":12},{\"snack_id\":4,\"name\":\"Gulaman\",\"price\":10},{\"snack_id\":6,\"name\":\"Pastillas\",\"price\":8},{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}]",
          explain: "The filter now runs in MySQL. Your Java passes a number and gets back only what matches.",
        },
        {
          goal: "Paste what your app answers at /api/find?name=Kutsinta.",
          url: "localhost:8080/api/find?name=Kutsinta",
          checks: [
            { is: "array", message: "This should be a list, starting with [. Is /api/find in your SnackController?" },
            { exact: 1, message: "Exactly one snack is called Kutsinta, whatever else is in your ledger. Is the query  WHERE name = ?  with  .param(name)?" },
            { path: "0.price", equals: 10, message: "Kutsinta's price should be 10." },
          ],
          hint: "The method is findByName with @GetMapping(\"/api/find\") and @RequestParam String name.",
          solution: FIND_SAFE,
          example: "[{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}]",
          previousStage: "{\"timestamp\":\"2026-10-27T19:56:05.676Z\",\"status\":404,\"error\":\"Not Found\",\"message\":\"No static resource api/find.\",\"path\":\"/api/find\"}",
          explain: "A search by name that a customer's apostrophe can't break.",
        },
        {
          goal: "The attack, tried on your fixed app. Run this line in the console of a localhost:8080 tab. It sends  zzz' OR '1'='1  as the name, and prints how many rows came back as JSON. Paste it here.",
          command:
            "fetch(\"/api/find?name=\" + encodeURIComponent(\"zzz' OR '1'='1\")).then(r => r.json()).then(a => JSON.stringify({ rows_returned: a.length })).then(t => { console.log(t); return t; }).then(copy)",
          checks: [
            { is: "object", message: "This should be a small object like {\"rows_returned\":0}. Did the line run on localhost:8080, and is /api/find answering?" },
            { path: "rows_returned", equals: 0, message: "The attack returned rows: your findByName still glues the name into the SQL. Use  WHERE name = ?  and  .param(name),  with no + in the string." },
          ],
          hint: "If rows_returned isn't 0, look for  + name +  in findByName: it must not be there.",
          solution: FIND_SAFE,
          example: "{\"rows_returned\":0}",
          previousStage: "{}",
          explain: "The same text that returned every snack now returns nothing. That's what a ? is for.",
        },
      ],
    },
    ...day2Part2,
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro:
        "Every message below was copied from a real app. The browser usually says only  bad SQL grammar [the SQL]  or a short sentence. The cause is in the terminal, on the line after 'with root cause'.",
      missions: [
        {
          task:
            "Patient 1. /api/snacks/2 answers 500. The terminal says  java.sql.SQLException: No value specified for parameter 1.  The SQL is  WHERE snack_id = ?  and the code has  .query(Snack.class)  right after the string.",
          hint: "Count the question marks, then count the .param(…) calls.",
          check: {
            question: "Diagnosis?",
            choices: [
              "The id is too big",
              "MySQL lost the connection",
              "There is a ? but no .param(id) to fill it: every ? needs one .param, in order",
            ],
            answer: 2,
            explain: "With two ? and one .param the message says 'parameter 2'. The number tells you which gap is still empty.",
          },
        },
        {
          task:
            "Patient 2. The terminal says  java.sql.SQLSyntaxErrorException: Unknown column 'nme' in 'field list'.",
          hint: "'field list' is the part between SELECT and FROM.",
          check: {
            question: "Where is the typo?",
            choices: [
              "In the WHERE: a column name is misspelled there",
              "In the Java record: the field name is wrong",
              "In the SELECT list: the column is spelled nme, and the table has name",
            ],
            answer: 2,
            explain: "MySQL quotes the exact word it couldn't find. Paste the query into SQLTools: it says the same thing, and it's quicker to fix there.",
          },
        },
        {
          task:
            "Patient 3. The SELECT is  SELECT snack_id, name FROM snacks  and the record is  Snack(int snack_id, String name, int price).  The browser says 500 and  bad SQL grammar [SELECT snack_id, name FROM snacks].  The SQL runs fine in SQLTools. The terminal says  java.sql.SQLSyntaxErrorException: Column 'price' not found.",
          hint: "The SQL is correct. Who is looking for a column called price?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The record has a field price, but the SELECT doesn't return that column: every field of the record needs a column with its name",
              "MySQL doesn't have a price column",
              "Spring Boot 4 doesn't support records",
            ],
            answer: 0,
            explain: "'Bad SQL grammar' sounds like a typo in the SQL, but this SQL is fine. The words  Column 'price' not found  are the mapper telling you the record asked for more than the SELECT gave.",
          },
        },
        {
          task:
            "Patient 4. The student mistyped  SELEC snack_id, name, price FROM snacks.  The browser says 500. The terminal says  java.sql.SQLException: Statement.executeQuery() cannot issue statements that do not produce result sets.",
          hint: "The driver doesn't recognise SELEC as a query, so it doesn't call it one. Run the same text in SQLTools.",
          check: {
            question: "The message doesn't mention syntax at all. What do you do?",
            choices: [
              "Give up: the message is useless",
              "Copy the SQL into SQLTools and run it there: it tells you at once which word is wrong. A strange message with SQL in the browser usually means the SQL text itself needs reading",
              "Restart MySQL",
            ],
            answer: 1,
            explain: "Not every message helps. The cure is the same: take the SQL out of Java and run it where the errors are clearest. This is why you write the SELECT in queries.sql first.",
          },
        },
        {
          task:
            "Patient 5. The terminal says  java.sql.SQLSyntaxErrorException: Table 'school.snack' doesn't exist.",
          hint: "The name is printed with the database before it: school.snack.",
          check: {
            question: "What is wrong?",
            choices: [
              "The database name is wrong in the url",
              "The table is spelled snack, and it is called snacks",
              "You need to create the table first",
            ],
            answer: 1,
            explain: "The message says which database it looked in (school: fine) and which table (snack: not there). One missing letter.",
          },
        },
        {
          task:
            "Patient 6. The student calls  .query(Snack.class).single()  instead of  .optional().orElseThrow(…).  /api/snacks/99 answers status 500 with  Incorrect result size: expected 1, actual 0.",
          hint: "A video showed .single(). What does single() do when there is not exactly one row?",
          check: {
            question: "What should it answer, and what do you change?",
            choices: [
              "500 is right: the snack doesn't exist",
              "It should be a 404 with  No snack with id 99.  Use  .optional().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, …))  so 'no row' is a planned 404, not an accident",
              "Add a snack 99",
            ],
            answer: 1,
            explain: "A 500 means 'the server broke'. A missing snack is not the server's fault: that's Week 7 Thursday's rule, again.",
          },
        },
        {
          task:
            "Patient 7. /api/snacks/abc answers 400:  Method parameter 'id': Failed to convert value of type 'java.lang.String' to required type 'int'.  The student says the app is broken.",
          hint: "Which method would it have called? Did any SQL run?",
          check: {
            question: "Is the app broken?",
            choices: [
              "Yes: any 400 is a bug in the code",
              "No: Spring refuses abc before your method runs, because the id must be an int. It is the guard working, and no SQL is sent",
              "Yes: it should be a 404",
            ],
            answer: 1,
            explain: "A 400 says 'your request was malformed'. Spring did that for free, and it's what protects the ? from a non-number.",
          },
        },
        {
          task:
            "Patient 8. The student's search is  WHERE name LIKE '%?%'  with  .param(name).  The browser says 500. The terminal says  Parameter index out of range (1 > number of parameters, which is 0).",
          hint: "A ? inside quotes is just a question mark character in the text. Where must the % signs go instead?",
          check: {
            question: "Diagnosis?",
            choices: [
              "A ? inside single quotes is ordinary text, not a gap, so SQL has zero gaps for the one .param. Remove the quotes and put the % marks into the VALUE:  LIKE ?  with  .param(\"%\" + name + \"%\")",
              "MySQL doesn't support LIKE",
              "The name is too long",
            ],
            answer: 0,
            explain: "Placeholders only work as a whole value. The % signs belong in Java, glued to the value (which is safe: it is still a value), never glued into the SQL.",
          },
        },
        {
          task:
            "Patient 9. The student wrote  LIKE ?  with  .param(name)  and no % signs. Searching  Kutsinta  finds Kutsinta, but searching  utsin  finds nothing.",
          hint: "LIKE without any % means 'equal to', apart from capital letters. What does the % do?",
          check: {
            question: "Why does utsin find nothing?",
            choices: [
              "Without % marks, LIKE only matches the WHOLE name. % means 'anything, including nothing', so  %utsin%  means 'contains utsin'",
              "The snack was deleted",
              "LIKE can only search numbers",
            ],
            answer: 0,
            explain: "Add the marks in Java:  .param(\"%\" + name + \"%\").  They go at both ends for 'contains', at the end only for 'starts with'.",
          },
        },
        {
          task:
            "Patient 10. A student 'fixed' the sort by writing  ORDER BY ?  with  .param(sort).  Every request answers 200 and the snacks come back in the same old order whatever the customer sends.",
          hint: "A ? is always a VALUE. What would the database do with the value 'price' where a column name belongs?",
          check: {
            question: "Why doesn't it sort?",
            choices: [
              "ORDER BY ? sorts by the text 'price' as if it were a constant, not by the column called price. A ? can fill in a value, never a column name or a keyword. That is why the sort is chosen between two complete fixed SQL strings",
              "The ORDER BY must come before FROM",
              "The browser reorders them back",
            ],
            answer: 0,
            explain: "No error and no effect: a silent bug. Placeholders are for values. For anything structural (the column to sort by) you choose among fixed pieces of SQL of your own, and refuse the rest.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you'd do, then your rule: when a message from a query is strange, what do you do first?",
          hint: "Patients 2, 3, 4 and 5 are all solved by looking at the SQL and the record, one at a time. Which tool shows SQL errors most clearly?",
          input: "Paste your ten notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own question for the ledger",
      intro:
        "Make your canteen answer one more question that you choose. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own, and build it with what today taught. Always write and run the SELECT in queries.sql first. Ideas: (1) GET /api/snacks/cheapest answers the one cheapest snack, with a 404 if the table is empty (ORDER BY price, then .optional()); (2) GET /api/snacks/between?min=5&max=15 lists the snacks priced from min to max, with  @RequestParam int min  and  @RequestParam int max  (both required, so no null to worry about) and ONE query  WHERE price >= ? AND price <= ?  (two .param calls, in order); (3) /api/find answers 404 with  No snack called Kutsintaa  when nothing matches, and the snacks when something does (check list.isEmpty()); (4) GET /api/snacks/starting-with?letter=K lists the snacks whose name starts with that letter (LIKE ? with  .param(letter + \"%\")); (5) GET /api/snacks/priciest answers the most expensive snack, with a 404 if the table is empty; (6) in menu.js, show a line under the search box that says  No snacks match.  when the answer is an empty list; (7) harder: make /api/snacks accept ?name= AND ?sort= together. Today, when both are sent, the name search wins and the sort is ignored. Use four fixed SQL strings (LIKE with price order, LIKE with name order, and the two without LIKE), chosen by if, and still no gluing.",
          hint:
            "Keep every checkpoint passing: don't rename keys or change statuses. Write and run the SQL first. Every value the customer types goes in a ? and a .param: never glue. For idea 7, the structure (which column to sort by) is chosen by YOUR if, from fixed strings; the customer's word only picks which string. For idea 6, an empty list arrives as [] and list.length === 0 is true.",
        },
        {
          task: "Paste what you added: the new Java lines (and which file), the SQL you ran first, how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I opened /api/snacks?minPrice=10&maxPrice=15 and it listed Banana cue, Turon, Gulaman and Kutsinta.'",
          input: "Paste your new lines, the SQL, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-gluer",
    title: "⚔️ Boss battle: The Gluer",
    intro: "The Gluer builds SQL out of whatever customers type. Stop it.",
    boss: { name: "the Gluer", emoji: "🧪" },
    questions: [
      {
        prompt: "In  jdbc.sql(\"… WHERE snack_id = ?\").param(id),  what does .param(id) do?",
        choices: ["Fills the ? with the value, separately from the SQL text", "Appends id to the SQL string", "Prints the id"],
        answer: 0,
        explain: "The SQL text is fixed. The value travels on its own and can never be read as SQL.",
      },
      {
        prompt: "A query has two ? marks and two .param calls. In what order are they filled?",
        choices: ["Alphabetical by value", "Whatever order Java likes", "The first .param fills the first ?, the second fills the second"],
        answer: 2,
        explain: "Position decides. Swap the two and nothing complains: wrong data goes into the wrong place.",
      },
      {
        prompt: "getSnack's query finds no row. With .optional().orElseThrow(…) what does the customer get?",
        choices: ["500", "404 with 'No snack with id 99'", "200 with an empty snack"],
        answer: 1,
        explain: "A planned 404, with Week 7's message.",
      },
      {
        prompt: "/api/snacks?maxPrice=0 matches no snack. What status?",
        choices: ["404", "200 with []", "500"],
        answer: 1,
        explain: "An empty list is a correct list.",
      },
      {
        prompt: "/api/snacks/abc answers 400. Who refused it?",
        choices: ["MySQL", "The browser", "Spring, before getSnack ran, because abc isn't an int"],
        answer: 2,
        explain: "No SQL was sent.",
      },
      {
        prompt: "WHERE name = '\" + name + \"'  and the customer types  zzz' OR '1'='1.  What happens?",
        choices: [
          "Nothing: no snack is called zzz",
          "The WHERE becomes always true and every snack comes back",
          "Spring refuses it",
        ],
        answer: 1,
        explain: "The text became part of the SQL. Week 4's injection, on the web.",
      },
      {
        prompt: "Even a harmless customer types  Aling's.  On the glued query, what does the app answer?",
        choices: ["[]", "A 500 with a syntax error: the apostrophe ends the quotes early", "200 with Aling's snack"],
        answer: 1,
        explain: "Glued SQL breaks on an honest apostrophe. With ? it simply finds nothing.",
      },
      {
        prompt: "A search uses  WHERE name LIKE ?.  Which value do you pass so it finds every snack that CONTAINS what the customer typed?",
        choices: ["The word as typed", "name + \"?\"", "\"%\" + name + \"%\", built in Java"],
        answer: 2,
        explain: "% means 'anything, including nothing'. Adding it in Java is safe because the whole text is still a value that travels separately.",
      },
      {
        prompt: "Why can ORDER BY not take a ? placeholder?",
        choices: [
          "ORDER BY is too slow",
          "It can, with .param(name)",
          "A ? stands for a VALUE. The column to sort by is part of the SQL's structure, so it must be written in the SQL itself",
        ],
        answer: 2,
        explain: "ORDER BY ? runs without an error and sorts by nothing useful: a silent bug.",
      },
      {
        prompt: "The customer sends ?sort=price%3B DROP TABLE snacks. Your whitelist has two branches, price and name, and a refusal for anything else. What happens?",
        choices: [
          "The table is dropped",
          "400  sort must be price or name: the text is only compared with your two words, it never reaches the SQL",
          "500 with a SQL syntax error",
        ],
        answer: 1,
        explain: "A whitelist uses the customer's word only to PICK one of your own strings. Everything outside the list is refused before any SQL runs.",
      },
      {
        prompt: "The browser says  bad SQL grammar [SELECT …].  Where is the real cause?",
        choices: [
          "In the terminal, on the line after 'with root cause'",
          "In the address bar",
          "In the Network tab's Preview",
        ],
        answer: 0,
        explain: "The browser gets a short message on purpose.",
      },
      {
        prompt: "ORDER BY can't take a ?. How do you let a customer choose between two sort orders safely?",
        choices: [
          "Glue the word they send into the SQL",
          "Choose between two complete fixed SQL strings with an if",
          "You can't",
        ],
        answer: 1,
        explain: "Their text picks WHICH of your own strings runs; it never becomes part of one.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what is a ? in a SQL string for, and what does .param(…) do?",
      "What 'no row found' becomes in your app, and why it isn't a 500.",
      "How the search box now works (which address the page asks), and why ORDER BY needs a whitelist while WHERE needs a ?.",
      "What happened when you ran the attack address on the glued version, and why the ? version is different.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "The snacks now live in one place: your ledger, with a search and a safe sort. Tomorrow the orders follow: POST /api/orders writes a row into your sales table, and restarting the app won't lose it.",
  },
};
