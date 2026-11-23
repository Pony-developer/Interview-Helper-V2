The lecture on divide and conquer introduced merge sort. Here we look at it as a **sorting algorithm**: how the merge works, why it is **stable**, what it costs, and where it is the best choice.

## The merge step

Two **sorted** arrays can be merged into one sorted array in a single pass. Keep a pointer in each array, always take the **smaller** of the two front elements, and move that pointer:

```text
left:  [1  4  9]            right: [2  3  10]
        ^                            ^

take 1 (1 <= 2)    result: 1                 left pointer -> 4
take 2             result: 1 2               right pointer -> 3
take 3             result: 1 2 3             right pointer -> 10
take 4             result: 1 2 3 4           left pointer -> 9
take 9             result: 1 2 3 4 9         left is exhausted
copy the rest of right: 10      result: 1 2 3 4 9 10
```

Each element is taken exactly once, so merging arrays of sizes `a` and `b` costs **O(a + b)**.

```csharp
static int[] Merge(int[] left, int[] right)
{
    int[] result = new int[left.Length + right.Length];
    int i = 0, j = 0, k = 0;

    while (i < left.Length && j < right.Length)
    {
        if (left[i] <= right[j])          // "<=": on a tie, take from the LEFT
            result[k++] = left[i++];
        else
            result[k++] = right[j++];
    }
    while (i < left.Length) result[k++] = left[i++];   // what is left of one of them
    while (j < right.Length) result[k++] = right[j++];
    return result;
}
```

## The whole algorithm

```text
MergeSort(array):
    if the array has 0 or 1 element: it is sorted
    split it into two halves
    sort each half with MergeSort
    merge the two sorted halves
```

A version that works with **indexes** in one shared array, so that it does not allocate new small arrays on every level:

```csharp
static void MergeSort(int[] a)
{
    int[] temp = new int[a.Length];       // one helper array, allocated once
    Sort(a, temp, 0, a.Length);
}

static void Sort(int[] a, int[] temp, int from, int to)    // the range [from, to)
{
    if (to - from < 2) return;

    int middle = from + (to - from) / 2;
    Sort(a, temp, from, middle);
    Sort(a, temp, middle, to);

    int i = from, j = middle, k = from;                    // merge into temp, then copy back
    while (i < middle && j < to)
        temp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
    while (i < middle) temp[k++] = a[i++];
    while (j < to) temp[k++] = a[j++];
    for (k = from; k < to; k++) a[k] = temp[k];
}
```

## The cost

The recursion tree has `log₂ n` levels. On every level, the merges together touch **all `n` elements** once. So:

```text
T(n) = 2 · T(n / 2) + O(n)   =>   O(n log n)
```

Unlike quicksort and bubble sort, it makes **no difference what the data looks like**: the best, average and worst cases are all **O(n log n)**. For a million elements, about 2 · 10⁷ steps.

The price is **memory**: the helper array of size `n`, so **O(n)** extra. The depth of the recursion is `log₂ n`, so the stack is no problem.

## Stability

A sort is **stable** if elements with equal keys stay in the order they had in the input. This matters when you sort by one field after another:

```text
Sort first by name, then by grade (stable):

  (Ann, 5)  (Bo, 4)  (Cy, 5)  (Di, 4)       sorted by name already
  after a stable sort by grade:
  (Bo, 4)  (Di, 4)  (Ann, 5)  (Cy, 5)       equal grades keep the name order
```

Merge sort is stable because of the `<=` in the merge: on a tie, the element from the **left** half, which was earlier in the input, goes first. With `<`, it would stop being stable.

## Variants

**Bottom-up merge sort** needs no recursion. First merge every pair of neighbours (blocks of 1), then blocks of 2, 4, 8, ..., until one block covers the whole array. It does the same merges, in a loop.

**Natural merge sort** starts from the already sorted **runs** that the data contains. For data that is nearly sorted, it is much faster. This idea is the core of **Timsort**, the standard sort of Python and Java for objects.

## Counting inversions: a bonus

An **inversion** is a pair in the wrong order. Counting them by checking all the pairs takes O(n²). Merge sort counts them for free: when the merge takes an element from the **right** half while the left half still has `m` elements, that element is smaller than all those `m` elements, so it makes `m` inversions. Add them up, and you get the total in **O(n log n)**.

## Where it shines

- **Linked lists**: merging needs no random access, and no extra memory when relinking the nodes.
- **Huge data on disk** (**external sorting**): sort pieces that fit in memory, and merge them as streams.
- When you need **stability** and a **guaranteed O(n log n)**.
- **Parallel** sorting: the two halves are independent.

Its weak points: it needs **O(n)** extra memory, and for small arrays, the constant factors and the allocations make it slower than a good in-place sort.

## The summary

| | Merge sort |
| --- | --- |
| Best / average / worst | O(n log n) in all cases |
| Extra memory | O(n) |
| Stable | yes |
| In place | no |
| Recursion depth | log₂ n |
