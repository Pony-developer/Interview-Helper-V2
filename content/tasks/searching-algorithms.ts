import { defineTasks } from "@/lib/content/schema";

const ALGO = { slug: "algorithms", weight: 0.5 };

export default defineTasks([
  {
    kind: "quiz",
    slug: "search-binary-precondition",
    skills: ["searching-algorithms", ALGO],
    complexity: 1,
    estSeconds: 60,
    title: { en: "Binary search precondition", uk: "Передумова бінарного пошуку" },
    prompt: {
      en: "What must be true about an array before you can use binary search on it?",
      uk: "Що має бути правдою щодо масиву, щоб до нього можна було застосувати бінарний пошук?",
    },
    options: [
      { id: "a", text: { en: "It must be sorted by the key you search for", uk: "Він має бути відсортований за ключем пошуку" } },
      { id: "b", text: { en: "It must contain no duplicates", uk: "У ньому не має бути дублікатів" } },
      { id: "c", text: { en: "Its length must be a power of two", uk: "Його довжина має бути степенем двійки" } },
      { id: "d", text: { en: "It must contain only numbers", uk: "Він має містити лише числа" } },
    ],
    correct: ["a"],
    explanation: {
      en: "Binary search discards half of the range by comparing with the middle element, which only works if the data is ordered by the key. Duplicates are allowed (use lower/upper bound to handle them), any length works and any comparable type works.",
      uk: "Бінарний пошук відкидає половину діапазону, порівнюючи з середнім елементом, а це працює лише для впорядкованих за ключем даних. Дублікати допустимі (для них є нижня/верхня межа), довжина може бути будь-якою, тип — будь-який порівнюваний.",
    },
  },
  {
    kind: "quiz",
    slug: "search-binary-complexity",
    skills: ["searching-algorithms", { slug: "big-o", weight: 0.5 }],
    complexity: 1,
    estSeconds: 45,
    title: { en: "Binary search cost", uk: "Вартість бінарного пошуку" },
    prompt: {
      en: "Roughly how many comparisons does binary search need in the worst case for a sorted array of 1,000,000 elements?",
      uk: "Приблизно скільки порівнянь у найгіршому випадку потрібно бінарному пошуку для відсортованого масиву з 1 000 000 елементів?",
    },
    options: [
      { id: "a", text: { en: "About 20", uk: "Близько 20" } },
      { id: "b", text: { en: "About 1,000", uk: "Близько 1 000" } },
      { id: "c", text: { en: "About 500,000", uk: "Близько 500 000" } },
      { id: "d", text: { en: "About 1,000,000", uk: "Близько 1 000 000" } },
    ],
    correct: ["a"],
    explanation: {
      en: "Each comparison halves the range, so the count is about log₂(1,000,000) ≈ 20. That is the whole point of O(log n).",
      uk: "Кожне порівняння вдвічі зменшує діапазон, тож потрібно близько log₂(1 000 000) ≈ 20 порівнянь. У цьому вся суть O(log n).",
    },
  },
  {
    kind: "quiz",
    slug: "search-infinite-loop-bug",
    skills: ["searching-algorithms"],
    complexity: 3,
    estSeconds: 120,
    title: { en: "Spot the infinite loop", uk: "Знайдіть нескінченний цикл" },
    prompt: {
      en: "This lower-bound implementation sometimes never terminates. Which change fixes it?",
      uk: "Ця реалізація нижньої межі іноді ніколи не завершується. Яка зміна це виправить?",
    },
    code: `function lowerBound(a: number[], x: number) {
  let lo = 0, hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid;
    else hi = mid;
  }
  return lo;
}`,
    options: [
      { id: "a", text: { en: "Replace `lo = mid` with `lo = mid + 1`", uk: "Замінити `lo = mid` на `lo = mid + 1`" } },
      { id: "b", text: { en: "Replace `hi = mid` with `hi = mid - 1`", uk: "Замінити `hi = mid` на `hi = mid - 1`" } },
      { id: "c", text: { en: "Use `while (lo <= hi)`", uk: "Використати `while (lo <= hi)`" } },
      { id: "d", text: { en: "Compute `mid` with `Math.ceil`", uk: "Обчислювати `mid` через `Math.ceil`" } },
    ],
    correct: ["a"],
    explanation: {
      en: "When `hi - lo === 1`, `mid === lo`. If `a[mid] < x`, assigning `lo = mid` leaves the range unchanged forever. Since `a[mid]` is known to be too small, it can be excluded: `lo = mid + 1`. The other options break the half-open invariant or return wrong positions.",
      uk: "Коли `hi - lo === 1`, то `mid === lo`. Якщо `a[mid] < x`, присвоєння `lo = mid` назавжди залишає діапазон незмінним. Оскільки `a[mid]` точно замалий, його можна виключити: `lo = mid + 1`. Інші варіанти порушують інваріант напіввідкритого діапазону або повертають хибні позиції.",
    },
  },
  {
    kind: "quiz",
    slug: "search-many-lookups",
    skills: ["searching-algorithms", { slug: "data-structures", weight: 0.5 }],
    complexity: 2,
    estSeconds: 90,
    title: { en: "Many lookups in unsorted data", uk: "Багато пошуків у невідсортованих даних" },
    prompt: {
      en: "You have an unsorted array of 100,000 user IDs and need to check 50,000 incoming IDs for membership. What is the most efficient approach?",
      uk: "Є невідсортований масив зі 100 000 ідентифікаторів користувачів, і потрібно перевірити належність 50 000 вхідних ID. Який підхід найефективніший?",
    },
    options: [
      { id: "a", text: { en: "Call `array.includes(id)` for every incoming ID", uk: "Викликати `array.includes(id)` для кожного вхідного ID" } },
      { id: "b", text: { en: "Build a `Set` once, then use `set.has(id)`", uk: "Один раз побудувати `Set`, потім використовувати `set.has(id)`" } },
      { id: "c", text: { en: "Sort the array before every lookup, then binary search", uk: "Сортувати масив перед кожним пошуком, потім шукати бінарно" } },
      { id: "d", text: { en: "Use `array.find` because it stops early", uk: "Використати `array.find`, бо він зупиняється раніше" } },
    ],
    correct: ["b"],
    explanation: {
      en: "`includes`/`find` are O(n) each, so 50,000 lookups cost about 5·10⁹ operations. Building a `Set` is O(n) once, and each `has` is O(1) on average. Sorting once plus binary search (O(n log n + m log n)) would also work, but sorting before every lookup is far worse.",
      uk: "`includes`/`find` коштують O(n) кожен, тож 50 000 пошуків — це близько 5·10⁹ операцій. Побудова `Set` — O(n) один раз, а кожен `has` — у середньому O(1). Одноразове сортування з бінарним пошуком (O(n log n + m log n)) теж підійде, але сортувати перед кожним пошуком — значно гірше.",
    },
  },
  {
    kind: "quiz",
    slug: "search-two-pointers",
    skills: ["searching-algorithms", ALGO],
    complexity: 3,
    estSeconds: 120,
    title: { en: "Pair sum in a sorted array", uk: "Пара з сумою у відсортованому масиві" },
    prompt: {
      en: "Which statements about the two-pointer technique for finding a pair with sum `S` in a **sorted** array are true? Select all that apply.",
      uk: "Які твердження про техніку двох вказівників для пошуку пари з сумою `S` у **відсортованому** масиві правильні? Оберіть усі правильні.",
    },
    mode: "multi",
    options: [
      { id: "a", text: { en: "It runs in O(n) time and O(1) extra space", uk: "Працює за O(n) часу та O(1) додаткової пам'яті" } },
      { id: "b", text: { en: "If the current sum is too small, move the left pointer right", uk: "Якщо поточна сума замала, зсуваємо лівий вказівник праворуч" } },
      { id: "c", text: { en: "It also works on unsorted arrays", uk: "Це працює й на невідсортованих масивах" } },
      { id: "d", text: { en: "Each step can safely discard one candidate element", uk: "Кожен крок безпечно відкидає одного кандидата" } },
    ],
    correct: ["a", "b", "d"],
    explanation: {
      en: "On sorted input, a sum that is too small means the left element cannot pair with anything to its right except larger values, so it is discarded and the pointer moves right (and symmetrically for the right pointer). That gives O(n) time with constant space. Without ordering the discard argument fails; use a hash map instead.",
      uk: "На відсортованих даних замала сума означає, що лівий елемент не утворить пари з жодним елементом, тож його відкидаємо й зсуваємо вказівник праворуч (симетрично для правого вказівника). Звідси O(n) часу та константна пам'ять. Без упорядкування аргумент про відкидання не працює, тому для невідсортованих даних беріть хеш-таблицю.",
    },
  },
  {
    kind: "quiz",
    slug: "search-on-answer",
    skills: ["searching-algorithms", ALGO],
    complexity: 4,
    estSeconds: 150,
    title: { en: "Binary search on the answer", uk: "Бінарний пошук за відповіддю" },
    prompt: {
      en: "Packages with weights `w[]` must ship in order within `D` days. You need the minimum ship capacity. Why is binary search over the capacity valid?",
      uk: "Посилки з вагами `w[]` треба відправити по черзі за `D` днів. Потрібно знайти мінімальну місткість корабля. Чому тут коректний бінарний пошук за місткістю?",
    },
    options: [
      {
        id: "a",
        text: {
          en: "Feasibility is monotonic: if capacity C works, every capacity above C also works",
          uk: "Здійсненність монотонна: якщо місткість C підходить, то й будь-яка більша теж",
        },
      },
      { id: "b", text: { en: "The weights array is sorted", uk: "Масив ваг відсортований" } },
      { id: "c", text: { en: "Capacity can only take powers of two", uk: "Місткість може бути лише степенем двійки" } },
      { id: "d", text: { en: "The number of days is always less than log₂(n)", uk: "Кількість днів завжди менша за log₂(n)" } },
    ],
    correct: ["a"],
    explanation: {
      en: "We binary search over capacities between `max(w)` and `sum(w)`. A greedy O(n) check tells whether a capacity fits in D days, and the answer flips from 'no' to 'yes' exactly once, which is the monotonic predicate binary search needs. The weights do not need to be sorted.",
      uk: "Ми шукаємо бінарно серед місткостей від `max(w)` до `sum(w)`. Жадібна перевірка за O(n) показує, чи вкладається місткість у D днів, а відповідь змінюється з «ні» на «так» рівно один раз. Саме такий монотонний предикат потрібен бінарному пошуку. Ваги відсортовувати не потрібно.",
    },
  },
  {
    kind: "practice",
    slug: "search-implement-binary-search",
    skills: ["searching-algorithms", ALGO],
    complexity: 2,
    estSeconds: 600,
    framework: "vanilla-ts",
    title: { en: "Implement binary search", uk: "Реалізуйте бінарний пошук" },
    prompt: {
      en: "Implement `binarySearch(items, target)` in **O(log n)**. `items` is sorted ascending. Return the index of `target`, or `-1` if it is absent. Don't use `indexOf`, `includes` or `findIndex`.\n\nThe preview shows a few sample searches; tests run automatically after every change.",
      uk: "Реалізуйте `binarySearch(items, target)` за **O(log n)**. `items` відсортовано за зростанням. Поверніть індекс `target` або `-1`, якщо його немає. Не використовуйте `indexOf`, `includes` чи `findIndex`.\n\nУ попередньому перегляді — кілька прикладів пошуку; тести запускаються автоматично після кожної зміни.",
    },
    files: {
      "/src/binarySearch.ts": `/**
 * Returns the index of \`target\` in the ascending array \`items\`, or -1.
 * Must run in O(log n).
 */
export function binarySearch(items: number[], target: number): number {
  // TODO
  return -1;
}
`,
      "/index.ts": `import "./styles.css";
import { binarySearch } from "./src/binarySearch";

const data = [2, 3, 5, 7, 11, 13, 17, 19, 23];
const rows = [7, 2, 23, 4]
  .map((t) => \`<li>binarySearch(data, \${t}) → <output>\${binarySearch(data, t)}</output></li>\`)
  .join("");

document.getElementById("app")!.innerHTML = \`
  <h1>Binary search</h1>
  <p><code>[\${data.join(", ")}]</code></p>
  <ul>\${rows}</ul>
\`;
`,
    },
    visibleFiles: ["/src/binarySearch.ts", "/index.ts"],
    activeFile: "/src/binarySearch.ts",
    tests: `import { describe, it, expect } from "./test-kit";
import { binarySearch } from "../src/binarySearch";

const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];

describe("binarySearch", () => {
  it("finds an element in the middle", () => expect(binarySearch(primes, 11)).toBe(4));
  it("finds the first and last elements", () => {
    expect(binarySearch(primes, 2)).toBe(0);
    expect(binarySearch(primes, 23)).toBe(8);
  });
  it("returns -1 for a missing element", () => {
    expect(binarySearch(primes, 4)).toBe(-1);
    expect(binarySearch(primes, 100)).toBe(-1);
    expect(binarySearch(primes, -5)).toBe(-1);
  });
  it("handles empty and single-element arrays", () => {
    expect(binarySearch([], 1)).toBe(-1);
    expect(binarySearch([5], 5)).toBe(0);
    expect(binarySearch([5], 6)).toBe(-1);
  });
  it("runs in logarithmic time", () => {
    const big = Array.from({ length: 1 << 20 }, (_, i) => i * 2);
    let reads = 0;
    const spy = new Proxy(big, {
      get(target, prop, receiver) {
        if (typeof prop === "string" && /^\\d+$/.test(prop)) reads++;
        return Reflect.get(target, prop, receiver);
      },
    });
    expect(binarySearch(spy, 777_776)).toBe(388_888);
    expect(reads).toBeLessThan(64);
  });
});
`,
    solution: {
      "/src/binarySearch.ts": `export function binarySearch(items: number[], target: number): number {
  let lo = 0;
  let hi = items.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    const value = items[mid];
    if (value === target) return mid;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
`,
    },
    explanation: {
      en: "Keep the invariant 'if target exists, it is within [lo, hi]'. Compare with the middle element and shrink the range by excluding `mid` on each side. The loop runs at most ⌈log₂(n+1)⌉ times.",
      uk: "Тримайте інваріант «якщо target існує, він у [lo, hi]». Порівнюйте з середнім елементом і звужуйте діапазон, виключаючи `mid` з відповідного боку. Цикл виконується не більше ⌈log₂(n+1)⌉ разів.",
    },
  },
  {
    kind: "practice",
    slug: "search-count-occurrences",
    skills: ["searching-algorithms", ALGO],
    complexity: 4,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: { en: "Count occurrences in O(log n)", uk: "Кількість входжень за O(log n)" },
    prompt: {
      en: "Implement `countOccurrences(sorted, x)`, which returns how many times `x` appears in an ascending array that may contain duplicates. It must make **O(log n)** reads, so a linear scan over the duplicates is not allowed. Hint: two lower-bound searches.",
      uk: "Реалізуйте `countOccurrences(sorted, x)`, що повертає, скільки разів `x` трапляється у відсортованому за зростанням масиві з можливими дублікатами. Функція має робити **O(log n)** звертань до масиву, тож лінійний прохід по дублікатах заборонено. Підказка: два пошуки нижньої межі.",
    },
    files: {
      "/src/count.ts": `/** Number of times \`x\` occurs in the ascending array \`sorted\`. O(log n). */
export function countOccurrences(sorted: number[], x: number): number {
  // TODO
  return 0;
}
`,
      "/index.ts": `import "./styles.css";
import { countOccurrences } from "./src/count";

const data = [1, 2, 2, 2, 3, 5, 5, 8];
document.getElementById("app")!.innerHTML = \`
  <h1>Count occurrences</h1>
  <p><code>[\${data.join(", ")}]</code></p>
  <p>2 occurs <output id="two">\${countOccurrences(data, 2)}</output> times,
     5 occurs <output id="five">\${countOccurrences(data, 5)}</output> times.</p>
\`;
`,
    },
    visibleFiles: ["/src/count.ts", "/index.ts"],
    activeFile: "/src/count.ts",
    tests: `import { describe, it, expect } from "./test-kit";
import { countOccurrences } from "../src/count";

describe("countOccurrences", () => {
  it("counts a run of duplicates", () => expect(countOccurrences([1, 2, 2, 2, 3], 2)).toBe(3));
  it("counts single and missing values", () => {
    expect(countOccurrences([1, 2, 2, 2, 3], 3)).toBe(1);
    expect(countOccurrences([1, 2, 2, 2, 3], 4)).toBe(0);
    expect(countOccurrences([], 1)).toBe(0);
  });
  it("handles runs at both ends", () => {
    expect(countOccurrences([7, 7, 7, 8, 9, 9], 7)).toBe(3);
    expect(countOccurrences([7, 7, 7, 8, 9, 9], 9)).toBe(2);
  });
  it("uses a logarithmic number of reads", () => {
    const big = new Array(1 << 20).fill(42);
    let reads = 0;
    const spy = new Proxy(big, {
      get(target, prop, receiver) {
        if (typeof prop === "string" && /^\\d+$/.test(prop)) reads++;
        return Reflect.get(target, prop, receiver);
      },
    });
    expect(countOccurrences(spy, 42)).toBe(1 << 20);
    expect(reads).toBeLessThan(100);
  });
});
`,
    solution: {
      "/src/count.ts": `function lowerBound(a: number[], x: number) {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function countOccurrences(sorted: number[], x: number): number {
  return lowerBound(sorted, x + 1) - lowerBound(sorted, x);
}
`,
    },
    explanation: {
      en: "The first index with value ≥ x and the first index with value ≥ x+1 bracket the run of x. Two lower-bound searches cost O(log n), regardless of how many duplicates there are. (For non-integers, use an 'upper bound' with `<=` instead of x+1.)",
      uk: "Перший індекс зі значенням ≥ x і перший індекс зі значенням ≥ x+1 обмежують серію x. Два пошуки нижньої межі коштують O(log n) незалежно від кількості дублікатів. (Для нецілих чисел використайте «верхню межу» з `<=` замість x+1.)",
    },
  },
]);
