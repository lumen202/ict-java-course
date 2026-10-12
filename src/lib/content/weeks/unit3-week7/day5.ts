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
// Checkpoints run the pages against the canteen API fake (`api: "canteen"`,
// lib/game/canteenApi.ts, pinned to the real app's answers). The harness logs
// each API call ("→ GET /api/snacks · 200"), so a `log` check proves the page
// really fetched — the fake serves the same six snacks as Week 6's typed array,
// so rows alone couldn't tell the difference.
// Pages that fetch /api/… only work at localhost:8080: from Live Server
// (127.0.0.1:5500) the same fetch asks Live Server, which has no /api.

import type { DayPlan } from "../../types";

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

const ORDER_JS = `const qty = document.getElementById("qty");

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
});

const prices = { 1: 15, 2: 12, 3: 20, 4: 10, 5: 25, 6: 8 };
const snack = document.getElementById("snack");
const total = document.getElementById("total");

function showTotal() {
  const price = prices[snack.value];
  const count = Number(qty.value);
  total.textContent = \`Total: ₱\${price * count}\`;
}

showTotal();

snack.addEventListener("change", showTotal);
qty.addEventListener("input", showTotal);

const receipt = document.getElementById("receipt");

document.getElementById("new-order").addEventListener("click", function () {
  receipt.style.display = "none";
  qty.value = 1;
  showTotal();
});

const form = document.getElementById("order-form");

${SUBMIT_LISTENER}`;

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

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Your pages use your API — the menu loads from /api/snacks and the order form posts to /api/orders",
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
          hint: "If the menu is empty, read the console first. A red error about JSON means the page isn't at localhost:8080; 'Failed to fetch' means the app isn't running.",
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
          hint: "Without min, the browser lets 0 through, so your app's check is what answers.",
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
            "Open rows.json beside it. If your rows.json has { \"title\": …, \"borrower\": … }, the record is Row(String title, String borrower). Types: anything in quotes (dates too) is String; a whole number is int; a number with a dot (12.50) is double; true/false is boolean. Keep at least three rows. Don't use @GetMapping(\"/\")!",
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
      id: "self-audit",
      title: "🔍 Audit your own app",
      steps: [
        "Run your app, open each address at localhost:8080, and mark each line ✅ or ❌ honestly, by opening and looking, not from memory.",
        "/api/snacks lists my six snacks with snack_id, name and price, and /api/info answers one object.",
        "/api/snacks/2 answers Turon; /api/snacks/99 answers 404 with my message; /api/snacks/abc answers 400.",
        "/api/snacks?maxPrice=12 answers only snacks of ₱12 or less, and plain /api/snacks still lists all six.",
        "application.properties has spring.web.error.include-message=always, and my error answers carry my messages.",
        "A POST to /api/orders answers 201 with the order and total; qty 0 or 25 answers 400; snack 99 answers 404; /api/orders lists the orders.",
        "No method anywhere in my project is mapped to \"/\", and localhost:8080 still shows my front page.",
        "menu.html loads its rows from /api/snacks, and the search still works.",
        "order.html posts to /api/orders, and the receipt shows the app's order number and total.",
        "tables.html loads its sample rows from /api/rows.",
        "For every ❌: fix it now. Everything you need is in this week's four days, and the day is yours.",
      ],
      tip: "Not sure how to fix a ❌? Go back to the day it came from: records, controllers, /api/snacks → Monday. {id}, 404, ?maxPrice, the properties line → Tuesday. POST and /api/orders → Wednesday. 400s, 500s and the gauntlet → Thursday. Each day's checkpoint still works: paste your answers in again and it tells you the first thing that's wrong.",
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
      "The bug you made most this week, and how you'll catch it next time.",
      "One question you still have.",
    ],
    note: "Your pages and your Java finally talk to each other. One thing is still pretend: the snacks and orders live in Java lists that a restart forgets. Next week they move into the MySQL ledger you built in Unit 1, and your pages won't need to change at all.",
  },
};
