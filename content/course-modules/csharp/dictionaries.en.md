A `Dictionary<TKey, TValue>` stores **pairs**: a unique key and the value attached to it. You ask for a value by its key, and the dictionary finds it quickly, without going through all the pairs. It is the right tool for a phone book, a word counter, a table of settings or a cache.

```csharp
var ages = new Dictionary<string, int>();
ages["Ann"] = 31;                 // add a new pair
ages["Bo"] = 25;
ages["Ann"] = 32;                 // the key exists: the value is replaced
Console.WriteLine(ages["Ann"]);   // 32
Console.WriteLine(ages.Count);    // 2
```

An initializer works too:

```csharp
var capitals = new Dictionary<string, string>
{
    { "Ukraine", "Kyiv" },
    { "Poland", "Warsaw" },
};
```

## Adding: the indexer and `Add`

| | Key already exists | Key is new |
| --- | --- | --- |
| `d[key] = value` | replaces the value | adds the pair |
| `d.Add(key, value)` | throws `ArgumentException` | adds the pair |

Use `Add` when a duplicate is a mistake that should fail loudly. Use the indexer when "set or replace" is what you want.

## Reading safely

Reading a key that does not exist throws `KeyNotFoundException`:

```csharp
Console.WriteLine(ages["Zed"]);   // KeyNotFoundException
```

There are two safe ways:

```csharp
if (ages.ContainsKey("Zed"))
{
    Console.WriteLine(ages["Zed"]);
}

if (ages.TryGetValue("Ann", out int age))     // one lookup instead of two
{
    Console.WriteLine(age);
}
```

`TryGetValue` returns whether the key was found and hands the value back through `out`. When the key is missing, the `out` value is the default (`0` for `int`).

## Removing

```csharp
ages.Remove("Bo");          // True if there was such a key
ages.Clear();               // removes everything
```

## Going through a dictionary

Each element is a `KeyValuePair`, with the properties `Key` and `Value`:

```csharp
foreach (KeyValuePair<string, int> pair in ages)
{
    Console.WriteLine(pair.Key + " is " + pair.Value);
}

foreach (string name in ages.Keys) { }       // only the keys
foreach (int value in ages.Values) { }       // only the values
```

**The order is not guaranteed.** Do not rely on pairs coming out in the order you added them. If you need an order, take the keys, put them in a list and sort it:

```csharp
var keys = new List<string>(ages.Keys);
keys.Sort(StringComparer.Ordinal);
foreach (string key in keys)
{
    Console.WriteLine(key + ": " + ages[key]);
}
```

As with a list, do not add or remove pairs during a `foreach` over the same dictionary.

## The counting pattern

The most common job for a dictionary is counting how many times each thing occurs:

```csharp
var counts = new Dictionary<char, int>();
foreach (char c in "banana")
{
    if (counts.ContainsKey(c)) counts[c]++;
    else counts[c] = 1;
}
// a: 3, b: 1, n: 2
```

## Grouping

When a key has **several** values, make the value a list:

```csharp
var byLetter = new Dictionary<char, List<string>>();
foreach (string word in new[] { "apple", "avocado", "banana" })
{
    char first = word[0];
    if (!byLetter.ContainsKey(first)) byLetter[first] = new List<string>();
    byLetter[first].Add(word);
}
// a: apple, avocado    b: banana
```

## Keys

- A key must be **unique** and must not be `null`.
- Strings are compared **exactly**: `"Ann"` and `"ann"` are different keys. For case-insensitive keys, pass a comparer: `new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)`.
- Use values that do not change as keys: numbers, strings, enums. A key that changes after it has been added cannot be found any more.
- The lookup is fast because the dictionary uses a **hash** of the key. That is why the time to find a key hardly depends on the size of the dictionary, in contrast with scanning a list.

## A set: only keys

If you only need to know whether a value **is present**, with no value attached, use a `HashSet<T>`:

```csharp
var seen = new HashSet<string>();
seen.Add("a");                 // True: it was added
seen.Add("a");                 // False: it was there already
Console.WriteLine(seen.Contains("a"));   // True
```

A set is perfect for removing duplicates and for the question "have I seen this?".
