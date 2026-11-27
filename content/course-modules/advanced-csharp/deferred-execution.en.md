## A query is a recipe, not a result

Most query operators don't run when you call them. They return a **decorator** object that remembers its source and its lambda. The work happens only when someone **enumerates** the result.

```csharp
var numbers = new List<int> { 1, 2 };
IEnumerable<int> query = numbers.Select(n => n * 10);   // nothing computed yet
numbers.Add(3);
foreach (int n in query) Console.Write(n + " ");        // 10 20 30: sees the added item
```

Operators that return a **single value** or a **materialized collection** execute immediately: `Count`, `First`, `Sum`, `Any`, `Max`, `ToList`, `ToArray`, `ToDictionary`, `ToHashSet`.

## How the pipeline runs

A chain like `source.Where(...).Select(...).Take(2)` builds nested decorators. When `foreach` asks the outermost one (`Take`) for an item, it asks `Select`, which asks `Where`, which pulls from the source. Items flow **one at a time** through the whole chain: nothing is buffered, and `Take(2)` stops pulling after two items, even from an infinite source.

Exceptions to streaming: `OrderBy`, `GroupBy`, `Reverse` and the set operators must **buffer** their input before producing the first item (you can't know the smallest element until you've seen them all). They're still deferred, but not lazy item by item.

## Reevaluation

Every enumeration runs the query again:

```csharp
var expensive = orders.Where(o => IsSuspicious(o));   // IsSuspicious calls a web service
Console.WriteLine(expensive.Count());   // calls the service for every order
foreach (var o in expensive) Flag(o);   // ... and again
```

Fix: materialize once with `ToList()` or `ToArray()` when you need the results more than once, need a stable snapshot, or the source is slow or remote.

## Captured variables

Lambdas capture variables, and the query runs later, so it sees the variable's value at **enumeration** time:

```csharp
int limit = 10;
var small = numbers.Where(n => n < limit);
limit = 2;
small.ToList();          // uses limit = 2
```

A classic bug: building filters in a `for` loop where every lambda captures the same loop variable (see the closures lecture).

## Why deferred execution is good

- Queries can be **composed** in steps without creating intermediate lists.
- Infinite or very large sources work, since only what's needed is pulled.
- For `IQueryable`, the whole composed query can be translated into **one** SQL statement at the end.

## Why it bites

- Side effects in lambdas (logging, counters) run at surprising times, maybe several times.
- Exceptions appear at enumeration time, far from where the query was written.
- Disposing the source too early: returning a query over a `DbContext` or a file that's disposed before enumeration fails with `ObjectDisposedException`.

```csharp
IEnumerable<string> ReadLines()
{
    using var reader = File.OpenText("data.txt");
    return reader.ReadToEnd().Split('\n').Where(l => l.Length > 0);   // fine: ReadToEnd ran already
}
```

## Interview takeaways

- Most operators are deferred decorators; scalar results and `To*` conversions are immediate.
- Items stream one by one, except for buffering operators like `OrderBy` and `GroupBy`.
- Each enumeration re-runs the query; materialize with `ToList` when needed.
