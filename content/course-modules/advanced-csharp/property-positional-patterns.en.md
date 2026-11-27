## Property patterns (C# 8)

A property pattern checks that a value is **not null** and that its properties match sub-patterns:

```csharp
if (order is { Status: OrderStatus.Paid, Total: > 1000 })
    FlagForReview(order);

if (person is { Address: { Country: "UA" } }) ...
if (person is { Address.Country: "UA" }) ...     // C# 10 extended property pattern: same thing
```

`{ }` alone means "not null": `if (x is { } nonNull)` is a way to test and name a non-null value.

Sub-patterns can be anything: constants, relational, type patterns, nested property patterns, or `var` to capture:

```csharp
if (request is { Headers.Count: > 0, Body: string { Length: var len } } && len < 10_000) ...
```

## Positional patterns (C# 8)

A type with a `Deconstruct` method (records, tuples, your own classes) can be matched by position:

```csharp
public record Point(int X, int Y);

string Quadrant(Point p) => p switch
{
    (0, 0) => "origin",
    (> 0, > 0) => "I",
    (< 0, > 0) => "II",
    (< 0, < 0) => "III",
    (> 0, < 0) => "IV",
    _ => "on an axis",
};
```

### Tuple patterns

Switching on a tuple makes multi-variable decisions compact:

```csharp
string Play(string a, string b) => (a, b) switch
{
    ("rock", "scissors") or ("scissors", "paper") or ("paper", "rock") => "first wins",
    var (x, y) when x == y => "draw",
    _ => "second wins",
};
```

## switch expressions in practice

```csharp
decimal ShippingCost(Order o) => o switch
{
    { Total: >= 100 } => 0m,
    { Destination.Country: "UA", Weight: <= 1 } => 3m,
    { Destination.Country: "UA" } => 5m,
    { IsExpress: true } => 25m,
    _ => 15m,
};
```

Rules:

- arms are evaluated **top to bottom**; the first match wins;
- the compiler warns when the arms don't cover every input (non-exhaustive) and errors on arms that can never match (subsumed);
- an unmatched input throws `SwitchExpressionException` at run time;
- each arm is an expression; to run statements, use a switch statement or call a method.

## Patterns vs polymorphism

Pattern matching over types is the functional style: data types are simple, and operations live in `switch` expressions. Virtual methods are the OO style: operations live in the types. Rule of thumb:

- the set of **types is fixed** but operations keep growing (an AST, a set of commands, message types) → patterns;
- **operations are fixed** but new types keep arriving (plug-ins, UI controls) → virtual methods.

## C# 11 preview: list patterns

Not in C# 10, but worth knowing: `if (args is [var first, .., var last])` matches arrays and lists by shape.

## Interview takeaways

- `{ Prop: pattern }` checks non-null + property values; C# 10 lets you write `A.B.C: value`.
- Positional patterns use `Deconstruct`; tuple patterns combine several values.
- switch expressions are first-match-wins, checked for exhaustiveness and unreachable arms.
