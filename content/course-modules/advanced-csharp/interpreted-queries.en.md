## Local vs interpreted queries

| | Local queries | Interpreted queries |
| --- | --- | --- |
| Source type | `IEnumerable<T>` | `IQueryable<T>` |
| Operators from | `System.Linq.Enumerable` | `System.Linq.Queryable` |
| Lambdas become | delegates (`Func<...>`), compiled IL | **expression trees** (`Expression<Func<...>>`), data |
| Who runs them | your process, item by item | a **provider** that translates the tree (e.g. EF Core → SQL) |

```csharp
IQueryable<Customer> query = db.Customers
    .Where(c => c.Name.StartsWith("A"))
    .OrderBy(c => c.Name)
    .Take(10);
// EF Core sends something like:
// SELECT TOP(10) ... FROM Customers WHERE Name LIKE N'A%' ORDER BY Name
```

The same C# looks identical either way; what changes is the **static type** of the source, which decides whether the compiler picks `Enumerable.Where(Func)` or `Queryable.Where(Expression<Func>)`.

## How it works

`IQueryable<T>` holds an `Expression` (the query so far) and an `IQueryProvider`. Each `Queryable` operator doesn't execute anything; it builds a bigger expression tree: `Call(Where, source, Lambda(...))`. When you enumerate or call `ToList()`, `Count()`, `First()`..., the provider walks the tree, translates it, sends it to the database and materializes the results.

## What can't be translated

The provider understands a fixed set of operators and methods. Calling your own C# method inside a lambda usually fails:

```csharp
db.Customers.Where(c => IsVip(c)).ToList();
// InvalidOperationException: The LINQ expression ... could not be translated.
```

EF Core 3.0+ throws rather than silently running the filter in memory (which used to download whole tables). Options:

- rewrite the condition with translatable expressions;
- do the database part first, then switch to LINQ to Objects:

```csharp
var result = db.Customers
    .Where(c => c.Country == "UA")          // runs in SQL
    .AsEnumerable()                          // from here on: LINQ to Objects
    .Where(c => IsVip(c))                    // runs in .NET
    .ToList();
```

`AsEnumerable()` just changes the static type to `IEnumerable<T>`, so later operators bind to `Enumerable`. Use it **after** filtering in SQL as much as possible.

## EF Core specifics worth knowing

- **Tracking**: entities returned by queries are tracked for change detection. Use `AsNoTracking()` for read-only queries; projections to DTOs aren't tracked.
- **Loading related data**: `Include(o => o.Lines)` (eager), explicit `Entry(x).Collection(...).Load()`, or lazy loading proxies (beware the N+1 problem).
- **Split queries**: `AsSplitQuery()` avoids cartesian explosion when including several collections.
- **Async**: `ToListAsync`, `FirstOrDefaultAsync`, `CountAsync` free the thread while the database works.
- **Raw SQL**: `FromSqlInterpolated($"... {param}")` parameterizes values safely; never concatenate user input into SQL.
- **Compiled queries**: `EF.CompileAsyncQuery(...)` skips translation on hot paths.

## The N+1 problem

```csharp
foreach (var order in db.Orders.ToList())       // 1 query
    Console.WriteLine(order.Customer.Name);     // + 1 query per order with lazy loading
```

Fix with `Include(o => o.Customer)` or, better, a projection: `db.Orders.Select(o => new { o.Id, o.Customer.Name })`.

## Interview takeaways

- `IQueryable` + expression trees + a provider = queries translated to another language.
- The static type of the source picks `Enumerable` or `Queryable` operators.
- Not every C# method translates; filter in SQL first, then `AsEnumerable()` for the rest.
- Know `AsNoTracking`, `Include`, projection and the N+1 problem.
