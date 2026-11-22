Programs make decisions with conditions: expressions of type `bool`, which are either `true` or `false`.

## Comparison and logic

```csharp
int age = 20;
bool adult = age >= 18;              // == != < <= > >=
bool teen = age >= 13 && age <= 19;  // && and, || or, ! not
```

`&&` and `||` **short-circuit**: in `a && b`, `b` is not evaluated when `a` is already `false`. That lets you write `s.Length > 0 && s[0] == '#'` safely.

## if and else

```csharp
if (temperature > 30)
    Console.WriteLine("Hot");
else if (temperature > 15)
    Console.WriteLine("Mild");
else
    Console.WriteLine("Cold");
```

Branches are checked from top to bottom, and only the first matching one runs. Use braces `{ }` when a branch has more than one statement; many teams use them always.

## The conditional operator

For choosing between two values, `condition ? a : b` is shorter than an `if`:

```csharp
var label = count == 1 ? "item" : "items";
```

## switch

When one value is compared with many constants, `switch` reads better:

```csharp
switch (day)
{
    case "Sat":
    case "Sun":
        Console.WriteLine("Weekend");
        break;
    default:
        Console.WriteLine("Weekday");
        break;
}
```

Each section ends with `break` (or `return`); C# does not let execution fall through to the next case.
