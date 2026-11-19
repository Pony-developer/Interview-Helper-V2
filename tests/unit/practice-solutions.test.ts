// @vitest-environment jsdom
/**
 * For every vanilla JS/TS coding task: its tests must PASS against the reference solution
 * and must NOT all pass against the starter code. Runs the real in-preview test kit in jsdom.
 * (React/Angular tasks need the Sandpack bundler and are checked in the browser.)
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadTasks } from "@/lib/content/loader";
import { TEST_KIT_SOURCE } from "@/lib/playground/test-kit-source";

type Results = { total: number; passed: number; tests: { name: string; status: string; error?: string }[] };

const ROOT = path.join(process.cwd(), "node_modules", ".cache", "assay-tasks");
let counter = 0;

async function runTask(files: Record<string, string>, tests: string, testsExt: string): Promise<Results> {
  const dir = path.join(ROOT, `run-${process.pid}-${counter++}`);
  rmSync(dir, { recursive: true, force: true });
  const write = (rel: string, code: string) => {
    const full = path.join(dir, rel);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, code);
  };
  for (const [p, code] of Object.entries(files)) write(p, code);
  write("styles.css", "");
  write("assay/test-kit.js", TEST_KIT_SOURCE);
  write(`assay/tests.${testsExt}`, tests);

  // Use the task's own index.html body (minus scripts) when it provides one.
  const html = files["/index.html"];
  const body = html ? (/<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html) : '<div id="app"></div><div id="root"></div>';
  document.body.innerHTML = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  const messages: Record<string, unknown>[] = [];
  window.parent.postMessage = ((m: Record<string, unknown>) => messages.push(m)) as typeof window.postMessage;

  const entry = Object.keys(files).find((p) => /^\/index\.(js|ts)$/.test(p));
  if (entry) await import(/* @vite-ignore */ path.join(dir, entry));
  await import(/* @vite-ignore */ path.join(dir, `assay/tests.${testsExt}`));
  const kit = (await import(/* @vite-ignore */ path.join(dir, "assay/test-kit.js"))) as { run: () => Promise<void> };
  await kit.run();
  return messages.find((m) => m.type === "results") as unknown as Results;
}

const { tasks } = await loadTasks();
const vanilla = tasks.filter(
  (t): t is Extract<typeof t, { kind: "practice" }> =>
    t.kind === "practice" &&
    (t.framework === "vanilla-js" || t.framework === "vanilla-ts") &&
    // jsdom has no layout/cascade from imported CSS: CSS tasks are verified in the browser.
    !Object.keys(t.solution).some((p) => p.endsWith(".css")),
);

afterEach(() => {
  document.body.innerHTML = "";
});

describe.each(vanilla.map((t) => [t.slug, t] as const))("%s", (_slug, task) => {
  const ext = task.framework === "vanilla-js" ? "js" : "ts";

  it("passes all tests with the reference solution", async () => {
    const results = await runTask({ ...task.files, ...task.solution }, task.tests, ext);
    const failed = results.tests.filter((t) => t.status !== "pass").map((t) => `${t.name}: ${t.error}`);
    expect(failed).toEqual([]);
    expect(results.total).toBeGreaterThan(0);
  }, 20_000);

  it("does not pass with the starter code", async () => {
    const results = await runTask(task.files, task.tests, ext);
    expect(results.passed).toBeLessThan(results.total);
  }, 20_000);
});
