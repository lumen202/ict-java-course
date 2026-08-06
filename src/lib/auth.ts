import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "student" | "teacher";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};

/**
 * The logged-in user plus their profile, or null when signed out.
 * Always uses getUser() (which verifies the token with Supabase) rather than
 * getSession(), whose cookie contents are not trustworthy on the server.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name || user.email?.split("@")[0] || "Student",
    // No profile row yet (trigger lag on a brand-new signup) → treat as student.
    role: (profile?.role as Role) ?? "student",
  };
}

/** Redirects to the login page when signed out. Returns the user otherwise. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Redirects signed-out users to login, and non-teachers to the home page. */
export async function requireTeacher(returnTo: string): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  if (user.role !== "teacher") redirect("/");
  return user;
}
