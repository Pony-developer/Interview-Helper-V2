import { defineTasks } from "@/lib/content/schema";
import { quiz, w } from "./_helpers";

const ALGO = w("algorithms");

export default defineTasks([
  quiz(
    "bigo-nested-loops",
    ["big-o", ALGO],
    1,
    60,
    ["Nested loops", "Вкладені цикли"],
    ["What is the time complexity of this function for an array of length n?", "Яка часова складність цієї функції для масиву довжини n?"],
    [
      ["O(n)", "O(n)"],
      ["O(n log n)", "O(n log n)"],
      ["O(n²)", "O(n²)"],
      ["O(2n)", "O(2n)"],
    ],
    "c",
    [
      "The inner loop runs up to n times for each of the n outer iterations: about n²/2 comparisons, which is O(n²), since constants are dropped.",
      "Внутрішній цикл виконується до n разів для кожної з n зовнішніх ітерацій: близько n²/2 порівнянь, тобто O(n²), бо константи відкидаються.",
    ],
    { code: "function hasDuplicate(a) {\n  for (let i = 0; i < a.length; i++)\n    for (let j = i + 1; j < a.length; j++)\n      if (a[i] === a[j]) return true;\n  return false;\n}", codeLanguage: "js" },
  ),
  quiz(
    "bigo-includes-in-loop",
    ["big-o", w("arrays-strings")],
    2,
    90,
    ["Hidden linear cost", "Прихована лінійна вартість"],
    ["`users` has n items and `bannedIds` has m items. What's the complexity, and how do you improve it?", "`users` має n елементів, а `bannedIds` має m. Яка складність і як її покращити?"],
    [
      ["O(n + m); it's already optimal", "O(n + m); уже оптимально"],
      ["O(n·m); build `new Set(bannedIds)` once and use `has` → O(n + m)", "O(n·m); один раз побудувати `new Set(bannedIds)` і використати `has` → O(n + m)"],
      ["O(n log m); sort `bannedIds` first", "O(n log m); спершу відсортувати `bannedIds`"],
      ["O(1); `filter` is native code", "O(1); `filter` написано нативним кодом"],
    ],
    "b",
    [
      "`includes` scans the whole array, so it's O(m) per user and O(n·m) overall. A Set gives O(1) average membership: O(m) to build it plus O(n) to filter.",
      "`includes` переглядає весь масив, тобто O(m) на кожного користувача й O(n·m) загалом. Set дає перевірку наявності в середньому за O(1): O(m) на побудову плюс O(n) на фільтрацію.",
    ],
    { code: "const allowed = users.filter((u) => !bannedIds.includes(u.id));", codeLanguage: "js" },
  ),
  quiz(
    "bigo-halving",
    ["big-o", ALGO],
    2,
    90,
    ["Halving loop", "Цикл з діленням навпіл"],
    ["What is the time complexity of this loop?", "Яка часова складність цього циклу?"],
    [
      ["O(1)", "O(1)"],
      ["O(log n)", "O(log n)"],
      ["O(n)", "O(n)"],
      ["O(√n)", "O(√n)"],
    ],
    "b",
    [
      "`n` halves every iteration, so the loop runs about log₂(n) times before reaching 0, the same reason binary search is O(log n).",
      "`n` зменшується вдвічі на кожній ітерації, тож цикл виконується приблизно log₂(n) разів, доки не дійде до 0. З тієї самої причини бінарний пошук має O(log n).",
    ],
    { code: "let steps = 0;\nwhile (n > 0) {\n  n = Math.floor(n / 2);\n  steps++;\n}", codeLanguage: "js" },
  ),
  quiz(
    "bigo-amortized-push",
    ["big-o", w("data-structures")],
    3,
    120,
    ["Amortised O(1)", "Амортизоване O(1)"],
    ["Why is `array.push` described as O(1) **amortised** rather than plain O(1)?", "Чому `array.push` описують як **амортизоване** O(1), а не просто O(1)?"],
    [
      ["Occasionally the backing storage is reallocated and copied (O(n)), but the average cost per push stays constant", "Інколи сховище перевиділяється й копіюється (O(n)), але середня вартість одного push залишається сталою"],
      ["Because `push` is implemented in C++", "Бо `push` реалізовано на C++"],
      ["Because it's O(log n) for large arrays", "Бо для великих масивів він має O(log n)"],
      ["Because JavaScript arrays are linked lists", "Бо масиви JavaScript є зв'язними списками"],
    ],
    "a",
    [
      "When capacity runs out, the engine allocates a bigger buffer (typically growing geometrically) and copies the elements. Those rare O(n) steps are spread over many cheap pushes, so n pushes cost O(n) in total.",
      "Коли місткість закінчується, рушій виділяє більший буфер (зазвичай зі зростанням у геометричній прогресії) і копіює елементи. Ці рідкісні кроки O(n) розподіляються між багатьма дешевими push, тож n push разом коштують O(n).",
    ],
  ),
  quiz(
    "bigo-space-recursion",
    ["big-o", w("recursion")],
    4,
    150,
    ["Space of recursion", "Пам'ять рекурсії"],
    ["What is the **space** complexity of this recursive sum over an array of length n (ignoring the input)?", "Яка складність **за пам'яттю** цієї рекурсивної суми масиву довжини n (не враховуючи вхідних даних)?"],
    [
      ["O(1)", "O(1)"],
      ["O(log n)", "O(log n)"],
      ["O(n) for the call stack only", "O(n) лише для стеку викликів"],
      ["O(n²): n stack frames and an O(n) `slice` copy per call", "O(n²): n кадрів стеку і копія `slice` за O(n) на кожен виклик"],
    ],
    "d",
    [
      "The recursion is n deep, and each live frame holds its own slice of size n−k, so the total memory is n + (n−1) + … = O(n²) (time is O(n²) too). Passing an index instead of slicing brings it to O(n) stack, or O(1) as a loop.",
      "Глибина рекурсії n, і кожен активний кадр тримає власний зріз розміру n−k, тож загалом пам'ять n + (n−1) + … = O(n²) (час теж O(n²)). Передача індексу замість зрізу дає O(n) стеку, а цикл дає O(1).",
    ],
    { code: "function sum(a) {\n  if (a.length === 0) return 0;\n  return a[0] + sum(a.slice(1));\n}", codeLanguage: "js" },
  ),
]);
