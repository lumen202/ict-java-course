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

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "teachers read all profiles" on public.profiles;
create policy "teachers read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_teacher());

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

alter table public.allowed_students enable row level security;

-- Only teachers can see or change the class list. Students never read it —
-- the signup check below runs SECURITY DEFINER instead, so an applicant can be
-- validated without the list being readable.
drop policy if exists "teachers manage the class list" on public.allowed_students;
create policy "teachers manage the class list"
  on public.allowed_students for all
  to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

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

  insert into public.profiles (id, email, first_name, middle_name, last_name, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'middle_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
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

drop policy if exists "teachers set course state" on public.course_state;
create policy "teachers set course state"
  on public.course_state for update
  to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

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

drop policy if exists "teachers read all reflections" on public.reflections;
create policy "teachers read all reflections"
  on public.reflections for select
  to authenticated
  using (public.is_teacher());

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
