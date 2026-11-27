## Task

Build two task combinators on top of `Task.WhenAny`.

1. **`WithTimeout<T>(task, ms)`**: race the task against `Task.Delay(ms)`. If the delay wins, throw `TimeoutException("Timed out after <ms> ms")`; otherwise return `await task` (awaiting it also rethrows its exception if it failed).
2. **`FirstSuccessful<T>(params Func<Task<T>>[] sources)`**: start **all** sources at once, then repeatedly `await Task.WhenAny(pending)`:
   - if the finished task succeeded (`Status == TaskStatus.RanToCompletion`), return its result;
   - if it failed, remember its exception (`task.Exception.InnerException`), remove it from the pending list and keep waiting;
   - if every task failed, throw an `AggregateException` with all the remembered exceptions.

In the example, mirror 1 fails first (10 ms), mirror 3 succeeds at 60 ms, before mirror 2 (200 ms).

Expected output:

```
fast
Timed out after 50 ms
mirror 3
all failed: 2
```
