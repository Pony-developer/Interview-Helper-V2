Make the class `Point` a **value object**: two points with the same coordinates are **equal**, wherever they were created. Right now `Point` compares by reference, so `new Point(1, 2) == new Point(1, 2)` is `false`, and a `HashSet` holds duplicates.

Add to `Point` (keep its two properties and the constructor):

- `Equals(object)`: `true` for a `Point` with the same `X` and `Y`; `false` for `null` and for an object of **another type** (never throw an exception);
- `GetHashCode()`: **consistent** with `Equals`: equal points give equal hash codes (for example, `X * 31 + Y` in an `unchecked` block);
- the operators `==` and `!=` that compare the values, and that **work with `null`** (`p == null` must not crash, and must not recurse);
- `ToString()`: `(x, y)`.

Do not change `Main`. Expected output:

```text
True
True
False
True
False
False
True
2
True
1 second
1
(1, 2)
True
True
False
```

The lines in order: `a == b` for two equal points; `a.Equals(b)`; `ReferenceEquals(a, b)` (still `False`: they are different objects); `a != c` for different points; `a.Equals(null)`; `a.Equals("(1, 2)")` (a string, not a point); equal hash codes; the number of elements in a `HashSet` after adding `a`, `b` (equal) and `c`; whether the set contains a **new** point `(2, 1)`; a dictionary where the key `b` **replaced** the value of the key `a` (`1 second`); the position of a new `(1, 2)` in a list; the point as text; `a.Equals(boxed)` where the point is stored in a variable of the type `object` (the polymorphic call still works); a variable that is `null` compared to `null` (`True`); and a point compared to `null` (`False`).

Hint: in `Equals`, use `obj as Point` and check the result with **`ReferenceEquals(other, null)`**. Do not write `other == null` inside the code of `==` or `Equals`: it would call your own operator again. The operator `==` is `public static bool operator ==(Point a, Point b)`, and the compiler requires `!=` together with it.
