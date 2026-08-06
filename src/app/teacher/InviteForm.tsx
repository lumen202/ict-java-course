"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { inviteStudent, type InviteState } from "./actions";

const inputCls =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium"
    >
      {pending ? "Sending…" : "Send invite"}
    </button>
  );
}

export function InviteForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (prev: InviteState, formData: FormData) => {
      const result = await inviteStudent(prev, formData);
      if (result.notice) formRef.current?.reset();
      return result;
    },
    {} as InviteState,
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label htmlFor="invite-email" className="block text-sm font-medium mb-1">
            Student email
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="student@example.com"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="invite-first" className="block text-sm font-medium mb-1">
            First name <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input id="invite-first" name="firstName" maxLength={60} className={inputCls} />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="invite-last" className="block text-sm font-medium mb-1">
            Last name <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input id="invite-last" name="lastName" maxLength={60} className={inputCls} />
        </div>
        <div className="flex items-end sm:col-span-1">
          <SubmitButton />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.notice && (
        <p className="rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm">
          {state.notice} They&apos;ll get an email with a link to set their password.
        </p>
      )}
      <p className="text-xs text-zinc-500 leading-relaxed">
        Pre-filling the name is optional — the student confirms it themselves when
        they set up their account.
      </p>
    </form>
  );
}
