---
skill: sorting-algorithms
title: "Sorting algorithms: merge, quick, counting and stability"
summary: "How the classic sorts work, their complexity and stability, and how JavaScript's Array.prototype.sort behaves."
readingMinutes: 8
---

You rarely write a sort in production, but interviews use sorting to check your grasp of divide-and-conquer, complexity and stability.

## The landscape

| Algorithm | Average | Worst | Extra memory | Stable |
| --- | --- | --- | --- | --- |
| Insertion sort | O(n²) | O(n²) | O(1) | yes (fast on nearly sorted data) |
| Merge sort | O(n log n) | O(n log n) | O(n) | **yes** |
| Quicksort | O(n log n) | O(n²) | O(log n) stack | no |
| Heapsort | O(n log n) | O(n log n) | O(1) | no |
| Counting / radix | O(n + k) | O(n + k) | O(n + k) | yes |

Comparison sorts can't beat **O(n log n)** in the worst case. Counting and radix sorts avoid comparisons, so they can be linear for small integer ranges.

## Merge sort

Split in half, sort both halves recursively, then merge the two sorted halves:

```ts
function mergeSort<T>(a: T[], cmp: (x: T, y: T) => number): T[] {
  if (a.length <= 1) return a.slice();
  const mid = a.length >> 1;
  const left = mergeSort(a.slice(0, mid), cmp);
  const right = mergeSort(a.slice(mid), cmp);
  const out: T[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    out.push(cmp(right[j], left[i]) < 0 ? right[j++] : left[i++]); // ties take left → stable
  }
  return out.concat(left.slice(i), right.slice(j));
}
```

It's predictable at O(n log n), stable and great for linked lists and external sorting. The cost is O(n) extra memory.

## Quicksort

Pick a pivot, partition elements into "less than" and "greater than", then recurse on both sides. It's fast in practice and sorts in place. A bad pivot on already-sorted input degrades to O(n²), which random or median-of-three pivots avoid.

## Stability

A **stable** sort keeps equal elements in their original order. That matters when you sort by several keys: sort by the secondary key first, then by the primary key with a stable sort.

## JavaScript's `sort`

- Without a comparator it compares **strings**: `[10, 9, 1].sort()` gives `[1, 10, 9]`.
- The comparator returns a negative number, zero or a positive number. `(a, b) => a - b` sorts ascending.
- Since ES2019 it is guaranteed **stable**. V8 uses TimSort, a hybrid of merge and insertion sort.
- It sorts **in place**. Use `toSorted` or copy first when the array is shared state.

```js
users.toSorted((a, b) => a.age - b.age || a.name.localeCompare(b.name));
```

## Interview checklist

- Explain why merge sort is stable and quicksort isn't.
- Know the O(n log n) lower bound for comparison sorts and when counting sort beats it.
- Always supply a numeric comparator in JavaScript.
- Describe how to sort by several keys.
