There is no single "best" sorting algorithm. Each has a price in time, memory and behaviour, and a good programmer knows what to choose, and when to simply call the library.

## The table

| Algorithm | Best | Average | Worst | Extra memory | Stable |
| --- | --- | --- | --- | --- | --- |
| **Bubble** | O(n) | O(n²) | O(n²) | O(1) | yes |
| **Selection** | O(n²) | O(n²) | O(n²) | O(1) | no |
| **Insertion** | O(n) | O(n²) | O(n²) | O(1) | yes |
| **Merge** | O(n log n) | O(n log n) | O(n log n) | O(n) | yes |
| **Quick** | O(n log n) | O(n log n) | O(n²) | O(log n) | no |
| **Heap** | O(n log n) | O(n log n) | O(n log n) | O(1) | no |
| **Counting** | O(n + k) | O(n + k) | O(n + k) | O(n + k) | yes |
| **Radix** | O(d · (n + k)) | O(d · (n + k)) | O(d · (n + k)) | O(n + k) | yes |

(`k` is the range of the values, and `d` is the number of digits.)

## What the columns mean

**In place.** An algorithm that needs only O(1) or O(log n) extra memory sorts **in place**. Merge sort needs a helper array of size `n`. When memory is tight, this matters.

**Stable.** A stable sort keeps equal elements in their original order. It matters when records are sorted by several fields in turn, or when the elements are objects that differ in other fields, and you sort by one key:

```text
by grade (stable):   (Ann,5) (Bo,4) (Cy,5) (Di,4)   ->   (Bo,4) (Di,4) (Ann,5) (Cy,5)
by grade (unstable): the result may be   (Di,4) (Bo,4) (Cy,5) (Ann,5)
```

For plain numbers, stability does not matter: equal numbers are indistinguishable.

**Adaptive.** An algorithm that is faster on data that is **already nearly sorted**. Insertion sort and bubble sort (with a flag) are O(n) on sorted data. Quicksort with a naive pivot is the opposite: it is **slowest** on sorted data.

## A lower bound for comparison sorting

Every algorithm that learns about the data **only by comparing pairs** needs at least about **n log n** comparisons in the worst case. The argument is short: there are `n!` possible orders of the input. Each comparison has two outcomes, so after `c` comparisons, the algorithm can tell apart at most `2ᶜ` cases, and it must tell all `n!` apart:

```text
2ᶜ ≥ n!   =>   c ≥ log₂ (n!) ≈ n · log₂ n − 1.44 · n
```

So merge sort, heap sort and the average case of quicksort are **optimal** among comparison sorts. To do better, an algorithm must use more than comparisons, as counting sort and radix sort do.

## Sorting without comparing

**Counting sort** works for integers in a small range `0..k`. Count how many times each value occurs, and then write the values out in order:

```csharp
static int[] CountingSort(int[] a, int max)        // the values are between 0 and max
{
    int[] counts = new int[max + 1];
    foreach (int x in a) counts[x]++;

    int[] result = new int[a.Length];
    int k = 0;
    for (int value = 0; value <= max; value++)
        for (int c = 0; c < counts[value]; c++)
            result[k++] = value;
    return result;
}
```

The time is **O(n + k)**, linear when `k` is not too big. Sorting a million exam marks between 0 and 100 takes a million steps, with no `n log n`. It is useless when the values are spread over a huge range (such as arbitrary 32-bit numbers).

**Radix sort** sorts numbers digit by digit, from the least significant, using a stable counting sort at each digit.

## What .NET gives you

| Call | Algorithm | Stable? |
| --- | --- | --- |
| `Array.Sort(a)` / `list.Sort()` | introsort: quicksort + heapsort + insertion sort | **no** |
| `a.OrderBy(x => x.Key)` (LINQ) | a stable quicksort variant | **yes** |

```csharp
int[] a = { 5, 2, 9, 1 };
Array.Sort(a);                                  // 1 2 5 9
Array.Sort(a, (x, y) => y.CompareTo(x));        // descending: a comparison as a lambda
Array.Sort(words, StringComparer.Ordinal);      // strings in an exact, culture-independent order
```

A **comparison** is a method that takes two elements and returns a negative number if the first should go first, zero if they are equal, and a positive number otherwise. By passing your own, you can sort **by any rule** (by length, by a field of an object, in descending order).

```csharp
Array.Sort(words, (x, y) => x.Length.CompareTo(y.Length));          // by length
```

Mind the culture: the default string comparison follows the language rules, so for a predictable result, name the comparer explicitly.

## Choosing

| Situation | A good choice |
| --- | --- |
| Ordinary data in memory | the library: `Array.Sort` |
| You need stability | `OrderBy`, or merge sort |
| Memory is very limited | heap sort or quicksort |
| Very small or nearly sorted arrays | insertion sort |
| Integers in a small range | counting sort |
| Data too big for memory | external merge sort |
| Linked lists | merge sort |
| You need only the smallest `k` items | a heap, or quickselect: no full sort |
| Data arrives one item at a time | insert into a sorted structure (a `SortedSet<T>` or a heap) |

## Do you need to sort at all?

Sorting is O(n log n), so before you write it, check whether something cheaper works:

- the **minimum** or **maximum**: one pass, O(n);
- the **k-th** element or the **median**: quickselect, O(n);
- the **top k**: a heap of size `k`, O(n log k);
- **membership** tests: a `HashSet`;
- the data is **already sorted**, or nearly so: do not sort it again.

## Real-world advice

1. Do not write your own sort for production code. Use the library.
2. Know whether the sort you call is stable, and do not rely on it if it is not.
3. Always pass an explicit comparer for strings when the order matters.
4. Sort **once**, then search many times with binary search.
5. Measure, if the speed matters.
