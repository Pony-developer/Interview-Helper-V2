// @vitest-environment jsdom
/**
 * Runs the in-preview test kit (the exact source injected into Sandpack) inside jsdom.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { buildSandpackFiles, countTests, type PracticePayload } from "@/lib/playground/frameworks";
import { TEST_KIT_SOURCE } from "@/lib/playground/test-kit-source";

type Kit = {
  describe: (n: string, b: () => void) => void;
  it: (n: string, b: () => unknown) => void;
  expect: (v: unknown) => Record<string, (...a: unknown[]) => unknown> & { not: Record<string, (...a: unknown[]) => unknown> };
  fn: (impl?: (...a: unknown[]) => unknown) => ((...a: unknown[]) => unknown) & { mock: { calls: unknown[][] } };
  screen: Record<string, (...a: unknown[]) => unknown>;
  user: { click: (el: Element) => Promise<void>; type: (el: Element, t: string) => Promise<void> };
  run: () => Promise<void>;
};

let kit: Kit;
const posted: Record<string, unknown>[] = [];

beforeAll(async () => {
  // Must live inside the project root for Vite to import it.
  const dir = path.join(process.cwd(), "node_modules", ".cache", "assay-kit");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `test-kit-${process.pid}.mjs`);
  writeFileSync(file, TEST_KIT_SOURCE);
  window.parent.postMessage = ((msg: Record<string, unknown>) => posted.push(msg)) as typeof window.postMessage;
  kit = (await import(/* @vite-ignore */ file)) as Kit;
});

describe("matchers", () => {
  it("compares deeply and supports .not", () => {
    kit.expect({ a: [1, { b: 2 }], c: undefined }).toEqual({ a: [1, { b: 2 }] });
    kit.expect([1, 2]).not.toEqual([2, 1]);
    kit.expect(new Map([["k", 1]])).toEqual(new Map([["k", 1]]));
    kit.expect(() => kit.expect(1).toBe(2)).toThrow(/Expected 1 to be 2/);
    kit.expect(() => {
      throw new TypeError("bad");
    }).toThrow(TypeError);
    kit.expect(0.1 + 0.2).toBeCloseTo(0.3);
    kit.expect("assay").toMatch(/ss/);
  });

  it("tracks mock calls", () => {
    const f = kit.fn((x: unknown) => (x as number) * 2);
    f(2);
    f(3);
    kit.expect(f).toHaveBeenCalledTimes(2);
    kit.expect(f).toHaveBeenCalledWith(3);
  });
});

describe("DOM helpers", () => {
  it("queries by role, label and text, and simulates user input", async () => {
    document.body.innerHTML = `
      <main>
        <h1>Counter</h1>
        <label for="name">Name</label><input id="name" />
        <button aria-label="Increment counter">+</button>
        <p data-testid="out">0</p>
      </main>`;
    const button = kit.screen.getByRole("button", { name: /increment/i }) as HTMLButtonElement;
    let n = 0;
    button.addEventListener("click", () => {
      document.querySelector("[data-testid=out]")!.textContent = String(++n);
    });
    await kit.user.click(button);
    kit.expect(kit.screen.getByTestId("out")).toHaveTextContent("1");
    const input = kit.screen.getByLabelText("Name") as HTMLInputElement;
    await kit.user.type(input, "Ada");
    kit.expect(input).toHaveValue("Ada");
    kit.expect(kit.screen.getByRole("heading", { level: 1 })).toHaveTextContent("Counter");
    kit.expect(() => kit.screen.getByText("missing")).toThrow(/Unable to find/);
  });
});

describe("runner", () => {
  it("runs registered tests, de-duplicates hot reloads and posts results", async () => {
    kit.describe("suite", () => {
      kit.it("passes", () => kit.expect(1).toBe(1));
      kit.it("fails", () => kit.expect(1).toBe(2));
    });
    // A hot reload re-registers the same tests: they must replace, not duplicate.
    kit.describe("suite", () => {
      kit.it("passes", () => kit.expect(1).toBe(1));
      kit.it("fails", () => kit.expect(2).toBe(2));
    });
    await kit.run();
    const results = posted.find((m) => m.type === "results") as { total: number; passed: number; tests: { name: string }[] };
    expect(results.total).toBe(2);
    expect(results.passed).toBe(2);
    expect(results.tests.map((t) => t.name)).toEqual(["suite › passes", "suite › fails"]);
  });
});

describe("buildSandpackFiles", () => {
  const practice: PracticePayload = {
    framework: "angular",
    files: { "/src/app/app.component.ts": "export class AppComponent {}" },
    tests: 'import { it } from "./test-kit";\nit("a", () => {});\ntest("b", () => {});',
    testCount: 2,
  };

  it("injects hidden kit, tests and runner, and wires the entry", () => {
    const files = buildSandpackFiles(practice);
    expect(files["/assay/test-kit.js"].hidden).toBe(true);
    expect(files["/assay/tests.ts"].code).toContain('it("a"');
    expect(files["/src/main.ts"].hidden).toBe(true);
    expect(files["/src/main.ts"].code.trim().endsWith('import "../assay/run";')).toBe(true);
    expect(files["/src/app/app.component.ts"].hidden).toBeUndefined();
  });

  it("counts test cases", () => {
    expect(countTests(practice.tests)).toBe(2);
    expect(countTests("const split = items.split(','); // not a test")).toBe(0);
  });
});
