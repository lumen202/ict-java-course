// unit3-week10 · Day 2 — One helper for every page: api.js
//
// Every page since Week 7 copies the same ten lines: fetch, then response.json(), then if
// response.ok … else Sorry: …, with `response.status === 204` for the DELETEs. Today they become one
// file, static/api.js, with two functions: apiGet(path) and apiSend(method, path, body). They resolve
// with the parsed JSON, resolve with null for a 204 (decided by STATUS, never by calling .json()), and
// reject with an Error whose message is the app's own sentence for any answer that isn't ok.
// The helper is built twice on purpose: the first version just returns response.json().
// Observed in headless Chrome on a real build (2026-11-18):
//  - first version, DELETE answered 204: the call FAILS with  SyntaxError  "Failed to execute 'json' on
//    'Response': Unexpected end of JSON input"  although the order really was cancelled;
//  - first version, GET /api/snacks/99999: the call RESOLVES with the error body (status 404, message "No
//    snack with id 99999"); a page then writes  "Saved: undefined at ₱undefined"  for a Save on a snack that
//    isn't there;
//  - finished version: DELETE 204 resolves with null; the 404 rejects with an Error whose message is
//    "No snack with id 99999"; the page writes "Sorry: No snack with id 99999";
//  - api.js loaded AFTER the page script: ReferenceError: apiGet is not defined;
//  - a call with no .catch on a refused request: Console shows  Uncaught (in promise) Error: No snack with id 99999;
//  - request() written without its `return`: TypeError: Cannot read properties of undefined (reading 'then');
//  - the app stopped after the page had loaded, then Save: "Sorry: Can't reach the canteen app. Is it running?".
// Video (transcript read with yt-dlp 2026-11-18): Web Dev Simplified, "Learn Fetch API In 6 Minutes"
//  (cuEtnrL9-H0, 6:35): watch 1:51 to 6:21.

import type { DayPlan } from "../../types";
import { day2Part2 } from "./day2-part2";
import { EX, PREV } from "./captured";
import { API_HELPER_COMMAND, EDIT_PAGE_API_COMMAND, SPECIAL_PAGE_API_COMMAND } from "./commands";
import { mc, mission, paste, bq } from "./helpers";
import {
  API_JS,
  API_JS_A,
  API_JS_PUBLIC,
  API_JS_READ,
  API_JS_REQUEST,
  API_TRY_DELETE,
  API_TRY_GOOD,
  API_TRY_MISSING,
  EDIT_SNACK_HTML_D2,
  EDIT_SNACK_JS_AVAILABILITY_API,
  EDIT_SNACK_JS_D2,
  EDIT_SNACK_JS_LOAD_API,
  EDIT_SNACK_JS_REMOVE_API,
  EDIT_SNACK_JS_SAVE_API,
  SPECIAL_HTML_D2,
  SPECIAL_JS_D2,
  SQL_CLEAN_PRACTICE,
  SQL_PRACTICE_SNACK,
} from "./snippets";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "One helper, api.js, instead of ten copied lines on every page, and a refactor that changes nothing you can see",
  warmupGame: {
    kind: "quest",
    id: "warmup-copied-lines",
    title: "📋 Warm-up: the same ten lines, again",
    intro: "Open edit-snack.js, orders.js and special.js side by side. Spot what they repeat before you fix it.",
    missions: [
      mission(
        "Every page that talks to your app does the same four things: fetch, read the answer as JSON, check response.ok, and write either the data or Sorry: and the app's message. DELETE pages do something different, because a 204 has no body.",
        "Look at how edit-snack.js's Remove button and special.js's Remove button treat a 204.",
        mc(
          "What do the pages check for a DELETE that worked, and why not response.ok?",
          "response.status === 204, because a 204 has no body: reading it as JSON would fail even though the delete worked",
          ["response.ok, because ok is true for 204", "response.json(), as for every other answer"],
          "Week 9 Day 3: response.json() on an empty body throws. ok is true for a 204 as well, but then the page would still read JSON that isn't there.",
        ),
      ),
      mission(
        "Each copy of the pattern is a chance to get one detail wrong: forget the Content-Type header, forget .catch, forget the 204. A helper written once and loaded by every page fixes a bug in one place.",
        "How many places must change if the app's error sentence starts coming in a new key?",
        mc(
          "What is the main reason to write the pattern once?",
          "A fix or a change is made in one file, and every page gets it",
          ["Pages load faster", "JavaScript requires functions to be in their own file"],
          "Same idea as Week 8's one SELECT for orders: don't copy what you will have to change.",
        ),
      ),
      mission(
        "A page that uses the helper will not call fetch itself. It will call something like apiGet(path), and get back the data, or an error whose message is the app's sentence.",
        "What does a page do with an error?",
        mc(
          "What should apiGet do when the app answers 404 with a message?",
          "Fail (throw an Error carrying the app's message), so the page's .catch can write Sorry: and the message",
          ["Return the error body as if it were data", "Return null"],
          "A 404 is not data. Returning it as if it were is the first version's mistake, and you will see it write  Saved: undefined  on a page.",
        ),
      ),
    ],
  },
  videos: [
    {
      title: "Learn the Fetch API in 6 minutes (Web Dev Simplified)",
      youtubeId: "cuEtnrL9-H0",
      length: "6:35",
      practice: {
        intro:
          "Watch 1:51 to 6:21: .then chains, res.json(), why fetch still succeeds on a 404 so you must check ok, method, and sending a JSON body with its header. He never builds a helper, and he calls res.json() on every answer: you will fix both today. Skip 0:00 to 1:00 (a practice site that isn't yours).",
        steps: [
          "Write in notes.md: why does he check  ok  before reading the data, and what range of status numbers is ok in his words?",
          "He says 'res.okay' once, at about 3:47. The property is spelled ok. Write which spelling you will use.",
          "Write: his code calls res.json() on every answer. Which of YOUR answers has no body, and what will that do?",
        ],
        note: "He uses a fake third-party API and never throws an Error with the server's message. You will, on every page, from one file.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Part 1 · Real lab: write api.js, then move two pages onto it",
      intro:
        "You will write the helper the quick way first and watch it fail in two ways, fix it, and then move edit-snack.js and special.js onto it without changing anything a person would see. A page file needs only Ctrl+Shift+R. Everything today lives in static/, next to menu.html. Nothing in Java changes.",
      missions: [
        mission(
          "Create api.js (right-click the static folder → New File → api.js). Press Escape to close any suggestion, then type or paste the first version:\n\n" +
            API_JS_A +
            "\n\nThen make edit-snack.html load it BEFORE the page's own script. The last two lines of the body become:\n\n  <script src=\"api.js\"></script>\n  <script src=\"edit-snack.js\"></script>\n\nOpen localhost:8080/edit-snack.html?id=90, press F12 → Console, and run:\n\n" +
            API_TRY_GOOD,
          "It should print  RESOLVED with {\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}.  If the console says apiGet is not defined, the api.js script tag is missing or comes after edit-snack.js.",
          mc(
            "Why must api.js be loaded before the page's own script?",
            "The browser runs script files in the order of the tags, and the page's script calls apiGet at once; it must already exist",
            ["Because file names are sorted alphabetically", "Because api.js is faster"],
            "Order of the tags is order of running. Put the shared file first, always.",
          ),
        ),
        mission(
          "Predict, then run. This line places an order and cancels it through apiSend; a DELETE answers 204:\n\n" +
            API_TRY_DELETE +
            "\n\nAnd this one asks for a snack that doesn't exist:\n\n" +
            API_TRY_MISSING +
            "\n\nWrite in notes.md what each printed, and whether the order in the first line was really cancelled (open localhost:8080/orders.html).",
          "The first prints  FAILED: SyntaxError Failed to execute 'json' on 'Response': Unexpected end of JSON input  although the order is gone from the board. The second prints  RESOLVED with  and the app's 404 body, with the message No snack with id 99999: the helper treated an error as if it were data.",
          mc(
            "What are the two mistakes of the first version?",
            "It reads JSON from a 204 (which has none), and it hands a 404's error body back as if it were data",
            ["It sends the wrong Content-Type", "It forgets the method"],
            "Two different failures: one loud (a SyntaxError) and one silent (the page would write 'Saved: undefined').",
          ),
        ),
        mission(
          "Fix it in three small pieces. Replace the whole contents of api.js with these three, in this order, with an empty line between them. First, one function that reads an answer: a 204 returns null by STATUS (never reading JSON), anything else is read as JSON, and an answer that isn't ok becomes a thrown Error with the app's message:\n\n" +
            API_JS_READ +
            "\n\nSecond, one function that makes the request. If the request cannot even be sent (the app is stopped) it throws an Error with a plain sentence:\n\n" +
            API_JS_REQUEST +
            "\n\nThird, the two functions the pages will call. The body is sent only when there is one:\n\n" +
            API_JS_PUBLIC +
            "\n\nPress Ctrl+Shift+R on the edit page and run the three lines again.",
          "Now: the delete line prints  RESOLVED with null  and the order is gone; the missing-snack line prints  FAILED: Error No snack with id 99999;  the good line is as before. If a line prints nothing or a TypeError about then, check request() has its  return.",
          mc(
            "What does apiSend(\"DELETE\", …) resolve with when the app answers 204?",
            "null: readAnswer checks the status and returns before it reads any JSON",
            ["An empty object", "The text of the answer"],
            "A 204 has nothing to read, so the helper returns the one value that means nothing. The page just doesn't use it.",
          ),
        ),
        mission(
          "Move edit-snack.js onto the helper, one block at a time. In each case you REPLACE the old call with the new one, and the checks around it stay. The load call becomes:\n\n" +
            EDIT_SNACK_JS_LOAD_API +
            "\n\nSave becomes:\n\n" +
            EDIT_SNACK_JS_SAVE_API +
            "\n\nRemove becomes:\n\n" +
            EDIT_SNACK_JS_REMOVE_API +
            "\n\n(Remove's message still says  Snack N is off the menu.  Those are Week 9's words, and Week 9's checkpoint checks them, so they stay. Remember what Remove really does: it deletes the row for good, which only works for a snack nobody has ordered. Taking a snack off the menu, with the button below, keeps the row.)\n\nand the availability button from Monday becomes:\n\n" +
            EDIT_SNACK_JS_AVAILABILITY_API +
            "\n\nThe top of the file (the lines that read ?id= and find the page's parts) stays as it was. Press Ctrl+Shift+R and do by hand what this week's Monday and Week 9's checkpoints did on this page: Save a new price on Kutsinta and put it back, open ?id=99999, and press Remove on Kutsinta (it is refused). For the availability button use your practice snack and not Kutsinta: run  SELECT * FROM snacks WHERE snack_id = 8000;  first and, if it returns nothing, add it with  " +
            SQL_PRACTICE_SNACK +
            "  open edit-snack.html?id=8000, press the button twice and read the label each time, then remove the snack with  " +
            SQL_CLEAN_PRACTICE +
            "",
          "Everything should look exactly as before: Saved: …, Sorry: No snack with id 99999, the button's two labels, Sorry: Snack 90 is used by a sale or a special. That is the point of a refactor: nothing a person sees changes. Search edit-snack.js for  fetch(  with Ctrl+F: there must be none.",
          mc(
            "How do you know a refactor didn't break anything?",
            "You run the same checks as before, and the answers are the same",
            ["The code is shorter", "Nobody complained"],
            "A refactor changes how the code is written and promises not to change what it does. The checkpoint below is last week's page check, plus one question about fetch.",
          ),
        ),
        mission(
          "Do special.html and special.js the same way. special.html gets the same two script tags (api.js first), and special.js becomes this one file:\n\n" +
            SPECIAL_JS_D2 +
            "\n\nand the script tags of special.html become:\n\n  <script src=\"api.js\"></script>\n  <script src=\"special.js\"></script>\n\nTest it as you tested it last Friday: change the price and put it back.",
          "special.js went from about 60 lines to about 40. The three handlers are the same ones as before; each has its .then for success and one .catch for Sorry:. The old one read  response.json()  three times.",
          mc(
            "Why did special.js get shorter?",
            "The copied pattern (fetch, check ok, read JSON, handle 204) moved into api.js, and each handler keeps only what is special to it",
            ["Some features were removed", "JavaScript is shorter than before"],
            "Shorter is not the aim, but less to copy is.",
          ),
        ),
        mission(
          "One more test, now that the page uses api.js. With edit-snack.html?id=90 open, stop the app (the red square), change the price box, and press Save. Write what the page says. Start the app again and reload.",
          "It says  Sorry: Can't reach the canteen app. Is it running?  from request()'s catch.",
          mc(
            "Why does the page say Sorry: and then api.js's sentence?",
            "api.js throws an Error with that message and the page's .catch writes Sorry: followed by error.message, the same line it uses for an answer from the app",
            ["The browser translated the error", "The page checked if the app was running"],
            "One path for every failure: the page doesn't care whether the app refused or was away.",
          ),
        ),
        mission(
          "Compare. After Part 1 your api.js, the script tags and edit-snack.js should look like this (blank lines don't matter):\n\n" +
            API_JS +
            "\n\n// ---- edit-snack.html (the tags at the end) ----\n\n" +
            EDIT_SNACK_HTML_D2 +
            "\n\n// ---- edit-snack.js ----\n\n" +
            EDIT_SNACK_JS_D2 +
            "\n\n// ---- special.html ----\n\n" +
            SPECIAL_HTML_D2,
          "Common differences: api.js after the page's own script; request() without its return; a page still calling fetch(; the old .catch(error => console.error(error)) left under a new .catch.",
        ),
        paste(
          "Write Part 1 into notes.md: the two mistakes of the first api.js and what each looked like, what apiSend resolves with for a 204 and why, and one sentence on what a refactor is.",
          "In your own words. Use the exact words FAILED / RESOLVED if you like.",
          "Paste Part 1 of notes.md",
        ),
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-api-js",
      title: "🧪 Part 1 · Checkpoint: one helper, two pages",
      intro:
        "Each task runs one line in the console of a page of YOUR app (localhost:8080). The first calls your helper directly; the other two are last week's page checks again, plus one more question: does the page's own script still call fetch? A refactor is allowed to change that and nothing else. The lines leave no snack behind and put prices back.",
      tasks: [
        {
          goal: "Open localhost:8080/edit-snack.html?id=90, press F12 → Console, and run this line. It calls apiGet and apiSend: a good answer, an order placed and cancelled (a 204), and three refusals. Paste what it copies.",
          command: API_HELPER_COMMAND,
          checks: [
            { is: "object", message: "This should be one small object starting with {. Did you run the line in the Console of localhost:8080/edit-snack.html?id=90?" },
            { path: "has_helpers", equals: true, message: "apiGet or apiSend isn't defined on this page. Is api.js in static/, and is its script tag in edit-snack.html BEFORE edit-snack.js?" },
            { path: "get_ok", equals: true, message: "apiGet(\"/api/snacks/90\") should resolve with Kutsinta." },
            { path: "delete_204_resolves_null", equals: true, message: "A DELETE the app answers with 204 should RESOLVE with null. If it fails with a SyntaxError, readAnswer reads JSON before it looks at the status: check  response.status === 204  comes first." },
            { path: "missing_rejects_with_error", equals: true, message: "A 404 should REJECT with an Error. If it resolved with the error body, readAnswer never checks response.ok." },
            { path: "missing_message", equals: "No snack with id 99999", message: "The Error's message should be exactly the app's sentence: No snack with id 99999. Use  throw new Error(data.message)." },
            { path: "bad_qty_message", equals: "qty must be from 1 to 20", message: "A refused POST should reject with the app's sentence too: qty must be from 1 to 20." },
            { path: "delete_missing_message", equals: "No order with id 99999", message: "A refused DELETE (404) HAS a body: the Error's message should be No order with id 99999." },
            { path: "order_was_cancelled", equals: true, message: "The order the line placed was not cancelled. Check apiSend passes the method and the path to fetch." },
          ],
          hint: "readAnswer(response): if the status is 204 return null; otherwise read JSON, and if !response.ok throw new Error(data.message), else return data. request() must RETURN fetch(…).",
          solution: API_JS,
          example: EX.d2Helper,
          previousStage: PREV.d2Helper,
          explain: "Every page can now say 'get', 'send', and trust the result: data, null for nothing, or an Error with the app's own sentence.",
        },
        {
          goal: "The edit page, refactored. Open localhost:8080/edit-snack.html?id=90 and run this line. It is last week's page check (the boxes fill, Save changes the price and the old price is put back) plus: edit-snack.js has no fetch( left, and the page loads api.js first. Paste what it copies.",
          command: EDIT_PAGE_API_COMMAND,
          checks: [
            { is: "object", message: "This should be a small object. Did you run the line in the Console of localhost:8080/edit-snack.html?id=90?" },
            { path: "on_edit_page", equals: true, message: "There is no #snack-name box on this page. Run the line on localhost:8080/edit-snack.html?id=90." },
            { path: "prefilled_name", equals: "Kutsinta", message: "The name box should be filled with Kutsinta when the page opens." },
            { path: "message_on_page", contains: "Saved", message: "The page didn't write a  Saved: …  message after Save. Compare your .then with the compare block." },
            { path: "price_changed_in_mysql", equals: true, message: "MySQL still has the old price: did the Save call send name and price with Number(priceBox.value)?" },
            { path: "script_has_no_fetch", equals: true, message: "edit-snack.js still contains  fetch(  somewhere. Every call goes through apiGet or apiSend now (search the file with Ctrl+F)." },
            { path: "script_uses_api_js", equals: true, message: "edit-snack.js should call apiGet( and apiSend( ." },
            { path: "loads_api_js_first", equals: true, message: "edit-snack.html should have  <script src=\"api.js\"></script>  before  <script src=\"edit-snack.js\"></script>." },
          ],
          hint: "The behaviour checks are the ones that passed last week. The new facts are the last three: search edit-snack.js for fetch( and look at the order of the script tags.",
          solution: EDIT_SNACK_JS_D2,
          example: EX.d2EditPage,
          previousStage: PREV.d2EditPage,
          explain: "A refactor is proven by the same behaviour and a different shape: the page does the same things with no fetch( in it.",
        },
        {
          goal: "The special page, refactored. Open localhost:8080/special.html and run this line. It is Week 9's Friday page check (the price box changes the special and the old price is put back) plus the same two facts. Paste what it copies.",
          command: SPECIAL_PAGE_API_COMMAND,
          checks: [
            { is: "object", message: "This should be a small object." },
            { path: "on_special_page", equals: true, message: "There is no #special-form on this page. Run the line on localhost:8080/special.html." },
            { path: "message_on_page", contains: "The special is now", message: "The page didn't write  The special is now ₱…  after the change." },
            { path: "current_shows_new_price", equals: true, message: "The line above the form should show the NEW special price after a change (showSpecial() runs again)." },
            { path: "price_changed_in_mysql", equals: true, message: "MySQL still has the old special price." },
            { path: "script_has_no_fetch", equals: true, message: "special.js still contains  fetch(  somewhere." },
            { path: "script_uses_api_js", equals: true, message: "special.js should call apiGet( and apiSend( ." },
            { path: "loads_api_js_first", equals: true, message: "special.html should load api.js before special.js." },
          ],
          hint: "Compare with SPECIAL_JS in the compare block: three handlers, each one .then and one .catch.",
          solution: SPECIAL_JS_D2,
          example: EX.d2SpecialPage,
          previousStage: PREV.d2SpecialPage,
          explain: "Two pages on one helper, and nothing a person can see is different.",
        },
      ],
    },
    ...day2Part2,
    {
      kind: "quest",
      id: "error-clinic",
      inline: true,
      title: "🩺 Error clinic: five students, five helpers",
      intro: "Each patient is a real failure of this kind of refactor, and each was observed. Say what is wrong and what you would change.",
      missions: [
        mission(
          "Patient 1. The edit page is blank and the Console says  Uncaught ReferenceError: apiGet is not defined.",
          "Which script tag comes first in edit-snack.html?",
          mc(
            "What is the likeliest cause?",
            "api.js is loaded after edit-snack.js (or not at all), so apiGet doesn't exist yet when the page's script runs",
            ["MySQL is stopped", "The price is too high"],
            "Tags run in order. The helper goes first.",
          ),
        ),
        mission(
          "Patient 2. The first version of api.js: pressing Remove works (the order or snack IS gone), but the page writes nothing, and the Console says  SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input.",
          "What does a 204 have in it?",
          mc(
            "What is wrong?",
            "The helper reads JSON from every answer, and a 204 has none; the delete worked and the reading failed",
            ["The delete failed", "The page needs another .catch"],
            "Week 9 Day 3 again, from the other side: the helper must decide by status before it reads.",
          ),
        ),
        mission(
          "Patient 3. With the first version of api.js, pressing Save on edit-snack.html?id=99999 writes  Saved: undefined at ₱undefined.",
          "What does the first version do with a 404's body?",
          mc(
            "Why does the page say Saved?",
            "The helper resolved with the 404's error body as if it were data, so the page took the success branch and found no name or price in it",
            ["The app answered 200", "The page's template is wrong"],
            "Silent failures are the worst kind: nothing is red, and the page lies. Only a rejected Error reaches the page's .catch.",
          ),
        ),
        mission(
          "Patient 4. A page calls  apiGet(\"/api/snacks/99999\");  with no .catch at all. Nothing shows on the page, and the Console has a red line.",
          "What does a rejected promise with nobody to catch it look like?",
          mc(
            "What does the red line say, and what is missing?",
            "Uncaught (in promise) Error: No snack with id 99999: the page never handles the failure; add a .catch that writes Sorry: and the message",
            ["A syntax error: a semicolon is missing", "A 500 from MySQL"],
            "The helper throws so that every page decides what to show. A page that doesn't catch shows nothing.",
          ),
        ),
        mission(
          "Patient 5. A student wrote request() as  fetch(path, options).catch(…).then(readAnswer);  with no  return  in front of fetch. Every page is blank, and the Console says  TypeError: Cannot read properties of undefined (reading 'then').",
          "What does a function return when it has no return line?",
          mc(
            "What is wrong?",
            "request() returns nothing (undefined), so the page's  .then  is called on undefined; add return in front of fetch",
            ["The Content-Type is missing", "The app was not restarted"],
            "A function hands back only what it returns. Everything in a .then chain depends on that one word.",
          ),
        ),
        paste(
          "Write your discharge notes: one line per patient with the first thing you would check, and then one line that starts: 'When I move code into a shared file, I check that …'.",
          "Patients 2 and 3 give you the line.",
          "Paste your five notes and your rule",
        ),
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own helper",
      intro: "Make api.js do one more useful thing. Do at least one idea; if you have time, do more.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own. Keep every checkpoint passing. Ideas: (1) apiDelete(path) and apiPut(path, body) as two one-line functions that call apiSend (a page can then say what it means); (2) a  console.log  of every call's method and path inside request(), to see the pattern of a page; (3) menu.js, order.js, tables.js and ledger.js still call fetch( themselves: move ONE of them onto apiGet and say what changed; (4) write in notes.md what apiSend does when the body is left out, and why a DELETE doesn't need one; (5) harder: make request() retry once after one second when the app can't be reached, and say in notes.md why you would NOT retry a POST.",
          hint: "For idea 3, pick the smallest page. Remember the page's script tag order. For idea 5, think about what retrying an order does if the first one arrived.",
        },
        paste(
          "Paste what you added: the new lines (and which file), how you tested it, and what it did.",
          "How you tested it can be one sentence.",
          "Paste your new lines, how you tested, and what it did",
        ),
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-copy-paste",
    title: "⚔️ Boss battle: The Ten Lines",
    intro: "The Ten Lines multiplies every time you copy it. Fold it into one.",
    boss: { name: "the Ten Lines", emoji: "📋" },
    questions: [
      bq("What is a refactor?", "Changing how code is written without changing what it does", ["Adding a new feature", "Deleting the tests"], "The behaviour is the promise; the shape is what moves."),
      bq("How do you check a refactor?", "Run the same checks as before: the answers must be the same", ["Read it once more", "Count the lines"], "That is why today's checkpoints are last week's checks again, plus one structural question."),
      bq("Why must <script src=\"api.js\"> come before the page's own script?", "Tags run in order, and the page's script calls apiGet straight away", ["Browsers sort them", "api.js is the largest"], "The first script tag runs first."),
      bq("What does apiSend(\"DELETE\", …) resolve with for a 204?", "null, decided from the status before any JSON is read", ["An empty object", "The text of the answer"], "A 204 has no body: nothing to parse."),
      bq("The first api.js said  response.json()  for every answer. What went wrong on a 204?", "SyntaxError: Unexpected end of JSON input, although the delete worked", ["A 404", "Nothing: it worked"], "Observed in Chrome."),
      bq("What did the first api.js do with a 404's body?", "Resolved with it as data, so a page wrote Saved: undefined", ["Threw it", "Ignored it"], "A silent failure."),
      bq("What does the finished api.js do with an answer that is not ok?", "Throws an Error whose message is the app's message", ["Returns null", "Logs it and carries on"], "So every page's .catch can write Sorry: and that message."),
      bq("Why is it  error.message  that the page writes?", "The Error carries the app's own sentence, the same one the app wrote in Java", ["It is always empty", "It is the status number"], "Java wrote the sentence; the helper only carries it."),
      bq("What does a promise chain with no .catch do when a call is refused?", "Shows a red Uncaught (in promise) line and leaves the page unchanged", ["Retries", "Shows Sorry: by itself"], "Somebody has to catch it."),
      bq("A function in a .then chain has no return. What does the next .then receive?", "undefined", ["The previous value", "An empty string"], "The pipeline carries what is returned."),
      bq("What does request() do if the app is stopped?", "Rejects with Error \"Can't reach the canteen app. Is it running?\", from its own .catch", ["Waits until it starts", "Returns an empty list"], "Observed: the page wrote Sorry: and that sentence."),
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "In your own words: what does api.js do for a page, and what are the three things apiGet or apiSend can give back?",
      "What were the two mistakes of the first api.js, and what did each look like on screen or in the Console?",
      "Why does the helper look at the status 204 before it reads any JSON?",
      "How did you check that moving two pages onto api.js changed nothing?",
      "What would you change in one place now if the app's error key were renamed?",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Two pages are on the helper. Part 2 moves the orders board, the add page and the order form, then tomorrow the staff list gets a page that is built on api.js from its first line.",
  },
};
