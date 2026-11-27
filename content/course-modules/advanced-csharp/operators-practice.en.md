## Task

`Fraction` is an immutable struct that keeps itself in lowest terms with a positive denominator (the constructor already does that). Give it operators so it can be used like a built-in number:

- binary **`+ - * /`** and unary **`-`** (hint: `a - b` can be written as `a + (-b)`);
- **`==` and `!=`** (compare numerator and denominator: fractions are always normalized), plus `Equals(Fraction)`, `Equals(object)` and `GetHashCode()`;
- **`>` and `<`** (compare `a.N * b.D` with `b.N * a.D`; denominators are positive);
- an **implicit** conversion from `int` (lossless, never fails);
- an **explicit** conversion to `double` (it may lose precision).

The starter's `Main` is commented out because it can't compile until the operators exist. Uncomment it when you're ready.

Expected output:

```
5/6
1/6
1/6
3/2
-1/2
True
-3/4
7/2
0.333
True
True
```
