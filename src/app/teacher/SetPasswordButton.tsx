"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { setStudentPassword, type SetPasswordState } from "./actions";

const inputCls =
  "w-40 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

// No 0/O, 1/l/I — the teacher reads this out or writes it down, and the
// student types it back in.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 10) {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

function SaveButton({ hasAccount }: { hasAccount: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {pending ? "Saving…" : hasAccount ? "Set" : "Create account"}
    </button>
  );
}

// Set a student's password so the teacher can hand it over in person. For a
// student who hasn't registered yet this creates their account. The password is
// shown in clear on purpose — the teacher has to read it to send it — and is
// only ever held in this component's state, never echoed back by the server.
export function SetPasswordButton({ email, hasAccount }: { email: string; hasAccount: boolean }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState("");
  const [copied, setCopied] = useState(false);
  const [state, formAction] = useActionState(
    async (prev: SetPasswordState, formData: FormData) => {
      const result = await setStudentPassword(prev, formData);
      if (result.notice) {
        setSent(String(formData.get("password")));
        setCopied(false);
      }
      return result;
    },
    {} as SetPasswordState,
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setPassword(generatePassword());
          setOpen(true);
        }}
        className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
      >
        Set password
      </button>
    );
  }

  const close = () => {
    setOpen(false);
    setSent("");
    setPassword("");
  };

  if (sent) {
    const handover = `Email: ${email}\nPassword: ${sent}`;
    return (
      <div className="inline-flex max-w-xs flex-col items-end gap-1.5 text-left">
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          {state.notice} Send them:
        </p>
        <code className="whitespace-pre-wrap break-all rounded border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-zinc-900 px-2 py-1 text-xs">
          {handover}
        </code>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(handover);
              setCopied(true);
            }}
            className="rounded-md border border-emerald-400 dark:border-emerald-700 px-2.5 py-1 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button type="button" onClick={close} className="text-xs text-zinc-500 hover:underline">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1.5">
      <input type="hidden" name="email" value={email} />
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <input
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          maxLength={72}
          required
          autoComplete="off"
          spellCheck={false}
          aria-label={`New password for ${email}`}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setPassword(generatePassword())}
          className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          New
        </button>
        <SaveButton hasAccount={hasAccount} />
        <button type="button" onClick={close} className="text-xs text-zinc-500 hover:underline">
          Cancel
        </button>
      </div>
      {!hasAccount && (
        <p className="text-xs text-zinc-500">They haven&apos;t registered — this creates their account.</p>
      )}
      {state.error && <p className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
