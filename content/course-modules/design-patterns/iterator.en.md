**In plain words:** Iterator gives you a way to **walk through a collection one item at a time** without knowing how the collection is stored inside: array, list, tree or a database page by page.

## A picture from life

A TV remote's "next channel" button. You don't need to know how channels are stored in the TV's memory; you just press "next" until you find something.

## In C#: built into the language

`IEnumerable<T>` is "something you can walk through"; `IEnumerator<T>` is the "finger" that points at the current item (`MoveNext()`, `Current`). `foreach` uses them for you.

And `yield return` writes the whole iterator for you:

```csharp
// Walk through a tree of business units without the caller knowing it's a tree
static IEnumerable<BusinessUnit> AllUnits(BusinessUnit root)
{
    yield return root;
    foreach (var child in root.Children)
        foreach (var unit in AllUnits(child))
            yield return unit;
}

foreach (var unit in AllUnits(company))
    Console.WriteLine(unit.Name);
```

## A real example: paging

Dataverse returns at most 5,000 records per request. An iterator can hide the paging:

```csharp
static IEnumerable<Entity> AllRecords(IOrganizationService service, QueryExpression query)
{
    query.PageInfo = new PagingInfo { PageNumber = 1, Count = 5000 };
    while (true)
    {
        var page = service.RetrieveMultiple(query);
        foreach (var record in page.Entities) yield return record;
        if (!page.MoreRecords) yield break;
        query.PageInfo.PageNumber++;
        query.PageInfo.PagingCookie = page.PagingCookie;
    }
}
```

The caller just writes `foreach (var account in AllRecords(service, query))`.

## Things to know

- **Lazy:** code after `yield return` runs only when the next item is asked for. LINQ is built on this (deferred execution).
- **Don't modify** a `List<T>` while `foreach`-ing over it: you get `InvalidOperationException`.
- Enumerating an `IEnumerable` twice may run the query twice. Call `.ToList()` if you need the results more than once.

## Remember

Iterator = "**give me the next one**", hiding how the items are stored. In C#: `IEnumerable<T>`, `foreach`, `yield return`.
