import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

/** Code strings: write ~ for a backtick. */
const code = (s: TemplateStringsArray) => String.raw(s).replace(/~/g, "`");

const SEMVER_STARTER = code`/**
 * Does a version satisfy an npm-style range? Supports *, exact versions, the comparators
 * >= <= > < =, several comparators separated by spaces (all must hold), and ^ and ~ ranges.
 */
export function satisfies(version: string, range: string): boolean {
  // TODO
  return false;
}
`;

const SEMVER_SOLUTION = code`type V = [number, number, number];

function parseVersion(text: string): V {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(text);
  if (m === null) throw new SyntaxError("Invalid version: " + text);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** A partial version such as "1", "1.2" or "1.2.3", remembering how many parts were written. */
function parsePartial(text: string): { v: V; parts: number } {
  const pieces = text.split(".");
  if (pieces.length > 3 || pieces.some((p) => !/^\d+$/.test(p))) throw new SyntaxError("Invalid version: " + text);
  const nums = pieces.map(Number);
  return { v: [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0], parts: nums.length };
}

const compare = (a: V, b: V) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** ^ keeps everything that doesn't change the first non-zero part: ^1.2.3 is <2.0.0, ^0.2.3 is <0.3.0, ^0.0.3 is <0.0.4. */
function caretBounds(text: string): [V, V] {
  const { v, parts } = parsePartial(text);
  const [major, minor, patch] = v;
  if (parts === 1 || major > 0) return [v, [major + 1, 0, 0]];
  if (parts === 2 || minor > 0) return [v, [0, minor + 1, 0]];
  return [v, [0, 0, patch + 1]];
}

/** ~ allows patch-level changes when a minor is given, and minor-level changes when only a major is. */
function tildeBounds(text: string): [V, V] {
  const { v, parts } = parsePartial(text);
  const [major, minor] = v;
  return [v, parts === 1 ? [major + 1, 0, 0] : [major, minor + 1, 0]];
}

export function satisfies(version: string, range: string): boolean {
  const v = parseVersion(version);
  const comparators = range.trim().split(/\s+/).filter((c) => c !== "");
  return comparators.every((c) => {
    if (c === "*") return true;
    if (c.startsWith("^") || c.startsWith("~")) {
      const [lo, hi] = c.startsWith("^") ? caretBounds(c.slice(1)) : tildeBounds(c.slice(1));
      return compare(v, lo) >= 0 && compare(v, hi) < 0;
    }
    const op = /^(>=|<=|>|<|=)?(.*)$/.exec(c)!;
    const diff = compare(v, parsePartial(op[2]).v);
    switch (op[1]) {
      case ">=":
        return diff >= 0;
      case "<=":
        return diff <= 0;
      case ">":
        return diff > 0;
      case "<":
        return diff < 0;
      default:
        return diff === 0;
    }
  });
}
`;

const SEMVER_INDEX = code`import "./styles.css";
import { satisfies } from "./src/semver";

document.getElementById("app")!.innerHTML = '<h1>Semver</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = ["1.4.2", "2.0.0"].map((v) => v + " ^1.2.3 → " + satisfies(v, "^1.2.3")).join("\n");
`;

const SEMVER_TESTS = code`import { describe, it, expect } from "./test-kit";
import { satisfies } from "../src/semver";

describe("satisfies", () => {
  it("caret ranges allow changes that keep the major version", () => {
    expect(satisfies("1.4.2", "^1.2.3")).toBe(true);
    expect(satisfies("2.0.0", "^1.2.3")).toBe(false);
    expect(satisfies("1.2.2", "^1.2.3")).toBe(false);
  });
  it("caret ranges below 1.0 lock the minor version, and below 0.1 the patch", () => {
    expect(satisfies("0.2.9", "^0.2.3")).toBe(true);
    expect(satisfies("0.3.0", "^0.2.3")).toBe(false);
    expect(satisfies("0.0.3", "^0.0.3")).toBe(true);
    expect(satisfies("0.0.4", "^0.0.3")).toBe(false);
  });
  it("caret with only a major accepts any minor and patch", () => {
    expect(satisfies("1.0.0", "^1")).toBe(true);
    expect(satisfies("1.9.9", "^1")).toBe(true);
    expect(satisfies("2.0.0", "^1")).toBe(false);
  });
  it("tilde ranges allow patch changes", () => {
    expect(satisfies("1.2.9", "~1.2.3")).toBe(true);
    expect(satisfies("1.3.0", "~1.2.3")).toBe(false);
    expect(satisfies("1.2.0", "~1.2")).toBe(true);
    expect(satisfies("1.3.0", "~1.2")).toBe(false);
  });
  it("tilde with only a major accepts any minor", () => {
    expect(satisfies("1.9.9", "~1")).toBe(true);
    expect(satisfies("2.0.0", "~1")).toBe(false);
  });
  it("combines comparators separated by spaces", () => {
    expect(satisfies("1.5.0", ">=1.2.0 <2.0.0")).toBe(true);
    expect(satisfies("2.0.0", ">=1.2.0 <2.0.0")).toBe(false);
    expect(satisfies("1.1.9", ">=1.2.0 <2.0.0")).toBe(false);
  });
  it("matches exact versions and anything with *", () => {
    expect(satisfies("1.2.3", "1.2.3")).toBe(true);
    expect(satisfies("1.2.4", "1.2.3")).toBe(false);
    expect(satisfies("0.0.1", "*")).toBe(true);
  });
  it("rejects invalid versions", () => {
    expect(() => satisfies("1.2", "^1")).toThrow("Invalid version");
  });
});
`;

export default defineTasks([
  quiz(
    "npm-ci-vs-install",
    ["npm", w("git", 0.3)],
    2,
    75,
    ["npm ci versus npm install", "npm ci проти npm install"],
    ["Which command should a CI pipeline run to install dependencies, and why?", "Яку команду має запускати CI-конвеєр для встановлення залежностей і чому?"],
    [
      ["`npm install`, because it updates the lockfile to the latest versions", "`npm install`, бо він оновлює lock-файл до останніх версій"],
      ["`npm ci`, because it installs exactly what package-lock.json records and fails if it disagrees with package.json", "`npm ci`, бо він встановлює рівно те, що записано в package-lock.json, і падає, якщо це не збігається з package.json"],
      ["`npm start`, because it installs and runs the project", "`npm start`, бо він встановлює і запускає проєкт"],
      ["`npm update`, because it keeps every dependency current", "`npm update`, бо він тримає кожну залежність актуальною"],
    ],
    "b",
    [
      "`npm ci` is built for repeatable builds: it deletes `node_modules` and installs from the lockfile without changing it. `npm install` may rewrite the lockfile, so two runs on different days can build different code, which is exactly what CI must avoid.",
      "`npm ci` створений для повторюваних збирань: він видаляє `node_modules` і встановлює з lock-файлу, не змінюючи його. `npm install` може переписати lock-файл, тож два запуски в різні дні можуть зібрати різний код, а саме цього CI має уникати.",
    ],
  ),
  practice({
    slug: "npm-semver-range",
    skills: ["npm", w("typescript"), w("nodejs", 0.3)],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Check versions against npm ranges", "Перевірте версії за діапазонами npm"],
    prompt: [
      "When `package.json` says `\"lodash\": \"^4.17.0\"`, npm decides which installed versions match. Implement `satisfies(version, range)` in `src/semver.ts` for the common cases:\n\n- A full version is `MAJOR.MINOR.PATCH`; anything else is a `SyntaxError` (\"Invalid version: …\").\n- `*` matches everything, and an exact version matches only itself.\n- Comparators `>=`, `<=`, `>`, `<` and `=`. Several comparators separated by spaces must all hold, so `>=1.2.0 <2.0.0` is a range.\n- `^` allows changes that don't alter the first non-zero part: `^1.2.3` is `>=1.2.3 <2.0.0`, `^0.2.3` is `<0.3.0`, `^0.0.3` is `<0.0.4`. A partial such as `^1` means `^1.0.0`.\n- `~` allows patch-level changes: `~1.2.3` is `<1.3.0`, and `~1` is `<2.0.0`.",
      "Коли в `package.json` написано `\"lodash\": \"^4.17.0\"`, npm вирішує, які встановлені версії підходять. Реалізуйте `satisfies(version, range)` у `src/semver.ts` для поширених випадків:\n\n- Повна версія — це `MAJOR.MINOR.PATCH`; усе інше — це `SyntaxError` (\"Invalid version: …\").\n- `*` підходить для всього, а точна версія — лише для себе.\n- Оператори `>=`, `<=`, `>`, `<` і `=`. Кілька операторів через пробіл мають виконуватися всі разом, тож `>=1.2.0 <2.0.0` — це діапазон.\n- `^` дозволяє зміни, що не змінюють першу ненульову частину: `^1.2.3` — це `>=1.2.3 <2.0.0`, `^0.2.3` — це `<0.3.0`, `^0.0.3` — це `<0.0.4`. Неповна версія на кшталт `^1` означає `^1.0.0`.\n- `~` дозволяє зміни на рівні патча: `~1.2.3` — це `<1.3.0`, а `~1` — це `<2.0.0`.",
    ],
    files: {
      "/src/semver.ts": SEMVER_STARTER,
      "/index.ts": SEMVER_INDEX,
    },
    visibleFiles: ["/src/semver.ts"],
    activeFile: "/src/semver.ts",
    tests: SEMVER_TESTS,
    solution: { "/src/semver.ts": SEMVER_SOLUTION },
    explanation: [
      "A range is a set of versions, and each operator just defines bounds on that set. The caret rule is the subtle one: npm treats `0.x` as unstable, so the first non-zero part is what's protected (`^0.2.3` may change patch versions, not minor ones), which is why the function looks at which parts are zero instead of always locking the major. Partial versions matter too: `^1` and `~1` carry less information, so their bounds widen. Comparing as a tuple of numbers (not strings, where `\"10\"` sorts before `\"9\"`) is the other trap. This is why `npm install` and `npm ci` can disagree about what \"4.17\" means without a lockfile to pin the exact version.",
      "Діапазон — це множина версій, а кожен оператор задає межі цієї множини. Правило для `^` найтонше: npm вважає `0.x` нестабільним, тож захищається перша ненульова частина (`^0.2.3` може змінювати версії патча, але не мінорні), тому функція дивиться, які частини нульові, а не завжди фіксує мажорну. Неповні версії теж важливі: `^1` і `~1` несуть менше інформації, тому їхні межі ширші. Ще одна пастка — порівняння як кортежу чисел, а не рядків, де `\"10\"` іде перед `\"9\"`. Тому без lock-файла, що фіксує точну версію, `npm install` і `npm ci` можуть по-різному трактувати «4.17».",
    ],
  }),
]);
