**Linear search** is the simplest search: look at the elements one by one from the start, until you find the value or run out of elements.

```csharp
static int LinearSearch(int[] a, int value)
{
    for (int i = 0; i < a.Length; i++)
    {
        if (a[i] == value)
            return i;          // found: stop at once
    }
    return -1;                 // looked at everything, not found
}
```

It needs **no** preparation: the array can be in any order. That is its strength.

## Counting the work

The "operation" that we count is a **comparison** `a[i] == value`. How many are made for an array of `n` elements?

| Case | When | Comparisons |
| --- | --- | --- |
| **Best** | the value is the first element | **1** |
| **Worst** | the value is the last element, or is **absent** | **n** |
| **Average** | the value is present, at a random position | about **(n + 1) / 2** |

**The average.** If the value is equally likely to be at any of the positions 1 to n, the number of comparisons is 1, 2, ..., n with the same chance, and the mean of these is

```text
(1 + 2 + ... + n) / n = n · (n + 1) / 2 / n = (n + 1) / 2
```

For `n = 1000`, about 500 comparisons. If the value is **absent**, it is always `n`. So the average depends on how often a search succeeds.

## The complexity

Both the worst and the average cases grow **in proportion to n**: the algorithm is **O(n)**, linear. A tenfold larger array needs tenfold more work.

| n | worst case | average (present) |
| --- | --- | --- |
| 10 | 10 | 5.5 |
| 1 000 | 1 000 | 500.5 |
| 1 000 000 | 1 000 000 | 500 000.5 |
| 1 000 000 000 | 1 000 000 000 | about 5 · 10⁸ |

The memory is **O(1)**: a couple of variables.

## An early exit on sorted data

If the data is sorted, an unsuccessful search can stop **earlier**: as soon as you meet an element that is larger than the value, it cannot be further on.

```csharp
for (int i = 0; i < a.Length; i++)
{
    if (a[i] == value) return i;
    if (a[i] > value) return -1;     // sorted: it cannot be after this point
}
return -1;
```

This halves the work for absent values on average, but it is still O(n). Binary search does much better on sorted data.

## The sentinel trick

The loop above makes **two** checks per element: the index and the value. You can remove the index check by placing the value itself at the end of the array (a **sentinel**), so that the search is guaranteed to stop:

```csharp
// the array has one spare cell at the end, a[n] is free
a[n] = value;
int i = 0;
while (a[i] != value) i++;
return i < n ? i : -1;               // reached the sentinel: not found
```

It saves a constant factor, not the O(n) growth. It is a classic example of the difference between **complexity** (the growth) and **the constant** (the speed).

## Searching with a condition

Linear search is not only for equality. You can look for the **first** element that satisfies any rule:

```csharp
// the first negative number
for (int i = 0; i < a.Length; i++)
    if (a[i] < 0) return i;
return -1;
```

For such conditions, binary search does not apply, unless the data has a suitable order. The library offers `Array.IndexOf(a, value)` and `list.IndexOf(value)`, `list.Contains(value)`, which are linear searches. The same idea over strings is `s.IndexOf("text")`.

## Linear search in the worst case, in the real world

Linear search is O(n), but it is **not bad**:

- For **small** arrays (up to a few dozen elements), it is often the fastest: no setup, a simple loop, and the processor reads memory in order.
- For data that is **not sorted** and searched only **once**, it is the best you can do: any smarter method needs the data to be sorted first, and sorting costs O(n log n), which is more than one pass.
- It works on **any** sequence, including a linked list, a file read from start to end, and the result of a calculation.

## When it is a trap

The cost shows when you search **many times**. The following code looks innocent:

```csharp
foreach (int x in queries)             // k queries
    if (Array.IndexOf(data, x) >= 0)   // each is O(n)
        count++;
```

The total is **O(k · n)**. With `k = n = 100 000`, that is 10¹⁰ operations: minutes. The remedies:

- **Sort once** (O(n log n)), then use binary search for each query (O(log n)): in total O((n + k) log n).
- Or put the data into a `HashSet<int>`: each query is O(1) on average, and the total is O(n + k).

The break-even point: sorting pays off when the number of searches is larger than about `log n`. For a million elements, that is only about 20 searches.

## The summary

| | Linear search |
| --- | --- |
| The data must be | in any order |
| Best / average / worst | 1 / about n/2 / n |
| Complexity | O(n) |
| Extra memory | O(1) |
| Good for | small data, unsorted data, one search |
