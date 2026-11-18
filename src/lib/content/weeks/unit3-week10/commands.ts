// unit3-week10 — console lines the checkpoints share.
//
// Every `command` ends with `.then(copy)`: the browser console's copy() puts the answer on
// the clipboard (the same rule as Weeks 7 to 9; week10.test.ts enforces it). Every command
// that changes data does it to a row it made (a snack numbered 20000 or more, chosen at
// random) or puts the value back in the same command, so none needs a number the student
// would have to guess and each can be run twice. Kutsinta (snack 90) is only ever taken off
// the menu inside a command that puts it back before it finishes.
//
// A 204 has no body, so no command calls response.json() on a DELETE.

export { NEW_PAGE_FILE, SQL_RUN } from "../unit3-week8/commands";
import {
  EDIT_PAGE_COMMAND,
  SPECIAL_PAGE_COMMAND,
  BOARD_EDIT_COMMAND,
  BOARD_CANCEL_COMMAND,
  PUT_ORDER_ROUNDTRIP,
  SNACK_LIFECYCLE,
  SNACK_WALL,
  KUTSINTA_STAYS,
  CANCEL_ROUNDTRIP,
  consolePut,
  consoleDelete,
} from "../unit3-week9/commands";

export { consolePut, consoleDelete };

const COPY = `.then(t => { console.log(t); return t; }).then(copy)`;
const WAIT = `const wait = ms => new Promise(done => setTimeout(done, ms));`;
const SEND = `const send = (method, path, body) => fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });`;
const GETJ = `const getj = path => fetch(path).then(r => r.json());`;
const RANDOM_ID = `const id = 20000 + Math.floor(Math.random() * 70000);`;

/** Week 9's page commands end with `.then(copy)`; Week 10 wraps them, so it needs the part before. */
const bare = (command: string) => {
  if (!command.endsWith(COPY)) throw new Error("a Week 9 command no longer ends the way Week 10 expects");
  return command.slice(0, -COPY.length);
};

// ---- Day 1: the available flag ------------------------------------------------

/**
 * Adds a snack, takes it off the menu with PUT, and looks at the plain menu and at the snack by its number; puts it back and removes
 * it. `others_unchanged` is true only if every snack that was on the menu before still is, so an UPDATE with no WHERE (which would
 * take them all off) fails it.
 */
export const AVAILABLE_ROUNDTRIP =
  `(() => { ${SEND} ${GETJ} ${RANDOM_ID} const out = {}; let before = []; return getj("/api/snacks").then(list => { before = list; return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 14 }); })` +
  `.then(() => send("PUT", "/api/snacks/" + id + "/available", { available: false }))` +
  `.then(put => { out.put_status = put.status; return put.json(); })` +
  `.then(body => { out.answer_says_false = body.available === false; return Promise.all([getj("/api/snacks"), fetch("/api/snacks/" + id)]); })` +
  `.then(([list, one]) => { out.hidden_from_menu = !list.some(s => s.snack_id === id); out.still_found_by_number = one.status === 200; out.others_unchanged = before.length > 0 && before.every(b => list.some(a => a.snack_id === b.snack_id)); return send("PUT", "/api/snacks/" + id + "/available", { available: true }); })` +
  `.then(() => getj("/api/snacks")).then(list => { out.back_on_menu = list.some(s => s.snack_id === id); return fetch("/api/snacks/" + id, { method: "DELETE" }); })` +
  `.then(del => { out.cleaned_up = del.status === 204; return JSON.stringify(out); }); })()${COPY}`;

/**
 * Adds a snack, takes it off the menu, and asks every path that lists snacks whether it still shows. A path that answers an error
 * (a 500 from a mistyped SELECT) is NOT counted as "hidden": every path must answer 200 with a list (`paths_failing` names the others).
 */
export const AVAILABLE_EVERY_PATH =
  `(() => { ${SEND} ${RANDOM_ID} const out = {}; const paths = ["/api/snacks", "/api/snacks?name=Check", "/api/snacks?sort=price", "/api/snacks?sort=name", "/api/snacks?maxPrice=1000", "/api/find?name=Check " + id];` +
  ` const ask = p => fetch(p).then(r => r.json().then(d => ({ status: r.status, d }), () => ({ status: r.status, d: null })));` +
  ` return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 3 }).then(() => send("PUT", "/api/snacks/" + id + "/available", { available: false }))` +
  `.then(() => Promise.all(paths.map(ask))).then(answers => { out.paths_checked = answers.length; out.paths_failing = paths.filter((p, i) => !(answers[i].status === 200 && Array.isArray(answers[i].d))); out.still_shown_by = paths.filter((p, i) => Array.isArray(answers[i].d) && answers[i].d.some(s => s.snack_id === id)); out.hidden_everywhere = out.paths_failing.length === 0 && out.still_shown_by.length === 0; return fetch("/api/snacks/" + id, { method: "DELETE" }); })` +
  `.then(del => { out.cleaned_up = del.status === 204; return JSON.stringify(out); }); })()${COPY}`;

/** A snack that doesn't exist: GET and PUT answer 404, and nothing on the menu changed. The PUT sends true, so an UPDATE with no WHERE retires nothing and can't wreck a menu (it still answers 200, not 404). */
export const AVAILABLE_MISSING =
  `(() => { ${SEND} const out = {}; let before = ""; return fetch("/api/snacks").then(r => r.text()).then(text => { before = text; return send("PUT", "/api/snacks/99999/available", { available: true }); })` +
  `.then(r => { out.put_status = r.status; return r.json(); }).then(body => { out.put_message = body.message; return fetch("/api/snacks/99999/available"); })` +
  `.then(r => { out.get_status = r.status; return fetch("/api/snacks").then(x => x.text()); }).then(text => { out.nothing_changed = text === before; return JSON.stringify(out); }); })()${COPY}`;

/**
 * A snack that is off the menu cannot be ordered (409); back on the menu it can, and the order is cancelled again. If the first
 * (should-be-refused) order is ACCEPTED, the line cancels that sale too, so a wrong app cannot leave a Check snack that the foreign key
 * keeps from being removed.
 */
export const ORDER_REFUSED =
  `(() => { ${SEND} ${GETJ} ${RANDOM_ID} const out = {}; let salesBefore = 0; let orderId = 0; let strayId = 0; const cancel = n => n ? fetch("/api/orders/" + n, { method: "DELETE" }) : Promise.resolve(); return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 6 })` +
  `.then(() => send("PUT", "/api/snacks/" + id + "/available", { available: false })).then(() => getj("/api/sales")).then(sales => { salesBefore = sales.length; return send("POST", "/api/orders", { snack_id: id, qty: 2 }); })` +
  `.then(r => { out.refused_status = r.status; return r.json(); }).then(body => { out.refused_message = body.message; strayId = body.order_id || 0; return getj("/api/sales"); })` +
  `.then(sales => { out.no_sale_written = sales.length === salesBefore; return cancel(strayId); }).then(() => send("PUT", "/api/snacks/" + id + "/available", { available: true }))` +
  `.then(() => send("POST", "/api/orders", { snack_id: id, qty: 2 })).then(r => { out.after_putting_back_status = r.status; return r.json(); })` +
  `.then(order => { orderId = order.order_id; return cancel(orderId); }).then(() => fetch("/api/snacks/" + id, { method: "DELETE" }))` +
  `.then(del => { out.cleaned_up = del.status === 204; return JSON.stringify(out); }); })()${COPY}`;

/**
 * Takes Kutsinta (which has sales) off the menu and checks the history is untouched AND that the special of a snack that is off the
 * menu is not shown or changed (GET /api/special must not answer Kutsinta; a PUT must change nothing), then puts everything back,
 * whatever happened: the put-back is sent on success and on failure. Does nothing if Kutsinta has no sale or no special.
 */
export const HISTORY_SURVIVES =
  `(() => { ${SEND} ${GETJ} const out = {}; const putBack = () => send("PUT", "/api/snacks/90/available", { available: true }); let priceBefore = 0;` +
  ` return Promise.all([getj("/api/sales"), fetch("/api/special")]).then(([sales, sp]) => { out.has_sales = Array.isArray(sales) && sales.some(s => s.snack_id === 90);` +
  ` return (sp.status === 200 ? sp.json() : Promise.resolve({})).then(special => { out.has_special = special.snack_id === 90; priceBefore = special.special_price; return out.has_sales && out.has_special; }); })` +
  `.then(ready => { if (!ready) { return JSON.stringify(out); }` +
  ` return send("PUT", "/api/snacks/90/available", { available: false }).then(() => Promise.all([getj("/api/snacks"), getj("/api/orders"), getj("/api/sales"), fetch("/api/snacks/90"), fetch("/api/special"), send("PUT", "/api/special", { special_price: 777 })]))` +
  `.then(([menu, orders, sales2, one, sp2, change]) => { out.off_the_menu = Array.isArray(menu) && !menu.some(s => s.snack_id === 90); out.orders_still_show_it = Array.isArray(orders) && orders.some(o => o.snack_id === 90 && o.name === "Kutsinta"); out.sales_still_show_it = Array.isArray(sales2) && sales2.some(s => s.snack_id === 90); out.found_by_number = one.status === 200; out.special_change_refused = change.status === 404;` +
  ` return (sp2.status === 404 ? Promise.resolve(true) : sp2.json().then(b => b.snack_id !== 90)).then(hidden => { out.special_hidden = hidden; return putBack(); }); })` +
  `.then(r => { out.put_back = r.status === 200; return fetch("/api/special"); }).then(r => r.json()).then(now => { out.special_untouched = now.special_price === priceBefore; return out.special_untouched ? 0 : send("PUT", "/api/special", { special_price: priceBefore }); }).then(() => JSON.stringify(out)); })` +
  `.catch(e => putBack().then(() => JSON.stringify({ error: String(e), put_back: true }))); })()${COPY}`;

/** Day 1, Part 2: on edit-snack.html?id=90 the new button takes Kutsinta off the menu and puts it back; it ends on the menu. */
export const EDIT_AVAILABILITY_PAGE_COMMAND =
  `(() => { const button = document.getElementById("availability"); if (!button) { return Promise.resolve(JSON.stringify({ has_button: false })); } ${WAIT} ${SEND}` +
  ` const out = { has_button: true }; const menuHas = () => fetch("/api/snacks").then(r => r.json()).then(list => list.some(s => s.snack_id === 90));` +
  ` return wait(1000).then(() => { out.label_at_start = button.textContent; button.click(); return wait(1500); }).then(() => { out.label_after_click = button.textContent; out.message_on_page = document.getElementById("result").textContent; return menuHas(); })` +
  `.then(has => { out.kutsinta_off_menu = !has; button.click(); return wait(1500); }).then(() => { out.label_after_second_click = button.textContent; return menuHas(); })` +
  `.then(has => { out.kutsinta_back_on_menu = has; return send("PUT", "/api/snacks/90/available", { available: true }); }).then(() => JSON.stringify(out)); })()${COPY}`;

// ---- Day 2: api.js -------------------------------------------------------------

/**
 * Run on a page that loads api.js. Calls apiGet and apiSend directly: a good GET resolves with the data, a DELETE answered 204
 * resolves with null (by status, never by reading JSON), and every refusal rejects with an Error whose message is the app's own sentence.
 */
export const API_HELPER_COMMAND =
  `(() => { if (typeof apiGet !== "function" || typeof apiSend !== "function") { return Promise.resolve(JSON.stringify({ has_helpers: false })); } const out = { has_helpers: true };` +
  ` const attempt = p => p.then(value => ({ ok: true, value }), e => ({ ok: false, is_error: e instanceof Error, message: e && e.message, name: e && e.name }));` +
  ` let orderId = 0; return attempt(apiGet("/api/snacks/90")).then(r => { out.get_ok = r.ok && r.value.name === "Kutsinta"; return attempt(apiSend("POST", "/api/orders", { snack_id: 90, qty: 2 })); })` +
  `.then(r => { out.post_ok = r.ok && r.value.qty === 2; orderId = r.ok ? r.value.order_id : 0; return attempt(apiSend("DELETE", "/api/orders/" + orderId)); })` +
  `.then(r => { out.delete_204_resolves_null = r.ok && r.value === null; out.delete_204_error_name = r.ok ? "" : r.name; return attempt(apiGet("/api/snacks/99999")); })` +
  `.then(r => { out.missing_rejects_with_error = !r.ok && r.is_error === true; out.missing_message = r.ok ? "" : r.message; return attempt(apiSend("POST", "/api/orders", { snack_id: 90, qty: 99 })); })` +
  `.then(r => { out.bad_qty_message = r.ok ? "" : r.message; return attempt(apiSend("DELETE", "/api/orders/99999")); })` +
  `.then(r => { out.delete_missing_message = r.ok ? "" : r.message; return orderId ? fetch("/api/orders/" + orderId).then(x => { out.order_was_cancelled = x.status === 404; return JSON.stringify(out); }) : JSON.stringify(out); }); })()${COPY}`;

/** What a page script file says about fetch: the checks every refactored page shares. */
const SCRIPT_FACTS = (file: string) =>
  `fetch("${file}").then(r => r.text()).then(src => ({ script_has_no_fetch: !/fetch\\(/.test(src), script_uses_api_js: /apiGet\\(|apiSend\\(/.test(src) }))`;
/** The same facts for the HTML: does the page load api.js, and before its own script? */
const HTML_FACTS = (script: string) =>
  `fetch(location.pathname).then(r => r.text()).then(html => ({ loads_api_js_first: html.indexOf('src="api.js"') !== -1 && html.indexOf('src="api.js"') < html.indexOf('src="${script}"') }))`;

/** Wraps a bare page command (which resolves to a JSON string) with the script facts for that page. */
const withScriptFacts = (inner: string, script: string) =>
  `(() => Promise.all([${SCRIPT_FACTS(script)}, ${HTML_FACTS(script)}]).then(([a, b]) => ${inner}.then(text => JSON.stringify({ ...JSON.parse(text), ...a, ...b }))))()${COPY}`;

/** Day 2: Week 9's edit-page check, plus: edit-snack.js has no fetch( left and the page loads api.js first. */
export const EDIT_PAGE_API_COMMAND = withScriptFacts(bare(EDIT_PAGE_COMMAND), "edit-snack.js");
/** Day 2: Week 9's special-page check, plus the same two facts for special.js. */
export const SPECIAL_PAGE_API_COMMAND = withScriptFacts(bare(SPECIAL_PAGE_COMMAND), "special.js");
/** Day 2, Part 2: Week 9's board checks (Change, then Cancel), plus the facts for orders.js. */
export const BOARD_EDIT_API_COMMAND = withScriptFacts(bare(BOARD_EDIT_COMMAND), "orders.js");
export const BOARD_CANCEL_API_COMMAND = withScriptFacts(bare(BOARD_CANCEL_COMMAND), "orders.js");

/** Day 2, Part 2: on add-snack.html the form adds a snack (checked in MySQL), the same number again is refused in the app's words, and the snack is removed. */
export const ADD_PAGE_COMMAND =
  `(() => { const form = document.getElementById("snack-form"); if (!form) { return Promise.resolve(JSON.stringify({ on_add_page: false })); } ${WAIT} ${RANDOM_ID}` +
  ` const result = document.getElementById("result"); const fill = () => { document.getElementById("snack-id").value = id; document.getElementById("snack-name").value = "Check " + id; document.getElementById("snack-price").value = 11; form.requestSubmit(); };` +
  ` return Promise.all([${SCRIPT_FACTS("add-snack.js")}, ${HTML_FACTS("add-snack.js")}]).then(([a, b]) => { const out = { on_add_page: true, ...a, ...b }; fill(); return wait(1200).then(() => { out.first_message = result.textContent; return fetch("/api/snacks/" + id); })` +
  `.then(r => { out.snack_in_mysql = r.status === 200; fill(); return wait(1200); }).then(() => { out.second_message = result.textContent; return fetch("/api/snacks/" + id, { method: "DELETE" }); })` +
  `.then(del => { out.cleaned_up = del.status === 204; return JSON.stringify(out); }); }); })()${COPY}`;

/**
 * Day 2, Part 2: on order.html the form places an order through the page (the receipt names it, then the line cancels it), and an order
 * for a snack that is off the menu is refused with the app's sentence on the receipt (the snack is made, retired and its option is added to
 * the drop-down after the page loaded, then the snack is removed). Plus: order.js has no fetch( left and api.js loads first.
 */
export const ORDER_PAGE_API_COMMAND =
  `(() => { const form = document.getElementById("order-form"); if (!form) { return Promise.resolve(JSON.stringify({ on_order_page: false })); } ${WAIT} ${SEND} ${RANDOM_ID}` +
  ` const select = document.getElementById("snack"); const qty = document.getElementById("qty"); const receipt = () => document.getElementById("receipt-text").textContent;` +
  ` const order = (snackId, count) => { select.append(new Option("test", snackId)); select.value = String(snackId); qty.value = count; form.requestSubmit(); return wait(1300).then(receipt); };` +
  ` return Promise.all([${SCRIPT_FACTS("order.js")}, ${HTML_FACTS("order.js")}]).then(([a, b]) => { const out = { on_order_page: true, ...a, ...b }; return wait(800).then(() => order(90, 2)).then(text => { out.receipt = text; const m = text.match(/^Order (\\d+): 2 × Kutsinta = ₱/); out.receipt_names_the_order = !!m; return m ? fetch("/api/orders/" + m[1], { method: "DELETE" }) : null; })` +
  `.then(del => { out.order_cancelled = !!del && del.status === 204; return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 6 }); }).then(() => send("PUT", "/api/snacks/" + id + "/available", { available: false })).then(() => order(id, 1))` +
  `.then(text => { out.refused_receipt = text; return fetch("/api/snacks/" + id, { method: "DELETE" }); }).then(del => { out.cleaned_up = del.status === 204; return JSON.stringify(out); }); }); })()${COPY}`;

// ---- Day 3: the staff list -------------------------------------------------------

/**
 * Adds a snack and takes it off the menu. The staff list must still show it, with available false; the public menu must not; the
 * public menu's JSON must still be exactly snack_id, name, price; and /api/snacks/{id} must still work. Cleans up.
 */
export const STAFF_LIST_ROUNDTRIP =
  `(() => { ${SEND} ${GETJ} ${RANDOM_ID} const out = {}; return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 5 }).then(() => send("PUT", "/api/snacks/" + id + "/available", { available: false }))` +
  `.then(() => Promise.all([fetch("/api/staff/snacks"), getj("/api/snacks"), fetch("/api/snacks/" + id)])).then(([staffResponse, menu, one]) => { out.staff_status = staffResponse.status; out.one_by_number_status = one.status; out.menu_keys_unchanged = menu.length > 0 && menu.every(s => Object.keys(s).join(",") === "snack_id,name,price"); out.hidden_from_menu = !menu.some(s => s.snack_id === id); return staffResponse.json().then(staff => { const mine = Array.isArray(staff) ? staff.find(s => s.snack_id === id) : undefined; out.staff_shows_it = !!mine; out.staff_says_unavailable = !!mine && mine.available === false; out.staff_keys = mine ? Object.keys(mine).join(",") : ""; return fetch("/api/snacks/" + id, { method: "DELETE" }); }); })` +
  `.then(del => { out.cleaned_up = del.status === 204; return JSON.stringify(out); }); })()${COPY}`;

/** The staff list holds every snack the public menu holds, and the snacks that are off it: two different lists, one more than the other. */
export const STAFF_LIST_SUPERSET =
  `(() => { ${GETJ} return Promise.all([getj("/api/staff/snacks"), getj("/api/snacks")]).then(([staff, menu]) => JSON.stringify({ staff_is_array: Array.isArray(staff), staff_has_every_menu_snack: Array.isArray(staff) && Array.isArray(menu) && menu.every(m => staff.some(s => s.snack_id === m.snack_id && s.name === m.name && s.price === m.price)), staff_marks_menu_snacks_available: Array.isArray(staff) && Array.isArray(menu) && menu.every(m => staff.find(s => s.snack_id === m.snack_id).available === true), staff_at_least_as_long: Array.isArray(staff) && staff.length >= menu.length })); })()${COPY}`;

/** Day 3, Part 2: on staff.html (also reads the public pages: none may link to it): the table matches the staff list; Add adds a row; Take off / Put back change it; Remove removes it. Ends clean. */
export const STAFF_PAGE_COMMAND =
  `(() => { const form = document.getElementById("add-form"); if (!form) { return Promise.resolve(JSON.stringify({ on_staff_page: false })); } ${WAIT} ${RANDOM_ID} window.confirm = () => true;` +
  ` const rowOf = n => [...document.querySelectorAll("#snack-rows tr")].find(tr => tr.cells[0] && tr.cells[0].textContent === String(n)); const press = (n, label) => { const row = rowOf(n); const b = row && [...row.querySelectorAll("button")].find(x => x.textContent.startsWith(label)); if (b) { b.click(); } return !!b; };` +
  ` const out = { on_staff_page: true }; return Promise.all(["index.html", "menu.html", "order.html", "orders.html", "ledger.html", "tables.html", "add-snack.html"].map(p => fetch("/" + p).then(r => r.text()).then(html => html.includes("staff.html")))).then(links => { out.no_public_page_links_to_staff = links.every(x => !x); return wait(1000); }).then(() => fetch("/api/staff/snacks")).then(r => r.json()).then(staff => { out.rows_match_staff_list = document.querySelectorAll("#snack-rows tr").length === staff.length;` +
  ` document.getElementById("new-id").value = id; document.getElementById("new-name").value = "Check " + id; document.getElementById("new-price").value = 13; form.requestSubmit(); return wait(1500); })` +
  `.then(() => { out.add_message = document.getElementById("message").textContent; const row = rowOf(id); out.added_row_shown = !!row; const link = row && row.querySelector("a"); out.edit_link = link ? link.getAttribute("href") === "edit-snack.html?id=" + id : false; out.added_row_on_menu = row ? row.cells[3].textContent === "Yes" : false; press(id, "Take off"); return wait(1500); })` +
  `.then(() => fetch("/api/snacks")).then(r => r.json()).then(menu => { out.taken_off_menu = !menu.some(s => s.snack_id === id); const row = rowOf(id); out.row_kept_and_marked_no = !!row && row.cells[3].textContent === "No"; out.toggle_label_flipped = !!row && [...row.querySelectorAll("button")].some(x => x.textContent.startsWith("Put back")); press(id, "Put back"); return wait(1500); })` +
  `.then(() => fetch("/api/snacks")).then(r => r.json()).then(menu => { out.back_on_menu = menu.some(s => s.snack_id === id); press(id, "Remove"); return wait(1500); })` +
  `.then(() => fetch("/api/snacks/" + id)).then(r => { out.removed_in_mysql = r.status === 404; out.row_gone = !rowOf(id); out.remove_message = document.getElementById("message").textContent; return JSON.stringify(out); }); })()${COPY}`;

/** Day 3, Part 2: on staff.html, Remove on Kutsinta is refused in the app's own words and Kutsinta's row stays. Does nothing if Kutsinta has no sale. */
export const STAFF_PAGE_WALL_COMMAND =
  `(() => { if (!document.getElementById("add-form")) { return Promise.resolve(JSON.stringify({ on_staff_page: false })); } ${WAIT} ${SEND} window.confirm = () => true;` +
  ` return fetch("/api/sales").then(r => r.json()).then(sales => { if (!Array.isArray(sales) || !sales.some(s => s.snack_id === 90)) { return JSON.stringify({ on_staff_page: true, has_sales: false }); }` +
  ` const row = [...document.querySelectorAll("#snack-rows tr")].find(tr => tr.cells[0] && tr.cells[0].textContent === "90"); const button = row && [...row.querySelectorAll("button")].find(x => x.textContent === "Remove"); if (!button) { return JSON.stringify({ on_staff_page: true, has_sales: true, has_remove_button: false }); }` +
  ` button.click(); return wait(1500).then(() => fetch("/api/snacks")).then(r => r.json()).then(menu => { const still = Array.isArray(menu) && menu.some(s => s.snack_id === 90); return (still ? Promise.resolve() : send("PUT", "/api/snacks/90/available", { available: true })).then(() => JSON.stringify({ on_staff_page: true, has_sales: true, has_remove_button: true, message_on_page: document.getElementById("message").textContent, still_on_menu: still, row_still_there: [...document.querySelectorAll("#snack-rows tr")].some(tr => tr.cells[0].textContent === "90") })); }); }); })()${COPY}`;

// ---- Day 4: the repositories -----------------------------------------------------

/**
 * The same questions as before the split. Every request below; each answer is compared with what the finished Day 3 app answers, and
 * the mismatches are listed by name. Everything it changes it puts back (a snack numbered 20000 or more is made and removed).
 */
export const SPLIT_BATTERY =
  `(() => { ${SEND} ${GETJ} ${RANDOM_ID} const out = { mismatches: [] }; const expect = (name, ok) => { if (!ok) { out.mismatches.push(name); } }; let first = [];` +
  ` return getj("/api/snacks").then(list => { first = list; expect("menu keys", list.length > 0 && list.every(s => Object.keys(s).join(",") === "snack_id,name,price")); return getj("/api/snacks?sort=price"); })` +
  `.then(list => { expect("sort=price", list.every((s, i) => i === 0 || list[i - 1].price <= s.price) && list.length === first.length); return fetch("/api/snacks?sort=colour"); })` +
  `.then(r => { expect("sort=colour is 400", r.status === 400); return fetch("/api/snacks/99999"); }).then(r => { expect("snack 99999 is 404", r.status === 404); return fetch("/api/snacks/90"); })` +
  `.then(r => { expect("snack 90 exists", r.status === 200); return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 7 }); }).then(r => { expect("POST is 201", r.status === 201); return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 7 }); })` +
  `.then(r => { expect("POST twice is 409", r.status === 409); return send("PUT", "/api/snacks/" + id, { name: "Check " + id, price: 9 }); }).then(r => r.json()).then(s => { expect("PUT changes the price", s.price === 9); return send("POST", "/api/orders", { snack_id: id, qty: 3 }); })` +
  `.then(r => { expect("order is 201", r.status === 201); return r.json(); }).then(o => { out.order_total = o.total; expect("order total is qty times price", o.total === 27); return send("PUT", "/api/orders/" + o.order_id, { qty: 4 }).then(r => r.json()).then(o2 => { expect("order change", o2.qty === 4 && o2.total === 36); return fetch("/api/orders/" + o.order_id, { method: "DELETE" }); }); })` +
  `.then(r => { expect("cancel is 204", r.status === 204); return fetch("/api/snacks/" + id, { method: "DELETE" }); }).then(r => { expect("remove is 204", r.status === 204); return fetch("/api/snacks/99999", { method: "DELETE" }); })` +
  `.then(r => { expect("remove 99999 is 404", r.status === 404); return getj("/api/sales"); })` +
  `.then(sales => { out.kutsinta_has_sales = Array.isArray(sales) && sales.some(s => s.snack_id === 90); return out.kutsinta_has_sales ? fetch("/api/snacks/90", { method: "DELETE" }) : Promise.resolve({ status: 409 }); })` +
  `.then(r => { expect("Kutsinta stays (409)", r.status === 409); return Promise.all([getj("/api/summary"), getj("/api/staff/snacks"), getj("/api/info"), fetch("/api/special")]); })` +
  `.then(([summary, staff, info, special]) => { expect("summary keys", typeof summary.total_orders === "number" && typeof summary.total_sales === "number"); expect("staff list", Array.isArray(staff) && staff.every(s => typeof s.available === "boolean")); expect("info keys", Object.keys(info).join(",") === "name,opens,closes"); expect("special answers 200 or 404", special.status === 200 || special.status === 404);` +
  ` out.everything_same = out.mismatches.length === 0; return JSON.stringify(out); }); })()${COPY}`;

/** Day 4: Week 9's checkpoint lines are written once, in Week 9; the labs tell the student to run them again. Re-exported so the tests can see them. */
export { PUT_ORDER_ROUNDTRIP, SNACK_LIFECYCLE, SNACK_WALL, KUTSINTA_STAYS, CANCEL_ROUNDTRIP };

/** Day 4, Part 2: on staff.html the summary line shows the app's own numbers, and Refresh follows an order placed elsewhere (then cancelled). */
export const STAFF_SUMMARY_PAGE_COMMAND =
  `(() => { const line = document.getElementById("summary"); const refresh = document.getElementById("refresh"); if (!line || !refresh) { return Promise.resolve(JSON.stringify({ has_summary: false })); } ${WAIT} ${SEND} ${GETJ}` +
  ` const out = { has_summary: true }; const sentence = s => s.total_orders + " orders · ₱" + s.total_sales + " in sales"; return wait(1000).then(() => getj("/api/summary")).then(s => { out.line_matches_app = line.textContent === sentence(s); return send("POST", "/api/orders", { snack_id: 90, qty: 1 }); })` +
  `.then(r => r.json()).then(order => { refresh.click(); return wait(1500).then(() => getj("/api/summary")).then(s => { out.line_follows_refresh = line.textContent === sentence(s); return fetch("/api/orders/" + order.order_id, { method: "DELETE" }); }); })` +
  `.then(r => { out.cleaned_up = r.status === 204; return JSON.stringify(out); }); })()${COPY}`;

// ---- Day 5: no hard-coded data ---------------------------------------------------

/** Day 5: with the ledger's canteen_info row changed (the lab runs the UPDATE first), /api/info shows the new closing time. */
export const INFO_ADDRESS = "localhost:8080/api/info";
/** Day 5, Part 2: on index.html the hours line is what /api/info says, and index.js has no fetch( left. */
export const INDEX_PAGE_COMMAND =
  `(() => { const line = document.getElementById("hours"); if (!line) { return Promise.resolve(JSON.stringify({ has_hours_line: false })); } ${WAIT} ${GETJ}` +
  ` return Promise.all([${SCRIPT_FACTS("index.js")}, ${HTML_FACTS("index.js")}, wait(1000).then(() => getj("/api/info")), getj("/api/special").catch(() => null)]).then(([a, b, info, special]) => JSON.stringify({ has_hours_line: true, ...a, ...b, hours_say_what_info_says: line.textContent === info.name + ": open " + info.opens + " to " + info.closes, special_line_ok: document.getElementById("special").textContent.includes("Today's special") || document.getElementById("special").textContent === "No special today." })); })()${COPY}`;

/**
 * Day 5, Part 2, the whole site: every page loads, and the seven pages that write or show data that changes are on api.js (no fetch( in
 * their own script, api.js loaded first), and no public page links to staff.html. Run on any page.
 */
export const WHOLE_SITE_COMMAND =
  `(() => { const pages = ["index", "menu", "order", "orders", "tables", "ledger", "add-snack", "edit-snack", "special", "staff"]; const onApi = ["index", "order", "orders", "add-snack", "edit-snack", "special", "staff"];` +
  ` const read = p => fetch("/" + p + ".html").then(r => r.text().then(html => ({ p, ok: r.status === 200, html })));` +
  ` const script = x => fetch("/" + x.p + ".js").then(r => r.text()).then(src => ({ p: x.p, no_fetch: !/fetch\\(/.test(src), api_first: x.html.indexOf('src="api.js"') !== -1 && x.html.indexOf('src="api.js"') < x.html.indexOf('src="' + x.p + '.js"') }));` +
  ` return Promise.all(pages.map(read)).then(list => Promise.all(list.filter(x => onApi.includes(x.p)).map(script)).then(scripts => JSON.stringify({ pages_loaded: list.filter(x => x.ok).length, pages_expected: pages.length, all_pages_load: list.every(x => x.ok), pages_still_on_fetch: scripts.filter(s => !s.no_fetch).map(s => s.p), pages_not_loading_api_js_first: scripts.filter(s => !s.api_first).map(s => s.p), all_on_api_js: scripts.length === onApi.length && scripts.every(s => s.no_fetch && s.api_first), public_pages_link_to_staff: list.filter(x => ["index", "menu", "order"].includes(x.p) && x.html.includes("staff.html")).map(x => x.p) }))); })()${COPY}`;

/** Day 5, hand-in: a snack with the student's own number goes through add, order, take off (menu, refused order, board still showing the old order), put back. */
export const HANDIN_COMMAND = (snackNumber: number | string) =>
  `(() => { ${SEND} ${GETJ} const id = ${snackNumber}; const out = {}; return getj("/api/snacks/" + id).then(s => { out.snack_name = s.name; return getj("/api/orders"); })` +
  `.then(orders => { out.has_an_order_for_it = orders.some(o => o.snack_id === id); return send("PUT", "/api/snacks/" + id + "/available", { available: false }); })` +
  `.then(() => Promise.all([getj("/api/snacks"), send("POST", "/api/orders", { snack_id: id, qty: 1 }), getj("/api/orders"), getj("/api/staff/snacks")])).then(([menu, refused, orders, staff]) => { out.off_the_menu = !menu.some(s => s.snack_id === id); out.new_order_refused_status = refused.status; out.board_still_shows_old_order = orders.some(o => o.snack_id === id); out.dashboard_still_lists_it = staff.some(s => s.snack_id === id && s.available === false); return refused.status === 201 ? refused.json().then(o => fetch("/api/orders/" + o.order_id, { method: "DELETE" })) : Promise.resolve(); }).then(() => send("PUT", "/api/snacks/" + id + "/available", { available: true }))` +
  `.then(() => getj("/api/snacks")).then(menu => { out.back_on_menu = menu.some(s => s.snack_id === id); return JSON.stringify(out); }); })()${COPY}`;

/** Day 5: what /api/info answers, as a status and its keys (a 404 has a message, not hours). */
export const INFO_STATUS_COMMAND =
  `fetch("/api/info").then(r => r.text().then(t => JSON.stringify({ status: r.status, ...JSON.parse(t) })))${COPY}`;

/** A lab line: places ONE order for the snack and prints the status and the answer; if the order was made it cancels it again in the same line. */
export const orderThenCancel = (snackIdJs: string) =>
  `fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ snack_id: ${snackIdJs}, qty: 1 }) }).then(r => { console.log(r.status); return r.json(); })` +
  `.then(o => o.order_id ? fetch("/api/orders/" + o.order_id, { method: "DELETE" }).then(d => ({ ...o, cancelled_again: d.status === 204 })) : o).then(x => JSON.stringify(x))${COPY}`;
