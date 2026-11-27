## Where patterns appear

Patterns test a value's shape. You can use them in three places:

```csharp
if (x is <pattern>) ...                       // is expression
switch (x) { case <pattern>: ... }            // switch statement
var r = x switch { <pattern> => ..., ... };    // switch expression (C# 8)
```

## Type pattern and declaration pattern

```csharp
object o = GetValue();

if (o is string s)                  // test type AND assign to a new variable
    Console.WriteLine(s.Length);

if (o is int)                       // type only (C# 9: plain type pattern)
    Console.WriteLine("an int");
```

The variable `s` is **definitely assigned only where the pattern is known to have matched**. Combined with `!`, it's handy for early exits:

```csharp
if (o is not string text) return;
Console.WriteLine(text.ToUpper());  // text is in scope and assigned here
```

## Constant pattern

```csharp
if (code is 404) ...
if (status is OrderStatus.Cancelled) ...
if (o is null) ...                  // the most common one
```

`is null` and `is not null` can't be redirected by an overloaded `==` operator, which makes them the most reliable null checks.

## Relational patterns (C# 9)

```csharp
string Grade(int score) => score switch
{
    >= 90 => "A",
    >= 75 => "B",
    >= 60 => "C",
    _ => "F",
};
```

Allowed with `<`, `<=`, `>`, `>=` against a constant.

## Logical patterns (C# 9): and, or, not

```csharp
bool IsLetter(char c) => c is >= 'a' and <= 'z' or >= 'A' and <= 'Z';
bool IsWeekend(DayOfWeek d) => d is DayOfWeek.Saturday or DayOfWeek.Sunday;
if (input is not (null or "")) ...
```

Precedence: `not` binds tightest, then `and`, then `or`. Use parentheses for clarity.

## The var pattern and discards

```csharp
if (GetOrder() is var order && order.Total > 100) ...   // var always matches, even null
case _: ...                                            // discard: matches anything
```

The var pattern is useful to name the result of an expression mid-condition.

## switch statement with patterns and guards

```csharp
switch (shape)
{
    case Circle c when c.Radius == 0:      // 'when' adds a guard condition
        Console.WriteLine("a point");
        break;
    case Circle c:
        Console.WriteLine($"circle r={c.Radius}");
        break;
    case Rectangle { Width: var w, Height: var h } when w == h:
        Console.WriteLine("square");
        break;
    case null:
        throw new ArgumentNullException(nameof(shape));
    default:
        Console.WriteLine("something else");
        break;
}
```

With patterns, **order matters**: cases are tested top to bottom, and the compiler reports cases that can never be reached.

## Interview takeaways

- `is T x` tests and casts in one step; prefer it to `as` + null check.
- Relational and logical patterns (C# 9) turn range checks into readable one-liners.
- `is null` / `is not null` ignore operator overloads.
