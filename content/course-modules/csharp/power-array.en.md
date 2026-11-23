Two methods, two styles of working with an array.

- `RaiseToPower(numbers, power)` raises **every element to the given power, in place**. It returns nothing: the caller sees the change in its own array. A power of 0 gives 1 for each element.
- `Powers(numbers, power)` returns a **new** array of the powers and leaves the original **unchanged**.

Use multiplication in a loop for the power, because `Math.Pow` returns a `double`. Do not change `Main` and `Show`.

`Main` checks several things: the in-place change, negative numbers and zero, a zero power, an empty array, and that `Powers` does not touch its argument. Expected output:

```text
1 8 27 64
4 9 0 25
1 1

2 3
8 27
```

The empty line is an empty array being shown.

Hint: `Powers` can make a copy of the array (for example, with `Clone`, as in the lecture on the `Array` class) and then call `RaiseToPower` for the copy, so you do not write the same loop twice.
