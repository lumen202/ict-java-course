// unit3-week10 · Day 1, Part 2 — "a button that takes a snack off the menu"
//
// Part 1 gave the app PUT and GET /api/snacks/{id}/available. Part 2 gives staff the button, on the
// page they already have: edit-snack.html. The label comes from the snack's state ("Take off the
// menu" while it is on the menu, "Put back on the menu" while it is off), the click sends the
// opposite of the state the page last read, and the page asks again afterwards (showAvailability()).
// The page is still a staff page: nothing public links to it (Wednesday's dashboard is the way in).
// Observed in headless Chrome on a real build: on ?id=90 the label starts "Take off the menu", a click
// writes "Snack 90 is taken off the menu." and the label becomes "Put back on the menu", the menu no
// longer lists Kutsinta; a second click puts it back and the label returns.

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { EDIT_AVAILABILITY_PAGE_COMMAND } from "./commands";
import { mc, mission, paste } from "./helpers";
import {
  EDIT_SNACK_AVAILABILITY_BUTTON,
  EDIT_SNACK_HTML_D1,
  EDIT_SNACK_JS_AVAILABILITY,
  EDIT_SNACK_JS_D1,
  SQL_PRACTICE_SNACK,
  SQL_CLEAN_PRACTICE,
} from "./snippets";

export const day1Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-availability-button",
    inline: true,
    title: "🛠️ Part 2 · Lab: a button on the edit page",
    intro:
      "Part 1 can retire a snack from the console. Part 2 gives the edit page the button, and makes its label tell the truth. Nothing from Part 1 changes. A page file needs only Ctrl+Shift+R after an edit, not a restart.",
    missions: [
      mission(
        "A snack to practise on. Run  SELECT * FROM snacks WHERE snack_id = 8000;  first. If it returns a row, that is your Part 1 snack: carry on. If it returns nothing, add it:\n\n" +
          SQL_PRACTICE_SNACK +
          "\n\nOpen localhost:8080/edit-snack.html?id=8000. You should see Practice and its price in the boxes. The page has a Remove button but no way to take the snack off the menu.",
        "If the boxes are empty, the snack isn't there: add it with the INSERT. If it says Sorry: No snack with id 8000, the same.",
        mc(
          "Why do we practise on snack 8000 and not on Kutsinta?",
          "Kutsinta carries last week's checkpoints; a practice snack can be taken off and put back, or removed, without costing anything",
          ["Kutsinta can't be edited", "8000 is a special number"],
          "Every test uses a row of its own. The checkpoint at the end is the one place Kutsinta is touched, and its line puts it back.",
        ),
      ),
      mission(
        "The button. In edit-snack.html, directly under the Remove button, add one line:\n\n" +
          EDIT_SNACK_AVAILABILITY_BUTTON +
          "\n\nIt has no text on purpose: the page's script decides what it says. type=\"button\" keeps it from being a Save button of its own.",
        "It goes after the line that says  Remove this snack  and before the paragraph with id result. Open the page: an empty button.",
        mc(
          "Why is the button's text empty in the HTML?",
          "The right words depend on the snack's state, which only the app knows, so the script writes them",
          ["Because buttons can't hold text", "Because the browser fills it in"],
          "Same idea as Week 9's boxes: the page has no snack data of its own.",
        ),
      ),
      mission(
        "The script. At the very end of edit-snack.js, after an empty line, add:\n\n" +
          EDIT_SNACK_JS_AVAILABILITY +
          "\n\nPress Ctrl+Shift+R on localhost:8080/edit-snack.html?id=8000. Read the button, press it, read the line under the form and the button again. Then open localhost:8080/menu.html and look for Practice, and press the button again.",
        "Read it in two halves. showAvailability() asks the app for the flag and writes the label; the click listener sends the OPPOSITE of what the page last read (!isAvailable), then calls showAvailability() again. The label should read Take off the menu first, Put back on the menu after the first click.",
        mc(
          "After a click, why does the script call showAvailability() again, and not just change the text itself?",
          "The label should come from what the app now says, not from what the page guessed; if the PUT failed, the label stays true",
          ["Because the button must be redrawn twice", "Because Spring requires it"],
          "A page shows what it last asked for. After a write it asks again: the rule from Week 9's board.",
        ),
      ),
      mission(
        "Break it on purpose, then put it right. Open edit-snack.html?id=99999 and read what the page says, and what the button says. Then open  edit-snack.html?id=8000  again.",
        "The first answer comes from the same 404 as the name and price boxes: Sorry: No snack with id 99999. The button stays empty because there is no answer for it to read.",
        mc(
          "Why does the button stay empty for snack 99999?",
          "GET /api/snacks/99999/available answered 404, so the script wrote the app's sentence and never set a label",
          ["The page crashed", "Snack 99999 is off the menu"],
          "Same shape as every page since Week 7: ok means use the data, not ok means show the app's own sentence.",
        ),
      ),
      mission(
        "Compare. After Part 2 your edit-snack.html and edit-snack.js should look like this, line by line (blank lines don't matter). Then clean up: put the practice snack away (it has no sale):\n\n" +
          SQL_CLEAN_PRACTICE +
          "\n\n" +
          EDIT_SNACK_HTML_D1 +
          "\n\n// ---- edit-snack.js ----\n\n" +
          EDIT_SNACK_JS_D1,
        "Common differences: the button above the form; a missing !isAvailable (the button always sends the same value); showAvailability() not called at the top (the label stays empty).",
      ),
      paste(
        "Add Part 2 to notes.md: what the button's label depends on, what the click sends, and why the page asks again afterwards.",
        "Write it in your own words.",
        "Paste Part 2 of notes.md",
      ),
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-availability-page",
    title: "🧪 Part 2 · Checkpoint: the button",
    intro:
      "This line runs in the console of the edit page itself. It presses the button twice like a person, and ends with Kutsinta back on the menu whatever happens. Make sure Kutsinta is on the menu first. Before Part 2 the page has no such button.",
    tasks: [
      {
        goal: "Open localhost:8080/edit-snack.html?id=90, press F12 → Console, and run this line. It waits for the page to load, presses the button, checks the menu, presses it again, checks the menu, and puts Kutsinta back. Paste what it copies.",
        command: EDIT_AVAILABILITY_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be one small object. Did you run the line in the Console of localhost:8080/edit-snack.html?id=90?" },
          { path: "has_button", equals: true, message: "There is no button with id availability on this page. Add  <button type=\"button\" id=\"availability\"></button>  to edit-snack.html and run the line on localhost:8080/edit-snack.html?id=90." },
          { path: "label_at_start", equals: "Take off the menu", message: "While Kutsinta is on the menu the button should say exactly  Take off the menu. Does showAvailability() write it when data.available is true? (Is Kutsinta on the menu right now?)" },
          { path: "label_after_click", equals: "Put back on the menu", message: "After the click the button should say  Put back on the menu. Does the click listener call showAvailability() again?" },
          { path: "message_on_page", contains: "taken off the menu", message: "The line under the form should say  Snack 90 is taken off the menu.  after the first click." },
          { path: "kutsinta_off_menu", equals: true, message: "Kutsinta is still on /api/snacks after the click: the page sent the wrong value, or the app didn't take it. Send { available: !isAvailable }." },
          { path: "label_after_second_click", equals: "Take off the menu", message: "After the second click the label should be back to  Take off the menu." },
          { path: "kutsinta_back_on_menu", equals: true, message: "After the second click Kutsinta should be on /api/snacks again." },
        ],
        hint: "If label_at_start is empty, showAvailability() isn't called when the page opens, or the button's id isn't availability.",
        solution: EDIT_SNACK_JS_AVAILABILITY,
        example: EX.d1Page,
        previousStage: PREV.d1Page,
        explain: "A button that takes a snack off the menu and a label that always matches the table: the page and the ledger agree.",
      },
    ],
  },
];
