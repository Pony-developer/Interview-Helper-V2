---
skill: searching-algorithms
title: "Searching algorithms: linear, binary and two pointers"
summary: "How to find things fast, why binary search needs sorted input, and the off-by-one traps interviewers love."
readingMinutes: 7
---

Searching is the most common building block in interview problems. Before you write a loop, ask two questions: **is the data sorted?** and **how many times will I search?** The answers decide between a linear scan, binary search, a hash map or two pointers.

## Linear search: O(n)

Walk the collection from start to end and stop at the first match.

```ts
function indexOf<T>(items: T[], target: T): number {
  for (let i = 0; i < items.length; i++) {
    if (items[i] === target) return i;
  }
  return -1;
}
```

It works on **any** data, sorted or not. For a single lookup on unsorted data it is optimal: you cannot know an element is missing without looking at every element. `Array.prototype.indexOf`, `includes` and `find` are all linear.

If you need **many** lookups, build a `Set` or `Map` once (O(n)) and then each lookup is O(1) on average.

## Binary search: O(log n)

On **sorted** data you can discard half of the remaining range at every step.

```ts
function binarySearch(items: number[], target: number): number {
  let lo = 0;
  let hi = items.length - 1;          // inclusive bounds
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1); // avoids overflow in other languages
    if (items[mid] === target) return mid;
    if (items[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
```

The invariant: *if the target exists, it is inside `[lo, hi]`*. Every branch must keep that true and shrink the range, otherwise you loop forever.

### Common bugs

- Using `while (lo < hi)` with inclusive bounds: you skip checking the last element.
- Writing `lo = mid` instead of `lo = mid + 1`: the range stops shrinking when `hi - lo === 1`.
- Running binary search on unsorted data: it returns garbage without throwing.
- Sorting first just to search once: sorting is O(n log n), worse than a single linear scan.

### Lower bound: first position ≥ target

Many interview tasks ("insert position", "first bad version", "count occurrences") are variations of *lower bound*:

```ts
function lowerBound(items: number[], target: number): number {
  let lo = 0;
  let hi = items.length;              // half-open [lo, hi)
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (items[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;                          // 0..length
}
```

Count of `x` in a sorted array = `lowerBound(x + 1) - lowerBound(x)`, which is O(log n).

### Binary search on the answer

If you can check "is X good enough?" and the answer flips from *no* to *yes* exactly once as X grows, binary search over X. Examples: the minimum ship capacity to deliver packages in D days, or the smallest divisor with a sum below a threshold.

## Two pointers: O(n) on sorted data

To find a pair with a given sum in a sorted array, start one pointer at each end:

```ts
function pairWithSum(sorted: number[], sum: number): [number, number] | null {
  let i = 0;
  let j = sorted.length - 1;
  while (i < j) {
    const s = sorted[i] + sorted[j];
    if (s === sum) return [i, j];
    if (s < sum) i++;
    else j--;
  }
  return null;
}
```

Each step removes one candidate, so the whole scan is linear. On unsorted data, use a `Map` of seen values instead (also O(n)).

## Choosing the approach

| Situation | Best tool | Cost |
| --- | --- | --- |
| One lookup, unsorted | Linear scan | O(n) |
| Many lookups, unsorted | Build a `Set`/`Map` | O(n) once, then O(1) |
| Sorted array | Binary search | O(log n) |
| Pair/range problems on sorted data | Two pointers | O(n) |
| Monotonic yes/no question | Binary search on the answer | O(log range · check) |

## Interview checklist

1. State whether the input is sorted, and whether duplicates are possible.
2. Choose inclusive `[lo, hi]` or half-open `[lo, hi)` bounds and stick to them.
3. Test the empty array, one element, the target at both ends, and a missing target.
4. Say the complexity out loud.
