Binary search has a natural recursive form: search the middle, and then search the **left** or the **right** half, with the same method. The recursion is only `log₂ n` levels deep, so it is safe even for a million elements.

Implement `Search(sorted, value)`. It returns the index of `value` in the sorted array `sorted`, or `-1` if it is not there. The values in the array are all **different**. Write a **recursive** helper with the range `left` and `right` as extra parameters, and call it from `Search` with the whole array.

The base case is an **empty range** (`left > right`): the value is not there.

`Main` checks a small array, an empty array, and an array of **a million** elements: the even numbers `0, 2, 4, ..., 1 999 998`. A recursion that makes one call per element would overflow the stack there, so the halving is essential. Do not change `Main`. Expected output:

```text
7 -> 3
1 -> 0
13 -> 6
4 -> -1
20 -> -1
0 -> -1
-1
999999
-1
0
```

The first six lines are searches in `{ 1, 3, 5, 7, 9, 11, 13 }`. The line `-1` is the search in an empty array. The last three are searches for `1 999 998`, `1 999 999` and `0` in the big array: the last element, an odd number that is not there, and the first element.

Hint: `middle = left + (right − left) / 2`. If the middle element is smaller than the value, search `middle + 1 .. right`. If it is larger, search `left .. middle − 1`.
