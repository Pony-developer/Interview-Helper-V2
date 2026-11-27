## The dotnet diagnostic tools

Installed as .NET global tools (`dotnet tool install -g dotnet-counters`, etc.), they work on Windows, Linux and macOS and attach to a running process by id, without restarting it.

| Tool | What it does | Typical question it answers |
| --- | --- | --- |
| `dotnet-counters` | live metrics: CPU, GC heap size, gen 0/1/2 counts, allocation rate, thread pool queue length, exceptions/s, request rate | "Is memory growing? Is the thread pool starving?" |
| `dotnet-trace` | records an EventPipe trace (CPU sampling, GC events, custom events) to a `.nettrace` file for PerfView, Visual Studio or Speedscope | "Where does CPU time go?" |
| `dotnet-dump` | captures and analyzes a full process dump (`dumpheap -stat`, `gcroot`, `clrstack`) | "What's on the heap and why is it alive? Where is each thread stuck?" |
| `dotnet-gcdump` | a lighter heap-only snapshot | "Which types use the memory?" |
| `dotnet-stack` | prints the managed stacks of all threads (.NET 5+) | "Is it deadlocked?" |

```
dotnet-counters ps
dotnet-counters monitor -p 4242 --counters System.Runtime,Microsoft.AspNetCore.Hosting
dotnet-trace collect -p 4242 --duration 00:00:30
dotnet-dump collect -p 4242
dotnet-dump analyze core_20240305.dmp
```

They all talk to the runtime through **EventPipe**, a cross-platform event transport inside the CLR.

## Emitting your own events: EventSource

```csharp
[EventSource(Name = "Shop-Orders")]
public sealed class OrderEventSource : EventSource
{
    public static readonly OrderEventSource Log = new();

    [Event(1, Level = EventLevel.Informational)]
    public void OrderPlaced(int orderId, double total) => WriteEvent(1, orderId, total);

    private readonly IncrementingEventCounter _placed;
    private OrderEventSource() => _placed = new IncrementingEventCounter("orders-placed", this) { DisplayName = "Orders placed" };
    public void CountOrder() => _placed.Increment();
}
```

`EventSource` events are nearly free when nobody listens, and tools like `dotnet-trace` or an in-process `EventListener` can switch them on. `EventCounter`s show up in `dotnet-counters`.

## Metrics API (.NET 6)

`System.Diagnostics.Metrics` is the OpenTelemetry-compatible successor for counters:

```csharp
static readonly Meter Meter = new("Shop.Orders", "1.0");
static readonly Counter<long> Placed = Meter.CreateCounter<long>("orders.placed");
static readonly Histogram<double> Duration = Meter.CreateHistogram<double>("orders.duration", "ms");

Placed.Add(1, new KeyValuePair<string, object?>("country", "UA"));
Duration.Record(elapsedMs);
```

## Distributed tracing: Activity

`System.Diagnostics.Activity` represents one unit of work (a span) with a trace id, parent id, tags and timing. ASP.NET Core and `HttpClient` create activities automatically and propagate the W3C `traceparent` header across services, so one request can be followed through every service it touches.

```csharp
static readonly ActivitySource Source = new("Shop.Orders");

using Activity? activity = Source.StartActivity("PlaceOrder");
activity?.SetTag("order.id", order.Id);
// ... work; nested activities become child spans
```

OpenTelemetry's .NET SDK listens to `ActivitySource`s and `Meter`s and exports to Jaeger, Zipkin, Prometheus, Azure Monitor and others. Logs, metrics and traces correlate through the trace id.

## Interview takeaways

- `dotnet-counters` (live metrics), `dotnet-trace` (CPU/events), `dotnet-dump`/`gcdump` (memory) work cross-platform on live processes.
- `EventSource`/`EventCounter` and `Meter` emit custom diagnostics cheaply.
- `Activity` + `ActivitySource` = distributed tracing; OpenTelemetry exports it.
