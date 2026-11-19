import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "js-nan-includes",
    ["javascript"],
    3,
    60,
    ["Finding NaN", "Пошук NaN"],
    ["What does this log?", "Що буде виведено?"],
    [
      ["`true -1`", "`true -1`"],
      ["`true 0`", "`true 0`"],
      ["`false -1`", "`false -1`"],
      ["`false 0`", "`false 0`"],
    ],
    "a",
    [
      "`includes` uses the SameValueZero algorithm, which treats `NaN` as equal to itself. `indexOf` uses strict equality (`===`), and `NaN === NaN` is `false`, so it returns -1. Use `Number.isNaN` or `includes` when you need to find `NaN`.",
      "`includes` використовує алгоритм SameValueZero, для якого `NaN` дорівнює собі. `indexOf` використовує строгу рівність (`===`), а `NaN === NaN` дає `false`, тож повертає -1. Щоб знайти `NaN`, використовуйте `Number.isNaN` або `includes`.",
    ],
    { code: "const values = [1, NaN, 3];\nconsole.log(values.includes(NaN), values.indexOf(NaN));", codeLanguage: "js" },
  ),
  quiz(
    "js-key-order",
    ["javascript"],
    4,
    75,
    ["Property order", "Порядок властивостей"],
    ["What does `Object.keys` return here?", "Що поверне `Object.keys` тут?"],
    [
      ["`[\"b\", \"2\", \"a\", \"1\"]`", "`[\"b\", \"2\", \"a\", \"1\"]`"],
      ["`[\"1\", \"2\", \"b\", \"a\"]`", "`[\"1\", \"2\", \"b\", \"a\"]`"],
      ["`[\"a\", \"b\", \"1\", \"2\"]`", "`[\"a\", \"b\", \"1\", \"2\"]`"],
      ["The order is not specified", "Порядок не визначено"],
    ],
    "b",
    [
      "Own property order is specified: integer-like keys first in ascending numeric order, then string keys in insertion order, then symbols (which `Object.keys` skips). Don't rely on insertion order for numeric-looking keys; use a `Map` if order matters.",
      "Порядок власних властивостей визначено: спершу ключі-цілі числа за зростанням, потім рядкові ключі в порядку вставки, потім символи (їх `Object.keys` пропускає). Не покладайтеся на порядок вставки для ключів, схожих на числа; якщо порядок важливий, використовуйте `Map`.",
    ],
    { code: "const scores = { b: 1, 2: 1, a: 1, 1: 1 };\nconsole.log(Object.keys(scores));", codeLanguage: "js" },
  ),
  quiz(
    "js-structured-clone",
    ["javascript"],
    5,
    120,
    ["structuredClone limits", "Межі structuredClone"],
    ["Which statements about `structuredClone(value)` are true? Select all that apply.", "Які твердження про `structuredClone(value)` правдиві? Оберіть усі правильні."],
    [
      ["It deep-copies `Map`, `Set` and `Date` values", "Глибоко копіює значення `Map`, `Set` і `Date`"],
      ["Class instances keep their prototype, so methods still work", "Екземпляри класів зберігають прототип, тож методи працюють"],
      ["It throws when the value contains a function", "Кидає помилку, якщо значення містить функцію"],
      ["It preserves circular references", "Зберігає циклічні посилання"],
    ],
    "acd",
    [
      "`structuredClone` uses the structured clone algorithm (the same as `postMessage`). It handles `Map`, `Set`, `Date`, typed arrays and cycles, but throws a `DataCloneError` for functions and DOM nodes. Class instances come back as plain objects: the prototype, getters and methods are lost.",
      "`structuredClone` використовує алгоритм структурного клонування (той самий, що й `postMessage`). Він обробляє `Map`, `Set`, `Date`, типізовані масиви й цикли, але кидає `DataCloneError` для функцій і DOM-вузлів. Екземпляри класів повертаються як звичайні об'єкти: прототип, гетери й методи втрачаються.",
    ],
  ),
  practice({
    slug: "js-deep-equal",
    skills: ["javascript", { slug: "recursion", weight: 0.5 }],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Implement deepEqual", "Реалізуйте deepEqual"],
    prompt: [
      "Implement `deepEqual(a, b)`, which compares two values structurally.\n\n- Primitives are equal when `Object.is` says so (so `NaN` equals `NaN`).\n- Arrays are equal when they have the same length and equal items. An array never equals a plain object.\n- Plain objects are equal when they have the same own keys, in any order, with equal values. `{ a: undefined }` does **not** equal `{}`.\n- `Date` objects are equal when they hold the same time.",
      "Реалізуйте `deepEqual(a, b)`, що порівнює два значення за структурою.\n\n- Примітиви рівні, якщо так каже `Object.is` (тож `NaN` дорівнює `NaN`).\n- Масиви рівні, якщо мають однакову довжину й рівні елементи. Масив ніколи не дорівнює звичайному об'єкту.\n- Звичайні об'єкти рівні, якщо мають однакові власні ключі в будь-якому порядку з рівними значеннями. `{ a: undefined }` **не** дорівнює `{}`.\n- Об'єкти `Date` рівні, якщо містять той самий час.",
    ],
    files: {
      "/src/deep-equal.ts": "export function deepEqual(a: unknown, b: unknown): boolean {\n  // TODO: compare arrays, plain objects and dates structurally\n  return a === b;\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { deepEqual } from "./src/deep-equal";\n\nconst cases: [unknown, unknown][] = [\n  [{ a: [1, 2] }, { a: [1, 2] }],\n  [{ a: 1 }, { a: 2 }],\n];\ndocument.getElementById("app")!.innerHTML =\n  "<h1>deepEqual</h1><ul>" + cases.map(([a, b]) => "<li>" + JSON.stringify(a) + " vs " + JSON.stringify(b) + ": " + deepEqual(a, b) + "</li>").join("") + "</ul>";\n',
    },
    visibleFiles: ["/src/deep-equal.ts", "/index.ts"],
    activeFile: "/src/deep-equal.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { deepEqual } from "../src/deep-equal";\n\ndescribe("deepEqual", () => {\n  it("compares primitives with Object.is", () => {\n    expect(deepEqual(1, 1)).toBe(true);\n    expect(deepEqual("a", "b")).toBe(false);\n    expect(deepEqual(NaN, NaN)).toBe(true);\n    expect(deepEqual(null, undefined)).toBe(false);\n  });\n  it("compares nested arrays and objects", () => {\n    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);\n    expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).toBe(false);\n  });\n  it("ignores key order", () => {\n    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);\n  });\n  it("checks array length", () => {\n    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);\n  });\n  it("never treats an array as an object", () => {\n    expect(deepEqual([1], { 0: 1 })).toBe(false);\n  });\n  it("treats a missing key differently from undefined", () => {\n    expect(deepEqual({ a: undefined }, {})).toBe(false);\n    expect(deepEqual({}, { a: undefined })).toBe(false);\n  });\n  it("compares dates by time", () => {\n    expect(deepEqual(new Date(0), new Date(0))).toBe(true);\n    expect(deepEqual(new Date(0), new Date(1))).toBe(false);\n    expect(deepEqual(new Date(0), {})).toBe(false);\n  });\n});\n',
    solution: {
      "/src/deep-equal.ts":
        "type Dict = Record<string, unknown>;\n\nexport function deepEqual(a: unknown, b: unknown): boolean {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== \"object\" || typeof b !== \"object\" || a === null || b === null) return false;\n\n  if (a instanceof Date || b instanceof Date) {\n    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();\n  }\n\n  if (Array.isArray(a) !== Array.isArray(b)) return false;\n  if (Array.isArray(a) && Array.isArray(b)) {\n    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));\n  }\n\n  const keysA = Object.keys(a);\n  const keysB = Object.keys(b);\n  if (keysA.length !== keysB.length) return false;\n  return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual((a as Dict)[key], (b as Dict)[key]));\n}\n",
    },
    explanation: [
      "Handle the cheap cases first: `Object.is` covers identical references, primitives and `NaN`. Anything that isn't a non-null object is then unequal. Special-case `Date`, then make sure both sides are arrays or both are objects before comparing items or keys. Checking key counts plus `hasOwnProperty` catches `{ a: undefined }` vs `{}`. The recursion depth equals the nesting depth of the data.",
      "Спершу прості випадки: `Object.is` покриває однакові посилання, примітиви й `NaN`. Усе, що не є ненульовим об'єктом, далі нерівне. Окремо обробіть `Date`, потім переконайтеся, що обидві сторони — масиви або обидві — об'єкти, і лише тоді порівнюйте елементи чи ключі. Перевірка кількості ключів разом із `hasOwnProperty` ловить `{ a: undefined }` проти `{}`. Глибина рекурсії дорівнює глибині вкладеності даних.",
    ],
  }),
]);
