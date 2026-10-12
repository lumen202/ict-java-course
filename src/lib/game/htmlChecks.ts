import type { HtmlCheck } from "@/lib/content/types";

// Judges a student's page by what the browser BUILT from it, never by its
// spelling — the html-sandbox counterpart of the SQL console's judge-by-effect.
// `<H1>`, `<h1 class="x">` and an <h1> the parser had to close for them all
// count as an <h1>, because to the browser they are one.
//
// Runs against the preview iframe's live document, so the selectors match the
// same tree the student is looking at, and `css` checks read the styles the
// browser actually computed (a rule that lost the cascade doesn't count).

/**
 * The first check the page fails, or null when it passes them all. `logs` is
 * what the page's script printed to the console, and `source` the student's
 * HTML as written, before any script ran (both script games only).
 */
export function firstFailure(
  doc: Document,
  checks: HtmlCheck[],
  logs: string[] = [],
  source: Document = doc,
): HtmlCheck | null {
  for (const check of checks) {
    if (!passes(check.source ? source : doc, check, logs)) return check;
  }
  return null;
}

function passes(doc: Document, check: HtmlCheck, logs: string[]): boolean {
  if (check.log !== undefined) {
    const want = squash(check.log);
    return logs.some((line) => squash(line).includes(want));
  }
  if (check.selector === undefined) {
    console.error("html-sandbox: a check with neither selector nor log");
    return false;
  }
  let matches: Element[];
  try {
    matches = Array.from(doc.querySelectorAll(check.selector));
  } catch {
    // An authoring bug, not a student one — fail loudly in the console and
    // never let a broken selector clear a task.
    console.error(`html-sandbox: invalid selector "${check.selector}"`);
    return false;
  }

  if (check.exact !== undefined) {
    if (matches.length !== check.exact) return false;
    // exact: 0 is "none of these may exist" — nothing left to inspect.
    if (check.exact === 0) return true;
  } else if (matches.length < (check.min ?? 1)) {
    return false;
  }

  let candidates = matches;
  if (check.text !== undefined) {
    const want = squash(check.text);
    candidates = candidates.filter((el) => squash(el.textContent ?? "").includes(want));
  }
  if (check.textNot !== undefined) {
    const unwanted = squash(check.textNot);
    candidates = candidates.filter((el) => !squash(el.textContent ?? "").includes(unwanted));
  }
  if (check.attr) {
    const { name, value } = check.attr;
    candidates = candidates.filter((el) => {
      const got = el.getAttribute(name);
      return got !== null && (value === undefined || got.trim() === value);
    });
  }
  if (check.css) {
    const { property, value } = check.css;
    const want = computedFor(doc, property, value);
    const view = doc.defaultView;
    candidates = candidates.filter(
      (el) => !!view && view.getComputedStyle(el).getPropertyValue(property) === want,
    );
  }
  if (check.cssNot) {
    const { property, value } = check.cssNot;
    const unwanted = computedFor(doc, property, value);
    const view = doc.defaultView;
    candidates = candidates.filter(
      (el) => !!view && view.getComputedStyle(el).getPropertyValue(property) !== unwanted,
    );
  }
  return candidates.length > 0;
}

/** Lowercased, whitespace collapsed — how a reader sees text, not how it was typed. */
function squash(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * What the browser turns `value` into for `property` — so "red", "#f00" and
 * "rgb(255, 0, 0)" compare equal. Measured on a throwaway element in the same
 * document, so units and colour formats match the student's elements exactly.
 */
function computedFor(doc: Document, property: string, value: string): string {
  const view = doc.defaultView;
  if (!view || !doc.body) return value;
  const probe = doc.createElement("div");
  probe.style.setProperty(property, value);
  doc.body.appendChild(probe);
  const out = view.getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return out;
}
