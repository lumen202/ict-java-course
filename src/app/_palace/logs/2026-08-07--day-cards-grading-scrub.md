# 2026-08-07 — day-by-day video cards, grading scrub

**Who:** Claude (Fable 5) · **Scope:** `week/[slug]/page.tsx`, `page.tsx`

## What changed
- Week template: video track section now renders `week.video.days` — per-day
  cards with embedded players, per-day video minutes (computed by
  `totalMinutes()`), and a practice box. Playlist link replaces the single
  "Open on YouTube" link.
- Home: hero and "how a week works" closing rewritten to drop grading
  mentions.
- Self-check intro: "that's normal, not failure" → "totally normal".

## Why / decisions
- User directive: the no-grading policy is a secret — student-facing copy must
  never mention grading in either direction. Rule recorded in AGENTS.md.

## Learned / traps for future agents
- When editing student copy, grep `graded|not a grade|not failure` before
  shipping; `grade_level` (column name) is a false positive.

## Left undone
- Nothing.
