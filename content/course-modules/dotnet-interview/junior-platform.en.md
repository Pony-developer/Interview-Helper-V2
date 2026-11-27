## Exceptions (Q13–15)

An **exception** is an object derived from `System.Exception` that signals an error and unwinds the call stack until a matching `catch` is found. If none is found, the process crashes.

```csharp
try
{
    var text = File.ReadAllText(path);
}
catch (FileNotFoundException ex)   // most specific types first
{
    logger.LogWarning(ex, "Missing {Path}", path);
}
finally
{
    // always runs: release resources (or simply use `using`)
}
```

- `try` wraps code that may fail; `catch` handles specific exception types (with filters: `catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)`); `finally` runs whether or not an exception occurred, even after `return`.
- `finally` does **not** run if the process dies: `Environment.FailFast`, a killed process, a `StackOverflowException`, a power cut.
- Rethrow with `throw;` (keeps the original stack trace), never `throw ex;`.

The **call stack** is the per-thread stack of frames, one for each method that is currently executing. A frame holds the return address, the arguments and the local variables. Related keywords: `throw`, `try/catch/finally`, `return`, `stackalloc`; `Exception.StackTrace` shows the stack at the throw point.

## The platform (Q16–24)

- **ASP.NET (Core)** is the web framework of .NET: MVC controllers, Razor Pages, minimal APIs, Blazor and SignalR, built on the Kestrel server and a middleware pipeline.
- **Filters** in ASP.NET Core MVC run around an action in this order: **authorization** → **resource** → (model binding) → **action** → (the action runs) → **exception** → **result** filters. They are the place for cross-cutting concerns: validation, caching, error mapping.
- A **web service** is a component that exposes functionality over the network in a standard format: SOAP/WSDL (old ASMX, WCF), REST/JSON (Web API), gRPC.
- The **CLR** (Common Language Runtime) loads assemblies, JIT-compiles IL to native code, manages memory with the GC, enforces type safety, and handles exceptions, threads and security.
- The **garbage collector** frees objects on the managed heap that are no longer reachable from roots (static fields, locals on thread stacks, CPU registers, GC handles). It is generational (Gen 0, 1, 2 plus the Large Object Heap) and compacts memory. It does not release unmanaged resources: that is what `IDisposable` is for.
- A **delegate** is a type-safe reference to a method (or to several: multicast). `delegate int Op(int a, int b);` declares a delegate type. **`Action<...>`** (returns `void`) and **`Func<..., TResult>`** are predefined generic delegate types, so you rarely need your own. `System.Delegate` is the abstract base class of all delegate types.
- **LINQ** (Language Integrated Query) gives query operators over any `IEnumerable<T>` (in memory) or `IQueryable<T>` (translated, for example to SQL by EF Core):

```csharp
var topCustomers = orders
    .Where(o => o.Total > 100)
    .GroupBy(o => o.CustomerId)
    .Select(g => new { Customer = g.Key, Sum = g.Sum(o => o.Total) })
    .OrderByDescending(x => x.Sum)
    .Take(5);
```

- A **namespace** groups related types and prevents name clashes (`System.Threading.Timer` vs `System.Timers.Timer`). It is purely logical: one assembly can hold many namespaces, and one namespace can span assemblies.
