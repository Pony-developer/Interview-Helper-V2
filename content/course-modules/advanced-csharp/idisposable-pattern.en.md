## Memory vs resources

The garbage collector reclaims **memory**. It knows nothing about the urgency of **other resources**: file handles, sockets, database connections, locks, GPU buffers, OS event handles. Those must be released as soon as you're done, deterministically. That's what `IDisposable` is for:

```csharp
public interface IDisposable { void Dispose(); }
```

## using

```csharp
using (var conn = new SqlConnection(cs))
using (var cmd = new SqlCommand(sql, conn))
{
    conn.Open();
    cmd.ExecuteNonQuery();
}   // cmd.Dispose() then conn.Dispose(), even if an exception was thrown

using var file = File.OpenRead(path);     // C# 8 declaration: disposed at the end of the scope
await using var stream = GetAsyncResource();   // IAsyncDisposable: DisposeAsync
```

`using` is `try/finally` with a null check. Objects are disposed in **reverse order** of creation.

## The disposal contract

A well-behaved `Dispose`:

1. is **idempotent**: calling it twice does nothing the second time;
2. makes the object **unusable**: other members throw `ObjectDisposedException` afterwards;
3. disposes the disposable objects the class **owns** (but not ones it merely borrowed);
4. doesn't throw if it can help it (an exception from `Dispose` during an exception unwinding hides the original one).

`Close()` on types like `Stream` or `SqlConnection` is a synonym for `Dispose` (some types allow reopening after `Close`).

## Who disposes what

- **You created it, you dispose it.** A factory or `new` means you own it.
- **You received it, you don't**, unless the API says ownership is transferred (e.g. `new StreamReader(stream, leaveOpen: false)` takes ownership of the stream).
- With dependency injection, the **container** disposes the services it created at the end of their lifetime. Don't dispose injected services.
- `HttpClient` is the famous exception: create it once (or via `IHttpClientFactory`) and reuse it, rather than disposing per request, which exhausts sockets.

## The classic dispose pattern

For a class that owns managed disposables only, a simple `Dispose` is enough:

```csharp
public sealed class ReportWriter : IDisposable
{
    private readonly StreamWriter _writer;
    private bool _disposed;
    public ReportWriter(string path) => _writer = new StreamWriter(path);

    public void Write(string line)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);   // .NET 7; earlier: if (_disposed) throw new ObjectDisposedException(...)
        _writer.WriteLine(line);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _writer.Dispose();
    }
}
```

For an **unsealed** class that might be subclassed (or that holds unmanaged resources directly), the full pattern adds a `protected virtual Dispose(bool disposing)`:

```csharp
public class ResourceHolder : IDisposable
{
    private bool _disposed;

    public void Dispose()
    {
        Dispose(disposing: true);
        GC.SuppressFinalize(this);        // no need for the finalizer any more
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;
        if (disposing)
        {
            // dispose managed objects you own
        }
        // free unmanaged resources (only if you hold any directly)
        _disposed = true;
    }

    // ~ResourceHolder() => Dispose(disposing: false);   // only if you own raw unmanaged handles
}
```

`disposing == false` means "called from the finalizer": other managed objects may already be finalized, so touch only unmanaged state.

## IAsyncDisposable

Resources whose cleanup involves I/O (flushing a network stream, committing a transaction) implement `ValueTask DisposeAsync()`. Use `await using`. A type that implements both should make `Dispose` work synchronously too.

## Interview takeaways

- GC = memory; `Dispose` = everything else, deterministically.
- `using` guarantees disposal in reverse order, even on exceptions.
- `Dispose` must be idempotent; the owner disposes; DI containers dispose what they create.
- The full `Dispose(bool)` pattern is for unsealed classes and unmanaged resources.
