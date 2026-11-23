Pattern matching checks the **shape** of a value (its type, its properties, its range) and takes it apart in one expression.

## Type patterns (C# 7)

```csharp
if (shape is Circle c)              // check the type and get a typed variable at once
    Console.WriteLine(c.Radius);

switch (shape)
{
    case Circle c when c.Radius == 0:   // a type pattern with a condition
        return "a point";
    case Circle c:
        return "circle";
    case null:
        return "nothing";
    default:
        return "unknown";
}
```

In a `switch` statement the order of the cases matters: the first matching case wins, and the compiler reports an error if a case can never be reached because an earlier one already catches everything it would.

## Switch expressions (C# 8)

A `switch` that **returns a value**, with arms instead of `case` and `_` instead of `default`:

```csharp
string Describe(Shape shape) => shape switch
{
    Circle { Radius: 0 }                      => "a point",
    Circle c                                  => $"circle, area {Math.PI * c.Radius * c.Radius:F2}",
    Rectangle { Width: var w, Height: var h } when w == h => $"square {w}",
    Rectangle r                               => $"rectangle {r.Width} x {r.Height}",
    null                                      => "nothing",
    _                                         => "unknown shape",
};
```

If no arm matches, it throws `SwitchExpressionException`. The compiler warns when it can see that some inputs are not covered.

## The kinds of patterns

| Pattern | Example | Since |
|---|---|---|
| type | `Circle c`, `Circle` | C# 7, 9 |
| constant | `0`, `"admin"`, `null` | C# 7 |
| property | `{ Length: 0 }`, `{ Address.City: "Kyiv" }` | C# 8, 10 |
| positional (uses `Deconstruct`) | `Point(0, 0)` | C# 8 |
| tuple | `(true, false)` | C# 8 |
| relational | `> 0`, `<= 100` | C# 9 |
| logical | `>= 18 and < 65`, `not null`, `"Sat" or "Sun"` | C# 9 |
| list | `[]`, `[1, ..]`, `[var first, .., var last]` | C# 11 |
| discard | `_` | C# 8 |

Examples:

```csharp
string Category(int age) => age switch
{
    < 0           => throw new ArgumentOutOfRangeException(nameof(age)),
    < 18          => "child",
    >= 18 and < 65 => "adult",
    _             => "senior",
};

string Move(bool up, bool down) => (up, down) switch
{
    (true, false) => "up",
    (false, true) => "down",
    _             => "stay",
};

if (args is [var command, .. var rest])   // at least one item
    Run(command, rest);

if (user is not null) { }                 // cannot be fooled by an overloaded != operator
```

## Patterns or polymorphism?

Earlier in the course you replaced a type `switch` with virtual methods. Both tools have their place:

- **polymorphism** when the behaviour belongs to the classes, and new types are added often;
- **patterns** when the data comes from outside (messages, DTOs, JSON), the set of cases is fixed, and new **operations** are added often.

## The rule

Use `is` patterns for one check, switch expressions for choosing a value by the shape of the data, and order the arms from specific to general.
