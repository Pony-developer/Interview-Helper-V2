import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const COINS_STARTER = String.raw`/** Fewest coins that add up to amount (unlimited coins of each value), or -1 if impossible. */
export function minCoins(coins: number[], amount: number): number {
  // TODO: greedy is fast but not always right
  let left = amount;
  let count = 0;
  for (const coin of [...coins].sort((a, b) => b - a)) {
    count += Math.floor(left / coin);
    left %= coin;
  }
  return left === 0 ? count : -1;
}

/** Number of combinations (order doesn't matter) that add up to amount. */
export function countWays(coins: number[], amount: number): number {
  // TODO
  return 0;
}
`;

const COINS_SOLUTION = String.raw`function check(amount: number) {
  if (!Number.isInteger(amount) || amount < 0) throw new RangeError("amount must be a non-negative integer");
}

export function minCoins(coins: number[], amount: number): number {
  check(amount);
  // dp[a] = fewest coins for amount a
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

export function countWays(coins: number[], amount: number): number {
  check(amount);
  // dp[a] = combinations for amount a. Coins in the outer loop, so each combination is counted once.
  const dp = new Array<number>(amount + 1).fill(0);
  dp[0] = 1;
  for (const coin of coins) {
    for (let a = coin; a <= amount; a++) dp[a] += dp[a - coin];
  }
  return dp[amount];
}
`;

const COINS_INDEX = String.raw`import "./styles.css";
import { countWays, minCoins } from "./src/coins";

const coins = [1, 3, 4];
document.getElementById("app")!.innerHTML =
  "<h1>Coin change</h1><p>Coins " + coins.join(", ") + ', amount 6: fewest coins <output id="min">' + minCoins(coins, 6) +
  '</output>, combinations <output id="ways">' + countWays(coins, 6) + "</output></p>";
`;

const COINS_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { countWays, minCoins } from "../src/coins";

describe("minCoins", () => {
  it("finds the optimum where greedy fails", () => {
    expect(minCoins([1, 3, 4], 6)).toBe(2);
    expect(minCoins([1, 5, 10, 25], 63)).toBe(6);
  });
  it("handles impossible amounts and zero", () => {
    expect(minCoins([2], 3)).toBe(-1);
    expect(minCoins([5, 10], 0)).toBe(0);
  });
  it("is fast enough for large amounts", () => {
    const start = Date.now();
    expect(minCoins([1, 5, 10, 25], 10000)).toBe(400);
    expect(minCoins([7, 11, 13], 9999)).toBe(771);
    expect(Date.now() - start < 1000).toBe(true);
  });
  it("rejects negative amounts", () => {
    expect(() => minCoins([1], -1)).toThrow();
  });
});

describe("countWays", () => {
  it("counts combinations, not orderings", () => {
    expect(countWays([1, 2, 5], 5)).toBe(4);
    expect(countWays([2, 5, 3, 6], 10)).toBe(5);
    expect(countWays([1, 5, 10, 25], 100)).toBe(242);
  });
  it("returns 1 way for amount 0 and 0 when impossible", () => {
    expect(countWays([7], 0)).toBe(1);
    expect(countWays([2], 3)).toBe(0);
  });
});
`;

const EDIT_STARTER = String.raw`/** Levenshtein distance: fewest single-character inserts, deletes or replacements to turn a into b. */
export function editDistance(a: string, b: string): number {
  // TODO: this only compares characters at the same positions
  let diff = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) diff++;
  return diff;
}

/** Dictionary words within maxDistance of word (case-insensitive), closest first, then alphabetical. */
export function suggest(word: string, dictionary: string[], maxDistance = 2): string[] {
  // TODO
  return [];
}
`;

const EDIT_SOLUTION = String.raw`export function editDistance(a: string, b: string): number {
  if (a.length < b.length) [a, b] = [b, a]; // keep the row as short as possible
  // prev[j] = distance between the first i-1 chars of a and the first j chars of b
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const replace = prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, replace); // delete, insert, replace/keep
    }
    prev = curr;
  }
  return prev[b.length];
}

export function suggest(word: string, dictionary: string[], maxDistance = 2): string[] {
  const target = word.toLowerCase();
  return dictionary
    .map((entry) => ({ entry, d: editDistance(target, entry.toLowerCase()) }))
    .filter((x) => x.d <= maxDistance)
    .sort((x, y) => x.d - y.d || x.entry.toLowerCase().localeCompare(y.entry.toLowerCase()))
    .map((x) => x.entry);
}
`;

const EDIT_INDEX = String.raw`import "./styles.css";
import { suggest } from "./src/edit";

const commands = ["build", "deploy", "lint", "start", "status", "test"];
const typed = "statsu";
const matches = suggest(typed, commands);
document.getElementById("app")!.innerHTML =
  "<h1>Did you mean?</h1><p>You typed <code>" + typed + '</code>. Did you mean <output id="hint">' + (matches[0] ?? "nothing") + "</output>?</p>";
`;

const EDIT_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { editDistance, suggest } from "../src/edit";

describe("editDistance", () => {
  it("computes classic examples", () => {
    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("flaw", "lawn")).toBe(2);
    expect(editDistance("intention", "execution")).toBe(5);
  });
  it("handles empty and identical strings", () => {
    expect(editDistance("", "abc")).toBe(3);
    expect(editDistance("abc", "")).toBe(3);
    expect(editDistance("same", "same")).toBe(0);
  });
  it("is symmetric", () => {
    expect(editDistance("sunday", "saturday")).toBe(editDistance("saturday", "sunday"));
  });
  it("handles shifted text", () => {
    expect(editDistance("ab".repeat(1000), "ba".repeat(1000))).toBe(2);
    expect(editDistance("a".repeat(2000), "a".repeat(1999) + "b")).toBe(1);
  });
});

describe("suggest", () => {
  it("returns close words, nearest first, then alphabetically, ignoring case", () => {
    expect(suggest("helo", ["world", "hero", "help", "Halo", "hello"])).toEqual(["Halo", "hello", "help", "hero"]);
  });
  it("respects maxDistance", () => {
    expect(suggest("cat", ["cart", "dog", "cast", "category"], 1)).toEqual(["cart", "cast"]);
    expect(suggest("zzz", ["apple", "pear"])).toEqual([]);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("status")).id).toBe("hint");
  });
});
`;

export default defineTasks([
  quiz(
    "dp-two-properties",
    ["dynamic-programming"],
    1,
    60,
    ["When DP applies", "Коли застосовне DP"],
    ["Which two properties suggest a problem can be solved with dynamic programming?", "Які дві властивості підказують, що задачу можна розв'язати динамічним програмуванням?"],
    [
      ["Optimal substructure and overlapping subproblems", "Оптимальна підструктура й підзадачі, що перекриваються"],
      ["A sorted input and a binary search", "Відсортований вхід і бінарний пошук"],
      ["Recursion and a global variable", "Рекурсія й глобальна змінна"],
      ["Independent subproblems and a greedy choice", "Незалежні підзадачі й жадібний вибір"],
    ],
    "a",
    [
      "Optimal substructure means the best answer is built from best answers to subproblems; overlapping subproblems means a naive recursion solves the same subproblem again and again. DP stores each answer once. Without overlap (e.g. merge sort), plain divide and conquer is enough.",
      "Оптимальна підструктура означає, що найкраща відповідь будується з найкращих відповідей для підзадач; перекриття означає, що наївна рекурсія знову й знову розв'язує ту саму підзадачу. DP зберігає кожну відповідь один раз. Без перекриття (наприклад, сортування злиттям) достатньо звичайного «розділяй і володарюй».",
    ],
  ),
  quiz(
    "dp-climb-stairs",
    ["dynamic-programming", w("recursion")],
    2,
    60,
    ["Climbing stairs", "Підйом сходами"],
    ["You can climb 1 or 2 steps at a time. In how many distinct ways can you climb 5 steps?", "За раз можна піднятися на 1 або 2 сходинки. Скількома різними способами можна піднятися на 5 сходинок?"],
    [
      ["8", "8"],
      ["5", "5"],
      ["10", "10"],
      ["16", "16"],
    ],
    "a",
    [
      "The last move onto step `n` was either a 1-step from `n - 1` or a 2-step from `n - 2`, so `ways(n) = ways(n - 1) + ways(n - 2)` with `ways(0) = ways(1) = 1`. That gives 1, 1, 2, 3, 5, 8: the Fibonacci sequence, which a DP table computes in O(n).",
      "Останній крок на сходинку `n` був або кроком на 1 з `n - 1`, або на 2 з `n - 2`, тож `ways(n) = ways(n - 1) + ways(n - 2)`, де `ways(0) = ways(1) = 1`. Виходить 1, 1, 2, 3, 5, 8: послідовність Фібоначчі, яку таблиця DP обчислює за O(n).",
    ],
    {
      code: "const memo = new Map();\nfunction ways(n) {\n  if (n <= 1) return 1;\n  if (memo.has(n)) return memo.get(n);\n  const r = ways(n - 1) + ways(n - 2);\n  memo.set(n, r);\n  return r;\n}\nconsole.log(ways(5));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "dp-top-down-bottom-up",
    ["dynamic-programming"],
    2,
    90,
    ["Memoisation vs tabulation", "Мемоізація проти табуляції"],
    ["Which is a real advantage of a bottom-up table over top-down memoised recursion?", "Яка реальна перевага таблиці знизу вгору над мемоізованою рекурсією згори вниз?"],
    [
      ["No recursion, so no stack overflow on large inputs, and it's often easy to reduce memory", "Немає рекурсії, тож немає переповнення стеку на великих входах, і пам'ять часто легко зменшити"],
      ["It always computes fewer states", "Вона завжди обчислює менше станів"],
      ["It gives different (more accurate) answers", "Вона дає інші (точніші) відповіді"],
      ["It doesn't need base cases", "Їй не потрібні базові випадки"],
    ],
    "a",
    [
      "Both compute the same states and answers. Bottom-up iterates in dependency order, so there's no call stack to overflow (deep recursion fails around ~10,000 frames in browsers) and you can often keep only the previous row. Top-down's advantage is the reverse: it computes only the states actually needed, which helps when most of the table is irrelevant.",
      "Обидва підходи обчислюють ті самі стани й відповіді. Підхід знизу вгору йде в порядку залежностей, тож немає стеку викликів, що може переповнитися (глибока рекурсія ламається десь на ~10 000 кадрах у браузерах), і часто можна тримати лише попередній рядок. Перевага згори вниз протилежна: обчислюються лише справді потрібні стани, що допомагає, коли більша частина таблиці не потрібна.",
    ],
  ),
  quiz(
    "dp-greedy-coins",
    ["dynamic-programming", w("algorithms")],
    3,
    90,
    ["When greedy fails", "Коли жадібний алгоритм помиляється"],
    ["What does `greedy([1, 3, 4], 6)` return, and what's the optimum?", "Що повертає `greedy([1, 3, 4], 6)` і який оптимум?"],
    [
      ["Greedy returns 3 (4 + 1 + 1); the optimum is 2 (3 + 3)", "Жадібний повертає 3 (4 + 1 + 1); оптимум 2 (3 + 3)"],
      ["Greedy returns 2, which is optimal", "Жадібний повертає 2, і це оптимум"],
      ["Greedy returns 6 (all 1s); the optimum is 2", "Жадібний повертає 6 (усі одиниці); оптимум 2"],
      ["Greedy returns -1 because 6 isn't divisible by 4", "Жадібний повертає -1, бо 6 не ділиться на 4"],
    ],
    "a",
    [
      "Taking the largest coin first (4) leaves 2, which needs two 1s: 3 coins. Two 3s make 6 with 2 coins. Greedy happens to be optimal for some coin systems (like US or euro coins) but not in general; DP over amounts (`dp[a] = min(dp[a - c] + 1)`) is always correct.",
      "Якщо спершу взяти найбільшу монету (4), лишається 2, а це дві одиниці: 3 монети. Дві трійки дають 6 двома монетами. Жадібний підхід випадково оптимальний для деяких систем монет (як-от монети США чи євро), але не загалом; DP за сумами (`dp[a] = min(dp[a - c] + 1)`) завжди правильне.",
    ],
    {
      code: "function greedy(coins, amount) {\n  let count = 0;\n  for (const c of [...coins].sort((a, b) => b - a)) {\n    count += Math.floor(amount / c);\n    amount %= c;\n  }\n  return amount === 0 ? count : -1;\n}\nconsole.log(greedy([1, 3, 4], 6));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "dp-grid-paths",
    ["dynamic-programming"],
    3,
    90,
    ["Paths through a grid", "Шляхи через сітку"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`6`", "`6`"],
      ["`9`", "`9`"],
      ["`4`", "`4`"],
      ["`3`", "`3`"],
    ],
    "a",
    [
      "Each cell can be entered from the left or from above, so its count is the sum of those two; the first row and column have exactly one path. For a 3 × 3 grid that's the binomial coefficient C(4, 2) = 6: choose which 2 of the 4 moves go down.",
      "У кожну клітинку можна потрапити зліва або згори, тож її значення є сумою цих двох; перший рядок і стовпець мають рівно один шлях. Для сітки 3 × 3 це біноміальний коефіцієнт C(4, 2) = 6: оберіть, які 2 з 4 кроків ідуть вниз.",
    ],
    {
      code: "function gridPaths(rows, cols) {\n  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1));\n  for (let r = 1; r < rows; r++) {\n    for (let c = 1; c < cols; c++) dp[r][c] = dp[r - 1][c] + dp[r][c - 1];\n  }\n  return dp[rows - 1][cols - 1];\n}\nconsole.log(gridPaths(3, 3));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "dp-space-optimisation",
    ["dynamic-programming", w("big-o")],
    3,
    90,
    ["Saving memory", "Економія пам'яті"],
    ["In the grid-paths DP, each row depends only on the row above it. How much memory does the optimised version need for an R × C grid?", "У DP для шляхів у сітці кожен рядок залежить лише від рядка над ним. Скільки пам'яті потрібно оптимізованій версії для сітки R × C?"],
    [
      ["O(C): keep a single row and update it in place", "O(C): тримати один рядок і оновлювати його на місці"],
      ["O(R × C): every cell must be stored", "O(R × C): треба зберігати кожну клітинку"],
      ["O(1): only the answer is stored", "O(1): зберігається лише відповідь"],
      ["O(R + C) for the recursion stack", "O(R + C) на стек рекурсії"],
    ],
    "a",
    [
      "When state `i` depends only on state `i - 1`, older rows can be discarded. Here one array works: `row[c] += row[c - 1]` adds the value from the left (already updated for this row) to the value from above (still the old one). The same trick takes edit distance and knapsack from O(n·m) to O(m) memory.",
      "Коли стан `i` залежить лише від стану `i - 1`, старіші рядки можна викинути. Тут достатньо одного масиву: `row[c] += row[c - 1]` додає значення зліва (уже оновлене для цього рядка) до значення згори (ще старе). Той самий прийом зменшує пам'ять для відстані редагування й рюкзака з O(n·m) до O(m).",
    ],
  ),
  quiz(
    "dp-memo-key-bug",
    ["dynamic-programming", w("closures-scope")],
    4,
    120,
    ["A broken memo", "Зламаний memo"],
    ["This should count grid paths (`paths(2, 2)` is 6, `paths(2, 3)` is 10). What does it print?", "Це має рахувати шляхи в сітці (`paths(2, 2)` дорівнює 6, `paths(2, 3)` дорівнює 10). Що воно виведе?"],
    [
      ["`7 7`: the memo key ignores `c`, so different subproblems share answers", "`7 7`: ключ memo ігнорує `c`, тож різні підзадачі ділять відповіді"],
      ["`6 10`", "`6 10`"],
      ["`6 6`", "`6 6`"],
      ["It overflows the stack", "Переповнює стек"],
    ],
    "a",
    [
      "Memoisation is only correct if the key identifies the subproblem completely. Keying by `r` alone means `paths(1, 1)` reuses the cached `paths(1, 2)`, and every later call with the same `r` returns a stale value. Use a key with every argument, e.g. `memo.get(r + \",\" + c)`, or a 2D table.",
      "Мемоізація коректна, лише якщо ключ повністю визначає підзадачу. Ключ лише за `r` означає, що `paths(1, 1)` бере закешоване `paths(1, 2)`, а кожен наступний виклик із тим самим `r` повертає застаріле значення. Використовуйте ключ з усіма аргументами, наприклад `memo.get(r + \",\" + c)`, або двовимірну таблицю.",
    ],
    {
      code: "const memo = {};\nfunction paths(r, c) {\n  if (r === 0 || c === 0) return 1;\n  if (memo[r]) return memo[r];\n  return (memo[r] = paths(r - 1, c) + paths(r, c - 1));\n}\nconsole.log(paths(2, 2), paths(2, 3));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "dp-knapsack",
    ["dynamic-programming"],
    4,
    150,
    ["0/1 knapsack", "Рюкзак 0/1"],
    [
      "A bag holds weight 5. Items (weight, value): A (1, 1), B (3, 4), C (4, 5), D (2, 2). Each item can be taken once. What's the best total value?",
      "Рюкзак витримує вагу 5. Предмети (вага, цінність): A (1, 1), B (3, 4), C (4, 5), D (2, 2). Кожен предмет можна взяти один раз. Яка найбільша сумарна цінність?",
    ],
    [
      ["6", "6"],
      ["5", "5"],
      ["7", "7"],
      ["9", "9"],
    ],
    "a",
    [
      "B + D (weight 5) and A + C (weight 5) both give 6, and nothing heavier fits. Greedy by value per weight takes B (1.33), then can't fit C, then takes A: value 5. The DP `dp[w] = max(dp[w], dp[w - weight] + value)`, looping capacities downwards for each item, explores every combination in O(items × capacity).",
      "B + D (вага 5) і A + C (вага 5) обидва дають 6, а важче нічого не влазить. Жадібний підхід за цінністю на одиницю ваги бере B (1,33), потім не вміщує C, потім бере A: цінність 5. DP `dp[w] = max(dp[w], dp[w - weight] + value)` з перебором місткостей згори вниз для кожного предмета перевіряє всі комбінації за O(предмети × місткість).",
    ],
  ),
  quiz(
    "dp-coin-loop-order",
    ["dynamic-programming"],
    4,
    150,
    ["Combinations vs permutations", "Комбінації проти перестановок"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`3 5`", "`3 5`"],
      ["`3 3`", "`3 3`"],
      ["`5 5`", "`5 5`"],
      ["`5 3`", "`5 3`"],
    ],
    "a",
    [
      "With coins in the outer loop, each coin is \"introduced\" once, so a multiset like {1, 1, 2} is counted once: {1,1,1,1}, {1,1,2}, {2,2} = 3 combinations. With amounts in the outer loop, every order counts separately (1+1+2, 1+2+1, 2+1+1, …), giving 5 sequences. Pick the loop order that matches whether order matters.",
      "Коли монети в зовнішньому циклі, кожна монета «вводиться» один раз, тож мультимножина на кшталт {1, 1, 2} рахується один раз: {1,1,1,1}, {1,1,2}, {2,2} = 3 комбінації. Коли суми в зовнішньому циклі, кожен порядок рахується окремо (1+1+2, 1+2+1, 2+1+1, …), і виходить 5 послідовностей. Обирайте порядок циклів залежно від того, чи важливий порядок.",
    ],
    {
      code: "function countA(coins, amount) {\n  const dp = new Array(amount + 1).fill(0);\n  dp[0] = 1;\n  for (const c of coins) for (let a = c; a <= amount; a++) dp[a] += dp[a - c];\n  return dp[amount];\n}\nfunction countB(coins, amount) {\n  const dp = new Array(amount + 1).fill(0);\n  dp[0] = 1;\n  for (let a = 1; a <= amount; a++) for (const c of coins) if (a >= c) dp[a] += dp[a - c];\n  return dp[amount];\n}\nconsole.log(countA([1, 2], 4), countB([1, 2], 4));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "dp-edit-distance",
    ["dynamic-programming", w("arrays-strings")],
    5,
    150,
    ["Edit distance", "Відстань редагування"],
    ["What are the Levenshtein distances for `kitten → sitting` and `flaw → lawn`?", "Яка відстань Левенштейна для `kitten → sitting` і `flaw → lawn`?"],
    [
      ["3 and 2", "3 і 2"],
      ["2 and 2", "2 і 2"],
      ["3 and 4", "3 і 4"],
      ["4 and 3", "4 і 3"],
    ],
    "a",
    [
      "kitten → sitten (replace k) → sittin (replace e) → sitting (insert g): 3. flaw → law (delete f) → lawn (insert n): 2; comparing position by position would wrongly give 4. The DP `dp[i][j] = min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i] ≠ b[j]))` finds this in O(n·m).",
      "kitten → sitten (заміна k) → sittin (заміна e) → sitting (вставка g): 3. flaw → law (видалення f) → lawn (вставка n): 2; посимвольне порівняння за позиціями хибно дало б 4. DP `dp[i][j] = min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i] ≠ b[j]))` знаходить це за O(n·m).",
    ],
  ),
  practice({
    slug: "dp-coin-change",
    skills: ["dynamic-programming", w("algorithms")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Coin change, two ways", "Розмін монет двома способами"],
    prompt: [
      "Implement two classic DP functions in `src/coins.ts` (unlimited coins of each value):\n\n- **`minCoins(coins, amount)`**: the fewest coins that add up to `amount`, or `-1` if it's impossible. `0` for amount `0`. The current greedy version fails for coins like `[1, 3, 4]`.\n- **`countWays(coins, amount)`**: the number of **combinations** (order doesn't matter) that add up to `amount`; amount `0` has exactly one way (no coins).\n- Both throw a `RangeError` for negative or non-integer amounts, and must handle amounts like `10000` quickly (no exponential recursion).",
      "Реалізуйте дві класичні DP-функції в `src/coins.ts` (монет кожного номіналу необмежено):\n\n- **`minCoins(coins, amount)`**: найменша кількість монет із сумою `amount` або `-1`, якщо це неможливо. Для суми `0` результат `0`. Поточна жадібна версія помиляється для монет на кшталт `[1, 3, 4]`.\n- **`countWays(coins, amount)`**: кількість **комбінацій** (порядок не важливий) із сумою `amount`; для суми `0` є рівно один спосіб (без монет).\n- Обидві кидають `RangeError` для від'ємних чи нецілих сум і мають швидко обробляти суми на кшталт `10000` (без експоненційної рекурсії).",
    ],
    files: { "/src/coins.ts": COINS_STARTER, "/index.ts": COINS_INDEX },
    visibleFiles: ["/src/coins.ts", "/index.ts"],
    activeFile: "/src/coins.ts",
    tests: COINS_TESTS,
    solution: { "/src/coins.ts": COINS_SOLUTION },
    explanation: [
      "`minCoins` fills `dp[a]` for every amount up to the target, trying each coin as the last one: O(amount × coins) time, O(amount) memory. `countWays` loops over coins on the outside so each combination is built in one canonical order and counted once. Both tables start from the base case `dp[0]` and only read smaller amounts, so a simple forward loop computes them in dependency order.",
      "`minCoins` заповнює `dp[a]` для кожної суми до цільової, пробуючи кожну монету як останню: час O(сума × монети), пам'ять O(сума). `countWays` перебирає монети в зовнішньому циклі, тож кожна комбінація будується в одному канонічному порядку й рахується один раз. Обидві таблиці починаються з базового випадку `dp[0]` і читають лише менші суми, тож простий цикл уперед обчислює їх у порядку залежностей.",
    ],
  }),
  practice({
    slug: "dp-edit-distance-suggest",
    skills: ["dynamic-programming", w("arrays-strings")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["\"Did you mean?\" with edit distance", "«Можливо, ви мали на увазі?» через відстань редагування"],
    prompt: [
      "Build a typo-tolerant command suggester in `src/edit.ts`:\n\n- **`editDistance(a, b)`**: the Levenshtein distance, the fewest single-character insertions, deletions or replacements that turn `a` into `b`. Use dynamic programming; it must handle 2,000-character strings quickly. Bonus: keep only two rows of the table.\n- **`suggest(word, dictionary, maxDistance = 2)`**: the dictionary entries within `maxDistance` of `word`, comparing case-insensitively, sorted by distance and then alphabetically (case-insensitive), returned in their original spelling.",
      "Створіть підказувач команд, стійкий до описок, у `src/edit.ts`:\n\n- **`editDistance(a, b)`**: відстань Левенштейна, тобто найменша кількість вставок, видалень чи замін одного символу, щоб перетворити `a` на `b`. Використайте динамічне програмування; функція має швидко обробляти рядки по 2000 символів. Бонус: тримайте лише два рядки таблиці.\n- **`suggest(word, dictionary, maxDistance = 2)`**: записи словника на відстані не більше `maxDistance` від `word` без урахування регістру, відсортовані за відстанню, а потім за алфавітом (без урахування регістру), у початковому написанні.",
    ],
    files: { "/src/edit.ts": EDIT_STARTER, "/index.ts": EDIT_INDEX },
    visibleFiles: ["/src/edit.ts", "/index.ts"],
    activeFile: "/src/edit.ts",
    tests: EDIT_TESTS,
    solution: { "/src/edit.ts": EDIT_SOLUTION },
    explanation: [
      "`dp[i][j]` is the distance between the first `i` characters of `a` and the first `j` of `b`; each cell is the cheapest of deleting, inserting, or replacing (free when the characters match). Row `i` only reads row `i - 1`, so two arrays suffice, and swapping the strings keeps the row length at the shorter one: O(n·m) time, O(min(n, m)) memory. Comparing positions directly fails on any insertion, because everything after it shifts.",
      "`dp[i][j]` є відстанню між першими `i` символами `a` і першими `j` символами `b`; кожна клітинка є найдешевшим із видалення, вставки чи заміни (безкоштовної, коли символи збігаються). Рядок `i` читає лише рядок `i - 1`, тож достатньо двох масивів, а обмін рядків місцями тримає довжину рядка таблиці за коротшим: час O(n·m), пам'ять O(min(n, m)). Порівняння за позиціями ламається на будь-якій вставці, бо все після неї зсувається.",
    ],
  }),
]);
