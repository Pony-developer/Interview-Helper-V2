## Task

Question 31: "What are generics and which problems do they solve?" One generic class can serve products, customers and orders with full type safety — no casts, no duplicated code. Constraints tell the compiler what `T` can do.

Complete **`InMemoryRepository<T> where T : class, IEntity`** — `IEntity` gives access to `Id`, `class` allows returning `null`:

1. **`Save(entity)`** — if `Id` is 0, assign the next id (1, 2, 3, …); if the id is already stored, replace the stored entity; any other id → `KeyNotFoundException`. Return the entity.
2. **`Find(id)`** — the entity or `null`.
3. **`Where(predicate)`** — the matching entities ordered by `Id`.
4. **`Delete(id)`** — `true` if something was removed.

And a generic method with a constraint on another type parameter:

5. **`Seq.MaxBy<T, TKey>(items, key) where TKey : IComparable<TKey>`** — the element with the largest key, using `CompareTo`; `InvalidOperationException` for an empty sequence. (.NET 6 has `Enumerable.MaxBy`; here you write it yourself.)

Expected output:

```
no product 99
#2 Mouse Pro 29.90
7 not found
#1 Keyboard 49.90; #2 Mouse Pro 29.90
True False
#3 Monitor 289.00
#2 bob@shop.ua
banana
empty
```
