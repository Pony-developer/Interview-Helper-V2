## Exceptions you cannot stop (Q71)

- **`StackOverflowException`**: cannot be caught since .NET 2.0; the process is terminated.
- **`ThreadAbortException`** (.NET Framework): you can catch it, but the runtime **rethrows it automatically** at the end of the `catch` unless `Thread.ResetAbort()` is called. `Thread.Abort` is not supported in .NET Core/5+.
- **`OutOfMemoryException`** can be caught, but there is little you can safely do. Corrupted-state exceptions (`AccessViolationException`) are not delivered to managed `catch` blocks in .NET Core.
- `Environment.FailFast` ends the process without running `catch` or `finally`.

## .NET Standard vs .NET (Core) libraries (Q72)

**.NET Standard** is a *specification* of APIs that every implementation (.NET Framework, .NET Core, Mono, Xamarin, Unity) must provide. A `netstandard2.0` library runs on all of them, but can only use the common subset. A **.NET Core / .NET 5+** library (`net8.0`) targets one runtime and can use all of its APIs. Today: target `net8.0`+ for new code, `netstandard2.0` only when you must also support .NET Framework.

## Deferred vs immediate execution (Q73)

Most LINQ operators (`Where`, `Select`, `OrderBy`, `Take`) are **deferred**: they build a pipeline that runs only when you enumerate it, and it runs **again** on every enumeration. Operators that return a single value or a materialized collection (`ToList`, `ToArray`, `ToDictionary`, `Count`, `First`, `Sum`, `Max`) execute **immediately**.

```csharp
var list = new List<int> { 1, 2, 3 };
var big = list.Where(x => x > 1);   // nothing runs yet
list.Add(10);
Console.WriteLine(big.Count());     // 3: 2, 3, 10 — runs now and sees the change
var snapshot = big.ToList();        // runs now, frozen copy
```

Pitfall: enumerating an EF Core `IQueryable` twice hits the database twice.

## ASP.NET Core (Q74–78)

- **`ConfigureServices(IServiceCollection services)`** registers services in the DI container (`AddControllers`, `AddDbContext`, your own services); `Configure(IApplicationBuilder app)` builds the middleware pipeline. Since .NET 6 both live in `Program.cs`: `builder.Services.Add...` and `app.Use...`.
- **Lifetimes**: `AddTransient` — a new instance every time it is resolved; `AddScoped` — one instance per scope, i.e. per HTTP request (`DbContext` is scoped); `AddSingleton` — one instance for the whole app. Never inject a scoped service into a singleton (a *captive dependency*): it lives forever and is shared between requests.
- **Kestrel** is the cross-platform, high-performance HTTP server built into ASP.NET Core. It can face the internet directly or sit behind a reverse proxy (IIS, Nginx, YARP) that handles TLS termination, load balancing and so on.
- **Request pipeline**: Kestrel → middleware in order (exception handler, HSTS, HTTPS redirection, static files, routing, CORS, authentication, authorization, …) → endpoint. For MVC: routing picks a controller action → filters (authorization → resource → model binding and validation → action filters → the action → exception filters → result filters) → the result (`IActionResult`) is executed and written to the response. Each middleware can short-circuit or wrap the next one (`await next()`).
- **Response caching**: HTTP headers via `[ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any, VaryByQueryKeys = new[] { "page" })]` (lets browsers and proxies cache); server-side `AddResponseCaching()` + `UseResponseCaching()`, or the newer **output caching** (`AddOutputCache`, `[OutputCache]`, .NET 7+) with tags for eviction; `ETag` / `If-None-Match` → `304 Not Modified`; data caching with `IMemoryCache` / `IDistributedCache` (Redis).

## Stack, heap and the GC (Q79–80)

- **Stack**: per thread, ~1 MB by default, LIFO frames with locals and arguments; allocation is just moving a pointer, and it is freed automatically when the method returns.
- **Managed heap**: shared by all threads; holds objects of reference types (and boxed values). Allocation is also fast (bump pointer in Gen 0), but freeing needs the GC.

The **GC** runs when Gen 0 is full (or on memory pressure / `GC.Collect`). It suspends managed threads, **marks** every object reachable from roots (statics, stack locals, registers, GC handles, the finalization queue), **sweeps / compacts** the survivors and updates references, then **promotes** survivors to the next generation. Gen 0 and Gen 1 collections are cheap; Gen 2 (full) collections are expensive. Modes: workstation vs server GC, background (concurrent) Gen 2 collections.

## using, Dispose and the LOH (Q81–82)

The GC only frees **memory**, and at an unpredictable time. File handles, sockets, DB connections, OS handles and locks must be released **deterministically**. `using` calls `Dispose()` in a `finally` block:

```csharp
using var connection = new SqlConnection(cs);   // Dispose() at the end of the scope
```

The full Dispose pattern is complex because a class may own **unmanaged** resources (raw handles) that must be released even if nobody calls `Dispose` — so it needs a **finalizer** as a safety net — while **managed** disposable fields must not be touched from the finalizer (they may already be finalized):

```csharp
protected virtual void Dispose(bool disposing)
{
    if (_disposed) return;
    if (disposing) _stream.Dispose();     // managed: only from Dispose()
    CloseHandle(_handle);                 // unmanaged: always
    _disposed = true;
}
public void Dispose() { Dispose(true); GC.SuppressFinalize(this); }
~MyResource() => Dispose(false);
```

Today wrap raw handles in a `SafeHandle` and you almost never need a finalizer.

**Large Object Heap**: objects of **85,000 bytes or more** (big arrays and strings) go there. It is logically part of Gen 2, so it is collected only in full GCs, and it is **not compacted by default** (copying is expensive), so it fragments. Avoid allocating big temporary buffers repeatedly: pool them (`ArrayPool<T>.Shared`, `RecyclableMemoryStream`), or compact once with `GCSettings.LargeObjectHeapCompactionMode`.
