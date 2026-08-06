"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Server actions for auth. Everything runs on the server so the session cookie
// is set by Supabase before we redirect. Errors come back as a string that the
// form renders — never a raw Supabase message, which leaks account existence.

export type AuthState = { error?: string; notice?: string };

/** Only allow same-site relative paths, so ?next= can't become an open redirect. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "That email and password don't match. Check for typos and try again." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

// There is deliberately no signUp action: accounts exist only by teacher
// invite (src/app/teacher/actions.ts → inviteUserByEmail), and the invited
// student sets their password at /welcome. Turn off "Allow new users to sign
// up" in the Supabase dashboard too, so the API can't be used to self-register.

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
