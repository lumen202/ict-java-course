// unit1-week2 · Day 1 — Change what's already there with UPDATE
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.

import type { DayPlan } from "../../types";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Change what's already there with UPDATE",
  warmupGame: {
    kind: "row-hunt",
    id: "warmup",
    title: "🕹️ Warm-up game: the repair shop",
    intro:
      "The enrolment office typed up this year's records and made a mess. An UPDATE is aim-then-change: the WHERE finds the rows, the SET fixes them. You be the WHERE — each round describes a repair; click the row (or rows) the UPDATE would hit, then press Run and see the repair as real SQL.",
    tableName: "students",
    columns: ["id", "name", "grade_level", "favorite_subject"],
    rows: [
      ["1", "Liza", "8", "Math"],
      ["2", "Marco", "10", "Sciense"],
      ["3", "Jen", "9", "Math"],
      ["4", "Paolo", "7", "English"],
      ["5", "Krsitine", "10", "Science"],
      ["6", "Ramon", "9", "PE"],
    ],
    rounds: [
      {
        question:
          "One student's NAME is misspelled. Click the row the repair has to hit.",
        matches: [4],
        sql: "UPDATE students SET name = 'Kristine'\nWHERE id = 5;",
        explain:
          "Krsitine → Kristine. Read the command inside-out: WHERE id = 5 aims, SET fixes. Clicking her row is exactly what the WHERE does.",
      },
      {
        question: "A favorite_subject is misspelled too — click that row.",
        matches: [1],
        sql: "UPDATE students SET favorite_subject = 'Science'\nWHERE id = 2;",
        explain:
          "Same shape, different repair. Every UPDATE you'll ever write is these two parts: which rows, what changes.",
      },
      {
        question:
          "New school year — every grade 9 student moves up to grade 10. Click EVERY row that UPDATE would change.",
        matches: [2, 5],
        sql: "UPDATE students SET grade_level = 10\nWHERE grade_level = 9;",
        explain:
          "One UPDATE, two rows. The WHERE decides how many rows change — one, some, or (careful now) all of them.",
      },
      {
        question:
          "The office tries to update the student with id 99. Click every row that changes.",
        matches: [],
        sql: "UPDATE students SET grade_level = 11\nWHERE id = 99;",
        explain:
          "Nobody. No error either — just '0 row(s) affected'. That number is the ONLY sign your update missed. Read it every single time.",
      },
      {
        question:
          "A careless typist runs UPDATE students SET grade_level = 7; — no WHERE at all. Click everything that changes.",
        matches: [0, 1, 2, 3, 4, 5],
        sql: "UPDATE students SET grade_level = 7;\n-- every row. permanently. no undo.",
        explain:
          "No WHERE means no aim — everyone is suddenly in grade 7. This is exactly why Workbench's safe update mode exists, and today you'll feel it catch you.",
      },
    ],
  },
  videos: [
    {
      title: "How to UPDATE and DELETE data from a TABLE",
      youtubeId: "OB2leB2iZ6U",
      length: "3:32",
      practice: {
        intro:
          "Short video, two commands. Today is the UPDATE half — resist the urge to delete anything until tomorrow. In your own Workbench:",
        steps: [
          "Write an UPDATE that changes ONE value in your students table (a favorite_subject, a grade).",
          "Before you run it, say out loud how many rows should change.",
          "Run it, then check the rows-affected count against your prediction.",
        ],
        note: "If Workbench refuses with a safe-update complaint, that's tonight's mini server topic — read the message and keep going.",
      },
    },
  ],
  activities: [
    {
      kind: "typing",
      id: "typing-update",
      title: "⌨️ Type the repairs",
      intro:
        "UPDATE has three moving parts — the table, the SET, the WHERE — and the WHERE is the one you can never forget. Type these until the shape is automatic.",
      rounds: [
        {
          prompt: "Change the grade of the student with id 1 to 9 — start with the command word.",
          template: "{UPDATE} students SET grade_level = 9 WHERE id = 1;",
          explain: "UPDATE names the table first, like SELECT names it after FROM.",
        },
        {
          prompt: "Give the student with id 3 a new favorite subject: Art.",
          template: "UPDATE students {SET} favorite_subject = 'Art' WHERE id = 3;",
          explain: "SET is the 'what changes' part: column = new value.",
        },
        {
          prompt: "Move the student with id 2 to grade 10 — type the whole aiming part.",
          template: "UPDATE students SET grade_level = 10 {WHERE id = 2};",
          explain:
            "The WHERE is what makes this a repair instead of a disaster. Decide it BEFORE you type the SET — always.",
        },
        {
          prompt: "Fix two things about the student with id 6 in ONE statement: name to 'Ramon' and grade to 9.",
          template: "UPDATE students SET name = 'Ramon', {grade_level = 9} WHERE id = 6;",
          explain:
            "A comma between assignments lets one UPDATE fix several columns of the same rows at once.",
        },
        {
          prompt: "Erase the favorite subject of the student with id 5 — no value at all, not empty text.",
          template: "UPDATE students SET favorite_subject = {NULL} WHERE id = 5;",
          explain:
            "NULL means 'nothing here' — no quotes, because it isn't text. The row stays; only the value is gone.",
        },
        {
          prompt: "Turn Workbench's safety belt off for this session.",
          template: "SET {SQL_SAFE_UPDATES} = 0;",
          explain:
            "You met this line in week 1. This week it matters daily — and switching it off should always be a decision, never a reflex.",
        },
        {
          prompt: "From memory: move the student with id 4 to grade 10.",
          template: "{UPDATE students SET grade_level = 10 WHERE id = 4;}",
          explain: "Table, change, aim. The full shape, from your own fingers.",
        },
        {
          prompt: "From memory: give EVERY grade 9 student the favorite subject 'Math'.",
          template: "{UPDATE students SET favorite_subject = 'Math' WHERE grade_level = 9;}",
          explain:
            "A WHERE can aim at a group, not just one row. How many rows change? Whatever the WHERE matches — the rows-affected count will tell you.",
        },
      ],
    },
    {
      kind: "sql-console",
      id: "update-console",
      title: "🖥️ Mini server: the repair shop, live",
      intro:
        "The messy records from your warm-up are now on a real (tiny) server. Repair them for real — then, at the end, do the one thing you must NEVER do to real data, so you know exactly what it feels like. Nothing here can hurt anything: this server forgets everything when you leave.",
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
                  ["2", "Marco", "10", "Sciense"],
                  ["3", "Jen", "9", "Math"],
                  ["4", "Paolo", "7", "English"],
                  ["5", "Krsitine", "10", "Science"],
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
          goal: "Look before you touch: show the whole table and spot what's wrong.",
          solution: "SELECT * FROM students;",
          hint: "SELECT * FROM students;",
          explain:
            "Seven rows, two typos — 'Krsitine' and 'Sciense'. Every repair job starts with looking. Never change what you haven't seen.",
        },
        {
          goal: "Fix the misspelled NAME: the student with id 5 should be 'Kristine'.",
          solution: "UPDATE students SET name = 'Kristine' WHERE id = 5;",
          hint: "UPDATE students SET name = 'Kristine' WHERE id = 5;",
          explain:
            "1 row affected — exactly what you predicted, exactly what you wanted. That number is your receipt for every change you'll ever make.",
        },
        {
          goal: "Fix the misspelled SUBJECT: id 2 should love 'Science'.",
          solution: "UPDATE students SET favorite_subject = 'Science' WHERE id = 2;",
          hint: "Same shape as the last repair — new SET, new WHERE.",
          explain: "1 row affected again. Two typos down, and the table is telling the truth now.",
        },
        {
          goal: "New school year: move EVERY grade 9 student up to grade 10, in one statement.",
          solution: "UPDATE students SET grade_level = 10 WHERE grade_level = 9;",
          hint: "Aim the WHERE at the group: WHERE grade_level = 9.",
          explain:
            "3 rows affected — Jen, Ramon and Ana, all at once. A WHERE that matches a group changes the whole group. Powerful, and now you see why the WHERE deserves a moment's thought.",
        },
        {
          goal: "Two repairs at once: the student with id 4 should be grade_level 8 AND favorite_subject 'Math' — one statement.",
          solution: "UPDATE students SET grade_level = 8, favorite_subject = 'Math' WHERE id = 4;",
          hint: "Separate the two assignments with a comma: SET grade_level = 8, favorite_subject = 'Math'.",
          explain:
            "One aim, two fixes. The comma chains assignments the same way it chains columns in a SELECT.",
        },
        {
          goal: "Now the quiet miss: try to move the student with id 99 to grade 11.",
          solution: "UPDATE students SET grade_level = 11 WHERE id = 99;",
          hint: "A normal UPDATE — aimed at an id that doesn't exist.",
          explain:
            "0 rows affected. No error, no red circle — the server understood you perfectly and found nobody. This is the quietest way an UPDATE goes wrong, and the rows-affected count is the only witness.",
        },
        {
          goal: "Time to meet the wall. Try to set EVERYONE's favorite_subject to 'Math' — no WHERE at all.",
          solution: "UPDATE students SET favorite_subject = 'Math';",
          explain:
            "Error 1175: safe update mode refused. Workbench does this too — it won't let a WHERE-less UPDATE through while the seatbelt is on. Read the message: it even tells you the escape hatch.",
        },
        {
          goal: "Take the seatbelt off — deliberately.",
          solution: "SET SQL_SAFE_UPDATES = 0;",
          hint: "SET SQL_SAFE_UPDATES = 0;",
          explain:
            "Off. From this moment, nothing stands between an UPDATE and the whole table except your WHERE. Which is the point of the next task.",
        },
        {
          goal: "Do the forbidden thing ON PURPOSE, here where it's safe: run that same no-WHERE update and destroy every favorite_subject.",
          solution: "UPDATE students SET favorite_subject = 'Math';",
          hint: "The exact statement the seatbelt blocked a moment ago.",
          explain:
            "7 rows affected — all of them. One line, one second, a whole column of real information gone. On this toy server that's a lesson; on a real one it's a very bad day. You never need to do this by accident now, because you've done it on purpose.",
        },
        {
          goal: "Look at the damage: show the whole table one more time.",
          solution: "SELECT * FROM students;",
          explain:
            "Every favorite_subject says 'Math' — Liza's, Paolo's, everyone's. The old values are not coming back; there is no undo. Tomorrow you learn the other careful verb: DELETE. Same seatbelt, higher stakes.",
        },
      ],
    },
    {
      kind: "quest",
      id: "cleanup-crew",
      title: "🧹 Quest: repair your own table",
      intro:
        "The mini server's data was mine. Your students table — the one on YOUR machine, full of people you invented — is about to get its first real maintenance. Break one thing on purpose, fix it, and learn to read the rows-affected count like a mechanic reads a gauge.",
      missions: [
        {
          task: "In your real Workbench: USE school; then SELECT * FROM students; and pick one victim row. Note its id and its favorite_subject — you're about to vandalize it.",
          check: {
            question: "Why write down the CURRENT value before changing it?",
            choices: [
              "UPDATE has no undo — the old value survives only where you saved it",
              "MySQL requires a backup before every update",
              "No reason, values are easy to guess back",
            ],
            answer: 0,
            explain:
              "Exactly. Professionals snapshot before they change things. Your note IS the undo button that SQL doesn't have.",
          },
        },
        {
          task: "Vandalize it: set that student's favorite_subject to 'Recess'. If Workbench refuses with a safe-update complaint, read the message, then run SET SQL_SAFE_UPDATES = 0; and try again.",
          code: "SET SQL_SAFE_UPDATES = 0;\nUPDATE students SET favorite_subject = 'Recess' WHERE id = 1;",
          check: {
            question: "Why might Workbench block this UPDATE even though it HAS a WHERE?",
            choices: [
              "Safe mode wants the WHERE to use a KEY column — and your table doesn't have a key yet",
              "'Recess' is not a real subject",
              "You can only update on Mondays",
            ],
            answer: 0,
            explain:
              "Sharp eyes. Safe mode trusts a WHERE only when it aims with a key, and your week-1 table has none — id is just an ordinary column so far. Remember this annoyance: Thursday fixes it properly.",
          },
        },
        {
          task: "Now repair it: write the UPDATE that puts the original favorite_subject back, run it, and read the rows-affected count.",
          check: {
            question: "What count proves the repair landed on exactly the right row?",
            choices: ["1 row(s) affected", "0 row(s) affected", "7 row(s) affected"],
            answer: 0,
            explain:
              "One aimed row, one affected row. Zero means your WHERE missed; more than one means it caught rows you didn't intend. The count is the gauge — glance at it after every change.",
          },
        },
        {
          task: "One deliberate miss: run an UPDATE aimed at WHERE id = 999 (or any id you don't have), and watch what comes back.",
          check: {
            question: "What did MySQL say?",
            choices: [
              "0 row(s) affected — no error, just a quiet miss",
              "Error: id not found",
              "It created a student with id 999",
            ],
            answer: 0,
            explain:
              "UPDATE never invents rows and never complains about missing ones. It changes what the WHERE finds — even when that's nothing. Only the count tells you.",
          },
        },
        {
          task: "Final mission: turn in your maintenance log.",
          input:
            "Paste the vandalism UPDATE, the repair UPDATE, and the rows-affected count each one reported",
        },
      ],
    },
    {
      kind: "quest",
      id: "cheat-sheet",
      title: "📓 Quest: cheat sheet, week 2 begins",
      intro:
        "Your cheat sheet carried you through week 1. New week, new section — and today's entries are the first commands you own that can destroy data, so the notes matter more than ever.",
      missions: [
        {
          task: "Open your cheatsheet file and add a heading: 'Week 2 — changing data'. Under it, from memory, write: update one row, update a group, update two columns at once.",
          check: {
            question: "In UPDATE students SET grade_level = 10 WHERE id = 3; — which part should you decide FIRST when writing your own?",
            choices: [
              "The WHERE — decide who changes before deciding what changes",
              "The SET — the change is the point",
              "The semicolon",
            ],
            answer: 0,
            explain:
              "WHERE first is the habit that prevents disasters. An UPDATE without an aim is a loaded command.",
          },
        },
        {
          task: "Add today's safety entries: the seatbelt line (SET SQL_SAFE_UPDATES = 0;) with a warning in your own words about when it's okay to use it, and this line in your errors section: '0 rows affected = my WHERE missed — not an error'.",
          input:
            "Paste your new Week 2 cheat-sheet section — the commands, your seatbelt warning, and the quiet-miss note",
        },
      ],
    },
    {
      kind: "quest",
      id: "real-lab",
      title: "🛠️ Real lab: start week2.sql",
      intro:
        "week1.sql told the story of building. week2.sql tells the story of maintaining — and it starts today, with the repairs you just made on your real table.",
      missions: [
        {
          task: "Create a new file called week2.sql next to your week1.sql. Header comment at the top — your name, 'Week 2' — then the first real line: USE school;",
          check: {
            question: "Why does week2.sql start with USE school; instead of CREATE DATABASE school;?",
            choices: [
              "school already exists — week2.sql continues week1.sql's story instead of starting over",
              "CREATE DATABASE only works once per computer",
              "USE is just a politer word",
            ],
            answer: 0,
            explain:
              "Files build on files: week1.sql creates the world, week2.sql maintains it. Run them in order on an empty server and the whole history replays.",
          },
        },
        {
          task: "Add a '-- Day 1' section: your vandalism-and-repair UPDATEs from the quest and any real fixes you made, each with a comment above it saying WHY (e.g. '-- Fix: I typed Marco's subject wrong in week 1'). Your Workbench history has everything.",
          check: {
            question: "The comment above an UPDATE should say…",
            choices: [
              "Why the change was needed — the SQL already says what changed",
              "The date and time",
              "'update statement' so you can find it later",
            ],
            answer: 0,
            explain:
              "Same rule as week 1's queries: SQL says what, comments say why. For changes to data, the why is the whole story.",
          },
        },
        {
          task: "Last: run SELECT * FROM students; one more time and check every value you touched today is exactly what you want it to be — this table is your course companion, keep it healthy.",
          input:
            "Paste your week2.sql so far (header, USE, Day 1 section), and one sentence: what does '1 row(s) affected' prove that a green circle alone doesn't?",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-shapeshifter",
    title: "⚔️ Boss battle: The Shapeshifter",
    intro:
      "The Shapeshifter rewrites rows behind your back and hopes you won't check the count. Everything it asks, you did with your own hands today.",
    boss: { name: "the Shapeshifter", emoji: "🦎" },
    questions: [
      {
        prompt: "What does UPDATE change?",
        choices: [
          "Values inside rows that already exist",
          "The table's columns and types",
          "It adds new rows",
        ],
        answer: 0,
        explain:
          "INSERT adds rows, ALTER changes the shape, UPDATE rewrites values in existing rows. Three different verbs for three different jobs.",
      },
      {
        prompt: "Which part of an UPDATE decides WHICH rows change?",
        choices: ["The WHERE clause", "The SET clause", "The table name"],
        answer: 0,
        explain: "SET is the change, WHERE is the aim. No WHERE — no aim.",
      },
      {
        prompt: "You run an UPDATE and MySQL says '0 row(s) affected'. What happened?",
        choices: [
          "The WHERE matched nothing — a quiet miss, not an error",
          "The update worked",
          "The table is read-only",
        ],
        answer: 0,
        explain:
          "The server understood you and found nobody. The rows-affected count is the only witness — which is why you read it every time.",
      },
      {
        prompt: "How many rows does this change?",
        code: "UPDATE students SET grade_level = 10\nWHERE grade_level = 9;",
        choices: [
          "Every student currently in grade 9",
          "Exactly one",
          "Every student in the table",
        ],
        answer: 0,
        explain:
          "The WHERE aims at a group, so the whole group changes. One UPDATE can touch one row, some rows, or all of them — the WHERE decides.",
      },
      {
        prompt: "Spot the correct way to change TWO columns in one UPDATE.",
        code: "A) SET name = 'Ana' AND grade_level = 9\nB) SET name = 'Ana', grade_level = 9\nC) SET name = 'Ana' SET grade_level = 9",
        choices: ["A", "B", "C"],
        answer: 1,
        explain:
          "A comma between assignments. AND belongs in the WHERE — using it in the SET is a classic mix-up.",
      },
      {
        prompt: "What does UPDATE students SET favorite_subject = NULL WHERE id = 5; do?",
        choices: [
          "Erases the value — the row stays, the column holds nothing",
          "Deletes the row",
          "Sets the subject to the word 'NULL'",
        ],
        answer: 0,
        explain:
          "NULL (no quotes) is the absence of a value. The student is still there; their subject is simply unknown now.",
      },
      {
        prompt: "You run an UPDATE with no WHERE and the seatbelt is ON. What happens?",
        choices: [
          "Error 1175 — safe update mode refuses to run it",
          "Every row changes",
          "Only the first row changes",
        ],
        answer: 0,
        explain:
          "Safe update mode blocks WHERE-less updates precisely because the damage would be silent and total. The error message even tells you how to switch it off — deliberately.",
      },
      {
        prompt: "And if the seatbelt is OFF and you run that same no-WHERE update?",
        choices: [
          "Every single row changes, permanently, with no undo",
          "MySQL asks 'are you sure?'",
          "Nothing — UPDATE always needs a WHERE",
        ],
        answer: 0,
        explain:
          "No confirmation, no recycle bin. You did this on purpose on the mini server today — remember what the table looked like afterwards.",
      },
      {
        prompt: "What does SET SQL_SAFE_UPDATES = 0; actually do?",
        choices: [
          "Turns safe update mode off for YOUR current session, because you decided to",
          "Deletes the safety data",
          "Makes updates run faster",
        ],
        answer: 0,
        explain:
          "It's a deliberate choice, per session. The rule that replaces the seatbelt is in your head: decide the WHERE before you type the SET.",
      },
      {
        prompt: "Your UPDATE reports '3 row(s) affected' but you expected 1. What's your first move?",
        choices: [
          "SELECT with the same WHERE and look at which rows it actually matches",
          "Run the update again",
          "Restart Workbench",
        ],
        answer: 0,
        explain:
          "The count told you your aim was wider than you thought. The same WHERE in a SELECT shows you exactly who got hit — and the damage you may now need to repair.",
      },
      {
        prompt: "Which is the safest ORDER to work in?",
        choices: [
          "SELECT with the WHERE first, then UPDATE with that same WHERE, then check the count",
          "UPDATE first, SELECT after, hope in between",
          "Order doesn't matter",
        ],
        answer: 0,
        explain:
          "Preview, change, verify. The same WHERE does all three jobs — aim it with a harmless SELECT before you attach it to a dangerous verb.",
      },
      {
        prompt: "UPDATE and INSERT walk into a table. What's the difference?",
        choices: [
          "INSERT adds new rows; UPDATE changes rows that are already there",
          "They're synonyms",
          "UPDATE is just a faster INSERT",
        ],
        answer: 0,
        explain:
          "If the row doesn't exist yet, you INSERT it. Once it exists, you UPDATE it. An UPDATE aimed at a missing row changes nothing — as your quiet miss proved today.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket — type these into the turn-in box below:",
    steps: [
      "The two parts of every UPDATE and which one deserves more thought, in your own words.",
      "What '0 row(s) affected' means and why it's sneaky.",
      "One question you still have.",
      "Then paste the SQL you ran today.",
    ],
    note: "Your week2.sql should already hold the Day 1 section from the lab — tomorrow the other careful verb: DELETE.",
  },
};
