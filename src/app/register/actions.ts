"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = { error?: string; notice?: string };

// Self-registration, gated by the class list. The real gate is the
// handle_new_user() trigger in the database, which aborts the signup when the
// email isn't in allowed_students — so this holds even if someone calls the
// Supabase auth API directly instead of using this form.
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, middle_name: middleName, last_name: lastName },
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("class list")) {
      return {
        error:
          "That email isn't on the class list yet. Send your teacher the exact address you're using and try again once they've added it.",
      };
    }
    if (message.includes("already")) {
      return { error: "There's already an account with that email — sign in instead." };
    }
    console.error("registration failed:", error.message);
    return { error: "Couldn't create the account. Check the email address and try again." };
  }

  // No session means email confirmation is switched on in Supabase.
  if (!data.session) {
    return { notice: "Account created. Check your email to confirm it, then sign in." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
