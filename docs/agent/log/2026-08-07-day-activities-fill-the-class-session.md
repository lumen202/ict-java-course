# Day activities — filling the 5-hour class session (Day 1 as the model)

**Date:** 2026-08-07

## Why

The teacher flagged that lessons feel thin: Day 1 was ~15 minutes of video plus two one-line
practice blurbs, but a class day is **5 hours**. The content model had nowhere to put warm-ups,
games, or labs, so days couldn't be richer without abusing the `practice` strings (which render
as a single paragraph).

## What shipped

- **Content model** (`src/lib/content/types.ts`): new `DayActivity` type
  (`title`, `minutes`, `steps[]`, `tip?`) and two optional `DayPlan` fields — `warmup`
  (before the videos, ideally screen-free) and `activities[]` (after the videos: labs, games,
  design exercises). Both optional, so existing days render unchanged.
- **Template** (`src/app/week/[slug]/page.tsx`): renders warmup → videos (with per-video
  practice) → activities → closing practice. New `ActivityCard` (numbered steps, `~N min`
  badge, optional 💡 tip) and a `daySubtitle()` header line that sums activity minutes
  ("14 min of video and ~145 min of hands-on work — this is the whole session").
- **Week 1 Day 1 rebuilt** as the reference for a full day (~4h + breaks):
  paper-database warm-up game (rows/columns/queries by hand, felt before named) →
  install + create-database videos with beefed-up practice (incl. create/DROP `sandbox`) →
  four activities: Workbench scavenger hunt, "break it on purpose" error-reading lab,
  design-a-table-on-paper for something from the student's own life (feeds the week's twist),
  and a from-memory cheat-sheet habit → three-line exit ticket + "teach someone at home".
- Docs: `codebase-map/course-content.md` updated with the new fields and the
  "a class day is ~5 hours" pacing rule.

## Watch out for

- All copy stays inside the bans: no grading, no attendance mentions — checked.
- `activity.steps` (week-level) are still not rendered; day activities are a different,
  rendered thing. Don't confuse the two when writing content.
- Activity `minutes` drive the header estimate — keep them honest or pacing advice lies.

## What's next

- **Days 2–5 are still thin.** Expand them with the Day 1 pattern (warmup + activities per
  day); the paper artifacts from Day 1 (warm-up sheet, own-table design) are designed to be
  consumed by later days — Day 2's INSERT practice should use the interview sheet, and the
  Day 4 twist should draw on the paper table design.
- Consider a printable one-page teacher run-sheet per day (out of scope for now).
