---
skill: functional-programming
title: "Functional programming in JavaScript"
summary: "Pure functions and side effects, immutability and structural sharing, higher-order functions, map/filter/reduce, composition with pipe, currying and partial application, laziness with generators, and where FP shows up in React and Redux."
readingMinutes: 8
---

Functional programming (FP) builds programs out of **functions that transform values** instead of steps that change shared state. JavaScript isn't a pure functional language, but its first-class functions, array methods and immutable-update patterns are central to React, Redux and RxJS.

## Pure functions

A pure function:

1. returns the same output for the same input, and
2. has no **side effects**: it doesn't mutate its arguments or outside variables, perform I/O, or read the clock or random numbers.

```js
const total = (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0); // pure
const addItem = (cart, item) => { cart.push(item); };                     // impure: mutates
```

Pure functions are easy to test, cache (memoise) and run in parallel, because the call can be replaced by its result (**referential transparency**). Real apps need effects; FP keeps them at the edges (event handlers, effects, thunks) and keeps the core pure.

## Immutability

Instead of changing data, create a new version and **share** what didn't change:

```js
const next = { ...state, user: { ...state.user, name: "Ada" } }; // state.settings is reused
```

Reference equality (`prev !== next`) then tells React, Redux and memoised selectors exactly what changed. Mutating array methods (`sort`, `reverse`, `splice`, `push`) are the usual source of bugs; use `toSorted`, `toReversed`, `toSpliced`, `with`, spread, `map` and `filter`. `Object.freeze` gives shallow runtime protection; Immer lets you write "mutating" code that produces immutable updates.

## Higher-order functions and the array trio

Functions are values: they can be passed in and returned. `map` transforms each item, `filter` keeps some, `reduce` folds a list into one value. Watch out for:

- `["1", "2", "3"].map(parseInt)` → `[1, NaN, NaN]`, because `map` passes `(item, index)` and `parseInt` reads the index as the radix.
- `reduce` without an initial value throws on an empty array.
- Building a new object on every step (`reduce((acc, x) => ({ ...acc, [x.id]: x }), {})`) is O(n²). Mutating a **local** accumulator is fine: the function is still pure from the outside.

## Composition, currying and partial application

```js
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const slugify = pipe(trim, toLowerCase, (s) => s.replace(/\s+/g, "-"));
```

`pipe` applies functions left to right, `compose` right to left. **Currying** turns `f(a, b, c)` into `f(a)(b)(c)`; **partial application** fixes some arguments (`const log = logAt("debug")`). Both make small functions easy to combine.

## Laziness

Generators produce values on demand, so you can describe infinite or expensive sequences and pull only what you need:

```js
function* naturals() { let n = 1; while (true) yield n++; }
```

RxJS observables apply the same idea to events over time.

## Common pitfalls

- Memoising an impure function returns stale results.
- Point-free style can hurt readability; name intermediate steps when it helps.
- Deep copies (`structuredClone`) on every update are expensive; prefer structural sharing.

## Interview checklist

- Define a pure function and a side effect, with examples.
- Update nested state immutably and explain structural sharing.
- Explain the `map(parseInt)` result and `reduce`'s initial value.
- Implement `pipe`/`compose` and a simple `curry`.
- Explain how FP ideas appear in React (pure render, immutable state) and Redux (pure reducers).
