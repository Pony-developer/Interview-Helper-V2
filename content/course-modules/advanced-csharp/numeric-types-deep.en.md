## The numeric family

| Kind | Types | Notes |
| --- | --- | --- |
| Signed integers | `sbyte` (8), `short` (16), `int` (32), `long` (64) | `int` is the default for whole-number literals |
| Unsigned integers | `byte`, `ushort`, `uint`, `ulong` | no negative values |
| Native-size integers | `nint`, `nuint` (C# 9) | 32 or 64 bits depending on the process |
| Binary floating point | `float` (32), `double` (64) | `double` is the default for literals with a dot |
| Decimal floating point | `decimal` (128) | exact for base-10 fractions; for money |

Literal suffixes choose the type: `10L` (long), `10U` (uint), `1.5F` (float), `1.5M` (decimal). Digit separators help readability: `1_000_000`, `0b1010_1010`, `0xFF_FF`.

## Conversions

- **Implicit** when no information can be lost: `int` → `long`, `int` → `double`, `float` → `double`.
- **Explicit** (a cast) when it might: `long` → `int`, `double` → `int`, `double` → `float`.
- Casting a floating value to an integer **truncates** toward zero: `(int)-3.9` is `-3`. Use `Math.Round` (banker's rounding by default) or `Convert.ToInt32` (which rounds) if that's what you mean.

## The 8- and 16-bit trap

Arithmetic operators are defined only for `int`, `uint`, `long`, `ulong`, `float`, `double`, `decimal`. Smaller types are promoted to `int` first:

```csharp
short a = 1, b = 2;
short c = a + b;          // error: a + b is an int
short d = (short)(a + b); // ok
```

## Integer overflow

By default integer arithmetic **wraps around silently**:

```csharp
int x = int.MaxValue;
x++;                       // now int.MinValue, no error
```

Use `checked` to turn overflow into an `OverflowException`:

```csharp
int y = checked(x * 2);          // expression
checked { total += price * qty; } // block
```

You can make the whole project checked (`<CheckForOverflowUnderflow>true</CheckForOverflowUnderflow>`) and opt out locally with `unchecked`. Constant expressions are always checked at compile time.

## Floating-point special values

`double` division by zero does **not** throw:

```csharp
Console.WriteLine(1.0 / 0);    // ∞ (PositiveInfinity)
Console.WriteLine(0.0 / 0);    // NaN
Console.WriteLine(double.NaN == double.NaN);   // False!  use double.IsNaN
```

Integer division by zero, in contrast, throws `DivideByZeroException`.

## double vs decimal

```csharp
Console.WriteLine(0.1 + 0.2 == 0.3);       // False
Console.WriteLine(0.1m + 0.2m == 0.3m);    // True
```

`double` stores numbers in base 2, so 0.1 is an approximation. `decimal` stores them in base 10 with up to 28–29 significant digits, so financial amounts stay exact. The trade-off: `decimal` is roughly 10 times slower and has a much smaller range.

| Use `double` for | Use `decimal` for |
| --- | --- |
| science, graphics, statistics, anything measured | money, prices, quantities that are counted in base 10 |

Never compare `double` values with `==` after calculations; compare with a tolerance: `Math.Abs(a - b) < 1e-9`.

## Interview takeaways

- Integer overflow wraps unless you use `checked`.
- `byte + byte` is an `int`.
- `double` for measurements, `decimal` for money; `NaN != NaN`.
