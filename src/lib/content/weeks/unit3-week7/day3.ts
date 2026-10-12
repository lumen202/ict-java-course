// unit3-week7 · Day 3 — The app takes an order
//
// POST /api/orders with @RequestBody: the body is exactly Week 6's
// {"snack_id":3,"qty":2}. OrderRequest (what the page sends) and Order (what
// the app answers, with the total the APP computes) are separate records.
// GET /api/orders lists the orders, held in an ArrayList in memory, so a
// restart empties it (Week 8 moves it to MySQL). No qty validation yet, on
// purpose: Day 4 starts from "qty 0 was accepted".
//
// Observed on the real 4.1.1 build and in headless Chrome (2026-10-11):
// fetch POST with the JSON header → 201 + the order; without the header → 415
// "Content-Type 'text/plain;charset=UTF-8' is not supported."; an object body
// without JSON.stringify → 400 "…from Array value (token
// `JsonToken.START_ARRAY`)"; a misspelled key → 400 "Cannot map `null` into
// type `int`"; GET to a POST-only address → 405; adding to List.of → 500 "No
// message available". The json-check examples are those real answers.
// Videos (transcripts read): Code By Swamy on @PostMapping/@RequestBody
// (jYkpS-OC4xk, 4:13, 2026; tests with Postman — the console replaces it) and
// dcode on sending JSON with fetch (ycmci-hiPfQ, 3:56; posts to PHP, shows the
// Content-Type header that avoids the 415).

import type { DayPlan } from "../../types";
import { GET_SNACK, INFO_METHOD, LIST_SNACKS, SNACKS_FIELD, indent } from "./day2";

export const ORDER_REQUEST = "public record OrderRequest(int snack_id, int qty) {\n}";
export const ORDER = "public record Order(int order_id, int snack_id, String name, int qty, int total) {\n}";

export const NEW_IMPORTS_D3 =
  "import org.springframework.web.bind.annotation.PostMapping;\nimport org.springframework.web.bind.annotation.RequestBody;\nimport org.springframework.web.bind.annotation.ResponseStatus;";

export const ORDERS_FIELD = "private final List<Order> orders = new ArrayList<>();";

export const LIST_ORDERS = "@GetMapping(\"/api/orders\")\npublic List<Order> listOrders() {\n    return orders;\n}";

export const PLACE_ORDER_D3 =
  "@PostMapping(\"/api/orders\")\n@ResponseStatus(HttpStatus.CREATED)\npublic Order placeOrder(@RequestBody OrderRequest request) {\n    Snack snack = getSnack(request.snack_id());\n    Order order = new Order(orders.size() + 1, snack.snack_id(), snack.name(), request.qty(), snack.price() * request.qty());\n    orders.add(order);\n    return order;\n}";

export const CONSOLE_POST =
  "fetch(\"/api/orders\", { method: \"POST\", headers: { \"Content-Type\": \"application/json\" }, body: JSON.stringify({ snack_id: 3, qty: 2 }) }).then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)";

export const controllerHeader = `import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class SnackController {

    record CanteenInfo(String name, String opens, String closes) {
    }

${SNACKS_FIELD}
    ${ORDERS_FIELD}

${indent(LIST_SNACKS)}

${INFO_METHOD}

${indent(GET_SNACK)}

${indent(LIST_ORDERS)}`;

const WHOLE_CONTROLLER = `${controllerHeader}

${indent(PLACE_ORDER_D3)}
}`;

export const day3: DayPlan = {
  day: "Day 3",
  focus: "The app takes an order — POST /api/orders receives Week 6's JSON and answers with the saved order",
  warmupGame: {
    kind: "quest",
    id: "warmup-post",
    title: "📮 Warm-up: an order travels as JSON",
    intro: "In Week 6 your order page printed {\"snack_id\":3,\"qty\":2} in the console and stopped there. Today that JSON gets somewhere to go.",
    missions: [
      {
        task: "Opening an address in the browser always sends a GET. To send an order, a page uses fetch() with method: \"POST\".",
        hint: "A GET only names an address. Where would the order's snack and quantity go?",
        check: {
          question: "Where does a POST carry the order's JSON?",
          choices: [
            "In the address, after a ?",
            "In the request's BODY, the part of the request after the headers. That's what body: in fetch() fills",
            "In a cookie",
          ],
          answer: 1,
          explain: "GET puts its question in the address. POST sends its data in the body, where your Java receives it with @RequestBody.",
        },
      },
      {
        task: "The page sends {\"snack_id\":3,\"qty\":2}. Your app answers with the order: {\"order_id\":1,\"snack_id\":3,\"name\":\"Kwek-kwek\",\"qty\":2,\"total\":40}.",
        hint: "Which of those values did the customer choose, and which did your app work out?",
        check: {
          question: "Why doesn't the page send the total too?",
          choices: [
            "JSON can't hold totals",
            "It's too long",
            "The app works out the total from its own prices. If the page sent the total, anyone could send total 1 for a Kwek-kwek",
          ],
          answer: 2,
          explain: "Never trust a price from the browser. The page says what and how many; the server decides how much.",
        },
      },
      {
        task: "A successful GET answers 200 OK. Placing an order CREATES something new.",
        hint: "ByteByteGo's video had a 2xx code for 'something new was made'.",
        check: {
          question: "Which status should a successful POST /api/orders answer?",
          choices: ["201 Created", "404 Not Found", "302 Found"],
          answer: 0,
          explain: "201 Created means 'it worked, and here's the new thing'. One annotation sets it: @ResponseStatus(HttpStatus.CREATED).",
        },
      },
    ],
  },
  videos: [
    {
      title: "Build REST APIs Using @PostMapping in Spring Boot (Code By Swamy)",
      youtubeId: "jYkpS-OC4xk",
      length: "4:13",
      practice: {
        intro: "His record is an employee; yours will be an order. He tests with Postman, which you don't need. Write down what he says:",
        steps: [
          "In notes.md, write what @PostMapping does and what @RequestBody does, one line each.",
          "He says the JSON keys and the Java names 'must be same'. Write which Java names your order's JSON keys snack_id and qty will match.",
        ],
        note: "He returns a ResponseEntity to get status 201. You'll get the same 201 with one annotation, @ResponseStatus(HttpStatus.CREATED), which is shorter.",
      },
    },
    {
      title: "Sending JSON data with the Fetch API (dcode)",
      youtubeId: "ycmci-hiPfQ",
      length: "3:56",
      practice: {
        intro: "His server is PHP, not Java, but the fetch() is exactly what your page needs. Write it down:",
        steps: [
          "In notes.md, write the three options he gives fetch(): method, headers and body. Write one line on what each one is for.",
          "He nearly forgets the Content-Type header, then adds it. Write what it tells the server.",
        ],
        note: "The lab shows what happens without that header: your app refuses the order with status 415.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: POST /api/orders",
      intro:
        "Two new record files and two new methods. Like Day 1, each new file goes in the folder with CanteenWebApplication.java, and line 1 is the package line copied from CanteenWebApplication.java.",
      missions: [
        {
          task: "Create OrderRequest.java (right-click the folder → New File → OrderRequest.java). Press Escape and delete everything VS Code fills in, paste the package line from CanteenWebApplication.java as line 1, then type:",
          code: ORDER_REQUEST,
          hint: "This record is the shape of the JSON the page sends: {\"snack_id\":3,\"qty\":2}. The field names must match the JSON keys exactly.",
          check: {
            question: "The page sends {\"snack_id\":3,\"qty\":2}. What does Spring do with it, thanks to this record?",
            choices: [
              "It saves it in a file",
              "It makes a new OrderRequest with snack_id 3 and qty 2, matching each JSON key to the field with the same name",
              "It sends it to MySQL",
            ],
            answer: 1,
            explain: "It's Day 1 in reverse: Day 1 turned a record into JSON, and now JSON turns into a record.",
          },
        },
        {
          task: "Create Order.java the same way (package line first), then type:",
          code: ORDER,
          hint: "This is what your app answers: the order, with a number, the snack's name and the total your app works out.",
          check: {
            question: "Why two records, OrderRequest and Order, instead of one?",
            choices: [
              "Java needs two of everything",
              "The page sends only what the customer chose (snack and quantity). The app adds what only it can know: the order number, the name, and the total from its own prices",
              "Records can't have five fields",
            ],
            answer: 1,
            explain: "What comes in and what goes out are different shapes, so each gets its own record.",
          },
        },
        {
          task: "In SnackController.java, add these three import lines under your other imports:",
          code: NEW_IMPORTS_D3,
          hint: "Anywhere among the other import lines, above @RestController.",
          check: {
            question: "Which one will receive the order's JSON?",
            choices: ["@ResponseStatus", "@PostMapping", "@RequestBody"],
            answer: 2,
            explain: "@PostMapping picks the address, @RequestBody turns the body into an OrderRequest, and @ResponseStatus sets the 201. Don't mix @ResponseStatus up with Tuesday's ResponseStatusException: @ResponseStatus(…) is a label ON the method, the status when it works; throw new ResponseStatusException(…) is a line INSIDE a method, the status when it fails.",
          },
        },
        {
          task: "Still in SnackController.java, find the line  );  that ends your list of six snacks. Just below it, type this line:",
          code: `    ${ORDERS_FIELD}`,
          hint:
            "new ArrayList<>() makes an empty list you can add to. Don't use List.of() here: a List.of list can never change, and adding an order to it fails with a 500 (error clinic patient 6).",
          check: {
            question: "Where will the orders be kept?",
            choices: [
              "In MySQL",
              "In this Java list, in the app's memory, until the app stops",
              "In the browser",
            ],
            answer: 1,
            explain: "That's this week's limit: memory forgets on every restart. Next week the orders go into MySQL.",
          },
        },
        {
          task: "Now the two methods. Just above the very last } of the file, below getSnack, type:",
          code: indent(`${LIST_ORDERS}\n\n${PLACE_ORDER_D3}`),
          hint:
            "Both use the same address, /api/orders: a GET lists the orders, and a POST places one. placeOrder reuses your getSnack method, so an unknown snack_id already answers 404. orders.size() + 1 numbers the orders 1, 2, 3…",
          check: {
            question: "Someone POSTs {\"snack_id\":99,\"qty\":2}. What does your app answer, without any new code?",
            choices: [
              "201 with a snack called null",
              "404 'No snack with id 99': placeOrder calls getSnack, and getSnack already throws the 404",
              "500",
            ],
            answer: 1,
            explain: "Reusing a method reuses its checks too. That's one reason to write it once.",
          },
        },
        {
          task: "Restart the app. Open localhost:8080/api/orders: it answers []. Then open localhost:8080/order.html, open the console (F12 → Console), type this one line and press Enter:",
          code: CONSOLE_POST,
          hint:
            "Type it all on one line. If you paste it and Chrome or Edge shows a warning, type  allow pasting  and press Enter, then paste again. The console should print {\"order_id\":1,…,\"total\":40} (and copy it: the last part, .then(copy), puts the answer on your clipboard, handy for the checkpoint). Then reload localhost:8080/api/orders: your order is in the list.",
          check: {
            question: "The answer has \"total\":40. Who worked out the 40?",
            choices: [
              "The console",
              "Your Java: snack.price() * request.qty(), with 20 for Kwek-kwek from your snacks list, times 2",
              "MySQL",
            ],
            answer: 1,
            explain: "The browser said 'Kwek-kwek, 2'. Your app said '40'. That's the right split.",
          },
        },
        {
          task: "Break it on purpose: run the same line again, but delete  headers: { \"Content-Type\": \"application/json\" },  from it (keep everything else). Read what the console prints.",
          hint: "Press the ↑ key in the console to get your last line back, then edit it.",
          check: {
            question: "The answer has status 415 and 'Content-Type text/plain;charset=UTF-8 is not supported'. Why?",
            choices: [
              "The order was too big",
              "Without the header, the browser labels the body as plain text. Your app only reads JSON bodies, so it refuses with 415 Unsupported Media Type",
              "Kwek-kwek is sold out",
            ],
            answer: 1,
            explain: "dcode's video, for real. Every POST with a JSON body needs Content-Type: application/json.",
          },
        },
        {
          task: "Place two more orders from the console (change snack_id and qty). Check localhost:8080/api/orders. Then restart the app and check it again.",
          hint: "The ↑ key brings your last console line back, ready to edit.",
          check: {
            question: "After the restart, /api/orders is [] again. Why?",
            choices: [
              "Restarting deletes the code",
              "The orders lived in a Java list in memory. A restart makes a new, empty list",
              "The browser cleared them",
            ],
            answer: 1,
            explain: "Memory is fine for learning, and useless for a real canteen. Next week, MySQL.",
          },
        },
        {
          task: "Compare your files with these, line by line (line 1 of each is your package line), and fix any difference: OrderRequest.java, Order.java, then the whole SnackController.java. Blank lines and the order of the import lines don't matter; everything else should match.",
          code: `${ORDER_REQUEST}\n\n// ---- Order.java ----\n\n${ORDER}\n\n// ---- SnackController.java ----\n\n${WHOLE_CONTROLLER}`,
          hint: "Most common differences: the orders line inside a method instead of under the snacks list, a missing import, or the two new methods after the last } instead of before it.",
        },
        {
          task: "Add today to notes.md: what @RequestBody does, why the page doesn't send the total, and what 415 means.",
          hint: "Use your own orders from today as the examples.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-orders",
      title: "🧪 Checkpoint: your app takes orders",
      intro:
        "Each answer comes from your running app. For the POSTs, use the console on localhost:8080/order.html. The lines end in .then(r => r.text()) so the console prints the raw JSON, ready to copy.",
      tasks: [
        {
          goal: "Restart your app first, so the orders start from 1. Then place an order for 2 Kwek-kwek with this console line, and paste the answer. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          url: "POST localhost:8080/api/orders",
          command: CONSOLE_POST,
          checks: [
            { is: "object", message: "This should be one order, starting with {. Copy the line the console printed after your fetch." },
            {
              keys: ["order_id", "snack_id", "name", "qty", "total"],
              message: "The order needs order_id, snack_id, name, qty and total: the fields of record Order. Check Order.java.",
            },
            { path: "name", equals: "Kwek-kwek", message: "This order should be for Kwek-kwek (snack_id 3)." },
            { path: "qty", equals: 2, message: "qty should be 2." },
            { path: "total", equals: 40, message: "total should be 40 (20 × 2). Is it snack.price() * request.qty()?" },
          ],
          hint: "If it printed a 415, the headers part is missing. A 404 saying 'No snack with id …' means check snack_id is 3; a 404 saying 'No static resource api/orders' means your app has no /api/orders yet, so restart it. A 405 means only the GET method exists: add placeOrder.",
          solution: PLACE_ORDER_D3,
          example: '{"order_id":1,"snack_id":3,"name":"Kwek-kwek","qty":2,"total":40}',
          explain: "Week 6's order, received by your Java, priced by your Java, and answered with 201 Created.",
        },
        {
          goal: "Place one more order: 1 Turon. In the console press ↑ to get your last line back, change snack_id: 3 to snack_id: 2 and qty: 2 to qty: 1, and press Enter. Then open localhost:8080/api/orders in a browser tab, select everything (Ctrl+A), copy (Ctrl+C) and paste the whole list here.",
          url: "localhost:8080/api/orders",
          checks: [
            { is: "array", message: "This should be a list of orders, starting with [." },
            { min: 2, message: "Fewer than two orders. Place the Kwek-kwek order and the Turon order without restarting in between: a restart empties the list." },
            { some: { name: "Kwek-kwek", qty: 2, total: 40 }, message: "The Kwek-kwek × 2 order (total 40) isn't in the list." },
            { some: { name: "Turon", qty: 1, total: 12 }, message: "The Turon × 1 order (total 12) isn't in the list." },
          ],
          hint: "A 405 here means your app has no @GetMapping(\"/api/orders\") yet: add listOrders and restart.",
          solution: LIST_ORDERS,
          example: '[{"order_id":1,"snack_id":3,"name":"Kwek-kwek","qty":2,"total":40},{"order_id":2,"snack_id":2,"name":"Turon","qty":1,"total":12}]',
          explain: "Every order since the app started. Next week this list lives in MySQL and survives restarts.",
        },
        {
          goal: "Now the 415: the same order WITHOUT the headers part. Run this line and paste the answer. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          url: "POST localhost:8080/api/orders (no Content-Type)",
          command: "fetch(\"/api/orders\", { method: \"POST\", body: JSON.stringify({ snack_id: 3, qty: 2 }) }).then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)",
          checks: [
            { is: "object", message: "This should be one error object, starting with {." },
            { path: "status", equals: 415, message: "The status should be 415. If you got 201, the headers part is still in your line: delete it for this one." },
            { path: "message", contains: "text/plain", message: "The message should name text/plain. If there's no message, check application.properties has spring.web.error.include-message=always." },
          ],
          hint: "Delete exactly  headers: { \"Content-Type\": \"application/json\" },  and keep method and body.",
          solution: "headers: { \"Content-Type\": \"application/json\" },",
          example: '{"timestamp":"2026-10-11T13:11:37.170Z","status":415,"error":"Unsupported Media Type","message":"Content-Type \'text/plain;charset=UTF-8\' is not supported.","path":"/api/orders"}',
          explain: "You'll put that header back in Friday's order.js, and now you know exactly what it does.",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-orders",
      title: "📸 Hand in: an order your app took",
      intro: "Proof that your own app receives a POST and remembers the order.",
      steps: [
        "With your app running, open localhost:8080/order.html and the console. Place an order with the console line.",
        "Open localhost:8080/api/orders in a second tab.",
        "Put the two side by side: drag the second tab out of the browser so it becomes its own window, then press Windows+← on one window and Windows+→ on the other. The console's answer and the orders list, with both address bars, must be visible.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves: "that your own app at localhost:8080 accepts a POST to /api/orders and lists that order at GET /api/orders.",
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "POST adds new ways to be refused. Every patient here got an answer; read its status and message.",
      missions: [
        {
          task: "Patient 1. The console prints status 415:  Content-Type 'text/plain;charset=UTF-8' is not supported.",
          hint: "Which part of the fetch() options tells the server the body is JSON?",
          check: {
            question: "Fix?",
            choices: [
              "Add headers: { \"Content-Type\": \"application/json\" } to the fetch() options",
              "Use GET instead",
              "Restart the app",
            ],
            answer: 0,
            explain: "Without the header, the browser says the body is plain text, and Spring refuses it.",
          },
        },
        {
          task: "Patient 2. The fetch has the header, but the body is  body: { snack_id: 3, qty: 2 }  (no JSON.stringify). The answer is 400:  Cannot deserialize value of type OrderRequest from Array value.",
          hint: "fetch() sends the body as text. What text does a JavaScript object become when it's forced into text? (Week 6 met it as [object Object].)",
          check: {
            question: "Why 'Array value', when nobody sent an array?",
            choices: [
              "Spring is broken",
              "The object was sent as the text [object Object]. It starts with [, so Spring thinks an array is starting, and an OrderRequest can't be an array. Wrap it: JSON.stringify({ snack_id: 3, qty: 2 })",
              "qty must be in quotes",
            ],
            answer: 1,
            explain: "The error message describes what Spring saw, not what you meant. When it seems to make no sense, ask what was really sent.",
          },
        },
        {
          task: "Patient 3. The body is  JSON.stringify({ snackId: 3, qty: 2 }).  The answer is 400:  Cannot map `null` into type `int`.",
          hint: "Compare the key snackId with the field names in OrderRequest.",
          check: {
            question: "Diagnosis?",
            choices: [
              "3 is too big",
              "The JSON has no snack_id key, so snack_id has no value (null). An int can't be null, so Spring refuses the order. The key must be snack_id",
              "int fields aren't allowed in records",
            ],
            answer: 1,
            explain: "Spring Boot 4 refuses a missing number instead of quietly using 0. The terminal shows the same message, so read it there too.",
          },
        },
        {
          task: "Patient 4. Opening localhost:8080/api/orders in the browser gives a Whitelabel page: Method Not Allowed, status 405. The controller has  @PostMapping(\"/api/orders\")  but nothing else for that address.",
          hint: "What method does the browser send when you open an address?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The address exists, but only for POST. The browser sends a GET, so it's refused with 405. Add the @GetMapping(\"/api/orders\") method listOrders",
              "The orders list is empty",
              "405 means the app crashed",
            ],
            answer: 0,
            explain: "404: no such address. 405: the address exists, but not for this method.",
          },
        },
        {
          task: "Patient 5. A student placed five orders, went to lunch, restarted the app, and /api/orders now answers [].",
          hint: "Where were the orders kept?",
          check: {
            question: "What happened?",
            choices: [
              "Someone deleted them",
              "The orders were in a Java list in memory, and a restart starts with a new, empty list. Nothing is broken; that's why next week uses MySQL",
              "The GET method is broken",
            ],
            answer: 1,
            explain: "Memory belongs to the running program. A database keeps data between runs.",
          },
        },
        {
          task: "Patient 6. Every order answers 500 with  message: No message available.  The orders line says  private final List<Order> orders = List.of();",
          hint: "Day 1 used List.of for the snacks. Did anything ever add to that list? Read the terminal: it names the exception.",
          check: {
            question: "Diagnosis?",
            choices: [
              "Orders can't be stored in lists",
              "The order is too big",
              "A List.of list can never change. orders.add(order) throws an exception, so Spring answers 500. Use new ArrayList<>(), which can grow",
            ],
            answer: 2,
            explain: "500 means your code threw something. The JSON says little, but the terminal's red lines say UnsupportedOperationException and the line number. Always read the terminal for a 500.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for reading a refused POST.",
          hint: "Think: the status code says WHAT kind of problem, the message says which one, and for a 500 the terminal says where.",
          input: "Paste your six notes and your rule",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-unread-order",
    title: "⚔️ Boss battle: The Unread Order",
    intro: "The Unread Order sends JSON your app can't read. Get every part right.",
    boss: { name: "the Unread Order", emoji: "📭" },
    questions: [
      {
        prompt: "Which annotation turns the request's JSON body into an OrderRequest?",
        choices: ["@RequestBody", "@RequestParam", "@PathVariable"],
        answer: 0,
        explain: "@RequestBody reads the body; the others read the address.",
      },
      {
        prompt: "What status does a successful POST /api/orders answer in your app?",
        choices: ["200", "201", "204"],
        answer: 1,
        explain: "@ResponseStatus(HttpStatus.CREATED) makes it 201 Created.",
      },
      {
        prompt: "A fetch POST without the Content-Type header gets…",
        choices: ["201", "404", "415 Unsupported Media Type"],
        answer: 2,
        explain: "The browser labels the body as plain text, and Spring won't read it.",
      },
      {
        prompt: "Why does the app, not the page, work out the total?",
        choices: [
          "Pages can't multiply",
          "A total sent by the browser could be anything; the app uses its own prices",
          "JSON can't hold totals",
        ],
        answer: 1,
        explain: "Never trust prices from the client.",
      },
      {
        prompt: "The body is {\"snackId\":3,\"qty\":2}. What happens?",
        choices: ["400: snack_id is missing, and an int can't be null", "201 with snack 0", "404"],
        answer: 0,
        explain: "The keys must match the record's field names exactly.",
      },
      {
        prompt: "Why new ArrayList<>() and not List.of() for the orders?",
        choices: ["ArrayList is shorter", "List.of is only for snacks", "List.of can never change, so adding an order fails"],
        answer: 2,
        explain: "Orders grow; the menu doesn't.",
      },
      {
        prompt: "The browser shows 405 for localhost:8080/api/orders. What's missing?",
        choices: ["A @GetMapping for /api/orders", "The orders list", "A restart of Live Server"],
        answer: 0,
        explain: "The browser sends GET; the address only accepted POST.",
      },
      {
        prompt: "Why are the orders gone after a restart?",
        choices: ["They were deleted by Spring on purpose", "They lived in memory, and a restart starts a new list", "The browser forgot them"],
        answer: 1,
        explain: "Week 8 keeps them in MySQL.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "The journey of one order: what the page sends, what your Java does, what it answers.",
      "Why OrderRequest and Order are two different records.",
      "What 415 and 405 each mean, in your own words.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your app takes orders. But it takes ANY order: 0 Kwek-kwek, or 500. Tomorrow it learns to say no, politely and clearly.",
  },
};
