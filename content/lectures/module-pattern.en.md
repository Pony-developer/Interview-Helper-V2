---
skill: module-pattern
title: "The module pattern and encapsulation: hiding state with closures"
summary: "Why encapsulation matters, IIFEs and the classic module pattern, the revealing module and factory function patterns, singletons vs instances, the four ways to make something private (closures, #private, WeakMap, Symbol) and their trade-offs, and how ES modules replaced the pattern while keeping its idea."
readingMinutes: 9
---

Encapsulation means exposing a small, deliberate **public API** and keeping everything else private, so other code can't depend on internals or put them into an invalid state. Long before JavaScript had modules or `#private`, developers built it from one language feature: **closures**.

## The IIFE

An Immediately Invoked Function Expression creates a scope, runs once, and leaves nothing in the global scope except what it returns:

```js
const counter = (function () {
  let count = 0; // private: only the returned functions can reach it
  return {
    increment() { return ++count; },
    get value() { return count; },
  };
})();
```

The parentheses make the `function` keyword an expression, so it can be called immediately. In the era of script tags, IIFEs prevented global collisions between libraries (jQuery plugins, UMD bundles) and still appear in bundler output.

## The module pattern and its variants

- **Classic module pattern**: an IIFE returns an object whose methods close over private variables and helpers. The result is a **singleton**: one instance, created once.
- **Revealing module pattern**: define everything as private functions, then return an object that maps public names to them: `return { add, remove, list };`. The public API is visible at a glance. A known drawback is that internal calls go to the private functions, so patching the public method (for example in a test) doesn't change internal behaviour.
- **Module factory**: the same function without the immediate call, so each call creates an independent instance: `const a = createCounter(); const b = createCounter();`. That's the closure-based alternative to classes: no `this`, no `new`, and methods can be passed around as callbacks safely. The cost is that each instance gets its own copies of the methods.
- **Dependency injection**: pass collaborators in as arguments (`createStore({ storage, clock })`) instead of reaching for globals, which makes modules testable.

## Four ways to be private

| Technique | How private? | Notes |
| --- | --- | --- |
| Closure variables | truly private | works everywhere, per-instance method copies, invisible to debugging tools except via scopes |
| `#private` fields | truly private | class syntax, brand checks with `#x in obj`, break with `Proxy` |
| `WeakMap` keyed by instance | private to the module that holds the map | pre-`#private` technique, doesn't stop garbage collection |
| `Symbol` keys | hidden, not private | skipped by `Object.keys` and JSON, but visible via `Object.getOwnPropertySymbols` |

An underscore prefix (`_cache`) is only a convention, and TypeScript's `private` is erased at compile time, so neither stops runtime access.

## From the pattern to real modules

ES modules give every file its own scope: top-level declarations are private unless **exported**, the module body runs **once** (later imports share the same instance, so a module with state is a natural singleton), and imports are read-only live bindings. CommonJS modules (`module.exports`) are wrapped in a function by Node: literally the module pattern. Because modules already provide a scope, IIFEs are rarely needed in modern code, but the underlying idea (closures as the boundary of what's private) is still how hooks, middleware and factories work.

## Design guidance

- Keep the public surface small and stable; return copies (or frozen views) of internal collections so callers can't mutate them.
- Validate input at the public boundary, and keep invariants inside.
- Prefer factories or classes over module-level singletons for anything that holds per-user or per-request state, especially on servers where one module instance serves every request.
- Expose a way to reset or inject state for tests instead of reaching into internals.

## Interview checklist

- Write an IIFE-based module with private state and explain why it works.
- Compare the module pattern, the revealing module pattern and module factories.
- Compare closures, `#private`, `WeakMap` and `Symbol` keys for privacy.
- Explain how ES modules provide the same encapsulation, and why module-level state is a singleton.
- Explain the danger of returning internal arrays or objects directly.
