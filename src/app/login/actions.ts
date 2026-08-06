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

// Signing up lives in src/app/register/actions.ts, not here. It's open to
// anyone the teacher has put on the class list (`allowed_students`) and closed
// to everyone else — enforced by a database trigger, not by this file.

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
