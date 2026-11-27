## What microservices solve, and how they talk (Q157–158)

Microservices split a system into independently **deployable** services around business capabilities, each owning its data. They solve **organizational scaling** (teams ship independently, fewer merge and release conflicts), **independent scaling** of hot parts, **fault isolation**, and freedom of technology per service. The price: distributed-systems complexity (network failures, eventual consistency, versioned contracts, observability, DevOps maturity). A well-structured **modular monolith** is often the better start.

Communication:
- **Synchronous**: REST/HTTP (JSON), **gRPC** (HTTP/2, Protobuf, fast, streaming; great service-to-service), GraphQL (mostly for clients/BFF). Simple, but couples availability and latency.
- **Asynchronous**: messages and events through a broker — commands to a queue (RabbitMQ, Azure Service Bus queues), events via publish/subscribe (topics, Kafka). Decouples in time, absorbs load spikes, but needs idempotency and eventual consistency.
- Patterns: API Gateway / BFF (YARP, Azure API Management), service discovery, a service mesh (mTLS, retries, tracing via sidecars — Istio, Linkerd, Dapr).

## Distributed transactions (Q159)

- **Two-phase commit (2PC/XA)**: a coordinator asks all participants to prepare, then to commit. Strong consistency, but blocking, slow, the coordinator is a single point of failure, and most cloud brokers/NoSQL stores don't support it.
- **Saga**: a sequence of local transactions, each publishing an event or a command; if a step fails, **compensating transactions** undo the previous steps (refund payment, release stock). **Choreography**: services react to each other's events (no central brain, harder to follow). **Orchestration**: a saga orchestrator (state machine: MassTransit, NServiceBus, Durable Functions, Temporal) tells each service what to do — easier to reason about and monitor.
- Supporting patterns: **transactional outbox / inbox**, idempotent consumers, **TCC** (try-confirm-cancel: reserve, then confirm), semantic locks (status "Pending"), and accepting **eventual consistency** in the UX.

## Circuit breaker, tracing (Q160–161)

A **circuit breaker** wraps calls to a dependency. **Closed**: calls pass; failures are counted. When failures exceed a threshold it goes **open**: calls fail immediately (or return a fallback) for a break period, which gives the dependency time to recover and stops threads piling up. Then **half-open**: a trial call goes through; success closes the circuit, failure opens it again. In .NET: **Polly** / `Microsoft.Extensions.Http.Resilience` (`AddStandardResilienceHandler()` = timeout + retry with jitter + circuit breaker). Combine with timeouts, bulkheads and retries — and never retry non-idempotent calls blindly.

**Tracing a request through many services**: distributed tracing with **OpenTelemetry**. The entry point starts a **trace** (trace id); each service creates **spans** and propagates context in the W3C `traceparent` header (HTTP) or message headers (brokers — MassTransit/Azure SDKs do it). Export to Jaeger, Zipkin, Tempo or Application Insights to see the whole call tree with timings. Correlate **logs** (trace id in every structured log line, centralized in Seq/ELK/Log Analytics) and **metrics** (RED: rate, errors, duration). Locally, .NET Aspire's dashboard shows traces across services out of the box.

## Brokers and delivery semantics (Q162–164)

A **message broker** receives, stores and routes messages between producers and consumers: queues (point-to-point), topics/exchanges (pub/sub), persistence, acknowledgements, retries, dead-letter queues.

- **At-most-once**: the message is acked (or auto-completed) **before** processing. A crash loses it; never duplicated. OK for metrics or telemetry.
- **At-least-once**: ack **after** processing. A crash → redelivery → **duplicates**. The default for business data; consumers must be **idempotent** (inbox table / processed-ids, upserts, natural keys) and tolerate reordering.
- **Exactly-once**: impossible end to end in general over an unreliable network; what exists is *effectively once* = at-least-once delivery + idempotent processing. Kafka offers idempotent producers and transactions for exactly-once **within Kafka** (consume-transform-produce); Azure Service Bus has duplicate detection by `MessageId` in a time window; side effects outside the broker (DB, emails) still need idempotency.

Client behaviour by semantics: for at-least-once — process, persist, **then** complete/ack; make handlers idempotent; use the outbox when producing; handle poison messages (max delivery count → dead-letter queue, alert, replay tooling); renew locks for long processing; set prefetch and concurrency deliberately. For at-most-once — ack first, accept loss, keep processing cheap.

Tools: **RabbitMQ** (flexible routing, classic work queues), **Azure Service Bus** (managed enterprise broker: sessions/FIFO, transactions, scheduled messages, dead-lettering, duplicate detection), **Kafka** / Azure Event Hubs (high-throughput event streaming, replay by offset, partitions), Amazon SQS/SNS, Redis Streams, NATS; in-process: `System.Threading.Channels`, `BlockingCollection`. .NET abstractions: **MassTransit**, NServiceBus, Wolverine, Rebus. Choose by needs: commands and workflows on Azure → Service Bus (+ MassTransit); event streams with replay and huge volume → Kafka/Event Hubs; self-hosted flexible routing → RabbitMQ.

## Azure (Q165–168)

**Service Fabric** service kinds: **stateless** services (like any web API/worker), **stateful** reliable services (state kept in replicated `IReliableDictionary`/`IReliableQueue` co-located with the code, partitioned and replicated across nodes), **Reliable Actors** (virtual actor model, single-threaded per actor), **guest executables** and **containers**. Today most new projects use AKS or Container Apps instead.

**Azure Table Storage** (and Cosmos DB Table API): a cheap, massively scalable NoSQL key-attribute store. Each entity has **PartitionKey + RowKey** (the only index, together unique) and up to 252 properties. Limits: efficient queries only by PartitionKey/RowKey (other filters scan a partition or the table), no secondary indexes, no joins/aggregations, entity ≤ 1 MB, **batch (entity group) transactions only within one partition, up to 100 operations**, pagination via continuation tokens, partition throughput limits (design keys to avoid hot partitions). Great for logs, telemetry, simple lookups.

**Azure Functions cold start**: on the **Consumption** plan an idle app is deallocated, so the first request waits for a host to start and load your code (seconds). Mitigations: **Premium (Elastic Premium)** plan with always-ready and pre-warmed instances; **Flex Consumption** with always-ready instances; a **Dedicated** (App Service) plan with *Always On*; keep the package and dependencies small, run from package, avoid heavy static initialization, use the isolated worker with ReadyToRun; as a workaround, a timer trigger that keeps the app warm.

**Azure Service Bus queues vs topics**: a **queue** is point-to-point — each message is received by **one** of the competing consumers (load balancing work). A **topic** is publish/subscribe — each **subscription** gets its own copy of every message (optionally filtered by SQL/correlation rules), and each subscription behaves like a queue with its own competing consumers. Use queues for commands ("ProcessPayment"), topics for events ("OrderPlaced") consumed by several services. Topics require the Standard tier or higher.
