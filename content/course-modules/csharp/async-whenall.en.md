The method `SquareLaterAsync(int x)` is ready: it waits a moment, returns `x * x`, and throws an `ArgumentException` for a negative number. Write three methods:

- `SquareAllAsync(int[] inputs)`: starts `SquareLaterAsync` for every input **at once**, waits for all of them with `Task.WhenAll`, and returns the squares in the order of the inputs;
- `SafeSquareAsync(int x)`: awaits `SquareLaterAsync(x)`, and returns `0` if it throws an `ArgumentException`;
- `SafeSumAsync(int[] inputs)`: starts `SafeSquareAsync` for every input at once, waits with `Task.WhenAll`, and returns the sum of the results.

Do not change `Main`. Expected output:

```text
9 1 16
13
```

The lines in order: the squares of `3, 1, 4`, in the input order even though the tasks finish in a different order; and the safe sum of `2, -1, 3`, which is `4 + 0 + 9`, because the negative input counts as `0`.

Hint: `inputs.Select(SafeSquareAsync).ToArray()` makes an array of tasks. Start them all before awaiting any of them, so that they run together.
