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
    "Create a database and a table, and INSERT rows into it",
    "Write SELECT queries that filter rows with WHERE and sort them with ORDER BY",
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
            id: "break-it",
            title: "💥 Quest: break it on purpose",
            intro:
              "Time to crash MySQL — on purpose. For each mission, predict what will happen, run the broken command in Workbench, and see if you were right. Error messages feel scary for about a week; after this quest, they're your friend.",
            missions: [
              {
                task: "Run this in Workbench (yes, the E is missing on purpose):",
                code: "CREAT DATABASE oops;",
                check: {
                  question: "What does MySQL complain about?",
                  choices: [
                    "A syntax error near 'CREAT' — the keyword is misspelled",
                    "The database oops already exists",
                    "Nothing — it works fine",
                  ],
                  answer: 0,
                  explain:
                    "MySQL only understands exact keywords. “Syntax error near X” almost always means a typo in or near X — read the error, it points at the spot.",
                },
              },
              {
                task: "Now run this — a command you already ran once today:",
                code: "CREATE DATABASE school;",
                check: {
                  question: "What happens this second time?",
                  choices: [
                    "An error: can't create database 'school' — it already exists",
                    "You get a second copy called school (2)",
                    "It silently does nothing",
                  ],
                  answer: 0,
                  explain:
                    "Database names are unique on a server. A different mistake gets a different error — MySQL is telling you exactly what's wrong.",
                },
              },
              {
                task: "One more. Run it, then read the error out loud, slowly:",
                code: "SHOW DATABASE;",
                check: {
                  question: "Why does this fail?",
                  choices: [
                    "The command is SHOW DATABASES — plural, with an S",
                    "You're only allowed to run it once",
                    "You must create a database first",
                  ],
                  answer: 0,
                  explain:
                    "It lists ALL the databases, so it's plural. You've now met the three most common beginner errors — and read every one like a pro.",
                },
              },
              {
                task: "Final mission: invent a broken command of your own. Predict its error out loud, then run it and compare.",
                input:
                  "Type your broken command, what you predicted, and what MySQL actually said",
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
                task: "Next to each command in your file, add one line in your own words about what it does and one thing that can go wrong — you met those errors yourself in the error quest.",
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
                "SQL keywords must be exact: CREATE DATABASE. You met A's error yourself in the error lab — “syntax error near CREAT”.",
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
        focus: "Create your students table and put data in it",
        videos: [
          {
            title: "How to create a TABLE",
            youtubeId: "XfrgCK6BX5w",
            length: "8:10",
            practice:
              "Create the `students` table with these columns: id, name, grade_level, favorite_subject. Then run `DESCRIBE students;` to check it matches what you intended.",
          },
          {
            title: "How to INSERT rows into a TABLE",
            youtubeId: "Cxilfg-M158",
            length: "5:54",
            practice:
              "INSERT at least 10 students — invent them: family, friends, or characters from a game or series you love. Typos will happen: read the error message slowly, it usually points at the exact spot.",
          },
        ],
        practice:
          "Before you finish: save everything you typed today into a file called `week1.sql`. You'll keep adding to it all week.",
      },
      {
        day: "Day 3",
        focus: "Ask your data questions with SELECT and WHERE",
        videos: [
          {
            title: "How to SELECT data from a TABLE",
            youtubeId: "kUDznItqKbI",
            length: "5:01",
            practice:
              "Write two queries: every student, then only the students in one grade level. Predict how many rows each returns BEFORE you press run.",
          },
          {
            title: "Logical operators (AND, OR, NOT)",
            youtubeId: "lScJW5Qz_5k",
            length: "5:57",
            practice:
              "Write one query that combines TWO conditions with AND — for example, a grade level and a favorite subject. Then change the AND to an OR and explain to yourself why the result changed.",
          },
        ],
        practice:
          "Before you finish: add today's queries to `week1.sql`, with a comment above each one saying what it answers.",
      },
      {
        day: "Day 4",
        focus: "Sort your results, then make the data yours (the twist)",
        videos: [
          {
            title: "ORDER BY clause",
            youtubeId: "R-5F3BF8IeY",
            length: "2:37",
            practice:
              "Sort your students two different ways — by name, then by grade level. Notice what ASC and DESC change.",
          },
        ],
        practice:
          "Now the twist: add ONE column of your own invention to the table, then write a query that answers a real question about it — with the question itself written as a comment above the query.",
      },
      {
        day: "Day 5",
        focus: "Wrap up — no new video today",
        videos: [],
        practice:
          "Finish anything left over, run through the self-check below, paste your finished `week1.sql` into the turn-in box, and send the reflection. Done early? Peek at the reading track's SQLBolt lessons for extra practice.",
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
