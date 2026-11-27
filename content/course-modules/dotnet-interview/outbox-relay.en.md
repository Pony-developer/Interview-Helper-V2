## Task

The practical task from the Middle list: "An entity must be written to the database and an event sent to a message broker. How do you do this with minimal risk of losing data?" Implement the **transactional outbox** end to end on in-memory fakes.

`Db.InTransaction` rolls back everything an action added if it throws. `Broker.Publish` delivers to the consumer, but can fail before delivering (`FailNext`) or lose the acknowledgement after delivering (`LoseAckNext`) — exactly the situations that cause lost or duplicated messages in real systems.

Complete:

1. **`OrderService.PlaceOrder(db, id, failAfterSave)`** — inside **one** `db.InTransaction(...)`, add the order id to `db.Orders` and an `OutboxMessage` with body `"OrderPlaced:<id>"` to `db.Outbox`. If `failAfterSave` is true, throw `InvalidOperationException` after adding both: the transaction must roll back both, so there is never an event without an order or an order without an event.
2. **`OutboxRelay.RunOnce(db, broker)`** — publish the unsent messages in order; mark a message `Sent` **only after** `Publish` returned. If `Publish` throws, stop and return how many were sent so far — the rest is retried on the next run.
3. **`Consumer.Handle(message)`** — because the relay may publish a message again (the ack was lost after delivery), handle each distinct message only once.

Follow the output: run 1 fails before delivery; run 2 delivers `OrderPlaced:1` but loses the ack, so it's not marked sent; run 3 delivers it **again** (3 deliveries in total) plus `OrderPlaced:2`; the consumer still handles each order once.

Expected output:

```
order 3 failed
orders: 1,2, outbox: 2
run 1: 0
run 2: 0
run 3: 2
run 4: 0
deliveries: 3
handled: OrderPlaced:1, OrderPlaced:2
```
