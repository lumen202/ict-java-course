import type { Week } from "./types";
import { unit1Week1 } from "./weeks/unit1-week1";
import { unit1Week2 } from "./weeks/unit1-week2";
import { unit1Week3 } from "./weeks/unit1-week3";
import { unit1Week4 } from "./weeks/unit1-week4";
import { unit2Week5 } from "./weeks/unit2-week5";
import { unit2Week6 } from "./weeks/unit2-week6";
import { unit3Week7 } from "./weeks/unit3-week7";

// Order here = display order on the home page.
export const weeks: Week[] = [
  unit1Week1,
  unit1Week2,
  unit1Week3,
  unit1Week4,
  unit2Week5,
  unit2Week6,
  unit3Week7,
];

// Roadmap shown on the home page for weeks that don't exist yet.
// When a week is built, remove its entry here and add the real Week above.
export const roadmap: { unit: string; items: string[] }[] = [
  {
    unit: "Unit 3 · REST APIs with Spring Boot",
    items: [
      "Week 8 — Your canteen ledger behind your API: the snacks and orders move into MySQL",
      "Weeks 9–10 — Edit and delete from your pages, and a site that runs entirely on your API",
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
