// unit3-week7 · Day 1 — Your app answers in JSON
//
// First Java-side day of the API. Milestone: Snack.java (a record whose field
// names ARE the JSON keys and the Week 3 column names — snack_id, name, price)
// and SnackController.java answering GET /api/snacks with the six Week 3 snacks
// and GET /api/info with one object. Data stays in a Java list until Week 8.
//
// Every behaviour this day states was observed on a real Spring Boot 4.1.1
// build (2026-10-11): the record serialises to {"snack_id":…}; a class with no
// @RestController, or outside the main class's package, answers 404; a method
// mapped to "/" hides static/index.html. The json-check examples are that
// build's real answers. Videos (transcripts read): Mosh's REST intro
// (SLwpqD8n3d0, 6:04; ends with a plug for his Node course) and Alan Lands'
// first REST API (wfj-Z9OQpCA, 17:36; Boot 3, maps "/" — both covered by the
// week's watch notes).

import type { DayPlan } from "../../types";

const SNACK_RECORD = "public record Snack(int snack_id, String name, int price) {\n}";

const SNACK_CONTROLLER =
  "import java.util.List;\n\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n@RestController\npublic class SnackController {\n\n    record CanteenInfo(String name, String opens, String closes) {\n    }\n\n    private final List<Snack> snacks = List.of(\n        new Snack(1, \"Banana cue\", 15),\n        new Snack(2, \"Turon\", 12),\n        new Snack(3, \"Kwek-kwek\", 20),\n        new Snack(4, \"Gulaman\", 10),\n        new Snack(5, \"Siopao\", 25),\n        new Snack(6, \"Pastillas\", 8)\n    );\n\n    @GetMapping(\"/api/snacks\")\n    public List<Snack> listSnacks() {\n        return snacks;\n    }\n\n    @GetMapping(\"/api/info\")\n    public CanteenInfo info() {\n        return new CanteenInfo(\"Aling Nena's Canteen\", \"7:00\", \"16:00\");\n    }\n}";

export const day1: DayPlan = {
  day: "Day 1",
  focus: "Your app answers in JSON — a record, a controller, and your first endpoint at /api/snacks",
  warmupGame: {
    kind: "quest",
    id: "warmup-requests",
    title: "📨 Warm-up: what really travels between browser and app",
    intro: "Every time your browser opens a page, it sends a request and gets a response. This week you write the Java that answers.",
    missions: [
      {
        task: "Last week your tables.js ran  fetch(\"rows.json\")  and your app sent back the file. That's one request (the browser asks) and one response (the app answers).",
        hint: "Think of the order form: which side asks, and which side says 'here you go'?",
        check: {
          question: "In  browser → your app at 8080, which one sends the REQUEST?",
          choices: [
            "Your app, when it starts",
            "MySQL",
            "The browser: it asks for an address, and your app answers with a response",
          ],
          answer: 2,
          explain: "The browser is the client and your app is the server. Today your app answers with data it makes in Java, not only with files.",
        },
      },
      {
        task: "A request has a METHOD saying what kind of request it is. Opening an address in the browser, or pressing Place order on your Week 5 form, sends a GET. A form with method=\"post\" sends a POST, like the Week 5 error-clinic patient who got a 405.",
        hint: "GET means 'give me'. Which one creates something new?",
        check: {
          question: "Which method should a request use to place a NEW order?",
          choices: [
            "POST: it sends data to create something. GET only asks for something",
            "GET: every request is a GET",
            "DELETE",
          ],
          answer: 0,
          explain: "GET to read, POST to create. Today is all GET; Wednesday is POST.",
        },
      },
      {
        task: "A response has a STATUS CODE: a number that says how it went. You've met some already: 404 on a Whitelabel page when there was no index.html yet, and 405 in a Week 5 error clinic, for a POST sent to a plain page.",
        hint: "Which number did the Whitelabel page show when there was no index.html yet?",
        check: {
          question: "What does status 200 mean?",
          choices: [
            "Not found",
            "OK: the request worked and the answer is in the response",
            "The server crashed",
          ],
          answer: 1,
          explain: "200 OK, 404 Not Found, 500 server error. You'll read these all week in the browser's Network tab.",
        },
      },
    ],
  },
  videos: [
    {
      title: "What is a REST API? (Programming with Mosh)",
      youtubeId: "SLwpqD8n3d0",
      length: "6:04",
      practice: {
        intro: "His example is a movie rental API with /api/customers. Yours will be a canteen with /api/snacks.",
        steps: [
          "In notes.md, write the four methods he names (GET, POST, PUT, DELETE) and, for each, one canteen example. For example: GET /api/snacks — show the menu.",
          "Run your app (Run above main in CanteenWebApplication.java) and open localhost:8080/menu.html.",
          "Open the browser's tools (F12, or right-click → Inspect) and click the Network tab (if you can't see it, click » first). Then reload the page (F5).",
          "Click the row named menu.html. On the right, under Headers, find Request Method and Status Code. Write both in notes.md.",
        ],
        note: "He ends by talking about his Node course. You can stop there: everything before it applies to Spring too.",
      },
    },
    {
      title: "Spring Boot Tutorial – Build Your First REST API in 15 Minutes (Alan Lands)",
      youtubeId: "wfj-Z9OQpCA",
      length: "17:36",
      practice: {
        intro: "The first part (installing Java, creating a project) is what you did in Week 5: watch it faster if you like (⚙ → Playback speed → 1.5). The controller part is new. Try his last example in YOUR HelloController.java:",
        steps: [
          "Open HelloController.java (next to CanteenWebApplication.java).",
          "Change your hello method so it takes a name from the address. Replace its first line with:  public String hello(@RequestParam(defaultValue = \"friend\") String name) {",
          "Replace its return line with:  return \"Hello, \" + name + \"!\";",
          "If VS Code underlines @RequestParam in red, add this line under the other import lines at the top:  import org.springframework.web.bind.annotation.RequestParam;",
          "Restart the app (red square, then Run above main). Open localhost:8080/hello?name=Ana, then localhost:8080/hello with no ?name.",
        ],
        note: "He writes @GetMapping(\"/\") for his first endpoint. Don't: in your project \"/\" is your index.html. Keep /hello, and from today every new address starts with /api/.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: /api/snacks, from your own Java",
      intro:
        "Two new files, in the same folder as CanteenWebApplication.java. Every mission says exactly what to type. Restart the app after every change to a .java file.",
      missions: [
        {
          task: "Create Snack.java. A record is a class that only holds data: Java writes its fields, its constructor and its reader methods snack_id(), name(), price() for you. (1) In VS Code's Explorer, right-click the folder that holds CanteenWebApplication.java → New File → type Snack.java → Enter. (2) VS Code fills in a package line and a class line by itself (and may ask you to pick class, record…). Press Escape, then delete everything in the file. (3) Open CanteenWebApplication.java, copy its first line (it starts with package) and paste it as line 1 of Snack.java. (4) Under it, type:",
          code: SNACK_RECORD,
          hint:
            "A record is a short way to write a class that only holds data: Java makes the fields, the constructor and the getters for you. The field names are the column names of your snacks table, snack_id with an underscore, on purpose. Save with Ctrl+S.",
          check: {
            question: "Why is the field called snack_id, and not snackId as Java usually writes names?",
            choices: [
              "Java doesn't allow capitals in names",
              "Spring turns each field name into a JSON key exactly as written. snack_id is the column name in MySQL and the key your pages already use, so one name runs all the way from the database to the page",
              "Records need underscores",
            ],
            answer: 1,
            explain:
              "Your order form already sends snack_id, and next week the column in MySQL is snack_id too. Using the same name everywhere means nothing has to be translated.",
          },
        },
        {
          task: "Create SnackController.java the same way: (1) right-click the same folder → New File → SnackController.java; (2) press Escape and delete everything VS Code filled in; (3) paste the package line as line 1; (4) type this under it. Lines that start with @ are annotations: labels that tell Spring what a class or a method is for. @RestController says 'this class answers requests'; @GetMapping(\"/api/snacks\") says 'this method answers that address'.",
          code: SNACK_CONTROLLER,
          hint:
            "Type the import lines too: without them VS Code underlines @RestController and @GetMapping in red. The list holds the same six snacks as your Week 3 table. CanteenInfo is a second record, written inside the class because only this file uses it. Check every { has its }.",
          check: {
            question: "listSnacks() returns a Java List<Snack>. What will the browser receive?",
            choices: [
              "The Java list itself, as a .class file",
              "An HTML table",
              "JSON: Spring turns the list into a JSON array and each Snack into a {…} object, using the field names as keys",
            ],
            answer: 2,
            explain: "@RestController means 'answer with data, not a web page'. The turning into JSON happens by itself; you never write it.",
          },
        },
        {
          task: "Restart the app (red square, then Run above main in CanteenWebApplication.java). Open localhost:8080/api/snacks, then localhost:8080/api/info.",
          hint:
            "Still the old app? Look at VS Code's terminal: the newest lines should end with 'Started CanteenWebApplication'. A Whitelabel 404 means the address has no endpoint: check the spelling of \"/api/snacks\" in your code and that you restarted.",
          check: {
            question: "/api/snacks starts with [ and /api/info starts with {. Why the difference?",
            choices: [
              "[ … ] is a JSON array, a list of things: your List<Snack>. { … } is one object: your CanteenInfo",
              "The browser chooses at random",
              "/api/info is broken",
            ],
            answer: 0,
            explain: "The same two shapes as Week 6: rows.json was an array of objects, and one order was one object.",
          },
        },
        {
          task: "Look at the response the way your pages see it: on localhost:8080/api/snacks press F12 → Network, reload (F5), and click the row named snacks. Under Headers, read the Status Code and the Content-Type. Then click the Response tab.",
          hint: "The Content-Type line is under Response Headers. If the Network list is empty, reload the page with the Network tab already open.",
          check: {
            question: "What does Content-Type say for /api/snacks?",
            choices: [
              "text/html, like a page",
              "application/json: your app told the browser 'this is JSON'",
              "text/css",
            ],
            answer: 1,
            explain: "Status 200 and application/json: that's your first API answer. In Week 6 you read the same JSON from a file; now your Java writes it.",
          },
        },
        {
          task: "Break it on purpose: in SnackController.java, put // in front of the line @RestController (so it reads //@RestController). Save, restart, and open localhost:8080/api/snacks. Then delete the // , save and restart again.",
          hint: "// turns a line into a comment, so Java ignores it. Without that one line, what is SnackController to Spring?",
          check: {
            question: "Without @RestController you got a Whitelabel page with status 404. Why?",
            choices: [
              "The list was empty",
              "Without @RestController, SnackController is just an ordinary class. Spring never looks inside it, so no method answers /api/snacks",
              "The browser cached an old answer",
            ],
            answer: 1,
            explain: "404 means 'no endpoint at this address'. The same happens if a controller file is outside CanteenWebApplication's folder: Spring never finds it.",
          },
        },
        {
          task: "Your two new files should now look like this. Compare them line by line, then restart and check both addresses once more. Line 1 of each is your own package line, which is why it isn't shown. Blank lines and the order of the import lines don't matter; everything else should match. Snack.java first:",
          code: `${SNACK_RECORD}\n\n// ---- SnackController.java ----\n\n${SNACK_CONTROLLER}`,
          hint: "The most common differences are a missing import line, a missing } at the end, and \"/api/snacks\" typed with a typo. Your /hello method stays in HelloController.java; don't move it.",
        },
        {
          task: "Add today to notes.md: what a request and a response are, the status code and Content-Type you read in the Network tab, and what @RestController does.",
          hint: "Write it in your own words, like you'd explain it to a classmate who missed today.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "json-check",
      id: "checkpoint-snacks-endpoint",
      title: "🧪 Checkpoint: your app's first answers",
      intro:
        "Open each address in your browser with your app running, select everything on the page (Ctrl+A), copy it (Ctrl+C), and paste it here. The checker reads the JSON your own app answered with.",
      tasks: [
        {
          goal: "Paste what your app answers at /api/snacks.",
          url: "localhost:8080/api/snacks",
          checks: [
            { is: "array", message: "This isn't a list: JSON for a list starts with [. Did you open /api/snacks (with an s)? It should return List<Snack>." },
            { min: 6, message: "Fewer than six snacks. Your list should hold all six Week 3 snacks: Banana cue, Turon, Kwek-kwek, Gulaman, Siopao, Pastillas." },
            {
              keys: ["snack_id", "name", "price"],
              message: "A snack is missing snack_id, name or price. The JSON keys come from the record's field names: check Snack.java says (int snack_id, String name, int price), with snack_id spelled with an underscore.",
            },
            {
              types: { snack_id: "number", name: "string", price: "number" },
              message: "snack_id and price must be numbers and name must be text. In Snack.java they are int, String, int.",
            },
            { some: { snack_id: 2, name: "Turon", price: 12 }, message: "No snack 2 named Turon for 12. Check the line new Snack(2, \"Turon\", 12) in your list." },
          ],
          hint: "Restart the app after any change to a .java file, then reload the address before copying.",
          solution: `${SNACK_RECORD}\n\n// and in SnackController.java, the list:\n    private final List<Snack> snacks = List.of(\n        new Snack(1, "Banana cue", 15),\n        new Snack(2, "Turon", 12),\n        new Snack(3, "Kwek-kwek", 20),\n        new Snack(4, "Gulaman", 10),\n        new Snack(5, "Siopao", 25),\n        new Snack(6, "Pastillas", 8)\n    );`,
          example:
            '[{"snack_id":1,"name":"Banana cue","price":15},{"snack_id":2,"name":"Turon","price":12},{"snack_id":3,"name":"Kwek-kwek","price":20},{"snack_id":4,"name":"Gulaman","price":10},{"snack_id":5,"name":"Siopao","price":25},{"snack_id":6,"name":"Pastillas","price":8}]',
          explain: "Your Java list, turned into the same JSON array your menu.js works with. On Friday your menu reads it straight from here.",
        },
        {
          goal: "Paste what your app answers at /api/info.",
          url: "localhost:8080/api/info",
          checks: [
            { is: "object", message: "This should be ONE object, starting with {. Did you open /api/info? It should return one CanteenInfo." },
            { keys: ["name", "opens", "closes"], message: "The object needs the keys name, opens and closes: the fields of record CanteenInfo(String name, String opens, String closes)." },
            { path: "opens", equals: "7:00", message: "opens should be \"7:00\". Check the line new CanteenInfo(\"Aling Nena's Canteen\", \"7:00\", \"16:00\")." },
          ],
          hint: "The record is written inside SnackController, right after the class's first {.",
          solution: "record CanteenInfo(String name, String opens, String closes) {\n}\n\n@GetMapping(\"/api/info\")\npublic CanteenInfo info() {\n    return new CanteenInfo(\"Aling Nena's Canteen\", \"7:00\", \"16:00\");\n}",
          example: '{"name":"Aling Nena\'s Canteen","opens":"7:00","closes":"16:00"}',
          explain: "One record, one object. Return a list and you get [ … ]; return one record and you get { … }.",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-api-snacks",
      title: "📸 Hand in: your first endpoint, and its status",
      intro: "Proof that your own app answers JSON, with the Network tab showing how it answered.",
      steps: [
        "With your app running, open localhost:8080/api/snacks.",
        "Press F12 → Network, reload (F5), and click the snacks row so Headers shows Status Code 200.",
        "Make sure the address bar, your JSON and the Status Code are all visible.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves: "that your own Spring Boot app answers GET /api/snacks with your six snacks as JSON, status 200, at localhost:8080.",
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Each patient is an app that answered wrong, or didn't answer at all. Diagnose from what the screen says.",
      missions: [
        {
          task: "Patient 1. Every /api/ address gives a Whitelabel page with status 404. The student's SnackController.java is in a folder named controllers, which sits next to the canteen_web folder rather than inside it.",
          hint: "Where does Spring look for controllers? Compare this folder with the one CanteenWebApplication.java is in.",
          check: {
            question: "Diagnosis?",
            choices: [
              "Spring only looks for controllers in CanteenWebApplication's folder and the folders INSIDE it. A controller next to it is never found, so no address has an endpoint",
              "Folders can't be named controllers",
              "404 means the app crashed",
            ],
            answer: 0,
            explain: "Move the file into the folder with CanteenWebApplication.java (and fix its package line to match), then restart.",
          },
        },
        {
          task: "Patient 2. localhost:8080 used to show the student's front page. Now it shows only the words 'Hello World'. Their new controller has  @GetMapping(\"/\").",
          hint: "Which address is your index.html served at?",
          check: {
            question: "Why did the front page disappear?",
            choices: [
              "index.html was deleted",
              "A controller method mapped to \"/\" answers that address before Spring looks in static/. Change it to something under /api/ and the front page comes back",
              "Live Server is running",
            ],
            answer: 1,
            explain: "This is exactly what the Day 1 video does, and why the watch notes say never to use \"/\". index.html still exists at localhost:8080/index.html.",
          },
        },
        {
          task: "Patient 3. /api/snacks answers  [{\"snackId\":1,\"name\":\"Banana cue\",\"price\":15}, …].  It looks fine, but today's checkpoint says: A snack is missing snack_id, name or price.",
          hint: "Compare snackId with snack_id, the name your order form sends and your MySQL column has. Where does a JSON key's name come from?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The checkpoint is broken",
              "JSON can't hold numbers",
              "The record's field is snackId, so that's the key. Your form sends snack_id and your snacks table's column is snack_id: rename the field in Snack.java to snack_id so it's one name everywhere",
            ],
            answer: 2,
            explain: "The field name becomes the key, letter for letter. Two names for one thing means translating between them at every step; one name all the way through means nothing has to be translated.",
          },
        },
        {
          task: "Patient 4. The student added  new Snack(7, \"Taho\", 10)  to the list and saved, but /api/snacks still shows six snacks.",
          hint: "What has to happen after every change to a .java file?",
          check: {
            question: "First thing to try?",
            choices: [
              "Restart the app. It's still running the code from before the change. Saving a .java file doesn't change the running app",
              "Clear the browser's history",
              "Delete the list and type it again",
            ],
            answer: 0,
            explain: "Restart after every Java change: it's the most common 'it did nothing' of the week.",
          },
        },
        {
          task: "Patient 5. Running the app stops at once, and the terminal says:  Web server failed to start. Port 8080 was already in use.",
          hint: "Look at VS Code's terminal panel: how many copies of your app are running?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The port is broken",
              "Spring Boot needs a new port every day",
              "The app is already running from an earlier Run, and only one program can use port 8080. Stop the old one (red square) before you run again",
            ],
            answer: 2,
            explain: "Same message as Week 5. Always stop before you run, so restarting means stop, then run.",
          },
        },
        {
          task: "Patient 6. VS Code underlines @RestController in red:  RestController cannot be resolved to a type.",
          hint: "Look at the top of the file. Is there an import line for RestController?",
          check: {
            question: "Fix?",
            choices: [
              "Rename the class",
              "Add the import line at the top:  import org.springframework.web.bind.annotation.RestController;  (or hover over the red word and pick Quick Fix → import)",
              "Restart VS Code",
            ],
            answer: 1,
            explain: "Annotations live in Spring's packages, and Java needs an import to find them, just like the import java.util.List; line at the top of the same file.",
          },
        },
        {
          task: "Patient 7. The student pressed Run and VS Code showed:  Build failed, do you want to continue?  with the buttons Continue, Always Continue and Fix.... They clicked Continue. The app started, but /api/snacks answers 500, and the terminal mentions an 'Unresolved compilation problem'.",
          hint: "Build failed means the Java didn't compile: there's a red underline somewhere. What did Continue run, then?",
          check: {
            question: "What should they have done?",
            choices: [
              "Click Always Continue, so the message stops appearing",
              "Click Fix... or close the message, fix every red error in the Problems panel (it opens by itself, or Ctrl+Shift+M), and only then Run. Continue runs the broken code anyway",
              "Restart the computer",
            ],
            answer: 1,
            explain: "Never click Continue, and never Always Continue: it makes VS Code stop asking and run broken code every time (undo it in Settings: search onBuildFailureProceed). A red underline means the code can't run as written; fixing it is the only way.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for when an /api/ address answers 404.",
          hint: "Think of patient 1, the lab's //@RestController mission, and a misspelled address or a missing restart. When there's a 404, which of those do you check first?",
          input: "Paste your seven notes and your rule",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-silent-server",
    title: "⚔️ Boss battle: The Silent Server",
    intro: "The Silent Server hands out files and nothing else. Make it answer.",
    boss: { name: "the Silent Server", emoji: "🗄️" },
    questions: [
      {
        prompt: "What does @RestController tell Spring?",
        choices: [
          "This class's methods answer requests with data such as JSON",
          "This class runs the database",
          "This class is a web page",
        ],
        answer: 0,
        explain: "Without it, the class is invisible to Spring's request handling.",
      },
      {
        prompt: "@GetMapping(\"/api/snacks\") on a method means…",
        choices: ["The method runs when the app starts", "A GET request for /api/snacks runs this method", "The method saves snacks"],
        answer: 1,
        explain: "The address and the method together decide which Java method answers.",
      },
      {
        prompt: "A method returns List<Snack>. The browser receives…",
        choices: ["An HTML table", "A Java file", "A JSON array of snack objects"],
        answer: 2,
        explain: "Spring turns the return value into JSON by itself.",
      },
      {
        prompt: "The record is Snack(int snack_id, String name, int price). What are the JSON keys?",
        choices: ["snack_id, name, price", "snackId, name, price", "0, 1, 2"],
        answer: 0,
        explain: "The field names, exactly as written.",
      },
      {
        prompt: "Status 200 means…",
        choices: ["Not found", "OK", "Server error"],
        answer: 1,
        explain: "200 OK. 404 is not found, 500 a server error.",
      },
      {
        prompt: "You changed the list in SnackController.java and saved. The answer is unchanged. Why?",
        choices: ["Saving isn't enough: the running app still has the old code. Restart it", "JSON can't change", "The browser is broken"],
        answer: 0,
        explain: "Stop, then Run, after every Java change.",
      },
      {
        prompt: "Why must you never write @GetMapping(\"/\") in your project?",
        choices: ["It's not allowed in Java", "It makes the app slower", "\"/\" is your index.html; a controller there hides your front page"],
        answer: 2,
        explain: "Keep every endpoint under /api/.",
      },
      {
        prompt: "Where in the browser can you see a response's status code and Content-Type?",
        choices: ["The address bar", "F12 → Network → click the request → Headers", "View page source"],
        answer: 1,
        explain: "The Network tab shows every request the page made, and its answer.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "What happens, step by step, when you open localhost:8080/api/snacks.",
      "Why the record's field is snack_id, not snackId.",
      "The difference between [ … ] and { … } in JSON, with your two endpoints as examples.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your Java just answered its first request with data. Tomorrow it answers questions: one snack by its id, the cheap snacks only, and an honest 404 when a snack doesn't exist.",
  },
};
