# 2026-08-07 — accounts + role-scoped RLS

**Who:** Claude (Opus 5) · **Scope:** `schema.sql` (rewritten)

## What changed
- Added `profiles` (with `user_role` enum), `is_teacher()`, role-escalation
  guard trigger, and `handle_new_user()` signup trigger.
- `reflections` gained `user_id` + indexes; anonymous-insert policy dropped and
  replaced with student-owns-own / teacher-reads-all policies.
- Documented the promote-to-teacher SQL for `jdiniega202@gmail.com`.

## Why / decisions
- User reversed the v1 "no accounts" decision in favour of a login page with
  role scoping. D1/D2 superseded by D5/D6; D7 added.

## Learned / traps for future agents
- A `profiles` policy that queries `profiles` recurses — hence SECURITY DEFINER
  on `is_teacher()`.
- Signup can't set `role`: the trigger raises on any role change by a
  non-teacher, so promotion is a manual SQL step by design.
- Schema still unrun against the live project as of this session.

## Left undone
- Running the schema; creating accounts; verifying the round trip.
