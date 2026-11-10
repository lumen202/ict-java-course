// unit3-week9 · Day 5, Part 2 — "a staff page for today's special"
//
// special.html + special.js: shows today's special (GET /api/special, "No special today." on a 404),
// changes its price from a box (PUT /api/special, then shows it again) and removes it with a button that
// asks confirm(...) first (DELETE /api/special, a 204 is success). The same patterns as the edit page and
// the orders board, written once more with less help. Observed in headless Chrome 156 on a real build:
// "Kutsinta: ₱7 (usually ₱10)"; the price box changes it ("The special is now ₱8") and the line above
// follows; Remove (confirm answered OK by the checker) writes "The special is removed." and the page shows
// "No special today."; index.html follows each change.

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { NEW_PAGE_FILE, SPECIAL_PAGE_COMMAND, SPECIAL_PAGE_REMOVE_COMMAND } from "./commands";
import {
  SPECIAL_HTML,
  SPECIAL_JS,
  SPECIAL_JS_CHANGE,
  SPECIAL_JS_REMOVE,
  SPECIAL_JS_SHOW,
  SPECIAL_REINSERT_TWO,
} from "./snippets";

export const day5Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-special-page",
    inline: true,
    title: "🛠️ Part 2 · Lab: a staff page for today's special",
    intro:
      "Part 1 can change and remove the special from the console. Part 2 is a page for it: it shows the special, changes its price from a box, and removes it with a button. It is the third page of the week, so each piece should look familiar; the notes point at where you have seen it. Make sure today's special is Kutsinta's first (Part 1's second mission).",
    missions: [
      {
        task:
          NEW_PAGE_FILE("special.html") +
          "\n\n" +
          SPECIAL_HTML +
          "\n\nOpen localhost:8080/special.html: a heading, an empty line, a box with a button and a Remove button. It does nothing yet.",
        hint: "It is edit-snack.html's cousin. The ids (current, special-form, special-price, remove-special, result) are what special.js will look for. The Remove button has type=\"button\" and sits outside the form, as on Thursday.",
        check: {
          question: "Why does this page have no box for the snack or for the name?",
          choices: [
            "The special is one row: its snack was chosen when the row was inserted, and this page only changes the price",
            "Snacks don't have names",
            "There wasn't room",
          ],
          answer: 0,
          explain: "The page does the two things PUT and DELETE /api/special do: change the price, and remove. Choosing a different snack would be another endpoint.",
        },
      },
      {
        task:
          NEW_PAGE_FILE("special.js") +
          "\n\nFirst the part that shows the special. It has a function so that it can be called again after every change:\n\n" +
          SPECIAL_JS_SHOW +
          "\n\nPress Ctrl+Shift+R on localhost:8080/special.html.",
        hint: "The fetch is index.js's from Week 8, writing a sentence from data.name, data.special_price and data.price. A 404 means 'no special': the else branch writes No special today. The last line calls showSpecial() once when the page opens.",
        check: {
          question: "Why is the fetch inside a function called showSpecial?",
          choices: [
            "So the page can call it again after a change and show the new truth",
            "Because fetch must be inside a function",
            "To make the file longer",
          ],
          answer: 0,
          explain: "The same reason loadOrders() is a function on the orders board: after a write the page asks again.",
        },
      },
      {
        task:
          "Below showSpecial() (the last line) and an empty line, add the part that changes the price. It is Monday's Save, for one value:\n\n" +
          SPECIAL_JS_CHANGE +
          "\n\nPress Ctrl+Shift+R, type 9 in the box and press Change price. Read the line under the form and the line above it. Then change it back to 7.",
        hint: "Compare with edit-snack.js's submit listener: method PUT, a JSON body with one key, special_price (the record's field name), and on success the sentence plus showSpecial() to redraw. Then compare with the home page: reload index.html.",
        check: {
          question: "The line above the form changes without you reloading. Which call did that?",
          choices: [
            "result.textContent = …",
            "showSpecial(): it asks GET /api/special again and writes the answer",
            "The browser",
          ],
          answer: 1,
          explain: "Nothing on this page is stored in the page: every line is a fresh answer from the app.",
        },
      },
      {
        task:
          "Below that and an empty line, add the Remove button's part. It is Thursday's Remove, for the special, with confirm first and the 204 check:\n\n" +
          SPECIAL_JS_REMOVE +
          "\n\nPress Ctrl+Shift+R. Press Remove the special and answer Cancel (nothing happens), then press it again and answer OK. Read both lines. Remove removes only the NEWEST special, so with the two specials of Part 1 the line above now shows the older one. Press Remove again (OK) until the line above says No special today., then run the pair of INSERTs from Part 1 in queries.sql to bring Kutsinta's specials back, and reload:\n\n" +
          SPECIAL_REINSERT_TWO,
        hint: "After OK the line under the form says The special is removed. and the line above shows the OLDER special, because showSpecial() asked again and the newest row was gone. After the last removal it says No special today. (a 404). After the INSERTs and a reload the special is back.",
        check: {
          question: "Why does the line above change straight after the removal, with no reload?",
          choices: [
            "The page remembered it",
            "The DELETE returned that text",
            "showSpecial() asked GET /api/special again, and the page wrote whatever the app now answered: the older special, or the fallback after a 404",
          ],
          answer: 2,
          explain: "The 204 had no words of its own. Everything you read came from the next GET.",
        },
      },
      {
        task:
          "Try to change the price with no special in the table. Press Remove (OK) until the line above says No special today., type 5 in the box and press Change price. Write the line under the form, then bring the specials back with the pair of INSERTs.",
        hint: "It says  Sorry: No special today  (the app's message has no full stop). The PUT found nothing to change, the app answered 404, and the page showed the app's own sentence.",
        check: {
          question: "Which line of the Java produced that sentence?",
          choices: [
            "The .orElseThrow in updateSpecial, when the SELECT of the newest special found no row",
            "The DELETE",
            "The page's else branch alone",
          ],
          answer: 0,
          explain: "Same sentence as GET's, from the same idea: no row means 404. The page only shows it.",
        },
      },
      {
        task:
          "Compare. After Part 2 your special.html and special.js should look like this, line by line (blank lines don't matter), and your static folder has these pages: index, menu, order, orders, tables, ledger, add-snack, edit-snack, special:\n\n" +
          SPECIAL_HTML +
          "\n\n// ---- special.js ----\n\n" +
          SPECIAL_JS,
        hint: "Common differences: the Remove button missing type=\"button\"; the key spelt specialPrice; the 204 branch calling response.json(); showSpecial() not called after a change.",
      },
      {
        task:
          "Add Part 2 to notes.md: the three calls special.js makes (verbs and addresses), what each shows on the page for success and for a refusal, and which of this page's pieces you copied from Monday and which from Thursday.",
        hint: "Write it in your own words. One of the three calls has no body, and one answer has no body.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-special-page",
    title: "🧪 Part 2 · Checkpoint: the special page",
    intro:
      "Each task runs one line in the console of special.html. The first changes the price for you and puts the old price back. The second marks the newest special with 777 and then presses Remove for you (answering the question box with OK), and checks the line above stops showing it; it removes the newest special, so run the pair of INSERTs from Part 1 afterwards. Today's special must be Kutsinta's. Part 1's app had no page at this address.",
    tasks: [
      {
        goal: "Open localhost:8080/special.html, press F12 → Console, and run this line. It changes the price in the box, presses Change price like a person, waits, and asks the app. Paste what it copies.",
        command: SPECIAL_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object starting with {." },
          { path: "on_special_page", equals: true, message: "There is no  #special-form  on this page. Run the line on localhost:8080/special.html." },
          { path: "message_on_page", contains: "The special is now", message: "The page should write  The special is now ₱N  after a PUT. Check the submit listener writes it when response.ok." },
          { path: "current_shows_new_price", equals: true, message: "The line above the form should show the NEW price (Kutsinta: ₱8 (usually ₱10) for example). After a successful PUT the page must call showSpecial() so it asks the app again." },
          { path: "price_changed_in_mysql", equals: true, message: "MySQL still has the old special price. Did the page send  { special_price: Number(priceBox.value) }  with PUT to /api/special?" },
        ],
        hint: "If current_shows_new_price is false, the success branch isn't calling showSpecial(). If message_on_page is empty, the listener isn't attached.",
        solution: SPECIAL_HTML + "\n\n// special.js:\n" + SPECIAL_JS,
        example: EX.d5PageSpecial,
        previousStage: PREV.d5PageSpecial,
        explain: "A box, a PUT, a page that asks again: the click changed the special in your table.",
      },
      {
        goal: "Open localhost:8080/special.html, press F12 → Console, and run this line. It presses Remove the special for you and asks the app. Paste what it copies, and then run the INSERT from Part 1.",
        command: SPECIAL_PAGE_REMOVE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object starting with {." },
          { path: "on_special_page", equals: true, message: "There is no Remove the special button on this page. Run the line on localhost:8080/special.html." },
          { path: "message_on_page", equals: "The special is removed.", message: "The page should write  The special is removed.  after a 204." },
          { path: "current_line_updated", equals: true, message: "The line above still shows the removed special. After the 204 the page must call showSpecial() so the line shows what is left (or No special today.)." },
          { path: "marked_special_gone_in_mysql", equals: true, message: "The special marked 777 is still in MySQL: did the DELETE reach the app, and does it remove the newest special?" },
        ],
        hint: "In the 204 branch:  result.textContent = \"The special is removed.\"; showSpecial();  The line above must stop showing the special you removed.",
        solution: SPECIAL_JS_REMOVE,
        example: EX.d5PageRemove,
        previousStage: PREV.d5PageRemove,
        explain: "The last page of the week: a DELETE, a 204 the page knows not to read, and a fallback sentence from the next GET.",
      },
    ],
  },
];
