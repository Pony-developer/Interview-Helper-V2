Write the search of the extremes that works for **any comparable values**, with the interface `IComparable`, as in the previous task, but now for a whole array.

Write three methods:

- `static IComparable Min(IComparable[] items)`: the smallest element, or `null` if the array is empty;
- `static IComparable Max(IComparable[] items)`: the biggest element, or `null` if the array is empty;
- `static int IndexOfMin(IComparable[] items)`: the index of the smallest element (the **first** one, if there are several equal), or `-1` if the array is empty.

All the elements of an array are of the same type. Do not change `Main`. Expected output:

```text
3
8
1
apple
pear
none
-1
-1.5
2.5
```

The lines in order: the smallest, the biggest and the index of the smallest in `{ 5, 3, 8, 3 }` (the first `3` is at the index 1); the smallest and the biggest of the strings `"pear", "apple", "mango"`; the word `none` if `Min` of an empty array is `null`; `IndexOfMin` of an empty array; and the smallest and the biggest of the `double` values `2.5, -1.5, 0.0`.

Hint: start with the first element as the best so far, and go through the rest. A new element replaces the best when `items[i].CompareTo(best) < 0` (for the minimum). For the **first** of equal elements, use the strict `<`, so an equal element does not replace the one found earlier.
