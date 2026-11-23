Some objects must **never change** after creation: a date, a point, a fraction, a price. The keyword **`readonly`** on a field says exactly this: it can be assigned **once**, in the declaration or in a constructor, and never again.

```csharp
class Fraction
{
    private readonly int numerator;                    // readonly fields
    private readonly int denominator;

    public Fraction(int numerator, int denominator)
    {
        this.numerator = numerator;                    // allowed: inside a constructor
        this.denominator = denominator;
    }

    public int Numerator => numerator;
    public int Denominator => denominator;

    public void Reduce()
    {
        // numerator = 1;                              // error CS0191: a readonly field cannot be assigned to
    }
}
```

The compiler **enforces** it. The shorter way to get the same effect is a get-only auto-property, which has a hidden readonly field:

```csharp
public int Numerator { get; }                          // assigned in the constructor only
```

## Immutable objects

A class where **all** the fields are `readonly` and no method changes them gives **immutable** objects. The operations return **new** objects:

```csharp
class Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency) { Amount = amount; Currency = currency; }

    public Money Plus(Money other)                       // a new object, not a change
    {
        if (other.Currency != Currency) throw new ArgumentException("Different currencies");
        return new Money(Amount + other.Amount, Currency);
    }

    public Money WithAmount(decimal amount) { return new Money(amount, Currency); }
}
```

`string`, `DateTime` and numbers work in exactly this way: `s.ToUpper()` does not change `s`, it gives a new string.

Why is it good?

- **The invariants are checked once**, in the constructor, and cannot be broken later. There is no "set" to guard.
- It is **safe to share**: if ten parts of the program hold the same `Money`, nobody can change it for the others.
- It is easy to **think about**: the object is the same at every moment of its life, so there are no "who changed it?" questions.
- Safe for use as a **key** of a dictionary, because the data that the hash depends on never changes.
- Safe in **several threads**.

The price is a new object for each change, which is cheap for small objects.

## `readonly` is shallow

`readonly` protects the **variable**, not the **object** that it points to:

```csharp
class Team
{
    private readonly List<string> members = new List<string>();   // the variable is fixed...

    public void Add(string name) { members.Add(name); }           // ...but the list is not
}
```

You cannot write `members = new List<string>()` again, but you can still change the contents of the list. For a really immutable class, **do not give out the inner collection** and keep a copy:

```csharp
public string[] Members => members.ToArray();      // a copy: the outside code cannot change the list
```

`ToArray` is a method of `List<T>`. Returning the list itself (`return members;`) would break the encapsulation, because the caller could add and remove items without any check.

## `readonly` and `const`

- **`const`**: a value known at **compile time**, the same for all (`const int DaysInWeek = 7;`). Only numbers, strings and similar.
- **`readonly`**: a value that is set at **run time**, in a constructor, and can differ for each object (an object of any type).

## When not to make a class immutable

When an object is large and changes often (a big game field, a buffer), copying on every change is wasteful. Then use a mutable class, but make **all changes pass through methods** that keep the invariants.
