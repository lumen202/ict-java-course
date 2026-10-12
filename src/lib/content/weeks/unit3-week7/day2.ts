// unit3-week7 · Day 2 — One snack, a filter, and an honest 404
//
// @PathVariable (GET /api/snacks/{id}), ResponseStatusException for a 404 with
// a message, and @RequestParam(required = false) Integer maxPrice. Also the
// Spring Boot 4 property spring.web.error.include-message=always: without it
// the error JSON carries no "message" at all, and the Boot 2/3 name
// server.error.include-message is ignored silently (deprecated "since 4.0.0",
// replacement spring.web.error.include-message — read from the metadata in
// spring-boot-web-server-4.1.1.jar, 2026-10-11).
//
// Observed on the real 4.1.1 build: /api/snacks/99 → 404 with our message;
// /api/snacks/abc → 400 "Method parameter 'id': Failed to convert…"; a
// required `int maxPrice` left out → 400 "Required parameter 'maxPrice' is not
// present."; a method returning null → 200 with an empty body. The json-check
// examples are that build's real answers. Code fragments and the whole-file
// block are built from the same constants, so they can't drift apart.
// Videos (transcripts read): Sasan Azizian on request mapping (T9aFOSHSQ2g,
// 6:15, 2026) and ByteByteGo on status codes (qmpUfWN7hh4, 5:06; ends with a
// newsletter plug).

import type { DayPlan } from "../../types";

export const NEW_IMPORTS_D2 =
  "import java.util.ArrayList;\nimport org.springframework.http.HttpStatus;\nimport org.springframework.web.bind.annotation.PathVariable;\nimport org.springframework.web.bind.annotation.RequestParam;\nimport org.springframework.web.server.ResponseStatusException;";

export const GET_SNACK =
  "@GetMapping(\"/api/snacks/{id}\")\npublic Snack getSnack(@PathVariable int id) {\n    for (Snack s : snacks) {\n        if (s.snack_id() == id) {\n            return s;\n        }\n    }\n    throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id);\n}";

export const LIST_SNACKS =
  "@GetMapping(\"/api/snacks\")\npublic List<Snack> listSnacks(@RequestParam(required = false) Integer maxPrice) {\n    if (maxPrice == null) {\n        return snacks;\n    }\n    List<Snack> cheap = new ArrayList<>();\n    for (Snack s : snacks) {\n        if (s.price() <= maxPrice) {\n            cheap.add(s);\n        }\n    }\n    return cheap;\n}";

export const indent = (code: string) => code.split("\n").map((l) => (l ? `    ${l}` : l)).join("\n");

export const SNACKS_FIELD = `    private final List<Snack> snacks = List.of(
        new Snack(1, "Banana cue", 15),
        new Snack(2, "Turon", 12),
        new Snack(3, "Kwek-kwek", 20),
        new Snack(4, "Gulaman", 10),
        new Snack(5, "Siopao", 25),
        new Snack(6, "Pastillas", 8)
    );`;

export const INFO_METHOD = `    @GetMapping("/api/info")
    public CanteenInfo info() {
        return new CanteenInfo("Aling Nena's Canteen", "7:00", "16:00");
    }`;

const WHOLE_CONTROLLER = `import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class SnackController {

    record CanteenInfo(String name, String opens, String closes) {
    }

${SNACKS_FIELD}

${indent(LIST_SNACKS)}

${INFO_METHOD}

${indent(GET_SNACK)}
}`;

export const day2: DayPlan = {
  day: "Day 2",
  focus: "One snack by its id, cheap snacks only, and an honest 404 when a snack doesn't exist",
  warmupGame: {
    kind: "quest",
    id: "warmup-addresses",
    title: "🔎 Warm-up: an address can carry a question",
    intro: "Yesterday every address was fixed: /api/snacks. Today part of the address is the question.",
    missions: [
      {
        task: "In Week 4 you wrote PreparedStatements like  SELECT name, price FROM snacks WHERE snack_id = ?  and filled the ? with a number, using setInt.",
        hint: "Which part of /api/snacks/2 changes from one request to the next?",
        check: {
          question: "Which address is the web version of that query for snack 2?",
          choices: [
            "localhost:8080/api/snacks/2 — the number in the address fills the ?",
            "localhost:8080/api/snacks",
            "localhost:8080/lookupSnack.html",
          ],
          answer: 0,
          explain: "The 2 in the address is a path variable. Your Java method receives it as a parameter, int id, and uses it like the ? in your PreparedStatement.",
        },
      },
      {
        task: "In Week 6 you filtered snacks in the browser's console:  snacks.filter(snack => snack.price <= 12).",
        hint: "Look for the part after the ? in an address. What do those name=value pairs do?",
        check: {
          question: "Which address asks your app for the snacks of ₱12 and under?",
          choices: [
            "localhost:8080/api/snacks/12",
            "localhost:8080/api/snacks?maxPrice=12 — an option after the ?, like a WHERE price <= 12",
            "localhost:8080/api/cheap",
          ],
          answer: 1,
          explain: "/12 would mean 'snack number 12'. ?maxPrice=12 means 'the list, but only up to 12'. One names a thing, the other filters a list.",
        },
      },
      {
        task: "Somebody opens localhost:8080/api/snacks/99. There's no snack 99.",
        hint: "Which status code means 'there's nothing at this address'?",
        check: {
          question: "What should your app answer?",
          choices: [
            "Status 200 with an empty page",
            "Status 500",
            "Status 404 Not Found, with a message saying there's no snack 99",
          ],
          answer: 2,
          explain: "An honest status tells the page what happened. 200 with nothing would say 'it worked' when it didn't; 500 would say your app is broken when it isn't.",
        },
      },
    ],
  },
  videos: [
    {
      title: "Spring Boot Request Mapping Explained (Sasan Azizian)",
      youtubeId: "T9aFOSHSQ2g",
      length: "6:15",
      practice: {
        intro: "His examples are students (/students/15, ?major=CS). Write the canteen versions:",
        steps: [
          "In notes.md, write his rule in your own words: when do you use @PathVariable, and when @RequestParam?",
          "Under it, write which one each of these needs: /api/snacks/2, /api/snacks?maxPrice=12, /api/orders/5, /api/snacks?name=turon.",
        ],
        note: "He shows @RequestMapping first, then @GetMapping. You use @GetMapping: it's the same thing for GET only, and easier to read.",
      },
    },
    {
      title: "HTTP Status Codes Explained In 5 Minutes (ByteByteGo)",
      youtubeId: "qmpUfWN7hh4",
      length: "5:06",
      practice: {
        intro: "He goes through all the families. Keep the ones this week uses:",
        steps: [
          "In notes.md, make a short table: 200, 201, 400, 404, 405, 415 and 500, each with one line on what it means. He covers most of them; look up 405 and 415 on MDN (the link is in this week's reading list).",
          "Next to each, write who made the mistake: the request (4xx) or the server (5xx).",
        ],
        note: "He ends by recommending his newsletter. You can stop there.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: one snack, a filter, and a real 404",
      intro: "Everything goes into the SnackController.java you made yesterday, plus one line in application.properties. Restart after each change.",
      missions: [
        {
          task: "Open src/main/resources/application.properties (in the resources folder, next to static). Add this line at the very end, then save:",
          code: "spring.web.error.include-message=always",
          hint: "The file already has a line like spring.application.name=canteen-web. Put the new line under it, on its own line, with no spaces around the =.",
          check: {
            question: "Many websites say server.error.include-message=always instead. Why does this course use spring.web.error.include-message?",
            choices: [
              "Both work the same",
              "Your project is Spring Boot 4, which renamed the setting. The old name is ignored without any warning, so your error messages would never appear",
              "server.error is for databases",
            ],
            answer: 1,
            explain: "This setting makes Spring put YOUR message ('No snack with id 99') into the error JSON. Without it, the JSON says only 'Not Found'.",
          },
        },
        {
          task: "In SnackController.java, add these five import lines at the top, right under the line  import java.util.List;",
          code: NEW_IMPORTS_D2,
          hint: "The order of import lines doesn't matter, but every one must be above the line @RestController. Lines VS Code shows in grey are imports nothing uses yet; they turn normal once the code below uses them.",
          check: {
            question: "What is an import line for?",
            choices: [
              "It tells Java which package a class comes from, so you can write HttpStatus instead of its full name",
              "It downloads the class from the internet",
              "It makes the app faster",
            ],
            answer: 0,
            explain: "Same idea as import java.sql.*; in Week 4, and import java.util.List; in your SnackController. Spring's classes live in packages like org.springframework.http.",
          },
        },
        {
          task: "Now the endpoint for one snack. In SnackController.java, find the very last } of the file (it closes the class). Just above it, below the info() method, type:",
          code: indent(GET_SNACK),
          hint:
            "{id} in the address is a placeholder; @PathVariable int id receives its value. The loop is plain Java, like a Week 4 while (rs.next()). s.snack_id() is how you read a record's field: its name followed by (). If no snack matches, the throw line ends the method with a 404.",
          check: {
            question: "What happens for /api/snacks/99?",
            choices: [
              "The method returns null and the page is blank",
              "The app crashes and stops",
              "The loop finds nothing, so the method reaches the throw line: Spring answers status 404 with the message 'No snack with id 99'",
            ],
            answer: 2,
            explain: "ResponseStatusException is how a controller says 'this request can't be served, and here's why'. The app keeps running; only this request gets the 404.",
          },
        },
        {
          task: "Restart the app. Open these three, one at a time, and look at each answer: localhost:8080/api/snacks/2, then localhost:8080/api/snacks/99, then localhost:8080/api/snacks/abc.",
          hint:
            "For 99 your browser shows a Whitelabel page, because it asks for a web page. Your pages' fetch() calls get the same answer as JSON. To see the JSON, open the console on the page (F12 → Console) and type:  fetch(\"/api/snacks/99\").then(r => r.text()).then(t => console.log(t))  then press Enter. If you paste instead of typing and the browser warns you, type  allow pasting  and press Enter, then paste again. Chrome also prints its own red line, GET …/api/snacks/99 404 (Not Found): that's the browser reporting the status, not a mistake in your code.",
          check: {
            question: "/api/snacks/abc gives status 400 Bad Request, not 404. Why?",
            choices: [
              "abc is a snack that doesn't exist",
              "Your method needs an int, and abc can't be turned into a number. Spring refuses the request before your method even runs: the request itself is wrong",
              "400 and 404 mean the same",
            ],
            answer: 1,
            explain: "404: the request makes sense, but there's no such snack. 400: the request doesn't make sense. Both are the client's mistake (4xx).",
          },
        },
        {
          task: "Now the filter. In SnackController.java, delete your listSnacks method (the @GetMapping(\"/api/snacks\") line and the three lines under it, down to its closing }) and type this in its place:",
          code: indent(LIST_SNACKS),
          hint:
            "required = false means ?maxPrice may be left out. Then maxPrice is null, and the method returns the whole list as before. It's Integer, not int, because int can't be null. List<Snack> cheap = new ArrayList<>(); makes a new, empty list to fill.",
          check: {
            question: "Why is maxPrice an Integer and not an int?",
            choices: [
              "Integer is faster",
              "Spring needs Integer for numbers",
              "When ?maxPrice is missing, the value is null, and an int can't hold null. With required = false and an int, Spring can't put the missing value anywhere, and the request crashes with a 500",
            ],
            answer: 2,
            explain: "Integer can be null, so 'no filter' has somewhere to go. Leave out required = false as well and you get error clinic patient 2's 400 instead.",
          },
        },
        {
          task: "Restart and try: localhost:8080/api/snacks?maxPrice=12, then ?maxPrice=20, then plain localhost:8080/api/snacks (it must still list all six).",
          hint: "?maxPrice=12 should give three snacks: Turon, Gulaman and Pastillas. If it gives all six, check the if (s.price() <= maxPrice) line.",
          check: {
            question: "What does localhost:8080/api/snacks?maxPrice=5 answer?",
            choices: [
              "[] — an empty list, status 200. Asking for a filter that matches nothing isn't an error",
              "Status 404",
              "Status 500",
            ],
            answer: 0,
            explain: "An empty result is still a correct answer, the same as a SELECT … WHERE that returns 0 rows. 404 is for a thing that doesn't exist, like snack 99.",
          },
        },
        {
          task: "Your whole SnackController.java should now look like this (line 1 is your package line). Compare it line by line, fix any difference, and restart. Blank lines and the order of the import lines don't matter; everything else should match.",
          code: WHOLE_CONTROLLER,
          hint: "Most common differences: an import missing, listSnacks still the old version, or getSnack typed after the last } instead of before it.",
        },
        {
          task: "Add today to notes.md: what @PathVariable and @RequestParam each do, with one of your own addresses for each, and the three status codes you saw today (200, 404, 400) with what caused each.",
          hint: "Use the addresses you actually opened.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-snack-by-id",
      title: "🧪 Checkpoint: one snack, a 404, a filter",
      intro:
        "For each address: open it with your app running, then copy the JSON and paste it here. For the two error answers the browser shows a Whitelabel page instead, so the checkpoint gives you a console line that gets the JSON and copies it for you.",
      tasks: [
        {
          goal: "Paste what your app answers for snack 2.",
          url: "localhost:8080/api/snacks/2",
          checks: [
            { is: "object", message: "This should be ONE snack, starting with {. If it starts with [, your address is /api/snacks instead of /api/snacks/2." },
            { path: "snack_id", equals: 2, message: "snack_id should be 2. Does your loop compare s.snack_id() == id?" },
            { path: "name", equals: "Turon", message: "Snack 2 should be Turon." },
          ],
          hint: "If you get a Whitelabel 404 for /api/snacks/2, check the address in your code is \"/api/snacks/{id}\", with curly brackets, and restart.",
          solution: GET_SNACK,
          example: '{"snack_id":2,"name":"Turon","price":12}',
          explain: "One request, one snack. The path variable did the job of Week 4's ?.",
        },
        {
          goal: "Paste the 404 answer for snack 99. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          url: "localhost:8080/api/snacks/99",
          command: "fetch(\"/api/snacks/99\").then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)",
          checks: [
            { is: "object", message: "This should be one error object, starting with {. Copy the line the console printed, not the Whitelabel page." },
            { path: "status", equals: 404, message: "The status should be 404. If the console printed nothing at all, your method returns null instead of throwing; if it says 500, read the terminal." },
            {
              path: "message",
              is: "string",
              message: "The answer has no message. Add spring.web.error.include-message=always to application.properties (spring.web, not server.error), save and restart.",
            },
            { path: "message", contains: "99", message: "The message should say which id wasn't found: \"No snack with id \" + id." },
          ],
          hint: "The console must be open on a page at localhost:8080 (not Live Server), with your app running. If the browser warns about pasting, type  allow pasting  and press Enter first.",
          solution: "throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"No snack with id \" + id);\n\n// and in application.properties:\nspring.web.error.include-message=always",
          example: '{"timestamp":"2026-10-11T13:25:47.871Z","status":404,"error":"Not Found","message":"No snack with id 99","path":"/api/snacks/99"}',
          explain: "An honest 404 with a reason. On Friday your page reads exactly this message and shows it to the customer.",
        },
        {
          goal: "Paste what your app answers for ?maxPrice=12.",
          url: "localhost:8080/api/snacks?maxPrice=12",
          checks: [
            { is: "array", message: "This should be a list, starting with [." },
            { min: 3, message: "Fewer than three snacks. Turon (12), Gulaman (10) and Pastillas (8) are all ₱12 or less. Turon missing? 12 is 'at most 12', so the if needs <=, not <." },
            { everyAtMost: { key: "price", max: 12 }, message: "A snack costing more than 12 is in the answer. Check the line if (s.price() <= maxPrice)." },
            { some: { name: "Turon", price: 12 }, message: "Turon (₱12) is missing. 12 is 'at most 12', so use <=, not <." },
          ],
          hint: "If you get all six snacks, maxPrice isn't arriving: check @RequestParam(required = false) Integer maxPrice and that the address says maxPrice with a capital P.",
          solution: LIST_SNACKS,
          example: '[{"snack_id":2,"name":"Turon","price":12},{"snack_id":4,"name":"Gulaman","price":10},{"snack_id":6,"name":"Pastillas","price":8}]',
          explain: "A WHERE price <= 12, done in Java. Next week MySQL does this part for you.",
        },
        {
          goal: "Paste the answer for a snack id that isn't a number. If Ctrl+V pastes the command instead of the answer, select the line the console printed under it (it starts with {), copy it with Ctrl+C, and paste that.",
          url: "localhost:8080/api/snacks/abc",
          command: "fetch(\"/api/snacks/abc\").then(r => r.text()).then(t => { console.log(t); return t; }).then(copy)",
          checks: [
            { is: "object", message: "This should be one error object, starting with {." },
            { path: "status", equals: 400, message: "The status should be 400 Bad Request: abc can't become an int. If you see 404, check you typed abc, not a number." },
          ],
          hint: "You don't need to write any code for this one. Spring answers it by itself, because your method takes an int.",
          solution: "@GetMapping(\"/api/snacks/{id}\")\npublic Snack getSnack(@PathVariable int id) {",
          example: '{"timestamp":"2026-10-11T13:25:47.893Z","status":400,"error":"Bad Request","message":"Method parameter \'id\': Failed to convert value of type \'java.lang.String\' to required type \'int\'; For input string: \\"abc\\"","path":"/api/snacks/abc"}',
          explain: "Spring checked the request for you: an int parameter only accepts numbers.",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Today's patients answer, but with the wrong status, or without the message that would explain it.",
      missions: [
        {
          task: "Patient 1. The error JSON for /api/snacks/99 has status 404 but no message key. Their application.properties says  server.error.include-message=always.",
          hint: "Compare their setting's name with the one in today's lab, word by word.",
          check: {
            question: "Diagnosis?",
            choices: [
              "The message is too long to show",
              "That's the old Spring Boot 2/3 name. Spring Boot 4 ignores it without a warning. The name is spring.web.error.include-message",
              "Messages only show for 500",
            ],
            answer: 1,
            explain: "A setting with a wrong name doesn't cause an error: it just does nothing. When a setting 'doesn't work', check its exact name for your version first.",
          },
        },
        {
          task: "Patient 2. Plain localhost:8080/api/snacks now answers 400:  Required parameter 'maxPrice' is not present.  The method says  @RequestParam int maxPrice.",
          hint: "What happens when the address has no ?maxPrice at all? Can an int be 'nothing'?",
          check: {
            question: "Fix?",
            choices: [
              "@RequestParam(required = false) Integer maxPrice — optional, and Integer so it can be null when it's missing",
              "Always type ?maxPrice in the address",
              "Delete @RequestParam",
            ],
            answer: 0,
            explain: "By default a @RequestParam is required. An optional filter needs required = false, and a type that can hold null.",
          },
        },
        {
          task: "Patient 3. localhost:8080/api/snacks/99 shows a completely blank page. The Network tab says status 200. The method ends with  return null;  instead of a throw.",
          hint: "200 means 'it worked'. Did it?",
          check: {
            question: "Why is this worse than a 404?",
            choices: [
              "It isn't, a blank page is fine",
              "200 tells the page the request worked, so the page carries on with nothing and shows a blank or broken menu. A 404 with a message says what went wrong",
              "null makes the app slower",
            ],
            answer: 1,
            explain: "Replace return null; with throw new ResponseStatusException(HttpStatus.NOT_FOUND, …).",
          },
        },
        {
          task: "Patient 4. localhost:8080/api/snacks/turon answers 400 Bad Request, with the message  Failed to convert value of type 'java.lang.String' to required type 'int'.",
          hint: "What type is the id parameter? Is 'turon' that type?",
          check: {
            question: "What's wrong?",
            choices: [
              "Turon isn't on the menu",
              "The controller is broken",
              "Nothing in the code. /api/snacks/{id} takes a number, so the request was wrong. Ask for /api/snacks/2",
            ],
            answer: 2,
            explain: "Not every patient is sick: a 400 for a wrong request is your app doing its job. To find a snack by name, today's make-your-own suggests a ?name= filter.",
          },
        },
        {
          task: "Patient 5. localhost:8080/api/snacks/2 answers 404, but /api/snacks works. The method is mapped as  @GetMapping(\"/api/snacks/id\").",
          hint: "Look closely at the address in the annotation. How does Spring know id is a placeholder and not the word 'id'?",
          check: {
            question: "Fix?",
            choices: [
              "@GetMapping(\"/api/snacks/{id}\") — curly brackets make id a placeholder. Without them, the method only answers the exact address /api/snacks/id",
              "Use @RequestParam instead",
              "Restart the app",
            ],
            answer: 0,
            explain: "{id} in the address and @PathVariable int id in the method go together.",
          },
        },
        {
          task: "Patient 6. VS Code underlines  s.snack_id  (with no brackets) in red, saying the field is not visible.",
          hint: "How do you read a record's field from outside the record? Look at today's loop.",
          check: {
            question: "Fix?",
            choices: [
              "Make the record public",
              "Write s.snack_id() with brackets. A record's fields are private; Java gives you a method with the same name to read each one",
              "Use s.getSnack_id()",
            ],
            answer: 1,
            explain: "A record makes the reader methods for you, and they're named exactly like the fields: snack_id(), name(), price().",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for choosing between 400, 404 and 500.",
          hint: "Ask: is the request itself wrong (400), is the thing missing (404), or did my code fail (500)?",
          input: "Paste your six notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own endpoint",
      intro: "Add one more GET endpoint of your own to SnackController. Do at least one idea; if you have time, do more. There's no upper limit.",
      missions: [
        {
          task: "Pick one idea, or invent your own: (1) GET /api/snacks/cheapest answers the one snack with the lowest price; (2) a ?name= filter on /api/snacks, so ?name=tur finds Turon (lowercase both sides, like Week 6's search); (3) GET /api/snacks/count answers how many snacks there are, as a number.",
          hint:
            "Each idea is a new method with its own @GetMapping, placed above the last } of the class. Idea 1 is a loop that remembers the cheapest snack so far. For idea 2, add a second @RequestParam(required = false) String name to listSnacks. Keep today's checkpoint passing: /api/snacks/2, the 404 and ?maxPrice=12 must still answer the same.",
        },
        {
          task: "Paste your new method(s), the address you opened, and the JSON your app answered. Finished early? Add another idea first, then paste them all.",
          hint: "Copy the method from VS Code, and the JSON from the browser.",
          input: "Paste your method(s), the address, and the answer",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-lost-snack",
    title: "⚔️ Boss battle: The Lost Snack",
    intro: "The Lost Snack hides behind wrong addresses and blank pages. Answer honestly to catch it.",
    boss: { name: "the Lost Snack", emoji: "🍢" },
    questions: [
      {
        prompt: "In @GetMapping(\"/api/snacks/{id}\"), which annotation receives the {id}?",
        choices: ["@RequestParam", "@PathVariable", "@RequestBody"],
        answer: 1,
        explain: "{id} is part of the path, so it's a path variable.",
      },
      {
        prompt: "/api/snacks?maxPrice=12 — the 12 arrives through…",
        choices: ["@RequestParam", "@PathVariable", "the record"],
        answer: 0,
        explain: "Name=value pairs after the ? are request parameters.",
      },
      {
        prompt: "There's no snack 99. What should /api/snacks/99 answer?",
        choices: ["200 with nothing", "500", "404 with a message"],
        answer: 2,
        explain: "throw new ResponseStatusException(HttpStatus.NOT_FOUND, …).",
      },
      {
        prompt: "/api/snacks/abc answers 400. Whose mistake is it?",
        choices: ["The request's: abc can't be an int id", "The server's", "MySQL's"],
        answer: 0,
        explain: "4xx codes mean the request was wrong; 5xx mean the server failed.",
      },
      {
        prompt: "?maxPrice=5 matches no snacks. What's the right answer?",
        choices: ["404", "200 with []", "500"],
        answer: 1,
        explain: "An empty list is a correct result, like a SELECT returning 0 rows.",
      },
      {
        prompt: "Which setting makes your own message appear in the error JSON in Spring Boot 4?",
        choices: [
          "server.error.include-message=always",
          "spring.error.message=on",
          "spring.web.error.include-message=always",
        ],
        answer: 2,
        explain: "Spring Boot 4 renamed it, and silently ignores the old name.",
      },
      {
        prompt: "Why Integer maxPrice instead of int maxPrice for an optional filter?",
        choices: ["Integer can be null when the filter is left out", "int is too small", "Spring only accepts Integer"],
        answer: 0,
        explain: "With required = false, a missing parameter is null.",
      },
      {
        prompt: "How do you read the price of a record s?",
        choices: ["s.price", "s.getPrice()", "s.price()"],
        answer: 2,
        explain: "Records give each field a reader method with the field's own name.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "The difference between a path variable and a request parameter, with one of your addresses for each.",
      "Why your app answers 404 for snack 99, not 200 or 500.",
      "Which setting you added to application.properties, and why the old name wouldn't work.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your app answers questions now, and admits when it can't. Tomorrow it listens: it takes an order sent as JSON.",
  },
};
