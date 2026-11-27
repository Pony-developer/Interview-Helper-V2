---
skill: linq
title: "LINQ: deferred execution, operators and IQueryable"
summary: "Query and method syntax, deferred vs immediate execution and multiple enumeration, the operators interviews ask about (Select, SelectMany, GroupBy, Join, Any vs Count), IEnumerable vs IQueryable, and expression trees."
readingMinutes: 8
---

LINQ questions look simple and hide traps. Interviewers want to know when a query actually runs, what it costs, and where it runs: in memory or in the database.

## Two syntaxes, one query

```csharp
var adults = from p in people where p.Age >= 18 orderby p.Name select p.Name;
var same   = people.Where(p => p.Age >= 18).OrderBy(p => p.Name).Select(p => p.Name);
```

Query syntax compiles to the method calls. It reads better for joins and `let`; method syntax has every operator (`Take`, `Distinct`, `Chunk`…).

## Deferred execution

Most operators (`Where`, `Select`, `OrderBy`, `GroupBy`, `Take`…) don't run when you call them. They build a pipeline of iterators, and nothing happens until something **enumerates** it: `foreach`, `ToList()`, `ToArray()`, `Count()`, `First()`, `Sum()`.

```csharp
var list = new List<int> { 1, 2, 3 };
var big = list.Where(x => x > 1); // nothing runs yet
list.Add(4);
Console.WriteLine(big.Count());   // 3: the query sees the new element
```

Consequences:

- **Multiple enumeration**: enumerating the same `IEnumerable` twice runs the whole pipeline twice (and for a database query, sends two queries). Materialize with `ToList()` when you'll reuse the result.
- Exceptions inside a lambda surface where the query is enumerated, not where it was written.
- A lambda that captures a variable sees its value at enumeration time.

`Where`/`Select` **stream** items one by one; `OrderBy`, `GroupBy` and `Reverse` must **buffer** the whole source first.

## Operators worth knowing cold

- `Select` maps one to one; `SelectMany` flattens (orders → order lines).
- `GroupBy` returns groups with a `Key`; `ToLookup` does the same eagerly.
- `Join` is an inner join; a left join is `GroupJoin` + `SelectMany(... DefaultIfEmpty())`, or `LeftJoin` in .NET 10.
- `First` throws on an empty sequence, `FirstOrDefault` returns `default`; `Single` also throws when there is more than one match.
- `Any()` stops at the first element; `Count() > 0` may walk everything. Use `Any`.
- `Distinct`, `Union`, `Intersect`, `Except` use `Equals`/`GetHashCode`; the `...By` variants take a key selector.
- `Aggregate` is a general fold; `Sum`, `Min`, `Max`, `Average` are its common cases.

## IEnumerable vs IQueryable

`IEnumerable<T>` operators take **delegates** (`Func<T, bool>`) and run in your process. `IQueryable<T>` operators take **expression trees** (`Expression<Func<T, bool>>`): data structures that describe the code, which a provider such as Entity Framework translates into SQL.

```csharp
db.Orders.Where(o => o.Total > 100).ToList();               // WHERE in SQL
db.Orders.AsEnumerable().Where(o => o.Total > 100).ToList(); // loads every order, filters in memory
```

So the type of the variable decides where the filter runs. Methods the provider can't translate throw at run time in EF Core (instead of silently loading the table, as old EF did). Keep `IQueryable` until the query is complete, then materialize once. Watch for **N+1**: touching a navigation property in a loop issues one query per row; use `Include` or a projection with `Select`.

## Expression trees

An `Expression<Func<...>>` can be inspected, combined and compiled (`.Compile()`). That's how you build dynamic filters (combining predicates with `Expression.AndAlso`), and how ORMs, AutoMapper projections and validation libraries read your lambdas.

## Writing your own operator

LINQ to Objects is just extension methods over `IEnumerable<T>` with `yield return`:

```csharp
public static IEnumerable<T> WhereNot<T>(this IEnumerable<T> source, Func<T, bool> predicate)
{
    foreach (var item in source)
        if (!predicate(item)) yield return item;
}
```

Argument checks in an iterator method run only on enumeration; split the method in two (a checking wrapper and a local iterator function) to throw immediately.

## Interview checklist

- Explain deferred execution with an example where the source changes, and the cost of multiple enumeration.
- Know which operators stream and which buffer.
- Pick `Any` over `Count`, and explain `First` vs `Single` vs `...OrDefault`.
- Explain `IEnumerable` vs `IQueryable` and the N+1 problem.
- Write `Select` or `Where` yourself with `yield return`.
