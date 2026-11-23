`List<T>` and `Dictionary<TKey, TValue>` are **not thread-safe**. Two threads that add to the same dictionary at once do not just lose an item: they can corrupt its internal arrays, after which reads throw strange exceptions or loop forever. Either protect them with a lock, or use the collections from `System.Collections.Concurrent`.

## `ConcurrentDictionary`

Every single operation is atomic, and reads take no lock at all.

```csharp
var counts = new ConcurrentDictionary<string, int>();

Parallel.ForEach(words, word =>
{
    counts.AddOrUpdate(word, 1, (key, old) => old + 1);   // atomic "add or increase"
});
```

The main methods: `TryAdd`, `TryGetValue`, `TryRemove`, `TryUpdate`, `AddOrUpdate`, `GetOrAdd`.

**The trap of check-then-act.** Two separate calls are not atomic together, even on a concurrent collection:

```csharp
if (!cache.ContainsKey(key))      // another thread may add the key right here
    cache[key] = Load(key);
```

Use one call that does both: `cache.GetOrAdd(key, k => Load(k))`.

**The trap of `GetOrAdd`.** The factory runs **outside** the internal lock. If two threads ask for a missing key at the same moment, `Load` may run **twice** (only one result is stored). When the factory is expensive or must run once, store `Lazy<T>`:

```csharp
var cache = new ConcurrentDictionary<string, Lazy<Report>>();
Report report = cache.GetOrAdd(key, k => new Lazy<Report>(() => Build(k))).Value;
// several Lazy objects may be created, but only the stored one runs Build
```

## Queues, stacks and bags

- `ConcurrentQueue<T>`: `Enqueue`, `TryDequeue`; first in, first out.
- `ConcurrentStack<T>`: `Push`, `TryPop`.
- `ConcurrentBag<T>`: an unordered set of items; fast when the same threads both add and take.

## `BlockingCollection<T>`: producer and consumer

A wrapper over a concurrent queue that makes consumers **wait** for items, and can make producers wait for free space:

```csharp
var queue = new BlockingCollection<Order>(boundedCapacity: 100);

// producer
foreach (var order in incoming) queue.Add(order);   // waits if 100 items are already queued
queue.CompleteAdding();                              // "no more items"

// consumer (several of them can run in parallel)
foreach (var order in queue.GetConsumingEnumerable())   // waits for items, ends after CompleteAdding
    Process(order);
```

It blocks threads while waiting. In async code, use channels instead (a later lecture).

## Immutable collections

`ImmutableList<T>`, `ImmutableDictionary<TKey, TValue>` (in `System.Collections.Immutable`) never change: "adding" returns a new collection that shares most of its memory with the old one. Any number of threads can read them without locks, which suits configuration and snapshots that change rarely.

## The rule

Never share `List` or `Dictionary` between threads without a lock. With concurrent collections, make each logical step **one** call (`AddOrUpdate`, `GetOrAdd`), and remember that a `GetOrAdd` factory can run more than once.
