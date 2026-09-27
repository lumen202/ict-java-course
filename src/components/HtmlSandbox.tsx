"use client";

import { useEffect, useRef, useState } from "react";
import type { HtmlCheck, HtmlSandboxGame } from "@/lib/content/types";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { firstFailure } from "@/lib/game/htmlChecks";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";

// The web weeks' checkpoint: an HTML editor beside a live preview, where each
// task clears when the page the browser built contains what it asks for
// (lib/game/htmlChecks.ts). In a project week the student mostly PASTES their
// own file from VS Code here — the page is their project, and this is the one
// place a platform with no teacher in the room can say "that's right" or
// "your table still has no header row".
//
// One page across all tasks, like a real file: the text is never cleared
// between tasks, and closing the modal pauses (the code is kept).
//
// The preview is an iframe with sandbox="allow-same-origin" and nothing else:
// no scripts, no form submission, no popups, no top navigation. Same-origin is
// what lets the checks read the document and its computed styles; without
// allow-scripts nothing the student writes ever executes.
//
// STYLESHEET (`game.stylesheet` set): a second editor, style.css, beside
// index.html. The preview can't fetch a linked file — a srcdoc document has no
// folder of its own, so <link href="style.css"> resolves against this site and
// finds nothing — so the stylesheet's text is appended to the page as a
// <style> block instead. Checks still see the student's real <link> tag, and
// `css` checks read the styles the browser computed from their rules.
//
// STUCK EXIT (BUG-015): after ASSIST_AFTER failed checks the task's snippet can
// be revealed — shown to type, never inserted, so clearing still runs through
// the student's own page and the same checks.

type Phase = "intro" | "task" | "cleared" | "done";

const ASSIST_AFTER = 4;
/** Wait this long after the last keystroke before re-rendering the preview. */
const PREVIEW_DELAY_MS = 400;
/** Turn-ins cap at 20,000 characters (api/submissions); leave room for the summary. */
const MAX_CODE_IN_TURN_IN = 15000;

export function HtmlSandbox({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: HtmlSandboxGame;
}) {
  const total = game.tasks.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const hasCss = game.stylesheet !== undefined;
  const fileName = game.fileName ?? "index.html";
  const [code, setCode] = useState(game.starter);
  const [css, setCss] = useState(game.stylesheet ?? "");
  // The document the preview renders: the page, plus the stylesheet's rules.
  const source = hasCss ? `${code}\n<style>\n${css}\n</style>` : code;
  // What the iframe is showing / has finished loading. Checks only ever run
  // against a loaded preview of the CURRENT source, never a stale one.
  const [previewCode, setPreviewCode] = useState(source);
  const [loadedCode, setLoadedCode] = useState<string | null>(null);
  const [pendingCheck, setPendingCheck] = useState(false);
  const [failure, setFailure] = useState<HtmlCheck | null>(null);
  const [misses, setMisses] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [assisted, setAssisted] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  // The verdict renders under an editor and preview that fill a lab monitor
  // (1366×768), so it lands below the fold and a click on Check looked like it
  // did nothing (seen 2026-09-27). Bring it into view on every verdict.
  const verdictRef = useRef<HTMLDivElement>(null);
  const { submit, saved, onPaste } = useTurnIn({ weekSlug, dayNumber, item: game.id });

  const task = game.tasks[idx];
  const playing = phase === "task" || phase === "cleared";

  useEffect(() => {
    if (failure || phase === "cleared") {
      verdictRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [failure, misses, phase]);

  // Debounced live preview.
  useEffect(() => {
    if (source === previewCode) return;
    const t = setTimeout(() => setPreviewCode(source), PREVIEW_DELAY_MS);
    return () => clearTimeout(t);
  }, [source, previewCode]);

  function start() {
    setPhase("task");
    setIdx(0);
    const fresh = hasCss ? `${game.starter}\n<style>\n${game.stylesheet}\n</style>` : game.starter;
    setCode(game.starter);
    setCss(game.stylesheet ?? "");
    setPreviewCode(fresh);
    setLoadedCode(null);
    setFailure(null);
    setMisses(0);
    setRevealed(false);
    setFirstTry(0);
    setAssisted(0);
    setOpen(true);
  }

  function onFrameLoad() {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    // Links would navigate the preview away from the student's page; keep it put.
    doc.addEventListener("click", (e) => {
      if ((e.target as Element | null)?.closest?.("a")) e.preventDefault();
    });
    setLoadedCode(previewCode);
    if (pendingCheck && previewCode === source) {
      setPendingCheck(false);
      judge(doc);
    }
  }

  function check() {
    if (phase !== "task") return;
    const doc = frameRef.current?.contentDocument;
    if (doc && loadedCode === source) {
      judge(doc);
    } else {
      // Render the current source first; onFrameLoad runs the check.
      setPendingCheck(true);
      setPreviewCode(source);
    }
  }

  /** Ctrl+Enter (Cmd+Enter on a Mac) checks from either editor. */
  function checkOnCtrlEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      check();
    }
  }

  function judge(doc: Document) {
    const failed = firstFailure(doc, task.checks);
    setFailure(failed);
    if (failed) {
      setMisses((n) => n + 1);
      return;
    }
    if (misses === 0) setFirstTry((n) => n + 1);
    setPhase("cleared");
  }

  function next() {
    setFailure(null);
    setMisses(0);
    setRevealed(false);
    if (idx + 1 >= total) {
      setPhase("done");
      const files = hasCss
        ? `--- ${fileName} ---\n${code}\n\n--- style.css ---\n${css}`
        : `--- ${fileName} ---\n${code}`;
      const clipped =
        files.length > MAX_CODE_IN_TURN_IN
          ? `${files.slice(0, MAX_CODE_IN_TURN_IN)}\n…trimmed: the files were ${files.length} characters`
          : files;
      const summary = `${game.title} — passed all ${total} checkpoints, ${firstTry}/${total} on the first check.${assisted > 0 ? ` Revealed the snippet on ${assisted}.` : ""}`;
      void submit({ content: `${summary}\n\n${clipped}` });
    } else {
      setIdx(idx + 1);
      setPhase("task");
    }
  }

  return (
    <>
      <GameDoor
        tone="teal"
        emoji="🧪"
        title={game.title}
        intro={game.intro}
        meta={`${total} checkpoints · your page renders live and is checked automatically · turns in automatically`}
        status={
          playing && !open
            ? `⏸ Paused at checkpoint ${idx + 1}/${total} — your code is kept.`
            : phase === "done"
              ? `🏆 Completed — ${firstTry}/${total} on the first check.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={playing ? "▶ Continue" : phase === "done" ? "Start again" : "▶ Open the checker"}
        onEnter={() => (playing ? setOpen(true) : start())}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader
          title={game.title}
          right={playing ? `Checkpoint ${idx + 1}/${total}` : undefined}
        />
        <GameModalBody>
          {playing && task && (
            <div>
              <div className="rounded-xl border border-teal-200/80 dark:border-teal-900 bg-teal-50/60 dark:bg-zinc-900/40 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                  Checkpoint
                </p>
                <p className="mt-1 text-sm font-medium leading-relaxed">{task.goal}</p>
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {/* Editor(s) */}
                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-inner">
                    <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
                      <p className="font-mono text-[11px] text-zinc-400">{fileName}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCode(game.starter);
                          setCss(game.stylesheet ?? "");
                        }}
                        className="font-mono text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
                        title="Put the editor back to how this checker started"
                      >
                        ↺ reset
                      </button>
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onPaste={onPaste}
                      onKeyDown={checkOnCtrlEnter}
                      rows={hasCss ? 9 : 16}
                      spellCheck={false}
                      autoCapitalize="off"
                      aria-label="HTML editor"
                      className={`block w-full flex-1 resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none ${hasCss ? "min-h-[10rem]" : "min-h-[18rem]"}`}
                    />
                  </div>
                  {hasCss && (
                    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-inner">
                      <div className="border-b border-zinc-800 px-3 py-1.5">
                        <p className="font-mono text-[11px] text-zinc-400">style.css</p>
                      </div>
                      <textarea
                        value={css}
                        onChange={(e) => setCss(e.target.value)}
                        onPaste={onPaste}
                        onKeyDown={checkOnCtrlEnter}
                        rows={7}
                        spellCheck={false}
                        autoCapitalize="off"
                        aria-label="CSS editor"
                        className="block min-h-[8rem] w-full resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-sky-300 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Live preview */}
                <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white">
                  <div className="border-b border-zinc-200 bg-zinc-100 px-3 py-1.5">
                    <p className="font-mono text-[11px] text-zinc-500">
                      preview {source !== previewCode ? "· updating…" : "· live"}
                    </p>
                  </div>
                  <iframe
                    ref={frameRef}
                    title="Preview of your page"
                    sandbox="allow-same-origin"
                    srcDoc={previewCode}
                    onLoad={onFrameLoad}
                    className="block min-h-[18rem] w-full flex-1 bg-white"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">Ctrl+Enter checks too</p>
                <button
                  type="button"
                  onClick={check}
                  disabled={phase !== "task"}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                >
                  ✔ Check my page
                </button>
              </div>

              {phase === "task" && failure && (
                <div ref={verdictRef} className="mt-3 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-zinc-900/40 p-3">
                  <p className="text-sm font-semibold">Not yet:</p>
                  <p className="mt-1 text-sm leading-relaxed">{failure.message}</p>
                  {misses >= 2 && task.hint && (
                    <p className="mt-2 text-sm leading-relaxed">
                      💡 <span className="font-medium">Hint:</span> {task.hint}
                    </p>
                  )}
                  {misses >= ASSIST_AFTER && !revealed && (
                    <div className="mt-3 border-t border-teal-200 pt-3 dark:border-teal-900">
                      <button
                        type="button"
                        onClick={() => {
                          setRevealed(true);
                          setAssisted((n) => n + 1);
                        }}
                        className="rounded-lg border border-teal-300 bg-white/80 px-3 py-1.5 text-sm font-medium transition-colors hover:border-teal-500 hover:bg-teal-50 dark:border-teal-800 dark:bg-zinc-900/60 dark:hover:bg-teal-950/30"
                      >
                        🔑 Stuck? Show me what to type
                      </button>
                    </div>
                  )}
                  {revealed && (
                    <div className="mt-3 border-t border-teal-200 pt-3 dark:border-teal-900">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Type this into your page yourself (and into your real file in VS Code), then check again:
                      </p>
                      <pre className="mt-1.5 overflow-x-auto rounded-lg bg-zinc-950 p-2.5 font-mono text-xs text-emerald-300">
                        {task.solution}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {phase === "cleared" && (
                <div ref={verdictRef} className="mt-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/30 p-3">
                  <p className="text-sm font-semibold">✅ Your page has it.</p>
                  {task.explain && <p className="mt-1 text-sm leading-relaxed">{task.explain}</p>}
                  <div className="mt-3 text-center">
                    <button type="button" onClick={next} className="btn-primary">
                      {idx + 1 >= total ? "Finish 🏁" : "Next checkpoint →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="text-center">
              <p className="text-6xl" aria-hidden="true">
                🏆
              </p>
              <p className="mt-3 text-base font-semibold">
                All {total} checkpoints passed — on your own page.
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {firstTry}/{total} on the first check. Make sure the file in VS Code has every change
                you made here — that file is the one that counts.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={start} className="btn-primary">
                  Start again
                </button>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                  Back to the lesson
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-500" aria-live="polite">
                {saved
                  ? "✓ Result and your page turned in — replaying updates it."
                  : "Result will be turned in automatically when saving succeeds."}
              </p>
            </div>
          )}
        </GameModalBody>
      </GameModal>
    </>
  );
}
