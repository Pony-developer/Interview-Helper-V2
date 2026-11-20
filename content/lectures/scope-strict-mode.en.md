---
skill: scope-strict-mode
title: "The scope model and strict mode: how JavaScript finds your variables"
summary: "Scopes decided at compile time, how a failed lookup behaves for reads vs writes, the global object vs the global scope, hoisting precedence, function declarations inside blocks, named function expressions, the arguments object, eval and with, and the complete picture of what strict mode changes."
readingMinutes: 10
---

JavaScript is often called "interpreted", but before any line runs, the engine **parses the whole script or module** and decides which scope each declaration belongs to. Scope is **lexical**: it depends on where code is written, not on where it's called from. Knowing this model makes hoisting, shadowing and most "weird" scope behaviour predictable.

## Two phases

1. **Parse and compile.** The engine builds scopes (global, module, function, block) and records declarations. Some errors are **early errors**, reported before anything runs: duplicate `let` declarations, `return` outside a function, invalid strict-mode syntax. One bad line means none of the file runs.
2. **Execute.** Each name reference is resolved by looking in the current scope, then the enclosing ones, out to the global scope.

## When a lookup fails

What happens with an undeclared name depends on how it's used:

| Use | Sloppy mode | Strict mode |
| --- | --- | --- |
| Read (`console.log(x)`) | `ReferenceError` | `ReferenceError` |
| Write (`x = 1`) | silently creates a **global** variable | `ReferenceError` |
| `typeof x` | `"undefined"` | `"undefined"` |

Implicit globals are the classic sloppy-mode bug: a typo in an assignment creates a global instead of failing. `typeof` is the one safe way to test for a name that may not exist (except for names in their TDZ, which still throw).

## The global scope vs the global object

In a classic `<script>`, top-level `var` and function declarations become **properties of the global object** (`window`, `globalThis`). Top-level `let`, `const` and `class` live in the global scope but **don't** create properties. So `var a = 1; let b = 2;` gives `window.a === 1` but `window.b === undefined`. Elements with an `id` also show up as globals in browsers.

**Modules** (and Node CommonJS files) have their own top-level scope, so nothing leaks onto `globalThis` unless you assign it explicitly. Use `globalThis` to reach the global object in any environment.

## Hoisting, precisely

Declarations are registered for their whole scope at the start:

- **Function declarations** are hoisted with their value, so they can be called before they appear.
- **`var`** is hoisted and initialised to `undefined`.
- **`let`, `const`, `class`** are hoisted but uninitialised: the TDZ.

When names collide, a function declaration beats a `var` with the same name (the `var` doesn't reset it to `undefined`, though a later assignment does), and between duplicate function declarations the last one wins. Redeclaring with `let` in the same scope is a `SyntaxError`.

## Tricky corners

- **Function declarations in blocks.** In strict mode they're block-scoped, like `let`. In sloppy mode, legacy web rules (Annex B) also create a `var`-like binding in the enclosing function that's only assigned when the block runs, so the function may be `undefined` outside the block. Use `const fn = () => {}` inside blocks instead.
- **Named function expressions**: `const f = function fact(n) { … }`. `fact` is visible only **inside** the function and is read-only: assigning to it is silently ignored in sloppy mode and throws in strict mode.
- **The `arguments` object.** In sloppy functions with simple parameters it's **mapped**: changing `arguments[0]` changes the first parameter and vice versa. In strict mode, and in any function with defaults, rest or destructuring, it's an unlinked copy. Arrow functions don't have their own `arguments`; prefer rest parameters.
- **`eval` and `with`.** Direct `eval` in sloppy mode can add `var` declarations to the calling function's scope at runtime, and `with` turns an object's properties into variables. Both make scope dynamic, block engine optimisations and are security risks. `with` is a `SyntaxError` in strict mode, and strict `eval` gets its own scope.

## What strict mode changes

Strict mode applies to a whole script or function that starts with `"use strict"`, and **automatically** to ES modules and class bodies. You can't add `"use strict"` to a function whose parameter list has defaults, rest or destructuring.

**Silent mistakes become errors:**

- Assigning to an undeclared variable throws.
- Writing to a read-only, getter-only or non-extensible property throws.
- Deleting a non-configurable property throws.

**Sloppy features are removed:**

- `with` is a `SyntaxError`.
- Legacy octal literals (`010`) and octal escapes are `SyntaxError`s.
- Duplicate parameter names are a `SyntaxError`.
- `delete x` on a plain variable is a `SyntaxError`.
- `arguments.callee` throws.

**Other changes:**

- `this` is `undefined` in plain function calls instead of the global object, and primitives passed as `this` aren't boxed.
- `eval` and `arguments` can't be used as names.
- Future reserved words (`implements`, `interface`, `package`, `private`, `protected`, `public`, `static`, `yield`, `let`) can't be identifiers.

Write modules and you get all of this by default, which is one more reason TypeScript and bundlers emit strict code.

## Interview checklist

- Explain why scope is lexical and decided before code runs, with an early-error example.
- Compare failed reads, failed writes and `typeof` in sloppy and strict mode.
- Explain why `var` creates a `window` property and `let` doesn't, and what modules change.
- Explain hoisting precedence between functions and `var`, and why to avoid function declarations in blocks.
- List at least six things strict mode changes, and where it's on automatically.
