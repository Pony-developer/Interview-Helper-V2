## Math and friends

```csharp
Math.Round(2.5);                               // 2: banker's rounding (to even) by default!
Math.Round(2.5, MidpointRounding.AwayFromZero); // 3
Math.Round(1.2345m, 2);                        // 1.23
Math.Floor(-2.5); Math.Ceiling(-2.5); Math.Truncate(-2.5);   // -3, -2, -2
Math.Clamp(value, 0, 100);                     // .NET Core 2.0+
Math.Abs(int.MinValue);                        // OverflowException: no positive counterpart
Math.DivRem(17, 5, out int rem);               // 3, rem = 2
```

`Math` works on `double` (plus `decimal` overloads for rounding and the basics). `MathF` has `float` versions, which avoid conversions in graphics code.

Banker's rounding (round half to even) is the default because it doesn't bias sums upward, which matters in finance and statistics. If business rules say "round half up", pass `MidpointRounding.AwayFromZero` explicitly.

## Beyond the primitive types

| Type | What for |
| --- | --- |
| `BigInteger` | integers of any size: cryptography, factorials, exact combinatorics |
| `Complex` | complex numbers with `+`, `*`, `Magnitude`, `Phase` |
| `Half` (.NET 5) | 16-bit float for ML and graphics storage |
| `Int128`/`UInt128` (.NET 7) | 128-bit integers |

```csharp
BigInteger f = 1;
for (int i = 2; i <= 50; i++) f *= i;          // 50! has 65 digits: no overflow
```

`BigInteger` is immutable and allocates for every result, so it's much slower than `long`.

## Random numbers

```csharp
var rnd = new Random();                 // seeded from the system
int dice = rnd.Next(1, 7);              // 1..6: the upper bound is exclusive
double p = rnd.NextDouble();            // [0, 1)
int shared = Random.Shared.Next(100);   // .NET 6: thread-safe shared instance

var repeatable = new Random(42);        // same seed → same sequence (tests, simulations)
```

- `Random` instances are **not thread-safe**; use `Random.Shared` from multiple threads.
- In old .NET Framework, creating several `Random`s in a tight loop gave identical sequences (time-based seeds). .NET Core fixed that.
- `Random` is **predictable**. For tokens, keys, salts and passwords use `RandomNumberGenerator`:

```csharp
byte[] token = RandomNumberGenerator.GetBytes(32);
int secureIndex = RandomNumberGenerator.GetInt32(0, alphabet.Length);
```

## Bit manipulation

```csharp
int flags = 0;
flags |= 1 << 3;                 // set bit 3
bool on = (flags & (1 << 3)) != 0;
flags &= ~(1 << 3);              // clear bit 3
flags ^= 1 << 0;                 // toggle bit 0
int x = -16 >> 2;                // -4: arithmetic shift keeps the sign for signed types
uint y = 0x80000000 >> 31;       // 1: logical shift for unsigned types
```

`System.Numerics.BitOperations` (.NET Core 3.0+) exposes hardware instructions:

```csharp
BitOperations.PopCount(0b1011u);        // 3 set bits
BitOperations.Log2(1000u);              // 9
BitOperations.IsPow2(64);               // .NET 6
BitOperations.RoundUpToPowerOf2(1000u); // 1024 (.NET 6)
BitOperations.LeadingZeroCount(1u);     // 31
BitOperations.RotateLeft(value, 5);
```

These compile to single CPU instructions (`popcnt`, `lzcnt`) where available.

## Numeric conversions that lose data

- `Convert.ToInt32(2.5)` → 2 (banker's rounding), `(int)2.5` → 2 (truncation), `(int)2.7` → 2, `Convert.ToInt32(2.7)` → 3.
- Converting a large `double` to `int` in an `unchecked` context gives an undefined value; in `checked` it throws.

## Interview takeaways

- `Math.Round` uses banker's rounding by default.
- `Random` is for simulations; `RandomNumberGenerator` for security.
- `BitOperations` gives hardware-accelerated bit counting and logarithms.
