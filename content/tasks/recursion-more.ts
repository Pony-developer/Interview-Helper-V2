import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "rec-frame-count",
    ["recursion"],
    2,
    60,
    ["Frames on the call stack", "Кадри в стеку викликів"],
    ["At its deepest point, how many `factorial` calls are on the call stack during `factorial(4)`?", "Скільки викликів `factorial` перебуває в стеку в найглибшій точці під час `factorial(4)`?"],
    [
      ["1", "1"],
      ["4", "4"],
      ["5", "5"],
      ["24", "24"],
    ],
    "b",
    [
      "`factorial(4)` calls `factorial(3)`, then 2, then 1, which hits the base case. Each call waits for the next one, so 4 frames are stacked at the deepest point. Stack depth grows linearly with `n`, which is why very large inputs overflow.",
      "`factorial(4)` викликає `factorial(3)`, потім 2, потім 1, що досягає базового випадку. Кожен виклик чекає на наступний, тож у найглибшій точці в стеку 4 кадри. Глибина стеку зростає лінійно з `n`, тому дуже великі вхідні дані його переповнюють.",
    ],
    { code: "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}", codeLanguage: "js" },
  ),
  quiz(
    "rec-tail-calls",
    ["recursion", { slug: "javascript", weight: 0.5 }],
    4,
    90,
    ["Tail calls in JavaScript", "Хвостові виклики в JavaScript"],
    ["`sumTo` is tail-recursive. What happens with `sumTo(1_000_000)` in Chrome or Node.js?", "`sumTo` хвостово-рекурсивна. Що станеться з `sumTo(1_000_000)` у Chrome чи Node.js?"],
    [
      ["It returns the sum, because tail calls are optimised", "Повертає суму, бо хвостові виклики оптимізуються"],
      ["It throws \"Maximum call stack size exceeded\"", "Кидає \"Maximum call stack size exceeded\""],
      ["It returns `Infinity`", "Повертає `Infinity`"],
      ["It runs, but only in strict mode", "Працює, але лише в строгому режимі"],
    ],
    "b",
    [
      "ES2015 specifies proper tail calls in strict mode, but V8 (Chrome, Node.js) and Firefox never shipped them; only Safari's JavaScriptCore does. Each call still uses a stack frame, so a million calls overflow. Rewrite deep recursion as a loop, use an explicit stack, or use a trampoline.",
      "ES2015 визначає оптимізацію хвостових викликів у строгому режимі, але V8 (Chrome, Node.js) і Firefox її так і не впровадили; лише JavaScriptCore у Safari. Кожен виклик досі займає кадр стеку, тож мільйон викликів переповнює стек. Перепишіть глибоку рекурсію циклом, використайте явний стек або трамплін.",
    ],
    { code: '"use strict";\nfunction sumTo(n, acc = 0) {\n  if (n === 0) return acc;\n  return sumTo(n - 1, acc + n);\n}', codeLanguage: "js" },
  ),
  quiz(
    "rec-trampoline",
    ["recursion"],
    5,
    120,
    ["Trampolines", "Трампліни"],
    ["What does `trampoline` achieve for `sumTo`?", "Чого досягає `trampoline` для `sumTo`?"],
    [
      ["It runs the steps in parallel", "Виконує кроки паралельно"],
      ["It keeps the stack depth constant: each step returns a thunk instead of calling itself", "Тримає глибину стеку сталою: кожен крок повертає thunk замість виклику себе"],
      ["It memoizes every intermediate result", "Мемоїзує кожен проміжний результат"],
      ["It turns the recursion into a generator", "Перетворює рекурсію на генератор"],
    ],
    "b",
    [
      "Instead of recursing, each step returns a function describing the next step. The `while` loop calls these thunks one after another, so only one frame is on the stack at a time and depth no longer depends on `n`. The cost is an allocation per step, and results that are themselves functions need a different marker.",
      "Замість рекурсії кожен крок повертає функцію, що описує наступний крок. Цикл `while` викликає ці thunk-и по черзі, тож у стеку одночасно лише один кадр, і глибина не залежить від `n`. Ціна — одна алокація на крок, а результатам, що самі є функціями, потрібен інший маркер.",
    ],
    { code: 'const trampoline = (fn) => (...args) => {\n  let result = fn(...args);\n  while (typeof result === "function") result = result();\n  return result;\n};\n\nconst sumTo = trampoline(function step(n, acc = 0) {\n  return n === 0 ? acc : () => step(n - 1, acc + n);\n});', codeLanguage: "js" },
  ),
  practice({
    slug: "rec-unique-permutations",
    skills: ["recursion", { slug: "arrays-strings", weight: 0.5 }],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Unique permutations", "Унікальні перестановки"],
    prompt: [
      "Implement `permutations(items)`, which returns every ordering of `items` **without duplicates**, even when `items` contains repeated values.\n\n- Generate them depth-first, choosing positions from left to right and trying candidates in input order, so the output order is predictable.\n- Don't generate duplicates and filter them out afterwards: skip a value that has already been tried at the same position.\n\n```ts\npermutations([1, 2, 3]) // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]\npermutations([1, 1, 2]) // [[1,1,2],[1,2,1],[2,1,1]]\n```",
      "Реалізуйте `permutations(items)`, що повертає всі впорядкування `items` **без дублікатів**, навіть якщо `items` містить повторювані значення.\n\n- Генеруйте їх у глибину, обираючи позиції зліва направо й пробуючи кандидатів у порядку вхідних даних, щоб порядок результату був передбачуваним.\n- Не генеруйте дублікати, щоб потім їх відфільтрувати: пропускайте значення, яке вже пробували на тій самій позиції.\n\n```ts\npermutations([1, 2, 3]) // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]\npermutations([1, 1, 2]) // [[1,1,2],[1,2,1],[2,1,1]]\n```",
    ],
    files: {
      "/src/permutations.ts": "export function permutations<T>(items: T[]): T[][] {\n  // TODO: backtracking, skipping values already tried at this position\n  return [items];\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { permutations } from "./src/permutations";\n\ndocument.getElementById("app")!.innerHTML =\n  "<h1>Permutations of A, A, B</h1><ul>" + permutations(["A", "A", "B"]).map((p) => "<li>" + p.join("") + "</li>").join("") + "</ul>";\n',
    },
    visibleFiles: ["/src/permutations.ts", "/index.ts"],
    activeFile: "/src/permutations.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { permutations } from "../src/permutations";\n\ndescribe("permutations", () => {\n  it("lists all orderings of distinct items in order", () => {\n    expect(permutations([1, 2, 3])).toEqual([[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]);\n  });\n  it("skips duplicate orderings", () => {\n    expect(permutations([1, 1, 2])).toEqual([[1, 1, 2], [1, 2, 1], [2, 1, 1]]);\n  });\n  it("handles duplicates that are not adjacent", () => {\n    expect(permutations(["b", "a", "b"])).toEqual([["b", "a", "b"], ["b", "b", "a"], ["a", "b", "b"]]);\n  });\n  it("counts correctly for larger inputs", () => {\n    expect(permutations([1, 2, 3, 4, 5])).toHaveLength(120);\n    expect(permutations([1, 1, 2, 2, 3])).toHaveLength(30);\n  });\n  it("handles empty and single inputs", () => {\n    expect(permutations([])).toEqual([[]]);\n    expect(permutations(["x"])).toEqual([["x"]]);\n  });\n  it("does not mutate the input", () => {\n    const input = [3, 1, 2];\n    permutations(input);\n    expect(input).toEqual([3, 1, 2]);\n  });\n});\n',
    solution: {
      "/src/permutations.ts":
        "export function permutations<T>(items: T[]): T[][] {\n  const result: T[][] = [];\n  const used = new Array<boolean>(items.length).fill(false);\n  const current: T[] = [];\n\n  const build = () => {\n    if (current.length === items.length) {\n      result.push([...current]);\n      return;\n    }\n    const triedHere = new Set<T>();\n    for (let i = 0; i < items.length; i++) {\n      if (used[i] || triedHere.has(items[i])) continue;\n      triedHere.add(items[i]);\n      used[i] = true;\n      current.push(items[i]);\n      build();\n      current.pop();\n      used[i] = false;\n    }\n  };\n\n  build();\n  return result;\n}\n",
    },
    explanation: [
      "Backtracking fills one position per recursion level: mark an unused item, recurse, then undo the choice. A `Set` of values already tried **at this level** prunes duplicate branches before they are explored, so equal values never start two identical subtrees. There are n!/(k₁!·k₂!·…) results, each copied in O(n).",
      "Пошук із поверненням заповнює одну позицію на кожному рівні рекурсії: позначити невикористаний елемент, рекурсивно продовжити, потім скасувати вибір. `Set` значень, уже випробуваних **на цьому рівні**, відсікає дубльовані гілки ще до їх обходу, тож рівні значення ніколи не породжують два однакові піддерева. Результатів n!/(k₁!·k₂!·…), кожен копіюється за O(n).",
    ],
  }),
]);
