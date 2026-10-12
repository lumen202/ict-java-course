// unit2-week6 · Day 5 — Your own rows, fetched
//
// Wrap-up day: no video. Two things the earlier days set up:
//   - the week's gauntlet (`week6-gauntlet`): a script checkpoint on a page the
//     student has never seen — Kuya Jun's school supplies, with the data and a
//     prices object given — so nothing can be pasted from their own project.
//     Its tasks jump between the days (rows → text → live cost → form) and each
//     goal names the day it reuses. It comes AFTER the twist and its hand-in
//     (adversarial walk-through, 2026-10-11): it's the hardest item of the week,
//     and the day's own work shouldn't wait behind it. The search task was cut
//     for the same reason; refactoring a loop into a function is Day 3's job.
//   - the week's twist (index.ts): tables.html gets "Sample rows" fetched from
//     static/rows.json, written by hand from the student's own Week 3 JOIN — the
//     query they put on the page last Friday. fetch("rows.json") is the exact
//     call that becomes fetch("/api/…") when their API exists.
// The checkpoint gives rows.json its own editor (`files`), so the checker's
// fetch serves the student's file; any other name is a 404, as in their app.
// Its checks are counts, not names: every student's Week 3 design differs.

import type { DayPlan } from "../../types";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Load your own rows from a JSON file, then prove the week on a page you've never seen",
  warmupGame: {
    kind: "quest",
    id: "warmup-week-map",
    title: "🗺️ Warm-up: where this week's code is going",
    intro: "Every script you wrote this week has a job waiting for it once your Java app answers with data.",
    missions: [
      {
        task: "Your menu.js starts with  const snacks = [ … ];  typed by hand, then builds the table from it.",
        hint: "Which part of menu.js knows the snacks came from your hands rather than from somewhere else?",
        check: {
          question: "When your API can answer with the snacks as JSON, what has to change in menu.js?",
          choices: [
            "Only where snacks comes from. The loop, showSnacks and the search work on any array of snack objects",
            "All of it, because the API speaks Java",
            "Nothing, the API edits the HTML",
          ],
          answer: 0,
          explain: "That's why you kept the data in one array and the drawing in one function: one part changes, the other doesn't.",
        },
      },
      {
        task: "Your order page logs  {\"snack_id\":3,\"qty\":2}  when an order is placed.",
        hint: "Think of Week 4's RecordSale. Which of its ? placeholders are these two values?",
        check: {
          question: "Next week, where does that JSON go?",
          choices: [
            "Into a cookie",
            "To your own Java app, which reads snack_id and qty and runs RecordSale's INSERT with today's date",
            "Directly into MySQL",
          ],
          answer: 1,
          explain: "Browser → your app at 8080 → MySQL at 3306. The page makes the message; your app does the saving.",
        },
      },
      {
        task: "Today your tables page runs  fetch(\"rows.json\")  and rows.json sits in static/.",
        hint: "At localhost:8080, who hands out every file in static/?",
        check: {
          question: "At localhost:8080, who answers that fetch?",
          choices: [
            "MySQL",
            "Live Server",
            "Your Spring Boot app, serving static/rows.json like any other file. Soon a controller of yours answers instead",
          ],
          answer: 2,
          explain: "A fetch is a request, like typing an address into the browser. Today a file answers it; later your Java code does.",
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
      title: "🛠️ Real lab: sample rows from YOUR tables",
      intro:
        "Last Friday your tables page showed your Week 3 tables' columns and the question they answer. Today it also shows the answer, as rows loaded from a JSON file that only your project has.",
      missions: [
        {
          task: "Open queries.sql and run the SELECT with a JOIN from your tables page (Ctrl+E Ctrl+E). Pick three to five rows of its result.",
          hint:
            "It's the query inside the <pre> on your tables.html. If it lives in another database than school, write the database name in front of each table, like library.books, or use your second SQLTools connection.",
          input: "Paste the rows you picked, with the column names",
        },
        {
          task: "In static/, create rows.json and write those rows in it as an array of objects, one object per row and one key per column, named like the column.",
          code: "[\n  { \"title\": \"Noli Me Tangere\", \"borrower\": \"Ana Reyes\" },\n  { \"title\": \"El Filibusterismo\", \"borrower\": \"Ben Cruz\" },\n  { \"title\": \"Florante at Laura\", \"borrower\": \"Ana Reyes\" }\n]",
          hint:
            "Use your own columns and values; the example is a library. JSON is stricter than JavaScript: every key in double quotes, text in double quotes, dates are text too (\"2026-09-14\"), numbers without quotes, and no comma after the last item. VS Code underlines a JSON mistake in red: hover over it to read what's wrong.",
          check: {
            question: "Which line is valid inside rows.json?",
            choices: [
              "{ title: 'Noli Me Tangere', copies: 3 },",
              "{ \"title\": \"Noli Me Tangere\", \"copies\": 3 }",
              "{ \"title\": \"Noli Me Tangere\", \"copies\": \"3\", }",
            ],
            answer: 1,
            explain:
              "Double quotes on keys and text, a bare number, and no trailing comma. The first is a JavaScript object, but not JSON. The third has a comma before the } and its number written as text.",
          },
        },
        {
          task: "In tables.html, right after the <pre> that holds your question's SELECT, add  <h2>Sample rows</h2>  and  <table id=\"sample\"></table>.  Then add  <script src=\"tables.js\"></script>  as the last line of <body>. Create tables.js in static/ and type:",
          code: "fetch(\"rows.json\")\n  .then(response => response.json())\n  .then(rows => {\n    const table = document.getElementById(\"sample\");\n    const columns = Object.keys(rows[0]);\n\n    const head = document.createElement(\"tr\");\n    for (const column of columns) {\n      const th = document.createElement(\"th\");\n      th.textContent = column;\n      head.append(th);\n    }\n    table.append(head);\n\n    for (const row of rows) {\n      const tr = document.createElement(\"tr\");\n      for (const column of columns) {\n        const td = document.createElement(\"td\");\n        td.textContent = row[column];\n        tr.append(td);\n      }\n      table.append(tr);\n    }\n  })\n  .catch(error => console.error(error));",
          hint:
            "Object.keys(rows[0]) is the list of the first row's keys, which are your column names. row[column] reads a key whose name is in a variable; row.column would look for a key literally called 'column'.",
          check: {
            question: "Why is the table code inside .then(rows => { … }) instead of after the fetch line?",
            choices: [
              "It's just tidier",
              "fetch returns at once, before the file has arrived. The code in .then runs later, when rows.json is here and turned into an array",
              "Because fetch only works inside functions",
            ],
            answer: 1,
            explain:
              "Fetching takes time, so the browser doesn't wait. It carries on and calls your .then when the answer comes back. Bro Code calls this 'asynchronous', and fetching from your API works exactly the same way.",
          },
        },
        {
          task: "Break it on purpose, in the Live Server tab (127.0.0.1:5500): change fetch(\"rows.json\") to fetch(\"row.json\"), save, and read the console. Then change it back and save.",
          hint: "The file wasn't found. What did the server send back instead, and is that JSON?",
          check: {
            question: "In Live Server the console shows a SyntaxError: Unexpected token … is not valid JSON. What happened?",
            choices: [
              "rows.json has a mistake in it",
              "fetch can only load files called rows.json",
              "There's no row.json, so the server answered with its 'not found' page. response.json() tried to read that page as JSON and failed",
            ],
            answer: 2,
            explain:
              "At localhost:8080 the same mistake looks different: your app answers 'not found' in JSON, so the console says TypeError: Cannot convert undefined or null to object. And 'is not valid JSON' also appears if rows.json itself has a mistake. Either way, .catch put the error in the console instead of failing silently.",
          },
        },
        {
          task: "Restart your app and open localhost:8080/tables.html. Your sample rows are there. Add today to notes.md: what fetch does, what .then is for, and the error you caused on purpose.",
          hint: "If the sample table is empty, open the console first. Every way this breaks prints something there.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-tables-fetch",
      fileName: "tables.html",
      scriptFile: "tables.js",
      title: "🧪 Checkpoint: your rows, fetched",
      intro:
        "Three boxes: tables.html, tables.js, and rows.json. When your script fetches rows.json, the checker hands it the file from the third box, the way your app hands it static/rows.json.",
      starter: "<!-- Delete this line, then paste your whole tables.html from VS Code here -->\n",
      script: "// Delete this line, then paste your whole tables.js from VS Code here\n",
      files: { "rows.json": "Delete this line, then paste your whole rows.json from VS Code here\n" },
      tasks: [
        {
          goal: "Paste all three files. First: the page still has last week's tables and question, plus an empty #sample table and the script tag.",
          checks: [
            { selector: "body h1", message: "The top box doesn't have your tables.html yet. Paste the whole file." },
            { selector: "pre", text: "join", message: "Your question's SELECT (in a <pre>, with its JOIN) is missing. Last week's page should still all be there." },
            { selector: "table#sample", message: "No <table id=\"sample\"></table>. Add it under your question." },
            {
              selector: "body > script[src='tables.js']:last-child",
              message: "<script src=\"tables.js\"></script> should be the last thing inside <body>.",
            },
          ],
          hint: "<h2>Sample rows</h2>, then <table id=\"sample\"></table>, then, as the last line of body, the script tag.",
          solution: "<h2>Sample rows</h2>\n<table id=\"sample\"></table>\n\n<script src=\"tables.js\"></script>\n</body>",
          explain: "An empty table with an id, for the script to fill.",
        },
        {
          goal: "The heading row is built from rows.json's keys: one <th> per column.",
          checks: [
            {
              selector: "#sample th",
              min: 1,
              message: "#sample has no heading cells yet. Read the console under the preview: 'is not valid JSON' means a mistake in rows.json (quotes, a trailing comma). 'Cannot convert undefined or null to object' means fetch didn't find the file: it must be fetch(\"rows.json\"), with no slash.",
            },
          ],
          hint: "Object.keys(rows[0]) gives the column names, then one th per name. Is the third box valid JSON: [ { \"key\": \"value\" }, … ]?",
          solution: "const columns = Object.keys(rows[0]);\nconst head = document.createElement(\"tr\");\nfor (const column of columns) {\n  const th = document.createElement(\"th\");\n  th.textContent = column;\n  head.append(th);\n}\ntable.append(head);",
          explain: "The headings came from your data, not from the HTML: change the columns in rows.json and the table follows.",
        },
        {
          goal: "One row per object in rows.json — at least three.",
          checks: [
            {
              selector: "#sample tr",
              min: 4,
              message: "#sample needs the heading row plus at least 3 rows, so put at least three objects in rows.json and build one <tr> for each.",
            },
            {
              selector: "#sample td",
              min: 3,
              message: "Fewer than 3 cells. Each row needs one <td> per column: loop over columns inside the loop over rows.",
            },
          ],
          hint: "for each row → a tr; inside it, for each column → a td with textContent = row[column].",
          solution: "for (const row of rows) {\n  const tr = document.createElement(\"tr\");\n  for (const column of columns) {\n    const td = document.createElement(\"td\");\n    td.textContent = row[column];\n    tr.append(td);\n  }\n  table.append(tr);\n}",
          explain: "A table built from any JSON array of objects, whatever its columns are. Change the fetch address to your API's, and this is the page your Java app will fill.",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "week6-gauntlet",
      fileName: "supplies.html",
      scriptFile: "supplies.js",
      title: "🧪 The week's gauntlet: Kuya Jun's school supplies",
      intro:
        "A page you've never seen, for a different shop. The HTML is finished and the data is in supplies.js. Write the script below the data. Each checkpoint reuses one day of the week, named in its goal: go back to that day's lab if you need the pattern.",
      starter:
        "<!DOCTYPE html>\n<html>\n<head>\n  <title>Kuya Jun's School Supplies</title>\n</head>\n<body>\n  <h1>Kuya Jun's School Supplies</h1>\n  <p id=\"status\"></p>\n  <input id=\"search\" placeholder=\"Search by name\">\n  <table>\n    <tr><th>Item</th><th>Price</th></tr>\n    <tbody id=\"items\"></tbody>\n  </table>\n  <form id=\"buy-form\">\n    <select id=\"item\">\n      <option value=\"1\">Pencil</option>\n      <option value=\"2\">Notebook</option>\n      <option value=\"3\">Eraser</option>\n      <option value=\"4\">Ballpen</option>\n      <option value=\"5\">Ruler</option>\n    </select>\n    <input type=\"number\" id=\"qty\" min=\"1\" max=\"50\" value=\"1\" required>\n    <button type=\"submit\">Buy</button>\n  </form>\n  <p id=\"cost\"></p>\n  <p id=\"message\"></p>\n  <script src=\"supplies.js\"></script>\n</body>\n</html>\n",
      script:
        "// Kuya Jun's stock: the rows of his items table.\nconst items = [\n  { item_id: 1, name: \"Pencil\", price: 8 },\n  { item_id: 2, name: \"Notebook\", price: 35 },\n  { item_id: 3, name: \"Eraser\", price: 5 },\n  { item_id: 4, name: \"Ballpen\", price: 12 },\n  { item_id: 5, name: \"Ruler\", price: 15 },\n];\n\n// The same prices, looked up by item_id (like Tuesday's prices object).\nconst prices = { 1: 8, 2: 35, 3: 5, 4: 12, 5: 15 };\n\n// Write your code below.\n",
      tasks: [
        {
          goal: "Fill the table (Wednesday's loop): one row per item in #items, with the name and the price in pesos.",
          checks: [
            {
              selector: "#items tr",
              exact: 5,
              message: "#items should have exactly 5 rows, one per item. Fewer: is your loop appending each <tr> to #items? More: are you building the rows twice?",
            },
            { selector: "#items tr td:nth-child(2)", min: 5, message: "Each row needs two cells: the name, then the price." },
            { selector: "#items td", text: "₱35", message: "No cell says ₱35 (the Notebook). Write prices as `₱${item.price}`." },
          ],
          hint: "Wednesday's lab, mission 2: const rows = document.getElementById(\"items\"); then for (const item of items) { make a tr and two tds, fill them, append }.",
          solution: "const rows = document.getElementById(\"items\");\nfor (const item of items) {\n  const tr = document.createElement(\"tr\");\n  const name = document.createElement(\"td\");\n  name.textContent = item.name;\n  const price = document.createElement(\"td\");\n  price.textContent = `₱${item.price}`;\n  tr.append(name, price);\n  rows.append(tr);\n}",
          explain: "Same loop, different shop. The code never cared what the rows were about.",
        },
        {
          goal: "The status line (Monday's textContent) says how many items are in stock, counted by the script: '5 items in stock'.",
          checks: [
            {
              selector: "#status",
              text: "5 items",
              message: "#status should say '5 items in stock', and the 5 must come from items.length, not be typed in.",
            },
          ],
          hint: "document.getElementById(\"status\").textContent = a template literal with ${items.length} in it.",
          solution: "document.getElementById(\"status\").textContent = `${items.length} items in stock`;",
          explain: "If Kuya Jun adds a sixth item to the array, the status line changes by itself.",
        },
        {
          goal: "A live cost (Tuesday's showTotal): choosing an item or typing a quantity shows the cost in #cost.",
          actions: [
            { action: "choose", target: "#item", value: "2" },
            { action: "type", target: "#qty", value: "3" },
          ],
          checks: [
            {
              selector: "#cost",
              text: "105",
              message: "With Notebook (₱35) chosen and 3 typed, #cost should show 105. Do you listen for both 'change' on #item and 'input' on #qty?",
            },
          ],
          hint: "Same shape as Tuesday's showTotal: prices[item.value] * Number(qty.value), written into #cost. Then two listeners, and one call at the end.",
          solution: "const item = document.getElementById(\"item\");\nconst qty = document.getElementById(\"qty\");\nfunction showCost() {\n  document.getElementById(\"cost\").textContent = `Cost: ₱${prices[item.value] * Number(qty.value)}`;\n}\nitem.addEventListener(\"change\", showCost);\nqty.addEventListener(\"input\", showCost);\nshowCost();",
          explain: "Your Tuesday code, in a shop you'd never seen. Only the names changed.",
        },
        {
          goal: "Buying (Thursday's form) keeps the page, says what was bought in #message, and logs the purchase as JSON: {\"item_id\":…,\"qty\":…}.",
          actions: [
            { action: "choose", target: "#item", value: "2" },
            { action: "type", target: "#qty", value: "3" },
            { action: "submit", target: "#buy-form" },
          ],
          checks: [
            { selector: "#message", text: "Notebook", message: "After buying 3 Notebooks, #message should name what was bought." },
            {
              log: "{\"item_id\":2,\"qty\":3}",
              message: "The console should show exactly {\"item_id\":2,\"qty\":3}, with numbers, not text, and in that order.",
            },
          ],
          hint: "Thursday's form: a 'submit' listener on #buy-form whose first line is event.preventDefault();. Build { item_id: Number(…), qty: Number(…) }, write #message, log JSON.stringify of it.",
          solution: "document.getElementById(\"buy-form\").addEventListener(\"submit\", function (event) {\n  event.preventDefault();\n  const purchase = { item_id: Number(item.value), qty: Number(qty.value) };\n  document.getElementById(\"message\").textContent = `You bought ${purchase.qty} × ${item.selectedOptions[0].textContent}`;\n  console.log(JSON.stringify(purchase));\n});",
          explain: "Four days of JavaScript on a page you'd never seen before today. That's the week, and a purchase Kuya Jun's own API could receive word for word.",
        },
      ],
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own site",
      steps: [
        "Run your app, open localhost:8080, press F12 → Console, and mark each line below ✅ or ❌ honestly, by clicking and looking, not from memory.",
        "Every page with a script links it as the last line of <body>, and the console shows no red lines on any page.",
        "index.html: the greeting and today's special are written by index.js.",
        "order.html: − stops at 1, + stops at 20, and the total follows the snack, the typing and both buttons.",
        "order.html: Place order shows a receipt without reloading, logs the order as JSON with numbers, and New order starts again from 1.",
        "menu.html: the rows come from the snacks array (Ctrl+U shows none in the file), the count is right, and the search ignores capitals.",
        "tables.html: the sample rows come from rows.json, and rows.json holds rows from my own Week 3 query.",
        "Every script and JSON file is in src/main/resources/static, and every src and fetch is relative: no slash, no C:\\ path.",
        "Last week's checks still hold: four pages, one nav, one stylesheet, every link works at 8080 and in Live Server.",
        "For every ❌: fix it now. Everything you need is in this week's four days, and the day is yours.",
      ],
      tip: "Not sure how to fix a ❌? Go back to the day it came from: script tag, console, textContent → Monday. Buttons, Number(), the total → Tuesday. Arrays, rows, search → Wednesday. The form, receipt and JSON → Thursday. Each day's checkpoint still works: paste your files in again and it tells you the first thing that's missing.",
      submit: "Paste the list with your ✅/❌ marks, and for each ❌ you fixed, one line on what was wrong",
    },
    {
      kind: "upload",
      id: "screenshot-final-site",
      title: "📤 Hand in: your rows, fetched",
      intro: "The week's closing hand-in: the page only you could make, now with data loaded by your own script.",
      steps: [
        "Restart your app so it serves the finished files.",
        "Open localhost:8080/tables.html and press F12 → Console.",
        "Make sure the address bar, your sample rows table and the console (with no red lines) are visible. Zoom out (Ctrl and −) if it doesn't fit.",
        "Press Windows+Shift+S and capture the screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves:
        "rows from YOUR own Week 3 query, loaded from your rows.json by your own tables.js, on a page served by your own app at localhost:8080. Nobody else's screenshot has these rows.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week6",
    title: "⚔️ Boss battle: The Static Page",
    intro: "The whole week in one fight. Every page you made react this week is a hit.",
    boss: { name: "the Static Page", emoji: "🪨" },
    questions: [
      {
        prompt: "Where does your JavaScript run?",
        choices: ["In your Spring Boot app", "In the browser of whoever opened the page", "In MySQL"],
        answer: 1,
        explain: "Your app serves the file; the browser runs it.",
      },
      {
        prompt: "A page 'does nothing'. What do you open first?",
        choices: ["The browser's console (F12 → Console)", "pom.xml", "The Spring Boot log"],
        answer: 0,
        explain: "Every script error is there, with the file and line.",
      },
      {
        prompt: "What does 7 === \"7\" give?",
        choices: ["true", "An error", "false"],
        answer: 2,
        explain: "Different types, so === says false. Use === everywhere.",
      },
      {
        prompt: "The count box shows 2. What is Number(count.value) + 1?",
        choices: ["\"21\"", "3", "NaN"],
        answer: 1,
        explain: "Number() first, then maths.",
      },
      {
        prompt: "Which is one row of SELECT snack_id, name, price FROM snacks as an object?",
        choices: [
          "{ snack_id: 4, name: \"Gulaman\", price: 10 }",
          "[\"snack_id\", \"name\", \"price\"]",
          "snack_id=4&name=Gulaman",
        ],
        answer: 0,
        explain: "One key per column.",
      },
      {
        prompt: "Why do your rows use textContent rather than innerHTML?",
        choices: [
          "innerHTML can't make rows",
          "textContent is newer",
          "textContent shows data as plain text, so a name with tags in it can't change the page",
        ],
        answer: 2,
        explain: "Once the data comes from a database, it isn't all yours.",
      },
      {
        prompt: "What's the first line of a submit listener?",
        choices: ["return false;", "event.preventDefault();", "form.submit();"],
        answer: 1,
        explain: "Stop the page load, then do your work.",
      },
      {
        prompt: "Which is valid JSON?",
        choices: [
          "{ \"snack_id\": 2, \"qty\": 3 }",
          "{ snack_id: 2, qty: 3 }",
          "{ 'snack_id': 2, 'qty': 3, }",
        ],
        answer: 0,
        explain: "Double-quoted keys, and no trailing comma.",
      },
      {
        prompt: "Why does the table code go inside .then(rows => { … })?",
        choices: [
          "fetch needs a function to work",
          "The file arrives later. .then runs when it's here; code after the fetch line runs before it arrives",
          "It doesn't matter where it goes",
        ],
        answer: 1,
        explain: "fetch returns at once and the answer comes later.",
      },
      {
        prompt: "When your Java API exists, what changes in tables.js?",
        choices: [
          "Everything, because the API is Java",
          "Nothing at all",
          "The address inside fetch() — the code that builds the table stays the same",
        ],
        answer: 2,
        explain: "The code that draws the table doesn't care whether a file or your Java app answered.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket for the week: type these into the turn-in box below.",
    steps: [
      "Your four scripts and the one-line job of each.",
      "Three differences between JavaScript and Java you'll remember.",
      "What fetch does, and why the code using its answer goes inside .then.",
      "The bug you made most this week, and how you'll catch it next time.",
      "One question you still have.",
    ],
    note: "Your pages react now: they count, answer, search and load data. Every row on them is still typed by someone, though, in an array or a JSON file. Next week the Java side starts answering with real data, and your pages already know how to use it.",
  },
};
