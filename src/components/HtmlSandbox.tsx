"use client";

import { useEffect, useRef, useState } from "react";
import type { HtmlCheck, HtmlSandboxGame, SandboxAction } from "@/lib/content/types";
import { useTurnIn } from "@/lib/game/useTurnIn";
import { firstFailure } from "@/lib/game/htmlChecks";
import { buildSandboxPage, SNAPSHOT_CSP, type SandboxLevel, type SandboxMessage } from "@/lib/game/sandboxPage";
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
// SCRIPT (`game.script` set): a JavaScript editor, and the page actually runs
// — but never in the frame described above. It runs in its own sandbox with no
// access to this site, built by lib/game/sandboxPage.ts (read its header for
// why). The preview re-renders on ▶ Run rather than on every keystroke, so a
// half-typed loop can't run, and a console under it shows what the script
// printed and any error with its line. Checking reloads the page fresh, lets
// the harness do the task's `actions` (type, choose, click), and judges the
// snapshot it sends back with the same checks, in a script-less frame.
//
// STUCK EXIT (BUG-015): after ASSIST_AFTER failed checks the task's snippet can
// be revealed — shown to type, never inserted, so clearing still runs through
// the student's own page and the same checks.

type Phase = "intro" | "task" | "cleared" | "done";

const ASSIST_AFTER = 4;
/** Wait this long after the last keystroke before re-rendering the preview. */
const PREVIEW_DELAY_MS = 400;
/** A script check that hasn't reported back by now is treated as stuck. */
const JUDGE_TIMEOUT_MS = 5000;
/** Console lines kept under the preview. */
const MAX_CONSOLE_LINES = 200;

function describeAction(a: SandboxAction): string {
  if (a.action === "click") return `click ${a.target}`;
  if (a.action === "submit") return `press the submit button of ${a.target}`;
  if (a.action === "choose") return `choose value ${a.value} in ${a.target}`;
  return `type ${a.value} into ${a.target}`;
}

/** Identifies the editors' text a run was built from — to tell when the preview is stale. */
function runKey(from: { code: string; css: string; js: string; files: Record<string, string> }): string {
  return JSON.stringify([from.code, from.css, from.js, from.files]);
}

function newNonce(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
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
  const hasJs = game.script !== undefined;
  const fileName = game.fileName ?? "index.html";
  const scriptFile = game.scriptFile ?? "script.js";
  const [code, setCode] = useState(game.starter);
  const [css, setCss] = useState(game.stylesheet ?? "");
  const [js, setJs] = useState(game.script ?? "");
  const [files, setFiles] = useState<Record<string, string>>(game.files ?? {});
  const fileNames = Object.keys(game.files ?? {});
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
  // Script mode: what the running frame shows, the editors' text it was built
  // from, the console, and the judge's snapshot of the page after the actions.
  const [runDoc, setRunDoc] = useState("");
  const [ranFrom, setRanFrom] = useState<string | null>(null);
  const [consoleLines, setConsoleLines] = useState<{ level: SandboxLevel; text: string }[]>([]);
  const [snapshot, setSnapshot] = useState<{ html: string; logs: string[]; error?: string } | null>(null);
  const [judging, setJudging] = useState(false);
  const nonceRef = useRef("");
  const judgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Results are only accepted while a check is running. The page's own script
  // shares the frame with the harness, so a forged result is possible in
  // principle; this at least means one can't arrive when nobody pressed Check.
  const judgingRef = useRef(false);
  // A plain ▶ Run whose page never reports DOMContentLoaded (a loop that never
  // ends at the top of the script) is torn down, so it stops using the CPU.
  const readyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Debounced live preview (HTML/CSS only — a script page runs on ▶ Run).
  useEffect(() => {
    if (hasJs || source === previewCode) return;
    const t = setTimeout(() => setPreviewCode(source), PREVIEW_DELAY_MS);
    return () => clearTimeout(t);
  }, [hasJs, source, previewCode]);

  // Messages from the script frame. Only the CURRENT run's frame counts: the
  // nonce changes on every run, so a slow message from a replaced page is dropped.
  useEffect(() => {
    if (!hasJs) return;
    function onMessage(e: MessageEvent) {
      if (e.source !== frameRef.current?.contentWindow) return;
      const msg = e.data as SandboxMessage | undefined;
      if (!msg || typeof msg !== "object" || msg.nonce !== nonceRef.current) return;
      if (msg.type === "sandbox-ready") {
        if (readyTimer.current) clearTimeout(readyTimer.current);
        readyTimer.current = null;
      } else if (msg.type === "sandbox-log") {
        if (typeof msg.text !== "string") return;
        setConsoleLines((lines) => [...lines, { level: msg.level, text: msg.text }].slice(-MAX_CONSOLE_LINES));
      } else if (msg.type === "sandbox-missing") {
        if (!judgingRef.current || typeof msg.target !== "string") return;
        endJudging();
        const a = task.actions?.[msg.index];
        const id = /^#([\w-]+)$/.exec(msg.target)?.[1];
        if (msg.reason === "option" && a && a.action === "choose") {
          miss({
            message: `Your drop-down ${msg.target} has no <option value="${a.value}">. Give it one option per snack, each with its snack_id as the value, like <option value="2">Turon</option>.`,
          });
        } else if (msg.reason === "submit") {
          miss({
            message: `Your form ${msg.target} has no submit button. Add <button type="submit">Place order</button> inside the <form>, before </form>.`,
          });
        } else {
          miss({
            message:
              `The checker needs your page to have ${msg.target}${a ? ` (to ${describeAction(a)})` : ""}, but nothing on the page matches it.` +
              (id ? ` Check the id in your HTML: #${id} here means id="${id}" there.` : ""),
          });
        }
      } else if (msg.type === "sandbox-result") {
        if (!judgingRef.current || typeof msg.html !== "string" || !Array.isArray(msg.logs) || !Array.isArray(msg.errors)) return;
        endJudging();
        const logs = msg.logs.filter((l): l is string => typeof l === "string");
        const error = typeof msg.errors[0] === "string" ? msg.errors[0] : undefined;
        // The snapshot is same-origin with this site: stop it requesting the
        // student's relative URLs from here (with their cookie).
        const html = msg.html.replace(/^<!DOCTYPE html>/i, (d) => `${d}<meta http-equiv="Content-Security-Policy" content="${SNAPSHOT_CSP}">`);
        setSnapshot({ html, logs, error });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  });

  useEffect(
    () => () => {
      if (judgeTimer.current) clearTimeout(judgeTimer.current);
      if (readyTimer.current) clearTimeout(readyTimer.current);
    },
    [],
  );

  /** Script mode: (re)load the page fresh — to try it, or with `actions` to judge it. */
  function runPage(actions?: SandboxAction[], from = { code, css, js, files }) {
    nonceRef.current = newNonce();
    setConsoleLines([]);
    setSnapshot(null);
    setRanFrom(runKey(from));
    setRunDoc(
      buildSandboxPage({
        html: from.code,
        css: hasCss ? from.css : undefined,
        script: from.js,
        scriptFile,
        htmlFile: fileName,
        files: from.files,
        api: game.api,
        nonce: nonceRef.current,
        actions,
      }),
    );
    if (readyTimer.current) clearTimeout(readyTimer.current);
    if (actions) {
      setJudging(true);
      judgingRef.current = true;
      if (judgeTimer.current) clearTimeout(judgeTimer.current);
      judgeTimer.current = setTimeout(() => {
        nonceRef.current = newNonce(); // a late answer from this run no longer counts
        judgeTimer.current = null;
        judgingRef.current = false;
        setJudging(false);
        setRunDoc(""); // tear the page down, so a loop that never ends stops running
        miss({
          message:
            "Your page never finished being checked. Usually that means a loop that never ends, or the page reloaded itself. Fix your script, press ▶ Run to see the page again, then check again.",
        });
      }, JUDGE_TIMEOUT_MS);
    } else {
      readyTimer.current = setTimeout(() => {
        readyTimer.current = null;
        nonceRef.current = newNonce();
        setRunDoc("");
        setConsoleLines((lines) => [
          ...lines,
          {
            level: "error",
            text: "Your page didn't finish loading within 5 seconds, so it was stopped. Usually that means a loop that never ends near the top of your script. Fix it and press ▶ Run.",
          },
        ]);
      }, JUDGE_TIMEOUT_MS);
    }
  }

  /** Stop any check in progress, so its late answer (or time-out) can't land later as a miss. */
  function cancelRun() {
    endJudging();
    if (readyTimer.current) clearTimeout(readyTimer.current);
    readyTimer.current = null;
    nonceRef.current = newNonce();
  }

  function endJudging() {
    if (judgeTimer.current) clearTimeout(judgeTimer.current);
    judgeTimer.current = null;
    judgingRef.current = false;
    setJudging(false);
  }

  // The checks run even when the script hit an error: a failing check usually
  // says something more specific ("your script tag is in <head>") than the
  // error it caused, so its message leads and the error rides along. An error
  // on a page that passes every check still fails the task — a script that
  // stops halfway is broken even if this checkpoint didn't need the rest.
  function onSnapshotLoad(e: React.SyntheticEvent<HTMLIFrameElement>) {
    const doc = e.currentTarget.contentDocument;
    if (!doc || !snapshot) return;
    const { logs, error } = snapshot;
    setSnapshot(null);
    if (phase !== "task") return;
    // The student's HTML as written: DOMParser runs no script and loads nothing.
    const source = new DOMParser().parseFromString(code, "text/html");
    const failed = firstFailure(doc, task.checks, logs, source);
    if (failed && error) {
      miss({ message: `${failed.message} (The console also shows: ${error})` });
    } else if (failed) {
      miss(failed);
    } else if (error) {
      miss({
        message: error.startsWith("Uncaught")
          ? `Your script stopped on an error: ${error}. The console under the preview shows it too — fix that line first.`
          : error,
      });
    } else {
      judge(doc, logs, source);
    }
  }

  function miss(failed: HtmlCheck) {
    setFailure(failed);
    setMisses((n) => n + 1);
  }

  function start() {
    setPhase("task");
    setIdx(0);
    const fresh = hasCss ? `${game.starter}\n<style>\n${game.stylesheet}\n</style>` : game.starter;
    setCode(game.starter);
    setCss(game.stylesheet ?? "");
    setJs(game.script ?? "");
    setFiles(game.files ?? {});
    setPreviewCode(fresh);
    setLoadedCode(null);
    setFailure(null);
    setMisses(0);
    setRevealed(false);
    setFirstTry(0);
    setAssisted(0);
    if (hasJs) {
      endJudging();
      runPage(undefined, { code: game.starter, css: game.stylesheet ?? "", js: game.script ?? "", files: game.files ?? {} });
    }
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
    if (hasJs) {
      if (!judging) runPage(task.actions ?? []);
      return;
    }
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

  function judge(doc: Document, logs: string[] = [], source?: Document) {
    const failed = firstFailure(doc, task.checks, logs, source);
    if (failed) {
      miss(failed);
      return;
    }
    setFailure(null);
    if (misses === 0) setFirstTry((n) => n + 1);
    setPhase("cleared");
  }

  function next() {
    setFailure(null);
    setMisses(0);
    setRevealed(false);
    if (idx + 1 >= total) {
      setPhase("done");
      const pasted =
        `--- ${fileName} ---\n${code}` +
        (hasCss ? `\n\n--- style.css ---\n${css}` : "") +
        (hasJs ? `\n\n--- ${scriptFile} ---\n${js}` : "") +
        fileNames.map((name) => `\n\n--- ${name} ---\n${files[name]}`).join("");
      const clipped =
        pasted.length > MAX_CODE_IN_TURN_IN
          ? `${pasted.slice(0, MAX_CODE_IN_TURN_IN)}\n…trimmed: the files were ${pasted.length} characters`
          : pasted;
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
        onEnter={() => {
          if (!playing) {
            start();
            return;
          }
          // The preview frame remounts when the modal reopens; run it fresh
          // (new nonce, empty console) rather than replaying the old run.
          if (hasJs) runPage();
          setOpen(true);
        }}
      />

      <GameModal
        open={open}
        onClose={() => {
          if (hasJs) cancelRun();
          setOpen(false);
        }}
        label={game.title}
      >
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
                {hasJs && task.actions && task.actions.length > 0 && (
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    When you check, the checker loads your page fresh, then:{" "}
                    {task.actions.map((a, i) => (
                      <span key={i}>
                        {i > 0 && " → "}
                        <code className="font-mono">{describeAction(a)}</code>
                      </span>
                    ))}
                  </p>
                )}
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
                          setJs(game.script ?? "");
                          setFiles(game.files ?? {});
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
                      rows={hasCss || hasJs ? 9 : 16}
                      spellCheck={false}
                      autoCapitalize="off"
                      aria-label="HTML editor"
                      className={`block w-full flex-1 resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-emerald-300 focus:outline-none ${hasCss || hasJs ? "min-h-[10rem]" : "min-h-[18rem]"}`}
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
                  {hasJs && (
                    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-inner">
                      <div className="border-b border-zinc-800 px-3 py-1.5">
                        <p className="font-mono text-[11px] text-zinc-400">{scriptFile}</p>
                      </div>
                      <textarea
                        value={js}
                        onChange={(e) => setJs(e.target.value)}
                        onPaste={onPaste}
                        onKeyDown={checkOnCtrlEnter}
                        rows={9}
                        spellCheck={false}
                        autoCapitalize="off"
                        aria-label="JavaScript editor"
                        className="block min-h-[10rem] w-full resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-amber-200 focus:outline-none"
                      />
                    </div>
                  )}
                  {hasJs &&
                    fileNames.map((name) => (
                      <div key={name} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-inner">
                        <div className="border-b border-zinc-800 px-3 py-1.5">
                          <p className="font-mono text-[11px] text-zinc-400">{name}</p>
                        </div>
                        <textarea
                          value={files[name] ?? ""}
                          onChange={(e) => setFiles((f) => ({ ...f, [name]: e.target.value }))}
                          onPaste={onPaste}
                          onKeyDown={checkOnCtrlEnter}
                          rows={6}
                          spellCheck={false}
                          autoCapitalize="off"
                          aria-label={`${name} editor`}
                          className="block min-h-[7rem] w-full resize-y bg-transparent p-3 font-mono text-xs leading-relaxed text-violet-200 focus:outline-none"
                        />
                      </div>
                    ))}
                </div>

                {/* Live preview */}
                {hasJs ? (
                  <div className="flex min-w-0 flex-col gap-3">
                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white">
                      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-3 py-1.5">
                        <p className="font-mono text-[11px] text-zinc-500">
                          {judging
                            ? "preview · the checker is using your page…"
                            : ranFrom !== runKey({ code, css, js, files })
                              ? "preview · you've changed the code — press ▶ Run"
                              : "preview · running your page"}
                        </p>
                        <button
                          type="button"
                          onClick={() => runPage()}
                          disabled={judging}
                          className="rounded-md bg-zinc-800 px-2.5 py-0.5 font-mono text-[11px] font-bold text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
                        >
                          ▶ Run
                        </button>
                      </div>
                      <iframe
                        ref={frameRef}
                        title="Preview of your page"
                        sandbox="allow-scripts allow-forms"
                        srcDoc={runDoc}
                        className="block min-h-[16rem] w-full flex-1 bg-white"
                      />
                    </div>
                    <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                      <div className="border-b border-zinc-800 px-3 py-1.5">
                        <p className="font-mono text-[11px] text-zinc-400">console — what your script printed</p>
                      </div>
                      <div className="max-h-40 min-h-[4rem] overflow-y-auto p-2 font-mono text-xs leading-relaxed" aria-live="polite">
                        {consoleLines.length === 0 ? (
                          <p className="text-zinc-600">(nothing printed yet)</p>
                        ) : (
                          consoleLines.map((l, i) => (
                            <p
                              key={i}
                              className={`whitespace-pre-wrap break-words ${
                                l.level === "error" ? "text-red-400" : l.level === "warn" ? "text-amber-300" : "text-zinc-200"
                              }`}
                            >
                              {l.level === "error" ? "✖ " : l.level === "warn" ? "⚠ " : "› "}
                              {l.text}
                            </p>
                          ))
                        )}
                      </div>
                    </div>
                    {/* The judge's view: the snapshot the harness sent, in a frame where
                        nothing runs and the checks can read the document. */}
                    {snapshot && (
                      <iframe
                        title="Snapshot being checked"
                        aria-hidden="true"
                        tabIndex={-1}
                        sandbox="allow-same-origin"
                        srcDoc={snapshot.html}
                        onLoad={onSnapshotLoad}
                        style={{ position: "fixed", left: -10000, top: 0, width: 1024, height: 768 }}
                      />
                    )}
                  </div>
                ) : (
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
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-zinc-500">Ctrl+Enter checks too</p>
                <button
                  type="button"
                  onClick={check}
                  disabled={phase !== "task" || judging}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                >
                  {judging ? "Checking…" : "✔ Check my page"}
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
