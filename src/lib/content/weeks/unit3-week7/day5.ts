// unit3-week7 · Day 5 — Your pages use your API
//
// Wrap-up day: no video. The payoff Week 6 prepared:
//   - menu.js: the typed `const snacks = […]` becomes `let snacks = []`, and
//     `showSnacks(snacks);` becomes a fetch("/api/snacks") that fills it.
//     Nothing else in the file changes, because Week 6 kept data and drawing apart.
//   - order.js: the submit listener POSTs Week 6's JSON to /api/orders and
//     shows the receipt from the APP's answer (order number, name, total), or
//     the app's error message when response.ok is false.
//   - (the week's gauntlet lives on Day 4, which had room for it)
//   - the twist: RowsController answers /api/rows with the student's own Week 3
//     rows, and tables.js swaps fetch("rows.json") for fetch("/api/rows").
//
// Part 2, "the counter's side" (2026-10-28): students were finishing the day in
// about two hours, so it now continues with required, checkable work that
// builds on the week:
//   - Part A: order.js gets its snacks from /api/snacks (one price list, in
//     Java): the drop-down is built by the script, showTotal looks the price up
//     in the fetched list, and copes with the empty list it starts with.
//   - Part B: two endpoints in SnackController (GET /api/orders/{id} with a 404
//     in getSnack's shape, GET /api/summary from a Summary record).
//   - Part C: a new staff page, orders.html + orders.js (list, summary,
//     Refresh, a find box, and an error written on the page).
//   - make-your-own: an open improvement, no ceiling.
// Week 8 must keep /api/orders/{id} and /api/summary with these keys (the
// summary can become a SQL SUM). Every Spring behaviour in Part B was observed
// on a real Spring Boot 4.1.1 build; the json-check examples are its answers.
//
// Checkpoints run the pages against the canteen API fake (`api: "canteen"`,
// lib/game/canteenApi.ts, pinned to the real app's answers). The harness logs
// each API call ("→ GET /api/snacks · 200"), so a `log` check proves the page
// really fetched — the fake serves the same six snacks as Week 6's typed array,
// so rows alone couldn't tell the difference.
// Pages that fetch /api/… only work at localhost:8080: from Live Server
// (127.0.0.1:5500) the same fetch asks Live Server, which has no /api.

import type { DayPlan } from "../../types";
import { controllerHeader } from "./day3";
import { PLACE_ORDER } from "./day4";
import { indent } from "./day2";

export const SUMMARY_RECORD = "public record Summary(int total_orders, int total_sales) {\n}";

export const GET_ORDER =
  "@GetMapping(\"/api/orders/{id}\")\npublic Order getOrder(@PathVariable int id) {\n    for (Order o : orders) {\n        if (o.order_id() == id) {\n            return o;\n        }\n    }\n    throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No order with id \" + id);\n}";

export const GET_SUMMARY =
  "@GetMapping(\"/api/summary\")\npublic Summary summary() {\n    int sales = 0;\n    for (Order o : orders) {\n        sales = sales + o.total();\n    }\n    return new Summary(orders.size(), sales);\n}";

export const WHOLE_CONTROLLER_W7D5 = `${controllerHeader}

${indent(PLACE_ORDER)}

${indent(GET_ORDER)}

${indent(GET_SUMMARY)}
}`;

const MENU_FETCH =
  "fetch(\"/api/snacks\")\n  .then(response => response.json())\n  .then(data => {\n    snacks = data;\n    showSnacks(snacks);\n  })\n  .catch(error => console.error(error));";

const MENU_JS = `let snacks = [];
const rows = document.getElementById("menu-rows");

function showSnacks(list) {
  rows.replaceChildren();
  for (const snack of list) {
    const tr = document.createElement("tr");
    const name = document.createElement("td");
    name.textContent = snack.name;
    const price = document.createElement("td");
    price.textContent = \`₱\${snack.price}\`;
    tr.append(name, price);
    rows.append(tr);
  }
  document.getElementById("count").textContent = \`Showing \${list.length} snacks\`;
}

${MENU_FETCH}

const search = document.getElementById("search");

search.addEventListener("input", function () {
  const words = search.value.toLowerCase();
  showSnacks(snacks.filter(snack => snack.name.toLowerCase().includes(words)));
});`;

const SUBMIT_LISTENER = `form.addEventListener("submit", function (event) {
  event.preventDefault();
  const order = { snack_id: Number(snack.value), qty: Number(qty.value) };
  console.log(JSON.stringify(order));
  fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          document.getElementById("receipt-text").textContent =
            \`Order \${data.order_id}: \${data.qty} × \${data.name} = ₱\${data.total}\`;
        } else {
          document.getElementById("receipt-text").textContent = \`Sorry: \${data.message}\`;
        }
        receipt.style.display = "block";
      });
    })
    .catch(error => console.error(error));
});`;

const ORDER_TOP = `const qty = document.getElementById("qty");

document.getElementById("plus").addEventListener("click", function () {
  if (Number(qty.value) < 20) {
    qty.value = Number(qty.value) + 1;
  }
  showTotal();
});

document.getElementById("minus").addEventListener("click", function () {
  if (Number(qty.value) > 1) {
    qty.value = Number(qty.value) - 1;
  }
  showTotal();
});`;

const ORDER_STATE_V1 = `const prices = { 1: 15, 2: 12, 3: 20, 4: 10, 5: 25, 6: 8 };
const snack = document.getElementById("snack");
const total = document.getElementById("total");

function showTotal() {
  const price = prices[snack.value];
  const count = Number(qty.value);
  total.textContent = \`Total: ₱\${price * count}\`;
}

showTotal();`;

const ORDER_TAIL = `snack.addEventListener("change", showTotal);
qty.addEventListener("input", showTotal);

const receipt = document.getElementById("receipt");

document.getElementById("new-order").addEventListener("click", function () {
  receipt.style.display = "none";
  qty.value = 1;
  showTotal();
});

const form = document.getElementById("order-form");

${SUBMIT_LISTENER}`;

export const ORDER_JS = `${ORDER_TOP}

${ORDER_STATE_V1}

${ORDER_TAIL}`;

// Part 2, Part A: order.js gets its snacks from the API instead of `prices`.
// `snack` is the <select>, so the loop variable is `item` (a loop variable
// called snack would hide it, and snack.append would then be called on a
// snack OBJECT). showTotal must cope with an empty `snacks`: the top-level
// showTotal(); runs before the answer arrives.
export const ORDER_STATE_V2 = `let snacks = [];
const snack = document.getElementById("snack");
const total = document.getElementById("total");

function showTotal() {
  const matches = snacks.filter(item => item.snack_id === Number(snack.value));
  if (matches.length > 0) {
    const count = Number(qty.value);
    total.textContent = \`Total: ₱\${matches[0].price * count}\`;
  }
}

showTotal();`;

export const ORDER_OPTIONS_FETCH = `fetch("/api/snacks")
  .then(response => response.json())
  .then(data => {
    snacks = data;
    for (const item of snacks) {
      const option = document.createElement("option");
      option.value = item.snack_id;
      option.textContent = \`\${item.name} — ₱\${item.price}\`;
      snack.append(option);
    }
    showTotal();
  })
  .catch(error => console.error(error));`;

export const ORDER_JS_V2 = `${ORDER_TOP}

${ORDER_STATE_V2}

${ORDER_OPTIONS_FETCH}

${ORDER_TAIL}`;

export const ORDER_SELECT_V2 = `<select id="snack" name="snack_id"></select>`;

// Part 2, Part C: the orders board (static/orders.html + static/orders.js).
export const ORDERS_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Orders — Aling Nena's Canteen</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html">Home</a>
  <a href="menu.html">Menu</a>
  <a href="order.html">Order</a>
  <h1>Orders</h1>
  <p id="summary"></p>
  <p id="status"></p>
  <button type="button" id="refresh">Refresh</button>
  <table>
    <tr><th>Order</th><th>Snack</th><th>Qty</th><th>Total</th></tr>
    <tbody id="order-rows"></tbody>
  </table>
  <form id="find-form">
    <label for="find-id">Order number</label>
    <input type="number" id="find-id" min="1" required>
    <button type="submit">Find</button>
  </form>
  <p id="found"></p>
  <script src="orders.js"></script>
</body>
</html>`;

export const ORDERS_JS_SHOW = `const rows = document.getElementById("order-rows");
const statusLine = document.getElementById("status");
const summaryLine = document.getElementById("summary");

function showOrders(list) {
  rows.replaceChildren();
  for (const order of list) {
    const tr = document.createElement("tr");
    const id = document.createElement("td");
    id.textContent = order.order_id;
    const name = document.createElement("td");
    name.textContent = order.name;
    const qty = document.createElement("td");
    qty.textContent = order.qty;
    const total = document.createElement("td");
    total.textContent = \`₱\${order.total}\`;
    tr.append(id, name, qty, total);
    rows.append(tr);
  }
  if (list.length === 0) {
    statusLine.textContent = "No orders yet.";
  } else {
    statusLine.textContent = "";
  }
}`;

export const ORDERS_JS_LOAD = `function loadOrders() {
  fetch("/api/orders")
    .then(response => response.json())
    .then(data => showOrders(data))
    .catch(error => {
      console.error(error);
      statusLine.textContent = "Can't reach the canteen app. Is it running?";
    });

  fetch("/api/summary")
    .then(response => response.json())
    .then(data => {
      summaryLine.textContent = \`\${data.total_orders} orders · ₱\${data.total_sales} in sales\`;
    })
    .catch(error => {
      console.error(error);
      statusLine.textContent = "Can't reach the canteen app. Is it running?";
    });
}`;

export const ORDERS_JS_START = `loadOrders();

document.getElementById("refresh").addEventListener("click", loadOrders);`;

export const ORDERS_JS_FIND = `const found = document.getElementById("found");
const findId = document.getElementById("find-id");

document.getElementById("find-form").addEventListener("submit", function (event) {
  event.preventDefault();
  fetch(\`/api/orders/\${findId.value}\`)
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          found.textContent = \`Order \${data.order_id}: \${data.qty} × \${data.name} = ₱\${data.total}\`;
        } else {
          found.textContent = \`Sorry: \${data.message}\`;
        }
      });
    })
    .catch(error => console.error(error));
});`;

export const ORDERS_JS = `${ORDERS_JS_SHOW}

${ORDERS_JS_LOAD}

${ORDERS_JS_START}

${ORDERS_JS_FIND}`;

export const ROWS_CONTROLLER = `import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RowsController {

    record Row(String title, String borrower) {
    }

    @GetMapping("/api/rows")
    public List<Row> rows() {
        return List.of(
            new Row("Noli Me Tangere", "Ana Reyes"),
            new Row("El Filibusterismo", "Ben Cruz"),
            new Row("Florante at Laura", "Ana Reyes")
        );
    }
}`;

// The console line the self-audit uses to check POST-only behaviour (qty 0 or 25 answers
// 400, snack 99 answers 404). Same style as Day 4's consoleOrder, with snack 3 and qty 2.
const AUDIT_ORDER_LINE =
  'fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ snack_id: 3, qty: 2 }) }).then(r => { console.log(r.status, r.ok); return r.text(); }).then(t => { console.log(t); return t; }).then(copy)';

// The orders the orders-board checkpoint starts with. Each total is the fake's
// own price × qty (content-integrity.test.ts proves it): 2 × 20, 1 × 12, 2 × 25.
const SEED_ORDERS = [
  { order_id: 1, snack_id: 3, name: "Kwek-kwek", qty: 2, total: 40 },
  { order_id: 2, snack_id: 2, name: "Turon", qty: 1, total: 12 },
  { order_id: 3, snack_id: 5, name: "Siopao", qty: 2, total: 50 },
];

export const day5: DayPlan = {
  day: "Day 5",
  focus:
    "Your pages use your API (the menu and the order form), then the counter's side: the order form's drop-down from /api/snacks, two new endpoints (/api/orders/{id}, /api/summary), an orders board page, and an improvement of your own",
  warmupGame: {
    kind: "quest",
    id: "warmup-week-map",
    title: "🗺️ Warm-up: which page talks to which endpoint",
    intro: "Every page you built in Weeks 5 and 6 has an endpoint waiting for it now.",
    missions: [
      {
        task: "menu.js has a typed list of snacks. Your app answers the same list at /api/snacks.",
        hint: "Week 6 kept the data in one place and the drawing in another. Which one changes?",
        check: {
          question: "What has to change in menu.js to use your API?",
          choices: [
            "Only where snacks comes from: a fetch(\"/api/snacks\") instead of the typed list. showSnacks and the search stay as they are",
            "All of it, because the API is Java",
            "Nothing: the menu updates by itself",
          ],
          answer: 0,
          explain: "That's the payoff of Week 6's showSnacks(list): it draws any list it's handed, typed or fetched.",
        },
      },
      {
        task: "order.js logs {\"snack_id\":3,\"qty\":2}. Your app accepts exactly that at POST /api/orders.",
        hint: "Which of Wednesday's console lines did the same thing?",
        check: {
          question: "What does order.js need to send it?",
          choices: [
            "A GET to /api/orders?snack_id=3",
            "A form with method=\"post\"",
            "A fetch with method: \"POST\", the Content-Type header, and JSON.stringify(order) as the body — Wednesday's console line, inside the submit listener",
          ],
          answer: 2,
          explain: "You've run it by hand already. Today it runs when the customer presses Place order.",
        },
      },
      {
        task: "You open menu.html with Live Server, at 127.0.0.1:5500. The menu is empty, and the console shows a red error about JSON.",
        hint: "fetch(\"/api/snacks\") asks the server the page came from. Which server is at 5500?",
        check: {
          question: "Why?",
          choices: [
            "Your API is broken",
            "The page came from Live Server, so /api/snacks asked Live Server. It has no /api, so it answered with an HTML 'not found' page, which isn't JSON. Open the page at localhost:8080",
            "Live Server is too slow",
          ],
          answer: 1,
          explain: "From today, pages that use your API are tested at localhost:8080 only. Live Server is still fine for pages that don't fetch.",
        },
      },
      {
        task: "Before the lab, one fix. Restart your app, open localhost:8080/menu.html and look at the prices. If they read  â‚±15  instead of  ₱15  (or the order page's receipt shows  Ã—  instead of  ×), do this: in EVERY .html file in static/ (index, menu, order, tables), add this line right after the  <head>  line, save, and reload. If your prices look right already, add the line anyway: it can't hurt.",
        code: "<meta charset=\"utf-8\">",
        hint: "Each file has one <head> line. Press Enter after it and type the new line, indented like the others. Each page needs it once; it covers that page's .js file too.",
        check: {
          question: "Why did ₱ turn into â‚± at localhost:8080 when it looked right in Live Server?",
          choices: [
            "Your Java changed the text",
            "Your files are saved as UTF-8, but your app doesn't say so when it sends them, so the browser guesses an older encoding and misreads the ₱. <meta charset=\"utf-8\"> tells it",
            "The ₱ key is broken",
          ],
          answer: 1,
          explain: "Live Server announces UTF-8 with every file; your Spring app doesn't, so each page says it for itself. A page's .js files follow the page.",
        },
      },
      {
        task: "One more fix, so your pages show your edits. Open src/main/resources/application.properties (the file that has  spring.web.error.include-message=always ). On a new line right under that line, type the line below, save, and restart your app. Then open localhost:8080/menu.html, then order.html, then tables.html, and press Ctrl+Shift+R once on each.",
        code: "spring.web.resources.cache.period=0",
        hint: "Plain text, no spaces around the =, and it goes in application.properties, not in a .java file. If the include-message line isn't in that file, type both lines. Ctrl+Shift+R means 'reload and ignore what you kept': it throws away the copies of menu.js, order.js and tables.js that your browser already saved.",
        check: {
          question: "Later today you edit order.js, restart your app and press F5, but the page behaves exactly as before, even though your code is right. What is the likely reason?",
          choices: [
            "Java is broken",
            "The browser kept a saved copy of order.js and didn't ask your app for the new one. Ctrl+Shift+R forces it to ask",
            "F5 doesn't work with VS Code",
          ],
          answer: 1,
          explain: "Your app sends each file with the date it was last changed, and browsers may keep such a file for a while without asking again. The line you just added tells the browser not to keep your app's files, so every load asks. If a page ever ignores an edit, Ctrl+Shift+R is the first thing to try.",
        },
      },
      {
        task: "Later today the canteen staff get a page of their own. Your app already lists every order at /api/orders. Staff will also want ONE order by its number, and the day's totals.",
        hint: "Tuesday's /api/snacks/2 named one snack with a number in the address. How would you name order 2?",
        check: {
          question: "Which address fits \"order number 2\", the same way /api/snacks/2 fits \"snack number 2\"?",
          choices: [
            "/api/orders?number=all",
            "/api/orders/2, with a path variable, so the method needs @PathVariable int id",
            "/api/order.html",
          ],
          answer: 1,
          explain: "The number in the address names ONE thing: a path variable. You'll write exactly that method this afternoon.",
        },
      },
    ],
  },
  videos: [],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: the menu and the order form use your API",
      intro:
        "Two small changes in menu.js, one changed listener in order.js. Test every page at localhost:8080, with your app running, never in Live Server.",
      missions: [
        {
          task: "Open static/menu.js. Delete the whole snacks array, from  const snacks = [  down to its  ];,  and type this one line in its place:",
          code: "let snacks = [];",
          hint: "let, not const, because the fetch fills it later. If your menu.js still has the console.log lines from Week 6's video, delete them too: they'd now print an empty list.",
          check: {
            question: "Why an empty list to start with?",
            choices: [
              "To make the file shorter",
              "The snacks arrive from your app a moment after the page loads. Until then the list is empty; the fetch fills it",
              "Arrays must start empty",
            ],
            answer: 1,
            explain: "And the search keeps working, because it filters whatever snacks holds by then.",
          },
        },
        {
          task: "Find the line  showSnacks(snacks);  (just below the showSnacks function, above const search). Delete it and type this in its place:",
          code: MENU_FETCH,
          hint: "It's the same shape as Week 6's tables.js: fetch, then turn the answer into an array, then use it. Here, use it means: keep it in snacks, then draw it.",
          check: {
            question: "Why is showSnacks(snacks) now inside .then(…)?",
            choices: [
              "It looks neater",
              "fetch only asks. The answer arrives later, and the code inside .then runs when it's here. Drawing before that would draw an empty list",
              "showSnacks only works inside fetch",
            ],
            answer: 1,
            explain: "Week 6 Day 5's lesson, now with your own Java on the other end.",
          },
        },
        {
          task: "Restart your app, open localhost:8080/menu.html, and press F12 → Network. Reload (F5) and find the row named snacks.",
          hint: "If the menu is empty, read the console first. A red error about JSON means the page isn't at localhost:8080; 'Failed to fetch' means the app isn't running. A red favicon.ico 404 is harmless: the browser always asks for a tab icon, and it isn't your bug. A page that didn't change after an edit? Press Ctrl+Shift+R.",
          check: {
            question: "The Network tab shows the requests your page made, including menu.js (a file) and snacks. What answered snacks?",
            choices: [
              "A file called snacks in static/",
              "Your SnackController's listSnacks method, as JSON with status 200",
              "Live Server",
            ],
            answer: 1,
            explain: "Your menu now shows whatever your Java says. Change a price in SnackController, restart, reload: the menu follows.",
          },
        },
        {
          task: "Now the order form. Open static/order.js and find the submit listener (it starts with  form.addEventListener(\"submit\")). Delete the whole listener, down to its  });,  and type this in its place:",
          code: SUBMIT_LISTENER,
          hint:
            "It's Wednesday's console line inside the listener. When the answer arrives, response.json() reads it. If response.ok, the receipt shows the APP's order: its number, name and total. Otherwise it shows the app's error message. The New order button and the total stay as they were.",
          check: {
            question: "The receipt now says  Order 1: 2 × Kwek-kwek = ₱40.  Where did the 40 come from?",
            choices: [
              "From prices in order.js",
              "From your app's answer, data.total, worked out by your Java with its own prices",
              "From the HTML",
            ],
            answer: 1,
            explain: "The total under the form is still the browser's estimate. The receipt is the app's word.",
          },
        },
        {
          task: "Restart, open localhost:8080/order.html and place an order. Then break it on purpose: in order.html, delete min=\"1\" from the qty box, save, restart, type 0 and place the order. Then put min=\"1\" back and save.",
          hint: "Without min, the browser lets 0 through, so your app's check is what answers. A page that didn't change after an edit? Press Ctrl+Shift+R.",
          check: {
            question: "The receipt said  Sorry: qty must be from 1 to 20.  Where did those words come from?",
            choices: [
              "From order.js",
              "From your Java's ResponseStatusException, through the error JSON's message, into the receipt",
              "From the browser",
            ],
            answer: 1,
            explain: "Thursday's message, written for the customer, reaching the customer. That's why messages are written in plain words.",
          },
        },
        {
          task: "Compare your two files with these, line by line, and fix any difference. menu.js first, then order.js. Blank lines don't matter; everything else should match.",
          code: `${MENU_JS}\n\n// ---- order.js ----\n\n${ORDER_JS}`,
          hint: "In menu.js, the only changes from Week 6 are the first line and the fetch. In order.js, only the submit listener changed.",
        },
        {
          task: "Add today to notes.md: which page calls which endpoint, why the pages only work at localhost:8080 now, and where the receipt's total comes from.",
          hint: "One line per page: menu.html → GET /api/snacks, and so on.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-menu-api",
      fileName: "menu.html",
      scriptFile: "menu.js",
      api: "canteen",
      title: "🧪 Checkpoint: the menu loads from the API",
      intro:
        "Paste menu.html and menu.js. In this checker, /api/… is answered like your own app answers it, and the console shows every call your page makes, like → GET /api/snacks · 200.",
      starter: "<!-- Delete this line, then paste your whole menu.html from VS Code here -->\n",
      script: "// Delete this line, then paste your whole menu.js from VS Code here\n",
      tasks: [
        {
          goal: "The menu is built from your app's answer: the page fetches /api/snacks and shows a row per snack.",
          checks: [
            { selector: "table tbody#menu-rows", message: "The top box doesn't have your menu.html with its <tbody id=\"menu-rows\"> yet. Paste your whole menu.html." },
            {
              log: "→ GET /api/snacks · 200",
              message: "Your page never asked for /api/snacks. Replace showSnacks(snacks); with the fetch(\"/api/snacks\") block from the lab.",
            },
            {
              selector: "#menu-rows tr",
              exact: 6,
              message: "#menu-rows should show the six snacks from the API. None? Is showSnacks(snacks) inside the .then? Read the console under the preview.",
            },
          ],
          hint: "let snacks = []; at the top, and fetch(\"/api/snacks\").then(response => response.json()).then(data => { snacks = data; showSnacks(snacks); });",
          solution: MENU_FETCH,
          explain: "The menu shows what the API says. In your own app, that's your Java.",
        },
        {
          goal: "The search still works on the fetched snacks.",
          actions: [{ action: "type", target: "#search", value: "tur" }],
          checks: [
            {
              selector: "#menu-rows tr",
              exact: 1,
              message: "After typing tur, one row should be left. If none are, the search filters an empty list: snacks = data; must come before showSnacks(snacks) inside the .then.",
            },
          ],
          hint: "The search filters snacks, so snacks must hold the fetched list: snacks = data;",
          solution: "snacks = data;\nshowSnacks(snacks);",
          explain: "Week 6's search, unchanged, now searching your API's menu.",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-order-api",
      fileName: "order.html",
      scriptFile: "order.js",
      api: "canteen",
      title: "🧪 Checkpoint: the order goes to the API",
      intro:
        "Paste order.html, style.css and order.js. The checker places an order the way a customer would, and its console shows the call your page makes.",
      starter: "<!-- Delete this line, then paste your whole order.html from VS Code here -->\n",
      stylesheet: "/* Delete this line, then paste your whole style.css from VS Code here */\n",
      script: "// Delete this line, then paste your whole order.js from VS Code here\n",
      tasks: [
        {
          goal: "Placing 2 Kwek-kwek sends the order to /api/orders and gets 201 back.",
          actions: [
            { action: "choose", target: "#snack", value: "3" },
            { action: "type", target: "#qty", value: "2" },
            { action: "submit", target: "#order-form" },
          ],
          checks: [
            { selector: "form#order-form #qty", message: "The top box doesn't have your order form yet. Paste your whole order.html." },
            {
              log: "→ POST /api/orders · 201",
              message: "Your page didn't get a 201 from POST /api/orders. Read the console under the preview: · 415 means the headers part is missing; · 400 usually means the body isn't JSON.stringify(order); no POST line at all means the fetch isn't in your submit listener yet.",
            },
          ],
          hint: "Inside the submit listener, after event.preventDefault(): fetch(\"/api/orders\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify(order) })",
          solution: "fetch(\"/api/orders\", {\n  method: \"POST\",\n  headers: { \"Content-Type\": \"application/json\" },\n  body: JSON.stringify(order)\n})",
          explain: "Week 6's order, finally delivered.",
        },
        {
          goal: "The receipt shows the app's answer: its order number, the snack and its total.",
          actions: [
            { action: "choose", target: "#snack", value: "3" },
            { action: "type", target: "#qty", value: "2" },
            { action: "submit", target: "#order-form" },
          ],
          checks: [
            {
              selector: "#receipt",
              cssNot: { property: "display", value: "none" },
              message: "The receipt stays hidden. Show it inside the .then, after the receipt text is written: receipt.style.display = \"block\";",
            },
            {
              selector: "#receipt-text",
              text: "Order 1",
              message: "The receipt should start with the app's order number: `Order ${data.order_id}: …`. It comes from the app's answer, not from order.js.",
            },
            { selector: "#receipt-text", text: "40", message: "The receipt should show the app's total, data.total, which is 40 for 2 Kwek-kwek." },
          ],
          hint: "response.json().then(data => { if (response.ok) { …textContent = `Order ${data.order_id}: ${data.qty} × ${data.name} = ₱${data.total}`; } … receipt.style.display = \"block\"; })",
          solution: SUBMIT_LISTENER,
          explain: "The customer's receipt is now your Java's answer, order number and all.",
        },
      ],
    },
    {
      kind: "quest",
      id: "twist-rows",
      inline: true,
      title: "🛠️ Your own endpoint: /api/rows",
      intro:
        "Last week tables.js loaded your Week 3 sample rows from rows.json, a file you typed. Today they come from an endpoint only your app has.",
      missions: [
        {
          task: "Create RowsController.java in the folder with CanteenWebApplication.java (press Escape and delete everything VS Code fills in; line 1 is the package line copied from CanteenWebApplication.java). Type this, then change it to YOUR rows: the record's fields get the same names as the keys in your rows.json, and the new Row(…) lines get your rows' values.",
          code: ROWS_CONTROLLER,
          hint:
            "Open rows.json beside it. If your rows.json has { \"title\": …, \"borrower\": … }, the record is Row(String title, String borrower). Types: anything in quotes (dates too) is String; a whole number is int; a number with a dot (12.50) is double; true/false is boolean. Keep at least three rows. Don't use @GetMapping(\"/\")! A key in rows.json that isn't a valid Java name (it has a space, like \"due date\", or starts with a digit)? Rename it in rows.json AND in the record (dueDate): tables.js shows whatever the keys are. And 12.50 comes back as 12.5, because a double has no trailing zero: that's fine.",
          check: {
            question: "Your rows.json had the key \"borrower\". What must the record's field be called?",
            choices: [
              "Borrower",
              "borrower, exactly, because the field name becomes the JSON key, and tables.js builds its headings from the keys",
              "Any name",
            ],
            answer: 1,
            explain: "Same rule as Snack: the field name IS the key.",
          },
        },
        {
          task: "In static/tables.js, change the first line  fetch(\"rows.json\")  to  fetch(\"/api/rows\").  Nothing else changes. Restart and open localhost:8080/tables.html.",
          hint: "Your sample table should look exactly like last week's. If it's empty, open localhost:8080/api/rows first: does your app answer there?",
          check: {
            question: "Why didn't anything else in tables.js need to change?",
            choices: [
              "Luck",
              "tables.js builds the table from whatever array of objects it receives. A file and your endpoint answer with the same shape of JSON",
              "/api/rows reads rows.json",
            ],
            answer: 1,
            explain: "Exactly what Week 6 promised: when your API exists, only the address in fetch() changes.",
          },
        },
        {
          task: "Paste your RowsController.java, and the JSON your app answers at localhost:8080/api/rows.",
          hint: "Copy the file from VS Code, and the JSON with Ctrl+A, Ctrl+C from the browser.",
          input: "Paste RowsController.java and the JSON from /api/rows",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-rows",
      title: "🧪 Checkpoint: /api/rows",
      intro: "Open localhost:8080/api/rows with your app running, copy everything and paste it here.",
      tasks: [
        {
          goal: "Paste what your app answers at /api/rows.",
          url: "localhost:8080/api/rows",
          checks: [
            { is: "array", message: "This should be a list of rows, starting with [. Your method should return List<Row>." },
            { min: 3, message: "Fewer than three rows. Add more new Row(…) lines to List.of(…), with a comma between them." },
            { path: "0", is: "object", message: "Each row should be an object, { … }, made from your Row record." },
          ],
          hint: "A Whitelabel 404? Check RowsController is in the folder with CanteenWebApplication.java, has @RestController, says @GetMapping(\"/api/rows\"), and that you restarted.",
          solution: ROWS_CONTROLLER,
          example:
            '[{"title":"Noli Me Tangere","borrower":"Ana Reyes"},{"title":"El Filibusterismo","borrower":"Ben Cruz"},{"title":"Florante at Laura","borrower":"Ana Reyes"}]',
          explain: "Your own tables' rows, answered by your own Java. Next week they come from your Week 3 tables in MySQL.",
        },
      ],
    },
    {
      kind: "quest",
      id: "lab-one-price-list",
      inline: true,
      title: "🛠️ Part 2 · Lab: one price list",
      intro:
        "Part 2: the counter's side. Your customer pages work. Now the canteen staff get theirs. First, a fix. order.js still has its own typed price list (const prices = …), and order.html has six typed drop-down options. So the canteen's prices now live in two places: in your Java, and in your page. If your Java says Turon costs ₱13, the total under the form still says ₱12 while the receipt says ₱13. In this lab the drop-down and the total both come from /api/snacks, so there is one price list, in Java, and next week in MySQL.",
      missions: [
        {
          task: "Predict first, then try it. In SnackController.java, change Turon's price from 12 to 13 (the line  new Snack(2, \"Turon\", 12),). Before you test, decide: what will the total under the form say for 1 Turon, and what will the receipt say? Restart, open localhost:8080/order.html, choose Turon, quantity 1, and press Place order. Then put it back: change 13 to 12 again, save, and restart.",
          hint: "The total under the form is worked out by order.js. The receipt is your Java's answer. Which of them knows about the 13?",
          check: {
            question: "The total under the form said ₱12 but the receipt said ₱13. Why do they disagree?",
            choices: [
              "The browser rounds prices",
              "order.js has its own typed price list, still saying 12. Only the receipt comes from your Java, which now says 13. Two price lists, two answers",
              "The receipt is wrong: it should say 12",
            ],
            answer: 1,
            explain: "That's the bug this lab removes. A price should live in exactly one place.",
          },
        },
        {
          task: "Open static/order.js. Find the line that starts  const prices =  and the line  showTotal();  that comes a few lines below it (right after the showTotal function, above  snack.addEventListener(\"change\", showTotal);). Delete everything from  const prices  down to and including that  showTotal();  line, and type this in its place. Save, and don't test yet:",
          code: ORDER_STATE_V2,
          hint:
            "You're replacing the typed prices, the two const lines and the showTotal function in one go, so the file is never half-changed. Number(snack.value) turns the option's text \"3\" into the number 3, because === is strict (Week 6 Day 1). If the console later says  prices is not defined,  press Ctrl+F in order.js, search for prices, and delete or change any line still using it (it's left over from a Week 6 idea). If you open order.html now, the total under the form is empty and there's no red error: expected until the next step.",
          check: {
            question: "Right after the page loads, snacks is still an empty list when  showTotal();  runs. So why is there an  if (matches.length > 0)  in showTotal?",
            choices: [
              "Without it, the first showTotal(); finds no snack and  matches[0].price  fails (or shows ₱NaN). With it, showTotal does nothing until the snacks have arrived",
              "Java requires every function to have an if",
              "To stop the customer ordering twice",
            ],
            answer: 0,
            explain: "The snacks arrive a moment after the page loads. Code that runs before then has to cope with an empty list. filter keeps only the snack whose snack_id matches the chosen option, and an empty list keeps nothing.",
          },
        },
        {
          task: "Still in order.js, find the line  showTotal();  you just typed. Press Enter after it and type this block, with an empty line above it. Put it exactly there, so your file matches the comparison at the end of this lab. (The .then part runs after the answer arrives, once the whole file has been read, so the spot isn't what makes it work; it is just where the model has it.) Save:",
          code: ORDER_OPTIONS_FETCH,
          hint:
            "Same shape as menu.js: fetch, turn the answer into an array, then use it. Here, use it means: keep it in snacks, build one <option> per snack and add it to the drop-down, then call showTotal() to show the first snack's total. The .then callback runs later, when the answer is here. Never call the loop variable snack: that name already belongs to the drop-down.",
          check: {
            question: "The loop says  for (const item of snacks)  and not  for (const snack of snacks).  What would go wrong with  snack?",
            choices: [
              "Nothing: any name works",
              "snack is already the drop-down (const snack = document.getElementById(\"snack\")). A loop variable called snack hides it, so snack.append(option) would be called on a snack object from the list and fail",
              "for loops can't use the word snack",
            ],
            answer: 1,
            explain: "Two things with one name: the later one wins inside the loop. Give the loop variable its own name, item.",
          },
        },
        {
          task: "Restart the app and open localhost:8080/order.html. Click the drop-down. You'll see more entries than before: your typed snacks, and then the six from your app, each with its price in the text. Choose Kwek-kwek from the ones with a price, set 2, and look at the total.",
          hint: "If the drop-down only shows your typed snacks, open F12 → Console: a red error will say what's wrong. 'Failed to fetch' means the app isn't running; 'something is not defined' means a name is spelled differently from where it was created, or its line was deleted: compare with the model in the last mission of this lab. No red error and nothing changed? Press Ctrl+Shift+R.",
          check: {
            question: "Why does the drop-down have each snack twice?",
            choices: [
              "The API sends every snack twice",
              "The typed <option> lines are still in order.html, and the script ADDS six more from the API after them",
              "Browsers repeat options on purpose",
            ],
            answer: 1,
            explain: "The script adds to the drop-down; it doesn't replace what's already there. Next step: remove the typed ones.",
          },
        },
        {
          task: "Now remove the typed options. Open static/order.html and find your drop-down:  <select id=\"snack\" …>  Delete everything between the end of that tag and the closing  </select>  (your  <option …>  lines, however many you typed), so the two tags touch. Keep the select's own attributes. It should look like this (if your select has the same id and name attributes in another order, keep yours). Save, restart, reload:",
          code: ORDER_SELECT_V2,
          hint:
            "Delete from the > that ends the opening <select …> tag up to (not including) the < of </select>. In VS Code: click just after that >, hold Shift, click just before </select>, press Delete. The label above and the qty box below stay untouched.",
          check: {
            question: "Why is it good that the six snacks no longer appear in order.html?",
            choices: [
              "The page loads faster",
              "Now the only place that lists the snacks, with their names and prices, is your Java",
              "HTML can't hold more than three options",
            ],
            answer: 1,
            explain: "Add a snack in SnackController and the order form shows it, without touching order.html or order.js.",
          },
        },
        {
          task: "The payoff. In SnackController.java change Turon's price to 13 again, restart, and open localhost:8080/order.html. Look at the drop-down text for Turon, choose it with quantity 1 and look at the total, then press Place order and look at the receipt. Then put 12 back, save, and restart.",
          hint: "All three should say 13 now. If the total still says 12, the old const prices is still in your order.js: re-check the second mission.",
          check: {
            question: "Where is Turon's price kept now?",
            choices: [
              "In three places: the drop-down, the total and the receipt",
              "Only in SnackController.java. The drop-down, the total and the receipt all read it from there",
              "In order.js",
            ],
            answer: 1,
            explain: "One price list. Next week it moves from a Java list into MySQL, and the form follows it without changes.",
          },
        },
        {
          task: "Compare with these, line by line, and fix any difference. First your whole order.js, then the drop-down part of your order.html (the  <select …></select>  with nothing between the tags). Blank lines don't matter; everything else should match.",
          code: `${ORDER_JS_V2}\n\n// ---- the drop-down in order.html ----\n\n${ORDER_SELECT_V2}`,
          hint: "Compared with this morning's order.js, three things changed: prices became let snacks = [], showTotal looks in snacks, and the fetch block is new. The submit listener at the bottom didn't change.",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-order-options",
      fileName: "order.html",
      scriptFile: "order.js",
      api: "canteen",
      title: "🧪 Checkpoint: the drop-down comes from the API",
      intro:
        "Paste order.html, style.css and order.js. The checker serves /api/… like your own app does, picks snacks and places an order the way a customer would, and its console shows each call your page makes.",
      starter: "<!-- Delete this line, then paste your whole order.html from VS Code here -->\n",
      stylesheet: "/* Delete this line, then paste your whole style.css from VS Code here */\n",
      script: "// Delete this line, then paste your whole order.js from VS Code here\n",
      tasks: [
        {
          goal: "The typed snacks are gone from order.html, and the page asks the API for its snacks.",
          checks: [
            { selector: "select#snack", message: "The top box doesn't have your order.html with its <select id=\"snack\"> yet. Paste your whole order.html." },
            {
              selector: "#snack option",
              source: true,
              exact: 0,
              message: "order.html still has typed <option> lines inside the drop-down. Delete them, so the tags touch:  <select id=\"snack\" name=\"snack_id\"></select>  The script builds the options.",
            },
            {
              log: "→ GET /api/snacks · 200",
              message: "Your page never asked for /api/snacks. Add the fetch(\"/api/snacks\") block from the lab to order.js, below the showTotal function. If the console under the preview shows a red error from the first lines of order.js, fix that first: showTotal(); runs before the snacks arrive, so showTotal must check that it found a snack (the if (matches.length > 0) part) before using its price.",
            },
          ],
          hint: "In order.html:  <select id=\"snack\" name=\"snack_id\"></select>  with nothing between the tags. In order.js: fetch(\"/api/snacks\").then(response => response.json()).then(data => { … });",
          solution: `${ORDER_SELECT_V2}\n\n// and in order.js, below the showTotal function:\n${ORDER_OPTIONS_FETCH}`,
          explain: "The snack list is no longer written in the page: it's whatever your Java says.",
        },
        {
          goal: "The script builds one option per snack, and each option's value is the snack's snack_id.",
          checks: [
            {
              selector: "#snack option",
              exact: 6,
              message: "The drop-down should have the six snacks from the API. None? Is the loop inside the .then, after snacks = data? A loop variable called snack hides the drop-down: it must be item. Read the console under the preview: a red 'snack.append is not a function' is that mistake.",
            },
            {
              selector: "#snack option",
              text: "Kwek-kwek",
              attr: { name: "value", value: "3" },
              message: "Some option should say Kwek-kwek and have value=\"3\". Set  option.value = item.snack_id;  and  option.textContent = `${item.name} — ₱${item.price}`;",
            },
          ],
          hint: "Inside the loop:  const option = document.createElement(\"option\");  option.value = item.snack_id;  option.textContent = …;  snack.append(option);  A loop variable called snack hides the drop-down: use item.",
          solution: "for (const item of snacks) {\n  const option = document.createElement(\"option\");\n  option.value = item.snack_id;\n  option.textContent = `${item.name} — ₱${item.price}`;\n  snack.append(option);\n}",
          explain: "The text is what the customer sees; the value is what the script (and later the order) uses. Same rule as Week 5.",
        },
        {
          goal: "The total shows by itself as soon as the snacks have arrived: the first snack, Banana cue, is chosen, and its total is ₱15.",
          checks: [
            { selector: "#total", text: "15", message: "Right after the snacks arrive, #total should show the first snack's total (Banana cue, ₱15). Call showTotal(); inside the .then, after the loop that adds the options. Already there? Then showTotal finds no snack: compare with Number(snack.value), because an option's value is text and === never says 1 equals \"1\"." },
          ],
          hint: "The first showTotal(); at the top ran too early, with no snacks, and showed nothing. Once the options exist, call showTotal() again from inside the .then.",
          solution: "    showTotal();\n  })",
          explain: "The first showTotal() had nothing to show; this second call, after the snacks arrived, fills in the total.",
        },
        {
          goal: "The total comes from the fetched prices: choosing Kwek-kwek and typing 2 shows ₱40, and never NaN or undefined.",
          actions: [
            { action: "choose", target: "#snack", value: "3" },
            { action: "type", target: "#qty", value: "2" },
          ],
          checks: [
            {
              scriptNot: "prices",
              message: "order.js still has this morning's typed price list (prices). The API's prices happen to be the same today, so the page looks right, but that's two price lists again. Delete  const prices = { … };  and make showTotal look the price up in snacks.",
            },
            { selector: "#total", textNot: "NaN", message: "The total says NaN. showTotal is still using the old typed prices, or a price came out missing. Look the price up in snacks." },
            { selector: "#total", textNot: "undefined", message: "The total says undefined: the price wasn't found. showTotal should use the snack from snacks whose snack_id matches the chosen option." },
            { selector: "#total", text: "40", message: "The total should show ₱40 for 2 Kwek-kwek (20 × 2), worked out from the price the API sent. Is showTotal() called inside the .then, and does it multiply by Number(qty.value)? Does the filter compare with Number(snack.value)? An option's value is text, and === never says 3 equals \"3\"." },
          ],
          hint: "const matches = snacks.filter(item => item.snack_id === Number(snack.value));  if (matches.length > 0) { … matches[0].price * count … }",
          solution: ORDER_STATE_V2,
          explain: "Before the answer arrives there's nothing to show, so the guard keeps the total empty instead of broken.",
        },
        {
          goal: "Ordering still works: 2 Kwek-kwek is sent to /api/orders and the receipt shows the app's total.",
          actions: [
            { action: "choose", target: "#snack", value: "3" },
            { action: "type", target: "#qty", value: "2" },
            { action: "submit", target: "#order-form" },
          ],
          checks: [
            {
              log: "→ POST /api/orders · 201",
              message: "The order didn't get a 201 from POST /api/orders. Did the submit listener change? It should be exactly the one from this morning's lab. Read the console under the preview.",
            },
            { selector: "#receipt-text", text: "40", message: "The receipt should show the app's total, 40. Is the submit listener from this morning still at the bottom of order.js?" },
          ],
          hint: "Nothing here should have changed: the submit listener is this morning's, and now the drop-down it reads is built by the script.",
          solution: SUBMIT_LISTENER,
          explain: "The drop-down is new, the order is not. Both halves still work together.",
        },
      ],
    },
    {
      kind: "quest",
      id: "lab-order-endpoints",
      inline: true,
      title: "🛠️ Lab: two endpoints for the counter",
      intro:
        "The canteen staff need two things your app can't answer yet: one order by its number, and the day's totals. One new record file and two new methods. Like Day 3, the new file goes in the folder with CanteenWebApplication.java, and line 1 is the package line copied from CanteenWebApplication.java. Restart after each Java change.",
      missions: [
        {
          task: "Create Summary.java (right-click the folder → New File → Summary.java). Press Escape and delete everything VS Code fills in, paste the package line from CanteenWebApplication.java as line 1, then type:",
          code: SUMMARY_RECORD,
          hint: "Same rule as Snack and Order: the field names ARE the JSON keys, with the underscore, exactly as written. total_orders is how many orders; total_sales is the pesos they add up to.",
          check: {
            question: "What will the JSON of a Summary look like?",
            choices: [
              "{\"total_orders\":2,\"total_sales\":52}",
              "{\"totalOrders\":2,\"totalSales\":52}",
              "[2,52]",
            ],
            answer: 0,
            explain: "A record turns into one JSON object whose keys are the field names. That's why Week 6's pages could read snack_id straight from your API.",
          },
        },
        {
          task: "In SnackController.java, find the very last  }  of the file (below placeOrder). Just ABOVE it, type this method. It adds nothing to the imports: HttpStatus, PathVariable and ResponseStatusException are already imported:",
          code: indent(GET_ORDER),
          hint:
            "Look at your getSnack method from Tuesday. This is the same shape: a loop over a list, a return inside the if, and the throw after the loop for when nothing matched. o.order_id() == id compares the order's number with the 2 in the address.",
          check: {
            question: "Which method you already wrote has the same shape as getOrder?",
            choices: [
              "listOrders",
              "placeOrder",
              "getSnack: a loop that returns the match, and a throw with a 404 after the loop",
            ],
            answer: 2,
            explain: "Same loop, same ResponseStatusException, different list. Once you can write one 'find by id', you can write them all.",
          },
        },
        {
          task: "Still in SnackController.java, above that last  }  and below getOrder, type the second method:",
          code: indent(GET_SUMMARY),
          hint: "It starts at 0 and, for each order in the list, adds that order's total to sales. The list is still in memory, so the answer is worked out fresh on every request.",
          check: {
            question: "Where do total_orders and total_sales come from?",
            choices: [
              "They're stored in two variables that placeOrder updates",
              "orders.size(), and a loop that adds up every order's total(), worked out each time someone asks",
              "From MySQL",
            ],
            answer: 1,
            explain: "Nothing extra to keep in sync: the summary is computed from the orders themselves. Next week the same numbers come from a SQL SUM.",
          },
        },
        {
          task: "Restart the app and open localhost:8080/api/summary in a browser tab. You should see {\"total_orders\":0,\"total_sales\":0}.",
          hint: "A Whitelabel page saying 'No static resource api/summary' means Spring hasn't found the method: check the spelling of @GetMapping(\"/api/summary\"), and that you restarted. Red underlines in VS Code usually mean Summary.java is missing its package line.",
          check: {
            question: "There are no orders yet. Why does it answer zeros instead of an error?",
            choices: [
              "Zero orders is a correct answer: orders.size() is 0 and the loop adds nothing",
              "Because the app crashed",
              "Spring fills in zeros when a request is wrong",
            ],
            answer: 0,
            explain: "An empty answer is still an answer, like a SELECT that returns 0 rows. Compare 404, which is for a thing that doesn't exist.",
          },
        },
        {
          task: "Place exactly two orders from the order form: open localhost:8080/order.html, choose Kwek-kwek, quantity 2, press Place order; press New order, choose Turon, quantity 1, press Place order. The receipts should say  Order 1: 2 × Kwek-kwek = ₱40  and  Order 2: 1 × Turon = ₱12.  Then reload localhost:8080/api/summary.",
          hint: "A different total for Turon means its price in SnackController isn't 12: fix it, restart, and start these two orders again. Ordered extra by accident? Restart the app (the orders empty) and place just these two.",
          check: {
            question: "What does /api/summary answer now?",
            choices: [
              "{\"total_orders\":52,\"total_sales\":2}",
              "{\"total_orders\":3,\"total_sales\":52}",
              "{\"total_orders\":2,\"total_sales\":52}",
            ],
            answer: 2,
            explain: "Two orders, ₱40 + ₱12. The order form you fixed this morning is now a way to test your own Java.",
          },
        },
        {
          task: "Open localhost:8080/api/orders/2, then localhost:8080/api/orders/1, one at a time, and look at each answer.",
          hint: "Compare each answer with the list at localhost:8080/api/orders. The number in the address is an order number, not a snack number.",
          check: {
            question: "getOrder is given the 1 from /api/orders/1. Which field of each order does it compare with that 1?",
            choices: [
              "snack_id",
              "order_id",
              "qty",
            ],
            answer: 1,
            explain: "o.order_id() == id. Be careful: /api/snacks/2 and /api/orders/2 can both be Turon today, by coincidence. They are different lists with different numbers.",
          },
        },
        {
          task: "A browser tab shows errors as a web page, so use the console. On localhost:8080/order.html press F12 → Console, type this one line and press Enter. It prints the answer for an order that doesn't exist, and copies it:",
          code: "fetch(\"/api/orders/99\").then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)",
          hint: "If you paste it and the browser warns you, type  allow pasting  and press Enter, then paste again. Chrome also prints its own red line for the 404: that's the browser reporting the status, not a mistake in your code.",
          check: {
            question: "It answered status 404 with 'No order with id 99'. Why 404 and not 400?",
            choices: [
              "400 means the request was malformed; this one was fine, there just isn't an order 99, which is 404's job",
              "Because Spring always uses 404 for numbers",
              "Because 99 is too large",
            ],
            answer: 0,
            explain: "400: 'your request is wrong'. 404: 'your request is fine, but that thing doesn't exist'. The same split you used on Tuesday for snacks.",
          },
        },
        {
          task: "Press ↑ in the console to get that line back, change 99 to abc and run it again.",
          hint: "The answer has a status and a long message mentioning 'Failed to convert'. Compare it with what localhost:8080/api/snacks/abc gave you on Tuesday.",
          check: {
            question: "It answered 400, but your getOrder has no line about abc. Who answered?",
            choices: [
              "Spring itself: it couldn't turn the text abc into the int id your method asked for, so your method never ran",
              "Your throw at the end of getOrder",
              "The browser",
            ],
            answer: 0,
            explain: "@PathVariable int id makes Spring convert the text first. A conversion that fails is a 400 before your code runs.",
          },
        },
        {
          task: "Compare your files with these, line by line (line 1 of Summary.java is your package line), and fix any difference: Summary.java, then the whole SnackController.java. Order.java and OrderRequest.java don't change today. Blank lines and the order of the import lines don't matter; everything else should match.",
          code: `${SUMMARY_RECORD}\n\n// ---- SnackController.java ----\n\n${WHOLE_CONTROLLER_W7D5}`,
          hint: "The only differences from Thursday's file: getOrder and summary, both above the last }, and no new imports.",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-order-endpoints",
      title: "🧪 Checkpoint: the counter's endpoints",
      intro:
        "Restart your app first, so the orders start empty. Then place exactly two orders from localhost:8080/order.html: 2 Kwek-kwek, then 1 Turon. Each answer below comes from your running app.",
      tasks: [
        {
          goal: "Open localhost:8080/api/summary, select everything (Ctrl+A), copy (Ctrl+C) and paste the answer here.",
          url: "localhost:8080/api/summary",
          checks: [
            { is: "object", message: "This should be one object, starting with {. Your method should return a Summary, not a list." },
            { keys: ["total_orders", "total_sales"], message: "The answer needs total_orders and total_sales: the fields of record Summary. Check the spelling, with the underscores." },
            { types: { total_orders: "number", total_sales: "number" }, message: "Both should be numbers, without quotes. In Summary.java they should be int." },
            { path: "total_orders", equals: 2, message: "total_orders should be 2: the Kwek-kwek order and the Turon order. Restarted since? Did you place exactly two orders?" },
            { path: "total_sales", equals: 52, message: "total_sales should be 52 (40 + 12). Does the loop add every order's total() to sales? Is Turon's price 12?" },
          ],
          hint: "int sales = 0; for (Order o : orders) { sales = sales + o.total(); } return new Summary(orders.size(), sales);",
          solution: `${SUMMARY_RECORD}\n\n// and in SnackController.java:\n${GET_SUMMARY}`,
          example: '{"total_orders":2,"total_sales":52}',
          explain: "The day's totals, worked out by your Java from the orders it holds.",
        },
        {
          goal: "Open localhost:8080/api/orders/2, select everything (Ctrl+A), copy (Ctrl+C) and paste the answer here.",
          url: "localhost:8080/api/orders/2",
          checks: [
            { is: "object", message: "This should be one order, starting with {. A list means the address is /api/orders, not /api/orders/2." },
            {
              keys: ["order_id", "snack_id", "name", "qty", "total"],
              message: "The order needs order_id, snack_id, name, qty and total: the fields of record Order. Is getOrder returning the Order from the list?",
            },
            { path: "order_id", equals: 2, message: "order_id should be 2. getOrder should compare o.order_id() with id." },
          ],
          hint: "A Whitelabel 404 saying 'No static resource' means the method isn't found: check @GetMapping(\"/api/orders/{id}\") and that you restarted. A 404 with 'No order with id 2' means the app has fewer than two orders: place them again.",
          solution: GET_ORDER,
          example: '{"order_id":2,"snack_id":2,"name":"Turon","qty":1,"total":12}',
          explain: "One order, found by its number, using the same shape as getSnack.",
        },
        {
          goal: "Ask for an order that doesn't exist. On localhost:8080/order.html, run this line in the console and paste the answer. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          url: "GET localhost:8080/api/orders/99",
          command: "fetch(\"/api/orders/99\").then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)",
          checks: [
            { is: "object", message: "Paste the JSON line, the one that starts with {." },
            { path: "status", equals: 404, message: "The status should be 404. A 200 with nothing, or a 500, means getOrder doesn't throw a ResponseStatusException with HttpStatus.NOT_FOUND after the loop." },
            { path: "message", contains: "No order with id 99", message: "The message should be  No order with id 99,  built as \"No order with id \" + id. No message at all? Check spring.web.error.include-message=always." },
          ],
          hint: "The last line of getOrder: throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No order with id \" + id);",
          solution: "throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No order with id \" + id);",
          example: '{"timestamp":"2026-10-27T16:56:26.969Z","status":404,"error":"Not Found","message":"No order with id 99","path":"/api/orders/99"}',
          explain: "An honest 404 with a plain-words message: exactly what your orders board will show the staff.",
        },
      ],
    },
    {
      kind: "quest",
      id: "lab-orders-board",
      inline: true,
      title: "🛠️ Lab: the orders board",
      intro:
        "A new page for the canteen staff: every order so far, the day's total, a Refresh button, and a box to find one order by its number. It uses all three endpoints: /api/orders, /api/summary and /api/orders/{id}. Same pattern as menu.js: the page is HTML, the rows come from the API. Test every step at localhost:8080, with your app running.",
      missions: [
        {
          task: "Create orders.html inside static/ (right-click the static folder → New File → orders.html), the same folder as menu.html. Type this whole file:",
          code: ORDERS_HTML,
          hint: "It's built like menu.html: the same three links, the <meta charset> line from this morning, a table with a heading row and an empty <tbody>, and the script as the last line of the body. The ids (summary, status, refresh, order-rows, find-form, find-id, found) are what orders.js will look for, so copy them exactly.",
          check: {
            question: "The <tbody id=\"order-rows\"> is empty in the HTML. Where will the rows come from?",
            choices: [
              "From orders.js, which will add one row per order your API returns",
              "From style.css",
              "Browsers fill empty tables by themselves",
            ],
            answer: 0,
            explain: "Just like the menu page: HTML for the frame, JavaScript for what changes.",
          },
        },
        {
          task: "Create orders.js in the same static/ folder. Type these lines first: the three elements the script writes to, and the function that draws a list of orders:",
          code: ORDERS_JS_SHOW,
          hint:
            "It's showSnacks again, with four cells per row instead of two. replaceChildren() empties the table first, so drawing twice never doubles the rows. The last part decides what the status line says: nothing wrong, so empty, or No orders yet. when the list is empty. Test it by hand before the fetch exists: restart, open localhost:8080/orders.html, open F12 → Console and type  showOrders([])  then press Enter.",
          check: {
            question: "In the console you typed  showOrders([])  and the page said  No orders yet.  What would  showOrders(someList)  do if someList had 3 orders?",
            choices: [
              "Show 3 rows and keep the status line empty",
              "Show 3 rows and still say No orders yet.",
              "Show nothing: it only works with an empty list",
            ],
            answer: 0,
            explain: "The if at the end looks at list.length. Try it: showOrders([{order_id: 1, snack_id: 3, name: \"Kwek-kwek\", qty: 2, total: 40}]) draws one row.",
          },
        },
        {
          task: "In orders.js, below showOrders and an empty line, type the function that asks your app for the orders and for the summary. It does not run yet:",
          code: ORDERS_JS_LOAD,
          hint:
            "Two fetches, each the same shape as menu.js. The first hands its answer to showOrders. The second writes a sentence like  3 orders · ₱92 in sales  into the summary line. Each .catch runs when no answer comes at all, for example when the app is switched off.",
          check: {
            question: "This is the first time a failed fetch writes on the PAGE and not only to the console.  Why does it matter?",
            choices: [
              "It doesn't: console.error is enough",
              "A person using the board never opens the console. If the app is off they'd just see an empty board; the message on the page tells them why",
              "Because statusLine is faster than console.error",
            ],
            answer: 1,
            explain: "Errors written for people go on the page. The console is for you. (An empty list and a dead app are different things, and the board now tells them apart.)",
          },
        },
        {
          task: "At the very end of orders.js, below loadOrders and an empty line, type these two statements: run it once when the page opens, and run it again whenever Refresh is pressed. Save, restart, and open localhost:8080/orders.html. Then, in a second tab, open localhost:8080/order.html and place an order. Go back to the orders tab and press Refresh.",
          code: ORDERS_JS_START,
          hint: "At first the board says No orders yet. and the summary says 0 orders · ₱0 in sales. After the order, nothing changes until you press Refresh. Note the difference: loadOrders (no brackets) in addEventListener hands the function over to run on each click; loadOrders(); runs it right now. A page that didn't change after an edit? Press Ctrl+Shift+R.",
          check: {
            question: "You placed an order in the other tab, but the board didn't change until you pressed Refresh. Why?",
            choices: [
              "The board only asks your app when it's told to: once when the page opens, and again on Refresh. Your app can't push news to a page",
              "Refresh sends the order again",
              "The orders were lost",
            ],
            answer: 0,
            explain: "A page only knows what it last asked. Asking again is what Refresh is for.",
          },
        },
        {
          task: "Now break it on purpose: stop your app (the red square in VS Code). On the orders tab press Refresh. Read what the page says. Then start the app again and press Refresh once more.",
          hint: "With the app off, both fetches are refused, so both .catch lines run. The message appears on the page itself, under the title. After you restart, the orders list is empty again. Orders that were on the board before you stopped the app stay visible, because the page only redraws the rows after a successful answer; the message is how you tell the board is out of date.",
          check: {
            question: "The page said  Can't reach the canteen app. Is it running?  What did it actually mean?",
            choices: [
              "Your Java threw an exception",
              "fetch got no answer at all, because nothing was listening on port 8080. That is different from an answer like 404 or 500",
              "The orders were deleted",
            ],
            answer: 1,
            explain: "A 404 or a 500 is an ANSWER (the app is there and says no). No answer at all is the .catch's job.",
          },
        },
        {
          task: "The find box. At the very end of orders.js, below the Refresh listener and an empty line, type:",
          code: ORDERS_JS_FIND,
          hint:
            "Restart your app first (the board starts empty), place two orders, then open the board and type 1 in the box and press Find. Then try 99. It's the same shape as the receipt in order.js: the address is built from what the person typed, response.json() reads the answer, and response.ok decides what to show.",
          check: {
            question: "Why does the listener use  if (response.ok)  and not just show data.name?",
            choices: [
              "For a missing order the app answers with an error object that has no name, so the page would show 'undefined'. response.ok is false there, and data.message is what to show",
              "response.ok makes the request faster",
              "data.name doesn't exist for any order",
            ],
            answer: 0,
            explain: "Thursday's lesson, used for real: 2xx is ok, 4xx and 5xx are not, and the body of an error carries its message.",
          },
        },
        {
          task: "Compare your two files with these, line by line, and fix any difference: orders.html first, then orders.js. Blank lines don't matter; everything else should match.",
          code: `${ORDERS_HTML}\n\n// ---- orders.js ----\n\n${ORDERS_JS}`,
          hint: "Most common differences: an id spelled differently between the two files, the script tag missing at the bottom of the body, or loadOrders(); typed above the function instead of below it.",
        },
        {
          task: "Add today's pages to notes.md: for each of menu.html, order.html and orders.html, one line saying which endpoint(s) it calls and why. Then one line: why the board needs Refresh.",
          hint: "For example: order.html → GET /api/snacks to fill the drop-down, and POST /api/orders to place the order. orders.html calls three.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-orders-board",
      fileName: "orders.html",
      scriptFile: "orders.js",
      api: "canteen",
      title: "🧪 Checkpoint: the orders board",
      intro:
        "Paste orders.html, style.css and orders.js. Some tasks start with orders already placed, and one pretends your app is switched off: each task says so. The console under the preview shows every call your page makes.",
      starter: "<!-- Delete this line, then paste your whole orders.html from VS Code here -->\n",
      stylesheet: "/* Delete this line, then paste your whole style.css from VS Code here */\n",
      script: "// Delete this line, then paste your whole orders.js from VS Code here\n",
      tasks: [
        {
          goal: "The checker starts with 3 orders already placed (2 Kwek-kwek, 1 Turon, 2 Siopao). The board lists them: one row each.",
          apiOrders: SEED_ORDERS,
          checks: [
            { selector: "table tbody#order-rows", message: "The top box doesn't have your orders.html with its <tbody id=\"order-rows\"> yet. Paste your whole orders.html." },
            {
              log: "→ GET /api/orders · 200",
              message: "Your page never asked for /api/orders. Add loadOrders() with its fetch, and call it once at the end of orders.js:  loadOrders();",
            },
            {
              selector: "#order-rows tr",
              exact: 3,
              message: "#order-rows should show 3 rows, one per order. None? Does the first .then hand the data to showOrders? Is the loop adding each row to rows? Read the console under the preview.",
            },
            { selector: "#order-rows tr", text: "Kwek-kwek", message: "Some row should say Kwek-kwek: put order.name in a cell." },
          ],
          hint: "loadOrders: fetch(\"/api/orders\").then(response => response.json()).then(data => showOrders(data)). And loadOrders(); typed once, outside the function.",
          solution: `${ORDERS_JS_LOAD}\n\nloadOrders();`,
          explain: "The staff page shows what the orders list holds. Place an order on the order form and it joins the list.",
        },
        {
          goal: "With the same 3 orders, the summary line shows the day's totals.",
          apiOrders: SEED_ORDERS,
          checks: [
            {
              log: "→ GET /api/summary · 200",
              message: "Your page never asked for /api/summary. loadOrders should also fetch(\"/api/summary\").",
            },
            { selector: "#summary", text: "3 orders", message: "The summary should say 3 orders, written from data.total_orders:  `${data.total_orders} orders · ₱${data.total_sales} in sales`" },
            { selector: "#summary", text: "102", message: "The summary should show ₱102 in sales (40 + 12 + 50): data.total_sales." },
          ],
          hint: "fetch(\"/api/summary\").then(response => response.json()).then(data => { summaryLine.textContent = `${data.total_orders} orders · ₱${data.total_sales} in sales`; })",
          solution: "fetch(\"/api/summary\")\n  .then(response => response.json())\n  .then(data => {\n    summaryLine.textContent = `${data.total_orders} orders · ₱${data.total_sales} in sales`;\n  })",
          explain: "Three orders, ₱102: worked out by your Java, shown by your page.",
        },
        {
          goal: "With no orders at all, the board shows no rows and says so in words.",
          checks: [
            { selector: "#order-rows tr", exact: 0, message: "With no orders there should be no rows in #order-rows. Is a row added outside the for loop in showOrders?" },
            { selector: "#status", text: "No orders yet", message: "With no orders the status line should say  No orders yet.  In showOrders:  if (list.length === 0) { statusLine.textContent = \"No orders yet.\"; }" },
          ],
          hint: "At the end of showOrders:  if (list.length === 0) { statusLine.textContent = \"No orders yet.\"; } else { statusLine.textContent = \"\"; }",
          solution: "if (list.length === 0) {\n  statusLine.textContent = \"No orders yet.\";\n} else {\n  statusLine.textContent = \"\";\n}",
          explain: "An empty board and a broken board look the same unless the page says which one it is.",
        },
        {
          goal: "With the same 3 orders, pressing Refresh loads the board again, and it still shows 3 rows, not 6.",
          apiOrders: SEED_ORDERS,
          actions: [{ action: "click", target: "#refresh" }],
          checks: [
            { selector: "button#refresh", message: "The top box doesn't have a <button id=\"refresh\"> yet. Paste your whole orders.html." },
            {
              selector: "#order-rows tr",
              exact: 3,
              message: "After Refresh the board should still show 3 rows. More than 3? showOrders adds the rows again without clearing the old ones: its first line should be  rows.replaceChildren();",
            },
          ],
          hint: "The Refresh listener calls loadOrders(), and showOrders starts with rows.replaceChildren(); so every load starts from an empty table.",
          solution: "document.getElementById(\"refresh\").addEventListener(\"click\", function () {\n  loadOrders();\n});",
          explain: "Each load redraws the whole table from the app's answer, so pressing Refresh twice never doubles it.",
        },
        {
          goal: "With the 3 orders, typing 2 in the find box and pressing Find shows that order.",
          apiOrders: SEED_ORDERS,
          actions: [
            { action: "type", target: "#find-id", value: "2" },
            { action: "submit", target: "#find-form" },
          ],
          checks: [
            { selector: "form#find-form #find-id", message: "The top box doesn't have the find form (id=\"find-form\" with id=\"find-id\") yet." },
            { selector: "#found", textNot: "undefined", message: "The found line says undefined: a key is spelled wrong. The order has order_id, snack_id, name, qty and total." },
            { selector: "#found", text: "Order 2", message: "After Find, #found should start with  Order 2:  Does the submit listener fetch `/api/orders/${findId.value}` and write data.order_id? Read the console under the preview." },
            { selector: "#found", text: "Turon", message: "Order 2 is 1 × Turon = ₱12. Write data.name and data.total as well." },
          ],
          hint: "event.preventDefault() first. Then fetch(`/api/orders/${findId.value}`), and in response.json().then(data => …) with  if (response.ok)  show  `Order ${data.order_id}: ${data.qty} × ${data.name} = ₱${data.total}`.",
          solution: ORDERS_JS_FIND,
          explain: "The address is built from what the person typed, the same trick as /api/snacks/2.",
        },
        {
          goal: "With the same 3 orders, asking for order 99 shows the app's own message.",
          apiOrders: SEED_ORDERS,
          actions: [
            { action: "type", target: "#find-id", value: "99" },
            { action: "submit", target: "#find-form" },
          ],
          checks: [
            {
              selector: "#found",
              textNot: "undefined",
              message: "The found line shows undefined: an error answer has no name or total. Check response.ok first, and show data.message when it's false.",
            },
            {
              selector: "#found",
              text: "No order with id 99",
              message: "For a missing order, #found should show  Sorry: ${data.message}  (the app says No order with id 99). The else branch of  if (response.ok)  does that.",
            },
          ],
          hint: "if (response.ok) { …the order… } else { found.textContent = `Sorry: ${data.message}`; }",
          solution: "if (response.ok) {\n  found.textContent = `Order ${data.order_id}: ${data.qty} × ${data.name} = ₱${data.total}`;\n} else {\n  found.textContent = `Sorry: ${data.message}`;\n}",
          explain: "The message you wrote in Java, shown to the person who typed the wrong number.",
        },
        {
          goal: "The checker pretends your app is switched off: every request gets no answer at all. The page tells the person what's wrong.",
          apiDown: true,
          checks: [
            {
              selector: "#status",
              text: "Can't reach the canteen app",
              message: "With the app off, #status should say  Can't reach the canteen app. Is it running?  Give each fetch in loadOrders a .catch that writes it:  .catch(error => { console.error(error); statusLine.textContent = \"Can't reach the canteen app. Is it running?\"; })",
            },
          ],
          hint: "A fetch with no answer skips .then and runs .catch. Put the message in the .catch of BOTH fetches in loadOrders.",
          solution: ".catch(error => {\n  console.error(error);\n  statusLine.textContent = \"Can't reach the canteen app. Is it running?\";\n})",
          explain: "No answer at all is the one case no status code can describe, so the page has to say it in its own words.",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own improvement",
      intro:
        "Make your canteen app do one more thing that you choose. Do at least one idea; if you have time, do more. There's no upper limit, and the later ideas are harder.",
      missions: [
        {
          task:
            "Pick one idea, or invent your own, and build it with what this week taught. Ideas: (1) GET /api/orders?snack_id=3 lists only the orders for that snack (Tuesday's @RequestParam(required = false) Integer idea, on listOrders), plus a drop-down on the orders board that uses it; (2) while an order is on its way, the Place order button is disabled, so a double click can't order twice (the button has no id yet: in order.html, give the Place order button  id=\"place\",  then under the line  const form = document.getElementById(\"order-form\");  in order.js add  const placeButton = document.getElementById(\"place\");  then type placeButton.disabled = true; before the fetch, and placeButton.disabled = false; inside the last .then and inside the .catch); (3) the menu says Loading the menu… until the snacks arrive, and Can't reach the canteen app if the fetch fails; (4) the summary says 1 order, not 1 orders, when there is one; (5) a best_seller key in /api/summary: the name of the snack with the most quantity ordered (the hardest: you'll need a second loop, or a running best); (6) your own idea.",
          hint:
            "Keep every checkpoint passing: don't rename a key, don't change a status code, and keep /api/summary's two keys. A NEW key is fine; a renamed one breaks the checkpoint. Start small: write the one new line, restart, and look at the answer in the browser before you build the next part. For idea 1: add  @RequestParam(required = false) Integer snack_id  to listOrders, return orders when it is null, and otherwise a new ArrayList of the matching orders. Re-check with the day's checkpoints by pasting your answers in again.",
        },
        {
          task: "Paste what you added: the new Java lines (and which file they're in), the new HTML or JavaScript lines, how you tested it, and what it answered. Finished early? Add another idea first, then paste them all.",
          hint: "Copy the lines from VS Code. How you tested it can be one sentence, like: 'I opened /api/orders?snack_id=3 and it listed only my Kwek-kwek orders.'",
          input: "Paste your new lines, how you tested them, and what they answered",
        },
      ],
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own app",
      steps: [
        "Run your app, open each address at localhost:8080, and mark each line ✅ or ❌ honestly, by opening and looking, not from memory.",
        "/api/snacks lists my six snacks with snack_id, name and price, and /api/info answers one object.",
        "/api/snacks/2 answers Turon; /api/snacks/99 answers 404 with my message; /api/snacks/abc answers 400.",
        "/api/snacks?maxPrice=12 answers only snacks of ₱12 or less, and plain /api/snacks still lists all six.",
        "application.properties has spring.web.error.include-message=always, and my error answers carry my messages.",
        "A POST to /api/orders answers 201 with the order and total; qty 0 or 25 answers 400; snack 99 answers 404; /api/orders lists the orders. (A POST can't be typed in the address bar. Open localhost:8080/order.html, press F12 → Console, and run  " + AUDIT_ORDER_LINE + "  It prints the status, then the answer. Change qty: 2 to qty: 0, then to 25, and snack_id: 3 to snack_id: 99, and read each status.)",
        "No method anywhere in my project is mapped to \"/\", and localhost:8080 still shows my front page.",
        "menu.html loads its rows from /api/snacks, and the search still works.",
        "order.html posts to /api/orders, and the receipt shows the app's order number and total.",
        "tables.html loads its sample rows from /api/rows.",
        "At localhost:8080 every page shows ₱ and × properly, not â‚± or Ã—.",
        "order.html has no typed <option> lines, and its drop-down and its total are built from /api/snacks. If I change Turon's price in Java, the drop-down, the total and the receipt all follow.",
        "/api/orders/1 answers that order; /api/orders/99 answers 404 with \"No order with id 99\"; /api/orders/abc answers 400.",
        "/api/summary answers {\"total_orders\":…,\"total_sales\":…} and the numbers match the orders I placed.",
        "orders.html lists every order, shows the summary line, and Refresh brings in a new order.",
        "On orders.html, the find box shows an order's details, and for an order that doesn't exist it shows the app's own message.",
        "With no orders the board says \"No orders yet.\", and with the app switched off it says \"Can't reach the canteen app. Is it running?\"",
        "For every ❌: fix it now. Everything you need is in this week's four days and in today's labs, and the day is yours.",
      ],
      tip: "Not sure how to fix a ❌? Go back to the day it came from: records, controllers, /api/snacks → Monday. {id}, 404, ?maxPrice, the properties line → Tuesday. POST and /api/orders → Wednesday. 400s, 500s and the gauntlet → Thursday. The drop-down, /api/orders/{id}, /api/summary and the orders board → Part 2 of today (the labs above). Each day's checkpoint still works: paste your answers in again and it tells you the first thing that's wrong.",
      submit: "Paste the list with your ✅/❌ marks, and for each ❌ you fixed, one line on what was wrong",
    },
    {
      kind: "upload",
      id: "screenshot-final-site",
      title: "📤 Hand in: your pages, on your API",
      intro: "The week's closing hand-in: your own tables, served by your own Java, on your own page.",
      steps: [
        "Restart your app and open localhost:8080/tables.html.",
        "Press F12 → Network and reload (F5). Click the row named rows.",
        "Make sure the address bar, your sample rows table and the rows request (status 200) are all visible. Zoom out (Ctrl and −) if it doesn't fit.",
        "Press Windows+Shift+S and capture the screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves:
        "your own Week 3 rows, answered by your own RowsController at /api/rows and drawn by your tables.js, on a page served by your app at localhost:8080. Nobody else's app has this endpoint.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week7",
    title: "⚔️ Boss battle: The Wall Between",
    intro: "The Wall Between keeps your pages and your Java apart. The whole week in one fight.",
    boss: { name: "the Wall Between", emoji: "🧱" },
    questions: [
      {
        prompt: "What makes a Java class answer requests with JSON?",
        choices: ["@RestController on the class, @GetMapping/@PostMapping on its methods", "A main method", "A file in static/"],
        answer: 0,
        explain: "Monday's two annotations.",
      },
      {
        prompt: "Which address gives one snack?",
        choices: ["/api/snacks?id=2", "/api/snacks/2", "/api/snack.html"],
        answer: 1,
        explain: "A path variable: @GetMapping(\"/api/snacks/{id}\").",
      },
      {
        prompt: "Which status means the request was fine, but the thing doesn't exist?",
        choices: ["400", "500", "404"],
        answer: 2,
        explain: "404 Not Found.",
      },
      {
        prompt: "A successful POST /api/orders answers…",
        choices: ["201 Created", "200 OK", "204 No Content"],
        answer: 0,
        explain: "@ResponseStatus(HttpStatus.CREATED).",
      },
      {
        prompt: "Which part of a fetch tells your app the body is JSON?",
        choices: ["method: \"POST\"", "headers: { \"Content-Type\": \"application/json\" }", "JSON.stringify"],
        answer: 1,
        explain: "Without it: 415.",
      },
      {
        prompt: "Why does the app, not the page, work out an order's total?",
        choices: ["The page can't multiply", "JSON has no numbers", "Prices from the browser can't be trusted"],
        answer: 2,
        explain: "The server uses its own prices.",
      },
      {
        prompt: "Why must pages that fetch /api/… be opened at localhost:8080?",
        choices: [
          "A fetch asks the server the page came from, and only your app has /api",
          "Live Server is broken",
          "JavaScript only runs at 8080",
        ],
        answer: 0,
        explain: "From Live Server, /api/snacks asks Live Server.",
      },
      {
        prompt: "In Spring Boot 4, which setting puts your messages in the error JSON?",
        choices: ["server.error.include-message=always", "spring.web.error.include-message=always", "debug=true"],
        answer: 1,
        explain: "The old name is ignored without any warning.",
      },
      {
        prompt: "Why did menu.js need only two changes to use the API?",
        choices: [
          "It was rewritten",
          "The API edits the page",
          "Week 6 kept the data in one variable and the drawing in one function; only where the data comes from changed",
        ],
        answer: 2,
        explain: "Data and drawing kept apart.",
      },
      {
        prompt: "Why build the order form's drop-down from /api/snacks instead of typing the options?",
        choices: [
          "Typed options don't work in JavaScript",
          "There is one price list, in your Java: change a price or add a snack there and the form follows without editing the page",
          "fetch is faster than HTML",
        ],
        answer: 1,
        explain: "Two lists drift apart. With one list, the drop-down, the total and the receipt can't disagree.",
      },
      {
        prompt: "Which status should GET /api/orders/99 answer when there is no order 99?",
        choices: ["400", "200 with an empty body", "404"],
        answer: 2,
        explain: "The request was fine; the order doesn't exist. getOrder throws ResponseStatusException(HttpStatus.NOT_FOUND, …), in the same shape as getSnack.",
      },
      {
        prompt: "Why does showTotal check that it found a snack before using its price?",
        choices: [
          "showTotal runs once when the page opens, before the snacks have arrived from the API, when the list is still empty",
          "JavaScript requires an if in every function",
          "So the total can be negative",
        ],
        answer: 0,
        explain: "The answer arrives later, inside .then. Code that runs before it has to cope with having nothing yet.",
      },
      {
        prompt: "The orders board shows a message on the page when the app is switched off. Which part of the fetch runs in that case?",
        choices: [
          ".then(response => response.json()), with a 404 status",
          ".catch(error => …): the fetch got no answer at all",
          "if (response.ok)",
        ],
        answer: 1,
        explain: "An answer with a bad status is still an answer, handled with response.ok. No answer at all lands in .catch.",
      },
      {
        prompt: "Why are the orders gone after a restart, and what fixes it?",
        choices: [
          "They live in memory; next week MySQL keeps them",
          "Spring deletes them on purpose; nothing fixes it",
          "The browser forgets them; use cookies",
        ],
        answer: 0,
        explain: "Week 8: your API, on your ledger.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket for the week: type these into the turn-in box below.",
    steps: [
      "Each of your endpoints, its method and address, and what it answers.",
      "The whole journey of one order, from the button to the receipt.",
      "Your rule for choosing 200, 201, 400, 404 and 500.",
      "The orders board: which endpoint each of its three features (the list, the summary line, the find box) calls, and what it shows when the app is off.",
      "The bug you made most this week, and how you'll catch it next time.",
      "One question you still have.",
    ],
    note: "Your pages and your Java finally talk to each other. One thing is still pretend: the snacks and orders live in Java lists that a restart forgets. Next week they move into the MySQL ledger you built in Unit 1, and your pages won't need to change at all.",
  },
};
