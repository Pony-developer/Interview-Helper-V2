C# has the usual arithmetic operators. They take numbers and give a number back.

| Operator | Meaning | Example | Result |
| --- | --- | --- | --- |
| `+` | addition | `7 + 2` | `9` |
| `-` | subtraction | `7 - 2` | `5` |
| `*` | multiplication | `7 * 2` | `14` |
| `/` | division | `7 / 2` | `3` (both are `int`) |
| `%` | remainder | `7 % 2` | `1` |

## Precedence

`*`, `/` and `%` run before `+` and `-`. Operators of the same level run left to right, and parentheses always go first:

```csharp
Console.WriteLine(10 + 2 * 3);     // 16
Console.WriteLine((10 + 2) * 3);   // 36
Console.WriteLine(100 / 10 / 5);   // 2, because (100 / 10) / 5
Console.WriteLine(100 / (10 / 5)); // 50
```

When in doubt, add parentheses: they cost nothing and make the intent clear.

## The type of the result

`int` with `int` gives `int`. If either side is a `double`, the result is a `double`:

```csharp
Console.WriteLine(7 / 2);     // 3
Console.WriteLine(7 / 2.0);   // 3.5
Console.WriteLine(7.0 / 2);   // 3.5
```

A common trap is that the division happens **before** the result is stored:

```csharp
double half = 1 / 2;     // 0, the integer division is done first
double right = 1 / 2.0;  // 0.5
```

## The remainder operator

`%` gives what is left after integer division. The sign follows the left operand:

```csharp
Console.WriteLine(17 % 5);   // 2
Console.WriteLine(-7 % 3);   // -1
```

It is handy in three situations:

- parity: `n % 2 == 0` is true for even numbers;
- the last digit: `n % 10`, while `n / 10` removes it;
- wrapping around: `(hour + 5) % 24`.

The same pair works for time: with `seconds` as a whole number, `seconds / 60` is whole minutes and `seconds % 60` is what is left over.

## Shorthand assignment

`x += 5` means `x = x + 5`. The same works for the other operators:

```csharp
int n = 10;
n += 5;    // 15
n -= 3;    // 12
n *= 2;    // 24
n /= 5;    // 4
n %= 3;    // 1
```

Note that `n *= 2 + 1` means `n = n * (2 + 1)`: the whole right side is calculated first.

`++` and `--` add or subtract one:

```csharp
int i = 5;
i++;              // i is 6
int a = i++;      // a = 6, then i becomes 7
int b = ++i;      // i becomes 8, then b = 8
```

Written after the variable, `i++` yields the old value; written before it, `++i` yields the new one. Keep them as separate statements and the difference never bites you.

## The Math class

```csharp
Math.Abs(-4)          // 4
Math.Max(3, 9)        // 9
Math.Min(3, 9)        // 3
Math.Pow(2, 10)       // 1024, a double
Math.Sqrt(81)         // 9, a double
Math.Floor(2.7)       // 2, round down
Math.Ceiling(2.1)     // 3, round up
Math.Round(2.567, 2)  // 2.57
Math.PI               // 3.14159...
```

`Math.Pow` and `Math.Sqrt` return `double`; cast with `(int)` when you need a whole number.

`Math.Round` rounds halves to the nearest **even** number: `Math.Round(2.5)` is `2` and `Math.Round(3.5)` is `4`. For the school rule use `Math.Round(2.5, MidpointRounding.AwayFromZero)`, which gives `3`.

## Division by zero

```csharp
int zero = 0;
Console.WriteLine(5 / zero);     // runtime error: DivideByZeroException
Console.WriteLine(5.0 / zero);   // Infinity
```

Integer division by zero crashes the program. For `double` the result is `Infinity` (or `NaN` for `0.0 / 0`).

## Comparisons give a bool

Comparison operators produce a `bool` value, which prints as `True` or `False`:

```csharp
Console.WriteLine(5 > 3);         // True
Console.WriteLine(5 == 5);        // True
Console.WriteLine(5 != 5);        // False
Console.WriteLine(10 % 3 == 1);   // True
```

The operators are `==`, `!=`, `<`, `>`, `<=` and `>=`. Do not confuse `==` (compare) with `=` (assign). You can combine bool values with `&&` (and), `||` (or) and `!` (not). They become really useful with `if`, which comes in a later module.
