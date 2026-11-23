`Dictionary<TKey, TValue>` stores pairs: a key and a value. You look up a value by its key, in about the same time no matter how many pairs there are:

```csharp
var ages = new Dictionary<string, int>();
ages.Add("Ann", 30);
ages["Bob"] = 25;                        // adds or replaces

Console.WriteLine(ages["Ann"]);          // 30
Console.WriteLine(ages.ContainsKey("Cy"));   // False

int age;
if (ages.TryGetValue("Bob", out age))    // safe lookup, no exception
{
    Console.WriteLine(age);              // 25
}

ages.Remove("Ann");
```

## Errors and safe access

- `ages["Cy"]` throws a `KeyNotFoundException` when the key is missing. Check with `ContainsKey` or use `TryGetValue`.
- `Add` throws if the key already exists. The indexer `ages[key] = value` replaces it instead.
- Keys must be unique. The values do not have to be.

## The cost

Lookup, insertion and removal take **O(1)** on average, because the key's hash code points to the bucket. The lookup needs `GetHashCode` and `Equals` of the key, which is why key types must define both correctly (the next lectures show how).

## Order

The order in which a `foreach` returns the pairs is **not guaranteed** and may change after removals. Do not rely on it. If you need a sorted order, sort the keys first, or use `SortedDictionary`.

```csharp
foreach (KeyValuePair<string, int> pair in ages)
{
    Console.WriteLine(pair.Key + " " + pair.Value);
}
```
