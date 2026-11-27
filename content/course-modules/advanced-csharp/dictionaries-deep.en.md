## Dictionary<TKey, TValue>

```csharp
var stock = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
{
    ["pen"] = 10,
    ["ink"] = 0,
};

stock["pad"] = 7;                       // add or overwrite
stock.Add("pen", 1);                    // ArgumentException: key exists
int pens = stock["pen"];                // KeyNotFoundException if missing
if (stock.TryGetValue("cap", out int caps)) { }   // the idiomatic lookup
stock.TryAdd("cap", 3);                 // .NET Core 2.0+: false if present
stock.Remove("ink", out int removed);   // .NET Core 2.0+
foreach (var (key, value) in stock) { } // KeyValuePair deconstruction
```

Avoid the double lookup `if (d.ContainsKey(k)) x = d[k];`; use `TryGetValue`. For update-in-place, .NET 6 has `CollectionsMarshal.GetValueRefOrAddDefault(dict, key, out bool exists)`, which returns a `ref` to the value slot.

## How hashing works

1. `GetHashCode()` of the key (through the dictionary's `IEqualityComparer<TKey>`) picks a **bucket**: `hash % bucketCount`.
2. Each bucket points to a chain of entries; the dictionary walks it, comparing with `Equals`.
3. When the number of entries reaches the capacity, the dictionary **resizes** to roughly double (a prime size) and rehashes everything: O(n) once, O(1) amortized.

Consequences:

- Lookups are O(1) **on average**. A bad hash function (say, always returning 0) degrades them to O(n).
- **Keys must not change** in a way that affects `GetHashCode` while in the dictionary; the entry becomes unreachable.
- Iteration order is **not guaranteed**. In practice it's insertion order until you remove items, but never rely on that.
- `string` hashing is **randomized per process** in .NET Core (to resist hash-flooding attacks), so never persist `string.GetHashCode()` values.

## Writing a good GetHashCode

```csharp
public override int GetHashCode() => HashCode.Combine(Country, PostalCode, Street);
```

`HashCode.Combine` (.NET Core 2.1+) mixes up to eight values well. Requirements: equal objects → equal hashes; computed from immutable data; cheap.

## The sorted dictionaries

| Type | Structure | Insert / remove | Lookup | Memory | Index access |
| --- | --- | --- | --- | --- | --- |
| `Dictionary` | hash table | O(1) | O(1) | moderate | no |
| `SortedDictionary` | red-black tree | O(log n) | O(log n) | more (nodes) | no |
| `SortedList` | two sorted arrays | O(n) | O(log n) | least | yes (`Keys[i]`) |

Use `SortedList` for data that is built once (or appended in order) and read a lot; `SortedDictionary` for frequent inserts in random order.

## Other dictionaries

- `ConcurrentDictionary<K,V>`: thread-safe, with `GetOrAdd` and `AddOrUpdate`. The value factory may run more than once under contention.
- `ImmutableDictionary<K,V>` and .NET 8's `FrozenDictionary<K,V>`: read-optimized, never change.
- `OrderedDictionary` (non-generic, legacy): keeps insertion order with index access.
- `Lookup<K,V>` (from LINQ's `ToLookup`): one key → many values; a missing key returns an empty sequence instead of throwing.

## Interview takeaways

- O(1) average lookup via hash → bucket → `Equals`; depends on a good, stable `GetHashCode`.
- Use `TryGetValue`/`TryAdd`; never rely on enumeration order.
- `SortedDictionary` = tree, `SortedList` = arrays; pick by insert pattern.
