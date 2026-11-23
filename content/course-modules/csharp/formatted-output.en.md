Gluing strings with `+` works for a quick message. For tables, money, dates and aligned columns, C# has **format strings**.

## Three ways to put values into text

```csharp
string name = "Ann";
double price = 12.5;

Console.WriteLine("Name: " + name + ", price: " + price);       // concatenation
Console.WriteLine(string.Format("Name: {0}, price: {1}", name, price)); // composite format
Console.WriteLine($"Name: {name}, price: {price}");              // interpolation
```

All three print `Name: Ann, price: 12.5`. Interpolation, with the `$` before the quote, is the clearest one. The `{0}` and `{1}` in `string.Format` are **placeholders** for the arguments by number. `Console.WriteLine` accepts the same form: `Console.WriteLine("{0} is {1}", name, 31);`.

Write `{{` and `}}` to print literal braces: `$"{{{name}}}"` prints `{Ann}`.

## The placeholder syntax

```text
{ index [, alignment] [: format] }
```

In an interpolated string, `index` is replaced with an expression: `{price,8:F2}`.

## Alignment

A number after a comma is the **minimum width** of the field. Positive means right-aligned, negative means left-aligned:

```csharp
Console.WriteLine($"[{42,6}]");     // [    42]
Console.WriteLine($"[{42,-6}]");    // [42    ]
Console.WriteLine($"[{"ab",5}]");   // [   ab]
```

A value longer than the width is **not** cut: it just takes more room. The same effect is available as methods:

```csharp
"ab".PadLeft(5)           // "   ab"
"ab".PadRight(5)          // "ab   "
"7".PadLeft(3, '0')       // "007"
```

Aligned columns are the main use:

```csharp
Console.WriteLine($"{"Item",-8}{"Qty",4}");
Console.WriteLine($"{"Tea",-8}{2,4}");
Console.WriteLine($"{"Coffee",-8}{10,4}");
```

```text
Item     Qty
Tea        2
Coffee    10
```

## Number formats

After a colon comes a **format specifier**:

| Format | Meaning | `1234.5678` becomes |
| --- | --- | --- |
| `F2` | fixed-point, 2 decimals | `1234.57` |
| `F0` | no decimals | `1235` |
| `N2` | with thousands separators | `1,234.57` |
| `E2` | scientific | `1.23E+003` |
| `P1` | percent, from a fraction | `0.256` gives about `25.6%` (the spacing depends on the culture) |
| `D5` | integers with leading zeros | `42` gives `00042` |
| `X` | hexadecimal | `255` gives `FF` |
| `0.00` | a custom pattern | `1234.57` |

```csharp
double total = 1234.5678;
Console.WriteLine(total.ToString("F2"));        // 1234.57
Console.WriteLine($"{total:F2}");               // 1234.57
Console.WriteLine($"{total,10:F2}");            // width 10, 2 decimals
Console.WriteLine($"{255:X}");                  // FF
Console.WriteLine($"{42:D5}");                  // 00042
```

The rounding in `F2` follows the usual rule for the number shown (half away from zero), unlike `Math.Round`, which goes to the even neighbour.

## Culture

The decimal separator, the thousands separator and the way dates are written depend on the **culture**, the regional settings. On a computer set to Ukrainian, `12.5` prints as `12,5`. For output that must look the same everywhere, such as a file, a log or a test, pass the invariant culture:

```csharp
using System.Globalization;

string text = total.ToString("F2", CultureInfo.InvariantCulture);          // always 1234.57
string line = string.Format(CultureInfo.InvariantCulture, "{0:F2}", total);
```

For text shown to a person, the user's own culture is correct, which is what the default does.

## Dates

```csharp
var date = new DateTime(2026, 11, 23, 14, 5, 9);
Console.WriteLine(date.ToString("yyyy-MM-dd"));        // 2026-11-23
Console.WriteLine(date.ToString("HH:mm:ss"));          // 14:05:09
Console.WriteLine($"{date:dd.MM.yyyy}");               // 23.11.2026
```

`MM` is the month, and `mm` is the minute: a classic mix-up. `HH` is the 24-hour clock.

## Putting it together: a text table

```csharp
string[] names = { "Tea", "Coffee" };
double[] prices = { 3.5, 12.25 };

for (int i = 0; i < names.Length; i++)
{
    Console.WriteLine(string.Format(CultureInfo.InvariantCulture, "{0,-8}{1,8:F2}", names[i], prices[i]));
}
```

```text
Tea          3.50
Coffee      12.25
```

## Which one to choose

- A quick message: interpolation.
- A **table** with columns: alignment `{x,8}` or `PadLeft` and `PadRight`.
- **Money and measurements**: `F2` or `N2`, together with the invariant culture if the format must be exact.
- A template that comes from outside, such as a setting or a translation: `string.Format`, because the placeholders can be reordered by the text itself.
