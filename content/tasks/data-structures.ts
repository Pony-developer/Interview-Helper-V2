import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const ALGO = w("algorithms");

export default defineTasks([
  quiz(
    "ds-stack-brackets",
    ["data-structures", ALGO],
    1,
    60,
    ["Matching brackets", "Перевірка дужок"],
    ["Which data structure is the natural fit for checking that brackets like `({[]})` are balanced?", "Яка структура даних природно підходить для перевірки збалансованості дужок на кшталт `({[]})`?"],
    [
      ["Queue", "Черга"],
      ["Stack", "Стек"],
      ["Heap", "Купа"],
      ["Set", "Множина"],
    ],
    "b",
    [
      "The most recently opened bracket must close first, which is last-in, first-out. Push openers and pop on each closer, checking that it matches. The string is balanced if the stack ends empty.",
      "Остання відкрита дужка має закритися першою, тобто «останнім прийшов, першим вийшов». Додавайте відкривальні дужки в стек і на кожній закривальній знімайте вершину, перевіряючи відповідність. Рядок збалансований, якщо стек у кінці порожній.",
    ],
  ),
  quiz(
    "ds-queue-shift",
    ["data-structures", w("big-o")],
    2,
    90,
    ["Queues in JavaScript", "Черги в JavaScript"],
    ["A BFS uses `queue.shift()` on an array with a million items. What's the problem?", "BFS використовує `queue.shift()` для масиву з мільйона елементів. У чому проблема?"],
    [
      ["`shift` is O(n) because it re-indexes the array, so BFS can degrade to O(n²)", "`shift` має складність O(n), бо переіндексовує масив, тож BFS може деградувати до O(n²)"],
      ["`shift` returns the last element, not the first", "`shift` повертає останній елемент, а не перший"],
      ["Arrays can't hold a million items", "Масиви не можуть вміщувати мільйон елементів"],
      ["There's no problem; `shift` is O(1)", "Проблеми немає; `shift` працює за O(1)"],
    ],
    "a",
    [
      "Removing the first element moves every other element down one index. Keep a `head` index into the array (`queue[head++]`), or use a linked list or ring buffer for O(1) dequeues.",
      "Видалення першого елемента зсуває всі інші на одну позицію. Тримайте індекс `head` у масиві (`queue[head++]`) або використайте зв'язний список чи кільцевий буфер для вилучення за O(1).",
    ],
  ),
  quiz(
    "ds-two-sum-map",
    ["data-structures", ALGO, w("big-o")],
    2,
    90,
    ["Two-sum in O(n)", "Two-sum за O(n)"],
    ["To find two numbers in an **unsorted** array that add up to a target in one pass, what do you store while scanning?", "Щоб за один прохід знайти в **невідсортованому** масиві два числа із заданою сумою, що зберігати під час проходу?"],
    [
      ["A Map from value to index of the numbers seen so far", "Map від значення до індексу вже переглянутих чисел"],
      ["A sorted copy of the array", "Відсортовану копію масиву"],
      ["A stack of differences", "Стек різниць"],
      ["A heap of the largest values", "Купу найбільших значень"],
    ],
    "a",
    [
      "For each `x`, check whether `target - x` is already in the Map (O(1) average). If not, store `x → index`. One pass gives O(n) time and O(n) space. Sorting plus two pointers is O(n log n) and loses the original indexes.",
      "Для кожного `x` перевірте, чи є `target - x` у Map (у середньому O(1)). Якщо немає, збережіть `x → індекс`. Один прохід дає O(n) часу й O(n) пам'яті. Сортування з двома вказівниками коштує O(n log n) і втрачає початкові індекси.",
    ],
  ),
  quiz(
    "ds-heap-topk",
    ["data-structures", ALGO],
    4,
    150,
    ["Top-k streaming", "Top-k у потоці"],
    [
      "You receive a stream of 10 million scores and must keep the 100 highest at all times, with little memory. What's the best approach?",
      "Ви отримуєте потік із 10 мільйонів оцінок і маєте постійно тримати 100 найвищих, використовуючи мало пам'яті. Який підхід найкращий?",
    ],
    [
      ["Store everything and sort at the end: O(n log n) time, O(n) memory", "Зберегти все й відсортувати в кінці: O(n log n) часу, O(n) пам'яті"],
      ["A min-heap of size 100: replace the root when a bigger score arrives (O(n log k))", "Min-купа розміру 100: замінювати корінь, коли надходить більша оцінка (O(n log k))"],
      ["A max-heap of all scores", "Max-купа з усіх оцінок"],
      ["A stack that keeps the latest 100 scores", "Стек, що тримає останні 100 оцінок"],
    ],
    "b",
    [
      "A min-heap of the current top 100 exposes the smallest of them at the root. Each new score is compared with the root and replaces it if larger, at O(log k) per item. Memory stays O(k).",
      "Min-купа поточних топ-100 тримає найменшу з них у корені. Кожну нову оцінку порівнюють із коренем і замінюють його, якщо вона більша, за O(log k) на елемент. Пам'ять залишається O(k).",
    ],
  ),
  quiz(
    "ds-bst-degenerate",
    ["data-structures", w("big-o")],
    3,
    120,
    ["Unbalanced BST", "Незбалансоване BST"],
    ["You insert 1, 2, 3, …, n in order into a plain (non-balancing) binary search tree. What is the cost of searching it?", "Ви вставляєте 1, 2, 3, …, n по порядку в звичайне (незбалансоване) бінарне дерево пошуку. Яка вартість пошуку в ньому?"],
    [
      ["O(1)", "O(1)"],
      ["O(log n)", "O(log n)"],
      ["O(n)", "O(n)"],
      ["O(n log n)", "O(n log n)"],
    ],
    "c",
    [
      "Every new value is larger than the last, so each node only has a right child: the tree degenerates into a linked list of height n. Self-balancing trees (AVL, red-black) keep the height O(log n).",
      "Кожне нове значення більше за попереднє, тож у кожного вузла лише правий нащадок: дерево вироджується в зв'язний список висоти n. Самобалансовані дерева (AVL, червоно-чорні) тримають висоту O(log n).",
    ],
  ),
  practice({
    slug: "ds-lru-cache",
    skills: ["data-structures", ALGO],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["LRU cache", "LRU-кеш"],
    prompt: [
      "Implement `LRUCache` with a fixed `capacity`:\n\n- `get(key)` returns the value or `undefined`, and marks the key as **most recently used**.\n- `set(key, value)` inserts or updates the key and marks it most recent. If that exceeds the capacity, evict the **least recently used** key.\n- `size` returns the number of entries.\n- Both operations must be **O(1)**.\n\nHint: a JavaScript `Map` remembers insertion order.",
      "Реалізуйте `LRUCache` із фіксованою місткістю `capacity`:\n\n- `get(key)` повертає значення або `undefined` і позначає ключ як **останній використаний**.\n- `set(key, value)` вставляє чи оновлює ключ і позначає його найсвіжішим. Якщо місткість перевищено, витісніть **найдавніше використаний** ключ.\n- `size` повертає кількість записів.\n- Обидві операції мають працювати за **O(1)**.\n\nПідказка: `Map` у JavaScript пам'ятає порядок вставки.",
    ],
    files: {
      "/src/lru.ts": "export class LRUCache<K, V> {\n  constructor(private capacity: number) {}\n\n  get(key: K): V | undefined {\n    // TODO\n    return undefined;\n  }\n\n  set(key: K, value: V): void {\n    // TODO\n  }\n\n  get size(): number {\n    return 0;\n  }\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { LRUCache } from "./src/lru";\n\nconst cache = new LRUCache<string, number>(2);\ncache.set("a", 1);\ncache.set("b", 2);\ncache.get("a");\ncache.set("c", 3); // evicts "b"\n\ndocument.getElementById("app")!.innerHTML = `<h1>LRU cache</h1>\n<p>a = <output id="a">${cache.get("a")}</output>, b = <output id="b">${cache.get("b")}</output>, c = <output id="c">${cache.get("c")}</output></p>`;\n',
    },
    visibleFiles: ["/src/lru.ts", "/index.ts"],
    activeFile: "/src/lru.ts",
    tests: 'import { describe, it, expect, screen } from "./test-kit";\nimport { LRUCache } from "../src/lru";\n\ndescribe("LRUCache", () => {\n  it("stores and returns values", () => {\n    const c = new LRUCache<string, number>(2);\n    c.set("x", 1);\n    expect(c.get("x")).toBe(1);\n    expect(c.get("missing")).toBeUndefined();\n    expect(c.size).toBe(1);\n  });\n  it("evicts the least recently used key", () => {\n    const c = new LRUCache<string, number>(2);\n    c.set("a", 1);\n    c.set("b", 2);\n    c.set("c", 3);\n    expect(c.get("a")).toBeUndefined();\n    expect(c.size).toBe(2);\n  });\n  it("get() refreshes recency", () => {\n    const c = new LRUCache<string, number>(2);\n    c.set("a", 1);\n    c.set("b", 2);\n    c.get("a");\n    c.set("c", 3);\n    expect(c.get("a")).toBe(1);\n    expect(c.get("b")).toBeUndefined();\n  });\n  it("set() on an existing key updates it without growing", () => {\n    const c = new LRUCache<string, number>(2);\n    c.set("a", 1);\n    c.set("b", 2);\n    c.set("a", 10);\n    c.set("c", 3);\n    expect(c.get("a")).toBe(10);\n    expect(c.get("b")).toBeUndefined();\n    expect(c.size).toBe(2);\n  });\n  it("caches falsy values", () => {\n    const c = new LRUCache<string, number>(1);\n    c.set("zero", 0);\n    expect(c.get("zero")).toBe(0);\n  });\n  it("renders the demo", async () => {\n    expect((await screen.findByText("undefined")).id).toBe("b");\n  });\n});\n',
    solution: {
      "/src/lru.ts": "export class LRUCache<K, V> {\n  private map = new Map<K, V>();\n\n  constructor(private capacity: number) {}\n\n  get(key: K): V | undefined {\n    if (!this.map.has(key)) return undefined;\n    const value = this.map.get(key)!;\n    // Re-insert to move the key to the \"most recent\" end.\n    this.map.delete(key);\n    this.map.set(key, value);\n    return value;\n  }\n\n  set(key: K, value: V): void {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size > this.capacity) {\n      const oldest = this.map.keys().next().value as K;\n      this.map.delete(oldest);\n    }\n  }\n\n  get size(): number {\n    return this.map.size;\n  }\n}\n",
    },
    explanation: [
      "A Map iterates in insertion order. Deleting and re-inserting a key moves it to the end (most recent), and the first key is always the least recently used. Every operation is O(1). The classic language-agnostic version pairs a hash map with a doubly linked list.",
      "Map ітерується в порядку вставки. Видалення й повторна вставка ключа переносить його в кінець (найсвіжіший), а перший ключ завжди найдавніше використаний. Кожна операція працює за O(1). Класична незалежна від мови версія поєднує хеш-таблицю з двозв'язним списком.",
    ],
  }),
]);
