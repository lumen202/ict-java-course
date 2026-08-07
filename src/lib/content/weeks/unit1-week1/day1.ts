// unit1-week1 · Day 1 — Get MySQL installed and create your first database
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Get MySQL installed and create your first database",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup",
    title: "🕹️ Warm-up game: YOU are the database",
    intro:
      "Before you install a database, be one. Below is a table called friends — columns across the top, one row per person. Each round asks you a question; answer it by clicking the row (or rows) that match, then press Run. This clicking-and-checking is exactly what MySQL will do for you at superhuman speed from tomorrow on.",
    tableName: "friends",
    columns: ["name", "age", "favorite_subject", "dream_job"],
    rows: [
      ["Liza", "14", "Math", "Engineer"],
      ["Marco", "16", "Science", "Nurse"],
      ["Jen", "15", "Math", "Game developer"],
      ["Paolo", "13", "English", "Teacher"],
      ["Kristine", "16", "Science", "Game developer"],
      ["Ramon", "15", "PE", "Pilot"],
    ],
    rounds: [
      {
        question: "Find the youngest person — click their row.",
        matches: [3],
        sql: "-- What you just did, in SQL (you'll learn this soon):\nSELECT * FROM friends ORDER BY age;",
        explain:
          "You scanned the age column of every row and kept the smallest. Congratulations — that was a query.",
      },
      {
        question: "Find everyone whose favorite subject is Math.",
        matches: [0, 2],
        sql: "SELECT * FROM friends\nWHERE favorite_subject = 'Math';",
        explain:
          "You kept only the rows matching a condition. In SQL that condition is called WHERE — you'll type it for real on Day 3.",
      },
      {
        question: "Find everyone who is 15 or older.",
        matches: [1, 2, 4, 5],
        sql: "SELECT * FROM friends\nWHERE age >= 15;",
        explain: "Conditions work on numbers too — 'age is at least 15' becomes age >= 15.",
      },
      {
        question: "Find everyone who is 16 AND loves Science.",
        matches: [1, 4],
        sql: "SELECT * FROM friends\nWHERE age = 16 AND favorite_subject = 'Science';",
        explain:
          "Two conditions at once: a row must pass BOTH to stay. That's the AND you'll meet on Day 3.",
      },
      {
        question: "Find everyone dreaming of being a game developer OR a pilot.",
        matches: [2, 4, 5],
        sql: "SELECT * FROM friends\nWHERE dream_job = 'Game developer' OR dream_job = 'Pilot';",
        explain: "OR keeps a row if it passes EITHER condition — so you get both groups.",
      },
      {
        question: "Last one: SELECT * means EVERYTHING — click every row.",
        matches: [0, 1, 2, 3, 4, 5],
        sql: "SELECT * FROM friends;",
        explain:
          "No condition, no filter: every row comes back. The star means 'all columns'. This is the very first query you'll run for real.",
      },
    ],
  },
  videos: [
    {
      title: "MySQL tutorial for beginners (intro + installation)",
      youtubeId: "oPV2sjMG53U",
      length: "10:30",
      practice: {
        steps: [
          "Install MySQL Community Server and MySQL Workbench.",
          "While the installer downloads, play a memory round: close your warm-up file, try to recite its columns from memory, then open it and check.",
          "Open Workbench and connect to your local server.",
        ],
        note: "Slow internet or an installer that keeps fighting you? No problem — switch to DB Fiddle (reading track) for today and carry on; you can finish the install at home. Don't lose the day to an installer.",
      },
    },
    {
      title: "How to create a DATABASE",
      youtubeId: "9LQ9rGoGfYQ",
      length: "4:01",
      practice: {
        steps: [
          "Create a database called `school`, run `SHOW DATABASES;` and find yours in the list.",
          "Create a second one called `sandbox` and find it too.",
          "Remove it with `DROP DATABASE sandbox;`.",
        ],
        note: "Creating and deleting your own things is how you prove the server does what YOU tell it.",
      },
    },
  ],
  activities: [
    {
      kind: "sql-console",
      id: "mini-server",
      title: "🖥️ Mini server: cast your first spells for real",
      intro:
        "This box is a real (tiny) MySQL server living in this page. Everything the video showed, you now do yourself — type each command, press Run, and read what the server says back. Then break things on purpose and meet your first error messages while they can't hurt anything.",
      tasks: [
        {
          goal: "Create a database called school.",
          solution: "CREATE DATABASE school;",
          hint: "Two words, then the name, then a semicolon: CREATE DATABASE school;",
          explain:
            "Query OK — you just made a database with one line of SQL. This exact command works letter-for-letter in Workbench.",
        },
        {
          goal: "List every database on the server and find school in the list.",
          solution: "SHOW DATABASES;",
          hint: "SHOW DATABASES; — plural, with an S.",
          explain:
            "There it is, alongside databases like sys that MySQL keeps for itself. Every MySQL server ships with those — leave them alone.",
        },
        {
          goal: "Create a practice database called sandbox.",
          solution: "CREATE DATABASE sandbox;",
          explain: "Same spell, different name. sandbox is where we practice dangerous things.",
        },
        {
          goal: "Now delete sandbox.",
          solution: "DROP DATABASE sandbox;",
          hint: "DROP DATABASE sandbox; — DROP is the deleting word.",
          explain:
            "Gone — permanently, no recycle bin. That's why we practiced on sandbox and never on school.",
        },
        {
          goal: "Time to break something. Run this EXACTLY as written (the missing E is the point): CREAT DATABASE oops;",
          solution: "CREAT DATABASE oops;",
          explain:
            "Read the red line: a syntax error near 'CREAT'. MySQL only understands exact keywords, and 'syntax error near X' almost always means a typo in or near X. You'll meet this message a hundred times — now it's a friend.",
        },
        {
          goal: "Break it differently: try to create school AGAIN.",
          solution: "CREATE DATABASE school;",
          hint: "Just run CREATE DATABASE school; a second time.",
          explain:
            "A different mistake gets a different error: 'database exists'. Database names are unique on a server. Notice the error told you exactly what's wrong — errors are information, not punishment.",
        },
        {
          goal: "One more: run SHOW DATABASE; — singular, no S — and read the complaint.",
          solution: "SHOW DATABASE;",
          explain:
            "It lists ALL the databases, so it's plural: SHOW DATABASES. You've now hit the three most common week-1 errors, on purpose, and read every one like a pro.",
        },
      ],
    },
    {
      kind: "workbench-sim",
      id: "cockpit-tour",
      title: "🛰️ Simulator: learn the Workbench cockpit",
      intro:
        "Before you fly the real thing, fly the simulator. This is a mock of MySQL Workbench — same panels, same buttons, same places. Each mission asks you to click something a pilot needs to find without thinking. Wrong clicks don't crash anything; they just tell you what you found.",
      steps: [
        {
          task: "You just ran CREATE DATABASE school; but the SCHEMAS panel hasn't noticed. Click the refresh icon next to SCHEMAS.",
          target: "schemas-refresh",
          hint: "It's the small 🔄 at the top of the left panel.",
          editor: "CREATE DATABASE school;",
          schemas: ["sys"],
          output: [{ ok: true, text: "CREATE DATABASE school — Query OK" }],
          explain:
            "The panel doesn't watch the server live — it only updates when you refresh. Whenever something you created seems missing, refresh FIRST, panic later.",
        },
        {
          task: "There it is. Click the school schema in the panel.",
          target: "schema:school",
          schemas: ["school", "sys"],
          editor: "CREATE DATABASE school;",
          output: [{ ok: true, text: "CREATE DATABASE school — Query OK" }],
          explain:
            "That's your database — everything you build this week lives under it. The sys one belongs to MySQL itself; leave it be.",
        },
        {
          task: "The editor holds one statement. Click the lightning bolt that runs EVERYTHING in the editor.",
          target: "run-all",
          hint: "It's the plain ⚡ in the toolbar — the one WITHOUT the little cursor mark.",
          schemas: ["school", "sys"],
          editor: "SHOW DATABASES;",
          explain:
            "That bolt runs every statement in the editor, top to bottom. Powerful — and exactly why you'll care about the other bolt in a moment.",
        },
        {
          task: "MySQL replied. Click the panel where it reports a green or red circle for every run.",
          target: "output-panel",
          schemas: ["school", "sys"],
          editor: "SHOW DATABASES;",
          output: [{ ok: true, text: "SHOW DATABASES — 5 row(s) returned" }],
          result: {
            columns: ["Database"],
            rows: [["information_schema"], ["mysql"], ["performance_schema"], ["school"], ["sys"]],
          },
          explain:
            "The Output panel is where MySQL talks back: green circle = ran fine, red circle = an error to read. Check it after EVERY run — it's the habit that separates people who learn SQL fast from people who suffer.",
        },
        {
          task: "The rows themselves came back too. Click the grid where they landed.",
          target: "result-grid",
          schemas: ["school", "sys"],
          editor: "SHOW DATABASES;",
          output: [{ ok: true, text: "SHOW DATABASES — 5 row(s) returned" }],
          result: {
            columns: ["Database"],
            rows: [["information_schema"], ["mysql"], ["performance_schema"], ["school"], ["sys"]],
          },
          explain:
            "Output panel says HOW it went; the result grid shows WHAT came back. Two different places, two different jobs.",
        },
        {
          task: "Now three statements sit in the editor and your cursor is on the middle one (see the ◀). Click the bolt that runs ONLY the statement under the cursor.",
          target: "run-cursor",
          hint: "It's the ⚡ with the small cursor mark next to it.",
          schemas: ["school", "sys"],
          editor: "SHOW DATABASES;\nSHOW DATABASES;   ◀ your cursor is here\nSHOW DATABASES;",
          explain:
            "This bolt will save you many headaches: when your editor holds ten statements, it runs just the one you're standing on. Knowing which bolt you're pressing is half of Workbench.",
        },
        {
          task: "Last mission: click where you would TYPE a new command.",
          target: "editor",
          schemas: ["school", "sys"],
          editor: "",
          explain:
            "The editor — your side of the conversation. You now know the whole loop: type here, run with a bolt, read the Output panel, see rows in the result grid. That's Workbench.",
        },
      ],
    },
    {
      kind: "quest",
      id: "scavenger-hunt",
      title: "🔍 Quest: explore Workbench",
      intro:
        "Four short missions inside MySQL Workbench. Do each one for real — clicking around can't break anything — then answer a quick check to clear it.",
      missions: [
        {
          task: "Find the SCHEMAS panel on the left side of Workbench — your school database lives there. Click the small refresh icon next to the word SCHEMAS.",
          check: {
            question: "What shows up in the SCHEMAS panel after you refresh?",
            choices: [
              "The school database you created",
              "Every MySQL server in the world",
              "Nothing — the panel is just decoration",
            ],
            answer: 0,
            explain:
              "The panel lists the databases on YOUR server — but it only updates when you refresh it. Remember that whenever something seems missing.",
          },
        },
        {
          task: "Hover your mouse over the lightning-bolt buttons above the editor. Read each tooltip slowly.",
          check: {
            question: "What's the difference between the two lightning bolts?",
            choices: [
              "One runs everything in the editor, the other runs only the statement your cursor is on",
              "One runs a query, the other deletes it",
              "Nothing — they're twins",
            ],
            answer: 0,
            explain:
              "Knowing which bolt you're pressing will save you many headaches when your editor has ten statements in it.",
          },
        },
        {
          task: "Type this on three separate lines, put your cursor on the MIDDLE line, and press the cursor-only lightning bolt:",
          code: "SHOW DATABASES;\nSHOW DATABASES;\nSHOW DATABASES;",
          check: {
            question: "Look at the Output panel at the bottom. What does a green circle mean?",
            choices: [
              "The statement ran successfully",
              "MySQL is thinking",
              "The database turned green",
            ],
            answer: 0,
            explain:
              "Green circle = it ran, red circle = an error. That panel is where MySQL talks back to you — check it after every run.",
          },
        },
        {
          task: "Last mission: open Workbench's Preferences → Fonts & Colors and make the editor font bigger. You'll stare at this window for weeks — make it comfortable.",
        },
      ],
    },
    {
      kind: "quest",
      id: "design-table",
      title: "🏪 Quest: design a table for something you love",
      intro:
        "You're going to design a real table about YOUR life — the same job professional database designers argue about in meetings, just with your data instead of a company's. It becomes part of your database later this week.",
      missions: [
        {
          task: "Pick your topic: something with 'many of the same kind of thing'. A sari-sari store's stock, your team's players, episodes of a series, jeepney routes, your playlists…",
          check: {
            question: "Which of these would make a GOOD table?",
            choices: [
              "Your playlist — many songs, each with the same kind of info",
              "One single song",
              "The word 'music'",
            ],
            answer: 0,
            explain:
              "A table is for MANY things of the same shape — one row per thing, same columns for all of them.",
          },
        },
        {
          task: "Open a new text file or spreadsheet. Give your table a name and at least 4 columns, and note what each column holds.",
          check: {
            question: "A column holding 'price in pesos' should hold…",
            choices: [
              "Numbers — so you can compare and sort them",
              "Words — everything is text anyway",
              "Whatever, it doesn't matter",
            ],
            answer: 0,
            explain:
              "It matters a lot: numbers can be compared ('more than 20 pesos?') and sorted. Tomorrow you'll declare column types for real.",
          },
        },
        {
          task: "Fill in several rows of real (or realistic) data. Then stress-test it: think of three questions your table should answer. If it can't answer one, a column is missing — add it.",
        },
        {
          task: "Final mission: turn in your design. Save the file somewhere you'll find it again — your Day 4 twist column will come from this.",
          input:
            "Paste your table here — its name, columns, and rows — plus your three stress-test questions",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet",
      title: "📓 Quest: start your cheat sheet",
      intro:
        "Every SQL wizard keeps a spellbook. Yours starts today, grows every day, and by Friday it's your personal manual.",
      missions: [
        {
          task: "Make a new file called cheatsheet.txt (or a note in any notes app) and title it “SQL — my cheat sheet”.",
        },
        {
          task: "From memory — no peeking anywhere — type today's three commands into your file: create a database, list all databases, delete a database. Then check your Workbench history and fix what you got wrong.",
          check: {
            question: "Why write them from memory first, instead of copying?",
            choices: [
              "Struggling to remember — even getting it wrong — is what makes it stick",
              "It's faster than copying",
              "Copying is against the rules",
            ],
            answer: 0,
            explain:
              "Exactly. The struggle IS the learning — a wrong guess you correct sticks better than a perfect copy-paste.",
          },
        },
        {
          task: "Next to each command in your file, add one line in your own words about what it does and one thing that can go wrong — you met those errors yourself on the mini server.",
          input:
            "Paste your three cheat-sheet entries here — command, meaning, and what can go wrong",
        },
      ],
    },
    {
      kind: "typing",
      id: "typing-commands",
      title: "⌨️ Type the spells",
      intro:
        "A wizard who can't spell can't cast. Fill in the missing pieces of each command — by the last round you'll be typing whole commands from memory, no peeking.",
      rounds: [
        {
          prompt: "Create a database called school.",
          template: "CREATE {DATABASE} school;",
          explain: "CREATE DATABASE — two words, exact spelling, semicolon at the end.",
        },
        {
          prompt: "List every database on the server.",
          template: "{SHOW} DATABASES;",
          explain: "SHOW DATABASES — plural, because it lists all of them.",
        },
        {
          prompt: "Delete the practice database called sandbox.",
          template: "DROP {DATABASE} sandbox;",
          explain: "DROP deletes it permanently — which is why we practice on sandbox, never on school.",
        },
        {
          prompt: "Now from memory: create a database called barangay.",
          template: "{CREATE DATABASE barangay;}",
          explain: "The whole spell, typed by hand. This is exactly what you'll type in Workbench tomorrow morning.",
        },
        {
          prompt: "From memory: list all the databases.",
          template: "{SHOW DATABASES;}",
          explain: "If you typed this without looking, it's yours now.",
        },
        {
          prompt: "Last one, from memory: delete the database barangay.",
          template: "{DROP DATABASE barangay;}",
          explain: "Three commands, all from memory — your cheat sheet just became a backup instead of a lifeline.",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: make it exist on YOUR machine",
      intro:
        "Everything so far lived on this page. Before you face the boss, move it onto your actual computer — a database on your server and a file in your folder that still exist after you close this tab. This is the part that's real.",
      missions: [
        {
          task: "In your real MySQL Workbench (or DB Fiddle if your install failed): create the school database, list all databases to see it, then create AND drop a sandbox database — the full set from today, on the real thing.",
          check: {
            question: "In Workbench, what proves school really exists on your server?",
            choices: [
              "It appears in SHOW DATABASES and in the SCHEMAS panel after a refresh",
              "The editor text turned blue",
              "You typed it, so it exists",
            ],
            answer: 0,
            explain:
              "Always verify with the server's own answer — the list, the panel, the green circle. Typing a command and confirming it worked are two different things.",
          },
        },
        {
          task: "Now the file: create `week1.sql` somewhere you'll find it again (Documents, a school folder). Put a comment header at the top — your name and 'Week 1' — then today's commands under it, copied from your Workbench history.",
          check: {
            question: "Why keep the commands in your own file when Workbench has a history?",
            choices: [
              "The file is yours — it survives reinstalls, moves to other computers, and on Friday it's what you turn in",
              "Workbench deletes history at midnight",
              "SQL only runs from files",
            ],
            answer: 0,
            explain:
              "Every programmer's real work lives in files they own. This one grows every day this week and becomes your Friday hand-in.",
          },
        },
        {
          task: "Last proof: close Workbench COMPLETELY, reopen it, reconnect, refresh SCHEMAS. Find school still there.",
          input:
            "Paste your week1.sql so far (header comment + today's commands), and one sentence: what does school surviving the restart tell you about where data lives?",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-data-dragon",
    title: "⚔️ Boss battle: The Data Dragon",
    intro:
      "The Data Dragon guards the gate to Day 2. It only takes damage from correct answers about today's lesson — and everything you need, you've already done today.",
    boss: { name: "the Data Dragon", emoji: "🐉" },
    questions: [
      {
        prompt: "In a table, one ROW is…",
        choices: [
          "one complete record — one person, one product, one thing",
          "one attribute that everything shares, like age",
          "the whole grid of data",
        ],
        answer: 0,
        explain:
          "A row is one complete 'thing'. The labels across the top are columns — attributes every row shares. The grid of all of it is the table.",
      },
      {
        prompt: "Which spell actually creates a database?",
        code: "A) CREAT DATABASE school;\nB) CREATE DATABASE school;\nC) MAKE DATABASE school;",
        choices: ["A", "B", "C"],
        answer: 1,
        explain:
          "SQL keywords must be exact: CREATE DATABASE. You met A's error yourself on the mini server — “syntax error near CREAT”.",
      },
      {
        prompt: "You cast CREATE DATABASE school; a second time. What does MySQL do?",
        choices: [
          "Creates a second copy of school",
          "Refuses — that database already exists",
          "Silently does nothing",
        ],
        answer: 1,
        explain:
          "Database names are unique on a server, so MySQL answers with a 'database exists' error. An error is information, not punishment.",
      },
      {
        prompt: "SHOW DATABASE; fails. Why?",
        choices: [
          "You can only run it once per session",
          "It's SHOW DATABASES — plural, with an S",
          "You must create a database first",
        ],
        answer: 1,
        explain: "The command lists ALL databases on the server, so it's plural: SHOW DATABASES;",
      },
      {
        prompt:
          "The server you installed vs. the database you created — what's the difference?",
        choices: [
          "They're the same thing with two names",
          "The server is the running program; a database is one named collection of data inside it",
          "The database is the program; the server is the data",
        ],
        answer: 1,
        explain:
          "One MySQL server can hold many databases — school, sandbox, and everything else you'll build in this course.",
      },
      {
        prompt: "Your new database doesn't appear in the SCHEMAS panel. First move?",
        choices: [
          "Reinstall MySQL",
          "Click the refresh icon next to SCHEMAS",
          "Create the database again",
        ],
        answer: 1,
        explain:
          "As you found in the scavenger hunt: the panel doesn't watch the server live — refresh it and your database appears.",
      },
      {
        prompt: "What does DROP DATABASE sandbox; do?",
        choices: [
          "Renames it",
          "Hides it from the SCHEMAS panel",
          "Deletes it — completely, no recycle bin",
        ],
        answer: 2,
        explain:
          "DROP is permanent deletion. That's exactly why you practiced it on sandbox and not on school.",
      },
      {
        prompt: "What language are you speaking when you type these commands?",
        choices: ["SQL", "Java", "English with extra semicolons"],
        answer: 0,
        explain:
          "SQL — Structured Query Language. Every database in this unit speaks it, and Java will speak it too later in the course.",
      },
      {
        prompt: "What is MySQL Workbench, exactly?",
        choices: [
          "The database itself",
          "A window for talking to the MySQL server — the server does the real work",
          "A text editor for Java",
        ],
        answer: 1,
        explain:
          "Workbench is just the tool. The server runs in the background and holds your data — which is why DB Fiddle can replace Workbench, but nothing replaces the server.",
      },
      {
        prompt: "You close Workbench completely and reopen it. Your school database is…",
        choices: [
          "Gone — closing the window deletes everything",
          "Still there — the server keeps the data, Workbench is only a window",
          "Back to how it was this morning",
        ],
        answer: 1,
        explain:
          "Data lives on the server, not in the window. Closing Workbench is like closing your eyes — the world is still there.",
      },
      {
        prompt: "Which character ends every SQL statement?",
        code: "SHOW DATABASES",
        choices: ["A period .", "A semicolon ;", "Nothing — just press Enter"],
        answer: 1,
        explain:
          "The semicolon tells MySQL 'the statement is complete'. Forgetting it is the most common typo of week 1.",
      },
      {
        prompt: "Run these two in order. What does the second one show?",
        code: "DROP DATABASE sandbox;\nSHOW DATABASES;",
        choices: [
          "sandbox is missing from the list",
          "sandbox appears with a warning icon",
          "An error — you can't SHOW after a DROP",
        ],
        answer: 0,
        explain:
          "Dropped means gone: the list simply no longer includes it. Commands run one after another, each changing what the next one sees.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The difference between the *server* you installed and the *database* you created, in your own words.",
      "The most surprising thing you saw today.",
      "One question you still have — bring it tomorrow.",
      "Then paste in the SQL you ran today (your Workbench history has it all).",
    ],
    note: "Tonight's secret weapon: explain out loud what a database is — to someone at home, or just to yourself. Saying it in your own words is the strongest way to keep it.",
  },
};
