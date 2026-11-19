import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

const ALGO = { slug: "algorithms", weight: 0.5 };

export default defineTasks([
  quiz(
    "bigo-two-inputs",
    ["big-o", ALGO],
    3,
    60,
    ["Two different inputs", "Два різні входи"],
    ["`orders` has n items and `coupons` has m items. What is the time complexity?", "`orders` має n елементів, а `coupons` — m. Яка часова складність?"],
    [
      ["O(n²)", "O(n²)"],
      ["O(n + m)", "O(n + m)"],
      ["O(n · m)", "O(n · m)"],
      ["O(n log m)", "O(n log m)"],
    ],
    "c",
    [
      "The inner loop runs m times for each of the n outer iterations: O(n · m). Calling it O(n²) hides that the inputs are independent; if there are only a few coupons, this is effectively linear in n. Putting the coupon codes in a `Set` first would make it O(n + m).",
      "Внутрішній цикл виконується m разів для кожної з n зовнішніх ітерацій: O(n · m). Назва O(n²) приховує, що входи незалежні; якщо купонів лише кілька, це фактично лінійно за n. Якщо спершу покласти коди купонів у `Set`, вийде O(n + m).",
    ],
    { code: "for (const order of orders) {\n  for (const coupon of coupons) {\n    if (order.code === coupon.code) apply(order, coupon);\n  }\n}", codeLanguage: "js" },
  ),
  quiz(
    "bigo-recurrence",
    ["big-o", ALGO],
    4,
    90,
    ["Solving a recurrence", "Розв'язання рекурентності"],
    ["Each call does O(n) work and then recurses on half of the input once: T(n) = T(n/2) + n. What is T(n)?", "Кожен виклик виконує O(n) роботи й рекурсивно обробляє половину входу один раз: T(n) = T(n/2) + n. Чому дорівнює T(n)?"],
    [
      ["O(log n)", "O(log n)"],
      ["O(n)", "O(n)"],
      ["O(n log n)", "O(n log n)"],
      ["O(n²)", "O(n²)"],
    ],
    "b",
    [
      "The work per level is n + n/2 + n/4 + …, a geometric series that sums to less than 2n, so T(n) = O(n). Compare merge sort, T(n) = 2T(n/2) + n: there each level does n work in total across log n levels, giving O(n log n). Quickselect's average case follows the T(n/2) + n pattern.",
      "Робота на рівнях — n + n/2 + n/4 + …, геометрична прогресія із сумою менше 2n, тож T(n) = O(n). Порівняйте з сортуванням злиттям, T(n) = 2T(n/2) + n: там кожен рівень загалом виконує n роботи на log n рівнях, що дає O(n log n). Середній випадок quickselect відповідає шаблону T(n/2) + n.",
    ],
  ),
  quiz(
    "bigo-output-size",
    ["big-o", { slug: "recursion", weight: 0.5 }],
    5,
    120,
    ["Output-sensitive complexity", "Складність, залежна від виходу"],
    ["What is the tightest time bound for `subsets(items)` with n items?", "Яка найточніша оцінка часу для `subsets(items)` з n елементами?"],
    [
      ["O(2ⁿ)", "O(2ⁿ)"],
      ["O(n · 2ⁿ)", "O(n · 2ⁿ)"],
      ["O(n²)", "O(n²)"],
      ["O(n!)", "O(n!)"],
    ],
    "b",
    [
      "There are 2ⁿ subsets, and the function materialises each one as an array: `[...s, item]` copies up to n elements, so the total work (and output size) is O(n · 2ⁿ). When the output itself is large, the complexity can never be lower than the size of the output.",
      "Існує 2ⁿ підмножин, і функція створює кожну як масив: `[...s, item]` копіює до n елементів, тож загальна робота (і розмір виходу) — O(n · 2ⁿ). Коли вихід сам великий, складність не може бути меншою за його розмір.",
    ],
    { code: "function subsets(items) {\n  let result = [[]];\n  for (const item of items) {\n    result = [...result, ...result.map((s) => [...s, item])];\n  }\n  return result;\n}", codeLanguage: "js" },
  ),
  practice({
    slug: "bigo-nearby-duplicate",
    skills: ["big-o", { slug: "data-structures", weight: 0.5 }],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Nearby duplicates in linear time", "Близькі дублікати за лінійний час"],
    prompt: [
      "Implement `hasNearbyDuplicate(values, k)`. It returns `true` if two **equal** values sit at most `k` positions apart (`|i − j| ≤ k`, `i ≠ j`).\n\nThe obvious nested loop is O(n · k). Your solution must be **O(n)**: the last test runs 200,000 values with `k = 100,000` under a time limit.\n\n```ts\nhasNearbyDuplicate([1, 2, 3, 1], 3) // true\nhasNearbyDuplicate([1, 2, 3, 1], 2) // false\n```",
      "Реалізуйте `hasNearbyDuplicate(values, k)`. Повертає `true`, якщо два **рівні** значення розташовані не далі ніж за `k` позицій (`|i − j| ≤ k`, `i ≠ j`).\n\nОчевидний вкладений цикл — O(n · k). Ваше рішення має бути **O(n)**: останній тест обробляє 200 000 значень з `k = 100 000` з обмеженням часу.\n\n```ts\nhasNearbyDuplicate([1, 2, 3, 1], 3) // true\nhasNearbyDuplicate([1, 2, 3, 1], 2) // false\n```",
    ],
    files: {
      "/src/nearby.ts": "export function hasNearbyDuplicate(values: number[], k: number): boolean {\n  // TODO: O(n)\n  return false;\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { hasNearbyDuplicate } from "./src/nearby";\n\nconst readings = [12, 15, 18, 12, 20];\ndocument.getElementById("app")!.innerHTML =\n  "<h1>Sensor readings</h1><p>" + readings.join(", ") + "</p><p>Repeat within 3: " + hasNearbyDuplicate(readings, 3) + "</p>";\n',
    },
    visibleFiles: ["/src/nearby.ts", "/index.ts"],
    activeFile: "/src/nearby.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { hasNearbyDuplicate } from "../src/nearby";\n\ndescribe("hasNearbyDuplicate", () => {\n  it("finds duplicates within k", () => {\n    expect(hasNearbyDuplicate([1, 2, 3, 1], 3)).toBe(true);\n    expect(hasNearbyDuplicate([1, 0, 1, 1], 1)).toBe(true);\n  });\n  it("ignores duplicates further apart than k", () => {\n    expect(hasNearbyDuplicate([1, 2, 3, 1], 2)).toBe(false);\n    expect(hasNearbyDuplicate([1, 2, 3, 1, 2, 3], 2)).toBe(false);\n  });\n  it("never matches an element with itself", () => {\n    expect(hasNearbyDuplicate([7], 5)).toBe(false);\n    expect(hasNearbyDuplicate([1, 2, 3], 0)).toBe(false);\n  });\n  it("handles an empty array", () => expect(hasNearbyDuplicate([], 3)).toBe(false));\n  it("runs in linear time on large inputs", () => {\n    const values = Array.from({ length: 200000 }, (_, i) => i);\n    values[199999] = 100000;\n    const start = performance.now();\n    expect(hasNearbyDuplicate(values, 100000)).toBe(true);\n    expect(hasNearbyDuplicate(values.slice(0, 199999), 100000)).toBe(false);\n    expect(performance.now() - start).toBeLessThan(1000);\n  });\n});\n',
    solution: {
      "/src/nearby.ts":
        "export function hasNearbyDuplicate(values: number[], k: number): boolean {\n  const lastIndex = new Map<number, number>();\n  for (let i = 0; i < values.length; i++) {\n    const previous = lastIndex.get(values[i]);\n    if (previous !== undefined && i - previous <= k) return true;\n    lastIndex.set(values[i], i);\n  }\n  return false;\n}\n",
    },
    explanation: [
      "Remember the most recent index of each value in a `Map`. For each position, a single O(1) average lookup tells you whether the same value appeared within the last k positions; keeping only the latest index is enough, because it is always the closest one. That's O(n) time and O(n) space. A sliding-window `Set` of the last k values works too and uses O(k) memory.",
      "Запам'ятовуйте останній індекс кожного значення в `Map`. Для кожної позиції один пошук за O(1) у середньому каже, чи траплялося те саме значення в межах останніх k позицій; достатньо зберігати лише останній індекс, бо він завжди найближчий. Це O(n) часу й O(n) пам'яті. Підходить і ковзне вікно `Set` з останніх k значень, що використовує O(k) пам'яті.",
    ],
  }),
]);
