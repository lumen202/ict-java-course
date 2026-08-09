import "server-only";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { getWeek } from "@/lib/content";
import type { DayPlan } from "@/lib/content/types";

// Demo mode — a throwaway private classroom for anyone who wants to look
// around without being on the teacher's class list.
//
// The shape: one visitor = one *cohort* (a uuid) containing a demo teacher, the
// visitor's own demo student, and three seeded classmates with work already
// turned in. The cohort is stamped on `profiles.demo_cohort`, and every
// teacher-side RLS policy is `is_teacher() and same_cohort(...)` — so the
// isolation between demo and real data is enforced by the database, not by
// anything in this file. See the demo section of supabase/schema.sql.
//
// Seeding deliberately runs as the demo users themselves (signed-in clients
// below), not with the service-role key: the seeded rows then have to satisfy
// exactly the same policies a real student's turn-in does, which is both a
// tighter guarantee and a smoke test of the policies on every demo start.

/** Cohorts older than this are swept the next time someone starts a demo. */
export const DEMO_TTL_HOURS = 24;

/** Belt and braces: never leave more than this many demo cohorts alive. */
const MAX_LIVE_COHORTS = 60;

const EMAIL_DOMAIN = "demo.example.com";
const EMAIL_RE = /^demo-([0-9a-f-]{36})-([a-z0-9]+)@demo\.example\.com$/;

/**
 * Demo mode needs the service-role key (creating accounts is an auth-admin
 * operation). Set DEMO_MODE=off to hide it on a deployment that has the key but
 * shouldn't offer a demo.
 */
export function demoEnabled(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) && process.env.DEMO_MODE !== "off";
}

export type DemoSlot = "teacher" | "student" | "peer1" | "peer2" | "peer3";

export function demoEmail(cohort: string, slot: DemoSlot): string {
  return `demo-${cohort}-${slot}@${EMAIL_DOMAIN}`;
}

/** The cohort a demo address belongs to, or null when it isn't one of ours. */
export function cohortFromEmail(email: string): string | null {
  return EMAIL_RE.exec(email.toLowerCase())?.[1] ?? null;
}

/** The cast. The visitor is `student`; the rest exist so the teacher's roster
 *  and submissions pages have something real to show. */
export const DEMO_PEOPLE: { slot: DemoSlot; first: string; last: string; role: "student" | "teacher" }[] = [
  { slot: "teacher", first: "Dana", last: "Reyes", role: "teacher" },
  { slot: "student", first: "Sam", last: "Torres", role: "student" },
  { slot: "peer1", first: "Alex", last: "Rivera", role: "student" },
  { slot: "peer2", first: "Bea", last: "Santos", role: "student" },
  { slot: "peer3", first: "Kim", last: "Delgado", role: "student" },
];

/** Which week/day the demo class is parked on: far enough in that there's
 *  history to look at, not so far that day 1 is buried. */
export const DEMO_WEEK_SLUG = "unit1-week1";
export const DEMO_RELEASED_DAY = 3;

export function demoPassword(): string {
  // Throwaway, but it is a real password on a real account, so make it one.
  return `demo-${crypto.randomUUID()}${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * A Supabase client signed in as one specific user, with no cookie binding —
 * so seeding as three different students doesn't disturb the visitor's own
 * session. Every write through it is subject to that user's RLS.
 */
export async function signedInClient(email: string, password: string): Promise<SupabaseClient> {
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`demo sign-in failed for ${email}: ${error.message}`);
  return client;
}

// ---------------------------------------------------------------------------
// Seed material
// ---------------------------------------------------------------------------

/**
 * Turn-ins for one day, derived from the day's own content rather than
 * hard-coded ids — a renamed activity changes what gets seeded instead of
 * silently seeding an orphan box the week page never shows.
 */
function seedItemsForDay(day: DayPlan, personIndex: number): { item: string; content: string }[] {
  const ids = [
    ...(day.activities ?? []).map((a) => a.id),
    ...(day.game ? [day.game.id] : []),
  ].slice(0, 3);

  const rows = ids.map((item, i) => ({
    item,
    content: WORK_SAMPLES[(personIndex + i) % WORK_SAMPLES.length],
  }));

  rows.push({
    item: "day",
    content: DAY_NOTES[personIndex % DAY_NOTES.length],
  });

  return rows;
}

const WORK_SAMPLES = [
  "mysql> CREATE DATABASE school;\nQuery OK, 1 row affected (0.01 sec)\n\nmysql> USE school;\nDatabase changed\n\nmysql> SHOW TABLES;\nEmpty set (0.00 sec)",
  "CREATE TABLE students (\n  id INT,\n  name VARCHAR(50),\n  age INT,\n  grade VARCHAR(10)\n);\n\nDESCRIBE students;\n-- 4 columns, all NULL allowed (haven't done keys yet)",
  "INSERT INTO students (id, name, age, grade)\nVALUES (1, 'Sam', 15, '9-A'),\n       (2, 'Alex', 16, '10-B'),\n       (3, 'Bea', 15, '9-A');\n\nQuery OK, 3 rows affected (0.00 sec)",
  "SELECT * FROM students WHERE grade = '9-A';\n-- 2 rows: Sam and Bea\n\nSELECT name FROM students WHERE age > 15;\n-- 1 row: Alex",
  "-- broke it on purpose:\nSELECT * FROM studnets;\nERROR 1146 (42S02): Table 'school.studnets' doesn't exist\n\n-- fixed the spelling and it ran",
];

const DAY_NOTES = [
  "Finished everything. The WHERE part clicked once I saw the rows light up in the game.",
  "Took me two tries to get the semicolon habit. Everything ran in the end.",
  "Got stuck on the quotes around text values — numbers don't need them, words do. Noted.",
  "Done. The error-code lab was the useful bit; now I actually read the error instead of panicking.",
];

const REFLECTIONS = [
  {
    hardest_part: "Remembering when to use quotes. I keep putting them around numbers.",
    want_explained: "Why VARCHAR needs a size but INT doesn't.",
    confidence: 2,
  },
  {
    hardest_part: "Nothing was too bad today — the typing game made the syntax stick.",
    want_explained: null,
    confidence: 3,
  },
  {
    hardest_part: "I mixed up DATABASE and TABLE for most of the lesson.",
    want_explained: "Could we go over the difference once more at the start of next class?",
    confidence: 1,
  },
];

/**
 * Fills a fresh cohort with a plausible class: released days, turn-ins from the
 * three seeded classmates, and their reflections. The visitor's own student
 * account is left empty on purpose — the first thing they turn in should be
 * theirs.
 */
export async function seedCohort(cohort: string, password: string): Promise<void> {
  const week = getWeek(DEMO_WEEK_SLUG);
  if (!week) throw new Error(`demo week ${DEMO_WEEK_SLUG} is not published`);

  // The teacher opens the week — same insert the release button makes.
  const teacher = await signedInClient(demoEmail(cohort, "teacher"), password);
  const { error: stateError } = await teacher.from("demo_course_state").insert({
    cohort,
    current_week_slug: DEMO_WEEK_SLUG,
    current_day: DEMO_RELEASED_DAY,
  });
  if (stateError) throw new Error(`demo course state failed: ${stateError.message}`);

  const peers = DEMO_PEOPLE.filter((p) => p.slot.startsWith("peer"));
  const seededDays = Math.min(DEMO_RELEASED_DAY - 1, week.video.days.length);

  await Promise.all(
    peers.map(async (person, personIndex) => {
      const client = await signedInClient(demoEmail(cohort, person.slot), password);
      const name = `${person.first} ${person.last}`;

      const rows = [];
      for (let dayNumber = 1; dayNumber <= seededDays; dayNumber++) {
        for (const { item, content } of seedItemsForDay(week.video.days[dayNumber - 1], personIndex)) {
          rows.push({
            week_slug: DEMO_WEEK_SLUG,
            day_number: dayNumber,
            item,
            student_name: name,
            content,
          });
        }
      }

      // user_id is left to RLS's with-check via an explicit value: the policy
      // demands user_id = auth.uid(), so send it rather than relying on a
      // default that doesn't exist.
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user) return;

      await client.from("submissions").insert(rows.map((r) => ({ ...r, user_id: user.id })));

      const reflection = REFLECTIONS[personIndex % REFLECTIONS.length];
      await client.from("reflections").insert({
        user_id: user.id,
        week_slug: DEMO_WEEK_SLUG,
        student_name: name,
        ...reflection,
      });
    }),
  );
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

type AdminClient = SupabaseClient;

/**
 * Deletes expired demo cohorts. Deleting the auth user cascades to its profile,
 * submissions and reflections, so only the class-list rows and the cohort's
 * course state need clearing separately.
 *
 * Called on every demo start rather than from a cron: the only thing that
 * creates demo data is someone starting a demo, so that's the moment there's
 * something to clean up.
 */
export async function sweepExpiredCohorts(admin: AdminClient): Promise<void> {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error || !data) return;

  const byCohort = new Map<string, { ids: string[]; oldest: number }>();
  for (const user of data.users) {
    const cohort = cohortFromEmail(user.email ?? "");
    if (!cohort) continue;
    const created = new Date(user.created_at).getTime();
    const entry = byCohort.get(cohort) ?? { ids: [], oldest: created };
    entry.ids.push(user.id);
    entry.oldest = Math.min(entry.oldest, created);
    byCohort.set(cohort, entry);
  }

  const cutoff = Date.now() - DEMO_TTL_HOURS * 60 * 60 * 1000;
  const oldestFirst = [...byCohort.entries()].sort((a, b) => a[1].oldest - b[1].oldest);
  const overflow = Math.max(0, oldestFirst.length - MAX_LIVE_COHORTS);

  const doomed = oldestFirst.filter(([, e], i) => e.oldest < cutoff || i < overflow);

  for (const [cohort, entry] of doomed) {
    for (const id of entry.ids) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(id);
      if (deleteError) console.error("demo cleanup: user delete failed:", deleteError.message);
    }
    await admin.from("allowed_students").delete().eq("demo_cohort", cohort);
    await admin.from("demo_course_state").delete().eq("cohort", cohort);
  }
}

/** Tears down one cohort immediately — what "Exit demo" does. */
export async function destroyCohort(admin: AdminClient, cohort: string): Promise<void> {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  for (const user of data?.users ?? []) {
    if (cohortFromEmail(user.email ?? "") === cohort) {
      await admin.auth.admin.deleteUser(user.id);
    }
  }
  await admin.from("allowed_students").delete().eq("demo_cohort", cohort);
  await admin.from("demo_course_state").delete().eq("cohort", cohort);
}
