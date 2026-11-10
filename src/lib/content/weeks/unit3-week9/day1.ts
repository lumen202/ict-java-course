// unit3-week9 · Day 1 — Change a snack: UPDATE, PUT, and the rows-affected count
//
// PUT /api/snacks/{id} takes {name, price}, runs UPDATE snacks SET name = ?, price = ?
// WHERE snack_id = ?, and answers 200 with the snack as it now is. The check order
// is the same as POST /api/snacks (400s first), then the UPDATE, then the 404.
// The lab builds it twice on purpose: the first version never looks at what
// .update() returns and answers 200 for a snack that doesn't exist; the second adds
// `if (changed == 0)` → 404. That count is the idea of the whole week.
// Observed on a real Spring Boot 4.1.1 + MySQL 8.0 build (2026-11-03):
//  - first version: PUT /api/snacks/99999 → 200 {"snack_id":99999,"name":"Ghost","price":5}
//    and nothing is in the table;
//  - fixed version: 404 "No snack with id 99999"; blank name → 400 "name must not
//    be blank"; price 1001 → 400 "price must be from 1 to 1000"; missing price key →
//    400 "…Cannot map `null` into type `int`…"; text/plain body → 415 "Content-Type
//    'text/plain;charset=UTF-8' is not supported."; PUT without a body → 400 "Required
//    request body is missing …"; /api/snacks/null → 400 "Method parameter 'id': Failed to
//    convert value of type 'java.lang.String' to required type 'int' …";
//  - a PUT with the SAME name and price still counts 1 row through JdbcClient (Connector/J
//    counts rows MATCHED), so it is a 200, not a 404; the mysql command-line client says
//    "0 rows affected, Rows matched: 1 Changed: 0" for the same statement;
//  - a name "  Padded  " is stored with its spaces (the lab doesn't trim).
// Videos (transcripts read with yt-dlp 2026-11-03):
//  - Be Software Engineer, "PUT vs PATCH Explained (Idempotency Too)" (2QwFYMh18fM, 4:43):
//    watch 0:00–1:20 and 2:30–4:43; 1:20–2:30 is PATCH, not used. Slide narration, no database.
//  - Bro Code, "MySQL: How to UPDATE and DELETE data from a TABLE" (OB2leB2iZ6U, 3:31): he
//    shows UPDATE and DELETE with no WHERE on purpose (about 2:00–3:05). Don't type along there.
//  - Gyan Darpan, "JdbcClient UPDATE Query in Spring Boot – Part 106" (zcXFUDYThus, 6:35):
//    watch 2:07–4:10 only (.sql(UPDATE…).update() returns a count); 0:30–2:07 is row locking.

import type { DayPlan } from "../../types";
import { day1Part2 } from "./day1-part2";
import { EX, PREV } from "./captured";
import {
  PUT_SAME_VALUES,
  PUT_SNACK_MISSING,
  PUT_SNACK_ROUNDTRIP,
  consolePut,
} from "./commands";
import {
  CONTROLLER_D1,
  IMPORT_PUT,
  ROWS_CHANGED_FIX,
  SQL_CLEAN_CHECKS,
  SQL_UPDATE_BACK,
  SQL_UPDATE_KUTSINTA,
  UPDATE_SNACK,
  UPDATE_SNACK_A,
} from "./snippets";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Change a snack: UPDATE … WHERE in SQL, PUT through your API, and the count that tells you whether anything changed",
  warmupGame: {
    kind: "quest",
    id: "warmup-update-shape",
    title: "✏️ Warm-up: which row, and what if there isn't one?",
    intro: "Weeks 7 and 8 gave your app GET to read and POST to add. This week it learns to change and to remove. Start with the two questions every change has to answer.",
    missions: [
      {
        task: "A staff member wants to replace snack 90's name and price with new ones. In Week 7 you met the HTTP verbs GET (read) and POST (add). A third verb, PUT, means 'replace what is at this address with what I send'.",
        hint: "The address names the thing (/api/snacks/90) and the verb says what to do to it. GET reads it, POST adds a new one next to it.",
        check: {
          question: "Which request replaces snack 90's name and price?",
          choices: [
            "POST /api/snacks",
            "PUT /api/snacks/90, with the new name and price in the body",
            "GET /api/snacks/90",
          ],
          answer: 1,
          explain: "The snack number is in the address, so the address says WHICH snack; the body carries the new values. POST would add a second snack, and GET only reads.",
        },
      },
      {
        task: "In SQL the same job is  UPDATE snacks SET price = 12 WHERE snack_id = 90;  You wrote UPDATE in Week 2 Day 1 and DELETE in Day 2, and Week 2 repeated one habit about both.",
        hint: "Week 2 Day 1 (UPDATE) and Day 2 (DELETE): what happens to a table if an UPDATE has no WHERE?",
        check: {
          question: "In that statement, which part chooses WHICH row changes?",
          choices: [
            "SET price = 12",
            "UPDATE snacks",
            "WHERE snack_id = 90",
          ],
          answer: 2,
          explain: "Without the WHERE, every row of the table gets the new price. The WHERE is the habit: write it first, check it, then run the statement.",
        },
      },
      {
        task: "A request arrives for  PUT /api/snacks/99999,  and no snack has that number. The UPDATE runs, matches no row, and changes nothing. MySQL does not call that an error: it just reports that zero rows were affected.",
        hint: "Week 7 Day 2: what did GET /api/snacks/99999 answer, and why?",
        check: {
          question: "What should your app answer to the customer?",
          choices: [
            "200 OK, because the UPDATE ran without an error",
            "404 Not Found, because nothing with that number exists, so nothing was changed",
            "500, because the UPDATE did nothing",
          ],
          answer: 1,
          explain: "A statement that runs without an error is not the same as a statement that did something. The count of rows it changed is how your app tells the difference. That count is what today is about.",
        },
      },
    ],
  },
  videos: [
    {
      title: "PUT vs PATCH explained, with idempotency (Be Software Engineer)",
      youtubeId: "2QwFYMh18fM",
      length: "4:43",
      practice: {
        intro: "Watch 0:00 to 1:20 and 2:30 to the end. Skip 1:20 to 2:30: that part is PATCH, which this course doesn't use. The video is slides with no database; the idea is what you take from it.",
        steps: [
          "Write in notes.md (a new file in your canteen-web folder, or the one you already keep): what does he say happens to a field the client leaves out of a PUT?",
          "Write: what does 'idempotent' mean in his table, and which of GET, POST, PUT and DELETE does he say are idempotent? Predict what that means for sending the same PUT twice.",
        ],
        note: "He uses a Student class and @PutMapping with @PathVariable and @RequestBody. You will use Snack's cousin, SnackChange, and your snacks table. The answer to the second step matters again on Wednesday: sending the same PUT twice, or the same DELETE twice, leaves the same table (the second DELETE just answers 404).",
      },
    },
    {
      title: "MySQL: How to UPDATE and DELETE data from a table (Bro Code)",
      youtubeId: "OB2leB2iZ6U",
      length: "3:31",
      practice: {
        intro: "Watch it all, but do NOT type along between about 2:00 and 3:05: he runs an UPDATE with no WHERE and a DELETE with no WHERE on purpose, to show what they do, and both are labelled 'don't do this'. He uses a graphical client, not SQLTools. Then, in queries.sql:",
        steps: [
          "Run  SELECT * FROM snacks WHERE snack_id = 90;  and write its row in notes.md. Then run this one statement and SELECT again:\n\n" +
            SQL_UPDATE_KUTSINTA +
            "\n\nWhat changed, and what stayed the same?",
          "Run the statement that puts the price back, and SELECT again to see it is back:\n\n" + SQL_UPDATE_BACK,
          "Write in notes.md, in one sentence, what he showed would have happened if the WHERE had been left out of the first statement.",
        ],
        note: "Kutsinta (snack 90) is your test snack from Week 8. Never try the no-WHERE examples on snacks or sales: Day 3 shows them on a copy of the table.",
      },
    },
    {
      title: "JdbcClient UPDATE query in Spring Boot, part 106 (Gyan Darpan)",
      youtubeId: "zcXFUDYThus",
      length: "6:35",
      practice: {
        intro: "Watch only 2:07 to 4:10: an UPDATE statement goes into .sql(…), and .update() runs it and hands back a number. Skip 0:30 to 2:07 (row locking inside a transaction) and everything after 4:30 (Postman).",
        steps: [
          "Write down in notes.md: what is the number .update() returns, in his words?",
          "He uses names like :employeeId for the values. You use ? marks and .param(…) in order, exactly as in Week 8.",
        ],
        note: "He never checks whether the number is 0. Your app will, and that decision is the whole lab.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: PUT /api/snacks/{id}",
      intro:
        "You will add one endpoint, build it the quick way first, watch it tell a lie, and then fix it with the row count. Restart after every change to a .java file. The checks from POST /api/snacks (blank name, long name, price outside 1 to 1000) come along.",
      missions: [
        {
          task:
            "Prepare. (1) Under the other import lines of SnackController.java add:\n\n" +
            IMPORT_PUT +
            "\n\n(2) Inside the class, as the very last thing, just above the final closing brace, type the record and the method below. The record is the shape of the body: a name and a price, with no snack number, because the number is in the address. The checks are the same three as addSnack's; the new part is the UPDATE:\n\n" +
            UPDATE_SNACK_A +
            "\n\nRead the SQL out loud: UPDATE snacks, SET the name and the price, WHERE the snack_id is this one. The three .param calls fill the three ? marks in order: name, price, then the snack number from the address. The method returns the snack as it now is. Restart the app.",
          hint:
            "Red under PutMapping means the import line is missing. A red SnackChange means the record sits outside the class: it belongs inside, above the method. Never click Continue on 'Build failed'; fix the red errors first.",
          check: {
            question: "Why is the snack number the LAST .param, when the snack_id comes first in the table?",
            choices: [
              "Because the ? marks are filled in the order they appear in the SQL: name, price, and then the WHERE's snack_id",
              "Because numbers always go last",
              "Because MySQL sorts them",
            ],
            answer: 0,
            explain: "Same rule as Week 8's INSERT: .param fills the marks left to right. Swap two and an int column may accept the wrong value without a word.",
          },
        },
        {
          task:
            "Test it from the console. Open localhost:8080/menu.html, press F12 → Console, and run these lines one at a time (Enter after each; if Chrome warns about pasting, type  allow pasting  and press Enter first). Each prints the status and then the answer. Write what each answered in notes.md.\n\nchange Kutsinta's price to 12:\n\n" +
            consolePut('"/api/snacks/90"', '{ name: "Kutsinta", price: 12 }') +
            "\n\nthen read it back:\n\nfetch(\"/api/snacks/90\").then(r => r.text()).then(console.log)",
          hint:
            "The first answer is 200 with {\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":12}. Reading it back shows price 12 too, and so does the menu page after a reload. A 405 means the method isn't there (restart, or @PutMapping is missing). A 415 means the header line was changed.",
          check: {
            question: "The reply to the PUT came from the Java method's return line. Where does the NEW price in the table come from?",
            choices: [
              "From the return line: Java wrote it",
              "From the UPDATE: the table changed, and the reply only repeats what was sent",
              "From the browser, which keeps a copy",
            ],
            answer: 1,
            explain: "The reply is just text built from the request. Only reading the table (the GET, or SELECT in SQLTools) proves the row changed.",
          },
        },
        {
          task:
            "A snack that doesn't exist. PREDICT first and write your prediction in notes.md: what will  PUT /api/snacks/99999  answer with your code as it is now? Then run it:\n\n" +
            consolePut('"/api/snacks/99999"', '{ name: "Ghost", price: 5 }') +
            "\n\nThen in queries.sql run  SELECT * FROM snacks WHERE snack_id = 99999;  and write what the table says.",
          hint:
            "Look at the method: nothing reads what .update() returns, and no exception is thrown when zero rows match. So the method reaches its return line like any other call.",
          check: {
            question: "What happened?",
            choices: [
              "A 404, because Week 7's snacks answer 404",
              "A 500 from MySQL",
              "A 200 with a snack that the table doesn't have: the UPDATE matched no row, and the method never noticed",
            ],
            answer: 2,
            explain: "This is the lie: the customer is told 'saved' for a snack that doesn't exist. Nothing is wrong with the UPDATE; the method simply never asked how many rows it changed.",
          },
        },
        {
          task:
            "Fix it with the count. .update() returns the number of rows the statement matched. In updateSnack, replace the statement (from  jdbc.sql(…  to  .update();  ) so it keeps that number in a variable called changed, and add the test under it, before the return line. The edited middle of the method becomes:\n\n" +
            ROWS_CHANGED_FIX +
            "\n\nThe return line stays as it is. Restart and run the 99999 line again.",
          hint:
            "int changed = in front of jdbc.sql, and the if block after .update();. Compare with your own: the three .param lines are unchanged. After the fix the answer is 404 with the message No snack with id 99999.",
          check: {
            question: "Why does  changed == 0  mean 'no such snack' here?",
            choices: [
              "The WHERE snack_id = ? matched no row, so there was no snack with that number to change",
              "The price was too low",
              "The app has no memory left",
            ],
            answer: 0,
            explain: "The WHERE chose the rows; zero rows chosen means zero changed. The same test turns every later 'did anything happen?' into a status code.",
          },
        },
        {
          task:
            "Test the refusals and one surprise from the console. Write the status and the answer of each in notes.md.\n\na blank name:\n\n" +
            consolePut('"/api/snacks/90"', '{ name: "   ", price: 10 }') +
            "\n\na price of 1001:\n\n" +
            consolePut('"/api/snacks/90"', '{ name: "Kutsinta", price: 1001 }') +
            "\n\nthe surprise: change Kutsinta's name and price to what they ALREADY are. Run first the line that looks them up, then this one:\n\n" +
            PUT_SAME_VALUES,
          hint:
            "The first two are 400 with name must not be blank and price must be from 1 to 1000, from the checks that run before the UPDATE. The last prints {\"status\":200,...}: a PUT that changes nothing still found the row.",
          check: {
            question: "The last line changed nothing at all, yet answered 200 and not 404. Why?",
            choices: [
              "The count means rows MATCHED by the WHERE, and the row matched, so changed is 1 even though no value differed",
              "Because 200 is the default",
              "The app skipped the UPDATE",
            ],
            answer: 0,
            explain: "Through JdbcClient and this driver the count is rows matched. (The mysql command-line client prints 'Rows matched: 1  Changed: 0' for the same statement.) 404 means 'no such row', and the row exists.",
          },
        },
        {
          task:
            "Put Kutsinta's price back to 10 with one line, and check the menu shows 10:\n\n" +
            consolePut('"/api/snacks/90"', '{ name: "Kutsinta", price: 10 }') +
            "\n\nThen compare. After Part 1 your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter):\n\n" +
            CONTROLLER_D1,
          hint:
            "Common differences: the PutMapping import missing; the record outside the class; changed declared inside the if; .param(id) not last; return new Snack(id, …) using change.snack_id(), which doesn't exist (the number is the id variable).",
        },
        {
          task:
            "Write Part 1 into notes.md: the statuses of the console lines in order, what the first (lying) version did and the one line of reasoning that fixed it, and what 'rows matched' means for a PUT that changes nothing.",
          hint: "Write it in your own words. The key sentence starts: 'The UPDATE can't tell me whether the snack exists, but…'.",
          input: "Paste Part 1 of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-put-snack",
      title: "🧪 Part 1 · Checkpoint: a snack that really changes",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080), prints the answer and copies it; paste it here. The first task adds a snack named Check and a number, and renames it; when you have finished the day, remove those with  " +
        SQL_CLEAN_CHECKS +
        "  (nothing points at them). Last week's app answers 405 to every PUT, so it cannot pass any of these.",
      tasks: [
        {
          goal: "Open localhost:8080/menu.html, press F12 → Console, and run this line. It adds a snack, changes its name and price with PUT, then reads the snack back with GET and copies what that answered. Paste it here.",
          command: PUT_SNACK_ROUNDTRIP,
          checks: [
            { is: "object", message: "This should be one small object starting with {. Did you run the line in the Console of a localhost:8080 page?" },
            { path: "put_status", equals: 200, message: "The PUT should answer 200. A 405 means updateSnack isn't registered (restart, and check @PutMapping); a 500 means read the terminal." },
            { path: "name", contains: "Renamed", message: "The snack read back should be called Renamed followed by a number. Did the UPDATE use .param(change.name()) for the name?" },
            { path: "price", equals: 21, message: "The price read back should be 21. Check the order of the .param calls: name, then price, then the snack number." },
            { path: "others_unchanged", equals: true, message: "Another snack on the menu changed too! Check the UPDATE has  WHERE snack_id = ?  and the snack number as its third .param: without the WHERE every snack gets the new name and price. Put your menu right in SQLTools before going on." },
          ],
          hint: "The line adds a snack, PUTs a new name and price (21), and asks MySQL for the snack. If the name or price is still the old one, the UPDATE never ran or ran against the wrong row.",
          solution: UPDATE_SNACK,
          example: EX.d1Roundtrip,
          previousStage: PREV.d1Roundtrip,
          explain: "Written by one endpoint and read back by another: the row really changed in your snacks table.",
        },
        {
          goal: "A snack that doesn't exist. Run this line on a localhost:8080 page and paste what it copies. It also compares the whole menu before and after.",
          command: PUT_SNACK_MISSING,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "status", equals: 404, message: "The status should be 404. If it is 200, the count isn't checked yet: keep .update()'s number in changed and throw when it is 0." },
            { path: "message", equals: "No snack with id 99999", message: "The message should be exactly  No snack with id 99999  with the number in it." },
            { path: "nothing_changed", equals: true, message: "The menu changed although snack 99999 doesn't exist: the UPDATE has no WHERE (or the wrong one), so it changed every snack. Put your menu right in SQLTools, then fix the WHERE." },
          ],
          hint: "int changed = jdbc.sql(…).update();  and then  if (changed == 0) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id); }",
          solution: ROWS_CHANGED_FIX,
          example: EX.d1NotFound,
          previousStage: PREV.d1NotFound,
          explain: "The first version said 200 to this very line. The count is what turned a silent lie into an honest answer.",
        },
        {
          goal: "A blank name. Run this line on a localhost:8080 page and paste what it copies. It targets Kutsinta, so a mistake can't hurt: the check refuses it before the UPDATE.",
          command: consolePut('"/api/snacks/90"', '{ name: "   ", price: 10 }'),
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {." },
            { path: "status", equals: 400, message: "The status should be 400. A 200 means the blank name was saved: the check is missing or comes after the UPDATE." },
            { path: "message", equals: "name must not be blank", message: "The message should be exactly  name must not be blank." },
          ],
          hint: "change.name() == null || change.name().isBlank() must be tested before the UPDATE.",
          solution: UPDATE_SNACK,
          example: EX.d1Blank,
          previousStage: PREV.d1Blank,
          explain: "Refused before anything reached MySQL.",
        },
        {
          goal: "A price that is too high. Run this line on a localhost:8080 page and paste what it copies.",
          command: consolePut('"/api/snacks/90"', '{ name: "Pricey", price: 1001 }'),
          checks: [
            { is: "object", message: "This should be the app's error body, starting with {." },
            { path: "status", equals: 400, message: "The status should be 400. A 200 means a price of 1001 was saved, and Kutsinta is now called Pricey: fix the check, then put the name back from SQLTools." },
            { path: "message", equals: "price must be from 1 to 1000", message: "The message should be exactly  price must be from 1 to 1000." },
          ],
          hint: "The test is  change.price() < 1 || change.price() > 1000,  and it throws a 400 with that message.",
          solution: UPDATE_SNACK,
          example: EX.d1Price,
          previousStage: PREV.d1Price,
          explain: "The database would have stored 1001. Only your own check keeps it out.",
        },
        {
          goal: "A change that changes nothing. Run this line on a localhost:8080 page and paste what it copies. It reads Kutsinta, then PUTs the very same name and price.",
          command: PUT_SAME_VALUES,
          checks: [
            { is: "object", message: "This should be a small object starting with {." },
            { path: "status", equals: 200, message: "The status should be 200: the snack exists, so the PUT is fine even though no value differed. A 404 means your test treats 'no value changed' as 'not found'." },
            { path: "name_back", equals: "Kutsinta", message: "The answer should repeat the name, Kutsinta." },
          ],
          hint: "The count is rows matched by the WHERE. If you get 404 here, check you test  changed == 0  and not something about the values.",
          solution: ROWS_CHANGED_FIX,
          example: EX.d1Same,
          previousStage: PREV.d1Same,
          explain: "Not found and not changed are different things, and the count tells the first one.",
        },
      ],
    },
    ...day1Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five students, five PUTs",
      intro: "Each patient is a real failure from this kind of lab. For each: say what is wrong and what you would change. The first four are about the endpoint; the fifth is a story to learn from and never to run.",
      missions: [
        {
          task: "Patient 1. The console line prints  405 false  and the body says  Method 'PUT' is not supported.  The method is in the file.",
          hint: "A 405 means the address exists but not for that verb. What must the app have done after the last edit, and which annotation names the verb?",
          check: {
            question: "What are the two likeliest causes?",
            choices: [
              "The app wasn't restarted since the edit, or the method has @GetMapping or @PostMapping instead of @PutMapping",
              "MySQL is stopped",
              "The price is too high",
            ],
            answer: 0,
            explain: "The same two causes as every 405 in Week 7 and Week 8: the running app is the old code, or the annotation names another verb.",
          },
        },
        {
          task: "Patient 2. A student types the fetch by hand and forgets the headers part. The answer is  415 Unsupported Media Type, Content-Type 'text/plain;charset=UTF-8' is not supported.",
          hint: "Week 7 Day 3: what does fetch send as the Content-Type when the body is a string and you don't say?",
          check: {
            question: "What is missing from the fetch call?",
            choices: [
              "The headers: { \"Content-Type\": \"application/json\" } part, so the body was sent as plain text",
              "The word PUT",
              "The snack number",
            ],
            answer: 0,
            explain: "@RequestBody only reads JSON. Without the header the browser labels the body text/plain, and Spring refuses it before your method runs.",
          },
        },
        {
          task: "Patient 3. The page sends  {\"name\":\"Kutsinta\"}  and the answer is a 400 starting  JSON parse error: Cannot map `null` into type `int`.  Nothing in the table changed.",
          hint: "SnackChange has two fields. Which one is missing from the JSON, and what type is it?",
          check: {
            question: "Is this an UPDATE problem?",
            choices: [
              "Yes: MySQL refused the NULL price",
              "No: Spring refused before updateSnack ran, because price is an int and the key is missing; no SQL was sent",
              "Yes: the WHERE is wrong",
            ],
            answer: 1,
            explain: "The same refusal as Week 7's missing qty. The first layers protect the database from ever seeing it.",
          },
        },
        {
          task: "Patient 4. The student wrote the three .param calls as  .param(change.price()).param(change.name()).param(id).  The price box got a number, and the app answers 500 with  Incorrect integer value: 'Kutsinta' for column 'price'.",
          hint: "Which ? comes first in the SQL, and which value did .param(…) put there first?",
          check: {
            question: "What is the fix, and why did MySQL notice this time?",
            choices: [
              "Swap the first two .param lines to name, then price; MySQL noticed because a word can't go into an INT column",
              "Delete the third .param",
              "Change price to a String",
            ],
            answer: 0,
            explain: "Week 8's swapped-values lesson again. Here the swap puts text into a number column, so MySQL refuses; two int columns swapped would have been saved silently.",
          },
        },
        {
          task: "Patient 5, a story, never to run. A student wrote the UPDATE as  \"UPDATE snacks SET name = ?, price = ?\"  and kept only the first two .param lines. It compiled. The first PUT from the page answered 200.",
          hint: "What does an UPDATE do when it has no WHERE? Bro Code showed it today.",
          check: {
            question: "What does the snacks table look like afterwards?",
            choices: [
              "Only snack 90 changed",
              "Nothing changed",
              "Every snack has the same name and price: with no WHERE, the UPDATE applies to every row, and the count says how many",
            ],
            answer: 2,
            explain: "The customer got 200 and the whole menu was overwritten. The WHERE is the whole safety. (On a real build this is exactly what happens.)",
          },
        },
        {
          task: "Write your discharge notes: one line per patient with the first thing you would check, and then one line that starts: 'Before I run any UPDATE or DELETE I …'.",
          hint: "Patient 5 gives you the line. Think of what you do with a SELECT first.",
          input: "Paste your five notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own change",
      intro:
        "Make your canteen change one more thing that you choose. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own, and build it with what today taught. Run any SQL in queries.sql first. Ideas: (1) a price-only endpoint,  PUT /api/snacks/{id}/price,  taking  {\"price\": 14}  and updating one column (copy updateSnack and shrink it; mind the 404); (2) in updateSnack, store the name without spaces at either end: change.name().trim() in the UPDATE and in the return line; (3) in edit-snack.js, after a successful save, go to the menu page:  location.href = \"menu.html\";  inside the  if (response.ok)  branch; (4) print each change to the terminal with System.out.println(\"Snack \" + id + \" changed\") after the 404 test; (5) harder: a PATCH endpoint,  @PatchMapping(\"/api/snacks/{id}\"),  that takes a Map<String, Object> and changes only the keys present (name and/or price), refusing anything else with a 400.",
          hint:
            "Keep every checkpoint passing: don't change updateSnack's answers. For ideas 1 and 5, test with a console fetch like today's. For 5, remember the part of the PUT video you skipped (1:20 to 2:30, you may watch it now): a map only holds the keys the client sent, which is why PATCH uses one. Any snack you create while testing can be removed again with SQL (as long as no sale points at it).",
        },
        {
          task: "Paste what you added: the new lines (and which file), how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "How you tested it can be one sentence: 'I sent price 14 to /api/snacks/90/price and read 200 with price 14; snack 99999 gave 404.'",
          input: "Paste your new lines, how you tested, and what it answered",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-silent-update",
    title: "⚔️ Boss battle: The Silent Update",
    intro: "The Silent Update says 'saved' whether it saved or not. Make it tell the truth.",
    boss: { name: "the Silent Update", emoji: "🤫" },
    questions: [
      {
        prompt: "Which SQL clause chooses the rows an UPDATE changes?",
        choices: ["SET", "WHERE", "UPDATE"],
        answer: 1,
        explain: "WHERE picks the rows; SET says what changes in them. Leave WHERE out and every row is picked.",
      },
      {
        prompt: "Why does  PUT /api/snacks/90  carry the snack number in the address and the name and price in the body?",
        choices: [
          "The address says WHICH snack, the body says what it becomes",
          "Because the body can't hold numbers",
          "Because Spring requires it",
        ],
        answer: 0,
        explain: "The address names the thing; the body is the new state of it.",
      },
      {
        prompt: "What does .update() return?",
        choices: ["The new snack", "true or false", "The number of rows the statement matched"],
        answer: 2,
        explain: "A count. Zero is how your app learns that nothing had that number.",
      },
      {
        prompt: "The first version of updateSnack answered 200 for snack 99999. Why?",
        choices: [
          "MySQL accepted the UPDATE and reported no error; nothing in the method looked at the count",
          "Snack 99999 existed",
          "Spring turned the 404 into a 200",
        ],
        answer: 0,
        explain: "No error is not the same as no problem. Only the count says whether a row changed.",
      },
      {
        prompt: "A PUT sets a snack's name and price to the values it already has. What does your finished app answer?",
        choices: [
          "404, because nothing changed",
          "500, because the UPDATE did nothing",
          "200, because the row matched the WHERE",
        ],
        answer: 2,
        explain: "The count is rows matched. Not found and not changed are different, and only the first is a 404.",
      },
      {
        prompt: "Where in updateSnack must the three 400 checks sit?",
        choices: [
          "After the UPDATE, so MySQL checks first",
          "Before the UPDATE, so nothing bad is ever written",
          "Anywhere: the order doesn't matter",
        ],
        answer: 1,
        explain: "Check first, write second. MySQL would happily store a blank name or a price of 1001.",
      },
      {
        prompt: "What does the browser send, as the Content-Type, if a fetch with a string body has no headers part?",
        choices: ["application/json", "Nothing, and Spring guesses", "text/plain, and Spring answers 415"],
        answer: 2,
        explain: "@RequestBody needs application/json, so a missing header means a 415 before your method runs.",
      },
      {
        prompt: "An UPDATE is written without a WHERE and runs through JdbcClient. What does it do to snacks?",
        choices: [
          "Changes every row",
          "Changes the first row",
          "Is refused with an error",
        ],
        answer: 0,
        explain: "Nothing in JDBC stops it. The WHERE is the only protection, and it is your habit.",
      },
      {
        prompt: "Sending the same PUT twice leaves the table the same as sending it once. What is the word for that?",
        choices: ["Atomic", "Idempotent", "Immutable"],
        answer: 1,
        explain: "Idempotent: repeating it changes nothing more. GET, PUT and DELETE are; POST is not (it adds another row each time).",
      },
      {
        prompt: "Two .param calls of an UPDATE are swapped, and both columns are int. What happens?",
        choices: [
          "MySQL refuses, as with text in an INT column",
          "The app restarts",
          "The row is saved with the values in the wrong columns, and nothing complains",
        ],
        answer: 2,
        explain: "That is why you read the table after writing: only the table tells the truth.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what happens, step by step, from pressing Save on edit-snack.html to the new price on the menu. Name every layer.",
      "What did the first version of updateSnack answer for a snack that doesn't exist, why, and what one line fixed it?",
      "What is the number .update() returns, and what does it mean when it is 0?",
      "Why does a PUT that changes nothing still answer 200?",
      "Why must the UPDATE have a WHERE, and what would it have done to your menu without one?",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your menu can now be corrected from a page without opening SQLTools. Tomorrow it's the orders' turn: a quantity can be wrong too, and a sale's price must NOT change when the quantity does.",
  },
};
