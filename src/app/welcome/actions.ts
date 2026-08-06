"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type WelcomeState = { error?: string };

// Completes an invited account: set a password, confirm the real name.
// Runs as the invited user (their session came from the invite link), so RLS
// covers the profile update and the role-escalation trigger stops them granting
// themselves teacher.
export async function completeSignup(
  _prev: WelcomeState,
  formData: FormData,
): Promise<WelcomeState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const middleName = String(formData.get("middleName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!firstName) return { error: "Enter your first name." };
  if (!lastName) return { error: "Enter your last name." };
  if (firstName.length > 60 || middleName.length > 60 || lastName.length > 60) {
    return { error: "That name is too long." };
  }
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your link expired. Ask your teacher to send a new one." };
  }

  const { error: passwordError } = await supabase.auth.updateUser({ password });
  if (passwordError) {
    return { error: "Couldn't save that password. Try a different one." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Saved your password, but not your name — try again." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
