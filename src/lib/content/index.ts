import type { Week } from "./types";
import { unit1Week1 } from "./weeks/unit1-week1";

// Order here = display order on the home page.
export const weeks: Week[] = [unit1Week1];

// Roadmap shown on the home page for weeks that don't exist yet.
// When a week is built, remove its entry here and add the real Week above.
export const roadmap: { unit: string; items: string[] }[] = [
  {
    unit: "Unit 1 · Databases & SQL",
    items: [
      "Week 2 — UPDATE, DELETE, and primary keys",
      "Week 3 — Joins: connecting tables together",
      "Week 4 — JDBC: talking to MySQL from Java",
    ],
  },
  {
    unit: "Unit 2 · JavaFX",
    items: ["Desktop apps: scenes, layouts, events, TableView — then rebuild your CRUD app with a real interface"],
  },
  {
    unit: "Unit 3 · REST APIs",
    items: ["Spring Boot: turn your database into a web API and test it with Postman"],
  },
  {
    unit: "Unit 4 · Final capstone",
    items: ["Connect your JavaFX app to your own REST API — a real client–server system"],
  },
];

export function getWeek(slug: string): Week | undefined {
  return weeks.find((w) => w.slug === slug);
}
