## The concurrent collections

`System.Collections.Concurrent` provides collections that many threads can use at once without external locks:

| Type | Like | Notes |
| --- | --- | --- |
| `ConcurrentDictionary<K,V>` | `Dictionary` | fine-grained locks for writes, lock-free reads |
| `ConcurrentQueue<T>` | `Queue` | lock-free FIFO |
| `ConcurrentStack<T>` | `Stack` | lock-free LIFO |
| `ConcurrentBag<T>` | an unordered collection | each thread has its own local list; fastest when the same thread adds and takes |
| `BlockingCollection<T>` | a wrapper | adds blocking and bounding on top of the above |

They're **not** a drop-in speedup: a plain `Dictionary` under a `lock` can be faster with low contention. Use them when many threads really share the collection.

## ConcurrentDictionary: think in atomic operations

```csharp
var hits = new ConcurrentDictionary<string, int>();
hits.AddOrUpdate(url, 1, (_, count) => count + 1);           // atomic increment-or-insert
Product p = cache.GetOrAdd(sku, key => LoadProduct(key));     // get, or create and store
bool added = sessions.TryAdd(id, session);
bool removed = sessions.TryRemove(id, out var old);
bool swapped = prices.TryUpdate(sku, newPrice, comparisonValue: oldPrice);   // compare-and-swap
```

- Don't write `if (!d.ContainsKey(k)) d[k] = v;`: another thread can insert between the check and the write.
- The factories passed to `GetOrAdd`/`AddOrUpdate` run **outside** the internal lock and may run **more than once** under contention (only one result is stored). If creation is expensive or has side effects, store a `Lazy<T>`: `GetOrAdd(key, k => new Lazy<Product>(() => Load(k))).Value`.
- Enumerating gives a moment-in-time-ish view; it doesn't throw if the dictionary changes concurrently.

## BlockingCollection: producer/consumer

```csharp
using var queue = new BlockingCollection<Job>(boundedCapacity: 100);

var consumers = Enumerable.Range(0, 4).Select(_ => Task.Run(() =>
{
    foreach (Job job in queue.GetConsumingEnumerable())   // blocks when empty, ends after CompleteAdding
        Process(job);
})).ToArray();

foreach (var job in LoadJobs()) queue.Add(job);           // blocks when 100 items are waiting (back-pressure)
queue.CompleteAdding();
Task.WaitAll(consumers);
```

`BlockingCollection` blocks **threads**, which is fine for dedicated worker threads but wasteful in async code.

## Channels: the async producer/consumer

```csharp
var channel = Channel.CreateBounded<Job>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait,
    SingleReader = false,
});

var consumer = Task.Run(async () =>
{
    await foreach (Job job in channel.Reader.ReadAllAsync(ct))
        await ProcessAsync(job, ct);
});

foreach (var job in jobs) await channel.Writer.WriteAsync(job, ct);   // awaits when full: no blocked thread
channel.Writer.Complete();
await consumer;
```

`System.Threading.Channels` is the modern choice for pipelines and background queues in ASP.NET Core (e.g. a hosted service draining a channel).

## Interview takeaways

- Use atomic methods (`GetOrAdd`, `AddOrUpdate`, `TryUpdate`) on `ConcurrentDictionary`; factories may run more than once.
- `BlockingCollection<T>` = bounded blocking producer/consumer for threads.
- `Channel<T>` = the async equivalent; prefer it in async and server code.
