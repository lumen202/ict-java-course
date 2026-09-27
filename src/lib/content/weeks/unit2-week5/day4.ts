// unit2-week5 · Day 4 — One stylesheet for the whole site
//
// External CSS only: static/style.css, linked from every page with a
// RELATIVE href (same rule as Day 2's links). The checkpoint uses the
// sandbox's stylesheet editor, because a srcdoc preview can't fetch a linked
// file (see HtmlSandbox). The checks that "something changed from the
// default" use cssNot against browser defaults: body margin 8px (the UA
// stylesheet), transparent backgrounds, black text, and font-family "initial"
// — the default font differs by OS ("Times" on macOS Chrome, measured
// 2026-09-27), and `initial` computes to whatever it is on the student's machine.

import type { DayPlan } from "../../types";

export const day4: DayPlan = {
  day: "Day 4",
  focus: "One stylesheet dresses every page — colours, fonts, spacing, and a menu table people can read",
  warmupGame: {
    kind: "quest",
    id: "warmup-one-file",
    title: "🎨 Warm-up: why one file",
    intro: "Three pages, and today they all get the same look. The question is where that look lives.",
    missions: [
      {
        task: "Bro Code shows three ways to style a page: a style=\"…\" attribute on each tag, a <style> block inside one page, or a separate style.css file linked from every page.",
        hint:
          "Next month the green changes. In which option do you edit ONE place instead of every page?",
        check: {
          question: "Aling Nena wants her canteen's green on every page, and next month she'll want a different green. Which way makes that ONE change?",
          choices: [
            "style=\"…\" on every tag",
            "A <style> block copied into each page",
            "One style.css linked from every page — change it once, every page follows",
          ],
          answer: 2,
          explain:
            "The same reason you put your SQL in one method and call it from everywhere in Week 4: one copy to fix. Two copies means one of them will be wrong eventually.",
        },
      },
      {
        task: "Your pages are in static/. The stylesheet will be static/style.css.",
        hint:
          "The pages and style.css sit side by side in static/. How did you write the Menu link on Tuesday — slash or no slash, folder or no folder?",
        check: {
          question: "Which <link> goes in the <head> of index.html, menu.html and order.html?",
          choices: [
            "<link rel=\"stylesheet\" href=\"style.css\">",
            "<link rel=\"stylesheet\" href=\"/static/style.css\">",
            "<style src=\"style.css\"></style>",
          ],
          answer: 0,
          explain: "Relative, like your page links on Tuesday — style.css sits right next to the pages.",
        },
      },
      {
        task: "A CSS rule looks like:  h1 { color: darkgreen; }",
        hint:
          "A rule is: selector { property: value; }. Which part comes BEFORE the braces?",
        check: {
          question: "What's the h1 part?",
          choices: [
            "The value",
            "The selector — WHICH elements the rule applies to. Every <h1> on every page that links this file",
            "A comment",
          ],
          answer: 1,
          explain: "Selector { property: value; }. It's a little like a WHERE clause: the selector picks which elements, the braces say what to change on them.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Get started with CSS in 8 minutes (Bro Code)",
      youtubeId: "uzF1Doc3cZQ",
      length: "8:01",
      practice: {
        intro: "He shows inline, internal and external CSS, and ends with external. Use only external:",
        steps: [
          "In static/, create style.css.",
          "In the <head> of ALL THREE pages, add  <link rel=\"stylesheet\" href=\"style.css\">.",
          "In style.css, give body a background-color and h1 a color. Save, and watch every page change at once in Live Server.",
          "Pick one element that should look different from the rest — the Made by line on index.html is a good one — give it class=\"credit\", and style .credit in style.css.",
        ],
        note: "He sets the page to black with white text. Aling Nena's customers read the menu on their phones in the sun — pick a light background and dark text.",
      },
    },
    {
      title: "Learn CSS colors in 4 minutes (Bro Code)",
      youtubeId: "LwbKb2J8iy8",
      length: "4:13",
      practice: {
        steps: [
          "Choose two colours for the canteen: a main colour (headings, the table's heading row) and a background. Named colours are fine; VS Code shows a colour picker when you hover over one in style.css.",
          "Give the <th> cells of your menu table a background-color and a color that reads clearly on it.",
          "Set a font-family for body — for example  font-family: Arial, sans-serif;  (the second name is the fallback if the first isn't installed).",
        ],
      },
    },
    {
      title: "Learn CSS margins in 5 minutes (Bro Code)",
      youtubeId: "rBWA_t-KnKk",
      length: "5:14",
      practice: {
        steps: [
          "Give body a margin so the text isn't pressed against the edge of the window — for example  margin: 20px;",
          "Give the table  margin: 20px auto;  — 20px above and below, and auto on the sides centres it.",
          "Add  table { border-collapse: collapse; }  and  th, td { border: 1px solid gray; padding: 6px 12px; }  — padding is the space INSIDE a cell, margin the space outside.",
        ],
        note: "He uses the browser's Inspect tool (right-click → Inspect) to see margins. Use it too: it shows exactly which rule from style.css is styling what you clicked on.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: prove the stylesheet is shared",
      intro: "The point of style.css is that it's ONE file for every page. Prove that on your own site.",
      missions: [
        {
          task: "Change body's background-color in style.css to something ugly — hotpink. Save. Click through all three pages in Live Server.",
          hint:
            "Every page has to ask for the stylesheet itself. Open the page that stayed white and look inside its <head>: is the <link> line there, spelled exactly href=\"style.css\"?",
          check: {
            question: "All three pages turned pink. Only menu.html stayed white. What's the most likely cause?",
            choices: [
              "menu.html is missing <link rel=\"stylesheet\" href=\"style.css\"> in its <head> — or the href has a typo",
              "Pink isn't allowed on tables",
              "The browser cached the old colour for that page only",
            ],
            answer: 0,
            explain:
              "Every page opts in with its own <link>. A page without one gets the browser's plain default. Change the colour back when you're done.",
          },
        },
        {
          task: "Right-click your table's heading row → Inspect. In the Styles panel, find the rule that sets its background.",
          hint:
            "Right-click right on a heading cell (Snack or Price) → Inspect. A panel opens; find Styles and scroll until you see background-color. The grey text beside that rule is a file name and a number.",
          check: {
            question: "Next to the rule it says style.css:12 (or another line number). What is that?",
            choices: [
              "An error on line 12",
              "Where the rule lives: the file and line in YOUR style.css. Inspect is how you find out which rule is styling what",
              "The 12th page that uses the stylesheet",
            ],
            answer: 1,
            explain:
              "When something looks wrong and you don't know why, Inspect before you guess — it's the CSS version of reading the error message.",
          },
        },
        {
          task: "Restart your app and check all three pages at localhost:8080 — the look must be the same as in Live Server.",
          hint:
            "Restart = red square, then Run above main. For the question: this is Tuesday's slash again. Where is the 'top of the server' at 8080, and where is it in Live Server?",
          check: {
            question: "A classmate's pages look right at 8080, but in Live Server their index.html is completely plain. Its link is href=\"/style.css\". What's going on?",
            choices: [
              "Spring Boot styled it and Live Server can't read CSS",
              "Tuesday's slash problem, back again: /style.css means 'the top of the server'. At 8080 the top is static/, so it's found; in Live Server the top is the project folder, so it isn't. href=\"style.css\"",
              "The stylesheet is broken",
            ],
            answer: 1,
            explain:
              "Same rule as your page links: no slash, and it works everywhere. And if it's the other way round — styled in Live Server, plain at 8080 — restart the app before you suspect anything else.",
          },
        },
        {
          task: "Add today to notes.md: your colour choices, the one rule you're proudest of, and how you used Inspect.",
          hint:
            "Write your colours exactly as they are in style.css (like darkgreen or #fffbeb). For Inspect, say what you right-clicked and which file and line it showed you.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-stylesheet",
      fileName: "menu.html",
      title: "🧪 Checkpoint: your stylesheet",
      intro:
        "Two boxes this time: paste your menu.html into the top one and your style.css into the bottom one. The preview applies your stylesheet to the page, the same way your <link> does on your own machine.",
      starter: "<!-- Delete this line, then paste your whole menu.html from VS Code here -->\n",
      stylesheet: "/* Delete this line, then paste your whole style.css from VS Code here */\n",
      tasks: [
        {
          goal: "Paste both files. First: the page links the stylesheet, relative, from its <head>.",
          checks: [
            {
              selector: "body table",
              message: "The top box doesn't have your menu.html in it yet (no table found). Paste your whole menu.html into the top box.",
            },
            {
              selector: "link[rel='stylesheet']",
              message: "menu.html has no <link rel=\"stylesheet\" …> — without it, the page never loads style.css. Put it inside <head>.",
            },
            {
              selector: "link[rel='stylesheet'][href='style.css']",
              message: "Your <link> doesn't point at style.css exactly. It should be href=\"style.css\" — relative, no slash, no folder.",
            },
          ],
          hint: "<link rel=\"stylesheet\" href=\"style.css\"> — rel says what kind of file it is, href says where.",
          solution: "<head>\n  <title>Menu — Aling Nena's Canteen</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>",
          explain: "One line per page, and every rule in style.css applies to it.",
        },
        {
          goal: "The page has its own look: a background colour and a heading colour, not the browser's defaults.",
          checks: [
            {
              selector: "body",
              cssNot: { property: "background-color", value: "transparent" },
              message: "body has no background-color yet (it's still the browser's plain default). Paste your style.css into the bottom box — or add a body { background-color: …; } rule to it.",
            },
            {
              selector: "h1",
              cssNot: { property: "color", value: "black" },
              message: "Your <h1> is still the default black. Give h1 a color in style.css.",
            },
          ],
          hint: "body { background-color: … } and h1 { color: … } — each rule is a selector, then { property: value; }.",
          solution: "body {\n  background-color: #fffbeb;\n}\n\nh1 {\n  color: darkgreen;\n}",
          explain: "Two rules, and every page that links the file follows them.",
        },
        {
          goal: "Spacing and a readable font: body has a font-family and a margin of its own.",
          checks: [
            {
              selector: "body",
              cssNot: { property: "margin-top", value: "8px" },
              message: "body still has the browser's default margin (8px). Set your own in style.css — for example margin: 20px;",
            },
            {
              selector: "body",
              cssNot: { property: "font-family", value: "initial" },
              message: "body still uses the browser's default font. Add font-family to body — for example font-family: Arial, sans-serif;",
            },
          ],
          hint: "Both go in the body rule: body { …; margin: 20px; font-family: Arial, sans-serif; }",
          solution: "body {\n  margin: 20px;\n  font-family: Arial, sans-serif;\n}",
          explain: "Rules for body are inherited by almost everything inside it — set the font once, and every paragraph, cell and label follows.",
        },
        {
          goal: "The menu table reads like a menu: coloured heading cells and borders on the cells.",
          checks: [
            {
              selector: "th",
              cssNot: { property: "background-color", value: "transparent" },
              message: "Your <th> heading cells have no background-color yet. Add a th rule with your main colour. (Already have one? Look at the rule ABOVE it in style.css — a missing } there swallows every rule after it.)",
            },
            {
              selector: "td",
              cssNot: { property: "border-top-style", value: "none" },
              message: "Your <td> cells have no border. Add  th, td { border: 1px solid gray; }  to style.css.",
            },
          ],
          hint: "A selector can name two things at once with a comma: th, td { … } styles both.",
          solution: "table {\n  border-collapse: collapse;\n  margin: 20px auto;\n}\n\nth, td {\n  border: 1px solid gray;\n  padding: 6px 12px;\n}\n\nth {\n  background-color: darkgreen;\n  color: white;\n}",
          explain: "Your ListMenu output, with columns, a heading row and borders — the result grid, finally looking like it belongs on a canteen's wall.",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-styled-site",
      title: "📸 Hand in: your styled site, served by your app",
      intro: "Proof that the stylesheet reaches every page on your own machine — not just the page you pasted into the checker.",
      steps: [
        "Restart your app so it serves today's files, and open localhost:8080/menu.html.",
        "Open localhost:8080/order.html in a second browser tab.",
        "Arrange the two browser windows side by side (drag one to the left edge of the screen, one to the right), both showing localhost:8080 in the address bar.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves:
        "that ONE stylesheet styles two different pages — your menu table with your colours and your order form in the same look — served by your own Java app at localhost:8080.",
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "CSS never shows an error message — a rule that's wrong is simply ignored. So these patients are all silent.",
      missions: [
        {
          task: "Patient 1. style.css says  h1 { color: darkgreen }  and  body { background-color: #fffbeb  — then the file ends. The h1 is green; the background is still white.",
          hint:
            "Count the { and the } in the file. Does every rule that opens also close?",
          check: {
            question: "Why is only the second rule ignored?",
            choices: [
              "The body rule is missing its closing }. A rule with no end is thrown away — along with anything after it",
              "#fffbeb isn't a real colour",
              "body can't have a background",
            ],
            answer: 0,
            explain: "No red text, no line number — the rule just doesn't happen. Count your braces first.",
          },
        },
        {
          task: "Patient 2. The rule is  .credit { color: gray; }  and the HTML is  <p class=\".credit\">Made by Maria</p>.",
          hint:
            "Put the HTML's class=\"…\" next to the CSS selector. Which of the two is supposed to have the dot?",
          check: {
            question: "Why isn't the paragraph gray?",
            choices: [
              "gray should be grey",
              "The dot belongs only in the CSS selector. The class attribute is just the name: class=\"credit\"",
              "Classes only work on <div>",
            ],
            answer: 1,
            explain: "In CSS, .credit means 'the class called credit'. In HTML you write the name itself.",
          },
        },
        {
          task: "Patient 3. The rule is  body { background-colour: lightyellow; }",
          hint:
            "Read the property name one letter at a time. Is it spelled the way it was in the video?",
          check: {
            question: "What's wrong?",
            choices: [
              "lightyellow isn't a colour",
              "body needs a class",
              "CSS uses American spelling: color. background-colour is an unknown property, so it's silently ignored",
            ],
            answer: 2,
            explain: "VS Code underlines unknown properties with a wavy line — hover over it. That wavy line is the only error message CSS will ever give you.",
          },
        },
        {
          task: "Patient 4. The student's pages are styled in Live Server. In the lab next door, on a friend's computer, the same pages are plain. Their link is  <link rel=\"stylesheet\" href=\"C:\\Users\\Paolo\\Documents\\canteen-web\\src\\main\\resources\\static\\style.css\">",
          hint:
            "Paolo's link starts with C:\\Users\\Paolo. Does that folder exist on his friend's computer?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The friend's browser doesn't support CSS",
              "A path on Paolo's computer only exists on Paolo's computer. href=\"style.css\"",
              "The stylesheet is too big",
            ],
            answer: 1,
            explain: "Tuesday's lesson, back again. Every path between your own files is relative.",
          },
        },
        {
          task: "Patient 5. In style.css the student wrote  th { background-color: darkgreen; }  near the top, and later  th { background-color: white; }. The heading row is white.",
          hint:
            "Two rules set the same thing on the same element. Which one did the browser read last?",
          check: {
            question: "Why white?",
            choices: [
              "When two rules set the same thing on the same element, the later one wins — that's the 'cascading' in Cascading Style Sheets. Delete the one you don't want",
              "White always wins",
              "The first rule has an error",
            ],
            answer: 0,
            explain: "Inspect shows this too: the losing rule appears with a line through it.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for finding a CSS bug when there's no error message.",
          hint:
            "One line per patient, like: 'Patient 1: missing } → count the braces.' Then your rule for finding a CSS bug when nothing shows an error — think of the tool you used in the lab.",
          input: "Paste your five notes and your rule",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-plain-page",
    title: "⚔️ Boss battle: The Plain Page",
    intro: "The Plain Page wants Aling Nena's site to look like it's from 1995. Every rule you know is a brushstroke.",
    boss: { name: "the Plain Page", emoji: "🗒️" },
    questions: [
      {
        prompt: "Where does <link rel=\"stylesheet\" href=\"style.css\"> go?",
        choices: ["Inside <head>, on every page that should use the stylesheet", "At the top of style.css", "Inside the first <p>"],
        answer: 0,
        explain: "Each page opts in with its own link.",
      },
      {
        prompt: "In  h1 { color: darkgreen; }  which part is the property?",
        choices: ["h1", "darkgreen", "color"],
        answer: 2,
        explain: "selector { property: value; }",
      },
      {
        prompt: "How do you select elements with class=\"credit\" in CSS?",
        choices: ["#credit", ".credit", "credit()"],
        answer: 1,
        explain: "Dot for a class, # for an id — and no dot in the HTML itself.",
      },
      {
        prompt: "A CSS rule has a typo in its property name. What happens?",
        choices: ["The page shows an error", "The whole stylesheet stops working", "That line is silently ignored"],
        answer: 2,
        explain: "CSS never complains. The wavy underline in VS Code is your only warning.",
      },
      {
        prompt: "What's the difference between margin and padding?",
        choices: [
          "Margin is space outside an element's border; padding is space inside it",
          "They're the same thing",
          "Padding is only for tables",
        ],
        answer: 0,
        explain: "Inspect draws them as layers: content, padding, border, margin.",
      },
      {
        prompt: "Two rules set background-color on th. Which wins?",
        choices: ["The first one", "The later one in the file", "Whichever colour is darker"],
        answer: 1,
        explain: "Later wins when the selectors are equally specific — the cascade.",
      },
      {
        prompt: "margin: 20px auto; on a table does what?",
        choices: ["Centres it, with 20px above and below", "Makes it 20px wide", "Hides it"],
        answer: 0,
        explain: "auto on the left and right splits the leftover space equally.",
      },
      {
        prompt: "Why one style.css instead of a <style> block in each page?",
        choices: [
          "Browsers only allow one <style> block",
          "<style> blocks don't work with Spring Boot",
          "One file to change: every page follows, and no copy can drift out of date",
        ],
        answer: 2,
        explain: "The same instinct as putting your query in one method: one copy, one fix.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "Your two main colours and where you used each.",
      "The difference between margin and padding, in your own words.",
      "How you'd find out why an element looks wrong when CSS gives no error.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Aling Nena's site looks like a real site now — and every rule lives in one file you can change in a minute. Tomorrow is yours: finish, check everything, and add the page nobody else has.",
  },
};
