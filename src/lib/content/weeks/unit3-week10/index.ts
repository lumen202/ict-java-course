import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit3Week10: Week = {
  slug: "unit3-week10",
  unit: "Unit 3 · REST APIs with Spring Boot",
  title: "Week 10 — A site that runs entirely on your API",
  summary:
    "Last week ended on an honest problem: a snack that has ever been sold can't be removed without erasing its history. This week fixes that one and three more. On Monday a snack gets an available flag, the menu hides a retired snack in every address that builds it, and old orders still show it. On Tuesday every page that talks to your app stops copying the same ten lines and shares one file, api.js. On Wednesday staff get a list that shows everything and a page with a button on every row. On Thursday the SQL moves out of the controller into three repositories, and every check you have passes before and after. On Friday you audit the whole site for facts typed in by hand and move the last ones into the ledger. Each day has two parts: Part 1 is Java and SQL, and Part 2 is a page. By Friday a browser asks your app, your app asks your ledger, and nothing a page shows is typed into it.",
  objectives: [
    "Add a column with ALTER TABLE … ADD COLUMN … BOOLEAN NOT NULL DEFAULT TRUE, and use a flag to hide a row from the menu without deleting it",
    "Put the same rule in every SELECT that builds the menu, and leave alone the ones that read history or look up one row by its number",
    "Refuse an order for a snack that is off the menu with a planned 409, before anything is written",
    "Write one shared helper, api.js, that resolves with data, resolves with null for a 204 by checking the status, and rejects with an Error carrying the app's own sentence",
    "Refactor pages onto the helper without changing what a person sees, and prove it with the same checks as before",
    "Build a staff page with a table, a button on every row and a form, that asks the app for the list again after every write",
    "Move SQL from a controller into @Repository classes with constructor injection, one group at a time, and prove nothing changed",
    "Find data typed in by hand, move it into a table, and let an empty table be a 404 and not a hidden fallback",
  ],
  video: {
    title: "Soft delete, fetch, the DOM and a JdbcClient repository: short videos from several channels",
    playlistUrl: "https://www.youtube.com/results?search_query=spring+boot+jdbcclient+repository",
    watchNotes: [
      "No single playlist covers a soft delete, a shared fetch helper, a table built with the DOM, and a repository with JdbcClient, so this week's videos come from several channels, each picked for one idea. They use different tools than you. These notes say what to do differently, so read them before Day 1. Four days have a video, Friday has none. Two of them are short, and one is only a few minutes of a longer video: the weight of each day is in the lab.",
      "Each day's practice says which minutes to watch and where to stop. Several videos show something a beginner could copy by mistake: those places are named too.",
      "Every day has two parts. Part 1 follows the video and builds Java and SQL. Part 2 comes after Part 1's checkpoint and builds a page with its own checkpoint, in the same project. Do Part 1 completely before Part 2.",
      "Videos use Postman, Gradle, IntelliJ, JPA with @Entity and JpaRepository, axios, React, and async/await in many places. You use the browser console, Maven, VS Code, JdbcClient with plain SQL, and .then chains. Skip anything that adds an @Entity or extends JpaRepository.",
      "Videos use named parameters like :id. You use question marks and .param(…) in the order of the marks, exactly as in Week 8. Both work; one style at a time.",
      "One video says 'is deleted' where you say 'available': the opposite way round. In your table TRUE means the snack is ON the menu.",
      "One video calls res.json() on every answer, and says 'res.okay' once (the property is spelled ok). Your app answers a DELETE with a 204 and nothing in it: reading JSON from nothing is an error. Tuesday builds the helper that handles it.",
      "Never run an UPDATE or a DELETE without checking its WHERE first. This week's practice runs on a snack of your own, never on rows you want to keep.",
      "Never paste application.properties anywhere. When you must show the file, show the line with a placeholder. Close its tab before a screenshot.",
      "After EVERY change to a .java file, restart the app: the red square to stop, then Run above main. A change to a page file (.html or .js) needs only Ctrl+Shift+R. Changes to SQL in SQLTools need no restart at all.",
      "If Run ever shows 'Build failed, do you want to continue?' with the buttons Continue, Always Continue and Fix..., never click Continue or Always Continue: both start the app with the broken code. Click Fix... or close the message, fix every red error in the Problems panel (Ctrl+Shift+M), and run again.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "MySQL reference — ALTER TABLE Statement",
      url: "https://dev.mysql.com/doc/refman/8.0/en/alter-table.html",
      note: "Day 1: the syntax for ADD COLUMN. A very long page: read the first syntax block and look for ADD COLUMN.",
    },
    {
      label: "MySQL reference — Numeric Data Type Syntax",
      url: "https://dev.mysql.com/doc/refman/8.0/en/numeric-type-syntax.html",
      note: "Day 1: search the page for BOOLEAN. It says BOOL and BOOLEAN are synonyms for TINYINT(1), which is why SELECT shows 1 and 0.",
    },
    {
      label: "MDN — Response: ok property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Response/ok",
      note: "Day 2: what ok is true for (status 200 to 299), the check api.js makes for every answer that has a body.",
    },
    {
      label: "MDN — Response: status property",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Response/status",
      note: "Day 2: the number api.js compares with 204 before it reads any JSON.",
    },
    {
      label: "MDN — Error",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error",
      note: "Day 2: the first part: what new Error(message) makes, and where the message ends up (error.message).",
    },
    {
      label: "MDN — Promise.prototype.catch()",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch",
      note: "Days 2 to 5: what runs when something in a .then chain throws or is rejected, and why every page ends its chain with one.",
    },
    {
      label: "MDN — The script element",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script",
      note: "Day 2: the src attribute. Scripts run in the order of their tags: api.js goes first.",
    },
    {
      label: "MDN — Document: createElement() method",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement",
      note: "Day 3: creating the table's rows and buttons from JavaScript. The first paragraph and the first example.",
    },
    {
      label: "MDN — 204 No Content",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204",
      note: "Days 2 to 5: a success with no body, which is why api.js decides by status before reading JSON.",
    },
    {
      label: "MDN — Using the Fetch API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      note: "Days 2 to 5: 'Checking that the fetch was successful' (response.ok), 'Setting the method', 'Setting a body'.",
    },
    {
      label: "Spring Framework reference — Data access with JDBC (JdbcClient)",
      url: "https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html",
      note: "Day 4: the contents list has a section on JdbcClient. Read its first example: the same .sql(…).param(…).query(…) you have used since Week 8.",
    },
    {
      label: "Spring API docs — @Repository",
      url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/stereotype/Repository.html",
      note: "Day 4: the class description: what the annotation marks, and that classpath scanning finds it.",
    },
    {
      label: "Spring Framework reference — Classpath scanning and managed components",
      url: "https://docs.spring.io/spring-framework/reference/core/beans/classpath-scanning.html",
      note: "Day 4: the part about stereotype annotations: @Repository is one of them. A long page: read the first section.",
    },
    {
      label: "Spring Framework reference — Dependency injection",
      url: "https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html",
      note: "Day 4: 'Constructor-based dependency injection': the container passes in what a class lists in its constructor.",
    },
  ],
  activity: {
    title: "A site that runs entirely on your API",
    goal: "Your canteen-web project takes a snack off its menu without erasing it, its pages share one helper, a staff page runs the whole ledger, the SQL lives in repositories, and nothing a page shows is typed into it. Every address, status and key from last week still works.",
    steps: [
      "Day 1: the available column, the menu filter built twice (the first version misses paths), GET and PUT /api/snacks/{id}/available, and a 409 for an order on a retired snack. Part 2: a button on edit-snack.html.",
      "Day 2: api.js, built twice (the first version fails on a 204 and hides a 404), and two pages refactored onto it. Part 2: the orders board, the add page and the order form.",
      "Day 3: GET /api/staff/snacks and a StaffSnack record, so nothing else changes. Part 2: staff.html, a table with a button on every row.",
      "Day 4: three repositories, moved one group at a time with the same checks before and after, and a gauntlet on a shop you have never seen. Part 2: a summary line and a Refresh button on the staff page.",
      "Day 5: an audit for typed-in facts, a canteen_info table behind GET /api/info, the home page's hours through api.js, and the hand-in.",
    ],
    twist:
      "A snack named after you goes through the whole week on pages you built: you add it from the staff page, order it, take it off the menu (the menu loses it, a new order is refused by your own Java, and the old order stays on the board), and put it back. The number in it is one only you chose.",
    deliverables: [
      "A screenshot of the staff page showing your snack's row and, if you can, the console's answer next to it (never of application.properties)",
      "Your app's JSON answers, pasted into the checkpoints",
      "The self-check, the audit and the exit tickets",
    ],
  },
  selfCheck: [
    {
      question: "What is a soft delete, and why is it the answer to a snack that has been sold?",
      answer:
        "The row stays in the table and a column (available) says whether it counts today. A hard delete would need its sales removed first, which erases history; a soft delete hides the snack from the menu and leaves every old order, sale and ledger line readable.",
    },
    {
      question: "The first version of the filter changed one SELECT. What did it miss, and how many SELECTs build the menu?",
      answer:
        "Every other path that reads snacks for the public: ?name, ?sort=price, ?sort=name, ?maxPrice and /api/find still showed the retired snack, because each has its own SELECT. Six SELECTs build the menu (plus the two that find today's special); the JOINs for orders and sales, and the lookup by number, are left alone on purpose.",
    },
    {
      question: "Why is an order for a retired snack a 409 and not a 404, and where in placeOrder does the check sit?",
      answer:
        "The snack exists, so 404 ('no such thing') would be false; 409 says the request conflicts with the snack's state. The check sits before the INSERT, so no sale is ever written for a retired snack.",
    },
    {
      question: "What are the two mistakes of the first api.js, and what does the finished one do about each?",
      answer:
        "It read JSON from every answer, so a 204 (no body) failed with a SyntaxError although the delete had worked; and it handed a 404's error body back as if it were data, so a page wrote 'Saved: undefined'. The finished helper returns null for a 204 by checking the status first, and throws an Error with the app's message for any answer that isn't ok.",
    },
    {
      question: "Why does every page that writes call the list function again afterwards?",
      answer:
        "A page shows what it last fetched. After a write that list is out of date, so the page asks the app again and draws the truth; it can't get out of step with the ledger, and a second tab that didn't ask gets the app's own sentence when it tries something stale.",
    },
    {
      question: "Why is the staff list at /api/staff/snacks with its own record StaffSnack?",
      answer:
        "/api/snacks/staff would be taken by /api/snacks/{id}, which reads the word staff as a snack number (a 400 about the id, observed). And adding a field to Snack would change every answer that returns a Snack; a second record changes only the new endpoint.",
    },
    {
      question: "What does a repository hold and what does the controller keep, and how do you prove a split changed nothing?",
      answer:
        "A repository holds the SQL and the JdbcClient and returns facts (a list, an Optional, a count). The controller keeps the addresses, the checks and every status. You prove nothing changed by running the same checks before and after, and you prove the controller holds no SQL by searching the project for jdbc.sql.",
    },
    {
      question: "What happens at startup if a repository has no @Repository, and why must update() or delete() return exactly the count it got?",
      answer:
        "The app does not start: the controller's constructor required a bean of that type that could not be found. A repository that returns the wrong count (for example always 1) lets the controller answer 204 for a snack that never existed.",
    },
    {
      question: "Why is an empty canteen_info a 404, and why is .orElse(new CanteenInfo(…)) the wrong fix?",
      answer:
        "An empty table means there is no such thing, which is a 404 with a sentence, like a missing snack. A typed-in fallback would answer 200 with hours nobody stored: the hard-coded data is back, hiding behind the table, and nobody would ever learn the table was empty.",
    },
  ],
  status: "available",
};
