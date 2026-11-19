import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

const ALGO = { slug: "algorithms", weight: 0.5 };

export default defineTasks([
  quiz(
    "sort-n-log-n",
    ["sorting-algorithms", ALGO],
    1,
    45,
    ["O(n log n) sorting", "Сортування за O(n log n)"],
    ["Which of these algorithms sorts in O(n log n) time even in the worst case?", "Який із цих алгоритмів сортує за O(n log n) навіть у найгіршому випадку?"],
    [
      ["Bubble sort", "Сортування бульбашкою"],
      ["Insertion sort", "Сортування вставками"],
      ["Merge sort", "Сортування злиттям"],
      ["Selection sort", "Сортування вибором"],
    ],
    "c",
    [
      "Merge sort always splits the input in half (log n levels) and merges each level in O(n). Bubble, insertion and selection sort are O(n²) in the worst case, although insertion sort is fast on small or nearly sorted inputs.",
      "Сортування злиттям завжди ділить дані навпіл (log n рівнів) і зливає кожен рівень за O(n). Сортування бульбашкою, вставками й вибором мають O(n²) у найгіршому випадку, хоча сортування вставками швидке на малих або майже відсортованих даних.",
    ],
  ),
  quiz(
    "sort-random-shuffle",
    ["sorting-algorithms", ALGO],
    4,
    90,
    ["Shuffling with sort", "Перемішування через sort"],
    ["What is wrong with this shuffle?", "Що не так із цим перемішуванням?"],
    [
      ["Nothing; every permutation is equally likely", "Нічого; усі перестановки рівноймовірні"],
      ["It's biased: the comparator is inconsistent, so some orders come up far more often", "Воно упереджене: компаратор неузгоджений, тож деякі порядки випадають значно частіше"],
      ["It mutates `items`, so it throws for frozen arrays only", "Воно змінює `items`, тож падає лише для заморожених масивів"],
      ["It is O(n²)", "Воно O(n²)"],
    ],
    "b",
    [
      "Sorting algorithms assume a consistent comparator (if a < b and b < c, then a < c). A random one breaks that, and the result depends on the engine's algorithm, which gives a strongly non-uniform distribution. Use Fisher–Yates: walk from the end and swap each element with a random index at or before it, which is O(n) and unbiased.",
      "Алгоритми сортування розраховують на узгоджений компаратор (якщо a < b і b < c, то a < c). Випадковий порушує це, і результат залежить від алгоритму рушія, що дає дуже нерівномірний розподіл. Використовуйте Фішера–Єйтса: ідіть з кінця й міняйте кожен елемент з випадковим індексом не далі за нього — це O(n) і без упередження.",
    ],
    { code: "const shuffled = items.sort(() => Math.random() - 0.5);", codeLanguage: "js" },
  ),
  quiz(
    "sort-external",
    ["sorting-algorithms", ALGO],
    5,
    120,
    ["Sorting more data than fits in memory", "Сортування даних, що не вміщуються в пам'ять"],
    ["You must sort a 100 GB log file by timestamp on a machine with 8 GB of RAM. Which approach works?", "Потрібно відсортувати 100-гігабайтний лог-файл за часом на машині з 8 ГБ RAM. Який підхід працює?"],
    [
      ["Read it all into an array and call `sort`", "Прочитати все в масив і викликати `sort`"],
      ["Sort chunks that fit in memory, write each to disk, then k-way merge them with a min-heap", "Сортувати частини, що вміщуються в пам'ять, записати кожну на диск, потім виконати k-шляхове злиття з мін-купою"],
      ["Use quicksort directly on the file", "Застосувати quicksort безпосередньо до файлу"],
      ["Use counting sort on the timestamps", "Застосувати сортування підрахунком до міток часу"],
    ],
    "b",
    [
      "External merge sort reads memory-sized chunks, sorts each in RAM and writes sorted runs to disk. A k-way merge then streams all runs at once, using a min-heap of the current head of each run to output records in order. Disk access stays sequential, which is what makes it fast. Timestamps have far too large a range for counting sort.",
      "Зовнішнє сортування злиттям читає частини розміром із пам'ять, сортує кожну в RAM і записує відсортовані серії на диск. Потім k-шляхове злиття читає всі серії потоково, використовуючи мін-купу з поточних перших елементів серій, щоб виводити записи по порядку. Доступ до диска лишається послідовним — саме це робить підхід швидким. Діапазон міток часу завеликий для сортування підрахунком.",
    ],
  ),
  practice({
    slug: "sort-by-keys",
    skills: ["sorting-algorithms", { slug: "arrays-strings", weight: 0.5 }],
    complexity: 2,
    estSeconds: 600,
    framework: "vanilla-ts",
    title: ["Sort by several keys", "Сортування за кількома ключами"],
    prompt: [
      "Implement `sortBy(items, keys)` for a data table.\n\n- `keys` lists the sort keys in priority order, each with an optional direction (`\"asc\"` by default).\n- Compare numbers numerically and strings with `localeCompare`.\n- Items that are equal on every key keep their original order (stable).\n- Return a **new** array; don't mutate `items`.\n\n```ts\nsortBy(people, [{ key: \"team\" }, { key: \"score\", dir: \"desc\" }])\n```",
      "Реалізуйте `sortBy(items, keys)` для таблиці даних.\n\n- `keys` перелічує ключі сортування за пріоритетом, кожен з необов'язковим напрямком (типово `\"asc\"`).\n- Числа порівнюйте як числа, рядки — через `localeCompare`.\n- Елементи, рівні за всіма ключами, зберігають початковий порядок (стабільність).\n- Поверніть **новий** масив; не змінюйте `items`.\n\n```ts\nsortBy(people, [{ key: \"team\" }, { key: \"score\", dir: \"desc\" }])\n```",
    ],
    files: {
      "/src/sort-by.ts":
        "export type SortKey<T> = { key: keyof T; dir?: \"asc\" | \"desc\" };\n\nexport function sortBy<T>(items: T[], keys: SortKey<T>[]): T[] {\n  // TODO\n  return items;\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { sortBy } from "./src/sort-by";\n\nconst people = [\n  { name: "Ola", team: "web", score: 7 },\n  { name: "Ivan", team: "api", score: 9 },\n  { name: "Mia", team: "web", score: 9 },\n];\ndocument.getElementById("app")!.innerHTML =\n  "<h1>Leaderboard</h1><ol>" +\n  sortBy(people, [{ key: "team" }, { key: "score", dir: "desc" }]).map((p) => "<li>" + p.team + " · " + p.name + " · " + p.score + "</li>").join("") +\n  "</ol>";\n',
    },
    visibleFiles: ["/src/sort-by.ts", "/index.ts"],
    activeFile: "/src/sort-by.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { sortBy } from "../src/sort-by";\n\nconst people = [\n  { name: "Ola", team: "web", score: 7 },\n  { name: "Ivan", team: "api", score: 9 },\n  { name: "Mia", team: "web", score: 9 },\n  { name: "Bo", team: "api", score: 9 },\n];\nconst names = (list: { name: string }[]) => list.map((p) => p.name);\n\ndescribe("sortBy", () => {\n  it("sorts by one key ascending", () => {\n    expect(names(sortBy(people, [{ key: "name" }]))).toEqual(["Bo", "Ivan", "Mia", "Ola"]);\n  });\n  it("compares numbers numerically", () => {\n    const rows = [{ name: "a", n: 10 }, { name: "b", n: 9 }, { name: "c", n: 100 }];\n    expect(names(sortBy(rows, [{ key: "n" }]))).toEqual(["b", "a", "c"]);\n  });\n  it("uses later keys to break ties", () => {\n    expect(names(sortBy(people, [{ key: "team" }, { key: "score", dir: "desc" }, { key: "name" }]))).toEqual(["Bo", "Ivan", "Mia", "Ola"]);\n  });\n  it("supports descending order", () => {\n    expect(names(sortBy(people, [{ key: "score", dir: "desc" }, { key: "name", dir: "desc" }]))).toEqual(["Mia", "Ivan", "Bo", "Ola"]);\n  });\n  it("is stable for full ties", () => {\n    expect(names(sortBy(people, [{ key: "score", dir: "desc" }]))).toEqual(["Ivan", "Mia", "Bo", "Ola"]);\n  });\n  it("does not mutate the input", () => {\n    const copy = [...people];\n    const sorted = sortBy(people, [{ key: "name" }]);\n    expect(people).toEqual(copy);\n    expect(sorted === people).toBe(false);\n  });\n});\n',
    solution: {
      "/src/sort-by.ts":
        "export type SortKey<T> = { key: keyof T; dir?: \"asc\" | \"desc\" };\n\nfunction compareValues(a: unknown, b: unknown): number {\n  if (typeof a === \"number\" && typeof b === \"number\") return a - b;\n  return String(a).localeCompare(String(b));\n}\n\nexport function sortBy<T>(items: T[], keys: SortKey<T>[]): T[] {\n  return [...items].sort((a, b) => {\n    for (const { key, dir = \"asc\" } of keys) {\n      const result = compareValues(a[key], b[key]);\n      if (result !== 0) return dir === \"desc\" ? -result : result;\n    }\n    return 0;\n  });\n}\n",
    },
    explanation: [
      "One comparator walks the keys in priority order and returns the first non-zero comparison, flipping the sign for descending keys. `Array.prototype.sort` is guaranteed stable since ES2019, so returning 0 for full ties keeps the input order. Copying with `[...items]` avoids mutating the caller's array (or use `toSorted`).",
      "Один компаратор проходить ключі за пріоритетом і повертає перше ненульове порівняння, змінюючи знак для спадних ключів. `Array.prototype.sort` гарантовано стабільний з ES2019, тож повернення 0 для повних збігів зберігає вхідний порядок. Копія через `[...items]` не дає змінити масив викликача (або використайте `toSorted`).",
    ],
  }),
]);
