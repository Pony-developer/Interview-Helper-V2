## Measure first (Q126)

```csharp
[MemoryDiagnoser]
public class JoinBenchmarks
{
    private readonly string[] _words = Enumerable.Range(0, 1000).Select(i => "w" + i).ToArray();

    [Benchmark(Baseline = true)]
    public string Concat() { var s = ""; foreach (var w in _words) s += w; return s; }

    [Benchmark]
    public string Builder() { var sb = new StringBuilder(); foreach (var w in _words) sb.Append(w); return sb.ToString(); }

    [Benchmark]
    public string Join() => string.Join("", _words);
}
// dotnet run -c Release  →  table with Mean, Error, Allocated per method
```

BenchmarkDotNet runs a Release build in a separate process, warms up, waits for tiered JIT to reach optimized code, runs many iterations and reports statistics and allocations. A `Stopwatch` around one call in Debug mostly measures the JIT.

Does measurement affect performance? Yes: instrumentation profilers add overhead to every call; sampling profilers less so but they're statistical; event tracing has a cost; even logging the timing allocates. Measure in production-like conditions (Release, real data sizes, realistic concurrency) and confirm in production with low-overhead metrics (`dotnet-counters`, OpenTelemetry).

## Where is the time going? (Q128)

| Symptom | Likely bottleneck | Tool |
|---|---|---|
| High CPU, slow | algorithm, hot loops, regex, serialization, LINQ in tight loops | `dotnet-trace` / PerfView / VS profiler (CPU sampling) |
| Low CPU, slow | waiting: DB, HTTP, locks, thread-pool starvation | distributed tracing, `dotnet-counters` (thread pool queue), dumps |
| Memory grows steadily | a leak: static caches, events, timers, captured closures | `dotnet-gcdump` / dotMemory, compare two snapshots |
| High GC % / many Gen 2 GCs | allocation rate, LOH churn, mid-life objects | `dotnet-counters` (`gc-heap-size`, `alloc-rate`, `time-in-gc`), allocation profiler |
| Spiky latency | GC pauses, lock contention, cold starts, noisy neighbours | traces with GC events, contention events |

## Reducing memory use and memory traffic

```csharp
// 1. Don't allocate what you don't need
int count = line.AsSpan().Count(',');                     // instead of line.Split(',').Length - 1
if (int.TryParse(span.Slice(3, 4), out var year)) { }     // parse a slice, no substring

// 2. Reuse buffers
byte[] buffer = ArrayPool<byte>.Shared.Rent(64 * 1024);
try { /* use buffer */ } finally { ArrayPool<byte>.Shared.Return(buffer); }

// 3. Stream instead of loading everything
await foreach (var row in db.Orders.AsAsyncEnumerable()) { … }
await JsonSerializer.SerializeAsync(response.Body, items);

// 4. Pre-size collections
var map = new Dictionary<int, Customer>(customers.Count);

// 5. Avoid hidden allocations
static int Twice(int x) => x * 2;              // static lambdas / method groups: no closure
string s = $"{id}:{name}";                     // modern interpolation handlers: no boxing of id
foreach (var x in list) { }                    // List<T>'s struct enumerator, no allocation (unlike via IEnumerable<T>)
```

Other levers: `struct`/`readonly struct` for small hot data, `stackalloc` for small temporary buffers, `string.Create`, `StringBuilder` pooling, `RecyclableMemoryStream`, caching computed results with size limits (`MemoryCache` with `SizeLimit`), `FrozenDictionary` for read-mostly lookups, and Server GC / `GCHeapAffinitizeMask` / DATAS tuning for services.

## Memory leaks in managed code

The GC can't free what is still referenced:
- static collections that only grow (caches without eviction);
- event handlers on long-lived publishers (`static event`, `INotifyPropertyChanged` on singletons);
- `Timer` callbacks capturing `this`;
- `HttpClient` created per request (socket exhaustion — use `IHttpClientFactory` or one static instance);
- captive dependencies in DI (a scoped `DbContext` kept by a singleton keeps every tracked entity alive);
- not disposing `IDisposable`s that hold native memory or OS handles.

Finding them: take two heap snapshots a few minutes apart under load and diff them (dotMemory, VS, `dotnet-gcdump`), look at the types that grow, then follow their **retention paths** (who holds them) to the root.
