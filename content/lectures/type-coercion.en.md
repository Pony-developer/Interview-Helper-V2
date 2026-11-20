---
skill: type-coercion
title: "Types and type coercion in JavaScript"
summary: "The seven primitive types and typeof, how values become numbers, strings and booleans, ToPrimitive with valueOf, toString and Symbol.toPrimitive, the + operator, == vs === vs Object.is, relational comparisons, and safe explicit conversion."
readingMinutes: 9
---

JavaScript converts values between types automatically ("implicit coercion") whenever an operator or API needs a particular type. The rules are fully specified, so the "weird" results are predictable once you know the handful of conversions behind them.

## Types

There are seven primitive types: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol` and `null`. Everything else (arrays, functions, dates, plain objects) is an **object**. `typeof` mostly reports them, with two quirks: `typeof null === "object"` (a historical bug) and `typeof function () {} === "function"`. Use `Array.isArray` for arrays and `value === null` for null.

## The three conversions

**ToBoolean.** Exactly eight values are **falsy**: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`. Everything else is truthy, including `"0"`, `"false"`, `[]` and `{}`.

**ToNumber.**

| Value | Number |
| --- | --- |
| `""`, `"  "` | `0` |
| `" 42 "` | `42` (whitespace trimmed) |
| `"42px"`, `"abc"` | `NaN` |
| `"0x1F"`, `"1e3"` | `31`, `1000` |
| `true` / `false` | `1` / `0` |
| `null` | `0` |
| `undefined` | `NaN` |
| `[]`, `[7]`, `[1, 2]` | `0`, `7`, `NaN` (via the string `""`, `"7"`, `"1,2"`) |

`parseInt` and `parseFloat` are different: they read a numeric prefix and stop (`parseInt("42px") === 42`). Always pass a radix to `parseInt`.

**ToString.** `null` → `"null"`, `[1, [2, 3]]` → `"1,2,3"`, `{}` → `"[object Object]"`, `-0` → `"0"`. Symbols throw on implicit conversion (`"" + Symbol()`), but `String(Symbol("x"))` works.

## Objects → primitives (ToPrimitive)

When an object meets an operator, JavaScript asks it for a primitive with a **hint**:

1. If it has `[Symbol.toPrimitive](hint)`, call that (`hint` is `"number"`, `"string"` or `"default"`).
2. Otherwise, for the `"string"` hint try `toString()` then `valueOf()`; for `"number"` and `"default"` try `valueOf()` then `toString()`. The first one that returns a primitive wins.

Plain objects and arrays return themselves from `valueOf`, so they end up using `toString`. Template literals and `String(x)` use the `"string"` hint; `+x`, `*`, `-` and `<` use `"number"`; binary `+` and `==` use `"default"`. Dates treat `"default"` like `"string"`.

## The `+` operator

`a + b` first converts both operands to primitives. If **either** is a string, it concatenates; otherwise it adds numbers. Every other arithmetic operator always converts to numbers.

```js
"5" + 3    // "53"
"5" - 3    // 2
[1, 2] + [3] // "1,23"
1 + null   // 1
1 + undefined // NaN
```

Mixing `bigint` and `number` in arithmetic throws a `TypeError`; convert explicitly.

## Equality

- `===` (strict): no conversion. Different types are never equal. `NaN !== NaN`, and `0 === -0`.
- `Object.is`: like `===`, but `Object.is(NaN, NaN)` is `true` and `Object.is(0, -0)` is `false` (React uses it to compare state).
- `==` (loose): same types compare strictly. `null == undefined` is `true`, and neither equals anything else (so `null == 0` is `false`). Otherwise booleans become numbers, strings meet numbers as numbers, and objects are turned into primitives. That's how `[] == false` and `"0" == false` end up `true`.

The one widely accepted use of `==` is `value == null`, which checks for both `null` and `undefined`.

## Relational comparisons

`<`, `>`, `<=`, `>=` compare **strings lexicographically** by UTF-16 code unit when both sides are strings (`"10" < "9"`, `"Z" < "a"`), and numerically otherwise (`10 > "9"`). Any comparison with `NaN` is `false`. `null >= 0` is `true` (null becomes 0) even though `null == 0` is `false`, because `>=` and `==` follow different algorithms.

## `||` vs `??`

`a || b` falls back for any falsy `a`, which loses legitimate `0` and `""`. `a ?? b` falls back only for `null` or `undefined`. Use `??` for defaults: `const limit = options.limit ?? 10`.

## Converting explicitly

- Prefer `Number(x)`, `String(x)` and `Boolean(x)` (or `!!x`) over relying on operators.
- Validate parsed numbers with `Number.isFinite`, and remember `Number("")` is `0`, not `NaN`.
- Use `Number.isNaN(x)`; the global `isNaN("abc")` coerces first.
- TypeScript catches many mistakes, but values from forms, URLs, JSON and `localStorage` are strings or `unknown` at runtime, so convert at the boundary.

## Interview checklist

- List the falsy values and the primitive types (and the `typeof null` quirk).
- Explain `"5" + 3` vs `"5" - 3`, and `[] + {}`.
- Walk through why `[] == false` is `true`, and why `null == 0` is `false` but `null >= 0` is `true`.
- Explain `valueOf`, `toString`, `Symbol.toPrimitive` and the hints.
- Choose between `||` and `??`, and between `Number` and `parseInt`.
