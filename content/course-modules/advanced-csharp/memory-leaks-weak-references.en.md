## Leaks in a garbage-collected world

The GC can't collect what's still reachable. A **managed memory leak** is an object you no longer need that something long-lived still references. Memory grows steadily until the process slows down or runs out.

## The usual suspects

**1. Event subscriptions.** The publisher holds a reference to each subscriber through the delegate.

```csharp
public class PriceTicker { public static event EventHandler? Tick; }

public class PriceWidget
{
    public PriceWidget() => PriceTicker.Tick += OnTick;    // static publisher keeps every widget alive
    private void OnTick(object? s, EventArgs e) { }
    // fix: implement IDisposable and unsubscribe: PriceTicker.Tick -= OnTick;
}
```

**2. Static collections and caches that only grow.** A `static Dictionary` used as a cache with no eviction policy. Use `MemoryCache` with size limits and expiration, or a bounded LRU.

**3. Timers.** A `System.Timers.Timer` or `System.Threading.Timer` holds its callback target. An undisposed timer keeps its owner alive (and keeps firing).

**4. Captured variables.** A long-lived lambda (stored in a field or a static) captures a big object or `this`.

**5. Long-lived DI scopes.** Resolving scoped/transient disposable services from the root container in ASP.NET Core keeps them until the app stops.

**6. Unmanaged memory.** Native allocations (`Marshal.AllocHGlobal`, native libraries, undisposed bitmaps) don't show up in managed heap statistics at all.

## Finding leaks

- Watch the trend: `dotnet-counters monitor` (GC heap size, gen-2 count) or app metrics.
- Take two memory dumps a while apart (`dotnet-gcdump collect`, Visual Studio diagnostic tools) and compare object counts: whatever keeps growing is the suspect.
- Follow the **path to the root** in the dump viewer: it shows exactly which static field or event keeps the object alive.

## Weak references

A `WeakReference<T>` references an object **without keeping it alive**. If nothing else references the target, the GC can collect it, and the weak reference then returns nothing.

```csharp
var cacheEntry = new WeakReference<byte[]>(LoadLargeImage());

if (cacheEntry.TryGetTarget(out byte[]? image))
    Show(image);                          // still alive
else
    cacheEntry.SetTarget(image = LoadLargeImage());   // was collected: reload
```

Uses:

- **caches** that should give memory back under pressure (though weak references are cleared on *any* collection, often too eagerly; `MemoryCache` with limits is usually better);
- **weak event patterns**: the publisher holds subscribers weakly, so forgetting to unsubscribe doesn't leak (WPF's `WeakEventManager`);
- **tracking objects without owning them**, e.g. diagnostics that count live instances.

`ConditionalWeakTable<TKey, TValue>` attaches data to an object without keeping the key alive: when the key is collected, the entry disappears. It's how you add "properties" to objects you don't own.

## Interview takeaways

- A managed leak = unwanted objects still reachable: events, static caches, timers, closures.
- Diagnose by comparing heap snapshots and following the path to the root.
- `WeakReference<T>` and `ConditionalWeakTable` reference objects without extending their lifetime.
