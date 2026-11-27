## Running things concurrently

```csharp
// sequential: total time = sum
var user = await GetUserAsync(id);
var orders = await GetOrdersAsync(id);

// concurrent: start both, then await; total time = max
Task<User> userTask = GetUserAsync(id);
Task<List<Order>> ordersTask = GetOrdersAsync(id);
await Task.WhenAll(userTask, ordersTask);
var (user2, orders2) = (userTask.Result, ordersTask.Result);   // safe: both are complete
```

A task starts when the async method is **called**, not when it's awaited. So "start several, await later" gives concurrency without any extra threads.

Careful with EF Core: one `DbContext` doesn't support concurrent operations; use separate contexts.

## WhenAll and WhenAny

- `Task.WhenAll(tasks)` completes when every task has; if some failed, it faults with **all** their exceptions (`await` throws the first; check `task.Exception.InnerExceptions` for the rest).
- `Task.WhenAny(tasks)` completes when the **first** task completes (successfully or not) and returns that task. Typical uses: timeouts, "first responder wins", processing results as they finish:

```csharp
var pending = urls.Select(u => client.GetStringAsync(u)).ToList();
while (pending.Count > 0)
{
    Task<string> done = await Task.WhenAny(pending);
    pending.Remove(done);
    Console.WriteLine((await done).Length);      // await to observe success or exception
}
```

## ValueTask<T>

`Task<T>` is a class: every async method that returns one allocates. `ValueTask<T>` is a struct that wraps either a direct result or a task, so a method that **often completes synchronously** (a cache hit, data already buffered) avoids the allocation:

```csharp
public ValueTask<Product> GetAsync(int id) =>
    _cache.TryGetValue(id, out var p) ? new ValueTask<Product>(p) : new ValueTask<Product>(LoadAsync(id));
```

Rules: await a `ValueTask` **once**; don't await it concurrently; don't call `.Result` before it completes. If you need more, call `.AsTask()`. Use `Task` by default and `ValueTask` for measured hot paths.

## Async streams (C# 8)

```csharp
public async IAsyncEnumerable<Order> StreamOrdersAsync([EnumeratorCancellation] CancellationToken ct = default)
{
    int page = 0;
    while (true)
    {
        var batch = await _api.GetPageAsync(page++, ct);
        if (batch.Count == 0) yield break;
        foreach (var o in batch) yield return o;
    }
}

await foreach (var order in StreamOrdersAsync().WithCancellation(ct))
    Process(order);
```

They combine iterators and async: each item may require awaiting. EF Core's `AsAsyncEnumerable()`, gRPC streaming and `Channel<T>.Reader.ReadAllAsync()` produce them.

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| `.Result` / `.Wait()` on async code | `await`; async all the way |
| `async void` methods (except event handlers) | return `Task` |
| Forgetting to `await` (fire-and-forget by accident) | await it, or deliberately run it with error logging |
| `Task.Run` around async I/O in server code | call the async API directly |
| Not passing the `CancellationToken` down | pass it to every call |
| `list.ForEach(async x => ...)` | `foreach` with `await`, or `Task.WhenAll` |
| Unbounded `Task.WhenAll` over thousands of items | throttle with `SemaphoreSlim` or `Parallel.ForEachAsync` (.NET 6) |
| Thread-affine code after `await` (thread-local data, `Monitor` locks held across await) | don't hold locks across `await`; use `SemaphoreSlim.WaitAsync` |

## Interview takeaways

- Start tasks first, await later, to run them concurrently; `WhenAll` gathers results and errors.
- `ValueTask<T>` saves allocations on synchronous fast paths; await it once.
- `IAsyncEnumerable<T>` + `await foreach` stream items asynchronously.
