"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn, type AuthState } from "./actions";
import { PasswordField } from "@/components/PasswordField";

// Sign-in only. Account creation lives at /register, and is limited to emails
// the teacher has added to the class list.

const inputCls =
  "input";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({ next, linkError }: { next: string; linkError?: string }) {
  const [state, formAction] = useActionState(signIn, {} as AuthState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {linkError && (
        <p className="rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm leading-relaxed">
          {linkError}
        </p>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputCls}
        />
      </div>

      <PasswordField name="password" label="Password" />

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <SubmitButton />

      <p className="border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs text-zinc-500 leading-relaxed">
        First time here? Once your teacher has added your email to the class
        list,{" "}
        <Link href="/register" className="text-emerald-700 dark:text-emerald-400 hover:underline">
          create your account
        </Link>
        .
      </p>
    </form>
  );
}
