`ToDictionary` and `ToLookup` turn a sequence into a fast lookup table. Both need a key for each item; they differ in what happens when a key appears twice.

```csharp
var words = new[] { "pear", "fig", "apple" };

Dictionary<string, int> lengths = words.ToDictionary(w => w, w => w.Length);
Console.WriteLine(lengths["apple"]);          // 5
```

The first lambda gives the key, the second the value. The result is a `Dictionary`, so lookups are fast, the way the earlier lecture on dictionaries explained.

## Duplicate keys

A dictionary cannot hold the same key twice:

```csharp
var names = new[] { "Ann", "Bob", "Ann" };
// names.ToDictionary(n => n, n => 1);       // ArgumentException: an item with the same key has already been added
```

Remove the duplicates first (`Distinct()`), or use `ToLookup`.

## ToLookup: one key, many values

`ToLookup` builds a structure like a dictionary whose values are **groups**. Several items may share one key, and a missing key gives an empty group, not an exception:

```csharp
var byLength = words.ToLookup(w => w.Length);
foreach (string w in byLength[4])            // pear, and nothing else has length 4
{
    Console.WriteLine(w);
}
Console.WriteLine(byLength[9].Count());       // 0: a missing key gives an empty sequence
```

The difference from `GroupBy` is that a `Lookup` is built **at once** and can be searched by key many times, while a `GroupBy` is a sequence that you read once.

## Choosing

| Need | Use |
|---|---|
| One value per key, and keys are unique | `ToDictionary` |
| Several values per key, search by key | `ToLookup` |
| Groups, read once, in a sequence | `GroupBy` |

## Keys must be good

Both methods use `GetHashCode` and `Equals` of the key (the lectures about hashing and `Equals` explain why). If the key is a class without proper equality, the lookup will not find what you expect.
