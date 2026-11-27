## Task

Question 159: "Which variants of distributed transactions are there in microservices?" The practical one is the **saga**: a sequence of local transactions where each completed step has a **compensating action** that semantically undoes it.

Complete **`Saga.Run(steps, log)`**:

1. Run the steps in order, remembering which ones completed (a `Stack<SagaStep>` is the natural choice).
2. If a step throws: log `"failed: <name>"`, then run `Compensate` of every **completed** step in **reverse** order (the failed step itself is not compensated — it didn't complete), and return `false`.
3. If a compensation throws, log `"compensation failed: <name>"` and continue with the remaining compensations — in a real system such a step is parked for a retry or manual fix.
4. Return `true` when all steps succeed.

The test runs the order saga three times: everything succeeds; the shipment fails (payment is refunded, then stock released); the payment fails and releasing the stock fails too.

Expected output:

```
completed: done: reserve stock, done: charge payment, done: create shipment
rolled back: done: reserve stock, done: charge payment, failed: create shipment, undo: charge payment, undo: reserve stock
rolled back: done: reserve stock, failed: charge payment, compensation failed: reserve stock
```
