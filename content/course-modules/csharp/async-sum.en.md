The method `DoubleLaterAsync(int x)` is ready: it waits 10 milliseconds and returns `2 * x`. Write `SumOfDoublesAsync(int[] xs)`, an `async` method that awaits `DoubleLaterAsync` for each item **one after another**, and returns the sum of the results.

Do not change `Main`. Expected output:

```text
12
10
```

The lines in order: the sum of the doubles of `1, 2, 3`, which is `2 + 4 + 6`; and the double of `5`, which is `10`, produced by the ready method.

Hint: a `foreach` loop with `sum += await DoubleLaterAsync(x);` is enough. The method must be declared `static async Task<int>`, and the `await` works only inside an `async` method.
