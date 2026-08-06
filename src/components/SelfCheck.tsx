"use client";

import { useState } from "react";
import type { SelfCheckItem } from "@/lib/content/types";

// Self-check questions with hidden answers. No data is recorded — the point is
// for the student to find out for themselves whether they actually understood.
export function SelfCheck({ items }: { items: SelfCheckItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <SelfCheckRow key={i} index={i + 1} item={item} />
      ))}
    </ol>
  );
}

function SelfCheckRow({ index, item }: { index: number; item: SelfCheckItem }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <li className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <p className="font-medium">
        {index}. {item.question}
      </p>
      {revealed ? (
        <p className="mt-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-sm leading-relaxed">
          {item.answer}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          Try answering out loud first — then show answer
        </button>
      )}
    </li>
  );
}
