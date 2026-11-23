Besides the big features, every version added smaller ones that you will see in every modern codebase.

## Tuples and deconstruction (C# 7)

```csharp
static (int Min, int Max) Range(int[] values) => (values.Min(), values.Max());

var (min, max) = Range(data);       // deconstruction into two variables
var r = Range(data);
Console.WriteLine(r.Min);           // named elements
(a, b) = (b, a);                    // swap without a temporary variable
var (_, maxOnly) = Range(data);     // _ discards a value
```

Tuples are value types (`ValueTuple`). Use them for private and internal results; for public APIs a record with named properties is clearer. Any type can be deconstructed if it has a `Deconstruct(out ..., out ...)` method.

## Local functions (C# 7)

A helper method declared inside another method. It is visible only there and can use the outer variables:

```csharp
static int CountValid(string[] lines)
{
    int count = 0;
    foreach (var line in lines)
        if (IsValid(line)) count++;
    return count;

    static bool IsValid(string s) => s.Length > 0 && s[0] != '#';   // static: captures nothing
}
```

## Indices and ranges (C# 8)

```csharp
int last = items[^1];             // ^1 is the first from the end
int[] middle = items[1..^1];      // all except the first and the last
string prefix = text[..3];        // the first three characters
```

## Less ceremony (C# 9–10)

```csharp
// Program.cs with top-level statements: no class Program, no Main
Console.WriteLine("Hello");

namespace Shop.Orders;            // file-scoped namespace: no braces, one level less indentation
global using System.Text.Json;    // one using for the whole project
List<int> numbers = new();        // target-typed new: the type is already on the left
```

New projects also have **implicit usings**: `System`, `System.Linq`, `System.Collections.Generic` and others are imported automatically.

## Raw string literals (C# 11)

Text with quotes and backslashes without escaping, convenient for JSON, SQL and regular expressions:

```csharp
string sql = """
    SELECT "Name" FROM "Users" WHERE "Folder" = 'C:\temp'
    """;
```

The indentation of the closing `"""` is removed from every line.

## Collection expressions (C# 12)

One syntax for arrays, lists, spans and other collections, with `..` to spread another collection:

```csharp
int[] a = [1, 2, 3];
List<int> b = [0, .. a, 4];      // 0 1 2 3 4
```

## Default interface methods (C# 8)

An interface can contain a method with a body. Old implementations get it for free, so a library can add a method to a published interface without breaking anybody:

```csharp
public interface ILogger
{
    void Log(string message);
    void LogError(string message) => Log("ERROR: " + message);   // a default implementation
}
```

## Extension members (C# 14)

Extension methods can now be grouped in an `extension` block, which also allows extension **properties**:

```csharp
public static class TextExtensions
{
    extension(string text)
    {
        public bool IsBlank => string.IsNullOrWhiteSpace(text);
        public string Shorten(int max) => text.Length <= max ? text : text[..max] + "…";
    }
}

if (title.IsBlank) { }
```

## The rule

You do not need to use every new feature, but you need to **read** all of them: modern code, documentation and interview tasks use them all the time.
