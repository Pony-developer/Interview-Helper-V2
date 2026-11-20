---
skill: immutability-copying
title: "Values, references and immutability: who else can see this change?"
summary: "Primitives vs objects, why JavaScript is pass-by-value where the value can be a reference, shallow vs deep copies and what structuredClone and JSON round-trips lose, immutable update patterns for nested data, structural sharing and why frameworks rely on reference equality, freezing, and libraries like Immer."
readingMinutes: 10
---

Many bugs come from one question nobody asked: **does anyone else hold a reference to this object?** A sorted array that also reorders the original, a "copy" of settings whose nested values change together, a React component that doesn't re-render after a mutation: all of these come from how JavaScript handles values and references.

## Primitives and references

Primitives (`string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`) are **immutable values**: string methods return new strings, and you can't change `5`. Objects (including arrays, functions, maps and dates) are values that variables hold **by reference**:

```js
const a = { n: 1 };
const b = a;      // copies the reference: one object, two names
b.n = 2;          // a.n is 2 as well
const c = { n: 2 };
a === c;          // false: equality compares identity, not contents
```

JavaScript is **pass-by-value**, but for objects the value passed is a reference. A function can **mutate** the object you gave it (`list.push(x)` is visible to the caller), but it can't **rebind** your variable (`list = []` inside the function only changes its local parameter). `const` prevents rebinding, not mutation.

## Mutating methods to watch for

| Mutates in place | Non-mutating alternative |
| --- | --- |
| `sort`, `reverse`, `splice` | `toSorted`, `toReversed`, `toSpliced` (ES2023), or copy first: `[...arr].sort()` |
| `arr[i] = x` | `arr.with(i, x)` |
| `push`, `pop`, `shift`, `unshift`, `fill`, `copyWithin` | spread, `slice`, `concat` |
| `Object.assign(target, …)` | `{ ...a, ...b }` or `Object.assign({}, …)` |
| `Date` setters | create a new `Date` |

## Shallow vs deep copies

- **Shallow copies** (`{ ...obj }`, `[...arr]`, `Object.assign({}, obj)`, `Array.from`, `slice`) duplicate the top level only; nested objects are shared.
- **`structuredClone(value)`** makes a **deep** copy and handles cycles, `Map`, `Set`, `Date`, `RegExp`, typed arrays, `Blob`s and errors. It **throws** on functions and DOM nodes, and it **drops** prototypes (class instances come back as plain objects), getters (copied as values) and non-enumerable properties.
- **`JSON.parse(JSON.stringify(value))`** loses more: `undefined` and functions disappear, `Date` becomes a string, `Map`/`Set` become `{}`, `NaN` and `Infinity` become `null`, and cycles throw.
- Libraries (lodash `cloneDeep`) or a hand-written recursive clone with a `WeakMap` for cycles give you control over class instances.

Deep copying everything is wasteful; usually you only need to copy **the path you change**.

## Immutable updates and structural sharing

To "change" nested data immutably, copy each object along the path and reuse everything else:

```js
const next = {
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: "Lviv" } },
};
next.settings === state.settings; // true: unchanged branches are shared
```

This is **structural sharing**: updates cost O(depth), not O(size), and unchanged parts keep their identity. That's why frameworks can use cheap **reference equality** to detect changes: React's state updates and `memo`, Redux selectors, `useEffect` dependencies, Angular's `OnPush`. Mutating in place breaks them: the reference stays the same, so nothing re-renders (or a memoised value goes stale).

**Immer** lets you write mutating code against a draft (`produce(state, (draft) => { draft.user.address.city = "Lviv"; })`) and produces a structurally shared immutable result. Redux Toolkit uses it under the hood.

## Freezing

`Object.freeze` makes an object's own properties read-only and stops additions, but it's **shallow**; deep-freeze recursively for constants or in development to catch accidental mutations. In strict code, writes to frozen objects throw, which turns hidden mutations into visible errors. Freezing has a small cost, and TypeScript's `readonly` and `as const` give compile-time protection with no runtime cost.

## Equality

- `===` and `Object.is` compare object **identity**.
- Deep equality (lodash `isEqual`, Node's `assert.deepStrictEqual`, test-framework `toEqual`) compares contents; it's useful in tests, but expensive in hot paths.
- With immutable data you rarely need deep equality: if the reference didn't change, the content didn't either.

## Interview checklist

- Explain primitives vs references, and "pass-by-value of a reference" with a function example.
- List mutating array methods and their non-mutating ES2023 alternatives.
- Compare spread, `structuredClone` and the JSON round-trip, including what each loses.
- Write an immutable nested update and explain structural sharing.
- Explain why frameworks rely on reference equality and what mutation breaks.
