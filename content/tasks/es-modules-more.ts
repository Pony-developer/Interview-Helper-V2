import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "esm-named-default",
    ["es-modules"],
    1,
    45,
    ["Named and default imports", "Іменовані й типові імпорти"],
    ["`math.js` contains the exports below. Which import is correct?", "`math.js` містить експорти нижче. Який імпорт правильний?"],
    [
      ["`import { sum, PI } from \"./math.js\";`", "`import { sum, PI } from \"./math.js\";`"],
      ["`import sum, { PI } from \"./math.js\";`", "`import sum, { PI } from \"./math.js\";`"],
      ["`import sum, PI from \"./math.js\";`", "`import sum, PI from \"./math.js\";`"],
      ["`const { sum, PI } = import \"./math.js\";`", "`const { sum, PI } = import \"./math.js\";`"],
    ],
    "b",
    [
      "A default export is imported without braces, under any name you choose. Named exports are imported inside braces with their exact names (or renamed with `as`). One statement can do both: `import sum, { PI } from ...`.",
      "Типовий експорт імпортується без фігурних дужок під будь-яким ім'ям. Іменовані експорти імпортуються у фігурних дужках з точними іменами (або перейменовуються через `as`). Одна інструкція може робити обидва: `import sum, { PI } from ...`.",
    ],
    { code: "// math.js\nexport default function sum(a, b) {\n  return a + b;\n}\nexport const PI = 3.14159;", codeLanguage: "js" },
  ),
  quiz(
    "esm-top-level-await",
    ["es-modules", { slug: "async-javascript", weight: 0.5 }],
    4,
    90,
    ["Top-level await", "await на верхньому рівні"],
    ["`config.js` uses top-level `await` to fetch settings. `app.js` imports it. What happens?", "`config.js` використовує `await` на верхньому рівні, щоб отримати налаштування. `app.js` його імпортує. Що відбувається?"],
    [
      ["`app.js` runs immediately and sees `settings` as `undefined`", "`app.js` виконується одразу й бачить `settings` як `undefined`"],
      ["`app.js` doesn't start evaluating until `config.js` finishes, including the await", "`app.js` не почне виконуватися, доки `config.js` не завершиться, включно з await"],
      ["Top-level await blocks the browser's main thread until the fetch finishes", "await на верхньому рівні блокує головний потік браузера до завершення запиту"],
      ["It is a syntax error inside modules", "Це синтаксична помилка в модулях"],
    ],
    "b",
    [
      "A module with top-level `await` becomes asynchronous: modules that import it (directly or indirectly) wait for it to finish evaluating before they run. The thread isn't blocked, and unrelated parts of the graph can still evaluate. Use it for real initialisation, because a slow await delays everything that depends on the module.",
      "Модуль з `await` на верхньому рівні стає асинхронним: модулі, що його імпортують (прямо чи опосередковано), чекають завершення його виконання. Потік не блокується, і незалежні частини графа все одно можуть виконуватися. Використовуйте це для справжньої ініціалізації, бо повільний await затримує все, що залежить від модуля.",
    ],
    { code: '// config.js\nexport const settings = await fetch("/settings.json").then((r) => r.json());\n\n// app.js\nimport { settings } from "./config.js";\nconsole.log(settings.theme);', codeLanguage: "js" },
  ),
  quiz(
    "esm-cjs-interop",
    ["es-modules", { slug: "nodejs", weight: 0.5 }],
    5,
    120,
    ["Importing CommonJS from ESM", "Імпорт CommonJS з ESM"],
    ["In Node.js, `legacy.cjs` builds its exports dynamically. An ES module imports it as shown. What happens?", "У Node.js `legacy.cjs` формує експорти динамічно. ES-модуль імпортує його, як показано. Що станеться?"],
    [
      ["Both imports work", "Обидва імпорти працюють"],
      ["The default import works; the named import fails with a SyntaxError", "Типовий імпорт працює; іменований падає з SyntaxError"],
      ["The named import works; the default import is `undefined`", "Іменований імпорт працює; типовий — `undefined`"],
      ["ES modules can't import CommonJS files", "ES-модулі не можуть імпортувати файли CommonJS"],
    ],
    "b",
    [
      "When ESM imports CommonJS, the default import is always `module.exports`. Named imports only exist for names that Node's static analysis (cjs-module-lexer) can detect, such as `exports.parse = ...`. Exports built in a loop aren't detectable, so linking fails with \"does not provide an export named 'parse'\". Use the default import and destructure it.",
      "Коли ESM імпортує CommonJS, типовий імпорт — це завжди `module.exports`. Іменовані імпорти існують лише для імен, які може виявити статичний аналіз Node (cjs-module-lexer), наприклад `exports.parse = ...`. Експорти, створені в циклі, не виявляються, тож зв'язування падає з \"does not provide an export named 'parse'\". Використайте типовий імпорт і деструктуризуйте його.",
    ],
    {
      code: '// legacy.cjs\nconst api = {};\nfor (const name of ["parse", "format"]) {\n  api[name] = require("./impl/" + name);\n}\nmodule.exports = api;\n\n// main.mjs\nimport legacy from "./legacy.cjs";\nimport { parse } from "./legacy.cjs";',
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "esm-evaluation-order",
    skills: ["es-modules", { slug: "recursion", weight: 0.5 }],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Module evaluation order", "Порядок виконання модулів"],
    prompt: [
      "A module graph maps each module to the modules it imports, in source order. Implement `evaluationOrder(graph, entry)`, which returns the order in which an ES module loader evaluates them.\n\n- Dependencies are evaluated before the module that imports them, in import order (depth-first post-order).\n- Each module is evaluated **once**, even if many modules import it.\n- Cycles don't loop forever: a module that is already being loaded is skipped.\n- Importing a module that isn't in the graph throws an `Error` whose message contains its name.\n\n```ts\nevaluationOrder({ main: [\"a\", \"b\"], a: [\"c\"], b: [\"c\"], c: [] }, \"main\")\n// [\"c\", \"a\", \"b\", \"main\"]\n```",
      "Граф модулів зіставляє кожен модуль із модулями, які він імпортує, у порядку в коді. Реалізуйте `evaluationOrder(graph, entry)`, що повертає порядок, у якому завантажувач ES-модулів їх виконує.\n\n- Залежності виконуються раніше за модуль, що їх імпортує, у порядку імпортів (обхід у глибину, post-order).\n- Кожен модуль виконується **один раз**, навіть якщо його імпортує багато модулів.\n- Цикли не зациклюються: модуль, що вже завантажується, пропускається.\n- Імпорт модуля, якого немає в графі, кидає `Error` з його назвою в повідомленні.\n\n```ts\nevaluationOrder({ main: [\"a\", \"b\"], a: [\"c\"], b: [\"c\"], c: [] }, \"main\")\n// [\"c\", \"a\", \"b\", \"main\"]\n```",
    ],
    files: {
      "/src/order.ts":
        "export type ModuleGraph = Record<string, string[]>;\n\nexport function evaluationOrder(graph: ModuleGraph, entry: string): string[] {\n  // TODO: depth-first post-order, each module once\n  return [entry];\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { evaluationOrder } from "./src/order";\n\nconst graph = { "main.js": ["router.js", "store.js"], "router.js": ["utils.js"], "store.js": ["utils.js"], "utils.js": [] };\ndocument.getElementById("app")!.innerHTML =\n  "<h1>Evaluation order</h1><ol>" + evaluationOrder(graph, "main.js").map((m) => "<li>" + m + "</li>").join("") + "</ol>";\n',
    },
    visibleFiles: ["/src/order.ts", "/index.ts"],
    activeFile: "/src/order.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { evaluationOrder } from "../src/order";\n\ndescribe("evaluationOrder", () => {\n  it("evaluates dependencies first, each once", () => {\n    expect(evaluationOrder({ main: ["a", "b"], a: ["c"], b: ["c"], c: [] }, "main")).toEqual(["c", "a", "b", "main"]);\n  });\n  it("follows import order", () => {\n    expect(evaluationOrder({ main: ["b", "a"], a: [], b: [] }, "main")).toEqual(["b", "a", "main"]);\n  });\n  it("handles a module with no imports", () => {\n    expect(evaluationOrder({ solo: [] }, "solo")).toEqual(["solo"]);\n  });\n  it("does not loop on cycles", () => {\n    expect(evaluationOrder({ a: ["b"], b: ["a"] }, "a")).toEqual(["b", "a"]);\n    expect(evaluationOrder({ main: ["a"], a: ["b"], b: ["c", "a"], c: [] }, "main")).toEqual(["c", "b", "a", "main"]);\n  });\n  it("ignores modules that are not reachable", () => {\n    expect(evaluationOrder({ main: ["a"], a: [], unused: [] }, "main")).toEqual(["a", "main"]);\n  });\n  it("throws for missing modules", () => {\n    expect(() => evaluationOrder({ main: ["ghost"] }, "main")).toThrow("ghost");\n  });\n});\n',
    solution: {
      "/src/order.ts":
        "export type ModuleGraph = Record<string, string[]>;\n\nexport function evaluationOrder(graph: ModuleGraph, entry: string): string[] {\n  const order: string[] = [];\n  const visited = new Set<string>();\n\n  const visit = (name: string) => {\n    if (visited.has(name)) return; // already evaluated, or in progress (a cycle)\n    if (!Object.prototype.hasOwnProperty.call(graph, name)) {\n      throw new Error(\"Cannot find module '\" + name + \"'\");\n    }\n    visited.add(name);\n    for (const dependency of graph[name]) visit(dependency);\n    order.push(name);\n  };\n\n  visit(entry);\n  return order;\n}\n",
    },
    explanation: [
      "This is a depth-first post-order traversal. Marking a module as visited **before** walking its imports both deduplicates shared dependencies and breaks cycles: when `b` imports `a` while `a` is still loading, `a` is skipped, which is exactly why a circular import can see uninitialised bindings. `hasOwnProperty` avoids treating names like `toString` as modules.",
      "Це обхід у глибину з post-order. Позначення модуля відвіданим **до** обходу його імпортів і прибирає дублі спільних залежностей, і розриває цикли: коли `b` імпортує `a`, поки `a` ще завантажується, `a` пропускається — саме тому циклічний імпорт може бачити неініціалізовані прив'язки. `hasOwnProperty` не дає сприйняти імена на кшталт `toString` як модулі.",
    ],
  }),
]);
