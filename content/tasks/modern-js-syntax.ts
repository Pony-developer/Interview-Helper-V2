import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const PATH_STARTER = String.raw`export type Path = string | Array<string | number>;

/** Reads a nested value, e.g. getPath(state, "users[0].name", "anonymous"). */
export function getPath(obj: unknown, path: Path, fallback?: unknown): unknown {
  // TODO: brackets, array paths, missing branches and the fallback
  let current: any = obj;
  for (const key of String(path).split(".")) current = current[key];
  return current;
}

/** Returns a copy of obj with the value at path replaced. obj must not change. */
export function setPath<T>(obj: T, path: Path, value: unknown): T {
  // TODO: this mutates the original and can't create missing branches
  const keys = String(path).split(".");
  let current: any = obj;
  for (const key of keys.slice(0, -1)) current = current[key];
  current[keys[keys.length - 1]] = value;
  return obj;
}
`;

const PATH_SOLUTION = String.raw`export type Path = string | Array<string | number>;

type Key = string | number;

function toKeys(path: Path): Key[] {
  if (Array.isArray(path)) return path;
  const keys: Key[] = [];
  // "a.b[0].c" → ["a", "b", 0, "c"]: bracketed digits become numbers, everything else stays a string.
  for (const [, name, index] of path.matchAll(/([^.[\]]+)|\[(\d+)\]/g)) {
    keys.push(index !== undefined ? Number(index) : name!);
  }
  return keys;
}

export function getPath(obj: unknown, path: Path, fallback?: unknown): unknown {
  let current: any = obj;
  for (const key of toKeys(path)) {
    if (current === null || current === undefined) return fallback;
    current = current[key];
  }
  return current === undefined ? fallback : current;
}

export function setPath<T>(obj: T, path: Path, value: unknown): T {
  const keys = toKeys(path);
  const write = (node: any, i: number): any => {
    if (i === keys.length) return value;
    const key = keys[i];
    const child = node?.[key];
    const next = write(child ?? (typeof keys[i + 1] === "number" ? [] : {}), i + 1);
    if (node != null && Object.is(child, next)) return node; // nothing changed below: keep the reference
    const copy: any = Array.isArray(node) ? [...node] : node != null ? { ...node } : typeof key === "number" ? [] : {};
    copy[key] = next;
    return copy;
  };
  return write(obj, 0);
}
`;

const PATH_INDEX = String.raw`import "./styles.css";
import { getPath, setPath } from "./src/path";

const state = { users: [{ name: "Ada", tags: ["admin"] }], settings: { theme: "dark" } };
const lines: string[] = [];
try {
  lines.push("users[0].name → " + String(getPath(state, "users[0].name")));
  lines.push("users[3].name → " + String(getPath(state, "users[3].name", "nobody")));
  const next = setPath(state, "users[0].tags[1]", "editor");
  lines.push("new tags: " + JSON.stringify(getPath(next, "users[0].tags")));
  lines.push("old tags: " + JSON.stringify(state.users[0].tags));
} catch (e) {
  lines.push("error: " + (e as Error).message);
}
document.getElementById("app")!.innerHTML = '<h1>Paths</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n");
`;

const PATH_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { getPath, setPath } from "../src/path";

const state = () => ({ users: [{ name: "Ada", tags: ["admin"] }, { name: "Bob", tags: [] }], settings: { theme: "dark", volume: 0 } });

describe("getPath", () => {
  it("reads dotted and bracketed paths", () => {
    expect(getPath(state(), "users[1].name")).toBe("Bob");
    expect(getPath(state(), "users[0].tags[0]")).toBe("admin");
    expect(getPath(state(), ["settings", "theme"])).toBe("dark");
  });
  it("returns the fallback for missing branches instead of throwing", () => {
    expect(getPath(state(), "users[5].name", "nobody")).toBe("nobody");
    expect(getPath(state(), "profile.address.city")).toBeUndefined();
    expect(getPath(null, "a.b", 1)).toBe(1);
  });
  it("only falls back for undefined, not other falsy values", () => {
    expect(getPath(state(), "settings.volume", 50)).toBe(0);
    expect(getPath({ a: null }, "a", "x")).toBeNull();
  });
});

describe("setPath", () => {
  it("returns an updated copy without mutating the original", () => {
    const before = state();
    const after = setPath(before, "users[0].name", "Ada L.");
    expect(getPath(after, "users[0].name")).toBe("Ada L.");
    expect(before.users[0].name).toBe("Ada");
  });
  it("copies only the changed branch and shares the rest", () => {
    const before = state();
    const after = setPath(before, "users[0].name", "Ada L.");
    expect(after).not.toBe(before);
    expect(after.users).not.toBe(before.users);
    expect(after.users[1]).toBe(before.users[1]);
    expect(after.settings).toBe(before.settings);
  });
  it("keeps arrays as arrays", () => {
    const after = setPath(state(), "users[1].tags[0]", "new");
    expect(Array.isArray(after.users)).toBe(true);
    expect(after.users[1].tags).toEqual(["new"]);
  });
  it("creates missing branches: arrays for numeric keys, objects otherwise", () => {
    const after = setPath({}, "a.list[1].b", 1);
    expect(Array.isArray(after.a.list)).toBe(true);
    expect(after.a.list[1]).toEqual({ b: 1 });
    expect(after.a.list.length).toBe(2);
  });
  it("returns the same object when nothing changes", () => {
    const before = state();
    expect(setPath(before, "settings.theme", "dark")).toBe(before);
  });
});
`;

const SQL_STARTER = String.raw`export type Query = { text: string; values: unknown[] };

/** Tag: sql${"`"}SELECT * FROM users WHERE id = ${"${id}"}${"`"} */
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  return { strings, values };
}

/** Turns a fragment into parameterised SQL: { text: "… WHERE id = $1", values: [id] }. */
export function toQuery(fragment: { strings: readonly string[]; values: unknown[] }): Query {
  // TODO: this pastes values into the SQL text (SQL injection!)
  let text = fragment.strings[0];
  fragment.values.forEach((value, i) => {
    text += String(value) + fragment.strings[i + 1];
  });
  return { text, values: [] };
}
`;

const SQL_SOLUTION = String.raw`export type Query = { text: string; values: unknown[] };

type Fragment = { strings: readonly string[]; values: unknown[] };

// Only objects created by the sql tag count as SQL; a look-alike object from user input is just a value.
const fragments = new WeakSet<object>();

export function sql(strings: TemplateStringsArray, ...values: unknown[]): Fragment {
  const fragment = { strings, values };
  fragments.add(fragment);
  return fragment;
}

export function toQuery(fragment: Fragment): Query {
  const values: unknown[] = [];
  const param = (value: unknown) => {
    if (value === undefined) throw new TypeError("undefined can't be sent as a SQL parameter");
    values.push(value);
    return "$" + values.length;
  };
  const build = (f: Fragment): string => {
    let text = f.strings[0];
    f.values.forEach((value, i) => {
      if (typeof value === "object" && value !== null && fragments.has(value)) {
        text += build(value as Fragment);
      } else if (Array.isArray(value)) {
        if (value.length === 0) throw new RangeError("Can't expand an empty list");
        text += value.map(param).join(", ");
      } else {
        text += param(value);
      }
      text += f.strings[i + 1];
    });
    return text;
  };
  return { text: build(fragment), values };
}
`;

const SQL_INDEX = String.raw`import "./styles.css";
import { sql, toQuery } from "./src/sql";

const name = "Robert'); DROP TABLE students;--";
const ids = [1, 2, 3];
const active = sql${"`"}active = ${"${true}"}${"`"};
let output: string;
try {
  const q = toQuery(sql${"`"}SELECT * FROM students WHERE name = ${"${name}"} AND id IN (${"${ids}"}) AND ${"${active}"}${"`"});
  output = q.text + "\n" + JSON.stringify(q.values);
} catch (e) {
  output = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Parameterised SQL</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = output;
`;

const SQL_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { sql, toQuery } from "../src/sql";

describe("sql tag", () => {
  it("turns values into numbered placeholders", () => {
    const id = 7;
    const status = "active";
    expect(toQuery(sql${"`"}SELECT * FROM users WHERE id = ${"${id}"} AND status = ${"${status}"}${"`"})).toEqual({
      text: "SELECT * FROM users WHERE id = $1 AND status = $2",
      values: [7, "active"],
    });
  });
  it("never puts values into the SQL text", () => {
    const evil = "x'; DROP TABLE users;--";
    const q = toQuery(sql${"`"}SELECT * FROM users WHERE name = ${"${evil}"}${"`"});
    expect(q.text).toBe("SELECT * FROM users WHERE name = $1");
    expect(q.values).toEqual([evil]);
  });
  it("inlines nested fragments and keeps numbering going", () => {
    const filter = sql${"`"}age > ${"${18}"} AND country = ${"${"}"UA"}${"`"};
    const q = toQuery(sql${"`"}SELECT * FROM users WHERE id <> ${"${1}"} AND ${"${filter}"} LIMIT ${"${10}"}${"`"});
    expect(q.text).toBe("SELECT * FROM users WHERE id <> $1 AND age > $2 AND country = $3 LIMIT $4");
    expect(q.values).toEqual([1, 18, "UA", 10]);
  });
  it("expands arrays into a list of placeholders", () => {
    const q = toQuery(sql${"`"}SELECT * FROM users WHERE id IN (${"${[4, 5, 6]}"})${"`"});
    expect(q.text).toBe("SELECT * FROM users WHERE id IN ($1, $2, $3)");
    expect(q.values).toEqual([4, 5, 6]);
  });
  it("rejects empty lists and undefined values", () => {
    expect(() => toQuery(sql${"`"}SELECT 1 WHERE id IN (${"${[]}"})${"`"})).toThrow(RangeError);
    expect(() => toQuery(sql${"`"}SELECT 1 WHERE id = ${"${undefined}"}${"`"})).toThrow(TypeError);
  });
  it("treats look-alike objects from outside as plain values", () => {
    const fake = { strings: ["1=1 OR "], values: [] };
    const q = toQuery(sql${"`"}SELECT * FROM t WHERE data = ${"${fake}"}${"`"});
    expect(q.text).toBe("SELECT * FROM t WHERE data = $1");
    expect(q.values).toEqual([fake]);
  });
  it("keeps null and false as parameters", () => {
    expect(toQuery(sql${"`"}UPDATE t SET a = ${"${null}"}, b = ${"${false}"}${"`"}).values).toEqual([null, false]);
  });
});
`;

export default defineTasks([
  quiz(
    "mjs-default-null",
    ["modern-js-syntax"],
    1,
    45,
    ["When do parameter defaults apply?", "Коли застосовуються значення параметрів за замовчуванням?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'guest', null, '' ]`", "`[ 'guest', null, '' ]`"],
      ["`[ 'guest', 'guest', 'guest' ]`", "`[ 'guest', 'guest', 'guest' ]`"],
      ["`[ 'guest', 'guest', '' ]`", "`[ 'guest', 'guest', '' ]`"],
      ["`[ undefined, null, '' ]`", "`[ undefined, null, '' ]`"],
    ],
    "a",
    [
      "A default applies only when the argument is `undefined`, whether it's missing or passed explicitly. `null` and `\"\"` are real values, so they're kept. If you want `null` to fall back too, use `name ?? \"guest\"` inside the function.",
      "Значення за замовчуванням застосовується, лише коли аргумент `undefined`, чи то пропущений, чи переданий явно. `null` і `\"\"` є справжніми значеннями, тож вони зберігаються. Якщо треба, щоб і `null` давав запасне значення, використайте `name ?? \"guest\"` усередині функції.",
    ],
    { code: 'function greet(name = "guest") {\n  return name;\n}\nconsole.log([greet(undefined), greet(null), greet("")]);', codeLanguage: "js" },
  ),
  quiz(
    "mjs-destructure-defaults",
    ["modern-js-syntax"],
    2,
    60,
    ["Destructuring defaults", "Значення за замовчуванням у деструктуризації"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`null 2 0`", "`null 2 0`"],
      ["`1 2 3`", "`1 2 3`"],
      ["`1 2 0`", "`1 2 0`"],
      ["`null undefined 0`", "`null undefined 0`"],
    ],
    "a",
    [
      "Destructuring defaults follow the same rule as parameter defaults: they kick in only for `undefined`. `a` is `null` and `c` is `0`, both real values, so only `b` takes its default.",
      "Значення за замовчуванням у деструктуризації підкоряються тому самому правилу, що й у параметрах: вони спрацьовують лише для `undefined`. `a` дорівнює `null`, а `c` дорівнює `0`, і обидва є справжніми значеннями, тож значення за замовчуванням отримує лише `b`.",
    ],
    { code: "const { a = 1, b = 2, c = 3 } = { a: null, b: undefined, c: 0 };\nconsole.log(a, b, c);", codeLanguage: "js" },
  ),
  quiz(
    "mjs-nullish-vs-or",
    ["modern-js-syntax", w("type-coercion")],
    1,
    60,
    ["`??` vs `||`", "`??` проти `||`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 50, 0, 'Untitled', '' ]`", "`[ 50, 0, 'Untitled', '' ]`"],
      ["`[ 50, 50, 'Untitled', 'Untitled' ]`", "`[ 50, 50, 'Untitled', 'Untitled' ]`"],
      ["`[ 0, 0, '', '' ]`", "`[ 0, 0, '', '' ]`"],
      ["`[ 0, 50, '', 'Untitled' ]`", "`[ 0, 50, '', 'Untitled' ]`"],
    ],
    "a",
    [
      "`||` falls back for every falsy value, so a deliberate volume of `0` or an empty title gets overwritten. `??` falls back only for `null` and `undefined`, which is almost always what you want for settings and optional values.",
      "`||` бере запасне значення для будь-якого хибного значення, тож навмисна гучність `0` чи порожній заголовок перезаписуються. `??` бере запасне значення лише для `null` і `undefined`, і це майже завжди те, що потрібно для налаштувань і необов'язкових значень.",
    ],
    { code: 'const s = { volume: 0, title: "" };\nconsole.log([s.volume || 50, s.volume ?? 50, s.title || "Untitled", s.title ?? "Untitled"]);', codeLanguage: "js" },
  ),
  quiz(
    "mjs-spread-shallow",
    ["modern-js-syntax", w("state-management")],
    2,
    60,
    ["How deep does spread copy?", "Наскільки глибоко копіює spread?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'a', 'b' ] 1`", "`[ 'a', 'b' ] 1`"],
      ["`[ 'a' ] 1`", "`[ 'a' ] 1`"],
      ["`[ 'a', 'b' ] 2`", "`[ 'a', 'b' ] 2`"],
      ["`[ 'a' ] 2`", "`[ 'a' ] 2`"],
    ],
    "a",
    [
      "Spread makes a **shallow** copy: `copy.n` is a separate property, but `copy.tags` points to the same array as `base.tags`, so pushing to it changes both. In immutable updates, copy every level you change: `{ ...base, tags: [...base.tags, \"b\"] }`, or use `structuredClone` for a full deep copy.",
      "Spread робить **поверхневу** копію: `copy.n` є окремою властивістю, але `copy.tags` вказує на той самий масив, що й `base.tags`, тож додавання в нього змінює обидва. У незмінних оновленнях копіюйте кожен рівень, який змінюєте: `{ ...base, tags: [...base.tags, \"b\"] }`, або використайте `structuredClone` для повної глибокої копії.",
    ],
    { code: 'const base = { tags: ["a"], n: 1 };\nconst copy = { ...base };\ncopy.tags.push("b");\ncopy.n = 2;\nconsole.log(base.tags, base.n);', codeLanguage: "js" },
  ),
  quiz(
    "mjs-spread-undefined-overrides",
    ["modern-js-syntax"],
    2,
    75,
    ["Merging options with spread", "Злиття опцій через spread"],
    ["A function merges user options over defaults. What does this print?", "Функція зливає опції користувача поверх значень за замовчуванням. Що виведе цей код?"],
    [
      ["`undefined 1000`", "`undefined 1000`"],
      ["`3 1000`", "`3 1000`"],
      ["`undefined undefined`", "`undefined undefined`"],
      ["`3 undefined`", "`3 undefined`"],
    ],
    "a",
    [
      "Spread copies every own enumerable property, including ones whose value is `undefined`, and later properties win. So an explicit `retries: undefined` (common when forwarding optional arguments) wipes out the default. Drop undefined keys first, or merge per key with `??`.",
      "Spread копіює кожну власну перелічувану властивість, зокрема ті, чиє значення `undefined`, і пізніші властивості перемагають. Тож явне `retries: undefined` (часто трапляється під час передавання необов'язкових аргументів) стирає значення за замовчуванням. Спершу приберіть ключі зі значенням undefined або зливайте по ключах через `??`.",
    ],
    { code: "const defaults = { retries: 3, timeout: 1000 };\nconst user = { retries: undefined };\nconst cfg = { ...defaults, ...user };\nconsole.log(cfg.retries, cfg.timeout);", codeLanguage: "js" },
  ),
  quiz(
    "mjs-destructure-iterables",
    ["modern-js-syntax", w("iterators-generators")],
    3,
    75,
    ["Array destructuring takes any iterable", "Деструктуризація масиву приймає будь-який ітерований об'єкт"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`x y h [ 'e', 'y' ]`", "`x y h [ 'e', 'y' ]`"],
      ["`x x h ey`", "`x x h ey`"],
      ["A `TypeError`: a Set isn't an array", "`TypeError`: Set не є масивом"],
      ["`undefined undefined h [ 'e', 'y' ]`", "`undefined undefined h [ 'e', 'y' ]`"],
    ],
    "a",
    [
      "Array destructuring uses the iteration protocol, not indexes, so it works with Sets (which have already removed the duplicate `\"x\"`), strings, Maps and generators. A rest element always collects into a real array, even when the source is a string.",
      "Деструктуризація масиву використовує протокол ітерації, а не індекси, тож працює з Set (який уже прибрав дублікат `\"x\"`), рядками, Map і генераторами. Rest-елемент завжди збирає в справжній масив, навіть коли джерелом є рядок.",
    ],
    { code: 'const [a, b] = new Set(["x", "y", "x"]);\nconst [c, ...d] = "hey";\nconsole.log(a, b, c, d);', codeLanguage: "js" },
  ),
  quiz(
    "mjs-default-per-call",
    ["modern-js-syntax"],
    2,
    60,
    ["Are defaults shared between calls?", "Чи спільні значення за замовчуванням між викликами?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 1 ] [ 2 ]`", "`[ 1 ] [ 2 ]`"],
      ["`[ 1 ] [ 1, 2 ]`", "`[ 1 ] [ 1, 2 ]`"],
      ["`[ 1, 2 ] [ 1, 2 ]`", "`[ 1, 2 ] [ 1, 2 ]`"],
      ["`undefined undefined`", "`undefined undefined`"],
    ],
    "a",
    [
      "JavaScript evaluates default expressions **on every call** that needs them, so each call gets a fresh array. (Python evaluates defaults once at definition time, which is why the same code there would print `[1] [1, 2]`, a well-known gotcha.)",
      "JavaScript обчислює вирази значень за замовчуванням **під час кожного виклику**, що їх потребує, тож кожен виклик отримує новий масив. (Python обчислює значення за замовчуванням один раз під час визначення, тому той самий код там вивів би `[1] [1, 2]`, і це відома пастка.)",
    ],
    { code: "function add(item, list = []) {\n  list.push(item);\n  return list;\n}\nconsole.log(add(1), add(2));", codeLanguage: "js" },
  ),
  quiz(
    "mjs-function-length",
    ["modern-js-syntax"],
    3,
    75,
    ["`length` with defaults and rest", "`length` зі значеннями за замовчуванням і rest"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`1 0 2`", "`1 0 2`"],
      ["`3 1 2`", "`3 1 2`"],
      ["`2 0 2`", "`2 0 2`"],
      ["`1 1 1`", "`1 1 1`"],
    ],
    "a",
    [
      "A function's `length` counts the parameters **before the first one with a default** or the rest parameter. A destructuring pattern counts as one parameter. Libraries that dispatch on `length` (currying helpers, Express error middleware with 4 parameters) break silently when someone adds a default.",
      "`length` функції рахує параметри **до першого зі значенням за замовчуванням** чи rest-параметра. Шаблон деструктуризації рахується як один параметр. Бібліотеки, що розгалужуються за `length` (помічники каррінгу, middleware для помилок у Express із 4 параметрами), непомітно ламаються, коли хтось додає значення за замовчуванням.",
    ],
    { code: "console.log(((a, b = 1, c) => {}).length, ((...args) => {}).length, (({ x }, y) => {}).length);", codeLanguage: "js" },
  ),
  quiz(
    "mjs-optional-chaining-short-circuit",
    ["modern-js-syntax"],
    3,
    90,
    ["How far does `?.` short-circuit?", "Наскільки далеко обриває ланцюжок `?.`?"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`undefined 0`", "`undefined 0`"],
      ["`undefined 1`", "`undefined 1`"],
      ["A `TypeError` from reading `.name`", "`TypeError` під час читання `.name`"],
      ["`null 0`", "`null 0`"],
    ],
    "a",
    [
      "When `user` is nullish, `?.` skips the **whole rest of the chain**: `.profile.name.toUpperCase(...)` isn't evaluated, so the argument `next()` never runs, and the result is `undefined` (not `null`). You only need `?.` at the points that can actually be nullish.",
      "Коли `user` є nullish, `?.` пропускає **всю решту ланцюжка**: `.profile.name.toUpperCase(...)` не обчислюється, тож аргумент `next()` ніколи не виконується, а результатом є `undefined` (не `null`). `?.` потрібен лише там, де значення справді може бути nullish.",
    ],
    { code: "let calls = 0;\nconst next = () => {\n  calls++;\n  return 1;\n};\nconst user = null;\nconst result = user?.profile.name.toUpperCase(next());\nconsole.log(result, calls);", codeLanguage: "js" },
  ),
  quiz(
    "mjs-default-param-tdz",
    ["modern-js-syntax", w("closures-scope")],
    4,
    90,
    ["Defaults that refer to other parameters", "Значення за замовчуванням, що посилаються на інші параметри"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ [ 1, 2 ], 'ReferenceError' ]`", "`[ [ 1, 2 ], 'ReferenceError' ]`"],
      ["`[ [ 1, 2 ], [ undefined, 2 ] ]`", "`[ [ 1, 2 ], [ undefined, 2 ] ]`"],
      ["`[ [ 1, 2 ], [ 2, 2 ] ]`", "`[ [ 1, 2 ], [ 2, 2 ] ]`"],
      ["`[ 'ReferenceError' ]`", "`[ 'ReferenceError' ]`"],
    ],
    "a",
    [
      "Parameters are initialised left to right, like `let` declarations in their own scope. `f(1)` never evaluates `a`'s default. `f()` evaluates `a = b` while `b` is still in its temporal dead zone, which throws a `ReferenceError`. Defaults may only refer to parameters declared **before** them.",
      "Параметри ініціалізуються зліва направо, як оголошення `let` у власній області видимості. `f(1)` ніколи не обчислює значення за замовчуванням для `a`. `f()` обчислює `a = b`, коли `b` ще в тимчасовій мертвій зоні, і це кидає `ReferenceError`. Значення за замовчуванням можуть посилатися лише на параметри, оголошені **перед** ними.",
    ],
    { code: "function f(a = b, b = 2) {\n  return [a, b];\n}\nconst out = [];\ntry {\n  out.push(f(1));\n  out.push(f());\n} catch (e) {\n  out.push(e.constructor.name);\n}\nconsole.log(out);", codeLanguage: "js" },
  ),
  quiz(
    "mjs-tagged-template-raw",
    ["modern-js-syntax"],
    4,
    120,
    ["Inside a tagged template", "Усередині тегованого шаблону"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`a|\\nb| 2`", "`a|\\nb| 2`"],
      ["`a|b 2`", "`a|b 2`"],
      ["`a|1|\\nb|2 0`", "`a|1|\\nb|2 0`"],
      ["`a|\\nb 2`", "`a|\\nb 2`"],
    ],
    "a",
    [
      "A tag receives the literal parts and the values separately. With two `${}` slots there are always **three** strings, so the last one is `\"\"`, and joining gives a trailing `|`. `strings.raw` keeps escapes as written, so `\\n` stays a backslash and an `n` instead of a newline (that's how `String.raw` works).",
      "Тег отримує літеральні частини й значення окремо. З двома слотами `${}` рядків завжди **три**, тож останній дорівнює `\"\"`, і з'єднання дає `|` у кінці. `strings.raw` зберігає екранування як написано, тож `\\n` лишається зворотною скісною рискою й `n`, а не переходом на новий рядок (саме так працює `String.raw`).",
    ],
    { code: "const tag = (strings, ...values) => strings.raw.join(\"|\") + \" \" + values.length;\nconsole.log(tag`a${1}\\nb${2}`);", codeLanguage: "js" },
  ),
  quiz(
    "mjs-logical-assignment",
    ["modern-js-syntax", w("js-metaprogramming")],
    4,
    120,
    ["Logical assignment and setters", "Логічне присвоєння й сетери"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`w 1`", "`w 1`"],
      ["`w 3`", "`w 3`"],
      ["`z 2`", "`z 2`"],
      ["`x 0`", "`x 0`"],
    ],
    "a",
    [
      "Logical assignment operators short-circuit **the assignment itself**. `??=` sees `\"x\"`, which isn't nullish, and `||=` sees a truthy value, so neither calls the setter. `&&=` sees a truthy value and assigns `\"w\"`: one setter call. `o.v = o.v ?? \"y\"` would have called the setter every time, which matters for proxies, reactive state and expensive setters.",
      "Оператори логічного присвоєння обривають **саме присвоєння**. `??=` бачить `\"x\"`, що не є nullish, а `||=` бачить істинне значення, тож жоден не викликає сетер. `&&=` бачить істинне значення й присвоює `\"w\"`: один виклик сетера. `o.v = o.v ?? \"y\"` викликав би сетер щоразу, а це важливо для проксі, реактивного стану й дорогих сетерів.",
    ],
    {
      code: 'let sets = 0;\nconst o = {\n  _v: "x",\n  get v() { return this._v; },\n  set v(x) { sets++; this._v = x; },\n};\no.v ??= "y";\no.v ||= "z";\no.v &&= "w";\nconsole.log(o.v, sets);',
      codeLanguage: "js",
    },
  ),
  practice({
    slug: "mjs-path-get-set",
    skills: ["modern-js-syntax", w("state-management"), w("typescript")],
    complexity: 3,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Safe nested reads and immutable writes", "Безпечне вкладене читання й незмінний запис"],
    prompt: [
      "Implement two helpers in `src/path.ts`. A path is a string like `\"users[0].tags[1]\"` (bracketed digits are array indexes) or an array of keys like `[\"users\", 0, \"name\"]`.\n\n- `getPath(obj, path, fallback?)` reads a nested value. It never throws on missing branches, and returns `fallback` **only when the result is `undefined`** (`0`, `\"\"` and `null` are real values).\n- `setPath(obj, path, value)` returns an updated **copy** without mutating `obj`:\n  - Copy only the objects and arrays along the path; every other branch keeps its reference (structural sharing, as Redux and React expect).\n  - Arrays stay arrays.\n  - Missing branches are created: an array when the next key is a number, otherwise an object.\n  - If the value is already there (`Object.is`), return the original `obj`.",
      "Реалізуйте два помічники в `src/path.ts`. Шлях є рядком на кшталт `\"users[0].tags[1]\"` (цифри в дужках є індексами масиву) або масивом ключів на кшталт `[\"users\", 0, \"name\"]`.\n\n- `getPath(obj, path, fallback?)` читає вкладене значення. Вона ніколи не кидає помилку на відсутніх гілках і повертає `fallback` **лише коли результат `undefined`** (`0`, `\"\"` і `null` є справжніми значеннями).\n- `setPath(obj, path, value)` повертає оновлену **копію**, не змінюючи `obj`:\n  - Копіюйте лише об'єкти й масиви вздовж шляху; кожна інша гілка зберігає своє посилання (структурне спільне використання, як очікують Redux і React).\n  - Масиви лишаються масивами.\n  - Відсутні гілки створюються: масив, коли наступний ключ є числом, інакше об'єкт.\n  - Якщо значення вже таке (`Object.is`), поверніть початковий `obj`.",
    ],
    files: { "/src/path.ts": PATH_STARTER, "/index.ts": PATH_INDEX },
    visibleFiles: ["/src/path.ts", "/index.ts"],
    activeFile: "/src/path.ts",
    tests: PATH_TESTS,
    solution: { "/src/path.ts": PATH_SOLUTION },
    explanation: [
      "Parsing the path once into keys (numbers for bracketed indexes) makes both functions simple loops or recursions. `getPath` stops as soon as it meets `null` or `undefined` and applies the fallback only for `undefined`, mirroring `??`-style defaults. `setPath` recurses to the leaf and, on the way back up, copies each container with spread (`[...arr]` or `{ ...obj }`), so only the changed path gets new references. Returning the original node when nothing changed below avoids needless re-renders.",
      "Одноразовий розбір шляху на ключі (числа для індексів у дужках) робить обидві функції простими циклами чи рекурсіями. `getPath` зупиняється, щойно зустрічає `null` чи `undefined`, і застосовує запасне значення лише для `undefined`, як значення за замовчуванням у стилі `??`. `setPath` рекурсивно доходить до листка й на зворотному шляху копіює кожен контейнер через spread (`[...arr]` чи `{ ...obj }`), тож нові посилання отримує лише змінений шлях. Повернення початкового вузла, коли нижче нічого не змінилося, запобігає зайвим рендерам.",
    ],
  }),
  practice({
    slug: "mjs-sql-tag",
    skills: ["modern-js-syntax", w("web-security"), w("sql")],
    complexity: 4,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["A safe `sql` tagged template", "Безпечний тегований шаблон `sql`"],
    prompt: [
      "Libraries like `postgres` and `slonik` let you write ``sql`SELECT * FROM users WHERE id = ${id}` `` safely. Implement `sql` and `toQuery(fragment)` in `src/sql.ts`. `toQuery` returns `{ text, values }`, where values become numbered placeholders (`$1`, `$2`, …) and **never** go into the SQL text.\n\n- Fragments created with `sql` can be nested inside other fragments; their text is inlined and numbering continues across the whole query.\n- Arrays expand to a list of placeholders (`IN (${ids})` → `IN ($1, $2, $3)`). An empty array throws a `RangeError`.\n- `undefined` throws a `TypeError` (it's almost always a bug); `null` and `false` are fine.\n- Only objects created by your `sql` tag count as fragments: a plain object that merely looks like one (for example, parsed from a request body) must be treated as a value.",
      "Бібліотеки на кшталт `postgres` і `slonik` дають безпечно писати ``sql`SELECT * FROM users WHERE id = ${id}` ``. Реалізуйте `sql` і `toQuery(fragment)` у `src/sql.ts`. `toQuery` повертає `{ text, values }`, де значення стають нумерованими заповнювачами (`$1`, `$2`, …) і **ніколи** не потрапляють у текст SQL.\n\n- Фрагменти, створені через `sql`, можна вкладати в інші фрагменти; їхній текст вбудовується, а нумерація продовжується по всьому запиту.\n- Масиви розгортаються в список заповнювачів (`IN (${ids})` → `IN ($1, $2, $3)`). Порожній масив кидає `RangeError`.\n- `undefined` кидає `TypeError` (це майже завжди помилка); `null` і `false` допустимі.\n- Фрагментами вважаються лише об'єкти, створені вашим тегом `sql`: звичайний об'єкт, що лише схожий на фрагмент (наприклад, розібраний із тіла запиту), треба обробляти як значення.",
    ],
    files: { "/src/sql.ts": SQL_STARTER, "/index.ts": SQL_INDEX },
    visibleFiles: ["/src/sql.ts", "/index.ts"],
    activeFile: "/src/sql.ts",
    tests: SQL_TESTS,
    solution: { "/src/sql.ts": SQL_SOLUTION },
    explanation: [
      "A tag function receives the literal parts and the interpolated values separately, which is exactly what parameterised SQL needs: the parts are trusted code written by the developer, the values are data. `toQuery` walks the parts and values in order with one shared `values` array, so placeholder numbers continue through nested fragments. Registering fragments in a `WeakSet` (instead of checking their shape) means attacker-controlled objects can never be inlined as SQL, and the `WeakSet` doesn't keep old fragments alive.",
      "Функція-тег отримує літеральні частини й підставлені значення окремо, а саме це й потрібно параметризованому SQL: частини є довіреним кодом розробника, а значення є даними. `toQuery` обходить частини й значення по черзі з одним спільним масивом `values`, тож номери заповнювачів продовжуються крізь вкладені фрагменти. Реєстрація фрагментів у `WeakSet` (замість перевірки їхньої форми) означає, що об'єкти під контролем зловмисника ніколи не вбудуються як SQL, а `WeakSet` не тримає старі фрагменти живими.",
    ],
  }),
]);
