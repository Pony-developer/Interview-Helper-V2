Sometimes only a **part** of an array has to be sorted. Implement `SortRange(a, from, to)` with the **bubble sort**. It sorts the elements with the indexes `from` to `to − 1` (the upper end is **not** included) in ascending order, **in place**, and leaves all the other elements where they were.

The method **returns the number of swaps** that it made. Swap only **neighbouring** elements, and only when the left one is **strictly greater** than the right one. Then the number of swaps does not depend on how you write the loops: it always equals the number of **inversions** in the range, the pairs in the wrong order.

For an empty range (`from == to`) or a range of one element, there is nothing to do, and the result is `0`.

`Main` sorts a part of the array `{ 9, 4, 7, 1, 8, 2, 6, 3 }`: the elements with the indexes 2 to 5, which are `7 1 8 2`. There are three inversions in it: `(7,1)`, `(7,2)` and `(8,2)`. Then it sorts the whole array, and tries two ranges that do nothing. Do not change `Main`. Expected output:

```text
9 4 1 2 7 8 6 3
3
15
1 2 3 4 6 7 8 9
0
0
5 4 3 2 1
```

The lines in order: the array after sorting the range 2..6; the number of swaps for it; the number of swaps for sorting the whole array afterwards (15 inversions were left); the sorted array; the swaps for an empty range; the swaps for a range of one element; and the array `5 4 3 2 1`, which these two calls left unchanged.

Hint: the outer loop counts the passes. In pass `p`, the inner loop goes over `i` from `from` while `i < to − 1 − p`, and compares `a[i]` with `a[i + 1]`. You can also stop early, when a pass makes no swap.
