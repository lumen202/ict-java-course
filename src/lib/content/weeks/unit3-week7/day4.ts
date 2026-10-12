// unit3-week7 · Day 4 — Saying no, clearly
//
// Validation in the controller: qty outside 1–20 → 400 "qty must be from 1 to
// 20"; an unknown snack → 404 (already, through getSnack). Then a 500 caused on
// purpose (a plain RuntimeException) to learn reading the terminal's stack
// trace, and response.status / response.ok in fetch, which Day 5's pages use.
//
// Observed on the real 4.1.1 build (2026-10-11): the three error bodies below
// are its real answers; a RuntimeException answers 500 with its message in the
// JSON (include-message=always) and a stack trace in the terminal.
// The week's gauntlet (`week7-gauntlet`, predict-the-answer, interleaved
// across Days 1–4) is here, not on Day 5: the adversarial walk-through
// (2026-10-11) timed Day 4 at ~3½ h and Day 5 at ~7 h.
// Video (transcript read): Algo Rhythm on HTTP status and a custom exception
// (7iKuYJ3Z16o, 7:07, 2021; Postman, and @ResponseStatus on an exception class
// — the lab uses ResponseStatusException, which the notes explain).

import type { DayPlan } from "../../types";
import { controllerHeader } from "./day3";
import { indent } from "./day2";

export const QTY_CHECK =
  "if (request.qty() < 1 || request.qty() > 20) {\n    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, \"qty must be from 1 to 20\");\n}";

export const PLACE_ORDER =
  `@PostMapping("/api/orders")\n@ResponseStatus(HttpStatus.CREATED)\npublic Order placeOrder(@RequestBody OrderRequest request) {\n${indent(QTY_CHECK)}\n    Snack snack = getSnack(request.snack_id());\n    Order order = new Order(orders.size() + 1, snack.snack_id(), snack.name(), request.qty(), snack.price() * request.qty());\n    orders.add(order);\n    return order;\n}`;

export const WHOLE_CONTROLLER_W7 = `${controllerHeader}

${indent(PLACE_ORDER)}
}`;

const consoleOrder = (snack: number, qty: number) =>
  `fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ snack_id: ${snack}, qty: ${qty} }) }).then(r => { console.log(r.status, r.ok); return r.text(); }).then(t => { console.log(t); return t; }).then(copy)`;

export const day4: DayPlan = {
  day: "Day 4",
  focus: "Saying no, clearly — 400 for a bad quantity, 404 for an unknown snack, and how to read a 500",
  warmupGame: {
    kind: "quest",
    id: "warmup-say-no",
    title: "🚫 Warm-up: which answer is honest?",
    intro: "Yesterday your app accepted 0 Kwek-kwek. Today it learns to refuse, and to say why.",
    missions: [
      {
        task: "Place an order for 0 Kwek-kwek from yesterday's console line: change qty: 2 to qty: 0. Your app answers 201 with \"total\":0.",
        hint: "Would Aling Nena want an order for zero snacks in her ledger? Whose mistake is it: the page's request, or your app?",
        check: {
          question: "What should your app answer instead?",
          choices: [
            "500 Internal Server Error",
            "400 Bad Request, with a message saying what's wrong with the quantity",
            "200 OK",
          ],
          answer: 1,
          explain: "The request is wrong, so it's a 4xx. 400 means 'I understood you, but this request isn't valid'.",
        },
      },
      {
        task: "Your Week 5 order form has min=\"1\" max=\"20\" on the qty box.",
        hint: "Week 5 asked: can someone send ?qty=-5 without using your form?",
        check: {
          question: "So why does the app need its own check?",
          choices: [
            "It doesn't: the form already stops it",
            "Anyone can send a POST without your form, from a console like you did yesterday. The browser's checks help honest customers; the server's check protects the ledger",
            "Because Java is stricter than HTML",
          ],
          answer: 1,
          explain: "Week 5's boss asked exactly this. Today you write the server's half.",
        },
      },
      {
        task: "A 500 Internal Server Error means your code threw an error that nobody planned for.",
        hint: "Which code says 'the server broke' rather than 'the request was wrong'?",
        check: {
          question: "Someone asks for snack 99 and your app answers 500. What does that tell them?",
          choices: [
            "Snack 99 doesn't exist",
            "They sent a bad request",
            "Your app is broken, which isn't true. The honest answer is 404",
          ],
          answer: 2,
          explain: "A 500 for a normal 'not found' sends people looking for a bug in the wrong place. Choose the status that tells the truth.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Spring Boot Tutorial - HTTP Status | Custom Exception (Algo Rhythm)",
      youtubeId: "7iKuYJ3Z16o",
      length: "7:07",
      practice: {
        intro: "His API returns videos. He starts with a 500 for a missing video and ends with a proper 404. Write down his steps:",
        steps: [
          "In notes.md, write why he says a 500 was the wrong answer for a video that doesn't exist.",
          "Write the status he ends with, and what the client learns from it.",
        ],
        note: "He makes his own exception class with @ResponseStatus on it. You'll use ResponseStatusException, the one you threw on Tuesday: same result, no extra class. He tests with Postman; you use the console.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: an app that refuses bad orders",
      intro: "One change to placeOrder, then a 500 on purpose in getSnack so you know how to read one. Restart after each change.",
      missions: [
        {
          task: "In SnackController.java, in placeOrder, find the line  Snack snack = getSnack(request.snack_id());  Just ABOVE it, as the first lines inside the method, type:",
          code: indent(indent(QTY_CHECK)),
          hint: "|| means 'or', like in Java's if statements you know. If qty is too small OR too big, the method stops here with a 400 and never adds the order.",
          check: {
            question: "Why is the check the FIRST thing in the method?",
            choices: [
              "Java requires it",
              "A bad order must be refused before it's added to the list. If the check came after orders.add, the bad order would already be saved",
              "It makes the method shorter",
            ],
            answer: 1,
            explain: "Check first, then act. The same goes for every endpoint that changes data.",
          },
        },
        {
          task: "Restart. Open localhost:8080/order.html, open the console and run this line, which also prints the status and whether it was ok. Then press ↑, change qty: 0 to qty: 25 and run it again. Then change it to qty: 2 and run it once more, for a good order.",
          code: consoleOrder(3, 0),
          hint: "Each run prints two lines: first the status and true/false, then the JSON. qty 0 and qty 25 should print '400 false' with your message; qty 2 should print '201 true'. Chrome's own red line for a 400 is the browser reporting the status, not a bug.",
          check: {
            question: "For the good order it printed '201 true'. What is r.ok?",
            choices: [
              "true for a status in the 200s (it worked), false for 400, 404, 500 and the rest",
              "Always true if the app is running",
              "The total",
            ],
            answer: 0,
            explain: "Tomorrow's order.js uses exactly this: if (response.ok) show the receipt, otherwise show the message.",
          },
        },
        {
          task: "Now an unknown snack. Run the line with snack_id: 99 and qty: 2.",
          code: consoleOrder(99, 2),
          hint: "No new code needed: placeOrder calls getSnack, which already throws the 404.",
          check: {
            question: "It answered 404 'No snack with id 99'. Which line of your code decided that?",
            choices: [
              "The qty check",
              "The throw at the end of getSnack, which placeOrder calls",
              "Spring decided by itself",
            ],
            answer: 1,
            explain: "One method, reused, gives the same honest answer for GET /api/snacks/99 and for an order of snack 99.",
          },
        },
        {
          task: "See a 500 on purpose. In getSnack, change the last line to  throw new RuntimeException(\"No snack with id \" + id);  Restart and open localhost:8080/api/snacks/99. Then look at VS Code's terminal.",
          hint: "The stack trace is long. Click in the terminal, press Ctrl+F and type SnackController.java to jump to it. The first line that starts with at and contains (SnackController.java:NN) is the one: NN is the line number of your throw.",
          check: {
            question: "The page says status 500, and the terminal shows RuntimeException with a line like  at com.example.canteen_web.SnackController.getSnack(SnackController.java:57).  What does that line tell you?",
            choices: [
              "The app is out of memory",
              "Exactly where your code threw the error: the getSnack method, at line 57 of SnackController.java",
              "That line 52 must be deleted",
            ],
            answer: 1,
            explain:
              "A stack trace lists who called whom, newest first. The first 'at' line in YOUR files is where to look. Spring's own lines (org.springframework…) you can skip.",
          },
        },
        {
          task: "Put it back: change that line to  throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id);  again. Restart and check localhost:8080/api/snacks/99 shows 404, not 500.",
          hint: "It must be ResponseStatusException with HttpStatus.NOT_FOUND, exactly as on Tuesday.",
          check: {
            question: "Both versions put 'No snack with id 99' in the JSON. Why is ResponseStatusException the right one?",
            choices: [
              "It's shorter",
              "It gives the honest status, 404. A plain RuntimeException always becomes a 500, telling everyone your app is broken when it isn't",
              "RuntimeException is deprecated",
            ],
            answer: 1,
            explain: "Same words, different meaning. The status code is the part pages and tools act on.",
          },
        },
        {
          task: "Compare your whole SnackController.java with this one, line by line (line 1 is your package line). Fix any difference and restart. Order.java and OrderRequest.java don't change today. Blank lines and the order of the import lines don't matter; everything else should match.",
          code: WHOLE_CONTROLLER_W7,
          hint: "The only differences from yesterday: the qty check at the top of placeOrder, and getSnack's last line back to ResponseStatusException.",
        },
        {
          task: "Add today to notes.md: your rule for choosing 400, 404 and 500, what r.ok means, and how you find the line that caused a 500.",
          hint: "Use today's three orders (qty 0, snack 99, a good one) as your examples.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-errors",
      title: "🧪 Checkpoint: honest answers",
      intro:
        "Each checkpoint gives you a console line for localhost:8080/order.html. It prints the status, then the JSON, and copies the JSON for you: click the box and press Ctrl+V.",
      tasks: [
        {
          goal: "Order 0 Kwek-kwek (snack_id 3, qty 0) and paste the JSON. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          command: consoleOrder(3, 0),
          url: "POST /api/orders  {\"snack_id\":3,\"qty\":0}",
          checks: [
            { is: "object", message: "Paste the JSON line, the one that starts with {." },
            { path: "status", equals: 400, message: "The status should be 400. If you got 201, your qty check is missing or comes after orders.add. Did you restart?" },
            { path: "message", contains: "qty", message: "The message should say what's wrong with qty, like 'qty must be from 1 to 20'. No message at all? Check spring.web.error.include-message=always." },
          ],
          hint: "The check goes at the very top of placeOrder: if (request.qty() < 1 || request.qty() > 20) { throw … BAD_REQUEST … }",
          solution: QTY_CHECK,
          example: '{"timestamp":"2026-10-11T13:25:47.959Z","status":400,"error":"Bad Request","message":"qty must be from 1 to 20","path":"/api/orders"}',
          explain: "Refused before anything was saved, with a reason the page can show.",
        },
        {
          goal: "Order 25 Kwek-kwek (qty 25) and paste the JSON. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          command: consoleOrder(3, 25),
          url: "POST /api/orders  {\"snack_id\":3,\"qty\":25}",
          checks: [
            { is: "object", message: "Paste the JSON line, the one that starts with {." },
            { path: "status", equals: 400, message: "The status should be 400: 25 is more than 20. Check the second half of your if: request.qty() > 20." },
          ],
          hint: "One if covers both ends: < 1 OR > 20.",
          solution: QTY_CHECK,
          example: '{"timestamp":"2026-10-11T13:25:47.979Z","status":400,"error":"Bad Request","message":"qty must be from 1 to 20","path":"/api/orders"}',
          explain: "The same limits as your form's min and max, now enforced where they can't be skipped.",
        },
        {
          goal: "Order 2 of snack 99 and paste the JSON. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          command: consoleOrder(99, 2),
          url: "POST /api/orders  {\"snack_id\":99,\"qty\":2}",
          checks: [
            { is: "object", message: "Paste the JSON line, the one that starts with {." },
            { path: "status", equals: 404, message: "The status should be 404. A 500 means getSnack still throws a plain RuntimeException: put ResponseStatusException back." },
            { path: "message", contains: "99", message: "The message should say snack 99 wasn't found." },
          ],
          hint: "getSnack's last line: throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id);",
          solution: "throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id);",
          example: '{"timestamp":"2026-10-11T13:25:47.969Z","status":404,"error":"Not Found","message":"No snack with id 99","path":"/api/orders"}',
          explain: "Reused code, reused honesty.",
        },
        {
          goal: "And a good order still works: 3 Gulaman (snack_id 4, qty 3). Paste the JSON. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          command: consoleOrder(4, 3),
          url: "POST /api/orders  {\"snack_id\":4,\"qty\":3}",
          checks: [
            { is: "object", message: "Paste the JSON line, the one that starts with {." },
            { path: "name", equals: "Gulaman", message: "This order should be for Gulaman (snack_id 4). If you see an error instead, read its status and message." },
            { path: "total", equals: 30, message: "total should be 30 (10 × 3)." },
          ],
          hint: "If a good order is refused with 400, look at your if: it should refuse qty < 1 or qty > 20, not the other way round.",
          solution: QTY_CHECK,
          example: '{"order_id":3,"snack_id":4,"name":"Gulaman","qty":3,"total":30}',
          explain: "The checks refuse bad orders and let good ones through: both halves matter.",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Today's patients all answered with the wrong status, or with a 500 that only the terminal can explain.",
      missions: [
        {
          task: "Patient 1. Orders with qty 0 are refused with 400, but the empty order is in /api/orders anyway. The student put the qty check after  orders.add(order);",
          hint: "In which order do the lines run?",
          check: {
            question: "Fix?",
            choices: [
              "Move the check to the top of placeOrder, before anything is added",
              "Delete orders.add",
              "Use 404 instead",
            ],
            answer: 0,
            explain: "Check first, then save. A refusal that comes after the save refuses nothing.",
          },
        },
        {
          task: "Patient 2. Every order, good or bad, is refused with 400. The check says  if (request.qty() >= 1 && request.qty() <= 20).",
          hint: "Read the condition aloud. When is it true?",
          check: {
            question: "Diagnosis?",
            choices: [
              "&& doesn't work in Java",
              "20 is too low",
              "The condition is true for GOOD quantities, so good orders are the ones thrown out. It should be the bad ones: qty < 1 || qty > 20",
            ],
            answer: 2,
            explain: "Write the condition for what you refuse. Test both a good and a bad order every time.",
          },
        },
        {
          task: "Patient 3. A missing snack answers 500, and the terminal says  java.lang.RuntimeException: No snack with id 99.",
          hint: "Which exception gives the honest status?",
          check: {
            question: "Fix?",
            choices: [
              "throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id);",
              "Catch every exception and return null",
              "Restart the app",
            ],
            answer: 0,
            explain: "A plain RuntimeException always becomes a 500. ResponseStatusException carries the status you choose.",
          },
        },
        {
          task: "Patient 4. The terminal shows 40 red lines after a 500. The student scrolls to the very bottom and reads lines about org.apache.tomcat.",
          hint: "Where in the stack trace are YOUR files named?",
          check: {
            question: "Where should they look?",
            choices: [
              "The last line",
              "The first line that says 'at' and names one of THEIR files, like SnackController.java:52. Above it is the error's name and message",
              "Any line with 'Error' in it",
            ],
            answer: 1,
            explain: "The top says what went wrong; the first 'at' line in your own code says where. The rest is Spring and Tomcat calling your code.",
          },
        },
        {
          task: "Patient 5. In the console,  r.ok  prints false for an order of snack 99, and the student thinks the fetch failed.",
          hint: "Did the app answer? What was the status?",
          check: {
            question: "What does ok: false mean here?",
            choices: [
              "The network is down",
              "The app answered fine, with a status that isn't in the 200s (here 404). The answer and its message are still there to read",
              "The JSON is broken",
            ],
            answer: 1,
            explain: "fetch() only fails outright when no answer arrives at all. Any answer, even a 404, comes back, and r.ok says whether it was a success.",
          },
        },
        {
          task: "Patient 6. A student's error JSON says  \"error\":\"Bad Request\"  and its message is only  \"400 BAD_REQUEST\".  Their throw is  throw new ResponseStatusException(HttpStatus.BAD_REQUEST);",
          hint: "Compare it with the lab's throw. What's missing inside the brackets?",
          check: {
            question: "Fix?",
            choices: [
              "Add the message as the second argument: new ResponseStatusException(HttpStatus.BAD_REQUEST, \"qty must be from 1 to 20\")",
              "Use HttpStatus.NOT_FOUND",
              "Return a String instead",
            ],
            answer: 0,
            explain: "The status says what kind of problem; the message says which. Tomorrow the page shows that message to the customer, so write it for them.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for writing an error a customer could understand.",
          hint: "The customer reads the message tomorrow. What makes a message useful to them?",
          input: "Paste your six notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own rule",
      intro: "Add one more rule of your own to placeOrder, with an honest status and a clear message. Do at least one idea; if you have time, do more.",
      missions: [
        {
          task: "Pick one idea, or invent your own: (1) the canteen sells at most 10 Siopao (snack_id 5) per order, so refuse more with 400 and a message that says so; (2) refuse orders while the canteen is closed (before 7:00 or after 16:00, from java.time.LocalTime.now().getHour()) with 400 'The canteen is closed'; (3) an order total over ₱300 is refused with 400 'Orders over ₱300 must be placed at the counter'.",
          hint:
            "Each rule is an if with a throw new ResponseStatusException(HttpStatus.BAD_REQUEST, \"…\"), placed after the qty check. Rules about the snack or the total go after the line that finds the snack. Keep today's checkpoint passing: a normal order of 3 Gulaman must still be accepted. For idea 2, test it by changing the hours, then change them back.",
        },
        {
          task: "Paste your new lines, the console line you tested with, and the JSON your app answered. Finished early? Add another rule first, then paste them all.",
          hint: "Copy the lines from VS Code, and the JSON from the console.",
          input: "Paste your rule(s), the test, and the answer",
        },
      ],
    },
    {
      kind: "quest",
      id: "week7-gauntlet",
      title: "🧪 The week's gauntlet: predict the answer",
      intro:
        "For each request, predict exactly what an app like yours answers. The questions jump between the week's days on purpose. Each one is about the same SnackController you built.",
      missions: [
        {
          task: "GET localhost:8080/api/snacks/6.",
          hint: "Day 2: getSnack loops until it finds snack_id 6. Which snack is 6 in your list?",
          check: {
            question: "What does your app answer?",
            choices: [
              "200 and {\"snack_id\":6,\"name\":\"Pastillas\",\"price\":8}",
              "200 and the whole list",
              "404",
            ],
            answer: 0,
            explain: "A path variable picks one thing.",
          },
        },
        {
          task: "A fetch POST to /api/orders with body JSON.stringify({ snack_id: 2, qty: 3 }) but no headers.",
          hint: "Day 3: what does the browser call a body when nobody says it's JSON?",
          check: {
            question: "What status comes back?",
            choices: ["201", "400", "415"],
            answer: 2,
            explain: "No Content-Type means plain text, and Spring refuses: 415.",
          },
        },
        {
          task: "GET localhost:8080/api/snacks?maxPrice=15.",
          hint: "Day 2: which snacks cost 15 or less? Count Banana cue too.",
          check: {
            question: "How many snacks are in the answer?",
            choices: ["3", "4", "6"],
            answer: 1,
            explain: "Banana cue 15, Turon 12, Gulaman 10 and Pastillas 8: <= includes 15.",
          },
        },
        {
          task: "A record is written  public record Item(int itemId, String label) {}  and an endpoint returns one Item.",
          hint: "Day 1: where do JSON keys come from?",
          check: {
            question: "What are the JSON keys?",
            choices: ["item_id and label", "itemId and label", "0 and 1"],
            answer: 1,
            explain: "The field names, letter for letter.",
          },
        },
        {
          task: "A correct POST to /api/orders with {\"snack_id\":1,\"qty\":21}.",
          hint: "Day 4: what are the limits in your qty check?",
          check: {
            question: "What does your app answer?",
            choices: ["201, total 315", "404", "400 with 'qty must be from 1 to 20'"],
            answer: 2,
            explain: "21 is over 20, so it's refused before anything is saved.",
          },
        },
        {
          task: "Opening localhost:8080/api/orders in the browser, in an app that has only the @PostMapping for that address.",
          hint: "Day 3: what method does the browser send, and does the address accept it?",
          check: {
            question: "What status?",
            choices: ["404", "405", "200"],
            answer: 1,
            explain: "The address exists, but not for GET: 405 Method Not Allowed.",
          },
        },
        {
          task: "getSnack ends with  throw new RuntimeException(\"No snack with id \" + id);  and someone asks for /api/snacks/99.",
          hint: "Day 4: what status does an unplanned exception become?",
          check: {
            question: "What status?",
            choices: ["500", "404", "400"],
            answer: 0,
            explain: "Same message, wrong status. ResponseStatusException with NOT_FOUND gives the honest 404.",
          },
        },
        {
          task: "GET localhost:8080/api/snacks/0. Your list has snacks 1 to 6.",
          hint: "Day 2: 0 is a number, so the request is fine. Does getSnack's loop find snack_id 0?",
          check: {
            question: "What status?",
            choices: ["400: 0 isn't a valid id", "404: the request makes sense, but there's no snack 0", "200 with an empty object"],
            answer: 1,
            explain: "0 converts to an int fine (no 400); the loop finds nothing, so the throw answers 404. Compare /api/snacks/abc, which IS a 400.",
          },
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-silent-error",
    title: "⚔️ Boss battle: The Vague Error",
    intro: "The Vague Error answers everything with 500 and no reason. Give every problem its honest name.",
    boss: { name: "the Vague Error", emoji: "🌫️" },
    questions: [
      {
        prompt: "An order for qty 0 should get…",
        choices: ["400 Bad Request", "404 Not Found", "500 Internal Server Error"],
        answer: 0,
        explain: "The request is wrong, so it's a 4xx: 400.",
      },
      {
        prompt: "An order for snack 99 should get…",
        choices: ["400", "404", "201"],
        answer: 1,
        explain: "The request is fine, but there's no such snack.",
      },
      {
        prompt: "throw new RuntimeException(\"…\") in a controller gives…",
        choices: ["404", "400", "500"],
        answer: 2,
        explain: "An unplanned exception always becomes a 500.",
      },
      {
        prompt: "Where does the qty check belong in placeOrder?",
        choices: ["At the end", "First, before anything is added", "In the record"],
        answer: 1,
        explain: "Refuse before you save.",
      },
      {
        prompt: "What is r.ok after a fetch that got 404?",
        choices: ["false", "true", "undefined"],
        answer: 0,
        explain: "ok is true only for 2xx statuses.",
      },
      {
        prompt: "Why must the app check qty when the form has min=\"1\" max=\"20\"?",
        choices: [
          "The form's checks don't work",
          "Requests can come from anywhere, not only your form",
          "Java can't read HTML",
        ],
        answer: 1,
        explain: "Browser checks are for honest customers; server checks are for everyone.",
      },
      {
        prompt: "In a stack trace, which line tells you where YOUR code failed?",
        choices: ["The last line", "Any line with 'tomcat'", "The first 'at' line naming one of your files"],
        answer: 2,
        explain: "It ends with your file and a line number.",
      },
      {
        prompt: "What's the second argument of new ResponseStatusException(HttpStatus.BAD_REQUEST, …) for?",
        choices: ["The message that goes into the error JSON", "The line number", "The status code"],
        answer: 0,
        explain: "Tomorrow your page shows it to the customer.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "Your rule for choosing 400, 404 and 500, with one of today's orders for each.",
      "How you find the line that caused a 500.",
      "What r.ok tells your page.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your API is complete for this week: a menu, one snack, a filter, orders, and honest errors. Tomorrow your own pages start using it, and a customer finally sees your Java at work.",
  },
};
