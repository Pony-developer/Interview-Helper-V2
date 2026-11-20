---
skill: js-collections
title: "Map, Set and weak collections: choosing the right container"
summary: "When Map beats a plain object, how keys are compared (SameValueZero), iteration order and mutation during iteration, the new Set algebra methods, WeakMap/WeakSet/WeakRef and how they interact with garbage collection, and typed arrays over ArrayBuffer."
readingMinutes: 9
---

For years plain objects were JavaScript's only dictionary and arrays its only set. ES2015 added real collections, and later releases added weak references and set algebra. Knowing what each one guarantees helps you pick the right container and avoid subtle bugs.

## Map vs plain object

| | `Map` | plain object |
| --- | --- | --- |
| Key types | anything, including objects and `NaN` | strings and symbols (other keys are converted to strings) |
| Order | insertion order | integer-like keys first (ascending), then strings in insertion order |
| Size | `map.size` | `Object.keys(obj).length` |
| Inherited keys | none | `toString`, `constructor`, `__proto__` unless created with `Object.create(null)` |
| Iteration | directly iterable | via `Object.entries` |
| JSON | `JSON.stringify(map)` gives `{}` | serialises naturally |

Use a `Map` for dictionaries with dynamic keys, frequent additions and removals, or non-string keys. Use objects for records with a fixed shape and for JSON. Convert with `new Map(Object.entries(obj))` and `Object.fromEntries(map)`.

## How keys are compared

`Map` and `Set` use **SameValueZero**: like `===` except `NaN` equals `NaN` (and `+0` equals `-0`). Objects are compared **by reference**, so `set.add({ id: 1 })` twice stores two entries and `map.get({ id: 1 })` never finds anything. To deduplicate objects by value, key them by a derived string or id.

```js
new Set([NaN, NaN, 0, -0]).size; // 2
[...new Set(items.map((i) => i.id))]; // unique ids
```

## Iteration

Maps and Sets iterate in **insertion order**; re-setting an existing key keeps its position, while deleting and re-adding moves it to the end (handy for LRU caches). Iteration is **live**: entries added during a `for…of` loop are visited, and deleted ones that haven't been reached are skipped. `forEach` passes `(value, key)`; for a `Set`, both are the value.

## Set algebra

Modern engines (ES2025) have `union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`, `isSupersetOf` and `isDisjointFrom`. They return new Sets and accept any "set-like" argument (something with `size`, `has` and `keys`), such as a `Map`. Before them, you'd write `new Set([...a].filter((x) => b.has(x)))`. Membership checks with `has` are O(1) on average, versus O(n) for `array.includes`.

## Weak collections

`WeakMap` and `WeakSet` hold their keys **weakly**: if nothing else references a key object, it can be garbage-collected and the entry disappears. In exchange they're **not iterable** and have no `size` or `clear`, because their contents depend on when GC runs. Keys must be objects (or non-registered symbols).

Typical uses:

- Attach metadata or cached results to objects you don't own (DOM nodes, request objects) without leaking memory.
- Private data per instance, before `#private` existed.
- Track visited objects in deep clone or deep equality to handle cycles.

`WeakRef` holds a single object weakly (`ref.deref()` returns it or `undefined`), and `FinalizationRegistry` runs a callback some time after an object is collected. Both are non-deterministic: GC may never run, and callbacks may never fire. Use them only for caches and cleanup hints, never for program logic.

## Typed arrays and ArrayBuffer

An `ArrayBuffer` is a fixed-size block of raw bytes. **Views** read and write it: typed arrays (`Uint8Array`, `Int32Array`, `Float64Array`, …) and `DataView` for mixed types with explicit endianness.

- Typed arrays have a fixed length and convert values to their element type: `Uint8Array` wraps around (`256` → `0`, `-1` → `255`), `Uint8ClampedArray` clamps (`300` → `255`), integer arrays truncate fractions.
- Several views can share one buffer; `subarray` creates a view on the same memory, while `slice` copies.
- They're used for binary protocols, files and images (`canvas` pixels), WebGL, WebAssembly memory, crypto and Web Audio. Buffers can be **transferred** to workers without copying, and `SharedArrayBuffer` with `Atomics` lets threads share memory.

## Interview checklist

- Say when to choose `Map` over an object, and the pitfalls of objects as dictionaries.
- Explain SameValueZero and why object keys are compared by reference.
- Explain iteration order, including deleting and re-adding, and live iteration.
- Explain why weak collections aren't iterable, and give two real uses of `WeakMap`.
- Explain how typed arrays relate to `ArrayBuffer`, overflow behaviour, and `subarray` vs `slice`.
