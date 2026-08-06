import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";
import { BackLink } from "@/components/BackLink";

export const metadata: Metadata = { title: "Create your account" };

// Public, but not open: only emails the teacher has put on the class list can
// actually register (enforced by a database trigger, see supabase/schema.sql).
export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-6">
        <BackLink href="/login" label="Sign in" />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
        ICT · Java track
      </p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 mb-8 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Your teacher adds you to the class list first, then you set up your own
        account here. Enter your name the way it appears on the class list.
      </p>
      <RegisterForm />
    </main>
  );
}
