# Demo Mode — the unlisted "try it" classroom

`/demo` drops anyone into a working classroom without being on the class list.
It exists so the project can be shown to people who will never have an account —
and it is the one place the app creates accounts for strangers, so the isolation
is worth understanding before touching anything here.

**The route is linked from nowhere.** `/login` deliberately has no demo button:
the class must not be offered a sandbox they could mistake for their own course,
or a way to lose their session mid-lesson. The URL is the handout — a CV, a
portfolio page, a reply to someone who asked to see the project. The page is
`noindex`, and it 404s (rather than explaining itself) when the demo is off or
the key is wrong. If someone already signed in for real reaches it, they get a
"this would sign you out" card instead of the button.

`DEMO_KEY` is the second lock: set it and the only way in is `/demo?key=<value>`.
Use it on the deployment the class actually uses.

## The shape: one visitor = one cohort

A **cohort** is a uuid stamped on `profiles.demo_cohort`. Starting a demo mints
one and creates five throwaway accounts inside it:

| Slot | Who | Why |
|---|---|---|
| `teacher` | Dana Reyes | the teacher view — release control, roster, turn-ins |
| `student` | Sam Torres | **the visitor**, signed in as this one |
| `peer1`–`peer3` | Alex, Bea, Kim | seeded work, so the teacher's pages aren't empty |

Emails are `demo-<cohort-uuid>-<slot>@demo.example.com` — the cohort is
recoverable from the address, which is what lets cleanup work from the auth user
list alone (`cohortFromEmail`).

The demo class is parked on week 1 with **day 3 released** and days 1–2 turned in
by the three classmates. The visitor's own student account is deliberately empty:
the first thing turned in should be theirs.

## Isolation is in the policies, not the app

Every teacher-side policy went from `is_teacher()` to
`is_teacher() and same_cohort(...)`:

```sql
create or replace function public.same_cohort(target uuid) ... security definer as $$
  select (select demo_cohort from public.profiles where id = target)
         is not distinct from
         (select demo_cohort from public.profiles where id = auth.uid());
$$;
```

`is not distinct from` makes null = null true, so the **real** teacher (cohort
null) matches real students and legacy rows with no profile, while a **demo**
teacher matches only their own cohort. Nothing app-side is trusted for this.

Three consequences worth remembering:

- **`allowed_students` is cohort-scoped too**, and its `with check` forbids any
  logged-in user from writing a non-null `demo_cohort`. That's what keeps
  `demo_role` (the column that lets the demo teacher be born a teacher) from
  becoming a self-promotion path — only the service-role key can set a cohort.
- **Releasing writes `demo_course_state`**, a separate table keyed by cohort, so
  a visitor pressing "Release day 4" cannot move the real class. `course_state`'s
  update policy now also requires `my_cohort() is null`.
- **`updateStudentName` is the exception that needs an app-side check**, because
  it writes profiles through the admin client, which bypasses RLS. It compares
  `cohortFromEmail(email)` against the teacher's own cohort and returns early on
  a mismatch. Any future admin-client write needs the same guard.

## Files

| Path | Role |
|---|---|
| `lib/demo.ts` | cohort/email helpers, the seeded cast and work samples, `seedCohort`, `sweepExpiredCohorts`, `destroyCohort` |
| `app/demo/actions.ts` | `startDemo`, `switchDemoRole`, `exitDemo` — the only callers of the admin client for demo accounts |
| `app/demo/page.tsx` | the unlisted landing page: key check, `noindex`, already-signed-in guard |
| `app/demo/StartDemoForm.tsx` | the button + pending state (building a cohort takes a few seconds) |
| `components/DemoBanner.tsx` | the persistent banner: which role you are, switch, exit |
| `lib/auth.ts` | `CurrentUser.demoCohort`, `currentDemoCohort()`; `getCurrentUser` is now `cache()`d |
| `lib/release.ts` | `getCourseState()` reads `demo_course_state` for a demo session |

## Seeding runs as the demo students, not as admin

`seedCohort` signs in as each seeded classmate with a plain anon-key client and
inserts *their own* rows. That's deliberate: the seeded turn-ins have to satisfy
exactly the policies a real student's turn-in does, so every demo start is also a
live check that those policies still work. The service-role key is used for
account lifecycle only — creating the users, the class-list rows that get them
past the signup trigger, and deleting all of it again.

## Lifecycle

- **Start** — sweeps expired cohorts first (there's no cron; starting a demo is
  the only thing that creates one), then builds and seeds. A failure anywhere
  destroys the half-built cohort rather than leaving a broken classroom.
- **Exit** — deletes the cohort immediately. Deleting the auth users cascades to
  profiles, submissions and reflections; the class-list rows and course state are
  removed explicitly.
- **Expiry** — `DEMO_TTL_HOURS` (24) for a visitor who just closes the tab, plus
  a hard cap of 60 live cohorts.

The cohort's shared password lives in an httpOnly `jch-demo` cookie — that's what
makes the role switch possible, and it can only ever sign you into your own
cohort.

## Turning it off

`demoEnabled()` requires `SUPABASE_SERVICE_ROLE_KEY` and `DEMO_MODE !== "off"`;
`demoKeyAccepted()` additionally checks `?key=` against `DEMO_KEY` when that's
set. Either failing makes `/demo` a 404. `DEMO_MODE=off` disables it outright.

## Gotchas

- **Don't relax `same_cohort` to a plain equality check.** `= ` would make every
  null-cohort comparison null (not true), and the real teacher would instantly
  stop seeing real students.
- **A demo teacher can add to their own class list**, and that row is a real
  registration grant for 24 hours — scoped to a throwaway cohort, but don't
  "improve" it into something that writes a null cohort.
- **Emails are never sent from a demo** (`addStudent` forces `sendEmail` off).
  Un-forcing it would put the project's SMTP behind an anonymous button.
- Demo accounts are ordinary rows to the rest of the app; nothing else in the
  codebase branches on `demoCohort` except the banner and `getCourseState()`.
