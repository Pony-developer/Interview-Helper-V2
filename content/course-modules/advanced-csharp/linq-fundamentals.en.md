## The two ingredients

LINQ (Language-Integrated Query) works on **sequences** with **query operators**.

- A **sequence** is anything implementing `IEnumerable<T>` (local, in-memory data) or `IQueryable<T>` (a remote source such as a database).
- A **query operator** is a method that transforms a sequence: `Where`, `Select`, `OrderBy`, `GroupBy`, ... About 50 of them live as extension methods in `System.Linq.Enumerable` and `System.Linq.Queryable`.

```csharp
string[] names = { "Tom", "Dick", "Harry", "Mary", "Jay" };
IEnumerable<string> query = names.Where(n => n.Length >= 4);   // Dick, Harry, Mary
```

The input sequence is never modified; operators return new sequences.

## Fluent syntax: chaining operators

```csharp
var query = names
    .Where(n => n.Contains('a'))
    .OrderBy(n => n.Length)
    .Select(n => n.ToUpper());
// JAY, MARY, HARRY
```

Each operator wraps the previous sequence, forming a pipeline. The lambdas are the "plug-in" parts: `Where` takes a `Func<T, bool>`, `Select` a `Func<T, TResult>`, `OrderBy` a key selector `Func<T, TKey>`.

## Query expressions

The same query written with C#'s query syntax:

```csharp
var query =
    from n in names
    where n.Contains('a')
    orderby n.Length
    select n.ToUpper();
```

The compiler **translates query syntax into method calls**, purely syntactically: `where` → `.Where(...)`, `orderby` → `.OrderBy(...)`, `select` → `.Select(...)`. A query expression must start with `from` and end with `select` or `group`.

| Prefer fluent syntax for | Prefer query syntax for |
| --- | --- |
| a single operator or short chain | queries with `let`, several `from` clauses (SelectMany) or `join` |
| operators with no query keyword (`Take`, `Distinct`, `Count`, `First`, `ToList`) | complex queries where range variables must stay in scope |

You can mix them: `(from n in names where n.Length > 3 select n).Count()`.

## Range variables

In `from n in names`, `n` is a **range variable**: it represents each element as it flows through the query. In fluent syntax every lambda declares its own parameter, so variables don't carry across operators; in query syntax they do, which is why `let` and `join` read more naturally there.

## Common operators at a glance

| Category | Operators |
| --- | --- |
| Filtering | `Where`, `Take`, `Skip`, `TakeWhile`, `SkipWhile`, `Distinct` |
| Projection | `Select`, `SelectMany` |
| Joining | `Join`, `GroupJoin`, `Zip` |
| Ordering | `OrderBy`, `ThenBy`, `Reverse` |
| Grouping | `GroupBy`, `ToLookup` |
| Set | `Union`, `Intersect`, `Except`, `Concat` |
| Element | `First`, `Last`, `Single`, `ElementAt` (+ `OrDefault`) |
| Aggregation | `Count`, `Sum`, `Min`, `Max`, `Average`, `Aggregate` |
| Quantifiers | `Any`, `All`, `Contains`, `SequenceEqual` |
| Conversion | `ToList`, `ToArray`, `ToDictionary`, `ToHashSet`, `Cast`, `OfType` |

## Interview takeaways

- LINQ = sequences + operators (extension methods on `IEnumerable<T>`/`IQueryable<T>`).
- Query syntax is compiled into method calls; both forms are equivalent.
- Operators never modify the input; they return new sequences.
