Question 118 asks how EF Core turns C# into SQL. The practical follow-ups are about using it well.

## Tracking

```csharp
var order = await db.Orders.FirstAsync(o => o.Id == id);   // tracked: a snapshot of original values is kept
order.Status = OrderStatus.Paid;
await db.SaveChangesAsync();                                // DetectChanges → UPDATE Orders SET Status = … WHERE Id = …

var list = await db.Orders.AsNoTracking().Where(…).ToListAsync();   // read-only: faster, less memory
```

The `DbContext` is a **unit of work** and an identity map: one entity instance per key per context. Keep it short-lived (one per request — it's registered as scoped) and never share it between threads.

## Loading related data

```csharp
// Eager loading
var orders = await db.Orders.Include(o => o.Lines).ThenInclude(l => l.Product).ToListAsync();

// Projection: load only what the screen needs — often the best option
var rows = await db.Orders
    .Where(o => o.CustomerId == customerId)
    .Select(o => new OrderRow(o.Id, o.CreatedAt, o.Lines.Sum(l => l.Quantity * l.Price)))
    .ToListAsync();

// Several collections at once: avoid the cartesian explosion
var customers = await db.Customers.Include(c => c.Orders).Include(c => c.Addresses).AsSplitQuery().ToListAsync();
```

Lazy loading (proxies) is off by default for a reason: it silently creates **N+1 queries**. Turn on logging of SQL (`LogTo(Console.WriteLine)` or `Microsoft.EntityFrameworkCore.Database.Command` at Information) to see what EF actually sends.

## Transactions

- One `SaveChanges()` is atomic: all changes in one transaction.
- Several `SaveChanges()` or raw SQL in one unit: `await using var tx = await db.Database.BeginTransactionAsync(); … await tx.CommitAsync();`.
- With retries enabled (`EnableRetryOnFailure`), wrap manual transactions in `db.Database.CreateExecutionStrategy().ExecuteAsync(...)`.
- Concurrency: a `[Timestamp] byte[] RowVersion` (SQL Server) or `uint xmin` (PostgreSQL) column makes updates check the version → `DbUpdateConcurrencyException` to handle (reload and retry, or show a conflict to the user).

## Bulk operations (EF Core 7+)

```csharp
await db.Orders.Where(o => o.CreatedAt < cutoff).ExecuteDeleteAsync();
await db.Products.Where(p => p.CategoryId == 3).ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, p => p.Price * 1.1m));
```

One SQL statement, no entities loaded, no change tracking — and no `SaveChanges` needed.

## Migrations

```text
dotnet ef migrations add AddOrderStatus           # C# migration from the model diff
dotnet ef migrations script --idempotent -o migrate.sql
dotnet ef migrations bundle                       # a self-contained executable for CI/CD
```

Review the generated SQL (a renamed property can become drop + add column = data loss). Apply migrations as a separate deployment step, not from every app instance at startup. Make schema changes backward-compatible (expand → migrate data → contract) so the old and new app versions can run side by side during a rolling deployment.

## Raw SQL and performance

```csharp
var top = await db.Products.FromSql($"SELECT * FROM products WHERE price > {min}").ToListAsync();   // parameterized
var count = await db.Database.SqlQuery<int>($"SELECT count(*) AS \"Value\" FROM orders").SingleAsync();
```

Other tools: compiled queries (`EF.CompileAsyncQuery`) for hot paths, `DbContext` pooling (`AddDbContextPool`), Dapper for read-heavy reporting queries next to EF for writes.

## Parallelism with a database

`DbContext` is not thread-safe: to run queries in parallel, give each task its own context from `IDbContextFactory<T>`. Limit concurrency (`Parallel.ForEachAsync` with `MaxDegreeOfParallelism`, or `SemaphoreSlim`) — the connection pool (default 100 connections) and the database are the real limits.
