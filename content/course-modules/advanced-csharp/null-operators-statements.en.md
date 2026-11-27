## The null operators

| Operator | Meaning | Example |
| --- | --- | --- |
| `??` | null-coalescing: left side unless it's null, then right side | `string name = input ?? "guest";` |
| `??=` | assign only if the variable is null (C# 8) | `cache ??= LoadCache();` |
| `?.` | null-conditional member access: if the left is null, the whole expression is null | `int? len = text?.Length;` |
| `?[]` | null-conditional indexer | `char? first = text?[0];` |

```csharp
string city = order?.Customer?.Address?.City ?? "unknown";
handler?.Invoke(this, EventArgs.Empty);   // the standard thread-safe way to raise an event
```

Note how `?.` changes the type: `text.Length` is `int`, but `text?.Length` is `int?`, because the result might be null.

## switch: statement and expression

The classic **statement** runs code per case:

```csharp
switch (command)
{
    case "start":
    case "run":
        Start();
        break;                 // every section must end in break, return, throw or goto
    case string s when s.StartsWith("stop"):
        Stop();
        break;
    default:
        Help();
        break;
}
```

The **switch expression** (C# 8) produces a value and is usually shorter:

```csharp
decimal fee = customer.Tier switch
{
    Tier.Gold => 0m,
    Tier.Silver => 2.5m,
    _ when amount > 1000 => 5m,
    _ => 10m,
};
```

If no arm matches, it throws `SwitchExpressionException`; the compiler warns you when the arms aren't exhaustive.

## Other statements worth knowing

- `foreach` works on anything with a `GetEnumerator()` method, not only on `IEnumerable`.
- `goto case` and `goto default` jump between switch sections.
- `using var file = File.OpenRead(path);` (C# 8): a **using declaration** disposes at the end of the enclosing block, without an extra pair of braces.

## Namespaces

```csharp
namespace Shop.Billing;            // C# 10 file-scoped: applies to the whole file

using static System.Math;          // call Sqrt(2) instead of Math.Sqrt(2)
using Json = System.Text.Json.JsonSerializer;   // alias a type or namespace
global using System.Linq;          // C# 10: applies to every file in the project
```

With `<ImplicitUsings>enable</ImplicitUsings>`, the SDK generates global usings for the most common namespaces (`System`, `System.Linq`, `System.Collections.Generic`, ...), which is why new .NET 6 projects have almost no `using` lines.

Name lookup goes from the innermost namespace outward. When two namespaces contain the same type name, qualify it fully, alias it, or use `global::` to start from the root: `global::System.String`.

## Interview takeaways

- `?.` short-circuits the whole chain and makes value results nullable.
- Prefer switch expressions when you compute a value; statements when each case does work.
- C# 10 file-scoped namespaces and global usings remove most of the per-file ceremony.
