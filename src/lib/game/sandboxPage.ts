import type { CanteenSeedOrder, SandboxAction } from "@/lib/content/types";
import { CANTEEN_API_JS } from "@/lib/game/canteenApi";

// Builds the document a SCRIPT checkpoint runs (html-sandbox with `script`).
//
// Why a separate document at all: the HTML/CSS checker reads its preview
// directly, which needs sandbox="allow-same-origin". Letting the student's
// JavaScript run in that frame too would make it same-origin with this site —
// able to read the session and the saved lesson progress, and to lift its own
// sandbox. So a script page runs in a frame with "allow-scripts allow-forms"
// and NO allow-same-origin (an opaque origin: window.origin is "null"), and a
// small harness inside it reports back over postMessage:
//
//   - every console.log/info/warn/error line, and every uncaught error with
//     the file and line it came from — the console under the preview;
//   - when judging: it performs the task's actions (type, choose, click) on
//     the loaded page, waits for the script to react, then sends back a
//     SNAPSHOT of the page — the DOM as the script left it, form values
//     written into attributes. The parent loads that snapshot into the same
//     script-less frame the HTML checker uses and runs the ordinary checks on
//     it, so there is one judge, not two.
//
// The student's own <script src="order.js"> tag is where their code loads,
// with that tag's attributes intact: the code goes in as a data: URL, which
// keeps `defer` meaning what it means and reports errors with real line
// numbers (both verified in Chrome 152, 2026-10-11). A page with no such tag
// runs none of the file — as on their own machine.
//
// A form submit the page didn't cancel is cancelled by the harness and
// reported as an error: on a real page it would load a new page and wipe
// everything the script had just done, which is the bug worth naming. This is
// also why the frame needs allow-forms — without it Chrome never fires the
// submit event at all, so a correct listener would never run.

export type SandboxLevel = "log" | "info" | "warn" | "error";

export type SandboxMessage =
  | { type: "sandbox-ready"; nonce: string }
  | { type: "sandbox-log"; nonce: string; level: SandboxLevel; text: string }
  | { type: "sandbox-result"; nonce: string; html: string; logs: string[]; errors: string[] }
  | { type: "sandbox-missing"; nonce: string; index: number; target: string; reason?: "option" | "submit" };

/**
 * Keeps the running page from loading anything but itself: no images, fonts
 * or stylesheets from the network (a slow one used to hold up the check —
 * the actions waited for `load`), and no requests to this site. Scripts are
 * the harness, the student's inline code and their file wired in as data:.
 */
export const RUN_CSP =
  "default-src 'none'; script-src 'unsafe-inline' data:; style-src 'unsafe-inline'; img-src data:; font-src data:";
/**
 * The snapshot the checks read runs no script at all, but it IS same-origin
 * with this site, so without this its relative URLs (order.js, style.css)
 * would be requested from the course site with the student's cookie.
 */
export const SNAPSHOT_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:";

export type SandboxPageOptions = {
  html: string;
  css?: string;
  script: string;
  scriptFile: string;
  htmlFile: string;
  files?: Record<string, string>;
  /** Serve /api/… from the Week 7 canteen API fake (lib/game/canteenApi.ts). */
  api?: "canteen";
  /** Orders the fake already holds at load (a task's `apiOrders`). Only with `api`. */
  apiOrders?: CanteenSeedOrder[];
  /** Every /api/… fetch rejects, as when the app is off (a task's `apiDown`). Only with `api`. */
  apiDown?: boolean;
  /** Echoed on every message, so a stale frame's messages can be ignored. */
  nonce: string;
  /** Set to judge: perform these, then post a snapshot. Omit for a plain run. */
  actions?: SandboxAction[];
};

export function buildSandboxPage(o: SandboxPageOptions): string {
  let page = o.css !== undefined ? `${o.html}\n<style>\n${o.css}\n</style>` : o.html;
  page = wireScript(page, o.scriptFile, o.script);
  const config = {
    nonce: o.nonce,
    scriptFile: o.scriptFile,
    htmlFile: o.htmlFile,
    files: o.files ?? {},
    api: o.api ?? null,
    apiOrders: o.api ? o.apiOrders ?? [] : [],
    apiDown: !!o.api && !!o.apiDown,
    judge: o.actions !== undefined,
    actions: o.actions ?? [],
  };
  // JSON is valid JS, but "</script>" inside it would end the harness's tag.
  const json = JSON.stringify(config).replace(/</g, "\\u003c");
  const api = o.api === "canteen" ? CANTEEN_API_JS.replace(/\n\s*/g, " ") : "";
  const harness =
    `<script data-sandbox-harness>${HARNESS.replace("__CONFIG__", () => json).replace("__API__", () => api)}</script>` +
    `<meta http-equiv="Content-Security-Policy" content="${RUN_CSP}">`;
  // After the doctype (anything before it would switch the page to quirks
  // mode), and on the same line, so inline-script line numbers stay true.
  const doctype = /^\s*<!doctype[^>]*>/i.exec(page);
  return doctype
    ? doctype[0] + harness + page.slice(doctype[0].length)
    : harness + page;
}

/** Points every <script src="FILE"> tag at the script's text, keeping its other attributes. */
export function wireScript(html: string, file: string, code: string): string {
  const src = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
  const name = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const srcAttr = new RegExp(`(\\ssrc\\s*=\\s*)(["']?)(?:\\./)?${name}\\2(?=[\\s/>]|$)`, "i");
  return html.replace(/<script\b[^>]*>/gi, (tag) =>
    srcAttr.test(tag)
      ? tag.replace(srcAttr, (_m, lead: string) => `${lead}"${src}" data-sandbox-src="${file}"`)
      : tag,
  );
}

// Runs inside the sandboxed page, before anything the student wrote. No line
// comments and every statement ends in a semicolon: it is collapsed onto one
// line below, so the student's inline-script line numbers aren't shifted.
const HARNESS = `
(function () {
  var cfg = __CONFIG__;
  var host = window.parent;
  var me = document.currentScript;
  if (me && me.parentNode) me.parentNode.removeChild(me);
  var logs = [];
  var errors = [];
  var finished = false;
  function post(msg) {
    msg.nonce = cfg.nonce;
    try { host.postMessage(msg, "*"); } catch (e) {}
  }
  document.addEventListener("DOMContentLoaded", function () { post({ type: "sandbox-ready" }); });
  function show(v) {
    if (typeof v === "string") return v;
    if (v === undefined) return "undefined";
    if (typeof v === "function") return "function " + (v.name || "") + "()";
    if (v instanceof Error) return v.name + ": " + v.message;
    if (typeof Element !== "undefined" && v instanceof Element) {
      return "<" + v.tagName.toLowerCase() + (v.id ? " id=\\"" + v.id + "\\"" : "") + ">";
    }
    try {
      var s = JSON.stringify(v);
      return s === undefined ? String(v) : s;
    } catch (e) {
      return String(v);
    }
  }
  ["log", "info", "warn", "error"].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var text = Array.prototype.map.call(arguments, show).join(" ");
      logs.push(text);
      post({ type: "sandbox-log", level: level, text: text });
      return original.apply(console, arguments);
    };
  });
  function fail(text) {
    errors.push(text);
    post({ type: "sandbox-log", level: "error", text: text });
  }
  window.addEventListener("error", function (e) {
    var file = e.filename ? (e.filename.indexOf("data:") === 0 ? cfg.scriptFile : cfg.htmlFile) : "";
    fail((e.message || "Error") + (file ? " (" + file + (e.lineno ? ":" + e.lineno : "") + ")" : ""));
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    fail("Uncaught (in promise) " + (r && r.message ? (r.name ? r.name + ": " : "") + r.message : show(r)));
  });
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (a) e.preventDefault();
  });
  window.addEventListener("submit", function (e) {
    if (e.defaultPrevented) return;
    e.preventDefault();
    fail("The form was sent, so a real browser would now load a new page and wipe out everything your script just did. A button that should NOT send the form needs type=\\"button\\". A submit listener needs event.preventDefault() as its first line.");
  });
  __API__
  var apiState = { orders: cfg.apiOrders.slice() };
  function headerOf(headers, wanted) {
    if (!headers) return "";
    if (typeof headers.get === "function") return headers.get(wanted) || "";
    for (var k in headers) if (k.toLowerCase() === wanted.toLowerCase()) return String(headers[k]);
    return "";
  }
  window.fetch = function (input, init) {
    init = init || {};
    var name = String(input && input.url ? input.url : input).replace(/^\\.\\//, "");
    if (cfg.api && /^\\/?api\\//.test(name)) {
      if (cfg.apiDown) {
        console.info("→ " + (init.method || "GET").toUpperCase() + " " + (name.charAt(0) === "/" ? name : "/" + name) + " · no answer");
        return new Promise(function (resolve, reject) {
          setTimeout(function () { reject(new TypeError("Failed to fetch")); }, 20);
        });
      }
      var body = init.body;
      var type = headerOf(init.headers, "Content-Type") || (body != null ? "text/plain;charset=UTF-8" : "");
      var res = canteenApi({ method: init.method, path: name.charAt(0) === "/" ? name : "/" + name, contentType: type, body: body == null ? null : String(body) }, apiState);
      var headers = { "Content-Type": "application/json" };
      if (res.allow) headers.Allow = res.allow;
      console.info("→ " + (init.method || "GET").toUpperCase() + " " + (name.charAt(0) === "/" ? name : "/" + name) + " · " + res.status);
      return new Promise(function (resolve) {
        setTimeout(function () { resolve(new Response(JSON.stringify(res.body), { status: res.status, headers: headers })); }, 20);
      });
    }
    var found = Object.prototype.hasOwnProperty.call(cfg.files, name);
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve(found
          ? new Response(cfg.files[name], { status: 200, headers: { "Content-Type": /\\.json$/i.test(name) ? "application/json" : "text/plain" } })
          : new Response(JSON.stringify({ timestamp: new Date().toISOString(), status: 404, error: "Not Found", path: "/" + name }), { status: 404, statusText: "Not Found", headers: { "Content-Type": "application/json" } }));
      }, 20);
    });
  };
  function finish() {
    if (finished) return;
    finished = true;
    var fields = document.querySelectorAll("input, textarea, select");
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.tagName === "SELECT") {
        for (var j = 0; j < f.options.length; j++) {
          if (f.options[j].selected) f.options[j].setAttribute("selected", "");
          else f.options[j].removeAttribute("selected");
        }
      } else if (f.tagName === "TEXTAREA") {
        f.textContent = f.value;
      } else if (f.type === "checkbox" || f.type === "radio") {
        if (f.checked) f.setAttribute("checked", "");
        else f.removeAttribute("checked");
      } else {
        f.setAttribute("value", f.value);
      }
    }
    var wired = document.querySelectorAll("script[data-sandbox-src]");
    for (var k = 0; k < wired.length; k++) {
      wired[k].setAttribute("src", wired[k].getAttribute("data-sandbox-src"));
      wired[k].removeAttribute("data-sandbox-src");
    }
    post({ type: "sandbox-result", html: "<!DOCTYPE html>" + document.documentElement.outerHTML, logs: logs, errors: errors });
  }
  function act(a, i) {
    var el = null;
    try { el = document.querySelector(a.target); } catch (e) {}
    if (!el) {
      finished = true;
      post({ type: "sandbox-missing", index: i, target: a.target });
      return false;
    }
    if (a.action === "submit") {
      var btn = el.querySelector("button:not([type]), button[type=submit i], input[type=submit i]");
      if (!btn) {
        finished = true;
        post({ type: "sandbox-missing", index: i, target: a.target, reason: "submit" });
        return false;
      }
      btn.click();
    } else if (a.action === "click") {
      el.click();
    } else {
      if (a.action === "choose") {
        var has = false;
        for (var o = 0; el.options && o < el.options.length; o++) if (el.options[o].value === a.value) has = true;
        if (!has) {
          finished = true;
          post({ type: "sandbox-missing", index: i, target: a.target, reason: "option" });
          return false;
        }
      }
      if (typeof el.focus === "function") el.focus();
      el.value = a.value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    return true;
  }
  if (cfg.judge) {
    var started = false;
    var begin = function () {
      if (started) return;
      started = true;
      var i = 0;
      var next = function () {
        if (finished) return;
        if (i >= cfg.actions.length) { setTimeout(finish, 150); return; }
        if (act(cfg.actions[i], i)) { i++; setTimeout(next, 80); }
      };
      setTimeout(next, 80);
    };
    window.addEventListener("load", begin);
    document.addEventListener("DOMContentLoaded", function () { setTimeout(begin, 1500); });
  }
})();
`.replace(/\n\s*/g, " ");
