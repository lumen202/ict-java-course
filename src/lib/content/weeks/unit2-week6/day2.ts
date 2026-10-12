// unit2-week6 · Day 2 — Buttons that do something
//
// Events, and the string-vs-number trap. Milestone: order.js gives Week 5's
// order form − and + buttons around the qty box and a live total under it.
// The + / − buttons are the counter program from the video, applied to a real
// form, which is where its classic bug appears: a <button> inside a <form>
// submits it unless it says type="button". The checkpoint's actions click the
// buttons, so a missing type is caught (the sandbox reports the submit).
//
// Prices are Week 3's seed, all six (a Week 5 form may offer every snack), and
// the lab says to type exactly these: the total checks expect Banana cue 15
// and Turon 12. The lab gives every snippet's place in the file and ends with
// the whole order.js — a literal follower who typed the video's code AND the
// lab's once declared `prices` twice (SyntaxError, the whole file dead;
// adversarial walk-through, 2026-10-11). Videos (transcripts read 2026-10-11): counter program
// (uSJXZ3LkABE, 9:17) and type conversion (jLRnuVHwHKk, 5:40).

import type { DayPlan } from "../../types";

export const day2: DayPlan = {
  day: "Day 2",
  focus: "Buttons that do something — + and − on the order form, and a total that adds itself up",
  warmupGame: {
    kind: "quest",
    id: "warmup-events",
    title: "🖱️ Warm-up: who runs the code when someone clicks?",
    intro: "Yesterday's script ran once, top to bottom, and finished. Today's has to wait for people.",
    missions: [
      {
        task: "Your Week 4 CanteenApp waited for the user with scanner.nextLine(). A page script runs top to bottom in a few milliseconds and ends, long before anyone clicks.",
        hint:
          "The script hands something to the button before it ends. Who is still around later, when the click happens?",
        check: {
          question: "So how does a click, a minute later, run your code?",
          choices: [
            "The script runs again from the top on every click",
            "The script gave the browser a function with addEventListener, and the browser calls that function every time the click happens",
            "The click is sent to your Spring Boot app, which runs the code",
          ],
          answer: 1,
          explain:
            "A listener is a function you register now for the browser to run later. Your script sets up the page and leaves the listeners behind.",
        },
      },
      {
        task: "Two versions of the same line:  plus.addEventListener(\"click\", showTotal);  and  plus.addEventListener(\"click\", showTotal());",
        hint:
          "What do the brackets after a function name do in Java? Do you want that to happen now, or when the click comes?",
        check: {
          question: "Which one runs showTotal on every click?",
          choices: [
            "The first one: it hands over the function itself. The second calls showTotal once, right away, and hands over what it returned (nothing)",
            "The second one: the brackets are needed to call it",
            "Both do the same thing",
          ],
          answer: 0,
          explain: "No brackets = 'here is the function, call it later'. Brackets = 'call it now'. This mistake fails silently, with no red line.",
        },
      },
      {
        task: "The quantity box on your order form shows 3. Your script reads  qty.value.",
        hint: "Think about what a box on a page holds. Can you type letters into it, even a number box?",
        check: {
          question: "What does qty.value give you?",
          choices: [
            "The number 3",
            "null, because it's a number box",
            "The text \"3\" — a box's value is always a string, even type=\"number\"",
          ],
          answer: 2,
          explain: "Today's second video is about exactly this. Turn it into a number with Number(qty.value) before any maths.",
        },
      },
    ],
  },
  videos: [
    {
      title: "JavaScript COUNTER PROGRAM (Bro Code)",
      youtubeId: "uSJXZ3LkABE",
      length: "9:17",
      practice: {
        intro: "His counter is a label and three buttons. Yours goes on the order form, around the quantity box.",
        steps: [
          "In static/, create a new file: order.js. In order.html, add  <script src=\"order.js\"></script>  as the last line inside <body>, just above </body>.",
          "In order.html, type a minus button just BEFORE the qty box:  <button type=\"button\" id=\"minus\">−</button>  and a plus button just AFTER it:  <button type=\"button\" id=\"plus\">+</button>.  Keep type=\"button\" — the lab shows you why.",
          "In order.js, type this first line:  const qty = document.getElementById(\"qty\");",
          "Under it, make + add one:  document.getElementById(\"plus\").addEventListener(\"click\", function () { qty.value = Number(qty.value) + 1; });  — function () { … } is a method with no name, handed straight to the button to run on each click.",
          "Under that, make − take one away: the same line with \"minus\" and - 1. Save, and try both buttons in Live Server.",
        ],
        note: "He writes increaseBtn.onclick = function () { … }. We use addEventListener(\"click\", function () { … }), which does the same here and is what Thursday's form needs. If you like his button styling, put it in your style.css.",
      },
    },
    {
      title: "Learn JavaScript TYPE CONVERSION in 5 minutes (Bro Code)",
      youtubeId: "jLRnuVHwHKk",
      length: "5:40",
      practice: {
        intro: "His age turns into 251 when he adds 1. Make the same thing happen on your + button:",
        steps: [
          "In the + line of order.js, delete Number( and its ) so it says  qty.value = qty.value + 1;  Save.",
          "Click + three times and watch the box: 11, 111, 1111.",
          "Put Number( ) back exactly as it was. Click + again: 2, 3, 4.",
          "In order.html, under the form, add an empty paragraph for the total:  <p id=\"total\"></p>.  The lab fills it.",
        ],
        note: "Number(\"\") is 0 and Number(\"abc\") is NaN ('not a number'). If your page ever says ₱NaN, something you multiplied wasn't a number.",
      },
    },
  ],
  activities: [
    {
      kind: "quest",
      id: "real-lab",
      inline: true,
      title: "🛠️ Real lab: a live total on your order form",
      intro: "By the end, choosing a snack, typing a quantity, or pressing + or − all update the total at once. Each mission says exactly where its code goes; the fifth one shows the whole file so you can compare.",
      missions: [
        {
          task: "Remove type=\"button\" from your + button in order.html. Save, then click + in Live Server and watch the address bar. Then put type=\"button\" back and save again.",
          hint:
            "Look at last week's order form: what does a button inside a form do when it has no type?",
          check: {
            question: "Without type=\"button\", the page reloaded and the address bar gained ?snack_id=…&qty=…. Why?",
            choices: [
              "The + listener has an error",
              "Live Server reloaded because you saved",
              "A <button> inside a <form> is a submit button unless it says otherwise, so clicking it sent the form, just like Place order",
            ],
            answer: 2,
            explain: "Only Place order should send the form, so both of your buttons keep type=\"button\".",
          },
        },
        {
          task: "Type this at the very END of order.js, below your − line. It looks up the chosen snack's price and writes the total:",
          code: "const prices = { 1: 15, 2: 12, 3: 20, 4: 10, 5: 25, 6: 8 };\nconst snack = document.getElementById(\"snack\");\nconst total = document.getElementById(\"total\");\n\nfunction showTotal() {\n  const price = prices[snack.value];\n  const count = Number(qty.value);\n  total.textContent = `Total: ₱${price * count}`;\n}\n\nshowTotal();",
          hint:
            "These are the six Week 3 prices, by snack_id, and the checker uses them: type them exactly, even if your own table differs. prices[snack.value] finds the price for the chosen option's value, like map.get() in Java. Save: 'Total: ₱15' should appear under the form straight away.",
          check: {
            question: "Turon (value 2) is chosen and the box says 3. What is prices[snack.value] * Number(qty.value)?",
            choices: [
              "prices[\"2\"] is 12, and 12 * 3 is 36",
              "\"23\", because the values are text",
              "NaN, because snack.value is text",
            ],
            answer: 0,
            explain:
              "The option's value \"2\" finds the price 12, since an object's keys are text anyway. And Number() makes sure the quantity is a number.",
          },
        },
        {
          task: "Add these two lines at the very end of order.js, after showTotal();. Now the total follows the drop-down and the typing:",
          code: "snack.addEventListener(\"change\", showTotal);\nqty.addEventListener(\"input\", showTotal);",
          hint: "Type showTotal with NO brackets here. Save, then choose another snack and type a number: the total should change each time.",
          check: {
            question: "Why showTotal and not showTotal() inside addEventListener?",
            choices: [
              "Without brackets you hand the browser the function to run on every change. With brackets it would run once, right now, and hand over nothing",
              "The brackets are optional in JavaScript",
              "showTotal() would run on every click instead",
            ],
            answer: 0,
            explain: "The warm-up's mission 2, for real. This mistake shows no error, so it's worth remembering.",
          },
        },
        {
          task: "Now the buttons. Delete your two button lines from the video (the + line and the − line) and type these in the same place, under const qty. They stop at 1 and 20, and redraw the total:",
          code: "document.getElementById(\"plus\").addEventListener(\"click\", function () {\n  if (Number(qty.value) < 20) {\n    qty.value = Number(qty.value) + 1;\n  }\n  showTotal();\n});\n\ndocument.getElementById(\"minus\").addEventListener(\"click\", function () {\n  if (Number(qty.value) > 1) {\n    qty.value = Number(qty.value) - 1;\n  }\n  showTotal();\n});",
          hint:
            "Count the braces: each if opens { and closes }, and each function ends with });. showTotal(); is inside the function, just before }); — so it runs on every click.",
          check: {
            question: "Typing in the box already updates the total. Why does each button still need its own showTotal(); line?",
            choices: [
              "The buttons are broken without it",
              "The input event fires when a PERSON types. When your code sets qty.value, no event fires, so the code has to call showTotal() itself",
              "addEventListener only works once",
            ],
            answer: 1,
            explain:
              "Events report what people do. And the if is needed even though the form has min and max: those only stop the form being SENT with a bad value, not your code from setting one.",
          },
        },
        {
          task: "Your whole order.js should now look like this, top to bottom. Compare it line by line with yours and fix any difference. Then restart your app and try everything at localhost:8080/order.html.",
          code: "const qty = document.getElementById(\"qty\");\n\ndocument.getElementById(\"plus\").addEventListener(\"click\", function () {\n  if (Number(qty.value) < 20) {\n    qty.value = Number(qty.value) + 1;\n  }\n  showTotal();\n});\n\ndocument.getElementById(\"minus\").addEventListener(\"click\", function () {\n  if (Number(qty.value) > 1) {\n    qty.value = Number(qty.value) - 1;\n  }\n  showTotal();\n});\n\nconst prices = { 1: 15, 2: 12, 3: 20, 4: 10, 5: 25, 6: 8 };\nconst snack = document.getElementById(\"snack\");\nconst total = document.getElementById(\"total\");\n\nfunction showTotal() {\n  const price = prices[snack.value];\n  const count = Number(qty.value);\n  total.textContent = `Total: ₱${price * count}`;\n}\n\nshowTotal();\n\nsnack.addEventListener(\"change\", showTotal);\nqty.addEventListener(\"input\", showTotal);",
          hint:
            "Test it the way the checker will. Each time you type a number, first select what's in the box (click in it, then Ctrl+A) so you replace it. Type 2 and press + once (Banana cue: ₱45). Choose Turon (₱12 × 3 = ₱36). Press − until it stops at 1. Type 20 and press + (it stays 20). Something wrong? Open the console first (F12 → Console).",
        },
        {
          task: "Add today to notes.md: what each listener does, and the one bug that cost you the most time.",
          hint: "Copy any red console line exactly, then one line on what caused it.",
          input: "Paste today's part of notes.md",
        },
      ],
    },
    {
      kind: "html-sandbox",
      id: "checkpoint-order-total",
      fileName: "order.html",
      scriptFile: "order.js",
      title: "🧪 Checkpoint: the order form reacts",
      intro:
        "Paste order.html into the top box and order.js into the bottom one. For some checkpoints the checker uses your page the way a customer would: it chooses, types and clicks, then looks at the result. The steps it takes are listed under each goal.",
      starter: "<!-- Delete this line, then paste your whole order.html from VS Code here -->\n",
      script: "// Delete this line, then paste your whole order.js from VS Code here\n",
      tasks: [
        {
          goal: "Paste both files. First: the script is linked, and the form has − and + buttons that don't send it.",
          checks: [
            { selector: "form #qty", message: "The top box doesn't have your order form yet (no #qty box inside a <form>). Paste your whole order.html." },
            {
              selector: "body > script[src='order.js']:last-child",
              message: "<script src=\"order.js\"></script> should be the last thing inside <body>.",
            },
            { selector: "#plus", message: "No element with id=\"plus\". Add  <button type=\"button\" id=\"plus\">+</button>  after the qty box." },
            { selector: "#minus", message: "No element with id=\"minus\". Add  <button type=\"button\" id=\"minus\">−</button>  before the qty box." },
            {
              selector: "#plus[type='button']",
              message: "Your + button has no type=\"button\", so inside the form it would SEND the form. Add type=\"button\".",
            },
            {
              selector: "#minus[type='button']",
              message: "Your − button has no type=\"button\", so inside the form it would SEND the form. Add type=\"button\".",
            },
            { selector: "#total", message: "No element with id=\"total\". Add  <p id=\"total\"></p>  under the form." },
          ],
          hint: "Copy the + button, change its id and text for −. Both keep type=\"button\".",
          solution: "<button type=\"button\" id=\"minus\">−</button>\n<input type=\"number\" id=\"qty\" name=\"qty\" min=\"1\" max=\"20\" value=\"1\" required>\n<button type=\"button\" id=\"plus\">+</button>",
          explain: "Only Place order sends the form now.",
        },
        {
          goal: "+ adds one each click.",
          actions: [
            { action: "click", target: "#plus" },
            { action: "click", target: "#plus" },
          ],
          checks: [
            {
              selector: "#qty[value='3']",
              message: "After two clicks on +, the box should say 3 (it starts at 1). If it says 111, you're adding to text: use Number(qty.value) + 1. If it didn't change, look in the console.",
            },
          ],
          hint: "qty.value = Number(qty.value) + 1;  inside the + listener. Does your qty box start at value=\"1\"?",
          solution: "document.getElementById(\"plus\").addEventListener(\"click\", function () {\n  qty.value = Number(qty.value) + 1;\n  showTotal();\n});",
          explain: "Text in, number out, maths, then back into the box.",
        },
        {
          goal: "− takes one away, but never goes below 1.",
          actions: [
            { action: "type", target: "#qty", value: "2" },
            { action: "click", target: "#minus" },
            { action: "click", target: "#minus" },
          ],
          checks: [
            {
              selector: "#qty[value='1']",
              message: "From 2, two clicks on − should leave the box at 1: the first click makes it 1, and the second must do nothing. Check your − listener and its if (Number(qty.value) > 1).",
            },
          ],
          hint: "Change the value only when it's bigger than 1:  if (Number(qty.value) > 1) { … }",
          solution: "document.getElementById(\"minus\").addEventListener(\"click\", function () {\n  if (Number(qty.value) > 1) {\n    qty.value = Number(qty.value) - 1;\n  }\n  showTotal();\n});",
          explain: "Nobody orders zero turon.",
        },
        {
          goal: "+ stops at 20, the form's max.",
          actions: [
            { action: "type", target: "#qty", value: "20" },
            { action: "click", target: "#plus" },
          ],
          checks: [
            {
              selector: "#qty[value='20']",
              message: "At 20, clicking + should do nothing, because 20 is your form's max. Wrap the + change in  if (Number(qty.value) < 20) { … }",
            },
          ],
          hint: "The same if as −, the other way round.",
          solution: "if (Number(qty.value) < 20) {\n  qty.value = Number(qty.value) + 1;\n}",
          explain: "Your buttons and your form now agree on the limits.",
        },
        {
          goal: "A live total: it shows when the page opens, and follows the typing and the buttons.",
          actions: [
            { action: "choose", target: "#snack", value: "1" },
            { action: "type", target: "#qty", value: "2" },
            { action: "click", target: "#plus" },
          ],
          checks: [
            {
              selector: "#total:not(:empty)",
              message: "#total is empty. Write it in showTotal(), and call showTotal(); once at the end of order.js so it shows as soon as the page opens.",
            },
            {
              selector: "#total",
              text: "45",
              message: "Banana cue (₱15) chosen, 2 typed, + clicked once: #total should say 45. If it says 30, put showTotal(); inside your + listener, just before its });.",
            },
          ],
          hint: "Compare your order.js with the whole file in the lab's fifth mission. Other numbers than 45? Your prices must be exactly { 1: 15, 2: 12, 3: 20, 4: 10, 5: 25, 6: 8 }.",
          solution: "qty.addEventListener(\"input\", showTotal);\nshowTotal();",
          explain: "The box and the buttons both keep the total up to date.",
        },
        {
          goal: "The total follows the snack too: choosing another one redraws it.",
          actions: [{ action: "choose", target: "#snack", value: "2" }],
          checks: [
            {
              selector: "#total",
              text: "12",
              message: "Choosing Turon (₱12) should make #total say 12. If it still says 15, add  snack.addEventListener(\"change\", showTotal);  at the end of order.js — no brackets after showTotal.",
            },
          ],
          hint: "A drop-down fires 'change' when the choice changes. Hand it showTotal itself, not showTotal(). Not 12? Check Turon's price in your prices object.",
          solution: "snack.addEventListener(\"change\", showTotal);",
          explain:
            "A total that keeps up with the customer. The form still sends the same snack_id and qty it did last week; the total is only for the person ordering.",
        },
      ],
    },
    {
      kind: "quest",
      id: "error-clinic",
      title: "🏥 The error clinic",
      intro: "Today's patients mostly fail silently. The console is quiet and the page is simply wrong.",
      missions: [
        {
          task: "Patient 1. The code says  plus.addEventListener(\"click\", showTotal());  The total is right when the page opens, but never changes after that.",
          hint: "This morning's warm-up, mission 2. What do the brackets do?",
          check: {
            question: "Diagnosis?",
            choices: [
              "showTotal() ran once, immediately, and its result (undefined) was handed to the button. Remove the brackets: showTotal",
              "The click event doesn't exist",
              "showTotal must be written above the listener",
            ],
            answer: 0,
            explain: "No error, so you can only see this bug by understanding it.",
          },
        },
        {
          task: "Patient 2. The total says  Total: ₱NaN.  The prices object is  { 1: 15, 2: 12, 3: 20 }  and the drop-down's options are  <option>Banana cue</option>…  with no value.",
          hint: "Without a value attribute, what does snack.value give? Is there a price for that key?",
          check: {
            question: "Diagnosis?",
            choices: [
              "15 isn't a number",
              "NaN means the snack is sold out",
              "Without value=\"1\", the option's value is its text, \"Banana cue\". prices[\"Banana cue\"] is undefined, and undefined * 2 is NaN",
            ],
            answer: 2,
            explain: "Last week's lesson again: the value is sent, the text is shown. Give every option its snack_id.",
          },
        },
        {
          task: "Patient 3. Clicking + makes the page flash, and the address bar now ends with  ?snack_id=1&qty=2.",
          hint: "What kind of button is a <button> inside a <form> when it has no type?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The + button has no type, so inside the form it's a submit button and sends the form. Add type=\"button\"",
              "Live Server is broken",
              "The plus listener has a typo",
            ],
            answer: 0,
            explain: "The checker reports this one in words: 'The form was sent…'.",
          },
        },
        {
          task: "Patient 4. The box goes 1 → 11 → 111 with each click on +.",
          hint: "What type does qty.value give you, and what does + do to text?",
          check: {
            question: "Fix?",
            choices: [
              "Use qty.value++",
              "qty.value = Number(qty.value) + 1;  turns the text into a number before adding",
              "Change the box to type=\"text\"",
            ],
            answer: 1,
            explain: "Yesterday's \"Total: \" + 12 + 3, in a form Java doesn't have: in Java, a number box would give you an int.",
          },
        },
        {
          task: "Patient 5. The console says:  Uncaught ReferenceError: showtotal is not defined.",
          hint: "Compare the function's name where you wrote it with where you called it, capitals included.",
          check: {
            question: "Diagnosis?",
            choices: [
              "showTotal must be declared with let",
              "Functions only work after the page loads",
              "The function is called showTotal, with a capital T. JavaScript names care about capitals, so showtotal is a different, nonexistent name",
            ],
            answer: 2,
            explain: "'is not defined' means JavaScript has never heard that exact name.",
          },
        },
        {
          task: "Patient 6. Typing in the box updates the total. Pressing + changes the box but the total stays the same.",
          hint: "Does an input event fire when your own code changes qty.value?",
          check: {
            question: "Fix?",
            choices: [
              "Listen for 'click' on the qty box",
              "Call showTotal(); at the end of the + listener. Code changing a value fires no event",
              "Use change instead of input",
            ],
            answer: 1,
            explain: "Events are for what people do. Your code has to update the page itself.",
          },
        },
        {
          task: "Patient 7. Nothing on the page works any more, not even the buttons. The console says:  Uncaught SyntaxError: Identifier 'prices' has already been declared (order.js:15).",
          hint: "Search order.js for 'const prices' (Ctrl+F in VS Code). How many times is it there?",
          check: {
            question: "Diagnosis?",
            choices: [
              "The prices are wrong",
              "const prices is typed twice. A name can only be made once, and a SyntaxError stops the WHOLE file before any line runs. Delete one of them",
              "The buttons need their own prices",
            ],
            answer: 1,
            explain:
              "A SyntaxError is different from the others: it's found before the script starts, so nothing at all runs. It happens most when you type a code block twice, or paste it on top of what you already had.",
          },
        },
        {
          task: "Write your discharge notes: one line per patient, then your rule for a bug with no red line in the console.",
          hint: "Silent bugs are found by checking values. Where can you print a variable to see what it really holds?",
          input: "Paste your seven notes and your rule",
        },
      ],
    },
    {
      kind: "quest",
      id: "make-your-own",
      inline: true,
      title: "✨ Your own addition to the order form",
      intro:
        "Make your order form do one more thing that you choose. Do at least one idea; if you have time, do more. There's no upper limit.",
      missions: [
        {
          task: "Pick one idea, or invent your own, and build it with a listener. Ideas: (1) a 'Start over' button (type=\"button\") that puts the quantity back to 1 and redraws the total; (2) a line under the total that says 'Big order!' when the quantity is 10 or more, and is empty otherwise; (3) a line that shows the price of ONE piece of the chosen snack, e.g. 'Turon: ₱12 each'.",
          hint:
            "Ideas 2 and 3 can go inside showTotal(), because it already runs on every change: add an empty <p id=\"…\"></p> in order.html, then write into it at the end of showTotal. Idea 1 is a new button with its own addEventListener, like + and −. Your +, − and total must keep working, and every new button inside the form needs type=\"button\".",
        },
        {
          task: "Paste what you added: the new HTML line(s), the new order.js lines, and one sentence on what each does. Finished early? Add another idea first, then paste them all.",
          hint: "Copy the lines from VS Code. Not sure it still all works? Paste order.html and order.js into today's checkpoint again: it tells you the first thing that broke.",
          input: "Paste your new HTML, your new order.js lines, and what each one does",
        },
      ],
    },
  ],
  game: {
    kind: "boss-battle",
    id: "boss-frozen-form",
    title: "⚔️ Boss battle: The Frozen Form",
    intro: "The Frozen Form ignores every click. Wake it up.",
    boss: { name: "the Frozen Form", emoji: "🧊" },
    questions: [
      {
        prompt: "What does addEventListener(\"click\", showTotal) do?",
        choices: [
          "Runs showTotal right now",
          "Gives the browser showTotal to run every time the element is clicked",
          "Sends a click to the server",
        ],
        answer: 1,
        explain: "Register now, run later.",
      },
      {
        prompt: "The qty box shows 4. What is qty.value + 1?",
        choices: ["5", "\"41\"", "NaN"],
        answer: 1,
        explain: "The value is text, and + on text joins it. Number(qty.value) + 1 is 5.",
      },
      {
        prompt: "What is Number(\"abc\")?",
        choices: ["0", "An error", "NaN"],
        answer: 2,
        explain: "NaN, 'not a number', is a value, not an error, which is why it shows up quietly as ₱NaN.",
      },
      {
        prompt: "A <button> inside a <form> with no type attribute is…",
        choices: ["a submit button", "a plain button", "invisible"],
        answer: 0,
        explain: "That's why your + and − say type=\"button\".",
      },
      {
        prompt: "Which event fires while someone types into a box?",
        choices: ["click", "input", "submit"],
        answer: 1,
        explain: "input fires on every keystroke; change fires for a drop-down when the choice changes.",
      },
      {
        prompt: "Your code sets qty.value = 5. Does the box's input event fire?",
        choices: [
          "Yes, every time",
          "Only on Chrome",
          "No. Events report what people do, so call your update function yourself",
        ],
        answer: 2,
        explain: "That's why each button listener ends with showTotal();",
      },
      {
        prompt: "prices is { 1: 15, 2: 12, 3: 20 }. What is prices[\"2\"]?",
        choices: ["12", "undefined", "2"],
        answer: 0,
        explain: "An object's keys are text, so the option's value \"2\" finds the price 12.",
      },
      {
        prompt: "The page shows the wrong total but the console has no red line. What do you do?",
        choices: [
          "Assume the browser is wrong",
          "console.log the values you multiply (the price and the count) to see what they really are",
          "Delete order.js and start again",
        ],
        answer: 1,
        explain: "A silent bug is a wrong value somewhere. Print values until you find which one.",
      },
    ],
  },
  practice: {
    intro: "Exit ticket: type these into the turn-in box below.",
    steps: [
      "What a listener is, in your own words.",
      "Why qty.value + 1 gives 11, and how you fixed it.",
      "Why your + and − buttons need type=\"button\".",
      "What surprised you or broke today, and why it happened.",
      "One question you still have.",
    ],
    note: "Your order form reacts now. Tomorrow the menu stops being typed by hand: it's built from a list of snacks, the same shape as the rows of a SELECT.",
  },
};
