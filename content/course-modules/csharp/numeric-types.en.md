C# is statically typed: every variable has a type, fixed when you declare it.

```csharp
int count = 4;         // whole numbers
double price = 12.5;   // numbers with a fractional part
var total = price * count; // the compiler infers double
```

## The numeric types you will use most

| Type | Size | Holds | Literal |
| --- | --- | --- | --- |
| `int` | 32 bits | whole numbers from about −2.1 to 2.1 billion | `42` |
| `long` | 64 bits | whole numbers up to about 9.2 × 10¹⁸ | `42L` |
| `double` | 64 bits | fractional numbers, about 15–16 significant digits | `4.2` |
| `float` | 32 bits | fractional numbers, about 7 significant digits | `4.2f` |
| `decimal` | 128 bits | exact decimal fractions, for money | `4.2m` |

A literal has a type too: `4.2` is a `double`, so `float f = 4.2;` does not compile, while `float f = 4.2f;` does.

## Integer division

When both operands are integers, the result is an integer and the fraction is dropped:

```csharp
Console.WriteLine(7 / 2);    // 3
Console.WriteLine(7 / 2.0);  // 3.5
Console.WriteLine(7 % 2);    // 1, the remainder
```

## Conversions

Converting to a type that can hold every value of the original is **implicit**:

```csharp
int small = 1000;
long big = small;      // fine
double d = big;        // fine
```

Converting the other way can lose information, so C# makes you write an **explicit cast**:

```csharp
double pi = 3.99;
int whole = (int)pi;                 // 3: the fraction is cut off, not rounded
int nearest = (int)Math.Round(pi);   // 4
```

`int x = 10000L;` is an error: `10000L` is a `long`, and a `long` cannot be put into an `int` without a cast, even when the value would fit.

## Overflow

`int` arithmetic wraps around silently when the result does not fit:

```csharp
int max = int.MaxValue;
Console.WriteLine(max + 1); // -2147483648
```

If a calculation can exceed about two billion, use `long` from the start.
