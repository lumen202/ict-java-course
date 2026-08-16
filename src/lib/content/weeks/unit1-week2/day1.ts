// unit1-week2 · Day 1 — Change what's already there with UPDATE
//
// One day of the week's plan. The week's shell (title, reading track,
// activity, self-check) lives in ./index.ts, which assembles the days.
//
// This day is the TEMPLATE for the pacing redesign (see
// docs/agent/log/2026-08-16-pacing-research-and-day-redesign-plan.md):
// faded console hints, compose-from-scratch tasks whose goal is a question,
// predict-before-run on surprising outcomes, plausible MCQ distractors with
// varied answer positions, and an optional challenge tier after the real lab.

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
        "The messy records from your warm-up are now on a real (tiny) server. Repair them for real — then do the one thing you must NEVER do to real data, so you know exactly what it feels like — and then rebuild from the wreckage with statements you compose yourself. Nothing here can hurt anything: this server forgets everything when you leave.",
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
          hint: "Aim the WHERE at the group first — then the SET is the easy part.",
          explain:
            "3 rows affected — Jen, Ramon and Ana, all at once. A WHERE that matches a group changes the whole group. Powerful, and now you see why the WHERE deserves a moment's thought.",
        },
        {
          goal: "Two repairs at once: the student with id 4 should be grade_level 8 AND favorite_subject 'Math' — one statement.",
          solution: "UPDATE students SET grade_level = 8, favorite_subject = 'Math' WHERE id = 4;",
          hint: "Decide the aim first (one id), then chain the two changes with a comma.",
          explain:
            "One aim, two fixes. The comma chains assignments the same way it chains columns in a SELECT.",
        },
        {
          goal: "Now the quiet miss: try to move the student with id 99 to grade 11.",
          solution: "UPDATE students SET grade_level = 11 WHERE id = 99;",
          predict: {
            question: "There is no student with id 99. What will the server say when you run it?",
            choices: [
              "An error — you can't aim an UPDATE at a row that doesn't exist",
              "0 row(s) affected — no complaint at all",
              "It creates a new student with id 99 and grade 11",
            ],
            answer: 1,
            explain:
              "No error, no new row — UPDATE only ever changes what the WHERE finds, even when that's nothing.",
          },
          explain:
            "0 rows affected. No error, no red circle — the server understood you perfectly and found nobody. This is the quietest way an UPDATE goes wrong, and the rows-affected count is the only witness.",
        },
        {
          goal: "Time to meet the wall. Try to set EVERYONE's favorite_subject to 'Math' — no WHERE at all.",
          solution: "UPDATE students SET favorite_subject = 'Math';",
          predict: {
            question: "No WHERE, and the seatbelt (safe update mode) is still on. What happens?",
            choices: [
              "7 row(s) affected — every subject becomes 'Math'",
              "MySQL asks you to confirm such a big change first",
              "An error — the statement is refused and nothing changes",
            ],
            answer: 2,
            explain:
              "MySQL never asks 'are you sure?'. Safe update mode simply refuses the statement outright — that refusal IS the protection.",
          },
          explain:
            "Error 1175: safe update mode refused. Workbench does this too — it won't let a WHERE-less UPDATE through while the seatbelt is on. Read the message: it even tells you the escape hatch.",
        },
        {
          goal: "Take the seatbelt off — deliberately.",
          solution: "SET SQL_SAFE_UPDATES = 0;",
          explain:
            "Off. From this moment, nothing stands between an UPDATE and the whole table except your WHERE. Which is the point of the next task.",
        },
        {
          goal: "Do the forbidden thing ON PURPOSE, here where it's safe: run that same no-WHERE update and destroy every favorite_subject.",
          solution: "UPDATE students SET favorite_subject = 'Math';",
          predict: {
            question: "Same statement, seatbelt off. What happens this time?",
            choices: [
              "The same 1175 error — a WHERE-less UPDATE is simply never allowed",
              "7 row(s) affected — every favorite_subject in the table is overwritten",
              "Only the rows whose subject is already 'Math' are counted as affected",
            ],
            answer: 1,
            explain:
              "With the seatbelt off there is nothing left to stop it: every row the table has, rewritten in one stroke. The 1175 wall only exists while safe update mode is on — you just took it down yourself.",
          },
          explain:
            "7 rows affected — all of them. One line, one second, a whole column of real information gone. On this toy server that's a lesson; on a real one it's a very bad day. You never need to do this by accident now, because you've done it on purpose.",
        },
        {
          goal: "Look at the damage: show the whole table one more time.",
          solution: "SELECT * FROM students;",
          explain:
            "Every favorite_subject says 'Math' — Liza's, Paolo's, everyone's. The old values are not coming back; there is no undo. But the office kept notes, so the repair crew (you) can rebuild. From here on, no more templates: each task is a question, and you compose the statement.",
        },
        {
          goal: "Ramon (id 6) is the school's loudest PE fan — the blast erased that. Put his real subject back.",
          solution: "UPDATE students SET favorite_subject = 'PE' WHERE id = 6;",
          hint: "WHERE first: which row is Ramon's? Then write the SET.",
          explain:
            "1 row affected — Ramon is Ramon again. Notice what just happened: nobody showed you that statement. You turned a question about the data into SQL, which is the actual job.",
        },
        {
          goal: "Marco (id 2) lost his subject to the blast too. It should say what you repaired it to this morning — put it back.",
          solution: "UPDATE students SET favorite_subject = 'Science' WHERE id = 2;",
          explain:
            "Science — the very typo-fix the blast undid. Repairs don't always stay repaired; that's why the SELECT-first habit matters even on tables you know.",
        },
        {
          goal: "Both grade 8 students joined the new combined Science block this term. Record it — one statement, however many rows it takes.",
          solution: "UPDATE students SET favorite_subject = 'Science' WHERE grade_level = 8;",
          explain:
            "2 rows affected — the WHERE found Liza and Paolo for you. Aiming at what a group has in common beats hunting down ids one by one.",
        },
        {
          goal: "Correction from the office: Paolo (id 4) shouldn't be on that Science list at all — he's moved up to grade 9, and his subject is English. One statement, both fixes.",
          solution: "UPDATE students SET grade_level = 9, favorite_subject = 'English' WHERE id = 4;",
          hint: "One WHERE, two assignments.",
          explain:
            "1 row, two columns repaired. Corrections on top of corrections — this is what real maintenance looks like, and your comma handled it in one pass.",
        },
        {
          goal: "Kristine (id 5) hasn't picked a subject this year. Her row should hold nothing there — not empty text, nothing.",
          solution: "UPDATE students SET favorite_subject = NULL WHERE id = 5;",
          explain:
            "NULL, no quotes — the value is gone but the student remains. The shop is back in order, and every statement in the rebuild came out of your own head. Tomorrow the other careful verb: DELETE. Same seatbelt, higher stakes.",
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
              "MySQL keeps a history of old values you can roll back to, but only if you ask first",
              "UPDATE has no undo — the old value survives only where you saved it",
              "Workbench's Output panel always shows the value a row had before the change",
            ],
            answer: 1,
            explain:
              "There is no history and the Output panel only shows the count. Professionals snapshot before they change things — your note IS the undo button that SQL doesn't have.",
          },
        },
        {
          task: "Vandalize it: set that student's favorite_subject to 'Recess'. If Workbench refuses with a safe-update complaint, read the message, then run SET SQL_SAFE_UPDATES = 0; and try again.",
          code: "SET SQL_SAFE_UPDATES = 0;\nUPDATE students SET favorite_subject = 'Recess' WHERE id = 1;",
          check: {
            question: "Why might Workbench block this UPDATE even though it HAS a WHERE?",
            choices: [
              "Safe mode requires the WHERE to come before the SET, and Workbench reorders them",
              "The new value fails a spelling check against the column's existing values",
              "Safe mode only trusts a WHERE that aims with a KEY column — and your table has no key yet",
            ],
            answer: 2,
            explain:
              "Sharp eyes. Safe mode trusts a WHERE only when it aims with a key, and your week-1 table has none — id is just an ordinary column so far. Remember this annoyance: Thursday fixes it properly.",
          },
        },
        {
          task: "Now repair it: write the UPDATE that puts the original favorite_subject back, run it, and read the rows-affected count.",
          check: {
            question: "What count proves the repair landed on exactly the right row?",
            choices: [
              "0 row(s) affected — nothing left to fix means the repair is done",
              "Any count with a green circle next to it",
              "1 row(s) affected",
            ],
            answer: 2,
            explain:
              "One aimed row, one affected row. Zero means your WHERE missed; a green circle only means the statement ran. The count is the gauge — glance at it after every change.",
          },
        },
        {
          task: "One deliberate miss: run an UPDATE aimed at WHERE id = 999 (or any id you don't have), and watch what comes back.",
          check: {
            question: "What did MySQL say?",
            choices: [
              "Error 1054: unknown id in WHERE clause",
              "0 row(s) affected — no error, just a quiet miss",
              "It created a student with id 999 to receive the change",
            ],
            answer: 1,
            explain:
              "1054 is for a column name that doesn't exist — a VALUE that matches nothing is not an error at all. UPDATE never invents rows and never complains about missing ones. Only the count tells you.",
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
              "The SET — the change is the whole point of the statement",
              "The WHERE — decide who changes before deciding what changes",
              "The table name — everything else depends on which table you're in",
            ],
            answer: 1,
            explain:
              "You usually know the table without thinking, and the SET is the fun part — which is exactly why the WHERE gets skipped. Deciding the aim first is the habit that prevents disasters.",
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
              "Running CREATE DATABASE again would wipe the school you already built",
              "school already exists — week2.sql continues week1.sql's story instead of starting over",
              "USE runs faster, and week 2 files are supposed to be quick",
            ],
            answer: 1,
            explain:
              "CREATE DATABASE on an existing name actually errors rather than wiping — but the real reason is the story: files build on files. week1.sql creates the world, week2.sql maintains it. Run them in order on an empty server and the whole history replays.",
          },
        },
        {
          task: "Add a '-- Day 1' section: your vandalism-and-repair UPDATEs from the quest and any real fixes you made, each with a comment above it saying WHY (e.g. '-- Fix: I typed Marco's subject wrong in week 1'). Your Workbench history has everything.",
          check: {
            question: "The comment above an UPDATE should say…",
            choices: [
              "The date and time, so you can match it against Workbench's history",
              "Which video taught you the command, so you can rewatch it",
              "Why the change was needed — the SQL already says what changed",
            ],
            answer: 2,
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
    {
      kind: "sql-console",
      id: "bug-hospital",
      optional: true,
      title: "🏥 Challenge: the bug hospital",
      intro:
        "Six broken UPDATEs came in overnight — each one written by someone in a hurry, each one wrong in a different way. Read the patient, work out what its author MEANT, and run the statement that actually does it. Nobody hands you the answer in here; that's what makes it the good ward.",
      setup: {
        databases: [
          {
            name: "library",
            tables: [
              {
                name: "books",
                columns: [
                  { name: "id", type: "INT" },
                  { name: "title", type: "VARCHAR(50)" },
                  { name: "shelf", type: "VARCHAR(10)" },
                  { name: "status", type: "VARCHAR(20)" },
                ],
                rows: [
                  ["1", "The Hobbit", "A1", "shelved"],
                  ["2", "Little Women", "A2", "borrowed"],
                  ["3", "Dune", "B1", "borrowed"],
                  ["4", "Holes", "C4", "borrowed"],
                  ["5", "Matilda", "B3", "borrowed"],
                  ["6", "Hatchet", "A3", "borrowed"],
                ],
              },
            ],
          },
        ],
        use: "library",
      },
      tasks: [
        {
          goal: "Patient 1 arrived with error 1064:  UPDATE books SET status == 'returned' WHERE id = 2;  — Little Women (id 2) really was returned. Run the statement that records it.",
          solution: "UPDATE books SET status = 'returned' WHERE id = 2;",
          explain:
            "SQL's SET uses a single = to assign. The double == comes from other programming languages — MySQL just sees a syntax error near '='. One keystroke, whole statement dead.",
        },
        {
          goal: "Patient 2 also refuses to run:  UPDATE books WHERE id = 1 SET shelf = 'D1';  — The Hobbit (id 1) really is moving to shelf D1. Fix the statement and run it.",
          solution: "UPDATE books SET shelf = 'D1' WHERE id = 1;",
          explain:
            "The order is fixed: table, then SET, then WHERE. You decide the WHERE first in your head — but you still type it last.",
        },
        {
          goal: "Patient 3 tried two changes at once:  UPDATE books SET shelf = 'B2' AND status = 'shelved' WHERE id = 4;  — this server refuses it, and some real servers quietly accept it and write garbage into shelf, which is worse. Make both changes to Holes (id 4) correctly.",
          solution: "UPDATE books SET shelf = 'B2', status = 'shelved' WHERE id = 4;",
          explain:
            "A comma chains assignments; AND belongs in the WHERE. On servers that accept the broken version, 'B2' AND status = 'shelved' gets computed as true-or-false and the shelf becomes 0 — a silent data mangling, far nastier than an error.",
        },
        {
          goal: "Patient 4 ran without complaint and changed nothing:  UPDATE books SET status = 'shelved' WHERE id = 'three';  — Dune (book 3) is back on the shelf; record it for real.",
          solution: "UPDATE books SET status = 'shelved' WHERE id = 3;",
          explain:
            "id is a number column, and no number equals the word 'three' — so the WHERE matched nothing and the server reported a cheerful 0 rows affected. The quiet miss again, this time caused by quotes around something that was never text.",
        },
        {
          goal: "Patient 5 is an emergency — it was SECONDS from running:  UPDATE books SET status = 'lost';  — only ONE book is actually lost: Matilda, id 5. Run what the librarian meant.",
          solution: "UPDATE books SET status = 'lost' WHERE id = 5;",
          explain:
            "The missing WHERE would have declared every book in the library lost. This ward's seatbelt is on, so the broken version dies with error 1175 — but you've seen what happens when the seatbelt is off. One book lost, five saved.",
        },
        {
          goal: "Last patient. This one ran fine and did nothing:  UPDATE books SET status = 'overdue' WHERE status = 'overdue';  — Hatchet (id 6) is overdue, but its row still says 'borrowed'. Aim at something that is actually TRUE about the row right now, and mark it.",
          solution: "UPDATE books SET status = 'overdue' WHERE id = 6;",
          explain:
            "The broken WHERE aimed at the value the row was SUPPOSED to get, not the value it has — so it found nothing. A WHERE can only aim at what's already in the table. Ward's empty; you just debugged six statements a working DBA could have written on a bad day.",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      optional: true,
      title: "🔬 Challenge: your own repair shop",
      intro:
        "Everything today happened to tables I gave you. This one is yours: a table about something you actually care about, mistakes you plant yourself, repairs you invent yourself — in your real Workbench, with no script to copy. This is what the whole day was building toward.",
      missions: [
        {
          task: "Pick something you genuinely keep track of — games you play, songs on repeat, teams, snacks, anything. In your real Workbench (USE school;), create a small table for it: an id column plus at least 3 more columns, and INSERT at least 5 rows. As you type the data, plant TWO deliberate mistakes — a misspelling, a wrong number — and note somewhere what the correct values are.",
          input: "Paste your CREATE TABLE and INSERT statements",
        },
        {
          task: "Now run your own repair shop: write and run one UPDATE for each planted mistake. Before each run, say the expected rows-affected count out loud; after each run, check it.",
          check: {
            question: "One of your repairs reports '2 row(s) affected' when you expected 1. What does that tell you?",
            choices: [
              "The repair worked, and MySQL also fixed a similar mistake it noticed nearby",
              "Your WHERE matched a second row you didn't mean to touch — go look with a SELECT using the same WHERE",
              "MySQL counts the old value and the new value as one row each",
            ],
            answer: 1,
            explain:
              "MySQL never fixes things on its own initiative, and the count is rows, not values. A bigger count than expected means a wider aim than intended — the same WHERE in a SELECT shows you exactly who got hit.",
          },
        },
        {
          task: "One group change to finish: invent a reason to update several rows at once (a rename, a recount, a season change) and do it with a single UPDATE whose WHERE aims at what those rows have in common. Predict the count before you run it.",
          check: {
            question: "Your group UPDATE reports '0 row(s) affected'. Most likely…",
            choices: [
              "Group updates need to be run once per row, so run it again",
              "The rows did change, but group changes report 0 until you refresh",
              "The WHERE describes something no row currently has — check the real values with a SELECT",
            ],
            answer: 2,
            explain:
              "One UPDATE handles any number of rows in one run, and the count is always honest. A zero means the aim missed — often a spelling or capitalization difference between your WHERE and what's really in the table.",
          },
        },
        {
          task: "Turn in the shop's paperwork.",
          input:
            "Paste your maintenance log: the table name, every UPDATE you ran with the rows-affected count it reported, and one line on which repair you're proudest of",
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
          "The table's columns and their types",
          "Values inside rows that already exist",
          "It adds new rows to the table",
        ],
        answer: 1,
        explain:
          "INSERT adds rows, ALTER changes the shape, UPDATE rewrites values in existing rows. Three different verbs for three different jobs.",
      },
      {
        prompt: "Which part of an UPDATE decides WHICH rows change?",
        choices: [
          "The WHERE clause",
          "The SET clause",
          "Whatever rows came back from your most recent SELECT",
        ],
        answer: 0,
        explain:
          "SET is the change, WHERE is the aim. Your last SELECT has no memory the UPDATE can use — each statement aims fresh.",
      },
      {
        prompt: "You run an UPDATE and MySQL says '0 row(s) affected'. What happened?",
        choices: [
          "MySQL is waiting for you to confirm the change",
          "The change worked, but silently",
          "The WHERE matched nothing — a quiet miss, not an error",
        ],
        answer: 2,
        explain:
          "MySQL never asks for confirmation, and a change that worked reports how many rows it touched. Zero means the server understood you and found nobody — the count is the only witness.",
      },
      {
        prompt: "How many rows does this change?",
        code: "UPDATE students SET grade_level = 10\nWHERE grade_level = 9;",
        choices: [
          "Exactly one — an UPDATE changes one row per run",
          "Every student currently in grade 9",
          "Every student in the table",
        ],
        answer: 1,
        explain:
          "The WHERE aims at a group, so the whole group changes in one run. One UPDATE can touch one row, some rows, or all of them — the WHERE decides.",
      },
      {
        prompt: "Spot the correct way to change TWO columns in one UPDATE.",
        code: "A) SET name = 'Ana' AND grade_level = 9\nB) SET name = 'Ana', grade_level = 9\nC) SET name = 'Ana' SET grade_level = 9",
        choices: [
          "SET name = 'Ana' AND grade_level = 9",
          "SET name = 'Ana', grade_level = 9",
          "SET name = 'Ana' SET grade_level = 9",
        ],
        answer: 1,
        explain:
          "A comma between assignments. AND belongs in the WHERE — using it in the SET is a classic mix-up, and you met it in the bug hospital if you went there.",
      },
      {
        prompt: "What does UPDATE students SET favorite_subject = NULL WHERE id = 5; do?",
        choices: [
          "Deletes student 5's whole row",
          "Sets the subject to the four-letter word 'NULL'",
          "Erases the value — the row stays, the column holds nothing",
        ],
        answer: 2,
        explain:
          "NULL (no quotes) is the absence of a value, not text and not a row-remover. The student is still there; their subject is simply unknown now.",
      },
      {
        prompt: "You run an UPDATE with no WHERE and the seatbelt is ON. What happens?",
        choices: [
          "Error 1175 — safe update mode refuses to run it",
          "MySQL asks 'are you sure?' before running it",
          "Every row changes, but MySQL prints a warning afterwards",
        ],
        answer: 0,
        explain:
          "MySQL never asks and never warns after the fact — safe update mode simply refuses WHERE-less updates, because the damage would be silent and total. The error message even tells you how to switch it off — deliberately.",
      },
      {
        prompt: "And if the seatbelt is OFF and you run that same no-WHERE update?",
        choices: [
          "MySQL still refuses — an UPDATE simply requires a WHERE",
          "Every single row changes, permanently, with no undo",
          "Only the rows currently visible in the result grid change",
        ],
        answer: 1,
        explain:
          "A WHERE is optional in the grammar — that's exactly the danger. No confirmation, no recycle bin. You did this on purpose on the mini server today; remember what the table looked like afterwards.",
      },
      {
        prompt: "What does SET SQL_SAFE_UPDATES = 0; actually do?",
        choices: [
          "Turns safe update mode off for every user of that database",
          "Tells MySQL to skip counting affected rows, which makes updates faster",
          "Turns safe update mode off for YOUR current session, because you decided to",
        ],
        answer: 2,
        explain:
          "It's per session and it's a deliberate choice — other users keep their seatbelt, and the count always happens. The rule that replaces the seatbelt is in your head: decide the WHERE before you type the SET.",
      },
      {
        prompt: "Your UPDATE reports '3 row(s) affected' but you expected 1. What's your first move?",
        choices: [
          "SELECT with the same WHERE and look at which rows it actually matches",
          "Run the UPDATE again and see whether the count comes down",
          "Add LIMIT 1 next time so only one row can ever change",
        ],
        answer: 0,
        explain:
          "The count told you your aim was wider than you thought. Re-running changes nothing new, and limiting to one row just picks a winner at random — the same WHERE in a SELECT shows exactly who got hit, and the damage you may now need to repair.",
      },
      {
        prompt: "Which is the safest ORDER to work in?",
        choices: [
          "UPDATE first, then a SELECT to see how it went",
          "SELECT with the WHERE first, then UPDATE with that same WHERE, then check the count",
          "SET SQL_SAFE_UPDATES = 0 first, so nothing interrupts the work",
        ],
        answer: 1,
        explain:
          "Preview, change, verify. Checking after the UPDATE is too late, and switching the seatbelt off first is backwards. The same WHERE does all three jobs — aim it with a harmless SELECT before you attach it to a dangerous verb.",
      },
      {
        prompt: "UPDATE and INSERT walk into a table. What's the difference?",
        choices: [
          "INSERT adds new rows; UPDATE changes rows that are already there",
          "UPDATE adds the row itself if the WHERE finds nothing to change",
          "They do the same thing — INSERT is the older spelling of UPDATE",
        ],
        answer: 0,
        explain:
          "If the row doesn't exist yet, you INSERT it. Once it exists, you UPDATE it. An UPDATE aimed at a missing row changes nothing and creates nothing — as your quiet miss proved today.",
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
    note: "Your week2.sql should already hold the Day 1 section from the lab. Done with time to spare? The two challenge steps above — the bug hospital and your own repair shop — are waiting, and they're where today's skills get properly interesting. Tomorrow: the other careful verb, DELETE.",
  },
};
