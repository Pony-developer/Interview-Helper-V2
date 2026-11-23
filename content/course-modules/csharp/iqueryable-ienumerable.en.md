`IEnumerable<T>` and `IQueryable<T>` look alike, and both work with LINQ methods such as `Where` and `Select`. But they do the work in **different places**, and the difference matters a lot for databases.

## IEnumerable: the work happens in your program

`IEnumerable<T>` runs the query **in memory**. Each `Where` is a function that your program calls for every item:

```csharp
IEnumerable<int> numbers = new[] { 5, 12, 7, 30 };
IEnumerable<int> big = numbers.Where(n => n > 10);   // the lambda runs in this program
Console.WriteLine(string.Join(" ", big.ToArray())); // 12 30
```

The data must already be in memory (or come through `yield return`, as the next lectures show).

## IQueryable: the query is translated

`IQueryable<T>` does **not** run the lambda. It records the query as an **expression tree**: a data structure that describes `n => n > 10`. A **provider** (for example, Entity Framework) reads that tree and translates it into a database query:

```csharp
IQueryable<Order> orders = db.Orders.Where(o => o.Total > 100);
// No database access yet: the query is only described.

List<Order> result = orders.ToList();
// Now the provider builds SQL like: SELECT ... FROM Orders WHERE Total > 100
// Only the matching rows travel over the network.
```

With `IEnumerable`, the database would send **all** the orders to your program, and your program would filter them. With `IQueryable`, the filter runs inside the database.

## The same syntax, two meanings

```csharp
var a = list.Where(o => o.Total > 100);     // IEnumerable: runs here, item by item
var b = db.Orders.Where(o => o.Total > 100); // IQueryable: becomes SQL later
```

The code looks identical. The type decides where it runs. This is why a method that receives a query should be careful about the type it accepts.

## What IQueryable cannot do

The provider understands only the expressions it knows how to translate. A call to your own C# method inside the query usually fails:

```csharp
static bool IsLarge(Order o) { return o.Total > 100; }

db.Orders.Where(o => IsLarge(o));    // usually an error: the provider cannot translate IsLarge
db.Orders.Where(o => o.Total > 100); // fine: translated to SQL
```

## Switching between them

- `AsEnumerable()` changes an `IQueryable` into an `IEnumerable`. Everything after it runs in memory. Use it on purpose, when the database cannot do the last step.
- `ToList()` or `ToArray()` **runs** the query and gives the results.

`IQueryable<T>` is derived from `IEnumerable<T>`, so an `IQueryable` can be used anywhere an `IEnumerable` is expected. The reverse is not true: an `IEnumerable` does not have a provider.

## The rule of thumb

Use `IEnumerable<T>` as the **parameter type** of a method that only reads data. Use `IQueryable<T>` when the caller should be able to add more filters that the **database** will execute.
