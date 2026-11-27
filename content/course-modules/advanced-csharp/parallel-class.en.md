## Parallel.Invoke

Run several independent actions in parallel and wait for all of them:

```csharp
Parallel.Invoke(
    () => RebuildSearchIndex(),
    () => RecalculateStatistics(),
    () => CompressOldLogs());
```

## Parallel.For and Parallel.ForEach

Parallel versions of loops. The calling thread blocks until every iteration has finished.

```csharp
Parallel.For(0, images.Length, i => images[i] = Sharpen(images[i]));

var options = new ParallelOptions { MaxDegreeOfParallelism = Environment.ProcessorCount, CancellationToken = ct };
Parallel.ForEach(files, options, file => ProcessFile(file));
```

Iterations run in **no particular order**, on pool threads (including the calling thread). The loop body must be thread-safe.

## Thread-local state: the aggregation pattern

Accumulating into one shared variable from every iteration is a race, and locking per iteration kills performance. The overload with **local state** gives each worker its own subtotal and merges them once at the end:

```csharp
long total = 0;
Parallel.For(0, data.Length,
    localInit: () => 0L,                                        // per worker
    body: (i, loopState, subtotal) => subtotal + Score(data[i]),  // no locking here
    localFinally: subtotal => Interlocked.Add(ref total, subtotal));   // once per worker
```

The same pattern exists for `Parallel.ForEach`.

## Leaving a loop early

```csharp
Parallel.ForEach(orders, (order, state) =>
{
    if (order.IsFraudulent) state.Stop();   // stop as soon as possible
    if (state.ShouldExitCurrentIteration) return;
    Check(order);
});
```

| Call | Meaning |
| --- | --- |
| `state.Break()` | finish all iterations with a **lower index** than the current one (like a sequential `break`), skip later ones |
| `state.Stop()` | stop everything as soon as possible |
| `ParallelLoopResult.IsCompleted` / `LowestBreakIteration` | tell the caller what happened |

Cancellation via `ParallelOptions.CancellationToken` throws `OperationCanceledException`.

## Parallel.ForEachAsync (.NET 6)

For **async** work with a concurrency limit, e.g. calling an API for many items:

```csharp
await Parallel.ForEachAsync(customerIds,
    new ParallelOptions { MaxDegreeOfParallelism = 8, CancellationToken = ct },
    async (id, token) =>
    {
        var profile = await _api.GetProfileAsync(id, token);
        await _store.SaveAsync(profile, token);
    });
```

This replaces hand-written `SemaphoreSlim` throttling in many cases.

## Partitioning

For very cheap bodies, the per-iteration overhead dominates. Hand bigger chunks to each worker:

```csharp
Parallel.ForEach(Partitioner.Create(0, data.Length, rangeSize: 10_000), range =>
{
    for (int i = range.Item1; i < range.Item2; i++) data[i] = Math.Sqrt(data[i]);
});
```

## Interview takeaways

- `Parallel.Invoke` for independent actions; `For`/`ForEach` for loops; `ForEachAsync` for throttled async work.
- Use `localInit`/`localFinally` to aggregate without contention.
- `Break` vs `Stop`; partition cheap work into ranges.
