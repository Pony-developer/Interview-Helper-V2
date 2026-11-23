Arrays have a fixed size, so every "change" of the length means a **new** array and copying. The method `Array.Copy` does the copying quickly and clearly. Write three methods that **return a new array** and never change the arrays they receive:

- `Concat(a, b)`: an array with all the elements of `a`, followed by all the elements of `b`;
- `Slice(a, start, count)`: a copy of `count` elements of `a`, starting at the index `start`. If fewer than `count` elements remain, copy as many as remain. If `start` is at or after the end, the result is an empty array;
- `Insert(a, index, value)`: an array where `value` is inserted **at the position** `index` (`0 <= index <= a.Length`); the elements from that position on shift one place to the right.

`Show` is ready: it prints an array as `[1,2,3]`. Do not change `Main`. Expected output:

```text
[1,2,3,4,5]
[1,2,3]
[4,5]
[2,3,4]
[4,5]
[]
[1,9,2,3]
[1,2,3,9]
[9,1,2,3]
[1,2,3]
```

The lines in order: `Concat` of `{ 1, 2, 3 }` and `{ 4, 5 }`; `Concat` with an empty second array; `Concat` with an empty first array; `Slice` of `{ 1, 2, 3, 4, 5 }` from the index 1, three elements; `Slice` from the index 3 with a count that is too big; `Slice` from the index 9, beyond the end; `Insert` of 9 at the index 1; `Insert` at the end (the index 3); `Insert` at the beginning (the index 0); and the array `a`, which must be **unchanged** by all this.

Hint: first create the result with the right size (`new int[a.Length + b.Length]`), then copy with `Array.Copy(source, sourceIndex, target, targetIndex, length)`. For `Insert`, copy the part before the index, put the value, and copy the rest after it. In `Slice`, compute the real count first: `Math.Min(count, a.Length - start)`, and use 0 if it would be negative.
