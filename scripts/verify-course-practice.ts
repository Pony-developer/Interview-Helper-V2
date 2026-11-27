/**
 * Runs every C# practice in the courses on Wandbox and checks that
 *   - the reference solution prints exactly `expectedOutput`, and
 *   - the starter code does NOT (otherwise the task is already solved).
 *   npx tsx scripts/verify-course-practice.ts [course-slug]
 * Sends only the authored starter and solution code to wandbox.org.
 */
import { courseModules } from "@content/course-modules";
import { runCSharp as runOnce, type RunResult } from "@/lib/runner/csharp";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wandbox rate-limits bursts: pause between runs and back off on 429. */
async function runCSharp(code: string): Promise<RunResult> {
  for (let attempt = 0; ; attempt++) {
    await sleep(attempt === 0 ? 4_000 : 30_000 * attempt);
    const result = await runOnce(code);
    if (result.status !== "unavailable" || result.reason !== "busy" || attempt >= 4) return result;
    console.log("  Wandbox is rate-limiting, waiting…");
  }
}

const normalize = (s: string) =>
  s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+(\n|$)/g, "$1")
    .replace(/[ \t\n]+$/, "");

async function main() {
  let failures = 0;
  const only = process.argv[2];
  for (const [course, modules] of Object.entries(courseModules)) {
    if (only && course !== only) continue;
    for (const mod of modules) {
      for (const slide of mod.slides) {
        if (slide.kind !== "practice") continue;
        const label = `${course}/${slide.slug}`;
        const solved = await runCSharp(slide.solution);
        if (solved.status !== "ok" || normalize(solved.output) !== normalize(slide.expectedOutput)) {
          failures++;
          console.error(`✗ ${label}: solution does not produce the expected output`, JSON.stringify(solved));
          continue;
        }
        const starter = await runCSharp(slide.starter);
        if (starter.status === "ok" && normalize(starter.output) === normalize(slide.expectedOutput)) {
          failures++;
          console.error(`✗ ${label}: the starter code already passes`);
          continue;
        }
        console.log(`✓ ${label} (starter: ${starter.status})`);
      }
    }
  }
  if (failures) process.exit(1);
}

main();
