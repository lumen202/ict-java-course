// unit3-week8 · Day 2, Part 2 — "search and sort, safely"
//
// The day's required work took a fast student about an hour (reviews, 2026-10-28),
// so Day 2 continues with two features built on the same ? lesson:
//  - GET /api/snacks?name=… with LIKE ? and the % marks added in JAVA (the value
//    is still a value), wired to the menu page's search box;
//  - GET /api/snacks?sort=price|name: ORDER BY cannot take a ?, so the day teaches
//    a WHITELIST: an if-chain that picks one of two fixed SQL strings and answers
//    400 to anything else. The glued version is attacked first, to show why.
// LIKE is not taught anywhere in Unit 1 (grep of unit1-week*), so mission 1 teaches
// it as a small new idea. ORDER BY and LIMIT are Unit 1 skills.
// Observed on a real Spring Boot 4.1.1 + MySQL 8.0 build:
//  - name LIKE ? with .param("%" + name + "%"): ?name=utsin and ?name=UTSIN both
//    find Kutsinta (MySQL's default comparison ignores capitals); ?name= (empty) and a
//    customer-typed % or _ match every snack; Aling's → [] (200); the attack text
//    x' OR '1'='1 → [] (200), because it is still only a value;
//  - LIKE '%?%' with .param(name) → 500 "Parameter index out of range (1 > number of
//    parameters, which is 0)"; LIKE ? with no % marks matches the whole name only;
//  - glued ORDER BY: by=price and by=name sort; by=price DESC works; by=RAND() shuffles;
//    by=(SELECT COUNT(*) FROM sales) runs a subquery; by=nope → 500 "bad SQL grammar";
//    by=price; DROP TABLE snacks → 500 (the driver refuses a second statement, which is
//    luck, not a defence);
//  - ORDER BY ? with .param(by): 200 and the plain snack_id order whatever by is;
//  - the whitelist: sort=price → 200 sorted by price; sort=name → 200 sorted by name;
//    sort=price DESC, sort=bogus, sort=price; DROP TABLE snacks and an empty sort → 400
//    "sort must be price or name"; with both name and sort sent, the name branch wins;
//  - menu.js with fetch("/api/snacks?name=" + encodeURIComponent(…)) filters on the
//    server: one request per keystroke (real Chrome, Network list).

import type { DayGame } from "../../types";
import {
  CONTROLLER_D2,
  LAB_SNACK,
  LIST_SNACKS_D2B,
  LIST_SNACKS_NAME,
  MENU_SEARCH_NEW,
  MENU_SEARCH_OLD,
  SORT_BRANCH,
  SORT_GLUED,
  SORT_QMARK,
} from "./snippets";
import { MENU_SEARCH_COMMAND, SEARCH_SAFE_COMMAND, SORT_COMMAND } from "./commands";

const SQL = "Ctrl+E, then Ctrl+E again";

export const day2Part2: DayGame[] = [
  {
    kind: "quest",
    id: "p2-lab-search-sort",
    inline: true,
    title: "🛠️ Part 2 · Lab: a search box that asks MySQL, and a sort that can't be hijacked",
    intro:
      "Part 1 kept every customer's text out of your SQL with a ?. Part 2 builds two features on that rule: a search by part of a name, and a sort chosen by the customer. The second one is where a ? cannot help, which is the most useful security idea of the week. Restart after every change to a .java file; a page file needs only Ctrl+Shift+R.",
    missions: [
      {
        task:
          "One new SQL idea: LIKE. WHERE name = 'Kutsinta' needs the whole name. WHERE name LIKE 'Kut%' needs only a pattern, where % means 'anything at all, including nothing'. In queries.sql run these three, one at a time (" +
          SQL +
          ") and write in notes.md which snacks each one returns:\n\nSELECT snack_id, name, price FROM snacks WHERE name LIKE 'Kut%';\n\nSELECT snack_id, name, price FROM snacks WHERE name LIKE '%a';\n\nSELECT snack_id, name, price FROM snacks WHERE name LIKE '%ut%';\n\nThen run the third again with capital letters: '%UT%'.",
        hint:
          "'Kut%' means starts with Kut; '%a' means ends with a; '%ut%' means contains ut anywhere. Kutsinta contains ut, and so may other names in your table. MySQL's normal comparison ignores capital letters, so '%UT%' returns the same rows as '%ut%'.",
        check: {
          question: "What does  WHERE name LIKE '%ut%'  keep?",
          choices: [
            "Names that start with ut",
            "Names that contain the letters ut anywhere",
            "Names that are exactly %ut%",
          ],
          answer: 1,
          explain: "% before and after means 'anything may come before, and anything may come after'. A % only at the end means 'starts with', and only at the start means 'ends with'.",
        },
      },
      {
        task:
          "Add the search to the app. Delete the whole listSnacks method and type this in its place. The new part is the first branch: when the customer sends ?name=, the SQL uses  LIKE ?  and Java puts the % marks around the value:\n\n" +
          LIST_SNACKS_NAME +
          "\n\nRestart, then open localhost:8080/api/snacks?name=utsin",
        hint:
          "The name branch comes first and returns at once, so the rest is Tuesday's code, unchanged (the maxPrice branches). The SQL still has a single ? and one .param. The % marks are glued onto the VALUE in Java, never into the SQL text. If you get a red line under  name, the new @RequestParam line is missing a comma before it.",
        check: {
          question: "In  .param(\"%\" + name + \"%\"),  the + glues text together. Isn't gluing the dangerous thing from Part 1?",
          choices: [
            "No: here the glued text is still only a VALUE handed over with .param. The danger was gluing into the SQL string itself",
            "Yes: this is just as dangerous",
            "Yes, but only for numbers",
          ],
          answer: 0,
          explain: "The rule is about where the customer's text ends up. In .param(…) it can only ever be a value to compare, whatever characters it holds.",
        },
      },
      {
        task:
          "Try to break it. Open each of these addresses and write down what comes back:\n\nlocalhost:8080/api/snacks?name=UTSIN\n\nlocalhost:8080/api/snacks?name=Aling's\n\nlocalhost:8080/api/snacks?name=x' OR '1'='1\n\nlocalhost:8080/api/snacks?name=\n\nlocalhost:8080/api/snacks?name=%25",
        hint:
          "The last two return every snack: an empty search is %%, and a % that the customer types is a wildcard too. Both are harmless (the customer sees snacks they could see anyway). The apostrophe and the attack text return [] with status 200: no snack has a name like that, and nothing broke.",
        check: {
          question: "The attack text  x' OR '1'='1  returned [] and not every snack. Why is it different from Part 1's glued /api/find?",
          choices: [
            "Spring blocks the word OR",
            "The text goes to MySQL as a value, so it looks for a snack whose name contains that whole sentence, and there is none",
            "LIKE ignores apostrophes",
          ],
          answer: 1,
          explain: "Same ? rule, same result: the customer's text can only be compared, never executed.",
        },
      },
      {
        task:
          "Wire the menu page's search box to it. Open static/menu.js and find the search code at the bottom (it starts with  const search = …).  Delete it and type this instead:\n\n" +
          MENU_SEARCH_NEW +
          "\n\nThe old code is shown below so you can tell which part to replace:\n\n" +
          MENU_SEARCH_OLD +
          "\n\nPress Ctrl+Shift+R on localhost:8080/menu.html and type  ut  in the search box. Then open F12 → Network, filter by Fetch/XHR, clear the list and type  k,  u,  t  one letter at a time.",
        hint:
          "Only the event listener's body changes: instead of filtering the list the page already holds, it asks the app. encodeURIComponent makes the text safe inside an address (a space becomes %20, an apostrophe %27). Everything above the search code in menu.js stays. If nothing happens, press F12 → Console for a red error.",
        check: {
          question: "You typed k, u, t. How many requests did the page send, and who did the filtering?",
          choices: [
            "None: the browser filtered the snacks it already had",
            "One request per letter, and MySQL did the filtering: the page just draws what comes back",
            "One request when you press Enter",
          ],
          answer: 1,
          explain: "Typing fires an input event for each letter, and each one asks /api/snacks?name=… in turn. For six snacks the old way was fine; for a thousand, asking the database is the right way.",
        },
      },
      {
        task:
          "Now the sort, written the WRONG way on purpose. A customer-chosen sort needs a different column in ORDER BY each time, so this version glues the customer's word in. Add this method anywhere inside the class, restart, and open each address, writing down what happens:\n\n" +
          SORT_GLUED +
          "\n\nlocalhost:8080/api/sorted?by=price\n\nlocalhost:8080/api/sorted?by=name\n\nlocalhost:8080/api/sorted?by=price DESC\n\nlocalhost:8080/api/sorted?by=RAND()\n\nlocalhost:8080/api/sorted?by=nope",
        hint:
          "The first three work, and look useful. The fourth shuffles the snacks every time you reload: the customer just ran a SQL function you never wrote. The last is a 500 with  bad SQL grammar [SELECT … ORDER BY nope]  in the browser; in the terminal the root cause is Unknown column 'nope'.",
        check: {
          question: "by=RAND() shuffled your snacks. What does that show?",
          choices: [
            "That RAND() is a Java method",
            "The customer's word became part of the SQL, so they can make MySQL run whatever expression they like in that spot",
            "That ORDER BY is random by default",
          ],
          answer: 1,
          explain: "Anyone who knows SQL can ask the database almost any question in that spot, one yes-or-no at a time. A glued ORDER BY is the same hole as a glued WHERE.",
        },
      },
      {
        task:
          "The obvious fix is a ?. Replace the method sorted with this one, restart, and try  ?by=price  and  ?by=name  again:\n\n" +
          SORT_QMARK,
        hint: "Nothing breaks, and nothing sorts. A ? stands for a VALUE, so MySQL receives the TEXT 'price' as a value to sort by, which is the same for every row.",
        check: {
          question: "Both addresses answer 200 with the snacks in plain snack_id order. Why doesn't ORDER BY ? sort?",
          choices: [
            "A ? is filled with a value, never with a column name or keyword, so 'price' is sorted as a piece of text that is the same on every row",
            "Because .param only works with numbers",
            "Because ORDER BY must be written in capitals",
          ],
          answer: 0,
          explain: "A silent bug is worse than a crash: no error and no sort. So how does a customer choose a sort safely? Not by passing their word to MySQL, but by choosing between your own fixed strings.",
        },
      },
      {
        task:
          "The safe way: a whitelist. Delete the sorted method completely. Then delete the whole listSnacks method again and type this in its place. The new branch checks the customer's word against exactly two words you chose, and each word picks a complete SQL string that you wrote:\n\n" +
          LIST_SNACKS_D2B +
          "\n\nIn words: if sort is sent, sql is price or name or the app answers 400. The customer's text is only COMPARED with your words (sort.equals(…)); it never becomes part of any SQL.",
        hint:
          "String sql; declares a variable with no value yet, and each branch gives it one (or throws). sort.equals(\"price\") is how Java compares text, the Week 6 point about == and equals. The SORT branch sits between the name branch and the maxPrice code. For reference, the new branch alone is:\n\n" +
          SORT_BRANCH,
        check: {
          question: "The customer sends  ?sort=price; DROP TABLE snacks.  What happens now?",
          choices: [
            "The table is dropped",
            "400 sort must be price or name: the text matches neither word, so no SQL runs at all",
            "500 with a syntax error",
          ],
          answer: 1,
          explain: "The refusal happens in Java before MySQL is involved. The rule for anything that can't be a ?: let the customer's text pick one of your fixed pieces, and reject everything else.",
        },
      },
      {
        task:
          "Test the whitelist. Open each address and write down the status and what comes back:\n\nlocalhost:8080/api/snacks?sort=price\n\nlocalhost:8080/api/snacks?sort=name\n\nlocalhost:8080/api/snacks?sort=price DESC\n\nlocalhost:8080/api/snacks?sort=bogus\n\nlocalhost:8080/api/snacks?name=a&sort=price\n\nlocalhost:8080/api/snacks?maxPrice=10",
        hint:
          "The first two are sorted (cheapest first, A to Z), and the next two answer 400 with sort must be price or name. The fifth shows a limit of today's code: when both name and sort are sent, the name branch answers first and the sort is ignored. Fixing that is a stretch idea at the end of the day. The last is Tuesday's maxPrice, still working.",
        check: {
          question: "?sort=price DESC is a perfectly good SQL phrase, yet it answers 400. Why?",
          choices: [
            "It's a bug",
            "The whitelist has exactly two words, price and name; anything else is refused, even harmless phrases. Allowing more means adding another fixed string",
            "DESC is not valid SQL",
          ],
          answer: 1,
          explain: "A whitelist is strict on purpose. If you want a reverse order, you add a third complete string for it yourself.",
        },
      },
      {
        task:
          "Compare. After Part 2 your SnackController.java should look like this (line 1 is your own package line; blank lines, import order and method order don't matter; the sorted method is gone), and the search part of menu.js is exactly as in the earlier mission:\n\n" +
          CONTROLLER_D2,
        hint: "Common differences: the old sorted method still there, a missing  else  before the throw, the name branch placed after the maxPrice code instead of first, and findByName (Part 1's exact-name search) deleted by mistake: it stays.",
      },
      {
        task:
          "Add Part 2 to notes.md: what LIKE '%…%' does and why the % marks are added in Java, what the apostrophe and the attack text returned, what happened with the glued sort (quote by=RAND()), what ORDER BY ? did, and in your own words why a whitelist is safe.",
        hint: "Write it in your own words. The last sentence is the most important one.",
        input: "Paste Part 2 of notes.md",
      },
    ],
  },
  {
    kind: "json-check",
    id: "checkpoint-search-sort",
    title: "🧪 Part 2 · Checkpoint: search, and a sort that can't be hijacked",
    intro:
      "Open each address, or run each console line in a tab of localhost:8080 (the last one on menu.html), and paste the answer. They use " +
      LAB_SNACK +
      " (id 90, price 10), which only your MySQL holds. Part 1's app ignores ?name= and ?sort=, so it cannot pass any of these.",
    tasks: [
      {
        goal: "Paste what your app answers at /api/snacks?name=utsin. Only Kutsinta contains those letters.",
        url: "localhost:8080/api/snacks?name=utsin",
        checks: [
          { is: "array", message: "This should be a list, starting with [." },
          { exact: 1, message: "Exactly one snack contains utsin. If you got every snack, listSnacks ignores ?name=: its first branch should be  if (name != null)." },
          { some: { snack_id: 90, name: "Kutsinta", price: 10 }, message: "The one snack should be Kutsinta (id 90, price 10). Is the query  WHERE name LIKE ?  with  .param(\"%\" + name + \"%\")?" },
        ],
        hint: "The % marks go around the value in Java. Without them LIKE only matches a whole name.",
        solution: LIST_SNACKS_NAME,
        example: "[{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}]",
        previousStage: "[{\"snack_id\":1,\"name\":\"Banana cue\",\"price\":15},{\"snack_id\":2,\"name\":\"Turon\",\"price\":12},{\"snack_id\":3,\"name\":\"Kwek-kwek\",\"price\":20},{\"snack_id\":4,\"name\":\"Gulaman\",\"price\":10},{\"snack_id\":5,\"name\":\"Siopao\",\"price\":25},{\"snack_id\":6,\"name\":\"Pastillas\",\"price\":8},{\"snack_id\":90,\"name\":\"Kutsinta\",\"price\":10}]",
        explain: "A search the database does for you, in one ? and one .param.",
      },
      {
        goal: "Run this line in the console of a localhost:8080 tab. It searches for a name with an apostrophe and then for the attack text from Part 1, and counts what came back. Paste what it copies.",
        command: SEARCH_SAFE_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did the line run on a localhost:8080 tab?" },
          { path: "apostrophe_status", equals: 200, message: "The apostrophe search should answer 200. A 500 means the name is glued into the SQL: use  LIKE ?  and  .param(…)." },
          { path: "apostrophe_rows", equals: 0, message: "Aling's matches no snack, so the answer should be []. If you got snacks, ?name= is being ignored." },
          { path: "attack_status", equals: 200, message: "The attack text should answer 200 and []." },
          { path: "attack_rows", equals: 0, message: "The attack text returned snacks: it must be treated as a value. Use  LIKE ?  with  .param(\"%\" + name + \"%\"),  with no + in the SQL string." },
        ],
        hint: "Both searches should come back as an empty list. If apostrophe_rows is more than 0, the name parameter is ignored.",
        solution: LIST_SNACKS_NAME,
        example: "{\"apostrophe_status\":200,\"apostrophe_rows\":0,\"attack_status\":200,\"attack_rows\":0}",
        previousStage: "{\"apostrophe_status\":200,\"apostrophe_rows\":7,\"attack_status\":200,\"attack_rows\":7}",
        explain: "The same text that broke the glued search in Part 1 is just a name nobody has.",
      },
      {
        goal: "Run this line in the console of a localhost:8080 tab. It asks for ?sort=price, ?sort=name and an attack in the sort, and checks the order of each answer. Paste what it copies.",
        command: SORT_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did the line run on a localhost:8080 tab?" },
          { path: "price_sorted", equals: true, message: "?sort=price isn't sorted by price, cheapest first. The branch for \"price\" should run  ORDER BY price, snack_id." },
          { path: "name_sorted", equals: true, message: "?sort=name isn't sorted A to Z. The branch for \"name\" should run  ORDER BY name." },
          { path: "attack_status", equals: 400, message: "A sort that is neither price nor name should answer 400. If it answered 200 the sort word is being used; if 500 it reached the SQL." },
          { path: "attack_message", equals: "sort must be price or name", message: "The message should be exactly  sort must be price or name." },
        ],
        hint: "If price_sorted is false, the sort branch is missing or placed after the maxPrice code. The branch must come before the maxPrice test.",
        solution: LIST_SNACKS_D2B,
        example: "{\"price_sorted\":true,\"name_sorted\":true,\"attack_status\":400,\"attack_message\":\"sort must be price or name\"}",
        previousStage: "{\"price_sorted\":false,\"name_sorted\":false,\"attack_status\":200}",
        explain: "Two sorts chosen by the customer, one refusal for everything else, and not a single customer word inside a SQL string.",
      },
      {
        goal: "Open localhost:8080/menu.html, press F12 → Console and run this line. It types  utsin  in the search box and reports what the page did. Paste what it copies.",
        command: MENU_SEARCH_COMMAND,
        checks: [
          { is: "object", message: "This should be a small object. Did you run the line on localhost:8080/menu.html? It needs the search box." },
          { path: "rows_shown", equals: 1, message: "The menu should show exactly one snack for utsin (Kutsinta). Press Ctrl+Shift+R, and read the red lines in the Console." },
          { path: "asked_the_app", equals: true, message: "The page didn't ask /api/snacks?name=utsin: it is still filtering the list it already holds. Replace the search code in menu.js with the fetch version from the lab." },
        ],
        hint: "asked_the_app is true only when menu.js fetches /api/snacks?name= when you type. Make sure you replaced the OLD search listener rather than adding a second one, and that you pressed Ctrl+Shift+R.",
        solution: MENU_SEARCH_NEW,
        example: "{\"rows_shown\":1,\"asked_the_app\":true}",
        previousStage: "{\"rows_shown\":1,\"asked_the_app\":false}",
        explain: "A page that asks the database instead of filtering a copy: the search box and MySQL are connected end to end.",
      },
    ],
  },
];
