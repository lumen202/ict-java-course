// unit3-week9 · Day 2, Part 2 — "change a quantity from the orders board"
//
// Week 7's orders.html gets a message line and one new column, Change: each row has a number
// box and a Change button, wired to PUT /api/orders/{id}; after a change the board loads the
// list again. No new page file: the lab edits orders.html (two small edits) and orders.js (one
// new line, a replaced showOrders, a new changeQty). Observed in headless Chrome 156 on a real
// build: a row's box and button appear for every order; changing a test order to 19 writes
// "Order N now has 19 × Kutsinta = ₱190" and the row redraws; a box value of 25 (the button is
// not in a form, so max isn't enforced) gives "Sorry: qty must be from 1 to 20".

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { BOARD_EDIT_COMMAND } from "./commands";
import {
  ORDERS_CHANGE_QTY,
  ORDERS_HEAD_LINES,
  ORDERS_HTML_D2,
  ORDERS_JS_D2,
  ORDERS_SHOW_D2,
  SQL_CLEAN_TEST_ORDERS,
} from "./snippets";

export const day2Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-board-edit",
    inline: true,
    title: "🛠️ Part 2 · Lab: change a quantity from the orders board",
    intro:
      "Part 1 can change an order from the console. Part 2 puts a number box and a Change button on every row of orders.html. You edit two files that exist already, orders.html and orders.js. A page file needs only Ctrl+Shift+R after an edit, not a restart.",
    missions: [
      {
        task:
          "Edit orders.html. (1) Under the line  <p id=\"status\"></p>  add one line:\n\n<p id=\"message\"></p>\n\n(2) Replace the table's heading row, the line that starts  <tr><th>Order</th>,  with this one (it has a new heading at the end):\n\n<tr><th>Order</th><th>Snack</th><th>Qty</th><th>Total</th><th>Change</th></tr>\n\nOpen localhost:8080/orders.html: a new empty heading, Change, at the end of the table's top row.",
        hint: "The message line is where the board will say what happened, as add-snack.html's result paragraph does. The heading row must have one heading more than before, because every row will have one cell more.",
        check: {
          question: "Why does the heading row get a fifth heading?",
          choices: [
            "Every row of the table will have a fifth cell, for the box and the button, and the heading names that column",
            "The browser requires five headings",
            "To make the table wider",
          ],
          answer: 0,
          explain: "A table's headings and its rows have to agree. The cells themselves come from orders.js, which is next.",
        },
      },
      {
        task:
          "Edit orders.js, part one. Under the three  const  lines at the top (rows, statusLine, summaryLine) add one line, so the top four lines read:\n\n" +
          ORDERS_HEAD_LINES +
          "\n\nThen delete the whole function showOrders (from  function showOrders(list) {  down to its closing brace) and type this one in its place. The new lines build a cell with a number box and a Change button; everything above them is what you had:\n\n" +
          ORDERS_SHOW_D2 +
          "\n\nDon't reload yet: it calls a function that doesn't exist.",
        hint: "Read the new lines in the middle: they create an input of type number, copy the order's quantity into it, create a button, and give the button a click listener that calls changeQty with the order's number and the box's value. The listener is a function inside the loop, so each row's button remembers its own order and its own box.",
        check: {
          question: "Why does each button's click function use  order.order_id  and  box.value  and not one shared variable?",
          choices: [
            "Each pass of the loop makes its own order and its own box, and the click function remembers the ones from its own row",
            "JavaScript forbids shared variables",
            "To make the page faster",
          ],
          answer: 0,
          explain: "A function created inside a loop body keeps the values of that pass. So 'Change' on row 40 changes order 40 using row 40's box.",
        },
      },
      {
        task:
          "Edit orders.js, part two. Below showOrders and an empty line, type the function that sends the change and then redraws the table:\n\n" +
          ORDERS_CHANGE_QTY +
          "\n\nPress Ctrl+Shift+R on localhost:8080/orders.html. Every row has a box (showing its quantity) and a Change button. Place an order for Kutsinta of 2 on order.html (the receipt tells you its number), refresh the board, change its row to 19 and press Change. Read the message and the row.",
        hint: "Read changeQty like Week 8's pages: PUT with a JSON body, then if response.ok write the message and call loadOrders(), else write Sorry: and the app's own message. Number(newQty) turns the box's text into a number. loadOrders() is the function from Week 7 that fetches the list and the summary again.",
        check: {
          question: "After a successful change, the row's total changes without you pressing Refresh. Which line did that?",
          choices: [
            "messageLine.textContent = …",
            "box.value = order.qty",
            "loadOrders(): it asks the app for the list again, and showOrders draws it from what MySQL now holds",
          ],
          answer: 2,
          explain: "The page doesn't calculate a total; it draws what the app says. So after a change it asks again.",
        },
      },
      {
        task:
          "Make the app say no, from a row. In your test order's box type 25 and press Change. Then type 0 and press Change. Write the two messages. Then change the test order back to 19 (so it is still a test order).",
        hint: "Both say Sorry: qty must be from 1 to 20. The box has min and max, but the Change button is not in a form: a browser only checks min and max when a form is submitted, so the page sent 25 and the app refused it.",
        check: {
          question: "Which line of which file produced the sentence in the message?",
          choices: [
            "orders.js, the line that writes Sorry:",
            "updateOrder's qty check in Java: orders.js only shows the app's words after 'Sorry:'",
            "orders.html, the box's max",
          ],
          answer: 1,
          explain: "The page writes 'Sorry: ' and then whatever message the app sent. Change the Java sentence and the page's message changes with it.",
        },
      },
      {
        task:
          "Correct history from the board. Find the history sale's row (Kutsinta, qty 2, ₱14: it is the sale of 2000-01-03). Change its quantity to 3 and read the total in the message and in the row. Then change it back to 2. Write the two totals.",
        hint: "The total goes 14, 21, 14: three times 7, because the sale keeps its price paid of 7, not today's 10. If you can't find the row, look for ₱14 beside Kutsinta; the ledger page, ledger.html, shows dates.",
        check: {
          question: "Which total does the board show for qty 3?",
          choices: ["₱30", "₱7", "₱21"],
          answer: 2,
          explain: "3 × 7. The page doesn't know the price paid at all: the SELECT behind /api/orders does.",
        },
      },
      {
        task:
          "Compare. After Part 2 your orders.html differs from Week 7's by exactly the two edits above, and your whole orders.js should look like this (blank lines don't matter):\n\n" +
          ORDERS_JS_D2 +
          "\n\nFinally delete your test orders from the table. WARNING: this removes every Kutsinta sale of exactly 19, which is only your tests:\n\n" +
          SQL_CLEAN_TEST_ORDERS,
        hint: "Common differences: messageLine's const line missing (the page then says 'Cannot read properties of null'); changeQty placed inside showOrders; a second pair of braces left from the old showOrders. The compare below shows the whole file; the heading row is the one in orders.html.\n\n" +
          ORDERS_HTML_D2,
      },
      {
        task:
          "Add Part 2 to notes.md: what the board does when Change is pressed, in order (name the verb and the address), why the table asks for the list again afterwards, and why the box's max didn't stop 25.",
        hint: "Write it in your own words. The last sentence is about forms.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-board-edit",
    title: "🧪 Part 2 · Checkpoint: the orders board changes an order",
    intro:
      "The task runs one line in the console of orders.html: it places an order, refreshes the board, changes that order's row to 19 like a person would, waits, and reads the row and the message. It leaves an order of 19; remove it with  " +
      SQL_CLEAN_TEST_ORDERS +
      "  The board didn't have a message line or a Change column before Part 2.",
    tasks: [
      {
        goal: "Open localhost:8080/orders.html, press F12 → Console, and run this line. Paste what it copies.",
        command: BOARD_EDIT_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object starting with {." },
          { path: "board_has_message_line", equals: true, message: "There is no element with id message on this page. Add  <p id=\"message\"></p>  under the status line in orders.html and press Ctrl+Shift+R." },
          { path: "row_found", equals: true, message: "The board didn't show the new order's row after Refresh. Does loadOrders() still run when Refresh is pressed?" },
          { path: "row_has_change_control", equals: true, message: "The row has no number box and button. Check showOrders creates the input and the Change button and appends them to the row." },
          { path: "qty_on_row_after", equals: 19, message: "After pressing Change the row should show quantity 19. Does changeQty call loadOrders() after a successful PUT?" },
          { path: "message_on_page", contains: "now has", message: "The message line should say  Order N now has 19 × …  Check changeQty writes it when response.ok." },
        ],
        hint: "If row_has_change_control is false, the new cell isn't appended to the row (tr.append(…, change)). If the quantity doesn't change, the PUT failed: read the message on the page.",
        solution: ORDERS_SHOW_D2 + "\n\n" + ORDERS_CHANGE_QTY,
        example: EX.d2Board,
        previousStage: PREV.d2Board,
        explain: "A button on a row, a PUT, a table that asks again: the page changed an order in your sales table.",
      },
    ],
  },
];
