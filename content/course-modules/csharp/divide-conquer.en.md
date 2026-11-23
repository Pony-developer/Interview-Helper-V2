**Divide and conquer** is the most important use of recursion for efficiency. Instead of attacking a big problem directly, you:

1. **Divide** it into smaller sub-problems of the same kind (usually two halves).
2. **Conquer**: solve each sub-problem recursively. Tiny ones are the base case.
3. **Combine** the answers of the parts into the answer of the whole.

## An example: the maximum

```csharp
static int Max(int[] a, int left, int right)
{
    if (left == right) return a[left];               // one element: the base case

    int middle = left + (right - left) / 2;
    int leftMax = Max(a, left, middle);              // conquer the left half
    int rightMax = Max(a, middle + 1, right);        // conquer the right half
    return Math.Max(leftMax, rightMax);              // combine
}
```

A loop is simpler here, and it is the same O(n). The example shows the **pattern**; the real power appears when the combining step is clever.

## Merge sort

Sort an array: split it in halves, sort each half, and **merge** the two sorted halves into one sorted array. The merge is a single pass that repeatedly takes the smaller of the two front elements:

```csharp
static int[] MergeSort(int[] a)
{
    if (a.Length <= 1) return a;                      // base case

    int middle = a.Length / 2;
    int[] left = new int[middle];
    int[] right = new int[a.Length - middle];
    Array.Copy(a, 0, left, 0, middle);
    Array.Copy(a, middle, right, 0, a.Length - middle);

    return Merge(MergeSort(left), MergeSort(right));  // divide, conquer, combine
}

static int[] Merge(int[] left, int[] right)
{
    int[] result = new int[left.Length + right.Length];
    int i = 0, j = 0, k = 0;
    while (i < left.Length && j < right.Length)
    {
        result[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    }
    while (i < left.Length) result[k++] = left[i++];
    while (j < right.Length) result[k++] = right[j++];
    return result;
}
```

The tree for 8 elements:

```text
[5 2 8 1 9 3 7 4]                 level 0: 1 array of 8
[5 2 8 1]   [9 3 7 4]             level 1: 2 arrays of 4
[5 2] [8 1] [9 3] [7 4]           level 2: 4 arrays of 2
[5][2][8][1][9][3][7][4]          level 3: 8 arrays of 1 (the leaves)
```

On the way back, the pieces are merged level by level. Each level processes **all `n` elements** once (the merges), and there are **log₂ n** levels. So the time is **O(n log n)**. That is much better than the O(n²) of the simple sorts, and the same as `Array.Sort`.

## Counting the work: the recurrence

If `T(n)` is the time for an input of size `n`, merge sort satisfies

```text
T(n) = 2 · T(n / 2) + O(n)
        └ two halves ┘   └ the merge
```

The three typical shapes:

| Recurrence | Meaning | Time |
| --- | --- | --- |
| `T(n) = T(n / 2) + O(1)` | one half, a constant of work (binary search) | O(log n) |
| `T(n) = 2 · T(n / 2) + O(1)` | both halves, a constant of work (the maximum) | O(n) |
| `T(n) = 2 · T(n / 2) + O(n)` | both halves, linear work (merge sort) | O(n log n) |

A way of seeing it: draw the tree, and add up the work **per level**. In merge sort, every level does `n` work, and there are `log₂ n` levels.

## More examples

**Binary search** divides the range, and discards one half: only one sub-problem is solved, so there is no combining.

**Fast power**: `x^p = (x^(p/2))²`, one sub-problem of half the size.

**Quicksort** divides the array around a **pivot**: the smaller values go to the left, the larger to the right, and then each side is sorted recursively. The work is in the **dividing**, and there is nothing to combine. On average it is O(n log n), but a poor choice of pivots on already-sorted data can give O(n²).

**Finding the closest pair of points** and **multiplying large numbers** (Karatsuba) are faster than the obvious method thanks to the same pattern.

## When it works

Divide and conquer is a good fit when:

- the problem **can be split** into independent parts of the same kind;
- the sub-problems are **smaller by a constant factor** (half, third), not by one;
- **combining** the answers is cheap (linear or better).

It is a poor fit when the sub-problems **overlap**, that is, the same ones are solved again and again (as in the Fibonacci tree). That is a case for memoization and dynamic programming.

## Practical notes

- **Small cases**: real libraries stop dividing at a size of about 10 to 20, and finish with a simple method such as insertion sort, because for tiny pieces the recursion overhead is larger than the savings.
- **Memory**: merge sort needs an extra array of size O(n). The recursion depth is only O(log n), so there is no danger for the stack.
- **Parallelism**: the two halves are independent, so they can be solved on different processor cores at the same time.
- **Choosing the middle**: write `left + (right - left) / 2`, not `(left + right) / 2`, which can overflow for large indexes.
