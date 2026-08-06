# 2026-08-07 — playlist + day-by-day pacing, grading scrub

**Who:** Claude (Fable 5) · **Scope:** `content/types.ts`, `content/weeks/unit1-week1.ts`

## What changed
- Replaced the single-video track with `DayPlan[]`: week 1 now schedules Bro
  Code's "MySQL tutorial for beginners" playlist across 5 days (2 short videos
  + practice per day; day 5 = wrap-up, no video).
- Playlist metadata (31 video IDs, titles, durations; ~2h59m total) scraped
  live from YouTube — IDs in week 1 are verified real.

## Why / decisions
- D5 superseded; D6, D7 recorded.

## Learned / traps for future agents
- Playlist data can be re-scraped from the playlist page's `ytInitialData`
  (lockupViewModel entries: `contentId`, badge `text` = duration). The full
  video list for future weeks is in D6.
- "6 hours" in planning talk = work time (video ≈3h × 2 for typing along).

## Left undone
- Weeks 2+ still unwritten; their playlist segments are mapped in D6.
