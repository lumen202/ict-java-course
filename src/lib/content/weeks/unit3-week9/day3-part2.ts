// unit3-week9 · Day 3, Part 2 — "a Cancel button on the orders board"
//
// orders.html gets a sixth column, Cancel; orders.js gets a button per row and a cancelOrder
// function that asks confirm(...) first, sends DELETE, and treats status 204 as success without
// reading a body (the Part 1 mistake, avoided). New idea taught: confirm() — a browser box with OK
// and Cancel that returns true or false. Observed in headless Chrome 156 on a real build (with
// window.confirm answered "OK" by the checker, because a headless page can't click a dialog): the row
// disappears, the message says "Order N is cancelled.", GET of it is 404. A stale second tab cancelling
// the same order shows "Sorry: No order with id N".

import type { DayGame } from "../../types";
import { EX, PREV } from "./captured";
import { BOARD_CANCEL_COMMAND } from "./commands";
import {
  ORDERS_CANCEL_ORDER,
  ORDERS_HTML_D3,
  ORDERS_JS_D3,
  ORDERS_SHOW_D3,
  SQL_CLEAN_TEST_ORDERS,
} from "./snippets";

export const day3Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-board-cancel",
    inline: true,
    title: "🛠️ Part 2 · Lab: a Cancel button on every row",
    intro:
      "Part 1 can cancel an order from the console. Part 2 puts a Cancel button on each row of orders.html, with a question first, because a click is easy to make by accident. You edit orders.html and orders.js again. A page file needs only Ctrl+Shift+R after an edit, not a restart.",
    missions: [
      {
        task:
          "A new idea first: confirm. In the Console of any page of your app run:\n\nconfirm(\"Really?\")\n\nA box appears with OK and Cancel. Click OK once and Cancel once, and write what the Console printed each time.",
        hint: "It prints true after OK and false after Cancel. The page can stop before it sends anything if the answer is false.",
        check: {
          question: "What does confirm(\"Really?\") give back?",
          choices: [
            "The text Really?",
            "Nothing: it only shows a box",
            "true if the person pressed OK and false if they pressed Cancel",
          ],
          answer: 2,
          explain: "A yes-or-no answer the page can use in an if. It costs one line and stops most accidents. (It doesn't replace the app's own checks.)",
        },
      },
      {
        task:
          "Edit orders.html: in the table's heading row, the line that starts  <tr><th>Order</th>,  add one more heading, so the row becomes:\n\n<tr><th>Order</th><th>Snack</th><th>Qty</th><th>Total</th><th>Change</th><th>Cancel</th></tr>",
        hint: "The row gets a sixth cell in orders.js in the next mission, so the headings need a sixth heading.",
        check: {
          question: "How many cells will each order row have after this lab?",
          choices: ["Four", "Five", "Six"],
          answer: 2,
          explain: "Order, snack, qty, total, then the Change box and button in one cell, and the Cancel button in the last.",
        },
      },
      {
        task:
          "Edit orders.js. Delete the whole showOrders function and type this one in its place (the new lines at the end of the loop make the Cancel cell):\n\n" +
          ORDERS_SHOW_D3 +
          "\n\nThen, below changeQty and an empty line, add the function that cancels:\n\n" +
          ORDERS_CANCEL_ORDER +
          "\n\nPress Ctrl+Shift+R on localhost:8080/orders.html.",
        hint: "In cancelOrder, read the shape: if the person says no, return stops everything. Then the DELETE: a 204 is success, so write the message and load the list again; anything else has a JSON body with the app's own sentence. There is no response.json() on the 204 path, on purpose.",
        check: {
          question: "Why does cancelOrder check  response.status === 204  instead of calling response.json() first?",
          choices: [
            "A 204 has no body, so response.json() would throw; the status alone says it worked",
            "Because 204 is a faster status",
            "Because response.json() doesn't exist",
          ],
          answer: 0,
          explain: "Part 1's mistake, avoided: only the answers that carry JSON are read as JSON.",
        },
      },
      {
        task:
          "Cancel a test order. Place an order on order.html: Kutsinta, qty 19. Open localhost:8080/orders.html, find its row and press Cancel. First answer the box with Cancel, and check the order is still there. Then press Cancel again and answer OK. Write what the message said, and what the row did.",
        hint: "Pressing Cancel in the box does nothing: the function returned before any request was sent. Pressing OK sends the DELETE; the message says Order N is cancelled. and the row leaves the table when the list is drawn again.",
        check: {
          question: "When you answered the box with Cancel, how many requests did the page send to the app?",
          choices: [
            "None: the function returned before the fetch",
            "One, which the app ignored",
            "One DELETE that failed",
          ],
          answer: 0,
          explain: "The if (!confirm(…)) return; line is a gate in front of the fetch. A page can protect people from their own clicks without bothering the app.",
        },
      },
      {
        task:
          "The stale tab, from the clinic. Place another test order of 19. Open localhost:8080/orders.html in TWO tabs. In the first tab cancel the test order (answer OK). Then, in the SECOND tab (which still shows the old list), press Cancel on the same row and answer OK. Write the message.",
        hint: "The second tab says Sorry: No order with id N. Her table was out of date; the app knew the order was already gone and said so. Press Refresh and the row is gone there too.",
        check: {
          question: "The second tab got a 404. Which line of the app produced the message?",
          choices: [
            "The DELETE in cancelOrder matched nothing, removed was 0, and the if (removed == 0) throw… line made the 404 with its sentence",
            "The browser's cache",
            "MySQL's foreign key",
          ],
          answer: 0,
          explain: "The count from Part 1, doing its job on a real page: it tells apart 'I removed it' from 'someone already did'.",
        },
      },
      {
        task:
          "Compare. After Part 2 your orders.html's heading row has six headings, and your whole orders.js should look like this (blank lines don't matter). Then delete any test orders that are left. WARNING: this removes every Kutsinta sale of exactly 19, which is only your tests:\n\n" +
          SQL_CLEAN_TEST_ORDERS +
          "\n\n" +
          ORDERS_JS_D3,
        hint: "Common differences: cancelOrder placed inside showOrders; the Cancel cell built but not appended in tr.append(…, cancel); the headings still five. The whole page for comparison:\n\n" + ORDERS_HTML_D3,
      },
      {
        task:
          "Add Part 2 to notes.md: what confirm does, what the board sends when you press Cancel and say OK (verb and address), why it doesn't read JSON from the answer, and what the stale tab taught you.",
        hint: "Write it in your own words. The last sentence starts: 'A 404 from a cancel doesn't mean the app is broken, it means …'.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-board-cancel",
    title: "🧪 Part 2 · Checkpoint: the board cancels an order",
    intro:
      "The task runs one line in the console of orders.html: it places an order of 19, refreshes the board, presses that row's Cancel button (answering the question box with OK for you), waits, and reads the board and the app. It leaves nothing behind. Before Part 2 the rows had no Cancel button.",
    tasks: [
      {
        goal: "Open localhost:8080/orders.html, press F12 → Console, and run this line. Paste what it copies.",
        command: BOARD_CANCEL_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object starting with {." },
          { path: "row_found", equals: true, message: "The board didn't show the new order's row. Does loadOrders() still run when Refresh is pressed?" },
          { path: "row_has_cancel_button", equals: true, message: "The row has no Cancel button in its sixth cell. Check showOrders builds the cancel cell and appends it with tr.append(id, name, qty, total, change, cancel)." },
          { path: "row_gone_from_board", equals: true, message: "The row is still on the board after Cancel. After a 204, cancelOrder must call loadOrders()." },
          { path: "message_on_page", contains: "cancelled", message: "The message line should say  Order N is cancelled.  Check cancelOrder writes it when response.status is 204." },
          { path: "order_gone_in_mysql", equals: true, message: "MySQL still has the order: GET /api/orders/N should be 404 now. Did the DELETE reach the app?" },
        ],
        hint: "If row_has_cancel_button is false, the cell isn't built or isn't appended. If the row stays, the page is missing loadOrders() after the 204.",
        solution: ORDERS_SHOW_D3 + "\n\n" + ORDERS_CANCEL_ORDER,
        example: EX.d3Board,
        previousStage: PREV.d3Board,
        explain: "A button on a row, a DELETE, a 204 the page knows not to read, a table that asks again.",
      },
    ],
  },
];
