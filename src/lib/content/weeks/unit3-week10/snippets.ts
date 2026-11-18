// unit3-week10 — the Java, SQL and page code the week's labs type, as constants.
//
// Week 10 starts from Week 9's FINAL controller (`CONTROLLER_D5` in
// ../unit3-week9/snippets.ts). Days 1 to 3 change it by anchored splicing (every
// splice throws if its anchor is missing or appears a different number of times
// than expected); Day 4 moves the SQL into repositories, which rewrites the
// controller, so Day 4's controller is written as whole method strings (one
// constant per method); Day 5 splices again. Every stage was extracted from this
// module, compiled against Spring Boot 4.1.1 and a real MySQL 8.0 ledger, and
// probed (see docs/agent/log/2026-11-18-week10-*.md).
//
// Stage names (A, B, C are a lab's earlier versions; no letter is the day's final):
//   CONTROLLER_D1A  the soft-delete filter on the plain list only          (the first version)
//   CONTROLLER_D1B  + GET and PUT /api/snacks/{id}/available (still the first-version filter)
//   CONTROLLER_D1C  the filter on every path that reads snacks
//   CONTROLLER_D1   + 409 when an order names a snack that is off the menu  (Day 1 final)
//   CONTROLLER_D3   + GET /api/staff/snacks                                 (Day 2 changes no Java)
//   CONTROLLER_D4   the controller split into three repositories            (Day 4 final)
//   CONTROLLER_D5   + canteen_info behind GET /api/info                     (Week 10 FINAL)

import {
  CONTROLLER_D5 as W9_FINAL,
  LAB_SNACK_ID,
  indent,
  ORDERS_HTML_D3,
  ORDERS_HEAD_LINES,
  ORDERS_SHOW_D3,
  EDIT_SNACK_HTML_D4,
  EDIT_SNACK_JS_D4,
  SPECIAL_HTML,
  SPECIAL_JS,
  EDIT_SNACK_JS_TOP,
} from "../unit3-week9/snippets";
import { ORDERS_JS_START, ORDER_JS_V2, ORDER_OPTIONS_FETCH } from "../unit3-week7/day5";
import { ADD_SNACK_HTML, INDEX_SPECIAL_NEW } from "../unit3-week8/snippets";

export { indent, LAB_SNACK_ID, W9_FINAL };
export const LAB_SNACK = "Kutsinta";

// ---- splice helpers (each throws unless the anchor appears exactly `times` times) ----

const replaceExactly = (code: string, from: string, to: string, times = 1) => {
  const n = code.split(from).length - 1;
  if (n !== times) throw new Error(`anchor appears ${n} times, expected ${times}: ${from}`);
  return code.split(from).join(to);
};
const insertAfter = (code: string, anchor: string, add: string) => replaceExactly(code, anchor, `${anchor}\n${add}`);
/** Adds methods as the last members of the class (just above its closing brace). */
const addMethods = (code: string, ...blocks: string[]) => {
  if (!code.endsWith("\n}")) throw new Error("controller must end with a closing brace");
  return `${code.slice(0, -2)}\n\n${blocks.map(indent).join("\n\n")}\n}`;
};

// ---- SQL the labs run ------------------------------------------------------

export const SQL_ADD_AVAILABLE = "ALTER TABLE snacks ADD COLUMN available BOOLEAN NOT NULL DEFAULT TRUE;";
export const SQL_SEE_AVAILABLE = "SELECT * FROM snacks;";
export const SQL_DESCRIBE_SNACKS = "DESCRIBE snacks;";
export const SQL_PRACTICE_SNACK = "INSERT INTO snacks (snack_id, name, price) VALUES (8000, 'Practice', 9);";
export const SQL_RETIRE_PRACTICE = "UPDATE snacks SET available = FALSE WHERE snack_id = 8000;";
export const SQL_RESTORE_PRACTICE = "UPDATE snacks SET available = TRUE WHERE snack_id = 8000;";
export const SQL_CLEAN_PRACTICE = "DELETE FROM snacks WHERE snack_id = 8000;";
export const SQL_MENU_ONLY_AVAILABLE = "SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY snack_id;";
/** The one recovery statement for an UPDATE that took the whole menu off: a WHERE written on purpose, every row has a number above 0. */
export const SQL_RESTORE_MENU = "UPDATE snacks SET available = TRUE WHERE snack_id > 0;";
export const SQL_CLEAN_CHECKS = "DELETE FROM snacks WHERE name LIKE 'Check %';";
/** First, if a wrong app ever let a sale be written for a Check snack (the foreign key would then refuse the cleanup above). */
export const SQL_CLEAN_CHECK_SALES = "DELETE FROM sales WHERE snack_id IN (SELECT snack_id FROM snacks WHERE name LIKE 'Check %');";
export const SQL_CANTEEN_INFO_CREATE = `CREATE TABLE canteen_info (
  info_id INT PRIMARY KEY,
  name VARCHAR(50),
  opens VARCHAR(10),
  closes VARCHAR(10)
);`;
export const SQL_CANTEEN_INFO_INSERT = "INSERT INTO canteen_info (info_id, name, opens, closes) VALUES (1, 'Aling Nena''s Canteen', '7:00', '16:00');";
export const SQL_CANTEEN_INFO_LATE = "UPDATE canteen_info SET closes = '16:30' WHERE info_id = 1;";
export const SQL_CANTEEN_INFO_BACK = "UPDATE canteen_info SET closes = '16:00' WHERE info_id = 1;";

// ---- Day 1: soft delete -----------------------------------------------------

const PLAIN_OLD = '"SELECT snack_id, name, price FROM snacks ORDER BY snack_id"';
const PLAIN_NEW = '"SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY snack_id"';

const filterPlain = (c: string) => replaceExactly(c, PLAIN_OLD, PLAIN_NEW);
const filterRest = (c: string) => {
  let out = replaceExactly(c, '"SELECT snack_id, name, price FROM snacks WHERE name LIKE ? ORDER BY snack_id"', '"SELECT snack_id, name, price FROM snacks WHERE name LIKE ? AND available = TRUE ORDER BY snack_id"');
  out = replaceExactly(out, '"SELECT snack_id, name, price FROM snacks ORDER BY price, snack_id"', '"SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY price, snack_id"');
  out = replaceExactly(out, '"SELECT snack_id, name, price FROM snacks ORDER BY name"', '"SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY name"');
  out = replaceExactly(out, '"SELECT snack_id, name, price FROM snacks WHERE price <= ? ORDER BY snack_id"', '"SELECT snack_id, name, price FROM snacks WHERE price <= ? AND available = TRUE ORDER BY snack_id"');
  out = replaceExactly(out, '"SELECT snack_id, name, price FROM snacks WHERE name = ?"', '"SELECT snack_id, name, price FROM snacks WHERE name = ? AND available = TRUE"');
  // GET /api/special and newestSpecialId() share one FROM; both get the same line
  out = replaceExactly(out, "INNER JOIN snacks ON specials.snack_id = snacks.snack_id\n", "INNER JOIN snacks ON specials.snack_id = snacks.snack_id\n            WHERE snacks.available = TRUE\n", 2);
  return out;
};

/** One entry per path that reads snacks, for the lab that lists them. */
export const FILTERED_PATHS = [
  { path: "GET /api/snacks", sql: PLAIN_NEW },
  { path: "GET /api/snacks?name=", sql: '"SELECT snack_id, name, price FROM snacks WHERE name LIKE ? AND available = TRUE ORDER BY snack_id"' },
  { path: "GET /api/snacks?sort=price", sql: '"SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY price, snack_id"' },
  { path: "GET /api/snacks?sort=name", sql: '"SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY name"' },
  { path: "GET /api/snacks?maxPrice=", sql: '"SELECT snack_id, name, price FROM snacks WHERE price <= ? AND available = TRUE ORDER BY snack_id"' },
  { path: "GET /api/find?name=", sql: '"SELECT snack_id, name, price FROM snacks WHERE name = ? AND available = TRUE"' },
];
export const FILTER_PLAIN_LINE = PLAIN_NEW;
export const FILTER_PLAIN_WAS = PLAIN_OLD;

export const AVAILABLE_RECORDS = `record AvailableChange(boolean available) {
}

record Availability(int snack_id, boolean available) {
}`;

export const GET_AVAILABLE = `@GetMapping("/api/snacks/{id}/available")
public Availability getAvailable(@PathVariable int id) {
    return jdbc.sql("SELECT snack_id, available FROM snacks WHERE snack_id = ?")
        .param(id)
        .query(Availability.class)
        .optional()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id));
}`;

export const SET_AVAILABLE = `@PutMapping("/api/snacks/{id}/available")
public Availability setAvailable(@PathVariable int id, @RequestBody AvailableChange change) {
    int changed = jdbc.sql("UPDATE snacks SET available = ? WHERE snack_id = ?")
        .param(change.available())
        .param(id)
        .update();
    if (changed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);
    }
    return new Availability(id, change.available());
}`;

const ORDER_REFUSE_OLD = "        Snack snack = getSnack(request.snack_id());\n";
const ORDER_REFUSE = `        Snack snack = getSnack(request.snack_id());
        boolean available = jdbc.sql("SELECT available FROM snacks WHERE snack_id = ?")
            .param(snack.snack_id())
            .query(Boolean.class)
            .single();
        if (!available) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Snack " + snack.snack_id() + " is not available");
        }
`;
/** The lines Day 1 adds under getSnack(...) in placeOrder, as the lab types them (unindented). */
export const ORDER_REFUSE_LINES = ORDER_REFUSE.split("\n")
  .slice(1, -1)
  .map((l) => l.slice(8))
  .join("\n");

export const CONTROLLER_W9 = W9_FINAL;
export const CONTROLLER_D1A = filterPlain(W9_FINAL);
export const CONTROLLER_D1B = addMethods(CONTROLLER_D1A, AVAILABLE_RECORDS, GET_AVAILABLE, SET_AVAILABLE);
export const CONTROLLER_D1C = filterRest(CONTROLLER_D1B);
export const CONTROLLER_D1 = replaceExactly(CONTROLLER_D1C, ORDER_REFUSE_OLD, ORDER_REFUSE);

// ---- Day 3: the staff list ---------------------------------------------------

export const STAFF_SNACK_RECORD = "public record StaffSnack(int snack_id, String name, int price, boolean available) {\n}";
export const STAFF_LIST = `@GetMapping("/api/staff/snacks")
public List<StaffSnack> staffSnacks() {
    return jdbc.sql("SELECT snack_id, name, price, available FROM snacks ORDER BY snack_id")
        .query(StaffSnack.class)
        .list();
}`;
export const CONTROLLER_D3 = addMethods(CONTROLLER_D1, STAFF_LIST);

// ---- Day 4: repositories ------------------------------------------------------

export const SPECIAL_RECORD_FILE = "public record Special(int snack_id, String name, int price, int special_price) {\n}";
export const CANTEEN_INFO_FILE = "public record CanteenInfo(String name, String opens, String closes) {\n}";

const PKG = "package com.example.canteen;";
const repoFile = (imports: string[], body: string) => `${PKG}\n\n${imports.join("\n")}\n\n${body}`;
const IMP = {
  list: "import java.util.List;",
  optional: "import java.util.Optional;",
  jdbc: "import org.springframework.jdbc.core.simple.JdbcClient;",
  repo: "import org.springframework.stereotype.Repository;",
  keys: "import org.springframework.jdbc.support.GeneratedKeyHolder;\nimport org.springframework.jdbc.support.KeyHolder;",
};

const SNACK_REPOSITORY_BODY = `@Repository
public class SnackRepository {

    private final JdbcClient jdbc;

    public SnackRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Snack> listAvailable() {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY snack_id")
            .query(Snack.class)
            .list();
    }

    public List<Snack> searchAvailable(String text) {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE name LIKE ? AND available = TRUE ORDER BY snack_id")
            .param("%" + text + "%")
            .query(Snack.class)
            .list();
    }

    public List<Snack> listAvailableByPrice() {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY price, snack_id")
            .query(Snack.class)
            .list();
    }

    public List<Snack> listAvailableByName() {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE available = TRUE ORDER BY name")
            .query(Snack.class)
            .list();
    }

    public List<Snack> listAvailableUpTo(int maxPrice) {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE price <= ? AND available = TRUE ORDER BY snack_id")
            .param(maxPrice)
            .query(Snack.class)
            .list();
    }

    public List<Snack> findAvailableNamed(String name) {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE name = ? AND available = TRUE")
            .param(name)
            .query(Snack.class)
            .list();
    }

    public List<StaffSnack> listAll() {
        return jdbc.sql("SELECT snack_id, name, price, available FROM snacks ORDER BY snack_id")
            .query(StaffSnack.class)
            .list();
    }

    public Optional<Snack> findById(int id) {
        return jdbc.sql("SELECT snack_id, name, price FROM snacks WHERE snack_id = ?")
            .param(id)
            .query(Snack.class)
            .optional();
    }

    public Optional<Boolean> isAvailable(int id) {
        return jdbc.sql("SELECT available FROM snacks WHERE snack_id = ?")
            .param(id)
            .query(Boolean.class)
            .optional();
    }

    public void insert(Snack snack) {
        jdbc.sql("INSERT INTO snacks (snack_id, name, price) VALUES (?, ?, ?)")
            .param(snack.snack_id())
            .param(snack.name())
            .param(snack.price())
            .update();
    }

    public int update(int id, String name, int price) {
        return jdbc.sql("UPDATE snacks SET name = ?, price = ? WHERE snack_id = ?")
            .param(name)
            .param(price)
            .param(id)
            .update();
    }

    public int setAvailable(int id, boolean available) {
        return jdbc.sql("UPDATE snacks SET available = ? WHERE snack_id = ?")
            .param(available)
            .param(id)
            .update();
    }

    public int delete(int id) {
        return jdbc.sql("DELETE FROM snacks WHERE snack_id = ?")
            .param(id)
            .update();
    }
}`;

const ORDER_COLUMNS = `SELECT sales.sale_id AS order_id, sales.snack_id, snacks.name,
       sales.qty, sales.qty * COALESCE(sales.price_paid, snacks.price) AS total
FROM sales
INNER JOIN snacks ON sales.snack_id = snacks.snack_id`;
const inBlock = (sql: string, pad: number) =>
  sql
    .split("\n")
    .map((l) => (l ? " ".repeat(pad) + l : l))
    .join("\n");

const ORDER_REPOSITORY_BODY = `@Repository
public class OrderRepository {

    private final JdbcClient jdbc;

    public OrderRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<Order> listAll() {
        return jdbc.sql("""
${inBlock(ORDER_COLUMNS + "\nORDER BY sales.sale_id", 12)}
            """)
            .query(Order.class)
            .list();
    }

    public List<Order> listOn(String date) {
        return jdbc.sql("""
${inBlock(ORDER_COLUMNS + "\nWHERE sales.sold_on = ?\nORDER BY sales.sale_id", 12)}
            """)
            .param(date)
            .query(Order.class)
            .list();
    }

    public Optional<Order> findById(int id) {
        return jdbc.sql("""
${inBlock(ORDER_COLUMNS + "\nWHERE sales.sale_id = ?", 12)}
            """)
            .param(id)
            .query(Order.class)
            .optional();
    }

    public List<Sale> listSales() {
        return jdbc.sql("SELECT sale_id, snack_id, sold_on, qty FROM sales ORDER BY sale_id")
            .query(Sale.class)
            .list();
    }

    public int insert(int snackId, int qty, int pricePaid) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.sql("INSERT INTO sales (snack_id, sold_on, qty, price_paid) VALUES (?, CURRENT_DATE, ?, ?)")
            .param(snackId)
            .param(qty)
            .param(pricePaid)
            .update(keys);
        return keys.getKey().intValue();
    }

    public int changeQty(int id, int qty) {
        return jdbc.sql("UPDATE sales SET qty = ? WHERE sale_id = ? AND snack_id IS NOT NULL")
            .param(qty)
            .param(id)
            .update();
    }

    public int cancel(int id) {
        return jdbc.sql("DELETE FROM sales WHERE sale_id = ? AND snack_id IS NOT NULL")
            .param(id)
            .update();
    }
}`;

const SPECIAL_JOIN = `FROM specials
INNER JOIN snacks ON specials.snack_id = snacks.snack_id
WHERE snacks.available = TRUE
ORDER BY specials.special_id DESC
LIMIT 1`;
const SPECIAL_REPOSITORY_BODY = `@Repository
public class SpecialRepository {

    private final JdbcClient jdbc;

    public SpecialRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Special> newest() {
        return jdbc.sql("""
${inBlock("SELECT specials.snack_id, snacks.name, snacks.price, specials.special_price\n" + SPECIAL_JOIN, 12)}
            """)
            .query(Special.class)
            .optional();
    }

    public Optional<Integer> newestId() {
        return jdbc.sql("""
${inBlock("SELECT specials.special_id\n" + SPECIAL_JOIN, 12)}
            """)
            .query(Integer.class)
            .optional();
    }

    public int setPrice(int specialId, int price) {
        return jdbc.sql("UPDATE specials SET special_price = ? WHERE special_id = ?")
            .param(price)
            .param(specialId)
            .update();
    }

    public int delete(int specialId) {
        return jdbc.sql("DELETE FROM specials WHERE special_id = ?")
            .param(specialId)
            .update();
    }
}`;

export const SNACK_REPOSITORY = repoFile([IMP.list, IMP.optional, "", IMP.jdbc, IMP.repo], SNACK_REPOSITORY_BODY);
export const ORDER_REPOSITORY = repoFile([IMP.list, IMP.optional, "", IMP.jdbc, IMP.keys, IMP.repo], ORDER_REPOSITORY_BODY);
export const SPECIAL_REPOSITORY = repoFile([IMP.optional, "", IMP.jdbc, IMP.repo], SPECIAL_REPOSITORY_BODY);
/** The clinic's broken file: the annotation (and its import) forgotten. */
export const SNACK_REPOSITORY_NO_ANNOTATION = replaceExactly(
  replaceExactly(SNACK_REPOSITORY, "\nimport org.springframework.stereotype.Repository;", ""),
  "@Repository\n",
  "",
);
/** The clinic's wrong-count file: delete() runs the DELETE but answers 1 whatever happened. */
export const SNACK_REPOSITORY_WRONG_COUNT = replaceExactly(
  SNACK_REPOSITORY,
  `    public int delete(int id) {
        return jdbc.sql("DELETE FROM snacks WHERE snack_id = ?")
            .param(id)
            .update();
    }`,
  `    public int delete(int id) {
        jdbc.sql("DELETE FROM snacks WHERE snack_id = ?")
            .param(id)
            .update();
        return 1;
    }`,
);

export const REPOSITORY_FILES: Record<string, string> = {
  "SnackRepository.java": SNACK_REPOSITORY,
  "OrderRepository.java": ORDER_REPOSITORY,
  "SpecialRepository.java": SPECIAL_REPOSITORY,
};

const D4_IMPORTS = `import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;`;

/** The fields and constructor of the finished controller: three repositories, no JdbcClient. */
export const D4_FINAL_CONSTRUCTOR = `private final SnackRepository snacks;
private final OrderRepository orders;
private final SpecialRepository specials;

public SnackController(SnackRepository snacks, OrderRepository orders, SpecialRepository specials) {
    this.snacks = snacks;
    this.orders = orders;
    this.specials = specials;
}`;

/** The same, while the controller still holds its JdbcClient (the middle of the lab: some methods moved, some not). */
export const D4_MIGRATING_CONSTRUCTOR = `private final JdbcClient jdbc;
private final SnackRepository snacks;
private final OrderRepository orders;
private final SpecialRepository specials;

public SnackController(JdbcClient jdbc, SnackRepository snacks, OrderRepository orders, SpecialRepository specials) {
    this.jdbc = jdbc;
    this.snacks = snacks;
    this.orders = orders;
    this.specials = specials;
}`;

/** What Week 9's controller starts with, which the migrating constructor replaces. */
export const D4_OLD_CONSTRUCTOR = `private final JdbcClient jdbc;

public SnackController(JdbcClient jdbc) {
    this.jdbc = jdbc;
}`;

export const CONTROLLER_D4_HEAD = `@RestController
public class SnackController {

${indent(D4_FINAL_CONSTRUCTOR)}

    record AvailableChange(boolean available) {
    }

    record Availability(int snack_id, boolean available) {
    }

    record SnackChange(String name, int price) {
    }

    record OrderChange(int qty) {
    }

    record SpecialChange(int special_price) {
    }`;

export const D4_METHODS: Record<string, string> = {
  listSnacks: `@GetMapping("/api/snacks")
public List<Snack> listSnacks(
        @RequestParam(required = false) Integer maxPrice,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String sort) {
    if (name != null) {
        return snacks.searchAvailable(name);
    }
    if (sort != null) {
        if (sort.equals("price")) {
            return snacks.listAvailableByPrice();
        } else if (sort.equals("name")) {
            return snacks.listAvailableByName();
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sort must be price or name");
    }
    if (maxPrice == null) {
        return snacks.listAvailable();
    }
    return snacks.listAvailableUpTo(maxPrice);
}`,
  info: `@GetMapping("/api/info")
public CanteenInfo info() {
    return new CanteenInfo("Aling Nena's Canteen", "7:00", "16:00");
}`,
  getSnack: `@GetMapping("/api/snacks/{id}")
public Snack getSnack(@PathVariable int id) {
    return snacks.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id));
}`,
  addSnack: `@PostMapping("/api/snacks")
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
        snacks.insert(snack);
    } catch (DuplicateKeyException e) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Snack " + snack.snack_id() + " already exists");
    }
    return snack;
}`,
  findByName: `@GetMapping("/api/find")
public List<Snack> findByName(@RequestParam String name) {
    return snacks.findAvailableNamed(name);
}`,
  listSales: `@GetMapping("/api/sales")
public List<Sale> listSales() {
    return orders.listSales();
}`,
  listOrders: `@GetMapping("/api/orders")
public List<Order> listOrders(@RequestParam(required = false) String date) {
    if (date == null) {
        return orders.listAll();
    }
    return orders.listOn(date);
}`,
  placeOrder: `@PostMapping("/api/orders")
@ResponseStatus(HttpStatus.CREATED)
public Order placeOrder(@RequestBody OrderRequest request) {
    if (request.qty() < 1 || request.qty() > 20) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "qty must be from 1 to 20");
    }
    Snack snack = getSnack(request.snack_id());
    boolean available = snacks.isAvailable(snack.snack_id()).orElse(false);
    if (!available) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Snack " + snack.snack_id() + " is not available");
    }
    int newId = orders.insert(snack.snack_id(), request.qty(), snack.price());
    return new Order(newId, snack.snack_id(), snack.name(), request.qty(), snack.price() * request.qty());
}`,
  getOrder: `@GetMapping("/api/orders/{id}")
public Order getOrder(@PathVariable int id) {
    return orders.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No order with id " + id));
}`,
  summary: `@GetMapping("/api/summary")
public Summary summary() {
    List<Order> all = listOrders(null);
    int sales = 0;
    for (Order o : all) {
        sales = sales + o.total();
    }
    return new Summary(all.size(), sales);
}`,
  special: `@GetMapping("/api/special")
public Special special() {
    return specials.newest()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No special today"));
}`,
  updateSnack: `@PutMapping("/api/snacks/{id}")
public Snack updateSnack(@PathVariable int id, @RequestBody SnackChange change) {
    if (change.name() == null || change.name().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must not be blank");
    }
    if (change.name().length() > 50) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name must be at most 50 characters");
    }
    if (change.price() < 1 || change.price() > 1000) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "price must be from 1 to 1000");
    }
    int changed = snacks.update(id, change.name(), change.price());
    if (changed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);
    }
    return new Snack(id, change.name(), change.price());
}`,
  updateOrder: `@PutMapping("/api/orders/{id}")
public Order updateOrder(@PathVariable int id, @RequestBody OrderChange change) {
    if (change.qty() < 1 || change.qty() > 20) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "qty must be from 1 to 20");
    }
    int changed = orders.changeQty(id, change.qty());
    if (changed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No order with id " + id);
    }
    return getOrder(id);
}`,
  cancelOrder: `@DeleteMapping("/api/orders/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void cancelOrder(@PathVariable int id) {
    int removed = orders.cancel(id);
    if (removed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No order with id " + id);
    }
}`,
  deleteSnack: `@DeleteMapping("/api/snacks/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteSnack(@PathVariable int id) {
    int removed;
    try {
        removed = snacks.delete(id);
    } catch (DataIntegrityViolationException e) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Snack " + id + " is used by a sale or a special");
    }
    if (removed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);
    }
}`,
  newestSpecialId: `private int newestSpecialId() {
    return specials.newestId()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No special today"));
}`,
  updateSpecial: `@PutMapping("/api/special")
public Special updateSpecial(@RequestBody SpecialChange change) {
    if (change.special_price() < 1 || change.special_price() > 1000) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "special_price must be from 1 to 1000");
    }
    int specialId = newestSpecialId();
    specials.setPrice(specialId, change.special_price());
    return special();
}`,
  removeSpecial: `@DeleteMapping("/api/special")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void removeSpecial() {
    int specialId = newestSpecialId();
    int removed = specials.delete(specialId);
    if (removed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No special today");
    }
}`,
  getAvailable: `@GetMapping("/api/snacks/{id}/available")
public Availability getAvailable(@PathVariable int id) {
    boolean available = snacks.isAvailable(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id));
    return new Availability(id, available);
}`,
  setAvailable: `@PutMapping("/api/snacks/{id}/available")
public Availability setAvailable(@PathVariable int id, @RequestBody AvailableChange change) {
    int changed = snacks.setAvailable(id, change.available());
    if (changed == 0) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No snack with id " + id);
    }
    return new Availability(id, change.available());
}`,
  staffSnacks: `@GetMapping("/api/staff/snacks")
public List<StaffSnack> staffSnacks() {
    return snacks.listAll();
}`,
};

const D4_ORDER = [
  "listSnacks", "info", "getSnack", "addSnack", "findByName", "listSales", "listOrders", "placeOrder", "getOrder", "summary", "special",
  "updateSnack", "updateOrder", "cancelOrder", "deleteSnack", "newestSpecialId", "updateSpecial", "removeSpecial", "getAvailable", "setAvailable", "staffSnacks",
];

export const CONTROLLER_D4 = `${D4_IMPORTS}\n\n${CONTROLLER_D4_HEAD}\n\n${D4_ORDER.map((k) => indent(D4_METHODS[k])).join("\n\n")}\n}`;

// ---- Day 5: the canteen_info table -------------------------------------------

export const INFO_REPOSITORY_BODY = `@Repository
public class InfoRepository {

    private final JdbcClient jdbc;

    public InfoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<CanteenInfo> find() {
        return jdbc.sql("SELECT name, opens, closes FROM canteen_info ORDER BY info_id LIMIT 1")
            .query(CanteenInfo.class)
            .optional();
    }
}`;
export const INFO_REPOSITORY = repoFile([IMP.optional, "", IMP.jdbc, IMP.repo], INFO_REPOSITORY_BODY);

export const INFO_METHOD_OLD = D4_METHODS.info;
export const INFO_METHOD_NEW = `@GetMapping("/api/info")
public CanteenInfo info() {
    return infos.find()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No canteen info"));
}`;

const D5_FIELD_OLD = "    private final SpecialRepository specials;\n";
const D5_CTOR_OLD = "    public SnackController(SnackRepository snacks, OrderRepository orders, SpecialRepository specials) {";
const D5_ASSIGN_OLD = "        this.specials = specials;\n";
export const CONTROLLER_D5 = [
  (c: string) => replaceExactly(c, indent(INFO_METHOD_OLD), indent(INFO_METHOD_NEW)),
  (c: string) => replaceExactly(c, D5_FIELD_OLD, `${D5_FIELD_OLD}    private final InfoRepository infos;\n`),
  (c: string) => replaceExactly(c, D5_CTOR_OLD, "    public SnackController(SnackRepository snacks, OrderRepository orders, SpecialRepository specials, InfoRepository infos) {"),
  (c: string) => replaceExactly(c, D5_ASSIGN_OLD, `${D5_ASSIGN_OLD}        this.infos = infos;\n`),
].reduce((code, step) => step(code), CONTROLLER_D4);

// ---- Pages -----------------------------------------------------------------

/** The first version of api.js: it works for a GET that succeeds, and for nothing else. */
export const API_JS_A = `function apiGet(path) {
  return fetch(path).then(response => response.json());
}

function apiSend(method, path, body) {
  return fetch(path, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(response => response.json());
}`;

export const API_JS_READ = `function readAnswer(response) {
  if (response.status === 204) {
    return null;
  }
  return response.json().then(data => {
    if (!response.ok) {
      throw new Error(data.message);
    }
    return data;
  });
}`;

export const API_JS_REQUEST = `function request(path, options) {
  return fetch(path, options)
    .catch(() => {
      throw new Error("Can't reach the canteen app. Is it running?");
    })
    .then(readAnswer);
}`;

export const API_JS_PUBLIC = `function apiGet(path) {
  return request(path, { method: "GET" });
}

function apiSend(method, path, body) {
  const options = { method: method };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  return request(path, options);
}`;

export const API_JS = `${API_JS_READ}\n\n${API_JS_REQUEST}\n\n${API_JS_PUBLIC}`;

/** A page's script tags: api.js first, then the page's own file. */
export const withApiScript = (html: string, script: string) =>
  replaceExactly(html, `  <script src="${script}"></script>`, `  <script src="api.js"></script>\n  <script src="${script}"></script>`);

// ---- Day 1, Part 2: the availability button on edit-snack.html ----------------

export const EDIT_SNACK_AVAILABILITY_BUTTON = `<button type="button" id="availability"></button>`;
export const EDIT_SNACK_HTML_D1 = insertAfter(EDIT_SNACK_HTML_D4, '  <button type="button" id="remove">Remove this snack</button>', `  ${EDIT_SNACK_AVAILABILITY_BUTTON}`);

export const EDIT_SNACK_JS_AVAILABILITY = `const availabilityButton = document.getElementById("availability");
let isAvailable = true;

function showAvailability() {
  fetch(\`/api/snacks/\${snackId}/available\`)
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          isAvailable = data.available;
          if (isAvailable) {
            availabilityButton.textContent = "Take off the menu";
          } else {
            availabilityButton.textContent = "Put back on the menu";
          }
        } else {
          statusLine.textContent = \`Sorry: \${data.message}\`;
        }
      });
    })
    .catch(error => console.error(error));
}

showAvailability();

availabilityButton.addEventListener("click", function () {
  fetch(\`/api/snacks/\${snackId}/available\`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ available: !isAvailable })
  })
    .then(response => {
      response.json().then(data => {
        if (response.ok) {
          if (data.available) {
            result.textContent = \`Snack \${snackId} is back on the menu.\`;
          } else {
            result.textContent = \`Snack \${snackId} is taken off the menu.\`;
          }
          showAvailability();
        } else {
          result.textContent = \`Sorry: \${data.message}\`;
        }
      });
    })
    .catch(error => console.error(error));
});`;

export const EDIT_SNACK_JS_D1 = `${EDIT_SNACK_JS_D4}\n\n${EDIT_SNACK_JS_AVAILABILITY}`;

// ---- Day 2: edit-snack.js and special.js on api.js -----------------------------

export const EDIT_SNACK_HTML_D2 = withApiScript(EDIT_SNACK_HTML_D1, "edit-snack.js");

export const EDIT_SNACK_JS_LOAD_API = `apiGet(\`/api/snacks/\${snackId}\`)
  .then(data => {
    nameBox.value = data.name;
    priceBox.value = data.price;
  })
  .catch(error => {
    statusLine.textContent = \`Sorry: \${error.message}\`;
  });`;

export const EDIT_SNACK_JS_SAVE_API = `document.getElementById("edit-form").addEventListener("submit", function (event) {
  event.preventDefault();
  apiSend("PUT", \`/api/snacks/\${snackId}\`, { name: nameBox.value, price: Number(priceBox.value) })
    .then(data => {
      result.textContent = \`Saved: \${data.name} at ₱\${data.price}\`;
    })
    .catch(error => {
      result.textContent = \`Sorry: \${error.message}\`;
    });
});`;

export const EDIT_SNACK_JS_REMOVE_API = `document.getElementById("remove").addEventListener("click", function () {
  if (!confirm(\`Remove snack \${snackId} from the menu?\`)) {
    return;
  }
  apiSend("DELETE", \`/api/snacks/\${snackId}\`)
    .then(() => {
      result.textContent = \`Snack \${snackId} is off the menu.\`;
    })
    .catch(error => {
      result.textContent = \`Sorry: \${error.message}\`;
    });
});`;

export const EDIT_SNACK_JS_AVAILABILITY_API = `const availabilityButton = document.getElementById("availability");
let isAvailable = true;

function showAvailability() {
  apiGet(\`/api/snacks/\${snackId}/available\`)
    .then(data => {
      isAvailable = data.available;
      if (isAvailable) {
        availabilityButton.textContent = "Take off the menu";
      } else {
        availabilityButton.textContent = "Put back on the menu";
      }
    })
    .catch(error => {
      statusLine.textContent = \`Sorry: \${error.message}\`;
    });
}

showAvailability();

availabilityButton.addEventListener("click", function () {
  apiSend("PUT", \`/api/snacks/\${snackId}/available\`, { available: !isAvailable })
    .then(data => {
      if (data.available) {
        result.textContent = \`Snack \${snackId} is back on the menu.\`;
      } else {
        result.textContent = \`Snack \${snackId} is taken off the menu.\`;
      }
      showAvailability();
    })
    .catch(error => {
      result.textContent = \`Sorry: \${error.message}\`;
    });
});`;

export const EDIT_SNACK_JS_D2 = `${EDIT_SNACK_JS_TOP}

${EDIT_SNACK_JS_LOAD_API}

${EDIT_SNACK_JS_SAVE_API}

${EDIT_SNACK_JS_REMOVE_API}

${EDIT_SNACK_JS_AVAILABILITY_API}`;

export const SPECIAL_HTML_D2 = withApiScript(SPECIAL_HTML, "special.js");
export const SPECIAL_JS_OLD = SPECIAL_JS;
export const SPECIAL_JS_D2 = `const current = document.getElementById("current");
const result = document.getElementById("result");
const priceBox = document.getElementById("special-price");

function showSpecial() {
  apiGet("/api/special")
    .then(data => {
      current.textContent = \`\${data.name}: ₱\${data.special_price} (usually ₱\${data.price})\`;
    })
    .catch(error => {
      current.textContent = error.message;
    });
}

showSpecial();

document.getElementById("special-form").addEventListener("submit", function (event) {
  event.preventDefault();
  apiSend("PUT", "/api/special", { special_price: Number(priceBox.value) })
    .then(data => {
      result.textContent = \`The special is now ₱\${data.special_price}\`;
      showSpecial();
    })
    .catch(error => {
      result.textContent = \`Sorry: \${error.message}\`;
    });
});

document.getElementById("remove-special").addEventListener("click", function () {
  if (!confirm("Remove today's special?")) {
    return;
  }
  apiSend("DELETE", "/api/special")
    .then(() => {
      result.textContent = "The special is removed.";
      showSpecial();
    })
    .catch(error => {
      result.textContent = \`Sorry: \${error.message}\`;
    });
});`;

// ---- Day 2, Part 2: orders.js and add-snack.js on api.js ------------------------

export const ORDERS_HTML_D2B = withApiScript(ORDERS_HTML_D3, "orders.js");

export const ORDERS_CHANGE_QTY_API = `function changeQty(orderId, newQty) {
  apiSend("PUT", \`/api/orders/\${orderId}\`, { qty: Number(newQty) })
    .then(data => {
      messageLine.textContent = \`Order \${data.order_id} now has \${data.qty} × \${data.name} = ₱\${data.total}\`;
      loadOrders();
    })
    .catch(error => {
      messageLine.textContent = \`Sorry: \${error.message}\`;
    });
}`;

export const ORDERS_CANCEL_ORDER_API = `function cancelOrder(orderId) {
  if (!confirm(\`Cancel order \${orderId}?\`)) {
    return;
  }
  apiSend("DELETE", \`/api/orders/\${orderId}\`)
    .then(() => {
      messageLine.textContent = \`Order \${orderId} is cancelled.\`;
      loadOrders();
    })
    .catch(error => {
      messageLine.textContent = \`Sorry: \${error.message}\`;
    });
}`;

export const ORDERS_LOAD_API = `function loadOrders() {
  apiGet("/api/orders")
    .then(data => showOrders(data))
    .catch(error => {
      statusLine.textContent = error.message;
    });

  apiGet("/api/summary")
    .then(data => {
      summaryLine.textContent = \`\${data.total_orders} orders · ₱\${data.total_sales} in sales\`;
    })
    .catch(error => {
      statusLine.textContent = error.message;
    });
}`;

export const ORDERS_FIND_API = `const found = document.getElementById("found");
const findId = document.getElementById("find-id");

document.getElementById("find-form").addEventListener("submit", function (event) {
  event.preventDefault();
  apiGet(\`/api/orders/\${findId.value}\`)
    .then(data => {
      found.textContent = \`Order \${data.order_id}: \${data.qty} × \${data.name} = ₱\${data.total}\`;
    })
    .catch(error => {
      found.textContent = \`Sorry: \${error.message}\`;
    });
});`;

export const ORDERS_JS_D2B = `${ORDERS_HEAD_LINES}

${ORDERS_SHOW_D3}

${ORDERS_CHANGE_QTY_API}

${ORDERS_CANCEL_ORDER_API}

${ORDERS_LOAD_API}

${ORDERS_JS_START}

${ORDERS_FIND_API}`;

export const ADD_SNACK_HTML_D2 = withApiScript(ADD_SNACK_HTML, "add-snack.js");
export const ADD_SNACK_JS_API = `const form = document.getElementById("snack-form");
const result = document.getElementById("result");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const snack = {
    snack_id: Number(document.getElementById("snack-id").value),
    name: document.getElementById("snack-name").value,
    price: Number(document.getElementById("snack-price").value)
  };
  apiSend("POST", "/api/snacks", snack)
    .then(data => {
      result.textContent = \`Added: \${data.name} (snack \${data.snack_id}) at ₱\${data.price}\`;
    })
    .catch(error => {
      result.textContent = \`Sorry: \${error.message}\`;
    });
});`;

// ---- Day 3, Part 2: staff.html + staff.js ---------------------------------------

export const STAFF_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Staff — Aling Nena's Canteen</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Staff: the snacks</h1>
  <p id="status"></p>
  <p id="message"></p>
  <table>
    <tr><th>Number</th><th>Name</th><th>Price</th><th>On the menu</th><th>Actions</th></tr>
    <tbody id="snack-rows"></tbody>
  </table>
  <p>A snack that has been sold can't be removed: take it off the menu instead.</p>
  <h2>Add a snack</h2>
  <form id="add-form">
    <label for="new-id">Snack number</label>
    <input type="number" id="new-id" min="1" required>
    <label for="new-name">Name</label>
    <input type="text" id="new-name" required>
    <label for="new-price">Price</label>
    <input type="number" id="new-price" min="1" max="1000" required>
    <button type="submit">Add snack</button>
  </form>
  <script src="api.js"></script>
  <script src="staff.js"></script>
</body>
</html>`;

export const STAFF_JS_TOP = `const rows = document.getElementById("snack-rows");
const statusLine = document.getElementById("status");
const messageLine = document.getElementById("message");`;

export const STAFF_JS_SHOW = `function showSnacks(list) {
  rows.replaceChildren();
  for (const snack of list) {
    const tr = document.createElement("tr");
    const id = document.createElement("td");
    id.textContent = snack.snack_id;
    const name = document.createElement("td");
    name.textContent = snack.name;
    const price = document.createElement("td");
    price.textContent = \`₱\${snack.price}\`;
    const onMenu = document.createElement("td");
    if (snack.available) {
      onMenu.textContent = "Yes";
    } else {
      onMenu.textContent = "No";
    }
    const actions = document.createElement("td");
    const edit = document.createElement("a");
    edit.href = \`edit-snack.html?id=\${snack.snack_id}\`;
    edit.textContent = "Edit";
    const toggle = document.createElement("button");
    toggle.type = "button";
    if (snack.available) {
      toggle.textContent = "Take off the menu";
    } else {
      toggle.textContent = "Put back on the menu";
    }
    toggle.addEventListener("click", function () {
      setAvailable(snack.snack_id, !snack.available);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      removeSnack(snack.snack_id);
    });
    actions.append(edit, " ", toggle, " ", remove);
    tr.append(id, name, price, onMenu, actions);
    rows.append(tr);
  }
  statusLine.textContent = \`\${list.length} snacks\`;
}`;

export const STAFF_JS_LOAD = `function loadSnacks() {
  apiGet("/api/staff/snacks")
    .then(data => showSnacks(data))
    .catch(error => {
      statusLine.textContent = \`Sorry: \${error.message}\`;
    });
}`;

export const STAFF_JS_WRITES = `function setAvailable(snackId, available) {
  apiSend("PUT", \`/api/snacks/\${snackId}/available\`, { available: available })
    .then(data => {
      if (data.available) {
        messageLine.textContent = \`Snack \${snackId} is back on the menu.\`;
      } else {
        messageLine.textContent = \`Snack \${snackId} is taken off the menu.\`;
      }
      loadSnacks();
    })
    .catch(error => {
      messageLine.textContent = \`Sorry: \${error.message}\`;
    });
}

function removeSnack(snackId) {
  if (!confirm(\`Remove snack \${snackId} for good?\`)) {
    return;
  }
  apiSend("DELETE", \`/api/snacks/\${snackId}\`)
    .then(() => {
      messageLine.textContent = \`Snack \${snackId} is removed.\`;
      loadSnacks();
    })
    .catch(error => {
      messageLine.textContent = \`Sorry: \${error.message}\`;
    });
}`;

export const STAFF_JS_ADD = `document.getElementById("add-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const snack = {
    snack_id: Number(document.getElementById("new-id").value),
    name: document.getElementById("new-name").value,
    price: Number(document.getElementById("new-price").value)
  };
  apiSend("POST", "/api/snacks", snack)
    .then(data => {
      messageLine.textContent = \`Added: \${data.name} (snack \${data.snack_id}) at ₱\${data.price}\`;
      loadSnacks();
    })
    .catch(error => {
      messageLine.textContent = \`Sorry: \${error.message}\`;
    });
});`;

export const STAFF_JS_START = "loadSnacks();";

export const STAFF_JS_D3 = `${STAFF_JS_TOP}

${STAFF_JS_SHOW}

${STAFF_JS_LOAD}

${STAFF_JS_WRITES}

${STAFF_JS_ADD}

${STAFF_JS_START}`;

// ---- Day 4, Part 2: the summary line on the dashboard ----------------------------

export const STAFF_SUMMARY_LINES = '  <p id="summary"></p>\n  <button type="button" id="refresh">Refresh</button>';
export const STAFF_HTML_D4 = replaceExactly(STAFF_HTML, '  <p id="message"></p>', `${STAFF_SUMMARY_LINES}\n  <p id="message"></p>`);
export const STAFF_JS_SUMMARY_CONST = `const summaryLine = document.getElementById("summary");`;
export const STAFF_JS_TOP_D4 = `${STAFF_JS_TOP}\n${STAFF_JS_SUMMARY_CONST}`;
export const STAFF_JS_SUMMARY = `function loadSummary() {
  apiGet("/api/summary")
    .then(data => {
      summaryLine.textContent = \`\${data.total_orders} orders · ₱\${data.total_sales} in sales\`;
    })
    .catch(error => {
      summaryLine.textContent = \`Sorry: \${error.message}\`;
    });
}`;
export const STAFF_JS_START_D4 = `loadSnacks();
loadSummary();

document.getElementById("refresh").addEventListener("click", function () {
  loadSnacks();
  loadSummary();
});`;
export const STAFF_JS_D4 = `${STAFF_JS_TOP_D4}

${STAFF_JS_SHOW}

${STAFF_JS_LOAD}

${STAFF_JS_SUMMARY}

${STAFF_JS_WRITES}

${STAFF_JS_ADD}

${STAFF_JS_START_D4}`;

// ---- Day 5, Part 2: index.html's hours and special on api.js -----------------------

export const INDEX_HOURS_LINE = `<p id="hours"></p>`;
export const INDEX_API_SCRIPT_LINES = `<script src="api.js"></script>\n<script src="index.js"></script>`;
export const INDEX_JS_D5 = `apiGet("/api/special")
  .then(data => {
    document.getElementById("special").textContent = \`Today's special: \${data.name} — ₱\${data.special_price}\`;
  })
  .catch(() => {
    document.getElementById("special").textContent = "No special today.";
  });

apiGet("/api/info")
  .then(info => {
    document.getElementById("hours").textContent = \`\${info.name}: open \${info.opens} to \${info.closes}\`;
  })
  .catch(error => {
    document.getElementById("hours").textContent = \`Sorry: \${error.message}\`;
  });`;

// ---- Day 2: console lines the lab uses on a page that loads api.js -------------------

/** Places an order and cancels it through apiSend, printing what the helper did (a 204 has no body). */
export const API_TRY_DELETE = `apiSend("POST", "/api/orders", { snack_id: 90, qty: 1 }).then(order => apiSend("DELETE", "/api/orders/" + order.order_id)).then(answer => console.log("RESOLVED with", JSON.stringify(answer)), error => console.log("FAILED:", error.name, error.message))`;
/** A GET for a snack that doesn't exist, printing whether the helper resolved or failed. */
export const API_TRY_MISSING = `apiGet("/api/snacks/99999").then(answer => console.log("RESOLVED with", JSON.stringify(answer)), error => console.log("FAILED:", error.name, error.message))`;
export const API_TRY_GOOD = `apiGet("/api/snacks/90").then(answer => console.log("RESOLVED with", JSON.stringify(answer)), error => console.log("FAILED:", error.name, error.message))`;

/** Week 8's index.js block that asks for the special; Day 5 replaces it with INDEX_JS_D5 (which also asks for the hours). */
export const INDEX_SPECIAL_BLOCK_OLD = INDEX_SPECIAL_NEW;
/** The Mon–Fri line of Week 5's opening-hours <pre>: typed data that canteen_info now holds. */
export const INDEX_HOURS_PRE_LINE = "Mon–Fri   7:00–16:00";
export const SQL_CANTEEN_INFO_SELECT = "SELECT * FROM canteen_info;";
export const SQL_CANTEEN_INFO_EMPTY = "DELETE FROM canteen_info WHERE info_id = 1;";
/** The fields and constructor after Day 5: a fourth repository. (CONTROLLER_D5 contains exactly this; week10.test.ts checks.) */
export const D5_FINAL_CONSTRUCTOR = `private final SnackRepository snacks;
private final OrderRepository orders;
private final SpecialRepository specials;
private final InfoRepository infos;

public SnackController(SnackRepository snacks, OrderRepository orders, SpecialRepository specials, InfoRepository infos) {
    this.snacks = snacks;
    this.orders = orders;
    this.specials = specials;
    this.infos = infos;
}`;

// ---- Day 2, Part 2: order.js on api.js (the page where the new 409 shows) -----------------

/** Week 7's snack drop-down loader, through the helper. */
export const ORDER_OPTIONS_API = `apiGet("/api/snacks")
  .then(data => {
    snacks = data;
    for (const item of snacks) {
      const option = document.createElement("option");
      option.value = item.snack_id;
      option.textContent = \`\${item.name} — ₱\${item.price}\`;
      snack.append(option);
    }
    showTotal();
  })
  .catch(error => console.error(error));`;

/** Week 7's submit call (from its fetch to the closing of the listener), through the helper: success writes the receipt, a refusal writes Sorry:, and the receipt shows either way. */
export const ORDER_SUBMIT_CALL_API = `apiSend("POST", "/api/orders", order)
    .then(data => {
      document.getElementById("receipt-text").textContent =
        \`Order \${data.order_id}: \${data.qty} × \${data.name} = ₱\${data.total}\`;
    })
    .catch(error => {
      document.getElementById("receipt-text").textContent = \`Sorry: \${error.message}\`;
    })
    .then(() => {
      receipt.style.display = "block";
    });
});`;

const ORDER_SUBMIT_AT = ORDER_JS_V2.indexOf('  fetch("/api/orders", {');
if (ORDER_SUBMIT_AT < 0) throw new Error("order.js submit anchor not found");
/** The text of Week 7's submit listener that Day 2 replaces: from its fetch to the end of the file. */
export const ORDER_SUBMIT_CALL_OLD = ORDER_JS_V2.slice(ORDER_SUBMIT_AT);
export const ORDER_JS_API = replaceExactly(replaceExactly(ORDER_JS_V2, ORDER_OPTIONS_FETCH, ORDER_OPTIONS_API), ORDER_SUBMIT_CALL_OLD, `  ${ORDER_SUBMIT_CALL_API.trimStart()}`);
export const ORDER_SCRIPT_TAGS = `  <script src="api.js"></script>\n  <script src="order.js"></script>`;
