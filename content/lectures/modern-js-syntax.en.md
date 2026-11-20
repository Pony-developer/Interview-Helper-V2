---
skill: modern-js-syntax
title: "Modern JS syntax: destructuring, spread, defaults and the operators that replaced boilerplate"
summary: "Object and array destructuring with defaults and renames, spread vs rest, default parameters and their own scope, template and tagged literals, optional chaining, nullish coalescing and logical assignment, and the edge cases interviewers like to ask about."
readingMinutes: 9
---

ES2015 and the releases after it added syntax that removes most of the boilerplate older JavaScript needed. Each feature is simple on its own; interviews focus on the **edge cases**: when a default applies, what a spread copies, and which values `??` treats as missing.

## Destructuring

Destructuring pulls values out of arrays (by position) and objects (by key) into variables:

```js
const [first, , third = 0, ...others] = list;            // skip, default, rest
const { id, name: title = "Untitled", ...meta } = post;  // rename, default, rest
const { author: { email } = {} } = post;                 // nested, with a fallback
[a, b] = [b, a];                                         // swap without a temp
```

- **Defaults apply only for `undefined`**, not for `null`, `0` or `""`.
- Array destructuring uses the **iteration protocol**, so it works with any iterable (strings, `Map`, generators), and a non-iterable on the right throws a `TypeError`.
- Object destructuring reads properties, including inherited ones, and boxes primitives (`const { length } = "abc"` works). Destructuring `null` or `undefined` throws.
- Destructuring a nested path that doesn't exist throws unless you give the nested pattern a default (`= {}`).
- An assignment pattern that starts with `{` must be wrapped in parentheses: `({ a, b } = obj);`. Otherwise `{` starts a block.
- Object rest (`...meta`) copies only **own enumerable** properties into a new plain object.

## Spread and rest

The same `...` does opposite jobs: **spread** expands an iterable or object into elements or properties, and **rest** collects the remainder into an array or object.

```js
const merged = { ...defaults, ...options };   // later keys win
const copy = [...items];                       // shallow copy
Math.max(...numbers);                          // array → arguments
function log(level, ...messages) {}            // rest parameter
```

Spread copies are **shallow**: nested objects are shared. Object spread copies own enumerable properties (including symbols), runs getters and stores their values, and ignores `null`/`undefined` (`{ ...null }` is `{}`). Array spread needs an iterable, so `[...{}]` throws. Spreading huge arrays as arguments can exceed the engine's argument limit, so use a loop or `reduce` there.

## Default parameters

```js
function connect(host, port = 443, url = `https://${host}:${port}`) {}
```

- Defaults are evaluated **at call time**, each time, only when the argument is `undefined` (so `connect("a", null)` keeps `null`).
- Later parameters can refer to earlier ones; referring to a later one hits the **temporal dead zone** (`function f(a = b, b) {}` throws when `a` is missing).
- Parameters with defaults live in their own scope, between the outer scope and the function body.
- A function with defaults, rest or destructuring in its parameters can't contain `"use strict"`, and its `length` counts only the parameters before the first default.

## Template literals

Backtick strings interpolate expressions (`${expr}`, converted with `String()`), can span lines, and can be **tagged**: `` tag`a${x}b` `` calls `tag(["a", "b"], x)`. The strings array has a `.raw` version with escapes kept, and it's the same frozen object every time the same literal runs, so tags can cache on it. Tags power safe HTML escaping, SQL builders (`` sql`… ${id}` `` with parameters instead of string concatenation), `String.raw`, styled-components and GraphQL's `gql`.

## Optional chaining, nullish coalescing, logical assignment

```js
const city = user?.address?.city;        // undefined if user or address is null/undefined
const first = list?.[0];
callback?.(result);                       // call only if defined
const pageSize = options.pageSize ?? 20;  // only null/undefined fall back
cache[key] ??= compute(key);              // assign only if missing
```

- `?.` **short-circuits** the rest of the chain: if `user` is nullish, `user?.address.city` is `undefined` without evaluating `.city`. It doesn't protect against non-nullish wrong types (`5?.()` still throws).
- `??` falls back only for `null` and `undefined`, unlike `||`, which also replaces `0`, `""`, `false` and `NaN`. Mixing `??` with `||` or `&&` without parentheses is a `SyntaxError`.
- `a ||= b`, `a &&= b` and `a ??= b` **only assign when needed**, so they don't trigger setters (or React state updates) when the value is already set.

## Smaller conveniences

- Shorthand properties and methods (`{ id, save() {} }`), computed keys (`{ [key]: value }`).
- Arrow functions have no own `this`, `arguments`, `super` or `new.target`, and can't be constructors.
- `for…of` over values vs `for…in` over enumerable string keys (including inherited ones).
- Numeric separators (`1_000_000`), exponent operator (`2 ** 10`), `Array.prototype.at(-1)`, `Object.hasOwn`, `structuredClone`, `Object.groupBy`.

## Interview checklist

- Say when destructuring and parameter defaults apply, and why `null` doesn't trigger them.
- Explain what spread copies (shallow, own enumerable, getters evaluated) and the difference from rest.
- Explain the parameter scope and TDZ with defaults.
- Write a tagged template and explain `strings.raw`.
- Explain how `?.` short-circuits, `??` vs `||`, and why `??=` is better than `x = x ?? y` for setters.
