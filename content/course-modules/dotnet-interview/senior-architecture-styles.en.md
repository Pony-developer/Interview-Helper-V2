"Besides OOP, which practices have you used?" (Q122) and "How would you implement cross-cutting concerns?" (Q129) usually lead to architecture. Know the main styles, their trade-offs, and when you'd pick each.

## Layered (N-tier)

```text
Presentation (controllers) → Business logic (services) → Data access (repositories, EF) → Database
```

Simple and familiar. The risk: business logic depends on data access details, everything ends up in "services", and the domain becomes anemic (classes with only properties).

## Clean / Onion / Hexagonal (ports and adapters)

```text
           ┌──────────── Infrastructure (EF Core, HTTP clients, email, queues) ───────────┐
           │     ┌──────── Application (use cases, commands/queries, interfaces) ───┐     │
           │     │          ┌──── Domain (entities, value objects, rules) ───┐       │     │
           │     │          └────────────────────────────────────────────────┘       │     │
           │     └───────────────────────────────────────────────────────────────────┘     │
           └───────────────────── Web API / UI (composition root) ─────────────────────────┘
```

The **dependency rule**: code dependencies point inward. The domain has no references to EF Core or ASP.NET; the application layer defines interfaces (`IOrderRepository`, `IEmailSender` — "ports"); infrastructure implements them ("adapters"). Benefits: testable business rules, replaceable infrastructure. Cost: more projects, interfaces and mapping — overkill for a CRUD service.

## Domain-Driven Design (tactical)

- **Entity** — has an identity that persists (`Order #42`).
- **Value object** — defined by its values, immutable (`Money`, `Address`) → C# `record`.
- **Aggregate** — a cluster changed together through its **root**, which enforces invariants (`Order` with its `OrderLines`: you add lines via `order.AddLine(...)`, never directly). One transaction changes one aggregate; other aggregates are referenced by id.
- **Domain events** — `OrderPaid` raised by the aggregate, handled after the transaction (often via an outbox).
- **Bounded contexts** (strategic DDD) — "Product" means different things in Catalog and Shipping; each context has its own model. Good candidates for microservice boundaries.

```csharp
public sealed class Order
{
    private readonly List<OrderLine> _lines = new();
    public IReadOnlyList<OrderLine> Lines => _lines;
    public OrderStatus Status { get; private set; }

    public void AddLine(Product p, int qty)
    {
        if (Status != OrderStatus.Draft) throw new InvalidOperationException("Order is locked");
        if (qty <= 0) throw new ArgumentOutOfRangeException(nameof(qty));
        _lines.Add(new OrderLine(p.Id, qty, p.Price));
    }
}
```

## CQRS

Separate the **write side** (commands → aggregates → invariants) from the **read side** (queries → DTOs, optimized SQL, maybe a separate read model or database). Light CQRS — just separate command and query handlers in one database — is common with MediatR. Full CQRS with a separate read store adds eventual consistency; use it when reads and writes have very different shapes or scale.

## Vertical slice architecture

Organize by **feature**, not by layer: `Features/Orders/PlaceOrder.cs` contains the request, validator, handler and endpoint. Each slice chooses its own data access (EF for writes, Dapper for a heavy report). Fewer abstractions, changes stay local. Pairs well with a mediator pipeline for cross-cutting concerns.

## Cross-cutting concerns in a pipeline

```csharp
public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var failures = validators.Select(v => v.Validate(request)).SelectMany(r => r.Errors).ToList();
        if (failures.Count > 0) throw new ValidationException(failures);
        return await next();
    }
}
// Registered in order: Logging → Validation → Transaction → handler
```

The practice builds such a pipeline from scratch: the first registered behavior is the outermost, and a behavior may stop the pipeline (validation) without calling the handler.

## How to answer "which architecture would you choose?"

Start from the problem: a simple CRUD admin → layered or vertical slices, minimal ceremony; complex business rules that change often → DDD aggregates with clean boundaries; very different read/write loads → CQRS; many teams, independent deployment → modular monolith first, microservices when the boundaries are proven. Mention **ADRs** (architecture decision records) to document the choice.
