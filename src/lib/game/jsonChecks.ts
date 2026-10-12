import type { JsonCheck } from "@/lib/content/types";

// Judges JSON a student copied from their own running app — the json-check
// counterpart of htmlChecks.ts. Their Java can't run inside this site, but
// what it answered can be judged: shape first, then values.
//
// Pure (no DOM), so `npm test` covers it directly.

export type ParseResult = { ok: true; value: unknown } | { ok: false; message: string };

/**
 * Parses what the student pasted. Lenient about the wrapping a browser adds
 * when you select everything on a JSON page — Chrome's "Pretty-print" checkbox
 * label, stray whitespace — by parsing from the first [ or { to the last ] or }.
 * And about a console copy: selecting in DevTools easily takes the typed
 * fetch(…) line and "Promise {<pending>}" along, so when the whole paste
 * doesn't parse, the LAST line that is JSON on its own is used — the answer
 * is what the console printed last. Strict about the JSON itself: half a
 * response is a mistake worth naming.
 */
export function parsePasted(text: string): ParseResult {
  const whole = parseWhole(text);
  if (whole.ok) return whole;
  const lines = text.split(/\r?\n/).reverse();
  for (const line of lines) {
    const start = line.search(/[[{]/);
    const end = Math.max(line.lastIndexOf("]"), line.lastIndexOf("}"));
    if (start === -1 || end < start) continue;
    try {
      return { ok: true, value: JSON.parse(line.slice(start, end + 1)) };
    } catch {
      // not this line
    }
  }
  if (/\bfetch\(/.test(text)) {
    return {
      ok: false,
      message:
        "That's the console line you typed, not your app's answer. Look under it in the console: select the line your app printed (it starts with {), copy it with Ctrl+C, and paste that here.",
    };
  }
  return whole;
}

function parseWhole(text: string): ParseResult {
  const trimmed = text.trim();
  if (trimmed === "") {
    return { ok: false, message: "The box is empty. Open the address, select everything the browser shows (Ctrl+A), copy it (Ctrl+C) and paste it here." };
  }
  const start = trimmed.search(/[[{]/);
  const end = Math.max(trimmed.lastIndexOf("]"), trimmed.lastIndexOf("}"));
  if (start !== -1 && end < start) {
    return { ok: false, message: HALF };
  }
  if (start === -1) {
    if (/whitelabel/i.test(trimmed)) {
      return { ok: false, message: "That's a Whitelabel Error Page, not JSON. Read its status: 404 means there's no endpoint at that address yet, and 500 means your Java threw an error (read the terminal)." };
    }
    return { ok: false, message: "That isn't JSON: JSON starts with [ or {. Open the address, select everything (Ctrl+A), copy (Ctrl+C) and paste it all here." };
  }
  try {
    return { ok: true, value: JSON.parse(trimmed.slice(start, end + 1)) };
  } catch {
    return { ok: false, message: HALF };
  }
}

const HALF =
  "That's only part of the JSON, or it was changed after copying. From a page: select everything (Ctrl+A), copy (Ctrl+C) and paste it here without editing. From the console: run the line again (it copies the answer for you), then click here and press Ctrl+V.";

/** The first check `value` fails, or null when it passes them all. */
export function firstJsonFailure(value: unknown, checks: JsonCheck[]): JsonCheck | null {
  for (const check of checks) {
    if (!passes(value, check)) return check;
  }
  return null;
}

const MISSING = Symbol("missing");

function at(value: unknown, path: string | undefined): unknown {
  if (!path) return value;
  let cur: unknown = value;
  for (const part of path.split(".")) {
    if (Array.isArray(cur) && /^\d+$/.test(part)) {
      cur = Number(part) < cur.length ? cur[Number(part)] : MISSING;
    } else if (isObject(cur) && Object.prototype.hasOwnProperty.call(cur, part)) {
      cur = cur[part];
    } else {
      return MISSING;
    }
  }
  return cur;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function typeOf(v: unknown): string {
  return Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
}

/** The items a per-item check applies to: an array's items, or an object on its own. */
function items(v: unknown): unknown[] | null {
  if (Array.isArray(v)) return v;
  if (isObject(v)) return [v];
  return null;
}

function passes(root: unknown, check: JsonCheck): boolean {
  const v = at(root, check.path);
  if (v === MISSING) return false;
  if (check.is !== undefined && typeOf(v) !== check.is) return false;
  if (check.min !== undefined && !(Array.isArray(v) && v.length >= check.min)) return false;
  if (check.exact !== undefined && !(Array.isArray(v) && v.length === check.exact)) return false;
  if (check.equals !== undefined && v !== check.equals) return false;
  if (check.contains !== undefined) {
    if (typeof v !== "string" || !v.toLowerCase().includes(check.contains.toLowerCase())) return false;
  }
  if (check.keys !== undefined) {
    const list = items(v);
    if (!list || list.length === 0) return false;
    if (!list.every((it) => isObject(it) && check.keys!.every((k) => Object.prototype.hasOwnProperty.call(it, k)))) {
      return false;
    }
  }
  if (check.types !== undefined) {
    const list = items(v);
    if (!list || list.length === 0) return false;
    const wanted = Object.entries(check.types);
    if (!list.every((it) => isObject(it) && wanted.every(([k, t]) => typeOf(it[k]) === t))) return false;
  }
  if (check.some !== undefined) {
    if (!Array.isArray(v)) return false;
    const wanted = Object.entries(check.some);
    if (!v.some((it) => isObject(it) && wanted.every(([k, want]) => it[k] === want))) return false;
  }
  if (check.everyAtMost !== undefined) {
    const { key, max } = check.everyAtMost;
    if (!Array.isArray(v)) return false;
    if (!v.every((it) => isObject(it) && typeof it[key] === "number" && (it[key] as number) <= max)) return false;
  }
  return true;
}
