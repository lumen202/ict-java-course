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
      kind: "sql-console",
      id: "week-gauntlet",
      title: "🖥️ The whole week, on a live server",
      intro:
        "This server has nothing on it — even less than the one you started week 1 on. Rebuild everything, live, from the empty server up: the database, the table, every student, every kind of question you learned to ask. Nobody hands you a template past the first few tasks — the goal tells you what you need, and you write the statement.",
      tasks: [
        {
          goal:
            "The server here is completely empty — even emptier than the one you started week 1 on. Bring back the database everything else needs: school.",
          solution: "CREATE DATABASE school;",
          hint: "CREATE DATABASE school;",
          explain: "Day 1's very first spell, from an empty server, on your own.",
        },
        {
          goal:
            "You're on the server, but nothing you type will work yet — get inside school before anything else.",
          solution: "USE school;",
          hint: "USE school;",
          explain: "The line that prevents 'no database selected'. Every session starts here.",
        },
        {
          goal:
            "Build the students table from scratch: an id (whole number), a name (text up to 50 characters), a grade_level (whole number), and a favorite_subject (text up to 50 characters).",
          solution:
            "CREATE TABLE students ( id INT, name VARCHAR(50), grade_level INT, favorite_subject VARCHAR(50) );",
          hint: "Four columns, comma-separated, inside one set of brackets — two INT, two VARCHAR(50), no comma after the last one.",
          explain: "The exact shape you built Tuesday. This time nobody dictated the column list to you.",
        },
        {
          goal:
            "An empty table isn't much of a week. Add all seven of your students in ONE statement: Liza (1, grade 8, Math), Marco (2, grade 10, Science), Jen (3, grade 9, Math), Paolo (4, grade 7, English), Kristine (5, grade 10, Science), Ramon (6, grade 9, PE), Ana (7, grade 9, Math).",
          solution:
            "INSERT INTO students VALUES (1, 'Liza', 8, 'Math'), (2, 'Marco', 10, 'Science'), (3, 'Jen', 9, 'Math'), (4, 'Paolo', 7, 'English'), (5, 'Kristine', 10, 'Science'), (6, 'Ramon', 9, 'PE'), (7, 'Ana', 9, 'Math');",
          hint: "One INSERT, one VALUES, seven parenthesized rows separated by commas — column order in every one of them.",
          explain: "7 row(s) affected in a single statement. A comma between tuples does the work of seven INSERTs.",
        },
        {
          goal: "Prove it worked — pull every student back.",
          solution: "SELECT * FROM students;",
          explain: "Seven rows, exactly as typed. The most-typed line of the week, and you didn't need a hint for it.",
        },
        {
          goal: "Who actually loves Math?",
          solution: "SELECT * FROM students WHERE favorite_subject = 'Math';",
          explain: "Liza, Jen and Ana. WHERE picks rows — the query that made the table useful in the first place.",
        },
        {
          goal: "Is anyone in grade 9 AND grade 10 at the same time? Ask the server directly.",
          solution: "SELECT * FROM students WHERE grade_level = 9 AND grade_level = 10;",
          predict: {
            question: "How many rows come back?",
            choices: [
              "5 rows — every grade 9 and grade 10 student together",
              "An error — you can't compare the same column twice in one WHERE",
              "0 rows — no single row can hold two different grade_level values at once",
            ],
            answer: 2,
            explain:
              "AND demands both truths from the SAME row, and grade_level only ever holds one number — nobody can pass both tests at once.",
          },
          explain:
            "0 rows. AND requires both conditions to be true on one row at once — a classic case where OR was probably what you meant. Try that next.",
        },
        {
          goal: "Now ask it the other way: everyone in grade 9 OR grade 10.",
          solution: "SELECT * FROM students WHERE grade_level = 9 OR grade_level = 10;",
          explain:
            "5 rows — Marco and Kristine (grade 10), Jen, Ramon and Ana (grade 9). OR only needs ONE test to pass, so anyone who satisfies either condition gets in. Same two numbers as the last query, a completely different result.",
        },
        {
          goal: "Is anyone in grade 12?",
          solution: "SELECT * FROM students WHERE grade_level = 12;",
          predict: {
            question: "What happens when you run it?",
            choices: [
              "0 rows returned, no error — the WHERE understood you and simply found nobody",
              "An error, because grade_level 12 was never INSERTed anywhere",
              "MySQL returns every row, since nothing can be filtered out",
            ],
            answer: 0,
            explain:
              "A value the WHERE can't match is not a mistake — it's an answer. The server searched everything and reported the truth: nobody.",
          },
          explain:
            "0 rows, no error. Read the row count, not just whether something turned red — a quiet miss looks exactly like success until you check what came back.",
        },
        {
          goal: "List everyone, highest grade first — and within the same grade, alphabetically by name.",
          solution: "SELECT * FROM students ORDER BY grade_level DESC, name;",
          explain:
            "Kristine and Marco (both grade 10) come first, broken alphabetically; then Ana, Jen, Ramon (grade 9); then Liza (8); then Paolo (7). Two columns after ORDER BY, comma-separated — the second one only matters when the first ties.",
        },
        {
          goal: "Everyone's about to get a favorite_game column. Add it — nobody has a value yet.",
          solution: "ALTER TABLE students ADD COLUMN favorite_game VARCHAR(50);",
          predict: {
            question: "What happens to the seven rows already sitting in the table?",
            choices: [
              "The ALTER TABLE fails — you can't add a column to a table that already has rows",
              "Every existing row gets the empty text '' in favorite_game",
              "Every existing row gets NULL in favorite_game, until you fill it in",
            ],
            answer: 2,
            explain:
              "The shape changes around the data that's already there. NULL means 'nothing here yet' — not an empty string, not a failure.",
          },
          explain:
            "7 row(s) affected — NULL landed in favorite_game for every student. The column is real now and simply unfilled, which is exactly what the next task fixes for one of them.",
        },
        {
          goal: "Liza's favorite game is Mobile Legends. Record it.",
          solution: "UPDATE students SET favorite_game = 'Mobile Legends' WHERE id = 1;",
          explain:
            "1 row affected — Liza, and only Liza. Seven students, one new column, one row filled in: the whole week, rebuilt from nothing, entirely by you.",
        },
      ],
    },
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
          distractors: ["GROUP BY grade_level", "LIMIT 1;"],
          explain:
            "SELECT … FROM … WHERE … ORDER BY. The skeleton of every query you'll write this year — and the order your own file's queries must follow. GROUP BY and LIMIT are real clauses, just not ones this week ever taught — leaving them out on purpose is part of the puzzle.",
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
          distractors: ["DROP DATABASE school;", "INSERT INTO students VALUES (2, 'Marco');"],
          explain:
            "Run on an empty server, this rebuilds the whole week: database, USE, table, rows, then questions — each with its why written above it. Your real file should read exactly like this, just bigger. Neither distractor belongs in a build file: DROP would erase what you just made, and that INSERT only offers two values for a three-column table.",
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
          distractors: ["DROP TABLE students;", "UPDATE students SET favorite_game = 'Mobile Legends';"],
          explain:
            "You can't UPDATE a column before it exists, and you can't query an answer before the data is in. Dependencies decide the order — that's the deepest lesson of the week, hiding in a puzzle. Both distractors are disasters, not just wrong order: DROP TABLE erases Liza along with everyone else, and an UPDATE with no WHERE would have given every student the same favorite game.",
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
            question:
              "A friend says: 'A database is basically a spreadsheet.' What's the sharpest response?",
            choices: [
              "Nothing's missing — a database IS a spreadsheet, just with a fancier name",
              "Fair starting point — rows and columns are the same idea — but a database also enforces rules about what's allowed in each column, and finds things fast even with millions of rows",
              "Completely wrong — a database has nothing in common with a spreadsheet",
            ],
            answer: 1,
            explain:
              "The honest answer keeps what's true (the shape) and adds what's missing (rules + scale). 'Basically the same' and 'nothing alike' are both too tidy to be right.",
          },
        },
        {
          task: "Explain the difference between a row and a column, using an example that is NOT students — your own life, a game, a shop.",
          check: {
            question:
              "A classmate has it backwards: 'A column is one song's whole entry, and a row is something every song shares, like duration.' What's actually true?",
            choices: [
              "Nothing's wrong — that's exactly right",
              "Rows and columns are really the same thing, just different names for it",
              "They swapped the words: a ROW is one song's whole entry; a COLUMN is the shared attribute, like duration",
            ],
            answer: 2,
            explain:
              "One song is a row — its whole record. 'Duration' is a column because every row has one. Mixing these up is the single most common early confusion, which is exactly why it's worth catching out loud.",
          },
        },
        {
          task: "Explain why a column has a TYPE, and what would go wrong without one.",
          check: {
            question:
              "'Types don't really matter — MySQL just stores whatever you type in.' Where does that actually break down first?",
            choices: [
              "It doesn't break down — any column really can hold any kind of value",
              "Comparing and sorting break down first — you can't ask 'more than 20' of a column that might hold the word 'twenty' instead of the number",
              "It only matters for DATE columns, since dates have a strict format",
            ],
            answer: 1,
            explain:
              "Types are what make questions possible, not just storage. That's why Day 2's fussiness was the foundation Days 3 and 4 stood on.",
          },
        },
        {
          task: "Explain what WHERE does and what ORDER BY does, and why they are NOT the same kind of thing.",
          check: {
            question:
              "A classmate mixes them up: 'ORDER BY removes the rows I don't want, and WHERE decides what order they come back in.' What's actually true?",
            choices: [
              "They have it exactly backwards — WHERE removes rows, ORDER BY arranges whatever's left",
              "They're both right — WHERE and ORDER BY do the same job under different names",
              "ORDER BY removes duplicate rows; WHERE has nothing to do with rows at all",
            ],
            answer: 0,
            explain:
              "One removes, one arranges — and they can't swap jobs. Run them on a ten-row table and it's obvious; on a million-row table it's the difference between an answer and a mess.",
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
      kind: "upload",
      id: "export-week1-db",
      title: "📤 Export your real database and hand it in",
      intro:
        "Everything else this week happened in this page. This one happens on YOUR computer: you're going to export the actual database off your actual server and hand the file in. It's the difference between knowing the answer and having built the thing.",
      steps: [
        "In MySQL Workbench, open Server → Data Export from the top menu.",
        "On the left, tick the `school` schema. In the panel beside it, tick your `students` table.",
        "Choose \"Export to Self-Contained File\" and set the filename to `week1-<yourname>.sql` somewhere you'll find it (Documents is fine).",
        "Make sure \"Include Create Schema\" is ticked — the file should be able to rebuild the database from nothing.",
        "Click Start Export, wait for the green tick, then find the file and upload it below.",
      ],
      proves:
        "your own `students` table — including the extra column you invented on Day 4, and the rows you actually put in it. A generic table of made-up students isn't your database, and it's the one thing here nobody else can hand in for you.",
      screenshotFallback:
        "Export not working — install still broken, or you've been on DB Fiddle all week? Don't lose the day to it. Upload a screenshot of your table with its rows showing instead (in Workbench, or DB Fiddle's result grid), and say so in today's turn-in box.",
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
    {
      kind: "sql-console",
      id: "bug-hospital",
      optional: true,
      title: "🏥 Challenge: the bug hospital",
      intro:
        "Five statements came in overnight, each written by someone in a hurry, each wrong in a different way. Read what the patient was TRYING to do, work out what actually broke, and run the statement that does it for real. Nobody hands you the fix in here — that's what makes it the good ward.",
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
                ],
                rows: [
                  ["1", "Liza", "8", "Math"],
                  ["2", "Marco", "10", "Science"],
                  ["3", "Jen", "9", "Math"],
                  ["4", "Paolo", "7", "English"],
                  ["5", "Kristine", "10", "Science"],
                  ["6", "Ramon", "9", "PE"],
                  ["7", "Ana", "9", "Math"],
                ],
              },
            ],
          },
        ],
        use: "school",
      },
      tasks: [
        {
          goal:
            "Patient 1 refuses to run: INSERT INTO students VALUES (8, Diego, 9, 'Math'); — Diego really is a new student, grade 9, who loves Math. Run the statement that actually adds him.",
          solution: "INSERT INTO students VALUES (8, 'Diego', 9, 'Math');",
          explain:
            "Unquoted text isn't text to MySQL — it's read as a column name, and there's no column called Diego, so the engine reports 1054 and refuses. Quotes are what turn a word into a value instead of a name.",
        },
        {
          goal:
            "Patient 2 runs clean and returns nobody: SELECT * FROM students WHERE grade_level = 'nine'; — the grade 9 students are sitting right there in the table. Ask for them the way the server actually understands numbers.",
          solution: "SELECT * FROM students WHERE grade_level = 9;",
          explain:
            "'nine' in quotes is text, and grade_level never holds the word 'nine' — only the number 9. No error, just a WHERE that can never match anything: the quietest bug there is.",
        },
        {
          goal:
            "Patient 3 refuses to run: CREATE TABLE pets ( id INT, name VARCHAR(30), ); — you just need a tiny two-column table.",
          solution: "CREATE TABLE pets ( id INT, name VARCHAR(30) );",
          explain:
            "A comma right before the closing bracket tells MySQL to expect one more column, and finds ')' instead. The trailing comma some other languages allow is a straight syntax error here.",
        },
        {
          goal:
            "Patient 4 refuses to run: INSERT INTO students (id, name, grade_level) VALUES (9, 'Carlo', 9, 'Science'); — Carlo is id 9, grade 9, and his favorite subject is Science.",
          solution:
            "INSERT INTO students (id, name, grade_level, favorite_subject) VALUES (9, 'Carlo', 9, 'Science');",
          explain:
            "Three column names, four values — MySQL counts both lists and refuses the moment they disagree (error 1136). Whichever list you write, the other one has to match it exactly.",
        },
        {
          goal:
            "Patient 5 runs clean and returns nobody: SELECT * FROM students WHERE favorite_subject = 'Scince'; — students who love Science, correctly spelled, are right there in the table.",
          solution: "SELECT * FROM students WHERE favorite_subject = 'Science';",
          explain:
            "MySQL matches letters exactly. 'Scince' isn't in the table, so the WHERE finds nobody and reports it honestly — the same quiet miss as patient 2, this time from a typo instead of the wrong type.",
        },
      ],
    },
    {
      kind: "quest",
      id: "data-story",
      optional: true,
      title: "🔬 Challenge: a database about your actual life",
      intro:
        "Every table this week was mine — students I invented, questions I picked. This one is yours: something real you keep track of, designed by you, filled with rows that are actually true, answering questions you genuinely don't know the answer to yet. In your real Workbench, no script to copy.",
      missions: [
        {
          task: "Pick one real thing from your life you could track in a table — books you've read, matches you've played, songs on repeat, workouts, games, anything true. In your real Workbench (USE school;), design and CREATE a table for it with at least 4 columns and sensible types.",
          check: {
            question: "Why does this table have to be about something real, instead of invented data again?",
            choices: [
              "Real data doesn't change anything technical — it's just more fun to look at",
              "With invented rows you can write ANY question and it 'works'; with real rows some questions come back empty or surprising, which is what a real database actually feels like to use",
              "MySQL runs faster on real data than on made-up data",
            ],
            answer: 1,
            explain:
              "Invented data is agreeable — it never contradicts you. Real data pushes back: a query can come back with nothing, or with an answer you didn't expect. That friction is the entire point of this challenge.",
          },
        },
        {
          task: "INSERT at least 10 real rows — actual books, actual matches, actual songs. No 'sample1', no placeholders.",
          check: {
            question: "Halfway through typing rows, two of them turn out identical in every column. What now?",
            choices: [
              "Delete one — a table generally shouldn't hold the exact same row twice, unless duplicates are genuinely part of the truth",
              "MySQL will refuse the second one automatically, so just keep going",
              "Give the duplicate a different id and leave everything else the same — problem solved",
            ],
            answer: 0,
            explain:
              "Without a PRIMARY KEY (that's next week), MySQL happily stores duplicates — it's on you to notice and decide whether they belong. Changing only the id doesn't fix the actual problem: the row still claims to be a second, identical event.",
          },
        },
        {
          task: "Write down three questions about your own data that you genuinely don't know the answer to yet. Then answer each one with a real SELECT — WHERE, AND/OR, or ORDER BY, whatever the question needs.",
          check: {
            question: "What makes a question here better than 'show me everything'?",
            choices: [
              "Nothing — SELECT * FROM your table answers every real question just fine",
              "A good question narrows or orders the rows for a reason you actually care about — that's the difference between browsing and asking",
              "A better question always uses more clauses, regardless of what it's asking",
            ],
            answer: 1,
            explain:
              "SELECT * is looking. WHERE, AND/OR and ORDER BY are asking. The difference isn't clause count — it's whether the query exists because you wanted to know something.",
          },
        },
        {
          task: "Turn in the whole thing.",
          input:
            "Paste your CREATE TABLE statement, at least 10 of your real INSERTed rows, your three genuine questions in plain English, and the three queries (with what they actually returned) that answered them",
        },
      ],
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
        choices: ["SHOW DATABASES;", "USE school;", "SELECT * FROM students;"],
        answer: 1,
        explain:
          "Without it, every command gets 'no database selected'. It's the seatbelt click of a MySQL session — before you list anything or check any data.",
      },
      {
        prompt: "Which column type would you choose for a phone number?",
        choices: [
          "INT — it's made of digits",
          "DATE",
          "VARCHAR — phone numbers have leading zeros and symbols, and you never do arithmetic on them",
        ],
        answer: 2,
        explain:
          "A great question to have opinions about. 'Made of digits' isn't the test — 'would I ever add two of them together?' is.",
      },
      {
        prompt: "Which statement adds ROWS to a table that already exists?",
        choices: ["INSERT INTO", "CREATE TABLE", "ALTER TABLE"],
        answer: 0,
        explain:
          "CREATE makes the shape, INSERT adds rows, ALTER changes the shape afterwards. Three different jobs.",
      },
      {
        prompt: "Find the bug.",
        code: "INSERT INTO students VALUES (7, Kristine, 10, 'Science');",
        choices: [
          "10 needs quotes",
          "Kristine needs quotes — it's text, and text always needs them",
          "7 needs quotes, because it's this student's unique identifier",
        ],
        answer: 1,
        explain:
          "Text always gets quotes; numbers never do — not even ones that identify something. Unquoted, MySQL hunts for a column called Kristine.",
      },
      {
        prompt: "Which one returns FEWER ROWS than SELECT * FROM students;?",
        choices: [
          "SELECT name FROM students; — fewer columns means fewer rows too",
          "Both return the same number of rows",
          "SELECT * FROM students WHERE grade_level = 9; — only WHERE removes rows",
        ],
        answer: 2,
        explain:
          "Narrowing the column list keeps every row — you just see less of each one. Only WHERE removes rows, the distinction you were tested on all Wednesday.",
      },
      {
        prompt: "How many rows can this return?",
        code: "SELECT * FROM students WHERE grade_level = 9 AND grade_level = 10;",
        choices: [
          "Zero — no single row can hold two different grade_level values at once",
          "All of them — AND just means 'both apply somewhere in the table'",
          "Half of them — averaging the two conditions",
        ],
        answer: 0,
        explain: "You meant OR. AND asks for both to be true of the SAME row, which no single row can manage.",
      },
      {
        prompt: "A query returns zero rows, with no error. What's your first move?",
        choices: [
          "Rewrite the query from scratch — it clearly did something wrong",
          "Check whether 'nobody' is actually the true answer before assuming it's broken",
          "Reinstall MySQL — something's broken at a deeper level",
        ],
        answer: 1,
        explain:
          "Zero rows is an answer. Errors mean 'I don't understand you'; empty means 'I understand, and nothing matches'.",
      },
      {
        prompt: "Put these clauses in the only order MySQL accepts.",
        code: "ORDER BY name  ·  SELECT *  ·  WHERE grade_level = 9  ·  FROM students",
        choices: [
          "SELECT * WHERE grade_level = 9 FROM students ORDER BY name",
          "FROM students SELECT * ORDER BY name WHERE grade_level = 9",
          "SELECT * FROM students WHERE grade_level = 9 ORDER BY name",
        ],
        answer: 2,
        explain:
          "SELECT … FROM … WHERE … ORDER BY. That skeleton carries you through the rest of this course.",
      },
      {
        prompt: "ORDER BY grade_level DESC changes…",
        choices: [
          "Only the order of the result — the same rows come back, just rearranged",
          "Which rows come back",
          "How the rows are stored on disk",
        ],
        answer: 0,
        explain:
          "Sorting rearranges what you're handed. Nothing in the table itself moves, and no row is dropped for it.",
      },
      {
        prompt: "Which of these can you NOT undo?",
        choices: [
          "SELECT * FROM students ORDER BY name DESC;",
          "DROP DATABASE school;",
          "UPDATE students SET grade_level = 9 WHERE id = 1;",
        ],
        answer: 1,
        explain:
          "Reading is always safe, and an UPDATE is reversible — run another UPDATE to set it back. DROP is permanent and there is no recycle bin, which is why you practised it on sandbox.",
      },
      {
        prompt: "Why does UPDATE need a WHERE?",
        choices: [
          "MySQL always refuses to run UPDATE without one — there's no way around it",
          "It's just good style — nothing bad actually happens without one",
          "Without one, it changes every row in the table, permanently",
        ],
        answer: 2,
        explain:
          "Workbench's safe update mode blocks it by default precisely because the damage is silent and total — and that mode can be switched off, which is exactly why the habit has to live in your own head too.",
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
          "Naming the query, the way a function gets a name, so you can call it again",
          "Explaining to a human — usually future you — why the query below exists",
          "Making MySQL skip re-parsing the query, so it runs faster",
        ],
        answer: 1,
        explain:
          "MySQL ignores it completely. It's the only part of the file that says WHY, which makes it the most valuable line in it.",
      },
      {
        prompt: "Last question. You've written a query, sorted it, and answered your own invented question. What do you actually know how to do now?",
        choices: [
          "Only what the videos showed — the rest was just practice",
          "Nothing yet — this was really just an introduction to what's coming",
          "Design a table, fill it with data, and ask it questions — the foundation of every app you'll ever build",
        ],
        answer: 2,
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
    note: "Done early? The bug hospital and your own data story above are the real next step — genuine challenges, not busywork, and they turn in the same way as everything else. After that, the SQLBolt lessons in the reading track are solid extra practice too, and they run right in your browser.",
  },
};
