"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// Teacher view — passcode in, reflections out. Deliberately minimal auth (see
// docs/HANDOFF.md → Decisions): the passcode is checked server-side by
// /api/teacher/reflections, which is also the only thing holding the
// service-role key. Nothing sensitive is decided in this file.

type Reflection = {
  id: string;
  created_at: string;
  week_slug: string;
  student_name: string;
  hardest_part: string;
  want_explained: string | null;
};

type Status = "idle" | "loading" | "loaded" | "error";

export default function TeacherPage() {
  const [passcode, setPasscode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [weekFilter, setWeekFilter] = useState("all");

  const weekSlugs = useMemo(
    () => [...new Set(reflections.map((r) => r.week_slug))].sort(),
    [reflections],
  );

  const visible = useMemo(
    () => (weekFilter === "all" ? reflections : reflections.filter((r) => r.week_slug === weekFilter)),
    [reflections, weekFilter],
  );

  async function load(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/teacher/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Couldn't load reflections.");
        return;
      }
      setReflections(data.reflections ?? []);
      setStatus("loaded");
    } catch {
      setStatus("error");
      setError("Couldn't reach the server — check your connection and try again.");
    }
  }

  if (status !== "loaded") {
    return (
      <main className="mx-auto max-w-sm px-6 py-20">
        <h1 className="text-2xl font-bold tracking-tight">Teacher view</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Enter the passcode to read student reflections.
        </p>
        <form onSubmit={load} className="mt-6 space-y-3">
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium mb-1">
              Passcode
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium"
          >
            {status === "loading" ? "Checking…" : "Open"}
          </button>
        </form>
        <Link href="/" className="mt-6 inline-block text-sm text-zinc-500 hover:underline">
          ← Back to the course
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← Back to the course
      </Link>

      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student reflections</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {reflections.length} total · newest first
          </p>
        </div>
        {weekSlugs.length > 1 && (
          <div>
            <label htmlFor="week-filter" className="block text-xs font-medium mb-1 text-zinc-500">
              Week
            </label>
            <select
              id="week-filter"
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            >
              <option value="all">All weeks</option>
              {weekSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-sm text-zinc-600 dark:text-zinc-400">
          No reflections yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{r.student_name}</p>
                <p className="text-xs text-zinc-500">
                  {r.week_slug} · {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Hardest part
                </p>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                  {r.hardest_part}
                </p>
              </div>
              {r.want_explained && (
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Wants explained again
                  </p>
                  <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                    {r.want_explained}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
