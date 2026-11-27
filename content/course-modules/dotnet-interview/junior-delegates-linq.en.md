## Delegates step by step (Q21–22)

```csharp
delegate decimal PriceRule(decimal price);          // 1. declare a delegate type

static decimal Discount10(decimal p) => p * 0.9m;

PriceRule rule = Discount10;                         // 2. point it to a method
rule += p => p - 5m;                                 // 3. multicast: add a lambda
decimal result = rule(100m);                         // 4. invoke: both run, result of the LAST one (95)
```

- A delegate is an object (it derives from `System.MulticastDelegate` → `System.Delegate`) that stores a target object and a method.
- **Multicast**: `+=` adds to the invocation list, `-=` removes. With a return value only the last result is kept, so multicast is mostly used with `void` (events).
- **Built-in types** cover almost everything: `Action`, `Action<T1..T16>` (void), `Func<T1..T16, TResult>`, `Predicate<T>` (= `Func<T, bool>`), `Comparison<T>`, `EventHandler<TEventArgs>`.
- **Is `Delegate` different from `Action`?** `Delegate` is the abstract base class of all delegates — you can't declare a variable of it and call it with typed arguments (only `DynamicInvoke`). `Action` is one concrete, generic delegate type. Two delegate types with the same signature (`Action<int>` and your `delegate void Handler(int x)`) are still **different types** and not assignable to each other.

## Events: delegates with protection

```csharp
public class Order
{
    public event EventHandler<OrderPaidEventArgs>? Paid;   // outsiders can only += / -=

    public void MarkPaid()
    {
        Status = OrderStatus.Paid;
        Paid?.Invoke(this, new OrderPaidEventArgs(Id));     // only the owner can raise it
    }
}
order.Paid += (s, e) => email.SendReceipt(e.OrderId);
```

The `event` keyword stops outside code from invoking the delegate or replacing all subscribers with `=`. Remember to unsubscribe from long-lived publishers, or the subscriber can't be garbage-collected (a classic leak).

## LINQ: the operators you must know (Q23)

```csharp
var orders = GetOrders();

orders.Where(o => o.Total > 100)                       // filter
      .Select(o => new { o.Id, o.Customer })           // project
      .OrderBy(o => o.Customer).ThenByDescending(o => o.Id);

orders.GroupBy(o => o.Customer)
      .Select(g => new { Customer = g.Key, Count = g.Count(), Sum = g.Sum(o => o.Total) });

customers.Join(orders, c => c.Id, o => o.CustomerId, (c, o) => new { c.Name, o.Total });
orders.SelectMany(o => o.Lines);                       // flatten
orders.Any(o => o.IsOverdue); orders.All(o => o.IsPaid);
orders.First(); orders.FirstOrDefault(); orders.Single(o => o.Id == 5);
orders.Skip(20).Take(10);                              // paging
orders.Select(o => o.Customer).Distinct();
orders.ToDictionary(o => o.Id); orders.ToLookup(o => o.Customer);
```

Query syntax compiles into the same method calls:

```csharp
var adults = from p in people
             where p.Age >= 18
             orderby p.Name
             select p.Name;
```

LINQ works over **any** `IEnumerable<T>` (arrays, lists, dictionaries, files via `File.ReadLines`, XML via LINQ to XML) and over `IQueryable<T>` (EF Core turns it into SQL). Know the difference between `First` (throws if empty), `FirstOrDefault` (returns default), `Single` (throws if not exactly one).

## Namespaces (Q24)

```csharp
namespace Shop.Orders;                     // file-scoped namespace (C# 10)
using Shop.Payments;                       // import
using Json = System.Text.Json.JsonSerializer;   // alias
global using System.Linq;                  // for the whole project (C# 10)
```

Convention: the namespace follows the folder structure, starting with the company or product (`Contoso.Shop.Orders`). Namespaces are not access boundaries — that is what `internal` and assemblies are for.
