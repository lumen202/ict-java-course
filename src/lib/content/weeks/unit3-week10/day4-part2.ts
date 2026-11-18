// unit3-week10 · Day 4, Part 2 — "a summary line on the staff page"
//
// The dashboard gains the smaller of the two options from the arc: a summary line from /api/summary
// ("N orders · ₱X in sales", the same words as the orders board) and a Refresh button that asks for the
// list and the summary again. It is built through api.js. Observed in headless Chrome on a real build:
// the line equals what /api/summary answers; after another page places an order, the line is stale until
// Refresh is pressed, and then follows the app; the order is cancelled again.

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { STAFF_SUMMARY_PAGE_COMMAND } from "./commands";
import { mc, mission, paste } from "./helpers";
import {
  STAFF_HTML_D4,
  STAFF_JS_D4,
  STAFF_JS_START_D4,
  STAFF_JS_SUMMARY,
  STAFF_JS_SUMMARY_CONST,
  STAFF_SUMMARY_LINES,
} from "./snippets";

export const day4Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-staff-summary",
    inline: true,
    title: "🛠️ Part 2 · Lab: a summary and a Refresh button",
    intro:
      "The staff page lists the snacks. A person running the canteen also wants the day's numbers. /api/summary already answers them (Week 7 built it, Week 8 moved it to SQL). Nothing in Java changes. A page file needs only Ctrl+Shift+R.",
    missions: [
      mission(
        "In staff.html, directly under the status paragraph, add the summary line and a button (they sit above the message paragraph):\n\n" +
          STAFF_SUMMARY_LINES +
          "\n\nOpen localhost:8080/staff.html: an empty line and a Refresh button that does nothing yet.",
        "The two ids are summary and refresh: staff.js will look for them.",
        mc(
          "Why does the page get its numbers from /api/summary and not add up the table's rows itself?",
          "The app already knows the truth, including sales no row on this page shows; the page only displays",
          ["Adding is impossible in JavaScript", "The table has no numbers"],
          "A number computed in one place can't disagree with itself. The orders board already shows the same line from the same endpoint.",
        ),
      ),
      mission(
        "In staff.js, add one line under the other  const  lines at the top, and the new function above the writes:\n\n" +
          STAFF_JS_SUMMARY_CONST +
          "\n\n" +
          STAFF_JS_SUMMARY +
          "\n\nThen replace the very last line of the file,  loadSnacks();,  with:\n\n" +
          STAFF_JS_START_D4 +
          "\n\nPress Ctrl+Shift+R. The summary line shows the same words as localhost:8080/orders.html.",
        "The sentence is built from total_orders and total_sales exactly like the orders board's. If the line shows Sorry:, read what it says.",
        mc(
          "What does the Refresh button call, and why both functions?",
          "loadSnacks() and loadSummary(): the table and the numbers both come from the app, and either can be out of date",
          ["Only loadSnacks()", "Nothing: the page refreshes itself"],
          "A page shows what it last fetched. Another page can change the ledger while this one is open.",
        ),
      ),
      mission(
        "Watch it go stale. Keep staff.html open. In another tab place an order at localhost:8080/order.html. Come back: the summary line still shows the old numbers. Press Refresh and read it again. Then cancel the order from localhost:8080/orders.html.",
        "The line is stale until Refresh: the page doesn't ask by itself. That is a choice. An automatic refresh every few seconds is a make-your-own idea.",
        mc(
          "Why is the line out of date before Refresh?",
          "The page fetched it when it opened and has not asked since; another page changed the ledger",
          ["The app caches it", "MySQL is slow"],
          "The same stale-page lesson as Week 9's board.",
        ),
      ),
      mission(
        "Compare. After Part 2 your staff.html and staff.js should look like this (blank lines don't matter):\n\n" +
          STAFF_HTML_D4 +
          "\n\n// ---- staff.js ----\n\n" +
          STAFF_JS_D4,
        "Common differences: the summaryLine constant missing; loadSummary not called at the start; the Refresh listener calling only one of the two.",
      ),
      paste(
        "Add Part 2 to notes.md: what the page asks the app for now (list the three calls), and why Refresh calls two functions.",
        "In your own words.",
        "Paste Part 2 of notes.md",
      ),
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-staff-summary",
    title: "🧪 Part 2 · Checkpoint: the summary",
    intro:
      "This line runs in the console of the staff page. It compares the summary line with the app's own numbers, places an order for Kutsinta from the console (so the page doesn't know), presses Refresh and compares again, and cancels the order. Before Part 2 the page has no summary line.",
    tasks: [
      {
        goal: "Open localhost:8080/staff.html, press F12 → Console, and run this line. Paste what it copies.",
        command: STAFF_SUMMARY_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be one small object." },
          { path: "has_summary", equals: true, message: "There is no #summary line and #refresh button on this page. Add them to staff.html, and run the line on localhost:8080/staff.html." },
          { path: "line_matches_app", equals: true, message: "The summary line should read exactly  N orders · ₱X in sales  with the app's numbers from /api/summary (a dot with spaces around it, the ₱ before the amount)." },
          { path: "line_follows_refresh", equals: true, message: "After an order was placed elsewhere, pressing Refresh should update the line to the app's new numbers: does the Refresh listener call loadSummary()?" },
          { path: "cleaned_up", equals: true, message: "The line couldn't cancel its order: cancel the newest order for Kutsinta at localhost:8080/orders.html." },
        ],
        hint: "The sentence is  `${data.total_orders} orders · ₱${data.total_sales} in sales`.  Refresh calls loadSnacks() and loadSummary().",
        solution: STAFF_JS_SUMMARY,
        example: EX.d4Summary,
        previousStage: PREV.d4Summary,
        explain: "The dashboard now shows the day's numbers from the same endpoint as the board, and follows the ledger on demand.",
      },
    ],
  },
];
