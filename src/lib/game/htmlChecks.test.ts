import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { firstFailure } from "@/lib/game/htmlChecks";
import type { HtmlCheck } from "@/lib/content/types";

// firstFailure decides whether a student's page clears a checkpoint, so its
// counting and filtering rules are pinned here. Node has no DOM, so this runs
// on a tiny fake document: selectors resolve from a lookup table (selector
// PARSING is the browser's job and is exercised against real pages in Chrome —
// see docs/agent/codebase-map/course-content.md), and computed styles come
// from each element's own style map, with a small colour table standing in
// for the browser's normalisation ("red" → "rgb(255, 0, 0)").

type FakeEl = {
  textContent: string;
  attrs: Record<string, string>;
  style: Record<string, string>;
  getAttribute(name: string): string | null;
  remove(): void;
};

const NORMALISE: Record<string, string> = {
  red: "rgb(255, 0, 0)",
  "#f00": "rgb(255, 0, 0)",
  black: "rgb(0, 0, 0)",
  transparent: "rgba(0, 0, 0, 0)",
};

function el(text = "", attrs: Record<string, string> = {}, style: Record<string, string> = {}): FakeEl {
  return {
    textContent: text,
    attrs,
    style,
    getAttribute: (name) => (name in attrs ? attrs[name] : null),
    remove: () => {},
  };
}

function doc(bySelector: Record<string, FakeEl[]>): Document {
  const probeStyle: Record<string, string> = {};
  const fake = {
    querySelectorAll(selector: string) {
      if (selector === "[[bad") throw new SyntaxError("invalid selector");
      return bySelector[selector] ?? [];
    },
    body: { appendChild: () => {} },
    createElement: () => ({
      style: { setProperty: (p: string, v: string) => (probeStyle[p] = NORMALISE[v] ?? v) },
      remove: () => {},
      isProbe: true,
    }),
    defaultView: {
      getComputedStyle: (e: FakeEl & { isProbe?: boolean }) => ({
        getPropertyValue: (p: string) => (e.isProbe ? probeStyle[p] : (e.style[p] ?? "")),
      }),
    },
  };
  return fake as unknown as Document;
}

const check = (c: Partial<HtmlCheck> & { selector: string }): HtmlCheck => ({ message: c.selector, ...c });

describe("firstFailure", () => {
  test("no checks means nothing can fail", () => {
    assert.equal(firstFailure(doc({}), []), null);
  });

  test("reports the FIRST failing check, in authored order", () => {
    const a = check({ selector: "h1" });
    const b = check({ selector: "h2" });
    assert.equal(firstFailure(doc({}), [a, b]), a);
    assert.equal(firstFailure(doc({ h1: [el()] }), [a, b]), b);
  });

  test("min defaults to 1 and counts matches", () => {
    const three = check({ selector: "li", min: 3 });
    assert.equal(firstFailure(doc({ li: [el(), el()] }), [three]), three);
    assert.equal(firstFailure(doc({ li: [el(), el(), el()] }), [three]), null);
  });

  test("exact is an exact count, and exact: 0 means none may exist", () => {
    const one = check({ selector: "h1", exact: 1 });
    assert.equal(firstFailure(doc({ h1: [el(), el()] }), [one]), one);
    assert.equal(firstFailure(doc({ h1: [el()] }), [one]), null);

    const none = check({ selector: "a[href^='/']", exact: 0 });
    assert.equal(firstFailure(doc({}), [none]), null);
    assert.equal(firstFailure(doc({ "a[href^='/']": [el()] }), [none]), none);
  });

  test("text matches case-insensitively with whitespace collapsed, on ANY match", () => {
    const c = check({ selector: "h1", text: "Aling Nena" });
    assert.equal(firstFailure(doc({ h1: [el("Menu"), el("  ALING\n   nena's Canteen ")] }), [c]), null);
    assert.equal(firstFailure(doc({ h1: [el("Menu")] }), [c]), c);
  });

  test("attr requires the attribute, and its trimmed value when given", () => {
    const has = check({ selector: "img", attr: { name: "alt" } });
    const val = check({ selector: "input", attr: { name: "min", value: "1" } });
    assert.equal(firstFailure(doc({ img: [el("", { alt: "" })] }), [has]), null);
    assert.equal(firstFailure(doc({ img: [el()] }), [has]), has);
    assert.equal(firstFailure(doc({ input: [el("", { min: " 1 " })] }), [val]), null);
    assert.equal(firstFailure(doc({ input: [el("", { min: "0" })] }), [val]), val);
  });

  test("css compares browser-normalised values, so spellings of one colour are equal", () => {
    const red = check({ selector: "p", css: { property: "color", value: "red" } });
    assert.equal(firstFailure(doc({ p: [el("", {}, { color: "rgb(255, 0, 0)" })] }), [red]), null);
    const hex = check({ selector: "p", css: { property: "color", value: "#f00" } });
    assert.equal(firstFailure(doc({ p: [el("", {}, { color: "rgb(255, 0, 0)" })] }), [hex]), null);
    assert.equal(firstFailure(doc({ p: [el("", {}, { color: "rgb(0, 0, 0)" })] }), [red]), red);
  });

  test("cssNot passes only when the computed value differs from the default", () => {
    const styled = check({ selector: "body", cssNot: { property: "background-color", value: "transparent" } });
    assert.equal(firstFailure(doc({ body: [el("", {}, { "background-color": "rgba(0, 0, 0, 0)" })] }), [styled]), styled);
    assert.equal(firstFailure(doc({ body: [el("", {}, { "background-color": "rgb(255, 251, 235)" })] }), [styled]), null);
  });

  test("an invalid selector fails the check rather than clearing it", () => {
    const bad = check({ selector: "[[bad" });
    const original = console.error;
    console.error = () => {};
    try {
      assert.equal(firstFailure(doc({}), [bad]), bad);
    } finally {
      console.error = original;
    }
  });

  test("textNot passes only on a match whose text lacks the phrase", () => {
    const interpolated = check({ selector: "#special", textNot: "${" });
    assert.equal(firstFailure(doc({ "#special": [el("Today's special: ${special}")] }), [interpolated]), interpolated);
    assert.equal(firstFailure(doc({ "#special": [el("Today's special: Turon — ₱12")] }), [interpolated]), null);
  });

  test("a log check reads what the script printed, ignoring case and spacing", () => {
    const logged = { log: "Total: 36", message: "nothing logged" } as HtmlCheck;
    assert.equal(firstFailure(doc({}), [logged]), logged, "no logs at all");
    assert.equal(firstFailure(doc({}), [logged], ["total: 35"]), logged);
    assert.equal(firstFailure(doc({}), [logged], ["hello", "TOTAL:   36 pesos"]), null);
  });

  test("a source check reads the HTML as written, not the page after the script", () => {
    const written = check({ selector: "#special:empty", source: true });
    const afterScript = doc({ "#special:empty": [] });
    assert.equal(firstFailure(afterScript, [written], [], doc({ "#special:empty": [el()] })), null);
    assert.equal(firstFailure(afterScript, [written], [], doc({})), written);
  });

  test("a check with neither selector nor log fails rather than clearing", () => {
    const empty = { message: "authoring bug" } as HtmlCheck;
    const original = console.error;
    console.error = () => {};
    try {
      assert.equal(firstFailure(doc({ h1: [el()] }), [empty]), empty);
    } finally {
      console.error = original;
    }
  });
});
