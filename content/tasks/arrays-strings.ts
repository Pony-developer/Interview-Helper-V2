import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

export default defineTasks([
  quiz(
    "arr-default-sort",
    ["arrays-strings", w("javascript")],
    1,
    60,
    ["Default sort", "Сортування за замовчуванням"],
    ["What does `[10, 1, 5, 100].sort()` return?", "Що повертає `[10, 1, 5, 100].sort()`?"],
    [
      ["`[1, 5, 10, 100]`", "`[1, 5, 10, 100]`"],
      ["`[1, 10, 100, 5]`", "`[1, 10, 100, 5]`"],
      ["`[100, 10, 5, 1]`", "`[100, 10, 5, 1]`"],
      ["It throws without a comparator", "Без компаратора кидає помилку"],
    ],
    "b",
    [
      "Without a comparator, elements are converted to strings and compared by UTF-16 code units, so \"10\" < \"100\" < \"5\". Use `(a, b) => a - b` for numbers.",
      "Без компаратора елементи перетворюються на рядки й порівнюються за кодами UTF-16, тому \"10\" < \"100\" < \"5\". Для чисел використовуйте `(a, b) => a - b`.",
    ],
  ),
  quiz(
    "arr-mutating-methods",
    ["arrays-strings"],
    2,
    90,
    ["Which methods mutate?", "Які методи змінюють масив?"],
    ["Which of these **mutate** the original array? Select all that apply.", "Які з цих методів **змінюють** вихідний масив? Оберіть усі правильні."],
    [
      ["`sort`", "`sort`"],
      ["`toSorted`", "`toSorted`"],
      ["`splice`", "`splice`"],
      ["`slice`", "`slice`"],
      ["`reverse`", "`reverse`"],
    ],
    "ace",
    [
      "`sort`, `splice` and `reverse` change the array in place. `toSorted` and `slice` return new arrays and leave the original untouched, which is what you want for React or Redux state.",
      "`sort`, `splice` і `reverse` змінюють масив на місці. `toSorted` і `slice` повертають нові масиви й не чіпають вихідний, що й потрібно для стану React чи Redux.",
    ],
  ),
  quiz(
    "arr-reduce-initial",
    ["arrays-strings"],
    2,
    90,
    ["reduce without an initial value", "reduce без початкового значення"],
    ["What happens when `items` is an empty array?", "Що станеться, якщо `items` є порожнім масивом?"],
    [
      ["Returns `0`", "Повертає `0`"],
      ["Returns `undefined`", "Повертає `undefined`"],
      ["Throws `TypeError: Reduce of empty array with no initial value`", "Кидає `TypeError: Reduce of empty array with no initial value`"],
      ["Returns `NaN`", "Повертає `NaN`"],
    ],
    "c",
    [
      "Without an initial value, `reduce` uses the first element as the accumulator, which doesn't exist for an empty array, so it throws. Always pass one: `reduce((s, x) => s + x.price, 0)`.",
      "Без початкового значення `reduce` бере перший елемент як акумулятор, а в порожньому масиві його немає, тож метод кидає помилку. Завжди передавайте значення: `reduce((s, x) => s + x.price, 0)`.",
    ],
    { code: "const total = items.reduce((sum, item) => sum + item.price);", codeLanguage: "js" },
  ),
  quiz(
    "arr-dedupe-complexity",
    ["arrays-strings", w("big-o")],
    3,
    120,
    ["Faster de-duplication", "Швидше видалення дублікатів"],
    ["This de-duplication is slow for 100k items. Which rewrite keeps the first-seen order and runs in O(n)?", "Це видалення дублікатів повільне для 100 тис. елементів. Який варіант зберігає порядок першої появи й працює за O(n)?"],
    [
      ["`[...new Set(items)]`", "`[...new Set(items)]`"],
      ["`items.sort().filter((x, i, a) => x !== a[i - 1])`", "`items.sort().filter((x, i, a) => x !== a[i - 1])`"],
      ["`items.reduce((acc, x) => acc.concat(x), [])`", "`items.reduce((acc, x) => acc.concat(x), [])`"],
      ["`Array.from(items).reverse()`", "`Array.from(items).reverse()`"],
    ],
    "a",
    [
      "`indexOf` inside `filter` is O(n²). A Set keeps insertion order and gives O(1) membership, so `[...new Set(items)]` is O(n). Sorting first is O(n log n), loses the original order and mutates `items`.",
      "`indexOf` усередині `filter` дає O(n²). Set зберігає порядок вставки й перевіряє наявність за O(1), тож `[...new Set(items)]` працює за O(n). Попереднє сортування дає O(n log n), втрачає початковий порядок і змінює `items`.",
    ],
    { code: "const unique = items.filter((x, i) => items.indexOf(x) === i);", codeLanguage: "js" },
  ),
  quiz(
    "str-emoji-reverse",
    ["arrays-strings"],
    4,
    120,
    ["Reversing Unicode strings", "Розворот рядків Unicode"],
    ["Why can `s.split(\"\").reverse().join(\"\")` corrupt emoji like 😀?", "Чому `s.split(\"\").reverse().join(\"\")` може зіпсувати емодзі на кшталт 😀?"],
    [
      ["`split(\"\")` splits into UTF-16 code units, separating surrogate pairs", "`split(\"\")` ділить на кодові одиниці UTF-16 і розриває сурогатні пари"],
      ["`reverse` doesn't work on strings", "`reverse` не працює з рядками"],
      ["`join` removes non-ASCII characters", "`join` видаляє не-ASCII символи"],
      ["Emoji are stored as two separate strings", "Емодзі зберігаються як два окремі рядки"],
    ],
    "a",
    [
      "Characters outside the Basic Multilingual Plane take two UTF-16 code units. `split(\"\")` separates them, and reversing swaps the halves into invalid sequences. `[...s]` (or `Array.from(s)`) iterates by code points. Grapheme clusters such as flags or skin tones need `Intl.Segmenter`.",
      "Символи поза базовою багатомовною площиною займають дві кодові одиниці UTF-16. `split(\"\")` розділяє їх, а розворот міняє половинки місцями й дає некоректні послідовності. `[...s]` (або `Array.from(s)`) ітерує за кодовими точками. Для графемних кластерів, як-от прапорів чи відтінків шкіри, потрібен `Intl.Segmenter`.",
    ],
  ),
  practice({
    slug: "str-group-anagrams",
    skills: ["arrays-strings", w("data-structures")],
    complexity: 3,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Group anagrams", "Групування анаграм"],
    prompt: [
      "Implement `groupAnagrams(words)`. Words are anagrams if they use the same letters, **ignoring case and non-letter characters**.\n\n- Return groups in the order their first word appears, and words inside a group in input order.\n- Keep the original spelling of each word.\n\n```ts\ngroupAnagrams([\"Listen\", \"enlist\", \"google\", \"Silent\"])\n// [[\"Listen\", \"enlist\", \"Silent\"], [\"google\"]]\n```",
      "Реалізуйте `groupAnagrams(words)`. Слова є анаграмами, якщо складаються з тих самих літер, **без урахування регістру й небуквених символів**.\n\n- Повертайте групи в порядку появи їхнього першого слова, а слова всередині групи в порядку вхідних даних.\n- Зберігайте оригінальне написання кожного слова.\n\n```ts\ngroupAnagrams([\"Listen\", \"enlist\", \"google\", \"Silent\"])\n// [[\"Listen\", \"enlist\", \"Silent\"], [\"google\"]]\n```",
    ],
    files: {
      "/src/anagrams.ts": "export function groupAnagrams(words: string[]): string[][] {\n  // TODO\n  return words.map((w) => [w]);\n}\n",
      "/index.ts": 'import "./styles.css";\nimport { groupAnagrams } from "./src/anagrams";\n\nconst groups = groupAnagrams(["Listen", "enlist", "google", "Silent", "inlets", "banana"]);\ndocument.getElementById("app")!.innerHTML =\n  "<h1>Anagram groups</h1><ul>" + groups.map((g) => `<li>${g.join(", ")}</li>`).join("") + "</ul>";\n',
    },
    visibleFiles: ["/src/anagrams.ts", "/index.ts"],
    activeFile: "/src/anagrams.ts",
    tests: 'import { describe, it, expect, screen } from "./test-kit";\nimport { groupAnagrams } from "../src/anagrams";\n\ndescribe("groupAnagrams", () => {\n  it("groups words with the same letters", () => {\n    expect(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])).toEqual([["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]);\n  });\n  it("ignores case and keeps the original spelling", () => {\n    expect(groupAnagrams(["Listen", "enlist", "google", "Silent"])).toEqual([["Listen", "enlist", "Silent"], ["google"]]);\n  });\n  it("ignores non-letter characters", () => {\n    expect(groupAnagrams(["Dormitory", "dirty room!", "x"])).toEqual([["Dormitory", "dirty room!"], ["x"]]);\n  });\n  it("does not merge words with different letter counts", () => {\n    expect(groupAnagrams(["aab", "abb"])).toEqual([["aab"], ["abb"]]);\n  });\n  it("handles an empty list", () => expect(groupAnagrams([])).toEqual([]));\n  it("renders the demo", async () => {\n    expect(await screen.findAllByRole("listitem")).toHaveLength(3);\n  });\n});\n',
    solution: {
      "/src/anagrams.ts": "function signature(word: string) {\n  return [...word.toLowerCase().replace(/[^\\p{L}]/gu, \"\")].sort().join(\"\");\n}\n\nexport function groupAnagrams(words: string[]): string[][] {\n  const groups = new Map<string, string[]>();\n  for (const word of words) {\n    const key = signature(word);\n    const group = groups.get(key);\n    if (group) group.push(word);\n    else groups.set(key, [word]);\n  }\n  return [...groups.values()];\n}\n",
    },
    explanation: [
      "Map each word to a canonical signature: its lower-cased letters, sorted. A Map from signature to group preserves insertion order, so groups come out in first-appearance order. Sorting each word costs O(k log k), so the total is O(n·k log k). A 26-letter count vector would make it O(n·k).",
      "Зіставте кожне слово з канонічним підписом: його літери в нижньому регістрі, відсортовані. Map від підпису до групи зберігає порядок вставки, тож групи йдуть у порядку першої появи. Сортування кожного слова коштує O(k log k), разом O(n·k log k). Вектор лічильників із 26 літер дав би O(n·k).",
    ],
  }),
]);
