// unit2-week5 · Day 2 — More pages: links, pictures, lists
//
// The site grows from one page to three, linked together. The load-bearing
// idea is the RELATIVE link: Live Server serves the project from its top
// folder (127.0.0.1:5500/src/main/resources/static/…) while Spring serves
// static/ as the root (localhost:8080/…), so href="/menu.html" works at 8080
// and 404s under Live Server; href="menu.html" works in both. Verified on a
// real Spring Boot 4.1.1 build (2026-09-27): static/images/*.png is served;
// a wrong-case file name (Turon.png for turon.png) is a 404 from the packaged
// jar.

import type { DayPlan } from "../../types";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "One page becomes a site — a menu page, links between pages, a picture, and lists",
  warmupGame: {
    kind: "quest",
    id: "warmup-addresses",
    title: "🧭 Warm-up: addresses, again",
    intro:
      "Yesterday you learned your site has two addresses: your Java app at localhost:8080 and Live Server at 127.0.0.1:5500. Today your pages start pointing at each other — and a link is just an address written inside a page. Get the addresses straight first.",
    missions: [
      {
        task: "Your Week 4 CanteenApp had a ListMenu option: SELECT name, price FROM snacks, then a loop printing each row. Today you build menu.html.",
        hint:
          "What did ListMenu print, and what will menu.html show? Is the DATA new, or only the screen it's shown on?",
        check: {
          question: "What is menu.html, compared with ListMenu?",
          choices: [
            "A completely new feature that Week 4 never had",
            "The same menu, with a face — the rows ListMenu printed become lines on a page anyone can open in a browser",
            "A copy of the snacks table stored in the browser",
          ],
          answer: 1,
          explain:
            "Same data, better screen. Today you'll type the rows in by hand, copied from your own SELECT. In Week 8 your Java app fills them in by itself — with the loop you already wrote.",
        },
      },
      {
        task: "Live Server shows your front page at  127.0.0.1:5500/src/main/resources/static/index.html. Your Java app shows the same file at  localhost:8080/index.html.",
        hint:
          "A slash at the front means 'start from the very top of the server'. Look at both addresses: what comes straight after the port number at 8080, and what comes straight after it at 5500?",
        check: {
          question: "A link written as  href=\"/menu.html\"  (starting with a slash) means 'menu.html at the very top of this server'. Where does it work?",
          choices: [
            "Only at localhost:8080 — at the top of Live Server there's no menu.html, only your project's folders",
            "Only in Live Server",
            "Everywhere, because the slash is optional",
          ],
          answer: 0,
          explain:
            "The top of your Java app IS the static folder, so /menu.html finds the file. The top of Live Server is your whole project, so /menu.html finds nothing. Write href=\"menu.html\" — no slash — and it means 'next to the page I'm on', which is right in both. That's a relative link, and it's the only kind you'll write between your own pages.",
        },
      },
      {
        task: "You'll keep pictures in their own folder: static/images/turon.png.",
        hint:
          "Start where index.html is (static/) and walk to the picture: into which folder, then which file? Anything starting with C:\\ only exists on your own computer.",
        check: {
          question: "From index.html (which sits in static/), how does an <img> point at that picture?",
          choices: [
            "src=\"C:\\Users\\you\\Documents\\canteen-web\\src\\main\\resources\\static\\images\\turon.png\"",
            "src=\"turon.png\"",
            "src=\"images/turon.png\" — into the images folder, then the file",
          ],
          answer: 2,
          explain:
            "Relative again: from where the page is, go into images/, take turon.png. A C:\\ path only exists on your computer — the moment anyone else opens your site, it points at a drive they don't have.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Learn HTML hyperlinks in 4 minutes (Bro Code)",
      youtubeId: "ZOI7Tq5Zq2s",
      length: "4:08",
      practice: {
        intro: "He links two files that sit side by side — exactly your situation. In your project:",
        steps: [
          "In static/, create menu.html with the page skeleton (type it — you've done it once), a <title> of Menu — Aling Nena's Canteen, and an <h1> that says Menu.",
          "Create order.html the same way, with an <h1> that says Order and one <p>: Ordering opens on Wednesday.",
          "At the top of the <body> of ALL THREE pages, add the same three links: Home (index.html), Menu (menu.html), Order (order.html). Relative — no slash at the front.",
          "Click through all three in Live Server, then run your app and click through them at localhost:8080. Every link must work in both.",
        ],
        note: "You can skip the video's target=\"_blank\" for these: links between your own pages should open in the same tab.",
      },
    },
    {
      title: "Learn HTML images in 6 minutes (Bro Code)",
      youtubeId: "sm5hTFzSs5Y",
      length: "6:18",
      practice: {
        steps: [
          "Make a folder: right-click static → New Folder → images.",
          "Find a photo of one snack from Aling Nena's menu (search the web, or take one with your phone). Save it into static/images with a short lowercase name and no spaces — turon.jpg, not Turon Photo (1).JPG.",
          "In menu.html, add it with <img>, a src that goes into images/, a height of 200, and an alt that says what's in the picture.",
          "Check it at localhost:8080/menu.html too, not only in Live Server.",
        ],
        note: "Type the file name in src EXACTLY as it is on disk, capitals included. Windows folders often let a wrong capital slide while you work, but a web server doesn't have to — once your app is packaged, turon.png and Turon.png are two different files, and the picture just disappears.",
      },
    },
    {
      title: "Learn HTML lists in 6 minutes (Bro Code)",
      youtubeId: "oUm7rvMUNq8",
      length: "6:35",
      practice: {
        intro: "Your menu becomes a list — made from your own data:",
        steps: [
          "In queries.sql, add  SELECT name, price FROM snacks ORDER BY price;  — the same query ListMenu sends — and run it with Ctrl+E Ctrl+E.",
          "In menu.html, under the picture, write an unordered list (<ul>) with one <li> per row: the snack's name and its price, like Turon — ₱12.",
          "On index.html, under the opening hours, add an ordered list (<ol>) titled How to order, with three steps in order: look at the menu, choose your snack and how many, press Place order.",
        ],
        note: "Skip his description list (<dl>) and the style=\"…\" he adds at the end — tomorrow's order form and Thursday's stylesheet do those jobs better.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: a site, not a page",
      intro:
        "Three pages that point at each other: that's the moment a page becomes a website. Work in VS Code with Live Server open, and check everything at localhost:8080 before you call it done.",
      missions: [
        {
          task: "Open menu.html in Live Server and look at the address bar. Now click your Home link and look again.",
          hint:
            "Put the two addresses one above the other and compare them letter by letter. Which part stayed the same, and which part changed?",
          check: {
            question: "The address changed from …/static/menu.html to …/static/index.html. What did the browser do with href=\"index.html\"?",
            choices: [
              "It kept the folder of the page you were on and swapped only the file name — that's what 'relative' means",
              "It searched the whole computer for a file called index.html",
              "It asked VS Code where index.html is",
            ],
            answer: 0,
            explain:
              "A relative link is read from the folder of the current page. That's why the same link works at 8080 (folder = the top of your app) and at 5500 (folder = …/static/).",
          },
        },
        {
          task: "Break one link on purpose: in order.html, change the Menu link to href=\"Menu.html\" (capital M). Save, and click it at localhost:8080 — restart the app first.",
          hint:
            "Restart = red square, then Run above main. Then click the Menu link at localhost:8080. Whatever happened on YOUR computer, ask: would it work on EVERY server? Change it back to menu.html afterwards.",
          check: {
            question: "Whatever you saw, what's the lesson?",
            choices: [
              "Capitals never matter on the web",
              "Links must match file names exactly, capitals included. Some setups forgive it and some don't — so a link that 'works on my machine' can still be broken. Fix it back to menu.html",
              "Always use capitals in file names",
            ],
            answer: 1,
            explain:
              "Windows folders usually ignore capitals; the packaged app you'll build later doesn't. Lowercase file names, typed exactly, and the question never comes up.",
          },
        },
        {
          task: "Look at your menu list next to the result grid SQLTools showed you.",
          hint:
            "Look at the result grid: two columns, each with a heading. Now look at your list. Where are the columns? Where are the headings?",
          check: {
            question: "Your query's result has two columns, name and price. What does the <ul> version lose?",
            choices: [
              "Nothing — a list is the best way to show rows",
              "The prices",
              "The columns: name and price are squashed into one line of text, so nothing lines them up and nothing says which part is which. Tomorrow's <table> gets the columns back",
            ],
            answer: 2,
            explain:
              "A list is right for things with no columns — steps, links, a to-do. Rows with columns are a table's job. Your result grid has been a table since Week 1; tomorrow the web page catches up.",
          },
        },
        {
          task: "Add today to notes.md: the three page addresses at localhost:8080, the one rule about links you'd tell a classmate, and your picture's exact file name.",
          hint:
            "Write the three addresses the way you type them, like localhost:8080/menu.html. For the picture, copy its name exactly as the Explorer shows it inside static/images — capitals and ending (.jpg or .png) included.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-menu-page",
      fileName: "menu.html",
      title: "🧪 Checkpoint: your menu page",
      intro:
        "Paste your whole menu.html from VS Code. Your picture will show as a small broken-image icon in this preview — that's expected: the checker can't see the images folder on your computer. It checks the <img> tag itself, and your alt text shows instead.",
      starter: "<!-- Delete this line, then paste your whole menu.html from VS Code here -->\n",
      tasks: [
        {
          goal: "Paste menu.html. First: it's a page of its own — its own tab title and its own heading.",
          checks: [
            {
              selector: "body *",
              message:
                "There's nothing on this page yet. In VS Code open menu.html, press Ctrl+A then Ctrl+C, come back here, select everything in the editor and press Ctrl+V.",
            },
            { selector: "title", text: "menu", message: "The <title> doesn't mention Menu — the browser tab should say which page this is." },
            { selector: "h1", exact: 1, message: "The page needs exactly one <h1> — Menu." },
          ],
          hint: "Each page is a complete HTML file: its own <!DOCTYPE html>, <head> with its own <title>, and <body>.",
          solution: "<head>\n  <title>Menu — Aling Nena's Canteen</title>\n</head>\n<body>\n  <h1>Menu</h1>",
          explain: "Three files, three titles — each tab tells you where you are.",
        },
        {
          goal: "The links: Home, Menu and Order, all relative.",
          checks: [
            {
              selector: "a[href^='/']",
              exact: 0,
              message:
                "One of your links starts with a slash (like href=\"/menu.html\"). That breaks in Live Server. Remove the slash so it's relative: href=\"menu.html\".",
            },
            {
              selector: "a[href*=':\\\\'], a[href^='file:']",
              exact: 0,
              message: "A link points at a C:\\ or file: path — that only exists on your computer. Use just the file name, like href=\"index.html\".",
            },
            { selector: "a[href='index.html']", message: "No link to index.html. Add <a href=\"index.html\">Home</a>." },
            { selector: "a[href='order.html']", message: "No link to order.html. Add <a href=\"order.html\">Order</a>." },
          ],
          hint: "Copy the three links from index.html so every page has the same ones.",
          solution: "<a href=\"index.html\">Home</a>\n<a href=\"menu.html\">Menu</a>\n<a href=\"order.html\">Order</a>",
          explain: "Relative links: they work at localhost:8080, in Live Server, and anywhere else the folder goes.",
        },
        {
          goal: "A picture of one snack, from your images folder, with alt text.",
          checks: [
            { selector: "img", message: "No <img> on the page yet." },
            {
              selector: "img[src^='images/']",
              message: "Your <img> src doesn't start with images/ — the picture should live in the images folder, so src=\"images/yourfile.jpg\".",
            },
            {
              selector: "img[alt]:not([alt=''])",
              message: "Your <img> has no alt text. Add alt=\"…\" describing what's in the picture — it's what a screen reader says, and what shows if the picture can't load (like right here).",
            },
          ],
          hint: "src is the path to the file; alt is the words for people who can't see it. Both go inside the one <img> tag, which has no closing tag.",
          solution: "<img src=\"images/turon.jpg\" alt=\"Two pieces of turon on a plate\" height=\"200\">",
          explain: "See the alt text in the preview where the picture should be? That's exactly what a student using a screen reader gets — so make it say something useful.",
        },
        {
          goal: "The menu itself: an unordered list with at least three snacks and their prices, from your own SELECT.",
          checks: [
            { selector: "ul", message: "No <ul> — the menu should be an unordered list." },
            { selector: "ul > li", min: 3, message: "Fewer than three <li> items inside your <ul>. One <li> per row of your SELECT." },
          ],
          hint: "<ul> goes around the whole list; each snack is its own <li>…</li> inside it.",
          solution: "<ul>\n  <li>Pastillas — ₱8</li>\n  <li>Gulaman — ₱10</li>\n  <li>Turon — ₱12</li>\n</ul>",
          explain: "Your ListMenu output, as a page. Tomorrow it gets columns.",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Five patients, all from today's kind of work. Diagnose each from what the student saw.",
      missions: [
        {
          task: "Patient 1. The Menu link works at localhost:8080 but in Live Server it goes to 127.0.0.1:5500/menu.html and says Cannot GET /menu.html.",
          hint:
            "Look at the broken address: 127.0.0.1:5500/menu.html — the /src/main/resources/static/ part is gone. What in a link sends you to the very top of a server?",
          check: {
            question: "What's in the link?",
            choices: [
              "A slash at the front: href=\"/menu.html\". Remove it so the link is relative",
              "A typo in menu.html's title",
              "Live Server doesn't support links",
            ],
            answer: 0,
            explain: "The slash means 'the top of the server', and the top of Live Server is your project folder, not static/.",
          },
        },
        {
          task: "Patient 2. The picture shows a broken-image icon and the words Photo of turon. The student's tag is  <img src=\"turon.jpg\" alt=\"Photo of turon\">  and the file is static/images/turon.jpg.",
          hint:
            "Walk it: the page is in static/, the picture is in static/images/. Starting from the page, does src=\"turon.jpg\" ever go into the images folder?",
          check: {
            question: "What's wrong?",
            choices: [
              "The alt text is too long",
              "The src is missing the folder: it looks for turon.jpg next to the page, but the file is inside images/. It should be images/turon.jpg",
              "JPG files don't work on the web",
            ],
            answer: 1,
            explain: "And notice the alt text did its job — it showed up exactly when the picture couldn't. That's what it's for.",
          },
        },
        {
          task: "Patient 3. The picture works in Live Server but not at localhost:8080. The student added it after starting the app.",
          hint:
            "It works in one place and not the other, and the only change was a new file. What did Day 1's clinic say to do when Live Server and 8080 disagree?",
          check: {
            question: "First thing to try?",
            choices: [
              "Rename the picture",
              "Move it out of the images folder",
              "Restart the app — like Day 1's Siopao patient, the app serves a copy of your files, and restarting rebuilds that copy",
            ],
            answer: 2,
            explain: "When Live Server and your app disagree, restart the app before you suspect the code.",
          },
        },
        {
          task: "Patient 4. The student's list shows every snack on one line, with no bullets. Their code has <li> items but no <ul>.",
          hint:
            "Which tag goes AROUND the <li> items? Without it, what are the <li>s items of?",
          check: {
            question: "Why does the <ul> matter?",
            choices: [
              "It's the list itself — <li> items only mean 'list item' inside a <ul> or <ol>. Without it the browser has no list to put bullets on",
              "It doesn't; the bullets come from the <li>",
              "It sets the font size",
            ],
            answer: 0,
            explain: "Same idea as <tr> inside <table> tomorrow: the container says what the pieces are.",
          },
        },
        {
          task: "Patient 5. The student's image src is  C:\\Users\\Maria\\Documents\\canteen-web\\src\\main\\resources\\static\\images\\turon.jpg  and it works on their machine.",
          hint:
            "It works on Maria's computer. Does a folder called C:\\Users\\Maria exist on anyone else's?",
          check: {
            question: "Why is it still wrong?",
            choices: [
              "Backslashes are slower",
              "It only works on Maria's computer. Anyone else — or Maria's own app once it's packaged — gets a broken picture. Use images/turon.jpg",
              "It isn't wrong if it works",
            ],
            answer: 1,
            explain: "A path starting with a drive letter describes one computer. A relative path describes the site, so it travels with it.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient on what you'd check first, then the one rule about paths you'd give a classmate.",
          hint:
            "One line per patient, like: 'Patient 1: link starts with / → remove the slash.' Then one rule about paths that would have prevented most of these.",
          input: "Paste your five notes and your rule",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-lost-link",
    title: "⚔️ Boss battle: The Lost Link",
    intro: "The Lost Link sends visitors to pages that don't exist. Every question is a path it can't follow if you get it right.",
    boss: { name: "the Lost Link", emoji: "🔗" },
    questions: [
      {
        prompt: "Which link to the menu works both at localhost:8080 and in Live Server?",
        choices: ["<a href=\"/menu.html\">Menu</a>", "<a href=\"menu.html\">Menu</a>", "<a href=\"static/menu.html\">Menu</a>"],
        answer: 1,
        explain: "Relative, no slash: 'next to the page I'm on'. The slash version only works where static/ is the top of the server.",
      },
      {
        prompt: "What does the alt attribute of an <img> do?",
        choices: [
          "Describes the picture in words — read out by screen readers, and shown when the picture can't load",
          "Sets the picture's alternative size",
          "Picks a second picture to show instead",
        ],
        answer: 0,
        explain: "It's the picture, for people who can't see it. Write what's in it, not 'image'.",
      },
      {
        prompt: "index.html is in static/. The picture is static/images/siopao.png. The right src is:",
        choices: ["siopao.png", "/static/images/siopao.png", "images/siopao.png"],
        answer: 2,
        explain: "From the page's folder, into images/, then the file.",
      },
      {
        prompt: "Which list fits 'How to order: 1. look at the menu 2. choose 3. press Place order'?",
        choices: ["<ol> — the order of the steps matters", "<ul> — it's a list of things", "<dl> — it's terms and definitions"],
        answer: 0,
        explain: "Ordered list when order matters, unordered when it doesn't.",
      },
      {
        prompt: "Your list items are inside <ul>…</ul>. Each item is wrapped in:",
        choices: ["<item>…</item>", "<li>…</li>", "<p>…</p>"],
        answer: 1,
        explain: "li = list item. It works inside both <ul> and <ol>.",
      },
      {
        prompt: "The picture works in Live Server but not at localhost:8080, and you added it a minute ago. First step?",
        choices: ["Rename it", "Convert it to PNG", "Restart the app"],
        answer: 2,
        explain: "Live Server reads your folder directly. Your app serves a copy of it that VS Code builds, and restarting the app rebuilds that copy.",
      },
      {
        prompt: "Why keep picture file names lowercase with no spaces?",
        choices: [
          "So links typed from memory match exactly — some servers treat Turon.png and turon.png as different files",
          "Uppercase files are bigger",
          "HTML only allows lowercase",
        ],
        answer: 0,
        explain: "A habit that removes a whole class of 'works on my machine' bugs.",
      },
      {
        prompt: "Your menu list mixes names and prices on one line. What would show them as proper columns?",
        choices: ["More <br> tags", "A <table> — rows and columns, like your result grid", "Two separate <ul> lists side by side"],
        answer: 1,
        explain: "Tomorrow. Rows with columns are a table's job.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "Your three pages' addresses at localhost:8080.",
      "Why href=\"menu.html\" works in Live Server and href=\"/menu.html\" doesn't — in your own words.",
      "Your picture's exact file name and the src you used for it.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your project is a website now: three pages, linked, one of them built from your own ledger. Tomorrow the menu becomes a real table and the Order page gets a form — the first thing on your site that could send data to a server.",
  },
};
