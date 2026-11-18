// unit3-week10 · Day 5, Part 2 — "the home page's hours, and the whole site"
//
// Part 1 put the hours in a table. Part 2 shows them on index.html through api.js, replacing the typed
// Mon–Fri line of Week 5's <pre> (Saturday has no column in canteen_info: the lab says so and leaves the
// decision to the student's notes). The special's fetch from Week 8 moves onto api.js in the same block.
// Then the whole-site check: every page loads, the seven pages that write or show changing data are on
// api.js, and no public page links to the staff page. Observed in headless Chrome: the hours line reads
// "Aling Nena's Canteen: open 7:00 to 16:00", the special line reads "Today's special: Kutsinta — ₱7";
// all ten pages answer 200; before Part 2 index.js still contains fetch( and the line is missing.

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { INDEX_PAGE_COMMAND, WHOLE_SITE_COMMAND } from "./commands";
import { mc, mission, paste } from "./helpers";
import {
  INDEX_API_SCRIPT_LINES,
  INDEX_HOURS_LINE,
  INDEX_HOURS_PRE_LINE,
  INDEX_JS_D5,
  INDEX_SPECIAL_BLOCK_OLD,
  SQL_CANTEEN_INFO_BACK,
  SQL_CANTEEN_INFO_LATE,
} from "./snippets";

export const day5Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-home-page",
    inline: true,
    title: "🛠️ Part 2 · Lab: the home page asks for its hours",
    intro:
      "The last typed-in fact on a page: the opening hours in index.html. Nothing in Java changes. A page file needs only Ctrl+Shift+R after an edit.",
    missions: [
      mission(
        "In index.html, three small changes. Add one line under the heading (the hours will be written into it):\n\n" +
          INDEX_HOURS_LINE +
          "\n\nDelete the typed weekday line inside your <pre>, the one that reads:\n\n" +
          INDEX_HOURS_PRE_LINE +
          "\n\n(Keep the Saturday line for now: canteen_info has no Saturday. Write in notes.md what you would add to the table to hold it.) And at the end of the body, the script tags become, api.js first:\n\n" +
          INDEX_API_SCRIPT_LINES,
        "Your <pre> may be spaced a little differently from the example: delete whichever line gives the Monday-to-Friday hours. If the page shows no hours at all yet, that is right: nothing writes into the new paragraph.",
        mc(
          "Why can't the Saturday line move into canteen_info as it is?",
          "The table has one opens and one closes column: it can hold one set of hours, not two; it would need another column or another row",
          ["Saturdays aren't in the ledger", "A <pre> can't be moved"],
          "An honest limit. You decide in notes.md what you would add; nothing breaks if you leave it.",
        ),
      ),
      mission(
        "In index.js, find the block that asks for today's special (you wrote it in Week 8):\n\n" +
          INDEX_SPECIAL_BLOCK_OLD +
          "\n\nand REPLACE exactly that block with this one, which asks for the special and for the hours, both through api.js (leave the lines above it, such as the greeting, alone):\n\n" +
          INDEX_JS_D5 +
          "\n\nPress Ctrl+Shift+R on localhost:8080/index.html. The hours line reads  Aling Nena's Canteen: open 7:00 to 16:00,  and the special is as before.",
        "If the hours line is empty and the Console says apiGet is not defined, api.js is missing from the tags or comes after index.js. If it says Sorry: No canteen info, the table is empty: run the INSERT from Part 1.",
        mc(
          "What does the special's .catch write, and why is it different from the hours' .catch?",
          "'No special today.' for any failure: a missing special is normal; the hours' failure writes Sorry: and the app's sentence, because a missing canteen row is a problem",
          ["Both write Sorry:", "Neither catches"],
          "The same helper, two decisions about what a failure means on this page.",
        ),
      ),
      mission(
        "Change the data, not the page. Run the first statement, reload localhost:8080/index.html and read the hours line, then run the second:\n\n" +
          SQL_CANTEEN_INFO_LATE +
          "\n\n" +
          SQL_CANTEEN_INFO_BACK +
          "\n\nWrite what the line said, and which files you edited to change it.",
        "It reads  open 7:00 to 16:30  after a reload, and you edited no file: that is what 'no typed-in data' means.",
        mc(
          "Which files did you edit to change the closing time on the home page?",
          "None: the table changed, and the page asked for it",
          ["index.html", "SnackController.java"],
          "This is the whole week in one line: the page, the app and the ledger agree because only the ledger holds the fact.",
        ),
      ),
      mission(
        "Walk the whole site. Open each page in turn, with the Console open (F12), and write whether it loaded without a red line: index, menu, order, orders, tables, ledger, add-snack, edit-snack?id=90, special, staff. Then search the static folder for  staff.html  with Ctrl+Shift+F: no public page (index, menu, order) may link to it.",
        "If a page shows a red line, read it before anything else. Typical culprits are a script tag in the wrong order, or a leftover  fetch(  you meant to move.",
        mc(
          "Why must no public page link to staff.html?",
          "It is for the people who run the canteen; a link in the menu would advertise it to every customer",
          ["Because links slow the page", "Because Spring forbids it"],
          "Not a lock: anyone who knows the address can still open it. It is only not advertised, and you wrote that down on Wednesday.",
        ),
      ),
      mission(
        "Compare. After Part 2 the end of your index.html and the changed block of your index.js should look like this (everything else in your files stays as you wrote it):\n\n" +
          INDEX_HOURS_LINE +
          "\n\n" +
          INDEX_API_SCRIPT_LINES +
          "\n\n// ---- index.js (the block that replaced the special's fetch) ----\n\n" +
          INDEX_JS_D5,
        "Common differences: the old special block left in (the page then asks for the special twice); api.js after index.js; the <p id=\"hours\"> missing.",
      ),
      paste(
        "Add Part 2 to notes.md: what the home page asks the app for now, what you decided about Saturday, and how you walked the whole site.",
        "In your own words.",
        "Paste Part 2 of notes.md",
      ),
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-home-and-site",
    title: "🧪 Part 2 · Checkpoint: the home page and the whole site",
    intro:
      "The first line runs in the console of the home page; the second on any page of your app. Before Part 2, index.js still has its own fetch( and the page has no hours line.",
    tasks: [
      {
        goal: "Open localhost:8080/index.html, press F12 → Console, and run this line. It checks the hours line against /api/info, the special line, and that index.js has no fetch( left. Paste what it copies.",
        command: INDEX_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be one small object." },
          { path: "has_hours_line", equals: true, message: "There is no paragraph with id hours on this page. Add  <p id=\"hours\"></p>  to index.html, and run the line on localhost:8080/index.html." },
          { path: "hours_say_what_info_says", equals: true, message: "The hours line should read exactly  NAME: open OPENS to CLOSES  with the app's own values from /api/info." },
          { path: "special_line_ok", equals: true, message: "The special's line should say Today's special: … or No special today.: did you keep the special's block, on api.js?" },
          { path: "script_has_no_fetch", equals: true, message: "index.js still contains  fetch(  somewhere: both calls go through apiGet now." },
          { path: "loads_api_js_first", equals: true, message: "index.html should load api.js before index.js." },
        ],
        hint: "The hours' sentence is `${info.name}: open ${info.opens} to ${info.closes}`.",
        solution: INDEX_JS_D5,
        example: EX.d5Index,
        previousStage: PREV.d5Index,
        explain: "The home page now knows nothing the app doesn't tell it.",
      },
      {
        goal: "On any localhost:8080 page, run this line. It loads all ten pages and their scripts, and reports which pages still call fetch( themselves or load api.js late, and whether a public page links to staff.html. Paste what it copies.",
        command: WHOLE_SITE_COMMAND,
        checks: [
          { is: "object", message: "This should be one small object." },
          { path: "all_pages_load", equals: true, message: "One of the ten pages did not load (index, menu, order, orders, tables, ledger, add-snack, edit-snack, special, staff). Check the file names in static/." },
          { path: "pages_still_on_fetch", exact: 0, message: "Some page's own script still contains fetch( : read pages_still_on_fetch for the names." },
          { path: "pages_not_loading_api_js_first", exact: 0, message: "Some page doesn't load api.js before its own script: read pages_not_loading_api_js_first." },
          { path: "all_on_api_js", equals: true, message: "Every one of index, order, orders, add-snack, edit-snack, special and staff must be on api.js." },
          { path: "public_pages_link_to_staff", exact: 0, message: "A public page (index, menu or order) links to staff.html: remove the link." },
        ],
        hint: "pages_still_on_fetch and pages_not_loading_api_js_first name the page to fix.",
        solution: INDEX_JS_D5,
        example: EX.d5Site,
        previousStage: PREV.d5Site,
        explain: "Ten pages, seven on one helper, one staff page nobody links to, and no fact typed in where the app knows it.",
      },
    ],
  },
];
