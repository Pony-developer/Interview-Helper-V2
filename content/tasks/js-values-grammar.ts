import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const MONEY_STARTER = String.raw`/** "12.34" → 1234. Throws a RangeError for invalid input. */
export function toCents(value: string): number {
  // TODO: floating-point maths loses cents
  return Math.floor(parseFloat(value) * 100);
}

/** 1234 → "12.34", -505 → "-5.05". */
export function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** Splits totalCents by ratios into integer cents that add up exactly to totalCents. */
export function allocate(totalCents: number, ratios: number[]): number[] {
  // TODO: rounding each share loses or invents cents
  const sum = ratios.reduce((a, b) => a + b, 0);
  return ratios.map((r) => Math.round((totalCents * r) / sum));
}
`;

const MONEY_SOLUTION = String.raw`const AMOUNT = /^(-)?(\d+)(?:\.(\d{1,2}))?$/;

export function toCents(value: string): number {
  // Parse the digits as text: never multiply a float by 100.
  const m = AMOUNT.exec(value.trim());
  if (!m) throw new RangeError("Invalid amount: " + value);
  const cents = Number(m[2]) * 100 + Number((m[3] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) throw new RangeError("Amount too large: " + value);
  return m[1] && cents !== 0 ? -cents : cents; // no -0
}

export function fromCents(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new RangeError("cents must be a safe integer");
  const abs = Math.abs(cents);
  return (cents < 0 ? "-" : "") + Math.floor(abs / 100) + "." + String(abs % 100).padStart(2, "0");
}

export function allocate(totalCents: number, ratios: number[]): number[] {
  const sum = ratios.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(totalCents) || ratios.length === 0 || ratios.some((r) => !(r >= 0)) || !(sum > 0)) {
    throw new RangeError("Invalid allocation");
  }
  const exact = ratios.map((r) => (totalCents * r) / sum);
  const parts = exact.map((x) => Math.floor(x));
  let remainder = totalCents - parts.reduce((a, b) => a + b, 0);
  // Largest-remainder method: hand out the leftover cents by biggest fractional part, earlier parts first on ties.
  const order = exact
    .map((x, i) => ({ i, fraction: x - Math.floor(x) }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  for (const { i } of order) {
    if (remainder <= 0) break;
    parts[i]++;
    remainder--;
  }
  return parts;
}
`;

const MONEY_INDEX = String.raw`import "./styles.css";
import { allocate, fromCents, toCents } from "./src/money";

let text: string;
try {
  const bill = toCents("100.00");
  text = allocate(bill, [1, 1, 1]).map(fromCents).join(" + ") + " = " + fromCents(bill);
} catch (e) {
  text = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Split the bill</h1><p><output id="split"></output></p>';
document.getElementById("split")!.textContent = text;
`;

const MONEY_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { allocate, fromCents, toCents } from "../src/money";

describe("toCents", () => {
  it("parses amounts exactly", () => {
    expect(toCents("12.34")).toBe(1234);
    expect(toCents("12")).toBe(1200);
    expect(toCents("12.3")).toBe(1230);
    expect(toCents(" 7.50 ")).toBe(750);
    expect(toCents("-5.05")).toBe(-505);
  });
  it("doesn't suffer from floating-point errors", () => {
    expect(toCents("19.99")).toBe(1999);
    expect(toCents("1.15")).toBe(115);
    expect(toCents("0.1") + toCents("0.2")).toBe(toCents("0.3"));
  });
  it("never returns -0", () => {
    expect(Object.is(toCents("-0.00"), 0)).toBe(true);
  });
  it("rejects invalid or too precise input", () => {
    for (const bad of ["1.005", "abc", "", "1,000", "1.", ".5", "--1"]) expect(() => toCents(bad)).toThrow(RangeError);
  });
  it("stays within safe integers", () => {
    expect(toCents("90071992547409.91")).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => toCents("90071992547409.92")).toThrow(RangeError);
  });
});

describe("fromCents", () => {
  it("formats cents with two decimals", () => {
    expect([1234, 5, -505, 0, 100000].map(fromCents)).toEqual(["12.34", "0.05", "-5.05", "0.00", "1000.00"]);
  });
});

describe("allocate", () => {
  it("splits without losing or inventing cents", () => {
    expect(allocate(10000, [1, 1, 1])).toEqual([3334, 3333, 3333]);
    expect(allocate(5, [3, 7])).toEqual([2, 3]);
    expect(allocate(100, [0, 1])).toEqual([0, 100]);
  });
  it("always adds up to the total", () => {
    const ratios = [[1, 2, 3], [0.1, 0.2, 0.7], [5, 5, 5, 5, 5, 5, 5], [1, 99]];
    for (const r of ratios) for (const total of [1, 99, 1000, 123457]) {
      expect(allocate(total, r).reduce((a, b) => a + b, 0)).toBe(total);
    }
  });
  it("rejects invalid ratios", () => {
    expect(() => allocate(100, [])).toThrow(RangeError);
    expect(() => allocate(100, [0, 0])).toThrow(RangeError);
    expect(() => allocate(100, [1, -1])).toThrow(RangeError);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("33.34 + 33.33 + 33.33 = 100.00")).id).toBe("split");
  });
});
`;

export default defineTasks([
  quiz(
    "vg-float-sum",
    ["js-values-grammar"],
    1,
    60,
    ["0.1 + 0.2", "0.1 + 0.2"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false true`", "`false true`"],
      ["`true true`", "`true true`"],
      ["`false false`", "`false false`"],
      ["`true false`", "`true false`"],
    ],
    "a",
    [
      "Numbers are binary IEEE 754 doubles, and 0.1 and 0.2 have no exact binary representation, so their sum is `0.30000000000000004`. Compare floats with a tolerance; `Number.EPSILON` (about 2.2 × 10⁻¹⁶) works for values around 1. For money, calculate in integer cents instead.",
      "Числа є двійковими подвійними числами IEEE 754, а 0.1 і 0.2 не мають точного двійкового представлення, тож їхня сума дорівнює `0.30000000000000004`. Порівнюйте дробові числа з допуском; `Number.EPSILON` (близько 2,2 × 10⁻¹⁶) підходить для значень близько 1. Гроші краще рахувати в цілих копійках.",
    ],
    { code: "const sum = 0.1 + 0.2;\nconsole.log(sum === 0.3, Math.abs(sum - 0.3) < Number.EPSILON);", codeLanguage: "js" },
  ),
  quiz(
    "vg-safe-integers",
    ["js-values-grammar"],
    2,
    90,
    ["Big integers", "Великі цілі числа"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true false 9007199254740993n`", "`true false 9007199254740993n`"],
      ["`false true 9007199254740993n`", "`false true 9007199254740993n`"],
      ["`true false 9007199254740992n`", "`true false 9007199254740992n`"],
      ["A `TypeError`", "`TypeError`"],
    ],
    "a",
    [
      "Doubles represent integers exactly only up to 2⁵³ − 1 (`Number.MAX_SAFE_INTEGER`); 2⁵³ + 1 rounds back to 2⁵³, so the comparison is `true`. `BigInt` (`n` suffix) has arbitrary precision. That's why 64-bit IDs from APIs should be strings or BigInts, never plain numbers.",
      "Подвійні числа точно представляють цілі лише до 2⁵³ − 1 (`Number.MAX_SAFE_INTEGER`); 2⁵³ + 1 округлюється назад до 2⁵³, тож порівняння дає `true`. `BigInt` (суфікс `n`) має довільну точність. Тому 64-бітні ID з API мають бути рядками чи BigInt, а не звичайними числами.",
    ],
    { code: "console.log(2 ** 53 === 2 ** 53 + 1, Number.isSafeInteger(2 ** 53), 2n ** 53n + 1n);", codeLanguage: "js" },
  ),
  quiz(
    "vg-asi-return",
    ["js-values-grammar"],
    2,
    60,
    ["A line break after `return`", "Перенос рядка після `return`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`undefined`", "`undefined`"],
      ["`{ debug: true }`", "`{ debug: true }`"],
      ["A `SyntaxError`", "`SyntaxError`"],
      ["`true`", "`true`"],
    ],
    "a",
    [
      "Automatic semicolon insertion puts a semicolon right after `return` when a line break follows it, so the function returns `undefined`. The next lines are then parsed as an unreachable block containing the label `debug:`. Keep the returned value (or its opening brace) on the same line as `return`.",
      "Автоматична вставка крапки з комою ставить її одразу після `return`, коли за ним іде перенос рядка, тож функція повертає `undefined`. Наступні рядки тоді розбираються як недосяжний блок із міткою `debug:`. Тримайте значення, що повертається (чи його відкривну дужку), на одному рядку з `return`.",
    ],
    { code: "function config() {\n  return\n  { debug: true };\n}\nconsole.log(config());", codeLanguage: "js" },
  ),
  quiz(
    "vg-wrapper-objects",
    ["js-values-grammar", w("type-coercion")],
    2,
    90,
    ["`new Boolean(false)`", "`new Boolean(false)`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`truthy object false`", "`truthy object false`"],
      ["`falsy string true`", "`falsy string true`"],
      ["`truthy string true`", "`truthy string true`"],
      ["`falsy object false`", "`falsy object false`"],
    ],
    "a",
    [
      "With `new`, `Boolean`, `String` and `Number` create wrapper **objects**, and every object is truthy, even one wrapping `false`. They're also a different type from the primitive, so `===` fails. Call these functions without `new` to convert values (`Boolean(x)`, `String(x)`), and let JavaScript box primitives automatically when you call methods.",
      "З `new` функції `Boolean`, `String` і `Number` створюють **об'єкти**-обгортки, а кожен об'єкт істинний, навіть той, що загортає `false`. Ще й тип відрізняється від примітиву, тож `===` не спрацьовує. Викликайте ці функції без `new` для перетворення значень (`Boolean(x)`, `String(x)`), а примітиви JavaScript загорне сам, коли ви викликаєте методи.",
    ],
    { code: 'console.log(new Boolean(false) ? "truthy" : "falsy", typeof new String("a"), "a" === new String("a"));', codeLanguage: "js" },
  ),
  quiz(
    "vg-arrow-object-literal",
    ["js-values-grammar", w("javascript")],
    3,
    60,
    ["Returning an object from an arrow", "Повернення об'єкта зі стрілочної функції"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`undefined { id: 1 }`", "`undefined { id: 1 }`"],
      ["`{ id: 1 } { id: 1 }`", "`{ id: 1 } { id: 1 }`"],
      ["`1 { id: 1 }`", "`1 { id: 1 }`"],
      ["A `SyntaxError`", "`SyntaxError`"],
    ],
    "a",
    [
      "After `=>`, a `{` starts a function body (a block), not an object literal. So `{ id: 1 }` is a block with a statement labelled `id:` and no `return`, giving `undefined`. Wrapping the literal in parentheses forces it to be parsed as an expression.",
      "Після `=>` символ `{` починає тіло функції (блок), а не літерал об'єкта. Тож `{ id: 1 }` є блоком з інструкцією з міткою `id:` і без `return`, що дає `undefined`. Дужки навколо літерала змушують розібрати його як вираз.",
    ],
    { code: "const a = () => { id: 1 };\nconst b = () => ({ id: 1 });\nconsole.log(a(), b());", codeLanguage: "js" },
  ),
  quiz(
    "vg-array-holes",
    ["js-values-grammar", w("arrays-strings")],
    3,
    120,
    ["Sparse arrays", "Розріджені масиви"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`11 -1 3 false true`", "`11 -1 3 false true`"],
      ["`11 1 11 true true`", "`11 1 11 true true`"],
      ["`4 -1 4 false false`", "`4 -1 4 false false`"],
      ["`11 1 3 false false`", "`11 1 3 false false`"],
    ],
    "a",
    [
      "Assigning index 10 makes `length` 11 and leaves holes. `indexOf`, `map` and `filter` skip holes (so `indexOf(undefined)` is -1 and only three values survive), and the `in` operator shows that index 1 doesn't exist. `includes`, however, treats holes as `undefined`. Holes behave inconsistently, so avoid creating them.",
      "Присвоєння індексу 10 робить `length` рівним 11 і лишає дірки. `indexOf`, `map` і `filter` пропускають дірки (тож `indexOf(undefined)` дає -1, а лишаються лише три значення), а оператор `in` показує, що індексу 1 не існує. Натомість `includes` вважає дірки `undefined`. Дірки поводяться непослідовно, тож краще їх не створювати.",
    ],
    { code: "const a = [1, , 3];\na[10] = 11;\nconsole.log(\n  a.length,\n  a.indexOf(undefined),\n  a.map((x) => x * 2).filter(() => true).length,\n  1 in a,\n  a.includes(undefined),\n);", codeLanguage: "js" },
  ),
  quiz(
    "vg-precedence",
    ["js-values-grammar"],
    3,
    90,
    ["Operator precedence", "Пріоритет операторів"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true false 33 123 0.5`", "`true false 33 123 0.5`"],
      ["`false false 33 33 0.5`", "`false false 33 33 0.5`"],
      ["`true true 123 123 -2`", "`true true 123 123 -2`"],
      ["`false false 6 123 0.5`", "`false false 6 123 0.5`"],
    ],
    "a",
    [
      "`&&` binds tighter than `||`, so the first is `true || (false && false)`. `+` is evaluated left to right: `1 + 2` is `3`, then `3 + \"3\"` concatenates to `\"33\"`, while `\"1\" + 2` is already a string, giving `\"123\"`. `2 ** -1` is 0.5. Add parentheses whenever precedence isn't obvious.",
      "`&&` зв'язує сильніше за `||`, тож перший вираз означає `true || (false && false)`. `+` обчислюється зліва направо: `1 + 2` дає `3`, потім `3 + \"3\"` з'єднується в `\"33\"`, а `\"1\" + 2` уже рядок, тож виходить `\"123\"`. `2 ** -1` дорівнює 0,5. Додавайте дужки щоразу, коли пріоритет неочевидний.",
    ],
    { code: 'console.log(true || false && false, (true || false) && false, 1 + 2 + "3", "1" + 2 + 3, 2 ** -1);', codeLanguage: "js" },
  ),
  quiz(
    "vg-rounding",
    ["js-values-grammar"],
    3,
    90,
    ["Rounding surprises", "Несподіванки округлення"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1.00 3 -2`", "`1.00 3 -2`"],
      ["`1.01 3 -3`", "`1.01 3 -3`"],
      ["`1.01 2 -2`", "`1.01 2 -2`"],
      ["`1.00 2 -3`", "`1.00 2 -3`"],
    ],
    "a",
    [
      "1.005 is stored as 1.00499999999999989…, so rounding to two decimals gives `1.00`. 2.5 is exact and `toFixed` rounds it up to `3`. `Math.round` rounds .5 towards +∞, so `-2.5` becomes `-2`. Display rounding belongs in `Intl.NumberFormat`; calculations that must be exact belong in integers.",
      "1.005 зберігається як 1.00499999999999989…, тож округлення до двох знаків дає `1.00`. 2.5 представлено точно, і `toFixed` округлює його вгору до `3`. `Math.round` округлює .5 у бік +∞, тож `-2.5` стає `-2`. Округлення для показу належить до `Intl.NumberFormat`; обчислення, що мають бути точними, роблять у цілих числах.",
    ],
    { code: "console.log((1.005).toFixed(2), (2.5).toFixed(0), Math.round(-2.5));", codeLanguage: "js" },
  ),
  quiz(
    "vg-negative-zero",
    ["js-values-grammar"],
    4,
    120,
    ["Negative zero", "Від'ємний нуль"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true false 0 0 -Infinity true`", "`true false 0 0 -Infinity true`"],
      ["`false false -0 -0 -Infinity false`", "`false false -0 -0 -Infinity false`"],
      ["`true true 0 0 Infinity true`", "`true true 0 0 Infinity true`"],
      ["`true false -0 0 -Infinity true`", "`true false -0 0 -Infinity true`"],
    ],
    "a",
    [
      "`-0` is a real value in IEEE 754. `===`, `includes` and string conversion all treat it as `0`, but `Object.is` distinguishes it, and dividing by it gives `-Infinity`. It appears from things like `-1 * 0` or `Math.round(-0.4)`; if the sign matters (direction of motion), check it with `Object.is(x, -0)`.",
      "`-0` є справжнім значенням в IEEE 754. `===`, `includes` і перетворення на рядок вважають його `0`, але `Object.is` його розрізняє, а ділення на нього дає `-Infinity`. Він виникає з виразів на кшталт `-1 * 0` чи `Math.round(-0.4)`; якщо знак важливий (напрямок руху), перевіряйте через `Object.is(x, -0)`.",
    ],
    { code: "const z = -0;\nconsole.log(z === 0, Object.is(z, 0), String(z), JSON.stringify(z), 1 / z, [-0].includes(0));", codeLanguage: "js" },
  ),
  quiz(
    "vg-nullish-mixing",
    ["js-values-grammar", w("type-coercion")],
    4,
    90,
    ["Mixing `??` with `||`", "Змішування `??` з `||`"],
    ["What happens with this line?", "Що станеться з цим рядком?"],
    [
      ["It's a `SyntaxError` at parse time: `??` can't be mixed with `||` or `&&` without parentheses", "`SyntaxError` під час розбору: `??` не можна змішувати з `||` чи `&&` без дужок"],
      ["It's evaluated as `config.port || (env.PORT ?? 3000)`", "Обчислюється як `config.port || (env.PORT ?? 3000)`"],
      ["It's evaluated as `(config.port || env.PORT) ?? 3000`", "Обчислюється як `(config.port || env.PORT) ?? 3000`"],
      ["It always returns `3000`", "Завжди повертає `3000`"],
    ],
    "a",
    [
      "The language deliberately has no precedence between `??` and `||`/`&&`, because the intent is ambiguous, so the combination doesn't parse at all and the whole file fails to load. Add parentheses to say what you mean, e.g. `(config.port || env.PORT) ?? 3000`.",
      "Мова навмисно не має пріоритету між `??` і `||`/`&&`, бо намір неоднозначний, тож таке поєднання взагалі не розбирається, і весь файл не завантажується. Додайте дужки, щоб показати намір, наприклад `(config.port || env.PORT) ?? 3000`.",
    ],
    { code: "const port = config.port || env.PORT ?? 3000;", codeLanguage: "js" },
  ),
  quiz(
    "vg-labels-comma",
    ["js-values-grammar"],
    5,
    150,
    ["Labels and the comma operator", "Мітки й оператор кома"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`3`, then `1 1` and `2 1`", "`3`, потім `1 1` і `2 1`"],
      ["`1`, then `1 1`, `2 1` and `3 1`", "`1`, потім `1 1`, `2 1` і `3 1`"],
      ["`3`, then `1 1`, `1 3`, `2 1` and `2 3`", "`3`, потім `1 1`, `1 3`, `2 1` і `2 3`"],
      ["A `SyntaxError`: labels aren't allowed on `for…of`", "`SyntaxError`: мітки не дозволені на `for…of`"],
    ],
    "a",
    [
      "The comma operator evaluates each operand and yields the last, so `x` is 3. `continue outer` skips the rest of the inner loop **and** moves to the next outer iteration, so for each `i` only `j = 1` is logged. When `i` is 3, `break outer` exits both loops before anything is logged.",
      "Оператор кома обчислює кожен операнд і дає останній, тож `x` дорівнює 3. `continue outer` пропускає решту внутрішнього циклу **й** переходить до наступної ітерації зовнішнього, тож для кожного `i` виводиться лише `j = 1`. Коли `i` дорівнює 3, `break outer` виходить з обох циклів, перш ніж щось буде виведено.",
    ],
    {
      code: "const x = (1, 2, 3);\nconsole.log(x);\nouter: for (const i of [1, 2, 3]) {\n  for (const j of [1, 2, 3]) {\n    if (i === 3) break outer;\n    if (j === 2) continue outer;\n    console.log(i, j);\n  }\n}",
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "vg-money",
    skills: ["js-values-grammar", w("arrays-strings"), w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Exact money arithmetic", "Точна арифметика грошей"],
    prompt: [
      "Floating-point numbers can't represent most decimal amounts exactly (`19.99 * 100` is `1998.9999999999998`). Implement exact money helpers in `src/money.ts`, working in **integer cents**:\n\n- **`toCents(value)`** parses strings like `\"12\"`, `\"12.3\"`, `\" 7.50 \"` and `\"-5.05\"` by reading the digits, never by multiplying a float. Require digits before an optional `.` and at most 2 decimals; throw a `RangeError` for anything else (`\"1.005\"`, `\".5\"`, `\"1,000\"`), and for results beyond `Number.MAX_SAFE_INTEGER`. Never return `-0`.\n- **`fromCents(cents)`** formats as `\"12.34\"`, `\"0.05\"`, `\"-5.05\"`.\n- **`allocate(totalCents, ratios)`** splits a total into integer parts that add up **exactly** to the total, using the largest-remainder method (leftover cents go to the parts with the biggest fractional share; ties to earlier parts). `allocate(10000, [1, 1, 1])` → `[3334, 3333, 3333]`. Throw a `RangeError` for empty, negative or all-zero ratios.",
      "Числа з рухомою комою не можуть точно представити більшість десяткових сум (`19.99 * 100` дає `1998.9999999999998`). Реалізуйте точні грошові помічники в `src/money.ts`, працюючи в **цілих копійках**:\n\n- **`toCents(value)`** розбирає рядки на кшталт `\"12\"`, `\"12.3\"`, `\" 7.50 \"` і `\"-5.05\"`, читаючи цифри, а не множачи дробове число. Вимагайте цифри перед необов'язковою `.` і щонайбільше 2 знаки після неї; для всього іншого (`\"1.005\"`, `\".5\"`, `\"1,000\"`) і для результатів понад `Number.MAX_SAFE_INTEGER` кидайте `RangeError`. Ніколи не повертайте `-0`.\n- **`fromCents(cents)`** форматує як `\"12.34\"`, `\"0.05\"`, `\"-5.05\"`.\n- **`allocate(totalCents, ratios)`** ділить суму на цілі частини, що в сумі дають **рівно** загальну суму, методом найбільших остач (залишкові копійки отримують частини з найбільшою дробовою часткою; за рівності раніші частини). `allocate(10000, [1, 1, 1])` → `[3334, 3333, 3333]`. Для порожніх, від'ємних чи нульових коефіцієнтів кидайте `RangeError`.",
    ],
    files: { "/src/money.ts": MONEY_STARTER, "/index.ts": MONEY_INDEX },
    visibleFiles: ["/src/money.ts", "/index.ts"],
    activeFile: "/src/money.ts",
    tests: MONEY_TESTS,
    solution: { "/src/money.ts": MONEY_SOLUTION },
    explanation: [
      "Treating the amount as text and combining whole units and cents with integer arithmetic avoids binary rounding entirely; checking `Number.isSafeInteger` keeps every result exact. Allocation can't round each share independently (three times 3333.33 rounds to 9999), so it floors every share and hands out the remaining cents by largest fractional part, which guarantees the parts sum to the total and stay as fair as possible.",
      "Обробка суми як тексту й поєднання цілих одиниць і копійок цілочисельною арифметикою повністю уникає двійкового округлення; перевірка `Number.isSafeInteger` тримає кожен результат точним. Розподіл не може округлювати кожну частку окремо (тричі 3333,33 округлюється до 9999), тож він округлює кожну частку вниз і роздає залишкові копійки за найбільшою дробовою часткою, що гарантує точну суму частин і максимальну справедливість.",
    ],
  }),
]);
