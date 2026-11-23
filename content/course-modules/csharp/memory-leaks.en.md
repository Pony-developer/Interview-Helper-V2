"C# has a garbage collector, so it cannot leak memory." This is wrong. The GC frees only **unreachable** objects. A managed leak is a set of objects that the program no longer needs but **still references**, often by accident. The GC cannot tell "still needed" from "forgotten".

## Typical causes

**1. Event subscriptions.** The publisher keeps a reference to every handler, and a handler of an instance method keeps a reference to its object. If the publisher lives long (a static event, a singleton service) and subscribers come and go, every subscriber stays alive forever.

```csharp
class OrderWindow
{
    public OrderWindow(PriceService prices)    // PriceService lives for the whole app
    {
        prices.PriceChanged += OnPriceChanged; // the window can never be collected
    }
}
```

The fix: unsubscribe when the subscriber is done, usually in `Dispose`.

**2. Static collections and caches that only grow.** `static Dictionary<int, User> cache` without any removal keeps every user ever loaded. Use a cache with limits: `MemoryCache` with expiration and a size limit.

**3. Timers.** A running `System.Threading.Timer` keeps its callback, and therefore the callback's object, alive. Dispose timers you no longer need.

**4. Closures.** A lambda stored in a long-lived place captures the variables it uses, including big objects you did not mean to keep.

**5. Undisposed unmanaged resources.** Native memory, handles and connections that are never released.

**6. Unbounded queues.** A producer that is faster than its consumer grows the queue until memory runs out. Use bounded queues.

## Weak references

`WeakReference<T>` points to an object **without keeping it alive**:

```csharp
var weak = new WeakReference<Image>(bigImage);
// ... later
Image image;
if (weak.TryGetTarget(out image))
    Show(image);   // still in memory
else
    Reload();      // the GC has collected it
```

It is useful for caches of objects that are cheap to recreate, and for "weak event" implementations.

## Finding a leak

The symptom: memory grows with time and does not go down after full collections.

1. Watch the heap size with `dotnet-counters`.
2. Take two heap snapshots some time apart (`dotnet-gcdump`, Visual Studio, dotMemory).
3. Compare them: find the types whose count keeps growing.
4. Look at the **retention path** of one such object: the chain of references from a root. It shows exactly who is holding it.

## The rule

Every long-lived object that references short-lived ones is a leak candidate. Unsubscribe from events, limit caches and queues, and dispose timers.
