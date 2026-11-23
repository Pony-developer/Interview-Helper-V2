`GroupBy` splits a sequence into **groups** that share a key. Each group knows its key and holds its items:

```csharp
var words = new[] { "pear", "fig", "apple", "plum", "kiwi" };

var groups = words.GroupBy(w => w.Length);

foreach (IGrouping<int, string> g in groups)
{
    Console.WriteLine(g.Key + ": " + string.Join(", ", g));
}
// 4: pear, plum, kiwi
// 3: fig
// 5: apple
```

The key is what the lambda returns (the length). The groups appear in the order of their first item. Each group is an `IGrouping<TKey, TElement>`: a sequence with a `Key` property.

## Counting per group

```csharp
var counts = words.GroupBy(w => w.Length).Select(g => new { Length = g.Key, Count = g.Count() });
// Length 4: 3, Length 3: 1, Length 5: 1
```

## Grouping the first letter

A very common use is grouping items by their first letter, for a list in alphabetical sections:

```csharp
var byLetter = words.GroupBy(w => w[0]);
foreach (var g in byLetter.OrderBy(g => g.Key))
{
    Console.WriteLine(g.Key + ": " + string.Join(" ", g));
}
```

## Grouping is not sorting

Groups appear in the order their keys were **first seen**, not in alphabetical order. Add `OrderBy` if you want a sorted order, as in the last example.

## Cost

`GroupBy` reads the whole sequence and keeps the groups in memory. Unlike `Where`, it cannot give the first group before it has read the last item. This is why grouping is not lazy in the same way as filtering.
