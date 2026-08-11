// unit1-week1 · Day 2 — Build your students table and fill it with people
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day2: DayPlan = {
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
      practice: {
        intro: "Type along with the video, then on your own:",
        steps: [
          "Run `USE school;` so MySQL knows which database you mean.",
          "Create a table called `students` with four columns — id INT, name VARCHAR(50), grade_level INT, favorite_subject VARCHAR(50).",
          "Run `DESCRIBE students;` and read the result: every rule you just wrote is listed back to you.",
        ],
        note: "If it came out wrong, `DROP TABLE students;` and build it again — nothing is precious yet.",
      },
    },
    {
      title: "How to INSERT rows into a TABLE",
      youtubeId: "Cxilfg-M158",
      length: "5:54",
      practice: {
        steps: [
          "Add three students, one INSERT at a time.",
          "Check with `SELECT * FROM students;` after each one.",
          "Watch what the quotes do: text values get them, numbers don't.",
        ],
        note: "Three is enough for now — the quest below takes you to ten.",
      },
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
        choices: ["'nine'", "9", "'Grade 9'"],
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
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "What a column TYPE is, in your own words, and why the table is fussy about it.",
      "The error you hit most today and what fixed it.",
      "One question you still have.",
      "Then paste in everything you typed today — and double-check the Day 2 section of your `week1.sql` from the lab has all of it.",
    ],
  },
};
