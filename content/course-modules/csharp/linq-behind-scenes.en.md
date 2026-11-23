LINQ looks like magic, but the mechanism is simple: each method is an **iterator** built with `yield return`, and a query is a chain of such iterators, one wrapped around the previous one. Reading the result pulls items through the whole chain.

## How Where works, roughly

```csharp
static IEnumerable<T> MyWhere<T>(IEnumerable<T> source, Func<T, bool> keep)
{
    foreach (T item in source)
    {
        if (keep(item))
        {
            yield return item;
        }
    }
}
```

`Where` is almost exactly this. Nothing is filtered when `Where` is called; the loop runs only when the caller starts reading.

## Deferred execution

```csharp
var numbers = new List<int> { 1, 2, 3 };
var big = numbers.Where(n => n > 1);          // nothing has run

numbers.Add(10);                              // the source changes
Console.WriteLine(big.Count());               // 3: 2, 3 and 10, read now
```

The query runs **each time** it is read. Two `foreach` loops over `big` run the filter twice. Store the result with `ToList()` when you need a fixed snapshot.

## Captured variables

A LINQ lambda can use a variable from outside (the closure lecture explained this). The variable is read at the moment the query runs, not when the query was written:

```csharp
int limit = 2;
var q = numbers.Where(n => n > limit);
limit = 9;
Console.WriteLine(q.Count());                 // uses limit = 9
```

## Costs that are hidden

- A query with `Where` on a large file reads the file every time it is enumerated.
- `Count()` on a `Where` query reads everything, even if you only need to know "is there any".
- `GroupBy`, `OrderBy` and `ToLookup` read the whole source before they give their first item.

## IQueryable

With a database, the same methods can work on `IQueryable`. The query is then translated to SQL and executed by the database, as the lecture about `IEnumerable` and `IQueryable` explained. The code looks the same, but the work happens elsewhere.

## Rules of thumb

1. Read a query once into a list, when the results are needed more than once.
2. Do not change the source in the middle of building a query, unless you want the change to appear in the results.
3. Prefer one pass over several: `Any`, `Count`, `Sum` each read the whole sequence.
