import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { buildSandboxPage, RUN_CSP, wireScript } from "@/lib/game/sandboxPage";

// The page a script checkpoint runs is assembled from strings, and the harness
// inside it is JavaScript living in a template literal — invisible to tsc and
// to lint. These pin the assembly; the runtime behaviour (deferred data:
// scripts, error line numbers, submit events in a sandbox) was verified in
// Chrome, see the header of sandboxPage.ts.

const base = {
  html: "<!DOCTYPE html>\n<html><head><script src=\"order.js\" defer></script></head><body><p id=\"t\"></p></body></html>",
  script: "document.getElementById('t').textContent = 'hi';",
  scriptFile: "order.js",
  htmlFile: "order.html",
  nonce: "n1",
};

function harnessSource(page: string): string {
  const m = /<script data-sandbox-harness>([\s\S]*?)<\/script>/.exec(page);
  assert.ok(m, "no harness in the page");
  return m[1];
}

describe("wireScript", () => {
  test("points the student's own tag at the code, keeping its other attributes", () => {
    const out = wireScript('<script src="order.js" defer></script>', "order.js", "let a = 1;");
    assert.match(out, /^<script src="data:text\/javascript;charset=utf-8,let%20a%20%3D%201%3B" data-sandbox-src="order.js" defer>/);
  });

  test("accepts single quotes, no quotes and ./", () => {
    for (const tag of ["<script src='order.js'>", "<script src=order.js>", '<script src="./order.js">', '<SCRIPT SRC="order.js">']) {
      assert.match(wireScript(tag, "order.js", "x"), /data-sandbox-src="order.js"/, tag);
    }
  });

  test("leaves a different file, a slash path, or a longer name alone", () => {
    for (const tag of ['<script src="menu.js">', '<script src="/order.js">', '<script src="order.jsx">', '<script src="myorder.js">']) {
      assert.equal(wireScript(tag, "order.js", "x"), tag, tag);
    }
  });

  test("a page with no tag for the file runs none of it", () => {
    const html = "<p>no scripts here</p>";
    assert.equal(wireScript(html, "order.js", "alert(1)"), html);
  });

  test("code with quotes and </script> cannot break out of the attribute", () => {
    const out = wireScript('<script src="order.js"></script>', "order.js", 'x = "</script><b>";');
    assert.ok(!out.includes("</script><b>"), out);
    assert.equal((out.match(/"/g) ?? []).length, 4);
  });
});

describe("buildSandboxPage", () => {
  test("the harness is valid JavaScript", () => {
    const src = harnessSource(buildSandboxPage({ ...base, actions: [{ action: "click", target: "#go" }] }));
    assert.doesNotThrow(() => new Function(src));
  });

  test("with the canteen API, the harness (fake included) is still valid JavaScript", () => {
    const src = harnessSource(buildSandboxPage({ ...base, api: "canteen" }));
    assert.ok(src.includes("function canteenApi"));
    assert.doesNotThrow(() => new Function(src));
    assert.ok(!harnessSource(buildSandboxPage(base)).includes("function canteenApi"));
  });

  test("the page carries the run CSP, and the harness removes its own tag (the nonce can't be read from the DOM)", () => {
    const page = buildSandboxPage(base);
    assert.ok(page.includes(`<meta http-equiv="Content-Security-Policy" content="${RUN_CSP}">`));
    assert.match(harnessSource(page), /document\.currentScript/);
  });

  test("the harness reports a missing option and a missing submit button by name", () => {
    const src = harnessSource(buildSandboxPage({ ...base, actions: [{ action: "submit", target: "#f" }] }));
    assert.ok(src.includes('reason: "submit"') && src.includes('reason: "option"'));
  });

  test("the harness goes after the doctype, on the same line", () => {
    const page = buildSandboxPage(base);
    assert.ok(page.startsWith("<!DOCTYPE html><script data-sandbox-harness>"), page.slice(0, 60));
    // Same number of lines as the student's page: inline-script line numbers stay true.
    assert.equal(page.split("\n").length, base.html.split("\n").length);
  });

  test("without a doctype the harness comes first", () => {
    const page = buildSandboxPage({ ...base, html: "<p id=\"t\"></p>" });
    assert.ok(page.startsWith("<script data-sandbox-harness>"));
  });

  test("config text cannot close the harness's script tag", () => {
    const page = buildSandboxPage({ ...base, files: { "x.json": '"</script><img src=x onerror=alert(1)>"' } });
    assert.equal(page.match(/<\/script>/g)?.length, 2, "only the harness's and the student's closing tags");
    assert.doesNotThrow(() => new Function(harnessSource(page)));
  });

  test("a $ in the config survives (String.replace patterns are not applied)", () => {
    const page = buildSandboxPage({ ...base, files: { "p.json": '{"price":"$&$1"}' } });
    assert.ok(harnessSource(page).includes("$&$1"));
  });

  test("the stylesheet is appended, and judge mode carries the actions", () => {
    const page = buildSandboxPage({ ...base, css: "h1 { color: red; }", actions: [{ action: "type", target: "#qty", value: "3" }] });
    assert.ok(page.includes("<style>\nh1 { color: red; }\n</style>"));
    assert.ok(page.includes('"judge":true'));
    assert.ok(page.includes('"target":"#qty"'));
    assert.ok(buildSandboxPage(base).includes('"judge":false'));
  });
});
