The **right bound** (the **upper bound**) is the partner of the left bound. In a sorted array, it is the **first index `i`** such that `sorted[i] > x` (strictly greater). If no element is greater than `x`, it is `sorted.Length`.

It is the position just **after the last occurrence** of `x`. The difference between the two bounds is a handy number: it is **how many times `x` occurs**:

```text
CountOccurrences(a, x) = UpperBound(a, x) − LowerBound(a, x)
```

Both can be found in O(log n), so the count is found without walking over the repeated values, which could be a million of them.

Implement two methods:

- `UpperBound(sorted, x)`: the smallest index with `sorted[i] > x`, or `sorted.Length`.
- `CountOccurrences(sorted, x)`: how many elements are equal to `x`.

The method `LowerBound` from the previous task is **already written** in the starter code, so you can use it.

For `{ 1, 2, 2, 2, 5, 8, 8, 10 }`:

| x | `UpperBound` | `CountOccurrences` |
| --- | --- | --- |
| 1 | 1 | 1 |
| 2 | 4 | 3 |
| 3 | 4 | 0 |
| 8 | 7 | 2 |
| 11 | 8 | 0 |

The only difference in the search is the comparison. For the lower bound, "too small" is `sorted[mid] < x`. For the upper bound, it is `sorted[mid] <= x`.

Do not change `Main`. Expected output:

```text
0 -> 0
1 -> 1
2 -> 4
3 -> 4
5 -> 5
8 -> 7
9 -> 7
10 -> 8
11 -> 8
3
2
0
1
0
```

The first nine lines are `UpperBound` for the values 0, 1, 2, 3, 5, 8, 9, 10 and 11. The last five are `CountOccurrences` for 2, 8, 4, 1 and 11.

Hint: copy the structure of `LowerBound`, and change `<` to `<=` in one place.
