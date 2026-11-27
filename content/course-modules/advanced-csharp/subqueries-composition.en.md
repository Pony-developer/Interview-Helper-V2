## Subqueries

A subquery is a query inside another query's lambda:

```csharp
// customers whose biggest order is above 1000
var vip = customers.Where(c => c.Orders.Max(o => o.Total) > 1000);

// the names with the shortest length (subquery computed... how often?)
var shortest = names.Where(n => n.Length == names.Min(x => x.Length));
```

In LINQ to Objects, the inner `names.Min(...)` runs **once per outer element**: O(n²). Hoist it out when it doesn't depend on the outer element:

```csharp
int min = names.Min(n => n.Length);
var shortest = names.Where(n => n.Length == min);
```

With EF Core, both versions become a single SQL statement with a subquery, and the database optimizes it.

## let: name an intermediate value

```csharp
var query =
    from p in products
    let margin = p.Price - p.Cost
    where margin > 10
    orderby margin descending
    select new { p.Name, Margin = margin };
```

`let` computes the value once per element and keeps it in scope for later clauses. The compiler implements it with a `Select` into an anonymous type that carries both the element and the new value.

## into: continue after select or group

```csharp
var query =
    from w in words
    select w.ToLower() into lower          // continue with a new range variable
    where lower.StartsWith("a")
    select lower;

var bigGroups =
    from o in orders
    group o by o.CustomerId into g         // continue with each group
    where g.Count() > 5
    select new { Customer = g.Key, Count = g.Count() };
```

After `into`, the earlier range variables are **out of scope**: it starts a fresh query over the results.

## Composition strategies

Three ways to build a complex query:

1. **Progressive** construction: add operators step by step, optionally conditionally.

```csharp
IQueryable<Order> q = db.Orders;
if (from != null) q = q.Where(o => o.Placed >= from);
if (customerId != null) q = q.Where(o => o.CustomerId == customerId);
if (sortByTotal) q = q.OrderByDescending(o => o.Total);
var page = await q.Skip(skip).Take(20).ToListAsync();
```

This is how search screens and API filters are written.

2. **`into`** continuations within one query expression.
3. **Wrapping**: use one query as the source of another (`from x in (from ... select ...) where ...`).

All three produce the same kind of operator chain; pick whatever reads best.

## Projection strategies

```csharp
// into an anonymous type: local use, also translatable to SQL
select new { o.Id, o.Total }

// into a named DTO with an object initializer: when the shape leaves the method
select new OrderSummary { Id = o.Id, Total = o.Total, Customer = o.Customer.Name }

// into a tuple (LINQ to Objects only; EF Core can't translate tuple literals in all versions)
.Select(o => (o.Id, o.Total))
```

Projecting **only the columns you need** is one of the biggest performance wins in EF Core: the generated SQL selects fewer columns and no change tracking is set up for DTOs.

## Interview takeaways

- Watch for subqueries re-evaluated per element in LINQ to Objects; hoist invariant parts.
- `let` names a per-element value; `into` restarts the query over the results.
- Build optional filters progressively; project to DTOs to fetch only what you need.
