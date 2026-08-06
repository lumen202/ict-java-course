"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type RegisterState = { error?: string; notice?: string };

// Self-registration, gated by the class list.
//
// The real gate is the handle_new_user() trigger in the database, which aborts
// the signup when the email isn't in allowed_students — so this holds even if
// someone calls the Supabase auth API directly instead of using this form.
//
// Nothing here depends on email being deliverable. When the service-role key is
// present we create the account already confirmed and sign the student in on
// the spot; students never wait for a confirmation message that Supabase's
// built-in SMTP may never actually send.
export async function register(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const middleName = String(formData.get("middleName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!firstName) return { error: "Enter your first name." };
  if (!lastName) return { error: "Enter your last name." };
  if (firstName.length > 60 || middleName.length > 60 || lastName.length > 60) {
    return { error: "That name is too long." };
  }
  if (!email.includes("@")) return { error: "Enter the email your teacher put on the class list." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const metadata = {
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
  };

  const supabase = await createClient();
  const admin = createAdminClient();

  if (admin) {
    // email_confirm: true marks the address verified without sending anything,
    // so the "Confirm email" project setting can't strand a student.
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (createError) {
      const failure = describe(createError.message);
      if (failure) return { error: failure };
      console.error("registration failed:", createError.message);
      return { error: "Couldn't create the account. Check the email address and try again." };
    }

    // Sign them in immediately so they land in the app, not on a login screen.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return {
        notice: "Your account is ready — sign in with the email and password you just chose.",
      };
    }

    revalidatePath("/", "layout");
    redirect("/");
  }

  // No service-role key configured: fall back to ordinary signup. This path is
  // subject to the project's "Confirm email" setting.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });

  if (error) {
    const failure = describe(error.message);
    if (failure) return { error: failure };
    console.error("registration failed:", error.message);
    return { error: "Couldn't create the account. Check the email address and try again." };
  }

  if (!data.session) {
    return {
      notice:
        "Your account was created, but this site has email confirmation switched on. Ask your teacher to turn it off, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/** Turns a Supabase auth error into student-readable copy, or null if unknown. */
function describe(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes("class list")) {
    return "That email isn't on the class list yet. Send your teacher the exact address you're using and try again once they've added it.";
  }
  if (lower.includes("already") || lower.includes("registered")) {
    return "There's already an account with that email — sign in instead.";
  }
  return null;
}
