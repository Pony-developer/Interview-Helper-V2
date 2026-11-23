A set of problems for a seminar or for self-study. They have no automatic checker: solve them on paper or in your own editor, and compare the **idea** and the **complexity** with the hints. Try to solve each one in the time and memory that is given.

The problems are grouped by difficulty. The first ones apply what the module has shown, and the last ones combine several ideas.

## Warm-up

**1. First and last position.** In a sorted array with duplicates, find the first and the last index of a value (or `-1` and `-1`). Required: **O(log n)**.
*Hint:* two binary searches, the lower bound and the upper bound, as in the practice tasks.

**2. Insert position.** Return the index where a value should be inserted into a sorted array to keep it sorted. Required: **O(log n)**.
*Hint:* this is the lower bound. `Array.BinarySearch` gives it as `~result` when the value is absent.

**3. Integer square root.** For a non-negative integer `n`, find the largest `k` with `k * k <= n`, without `Math.Sqrt`. Required: **O(log n)**.
*Hint:* binary search on the answer, in the range `0..n`. Watch for the overflow of `k * k`, and use `long`.

**4. Is the array sorted?** Check in **O(n)** whether an array is sorted in non-decreasing order. Then do it for a **descending** one, and for "either".

**5. Count the elements in a range.** For a sorted array and the numbers `low` and `high`, count the elements with `low <= x <= high`. Required: **O(log n)** per query.
*Hint:* `UpperBound(high) − LowerBound(low)`.

## Medium

**6. A rotated sorted array.** A sorted array was rotated, for example `[6, 7, 8, 1, 2, 3, 4, 5]`. Find a value in **O(log n)**.
*Hint:* at every step, at least one of the two halves is **sorted**. Check whether the value lies in it, and discard the other half.

**7. A peak.** In an array where neighbours are never equal, find **any** index `i` with `a[i] > a[i − 1]` and `a[i] > a[i + 1]` (the borders count as minus infinity). Required: **O(log n)**.
*Hint:* look at the middle element and its right neighbour. If the array is rising, a peak is on the right. Otherwise, there is a peak on the left, or here.

**8. Two sum.** For an array and a number `target`, find two **different** positions whose values add up to `target`. First, solve it in **O(n log n)** with sorting and two pointers, one at each end, moving inward. Then in **O(n)** with a `HashSet` or a `Dictionary`.
*Think:* what does each solution cost in memory? What changes if the array is already sorted?

**9. Sorted squares.** For a sorted array that may contain negative numbers, return the **squares**, sorted, in **O(n)**.
*Hint:* the largest squares are at the two ends. Use two pointers, and fill the result from the end.

**10. Merge `k` sorted arrays.** Merge `k` arrays of total length `n` into one. First in **O(n · k)** by repeated merging of two. Then think about **O(n log k)**, using a heap, or merging in pairs, like merge sort.

**11. The k-th largest.** Find the `k`-th largest element of an unsorted array. First by sorting: **O(n log n)**. Then with a heap of size `k`: **O(n log k)**. Finally, with quickselect: **O(n)** on average.

## Harder

**12. Count inversions.** Count the pairs `i < j` with `a[i] > a[j]` in **O(n log n)**.
*Hint:* modify merge sort. Count the pairs when merging.

**13. The median of two sorted arrays.** Find the median of two sorted arrays of sizes `m` and `n` in **O(log(m + n))**.
*Hint:* binary search for how many elements to take from the first array, so that the left parts of both arrays together make half of all the elements.

**14. Sort by frequency.** Sort the numbers so that the most frequent come first, and the numbers with the same frequency are in increasing order. First count with a `Dictionary`, then sort the pairs.

**15. Minimum number of swaps.** What is the least number of swaps of two arbitrary elements that sorts an array of distinct numbers? *Hint:* think of the permutation as a set of **cycles**. A cycle of length `c` needs `c − 1` swaps.

## Questions for discussion

- Why is the sentinel trick a gain of a constant factor, and not of a complexity class?
- Which sorting algorithm would you choose for 50 elements, a million records with a date, and a stream of data that does not fit in memory? Why?
- When would you keep an array sorted at all times, and when would you sort on demand?
- Can binary search work on a `LinkedList<T>`? What does it cost?
- How can you find the first position where a **sorted** array of booleans (`false false false true true`) becomes `true`? Where in real life do you meet such a monotone question?

## How to work on them

1. **Restate** the problem in your own words, and write two or three examples, including an empty array and an array of one element.
2. Start with a **simple, correct** solution, and find its complexity.
3. Look for **what is wasted**: a repeated search, a repeated sort, an unused order.
4. Write the improved version, and **trace** it on your examples by hand.
5. Check the **borders**: the empty input, one element, all equal, the smallest and largest values.
6. State the final time and memory complexity.
