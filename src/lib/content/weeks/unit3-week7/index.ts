import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit3Week7: Week = {
  slug: "unit3-week7",
  unit: "Unit 3 · REST APIs with Spring Boot",
  title: "Week 7 — Your app answers in JSON",
  summary:
    "For two weeks your Java app has only handed out files: HTML, CSS, JavaScript and a rows.json you typed. This week the Java side starts answering. You write endpoints: Java methods that answer an address like /api/snacks with JSON, the same JSON your menu.js already knows how to show. By Thursday your app can find one snack, filter the menu, take an order and say clearly when something is wrong. On Friday your own pages switch over: the menu loads from your app, and the order form sends its order to your app instead of only logging it. The snacks still live in a Java list this week; next week they come from your MySQL ledger, and the pages won't need to change at all.",
  objectives: [
    "Read an HTTP request and response: the method (GET, POST), the address, the status code (200, 201, 400, 404, 500) and the JSON body, in the browser's Network tab",
    "Write a @RestController whose methods answer GET requests with JSON, from a Java record and a list",
    "Take part of the address as input: a path variable (/api/snacks/2) and a request parameter (?maxPrice=12)",
    "Answer a request that can't be served with the right status code and a message, instead of an empty page or a 500",
    "Receive JSON in a POST with @RequestBody, and send one from the browser with fetch() and the right Content-Type",
    "Connect your own pages to your own API: the menu loads with fetch(\"/api/snacks\") and the order form posts to /api/orders",
  ],
  video: {
    title: "Spring Boot REST: a short track from several channels",
    playlistUrl: "https://www.youtube.com/results?search_query=spring+boot+rest+api+beginners",
    watchNotes: [
      "Bro Code doesn't teach Spring, so this week's videos come from several channels, each picked for one idea. They use slightly different tools than you. These notes say what to do differently, so read them before Day 1.",
      "Never write @GetMapping(\"/\"). In the Day 1 video he maps \"/\" to say hello world. In YOUR project, \"/\" is your index.html, and a controller method at \"/\" hides it: localhost:8080 would show the text instead of your front page. Every endpoint you write this week starts with /api/.",
      "Older videos use spring-boot-starter-web and Spring Boot 3. Your project is Spring Boot 4, where the same thing is called spring-boot-starter-webmvc. Everything they type in Java works the same.",
      "Several videos test with Postman, a separate program. You don't need it: for GET you type the address into the browser, and for POST you use fetch() in the browser's console, which you already learned in Week 6.",
      "Some videos make a controllers folder for their controller files. You can, but it must be INSIDE the folder that holds CanteenWebApplication.java. A controller anywhere else is never found, and every address answers 404.",
      "After EVERY change to a .java file, restart the app: the red square to stop, then Run above main. Live Server's auto-reload never runs Java. Most 'my change did nothing' problems this week are a missing restart.",
      "If Run ever shows 'Build failed, do you want to continue?' with the buttons Continue, Always Continue and Fix..., never click Continue or Always Continue: both start the app with the broken code, and Always Continue also makes VS Code stop asking for good. Click Fix... or close the message. The Problems panel opens by itself (Ctrl+Shift+M if it doesn't): fix every red error it lists, then Run again. If someone ever clicked Always Continue, undo it: File → Preferences → Settings, search onBuildFailureProceed, and untick it.",
      "New .java files get the same first line as CanteenWebApplication.java: the line that starts with package. Copy it from there every time.",
      "In Spring Boot 4, the setting that puts your own error messages into the JSON is spring.web.error.include-message. Older videos and websites say server.error.include-message, which Spring Boot 4 ignores without any warning. Day 2 shows you where it goes.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "MDN — An overview of HTTP",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview",
      note: "Day 1: requests, responses, methods and status codes. Read 'HTTP flow' and 'HTTP Messages'. The reading-track version of the REST video.",
    },
    {
      label: "Spring guide — Building a RESTful Web Service",
      url: "https://spring.io/guides/gs/rest-service",
      note: "Day 1: the official first endpoint, a @RestController that answers JSON from a record. Skip the parts about Gradle and building a JAR.",
    },
    {
      label: "MDN — HTTP response status codes",
      url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status",
      note: "Days 2 and 4: what 200, 201, 400, 404, 405, 415 and 500 mean. Look up any code your app gives you here.",
    },
    {
      label: "Spring reference — @RequestParam",
      url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html",
      note: "Day 2: the official page for ?maxPrice=12. Short; read the first example and the part about required = false.",
    },
    {
      label: "Spring reference — Mapping Requests (URI patterns)",
      url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html",
      note: "Day 2: search the page for 'URI patterns' to see {id} placeholders and @PathVariable. A long page; you only need that section.",
    },
    {
      label: "Spring reference — @RequestBody",
      url: "https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html",
      note: "Day 3: how the JSON in a POST becomes a Java object. Read the first example.",
    },
    {
      label: "MDN — Using the Fetch API: supplying request options",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      note: "Days 3 and 5: method, headers and body in fetch(). Read 'Setting a body' and 'Setting headers'.",
    },
    {
      label: "Spring API docs — ResponseStatusException",
      url: "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/server/ResponseStatusException.html",
      note: "Days 2 and 4: the class you throw for a 404 or 400. Read the first paragraph, then find the constructor that takes a status and a String reason: that's the one you use.",
    },
  ],
  activity: {
    title: "The canteen's own API",
    goal: "Your canteen-web project answers /api/snacks, /api/snacks/{id}, /api/snacks?maxPrice=… and /api/orders in JSON, with honest errors, and your menu and order pages use it.",
    steps: [
      "Day 1: GET /api/snacks from a record and a list.",
      "Day 2: GET /api/snacks/{id} with a real 404, and ?maxPrice.",
      "Day 3: POST /api/orders with @RequestBody, and GET /api/orders.",
      "Day 4: 400 and 404 for bad orders, and reading a 500.",
      "Day 5: menu.js and order.js switch to the API.",
    ],
    twist:
      "Your tables page gets an endpoint of its own: /api/rows answers with the same rows you typed into rows.json last week, now from a Java record whose fields are YOUR Week 3 columns. Nobody else's app has that endpoint.",
    deliverables: [
      "Screenshots of your endpoints and pages at localhost:8080",
      "Your app's JSON answers, pasted into the checkpoints",
      "The self-check and the exit tickets",
    ],
  },
  selfCheck: [
    {
      question: "You opened localhost:8080/api/snacks/99 and got status 404 with your message 'No snack with id 99'. Is your app broken?",
      answer:
        "No, it's working exactly right. 404 is the honest answer to 'give me snack 99' when there is no snack 99. A broken app would answer 500, or 200 with an empty page.",
    },
    {
      question: "What's the difference between /api/snacks/2 and /api/snacks?maxPrice=12?",
      answer:
        "/2 is a path variable: it names ONE thing, snack 2, so the method has @PathVariable int id. ?maxPrice=12 is a request parameter: an option that filters the list, so the method has @RequestParam. One picks a thing, the other narrows a list.",
    },
    {
      question: "Your fetch() POST gets status 415 Unsupported Media Type. What's missing?",
      answer:
        "The header headers: { \"Content-Type\": \"application/json\" }. Without it the browser says the body is plain text, and Spring refuses to read plain text as an order.",
    },
    {
      question: "Why does your controller throw ResponseStatusException(HttpStatus.NOT_FOUND, …) instead of returning null?",
      answer:
        "Returning null makes Spring answer 200 OK with nothing in it, which tells the page 'everything worked' when it didn't. Throwing with NOT_FOUND answers 404 with your message, so the page, and you, know exactly what happened.",
    },
    {
      question: "You restarted the app and every order you placed is gone. Why?",
      answer:
        "The orders live in a Java list in memory, and a restart starts a new, empty list. That's this week's limit on purpose. Next week the orders go into MySQL, which keeps them.",
    },
  ],
  status: "available",
};
