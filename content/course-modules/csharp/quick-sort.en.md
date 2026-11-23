**Quicksort** is a divide-and-conquer sort that does its work **before** the recursive calls. It chooses a **pivot** element, **partitions** the array so that the smaller elements are on the left of the pivot and the larger ones on the right, and then sorts the two sides recursively. There is no merging: after the partition, the pivot is already in its **final position**.

```text
        [ 8 3 9 1 5 7 2 6 ]        pivot = 6
partition:
        [ 3 1 5 2 ] 6 [ 8 9 7 ]    smaller than 6 | the pivot | larger than 6
sort each side recursively:
        [ 1 2 3 5 ] 6 [ 7 8 9 ]
```

## The partition (Lomuto's scheme)

Take the **last** element as the pivot. Keep a boundary `i`: everything at or before `i` is `<=` the pivot. Scan the array, and move each small element behind the boundary:

```csharp
static int Partition(int[] a, int low, int high)       // the range [low, high], both included
{
    int pivot = a[high];
    int i = low - 1;                                   // the end of the "small" part

    for (int j = low; j < high; j++)
    {
        if (a[j] <= pivot)
        {
            i++;
            Swap(a, i, j);                             // move a[j] into the small part
        }
    }
    Swap(a, i + 1, high);                              // put the pivot right after the small part
    return i + 1;                                      // the final position of the pivot
}
```

A trace on `[8, 3, 9, 1, 5, 7, 2, 6]`, pivot 6:

```text
j=0: 8 > 6    no                   8 3 9 1 5 7 2 | 6
j=1: 3 <= 6   i=0, swap(0,1)       3 8 9 1 5 7 2 | 6
j=2: 9 > 6    no
j=3: 1 <= 6   i=1, swap(1,3)       3 1 9 8 5 7 2 | 6
j=4: 5 <= 6   i=2, swap(2,4)       3 1 5 8 9 7 2 | 6
j=5: 7 > 6    no
j=6: 2 <= 6   i=3, swap(3,6)       3 1 5 2 9 7 8 | 6
finish: swap(4, pivot)             3 1 5 2 6 7 8 9      the pivot is at index 4
```

The partition makes **one pass**: O(n).

## The whole algorithm

```csharp
static void QuickSort(int[] a, int low, int high)
{
    if (low >= high) return;                 // 0 or 1 element
    int p = Partition(a, low, high);
    QuickSort(a, low, p - 1);                // the left side
    QuickSort(a, p + 1, high);               // the right side
}

QuickSort(array, 0, array.Length - 1);
```

## The cost depends on the pivot

If the pivot splits the range into **two halves**, the recursion tree has `log₂ n` levels, and each level does O(n) work in the partitions:

```text
T(n) = 2 · T(n / 2) + O(n)   =>   O(n log n)
```

But if the pivot is always the **smallest or the largest** element, one side is empty, and the other has `n − 1` elements:

```text
T(n) = T(n − 1) + O(n)   =>   O(n²)
```

With the last element as the pivot, that happens on an **already sorted** array, or on a reversed one: the very input that looks harmless. The recursion also goes `n` levels deep, so the stack may overflow.

| Case | Time |
| --- | --- |
| Best and average | **O(n log n)** |
| Worst | **O(n²)** |

## Choosing a good pivot

- **A random element.** Swap a random element into the last position before partitioning. No particular input is bad, and the O(n²) case becomes extremely unlikely.
- **The median of three**: the median of the first, the middle and the last element. It handles sorted input well.
- **The middle element** is a simple choice that handles sorted and reversed data.

```csharp
static readonly Random random = new Random();

int r = random.Next(low, high + 1);
Swap(a, r, high);                  // a random pivot, then the usual partition
```

## Many equal elements

When a lot of elements are equal, the two-sided partition above can degrade. The **three-way partition** (Dutch national flag) splits into `< pivot`, `== pivot`, `> pivot` and recurses only on the first and the last part. Arrays with many duplicates then become fast.

## Properties

- **In place**: it needs no helper array. The extra memory is only the recursion stack: **O(log n)** if you always recurse into the **smaller** side first, and loop on the larger side.
- **Not stable**: the swaps can reorder equal elements.
- **Fast in practice**: the inner loop is simple and reads the memory sequentially, which makes good use of the processor cache. Typically it beats merge sort on arrays.

## Quickselect: the k-th smallest

If you need only the **k-th smallest** element (the median, say), you do not need to sort everything. After a partition, you know the pivot's final position `p`. If `p == k`, you are done. If `k < p`, continue in the **left** side only, otherwise in the **right** side only.

```text
T(n) = T(n / 2) + O(n)   =>   O(n) on average
```

It finds the median of a million numbers in a linear time, with no sorting.

## What the library does

`Array.Sort` and `List<T>.Sort` in .NET use **introsort**: a quicksort, which switches to **heapsort** if the recursion gets too deep (so the worst case is O(n log n)), and to **insertion sort** for small pieces. It is **not stable**. For a stable sort, use LINQ's `OrderBy`.

## The summary

| | Quicksort |
| --- | --- |
| Best / average | O(n log n) |
| Worst | O(n²), for bad pivots (avoid by randomizing) |
| Extra memory | O(log n) stack |
| Stable | no |
| In place | yes |
