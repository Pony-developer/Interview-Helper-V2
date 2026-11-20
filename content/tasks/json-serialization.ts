import { defineTasks } from "@/lib/content/schema";
import { practice, quiz, w } from "./_helpers";

const CODEC_STARTER = String.raw`/**
 * JSON that round-trips Date, BigInt, Map, Set, NaN, ±Infinity and -0, by encoding them as
 * { "$type": "...", "value": ... } objects. Plain data stays plain JSON.
 */
export function serialize(value: unknown, space?: number): string {
  return JSON.stringify(value, null, space); // TODO
}

export function deserialize(text: string): unknown {
  return JSON.parse(text); // TODO
}
`;

const CODEC_SOLUTION = String.raw`const TAG = "$type";

const tag = (type: string, value: unknown) => ({ [TAG]: type, value });

export function serialize(value: unknown, space?: number): string {
  return JSON.stringify(
    value,
    function (this: any, key: string, current: unknown) {
      // this[key] is the original value; current has already been through toJSON (Dates are strings by now).
      const original = this[key];
      if (original instanceof Date) return tag("Date", Number.isNaN(original.getTime()) ? null : original.toISOString());
      if (typeof original === "bigint") return tag("BigInt", original.toString());
      if (original instanceof Map) return tag("Map", [...original]);
      if (original instanceof Set) return tag("Set", [...original]);
      if (typeof original === "number" && (!Number.isFinite(original) || Object.is(original, -0))) {
        return tag("Number", Object.is(original, -0) ? "-0" : String(original));
      }
      // A user object that happens to have a "$type" key is escaped, so it can't be mistaken for a tag.
      if (current === original && original !== null && typeof original === "object" && !Array.isArray(original) && Object.prototype.hasOwnProperty.call(original, TAG)) {
        return tag("Object", Object.entries(original));
      }
      return current;
    },
    space,
  );
}

export function deserialize(text: string): unknown {
  // The reviver runs bottom-up, so values inside Maps, Sets and escaped objects are already restored.
  return JSON.parse(text, (_key, value) => {
    if (value === null || typeof value !== "object" || Array.isArray(value) || typeof value[TAG] !== "string") return value;
    switch (value[TAG]) {
      case "Date":
        return new Date(value.value === null ? NaN : value.value);
      case "BigInt":
        return BigInt(value.value);
      case "Map":
        return new Map(value.value);
      case "Set":
        return new Set(value.value);
      case "Number":
        return Number(value.value);
      case "Object":
        return Object.fromEntries(value.value);
      default:
        return value;
    }
  });
}
`;

const CODEC_INDEX = String.raw`import "./styles.css";
import { deserialize, serialize } from "./src/codec";

const original = {
  createdAt: new Date("2024-03-10T09:00:00Z"),
  id: 9007199254740993n,
  tags: new Set(["a", "b"]),
  scores: new Map([["ada", 10]]),
  ratio: NaN,
};
let output: string;
try {
  const text = serialize(original, 2);
  const copy: any = deserialize(text);
  output = text + "\n\nrestored types: " + [copy.createdAt instanceof Date, typeof copy.id, copy.tags instanceof Set, copy.scores instanceof Map, Number.isNaN(copy.ratio)].join(", ");
} catch (e) {
  output = "error: " + (e as Error).message;
}
document.getElementById("app")!.innerHTML = '<h1>Typed JSON</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = output;
`;

const CODEC_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { deserialize, serialize } from "../src/codec";

const roundTrip = (v) => deserialize(serialize(v));

describe("serialize / deserialize", () => {
  it("keeps plain data as plain JSON", () => {
    const data = { a: 1, b: "x", c: [true, null], d: { e: 2 } };
    expect(JSON.parse(serialize(data))).toEqual(data);
    expect(roundTrip(data)).toEqual(data);
  });
  it("restores dates, including invalid ones", () => {
    const result = roundTrip({ at: new Date("2024-03-10T09:00:00Z"), bad: new Date("nope") });
    expect(result.at).toBeInstanceOf(Date);
    expect(result.at.toISOString()).toBe("2024-03-10T09:00:00.000Z");
    expect(Number.isNaN(result.bad.getTime())).toBe(true);
  });
  it("restores BigInt, Map and Set, including nested values", () => {
    const result = roundTrip({
      id: 9007199254740993n,
      map: new Map([["when", new Date(0)], ["ids", new Set([1n, 2n])]]),
    });
    expect(result.id).toBe(9007199254740993n);
    expect(result.map).toBeInstanceOf(Map);
    expect(result.map.get("when")).toBeInstanceOf(Date);
    expect([...result.map.get("ids")]).toEqual([1n, 2n]);
  });
  it("restores NaN, Infinity and -0", () => {
    const result = roundTrip([NaN, Infinity, -Infinity, -0, 0]);
    expect(Number.isNaN(result[0])).toBe(true);
    expect(result[1]).toBe(Infinity);
    expect(result[2]).toBe(-Infinity);
    expect(Object.is(result[3], -0)).toBe(true);
    expect(Object.is(result[4], 0)).toBe(true);
  });
  it("doesn't confuse user data that has a $type key with a tag", () => {
    const data = { item: { $type: "Map", value: [["a", 1]] }, other: { $type: "custom" } };
    expect(roundTrip(data)).toEqual(data);
  });
  it("still uses toJSON on other objects, and drops undefined like JSON", () => {
    class Money {
      constructor(cents) { this.cents = cents; }
      toJSON() { return (this.cents / 100).toFixed(2); }
    }
    expect(roundTrip({ price: new Money(1999), gone: undefined })).toEqual({ price: "19.99" });
  });
  it("throws on cycles", () => {
    const a = {};
    a.self = a;
    expect(() => serialize(a)).toThrow(TypeError);
  });
});
`;

const SAFE_STARTER = String.raw`export type Schema =
  | { type: "string"; minLength?: number; maxLength?: number; enum?: string[] }
  | { type: "number"; integer?: boolean; min?: number; max?: number }
  | { type: "boolean" }
  | { type: "array"; items: Schema; maxItems?: number }
  | { type: "object"; properties: Record<string, Schema>; required?: string[] };

export type Issue = { path: string; message: string };
export type Result = { ok: true; value: unknown } | { ok: false; errors: Issue[] };

/** Parses untrusted JSON and validates it against schema. Never throws. */
export function safeParse(text: string, schema: Schema): Result {
  // TODO: throws on bad JSON, validates nothing, keeps unknown keys
  return { ok: true, value: JSON.parse(text) };
}
`;

const SAFE_SOLUTION = String.raw`export type Schema =
  | { type: "string"; minLength?: number; maxLength?: number; enum?: string[] }
  | { type: "number"; integer?: boolean; min?: number; max?: number }
  | { type: "boolean" }
  | { type: "array"; items: Schema; maxItems?: number }
  | { type: "object"; properties: Record<string, Schema>; required?: string[] };

export type Issue = { path: string; message: string };
export type Result = { ok: true; value: unknown } | { ok: false; errors: Issue[] };

const join = (path: string, key: string | number) =>
  typeof key === "number" ? path + "[" + key + "]" : path ? path + "." + key : key;

function check(data: any, schema: Schema, path: string, errors: Issue[]): unknown {
  const fail = (message: string) => {
    errors.push({ path, message });
    return undefined;
  };
  switch (schema.type) {
    case "string":
      if (typeof data !== "string") return fail("Expected string");
      if (schema.minLength !== undefined && data.length < schema.minLength) return fail("Too short");
      if (schema.maxLength !== undefined && data.length > schema.maxLength) return fail("Too long");
      if (schema.enum && !schema.enum.includes(data)) return fail("Must be one of: " + schema.enum.join(", "));
      return data;
    case "number":
      if (typeof data !== "number" || !Number.isFinite(data)) return fail("Expected number");
      if (schema.integer && !Number.isInteger(data)) return fail("Expected integer");
      if (schema.min !== undefined && data < schema.min) return fail("Too small");
      if (schema.max !== undefined && data > schema.max) return fail("Too large");
      return data;
    case "boolean":
      return typeof data === "boolean" ? data : fail("Expected boolean");
    case "array":
      if (!Array.isArray(data)) return fail("Expected array");
      if (schema.maxItems !== undefined && data.length > schema.maxItems) return fail("Too many items");
      return data.map((item, i) => check(item, schema.items, join(path, i), errors));
    case "object": {
      if (typeof data !== "object" || data === null || Array.isArray(data)) return fail("Expected object");
      // Build a fresh object from the schema's keys only: unknown keys (including "__proto__") are dropped.
      const out: Record<string, unknown> = {};
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          out[key] = check(data[key], propSchema, join(path, key), errors);
        } else if (schema.required?.includes(key)) {
          errors.push({ path: join(path, key), message: "Required" });
        }
      }
      return out;
    }
  }
}

export function safeParse(text: string, schema: Schema): Result {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, errors: [{ path: "", message: "Invalid JSON" }] };
  }
  const errors: Issue[] = [];
  const value = check(data, schema, "", errors);
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value };
}
`;

const SAFE_INDEX = String.raw`import "./styles.css";
import { safeParse, type Schema } from "./src/safe-parse";

const userSchema: Schema = {
  type: "object",
  required: ["name", "age"],
  properties: {
    name: { type: "string", minLength: 1 },
    age: { type: "number", integer: true, min: 0 },
    role: { type: "string", enum: ["user", "admin"] },
  },
};
const inputs = ['{"name":"Ada","age":36}', '{"name":"","age":"ten","role":"root"}', "{name: Ada}", '{"name":"Eve","age":1,"__proto__":{"isAdmin":true}}'];
const lines: string[] = [];
for (const text of inputs) {
  try {
    lines.push(text + "\n  → " + JSON.stringify(safeParse(text, userSchema)));
  } catch (e) {
    lines.push(text + "\n  → threw " + (e as Error).name);
  }
}
document.getElementById("app")!.innerHTML = '<h1>Safe parse</h1><pre id="out"></pre>';
document.getElementById("out")!.textContent = lines.join("\n\n");
`;

const SAFE_TESTS = String.raw`import { describe, it, expect } from "./test-kit";
import { safeParse } from "../src/safe-parse";

const order = {
  type: "object",
  required: ["id", "items"],
  properties: {
    id: { type: "string", minLength: 3 },
    status: { type: "string", enum: ["new", "paid"] },
    items: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        required: ["sku", "qty"],
        properties: { sku: { type: "string" }, qty: { type: "number", integer: true, min: 1, max: 99 }, gift: { type: "boolean" } },
      },
    },
  },
};

describe("safeParse", () => {
  it("returns valid data", () => {
    const text = JSON.stringify({ id: "A-1", status: "paid", items: [{ sku: "x", qty: 2, gift: true }] });
    expect(safeParse(text, order)).toEqual({ ok: true, value: { id: "A-1", status: "paid", items: [{ sku: "x", qty: 2, gift: true }] } });
  });
  it("never throws on invalid JSON", () => {
    expect(safeParse("{id: 1}", order)).toEqual({ ok: false, errors: [{ path: "", message: "Invalid JSON" }] });
    expect(safeParse("", order).ok).toBe(false);
  });
  it("reports every problem with its path", () => {
    const text = JSON.stringify({ id: "A", status: "shipped", items: [{ sku: 5, qty: 1.5 }, { qty: 0 }] });
    const result = safeParse(text, order);
    expect(result.ok).toBe(false);
    expect(result.errors).toEqual([
      { path: "id", message: "Too short" },
      { path: "status", message: "Must be one of: new, paid" },
      { path: "items[0].sku", message: "Expected string" },
      { path: "items[0].qty", message: "Expected integer" },
      { path: "items[1].sku", message: "Required" },
      { path: "items[1].qty", message: "Too small" },
    ]);
  });
  it("checks types strictly", () => {
    const result = safeParse(JSON.stringify({ id: 123, items: {} }), order);
    expect(result.errors).toEqual([
      { path: "id", message: "Expected string" },
      { path: "items", message: "Expected array" },
    ]);
    expect(safeParse("[]", order).errors).toEqual([{ path: "", message: "Expected object" }]);
  });
  it("enforces limits and required fields", () => {
    const many = JSON.stringify({ id: "A-1", items: [1, 2, 3, 4] });
    expect(safeParse(many, order).errors).toEqual([{ path: "items", message: "Too many items" }]);
    expect(safeParse("{}", order).errors).toEqual([
      { path: "id", message: "Required" },
      { path: "items", message: "Required" },
    ]);
  });
  it("drops unknown keys and blocks prototype pollution", () => {
    const text = '{"id":"A-1","items":[],"extra":1,"__proto__":{"isAdmin":true},"constructor":{"prototype":{"x":1}}}';
    const result = safeParse(text, order);
    expect(result).toEqual({ ok: true, value: { id: "A-1", items: [] } });
    expect(result.value.isAdmin).toBeUndefined();
    expect({}.isAdmin).toBeUndefined();
    expect(Object.getPrototypeOf(result.value)).toBe(Object.prototype);
  });
  it("doesn't treat inherited properties as present", () => {
    const schema = { type: "object", required: ["toString"], properties: { toString: { type: "string" } } };
    expect(safeParse("{}", schema).errors).toEqual([{ path: "toString", message: "Required" }]);
  });
});
`;

export default defineTasks([
  quiz(
    "json-omitted-values",
    ["json-serialization"],
    1,
    45,
    ["What `JSON.stringify` leaves out", "Що `JSON.stringify` пропускає"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`{\"d\":null}`", "`{\"d\":null}`"],
      ["`{\"a\":null,\"b\":null,\"c\":null,\"d\":null}`", "`{\"a\":null,\"b\":null,\"c\":null,\"d\":null}`"],
      ["`{\"a\":undefined,\"d\":null}`", "`{\"a\":undefined,\"d\":null}`"],
      ["A `TypeError`: functions can't be serialised", "`TypeError`: функції не можна серіалізувати"],
    ],
    "a",
    [
      "JSON has no `undefined`, functions or symbols, so properties holding them are **omitted** entirely; only `null` is a real JSON value. That's why a field set to `undefined` disappears from a request body, while `null` is sent and can mean \"clear this field\" in a PATCH.",
      "У JSON немає `undefined`, функцій чи символів, тож властивості з ними **пропускаються** повністю; лише `null` є справжнім значенням JSON. Тому поле зі значенням `undefined` зникає з тіла запиту, а `null` надсилається й може означати «очистити це поле» в PATCH.",
    ],
    { code: 'console.log(JSON.stringify({ a: undefined, b: () => 1, c: Symbol("s"), d: null }));', codeLanguage: "js" },
  ),
  quiz(
    "json-array-null",
    ["json-serialization"],
    2,
    60,
    ["The same values inside an array", "Ті самі значення всередині масиву"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[null,null,null,null]`", "`[null,null,null,null]`"],
      ["`[]`", "`[]`"],
      ["`[undefined,null,NaN,Infinity]`", "`[undefined,null,NaN,Infinity]`"],
      ["`[null,null,\"NaN\",\"Infinity\"]`", "`[null,null,\"NaN\",\"Infinity\"]`"],
    ],
    "a",
    [
      "Arrays can't drop elements without shifting the indexes of everything after them, so `undefined`, functions and symbols become `null` there instead of disappearing. `NaN` and `±Infinity` aren't valid JSON numbers, so they become `null` everywhere. Either way the original value is lost silently.",
      "Масиви не можуть відкинути елементи, не зсунувши індекси всього, що після них, тож `undefined`, функції й символи там стають `null`, а не зникають. `NaN` і `±Infinity` не є коректними числами JSON, тож вони всюди стають `null`. Так чи інакше початкове значення мовчки втрачається.",
    ],
    { code: "console.log(JSON.stringify([undefined, () => 1, NaN, Infinity]));", codeLanguage: "js" },
  ),
  quiz(
    "json-top-level",
    ["json-serialization"],
    2,
    60,
    ["Stringifying at the top level", "Серіалізація на верхньому рівні"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`undefined undefined null undefined`", "`undefined undefined null undefined`"],
      ["`\"undefined\" \"function\" \"NaN\" string`", "`\"undefined\" \"function\" \"NaN\" string`"],
      ["`null null null object`", "`null null null object`"],
      ["`undefined undefined NaN undefined`", "`undefined undefined NaN undefined`"],
    ],
    "a",
    [
      "With nothing serialisable at the top level, `JSON.stringify` returns `undefined` itself, not a string, so code like `JSON.stringify(x).length` or `res.send(JSON.stringify(x))` can blow up or send nothing. `NaN` becomes the string `\"null\"`. Type the return value as `string | undefined`.",
      "Коли на верхньому рівні немає нічого, що можна серіалізувати, `JSON.stringify` повертає саме `undefined`, а не рядок, тож код на кшталт `JSON.stringify(x).length` чи `res.send(JSON.stringify(x))` може впасти чи нічого не надіслати. `NaN` стає рядком `\"null\"`. Типізуйте результат як `string | undefined`.",
    ],
    { code: "console.log(JSON.stringify(undefined), JSON.stringify(() => {}), JSON.stringify(NaN), typeof JSON.stringify(undefined));", codeLanguage: "js" },
  ),
  quiz(
    "json-bigint",
    ["json-serialization", w("js-values-grammar")],
    2,
    60,
    ["Serialising a BigInt", "Серіалізація BigInt"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`TypeError`", "`TypeError`"],
      ["`{\"id\":10}`", "`{\"id\":10}`"],
      ["`{\"id\":\"10\"}`", "`{\"id\":\"10\"}`"],
      ["`{\"id\":\"10n\"}`", "`{\"id\":\"10n\"}`"],
    ],
    "a",
    [
      "`JSON.stringify` throws a `TypeError` for BigInt values instead of guessing: writing it as a number would lose precision in other parsers, and as a string would change its type. Decide explicitly, usually by sending big ids as strings (with a replacer, or `BigInt.prototype.toJSON` if you control the whole app) and reviving them on the other side.",
      "`JSON.stringify` кидає `TypeError` для значень BigInt, а не вгадує: запис числом втратив би точність в інших розбирачах, а рядком змінив би тип. Вирішуйте явно, зазвичай надсилаючи великі ідентифікатори рядками (через replacer чи `BigInt.prototype.toJSON`, якщо ви контролюєте весь застосунок) і відновлюючи їх на іншому боці.",
    ],
    { code: "try {\n  console.log(JSON.stringify({ id: 10n }));\n} catch (e) {\n  console.log(e.name);\n}", codeLanguage: "js" },
  ),
  quiz(
    "json-tojson",
    ["json-serialization"],
    2,
    75,
    ["`toJSON`", "`toJSON`"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`{\"user\":{\"name\":\"Ada\"},\"at\":\"1970-01-01T00:00:00.000Z\"}`", "`{\"user\":{\"name\":\"Ada\"},\"at\":\"1970-01-01T00:00:00.000Z\"}`"],
      ["`{\"user\":{\"name\":\"Ada\",\"password\":\"x\"},\"at\":{}}`", "`{\"user\":{\"name\":\"Ada\",\"password\":\"x\"},\"at\":{}}`"],
      ["`{\"user\":{\"name\":\"Ada\"},\"at\":0}`", "`{\"user\":{\"name\":\"Ada\"},\"at\":0}`"],
      ["`{\"user\":{\"name\":\"Ada\",\"password\":\"x\"},\"at\":\"1970-01-01T00:00:00.000Z\"}`", "`{\"user\":{\"name\":\"Ada\",\"password\":\"x\"},\"at\":\"1970-01-01T00:00:00.000Z\"}`"],
    ],
    "a",
    [
      "If a value has a `toJSON` method, `JSON.stringify` serialises whatever it returns. `Date.prototype.toJSON` returns the ISO string, which is why dates become strings, and a custom `toJSON` can control a type's wire format, for example to leave out a password. Note that after `JSON.parse`, `at` is just a string again.",
      "Якщо значення має метод `toJSON`, `JSON.stringify` серіалізує те, що він повертає. `Date.prototype.toJSON` повертає рядок ISO, тому дати стають рядками, а власний `toJSON` може керувати форматом типу для передавання, наприклад, щоб пропустити пароль. Зверніть увагу: після `JSON.parse` `at` знову є просто рядком.",
    ],
    { code: 'const user = {\n  name: "Ada",\n  password: "x",\n  toJSON() {\n    return { name: this.name };\n  },\n};\nconsole.log(JSON.stringify({ user, at: new Date(0) }));', codeLanguage: "js" },
  ),
  quiz(
    "json-replacer-order",
    ["json-serialization"],
    3,
    90,
    ["How a replacer is called", "Як викликається replacer"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ '', 'a', 'b', 'c' ]`", "`[ '', 'a', 'b', 'c' ]`"],
      ["`[ 'a', 'b', 'c' ]`", "`[ 'a', 'b', 'c' ]`"],
      ["`[ 'a', 'b' ]`", "`[ 'a', 'b' ]`"],
      ["`[ 'c', 'b', 'a', '' ]`", "`[ 'c', 'b', 'a', '' ]`"],
    ],
    "a",
    [
      "The replacer is first called for the **root**, with an empty key (`this` is a wrapper object `{ \"\": value }`), then for every property depth-first, top-down, before descending into it. That top-down order lets a replacer drop or replace a whole subtree before it's visited. A reviver in `JSON.parse` goes the other way: children first, root last.",
      "Replacer спершу викликається для **кореня** з порожнім ключем (`this` є обгорткою `{ \"\": value }`), а потім для кожної властивості в глибину, згори донизу, до заходу всередину неї. Такий порядок згори донизу дає replacer відкинути чи замінити ціле піддерево ще до його відвідування. Reviver у `JSON.parse` іде навпаки: спершу дочірні значення, корінь останнім.",
    ],
    { code: "const keys = [];\nJSON.stringify({ a: 1, b: { c: 2 } }, (key, value) => {\n  keys.push(key);\n  return value;\n});\nconsole.log(keys);", codeLanguage: "js" },
  ),
  quiz(
    "json-replacer-array",
    ["json-serialization", w("web-security", 0.3)],
    2,
    75,
    ["A replacer array", "Масив replacer"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`{\"id\":1,\"meta\":{\"id\":2}}`", "`{\"id\":1,\"meta\":{\"id\":2}}`"],
      ["`{\"id\":1,\"meta\":{\"id\":2,\"secret\":\"y\"}}`", "`{\"id\":1,\"meta\":{\"id\":2,\"secret\":\"y\"}}`"],
      ["`{\"id\":1,\"meta\":{}}`", "`{\"id\":1,\"meta\":{}}`"],
      ["`{\"name\":\"Ada\",\"secret\":\"x\"}`", "`{\"name\":\"Ada\",\"secret\":\"x\"}`"],
    ],
    "a",
    [
      "An array replacer is a **whitelist of property names** applied at every level, not just the top. `meta` is kept because it's listed, and inside it only `id` survives. Whitelisting is a safer way to log or return objects than blacklisting secrets, because new sensitive fields stay hidden by default.",
      "Масив replacer є **білим списком назв властивостей**, що діє на кожному рівні, а не лише на верхньому. `meta` зберігається, бо його перелічено, а всередині нього виживає лише `id`. Білий список є безпечнішим способом журналювати чи повертати об'єкти, ніж чорний список секретів, бо нові чутливі поля за замовчуванням лишаються прихованими.",
    ],
    { code: 'const record = { id: 1, name: "Ada", secret: "x", meta: { id: 2, secret: "y" } };\nconsole.log(JSON.stringify(record, ["id", "meta"]));', codeLanguage: "js" },
  ),
  quiz(
    "json-reviver-order",
    ["json-serialization"],
    3,
    90,
    ["How a reviver is called", "Як викликається reviver"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ 'b', 'a', 'c', '' ]`", "`[ 'b', 'a', 'c', '' ]`"],
      ["`[ '', 'a', 'b', 'c' ]`", "`[ '', 'a', 'b', 'c' ]`"],
      ["`[ 'a', 'b', 'c' ]`", "`[ 'a', 'b', 'c' ]`"],
      ["`[ 'c', 'b', 'a', '' ]`", "`[ 'c', 'b', 'a', '' ]`"],
    ],
    "a",
    [
      "A reviver works **bottom-up**: it's called for the deepest values first, then their parents, and finally for the root with key `\"\"`. That ordering means when the reviver sees an object, its children have already been revived, so you can rebuild containers like `Map` or class instances from already-restored contents.",
      "Reviver працює **знизу вгору**: він викликається спершу для найглибших значень, потім для їхніх батьків і нарешті для кореня з ключем `\"\"`. Такий порядок означає, що коли reviver бачить об'єкт, його дочірні значення вже відновлено, тож можна відбудовувати контейнери на кшталт `Map` чи екземпляри класів із уже відновленого вмісту.",
    ],
    { code: "const order = [];\nJSON.parse('{\"a\":{\"b\":1},\"c\":2}', (key, value) => {\n  order.push(key);\n  return value;\n});\nconsole.log(order);", codeLanguage: "js" },
  ),
  quiz(
    "json-big-number",
    ["json-serialization", w("js-values-grammar")],
    3,
    75,
    ["A 64-bit id in JSON", "64-бітний ідентифікатор у JSON"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`9007199254740992`", "`9007199254740992`"],
      ["`9007199254740993`", "`9007199254740993`"],
      ["`9007199254740993n`", "`9007199254740993n`"],
      ["A `SyntaxError`: number too large", "`SyntaxError`: занадто велике число"],
    ],
    "a",
    [
      "JSON numbers have no size limit, but `JSON.parse` turns them into JavaScript numbers (64-bit floats), and integers above `Number.MAX_SAFE_INTEGER` (2^53 − 1) can't all be represented, so this id silently becomes its even neighbour. Database ids, Twitter/X ids and money in minor units hit this. Send such values as **strings**, or use a parser that supports BigInt.",
      "Числа в JSON не мають обмеження розміру, але `JSON.parse` перетворює їх на числа JavaScript (64-бітні дробові), а цілі понад `Number.MAX_SAFE_INTEGER` (2^53 − 1) не всі можна представити, тож цей ідентифікатор мовчки стає своїм парним сусідом. Із цим стикаються ідентифікатори баз даних, ідентифікатори Twitter/X і гроші в дрібних одиницях. Надсилайте такі значення **рядками** або використовуйте розбирач із підтримкою BigInt.",
    ],
    { code: "console.log(JSON.parse('{\"id\": 9007199254740993}').id);", codeLanguage: "js" },
  ),
  quiz(
    "json-prototype-pollution",
    ["json-serialization", w("web-security")],
    4,
    150,
    ["Merging parsed JSON", "Злиття розібраного JSON"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`[ '__proto__' ] true`", "`[ '__proto__' ] true`"],
      ["`[] undefined`", "`[] undefined`"],
      ["`[ '__proto__' ] undefined`", "`[ '__proto__' ] undefined`"],
      ["A `SyntaxError`: __proto__ isn't allowed in JSON", "`SyntaxError`: __proto__ заборонено в JSON"],
    ],
    "a",
    [
      "`JSON.parse` creates an ordinary **own** property named `__proto__`, which is harmless on its own. The naive merge then does `target[\"__proto__\"]`, which reads the **prototype accessor** and returns `Object.prototype`, and recursing into it writes `isAdmin` there, so every object in the process now has `isAdmin: true`. Skip `__proto__`, `constructor` and `prototype` keys in merges, validate input against a schema, or merge into `Object.create(null)` or a `Map`.",
      "`JSON.parse` створює звичайну **власну** властивість на ім'я `__proto__`, що сама по собі нешкідлива. Потім наївне злиття робить `target[\"__proto__\"]`, що читає **аксесор прототипу** й повертає `Object.prototype`, а рекурсія в нього записує туди `isAdmin`, тож тепер кожен об'єкт у процесі має `isAdmin: true`. Пропускайте ключі `__proto__`, `constructor` і `prototype` під час злиття, валідуйте вхідні дані за схемою або зливайте в `Object.create(null)` чи `Map`.",
    ],
    {
      code: 'const payload = JSON.parse(\'{"__proto__": {"isAdmin": true}}\');\nfunction merge(target, source) {\n  for (const key in source) {\n    if (typeof source[key] === "object") {\n      target[key] ??= {};\n      merge(target[key], source[key]);\n    } else {\n      target[key] = source[key];\n    }\n  }\n  return target;\n}\nmerge({}, payload);\nconsole.log(Object.keys(payload), {}.isAdmin);',
      codeLanguage: "js",
    },
  ),
  quiz(
    "json-circular",
    ["json-serialization"],
    2,
    60,
    ["A circular reference", "Циклічне посилання"],
    ["What does this print?", "Що виведе цей код?"],
    [
      ["`TypeError`", "`TypeError`"],
      ["`{\"self\":{}}`", "`{\"self\":{}}`"],
      ["`{\"self\":\"[Circular]\"}`", "`{\"self\":\"[Circular]\"}`"],
      ["`RangeError`", "`RangeError`"],
    ],
    "a",
    [
      "JSON is a tree, so it can't represent an object that contains itself; `JSON.stringify` detects the cycle and throws a `TypeError` (\"Converting circular structure to JSON\"). This often happens when logging objects like requests, DOM nodes or ORM entities. Serialise a plain projection of the data, or use a replacer with a `WeakSet` to replace repeated objects.",
      "JSON є деревом, тож не може представити об'єкт, що містить сам себе; `JSON.stringify` виявляє цикл і кидає `TypeError` («Converting circular structure to JSON»). Це часто трапляється під час журналювання об'єктів на кшталт запитів, вузлів DOM чи сутностей ORM. Серіалізуйте просту проєкцію даних або використайте replacer з `WeakSet`, щоб замінювати повторні об'єкти.",
    ],
    { code: "const a = {};\na.self = a;\ntry {\n  console.log(JSON.stringify(a));\n} catch (e) {\n  console.log(e.name);\n}", codeLanguage: "js" },
  ),
  practice({
    slug: "json-typed-codec",
    skills: ["json-serialization", w("js-collections"), w("dates-time")],
    complexity: 4,
    estSeconds: 1500,
    framework: "vanilla-ts",
    title: ["JSON that keeps its types", "JSON, що зберігає типи"],
    prompt: [
      "Write `serialize(value, space?)` and `deserialize(text)` in `src/codec.ts`, so that a round trip restores `Date` (including invalid dates), `BigInt`, `Map`, `Set`, `NaN`, `±Infinity` and `-0`, at any depth, including inside Maps and Sets.\n\n- Encode those values as tag objects like `{ \"$type\": \"Date\", \"value\": \"2024-03-10T09:00:00.000Z\" }`, using a **replacer** and a **reviver**. Plain data must stay ordinary JSON.\n- User objects that happen to have their own `\"$type\"` key must round-trip unchanged too, so escape them.\n- Other objects' `toJSON` still applies, `undefined` behaves as in plain JSON, and cycles still throw.\n\nHint: by the time a replacer sees a `Date`, its `toJSON` has already turned it into a string. Read the original from `this[key]`.",
      "Напишіть у `src/codec.ts` функції `serialize(value, space?)` і `deserialize(text)` так, щоб перетворення туди й назад відновлювало `Date` (зокрема некоректні дати), `BigInt`, `Map`, `Set`, `NaN`, `±Infinity` і `-0` на будь-якій глибині, зокрема всередині Map і Set.\n\n- Кодуйте ці значення як об'єкти-мітки на кшталт `{ \"$type\": \"Date\", \"value\": \"2024-03-10T09:00:00.000Z\" }`, використовуючи **replacer** і **reviver**. Звичайні дані мають лишатися звичайним JSON.\n- Об'єкти користувача, що випадково мають власний ключ `\"$type\"`, теж мають проходити туди й назад без змін, тож екрануйте їх.\n- `toJSON` інших об'єктів і далі застосовується, `undefined` поводиться як у звичайному JSON, а цикли й далі кидають помилку.\n\nПідказка: коли replacer бачить `Date`, його `toJSON` уже перетворив її на рядок. Читайте оригінал із `this[key]`.",
    ],
    files: { "/src/codec.ts": CODEC_STARTER, "/index.ts": CODEC_INDEX },
    visibleFiles: ["/src/codec.ts", "/index.ts"],
    activeFile: "/src/codec.ts",
    tests: CODEC_TESTS,
    solution: { "/src/codec.ts": CODEC_SOLUTION },
    explanation: [
      "The replacer runs top-down with `this` bound to the containing object, so `this[key]` gives the value **before** `toJSON` (that's the only way to see a `Date` as a `Date`). Replacing special values with tag objects lets `JSON.stringify` keep recursing into their contents, such as Map entries. The reviver runs bottom-up, so when it rebuilds a `Map`, `Set` or escaped object, everything inside has already been restored. Escaping user objects that contain the tag key avoids ambiguity, the same idea as escaping quotes inside a string.",
      "Replacer працює згори донизу з `this`, прив'язаним до об'єкта-контейнера, тож `this[key]` дає значення **до** `toJSON` (це єдиний спосіб побачити `Date` як `Date`). Заміна особливих значень об'єктами-мітками дає `JSON.stringify` продовжувати рекурсію в їхній вміст, як-от записи Map. Reviver працює знизу вгору, тож коли він відбудовує `Map`, `Set` чи екранований об'єкт, усе всередині вже відновлено. Екранування об'єктів користувача, що містять ключ мітки, усуває неоднозначність, як і екранування лапок усередині рядка.",
    ],
  }),
  practice({
    slug: "json-safe-parse",
    skills: ["json-serialization", w("web-security"), w("typescript")],
    complexity: 3,
    estSeconds: 1320,
    framework: "vanilla-ts",
    title: ["Parse and validate untrusted JSON", "Розбір і валідація ненадійного JSON"],
    prompt: [
      "Implement `safeParse(text, schema)` in `src/safe-parse.ts`, a tiny Zod-like validator for request bodies. It **never throws** and returns `{ ok: true, value }` or `{ ok: false, errors }`, where each error is `{ path, message }`:\n\n- Invalid JSON gives `[{ path: \"\", message: \"Invalid JSON\" }]`.\n- Types are checked strictly (`\"Expected string\"`, `\"Expected number\"`, `\"Expected integer\"`, `\"Expected boolean\"`, `\"Expected array\"`, `\"Expected object\"`), together with the constraints `minLength`/`maxLength` (`\"Too short\"`/`\"Too long\"`), `enum` (`\"Must be one of: a, b\"`), `min`/`max` (`\"Too small\"`/`\"Too large\"`) and `maxItems` (`\"Too many items\"`). Missing required keys give `\"Required\"`, and only **own** properties count as present.\n- Report **every** error, with paths like `items[1].qty`, in document order.\n- The returned value contains **only the schema's keys**, so unknown keys and `__proto__` payloads are dropped and can't pollute prototypes.",
      "Реалізуйте у `src/safe-parse.ts` функцію `safeParse(text, schema)`, крихітний валідатор у стилі Zod для тіл запитів. Вона **ніколи не кидає помилку** й повертає `{ ok: true, value }` чи `{ ok: false, errors }`, де кожна помилка має вигляд `{ path, message }`:\n\n- Некоректний JSON дає `[{ path: \"\", message: \"Invalid JSON\" }]`.\n- Типи перевіряються суворо (`\"Expected string\"`, `\"Expected number\"`, `\"Expected integer\"`, `\"Expected boolean\"`, `\"Expected array\"`, `\"Expected object\"`) разом з обмеженнями `minLength`/`maxLength` (`\"Too short\"`/`\"Too long\"`), `enum` (`\"Must be one of: a, b\"`), `min`/`max` (`\"Too small\"`/`\"Too large\"`) і `maxItems` (`\"Too many items\"`). Відсутні обов'язкові ключі дають `\"Required\"`, і присутніми вважаються лише **власні** властивості.\n- Повідомляйте про **кожну** помилку зі шляхами на кшталт `items[1].qty` у порядку документа.\n- Повернене значення містить **лише ключі схеми**, тож невідомі ключі й дані в `__proto__` відкидаються й не можуть забруднити прототипи.",
    ],
    files: { "/src/safe-parse.ts": SAFE_STARTER, "/index.ts": SAFE_INDEX },
    visibleFiles: ["/src/safe-parse.ts", "/index.ts"],
    activeFile: "/src/safe-parse.ts",
    tests: SAFE_TESTS,
    solution: { "/src/safe-parse.ts": SAFE_SOLUTION },
    explanation: [
      "`JSON.parse` only proves the text is syntactically valid; the schema check proves it has the shape your code assumes. Walking the schema (not the data) to build the output is what makes it safe: only known keys are copied, so an attacker's `__proto__` or `constructor` keys never reach a merge or an assignment, and `hasOwnProperty` stops inherited names like `toString` from counting as present. Collecting all errors with paths, instead of stopping at the first, gives clients something they can actually fix. This is exactly what libraries like Zod, Valibot and Ajv do at production scale.",
      "`JSON.parse` лише доводить, що текст синтаксично коректний; перевірка схеми доводить, що він має форму, на яку розраховує ваш код. Безпечним це робить обхід схеми (а не даних) для побудови результату: копіюються лише відомі ключі, тож ключі зловмисника `__proto__` чи `constructor` ніколи не доходять до злиття чи присвоєння, а `hasOwnProperty` не дає успадкованим іменам на кшталт `toString` вважатися присутніми. Збирання всіх помилок зі шляхами, а не зупинка на першій, дає клієнтам те, що вони справді можуть виправити. Саме це роблять бібліотеки на кшталт Zod, Valibot і Ajv у масштабі продакшену.",
    ],
  }),
]);
