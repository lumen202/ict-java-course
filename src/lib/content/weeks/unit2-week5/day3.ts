// unit2-week5 · Day 3 — The menu as a table, and the order form
//
// The two pages that mirror Week 4 most directly: menu.html's table IS the
// result grid (ListMenu), and order.html's form IS RecordSale — its inputs
// fill RecordSale's snack_id and qty placeholders (Week 4 day3/day4:
// VALUES (?, ?, ?) with the date passed in; the web app will supply the date),
// named after the sales columns so
// Week 8 can send them straight to the API. Verified on a real Spring Boot
// 4.1.1 build (2026-09-27): a GET submit of a static page
// (/order.html?snack_id=2&qty=3) is a 200; a POST to a static page is a
// Whitelabel "Method Not Allowed, status=405" (with a browser's Accept header).

import type { DayPlan } from "../../types";

export const day3: DayPlan = {
  day: "Day 3",
  focus: "Your menu becomes a real table, and the Order page gets a form — RecordSale with a face",
  warmupGame: {
    kind: "quest",
    id: "warmup-grid-and-form",
    title: "🧩 Warm-up: you've seen these before",
    intro:
      "Today's two new things — a table and a form — are both things you've used since Week 1. You just haven't built them yourself.",
    missions: [
      {
        task: "Picture the result grid you get for  SELECT name, price FROM snacks;  — in SQLTools now, in Workbench before.",
        hint:
          "Four parts to match: the whole grid, one row, one column heading, one value. The four tags are <table>, <tr>, <th> and <td>.",
        check: {
          question: "In HTML, what does each part of that grid become?",
          choices: [
            "The column names become <th> header cells in the first row; each result row becomes a <tr>; each value becomes a <td>",
            "Each column becomes its own <ul>",
            "The whole grid becomes one <p> with spaces",
          ],
          answer: 0,
          explain:
            "<table> is the grid, <tr> a row, <th> a column heading, <td> one value. It's the same shape as every result you've read since Week 1.",
        },
      },
      {
        task: "Your Week 4 RecordSale sent:  INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, ?, ?)  — three placeholders, filled from what you typed when you ran it: the snack, the date, and how many.",
        hint:
          "Cross off what the server can fill in by itself: sale_id (AUTO_INCREMENT) and the date (today). What's left that only Aling Nena can decide?",
        check: {
          question: "On the web, Aling Nena is ordering right now, so the date is simply today — your app can fill that one in itself. Which boxes does the order form still need?",
          choices: [
            "Her name and her password",
            "The date and the sale_id",
            "Which snack (its snack_id) and how many (qty)",
          ],
          answer: 2,
          explain:
            "sale_id comes from AUTO_INCREMENT and the date is today — the server fills both. The form asks only for what a person has to decide. You'll even NAME the boxes snack_id and qty, so in Week 8 they drop straight into those placeholders.",
        },
      },
      {
        task: "When you press a form's Submit button, the browser sends the boxes' values to a server.",
        hint:
          "There's no Java code yet to receive an order. What's the most useful thing Submit could do — something you can SEE with your own eyes?",
        check: {
          question: "Your app has no code to receive an order yet (that's Week 8). So what should Submit do today?",
          choices: [
            "Nothing at all — forms don't work without a database",
            "Send the values in the address bar (a GET), so you can SEE exactly what a server would receive: order.html?snack_id=3&qty=2",
            "Save the order into MySQL directly from the browser",
          ],
          answer: 1,
          explain:
            "With no method set, a form sends its values in the address, after a ?. Reading that address is the best preview there is of what your API will receive in Week 8.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Learn HTML tables in 4 minutes (Bro Code)",
      youtubeId: "aNC6LY34yVM",
      length: "4:43",
      practice: {
        intro: "Turn yesterday's menu list into a table built from your own SELECT:",
        steps: [
          "Run your menu query from queries.sql again (Ctrl+E Ctrl+E):  SELECT name, price FROM snacks ORDER BY price;",
          "In menu.html, replace the <ul> with a <table>. First row: a <tr> with two <th> cells — Snack and Price.",
          "Then one <tr> per row of your result, each with two <td> cells. Every snack, not just three.",
          "Add a caption as the first thing inside <table>:  <caption>Today's menu</caption>.",
        ],
        note: "Skip his border=\"1\", align and style=\"…\" attributes — they still work, but that's the old way. Tomorrow a stylesheet gives your table its borders and colours for every page at once.",
      },
    },
    {
      title: "Learn HTML forms in 10+ minutes (Bro Code)",
      youtubeId: "zIN54lhJtQU",
      length: "17:55",
      practice: {
        intro: "He builds a sign-up form with many kinds of boxes. Watch it all once — then build Aling Nena's much smaller order form in order.html:",
        steps: [
          "Replace the Ordering opens on Wednesday paragraph with a <form>. Leave out action and method for now.",
          "A <label for=\"snack\">Snack</label> and a <select id=\"snack\" name=\"snack_id\"> with one <option> per snack. Each option's value is the snack's snack_id from your snacks table; its text is the name — <option value=\"2\">Turon</option>.",
          "A <label for=\"qty\">How many</label> and an <input type=\"number\" id=\"qty\" name=\"qty\" min=\"1\" max=\"20\" value=\"1\" required>.",
          "A submit button: <button type=\"submit\">Place order</button>.",
          "In Live Server, choose a snack, set 3, press Place order, and read the address bar.",
        ],
        note: "His action=\"index.php\" is for PHP. Yours will point at your own Java app — in Week 8. His enctype attribute is only for uploading files; you won't need it.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: read what your form sends",
      intro:
        "A form is how a web page talks to a server. Before you have a server that listens, learn to read exactly what the page says.",
      missions: [
        {
          task: "In Live Server, choose the snack with snack_id 2, set How many to 3, and press Place order. Read the whole address bar.",
          hint:
            "Open order.html in VS Code and look at the <select> and <input> tags. Which attribute says snack_id and qty, spelled exactly the way they appear in the address bar?",
          check: {
            question: "It ends in  order.html?snack_id=2&qty=3. Where did snack_id and qty come from?",
            choices: [
              "From the name attributes of your <select> and <input> — each box sends name=value, joined with &",
              "From the <label> text",
              "From the id attributes",
            ],
            answer: 0,
            explain:
              "name is what gets sent; id is only for the label to find its box. That's why a box without a name sends nothing at all — the classic 'my form lost a field' bug.",
          },
        },
        {
          task: "Now try to order 0. Then try 50. Then clear the box and press Place order.",
          hint:
            "If 50 went through, your number box has no max=\"20\" — add it, save, and try again. For the question: could someone skip your form completely and type the address with ?qty=-5 by hand?",
          check: {
            question: "The browser refused all three and said why. Does that mean your Week 8 API can trust whatever arrives?",
            choices: [
              "Yes — the browser checked it",
              "No. min, max and required only guard people using YOUR form. Anyone can type order.html?snack_id=2&qty=-5 straight into the address bar. The server must check again",
              "Yes, as long as you use type=\"number\"",
            ],
            answer: 1,
            explain:
              "Try it: type ?snack_id=2&qty=-5 onto the address yourself — nothing stops you. It's Week 4's lesson again: the database's foreign key protected the ledger no matter which program talked to it. Browser checks are for helpfulness; server checks are for safety.",
          },
        },
        {
          task: "Put your form next to your Week 4 RecordSale code.",
          hint:
            "Your Week 4 INSERT was INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, ?, ?). Read the column list left to right: that's the order the ? marks are filled in.",
          check: {
            question: "In Week 8, which part of the order ends up in which ? of the INSERT?",
            choices: [
              "qty goes into sale_id",
              "Nothing — the web version will need a different query",
              "The select's value (snack_id) goes into the first ?, today's date into the second, the number (qty) into the third — the same PreparedStatement you already wrote",
            ],
            answer: 2,
            explain:
              "That's the whole reason for the names. The form is the face; the INSERT you wrote in Week 4 is the brain behind it.",
          },
        },
        {
          task: "Now submit the form to your Java app: open localhost:8080/order.html (restart the app first if it's been running) and place an order.",
          hint:
            "Restart = red square, then Run above main. Then open localhost:8080/order.html and place an order. Is there any Java code in your project yet that reads orders? What does your app do with a file in static/?",
          check: {
            question: "You got order.html back, with ?snack_id=…&qty=… in the address, and nothing was saved. Is that a bug?",
            choices: [
              "No — your app served the page again and ignored the values, because nothing in it handles orders yet. That's Week 8's endpoint",
              "Yes — Spring Boot should save it automatically",
              "Yes — the form is broken",
            ],
            answer: 0,
            explain:
              "The values arrived at your server; there's just no code listening for them yet. Right now it's a front door with nobody behind it.",
          },
        },
        {
          task: "Add today to notes.md: the exact address your form produced, which part came from which name attribute, and the one sentence on why the server must re-check what the browser already checked.",
          hint:
            "After one order, copy the whole address bar (it ends like order.html?snack_id=2&qty=3). Then write: snack_id came from the name of my …, qty came from the name of my …. And one sentence on why the server can't trust what the browser checked.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-menu-table",
      fileName: "menu.html",
      title: "🧪 Checkpoint: your menu table",
      intro: "Paste your whole menu.html from VS Code. The checker reads the table the way a browser does.",
      starter: "<!-- Delete this line, then paste your whole menu.html from VS Code here -->\n",
      tasks: [
        {
          goal: "Paste menu.html. First: a table with a heading row — Snack and Price.",
          checks: [
            {
              selector: "body *",
              message:
                "There's nothing on this page yet. In VS Code open menu.html, press Ctrl+A then Ctrl+C, come back here, select everything in the editor and press Ctrl+V.",
            },
            { selector: "table", message: "No <table> yet — the menu should be a table now, not a list." },
            { selector: "table th", min: 2, message: "Your table needs a heading row with at least two <th> cells: Snack and Price." },
            { selector: "table th", text: "price", message: "None of your <th> headings says Price." },
          ],
          hint: "The first <tr> holds <th> cells (headings); every row after it holds <td> cells (values).",
          solution: "<table>\n  <tr>\n    <th>Snack</th>\n    <th>Price</th>\n  </tr>",
          explain: "<th> isn't just bold text: it tells the browser and screen readers 'this is the name of a column'.",
        },
        {
          goal: "The rows: every snack from your SELECT, two values each.",
          checks: [
            { selector: "table tr", min: 4, message: "Your table has fewer than four rows — the heading row plus at least three snacks. Put in every row your SELECT returned." },
            { selector: "table td", min: 6, message: "Fewer than six <td> cells — each snack row needs two: the name and the price." },
            {
              selector: "ul",
              exact: 0,
              message: "There's still a <ul> on the page. The table replaces the list — delete the old <ul>…</ul>.",
            },
          ],
          hint: "One <tr> per snack, with <td>name</td><td>price</td> inside. Copy one row and edit it for the next.",
          solution: "<tr>\n  <td>Turon</td>\n  <td>12</td>\n</tr>",
          explain: "Rows in the table, rows in the result grid, rows in the snacks table — the same rows all the way down.",
        },
        {
          goal: "A caption that names the table, as the first thing inside it.",
          checks: [
            { selector: "table > caption", message: "No <caption> inside the table. Put <caption>Today's menu</caption> right after <table>." },
          ],
          hint: "<caption> must be the very first thing inside <table>, before the first <tr>.",
          solution: "<table>\n  <caption>Today's menu</caption>",
          explain: "A caption is to a table what an <h1> is to a page: the one line that says what it is.",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-order-form",
      fileName: "order.html",
      title: "🧪 Checkpoint: your order form",
      intro:
        "Paste your whole order.html. This checks that the form would send exactly what RecordSale needs — the boxes, their names, and the rules on the number.",
      starter: "<!-- Delete this line, then paste your whole order.html from VS Code here -->\n",
      tasks: [
        {
          goal: "Paste order.html. First: a form with a snack drop-down whose name is snack_id.",
          checks: [
            {
              selector: "body *",
              message:
                "There's nothing on this page yet. In VS Code open order.html, press Ctrl+A then Ctrl+C, come back here, select everything in the editor and press Ctrl+V.",
            },
            { selector: "form", message: "No <form> on the page yet." },
            { selector: "form select", message: "The form has no <select> drop-down for the snack." },
            {
              selector: "form select[name='snack_id']",
              message: "Your <select> has no name=\"snack_id\". The name is what the form sends — without it, the snack never reaches the server.",
            },
          ],
          hint: "name is what gets sent; id is for the label. The select needs name=\"snack_id\" and id=\"snack\".",
          solution: "<form>\n  <label for=\"snack\">Snack</label>\n  <select id=\"snack\" name=\"snack_id\">",
          explain: "snack_id — the same name as the column. The form speaks the database's language.",
        },
        {
          goal: "The options: at least three snacks, each carrying its snack_id as its value.",
          checks: [
            { selector: "select option", min: 3, message: "Fewer than three <option>s in your drop-down — one per snack." },
            {
              selector: "select option:not([value])",
              exact: 0,
              message: "An <option> has no value. Each needs value=\"…\" set to that snack's snack_id — that number is what gets sent, not the name.",
            },
          ],
          hint: "<option value=\"2\">Turon</option> — the person sees Turon, the server receives 2.",
          solution: "<option value=\"1\">Banana cue</option>\n<option value=\"2\">Turon</option>\n<option value=\"3\">Kwek-kwek</option>",
          explain: "The name is for people; the id is for the database. A foreign key, in a drop-down.",
        },
        {
          goal: "How many: a number box named qty that can't go below 1 and can't be left empty.",
          checks: [
            { selector: "form input[type='number']", message: "No number box — add <input type=\"number\">." },
            {
              selector: "form input[type='number'][name='qty']",
              message: "Your number box has no name=\"qty\", so the quantity would never be sent.",
            },
            {
              selector: "form input[name='qty'][min='1']",
              message: "Your qty box has no min=\"1\" — someone could order 0 or -3 snacks.",
            },
            {
              selector: "form input[name='qty'][required]",
              message: "Your qty box isn't required — someone could submit it empty. Add the word required inside the tag.",
            },
          ],
          hint: "All of it goes inside the one tag: <input type=\"number\" id=\"qty\" name=\"qty\" min=\"1\" max=\"20\" value=\"1\" required>.",
          solution: "<label for=\"qty\">How many</label>\n<input type=\"number\" id=\"qty\" name=\"qty\" min=\"1\" max=\"20\" value=\"1\" required>",
          explain: "Helpful rules for honest users. Remember the lab: the server will still check.",
        },
        {
          goal: "Labels that belong to their boxes, and a button that submits.",
          checks: [
            { selector: "label[for='qty']", message: "No <label for=\"qty\">. The for must match the number box's id, so clicking the label jumps into the box." },
            { selector: "input#qty", message: "Your number box has no id=\"qty\" — the label's for=\"qty\" has nothing to point at." },
            {
              selector: "form button:not([type='button']), form input[type='submit']",
              message: "No submit button inside the form. Add <button type=\"submit\">Place order</button> before </form>.",
            },
          ],
          hint: "label for=\"…\" and input id=\"…\" must be the same word.",
          solution: "<button type=\"submit\">Place order</button>\n</form>",
          explain: "A form that says what each box is, sends what the server needs, and refuses nonsense. That's RecordSale's face, done.",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Forms and tables fail quietly — no red text anywhere. Diagnose each from what the student saw.",
      missions: [
        {
          task: "Patient 1. After submitting, the address is  order.html?qty=3  — no snack_id at all, even though the student picked Turon.",
          hint:
            "The address shows qty but not snack_id. What does the qty box have that the <select> must be missing?",
          check: {
            question: "What's missing from the <select>?",
            choices: [
              "An id",
              "A name. Only boxes with a name attribute are sent; the id is just for the label",
              "A label",
            ],
            answer: 1,
            explain: "The quiet bug: the page looks perfect and one value simply never leaves the browser.",
          },
        },
        {
          task: "Patient 2. The address says  order.html?snack_id=Turon&qty=3.",
          hint:
            "The address has a word where a number should be. What does an <option> send when it has no value=\"…\"?",
          check: {
            question: "Why is that a problem for Week 8's INSERT, and what's the fix?",
            choices: [
              "It isn't a problem",
              "The qty should be a word too",
              "The option has no value, so the browser sent its text. The INSERT needs the number: <option value=\"2\">Turon</option>",
            ],
            answer: 2,
            explain: "snack_id is an INT and a foreign key. 'Turon' would be refused — or worse, silently mean nothing.",
          },
        },
        {
          task: "Patient 3. The student added method=\"post\" to the form, and at localhost:8080 pressing Place order shows a Whitelabel Error Page: type=Method Not Allowed, status=405.",
          hint:
            "405 is not 404 — the address exists. What did the student change about HOW the form sends?",
          check: {
            question: "What happened?",
            choices: [
              "POST sends the values to the server to act on — and a plain .html file in static/ can't act on anything. Nothing in your app accepts a POST yet. Remove method for now; Week 8 adds the endpoint that will",
              "The form has too many boxes",
              "Port 8080 blocks forms",
            ],
            answer: 0,
            explain:
              "Read the status like any other: 405 means the address exists but doesn't accept that kind of request. In Week 8 you'll write the Java that does — and POST is exactly what it will accept.",
          },
        },
        {
          task: "Patient 4. Clicking the words How many does nothing; clicking the box works. The code is  <label for=\"quantity\">How many</label> <input id=\"qty\" …>",
          hint:
            "Compare the word inside for=\"…\" with the word inside id=\"…\", letter by letter.",
          check: {
            question: "Fix?",
            choices: [
              "Put the label after the input",
              "Make the label's for and the input's id the same word — for=\"qty\"",
              "Labels can't be clicked",
            ],
            answer: 1,
            explain: "for points at an id. Screen readers use the same link to say what a box is for.",
          },
        },
        {
          task: "Patient 5. The menu table shows every value squashed into the first column, one after another. Each snack's row is  <tr><td>Turon 12</td></tr>.",
          hint:
            "Count the <td>s in one row. How many columns does the table have?",
          check: {
            question: "What's wrong?",
            choices: [
              "The table needs a border",
              "The price needs quotes",
              "Name and price are in ONE <td>. Each value gets its own cell: <td>Turon</td><td>12</td>",
            ],
            answer: 2,
            explain: "One value per cell, same as the result grid — one column, one value.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then the one rule about forms you'd give a classmate.",
          hint:
            "One line per patient, like: 'Patient 2: snack_id=Turon → the option has no value → add value=\"2\".' Then one rule about forms.",
          input: "Paste your five notes and your rule",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-empty-order",
    title: "⚔️ Boss battle: The Empty Order",
    intro: "The Empty Order sends forms with nothing in them and tables with no columns. Beat it with everything you built today.",
    boss: { name: "the Empty Order", emoji: "🧾" },
    questions: [
      {
        prompt: "Which tag is ONE value inside a table row?",
        choices: ["<tr>", "<td>", "<table>"],
        answer: 1,
        explain: "tr = row, td = one cell of data, th = a heading cell.",
      },
      {
        prompt: "What does a form actually send for each box?",
        choices: ["Its label text", "Its id and its value", "Its name and its value — name=value"],
        answer: 2,
        explain: "No name, nothing sent.",
      },
      {
        prompt: "<option value=\"3\">Kwek-kwek</option> is chosen. What does the server receive?",
        choices: ["snack_id=3", "snack_id=Kwek-kwek", "Kwek-kwek=3"],
        answer: 0,
        explain: "The value is sent; the text is what the person sees.",
      },
      {
        prompt: "min=\"1\" on the qty box. Does your API still need to check the quantity?",
        choices: [
          "No, the browser already checked",
          "Yes — anyone can type ?qty=-5 into the address bar, skipping your form entirely",
          "Only if the user is a teacher",
        ],
        answer: 1,
        explain: "Browser checks help honest people. Server checks protect the ledger.",
      },
      {
        prompt: "A form with no method attribute sends its values…",
        choices: ["in the address, after a ? — a GET", "hidden, in the page body — a POST", "nowhere until you add JavaScript"],
        answer: 0,
        explain: "That's why you could read your order in the address bar today.",
      },
      {
        prompt: "POST to a static .html page at localhost:8080 gives status 405. What does 405 mean?",
        choices: ["The page doesn't exist", "The server crashed", "The address exists, but it doesn't accept that kind of request"],
        answer: 2,
        explain: "Compare 404 (nothing at this address) — the number tells you how far you got.",
      },
      {
        prompt: "Which two sales columns does the order form collect?",
        choices: ["sale_id and sold_on", "snack_id and qty", "name and price"],
        answer: 1,
        explain: "The server fills sale_id (AUTO_INCREMENT) and sold_on (the date). People choose only what people know.",
      },
      {
        prompt: "Why does a <th> row come first in the menu table?",
        choices: [
          "It names the columns, like the column headings above a result grid",
          "Browsers require at least one bold row",
          "It makes the table wider",
        ],
        answer: 0,
        explain: "Headings are information, not decoration — screen readers announce them with every cell.",
      },
      {
        prompt: "<label for=\"qty\"> only works if…",
        choices: ["it comes after the input", "the input has id=\"qty\"", "the input has name=\"qty\""],
        answer: 1,
        explain: "for points at an id. (name is what gets SENT — different job.)",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The exact address your form produced when you ordered, and what each part means.",
      "The difference between a box's name and its id, in one line.",
      "Why your Week 8 API must check the quantity even though the form already does.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Every page now does something real: the menu shows your data, the form produces exactly what your INSERT needs. It just looks like 1995 — tomorrow it gets a stylesheet.",
  },
};
