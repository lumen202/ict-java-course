"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { completeSignup, type WelcomeState } from "./actions";

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
      {pending ? "Saving…" : "Finish setting up"}
    </button>
  );
}

export function WelcomeForm({ defaults }: { defaults: { first: string; middle: string; last: string } }) {
  const [state, formAction] = useActionState(completeSignup, {} as WelcomeState);

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
            defaultValue={defaults.first}
            autoComplete="given-name"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="middleName" className="block text-sm font-medium mb-1">
            Middle name <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input
            id="middleName"
            name="middleName"
            maxLength={60}
            defaultValue={defaults.middle}
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
            defaultValue={defaults.last}
            autoComplete="family-name"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Choose a password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Type it again
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={inputCls}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
