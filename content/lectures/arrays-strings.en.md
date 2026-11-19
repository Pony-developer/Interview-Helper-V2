---
skill: arrays-strings
title: "Arrays and strings: idiomatic transformations"
summary: "map, filter, reduce and friends; mutating vs non-mutating methods; sorting pitfalls; and string tricks for the classic warm-up questions."
readingMinutes: 7
---

Most coding warm-ups are array or string transformations. Interviewers look for idiomatic, readable code, and for whether you know which methods **mutate**.

## Transform, don't loop by hand

```js
const active = users.filter((u) => u.active);
const names = active.map((u) => u.name);
const total = orders.reduce((sum, o) => sum + o.amount, 0);
const hasAdmin = users.some((u) => u.role === "admin");
const allPaid = orders.every((o) => o.paid);
const firstBig = orders.find((o) => o.amount > 100);
```

Give `reduce` an **initial value**: without one it throws on an empty array and treats the first element as the accumulator.

## Mutating vs non-mutating

| Mutates the array | Returns a new array |
| --- | --- |
| `push`, `pop`, `shift`, `unshift` | `concat`, spread `[...a, x]` |
| `splice` | `slice`, `toSpliced` |
| `sort`, `reverse` | `toSorted`, `toReversed` |
| `fill`, `copyWithin` | `map`, `filter`, `with(i, v)` |

In React or Redux state, never mutate. `arr.sort()` sorts **in place** and returns the same array, so copy first or use `toSorted`.

## Sorting pitfalls

```js
[10, 9, 1].sort();               // [1, 10, 9]: compares strings by default!
[10, 9, 1].sort((a, b) => a - b); // [1, 9, 10]
names.sort((a, b) => a.localeCompare(b)); // locale-aware strings
```

`Array.prototype.sort` is stable, so equal elements keep their order. That lets you sort by several keys in turn.

## Useful idioms

```js
const unique = [...new Set(items)];
const byId = Object.fromEntries(users.map((u) => [u.id, u]));
const chunks = Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const counts = words.reduce((m, w) => m.set(w, (m.get(w) ?? 0) + 1), new Map());
```

## Strings

Strings are immutable. Every method returns a new string.

- `split`, `join`, `slice`, `trim`, `padStart`, `replaceAll`, `includes`, `startsWith`.
- Reverse with `[...s].reverse().join("")`. Spreading splits by code points, so emoji survive; `split("")` breaks them.
- **Anagram check**: compare sorted letters, or better, count characters in a Map, which is O(n).
- **Palindrome check**: normalise (lowercase, keep letters and digits), then compare with two pointers.

Building a long string with `+=` in a loop is fine in modern engines. For many pieces, `array.join` is clearer.

## Complexity awareness

- `includes`/`indexOf` inside a loop is O(n²). Build a `Set` first.
- `shift`/`unshift` are O(n), because they re-index the array. A queue with heavy use needs a better structure.

## Interview checklist

- Reach for `map`/`filter`/`reduce`, and say when a plain loop is clearer.
- Know which methods mutate, and copy before sorting shared data.
- Always pass a comparator to `sort` for numbers.
- Use Map/Set to turn nested loops into linear passes.
