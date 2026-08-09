"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { startDemo, type DemoState } from "./actions";

// The way in for anyone who isn't in the class — a recruiter, a colleague, the
// teacher showing a parent what the course looks like. Building the classroom
// takes a few seconds (five accounts and their seeded work), so the pending
// state has to say what's happening rather than just spin.
//
// This lives on /demo, which is deliberately unlinked from anywhere students
// go: the sign-in page must not offer the class a way to wander into a sandbox
// and think it's their course.

function StartButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full py-2.5 text-base"
    >
      {pending ? "Building your demo classroom…" : "🚀 Explore the demo"}
    </button>
  );
}

export function StartDemoForm() {
  const [state, formAction] = useActionState(startDemo, {} as DemoState);

  return (
    <>
      <form action={formAction}>
        <StartButton />
      </form>
      {state.error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </>
  );
}
