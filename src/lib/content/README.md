# Course content

All course material lives here as **data**, not pages. `src/app/week/[slug]/page.tsx`
renders any week from its `Week` object, so adding a week never means writing JSX.

```
types.ts          the Week type — the shape every week must satisfy
weeks/            one file per week
index.ts          weeks[] · roadmap[] · getWeek(slug)
```

## Adding a week

**1. Create the content file.** Copy `weeks/unit1-week1.ts` as a starting point:

```ts
// weeks/unit1-week2.ts
import type { Week } from "../types";

export const unit1Week2: Week = {
  slug: "unit1-week2",
  unit: "Unit 1 · Databases & SQL",
  title: "Week 2 — UPDATE, DELETE, and primary keys",
  summary: "One sentence a student reads before deciding to click.",
  objectives: ["I can …", "I can …"],
  video: {
    title: "Video title (channel)",
    url: "https://…",
    watchNotes: ["Watch 0:00–14:30.", "Pause at 6:00 and type the query yourself."],
  },
  reading: [
    { label: "SQLBolt — Lesson 4", url: "https://…", note: "Do the exercises, don't just read." },
  ],
  activity: {
    title: "…",
    goal: "One sentence: what they'll have built when done.",
    steps: ["…", "…"],
    twist: "The part that can't be copied from the tutorial.",
    deliverables: ["…"],
  },
  selfCheck: [{ question: "…", answer: "…" }],
  status: "available",
};
```

**2. Register it** in `index.ts` — import it and add it to `weeks[]`. Array order
is display order on the home page.

**3. Remove its "coming soon" line** from `roadmap[]` in the same file, so the
week doesn't appear both as available and as upcoming.

That's it. The home page lists it, `/week/<slug>` renders it, and
`generateStaticParams()` prerenders it — no other file changes.

## Rules that keep the course consistent

- **Slugs are permanent.** Once students have the link, changing `slug` breaks
  it. Format: `unit<N>-week<N>`.
- **Both tracks must cover the same material.** At least one student struggles
  with video learning, so the reading track is a real alternative, not a
  footnote. Both feed the same activity.
- **`watchNotes` should include timestamps** and at least one instruction to
  stop and do something — passive watching is the failure mode.
- **Every activity needs a real `twist`.** It must be impossible to satisfy by
  typing along with the tutorial. This is what makes "done" mean something when
  nothing is graded.
- **Aim for ~5 `selfCheck` items.** The week page tells students that 4 out of 5
  means they're in good shape.
- **Write to the student, not about them.** Second person, plain language, and
  say explicitly that being stuck is fine — the reflection depends on honesty.
- **`status: "coming-soon"`** keeps a week out of the home page's available list
  while you draft it.
