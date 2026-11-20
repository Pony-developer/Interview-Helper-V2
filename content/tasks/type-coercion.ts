import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const PARSE_STARTER = String.raw`/**
 * Strict number parsing for values from forms, query strings and JSON.
 * Returns null when the input isn't a plain finite decimal number.
 */
export function parseNumber(input: unknown): number | null {
  // TODO
  return Number(input);
}

/**
 * Parses "true"/"false"-style flags. Returns null when the value isn't recognised.
 */
export function parseBoolean(input: unknown): boolean | null {
  // TODO
  return Boolean(input);
}
`;

const PARSE_SOLUTION = String.raw`const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;

export function parseNumber(input: unknown): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input !== "string") return null; // no null → 0, true → 1, [5] → 5 surprises
  const text = input.trim();
  // Number("") is 0 and Number("0x1F") is 31, so validate the format before converting.
  if (!DECIMAL.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

const TRUE = new Set(["true", "1", "yes", "on"]);
const FALSE = new Set(["false", "0", "no", "off", ""]);

export function parseBoolean(input: unknown): boolean | null {
  if (typeof input === "boolean") return input;
  if (typeof input === "number") return input === 1 ? true : input === 0 ? false : null;
  if (typeof input !== "string") return null;
  const text = input.trim().toLowerCase();
  if (TRUE.has(text)) return true;
  if (FALSE.has(text)) return false;
  return null;
}
`;

const PARSE_INDEX = String.raw`import "./styles.css";
import { parseBoolean, parseNumber } from "./src/parse";

const params = new URLSearchParams("?page=2&limit=&debug=false&price=12px");
const rows = [
  ["page", parseNumber(params.get("page"))],
  ["limit", parseNumber(params.get("limit"))],
  ["price", parseNumber(params.get("price"))],
  ["debug", parseBoolean(params.get("debug"))],
];
document.getElementById("app")!.innerHTML =
  "<h1>Query params</h1><ul>" + rows.map(([k, v]) => "<li>" + k + ": " + JSON.stringify(v) + "</li>").join("") + "</ul>";
`;

const PARSE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { parseBoolean, parseNumber } from "../src/parse";

describe("parseNumber", () => {
  it("accepts finite numbers and decimal strings", () => {
    expect(parseNumber(42)).toBe(42);
    expect(parseNumber("42")).toBe(42);
    expect(parseNumber(" -3.5 ")).toBe(-3.5);
    expect(parseNumber(".5")).toBe(0.5);
    expect(parseNumber("1e3")).toBe(1000);
    expect(parseNumber("0")).toBe(0);
  });
  it("rejects empty and partly numeric strings", () => {
    expect(parseNumber("")).toBe(null);
    expect(parseNumber("   ")).toBe(null);
    expect(parseNumber("12px")).toBe(null);
    expect(parseNumber("1,000")).toBe(null);
    expect(parseNumber("abc")).toBe(null);
  });
  it("rejects hex, Infinity and NaN", () => {
    expect(parseNumber("0x1F")).toBe(null);
    expect(parseNumber("Infinity")).toBe(null);
    expect(parseNumber(Infinity)).toBe(null);
    expect(parseNumber(NaN)).toBe(null);
  });
  it("doesn't coerce non-string values", () => {
    expect(parseNumber(null)).toBe(null);
    expect(parseNumber(undefined)).toBe(null);
    expect(parseNumber(true)).toBe(null);
    expect(parseNumber([5])).toBe(null);
    expect(parseNumber({ valueOf: () => 7 })).toBe(null);
  });
});

describe("parseBoolean", () => {
  it("recognises common true values in any case", () => {
    for (const v of [true, "true", "TRUE", " yes ", "1", "on", 1]) expect(parseBoolean(v)).toBe(true);
  });
  it("recognises common false values, including the empty string", () => {
    for (const v of [false, "false", "False", "no", "0", "off", "", 0]) expect(parseBoolean(v)).toBe(false);
  });
  it("returns null for anything else instead of guessing", () => {
    for (const v of ["maybe", "2", 2, null, undefined, [], {}]) expect(parseBoolean(v)).toBe(null);
  });
});
`;

const EQ_STARTER = String.raw`export type Hint = "default" | "number" | "string";

/** Converts an object to a primitive the way the language does (ToPrimitive). */
export function toPrimitive(value: object, hint: Hint = "default"): unknown {
  // TODO
  return String(value);
}

/** Behaves exactly like a == b, without using == or !=. */
export function looseEquals(a: unknown, b: unknown): boolean {
  // TODO
  return a === b;
}
`;

const EQ_SOLUTION = String.raw`export type Hint = "default" | "number" | "string";

const isObject = (v: unknown): v is object => (typeof v === "object" && v !== null) || typeof v === "function";

export function toPrimitive(value: object, hint: Hint = "default"): unknown {
  const exotic = (value as Record<symbol, unknown>)[Symbol.toPrimitive];
  if (exotic !== undefined && exotic !== null) {
    if (typeof exotic !== "function") throw new TypeError("Symbol.toPrimitive is not a function");
    const result = exotic.call(value, hint);
    if (isObject(result)) throw new TypeError("Cannot convert object to primitive value");
    return result;
  }
  const order = hint === "string" ? ["toString", "valueOf"] : ["valueOf", "toString"];
  for (const name of order) {
    const method = (value as Record<string, unknown>)[name];
    if (typeof method === "function") {
      const result = method.call(value);
      if (!isObject(result)) return result;
    }
  }
  throw new TypeError("Cannot convert object to primitive value");
}

/** null gets its own type here (typeof says "object"), functions count as objects. */
const typeOf = (v: unknown) => (v === null ? "null" : typeof v === "function" ? "object" : typeof v);

export function looseEquals(a: unknown, b: unknown): boolean {
  const ta = typeOf(a);
  const tb = typeOf(b);
  if (ta === tb) return a === b;
  const nullish = (t: string) => t === "null" || t === "undefined";
  if (nullish(ta) || nullish(tb)) return nullish(ta) && nullish(tb);
  if (ta === "number" && tb === "string") return a === Number(b);
  if (ta === "string" && tb === "number") return Number(a) === b;
  if (ta === "boolean") return looseEquals(Number(a), b);
  if (tb === "boolean") return looseEquals(a, Number(b));
  if (ta === "object" && (tb === "string" || tb === "number")) return looseEquals(toPrimitive(a as object), b);
  if (tb === "object" && (ta === "string" || ta === "number")) return looseEquals(a, toPrimitive(b as object));
  return false;
}
`;

const EQ_INDEX = String.raw`import "./styles.css";
import { looseEquals } from "./src/equals";

const pairs: [string, unknown, unknown][] = [
  ['[] == false', [], false],
  ['"0" == false', "0", false],
  ["null == 0", null, 0],
  ["null == undefined", null, undefined],
  ['[1, 2] == "1,2"', [1, 2], "1,2"],
];
document.getElementById("app")!.innerHTML =
  "<h1>Loose equality</h1><ul>" + pairs.map(([label, a, b]) => "<li><code>" + label + "</code> → " + looseEquals(a, b) + "</li>").join("") + "</ul>";
`;

const EQ_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { looseEquals, toPrimitive } from "../src/equals";

describe("toPrimitive", () => {
  const both = { valueOf: () => 1, toString: () => "s" };
  it("tries valueOf first, except for the string hint", () => {
    expect(toPrimitive(both)).toBe(1);
    expect(toPrimitive(both, "number")).toBe(1);
    expect(toPrimitive(both, "string")).toBe("s");
  });
  it("falls back to toString when valueOf returns an object", () => {
    expect(toPrimitive({})).toBe("[object Object]");
    expect(toPrimitive([1, 2])).toBe("1,2");
  });
  it("uses Symbol.toPrimitive with the hint", () => {
    const obj = { [Symbol.toPrimitive]: (hint) => "hint:" + hint };
    expect(toPrimitive(obj, "number")).toBe("hint:number");
    expect(toPrimitive(obj)).toBe("hint:default");
  });
  it("throws a TypeError when no primitive comes back", () => {
    expect(() => toPrimitive(Object.create(null))).toThrow(TypeError);
    expect(() => toPrimitive({ valueOf: () => ({}), toString: () => ({}) })).toThrow(TypeError);
    expect(() => toPrimitive({ [Symbol.toPrimitive]: () => ({}) })).toThrow(TypeError);
  });
});

describe("looseEquals", () => {
  it("treats null and undefined as equal only to each other", () => {
    expect(looseEquals(null, undefined)).toBe(true);
    expect(looseEquals(null, 0)).toBe(false);
    expect(looseEquals(undefined, "")).toBe(false);
    expect(looseEquals(null, false)).toBe(false);
  });
  it("compares strings and numbers as numbers, and converts booleans first", () => {
    expect(looseEquals("1", 1)).toBe(true);
    expect(looseEquals(" 1 ", 1)).toBe(true);
    expect(looseEquals("", 0)).toBe(true);
    expect(looseEquals("1", true)).toBe(true);
    expect(looseEquals("2", true)).toBe(false);
    expect(looseEquals(NaN, NaN)).toBe(false);
  });
  it("turns objects into primitives before comparing", () => {
    expect(looseEquals([], false)).toBe(true);
    expect(looseEquals([1, 2], "1,2")).toBe(true);
    expect(looseEquals({ valueOf: () => 7 }, 7)).toBe(true);
    expect(looseEquals([], [])).toBe(false);
  });

  const values = [0, -0, 1, NaN, "", "0", "1", " 1 ", "abc", true, false, null, undefined, [], [0], [1], [1, 2], {}, { valueOf: () => 1 }, { toString: () => "0" }, { [Symbol.toPrimitive]: () => "" }];
  const labels = ["0", "-0", "1", "NaN", '""', '"0"', '"1"', '" 1 "', '"abc"', "true", "false", "null", "undefined", "[]", "[0]", "[1]", "[1,2]", "{}", "{valueOf:1}", '{toString:"0"}', '{toPrimitive:""}'];
  it("matches == for every pair of sample values", () => {
    const wrong = [];
    values.forEach((a, i) =>
      values.forEach((b, j) => {
        if (looseEquals(a, b) !== (a == b)) wrong.push(labels[i] + " == " + labels[j]);
      }),
    );
    expect(wrong).toEqual([]);
  });
});
`;

export default defineTasks([
  quiz(
    "coerce-plus-minus",
    ["type-coercion"],
    1,
    60,
    ["Plus vs minus", "Плюс проти мінуса"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`53 2 10 2`", "`53 2 10 2`"],
      ["`8 2 10 2`", "`8 2 10 2`"],
      ["`53 NaN NaN true1`", "`53 NaN NaN true1`"],
      ["`53 2 \"52\" 2`", "`53 2 \"52\" 2`"],
    ],
    "a",
    [
      "Binary `+` concatenates as soon as either operand is a string, so `\"5\" + 3` is `\"53\"`. Every other arithmetic operator converts both sides to numbers: `\"5\" - 3` is `2` and `\"5\" * \"2\"` is `10`. With no strings involved, `+` adds numbers, and `true` becomes `1`.",
      "Бінарний `+` виконує конкатенацію, щойно хоч один операнд є рядком, тож `\"5\" + 3` дає `\"53\"`. Усі інші арифметичні оператори перетворюють обидва боки на числа: `\"5\" - 3` дає `2`, а `\"5\" * \"2\"` дає `10`. Якщо рядків немає, `+` додає числа, і `true` стає `1`.",
    ],
    { code: 'console.log("5" + 3, "5" - 3, "5" * "2", true + 1);', codeLanguage: "js" },
  ),
  quiz(
    "coerce-or-vs-nullish",
    ["type-coercion", w("javascript")],
    1,
    60,
    ["`||` vs `??`", "`||` проти `??`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`50 0 Untitled` followed by an empty string", "`50 0 Untitled` і порожній рядок"],
      ["`0 0  ` (the original values)", "`0 0  ` (початкові значення)"],
      ["`50 50 Untitled Untitled`", "`50 50 Untitled Untitled`"],
      ["`0 50  Untitled`", "`0 50  Untitled`"],
    ],
    "a",
    [
      "`||` falls back for any falsy value, so the legitimate `0` and `\"\"` are replaced. `??` falls back only for `null` and `undefined`, so it keeps `0` and `\"\"`. Use `??` for defaults whenever `0`, `\"\"` or `false` are valid values.",
      "`||` підставляє запасне значення для будь-якого хибного значення, тож цілком законні `0` і `\"\"` замінюються. `??` підставляє його лише для `null` і `undefined`, тож зберігає `0` і `\"\"`. Використовуйте `??` для значень за замовчуванням, коли `0`, `\"\"` чи `false` є допустимими.",
    ],
    {
      code: 'const settings = { volume: 0, title: "" };\nconsole.log(\n  settings.volume || 50,\n  settings.volume ?? 50,\n  settings.title || "Untitled",\n  settings.title ?? "Untitled",\n);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "coerce-number-vs-parseint",
    ["type-coercion"],
    2,
    90,
    ["`Number` vs `parseInt`", "`Number` проти `parseInt`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`0 12 NaN 12 0 NaN`", "`0 12 NaN 12 0 NaN`"],
      ["`NaN 12 NaN 12 NaN NaN`", "`NaN 12 NaN 12 NaN NaN`"],
      ["`0 NaN 12 12 0 0`", "`0 NaN 12 12 0 0`"],
      ["`NaN 12 12 12 0 NaN`", "`NaN 12 12 12 0 NaN`"],
    ],
    "a",
    [
      "`Number` converts the whole string after trimming whitespace: an empty string is `0`, and any stray character (`\"12px\"`) gives `NaN`. `parseInt` reads a numeric prefix and stops at the first invalid character. `null` converts to `0` but `undefined` to `NaN`. To validate input, check the format first or use `Number.isFinite` and treat `\"\"` specially.",
      "`Number` перетворює весь рядок після обрізання пробілів: порожній рядок дає `0`, а будь-який зайвий символ (`\"12px\"`) дає `NaN`. `parseInt` читає числовий префікс і зупиняється на першому недопустимому символі. `null` перетворюється на `0`, а `undefined` на `NaN`. Для валідації спершу перевіряйте формат або використовуйте `Number.isFinite` і окремо обробляйте `\"\"`.",
    ],
    { code: 'console.log(\n  Number(""),\n  Number(" 12 "),\n  Number("12px"),\n  parseInt("12px", 10),\n  Number(null),\n  Number(undefined),\n);', codeLanguage: "js" },
  ),
  quiz(
    "coerce-null-comparisons",
    ["type-coercion"],
    2,
    90,
    ["`null` in comparisons", "`null` у порівняннях"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false true true false`", "`false true true false`"],
      ["`true true true true`", "`true true true true`"],
      ["`false false true false`", "`false false true false`"],
      ["`true true false false`", "`true true false false`"],
    ],
    "a",
    [
      "`==` has a special rule: `null` and `undefined` equal each other and nothing else, so `null == 0` and `undefined == 0` are `false`. Relational operators use a different algorithm that converts to numbers: `null` becomes `0`, so `null >= 0` is `true`. That inconsistency is why `== null` is the only common use of loose equality.",
      "`==` має окреме правило: `null` і `undefined` дорівнюють одне одному й нічому іншому, тож `null == 0` і `undefined == 0` дають `false`. Оператори порівняння використовують інший алгоритм, що перетворює на числа: `null` стає `0`, тож `null >= 0` дає `true`. Саме через цю непослідовність `== null` лишається єдиним поширеним використанням нестрогої рівності.",
    ],
    { code: "console.log(null == 0, null >= 0, null == undefined, undefined == 0);", codeLanguage: "js" },
  ),
  quiz(
    "coerce-array-plus",
    ["type-coercion", w("arrays-strings")],
    3,
    90,
    ["Adding arrays", "Додавання масивів"],
    ["What are the four values?", "Які чотири значення отримаємо?"],
    [
      ["`\"1,23\"`, `\"\"`, `\"[object Object]\"`, `\"12\"`", "`\"1,23\"`, `\"\"`, `\"[object Object]\"`, `\"12\"`"],
      ["`[1, 2, 3]`, `[]`, `{}`, `3`", "`[1, 2, 3]`, `[]`, `{}`, `3`"],
      ["`\"1,2,3\"`, `\"\"`, `NaN`, `3`", "`\"1,2,3\"`, `\"\"`, `NaN`, `3`"],
      ["`NaN`, `0`, `NaN`, `NaN`", "`NaN`, `0`, `NaN`, `NaN`"],
    ],
    "a",
    [
      "`+` first turns objects into primitives. Arrays and plain objects return themselves from `valueOf`, so `toString` is used: `[1, 2]` → `\"1,2\"`, `[]` → `\"\"`, `{}` → `\"[object Object]\"`. Once one side is a string, `+` concatenates: `\"1,2\" + \"3\"` is `\"1,23\"` and `1 + \"2\"` is `\"12\"`.",
      "`+` спершу перетворює об'єкти на примітиви. Масиви й звичайні об'єкти повертають себе з `valueOf`, тож використовується `toString`: `[1, 2]` → `\"1,2\"`, `[]` → `\"\"`, `{}` → `\"[object Object]\"`. Щойно один бік стає рядком, `+` виконує конкатенацію: `\"1,2\" + \"3\"` дає `\"1,23\"`, а `1 + \"2\"` дає `\"12\"`.",
    ],
    { code: "console.log(JSON.stringify([[1, 2] + [3], [] + [], [] + {}, 1 + [2]]));", codeLanguage: "js" },
  ),
  quiz(
    "coerce-unary-plus",
    ["type-coercion"],
    3,
    90,
    ["Unary plus", "Унарний плюс"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`0 NaN 0 5 NaN 1`", "`0 NaN 0 5 NaN 1`"],
      ["`NaN NaN NaN 5 NaN 1`", "`NaN NaN NaN 5 NaN 1`"],
      ["`0 0 0 5 3 1`", "`0 0 0 5 3 1`"],
      ["`0 NaN NaN 5 12 1`", "`0 NaN NaN 5 12 1`"],
    ],
    "a",
    [
      "Unary `+` is `Number(x)`. Objects become primitives first, via `toString` for arrays and plain objects: `[]` → `\"\"` → `0`, `[5]` → `\"5\"` → `5`, `[1, 2]` → `\"1,2\"` → `NaN`, `{}` → `\"[object Object]\"` → `NaN`. A whitespace-only string trims to `\"\"`, which is `0`, and `true` is `1`.",
      "Унарний `+` еквівалентний `Number(x)`. Об'єкти спершу стають примітивами, для масивів і звичайних об'єктів через `toString`: `[]` → `\"\"` → `0`, `[5]` → `\"5\"` → `5`, `[1, 2]` → `\"1,2\"` → `NaN`, `{}` → `\"[object Object]\"` → `NaN`. Рядок лише з пробілів обрізається до `\"\"`, тобто `0`, а `true` дає `1`.",
    ],
    { code: 'console.log(+[], +{}, +"  ", +[5], +[1, 2], +true);', codeLanguage: "js" },
  ),
  quiz(
    "coerce-loose-equality",
    ["type-coercion"],
    3,
    120,
    ["Which are `true`?", "Що з цього `true`?"],
    ["Which comparisons evaluate to `true`? (Select all that apply.)", "Які порівняння дають `true`? (Оберіть усі.)"],
    [
      ["`\"0\" == false`", "`\"0\" == false`"],
      ["`null == false`", "`null == false`"],
      ["`[] == false`", "`[] == false`"],
      ["`NaN == NaN`", "`NaN == NaN`"],
      ["`\"1\" == [1]`", "`\"1\" == [1]`"],
    ],
    "ace",
    [
      "With `==`, a boolean is first converted to a number (`false` → `0`). Then `\"0\" == 0` compares as numbers, and `[] == 0` turns `[]` into `\"\"` and then `0`. `\"1\" == [1]` converts the array to `\"1\"`. `null` only equals `null` and `undefined`, and `NaN` equals nothing, not even itself.",
      "З `==` булеве значення спершу перетворюється на число (`false` → `0`). Далі `\"0\" == 0` порівнюється як числа, а `[] == 0` перетворює `[]` на `\"\"`, а потім на `0`. `\"1\" == [1]` перетворює масив на `\"1\"`. `null` дорівнює лише `null` і `undefined`, а `NaN` не дорівнює нічому, навіть собі.",
    ],
  ),
  quiz(
    "coerce-string-compare",
    ["type-coercion", w("sorting-algorithms")],
    3,
    90,
    ["Comparing strings", "Порівняння рядків"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`true false false true`", "`true false false true`"],
      ["`false false true true`", "`false false true true`"],
      ["`true true false true`", "`true true false true`"],
      ["`false false false false`", "`false false false false`"],
    ],
    "a",
    [
      "When both sides are strings, `<` compares them character by character by UTF-16 code: `\"1\"` (49) is less than `\"9\"` (57), so `\"10\" < \"9\"`. If one side is a number, both become numbers, so `10 < \"9\"` is `false`. Upper-case letters come before lower-case (`\"B\"` is 66, `\"a\"` is 97). Use `localeCompare` or `Intl.Collator` for human sorting.",
      "Коли обидва боки рядки, `<` порівнює їх посимвольно за кодами UTF-16: `\"1\"` (49) менше за `\"9\"` (57), тож `\"10\" < \"9\"`. Якщо один бік число, обидва стають числами, тож `10 < \"9\"` дає `false`. Великі літери йдуть перед малими (`\"B\"` має код 66, `\"a\"` має 97). Для людського сортування використовуйте `localeCompare` або `Intl.Collator`.",
    ],
    { code: 'console.log("10" < "9", 10 < "9", "a" < "B", "apple" < "apricot");', codeLanguage: "js" },
  ),
  quiz(
    "coerce-valueof-tostring",
    ["type-coercion", w("oop")],
    4,
    120,
    ["`valueOf` and `toString`", "`valueOf` і `toString`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`43 $42 true $42`", "`43 $42 true $42`"],
      ["`$421 $42 true $42`", "`$421 $42 true $42`"],
      ["`43 42 true 42`", "`43 42 true 42`"],
      ["`$421 42 false $42`", "`$421 42 false $42`"],
    ],
    "a",
    [
      "Binary `+` and `>` ask for a primitive with the \"default\" and \"number\" hints, which try `valueOf` first, so `price` acts as `42`. Template literals and `String()` use the \"string\" hint, which tries `toString` first. (Dates are the exception: their \"default\" hint behaves like \"string\".)",
      "Бінарний `+` і `>` запитують примітив із підказками \"default\" і \"number\", що спершу пробують `valueOf`, тож `price` поводиться як `42`. Шаблонні рядки й `String()` використовують підказку \"string\", що спершу пробує `toString`. (Виняток становлять дати: їхня підказка \"default\" поводиться як \"string\".)",
    ],
    {
      code: 'const price = {\n  valueOf() { return 42; },\n  toString() { return "$42"; },\n};\nconsole.log(price + 1, `${price}`, price > 41, String(price));',
      codeLanguage: "js",
    },
  ),
  quiz(
    "coerce-symbol-toprimitive",
    ["type-coercion"],
    4,
    120,
    ["`Symbol.toPrimitive` hints", "Підказки `Symbol.toPrimitive`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`21 21°C default! 42`", "`21 21°C default! 42`"],
      ["`21 21°C 21! 42`", "`21 21°C 21! 42`"],
      ["`21 default default! 42`", "`21 default default! 42`"],
      ["`NaN 21°C default! NaN`", "`NaN 21°C default! NaN`"],
    ],
    "a",
    [
      "`Symbol.toPrimitive` receives the hint directly. Unary `+` and `*` pass `\"number\"`, a template literal passes `\"string\"`, and binary `+` passes `\"default\"` (it doesn't know yet whether it will add or concatenate), so `temp + \"!\"` becomes `\"default!\"`.",
      "`Symbol.toPrimitive` отримує підказку напряму. Унарний `+` і `*` передають `\"number\"`, шаблонний рядок передає `\"string\"`, а бінарний `+` передає `\"default\"` (він ще не знає, додаватиме чи з'єднуватиме), тож `temp + \"!\"` стає `\"default!\"`.",
    ],
    {
      code: 'const temp = {\n  [Symbol.toPrimitive](hint) {\n    if (hint === "number") return 21;\n    if (hint === "string") return "21°C";\n    return "default";\n  },\n};\nconsole.log(+temp, `${temp}`, temp + "!", temp * 2);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "coerce-a-equals-1-2-3",
    ["type-coercion", w("javascript")],
    5,
    150,
    ["`a == 1 && a == 2 && a == 3`", "`a == 1 && a == 2 && a == 3`"],
    ["Which definitions of `a` make `a == 1 && a == 2 && a == 3` evaluate to `true`? (Select all that apply.)", "Які визначення `a` роблять `a == 1 && a == 2 && a == 3` істинним? (Оберіть усі.)"],
    [
      ["`const a = { n: 1, valueOf() { return this.n++; } };`", "`const a = { n: 1, valueOf() { return this.n++; } };`"],
      ["`const a = { n: 1, toString() { return this.n++; } };`", "`const a = { n: 1, toString() { return this.n++; } };`"],
      ["`const a = [1, 2, 3];`", "`const a = [1, 2, 3];`"],
      ["`const a = { valueOf: () => 1 };`", "`const a = { valueOf: () => 1 };`"],
      ["None: a value can't equal three different numbers", "Жодне: значення не може дорівнювати трьом різним числам"],
    ],
    "ab",
    [
      "Each `==` against a number converts the object with ToPrimitive again, so a method with a side effect returns `1`, `2`, `3` on successive calls. With only `toString`, `valueOf` (inherited) returns the object itself, so `toString` is used and also counts. `[1, 2, 3]` becomes `\"1,2,3\"` → `NaN`, and a constant `valueOf` only matches `1`. With `===` no conversion happens and none of these could work.",
      "Кожне `==` з числом заново перетворює об'єкт через ToPrimitive, тож метод із побічним ефектом повертає `1`, `2`, `3` при послідовних викликах. Якщо є лише `toString`, успадкований `valueOf` повертає сам об'єкт, тож використовується `toString`, який теж рахує. `[1, 2, 3]` стає `\"1,2,3\"` → `NaN`, а сталий `valueOf` збігається лише з `1`. З `===` перетворення немає, і жоден варіант не спрацював би.",
    ],
  ),
  practice({
    slug: "coerce-parse-inputs",
    skills: ["type-coercion", w("typescript")],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["Parse form and query values safely", "Безпечний розбір значень з форм і запитів"],
    prompt: [
      "Values from forms, URLs and JSON are often strings (or `unknown`), and `Number()`/`Boolean()` coerce them in surprising ways. Implement two strict parsers in `src/parse.ts`:\n\n**`parseNumber(input)`** → a number or `null`\n- Finite numbers pass through; `NaN` and `±Infinity` → `null`.\n- Strings are trimmed and must be a plain decimal number (optional sign, decimals, exponent): `\"42\"`, `\" -3.5 \"`, `\".5\"`, `\"1e3\"`. Reject `\"\"`, `\"12px\"`, `\"1,000\"`, `\"0x1F\"`, `\"Infinity\"`.\n- Any other type (`null`, `true`, `[5]`, objects) → `null`; never coerce them.\n\n**`parseBoolean(input)`** → `true`, `false` or `null`\n- Booleans pass through; numbers `1`/`0` map to `true`/`false`.\n- Strings, trimmed and case-insensitive: `true`, `1`, `yes`, `on` → `true`; `false`, `0`, `no`, `off`, and `\"\"` → `false`.\n- Anything else → `null`.",
      "Значення з форм, URL і JSON часто є рядками (або `unknown`), а `Number()`/`Boolean()` приводять їх несподіваним чином. Реалізуйте два строгі парсери в `src/parse.ts`:\n\n**`parseNumber(input)`** → число або `null`\n- Скінченні числа повертаються як є; `NaN` і `±Infinity` → `null`.\n- Рядки обрізаються від пробілів і мають бути звичайним десятковим числом (необов'язковий знак, дробова частина, експонента): `\"42\"`, `\" -3.5 \"`, `\".5\"`, `\"1e3\"`. Відхиляйте `\"\"`, `\"12px\"`, `\"1,000\"`, `\"0x1F\"`, `\"Infinity\"`.\n- Будь-який інший тип (`null`, `true`, `[5]`, об'єкти) → `null`; ніколи їх не приводьте.\n\n**`parseBoolean(input)`** → `true`, `false` або `null`\n- Булеві значення повертаються як є; числа `1`/`0` стають `true`/`false`.\n- Рядки, без пробілів по краях і без урахування регістру: `true`, `1`, `yes`, `on` → `true`; `false`, `0`, `no`, `off` і `\"\"` → `false`.\n- Усе інше → `null`.",
    ],
    files: { "/src/parse.ts": PARSE_STARTER, "/index.ts": PARSE_INDEX },
    visibleFiles: ["/src/parse.ts", "/index.ts"],
    activeFile: "/src/parse.ts",
    tests: PARSE_TESTS,
    solution: { "/src/parse.ts": PARSE_SOLUTION },
    explanation: [
      "`Number` is too lenient for input validation: it turns `\"\"` and `null` into `0`, accepts hex and `Infinity`, and converts arrays through their strings. `Boolean(\"false\")` is `true` because every non-empty string is truthy. Checking the type first and validating the string format with a regex before converting makes the rules explicit, and returning `null` (rather than guessing) lets callers show a validation error.",
      "`Number` занадто поблажливий для валідації: перетворює `\"\"` і `null` на `0`, приймає шістнадцяткові числа й `Infinity` і перетворює масиви через їхні рядки. `Boolean(\"false\")` дає `true`, бо кожен непорожній рядок істинний. Перевірка типу й формату рядка регулярним виразом перед перетворенням робить правила явними, а повернення `null` (замість здогадок) дає змогу показати помилку валідації.",
    ],
  }),
  practice({
    slug: "coerce-loose-equals",
    skills: ["type-coercion", w("javascript")],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Implement `==` yourself", "Реалізуйте `==` самостійно"],
    prompt: [
      "Re-implement JavaScript's loose equality in `src/equals.ts`, without using `==` or `!=`.\n\n**`toPrimitive(value, hint = \"default\")`**\n- If `value[Symbol.toPrimitive]` exists, call it with the hint; an object result throws a `TypeError`.\n- Otherwise try `valueOf` then `toString` (for the `\"string\"` hint: `toString` then `valueOf`), returning the first primitive result. If neither gives a primitive, throw a `TypeError`.\n\n**`looseEquals(a, b)`** follows the spec algorithm:\n1. Same type → strict equality (`null` is its own type; functions count as objects).\n2. `null` and `undefined` equal each other and nothing else.\n3. Number vs string → compare as numbers.\n4. A boolean is converted to a number, then compared again.\n5. Object vs string or number → convert the object with `toPrimitive`, then compare again.\n6. Otherwise `false`.\n\nThe tests compare your function with the real `==` across hundreds of value pairs.",
      "Повторно реалізуйте нестрогу рівність JavaScript у `src/equals.ts`, не використовуючи `==` чи `!=`.\n\n**`toPrimitive(value, hint = \"default\")`**\n- Якщо існує `value[Symbol.toPrimitive]`, викличте його з підказкою; результат-об'єкт кидає `TypeError`.\n- Інакше пробуйте `valueOf`, потім `toString` (для підказки `\"string\"`: `toString`, потім `valueOf`) і поверніть перший примітивний результат. Якщо жоден не дав примітив, киньте `TypeError`.\n\n**`looseEquals(a, b)`** дотримується алгоритму специфікації:\n1. Однаковий тип → строга рівність (`null` має власний тип; функції вважаються об'єктами).\n2. `null` і `undefined` дорівнюють одне одному й нічому іншому.\n3. Число й рядок → порівняти як числа.\n4. Булеве значення перетворюється на число, і порівняння повторюється.\n5. Об'єкт і рядок чи число → перетворити об'єкт через `toPrimitive` і порівняти знову.\n6. Інакше `false`.\n\nТести порівнюють вашу функцію зі справжнім `==` на сотнях пар значень.",
    ],
    files: { "/src/equals.ts": EQ_STARTER, "/index.ts": EQ_INDEX },
    visibleFiles: ["/src/equals.ts", "/index.ts"],
    activeFile: "/src/equals.ts",
    tests: EQ_TESTS,
    solution: { "/src/equals.ts": EQ_SOLUTION },
    explanation: [
      "Loose equality isn't magic, just a short recursive algorithm: equal types compare strictly, `null`/`undefined` form a closed pair, booleans become numbers, objects become primitives, and strings meet numbers as numbers. Seeing it written out explains every famous puzzle: `[] == false` is `[]` → `\"\"` → `0` versus `false` → `0`. It's also the best argument for using `===` everywhere except `x == null`.",
      "Нестрога рівність не є магією, а лише коротким рекурсивним алгоритмом: однакові типи порівнюються строго, `null`/`undefined` утворюють замкнену пару, булеві значення стають числами, об'єкти стають примітивами, а рядки з числами порівнюються як числа. Записаний явно, він пояснює кожну відому загадку: `[] == false` означає `[]` → `\"\"` → `0` проти `false` → `0`. І це найкращий аргумент на користь `===` всюди, крім `x == null`.",
    ],
  }),
]);
