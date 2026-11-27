## Task

Question 81: "Why is the Dispose pattern so complex for managed vs unmanaged resources?" Implement it and see why each part exists. `FileResource` owns an **unmanaged** handle (from `NativeApi.Open`) and a **managed** disposable (`MemoryStream`).

Complete:

1. **`Dispose()`** — call `Dispose(true)`, then `GC.SuppressFinalize(this)`.
2. **`Dispose(bool disposing)`**:
   - if already disposed, do nothing (Dispose must be safe to call twice);
   - if `disposing` is true (called from `Dispose()`), dispose the buffer and log `"buffer disposed"`;
   - always close the handle (`NativeApi.Close(handle)`) and log `"handle closed"`;
   - mark the object as disposed.
3. **The finalizer `~FileResource()`** — call `Dispose(false)`: from the finalizer only the unmanaged handle may be released, because other managed objects may already be finalized.
4. **`LoggedResource.Dispose(bool)`** — return if `IsDisposed`; when `disposing`, log `"derived cleanup"`; then call `base.Dispose(disposing)`.

`FinalizerDemo.RunFinalizerPath()` runs exactly what the finalizer would run, so you can see the `disposing: false` path deterministically: the handle is closed, the buffer is not touched.

Expected output:

```
write a
buffer disposed
handle closed
derived cleanup
buffer disposed
handle closed
ObjectDisposedException
handle closed
open handles: 0
```
