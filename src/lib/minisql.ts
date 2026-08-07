// A tiny in-memory MySQL, just big enough for the course's SQL. Week 1:
// CREATE/DROP/SHOW DATABASES, USE, SHOW TABLES, CREATE/DROP TABLE, DESCRIBE,
// INSERT, SELECT (WHERE with AND/OR/NOT and comparisons, ORDER BY
// multi-column ASC/DESC), ALTER TABLE ADD COLUMN, UPDATE with Workbench's
// safe-update mode, and SET SQL_SAFE_UPDATES. Week 2: DELETE FROM (also
// behind safe-update mode), PRIMARY KEY and AUTO_INCREMENT (column-level or
// table-level in CREATE TABLE, via ALTER TABLE ADD [CONSTRAINT] PRIMARY KEY,
// and ALTER TABLE t AUTO_INCREMENT = n), and INSERT with a column list
// (`INSERT INTO t (a, b) VALUES …`). Errors mimic real MySQL codes and
// wording, because learning to read those messages is part of the curriculum.
//
// Used by `components/SqlConsole.tsx` (the in-page mini DB Fiddle). Pure and
// dependency-free: state in, effects out. Values are stored as strings
// (or null for SQL NULL); column types validate on the way in, like MySQL
// in strict mode.

export type MiniColumn = { name: string; type: string; pk?: boolean; autoInc?: boolean };
export type MiniTable = {
  name: string;
  columns: MiniColumn[];
  rows: (string | null)[][];
  /** Next AUTO_INCREMENT value. Present only when a column has autoInc. */
  autoIncNext?: number;
};
export type MiniDb = { name: string; tables: MiniTable[] };
export type MiniState = {
  databases: MiniDb[];
  /** Database selected via USE, or null. */
  current: string | null;
  /** Workbench's SQL_SAFE_UPDATES — blocks UPDATE without WHERE. */
  safeUpdates: boolean;
};

export type MiniResult = {
  columns: string[];
  rows: (string | null)[][];
  /** True when produced by an ORDER BY — row order is then meaningful. */
  ordered: boolean;
};

export type MiniOutput = { ok: boolean; sql: string; text: string };

export type BatchRun = {
  /** One line per executed statement, Workbench-output style. */
  outputs: MiniOutput[];
  /** The last result grid produced (SELECT/SHOW/DESCRIBE), if any. */
  result?: MiniResult;
  /** Set when execution stopped at an error. */
  error?: { code: number; message: string };
};

export class MiniSqlError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

/** Databases every MySQL server has; visible but read-only here. */
const SYSTEM_DBS = ["information_schema", "mysql", "performance_schema", "sys"];

// ---------------------------------------------------------------- tokenizer

type Tok = { t: "word" | "str" | "num" | "op" | "punc"; v: string };

function tokenize(sql: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }
    if (c === "'" || c === '"') {
      const quote = c;
      let j = i + 1;
      let v = "";
      while (j < sql.length && sql[j] !== quote) v += sql[j++];
      if (j >= sql.length) {
        throw new MiniSqlError(1064, `You have an error in your SQL syntax: a quote (${quote}) was opened but never closed`);
      }
      toks.push({ t: "str", v });
      i = j + 1;
      continue;
    }
    if (c === "`") {
      let j = i + 1;
      let v = "";
      while (j < sql.length && sql[j] !== "`") v += sql[j++];
      toks.push({ t: "word", v });
      i = j + 1;
      continue;
    }
    if (/\d/.test(c) || (c === "-" && /\d/.test(sql[i + 1] ?? ""))) {
      let j = c === "-" ? i + 1 : i;
      while (j < sql.length && /[\d.]/.test(sql[j])) j++;
      toks.push({ t: "num", v: sql.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_$]/.test(sql[j])) j++;
      toks.push({ t: "word", v: sql.slice(i, j) });
      i = j;
      continue;
    }
    const two = sql.slice(i, i + 2);
    if (two === ">=" || two === "<=" || two === "!=" || two === "<>") {
      toks.push({ t: "op", v: two === "<>" ? "!=" : two });
      i += 2;
      continue;
    }
    if ("=<>".includes(c)) {
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }
    if ("(),;*.".includes(c)) {
      toks.push({ t: "punc", v: c });
      i++;
      continue;
    }
    throw new MiniSqlError(1064, `You have an error in your SQL syntax; check the manual near '${sql.slice(i, i + 10).trim()}'`);
  }
  return toks;
}

// ------------------------------------------------------------------ parser

class Cursor {
  toks: Tok[];
  i = 0;
  constructor(toks: Tok[]) {
    this.toks = toks;
  }
  peek(): Tok | undefined {
    return this.toks[this.i];
  }
  next(): Tok | undefined {
    return this.toks[this.i++];
  }
  /** Case-insensitive keyword check without consuming. */
  atWord(...words: string[]): boolean {
    const t = this.peek();
    return t?.t === "word" && words.includes(t.v.toUpperCase());
  }
  takeWord(...words: string[]): boolean {
    if (this.atWord(...words)) {
      this.i++;
      return true;
    }
    return false;
  }
  expectWord(word: string) {
    if (!this.takeWord(word)) this.fail();
  }
  expectPunc(p: string) {
    const t = this.next();
    if (!t || t.t !== "punc" || t.v !== p) this.fail(t);
  }
  ident(): string {
    const t = this.next();
    if (!t || t.t !== "word") this.fail(t);
    return (t as Tok).v;
  }
  fail(t?: Tok | undefined): never {
    throw synErr(t ?? this.peek() ?? this.toks[this.toks.length - 1]);
  }
}

function synErr(t?: Tok): MiniSqlError {
  return new MiniSqlError(
    1064,
    `You have an error in your SQL syntax; check the manual near '${t ? t.v : ""}'`,
  );
}

type Expr =
  | { k: "cmp"; col: string; op: string; val: { t: "str" | "num" | "word"; v: string } }
  | { k: "and" | "or"; l: Expr; r: Expr }
  | { k: "not"; e: Expr };

function parseExpr(c: Cursor): Expr {
  let left = parseAnd(c);
  while (c.takeWord("OR")) left = { k: "or", l: left, r: parseAnd(c) };
  return left;
}

function parseAnd(c: Cursor): Expr {
  let left = parseUnary(c);
  while (c.takeWord("AND")) left = { k: "and", l: left, r: parseUnary(c) };
  return left;
}

function parseUnary(c: Cursor): Expr {
  if (c.takeWord("NOT")) return { k: "not", e: parseUnary(c) };
  if (c.peek()?.t === "punc" && c.peek()?.v === "(") {
    c.next();
    const e = parseExpr(c);
    c.expectPunc(")");
    return e;
  }
  const col = c.ident();
  const opTok = c.next();
  if (!opTok || opTok.t !== "op") c.fail(opTok);
  const valTok = c.next();
  if (!valTok || (valTok.t !== "str" && valTok.t !== "num" && valTok.t !== "word")) c.fail(valTok);
  const vt = valTok as Tok;
  return {
    k: "cmp",
    col,
    op: (opTok as Tok).v,
    val: { t: vt.t as "str" | "num" | "word", v: vt.v },
  };
}

// ------------------------------------------------------------- state utils

export function createState(setup?: {
  databases?: {
    name: string;
    tables?: {
      name: string;
      columns: { name: string; type: string; pk?: boolean; autoInc?: boolean }[];
      rows: (string | null)[][];
    }[];
  }[];
  use?: string;
  safeUpdates?: boolean;
}): MiniState {
  return {
    databases: (setup?.databases ?? []).map((d) => ({
      name: d.name,
      tables: (d.tables ?? []).map((t) => {
        const table: MiniTable = {
          name: t.name,
          columns: t.columns.map((col) => ({ ...col })),
          rows: t.rows.map((r) => [...r] as (string | null)[]),
        };
        const ai = table.columns.findIndex((col) => col.autoInc);
        if (ai !== -1) {
          const max = Math.max(0, ...table.rows.map((r) => Number(r[ai] ?? 0)));
          table.autoIncNext = max + 1;
        }
        return table;
      }),
    })),
    current: setup?.use ?? null,
    safeUpdates: setup?.safeUpdates ?? true,
  };
}

export function cloneState(s: MiniState): MiniState {
  return {
    databases: s.databases.map((d) => ({
      name: d.name,
      tables: d.tables.map((t) => ({
        name: t.name,
        columns: t.columns.map((col) => ({ ...col })),
        rows: t.rows.map((r) => [...r]),
        ...(t.autoIncNext !== undefined ? { autoIncNext: t.autoIncNext } : {}),
      })),
    })),
    current: s.current,
    safeUpdates: s.safeUpdates,
  };
}

function normalizeState(s: MiniState): string {
  const dbs = [...s.databases]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((d) => ({
      name: d.name.toLowerCase(),
      tables: [...d.tables]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((t) => ({
          name: t.name.toLowerCase(),
          columns: t.columns.map((col) => ({
            name: col.name.toLowerCase(),
            type: col.type.toUpperCase(),
            pk: col.pk ?? false,
            autoInc: col.autoInc ?? false,
          })),
          rows: t.rows,
          autoIncNext: t.autoIncNext ?? null,
        })),
    }));
  return JSON.stringify({ dbs, current: s.current?.toLowerCase() ?? null, safe: s.safeUpdates });
}

export function statesEqual(a: MiniState, b: MiniState): boolean {
  return normalizeState(a) === normalizeState(b);
}

export function resultsEqual(a: MiniResult | undefined, b: MiniResult | undefined): boolean {
  if (!a || !b) return !a && !b;
  const colsA = a.columns.map((c) => c.toLowerCase()).join(" ");
  const colsB = b.columns.map((c) => c.toLowerCase()).join(" ");
  if (colsA !== colsB) return false;
  const ser = (rows: (string | null)[][]) => rows.map((r) => r.map((v) => v ?? "NULL").join(" "));
  const ra = ser(a.rows);
  const rb = ser(b.rows);
  if (ra.length !== rb.length) return false;
  // If the reference result is ordered, order matters; otherwise compare as multisets.
  if (b.ordered) return ra.every((r, i) => r === rb[i]);
  return [...ra].sort().join("\n") === [...rb].sort().join("\n");
}

function findDb(s: MiniState, name: string): MiniDb | undefined {
  return s.databases.find((d) => d.name.toLowerCase() === name.toLowerCase());
}

function isSystemDb(name: string): boolean {
  return SYSTEM_DBS.includes(name.toLowerCase());
}

function currentDb(s: MiniState): MiniDb {
  if (!s.current) throw new MiniSqlError(1046, "Error 1046: No database selected");
  const db = findDb(s, s.current);
  if (!db) {
    // USE'd a system db — it exists but holds nothing of the student's.
    return { name: s.current, tables: [] };
  }
  return db;
}

function findTable(s: MiniState, name: string): MiniTable {
  const db = currentDb(s);
  const t = db.tables.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!t) throw new MiniSqlError(1146, `Error 1146: Table '${db.name}.${name}' doesn't exist`);
  return t;
}

// --------------------------------------------------------------- typecheck

function isIntType(type: string): boolean {
  return type.toUpperCase().startsWith("INT");
}

function varcharLimit(type: string): number | null {
  const m = /^VARCHAR\s*\(\s*(\d+)\s*\)$/i.exec(type);
  return m ? Number(m[1]) : null;
}

/** Validate + canonicalize one value for a column; row is 1-based for messages. */
function coerce(col: MiniColumn, val: { t: "str" | "num" | "word"; v: string }, rowNum: number): string | null {
  if (val.t === "word") {
    if (val.v.toUpperCase() === "NULL") return null;
    // A bare word where a value belongs — MySQL reads it as a column name.
    throw new MiniSqlError(1054, `Error 1054: Unknown column '${val.v}' in 'field list'`);
  }
  if (isIntType(col.type)) {
    if (val.t !== "num" || !/^-?\d+$/.test(val.v)) {
      throw new MiniSqlError(
        1366,
        `Error 1366: Incorrect integer value: '${val.v}' for column '${col.name}' at row ${rowNum}`,
      );
    }
    return String(Number(val.v));
  }
  if (col.type.toUpperCase() === "DATE") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val.v)) {
      throw new MiniSqlError(
        1292,
        `Error 1292: Incorrect date value: '${val.v}' for column '${col.name}' at row ${rowNum}`,
      );
    }
    return val.v;
  }
  const limit = varcharLimit(col.type);
  if (limit !== null && val.v.length > limit) {
    throw new MiniSqlError(1406, `Error 1406: Data too long for column '${col.name}' at row ${rowNum}`);
  }
  return val.v;
}

/** Index of the PRIMARY KEY column, or -1. */
function pkIndex(t: MiniTable): number {
  return t.columns.findIndex((col) => col.pk);
}

/** Enforce the PRIMARY KEY rules for one candidate value against a set of rows. */
function checkPkValue(t: MiniTable, pi: number, value: string | null, against: (string | null)[][]) {
  const col = t.columns[pi];
  if (value === null) {
    throw new MiniSqlError(1048, `Error 1048: Column '${col.name}' cannot be null`);
  }
  if (against.some((r) => r[pi] !== null && r[pi] === value)) {
    throw new MiniSqlError(1062, `Error 1062: Duplicate entry '${value}' for key '${t.name}.PRIMARY'`);
  }
}

function parseColumnType(c: Cursor): string {
  const base = c.ident().toUpperCase();
  if (base === "INT") return "INT";
  if (base === "DATE") return "DATE";
  if (base === "VARCHAR") {
    c.expectPunc("(");
    const n = c.next();
    if (!n || n.t !== "num") c.fail(n);
    c.expectPunc(")");
    return `VARCHAR(${(n as Tok).v})`;
  }
  throw new MiniSqlError(
    1064,
    `You have an error in your SQL syntax; check the manual near '${base}' (this console knows INT, VARCHAR(n) and DATE)`,
  );
}

// ------------------------------------------------------------------- WHERE

function evalExpr(expr: Expr, table: MiniTable, row: (string | null)[]): boolean {
  switch (expr.k) {
    case "and":
      return evalExpr(expr.l, table, row) && evalExpr(expr.r, table, row);
    case "or":
      return evalExpr(expr.l, table, row) || evalExpr(expr.r, table, row);
    case "not":
      return !evalExpr(expr.e, table, row);
    case "cmp": {
      const ci = table.columns.findIndex((col) => col.name.toLowerCase() === expr.col.toLowerCase());
      if (ci === -1) {
        throw new MiniSqlError(1054, `Error 1054: Unknown column '${expr.col}' in 'where clause'`);
      }
      if (expr.val.t === "word" && expr.val.v.toUpperCase() !== "NULL") {
        throw new MiniSqlError(1054, `Error 1054: Unknown column '${expr.val.v}' in 'where clause'`);
      }
      const cell = row[ci];
      if (cell === null || expr.val.v.toUpperCase() === "NULL") return false;
      const numeric = isIntType(table.columns[ci].type) && expr.val.t === "num";
      const a = numeric ? Number(cell) : cell.toLowerCase();
      const b = numeric ? Number(expr.val.v) : expr.val.v.toLowerCase();
      switch (expr.op) {
        case "=":
          return a === b;
        case "!=":
          return a !== b;
        case ">":
          return a > b;
        case "<":
          return a < b;
        case ">=":
          return a >= b;
        case "<=":
          return a <= b;
        default:
          throw new MiniSqlError(1064, `You have an error in your SQL syntax; check the manual near '${expr.op}'`);
      }
    }
  }
}

// -------------------------------------------------------------- statements

export type StatementOk = { message: string; result?: MiniResult };

/** Run one statement (no trailing semicolon needed), mutating `state`. */
export function runStatement(state: MiniState, sql: string): StatementOk {
  const c = new Cursor(tokenize(sql));
  const first = c.peek();
  if (!first) return { message: "Query OK" };
  if (first.t !== "word") c.fail(first);
  const head = first.v.toUpperCase();

  // Misspelled keywords get the real-MySQL treatment: syntax error near it.
  const KNOWN = ["CREATE", "DROP", "SHOW", "USE", "DESCRIBE", "DESC", "INSERT", "SELECT", "ALTER", "UPDATE", "DELETE", "SET"];
  if (!KNOWN.includes(head)) c.fail(first);
  c.next();

  switch (head) {
    case "CREATE": {
      if (c.takeWord("DATABASE")) {
        const name = c.ident();
        end(c);
        if (isSystemDb(name) || findDb(state, name)) {
          throw new MiniSqlError(1007, `Error 1007: Can't create database '${name}'; database exists`);
        }
        state.databases.push({ name, tables: [] });
        return { message: "Query OK, 1 row affected" };
      }
      if (c.takeWord("TABLE")) {
        const name = c.ident();
        const db = currentDb(state);
        if (isSystemDb(db.name)) {
          throw new MiniSqlError(3554, `Error 3554: Access to system schema '${db.name}' is rejected`);
        }
        if (db.tables.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
          throw new MiniSqlError(1050, `Error 1050: Table '${name}' already exists`);
        }
        c.expectPunc("(");
        const columns: MiniColumn[] = [];
        let tablePk: string | null = null;
        for (;;) {
          if (c.atWord("PRIMARY")) {
            // Table-level constraint: PRIMARY KEY (col)
            c.next();
            c.expectWord("KEY");
            c.expectPunc("(");
            tablePk = c.ident();
            c.expectPunc(")");
          } else {
            const colName = c.ident();
            const type = parseColumnType(c);
            const col: MiniColumn = { name: colName, type };
            for (;;) {
              if (c.takeWord("PRIMARY")) {
                c.expectWord("KEY");
                col.pk = true;
                continue;
              }
              if (c.takeWord("AUTO_INCREMENT")) {
                col.autoInc = true;
                continue;
              }
              break;
            }
            columns.push(col);
          }
          const t = c.next();
          if (!t || t.t !== "punc") throw synErr(t);
          if (t.v === ")") break;
          if (t.v !== ",") throw synErr(t);
        }
        end(c);
        if (tablePk !== null) {
          const col = columns.find((x) => x.name.toLowerCase() === tablePk!.toLowerCase());
          if (!col) throw new MiniSqlError(1072, `Error 1072: Key column '${tablePk}' doesn't exist in table`);
          col.pk = true;
        }
        if (columns.filter((x) => x.pk).length > 1) {
          throw new MiniSqlError(1068, "Error 1068: Multiple primary key defined");
        }
        const autoCol = columns.find((x) => x.autoInc);
        if (autoCol && !autoCol.pk) {
          throw new MiniSqlError(
            1075,
            "Error 1075: Incorrect table definition; there can be only one auto column and it must be defined as a key",
          );
        }
        if (autoCol && !isIntType(autoCol.type)) {
          throw new MiniSqlError(1063, `Error 1063: Incorrect column specifier for column '${autoCol.name}'`);
        }
        const table: MiniTable = { name, columns, rows: [] };
        if (autoCol) table.autoIncNext = 1;
        db.tables.push(table);
        return { message: "Query OK, 0 rows affected" };
      }
      c.fail();
      break;
    }

    case "DROP": {
      if (c.takeWord("DATABASE")) {
        const name = c.ident();
        end(c);
        if (isSystemDb(name)) {
          throw new MiniSqlError(3554, `Error 3554: Access to system schema '${name}' is rejected`);
        }
        const db = findDb(state, name);
        if (!db) throw new MiniSqlError(1008, `Error 1008: Can't drop database '${name}'; database doesn't exist`);
        state.databases = state.databases.filter((d) => d !== db);
        if (state.current?.toLowerCase() === name.toLowerCase()) state.current = null;
        return { message: `Query OK, ${db.tables.length} row(s) affected` };
      }
      if (c.takeWord("TABLE")) {
        const name = c.ident();
        end(c);
        const db = currentDb(state);
        const t = db.tables.find((x) => x.name.toLowerCase() === name.toLowerCase());
        if (!t) throw new MiniSqlError(1051, `Error 1051: Unknown table '${db.name}.${name}'`);
        db.tables = db.tables.filter((x) => x !== t);
        return { message: "Query OK, 0 rows affected" };
      }
      c.fail();
      break;
    }

    case "SHOW": {
      if (c.takeWord("DATABASES")) {
        end(c);
        const names = [...SYSTEM_DBS, ...state.databases.map((d) => d.name)].sort();
        return {
          message: `${names.length} row(s) returned`,
          result: { columns: ["Database"], rows: names.map((n) => [n]), ordered: true },
        };
      }
      if (c.takeWord("TABLES")) {
        end(c);
        const db = currentDb(state);
        const names = db.tables.map((t) => t.name).sort();
        return {
          message: `${names.length} row(s) returned`,
          result: { columns: [`Tables_in_${db.name}`], rows: names.map((n) => [n]), ordered: true },
        };
      }
      if (c.atWord("DATABASE", "TABLE")) {
        // The classic singular/plural trip-up, called out the way MySQL would.
        c.fail();
      }
      c.fail();
      break;
    }

    case "USE": {
      const name = c.ident();
      end(c);
      if (!isSystemDb(name) && !findDb(state, name)) {
        throw new MiniSqlError(1049, `Error 1049: Unknown database '${name}'`);
      }
      state.current = name;
      return { message: "Database changed" };
    }

    case "DESCRIBE":
    case "DESC": {
      const name = c.ident();
      end(c);
      const t = findTable(state, name);
      return {
        message: `${t.columns.length} row(s) returned`,
        result: {
          columns: ["Field", "Type", "Null", "Key", "Default", "Extra"],
          rows: t.columns.map((col) => [
            col.name,
            col.type.toLowerCase(),
            col.pk ? "NO" : "YES",
            col.pk ? "PRI" : "",
            null,
            col.autoInc ? "auto_increment" : "",
          ]),
          ordered: true,
        },
      };
    }

    case "INSERT": {
      c.expectWord("INTO");
      const name = c.ident();
      const t = findTable(state, name);
      // Optional column list: INSERT INTO t (a, b) VALUES …
      let target: number[] | null = null;
      if (c.peek()?.t === "punc" && c.peek()?.v === "(") {
        c.next();
        target = [];
        for (;;) {
          const colName = c.ident();
          const i = t.columns.findIndex((col) => col.name.toLowerCase() === colName.toLowerCase());
          if (i === -1) throw new MiniSqlError(1054, `Error 1054: Unknown column '${colName}' in 'field list'`);
          target.push(i);
          const p = c.next();
          if (!p || p.t !== "punc") throw synErr(p);
          if (p.v === ")") break;
          if (p.v !== ",") throw synErr(p);
        }
      }
      c.expectWord("VALUES");
      const pi = pkIndex(t);
      const newRows: (string | null)[][] = [];
      for (;;) {
        c.expectPunc("(");
        const vals: { t: "str" | "num" | "word"; v: string }[] = [];
        for (;;) {
          const v = c.next();
          if (!v || (v.t !== "str" && v.t !== "num" && v.t !== "word")) c.fail(v);
          vals.push({ t: (v as Tok).t as "str" | "num" | "word", v: (v as Tok).v });
          const p = c.next();
          if (!p || p.t !== "punc") throw synErr(p);
          if (p.v === ")") break;
          if (p.v !== ",") throw synErr(p);
        }
        const rowNum = newRows.length + 1;
        const expected = target ? target.length : t.columns.length;
        if (vals.length !== expected) {
          throw new MiniSqlError(1136, `Error 1136: Column count doesn't match value count at row ${rowNum}`);
        }
        // Build the full row: listed columns get their value, the rest get
        // NULL — or the next AUTO_INCREMENT value for the auto column.
        const row: (string | null)[] = new Array(t.columns.length).fill(null);
        const provided: boolean[] = new Array(t.columns.length).fill(false);
        (target ?? t.columns.map((_, i) => i)).forEach((ci, vi) => {
          row[ci] = coerce(t.columns[ci], vals[vi], rowNum);
          provided[ci] = true;
        });
        for (let ci = 0; ci < t.columns.length; ci++) {
          const col = t.columns[ci];
          if (col.autoInc && (row[ci] === null || !provided[ci])) {
            row[ci] = String(t.autoIncNext ?? 1);
            t.autoIncNext = (t.autoIncNext ?? 1) + 1;
          } else if (col.pk && !provided[ci]) {
            throw new MiniSqlError(1364, `Error 1364: Field '${col.name}' doesn't have a default value`);
          }
        }
        if (pi !== -1) {
          checkPkValue(t, pi, row[pi], [...t.rows, ...newRows]);
          if (t.columns[pi].autoInc) {
            const v = Number(row[pi]);
            if (v >= (t.autoIncNext ?? 1)) t.autoIncNext = v + 1;
          }
        }
        newRows.push(row);
        const p = c.peek();
        if (p?.t === "punc" && p.v === ",") {
          c.next();
          continue;
        }
        break;
      }
      end(c);
      t.rows.push(...newRows);
      return { message: `Query OK, ${newRows.length} row(s) affected` };
    }

    case "SELECT": {
      const cols: string[] | "*" = (() => {
        if (c.peek()?.t === "punc" && c.peek()?.v === "*") {
          c.next();
          return "*" as const;
        }
        const list: string[] = [];
        for (;;) {
          list.push(c.ident());
          const p = c.peek();
          if (p?.t === "punc" && p.v === ",") {
            c.next();
            continue;
          }
          break;
        }
        return list;
      })();
      c.expectWord("FROM");
      const name = c.ident();
      const t = findTable(state, name);
      let where: Expr | undefined;
      if (c.takeWord("WHERE")) where = parseExpr(c);
      let order: { col: string; desc: boolean }[] | undefined;
      if (c.takeWord("ORDER")) {
        c.expectWord("BY");
        order = [];
        for (;;) {
          const col = c.ident();
          let desc = false;
          if (c.takeWord("DESC")) desc = true;
          else c.takeWord("ASC");
          order.push({ col, desc });
          const p = c.peek();
          if (p?.t === "punc" && p.v === ",") {
            c.next();
            continue;
          }
          break;
        }
      }
      end(c);

      const colIdx = (colName: string, clause: string): number => {
        const i = t.columns.findIndex((col) => col.name.toLowerCase() === colName.toLowerCase());
        if (i === -1) throw new MiniSqlError(1054, `Error 1054: Unknown column '${colName}' in '${clause}'`);
        return i;
      };
      const picked = cols === "*" ? t.columns.map((_, i) => i) : cols.map((n) => colIdx(n, "field list"));
      const orderIdx = (order ?? []).map((o) => ({ i: colIdx(o.col, "order clause"), desc: o.desc }));

      let rows = t.rows.filter((r) => (where ? evalExpr(where, t, r) : true));
      if (orderIdx.length > 0) {
        rows = [...rows].sort((ra, rb) => {
          for (const { i, desc } of orderIdx) {
            const a = ra[i];
            const b = rb[i];
            if (a === b) continue;
            if (a === null) return desc ? 1 : -1;
            if (b === null) return desc ? -1 : 1;
            const numeric = isIntType(t.columns[i].type);
            const cmp = numeric ? Number(a) - Number(b) : a.toLowerCase() < b.toLowerCase() ? -1 : 1;
            if (cmp !== 0) return desc ? -cmp : cmp;
          }
          return 0;
        });
      }
      return {
        message: `${rows.length} row(s) returned`,
        result: {
          columns: picked.map((i) => t.columns[i].name),
          rows: rows.map((r) => picked.map((i) => r[i])),
          ordered: orderIdx.length > 0,
        },
      };
    }

    case "ALTER": {
      c.expectWord("TABLE");
      const name = c.ident();
      const t = findTable(state, name);
      // ALTER TABLE t AUTO_INCREMENT = n — moves the counter (never backwards
      // past existing data, like InnoDB).
      if (c.takeWord("AUTO_INCREMENT")) {
        const eq = c.next();
        if (!eq || eq.t !== "op" || eq.v !== "=") c.fail(eq);
        const v = c.next();
        if (!v || v.t !== "num" || !/^\d+$/.test(v.v)) c.fail(v);
        end(c);
        const ai = t.columns.findIndex((col) => col.autoInc);
        if (ai !== -1) {
          const max = Math.max(0, ...t.rows.map((r) => Number(r[ai] ?? 0)));
          t.autoIncNext = Math.max(Number((v as Tok).v), max + 1);
        }
        return { message: "Query OK, 0 rows affected" };
      }
      c.expectWord("ADD");
      // ALTER TABLE t ADD [CONSTRAINT] PRIMARY KEY (col)
      if (c.atWord("CONSTRAINT", "PRIMARY")) {
        c.takeWord("CONSTRAINT");
        c.expectWord("PRIMARY");
        c.expectWord("KEY");
        c.expectPunc("(");
        const keyCol = c.ident();
        c.expectPunc(")");
        end(c);
        if (pkIndex(t) !== -1) {
          throw new MiniSqlError(1068, "Error 1068: Multiple primary key defined");
        }
        const i = t.columns.findIndex((col) => col.name.toLowerCase() === keyCol.toLowerCase());
        if (i === -1) throw new MiniSqlError(1072, `Error 1072: Key column '${keyCol}' doesn't exist in table`);
        // Duplicates are reported before NULLs so a cleanup proceeds one
        // problem at a time — the Day 3 lab leans on this order.
        const seen = new Set<string>();
        for (const r of t.rows) {
          const v = r[i];
          if (v === null) continue;
          if (seen.has(v)) {
            throw new MiniSqlError(1062, `Error 1062: Duplicate entry '${v}' for key '${t.name}.PRIMARY'`);
          }
          seen.add(v);
        }
        if (t.rows.some((r) => r[i] === null)) {
          throw new MiniSqlError(1138, "Error 1138: Invalid use of NULL value");
        }
        t.columns[i].pk = true;
        return { message: `Query OK, ${t.rows.length} row(s) affected` };
      }
      c.takeWord("COLUMN");
      const colName = c.ident();
      const type = parseColumnType(c);
      end(c);
      if (t.columns.some((col) => col.name.toLowerCase() === colName.toLowerCase())) {
        throw new MiniSqlError(1060, `Error 1060: Duplicate column name '${colName}'`);
      }
      t.columns.push({ name: colName, type });
      for (const r of t.rows) r.push(null);
      return { message: `Query OK, ${t.rows.length} row(s) affected` };
    }

    case "UPDATE": {
      const name = c.ident();
      const t = findTable(state, name);
      c.expectWord("SET");
      const sets: { i: number; val: { t: "str" | "num" | "word"; v: string } }[] = [];
      for (;;) {
        const colName = c.ident();
        const i = t.columns.findIndex((col) => col.name.toLowerCase() === colName.toLowerCase());
        if (i === -1) throw new MiniSqlError(1054, `Error 1054: Unknown column '${colName}' in 'field list'`);
        const eq = c.next();
        if (!eq || eq.t !== "op" || eq.v !== "=") c.fail(eq);
        const v = c.next();
        if (!v || (v.t !== "str" && v.t !== "num" && v.t !== "word")) c.fail(v);
        sets.push({ i, val: { t: (v as Tok).t as "str" | "num" | "word", v: (v as Tok).v } });
        const p = c.peek();
        if (p?.t === "punc" && p.v === ",") {
          c.next();
          continue;
        }
        break;
      }
      let where: Expr | undefined;
      if (c.takeWord("WHERE")) where = parseExpr(c);
      end(c);
      if (!where && state.safeUpdates) {
        throw new MiniSqlError(
          1175,
          "Error 1175: You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column. To disable safe mode: SET SQL_SAFE_UPDATES = 0;",
        );
      }
      // Coerce once up front so a bad value can't leave a half-updated table.
      const coerced = sets.map((s) => ({ i: s.i, v: coerce(t.columns[s.i], s.val, 1) }));
      const matching = t.rows.filter((r) => (where ? evalExpr(where, t, r) : true));
      // PRIMARY KEY rules checked before anything changes, so an error can't
      // half-update the table.
      const pi = pkIndex(t);
      const pkSet = pi === -1 ? undefined : coerced.find((s) => s.i === pi);
      if (pkSet) {
        if (pkSet.v === null) {
          throw new MiniSqlError(1048, `Error 1048: Column '${t.columns[pi].name}' cannot be null`);
        }
        // Every matching row would get the same value, so 2+ matches always
        // collide; one match collides only with a different row holding it.
        if (matching.length > 1 || t.rows.some((r) => !matching.includes(r) && r[pi] === pkSet.v)) {
          throw new MiniSqlError(1062, `Error 1062: Duplicate entry '${pkSet.v}' for key '${t.name}.PRIMARY'`);
        }
      }
      for (const r of matching) {
        for (const s of coerced) r[s.i] = s.v;
      }
      return { message: `Query OK, ${matching.length} row(s) affected` };
    }

    case "DELETE": {
      c.expectWord("FROM");
      const name = c.ident();
      const t = findTable(state, name);
      let where: Expr | undefined;
      if (c.takeWord("WHERE")) where = parseExpr(c);
      end(c);
      if (!where && state.safeUpdates) {
        throw new MiniSqlError(
          1175,
          "Error 1175: You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column. To disable safe mode: SET SQL_SAFE_UPDATES = 0;",
        );
      }
      const before = t.rows.length;
      t.rows = t.rows.filter((r) => (where ? !evalExpr(where, t, r) : false));
      // Note: the AUTO_INCREMENT counter deliberately does NOT reset — the
      // "ghost of deleted rows" is a week-2 teaching point.
      return { message: `Query OK, ${before - t.rows.length} row(s) affected` };
    }

    case "SET": {
      const name = c.ident();
      if (name.toUpperCase() !== "SQL_SAFE_UPDATES") {
        throw new MiniSqlError(1193, `Error 1193: Unknown system variable '${name}'`);
      }
      const eq = c.next();
      if (!eq || eq.t !== "op" || eq.v !== "=") c.fail(eq);
      const v = c.next();
      if (!v || v.t !== "num" || !["0", "1"].includes(v.v)) c.fail(v);
      end(c);
      state.safeUpdates = (v as Tok).v === "1";
      return { message: "Query OK" };
    }
  }
  throw synErr(c.peek());
}

/** After a statement is fully parsed, nothing may remain. */
function end(c: Cursor) {
  const t = c.peek();
  if (t) c.fail(t);
}

// ------------------------------------------------------------------ batch

/**
 * Split a script on semicolons, respecting quotes and `--` comments. A final
 * statement without a semicolon is an error — the habit this course teaches.
 */
export function splitStatements(script: string): string[] {
  const out: string[] = [];
  let buf = "";
  let i = 0;
  while (i < script.length) {
    const ch = script[i];
    if (ch === "-" && script[i + 1] === "-") {
      while (i < script.length && script[i] !== "\n") i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      const q = ch;
      buf += ch;
      i++;
      while (i < script.length && script[i] !== q) buf += script[i++];
      if (i < script.length) {
        buf += q;
        i++;
      }
      continue;
    }
    if (ch === ";") {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  if (buf.trim()) {
    throw new MiniSqlError(
      1064,
      `You have an error in your SQL syntax near '${buf.trim().slice(-20)}' — every statement ends with a semicolon`,
    );
  }
  return out;
}

/** Run a whole script, stopping at the first error — like Workbench does. */
export function runBatch(state: MiniState, script: string): BatchRun {
  let statements: string[];
  try {
    statements = splitStatements(script);
  } catch (e) {
    const err = e as MiniSqlError;
    return { outputs: [{ ok: false, sql: script.trim(), text: err.message }], error: { code: err.code, message: err.message } };
  }
  const outputs: MiniOutput[] = [];
  let result: MiniResult | undefined;
  for (const sql of statements) {
    try {
      const ok = runStatement(state, sql);
      outputs.push({ ok: true, sql, text: ok.message });
      if (ok.result) result = ok.result;
    } catch (e) {
      const err = e as MiniSqlError;
      outputs.push({ ok: false, sql, text: err.message });
      return { outputs, result, error: { code: err.code, message: err.message } };
    }
  }
  return { outputs, result };
}
