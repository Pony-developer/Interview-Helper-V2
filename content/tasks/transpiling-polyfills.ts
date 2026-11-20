import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const POLY_STARTER = String.raw`/** Array.prototype.at (call with this = an array, array-like or string). */
export function at(this: any, index: number): unknown {
  // TODO: negative, fractional and non-numeric indexes; array-likes; null this
  return this[index];
}

/** Object.groupBy(items, callback): groups any iterable into a null-prototype object. */
export function groupBy(items: Iterable<unknown>, callback: (value: any, index: number) => PropertyKey): Record<PropertyKey, unknown[]> {
  // TODO: only works for arrays, passes no index, returns a normal object
  const result: Record<PropertyKey, unknown[]> = {};
  for (const value of items as unknown[]) (result[callback(value, 0) as any] ??= []).push(value);
  return result;
}

/** Promise.withResolvers (this = the promise constructor). */
export function withResolvers(this: any) {
  // TODO
  return { promise: Promise.resolve(), resolve: () => {}, reject: () => {} };
}

export type InstallTargets = { arrayPrototype?: object; objectConstructor?: object; promiseConstructor?: object };

/** Installs each missing method like a built-in and returns the names it installed. */
export function install(targets: InstallTargets): string[] {
  // TODO: overwrites natives and creates enumerable properties
  const installed: string[] = [];
  if (targets.arrayPrototype) {
    (targets.arrayPrototype as any).at = at;
    installed.push("Array.prototype.at");
  }
  return installed;
}
`;

const POLY_SOLUTION = String.raw`function toIntegerOrInfinity(value: unknown): number {
  const n = Number(value); // throws for symbols, like the spec
  return Number.isNaN(n) ? 0 : Math.trunc(n);
}

function toLength(value: unknown): number {
  const n = toIntegerOrInfinity(value);
  return n <= 0 ? 0 : Math.min(n, Number.MAX_SAFE_INTEGER);
}

// A function declaration with exactly one parameter, so at.name === "at" and at.length === 1 like the built-in.
export function at(this: any, index: number): unknown {
  if (this === null || this === undefined) throw new TypeError("Array.prototype.at called on null or undefined");
  const o = Object(this);
  const len = toLength(o.length);
  const relative = toIntegerOrInfinity(index);
  const k = relative >= 0 ? relative : len + relative;
  return k < 0 || k >= len ? undefined : o[k];
}

export function groupBy(items: Iterable<unknown>, callback: (value: any, index: number) => PropertyKey): Record<PropertyKey, unknown[]> {
  if (typeof callback !== "function") throw new TypeError("callback is not a function");
  const result: Record<PropertyKey, unknown[]> = Object.create(null); // no inherited keys like "toString"
  let index = 0;
  for (const value of items) {
    const raw = callback(value, index++);
    const key = typeof raw === "symbol" ? raw : String(raw);
    (result[key as any] ??= []).push(value);
  }
  return result;
}

export function withResolvers(this: any) {
  const C = this === undefined ? Promise : this;
  if (typeof C !== "function") throw new TypeError("withResolvers must be called on a constructor");
  let resolve!: (value?: unknown) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new C((res: (value?: unknown) => void, rej: (reason?: unknown) => void) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export type InstallTargets = { arrayPrototype?: object; objectConstructor?: object; promiseConstructor?: object };

function define(target: object | undefined, name: string, fn: Function, label: string, installed: string[]) {
  if (!target || typeof (target as any)[name] === "function") return; // never replace a native or earlier polyfill
  Object.defineProperty(target, name, { value: fn, writable: true, configurable: true, enumerable: false });
  installed.push(label);
}

export function install(targets: InstallTargets): string[] {
  const installed: string[] = [];
  define(targets.arrayPrototype, "at", at, "Array.prototype.at", installed);
  define(targets.objectConstructor, "groupBy", groupBy, "Object.groupBy", installed);
  define(targets.promiseConstructor, "withResolvers", withResolvers, "Promise.withResolvers", installed);
  return installed;
}
`;

const POLY_INDEX = String.raw`import "./styles.css";
import { at, groupBy, install } from "./src/polyfills";

const lines: string[] = [];
try {
  lines.push("at.call([1, 2, 3], -1) = " + String(at.call([1, 2, 3], -1)));
  lines.push("groupBy: " + JSON.stringify(groupBy([1, 2, 3, 4], (n: number) => (n % 2 ? "odd" : "even"))));
  const fakeArrayPrototype = {};
  lines.push("installed: " + install({ arrayPrototype: fakeArrayPrototype }).join(", "));
  lines.push("enumerable? " + Object.keys(fakeArrayPrototype).length);
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Polyfills</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const POLY_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { at, groupBy, install, withResolvers } from "../src/polyfills";

describe("at", () => {
  it("handles negative, fractional, non-numeric and out-of-range indexes like the spec", () => {
    const arr = [1, 2, 3];
    expect(at.call(arr, -1)).toBe(3);
    expect(at.call(arr, 1.7)).toBe(2);
    expect(at.call(arr, -1.2)).toBe(3);
    expect(at.call(arr, "x")).toBe(1);
    expect(at.call(arr, -4)).toBeUndefined();
    expect(at.call(arr, Infinity)).toBeUndefined();
    expect(at.call(arr, -Infinity)).toBeUndefined();
  });
  it("works on array-likes and strings, and rejects null", () => {
    expect(at.call({ length: 2, 0: "a", 1: "b" }, -1)).toBe("b");
    expect(at.call("héllo", 1)).toBe("é");
    expect(() => at.call(null, 0)).toThrow(TypeError);
  });
  it("looks like the built-in", () => {
    expect(at.name).toBe("at");
    expect(at.length).toBe(1);
  });
});

describe("groupBy", () => {
  it("groups any iterable into a null-prototype object, passing the index", () => {
    const indexes = [];
    const result = groupBy(new Set([1, 2, 3, 4]), (n, i) => {
      indexes.push(i);
      return n % 2 ? "odd" : "even";
    });
    expect(Object.getPrototypeOf(result)).toBeNull();
    expect({ ...result }).toEqual({ odd: [1, 3], even: [2, 4] });
    expect(indexes).toEqual([0, 1, 2, 3]);
  });
  it("converts keys to property keys", () => {
    const result = groupBy(["a", "bb", "cc"], (s) => s.length);
    expect(Object.keys(result)).toEqual(["1", "2"]);
    expect(result[2]).toEqual(["bb", "cc"]);
  });
  it("can use keys like toString safely", () => {
    expect(groupBy(["x"], () => "toString").toString).toEqual(["x"]);
  });
  it("validates its arguments", () => {
    expect(() => groupBy([1], null)).toThrow(TypeError);
    expect(() => groupBy(null, () => "k")).toThrow(TypeError);
    expect(groupBy.length).toBe(2);
  });
});

describe("withResolvers", () => {
  it("returns a promise with its resolve and reject functions", async () => {
    const { promise, resolve } = withResolvers.call(Promise);
    setTimeout(() => resolve("done"), 1);
    expect(await promise).toBe("done");
    const r = withResolvers.call(Promise);
    r.reject(new Error("nope"));
    await expect(r.promise).rejects.toThrow("nope");
  });
  it("uses the constructor it's called on", () => {
    class MyPromise extends Promise {}
    expect(withResolvers.call(MyPromise).promise).toBeInstanceOf(MyPromise);
    expect(withResolvers.length).toBe(0);
  });
});

describe("install", () => {
  it("adds missing methods as non-enumerable, writable, configurable properties", () => {
    const arrayPrototype = {};
    const objectConstructor = {};
    const promiseConstructor = {};
    expect(install({ arrayPrototype, objectConstructor, promiseConstructor })).toEqual([
      "Array.prototype.at",
      "Object.groupBy",
      "Promise.withResolvers",
    ]);
    const desc = Object.getOwnPropertyDescriptor(arrayPrototype, "at");
    expect([desc.enumerable, desc.writable, desc.configurable]).toEqual([false, true, true]);
    expect(Object.keys(arrayPrototype)).toEqual([]);
  });
  it("never replaces an existing implementation", () => {
    const native = function at() {};
    const arrayPrototype = { at: native };
    expect(install({ arrayPrototype })).toEqual([]);
    expect(arrayPrototype.at).toBe(native);
  });
});
`;

const COMPAT_STARTER = String.raw`export type Target = { browser: string; version: string };
/** feature → browser → first version that supports it. */
export type CompatData = Record<string, Record<string, string>>;

/** "chrome 90, Safari 15.4,firefox 100" → targets (lowercase browsers). Throws SyntaxError on bad entries. */
export function parseTargets(query: string): Target[] {
  // TODO: whitespace, case and validation
  return query.split(", ").map((part) => {
    const [browser, version] = part.split(" ");
    return { browser, version };
  });
}

/** Negative if a < b, 0 if equal, positive if a > b. "15" equals "15.0". */
export function compareVersions(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0; // TODO: compares as strings, so "100" < "99"
}

/** Features that at least one target doesn't support (sorted). Unknown browsers need the polyfill. */
export function requiredPolyfills(compat: CompatData, targets: Target[]): string[] {
  return []; // TODO
}
`;

const COMPAT_SOLUTION = String.raw`export type Target = { browser: string; version: string };
export type CompatData = Record<string, Record<string, string>>;

export function parseTargets(query: string): Target[] {
  return query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = /^([a-z_]+)\s+(\d+(?:\.\d+)*)$/i.exec(part);
      if (!match) throw new SyntaxError("Invalid target: " + part);
      return { browser: match[1].toLowerCase(), version: match[2] };
    });
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0); // missing segments count as 0
    if (diff !== 0) return diff;
  }
  return 0;
}

export function requiredPolyfills(compat: CompatData, targets: Target[]): string[] {
  return Object.keys(compat)
    .filter((feature) =>
      targets.some((t) => {
        const since = compat[feature][t.browser];
        // No data for this browser: assume it's missing, the safe choice for a polyfill.
        return since === undefined || compareVersions(t.version, since) < 0;
      }),
    )
    .sort();
}
`;

const COMPAT_INDEX = String.raw`import "./styles.css";
import { parseTargets, requiredPolyfills } from "./src/compat";

const compat = {
  "array.at": { chrome: "92", firefox: "90", safari: "15.4" },
  "object.groupBy": { chrome: "117", firefox: "119", safari: "17.4" },
  "structuredClone": { chrome: "98", firefox: "94", safari: "15.4" },
};
let output: string;
try {
  const targets = parseTargets("chrome 100, safari 15.4, firefox 115");
  output = "targets: " + JSON.stringify(targets) + "\nneeds: " + requiredPolyfills(compat, targets).join(", ");
} catch (e) {
  output = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Which polyfills?</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = output;
`;

const COMPAT_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { compareVersions, parseTargets, requiredPolyfills } from "../src/compat";

const compat = {
  "array.at": { chrome: "92", firefox: "90", safari: "15.4" },
  "object.groupBy": { chrome: "117", firefox: "119", safari: "17.4" },
  "promise.withResolvers": { chrome: "119", firefox: "121", safari: "17.4" },
  "structuredClone": { chrome: "98", firefox: "94", safari: "15.4" },
};

describe("parseTargets", () => {
  it("parses a list with any spacing and case", () => {
    expect(parseTargets("chrome 90, Safari 15.4,firefox  100 ")).toEqual([
      { browser: "chrome", version: "90" },
      { browser: "safari", version: "15.4" },
      { browser: "firefox", version: "100" },
    ]);
  });
  it("rejects malformed entries", () => {
    expect(() => parseTargets("chrome, safari 15")).toThrow(SyntaxError);
    expect(() => parseTargets("chrome latest")).toThrow(SyntaxError);
  });
});

describe("compareVersions", () => {
  it("compares segment by segment as numbers", () => {
    expect(compareVersions("100", "99")).toBeGreaterThan(0);
    expect(compareVersions("15.4", "15.10")).toBeLessThan(0);
    expect(compareVersions("15", "15.0")).toBe(0);
    expect(compareVersions("17.4.1", "17.4")).toBeGreaterThan(0);
  });
});

describe("requiredPolyfills", () => {
  it("lists features some target lacks", () => {
    const targets = parseTargets("chrome 100, safari 15.4, firefox 115");
    expect(requiredPolyfills(compat, targets)).toEqual(["object.groupBy", "promise.withResolvers"]);
  });
  it("needs nothing for modern targets, and everything for unknown browsers", () => {
    expect(requiredPolyfills(compat, parseTargets("chrome 120, firefox 121, safari 17.4"))).toEqual([]);
    expect(requiredPolyfills(compat, parseTargets("samsung 20"))).toEqual(Object.keys(compat).sort());
  });
  it("treats a supported version exactly at the boundary as supported", () => {
    expect(requiredPolyfills(compat, parseTargets("safari 15.4"))).toEqual(["object.groupBy", "promise.withResolvers"]);
    expect(requiredPolyfills(compat, parseTargets("safari 15.3"))).toEqual(Object.keys(compat).sort());
  });
});
`;

export default defineTasks([
  quiz(
    "poly-syntax-vs-api",
    ["transpiling-polyfills"],
    1,
    75,
    ["What can a polyfill add?", "Що може додати поліфіл?"],
    ["Which of these can be added to an older browser with a polyfill (runtime code), without a transpiler?", "Що з цього можна додати в старіший браузер поліфілом (кодом під час виконання), без транспілятора?"],
    [
      ["`Object.groupBy`", "`Object.groupBy`"],
      ["`Array.prototype.at`", "`Array.prototype.at`"],
      ["Optional chaining (`user?.name`)", "Optional chaining (`user?.name`)"],
      ["`async`/`await`", "`async`/`await`"],
    ],
    "ab",
    [
      "New **APIs** are just functions and objects, so code can define them at runtime when they're missing. New **syntax** can't be polyfilled: an engine that doesn't understand `?.` or `async` fails to parse the whole file, before any polyfill could run. Syntax has to be rewritten at build time by a transpiler.",
      "Нові **API** є просто функціями й об'єктами, тож код може визначити їх під час виконання, якщо їх немає. Новий **синтаксис** поліфілити не можна: рушій, що не розуміє `?.` чи `async`, не може розібрати весь файл ще до того, як міг би виконатися будь-який поліфіл. Синтаксис має переписати транспілятор під час збирання.",
    ],
  ),
  quiz(
    "poly-parse-failure",
    ["transpiling-polyfills"],
    2,
    75,
    ["One unsupported operator", "Один непідтримуваний оператор"],
    [
      "A bundle starts with analytics setup and, 500 lines later, uses `a ?? b`. What happens in a browser that doesn't support `??`?",
      "Бандл починається з налаштування аналітики, а через 500 рядків використовує `a ?? b`. Що станеться в браузері, що не підтримує `??`?",
    ],
    [
      ["The whole script fails with a `SyntaxError` and none of it runs, including the analytics setup", "Увесь скрипт падає з `SyntaxError`, і нічого з нього не виконується, зокрема налаштування аналітики"],
      ["The first 500 lines run, then a `SyntaxError` stops execution", "Перші 500 рядків виконуються, потім `SyntaxError` зупиняє виконання"],
      ["Only the function containing `??` throws when it's called", "Помилку кидає лише функція з `??`, коли її викликають"],
      ["The browser treats `??` like `||`", "Браузер обробляє `??` як `||`"],
    ],
    "a",
    [
      "Scripts are parsed completely before they run, and a syntax error anywhere rejects the whole file. That's why unsupported syntax is more dangerous than a missing API: a missing API breaks one code path at runtime, but unsupported syntax silently breaks the entire bundle for those users. Configure transpiler targets for every browser you support, and monitor errors from old browsers.",
      "Скрипти повністю розбираються до виконання, і синтаксична помилка будь-де відхиляє весь файл. Тому непідтримуваний синтаксис небезпечніший за відсутній API: відсутній API ламає один шлях коду під час виконання, а непідтримуваний синтаксис непомітно ламає весь бандл для цих користувачів. Налаштуйте цілі транспілятора для кожного браузера, який ви підтримуєте, і відстежуйте помилки зі старих браузерів.",
    ],
  ),
  quiz(
    "poly-enumerable",
    ["transpiling-polyfills", w("js-metaprogramming")],
    2,
    90,
    ["Two ways to patch a prototype", "Два способи пропатчити прототип"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ '0', '1', 'last' ] 10`", "`[ '0', '1', 'last' ] 10`"],
      ["`[ '0', '1' ] 10`", "`[ '0', '1' ] 10`"],
      ["`[ '0', '1', 'last', 'first' ] 10`", "`[ '0', '1', 'last', 'first' ] 10`"],
      ["`[ 'last' ] undefined`", "`[ 'last' ] undefined`"],
    ],
    "a",
    [
      "Assigning a method to `Array.prototype` creates an **enumerable** property, so every `for…in` loop over every array in the app now sees `last`, which breaks code (and libraries) that iterate with `for…in`. `Object.defineProperty` defaults to non-enumerable, like built-in methods, so `first` stays invisible. Polyfills must be defined that way.",
      "Присвоєння методу в `Array.prototype` створює **перелічувану** властивість, тож кожен цикл `for…in` по кожному масиву в застосунку тепер бачить `last`, і це ламає код (і бібліотеки), що перебирають через `for…in`. `Object.defineProperty` за замовчуванням створює неперелічувані властивості, як у вбудованих методів, тож `first` лишається невидимим. Поліфіли треба визначати саме так.",
    ],
    {
      code: 'Array.prototype.last = function () {\n  return this[this.length - 1];\n};\nObject.defineProperty(Array.prototype, "first", {\n  value: function () {\n    return this[0];\n  },\n  writable: true,\n  configurable: true,\n});\nconst keys = [];\nfor (const k in [10, 20]) keys.push(k);\nconsole.log(keys, [10, 20].first());',
      codeLanguage: "js",
    },
  ),
  quiz(
    "poly-overwrite-native",
    ["transpiling-polyfills", w("type-coercion")],
    3,
    90,
    ["An unguarded, simplified polyfill", "Спрощений поліфіл без перевірки"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false true`", "`false true`"],
      ["`true true`", "`true true`"],
      ["`false false`", "`false false`"],
      ["`true false`", "`true false`"],
    ],
    "a",
    [
      "The \"polyfill\" replaces the native `includes` unconditionally with an `indexOf`-based version. `indexOf` uses `===`, and `NaN !== NaN`, while the real `includes` uses SameValueZero and finds `NaN`. A polyfill must check whether the feature exists first and implement the spec exactly, or it silently changes behaviour even in browsers that had it right.",
      "«Поліфіл» безумовно замінює нативний `includes` версією на основі `indexOf`. `indexOf` використовує `===`, а `NaN !== NaN`, тоді як справжній `includes` використовує SameValueZero і знаходить `NaN`. Поліфіл має спершу перевірити, чи можливість існує, і точно реалізувати специфікацію, інакше він непомітно змінює поведінку навіть у браузерах, де все працювало правильно.",
    ],
    {
      code: "const native = Array.prototype.includes;\nArray.prototype.includes = function (x) {\n  return this.indexOf(x) !== -1;\n};\nconst patched = [NaN].includes(NaN);\nArray.prototype.includes = native;\nconsole.log(patched, [NaN].includes(NaN));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "poly-at-edge-cases",
    ["transpiling-polyfills", w("type-coercion")],
    3,
    90,
    ["What a spec-compliant `at` returns", "Що повертає `at` за специфікацією"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`3 2 1 undefined`", "`3 2 1 undefined`"],
      ["`3 undefined undefined undefined`", "`3 undefined undefined undefined`"],
      ["`3 2 undefined 1`", "`3 2 undefined 1`"],
      ["`undefined 2 1 undefined`", "`undefined 2 1 undefined`"],
    ],
    "a",
    [
      "The spec converts the index with ToIntegerOrInfinity: `1.7` is truncated to `1`, and `\"x\"` becomes `NaN`, which becomes `0`. Negative indexes count from the end, and `-4` is still out of range for a 3-element array, so it returns `undefined`. A polyfill that just does `this[i < 0 ? len + i : i]` gets the fractional and non-numeric cases wrong.",
      "Специфікація перетворює індекс через ToIntegerOrInfinity: `1.7` обрізається до `1`, а `\"x\"` стає `NaN`, що стає `0`. Від'ємні індекси рахуються з кінця, а `-4` все одно поза межами масиву з 3 елементів, тож повертається `undefined`. Поліфіл, що просто робить `this[i < 0 ? len + i : i]`, помиляється в дробових і нечислових випадках.",
    ],
    { code: 'const a = [1, 2, 3];\nconsole.log(a.at(-1), a.at(1.7), a.at("x"), a.at(-4));', codeLanguage: "js" },
  ),
  quiz(
    "poly-ua-sniffing",
    ["transpiling-polyfills", w("browser-apis")],
    2,
    75,
    ["Detecting support", "Визначення підтримки"],
    ["You need to know whether lazy-loading with `IntersectionObserver` is available. Which approach is best?", "Треба знати, чи доступне ліниве завантаження через `IntersectionObserver`. Який підхід найкращий?"],
    [
      ["`if (\"IntersectionObserver\" in window) { … } else { /* load everything */ }`", "`if (\"IntersectionObserver\" in window) { … } else { /* завантажити все */ }`"],
      ["Parse `navigator.userAgent` and compare the browser version with a support table", "Розібрати `navigator.userAgent` і порівняти версію браузера з таблицею підтримки"],
      ["Wrap every usage in `try/catch` and log errors", "Загорнути кожне використання в `try/catch` і записувати помилки"],
      ["Assume all browsers support it", "Вважати, що всі браузери це підтримують"],
    ],
    "a",
    [
      "Feature detection tests the capability you need, so it works in every engine, including ones you've never heard of, and automatically starts using the feature when a browser adds it. User-agent strings lie (browsers impersonate each other), are being frozen and reduced, and require maintaining version tables. Combine detection with a graceful fallback (progressive enhancement).",
      "Визначення можливостей перевіряє саме потрібну можливість, тож працює в будь-якому рушії, зокрема в тих, про які ви ніколи не чули, і автоматично починає використовувати можливість, щойно браузер її додає. Рядки user-agent брешуть (браузери видають себе один за одного), їх заморожують і скорочують, і вони потребують підтримки таблиць версій. Поєднуйте визначення з плавним запасним варіантом (прогресивне покращення).",
    ],
  ),
  quiz(
    "poly-module-nomodule",
    ["transpiling-polyfills", w("es-modules")],
    3,
    90,
    ["Differential loading", "Диференційоване завантаження"],
    [
      "A page includes `<script type=\"module\" src=\"modern.js\"></script>` and `<script nomodule src=\"legacy.js\"></script>`. What does each kind of browser load?",
      "Сторінка містить `<script type=\"module\" src=\"modern.js\"></script>` і `<script nomodule src=\"legacy.js\"></script>`. Що завантажує кожен вид браузера?",
    ],
    [
      ["Browsers that support ES modules run `modern.js` and skip `nomodule` scripts; older browsers ignore the unknown `type=\"module\"` and run `legacy.js`", "Браузери з підтримкою ES-модулів виконують `modern.js` і пропускають скрипти `nomodule`; старіші браузери ігнорують невідомий `type=\"module\"` і виконують `legacy.js`"],
      ["Every browser runs both, so code runs twice", "Кожен браузер виконує обидва, тож код виконується двічі"],
      ["Every browser runs only `legacy.js`, because it's safer", "Кожен браузер виконує лише `legacy.js`, бо так безпечніше"],
      ["Modern browsers run both; old browsers run neither", "Сучасні браузери виконують обидва; старі не виконують жодного"],
    ],
    "a",
    [
      "Support for `type=\"module\"` arrived together with most ES2015+ syntax, so it's a cheap proxy for \"modern browser\". Modern browsers get a smaller, less-transpiled bundle, and legacy browsers get the fully transpiled and polyfilled one. (A few old Safari and Edge versions downloaded both, which bundler plugins work around.) As old browsers disappear, many sites now ship only the module build.",
      "Підтримка `type=\"module\"` з'явилася разом із більшістю синтаксису ES2015+, тож це дешевий спосіб визначити «сучасний браузер». Сучасні браузери отримують менший, менш транспільований бандл, а застарілі отримують повністю транспільований і поліфілений. (Кілька старих версій Safari й Edge завантажували обидва, і плагіни бандлерів це обходять.) Оскільки старі браузери зникають, багато сайтів тепер постачають лише збирання з модулями.",
    ],
  ),
  quiz(
    "poly-browserslist",
    ["transpiling-polyfills", w("vite", 0.3)],
    2,
    75,
    ["What targets control", "Що контролюють цілі"],
    ["You change your `browserslist` query from `> 0.2%, not dead` to `last 2 Chrome versions`. What changes in the build?", "Ви змінюєте запит `browserslist` з `> 0.2%, not dead` на `last 2 Chrome versions`. Що змінюється в збиранні?"],
    [
      ["Fewer syntax transforms and polyfills are applied, so the bundle gets smaller, and older and non-Chrome browsers may break", "Застосовується менше перетворень синтаксису й поліфілів, тож бандл меншає, а старіші й інші браузери можуть зламатися"],
      ["Nothing: browserslist only affects CSS", "Нічого: browserslist впливає лише на CSS"],
      ["The bundle gets bigger, because Chrome needs more polyfills", "Бандл більшає, бо Chrome потребує більше поліфілів"],
      ["The app refuses to load in other browsers", "Застосунок відмовляється завантажуватися в інших браузерах"],
    ],
    "a",
    [
      "Babel's preset-env, SWC, core-js, Autoprefixer and Lightning CSS all read browserslist to decide what to transform and polyfill. Narrower targets mean less code, but nothing stops other browsers from loading the result: they just hit syntax errors or missing APIs. Choose targets from your real analytics, not convenience.",
      "Preset-env у Babel, SWC, core-js, Autoprefixer і Lightning CSS читають browserslist, щоб вирішити, що перетворювати й поліфілити. Вужчі цілі означають менше коду, але ніщо не заважає іншим браузерам завантажити результат: вони просто натраплять на синтаксичні помилки чи відсутні API. Обирайте цілі за реальною аналітикою, а не за зручністю.",
    ],
  ),
  quiz(
    "poly-ponyfill",
    ["transpiling-polyfills"],
    2,
    75,
    ["Polyfills in a library", "Поліфіли в бібліотеці"],
    ["You maintain an npm library that needs `structuredClone`, which some users' environments lack. What should the library do?", "Ви підтримуєте npm-бібліотеку, якій потрібен `structuredClone`, а в середовищах деяких користувачів його немає. Що має робити бібліотека?"],
    [
      ["Use a ponyfill: import a local implementation (or use the native one if present) without modifying globals, and document the requirement", "Використати поніфіл: імпортувати локальну реалізацію (чи використати нативну, якщо вона є), не змінюючи глобальні об'єкти, і задокументувати вимогу"],
      ["Install a global polyfill when the library is imported", "Встановити глобальний поліфіл під час імпорту бібліотеки"],
      ["Overwrite `globalThis.structuredClone` with its own version every time", "Щоразу перезаписувати `globalThis.structuredClone` власною версією"],
      ["Throw an error at import time in those environments", "Кидати помилку під час імпорту в цих середовищах"],
    ],
    "a",
    [
      "Global polyfills are the **application's** decision: a library that patches globals can conflict with the app's polyfills, ship duplicate code, or change behaviour for unrelated code. A ponyfill keeps the dependency local and side-effect free. Applications then choose their polyfill strategy (for example core-js with `useBuiltIns: \"usage\"`) once, for the whole bundle.",
      "Глобальні поліфіли є рішенням **застосунку**: бібліотека, що латає глобальні об'єкти, може конфліктувати з поліфілами застосунку, дублювати код чи змінювати поведінку стороннього коду. Поніфіл тримає залежність локальною й без побічних ефектів. Застосунки потім обирають свою стратегію поліфілів (наприклад, core-js з `useBuiltIns: \"usage\"`) один раз для всього бандла.",
    ],
  ),
  quiz(
    "poly-transpile-cost",
    ["transpiling-polyfills", w("web-performance")],
    3,
    90,
    ["The cost of over-transpiling", "Ціна надмірної транспіляції"],
    ["A team targets IE 11 \"just in case\". Their `async` functions and classes are transpiled to ES5. What's the main cost for users on modern browsers?", "Команда націлюється на IE 11 «про всяк випадок». Їхні `async`-функції й класи транспілюються в ES5. Яка головна ціна для користувачів сучасних браузерів?"],
    [
      ["They download and parse larger, slower code (state machines, helpers, regenerator runtime, polyfills) for features their browser already has", "Вони завантажують і розбирають більший і повільніший код (скінченні автомати, допоміжні функції, regenerator runtime, поліфіли) для можливостей, які їхній браузер уже має"],
      ["None: browsers skip transpiled code they don't need", "Жодної: браузери пропускають непотрібний транспільований код"],
      ["Their browser switches to a compatibility mode", "Їхній браузер перемикається в режим сумісності"],
      ["Source maps stop working", "Карти коду перестають працювати"],
    ],
    "a",
    [
      "Down-levelled `async` functions become generator-style state machines with runtime helpers, classes become helper-heavy functions, and broad targets pull in many polyfills. All of it is shipped to everyone, increasing download, parse and execution time, often by tens of percent. Drop targets you don't need, or serve a separate legacy bundle only to old browsers.",
      "Знижені до старого стандарту `async`-функції стають скінченними автоматами в стилі генераторів з допоміжними функціями під час виконання, класи стають функціями з багатьма помічниками, а широкі цілі підтягують багато поліфілів. Усе це постачається всім, збільшуючи час завантаження, розбору й виконання, часто на десятки відсотків. Відмовтеся від непотрібних цілей або віддавайте окремий застарілий бандл лише старим браузерам.",
    ],
  ),
  practice({
    slug: "poly-spec-polyfills",
    skills: ["transpiling-polyfills", w("type-coercion"), w("js-metaprogramming")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["Spec-compliant polyfills", "Поліфіли за специфікацією"],
    prompt: [
      "Write three polyfills in `src/polyfills.ts` that behave like the built-ins:\n\n- `at(index)`, called with `this` = an array, array-like or string. Convert the index like the spec (truncate fractions, `NaN` → 0, `±Infinity` stay infinite), count negative indexes from the end, return `undefined` out of range, and throw a `TypeError` for `null`/`undefined` `this`. `at.name` is `\"at\"` and `at.length` is `1`.\n- `groupBy(items, callback)`, like `Object.groupBy`: accepts any iterable, calls `callback(value, index)`, converts keys to property keys, and returns an object with a **null prototype**. It throws a `TypeError` for a non-function callback or a non-iterable. `length` is `2`.\n- `withResolvers()`, like `Promise.withResolvers`: returns `{ promise, resolve, reject }` using the constructor it's called on (subclasses work).\n\nThen write `install({ arrayPrototype, objectConstructor, promiseConstructor })`. It adds only the **missing** methods, as non-enumerable, writable, configurable properties, and returns the names it installed (like `\"Array.prototype.at\"`).",
      "Напишіть у `src/polyfills.ts` три поліфіли, що поводяться як вбудовані методи:\n\n- `at(index)` викликається з `this` = масив, масивоподібний об'єкт чи рядок. Перетворюйте індекс як у специфікації (відкидайте дробову частину, `NaN` → 0, `±Infinity` лишаються нескінченними), рахуйте від'ємні індекси з кінця, повертайте `undefined` поза межами й кидайте `TypeError` для `this`, що дорівнює `null`/`undefined`. `at.name` дорівнює `\"at\"`, а `at.length` дорівнює `1`.\n- `groupBy(items, callback)` як `Object.groupBy`: приймає будь-який ітерований об'єкт, викликає `callback(value, index)`, перетворює ключі на ключі властивостей і повертає об'єкт із **прототипом null**. Вона кидає `TypeError` для колбека, що не є функцією, чи неітерованого значення. `length` дорівнює `2`.\n- `withResolvers()` як `Promise.withResolvers`: повертає `{ promise, resolve, reject }`, використовуючи конструктор, на якому її викликали (підкласи працюють).\n\nПотім напишіть `install({ arrayPrototype, objectConstructor, promiseConstructor })`. Вона додає лише **відсутні** методи як неперелічувані властивості, доступні для запису й налаштовувані, і повертає назви встановленого (на кшталт `\"Array.prototype.at\"`).",
    ],
    files: { "/src/polyfills.ts": POLY_STARTER, "/index.ts": POLY_INDEX },
    visibleFiles: ["/src/polyfills.ts", "/index.ts"],
    activeFile: "/src/polyfills.ts",
    tests: POLY_TESTS,
    solution: { "/src/polyfills.ts": POLY_SOLUTION },
    explanation: [
      "Spec compliance lives in the details: the abstract operations ToIntegerOrInfinity and ToLength explain every edge case of `at`, `Object(this)` makes it work on strings and array-likes, and a null-prototype result means keys like `\"toString\"` or `\"__proto__\"` can't clash with inherited properties. Matching `name` and `length` (plain function declarations with exactly the spec's parameters) keeps feature checks and introspection honest. `install` uses `Object.defineProperty` with `enumerable: false`, like real built-ins, and refuses to overwrite existing functions, so it never downgrades a native implementation.",
      "Відповідність специфікації живе в деталях: абстрактні операції ToIntegerOrInfinity і ToLength пояснюють кожен крайній випадок `at`, `Object(this)` змушує її працювати з рядками й масивоподібними об'єктами, а результат із прототипом null означає, що ключі на кшталт `\"toString\"` чи `\"__proto__\"` не можуть конфліктувати з успадкованими властивостями. Відповідність `name` і `length` (звичайні оголошення функцій саме з параметрами специфікації) тримає чесними перевірки можливостей та інтроспекцію. `install` використовує `Object.defineProperty` з `enumerable: false`, як справжні вбудовані методи, і відмовляється перезаписувати наявні функції, тож ніколи не погіршує нативну реалізацію.",
    ],
  }),
  practice({
    slug: "poly-compat-targets",
    skills: ["transpiling-polyfills", w("typescript")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Decide which polyfills a build needs", "Визначте, які поліфіли потрібні збиранню"],
    prompt: [
      "Tools like core-js-compat decide which polyfills to include from browser targets and compatibility data. Build a small version in `src/compat.ts`:\n\n- `parseTargets(query)` parses `\"chrome 90, Safari 15.4,firefox  100\"` into `{ browser, version }` objects with lowercase browser names, tolerating extra whitespace. Entries without a numeric version throw a `SyntaxError`.\n- `compareVersions(a, b)` compares dotted versions **numerically** segment by segment (`\"100\" > \"99\"`, `\"15.4\" < \"15.10\"`), treating missing segments as `0` (`\"15\"` equals `\"15.0\"`).\n- `requiredPolyfills(compat, targets)` returns the sorted features that at least one target doesn't support: its version is lower than the first supporting version, or the compatibility data doesn't mention that browser (assume unsupported).",
      "Інструменти на кшталт core-js-compat вирішують, які поліфіли включити, за цілями браузерів і даними сумісності. Побудуйте маленьку версію в `src/compat.ts`:\n\n- `parseTargets(query)` розбирає `\"chrome 90, Safari 15.4,firefox  100\"` в об'єкти `{ browser, version }` з назвами браузерів у нижньому регістрі, терплячи зайві пробіли. Записи без числової версії кидають `SyntaxError`.\n- `compareVersions(a, b)` порівнює версії з крапками **як числа** посегментно (`\"100\" > \"99\"`, `\"15.4\" < \"15.10\"`), вважаючи відсутні сегменти рівними `0` (`\"15\"` дорівнює `\"15.0\"`).\n- `requiredPolyfills(compat, targets)` повертає впорядковані можливості, які не підтримує хоча б одна ціль: її версія нижча за першу версію з підтримкою, або дані сумісності не згадують цей браузер (вважайте, що підтримки немає).",
    ],
    files: { "/src/compat.ts": COMPAT_STARTER, "/index.ts": COMPAT_INDEX },
    visibleFiles: ["/src/compat.ts", "/index.ts"],
    activeFile: "/src/compat.ts",
    tests: COMPAT_TESTS,
    solution: { "/src/compat.ts": COMPAT_SOLUTION },
    explanation: [
      "Version strings must be compared numerically per segment; string comparison puts `\"100\"` before `\"99\"` and `\"15.10\"` before `\"15.4\"`, a classic bug. Treating missing segments as zero makes `\"15\"` and `\"15.0\"` equal. When data is missing for a target browser, the safe default for polyfills is to include them: an unneeded polyfill costs bytes, while a missing one breaks the app. A strict parser that throws on malformed entries surfaces configuration mistakes at build time instead of silently shipping the wrong code.",
      "Рядки версій треба порівнювати як числа посегментно; порівняння рядків ставить `\"100\"` перед `\"99\"` і `\"15.10\"` перед `\"15.4\"`, і це класична помилка. Нульові значення для відсутніх сегментів роблять `\"15\"` і `\"15.0\"` рівними. Коли даних для цільового браузера немає, безпечне рішення для поліфілів полягає в тому, щоб їх включити: непотрібний поліфіл коштує байтів, а відсутній ламає застосунок. Суворий розбір, що кидає помилку на некоректних записах, показує помилки конфігурації під час збирання, а не мовчки постачає неправильний код.",
    ],
  }),
]);
