"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireTeacher } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteState = { error?: string; notice?: string };

// Invite a student by email. Teacher-only: requireTeacher() runs first, and it
// redirects rather than returning, so the admin client is never reachable by a
// student even if they replayed this action.
export async function inviteStudent(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  await requireTeacher("/teacher");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };

  // The invite email's link comes back to /auth/confirm, which verifies the
  // token and forwards to /welcome to set a password.
  const origin = (await headers()).get("origin") ?? "";
  const redirectTo = `${origin}/auth/confirm?next=/welcome`;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Invites aren't configured on the server (missing service-role key)." };
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    // Read by the handle_new_user() trigger so the teacher's list shows a name
    // straight away, before the student finishes setting up.
    data: { first_name: firstName, last_name: lastName },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already been registered") || message.includes("already exists")) {
      return { error: `${email} has already been invited or registered.` };
    }
    console.error("invite failed:", error.message);
    return { error: "Couldn't send that invite. Check the address and try again." };
  }

  revalidatePath("/teacher/students");
  return { notice: `Invite sent to ${email}.` };
}
