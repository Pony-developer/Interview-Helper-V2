`Equals` decides whether two objects are equal. Its default behaviour is weak: for a class, it compares **references**, which means "is it the same object". For value-like classes we need to override it, so that it compares the **contents**:

```csharp
class Point
{
    public int X;
    public int Y;

    public override bool Equals(object obj)
    {
        Point other = obj as Point;      // null if obj is not a Point
        if (other == null) return false;
        return X == other.X && Y == other.Y;
    }

    public override int GetHashCode()
    {
        return X * 31 + Y;               // must agree with Equals (the next lectures explain why)
    }
}

var a = new Point { X = 1, Y = 2 };
var b = new Point { X = 1, Y = 2 };
Console.WriteLine(a.Equals(b));          // True
Console.WriteLine(a == b);               // False: == still compares references, see below
```

## The rules of a correct Equals

- **Reflexive:** `a.Equals(a)` is `true`.
- **Symmetric:** `a.Equals(b)` gives the same answer as `b.Equals(a)`.
- **Transitive:** if `a` equals `b`, and `b` equals `c`, then `a` equals `c`.
- **Consistent:** the answer does not change while the objects do not change.
- **Null-safe:** `a.Equals(null)` is `false`, and it never throws.

The check `obj as Point` followed by `if (other == null)` handles the last two rules.

## Equals and ==

`Equals` and `==` are separate. Unless you define the operator `==`, a class uses reference comparison for `==`. The list, `Contains` and dictionaries call `Equals`, so `Contains` now finds the equal point. The `==` operator is the subject of the next lectures.
