---
skill: transpiling-polyfills
title: "Transpiling, polyfills and feature detection: shipping modern JavaScript to every browser"
summary: "The difference between new syntax and new APIs, what transpilers like Babel, SWC, esbuild and TypeScript do, how polyfills patch missing APIs and how to write a spec-compliant one, browserslist targets and the cost of over-transpiling, feature detection instead of user-agent sniffing, and progressive enhancement."
readingMinutes: 10
---

JavaScript evolves every year, but your users' browsers don't all update at once. Two separate tools close the gap, and interviews often check that you know which problem each one solves.

## Syntax vs APIs

- **New syntax** (arrow functions, `class`, optional chaining, `async`/`await`, private fields): an old engine can't even **parse** the file, so the whole script fails with a `SyntaxError`. It must be **transpiled**, rewritten at build time into older syntax.
- **New APIs** (`Array.prototype.at`, `Object.groupBy`, `structuredClone`, `Promise.withResolvers`): the code parses, but calling the missing function throws a `TypeError` at runtime. They can be **polyfilled**, added at runtime by code that implements them.

Some features can't be fully provided by either: `Proxy`, exact private-field semantics, `WeakRef` and some regex features (like lookbehind) need engine support. Transpilers emulate some of them approximately (with `WeakMap`s for `#private`), with performance and behaviour costs.

## Transpilers

Babel, SWC, esbuild and the TypeScript compiler parse source into an AST, transform the nodes the target doesn't support, and print code again, with **source maps** so that stack traces and debuggers point at your original code.

- `optional?.chain` becomes `a === null || a === void 0 ? void 0 : a.chain`.
- `async` functions become generator-based state machines (or regenerator code for very old targets), which is larger and slower than native code.
- `class` fields and `#private` become constructor assignments and `WeakMap` lookups.

Configure **targets** instead of transforming everything: a `browserslist` query (`> 0.5%, last 2 versions, not dead`) or explicit versions tells the tools what's supported, so modern browsers aren't sent bloated code. Some teams build two bundles: modern ES modules via `<script type="module">` and a legacy bundle via `<script nomodule>`.

## Polyfills

A polyfill checks whether a feature exists and installs an implementation if not:

```js
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, "at", {
    value: function at(index) {
      const len = this.length >>> 0;
      let i = Math.trunc(index) || 0;
      if (i < 0) i += len;
      return i < 0 || i >= len ? undefined : this[i];
    },
    writable: true,
    configurable: true,
    enumerable: false, // like built-ins, so for…in loops don't see it
  });
}
```

Good polyfills follow the spec closely: they coerce arguments the same way, handle edge cases (negative and fractional indexes, `NaN`, array-likes), match `name` and `length`, are **non-enumerable**, and never overwrite a native implementation. A polyfill that adds an enumerable property to `Array.prototype` breaks every `for…in` over arrays, and one that installs a slightly different behaviour can block the real feature (the "SmooshGate" story is why `Array.prototype.flatten` became `flat`).

In practice, use **core-js** with Babel's `useBuiltIns: "usage"` (only polyfills what your code uses, for your targets) instead of hand-written ones. A **ponyfill** is the side-effect-free alternative: a plain function you import (`import at from "array-at"`) that doesn't touch globals, which suits libraries.

## Feature detection, not browser detection

Check for the capability itself, not the browser name:

```js
if ("IntersectionObserver" in window) observeLazily(images);
else loadAllImages(images);

const supportsHas = CSS.supports("selector(:has(a))");
```

User-agent sniffing breaks when browsers change their UA strings (which they do, and freeze them), when a browser adds the feature, and for browsers you didn't list. Feature detection works for any engine. Some features can't be detected cheaply (syntax), so you either rely on build targets or detect by trying: `try { new Function("a?.b") }` (not allowed under a strict CSP).

## Progressive enhancement

Build a baseline that works everywhere, then layer on enhancements when features exist: native lazy loading with an attribute, a `<dialog>` with a fallback, View Transitions only where supported. This is cheaper than polyfilling everything and degrades gracefully.

## Trade-offs

Every transform and polyfill costs bytes, parse time and sometimes runtime speed, all paid by **every** user, including those on modern browsers if you don't split builds. Review your targets regularly; dropping very old browsers often removes most of the cost. Measure the bundle (for example with a bundle analyzer) before and after.

## Interview checklist

- Explain the difference between syntax and APIs, and which tool handles each.
- Describe what a transpiler does, including source maps and how targets are chosen.
- Write a polyfill and list what makes it spec-compliant and safe.
- Explain why feature detection beats user-agent sniffing, with an example.
- Explain the cost of transpiling and polyfilling, and how differential builds reduce it.
