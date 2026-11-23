The merge is the heart of merge sort: it combines two **sorted** arrays into one sorted array in a single pass.

Implement `Merge(left, right)`. It returns a **new** array with all the elements of both arrays, in ascending order. Do **not** sort the result: use the fact that both inputs are already sorted, and make **one pass** with two pointers:

1. Keep an index `i` in `left`, and `j` in `right`.
2. While both have elements left, compare `left[i]` and `right[j]`, take the **smaller** one, and move its pointer. If they are **equal**, take the one from `left` first. This keeps the merge **stable**.
3. Then copy what remains of the array that was not exhausted.

The cost is **O(a + b)**, where `a` and `b` are the lengths of the arrays.

The helper `Show` prints an array on a line. Do not change `Main` and `Show`. Expected output:

```text
1 2 3 4 9 10 11
5
2 2 2
1

```

The cases: two arrays of different lengths that interleave; an empty array and an array of one element; arrays with equal values; an array and an empty array; and two empty arrays, for which the last line is empty.

Hint: the main loop is `while (i < left.Length && j < right.Length)`, followed by two more loops that copy the rest of whichever array has elements left.
