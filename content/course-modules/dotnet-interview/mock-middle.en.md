A scripted Middle interview. The questions go deeper and expect trade-offs and experience.

---

**Interviewer:** Describe the architecture of your current project.

**Candidate:** "An order-management platform: an ASP.NET Core API split into modules (Catalog, Orders, Billing) in one deployable, EF Core on SQL Server, Azure Service Bus for integration events to the warehouse system, Redis for caching. I own the Orders module. We moved from one big `OrderService` to command/query handlers with MediatR, which made validation and transactions consistent through pipeline behaviors."

> *Checks:* can you explain a system and your part in it.

---

**Interviewer:** How do you understand SOLID? Where did you apply it?

**Candidate:** "My best example is open/closed with dependency inversion: discounts were a growing `switch`; I introduced `IDiscountRule` with one class per rule, registered in DI, and the pricing service just takes `IEnumerable<IDiscountRule>`. New promotions became new classes with their own tests. For Liskov, I'd say a subclass must not throw for things the base supports — our `ReadOnlyRepository` that threw on `Save` was a smell, and splitting `IReader`/`IWriter` (interface segregation) fixed it."

---

**Interviewer:** `AddTransient` vs `AddScoped` vs `AddSingleton`. What's a captive dependency?

**Candidate:** "New per resolve, one per request, one per app. A captive dependency is a scoped service, like `DbContext`, injected into a singleton — it lives forever and is shared between requests, which is a concurrency bug. In a `BackgroundService` I create a scope per iteration with `IServiceScopeFactory`."

---

**Interviewer:** How does the GC work, and what's special about the LOH?

**Candidate:** "Generational: new objects in Gen 0; a collection marks reachable objects from roots, compacts survivors and promotes them. Most objects die young, so Gen 0 collections are cheap. Objects of 85,000 bytes or more go to the LOH, which is collected with Gen 2 and not compacted by default, so it fragments. We had a service allocating a new 1 MB buffer per request; switching to `ArrayPool<byte>.Shared` cut Gen 2 collections dramatically."

---

**Interviewer:** A query became slow in production. What do you do?

**Candidate:** "Find it in Query Store or our APM, get the actual execution plan, look for scans instead of seeks, key lookups, and estimated vs actual rows. Typical fixes: a composite or covering index matching `WHERE` and `ORDER BY`, rewriting non-sargable predicates, removing N+1 queries from EF with a projection, and checking parameter sniffing and blocking. Then I verify the improvement with the same metrics."

---

**Interviewer:** We need to save an order and publish `OrderPlaced` to Service Bus. How do you avoid losing data?

**Candidate:** "A dual write can fail halfway, so I'd use a transactional outbox: insert the event into an outbox table in the same transaction as the order, and a background relay publishes unsent rows and marks them sent. Delivery becomes at-least-once, so consumers must be idempotent — an inbox table with the message id and a unique constraint, in the same transaction as their change."

> *Checks:* the key distributed-systems answer at Middle level.

---

**Interviewer:** What's wrong here? `catch (Exception e) { Log(e.Message); throw e; }`

**Candidate:** "`throw e` resets the stack trace — use `throw;`. Logging only the message loses the type and stack — log the exception object. And if every layer logs and rethrows, the error is logged many times; I'd log once at the boundary."

---

**Interviewer:** Practical task: design a thread-safe singleton. Then tell me if you'd actually use it.

**Candidate:** "`private static readonly Lazy<Settings> _instance = new(() => new Settings());` — `Lazy` is thread-safe by default. But in an ASP.NET Core app I'd rather register it with `AddSingleton` and inject it: same single instance, but no hidden global state, and tests can replace it."

---

**Interviewer:** Questions for us?

**Candidate:** "How do you handle database migrations in deployments? What does on-call look like? What's the ratio of new features to maintenance?"

## Debrief

At Middle level the interviewer wants **experience-backed** answers: a real optimization, a real refactoring, the outbox/idempotency pattern, DI lifetimes and memory behavior explained with consequences. The final exam mixes all Middle sections.
