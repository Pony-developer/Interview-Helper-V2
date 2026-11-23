When a sorted array has **repeated** values, an ordinary binary search returns some position of the value, but often you need a specific one. The **left bound** (also called the **lower bound**) is the most useful variant.

Implement `LowerBound(sorted, x)`. It returns the **smallest index `i`** such that `sorted[i] >= x`. If every element is smaller than `x`, it returns `sorted.Length`: the position just after the end, which is where `x` would be inserted.

It is the position where `x` **first appears**, if `x` is present, and the position where `x` **would be inserted** to keep the array sorted, if it is not.

For the array `{ 1, 2, 2, 2, 5, 8, 8, 10 }`:

| x | `LowerBound` | Why |
| --- | --- | --- |
| 0 | 0 | everything is `>= 0`: the start |
| 2 | 1 | the first 2 is at index 1 |
| 3 | 4 | the first element `>= 3` is 5, at index 4 |
| 8 | 5 | the first 8 is at index 5 |
| 11 | 8 | all are smaller: the end |

The search must be a **binary** one: O(log n). Here is a form that is hard to get wrong, with a **half-open** range `[lo, hi)`:

```csharp
int lo = 0, hi = sorted.Length;            // the answer is somewhere in lo..hi
while (lo < hi)
{
    int mid = lo + (hi - lo) / 2;
    if (sorted[mid] < x) lo = mid + 1;     // too small: the answer is to the right
    else hi = mid;                         // mid may be the answer: keep it
}
return lo;
```

Do not change `Main`. Expected output:

```text
0 -> 0
1 -> 0
2 -> 1
3 -> 4
5 -> 4
8 -> 5
9 -> 7
10 -> 7
11 -> 8
0
```

The last line is `LowerBound` for an empty array: the answer is 0.

Hint: the invariant is "everything before `lo` is smaller than `x`, and everything from `hi` on is not smaller than `x`". When `lo == hi`, the boundary is found.
