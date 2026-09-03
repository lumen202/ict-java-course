import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  cloneState,
  statesEqual,
  resultsEqual,
  runStatement,
  runBatch,
  splitStatements,
  MiniSqlError,
  type MiniState,
} from "./minisql";

/**
 * Tests for the in-browser SQL engine. It reproduces real MySQL error codes
 * and wording, and it is what marks student lab submissions by comparing
 * resulting state against a canonical solution — so a bug here either lets
 * a wrong answer pass or fails a correct one, silently, in a live class.
 * Pure and dependency-free, so there is no excuse for it to be untested.
 *
 * Run: npm test
 */

function run(state: MiniState, sql: string) {
  return runStatement(state, sql);
}

function fresh(): MiniState {
  return createState({ safeUpdates: true });
}

function errCode(fn: () => void): number {
  try {
    fn();
  } catch (e) {
    return (e as MiniSqlError).code;
  }
  throw new Error("expected MiniSqlError, nothing was thrown");
}

describe("databases and tables", () => {
  test("CREATE DATABASE then USE it", () => {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    assert.equal(s.current, "school");
  });

  test("CREATE DATABASE twice is Error 1007", () => {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    assert.equal(errCode(() => run(s, "CREATE DATABASE school")), 1007);
  });

  test("USE on an unknown database is Error 1049", () => {
    const s = fresh();
    assert.equal(errCode(() => run(s, "USE nope")), 1049);
  });

  test("USE on a system database is allowed and shows no user tables", () => {
    const s = fresh();
    run(s, "USE information_schema");
    assert.equal(s.current, "information_schema");
  });

  test("CREATE TABLE inside a system database is Error 3554", () => {
    const s = fresh();
    run(s, "USE mysql");
    assert.equal(errCode(() => run(s, "CREATE TABLE t (id INT)")), 3554);
  });

  test("SELECT with no database selected is Error 1046", () => {
    const s = fresh();
    assert.equal(errCode(() => run(s, "SELECT * FROM students")), 1046);
  });

  test("query against a missing table is Error 1146", () => {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    assert.equal(errCode(() => run(s, "SELECT * FROM ghosts")), 1146);
  });

  test("DROP TABLE removes it; a second DROP is Error 1051", () => {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE t (id INT)");
    run(s, "DROP TABLE t");
    assert.equal(errCode(() => run(s, "DROP TABLE t")), 1051);
  });

  test("DROP DATABASE clears current selection when it was the active one", () => {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "DROP DATABASE school");
    assert.equal(s.current, null);
  });
});

describe("CREATE TABLE and column typing", () => {
  function schoolDb(): MiniState {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    return s;
  }

  test("PRIMARY KEY declared column-level and table-level are equivalent", () => {
    const a = schoolDb();
    run(a, "CREATE TABLE t (id INT PRIMARY KEY, name VARCHAR(20))");
    const b = schoolDb();
    run(b, "CREATE TABLE t (id INT, name VARCHAR(20), PRIMARY KEY (id))");
    assert.equal(statesEqual(a, b), true);
  });

  test("two PRIMARY KEY columns is Error 1068", () => {
    const s = schoolDb();
    assert.equal(
      errCode(() => run(s, "CREATE TABLE t (a INT PRIMARY KEY, b INT PRIMARY KEY)")),
      1068,
    );
  });

  test("AUTO_INCREMENT on a non-key column is Error 1075", () => {
    const s = schoolDb();
    assert.equal(
      errCode(() => run(s, "CREATE TABLE t (id INT, n INT AUTO_INCREMENT)")),
      1075,
    );
  });

  test("AUTO_INCREMENT on a non-integer key is Error 1063", () => {
    const s = schoolDb();
    assert.equal(
      errCode(() => run(s, "CREATE TABLE t (id VARCHAR(10) PRIMARY KEY AUTO_INCREMENT)")),
      1063,
    );
  });

  test("VARCHAR overflow on INSERT is Error 1406", () => {
    const s = schoolDb();
    run(s, "CREATE TABLE t (name VARCHAR(3))");
    assert.equal(errCode(() => run(s, "INSERT INTO t VALUES ('abcd')")), 1406);
  });

  test("non-integer value into an INT column is Error 1366", () => {
    const s = schoolDb();
    run(s, "CREATE TABLE t (age INT)");
    assert.equal(errCode(() => run(s, "INSERT INTO t VALUES ('x')")), 1366);
  });

  test("malformed DATE value is Error 1292", () => {
    const s = schoolDb();
    run(s, "CREATE TABLE t (born DATE)");
    assert.equal(errCode(() => run(s, "INSERT INTO t VALUES ('2024/01/01')")), 1292);
  });
});

describe("INSERT and AUTO_INCREMENT", () => {
  function withStudents(): MiniState {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE students (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(20))");
    return s;
  }

  test("AUTO_INCREMENT fills the id when omitted via a column list", () => {
    const s = withStudents();
    run(s, "INSERT INTO students (name) VALUES ('Ana')");
    run(s, "INSERT INTO students (name) VALUES ('Bo')");
    const result = run(s, "SELECT * FROM students ORDER BY id").result!;
    assert.deepEqual(result.rows, [
      ["1", "Ana"],
      ["2", "Bo"],
    ]);
  });

  test("duplicate PRIMARY KEY on INSERT is Error 1062", () => {
    const s = withStudents();
    run(s, "INSERT INTO students VALUES (1, 'Ana')");
    assert.equal(errCode(() => run(s, "INSERT INTO students VALUES (1, 'Bo')")), 1062);
  });

  test("DELETE does not reset the AUTO_INCREMENT counter", () => {
    const s = withStudents();
    run(s, "INSERT INTO students (name) VALUES ('Ana')");
    run(s, "SET SQL_SAFE_UPDATES = 0");
    run(s, "DELETE FROM students");
    run(s, "INSERT INTO students (name) VALUES ('Bo')");
    const result = run(s, "SELECT * FROM students").result!;
    assert.deepEqual(result.rows, [["2", "Bo"]]);
  });

  test("column count mismatch on INSERT is Error 1136", () => {
    const s = withStudents();
    assert.equal(errCode(() => run(s, "INSERT INTO students VALUES (1)")), 1136);
  });
});

describe("SELECT: WHERE and ORDER BY", () => {
  function withGrades(): MiniState {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE grades (id INT PRIMARY KEY, name VARCHAR(20), score INT)");
    run(s, "INSERT INTO grades VALUES (1, 'Ana', 90)");
    run(s, "INSERT INTO grades VALUES (2, 'Bo', 75)");
    run(s, "INSERT INTO grades VALUES (3, 'Cy', 90)");
    return s;
  }

  test("WHERE with AND narrows correctly", () => {
    const s = withGrades();
    const result = run(s, "SELECT name FROM grades WHERE score > 80 AND id != 1").result!;
    assert.deepEqual(result.rows, [["Cy"]]);
  });

  test("WHERE with OR widens correctly", () => {
    const s = withGrades();
    const result = run(s, "SELECT name FROM grades WHERE score = 75 OR id = 1").result!;
    assert.deepEqual(
      result.rows.map((r) => r[0]).sort(),
      ["Ana", "Bo"],
    );
  });

  test("WHERE with NOT inverts a comparison", () => {
    const s = withGrades();
    const result = run(s, "SELECT name FROM grades WHERE NOT score = 90").result!;
    assert.deepEqual(result.rows, [["Bo"]]);
  });

  test("ORDER BY multi-column with mixed ASC/DESC", () => {
    const s = withGrades();
    const result = run(s, "SELECT name FROM grades ORDER BY score DESC, name ASC").result!;
    assert.deepEqual(result.rows, [["Ana"], ["Cy"], ["Bo"]]);
  });

  test("unknown column in WHERE is Error 1054", () => {
    const s = withGrades();
    assert.equal(errCode(() => run(s, "SELECT * FROM grades WHERE nope = 1")), 1054);
  });
});

describe("UPDATE and safe-update mode", () => {
  function withGrades(): MiniState {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE grades (id INT PRIMARY KEY, score INT)");
    run(s, "INSERT INTO grades VALUES (1, 70)");
    run(s, "INSERT INTO grades VALUES (2, 70)");
    return s;
  }

  test("UPDATE without WHERE is blocked under SQL_SAFE_UPDATES, Error 1175", () => {
    const s = withGrades();
    assert.equal(errCode(() => run(s, "UPDATE grades SET score = 100")), 1175);
  });

  test("SET SQL_SAFE_UPDATES = 0 allows an unfiltered UPDATE", () => {
    const s = withGrades();
    run(s, "SET SQL_SAFE_UPDATES = 0");
    run(s, "UPDATE grades SET score = 100");
    const result = run(s, "SELECT score FROM grades").result!;
    assert.deepEqual(result.rows, [["100"], ["100"]]);
  });

  test("UPDATE that would collide two rows on the PRIMARY KEY is Error 1062", () => {
    const s = withGrades();
    assert.equal(errCode(() => run(s, "UPDATE grades SET id = 9 WHERE id = 1 OR id = 2")), 1062);
  });

  test("a failed UPDATE leaves every row unchanged", () => {
    const s = withGrades();
    const before = cloneState(s);
    assert.throws(() => run(s, "UPDATE grades SET score = 'not a number' WHERE id = 1"));
    assert.equal(statesEqual(s, before), true);
  });
});

describe("DELETE and safe-update mode", () => {
  test("DELETE without WHERE is blocked under SQL_SAFE_UPDATES, Error 1175", () => {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE t (id INT)");
    run(s, "INSERT INTO t VALUES (1)");
    assert.equal(errCode(() => run(s, "DELETE FROM t")), 1175);
  });

  test("DELETE with WHERE removes only matching rows", () => {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE t (id INT)");
    run(s, "INSERT INTO t VALUES (1)");
    run(s, "INSERT INTO t VALUES (2)");
    run(s, "DELETE FROM t WHERE id = 1");
    const result = run(s, "SELECT * FROM t").result!;
    assert.deepEqual(result.rows, [["2"]]);
  });
});

describe("ALTER TABLE ADD PRIMARY KEY", () => {
  function withRows(rows: (string | null)[][]): MiniState {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE t (id INT, name VARCHAR(10))");
    for (const [id, name] of rows) {
      run(s, `INSERT INTO t VALUES (${id}, '${name}')`);
    }
    return s;
  }

  test("duplicate values are reported before NULLs are", () => {
    // Both problems exist in this table at once; duplicates must win the
    // race so a cleanup lab proceeds one error at a time, in order.
    const s = withRows([
      ["1", "Ana"],
      ["1", "Bo"],
    ]);
    run(s, "INSERT INTO t VALUES (NULL, 'Cy')");
    assert.equal(errCode(() => run(s, "ALTER TABLE t ADD PRIMARY KEY (id)")), 1062);
  });

  test("NULL is reported once duplicates are gone", () => {
    const s = withRows([["1", "Ana"]]);
    run(s, "INSERT INTO t VALUES (NULL, 'Cy')");
    assert.equal(errCode(() => run(s, "ALTER TABLE t ADD PRIMARY KEY (id)")), 1138);
  });

  test("a clean column becomes queryable as a PRIMARY KEY", () => {
    const s = withRows([
      ["1", "Ana"],
      ["2", "Bo"],
    ]);
    run(s, "ALTER TABLE t ADD PRIMARY KEY (id)");
    assert.equal(errCode(() => run(s, "INSERT INTO t VALUES (1, 'Cy')")), 1062);
  });

  test("adding a second PRIMARY KEY after one exists is Error 1068", () => {
    const s = withRows([["1", "Ana"]]);
    run(s, "ALTER TABLE t ADD PRIMARY KEY (id)");
    assert.equal(errCode(() => run(s, "ALTER TABLE t ADD PRIMARY KEY (name)")), 1068);
  });
});

describe("resultsEqual — how student submissions are marked", () => {
  test("row order matters when the reference result is ORDER BY'd", () => {
    const a = { columns: ["n"], rows: [["1"], ["2"]], ordered: true };
    const b = { columns: ["n"], rows: [["2"], ["1"]], ordered: true };
    assert.equal(resultsEqual(a, b), false);
  });

  test("row order is ignored when the reference result is unordered", () => {
    const a = { columns: ["n"], rows: [["1"], ["2"]], ordered: false };
    const b = { columns: ["n"], rows: [["2"], ["1"]], ordered: false };
    assert.equal(resultsEqual(a, b), true);
  });

  test("column name comparison is case-insensitive", () => {
    const a = { columns: ["Name"], rows: [["Ana"]], ordered: false };
    const b = { columns: ["name"], rows: [["Ana"]], ordered: false };
    assert.equal(resultsEqual(a, b), true);
  });

  test("a different row count never matches", () => {
    const a = { columns: ["n"], rows: [["1"]], ordered: false };
    const b = { columns: ["n"], rows: [["1"], ["2"]], ordered: false };
    assert.equal(resultsEqual(a, b), false);
  });
});

describe("splitStatements", () => {
  test("splits on semicolons and drops a trailing empty statement", () => {
    const out = splitStatements("SELECT 1; SELECT 2;");
    assert.deepEqual(out, ["SELECT 1", "SELECT 2"]);
  });

  test("a semicolon inside a quoted string does not split the statement", () => {
    const out = splitStatements("INSERT INTO t VALUES ('a;b');");
    assert.deepEqual(out, ["INSERT INTO t VALUES ('a;b')"]);
  });

  test("a -- comment is stripped, including one holding a semicolon", () => {
    const out = splitStatements("SELECT 1; -- comment; with a semicolon\nSELECT 2;");
    assert.deepEqual(out, ["SELECT 1", "SELECT 2"]);
  });

  test("a missing trailing semicolon is a syntax error, by course convention", () => {
    assert.throws(() => splitStatements("SELECT 1"), MiniSqlError);
  });
});

describe("runBatch", () => {
  test("stops at the first error and reports it, without losing prior output", () => {
    const s = fresh();
    const batch = runBatch(s, "CREATE DATABASE school; USE school; SELECT * FROM ghosts;");
    assert.equal(batch.outputs.length, 3);
    assert.equal(batch.outputs[0]!.ok, true);
    assert.equal(batch.outputs[1]!.ok, true);
    assert.equal(batch.outputs[2]!.ok, false);
    assert.equal(batch.error?.code, 1146);
  });

  test("the last SELECT's result grid survives to the end of the batch", () => {
    const s = fresh();
    const batch = runBatch(
      s,
      "CREATE DATABASE school; USE school; CREATE TABLE t (id INT); INSERT INTO t VALUES (1); SELECT * FROM t;",
    );
    assert.equal(batch.error, undefined);
    assert.deepEqual(batch.result?.rows, [["1"]]);
  });
});

describe("IS NULL / IS NOT NULL — the anti-join filter", () => {
  function withLedger(): MiniState {
    const s = fresh();
    run(s, "CREATE DATABASE school");
    run(s, "USE school");
    run(s, "CREATE TABLE snacks (snack_id INT PRIMARY KEY, name VARCHAR(20))");
    run(s, "INSERT INTO snacks VALUES (1, 'Banana cue')");
    run(s, "INSERT INTO snacks VALUES (2, 'Gulaman')");
    run(s, "CREATE TABLE sales (sale_id INT PRIMARY KEY, snack_id INT)");
    run(s, "INSERT INTO sales VALUES (1, 1)");
    run(s, "INSERT INTO sales (sale_id) VALUES (2)");
    return s;
  }

  test("IS NULL finds the row a comparison can never reach", () => {
    const s = withLedger();
    const result = run(s, "SELECT sale_id FROM sales WHERE snack_id IS NULL").result!;
    assert.deepEqual(result.rows, [["2"]]);
  });

  test("IS NOT NULL is its exact complement", () => {
    const s = withLedger();
    const result = run(s, "SELECT sale_id FROM sales WHERE snack_id IS NOT NULL").result!;
    assert.deepEqual(result.rows, [["1"]]);
  });

  test("= NULL matches nothing — the mistake IS NULL exists to prevent", () => {
    const s = withLedger();
    const result = run(s, "SELECT sale_id FROM sales WHERE snack_id = NULL").result!;
    assert.deepEqual(result.rows, []);
  });

  test("the anti-join: LEFT JOIN + IS NULL returns rows with no partner", () => {
    const s = withLedger();
    const result = run(
      s,
      "SELECT snacks.name FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id WHERE sales.sale_id IS NULL",
    ).result!;
    assert.deepEqual(result.rows, [["Gulaman"]]);
  });

  test("IS NULL combines with AND/NOT like any other condition", () => {
    const s = withLedger();
    const result = run(s, "SELECT sale_id FROM sales WHERE NOT snack_id IS NULL AND sale_id = 1").result!;
    assert.deepEqual(result.rows, [["1"]]);
  });

  test("an ambiguous column in IS NULL still raises 1052", () => {
    const s = withLedger();
    assert.equal(
      errCode(() =>
        run(s, "SELECT * FROM snacks LEFT JOIN sales ON snacks.snack_id = sales.snack_id WHERE snack_id IS NULL"),
      ),
      1052,
    );
  });

  test("IS without NULL is a syntax error, not a silent pass", () => {
    const s = withLedger();
    assert.equal(errCode(() => run(s, "SELECT * FROM sales WHERE snack_id IS 1")), 1064);
  });

  test("DELETE can use IS NULL", () => {
    const s = withLedger();
    run(s, "DELETE FROM sales WHERE snack_id IS NULL");
    const result = run(s, "SELECT sale_id FROM sales").result!;
    assert.deepEqual(result.rows, [["1"]]);
  });
});
