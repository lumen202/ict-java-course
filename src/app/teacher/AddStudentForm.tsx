"use client";

import { useActionState, useRef, useState } from "react";
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
  const [copied, setCopied] = useState(false);
  const [state, formAction] = useActionState(
    async (prev: ClassListState, formData: FormData) => {
      const result = await addStudent(prev, formData);
      if (result.notice) {
        formRef.current?.reset();
        setCopied(false);
      }
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
        <div className="rounded-md border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm leading-relaxed">
          <p>{state.notice}</p>

          {/* When no email went out, the teacher has to hand over the link
              themselves — so give them something to copy, not a bare path. */}
          {state.registerUrl && (
            <div className="mt-3">
              <p className="font-medium">Send them this link to sign up:</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <code className="rounded border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 px-2 py-1 text-xs">
                  {state.registerUrl}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(state.registerUrl!);
                    setCopied(true);
                  }}
                  className="rounded-md border border-emerald-400 dark:border-emerald-700 px-2.5 py-1 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
                <a
                  href={state.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Open it ↗
                </a>
              </div>
              <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                They register with the exact address above — no email needed.
              </p>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
