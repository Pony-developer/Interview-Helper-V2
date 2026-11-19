import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "ds-map-vs-object",
    ["data-structures", { slug: "javascript", weight: 0.5 }],
    3,
    90,
    ["Map or plain object?", "Map чи звичайний об'єкт?"],
    ["Which are real reasons to use a `Map` instead of a plain object as a dictionary? Select all that apply.", "Які з цього — справжні причини використати `Map` замість звичайного об'єкта як словник? Оберіть усі правильні."],
    [
      ["Keys can be any value, including objects", "Ключі можуть бути будь-якими значеннями, зокрема об'єктами"],
      ["It has a `size` property and keeps insertion order for all keys", "Має властивість `size` і зберігає порядок вставки для всіх ключів"],
      ["User-supplied keys like `\"__proto__\"` or `\"constructor\"` can't clash with inherited properties", "Ключі від користувача, як-от `\"__proto__\"` чи `\"constructor\"`, не конфліктують з успадкованими властивостями"],
      ["`JSON.stringify(map)` serialises its entries", "`JSON.stringify(map)` серіалізує його записи"],
    ],
    "abc",
    [
      "`Map` accepts any key type, tracks `size`, keeps insertion order (objects reorder integer-like keys) and has no prototype keys to collide with. It is also optimised for frequent additions and deletions. But `JSON.stringify(new Map(...))` gives `{}`; convert with `Object.fromEntries(map)` first.",
      "`Map` приймає ключі будь-якого типу, відстежує `size`, зберігає порядок вставки (об'єкти переставляють ключі, схожі на цілі числа) і не має ключів прототипу, з якими можна конфліктувати. Також він оптимізований для частих додавань і видалень. Але `JSON.stringify(new Map(...))` дає `{}`; спершу перетворіть через `Object.fromEntries(map)`.",
    ],
  ),
  quiz(
    "ds-trie-autocomplete",
    ["data-structures"],
    4,
    90,
    ["Autocomplete data structure", "Структура даних для автодоповнення"],
    ["An autocomplete box searches 200,000 product names by prefix on every keystroke. Which structure fits best?", "Поле автодоповнення шукає 200 000 назв товарів за префіксом на кожне натискання. Яка структура підходить найкраще?"],
    [
      ["An unsorted array scanned with `startsWith`", "Невідсортований масив із перебором через `startsWith`"],
      ["A hash set of all names", "Хеш-множина всіх назв"],
      ["A trie (prefix tree)", "Префіксне дерево (trie)"],
      ["A min-heap ordered by name", "Мін-купа, впорядкована за назвою"],
    ],
    "c",
    [
      "A trie walks one node per typed character, so finding the prefix node costs O(prefix length), independent of the number of names, and everything below it is a match. A hash set only answers exact lookups, and a scan is O(n) per keystroke. A sorted array with binary search for the prefix range is a good, more memory-efficient alternative.",
      "Префіксне дерево проходить по одному вузлу на кожен введений символ, тож пошук вузла префікса коштує O(довжина префікса) незалежно від кількості назв, а все під ним — збіги. Хеш-множина відповідає лише на точні запити, а перебір — O(n) на кожне натискання. Відсортований масив із бінарним пошуком діапазону префікса — хороша й економніша за пам'яттю альтернатива.",
    ],
  ),
  quiz(
    "ds-union-find",
    ["data-structures", { slug: "algorithms", weight: 0.5 }],
    5,
    120,
    ["Connectivity queries", "Запити на зв'язність"],
    ["A social app processes millions of \"A follows B\" merges into friend groups and must answer \"are X and Y in the same group?\" instantly, interleaved with merges. Which structure fits best?", "Соцмережа обробляє мільйони об'єднань «A стежить за B» у групи й має миттєво відповідати «чи X та Y в одній групі?», чергуючи це з об'єднаннями. Яка структура підходить найкраще?"],
    [
      ["Run BFS from X for every query", "Запускати BFS з X для кожного запиту"],
      ["A disjoint-set (union-find) with path compression and union by rank", "Система неперетинних множин (union-find) зі стисненням шляхів і об'єднанням за рангом"],
      ["An adjacency matrix", "Матриця суміжності"],
      ["A sorted array of group ids", "Відсортований масив id груп"],
    ],
    "b",
    [
      "Union-find stores a parent pointer per element. `find` follows pointers to the group's root, and path compression flattens the path as it goes. With union by rank, both `union` and `find` cost amortised O(α(n)), effectively constant. BFS per query is O(V + E), and an adjacency matrix needs O(n²) memory.",
      "Union-find зберігає вказівник на батька для кожного елемента. `find` іде вказівниками до кореня групи, а стиснення шляхів вирівнює шлях дорогою. З об'єднанням за рангом і `union`, і `find` коштують амортизовано O(α(n)), тобто фактично сталий час. BFS на кожен запит — O(V + E), а матриця суміжності потребує O(n²) пам'яті.",
    ],
  ),
  practice({
    slug: "ds-min-heap",
    skills: ["data-structures", { slug: "algorithms", weight: 0.5 }],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Priority queue (binary heap)", "Черга з пріоритетом (бінарна купа)"],
    prompt: [
      "Implement a `PriorityQueue` backed by an array-based binary heap.\n\n- `new PriorityQueue(compare)` takes a comparator like `Array.prototype.sort` does; the item that compares smallest comes out first.\n- `push(item)` and `pop()` must be **O(log n)**; `peek()` and `size` are O(1).\n- `pop()` and `peek()` return `undefined` when the queue is empty.",
      "Реалізуйте `PriorityQueue` на основі бінарної купи в масиві.\n\n- `new PriorityQueue(compare)` приймає компаратор, як у `Array.prototype.sort`; першим виходить елемент, що порівнюється як найменший.\n- `push(item)` і `pop()` мають бути **O(log n)**; `peek()` і `size` — O(1).\n- `pop()` і `peek()` повертають `undefined`, коли черга порожня.",
    ],
    files: {
      "/src/priority-queue.ts":
        "export class PriorityQueue<T> {\n  private items: T[] = [];\n\n  constructor(private compare: (a: T, b: T) => number) {}\n\n  get size() {\n    return this.items.length;\n  }\n\n  peek(): T | undefined {\n    return this.items[0];\n  }\n\n  push(item: T) {\n    // TODO: add to the end and sift up\n    this.items.push(item);\n  }\n\n  pop(): T | undefined {\n    // TODO: move the last item to the root and sift down\n    return this.items.shift();\n  }\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { PriorityQueue } from "./src/priority-queue";\n\nconst tasks = new PriorityQueue<{ name: string; priority: number }>((a, b) => a.priority - b.priority);\nfor (const [name, priority] of [["deploy", 3], ["hotfix", 1], ["lunch", 5], ["review", 2]] as const) tasks.push({ name, priority });\nconst order: string[] = [];\nwhile (tasks.size) order.push(tasks.pop()!.name);\ndocument.getElementById("app")!.innerHTML = "<h1>Next up</h1><ol>" + order.map((n) => "<li>" + n + "</li>").join("") + "</ol>";\n',
    },
    visibleFiles: ["/src/priority-queue.ts", "/index.ts"],
    activeFile: "/src/priority-queue.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { PriorityQueue } from "../src/priority-queue";\n\nconst drain = <T,>(q: PriorityQueue<T>) => {\n  const out: T[] = [];\n  while (q.size) out.push(q.pop()!);\n  return out;\n};\n\ndescribe("PriorityQueue", () => {\n  it("pops the smallest item first", () => {\n    const q = new PriorityQueue<number>((a, b) => a - b);\n    for (const n of [5, 1, 4, 2, 3]) q.push(n);\n    expect(q.peek()).toBe(1);\n    expect(drain(q)).toEqual([1, 2, 3, 4, 5]);\n  });\n  it("respects the comparator", () => {\n    const q = new PriorityQueue<number>((a, b) => b - a);\n    for (const n of [5, 1, 4, 2, 3]) q.push(n);\n    expect(drain(q)).toEqual([5, 4, 3, 2, 1]);\n  });\n  it("handles duplicates and interleaved operations", () => {\n    const q = new PriorityQueue<number>((a, b) => a - b);\n    q.push(3);\n    q.push(3);\n    q.push(1);\n    expect(q.pop()).toBe(1);\n    q.push(0);\n    q.push(2);\n    expect(drain(q)).toEqual([0, 2, 3, 3]);\n  });\n  it("returns undefined when empty", () => {\n    const q = new PriorityQueue<number>((a, b) => a - b);\n    expect(q.pop()).toBe(undefined);\n    expect(q.peek()).toBe(undefined);\n    expect(q.size).toBe(0);\n  });\n  it("sorts many random items", () => {\n    const q = new PriorityQueue<number>((a, b) => a - b);\n    const values = Array.from({ length: 2000 }, (_, i) => (i * 7919) % 1009);\n    for (const v of values) q.push(v);\n    expect(drain(q)).toEqual([...values].sort((a, b) => a - b));\n  });\n  it("is fast enough for 200,000 items (O(log n) operations)", () => {\n    const q = new PriorityQueue<number>((a, b) => a - b);\n    const start = performance.now();\n    for (let i = 0; i < 200000; i++) q.push((i * 2654435761) % 1000003);\n    let previous = -1;\n    let ordered = true;\n    while (q.size) {\n      const next = q.pop()!;\n      if (next < previous) {\n        ordered = false;\n        break;\n      }\n      previous = next;\n    }\n    expect(ordered).toBe(true);\n    expect(performance.now() - start).toBeLessThan(1500);\n  });\n});\n',
    solution: {
      "/src/priority-queue.ts":
        "export class PriorityQueue<T> {\n  private items: T[] = [];\n\n  constructor(private compare: (a: T, b: T) => number) {}\n\n  get size() {\n    return this.items.length;\n  }\n\n  peek(): T | undefined {\n    return this.items[0];\n  }\n\n  push(item: T) {\n    const items = this.items;\n    items.push(item);\n    let i = items.length - 1;\n    while (i > 0) {\n      const parent = (i - 1) >> 1;\n      if (this.compare(items[i], items[parent]) >= 0) break;\n      [items[i], items[parent]] = [items[parent], items[i]];\n      i = parent;\n    }\n  }\n\n  pop(): T | undefined {\n    const items = this.items;\n    if (items.length === 0) return undefined;\n    const top = items[0];\n    const last = items.pop()!;\n    if (items.length > 0) {\n      items[0] = last;\n      let i = 0;\n      for (;;) {\n        const left = 2 * i + 1;\n        const right = left + 1;\n        let smallest = i;\n        if (left < items.length && this.compare(items[left], items[smallest]) < 0) smallest = left;\n        if (right < items.length && this.compare(items[right], items[smallest]) < 0) smallest = right;\n        if (smallest === i) break;\n        [items[i], items[smallest]] = [items[smallest], items[i]];\n        i = smallest;\n      }\n    }\n    return top;\n  }\n}\n",
    },
    explanation: [
      "In an array heap the children of index i are 2i+1 and 2i+2, and its parent is ⌊(i−1)/2⌋. `push` appends and sifts the item up while it is smaller than its parent. `pop` takes the root, moves the last item to the root and sifts it down towards the smaller child. Both touch one root-to-leaf path: O(log n). The starter's `shift()` was O(n) and didn't keep heap order at all.",
      "У купі на масиві діти індексу i — це 2i+1 і 2i+2, а батько — ⌊(i−1)/2⌋. `push` додає в кінець і піднімає елемент, доки він менший за батька. `pop` бере корінь, переносить останній елемент у корінь і опускає його до меншої дитини. Обидві операції проходять один шлях від кореня до листка: O(log n). `shift()` у заготовці був O(n) і взагалі не підтримував порядок купи.",
    ],
  }),
]);
