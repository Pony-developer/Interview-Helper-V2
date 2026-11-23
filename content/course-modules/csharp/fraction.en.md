A fraction is a good example of an **immutable** object: `1/2` is always `1/2`, and `Plus` gives a **new** fraction. Its invariants: the denominator is **never zero**, it is **positive**, and the fraction is **reduced**.

Write the class `Fraction`:

- two **`readonly`** fields, with the read-only properties `Numerator` and `Denominator`;
- the constructor `Fraction(numerator, denominator)`:
  - a zero denominator throws an `ArgumentException`;
  - a negative denominator is turned positive by changing the sign of **both** numbers (`6/−8` is `−6/8`);
  - the fraction is reduced by the greatest common divisor (`−6/8` is `−3/4`). `0/5` becomes `0/1`;
- `Plus(other)` and `Times(other)`: return a **new** fraction, and never change the operands;
- `Inverse()`: the fraction turned upside down (`−3/4` gives `−4/3`; the sign stays in the numerator). For a zero fraction, it throws a **`DivideByZeroException`**;
- `ToString()`: `numerator/denominator`, or only the numerator when the denominator is 1.

Do not change `Main`. Expected output:

```text
-3/4
-1/4
-3/8
-4/3
2
0
-3/4
ArgumentException
DivideByZeroException
-3 4
```

The lines in order: `6/−8` after the normalization; `−3/4 + 1/2`; `−3/4 · 1/2`; the inverse of `−3/4`; the inverse of `1/2` (the fraction `2/1` is printed as `2`); the fraction `0/5`; the first fraction again, **unchanged** by all the operations; the exception from the zero denominator; the exception from the inverse of zero; and the numerator and the denominator of the first fraction.

Hint: the greatest common divisor is the recursive function from the module about recursion: `Gcd(a, b)` is `a` when `b == 0`, and `Gcd(b, a % b)` otherwise. Use `Math.Abs` for the numerator. `a/b + c/d = (a·d + c·b) / (b·d)`. The constructor does the checking and the reducing, so the new fraction can be created from raw numbers.
