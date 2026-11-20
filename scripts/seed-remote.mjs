// Applies supabase/seed.sql to the linked Supabase project.
//   node scripts/seed-remote.mjs [--yes] [--dry-run]
//
// Why not `supabase db push --include-seed`? The CLI records seed files it has already run and
// never runs them again, so content changes would never reach the database. And the whole seed
// (several MB) is too large for a single `supabase db query --remote` request (HTTP 413).
// So this splits each multi-row insert into smaller inserts with the same header and footer,
// keeps every statement in order, and runs the parts one after another. The seed is idempotent
// (upserts by slug, and only rows whose source is 'seed'), so re-running after a failure is safe.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline/promises";

const SEED = "supabase/seed.sql";
const PART_LIMIT_BYTES = 400_000;
const args = new Set(process.argv.slice(2));

/** Splits the generated seed into SQL statements, cutting large multi-row inserts into chunks. */
export function splitSeed(sql, limit = PART_LIMIT_BYTES) {
  const bytes = (s) => Buffer.byteLength(s, "utf8");
  const blocks = sql
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").filter((line) => line.trim() !== "" && !line.startsWith("--")))
    .filter((lines) => lines.length > 0 && !(lines.length === 1 && /^(begin|commit);$/.test(lines[0].trim())));

  const statements = [];
  let rowCount = 0;
  for (const lines of blocks) {
    // The generator writes one row per line, each starting with "  (".
    const first = lines.findIndex((line) => line.startsWith("  ("));
    if (first === -1) {
      statements.push(lines.join("\n"));
      continue;
    }
    let last = first;
    while (last + 1 < lines.length && lines[last + 1].startsWith("  (")) last++;
    let header = lines.slice(0, first);
    const rows = lines.slice(first, last + 1).map((row) => row.replace(/,$/, ""));
    const footer = lines.slice(last + 1);
    rowCount += rows.length;

    // Standalone statements before the insert (like the task_skills delete) are emitted once, on their own.
    const lastSemicolon = header.map((line) => line.trimEnd().endsWith(";")).lastIndexOf(true);
    if (lastSemicolon !== -1) {
      statements.push(header.slice(0, lastSemicolon + 1).join("\n"));
      header = header.slice(lastSemicolon + 1);
    }

    const fixed = bytes(header.join("\n")) + bytes(footer.join("\n")) + 16;
    let chunk = [];
    let size = fixed;
    const flush = () => {
      if (chunk.length) statements.push([...header, chunk.join(",\n"), ...footer].join("\n"));
      chunk = [];
      size = fixed;
    };
    for (const row of rows) {
      if (chunk.length && size + bytes(row) + 2 > limit) flush();
      chunk.push(row);
      size += bytes(row) + 2;
    }
    flush();
  }

  // Pack consecutive statements into parts under the limit; each part runs in its own transaction.
  const parts = [];
  let current = [];
  let currentSize = 0;
  for (const statement of statements) {
    if (current.length && currentSize + bytes(statement) > limit) {
      parts.push(current);
      current = [];
      currentSize = 0;
    }
    current.push(statement);
    currentSize += bytes(statement);
  }
  if (current.length) parts.push(current);
  return { parts: parts.map((p) => "begin;\n" + p.join("\n\n") + "\n\ncommit;\n"), rowCount };
}

function supabase(cliArgs) {
  // One quoted command string: `npx` needs a shell on Windows, and Node deprecates passing args alongside shell: true.
  const quote = (arg) => (/[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);
  const command = ["npx", "supabase", ...cliArgs].map(quote).join(" ");
  const result = spawnSync(command, { encoding: "utf8", shell: true });
  const output = (result.stdout ?? "") + (result.stderr ?? "");
  return { ok: result.status === 0 && !output.includes('"_tag":"Error"'), output };
}

async function main() {
  const seed = readFileSync(SEED, "utf8");
  const expectedRows = seed.split("\n").filter((line) => line.startsWith("  (")).length;
  const { parts, rowCount } = splitSeed(seed);
  if (rowCount !== expectedRows) throw new Error(`Split lost rows: ${rowCount} of ${expectedRows}`);
  console.log(`${SEED}: ${rowCount} rows in ${parts.length} parts.`);

  const dir = path.join(tmpdir(), "assay-seed-parts");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const files = parts.map((sql, i) => {
    const file = path.join(dir, `part-${String(i + 1).padStart(2, "0")}.sql`);
    writeFileSync(file, sql);
    return file;
  });
  if (args.has("--dry-run")) {
    console.log(`Dry run: parts written to ${dir}, nothing sent.`);
    return;
  }

  if (!args.has("--yes")) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question("Upsert this content into the LINKED Supabase project (it may be production)? [y/N] ");
    rl.close();
    if (!/^y(es)?$/i.test(answer.trim())) {
      console.log("Cancelled. Nothing was changed.");
      return;
    }
  }

  for (const [i, file] of files.entries()) {
    const { ok, output } = supabase(["db", "query", "--remote", "--yes", "-f", file]);
    if (!ok) {
      console.error(output.trim());
      console.error(`\nPart ${i + 1} of ${files.length} failed. Earlier parts were applied; fix the problem and re-run (the seed is idempotent).`);
      process.exit(1);
    }
    console.log(`Applied part ${i + 1} of ${files.length}.`);
  }
  console.log("Seed applied.");
}

await main();
