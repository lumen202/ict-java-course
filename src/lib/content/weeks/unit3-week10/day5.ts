// unit3-week10 · Day 5 (no video) — No data left typed in: the audit, canteen_info, the hand-in
//
// "A site that runs entirely on your API": every fact a page shows comes from the ledger through the
// API. Friday's audit hunts for data typed in by hand. Two are found in the code the course wrote:
// GET /api/info returns a CanteenInfo typed into Java (Week 7), and index.html's opening hours are a
// typed <pre> (Week 5). Part 1 moves the first into a table, canteen_info, read through a fourth
// repository (InfoRepository); Part 2 puts the hours on the home page through api.js. Then the self-audit
// and a hand-in that can't be copied from Week 9: a snack named after the student goes add → order →
// take off (menu, refused order, board and dashboard still showing it) → put back, with the dashboard
// as the screenshot. Observed on a real build (2026-11-18):
//  - InfoRepository + the new info() against a ledger with NO canteen_info table: GET /api/info → 500
//    "PreparedStatementCallback; bad SQL grammar [SELECT name, opens, closes FROM canteen_info ORDER BY
//    info_id LIMIT 1]"; with the table created and empty → 404 "No canteen info"; with the row →
//    {"name":"Aling Nena's Canteen","opens":"7:00","closes":"16:00"};
//  - UPDATE canteen_info SET closes = '16:30' while the app is running → the next GET /api/info says
//    16:30, no restart; the page shows it after a reload;
//  - index.html's hours line reads "Aling Nena's Canteen: open 7:00 to 16:00" from /api/info.

import type { DayPlan } from "../../types";
import { day5Part2 } from "./day5-part2";
import { EX, PREV } from "./captured";
import { HANDIN_COMMAND, INFO_STATUS_COMMAND } from "./commands";
import { mc, mission, paste, bq } from "./helpers";
import {
  CONTROLLER_D5,
  D4_FINAL_CONSTRUCTOR,
  D5_FINAL_CONSTRUCTOR,
  INFO_METHOD_NEW,
  INFO_METHOD_OLD,
  INFO_REPOSITORY,
  SQL_CANTEEN_INFO_BACK,
  SQL_CANTEEN_INFO_CREATE,
  SQL_CANTEEN_INFO_EMPTY,
  SQL_CANTEEN_INFO_INSERT,
  SQL_CANTEEN_INFO_LATE,
  SQL_CANTEEN_INFO_SELECT,
} from "./snippets";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "No data left typed in: an audit, one more table behind the API, and a snack that goes through the whole week",
  warmupGame: {
    kind: "quest",
    id: "warmup-typed-in",
    title: "🔎 Warm-up: what is still typed in by hand?",
    intro: "This week the pages stopped knowing things the app knows. Today you look for the facts that are still typed in.",
    missions: [
      mission(
        "Open the Aling Nena's Canteen home page and look at what it says: the name, the opening hours, today's special. One of those has come from the ledger since Week 8.",
        "Week 8, Friday: the special.",
        mc(
          "Which part of the home page already comes from the ledger?",
          "Today's special, through GET /api/special",
          ["The opening hours", "The heading"],
          "The special moved in Week 8. The opening hours are still text somebody typed into index.html in Week 5.",
        ),
      ),
      mission(
        "Open SnackController.java and find  info().  It returns the canteen's name and hours. Where do those words live?",
        "Look at the line that says  return new CanteenInfo(…).",
        mc(
          "Where does GET /api/info get its answer?",
          "From a line of Java that has the name and hours typed into it",
          ["From MySQL", "From a file"],
          "Week 7 typed it in 'because not everything has to come from MySQL'. Today it does.",
        ),
      ),
      mission(
        "Typed-in data has one cost: a change means editing code, restarting the app, and hoping every page agrees. Data in the ledger changes with one UPDATE and every page that asks sees it.",
        "What would it take to make the canteen close at 16:30 today?",
        mc(
          "Which is cheaper when the hours change?",
          "An UPDATE on a table the app reads: no code, no restart",
          ["Editing Java and restarting", "Editing every page"],
          "You will see it with your own eyes: the answer changes while the app keeps running.",
        ),
      ),
    ],
  },
  videos: [],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: the audit, then canteen_info",
      intro:
        "First you search for what is typed in. Then you move the one you found in Java into a table and read it through a fourth repository. Restart after every change to a .java file.",
      missions: [
        mission(
          "The audit, by search. In VS Code press Ctrl+Shift+F and search the whole project for each of these, one at a time: Aling Nena, 7:00, 16:00, and the symbol ₱. For each hit write: which file, what is typed in, and whether the ledger already knows it. Some hits are fine (a page title is text, not data). You are looking for FACTS that could change: a price, an hour, a name that is also in a table.",
          "Expect: SnackController.java (info() with the name and hours typed in), index.html (the opening hours in a <pre>), and ₱ in the page scripts, where it is only the currency sign in front of a number that came from the app. Those are fine.",
          mc(
            "Which kinds of hits are NOT a problem?",
            "Text around data (a heading, a ₱ sign in front of a price from the app) and words that are always true",
            ["Any typed number", "Everything with a ₱"],
            "A typed fact that could change belongs in the ledger. A label doesn't.",
          ),
        ),
        mission(
          "The Java first. Before you create the table, write the repository and use it, so you can watch the app complain. Create InfoRepository.java next to the other repositories, your package line first:\n\n" +
            INFO_REPOSITORY +
            "\n\nIn SnackController.java make two changes. Add the fourth repository to the fields and the constructor, so they read:\n\n" +
            D4_FINAL_CONSTRUCTOR +
            "\n\nbecome\n\n" +
            D5_FINAL_CONSTRUCTOR +
            "\n\nand replace info():\n\n" +
            INFO_METHOD_OLD +
            "\n\nwith\n\n" +
            INFO_METHOD_NEW +
            "\n\nRestart. Open localhost:8080/api/info and write what it answers. (The table doesn't exist yet.)",
          "A 500 whose message starts  PreparedStatementCallback; bad SQL grammar [SELECT name, opens, closes FROM canteen_info …]:  the app printed the statement MySQL refused, because the table isn't there. The app started fine: the repository is only asked when someone asks.",
          mc(
            "Why did the app start but the request fail?",
            "Nothing runs the SQL until a request needs it; MySQL only complains when the statement is sent",
            ["MySQL is stopped", "The controller is missing"],
            "Repositories are created at startup; their statements run when called.",
          ),
        ),
        mission(
          "The table. In queries.sql run the first statement alone and look at the app BEFORE you run the second:\n\n" +
            SQL_CANTEEN_INFO_CREATE +
            "\n\nReload localhost:8080/api/info and write what it answers now. Then:\n\n" +
            SQL_CANTEEN_INFO_INSERT +
            "\n\n" +
            SQL_CANTEEN_INFO_SELECT +
            "\n\nReload again. Don't restart the app at any point.",
          "With an empty table: 404 and No canteen info (the controller's orElseThrow). With the row: the same JSON as last week, {\"name\":\"Aling Nena's Canteen\",\"opens\":\"7:00\",\"closes\":\"16:00\"}.",
          mc(
            "Why is an empty canteen_info a 404 and not an empty object?",
            "'No such thing' is a 404, as for a missing snack; an empty answer would look like a canteen with no name",
            ["404 is the default", "The table is broken"],
            "The same decision as every GET by number: missing means 404 with a sentence.",
          ),
        ),
        mission(
          "Change the data, not the code. Run the first statement, reload localhost:8080/api/info, then put it back with the second:\n\n" +
            SQL_CANTEEN_INFO_LATE +
            "\n\n" +
            SQL_CANTEEN_INFO_BACK +
            "\n\nWrite what closes said in between, and whether you restarted the app.",
          "It said 16:30 with no restart: the repository runs its SELECT on every request.",
          mc(
            "Why did the answer change without a restart?",
            "The SELECT runs on every request, so it reads whatever the table holds now",
            ["Spring noticed the change", "The browser guessed"],
            "That is what 'comes from the ledger' means.",
          ),
        ),
        mission(
          "One thing NOT to do. A student, afraid of the 404, writes the last line of info() as  .orElse(new CanteenInfo(\"Aling Nena's Canteen\", \"7:00\", \"16:00\"))  instead of  .orElseThrow(…).  Think it through and write in notes.md what the app would do with an empty table, and what that has to do with today's audit.",
          "It would answer 200 with the typed hours: the typed data is back, hiding behind the table, and nothing would ever tell anybody the table was empty.",
          mc(
            "Why is  .orElse(new CanteenInfo(…))  the wrong fix?",
            "It puts the typed data back as a silent fallback: an empty table would answer 200 with hours nobody stored",
            ["orElse isn't allowed in Spring", "It's slower"],
            "A fallback that hides a missing row is hard-coded data in disguise. Let the 404 tell the truth.",
          ),
        ),
        mission(
          "Compare. After Part 1 your SnackController.java and InfoRepository.java should look like this (line 1 of each is your own package line; blank lines and method order don't matter):\n\n" +
            CONTROLLER_D5 +
            "\n\n// ---- InfoRepository.java ----\n\n" +
            INFO_REPOSITORY,
          "Common differences: the constructor missing the fourth parameter; info() still returning new CanteenInfo(…); the table's column names not matching the record (name, opens, closes).",
        ),
        paste(
          "Write Part 1 into notes.md: what the audit found (file, what, and whether it is a fact or a label), what the app said at each of the three states of canteen_info (no table, empty table, one row), and what stayed the same for everybody who calls /api/info.",
          "In your own words.",
          "Paste Part 1 of notes.md",
        ),
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-canteen-info",
      title: "🧪 Part 1 · Checkpoint: the hours come from the table",
      intro:
        "Each task has you change canteen_info in SQLTools first, then run one line in the console of a page of YOUR app (localhost:8080). Last week's app typed the hours into Java, so it answers 16:00 and 200 whatever the table says. Put the table back as the task says.",
      tasks: [
        {
          goal:
            "In queries.sql run  " +
            SQL_CANTEEN_INFO_LATE +
            "  Then on any localhost:8080 page, press F12 → Console, and run this line. Paste what it copies. Afterwards run  " +
            SQL_CANTEEN_INFO_BACK,
          command: INFO_STATUS_COMMAND,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "status", equals: 200, message: "GET /api/info should answer 200 while the row exists." },
            { path: "closes", equals: "16:30", message: "closes should be 16:30, the value you put in the table. If it says 16:00, info() is still returning the typed-in CanteenInfo, or the UPDATE didn't run." },
            { path: "opens", equals: "7:00", message: "opens should be 7:00 (the INSERT's value)." },
          ],
          hint: "info() must call infos.find() and not build a CanteenInfo itself.",
          solution: INFO_METHOD_NEW,
          example: EX.d5Late,
          previousStage: PREV.d5Late,
          explain: "The hours moved from a line of Java into a row you can UPDATE.",
        },
        {
          goal:
            "In queries.sql run  " +
            SQL_CANTEEN_INFO_EMPTY +
            "  Then run this line in the console of a localhost:8080 page and paste what it copies. Afterwards put the row back with  " +
            SQL_CANTEEN_INFO_INSERT,
          command: INFO_STATUS_COMMAND,
          checks: [
            { is: "object", message: "This should be one small object starting with {." },
            { path: "status", equals: 404, message: "With canteen_info empty, GET /api/info should answer 404. A 200 means the hours are still typed into Java (or an orElse hides the empty table)." },
            { path: "message", equals: "No canteen info", message: "The message should be exactly  No canteen info." },
          ],
          hint: "info(): return infos.find().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, \"No canteen info\"));",
          solution: INFO_METHOD_NEW,
          example: EX.d5Empty,
          previousStage: PREV.d5Empty,
          explain: "An empty table is a 404 with a sentence: the app tells the truth about what the ledger holds.",
        },
      ],
    },
    ...day5Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five students, five hours",
      intro: "Each patient is a real failure of this kind of lab. The first two were observed on a real build.",
      missions: [
        mission(
          "Patient 1. A student wrote InfoRepository and info() but has not created the table yet. GET /api/info answers 500 with  PreparedStatementCallback; bad SQL grammar [SELECT name, opens, closes FROM canteen_info ORDER BY info_id LIMIT 1].",
          "What is inside the brackets, and which table does it name?",
          mc(
            "What is missing?",
            "The table canteen_info: the SQL in the brackets is the statement MySQL refused, because there is nothing by that name",
            ["A restart of the app", "The record's name"],
            "The app prints the refused statement. Read it first.",
          ),
        ),
        mission(
          "Patient 2. The table exists but a helper ran  DELETE FROM canteen_info;  to 'tidy up'. GET /api/info answers 404 with No canteen info.",
          "What does an empty table mean to info()?",
          mc(
            "What is the fix?",
            "Put the row back with the INSERT; the 404 is the app telling the truth about an empty table",
            ["Change info() to always answer 200", "Restart the app"],
            "A DELETE with no WHERE wiped the table: the same habit as Week 9.",
          ),
        ),
        mission(
          "Patient 3. A student's home page shows no hours line, and the Console says  Uncaught ReferenceError: apiGet is not defined  on index.html.",
          "Which script tags does index.html load, and in what order?",
          mc(
            "What is likely wrong?",
            "index.html doesn't load api.js, or loads it after index.js: the helper must come first",
            ["The ledger is empty", "MySQL is stopped"],
            "The same mistake as Tuesday's clinic: script tags run in order.",
          ),
        ),
        mission(
          "Patient 4. A student fixed the audit with  .orElse(new CanteenInfo(\"Aling Nena's Canteen\", \"7:00\", \"16:00\")).  The empty-table checkpoint fails: it expects a 404.",
          "What would the app answer with an empty table now?",
          mc(
            "Why is this still 'typed-in data'?",
            "The hours are back in Java as a silent fallback; an empty table would answer 200 with hours that nobody stored",
            ["It isn't: orElse is fine", "It's slower than before"],
            "A fallback hides the problem the 404 was there to show.",
          ),
        ),
        mission(
          "Patient 5. A student changed closes with an UPDATE and reloaded nothing: the home page still shows the old time. The API answers the new one.",
          "When does the page ask the app for the hours?",
          mc(
            "What do they do?",
            "Reload the page: the page asked when it opened, and shows what it last fetched; the app already has the new value",
            ["Restart the app", "Run the UPDATE again"],
            "The last time this week: a page shows what it last fetched.",
          ),
        ),
        paste(
          "Write your discharge notes: one line per patient with the first thing you would check, and then one line that starts: 'When data is missing, I want the app to …'.",
          "Patient 4 gives you the line.",
          "Paste your five notes and your rule",
        ),
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own audit",
      intro: "Find one more typed-in fact and move it, or make the audit sharper. Do at least one idea; if you have time, do more.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Keep every checkpoint passing. Ideas: (1) Saturday's hours (the second line of the <pre>) can't come from canteen_info as it is: write in notes.md what columns the table would need, and what you would change in InfoRepository; (2) the order page's maximum quantity, 20, is typed into the page's number box AND into the Java check: write down both places and say where the truth should live; (3) find ONE more hit from today's search that you did not move and decide, in notes.md, whether it is a fact or a label; (4) add a second row to canteen_info (a branch) and make the repository answer the first one on purpose, with a comment saying why; (5) harder: an endpoint PUT /api/info that changes the closing time with a body {closes}, with the same count-and-404 pattern as Monday, and a note on who should be allowed to call it.",
          hint: "Ideas 1 to 3 are thinking: write them in notes.md. For 5, copy setAvailable's shape; the SQL is the UPDATE you ran by hand today.",
        },
        paste(
          "Paste what you found or added: the new lines (and which file), how you tested it, and what it did.",
          "How you tested it can be one sentence.",
          "Paste your findings or new lines, how you tested, and what it did",
        ),
      ],
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own app",
      steps: [
        "Run your app, open each page and address at localhost:8080, and mark each line ✅ or ❌ honestly, by doing it, not from memory. Things that change data use a snack of your own, and you remove them afterwards. The lines are in order of the week, Part 1 then Part 2 of each day.",
        "Monday, Part 1. The snacks table has an available column (BOOLEAN NOT NULL DEFAULT TRUE). Every address that builds the menu hides a retired snack: /api/snacks, ?name, ?sort=price, ?sort=name, ?maxPrice and /api/find. /api/snacks/{id} still finds it. PUT /api/snacks/{id}/available answers 200, and 404 'No snack with id 99999'.",
        "Monday, Part 1. An order for a retired snack answers 409 'Snack N is not available' and writes no sale; old orders and sales of a retired snack still show it; the special of a retired snack is no longer shown (the answer is 404 'No special today' unless an older special of a snack on the menu takes its place).",
        "Monday, Part 2. edit-snack.html has a button whose label is Take off the menu for a snack on the menu and Put back on the menu for a retired one, and the button changes the menu.",
        "Tuesday, Part 1. api.js resolves with the data, resolves with null for a 204 (decided by status, never by reading JSON), and rejects with an Error whose message is the app's sentence for any answer that isn't ok, and for an app that can't be reached.",
        "Tuesday, Parts 1 and 2. edit-snack.js, special.js, orders.js, add-snack.js and order.js contain no  fetch(,  and each of their pages loads api.js first. They behave exactly as before.",
        "Wednesday, Part 1. GET /api/staff/snacks lists every snack, including retired ones, each with an available flag; the menu's snacks still have only snack_id, name and price.",
        "Wednesday, Part 2. staff.html lists every snack; Add, Take off / Put back and Remove work; every write redraws the table; Remove on Kutsinta says Sorry: Snack 90 is used by a sale or a special; no public page links to staff.html.",
        "Thursday, Part 1. The controller holds no SQL: a project search for jdbc.sql finds it only in the repository files. Every checkpoint of Weeks 9 and 10 passes as before.",
        "Thursday, Part 2. The staff page shows N orders · ₱X in sales from /api/summary, and Refresh updates it.",
        "Friday, Part 1. canteen_info holds the name and hours; GET /api/info reads it; an UPDATE changes the answer with no restart; an empty table answers 404 'No canteen info'.",
        "Friday, Part 2. index.html shows the hours line from /api/info through api.js, and no typed weekday hours are left in it (I decided what to do about Saturday and wrote it in notes.md).",
        "Everything from Weeks 5 to 9 still works: menu.html, order.html (it lists only snacks on the menu), orders.html, ledger.html, add-snack.html, tables.html, special.html, index.html, and every GET, POST, PUT and DELETE you built.",
        "No UPDATE or DELETE in my Java or in my SQLTools history has a missing WHERE, and I can say for each of my tables how 'not here' is told: a flag, a 404, or a 409.",
        "My ledger has no leftovers: no snack named Check…, no practice snacks (8000, 8200, 8300), every snack I took off the menu for a test is back on it (except my own hand-in snack), and Kutsinta is on the menu at price 10.",
        "My notes.md has Monday's story of the first filter, Tuesday's two mistakes of api.js, Wednesday's reason for a second record, Thursday's before-and-after list, and today's audit.",
        "For every ❌: fix it now. Everything you need is in this week's days, and the day is yours.",
      ],
      tip: "Not sure how to fix a ❌? Go back to the day it came from: the flag, the six SELECTs, the 409 and the button → Monday. api.js and the refactored pages → Tuesday. The staff list and staff.html → Wednesday. The repositories and the summary → Thursday. canteen_info and the home page → today. Each day's checkpoint still works: paste your answers in again and it tells you the first thing that's wrong.",
      submit: "Paste the list with your ✅/❌ marks (never any part of application.properties), and for each ❌ you fixed, one line on what was wrong",
    },
    {
      kind: "upload",
      id: "screenshot-whole-week",
      title: "📸 Hand in: a snack that went through the whole week",
      intro: "Proof that every part of your site works together, on a snack that exists only in your ledger and has your name on it.",
      steps: [
        "Choose a snack number nobody has used: 500 plus the day of the month you were born (for example 517). Open localhost:8080/staff.html and add a snack named YOUR FIRST NAME with that number and price 12, through the Add form. If it says Sorry: Snack … already exists, add 100 to your number and try again.",
        "On localhost:8080/order.html order YOUR snack, quantity 1. Open localhost:8080/orders.html and find your order's row.",
        "On the staff page press Take off the menu on YOUR row (its On the menu column says No). Open localhost:8080/menu.html: your snack isn't there. Open the order page: it isn't in the drop-down. Open orders.html: your old order is still there.",
        "Open the console on localhost:8080/staff.html (F12 → Console), paste this line, replace YOUR_NUMBER with your number, and press Enter. It tries to order your retired snack, checks that the board and the dashboard still show it, puts it back on the menu, and copies a result. Write the result in your notes:\n\n" +
          HANDIN_COMMAND("YOUR_NUMBER"),
        "Reload the staff page: your row says Yes again. Close the application.properties tab in VS Code (it holds your password) and don't open it before the screenshot.",
        "Arrange the browser with the staff page open on your row (your number and name visible, and Yes in the On the menu column) and, if you can, the console with the line's answer ( new_order_refused_status 409, board_still_shows_old_order true, back_on_menu true ) next to it.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots, and upload it below. Afterwards press Take off the menu on your row once more: your snack is history in the ledger, and it doesn't belong on the canteen's menu.",
      ],
      proves: "that your own pages and API added a snack, sold it, took it off the menu without erasing it, refused a new order for it with your Java's 409, kept the old order on the board, and put it back: the whole week on a number that only you chose.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week10",
    title: "⚔️ Boss battle: The Typed-In Fact",
    intro: "The Typed-In Fact hides in Java and in pages, and goes stale. Find it and move it.",
    boss: { name: "the Typed-In Fact", emoji: "📝" },
    questions: [
      bq("Which of these is a fact that belongs in the ledger?", "The canteen's closing time", ["The word Menu on a heading", "A ₱ sign in front of a price"], "A thing that can change belongs where one UPDATE changes it everywhere."),
      bq("Why does GET /api/info answer 500 when the table doesn't exist yet?", "MySQL refuses the statement, and the app prints it: bad SQL grammar", ["The controller is missing", "Spring is out of date"], "Observed. Read the statement inside the brackets."),
      bq("With canteen_info empty, GET /api/info answers:", "404 with the sentence No canteen info", ["200 with typed hours", "200 with an empty object"], "Missing means 404, as for a missing snack."),
      bq("You UPDATE closes in SQLTools while the app runs. What does the next GET /api/info say?", "The new time: the SELECT runs on every request", ["The old time until a restart", "An error"], "Observed: 16:30 with no restart."),
      bq("Why is  .orElse(new CanteenInfo(…))  wrong?", "It brings the typed data back as a silent fallback for an empty table", ["orElse doesn't exist", "It's slower"], "A fallback that hides a missing row is hard-coded data in disguise."),
      bq("Where must api.js sit among the script tags of index.html?", "Before index.js", ["After index.js", "It doesn't matter"], "Tags run in order."),
      bq("A page shows the old hours after an UPDATE. What do you do?", "Reload the page: it shows what it last fetched", ["Restart the app", "Re-run the UPDATE"], "The page asked when it opened."),
      bq("A snack with sales is taken off the menu. Which still shows it?", "/api/orders, /api/sales and the staff list", ["/api/snacks", "The order page's drop-down"], "The menu is filtered; history and staff aren't."),
      bq("An order for a retired snack:", "409 Snack N is not available, and no sale is written", ["201", "404"], "The snack exists; it conflicts with its state."),
      bq("Why does every page that writes ask for the list again afterwards?", "A page shows what it last fetched; after a write the truth has to be asked for", ["To restart the app", "Because Spring requires it"], "The rule of Weeks 9 and 10."),
      bq("Which of these proves the controller holds no SQL?", "A project search for jdbc.sql that finds it only in repository files", ["The app starts", "The battery passes"], "Only the code can show where the SQL is."),
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what is a soft delete, what is api.js for, what does a repository hold, and what is canteen_info for? One sentence each.",
      "Which typed-in facts did your audit find, which did you move, and which did you leave (and why)?",
      "What did GET /api/info answer with no table, an empty table, and one row, and why is the middle one a 404?",
      "Which of this week's five fixes mattered most for the canteen, and why?",
      "What would you build next on this site?",
      "What surprised you or broke this week, and why it happened.",
      "One question you still have.",
    ],
    note: "Your canteen can now take a snack off its menu without losing a day of history, its pages share one helper, its dashboard runs the whole ledger, its SQL has a home, and nothing a page shows is typed into it. Next week the checks you wrote by hand in every method get a better place to live.",
  },
};
