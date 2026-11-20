import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const OBSERVE_TYPES = String.raw`export type Change = {
  type: "set" | "delete";
  /** Keys from the observed root to the changed property, e.g. ["user", "name"]. */
  path: string[];
  oldValue: unknown;
  newValue: unknown;
};
`;

const OBSERVE_STARTER =
  OBSERVE_TYPES +
  String.raw`
/** Returns a proxy of target that reports every change, at any depth, to onChange. */
export function observe<T extends object>(target: T, onChange: (change: Change) => void): T {
  // TODO: nested objects, deletes, and skipping writes that change nothing
  return new Proxy(target, {
    set(t: any, key, value) {
      const oldValue = t[key];
      t[key] = value;
      onChange({ type: "set", path: [String(key)], oldValue, newValue: value });
      return true;
    },
  });
}
`;

const OBSERVE_SOLUTION =
  OBSERVE_TYPES +
  String.raw`
const isObject = (v: unknown): v is object => typeof v === "object" && v !== null;

export function observe<T extends object>(target: T, onChange: (change: Change) => void): T {
  const wrap = (obj: object, path: string[]): any =>
    new Proxy(obj, {
      get(t, key, receiver) {
        // Pass the receiver so getters run with this = proxy; wrap nested objects lazily.
        const value = Reflect.get(t, key, receiver);
        return isObject(value) && typeof key === "string" ? wrap(value, [...path, key]) : value;
      },
      set(t, key, value, receiver) {
        const had = Object.prototype.hasOwnProperty.call(t, key);
        const oldValue = had ? (t as Record<PropertyKey, unknown>)[key] : undefined;
        const ok = Reflect.set(t, key, value, receiver);
        if (ok && typeof key === "string" && (!had || !Object.is(oldValue, value))) {
          onChange({ type: "set", path: [...path, key], oldValue, newValue: value });
        }
        return ok;
      },
      deleteProperty(t, key) {
        const had = Object.prototype.hasOwnProperty.call(t, key);
        const oldValue = (t as Record<PropertyKey, unknown>)[key];
        const ok = Reflect.deleteProperty(t, key);
        if (ok && had && typeof key === "string") {
          onChange({ type: "delete", path: [...path, key], oldValue, newValue: undefined });
        }
        return ok;
      },
    });
  return wrap(target, []);
}
`;

const OBSERVE_INDEX = String.raw`import "./styles.css";
import { observe, type Change } from "./src/observe";

const log: string[] = [];
const state = observe({ user: { name: "Ada" }, todos: [] as string[] }, (c: Change) => {
  log.push(c.type + " " + c.path.join(".") + ": " + JSON.stringify(c.oldValue) + " → " + JSON.stringify(c.newValue));
});
state.user.name = "Ada L.";
state.user.name = "Ada L.";
state.todos.push("write tests");
document.getElementById("app")!.innerHTML = '<h1>Change log</h1><pre id="log"></pre>';
document.getElementById("log")!.textContent = log.join("\n");
`;

const OBSERVE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { observe } from "../src/observe";

function setup(initial) {
  const changes = [];
  const raw = initial;
  const state = observe(raw, (c) => changes.push(c));
  return { state, changes, raw };
}

describe("observe", () => {
  it("reports nested changes with their path and values", () => {
    const { state, changes } = setup({ user: { name: "Ada", address: { city: "Kyiv" } } });
    state.user.address.city = "Lviv";
    expect(changes).toEqual([{ type: "set", path: ["user", "address", "city"], oldValue: "Kyiv", newValue: "Lviv" }]);
  });
  it("ignores writes that don't change the value", () => {
    const { state, changes } = setup({ count: 1, nan: NaN });
    state.count = 1;
    state.nan = NaN;
    expect(changes).toEqual([]);
  });
  it("reports new properties with an undefined old value", () => {
    const { state, changes } = setup({});
    state.theme = "dark";
    expect(changes).toEqual([{ type: "set", path: ["theme"], oldValue: undefined, newValue: "dark" }]);
  });
  it("reports deletes", () => {
    const { state, changes } = setup({ a: 1 });
    delete state.a;
    delete state.missing;
    expect(changes).toEqual([{ type: "delete", path: ["a"], oldValue: 1, newValue: undefined }]);
  });
  it("reports one change for an array push", () => {
    const { state, changes } = setup({ items: ["a", "b"] });
    state.items.push("c");
    expect(changes).toEqual([{ type: "set", path: ["items", "2"], oldValue: undefined, newValue: "c" }]);
  });
  it("writes through to the original object and keeps getters working", () => {
    const { state, raw } = setup({ first: "Ada", last: "Lovelace", get full() { return this.first + " " + this.last; } });
    state.last = "Byron";
    expect(raw.last).toBe("Byron");
    expect(state.full).toBe("Ada Byron");
  });
  it("observes objects added later", () => {
    const { state, changes } = setup({});
    state.settings = { lang: "en" };
    state.settings.lang = "uk";
    expect(changes[1]).toEqual({ type: "set", path: ["settings", "lang"], oldValue: "en", newValue: "uk" });
  });
});
`;

const MODEL_STARTER = String.raw`export type FieldType = "string" | "number" | "boolean";

/**
 * defineModel({ name: "string", age: "number" }) returns create(values): a sealed object whose
 * fields are type-checked on creation and on every assignment.
 */
export function defineModel(schema: Record<string, FieldType>) {
  // TODO: validation, sealing, a "Model" string tag
  return function create(values: Record<string, unknown>): Record<string, unknown> {
    return { ...values };
  };
}
`;

const MODEL_SOLUTION = String.raw`export type FieldType = "string" | "number" | "boolean";

export function defineModel(schema: Record<string, FieldType>) {
  const check = (key: string, value: unknown) => {
    const expected = schema[key];
    if (typeof value !== expected || (expected === "number" && Number.isNaN(value))) {
      throw new TypeError(key + " must be a " + expected);
    }
  };

  return function create(values: Record<string, unknown>): Record<string, unknown> {
    for (const key of Object.keys(values)) {
      if (!Object.prototype.hasOwnProperty.call(schema, key)) throw new TypeError("Unknown field: " + key);
    }
    const store: Record<string, unknown> = {};
    const model: Record<string, unknown> = {};
    for (const key of Object.keys(schema)) {
      if (!(key in values)) throw new TypeError("Missing field: " + key);
      check(key, values[key]);
      store[key] = values[key];
      // An enumerable accessor: shows up in keys/JSON, validates every write.
      Object.defineProperty(model, key, {
        enumerable: true,
        get: () => store[key],
        set: (value: unknown) => {
          check(key, value);
          store[key] = value;
        },
      });
    }
    Object.defineProperty(model, Symbol.toStringTag, { value: "Model" }); // non-enumerable
    return Object.seal(model); // no new fields, no deleting
  };
}
`;

const MODEL_INDEX = String.raw`import "./styles.css";
import { defineModel } from "./src/model";

const createUser = defineModel({ name: "string", age: "number", admin: "boolean" });
const lines: string[] = [];
const user = createUser({ name: "Ada", age: 36, admin: false });
lines.push(JSON.stringify(user));
try {
  user.age = "old" as unknown as number;
  lines.push("age accepted a string!");
} catch (e) {
  lines.push("rejected: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Typed model</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const MODEL_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { defineModel } from "../src/model";

const createUser = defineModel({ name: "string", age: "number", admin: "boolean" });

describe("defineModel", () => {
  it("creates objects with the schema's fields, in order", () => {
    const user = createUser({ admin: false, age: 36, name: "Ada" });
    expect(Object.keys(user)).toEqual(["name", "age", "admin"]);
    expect(JSON.stringify(user)).toBe('{"name":"Ada","age":36,"admin":false}');
    expect(user.age).toBe(36);
  });
  it("type-checks on creation and on assignment", () => {
    expect(() => createUser({ name: "Ada", age: "36", admin: false })).toThrow(TypeError);
    const user = createUser({ name: "Ada", age: 36, admin: false });
    user.age = 37;
    expect(user.age).toBe(37);
    expect(() => { user.age = "old"; }).toThrow(TypeError);
    expect(() => { user.age = NaN; }).toThrow(TypeError);
    expect(user.age).toBe(37);
  });
  it("rejects unknown and missing fields", () => {
    expect(() => createUser({ name: "Ada", age: 1, admin: true, extra: 1 })).toThrow("Unknown field");
    expect(() => createUser({ name: "Ada", age: 1 })).toThrow("Missing field");
  });
  it("can't gain or lose properties", () => {
    const user = createUser({ name: "Ada", age: 36, admin: false });
    expect(Object.isSealed(user)).toBe(true);
    expect(() => { user.email = "a@b.c"; }).toThrow(TypeError);
    expect(() => { delete user.name; }).toThrow(TypeError);
  });
  it("has a Model string tag that isn't enumerable", () => {
    const user = createUser({ name: "Ada", age: 36, admin: false });
    expect(Object.prototype.toString.call(user)).toBe("[object Model]");
    expect(Object.keys(user)).not.toContain("Symbol(Symbol.toStringTag)");
  });
  it("keeps instances independent", () => {
    const a = createUser({ name: "A", age: 1, admin: false });
    const b = createUser({ name: "B", age: 2, admin: true });
    a.name = "AA";
    expect(b.name).toBe("B");
  });
});
`;

export default defineTasks([
  quiz(
    "mp-symbol-unique",
    ["js-metaprogramming"],
    1,
    45,
    ["Symbol identity", "Ідентичність символів"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`false true`", "`false true`"],
      ["`true true`", "`true true`"],
      ["`false false`", "`false false`"],
      ["`true false`", "`true false`"],
    ],
    "a",
    [
      "Every `Symbol()` call creates a new, unique value; the description is only a label for debugging. `Symbol.for(key)` looks the key up in a global registry and returns the same symbol for the same string everywhere (even across iframes), which is how separate libraries can agree on a shared symbol.",
      "Кожен виклик `Symbol()` створює нове унікальне значення; опис є лише міткою для налагодження. `Symbol.for(key)` шукає ключ у глобальному реєстрі й повертає той самий символ для того самого рядка будь-де (навіть між iframe), і так окремі бібліотеки можуть домовитися про спільний символ.",
    ],
    { code: 'console.log(Symbol("id") === Symbol("id"), Symbol.for("id") === Symbol.for("id"));', codeLanguage: "js" },
  ),
  quiz(
    "mp-symbol-keys-hidden",
    ["js-metaprogramming"],
    2,
    90,
    ["Symbol-keyed properties", "Властивості з ключами-символами"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`{\"a\":1} [ 'a' ] 2`", "`{\"a\":1} [ 'a' ] 2`"],
      ["`{\"a\":1,\"meta\":2} [ 'a', 'meta' ] 2`", "`{\"a\":1,\"meta\":2} [ 'a', 'meta' ] 2`"],
      ["`{\"a\":1} [ 'a' ] 1`", "`{\"a\":1} [ 'a' ] 1`"],
      ["A `TypeError`: symbols can't be keys", "`TypeError`: символи не можуть бути ключами"],
    ],
    "a",
    [
      "Symbol keys are skipped by `JSON.stringify`, `Object.keys`, `for…in` and `Object.entries`, which makes them good for metadata that shouldn't leak into serialisation or iteration. They aren't truly private, though: `Reflect.ownKeys` and `Object.getOwnPropertySymbols` list them. For real privacy, use `#private` fields or closures.",
      "Ключі-символи пропускають `JSON.stringify`, `Object.keys`, `for…in` і `Object.entries`, тож вони добре підходять для метаданих, що не повинні потрапляти в серіалізацію чи перебір. Однак вони не справді приватні: `Reflect.ownKeys` і `Object.getOwnPropertySymbols` їх показують. Для справжньої приватності використовуйте поля `#private` чи замикання.",
    ],
    { code: 'const meta = Symbol("meta");\nconst obj = { a: 1, [meta]: 2 };\nconsole.log(JSON.stringify(obj), Object.keys(obj), Reflect.ownKeys(obj).length);', codeLanguage: "js" },
  ),
  quiz(
    "mp-freeze-shallow",
    ["js-metaprogramming", w("state-management")],
    2,
    90,
    ["How deep is `freeze`?", "Наскільки глибокий `freeze`?"],
    ["This runs as an ES module. What does it print?", "Цей код виконується як ES-модуль. Що він виведе?"],
    [
      ["`b 3 TypeError`", "`b 3 TypeError`"],
      ["`a 3 TypeError`", "`a 3 TypeError`"],
      ["`b 5 none`", "`b 5 none`"],
      ["`a 3 none`", "`a 3 none`"],
    ],
    "a",
    [
      "`Object.freeze` is shallow: `cfg.retries` can't change (and in strict code the attempt throws a `TypeError`), but `cfg.api` is a separate object that isn't frozen, so its `url` changes. Freeze nested objects recursively if you need deep immutability, or use libraries like Immer.",
      "`Object.freeze` поверхневий: `cfg.retries` змінити не можна (у строгому коді спроба кидає `TypeError`), але `cfg.api` є окремим незамороженим об'єктом, тож його `url` змінюється. Якщо потрібна глибока незмінність, заморожуйте вкладені об'єкти рекурсивно або використовуйте бібліотеки на кшталт Immer.",
    ],
    {
      code: 'const cfg = Object.freeze({ api: { url: "a" }, retries: 3 });\ncfg.api.url = "b";\nlet error = "none";\ntry {\n  cfg.retries = 5;\n} catch (e) {\n  error = e.constructor.name;\n}\nconsole.log(cfg.api.url, cfg.retries, error);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "mp-define-property-defaults",
    ["js-metaprogramming", w("this-prototypes")],
    3,
    90,
    ["`defineProperty` defaults", "Значення за замовчуванням у `defineProperty`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[] {} 42 false`", "`[] {} 42 false`"],
      ["`[ 'hidden' ] {\"hidden\":42} 42 true`", "`[ 'hidden' ] {\"hidden\":42} 42 true`"],
      ["`[] {} undefined false`", "`[] {} undefined false`"],
      ["`[ 'hidden' ] {} 42 false`", "`[ 'hidden' ] {} 42 false`"],
    ],
    "a",
    [
      "Properties created with `Object.defineProperty` default to `writable: false`, `enumerable: false` and `configurable: false`, unlike properties created by assignment or literals, where all three are `true`. So `hidden` exists and can be read, but it's invisible to `Object.keys` and `JSON.stringify`, and it's read-only.",
      "Властивості, створені через `Object.defineProperty`, за замовчуванням мають `writable: false`, `enumerable: false` і `configurable: false`, на відміну від властивостей, створених присвоєнням чи в літералах, де всі три `true`. Тож `hidden` існує й читається, але невидима для `Object.keys` і `JSON.stringify` та доступна лише для читання.",
    ],
    { code: 'const o = {};\nObject.defineProperty(o, "hidden", { value: 42 });\nconsole.log(Object.keys(o), JSON.stringify(o), o.hidden, Object.getOwnPropertyDescriptor(o, "hidden").writable);', codeLanguage: "js" },
  ),
  quiz(
    "mp-getter-setter",
    ["js-metaprogramming"],
    3,
    90,
    ["Getters and setters", "Гетери й сетери"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`100 212 [ '_c', 'f' ]`", "`100 212 [ '_c', 'f' ]`"],
      ["`0 212 [ '_c', 'f' ]`", "`0 212 [ '_c', 'f' ]`"],
      ["`100 32 [ '_c' ]`", "`100 32 [ '_c' ]`"],
      ["`212 212 [ '_c', 'f' ]`", "`212 212 [ '_c', 'f' ]`"],
    ],
    "a",
    [
      "Assigning `temp.f` runs the setter, which stores the Celsius value (212 °F = 100 °C) in `_c`; reading `temp.f` runs the getter, which converts back. Accessors defined in an object literal are enumerable, so `f` appears in `Object.keys` alongside the backing field.",
      "Присвоєння `temp.f` виконує сетер, що зберігає значення в Цельсіях (212 °F = 100 °C) у `_c`; читання `temp.f` виконує гетер, що перетворює назад. Аксесори, визначені в літералі об'єкта, перелічувані, тож `f` з'являється в `Object.keys` поряд із полем для зберігання.",
    ],
    { code: "const temp = {\n  _c: 0,\n  get f() { return (this._c * 9) / 5 + 32; },\n  set f(v) { this._c = ((v - 32) * 5) / 9; },\n};\ntemp.f = 212;\nconsole.log(temp._c, temp.f, Object.keys(temp));", codeLanguage: "js" },
  ),
  quiz(
    "mp-tostringtag",
    ["js-metaprogramming", w("js-values-grammar")],
    3,
    90,
    ["`Symbol.toStringTag`", "`Symbol.toStringTag`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[object Money] [object Array] [object Null]`", "`[object Money] [object Array] [object Null]`"],
      ["`[object Object] [object Array] [object Object]`", "`[object Object] [object Array] [object Object]`"],
      ["`Money [object Array] null`", "`Money [object Array] null`"],
      ["`[object Money] [object Object] [object Null]`", "`[object Money] [object Object] [object Null]`"],
    ],
    "a",
    [
      "`Object.prototype.toString` builds `[object Tag]` from the value's `Symbol.toStringTag` (built-ins like `Array` have internal tags, and `null`/`undefined` are special-cased). Defining the symbol on a class customises the tag for its instances, and `String(obj)` uses `toString` when there's no `toPrimitive` or custom `toString`.",
      "`Object.prototype.toString` будує `[object Tag]` із `Symbol.toStringTag` значення (вбудовані типи на кшталт `Array` мають внутрішні мітки, а `null`/`undefined` обробляються окремо). Визначення символу в класі налаштовує мітку його екземплярів, а `String(obj)` використовує `toString`, коли немає `toPrimitive` чи власного `toString`.",
    ],
    { code: 'class Money {\n  get [Symbol.toStringTag]() {\n    return "Money";\n  }\n}\nconsole.log(String(new Money()), Object.prototype.toString.call([]), Object.prototype.toString.call(null));', codeLanguage: "js" },
  ),
  quiz(
    "mp-proxy-defaults",
    ["js-metaprogramming"],
    4,
    120,
    ["A `get` trap with defaults", "Пастка `get` зі значеннями за замовчуванням"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`10 0 false [ 'ada' ]`", "`10 0 false [ 'ada' ]`"],
      ["`10 0 true [ 'ada', 'bob' ]`", "`10 0 true [ 'ada', 'bob' ]`"],
      ["`10 undefined false [ 'ada' ]`", "`10 undefined false [ 'ada' ]`"],
      ["`10 0 true [ 'ada' ]`", "`10 0 true [ 'ada' ]`"],
    ],
    "a",
    [
      "The `get` trap only intercepts property reads, so a missing key reads as `0` without being created. The `in` operator uses the `has` trap and `Object.keys` uses `ownKeys`; neither is defined, so they fall through to the target, which has only `ada`. A convincing proxy needs consistent traps for every operation it pretends to change.",
      "Пастка `get` перехоплює лише читання властивостей, тож відсутній ключ читається як `0`, не створюючись. Оператор `in` використовує пастку `has`, а `Object.keys` пастку `ownKeys`; жодну не визначено, тож вони переходять до цільового об'єкта, де є лише `ada`. Переконливий проксі потребує узгоджених пасток для кожної операції, яку він нібито змінює.",
    ],
    {
      code: "const withDefault = (obj, fallback) =>\n  new Proxy(obj, {\n    get: (t, k, r) => (k in t ? Reflect.get(t, k, r) : fallback),\n  });\nconst scores = withDefault({ ada: 10 }, 0);\nconsole.log(scores.ada, scores.bob, \"bob\" in scores, Object.keys(scores));",
      codeLanguage: "js",
    },
  ),
  quiz(
    "mp-reflect-receiver",
    ["js-metaprogramming", w("vue")],
    4,
    150,
    ["Why pass the receiver", "Навіщо передавати receiver"],
    ["Both proxies log property reads. What does this print?", "Обидва проксі записують читання властивостей. Що виведе цей код?"],
    [
      ["`1 3`", "`1 3`"],
      ["`3 3`", "`3 3`"],
      ["`1 1`", "`1 1`"],
      ["`3 1`", "`3 1`"],
    ],
    "a",
    [
      "`t[k]` runs the `full` getter with `this` = the **target**, so its reads of `first` and `last` bypass the proxy: only `full` is logged. `Reflect.get(t, k, r)` runs the getter with `this` = the **receiver** (the proxy), so `first` and `last` go through the trap too: 3 reads. Reactivity systems like Vue's rely on this to track every dependency.",
      "`t[k]` виконує гетер `full` з `this` = **цільовий об'єкт**, тож його читання `first` і `last` оминають проксі: записується лише `full`. `Reflect.get(t, k, r)` виконує гетер з `this` = **receiver** (проксі), тож `first` і `last` теж проходять крізь пастку: 3 читання. Системи реактивності, як-от у Vue, спираються на це, щоб відстежити кожну залежність.",
    ],
    {
      code: 'const user = { first: "Ada", last: "Lovelace", get full() { return this.first + " " + this.last; } };\nconst reads = [];\nconst p1 = new Proxy(user, { get(t, k) { reads.push(k); return t[k]; } });\np1.full;\nconst withoutReceiver = reads.length;\nreads.length = 0;\nconst p2 = new Proxy(user, { get(t, k, r) { reads.push(k); return Reflect.get(t, k, r); } });\np2.full;\nconsole.log(withoutReceiver, reads.length);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "mp-proxy-invariant",
    ["js-metaprogramming"],
    5,
    150,
    ["Proxy invariants", "Інваріанти Proxy"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`TypeError`", "`TypeError`"],
      ["`2`", "`2`"],
      ["`1`", "`1`"],
      ["`undefined`", "`undefined`"],
    ],
    "a",
    [
      "Traps can customise almost anything, but they must not contradict facts the engine guarantees. `id` is frozen (non-writable and non-configurable), so a `get` trap reporting a different value would break the guarantee that it never changes, and the engine throws a `TypeError`. Similar invariants apply to `has`, `ownKeys`, `deleteProperty` and `getOwnPropertyDescriptor`.",
      "Пастки можуть налаштувати майже все, але не можуть суперечити фактам, які гарантує рушій. `id` заморожено (недоступне для запису й неналаштовуване), тож пастка `get`, що повідомляє інше значення, порушила б гарантію, що воно ніколи не змінюється, і рушій кидає `TypeError`. Подібні інваріанти діють для `has`, `ownKeys`, `deleteProperty` і `getOwnPropertyDescriptor`.",
    ],
    { code: "const target = Object.freeze({ id: 1 });\nconst p = new Proxy(target, { get: () => 2 });\ntry {\n  console.log(p.id);\n} catch (e) {\n  console.log(e.constructor.name);\n}", codeLanguage: "js" },
  ),
  practice({
    slug: "mp-observe",
    skills: ["js-metaprogramming", w("state-management"), w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["A deep observable with Proxy", "Глибоке спостереження через Proxy"],
    prompt: [
      "Implement `observe(target, onChange)` in `src/observe.ts`. It returns a proxy of `target` that reports changes as `{ type, path, oldValue, newValue }`:\n\n- `set`: assignments at **any depth** (`state.user.address.city = …` → `path: [\"user\", \"address\", \"city\"]`), including objects added later. New properties have `oldValue: undefined`.\n- **Skip** writes that don't change the value (compare with `Object.is`, so `NaN` → `NaN` is no change).\n- `delete`: deleting an existing property reports `{ type: \"delete\", oldValue, newValue: undefined }`.\n- `state.items.push(x)` should produce **one** change (the new index), not a second one for `length`.\n- Writes reach the original object, and getters that use `this` keep working.\n\nUse `get`, `set` and `deleteProperty` traps and forward to `Reflect` with the receiver.",
      "Реалізуйте `observe(target, onChange)` у `src/observe.ts`. Функція повертає проксі `target`, що повідомляє про зміни у формі `{ type, path, oldValue, newValue }`:\n\n- `set`: присвоєння **на будь-якій глибині** (`state.user.address.city = …` → `path: [\"user\", \"address\", \"city\"]`), зокрема в об'єктах, доданих пізніше. Нові властивості мають `oldValue: undefined`.\n- **Пропускайте** записи, що не змінюють значення (порівнюйте через `Object.is`, тож `NaN` → `NaN` не є зміною).\n- `delete`: видалення наявної властивості повідомляє `{ type: \"delete\", oldValue, newValue: undefined }`.\n- `state.items.push(x)` має дати **одну** зміну (новий індекс), а не ще одну для `length`.\n- Записи потрапляють у початковий об'єкт, а гетери, що використовують `this`, і далі працюють.\n\nВикористайте пастки `get`, `set` і `deleteProperty` і перенаправляйте до `Reflect` з receiver.",
    ],
    files: { "/src/observe.ts": OBSERVE_STARTER, "/index.ts": OBSERVE_INDEX },
    visibleFiles: ["/src/observe.ts", "/index.ts"],
    activeFile: "/src/observe.ts",
    tests: OBSERVE_TESTS,
    solution: { "/src/observe.ts": OBSERVE_SOLUTION },
    explanation: [
      "The `get` trap wraps nested objects on access, extending the path, so depth costs nothing until it's used and objects added later are covered automatically. The `set` trap compares old and new values with `Object.is` and only reports real changes; that also removes the redundant `length` write from `push`, because by then the index assignment has already updated the length. Forwarding with `Reflect` and the receiver keeps default semantics, including getters.",
      "Пастка `get` загортає вкладені об'єкти під час доступу, подовжуючи шлях, тож глибина нічого не коштує, доки не використовується, а об'єкти, додані пізніше, покриваються автоматично. Пастка `set` порівнює старе й нове значення через `Object.is` і повідомляє лише про справжні зміни; це прибирає й зайвий запис `length` під час `push`, бо на той момент присвоєння індексу вже оновило довжину. Перенаправлення через `Reflect` з receiver зберігає типову семантику, зокрема гетери.",
    ],
  }),
  practice({
    slug: "mp-typed-model",
    skills: ["js-metaprogramming", w("typescript")],
    complexity: 3,
    estSeconds: 1020,
    framework: "vanilla-ts",
    title: ["A sealed, type-checked model", "Запечатана модель із перевіркою типів"],
    prompt: [
      "Implement `defineModel(schema)` in `src/model.ts`, where `schema` maps field names to `\"string\"`, `\"number\"` or `\"boolean\"`. It returns `create(values)`, which builds a model object:\n\n- It has exactly the schema's fields, in schema order, visible to `Object.keys` and `JSON.stringify`.\n- Values are type-checked on creation **and on every assignment** (`NaN` isn't a valid number); bad values throw a `TypeError` and keep the old value.\n- `create` throws a `TypeError` for unknown or missing fields.\n- The object is **sealed**: adding or deleting properties fails (with a `TypeError` in strict code).\n- `Object.prototype.toString.call(model)` returns `\"[object Model]\"`, via a non-enumerable `Symbol.toStringTag`.\n\nHint: `Object.defineProperty` with accessor descriptors, plus `Object.seal`.",
      "Реалізуйте `defineModel(schema)` у `src/model.ts`, де `schema` зіставляє назви полів з `\"string\"`, `\"number\"` чи `\"boolean\"`. Функція повертає `create(values)`, що будує об'єкт моделі:\n\n- Він має рівно поля схеми в порядку схеми, видимі для `Object.keys` і `JSON.stringify`.\n- Значення перевіряються за типом під час створення **і при кожному присвоєнні** (`NaN` не є допустимим числом); хибні значення кидають `TypeError` і зберігають старе значення.\n- `create` кидає `TypeError` для невідомих чи відсутніх полів.\n- Об'єкт **запечатаний**: додати чи видалити властивості не вийде (у строгому коді з `TypeError`).\n- `Object.prototype.toString.call(model)` повертає `\"[object Model]\"` через неперелічуваний `Symbol.toStringTag`.\n\nПідказка: `Object.defineProperty` з дескрипторами-аксесорами плюс `Object.seal`.",
    ],
    files: { "/src/model.ts": MODEL_STARTER, "/index.ts": MODEL_INDEX },
    visibleFiles: ["/src/model.ts", "/index.ts"],
    activeFile: "/src/model.ts",
    tests: MODEL_TESTS,
    solution: { "/src/model.ts": MODEL_SOLUTION },
    explanation: [
      "Each field is an enumerable accessor whose setter validates before writing to a private store, so invalid values never land and serialisation still sees normal fields. `Object.seal` blocks adding and deleting properties (strict code turns those attempts into `TypeError`s), while accessors keep working because sealing doesn't make properties read-only. A non-enumerable `Symbol.toStringTag` brands the objects without showing up in keys or JSON.",
      "Кожне поле є перелічуваним аксесором, чий сетер перевіряє значення перед записом у приватне сховище, тож хибні значення ніколи не потрапляють усередину, а серіалізація все одно бачить звичайні поля. `Object.seal` блокує додавання й видалення властивостей (строгий код перетворює ці спроби на `TypeError`), а аксесори працюють, бо запечатування не робить властивості доступними лише для читання. Неперелічуваний `Symbol.toStringTag` позначає об'єкти, не з'являючись у ключах чи JSON.",
    ],
  }),
]);
