What if somebody forgets to call `Dispose`? For memory it does not matter: the GC will take it. For a raw operating-system handle it does: without a safety net, the handle leaks until the process ends. That safety net is the **finalizer**.

## Finalizers

```csharp
class NativeBuffer
{
    private IntPtr memory = Marshal.AllocHGlobal(1024);

    ~NativeBuffer()            // a finalizer: called by the GC, not by you
    {
        Marshal.FreeHGlobal(memory);
    }
}
```

When an object with a finalizer becomes unreachable, the GC does not free it at once. It puts the object into a queue, and a special **finalizer thread** calls `~NativeBuffer()` later. Only after that can the memory be reclaimed. The costs:

- the object survives at least one extra collection, and so moves to an older generation;
- the order in which finalizers run is not defined, so a finalizer must not use other finalizable objects;
- in .NET Core and later, finalizers are **not** run when the process exits.

Today you almost never write a finalizer: wrap the handle in a `SafeHandle` (for example `SafeFileHandle`), which already has one.

## The full Dispose pattern

When a class does own an unmanaged resource directly, and may have subclasses, the classic pattern is:

```csharp
public class ResourceHolder : IDisposable
{
    private IntPtr buffer = Marshal.AllocHGlobal(1024);   // unmanaged
    private readonly Stream log = File.OpenWrite("log");  // managed, disposable
    private bool disposed;

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);   // already cleaned up: the finalizer is not needed
    }

    protected virtual void Dispose(bool disposing)
    {
        if (disposed) return;
        if (disposing)
        {
            log.Dispose();           // managed objects: only when called from Dispose()
        }
        Marshal.FreeHGlobal(buffer); // unmanaged resources: always
        buffer = IntPtr.Zero;
        disposed = true;
    }

    ~ResourceHolder()
    {
        Dispose(false);              // from the finalizer: do not touch other managed objects
    }
}
```

Why the `disposing` flag? When the finalizer runs, the other managed objects (here, `log`) may already have been finalized, so touching them is unsafe. From `Dispose()`, everything is still alive.

`GC.SuppressFinalize(this)` removes the object from the finalization queue, so it is freed in one collection instead of two.

A subclass overrides `Dispose(bool)`, releases its own resources, and calls `base.Dispose(disposing)`.

## The short version

A `sealed` class that only owns **managed** disposable objects needs none of this: no finalizer, no flag, just a `Dispose()` that disposes its fields. That is the case for most classes you will write.

## The rule

Finalizers are a safety net for unmanaged resources, not a replacement for `Dispose`. Prefer `SafeHandle` to writing one, and use the full pattern only for a non-sealed class that owns an unmanaged resource directly.
