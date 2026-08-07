// unit1-week1 · Day 5 — Prove it — assemble the week and face the final boss
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day5: DayPlan = {
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
  practice: {
    intro: "Last three things.",
    steps: [
      "Paste your complete `week1.sql` into the turn-in box below — every CREATE, INSERT, ALTER, UPDATE and SELECT, with the comment above each query.",
      "Work through the self-check further down the page, answering each one out loud before revealing the answer.",
      "Send the two-minute reflection — it's how you get a plan back for next week.",
    ],
    note: "Done early? The SQLBolt lessons in the reading track are the best extra practice there is, and they run right in your browser.",
  },
};
