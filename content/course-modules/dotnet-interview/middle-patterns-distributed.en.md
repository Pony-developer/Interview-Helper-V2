## The GoF catalogue with .NET examples (Q63)

| Kind | Pattern | Where you've seen it in .NET |
|---|---|---|
| Creational | **Factory Method** | `IHttpClientFactory.CreateClient()`, `DbProviderFactory` |
| | **Abstract Factory** | `DbProviderFactory` creating connections, commands and parameters of one family |
| | **Builder** | `WebApplication.CreateBuilder()`, `StringBuilder`, `UriBuilder`, `HostBuilder` |
| | **Singleton** | `AddSingleton`, `Lazy<T>`, `ArrayPool<T>.Shared` |
| | **Prototype** | `ICloneable`, record `with` expressions |
| Structural | **Adapter** | `StreamReader` over a `Stream`; wrapping a legacy SOAP client behind your interface |
| | **Decorator** | `BufferedStream`, `GZipStream`, `DelegatingHandler`, Scrutor `Decorate` |
| | **Facade** | `HttpClient` over sockets/TLS/HTTP; `File.ReadAllText` |
| | **Proxy** | EF Core lazy-loading proxies, Castle DynamicProxy, gRPC/WCF client proxies |
| | **Composite** | UI control trees, expression trees, `IConfiguration` sections |
| Behavioral | **Strategy** | `IComparer<T>`, `IEqualityComparer<T>`, retry policies |
| | **Observer** | C# events, `IObservable<T>`, `IOptionsMonitor.OnChange` |
| | **Chain of Responsibility** | ASP.NET Core middleware, `DelegatingHandler` chains |
| | **Command** | MediatR requests, WPF `ICommand` |
| | **Iterator** | `IEnumerable<T>` / `yield return` |
| | **Template Method** | `BackgroundService.ExecuteAsync`, `Stream` with abstract `Read` |
| | **Mediator** | MediatR, an event aggregator |
| | **State** | an order workflow with state classes |

Answer tip: name a pattern, a real case where you used it and the problem it solved. Don't list all 23.

## Singleton done right (Q64)

```csharp
// Thread-safe and lazy
public sealed class Settings
{
    private static readonly Lazy<Settings> _instance = new(() => new Settings());
    public static Settings Instance => _instance.Value;
    private Settings() { }
}

// Usually better: let the container own the lifetime
builder.Services.AddSingleton<ISettings, Settings>();
```

Why it's called an anti-pattern: hidden global state, hidden dependencies (nothing in the constructor tells you a class uses `Settings.Instance`), tests can't replace it or reset it between runs, and lifetime and thread-safety become your problem. The DI version keeps "one instance" but removes the global access point.

## Strategy (Q65)

```csharp
public interface IShippingCost { string Name { get; } decimal For(Parcel p); }
public class Courier : IShippingCost { public string Name => "courier"; public decimal For(Parcel p) => 80 + p.Kg * 5; }
public class Pickup  : IShippingCost { public string Name => "pickup";  public decimal For(Parcel p) => 0; }

public class Checkout(IEnumerable<IShippingCost> options)
{
    public decimal Shipping(Parcel p, string method) => options.Single(o => o.Name == method).For(p);
}
```

The algorithm is chosen at run time; new ones don't touch `Checkout` (open/closed); each is tested separately.

## Monolith vs distributed (Q66)

Questions to ask before splitting: Do different parts need to scale or deploy independently? Do several teams step on each other? Is the domain well understood (stable boundaries)? A **modular monolith** — one deployable, strict module boundaries, no shared tables between modules — gives most of the benefits with far less operational cost, and can be split later.

The fallacies of distributed computing are worth quoting: the network is *not* reliable, latency is *not* zero, bandwidth is *not* infinite, the network is *not* secure, topology *does* change.

## Patterns for distributed systems (Q67)

- **Communication**: API Gateway / Backend for Frontend, service discovery, request-reply over a queue, publish/subscribe.
- **Resilience**: timeout, retry with exponential backoff and jitter, circuit breaker, bulkhead (isolate resource pools), fallback, rate limiting, load shedding.
- **Data**: database per service, saga (orchestration / choreography), transactional outbox and inbox, CQRS, event sourcing, materialized views, change data capture.
- **Coordination**: leader election, distributed locks with fencing tokens, idempotency keys, sharding / partitioning, consistent hashing.
- **Operations**: health checks, sidecar / service mesh, distributed tracing with correlation ids, blue-green and canary deployments, strangler fig for migrating off a monolith.

## Message buses and duplicates (Q68–69)

A message travels: producer → broker (persisted, maybe replicated) → consumer, which acknowledges after processing. Duplicates appear when: the producer retries after a lost acknowledgement from the broker; the consumer crashes or times out after doing the work but before its ack; a lock/visibility timeout expires during slow processing and another consumer gets the message; a partition rebalances (Kafka) before offsets are committed.

So design for **at-least-once**: give every message a unique id, record processed ids in the same transaction as the business change (an **inbox** table with a unique key), make operations naturally idempotent (set state rather than increment, upsert by business key), and use optimistic concurrency. You will implement such a handler in the practice of this module.
