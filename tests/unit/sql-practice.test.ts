/**
 * The PostgreSQL practice runner (src/lib/runner/sql.ts) and every SQL practice of the courses:
 * the reference solution must print exactly `expectedOutput` on PGlite, the engine learners use in
 * the browser, and the starter code must not. Regenerate outputs with
 *   npx tsx scripts/verify-sql-practice.ts --write
 */
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { courseModules } from "@content/course-modules";
import { loadCourseModules } from "@/lib/content/course-loader";
import { formatTable, rawParsers, runSql, splitStatements } from "@/lib/runner/sql";

const normalize = (s: string) =>
  s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+(\n|$)/g, "$1")
    .replace(/[ \t\n]+$/, "");

let template: PGlite;
let parsers: Record<number, (v: string) => string>;

beforeAll(async () => {
  template = await PGlite.create();
  parsers = await rawParsers(template);
}, 60_000);

afterAll(async () => {
  await template?.close();
});

async function run(setup: string, code: string) {
  const db = await template.clone();
  try {
    return await runSql(db, setup, code, parsers);
  } finally {
    await db.close();
  }
}

describe("splitStatements", () => {
  it("splits at top-level semicolons only", () => {
    expect(splitStatements("SELECT 1; SELECT 2;")).toEqual(["SELECT 1", "SELECT 2"]);
    expect(splitStatements("SELECT 'a;b'; SELECT \"x;y\" FROM t")).toEqual(["SELECT 'a;b'", 'SELECT "x;y" FROM t']);
    expect(splitStatements("SELECT 'it''s; fine'")).toEqual(["SELECT 'it''s; fine'"]);
    expect(splitStatements("SELECT E'a\\';b'; SELECT 2")).toEqual(["SELECT E'a\\';b'", "SELECT 2"]);
  });

  it("keeps dollar-quoted bodies and comments together", () => {
    const fn = "CREATE FUNCTION f() RETURNS int LANGUAGE plpgsql AS $$ BEGIN RETURN 1; END; $$";
    expect(splitStatements(`${fn}; SELECT f();`)).toEqual([fn, "SELECT f()"]);
    expect(splitStatements("SELECT $tag$;$tag$; SELECT 2")).toEqual(["SELECT $tag$;$tag$", "SELECT 2"]);
    expect(splitStatements("-- a; comment\nSELECT 1; /* b; /* nested; */ c; */ SELECT 2")).toEqual([
      "-- a; comment\nSELECT 1",
      "/* b; /* nested; */ c; */ SELECT 2",
    ]);
  });

  it("drops empty and comment-only statements", () => {
    expect(splitStatements(";; -- nothing\n ; /* still nothing */")).toEqual([]);
  });
});

describe("formatTable", () => {
  it("prints psql-style tables with right-aligned numbers and visible NULLs", () => {
    const out = formatTable({
      fields: [
        { name: "id", dataTypeID: 23 },
        { name: "name", dataTypeID: 25 },
      ],
      rows: [
        ["1", "Ann"],
        ["10", null],
      ],
    });
    expect(out).toBe([" id | name", "----+------", "  1 | Ann", " 10 | NULL", "(2 rows)"].join("\n"));
  });
});

describe("runSql", () => {
  it("prints every result set, keeps PostgreSQL's text form and stops at the first error", async () => {
    const result = await run(
      "CREATE TABLE t (d date, n numeric(5, 2), a int[]); INSERT INTO t VALUES ('2024-06-01', 2.5, '{1,2}');",
      "SELECT * FROM t; INSERT INTO t VALUES (NULL, 1, NULL); SELECT 1 / 0; SELECT 'never';",
    );
    expect(result.status).toBe("error");
    if (result.status !== "error") return;
    expect(result.output).toContain(" 2024-06-01 | 2.50 | {1,2}");
    expect(result.output).not.toContain("never");
    expect(result.error).toBe("ERROR:  division by zero");
  });

  it("reports a broken setup script", async () => {
    const result = await run("CREATE TABLE broken (", "SELECT 1");
    expect(result.status).toBe("error");
  });
});

describe("course content", () => {
  it("loads without validation errors", () => {
    expect(loadCourseModules().errors).toEqual([]);
  });
});

const sqlPractices = Object.entries(courseModules).flatMap(([course, modules]) =>
  modules
    .flatMap((m) => m.slides)
    .filter((s): s is Extract<typeof s, { kind: "practice" }> => s.kind === "practice" && s.language === "sql")
    .map((s) => [`${course}/${s.slug}`, s] as const),
);

describe.each(sqlPractices)("%s", (_label, slide) => {
  it("the solution prints the expected output", async () => {
    const result = await run(slide.setup ?? "", slide.solution);
    expect(result.status === "ok" ? normalize(result.output) : result).toBe(normalize(slide.expectedOutput));
  }, 30_000);

  it("the starter code does not pass", async () => {
    const result = await run(slide.setup ?? "", slide.starter);
    if (result.status === "ok") expect(normalize(result.output)).not.toBe(normalize(slide.expectedOutput));
  }, 30_000);
});
