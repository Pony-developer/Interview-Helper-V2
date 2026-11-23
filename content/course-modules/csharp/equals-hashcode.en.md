When are two objects "the same"? For numbers it is clear: `3 == 3`. For objects there are **two different questions**:

- **Reference equality**: are these two variables **the same object** in memory?
- **Value equality**: do these two objects **have the same contents**, so that for the program they mean the same thing?

```csharp
class Point
{
    public int X { get; }
    public int Y { get; }
    public Point(int x, int y) { X = x; Y = y; }
}

var a = new Point(1, 2);
var b = new Point(1, 2);
var c = a;

Console.WriteLine(a == b);                  // False: two different objects
Console.WriteLine(a.Equals(b));             // False: the default Equals is also reference equality
Console.WriteLine(a == c);                  // True: the same object
```

For a class, both `==` and `Equals` compare **references** by default. Strings are the exception: `string` overrides both to compare **contents**, which is why `"ab" == "a" + "b"` is `true`.

## Overriding Equals

`Equals(object)` is a **virtual method** of `object`, so polymorphism works for it: `HashSet`, `List.Contains`, `Dictionary` and many others call it, and they get **your** version:

```csharp
public override bool Equals(object obj)
{
    Point other = obj as Point;                       // null if obj is not a Point, or is null
    if (ReferenceEquals(other, null)) return false;
    return X == other.X && Y == other.Y;              // the value equality
}
```

Now `a.Equals(b)` is `true`. The rules of a correct `Equals`:

- **reflexive**: `a.Equals(a)` is `true`;
- **symmetric**: `a.Equals(b)` is the same as `b.Equals(a)`;
- **transitive**: if `a` equals `b`, and `b` equals `c`, then `a` equals `c`;
- **consistent**: the answer does not change while the objects do not change;
- **`x.Equals(null)` is `false`**, and it must never throw.

## GetHashCode: always together with Equals

`HashSet<T>` and `Dictionary<K, V>` are fast because they use a **hash code**, a number made from the object. They first compare the hash codes, and call `Equals` only for the objects with the same code. The **contract**:

> If `a.Equals(b)` is `true`, then `a.GetHashCode()` **must be equal** to `b.GetHashCode()`.

The opposite is not required: different objects may have the same hash code (a "collision"), but a good hash spreads the objects evenly.

```csharp
public override int GetHashCode()
{
    unchecked                                         // overflow is fine for a hash
    {
        return X * 31 + Y;                            // combine the fields that Equals uses
    }
}
```

If you override `Equals` and forget `GetHashCode` (the compiler warns you), then two equal points land in **different** cells of a hash table, and a `HashSet` happily holds both of them.

```csharp
var set = new HashSet<Point> { new Point(1, 2), new Point(1, 2), new Point(2, 1) };
Console.WriteLine(set.Count);                         // 2 with both overrides; 3 without GetHashCode
```

Use for the hash **exactly the fields that `Equals` compares**, and no others.

## The operators == and !=

If you want `a == b` to compare the values as well, overload the operators (**in a pair**), and handle `null` **without** recursion:

```csharp
public static bool operator ==(Point a, Point b)
{
    if (ReferenceEquals(a, b)) return true;           // the same object, or both null
    if (ReferenceEquals(a, null) || ReferenceEquals(b, null)) return false;
    return a.X == b.X && a.Y == b.Y;
}

public static bool operator !=(Point a, Point b)
{
    return !(a == b);
}
```

Inside `Equals` and `==`, compare with `null` through **`ReferenceEquals`**: `a == null` would call your own operator again and run into an endless recursion.

## Mutable objects as keys: a danger

The hash code is computed **when the object is put** in a hash table. If you change a field after that, the hash changes, and the table **cannot find the object any more**:

```csharp
var p = new MutablePoint { X = 1 };
set.Add(p);
p.X = 5;                                              // the hash is different now
Console.WriteLine(set.Contains(p));                   // False, though the object is inside
```

This is one more strong reason to make the objects that are used for **value equality** and as **keys** **immutable** (the lecture about `readonly`).

## `IEquatable<T>`

An `Equals(Point other)` method with a **typed** parameter, from the interface `IEquatable<Point>`, avoids a cast and is a little faster. A complete class implements both `Equals(object)` and `Equals(Point)`. For the tasks of this course, `Equals(object)` with `GetHashCode` is enough.

## What else uses Equals

`List<T>.Contains`, `IndexOf`, `Remove` and `Array.IndexOf` use `Equals`. `Dictionary` and `HashSet` use `GetHashCode` and `Equals`. `Array.Sort` does **not** use them: it needs an order (`IComparable`), not equality.
