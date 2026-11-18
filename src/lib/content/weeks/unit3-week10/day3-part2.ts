// unit3-week10 · Day 3, Part 2 — "the staff dashboard": staff.html + staff.js
//
// One page, built on api.js from its first line: a table of every snack (number, name, price, whether
// it is on the menu) with, on each row, an Edit link to edit-snack.html?id=N, a Take off / Put back
// button and a Remove button; and an Add form. Every write asks for the list again. It is a staff
// page: no public page links to it (the page itself does not link out either). Observed in headless
// Chrome on a real build: the table has as many rows as /api/staff/snacks; Add writes "Added: Check N
// (snack N) at ₱13" and the row appears; Take off makes the row say No and the button say Put back on
// the menu, and the menu loses the snack; Put back reverses it; Remove writes "Snack N is removed." and
// the row goes; Remove on Kutsinta writes "Sorry: Snack 90 is used by a sale or a special" and the row stays.

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { NEW_PAGE_FILE, STAFF_PAGE_COMMAND, STAFF_PAGE_WALL_COMMAND } from "./commands";
import { mc, mission, paste } from "./helpers";
import {
  SQL_CLEAN_CHECKS,
  STAFF_HTML,
  STAFF_JS_ADD,
  STAFF_JS_D3,
  STAFF_JS_LOAD,
  STAFF_JS_SHOW,
  STAFF_JS_START,
  STAFF_JS_TOP,
  STAFF_JS_WRITES,
} from "./snippets";

export const day3Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-staff-page",
    inline: true,
    title: "🛠️ Part 2 · Lab: the staff page",
    intro:
      "Part 1 gave staff a list. Part 2 gives them a page: a table with buttons on every row, built on api.js from the first line, so every .catch is one line. A page file needs only Ctrl+Shift+R after an edit. Nothing in Java changes. Nobody's menu links to this page.",
    missions: [
      mission(
        NEW_PAGE_FILE("staff.html") +
          "\n\n" +
          STAFF_HTML +
          "\n\nOpen localhost:8080/staff.html. A heading, an empty table with its headings, a short note, and an Add form that does nothing yet.",
        "The ids (status, message, snack-rows, add-form, new-id, new-name, new-price) are what staff.js will look for: copy them exactly. Note the two script tags: api.js first. There are no links to other pages on purpose.",
        mc(
          "Why does staff.html load api.js and not call fetch itself?",
          "Every call goes through the helper: one pattern for a refusal, written once; the page only decides what to write",
          ["fetch doesn't work on this page", "Because the table needs it"],
          "Yesterday's work, now used from the first line of a new page.",
        ),
      ),
      mission(
        NEW_PAGE_FILE("staff.js") +
          "\n\nFirst the top of the file: the page's parts.\n\n" +
          STAFF_JS_TOP +
          "\n\nThen, after an empty line, the function that draws the table from a list: one row per snack, and an Edit link, a toggle button and a Remove button in the last cell. The buttons only call functions you write next:\n\n" +
          STAFF_JS_SHOW +
          "\n\nRead showSnacks like menu.js: createElement, textContent, append. The new part is that the toggle's label and the 'On the menu' cell both come from snack.available.",
        "Nothing shows yet: nothing calls showSnacks, and the two functions the buttons call come in the next steps.",
        mc(
          "Where does the toggle button's label come from?",
          "From snack.available in the list the app sent: the row says what the ledger says",
          ["From a variable the page remembers", "From the button's id"],
          "The page keeps no copy of the truth. Every redraw starts from the app's list.",
        ),
      ),
      mission(
        "Then the loader and the line that starts everything:\n\n" +
          STAFF_JS_LOAD +
          "\n\nand, at the very end of the file, one line:\n\n" +
          STAFF_JS_START +
          "\n\nPress Ctrl+Shift+R on localhost:8080/staff.html. The table appears, with every snack of your ledger and a line saying how many.",
        "The count under the heading is  N snacks:  the same N as the length of /api/staff/snacks. If the table is empty and the Console has a red line, read it: a typo in an id is the usual cause.",
        mc(
          "What happens when the app answers with an error?",
          "The .catch writes Sorry: and the app's sentence into the status line; the table stays as it was",
          ["The page crashes", "The table is cleared"],
          "The same one-line .catch as every page now.",
        ),
      ),
      mission(
        "The three writes. Between the loader and the last line, add the two functions the buttons call:\n\n" +
          STAFF_JS_WRITES +
          "\n\nand the Add form's code, above the last line:\n\n" +
          STAFF_JS_ADD +
          "\n\nPress Ctrl+Shift+R and try everything: add a snack numbered 8300 named Practice at 12 (use 8301 if 8300 is refused), press Take off the menu on it and then open localhost:8080/menu.html in another tab; press Put back; press Remove (answer OK). Every write redraws the table by calling loadSnacks().",
        "Remove asks first. If a button does nothing, read the Console: the usual causes are a typo in setAvailable or removeSnack, or a missing loadSnacks() in the .then.",
        mc(
          "Why does each write call loadSnacks() instead of changing the row in place?",
          "The list from the app is the truth: after a write the page asks again, and cannot get out of step with the ledger",
          ["It is shorter", "Rows can't be changed in place"],
          "The rule from Week 9's board, again. Patient 3 in the clinic shows what happens without it.",
        ),
      ),
      mission(
        "Two refusals, on purpose. (1) Press Remove on the Kutsinta row and answer OK. Write what the page says. (2) Press the Edit link on any row: which page opens, and with what in the address? Then clean up what you added: if a snack named Practice is still there, press Remove on it, or run  DELETE FROM snacks WHERE snack_id IN (8300, 8301);  in SQLTools.",
        "(1) Sorry: Snack 90 is used by a sale or a special, and the row stays: Week 9's 409. The note under the table already says what to do instead. (2) edit-snack.html?id=N, the page from Monday, with the row's number.",
        mc(
          "Kutsinta can't be removed, but it can be taken off the menu. Which button does that, and what happens to its old orders?",
          "Take off the menu: the row stays and its orders and sales are untouched",
          ["Remove: it erases the orders too", "Edit: it changes the number"],
          "Remove is for a snack nobody has ever ordered. Everything else is Take off.",
        ),
      ),
      mission(
        "Compare. After Part 2 your staff.html and staff.js should look like this (blank lines don't matter):\n\n" +
          STAFF_HTML +
          "\n\n// ---- staff.js ----\n\n" +
          STAFF_JS_D3,
        "Common differences: api.js after staff.js; the two functions (setAvailable, removeSnack) not defined before a button is pressed; the toggle sending snack.available instead of !snack.available (it then never changes anything).",
      ),
      paste(
        "Add Part 2 to notes.md: what the page asks the app for when it opens, what each button does (verb and address), and why every write asks again.",
        "Write it in your own words. The three calls are a GET, a PUT, and a DELETE.",
        "Paste Part 2 of notes.md",
      ),
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-staff-page",
    title: "🧪 Part 2 · Checkpoint: the staff page",
    intro:
      "Each line runs in the console of the staff page itself and cleans up after itself (it makes a snack numbered 20000 or more and removes it; the line answers the confirm box with OK). If one leaves a snack behind, remove it with  " +
      SQL_CLEAN_CHECKS +
      "  The page didn't exist before Part 2.",
    tasks: [
      {
        goal: "Open localhost:8080/staff.html, press F12 → Console, and run this line. It checks the table against the staff list, adds a snack through the form, takes it off the menu, puts it back, removes it, and reads the public pages for a link to staff.html. Paste what it copies.",
        command: STAFF_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did you run the line in the Console of localhost:8080/staff.html?" },
          { path: "on_staff_page", equals: true, message: "There is no #add-form on this page. Run the line on localhost:8080/staff.html." },
          { path: "rows_match_staff_list", equals: true, message: "The table should have one row per snack of /api/staff/snacks, including the ones off the menu. Does loadSnacks() call apiGet(\"/api/staff/snacks\")?" },
          { path: "add_message", contains: "Added:", message: "Adding a snack should write  Added: …  in the message line (the #message paragraph)." },
          { path: "added_row_shown", equals: true, message: "The new snack should appear as a row after Add: call loadSnacks() in the .then." },
          { path: "edit_link", equals: true, message: "Each row's Edit link should go to  edit-snack.html?id=  and the row's number." },
          { path: "taken_off_menu", equals: true, message: "Take off the menu should send available:false so /api/snacks no longer lists the snack." },
          { path: "row_kept_and_marked_no", equals: true, message: "A retired snack's row should STAY, and say No in the 'On the menu' column." },
          { path: "toggle_label_flipped", equals: true, message: "A retired snack's toggle should say  Put back on the menu." },
          { path: "back_on_menu", equals: true, message: "Put back should send available:true and the snack should be on /api/snacks again." },
          { path: "removed_in_mysql", equals: true, message: "Remove should delete the snack (it has no sales)." },
          { path: "row_gone", equals: true, message: "After Remove the row should be gone from the table: call loadSnacks()." },
          { path: "no_public_page_links_to_staff", equals: true, message: "A public page links to staff.html. Staff pages are not linked from index, menu, order or any page customers see." },
        ],
        hint: "The checks follow the buttons in order: Add, Take off, Put back, Remove. Each one needs its write AND the loadSnacks() after it.",
        solution: STAFF_JS_D3,
        example: EX.d3Page,
        previousStage: PREV.d3Page,
        explain: "A whole page of buttons, each a verb and an address you built, and a table that always matches the ledger.",
      },
      {
        goal: "Still on localhost:8080/staff.html, run this line. It presses Remove on the Kutsinta row (answering OK) and checks the app's sentence and that Kutsinta stays. It does nothing if Kutsinta has no sale. Paste what it copies.",
        command: STAFF_PAGE_WALL_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object." },
          { path: "on_staff_page", equals: true, message: "There is no #add-form on this page. Run the line on localhost:8080/staff.html." },
          { path: "has_sales", equals: true, message: "Kutsinta has no sale in /api/sales, so there is no wall to see. Add Week 8's test sales for snack 90." },
          { path: "has_remove_button", equals: true, message: "The Kutsinta row (snack 90) has no button that says exactly Remove." },
          { path: "message_on_page", equals: "Sorry: Snack 90 is used by a sale or a special", message: "The message line should say exactly  Sorry: Snack 90 is used by a sale or a special : the app's own sentence after Sorry:." },
          { path: "still_on_menu", equals: true, message: "Kutsinta should still be there after a refused Remove." },
          { path: "row_still_there", equals: true, message: "The Kutsinta row should still be in the table." },
        ],
        hint: "removeSnack's .catch writes `Sorry: ${error.message}` into messageLine. The sentence itself comes from Week 9's deleteSnack.",
        solution: STAFF_JS_WRITES,
        example: EX.d3PageWall,
        previousStage: PREV.d3PageWall,
        explain: "The dashboard keeps the wall, and tells the truth about it in the app's own words.",
      },
    ],
  },
];
