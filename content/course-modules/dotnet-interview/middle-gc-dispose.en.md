## Watching the GC work (Q79–80)

```csharp
Console.WriteLine(GC.CollectionCount(0));      // how many Gen 0 GCs so far
var small = new byte[100];
Console.WriteLine(GC.GetGeneration(small));    // 0: new objects start in Gen 0
GC.Collect();
Console.WriteLine(GC.GetGeneration(small));    // 1: it survived, so it was promoted
var big = new byte[100_000];
Console.WriteLine(GC.GetGeneration(big));      // 2: large objects go to the LOH, reported as Gen 2
```

What the GC does in one collection:
1. **Suspend** managed threads at safe points.
2. **Mark**: walk object references from the roots — locals and arguments in every thread's stack frames and registers, static fields, GC handles (including pinned ones), the finalization queue.
3. **Plan, relocate and compact** the surviving objects (or just sweep the dead ones into free lists) and fix up every reference.
4. **Promote** survivors: Gen 0 → Gen 1 → Gen 2.
5. **Resume** threads; objects needing finalization are queued for the finalizer thread.

Why it's fast for young objects: most objects die before the next Gen 0 collection, and a Gen 0 GC only has to look at the small young area (old→young references are tracked by a write barrier and the card table).

Settings worth knowing: `<ServerGarbageCollector>` (one heap per core — throughput, used by default in ASP.NET Core), `<ConcurrentGarbageCollection>` (background Gen 2), `GCSettings.LatencyMode`, `<GCHeapHardLimit>` and DATAS (dynamic adaptation to the container's memory).

## Finalizers

```csharp
class Holder
{
    private IntPtr _handle = Native.Open();
    ~Holder() => Native.Close(_handle);   // compiled into an override of Object.Finalize
}
```

- An object with a finalizer is registered at allocation. When it becomes unreachable, it is not freed: it moves to the f-reachable queue, the **single finalizer thread** calls `Finalize`, and only the *next* GC frees it — so it is promoted and lives longer.
- Order and timing are not guaranteed; other finalizable objects you reference may already be finalized; exceptions in a finalizer crash the process.
- In practice you almost never write one: wrap OS handles in a `SafeHandle` (which has a reliable finalizer) and implement only `IDisposable`.

## The Dispose pattern (Q81)

```csharp
public class Resource : IDisposable
{
    private SafeFileHandle? _file;        // owns unmanaged state (through SafeHandle)
    private readonly Stream _log;         // owns a managed disposable
    private bool _disposed;

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);        // no need for the finalizer any more
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;            // idempotent: Dispose can be called many times
        if (disposing)
        {
            _log.Dispose();               // managed objects: only when called from Dispose()
            _file?.Dispose();
        }
        // raw unmanaged resources (if any) are freed here, on both paths
        _disposed = true;
    }

    protected void ThrowIfDisposed() => ObjectDisposedException.ThrowIf(_disposed, this);
    // ~Resource() => Dispose(false);     // only if the class holds RAW unmanaged handles
}
```

Why the `disposing` flag: when called from `Dispose()`, it's safe to touch other managed objects; from the finalizer it isn't (they may be finalized already, or partially collected), so only the raw unmanaged handles may be released. Derived classes override `Dispose(bool)` and call `base.Dispose(disposing)` at the end. For async cleanup implement `IAsyncDisposable` and use `await using`.

`using` is just syntax for `try { … } finally { x?.Dispose(); }`; the declaration form `using var x = …;` disposes at the end of the enclosing scope.

## The Large Object Heap (Q82)

- Objects ≥ **85,000 bytes** (in practice big arrays: `byte[]`, `char[]` behind huge strings, `List<T>` backing arrays with many elements).
- Allocated directly into the LOH, collected only with Gen 2, **not compacted by default** → fragmentation and growing memory.
- Allocating LOH objects is more expensive (memory must be zeroed) and can trigger Gen 2 GCs.
- Remedies: reuse buffers (`ArrayPool<T>.Shared`, `RecyclableMemoryStream`), stream data instead of loading whole files, pre-size lists to avoid repeated doubling of large arrays, process in chunks, and if needed set `GCSettings.LargeObjectHeapCompactionMode = CompactOnce` before a forced collection.
