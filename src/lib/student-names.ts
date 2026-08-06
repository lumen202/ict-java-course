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
