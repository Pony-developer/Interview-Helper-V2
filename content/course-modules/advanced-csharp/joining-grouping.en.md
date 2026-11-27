## Join: inner join on keys

```csharp
var orderInfo = orders.Join(
    customers,
    o => o.CustomerId,          // outer key
    c => c.Id,                  // inner key
    (o, c) => new { o.Id, c.Name });

// query syntax
var orderInfo2 =
    from o in orders
    join c in customers on o.CustomerId equals c.Id
    select new { o.Id, c.Name };
```

- Matches on **equality** of keys (`equals`, not `==`; the outer sequence on the left).
- Orders whose customer doesn't exist are dropped: it's an **inner** join.
- In LINQ to Objects, `Join` builds a lookup over the inner sequence first, so it's O(n + m), far better than a nested `Where` (O(n × m)).
- Composite keys use anonymous types: `on new { o.Year, o.Region } equals new { s.Year, s.Region }`.

## GroupJoin: hierarchical / left outer join

`GroupJoin` pairs each outer element with the **sequence** of matching inner elements, which may be empty:

```csharp
var perCustomer = customers.GroupJoin(
    orders,
    c => c.Id,
    o => o.CustomerId,
    (c, custOrders) => new { c.Name, Count = custOrders.Count(), Total = custOrders.Sum(o => o.Total) });

// query syntax: join ... into
var perCustomer2 =
    from c in customers
    join o in orders on c.Id equals o.CustomerId into custOrders
    select new { c.Name, Count = custOrders.Count() };
```

Customers with no orders appear with an empty group, so this is the natural **left outer join**. To flatten it back into rows (one per order, or one row with nulls), add `from o in custOrders.DefaultIfEmpty()`.

## Zip

```csharp
string[] names = { "a", "b", "c" };
int[] scores = { 90, 80 };
var paired = names.Zip(scores, (n, s) => $"{n}:{s}");   // a:90, b:80: stops at the shorter one
var triples = names.Zip(scores, new[] { true, false });  // .NET 6: tuples of three
```

## GroupBy

```csharp
IEnumerable<IGrouping<string, Order>> byCity = orders.GroupBy(o => o.City);
foreach (var g in byCity)
{
    Console.WriteLine($"{g.Key}: {g.Count()} orders, {g.Sum(o => o.Total)}");
    foreach (var o in g) { /* the orders of this city */ }
}

// element and result selectors
var namesByCity = customers.GroupBy(c => c.City, c => c.Name);
var stats = orders.GroupBy(o => o.Placed.Year, (year, os) => new { year, Total = os.Sum(o => o.Total) });

// composite key
var byYearMonth = orders.GroupBy(o => new { o.Placed.Year, o.Placed.Month });

// query syntax
var q = from o in orders
        group o by o.City into g
        where g.Count() > 10
        orderby g.Key
        select new { City = g.Key, Count = g.Count() };
```

- Each `IGrouping<TKey, TElement>` is a sequence with a `Key`.
- In LINQ to Objects groups come out in the order their keys first appeared; elements keep their order.
- `GroupBy` is deferred but buffers its whole input when enumerated.
- EF Core can translate a `GroupBy` followed by aggregates (`Count`, `Sum`, ...) into SQL `GROUP BY`; returning the groups themselves is evaluated in memory (or not supported, depending on the version).

## ToLookup

`ToLookup` is an **immediate** `GroupBy` that returns an indexable `ILookup<TKey, TElement>`:

```csharp
var ordersByCustomer = orders.ToLookup(o => o.CustomerId);
var annOrders = ordersByCustomer[1];        // an empty sequence if the key is missing: no exception
```

## Interview takeaways

- `Join` = inner join, `GroupJoin` = hierarchical / left outer join; both O(n + m) in memory.
- `GroupBy` yields `IGrouping`s; aggregate them with `Count`, `Sum`, etc.
- `ToLookup` is the eager, indexable version of `GroupBy`.
