## Lazy initialization

Create an expensive object only when it's first needed, exactly once, even under concurrency:

```csharp
private readonly Lazy<ProductCatalog> _catalog = new(() => ProductCatalog.LoadFromDisk());

public ProductCatalog Catalog => _catalog.Value;   // first access runs the factory; later ones reuse the result
```

Thread-safety modes (`LazyThreadSafetyMode`):

| Mode | Behavior |
| --- | --- |
| `ExecutionAndPublication` (default) | the factory runs once; other threads wait for it |
| `PublicationOnly` | several threads may run the factory; the first result wins |
| `None` | no thread safety: fastest, for single-threaded use |

If the factory throws, the default mode caches the **exception** and rethrows it on every access; use `PublicationOnly` if a retry should be possible.

`LazyInitializer.EnsureInitialized(ref _field, () => new X())` does the same without allocating a `Lazy<T>` object.

The classic **double-checked locking** that `Lazy<T>` replaces:

```csharp
private volatile Expensive? _instance;
private readonly object _gate = new();
public Expensive Instance
{
    get
    {
        if (_instance == null)
            lock (_gate)
                _instance ??= new Expensive();
        return _instance;
    }
}
```

## Thread-local storage

Sometimes each thread needs its **own** copy of a value (a non-thread-safe `Random` in older .NET, a buffer, a per-thread counter):

```csharp
[ThreadStatic] private static StringBuilder? _buffer;          // initialize lazily: field initializers run only once
private static StringBuilder Buffer => _buffer ??= new StringBuilder();

private static readonly ThreadLocal<Random> _rnd = new(() => new Random(Guid.NewGuid().GetHashCode()));
int roll = _rnd.Value!.Next(1, 7);
```

Pitfalls: pool threads are reused, so thread-local values **leak** between unrelated work items unless reset; and after an `await`, the code may continue on a different thread with a different value.

### AsyncLocal<T>

For data that should follow a **logical flow** across awaits (correlation ids, the current user, an ambient transaction), use `AsyncLocal<T>`:

```csharp
private static readonly AsyncLocal<string?> _correlationId = new();

public async Task HandleAsync(Request r)
{
    _correlationId.Value = r.Id;
    await Step1Async();                   // inside, _correlationId.Value is still r.Id, whatever thread runs it
}
```

Values flow down into called async methods but changes made inside a child don't flow back up. `Activity.Current` and `IHttpContextAccessor` are built on it.

## Timers

| Timer | Callback runs on | Use for |
| --- | --- | --- |
| `System.Threading.Timer` | thread pool | simple background ticks |
| `System.Timers.Timer` | thread pool (or a sync object) | component-style wrapper with `Elapsed` event |
| `PeriodicTimer` (.NET 6) | awaited in your async loop | modern async periodic work |
| WinForms/WPF `DispatcherTimer` | UI thread | UI updates |

```csharp
using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
while (await timer.WaitForNextTickAsync(stoppingToken))
    await RefreshCacheAsync(stoppingToken);   // ticks never overlap: the next waits for this one
```

With `System.Threading.Timer`, callbacks can **overlap** if one takes longer than the period, and a timer that's only referenced by a local variable can be garbage-collected and stop firing. Keep a reference and dispose it when done.

## Interview takeaways

- `Lazy<T>` = thread-safe one-time initialization; beware it caches exceptions by default.
- `ThreadLocal<T>`/`[ThreadStatic]` = per thread; `AsyncLocal<T>` = per async flow.
- Prefer `PeriodicTimer` for async periodic work; thread-pool timers can overlap and must stay referenced.
