The class `Fraction` below has the data and the constructor, but its operations are **static** (`Fraction.Add(a, b)`, `Fraction.Multiply(a, b)`). `Main` uses the **object** style: `a.Plus(b)`, `a.Times(b)`, `a.IsLessThan(b)`. So the program does not compile.

Turn the operations into **instance methods**, and keep the class correct:

- the constructor `Fraction(numerator, denominator)` **normalizes** the fraction: the denominator becomes positive (`3/−6` is `−1/2`), and the fraction is **reduced** by the greatest common divisor (`2/4` is `1/2`). The reduction is already there: keep it.
- `Plus(other)`: the sum, as a **new** fraction;
- `Times(other)`: the product, as a **new** fraction;
- `IsLessThan(other)`: `true` when this fraction is smaller than the other one (compare by cross-multiplication, since the denominators are positive);
- the property `Value`: the `double` value of the fraction;
- `ToString()`: `numerator/denominator`, or just the numerator when the denominator is 1.

The fraction is **immutable**: `Plus` and `Times` do not change either operand. Remove the static methods: after the refactoring, the same logic must be reachable only through the objects. Do not change `Main`. Expected output:

```text
5/6
1/6
1/2
-1/2
1
False
True
0.75
```

The lines in order: `1/2 + 1/3`; `1/2 · 1/3`; the fraction `2/4` after the constructor reduces it; `3/−6`; `1/2 + 1/2`, which is `1`; whether `1/2 < 1/3`; whether `1/3 < 1/2`; and the value of `3/4`.

Hint: `a/b + c/d = (a·d + c·b) / (b·d)`, and `a/b · c/d = (a·c) / (b·d)`. Because the constructor reduces, you can simply create the new fraction from the raw numerator and denominator.
