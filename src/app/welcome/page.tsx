import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeForm } from "./WelcomeForm";

export const metadata: Metadata = { title: "Finish setting up" };

// Where an invited person lands after clicking the link in their email.
// They already have a session at this point (created by /auth/confirm), but no
// password and usually no name yet — this page collects both.
export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?error=expired-link");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, middle_name, last_name, onboarded_at")
    .eq("id", user.id)
    .single();

  // Already finished? Nothing to do here.
  if (profile?.onboarded_at) redirect("/");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        Welcome
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Set up your account</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        You were invited as <span className="font-medium">{user.email}</span>. Enter
        your name the way it appears on the class list, and pick a password you&apos;ll
        remember — you&apos;ll use it every week.
      </p>

      <WelcomeForm
        defaults={{
          first: profile?.first_name ?? "",
          middle: profile?.middle_name ?? "",
          last: profile?.last_name ?? "",
        }}
      />
    </main>
  );
}
