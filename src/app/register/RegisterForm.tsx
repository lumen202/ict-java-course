"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { register, type RegisterState } from "./actions";
import { PasswordField } from "@/components/PasswordField";

const inputCls =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium"
    >
      {pending ? "Creating your account…" : "Create my account"}
    </button>
  );
}

export function RegisterForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, formAction] = useActionState(register, {} as RegisterState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            required
            maxLength={60}
            autoComplete="given-name"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="middleName" className="block text-sm font-medium mb-1">
            Middle <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="middleName"
            name="middleName"
            maxLength={60}
            autoComplete="additional-name"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last name
          </label>
          <input
            id="lastName"
            name="lastName"
            required
            maxLength={60}
            autoComplete="family-name"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="email"
          className={inputCls}
        />
        <p className="mt-1 text-xs text-zinc-500">
          {defaultEmail
            ? "This is the address your teacher added — change it only if it's wrong."
            : "Use the exact address you gave your teacher."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordField
          name="password"
          label="Choose a password"
          hint="At least 8 characters."
          minLength={8}
          autoComplete="new-password"
        />
        <PasswordField
          name="confirmPassword"
          label="Type it again"
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.notice && (
        <p className="rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm">
          {state.notice}
        </p>
      )}

      <SubmitButton />

      <p className="border-t border-zinc-200 dark:border-zinc-800 pt-4 text-xs text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-700 dark:text-emerald-400 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
