import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const ALGO = w("algorithms");

export default defineTasks([
  quiz(
    "rec-base-case",
    ["recursion", ALGO],
    1,
    60,
    ["Missing base case", "Відсутній базовий випадок"],
    ["What happens when you call `countdown(3)`?", "Що станеться під час виклику `countdown(3)`?"],
    [
      ["Logs 3, 2, 1, 0 and stops", "Виведе 3, 2, 1, 0 і зупиниться"],
      ["Logs forever (negative numbers) until `RangeError: Maximum call stack size exceeded`", "Виводить безкінечно (від'ємні числа), доки не буде `RangeError: Maximum call stack size exceeded`"],
      ["Logs only 3", "Виведе лише 3"],
      ["Throws a SyntaxError", "Кине SyntaxError"],
    ],
    "b",
    [
      "There is no base case, so every call recurses again and the call stack overflows. Add `if (n < 0) return;` before the recursive call.",
      "Базового випадку немає, тож кожен виклик знову рекурсує, і стек викликів переповнюється. Додайте `if (n < 0) return;` перед рекурсивним викликом.",
    ],
    { code: "function countdown(n) {\n  console.log(n);\n  countdown(n - 1);\n}", codeLanguage: "js" },
  ),
  quiz(
    "rec-fib-complexity",
    ["recursion", w("big-o")],
    2,
    90,
    ["Naive Fibonacci", "Наївне Фібоначчі"],
    ["What is the time complexity of this `fib(n)`?", "Яка часова складність цього `fib(n)`?"],
    [
      ["O(n)", "O(n)"],
      ["O(n log n)", "O(n log n)"],
      ["O(2ⁿ) (exponential)", "O(2ⁿ) (експоненційна)"],
      ["O(n²)", "O(n²)"],
    ],
    "c",
    [
      "Each call spawns two more and the same sub-problems are recomputed many times, so the number of calls grows exponentially (≈ φⁿ). Memoisation or a bottom-up loop brings it down to O(n).",
      "Кожен виклик породжує ще два, а ті самі підзадачі обчислюються багато разів, тож кількість викликів зростає експоненційно (≈ φⁿ). Мемоізація або цикл «знизу вгору» знижує складність до O(n).",
    ],
    { code: "const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));", codeLanguage: "js" },
  ),
  quiz(
    "rec-stack-depth",
    ["recursion"],
    3,
    120,
    ["Deep recursion", "Глибока рекурсія"],
    ["A recursive `length(node)` crashes on a linked list with 200,000 nodes. What's the most robust fix in JavaScript?", "Рекурсивна `length(node)` падає на зв'язному списку з 200 000 вузлів. Яке виправлення в JavaScript найнадійніше?"],
    [
      ["Rewrite it as a loop (or use an explicit stack)", "Переписати як цикл (або використати явний стек)"],
      ["Make it a tail call: engines optimise it", "Зробити хвостовий виклик: рушії його оптимізують"],
      ["Wrap the call in `try/catch`", "Обгорнути виклик у `try/catch`"],
      ["Use `async` recursion", "Використати `async`-рекурсію"],
    ],
    "a",
    [
      "Each recursive call consumes a stack frame, and engines cap the depth (typically ~10k). Proper tail calls are in the spec but only Safari ships them, so don't rely on them. An iterative loop uses constant stack space.",
      "Кожен рекурсивний виклик займає кадр стеку, а рушії обмежують глибину (зазвичай ~10 тис.). Правильні хвостові виклики є в специфікації, але реалізовані лише в Safari, тож покладатися на них не варто. Ітеративний цикл використовує сталий обсяг стеку.",
    ],
  ),
  quiz(
    "rec-subsets-count",
    ["recursion", ALGO],
    3,
    120,
    ["Counting subsets", "Кількість підмножин"],
    ["A backtracking function generates every subset of an array of 20 items. Roughly how many subsets does it produce?", "Функція з пошуком із поверненням генерує всі підмножини масиву з 20 елементів. Приблизно скільки підмножин вона створить?"],
    [
      ["20", "20"],
      ["400", "400"],
      ["About a million (2²⁰)", "Близько мільйона (2²⁰)"],
      ["20! ≈ 2.4 × 10¹⁸", "20! ≈ 2.4 × 10¹⁸"],
    ],
    "c",
    [
      "Each item is either in or out of a subset, so there are 2ⁿ subsets: 2²⁰ = 1,048,576. Permutations would be n! (option D), which is astronomically larger.",
      "Кожен елемент або входить до підмножини, або ні, тож підмножин 2ⁿ: 2²⁰ = 1 048 576. Перестановок було б n! (варіант D), що астрономічно більше.",
    ],
  ),
  quiz(
    "rec-tree-traversal",
    ["recursion", w("data-structures")],
    4,
    150,
    ["Tree traversal order", "Порядок обходу дерева"],
    ["For a binary **search** tree, which traversal visits the values in ascending order?", "Який обхід бінарного дерева **пошуку** відвідує значення в порядку зростання?"],
    [
      ["Pre-order (node, left, right)", "Прямий (вузол, ліве, праве)"],
      ["In-order (left, node, right)", "Симетричний (ліве, вузол, праве)"],
      ["Post-order (left, right, node)", "Зворотний (ліве, праве, вузол)"],
      ["Level-order (BFS)", "За рівнями (BFS)"],
    ],
    "b",
    [
      "In a BST every value in the left subtree is smaller and every value in the right subtree is larger. Visiting left, then the node, then right yields sorted output.",
      "У BST усі значення лівого піддерева менші, а правого більші. Обхід «ліве, вузол, праве» дає відсортований вивід.",
    ],
  ),
  practice({
    slug: "rec-flatten-depth",
    skills: ["recursion", w("arrays-strings")],
    complexity: 2,
    estSeconds: 720,
    framework: "vanilla-js",
    title: ["Flatten nested arrays", "Розгорніть вкладені масиви"],
    prompt: [
      "Implement `flatten(array, depth = Infinity)` **recursively**, without `Array.prototype.flat`:\n\n- Nested arrays are flattened up to `depth` levels.\n- `depth = 0` returns a shallow copy.\n- Don't mutate the input.\n\n```js\nflatten([1, [2, [3, [4]]]])    // [1, 2, 3, 4]\nflatten([1, [2, [3, [4]]]], 1) // [1, 2, [3, [4]]]\n```",
      "Реалізуйте `flatten(array, depth = Infinity)` **рекурсивно**, без `Array.prototype.flat`:\n\n- Вкладені масиви розгортаються на глибину до `depth` рівнів.\n- `depth = 0` повертає поверхневу копію.\n- Не змінюйте вхідні дані.\n\n```js\nflatten([1, [2, [3, [4]]]])    // [1, 2, 3, 4]\nflatten([1, [2, [3, [4]]]], 1) // [1, 2, [3, [4]]]\n```",
    ],
    files: {
      "/src/flatten.js": "export function flatten(array, depth = Infinity) {\n  // TODO: recursive, no Array.prototype.flat\n  return array;\n}\n",
      "/index.js": 'import "./styles.css";\nimport { flatten } from "./src/flatten";\n\nconst nested = [1, [2, [3, [4, [5]]]], 6];\ndocument.getElementById("app").innerHTML =\n  "<h1>Flatten</h1>" +\n  "<p>Input: <code>" + JSON.stringify(nested) + "</code></p>" +\n  "<p>Full: <output id=\\"full\\">" + JSON.stringify(flatten(nested)) + "</output></p>" +\n  "<p>Depth 1: <output id=\\"one\\">" + JSON.stringify(flatten(nested, 1)) + "</output></p>";\n',
    },
    visibleFiles: ["/src/flatten.js", "/index.js"],
    activeFile: "/src/flatten.js",
    tests: 'import { describe, it, expect, screen } from "./test-kit";\nimport { flatten } from "../src/flatten";\n\ndescribe("flatten", () => {\n  it("flattens completely by default", () => {\n    expect(flatten([1, [2, [3, [4]]], 5])).toEqual([1, 2, 3, 4, 5]);\n  });\n  it("respects depth", () => {\n    expect(flatten([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]);\n    expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);\n  });\n  it("returns a shallow copy for depth 0", () => {\n    const input = [1, [2]];\n    const out = flatten(input, 0);\n    expect(out).toEqual([1, [2]]);\n    expect(out === input).toBe(false);\n  });\n  it("does not mutate the input", () => {\n    const input = [1, [2, [3]]];\n    flatten(input);\n    expect(input).toEqual([1, [2, [3]]]);\n  });\n  it("does not use Array.prototype.flat", () => {\n    const original = Array.prototype.flat;\n    Array.prototype.flat = function () { throw new Error("flat() is not allowed"); };\n    try {\n      expect(flatten([[1], [[2]]])).toEqual([1, 2]);\n    } finally {\n      Array.prototype.flat = original;\n    }\n  });\n  it("renders the demo", async () => {\n    expect((await screen.findByText("[1,2,3,4,5,6]")).id).toBe("full");\n  });\n});\n',
    solution: {
      "/src/flatten.js": "export function flatten(array, depth = Infinity) {\n  const out = [];\n  for (const item of array) {\n    if (Array.isArray(item) && depth > 0) {\n      for (const inner of flatten(item, depth - 1)) out.push(inner);\n    } else {\n      out.push(item);\n    }\n  }\n  return out;\n}\n",
    },
    explanation: [
      "Walk the array. When an item is an array and there is depth left, recurse with `depth - 1` and append its result; otherwise append the item as is. The base case is implicit: a call on an array without nested arrays (or with depth 0) just copies its items.",
      "Пройдіть масив. Якщо елемент є масивом і глибина ще лишилася, рекурсивно викличте функцію з `depth - 1` і додайте її результат; інакше додайте елемент як є. Базовий випадок неявний: виклик на масиві без вкладених масивів (або з глибиною 0) просто копіює елементи.",
    ],
  }),
]);
