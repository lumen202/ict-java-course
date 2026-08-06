# BUG-005: Names and registration status were wrong because trigger-written columns were empty

- **Found:** 2026-08-07
- **Where:** `src/lib/auth.ts`, `src/app/teacher/students/page.tsx`
- **Symptom:** Two visible failures with one cause.
  1. A registered student appeared everywhere as `jaskatlas` — their email prefix — instead of the
     name they typed at registration.
  2. The class list showed **"Not yet"** for that same student long after they had an account.
- **Cause:** both facts were read from columns filled by database triggers
  (`profiles.full_name` via `sync_full_name`, `profiles.email` and
  `allowed_students.registered_at` via `handle_new_user`). The account was created while an older
  version of those triggers was installed, so the columns were empty. The app treated empty as
  truth.
- **Status:** fixed (2026-08-07)
  - `getCurrentUser()` resolves a display name in order: `full_name` → the profile's name parts →
    **the auth user's `user_metadata`** (what the person actually typed, stored by Supabase
    itself) → email prefix.
  - The students page derives "registered" by unioning profile emails with
    `admin.auth.admin.listUsers()`, keeping `registered_at` only as a fallback.
  - Teachers can now edit names inline, which repairs bad or missing data without SQL.

## The lesson

**Trigger-written columns are a cache, not a source of truth.** Anything created before a trigger
existed — or under an earlier version of it — carries empty values forever, and schema changes
land at unpredictable times relative to real data. Read from the authoritative store (auth, in
this case) and treat derived columns as an optimisation.
