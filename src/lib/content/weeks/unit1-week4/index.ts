import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit1Week4: Week = {
  slug: "unit1-week4",
  unit: "Unit 1 · Databases & SQL",
  title: "Week 4 — The ledger goes live",
  summary:
    "Aling Nena's canteen ledger is clean, locked and correct — and completely useless to her, because she is never going to open MySQL Workbench. This week you write the program that stands between her and the database: Java asks the questions, MySQL answers, your code turns the answer into something a person can read. By Friday you have a working canteen app doing real reads and real writes over JDBC — and you'll know why the safe way to send a value is the only way you'll ever use again.",
  objectives: [
    "Connect a Java program to MySQL with a JDBC URL, and read the four ways that connection can fail",
    "Manage a Connection, Statement and ResultSet with try-with-resources, and say why an empty catch block is the worst line in the file",
    "Walk a ResultSet with while (rs.next()) and read columns by label, including the NULL trap",
    "Send values with PreparedStatement placeholders, and demonstrate the SQL injection that string concatenation allows",
    "Run INSERT, UPDATE and DELETE from Java, read the affected-row count, and recover an AUTO_INCREMENT id",
    "Catch a foreign key violation in Java and identify it by the same MySQL error code you learned in week 3",
  ],
  video: {
    title: "Java Code Junkie — JDBC for Beginners",
    playlistUrl: "https://www.youtube.com/playlist?list=PL3bGLnkkGnuXZeK5Rbp55AcuWhz4RuMZ1",
    watchNotes: [
      "A new instructor this week — Bro Code's course stops before databases, so the video track moves to Java Code Junkie's five-part JDBC series. Same shape as before: one short video, then hours of your own typing.",
      "About 44 minutes of video across the whole week, and none at all on Friday. Day 2 has two because Statement and ResultSet are one idea in two halves.",
      "**JDBC is old, and so is most of the internet's advice about it.** If any video you watch — these or any other — starts with Class.forName(\"com.mysql.jdbc.Driver\"), you can skip that line: drivers have registered themselves automatically since 2007. Day 1's quest explains why it's still in so many tutorials.",
      "Same for cleanup. If a video closes its Connection, Statement and ResultSet by hand at the end, watch it once and then write it OUR way — try-with-resources, which also closes them when something throws. That difference is the whole of Day 1's last puzzle.",
      "And if a video builds SQL by gluing a variable into the string with +, stop and notice it. On Wednesday you will attack exactly that code and break into your own database with it.",
      "Type along in your own editor, always. Never paste. The point of a JDBC video is the shape of the code, and the shape only sticks through your fingers.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "MySQL Connector/J — Connecting to MySQL using JDBC",
      url: "https://dev.mysql.com/doc/connector-j/en/connector-j-usagenotes-connect-drivermanager.html",
      note: "The official page for exactly what Day 1 does, from the people who wrote the driver. Short, current, and the authority when a tutorial disagrees with it.",
    },
    {
      label: "Oracle's JDBC Basics tutorial — Processing SQL Statements",
      url: "https://docs.oracle.com/javase/tutorial/jdbc/basics/processingsqlstatements.html",
      note: "The text alternative to this week's Days 2–4: statements, result sets, and what to close when. Written by the people who define JDBC itself.",
    },
    {
      label: "Oracle — Using Prepared Statements",
      url: "https://docs.oracle.com/javase/tutorial/jdbc/basics/prepared.html",
      note: "Wednesday's whole lesson in one page. Read it before the lab if you want the reference version first.",
    },
    {
      label: "OWASP — SQL Injection Prevention Cheat Sheet",
      url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
      note: "Why Wednesday matters outside this classroom. Read the first section — 'Use of Prepared Statements' — and notice that it is the FIRST defence listed, not one of many.",
    },
    {
      label: "MySQL — Server Error Message Reference",
      url: "https://dev.mysql.com/doc/mysql-errors/en/server-error-reference.html",
      note: "Look up any number e.getErrorCode() hands you. 1045, 1049, 1451, 1452 are all in here, and they mean the same thing in Java as they did in Workbench.",
    },
  ],
  activity: {
    title: "The canteen app",
    goal: "A small Java program that connects to your own locked ledger, reads it, and writes to it safely — every query sent with a PreparedStatement, every failure reported with its MySQL error code.",
    steps: [
      "Connect: one Java class that opens a connection to your school database and proves which database it reached.",
      "Read: send a query, walk the ResultSet, and print a result a person could actually read.",
      "Send values safely: take an input, pass it as a placeholder, and show what the string-concatenation version would have allowed.",
      "Write: insert a sale from Java, read back how many rows changed, and recover the id the server generated.",
      "Handle the refusals: make your own foreign key fire from Java, catch it, and report it by error code.",
    ],
    twist:
      "Point your program at the pair of tables YOU designed in week 3 — not the canteen's — and give it one screen that answers a question only you would think to ask about your own data. Nobody else's program can produce your output.",
    deliverables: [
      "Your .java file(s), pasted into the turn-in box",
      "The self-check and the two-minute 'where are you at?' below",
    ],
  },
  selfCheck: [
    {
      question: "Your program throws 'No suitable driver found'. What is wrong, and what do you still know nothing about?",
      answer:
        "The Connector/J jar isn't on the classpath. Nothing else has been tested — the driver never opened a socket, so the server, the port, your username, your password and the database name are all still unverified.",
    },
    {
      question: "Why does e.getErrorCode() return 0 for some failures and 1045 or 1452 for others?",
      answer:
        "The numbered codes come from MySQL itself, so getting one proves the server received your request and answered it. A 0 means the message came from the driver instead — nothing on the other end ever replied, which points at the server being down, the wrong port, or a missing driver.",
    },
    {
      question: "What is the difference between executeQuery and executeUpdate?",
      answer:
        "executeQuery is for SELECT and hands back a ResultSet to walk. executeUpdate is for INSERT, UPDATE and DELETE and hands back an int — the number of rows changed. Calling the wrong one for the statement you wrote is an exception, not a silent mistake.",
    },
    {
      question: "Why is a PreparedStatement with placeholders safer than building the same SQL with + ?",
      answer:
        "With placeholders the SQL is sent to the server once, as a fixed shape, and the values travel separately — so a value can never be read as more SQL. Concatenation produces one string where a value containing quotes or a semicolon becomes part of the command itself, which is exactly what SQL injection is.",
    },
    {
      question: "Your program inserts a sale whose snack_id doesn't exist. What happens, and where?",
      answer:
        "The server refuses it and the driver raises a SQLException carrying error code 1452 — the same foreign key violation you triggered by hand in week 3. The check happens on the server, not in your Java code; the lock protects the table no matter which program is talking to it.",
    },
    {
      question: "Why should everything be inside try-with-resources rather than closed by hand at the end?",
      answer:
        "A hand-written close() on the last line only runs when nothing goes wrong — and the failure path is exactly when you most need the connection released. try-with-resources closes on both paths, including when an exception is thrown.",
    },
  ],
  status: "available",
};
