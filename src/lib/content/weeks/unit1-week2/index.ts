import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit1Week2: Week = {
  slug: "unit1-week2",
  unit: "Unit 1 · Databases & SQL",
  title: "Week 2 — Change it, delete it, and give every row a true name",
  summary:
    "Last week you built a database and asked it questions. This week you learn the careful verbs — changing rows with UPDATE and removing them with DELETE — and then meet the idea that makes both of them safe: a PRIMARY KEY, so every row has a number of its own and your commands hit exactly the row you mean. By Friday the server is even numbering rows for you.",
  objectives: [
    "Change existing rows with UPDATE … SET … WHERE, and prove what changed by reading the rows-affected count",
    "Remove rows with DELETE FROM … WHERE — and explain how DELETE, DROP TABLE, and an empty result are three different things",
    "Use the preview-SELECT ritual and safe update mode so a change can never surprise you",
    "Explain why a row needs an identifier nothing else shares, and declare a PRIMARY KEY that enforces it",
    "Read the errors 1062 (duplicate entry), 1048 (cannot be null) and 1175 (safe update mode) and know the fix for each",
    "Let the server number rows for you with AUTO_INCREMENT, INSERT with a column list, and explain why a deleted number never comes back",
  ],
  video: {
    title: "Bro Code — MySQL tutorial for beginners 🐬",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ",
    watchNotes: [
      "Only about 13 minutes of video all week — on purpose. This week's commands CHANGE data, and changing data is learned by doing it carefully many times, not by watching.",
      "Type along with every video in your own Workbench, but do the dangerous practice in a sandbox first — the mini servers on this page can't hurt anything.",
      "Slowing a video to 0.75× and turning on captions is a smart move, not a weakness.",
      "Before you run ANY command that changes rows this week, say the WHERE out loud first. That habit is the whole week in one sentence.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "SQLBolt — lessons 16–18 (inserting, updating, deleting rows)",
      url: "https://sqlbolt.com/lesson/updating_rows",
      note: "The doing-it-in-the-browser alternative to the videos — short written lessons with a live practice editor. Covers this week's UPDATE and DELETE exactly.",
    },
    {
      label: "W3Schools — SQL UPDATE and DELETE",
      url: "https://www.w3schools.com/sql/sql_update.asp",
      note: "Read the UPDATE page, then use the 'Next' button to reach DELETE. Plain English, good for looking up the exact shape of a statement mid-task.",
    },
    {
      label: "W3Schools — PRIMARY KEY and AUTO_INCREMENT",
      url: "https://www.w3schools.com/sql/sql_primarykey.asp",
      note: "Covers Thursday and Friday's ideas in text: what a primary key promises, and how AUTO_INCREMENT hands out numbers. The AUTO_INCREMENT page is two clicks further on.",
    },
    {
      label: "DB Fiddle (browser MySQL)",
      url: "https://www.db-fiddle.com/",
      note: "Fallback: if MySQL isn't working on your computer, do the whole week here instead. Choose MySQL 8 in the top-left dropdown.",
    },
  ],
  activity: {
    title: "Clean it, protect it, rebuild it",
    goal: "Your week-1 database, upgraded: data repaired with UPDATE, junk removed with DELETE, the students table protected by a PRIMARY KEY, and a second table of your own design whose ids the server assigns itself.",
    steps: [
      "Repair at least three values in your students table with aimed UPDATEs, reading the rows-affected count each time.",
      "Insert junk rows on purpose, preview them with SELECT, remove them with DELETE, and verify the count.",
      "Clean up your ids, then give the table its key: ALTER TABLE students ADD PRIMARY KEY (id);",
      "Rebuild your own week-1 table design as a real table with id INT PRIMARY KEY AUTO_INCREMENT, filled using column-list INSERTs.",
      "Keep every statement in week2.sql with a comment above it saying why.",
    ],
    twist:
      "Run a 'data disaster drill' of your own invention: write down three realistic mistakes that could creep into your students table (a typo, a wrong number, a row that shouldn't exist). Cause each one on purpose, then repair each with the right UPDATE or DELETE — recording the rows-affected count before and after each repair, and the preview SELECT you used to aim. The disasters must be yours; no tutorial has them.",
    deliverables: [
      "Your complete week2.sql — every UPDATE, DELETE, ALTER and INSERT with a comment above each — pasted into the turn-in box",
      "The self-check and the two-minute 'where are you at?' below",
    ],
  },
  selfCheck: [
    {
      question: "What would UPDATE students SET grade_level = 12; do — and what normally stops it?",
      answer:
        "With no WHERE it would set EVERY student's grade_level to 12, permanently, with no undo. Workbench's safe update mode (Error 1175) blocks WHERE-less updates until you deliberately run SET SQL_SAFE_UPDATES = 0;.",
    },
    {
      question: "What's the difference between DELETE FROM students; and DROP TABLE students;?",
      answer:
        "DELETE removes rows but keeps the table — its columns and rules survive, and SELECT returns headings with no rows. DROP removes the whole table: shape, rules and rows. After a DROP, even DESCRIBE errors because there's nothing left to describe.",
    },
    {
      question: "Why is name a bad PRIMARY KEY for your students table?",
      answer:
        "Two people can share a name, so it can't be guaranteed unique — and a primary key must be unique and never NULL. That's why tables get an id column that exists only to identify the row.",
    },
    {
      question: "You INSERT a row whose id already exists in a PRIMARY KEY column. What happens?",
      answer:
        "MySQL refuses the row with Error 1062: Duplicate entry. The key is a promise the server enforces — bad data bounces off instead of sneaking in, just like week 1's column types.",
    },
    {
      question:
        "Your AUTO_INCREMENT table has ids 1–5. You DELETE the row with id 5, then INSERT a new row. What id does it get, and why?",
      answer:
        "6. The counter remembers the highest number it has ever handed out and never reuses one — a deleted id retires with its row. That's deliberate: old numbers might still be written down somewhere (a receipt, a reference), and reusing them would point those records at the wrong row.",
    },
    {
      question: "After an UPDATE, MySQL says '0 row(s) affected' with a green circle. Is that an error?",
      answer:
        "No — the statement was valid; the WHERE simply matched no rows. It's a quiet miss: the only sign is the count. Errors mean 'I don't understand you'; 0 rows affected means 'I understand, and nobody matched'.",
    },
  ],
  status: "available",
};
