// unit3-week9 — console lines the checkpoints share.
//
// Every `command` ends with `.then(copy)`: the browser console's copy() puts the
// answer on the clipboard (the same rule as Weeks 7 and 8; week9.test.ts enforces
// it). Every command that changes data does it to a row the command itself made
// (a snack with a random number, an order for the lab snack with qty 19) or puts
// the value back afterwards, so it never needs a number the student would have to
// guess and it can be run twice.
//
// A 204 has no body, so no command calls response.json() on a DELETE: the lesson
// says why (response.json() on an empty body throws "Unexpected end of JSON input",
// observed).

export { NEW_PAGE_FILE, SQL_RUN } from "../unit3-week8/commands";

const COPY = `.then(t => { console.log(t); return t; }).then(copy)`;
const WAIT = `const wait = ms => new Promise(done => setTimeout(done, ms));`;
const SEND = `const send = (method, path, body) => fetch(path, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });`;
const RANDOM_ID = `const id = 20000 + Math.floor(Math.random() * 70000);`;

/** A PUT from the console with a ready-made body; prints the status, then the answer, and copies the answer. */
export const consolePut = (pathJs: string, bodyJs: string) =>
  `fetch(${pathJs}, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(${bodyJs}) }).then(r => { console.log(r.status, r.ok); return r.text(); })${COPY}`;

/** A DELETE from the console; copies {status, empty_body, message}, because a 204 has no body to copy. */
export const consoleDelete = (pathJs: string) =>
  `fetch(${pathJs}, { method: "DELETE" }).then(r => r.text().then(t => JSON.stringify({ status: r.status, empty_body: t.length === 0, message: t.length === 0 ? "" : JSON.parse(t).message })))${COPY}`;

// ---- Day 1 -------------------------------------------------------------------

/**
 * Adds a snack, renames it and changes its price with PUT, then reads it back with GET. `others_unchanged`
 * compares the whole menu before and after, so an UPDATE that forgot its WHERE (and renamed every snack) fails.
 */
export const PUT_SNACK_ROUNDTRIP =
  `(() => { ${SEND} ${RANDOM_ID} const out = {}; let before = []; return fetch("/api/snacks").then(r => r.json()).then(list => { before = list; return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 14 }); })` +
  `.then(() => send("PUT", "/api/snacks/" + id, { name: "Renamed " + id, price: 21 }))` +
  `.then(put => { out.put_status = put.status; return Promise.all([fetch("/api/snacks/" + id).then(r => r.json()), fetch("/api/snacks").then(r => r.json())]); })` +
  `.then(([snack, list]) => { out.snack_id = snack.snack_id; out.name = snack.name; out.price = snack.price; out.others_unchanged = before.every(b => list.some(a => a.snack_id === b.snack_id && a.name === b.name && a.price === b.price)); return JSON.stringify(out); }); })()${COPY}`;

/** Day 1: PUT to a snack that doesn't exist; also proves nothing else on the menu changed (a missing WHERE would change everything). */
export const PUT_SNACK_MISSING =
  `(() => { ${SEND} const out = {}; let before = ""; return fetch("/api/snacks").then(r => r.text()).then(text => { before = text; return send("PUT", "/api/snacks/99999", { name: "Ghost", price: 5 }); })` +
  `.then(r => { out.status = r.status; return r.json(); }).then(body => { out.message = body.message; return fetch("/api/snacks").then(r => r.text()); })` +
  `.then(text => { out.nothing_changed = text === before; return JSON.stringify(out); }); })()${COPY}`;

/** Day 1: a PUT that changes nothing (same name, same price) still finds the row. */
export const PUT_SAME_VALUES =
  `(() => { ${SEND} return fetch("/api/snacks/90").then(r => r.json()).then(snack => send("PUT", "/api/snacks/90", { name: snack.name, price: snack.price }))` +
  `.then(r => r.json().then(body => JSON.stringify({ status: r.status, name_back: body.name, price_back: body.price }))); })()${COPY}`;

// ---- Day 2 -------------------------------------------------------------------

/**
 * Day 2: orders 2 Kutsinta, changes the order to qty 19 with PUT, reads it back and checks the total.
 * `others_unchanged` compares every OTHER sale's quantity before and after, so an UPDATE that forgot its WHERE fails.
 */
export const PUT_ORDER_ROUNDTRIP =
  `(() => { ${SEND} const out = {}; let before = []; let id = 0; return fetch("/api/sales").then(r => r.json()).then(list => { before = list; return send("POST", "/api/orders", { snack_id: 90, qty: 2 }); }).then(r => r.json())` +
  `.then(order => { id = order.order_id; return send("PUT", "/api/orders/" + id, { qty: 19 }); })` +
  `.then(put => { out.put_status = put.status; return Promise.all([fetch("/api/orders/" + id).then(r => r.json()), fetch("/api/snacks/90").then(r => r.json()), fetch("/api/sales").then(r => r.json())]); })` +
  `.then(([now, snack, list]) => { out.qty = now.qty; out.total_is_qty_times_price_paid = now.total === 19 * snack.price; out.others_unchanged = Array.isArray(list) && before.every(b => list.some(a => a.sale_id === b.sale_id && a.qty === b.qty)); return JSON.stringify(out); }); })()${COPY}`;

/** Day 2: PUT to an order that doesn't exist; also proves no sale changed (an UPDATE with no WHERE would change them all, and getOrder would still say 404). */
export const PUT_ORDER_MISSING =
  `(() => { ${SEND} const out = {}; let before = ""; return fetch("/api/sales").then(r => r.text()).then(text => { before = text; return send("PUT", "/api/orders/99999", { qty: 3 }); })` +
  `.then(r => { out.status = r.status; return r.json(); }).then(body => { out.message = body.message; return fetch("/api/sales").then(r => r.text()); })` +
  `.then(text => { out.nothing_changed = text === before; return JSON.stringify(out); }); })()${COPY}`;

/**
 * Day 2: changing the quantity of the history sale (Kutsinta, 2000-01-03, price paid 7) must keep the
 * price paid: the total after is the new quantity times 7, not times today's price. The quantity is put back.
 */
export const HISTORY_PRICE_KEPT =
  `(() => { ${SEND} return fetch("/api/sales").then(r => r.json()).then(sales => { const sale = Array.isArray(sales) ? sales.find(s => s.snack_id === 90 && s.sold_on === "2000-01-03") : undefined;` +
  ` if (!sale) { return JSON.stringify({ message: "The history sale (snack 90, 2000-01-03) is not in /api/sales" }); }` +
  ` const newQty = sale.qty === 3 ? 4 : 3;` +
  ` return send("PUT", "/api/orders/" + sale.sale_id, { qty: newQty }).then(put => put.json()).then(after => send("PUT", "/api/orders/" + sale.sale_id, { qty: sale.qty }).then(() => JSON.stringify({ qty_after: after.qty, qty_changed: after.qty === newQty, total_after: after.total, kept_price_paid_7: after.total === after.qty * 7 }))); }); })()${COPY}`;

// ---- Day 3 -------------------------------------------------------------------

/** Day 3: orders 19 Kutsinta, cancels it with DELETE, looks it up, cancels it again, and checks no other order went with it. */
export const CANCEL_ROUNDTRIP =
  `(() => { ${SEND} const out = {}; let id = 0; let before = 0; return fetch("/api/orders").then(r => r.json()).then(list => { before = Array.isArray(list) ? list.length : -1; return send("POST", "/api/orders", { snack_id: 90, qty: 19 }); })` +
  `.then(r => r.json()).then(order => { id = order.order_id; return fetch("/api/orders/" + id, { method: "DELETE" }); })` +
  `.then(first => { out.first_status = first.status; return first.text(); })` +
  `.then(text => { out.first_body_empty = text.length === 0; return fetch("/api/orders/" + id); })` +
  `.then(look => { out.lookup_status = look.status; return fetch("/api/orders/" + id, { method: "DELETE" }); })` +
  `.then(second => { out.second_status = second.status; return second.text(); })` +
  `.then(text => { out.second_message = text.length === 0 ? "" : JSON.parse(text).message; return fetch("/api/orders"); })` +
  `.then(r => r.json()).then(list => { out.other_orders_kept = Array.isArray(list) && list.length === before; return JSON.stringify(out); }); })()${COPY}`;

// ---- Day 4 -------------------------------------------------------------------

/** Day 4: adds a snack nobody has ordered, removes it, looks it up, removes it again. */
export const SNACK_LIFECYCLE =
  `(() => { ${SEND} ${RANDOM_ID} const out = {}; return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 6 })` +
  `.then(created => { out.created_status = created.status; return fetch("/api/snacks/" + id, { method: "DELETE" }); })` +
  `.then(first => { out.delete_status = first.status; return first.text(); })` +
  `.then(text => { out.delete_body_empty = text.length === 0; return fetch("/api/snacks/" + id); })` +
  `.then(look => { out.lookup_status = look.status; return fetch("/api/snacks/" + id, { method: "DELETE" }); })` +
  `.then(second => { out.delete_again_status = second.status; return JSON.stringify(out); }); })()${COPY}`;

/** Day 4: a snack that has a sale cannot be removed (409) until the sale is cancelled; then it can (204). */
export const SNACK_WALL =
  `(() => { ${SEND} ${RANDOM_ID} const out = {}; let orderId = 0; return send("POST", "/api/snacks", { snack_id: id, name: "Check " + id, price: 6 })` +
  `.then(() => send("POST", "/api/orders", { snack_id: id, qty: 19 })).then(r => r.json())` +
  `.then(order => { orderId = order.order_id; return fetch("/api/snacks/" + id, { method: "DELETE" }); })` +
  `.then(wall => { out.wall_status = wall.status; return wall.json(); })` +
  `.then(body => { out.wall_message = body.message; return fetch("/api/orders/" + orderId, { method: "DELETE" }); })` +
  `.then(cancel => { out.cancel_status = cancel.status; return fetch("/api/snacks/" + id, { method: "DELETE" }); })` +
  `.then(after => { out.delete_after_cancel_status = after.status; return JSON.stringify(out); }); })()${COPY}`;

/** Day 4: Kutsinta has sales, so it stays. The line checks /api/sales first and does NOT try the delete if Kutsinta has none. */
export const KUTSINTA_STAYS =
  `fetch("/api/sales").then(r => r.json()).then(sales => { const has = Array.isArray(sales) && sales.some(s => s.snack_id === 90); if (!has) { return JSON.stringify({ has_sales: false }); }` +
  ` return fetch("/api/snacks/90", { method: "DELETE" }).then(r => r.json().then(body => fetch("/api/snacks/90").then(look => JSON.stringify({ has_sales: true, delete_status: r.status, message: body.message, still_on_menu: look.status === 200 })))); })${COPY}`;

// ---- Day 5 -------------------------------------------------------------------

/**
 * Day 5: marks today's (newest) special with the price 777 through PUT, reads it, then removes the newest special with DELETE and
 * looks at what is left. `older_special_unchanged` is true only if an OLDER special is still there and still not 777, so an UPDATE
 * with no WHERE, or with WHERE snack_id = 90, fails. Needs two specials: Part 1's second mission inserts them.
 */
export const SPECIAL_PUT_ROUNDTRIP =
  `(() => { ${SEND} const out = {}; return fetch("/api/special").then(r => r.json()).then(before => { out.name = before.name; return send("PUT", "/api/special", { special_price: 777 }); })` +
  `.then(put => { out.put_status = put.status; return put.json(); }).then(answer => { out.answer_agrees = answer.special_price === 777; return fetch("/api/special").then(r => r.json()); })` +
  `.then(now => { out.changed = now.special_price === 777; return fetch("/api/special", { method: "DELETE" }); })` +
  `.then(del => { out.delete_status = del.status; return fetch("/api/special"); })` +
  `.then(r => r.json().then(older => { out.older_special_unchanged = r.status === 200 && older.special_price !== 777; return JSON.stringify(out); })); })()${COPY}`;

/** Day 5: marks the newest special (777), removes the newest special, and checks the marked one is gone. Older specials stay. */
export const SPECIAL_REMOVE_ROUNDTRIP =
  `(() => { ${SEND} const out = {}; return send("PUT", "/api/special", { special_price: 777 }).then(put => { out.marked = put.status === 200; return fetch("/api/special", { method: "DELETE" }); })` +
  `.then(first => { out.first_status = first.status; return first.text(); }).then(text => { out.first_body_empty = text.length === 0; return fetch("/api/special"); })` +
  `.then(r => r.json().then(body => { out.marked_special_gone = r.status === 404 || body.special_price !== 777; return JSON.stringify(out); })); })()${COPY}`;

// ---- Part 2: the pages -------------------------------------------------------

/** Day 1, Part 2: on edit-snack.html?id=90, the boxes are filled, a change is saved, and the old price is put back. */
export const EDIT_PAGE_COMMAND =
  `(() => { const nameBox = document.getElementById("snack-name"); if (!nameBox) { return Promise.resolve(JSON.stringify({ on_edit_page: false })); } ${WAIT}` +
  ` const priceBox = document.getElementById("snack-price"); return wait(1000).then(() => { const before = { name: nameBox.value, price: Number(priceBox.value) }; const newPrice = before.price === 12 ? 13 : 12;` +
  ` priceBox.value = newPrice; document.getElementById("edit-form").requestSubmit();` +
  ` return wait(1200).then(() => fetch("/api/snacks/90")).then(r => r.json()).then(snack => { const out = { on_edit_page: true, number_shown: document.getElementById("snack-number").textContent, prefilled_name: before.name, message_on_page: document.getElementById("result").textContent, price_changed_in_mysql: snack.price === newPrice };` +
  ` return fetch("/api/snacks/90", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(before) }).then(() => JSON.stringify(out)); }); }); })()${COPY}`;

/** Day 1, Part 2: on edit-snack.html?id=99999 the page says why there is nothing to edit. */
export const EDIT_PAGE_UNKNOWN_COMMAND =
  `(() => { if (!document.getElementById("snack-name")) { return Promise.resolve(JSON.stringify({ on_edit_page: false })); } ${WAIT}` +
  ` return wait(1000).then(() => JSON.stringify({ on_edit_page: true, status_on_page: document.getElementById("status").textContent })); })()${COPY}`;

const ROW_BY_ORDER = `const rowOf = id => [...document.querySelectorAll("#order-rows tr")].find(tr => tr.cells[0] && tr.cells[0].textContent === String(id));`;

/** Day 2, Part 2: on orders.html, an order gets a new quantity from its own row. The test order is left at qty 19. */
export const BOARD_EDIT_COMMAND =
  `(() => { if (!document.getElementById("message")) { return Promise.resolve(JSON.stringify({ board_has_message_line: false })); } ${WAIT} ${SEND} ${ROW_BY_ORDER}` +
  ` return send("POST", "/api/orders", { snack_id: 90, qty: 2 }).then(r => r.json()).then(order => { document.getElementById("refresh").click(); return wait(1200).then(() => { const row = rowOf(order.order_id);` +
  ` if (!row) { return JSON.stringify({ board_has_message_line: true, row_found: false }); } const box = row.querySelector("input"); const button = row.querySelector("button");` +
  ` if (!box || !button) { return JSON.stringify({ board_has_message_line: true, row_found: true, row_has_change_control: false }); }` +
  ` box.value = 19; button.click(); return wait(1500).then(() => { const again = rowOf(order.order_id); return JSON.stringify({ board_has_message_line: true, row_found: true, row_has_change_control: true, qty_on_row_after: again ? Number(again.cells[2].textContent) : -1, message_on_page: document.getElementById("message").textContent }); }); }); }); })()${COPY}`;

/** Day 3, Part 2: on orders.html, a row's Cancel button removes the order. Confirm is answered "OK" for the check. */
export const BOARD_CANCEL_COMMAND =
  `(() => { if (!document.getElementById("message")) { return Promise.resolve(JSON.stringify({ board_has_message_line: false })); } ${WAIT} ${SEND} ${ROW_BY_ORDER} window.confirm = () => true;` +
  ` return send("POST", "/api/orders", { snack_id: 90, qty: 19 }).then(r => r.json()).then(order => { document.getElementById("refresh").click(); return wait(1200).then(() => { const row = rowOf(order.order_id);` +
  ` const cancel = row && row.cells.length >= 6 ? row.cells[5].querySelector("button") : null; if (!cancel) { return JSON.stringify({ row_found: !!row, row_has_cancel_button: false }); }` +
  ` cancel.click(); return wait(1500).then(() => fetch("/api/orders/" + order.order_id)).then(look => JSON.stringify({ row_found: true, row_has_cancel_button: true, row_gone_from_board: !rowOf(order.order_id), message_on_page: document.getElementById("message").textContent, order_gone_in_mysql: look.status === 404 })); }); }); })()${COPY}`;

/** Day 4, Part 2: on edit-snack.html?id=8000 (a snack nobody ordered) the Remove button takes it off the menu. */
export const EDIT_REMOVE_COMMAND =
  `(() => { const button = document.getElementById("remove"); if (!button) { return Promise.resolve(JSON.stringify({ has_remove_button: false })); } ${WAIT} window.confirm = () => true;` +
  ` return wait(800).then(() => { button.click(); return wait(1200); }).then(() => fetch("/api/snacks/8000")).then(look => JSON.stringify({ has_remove_button: true, message_on_page: document.getElementById("result").textContent, snack_gone_in_mysql: look.status === 404 })); })()${COPY}`;

/** Day 4, Part 2: on edit-snack.html?id=90 the Remove button is refused with the app's own words, and Kutsinta stays. Does nothing if Kutsinta has no sale. */
export const EDIT_REMOVE_WALL_COMMAND =
  `(() => { const button = document.getElementById("remove"); if (!button) { return Promise.resolve(JSON.stringify({ has_remove_button: false })); } ${WAIT} window.confirm = () => true;` +
  ` return fetch("/api/sales").then(r => r.json()).then(sales => { if (!(Array.isArray(sales) && sales.some(s => s.snack_id === 90))) { return JSON.stringify({ has_remove_button: true, has_sales: false }); }` +
  ` return wait(800).then(() => { button.click(); return wait(1200); }).then(() => fetch("/api/snacks/90")).then(look => JSON.stringify({ has_remove_button: true, has_sales: true, message_on_page: document.getElementById("result").textContent, still_on_menu: look.status === 200 })); }); })()${COPY}`;

/** Day 5, Part 2: on special.html, the price box changes the special and the line above shows the NEW price; the old price is put back. */
export const SPECIAL_PAGE_COMMAND =
  `(() => { const form = document.getElementById("special-form"); if (!form) { return Promise.resolve(JSON.stringify({ on_special_page: false })); } ${WAIT} ${SEND}` +
  ` return wait(1000).then(() => fetch("/api/special")).then(r => r.json()).then(before => { const newPrice = before.special_price === 8 ? 9 : 8; document.getElementById("special-price").value = newPrice; form.requestSubmit();` +
  ` return wait(1500).then(() => fetch("/api/special")).then(r => r.json()).then(now => { const out = { on_special_page: true, message_on_page: document.getElementById("result").textContent, current_shows_new_price: document.getElementById("current").textContent.includes("₱" + newPrice + " "), price_changed_in_mysql: now.special_price === newPrice };` +
  ` return send("PUT", "/api/special", { special_price: before.special_price }).then(() => JSON.stringify(out)); }); }); })()${COPY}`;

/** Day 5, Part 2: on special.html, Remove takes away the NEWEST special (marked 777 first); the line above must stop showing it. Older specials stay. */
export const SPECIAL_PAGE_REMOVE_COMMAND =
  `(() => { const button = document.getElementById("remove-special"); if (!button) { return Promise.resolve(JSON.stringify({ on_special_page: false })); } ${WAIT} ${SEND} window.confirm = () => true;` +
  ` return wait(800).then(() => send("PUT", "/api/special", { special_price: 777 })).then(() => { button.click(); return wait(1500); }).then(() => fetch("/api/special")).then(r => r.json().then(body => JSON.stringify({ on_special_page: true, message_on_page: document.getElementById("result").textContent, current_line_updated: !document.getElementById("current").textContent.includes("777") && document.getElementById("current").textContent.length > 0, marked_special_gone_in_mysql: r.status === 404 || body.special_price !== 777 }))); })()${COPY}`;
