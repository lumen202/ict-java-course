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

-- Block self-promotion: role changes are rejected unless made by a teacher.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_teacher() then
    raise exception 'only teachers can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_role_escalation on public.profiles;
create trigger profiles_no_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Every new auth user automatically gets a profile (role defaults to student).
--
-- Everyone signs up as a student. To promote the teacher, run this ONCE in the
-- SQL Editor *after* that person has created their account (the row doesn't
-- exist until they sign up). See the bottom of this file.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

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
-- Promote the teacher (run separately, AFTER they have signed up)
-- ---------------------------------------------------------------------------
-- Signing up always creates a student. Grant the teacher role by email:
--
--   update public.profiles
--   set role = 'teacher'
--   where id = (select id from auth.users where email = 'jdiniega202@gmail.com');
--
-- Check it worked:
--
--   select u.email, p.role from public.profiles p
--   join auth.users u on u.id = p.id;
--
-- There is no in-app way to become a teacher — that's deliberate, since a
-- self-serve teacher signup would expose every student's reflections.
