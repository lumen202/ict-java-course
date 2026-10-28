// unit3-week8 — console lines and phrases the checkpoints share.
//
// Every `command` ends with `.then(copy)`: the browser console's copy() puts the
// answer on the clipboard, which beats selecting it by hand (the same rule as
// Week 7). week8.test.ts enforces the ending.

/** How a student runs a statement from queries.sql. */
export const SQL_RUN =
  "Put the cursor inside the statement and press Ctrl+E, then Ctrl+E again (if it asks, pick your ledger connection).";

/** How a student makes a new Java record file, the way Week 7 Day 5 did for Summary.java. */
export const NEW_RECORD_FILE = (name: string) =>
  `Create ${name}.java (right-click the folder that holds Snack.java → New File → ${name}.java). Press Escape and delete everything VS Code fills in, paste the package line from CanteenWebApplication.java as line 1, then type:`;

/** How a student makes a new page file beside menu.html. */
export const NEW_PAGE_FILE = (name: string) =>
  `Create ${name} (right-click the static folder, next to menu.html → New File → ${name}). Press Escape to close any suggestion, then type or paste:`;

const post = (path: string, body: string) =>
  `fetch("${path}", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(${body}) })`;

/** POST /api/orders from the console; prints the status and the answer. */
export const consoleOrder = (snack: number, qty: number) =>
  `${post("/api/orders", `{ snack_id: ${snack}, qty: ${qty} }`)}.then(r => { console.log(r.status, r.ok); return r.text(); }).then(t => { console.log(t); return t; }).then(copy)`;

/** POST /api/orders, then look the order up in the raw sales table (GET /api/sales). */
export const consoleOrderThenSales = (snack: number, qty: number) =>
  `${post("/api/orders", `{ snack_id: ${snack}, qty: ${qty} }`)}.then(r => r.json()).then(order => fetch("/api/sales").then(r => r.json()).then(sales => { order.in_sales_table = Array.isArray(sales) && sales.some(s => s.sale_id === order.order_id && s.snack_id === order.snack_id && s.qty === order.qty); return JSON.stringify(order); })).then(t => { console.log(t); return t; }).then(copy)`;

/** POST /api/snacks from the console with a ready-made body; prints the status, then the answer (like consoleOrder), and copies the answer. */
export const consoleAddSnack = (bodyJs: string) =>
  `${post("/api/snacks", bodyJs)}.then(r => { console.log(r.status, r.ok); return r.text(); }).then(t => { console.log(t); return t; }).then(copy)`;

/** The staff form's own call, with a snack number and name that are new every time. */
export const CHECK_SNACK_BODY = `{ snack_id: 1000 + Math.floor(Math.random() * 9000), name: "Check " + Date.now(), price: 14 }`;

/** Adds a new snack, then reads it back with GET /api/snacks/{its id}. */
export const consoleAddSnackThenGet =
  `(() => { const snack = ${CHECK_SNACK_BODY}; return ${post("/api/snacks", "snack")}.then(r => r.json()).then(created => fetch("/api/snacks/" + snack.snack_id).then(r => r.json())).then(t => JSON.stringify(t)).then(t => { console.log(t); return t; }); })().then(copy)`;

/** Day 2 Part 2: the name search, an apostrophe and the classic attack text, each should find nothing. */
export const SEARCH_SAFE_COMMAND =
  'Promise.all(["Aling\'s", "x\' OR \'1\'=\'1"].map(word => fetch("/api/snacks?name=" + encodeURIComponent(word)).then(r => r.json().then(list => ({ status: r.status, rows: Array.isArray(list) ? list.length : -1 })))))' +
  '.then(([apostrophe, attack]) => JSON.stringify({ apostrophe_status: apostrophe.status, apostrophe_rows: apostrophe.rows, attack_status: attack.status, attack_rows: attack.rows })).then(t => { console.log(t); return t; }).then(copy)';

/**
 * Day 2 Part 2: ?sort=price and ?sort=name really sort, and anything else is refused with 400.
 * Names are compared by their first character only, so MySQL's and JavaScript's different ideas
 * about hyphens and capitals can never make a correct app fail. The comparison is localeCompare with
 * sensitivity "base", which ignores capitals and accents the way MySQL's collation does (an accented
 * E sorts with E in both). A null or empty name counts as "" and sorts first, as in MySQL.
 */
export const SORT_COMMAND =
  'Promise.all(["price", "name", "price; DROP TABLE snacks"].map(word => fetch("/api/snacks?sort=" + encodeURIComponent(word)).then(r => r.json().then(body => ({ status: r.status, body })))))' +
  '.then(([byPrice, byName, attack]) => { const prices = Array.isArray(byPrice.body) ? byPrice.body.map(s => s.price) : []; const letters = Array.isArray(byName.body) ? byName.body.map(s => (s && typeof s.name === "string" && s.name.length > 0) ? s.name[0] : "") : [];' +
  ' const priceSorted = prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] <= p); const nameSorted = letters.length > 1 && letters.every((l, i) => i === 0 || letters[i - 1].localeCompare(l, undefined, { sensitivity: "base" }) <= 0);' +
  ' return JSON.stringify({ price_sorted: priceSorted, name_sorted: nameSorted, attack_status: attack.status, attack_message: attack.body.message }); }).then(t => { console.log(t); return t; }).then(copy)';

/** Day 2 Part 2: on menu.html, typing in the search box makes the page ask the app. */
export const MENU_SEARCH_COMMAND =
  '(() => { const box = document.getElementById("search"); box.value = "utsin"; box.dispatchEvent(new Event("input")); return new Promise(done => setTimeout(done, 1500)).then(() => JSON.stringify({ rows_shown: document.querySelectorAll("#menu-rows tr").length, asked_the_app: performance.getEntriesByType("resource").some(e => e.name.includes("/api/snacks?name=utsin")) })); })().then(t => { console.log(t); return t; }).then(copy)';

/** Day 3 Part 2: on add-snack.html, fill the form like a person and submit it. */
export const ADD_SNACK_PAGE_COMMAND =
  '(() => { const form = document.getElementById("snack-form"); if (!form) { return Promise.resolve(JSON.stringify({ on_add_snack_page: false })); } const id = 1000 + Math.floor(Math.random() * 9000);' +
  ' document.getElementById("snack-id").value = id; document.getElementById("snack-name").value = "Check " + id; document.getElementById("snack-price").value = 14; form.requestSubmit();' +
  ' return new Promise(done => setTimeout(done, 1500)).then(() => fetch("/api/snacks/" + id)).then(r => r.json()).then(snack => JSON.stringify({ on_add_snack_page: true, message_on_page: document.getElementById("result").textContent, name_in_mysql: snack.name, price_in_mysql: snack.price })); })().then(t => { console.log(t); return t; }).then(copy)';

// ---- Day 4 -----------------------------------------------------------------

/**
 * Day 4: looks up, by GET /api/orders/{id}, the Day 1 test sale (Kutsinta, 2000-01-01, qty 7) and
 * copies what the app answers. The id is read from /api/sales, so it is the student's own number.
 * Only an app that reads the sales table can know that sale: a Java list never held it.
 */
export const FETCH_ORDER_BY_TEST_SALE =
  'fetch("/api/sales").then(r => r.json()).then(sales => { const sale = Array.isArray(sales) ? sales.find(s => s.snack_id === 90 && s.sold_on === "2000-01-01" && s.qty === 7) : undefined; if (!sale) { return JSON.stringify({ message: "The test sale (snack 90, 2000-01-01, qty 7) is not in /api/sales" }); } return fetch("/api/orders/" + sale.sale_id).then(r => r.text()); }).then(t => { console.log(t); return t; }).then(copy)';

/**
 * Day 4: the summary, the list and the raw ledger must agree. Every sale that has a snack is an order,
 * so the number of orders is the number of sales whose snack_id is not null.
 */
export const FETCH_SUMMARY_AGREES =
  'Promise.all([fetch("/api/orders").then(r => r.json()), fetch("/api/summary").then(r => r.json()), fetch("/api/sales").then(r => r.json())]).then(([orders, summary, sales]) => { let sum = 0; for (const o of orders) { sum = sum + o.total; } return JSON.stringify({ count_matches: summary.total_orders === orders.length, sales_match: summary.total_sales === sum, every_sale_with_a_snack_is_an_order: Array.isArray(sales) && Array.isArray(orders) && orders.length === sales.filter(s => s.snack_id !== null).length }); }).then(t => { console.log(t); return t; }).then(copy)';

/** Day 4: one day with exactly one sale, and a day with none. */
export const FETCH_DAYS =
  'Promise.all(["2000-01-02", "1999-12-31"].map(day => fetch("/api/orders?date=" + day).then(r => r.json()))).then(([onDay, otherDay]) => JSON.stringify({ orders_on_2000_01_02: Array.isArray(onDay) ? onDay.length : -1, orders_on_1999_12_31: Array.isArray(otherDay) ? otherDay.length : -1 })).then(t => { console.log(t); return t; }).then(copy)';

/** Day 4, Part 2: the order for the price-history sale (Kutsinta, 2000-01-03, qty 2, price paid 7). */
export const FETCH_ORDER_BY_HISTORY_SALE =
  'fetch("/api/sales").then(r => r.json()).then(sales => { const sale = Array.isArray(sales) ? sales.find(s => s.snack_id === 90 && s.sold_on === "2000-01-03" && s.qty === 2) : undefined; if (!sale) { return JSON.stringify({ message: "The history sale (snack 90, 2000-01-03, qty 2) is not in /api/sales" }); } return fetch("/api/orders/" + sale.sale_id).then(r => r.text()); }).then(t => { console.log(t); return t; }).then(copy)';

// ---- Day 5 -----------------------------------------------------------------

/** Day 5: /api/rows rows each carry an `id` (the child table's primary key), and those ids are all different. */
export const ROWS_CHECK_COMMAND =
  'fetch("/api/rows").then(r => r.json()).then(rows => { const list = Array.isArray(rows) ? rows : []; const ids = list.map(row => row.id); return JSON.stringify({ row_count: list.length, ids_are_distinct: list.length > 0 && ids.every(id => typeof id === "number") && new Set(ids).size === list.length, first_column: list.length > 0 ? Object.keys(list[0])[0] : null }); }).then(t => { console.log(t); return t; }).then(copy)';

/** Day 5, Part 2: the special from /api/special is the very row /api/snacks/{id} shows, at a lower price. */
export const SPECIAL_JOIN_COMMAND =
  'fetch("/api/special").then(r => r.json()).then(special => fetch("/api/snacks/" + special.snack_id).then(r => r.json()).then(snack => JSON.stringify({ special_name_is_the_snack_name: special.name !== undefined && special.name === snack.name, special_normal_price_is_the_snack_price: special.price !== undefined && special.price === snack.price, special_price_is_lower: typeof special.special_price === "number" && special.special_price < special.price }))).then(t => { console.log(t); return t; }).then(copy)';

/**
 * Day 5, Part 2: on index.html, what the page says about today's special after its script has run,
 * the price it shows (the number after the peso sign, so a "₱70" can't pass for "₱7"), and whether
 * the page really asked /api/special (a special typed into index.js makes no request).
 */
export const INDEX_SPECIAL_COMMAND =
  'new Promise(done => setTimeout(done, 1200)).then(() => { const el = document.getElementById("special"); const text = el ? el.textContent : null; const peso = text ? text.match(/₱\\s*(\\d+(?:\\.\\d+)?)/) : null;' +
  ' return JSON.stringify({ special_text: text, price_on_page: peso ? Number(peso[1]) : null, asked_the_app: performance.getEntriesByType("resource").some(e => e.name.includes("/api/special")) }); }).then(t => { console.log(t); return t; }).then(copy)';
