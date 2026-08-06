# 2026-08-07 — playlist day-pacing + grading secrecy scrub

**Who:** Claude (Fable 5) · **Outcome:** lint+build clean, left uncommitted

- **Video track restructured**: `Week.video` is now a playlist + `DayPlan[]`.
  Week 1 schedules Bro Code's "MySQL tutorial for beginners" playlist
  (`PLZPZq0r_RZOMskz6MdsMOgxzheIyjo-BZ` — 31 videos, ~2h59m video total,
  scraped live so IDs/durations are real) across 5 gentle days for
  no-foundation students: ≤15 min of video per day + mandatory practice; day 5
  is video-free wrap-up. Full playlist map for future weeks recorded in
  `src/lib/_palace/DECISIONS.md` (D6).
- **Week page** renders day cards: day chip, focus, minutes, embedded players,
  "Then do" practice box. All 7 week-1 videos verified in prerendered HTML.
- **Grading secrecy** (user directive): course is ungraded but students must
  not be told either way. Scrubbed footer, hero, how-a-week-works, self-check,
  mark-done copy; rule added to AGENTS.md + content README; verified zero
  grading mentions in built HTML.
