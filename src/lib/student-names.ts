import { createClient } from "@/lib/supabase/server";

// Teacher-side display names for students, best-source-first: the profile's
// full_name (what the student registered as, or what the teacher corrected it
// to), then the class list's name (allowed_students — the teacher's own
// spelling), and the caller falls back to whatever snapshot it has. Fixes the
// case where an account exists but its profile was created without names —
// the class list usually still knows who they are.
//
// Teacher-only by construction: allowed_students is readable only by teachers
// (RLS), so for anyone else the class-list layer is simply empty.
export async function studentDisplayNames(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const [{ data: profiles }, { data: classList }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name"),
    supabase.from("allowed_students").select("email, first_name, last_name"),
  ]);

  const listNameByEmail = new Map(
    (classList ?? []).map((r) => [
      String(r.email ?? "").toLowerCase(),
      [r.first_name, r.last_name].filter(Boolean).join(" ").trim(),
    ]),
  );

  const names = new Map<string, string>();
  for (const p of profiles ?? []) {
    const name =
      ((p.full_name as string) ?? "").trim() ||
      listNameByEmail.get(String(p.email ?? "").toLowerCase()) ||
      "";
    if (name) names.set(p.id as string, name);
  }
  return names;
}

// IDs of every account with role 'teacher'. A teacher walking through a
// lesson to test it leaves rows in submissions/reflections exactly like a
// student would; nothing else distinguishes them, so student-only listings
// need to exclude these before grouping by user_id, or the teacher's own
// test data shows up mixed in with the class.
//
// Deliberately an EXCLUDE-teachers list, not an INCLUDE-students one: a
// brand-new account has no profiles row until the signup trigger's insert
// lands (getCurrentUser() treats that gap as role 'student', see its comment
// on trigger lag), so requiring a positive role='student' match drops real,
// just-turned-in student work the moment the row is queried in that gap —
// worse than the teacher-contamination bug this was built to fix. Unknown
// defaults to "show it"; only a confirmed teacher gets excluded.
export async function teacherUserIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id").eq("role", "teacher");
  return new Set((data ?? []).map((p) => p.id as string));
}
