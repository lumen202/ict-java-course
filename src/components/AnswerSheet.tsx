"use client";

import { useState } from "react";
import type { AnswerSheetGame } from "@/lib/content/types";
import { useFlowComplete } from "@/components/LessonFlow";
import { GameDoor, GameModal, GameModalHeader, GameModalBody } from "@/components/GameModal";
import { usePasteFlag, useStepShownAt } from "@/lib/submission-integrity";

// An in-site answer sheet: questions one at a time, each answered by filling
// the same labeled boxes (prediction → the SQL run → the real answer). The
// predict-first discipline is the pedagogy; the sheet enforces it by being
// the only place to write. Everything compiles into one turn-in document.
//
// Like every game: door card on the timeline, play in the modal, closing
// pauses with all typing kept.

type Phase = "intro" | "question" | "done";

export function AnswerSheet({
  weekSlug,
  dayNumber,
  game,
}: {
  weekSlug: string;
  dayNumber: number;
  game: AnswerSheetGame;
}) {
  const total = game.items.length;
  const nFields = game.fields.length;
  const [phase, setPhase] = useState<Phase>("intro");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  /** answers[itemIndex][fieldIndex] */
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [saved, setSaved] = useState(false);
  const flowComplete = useFlowComplete();
  const { pasted, onPaste } = usePasteFlag();
  const startedAt = useStepShownAt();

  const item = game.items[idx];
  const current = answers[idx] ?? [];
  const allFilled = game.fields.every((_, fi) => (current[fi] ?? "").trim().length > 0);

  function start() {
    setPhase("question");
    setIdx(0);
    setSaved(false);
    setOpen(true);
  }

  function setField(fi: number, value: string) {
    setAnswers((a) => {
      const row = [...(a[idx] ?? [])];
      row[fi] = value;
      return { ...a, [idx]: row };
    });
  }

  function next() {
    if (idx + 1 >= total) {
      finish();
    } else {
      setIdx(idx + 1);
    }
  }

  function finish() {
    setPhase("done");
    flowComplete(game.id);
    const doc = game.items
      .map((it, qi) => {
        const lines = game.fields
          .map((label, fi) => `  ${label}: ${(answers[qi]?.[fi] ?? "").trim() || "—"}`)
          .join("\n");
        return `${qi + 1}. ${it.question}\n${lines}`;
      })
      .join("\n\n");
    const content = `${game.title} — completed all ${total} questions.\n\n${doc}`;
    fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekSlug, dayNumber, item: game.id, content, pasted, startedAt }),
    })
      .then((r) => setSaved(r.ok))
      .catch(() => setSaved(false));
  }

  const filledCount = game.items.filter((_, qi) =>
    game.fields.every((_, fi) => (answers[qi]?.[fi] ?? "").trim().length > 0),
  ).length;

  return (
    <>
      <GameDoor
        tone="sky"
        emoji="📝"
        title={game.title}
        intro={game.intro}
        meta={`${total} questions · ${nFields} boxes each · turns in automatically as one sheet`}
        status={
          phase === "question" && !open
            ? `⏸ Paused at question ${idx + 1}/${total} — ${filledCount} fully answered so far.`
            : phase === "done"
              ? `🏆 Sheet complete — all ${total} questions answered.${saved ? " ✓ Turned in." : ""}`
              : null
        }
        buttonLabel={
          phase === "question"
            ? "▶ Continue the sheet"
            : phase === "done"
              ? "Review my answers"
              : "▶ Open the answer sheet"
        }
        onEnter={() => {
          if (phase === "intro") start();
          else {
            if (phase === "done") setPhase("question");
            setOpen(true);
          }
        }}
      />

      <GameModal open={open} onClose={() => setOpen(false)} label={game.title}>
        <GameModalHeader
          title={game.title}
          right={phase === "question" ? `Question ${idx + 1}/${total}` : undefined}
        />
        <GameModalBody>
          {phase === "question" && item && (
            <div>
              {/* Question picker — a sheet is revisitable, not a corridor. */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {game.items.map((_, qi) => {
                  const done = game.fields.every(
                    (_, fi) => (answers[qi]?.[fi] ?? "").trim().length > 0,
                  );
                  return (
                    <button
                      key={qi}
                      type="button"
                      onClick={() => setIdx(qi)}
                      aria-current={qi === idx ? "step" : undefined}
                      className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold transition-colors ${
                        qi === idx
                          ? "bg-sky-600 text-white"
                          : done
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-zinc-900/5 text-zinc-500 hover:bg-zinc-900/10 dark:bg-white/10 dark:hover:bg-white/20"
                      }`}
                    >
                      {qi + 1}
                    </button>
                  );
                })}
              </div>

              <p className="text-sm font-semibold leading-relaxed">
                {idx + 1}. {item.question}
              </p>
              {item.note && (
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">💡 {item.note}</p>
              )}

              <div className="mt-3 space-y-3">
                {game.fields.map((label, fi) => (
                  <div key={fi}>
                    <label
                      htmlFor={`sheet-${game.id}-${idx}-${fi}`}
                      className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
                    >
                      {label}
                    </label>
                    <textarea
                      id={`sheet-${game.id}-${idx}-${fi}`}
                      value={current[fi] ?? ""}
                      onChange={(e) => setField(fi, e.target.value)}
                      onPaste={onPaste}
                      rows={fi === 0 ? 1 : 2}
                      maxLength={2000}
                      spellCheck={false}
                      autoCapitalize="off"
                      className="input mt-1 font-mono text-xs leading-relaxed"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-zinc-500">
                  {filledCount}/{total} fully answered
                </p>
                <button
                  type="button"
                  onClick={next}
                  disabled={!allFilled}
                  className="btn-primary"
                  title={allFilled ? undefined : "Fill every box first — the prediction counts too"}
                >
                  {idx + 1 >= total
                    ? filledCount === total
                      ? "Turn in the sheet 🏁"
                      : "Finish the sheet 🏁"
                    : "Next question →"}
                </button>
              </div>
              {!allFilled && (
                <p className="mt-2 text-right text-xs text-zinc-500">
                  Every box, every time — writing the prediction BEFORE you run is
                  the whole game.
                </p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="text-center">
              <p className="text-6xl" aria-hidden="true">
                🏆
              </p>
              <p className="mt-3 text-base font-semibold">
                {total} questions — predicted, run, and answered.
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Look back at the ones where your prediction and the real answer
                disagreed — those are the ones teaching you something.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={() => setOpen(false)} className="btn-primary">
                  Back to the lesson
                </button>
                <button type="button" onClick={() => setPhase("question")} className="btn-ghost">
                  Review my answers
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-500" aria-live="polite">
                {saved
                  ? "✓ Sheet turned in — finishing again updates it."
                  : "Sheet will be turned in automatically when saving succeeds."}
              </p>
            </div>
          )}
        </GameModalBody>
      </GameModal>
    </>
  );
}
