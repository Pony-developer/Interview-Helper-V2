## What "thread-safe" means

A type is thread-safe if it behaves correctly when used from several threads at once, without callers adding synchronization. Strategies, from simplest to hardest:

1. **Don't share**: give each thread its own data (locals, per-request objects).
2. **Share only immutable data**: immutable objects (records with `init`, `ImmutableList<T>`, strings) can be read by any number of threads with no locks.
3. **Use thread-safe building blocks**: `ConcurrentDictionary`, `Channel<T>`, `Lazy<T>`, `Interlocked`.
4. **Lock** around every access to mutable shared state.
5. **Lock-free code** with `Interlocked` and memory barriers: fastest, hardest to get right.

## Thread safety in the BCL

- **Static** members of most BCL types are thread-safe; **instance** members generally aren't.
- `List<T>`, `Dictionary<K,V>`: safe for concurrent **reads** only if nobody writes.
- `HttpClient`, `Random.Shared`, `ConcurrentX` collections, `ILogger`: designed for concurrent use.
- Enumerating a collection while another thread modifies it isn't safe, even with locks around each modification. Lock around the whole enumeration or enumerate a snapshot (`ToArray()` under the lock).

Atomicity of individual operations is not enough: `if (!dict.ContainsKey(k)) dict.Add(k, v)` is a **check-then-act race** even with a thread-safe dictionary. Use atomic compound methods: `ConcurrentDictionary.GetOrAdd`, `TryAdd`, `AddOrUpdate`.

## Interlocked: atomic operations

```csharp
Interlocked.Increment(ref _count);
Interlocked.Add(ref _total, amount);
long snapshot = Interlocked.Read(ref _bigCounter);        // atomic 64-bit read on 32-bit platforms
string? old = Interlocked.Exchange(ref _current, "new");

// compare-and-swap loop: the building block of lock-free algorithms
int initial, computed;
do
{
    initial = _max;
    computed = Math.Max(initial, candidate);
} while (Interlocked.CompareExchange(ref _max, computed, initial) != initial);
```

They're implemented with single CPU instructions and include a full memory barrier.

## Memory model, volatile and barriers

Compilers, the JIT and CPUs may **reorder** reads and writes and cache values in registers, as long as a single thread can't tell. Another thread can see surprising results:

```csharp
bool _ready; int _value;

// thread 1
_value = 42;
_ready = true;

// thread 2
if (_ready) Console.WriteLine(_value);   // could theoretically print 0 without a barrier
```

Fixes:

- `volatile bool _ready;` gives the flag acquire/release semantics (reads aren't moved before it, writes aren't moved after), which is enough for simple flags;
- `Volatile.Read` / `Volatile.Write` do the same per access;
- `Interlocked` operations and `lock` imply full barriers;
- `Thread.MemoryBarrier()` is the explicit full fence.

`volatile` does **not** make `count++` atomic; it only orders memory accesses. In practice, use `lock` or higher-level types unless you're writing low-level infrastructure.

## Immutability as a strategy

```csharp
private ImmutableDictionary<string, decimal> _prices = ImmutableDictionary<string, decimal>.Empty;

public decimal? Price(string sku) => _prices.TryGetValue(sku, out var p) ? p : null;   // no lock for readers

public void SetPrice(string sku, decimal price) =>
    ImmutableInterlocked.AddOrUpdate(ref _prices, sku, price, (_, _) => price);   // atomic swap for writers
```

Readers always see a consistent snapshot; writers publish a new version atomically.

## Interview takeaways

- Prefer not sharing, then immutability, then thread-safe types, then locks; lock-free code last.
- Check-then-act sequences need atomic compound operations or a lock.
- `Interlocked` = atomic ops with barriers; `volatile` = ordering, not atomicity.
