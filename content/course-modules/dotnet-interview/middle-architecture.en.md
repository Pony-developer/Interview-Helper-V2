## What happens when you type google.com (Q54)

1. The browser checks its caches, then resolves **DNS**: browser cache → OS cache → resolver → root → `.com` → Google's name servers, and gets an IP address.
2. It opens a **TCP** connection (SYN, SYN-ACK, ACK) to port 443 (or reuses one; HTTP/3 uses QUIC over UDP instead).
3. **TLS handshake** (see below).
4. It sends an **HTTP request**: `GET / HTTP/2`, headers `Host`, `User-Agent`, `Accept`, `Accept-Encoding`, cookies.
5. Typing just `google.com` may first get a `301` redirect to `https://www.google.com/`; HSTS makes the browser go straight to HTTPS next time.
6. The server (behind load balancers and CDNs) answers `200 OK` with headers (`Content-Type`, `Cache-Control`, `Set-Cookie`) and a compressed body.
7. The browser parses the HTML, requests CSS, JS and images (reusing the connection with HTTP/2 multiplexing), builds the DOM and CSSOM, lays out and paints.

## HTTPS (Q55)

HTTPS is HTTP over **TLS**. In the handshake the server sends its **certificate**; the client checks the chain up to a trusted CA, the host name and the expiry. Then both sides agree on a **symmetric session key** with an (EC)DHE key exchange: asymmetric cryptography is only used to authenticate and agree on the key. After that, all traffic is encrypted and integrity-protected with the fast symmetric key (AES-GCM, ChaCha20). This gives confidentiality, integrity and server authentication.

## SOLID (Q56)

- **S**ingle responsibility: a class has one reason to change. An `OrderService` that also formats emails and writes CSV files has three.
- **O**pen/closed: open for extension, closed for modification. Add a new `IDiscountRule` instead of another `if` branch.
- **L**iskov substitution: a subtype must work wherever its base type is expected. A `Square : Rectangle` whose `Width` setter changes `Height` breaks it.
- **I**nterface segregation: many small interfaces instead of one fat one (`IReader`, `IWriter` rather than `IRepository` with 20 methods).
- **D**ependency inversion: high-level policy depends on abstractions (`IEmailSender`), not on details (`SmtpClient`). DI containers are one way to wire that up.

## Serialization, pure functions, DI, cohesion and coupling (Q57–60)

- **Serialization**: JSON (`System.Text.Json`; web APIs), XML (SOAP, configuration, `XmlSerializer`), Protocol Buffers (gRPC; compact binary, schema in `.proto`), MessagePack and Avro (messaging, Kafka). Avoid `BinaryFormatter`: it is insecure and obsolete.
- A **pure function** returns the same output for the same input and has no side effects. Advantages: trivial to test, safe to cache (memoize) and to run in parallel, easy to reason about. Keep the core pure and push I/O to the edges.
- **Dependency injection**: a class receives its dependencies (usually through the constructor) instead of creating them. It decouples code from concrete implementations, makes it testable (pass a fake) and centralizes lifetime management in a container (`IServiceCollection`).
- **Cohesion** is how closely the things inside one module belong together; **coupling** is how much modules depend on each other. Aim for **high cohesion, low coupling**.

## Cloud models and debugging (Q61–62)

- **IaaS**: you rent virtual machines, networks and disks and manage the OS yourself (Azure VMs, EC2).
- **PaaS**: you deploy code; the platform runs the OS, runtime and scaling (Azure App Service, Azure SQL, Functions).
- **SaaS**: a finished product you just use (Microsoft 365, Dynamics 365, Gmail).

Debugging: breakpoints (conditional breakpoints, tracepoints), the Watch/Immediate windows, stepping and "Set next statement", structured logging and correlation ids, reproducing the bug with a failing unit test, memory and CPU dumps (`dotnet-dump`, `dotnet-trace`, `dotnet-counters`), Application Insights for production, and `git bisect` to find the commit that broke it.

## Patterns: Singleton and Strategy (Q63–65)

**Singleton** guarantees one instance and a global access point. It is called an anti-pattern because it is hidden global state: dependencies are invisible in constructors, tests cannot replace it or reset it between runs, and callers are tied to a concrete class. In modern .NET register the class with `AddSingleton` in DI instead: one instance, but injected and replaceable.

**Strategy** encapsulates interchangeable algorithms behind one interface and picks one at run time: `IShippingCostStrategy` with `StandardShipping`, `ExpressShipping`, `FreeShipping`. It replaces `switch` statements and follows open/closed.

## Distributed systems (Q66–69)

| Monolith | Distributed system |
|---|---|
| one deployable unit, in-process calls | many services talking over the network |
| one database, ACID transactions | data per service, eventual consistency |
| simple to debug and deploy | independent deployment and scaling, team autonomy |
| scales as a whole | network failures, latency, partial outages to handle |

Patterns: API Gateway, Service Discovery, Circuit Breaker, Retry with backoff, Saga, Transactional Outbox / Inbox, CQRS, Event Sourcing, Database per Service, Sidecar, Bulkhead, Strangler Fig (for migrating a monolith).

**Message bus**: producers publish messages to a broker (RabbitMQ, Azure Service Bus, Kafka); the broker stores them and delivers them to consumers, who **acknowledge** after processing. If the consumer crashes after processing but before the ack, or the ack is lost, or a lock times out, the broker redelivers the message. So most brokers give **at-least-once** delivery and **duplicates are normal**.

**Idempotent services** produce the same result when a request is repeated: store processed message ids or an idempotency key (in the same transaction as the business change) and skip repeats; prefer absolute operations (`status = Paid`) over relative ones (`balance += 10`); use upserts and unique constraints on business keys; use optimistic concurrency (version columns).

## Async vs parallel (Q70)

An `async` method is compiled into a **state machine**. At each `await` on an unfinished task, the method saves its locals into the state machine, registers a continuation and returns an incomplete `Task` to its caller. When the I/O completes, the continuation resumes the method (on the captured `SynchronizationContext` or on a thread-pool thread). **Asynchrony** frees threads while waiting (I/O-bound); **parallelism** uses several threads at once to compute faster (CPU-bound: `Parallel.For`, PLINQ).
