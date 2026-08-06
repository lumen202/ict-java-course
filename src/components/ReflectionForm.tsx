"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "sending" | "done" | "error";

// Weekly reflection form — the teacher's main signal for who is stuck on what.
// Only rendered for signed-in students; the name comes from their account, so
// there's no name field to fill in (or to fake).
export function ReflectionForm({
  weekSlug,
  studentName,
}: {
  weekSlug: string;
  studentName: string;
}) {
  const [hardest, setHardest] = useState("");
  const [want, setWant] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekSlug, hardestPart: hardest, wantExplained: want }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong — try again.");
        return;
      }
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Couldn't reach the server — check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-5">
        <p className="font-medium">Reflection sent — thank you, {studentName}! 🎉</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Being honest about what was hard is how the next week gets better for everyone.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sending as <span className="font-medium text-zinc-900 dark:text-zinc-100">{studentName}</span>.
      </p>
      <div>
        <label htmlFor="rf-hardest" className="block text-sm font-medium mb-1">
          What was the hardest part this week? (2–3 sentences)
        </label>
        <textarea
          id="rf-hardest"
          value={hardest}
          onChange={(e) => setHardest(e.target.value)}
          required
          maxLength={2000}
          rows={3}
          className={inputCls}
          placeholder="Be honest — 'nothing was hard' is only a good answer if it's true."
        />
      </div>
      <div>
        <label htmlFor="rf-want" className="block text-sm font-medium mb-1">
          What would you like explained again? (optional)
        </label>
        <textarea
          id="rf-want"
          value={want}
          onChange={(e) => setWant(e.target.value)}
          maxLength={2000}
          rows={2}
          className={inputCls}
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {message}{" "}
          {message.includes("sign in") && (
            <Link href="/login" className="underline">
              Sign in
            </Link>
          )}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium"
      >
        {status === "sending" ? "Sending…" : "Send reflection"}
      </button>
    </form>
  );
}
