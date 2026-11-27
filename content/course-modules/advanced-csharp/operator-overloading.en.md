## Making your types feel built in

Operator overloading lets a type define what `+`, `==`, `<` and friends mean for it. It suits types that model mathematical or value-like concepts: money, vectors, matrices, fractions, time ranges.

```csharp
public readonly struct Money : IEquatable<Money>
{
    public decimal Amount { get; }
    public string Currency { get; }
    public Money(decimal amount, string currency) { Amount = amount; Currency = currency; }

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency) throw new InvalidOperationException("Currency mismatch");
        return new Money(a.Amount + b.Amount, a.Currency);
    }

    public static Money operator *(Money m, decimal factor) => new(m.Amount * factor, m.Currency);
    public static Money operator -(Money m) => new(-m.Amount, m.Currency);   // unary
}
```

## Rules

- Operators are `public static` methods named `operator X`. At least one parameter must be the containing type.
- **Overloadable**: unary `+ - ! ~ ++ -- true false`, binary `+ - * / % & | ^ << >>`, comparisons `== != < > <= >=`.
- **Not overloadable**: `&& || ?: ?? = . new is as typeof`, and the indexer `[]` (use an indexer instead).
- Compound assignments (`+=`) come for free from the binary operator.
- `&&` and `||` work automatically if you overload `&`, `|`, `true` and `false`.

## Comparison operators come in pairs

The compiler requires `==` with `!=`, `<` with `>`, `<=` with `>=`. And if you overload `==`, you should also:

- override `Equals(object)` and `GetHashCode()` with the same logic;
- implement `IEquatable<T>` (avoids boxing for structs);
- for ordering, implement `IComparable<T>` too.

```csharp
public static bool operator ==(Money a, Money b) => a.Equals(b);
public static bool operator !=(Money a, Money b) => !a.Equals(b);
public bool Equals(Money other) => Amount == other.Amount && Currency == other.Currency;
public override bool Equals(object? obj) => obj is Money m && Equals(m);
public override int GetHashCode() => HashCode.Combine(Amount, Currency);
```

For **classes**, remember that `==` must handle null on either side without recursion: use `ReferenceEquals(a, null)` or `a is null` inside the operator.

## Custom conversions

```csharp
public readonly struct Celsius
{
    public double Degrees { get; }
    public Celsius(double degrees) => Degrees = degrees;

    public static implicit operator Celsius(double d) => new(d);             // safe, lossless
    public static explicit operator Fahrenheit(Celsius c) => new(c.Degrees * 9 / 5 + 32);   // a real transformation
}

Celsius room = 21.5;                 // implicit
var f = (Fahrenheit)room;            // explicit cast required
```

Make a conversion **implicit** only if it never throws and never loses information; otherwise **explicit**. Custom conversions are ignored by `as` and `is`.

## The checked operators (C# 11 preview)

From C# 11 you can define `checked` versions of arithmetic operators that throw on overflow. In C# 10 there's a single version.

## Good taste

- Overload operators only where the meaning is **obvious** (`+` for adding money is clear; `+` to "add an order to a customer" isn't).
- Keep them consistent with each other: `a - b == a + (-b)`, `a < b` iff `b > a`.
- Don't make them do I/O or have side effects.

## Interview takeaways

- `public static T operator +(T a, T b)`; at least one operand of the declaring type.
- Comparison operators in pairs; `==` implies overriding `Equals` and `GetHashCode`.
- Implicit conversions must be lossless and never throw.
