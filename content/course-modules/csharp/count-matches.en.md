Counting is the simplest thing you do with an array: go through it and increase a counter every time an element fits.

Implement three methods:

- `CountNegative(numbers)` returns how many elements are less than zero.
- `CountValue(numbers, value)` returns how many elements are equal to `value`.
- `CountInRange(numbers, low, high)` returns how many elements are between `low` and `high`, **both ends included**.

For an empty array all three return `0`.

With the array `{ 5, -3, 8, 5, 0, -1, 5, 12 }`, which `Main` uses, the answers are:

- two negative numbers (`-3` and `-1`);
- the value `5` occurs three times, and `7` does not occur;
- the range from 0 to 8 holds `5, 8, 5, 0, 5`, which is five numbers.

Do not change `Main`. Expected output:

```text
2
3
0
5
0
```

Hint: one `for` or `foreach` loop and one `int` counter in each method. The condition for the range is `numbers[i] >= low && numbers[i] <= high`.
