Comparing whole numbers is simple: `3 == 3` is true, `3 == 4` is false. With `double` and `float` the situation is different.

## Why `==` fails

Computers store numbers in binary. Many decimal fractions, such as `0.1`, have no exact binary form, just as `1/3` has no exact decimal form. `double` keeps the nearest value it can, and tiny errors creep into calculations:

```csharp
Console.WriteLine(0.1 + 0.2 == 0.3);     // False
Console.WriteLine(0.1 + 0.2);            // 0.30000000000000004 on modern .NET
Console.WriteLine(1.0 - 0.9 == 0.1);     // False
Console.WriteLine(0.5 + 0.25 == 0.75);   // True, because these are exact in binary
```

(Older runtimes round the display to 15 digits and show `0.3`, but the comparison is still `False`.)

The error is small, around the 16th significant digit, but `==` demands that every bit is identical. So do **not** compare `double` values with `==` or `!=` when they come from calculations.

## Compare with a tolerance

Decide how close is "equal enough", and check that the difference is smaller:

```csharp
const double Epsilon = 1e-9;   // 0.000000001

static bool AreEqual(double a, double b)
{
    return Math.Abs(a - b) < Epsilon;
}

Console.WriteLine(AreEqual(0.1 + 0.2, 0.3));   // True
```

`1e-9` is scientific notation for 10⁻⁹. The tolerance depends on the task: for distances in metres, `1e-6` (a micrometre) may be plenty.

For very large or very small numbers an absolute tolerance is misleading: a difference of `0.001` is huge next to `0.0001` but nothing next to `1e12`. In that case compare the **relative** difference:

```csharp
Math.Abs(a - b) <= 1e-9 * Math.Max(Math.Abs(a), Math.Abs(b))
```

## Another approach: round first

If you only care about two decimal places, round both values before comparing:

```csharp
Math.Round(a, 2) == Math.Round(b, 2)
```

This works for display-level questions, but it has edge cases near the rounding boundary, so the tolerance is usually the safer choice.

## Money: use decimal

`decimal` stores decimal fractions exactly, so it suits prices and balances:

```csharp
Console.WriteLine(0.1m + 0.2m == 0.3m);   // True
```

It is slower than `double` and has no `Math.Sin` and the like, so use it for money, not for physics.

## Inequalities are fine

`<`, `>`, `<=` and `>=` do not need a tolerance when a tiny error does not change the decision. But if the value can sit right on the boundary (a result such as `2.9999999999999996` where you expect `3`), the comparison may tip to the wrong side. Think about the borderline case, and add a tolerance if it matters.

## Special values

- `double.NaN` ("not a number", from `0.0 / 0`) is not equal to anything, **including itself**: `double.NaN == double.NaN` is `False`. Test for it with `double.IsNaN(x)`.
- Division of a nonzero `double` by zero gives `double.PositiveInfinity` or `double.NegativeInfinity`. Test with `double.IsInfinity(x)`.
- A `double` that holds a whole number, such as `3.0`, is exact, and `d == 3` works. The trouble starts with the results of calculations.
