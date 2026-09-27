// unit2-week5 · Day 1 — Your own project, your first page
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.
//
// Project-first by design (teacher, 2026-09-27): the day's spine is the
// student's OWN Spring Boot project — created today, kept through Units 2–3.
// Lessons never mention the capstone (teacher, 2026-09-27): students propose
// their own, so nothing here may imply what it will be.
// Pages live in src/main/resources/static/, so the Java app serves them from
// Day 1 and the API they add in Week 7 lands in a project they already know.
// Verified against a real Spring Boot 4.1.1 build (2026-09-27): a fresh app
// answers / with the Whitelabel 404; static/index.html is served at / and at
// /index.html; /about without .html is a 404; a page in templates/ is a 404;
// a second run on the same port fails with "Web server failed to start. Port
// 8080 was already in use."

import type { DayPlan } from "../../types";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Your new workbench — a Spring Boot project of your own, serving your first web page",
  warmupGame: {
    kind: "quest",
    id: "warmup-bridge",
    inline: true,
    title: "🌉 Warm-up: from last week's program to this week's website",
    intro:
      "Last week you wrote CanteenApp — a Java program that talks to Aling Nena's ledger. It worked, and she'll never use it: it lives in a black console window. This unit gives it a face she WOULD use, a website. First, see how today fits onto what you already built. Then check your tools, one at a time — do each check for real, on your own computer, before you pick an answer.",
    missions: [
      {
        task: "Look at the address from your Week 4 ConnectTest:  jdbc:mysql://localhost:3306/school",
        hint:
          "The server is the one that WAITS at a port. Which program was already running before your ConnectTest started — and which one did the knocking?",
        check: {
          question: "In that connection, who was the SERVER — the one waiting at a port for someone to ask it something?",
          choices: [
            "MySQL, waiting at port 3306. Your Java program was the CLIENT that knocked and asked",
            "Your Java program — it started first",
            "Workbench",
          ],
          answer: 0,
          explain:
            "A server is a program that sits at a port and answers whoever asks. MySQL sits at 3306; your program was the client. Hold on to that picture — today it flips.",
        },
      },
      {
        task: "Today your own Java program will start, sit at port 8080, and answer when a web browser opens http://localhost:8080.",
        hint:
          "Same question as the last one, new door. Which program sits at port 8080 waiting, and which one comes knocking when you type the address?",
        check: {
          question: "So in today's picture, who is the server and who is the client?",
          choices: [
            "MySQL is still the server; the browser is a second MySQL client",
            "The browser is the server, because it shows the page",
            "YOUR Java program is the server, waiting at 8080 — the way MySQL waits at 3306. The browser is the client",
          ],
          answer: 2,
          explain:
            "Your program changes sides. Last week it asked; this week it answers. Port 8080 is its door the same way 3306 is MySQL's — and the error messages work the same way too: 'refused' means no one is at the door.",
        },
      },
      {
        task: "Jump ahead to Week 8. Aling Nena opens your website and clicks 'Record sale'.",
        hint:
          "The browser only ever talks to the address you type: localhost:8080. In this picture, which part knows the database password?",
        check: {
          question: "Which chain actually happens?",
          choices: [
            "Browser → your Java app at 8080 → MySQL at 3306, and the answer travels back the same way",
            "The browser connects straight to MySQL at 3306",
            "Your Java app opens the browser and types into it",
          ],
          answer: 0,
          explain:
            "Your app sits in the middle, and it's the only part that knows the database password and the only part that sends SQL. The code in that middle is last week's PreparedStatement code, moved into your new project. A browser never talks to MySQL directly — which is also what keeps your ledger safe from strangers.",
        },
      },
      {
        task: "Your Week 4 CanteenApp had a menu of options: ListMenu, ListSales, LookupSnack, RecordSale. This week's website has pages instead of options.",
        hint:
          "An order form ADDS a new sale to the ledger. Which Week 4 option did that — the one with INSERT INTO sales?",
        check: {
          question: "Which Week 4 option becomes the ORDER FORM page you'll build on Wednesday?",
          choices: [
            "ListMenu",
            "RecordSale — the form's boxes fill its PreparedStatement's ? placeholders: which snack and how many (your app will add the date)",
            "LookupSnack",
          ],
          answer: 1,
          explain:
            "Every page this week is the face of something CanteenApp already does. The menu page is ListMenu — and an HTML table is just the result grid you've been reading since Week 1. This week you build the faces; in Week 8 you connect them to the code you already wrote.",
        },
      },
      {
        task: "Open PowerShell (press the Windows key, type powershell, press Enter) and run:  java -version",
        hint:
          "Type it exactly: java, a space, then -version. Read only the FIRST line. Any number 17 or bigger (17, 21, 25) counts as '17 or higher'. If yours really says 1.8, 11 or 'not recognized', this computer isn't set up for today — that isn't your mistake; tell the person running the lab.",
        check: {
          question: "What did the first line say?",
          choices: [
            "A version starting with 1.8 or 11",
            "'java' is not recognized as an internal or external command",
            "A version of 17 or higher (for example openjdk version \"21.0.8\")",
          ],
          answer: 2,
          explain:
            "17 or higher is what Spring Boot needs, so you're set. If you got 1.8 or 11, an old Java is first in line — tell the person running the lab, because Spring Boot will refuse to start on it. If PowerShell didn't recognise java at all, Java isn't on this machine's PATH: that's a lab setup problem too, not something you did wrong.",
        },
      },
      {
        task: "Open VS Code. Click the Extensions icon on the left (four little squares, or Ctrl+Shift+X) and look at the INSTALLED list.",
        hint:
          "Read the names in the INSTALLED list. Today needs four jobs done: run Java, create a Spring project, preview pages, and run SQL. The right answer has a tool for every one of those jobs.",
        check: {
          question: "Which of these do you need to see there for today?",
          choices: [
            "Extension Pack for Java, Spring Boot Extension Pack, Live Server, and SQLTools with its MySQL driver",
            "Only Live Server — Java runs without an extension",
            "Python, because Spring Boot uses it",
          ],
          answer: 0,
          explain:
            "The Java pack lets VS Code run Java; the Spring Boot pack is what creates your project; Live Server previews pages; SQLTools (plus SQLTools MySQL/MariaDB/TiDB) runs SQL against your ledger — from this week, VS Code is where you run your queries too. If one is missing, search its name in that same Extensions panel and click Install — it's safe, and it's the fix. (Extensions belong to your Windows account, so if you log in with your own account you may need to install them yourself once.)",
        },
      },
      {
        task: "Back in PowerShell, check that your MySQL server from Unit 1 is still running:  Get-Service MySQL*",
        hint:
          "Look at the Status column after Get-Service. To start MySQL: press the Windows key, type services, open the Services app, find MySQL80 (the list is alphabetical), right-click it → Start. Which answer keeps your ledger and gets it running?",
        check: {
          question: "It says Stopped. What now?",
          choices: [
            "Reinstall MySQL",
            "Ignore it — nothing today uses the database",
            "Start it: open the Services app, find MySQL80, click Start. You'll query your own ledger today to pick Aling Nena's special",
          ],
          answer: 2,
          explain:
            "Your new Spring project doesn't need MySQL yet — it only has Spring Web. But your page's 'Today's special' comes out of your real ledger, so you need it running. And in Week 8, when your app joins the chain, a stopped MySQL becomes exactly Week 4's 'Communications link failure'.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Spring Boot Using VS Code — create a Spring Boot project (CS CORNER Sunita Rai)",
      youtubeId: "Fjx7poyoZik",
      length: "7:12",
      practice: {
        intro: "Watch it once. Then build your own project, following these choices exactly:",
        steps: [
          "In VS Code press Ctrl+Shift+P and run  Spring Initializr: Create a Maven Project.",
          "Spring Boot version: take the one at the TOP of the list — VS Code puts the recommended stable version first (4.1.1 right now), exactly as the video says. Never pick one marked (SNAPSHOT) or (M1)/(M2) further down, even though some have bigger numbers: those are unfinished test builds.",
          "Language: Java. Group Id: com.yourname — your own name, lowercase, no spaces (com.maria). Artifact Id: canteen-web. Packaging: Jar. Java version: 17 — the top of the list. It runs on Java 17 or anything newer, so it works on every lab machine.",
          "Dependencies: search and tick Spring Web. Only that one today. Press Enter.",
          "Save it in your Documents folder. When VS Code asks, open the new project.",
          "Follow the video's last part too: add HelloController.java — in the SAME folder as CanteenWebApplication.java, because Spring only looks for controllers there and in folders below it — with @RestController and @GetMapping(\"/hello\"), run the app, and open http://localhost:8080/hello. You just wrote your first web API endpoint — Week 7 is all about what that means.",
          "While it's still running, also open plain http://localhost:8080 — nothing after the 8080. Remember what you see there; the lab below asks about it.",
        ],
        note: "Windows will pop up a firewall question about Java the first time it runs. Allow is fine; Cancel is fine too — your own browser reaches localhost either way. Wait for the status bar to stop saying Downloading/Importing before you press Run the first time: the first project downloads its libraries once.",
      },
    },
    {
      title: "HTML tutorial for beginners (Bro Code)",
      youtubeId: "2oCN2q1x3c4",
      length: "11:08",
      practice: {
        intro: "Bro Code puts his page in a 'website' folder on his desktop. Yours goes somewhere better — inside your project, where your Java app can serve it:",
        steps: [
          "In VS Code's Explorer, open canteen-web → src → main → resources → static. Right-click static → New File → index.html.",
          "Type out the skeleton the video builds: <!DOCTYPE html>, <html>, <head> with a <title>, and <body>. Type it — don't paste, and don't use the ! shortcut yet. Your fingers need the shape once.",
          "Fill it in as the video goes: headings, paragraphs, <br>, <hr>, <pre>, and one comment.",
          "Right-click index.html → Open with Live Server. Change a word, save (Ctrl+S), and watch the browser change by itself.",
        ],
        note: "Keep this file. You'll paste it into the checker below, and every page you build this week sits next to it.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: Aling Nena's canteen goes on the web",
      intro:
        "In Week 4 you gave Aling Nena a program that talks to her ledger — from a black console window she'd never open. This unit she gets something she WOULD use: a website. It starts today, in the project you just made — the same project you'll keep building for the coming weeks: pages first, then from Week 7 a real web API inside it.",
      missions: [
        {
          task: "Think back to the video practice: your app was running (the /hello step) and you opened plain http://localhost:8080 — before index.html existed. (Your main file is CanteenWebApplication.java: in the Explorer open src → main → java and keep opening folders — com, your name, canteen_web or similar — until you reach it. Run is the small link above main.)",
          hint:
            "Can't find CanteenWebApplication.java? In the Explorer on the left, open src → main → java and keep clicking folders until a .java file appears. For the question: a Whitelabel page is drawn by Spring Boot itself. If Spring drew it, was your app running?",
          check: {
            question: "You got a 'Whitelabel Error Page' with status=404. What did that tell you?",
            choices: [
              "The project is broken and must be recreated",
              "Everything works: your Java server is running and answered — it just has no page to show at / yet",
              "Port 8080 is blocked by the firewall",
            ],
            answer: 1,
            explain:
              "Read errors for what they rule OUT, exactly like Week 4's 1049. A Whitelabel page can only come FROM your Spring Boot app, so the app started, Tomcat is listening, and your browser reached it. The 404 just means 'nothing lives at this address'. You're about to fix that.",
          },
        },
        {
          task: "From this week you run SQL inside VS Code, not in MySQL Workbench. Connect once: click the SQLTools icon in the left bar (a database cylinder) → Add New Connection → MySQL. Connection name: ledger. Server Address: localhost. Port: 3306. Database: school. Username: root (or whatever you used in Week 4). Leave Password mode as it is. Click TEST CONNECTION, type your MySQL password when asked, then SAVE CONNECTION.",
          hint:
            "No cylinder icon in the left bar? SQLTools isn't installed: Ctrl+Shift+X, search SQLTools, install it AND SQLTools MySQL/MariaDB/TiDB. If the connection fails, read the error the way you did in Week 4: 'Access denied' is a wrong password, 'Unknown database' is a wrong Database name, 'refused' means MySQL isn't running.",
          check: {
            question: "TEST CONNECTION says  Access denied for user 'root'@'localhost' (using password: YES). What do you already know about this from Week 4?",
            choices: [
              "SQLTools can't reach MySQL at all",
              "It's error 1045: the server WAS reached and answered, and it rejected the password. Check it — it's the same one your ConnectTest used",
              "The school database doesn't exist",
            ],
            answer: 1,
            explain:
              "SQLTools is just another client, like your Java program and like Workbench — so it gets exactly the same answers from MySQL. Week 4's four failures work here unchanged. (And leave Password mode alone: it keeps your password in VS Code's secure storage, not in a file in your project that you might hand in.)",
          },
        },
        {
          task: "Now get Aling Nena's special from her ledger — your ledger, with the sales YOUR RecordSale added last week. At the top of your project (next to pom.xml, NOT inside static), create queries.sql. Write the query: join sales to snacks, show snacks.name, snacks.price and sales.sold_on, newest date first. Put your cursor on it and press Ctrl+E then Ctrl+E (if asked, choose the ledger connection). The first row of the result is today's special.",
          hint:
            "Build it in three parts. FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id joins the tables (the same join as Week 4). Put SELECT snacks.name, snacks.price, sales.sold_on in front of it, and ORDER BY sales.sold_on DESC at the end — DESC means newest first. Nothing happens on Ctrl+E Ctrl+E? Click inside the query first, and pick the ledger connection if it asks.",
          input: "Paste your query and the first row it returned",
        },
        {
          task: "Why queries.sql at the top of the project and not inside static/?",
          hint:
            "You opened index.html by typing localhost:8080. What would you type to open a file called queries.sql if it were in the same folder? Could a stranger type that too?",
          check: {
            question: "What would happen if queries.sql were in static/?",
            choices: [
              "Nothing different",
              "Your app would serve it to anyone who asked for localhost:8080/queries.sql — everything in static/ is public. Notes and queries stay out of it",
              "It would run automatically when the app starts",
            ],
            answer: 1,
            explain: "static/ means 'send this to whoever asks'. Only put files there that you want every visitor to be able to read.",
          },
        },
        {
          task: "Now make index.html (inside static) into Aling Nena's real front page. It needs: a <title> that says Aling Nena's Canteen; ONE <h1> that says Aling Nena's Canteen; a <p> welcoming customers; an <h2> that says Today's special; a <p> describing it — the snack and price your query just found; an <hr>; a <pre> with her opening hours, one line per day (Mon–Fri 7:00–16:00 is fine); and a last <p> that says Made by and your name.",
          hint:
            "Build it top to bottom in the order the task lists, one tag per line: <title> (inside <head>), then in <body>: <h1>, <p>, <h2>, <p>, <hr>, <pre>, <p>. For the question: headings are about what the page IS, not how big the text looks.",
          check: {
            question: "Why exactly ONE <h1>?",
            choices: [
              "Browsers crash on two",
              "Two <h1> tags make the text too big",
              "The <h1> is the page's title for screen readers and search engines — the one line that says what this page IS. Sections under it get <h2>",
            ],
            answer: 2,
            explain:
              "Headings are an outline, not font sizes. <h1> is the page, <h2> is a section, <h3> a part of a section. If you want big text that isn't a title, that's CSS's job — Thursday.",
          },
        },
        {
          task: "One file in your project you didn't write: pom.xml, at the top. Open it and find <dependencies>. Inside is a <dependency> whose artifactId is spring-boot-starter-webmvc — that's the Spring Web you ticked. (Older videos call it spring-boot-starter-web; Spring Boot 4 renamed it.)",
          hint:
            "pom.xml is at the very top of the project, next to the src folder. Open it and press Ctrl+F, type webmvc. For the question: in Week 4 you downloaded a .jar and added it by hand so Java could find MySQL's driver. What does a line that NAMES a jar save you from?",
          check: {
            question: "Remember Week 4's classpath quest — downloading the Connector/J .jar and adding it to your project by hand. What is that <dependency> doing?",
            choices: [
              "The same job, automatically: it names the jars your project needs, and Maven downloads them and puts them on the classpath for you — Spring, the Tomcat web server, all of it",
              "It installs Spring Boot on Windows",
              "Nothing until you deploy the app",
            ],
            answer: 0,
            explain:
              "That's what pom.xml is for, and why the first project took a while to open: Maven was downloading jars into a folder called .m2 in your user folder. In Week 8 you'll add MySQL's driver the same way — one more <dependency> naming mysql-connector-j, the very jar you fetched by hand last week.",
          },
        },
        {
          task: "Stop the app (red square in VS Code's toolbar) and run it again. Open http://localhost:8080 — no file name on the end.",
          hint:
            "Stop = the red square at the top of VS Code while the app runs. Run = the small 'Run' link just above 'public static void main'. For the question: try localhost:8080/index.html too — same page. Which program filled in the file name for you?",
          check: {
            question: "Your page appears at plain localhost:8080. Why didn't you have to type /index.html?",
            choices: [
              "Spring Boot treats static/index.html as the welcome page — the one it serves when someone asks for the site itself",
              "Browsers always add /index.html",
              "Live Server told Spring Boot about it",
            ],
            answer: 0,
            explain:
              "It's a convention almost every web server shares: index.html is the page for a folder. Try http://localhost:8080/index.html too — same page. Your other pages won't get that treatment: they'll be /menu.html, with the .html.",
          },
        },
        {
          task: "Now open the SAME file with Live Server (right-click index.html → Open with Live Server). Look at the two browser tabs. One says localhost:8080. The other says 127.0.0.1:5500/src/main/resources/static/index.html — long, because Live Server starts from your project's top folder.",
          hint:
            "Right-click index.html in the Explorer on the left (not inside the editor). No 'Open with Live Server' in the menu means the Live Server extension isn't installed. For the question: which of the two reloads by itself when you save, and which one is your own Java program?",
          check: {
            question: "Two addresses, one file. What's the difference?",
            choices: [
              "5500 is the real website and 8080 is a preview",
              "They're the same server with two names",
              "8080 is YOUR Java app serving the page. 5500 is Live Server, a helper that reloads on every save. Write pages with Live Server open; check them in your app before you hand anything in",
            ],
            answer: 2,
            explain:
              "Live Server is scaffolding — fast feedback while you type. Your Spring Boot app is the real thing, the server that will also answer your API calls from Week 7. Right now they show the same file; in a few weeks only 8080 will be able to fetch your ledger.",
          },
        },
        {
          task: "Start a notes file for the unit: right-click the project's top folder → New File → notes.md. Write down: your project's folder path, the Spring Boot version you picked, your Java version, and the three addresses you used today (localhost:8080, localhost:8080/hello, and Live Server's 127.0.0.1:5500/… address) with one line each on what answers there.",
          hint:
            "Right-click the very top folder (canteen-web) in the Explorer → New File → notes.md. Your Spring Boot version is in pom.xml, inside <parent>, on its <version> line. Write one line per address, like: localhost:8080 — my Spring app, shows index.html.",
          input: "Paste your notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-front-page",
      title: "🧪 Checkpoint: is your front page all there?",
      intro:
        "Paste your whole index.html from VS Code into the editor (Ctrl+A in VS Code, Ctrl+C, then Ctrl+V here). The checker looks at the page your browser builds and tells you the first thing that's missing. Fix it in VS Code, save, copy, paste again — your VS Code file is the one that counts.",
      starter:
        "<!-- Delete this line, then paste your whole index.html from VS Code here -->\n",
      tasks: [
        {
          goal: "Paste your index.html. First check: the browser tab and the page both say whose canteen this is.",
          checks: [
            {
              selector: "body *",
              message:
                "There's nothing on this page yet. In VS Code, open index.html, press Ctrl+A then Ctrl+C, come back here, select everything in the editor on the left and press Ctrl+V.",
            },
            {
              selector: "title",
              text: "canteen",
              message:
                "No <title> mentioning the canteen. The title goes inside <head> — it's the text on the browser TAB, not on the page.",
            },
            {
              selector: "h1",
              text: "Aling Nena",
              message: "No <h1> that says Aling Nena's Canteen. That's the big title at the top of the page itself.",
            },
          ],
          hint: "Two different titles: <title> in the head names the tab, <h1> in the body names the page. A page needs both.",
          solution:
            "<head>\n  <title>Aling Nena's Canteen</title>\n</head>\n<body>\n  <h1>Aling Nena's Canteen</h1>",
          explain:
            "Same words, two jobs. The <title> is what shows on the tab, in bookmarks and in search results; the <h1> is what a visitor reads first on the page.",
        },
        {
          goal: "Exactly one <h1> — and a section below it: an <h2> for Today's special.",
          checks: [
            {
              selector: "h1",
              exact: 1,
              message:
                "Your page needs exactly one <h1> — the page title. If you have more, turn the others into <h2> (a section) or <h3> (part of a section); if you have none, put Aling Nena's Canteen back in an <h1>.",
            },
            {
              selector: "h2",
              text: "special",
              message: "No <h2> that says Today's special.",
            },
          ],
          hint: "If you used <h1> just because it's big, change it to <h2> — size is CSS's job, not the heading's.",
          solution: "<h2>Today's special</h2>",
          explain: "An outline a screen reader can follow: one page title, sections under it.",
        },
        {
          goal: "Real content: at least three paragraphs — the welcome, the special, and your Made by line.",
          checks: [
            {
              selector: "p",
              min: 3,
              message:
                "Fewer than three <p> paragraphs. You need: a welcome, a description of the special, and a line saying Made by and your name.",
            },
            {
              selector: "p",
              text: "made by",
              message: "No paragraph that says Made by … — sign your page.",
            },
          ],
          hint: "Each paragraph is its own <p>…</p>. Pressing Enter inside one paragraph does nothing on the page — HTML ignores line breaks in your code.",
          solution: "<p>Made by Maria Santos</p>",
          explain:
            "One thing to know about paragraphs: pressing Enter inside a <p> in your code does nothing on the page. The browser ignores the line breaks and extra spaces in your file — structure comes from tags, never from how the text is laid out.",
        },
        {
          goal: "A dividing line, and the opening hours laid out exactly as you typed them.",
          checks: [
            {
              selector: "hr",
              message: "No <hr> — the horizontal line that separates the special from the rest.",
            },
            {
              selector: "pre",
              message:
                "No <pre> block for the opening hours. <pre> is the one tag that keeps your spaces and line breaks exactly as typed.",
            },
            {
              selector: "pre",
              text: ":",
              message: "Your <pre> is there but has no times in it — put the opening hours inside it, like Mon–Fri 7:00–16:00.",
            },
          ],
          hint: "<hr> is a single tag with no closing partner, like <br>. <pre> needs both <pre> and </pre> around the hours.",
          solution: "<hr>\n<pre>\nMon–Fri   7:00–16:00\nSat       8:00–12:00\n</pre>",
          explain:
            "<pre> is the exception that proves the rule from the last checkpoint: everywhere else HTML squashes your spacing, and inside <pre> it keeps every space.",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-front-page",
      title: "📸 Hand in: your page, served by your own Java app",
      intro:
        "Proof that it runs on YOUR machine — not in Live Server, not in the checker: your Spring Boot app, serving your page.",
      steps: [
        "Make sure your app is running (Run above main in CanteenWebApplication.java) and the terminal says Tomcat started on port 8080.",
        "Open http://localhost:8080 in your browser.",
        "Arrange the screen so BOTH are visible: the browser with the address bar showing localhost:8080, and VS Code's terminal showing the Tomcat started line.",
        "Press Windows+Shift+S and drag over the whole screen. Windows 11 saves it automatically in Pictures → Screenshots (if you don't find it there, click the notification that pops up and press the save icon).",
        "Upload it below.",
      ],
      proves:
        "your page — with your own special, your own Made by line and your hours — being served at localhost:8080 by the Spring Boot project you created today, with its own terminal beside it. Nobody else's screenshot has your name in both the page and the project path.",
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro:
        "Same clinic as Week 4, new building. Each patient is a web project that isn't working, shown with what the student saw. Diagnose it from what's on screen alone — you'll see every one of these yourself this month, probably more than once.",
      missions: [
        {
          task: "Patient 1. The terminal says:  Web server failed to start. Port 8080 was already in use.",
          hint:
            "'Already in use' means something is ALREADY sitting at 8080. On your own computer, which program is most likely sitting there — one you started yourself?",
          check: {
            question: "What's the most likely cause in a classroom?",
            choices: [
              "Another student is using your port 8080 over the network",
              "Your app is ALREADY running — from an earlier Run you never stopped — and a second copy can't take the same door",
              "Spring Boot must be reinstalled",
            ],
            answer: 1,
            explain:
              "Only one program can listen on a port. Look at VS Code's terminal panel: there's probably an older run still alive. Stop it (red square, or the trash can on that terminal) and run again. Other people's computers have their own 8080 — yours is only yours.",
          },
        },
        {
          task: "Patient 2. The browser shows:  This site can't be reached — localhost refused to connect  (ERR_CONNECTION_REFUSED).",
          hint:
            "Compare it with the Whitelabel page, which your app draws. Here, did anything draw a page at all?",
          check: {
            question: "Compare this with the Whitelabel page. What's different about what it proves?",
            choices: [
              "Nothing — both mean the page is missing",
              "It means the firewall blocked you",
              "Nothing answered at all: the app isn't running (never started, stopped, or crashed on startup). A Whitelabel page at least proves the app is up",
            ],
            answer: 2,
            explain:
              "Same split as Week 4's error code 0 versus a real MySQL number. Whitelabel = the server answered 'I have nothing here'. Refused = there was no server to answer. Check the terminal: either nothing is running, or it crashed and the reason is printed there.",
          },
        },
        {
          task: "Patient 3. The student made menu.html in src/main/resources/templates and gets a Whitelabel 404 at http://localhost:8080/menu.html.",
          hint:
            "Look at the folder name, not the file name. Which folder did every page that worked today live in?",
          check: {
            question: "Why doesn't Spring Boot serve it?",
            choices: [
              "templates/ is for pages a Java controller builds with a template engine; plain .html files the browser gets as-is must go in static/",
              "Files named menu are reserved",
              "The app needs a restart after every new file, and nothing else is wrong",
            ],
            answer: 0,
            explain:
              "Folder names are instructions here. static/ means 'send this file exactly as it is' — that's every page you write this unit. templates/ is for a different technique we aren't using, and a file there is invisible to the browser.",
          },
        },
        {
          task: "Patient 4. The student's page is static/about.html. They type http://localhost:8080/about and get a 404.",
          hint:
            "How did index.html get served without its name? Does about.html get the same special treatment?",
          check: {
            question: "What's the fix?",
            choices: [
              "Rename the file to about with no extension",
              "Ask for the file by its full name: http://localhost:8080/about.html. Only index.html gets served without its name",
              "Move it into a folder called about",
            ],
            answer: 1,
            explain:
              "A static file's address is its file name. index.html is the single exception, because it's the welcome page. When you link pages together tomorrow, write the .html in every link.",
          },
        },
        {
          task: "Patient 5. The student changed their special from Turon to Siopao and saved. Live Server shows Siopao. localhost:8080 still shows Turon.",
          hint:
            "Two places show your page, and they get it differently: Live Server reads the file you're typing in; your app serves a copy of it. When they disagree, what do you check first about the file — and then what do you do to the app?",
          check: {
            question: "What do you check, in order?",
            choices: [
              "Reinstall VS Code",
              "Clear the browser history, then restart the computer",
              "That the file is really saved (a ● on the tab means NOT saved), then restart the app so it serves a fresh copy of your files. That's why you write pages with Live Server open",
            ],
            answer: 2,
            explain:
              "Live Server reads the very file you're typing in. Your Spring app serves a COPY of static/ that VS Code builds for it (in the target folder), and that copy can fall behind. Restarting the app makes VS Code rebuild the copy first. Neither is broken — they just work differently. Restart the app before you screenshot anything for a hand-in.",
          },
        },
        {
          task: "Patient 6. The student clicks Run and it won't compile. The terminal says  error: release version 21 not supported  (in VS Code's Problems panel the same thing can show up as a warning mentioning JavaSE-21).",
          hint:
            "The 21 is not a line number. Where else today did you see a 17 or a 21? (Think about the wizard, and what java -version said.)",
          check: {
            question: "What happened?",
            choices: [
              "The project was created for Java 21, but the Java installed on this machine is older, so it can't compile code for 21",
              "Spring Boot doesn't support Java 21",
              "The code has a syntax error on line 21",
            ],
            answer: 0,
            explain:
              "The number is a Java version, not a line number. Run java -version: if it says 17, recreate the project choosing Java 17 (or change <java.version> in pom.xml to 17). The Java you pick in the wizard must be one your machine actually has.",
          },
        },
        {
          task: "Write the clinic's discharge notes: for each of the six patients, one line on what the message told you and the first thing you'd check. Then the one general rule you'd give somebody starting a web project tomorrow.",
          hint:
            "One line per patient in the pattern: message → what it means → what I check first. Example: 'Port 8080 already in use → my app is already running → stop the old run.' Then one rule that would help with all six.",
          input: "Paste your six discharge notes plus your general rule",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-first-page",
    title: "⚔️ Boss battle: The Blank Page",
    intro:
      "The Blank Page wants Aling Nena's canteen to stay invisible. Everything you set up and built today is a weapon against it.",
    boss: { name: "the Blank Page", emoji: "📄" },
    questions: [
      {
        prompt: "Week 4: your program connected to localhost:3306. Today: your browser opens localhost:8080. What changed?",
        choices: [
          "Your Java program switched sides — last week it was the client asking MySQL; today it's the server answering the browser",
          "MySQL moved to port 8080",
          "Nothing — 8080 is just another way to reach MySQL",
        ],
        answer: 0,
        explain:
          "Two servers now, two doors: MySQL at 3306, your app at 8080. By Week 8 your app is both — the server the browser asks, and the client that asks MySQL.",
      },
      {
        prompt: "Where do the HTML pages for your Spring Boot app go?",
        choices: [
          "src/main/resources/templates",
          "src/main/resources/static",
          "A folder called website on the desktop",
        ],
        answer: 1,
        explain:
          "static/ is served as-is, straight to the browser. Everything you write in this unit lives there, next to the Java code that will serve your API in Week 7.",
      },
      {
        prompt: "A fresh app shows a Whitelabel Error Page (404) at localhost:8080. What is PROVEN to work?",
        choices: [
          "Nothing — it's an error",
          "Only VS Code",
          "Your app started, Tomcat is listening on 8080, and your browser reached it",
        ],
        answer: 2,
        explain: "Only your running app can produce that page. The 404 just says there's nothing at / yet.",
      },
      {
        prompt: "Which Spring Boot version should you pick in the wizard?",
        choices: [
          "The recommended one VS Code lists first (4.1.1 today) — never one marked (SNAPSHOT) or (M2)",
          "The biggest number in the list, 4.2.0, because newer is better",
          "The oldest one, because it's most tested",
        ],
        answer: 0,
        explain:
          "The biggest numbers in that list are SNAPSHOT and M (milestone) builds — unfinished, fine for the people building Spring, wrong for your project. The first entry is the stable release start.spring.io recommends.",
      },
      {
        prompt: "What goes inside <head> rather than <body>?",
        choices: [
          "The <h1> — it's the head of the page",
          "Information ABOUT the page, like the <title> shown on the browser tab",
          "Everything the visitor reads",
        ],
        answer: 1,
        explain:
          "The body is what's shown on the page. The head describes the page: its tab title, and — on Thursday — the stylesheet that dresses it.",
      },
      {
        prompt: "You press Enter three times between two sentences inside one <p>. What does the browser show?",
        choices: [
          "The two sentences on one line, with a single space between them",
          "Three blank lines between them",
          "An error",
        ],
        answer: 0,
        explain:
          "HTML collapses whitespace. A new line on the page takes a tag: a new <p>, or a <br>. <pre> is the only place your spacing survives.",
      },
      {
        prompt: "Why does your page appear at localhost:8080 without typing /index.html?",
        choices: [
          "Browsers guess file names",
          "It's the only file in static",
          "index.html is the welcome page — the one a server sends when you ask for the folder itself",
        ],
        answer: 2,
        explain: "Every other page needs its full name: /menu.html, /about.html.",
      },
      {
        prompt: "'Port 8080 was already in use.' The first thing to check?",
        choices: [
          "Whether the school network is down",
          "Whether an earlier run of your own app is still going in another terminal",
          "Whether index.html is saved",
        ],
        answer: 1,
        explain: "One program per port. Stop the old run and start again.",
      },
      {
        prompt: "What does Live Server (127.0.0.1:5500) do that your Spring Boot app (localhost:8080) doesn't?",
        choices: [
          "It reloads the page by itself every time you save",
          "It can reach your MySQL database",
          "It's the version your users will see",
        ],
        answer: 0,
        explain:
          "It's a writing aid. Your app is the real server — and it's the only one of the two that will ever talk to your database.",
      },
      {
        prompt: "The browser says 'localhost refused to connect'. Where do you look first?",
        choices: [
          "At index.html",
          "At the firewall settings",
          "At VS Code's terminal — the app isn't running, or it crashed and printed why",
        ],
        answer: 2,
        explain: "Refused means nothing answered. The reason, if there is one, is in the terminal, not the browser.",
      },
      {
        prompt: "'error: release version 21 not supported' — what's the 21?",
        choices: [
          "The line number of the error",
          "The Java version the project was made for, which is newer than the Java on this machine",
          "The number of files in the project",
        ],
        answer: 1,
        explain: "Pick a Java version in the wizard that java -version says you actually have.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "Your project's Group Id, Artifact Id, Spring Boot version and Java version.",
      "The folder your pages live in, and what would happen to a page put in templates instead.",
      "What a Whitelabel 404 proves, and what 'refused to connect' proves — in one line each.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "You now own a real Java web project — the same kind companies run. It's nearly empty, and that's the point: every page and every endpoint for the coming weeks goes into this one.",
  },
};
