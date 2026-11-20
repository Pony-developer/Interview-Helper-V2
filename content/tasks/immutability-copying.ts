import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const CLONE_STARTER = String.raw`/**
 * Deep-copies value: plain objects, arrays, class instances (same prototype), Date, RegExp, Map, Set,
 * symbol keys, accessors and cycles. Functions are shared, not copied.
 */
export function deepClone<T>(value: T): T {
  // TODO: loses prototypes, dates, maps, sets and symbol keys, and throws on cycles
  return JSON.parse(JSON.stringify(value));
}
`;

const CLONE_SOLUTION = String.raw`export function deepClone<T>(value: T): T {
  const seen = new WeakMap<object, unknown>();

  const clone = (v: any): any => {
    if (typeof v !== "object" || v === null) return v; // primitives and functions are shared
    if (seen.has(v)) return seen.get(v); // cycles and shared references keep their shape

    if (v instanceof Date) return new Date(v.getTime());
    if (v instanceof RegExp) {
      const re = new RegExp(v.source, v.flags);
      re.lastIndex = v.lastIndex;
      return re;
    }
    if (v instanceof Map) {
      const out = new Map();
      seen.set(v, out);
      for (const [k, val] of v) out.set(clone(k), clone(val));
      return out;
    }
    if (v instanceof Set) {
      const out = new Set();
      seen.set(v, out);
      for (const val of v) out.add(clone(val));
      return out;
    }

    // Arrays and objects: same prototype, every own key (strings and symbols), descriptors preserved.
    const out = Array.isArray(v) ? new Array(v.length) : Object.create(Object.getPrototypeOf(v));
    seen.set(v, out);
    for (const key of Reflect.ownKeys(v)) {
      if (Array.isArray(v) && key === "length") continue;
      const desc = Object.getOwnPropertyDescriptor(v, key)!;
      if ("value" in desc) desc.value = clone(desc.value);
      Object.defineProperty(out, key, desc);
    }
    return out;
  };

  return clone(value);
}
`;

const CLONE_INDEX = String.raw`import "./styles.css";
import { deepClone } from "./src/clone";

class Point {
  constructor(public x: number, public y: number) {}
  get length() {
    return Math.hypot(this.x, this.y);
  }
}
const original: any = { p: new Point(3, 4), when: new Date(0), tags: new Map([["a", new Set([1])]]) };
original.self = original;
let output: string;
try {
  const copy = deepClone(original);
  output = [
    "p is a Point: " + (copy.p instanceof Point) + ", length " + copy.p.length,
    "date copied: " + (copy.when instanceof Date && copy.when !== original.when),
    "nested set copied: " + (copy.tags.get("a") !== original.tags.get("a")),
    "cycle preserved: " + (copy.self === copy),
  ].join("\n");
} catch (e) {
  output = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Deep clone</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = output;
`;

const CLONE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { deepClone } from "../src/clone";

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  get length() {
    return Math.hypot(this.x, this.y);
  }
}

describe("deepClone", () => {
  it("copies nested objects and arrays without sharing them", () => {
    const original = { user: { name: "Ada", tags: ["a", "b"] }, n: 1 };
    const copy = deepClone(original);
    expect(copy).toEqual(original);
    expect(copy.user).not.toBe(original.user);
    expect(copy.user.tags).not.toBe(original.user.tags);
    copy.user.tags.push("c");
    expect(original.user.tags).toEqual(["a", "b"]);
  });
  it("keeps class instances' prototypes", () => {
    const copy = deepClone({ p: new Point(3, 4) });
    expect(copy.p).toBeInstanceOf(Point);
    expect(copy.p.length).toBe(5);
  });
  it("copies Date, RegExp, Map and Set", () => {
    const re = /a+/gi;
    re.lastIndex = 2;
    const original = { when: new Date(1000), re, map: new Map([[{ k: 1 }, new Set([1, 2])]]) };
    const copy = deepClone(original);
    expect(copy.when).toBeInstanceOf(Date);
    expect(copy.when.getTime()).toBe(1000);
    expect(copy.when).not.toBe(original.when);
    expect([copy.re.source, copy.re.flags, copy.re.lastIndex]).toEqual(["a+", "gi", 2]);
    const [[key, set]] = [...copy.map];
    expect(key).toEqual({ k: 1 });
    expect(set).toBeInstanceOf(Set);
    expect(set).not.toBe([...original.map.values()][0]);
  });
  it("handles cycles and shared references", () => {
    const shared = { v: 1 };
    const original = { a: shared, b: shared };
    original.self = original;
    const copy = deepClone(original);
    expect(copy.self).toBe(copy);
    expect(copy.a).toBe(copy.b);
    expect(copy.a).not.toBe(shared);
  });
  it("keeps symbol keys, non-enumerable properties and accessors", () => {
    const tag = Symbol("tag");
    const original = { [tag]: "t", first: "Ada", last: "Lovelace" };
    Object.defineProperty(original, "hidden", { value: 42, enumerable: false });
    Object.defineProperty(original, "full", { get() { return this.first + " " + this.last; }, enumerable: true });
    const copy = deepClone(original);
    expect(copy[tag]).toBe("t");
    expect(copy.hidden).toBe(42);
    copy.last = "Byron";
    expect(copy.full).toBe("Ada Byron");
  });
  it("keeps array length and holes, and shares functions", () => {
    const fn = () => 1;
    const arr = [1, , 3];
    const copy = deepClone({ arr, fn });
    expect(copy.arr.length).toBe(3);
    expect(1 in copy.arr).toBe(false);
    expect(copy.fn).toBe(fn);
  });
  it("returns primitives as they are", () => {
    expect(deepClone(5)).toBe(5);
    expect(deepClone(null)).toBeNull();
    expect(deepClone("s")).toBe("s");
  });
});
`;

const PRODUCE_STARTER = String.raw`/**
 * Immer-style produce: run recipe against a mutable draft and return a new immutable state.
 * Unchanged branches keep their identity; changed objects are new and frozen; base is never mutated.
 * If recipe returns a value other than undefined, that value is the result.
 */
export function produce<T>(base: T, recipe: (draft: T) => T | void): T {
  // TODO: copies everything, so nothing keeps its identity, and nothing is frozen
  const draft = structuredClone(base);
  const result = recipe(draft);
  return result === undefined ? draft : (result as T);
}
`;

const PRODUCE_SOLUTION = String.raw`type DraftState = {
  base: any;
  copy: any | null; // created on the first write (copy-on-write)
  parent: DraftState | null;
  children: Map<PropertyKey, any>; // drafts handed out for nested objects
  finalized: boolean;
};

const isObject = (v: unknown): v is object => typeof v === "object" && v !== null;

export function produce<T>(base: T, recipe: (draft: T) => T | void): T {
  const states = new WeakMap<object, DraftState>(); // draft proxy → its state
  const latest = (s: DraftState) => s.copy ?? s.base;

  const markChanged = (s: DraftState) => {
    if (s.copy) return;
    s.copy = Array.isArray(s.base) ? [...s.base] : { ...s.base };
    for (const [key, child] of s.children) s.copy[key] = child;
    if (s.parent) markChanged(s.parent); // a changed child means every ancestor changes too
  };

  const createDraft = (value: any, parent: DraftState | null): any => {
    const state: DraftState = { base: value, copy: null, parent, children: new Map(), finalized: false };
    // A fresh empty target: Array.isArray works, and frozen bases don't trip proxy invariants.
    const proxy = new Proxy(Array.isArray(value) ? [] : {}, {
      get(_t, key) {
        const source = latest(state);
        const v = source[key];
        if (!isObject(v) || !Object.prototype.hasOwnProperty.call(source, key)) return v;
        if (state.children.has(key)) return state.children.get(key);
        if (v !== state.base[key]) return v; // a new object assigned in this recipe: no draft needed
        const child = createDraft(v, state);
        state.children.set(key, child);
        if (state.copy) state.copy[key] = child;
        return child;
      },
      set(_t, key, v) {
        const source = latest(state);
        if (Object.prototype.hasOwnProperty.call(source, key) && Object.is(source[key], v)) return true; // no-op write
        markChanged(state);
        state.copy[key] = v;
        state.children.delete(key);
        return true;
      },
      deleteProperty(_t, key) {
        if (!Object.prototype.hasOwnProperty.call(latest(state), key)) return true;
        markChanged(state);
        delete state.copy[key];
        state.children.delete(key);
        return true;
      },
      has: (_t, key) => key in latest(state),
      ownKeys: () => Reflect.ownKeys(latest(state)),
      getOwnPropertyDescriptor(target, key) {
        const desc = Reflect.getOwnPropertyDescriptor(latest(state), key);
        if (!desc) return undefined;
        const configurable = Array.isArray(target) && key === "length" ? false : true;
        return { ...desc, writable: true, configurable };
      },
    });
    states.set(proxy, state);
    return proxy;
  };

  const seen = new WeakSet<object>();
  const finalize = (value: any): any => {
    if (!isObject(value)) return value;
    const state = states.get(value);
    if (state) {
      if (!state.copy) return state.base; // untouched: share the original
      if (state.finalized) return state.copy;
      state.finalized = true;
      for (const key of Reflect.ownKeys(state.copy)) state.copy[key] = finalize(state.copy[key]);
      return Object.freeze(state.copy);
    }
    // A new object created in the recipe may contain drafts (e.g. draft.list = draft.list.filter(...)).
    if (seen.has(value) || Object.isFrozen(value)) return value;
    seen.add(value);
    for (const key of Reflect.ownKeys(value)) {
      const finalized = finalize(value[key]);
      if (finalized !== value[key]) value[key] = finalized;
    }
    return value;
  };

  if (!isObject(base)) {
    const result = recipe(base);
    return result === undefined ? base : (result as T);
  }
  const root = createDraft(base, null);
  const returned = recipe(root);
  return finalize(returned === undefined ? root : returned);
}
`;

const PRODUCE_INDEX = String.raw`import "./styles.css";
import { produce } from "./src/produce";

const state = {
  user: { name: "Ada", address: { city: "Kyiv" } },
  todos: [{ id: 1, title: "Write tests", done: false }, { id: 2, title: "Ship", done: false }],
  settings: { theme: "dark" },
};
let output: string;
try {
  const next = produce(state, (draft) => {
    draft.user.address.city = "Lviv";
    draft.todos[0].done = true;
  });
  output = [
    "city: " + state.user.address.city + " → " + next.user.address.city,
    "settings shared: " + (next.settings === state.settings),
    "second todo shared: " + (next.todos[1] === state.todos[1]),
    "result frozen: " + Object.isFrozen(next),
  ].join("\n");
} catch (e) {
  output = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>produce</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = output;
`;

const PRODUCE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { produce } from "../src/produce";

const makeState = () => ({
  user: { name: "Ada", address: { city: "Kyiv" } },
  todos: [{ id: 1, title: "Write tests", done: false }, { id: 2, title: "Ship", done: false }],
  settings: { theme: "dark" },
});

describe("produce", () => {
  it("returns the same object when nothing changes", () => {
    const base = makeState();
    expect(produce(base, () => {})).toBe(base);
    expect(produce(base, (d) => { d.settings.theme = "dark"; })).toBe(base);
  });
  it("copies only the changed path and never mutates the base", () => {
    const base = makeState();
    const next = produce(base, (d) => { d.user.address.city = "Lviv"; });
    expect(next.user.address.city).toBe("Lviv");
    expect(base.user.address.city).toBe("Kyiv");
    expect(next).not.toBe(base);
    expect(next.user).not.toBe(base.user);
    expect(next.settings).toBe(base.settings);
    expect(next.todos).toBe(base.todos);
  });
  it("supports array mutations", () => {
    const base = makeState();
    const next = produce(base, (d) => {
      d.todos[0].done = true;
      d.todos.push({ id: 3, title: "Celebrate", done: false });
    });
    expect(Array.isArray(next.todos)).toBe(true);
    expect(next.todos.map((t) => t.id)).toEqual([1, 2, 3]);
    expect(next.todos[0].done).toBe(true);
    expect(next.todos[1]).toBe(base.todos[1]);
    expect(base.todos.length).toBe(2);
  });
  it("finalizes drafts placed inside new objects", () => {
    const base = makeState();
    const next = produce(base, (d) => {
      d.todos = d.todos.filter((t) => t.id !== 1);
    });
    expect(next.todos).toEqual([{ id: 2, title: "Ship", done: false }]);
    expect(next.todos[0]).toBe(base.todos[1]);
  });
  it("supports deleting properties", () => {
    const base = { a: 1, b: { c: 2 } };
    const next = produce(base, (d) => { delete d.a; });
    expect(next).toEqual({ b: { c: 2 } });
    expect(next.b).toBe(base.b);
    expect("a" in base).toBe(true);
  });
  it("freezes changed objects", () => {
    const base = makeState();
    const next = produce(base, (d) => { d.user.name = "Ada L."; });
    expect(Object.isFrozen(next)).toBe(true);
    expect(Object.isFrozen(next.user)).toBe(true);
    expect(Object.isFrozen(base)).toBe(false);
  });
  it("can produce again from a frozen result", () => {
    const first = produce(makeState(), (d) => { d.user.name = "B"; });
    const second = produce(first, (d) => { d.user.name = "C"; });
    expect(second.user.name).toBe("C");
    expect(first.user.name).toBe("B");
  });
  it("uses a value returned by the recipe as the result", () => {
    const base = makeState();
    expect(produce(base, () => ({ reset: true }))).toEqual({ reset: true });
  });
});
`;

export default defineTasks([
  quiz(
    "imm-const-mutation",
    ["immutability-copying"],
    1,
    45,
    ["`const` and objects", "`const` і об'єкти"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ true, 'TypeError' ]`", "`[ true, 'TypeError' ]`"],
      ["`[ false, 'TypeError' ]`", "`[ false, 'TypeError' ]`"],
      ["`[ true, 'ok' ]`", "`[ true, 'ok' ]`"],
      ["`[ 'TypeError', 'TypeError' ]`", "`[ 'TypeError', 'TypeError' ]`"],
    ],
    "a",
    [
      "`const` makes the **binding** constant: the variable can't be pointed at a different value, so reassigning it throws a `TypeError`. It says nothing about the object the binding refers to, which stays fully mutable. For a read-only object, use `Object.freeze` (or TypeScript's `readonly`/`as const`).",
      "`const` робить сталим **зв'язування**: змінну не можна спрямувати на інше значення, тож повторне присвоєння кидає `TypeError`. Про об'єкт, на який посилається зв'язування, воно нічого не каже, і той лишається повністю змінним. Для об'єкта лише для читання використовуйте `Object.freeze` (чи `readonly`/`as const` у TypeScript).",
    ],
    { code: "const cfg = { debug: false };\nconst out = [];\ncfg.debug = true;\nout.push(cfg.debug);\ntry {\n  cfg = {};\n} catch (e) {\n  out.push(e.name);\n}\nconsole.log(out);", codeLanguage: "js" },
  ),
  quiz(
    "imm-pass-by-sharing",
    ["immutability-copying", w("closures-scope")],
    2,
    75,
    ["Mutating vs reassigning a parameter", "Зміна проти перевизначення параметра"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'a', 'x' ]`", "`[ 'a', 'x' ]`"],
      ["`[ 'y' ]`", "`[ 'y' ]`"],
      ["`[ 'a' ]`", "`[ 'a' ]`"],
      ["`[ 'a', 'x', 'y' ]`", "`[ 'a', 'x', 'y' ]`"],
    ],
    "a",
    [
      "The function receives a copy of the **reference**, so `push(\"x\")` mutates the caller's array. `list = []` only points the local parameter at a new array; the caller's variable still refers to the original, so `\"y\"` goes into an array nobody else sees. JavaScript is pass-by-value, and for objects that value is a reference (sometimes called \"pass by sharing\").",
      "Функція отримує копію **посилання**, тож `push(\"x\")` змінює масив того, хто викликав. `list = []` лише спрямовує локальний параметр на новий масив; змінна того, хто викликав, досі посилається на оригінал, тож `\"y\"` потрапляє в масив, якого більше ніхто не бачить. JavaScript передає за значенням, а для об'єктів це значення є посиланням (іноді це називають «передаванням через спільний доступ»).",
    ],
    { code: 'function reset(list) {\n  list.push("x");\n  list = [];\n  list.push("y");\n}\nconst a = ["a"];\nreset(a);\nconsole.log(a);', codeLanguage: "js" },
  ),
  quiz(
    "imm-sort-mutates",
    ["immutability-copying", w("arrays-strings")],
    2,
    75,
    ["`sort` vs `toSorted`", "`sort` проти `toSorted`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1, 2, 3 ] true [ 3, 2, 1 ]`", "`[ 1, 2, 3 ] true [ 3, 2, 1 ]`"],
      ["`[ 3, 1, 2 ] false [ 3, 2, 1 ]`", "`[ 3, 1, 2 ] false [ 3, 2, 1 ]`"],
      ["`[ 3, 2, 1 ] true [ 3, 2, 1 ]`", "`[ 3, 2, 1 ] true [ 3, 2, 1 ]`"],
      ["`[ 1, 2, 3 ] false [ 1, 2, 3 ]`", "`[ 1, 2, 3 ] false [ 1, 2, 3 ]`"],
    ],
    "a",
    [
      "`sort` sorts **in place** and returns the same array, so `sorted === scores` and the original order is gone, which is a classic bug when sorting props or state. `toSorted` (ES2023) returns a new sorted array and leaves the original alone, as do `toReversed`, `toSpliced` and `with`.",
      "`sort` сортує **на місці** й повертає той самий масив, тож `sorted === scores`, а початковий порядок втрачено, і це класична помилка під час сортування props чи стану. `toSorted` (ES2023) повертає новий відсортований масив і не чіпає оригінал, як і `toReversed`, `toSpliced` і `with`.",
    ],
    { code: "const scores = [3, 1, 2];\nconst sorted = scores.sort();\nconst desc = scores.toSorted((a, b) => b - a);\nconsole.log(scores, sorted === scores, desc);", codeLanguage: "js" },
  ),
  quiz(
    "imm-with",
    ["immutability-copying"],
    2,
    75,
    ["`Array.prototype.with`", "`Array.prototype.with`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ [ 1, 2, 3 ], [ 1, 20, 3 ], 'RangeError' ]`", "`[ [ 1, 2, 3 ], [ 1, 20, 3 ], 'RangeError' ]`"],
      ["`[ [ 1, 20, 3 ], [ 1, 20, 3 ], 'RangeError' ]`", "`[ [ 1, 20, 3 ], [ 1, 20, 3 ], 'RangeError' ]`"],
      ["`[ [ 1, 2, 3 ], [ 1, 20, 3 ], [ 1, 2, 3, <2 empty items>, 0 ] ]`", "`[ [ 1, 2, 3 ], [ 1, 20, 3 ], [ 1, 2, 3, <2 empty items>, 0 ] ]`"],
      ["`[ [ 1, 2, 3 ], [ 1, 20, 3 ], 'TypeError' ]`", "`[ [ 1, 2, 3 ], [ 1, 20, 3 ], 'TypeError' ]`"],
    ],
    "a",
    [
      "`arr.with(index, value)` is the immutable version of `arr[index] = value`: it returns a copy with one element replaced. Unlike assignment, it can't grow the array: an index outside the array throws a `RangeError` (negative indexes count from the end, like `at`).",
      "`arr.with(index, value)` є незмінною версією `arr[index] = value`: вона повертає копію з одним заміненим елементом. На відміну від присвоєння, вона не може збільшити масив: індекс поза масивом кидає `RangeError` (від'ємні індекси рахуються з кінця, як в `at`).",
    ],
    { code: "const a = [1, 2, 3];\nconst out = [a, a.with(1, 20)];\ntry {\n  out.push(a.with(5, 0));\n} catch (e) {\n  out.push(e.name);\n}\nconsole.log(out);", codeLanguage: "js" },
  ),
  quiz(
    "imm-shared-defaults",
    ["immutability-copying"],
    3,
    90,
    ["Merging into shared defaults", "Злиття в спільні значення за замовчуванням"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`5 true`", "`5 true`"],
      ["`3 false`", "`3 false`"],
      ["`5 false`", "`5 false`"],
      ["`3 true`", "`3 true`"],
    ],
    "a",
    [
      "`Object.assign(target, …sources)` copies into its **first argument** and returns it. Here the target is the shared `DEFAULTS` object, so every client mutates it and gets the same object back: the first call's `retries: 5` leaks into all later clients. Merge into a fresh object: `{ ...DEFAULTS, ...opts }` or `Object.assign({}, DEFAULTS, opts)`.",
      "`Object.assign(target, …sources)` копіює у свій **перший аргумент** і повертає його. Тут ціллю є спільний об'єкт `DEFAULTS`, тож кожен клієнт змінює його й отримує той самий об'єкт: `retries: 5` з першого виклику просочується в усіх наступних клієнтів. Зливайте в новий об'єкт: `{ ...DEFAULTS, ...opts }` чи `Object.assign({}, DEFAULTS, opts)`.",
    ],
    { code: "const DEFAULTS = { retries: 3 };\nfunction makeClient(opts) {\n  return Object.assign(DEFAULTS, opts);\n}\nconst a = makeClient({ retries: 5 });\nconst b = makeClient({});\nconsole.log(b.retries, a === b);", codeLanguage: "js" },
  ),
  quiz(
    "imm-structured-clone-limits",
    ["immutability-copying", w("js-classes")],
    3,
    90,
    ["What `structuredClone` keeps", "Що зберігає `structuredClone`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false undefined true 1`", "`false undefined true 1`"],
      ["`true 4 true 1`", "`true 4 true 1`"],
      ["`false 4 false undefined`", "`false 4 false undefined`"],
      ["`true undefined true 1`", "`true undefined true 1`"],
    ],
    "a",
    [
      "`structuredClone` deep-copies data, including `Date` and `Map`, but not behaviour: class instances come back as **plain objects**, so `instanceof Point` is false and the `double` getter, which lived on the prototype, is gone. Functions throw a `DataCloneError`. If you need class instances back, rehydrate them (`Object.assign(new Point(), copy)`) or write a custom clone.",
      "`structuredClone` глибоко копіює дані, зокрема `Date` і `Map`, але не поведінку: екземпляри класів повертаються **звичайними об'єктами**, тож `instanceof Point` хибне, а гетер `double`, що жив у прототипі, зникає. Функції кидають `DataCloneError`. Якщо потрібні екземпляри класів, відновлюйте їх (`Object.assign(new Point(), copy)`) або напишіть власне клонування.",
    ],
    {
      code: "class Point {\n  constructor(x) {\n    this.x = x;\n  }\n  get double() {\n    return this.x * 2;\n  }\n}\nconst original = { p: new Point(2), when: new Date(0), tags: new Map([[\"a\", 1]]) };\nconst copy = structuredClone(original);\nconsole.log(copy.p instanceof Point, copy.p.double, copy.when instanceof Date, copy.tags.get(\"a\"));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "imm-structured-clone-function",
    ["immutability-copying"],
    2,
    60,
    ["Cloning an object with a method", "Клонування об'єкта з методом"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`DataCloneError`", "`DataCloneError`"],
      ["`{ name: 'x' }`", "`{ name: 'x' }`"],
      ["`{ name: 'x', greet: [Function: greet] }`", "`{ name: 'x', greet: [Function: greet] }`"],
      ["`TypeError`", "`TypeError`"],
    ],
    "a",
    [
      "Functions can't be cloned by the structured clone algorithm (they close over scopes that can't be copied to another realm), so `structuredClone` throws a `DOMException` named `DataCloneError` instead of silently dropping them like `JSON.stringify` does. The same algorithm is used by `postMessage` to workers and by IndexedDB, so the same error appears there.",
      "Алгоритм структурного клонування не може клонувати функції (вони замикають області видимості, які не можна скопіювати в інше середовище), тож `structuredClone` кидає `DOMException` на ім'я `DataCloneError`, а не мовчки відкидає їх, як робить `JSON.stringify`. Той самий алгоритм використовують `postMessage` до воркерів і IndexedDB, тож там з'являється та сама помилка.",
    ],
    { code: 'try {\n  console.log(structuredClone({ name: "x", greet() {} }));\n} catch (e) {\n  console.log(e.name);\n}', codeLanguage: "js" },
  ),
  quiz(
    "imm-json-roundtrip",
    ["immutability-copying", w("type-coercion")],
    3,
    90,
    ["The JSON round-trip \"deep copy\"", "«Глибока копія» через JSON"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`{ d: '1970-01-01T00:00:00.000Z', n: null, s: {} }`", "`{ d: '1970-01-01T00:00:00.000Z', n: null, s: {} }`"],
      ["`{ a: undefined, d: 1970-01-01T00:00:00.000Z, n: NaN, s: Set(1) { 1 } }`", "`{ a: undefined, d: 1970-01-01T00:00:00.000Z, n: NaN, s: Set(1) { 1 } }`"],
      ["`{ a: null, d: '1970-01-01T00:00:00.000Z', n: null, s: [ 1 ] }`", "`{ a: null, d: '1970-01-01T00:00:00.000Z', n: null, s: [ 1 ] }`"],
      ["A `TypeError`: Sets can't be serialised", "`TypeError`: Set не можна серіалізувати"],
    ],
    "a",
    [
      "`JSON.stringify` drops properties whose value is `undefined`, turns a `Date` into an ISO string (via `toJSON`), writes `NaN` as `null`, and serialises a `Set` (which has no enumerable own properties) as `{}`. After parsing, the types are lost. Use `structuredClone` for data copies, and keep JSON for actual serialisation.",
      "`JSON.stringify` відкидає властивості зі значенням `undefined`, перетворює `Date` на рядок ISO (через `toJSON`), записує `NaN` як `null` і серіалізує `Set` (що не має власних перелічуваних властивостей) як `{}`. Після розбору типи втрачено. Для копій даних використовуйте `structuredClone`, а JSON лишіть для справжньої серіалізації.",
    ],
    { code: "const o = { a: undefined, d: new Date(0), n: NaN, s: new Set([1]) };\nconsole.log(JSON.parse(JSON.stringify(o)));", codeLanguage: "js" },
  ),
  quiz(
    "imm-structural-sharing",
    ["immutability-copying", w("redux")],
    3,
    90,
    ["Which references change?", "Які посилання змінюються?"],
    ["After this immutable update, what does it print?", "Що виведе цей код після цього незмінного оновлення?"],
    [
      ["`true true true false`", "`true true true false`"],
      ["`true false false false`", "`true false false false`"],
      ["`false true true true`", "`false true true true`"],
      ["`true true false false`", "`true true false false`"],
    ],
    "a",
    [
      "Only the objects on the path to the change are copied: the root and `user`. `settings` and `user.tags` are reused as-is (structural sharing), so they're `===` to the old ones, and the old state still has the old name. That's what lets `React.memo`, selectors and `OnPush` skip work with a cheap reference check.",
      "Копіюються лише об'єкти на шляху до зміни: корінь і `user`. `settings` і `user.tags` використовуються повторно як є (структурне спільне використання), тож вони `===` старим, а старий стан досі має старе ім'я. Саме це дає `React.memo`, селекторам і `OnPush` пропускати роботу після дешевої перевірки посилань.",
    ],
    {
      code: 'const state = { user: { name: "Ada", tags: ["admin"] }, settings: { theme: "dark" } };\nconst next = { ...state, user: { ...state.user, name: "Ada L." } };\nconsole.log(next.user !== state.user, next.settings === state.settings, next.user.tags === state.user.tags, state.user.name === "Ada L.");',
      codeLanguage: "js",
    },
  ),
  quiz(
    "imm-react-mutation",
    ["immutability-copying", w("react")],
    2,
    75,
    ["Mutating React state", "Зміна стану React на місці"],
    [
      "A handler does `items.push(newItem); setItems(items);` where `items` comes from `useState`. What happens, and what's the fix?",
      "Обробник робить `items.push(newItem); setItems(items);`, де `items` отримано з `useState`. Що станеться і як це виправити?",
    ],
    [
      ["React sees the same array reference, so it may skip the re-render; use `setItems((prev) => [...prev, newItem])`", "React бачить те саме посилання на масив, тож може пропустити перерендер; використайте `setItems((prev) => [...prev, newItem])`"],
      ["It works, because `push` notifies React", "Працює, бо `push` сповіщає React"],
      ["React throws an error about mutating state", "React кидає помилку про зміну стану"],
      ["The new item renders twice", "Новий елемент рендериться двічі"],
    ],
    "a",
    [
      "React compares the new state with the old one using `Object.is`. A mutated array is the same object, so React bails out and the UI shows stale data (and memoised children and effects keyed on `items` won't update even if something else re-renders). Always create a new array or object; the updater form also avoids stale closures when updates are batched.",
      "React порівнює новий стан зі старим через `Object.is`. Змінений масив є тим самим об'єктом, тож React нічого не робить, а інтерфейс показує застарілі дані (і мемоїзовані дочірні компоненти й ефекти із залежністю від `items` не оновляться, навіть якщо щось інше перерендериться). Завжди створюйте новий масив чи об'єкт; форма з функцією оновлення ще й уникає застарілих замикань, коли оновлення групуються.",
    ],
  ),
  practice({
    slug: "imm-deep-clone",
    skills: ["immutability-copying", w("js-collections"), w("recursion")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["A deep clone that keeps types", "Глибоке клонування зі збереженням типів"],
    prompt: [
      "`structuredClone` loses prototypes and accessors, and the JSON round-trip loses even more. Implement `deepClone(value)` in `src/clone.ts`:\n\n- Plain objects and arrays are copied recursively; class instances keep their **prototype** (so methods and getters work).\n- `Date`, `RegExp` (with `flags` and `lastIndex`), `Map` and `Set` are recreated, with their keys and values cloned too.\n- **Cycles** and shared references keep their shape: if two properties point to the same object, the copies point to the same copy.\n- **Symbol keys**, **non-enumerable** properties and **accessors** (getters/setters) are preserved via property descriptors.\n- Arrays keep their length and holes. Functions and primitives are returned as they are.",
      "`structuredClone` втрачає прототипи й аксесори, а перетворення через JSON втрачає ще більше. Реалізуйте `deepClone(value)` у `src/clone.ts`:\n\n- Звичайні об'єкти й масиви копіюються рекурсивно; екземпляри класів зберігають свій **прототип** (тож методи й гетери працюють).\n- `Date`, `RegExp` (з `flags` і `lastIndex`), `Map` і `Set` створюються заново, а їхні ключі й значення теж клонуються.\n- **Цикли** й спільні посилання зберігають форму: якщо дві властивості вказують на той самий об'єкт, копії вказують на ту саму копію.\n- **Ключі-символи**, **неперелічувані** властивості й **аксесори** (гетери/сетери) зберігаються через дескриптори властивостей.\n- Масиви зберігають довжину й дірки. Функції й примітиви повертаються як є.",
    ],
    files: { "/src/clone.ts": CLONE_STARTER, "/index.ts": CLONE_INDEX },
    visibleFiles: ["/src/clone.ts", "/index.ts"],
    activeFile: "/src/clone.ts",
    tests: CLONE_TESTS,
    solution: { "/src/clone.ts": CLONE_SOLUTION },
    explanation: [
      "A `WeakMap` from originals to copies does double duty: it stops infinite recursion on cycles, and it makes shared references map to one shared copy. The copy must be registered in the map **before** recursing into children, or a cycle would recurse forever. `Object.create(Object.getPrototypeOf(v))` keeps class behaviour, and copying `Reflect.ownKeys` with full property descriptors brings along symbol keys, non-enumerable properties and accessors, cloning only data values. Built-ins with internal slots (Date, RegExp, Map, Set) have to be reconstructed explicitly, because their data isn't stored in properties.",
      "`WeakMap` від оригіналів до копій виконує подвійну роль: зупиняє нескінченну рекурсію на циклах і робить так, що спільні посилання відповідають одній спільній копії. Копію треба зареєструвати в мапі **до** рекурсії в дочірні значення, інакше цикл рекурсувався б вічно. `Object.create(Object.getPrototypeOf(v))` зберігає поведінку класу, а копіювання `Reflect.ownKeys` з повними дескрипторами властивостей переносить ключі-символи, неперелічувані властивості й аксесори, клонуючи лише значення-дані. Вбудовані типи з внутрішніми слотами (Date, RegExp, Map, Set) треба відтворювати явно, бо їхні дані не зберігаються у властивостях.",
    ],
  }),
  practice({
    slug: "imm-produce",
    skills: ["immutability-copying", w("js-metaprogramming"), w("redux")],
    complexity: 5,
    estSeconds: 2400,
    framework: "vanilla-ts",
    title: ["Write a mini Immer", "Напишіть міні-Immer"],
    prompt: [
      "Implement `produce(base, recipe)` in `src/produce.ts`, the core idea of Immer. `recipe` receives a **draft** it can mutate freely (assign, `push`, `delete`), and `produce` returns the next immutable state:\n\n- If nothing changed (including writes of the same value), return `base` itself.\n- Otherwise, return a new state where only the objects on the changed paths are copies, and every untouched branch keeps its identity. `base` is never mutated.\n- Arrays stay arrays (`Array.isArray(draft.todos)` works inside the recipe), and drafts placed inside new objects (for example `d.todos = d.todos.filter(…)`) are replaced by real values in the result.\n- Changed objects in the result are frozen, and producing again from a frozen result works.\n- If `recipe` returns something other than `undefined`, that's the result.\n\nHint: a `Proxy` per object, created lazily on read, with copy-on-write on the first change, propagated to the parents.",
      "Реалізуйте `produce(base, recipe)` у `src/produce.ts`, основну ідею Immer. `recipe` отримує **чернетку**, яку може вільно змінювати (присвоювати, `push`, `delete`), а `produce` повертає наступний незмінний стан:\n\n- Якщо нічого не змінилося (зокрема записи того самого значення), поверніть сам `base`.\n- Інакше поверніть новий стан, де копіями є лише об'єкти на змінених шляхах, а кожна незачеплена гілка зберігає свою ідентичність. `base` ніколи не змінюється.\n- Масиви лишаються масивами (`Array.isArray(draft.todos)` працює в recipe), а чернетки, розміщені всередині нових об'єктів (наприклад, `d.todos = d.todos.filter(…)`), у результаті замінюються справжніми значеннями.\n- Змінені об'єкти в результаті заморожені, і повторний `produce` із замороженого результату працює.\n- Якщо `recipe` повертає щось, крім `undefined`, це і є результат.\n\nПідказка: `Proxy` для кожного об'єкта, що ліниво створюється під час читання, з копіюванням під час першої зміни (copy-on-write), яке поширюється на батьків.",
    ],
    files: { "/src/produce.ts": PRODUCE_STARTER, "/index.ts": PRODUCE_INDEX },
    visibleFiles: ["/src/produce.ts", "/index.ts"],
    activeFile: "/src/produce.ts",
    tests: PRODUCE_TESTS,
    solution: { "/src/produce.ts": PRODUCE_SOLUTION },
    explanation: [
      "Each draft is a `Proxy` with a small state record: the base object, a lazily created shallow copy, and the child drafts it has handed out. Reads return child drafts on demand, so only visited objects get proxies. The first write makes a shallow copy (copy-on-write) and marks every ancestor as changed, so all objects on the path get copied and nothing else does. Finalising walks the result: untouched drafts collapse back to their base objects (structural sharing), changed ones become their frozen copies, and new objects created in the recipe are scanned for drafts they contain. Using an empty object or array as the proxy target keeps `Array.isArray` working and avoids proxy invariant errors when the base is frozen.",
      "Кожна чернетка є `Proxy` з невеликим записом стану: базовий об'єкт, ліниво створена поверхнева копія й видані дочірні чернетки. Читання повертають дочірні чернетки на вимогу, тож проксі отримують лише відвідані об'єкти. Перший запис робить поверхневу копію (copy-on-write) і позначає кожного предка як зміненого, тож копіюються всі об'єкти на шляху й нічого більше. Фіналізація обходить результат: незачеплені чернетки згортаються назад у свої базові об'єкти (структурне спільне використання), змінені стають своїми замороженими копіями, а нові об'єкти, створені в recipe, скануються на наявність чернеток усередині. Порожній об'єкт чи масив як ціль проксі зберігає роботу `Array.isArray` і запобігає помилкам інваріантів проксі, коли базовий об'єкт заморожений.",
    ],
  }),
]);
