---
skill: recursion
title: "Recursion: base cases, trees, memoisation and backtracking"
summary: "How to design recursive functions that terminate, when recursion beats loops, how to avoid exponential blow-ups and stack overflows."
readingMinutes: 9
---

A recursive function solves a problem by solving smaller versions of the **same** problem. It's the natural tool for trees, nested data and "try every option" searches.

## The recipe

1. **Base case**: the smallest input you can answer directly.
2. **Recursive case**: shrink the problem and call yourself.
3. **Combine**: build the answer from the sub-results.

```js
function sum(list) {
  if (list.length === 0) return 0;          // base case
  return list[0] + sum(list.slice(1));      // smaller problem + combine
}
```

If any path never reaches a base case, you get infinite recursion and eventually `RangeError: Maximum call stack size exceeded`.

## Recursion fits nested data

```js
function flatten(value, depth = Infinity) {
  if (!Array.isArray(value)) return [value];
  if (depth === 0) return [value];
  return value.flatMap((item) => (Array.isArray(item) ? flatten(item, depth - 1) : [item]));
}
```

Trees (DOM nodes, JSON, file systems, menus) are recursive by nature: process the node, then recurse into its children.

## Exponential traps and memoisation

The naive Fibonacci recomputes the same values over and over:

```js
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)); // O(2^n)
```

Cache the results (**memoisation**) to make it O(n). Or flip it into a bottom-up loop, which is dynamic programming:

```js
function fibMemo(n, memo = new Map()) {
  if (n < 2) return n;
  if (!memo.has(n)) memo.set(n, fibMemo(n - 1, memo) + fibMemo(n - 2, memo));
  return memo.get(n);
}
```

## Backtracking

Try a choice, recurse, then **undo** it. This generates permutations, subsets and solves puzzles:

```js
function permutations(items) {
  const out = [], current = [], used = new Array(items.length).fill(false);
  (function go() {
    if (current.length === items.length) return void out.push([...current]);
    for (let i = 0; i < items.length; i++) {
      if (used[i]) continue;
      used[i] = true; current.push(items[i]);
      go();
      current.pop(); used[i] = false;            // undo
    }
  })();
  return out;
}
```

## Stack depth

Each call uses a stack frame. JavaScript engines have no general tail-call optimisation, so recursion depth is limited (often around 10k frames). For very deep inputs, such as a 100k-long linked list, convert the recursion to a loop with an explicit stack.

## Going deeper

**No tail-call optimisation in practice.** The spec defines proper tail calls in strict mode, but only Safari implements them. In Chrome and Node.js a tail-recursive function still uses one stack frame per call.

**Trampolines.** Instead of calling itself, each step returns a function (a thunk) for the next step, and a loop runs the thunks. The stack depth stays constant, at the cost of one allocation per step.

**Unique permutations.** In backtracking with repeated values, keep a `Set` of the values already tried at the current position and skip repeats. That prunes duplicate branches instead of generating duplicates and filtering them afterwards.

**Output-sensitive cost.** Generating all subsets or permutations can never be cheaper than the output itself: O(n·2ⁿ) for subsets and O(n·n!) for permutations, when each result is materialised as an array.

## Interview checklist

- State the base case first and prove the input shrinks.
- Spot overlapping sub-problems and add memoisation.
- Explain the time complexity by counting the calls.
- Know when to convert to iteration to avoid stack overflow.
