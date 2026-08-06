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
    .select("full_name, first_name, middle_name, last_name, role")
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
  };
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
