import type { Week } from "./types";
import { unit1Week1 } from "./weeks/unit1-week1";
import { unit1Week2 } from "./weeks/unit1-week2";
import { unit1Week3 } from "./weeks/unit1-week3";
import { unit1Week4 } from "./weeks/unit1-week4";
import { unit2Week5 } from "./weeks/unit2-week5";

// Order here = display order on the home page.
export const weeks: Week[] = [unit1Week1, unit1Week2, unit1Week3, unit1Week4, unit2Week5];

// Roadmap shown on the home page for weeks that don't exist yet.
// When a week is built, remove its entry here and add the real Week above.
export const roadmap: { unit: string; items: string[] }[] = [
  {
    unit: "Unit 2 · Web pages",
    items: [
      "Week 6 — JavaScript for Java programmers: make a page react",
    ],
  },
  {
    unit: "Unit 3 · REST APIs with Spring Boot",
    items: [
      "Week 7 — HTTP and Spring Boot: your first endpoint answers in JSON",
      "Week 8 — Your canteen ledger behind an API: create, read, update, delete",
      "Weeks 9–10 — Your web page talks to your API: tables from JSON, forms that save",
      "Weeks 11–12 — Logins, errors end to end, and one program you can hand to someone",
    ],
  },
  {
    unit: "Unit 4 · Final project",
    items: ["Starts December: you propose your own project, then build it"],
  },
];

export function getWeek(slug: string): Week | undefined {
  return weeks.find((w) => w.slug === slug);
}
