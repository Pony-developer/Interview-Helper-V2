## Resilience with Polly / Microsoft.Extensions.Http.Resilience (Q160)

```csharp
builder.Services.AddHttpClient<PaymentsClient>(c => c.BaseAddress = new Uri("https://payments.internal"))
    .AddResilienceHandler("payments", pipeline =>
    {
        pipeline.AddTimeout(TimeSpan.FromSeconds(10));                       // total budget
        pipeline.AddRetry(new HttpRetryStrategyOptions
        {
            MaxRetryAttempts = 3,
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true,                                                 // spread retries out
        });
        pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
        {
            FailureRatio = 0.5,                                               // open at 50% failures…
            MinimumThroughput = 10,                                           // …over at least 10 calls…
            SamplingDuration = TimeSpan.FromSeconds(30),                      // …in a 30 s window
            BreakDuration = TimeSpan.FromSeconds(15),
        });
        pipeline.AddTimeout(TimeSpan.FromSeconds(2));                         // per attempt
    });
// or simply: .AddStandardResilienceHandler();
```

Order matters: the outer timeout bounds everything, retries wrap the circuit breaker, the inner timeout bounds a single attempt. Retry only **transient** errors (5xx, 408, 429, timeouts, connection failures) and only **idempotent** requests — or requests with an idempotency key. Respect `Retry-After`. A circuit breaker protects both sides: the caller fails fast instead of piling up threads, the callee gets time to recover. You'll implement the state machine yourself in the practice.

## A saga, orchestrated (Q159)

```csharp
public async Task<bool> PlaceOrderAsync(Order order, CancellationToken ct)
{
    var compensations = new Stack<Func<Task>>();
    try
    {
        await _inventory.ReserveAsync(order.Id, order.Lines, ct);
        compensations.Push(() => _inventory.ReleaseAsync(order.Id));

        await _payments.ChargeAsync(order.Id, order.Total, ct);
        compensations.Push(() => _payments.RefundAsync(order.Id));

        await _shipping.CreateShipmentAsync(order.Id, ct);
        return true;
    }
    catch (Exception ex)
    {
        _log.LogWarning(ex, "Order {Id} failed, compensating", order.Id);
        while (compensations.Count > 0)
        {
            try { await compensations.Pop()(); }
            catch (Exception cex) { _log.LogError(cex, "Compensation failed for {Id}", order.Id); /* park for manual fix */ }
        }
        return false;
    }
}
```

In production the saga state must survive crashes: persist it (MassTransit state machines with a saga repository, NServiceBus sagas, Durable Functions orchestrations, Temporal workflows) and drive steps with messages, so a restarted process continues where it stopped. Compensations must be idempotent and may need retries; some steps can't be undone (an email was sent) — compensate semantically (send a correction).

## Delivery semantics in client code (Q162–163)

```csharp
// Azure Service Bus — at-least-once with PeekLock (the default)
await using var processor = client.CreateProcessor("orders", new ServiceBusProcessorOptions
{
    AutoCompleteMessages = false,
    MaxConcurrentCalls = 8,
    MaxAutoLockRenewalDuration = TimeSpan.FromMinutes(5),
});
processor.ProcessMessageAsync += async args =>
{
    var id = args.Message.MessageId;
    if (await _inbox.AlreadyProcessedAsync(id)) { await args.CompleteMessageAsync(args.Message); return; }

    await using var tx = await _db.Database.BeginTransactionAsync();
    await HandleAsync(args.Message.Body.ToObjectFromJson<OrderPlaced>());
    await _inbox.MarkProcessedAsync(id);                  // same transaction as the business change
    await tx.CommitAsync();

    await args.CompleteMessageAsync(args.Message);        // ack AFTER the work is committed
};
processor.ProcessErrorAsync += args => { _log.LogError(args.Exception, "Bus error"); return Task.CompletedTask; };
// after MaxDeliveryCount failed attempts the message goes to the dead-letter queue

// At-most-once: ReceiveAndDelete mode — the message is gone as soon as it's received
var receiver = client.CreateReceiver("telemetry", new ServiceBusReceiverOptions { ReceiveMode = ServiceBusReceiveMode.ReceiveAndDelete });
```

Kafka consumers express the same choice through **when they commit offsets**: commit before processing → at-most-once; after → at-least-once; Kafka transactions (`read_committed`, transactional producer) → exactly-once *within Kafka*.

## Queues vs topics in Service Bus (Q168)

```csharp
await sender.SendMessageAsync(new ServiceBusMessage(json) { MessageId = cmd.Id.ToString(), SessionId = cmd.CustomerId });  // queue: one consumer
// topic "order-events" with subscriptions "billing", "shipping", "analytics" — each receives every event;
// a SQL filter on a subscription: "Region = 'EU' AND Total > 1000"
```

## Choosing a queue technology (Q164)

| Need | Choose |
|---|---|
| Commands and workflows on Azure, sessions/FIFO, transactions, dead-lettering, scheduled messages | Azure Service Bus |
| Event streaming, replay by offset, very high throughput, many independent readers | Kafka / Azure Event Hubs |
| Self-hosted, flexible routing (topic/direct/fanout exchanges), mature | RabbitMQ |
| Simple, cheap, huge scale, at-least-once | Azure Storage Queues / Amazon SQS |
| In-process producer/consumer | `System.Threading.Channels` |
| Abstraction over brokers with sagas, outbox, retries | MassTransit, NServiceBus, Wolverine, Rebus |

## Azure notes (Q165–167)

- **Service Fabric**: stateless and stateful Reliable Services, Reliable Actors, guest executables, containers — with partitioning and replica sets managed by the cluster.
- **Table Storage** keys: design `PartitionKey` for even load and for the queries you need (point queries by PartitionKey+RowKey are the fastest), use inverted timestamps in `RowKey` for "latest first", and duplicate entities under different keys when you need another access pattern.
- **Cold starts**: Premium / Flex Consumption with always-ready instances, Dedicated plan with Always On, small deployments, ReadyToRun, lazy initialization of heavy clients (but reuse static clients across invocations).
