import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit1Week3: Week = {
  slug: "unit1-week3",
  unit: "Unit 1 · Databases & SQL",
  title: "Week 3 — Two notebooks, one truth",
  summary:
    "The school canteen keeps two notebooks — one lists the snacks, one logs every sale — and they don't agree. Some sales point at snacks that don't exist. This week you learn to LINK two tables so lies can't get in (FOREIGN KEY), then read them side by side as if they were one (JOIN) — and use that to find, and fix, every problem in the ledger. By Friday you can connect any two tables and ask them a question neither one could answer alone.",
  objectives: [
    "Declare a FOREIGN KEY … REFERENCES and explain exactly what promise it makes",
    "Read errors 1452 (a row with no parent) and 1451 (deleting a parent that's still needed) and know the fix for each",
    "Write an INNER JOIN … ON with properly qualified table.column names",
    "Choose INNER, LEFT, or RIGHT JOIN for a question, and explain where rows vanish or where NULLs come from",
    "Read errors 1052 (ambiguous column) and 1054 (unknown column) and know the fix for each",
    "Clean a messy child table by hunting with a LEFT JOIN, repairing what you find, then locking it with a FOREIGN KEY",
  ],
  video: {
    title: "Bro Code — MySQL tutorial for beginners 🐬",
    playlistUrl:
      "https://www.youtube.com/playlist?list=PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ",
    watchNotes: [
      "Only about 13 minutes of video all week — on purpose. Linking and reading two tables together is learned by doing it on real, messy data, not by watching.",
      "Type along with every video in your own Workbench sandbox before you touch your real tables.",
      "Slowing a video to 0.75× and turning on captions is a smart move, not a weakness.",
      "Before you write ANY join, say out loud which table you expect to keep every one of its rows. That habit is most of this week.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "SQLBolt — lesson 6 (multi-table queries with JOINs)",
      url: "https://sqlbolt.com/lesson/select_queries_with_joins",
      note: "The doing-it-in-the-browser alternative to the videos — a short written lesson with a live practice editor, covering exactly this week's JOIN material.",
    },
    {
      label: "W3Schools — SQL Joins",
      url: "https://www.w3schools.com/sql/sql_join.asp",
      note: "Use the 'Next' button on this page to move from INNER JOIN through LEFT and RIGHT JOIN. Plain English, good for checking the exact shape of a statement mid-task.",
    },
    {
      label: "W3Schools — FOREIGN KEY",
      url: "https://www.w3schools.com/sql/sql_foreignkey.asp",
      note: "Covers Monday's idea in text: what a foreign key promises and how it's declared.",
    },
    {
      label: "DB Fiddle (browser MySQL)",
      url: "https://www.db-fiddle.com/",
      note: "Fallback: if MySQL isn't working on your computer, do the whole week here instead. Choose MySQL 8 in the top-left dropdown.",
    },
  ],
  activity: {
    title: "The concession audit",
    goal: "A canteen sales ledger — two tables of your own, properly linked with a FOREIGN KEY — audited and repaired using JOINs, with every step recorded in week3.sql.",
    steps: [
      "Build a parent/child pair of tables in your real Workbench, with the child's foreign key declared from the start.",
      "Deliberately try to break the link — insert a child row with no matching parent, and read the error it produces.",
      "Write an INNER JOIN that reads both tables as one, and a LEFT JOIN that shows you what the INNER JOIN was hiding.",
      "Find a real inconsistency in your own data using a JOIN, then repair it and lock the table with a FOREIGN KEY.",
      "Keep every statement in week3.sql with a comment above it saying why.",
    ],
    twist:
      "Design your own linked pair — not the canteen's — about something you actually care about, and write three questions about it that only a JOIN can answer. No tutorial has your questions; they have to come from you.",
    deliverables: [
      "Your complete week3.sql — every CREATE, FOREIGN KEY, JOIN and repair with a comment above each — pasted into the turn-in box",
      "The self-check and the two-minute 'where are you at?' below",
    ],
  },
  selfCheck: [
    {
      question: "What does a FOREIGN KEY actually promise, and who enforces it?",
      answer:
        "It promises that every value in the child column matches a real row in the parent table — no orphans allowed. MySQL itself enforces it: it refuses any INSERT or UPDATE that would break the promise, before the bad row ever lands.",
    },
    {
      question: "In one sentence each: what triggers Error 1452, and what triggers Error 1451?",
      answer:
        "1452 fires when you try to add or point a child row at a parent that doesn't exist. 1451 fires when you try to delete (or change the key of) a parent row that a child is still pointing at.",
    },
    {
      question: "You run SELECT snack_id FROM sales INNER JOIN snacks ON sales.snack_id = snacks.snack_id; and it fails. Why, and what's the fix?",
      answer:
        "Both tables have a column called snack_id, so 'snack_id' alone is ambiguous — MySQL can't tell which table you mean (Error 1052). Qualify it: sales.snack_id or snacks.snack_id.",
    },
    {
      question: "A sale has NULL in its snack_id column. Does the FOREIGN KEY block it?",
      answer:
        "No — a FOREIGN KEY only checks values that are actually there. NULL means 'unknown', not 'fake', so it's allowed through. That's different from a made-up id, which the key does block.",
    },
    {
      question: "An INNER JOIN between your two tables returns fewer rows than either table alone. Where did the missing rows go?",
      answer:
        "They didn't go anywhere — INNER JOIN only keeps rows that have a match on BOTH sides, so any row with no partner is left out of the result entirely, silently. A LEFT or RIGHT JOIN would have kept it, with NULLs filling in the missing side.",
    },
    {
      question: "In week3.sql, why does the parent table's CREATE TABLE statement have to come before the child's?",
      answer:
        "The child's FOREIGN KEY references the parent table, so the parent has to exist first — running the file top to bottom on an empty server would fail otherwise. It's the same 'dependencies decide the order' idea from Week 1, now enforced by the server instead of just good sense.",
    },
  ],
  status: "available",
};
