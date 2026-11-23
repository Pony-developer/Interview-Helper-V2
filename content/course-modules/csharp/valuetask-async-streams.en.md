## `ValueTask<T>`: when the answer is often ready

Every `async Task<T>` method that completes allocates a `Task<T>` object. Usually this does not matter. But consider a cache that answers from memory 99% of the time:

```csharp
public async ValueTask<User> GetUserAsync(int id)
{
    User user;
    if (cache.TryGetValue(id, out user))
        return user;                       // synchronous result: no allocation
    user = await db.LoadUserAsync(id);     // rare slow path
    cache[id] = user;
    return user;
}
```

`ValueTask<T>` is a struct that holds either the ready result or a real task. On the fast path it allocates nothing.

The price is strict rules. A `ValueTask` must be:

- **awaited only once**;
- not awaited by several consumers at the same time;
- not read with `.Result` before it has completed.

If you need any of that, convert it with `.AsTask()`. The default choice is still `Task<T>`: switch to `ValueTask<T>` only in hot paths where measurements show the allocations matter.

## `IAsyncEnumerable<T>`: a stream of results

`IEnumerable<T>` with `yield return` produces items one by one, but it cannot wait for I/O between them. Since C# 8, an `async` iterator can:

```csharp
public async IAsyncEnumerable<Order> GetAllOrdersAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    int page = 0;
    while (true)
    {
        List<Order> batch = await api.GetPageAsync(page++, ct);   // wait for the next page
        if (batch.Count == 0) yield break;
        foreach (Order order in batch)
            yield return order;                                 // give out items one by one
    }
}
```

It is consumed with `await foreach`:

```csharp
await foreach (Order order in GetAllOrdersAsync().WithCancellation(token))
{
    Console.WriteLine(order.Id);   // the first orders appear before all pages are loaded
}
```

The caller gets the first items as soon as the first page arrives, and memory holds one page at a time, not the whole result. Entity Framework Core (`AsAsyncEnumerable`), `ChannelReader.ReadAllAsync` and ASP.NET Core streaming responses all use this interface.

## `Parallel.ForEachAsync`

To process many items asynchronously with a limit on parallelism (.NET 6):

```csharp
await Parallel.ForEachAsync(urls, new ParallelOptions { MaxDegreeOfParallelism = 4 },
    async (url, ct) => await DownloadAsync(url, ct));
```

It replaces the hand-written `SemaphoreSlim` pattern in the simple cases.

## The rule

Return `Task<T>` by default and `ValueTask<T>` only on measured hot paths; return `IAsyncEnumerable<T>` when results arrive gradually and the caller can start working before all of them are ready.
