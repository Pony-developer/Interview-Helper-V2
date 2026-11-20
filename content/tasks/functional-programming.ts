import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const FN_STARTER = String.raw`type Fn = (x: any) => any;

/** pipe(f, g, h)(x) === h(g(f(x))) — left to right. */
export function pipe(...fns: Fn[]): Fn {
  // TODO
  return (x) => x;
}

/** compose(f, g, h)(x) === f(g(h(x))) — right to left. */
export function compose(...fns: Fn[]): Fn {
  // TODO
  return (x) => x;
}

/** curry((a, b, c) => …) can be called as f(a)(b)(c), f(a, b)(c), f(a)(b, c) or f(a, b, c). */
export function curry(fn: (...args: any[]) => any): any {
  // TODO
  return fn;
}
`;

const FN_SOLUTION = String.raw`type Fn = (x: any) => any;

export function pipe(...fns: Fn[]): Fn {
  return (x) => fns.reduce((value, f) => f(value), x);
}

export function compose(...fns: Fn[]): Fn {
  return (x) => fns.reduceRight((value, f) => f(value), x);
}

export function curry(fn: (...args: any[]) => any): any {
  // Each call returns a new function that remembers the arguments so far,
  // so partially applied versions never share state.
  const curried = (...args: any[]): any => (args.length >= fn.length ? fn(...args) : (...more: any[]) => curried(...args, ...more));
  return curried;
}
`;

const FN_INDEX = String.raw`import "./styles.css";
import { curry, pipe } from "./src/fn";

let slug: string;
try {
  const replace = curry((pattern: RegExp, replacement: string, s: string) => s.replace(pattern, replacement));
  const slugify = pipe(
    (s: string) => s.trim(),
    (s: string) => s.toLowerCase(),
    replace(/[^a-z0-9]+/g)("-"),
  );
  slug = slugify("  Functional Programming 101 ");
} catch (e) {
  slug = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Slug</h1><p><output id="slug">' + slug + "</output></p>";
`;

const FN_TESTS = String.raw`import { describe, it, expect, screen } from "./test-kit";
import { compose, curry, pipe } from "../src/fn";

const inc = (x) => x + 1;
const double = (x) => x * 2;

describe("pipe and compose", () => {
  it("pipe applies functions left to right", () => {
    expect(pipe(inc, double)(5)).toBe(12);
    expect(pipe(double, inc, String)(5)).toBe("11");
  });
  it("compose applies functions right to left", () => {
    expect(compose(inc, double)(5)).toBe(11);
  });
  it("with no functions, both return the input", () => {
    const obj = {};
    expect(pipe()(obj)).toBe(obj);
    expect(compose()(obj)).toBe(obj);
  });
  it("calls each function exactly once", () => {
    let calls = 0;
    const count = (x) => { calls++; return x; };
    pipe(count, count, count)(1);
    expect(calls).toBe(3);
  });
});

describe("curry", () => {
  const add3 = curry((a, b, c) => a + b + c);
  it("accepts arguments in any grouping", () => {
    expect(add3(1)(2)(3)).toBe(6);
    expect(add3(1, 2)(3)).toBe(6);
    expect(add3(1)(2, 3)).toBe(6);
    expect(add3(1, 2, 3)).toBe(6);
  });
  it("keeps partial applications independent", () => {
    const add1 = add3(1);
    const add1and2 = add1(2);
    expect(add1(10)(10)).toBe(21);
    expect(add1and2(3)).toBe(6);
    expect(add1and2(4)).toBe(7);
  });
  it("composes with pipe", () => {
    const multiply = curry((a, b) => a * b);
    const add = curry((a, b) => a + b);
    expect(pipe(multiply(2), add(1))(5)).toBe(11);
  });
  it("renders the demo", async () => {
    expect((await screen.findByText("functional-programming-101")).id).toBe("slug");
  });
});
`;

const IMMUT_STARTER = String.raw`export type Path = (string | number)[];

/** Returns a copy of obj with the value at path replaced. Must not mutate obj. */
export function setIn<T>(obj: T, path: Path, value: unknown): T {
  // TODO: this mutates the original object
  let target: any = obj;
  for (const key of path.slice(0, -1)) target = target[key] ??= {};
  target[path[path.length - 1]] = value;
  return obj;
}

/** Like setIn, but computes the new value from the current one. */
export function updateIn<T>(obj: T, path: Path, fn: (value: any) => any): T {
  let target: any = obj;
  for (const key of path.slice(0, -1)) target = target[key] ??= {};
  const last = path[path.length - 1];
  target[last] = fn(target[last]);
  return obj;
}
`;

const IMMUT_SOLUTION = String.raw`export type Path = (string | number)[];

export function updateIn<T>(obj: T, path: Path, fn: (value: any) => any): T {
  if (path.length === 0) return fn(obj);
  const [key, ...rest] = path;
  // Create missing containers: an array if the key is a number, otherwise an object.
  const container: any = obj ?? (typeof key === "number" ? [] : {});
  const current = container[key];
  const next = updateIn(current, rest, fn);
  // Nothing changed below: keep the original reference (no allocations, === still true).
  if (Object.is(current, next) && obj != null) return obj;
  const copy = Array.isArray(container) ? container.slice() : { ...container };
  copy[key] = next;
  return copy;
}

export function setIn<T>(obj: T, path: Path, value: unknown): T {
  return updateIn(obj, path, () => value);
}
`;

const IMMUT_INDEX = String.raw`import "./styles.css";
import { setIn, updateIn } from "./src/immutable";

const state = { cart: { items: [{ id: 1, qty: 1 }], coupon: null }, user: { name: "Ada" } };
const next = updateIn(setIn(state, ["user", "name"], "Ada L."), ["cart", "items", 0, "qty"], (q: number) => q + 1);
document.getElementById("app")!.innerHTML =
  "<h1>Immutable update</h1><pre>" + JSON.stringify(next, null, 2) + '</pre><p>Original untouched: <output id="same">' + (state.user.name === "Ada") + "</output></p>";
`;

const IMMUT_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { setIn, updateIn } from "../src/immutable";

const deepFreeze = (o) => {
  Object.values(o).forEach((v) => v && typeof v === "object" && deepFreeze(v));
  return Object.freeze(o);
};
const makeState = () => deepFreeze({ user: { name: "Ada", tags: ["a", "b"] }, settings: { theme: "dark" } });

describe("setIn / updateIn", () => {
  it("copies only the objects along the path", () => {
    const state = makeState();
    const next = setIn(state, ["user", "name"], "Bo");
    expect(next.user.name).toBe("Bo");
    expect(next === state).toBe(false);
    expect(next.user === state.user).toBe(false);
    expect(next.settings === state.settings).toBe(true);
    expect(next.user.tags === state.user.tags).toBe(true);
    expect(state.user.name).toBe("Ada");
  });
  it("keeps arrays as arrays", () => {
    const state = makeState();
    const next = setIn(state, ["user", "tags", 1], "z");
    expect(Array.isArray(next.user.tags)).toBe(true);
    expect(next.user.tags).toEqual(["a", "z"]);
    expect(state.user.tags).toEqual(["a", "b"]);
  });
  it("creates missing objects and arrays", () => {
    const next = setIn({}, ["a", "b", 0, "c"], 1);
    expect(next).toEqual({ a: { b: [{ c: 1 }] } });
    expect(Array.isArray(next.a.b)).toBe(true);
  });
  it("returns the same object when nothing changes", () => {
    const state = makeState();
    expect(setIn(state, ["user", "name"], "Ada") === state).toBe(true);
    expect(updateIn(state, ["settings", "theme"], (t) => t) === state).toBe(true);
  });
  it("updates from the current value", () => {
    const next = updateIn(deepFreeze({ count: { n: 1 } }), ["count", "n"], (n) => n + 1);
    expect(next).toEqual({ count: { n: 2 } });
  });
  it("replaces the whole value for an empty path", () => {
    expect(setIn(makeState(), [], 5)).toBe(5);
  });
});
`;

export default defineTasks([
  quiz(
    "fp-pure-function",
    ["functional-programming"],
    1,
    45,
    ["Which function is pure?", "Яка функція чиста?"],
    ["Which of these functions is pure?", "Яка з цих функцій чиста?"],
    [
      ["`const fullName = (u) => u.first + \" \" + u.last;`", "`const fullName = (u) => u.first + \" \" + u.last;`"],
      ["`const stamp = (o) => ({ ...o, at: Date.now() });`", "`const stamp = (o) => ({ ...o, at: Date.now() });`"],
      ["`const addTag = (tags, t) => { tags.push(t); return tags; };`", "`const addTag = (tags, t) => { tags.push(t); return tags; };`"],
      ["`const withTax = (price) => price * config.taxRate;`", "`const withTax = (price) => price * config.taxRate;`"],
    ],
    "a",
    [
      "A pure function depends only on its arguments and changes nothing outside itself. `stamp` reads the clock, `addTag` mutates its argument, and `withTax` reads mutable outside state (`config`), so the same input can give different results. Pass time and configuration in as arguments to make such functions pure.",
      "Чиста функція залежить лише від своїх аргументів і нічого не змінює поза собою. `stamp` читає годинник, `addTag` змінює свій аргумент, а `withTax` читає змінний зовнішній стан (`config`), тож однакові вхідні дані можуть дати різні результати. Передавайте час і конфігурацію аргументами, щоб такі функції стали чистими.",
    ],
  ),
  quiz(
    "fp-map-parseint",
    ["functional-programming", w("javascript")],
    2,
    60,
    ["`map(parseInt)`", "`map(parseInt)`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, NaN, NaN ]`", "`[ 1, NaN, NaN ]`"],
      ["`[ 1, 2, 3 ]`", "`[ 1, 2, 3 ]`"],
      ["`[ NaN, NaN, NaN ]`", "`[ NaN, NaN, NaN ]`"],
      ["`[ 1, 2, NaN ]`", "`[ 1, 2, NaN ]`"],
    ],
    "a",
    [
      "`map` calls its callback with `(item, index, array)`, and `parseInt` takes `(string, radix)`. So the calls are `parseInt(\"1\", 0)` (radix 0 means \"guess\": `1`), `parseInt(\"2\", 1)` (radix 1 is invalid: `NaN`) and `parseInt(\"3\", 2)` (`3` isn't a binary digit: `NaN`). Pass a function with the arity you mean: `map(Number)` or `map((s) => parseInt(s, 10))`.",
      "`map` викликає колбек з `(item, index, array)`, а `parseInt` приймає `(string, radix)`. Тож виклики такі: `parseInt(\"1\", 0)` (основа 0 означає «вгадати»: `1`), `parseInt(\"2\", 1)` (основа 1 недопустима: `NaN`) і `parseInt(\"3\", 2)` (`3` не є двійковою цифрою: `NaN`). Передавайте функцію з потрібною кількістю аргументів: `map(Number)` або `map((s) => parseInt(s, 10))`.",
    ],
    { code: 'console.log(["1", "2", "3"].map(parseInt));', codeLanguage: "js" },
  ),
  quiz(
    "fp-curried-add",
    ["functional-programming", w("closures-scope")],
    2,
    60,
    ["Curried functions", "Карровані функції"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`9 3`", "`9 3`"],
      ["`5 3`", "`5 3`"],
      ["`9 1`", "`9 1`"],
      ["A `TypeError`: `add(2)(3)` isn't a function", "`TypeError`: `add(2)(3)` не є функцією"],
    ],
    "a",
    [
      "`add` is curried: each call takes one argument and returns a function waiting for the next. `add(2)(3)` is a function that remembers `a = 2` and `b = 3` in its closure, so calling it with `4` gives `9`. Each chain creates its own closures, so `add(1)(1)(1)` is unaffected and gives `3`.",
      "`add` каррована: кожен виклик приймає один аргумент і повертає функцію, що чекає наступного. `add(2)(3)` є функцією, яка пам'ятає `a = 2` і `b = 3` у своєму замиканні, тож виклик із `4` дає `9`. Кожен ланцюжок створює власні замикання, тож `add(1)(1)(1)` від цього не залежить і дає `3`.",
    ],
    { code: "const add = (a) => (b) => (c) => a + b + c;\nconst add5 = add(2)(3);\nconsole.log(add5(4), add(1)(1)(1));", codeLanguage: "js" },
  ),
  quiz(
    "fp-immutable-update",
    ["functional-programming", w("state-management")],
    3,
    90,
    ["Updating nested state", "Оновлення вкладеного стану"],
    ["Which update changes `state.user.name` immutably, reusing everything else?", "Яке оновлення змінює `state.user.name` незмінно, повторно використовуючи все інше?"],
    [
      ["`({ ...state, user: { ...state.user, name: \"Bo\" } })`", "`({ ...state, user: { ...state.user, name: \"Bo\" } })`"],
      ["`state.user.name = \"Bo\"; return { ...state };`", "`state.user.name = \"Bo\"; return { ...state };`"],
      ["`Object.assign(state.user, { name: \"Bo\" })`", "`Object.assign(state.user, { name: \"Bo\" })`"],
      ["`({ ...state, name: \"Bo\" })`", "`({ ...state, name: \"Bo\" })`"],
    ],
    "a",
    [
      "Spread copies only the objects along the changed path (`state` and `state.user`) and keeps references to everything else, which is structural sharing. Option two mutates the old `user` before copying the top level, so both versions share the changed object. `Object.assign(state.user, …)` mutates in place, and the last option sets a different field.",
      "Spread копіює лише об'єкти вздовж зміненого шляху (`state` і `state.user`) і зберігає посилання на все інше: це спільне використання структури. Другий варіант змінює старий `user` перед копіюванням верхнього рівня, тож обидві версії ділять змінений об'єкт. `Object.assign(state.user, …)` змінює на місці, а останній варіант встановлює інше поле.",
    ],
  ),
  quiz(
    "fp-pipe-vs-compose",
    ["functional-programming"],
    3,
    90,
    ["pipe vs compose", "pipe проти compose"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`12 11`", "`12 11`"],
      ["`11 12`", "`11 12`"],
      ["`12 12`", "`12 12`"],
      ["`11 11`", "`11 11`"],
    ],
    "a",
    [
      "`pipe` applies functions left to right: `double(inc(5))` = `12`. `compose` applies them right to left, like mathematical composition: `inc(double(5))` = `11`. `pipe` usually reads more naturally for data transformations; `compose` matches how wrappers nest (`withA(withB(Component))`).",
      "`pipe` застосовує функції зліва направо: `double(inc(5))` = `12`. `compose` застосовує їх справа наліво, як математична композиція: `inc(double(5))` = `11`. `pipe` зазвичай природніше читається для перетворень даних; `compose` відповідає тому, як вкладаються обгортки (`withA(withB(Component))`).",
    ],
    {
      code: "const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);\nconst compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);\nconst inc = (x) => x + 1;\nconst double = (x) => x * 2;\nconsole.log(pipe(inc, double)(5), compose(inc, double)(5));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "fp-reduce-initial",
    ["functional-programming", w("arrays-strings")],
    3,
    90,
    ["reduce and its initial value", "reduce і початкове значення"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`6`, `[ 1, 2, 3 ]`, `TypeError`", "`6`, `[ 1, 2, 3 ]`, `TypeError`"],
      ["`6`, `[ 1, 2, 3 ]`, `undefined`", "`6`, `[ 1, 2, 3 ]`, `undefined`"],
      ["`6`, `[ [ 1, 2 ], [ 3 ] ]`, `TypeError`", "`6`, `[ [ 1, 2 ], [ 3 ] ]`, `TypeError`"],
      ["`NaN`, `[ 1, 2, 3 ]`, `0`", "`NaN`, `[ 1, 2, 3 ]`, `0`"],
    ],
    "a",
    [
      "Without an initial value, `reduce` uses the first element as the accumulator, which works for a non-empty sum. On an empty array there is nothing to start from, so it throws a `TypeError`. Passing an initial value (`[]`, `0`) makes `reduce` total and also fixes the accumulator's type.",
      "Без початкового значення `reduce` бере перший елемент як акумулятор, і для непорожньої суми це працює. Для порожнього масиву почати нема з чого, тож він кидає `TypeError`. Початкове значення (`[]`, `0`) робить `reduce` визначеним для будь-якого входу й фіксує тип акумулятора.",
    ],
    {
      code: "console.log([1, 2, 3].reduce((a, b) => a + b));\nconsole.log([[1, 2], [3]].reduce((acc, x) => acc.concat(x), []));\ntry {\n  [].reduce((a, b) => a + b);\n} catch (e) {\n  console.log(e.constructor.name);\n}",
      codeLanguage: "js",
    },
  ),
  quiz(
    "fp-mutating-sort",
    ["functional-programming", w("react")],
    4,
    120,
    ["`sort` vs `toSorted`", "`sort` проти `toSorted`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, 2, 3 ] true [ 3, 2, 1 ]`", "`[ 1, 2, 3 ] true [ 3, 2, 1 ]`"],
      ["`[ 3, 1, 2 ] false [ 2, 1, 3 ]`", "`[ 3, 1, 2 ] false [ 2, 1, 3 ]`"],
      ["`[ 1, 2, 3 ] false [ 3, 2, 1 ]`", "`[ 1, 2, 3 ] false [ 3, 2, 1 ]`"],
      ["`[ 3, 1, 2 ] true [ 3, 2, 1 ]`", "`[ 3, 1, 2 ] true [ 3, 2, 1 ]`"],
    ],
    "a",
    [
      "`sort` sorts **in place** and returns the same array, so `original` is changed and `sorted === original`. That's a classic React bug: sorting state or props directly mutates them and the reference doesn't change. `toReversed`, `toSorted`, `toSpliced` and `with` (ES2023) return new arrays and leave the original alone.",
      "`sort` сортує **на місці** й повертає той самий масив, тож `original` змінено, а `sorted === original`. Це класичний баг у React: пряме сортування стану чи пропсів їх мутує, а посилання не змінюється. `toReversed`, `toSorted`, `toSpliced` і `with` (ES2023) повертають нові масиви й не чіпають оригінал.",
    ],
    { code: "const original = [3, 1, 2];\nconst sorted = original.sort();\nconst reversed = original.toReversed();\nconsole.log(original, sorted === original, reversed);", codeLanguage: "js" },
  ),
  quiz(
    "fp-lazy-generators",
    ["functional-programming", w("javascript")],
    4,
    150,
    ["Lazy pipelines", "Ліниві конвеєри"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`gen 1`, `gen 2`, then `[ 10, 20 ]`", "`gen 1`, `gen 2`, потім `[ 10, 20 ]`"],
      ["It never finishes, because `naturals` is infinite", "Ніколи не завершиться, бо `naturals` нескінченний"],
      ["`gen 1`, `gen 2`, `gen 3`, then `[ 10, 20 ]`", "`gen 1`, `gen 2`, `gen 3`, потім `[ 10, 20 ]`"],
      ["`[ 10, 20 ]` first, then `gen 1` and `gen 2`", "Спершу `[ 10, 20 ]`, потім `gen 1` і `gen 2`"],
    ],
    "a",
    [
      "Generators are lazy: each stage pulls one value at a time from the previous one. `take` returns right after yielding the second item, so `naturals` is never asked for a third value, and the infinite loop is harmless. Eager array methods (`.map`, `.filter`) would need the whole list first. The logs appear before the result because spreading must finish before `console.log` runs.",
      "Генератори ліниві: кожен етап бере по одному значенню з попереднього. `take` завершується одразу після другого елемента, тож у `naturals` ніхто не просить третє значення, і нескінченний цикл нешкідливий. «Жадібним» методам масивів (`.map`, `.filter`) спершу потрібен увесь список. Записи з'являються перед результатом, бо spread має завершитися до виклику `console.log`.",
    ],
    {
      code: 'function* naturals() {\n  let n = 1;\n  while (true) {\n    console.log("gen", n);\n    yield n++;\n  }\n}\nfunction* map(it, f) {\n  for (const x of it) yield f(x);\n}\nfunction* take(it, n) {\n  if (n <= 0) return;\n  for (const x of it) {\n    yield x;\n    if (--n === 0) return;\n  }\n}\nconsole.log([...take(map(naturals(), (x) => x * 10), 2)]);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "fp-reduce-spread-cost",
    ["functional-programming", w("big-o")],
    5,
    150,
    ["A slow reduce", "Повільний reduce"],
    ["Indexing 50,000 items like this takes seconds. Why, and what's the fix?", "Індексування 50 000 елементів отак займає секунди. Чому і як виправити?"],
    [
      ["Each step copies the whole accumulator, so it's O(n²); use `Object.fromEntries(items.map(…))` or mutate a local accumulator", "Кожен крок копіює весь акумулятор, тож це O(n²); використайте `Object.fromEntries(items.map(…))` або змінюйте локальний акумулятор"],
      ["`reduce` is always slower than a `for` loop by a constant factor", "`reduce` завжди повільніший за цикл `for` на сталий множник"],
      ["Computed keys (`[item.id]`) are slow; use string concatenation", "Обчислювані ключі (`[item.id]`) повільні; використовуйте конкатенацію рядків"],
      ["The object becomes too big for V8 at 50,000 keys", "Об'єкт стає завеликим для V8 на 50 000 ключах"],
    ],
    "a",
    [
      "Spreading `acc` copies every key collected so far, so step *k* costs *k* and the total is about n²/2 copies. Immutability matters for values other code can see; the accumulator is created inside this expression and nobody else holds it, so mutating it (`acc[item.id] = item; return acc;`) keeps the function pure from the outside. `Object.fromEntries` or a `Map` are clean O(n) alternatives.",
      "Spread `acc` копіює всі зібрані досі ключі, тож крок *k* коштує *k*, а загалом виходить близько n²/2 копіювань. Незмінність важлива для значень, які бачить інший код; акумулятор створюється всередині цього виразу й більше ніхто його не тримає, тож його зміна (`acc[item.id] = item; return acc;`) лишає функцію чистою ззовні. `Object.fromEntries` або `Map` є охайними альтернативами за O(n).",
    ],
    { code: "const byId = items.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});", codeLanguage: "js" },
  ),
  practice({
    slug: "fp-pipe-curry",
    skills: ["functional-programming", w("closures-scope"), w("typescript")],
    complexity: 2,
    estSeconds: 900,
    framework: "vanilla-ts",
    title: ["pipe, compose and curry", "pipe, compose і curry"],
    prompt: [
      "Implement three functional helpers in `src/fn.ts`:\n\n- **`pipe(...fns)`** returns a function that passes its input through `fns` **left to right**; with no functions it returns the input unchanged.\n- **`compose(...fns)`** does the same **right to left**.\n- **`curry(fn)`** collects arguments until it has `fn.length` of them, then calls `fn`. It must accept any grouping (`f(1)(2)(3)`, `f(1, 2)(3)`, `f(1)(2, 3)`, `f(1, 2, 3)`), and partial applications must be independent, so `const add1 = add3(1)` can be reused.\n\nThe demo builds a `slugify` function out of small pieces.",
      "Реалізуйте три функціональні помічники в `src/fn.ts`:\n\n- **`pipe(...fns)`** повертає функцію, що пропускає вхід крізь `fns` **зліва направо**; без функцій повертає вхід без змін.\n- **`compose(...fns)`** робить те саме **справа наліво**.\n- **`curry(fn)`** збирає аргументи, доки їх не стане `fn.length`, а потім викликає `fn`. Вона має приймати будь-яке групування (`f(1)(2)(3)`, `f(1, 2)(3)`, `f(1)(2, 3)`, `f(1, 2, 3)`), а часткові застосування мають бути незалежними, щоб `const add1 = add3(1)` можна було використовувати повторно.\n\nДемо збирає функцію `slugify` з невеликих частин.",
    ],
    files: { "/src/fn.ts": FN_STARTER, "/index.ts": FN_INDEX },
    visibleFiles: ["/src/fn.ts", "/index.ts"],
    activeFile: "/src/fn.ts",
    tests: FN_TESTS,
    solution: { "/src/fn.ts": FN_SOLUTION },
    explanation: [
      "`pipe` and `compose` are a single `reduce`/`reduceRight` over the functions, with the input as the initial value (so an empty list is the identity). `curry` returns a function that either calls `fn` once enough arguments have arrived, or returns a new function closing over the arguments so far. Because nothing is stored in shared variables, every partial application is its own closure.",
      "`pipe` і `compose` є одним `reduce`/`reduceRight` по функціях із вхідним значенням як початковим (тож порожній список дає тотожну функцію). `curry` повертає функцію, яка або викликає `fn`, щойно аргументів достатньо, або повертає нову функцію, що замикає вже отримані аргументи. Оскільки нічого не зберігається в спільних змінних, кожне часткове застосування є окремим замиканням.",
    ],
  }),
  practice({
    slug: "fp-set-in",
    skills: ["functional-programming", w("state-management"), w("recursion")],
    complexity: 3,
    estSeconds: 1080,
    framework: "vanilla-ts",
    title: ["Immutable deep updates", "Незмінні глибокі оновлення"],
    prompt: [
      "`setIn` and `updateIn` in `src/immutable.ts` mutate their input, which breaks change detection in React and Redux. Rewrite them as immutable updates with **structural sharing**:\n\n- `setIn(obj, path, value)` returns a new root with the value at `path` replaced; `updateIn(obj, path, fn)` sets it to `fn(currentValue)`.\n- Copy **only** the objects and arrays along the path; every untouched branch keeps its reference. Arrays stay arrays.\n- Create missing containers on the way: an array when the key is a number, otherwise an object.\n- If the new value is the same (`Object.is`) as the old one, return the **original** object.\n- An empty path replaces the whole value.\n- Never mutate the input (the tests deep-freeze it).",
      "`setIn` і `updateIn` у `src/immutable.ts` змінюють вхідні дані, що ламає виявлення змін у React і Redux. Перепишіть їх як незмінні оновлення зі **спільним використанням структури**:\n\n- `setIn(obj, path, value)` повертає новий корінь, де значення за `path` замінено; `updateIn(obj, path, fn)` встановлює його в `fn(currentValue)`.\n- Копіюйте **лише** об'єкти й масиви вздовж шляху; кожна незачеплена гілка зберігає своє посилання. Масиви лишаються масивами.\n- Створюйте відсутні контейнери дорогою: масив, коли ключ є числом, інакше об'єкт.\n- Якщо нове значення те саме (`Object.is`), що й старе, поверніть **початковий** об'єкт.\n- Порожній шлях замінює все значення.\n- Ніколи не змінюйте вхідні дані (тести глибоко їх заморожують).",
    ],
    files: { "/src/immutable.ts": IMMUT_STARTER, "/index.ts": IMMUT_INDEX },
    visibleFiles: ["/src/immutable.ts", "/index.ts"],
    activeFile: "/src/immutable.ts",
    tests: IMMUT_TESTS,
    solution: { "/src/immutable.ts": IMMUT_SOLUTION },
    explanation: [
      "Recursing one key at a time means each level copies just its own container and plugs in the updated child, so siblings are shared for free. Checking `Object.is(current, next)` on the way back up returns original references when nothing changed, which keeps `===` comparisons (and memoised selectors) meaningful. This is the core of what Immer and Redux Toolkit do for you.",
      "Рекурсія по одному ключу означає, що кожен рівень копіює лише власний контейнер і вставляє оновлену дитину, тож сусідні гілки спільні без зусиль. Перевірка `Object.is(current, next)` на зворотному шляху повертає початкові посилання, коли нічого не змінилося, що зберігає сенс порівнянь `===` (і мемоізованих селекторів). Саме це в основі того, що за вас роблять Immer і Redux Toolkit.",
    ],
  }),
]);
