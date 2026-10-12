// unit2-week6 · Day 3 — The menu, built from data
//
// Objects and arrays of objects, taught as what they become in Week 7:
// the shape of JSON from the student's own API. Keys are the COLUMN NAMES of
// `SELECT snack_id, name, price FROM snacks` — snack_id, name, price — and the
// order form already sends snack_id. Week 7's API produces the same keys
// so this page's code carries over unchanged (docs/agent/codebase-map/course-content.md).
//
// Rows are built with createElement + textContent, never innerHTML: once the
// names come from an API, textContent is what keeps data from becoming HTML.
// The checkpoint proves the rows are BUILT (hand-typed rows can't pass) with a
// search box the checker types into: "tur" must leave exactly one row. That
// relies on Turon and Kwek-kwek being in every student's snacks (Week 3 seed)
// and no other snack name containing "tur" or "kwek".
// Videos (transcripts read 2026-10-11): objects (lo7o91qLzxc, 7:00) and arrays
// of objects (w9078dAjcrY, 10:01).

import type { DayPlan } from "../../types";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "The menu, built from data — an array of snack objects becomes your table, with a search box",
  warmupGame: {
    kind: "quest",
    id: "warmup-rows-as-objects",
    title: "🧱 Warm-up: a row is an object",
    intro: "Before the videos, line up three things you already know: a result grid, a Java object, and the order form.",
    missions: [
      {
        task: "Picture the result of  SELECT snack_id, name, price FROM snacks;  — its second row is 2 | Turon | 12.",
        hint: "Each column of the grid becomes one key. Which keys match the column names exactly?",
        check: {
          question: "Which JavaScript object is that row?",
          choices: [
            "{ Turon: 12 }",
            "[2, \"Turon\", 12]",
            "{ snack_id: 2, name: \"Turon\", price: 12 }",
          ],
          answer: 2,
          explain:
            "One object per row, one key per column, named exactly like the column. Your order form already sends snack_id, so the names match all the way through.",
        },
      },
      {
        task: "In Week 4 a snack in Java would have been a class with fields: int snackId, String name, int price — and you'd write new Snack(2, \"Turon\", 12).",
        hint: "Look at the object in mission 1. Was there a class anywhere, or a new?",
        check: {
          question: "What does JavaScript need before you can write { snack_id: 2, name: \"Turon\", price: 12 }?",
          choices: [
            "Nothing. You write the object directly, with no class and no constructor",
            "A class Snack with a constructor",
            "An import",
          ],
          answer: 0,
          explain: "JavaScript has classes too (Bro Code has a video on them), but a plain object needs none, and plain objects are what JSON is made of.",
        },
      },
      {
        task: "Your menu has six snacks. In Java you'd keep them in an ArrayList<Snack>.",
        hint: "Which brackets mean 'list' in JavaScript, and which mean 'object'?",
        check: {
          question: "Which is a list of snack objects?",
          choices: [
            "{ [snack_id: 1, name: \"Banana cue\"], [snack_id: 2, name: \"Turon\"] }",
            "[ { snack_id: 1, name: \"Banana cue\", price: 15 }, { snack_id: 2, name: \"Turon\", price: 12 } ]",
            "( { snack_id: 1 }, { snack_id: 2 } )",
          ],
          answer: 1,
          explain:
            "Square brackets for the list, curly braces for each object. An array of objects is a result grid in JavaScript, and it's exactly what an API sends back.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Learn JavaScript OBJECTS in 7 minutes (Bro Code)",
      youtubeId: "lo7o91qLzxc",
      length: "7:00",
      practice: {
        intro: "His objects are SpongeBob and Patrick. Yours are snacks, in a new file for the menu page:",
        steps: [
          "In static/, create menu.js, and add  <script src=\"menu.js\"></script>  as the last line inside menu.html's <body>.",
          "In menu.js, make one snack:  const turon = { snack_id: 2, name: \"Turon\", price: 12 };",
          "Print two of its properties:  console.log(turon.name, turon.price);  and check the console on menu.html.",
          "Print one that doesn't exist:  console.log(turon.prize);  Read what comes out. Java would refuse to compile this; JavaScript just says undefined.",
        ],
        note: "He also gives objects methods (sayHello). Your snack objects only hold data, the same way rows do.",
      },
    },
    {
      title: "JavaScript ARRAYS of OBJECTS are easy! (Bro Code)",
      youtubeId: "w9078dAjcrY",
      length: "10:01",
      practice: {
        intro: "His array holds fruit. Yours holds the whole menu:",
        steps: [
          "Run  SELECT snack_id, name, price FROM snacks ORDER BY snack_id;  from queries.sql, and keep the result open.",
          "In menu.js, delete ALL three turon lines (const turon and both console.log lines). A line that still says turon after its const is gone stops the script with 'turon is not defined'.",
          "In their place, type the whole menu as an array, one { … } per row of your result. These are the six Week 3 snacks; if your result has more rows, add one more { … } for each, with a comma between them. You may put each { … } on its own line, like he does:  const snacks = [ { snack_id: 1, name: \"Banana cue\", price: 15 }, { snack_id: 2, name: \"Turon\", price: 12 }, { snack_id: 3, name: \"Kwek-kwek\", price: 20 }, { snack_id: 4, name: \"Gulaman\", price: 10 }, { snack_id: 5, name: \"Siopao\", price: 25 }, { snack_id: 6, name: \"Pastillas\", price: 8 } ];",
          "Print how many there are:  console.log(snacks.length);",
          "Print every name, his way:  snacks.forEach(snack => console.log(snack.name));  — snack => console.log(snack.name) is an 'arrow function': a short way to write function (snack) { console.log(snack.name); }.",
          "Make his filter yours:  console.log(snacks.filter(snack => snack.price <= 12));  — the snacks for ₱12 and under. It's a WHERE clause, run in the browser.",
        ],
        note: "He uses arrow functions all video, and so does today's lab. Read snack => … as 'for each snack, …'.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: the menu builds itself",
      intro:
        "Your menu table stops being typed by hand. The rows come from the snacks array, the way they'll later come from your API. Then you add a search box.",
      missions: [
        {
          task: "In menu.html, keep the table's caption and heading row, delete every hand-typed snack row, and add an empty body for the script to fill:  <tbody id=\"menu-rows\"></tbody>.  Under the table, add  <p id=\"count\"></p>.",
          hint:
            "The heading row is the one with <th> cells, so keep it. Every <tr> with <td> cells goes. The empty <tbody id=\"menu-rows\"></tbody> goes right after the heading row, still inside <table>.",
          check: {
            question: "You save and the table now has only its heading row. Is that right?",
            choices: [
              "No, the table is broken",
              "Yes. The rows are no longer in the HTML file at all, and the script builds them in the next mission",
              "No, a table needs at least one <td>",
            ],
            answer: 1,
            explain: "An empty <tbody> is a place for the script to put rows. That's what the id is for.",
          },
        },
        {
          task: "Build one row per snack. Type this at the very end of menu.js, below your snacks array (and below the console.log lines from the video, if they're still there):",
          code: "const rows = document.getElementById(\"menu-rows\");\n\nfor (const snack of snacks) {\n  const tr = document.createElement(\"tr\");\n  const name = document.createElement(\"td\");\n  name.textContent = snack.name;\n  const price = document.createElement(\"td\");\n  price.textContent = `₱${snack.price}`;\n  tr.append(name, price);\n  rows.append(tr);\n}",
          hint:
            "for (const snack of snacks) is Java's for (Snack snack : snacks). createElement makes a new element that isn't on the page yet; append puts it inside another one. Save: your menu should be back, one row per snack.",
          check: {
            question: "Press Ctrl+U to see menu.html's source: there are no snack rows in it. Then right-click a row → Inspect: there they are. Why the difference?",
            choices: [
              "Ctrl+U is broken",
              "The browser hides rows from the source",
              "Ctrl+U shows the file your app sent. Inspect shows the page as it is NOW, after your script added rows to it. That live page is called the DOM",
            ],
            answer: 2,
            explain:
              "The file and the live page (the DOM) are two different things from today on. Inspect is how you see what your script actually built.",
          },
        },
        {
          task: "To redraw the table for a search, the loop has to become a function. In menu.js, delete everything you typed in the last mission — from const rows down to the loop's last } — and type this in its place:",
          code: "const rows = document.getElementById(\"menu-rows\");\n\nfunction showSnacks(list) {\n  rows.replaceChildren();\n  for (const snack of list) {\n    const tr = document.createElement(\"tr\");\n    const name = document.createElement(\"td\");\n    name.textContent = snack.name;\n    const price = document.createElement(\"td\");\n    price.textContent = `₱${snack.price}`;\n    tr.append(name, price);\n    rows.append(tr);\n  }\n  document.getElementById(\"count\").textContent = `Showing ${list.length} snacks`;\n}\n\nshowSnacks(snacks);",
          hint:
            "Keep your snacks array above it, untouched. The loop is the same as before, now inside showSnacks, and it loops over list (whatever list it's handed). The last line runs it once with the whole menu. Save: the menu shows again, with 'Showing 6 snacks' under it.",
          check: {
            question: "What would happen if showSnacks didn't start with rows.replaceChildren(), and it ran a second time?",
            choices: [
              "Nothing different",
              "The new rows would be added under the old ones, so the table would grow every time",
              "The page would reload",
            ],
            answer: 1,
            explain: "replaceChildren() with nothing in the brackets empties #menu-rows first. Clear, then build.",
          },
        },
        {
          task: "Add the search. In menu.html, just above the <table>, type  <input id=\"search\" placeholder=\"Search by name\">.  Then type this at the very end of menu.js:",
          code: "const search = document.getElementById(\"search\");\n\nsearch.addEventListener(\"input\", function () {\n  const words = search.value.toLowerCase();\n  showSnacks(snacks.filter(snack => snack.name.toLowerCase().includes(words)));\n});",
          hint:
            "toLowerCase() and includes() work like Java's toLowerCase() and contains(). Save, then type tur into the box: only Turon should stay. Delete what you typed: every snack comes back.",
          check: {
            question: "You type TUR and Turon shows. Why does it match, when the name is spelled Turon?",
            choices: [
              "Both sides are lowercased first: \"turon\".includes(\"tur\") is true",
              "includes ignores capitals by itself",
              "The search box changes your typing to lowercase",
            ],
            answer: 0,
            explain:
              "Without the two toLowerCase() calls, 'tur' would find nothing. That's error clinic patient 5.",
          },
        },
        {
          task: "Your whole menu.js should now look like this, top to bottom. Three differences are fine: your array may have more snacks, it may be written on one line, and the console.log lines from the video may still be there. Compare it line by line and fix any difference. Then restart your app and check localhost:8080/menu.html.",
          code: "const snacks = [\n  { snack_id: 1, name: \"Banana cue\", price: 15 },\n  { snack_id: 2, name: \"Turon\", price: 12 },\n  { snack_id: 3, name: \"Kwek-kwek\", price: 20 },\n  { snack_id: 4, name: \"Gulaman\", price: 10 },\n  { snack_id: 5, name: \"Siopao\", price: 25 },\n  { snack_id: 6, name: \"Pastillas\", price: 8 }\n];\n\nconst rows = document.getElementById(\"menu-rows\");\n\nfunction showSnacks(list) {\n  rows.replaceChildren();\n  for (const snack of list) {\n    const tr = document.createElement(\"tr\");\n    const name = document.createElement(\"td\");\n    name.textContent = snack.name;\n    const price = document.createElement(\"td\");\n    price.textContent = `₱${snack.price}`;\n    tr.append(name, price);\n    rows.append(tr);\n  }\n  document.getElementById(\"count\").textContent = `Showing ${list.length} snacks`;\n}\n\nshowSnacks(snacks);\n\nconst search = document.getElementById(\"search\");\n\nsearch.addEventListener(\"input\", function () {\n  const words = search.value.toLowerCase();\n  showSnacks(snacks.filter(snack => snack.name.toLowerCase().includes(words)));\n});",
          hint:
            "Test like the checker, emptying the search box before each word: type tur (one row: Turon); empty it and type kwek (one row: Kwek-kwek); empty it (every snack is back). Something wrong? The console (F12 → Console) says which line.",
        },
        {
          task: "Add today to notes.md: your snacks array, what the DOM is, and the difference between the source (Ctrl+U) and Inspect.",
          hint: "The DOM is the live page — what Inspect shows — as opposed to the file your app sent.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-menu-script",
      fileName: "menu.html",
      scriptFile: "menu.js",
      title: "🧪 Checkpoint: the menu builds itself",
      intro:
        "Paste menu.html into the top box and menu.js into the bottom one. The checker runs your script, and for the search checkpoints it types into your search box itself.",
      starter: "<!-- Delete this line, then paste your whole menu.html from VS Code here -->\n",
      script: "// Delete this line, then paste your whole menu.js from VS Code here\n",
      tasks: [
        {
          goal: "Paste both files. First: the page has what the script needs — the script tag, an empty #menu-rows inside the table, #count and #search.",
          checks: [
            { selector: "table th", min: 2, message: "The top box doesn't have your menu table yet (no heading cells found). Paste your whole menu.html." },
            {
              selector: "body > script[src='menu.js']:last-child",
              message: "<script src=\"menu.js\"></script> should be the last thing inside <body>.",
            },
            { selector: "table tbody#menu-rows", message: "No <tbody id=\"menu-rows\"> inside your table. Add it right after the heading row." },
            { selector: "#count", message: "No element with id=\"count\". Add  <p id=\"count\"></p>  under the table." },
            { selector: "input#search", message: "No search box. Add  <input id=\"search\" placeholder=\"Search by name\">  above the table." },
          ],
          hint: "The <tbody id=\"menu-rows\"></tbody> goes inside <table>, right after the <tr> with your <th> cells.",
          solution: "<input id=\"search\" placeholder=\"Search by name\">\n<table>\n  <caption>Today's menu</caption>\n  <tr>\n    <th>Snack</th>\n    <th>Price</th>\n  </tr>\n  <tbody id=\"menu-rows\"></tbody>\n</table>\n<p id=\"count\"></p>",
          explain: "Empty places with ids, for the script to fill.",
        },
        {
          goal: "One row per snack, built from your snacks array — a name cell and a ₱ price cell in each.",
          checks: [
            {
              selector: "#menu-rows tr",
              min: 3,
              message: "#menu-rows has fewer than 3 rows. Your loop should append one <tr> per snack to #menu-rows. If the console shows an error, fix that first.",
            },
            {
              selector: "#menu-rows tr td:nth-child(2)",
              min: 3,
              message: "Your rows need two cells each: the name, then the price. Append both <td>s to the <tr>:  tr.append(name, price);",
            },
            {
              selector: "#menu-rows td",
              text: "₱",
              message: "No price cell shows ₱. Write the price with a template literal:  price.textContent = `₱${snack.price}`;",
            },
          ],
          hint: "for (const snack of snacks) { make a tr, two tds with textContent, append them to the tr, append the tr to rows }",
          solution: "const rows = document.getElementById(\"menu-rows\");\n\nfunction showSnacks(list) {\n  rows.replaceChildren();\n  for (const snack of list) {\n    const tr = document.createElement(\"tr\");\n    const name = document.createElement(\"td\");\n    name.textContent = snack.name;\n    const price = document.createElement(\"td\");\n    price.textContent = `₱${snack.price}`;\n    tr.append(name, price);\n    rows.append(tr);\n  }\n  document.getElementById(\"count\").textContent = `Showing ${list.length} snacks`;\n}\n\nshowSnacks(snacks);",
          explain: "The same table as last week, now built from data. Swap the array for your API's answer and nothing else needs to change.",
        },
        {
          goal: "The count under the table says how many snacks are showing.",
          checks: [
            {
              selector: "#count",
              text: "showing",
              message: "#count should say something like 'Showing 6 snacks'. Write it at the end of showSnacks:  document.getElementById(\"count\").textContent = `Showing ${list.length} snacks`;",
            },
          ],
          hint: "list.length is how many objects are in the list showSnacks was given.",
          solution: "document.getElementById(\"count\").textContent = `Showing ${list.length} snacks`;",
          explain: "length is to an array what size() was to your ArrayList.",
        },
        {
          goal: "Searching 'tur' leaves just Turon.",
          actions: [{ action: "type", target: "#search", value: "tur" }],
          checks: [
            {
              selector: "#menu-rows tr",
              exact: 1,
              message: "After typing tur, #menu-rows should have exactly ONE row. More than one? Clear the rows first with rows.replaceChildren(). None? Look in the console, and check you lowercase both the name and the search.",
            },
            { selector: "#menu-rows td", text: "Turon", message: "The one row left should be Turon." },
            {
              selector: "#count",
              text: "1",
              message: "#count should follow the search: 'Showing 1 snacks' — call showSnacks with the filtered list so the count is written again.",
            },
          ],
          hint: "search 'input' listener → filter snacks by name.toLowerCase().includes(…) → showSnacks(that list).",
          solution: "search.addEventListener(\"input\", function () {\n  const words = search.value.toLowerCase();\n  showSnacks(snacks.filter(snack => snack.name.toLowerCase().includes(words)));\n});",
          explain: "filter is the browser's WHERE clause, and showSnacks draws whatever list it's handed.",
        },
        {
          goal: "Capitals don't matter, and clearing the box brings the whole menu back.",
          actions: [
            { action: "type", target: "#search", value: "KWEK" },
            { action: "type", target: "#search", value: "" },
          ],
          checks: [
            {
              selector: "#menu-rows tr",
              min: 3,
              message: "After typing KWEK and then clearing the box, every snack should be back. If only Kwek-kwek stayed, your listener isn't running on every change. If the rows doubled, clear them first in showSnacks.",
            },
          ],
          hint: "An empty string is included in every name, so \"\" matches everything. Nothing extra to write if both sides are lowercased.",
          solution: "const search = document.getElementById(\"search\");\n\nsearch.addEventListener(\"input\", function () {\n  const words = search.value.toLowerCase();\n  showSnacks(snacks.filter(snack => snack.name.toLowerCase().includes(words)));\n});",
          explain: "One listener, one filter, one function that redraws, and the whole search works.",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Arrays and objects break in ways Java never let you: JavaScript runs on, and the mistake turns up somewhere else.",
      missions: [
        {
          task: "Patient 1. The loop is  for (let i = 0; i <= snacks.length; i++)  and the console says:  Uncaught TypeError: Cannot read properties of undefined (reading 'name').",
          hint: "Six snacks have indexes 0 to 5. What is snacks[6]?",
          check: {
            question: "Diagnosis?",
            choices: [
              "<= runs one step too far. snacks[snacks.length] doesn't exist, so it's undefined, and undefined has no .name. Use <, or for…of",
              "One of the snacks has no name",
              "Arrays start at 1",
            ],
            answer: 0,
            explain:
              "Java would throw ArrayIndexOutOfBoundsException at that line. JavaScript hands you undefined, and the error comes one step later, at .name.",
          },
        },
        {
          task: "Patient 2. Every time someone types in the search box, the table gets longer: the old rows stay and the new ones are added underneath.",
          hint: "What should showSnacks do to #menu-rows before it adds anything?",
          check: {
            question: "Fix?",
            choices: [
              "Reload the page after each search",
              "Start showSnacks with rows.replaceChildren() to empty the table body before building",
              "Use a different tbody for each search",
            ],
            answer: 1,
            explain: "Clear, then build: the shape of every 'redraw this part of the page' function.",
          },
        },
        {
          task: "Patient 3. Every price cell says  ₱undefined.  The code says  price.textContent = `₱${snack.prize}`;",
          hint: "Spell the key exactly as it is in your snack objects.",
          check: {
            question: "Why no error message?",
            choices: [
              "Template literals hide errors",
              "The price is too high",
              "Reading a key that doesn't exist isn't an error in JavaScript. It gives undefined, and the page shows it",
            ],
            answer: 2,
            explain:
              "Java would refuse to compile snack.prize. JavaScript runs and prints undefined, which is why ₱undefined on the page means 'check the spelling of a key'.",
          },
        },
        {
          task: "Patient 4. Each name cell says  [object Object].  The code says  name.textContent = snack;",
          hint: "What did you put into the cell: the whole object, or one of its values?",
          check: {
            question: "Fix?",
            choices: [
              "name.textContent = snack.name;  — a cell shows one value, not a whole object",
              "Use innerHTML instead",
              "Add toString to the object",
            ],
            answer: 0,
            explain:
              "[object Object] is what any object turns into when it's forced into text. You'll see it again; it always means 'an object went where a value should'.",
          },
        },
        {
          task: "Patient 5. Searching Turon finds Turon. Searching turon finds nothing.",
          hint: "\"Turon\".includes(\"turon\"): what does it give?",
          check: {
            question: "Fix?",
            choices: [
              "Tell customers to use capitals",
              "Use == instead of includes",
              "Lowercase both sides before comparing: snack.name.toLowerCase().includes(search.value.toLowerCase())",
            ],
            answer: 2,
            explain: "Capitals count in JavaScript, just as in Java. To match like a person would, compare lowercase with lowercase.",
          },
        },
        {
          task: "Patient 6. A classmate builds rows with  rows.innerHTML += `<tr><td>${snack.name}</td></tr>`;  It works until a snack is saved as  <i>Taho</i>,  and Taho appears in italics on the menu.",
          hint: "One of these two calls reads the text as HTML. Which one, and why does that matter when the names come from a database?",
          check: {
            question: "Why does this course use createElement and textContent instead?",
            choices: [
              "innerHTML is slower to type",
              "textContent always shows text exactly as it is. innerHTML turns it into HTML, so data that contains tags changes the page. Once names come from a database, that's anyone's data",
              "innerHTML doesn't work in tables",
            ],
            answer: 1,
            explain:
              "Italics are harmless, but the same hole lets someone put things on your page that you never wrote. textContent closes it, for free.",
          },
        },
        {
          task: "Patient 7. The console says:  Uncaught ReferenceError: turon is not defined (menu.js:9),  and the search box does nothing. Line 9 is  console.log(turon.name, turon.price);",
          hint: "Search menu.js for turon (Ctrl+F). Is there still a line that MAKES turon?",
          check: {
            question: "Diagnosis?",
            choices: [
              "turon must be written with a capital T",
              "The const turon line was deleted, but a line using turon is still there. The script stops at that line, so nothing after it runs — including the search listener",
              "console.log can't print objects",
            ],
            answer: 1,
            explain:
              "When you delete a name, search the file for it and delete or fix every line that still uses it. An error stops the script at that line, so everything below it silently never happens.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for what undefined on the page tells you.",
          hint: "Think about patients 1 and 3. In both, undefined appeared because something didn't exist. What was missing each time?",
          input: "Paste your seven notes and your rule",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-paper-menu",
    title: "⚔️ Boss battle: The Paper Menu",
    intro: "The Paper Menu wants every row typed by hand, forever. Build it from data instead.",
    boss: { name: "the Paper Menu", emoji: "📜" },
    questions: [
      {
        prompt: "Which object is the row 3 | Kwek-kwek | 20 from SELECT snack_id, name, price FROM snacks?",
        choices: [
          "{ snack_id: 3, name: \"Kwek-kwek\", price: 20 }",
          "[3, Kwek-kwek, 20]",
          "{ 3: \"Kwek-kwek\" }",
        ],
        answer: 0,
        explain: "One key per column, named like the column.",
      },
      {
        prompt: "What is snacks.length for an array of six snack objects?",
        choices: ["5", "6", "undefined"],
        answer: 1,
        explain: "length counts the items, and the last index is length − 1.",
      },
      {
        prompt: "What does document.createElement(\"tr\") do?",
        choices: [
          "Adds a row to the end of every table",
          "Finds the first <tr> on the page",
          "Makes a new <tr> that isn't on the page until you append it somewhere",
        ],
        answer: 2,
        explain: "Create, fill, append. Until the append, nobody sees it.",
      },
      {
        prompt: "snacks.filter(snack => snack.price <= 12) gives…",
        choices: [
          "A new array of just the snacks for ₱12 and under",
          "true or false",
          "The first cheap snack",
        ],
        answer: 0,
        explain: "filter keeps the items where the condition is true, like a WHERE clause.",
      },
      {
        prompt: "You read snack.prize by mistake. What happens?",
        choices: ["A compile error", "undefined, with no error", "The page reloads"],
        answer: 1,
        explain: "A missing key is undefined. The page shows it; the console stays quiet.",
      },
      {
        prompt: "Ctrl+U shows no snack rows, but Inspect shows them. Why?",
        choices: [
          "The rows are hidden with CSS",
          "Ctrl+U only shows <head>",
          "Ctrl+U shows the file as it was sent; Inspect shows the live page your script built",
        ],
        answer: 2,
        explain: "File versus DOM: two different things from now on.",
      },
      {
        prompt: "Why build rows with textContent, not innerHTML?",
        choices: [
          "textContent keeps data as plain text, so a name with tags in it can't change your page",
          "innerHTML doesn't exist",
          "textContent is required by Spring Boot",
        ],
        answer: 0,
        explain: "When the names come from a database, they're other people's data.",
      },
      {
        prompt: "Why does showSnacks start with rows.replaceChildren()?",
        choices: [
          "To make the table faster",
          "To empty the table body, so redrawing doesn't add the rows a second time",
          "To delete the snacks array",
        ],
        answer: 1,
        explain: "Clear, then build.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "How a row of a SELECT becomes a JavaScript object, with one of your own snacks as the example.",
      "The steps your loop takes to put one row on the page.",
      "The difference between the page's source (Ctrl+U) and Inspect.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your menu no longer depends on anyone typing rows into HTML. It depends on an array. Tomorrow the order form stops sending itself off to nowhere and answers the customer instead.",
  },
};
