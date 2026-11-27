## Asynchrony (Q45–47)

**Asynchrony** means not blocking a thread while waiting for something slow (disk, network, database). **Multithreading** means running work on several threads at once. Async I/O needs *no* thread while the operation is in flight: the OS signals completion and a continuation runs later. Parallelism is for CPU-bound work, async for I/O-bound work.

Keywords: **`async`** marks a method that may use `await` (and makes the compiler build a state machine); **`await`** waits for a `Task` without blocking: if the task is not complete, the method returns to its caller and the rest is scheduled as a continuation. Related types: `Task`, `Task<T>`, `ValueTask<T>`, `CancellationToken`, `IAsyncEnumerable<T>` with `await foreach`.

```csharp
public async Task<Order?> GetOrderAsync(int id, CancellationToken ct)
{
    using var response = await _http.GetAsync($"orders/{id}", ct);
    if (!response.IsSuccessStatusCode) return null;
    return await response.Content.ReadFromJsonAsync<Order>(cancellationToken: ct);
}
```

Rules of thumb: async all the way (no `.Result` or `.Wait()`, which can deadlock and waste threads), return `Task` rather than `void` (except in event handlers), pass a `CancellationToken`.

## Databases (Q48–50)

**Relational** (SQL Server, PostgreSQL, MySQL): tables with a fixed schema, keys and relations, SQL with joins, ACID transactions. Pros: consistency, powerful ad-hoc queries, mature tooling. Cons: schema changes need migrations; horizontal scaling (sharding) is hard.

**Non-relational (NoSQL)**: document (MongoDB, Cosmos DB), key-value (Redis), wide-column (Cassandra), graph (Neo4j). Pros: flexible schema, easy horizontal scaling, fast access by key. Cons: weaker joins and transactions, often eventual consistency, duplicated data.

An **index** is an extra data structure (usually a B-tree) that maps column values to rows, so the database can find rows without scanning the whole table and can return them in order. Cost: disk space and slower `INSERT/UPDATE/DELETE`. A **clustered** index stores the table itself in index order (one per table); a **non-clustered** index is a separate structure that points to the rows.

**JOINs**: `INNER JOIN` (only matching rows), `LEFT [OUTER] JOIN` (all left rows, NULLs where the right side is missing), `RIGHT JOIN`, `FULL [OUTER] JOIN` (all rows of both sides), `CROSS JOIN` (Cartesian product), and a self-join (a table joined to itself, for example employee → manager).

## Unit tests (Q51–53)

Why: catch regressions immediately, refactor safely, document intended behaviour, and push toward a decoupled design (a class that is hard to test usually has too many dependencies).

Cons: time to write and maintain; they test units, not the whole system; badly written tests (testing implementation details, heavy mocking) slow you down.

Structure: **Arrange – Act – Assert**.

```csharp
[Fact]
public void Withdraw_more_than_balance_throws()
{
    // Arrange
    var account = new BankAccount(balance: 100);
    // Act
    var act = () => account.Withdraw(150);
    // Assert
    Assert.Throws<InvalidOperationException>(act);
}
```

Frameworks: xUnit, NUnit, MSTest; mocks with Moq or NSubstitute; assertions with FluentAssertions.
