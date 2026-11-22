Two correct programs can differ enormously in speed. To compare algorithms without a stopwatch, count how the amount of work grows with the size of the input, `n`.

## Big O

Big O describes that growth, ignoring constant factors:

| Complexity | Name | Example | n = 1 000 |
| --- | --- | --- | --- |
| O(1) | constant | read `array[i]`, look up a dictionary key | 1 step |
| O(log n) | logarithmic | binary search in a sorted array | ~10 steps |
| O(n) | linear | find the maximum, sum an array | 1 000 steps |
| O(n log n) | linearithmic | a good sort, such as `Array.Sort` | ~10 000 steps |
| O(n²) | quadratic | compare every pair of elements | 1 000 000 steps |

## Counting loops

```csharp
for (var i = 0; i < n; i++)          // n passes
    for (var j = 0; j < n; j++)      // × n passes each
        if (a[i] + a[j] == target) count++;   // O(n²)
```

A loop inside a loop over the same data multiplies; loops one after another add, and the larger term wins: O(n) + O(n²) is O(n²).

## Halving

Binary search looks at the middle of a sorted range and throws away the half that cannot contain the value. A range of 1 000 000 elements shrinks to one element in about 20 steps, because 2²⁰ ≈ 1 000 000. That is O(log n).

## Hidden costs

Some innocent-looking calls are loops inside: `list.Contains(x)` and `list.IndexOf(x)` are O(n), and so is `list.Insert(0, x)`. Calling them inside a loop makes the whole thing O(n²). A `Dictionary` or `HashSet` answers "is it there?" in O(1) on average.
