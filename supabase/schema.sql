-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Creates the reflections table students submit to at the bottom of each week page.

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  week_slug text not null,
  student_name text not null,
  hardest_part text not null,
  want_explained text
);

alter table public.reflections enable row level security;

-- Students (anonymous key) may only INSERT. Nobody can read with the anon key;
-- the teacher view reads via the service-role key on the server, which bypasses RLS.
create policy "anyone can submit a reflection"
  on public.reflections for insert
  to anon
  with check (true);
