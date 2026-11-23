How fast is binary search? We count the **comparisons**, as we did for linear search, and use the fact that every step **halves** the range.

## The number of steps

Start with a range of `n` elements. After one step, at most `n / 2` remain. After two, at most `n / 4`, and so on. The search stops at the latest when the range is empty. How many halvings take `n` down to 0? About **log₂ n + 1**.

The worst case is exactly `⌊log₂ n⌋ + 1` comparisons (where `⌊x⌋` rounds down):

| n | worst-case steps |
| --- | --- |
| 1 | 1 |
| 10 | 4 |
| 100 | 7 |
| 1 000 | 10 |
| 1 000 000 | 20 |
| 1 000 000 000 | 30 |
| 4 000 000 000 000 000 000 | 62 |

Remember this table: a **billion** elements are searched in **30** steps. Doubling the data adds only **one** step.

## Why log₂ n

The number of steps `T(n)` satisfies

```text
T(n) = T(n / 2) + 1,       T(1) = 1
```

"The cost for `n` is the cost for half as many, plus one comparison." Unrolling it:

```text
T(n) = T(n/2) + 1 = T(n/4) + 2 = T(n/8) + 3 = ... = T(1) + log₂ n
```

The unrolling stops when `n / 2ᵏ = 1`, that is, after `k = log₂ n` halvings. In the recursion tree, it is a **chain** of `log₂ n` nodes.

## The cases

| Case | Steps |
| --- | --- |
| **Best** | **1**: the value is exactly in the middle |
| **Worst** | about **log₂ n**: the value is at the very end, or is absent |
| **Average** | about **log₂ n − 1**: most elements are found near the bottom of the tree |

Unlike linear search, the three cases are close: the difference between the best and the worst case is a constant. Binary search is **O(log n)** in the worst case and in the average case.

## An example with counted steps

Searching in the array of the numbers 1 to 100, i.e. `n = 100`:

```text
value 50:  middle = index 49 (the value 50)   found in 1 step
value 1:   the ranges 0..99, 0..48, 0..23, 0..10, 0..4, 0..1, 0..0   7 steps
value 101: the ranges shrink until empty                              7 steps
```

At most 7 steps for 100 elements, as the table says. A linear search would need 100 for the worst case.

## The price of the sorted order

Binary search needs sorted data. **Getting** it sorted is not free:

- Sorting costs **O(n log n)** with a good algorithm.
- Keeping an array sorted while adding elements costs O(n) per insertion (to shift the elements).

So binary search wins when the data is **sorted once and searched many times** (a dictionary, a table of prices, an index of a database). The next lecture compares the two approaches in numbers.

## What operations it needs

Binary search reads **the middle element** of any range. That is an O(1) operation for an **array** or a `List<T>`, thanks to random access. For a data structure where reaching the middle takes O(n), such as a linked list, binary search does the right comparisons, but spends O(n) on every step to get there, and loses its advantage altogether.

## Search on real numbers and on answers

When there is no array, but only a "yes/no" question that is monotone, the number of steps depends on the **precision** that you want:

```text
steps ≈ log₂ (the length of the initial interval / the required precision)
```

To find a square root of 2 to within 10⁻⁹, starting from the interval `[1, 2]`: log₂ (1 / 10⁻⁹) ≈ 30 steps. Every step gives one more binary digit of the answer.

The same logic applies to searching for an integer answer in the range up to 10¹⁸: only 60 steps.

## Memory and recursion

The iterative version uses O(1) memory. A recursive version uses O(log n) stack, because the chain is `log₂ n` calls deep: for a billion elements, 30 frames. This is why a recursive binary search has no problem with the stack, in contrast with a recursion that goes `n` levels deep.

## The summary

| | Binary search |
| --- | --- |
| The data must be | **sorted**, with random access |
| Best / average / worst | 1 / about log₂ n − 1 / ⌊log₂ n⌋ + 1 |
| Complexity | **O(log n)** |
| Extra memory | O(1) iterative, O(log n) recursive |
| Good for | many searches over the same sorted data |
