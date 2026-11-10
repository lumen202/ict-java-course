import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit3Week9: Week = {
  slug: "unit3-week9",
  unit: "Unit 3 · REST APIs with Spring Boot",
  title: "Week 9 — Edit and cancel from your pages",
  summary:
    "Your canteen can read and it can add. This week it learns the other two verbs: PUT changes a row and DELETE removes one. Each day has two parts. In Part 1 you write the SQL (UPDATE … WHERE and DELETE … WHERE), then the endpoint, and you build every one twice: the first version answers 200 or 204 for a row that was never there, and the second uses the number that JdbcClient's .update() returns to tell the truth with a 404. In Part 2 a page uses it: one that edits a snack, a Change box on every row of the orders board, a Cancel button, a Remove button, and a staff page for today's special. On Thursday MySQL's foreign key says no to removing a snack that has been sold, your app turns that refusal into a 409 with a sentence, and you learn why switching the wall off is never the answer. By Friday your pages add, change, cancel and remove, and you hit the problem the next week is for: a snack that has ever been sold can't leave the menu without erasing its history.",
  objectives: [
    "Change a row with UPDATE … SET … WHERE in SQL and through PUT /api/snacks/{id} and /api/orders/{id}, sending the new values as JSON and reading the row back",
    "Use the number .update() returns: 0 rows is a planned 404, and a PUT that changes nothing is still a 200, because the count is rows matched",
    "Leave the right columns alone: a change to a quantity must not touch the price paid, and a sale with no snack is not an order",
    "Remove a row with DELETE … WHERE and through DELETE /api/orders/{id}, answering 204 with no body, and keep a WHERE that says exactly which rows",
    "Practise the dangerous statement on a copy of a table, and preview every DELETE with a SELECT that has the same WHERE",
    "Read MySQL's foreign-key refusal (Error 1451) and turn it into a planned 409, and remove things in the right order: children first, then the parent",
    "Read the address bar with URLSearchParams and call fetch with method PUT and DELETE, checking response.ok for answers with a body and response.status for a 204 that has none",
    "Build pages that edit, cancel, remove and change today's special, asking the app for the list again after every write",
  ],
  video: {
    title: "Spring PUT and DELETE, SQL UPDATE and DELETE, and fetch: short videos from several channels",
    playlistUrl: "https://www.youtube.com/results?search_query=spring+boot+put+delete+rest+api",
    watchNotes: [
      "No single playlist covers PUT and DELETE with Spring's JdbcClient and plain JavaScript, so this week's videos come from several channels, each picked for one idea. They use different tools than you. These notes say what to do differently, so read them before Day 1. Four days have a video, Friday has none.",
      "Some videos are only partly assigned. Each day's practice says which minutes to watch and where to stop. Several videos also show a mistake on purpose, or one that a beginner could copy: those places are named too, and you must not type along there.",
      "Every day has two parts. Part 1 follows the videos and builds the Java. Part 2 comes after Part 1's checkpoint and builds a page with its own checkpoint, in the same project. Do Part 1 completely before Part 2.",
      "Videos use Postman, Gradle, IntelliJ, a repository class, or JPA. You use the browser console, Maven, VS Code, and JdbcClient with plain SQL, as in Week 8. Skip anything that adds an @Entity or extends JpaRepository.",
      "Videos use named parameters like :employeeId. You use question marks and .param(…) in the order of the marks, exactly as in Week 8. Both work; one style at a time.",
      "Some videos set statuses with ResponseEntity. You use  throw new ResponseStatusException(…)  and  @ResponseStatus(…),  which you have used since Week 7. The statuses are the same.",
      "One video calls response.json() after a DELETE. That works only on his fake practice site. Your app answers a DELETE with a 204 and nothing in it, and response.json() on nothing is an error. Day 3 shows it.",
      "One video turns the foreign-key check off with SET FOREIGN_KEY_CHECKS = 0 to force a DELETE through. Never copy that: it leaves rows that point at something that no longer exists. Day 4 says where to stop watching.",
      "Never run an UPDATE or a DELETE without checking its WHERE first. The week's practice runs on a snack of your own and on a copy of a table, never on rows you want to keep.",
      "Never paste application.properties anywhere. When you must show the file, show the line with a placeholder. Close its tab before a screenshot.",
      "After EVERY change to a .java file, restart the app: the red square to stop, then Run above main. A change to a page file (.html or .js) needs only Ctrl+Shift+R. Changes to SQL in SQLTools need no restart at all.",
      "If Run ever shows 'Build failed, do you want to continue?' with the buttons Continue, Always Continue and Fix..., never click Continue or Always Continue: both start the app with the broken code, and then every test of your new endpoint answers 405. Click Fix... or close the message, fix every red error in the Problems panel (Ctrl+Shift+M), and run again.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "Spring Framework reference — Mapping Requests (@PutMapping, @DeleteMapping)",
      url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html",
      note: "Days 1 to 3: the list of HTTP method shortcuts (@GetMapping, @PostMapping, @PutMapping, @DeleteMapping) and the URI patterns section for {id}. A long page: you need only those two parts.",
    },
    {
      label: "Spring API docs — JdbcClient.StatementSpec",
      url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/simple/JdbcClient.StatementSpec.html",
      note: "Days 1 to 5: find update() and read what it returns: the number of rows affected. It is the number the whole week is built on.",
    },
    {
      label: "Spring API docs — ResponseStatusException",
      url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/server/ResponseStatusException.html",
      note: "Days 1 to 4: the constructor you have used since Week 7, ResponseStatusException(HttpStatusCode, String). Read the first paragraph.",
    },
    {
      label: "Spring API docs — DataIntegrityViolationException",
      url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/dao/DataIntegrityViolationException.html",
      note: "Day 4: what Spring throws when the database refuses a write because it would break a rule, such as a foreign key. Read the class description.",
    },
    {
      label: "MySQL reference — UPDATE Statement",
      url: "https://dev.mysql.com/doc/refman/8.0/en/update.html",
      note: "Days 1 and 2: the first syntax block, and the paragraph that says that without a WHERE clause every row is updated. A long page: read the beginning.",
    },
    {
      label: "MySQL reference — DELETE Statement",
      url: "https://dev.mysql.com/doc/refman/8.0/en/delete.html",
      note: "Days 3 to 5: the single-table syntax, and the sentence that says that without a WHERE clause all rows are deleted. A long page: read the beginning.",
    },
    {
      label: "MySQL reference — FOREIGN KEY Constraints",
      url: "https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html",
      note: "Day 4: search the page for 'Referential Actions'. RESTRICT and NO ACTION are the default: deleting a parent row that has children is refused. CASCADE is described there too; Day 4 says why not to use it here.",
    },
    {
      label: "MySQL reference — Server Error Message Reference",
      url: "https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html",
      note: "Day 4: search the page for 1451 (ER_ROW_IS_REFERENCED_2), the number of the refusal, and for 1452, its mirror image from Week 8. A very long page: search it, don't read it.",
    },
    {
      label: "MDN — PUT request method",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT",
      note: "Days 1 and 2: PUT creates or replaces the thing at an address, and why sending it twice leaves the same result.",
    },
    {
      label: "MDN — DELETE request method",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/DELETE",
      note: "Days 3 and 4: the first paragraph, and the list of successful answers (200, 202 and 204).",
    },
    {
      label: "MDN — 204 No Content",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204",
      note: "Days 3 to 5: a success with no body, which means there is nothing for response.json() to read.",
    },
    {
      label: "MDN — Using the Fetch API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      note: "Days 2 to 5: read 'Setting the method', 'Setting a body', 'Setting headers' and 'Checking that the fetch was successful' (response.ok).",
    },
    {
      label: "MDN — URLSearchParams",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams",
      note: "Day 1, Part 2: the intro and the get() example, for reading ?id=90 from the address bar.",
    },
  ],
  activity: {
    title: "Edit and cancel from your pages",
    goal: "Your canteen-web project changes and removes rows in your own MySQL ledger through PUT and DELETE endpoints. Every address, status code and JSON key from last week is the same, and five pages of your own add, change, cancel and remove: edit-snack.html, the orders board, and special.html among them.",
    steps: [
      "Day 1: PUT /api/snacks/{id} with UPDATE … WHERE, built twice (the first version lies about a missing snack, the second uses the count). Part 2: edit-snack.html, opened as edit-snack.html?id=90.",
      "Day 2: PUT /api/orders/{id} that changes only qty and keeps the price paid. Part 2: a number box and a Change button on every row of orders.html.",
      "Day 3: DELETE /api/orders/{id} with a 204, after practising the WHERE habit on a copy of sales. Part 2: a Cancel button on every row, with a question first.",
      "Day 4: DELETE /api/snacks/{id}, the foreign-key wall and a planned 409, then a gauntlet on a shop you have never seen. Part 2: a Remove button on the edit page.",
      "Day 5: PUT and DELETE /api/special, the audit and the hand-in. Part 2: special.html.",
    ],
    twist:
      "A snack named after you goes through every verb of the week on pages you built: you add it, edit it, order it, change the order, are refused when you try to remove it, cancel the order, and remove it. The refusal is a sentence from your own Java, and the number in it is one only you chose.",
    deliverables: [
      "A screenshot of the edit page's last line and of SQLTools showing your snack gone (never of application.properties)",
      "Your app's JSON answers, pasted into the checkpoints",
      "The self-check, the audit and the exit tickets",
    ],
  },
  selfCheck: [
    {
      question: "What does JdbcClient's .update() return, and what do the first versions of PUT and DELETE do wrong because they ignore it?",
      answer:
        "It returns the number of rows the statement matched (for a DELETE, removed). A statement that matches nothing is not an error, so a first version that never looks at the number answers 200 or 204 for a snack, an order or a special that was never there. The fixed versions keep the number and throw a 404 when it is 0.",
    },
    {
      question: "A PUT sets a snack's name and price to the values it already has. Why is the answer 200 and not 404?",
      answer:
        "Through JdbcClient and this driver the count is rows MATCHED by the WHERE, so the row counted even though nothing differed. 404 means 'no such row', and the row exists. (The mysql command-line client reports 'Rows matched: 1  Changed: 0' for the same statement.)",
    },
    {
      question: "Why does PUT /api/orders/{id} change only qty, and why does the SQL say AND snack_id IS NOT NULL?",
      answer:
        "The snack, the day and the price paid were true when the sale was made, and only the count was wrong; the total isn't stored, so it follows by itself. The guard keeps PUT in step with GET: a sale with no snack isn't an order (GET answers 404), and without the guard the UPDATE would change it and then answer 404 for a row it had just changed.",
    },
    {
      question: "What does a DELETE with no WHERE do, and what is your routine before any DELETE?",
      answer:
        "It removes every row of the table, with no question asked and no undo. The routine: write the SELECT with the same WHERE first and read its rows, check the WHERE compares the right column, and practise anything new on a copy of the table. A WHERE that names the wrong column is as dangerous as none (WHERE snack_id = … would remove every special a snack ever had), which is why PUT and DELETE on a special name one special_id.",
    },
    {
      question: "A successful DELETE answers 204. What is in the body, and what mistake does a page make with it?",
      answer:
        "Nothing: a 204 has no body. A page that calls response.json() on it gets 'SyntaxError: Unexpected end of JSON input' although the delete worked. The page checks response.status === 204 and writes its own sentence, and reads JSON only for the answers that have some.",
    },
    {
      question: "Why does deleting Kutsinta answer 409 and not 500, and what produced the sentence?",
      answer:
        "MySQL refuses with Error 1451 because sales point at the snack, and Spring turns that into a DataIntegrityViolationException. Uncaught it is a 500 with part of your SQL; deleteSnack's catch throws a ResponseStatusException with CONFLICT and the sentence 'Snack N is used by a sale or a special', which the page shows word for word.",
    },
    {
      question: "In what order do you remove a snack that has been sold, why is SET FOREIGN_KEY_CHECKS = 0 never the answer, and what is the honest problem?",
      answer:
        "Children first (cancel its sales), then the parent. Switching the check off lets the parent go and leaves sales that point at nothing, which every JOIN silently drops. The honest problem: a snack that has ever been sold can't be removed without erasing the history of its sales, so the menu needs a way to hide a snack and keep its row.",
    },
    {
      question: "Why does the orders board call loadOrders() after every change and cancel?",
      answer:
        "A page shows what it last fetched. After a write that list is out of date, so the page asks the app again and draws the truth: the new quantity and total, or the row gone. A second tab that didn't ask again gets the app's 404 when it tries to cancel an order that is already gone: the app telling the truth to a stale page.",
    },
    {
      question: "How does PUT /api/special find the row to change, and why not WHERE snack_id = 90?",
      answer:
        "GET /api/special doesn't send the special_id, so the app first SELECTs the newest special_id (ORDER BY special_id DESC LIMIT 1, read with .query(Integer.class)), throws a 404 if there is none, and UPDATEs that row by its id. A WHERE on snack_id would change every special that snack ever had; the primary key names exactly one row.",
    },
  ],
  status: "available",
};
