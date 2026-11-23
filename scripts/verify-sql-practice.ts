/**
 * Runs every PostgreSQL practice of the courses on PGlite (the engine learners use in the browser)
 * and checks that
 *   - the setup script and the reference solution run without errors,
 *   - the solution prints exactly `expectedOutput`, and
 *   - the starter code does NOT (otherwise the task is already solved).
 *
 *   npx tsx scripts/verify-sql-practice.ts           check
 *   npx tsx scripts/verify-sql-practice.ts --write   also write the solutions' output into
 *                                                    `expectedOutput` in content/course-modules
 * Everything runs locally; nothing is sent anywhere.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { courseModules } from "@content/course-modules";
import { rawParsers, runSql } from "@/lib/runner/sql";

const normalize = (s: string) =>
  s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+(\n|$)/g, "$1")
    .replace(/[ \t\n]+$/, "");

const write = process.argv.includes("--write");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice("--only=".length);

/** Replaces the `expectedOutput` of the practice `slug` in whichever content file defines it. */
function writeExpected(slug: string, output: string) {
  const dir = path.join(process.cwd(), "content", "course-modules");
  const files = [
    ...readdirSync(dir).filter((f) => f.endsWith(".ts")).map((f) => path.join(dir, f)),
    ...readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name.endsWith("-modules"))
      .flatMap((d) => readdirSync(path.join(dir, d.name)).map((f) => path.join(dir, d.name, f))),
  ];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    const at = src.indexOf(`slug: "${slug}"`);
    if (at === -1) continue;
    const re = /expectedOutput:\s*("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g;
    re.lastIndex = at;
    const m = re.exec(src);
    if (!m) throw new Error(`${slug}: no expectedOutput after the slug in ${file}`);
    const next = `expectedOutput: ${JSON.stringify(output.endsWith("\n") ? output : `${output}\n`)}`;
    writeFileSync(file, src.slice(0, m.index) + next + src.slice(m.index + m[0].length));
    return;
  }
  throw new Error(`${slug}: content file not found`);
}

async function main() {
  const template = await PGlite.create();
  const parsers = await rawParsers(template);
  const fresh = () => template.clone();
  let failures = 0;
  let checked = 0;

  for (const [course, modules] of Object.entries(courseModules)) {
    for (const slide of modules.flatMap((m) => m.slides)) {
      if (slide.kind !== "practice" || slide.language !== "sql") continue;
      if (only && slide.slug !== only) continue;
      const label = `${course}/${slide.slug}`;
      checked++;

      const db = await fresh();
      const solved = await runSql(db, slide.setup ?? "", slide.solution, parsers);
      await db.close();
      if (solved.status !== "ok") {
        failures++;
        console.error(`✗ ${label}: the solution fails\n${JSON.stringify(solved, null, 2)}`);
        continue;
      }
      if (write && normalize(solved.output) !== normalize(slide.expectedOutput)) {
        writeExpected(slide.slug, solved.output);
        console.log(`✎ ${label}: expected output written`);
      } else if (normalize(solved.output) !== normalize(slide.expectedOutput)) {
        failures++;
        console.error(`✗ ${label}: the solution prints\n${solved.output}\n--- but expected\n${slide.expectedOutput}`);
        continue;
      }

      const db2 = await fresh();
      const starter = await runSql(db2, slide.setup ?? "", slide.starter, parsers);
      await db2.close();
      if (starter.status === "ok" && normalize(starter.output) === normalize(solved.output)) {
        failures++;
        console.error(`✗ ${label}: the starter code already passes`);
        continue;
      }
      console.log(`✓ ${label} (starter: ${starter.status})`);
    }
  }
  await template.close();
  console.log(`${checked} SQL practices checked, ${failures} failed.`);
  process.exit(failures ? 1 : 0);
}

main();
