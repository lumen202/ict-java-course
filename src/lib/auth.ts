import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "student" | "teacher";

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  /**
   * Set only for throwaway demo accounts, and equal for everyone in the same
   * demo classroom. Non-null means "this session is a demo" — the app uses it
   * to pick the demo's own course state and to show the demo banner. It is not
   * a permission: the isolation itself is in the RLS policies.
   */
  demoCohort: string | null;
};

/**
 * The logged-in user plus their profile, or null when signed out.
 * Always uses getUser() (which verifies the token with Supabase) rather than
 * getSession(), whose cookie contents are not trustworthy on the server.
 *
 * Wrapped in React's cache() so the several callers a single render has (the
 * shell, the page, getCourseState) share one lookup per request.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name, middle_name, last_name, role, demo_cohort")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    // Auth metadata is the last resort but the most reliable: it's whatever the
    // person typed when they registered, stored by Supabase itself, regardless
    // of which version of the profile trigger was installed at the time.
    fullName: displayName(profile, user.user_metadata, user.email),
    // No profile row yet (trigger lag on a brand-new signup) → treat as student.
    role: (profile?.role as Role) ?? "student",
    demoCohort: (profile?.demo_cohort as string | null) ?? null,
  };
});

/** The demo classroom this request belongs to, or null for a real session. */
export async function currentDemoCohort(): Promise<string | null> {
  return (await getCurrentUser())?.demoCohort ?? null;
}

type NameParts = {
  full_name?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
} | null;

/**
 * `full_name` is normally maintained by a database trigger, but it's empty for
 * anyone whose account predates that trigger — or predates the version of it
 * that copies name parts. So try, in order: the derived column, the profile's
 * parts, the auth metadata the person actually typed, and only then the email
 * prefix (which reads like a username, not a name).
 */
function displayName(
  profile: NameParts,
  metadata: Record<string, unknown> | undefined,
  email?: string,
): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim();

  const fromProfile = join(profile?.first_name, profile?.middle_name, profile?.last_name);
  if (fromProfile) return fromProfile;

  const str = (key: string) =>
    typeof metadata?.[key] === "string" ? (metadata[key] as string) : undefined;
  const fromMetadata =
    str("full_name")?.trim() || join(str("first_name"), str("middle_name"), str("last_name"));
  if (fromMetadata) return fromMetadata;

  return email?.split("@")[0] || "Student";
}

function join(...parts: (string | null | undefined)[]): string {
  return parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ");
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
