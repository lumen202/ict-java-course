// unit2-week6 · Day 1 — A script of your own
//
// First JavaScript day. Students already know Java (teacher, 2026-09-03), so
// the day teaches what is DIFFERENT — no types, ===, a script that runs on
// load in the customer's browser — never what a variable or an if is.
// Milestone: static/index.js, linked last in index.html's <body>, logs a line
// and writes the greeting and today's special onto the page.
//
// The checkpoint is a script checkpoint (html-sandbox with `script`): the page
// really runs, in an isolated sandbox, and log checks read its console.
// Videos (transcripts read 2026-10-11): Bro Code's JS intro (Ihy0QziLDf0, 12:03
// — index.js, script at the end of body, console.log, textContent) and strict
// equality (O7aUm0AuUy4, 3:58).

import type { DayPlan } from "../../types";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "A script of your own — the console, and a page that writes its own greeting",
  warmupGame: {
    kind: "quest",
    id: "warmup-java-to-js",
    title: "☕ Warm-up: from Java to JavaScript",
    intro: "You already write Java. Three things change today; this is a look at them before the videos.",
    missions: [
      {
        task: "Remember Monday of last week: browser → your Java app at 8080 → MySQL at 3306. Your Java code runs inside your app, on the lab computer. JavaScript is different.",
        hint:
          "The script file sits in static/ like style.css. Who downloads files from static/, and what do they do with a stylesheet once it arrives?",
        check: {
          question: "Aling Nena's customer opens order.html on her phone. Where does order.js run?",
          choices: [
            "On your Spring Boot app, before the page is sent",
            "On the customer's phone, inside her browser — your app only hands the file over, like style.css",
            "Inside MySQL",
          ],
          answer: 1,
          explain:
            "Your app serves index.js the same way it serves style.css: as a file. The browser downloads it and runs it. That's why your Java code and your JavaScript can't simply call each other — they run on different machines.",
        },
      },
      {
        task: "In Java you write  String special = \"Turon\";  In JavaScript you write  const special = \"Turon\";",
        hint:
          "Look for the word that's missing on the JavaScript side. What did String tell the Java compiler?",
        check: {
          question: "What disappeared?",
          choices: [
            "The semicolon",
            "The quotes",
            "The type. A JavaScript variable has no type of its own — const just means 'this name won't point at anything else'",
          ],
          answer: 2,
          explain:
            "const for a name you never reassign, let for one you do. The value still has a type (\"Turon\" is a string), but the variable doesn't, so the same let can hold a number now and text later. Java would refuse; JavaScript won't.",
        },
      },
      {
        task: "System.out.println(\"hello\") prints to the terminal at the bottom of VS Code. JavaScript has  console.log(\"hello\").",
        hint:
          "The script runs in the browser (mission 1). Where would a browser keep its own messages?",
        check: {
          question: "Where does console.log print?",
          choices: [
            "In the browser's console: F12 (or right-click → Inspect), then the Console tab",
            "In VS Code's terminal, under your Spring Boot log",
            "On the page itself, under the last paragraph",
          ],
          answer: 0,
          explain:
            "The console is also where every error in your script appears. Today's rule: keep it open whenever you're working on a script.",
        },
      },
    ],
  },
  videos: [
    {
      title: "JavaScript tutorial for beginners (Bro Code)",
      youtubeId: "Ihy0QziLDf0",
      length: "12:03",
      practice: {
        intro: "He makes index.html, style.css and index.js in a folder on his desktop. You already have the first two in static/; add the third there.",
        steps: [
          "In VS Code, in src/main/resources/static, create index.js.",
          "In index.html, add  <script src=\"index.js\"></script>  as the very last line inside <body>, just above </body>. He explains why near the end of the setup: the page's elements must exist before the script runs.",
          "In index.js, type  console.log(\"index.js is running\");  and save. Open index.html with Live Server (right-click index.html → Open with Live Server).",
          "Open the browser's tools: press F12 (on a laptop: Fn+F12), or right-click anywhere on the page → Inspect. If a box asks 'Open DevTools?', click Open. At the top of the panel, click Console (if you can't see it, click » and pick Console). Your line is there.",
          "In index.html, just under the <h1>, add an empty paragraph:  <p id=\"greeting\"></p>.  (If your page already has a welcome sentence there, delete it: the greeting replaces it.)",
          "In index.js, add  document.getElementById(\"greeting\").textContent = \"Welcome! The canteen is open.\";  Save. The empty paragraph now has words that are in no HTML file.",
        ],
        note: "Skip his window.alert() lines. A pop-up that freezes the page has no place on Aling Nena's site.",
      },
    },
    {
      title: "Learn JavaScript STRICT EQUALITY in 3 minutes (Bro Code)",
      youtubeId: "O7aUm0AuUy4",
      length: "3:58",
      practice: {
        intro: "Predict before you run: write your guesses in notes.md first.",
        steps: [
          "Type these two lines at the very end of index.js:  console.log(12 == \"12\");  and  console.log(12 === \"12\");",
          "Write your prediction for each one in notes.md, then save and read the console.",
          "Delete the two lines again. From today, every comparison you write uses === (and !== for 'not equal').",
        ],
        note: "Java's == on two Strings asks 'are these the same object?', which is why Java needs .equals() to compare Strings. JavaScript's === compares values and types, and it's the one you always want.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: index.js on your own site",
      intro:
        "Your front page gets a script: a greeting that depends on the time of day, and today's special written in by JavaScript. Keep the console open the whole time.",
      missions: [
        {
          task: "In index.js, delete the greeting line from the video (the one with \"Welcome! The canteen is open.\") and type this in its place. Keep console.log(\"index.js is running\"); as the first line. The if is plain Java:",
          code: "const hour = new Date().getHours();\nlet greeting;\nif (hour < 12) {\n  greeting = \"Good morning!\";\n} else {\n  greeting = \"Good afternoon!\";\n}\ndocument.getElementById(\"greeting\").textContent = `${greeting} The canteen is open until 4 PM.`;",
          hint:
            "The last line uses backticks (`), not quotes: text in backticks is a 'template literal', and ${greeting} inside it is replaced by the variable's value, like \"…\" + greeting + \"…\" in Java. The backtick key is usually left of the 1 key.",
          check: {
            question: "It's 9:30 in the morning. Which word in the code decides that you read 'Good morning!'?",
            choices: [
              "const, because it can't change",
              "The if (hour < 12) — getHours() gives 9, and 9 < 12 is true",
              "The backticks",
            ],
            answer: 1,
            explain:
              "new Date() is the time on the computer the script runs on. Mission 1 of the warm-up says whose computer that is: the customer's. Her phone's clock decides the greeting, not your server's.",
          },
        },
        {
          task: "In index.html, find the paragraph with today's special. Delete the words inside it and give it an id, so it's empty:  <p id=\"special\"></p>.  Then type these lines at the very end of index.js, with your own special from last week's query:",
          code: "const special = \"Turon\";\nconst price = 12;\ndocument.getElementById(\"special\").textContent = `Today's special: ${special} — ₱${price}`;",
          hint:
            "Change only \"Turon\" and 12 to your own special's name and price. The ₱ is just a character inside the text; copy it from this page if your keyboard has no ₱ key. Save: the paragraph should now say Today's special: … — ₱….",
        },
        {
          task: "Break it on purpose: in index.html, cut the line  <script src=\"index.js\"></script>  and paste it inside <head>, just above </head>. Save and read the console. Then move it back to the last line of <body> and save again.",
          hint: "The console line ends with index.js and a line number. Which element was the script looking for, and had the browser reached it yet?",
          check: {
            question: "With the script tag in <head>, the console turned red: Cannot set properties of null (setting 'textContent'). Why?",
            choices: [
              "The script ran while the browser was still reading <head>, before the paragraphs existed. getElementById found nothing and returned null",
              "Scripts aren't allowed in <head>",
              "The id is spelled wrong",
            ],
            answer: 0,
            explain:
              "null is JavaScript's 'nothing found'. That's why Bro Code puts the script tag last in <body>, and why yours is back there now.",
          },
        },
        {
          task: "Restart your app (red square, then Run above main) and open localhost:8080. Press F12 → Console.",
          hint:
            "If the console is empty at 8080 but works in Live Server, the app is still serving the files from before your restart. Stop it, run it again, and reload the page.",
          check: {
            question: "'index.js is running' appears at localhost:8080 too. Who gave the browser index.js this time?",
            choices: [
              "Live Server",
              "VS Code",
              "Your Spring Boot app — it serves static/index.js exactly like static/style.css",
            ],
            answer: 2,
            explain:
              "Same file, same rule as every other file in static/. Nothing in your Java code changed.",
          },
        },
        {
          task: "Type one more line at the very bottom of index.js:  price = 15;  Save and read the console. Then delete that line and save again.",
          hint:
            "Look at the word in front of price where you first made it.",
          check: {
            question: "The console says: Uncaught TypeError: Assignment to constant variable. What does that mean?",
            choices: [
              "15 isn't a valid price",
              "price was made with const, which can never point at a new value. Use let for a value that changes",
              "The page can't show numbers",
            ],
            answer: 1,
            explain:
              "Java's final, with one difference: Java refuses before the program runs, while JavaScript only stops at that line, and the console is the only place it says so.",
          },
        },
        {
          task: "Your whole index.js should now look like this (with your own special and price). Compare it line by line and fix any difference. Then add today to notes.md: what index.js does, your two predictions about == and ===, what really happened, and the one error you hit today with its fix.",
          code: "console.log(\"index.js is running\");\nconst hour = new Date().getHours();\nlet greeting;\nif (hour < 12) {\n  greeting = \"Good morning!\";\n} else {\n  greeting = \"Good afternoon!\";\n}\ndocument.getElementById(\"greeting\").textContent = `${greeting} The canteen is open until 4 PM.`;\nconst special = \"Turon\";\nconst price = 12;\ndocument.getElementById(\"special\").textContent = `Today's special: ${special} — ₱${price}`;",
          hint:
            "Copy the error's exact red text from the console, then one line on what caused it. That habit is the whole week.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-index-script",
      fileName: "index.html",
      scriptFile: "index.js",
      title: "🧪 Checkpoint: your page runs a script",
      intro:
        "Paste index.html into the top box and index.js into the bottom one. This checker really runs your script, the same way your browser does. ▶ Run shows your page, and the console under the preview shows what it printed.",
      starter: "<!-- Delete this line, then paste your whole index.html from VS Code here -->\n",
      script: "// Delete this line, then paste your whole index.js from VS Code here\n",
      tasks: [
        {
          goal: "Paste both files. First: index.html loads index.js, as the last thing in <body>.",
          checks: [
            { selector: "body h1", message: "The top box doesn't have your index.html yet (no <h1> found). Paste the whole file." },
            {
              selector: "script[src='index.js']",
              message: "index.html has no <script src=\"index.js\"></script>. Without it, the browser never loads your script.",
            },
            {
              selector: "head script[src='index.js']",
              exact: 0,
              message: "Your script tag is in <head>, so it runs before the page's paragraphs exist. Move it to the last line of <body>.",
            },
            {
              selector: "body > script[src='index.js']:last-child",
              message: "The script tag should be the LAST thing inside <body>, after every paragraph, just above </body>.",
            },
          ],
          hint: "Last line inside <body>:  <script src=\"index.js\"></script>  — relative, like your style.css link.",
          solution: "  <script src=\"index.js\"></script>\n</body>",
          explain: "The page is built first, then the script runs. That order is why getElementById can find things.",
        },
        {
          goal: "The script says it's running, in the console.",
          checks: [
            {
              log: "index.js is running",
              message: "Nothing in the console says 'index.js is running'. Make  console.log(\"index.js is running\");  the first line of index.js.",
            },
          ],
          hint: "Press ▶ Run and look at the console under the preview. If it shows a red line, fix that first: an error stops the script at that line.",
          solution: "console.log(\"index.js is running\");",
          explain: "When a page 'does nothing', this line tells you if the script loaded at all.",
        },
        {
          goal: "The greeting paragraph is filled in by your script.",
          checks: [
            { selector: "#greeting", message: "No element with id=\"greeting\" on the page. Add  <p id=\"greeting\"></p>  under your <h1>." },
            {
              selector: "#greeting:not(:empty)",
              message: "#greeting is still empty. Is the id in getElementById(\"greeting\") spelled exactly the same as in the HTML?",
            },
          ],
          hint: "document.getElementById(\"greeting\").textContent = …  — the id goes in quotes, with no #.",
          solution: "document.getElementById(\"greeting\").textContent = `${greeting} The canteen is open until 4 PM.`;",
          explain: "The paragraph is empty in your HTML and full on the page. JavaScript wrote it after the page loaded.",
        },
        {
          goal: "Today's special is written by the script, with its price in pesos. In your HTML the paragraph is empty, <p id=\"special\"></p>: the words come only from index.js.",
          checks: [
            { selector: "#special", message: "No element with id=\"special\". Give the paragraph that holds today's special id=\"special\"." },
            {
              selector: "#special:empty",
              source: true,
              message: "In your index.html the special paragraph still has words in it. Make it empty, <p id=\"special\"></p> (no spaces inside either): the words must come only from index.js.",
            },
            {
              selector: "#special",
              text: "₱",
              message: "#special has no ₱ price in it. Write it with a template literal:  `Today's special: ${special} — ₱${price}`",
            },
            {
              selector: "#special",
              textNot: "${",
              message: "Your page shows ${…} as plain characters. That happens with quotes. Put backticks (`) around the text instead, and ${special} and ${price} turn into their values.",
            },
          ],
          hint: "Backticks (`), not quotes. The backtick key is usually left of the 1 key.",
          solution: "const special = \"Turon\";\nconst price = 12;\ndocument.getElementById(\"special\").textContent = `Today's special: ${special} — ₱${price}`;",
          explain: "When your API exists, special and price will come from your own ledger instead of being typed into the script. This line stays the same.",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-console",
      title: "📸 Hand in: your script, running at 8080",
      intro: "Proof that your own app serves your script and the browser runs it.",
      steps: [
        "Restart your app so it serves today's files, and open localhost:8080.",
        "Press F12 and click Console. Make sure 'index.js is running' is showing (reload the page if the console is empty).",
        "Make sure the address bar, your greeting, your special and the console are all visible.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves:
        "that YOUR index.js runs on your front page served by your own app at localhost:8080: your greeting and your own special on the page, and your console line in the console.",
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro:
        "Unlike CSS, JavaScript does complain, but only in the console. Each patient is a page that 'does nothing' and a red line that says why.",
      missions: [
        {
          task: "Patient 1. The console says:  Uncaught TypeError: Cannot set properties of null (setting 'textContent').  The HTML has  <p id=\"greeting\">  and the script says  document.getElementById(\"greting\").",
          hint: "null means 'found nothing'. Compare the two ids one letter at a time.",
          check: {
            question: "Diagnosis?",
            choices: [
              "The id in the script is misspelled, so getElementById found nothing and gave back null",
              "textContent only works on <div>",
              "The paragraph needs text before the script can change it",
            ],
            answer: 0,
            explain:
              "Same message as a script tag in <head>. When you see 'of null', check two things: is the id spelled exactly the same, and does the element exist yet?",
          },
        },
        {
          task: "Patient 2. The console says:  Uncaught TypeError: document.getElementByID is not a function.",
          hint: "Compare it with the videos letter by letter, especially the capitals at the end.",
          check: {
            question: "Diagnosis?",
            choices: [
              "The page has no document",
              "getElementByID doesn't exist. The method is getElementById, with a capital I and a small d. JavaScript, like Java, cares about capitals",
              "Functions must be declared first",
            ],
            answer: 1,
            explain: "'is not a function' usually means a name typed slightly wrong, so you asked for something that isn't there.",
          },
        },
        {
          task: "Patient 3. Nothing happens at all, and the console shows:  GET http://127.0.0.1:5500/src/main/resources/static/js/index.js 404 (Not Found).  The script tag is  <script src=\"js/index.js\"></script>.",
          hint: "Where is index.js really, next to index.html or in a js folder?",
          check: {
            question: "Diagnosis?",
            choices: [
              "Live Server can't run JavaScript",
              "The script has an error on line 404",
              "The browser looked for index.js inside a js/ folder that doesn't exist. Make the src match where the file really is: src=\"index.js\"",
            ],
            answer: 2,
            explain: "404 means not found: the same message as a broken image or link from last week. The path in src is wrong, not the code.",
          },
        },
        {
          task: "Patient 4. In Live Server the greeting says 'Good afternoon!'. At localhost:8080 the greeting is missing completely, and there are no red lines.",
          hint: "Last week's rule: when a change shows in Live Server but not at 8080, what do you do before you suspect anything else?",
          check: {
            question: "First thing to try?",
            choices: [
              "Restart the app. It's serving the files from when it last started, before index.js had the greeting",
              "Rewrite the greeting",
              "Delete index.html",
            ],
            answer: 0,
            explain: "Restart first, then suspect the code. It's the same at 8080 for HTML, CSS and JavaScript.",
          },
        },
        {
          task: "Patient 5. The script says  console.log(\"Total: \" + 12 + 3);  and the console prints  Total: 123.",
          hint: "JavaScript works left to right. What is \"Total: \" + 12, and what happens when you add 3 to that?",
          check: {
            question: "Why 123 and not 15?",
            choices: [
              "console.log can't do maths",
              "\"Total: \" + 12 is already text (\"Total: 12\"), so + 3 just adds the character 3 to the end. Brackets fix it: \"Total: \" + (12 + 3)",
              "12 + 3 is 123 in JavaScript",
            ],
            answer: 1,
            explain:
              "Java does exactly the same thing here, so this one isn't new, but tomorrow it comes back in a form Java doesn't have. Template literals avoid it: `Total: ${12 + 3}`.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for when a page 'does nothing'.",
          hint: "Like: 'Patient 1: of null → check the id and that the script is last in body.' Your rule should start with where you look first.",
          input: "Paste your five notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own addition to index.js",
      intro:
        "Everything so far was the same for the whole class. This part is yours: make index.js put one more thing on your front page. Do at least one; if you have time, do more. There's no upper limit.",
      missions: [
        {
          task: "Pick one idea, or invent your own, and build it in index.js with what you learned today. Ideas: (1) an 'Open now' or 'Closed' line that depends on the hour, using the canteen's hours (7:00–16:00); (2) a footer line '© 2026 Aling Nena's Canteen' where the year comes from new Date().getFullYear(); (3) a different greeting in the evening, by adding an else if to your greeting.",
          hint:
            "Start small: first add an empty <p id=\"…\"></p> in index.html, then one line in index.js that writes plain text into it, and save. When that works, add the if or the date. For idea 1: if (hour >= 7 && hour < 16) { … } else { … }. Keep the console open: a red line tells you which line to fix. Your greeting and special must keep working.",
        },
        {
          task: "Paste what you added: the new HTML line(s), the new index.js lines, and one sentence on what it shows. Finished early? Add another idea first, then paste them all.",
          hint: "Copy the lines from VS Code. If you built more than one idea, paste each with its own sentence.",
          input: "Paste your new HTML, your new index.js lines, and what each one does",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-silent-page",
    title: "⚔️ Boss battle: The Silent Page",
    intro: "The Silent Page does nothing and says nothing, unless you know where to look.",
    boss: { name: "the Silent Page", emoji: "🔇" },
    questions: [
      {
        prompt: "Where does your index.js run when a customer opens your site?",
        choices: ["In your Spring Boot app", "In MySQL", "In the customer's browser"],
        answer: 2,
        explain: "Your app only serves the file. The browser runs it.",
      },
      {
        prompt: "Where should <script src=\"index.js\"></script> go?",
        choices: ["The last line inside <body>", "The first line inside <head>", "Inside the <h1>"],
        answer: 0,
        explain: "The page's elements must exist before the script looks for them.",
      },
      {
        prompt: "What does 12 === \"12\" give?",
        choices: ["true", "false", "An error"],
        answer: 1,
        explain: "=== compares value AND type. A number is never === a string.",
      },
      {
        prompt: "getElementById(\"special\") returns null. What does that mean?",
        choices: [
          "The paragraph is empty",
          "No element with that id was found — misspelled, or it doesn't exist yet",
          "The page has an error in its CSS",
        ],
        answer: 1,
        explain: "null is 'found nothing'. Check the spelling and where the script tag is.",
      },
      {
        prompt: "Which line puts the value of price into the text?",
        code: "const price = 12;",
        choices: ["\"₱${price}\"", "`₱${price}`", "'₱price'"],
        answer: 1,
        explain: "Only backticks turn ${…} into a value. In quotes it's just those characters.",
      },
      {
        prompt: "You'll change a variable's value later. Which keyword?",
        choices: ["const", "let", "final"],
        answer: 1,
        explain: "let can be reassigned; const can't; final is Java.",
      },
      {
        prompt: "Your script 'does nothing'. Where do you look first?",
        choices: ["VS Code's terminal", "The page's source code", "The browser's console (F12 → Console)"],
        answer: 2,
        explain: "Every script error is printed there, with the file and line.",
      },
      {
        prompt: "What's the difference between textContent and console.log?",
        choices: [
          "textContent changes what the page shows; console.log prints for you, in the console, where customers never look",
          "They're the same",
          "console.log is faster",
        ],
        answer: 0,
        explain: "The page is for Aling Nena's customers. The console is for you.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "Where your JavaScript runs, and where your Java runs, in one sentence each.",
      "Two differences between JavaScript and Java you noticed today.",
      "What null means when getElementById returns it, and the two things to check.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your site just did something you never typed into an HTML file. Tomorrow it starts reacting: buttons that work and a total that adds itself up.",
  },
};
