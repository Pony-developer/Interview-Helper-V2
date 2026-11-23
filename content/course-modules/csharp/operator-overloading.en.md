You already saw operators in the vector practice. An operator is a **static method** with a special name, and the compiler calls it when the expression uses that operator:

```csharp
class Money
{
    public decimal Amount { get; }

    public Money(decimal amount) { Amount = amount; }

    public static Money operator +(Money a, Money b)
    {
        return new Money(a.Amount + b.Amount);
    }

    public static bool operator ==(Money a, Money b)
    {
        if (ReferenceEquals(a, b)) return true;
        if (ReferenceEquals(a, null) || ReferenceEquals(b, null)) return false;
        return a.Amount == b.Amount;
    }

    public static bool operator !=(Money a, Money b)
    {
        return !(a == b);
    }
}

var total = new Money(5) + new Money(7);     // calls operator +
Console.WriteLine(total.Amount);             // 12
Console.WriteLine(new Money(3) == new Money(3));   // True: calls operator ==
```

## The rules

- The operator is `public static`, and it takes the operands as parameters. Its return type is free: `+` on two `Money` gives `Money`, `==` gives `bool`.
- At least one parameter must be of the containing type.
- Some operators come in **pairs**: `==` and `!=`, `<` and `>`, `<=` and `>=`. If you define one, the compiler requires the other.
- You cannot invent new operators or change their number of operands. You cannot overload `=`, `.`, `&&`, `||`, or `[]` (indexers are a different feature).

## Operators do not have to be overloaded

`==` on a class does nothing unless you define it: the default is the reference comparison. The same is true for `+`. Defining an operator is a promise that the operation has the meaning people expect, so define it only when that meaning is clear.

## Compound assignment

If you define `+` but not `+=`, the expression `a += b` means `a = a + b`. You do not need to write `+=` yourself. The next lectures discuss when to overload operators at all.
