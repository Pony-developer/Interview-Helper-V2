---
skill: typescript
title: "TypeScript for interviews: narrowing, generics and utility types"
summary: "How the type checker thinks: structural typing, unions and narrowing, generics with constraints, and the utility types you are expected to know."
readingMinutes: 8
---

TypeScript checks your JavaScript before it runs. Interviewers want to see that you can model data precisely, without `any`.

## Structural typing

Types are compatible when their **shapes** match, whatever the types are named:

```ts
type Point = { x: number; y: number };
const p = { x: 1, y: 2, label: "A" };
const q: Point = p; // OK: p has at least x and y
```

Object literals assigned directly get *excess property checks*: `const r: Point = { x: 1, y: 2, z: 3 }` is an error.

## `unknown` vs `any`

- `any` switches the checker off and spreads silently.
- `unknown` accepts anything but forces you to **narrow** before use. Prefer `unknown` for external data such as JSON and errors in `catch`.

## Unions and narrowing

```ts
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {             // discriminant
    case "circle": return Math.PI * s.r ** 2;
    case "rect":   return s.w * s.h;
    default: {
      const never: never = s;   // compile error if a case is missing
      return never;
    }
  }
}
```

Narrowing works with `typeof`, `instanceof`, `in`, equality checks, truthiness and **type guards**:

```ts
function isString(v: unknown): v is string {
  return typeof v === "string";
}
```

## Generics

Generics let one function work for many types while keeping the relationship between input and output:

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}
```

`K extends keyof T` is a **constraint**: `K` must be a property name of `T`.

## Utility types worth knowing

| Type | Meaning |
| --- | --- |
| `Partial<T>` / `Required<T>` | all properties optional / required |
| `Readonly<T>` | properties can't be reassigned |
| `Pick<T, K>` / `Omit<T, K>` | keep / drop properties |
| `Record<K, V>` | object with keys `K` and values `V` |
| `ReturnType<F>` / `Parameters<F>` | extract from function types |
| `Awaited<T>` | unwrap a Promise type |
| `NonNullable<T>` | remove `null` and `undefined` |

## `type` vs `interface`

Both describe object shapes. `interface` can be **merged** and `extends` other interfaces. `type` can express unions, tuples, mapped and conditional types. Pick one convention per codebase.

## Interview checklist

- Model states as discriminated unions instead of optional flags.
- Use `unknown` plus narrowing for untrusted data.
- Explain what a generic constraint guarantees.
- Know that types are erased at runtime: validate external input with code (e.g. zod).
