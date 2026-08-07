// unit1-week1 · Day 4 — Sort your results, then make the table yours
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day4: DayPlan = {
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
};
