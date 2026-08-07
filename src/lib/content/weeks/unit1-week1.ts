import type { Week } from "../types";

export const unit1Week1: Week = {
  slug: "unit1-week1",
  unit: "Unit 1 · Databases & SQL",
  title: "Week 1 — What is a database? Your first SELECT",
  summary:
    "This week you'll learn what a database actually is, get MySQL running on your machine, and write your first real SQL queries. By Friday you'll have a working database with data YOU designed.",
  objectives: [
    "Explain in your own words what a database is and how a table, row, and column relate to each other",
    "Install MySQL Server and MySQL Workbench (or use a browser fallback if installation fails)",
    "Create a database and a table, choosing a sensible type for every column, and INSERT rows into it",
    "Write SELECT queries that filter rows with WHERE, combine conditions with AND / OR / NOT, and sort with ORDER BY",
    "Read a MySQL error message and know what to change — and tell a broken query apart from a true-but-empty answer",
    "Change a table you already built: add a column with ALTER TABLE and fill it in with UPDATE",
  ],
  video: {
    title: "Bro Code — MySQL tutorial for beginners 🐬",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ",
    watchNotes: [
      "One day at a time, in order — each day is short on purpose. Don't binge ahead; the practice in between is where the learning happens.",
      "Do NOT just watch. Pause every few minutes and type the SQL yourself in Workbench. Watching without typing feels like learning but isn't.",
      "Slowing a video to 0.75× and turning on captions is a smart move, not a weakness.",
      "Plan for about twice the video length per day — the minutes shown are watch time, and typing along takes at least as long again.",
    ],
    days: [
      {
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
            practice:
              "Install MySQL Community Server and MySQL Workbench, then open Workbench and connect to your local server. While the installer downloads, play a memory round: close your warm-up file and try to recite its columns from memory, then open it and check. If MySQL still won't install after 30 minutes, switch to DB Fiddle (reading track) and carry on — don't lose the day to an installer.",
          },
          {
            title: "How to create a DATABASE",
            youtubeId: "9LQ9rGoGfYQ",
            length: "4:01",
            practice:
              "Create a database called `school`, run `SHOW DATABASES;` and find yours in the list. Then create a second one called `sandbox`, find it too, and remove it with `DROP DATABASE sandbox;`. Creating and deleting your own things is how you prove the server does what YOU tell it.",
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
        practice:
          "Exit ticket — type three things into the turn-in box below: (1) the difference between the *server* you installed and the *database* you created, in your own words; (2) the most surprising thing you saw today; (3) one question you still have — bring it tomorrow. Then paste in the SQL you ran today (your Workbench history has it all). Tonight's secret weapon: explain out loud what a database is — to someone at home, or just to yourself. Saying it in your own words is the strongest way to keep it.",
      },
      {
        day: "Day 2",
        focus: "Build your students table and fill it with people",
        warmupGame: {
          kind: "row-hunt",
          id: "warmup-day2",
          title: "🕹️ Warm-up game: quality control",
          intro:
            "Someone typed a paper sign-up sheet into a table and checked nothing. A real table is fussy on purpose: every column is declared up front to hold ONE kind of value, and anything else bounces. Be the fussy one — find the values that don't belong. Today you'll write those rules yourself.",
          tableName: "signups",
          columns: ["name", "age", "grade_level", "joined_on"],
          rows: [
            ["Liza", "14", "8", "2026-06-03"],
            ["Marco", "sixteen", "10", "2026-06-03"],
            ["Jen", "15", "9", "2026-06-04"],
            ["Paolo", "13", "seven", "2026-06-05"],
            ["Kristine", "16", "10", "last Tuesday"],
            ["Ramon", "15", "9", "2026-06-05"],
          ],
          rounds: [
            {
              question:
                "One person's age was typed as a WORD instead of a number. Click that row.",
              matches: [1],
              sql: "-- The rule you'll write today:\nage INT      -- whole numbers only, nothing else",
              explain:
                "INT means whole number. A column declared INT would simply refuse 'sixteen' — the mistake never gets into the table in the first place.",
            },
            {
              question: "Same problem, different column: find the grade_level that isn't a number.",
              matches: [3],
              sql: "grade_level INT",
              explain:
                "Every column gets its own type. Choosing the type is you deciding, in advance, what is allowed to exist in that column forever.",
            },
            {
              question:
                "joined_on is meant to hold dates. One row holds something a date column would reject — click it.",
              matches: [4],
              sql: "joined_on DATE      -- format: 2026-06-03",
              explain:
                "'last Tuesday' means nothing to a computer — you can't sort it or compare it. DATE forces a real, comparable date: YYYY-MM-DD.",
            },
            {
              question: "Now the good news: click every row a strict table would accept as-is.",
              matches: [0, 2, 5],
              sql: "-- These three fit every rule:\nname VARCHAR(50), age INT, grade_level INT, joined_on DATE",
              explain:
                "Three clean rows out of six. That is exactly what column types buy you — the junk never makes it in.",
            },
            {
              question:
                "Last one. The name column holds text. Click every row whose name is valid text.",
              matches: [0, 1, 2, 3, 4, 5],
              sql: "name VARCHAR(50)      -- text, up to 50 characters",
              explain:
                "All six — text columns are generous, which is why the other columns have to be strict. VARCHAR(50) is 'text, at most 50 characters', and you'll type it for real in a few minutes.",
            },
          ],
        },
        videos: [
          {
            title: "How to create a TABLE",
            youtubeId: "XfrgCK6BX5w",
            length: "8:10",
            practice:
              "Type along with the video, then on your own: run `USE school;` so MySQL knows which database you mean, and create a table called `students` with four columns — id INT, name VARCHAR(50), grade_level INT, favorite_subject VARCHAR(50). Run `DESCRIBE students;` and read the result: every rule you just wrote is listed back to you. If it came out wrong, `DROP TABLE students;` and build it again — nothing is precious yet.",
          },
          {
            title: "How to INSERT rows into a TABLE",
            youtubeId: "Cxilfg-M158",
            length: "5:54",
            practice:
              "Add three students, one INSERT at a time, checking with `SELECT * FROM students;` after each. Watch what the quotes do: text values get them, numbers don't. Three is enough for now — the quest below takes you to ten.",
          },
        ],
        activities: [
          {
            kind: "typing",
            id: "typing-table",
            title: "⌨️ Type the blueprint",
            intro:
              "CREATE TABLE has more moving parts than yesterday's commands — brackets, commas, types. Type them until your fingers stop hesitating.",
            rounds: [
              {
                prompt: "Tell MySQL you want to work inside the school database.",
                template: "{USE} school;",
                explain:
                  "Without USE, MySQL asks 'no database selected'. It's the single most common Day 2 error.",
              },
              {
                prompt: "Start a table called students.",
                template: "CREATE {TABLE} students (",
                explain: "CREATE DATABASE made a container; CREATE TABLE makes the grid inside it.",
              },
              {
                prompt: "Declare a column called grade_level that holds whole numbers.",
                template: "grade_level {INT},",
                explain: "INT = whole number. The comma separates this column from the next one.",
              },
              {
                prompt: "Declare a column called name that holds text up to 50 characters.",
                template: "name {VARCHAR(50)},",
                explain:
                  "VARCHAR(50) is text with a maximum length. The 50 is your promise about how long a name can get.",
              },
              {
                prompt: "Ask MySQL to show you the shape of the students table.",
                template: "{DESCRIBE} students;",
                explain:
                  "DESCRIBE reads back every column and its type — your receipt for what you just built.",
              },
              {
                prompt: "From memory: switch to the school database.",
                template: "{USE school;}",
                explain: "Two words and a semicolon. Type it first thing, every session.",
              },
              {
                prompt: "From memory: describe the students table.",
                template: "{DESCRIBE students;}",
                explain: "Your go-to move whenever you can't remember what a column is called.",
              },
              {
                prompt: "From memory: delete the students table completely.",
                template: "{DROP TABLE students;}",
                explain:
                  "DROP TABLE is DROP DATABASE's smaller cousin — same permanence, smaller blast radius.",
              },
            ],
          },
          {
            kind: "sql-console",
            id: "mini-server-day2",
            title: "🖥️ Mini server: build a table, fill it, break it",
            intro:
              "The mini server is back — this time with the school database waiting on it. Build today's whole lesson here first: create the table, put people in it, then crash into the three INSERT errors on purpose. After this, doing it in Workbench on your real database will feel like the second lap.",
            setup: {
              databases: [{ name: "school" }],
            },
            tasks: [
              {
                goal: "Tell the server you're working inside the school database.",
                solution: "USE school;",
                hint: "USE school; — the line that prevents 'no database selected'.",
                explain:
                  "Database changed. Skip this line and every table command answers 'Error 1046: no database selected' — the most common Day 2 error, now impossible for you.",
              },
              {
                goal: "Build the students table with four columns: id (whole numbers), name (text up to 50), grade_level (whole numbers), favorite_subject (text up to 50).",
                solution:
                  "CREATE TABLE students ( id INT, name VARCHAR(50), grade_level INT, favorite_subject VARCHAR(50) );",
                hint: "CREATE TABLE students ( id INT, name VARCHAR(50), grade_level INT, favorite_subject VARCHAR(50) ); — brackets around the list, commas between columns, none after the last.",
                explain:
                  "The grid exists. Every column type you just declared is a rule the server will now enforce for you — you'll see it do exactly that in a minute.",
              },
              {
                goal: "Ask the server to show you the table's shape.",
                solution: "DESCRIBE students;",
                hint: "DESCRIBE students;",
                explain:
                  "Four rows — one per column, with its type. This is your receipt for what you built. DESCRIBE shows the shape; SELECT shows the contents.",
              },
              {
                goal: "Add the first student: id 1, named Liza, grade 8, loves Math.",
                solution: "INSERT INTO students VALUES (1, 'Liza', 8, 'Math');",
                hint: "INSERT INTO students VALUES (1, 'Liza', 8, 'Math'); — quotes on the text, none on the numbers.",
                explain:
                  "1 row affected. Values fill the columns left to right in the order you declared them — id, name, grade_level, favorite_subject.",
              },
              {
                goal: "Add three more in ONE statement: id 2 Marco, grade 10, Science · id 3 Jen, grade 9, Math · id 4 Paolo, grade 7, English.",
                solution:
                  "INSERT INTO students VALUES (2, 'Marco', 10, 'Science'), (3, 'Jen', 9, 'Math'), (4, 'Paolo', 7, 'English');",
                hint: "One INSERT, three bracketed groups separated by commas: VALUES (…), (…), (…);",
                explain:
                  "3 rows affected — one statement, three people. Always read that number; it's how you catch a mistake the moment it happens.",
              },
              {
                goal: "Look at everyone in the table.",
                solution: "SELECT * FROM students;",
                explain:
                  "Four rows, exactly as you typed them. Tomorrow this command becomes a question-answering machine — today it's your mirror.",
              },
              {
                goal: "Now break it. Run an INSERT for id 5, 'Kristine', 9 — but LEAVE OUT the favorite subject, so only three values.",
                solution: "INSERT INTO students VALUES (5, 'Kristine', 9);",
                explain:
                  "Error 1136: column count doesn't match value count. Four columns means four values, every time. When you see this one, count your commas.",
              },
              {
                goal: "Break it again: add id 5, Ramon, grade 9, 'PE' — but type Ramon WITHOUT quotes.",
                solution: "INSERT INTO students VALUES (5, Ramon, 9, 'PE');",
                explain:
                  "Error 1054: unknown column 'Ramon'. Without quotes, MySQL thinks Ramon is the NAME of a column. This message will save you an hour this week — unquoted text is almost always the cause.",
              },
              {
                goal: "One more: add id 5, 'Ana', grade 'nine' (the word, in quotes), 'Math' — and watch the column type do its job.",
                solution: "INSERT INTO students VALUES (5, 'Ana', 'nine', 'Math');",
                explain:
                  "Error 1366: incorrect integer value 'nine' for grade_level. This is your warm-up game, for real — the INT rule you wrote in CREATE TABLE just refused bad data at the door.",
              },
              {
                goal: "Prove the junk stayed out: show everyone. There should still be exactly four students.",
                solution: "SELECT * FROM students;",
                explain:
                  "Four rows — none of the three broken INSERTs got in. That's the whole point of column rules: mistakes bounce off instead of sneaking in.",
              },
            ],
          },
          {
            kind: "quest",
            id: "build-students",
            title: "🏗️ Quest: build the students table",
            intro:
              "Yesterday you made an empty container. Today you build the actual grid inside it — and every column you declare is a rule you're setting for the rest of the week.",
            missions: [
              {
                task: "Open Workbench and run this first. It tells MySQL which database everything after it belongs to:",
                code: "USE school;",
                check: {
                  question: "What happens if you forget USE and run CREATE TABLE straight away?",
                  choices: [
                    "Error 1046: no database selected",
                    "MySQL picks a database at random",
                    "The table is created in every database",
                  ],
                  answer: 0,
                  explain:
                    "MySQL refuses to guess. When you see 'no database selected', the fix is always the same: run USE school; first.",
                },
              },
              {
                task: "Now build the table. Type it out rather than pasting — the brackets and commas are the whole lesson:",
                code: "CREATE TABLE students (\n  id INT,\n  name VARCHAR(50),\n  grade_level INT,\n  favorite_subject VARCHAR(50)\n);",
                check: {
                  question: "Why does name get VARCHAR(50) but grade_level get INT?",
                  choices: [
                    "Names are text; grade levels are numbers you'll want to compare and sort",
                    "VARCHAR is for long words and INT is for short ones",
                    "It's random — any type works anywhere",
                  ],
                  answer: 0,
                  explain:
                    "Type = what the column is allowed to hold AND what you can do with it. You can ask 'grade_level > 9' because it's a number. You couldn't if it were text.",
                },
              },
              {
                task: "Check your work — run this and read every line of the result:",
                code: "DESCRIBE students;",
                check: {
                  question: "How many rows does DESCRIBE show, and what is each one?",
                  choices: [
                    "Four — one per column you declared",
                    "Ten — one per student",
                    "One — the table itself",
                  ],
                  answer: 0,
                  explain:
                    "DESCRIBE shows the table's shape, not its contents. Four columns declared, four rows of description. Your table is still empty — that's next.",
                },
              },
              {
                task: "Prove the table is empty. Run this and look at the result panel:",
                code: "SELECT * FROM students;",
                check: {
                  question: "What comes back?",
                  choices: [
                    "The column headings, with no rows under them",
                    "An error — the table doesn't exist",
                    "Nothing at all appears",
                  ],
                  answer: 0,
                  explain:
                    "The table exists and has a shape; it just has no rows yet. An empty result is a real answer, not a failure — remember that feeling.",
                },
              },
              {
                task: "Last mission: turn in the blueprint.",
                input:
                  "Paste your CREATE TABLE statement and the four column names DESCRIBE listed back to you",
              },
            ],
          },
          {
            kind: "quest",
            id: "fill-students",
            title: "📥 Quest: fill it with people",
            intro:
              "An empty table is furniture. Ten rows is a database. Invent the students — family, friends, characters from a game or series you love — and put them in, one INSERT at a time.",
            missions: [
              {
                task: "Add the first student. Type it exactly, then run it:",
                code: "INSERT INTO students VALUES (1, 'Liza', 8, 'Math');",
                check: {
                  question: "Why is 'Liza' in quotes but 1 and 8 are not?",
                  choices: [
                    "Text values need quotes; numbers don't",
                    "Names are always capitalised so they need quotes",
                    "The quotes are optional decoration",
                  ],
                  answer: 0,
                  explain:
                    "Without quotes, MySQL reads Liza as the name of a column and fails. Quotes are how you say 'this is a value, not a name'.",
                },
              },
              {
                task: "Add two more the same way — change the id each time — then check your work:",
                code: "SELECT * FROM students;",
                check: {
                  question: "The values you typed appear in the same order as…",
                  choices: [
                    "The columns you declared in CREATE TABLE",
                    "Alphabetical order",
                    "Whatever order MySQL feels like",
                  ],
                  answer: 0,
                  explain:
                    "VALUES fills the columns left to right, in the order you declared them. Swap two around and you get a name in the grade_level column — or an error, if you're lucky.",
                },
              },
              {
                task: "Now speed up. One INSERT can carry many rows — separate them with commas:",
                code: "INSERT INTO students VALUES\n  (4, 'Marco', 10, 'Science'),\n  (5, 'Jen', 9, 'Math'),\n  (6, 'Paolo', 7, 'English');",
                check: {
                  question: "How many rows did that one statement add?",
                  choices: ["Three", "One", "Six — two per line"],
                  answer: 0,
                  explain:
                    "One statement, three rows. The Output panel tells you exactly: '3 row(s) affected'. Read that number — it's how you catch a mistake early.",
                },
              },
              {
                task: "Keep going until you have at least 10 students in the table. Make them yours: the more real they are to you, the more interesting tomorrow's questions get. Check the count as you go with SELECT * FROM students;",
                check: {
                  question: "Two students have the same name. Does MySQL mind?",
                  choices: [
                    "No — rows can repeat values; nothing stops it yet",
                    "Yes — it refuses duplicate names",
                    "It renames the second one automatically",
                  ],
                  answer: 0,
                  explain:
                    "Nothing in your table says 'names must be unique' — you never wrote that rule. Rules like that exist (you'll meet them in a later week), but a column only enforces what you declared.",
                },
              },
              {
                task: "Final mission: turn in your people.",
                input:
                  "Paste your INSERT statements and the number of rows you ended up with",
              },
            ],
          },
          {
            kind: "order",
            id: "order-recipe",
            title: "🧩 Puzzle: the recipe, in order",
            intro:
              "A .sql file is a recipe: run it top to bottom on an empty server and it rebuilds everything. But recipes only work in order — you can't fill a table that doesn't exist yet. Assemble each build so it runs without a single error.",
            rounds: [
              {
                prompt:
                  "A whole morning's work, top to bottom — each line needs the one before it.",
                lines: [
                  "CREATE DATABASE school;",
                  "USE school;",
                  "CREATE TABLE students ( id INT, name VARCHAR(50) );",
                  "INSERT INTO students VALUES (1, 'Liza');",
                  "SELECT * FROM students;",
                ],
                explain:
                  "Database before USE, USE before table, table before rows, rows before questions. Every line depends on the one above — that's why order is half of SQL.",
              },
              {
                prompt:
                  "Assemble one CREATE TABLE statement: the columns go id first, then name, then age.",
                lines: [
                  "CREATE TABLE pets (",
                  "  id INT,",
                  "  name VARCHAR(30),",
                  "  age INT",
                  ");",
                ],
                explain:
                  "Opening line, columns with commas BETWEEN them, and no comma after the last column — then the closing bracket and semicolon. A trailing comma is a syntax error near ')'.",
              },
              {
                prompt:
                  "A returning session: pick the database, check the table's shape, add Marco, then look at the result.",
                lines: [
                  "USE school;",
                  "DESCRIBE students;",
                  "INSERT INTO students VALUES (2, 'Marco');",
                  "SELECT * FROM students;",
                ],
                explain:
                  "USE first, every session — then the day's work. This is exactly the rhythm your fingers should learn: select, check, change, verify.",
              },
            ],
          },
          {
            kind: "quest",
            id: "cheat-sheet-day2",
            title: "📓 Quest: grow your cheat sheet",
            intro:
              "Yesterday's cheat sheet had three commands. Today it doubles — and today's entries are the ones you'll look up most.",
            missions: [
              {
                task: "Open your cheatsheet file and add a heading for Day 2. Then, from memory — no scrolling up — write the command that creates a table with columns.",
                check: {
                  question: "Did you remember the round brackets and the commas between columns?",
                  choices: [
                    "Checked and fixed — brackets around the column list, commas between columns",
                    "Brackets aren't needed",
                    "Commas go after the last column too",
                  ],
                  answer: 0,
                  explain:
                    "Brackets wrap the whole column list; commas go BETWEEN columns, never after the last one. A trailing comma is a syntax error near ')'.",
                },
              },
              {
                task: "Add these four from memory too: use a database, describe a table, insert a row, show all rows. Then check each one against your Workbench history and fix what you got wrong.",
                check: {
                  question: "Which pair is the easiest to mix up?",
                  choices: [
                    "DESCRIBE students (the shape) and SELECT * FROM students (the contents)",
                    "USE and CREATE",
                    "INSERT and DROP",
                  ],
                  answer: 0,
                  explain:
                    "One shows the columns, the other shows the rows. Write that difference in your own words next to them — you'll thank yourself in week 3.",
                },
              },
              {
                task: "Add a section at the bottom called 'errors I've met' and put today's three in it, each with the fix in your own words.",
                input:
                  "Paste your Day 2 cheat-sheet section — commands, what they do, and your errors list",
              },
            ],
          },
          {
            kind: "quest",
            id: "real-lab",
            title: "🛠️ Real lab: your database, for keeps",
            intro:
              "The mini server forgets; your server doesn't. Before the boss, make sure today's work exists where it counts — a real table with YOUR ten people on YOUR machine, and a file that's growing.",
            missions: [
              {
                task: "In your real Workbench: run DESCRIBE students; and SELECT * FROM students; — confirm the table has your four columns and at least 10 rows of people you invented.",
                check: {
                  question: "Fewer than 10 rows show up. What's the move?",
                  choices: [
                    "INSERT more students now — the quests above showed you exactly how",
                    "The count is close enough",
                    "Restart Workbench until more appear",
                  ],
                  answer: 0,
                  explain:
                    "Data doesn't appear on its own — if it's missing, you add it. Ten real rows is what makes tomorrow's filtering interesting.",
                },
              },
              {
                task: "Open your week1.sql and add a '-- Day 2' section: your CREATE TABLE and every INSERT, copied from your Workbench history.",
                check: {
                  question: "Someone runs your file top to bottom on an empty server. What must come before the INSERTs?",
                  choices: [
                    "CREATE DATABASE, USE, and CREATE TABLE — in that order",
                    "Nothing — INSERTs work anywhere",
                    "Only a comment",
                  ],
                  answer: 0,
                  explain:
                    "You just played this as a puzzle — now your real file follows the same recipe. A file that runs top to bottom is a file that can rebuild your week.",
                },
              },
              {
                task: "Final check: count your rows in the SELECT result and look at the row count in the result grid's corner — they should agree with what your file would create.",
                input:
                  "Paste your Day 2 section of week1.sql (CREATE TABLE + INSERTs) and write the number of rows your real table holds",
              },
            ],
          },
        ],
        game: {
          kind: "boss-battle",
          id: "boss-schema-serpent",
          title: "⚔️ Boss battle: The Schema Serpent",
          intro:
            "The Schema Serpent coils around your new table and hisses questions about its shape. Every answer is something you did with your own hands today.",
          boss: { name: "the Schema Serpent", emoji: "🐍" },
          questions: [
            {
              prompt: "What's the difference between a database and a table?",
              choices: [
                "A database is a named container; a table is one grid of rows and columns inside it",
                "They're two words for the same thing",
                "A table holds databases",
              ],
              answer: 0,
              explain:
                "school is the database. students is one table inside it. One database can hold many tables — you'll add more in later weeks.",
            },
            {
              prompt: "You run CREATE TABLE without running USE school; first. What happens?",
              choices: [
                "Error — no database selected",
                "The table goes into a default database",
                "It works, but the table is invisible",
              ],
              answer: 0,
              explain:
                "MySQL won't guess which database you mean. USE school; is the first thing you type in every session.",
            },
            {
              prompt: "What does VARCHAR(50) mean?",
              choices: [
                "Text, up to 50 characters long",
                "Exactly 50 characters, padded with spaces",
                "A number no bigger than 50",
              ],
              answer: 0,
              explain:
                "VAR is for 'varying' — short names take less space, and 50 is the ceiling you chose.",
            },
            {
              prompt: "Which one belongs in an INT column?",
              code: "A) 'nine'\nB) 9\nC) 'Grade 9'",
              choices: ["A", "B", "C"],
              answer: 1,
              explain:
                "Only a bare number. The other two are text — MySQL rejects them with 'incorrect integer value', exactly as you saw on the mini server.",
            },
            {
              prompt: "Spot the broken INSERT.",
              code: "A) INSERT INTO students VALUES (1, 'Liza', 8, 'Math');\nB) INSERT INTO students VALUES (2, Marco, 10, 'Science');",
              choices: ["A is broken", "B is broken", "Both work"],
              answer: 1,
              explain:
                "Marco has no quotes, so MySQL hunts for a column named Marco and reports 'unknown column'. Text always gets quotes.",
            },
            {
              prompt: "Your table has 4 columns. You INSERT 3 values. MySQL…",
              choices: [
                "Leaves the last column blank",
                "Refuses — column count doesn't match value count",
                "Shifts everything one column left",
              ],
              answer: 1,
              explain:
                "Four columns, four values, every time. The error names the problem precisely — count your commas.",
            },
            {
              prompt: "DESCRIBE students; shows you…",
              choices: [
                "The columns and their types — the table's shape",
                "Every student in the table",
                "How much disk space the table uses",
              ],
              answer: 0,
              explain:
                "Shape, not contents. SELECT * FROM students; is the one that shows the people.",
            },
            {
              prompt: "You INSERT one statement with three rows in it. The Output panel says…",
              code: "INSERT INTO students VALUES\n  (4, 'Marco', 10, 'Science'),\n  (5, 'Jen', 9, 'Math'),\n  (6, 'Paolo', 7, 'English');",
              choices: ["3 row(s) affected", "1 row(s) affected", "An error — one row per INSERT"],
              answer: 0,
              explain:
                "Commas between bracketed groups let one statement carry many rows. Always read the affected count — it's your early warning system.",
            },
            {
              prompt: "Two students in your table have exactly the same name. MySQL…",
              choices: [
                "Refuses the second one",
                "Accepts it — you never declared that names must be unique",
                "Renames it automatically",
              ],
              answer: 1,
              explain:
                "A column enforces only what you declared. Uniqueness is a rule you can add later; right now nothing is stopping duplicates.",
            },
            {
              prompt: "What does DROP TABLE students; do?",
              choices: [
                "Empties the table but keeps its shape",
                "Deletes the table and everything in it, permanently",
                "Hides it until you refresh",
              ],
              answer: 1,
              explain:
                "Shape and contents, both gone. Useful while you're still experimenting on Day 2 — much less funny on Day 4.",
            },
            {
              prompt: "You typed the values in the wrong order: name where grade_level goes. Best case?",
              choices: [
                "An error, because a word can't fit in an INT column",
                "MySQL sorts it out from the column names",
                "It silently works and nobody notices",
              ],
              answer: 0,
              explain:
                "The error IS the best case — the type caught it. The bad case is two INT columns swapped, where everything 'works' and the data is quietly wrong.",
            },
            {
              prompt: "Run these two in order. What does the second one show?",
              code: "INSERT INTO students VALUES (20, 'Ana', 9, 'Math');\nSELECT * FROM students;",
              choices: [
                "Every student including Ana",
                "Only Ana",
                "An error — you can't SELECT right after an INSERT",
              ],
              answer: 0,
              explain:
                "SELECT * always returns everything currently in the table. Statements run in order, each one seeing what the last one left behind.",
            },
          ],
        },
        practice:
          "Exit ticket — type three things into the turn-in box below: (1) what a column TYPE is, in your own words, and why the table is fussy about it; (2) the error you hit most today and what fixed it; (3) one question you still have. Then paste in everything you typed today — and double-check the Day 2 section of your `week1.sql` from the lab has all of it.",
      },
      {
        day: "Day 3",
        focus: "Ask your table questions with SELECT and WHERE",
        warmupGame: {
          kind: "row-hunt",
          id: "warmup-day3",
          title: "🕹️ Warm-up game: you are the WHERE clause",
          intro:
            "Day 1 you did this with easy questions. Today the questions bite back — negatives, ranges, two conditions at once, and one question nobody in the table answers. Click the rows that match, then run. In half an hour MySQL will be doing this for you, and you'll recognise every single move.",
          tableName: "students",
          columns: ["name", "grade_level", "favorite_subject", "hometown"],
          rows: [
            ["Liza", "8", "Math", "Cebu"],
            ["Marco", "10", "Science", "Davao"],
            ["Jen", "9", "Math", "Cebu"],
            ["Paolo", "7", "English", "Iloilo"],
            ["Kristine", "10", "Science", "Cebu"],
            ["Ramon", "9", "PE", "Davao"],
            ["Ana", "9", "Math", "Iloilo"],
          ],
          rounds: [
            {
              question: "Everyone in grade 9.",
              matches: [2, 5, 6],
              sql: "SELECT * FROM students\nWHERE grade_level = 9;",
              explain:
                "One condition, three survivors. Notice 9 has no quotes — it's a number, not text.",
            },
            {
              question: "Everyone whose favorite subject is NOT Math.",
              matches: [1, 3, 4, 5],
              sql: "SELECT * FROM students\nWHERE favorite_subject != 'Math';",
              explain:
                "!= means 'not equal to'. NOT flips a condition inside out — the rows that used to be kept are the ones you now throw away.",
            },
            {
              question: "Everyone in grade 9 or above.",
              matches: [1, 2, 4, 5, 6],
              sql: "SELECT * FROM students\nWHERE grade_level >= 9;",
              explain:
                ">= is 'at least'. This only works because grade_level is a number — you couldn't ask it of a text column.",
            },
            {
              question: "Grade 9 AND loves Math.",
              matches: [2, 6],
              sql: "SELECT * FROM students\nWHERE grade_level = 9 AND favorite_subject = 'Math';",
              explain:
                "AND narrows: a row must pass BOTH tests. Every AND you add can only shrink the result, never grow it.",
            },
            {
              question: "From Cebu OR from Davao.",
              matches: [0, 1, 2, 4, 5],
              sql: "SELECT * FROM students\nWHERE hometown = 'Cebu' OR hometown = 'Davao';",
              explain:
                "OR widens: pass either test and you're in. Note you have to name the column twice — 'hometown = Cebu OR Davao' is not a thing.",
            },
            {
              question:
                "In grade 10 AND from Iloilo. Careful — if nobody matches, select nothing and run anyway.",
              matches: [],
              sql: "SELECT * FROM students\nWHERE grade_level = 10 AND hometown = 'Iloilo';",
              explain:
                "Zero rows is a real, correct answer — not an error and not a bug. When a query comes back empty, the first question is 'is that true?', not 'what did I break?'",
            },
            {
              question: "Last one: no conditions at all — everybody.",
              matches: [0, 1, 2, 3, 4, 5, 6],
              sql: "SELECT * FROM students;",
              explain:
                "No WHERE, no filter, every row. That's why forgetting WHERE is dangerous later, when you start changing rows instead of just reading them.",
            },
          ],
        },
        videos: [
          {
            title: "How to SELECT data from a TABLE",
            youtubeId: "kUDznItqKbI",
            length: "5:01",
            practice:
              "Three queries against YOUR students table, and predict the row count out loud before each run: (1) everyone, (2) only the name column for everyone, (3) everyone in one grade level. If a prediction was wrong, don't move on until you know why — that gap is the actual lesson.",
          },
          {
            title: "Logical operators (AND, OR, NOT)",
            youtubeId: "lScJW5Qz_5k",
            length: "5:57",
            practice:
              "Write ONE query with two conditions joined by AND, run it, then change only the AND to OR and run it again. Say out loud why the second result is bigger. AND narrows, OR widens — feel the difference on your own data before you read another word.",
          },
        ],
        activities: [
          {
            kind: "typing",
            id: "typing-select",
            title: "⌨️ Type the questions",
            intro:
              "SELECT is the command you'll type more than any other in your life as a programmer. Get the shape into your fingers now.",
            rounds: [
              {
                prompt: "Show every column of every student.",
                template: "SELECT {*} FROM students;",
                explain: "The star means 'all columns'. FROM names the table you're asking about.",
              },
              {
                prompt: "Show only the name column.",
                template: "SELECT {name} FROM students;",
                explain:
                  "Naming columns instead of * is the habit of a real programmer — you ask for what you need, not everything.",
              },
              {
                prompt: "Show only students in grade 9.",
                template: "SELECT * FROM students {WHERE} grade_level = 9;",
                explain: "WHERE is the filter. Everything after it is a test each row must pass.",
              },
              {
                prompt: "Show only students whose favorite subject is Math.",
                template: "SELECT * FROM students WHERE favorite_subject = {'Math'};",
                explain:
                  "Text goes in quotes. Leave them off and MySQL hunts for a column called Math.",
              },
              {
                prompt: "Show students in grade 9 who also love Math.",
                template: "SELECT * FROM students WHERE grade_level = 9 {AND} favorite_subject = 'Math';",
                explain: "AND: both tests must pass. The result can only get smaller.",
              },
              {
                prompt: "Show students who are in grade 9 or in grade 10.",
                template: "SELECT * FROM students WHERE grade_level = 9 {OR} grade_level = 10;",
                explain:
                  "OR: either test will do. And yes — you must repeat the column name on both sides.",
              },
              {
                prompt: "Show students whose favorite subject is anything except Math.",
                template: "SELECT * FROM students WHERE favorite_subject {!=} 'Math';",
                explain: "!= is 'not equal to'. NOT favorite_subject = 'Math' does the same job.",
              },
              {
                prompt: "From memory: every student in the table.",
                template: "{SELECT * FROM students;}",
                explain: "The most-typed line in this entire course. It should feel automatic now.",
              },
              {
                prompt: "From memory: everyone in grade 10.",
                template: "{SELECT * FROM students WHERE grade_level = 10;}",
                explain: "Command, table, filter. Every query you write this year is that shape.",
              },
              {
                prompt: "From memory: everyone from Cebu who is in grade 9.",
                template: "{SELECT * FROM students WHERE hometown = 'Cebu' AND grade_level = 9;}",
                explain:
                  "Quotes on the text, none on the number, AND in the middle, semicolon at the end. That's the whole skill.",
              },
            ],
          },
          {
            kind: "sql-console",
            id: "query-console",
            title: "🖥️ Mini server: ask real questions, get real answers",
            intro:
              "The mini server holds the class from your warm-up — same seven students, now as a real table. Every question you clicked through this morning, you now ASK in SQL and watch the server answer. Then hit the classic SELECT mistakes on purpose, so the real ones never slow you down.",
            setup: {
              databases: [
                {
                  name: "school",
                  tables: [
                    {
                      name: "students",
                      columns: [
                        { name: "id", type: "INT" },
                        { name: "name", type: "VARCHAR(50)" },
                        { name: "grade_level", type: "INT" },
                        { name: "favorite_subject", type: "VARCHAR(50)" },
                        { name: "hometown", type: "VARCHAR(50)" },
                      ],
                      rows: [
                        ["1", "Liza", "8", "Math", "Cebu"],
                        ["2", "Marco", "10", "Science", "Davao"],
                        ["3", "Jen", "9", "Math", "Cebu"],
                        ["4", "Paolo", "7", "English", "Iloilo"],
                        ["5", "Kristine", "10", "Science", "Cebu"],
                        ["6", "Ramon", "9", "PE", "Davao"],
                        ["7", "Ana", "9", "Math", "Iloilo"],
                      ],
                    },
                  ],
                },
              ],
              use: "school",
            },
            tasks: [
              {
                goal: "Show every student — all columns, all rows.",
                solution: "SELECT * FROM students;",
                hint: "SELECT * FROM students; — the star means all columns.",
                explain: "Seven rows — your baseline. Every filter you add should produce a count you can explain.",
              },
              {
                goal: "Show only the name column, for everyone.",
                solution: "SELECT name FROM students;",
                hint: "Put the column name where the star was.",
                explain:
                  "Still seven ROWS — you narrowed the columns, not the rows. The SELECT list picks columns; only WHERE picks rows.",
              },
              {
                goal: "Show everyone in grade 9.",
                solution: "SELECT * FROM students WHERE grade_level = 9;",
                hint: "Add WHERE grade_level = 9 after the table name.",
                explain: "Three survivors. Notice 9 has no quotes — it's a number, matching an INT column.",
              },
              {
                goal: "Show everyone whose favorite subject is NOT Math.",
                solution: "SELECT * FROM students WHERE favorite_subject != 'Math';",
                hint: "!= means 'not equal to'. The text needs quotes: != 'Math'.",
                explain: "Four rows — everyone the Math filter would have kept is now exactly who's missing.",
              },
              {
                goal: "Show the grade 9 students who love Math.",
                solution: "SELECT * FROM students WHERE grade_level = 9 AND favorite_subject = 'Math';",
                hint: "Two conditions joined with AND — both must pass.",
                explain: "Two rows. AND narrows: each extra condition can only shrink the result.",
              },
              {
                goal: "Show everyone from Cebu or from Davao.",
                solution: "SELECT * FROM students WHERE hometown = 'Cebu' OR hometown = 'Davao';",
                hint: "You must name the column TWICE: hometown = 'Cebu' OR hometown = 'Davao'.",
                explain:
                  "Five rows. OR widens — and yes, hometown appears on both sides. 'Cebu OR Davao' alone is not SQL, however right it sounds in English.",
              },
              {
                goal: "Just the names of the grade 10 students.",
                solution: "SELECT name FROM students WHERE grade_level = 10;",
                explain:
                  "Both filters in one query: SELECT narrowed the columns, WHERE narrowed the rows. That's the full shape of a real question.",
              },
              {
                goal: "Now break it: ask for everyone named Liza, but type Liza WITHOUT quotes — and read the red line.",
                solution: "SELECT * FROM students WHERE name = Liza;",
                explain:
                  "Error 1054: unknown column 'Liza' in 'where clause'. Same disease as yesterday's INSERT — unquoted text is read as a column name. One error message, two days, many hours saved.",
              },
              {
                goal: "Break it differently: filter on a column this table doesn't have — WHERE age = 15.",
                solution: "SELECT * FROM students WHERE age = 15;",
                explain:
                  "Unknown column again — but this time it's a genuinely wrong column name, not missing quotes. Same message, two causes: when you see it, DESCRIBE the table and check which one you did.",
              },
              {
                goal: "Last one: ask a question whose honest answer is nobody — show everyone in grade 12.",
                solution: "SELECT * FROM students WHERE grade_level = 12;",
                hint: "A normal WHERE query — just one that no row matches.",
                explain:
                  "Zero rows, no error, green circle. The query was perfectly valid; the answer is 'nobody'. Errors mean 'I don't understand you' — an empty result means 'I understand, and nothing matches'. Telling those apart is a real skill you now have.",
              },
            ],
          },
          {
            kind: "quest",
            id: "interrogate",
            title: "🎯 Quest: interrogate your table",
            intro:
              "Your table has been sitting there since yesterday holding its secrets. Time to make it talk — one question at a time, each one run for real in Workbench against your own students.",
            missions: [
              {
                task: "Start easy. Run this, then count the rows in the result panel:",
                code: "SELECT * FROM students;",
                check: {
                  question: "The bottom of the result panel tells you the row count. Why care?",
                  choices: [
                    "It's how you check a filtered query later — fewer rows means the filter did something",
                    "It's just decoration",
                    "It tells you how fast the query ran",
                  ],
                  answer: 0,
                  explain:
                    "Knowing the total is your baseline. Every WHERE you add should produce a number you can explain.",
                },
              },
              {
                task: "Now ask for less. Run a query that shows ONLY the name and favorite_subject columns of every student — separate the two column names with a comma.",
                check: {
                  question: "How many ROWS come back compared to SELECT *?",
                  choices: [
                    "The same number of rows — you asked for fewer columns, not fewer rows",
                    "Fewer rows",
                    "Two rows",
                  ],
                  answer: 0,
                  explain:
                    "Columns and rows are filtered by different things: the SELECT list picks columns, WHERE picks rows. Mixing those two up is the classic week-1 confusion.",
                },
              },
              {
                task: "Filter for real. Write a query for every student in ONE grade level of your choice. Before you press run, say the number of rows you expect out loud.",
                check: {
                  question: "Your prediction was off. What's the FIRST thing to check?",
                  choices: [
                    "Look at the actual rows — either your memory of the data was wrong, or the condition is",
                    "Reinstall MySQL",
                    "Delete the table and start again",
                  ],
                  answer: 0,
                  explain:
                    "A wrong prediction is information, not failure. Compare what came back with what you expected and the mistake shows itself.",
                },
              },
              {
                task: "Two conditions. Write one query using AND that answers a question with a genuinely small answer — a grade level and a favorite subject, for example. Then run the SAME query with OR instead.",
                check: {
                  question: "Why did OR return more rows than AND?",
                  choices: [
                    "AND needs both tests to pass; OR needs only one, so more rows qualify",
                    "OR searches more of the table",
                    "AND is broken on some versions of MySQL",
                  ],
                  answer: 0,
                  explain:
                    "AND narrows, OR widens. If you ever get more rows than you expected, check whether you meant AND.",
                },
              },
              {
                task: "A negative. Write a query for every student whose favorite subject is NOT your own favorite subject.",
                check: {
                  question: "Which of these does the same job as NOT favorite_subject = 'Math'?",
                  choices: [
                    "favorite_subject != 'Math'",
                    "favorite_subject = NOT 'Math'",
                    "favorite_subject <> = 'Math'",
                  ],
                  answer: 0,
                  explain:
                    "!= is the everyday way to write it. NOT works too — put it in front of the whole condition, not in the middle.",
                },
              },
              {
                task: "Final mission: ask something nobody answers. Write a query you're fairly sure returns ZERO rows, and run it.",
                input:
                  "Paste that query and say — in your own words — why an empty result is an answer and not an error",
              },
            ],
          },
          {
            kind: "answer-sheet",
            id: "answer-sheet",
            title: "📝 Answer sheet: ten questions about your data",
            intro:
              "Ten questions about YOUR students table — the one on your real server, full of people you invented. For each: write what you BELIEVE the answer is first, then write the query, run it in Workbench, and record what actually came back. The questions where your prediction misses are the ones teaching you something.",
            fields: [
              "My prediction — before running anything",
              "The SQL I ran in Workbench",
              "What actually came back",
            ],
            items: [
              { question: "How many students are in your table in total?" },
              { question: "How many students are in the HIGHEST grade level your table has?" },
              { question: "Who loves the same subject as you do?" },
              { question: "How many students are NOT in that subject?" },
              {
                question: "Which grade level has the most students?",
                note: "One query may not answer this yet — run one per grade level and compare, and note what you WISH you could ask. That wish has a name, and you'll meet it in a later week.",
              },
              { question: "Is there anyone in grade 12?" },
              {
                question: "How many students match TWO conditions of your choosing, joined with AND?",
              },
              { question: "How many students match EITHER of those two conditions (OR)?" },
              {
                question:
                  "Which student's row would most surprise someone who doesn't know your table?",
                note: "Write the query that shows just that row — and say why it's surprising.",
              },
              {
                question: "One question of YOUR own invention — write it, predict it, run it.",
                note: "Write your invented question in the prediction box along with your guess.",
              },
            ],
          },
          {
            kind: "quest",
            id: "cheat-sheet-day3",
            title: "📓 Quest: cheat sheet, day 3",
            intro:
              "Two days of commands are in your file already. Today's additions are the ones you'll use forever.",
            missions: [
              {
                task: "Add a Day 3 heading, then write from memory: select everything, select named columns, select with one condition, select with two conditions.",
                check: {
                  question: "In SELECT name, grade_level FROM students; what does the comma do?",
                  choices: [
                    "Separates the columns you're asking for",
                    "Separates two different queries",
                    "Nothing — it's optional",
                  ],
                  answer: 0,
                  explain:
                    "Commas separate items in a list — column names here, values in an INSERT. Same idea in both places.",
                },
              },
              {
                task: "Add a small comparison table to your file: = , != , > , < , >= , <= — and one plain-English example of each using your own data.",
                check: {
                  question: "Which of these works on a VARCHAR column?",
                  choices: [
                    "= and != always; > and < work but compare alphabetically, which is rarely what you want",
                    "None — text can't be compared at all",
                    "All of them, exactly as they work on numbers",
                  ],
                  answer: 0,
                  explain:
                    "Equality on text is everyday. Greater-than on text sorts A→Z, which surprises people — one more reason to give numbers a number type.",
                },
              },
              {
                task: "Add a line at the top of your errors section: 'zero rows is not an error'. Then write, in your own words, how you tell a broken query from a true-but-empty answer.",
                input:
                  "Paste your Day 3 cheat-sheet section, including your comparison table and the zero-rows note",
              },
            ],
          },
          {
            kind: "quest",
            id: "real-lab",
            title: "🛠️ Real lab: interrogate YOUR data, on record",
            intro:
              "The console's students were mine. Yours are waiting on your own server, and they know things about your life the console never will. Before the boss: real queries, real answers, on record in your file.",
            missions: [
              {
                task: "In your real Workbench, against YOUR students table: run your three favorite queries from today — at least one with AND or OR. Predict the row count out loud before each run.",
                check: {
                  question: "A prediction missed. What is that, honestly?",
                  choices: [
                    "The most useful thing that happened today — find out why before moving on",
                    "Bad luck",
                    "A reason to re-type the query until the number changes",
                  ],
                  answer: 0,
                  explain:
                    "A missed prediction means your mental picture and the data disagree — and one of them is wrong. Finding out which is the entire skill of debugging.",
                },
              },
              {
                task: "Add a '-- Day 3' section to week1.sql: every query you ran today, each with a comment line above it phrasing the question it answers.",
                check: {
                  question: "Which of these is the better comment?",
                  choices: [
                    "-- Which grade 9 students love Math?",
                    "-- select with where and and",
                    "-- query 3",
                  ],
                  answer: 0,
                  explain:
                    "A comment states the QUESTION, not the syntax — the SQL already shows the syntax. Friday-you reads the comments, not the code.",
                },
              },
              {
                task: "One more that can't come from any tutorial: write a NEW query, right now, that answers something you're actually curious about in your own data — and run it.",
                input:
                  "Paste your Day 3 section of week1.sql, and separately your new curiosity query with the answer it returned",
              },
            ],
          },
        ],
        game: {
          kind: "boss-battle",
          id: "boss-filter-phantom",
          title: "⚔️ Boss battle: The Filter Phantom",
          intro:
            "The Filter Phantom hides rows that should be visible and shows rows that shouldn't. Every question is one you can already answer — you ran all of them today.",
          boss: { name: "the Filter Phantom", emoji: "👻" },
          questions: [
            {
              prompt: "What does the WHERE clause decide?",
              choices: [
                "Which ROWS come back",
                "Which COLUMNS come back",
                "What order the results are in",
              ],
              answer: 0,
              explain:
                "WHERE picks rows; the list after SELECT picks columns. Two different filters doing two different jobs.",
            },
            {
              prompt: "Which query returns FEWER columns, not fewer rows?",
              code: "A) SELECT name FROM students;\nB) SELECT * FROM students WHERE grade_level = 9;",
              choices: ["A", "B", "Both do the same thing"],
              answer: 0,
              explain:
                "A narrows the columns and keeps every row. B keeps every column and narrows the rows.",
            },
            {
              prompt: "This query errors. Why?",
              code: "SELECT * FROM students WHERE name = Liza;",
              choices: [
                "Liza needs quotes — without them MySQL looks for a column called Liza",
                "You can't filter on a name column",
                "The table name is wrong",
              ],
              answer: 0,
              explain:
                "Unquoted text is read as an identifier. 'Unknown column Liza in where clause' is MySQL telling you exactly that.",
            },
            {
              prompt: "AND versus OR — which is true?",
              choices: [
                "AND can only shrink the result; OR can only grow it",
                "AND grows the result; OR shrinks it",
                "They return the same rows in a different order",
              ],
              answer: 0,
              explain:
                "Adding an AND means one more test to pass. Adding an OR means one more way to qualify.",
            },
            {
              prompt: "How many rows does this return, from your 10-student table?",
              code: "SELECT * FROM students WHERE grade_level = 9 AND grade_level = 10;",
              choices: ["Zero — no row can be both at once", "All of them", "The grade 9s and the grade 10s"],
              answer: 0,
              explain:
                "A classic trap: you meant OR. One column can only hold one value per row, so this AND asks for the impossible.",
            },
            {
              prompt: "A query returns zero rows and no error message. That means…",
              choices: [
                "It's broken — rewrite it",
                "It's a valid question and the honest answer is 'nobody'",
                "MySQL timed out",
              ],
              answer: 1,
              explain:
                "Errors mean 'I don't understand'. Zero rows means 'I understand, and nothing matches'. Very different problems.",
            },
            {
              prompt: "Which one finds everyone whose subject is anything except Math?",
              code: "A) WHERE favorite_subject = NOT 'Math'\nB) WHERE favorite_subject != 'Math'\nC) WHERE NOT favorite_subject",
              choices: ["A", "B", "C"],
              answer: 1,
              explain:
                "!= is 'not equal to'. NOT works as well, but in front of a whole condition: WHERE NOT favorite_subject = 'Math'.",
            },
            {
              prompt: "Why does 9 need no quotes while 'Math' does?",
              choices: [
                "grade_level is a number column and favorite_subject is a text column",
                "Short values don't need quotes",
                "Quotes are optional everywhere",
              ],
              answer: 0,
              explain:
                "This is the payoff from Day 2's column types. The type you chose decides how you write the value forever after.",
            },
            {
              prompt: "You want everyone from Cebu or Davao. Which is correct?",
              code: "A) WHERE hometown = 'Cebu' OR 'Davao'\nB) WHERE hometown = 'Cebu' OR hometown = 'Davao'",
              choices: ["A", "B", "Both work"],
              answer: 1,
              explain:
                "Each side of OR must be a complete test. A looks right in English and is wrong in SQL — one of the most common beginner bugs there is.",
            },
            {
              prompt: "What does >= mean?",
              choices: ["Greater than", "Greater than or equal to", "Not equal to"],
              answer: 1,
              explain:
                "grade_level >= 9 includes grade 9 itself. If you meant to exclude it, you wanted > on its own.",
            },
            {
              prompt: "Leaving WHERE off a SELECT gives you…",
              choices: ["Every row in the table", "An error", "One row"],
              answer: 0,
              explain:
                "No filter, no filtering. Harmless while you're reading — much less harmless when you start changing rows.",
            },
            {
              prompt: "What comes back here?",
              code: "SELECT name FROM students WHERE grade_level = 9;",
              choices: [
                "Just the names of the grade 9 students",
                "Every column of the grade 9 students",
                "Every student's name",
              ],
              answer: 0,
              explain:
                "Both filters at once: SELECT narrows to one column, WHERE narrows to the matching rows. That's the full shape of a query.",
            },
          ],
        },
        practice:
          "Exit ticket — type three things into the turn-in box below: (1) the difference between what SELECT picks and what WHERE picks, in your own words; (2) the query you're proudest of today and what it answers; (3) one question you still have. Your `week1.sql` already grew in the lab — those question-comments above each query are how Friday-you will understand Wednesday-you.",
      },
      {
        day: "Day 4",
        focus: "Sort your results, then make the table yours",
        warmupGame: {
          kind: "row-hunt",
          id: "warmup-day4",
          title: "🕹️ Warm-up game: first in line",
          intro:
            "Filtering asks WHICH rows. Sorting asks IN WHAT ORDER. Same table, completely different question. Each round names a sort — click the row that would land where the question says. Most rounds want exactly one row, so read carefully.",
          tableName: "scores",
          columns: ["player", "points", "level", "joined_on"],
          rows: [
            ["Liza", "820", "7", "2026-03-02"],
            ["Marco", "1450", "12", "2026-01-14"],
            ["Jen", "990", "9", "2026-05-21"],
            ["Paolo", "310", "3", "2026-02-08"],
            ["Kristine", "1450", "11", "2026-04-30"],
            ["Ramon", "670", "6", "2026-01-09"],
          ],
          rounds: [
            {
              question: "Sorted by points from lowest to highest — click the row that comes FIRST.",
              matches: [3],
              sql: "SELECT * FROM scores ORDER BY points;",
              explain:
                "Lowest first is the default: ORDER BY points and ORDER BY points ASC are the same thing. ASC is just you saying it out loud.",
            },
            {
              question: "Sorted by points from highest to lowest — click the row that comes LAST.",
              matches: [3],
              sql: "SELECT * FROM scores ORDER BY points DESC;",
              explain:
                "Flip the direction and the smallest moves from the top to the bottom. Same rows, same count — only the order changed.",
            },
            {
              question: "Sorted by player name A to Z — click the row that comes FIRST.",
              matches: [2],
              sql: "SELECT * FROM scores ORDER BY player;",
              explain:
                "Jen. Sorting works on text too, alphabetically — and it ignores points entirely. The column you sort by is the only one that matters.",
            },
            {
              question: "Same sort, Z to A this time — click the row that comes FIRST.",
              matches: [5],
              sql: "SELECT * FROM scores ORDER BY player DESC;",
              explain:
                "Ramon. DESC reverses a text sort exactly like it reverses a number sort — Z first instead of A.",
            },
            {
              question:
                "Two players are tied on points. Click BOTH of their rows.",
              matches: [1, 4],
              sql: "SELECT * FROM scores ORDER BY points DESC, level DESC;",
              explain:
                "When the first column ties, a second sort column breaks the tie — here Marco's level 12 puts him above Kristine's 11.",
            },
            {
              question: "Sorted by joined_on oldest first — click the row that comes FIRST.",
              matches: [5],
              sql: "SELECT * FROM scores ORDER BY joined_on;",
              explain:
                "Dates sort like numbers, which is exactly why 'last Tuesday' was rejected on Day 2. A proper DATE can be ordered; a sentence cannot.",
            },
            {
              question:
                "Last one, two steps: of the players at level 9 or above, click the top TWO by points.",
              matches: [1, 4],
              sql: "SELECT * FROM scores\nWHERE level >= 9\nORDER BY points DESC;",
              explain:
                "WHERE runs first and throws rows away; ORDER BY arranges whatever survived. Filter, then sort — always that order, in your head and in the query.",
            },
          ],
        },
        videos: [
          {
            title: "ORDER BY clause",
            youtubeId: "R-5F3BF8IeY",
            length: "2:37",
            practice:
              "Short video, so do all four straight away on your own table: sort by name A–Z, sort by name Z–A, sort by grade_level lowest first, sort by grade_level highest first. Then combine what you know — one query with a WHERE and an ORDER BY together — and notice that WHERE always comes before ORDER BY.",
          },
        ],
        activities: [
          {
            kind: "typing",
            id: "typing-order",
            title: "⌨️ Type the sorting spells",
            intro:
              "ORDER BY goes at the END of a query, after any WHERE. Type it enough times today and that word order stops being something you have to remember.",
            rounds: [
              {
                prompt: "Sort every student by name, A to Z.",
                template: "SELECT * FROM students {ORDER BY} name;",
                explain: "Two words. It always goes last, after everything else in the query.",
              },
              {
                prompt: "Sort every student by name, Z to A.",
                template: "SELECT * FROM students ORDER BY name {DESC};",
                explain: "DESC = descending = biggest or last first. Leave it off and you get ascending.",
              },
              {
                prompt: "Sort by grade level, lowest first, saying the direction out loud in the query.",
                template: "SELECT * FROM students ORDER BY grade_level {ASC};",
                explain:
                  "ASC is the default, so this is optional — but writing it makes your intent obvious to anyone reading.",
              },
              {
                prompt: "Sort by grade level, and break ties by name.",
                template: "SELECT * FROM students ORDER BY grade_level, {name};",
                explain:
                  "A comma adds a tiebreaker: same grade level, then alphabetical within it. You can chain as many as you like.",
              },
              {
                prompt: "Only the grade 9 students, sorted by name.",
                template: "SELECT * FROM students {WHERE} grade_level = 9 ORDER BY name;",
                explain:
                  "WHERE first, ORDER BY last. Swap them and it's a syntax error — SQL is strict about clause order.",
              },
              {
                prompt: "Add a new column called favorite_game to the students table.",
                template: "ALTER TABLE students {ADD COLUMN} favorite_game VARCHAR(50);",
                explain:
                  "ALTER TABLE changes the shape of a table that already has data in it — without deleting a single row.",
              },
              {
                prompt: "Set Liza's favorite_game, using her id to find her row.",
                template: "UPDATE students {SET} favorite_game = 'Mobile Legends' WHERE id = 1;",
                explain:
                  "UPDATE changes rows that already exist. The WHERE is what stops it changing ALL of them.",
              },
              {
                prompt: "From memory: sort every student from highest grade level to lowest.",
                template: "{SELECT * FROM students ORDER BY grade_level DESC;}",
                explain: "Query, then order. That's the whole shape.",
              },
              {
                prompt: "From memory: the grade 9 students, sorted by name A–Z.",
                template: "{SELECT * FROM students WHERE grade_level = 9 ORDER BY name;}",
                explain:
                  "Four days of learning in one line: pick the table, filter the rows, arrange the result.",
              },
            ],
          },
          {
            kind: "sql-console",
            id: "sort-update-console",
            title: "🖥️ Mini server: the leaderboard",
            intro:
              "The arcade leaderboard from your warm-up is now a live table. Sort it every way that matters, then do today's most delicate work — changing a table that already has data in it — with the same seatbelt Workbench will put on you, so nothing about the real thing surprises you.",
            setup: {
              databases: [
                {
                  name: "arcade",
                  tables: [
                    {
                      name: "scores",
                      columns: [
                        { name: "player", type: "VARCHAR(30)" },
                        { name: "points", type: "INT" },
                        { name: "level", type: "INT" },
                        { name: "joined_on", type: "DATE" },
                      ],
                      rows: [
                        ["Liza", "820", "7", "2026-03-02"],
                        ["Marco", "1450", "12", "2026-01-14"],
                        ["Jen", "990", "9", "2026-05-21"],
                        ["Paolo", "310", "3", "2026-02-08"],
                        ["Kristine", "1450", "11", "2026-04-30"],
                        ["Ramon", "670", "6", "2026-01-09"],
                      ],
                    },
                  ],
                },
              ],
              use: "arcade",
            },
            tasks: [
              {
                goal: "Show the whole leaderboard, lowest points first.",
                solution: "SELECT * FROM scores ORDER BY points;",
                hint: "ORDER BY points — ascending is the default.",
                explain: "Paolo's 310 at the top: lowest-first is what you get unless you say otherwise.",
              },
              {
                goal: "Flip it: highest points first — a proper leaderboard.",
                solution: "SELECT * FROM scores ORDER BY points DESC;",
                hint: "Add DESC to the end.",
                explain: "Same six rows, reversed. ORDER BY never changes WHICH rows — only their order.",
              },
              {
                goal: "Sort the players by name, A to Z.",
                solution: "SELECT * FROM scores ORDER BY player;",
                explain: "Jen first — text sorts alphabetically, and the column you sort by is the only one that matters.",
              },
              {
                goal: "Marco and Kristine are tied on points. Sort by points highest-first, breaking ties by the higher level.",
                solution: "SELECT * FROM scores ORDER BY points DESC, level DESC;",
                hint: "Two sort columns, separated by a comma — each with its own direction.",
                explain:
                  "Marco's level 12 edges out Kristine's 11. The second column only speaks when the first one ties — that's how every real leaderboard works.",
              },
              {
                goal: "Filter THEN sort: only players at level 9 or above, highest points first.",
                solution: "SELECT * FROM scores WHERE level >= 9 ORDER BY points DESC;",
                hint: "WHERE comes before ORDER BY — always.",
                explain:
                  "Three rows, ranked. WHERE throws rows away first; ORDER BY arranges the survivors. Filter, then sort — in your head and in the query.",
              },
              {
                goal: "The arcade is forming teams. Add a column called team (text, up to 20 characters) to the scores table.",
                solution: "ALTER TABLE scores ADD COLUMN team VARCHAR(20);",
                hint: "ALTER TABLE scores ADD COLUMN team VARCHAR(20);",
                explain:
                  "Every existing row survived, with NULL — 'nothing here yet' — in the new column. ALTER changes the shape around the data.",
              },
              {
                goal: "Try to put EVERYONE on team 'Alpha' in one go — an UPDATE with no WHERE — and let the seatbelt catch you.",
                solution: "UPDATE scores SET team = 'Alpha';",
                explain:
                  "Error 1175: safe update mode refused it. This is Workbench protecting you from rewriting every row in the table by accident. Remember this exact moment — it happens in the real Workbench today too.",
              },
              {
                goal: "Take the seatbelt off, deliberately.",
                solution: "SET SQL_SAFE_UPDATES = 0;",
                hint: "SET SQL_SAFE_UPDATES = 0;",
                explain:
                  "Off — for this session, because YOU decided. The rule from here on: never type UPDATE without deciding what the WHERE is first.",
              },
              {
                goal: "Now put ONLY Marco on team 'Alpha' — use his player name to find the row.",
                solution: "UPDATE scores SET team = 'Alpha' WHERE player = 'Marco';",
                hint: "UPDATE scores SET team = 'Alpha' WHERE player = 'Marco';",
                explain:
                  "1 row affected — exactly one. That number is your proof the WHERE did its job. '0 rows affected' would mean the WHERE matched nobody — no error, just a quiet miss.",
              },
              {
                goal: "Check your work: show the whole table and confirm only Marco has a team.",
                solution: "SELECT * FROM scores;",
                explain:
                  "Marco: Alpha. Everyone else: NULL. You just did the full Day 4 arc — sort, reshape, change — on a live table, safely. Now go do it to your own.",
              },
            ],
          },
          {
            kind: "quest",
            id: "sort-it",
            title: "🔀 Quest: sort your students every which way",
            intro:
              "Sorting looks trivial until you notice what it actually does: it turns a pile of rows into a ranking, a timeline, a leaderboard. Run each of these against your own table.",
            missions: [
              {
                task: "Run this and look at the top of the result:",
                code: "SELECT * FROM students ORDER BY name;",
                check: {
                  question: "Which student is at the top?",
                  choices: [
                    "The one whose name comes first alphabetically",
                    "The one you inserted first",
                    "The one with the lowest id",
                  ],
                  answer: 0,
                  explain:
                    "Insert order stops mattering the moment you ORDER BY. Without one, MySQL is free to hand rows back in any order it likes.",
                },
              },
              {
                task: "Now flip it. Add DESC to the end and run it again.",
                code: "SELECT * FROM students ORDER BY name DESC;",
                check: {
                  question: "How many rows came back this time?",
                  choices: [
                    "Exactly the same number — sorting rearranges, it never removes",
                    "Half as many",
                    "One",
                  ],
                  answer: 0,
                  explain:
                    "ORDER BY never changes WHICH rows you get, only their order. Only WHERE removes rows.",
                },
              },
              {
                task: "Sort by a number instead: run a query that lists your students from the highest grade level to the lowest.",
                check: {
                  question: "Sorting a number column and sorting a text column differ how?",
                  choices: [
                    "Numbers sort by value; text sorts alphabetically — so '10' can land before '9' if the column is text",
                    "They're identical",
                    "Text columns can't be sorted",
                  ],
                  answer: 0,
                  explain:
                    "This is Day 2 coming back to pay you. Because grade_level is INT, 10 correctly comes after 9 — as text it wouldn't.",
                },
              },
              {
                task: "Break a tie. Run a query sorted by grade_level with name as a second sort column (put a comma between them), and find two students in the same grade level.",
                check: {
                  question: "What does the second sort column do?",
                  choices: [
                    "Decides the order only among rows that tie on the first column",
                    "Sorts the whole table again from scratch",
                    "Nothing — only the first column counts",
                  ],
                  answer: 0,
                  explain:
                    "First column wins; the second only speaks when the first is silent. Real leaderboards work exactly this way.",
                },
              },
              {
                task: "Put it all together: write ONE query with a WHERE and an ORDER BY that answers a real question about your class — 'the grade 9 students, listed alphabetically', for instance.",
                check: {
                  question: "What happens if you put ORDER BY before WHERE?",
                  choices: [
                    "A syntax error — SQL clauses have a fixed order",
                    "It works but is slower",
                    "It sorts before filtering, giving a different answer",
                  ],
                  answer: 0,
                  explain:
                    "SELECT … FROM … WHERE … ORDER BY. Write it in that order every time and you'll never see this error.",
                },
              },
              {
                task: "Final mission: turn in your sorts.",
                input:
                  "Paste your four best sorting queries, including the one that combines WHERE and ORDER BY",
              },
            ],
          },
          {
            kind: "quest",
            id: "the-twist",
            title: "🧬 Quest: make the table yours",
            intro:
              "Everything so far could have been copied from a tutorial. This part can't. You're going to add a column nobody else in the world would have thought of, fill it with your own data, and ask it a question only your table can answer. Remember the table you designed on Day 1 — its extra columns are your best source of ideas.",
            missions: [
              {
                task: "Pick your column. Something real about the people in your table: favorite_game, allowance, jeepney_fare, hours_of_sleep, barangay, favorite_food. Then add it — this changes the table's shape without touching a single existing row:",
                code: "ALTER TABLE students ADD COLUMN favorite_game VARCHAR(50);",
                check: {
                  question: "Run SELECT * FROM students; — what's in your new column?",
                  choices: [
                    "NULL for every row — the column exists but holds nothing yet",
                    "Zero for every row",
                    "The rows were deleted and you start again",
                  ],
                  answer: 0,
                  explain:
                    "NULL means 'no value here'. Your ten rows survived intact — ALTER TABLE changed the shape around them.",
                },
              },
              {
                task: "Now fill it in for one student. Workbench will probably refuse this the first time — run it anyway and read what it says:",
                code: "UPDATE students SET favorite_game = 'Mobile Legends' WHERE id = 1;",
                check: {
                  question: "Workbench says you're in safe update mode. What is it protecting you from?",
                  choices: [
                    "An UPDATE with no proper WHERE, which would change every row at once",
                    "Editing a table someone else is using",
                    "Nothing — it's a bug",
                  ],
                  answer: 0,
                  explain:
                    "It's a seatbelt: UPDATE without a WHERE rewrites the entire table, and there's no undo. Workbench makes you take the seatbelt off deliberately.",
                },
              },
              {
                task: "Take the seatbelt off for this session, then run your UPDATE again. Fill in the column for every student, one UPDATE per row, changing the id each time:",
                code: "SET SQL_SAFE_UPDATES = 0;\nUPDATE students SET favorite_game = 'Minecraft' WHERE id = 2;",
                check: {
                  question: "What would UPDATE students SET favorite_game = 'Minecraft'; (no WHERE) do?",
                  choices: [
                    "Set EVERY student's favorite_game to Minecraft, with no way to undo it",
                    "Update only the first row",
                    "Error, always",
                  ],
                  answer: 0,
                  explain:
                    "Now you know why the seatbelt exists. From here on: never type UPDATE without deciding what the WHERE is first.",
                },
              },
              {
                task: "Check your work — run SELECT * FROM students; and confirm every row has a value in the new column. Any that are still NULL, go back and UPDATE them.",
                check: {
                  question: "One row is still NULL. What went wrong, most likely?",
                  choices: [
                    "That row's id didn't match any UPDATE you ran",
                    "The column is full",
                    "NULL can't be replaced",
                  ],
                  answer: 0,
                  explain:
                    "The WHERE found nothing, so nothing changed — and MySQL said '0 row(s) affected' rather than complaining. Read that number; it's the only warning you get.",
                },
              },
              {
                task: "Now the real work: think of a question about your new column that would genuinely interest someone. Not 'show me the column' — a question with a filter or a sort in it. 'Which grade 9 students play the same game?' 'Who spends the most on fare?'",
                check: {
                  question: "What makes a question worth asking a database?",
                  choices: [
                    "The answer isn't obvious by looking — you'd have to filter, compare, or sort to get it",
                    "It's about many rows",
                    "It uses a word you learned this week",
                  ],
                  answer: 0,
                  explain:
                    "If you can answer it by glancing at ten rows, a query is overkill. The point of SQL is questions you couldn't answer by looking — and your table will be much bigger one day.",
                },
              },
              {
                task: "Write the query that answers it — with the question itself written above it as a SQL comment, starting with two dashes:",
                code: "-- Which grade 9 students play Mobile Legends?\nSELECT name FROM students\nWHERE grade_level = 9 AND favorite_game = 'Mobile Legends';",
                check: {
                  question: "What does MySQL do with a line starting with -- ?",
                  choices: [
                    "Ignores it completely — comments are notes for humans",
                    "Prints it in the output",
                    "Treats it as a command",
                  ],
                  answer: 0,
                  explain:
                    "Invisible to MySQL, essential to you. A `.sql` file without comments is a pile of statements; with them it's a document that explains itself.",
                },
              },
              {
                task: "Final mission: turn in the part nobody could copy.",
                input:
                  "Paste your ALTER TABLE, one of your UPDATEs, your question as a comment, the query that answers it, and the answer it gave",
              },
            ],
          },
          {
            kind: "quest",
            id: "cheat-sheet-day4",
            title: "📓 Quest: cheat sheet, day 4",
            intro:
              "Tomorrow there's no new material — just you, your file, and a final boss. Today's cheat-sheet entries are what you'll lean on.",
            missions: [
              {
                task: "Add a Day 4 heading and write from memory: sort ascending, sort descending, sort by two columns, filter and sort in one query.",
                check: {
                  question: "Where does ORDER BY go in a query?",
                  choices: [
                    "Last — after FROM and after any WHERE",
                    "First, before SELECT",
                    "Anywhere you like",
                  ],
                  answer: 0,
                  explain:
                    "SELECT … FROM … WHERE … ORDER BY. Write that skeleton at the top of your cheat sheet and fill it in as the weeks go on.",
                },
              },
              {
                task: "Add today's two new shape-changing commands — add a column to an existing table, and change values in existing rows — with a warning next to the second one about what happens without a WHERE.",
                check: {
                  question: "Which of these is the dangerous one?",
                  choices: [
                    "UPDATE without WHERE — it rewrites every row, permanently",
                    "ALTER TABLE ADD COLUMN — it deletes the table",
                    "ORDER BY DESC — it reverses the stored data",
                  ],
                  answer: 0,
                  explain:
                    "ALTER adds safely and ORDER BY changes nothing at all on disk. UPDATE is the one that rewrites your data — and the WHERE is the whole safety system.",
                },
              },
              {
                task: "Last: scroll through your whole cheat sheet, Day 1 to Day 4, and read it end to end. Fix anything that's now wrong or unclear to you.",
                input:
                  "Paste your Day 4 section, plus the one entry from earlier in the week you had to correct",
              },
            ],
          },
          {
            kind: "quest",
            id: "real-lab",
            title: "🛠️ Real lab: your table, permanently yours",
            intro:
              "The twist you built today changed your real table forever — a column no tutorial has, holding facts only you know. Before the boss, verify it's all real and get it on record.",
            missions: [
              {
                task: "In your real Workbench: run SELECT * FROM students ORDER BY your invented column (DESC if that's more interesting). Every row should show a real value — no NULLs left.",
                check: {
                  question: "One row still shows NULL in your new column. What happened?",
                  choices: [
                    "No UPDATE ever matched that row — check '0 rows affected' didn't slip past you",
                    "NULL is permanent once it appears",
                    "The column is broken",
                  ],
                  answer: 0,
                  explain:
                    "A WHERE that matches nobody 'succeeds' with 0 rows affected — the quietest miss in SQL. The fix is an UPDATE whose WHERE actually finds that row.",
                },
              },
              {
                task: "Add a '-- Day 4' section to week1.sql: the ALTER TABLE, your UPDATEs, your sorting queries, and your twist question as a comment directly above the query that answers it.",
                check: {
                  question: "Where exactly does the twist question's comment belong?",
                  choices: [
                    "On the line directly above the query that answers it",
                    "At the very top of the file",
                    "After the query, as a footnote",
                  ],
                  answer: 0,
                  explain:
                    "Comment above, query below — the pair reads like question and answer. You assembled a file in exactly this shape in the puzzle; now yours matches.",
                },
              },
              {
                task: "Last: read your whole week1.sql top to bottom. Four days of work should now read like a story — setup, people, questions, your own twist.",
                input:
                  "Paste your Day 4 section of week1.sql, and the answer your twist query returned on your real data",
              },
            ],
          },
        ],
        game: {
          kind: "boss-battle",
          id: "boss-sorting-sphinx",
          title: "⚔️ Boss battle: The Sorting Sphinx",
          intro:
            "The Sphinx doesn't want your data — it wants it in the right order. Answer correctly and it lets you through to the final day.",
          boss: { name: "the Sorting Sphinx", emoji: "🦁" },
          questions: [
            {
              prompt: "What does ORDER BY change?",
              choices: [
                "The order rows come back in — never which rows, never how many",
                "Which rows come back",
                "The order the columns are stored on disk",
              ],
              answer: 0,
              explain:
                "WHERE decides which rows; ORDER BY arranges the survivors. Nothing on disk moves at all.",
            },
            {
              prompt: "What's the default direction of ORDER BY?",
              choices: ["Ascending — smallest or A first", "Descending", "Insert order"],
              answer: 0,
              explain: "ASC is the default; you only write it to make your intent obvious.",
            },
            {
              prompt: "Which query lists your highest grade levels first?",
              code: "A) SELECT * FROM students ORDER BY grade_level;\nB) SELECT * FROM students ORDER BY grade_level DESC;",
              choices: ["A", "B", "Both"],
              answer: 1,
              explain: "DESC flips it. Without it, the lowest grade level sits at the top.",
            },
            {
              prompt: "This errors. Why?",
              code: "SELECT * FROM students ORDER BY name WHERE grade_level = 9;",
              choices: [
                "Clause order is fixed: WHERE comes before ORDER BY",
                "You can't sort and filter in the same query",
                "name isn't sortable",
              ],
              answer: 0,
              explain: "SELECT … FROM … WHERE … ORDER BY. Always that order.",
            },
            {
              prompt: "What does the comma do here?",
              code: "SELECT * FROM students ORDER BY grade_level, name;",
              choices: [
                "name breaks ties among students in the same grade level",
                "It sorts by grade_level, then re-sorts everything by name",
                "It's a syntax error",
              ],
              answer: 0,
              explain:
                "The second column only speaks when the first one ties. That's how leaderboards and class lists are built.",
            },
            {
              prompt: "Your grade_level column is INT. Sorted ascending, where does 10 land?",
              choices: [
                "After 9 — numbers sort by value",
                "Before 9 — '10' starts with a 1",
                "At the very top",
              ],
              answer: 0,
              explain:
                "As text, '10' would come before '9'. As INT it sorts by value. Day 2's type choice is still paying you back.",
            },
            {
              prompt: "What does this do to a table that already has ten rows in it?",
              code: "ALTER TABLE students ADD COLUMN favorite_game VARCHAR(50);",
              choices: [
                "Adds an empty column; all ten rows survive with NULL in it",
                "Deletes the rows and starts over",
                "Fails — you can't change a table with data in it",
              ],
              answer: 0,
              explain:
                "The shape changes around the data. NULL just means 'nothing here yet' — that's what your UPDATEs were for.",
            },
            {
              prompt: "What does NULL mean in a column?",
              choices: [
                "No value at all — not zero, not an empty word",
                "The number zero",
                "An error in that row",
              ],
              answer: 0,
              explain:
                "Zero is a value; an empty text is a value; NULL is the absence of one. The difference matters more and more as you go on.",
            },
            {
              prompt: "You run this. What happens?",
              code: "UPDATE students SET favorite_game = 'Minecraft';",
              choices: [
                "Every single row's favorite_game becomes Minecraft, permanently",
                "Only the first row changes",
                "Nothing — UPDATE always needs a WHERE",
              ],
              answer: 0,
              explain:
                "No WHERE means no limit. This is exactly what Workbench's safe update mode exists to stop, and why you should decide the WHERE before you type the SET.",
            },
            {
              prompt: "Your UPDATE reports '0 row(s) affected'. What does that tell you?",
              choices: [
                "The WHERE matched nothing — check the id you typed",
                "The update worked",
                "The table is locked",
              ],
              answer: 0,
              explain:
                "No error, no change. The affected-row count is the only thing that would have told you — which is why you read it every time.",
            },
            {
              prompt: "What does MySQL do with this line?",
              code: "-- Which grade 9 students play Mobile Legends?",
              choices: [
                "Ignores it — it's a comment written for humans",
                "Runs it as a query",
                "Prints it above the result",
              ],
              answer: 0,
              explain:
                "Two dashes and a space start a comment. Your `week1.sql` should be full of them by tomorrow.",
            },
            {
              prompt: "In this query, which clause runs first — conceptually?",
              code: "SELECT name FROM students\nWHERE grade_level = 9\nORDER BY name;",
              choices: [
                "WHERE — rows are filtered first, then what survives gets sorted",
                "ORDER BY — everything is sorted, then filtered",
                "SELECT — the columns are chosen before anything else",
              ],
              answer: 0,
              explain:
                "Filter, then sort, then hand back the columns you asked for. Holding that order in your head is what makes complicated queries readable.",
            },
          ],
        },
        practice:
          "Exit ticket — type three things into the turn-in box below: (1) the difference between WHERE and ORDER BY, in your own words; (2) the column you invented and why you chose it; (3) one question you still have. Your `week1.sql` now holds four days of work. Tomorrow there's no new material: it's your file, a final boss, and proof that you can do this.",
      },
      {
        day: "Day 5",
        focus: "Prove it — assemble the week and face the final boss",
        warmupGame: {
          kind: "typing",
          id: "warmup-day5",
          title: "⌨️ Warm-up: the whole week, from memory",
          intro:
            "No video today, no new syntax — just proof. Twelve commands, one for everything you learned this week, and most of them are one big blank. If you can type these without looking, week 1 is genuinely yours.",
          rounds: [
            {
              prompt: "Create a database called school.",
              template: "{CREATE DATABASE school;}",
              explain: "Day 1's very first spell. It should take you three seconds now.",
            },
            {
              prompt: "List every database on the server.",
              template: "{SHOW DATABASES;}",
              explain: "Plural, because it lists all of them.",
            },
            {
              prompt: "Work inside the school database.",
              template: "{USE school;}",
              explain: "The line that prevents 'no database selected' — type it first, every session.",
            },
            {
              prompt: "Start a table called students with an id column that holds whole numbers.",
              template: "CREATE TABLE students ( id {INT},",
              explain: "Brackets around the column list, commas between the columns.",
            },
            {
              prompt: "Declare a favorite_subject column holding text up to 50 characters.",
              template: "favorite_subject {VARCHAR(50)}",
              explain: "Text with a ceiling. No comma after the last column.",
            },
            {
              prompt: "Show the shape of the students table — its columns and their types.",
              template: "{DESCRIBE students;}",
              explain: "The shape, not the contents. SELECT * is the one that shows the people.",
            },
            {
              prompt: "Add one student: id 1, named Liza, grade 8, who loves Math.",
              template: "{INSERT INTO students VALUES (1, 'Liza', 8, 'Math');}",
              explain: "Quotes on the text, none on the numbers, values in column order.",
            },
            {
              prompt: "Show every student.",
              template: "{SELECT * FROM students;}",
              explain: "The most-typed line of the week.",
            },
            {
              prompt: "Show only the students in grade 9.",
              template: "{SELECT * FROM students WHERE grade_level = 9;}",
              explain: "WHERE picks rows. This is the query that made the table useful.",
            },
            {
              prompt: "Show the grade 9 students who love Math.",
              template: "{SELECT * FROM students WHERE grade_level = 9 AND favorite_subject = 'Math';}",
              explain: "AND narrows — both tests have to pass.",
            },
            {
              prompt: "Show every student, highest grade level first.",
              template: "{SELECT * FROM students ORDER BY grade_level DESC;}",
              explain: "ORDER BY goes last, DESC flips the direction.",
            },
            {
              prompt: "The whole week in one line: the grade 9 students, listed alphabetically by name.",
              template: "{SELECT * FROM students WHERE grade_level = 9 ORDER BY name;}",
              explain:
                "Table, filter, order. Five days ago you had never seen a database — now you're writing that from memory.",
            },
          ],
        },
        videos: [],
        activities: [
          {
            kind: "order",
            id: "order-week-file",
            title: "🧩 Puzzle: a week in the right order",
            intro:
              "Before you assemble your own week1.sql, assemble a model one. Each round is a build that only runs top to bottom in one order — the order the week itself taught you.",
            rounds: [
              {
                prompt: "One query, four clauses — put them in the only order MySQL accepts.",
                lines: ["SELECT name", "FROM students", "WHERE grade_level = 9", "ORDER BY name;"],
                explain:
                  "SELECT … FROM … WHERE … ORDER BY. The skeleton of every query you'll write this year — and the order your own file's queries must follow.",
              },
              {
                prompt:
                  "A complete week1.sql in miniature — the header comment first, and the question-comment directly above the query it explains.",
                lines: [
                  "-- week1.sql — my first database",
                  "CREATE DATABASE school;",
                  "USE school;",
                  "CREATE TABLE students ( id INT, name VARCHAR(50), grade_level INT );",
                  "INSERT INTO students VALUES (1, 'Liza', 8);",
                  "-- Who is in grade 8?",
                  "SELECT * FROM students WHERE grade_level = 8;",
                ],
                explain:
                  "Run on an empty server, this rebuilds the whole week: database, USE, table, rows, then questions — each with its why written above it. Your real file should read exactly like this, just bigger.",
              },
              {
                prompt:
                  "Thursday's work as one build: pick the database, add the column, fill it for Liza, then answer the question — with its comment directly above the query.",
                lines: [
                  "USE school;",
                  "ALTER TABLE students ADD COLUMN favorite_game VARCHAR(50);",
                  "UPDATE students SET favorite_game = 'Mobile Legends' WHERE id = 1;",
                  "-- Who plays Mobile Legends?",
                  "SELECT name FROM students WHERE favorite_game = 'Mobile Legends';",
                ],
                explain:
                  "You can't UPDATE a column before it exists, and you can't query an answer before the data is in. Dependencies decide the order — that's the deepest lesson of the week, hiding in a puzzle.",
              },
            ],
          },
          {
            kind: "quest",
            id: "teach-it-back",
            title: "🧠 Quest: teach it back",
            intro:
              "The strongest test of understanding is explaining something to someone who doesn't know it. Each mission asks you to explain one idea from this week in your OWN words — no copying from your cheat sheet, and no SQL keywords allowed unless you explain what they mean.",
            missions: [
              {
                task: "Explain what a database is to someone who has only ever used a notes app. Say it out loud first, then write it.",
                check: {
                  question: "Which explanation is actually better?",
                  choices: [
                    "'A place a program keeps information in rows and columns, with rules about what's allowed, so it can find things fast'",
                    "'A thing that stores data'",
                    "'MySQL'",
                  ],
                  answer: 0,
                  explain:
                    "The first one names the shape, the rules and the point. 'Stores data' is true of a photograph — a good explanation rules things out.",
                },
              },
              {
                task: "Explain the difference between a row and a column, using an example that is NOT students — your own life, a game, a shop.",
                check: {
                  question: "In a table of songs, 'duration' is…",
                  choices: [
                    "A column — every song has one",
                    "A row",
                    "A table",
                  ],
                  answer: 0,
                  explain:
                    "One song is a row; the things every song has are the columns. Once you can move the idea to a new example, you own it.",
                },
              },
              {
                task: "Explain why a column has a TYPE, and what would go wrong without one.",
                check: {
                  question: "Without types, what breaks first?",
                  choices: [
                    "Comparing and sorting — you can't ask 'more than 20' of a column that might hold the word 'twenty'",
                    "Nothing, really",
                    "The table gets bigger",
                  ],
                  answer: 0,
                  explain:
                    "Types are what make questions possible. That's why Day 2's fussiness was the foundation for Days 3 and 4.",
                },
              },
              {
                task: "Explain what WHERE does and what ORDER BY does, and why they are NOT the same kind of thing.",
                check: {
                  question: "Which pairing is right?",
                  choices: [
                    "WHERE decides which rows; ORDER BY decides their order",
                    "WHERE decides the order; ORDER BY decides which rows",
                    "Both remove rows",
                  ],
                  answer: 0,
                  explain:
                    "One removes, one arranges. Run them on a ten-row table and it's obvious; on a million-row table it's the difference between an answer and a mess.",
                },
              },
              {
                task: "Final mission — the real one. Explain what a database is, out loud, to an actual person at home, or to yourself in a voice recording. Then write down which part you stumbled on.",
                input:
                  "Paste your four explanations, and say which one was hardest to put into words",
              },
            ],
          },
          {
            kind: "quest",
            id: "assemble-file",
            title: "📦 Quest: assemble week1.sql",
            intro:
              "Everything you typed this week is scattered across four days of Workbench tabs. Today you turn it into one file that a stranger could read top to bottom and understand — because that stranger is you, three weeks from now.",
            missions: [
              {
                task: "Open your `week1.sql` file. If you never made one, open a new file now and save it with that exact name — your Workbench query history has everything you typed this week, and Day 1 to Day 4 turn-ins have the rest.",
                check: {
                  question: "Why keep your SQL in a file instead of just in Workbench tabs?",
                  choices: [
                    "A file survives crashes, reinstalls and new computers — and you can read it as a document",
                    "Workbench deletes tabs every night",
                    "MySQL requires it",
                  ],
                  answer: 0,
                  explain:
                    "Every programmer's real work lives in files. Tabs are where you experiment; the file is what you keep.",
                },
              },
              {
                task: "Put the file in order, top to bottom, the way the week happened: create the database, use it, create the table, insert your students, then your queries. Add a comment line at the very top with your name and the week.",
                check: {
                  question: "Why does the ORDER of statements in the file matter?",
                  choices: [
                    "Someone running the file from the top must create the database before the table, and the table before the rows",
                    "It doesn't — MySQL sorts them out",
                    "Alphabetical order is required",
                  ],
                  answer: 0,
                  explain:
                    "A `.sql` file is a recipe. Run it top to bottom on an empty server and it should rebuild everything you made this week, in the right order.",
                },
              },
              {
                task: "Now the comments. Above EVERY query, write one line starting with two dashes saying what question it answers — in plain English, as a question.",
                code: "-- How many students love Math?\nSELECT * FROM students WHERE favorite_subject = 'Math';",
                check: {
                  question: "A query with no comment above it is a problem because…",
                  choices: [
                    "In a month you'll know what it does but not why you wrote it",
                    "MySQL runs it slower",
                    "It won't run",
                  ],
                  answer: 0,
                  explain:
                    "The SQL says what. Only the comment says why. Writing the question first is also the best way to plan a query before you type it.",
                },
              },
              {
                task: "Make sure your Day 4 work is in there: the ALTER TABLE that added your own column, the UPDATEs that filled it, and your own invented question with its query.",
                check: {
                  question: "Which part of your file could NOT have been copied from a tutorial?",
                  choices: [
                    "The column you invented and the question you asked about it",
                    "The CREATE TABLE",
                    "The SELECT statements",
                  ],
                  answer: 0,
                  explain:
                    "That's exactly why it's required. Everything else proves you followed along; that part proves you can think in SQL.",
                },
              },
              {
                task: "Final mission: read the whole file out loud, top to bottom, saying what each line does. Fix anything you can't explain.",
                input:
                  "Paste the top of your file — the header comment through your CREATE TABLE — and say how many queries it now contains",
              },
            ],
          },
          {
            id: "self-audit",
            title: "🔍 Audit your own work",
            steps: [
              "Open `week1.sql` next to this page and go through the list below, marking each line ✅ or ❌ honestly.",
              "A database called `school` exists, and my file has the statement that creates it.",
              "A table called `students` exists with at least four columns, each with a sensible type — text columns are VARCHAR, number columns are INT.",
              "The table holds at least 10 rows of data I invented.",
              "My file has a query that returns every student.",
              "My file has a query that filters rows with WHERE.",
              "My file has a query that combines two conditions with AND, and one that uses OR.",
              "My file has a query that sorts results with ORDER BY.",
              "I added one column of my own invention with ALTER TABLE, and filled it in for every row.",
              "I wrote my own question as a comment, with the query that answers it underneath.",
              "Every query in the file has a comment above it saying what it answers.",
              "For every ❌, go and fix it now — you have the whole day and everything you need is in this week's four days.",
            ],
            tip: "Auditing your own work against a list is a real professional habit, not busywork. Finding your own gaps before anyone else does is the entire skill.",
            submit:
              "Paste the checklist with your ✅ / ❌ marks, and note what you had to go back and fix.",
          },
        ],
        game: {
          kind: "boss-battle",
          id: "boss-week-one-warden",
          title: "⚔️ Final boss: The Week One Warden",
          intro:
            "The Warden holds the gate to week 2 and asks about everything — Monday's install, Tuesday's types, Wednesday's filters, Thursday's sorts. There is nothing here you haven't already done with your own hands. Go and take the gate.",
          boss: { name: "the Week One Warden", emoji: "👑" },
          questions: [
            {
              prompt: "A server, a database, and a table — smallest to biggest?",
              choices: [
                "Table, database, server",
                "Server, database, table",
                "Database, table, server",
              ],
              answer: 0,
              explain:
                "One server holds many databases; one database holds many tables; one table holds many rows. Every week from here builds inside that nesting.",
            },
            {
              prompt: "You open Workbench on a new day. What's the first line you type?",
              choices: ["USE school;", "SHOW DATABASES;", "SELECT * FROM students;"],
              answer: 0,
              explain:
                "Without it, every command gets 'no database selected'. It's the seatbelt click of a MySQL session.",
            },
            {
              prompt: "Which column type would you choose for a phone number?",
              choices: [
                "VARCHAR — phone numbers have leading zeros and symbols, and you never do arithmetic on them",
                "INT — it's made of digits",
                "DATE",
              ],
              answer: 0,
              explain:
                "A great question to have opinions about. 'Made of digits' isn't the test — 'would I ever add two of them together?' is.",
            },
            {
              prompt: "Which statement adds ROWS to a table that already exists?",
              code: "A) CREATE TABLE\nB) INSERT INTO\nC) ALTER TABLE",
              choices: ["A", "B", "C"],
              answer: 1,
              explain:
                "CREATE makes the shape, INSERT adds rows, ALTER changes the shape afterwards. Three different jobs.",
            },
            {
              prompt: "Find the bug.",
              code: "INSERT INTO students VALUES (7, Kristine, 10, 'Science');",
              choices: [
                "Kristine needs quotes",
                "10 needs quotes",
                "There's no bug",
              ],
              answer: 0,
              explain:
                "Text always gets quotes; numbers never do. Unquoted, MySQL hunts for a column called Kristine.",
            },
            {
              prompt: "Which one returns FEWER ROWS than SELECT * FROM students;?",
              code: "A) SELECT name FROM students;\nB) SELECT * FROM students WHERE grade_level = 9;",
              choices: ["A", "B", "Both"],
              answer: 1,
              explain:
                "A narrows the columns and keeps every row. Only WHERE removes rows — the distinction you were tested on all Wednesday.",
            },
            {
              prompt: "How many rows can this return?",
              code: "SELECT * FROM students WHERE grade_level = 9 AND grade_level = 10;",
              choices: ["Zero — no row holds two values in one column", "All of them", "Half of them"],
              answer: 0,
              explain: "You meant OR. AND asks for both to be true at once, which no single row can manage.",
            },
            {
              prompt: "A query returns zero rows, with no error. What's your first move?",
              choices: [
                "Check whether 'nobody' is actually the true answer before assuming it's broken",
                "Rewrite the query from scratch",
                "Reinstall MySQL",
              ],
              answer: 0,
              explain:
                "Zero rows is an answer. Errors mean 'I don't understand you'; empty means 'I understand, and nothing matches'.",
            },
            {
              prompt: "Put these clauses in the only order MySQL accepts.",
              code: "ORDER BY name  ·  SELECT *  ·  WHERE grade_level = 9  ·  FROM students",
              choices: [
                "SELECT * FROM students WHERE grade_level = 9 ORDER BY name",
                "SELECT * WHERE grade_level = 9 FROM students ORDER BY name",
                "FROM students SELECT * ORDER BY name WHERE grade_level = 9",
              ],
              answer: 0,
              explain:
                "SELECT … FROM … WHERE … ORDER BY. That skeleton carries you through the rest of this course.",
            },
            {
              prompt: "ORDER BY grade_level DESC changes…",
              choices: [
                "Only the order of the result — the same rows come back",
                "Which rows come back",
                "How the rows are stored on disk",
              ],
              answer: 0,
              explain:
                "Sorting rearranges what you're handed. Nothing in the table itself moves.",
            },
            {
              prompt: "Which of these can you NOT undo?",
              code: "A) SELECT * FROM students;\nB) DROP DATABASE school;\nC) ORDER BY name DESC",
              choices: ["A", "B", "C"],
              answer: 1,
              explain:
                "Reading is always safe. DROP is permanent and there is no recycle bin — which is why you practised it on sandbox.",
            },
            {
              prompt: "Why does UPDATE need a WHERE?",
              choices: [
                "Without one it changes every row in the table, permanently",
                "It's just good style",
                "MySQL refuses to run UPDATE without it",
              ],
              answer: 0,
              explain:
                "Workbench's safe update mode blocks it by default precisely because the damage is silent and total.",
            },
            {
              prompt: "What did ALTER TABLE students ADD COLUMN … do to your ten rows?",
              choices: [
                "Left every row in place, with NULL in the new column until you filled it in",
                "Deleted them",
                "Duplicated them",
              ],
              answer: 0,
              explain:
                "The shape changed around the data. NULL is 'nothing here yet' — not zero, not empty text.",
            },
            {
              prompt: "What is a comment in a .sql file for?",
              code: "-- Which grade 9 students love Math?",
              choices: [
                "Explaining to a human — usually future you — why the query below exists",
                "Making MySQL run faster",
                "Naming the query so you can run it later",
              ],
              answer: 0,
              explain:
                "MySQL ignores it completely. It's the only part of the file that says WHY, which makes it the most valuable line in it.",
            },
            {
              prompt: "Last question. You've written a query, sorted it, and answered your own invented question. What do you actually know how to do now?",
              choices: [
                "Design a table, fill it with data, and ask it questions — the foundation of every app you'll ever build",
                "Nothing yet — this was just an introduction",
                "Only what the videos showed",
              ],
              answer: 0,
              explain:
                "That's not encouragement, it's a description. Storing data with rules, then querying it, is what sits behind every app on your phone. Week 2 builds straight on top of it.",
            },
          ],
        },
        practice:
          "Last three things. (1) Paste your complete `week1.sql` into the turn-in box below — every CREATE, INSERT, ALTER, UPDATE and SELECT, with the comment above each query. (2) Work through the self-check further down the page, answering each one out loud before revealing the answer. (3) Send the two-minute reflection — it's how you get a plan back for next week. Done early? The SQLBolt lessons in the reading track are the best extra practice there is, and they run right in your browser.",
      },
    ],
  },
  reading: [
    {
      label: "SQLBolt — Interactive lessons 1–4",
      url: "https://sqlbolt.com/",
      note: "Best starting point if videos aren't your thing. Short written lessons with a practice editor built into the page — you learn by doing, right in the browser, nothing to install.",
    },
    {
      label: "W3Schools — SQL Intro, Syntax, SELECT, WHERE",
      url: "https://www.w3schools.com/sql/sql_intro.asp",
      note: "Simple English, good as a reference to look things up while doing the activity.",
    },
    {
      label: "DB Fiddle (browser MySQL)",
      url: "https://www.db-fiddle.com/",
      note: "Fallback: if you can't get MySQL installed on your computer this week, do the whole activity here instead. Choose MySQL 8 in the top-left dropdown.",
    },
  ],
  activity: {
    title: "Build your first database",
    goal: "A database designed by you, filled with data, that can answer questions using SELECT.",
    steps: [
      "Install MySQL Community Server and MySQL Workbench. If installation fails after 30 minutes of trying, don't get stuck — switch to DB Fiddle (link in the reading track) and note it in your reflection.",
      "Create a database called `school` and a table called `students` with at least these columns: id, name, grade_level, favorite_subject.",
      "INSERT at least 10 students (invent them — family, friends, or characters they love).",
      "Write and run these queries: (1) all students, (2) all students in one grade level, (3) students matching TWO conditions at once using AND, (4) all students sorted with ORDER BY.",
      "Save all your SQL in one .sql file with a comment above each query saying what it does.",
    ],
    twist:
      "Add ONE extra column of your own invention to the table (anything — favorite_game, allowance, jeepney_fare...). Then write one query that answers a question about that column, and write the question itself as a SQL comment above the query. This part can't be copied from any tutorial — it has to come from you.",
    deliverables: [
      "Your complete `week1.sql` — every CREATE, INSERT, and SELECT you wrote, with a comment above each query — pasted into the turn-in box",
      "The self-check and the two-minute 'where are you at?' below",
    ],
  },
  selfCheck: [
    {
      question:
        "In your own words: what's the difference between a database and a spreadsheet like Excel?",
      answer:
        "Both store data in rows and columns, but a database is built for programs to use: it enforces rules about what data is allowed, handles huge amounts of data, lets many users/apps read and write at the same time safely, and you talk to it with a language (SQL) instead of clicking cells.",
    },
    {
      question: "What is a row in a table? What is a column?",
      answer:
        "A row is one record — one complete 'thing' (one student, one product). A column is one attribute that every row has (name, grade_level). The table is the grid of all rows sharing the same columns.",
    },
    {
      question: "What's the difference between SELECT * FROM students and SELECT name FROM students?",
      answer:
        "SELECT * returns every column of every row. SELECT name returns only the name column. In real programs you usually name the columns you need instead of using *.",
    },
    {
      question: "What does the WHERE clause do? What happens if you leave it out of a SELECT?",
      answer:
        "WHERE filters which rows come back — only rows matching the condition are included. Without WHERE, you get every row in the table.",
    },
    {
      question:
        "This query has a bug: SELECT * FROM students WHERE name = Maria — what's wrong and why?",
      answer:
        "Maria needs quotes: WHERE name = 'Maria'. Without quotes, SQL thinks Maria is a column name, not a text value, and throws an error. Text values always need quotes; numbers don't.",
    },
  ],
  status: "available",
};
