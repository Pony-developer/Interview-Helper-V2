The partition is the heart of quicksort: it rearranges a range so that the small elements come first, then the pivot, and then the large ones.

Implement `Partition(a, low, high)` with **Lomuto's scheme**, exactly as described:

1. The **pivot** is the last element of the range, `a[high]`.
2. Keep an index `i`, which starts at `low − 1`. Everything from `low` to `i` is `<=` the pivot.
3. Go through `j` from `low` to `high − 1`. If `a[j] <= pivot`, increase `i` by one and **swap** `a[i]` with `a[j]`.
4. At the end, swap `a[i + 1]` with `a[high]`, which puts the pivot into its final place.
5. Return the final index of the pivot, `i + 1`.

The method works on the range `low..high`, **both ends included**, and changes the array **in place**. The elements outside the range are not touched. The partition is **one pass**: O(n).

`Main` partitions several arrays and prints the array after the partition, an arrow, and the returned index. The last case works on a **part** of an array, the indexes 2 to 6. Do not change `Main`. Expected output:

```text
3 1 5 2 6 7 8 9 -> 4
1 2 3 4 5 -> 4
1 4 3 2 5 -> 0
4 4 4 4 -> 3
7 -> 0
8 3 1 2 5 7 9 6 -> 3
```

Look at the cases: for a sorted array, the pivot is the largest, and it stays at the end: this is why quicksort with the last element as the pivot is slow on sorted data. For the reversed array, the pivot 1 moves to the very beginning. For equal elements, the pivot ends up at the end of the range.

Hint: the exact order of the elements after the partition depends on the details of this scheme, so follow the steps literally, and use `<=`, not `<`. You can trace the first case with the lecture on quicksort.
