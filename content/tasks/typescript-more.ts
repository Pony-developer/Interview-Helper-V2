import { defineTasks } from "@/lib/content/schema";
import { practice, quiz } from "./_helpers";

export default defineTasks([
  quiz(
    "ts-as-const",
    ["typescript"],
    2,
    60,
    ["as const", "as const"],
    ["What is the type of `directions`?", "Який тип у `directions`?"],
    [
      ["`string[]`", "`string[]`"],
      ["`(\"up\" | \"down\")[]`", "`(\"up\" | \"down\")[]`"],
      ["`readonly [\"up\", \"down\"]`", "`readonly [\"up\", \"down\"]`"],
      ["`[string, string]`", "`[string, string]`"],
    ],
    "c",
    [
      "`as const` stops literal widening and makes the result deeply readonly, so an array literal becomes a readonly tuple of literal types. `typeof directions[number]` then gives the union `\"up\" | \"down\"`, a common way to derive a union from a list of values.",
      "`as const` вимикає розширення літералів і робить результат глибоко readonly, тож літерал масиву стає readonly-кортежем літеральних типів. Тоді `typeof directions[number]` дає об'єднання `\"up\" | \"down\"` — поширений спосіб вивести union зі списку значень.",
    ],
    { code: 'const directions = ["up", "down"] as const;' },
  ),
  quiz(
    "ts-distributive-conditional",
    ["typescript"],
    4,
    90,
    ["Distributive conditional types", "Дистрибутивні умовні типи"],
    ["What is `R`?", "Що таке `R`?"],
    [
      ["`(string | number)[]`", "`(string | number)[]`"],
      ["`string[] | number[]`", "`string[] | number[]`"],
      ["`never`", "`never`"],
      ["`unknown[]`", "`unknown[]`"],
    ],
    "b",
    [
      "A conditional type whose checked type is a naked type parameter distributes over unions: `ToArray<string | number>` becomes `ToArray<string> | ToArray<number>`. To get `(string | number)[]` instead, wrap both sides in a tuple: `[T] extends [unknown] ? T[] : never`.",
      "Умовний тип, у якому перевіряється «голий» параметр типу, розподіляється по об'єднанню: `ToArray<string | number>` стає `ToArray<string> | ToArray<number>`. Щоб отримати `(string | number)[]`, обгорніть обидві сторони в кортеж: `[T] extends [unknown] ? T[] : never`.",
    ],
    { code: "type ToArray<T> = T extends unknown ? T[] : never;\ntype R = ToArray<string | number>;" },
  ),
  quiz(
    "ts-function-variance",
    ["typescript"],
    5,
    120,
    ["Parameter variance", "Варіантність параметрів"],
    ["With `strictFunctionTypes` enabled, which of the assignments `a`, `b`, `c` is a compile error?", "Із увімкненим `strictFunctionTypes` яке з присвоєнь `a`, `b`, `c` є помилкою компіляції?"],
    [
      ["Only `a`", "Лише `a`"],
      ["Only `b`", "Лише `b`"],
      ["`b` and `c`", "`b` і `c`"],
      ["None of them", "Жодне"],
    ],
    "b",
    [
      "Function-type parameters are checked contravariantly: a handler that accepts any `Event` can stand in for one that expects a `MouseEvent` (`a` is fine), but not the reverse (`b` errors, since it could receive a `KeyboardEvent`). Method-shorthand members are deliberately exempt and stay bivariant, so `c` compiles even though it's equally unsafe. Prefer property syntax (`handle: (e: Event) => void`) when you want the strict check.",
      "Параметри типів-функцій перевіряються контраваріантно: обробник, що приймає будь-яку `Event`, може замінити той, що очікує `MouseEvent` (`a` коректне), але не навпаки (`b` — помилка, бо він може отримати `KeyboardEvent`). Члени, оголошені як методи, свідомо винятки й лишаються біваріантними, тож `c` компілюється, хоч воно так само небезпечне. Якщо потрібна строга перевірка, оголошуйте властивістю (`handle: (e: Event) => void`).",
    ],
    {
      code: "type Handler = (e: MouseEvent) => void;\nconst a: Handler = (e: Event) => {};\n\nconst b: (e: Event) => void = (e: MouseEvent) => {};\n\ninterface Listener {\n  handle(e: Event): void;\n}\nconst c: Listener = { handle(e: MouseEvent) {} };",
    },
  ),
  practice({
    slug: "ts-schema-validator",
    skills: ["typescript", { slug: "javascript", weight: 0.5 }],
    complexity: 4,
    estSeconds: 1200,
    framework: "vanilla-ts",
    title: ["Mini schema validator", "Міні-валідатор схем"],
    prompt: [
      "Finish a tiny runtime validator in the spirit of zod. Each schema has `parse(value, path?)` that returns the typed value or throws a `ValidationError`.\n\n- `string()` and `number()` accept only that type. `number()` rejects `NaN`.\n- `optional(schema)` also accepts `undefined` (but not `null`).\n- `array(schema)` validates every item.\n- `object(shape)` validates each key and **drops keys that aren't in the shape**.\n- Errors carry a `path` such as `user.tags[1]` (empty string for the root value), and their message contains `expected <type>`.\n\nThe types (`Schema`, `Infer`) are already written.",
      "Допишіть крихітний валідатор у дусі zod. Кожна схема має `parse(value, path?)`, що повертає типізоване значення або кидає `ValidationError`.\n\n- `string()` і `number()` приймають лише свій тип. `number()` відхиляє `NaN`.\n- `optional(schema)` також приймає `undefined` (але не `null`).\n- `array(schema)` перевіряє кожен елемент.\n- `object(shape)` перевіряє кожен ключ і **відкидає ключі, яких немає у формі**.\n- Помилки мають `path`, наприклад `user.tags[1]` (порожній рядок для кореневого значення), а повідомлення містить `expected <type>`.\n\nТипи (`Schema`, `Infer`) вже написано.",
    ],
    files: {
      "/src/schema.ts":
        "export class ValidationError extends Error {\n  path: string;\n  constructor(path: string, message: string) {\n    super((path || \"value\") + \": \" + message);\n    this.name = \"ValidationError\";\n    this.path = path;\n  }\n}\n\nexport type Schema<T> = { parse(value: unknown, path?: string): T };\nexport type Infer<S> = S extends Schema<infer T> ? T : never;\n\n// TODO: validate instead of trusting the input.\nexport function string(): Schema<string> {\n  return { parse: (value) => value as string };\n}\n\nexport function number(): Schema<number> {\n  return { parse: (value) => value as number };\n}\n\nexport function optional<T>(schema: Schema<T>): Schema<T | undefined> {\n  return { parse: (value, path) => (value === undefined ? undefined : schema.parse(value, path)) };\n}\n\nexport function array<T>(item: Schema<T>): Schema<T[]> {\n  return { parse: (value) => value as T[] };\n}\n\nexport function object<S extends Record<string, Schema<unknown>>>(shape: S): Schema<{ [K in keyof S]: Infer<S[K]> }> {\n  return { parse: (value) => value as { [K in keyof S]: Infer<S[K]> } };\n}\n",
      "/index.ts":
        'import "./styles.css";\nimport { array, number, object, optional, string } from "./src/schema";\n\nconst User = object({ name: string(), age: optional(number()), tags: array(string()) });\nlet output: string;\ntry {\n  output = JSON.stringify(User.parse({ name: "Ada", tags: ["math", 42] }));\n} catch (error) {\n  output = (error as Error).message;\n}\ndocument.getElementById("app")!.innerHTML = "<h1>Schema</h1><p>" + output + "</p>";\n',
    },
    visibleFiles: ["/src/schema.ts", "/index.ts"],
    activeFile: "/src/schema.ts",
    tests:
      'import { describe, it, expect } from "./test-kit";\nimport { ValidationError, array, number, object, optional, string } from "../src/schema";\n\nconst User = object({ name: string(), age: optional(number()), tags: array(string()) });\n\nfunction errorOf(fn: () => unknown) {\n  try {\n    fn();\n  } catch (error) {\n    return error as ValidationError;\n  }\n  throw new Error("expected parse to throw");\n}\n\ndescribe("schema", () => {\n  it("parses valid data and drops unknown keys", () => {\n    expect(User.parse({ name: "Ada", age: 36, tags: ["math"], extra: true })).toEqual({ name: "Ada", age: 36, tags: ["math"] });\n  });\n  it("rejects the wrong primitive type", () => {\n    const error = errorOf(() => string().parse(42));\n    expect(error instanceof ValidationError).toBe(true);\n    expect(error.message).toMatch(/expected string/);\n    expect(error.path).toBe("");\n  });\n  it("rejects NaN as a number", () => {\n    expect(errorOf(() => number().parse(NaN)).message).toMatch(/expected number/);\n  });\n  it("reports nested paths", () => {\n    expect(errorOf(() => User.parse({ name: "Ada", tags: ["a", 1] })).path).toBe("tags[1]");\n    const Team = object({ lead: User });\n    expect(errorOf(() => Team.parse({ lead: { name: 1, tags: [] } })).path).toBe("lead.name");\n  });\n  it("treats optional as undefined-only", () => {\n    expect(User.parse({ name: "Ada", tags: [] })).toEqual({ name: "Ada", tags: [] });\n    expect(errorOf(() => User.parse({ name: "Ada", age: null, tags: [] })).path).toBe("age");\n  });\n  it("rejects non-objects and non-arrays", () => {\n    expect(errorOf(() => User.parse(null)).message).toMatch(/expected object/);\n    expect(errorOf(() => User.parse({ name: "Ada", tags: "x" })).message).toMatch(/expected array/);\n  });\n});\n',
    solution: {
      "/src/schema.ts":
        "export class ValidationError extends Error {\n  path: string;\n  constructor(path: string, message: string) {\n    super((path || \"value\") + \": \" + message);\n    this.name = \"ValidationError\";\n    this.path = path;\n  }\n}\n\nexport type Schema<T> = { parse(value: unknown, path?: string): T };\nexport type Infer<S> = S extends Schema<infer T> ? T : never;\n\nfunction kind(value: unknown) {\n  if (value === null) return \"null\";\n  if (Array.isArray(value)) return \"array\";\n  if (Number.isNaN(value)) return \"NaN\";\n  return typeof value;\n}\n\nfunction fail(path: string, expected: string, value: unknown): never {\n  throw new ValidationError(path, \"expected \" + expected + \", got \" + kind(value));\n}\n\nexport function string(): Schema<string> {\n  return { parse: (value, path = \"\") => (typeof value === \"string\" ? value : fail(path, \"string\", value)) };\n}\n\nexport function number(): Schema<number> {\n  return {\n    parse: (value, path = \"\") => (typeof value === \"number\" && !Number.isNaN(value) ? value : fail(path, \"number\", value)),\n  };\n}\n\nexport function optional<T>(schema: Schema<T>): Schema<T | undefined> {\n  return { parse: (value, path) => (value === undefined ? undefined : schema.parse(value, path)) };\n}\n\nexport function array<T>(item: Schema<T>): Schema<T[]> {\n  return {\n    parse(value, path = \"\") {\n      if (!Array.isArray(value)) return fail(path, \"array\", value);\n      return value.map((entry, i) => item.parse(entry, path + \"[\" + i + \"]\"));\n    },\n  };\n}\n\nexport function object<S extends Record<string, Schema<unknown>>>(shape: S): Schema<{ [K in keyof S]: Infer<S[K]> }> {\n  return {\n    parse(value, path = \"\") {\n      if (typeof value !== \"object\" || value === null || Array.isArray(value)) return fail(path, \"object\", value);\n      const input = value as Record<string, unknown>;\n      const out: Record<string, unknown> = {};\n      for (const key of Object.keys(shape)) {\n        const parsed = shape[key].parse(input[key], path ? path + \".\" + key : key);\n        if (parsed !== undefined || key in input) out[key] = parsed;\n      }\n      return out as { [K in keyof S]: Infer<S[K]> };\n    },\n  };\n}\n",
    },
    explanation: [
      "Every schema is a small object with a `parse` closure, and composite schemas call their children's `parse` with an extended path (`path.key`, `path[i]`). A shared `fail(): never` helper keeps the ternaries well-typed. `object` builds a fresh output from the shape's keys only, which is what strips unknown keys, and `Infer` lets callers derive static types from the runtime schema.",
      "Кожна схема — невеликий об'єкт із замиканням `parse`, а складені схеми викликають `parse` дочірніх із подовженим шляхом (`path.key`, `path[i]`). Спільний хелпер `fail(): never` зберігає коректну типізацію тернарних виразів. `object` будує новий результат лише з ключів форми — саме це відкидає невідомі ключі, а `Infer` дозволяє виводити статичні типи з runtime-схеми.",
    ],
  }),
]);
