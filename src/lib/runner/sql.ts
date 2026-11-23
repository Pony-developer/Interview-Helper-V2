/**
 * Runs PostgreSQL practices on PGlite (PostgreSQL compiled to WebAssembly) and prints the results
 * the way psql does. Shared by the browser worker (sql-worker.ts), the tests and the scripts, so the
 * expected outputs authored in content/ are produced by exactly the same code that grades learners.
 *
 * This module never imports PGlite itself: callers pass a ready database.
 */
import type { PGliteInterface } from "@electric-sql/pglite";

type ResultSet = { fields: { name: string; dataTypeID: number }[]; rows: unknown[] };

export type SqlRunResult =
  | { status: "ok"; output: string }
  /** `output` holds the results of the statements that ran before the failing one. */
  | { status: "error"; output: string; error: string }
  | { status: "unavailable"; reason: "timeout" | "load" | "too-large" };

export const MAX_SQL = 50_000;
const MAX_OUTPUT = 20_000;
const MAX_ROWS = 200;

/** Numeric types are right-aligned, like in psql. */
const NUMERIC_OIDS = new Set([20, 21, 23, 26, 700, 701, 790, 1700]);

/**
 * Splits a script into statements at top-level semicolons. Understands '…' strings (with '' and,
 * for E'…', backslash escapes), "quoted identifiers", -- and nested /* *\/ comments, and $tag$ bodies,
 * which is everything a semicolon can hide in. Empty statements and comment-only ones are dropped.
 */
export function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let start = 0;
  let i = 0;
  const n = sql.length;
  const push = (end: number) => {
    const stmt = sql.slice(start, end).trim();
    if (stmt && stripComments(stmt).trim()) out.push(stmt);
  };
  while (i < n) {
    const c = sql[i];
    const next = sql[i + 1];
    if (c === "-" && next === "-") {
      while (i < n && sql[i] !== "\n") i++;
    } else if (c === "/" && next === "*") {
      let depth = 1;
      i += 2;
      while (i < n && depth > 0) {
        if (sql[i] === "/" && sql[i + 1] === "*") {
          depth++;
          i += 2;
        } else if (sql[i] === "*" && sql[i + 1] === "/") {
          depth--;
          i += 2;
        } else i++;
      }
    } else if (c === "'") {
      const escapes = i > 0 && /[eE]/.test(sql[i - 1]) && (i < 2 || !/[A-Za-z0-9_]/.test(sql[i - 2]));
      i++;
      while (i < n) {
        if (escapes && sql[i] === "\\") i += 2;
        else if (sql[i] === "'" && sql[i + 1] === "'") i += 2;
        else if (sql[i] === "'") break;
        else i++;
      }
      i++;
    } else if (c === '"') {
      i++;
      while (i < n) {
        if (sql[i] === '"' && sql[i + 1] === '"') i += 2;
        else if (sql[i] === '"') break;
        else i++;
      }
      i++;
    } else if (c === "$" && (i === 0 || !/[A-Za-z0-9_]/.test(sql[i - 1]))) {
      const tag = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(i));
      if (tag) {
        const close = sql.indexOf(tag[0], i + tag[0].length);
        i = close === -1 ? n : close + tag[0].length;
      } else i++;
    } else if (c === ";") {
      push(i);
      i++;
      start = i;
    } else i++;
  }
  push(n);
  return out;
}

function stripComments(stmt: string) {
  return stmt.replace(/--[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Display width: wide (CJK) characters take two columns, like in a terminal. */
function width(s: string) {
  let w = 0;
  for (const ch of s) w += /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(ch) ? 2 : 1;
  return w;
}
const padEnd = (s: string, w: number) => s + " ".repeat(Math.max(0, w - width(s)));
const padStart = (s: string, w: number) => " ".repeat(Math.max(0, w - width(s))) + s;
const center = (s: string, w: number) => {
  const left = Math.floor((w - width(s)) / 2);
  return padEnd(" ".repeat(Math.max(0, left)) + s, w);
};

/** One result set as a psql-style table. NULL is shown as `NULL` so it can't be mistaken for ''. */
export function formatTable(result: ResultSet): string {
  const { fields } = result;
  const rows = result.rows.slice(0, MAX_ROWS).map((row) =>
    fields.map((_, i) => {
      const v = (row as unknown[])[i];
      return v === null || v === undefined ? "NULL" : String(v).replace(/\r?\n/g, "\\n");
    }),
  );
  const widths = fields.map((f, i) => Math.max(width(f.name), ...rows.map((r) => width(r[i]))));
  const lines = [
    fields.map((f, i) => ` ${center(f.name, widths[i])} `).join("|"),
    widths.map((w) => "-".repeat(w + 2)).join("+"),
    ...rows.map((r) =>
      r.map((v, i) => ` ${NUMERIC_OIDS.has(fields[i].dataTypeID) && v !== "NULL" ? padStart(v, widths[i]) : padEnd(v, widths[i])} `).join("|"),
    ),
  ];
  const total = result.rows.length;
  if (total > MAX_ROWS) lines.push(`… ${total - MAX_ROWS} more rows not shown`);
  lines.push(`(${total} ${total === 1 ? "row" : "rows"})`);
  return lines.map((l) => l.trimEnd()).join("\n");
}

type PgError = Error & { severity?: string; detail?: string; hint?: string };

/** "ERROR:  message" plus DETAIL and HINT lines, as psql prints them. */
export function formatError(e: unknown): string {
  const err = e as PgError;
  const lines = [`${err?.severity ?? "ERROR"}:  ${err?.message ?? String(e)}`];
  if (err?.detail) lines.push(`DETAIL:  ${err.detail}`);
  if (err?.hint) lines.push(`HINT:  ${err.hint}`);
  return lines.join("\n");
}

/** Every type parser replaced by identity, so values keep PostgreSQL's own text form (dates, numerics, arrays…). */
export async function rawParsers(db: PGliteInterface): Promise<Record<number, (v: string) => string>> {
  const { rows } = await db.query<{ oid: number }>("select oid::int as oid from pg_catalog.pg_type");
  return Object.fromEntries(rows.map((r) => [r.oid, (v: string) => v]));
}

/**
 * Runs the slide's setup script (schema and data), then the learner's code statement by statement.
 * Every statement that returns rows (SELECT, … RETURNING) prints a table; the tables are separated by
 * a blank line. Execution stops at the first error. A broken setup is reported as an error too.
 */
export async function runSql(
  db: PGliteInterface,
  setup: string,
  code: string,
  parsers?: Record<number, (v: string) => string>,
): Promise<SqlRunResult> {
  if (code.length > MAX_SQL) return { status: "unavailable", reason: "too-large" };
  const raw = parsers ?? (await rawParsers(db));
  // The same output everywhere: UTC timestamps and ISO dates, whatever the browser's settings.
  await db.exec("SET TimeZone = 'UTC'; SET DateStyle = 'ISO, YMD'; SET IntervalStyle = 'postgres'");
  if (setup.trim()) {
    try {
      await db.exec(setup);
    } catch (e) {
      return { status: "error", output: "", error: `The practice database could not be created.\n${formatError(e)}` };
    }
  }

  const blocks: string[] = [];
  const output = () => blocks.join("\n\n").slice(0, MAX_OUTPUT);
  for (const stmt of splitStatements(code)) {
    try {
      const results = await db.exec(stmt, { rowMode: "array", parsers: raw });
      for (const r of results) if (r.fields.length > 0) blocks.push(formatTable(r));
    } catch (e) {
      return { status: "error", output: output(), error: formatError(e) };
    }
  }
  return { status: "ok", output: output() };
}
