import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const ALGO = w("algorithms");

export default defineTasks([
  quiz(
    "sort-stability",
    ["sorting-algorithms", ALGO],
    2,
    90,
    ["Stable sorting", "Стабільне сортування"],
    ["What does it mean that a sort is **stable**?", "Що означає, що сортування **стабільне**?"],
    [
      ["Elements that compare equal keep their original relative order", "Елементи, що порівнюються як рівні, зберігають початковий взаємний порядок"],
      ["It always runs in O(n log n)", "Воно завжди працює за O(n log n)"],
      ["It never uses extra memory", "Воно ніколи не використовує додаткової пам'яті"],
      ["It produces the same output on every browser", "Воно дає однаковий результат у всіх браузерах"],
    ],
    "a",
    [
      "Stability is about ties. It lets you sort by a secondary key, then by a primary key, and keep the secondary order inside each primary group. `Array.prototype.sort` has been stable since ES2019.",
      "Стабільність стосується рівних елементів. Вона дозволяє відсортувати за другорядним ключем, потім за основним і зберегти другорядний порядок усередині кожної групи. `Array.prototype.sort` стабільний з ES2019.",
    ],
  ),
  quiz(
    "sort-quick-worst",
    ["sorting-algorithms", ALGO, w("big-o")],
    3,
    120,
    ["Quicksort worst case", "Найгірший випадок quicksort"],
    ["When does quicksort with \"always pick the first element as pivot\" hit O(n²)?", "Коли quicksort з правилом «завжди брати перший елемент як опорний» потрапляє в O(n²)?"],
    [
      ["On already sorted (or reverse-sorted) input", "На вже відсортованих (або відсортованих у зворотному порядку) даних"],
      ["On random input", "На випадкових даних"],
      ["When the array has an even length", "Коли довжина масиву парна"],
      ["Never; quicksort is always O(n log n)", "Ніколи; quicksort завжди O(n log n)"],
    ],
    "a",
    [
      "On sorted input the first element is the minimum, so each partition peels off only one element and recursion depth becomes n. Random or median-of-three pivots make this practically impossible.",
      "На відсортованих даних перший елемент є мінімумом, тож кожне розбиття відокремлює лише один елемент, і глибина рекурсії стає n. Випадковий опорний елемент або медіана трьох роблять це практично неможливим.",
    ],
  ),
  quiz(
    "sort-lower-bound",
    ["sorting-algorithms", w("big-o")],
    3,
    120,
    ["Beating n log n", "Швидше за n log n"],
    ["You must sort 10 million exam scores, all integers from 0 to 100. What is the fastest asymptotic approach?", "Треба відсортувати 10 мільйонів екзаменаційних балів, усі цілі від 0 до 100. Який підхід асимптотично найшвидший?"],
    [
      ["Merge sort, O(n log n)", "Злиттям, O(n log n)"],
      ["Counting sort, O(n + k) with k = 101", "Підрахунком, O(n + k) при k = 101"],
      ["Quicksort with a random pivot", "Quicksort з випадковим опорним елементом"],
      ["Binary-insertion sort", "Вставками з бінарним пошуком"],
    ],
    "b",
    [
      "The O(n log n) lower bound applies only to comparison sorts. With a tiny key range, count how many times each score occurs (101 buckets) and write them out in order: linear time.",
      "Нижня межа O(n log n) стосується лише сортувань порівнянням. Коли діапазон ключів крихітний, порахуйте, скільки разів трапляється кожен бал (101 комірка), і випишіть їх по порядку: лінійний час.",
    ],
  ),
  quiz(
    "sort-multi-key",
    ["sorting-algorithms", w("arrays-strings")],
    2,
    90,
    ["Sorting by two keys", "Сортування за двома ключами"],
    ["Which comparator sorts users by `age` ascending, and by `name` alphabetically for equal ages?", "Який компаратор сортує користувачів за `age` за зростанням, а при рівному віці за `name` за абеткою?"],
    [
      ["`(a, b) => a.age - b.age || a.name.localeCompare(b.name)`", "`(a, b) => a.age - b.age || a.name.localeCompare(b.name)`"],
      ["`(a, b) => a.age > b.age && a.name > b.name`", "`(a, b) => a.age > b.age && a.name > b.name`"],
      ["`(a, b) => a.name.localeCompare(b.name) - a.age`", "`(a, b) => a.name.localeCompare(b.name) - a.age`"],
      ["`(a, b) => a.age - b.age && a.name.localeCompare(b.name)`", "`(a, b) => a.age - b.age && a.name.localeCompare(b.name)`"],
    ],
    "a",
    [
      "When ages differ, `a.age - b.age` is non-zero and decides the order. When they're equal it's 0 (falsy), so `||` falls through to the name comparison. Comparators must return numbers, not booleans.",
      "Коли вік різний, `a.age - b.age` ненульове й визначає порядок. Коли однаковий, результат 0 (хибне значення), тож `||` переходить до порівняння імен. Компаратор має повертати числа, а не булеві значення.",
    ],
  ),
  quiz(
    "sort-merge-memory",
    ["sorting-algorithms"],
    4,
    120,
    ["Merge vs heap sort", "Злиттям чи пірамідальне"],
    ["You need a guaranteed O(n log n) sort on an embedded device with very little free memory, and stability doesn't matter. Which fits best?", "Потрібне гарантоване сортування за O(n log n) на вбудованому пристрої з дуже малим обсягом вільної пам'яті, а стабільність не важлива. Що підходить найкраще?"],
    [
      ["Merge sort", "Злиттям"],
      ["Heapsort", "Пірамідальне (heapsort)"],
      ["Quicksort", "Швидке (quicksort)"],
      ["Counting sort", "Підрахунком"],
    ],
    "b",
    [
      "Heapsort guarantees O(n log n) worst case with O(1) extra memory (in place). Merge sort needs O(n) buffers, quicksort's worst case is O(n²), and counting sort needs a small key range.",
      "Пірамідальне сортування гарантує O(n log n) у найгіршому випадку з O(1) додаткової пам'яті (на місці). Злиття потребує буферів O(n), найгірший випадок quicksort дорівнює O(n²), а сортування підрахунком вимагає малого діапазону ключів.",
    ],
  ),
  practice({
    slug: "sort-merge-sort",
    skills: ["sorting-algorithms", ALGO, w("recursion")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Stable merge sort", "Стабільне сортування злиттям"],
    prompt: [
      "Implement `mergeSort(items, compare)`:\n\n- Returns a **new** sorted array and doesn't mutate `items`.\n- Must be **stable**: equal elements keep their input order.\n- O(n log n). Don't call `Array.prototype.sort`.",
      "Реалізуйте `mergeSort(items, compare)`:\n\n- Повертає **новий** відсортований масив і не змінює `items`.\n- Має бути **стабільним**: рівні елементи зберігають порядок вхідних даних.\n- O(n log n). Не викликайте `Array.prototype.sort`.",
    ],
    files: {
      "/src/mergeSort.ts": "export function mergeSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {\n  // TODO: divide, sort halves recursively, merge (stable!)\n  return items;\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { mergeSort } from "./src/mergeSort";\n\nconst people = [\n  { name: "Ada", age: 36 },\n  { name: "Linus", age: 28 },\n  { name: "Grace", age: 36 },\n  { name: "Tim", age: 28 },\n];\nconst sorted = mergeSort(people, (a, b) => a.age - b.age);\ndocument.getElementById("app")!.innerHTML =\n  "<h1>By age (stable)</h1><ol>" + sorted.map((p) => `<li>${p.name} (${p.age})</li>`).join("") + "</ol>";\n',
    },
    visibleFiles: ["/src/mergeSort.ts", "/index.ts"],
    activeFile: "/src/mergeSort.ts",
    tests: 'import { describe, it, expect, screen } from "./test-kit";\nimport { mergeSort } from "../src/mergeSort";\n\nconst num = (a: number, b: number) => a - b;\n\ndescribe("mergeSort", () => {\n  it("sorts numbers", () => {\n    expect(mergeSort([5, 1, 4, 2, 3], num)).toEqual([1, 2, 3, 4, 5]);\n    expect(mergeSort([10, 9, 100, 1], num)).toEqual([1, 9, 10, 100]);\n  });\n  it("handles empty and single-element arrays", () => {\n    expect(mergeSort([], num)).toEqual([]);\n    expect(mergeSort([7], num)).toEqual([7]);\n  });\n  it("does not mutate the input", () => {\n    const input = [3, 1, 2];\n    const out = mergeSort(input, num);\n    expect(input).toEqual([3, 1, 2]);\n    expect(out === input).toBe(false);\n  });\n  it("is stable", () => {\n    const rows = [\n      { k: 1, id: "a" }, { k: 0, id: "b" }, { k: 1, id: "c" }, { k: 0, id: "d" }, { k: 1, id: "e" },\n    ];\n    expect(mergeSort(rows, (x, y) => x.k - y.k).map((r) => r.id)).toEqual(["b", "d", "a", "c", "e"]);\n  });\n  it("does not use Array.prototype.sort", () => {\n    const original = Array.prototype.sort;\n    let used = false;\n    Array.prototype.sort = function (this: unknown[], ...args: unknown[]) {\n      used = true;\n      return original.apply(this, args as never);\n    } as typeof original;\n    try {\n      mergeSort([3, 2, 1], num);\n    } finally {\n      Array.prototype.sort = original;\n    }\n    expect(used).toBe(false);\n  });\n  it("handles large inputs quickly", () => {\n    const big = Array.from({ length: 50000 }, (_, i) => (i * 7919) % 50000);\n    const t0 = Date.now();\n    const out = mergeSort(big, num);\n    expect(Date.now() - t0).toBeLessThan(1500);\n    expect(out[0]).toBe(0);\n    expect(out[49999]).toBe(49999);\n  });\n  it("renders the demo", async () => {\n    const items = await screen.findAllByRole("listitem");\n    expect(items.map((li) => li.textContent)).toEqual(["Linus (28)", "Tim (28)", "Ada (36)", "Grace (36)"]);\n  });\n});\n',
    solution: {
      "/src/mergeSort.ts": "export function mergeSort<T>(items: T[], compare: (a: T, b: T) => number): T[] {\n  if (items.length <= 1) return items.slice();\n  const mid = items.length >> 1;\n  const left = mergeSort(items.slice(0, mid), compare);\n  const right = mergeSort(items.slice(mid), compare);\n\n  const out: T[] = [];\n  let i = 0;\n  let j = 0;\n  while (i < left.length && j < right.length) {\n    // Take from the right only if strictly smaller: ties keep left first (stable).\n    if (compare(right[j], left[i]) < 0) out.push(right[j++]);\n    else out.push(left[i++]);\n  }\n  while (i < left.length) out.push(left[i++]);\n  while (j < right.length) out.push(right[j++]);\n  return out;\n}\n",
    },
    explanation: [
      "Split in half, sort each half recursively, and merge by repeatedly taking the smaller head. Taking from the right half only when it's *strictly* smaller keeps ties in input order, which makes the sort stable. Depth is log n with O(n) work per level, so O(n log n) total, with O(n) extra memory.",
      "Розділіть навпіл, рекурсивно відсортуйте кожну половину й злийте, щоразу беручи менший перший елемент. Беріть із правої половини лише коли він *строго* менший: так рівні елементи зберігають вхідний порядок, і сортування стабільне. Глибина log n і O(n) роботи на рівень дають разом O(n log n) з O(n) додаткової пам'яті.",
    ],
  }),
]);
