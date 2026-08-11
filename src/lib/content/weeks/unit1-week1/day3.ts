// unit1-week1 · Day 3 — Ask your table questions with SELECT and WHERE
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day3: DayPlan = {
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
      practice: {
        intro:
          "Three queries against YOUR students table — predict the row count out loud before each run:",
        steps: [
          "Everyone.",
          "Only the name column for everyone.",
          "Everyone in one grade level.",
        ],
        note: "If a prediction was wrong, don't move on until you know why — that gap is the actual lesson.",
      },
    },
    {
      title: "Logical operators (AND, OR, NOT)",
      youtubeId: "lScJW5Qz_5k",
      length: "5:57",
      practice: {
        steps: [
          "Write ONE query with two conditions joined by AND, and run it.",
          "Change only the AND to OR and run it again.",
          "Say out loud why the second result is bigger.",
        ],
        note: "AND narrows, OR widens — feel the difference on your own data before you read another word.",
      },
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
        choices: [
          "SELECT name FROM students;",
          "SELECT * FROM students WHERE grade_level = 9;",
          "Both do the same thing",
        ],
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
        choices: [
          "WHERE favorite_subject = NOT 'Math'",
          "WHERE favorite_subject != 'Math'",
          "WHERE NOT favorite_subject",
        ],
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
        choices: [
          "WHERE hometown = 'Cebu' OR 'Davao'",
          "WHERE hometown = 'Cebu' OR hometown = 'Davao'",
          "Both work",
        ],
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
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The difference between what SELECT picks and what WHERE picks, in your own words.",
      "The query you're proudest of today and what it answers.",
      "One question you still have.",
    ],
    note: "Your `week1.sql` already grew in the lab — those question-comments above each query are how Friday-you will understand Wednesday-you.",
  },
};
