/**
 * Turn a canonical SQL solution into a Parsons puzzle — the mixed-up-lines
 * fallback a stuck student gets instead of being shown the answer.
 *
 * WHY THIS EXISTS. `SqlConsole` reveals a `hint` after two misses, but only for
 * tasks that carry one — and the hint-fading convention deliberately leaves the
 * final compose-from-scratch tasks of every console with no hint at all. Those
 * are exactly the tasks a student is most likely to be stuck on, and a required
 * step has no self-serve skip, so the only way out was asking the teacher. (See
 * docs/agent/bugs/BUG-015.)
 *
 * The fix is NOT a bottom-out hint. Students skip straight to the final hint on
 * 82-89% of steps (Aleven & Koedinger), and unproductive hint use is
 * consistently negatively associated with learning. Falling back to a Parsons
 * problem instead keeps the thinking: students who could fall back scored the
 * same on posttests as those who wrote code unaided while getting further in
 * practice, and puzzle-scaffolding held engagement (~22.7 min) where simply
 * showing the solution collapsed it (~15.8 min, some finishing in under two
 * minutes by copying). This is Ericson's intra-problem adaptation: when the
 * learner struggles, make the same problem easier rather than answering it.
 *
 * SPLITTING RULE. Fragments are cut at top-level SQL clause keywords only —
 * never inside quotes or parentheses. That matters twice: it keeps a column
 * list like `( id INT, name VARCHAR(50) )` intact, and it means the puzzle has
 * exactly ONE valid order, because SQL clause order is fixed. Splitting on AND
 * / OR is deliberately NOT done — `WHERE a AND b` and `WHERE b AND a` are both
 * correct, and a puzzle with two right answers marks a correct student wrong
 * (the trap recorded in BUG-017).
 */

/** Clause keywords that begin a new fragment, longest-first so `LEFT OUTER JOIN` wins over `JOIN`. */
const CLAUSE_KEYWORDS = [
  "INSERT INTO",
  "DELETE FROM",
  // ALTER's tails. Without these an `ALTER TABLE x ADD PRIMARY KEY (id);` is one
  // atomic fragment and offers the stuck student nothing to assemble.
  "ADD PRIMARY KEY",
  "ADD FOREIGN KEY",
  "ADD CONSTRAINT",
  "DROP FOREIGN KEY",
  "ADD COLUMN",
  "REFERENCES",
  "AUTO_INCREMENT",
  "LEFT OUTER JOIN",
  "RIGHT OUTER JOIN",
  "INNER JOIN",
  "LEFT JOIN",
  "RIGHT JOIN",
  "CROSS JOIN",
  "ORDER BY",
  "GROUP BY",
  "CREATE TABLE",
  "CREATE DATABASE",
  "DROP TABLE",
  "DROP DATABASE",
  "ALTER TABLE",
  "SHOW TABLES",
  "SHOW DATABASES",
  "DESCRIBE",
  "SELECT",
  "UPDATE",
  "VALUES",
  "WHERE",
  "HAVING",
  "JOIN",
  "FROM",
  "SET",
  "USE",
  "ON",
];

/** Split a script into top-level statements, keeping each one's trailing `;`. */
function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let buf = "";
  let quote: string | null = null;
  let depth = 0;
  for (const ch of sql) {
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      buf += ch;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    buf += ch;
    if (ch === ";" && depth === 0) {
      const t = buf.trim();
      if (t) out.push(t);
      buf = "";
    }
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

/**
 * Cut one statement at top-level clause keywords. Returns the statement
 * unsplit (a single fragment) when it has no interior clause boundary.
 */
function splitClauses(statement: string): string[] {
  const cuts: number[] = [];
  let quote: string | null = null;
  let depth = 0;
  const upper = statement.toUpperCase();

  for (let i = 0; i < statement.length; i++) {
    const ch = statement[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (ch === "(") { depth++; continue; }
    if (ch === ")") { depth--; continue; }
    if (depth !== 0) continue;
    // A keyword only starts a fragment at a word boundary.
    const prev = i === 0 ? " " : statement[i - 1];
    if (!/[\s;]/.test(prev)) continue;
    for (const kw of CLAUSE_KEYWORDS) {
      if (!upper.startsWith(kw, i)) continue;
      const after = statement[i + kw.length];
      if (after !== undefined && !/[\s(;]/.test(after)) continue;
      if (i > 0) cuts.push(i);
      i += kw.length - 1;
      break;
    }
  }

  if (cuts.length === 0) return [statement.trim()];
  const parts: string[] = [];
  let start = 0;
  for (const c of cuts) {
    const seg = statement.slice(start, c).trim();
    if (seg) parts.push(seg);
    start = c;
  }
  const last = statement.slice(start).trim();
  if (last) parts.push(last);
  return parts;
}

/**
 * The ordered fragments a student reassembles. Joining them with single spaces
 * reproduces the solution, so the puzzle is checked by rebuilding the string
 * and running it — there is no separate answer key to drift out of sync.
 */
export function toParsonsFragments(solution: string): string[] {
  const statements = splitStatements(solution);
  // A multi-statement solution is a puzzle about statement ORDER; cutting each
  // statement into clauses as well would swamp it with fragments.
  if (statements.length > 1) return statements;
  return splitClauses(statements[0] ?? solution);
}

/** Rebuild the SQL a given fragment order represents. */
export function assembleFragments(fragments: string[]): string {
  return fragments.join(" ").replace(/\s+;/g, ";").trim();
}

/** Whether a solution splits into enough pieces to be worth assembling. */
export function isAssemblable(solution: string): boolean {
  return toParsonsFragments(solution).length >= 2;
}
