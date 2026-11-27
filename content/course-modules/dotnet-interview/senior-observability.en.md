Question 161 ("how would you debug a system of many microservices?") is really about **observability**: being able to answer new questions about a running system from the signals it emits.

## The three signals

| Signal | Answers | .NET API |
|---|---|---|
| **Logs** | what happened, with details | `ILogger<T>` (structured) |
| **Metrics** | how much / how often / how long, aggregated | `System.Diagnostics.Metrics.Meter` (`Counter`, `Histogram`, `UpDownCounter`) |
| **Traces** | where the time went across services for one request | `System.Diagnostics.Activity` / `ActivitySource` |

They're connected by the **trace id**: every log line written during a request carries the trace id, so you can jump from a slow trace to its logs.

## OpenTelemetry in ASP.NET Core

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService("orders-api"))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation()
        .AddSource("Orders")                            // your own ActivitySource
        .AddOtlpExporter())                             // to Jaeger, Tempo, Azure Monitor, Honeycomb…
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()                    // GC, thread pool, exceptions
        .AddMeter("Orders")
        .AddOtlpExporter());
builder.Logging.AddOpenTelemetry(o => o.AddOtlpExporter());

// custom span and metric
private static readonly ActivitySource Source = new("Orders");
private static readonly Counter<long> Placed = new Meter("Orders").CreateCounter<long>("orders.placed");

using var activity = Source.StartActivity("PlaceOrder");
activity?.SetTag("order.id", order.Id);
Placed.Add(1, new KeyValuePair<string, object?>("channel", "web"));
```

Context propagation is automatic for incoming/outgoing HTTP (W3C `traceparent` header) and for gRPC; for message brokers the SDKs (Azure Service Bus, MassTransit) put the trace context into message headers.

## What to measure

- **RED** for request-driven services: **R**ate (requests/s), **E**rrors (failed requests/s), **D**uration (latency histograms — use p50, p95, p99, not averages).
- **USE** for resources: **U**tilization, **S**aturation (queue lengths, thread-pool queue), **E**rrors.
- Business metrics: orders placed, payments failed — often the first to show a problem.
- .NET runtime: GC pause time and heap size, thread-pool queue length, exception rate, lock contention.

## SLIs, SLOs and alerts

- **SLI**: a measured indicator — "share of checkout requests completing in < 500 ms".
- **SLO**: the target — "99.5% over 30 days". The remaining 0.5% is the **error budget**: while it lasts, ship features; when it's burned, focus on reliability.
- **SLA**: the contractual promise with penalties (looser than the SLO).
- Alert on **symptoms users feel** (SLO burn rate, error rate) rather than every CPU spike; every alert needs a runbook.

## Debugging a slow request across services

1. Find a slow or failed request in the tracing UI (filter by endpoint, status, duration) — or start from an alert.
2. Open its trace: the waterfall of spans shows which service and which call (SQL query, HTTP call, queue wait) took the time.
3. Jump to the logs with the same trace id for details and exceptions.
4. Check that service's metrics around that time (saturation? GC? thread pool? a deployment?).
5. Reproduce with the same input; for memory or CPU issues, capture a dump/trace (`dotnet-dump`, `dotnet-trace`) from the affected instance.

## Costs and pitfalls

High-cardinality labels in metrics (user id, order id) explode storage — put those in traces and logs instead. Sample traces at high volume (head sampling: keep N%; tail sampling in the collector: keep errors and slow ones). Never log secrets or personal data. Locally, the **.NET Aspire dashboard** shows logs, metrics and traces of all your services with zero setup.

## Consistent hashing (the practice)

Partitioned systems — distributed caches (Redis Cluster uses hash slots), Cassandra, sharded databases, sticky load balancing — must decide which node owns a key. `hash(key) % N` moves almost every key when N changes. **Consistent hashing** places nodes (as many virtual points) on a ring; a key belongs to the first node clockwise from its hash, so adding or removing a node moves only about 1/N of the keys. You'll implement the ring and measure the difference.
