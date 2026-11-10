// unit3-week9 · Day 1, Part 2 — "a page that edits a snack"
//
// Part 1 gave the app PUT /api/snacks/{id}. Part 2 gives staff a page for it:
// edit-snack.html + edit-snack.js, opened as edit-snack.html?id=90. New ideas, taught
// in the lab: reading the address bar with URLSearchParams(location.search), filling
// boxes from a GET, and fetch with method "PUT". The page is staff-only and linked
// from nowhere on the public pages (a staff member types the address: Week 10 replaces
// that with a dashboard). Observed on a real build in headless Chrome 156:
//  - ?id=90 fills the boxes (Kutsinta, its price) and shows the number; Save writes
//    "Saved: Kutsinta at ₱12" and the table changes; ?id=99999 writes "Sorry: No snack
//    with id 99999" and leaves the boxes empty; with no ?id= at all the address asked
//    for is /api/snacks/null and the app answers 400 (a message about failing to convert
//    the text "null" to int), which the page writes after "Sorry:".

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { EDIT_PAGE_COMMAND, EDIT_PAGE_UNKNOWN_COMMAND, NEW_PAGE_FILE } from "./commands";
import {
  EDIT_SNACK_HTML,
  EDIT_SNACK_JS,
  EDIT_SNACK_JS_LOAD,
  EDIT_SNACK_JS_SAVE,
  EDIT_SNACK_JS_TOP,
} from "./snippets";

export const day1Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-edit-page",
    inline: true,
    title: "🛠️ Part 2 · Lab: a page that edits a snack",
    intro:
      "Part 1 can change a snack from the console. Part 2 builds the page a person would use: it opens with the snack's current name and price already in the boxes, and Save sends the change. Nothing from Part 1 changes. A page file needs only Ctrl+Shift+R after an edit, not a restart.",
    missions: [
      {
        task:
          "A new idea first: how does a page know WHICH snack to edit? Through the address: localhost:8080/edit-snack.html?id=90 puts the number after a question mark. Everything after the ? is called the query string, and JavaScript reads it with URLSearchParams. Try it without any page of your own: open localhost:8080/menu.html, press F12 → Console, and run:\n\nnew URLSearchParams(\"?id=90\").get(\"id\")\n\nThen run it with a number of your own choosing. Write down what it printed, and whether the number came back in quotes.",
        hint: "The console prints \"90\" with quotes: a piece of text, not a number. That is why the edit page will say Number(…) for the price but can use the id as it is: it only goes into an address.",
        check: {
          question: "What does  new URLSearchParams(\"?id=90\").get(\"id\")  give?",
          choices: [
            "The number 90",
            "The text \"90\": everything in an address is text",
            "The whole address",
          ],
          answer: 1,
          explain: "Addresses are text. The page will put it straight back into /api/snacks/ + the text, which works the same, and Number(…) is only needed when a JSON number must go in a body.",
        },
      },
      {
        task:
          NEW_PAGE_FILE("edit-snack.html") +
          "\n\n" +
          EDIT_SNACK_HTML +
          "\n\nOpen localhost:8080/edit-snack.html?id=90 (the ?id=90 matters later; type it now). A heading, a snack number that is still empty, two empty boxes and a Save button that does nothing yet.",
        hint: "It is add-snack.html's cousin. The ids (status, edit-form, snack-number, snack-name, snack-price, result) are what edit-snack.js will look for, so copy them exactly. The page has no Remove button: that comes on Thursday.",
        check: {
          question: "Why does this page have no box for the snack NUMBER?",
          choices: [
            "The number is not editable: it comes from the address, and it names which snack the page edits",
            "Because snacks don't have numbers",
            "Because the box wouldn't fit",
          ],
          answer: 0,
          explain: "Changing a snack's number would mean changing what sales point at. The number identifies the snack; only the name and the price are editable.",
        },
      },
      {
        task:
          NEW_PAGE_FILE("edit-snack.js") +
          "\n\nFirst the top of the file: read the number from the address and find the page's parts.\n\n" +
          EDIT_SNACK_JS_TOP +
          "\n\nThen, below it and an empty line, the call that asks the app for that snack and fills the boxes:\n\n" +
          EDIT_SNACK_JS_LOAD +
          "\n\nPress Ctrl+Shift+R on localhost:8080/edit-snack.html?id=90.",
        hint: "Read the second half like Week 8's pages: fetch, then if response.ok use the data, else write Sorry: and the app's own message. The backticks in `/api/snacks/${snackId}` are the same backticks as Week 6's template strings. The boxes should show Kutsinta and its price, and the number should read 90.",
        check: {
          question: "Where do the name and price in the boxes come from?",
          choices: [
            "They were typed into edit-snack.html",
            "From the browser's memory of the last visit",
            "From GET /api/snacks/90: the page asks the app, and the app asks MySQL",
          ],
          answer: 2,
          explain: "Open the page for any snack number and the boxes show that snack: the page has no snack data of its own.",
        },
      },
      {
        task:
          "Try three other addresses and write down what the page says for each: edit-snack.html?id=99999 (no such snack), edit-snack.html?id=abc (text, not a number), and edit-snack.html with nothing after it.",
        hint: "The first says Sorry: No snack with id 99999 (the very sentence from Week 7). The other two are 400s from Spring, with a sentence that says it failed to convert the text to an int, because the app expects a number in the address. The boxes stay empty each time.",
        check: {
          question: "Why do the boxes stay empty for  ?id=99999 ?",
          choices: [
            "The page crashed",
            "The app answered 404, so response.ok was false and the script wrote the message instead of filling the boxes",
            "Snack 99999 has an empty name",
          ],
          answer: 1,
          explain: "Same shape as every page since Week 7: ok means use the data, not ok means show the app's own sentence.",
        },
      },
      {
        task:
          "Now Save. Below the load call, and an empty line, add the part that sends the change:\n\n" +
          EDIT_SNACK_JS_SAVE +
          "\n\nPress Ctrl+Shift+R on localhost:8080/edit-snack.html?id=90, change the price to 12, press Save, and read the line under the form. Then reload the page (the box should now say 12 by itself) and open localhost:8080/menu.html.",
        hint: "Compare the fetch with add-snack.js: method PUT instead of POST, the snack number in the address instead of in the body, and a body of only name and price. Number(priceBox.value) turns the box's text into a number, because SnackChange.price is an int.",
        check: {
          question: "After pressing Save, the page you reload shows 12 without anyone typing it. Why?",
          choices: [
            "The browser kept the 12 in the box",
            "The page edited its own HTML file",
            "The UPDATE changed the row, and the load call at the top of the file reads it back",
          ],
          answer: 2,
          explain: "The table is the only place the price lives. Every page that shows it asks again, so every page agrees.",
        },
      },
      {
        task:
          "Refuse it. Change the name box to three spaces (the browser accepts spaces, because the box isn't empty) and press Save. Then put the name back to Kutsinta and the price back to 10, press Save, and check the menu shows Kutsinta at 10. Write the message the page showed for the blank name.",
        hint: "The page shows Sorry: name must not be blank. The page only displays what the app sends; Java wrote that sentence. If your snack isn't named Kutsinta, put back whatever the boxes showed at the start.",
        check: {
          question: "Which layer refused the blank name?",
          choices: [
            "The browser: the box has  required",
            "The page's JavaScript",
            "The app's check in updateSnack: three spaces pass the browser's check, and the app's isBlank() catches them",
          ],
          answer: 2,
          explain: "The page's checks are a courtesy; the app's are the real ones, because anything can send a PUT without your page.",
        },
      },
      {
        task:
          "Compare. After Part 2 your edit-snack.html and edit-snack.js should look like this, line by line (blank lines don't matter), and your static folder has these pages: index, menu, order, orders, tables, ledger, add-snack, edit-snack:\n\n" +
          EDIT_SNACK_HTML +
          "\n\n// ---- edit-snack.js ----\n\n" +
          EDIT_SNACK_JS,
        hint: "Common differences: a missing backtick in `/api/snacks/${snackId}`; Number(…) missing around priceBox.value; the second fetch's headers line missing; the script tag not the last line of the body.",
      },
      {
        task:
          "Add Part 2 to notes.md: how the page learns which snack to edit, which two calls it makes (verbs and addresses), and what it shows for a snack that doesn't exist.",
        hint: "Write it in your own words. The two calls are a GET when the page opens and a PUT when Save is pressed.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-edit-page",
    title: "🧪 Part 2 · Checkpoint: the edit page",
    intro:
      "Each task runs one line in the console of the edit page itself and copies what it found; paste it here. The first line changes Kutsinta's price by one and puts the old price back, so nothing is left changed. The page didn't exist before Part 2, so Part 1's app can't pass.",
    tasks: [
      {
        goal: "Open localhost:8080/edit-snack.html?id=90, press F12 → Console, and run this line. It waits for the boxes to fill, changes the price box, presses Save like a person, waits, and then asks MySQL. Paste what it copies.",
        command: EDIT_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did you run the line in the Console of localhost:8080/edit-snack.html?id=90?" },
          { path: "on_edit_page", equals: true, message: "There is no  #snack-name  box on this page. Run the line on localhost:8080/edit-snack.html?id=90 (check the ?id=90 at the end)." },
          { path: "number_shown", equals: "90", message: "The snack number on the page should read 90. Does edit-snack.js put snackId into the span with id snack-number?" },
          { path: "prefilled_name", equals: "Kutsinta", message: "The name box should be filled with Kutsinta when the page opens. Does the load call set nameBox.value from data.name?" },
          { path: "message_on_page", contains: "Saved", message: "The page didn't write a  Saved: …  message. Check the PUT call writes it when response.ok, and press Ctrl+Shift+R. The Console shows any red error." },
          { path: "price_changed_in_mysql", equals: true, message: "MySQL still has the old price. Did the page send price with Number(priceBox.value) and the name box's value to PUT /api/snacks/ + snackId?" },
        ],
        hint: "If prefilled_name is empty, the load call isn't filling the boxes. If message_on_page is empty, the submit listener isn't attached or isn't writing into the paragraph with id result.",
        solution: EDIT_SNACK_HTML + "\n\n// edit-snack.js:\n" + EDIT_SNACK_JS,
        example: EX.d1PageEdit,
        previousStage: PREV.d1PageEdit,
        explain: "A page, an endpoint and a table working as one: the click became an UPDATE you can SELECT.",
      },
      {
        goal: "Open localhost:8080/edit-snack.html?id=99999, press F12 → Console, and run this line. It waits a moment and reads what the page says. Paste what it copies.",
        command: EDIT_PAGE_UNKNOWN_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object." },
          { path: "on_edit_page", equals: true, message: "There is no  #snack-name  box on this page. Run the line on localhost:8080/edit-snack.html?id=99999." },
          { path: "status_on_page", equals: "Sorry: No snack with id 99999", message: "The page should write exactly  Sorry: No snack with id 99999  in the paragraph with id status. Does the load call's else branch write data.message there?" },
        ],
        hint: "In the load call's else branch:  statusLine.textContent = `Sorry: ${data.message}`;",
        solution: EDIT_SNACK_JS_LOAD,
        example: EX.d1PageUnknown,
        previousStage: PREV.d1PageUnknown,
        explain: "The page tells the person why there is nothing to edit, in the app's own words.",
      },
    ],
  },
];
