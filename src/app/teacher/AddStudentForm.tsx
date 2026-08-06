"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addStudent, type ClassListState } from "./actions";

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
      {pending ? "Adding…" : "Add to class list"}
    </button>
  );
}

export function AddStudentForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(
    async (prev: ClassListState, formData: FormData) => {
      const result = await addStudent(prev, formData);
      if (result.notice) formRef.current?.reset();
      return result;
    },
    {} as ClassListState,
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="add-email" className="block text-sm font-medium mb-1">
            Student email
          </label>
          <input
            id="add-email"
            name="email"
            type="email"
            required
            placeholder="student@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="add-first" className="block text-sm font-medium mb-1">
            First name <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input id="add-first" name="firstName" maxLength={60} className={inputCls} />
        </div>
        <div>
          <label htmlFor="add-last" className="block text-sm font-medium mb-1">
            Last name <span className="font-normal text-zinc-500">(optional)</span>
          </label>
          <input id="add-last" name="lastName" maxLength={60} className={inputCls} />
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="sendEmail"
          defaultChecked
          className="mt-0.5 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 accent-emerald-600"
        />
        <span>
          Email them an invite link
          <span className="block text-xs text-zinc-500 leading-relaxed">
            Optional. Either way they can go to <span className="font-mono">/register</span> and
            sign up themselves — the class list is what grants access, not the email.
          </span>
        </span>
      </label>

      <div className="sm:max-w-xs">
        <SubmitButton />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.notice && (
        <p className="rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm leading-relaxed">
          {state.notice}
        </p>
      )}
    </form>
  );
}
