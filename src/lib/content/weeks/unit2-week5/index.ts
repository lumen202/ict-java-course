import type { Week } from "../../types";
import { day1 } from "./day1";
import { day2 } from "./day2";
import { day3 } from "./day3";
import { day4 } from "./day4";
import { day5 } from "./day5";

export const unit2Week5: Week = {
  slug: "unit2-week5",
  unit: "Unit 2 · Web pages",
  title: "Week 5 — The canteen goes on the web",
  summary:
    "Aling Nena was never going to open a black console window. So this unit she gets a website — and you get a real Java web project that you'll keep growing for weeks. Every page you build is the face of something your Week 4 CanteenApp already does — the menu page is ListMenu, the order form is RecordSale — and in Week 8 you connect them to that same code. Today you create your own Spring Boot project in VS Code and it serves your first web page. By Friday it holds a small canteen site: a front page, a menu, an order form and a style of its own — every file written by you, served by your own Java app.",
  objectives: [
    "Explain the chain the whole unit builds: browser → your Java app (port 8080) → MySQL (port 3306), and which part is the client or the server at each step",
    "Create and run your own Spring Boot project in VS Code, and read what the terminal and the browser tell you when it doesn't start",
    "Write a web page from a blank file: the document skeleton, headings as an outline, paragraphs, and the tags that keep or collapse whitespace",
    "Put pages where your Java app serves them (static/) and explain the difference between your app on :8080 and Live Server on :5500",
    "Link pages together and show your canteen's menu as a real HTML table",
    "Build an order form whose inputs will one day be sent to your own API",
    "Style your site with CSS in a separate stylesheet",
  ],
  video: {
    title: "Bro Code — HTML & CSS tutorial for beginners",
    playlistUrl: "https://www.youtube.com/playlist?list=PLZPZq0r_RZOOxqHgOzPyCzIl4AJjXbCYt",
    watchNotes: [
      "Back to Bro Code — the same teacher as your Java and MySQL videos, in his 2023 HTML & CSS series, which uses exactly our tools: VS Code and Live Server. Day 1 also has one short video from a different channel (CS CORNER) for creating the Spring Boot project, because Bro Code doesn't cover Spring.",
      "Bro Code builds his pages in a 'website' folder on his desktop. Yours go inside your project, in src/main/resources/static — the folder your Java app serves. Same tags, better address.",
      "When a video says to pick the top Spring Boot version, do: VS Code lists the recommended stable one first. Just never pick one marked (SNAPSHOT) or (M1)/(M2) — they have bigger numbers, but they're unfinished test builds.",
      "Older Spring videos show a dependency called spring-boot-starter-web in pom.xml. In Spring Boot 4 the same thing is called spring-boot-starter-webmvc. If your pom.xml says webmvc, nothing is wrong — that's just the new name.",
      "Type along, always. Don't paste, and don't use VS Code's ! shortcut for the page skeleton until you've typed it by hand a few times. The point is the shape of the page, and the shape only sticks through your fingers.",
    ],
    days: [day1, day2, day3, day4, day5],
  },
  reading: [
    {
      label: "VS Code — Spring Boot in Visual Studio Code",
      url: "https://code.visualstudio.com/docs/java/java-spring-boot",
      note: "The official page for Day 1's setup: creating a project with Spring Initializr and running it. The text alternative to the CS CORNER video.",
    },
    {
      label: "MDN — Basic HTML syntax",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax",
      note: "Elements, tags, attributes and the page skeleton, from the people who document the web for every browser. The reading-track version of the HTML video.",
    },
    {
      label: "MDN — Headings and paragraphs",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Headings_and_paragraphs",
      note: "Why a page has one <h1> and why headings are an outline, not font sizes — the thing Day 1's checker holds you to.",
    },
    {
      label: "MDN — What's in the head? Webpage metadata",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage_metadata",
      note: "Everything that goes in <head>: the title today, the stylesheet link on Thursday.",
    },
    {
      label: "Spring Boot reference — static content and the welcome page",
      url: "https://docs.spring.io/spring-boot/reference/web/servlet.html",
      note: "Search the page for 'Static Content' and 'Welcome Page': the official rules for why static/ is served as-is and why index.html needs no name.",
    },
    {
      label: "MDN — Creating links",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links",
      note: "Day 2: absolute vs relative links, explained with folder diagrams — the text version of the slash problem.",
    },
    {
      label: "MDN — HTML images",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images",
      note: "Day 2: <img>, src and why alt text matters. Read the alt text section even if you watched the video.",
    },
    {
      label: "MDN — Lists",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Lists",
      note: "Day 2: <ul>, <ol> and <li>.",
    },
    {
      label: "MDN — HTML table basics",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_table_basics",
      note: "Day 3: <table>, <tr>, <th>, <td> and <caption> — your result grid, in HTML.",
    },
    {
      label: "MDN — Your first form",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form",
      note: "Day 3: labels, inputs, name vs id, and what 'sending' a form actually does. The reading-track version of the forms video.",
    },
    {
      label: "MDN — Getting started with CSS",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started",
      note: "Day 4: rules, selectors, classes and the <link> to a stylesheet.",
    },
    {
      label: "MDN — The box model",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model",
      note: "Day 4: margin, border and padding — the layers the browser's Inspect tool draws.",
    },
  ],
  activity: {
    title: "Aling Nena's canteen website",
    goal: "A small website — front page, menu, order form, one stylesheet — living in your own Spring Boot project and served by it at localhost:8080.",
    steps: [
      "Day 1: create the project, serve index.html from static/.",
      "Day 2: more pages, linked together; images and lists.",
      "Day 3: the menu as a table, and an order form.",
      "Day 4: one stylesheet for the whole site.",
      "Day 5: finish, audit, hand in.",
    ],
    twist:
      "Your site gets one page that isn't about the canteen: a page about the pair of tables YOU designed in week 3 — what they store and one question they answer. In Week 8 that page is the first one to show live data from your own API.",
    deliverables: [
      "Screenshots of your site running at localhost:8080",
      "Your pages, pasted into the checkpoints",
      "The self-check and the two-minute 'where are you at?' below",
    ],
  },
  selfCheck: [
    {
      question: "Your app runs and localhost:8080 shows a Whitelabel Error Page with status 404. Is your project broken?",
      answer:
        "No. Only your running Spring Boot app can produce that page, so it proves the app started and your browser reached it. The 404 means there's no page at that address — usually no index.html in static/, or the file is in the wrong folder.",
    },
    {
      question: "What's the difference between localhost:8080 and 127.0.0.1:5500?",
      answer:
        "8080 is your own Java app (Spring Boot's Tomcat) serving the files in static/. 5500 is Live Server, a VS Code helper that reloads the page on every save. Use Live Server while writing; check in your app before handing in — the app only picks up changes when it restarts.",
    },
    {
      question: "Why can't a page in src/main/resources/templates be opened in the browser?",
      answer:
        "templates/ is for pages a Java controller builds with a template engine. Plain HTML that the browser should receive exactly as written goes in static/, and only files there are served by their file name.",
    },
    {
      question: "Why does a page have exactly one <h1>?",
      answer:
        "Headings are the page's outline, read by screen readers and search engines: one <h1> for what the page is, <h2> for its sections, <h3> for parts of those. Choosing a heading for its size is a mistake — size is CSS's job.",
    },
    {
      question: "You typed three line breaks between two sentences in one <p>. Why do they show up on one line?",
      answer:
        "HTML collapses whitespace in your code into a single space. Line breaks on the page come from tags — a new <p> or a <br>. <pre> is the one place spacing is kept exactly as typed.",
    },
  ],
  status: "available",
};
