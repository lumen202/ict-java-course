"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { startDemo, type DemoState } from "@/app/demo/actions";

// The way in for anyone who isn't in the class — a recruiter, a colleague, the
// teacher showing a parent what the course looks like. Building the classroom
// takes a few seconds (five accounts and their seeded work), so the pending
// state has to say what's happening rather than just spin.

function StartButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 disabled:opacity-60"
    >
      {pending ? "Building your demo classroom…" : "🚀 Explore the demo"}
    </button>
  );
}

export function DemoButton() {
  const [state, formAction] = useActionState(startDemo, {} as DemoState);

  return (
    <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
      <form action={formAction}>
        <StartButton />
      </form>
      <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
        No sign-up. You get a private classroom of your own — play the SQL
        games as a student, then switch to the teacher side to release a day and
        read the turned-in work. It deletes itself when you leave.
      </p>
      {state.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </div>
  );
}
