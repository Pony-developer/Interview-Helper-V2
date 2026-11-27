## Task

Calling an API for 10,000 items with `Task.WhenAll(items.Select(CallApiAsync))` fires 10,000 requests at once. Write **`Throttle.ForEachAsync(items, maxParallel, work)`**, which runs `work` for every item with **at most `maxParallel` in flight**, and returns the results **in input order**.

Approach:

1. Create a `SemaphoreSlim(maxParallel)`.
2. For each item, start a helper task that does `await gate.WaitAsync()`, then `await work(item)` inside `try`, and `gate.Release()` in `finally` (so a failing item doesn't leak a slot).
3. Keep the tasks in an array in input order and `return await Task.WhenAll(tasks);`, which returns results in the same order as the tasks, no matter which finished first.

`Main` tracks how many calls run at the same time and checks it never exceeds 3.

Expected output:

```
25,9,64,1,81,4,49
max parallel <= 3: True
ran in parallel: True
empty: 0
```
