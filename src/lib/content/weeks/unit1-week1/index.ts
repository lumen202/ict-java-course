import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

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
    days: [day1, day2, day3, day4, day5],
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
