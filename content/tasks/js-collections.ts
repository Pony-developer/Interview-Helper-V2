import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const MEMO_STARTER = String.raw`/**
 * Caches fn's results by its arguments: any number of them, of any type.
 * memoized.clear() empties the cache.
 */
export function memoize<A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) & { clear(): void } {
  // TODO: JSON.stringify confuses NaN with null, compares objects by value and can't hold functions
  let cache = new Map<string, R>();
  const memoized = (...args: A): R => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
  return Object.assign(memoized, { clear: () => (cache = new Map()) });
}
`;

const MEMO_SOLUTION = String.raw`// One trie node per argument position. Objects go in a WeakMap so cached entries
// don't keep them alive; primitives go in a Map (SameValueZero: NaN finds NaN).
class Node {
  primitives = new Map<unknown, Node>();
  objects = new WeakMap<object, Node>();
  hasResult = false;
  result: unknown;

  child(key: unknown): Node {
    const isObject = (typeof key === "object" && key !== null) || typeof key === "function";
    const store: Map<unknown, Node> | WeakMap<object, Node> = isObject ? this.objects : this.primitives;
    let next = (store as Map<unknown, Node>).get(key);
    if (!next) {
      next = new Node();
      (store as Map<unknown, Node>).set(key, next);
    }
    return next;
  }
}

export function memoize<A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) & { clear(): void } {
  let root = new Node();
  const memoized = (...args: A): R => {
    // The argument count is the first key, so f(1) and f(1, undefined) are different calls.
    let node = root.child(args.length);
    for (const arg of args) node = node.child(arg);
    if (node.hasResult) return node.result as R;
    const result = fn(...args); // if this throws, nothing is cached
    node.result = result;
    node.hasResult = true;
    return result;
  };
  return Object.assign(memoized, {
    clear() {
      root = new Node();
    },
  });
}
`;

const MEMO_INDEX = String.raw`import "./styles.css";
import { memoize } from "./src/memoize";

let calls = 0;
const describe = memoize((value: unknown, options?: object) => {
  calls++;
  return String(value) + (options ? " with options" : "");
});
const opts = { verbose: true };
const results = [describe(NaN), describe(NaN), describe(null), describe(1, opts), describe(1, opts), describe(1, { verbose: true })];
document.getElementById("app")!.innerHTML = '<h1>Memoize</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = results.join("\n") + "\n\ncalls: " + calls + " (expected 4)";
`;

const MEMO_TESTS = String.raw`import { describe, it, expect, fn } from "./test-kit";
import { memoize } from "../src/memoize";

describe("memoize", () => {
  it("caches by all arguments", () => {
    const add = fn((a, b) => a + b);
    const m = memoize(add);
    expect(m(1, 2)).toBe(3);
    expect(m(1, 2)).toBe(3);
    expect(m(2, 1)).toBe(3);
    expect(add).toHaveBeenCalledTimes(2);
  });
  it("tells NaN, null and undefined apart, and finds NaN again", () => {
    const spy = fn((x) => String(x));
    const m = memoize(spy);
    expect(m(NaN)).toBe("NaN");
    expect(m(null)).toBe("null");
    expect(m(undefined)).toBe("undefined");
    m(NaN);
    expect(spy).toHaveBeenCalledTimes(3);
  });
  it("tells strings and numbers apart", () => {
    const spy = fn((x) => typeof x);
    const m = memoize(spy);
    expect(m(1)).toBe("number");
    expect(m("1")).toBe("string");
  });
  it("compares objects and functions by reference", () => {
    const spy = fn((o) => Object.keys(o).length);
    const m = memoize(spy);
    const a = { x: 1 };
    m(a);
    m(a);
    m({ x: 1 });
    const cb = () => {};
    m(cb);
    m(cb);
    expect(spy).toHaveBeenCalledTimes(3);
  });
  it("treats different argument counts as different calls", () => {
    const spy = fn((...args) => args.length);
    const m = memoize(spy);
    expect(m(1)).toBe(1);
    expect(m(1, undefined)).toBe(2);
    expect(m()).toBe(0);
    expect(spy).toHaveBeenCalledTimes(3);
  });
  it("caches undefined results", () => {
    const spy = fn(() => undefined);
    const m = memoize(spy);
    m("a");
    m("a");
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("doesn't cache errors", () => {
    let fail = true;
    const m = memoize((x) => {
      if (fail) throw new Error("boom");
      return x * 2;
    });
    expect(() => m(2)).toThrow("boom");
    fail = false;
    expect(m(2)).toBe(4);
  });
  it("clear() empties the cache", () => {
    const spy = fn((x) => x);
    const m = memoize(spy);
    m(1);
    m.clear();
    m(1);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
`;

const TAGS_STARTER = String.raw`export type Query = { all?: string[]; any?: string[]; none?: string[] };

/** An inverted index from tags to item ids. */
export class TagIndex {
  // TODO: an array scan is O(items × tags) per query, and most methods are missing
  private items: { id: string; tags: string[] }[] = [];

  add(id: string, tags: Iterable<string>): void {
    this.items.push({ id, tags: [...tags] });
  }
  untag(id: string, tag: string): void {}
  remove(id: string): void {}

  /** Ids (in the order they were first added) that match the query. */
  query({ all = [] }: Query = {}): string[] {
    return this.items.filter((item) => all.every((t) => item.tags.includes(t))).map((item) => item.id);
  }

  /** [tag, count] pairs, most used first, ties by name. */
  tags(): [string, number][] {
    return [];
  }
}
`;

const TAGS_SOLUTION = String.raw`export type Query = { all?: string[]; any?: string[]; none?: string[] };

export class TagIndex {
  // Two maps of Sets: id → its tags, and tag → its ids. Map keeps insertion order for ids.
  #tagsById = new Map<string, Set<string>>();
  #idsByTag = new Map<string, Set<string>>();

  add(id: string, tags: Iterable<string>): void {
    if (!this.#tagsById.has(id)) this.#tagsById.set(id, new Set());
    const own = this.#tagsById.get(id)!;
    for (const tag of tags) {
      own.add(tag);
      if (!this.#idsByTag.has(tag)) this.#idsByTag.set(tag, new Set());
      this.#idsByTag.get(tag)!.add(id);
    }
  }

  untag(id: string, tag: string): void {
    this.#tagsById.get(id)?.delete(tag);
    const ids = this.#idsByTag.get(tag);
    if (!ids) return;
    ids.delete(id);
    if (ids.size === 0) this.#idsByTag.delete(tag);
  }

  remove(id: string): void {
    for (const tag of this.#tagsById.get(id) ?? []) this.untag(id, tag);
    this.#tagsById.delete(id);
  }

  query({ all = [], any = [], none = [] }: Query = {}): string[] {
    const idsFor = (tag: string) => this.#idsByTag.get(tag) ?? new Set<string>();
    const result: string[] = [];
    for (const id of this.#tagsById.keys()) {
      if (!all.every((tag) => idsFor(tag).has(id))) continue;
      if (any.length > 0 && !any.some((tag) => idsFor(tag).has(id))) continue;
      if (none.some((tag) => idsFor(tag).has(id))) continue;
      result.push(id);
    }
    return result;
  }

  tags(): [string, number][] {
    return [...this.#idsByTag]
      .map(([tag, ids]): [string, number] => [tag, ids.size])
      .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  }
}
`;

const TAGS_INDEX = String.raw`import "./styles.css";
import { TagIndex } from "./src/tags";

const index = new TagIndex();
index.add("post-1", ["js", "react"]);
index.add("post-2", ["js", "node"]);
index.add("post-3", ["css"]);
const lines = [
  "js: " + index.query({ all: ["js"] }).join(", "),
  "js but not react: " + index.query({ all: ["js"], none: ["react"] }).join(", "),
  "react or css: " + index.query({ any: ["react", "css"] }).join(", "),
  "tags: " + JSON.stringify(index.tags()),
];
document.getElementById("app")!.innerHTML = '<h1>Tag index</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const TAGS_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { TagIndex } from "../src/tags";

function sample() {
  const index = new TagIndex();
  index.add("a", ["js", "react", "frontend"]);
  index.add("b", ["js", "node", "backend"]);
  index.add("c", ["css", "frontend"]);
  index.add("d", ["js", "frontend", "vue"]);
  return index;
}

describe("TagIndex", () => {
  it("finds items with all of the tags, in insertion order", () => {
    expect(sample().query({ all: ["js", "frontend"] })).toEqual(["a", "d"]);
  });
  it("supports any and none", () => {
    const index = sample();
    expect(index.query({ any: ["react", "css"] })).toEqual(["a", "c"]);
    expect(index.query({ all: ["js"], none: ["react", "vue"] })).toEqual(["b"]);
    expect(index.query({ none: ["js"] })).toEqual(["c"]);
  });
  it("returns everything for an empty query and nothing for unknown tags", () => {
    const index = sample();
    expect(index.query()).toEqual(["a", "b", "c", "d"]);
    expect(index.query({ all: ["rust"] })).toEqual([]);
    expect(index.query({ any: ["rust"] })).toEqual([]);
  });
  it("merges tags when an item is added again, without duplicates", () => {
    const index = sample();
    index.add("c", ["css", "tailwind"]);
    expect(index.query({ all: ["tailwind", "frontend"] })).toEqual(["c"]);
    expect(index.tags().find(([t]) => t === "css")).toEqual(["css", 1]);
  });
  it("counts tags, most used first, ties by name", () => {
    expect(sample().tags()).toEqual([
      ["frontend", 3],
      ["js", 3],
      ["backend", 1],
      ["css", 1],
      ["node", 1],
      ["react", 1],
      ["vue", 1],
    ]);
  });
  it("untags and removes items, dropping tags nobody uses", () => {
    const index = sample();
    index.untag("a", "react");
    expect(index.query({ any: ["react"] })).toEqual([]);
    expect(index.tags().some(([t]) => t === "react")).toBe(false);
    index.remove("b");
    expect(index.query({ all: ["js"] })).toEqual(["a", "d"]);
    expect(index.tags().some(([t]) => t === "node")).toBe(false);
    expect(index.query()).toEqual(["a", "c", "d"]);
  });
  it("handles many items quickly", () => {
    const index = new TagIndex();
    for (let i = 0; i < 20000; i++) index.add("item-" + i, ["t" + (i % 10), "g" + (i % 7)]);
    const start = performance.now();
    let found = 0;
    for (let q = 0; q < 20; q++) found += index.query({ all: ["t3", "g5"] }).length;
    expect(found).toBe(20 * 286);
    expect(performance.now() - start).toBeLessThan(1500);
  });
});
`;

export default defineTasks([
  quiz(
    "col-same-value-zero",
    ["js-collections"],
    1,
    45,
    ["How does a Set compare values?", "Як Set порівнює значення?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`3`", "`3`"],
      ["`5`", "`5`"],
      ["`4`", "`4`"],
      ["`2`", "`2`"],
    ],
    "a",
    [
      "`Set` and `Map` use SameValueZero: like `===`, except that `NaN` equals `NaN`. So the two `NaN`s collapse into one, `0` and `-0` are the same, and the string `\"0\"` is different from the number `0`: `NaN`, `0`, `\"0\"`.",
      "`Set` і `Map` використовують SameValueZero: як `===`, але `NaN` дорівнює `NaN`. Тож два `NaN` зливаються в один, `0` і `-0` однакові, а рядок `\"0\"` відрізняється від числа `0`: `NaN`, `0`, `\"0\"`.",
    ],
    { code: 'console.log(new Set([NaN, NaN, 0, -0, "0"]).size);', codeLanguage: "js" },
  ),
  quiz(
    "col-object-keys-by-reference",
    ["js-collections"],
    2,
    60,
    ["Objects as Map keys", "Об'єкти як ключі Map"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`2 undefined`", "`2 undefined`"],
      ["`1 b`", "`1 b`"],
      ["`2 b`", "`2 b`"],
      ["`1 undefined`", "`1 undefined`"],
    ],
    "a",
    [
      "Object keys are compared **by reference**. Each `{ id: 1 }` literal is a new object, so the map holds two entries, and `get` with a third new object finds neither. Keep the original reference, or key by a primitive like the `id`.",
      "Ключі-об'єкти порівнюються **за посиланням**. Кожен літерал `{ id: 1 }` є новим об'єктом, тож мапа містить два записи, а `get` із третім новим об'єктом не знаходить жодного. Зберігайте початкове посилання або використовуйте ключем примітив, як-от `id`.",
    ],
    { code: 'const m = new Map();\nm.set({ id: 1 }, "a");\nm.set({ id: 1 }, "b");\nconsole.log(m.size, m.get({ id: 1 }));', codeLanguage: "js" },
  ),
  quiz(
    "col-object-as-dictionary",
    ["js-collections", w("type-coercion")],
    2,
    75,
    ["Objects as keys of a plain object", "Об'єкти як ключі звичайного об'єкта"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`2 [ '[object Object]' ]`", "`2 [ '[object Object]' ]`"],
      ["`1 [ 'a', 'b' ]`", "`1 [ 'a', 'b' ]`"],
      ["`1 [ '[object Object]' ]`", "`1 [ '[object Object]' ]`"],
      ["A `TypeError`: object keys must be strings", "`TypeError`: ключі об'єкта мають бути рядками"],
    ],
    "a",
    [
      "Plain-object keys are strings (or symbols), so both objects are converted to the same string `\"[object Object]\"` and the second write overwrites the first. That's the main reason to use a `Map` (or `WeakMap`) when keys are objects.",
      "Ключі звичайного об'єкта є рядками (чи символами), тож обидва об'єкти перетворюються на той самий рядок `\"[object Object]\"`, і другий запис перезаписує перший. Це головна причина використовувати `Map` (чи `WeakMap`), коли ключі є об'єктами.",
    ],
    { code: "const o = {};\nconst a = { x: 1 };\nconst b = { y: 2 };\no[a] = 1;\no[b] = 2;\nconsole.log(o[a], Object.keys(o));", codeLanguage: "js" },
  ),
  quiz(
    "col-json-map",
    ["js-collections"],
    2,
    60,
    ["Serialising a Map", "Серіалізація Map"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`{} {\"a\":1} [[\"a\",1]]`", "`{} {\"a\":1} [[\"a\",1]]`"],
      ["`{\"a\":1} {\"a\":1} [[\"a\",1]]`", "`{\"a\":1} {\"a\":1} [[\"a\",1]]`"],
      ["`[[\"a\",1]] {\"a\":1} [[\"a\",1]]`", "`[[\"a\",1]] {\"a\":1} [[\"a\",1]]`"],
      ["A `TypeError`: Maps can't be serialised", "`TypeError`: Map не можна серіалізувати"],
    ],
    "a",
    [
      "A `Map` keeps its entries in internal slots, not properties, so `JSON.stringify` sees an object with no enumerable properties: `{}`. That silently drops data in API responses and `localStorage`. Convert explicitly: `Object.fromEntries(map)` for string keys, or `[...map]` to keep entries of any key type.",
      "`Map` тримає записи у внутрішніх слотах, а не у властивостях, тож `JSON.stringify` бачить об'єкт без перелічуваних властивостей: `{}`. Це мовчки втрачає дані у відповідях API і `localStorage`. Перетворюйте явно: `Object.fromEntries(map)` для рядкових ключів або `[...map]`, щоб зберегти записи з ключами будь-якого типу.",
    ],
    { code: 'const m = new Map([["a", 1]]);\nconsole.log(JSON.stringify(m), JSON.stringify(Object.fromEntries(m)), JSON.stringify([...m]));', codeLanguage: "js" },
  ),
  quiz(
    "col-key-order",
    ["js-collections"],
    3,
    90,
    ["Key order in Maps and objects", "Порядок ключів у Map і об'єктах"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'b', 'a' ] [ '1', '2', 'b', 'a' ]`", "`[ 'b', 'a' ] [ '1', '2', 'b', 'a' ]`"],
      ["`[ 'a', 'b' ] [ 'b', '2', 'a', '1' ]`", "`[ 'a', 'b' ] [ 'b', '2', 'a', '1' ]`"],
      ["`[ 'b', 'a' ] [ 'b', '2', 'a', '1' ]`", "`[ 'b', 'a' ] [ 'b', '2', 'a', '1' ]`"],
      ["`[ 'a', 'b' ] [ '1', '2', 'a', 'b' ]`", "`[ 'a', 'b' ] [ '1', '2', 'a', 'b' ]`"],
    ],
    "a",
    [
      "A `Map` keeps pure insertion order: re-setting `b` keeps its position, while deleting and re-adding `a` moves it to the end (the trick LRU caches use). Plain objects list integer-like keys first in ascending order, then string keys in insertion order, which surprises people who use numeric ids as keys.",
      "`Map` зберігає чистий порядок вставлення: повторне присвоєння `b` зберігає його позицію, а видалення й повторне додавання `a` переносить його в кінець (цей прийом використовують LRU-кеші). Звичайні об'єкти спершу перелічують цілочисельні ключі за зростанням, а потім рядкові в порядку вставлення, і це дивує тих, хто використовує числові id як ключі.",
    ],
    { code: 'const m = new Map([["b", 1], ["a", 2]]);\nm.set("b", 3);\nm.delete("a");\nm.set("a", 4);\nconst o = { b: 1, 2: "x", a: 2, 1: "y" };\nconsole.log([...m.keys()], Object.keys(o));', codeLanguage: "js" },
  ),
  quiz(
    "col-live-iteration",
    ["js-collections", w("iterators-generators")],
    3,
    90,
    ["Adding to a Set while iterating it", "Додавання в Set під час перебору"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, 2, 3, 4 ]`", "`[ 1, 2, 3, 4 ]`"],
      ["`[ 1, 2 ]`", "`[ 1, 2 ]`"],
      ["It loops forever", "Нескінченний цикл"],
      ["A `TypeError`: the Set was modified during iteration", "`TypeError`: Set змінено під час перебору"],
    ],
    "a",
    [
      "Map and Set iterators are **live**: entries added during iteration are visited too (and entries deleted before they're reached are skipped). Here each visit adds the next number until `x < 4` is false, so the loop ends after 4. Unlike Java, there's no concurrent-modification error, so a careless loop can run forever if it keeps adding new values.",
      "Ітератори Map і Set **живі**: записи, додані під час перебору, теж відвідуються (а записи, видалені до того, як до них дійшли, пропускаються). Тут кожне відвідування додає наступне число, доки `x < 4` не стане хибним, тож цикл завершується після 4. На відміну від Java, помилки одночасної зміни немає, тож необережний цикл може працювати вічно, якщо постійно додає нові значення.",
    ],
    { code: "const s = new Set([1]);\nfor (const x of s) {\n  if (x < 4) s.add(x + 1);\n}\nconsole.log([...s]);", codeLanguage: "js" },
  ),
  quiz(
    "col-weakmap-api",
    ["js-collections"],
    3,
    90,
    ["What a WeakMap can't do", "Чого не вміє WeakMap"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'undefined', 'undefined', 'TypeError' ]`", "`[ 'undefined', 'undefined', 'TypeError' ]`"],
      ["`[ 'number', 'function', 'TypeError' ]`", "`[ 'number', 'function', 'TypeError' ]`"],
      ["`[ 'number', 'function', 'ok' ]`", "`[ 'number', 'function', 'ok' ]`"],
      ["`[ 'undefined', 'undefined', 'ok' ]`", "`[ 'undefined', 'undefined', 'ok' ]`"],
    ],
    "a",
    [
      "A `WeakMap` has no `size` and isn't iterable, because its contents depend on when the garbage collector runs: exposing them would make programs non-deterministic. Its keys must be objects (or non-registered symbols), since a primitive like `\"key\"` can always be recreated and so could never be collected; `set` throws a `TypeError`.",
      "`WeakMap` не має `size` і не ітерований, бо його вміст залежить від того, коли спрацює збирач сміття: показ вмісту зробив би програми недетермінованими. Його ключами мають бути об'єкти (чи незареєстровані символи), бо примітив на кшталт `\"key\"` завжди можна створити знову, тож його ніколи не можна було б прибрати; `set` кидає `TypeError`.",
    ],
    { code: 'const wm = new WeakMap();\nconst out = [typeof wm.size, typeof wm[Symbol.iterator]];\ntry {\n  wm.set("key", 1);\n  out.push("ok");\n} catch (e) {\n  out.push(e.constructor.name);\n}\nconsole.log(out);', codeLanguage: "js" },
  ),
  quiz(
    "col-set-methods",
    ["js-collections"],
    3,
    90,
    ["Set algebra methods", "Методи алгебри множин"],
    ["This runs in a modern engine (ES2025). What does it print?", "Код виконується в сучасному рушії (ES2025). Що він виведе?"],
    [
      ["`[ 2, 3 ] [ 1 ] [ 1, 4 ] true`", "`[ 2, 3 ] [ 1 ] [ 1, 4 ] true`"],
      ["`[ 2, 3 ] [ 1, 4 ] [ 1, 4 ] true`", "`[ 2, 3 ] [ 1, 4 ] [ 1, 4 ] true`"],
      ["`[ 1, 2, 3, 4 ] [ 1 ] [ 1, 4 ] false`", "`[ 1, 2, 3, 4 ] [ 1 ] [ 1, 4 ] false`"],
      ["`[ 2, 3 ] [ 4 ] [ 1, 4 ] true`", "`[ 2, 3 ] [ 4 ] [ 1, 4 ] true`"],
    ],
    "a",
    [
      "`intersection` keeps values in both sets, `difference` keeps values of `a` that aren't in `b` (it's not symmetric), and `symmetricDifference` keeps values in exactly one of them. `isSubsetOf` checks that every value of `a` is in the argument. These methods return new Sets and replace the old `[...a].filter((x) => b.has(x))` idioms.",
      "`intersection` залишає значення, що є в обох множинах, `difference` залишає значення `a`, яких немає в `b` (вона не симетрична), а `symmetricDifference` залишає значення, що є рівно в одній з них. `isSubsetOf` перевіряє, що кожне значення `a` є в аргументі. Ці методи повертають нові Set і замінюють старі ідіоми `[...a].filter((x) => b.has(x))`.",
    ],
    { code: "const a = new Set([1, 2, 3]);\nconst b = new Set([2, 3, 4]);\nconsole.log([...a.intersection(b)], [...a.difference(b)], [...a.symmetricDifference(b)], a.isSubsetOf(new Set([1, 2, 3, 4])));", codeLanguage: "js" },
  ),
  quiz(
    "col-typed-array-overflow",
    ["js-collections", w("js-values-grammar")],
    3,
    90,
    ["Typed array conversions", "Перетворення в типізованих масивах"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 255, 0, 255, 3 ] [ 255, 0, 2 ]`", "`[ 255, 0, 255, 3 ] [ 255, 0, 2 ]`"],
      ["`[ 255, 255, 0, 4 ] [ 255, 0, 2 ]`", "`[ 255, 255, 0, 4 ] [ 255, 0, 2 ]`"],
      ["`[ 255, 256, -1, 3.7 ] [ 300, -5, 1.5 ]`", "`[ 255, 256, -1, 3.7 ] [ 300, -5, 1.5 ]`"],
      ["`[ 255, 0, 255, 3 ] [ 44, 251, 1 ]`", "`[ 255, 0, 255, 3 ] [ 44, 251, 1 ]`"],
    ],
    "a",
    [
      "Typed arrays convert every value to their element type. `Uint8Array` takes values modulo 256 after dropping the fraction (`256` → `0`, `-1` → `255`, `3.7` → `3`). `Uint8ClampedArray`, made for canvas pixel data, clamps to 0–255 and rounds half to even (`1.5` → `2`). Neither throws on bad input, so validate data before writing it.",
      "Типізовані масиви перетворюють кожне значення на тип свого елемента. `Uint8Array` бере значення за модулем 256 після відкидання дробової частини (`256` → `0`, `-1` → `255`, `3.7` → `3`). `Uint8ClampedArray`, створений для пікселів canvas, обмежує значення діапазоном 0–255 і округлює половину до парного (`1.5` → `2`). Жоден не кидає помилку на хибних даних, тож перевіряйте дані перед записом.",
    ],
    { code: "const u8 = new Uint8Array([255, 256, -1, 3.7]);\nconst clamped = new Uint8ClampedArray([300, -5, 1.5]);\nconsole.log([...u8], [...clamped]);", codeLanguage: "js" },
  ),
  quiz(
    "col-subarray-vs-slice",
    ["js-collections"],
    4,
    120,
    ["`subarray` vs `slice`", "`subarray` проти `slice`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`9 2 true false`", "`9 2 true false`"],
      ["`2 2 false false`", "`2 2 false false`"],
      ["`9 9 true true`", "`9 9 true true`"],
      ["`2 9 false true`", "`2 9 false true`"],
    ],
    "a",
    [
      "`subarray` creates a new **view** over the same `ArrayBuffer`, so writes to the original show through it. `slice` **copies** the bytes into a new buffer. Views are what make zero-copy parsing of binary data possible (and also what makes accidental sharing bugs possible).",
      "`subarray` створює нове **представлення** того самого `ArrayBuffer`, тож записи в початковий масив видно через нього. `slice` **копіює** байти в новий буфер. Представлення роблять можливим розбір бінарних даних без копіювання (і так само роблять можливими помилки через випадкове спільне використання).",
    ],
    { code: "const a = new Uint8Array([1, 2, 3, 4]);\nconst view = a.subarray(1, 3);\nconst copy = a.slice(1, 3);\na[1] = 9;\nconsole.log(view[0], copy[0], view.buffer === a.buffer, copy.buffer === a.buffer);", codeLanguage: "js" },
  ),
  quiz(
    "col-weakmap-use",
    ["js-collections", w("js-engine-performance")],
    3,
    90,
    ["Caching data per DOM node", "Кешування даних для вузлів DOM"],
    [
      "A UI library caches measurements per element: `const cache = new Map(); function measure(el) { if (!cache.has(el)) cache.set(el, el.getBoundingClientRect()); return cache.get(el); }`. Elements are created and removed all the time. What's the problem, and the best fix?",
      "Бібліотека інтерфейсу кешує виміри для кожного елемента: `const cache = new Map(); function measure(el) { if (!cache.has(el)) cache.set(el, el.getBoundingClientRect()); return cache.get(el); }`. Елементи постійно створюються й видаляються. У чому проблема і яке найкраще виправлення?",
    ],
    [
      ["The Map keeps removed elements alive forever; use a `WeakMap`, so entries go away when an element is no longer referenced", "Map тримає видалені елементи живими назавжди; використайте `WeakMap`, щоб записи зникали, коли на елемент більше ніщо не посилається"],
      ["DOM elements can't be Map keys; use `el.id` as the key", "Елементи DOM не можуть бути ключами Map; використайте ключем `el.id`"],
      ["Nothing is wrong: the browser removes Map entries when elements are removed", "Усе гаразд: браузер видаляє записи Map, коли видаляються елементи"],
      ["Use a `WeakSet`, because it's faster than a Map", "Використайте `WeakSet`, бо він швидший за Map"],
    ],
    "a",
    [
      "A `Map` holds its keys strongly, so every element ever measured (and its subtree) stays in memory as a detached node: a classic leak. A `WeakMap` doesn't keep keys alive, so once the element is removed and unreferenced, the entry can be collected. Keying by `el.id` would only work for elements with unique ids and still never clean up.",
      "`Map` тримає свої ключі сильно, тож кожен елемент, який колись вимірювали (і його піддерево), лишається в пам'яті як від'єднаний вузол: класичний витік. `WeakMap` не тримає ключі живими, тож щойно елемент видалено й на нього ніщо не посилається, запис можна прибрати. Ключ `el.id` спрацював би лише для елементів з унікальними id і все одно ніколи б не очищувався.",
    ],
  ),
  practice({
    slug: "col-memoize-any-args",
    skills: ["js-collections", w("closures-scope"), w("functional-programming")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Memoize with any arguments", "Мемоїзація з будь-якими аргументами"],
    prompt: [
      "The starter `memoize` in `src/memoize.ts` keys its cache with `JSON.stringify(args)`, which treats `NaN` and `null` as the same, compares objects by value instead of identity, and can't tell functions apart. Rewrite it so that:\n\n- It caches by **all** arguments, any number of them.\n- Primitives use Map semantics (`NaN` finds `NaN`; `1` and `\"1\"` differ).\n- Objects and functions are compared **by reference**, and the cache doesn't keep them alive (they should be collectable once the caller drops them).\n- `f(1)` and `f(1, undefined)` are different calls.\n- `undefined` results are cached, and thrown errors aren't.\n- `memoized.clear()` empties the cache.\n\nHint: a trie with one node per argument position, where each node holds a `Map` for primitives and a `WeakMap` for objects.",
      "Початкова `memoize` у `src/memoize.ts` будує ключ кешу через `JSON.stringify(args)`, що вважає `NaN` і `null` однаковими, порівнює об'єкти за значенням замість ідентичності й не розрізняє функції. Перепишіть її так, щоб:\n\n- Вона кешувала за **всіма** аргументами, скільки б їх не було.\n- Примітиви мали семантику Map (`NaN` знаходить `NaN`; `1` і `\"1\"` різні).\n- Об'єкти й функції порівнювалися **за посиланням**, а кеш не тримав їх живими (їх мають могти прибрати, щойно той, хто викликає, їх відпустить).\n- `f(1)` і `f(1, undefined)` були різними викликами.\n- Результати `undefined` кешувалися, а кинуті помилки ні.\n- `memoized.clear()` очищувала кеш.\n\nПідказка: префіксне дерево (trie) з вузлом на кожну позицію аргументу, де кожен вузол містить `Map` для примітивів і `WeakMap` для об'єктів.",
    ],
    files: { "/src/memoize.ts": MEMO_STARTER, "/index.ts": MEMO_INDEX },
    visibleFiles: ["/src/memoize.ts", "/index.ts"],
    activeFile: "/src/memoize.ts",
    tests: MEMO_TESTS,
    solution: { "/src/memoize.ts": MEMO_SOLUTION },
    explanation: [
      "Instead of serialising arguments into one string key, walk a trie: the first level is keyed by the argument count, then one level per argument. Each node stores primitive keys in a `Map` (SameValueZero, so `NaN` matches itself and types stay distinct) and object or function keys in a `WeakMap`, so the cache never prevents garbage collection of arguments. A separate `hasResult` flag lets `undefined` results be cached, and storing the result only after `fn` returns means errors aren't cached.",
      "Замість серіалізації аргументів в один рядковий ключ пройдіть префіксним деревом: перший рівень має ключем кількість аргументів, далі по рівню на кожен аргумент. Кожен вузол зберігає примітивні ключі в `Map` (SameValueZero, тож `NaN` збігається сам із собою, а типи лишаються різними), а ключі-об'єкти й функції у `WeakMap`, тож кеш ніколи не заважає збирачу сміття прибрати аргументи. Окремий прапорець `hasResult` дозволяє кешувати результати `undefined`, а збереження результату лише після повернення з `fn` означає, що помилки не кешуються.",
    ],
  }),
  practice({
    slug: "col-tag-index",
    skills: ["js-collections", w("data-structures"), w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["A tag index with Map and Set", "Індекс тегів на Map і Set"],
    prompt: [
      "Implement `TagIndex` in `src/tags.ts`, an inverted index from tags to item ids:\n\n- `add(id, tags)` adds tags to an item; adding the same item again merges its tags without duplicates.\n- `untag(id, tag)` and `remove(id)`: tags that no item uses anymore disappear.\n- `query({ all, any, none })` returns the ids that have **all** of `all`, **at least one** of `any` (when it's non-empty) and **none** of `none`, in the order items were first added. An empty query returns every item.\n- `tags()` returns `[tag, count]` pairs, most used first, ties sorted by name.\n\nQueries must stay fast with tens of thousands of items: keep two maps of sets (`id → tags` and `tag → ids`) instead of scanning arrays.",
      "Реалізуйте `TagIndex` у `src/tags.ts`, інвертований індекс від тегів до id елементів:\n\n- `add(id, tags)` додає теги елементу; повторне додавання того самого елемента зливає його теги без дублікатів.\n- `untag(id, tag)` і `remove(id)`: теги, якими більше не користується жоден елемент, зникають.\n- `query({ all, any, none })` повертає id, що мають **усі** теги з `all`, **хоча б один** з `any` (коли він непорожній) і **жодного** з `none`, у порядку першого додавання елементів. Порожній запит повертає всі елементи.\n- `tags()` повертає пари `[tag, count]`, найуживаніші першими, а за рівності впорядковані за назвою.\n\nЗапити мають лишатися швидкими з десятками тисяч елементів: тримайте дві мапи множин (`id → tags` і `tag → ids`) замість сканування масивів.",
    ],
    files: { "/src/tags.ts": TAGS_STARTER, "/index.ts": TAGS_INDEX },
    visibleFiles: ["/src/tags.ts", "/index.ts"],
    activeFile: "/src/tags.ts",
    tests: TAGS_TESTS,
    solution: { "/src/tags.ts": TAGS_SOLUTION },
    explanation: [
      "Two `Map<string, Set<string>>` indexes give O(1) membership checks in both directions: `tag → ids` answers \"does this item have this tag\" without scanning the item's tags, and `id → tags` makes removal cheap. Iterating the `id → tags` map keeps results in insertion order for free, because Maps remember it. Sets deduplicate merged tags automatically, and deleting a tag's entry when its set becomes empty keeps `tags()` accurate.",
      "Два індекси `Map<string, Set<string>>` дають перевірку належності за O(1) в обох напрямках: `tag → ids` відповідає на питання «чи має елемент цей тег» без сканування тегів елемента, а `id → tags` робить видалення дешевим. Перебір мапи `id → tags` безкоштовно зберігає порядок вставлення в результатах, бо Map його пам'ятає. Set автоматично прибирає дублікати під час злиття тегів, а видалення запису тегу, коли його множина спорожніла, тримає `tags()` точним.",
    ],
  }),
]);
