"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { completeSignup, type WelcomeState } from "./actions";
import { PasswordField } from "@/components/PasswordField";

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
      {pending ? "Saving…" : "Finish setting up"}
    </button>
  );
}

export function WelcomeForm({
  defaults,
}: {
  defaults: { first: string; middle: string; last: string };
}) {
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
            Middle <span className="font-normal text-zinc-500">(optional)</span>
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

      <SubmitButton />
    </form>
  );
}
