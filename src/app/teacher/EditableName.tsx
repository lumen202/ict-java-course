"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateStudentName } from "./actions";

const inputCls =
  "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

// Inline name editor for a class-list row. Names are optional when adding a
// student, and a student's own typing can be wrong, so the teacher needs a way
// to correct what everyone sees.
export function EditableName({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  const [editing, setEditing] = useState(false);
  const display = [firstName, lastName].filter(Boolean).join(" ");

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        {display ? (
          <span>{display}</span>
        ) : (
          <span className="text-zinc-400">—</span>
        )}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          {display ? "Edit" : "Add name"}
        </button>
      </div>
    );
  }

  return (
    <form
      action={async (formData: FormData) => {
        await updateStudentName(formData);
        setEditing(false);
      }}
      className="flex flex-wrap items-center gap-1.5"
    >
      <input type="hidden" name="email" value={email} />
      <input
        name="firstName"
        defaultValue={firstName}
        placeholder="First"
        maxLength={60}
        className={`${inputCls} w-24`}
        aria-label="First name"
      />
      <input
        name="lastName"
        defaultValue={lastName}
        placeholder="Last"
        maxLength={60}
        className={`${inputCls} w-24`}
        aria-label="Last name"
      />
      <SaveButton />
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-xs text-zinc-500 hover:underline"
      >
        Cancel
      </button>
    </form>
  );
}
