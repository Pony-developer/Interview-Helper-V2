`Median(numbers)` should return the **median** of an array: the middle value of the numbers when they are sorted. For an even count it is the average of the two middle values, so the median of `{ 4, 1, 3, 2 }` is `2.5`. For an empty array, we agree that the result is `0`.

`Main` contains seven tests, and the current implementation fails several of them for **two different reasons**:

1. It gives the wrong answer for some inputs.
2. It has a **side effect**: it changes the array that the caller passed in. A test named `input unchanged` checks for it.

Find the causes and fix `Median`, without changing the tests. Do not forget the empty array, which currently crashes the program.

When everything passes, the output is:

```text
ok: odd length
ok: even length
ok: one element
ok: negative numbers
ok: duplicates
ok: input unchanged
ok: empty array
```

Hint: sort a **copy** (`(int[])numbers.Clone()`, or `Array.Copy`), not the original. For an even count, take the two middle elements: the indexes `n / 2 - 1` and `n / 2`. Divide by `2.0`, so that the fraction is kept.
