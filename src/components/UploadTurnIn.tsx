"use client";

import { useState } from "react";
import type { UploadTask } from "@/lib/content/types";
import { useFlowComplete } from "@/components/LessonFlow";
import { createClient } from "@/lib/supabase/client";
import { downscaleImage } from "@/lib/downscale-image";
import { useStepShownAt } from "@/lib/submission-integrity";

// Hand in a file from your own machine — the one step of a day that can't be
// completed inside this page, which is exactly what makes it evidence. See
// `UploadTask` in lib/content/types.ts for why the ask has to be
// session-specific, and supabase/schema.sql's `turn-ins` bucket for the path
// convention the storage policies depend on.
//
// The file goes straight from the browser to Storage rather than through our
// API route: a route body would have to carry the whole thing, and Next caps
// that well below screenshot size by default. The route is then told only
// where the file landed, so the turn-in appears alongside every other one and
// inherits the same teacher view, gating and hand-back.

/** Matches the bucket's own file_size_limit — the server rejects past this too. */
const MAX_BYTES = 2 * 1024 * 1024;

const SQL_EXTENSIONS = [".sql", ".txt"];

type Status = "idle" | "working" | "saved" | "error";

export function UploadTurnIn({
  weekSlug,
  dayNumber,
  task,
  initialFileName,
  turnedInAt,
}: {
  weekSlug: string;
  dayNumber: number;
  task: UploadTask;
  /** Name of the file already handed in, if any — so a revisit shows it. */
  initialFileName: string | null;
  turnedInAt: string | null;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState(initialFileName);
  const flowComplete = useFlowComplete();
  const startedAt = useStepShownAt();

  async function handleFile(file: File) {
    setStatus("working");
    setMessage("");

    try {
      const isImage = file.type.startsWith("image/");
      const looksLikeSql = SQL_EXTENSIONS.some((e) => file.name.toLowerCase().endsWith(e));

      if (!isImage && !looksLikeSql) {
        setStatus("error");
        setMessage("That file type isn't accepted — send a .sql export, or a screenshot.");
        return;
      }

      // Images get shrunk first, so a 6 MB screenshot never becomes a 6 MB
      // object. A .sql dump is text and already tiny, so it goes up as-is —
      // but a huge one is still refused rather than failing at the bucket.
      let body: Blob = file;
      let extension = file.name.toLowerCase().split(".").pop() || "sql";

      if (isImage) {
        const shrunk = await downscaleImage(file);
        body = shrunk.blob;
        extension = shrunk.extension;
      } else if (file.size > MAX_BYTES) {
        setStatus("error");
        setMessage("That file is over 2 MB — export just this week's database, not the whole server.");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        setMessage("Please sign in again — your session expired.");
        return;
      }

      // Deterministic path: re-submitting overwrites instead of piling up
      // copies (the bucket is on a 1 GB free tier). The first segment must be
      // the owner's uuid — every storage policy checks it.
      const path = `${user.id}/${weekSlug}/${dayNumber}/${task.id}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("turn-ins")
        .upload(path, body, { contentType: body.type || "application/octet-stream", upsert: true });

      if (uploadError) {
        setStatus("error");
        setMessage("Couldn't upload that — check your connection and try again.");
        return;
      }

      // Record it as an ordinary turn-in so it shows up with everything else.
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekSlug,
          dayNumber,
          item: task.id,
          content: `${task.title} — uploaded ${file.name}`,
          filePath: path,
          fileName: file.name,
          startedAt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(data.error ?? "Uploaded, but couldn't record it — try again.");
        return;
      }

      setFileName(file.name);
      setStatus("saved");
      flowComplete(task.id);
    } catch {
      setStatus("error");
      setMessage("Couldn't prepare that file — try a different one.");
    }
  }

  const inputId = `upload-${task.id}`;

  return (
    <div className="card-accent p-5">
      <p className="text-base font-semibold">{task.title}</p>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{task.intro}</p>

      <ol className="mt-4 space-y-1.5 text-sm leading-relaxed">
        {task.steps.map((s, i) => (
          <li key={s} className="flex gap-2">
            <span className="shrink-0 font-semibold text-emerald-700 dark:text-emerald-400">
              {i + 1}.
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-xl border border-emerald-300/80 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/30 p-3 text-sm leading-relaxed">
        ✅ <span className="font-medium">Your file must show:</span> {task.proves}
      </p>

      <div className="mt-4">
        <label htmlFor={inputId} className="text-sm font-semibold">
          Your export
        </label>
        <input
          id={inputId}
          type="file"
          accept=".sql,.txt,image/png,image/jpeg,image/webp"
          disabled={status === "working"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Clearing the input lets the same filename be picked again after
            // a failure — otherwise onChange never fires a second time.
            e.target.value = "";
            if (file) void handleFile(file);
          }}
          className="input mt-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-500 disabled:opacity-60"
        />
      </div>

      <div className="mt-3 min-h-5" aria-live="polite">
        {status === "working" && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Uploading…</p>
        )}
        {status === "error" && <p className="text-sm text-red-600 dark:text-red-400">{message}</p>}
        {status !== "working" && status !== "error" && fileName && (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            ✓ Handed in: {fileName}
            {status === "saved" ? " — you can upload again to replace it." : ""}
          </p>
        )}
      </div>

      {task.screenshotFallback && (
        <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
          {task.screenshotFallback}
        </p>
      )}
      {turnedInAt && !fileName && (
        <p className="mt-2 text-xs text-zinc-500">Previously turned in — upload again to replace.</p>
      )}
    </div>
  );
}
