## Semaphores: limiting concurrency

A semaphore holds a number of **permits**. `Wait` takes one (blocking if none are left), `Release` returns one. With N permits, at most N threads are inside at once.

```csharp
private static readonly SemaphoreSlim Gate = new(initialCount: 3, maxCount: 3);

public async Task<string> FetchAsync(string url, CancellationToken ct)
{
    await Gate.WaitAsync(ct);          // async-friendly wait
    try
    {
        return await _http.GetStringAsync(url, ct);
    }
    finally
    {
        Gate.Release();                // always release in finally
    }
}
```

| Type | Notes |
| --- | --- |
| `SemaphoreSlim` | lightweight, in-process, supports `WaitAsync`: the default choice |
| `Semaphore` | kernel object; can be **named** to work across processes; no async support |

A semaphore has **no owner**: any thread can release it. A `SemaphoreSlim(1, 1)` is the standard **async lock**, because `lock` can't contain `await`:

```csharp
private readonly SemaphoreSlim _mutex = new(1, 1);
public async Task SaveAsync()
{
    await _mutex.WaitAsync();
    try { await File.WriteAllTextAsync(path, Serialize()); }
    finally { _mutex.Release(); }
}
```

(It isn't reentrant: awaiting it twice from the same flow deadlocks.)

## Reader/writer locks

When data is read far more often than written, an exclusive lock makes readers queue up needlessly. `ReaderWriterLockSlim` allows **many concurrent readers** or **one writer**:

```csharp
private readonly ReaderWriterLockSlim _rw = new();
private readonly Dictionary<string, Product> _catalog = new();

public Product? Find(string sku)
{
    _rw.EnterReadLock();
    try { return _catalog.TryGetValue(sku, out var p) ? p : null; }
    finally { _rw.ExitReadLock(); }
}

public void Upsert(Product p)
{
    _rw.EnterWriteLock();
    try { _catalog[p.Sku] = p; }
    finally { _rw.ExitWriteLock(); }
}
```

- `EnterUpgradeableReadLock` lets one reader later upgrade to a writer without releasing (only one upgradeable reader at a time, to avoid upgrade deadlocks).
- Recursion is off by default (`LockRecursionPolicy.NoRecursion`).
- It's slower than `lock` per operation, so it only wins when reads are long or very frequent and writes rare. Measure. Often an **immutable snapshot** swapped with `Interlocked.Exchange`, or `ConcurrentDictionary`, is simpler and faster.

## Concurrent collections instead of locks

| Need | Type |
| --- | --- |
| thread-safe dictionary | `ConcurrentDictionary<K,V>` (fine-grained locking, lock-free reads) |
| producer/consumer queue | `ConcurrentQueue<T>`, `BlockingCollection<T>`, `Channel<T>` (async) |
| unordered bag per thread | `ConcurrentBag<T>` |
| stack | `ConcurrentStack<T>` |

These are covered in the parallel programming module.

## Interview takeaways

- `SemaphoreSlim` limits concurrency to N and works with `await`; `SemaphoreSlim(1,1)` is the async lock.
- `ReaderWriterLockSlim` = many readers or one writer; worth it only for read-heavy workloads.
- Concurrent collections and immutable snapshots often beat hand-made locking.
