Two system-design questions from the Middle list are about **not losing data** when more than one system is involved.

## 1. Save an entity and publish an event

> An entity must be written to the database and an event sent to a message broker. How do you do this with minimal risk of losing data?

The naive version has a **dual-write** problem:

```csharp
await db.SaveChangesAsync();             // 1. committed
await bus.PublishAsync(new OrderPlaced()); // 2. the process dies here → the event is lost
```

Swapping the order is no better: the event is published, then the DB commit fails, and other services react to an order that does not exist. A distributed transaction (2PC / MSDTC) across the DB and the broker is usually unavailable (most brokers and cloud services don't support it) and couples both sides' availability.

**Transactional outbox**:

1. In the **same local transaction** as the business change, insert the event into an `Outbox` table.
2. A background **relay** (a hosted service polling the table, or change data capture such as Debezium) reads unsent rows, publishes them to the broker and marks them as sent.
3. If the relay crashes between "publish" and "mark as sent", it publishes again → delivery is **at-least-once**, so consumers must be **idempotent**.

```csharp
await using var tx = await db.Database.BeginTransactionAsync();
db.Orders.Add(order);
db.Outbox.Add(new OutboxMessage { Id = Guid.NewGuid(), Type = "OrderPlaced", Payload = json });
await db.SaveChangesAsync();
await tx.CommitAsync();   // both or neither
```

Libraries such as MassTransit, NServiceBus, CAP or Wolverine implement the outbox (and the inbox) for you.

## 2. A chain of three services

> An HTTP request hits service A; A writes to B; B writes to C. How do you guarantee the data is not lost along the chain? How do you prevent duplicates?

Not losing data:
- Make each hop **durable before acknowledging**: A stores the request (and an outbox message) and returns `202 Accepted`; the hand-off to B goes through a **queue**, not a synchronous call that can fail halfway. Same between B and C.
- **Retries** with exponential backoff and jitter for transient failures; a **dead-letter queue** for messages that keep failing, with alerting and replay.
- If later steps can fail for business reasons, use a **saga**: a sequence of local transactions with **compensating actions** (orchestrated by a coordinator, or choreographed through events) instead of one distributed transaction.

Preventing duplicates (retries make them inevitable):
- Give every operation an **idempotency key** / message id, generated at the edge (the client sends an `Idempotency-Key` header) and passed along the chain.
- Each service records processed ids (**inbox** table, unique constraint) in the same transaction as its change and skips repeats; or uses upserts on a natural business key.
- Prefer state-setting operations (`status = Shipped`) over increments.

Mentioning the trade-offs earns points: eventual consistency instead of immediate, extra infrastructure (broker, outbox relay), the need for monitoring and correlation ids to trace one request across all three services.
