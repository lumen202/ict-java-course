// unit2-week6 · Day 4 — The order form answers back
//
// The submit event. Week 5's form sent a GET to nowhere; today order.js takes
// it over: preventDefault, a receipt shown with style.display (the hide/show
// video), and the order as JSON — {"snack_id":3,"qty":2}, the exact body the
// page POSTs to the student's own API in Week 7 Day 5. Keys
// match the form's names and Week 3's columns.
//
// The checkpoint has all three editors: the receipt's starting state lives in
// style.css (#receipt { display: none; }), so the stylesheet must be pasted for
// "hidden at first" to be checkable. The browser's own validation (required,
// min, max) still runs before the submit event — a blank box never reaches the
// listener — and the lab shows that on purpose.
// Videos (transcripts read 2026-10-11): hide/show (MkvHPOT4RS8, 5:11 —
// addEventListener with the event parameter, style.display) and JSON
// (r4MLHHLctKw, 10:08 — stringify, parse, and a first fetch of a .json file,
// which is tomorrow's work).

import type { DayPlan } from "../../types";

export const day4: DayPlan = {
  day: "Day 4",
  focus: "The order form answers back — no reload, a receipt on the page, and the order as JSON",
  warmupGame: {
    kind: "quest",
    id: "warmup-submit",
    title: "📨 Warm-up: what sending a form really does",
    intro: "Last week your form sent snack_id and qty off in the address bar. Today your script catches them first.",
    missions: [
      {
        task: "Choose Turon, type 3, and press Place order on last week's form. The browser loads  order.html?snack_id=2&qty=3.",
        hint: "Is that the same page with something added, or a brand-new page load? What happens to anything a script wrote onto the old page?",
        check: {
          question: "Your script shows a receipt in the submit listener, then the browser loads that address. What does the customer see?",
          choices: [
            "The receipt, under the form",
            "The receipt flashes for an instant, then a fresh copy of order.html loads without it",
            "An error page",
          ],
          answer: 1,
          explain:
            "Sending a form is a page load. Everything your script did to the old page is thrown away, which is why today's listener starts with one particular line.",
        },
      },
      {
        task: "Every event listener can take a parameter, usually called event, that describes what happened. Bro Code shows it in today's first video.",
        hint: "'default' means what the browser would do by itself. What does it do by itself when a form is sent?",
        check: {
          question: "What does event.preventDefault() do in a submit listener?",
          choices: [
            "Deletes the form",
            "Stops the browser's own action (loading a new page), so your code decides what happens instead",
            "Checks the form for mistakes",
          ],
          answer: 1,
          explain: "First line of every submit listener you'll write in this course.",
        },
      },
      {
        task: "In JavaScript an order is an object:  { snack_id: 2, qty: 3 }.  Your Java app will be on the other end of a network, and a network only carries text.",
        hint: "JSON means JavaScript Object Notation. Which choice is the object written out as text?",
        check: {
          question: "What does JSON.stringify({ snack_id: 2, qty: 3 }) give you?",
          choices: [
            "The same object, unchanged",
            "An array",
            "The text {\"snack_id\":2,\"qty\":3}, which can travel to any program in any language, Java included",
          ],
          answer: 2,
          explain:
            "Your Spring Boot app will read exactly that text and turn it back into a Java object. Today you make it; next week you send it.",
        },
      },
    ],
  },
  videos: [
    {
      title: "How to HIDE and SHOW HTML using JavaScript (Bro Code)",
      youtubeId: "MkvHPOT4RS8",
      length: "5:11",
      practice: {
        intro: "He hides and shows a picture. You'll hide and show the receipt:",
        steps: [
          "In order.html, under the form and the total, add the receipt:  <div id=\"receipt\"><p id=\"receipt-text\"></p><button type=\"button\" id=\"new-order\">New order</button></div>",
          "In style.css, hide it to start with:  #receipt { display: none; }",
          "At the very end of order.js, type:  const receipt = document.getElementById(\"receipt\");",
          "Under it, make New order hide the receipt, his way:  document.getElementById(\"new-order\").addEventListener(\"click\", function () { receipt.style.display = \"none\"; });",
          "To see it work now, use the console: click the empty line next to the > sign at the bottom of the Console, type  receipt.style.display = \"block\"  and press Enter. The receipt appears. Click New order: it hides.",
        ],
        note: "He ends by comparing display with visibility. display: none removes the element from the layout, which is what you want for a receipt that isn't there yet.",
      },
    },
    {
      title: "Learn JSON files in 10 minutes (Bro Code)",
      youtubeId: "r4MLHHLctKw",
      length: "10:08",
      practice: {
        intro: "Try JSON in the console before it goes into your form. Type each line on the > line at the bottom of the Console and press Enter. (If you paste instead and Chrome or Edge shows a warning, type  allow pasting  and press Enter, then paste again.)",
        steps: [
          "Type  const order = { snack_id: 2, qty: 3 };  and press Enter.",
          "Type  JSON.stringify(order)  and compare it with typing just  order.  One is an object you can open up; the other is a line of text.",
          "Type  JSON.parse('{\"snack_id\":2,\"qty\":3}').qty  and read the answer.",
          "In notes.md, write the difference between an object and JSON in one sentence.",
        ],
        note: "His last minutes use fetch() to load a .json file. Watch that part but don't type it yet; it's tomorrow's lab, on your own tables page.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: the form answers the customer",
      intro: "Place order stops loading a new page. Instead the customer gets a receipt, and the console gets the order as JSON.",
      missions: [
        {
          task: "In order.html, give the form an id:  <form id=\"order-form\">.  Then type this at the very end of order.js. Save, click Place order, and watch the console AND the address bar. Next, add  event.preventDefault();  as the first line inside the function (above console.log), save, and click Place order again.",
          code: "const form = document.getElementById(\"order-form\");\n\nform.addEventListener(\"submit\", function (event) {\n  console.log(\"order!\");\n});",
          hint:
            "Click Place order and watch two places at once: the console and the address bar. Tick Preserve log in the console's settings (the gear icon) if the line vanishes too fast to read.",
          check: {
            question: "Without preventDefault, 'order!' flashed and the address bar gained ?snack_id=…&qty=…. With it, what changed?",
            choices: [
              "The form stops working",
              "Nothing",
              "The page stays put: no new address, and 'order!' stays in the console. Your code now decides what happens",
            ],
            answer: 2,
            explain: "Listen on the FORM for 'submit', not on the button for 'click'. Missions 3 and 4 show why.",
          },
        },
        {
          task: "Now the real thing. Inside the submit listener, delete the line console.log(\"order!\"); and type these lines in its place, under event.preventDefault();:",
          code: "  const order = { snack_id: Number(snack.value), qty: Number(qty.value) };\n  const name = snack.selectedOptions[0].textContent;\n  document.getElementById(\"receipt-text\").textContent =\n    `Order placed: ${order.qty} × ${name} = ₱${prices[order.snack_id] * order.qty}`;\n  receipt.style.display = \"block\";\n  console.log(JSON.stringify(order));",
          hint:
            "These lines go inside the listener, after event.preventDefault();. selectedOptions[0] is the option that's chosen, and its textContent is the name the customer sees. Can't type ×? A plain x is fine.",
          check: {
            question: "Why Number(snack.value) in the order, when prices[snack.value] already worked on Tuesday?",
            choices: [
              "So the JSON says \"snack_id\":3, a number. Your Java API will expect an int, and \"3\" in quotes is text",
              "Because JSON.stringify can't handle text",
              "No reason, it's the same",
            ],
            answer: 0,
            explain:
              "Look at the console: {\"snack_id\":3,\"qty\":2}, no quotes around the numbers. The JSON is a promise to whoever reads it, so keep the types right.",
          },
        },
        {
          task: "Empty the quantity box completely and press Place order.",
          hint: "Look at the box itself, at the console, and at the receipt. Which of your Week 5 attributes is speaking?",
          check: {
            question: "A bubble says 'Please fill out this field', and there's no receipt and no JSON in the console. Why didn't your listener run?",
            choices: [
              "The listener crashed",
              "The browser checks required, min and max BEFORE the submit event. An invalid form never fires it, so your code only ever sees valid orders",
              "Empty boxes can't be read by JavaScript",
            ],
            answer: 1,
            explain:
              "Last week's attributes still protect the form, and that's the big reason to listen for submit: a click listener on the button would have run anyway, with an empty box (error clinic patient 4). And remember from last week: your API must check again, because not every order will come through this form.",
          },
        },
        {
          task: "Finish New order. In order.js, delete your New order line from the video and type this in its place. Then click in the quantity box, select its number (Ctrl+A), type 4 and press Enter.",
          code: "document.getElementById(\"new-order\").addEventListener(\"click\", function () {\n  receipt.style.display = \"none\";\n  qty.value = 1;\n  showTotal();\n});",
          hint: "It still hides the receipt, and now also puts the box back to 1 and redraws the total. For the question: you never pressed Place order. What sent the form?",
          check: {
            question: "Pressing Enter in the box placed the order too. Why does that work?",
            choices: [
              "Enter is a shortcut for Place order only in Chrome",
              "Pressing Enter in a form's box sends the form, just like pressing Place order, and your submit listener runs every time the form is sent",
              "It doesn't; that's a bug",
            ],
            answer: 1,
            explain: "submit means 'the form is being sent, and it passed the browser's checks', however it was sent. That's exactly the moment your code should act.",
          },
        },
        {
          task: "Your whole order.js should now look like this, top to bottom. Compare it line by line and fix any difference. Then restart your app and place three different orders at localhost:8080/order.html.",
          code: "const qty = document.getElementById(\"qty\");\n\ndocument.getElementById(\"plus\").addEventListener(\"click\", function () {\n  if (Number(qty.value) < 20) {\n    qty.value = Number(qty.value) + 1;\n  }\n  showTotal();\n});\n\ndocument.getElementById(\"minus\").addEventListener(\"click\", function () {\n  if (Number(qty.value) > 1) {\n    qty.value = Number(qty.value) - 1;\n  }\n  showTotal();\n});\n\nconst prices = { 1: 15, 2: 12, 3: 20, 4: 10, 5: 25, 6: 8 };\nconst snack = document.getElementById(\"snack\");\nconst total = document.getElementById(\"total\");\n\nfunction showTotal() {\n  const price = prices[snack.value];\n  const count = Number(qty.value);\n  total.textContent = `Total: ₱${price * count}`;\n}\n\nshowTotal();\n\nsnack.addEventListener(\"change\", showTotal);\nqty.addEventListener(\"input\", showTotal);\n\nconst receipt = document.getElementById(\"receipt\");\n\ndocument.getElementById(\"new-order\").addEventListener(\"click\", function () {\n  receipt.style.display = \"none\";\n  qty.value = 1;\n  showTotal();\n});\n\nconst form = document.getElementById(\"order-form\");\n\nform.addEventListener(\"submit\", function (event) {\n  event.preventDefault();\n  const order = { snack_id: Number(snack.value), qty: Number(qty.value) };\n  const name = snack.selectedOptions[0].textContent;\n  document.getElementById(\"receipt-text\").textContent =\n    `Order placed: ${order.qty} × ${name} = ₱${prices[order.snack_id] * order.qty}`;\n  receipt.style.display = \"block\";\n  console.log(JSON.stringify(order));\n});",
          hint: "Test like the checker (select the box's number with Ctrl+A before typing a new one): Kwek-kwek × 2 should say ₱40 with {\"snack_id\":3,\"qty\":2} in the console; New order hides the receipt and puts the box back to 1.",
        },
        {
          task: "Add today to notes.md: what preventDefault stops, and the three JSON lines from your console.",
          hint: "Copy the JSON lines exactly as the console shows them.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-order-receipt",
      fileName: "order.html",
      scriptFile: "order.js",
      title: "🧪 Checkpoint: the receipt",
      intro:
        "Three boxes today: order.html on top, style.css in the middle (it holds the rule that hides the receipt), order.js at the bottom. The checker places orders itself.",
      starter: "<!-- Delete this line, then paste your whole order.html from VS Code here -->\n",
      stylesheet: "/* Delete this line, then paste your whole style.css from VS Code here */\n",
      script: "// Delete this line, then paste your whole order.js from VS Code here\n",
      tasks: [
        {
          goal: "Paste all three files. First: the form has an id, the receipt is on the page, and it starts hidden.",
          checks: [
            { selector: "form #qty", message: "The top box doesn't have your order form yet. Paste your whole order.html." },
            { selector: "form#order-form", message: "Your <form> has no id=\"order-form\". Add it to the <form> tag itself, not to the button." },
            { selector: "#receipt #receipt-text", message: "No receipt. Add  <div id=\"receipt\"><p id=\"receipt-text\"></p>…</div>  under the form." },
            {
              selector: "#new-order[type='button']",
              message: "No New order button with type=\"button\" inside the receipt. Add  <button type=\"button\" id=\"new-order\">New order</button>.",
            },
            {
              selector: "#receipt",
              css: { property: "display", value: "none" },
              message: "The receipt is showing before anyone has ordered. Add  #receipt { display: none; }  to style.css, and paste style.css into the middle box.",
            },
          ],
          hint: "id=\"order-form\" goes on <form>. The receipt's starting state is CSS; the script only changes it later.",
          solution: "<div id=\"receipt\">\n  <p id=\"receipt-text\"></p>\n  <button type=\"button\" id=\"new-order\">New order</button>\n</div>",
          explain: "HTML for what's there, CSS for how it starts, JavaScript for what changes.",
        },
        {
          goal: "Placing an order keeps the page, and shows a receipt with the snack and the price.",
          actions: [
            { action: "choose", target: "#snack", value: "3" },
            { action: "type", target: "#qty", value: "2" },
            { action: "submit", target: "#order-form" },
          ],
          checks: [
            {
              selector: "#receipt",
              cssNot: { property: "display", value: "none" },
              message: "After Place order, the receipt is still hidden. Show it in the submit listener:  receipt.style.display = \"block\";",
            },
            {
              selector: "#receipt-text",
              text: "Kwek-kwek",
              message: "The receipt should name the snack that was ordered (Kwek-kwek). Use  snack.selectedOptions[0].textContent.",
            },
            {
              selector: "#receipt-text",
              text: "40",
              message: "Kwek-kwek × 2 should cost ₱40 on the receipt. Is it prices[order.snack_id] * order.qty, with prices exactly { 1: 15, 2: 12, 3: 20, 4: 10, 5: 25, 6: 8 } as on Tuesday?",
            },
          ],
          hint: "form.addEventListener(\"submit\", function (event) { event.preventDefault(); … }). No submit button found? Put  <button type=\"submit\">Place order</button>  inside the form, before </form>.",
          solution: "form.addEventListener(\"submit\", function (event) {\n  event.preventDefault();\n  const order = { snack_id: Number(snack.value), qty: Number(qty.value) };\n  const name = snack.selectedOptions[0].textContent;\n  document.getElementById(\"receipt-text\").textContent =\n    `Order placed: ${order.qty} × ${name} = ₱${prices[order.snack_id] * order.qty}`;\n  receipt.style.display = \"block\";\n  console.log(JSON.stringify(order));\n});",
          explain: "The customer gets an answer, and the page never reloaded.",
        },
        {
          goal: "The same order, as JSON in the console, with numbers as numbers.",
          actions: [
            { action: "choose", target: "#snack", value: "3" },
            { action: "type", target: "#qty", value: "2" },
            { action: "submit", target: "#order-form" },
          ],
          checks: [
            {
              log: "{\"snack_id\":3,\"qty\":2}",
              message: "The console should show exactly {\"snack_id\":3,\"qty\":2}. Quotes around 3 or 2? Wrap them in Number(). Nothing at all? Add console.log(JSON.stringify(order)); to the listener. Keys must be snack_id then qty.",
            },
          ],
          hint: "const order = { snack_id: Number(snack.value), qty: Number(qty.value) };  then  console.log(JSON.stringify(order));",
          solution: "const order = { snack_id: Number(snack.value), qty: Number(qty.value) };\nconsole.log(JSON.stringify(order));",
          explain: "That line of text is what your page will send to your own API. Week 4's RecordSale took snack_id and qty as its ? values; these are them.",
        },
        {
          goal: "New order hides the receipt and starts again from 1.",
          actions: [
            { action: "choose", target: "#snack", value: "2" },
            { action: "type", target: "#qty", value: "4" },
            { action: "submit", target: "#order-form" },
            { action: "click", target: "#new-order" },
          ],
          checks: [
            {
              selector: "#receipt",
              css: { property: "display", value: "none" },
              message: "After New order, the receipt should be hidden again:  receipt.style.display = \"none\";",
            },
            { selector: "#qty[value='1']", message: "After New order, the quantity box should be back to 1:  qty.value = 1;" },
            {
              selector: "#total",
              text: "12",
              message: "After New order, the total should be redrawn for 1 Turon (₱12). Call showTotal(); at the end of the New order listener.",
            },
          ],
          hint: "Three lines in the New order listener: hide the receipt, set qty.value to 1, call showTotal().",
          solution: "document.getElementById(\"new-order\").addEventListener(\"click\", function () {\n  receipt.style.display = \"none\";\n  qty.value = 1;\n  showTotal();\n});",
          explain: "A form that takes an order, answers, and is ready for the next customer.",
        },
      ],
    },
    {
      kind: "upload",
      id: "screenshot-receipt",
      title: "📸 Hand in: a receipt and its JSON",
      intro: "Proof that the form works on your own machine, answered by your own script.",
      steps: [
        "Restart your app and open localhost:8080/order.html.",
        "Press F12 → Console. Place an order of your choice.",
        "Make sure the address bar, the receipt and the JSON line in the console are all visible.",
        "Press Windows+Shift+S and capture the whole screen. It's saved in Pictures → Screenshots.",
        "Upload it below.",
      ],
      proves:
        "that your own order page at localhost:8080 answers with a receipt instead of reloading, and your console shows that same order as JSON with numbers, not text.",
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Forms add one new kind of patient: the page that reloads and takes the evidence with it.",
      missions: [
        {
          task: "Patient 1. The receipt flashes for a split second and disappears. The address bar now ends with ?snack_id=3&qty=2.",
          hint: "The page reloaded. Which line stops that, and where must it go?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The receipt's CSS is wrong",
              "The submit listener is missing event.preventDefault(), so the browser sent the form and loaded a new page",
              "The JSON is invalid",
            ],
            answer: 1,
            explain: "First line of the listener, every time.",
          },
        },
        {
          task: "Patient 2. The console shows  {\"snack_id\":\"3\",\"qty\":\"2\"}.",
          hint: "Look at the quotes around 3 and 2. What type are they?",
          check: {
            question: "Why does this matter?",
            choices: [
              "It doesn't, JSON ignores quotes",
              "The page will show the wrong total",
              "The values are text, because they came straight from the boxes. A Java API expecting an int for qty may refuse \"2\". Wrap them in Number()",
            ],
            answer: 2,
            explain: "The JSON is the only thing the other program sees, so get the types right before you send it.",
          },
        },
        {
          task: "Patient 3. The console says:  Uncaught TypeError: Cannot read properties of null (reading 'addEventListener').  The script says  document.getElementById(\"order-form\"),  and the HTML has  <form>  with no id at all.",
          hint: "null means getElementById found nothing. Which element is supposed to carry id=\"order-form\"?",
          check: {
            question: "Fix?",
            choices: [
              "Add id=\"order-form\" to the <form> tag. The submit event belongs to the form",
              "Rename the button",
              "Add a second script",
            ],
            answer: 0,
            explain:
              "No element had the id, so getElementById returned null. And put it on the form, not the button: a listener on the button would never hear 'submit', because that event happens on the form.",
          },
        },
        {
          task: "Patient 4. The listener is on the button:  button.addEventListener(\"click\", …)  with preventDefault. With the quantity box EMPTY, pressing Place order shows no 'Please fill out this field' bubble. Instead the receipt says  Order placed: 0 × Banana cue = ₱0  and the console logs  {\"snack_id\":1,\"qty\":0}.",
          hint: "Mission 3 of the lab: when does the browser check required, min and max? Before which event?",
          check: {
            question: "Fix?",
            choices: [
              "Add a second click listener",
              "Listen for 'submit' on the form instead. A click listener runs before the browser checks the form, so it sees empty and invalid orders; submit only fires once required, min and max have passed",
              "Delete required from the box",
            ],
            answer: 1,
            explain: "Listen to what you mean: 'the form is being sent, and it's valid', not 'this button was clicked'. It also catches Enter, which sends the form too.",
          },
        },
        {
          task: "Patient 5. The quantity box is empty. Clicking Place order shows a 'Please fill out this field' bubble, and nothing appears in the console.",
          hint: "Which attribute did you put on the qty box last week?",
          check: {
            question: "What's wrong?",
            choices: [
              "The listener is broken",
              "JavaScript is turned off",
              "Nothing. required stops an invalid form before the submit event, so your listener correctly never ran",
            ],
            answer: 2,
            explain: "Not every patient is sick. Knowing what's normal saves you an hour of fixing working code.",
          },
        },
        {
          task: "Patient 6. The code says  console.log(\"Order: \" + order);  and the console shows  Order: [object Object].",
          hint: "What happens to an object when it's joined to text with +?",
          check: {
            question: "Fix?",
            choices: [
              "console.log(\"Order: \" + JSON.stringify(order));  — turn it into readable text first, or log the object on its own",
              "Use order.toString()",
              "Use a different variable name",
            ],
            answer: 0,
            explain: "[object Object] again: an object forced into text. JSON.stringify is the readable way.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for a page that reloads when it shouldn't.",
          hint: "A page that reloads wipes the console. Which console setting keeps the evidence, and which line stops the reload?",
          input: "Paste your six notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own addition to the receipt",
      intro:
        "Make your order page do one more thing that you choose. Do at least one idea; if you have time, do more. There's no upper limit.",
      missions: [
        {
          task: "Pick one idea, or invent your own, and build it. Ideas: (1) an 'Orders so far: 3' line that counts every order placed since the page opened (a let that starts at 0 and grows in the submit listener); (2) the time on the receipt, using new Date().toLocaleTimeString(); (3) a 'Show prices' button that shows or hides a small list of all the prices, like the hide/show video.",
          hint:
            "Change the page, not the JSON: the line console.log(JSON.stringify(order)) must keep printing exactly {\"snack_id\":…,\"qty\":…}, because that's what your API will receive later. For idea 1: let orders = 0; above the listener, then orders = orders + 1; inside it, and write the number into an empty <p>. A new button needs type=\"button\".",
        },
        {
          task: "Paste what you added: the new HTML (and CSS, if any), the new order.js lines, and one sentence on what each does. Finished early? Add another idea first, then paste them all.",
          hint: "Copy the lines from VS Code. Want to be sure nothing broke? Paste your files into today's checkpoint again.",
          input: "Paste your new HTML/CSS, your new order.js lines, and what each one does",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-vanishing-receipt",
    title: "⚔️ Boss battle: The Vanishing Receipt",
    intro: "Every receipt you show, it erases with a reload. Stop it.",
    boss: { name: "the Vanishing Receipt", emoji: "🧾" },
    questions: [
      {
        prompt: "Which event do you listen for to handle an order form?",
        choices: ["click on the submit button", "submit on the form", "load on the page"],
        answer: 1,
        explain: "submit fires however the form is sent: the button or Enter.",
      },
      {
        prompt: "What must the first line of the submit listener be?",
        choices: ["event.preventDefault();", "form.reset();", "console.log(event);"],
        answer: 0,
        explain: "Stop the page load first, then do your work.",
      },
      {
        prompt: "What does JSON.stringify({ snack_id: 1, qty: 4 }) give?",
        choices: ["An object", "{ snack_id: 1, qty: 4 }", "The text {\"snack_id\":1,\"qty\":4}"],
        answer: 2,
        explain: "JSON is text, with the keys in double quotes.",
      },
      {
        prompt: "What does JSON.parse do?",
        choices: [
          "Checks if a form is valid",
          "Turns JSON text back into an object you can use",
          "Sends JSON to the server",
        ],
        answer: 1,
        explain: "stringify: object → text. parse: text → object.",
      },
      {
        prompt: "The qty box is empty and has required. What happens when Place order is clicked?",
        choices: [
          "The browser shows a bubble and the submit event never fires",
          "Your listener runs with qty = 0",
          "The page reloads",
        ],
        answer: 0,
        explain: "The browser's check comes first.",
      },
      {
        prompt: "How do you show an element that style.css hides with display: none?",
        choices: ["element.hidden = false", "element.style.display = \"block\"", "element.show()"],
        answer: 1,
        explain: "The script's style.display beats the stylesheet's rule.",
      },
      {
        prompt: "Why does the order use Number(qty.value)?",
        choices: [
          "So the total is rounded",
          "Because boxes hold numbers already",
          "So the JSON carries a number, not text, the type your Java API will expect",
        ],
        answer: 2,
        explain: "\"qty\":2, not \"qty\":\"2\".",
      },
      {
        prompt: "Where will this JSON go, once your API exists?",
        choices: [
          "To your Java app, which turns it into a sale in MySQL — browser → app → MySQL",
          "Straight into MySQL from the browser",
          "Nowhere; JSON is only for the console",
        ],
        answer: 0,
        explain: "The chain from Week 5, Day 1, with a real message travelling along it.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "What happens when a form is sent without preventDefault, in your own words.",
      "The difference between an object and JSON.",
      "Why the order's snack_id and qty are numbers.",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your order page takes an order and hands back a receipt, all on one page. The JSON in your console is waiting for somewhere to go. Tomorrow you load JSON instead of making it, from a file you write about your own tables.",
  },
};
