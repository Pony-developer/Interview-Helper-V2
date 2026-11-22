Arrays have a fixed size. For data that grows, and for looking things up by key, use the collections in `System.Collections.Generic`.

## List&lt;T&gt;

```csharp
var cities = new List<string> { "Kyiv", "Lviv" };
cities.Add("Odesa");
cities.Remove("Lviv");
Console.WriteLine(cities.Count);       // 2
Console.WriteLine(cities.Contains("Kyiv")); // True
```

## Dictionary&lt;TKey, TValue&gt;

A dictionary maps unique keys to values, and finds a key in constant time on average:

```csharp
var ages = new Dictionary<string, int>();
ages["Ann"] = 31;                      // add or replace
if (ages.ContainsKey("Bo")) { /* ... */ }
if (ages.TryGetValue("Ann", out var age))
    Console.WriteLine(age);            // 31
```

Reading `ages["Bo"]` for a missing key throws a `KeyNotFoundException`. Check first, or use `TryGetValue`. Don't rely on the order in which a dictionary lists its keys; keep a separate list when order matters.

## Strings

Strings are **immutable**: methods return a new string and leave the original as it is.

```csharp
var s = "  Hello, World  ";
s.Trim();                    // "Hello, World"
s.ToLower();                 // "  hello, world  "
"a,b,c".Split(',');          // { "a", "b", "c" }
string.Join("-", new[] { "a", "b" }); // "a-b"
"assay".Substring(1, 3);     // "ssa"
var name = "Ann";
Console.WriteLine($"Hi, {name}!");   // interpolation
```

Building a long string with `+` in a loop creates a new string each time. For many pieces, use `StringBuilder`.

## Files

`System.IO.File` reads and writes whole files in one call:

```csharp
File.WriteAllText("notes.txt", "first line");
string[] lines = File.ReadAllLines("notes.txt");
```

The online runner used in this course has no files of yours, so the practice tasks work with strings in memory. The same code works on files on your own machine.
