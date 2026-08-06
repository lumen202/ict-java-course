"use client";

import { useId, useState } from "react";

// Password input with a show/hide toggle. Used by the sign-in and set-password
// forms so both behave identically. Typos in an invisible field are the most
// common reason a login "doesn't work", so this is worth the few lines.
export function PasswordField({
  name,
  label,
  hint,
  minLength,
  autoComplete = "current-password",
}: {
  name: string;
  label: string;
  hint?: string;
  minLength?: number;
  autoComplete?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className="input pr-16"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
