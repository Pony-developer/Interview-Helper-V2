import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "arr-fill-shared",
    ["arrays-strings"],
    3,
    75,
    ["fill() with an object", "fill() з об'єктом"],
    ["What does this log?", "Що буде виведено?"],
    [
      ["`[[\"x\"], [], []]`", "`[[\"x\"], [], []]`"],
      ["`[[\"x\"], [\"x\"], [\"x\"]]`", "`[[\"x\"], [\"x\"], [\"x\"]]`"],
      ["`[[], [], []]`", "`[[], [], []]`"],
      ["It throws a TypeError", "Кидає TypeError"],
    ],
    "b",
    [
      "`fill([])` evaluates `[]` once and puts the same array reference in every slot, so pushing into one row changes all of them. Create a new array per slot with `Array.from({ length: 3 }, () => [])`.",
      "`fill([])` обчислює `[]` один раз і кладе те саме посилання в кожну комірку, тож додавання в один рядок змінює всі. Створюйте новий масив для кожної комірки: `Array.from({ length: 3 }, () => [])`.",
    ],
    { code: 'const grid = new Array(3).fill([]);\ngrid[0].push("x");\nconsole.log(grid);', codeLanguage: "js" },
  ),
  quiz(
    "arr-holes-map",
    ["arrays-strings"],
    4,
    75,
    ["Mapping over holes", "map по «дірках»"],
    ["What is `indexes`?", "Що таке `indexes`?"],
    [
      ["`[0, 1, 2]`", "`[0, 1, 2]`"],
      ["`[undefined, undefined, undefined]`", "`[undefined, undefined, undefined]`"],
      ["An array of 3 empty slots", "Масив із 3 порожніх комірок"],
      ["`[]`", "`[]`"],
    ],
    "c",
    [
      "`Array(3)` creates a sparse array with length 3 but no elements. `map`, `forEach` and `filter` skip holes, so the callback never runs and the result is still sparse. Use `Array.from({ length: 3 }, (_, i) => i)` or `[...Array(3).keys()]`.",
      "`Array(3)` створює розріджений масив довжиною 3 без елементів. `map`, `forEach` і `filter` пропускають «дірки», тож колбек не викликається, а результат лишається розрідженим. Використовуйте `Array.from({ length: 3 }, (_, i) => i)` або `[...Array(3).keys()]`.",
    ],
    { code: "const indexes = Array(3).map((_, i) => i);", codeLanguage: "js" },
  ),
  quiz(
    "arr-splice-in-foreach",
    ["arrays-strings"],
    5,
    120,
    ["Removing while iterating", "Видалення під час обходу"],
    ["What is `nums` afterwards?", "Яким буде `nums` після цього?"],
    [
      ["`[7]`", "`[7]`"],
      ["`[4, 7]`", "`[4, 7]`"],
      ["`[6, 7]`", "`[6, 7]`"],
      ["`[4, 6, 7]`", "`[4, 6, 7]`"],
    ],
    "b",
    [
      "`forEach` walks indexes 0, 1, 2… over the live array. Removing 2 at index 0 shifts 4 into index 0, but the next visit is index 1 (now 6), so 4 is never checked. Removing 6 shifts 7 to index 1, and the loop ends because the length is now 2. Use `nums = nums.filter((n) => n % 2 !== 0)`, or loop backwards if you must mutate.",
      "`forEach` проходить індекси 0, 1, 2… живого масиву. Видалення 2 з індексу 0 зсуває 4 на індекс 0, але наступний відвіданий індекс — 1 (тепер це 6), тож 4 не перевіряється. Видалення 6 зсуває 7 на індекс 1, і цикл завершується, бо довжина тепер 2. Використовуйте `nums = nums.filter((n) => n % 2 !== 0)` або, якщо мусите змінювати масив, ідіть з кінця.",
    ],
    { code: "const nums = [2, 4, 6, 7];\nnums.forEach((n, i) => {\n  if (n % 2 === 0) nums.splice(i, 1);\n});", codeLanguage: "js" },
  ),
  practice({
    slug: "str-run-length",
    skills: ["arrays-strings"],
    complexity: 2,
    estSeconds: 600,
    framework: "vanilla-ts",
    title: ["Run-length encoding", "Кодування довжин серій"],
    prompt: [
      "Implement `encode` and `decode` for run-length encoding. Inputs contain letters only.\n\n- `encode` replaces each run of a repeated letter with the letter and the run length. A run of 1 is written without a number.\n- Counts can have several digits.\n- `decode(encode(s))` must give back `s`.\n\n```ts\nencode(\"aaabccdddd\") // \"a3bc2d4\"\nencode(\"xxxxxxxxxxxx\") // \"x12\"\ndecode(\"a3bc2d4\") // \"aaabccdddd\"\n```",
      "Реалізуйте `encode` і `decode` для кодування довжин серій. Вхідні дані містять лише літери.\n\n- `encode` замінює кожну серію повторюваної літери на літеру й довжину серії. Серія довжиною 1 записується без числа.\n- Лічильник може мати кілька цифр.\n- `decode(encode(s))` має повертати `s`.\n\n```ts\nencode(\"aaabccdddd\") // \"a3bc2d4\"\nencode(\"xxxxxxxxxxxx\") // \"x12\"\ndecode(\"a3bc2d4\") // \"aaabccdddd\"\n```",
    ],
    files: {
      "/src/rle.ts": "export function encode(text: string): string {\n  // TODO\n  return text;\n}\n\nexport function decode(encoded: string): string {\n  // TODO\n  return encoded;\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { decode, encode } from "./src/rle";\n\nconst sample = "wwwwaaadexxxxxx";\ndocument.getElementById("app")!.innerHTML =\n  "<h1>Run-length encoding</h1><p>" + sample + " → " + encode(sample) + " → " + decode(encode(sample)) + "</p>";\n',
    },
    visibleFiles: ["/src/rle.ts", "/index.ts"],
    activeFile: "/src/rle.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { decode, encode } from "../src/rle";\n\ndescribe("run-length encoding", () => {\n  it("encodes runs", () => expect(encode("aaabccdddd")).toBe("a3bc2d4"));\n  it("writes single letters without a count", () => expect(encode("abc")).toBe("abc"));\n  it("handles multi-digit counts", () => expect(encode("xxxxxxxxxxxx")).toBe("x12"));\n  it("is case-sensitive", () => expect(encode("aAA")).toBe("aA2"));\n  it("handles empty input", () => {\n    expect(encode("")).toBe("");\n    expect(decode("")).toBe("");\n  });\n  it("decodes runs and multi-digit counts", () => {\n    expect(decode("a3bc2d4")).toBe("aaabccdddd");\n    expect(decode("x12y")).toBe("xxxxxxxxxxxxy");\n  });\n  it("round-trips", () => {\n    for (const s of ["wwwwaaadexxxxxx", "z", "abbbbbbbbbbbbbbbbbbbbbbbbbc"]) expect(decode(encode(s))).toBe(s);\n  });\n});\n',
    solution: {
      "/src/rle.ts":
        "export function encode(text: string): string {\n  let out = \"\";\n  for (let i = 0; i < text.length; ) {\n    let j = i;\n    while (j < text.length && text[j] === text[i]) j++;\n    const run = j - i;\n    out += text[i] + (run > 1 ? String(run) : \"\");\n    i = j;\n  }\n  return out;\n}\n\nexport function decode(encoded: string): string {\n  let out = \"\";\n  for (const [, letter, count] of encoded.matchAll(/([a-zA-Z])(\\d*)/g)) {\n    out += letter.repeat(count ? Number(count) : 1);\n  }\n  return out;\n}\n",
    },
    explanation: [
      "Encoding uses two pointers: `j` scans to the end of the current run, and the run length is `j - i`. Decoding reads a letter followed by an optional number. A regex with `matchAll` handles multi-digit counts cleanly, and `repeat` expands each run. Building a string with `+=` is fine here; for very large inputs, push parts into an array and `join` once.",
      "Кодування використовує два вказівники: `j` доходить до кінця поточної серії, а довжина серії — `j - i`. Декодування читає літеру й необов'язкове число після неї. Регулярний вираз із `matchAll` охайно обробляє багатозначні лічильники, а `repeat` розгортає кожну серію. Побудова рядка через `+=` тут підходить; для дуже великих даних збирайте частини в масив і один раз робіть `join`.",
    ],
  }),
]);
