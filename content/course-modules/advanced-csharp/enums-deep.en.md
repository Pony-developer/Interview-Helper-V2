## Enums are named integers

```csharp
public enum OrderStatus : byte     // underlying type: int by default; any integral type allowed
{
    Draft = 0,
    Placed = 1,
    Shipped = 2,
    Cancelled = 9,
}
```

An enum value is just its underlying number with a type attached. That has consequences:

```csharp
int n = (int)OrderStatus.Shipped;          // 2
var s = (OrderStatus)9;                    // Cancelled
var weird = (OrderStatus)42;               // compiles AND runs: no validation!
Console.WriteLine(weird);                  // "42"
Console.WriteLine(Enum.IsDefined(typeof(OrderStatus), weird));   // False
```

Always validate enum values that come from outside (an API request, a database, a file).

`default(OrderStatus)` is `0`, whether or not you named a member 0. Give the zero value a meaningful name such as `None` or `Unknown`.

## Flags enums

When values can be combined, use powers of two and `[Flags]`:

```csharp
[Flags]
public enum FileAccessRights
{
    None    = 0,
    Read    = 1 << 0,   // 1
    Write   = 1 << 1,   // 2
    Execute = 1 << 2,   // 4
    ReadWrite = Read | Write,   // composite values are fine
}

var rights = FileAccessRights.Read | FileAccessRights.Execute;   // combine
bool canWrite = (rights & FileAccessRights.Write) != 0;          // test one flag
bool hasBoth = (rights & FileAccessRights.ReadWrite) == FileAccessRights.ReadWrite;  // test all
rights |= FileAccessRights.Write;                                // add
rights &= ~FileAccessRights.Execute;                             // remove
rights ^= FileAccessRights.Read;                                 // toggle
Console.WriteLine(rights);                                       // "Write"
```

`[Flags]` changes `ToString()` and `Enum.Parse` so that combinations show as `"Read, Execute"`. `HasFlag` reads nicely and is fast on modern .NET.

## Useful Enum APIs

```csharp
Enum.GetValues<OrderStatus>();                    // all values (generic version: .NET 5+)
Enum.GetNames(typeof(OrderStatus));               // all names
Enum.TryParse<OrderStatus>("shipped", ignoreCase: true, out var st);
OrderStatus.Placed.ToString("D");                 // "1" (format: G name, D decimal, X hex, F flags)
```

## Enum operators

Enums support comparison (`<`, `>`), `+`/`-` with an integer, and the bitwise operators `&`, `|`, `^`, `~`. They don't convert implicitly to or from integers, except the literal `0`.

## When not to use an enum

If each case needs its own data or behavior, a set of classes (or a `switch` on records) is often clearer than an enum plus `switch` statements scattered across the codebase.

## Interview takeaways

- Enums are typed integers; casting any number in is legal, so validate input.
- Flags: powers of two, `[Flags]`, combine with `|`, test with `&`, remove with `& ~`.
- Always give `0` a name.
