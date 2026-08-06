# Day-by-day playlist pacing, and the grading copy ban

## What shipped

- **`Week.video` restructured** from a single video into a playlist plus `days: DayPlan[]` — each
  day has a focus line, its own short videos, and required `practice` text. Rationale: these
  students have no prior foundation, so ~10–20 minutes of video a day with something to type
  beats one long video.
- Week 1 now schedules Bro Code's "MySQL tutorial for beginners" playlist
  (`PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ`) across five days; day 5 is a video-free wrap-up. The
  playlist's 31 video IDs, titles and durations (~2h59m total) were scraped live, so the IDs in
  the content file are real. The mapping for future weeks is in
  [`../codebase-map/course-content.md`](../codebase-map/course-content.md).
- The week page renders those days as cards with embedded players and a "Then do" box.

## New standing rule

**Student-facing copy must never mention grading, in either direction.** The course is ungraded,
but that's a teacher-side fact: claiming it's graded would be a lie, and saying it isn't kills
effort. Scrubbed the footer, hero, "how a week works", self-check intro and the mark-done button;
verified zero grading mentions in the built HTML.

## Watch out for

"Six hours" of course time means *work* time, not watch time — the videos total ~3h and typing
along roughly doubles that. The watch notes tell students to budget 2×.
