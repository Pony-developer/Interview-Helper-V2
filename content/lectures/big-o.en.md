---
skill: big-o
title: "Big-O complexity: reasoning about time and space"
summary: "What Big-O measures, the common classes from O(1) to O(2ⁿ), how to analyse loops and recursion, and the hidden costs in everyday JavaScript."
readingMinutes: 7
---

Big-O describes how an algorithm's cost **grows** as the input grows. It ignores constants and lower-order terms, so it describes scaling, not speed.

## Common classes

| Class | Name | Example | n = 1,000,000 |
| --- | --- | --- | --- |
| O(1) | constant | array index, `Map.get` | 1 step |
| O(log n) | logarithmic | binary search | ~20 |
| O(n) | linear | single loop, `includes` | 10⁶ |
| O(n log n) | linearithmic | good sorts | ~2·10⁷ |
| O(n²) | quadratic | nested loops over the same data | 10¹² ✗ |
| O(2ⁿ) | exponential | all subsets, naive Fibonacci | ✗✗ |

A rough rule: about 10⁸ simple operations per second. If your formula gives more than that for the real input size, look for a better algorithm.

## How to analyse code

- **Sequential blocks add**: O(n) + O(n log n) = O(n log n), because the biggest term wins.
- **Nested loops multiply**: a loop over `n` inside a loop over `m` is O(n·m).
- **Halving** the problem each step gives O(log n).
- **Recursion**: count the calls times the work per call. Two branches per level, n levels deep, is O(2ⁿ).
- Use different letters for different inputs: comparing two lists is O(n + m) or O(n·m), not O(n²).

## Hidden costs in JavaScript

```js
for (const id of ids) {
  if (list.includes(id)) …     // O(n) inside a loop → O(n·m)
}
const set = new Set(list);      // build once: O(n)
for (const id of ids) if (set.has(id)) … // O(m)
```

Other traps: `array.shift()`/`unshift()` are O(n); `slice`, spread, `concat` and `JSON.stringify` copy everything (O(n)); string concatenation in nested loops; `sort` is O(n log n).

## Space complexity

Count the extra memory beyond the input: new arrays, Maps, recursion depth (the call stack!). Merge sort uses O(n) extra memory, an iterative binary search O(1), a recursive DFS on a tree O(height).

## Amortised cost

`array.push` is O(1) **amortised**. Occasionally the engine reallocates and copies (O(n)), but averaged over many pushes the cost per push stays constant.

## Best, average, worst

Quicksort is O(n log n) on average but O(n²) in the worst case. Hash maps are O(1) on average but degrade with many collisions. When asked "what's the complexity", state which case you mean.

## Interview checklist

- State time **and** space complexity unprompted.
- Explain where the dominant term comes from.
- Remove an O(n) lookup from inside a loop with a Set/Map.
- Mention best, average and worst case when they differ.
