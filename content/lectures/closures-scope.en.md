---
skill: closures-scope
title: "Closures and scope: what a function remembers"
summary: "Lexical scope, hoisting, the temporal dead zone, the classic loop bug, and practical closures like memoize, once and private state."
readingMinutes: 7
---

A **closure** is a function together with the variables it captured from the scope where it was created. Closures power callbacks, React hooks, module privacy and memoisation.

## Lexical scope

Scope is decided by **where code is written**, not where it runs. An inner function can read the variables of every enclosing function:

```js
function makeCounter() {
  let count = 0;                 // private: only reachable through the closure
  return {
    inc: () => ++count,
    get: () => count,
  };
}
const c = makeCounter();
c.inc(); c.inc();
c.get(); // 2
```

Every call to `makeCounter` creates a **new** `count`. Closures capture variables (live bindings), not snapshots of values.

## Hoisting and the temporal dead zone

- `function` declarations are hoisted completely and can be called before the line they're defined on.
- `var` is hoisted as `undefined`.
- `let`, `const` and `class` are hoisted but uninitialised. Touching them before the declaration throws a `ReferenceError`: that window is the *temporal dead zone*.

## The classic loop bug

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));
// 3 3 3: one shared `i`

for (let i = 0; i < 3; i++) setTimeout(() => console.log(i));
// 0 1 2: `let` creates a fresh binding per iteration
```

## Practical closures

```js
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}

function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}
```

Use `cache.has` rather than a truthiness check, so cached `0`, `""` or `undefined` results still count as hits. For multiple arguments you need a key strategy, such as nested Maps or a serialised key.

## Stale closures

A closure keeps seeing the variables from the render or call that created it. In React, an interval created once with `[]` dependencies reads the initial state forever. Fix it with updater functions, refs or correct dependencies.

## Memory

Captured variables stay alive as long as the closure is reachable. Remove event listeners and clear timers you no longer need, or their closures (and everything they captured) can't be collected.

## Interview checklist

- Explain why the `var` loop prints `3 3 3`.
- Implement `once`, `memoize`, `debounce` or a private counter.
- Describe the TDZ and what hoisting does for each declaration type.
- Spot stale closures and explain the fix.
