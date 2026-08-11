-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement is idempotent.
--
-- Two tables:
--   profiles     — one row per auth user, carrying their role (student | teacher)
--   reflections  — weekly reflections, owned by the student who wrote them
--
-- Security model: everything is enforced by Row Level Security using the
-- logged-in user's own token. Students may only touch their own rows; teachers
-- may read everyone's. The app never needs the service-role key for this.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('student', 'teacher');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name text not null default '',
  role public.user_role not null default 'student'
);

-- Signup is invite-only, so the teacher needs to see who has been invited, who
-- has finished setting up, and their real name — hence these columns.
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text not null default '';
alter table public.profiles add column if not exists middle_name text not null default '';
alter table public.profiles add column if not exists last_name text not null default '';
-- Set when the invited person has chosen a password and filled in their name.
alter table public.profiles add column if not exists onboarded_at timestamptz;

-- Demo mode. Null for every real account. A throwaway "try it" visitor gets a
-- private cohort (one uuid) shared by their demo teacher and demo students, and
-- every teacher-side policy below is scoped to it — so a demo teacher can never
-- read a real student's work, and the real teacher never sees demo noise. See
-- the demo section at the end of this file.
alter table public.profiles add column if not exists demo_cohort uuid;
create index if not exists profiles_demo_cohort_idx on public.profiles (demo_cohort);

-- Keeps full_name in sync with the parts, so the rest of the app can just read
-- full_name (it's what appears on reflections).
create or replace function public.sync_full_name()
returns trigger
language plpgsql
as $$
begin
  if coalesce(new.first_name, '') <> '' or coalesce(new.last_name, '') <> '' then
    new.full_name := trim(regexp_replace(
      concat_ws(' ', new.first_name, nullif(new.middle_name, ''), new.last_name),
      '\s+', ' ', 'g'));
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_full_name on public.profiles;
create trigger profiles_sync_full_name
  before insert or update on public.profiles
  for each row execute function public.sync_full_name();

alter table public.profiles enable row level security;

-- Reading your own role must NOT go through profiles' own RLS policies, or the
-- policies recurse. SECURITY DEFINER runs this as the table owner, bypassing RLS.
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$;

-- Which demo cohort the caller belongs to (null = a real account). SECURITY
-- DEFINER for the same reason as is_teacher(): a policy on profiles that reads
-- profiles would recurse.
create or replace function public.my_cohort()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select demo_cohort from public.profiles where id = auth.uid();
$$;

-- True when `target` sits in the caller's cohort. `is not distinct from` makes
-- null = null true, so a real teacher (cohort null) matches real students and
-- rows whose owner has no profile at all — while a demo teacher (cohort set)
-- matches only their own cohort. This is the whole isolation guarantee.
create or replace function public.same_cohort(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (select demo_cohort from public.profiles where id = target)
         is not distinct from
         (select demo_cohort from public.profiles where id = auth.uid());
$$;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

-- "All" means all of the teacher's own cohort: everyone for the real teacher,
-- only the throwaway accounts for a demo teacher.
drop policy if exists "teachers read all profiles" on public.profiles;
create policy "teachers read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_teacher() and public.same_cohort(id));

-- Students may edit their own name, but NOT their role (enforced by the trigger).
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Block self-promotion: a logged-in non-teacher cannot change any role.
--
-- `auth.uid() is null` means there's no end-user JWT — the SQL Editor, a
-- service-role connection, or a migration. Those are trusted (they already have
-- full database access) and must be allowed, or there'd be no way to appoint
-- the first teacher. See BUG-001.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_teacher() then
    raise exception 'only teachers can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_role_escalation on public.profiles;
create trigger profiles_no_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---------------------------------------------------------------------------
-- allowed_students — the class list
-- ---------------------------------------------------------------------------
-- The teacher adds emails here; only those emails can create an account. This
-- replaces emailed invites: no mail is sent, so nothing depends on SMTP limits
-- or students finding a link in their inbox. They just go to /register.

create table if not exists public.allowed_students (
  email text primary key,
  first_name text not null default '',
  last_name text not null default '',
  added_at timestamptz not null default now(),
  added_by uuid references auth.users(id) on delete set null,
  -- Stamped by the signup trigger when this person actually registers.
  registered_at timestamptz
);

-- Demo cohort's own class list. Set only by the demo bootstrap (which runs with
-- the service-role key); the policy below makes it *impossible* for the real
-- teacher to write a non-null cohort, so demo_role can never be a back door to
-- the teacher role for a real account.
alter table public.allowed_students add column if not exists demo_cohort uuid;
alter table public.allowed_students add column if not exists demo_role public.user_role;

alter table public.allowed_students enable row level security;

-- Only teachers can see or change the class list — and only the part of it that
-- belongs to their own cohort (null for the real class). Students never read it
-- at all: the signup check below runs SECURITY DEFINER instead, so an applicant
-- can be validated without the list being readable.
drop policy if exists "teachers manage the class list" on public.allowed_students;
create policy "teachers manage the class list"
  on public.allowed_students for all
  to authenticated
  using (public.is_teacher() and demo_cohort is not distinct from public.my_cohort())
  with check (public.is_teacher() and demo_cohort is not distinct from public.my_cohort());

create or replace function public.is_email_allowed(check_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_students
    where lower(email) = lower(check_email)
  );
$$;

-- Every new auth user automatically gets a profile (role defaults to student),
-- but ONLY if their email is on the class list. Raising here aborts the signup
-- transaction, so this is the real gate: it holds even if someone calls the
-- Supabase auth API directly, bypassing our /register page.
--
-- Two exemptions: the very first account (bootstrap, when no teacher exists
-- yet) and anyone added by a teacher afterwards.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bootstrap boolean;
begin
  select not exists (select 1 from public.profiles where role = 'teacher') into bootstrap;

  if not bootstrap and not public.is_email_allowed(new.email) then
    raise exception 'email not on the class list';
  end if;

  -- Names: prefer what the person typed at registration; fall back to the
  -- class list's spelling (the teacher's own), so an account created without
  -- name metadata still gets a real name instead of showing as an email.
  --
  -- demo_cohort/demo_role come from the class-list row and are the only way an
  -- account is born into a demo cohort — or born a teacher. Both are safe
  -- because RLS forbids anyone but the service-role key from writing a non-null
  -- demo_cohort, and demo_role is ignored unless demo_cohort is set.
  -- onboarded_at means "has a password" — i.e. this person can actually sign
  -- in, as opposed to having been invited and never accepted. An account
  -- created with a password (self-registration at /register, or the demo) is
  -- onboarded the moment it exists; inviteUserByEmail creates a user with no
  -- password, and /welcome stamps this when they choose one.
  --
  -- Without this, self-registration — the *primary* path — left onboarded_at
  -- null forever, so the teacher dashboard counted every real student as an
  -- unaccepted invite.
  insert into public.profiles (id, email, first_name, middle_name, last_name, full_name, demo_cohort, role, onboarded_at)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'first_name', ''),
      (select a.first_name from public.allowed_students a where lower(a.email) = lower(new.email)),
      ''),
    coalesce(new.raw_user_meta_data ->> 'middle_name', ''),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'last_name', ''),
      (select a.last_name from public.allowed_students a where lower(a.email) = lower(new.email)),
      ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    (select a.demo_cohort from public.allowed_students a where lower(a.email) = lower(new.email)),
    coalesce(
      (select case when a.demo_cohort is not null then a.demo_role end
         from public.allowed_students a where lower(a.email) = lower(new.email)),
      'student'),
    case when coalesce(new.encrypted_password, '') <> '' then now() end
  )
  on conflict (id) do nothing;

  update public.allowed_students
  set registered_at = now()
  where lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill 1: profiles.email is only written by the trigger at signup, so
-- accounts predating that column have it null — which would silently break
-- every email-keyed lookup below (and the teacher's name resolution).
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and coalesce(p.email, '') = '';

-- Backfill 2: accounts created before the class-list fallback above have empty
-- profile names even though the class list knows them. Copy the names across
-- once; the sync_full_name trigger derives full_name. Idempotent — a profile
-- with a name is never touched.
update public.profiles p
set first_name = a.first_name, last_name = a.last_name
from public.allowed_students a
where lower(a.email) = lower(p.email)
  and coalesce(p.full_name, '') = ''
  and (coalesce(a.first_name, '') <> '' or coalesce(a.last_name, '') <> '');

-- Backfill 3: every student who self-registered before the trigger stamped
-- onboarded_at has it null, which made the teacher dashboard read them as
-- "invite pending" forever. Having a password is the real signal, and it's the
-- same test the trigger now makes. Idempotent — a stamped profile is untouched,
-- and a genuinely-invited account (no password yet) stays null.
update public.profiles p
set onboarded_at = u.created_at
from auth.users u
where u.id = p.id
  and p.onboarded_at is null
  and coalesce(u.encrypted_password, '') <> '';

-- ---------------------------------------------------------------------------
-- course_state — what the class is working on right now
-- ---------------------------------------------------------------------------
-- A single row the teacher controls. Students only ever see the current day's
-- lesson and the days already released, so the week page can't become a wall of
-- material to skim ahead through (or get lost in).

create table if not exists public.course_state (
  id boolean primary key default true,
  current_week_slug text not null default 'unit1-week1',
  -- 1-based index into that week's `video.days` array.
  current_day int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  -- Enforces exactly one row.
  constraint course_state_singleton check (id)
);

insert into public.course_state (id) values (true) on conflict (id) do nothing;

alter table public.course_state enable row level security;

drop policy if exists "everyone signed in reads course state" on public.course_state;
create policy "everyone signed in reads course state"
  on public.course_state for select
  to authenticated
  using (true);

-- The real teacher only. A demo teacher pressing "Release day 3" must not move
-- the actual class — they get their own row in demo_course_state below.
drop policy if exists "teachers set course state" on public.course_state;
create policy "teachers set course state"
  on public.course_state for update
  to authenticated
  using (public.is_teacher() and public.my_cohort() is null)
  with check (public.is_teacher() and public.my_cohort() is null);

-- ---------------------------------------------------------------------------
-- demo_course_state — the same thing, one row per demo cohort
-- ---------------------------------------------------------------------------
-- Separate table rather than a nullable column on course_state: that table's
-- singleton constraint is load-bearing for the real class, and this way a demo
-- can't corrupt it even in principle.

create table if not exists public.demo_course_state (
  cohort uuid primary key,
  current_week_slug text not null default 'unit1-week1',
  current_day int not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.demo_course_state enable row level security;

drop policy if exists "demo cohort reads its own state" on public.demo_course_state;
create policy "demo cohort reads its own state"
  on public.demo_course_state for select
  to authenticated
  using (cohort = public.my_cohort());

drop policy if exists "demo teachers set their own state" on public.demo_course_state;
create policy "demo teachers set their own state"
  on public.demo_course_state for update
  to authenticated
  using (public.is_teacher() and cohort = public.my_cohort())
  with check (public.is_teacher() and cohort = public.my_cohort());

drop policy if exists "demo teachers seed their own state" on public.demo_course_state;
create policy "demo teachers seed their own state"
  on public.demo_course_state for insert
  to authenticated
  with check (public.is_teacher() and cohort = public.my_cohort());

-- ---------------------------------------------------------------------------
-- reflections
-- ---------------------------------------------------------------------------

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  week_slug text not null,
  student_name text not null,
  hardest_part text not null,
  want_explained text
);

-- Added when accounts replaced the anonymous name field. Any pre-existing rows
-- keep a null user_id and are readable by teachers only.
alter table public.reflections
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 1 = not yet, 2 = getting there, 3 = solid. Drives the follow-up advice the
-- student sees on submit, and gives the teacher an at-a-glance signal.
alter table public.reflections
  add column if not exists confidence smallint
  check (confidence is null or confidence between 1 and 3);

create index if not exists reflections_user_id_idx on public.reflections (user_id);
create index if not exists reflections_week_slug_idx on public.reflections (week_slug);

alter table public.reflections enable row level security;

-- The old anonymous-insert policy is gone: submitting now requires an account.
drop policy if exists "anyone can submit a reflection" on public.reflections;

drop policy if exists "students submit own reflections" on public.reflections;
create policy "students submit own reflections"
  on public.reflections for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "students read own reflections" on public.reflections;
create policy "students read own reflections"
  on public.reflections for select
  to authenticated
  using (user_id = auth.uid());

-- Cohort-scoped: rows whose author has no profile (the pre-accounts anonymous
-- era) have a null cohort and so stay visible to the real teacher only.
drop policy if exists "teachers read all reflections" on public.reflections;
create policy "teachers read all reflections"
  on public.reflections for select
  to authenticated
  using (public.is_teacher() and public.same_cohort(user_id));

-- ---------------------------------------------------------------------------
-- submissions — each student's turned-in work for a lesson day
-- ---------------------------------------------------------------------------
-- One row per student per turn-in box, updatable: every activity has its own
-- box (item = the activity's id) plus the day's closing box (item = 'day').
-- Same ownership model as reflections: students write their own, teachers read
-- everything.

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_slug text not null,
  day_number int not null check (day_number >= 1),
  -- Which box on the day this belongs to: 'day' or an activity id.
  item text not null default 'day',
  -- Name snapshot at submit time, same as reflections.
  student_name text not null,
  content text not null
);

-- Early version had no `item` and a 3-column unique constraint — migrate.
alter table public.submissions add column if not exists item text not null default 'day';
alter table public.submissions drop constraint if exists submissions_user_id_week_slug_day_number_key;

-- The upsert target (ON CONFLICT works against a unique index).
create unique index if not exists submissions_owner_item_key
  on public.submissions (user_id, week_slug, day_number, item);

create index if not exists submissions_user_id_idx on public.submissions (user_id);
create index if not exists submissions_week_day_idx on public.submissions (week_slug, day_number);

alter table public.submissions enable row level security;

drop policy if exists "students submit own work" on public.submissions;
create policy "students submit own work"
  on public.submissions for insert
  to authenticated
  with check (user_id = auth.uid());

-- Resubmitting is allowed (and encouraged) — the unique key makes it an upsert.
drop policy if exists "students update own work" on public.submissions;
create policy "students update own work"
  on public.submissions for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "students read own work" on public.submissions;
create policy "students read own work"
  on public.submissions for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "teachers read all submissions" on public.submissions;
create policy "teachers read all submissions"
  on public.submissions for select
  to authenticated
  using (public.is_teacher() and public.same_cohort(user_id));

-- Teachers can delete a turn-in to hand work back: the lesson page derives its
-- gating from these rows, so removing them re-locks that part of the day and
-- the student redoes it. Students cannot delete their own — "I'll just clear
-- it" is not a thing, and nothing else in the app deletes submissions.
drop policy if exists "teachers delete submissions" on public.submissions;
create policy "teachers delete submissions"
  on public.submissions for delete
  to authenticated
  using (public.is_teacher() and public.same_cohort(user_id));

-- ---------------------------------------------------------------------------
-- day_unlocks — the teacher's "unstuck" grant for one student's day
-- ---------------------------------------------------------------------------
-- The lesson page normally reveals a day one step at a time, and a step only
-- opens the next when it is finished. Some steps can only be finished by
-- getting them right (the typing drill, the ordering puzzle, the SQL console),
-- so a student who cannot solve one is stopped for the rest of that day —
-- including the turn-in box they would have used to say so.
--
-- A row here lifts the gate for one student on one day. `open_past` says how
-- far: the key of the part they're stuck on (a game or activity id, a video's
-- youtubeId, 'closing', 'turn-in'), which opens everything up to and including
-- the part after it and leaves the rest of the day gated as normal. Null opens
-- the whole day. It grants nothing else, and removing the row puts the gate
-- back.
create table if not exists public.day_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_slug text not null,
  day_number int not null check (day_number >= 1),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  primary key (user_id, week_slug, day_number)
);

-- Added after the first version, which only ever opened whole days.
alter table public.day_unlocks add column if not exists open_past text;

alter table public.day_unlocks enable row level security;

-- The student has to be able to read their own grant — it's what ungates their
-- lesson page.
drop policy if exists "students read own unlocks" on public.day_unlocks;
create policy "students read own unlocks"
  on public.day_unlocks for select
  to authenticated
  using (user_id = auth.uid());

-- Cohort-scoped like every other teacher-side policy: a demo teacher unsticks
-- only their own throwaway classmates. Never simplify these to a bare
-- is_teacher().
drop policy if exists "teachers read cohort unlocks" on public.day_unlocks;
create policy "teachers read cohort unlocks"
  on public.day_unlocks for select
  to authenticated
  using (public.is_teacher() and public.same_cohort(user_id));

drop policy if exists "teachers grant unlocks" on public.day_unlocks;
create policy "teachers grant unlocks"
  on public.day_unlocks for insert
  to authenticated
  with check (public.is_teacher() and public.same_cohort(user_id));

-- Students cannot grant themselves one — there is no student-side insert
-- policy, and no update policy for anybody (grant or revoke, nothing else).
drop policy if exists "teachers revoke unlocks" on public.day_unlocks;
create policy "teachers revoke unlocks"
  on public.day_unlocks for delete
  to authenticated
  using (public.is_teacher() and public.same_cohort(user_id));

-- ---------------------------------------------------------------------------
-- unstuck_requests — a student flagging "I'm stuck here" to the teacher
-- ---------------------------------------------------------------------------
-- The old fix for BUG-008 let a stuck student skip themselves past an
-- unsolvable step. That control belongs to the teacher, not the student —
-- see docs/agent/bugs/BUG-008-unsolvable-step-locks-the-rest-of-the-day.md —
-- so a stuck student now raises a flag here instead of unlocking anything
-- themselves. The teacher's "Someone stuck?" panel surfaces it and grants a
-- day_unlocks row, which is still the only thing that actually opens a step.
--
-- One row per student/week/day, same shape as day_unlocks: `step` names the
-- part they're stuck on (nullable — unused today but kept for parity with
-- open_past). Granting an unlock for the same user/week/day clears the row
-- (see setDayUnlock), so the panel's badge disappears once handled.
create table if not exists public.unstuck_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_slug text not null,
  day_number int not null check (day_number >= 1),
  step text,
  requested_at timestamptz not null default now(),
  primary key (user_id, week_slug, day_number)
);

alter table public.unstuck_requests enable row level security;

-- A student may raise and read only their own flag — there is no way to
-- resolve someone else's, and no student-side delete (revoking is the
-- teacher's grant clearing it, not the student changing their mind).
drop policy if exists "students raise own unstuck request" on public.unstuck_requests;
create policy "students raise own unstuck request"
  on public.unstuck_requests for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "students update own unstuck request" on public.unstuck_requests;
create policy "students update own unstuck request"
  on public.unstuck_requests for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "students read own unstuck request" on public.unstuck_requests;
create policy "students read own unstuck request"
  on public.unstuck_requests for select
  to authenticated
  using (user_id = auth.uid());

-- Cohort-scoped like every other teacher-side policy — never simplify to a
-- bare is_teacher().
drop policy if exists "teachers read cohort unstuck requests" on public.unstuck_requests;
create policy "teachers read cohort unstuck requests"
  on public.unstuck_requests for select
  to authenticated
  using (public.is_teacher() and public.same_cohort(user_id));

drop policy if exists "teachers clear cohort unstuck requests" on public.unstuck_requests;
create policy "teachers clear cohort unstuck requests"
  on public.unstuck_requests for delete
  to authenticated
  using (public.is_teacher() and public.same_cohort(user_id));

-- Realtime broadcasts row changes to subscribers, filtered by each
-- subscriber's own RLS — the "teachers read cohort unstuck requests" policy
-- above is what actually scopes it, this just turns broadcasting on for the
-- table. Wrapped in the exists check because ALTER PUBLICATION ... ADD TABLE
-- errors on a second run rather than no-op'ing like the rest of this file.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'unstuck_requests'
  ) then
    alter publication supabase_realtime add table public.unstuck_requests;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Demo mode — how the isolation actually works
-- ---------------------------------------------------------------------------
-- "Try the demo" (src/app/demo/actions.ts) creates a throwaway cohort: one uuid
-- shared by a demo teacher, the visitor's demo student, and a few seeded
-- classmates. Nothing about it is a special case in the app's queries — the
-- separation is entirely in the policies above:
--
--   • every teachers-read/delete policy is `is_teacher() and same_cohort(...)`,
--     so cohort membership, not the app's routing, is what stops a demo teacher
--     reading a real student's turn-ins (and vice versa);
--   • allowed_students is scoped the same way, and its `with check` forbids any
--     logged-in user from writing a non-null demo_cohort — only the service-role
--     key can, which is why demo_role can't become a self-promotion path;
--   • releasing a day writes demo_course_state, never the real singleton.
--
-- Cleanup deletes the auth users (everything else cascades). Check for leftovers
-- with:
--
--   select demo_cohort, count(*), min(created_at)
--   from public.profiles where demo_cohort is not null group by 1;
--
-- To wipe every demo account by hand, delete those users in Authentication →
-- Users, then:
--
--   delete from public.allowed_students where demo_cohort is not null;
--   delete from public.demo_course_state;

-- ---------------------------------------------------------------------------
-- Promote the teacher (run separately, AFTER they have an account)
-- ---------------------------------------------------------------------------
-- Registering always creates a student. Grant the teacher role by email:
--
--   update public.profiles
--   set role = 'teacher', first_name = 'J', last_name = 'Diniega'
--   where id = (select id from auth.users where email = 'jdiniega202@gmail.com');
--
-- Check it worked:
--
--   select u.email, p.role from public.profiles p
--   join auth.users u on u.id = p.id;
--
-- There is no in-app way to become a teacher — that's deliberate, since a
-- self-serve teacher role would expose every student's reflections.
--
-- Supabase dashboard settings this schema assumes:
--   • Authentication → Providers → Email → "Allow new users to sign up" **ON**
--     (the class-list trigger above is the real gate, not this switch)
--   • "Confirm email" **OFF** — nothing in this app sends or depends on email
