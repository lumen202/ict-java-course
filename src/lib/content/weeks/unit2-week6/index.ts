import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit2Week6: Week = {
  slug: "unit2-week6",
  unit: "Unit 2 · Web pages",
  title: "Week 6 — Pages that react",
  summary:
    "Last week you built Aling Nena's site, but every page just sits there: the menu is typed in by hand and the order form sends its values off to nowhere. This week you add JavaScript, the language that runs inside the browser. You already know Java, so you're learning a new language with a familiar shape, not programming from zero. By Friday the order page adds up the total as people type and answers with a receipt, and the menu builds itself from a list of objects. Your tables page will load rows from a JSON file using the exact code that will load them from your own Java API next week. Everything still lives in your canteen-web project.",
  objectives: [
    "Link a script to a page, print to the browser's console, and read the errors it shows you",
    "Explain how JavaScript differs from the Java you know: let and const instead of types, === instead of ==, and code that runs in the customer's browser rather than on your server",
    "Find elements by id and change what they say",
    "Make a page react to clicks and typing with addEventListener, turning a box's text into a number before doing maths with it",
    "Keep data as an array of objects — the same shape as the rows of a SELECT — and build table rows from it with a loop",
    "Handle a form in JavaScript: stop the page from reloading, show a result, and turn the order into JSON",
    "Load JSON with fetch() and build a table from it — the move your pages make when your own API exists",
  ],
  video: {
    title: "Bro Code — JavaScript tutorial for beginners",
    playlistUrl: "https://www.youtube.com/playlist?list=PLZPZq0r_RZOO1zkgO4bIdfuLpizCeHYKv",
    watchNotes: [
      "Same teacher as your Java, MySQL and HTML videos: Bro Code's JavaScript series, with VS Code and Live Server, exactly like last week. The series is long because it teaches programming from zero. You already know Java, so this week skips to the parts that are new.",
      "JavaScript is not Java. The names are alike for marketing reasons from the 1990s. It has no classes you must write, no main method, and no types on variables. A script just runs from top to bottom when the page loads.",
      "Bro Code keeps one index.js in a 'website' folder on his desktop. You keep one script per page in src/main/resources/static, named after its page: index.js for index.html, order.js for order.html, menu.js for menu.html. Each script only touches its own page.",
      "He sometimes uses window.alert() and window.prompt() for output and input. Never put those on the canteen site: they freeze the page until someone clicks OK. Your output goes onto the page itself (textContent) or into the console (console.log).",
      "In the counter video he writes button.onclick = function() { … }. This week uses button.addEventListener(\"click\", …) instead. Both work for a click, but addEventListener is what forms need on Thursday, and two listeners on one button don't erase each other.",
      "Type along, always, and keep the browser's console open while you do (F12 → Console). Your script's errors only ever show up there. A page that 'does nothing' almost always has a red line in the console explaining why.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "MDN — What is JavaScript?",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/What_is_JavaScript",
      note: "Day 1: what runs where, how a <script> is linked, and why the script tag goes at the end of <body>. The reading-track version of the first video.",
    },
    {
      label: "MDN — Storing the information you need: variables",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Variables",
      note: "Day 1: let and const, and how a variable with no type can hold anything. Read it alongside your Java habits.",
    },
    {
      label: "MDN — Equality comparisons and sameness",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness",
      note: "Day 1: == versus ===. Read the first two sections; the rest is detail you won't need.",
    },
    {
      label: "MDN — Introduction to events",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events",
      note: "Day 2: addEventListener, the click and input events, and the event object. The text version of the counter video.",
    },
    {
      label: "MDN — Number() and type conversion",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/Number",
      note: "Day 2: why a box's value is always text, and what Number() turns it into, NaN included.",
    },
    {
      label: "MDN — JavaScript object basics",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Object_basics",
      note: "Day 3: keys and values, dot notation and bracket notation. Bracket notation is what Friday's table code uses.",
    },
    {
      label: "MDN — Arrays",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Arrays",
      note: "Day 3: arrays, length and loops. Read alongside the arrays-of-objects video.",
    },
    {
      label: "MDN — Manipulating documents",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting",
      note: "Day 3: document.createElement, textContent and append, the three calls that build your menu rows.",
    },
    {
      label: "MDN — Event: preventDefault() method",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault",
      note: "Day 4: the method that cancels what the browser would do by itself. MDN's examples use a checkbox and a text box; on a form, the thing it cancels is the page reload.",
    },
    {
      label: "MDN — Working with JSON",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON",
      note: "Day 4: JSON.stringify and JSON.parse. The text version of the JSON video.",
    },
    {
      label: "MDN — Using the Fetch API",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
      note: "Day 5: fetch(), response.json() and .then(). Read the first section; the rest is for later weeks.",
    },
  ],
  activity: {
    title: "Aling Nena's site comes alive",
    goal: "The same four pages as last week, now with a script each: a greeting, a live order total and receipt, a menu built from data, and a tables page that loads its rows from a JSON file.",
    steps: [
      "Day 1: index.js, the console, and changing text on the page.",
      "Day 2: order.js, with + and − buttons and a live total.",
      "Day 3: menu.js builds the menu from an array of objects and adds a search box.",
      "Day 4: order.js takes over the form, shows a receipt and turns the order into JSON.",
      "Day 5: tables.js fetches your own Week 3 rows from rows.json.",
    ],
    twist:
      "Your tables page shows sample rows from YOUR Week 3 tables — the answer to the question you wrote last Friday — loaded from a rows.json file you write from your own query's result. No one else's site has that file. When your API exists, the only change is the address inside fetch().",
    deliverables: [
      "Screenshots of your pages running at localhost:8080 with the console open",
      "Your pages and scripts, pasted into the checkpoints",
      "The self-check and the exit tickets",
    ],
  },
  selfCheck: [
    {
      question: "Your page shows nothing new and the console says: Uncaught TypeError: Cannot set properties of null (setting 'textContent'). What happened?",
      answer:
        "document.getElementById(…) found nothing and gave you null, so there was nothing to set the text on. Either the id in your script doesn't match the id in your HTML exactly (capitals count), or your <script> tag is above the element, so the script ran before the element existed. Put the script tag last in <body>.",
    },
    {
      question: "The quantity box says 1. Your + button runs  qty.value = qty.value + 1  and the box says 11. Why?",
      answer:
        "A box's value is always text. \"1\" + 1 joins two pieces of text and gives \"11\". Turn it into a number first: Number(qty.value) + 1. The other maths signs (*, -, /) happen to convert for you, but + doesn't, so make Number() a habit.",
    },
    {
      question: "What's the difference between == and === in JavaScript?",
      answer:
        "== converts the two sides to the same type before comparing, so 12 == \"12\" is true. === compares without converting, so 12 === \"12\" is false. Use === everywhere. It's the one that does what Java programmers expect.",
    },
    {
      question: "Why does your submit listener start with event.preventDefault()?",
      answer:
        "Sending a form makes the browser load a new page, which throws away everything your script just showed. preventDefault() cancels that, so your code decides what happens next. Today that's a receipt on the same page; next week it's sending the order to your own API.",
    },
    {
      question: "Your menu is built from  const snacks = [{ snack_id: 1, name: \"Banana cue\", price: 15 }, …].  What is the same about that array and the result of  SELECT snack_id, name, price FROM snacks?",
      answer:
        "Each object is one row, and each key is a column name. That's also exactly what JSON from an API looks like, which is why the code that builds your menu from this array will work unchanged on data from your Java app.",
    },
  ],
  status: "available",
};
