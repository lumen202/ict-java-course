// unit2-week5 · Day 5 — Finish, audit, and the page nobody else has
//
// Wrap-up day: no video. The week's twist (index.ts) lands here — tables.html,
// a page about the pair of tables each student designed in Week 3, built from
// their own DESCRIBE output — so no two students' sites end the week the same.
// The checkpoint's checks are deliberately loose (counts, not names): every
// student's Week 3 design differs, and each task keeps the stuck exit.

import type { DayPlan } from "../../types";

export const day5: DayPlan = {
  day: "Day 5",
  focus: "Finish the site, add the page only you can make, and check every part of it yourself",
  warmupGame: {
    kind: "quest",
    id: "warmup-week-map",
    title: "🗺️ Warm-up: the whole week on one map",
    intro: "Before the last push, put every piece of this week next to the Week 4 piece it came from.",
    missions: [
      {
        task: "Match the page to the Week 4 CanteenApp option it gives a face to: menu.html.",
        hint:
          "Which CanteenApp option ran SELECT name, price FROM snacks and printed the rows?",
        check: {
          question: "menu.html is the face of…",
          choices: ["RecordSale", "ListMenu — SELECT name, price FROM snacks, as a table", "LookupSnack"],
          answer: 1,
          explain: "The rows you typed into the table are the rows ListMenu printed. In Week 8 your app fills them in itself.",
        },
      },
      {
        task: "order.html's form sends  ?snack_id=2&qty=3.",
        hint:
          "Monday's chain: browser → ? → MySQL. Can a browser ever talk to MySQL directly?",
        check: {
          question: "In Week 8 those two values go…",
          choices: [
            "to your Java app, into RecordSale's ? placeholders (with today's date filled in by the app) — then MySQL",
            "straight from the browser into MySQL",
            "nowhere; forms are only for show",
          ],
          answer: 0,
          explain: "Browser → your app at 8080 → MySQL at 3306. The chain from Monday's warm-up, with a real form at the front.",
        },
      },
      {
        task: "Your app serves index.html, menu.html, order.html, style.css and your picture — all from static/.",
        hint:
          "Apart from /hello on Monday, have you written any Java this week? What does your app do with a file in static/?",
        check: {
          question: "Right now, is your Java app doing anything besides handing those files out?",
          choices: [
            "Yes — it reads the ledger for the menu",
            "Yes — it saves orders",
            "Only /hello from Monday. Everything else is files, served as-is. From Week 7 the Java side starts answering with data",
          ],
          answer: 2,
          explain: "That's the honest state of the project: a good-looking front with one small endpoint behind it. The next weeks build the part behind the page.",
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
      title: "🛠️ Real lab: the page nobody else has",
      intro:
        "In Week 3 you designed a pair of tables of your own — your own topic, your own columns, a foreign key between them. Today they get a page on your site. Nobody else's site has this page, because nobody else designed those tables.",
      missions: [
        {
          task: "In queries.sql, run DESCRIBE on each of your two Week 3 tables (Ctrl+E Ctrl+E). If they live in a different database than school, add a second SQLTools connection for it — same steps as Monday, different Database.",
          hint:
            "Forgot your Week 3 tables' names or database? Run SHOW DATABASES; in queries.sql to find the database, then SHOW TABLES FROM thatdatabase; — then DESCRIBE thatdatabase.tablename; for each table. Writing the database name in front with a dot works even without a second connection.",
          input: "Paste both DESCRIBE results (the Field, Type and Key columns are enough)",
        },
        {
          task: "In static/, create tables.html with the same skeleton, <link> to style.css and nav links as your other pages. Add a Tables link to the nav on EVERY page, so all four pages link to all four.",
          hint:
            "Easiest way: copy the whole <head> and the nav links from index.html into tables.html, then add <a href=\"tables.html\">Tables</a> to the nav in all four pages. For the question: does anything in plain HTML put a new link into every page for you?",
          check: {
            question: "You now have four pages and each has the same nav. What's the cost of adding a fifth page later?",
            choices: [
              "Nothing — the nav updates itself",
              "Editing the nav in every page by hand. It's the one thing plain HTML files can't share the way style.css shares your look",
              "You'd need a new stylesheet",
            ],
            answer: 1,
            explain:
              "A real limit of plain pages, and worth noticing. Later in the course, your Java app and JavaScript can build shared parts of pages for you — but for now, copy carefully and check every link.",
          },
        },
        {
          task: "Fill tables.html: an <h1> naming your topic; a <p> saying what the two tables store; then one <table> per Week 3 table, showing its columns — a Column and a Type heading, one row per field from your DESCRIBE. Mark the primary key and foreign key rows with class=\"key\" and style .key in style.css.",
          hint:
            "One table at a time. First row: <tr><th>Column</th><th>Type</th></tr>. Then one <tr> for each line of your DESCRIBE — the Field in the first <td>, the Type in the second. Rows whose Key says PRI or MUL get class=\"key\". For the question: if the page and the real table disagree, which one is right?",
          check: {
            question: "Why build these from your DESCRIBE output instead of from memory?",
            choices: [
              "It's faster",
              "The page is documentation — if it disagrees with the real table, it's wrong. DESCRIBE is the truth; your memory of Week 3 isn't",
              "DESCRIBE writes the HTML for you",
            ],
            answer: 1,
            explain: "The same habit as Week 4's 'know exactly what you're connecting to': the database is the source of truth, and everything else copies it.",
          },
        },
        {
          task: "Finish the page with the question your tables answer: an <h2> saying Question, a <p> with the question in plain words, and a <pre> containing the SELECT (with its JOIN) that answers it. Run it from queries.sql first — it must work.",
          hint:
            "Pick a question that needs BOTH tables, like 'which X belongs to which Y?'. The SELECT has FROM one table INNER JOIN the other ON the foreign key column = the primary key column — the same shape as sales.snack_id = snacks.snack_id. Run it in queries.sql first, and only copy it to the page once it returns rows.",
          input: "Paste your question and the SELECT, exactly as they appear on your page",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-tables-page",
      fileName: "tables.html",
      title: "🧪 Checkpoint: your tables page",
      intro: "Paste tables.html into the top box and your style.css into the bottom one.",
      starter: "<!-- Delete this line, then paste your whole tables.html from VS Code here -->\n",
      stylesheet: "/* Delete this line, then paste your whole style.css from VS Code here */\n",
      tasks: [
        {
          goal: "Paste both files. First: a page of the site — one heading, the stylesheet link, and a nav to the other pages.",
          checks: [
            {
              selector: "body *",
              message: "The top box doesn't have your tables.html yet. Paste the whole file from VS Code.",
            },
            { selector: "h1", exact: 1, message: "The page needs exactly one <h1> — the name of your topic." },
            {
              selector: "link[rel='stylesheet'][href='style.css']",
              message: "No <link rel=\"stylesheet\" href=\"style.css\"> in the <head> — this page wouldn't match the rest of the site.",
            },
            {
              selector: "a[href^='/']",
              exact: 0,
              message: "A link starts with a slash, which breaks in Live Server. Make it relative: href=\"menu.html\".",
            },
            { selector: "a[href='index.html']", message: "No link to index.html in the nav." },
            { selector: "a[href='menu.html']", message: "No link to menu.html in the nav." },
            { selector: "a[href='order.html']", message: "No link to order.html in the nav." },
          ],
          hint: "Copy the <head> and the nav from menu.html, then change the title and the <h1>.",
          solution:
            "<head>\n  <title>My tables — Aling Nena's Canteen</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>\n<body>\n  <a href=\"index.html\">Home</a>\n  <a href=\"menu.html\">Menu</a>\n  <a href=\"order.html\">Order</a>\n  <a href=\"tables.html\">Tables</a>\n  <h1>Barangay library</h1>",
          explain: "Four pages, one nav, one stylesheet. That's a site.",
        },
        {
          goal: "Your two Week 3 tables, each as an HTML table of its columns.",
          checks: [
            { selector: "table", min: 2, message: "Fewer than two <table>s — one for each of your Week 3 tables." },
            { selector: "table th", min: 4, message: "Each table needs a heading row (at least Column and Type) — that's four <th> cells across two tables." },
            { selector: "table td", min: 8, message: "Fewer than eight <td> cells. Each table needs one row per column from your DESCRIBE — every column, not just the key." },
          ],
          hint: "One row per field: <tr><td>book_id</td><td>INT</td></tr>. Copy your DESCRIBE output row by row.",
          solution:
            "<table>\n  <caption>books</caption>\n  <tr><th>Column</th><th>Type</th></tr>\n  <tr class=\"key\"><td>book_id</td><td>INT</td></tr>\n  <tr><td>title</td><td>VARCHAR(100)</td></tr>\n</table>",
          explain: "A page that documents a database — something real teams keep for every table they own.",
        },
        {
          goal: "The keys stand out: rows marked with class=\"key\", styled in style.css.",
          checks: [
            { selector: ".key", min: 2, message: "Fewer than two elements with class=\"key\" — mark at least each table's primary key row." },
            {
              selector: ".key",
              cssNot: { property: "font-weight", value: "400" },
              message: "Your .key rows look like every other row. Add a .key rule to style.css — for example .key { font-weight: bold; }",
            },
          ],
          hint: "In HTML: class=\"key\" (no dot). In style.css: .key { font-weight: bold; } (with the dot).",
          solution: ".key {\n  font-weight: bold;\n}",
          explain: "A class is how you style some rows without styling all of them.",
        },
        {
          goal: "The question your tables answer, and the SELECT that answers it.",
          checks: [
            { selector: "h2", text: "question", message: "No <h2> that says Question." },
            {
              selector: "pre",
              text: "select",
              message: "No <pre> containing your SELECT. Put the query that answers your question inside <pre>…</pre>.",
            },
            {
              selector: "pre",
              text: "join",
              message: "Your query has no JOIN. The question should need BOTH of your tables — that's what your foreign key is for.",
            },
          ],
          hint: "<pre> keeps the query's line breaks exactly as you typed them, so it reads like it does in your queries.sql.",
          solution:
            "<h2>Question</h2>\n<p>Which books are borrowed right now, and by whom?</p>\n<pre>\nSELECT books.title, loans.borrower\nFROM loans\nINNER JOIN books ON loans.book_id = books.book_id;\n</pre>",
          explain: "In Week 8 this page is the first on your site to show that query's answer live, from your own API.",
        },
      ],
    },
    {
      id: "self-audit",
      title: "🔍 Audit your own site",
      steps: [
        "Run your app, open localhost:8080, and mark each line below ✅ or ❌ honestly — by clicking and looking, not from memory.",
        "My project is my own Spring Boot project, and all my pages are in src/main/resources/static.",
        "localhost:8080 shows my front page, and localhost:8080/hello still answers.",
        "All four pages — index, menu, order, tables — have the same nav, and every link works at localhost:8080 AND in Live Server.",
        "No link, src or href in my project starts with a slash or a C:\\ path.",
        "Every page has exactly one <h1> and its own <title>.",
        "My menu is a <table> with a heading row, built from my own SELECT, with every snack.",
        "My order form sends snack_id and qty — I've read them in the address bar — and refuses 0 and an empty box.",
        "My picture shows at localhost:8080, has alt text, and its file name is lowercase with no spaces.",
        "Every page links style.css, and changing one colour in style.css changes every page.",
        "My tables page matches my real DESCRIBE output, and its SELECT runs from my queries.sql.",
        "For every ❌: fix it now. Everything you need is in this week's four days, and the day is yours.",
      ],
      tip: "Not sure how to fix a ❌? Go back to the day it came from: project, pages in static/, one <h1> → Monday. Links, slashes, pictures → Tuesday. Table and form → Wednesday. style.css → Thursday. Each day's error clinic lists the usual causes, and each checkpoint still works — paste the page in again and it tells you the first thing that's missing.",
      submit: "Paste the list with your ✅/❌ marks, and for each ❌ you fixed, one line on what was wrong",
    },
    {
      kind: "upload",
      id: "screenshot-final-site",
      title: "📤 Hand in: your site, finished",
      intro: "The week's closing hand-in: the page only you could make, served by your own app.",
      steps: [
        "Restart your app so it serves the finished files.",
        "Open localhost:8080/tables.html.",
        "Make sure the address bar and the whole page — your tables and your question — are visible. Zoom out (Ctrl and −) if it doesn't fit.",
        "Press Windows+Shift+S and capture the screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves:
        "your own Week 3 tables — their real columns, your key rows styled by your own stylesheet, and the question only you asked — on a page served at localhost:8080 by the project you created on Monday. Nobody else's screenshot has these tables.",
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-week5",
    title: "⚔️ Boss battle: The Static Site",
    intro: "The whole week in one fight. Every page, every path, every rule.",
    boss: { name: "the Static Site", emoji: "🌐" },
    questions: [
      {
        prompt: "Browser → your app at 8080 → MySQL at 3306. In that chain, what is your Java app?",
        choices: [
          "Only a server",
          "A server to the browser, and a client of MySQL — it answers one and asks the other",
          "Only a client",
        ],
        answer: 1,
        explain: "Monday's picture, and the whole unit in one line.",
      },
      {
        prompt: "Where do the pages your app serves as-is live?",
        choices: ["src/main/resources/static", "src/main/resources/templates", "the project's top folder"],
        answer: 0,
        explain: "static/ — served exactly as written.",
      },
      {
        prompt: "Which src works for static/images/menu-board.jpg from a page in static/, everywhere?",
        choices: ["/images/menu-board.jpg", "C:\\…\\images\\menu-board.jpg", "images/menu-board.jpg"],
        answer: 2,
        explain: "Relative — works in both servers and on every machine.",
      },
      {
        prompt: "A snack drop-down sends snack_id=Turon instead of snack_id=2. Fix?",
        choices: ["Rename the snack", "Give each <option> a value: <option value=\"2\">Turon</option>", "Use a number box instead"],
        answer: 1,
        explain: "The value is sent; the text is shown.",
      },
      {
        prompt: "Which pair is correct?",
        choices: [
          "HTML class=\"key\" · CSS .key { … }",
          "HTML class=\".key\" · CSS key { … }",
          "HTML id=\"key\" · CSS .key { … }",
        ],
        answer: 0,
        explain: "Dot in CSS only. # would select an id.",
      },
      {
        prompt: "What does a browser show for a page that doesn't exist at localhost:8080?",
        choices: ["A Whitelabel page with status 405", "A blank white page with status 200", "A Whitelabel page with status 404"],
        answer: 2,
        explain: "404 = nothing at this address. 405 = the address exists but refuses that kind of request.",
      },
      {
        prompt: "Why must your API re-check qty when the form has min=\"1\"?",
        choices: [
          "Because min doesn't work in Chrome",
          "Because anyone can send ?qty=-5 without using your form",
          "It doesn't need to",
        ],
        answer: 1,
        explain: "Browser checks help honest users; server checks protect the ledger.",
      },
      {
        prompt: "A CSS rule has a misspelled property. What do you see?",
        choices: ["Nothing — it's silently ignored", "A red error in the browser", "A Whitelabel page"],
        answer: 0,
        explain: "Hover the wavy underline in VS Code, or Inspect the element.",
      },
      {
        prompt: "Your picture works while you develop but vanishes later. The file is Turon.png and the src says turon.png. Why?",
        choices: [
          "PNG files expire",
          "Not every server ignores capitals the way Windows folders do. Lowercase names, typed exactly",
          "Pictures must be in templates/",
        ],
        answer: 1,
        explain: "A 'works on my machine' bug you now know how to prevent.",
      },
      {
        prompt: "Every row on your site is typed into the pages by hand. What's the Java side's job, starting Week 7?",
        choices: [
          "Nothing new — pages are the whole app",
          "Moving the site to Live Server",
          "Answering with real data from MySQL, so pages don't have to be typed",
        ],
        answer: 2,
        explain: "A web API — the part of your project behind the pages you built this week.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket for the week — type these into the turn-in box below:",
    steps: [
      "Your four pages and the one-line job of each.",
      "The chain in words: what talks to what, on which port, and which part your Java app plays.",
      "The mistake you made most this week, and how you'll catch it next time.",
      "Which page you're proudest of, and why.",
      "One question you still have.",
    ],
    note: "You built a website from an empty folder, in your own Java project, served by your own server. It can't remember anything yet — every row is typed by hand. Next, you make pages that react; after that, the Java side starts answering with real data.",
  },
};
