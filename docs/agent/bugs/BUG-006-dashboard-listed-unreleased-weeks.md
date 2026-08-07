# BUG-006: Student dashboard listed weeks the teacher hadn't released

- **Found:** 2026-08-07
- **Where:** `src/app/StudentDashboard.tsx` ("Earlier weeks" section)
- **Symptom:** The dashboard filtered weeks by content `status === "available"` only. That flag
  means "this week is written", not "the class has reached it" — so when Week 2 was published in
  the content registry while the class was still on Week 1, students saw Week 2's title on their
  dashboard as a preview. Clicking through hit the week page's own release guard ("hasn't started
  yet"), so no content leaked, but the title and topic did — exactly what the day-by-day release
  control exists to prevent.
- **Status:** fixed (2026-08-07) — "Earlier weeks" now also requires `isWeekOpen(w, state)`, the
  same `lib/release.ts` rule every other student surface (sidebar, `/lessons`, week page) already
  used. The dashboard was the only surface trusting content status alone.
