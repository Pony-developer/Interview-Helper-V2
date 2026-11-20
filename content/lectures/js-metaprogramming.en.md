---
skill: js-metaprogramming
title: "Symbols, Proxy and Reflect: programming the language itself"
summary: "Property descriptors, getters and setters, freeze/seal and their limits, Symbols and the global registry, well-known symbols that customise built-in behaviour, Proxy traps and invariants, Reflect and the receiver, and practical uses such as validation, observation and defaults."
readingMinutes: 9
---

Metaprogramming means code that inspects or changes how other code behaves: how properties are read and written, how objects convert to strings, how `instanceof` or `for…of` treat them. JavaScript exposes this through property descriptors, Symbols, `Proxy` and `Reflect`. Frameworks rely on it heavily (Vue's reactivity, MobX, Immer, ORMs, test mocks).

## Property descriptors

Every property has attributes:

| Attribute | Meaning | Literal default | `defineProperty` default |
| --- | --- | --- | --- |
| `value` / `get` + `set` | data property or accessor | – | – |
| `writable` | can be assigned | `true` | `false` |
| `enumerable` | shows up in `Object.keys`, `for…in`, spread, `JSON.stringify` | `true` | `false` |
| `configurable` | can be deleted or redefined | `true` | `false` |

```js
const user = {};
Object.defineProperty(user, "id", { value: 42 });   // read-only, hidden, permanent
Object.defineProperty(user, "name", {
  get() { return this._name; },
  set(v) { if (!v) throw new TypeError("name is required"); this._name = v; },
  enumerable: true,
});
```

Getters and setters (also written as `get x() {}` in literals and classes) run code on access: computed values, validation, lazy loading. `Object.getOwnPropertyDescriptor(s)` reads the attributes back.

## Locking objects

- `Object.preventExtensions(o)`: no new properties.
- `Object.seal(o)`: also no deleting or reconfiguring.
- `Object.freeze(o)`: also no writing.

All three are **shallow**: nested objects stay mutable unless you freeze them too. Violations fail silently in sloppy scripts and throw a `TypeError` in strict mode (modules and classes).

## Symbols

`Symbol("description")` creates a unique primitive, usable as a property key that can't clash with any string key or any other symbol. Symbol-keyed properties are skipped by `Object.keys`, `for…in` and `JSON.stringify` (but `Object.getOwnPropertySymbols` and `Reflect.ownKeys` see them), so they're good for metadata and "private-ish" keys. `Symbol.for("key")` uses a global registry, so the same string returns the same symbol everywhere, even across iframes.

**Well-known symbols** let your objects hook into language behaviour:

| Symbol | Customises |
| --- | --- |
| `Symbol.iterator` / `Symbol.asyncIterator` | `for…of`, spread / `for await…of` |
| `Symbol.toPrimitive` | conversion to number and string |
| `Symbol.toStringTag` | `Object.prototype.toString` → `[object Name]` |
| `Symbol.hasInstance` | the result of `instanceof` |
| `Symbol.species`, `Symbol.isConcatSpreadable` | derived collections, `concat` |

## Proxy

A `Proxy` wraps a target object and intercepts fundamental operations with **traps**:

```js
const withDefault = (target, fallback) =>
  new Proxy(target, {
    get(t, key, receiver) {
      return key in t ? Reflect.get(t, key, receiver) : fallback;
    },
  });
const counts = withDefault({}, 0);
counts.apples++; // 1, no undefined + 1 = NaN
```

Common traps: `get`, `set`, `has` (`in`), `deleteProperty`, `ownKeys` (`Object.keys`, spread), `getOwnPropertyDescriptor`, `defineProperty`, `apply` and `construct` (for function targets). Uses: validation, observable state, default values, negative array indexes, access logging, and API clients that turn `api.users.get(1)` into requests.

Proxies must respect **invariants**: a trap can't lie about a non-configurable, non-writable property (report a different value, or hide it), or the engine throws a `TypeError`. Only operations that go through the proxy are intercepted; the original target can still be modified directly. Proxies have a performance cost, so keep them off hot paths.

## Reflect

`Reflect` has one method per trap (`Reflect.get`, `Reflect.set`, `Reflect.has`, `Reflect.ownKeys`, `Reflect.apply`, …) that performs the **default** behaviour. Inside traps, forward with `Reflect` and pass the `receiver`: if the target has getters that use `this`, `Reflect.get(t, key, receiver)` runs them with `this` = the proxy, so nested reads go through your traps too, while `t[key]` would bypass them. `Reflect.ownKeys` returns string **and** symbol keys, and `Reflect.set` returns `true`/`false` instead of throwing.

## Other metaprogramming tools

- `new.target` tells a function whether it was called with `new` (useful for abstract base classes).
- Function `name` is inferred from assignments (`const add = () => {}` has `name` `"add"`).
- Tagged templates receive the literal strings (including `strings.raw`) and the values separately.
- `structuredClone`, `Object.groupBy`, `WeakMap` and `WeakRef` round out the modern object toolbox: `WeakMap` attaches data to objects without preventing their garbage collection.

## Interview checklist

- Explain the descriptor attributes and their different defaults.
- Explain freeze/seal and why they're shallow.
- Explain what makes Symbols unique, how they're hidden from enumeration, and `Symbol.for`.
- Use at least three well-known symbols.
- Write a Proxy with `get`/`set` traps that forwards via `Reflect` with the receiver, and explain invariants.
