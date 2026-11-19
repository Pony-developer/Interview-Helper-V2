---
skill: javascript
title: "JavaScript essentials: types, equality, this and prototypes"
summary: "The language rules interviewers probe first: primitive vs reference values, coercion, == vs ===, how `this` is bound and how prototypes work."
readingMinutes: 8
---

JavaScript interviews usually start with the fundamentals, because every bug you will ever debug traces back to them.

## Values and types

There are seven primitive types: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol` and `null`. Everything else is an **object**: arrays, functions, dates and maps included.

- Primitives are immutable and compared **by value**.
- Objects are compared **by reference**: `{} === {}` is `false`, because they are two different objects.

```js
const a = { n: 1 };
const b = a;      // same reference
b.n = 2;
console.log(a.n); // 2
```

`typeof null === "object"` is a historical bug. Check `value === null` explicitly, and use `Array.isArray` for arrays.

## Equality and coercion

`===` compares type and value without conversion. `==` first coerces both sides with a complicated algorithm:

```js
0 == "";        // true
null == undefined; // true (and nothing else is == null)
[] == false;    // true
NaN === NaN;    // false: use Number.isNaN or Object.is
```

Use `===` everywhere. The one common exception is `value == null`, which checks for both `null` and `undefined`.

**Truthiness**: only `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN` are falsy. `[]` and `{}` are truthy.

## `let`, `const` and `var`

- `var` is function-scoped and hoisted with the value `undefined`.
- `let` and `const` are block-scoped. Reading them before their declaration throws (the *temporal dead zone*).
- `const` prevents reassignment, not mutation: `const arr = []; arr.push(1)` is fine.

## How `this` is bound

`this` is decided by **how a function is called**, not where it is defined:

| Call | `this` |
| --- | --- |
| `obj.method()` | `obj` |
| `fn()` | `undefined` in strict mode (the global object otherwise) |
| `fn.call(x)` / `fn.apply(x)` / `fn.bind(x)()` | `x` |
| `new Fn()` | the new object |
| arrow function | `this` of the enclosing scope (lexical) |

A classic bug is passing a method as a callback: `setTimeout(obj.method)` loses `obj`. Fix it with `obj.method.bind(obj)` or an arrow function.

## Prototypes

Every object has a hidden link (`[[Prototype]]`) to another object. Property lookups walk this chain:

```js
const animal = { speak() { return `${this.name} makes a sound`; } };
const dog = Object.create(animal);
dog.name = "Rex";
dog.speak(); // "Rex makes a sound": found on the prototype, this === dog
```

`class` syntax is sugar over the same mechanism: methods live on `Class.prototype`, and `extends` links two prototype chains.

## Interview checklist

- Explain primitive vs reference semantics with an example of mutation.
- Never rely on `==` coercion; know `== null` as the only idiom.
- Predict `this` from the call site, and know how arrow functions differ.
- Draw the prototype chain for a `class` that extends another.
