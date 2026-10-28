// unit3-week8 — the Java, SQL and page code the week's labs type, as constants.
//
// Everything a lab asks the student to type, and every "compare your whole
// file" block, is composed here from the same method strings, so the compare
// blocks cannot drift from the snippets. The stage files (`CONTROLLER_D1A` …
// `CONTROLLER_D5`) were extracted from this module, compiled against Spring
// Boot 4.1.1 and a real MySQL 8.0 ledger built from Weeks 2–4, and probed day
// by day (see docs/agent/log/2026-10-28-week8-reviews-and-part-2.md).
//
// Stage names: the letter A is the end of a day's Part 1, no letter is the end
// of the whole day (Part 2 included).
//
// The password line always shows a placeholder: the real one lives only in the
// student's own application.properties and never goes into a turn-in.

export const indent = (code: string) =>
  code
    .split("\n")
    .map((l) => (l ? `    ${l}` : l))
    .join("\n");

/** Continue a multi-line expression: every line after the first is indented one level. */
const hang = (code: string) => code.split("\n").map((l, i) => (i === 0 ? l : `    ${l}`)).join("\n");

// The snack the week's first lab puts into every ledger. No earlier week uses
// the name, so a name search finds exactly one of it (Week 3 Day 5 has students
// insert a Taho; Week 8 used to use that name too).
export const LAB_SNACK = "Kutsinta";
export const LAB_SNACK_ID = 90;
export const LAB_SNACK_PRICE = 10;
export const LAB_SNACK_INSERT = `INSERT INTO snacks (snack_id, name, price) VALUES (${LAB_SNACK_ID}, '${LAB_SNACK}', ${LAB_SNACK_PRICE});`;

// ---- pom.xml and application.properties ------------------------------------

export const POM_DEPS =
  "<dependency>\n\t<groupId>org.springframework.boot</groupId>\n\t<artifactId>spring-boot-starter-jdbc</artifactId>\n</dependency>\n<dependency>\n\t<groupId>com.mysql</groupId>\n\t<artifactId>mysql-connector-j</artifactId>\n\t<scope>runtime</scope>\n</dependency>";

export const DATASOURCE_LINES =
  "spring.datasource.url=jdbc:mysql://localhost:3306/school\nspring.datasource.username=root\nspring.datasource.password=YOUR_MYSQL_PASSWORD";

// The lines Week 7 already left in the file (the cache line came with Week 7
// Day 5), shown so the compare block reads like the real file.
export const PROPERTIES_FILE = `spring.application.name=canteen-web
spring.web.error.include-message=always
spring.web.resources.cache.period=0
${DATASOURCE_LINES}`;

// ---- SnackController, method by method -------------------------------------

export const CANTEEN_INFO_RECORD = "record CanteenInfo(String name, String opens, String closes) {\n}";

export const JDBC_FIELD =
  "private final JdbcClient jdbc;\n\npublic SnackController(JdbcClient jdbc) {\n    this.jdbc = jdbc;\n}";

export const SNACKS_FIELD_W7 = `private final List<Snack> snacks = List.of(
    new Snack(1, "Banana cue", 15),
    new Snack(2, "Turon", 12),
    new Snack(3, "Kwek-kwek", 20),
    new Snack(4, "Gulaman", 10),
    new Snack(5, "Siopao", 25),
    new Snack(6, "Pastillas", 8)
);`;

export const ORDERS_FIELD_W7 = "private final List<Order> orders = new ArrayList<>();";

export const INFO_METHOD =
  '@GetMapping("/api/info")\npublic CanteenInfo info() {\n    return new CanteenInfo("Aling Nena\'s Canteen", "7:00", "16:00");\n}';

// Day 1: the list is READ from MySQL; Week 7's maxPrice loop still filters it in Java.
export const LIST_SNACKS_D1 = `@GetMapping("/api/snacks")
public List<Snack> listSnacks(@RequestParam(required = false) Integer maxPrice) {
    List<Snack> all = jdbc.sql("SELECT snack_id, name, price FROM snacks ORDER BY snack_id")
        .query(Snack.class)
        .list();
    if (maxPrice == null) {
        return all;
    }
    List<Snack> cheap = new ArrayList<>();
    for (Snack s : all) {
        if (s.price() <= maxPrice) {
            cheap.add(s);
        }
    }
    return cheap;
}`;

// The first lines of Day 1's change to listSnacks, shown on their own.
export const LIST_ALL_LINES =
  'List<Snack> all = jdbc.sql("SELECT snack_id, name, price FROM snacks ORDER BY snack_id")\n    .query(Snack.class)\n    .list();';

export const GET_SNACK_W7 =
  '@GetMapping("/api/snacks/{id}")\npublic Snack getSnack(@PathVariable int id) {\n    for (Snack s : snacks) {\n        if (s.snack_id() == id) {\n            return s;\n        }\n    }\n    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);\n}';

// Day 1, Part 2: the raw ledger.
export const SALE_RECORD = "public record Sale(int sale_id, Integer snack_id, String sold_on, int qty) {\n}";

export const LIST_SALES = `@GetMapping("/api/sales")
public List<Sale> listSales() {
    return jdbc.sql("SELECT sale_id, snack_id, sold_on, qty FROM sales ORDER BY sale_id")
        .query(Sale.class)
        .list();
}`;

export const LEDGER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ledger — Aling Nena's Canteen</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html">Home</a>
  <a href="menu.html">Menu</a>
  <a href="order.html">Order</a>
  <a href="orders.html">Orders</a>
  <h1>The ledger</h1>
  <p id="status"></p>
  <table>
    <tr><th>Sale</th><th>Snack</th><th>Date</th><th>Qty</th></tr>
    <tbody id="sale-rows"></tbody>
  </table>
  <script src="ledger.js"></script>
</body>
</html>`;

export const LEDGER_JS_SHOW = `const rows = document.getElementById("sale-rows");
const statusLine = document.getElementById("status");

function showSales(list) {
  rows.replaceChildren();
  for (const sale of list) {
    const tr = document.createElement("tr");
    const id = document.createElement("td");
    id.textContent = sale.sale_id;
    const snack = document.createElement("td");
    if (sale.snack_id === null) {
      snack.textContent = "(no snack)";
    } else {
      snack.textContent = sale.snack_id;
    }
    const date = document.createElement("td");
    date.textContent = sale.sold_on;
    const qty = document.createElement("td");
    qty.textContent = sale.qty;
    tr.append(id, snack, date, qty);
    rows.append(tr);
  }
  statusLine.textContent = \`\${list.length} sales in the ledger\`;
}`;

export const LEDGER_JS_LOAD = `fetch("/api/sales")
  .then(response => {
    response.json().then(data => {
      if (response.ok) {
        showSales(data);
      } else {
        statusLine.textContent = \`Sorry: \${data.message}\`;
      }
    });
  })
  .catch(error => {
    console.error(error);
    statusLine.textContent = "Can't reach the canteen app. Is it running?";
  });`;

export const LEDGER_JS = `${LEDGER_JS_SHOW}

${LEDGER_JS_LOAD}`;

// Day 2 (Part 1)
export const GET_SNACK_D2 = `@GetMapping("/api/snacks/{id}")
public Snack getSnack(@PathVariable int id) {
    return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE snack_id = ?")
        .param(id)
        .query(Snack.class)
        .optional()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id));
}`;

export const LIST_SNACKS_D2 = `@GetMapping("/api/snacks")
public List<Snack> listSnacks(@RequestParam(required = false) Integer maxPrice) {
    if (maxPrice == null) {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks ORDER BY snack_id")
            .query(Snack.class)
            .list();
    }
    return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE price <= ? ORDER BY snack_id")
        .param(maxPrice)
        .query(Snack.class)
        .list();
}`;

export const FIND_GLUED = `@GetMapping("/api/find")
public List<Snack> findByName(@RequestParam String name) {
    return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE name = '" + name + "'")
        .query(Snack.class)
        .list();
}`;

export const FIND_SAFE = `@GetMapping("/api/find")
public List<Snack> findByName(@RequestParam String name) {
    return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE name = ?")
        .param(name)
        .query(Snack.class)
        .list();
}`;

// Day 2, Part 2: search with LIKE, and a sort chosen from a whitelist.
export const SEARCH_BRANCH = `if (name != null) {
    return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE name LIKE ? ORDER BY snack_id")
        .param("%" + name + "%")
        .query(Snack.class)
        .list();
}`;

// Lab-only, deliberately wrong: the customer's word goes into the ORDER BY. Deleted again in the same lab.
export const SORT_GLUED = `@GetMapping("/api/sorted")
public List<Snack> sorted(@RequestParam String by) {
    return jdbc.sql("SELECT snack_id, name, price FROM snacks ORDER BY " + by)
        .query(Snack.class)
        .list();
}`;

// Lab-only: the "obvious" fix for the glued sort. Observed: no error, and no sorting either.
export const SORT_QMARK = `@GetMapping("/api/sorted")
public List<Snack> sorted(@RequestParam String by) {
    return jdbc.sql("SELECT snack_id, name, price FROM snacks ORDER BY ?")
        .param(by)
        .query(Snack.class)
        .list();
}`;

export const SORT_BRANCH = `if (sort != null) {
    String sql;
    if (sort.equals("price")) {
        sql = "SELECT snack_id, name, price FROM snacks ORDER BY price, snack_id";
    } else if (sort.equals("name")) {
        sql = "SELECT snack_id, name, price FROM snacks ORDER BY name";
    } else {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sort must be price or name");
    }
    return jdbc.sql(sql)
        .query(Snack.class)
        .list();
}`;

export const LIST_SNACKS_HEAD_NAME = `@GetMapping("/api/snacks")
public List<Snack> listSnacks(
        @RequestParam(required = false) Integer maxPrice,
        @RequestParam(required = false) String name) {`;

export const LIST_SNACKS_HEAD_SORT = `@GetMapping("/api/snacks")
public List<Snack> listSnacks(
        @RequestParam(required = false) Integer maxPrice,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String sort) {`;

const LIST_SNACKS_REST = `    if (maxPrice == null) {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks ORDER BY snack_id")
            .query(Snack.class)
            .list();
    }
    return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE price <= ? ORDER BY snack_id")
        .param(maxPrice)
        .query(Snack.class)
        .list();
}`;

// Step one of the search mission: only the name branch is added.
export const LIST_SNACKS_NAME = `${LIST_SNACKS_HEAD_NAME}
${indent(SEARCH_BRANCH)}
${LIST_SNACKS_REST}`;

// End of Day 2: name, sort and maxPrice.
export const LIST_SNACKS_D2B = `${LIST_SNACKS_HEAD_SORT}
${indent(SEARCH_BRANCH)}
${indent(SORT_BRANCH)}
${LIST_SNACKS_REST}`;

// menu.js: the search box asks the app instead of filtering a list in the browser.
export const MENU_SEARCH_OLD = `const search = document.getElementById("search");

search.addEventListener("input", function () {
  const words = search.value.toLowerCase();
  showSnacks(snacks.filter(snack => snack.name.toLowerCase().includes(words)));
});`;

export const MENU_SEARCH_NEW = `const search = document.getElementById("search");

search.addEventListener("input", function () {
  fetch("/api/snacks?name=" + encodeURIComponent(search.value))
    .then(response => response.json())
    .then(data => showSnacks(data))
    .catch(error => console.error(error));
});`;

// Week 7's orders (still on Java lists until Day 4)
export const LIST_ORDERS_W7 = '@GetMapping("/api/orders")\npublic List<Order> listOrders() {\n    return orders;\n}';

export const QTY_CHECK =
  'if (request.qty() < 1 || request.qty() > 20) {\n    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "qty must be from 1 to 20");\n}';

export const PLACE_ORDER_W7 = `@PostMapping("/api/orders")
@ResponseStatus(HttpStatus.CREATED)
public Order placeOrder(@RequestBody OrderRequest request) {
${indent(QTY_CHECK)}
    Snack snack = getSnack(request.snack_id());
    Order order = new Order(orders.size() + 1, snack.snack_id(), snack.name(), request.qty(), snack.price() * request.qty());
    orders.add(order);
    return order;
}`;

// Day 3: the order is written to the sales table; the Java list is still kept for the board until Day 4.
export const INSERT_BLOCK = `KeyHolder keys = new GeneratedKeyHolder();
jdbc.sql("INSERT INTO sales (snack_id, sold_on, qty) VALUES (?, CURRENT_DATE, ?)")
    .param(snack.snack_id())
    .param(request.qty())
    .update(keys);
int newId = keys.getKey().intValue();`;

export const PLACE_ORDER_D3 = `@PostMapping("/api/orders")
@ResponseStatus(HttpStatus.CREATED)
public Order placeOrder(@RequestBody OrderRequest request) {
${indent(QTY_CHECK)}
    Snack snack = getSnack(request.snack_id());
${indent(INSERT_BLOCK)}
    Order order = new Order(newId, snack.snack_id(), snack.name(), request.qty(), snack.price() * request.qty());
    orders.add(order);
    return order;
}`;

// Day 3, Part 2: a second write. The customer (the staff form) sends the snack number too:
// snacks.snack_id has no counter, and a primary key that is the target of a foreign key
// can't be given one with ALTER TABLE (Error 1833, observed), so there is no KeyHolder here.
export const ADD_SNACK = `@PostMapping("/api/snacks")
@ResponseStatus(HttpStatus.CREATED)
public Snack addSnack(@RequestBody Snack snack) {
    if (snack.snack_id() < 1) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "snack_id must be 1 or more");
    }
    if (snack.name() == null || snack.name().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must not be blank");
    }
    if (snack.name().length() > 50) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must be at most 50 characters");
    }
    if (snack.price() < 1 || snack.price() > 1000) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "price must be from 1 to 1000");
    }
    try {
        jdbc.sql("INSERT INTO snacks (snack_id, name, price) VALUES (?, ?, ?)")
            .param(snack.snack_id())
            .param(snack.name())
            .param(snack.price())
            .update();
    } catch (DuplicateKeyException e) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Snack " + snack.snack_id() + " already exists");
    }
    return snack;
}`;

export const ADD_SNACK_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Add a snack — Aling Nena's Canteen</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <a href="index.html">Home</a>
  <a href="menu.html">Menu</a>
  <a href="order.html">Order</a>
  <a href="ledger.html">Ledger</a>
  <h1>Add a snack</h1>
  <form id="snack-form">
    <label for="snack-id">Snack number</label>
    <input type="number" id="snack-id" min="1" required>
    <label for="snack-name">Name</label>
    <input type="text" id="snack-name" required>
    <label for="snack-price">Price</label>
    <input type="number" id="snack-price" min="1" max="1000" required>
    <button type="submit">Add snack</button>
  </form>
  <p id="result"></p>
  <script src="add-snack.js"></script>
</body>
</html>`;

export const ADD_SNACK_JS = `const form = document.getElementById("snack-form");
const result = document.getElementById("result");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const snack = {
    snack_id: Number(document.getElementById("snack-id").value),
    name: document.getElementById("snack-name").value,
    price: Number(document.getElementById("snack-price").value)
  };
  fetch("/api/snacks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snack)
  })
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          result.textContent = \`Added: \${data.name} (snack \${data.snack_id}) at ₱\${data.price}\`;
        } else {
          result.textContent = \`Sorry: \${data.message}\`;
        }
      });
    })
    .catch(error => console.error(error));
});`;

export const GET_ORDER_W7 =
  '@GetMapping("/api/orders/{id}")\npublic Order getOrder(@PathVariable int id) {\n    for (Order o : orders) {\n        if (o.order_id() == id) {\n            return o;\n        }\n    }\n    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No order with id " + id);\n}';

export const SUMMARY_W7 =
  '@GetMapping("/api/summary")\npublic Summary summary() {\n    int sales = 0;\n    for (Order o : orders) {\n        sales = sales + o.total();\n    }\n    return new Summary(orders.size(), sales);\n}';

// Day 4. Part 1 calculates the total from today's price; Part 2 from the price
// stored on the sale (price_paid), falling back to today's price for sales that
// have none (every sale made before the column existed).
const TOTAL_TODAY = "sales.qty * snacks.price AS total";
const TOTAL_PAID = "sales.qty * COALESCE(sales.price_paid, snacks.price) AS total";

const joinSelect = (total: string, where: string) => `jdbc.sql("""
    SELECT sales.sale_id AS order_id, sales.snack_id, snacks.name,
           sales.qty, ${total}
    FROM sales
    INNER JOIN snacks ON sales.snack_id = snacks.snack_id${where}
    ORDER BY sales.sale_id
    """)`;

export const ORDER_SELECT_ALL = `${joinSelect(TOTAL_TODAY, "")}
    .query(Order.class)
    .list()`;

export const ORDER_SELECT_DATE = `${joinSelect(TOTAL_TODAY, "\n    WHERE sales.sold_on = ?")}
    .param(date)
    .query(Order.class)
    .list()`;

export const ORDER_SELECT_ALL_PAID = `${joinSelect(TOTAL_PAID, "")}
    .query(Order.class)
    .list()`;

export const ORDER_SELECT_DATE_PAID = `${joinSelect(TOTAL_PAID, "\n    WHERE sales.sold_on = ?")}
    .param(date)
    .query(Order.class)
    .list()`;

export const SQL_JOIN_TODAY =
  "SELECT sales.sale_id AS order_id, sales.snack_id, snacks.name,\n       sales.qty, sales.qty * snacks.price AS total\nFROM sales\nINNER JOIN snacks ON sales.snack_id = snacks.snack_id\nORDER BY sales.sale_id;";

export const SQL_JOIN_PAID =
  "SELECT sales.sale_id AS order_id, sales.snack_id, snacks.name,\n       sales.qty, sales.qty * COALESCE(sales.price_paid, snacks.price) AS total\nFROM sales\nINNER JOIN snacks ON sales.snack_id = snacks.snack_id\nORDER BY sales.sale_id;";

// Step one of Day 4's lab: the whole list, no date filter yet.
export const LIST_ORDERS_D4 = `@GetMapping("/api/orders")
public List<Order> listOrders() {
    return ${hang(ORDER_SELECT_ALL)};
}`;

const listOrdersDate = (all: string, dated: string) => `@GetMapping("/api/orders")
public List<Order> listOrders(@RequestParam(required = false) String date) {
    if (date == null) {
        return ${hang(hang(all))};
    }
    return ${hang(dated)};
}`;

// Step two: the optional ?date= filter.
export const LIST_ORDERS_D4_DATE = listOrdersDate(ORDER_SELECT_ALL, ORDER_SELECT_DATE);
// Part 2: the same method with the stored price.
export const LIST_ORDERS_D4_PAID = listOrdersDate(ORDER_SELECT_ALL_PAID, ORDER_SELECT_DATE_PAID);

const getOrder = (total: string) => `@GetMapping("/api/orders/{id}")
public Order getOrder(@PathVariable int id) {
    return jdbc.sql("""
        SELECT sales.sale_id AS order_id, sales.snack_id, snacks.name,
               sales.qty, ${total}
        FROM sales
        INNER JOIN snacks ON sales.snack_id = snacks.snack_id
        WHERE sales.sale_id = ?
        """)
        .param(id)
        .query(Order.class)
        .optional()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No order with id " + id));
}`;

export const GET_ORDER_D4 = getOrder(TOTAL_TODAY);
export const GET_ORDER_D4_PAID = getOrder(TOTAL_PAID);

// Day 4 final placeOrder: no Java list any more.
export const PLACE_ORDER_D4 = `@PostMapping("/api/orders")
@ResponseStatus(HttpStatus.CREATED)
public Order placeOrder(@RequestBody OrderRequest request) {
${indent(QTY_CHECK)}
    Snack snack = getSnack(request.snack_id());
${indent(INSERT_BLOCK)}
    return new Order(newId, snack.snack_id(), snack.name(), request.qty(), snack.price() * request.qty());
}`;

// Part 2: the price on the day is stored with the sale.
export const INSERT_BLOCK_PAID = `KeyHolder keys = new GeneratedKeyHolder();
jdbc.sql("INSERT INTO sales (snack_id, sold_on, qty, price_paid) VALUES (?, CURRENT_DATE, ?, ?)")
    .param(snack.snack_id())
    .param(request.qty())
    .param(snack.price())
    .update(keys);
int newId = keys.getKey().intValue();`;

export const PLACE_ORDER_D4_PAID = `@PostMapping("/api/orders")
@ResponseStatus(HttpStatus.CREATED)
public Order placeOrder(@RequestBody OrderRequest request) {
${indent(QTY_CHECK)}
    Snack snack = getSnack(request.snack_id());
${indent(INSERT_BLOCK_PAID)}
    return new Order(newId, snack.snack_id(), snack.name(), request.qty(), snack.price() * request.qty());
}`;

// summary() needs listOrders(): after the ?date= step it is listOrders(null).
export const SUMMARY_D4 = `@GetMapping("/api/summary")
public Summary summary() {
    List<Order> all = listOrders(null);
    int sales = 0;
    for (Order o : all) {
        sales = sales + o.total();
    }
    return new Summary(all.size(), sales);
}`;

// Before the ?date= step, summary() calls listOrders().
export const SUMMARY_D4_NO_DATE = SUMMARY_D4.replace("listOrders(null)", "listOrders()");

// Day 5, Part 2: today's special, from SQL table to Java record and endpoint to the home page.
export const SPECIAL_RECORD = "record Special(int snack_id, String name, int price, int special_price) {\n}";

export const SPECIAL_METHOD = `@GetMapping("/api/special")
public Special special() {
    return jdbc.sql("""
        SELECT specials.snack_id, snacks.name, snacks.price, specials.special_price
        FROM specials
        INNER JOIN snacks ON specials.snack_id = snacks.snack_id
        ORDER BY specials.special_id DESC
        LIMIT 1
        """)
        .query(Special.class)
        .optional()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No special today"));
}`;

export const SPECIALS_CREATE = `CREATE TABLE specials (
  special_id INT PRIMARY KEY AUTO_INCREMENT,
  snack_id INT,
  special_price INT,
  FOREIGN KEY (snack_id) REFERENCES snacks (snack_id)
);`;

export const SPECIAL_INSERT = `INSERT INTO specials (snack_id, special_price) VALUES (${LAB_SNACK_ID}, 7);`;

export const SQL_SPECIAL = `SELECT specials.snack_id, snacks.name, snacks.price, specials.special_price
FROM specials
INNER JOIN snacks ON specials.snack_id = snacks.snack_id
ORDER BY specials.special_id DESC
LIMIT 1;`;

// index.js: Week 5's typed special (a name, a price) becomes the answer of /api/special.
export const INDEX_SPECIAL_OLD = `const special = "Turon";
const price = 12;
document.getElementById("special").textContent = \`Today's special: \${special} — ₱\${price}\`;`;

export const INDEX_SPECIAL_NEW = `fetch("/api/special")
  .then(response => {
    response.json().then(data => {
      if (response.ok) {
        document.getElementById("special").textContent = \`Today's special: \${data.name} — ₱\${data.special_price}\`;
      } else {
        document.getElementById("special").textContent = "No special today.";
      }
    });
  })
  .catch(error => console.error(error));`;

// ---- Whole-file stages ------------------------------------------------------

const IMP = {
  list: "import java.util.List;",
  arrayList: "import java.util.ArrayList;",
  dup: "import org.springframework.dao.DuplicateKeyException;",
  http: "import org.springframework.http.HttpStatus;",
  jdbc: "import org.springframework.jdbc.core.simple.JdbcClient;",
  keys: "import org.springframework.jdbc.support.GeneratedKeyHolder;\nimport org.springframework.jdbc.support.KeyHolder;",
  web: [
    "import org.springframework.web.bind.annotation.GetMapping;",
    "import org.springframework.web.bind.annotation.PathVariable;",
    "import org.springframework.web.bind.annotation.PostMapping;",
    "import org.springframework.web.bind.annotation.RequestBody;",
    "import org.springframework.web.bind.annotation.RequestParam;",
    "import org.springframework.web.bind.annotation.ResponseStatus;",
    "import org.springframework.web.bind.annotation.RestController;",
    "import org.springframework.web.server.ResponseStatusException;",
  ].join("\n"),
};

const file = (imports: string[], body: string[]) =>
  `${imports.join("\n")}\n\n@RestController\npublic class SnackController {\n\n${body.join("\n\n")}\n}`;

const infoRecord = indent(CANTEEN_INFO_RECORD);

export const NEW_IMPORT_JDBC = IMP.jdbc;
export const NEW_IMPORTS_KEYS = IMP.keys;
export const NEW_IMPORT_DUP = IMP.dup;

// End of Day 1, Part 1.
export const CONTROLLER_D1A = file(
  [IMP.arrayList, IMP.list, "", IMP.http, IMP.jdbc, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    indent(SNACKS_FIELD_W7),
    "    " + ORDERS_FIELD_W7,
    indent(LIST_SNACKS_D1),
    indent(INFO_METHOD),
    indent(GET_SNACK_W7),
    indent(LIST_ORDERS_W7),
    indent(PLACE_ORDER_W7),
    indent(GET_ORDER_W7),
    indent(SUMMARY_W7),
  ],
);

// End of Day 1 (Part 2 adds /api/sales).
export const CONTROLLER_D1 = file(
  [IMP.arrayList, IMP.list, "", IMP.http, IMP.jdbc, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    indent(SNACKS_FIELD_W7),
    "    " + ORDERS_FIELD_W7,
    indent(LIST_SNACKS_D1),
    indent(INFO_METHOD),
    indent(GET_SNACK_W7),
    indent(LIST_SALES),
    indent(LIST_ORDERS_W7),
    indent(PLACE_ORDER_W7),
    indent(GET_ORDER_W7),
    indent(SUMMARY_W7),
  ],
);

// End of Day 2, Part 1.
export const CONTROLLER_D2A = file(
  [IMP.arrayList, IMP.list, "", IMP.http, IMP.jdbc, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    "    " + ORDERS_FIELD_W7,
    indent(LIST_SNACKS_D2),
    indent(INFO_METHOD),
    indent(GET_SNACK_D2),
    indent(FIND_SAFE),
    indent(LIST_SALES),
    indent(LIST_ORDERS_W7),
    indent(PLACE_ORDER_W7),
    indent(GET_ORDER_W7),
    indent(SUMMARY_W7),
  ],
);

// End of Day 2 (Part 2: name search and the sort whitelist).
export const CONTROLLER_D2 = file(
  [IMP.arrayList, IMP.list, "", IMP.http, IMP.jdbc, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    "    " + ORDERS_FIELD_W7,
    indent(LIST_SNACKS_D2B),
    indent(INFO_METHOD),
    indent(GET_SNACK_D2),
    indent(FIND_SAFE),
    indent(LIST_SALES),
    indent(LIST_ORDERS_W7),
    indent(PLACE_ORDER_W7),
    indent(GET_ORDER_W7),
    indent(SUMMARY_W7),
  ],
);

// End of Day 3, Part 1.
export const CONTROLLER_D3A = file(
  [IMP.arrayList, IMP.list, "", IMP.http, IMP.jdbc, IMP.keys, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    "    " + ORDERS_FIELD_W7,
    indent(LIST_SNACKS_D2B),
    indent(INFO_METHOD),
    indent(GET_SNACK_D2),
    indent(FIND_SAFE),
    indent(LIST_SALES),
    indent(LIST_ORDERS_W7),
    indent(PLACE_ORDER_D3),
    indent(GET_ORDER_W7),
    indent(SUMMARY_W7),
  ],
);

// End of Day 3 (Part 2: POST /api/snacks).
export const CONTROLLER_D3 = file(
  [IMP.arrayList, IMP.list, "", IMP.dup, IMP.http, IMP.jdbc, IMP.keys, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    "    " + ORDERS_FIELD_W7,
    indent(LIST_SNACKS_D2B),
    indent(INFO_METHOD),
    indent(GET_SNACK_D2),
    indent(ADD_SNACK),
    indent(FIND_SAFE),
    indent(LIST_SALES),
    indent(LIST_ORDERS_W7),
    indent(PLACE_ORDER_D3),
    indent(GET_ORDER_W7),
    indent(SUMMARY_W7),
  ],
);

// End of Day 4, Part 1: no Java lists left; totals still use today's price.
export const CONTROLLER_D4A = file(
  [IMP.list, "", IMP.dup, IMP.http, IMP.jdbc, IMP.keys, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    indent(LIST_SNACKS_D2B),
    indent(INFO_METHOD),
    indent(GET_SNACK_D2),
    indent(ADD_SNACK),
    indent(FIND_SAFE),
    indent(LIST_SALES),
    indent(LIST_ORDERS_D4_DATE),
    indent(PLACE_ORDER_D4),
    indent(GET_ORDER_D4),
    indent(SUMMARY_D4),
  ],
);

// End of Day 4 (Part 2: the price on the day is stored with the sale).
export const CONTROLLER_D4 = file(
  [IMP.list, "", IMP.dup, IMP.http, IMP.jdbc, IMP.keys, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    indent(LIST_SNACKS_D2B),
    indent(INFO_METHOD),
    indent(GET_SNACK_D2),
    indent(ADD_SNACK),
    indent(FIND_SAFE),
    indent(LIST_SALES),
    indent(LIST_ORDERS_D4_PAID),
    indent(PLACE_ORDER_D4_PAID),
    indent(GET_ORDER_D4_PAID),
    indent(SUMMARY_D4),
  ],
);

// End of Day 5 (Part 2: today's special).
export const CONTROLLER_D5 = file(
  [IMP.list, "", IMP.dup, IMP.http, IMP.jdbc, IMP.keys, IMP.web],
  [
    indent(JDBC_FIELD),
    infoRecord,
    indent(SPECIAL_RECORD),
    indent(LIST_SNACKS_D2B),
    indent(INFO_METHOD),
    indent(GET_SNACK_D2),
    indent(ADD_SNACK),
    indent(FIND_SAFE),
    indent(LIST_SALES),
    indent(LIST_ORDERS_D4_PAID),
    indent(PLACE_ORDER_D4_PAID),
    indent(GET_ORDER_D4_PAID),
    indent(SUMMARY_D4),
    indent(SPECIAL_METHOD),
  ],
);

// ---- Day 5: RowsController --------------------------------------------------
// The model below is the canteen's own JOIN. Students use THEIR Week 3 query
// and THEIR rows.json keys, plus one new first column labelled `id` (their child
// table's primary key); this one exists so the shape can be verified.
export const ROWS_CONTROLLER_MODEL = `import java.util.List;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RowsController {

    record Row(int id, String name, int price, String sold_on) {
    }

    private final JdbcClient jdbc;

    public RowsController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/api/rows")
    public List<Row> rows() {
        return jdbc.sql("""
            SELECT sales.sale_id AS id, snacks.name, snacks.price, sales.sold_on
            FROM sales
            INNER JOIN snacks ON sales.snack_id = snacks.snack_id
            ORDER BY sales.sale_id
            """)
            .query(Row.class)
            .list();
    }
}`;
