import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit3Week8: Week = {
  slug: "unit3-week8",
  unit: "Unit 3 · REST APIs with Spring Boot",
  title: "Week 8 — Your canteen ledger behind your API",
  summary:
    "For three weeks your canteen's snacks and orders lived in Java lists, and every restart forgot them. This week the lists go and your own MySQL ledger from Weeks 2 to 4 takes their place. Every day has two parts. In Part 1 your app asks MySQL for the menu, finds one snack with a ? in the SQL, writes each order into your sales table, and reads the orders back with a JOIN, with every address, status code and JSON key staying exactly as it was. In Part 2 you build more on top: a staff page that shows the raw sales table, a search box and a safe sort, a page that adds a snack, a ledger that remembers the price each customer paid, and today's special, built through every layer from a SQL table to your home page. By Friday a browser asks your app, your app asks MySQL, and an order you placed is still there after you restart: Week 4's client and server, joined to Weeks 5 to 7's web pages and API, finally one program.",
  objectives: [
    "Connect a Spring Boot app to your own MySQL database with two dependencies and three properties, and read the four ways that connection fails in a web app",
    "Read rows with JdbcClient: .sql(…), .query(Snack.class).list(), and a record whose field names match the columns",
    "Pass values with ? and .param(…), and show on the web why gluing user text into SQL is never done",
    "Turn 'no row' into a planned 404 with .optional().orElseThrow(…), and a refused or missing value into a 400 or 404 before anything is written",
    "Write a row with INSERT and recover its generated id with a KeyHolder, with the date filled in by MySQL",
    "Read the ledger back with a JOIN, rename columns with AS and calculate a total in SQL, without changing a single page",
    "Search with LIKE, and let a customer choose a sort without ever letting their words into your SQL (a whitelist)",
    "Add a row from a page with a second INSERT, refuse bad input with 400, and turn a duplicate key into a planned 409",
    "Keep the price paid with each sale (a new column and COALESCE), so history doesn't change when a price does",
    "Build one feature through every layer: a table, a record and endpoint, and the page that shows it",
  ],
  video: {
    title: "Spring JdbcClient and MySQL: a short track from several channels",
    playlistUrl: "https://www.youtube.com/results?search_query=spring+boot+jdbcclient+mysql",
    watchNotes: [
      "Bro Code and Java Code Junkie don't cover Spring and MySQL together, so this week's videos come from several channels, each picked for one idea. They use different tools than you. These notes say what to do differently, so read them before Day 1. Four days have a video, Friday has none.",
      "Some videos are only partly assigned. Day 2: watch the first 7 minutes. Day 3: watch the first 15 minutes. Each day's practice says where to stop. Everything after that is a different way of doing the same thing, and you will not use it.",
      "Every day has two parts. Part 1 follows the videos. Part 2 comes after Part 1's checkpoint and builds something you can use: a new page or endpoint with its own checkpoint, in the same project. Do Part 1 completely before Part 2.",
      "Skip anything about JPA. If a video adds spring-boot-starter-data-jpa, writes @Entity or @Table on a class, makes an interface that extends JpaRepository, or sets spring.jpa.hibernate.ddl-auto, that is a different way of talking to MySQL. This course uses plain SQL with JdbcClient on purpose, so you can see every query.",
      "Older videos use JdbcTemplate, and its longer, clumsier code. Newer ones, and these, use JdbcClient, which Spring added in version 6.1. If you see jdbcTemplate.queryForObject or a RowMapper class, the idea is the same, but you write the shorter  jdbc.sql(…).query(Snack.class).list().",
      "Several videos use named parameters:  WHERE id = :id  with  .param(\"id\", id).  You use question marks and  .param(id),  in the order of the marks, like Week 4's setInt(1, …). Both work; one style at a time.",
      "Old videos name the driver  mysql-connector-java  and set  spring.datasource.driver-class-name=com.mysql.jdbc.Driver.  In Spring Boot 4 the library is called mysql-connector-j, and you don't set a driver class at all: the url tells Spring which driver to use. Day 1 gives you the exact two blocks to paste.",
      "Videos use Gradle, IntelliJ, Postman, DBeaver, or MySQL Workbench. You use Maven (pom.xml), VS Code, the browser console, and SQLTools. Don't switch tools. Type along in your own project.",
      "Never paste application.properties anywhere. After Monday it holds your MySQL password. When you must show the file, show the line with a placeholder. Close its tab before a screenshot.",
      "After EVERY change to a .java file or to application.properties, restart the app: the red square to stop, then Run above main. Changes to SQL in SQLTools need no restart at all, which is the point of the week.",
      "If Run ever shows 'Build failed, do you want to continue?' with the buttons Continue, Always Continue and Fix..., never click Continue or Always Continue: both start the app with the broken code, and Always Continue also makes VS Code stop asking for good. Click Fix... or close the message, fix every red error in the Problems panel (Ctrl+Shift+M), and run again.",
      "The first Run after you edit pom.xml downloads libraries and can take a minute or two on the lab's internet. Wait for the status bar to stop saying Importing or Downloading before you judge the red underlines.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "Spring Framework reference — JDBC Core, including JdbcClient",
      url: "https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html",
      note: "Days 1 to 4: the official page for JdbcClient. Search the page for 'JdbcClient' and read the examples for .sql, .param, .query and .update. A long page: you need only that part.",
    },
    {
      label: "Spring Boot reference — SQL Databases: Configure a DataSource",
      url: "https://docs.spring.io/spring-boot/reference/data/sql.html",
      note: "Day 1: why three lines in application.properties are enough, and what Spring Boot builds from them. Read 'Configure a DataSource' and 'Connection to a Production Database'.",
    },
    {
      label: "Spring API docs — JdbcClient",
      url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/simple/JdbcClient.html",
      note: "Days 2 and 3: every method you used and a few you didn't. Find sql(), the StatementSpec methods param(), query() and update(), and the ResultQuerySpec methods list() and optional().",
    },
    {
      label: "Spring API docs — KeyHolder",
      url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/support/KeyHolder.html",
      note: "Day 3: the box that holds the id MySQL generated. Read the first paragraph and getKey().",
    },
    {
      label: "MySQL reference — Using AUTO_INCREMENT",
      url: "https://dev.mysql.com/doc/refman/8.0/en/example-auto-increment.html",
      note: "Days 1 and 3: the counter on sale_id, and why deleted (and refused) numbers aren't reused.",
    },
    {
      label: "MySQL reference — ALTER TABLE",
      url: "https://dev.mysql.com/doc/refman/8.0/en/alter-table.html",
      note: "Day 3: the MODIFY form that added AUTO_INCREMENT to sale_id. A very long page: search it for 'MODIFY [COLUMN]'.",
    },
    {
      label: "MySQL reference — JOIN Clause",
      url: "https://dev.mysql.com/doc/refman/8.0/en/join.html",
      note: "Day 4: INNER JOIN and LEFT JOIN, the Week 3 idea in the official words.",
    },
    {
      label: "MySQL reference — Problems with Column Aliases",
      url: "https://dev.mysql.com/doc/refman/8.0/en/problems-with-alias.html",
      note: "Day 4: how AS gives a result column a name. Short; read the first section.",
    },
    {
      label: "MySQL reference — Date and Time Functions",
      url: "https://dev.mysql.com/doc/refman/8.0/en/date-and-time-functions.html",
      note: "Day 3: CURRENT_DATE, the word MySQL fills in as today's date. Search the page for CURRENT_DATE.",
    },
    {
      label: "MySQL reference — Pattern Matching",
      url: "https://dev.mysql.com/doc/refman/8.0/en/pattern-matching.html",
      note: "Day 2, Part 2: LIKE and the % wildcard, in the official words. Read the first few examples; skip regular expressions.",
    },
    {
      label: "MySQL reference — Comparison Functions and Operators (COALESCE)",
      url: "https://dev.mysql.com/doc/refman/8.0/en/comparison-operators.html",
      note: "Day 4, Part 2: COALESCE returns its first value that is not NULL. Search the page for COALESCE; the entry is a few lines long.",
    },
  ],
  activity: {
    title: "The canteen ledger behind the API",
    goal: "Your canteen-web project reads and writes your own MySQL ledger through JdbcClient. Every address, status code and JSON key is the same as last week, your four pages need no change to work with the new data, and an order you place is still there after a restart.",
    steps: [
      "Day 1: pom.xml, application.properties, and GET /api/snacks from the snacks table. Part 2: GET /api/sales, the whole sales table, and a staff page ledger.html.",
      "Day 2: GET /api/snacks/{id} and ?maxPrice with ? and .param, and the lesson about gluing. Part 2: ?name= with LIKE wired to the menu's search box, and ?sort= chosen from a whitelist.",
      "Day 3: POST /api/orders as an INSERT into sales, with the new id from a KeyHolder. Part 2: POST /api/snacks with its 400s and 409, and a staff page add-snack.html.",
      "Day 4: GET /api/orders, /api/orders/{id} and /api/summary from a JOIN, and the last Java list deleted. Part 2: price_paid, so an old sale's total never moves.",
      "Day 5: /api/rows from your own Week 3 JOIN, the clean-up, the audit and the hand-in. Part 2: today's special, from a new table to your home page.",
    ],
    twist:
      "Your tables page, tables.html, draws rows that come straight from YOUR Week 3 tables in YOUR MySQL through a query you wrote, with tables.js untouched. Nobody else's app has that endpoint, because nobody else has your tables.",
    deliverables: [
      "Screenshots of your menu and of an order for a snack you added from your own page, which exist only in your MySQL ledger (never of application.properties)",
      "Your app's JSON answers, pasted into the checkpoints",
      "The self-check and the exit tickets",
    ],
  },
  selfCheck: [
    {
      question: "Your app starts normally, but /api/snacks answers 500 'Failed to obtain JDBC Connection'. Where do you look for the cause, and what are the three likeliest answers?",
      answer:
        "In the terminal, on the line after 'with root cause'. Likely: 'Access denied for user … (using password: YES)' means the username or password is wrong; 'Unknown database' means the name at the end of spring.datasource.url is wrong; 'Connection refused' means nothing is listening at that port, so MySQL is stopped or the port is wrong.",
    },
    {
      question: "Why is  WHERE name = ?  with  .param(name)  safe, and  WHERE name = '\" + name + \"'  not?",
      answer:
        "With a ?, the value travels separately and can only ever be a value. Glued into the string, a customer's text becomes part of the SQL itself: a stray apostrophe breaks the query, and  x' OR '1'='1  rewrites its WHERE so every row matches. Week 4's injection, on the web.",
    },
    {
      question: "Why does getSnack check the snack before placeOrder inserts the sale, when the foreign key would refuse an unknown snack anyway?",
      answer:
        "The foreign key is the last guard and protects the data from every program. The app's own check gives the customer a clear 404 'No snack with id 99' instead of a 500 that shows part of your SQL, and nothing is written for a refused order.",
    },
    {
      question: "You place an order, restart the app, and the order is still there. What changed since Week 7, and where does the order number come from?",
      answer:
        "The order is a row in your sales table, not an item in a Java list, so the app's lifetime and the ledger's differ. The number is the sale_id MySQL generated with AUTO_INCREMENT, handed back by a KeyHolder. It is the counter's next number, which usually is one more than your highest sale_id, but deleted sales and refused INSERTs (a failed foreign key still uses up a number) leave gaps.",
    },
    {
      question: "The sales table doesn't store a total, yet every order has one. Where does it come from, and why not store it?",
      answer:
        "The SELECT calculates it: qty times a price, labelled AS total so the record's total field can match it. With today's price it would rewrite history whenever a price changed, which is why real ledgers store the price paid with each sale: your total uses COALESCE(sales.price_paid, snacks.price), the stored price when there is one and today's price for older sales that have none.",
    },
    {
      question: "The orders board shows sales from Week 3 that you never placed from the website, and one sale is missing. Why?",
      answer:
        "The board shows the whole sales table joined to snacks, and your Week 3 and 4 sales are rows of the same ledger. The one that is missing has snack_id NULL: an INNER JOIN keeps only sales that have a snack, so it isn't an order and /api/orders/{its id} answers 404.",
    },
    {
      question: "Why can a search use LIKE ? with .param(\"%\" + name + \"%\"), but a sort cannot use ORDER BY ? ?",
      answer:
        "A ? stands for a VALUE, and the % marks are glued onto a value, so the customer's text can only ever be compared. The column in ORDER BY is part of the SQL's structure: ORDER BY ? runs without an error and sorts by nothing. A safe sort picks between complete fixed SQL strings you wrote, with an if, and answers 400 to any other word (a whitelist).",
    },
    {
      question: "POST /api/snacks gets a snack number that already exists. What does the customer get, and what produced it?",
      answer:
        "409 Conflict with 'Snack N already exists'. MySQL refuses the INSERT with its duplicate-key error (1062), Spring turns it into a DuplicateKeyException, and addSnack catches it and throws a ResponseStatusException with CONFLICT. The page shows the message word for word.",
    },
    {
      question: "How does today's special get from a table to the home page, and which layers did you build?",
      answer:
        "The specials table holds the offer (snack number and special price). The Special record and GET /api/special read the newest row, JOINed to snacks for the name and normal price, and answer 404 'No special today' when there is no row. index.js fetches /api/special, checks response.ok, and writes the sentence. Change a number in the table and the page follows with no restart.",
    },
  ],
  status: "available",
};
