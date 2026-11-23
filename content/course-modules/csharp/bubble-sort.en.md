**Bubble sort** is the simplest sorting algorithm to understand. It repeatedly walks along the array and compares **neighbours**. If a pair is in the wrong order, it swaps them. The largest element "bubbles up" to the end during every pass.

## An example

Sorting `[5, 1, 4, 2, 8]`. Each pass compares the neighbours from the left, and swaps the pair if the left one is larger:

```text
Pass 1:   5 1 4 2 8   (5,1) swap    ->  1 5 4 2 8
          1 5 4 2 8   (5,4) swap    ->  1 4 5 2 8
          1 4 5 2 8   (5,2) swap    ->  1 4 2 5 8
          1 4 2 5 8   (5,8) no
          the largest, 8, is at the end

Pass 2:   1 4 2 5 | 8 (1,4) no
          1 4 2 5     (4,2) swap    ->  1 2 4 5
          1 2 4 5     (4,5) no
          the second largest, 5, is in place

Pass 3:   1 2 4 | 5 8 no swaps: the array is sorted
```

After the pass `p`, the `p` largest elements are in their final places at the end, so each pass can stop one step earlier than the previous one.

## The code

```csharp
static void BubbleSort(int[] a)
{
    for (int pass = 0; pass < a.Length - 1; pass++)
    {
        bool swapped = false;
        for (int i = 0; i < a.Length - 1 - pass; i++)   // the last "pass" elements are already placed
        {
            if (a[i] > a[i + 1])
            {
                int temp = a[i];
                a[i] = a[i + 1];
                a[i + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;       // a full pass with no swaps: sorted already
    }
}
```

The flag `swapped` makes the algorithm stop at once when the array is already sorted.

## The invariant

After `p` passes, the last `p` elements are the `p` largest ones, **in their final positions**. Each pass takes the largest element of the unsorted part, and carries it to the end of that part. After `n − 1` passes, everything is in place.

## Counting the work

**Comparisons.** The first pass makes `n − 1` comparisons, the second `n − 2`, and so on:

```text
(n − 1) + (n − 2) + ... + 1 = n · (n − 1) / 2
```

That is about **n² / 2**: for 1 000 elements, about 500 000; for a million elements, about 5 · 10¹¹.

**Swaps.** A swap removes exactly **one inversion**: a pair of elements that are in the wrong order (a larger element before a smaller one). Since the sorted array has no inversions, the number of swaps is **always equal to the number of inversions** in the input. This holds no matter how the loops are written. For `[5, 1, 4, 2, 8]`, the inversions are `(5,1)`, `(5,4)`, `(5,2)` and `(4,2)`: four, and the trace above has exactly four swaps.

| Input | Inversions (swaps) | Comparisons |
| --- | --- | --- |
| already sorted | 0 | `n − 1` with the flag (one pass), `n(n−1)/2` without it |
| in reverse order | `n(n − 1) / 2`, the maximum | `n(n − 1) / 2` |
| random | about `n(n − 1) / 4` | about `n²/2` |

## The complexity

| Case | Time |
| --- | --- |
| Best (sorted, with the `swapped` flag) | **O(n)** |
| Average | **O(n²)** |
| Worst (reversed) | **O(n²)** |

The memory is **O(1)**: the sort works **in place**.

Bubble sort is **stable**: equal elements are never swapped with each other (the swap needs a **strict** `>`), so their original order is preserved.

## Why it is slow

For every element, bubble sort moves it only **one position at a time**. An element that has to travel from the end to the beginning needs `n − 1` passes to get there (small values move left only one step per pass, which is why they are called "turtles"). Better algorithms move elements over long distances.

For 100 000 elements, bubble sort needs around 5 · 10⁹ comparisons: tens of seconds, when a good sort takes a few milliseconds. For this reason it is used for **teaching**, and almost never in real programs.

## Its simple relatives

**Selection sort** finds the minimum of the unsorted part, and swaps it into place. It makes exactly `n(n−1)/2` comparisons whatever the input is, but only **n − 1 swaps** at most: good when writing is expensive.

```csharp
for (int i = 0; i < a.Length - 1; i++)
{
    int min = i;
    for (int j = i + 1; j < a.Length; j++)
        if (a[j] < a[min]) min = j;
    (a[i], a[min]) = (a[min], a[i]);      // in C# 7 you can swap two variables with a tuple
}
```

**Insertion sort** takes the elements one by one, and **inserts** each into the sorted part on its left, like sorting playing cards in the hand:

```csharp
for (int i = 1; i < a.Length; i++)
{
    int value = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > value)
    {
        a[j + 1] = a[j];       // shift the larger elements to the right
        j--;
    }
    a[j + 1] = value;
}
```

Insertion sort is O(n²) in the worst case, but **O(n) for an almost sorted** array, and it is very fast for small arrays. That is why real libraries use it as the last step on small pieces of larger sorts.

## Summary

| | Bubble | Selection | Insertion |
| --- | --- | --- | --- |
| Best | O(n) | O(n²) | O(n) |
| Average | O(n²) | O(n²) | O(n²) |
| Worst | O(n²) | O(n²) | O(n²) |
| Memory | O(1) | O(1) | O(1) |
| Stable | yes | no (in the simple form) | yes |
| In practice | teaching only | few writes | small or nearly sorted data |

All three are quadratic. The next lectures show how to sort in O(n log n).
