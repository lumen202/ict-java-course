// unit3-week10 · Day 2, Part 2 — "the orders board, the add page and the order form on api.js"
//
// Part 1 moved the edit page and the special page. Part 2 moves the other THREE pages that WRITE:
// orders.js (Change, Cancel, the list, the find box), add-snack.js and order.js (the order form: it POSTs /api/orders, so it
// is where the new 409 shows on a page). showOrders and the page's
// first lines are untouched; only the calls change. The checks are Week 9's board checks and the
// add page's own, plus the two structural facts (no fetch( left, api.js first). Observed in headless
// Chrome on a real build: a quantity of 25 on a row writes "Sorry: qty must be from 1 to 20"; Cancel
// writes "Order N is cancelled." and the row goes; the add page's second submit of the same number
// writes "Sorry: Snack N already exists"; on order.html a snack retired AFTER the page loaded is refused with
// the receipt "Sorry: Snack N is not available". menu.js, tables.js and ledger.js only READ and
// still call fetch( themselves; the lab names that and leaves it as a make-your-own idea.

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { ADD_PAGE_COMMAND, BOARD_CANCEL_API_COMMAND, BOARD_EDIT_API_COMMAND, ORDER_PAGE_API_COMMAND } from "./commands";
import { mc, mission, paste } from "./helpers";
import { ORDER_OPTIONS_FETCH } from "../unit3-week7/day5";
import {
  ADD_SNACK_HTML_D2,
  ADD_SNACK_JS_API,
  ORDER_JS_API,
  ORDER_OPTIONS_API,
  ORDER_SCRIPT_TAGS,
  ORDER_SUBMIT_CALL_API,
  ORDER_SUBMIT_CALL_OLD,
  ORDERS_CANCEL_ORDER_API,
  ORDERS_CHANGE_QTY_API,
  ORDERS_FIND_API,
  ORDERS_HTML_D2B,
  ORDERS_JS_D2B,
  ORDERS_LOAD_API,
} from "./snippets";

export const day2Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-board-and-add",
    inline: true,
    title: "🛠️ Part 2 · Lab: the orders board, the add page and the order form",
    intro:
      "Three more pages move onto api.js. The rule is the same as in Part 1: nothing a person sees changes. A page file needs only Ctrl+Shift+R after an edit.",
    missions: [
      mission(
        "The board's script tags first. In orders.html the last lines of the body become:\n\n  <script src=\"api.js\"></script>\n  <script src=\"orders.js\"></script>\n\nThen in orders.js, REPLACE the four blocks that call fetch, one at a time. Leave the first lines (the ones that find the page's parts) and showOrders alone. Change becomes:\n\n" +
          ORDERS_CHANGE_QTY_API +
          "\n\nCancel becomes:\n\n" +
          ORDERS_CANCEL_ORDER_API +
          "\n\nloadOrders becomes (the orders and the summary, each with its own .catch):\n\n" +
          ORDERS_LOAD_API +
          "\n\nand the find box's code becomes:\n\n" +
          ORDERS_FIND_API,
        "Keep the line  loadOrders();  and the Refresh listener that follow loadOrders: they were not part of the four. Press Ctrl+Shift+R on localhost:8080/orders.html; the board should draw as before.",
        mc(
          "Why do changeQty and cancelOrder still call loadOrders() after a success?",
          "The table was drawn from an older answer; after a write the page asks for the truth again, exactly as last week",
          ["Because api.js requires it", "To restart the app"],
          "A refactor changes the calls, not the ideas. The page still shows what it last fetched.",
        ),
      ),
      mission(
        "Test the board like a person, and write down what it said each time. Change a row's quantity to 25 and press Change. Cancel an order you can spare: place one first at localhost:8080/order.html (qty 19). Use the Find box on a number that isn't an order.",
        "Expect Sorry: qty must be from 1 to 20 (the app's sentence, through api.js). Cancel writes Order N is cancelled. and the row disappears. Find says Sorry: No order with id N for a missing number.",
        mc(
          "Where does the sentence after Sorry: come from?",
          "The app's Java, carried by the Error that api.js throws; the page only prints error.message",
          ["From orders.js", "From MySQL"],
          "The same sentence as last week, written by the same Java, through a different pipe.",
        ),
      ),
      mission(
        "The add page. Its script tags become  api.js  then  add-snack.js.  add-snack.js becomes:\n\n" +
          ADD_SNACK_JS_API +
          "\n\nTest it: add a snack number 8200 named Practice at 12, then add the same number again. If the first is refused with  Sorry: Snack 8200 already exists,  that number was taken: use 8201. Then remove it: in queries.sql run  DELETE FROM snacks WHERE snack_id = 8200;  (nothing points at it).",
        "The second submit writes Sorry: Snack 8200 already exists: the 409 from Week 8's catch, through the helper.",
        mc(
          "The add page and the orders board had different code for a refused request. Now they have the same:",
          "A .catch that writes Sorry: and error.message; the difference between a 404, a 409 and a 400 is only in the message",
          ["A different .catch for each status", "No .catch, because the helper handles it"],
          "One way to fail, written once. Statuses matter to the app and to the console; the page only needs the sentence.",
        ),
      ),
      mission(
        "The order form, where Monday's 409 shows. In order.html the last lines of the body become:\n\n" +
          ORDER_SCRIPT_TAGS +
          "\n\nIn order.js REPLACE two blocks and leave the rest (the plus and minus buttons, the total, the receipt) alone. The loader that fills the drop-down:\n\n" +
          ORDER_OPTIONS_FETCH +
          "\n\nbecomes\n\n" +
          ORDER_OPTIONS_API +
          "\n\nand the end of the submit listener, from its  fetch(\"/api/orders\", {  to the final  });  :\n\n" +
          ORDER_SUBMIT_CALL_OLD +
          "\n\nbecomes\n\n" +
          ORDER_SUBMIT_CALL_API +
          "\n\nPress Ctrl+Shift+R on localhost:8080/order.html, place an order for Kutsinta (the receipt reads as before) and cancel it again at localhost:8080/orders.html. The refusal can't be reached by hand: the drop-down lists only snacks that are on the menu, so a retired snack is never offered. The checkpoint below reaches it by adding the option after the page has loaded.",
        "If the drop-down stays empty, apiGet isn't defined (the api.js tag is missing or comes after order.js) or the loader block has a typo: read the Console. The lines around the two blocks (the plus and minus buttons, showTotal) must stay exactly as they were.",
        mc(
          "Why does the receipt say Sorry: … when the app refuses an order?",
          "The helper rejects with the app's sentence, the .catch writes it into the receipt, and the last .then shows the receipt whether the order was made or refused",
          ["The page checks the snack itself", "Spring writes the receipt"],
          "One place that fails, one place that shows: the refusal reaches the person in the app's own words.",
        ),
      ),
      mission(
        "Look for what's left. Press Ctrl+Shift+F in VS Code and search for  fetch(  in the static folder. Write the names of the files that still have it, and say what they have in common.",
        "These pages only READ: the menu, the tables and the ledger. They have no write to get wrong. Moving them is a make-your-own idea, not a requirement.",
        mc(
          "Which pages still call fetch( themselves, and is that a problem?",
          "The ones that only read (menu, tables, ledger); it isn't wrong, but each is another copy of the pattern",
          ["All of them: the refactor failed", "None of them"],
          "The helper is for pages that handle refusals. A GET that can't be refused still copies the pattern.",
        ),
      ),
      mission(
        "Compare. After Part 2 your orders.html, orders.js, add-snack.html and add-snack.js, and your order.js, should look like this (blank lines don't matter):\n\n" +
          ORDERS_HTML_D2B +
          "\n\n// ---- orders.js ----\n\n" +
          ORDERS_JS_D2B +
          "\n\n// ---- add-snack.html ----\n\n" +
          ADD_SNACK_HTML_D2 +
          "\n\n// ---- add-snack.js ----\n\n" +
          ADD_SNACK_JS_API +
          "\n\n// ---- order.js ----\n\n" +
          ORDER_JS_API,
        "Common differences: showOrders replaced by mistake; loadOrders() missing after Change or Cancel; api.js after the page's own script; a leftover  .catch(error => console.error(error)).",
      ),
      paste(
        "Add Part 2 to notes.md: which three pages moved, what you checked after moving them, and which pages still call fetch( and why you left them.",
        "In your own words.",
        "Paste Part 2 of notes.md",
      ),
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-board-and-add",
    title: "🧪 Part 2 · Checkpoint: the board and the add page, on the helper",
    intro:
      "Each task runs one line in the console of the page itself. The first two are Week 9's board checks (Change, then Cancel) plus the two structural facts; the third drives the add page and the fourth the order form. Every line cleans up after itself. Before Part 2 these pages call fetch( themselves.",
    tasks: [
      {
        goal: "Open localhost:8080/orders.html, press F12 → Console, and run this line. It places an order, changes its quantity from the row like a person, and asks whether orders.js still calls fetch( . Paste what it copies.",
        command: BOARD_EDIT_API_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object." },
          { path: "board_has_message_line", equals: true, message: "There is no #message paragraph on this page. Run the line on localhost:8080/orders.html." },
          { path: "row_has_change_control", equals: true, message: "The row has no number box and Change button. Did you replace showOrders by mistake?" },
          { path: "qty_on_row_after", equals: 19, message: "After Change the row should show quantity 19: changeQty must send the box's value and then call loadOrders()." },
          { path: "message_on_page", contains: "now has 19", message: "The page should write  Order N now has 19 × …  after Change." },
          { path: "script_has_no_fetch", equals: true, message: "orders.js still contains  fetch(  somewhere. Search it with Ctrl+F: all four blocks go through apiGet or apiSend." },
          { path: "loads_api_js_first", equals: true, message: "orders.html should load api.js before orders.js." },
        ],
        hint: "The first five checks passed last week. The last two are new: no fetch( in orders.js, and api.js first in the tags.",
        solution: ORDERS_CHANGE_QTY_API,
        example: EX.d2Board,
        previousStage: PREV.d2Board,
        explain: "The board does what it did and asks the helper for it.",
      },
      {
        goal: "Still on localhost:8080/orders.html, run this line. It places an order, presses its Cancel button (the line answers the confirm box with OK), and checks the order is gone from the board and from MySQL. Paste what it copies.",
        command: BOARD_CANCEL_API_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object." },
          { path: "row_has_cancel_button", equals: true, message: "The row has no Cancel button in its last column." },
          { path: "row_gone_from_board", equals: true, message: "The row is still on the board after Cancel: did cancelOrder call loadOrders() after the DELETE resolved?" },
          { path: "message_on_page", contains: "is cancelled", message: "The page should write  Order N is cancelled.  after Cancel." },
          { path: "order_gone_in_mysql", equals: true, message: "The order still exists: is cancelOrder calling apiSend(\"DELETE\", …)?" },
          { path: "script_has_no_fetch", equals: true, message: "orders.js still contains  fetch(  somewhere." },
          { path: "loads_api_js_first", equals: true, message: "orders.html should load api.js before orders.js." },
        ],
        hint: "A 204 resolves with null through the helper: the .then(() => { … }) of cancelOrder doesn't use the value.",
        solution: ORDERS_CANCEL_ORDER_API,
        example: EX.d2BoardCancel,
        previousStage: PREV.d2BoardCancel,
        explain: "A 204 handled once, in api.js, for every page.",
      },
      {
        goal: "Open localhost:8080/add-snack.html and run this line. It adds a snack with a random number through the form, adds the same number again, reads the page's two messages, and removes the snack. Paste what it copies.",
        command: ADD_PAGE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object." },
          { path: "on_add_page", equals: true, message: "There is no #snack-form on this page. Run the line on localhost:8080/add-snack.html." },
          { path: "first_message", contains: "Added:", message: "The first submit should write  Added: …  on the page." },
          { path: "snack_in_mysql", equals: true, message: "The snack isn't in MySQL after the first submit: did apiSend(\"POST\", \"/api/snacks\", snack) run?" },
          { path: "second_message", contains: "already exists", message: "The second submit should write  Sorry: Snack N already exists  (the 409 from Week 8)." },
          { path: "script_has_no_fetch", equals: true, message: "add-snack.js still contains  fetch(  somewhere." },
          { path: "loads_api_js_first", equals: true, message: "add-snack.html should load api.js before add-snack.js." },
          { path: "cleaned_up", equals: true, message: "The line couldn't remove its snack again; remove  Check …  with  DELETE FROM snacks WHERE name LIKE 'Check %';  in SQLTools." },
        ],
        hint: "The page builds the snack object, then apiSend(\"POST\", \"/api/snacks\", snack).then(…).catch(…).",
        solution: ADD_SNACK_JS_API,
        example: EX.d2Add,
        previousStage: PREV.d2Add,
        explain: "Four pages that write now share one way to fail.",
      },
      {
        goal: "Open localhost:8080/order.html, press F12 → Console, and run this line. It orders 2 Kutsinta through the form and reads the receipt, cancels that order, then makes a snack, takes it off the menu, adds it to the drop-down after the page loaded, orders it, reads the receipt, and removes the snack. Paste what it copies.",
        command: ORDER_PAGE_API_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object." },
          { path: "on_order_page", equals: true, message: "There is no #order-form on this page. Run the line on localhost:8080/order.html." },
          { path: "receipt_names_the_order", equals: true, message: "After the order the receipt should read  Order N: 2 × Kutsinta = ₱…  (read  receipt  in the answer): does the .then write data.order_id, data.qty, data.name and data.total?" },
          { path: "order_cancelled", equals: true, message: "The line couldn't cancel its order: cancel the newest Kutsinta order at localhost:8080/orders.html." },
          { path: "refused_receipt", contains: "is not available", message: "An order for a snack that is off the menu should put the app's sentence on the receipt: Sorry: Snack N is not available. Does the .catch write  `Sorry: ${error.message}`  into the receipt, and does a last .then show the receipt?" },
          { path: "script_has_no_fetch", equals: true, message: "order.js still contains  fetch(  somewhere: the loader and the submit both go through apiGet and apiSend." },
          { path: "loads_api_js_first", equals: true, message: "order.html should load api.js before order.js." },
          { path: "cleaned_up", equals: true, message: "The line couldn't remove its snack again; remove  Check …  with the cleanup statements from Monday's checkpoint." },
        ],
        hint: "The submit call is apiSend(\"POST\", \"/api/orders\", order).then(write the receipt).catch(write Sorry:).then(show the receipt).",
        solution: ORDER_JS_API,
        example: EX.d2Order,
        previousStage: PREV.d2Order,
        explain: "The page that places an order now says, in your Java's words, why an order was refused.",
      },
    ],
  },
];
