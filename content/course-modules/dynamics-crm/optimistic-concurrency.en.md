Reserve stock safely while other users are saving the same product.

The program models the platform side of optimistic concurrency. `Store` keeps records with a `RowVersion` that changes on every save. `Store.Update(record, behavior)` with `ConcurrencyBehavior.IfRowVersionMatches` throws `ConcurrencyVersionMismatchException` when the stored version differs from `record.RowVersion`. `BeforeNextUpdate` lets `Main` simulate another user who saves just before your update. The store is already implemented; don't change it.

Write `Inventory.Reserve(store, productId, quantity)`. Make at most **3 attempts**; in each:

1. Retrieve the product and read `new_available` (an `int`).
2. If it is less than `quantity`, return `Not enough stock: <available> left`.
3. Otherwise send an update with **only** `new_available` set to `available - quantity`, the **row version you read**, and `IfRowVersionMatches`.
4. On success, return `Reserved <quantity>, <left> left (attempt <n>)`.
5. On `ConcurrencyVersionMismatchException`, start the next attempt.

After 3 conflicts, return `Gave up after 3 conflicts`. Do not change `Main`. Expected output:

```text
1. Reserved 2, 8 left (attempt 1)
2. Reserved 3, 3 left (attempt 2)
3. Not enough stock: 1 left
4. Gave up after 3 conflicts
Available: 20
Update calls: 7
```

Check the interesting lines: in case 2, another user sets the stock to 6 just before your first save, so it fails, and the second attempt reads 6 and reserves 3. With `AlwaysOverwrite` you would have written 5 over the other user's 6: a lost update. In case 3 the re-read shows 1 left, so nothing is saved. In case 4 someone saves before every attempt, so the method gives up instead of looping forever. Your method should call `Update` 7 times in total.

Hint: create a new `Record` for the update with `Id` and `RowVersion` copied from the one you retrieved, instead of sending back all its values.
