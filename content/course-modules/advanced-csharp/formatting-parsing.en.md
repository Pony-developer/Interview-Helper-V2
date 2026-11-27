## Format providers and culture

`ToString`, `Parse`, `string.Format` and interpolation all depend on a **format provider**, usually a `CultureInfo`. If you don't pass one, the thread's `CultureInfo.CurrentCulture` is used.

```csharp
decimal price = 1234.5m;
price.ToString("N2", new CultureInfo("en-US"));   // 1,234.50
price.ToString("N2", new CultureInfo("de-DE"));   // 1.234,50
price.ToString("N2", new CultureInfo("uk-UA"));   // 1 234,50
price.ToString(CultureInfo.InvariantCulture);     // 1234.5
```

- `CurrentCulture`: formatting numbers, dates and currency for **people**.
- `CurrentUICulture`: which language resources (translated strings) to load.
- `InvariantCulture`: a fixed, culture-neutral format for **machines**: files, logs, JSON, SQL, config.

The classic bug: an app writes `12.5` with `ToString()` on a server in Germany (`12,5`) and another service parses it in the US. Always use `InvariantCulture` for data that isn't shown to a human.

## Standard numeric format strings

| Format | Example (en-US, 1234.567) | Meaning |
| --- | --- | --- |
| `N2` | 1,234.57 | number with group separators |
| `F2` | 1234.57 | fixed-point, no separators |
| `C` | $1,234.57 | currency |
| `P1` | (0.256 →) 25.6% | percent (multiplies by 100) |
| `E3` | 1.235E+003 | scientific |
| `D6` | (42 →) 000042 | integer padded with zeros |
| `X` | (255 →) FF | hexadecimal |
| `R` / `G17` | | round-trip a `double` exactly |

Custom formats: `"0.00"`, `"#,##0"`, `"00000"`, `"0.##"`, `"+0;-0;zero"` (sections for positive/negative/zero).

## Date and time format strings

| Format | Example | Notes |
| --- | --- | --- |
| `d` / `D` | 3/5/2024 / Tuesday, March 5, 2024 | short / long date, culture-dependent |
| `t` / `T` | 2:30 PM / 2:30:00 PM | short / long time |
| `o` | 2024-03-05T14:30:00.0000000+02:00 | **round-trip ISO 8601**: use for storage |
| `s` | 2024-03-05T14:30:00 | sortable |
| `u` | 2024-03-05 12:30:00Z | universal sortable |
| custom | `yyyy-MM-dd HH:mm` | `MM` is month, `mm` is minutes; `HH` 24-hour, `hh` 12-hour |

## Parsing

```csharp
int n = int.Parse("42");                                     // throws FormatException on bad input
bool ok = decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal value);
var when = DateTime.ParseExact("05.03.2024", "dd.MM.yyyy", CultureInfo.InvariantCulture);
var stamp = DateTimeOffset.Parse("2024-03-05T14:30:00+02:00", CultureInfo.InvariantCulture);
```

- Prefer **`TryParse`** for user input: no exceptions on expected failures.
- Use **`ParseExact`** when the format is fixed (file imports).
- **`NumberStyles`** controls what's allowed: `AllowThousands`, `AllowCurrencySymbol`, `AllowHexSpecifier`, `Float`, `Any`.
- **`DateTimeStyles`**: `AssumeUniversal`, `AdjustToUniversal`, `RoundtripKind`.

## Other conversion mechanisms

- `Convert.ToInt32(object)`, `Convert.ToBase64String`, `Convert.ChangeType(value, type)`: general conversions between base types, with rounding (`Convert.ToInt32(2.5)` is 2, banker's rounding).
- `XmlConvert` formats values the XML-standard way, culture-free.
- `TypeConverter` (`TypeDescriptor.GetConverter(type)`) is used by designers and config binding.
- `BitConverter` turns primitives into bytes and back (respecting the machine's endianness; use `BinaryPrimitives` for a fixed byte order).

## Custom formatting: IFormattable

```csharp
public readonly struct Temperature : IFormattable
{
    public double Celsius { get; }
    public Temperature(double c) => Celsius = c;
    public string ToString(string? format, IFormatProvider? provider) => format switch
    {
        "F" => (Celsius * 9 / 5 + 32).ToString("0.#", provider) + "°F",
        _ => Celsius.ToString("0.#", provider) + "°C",
    };
}

Console.WriteLine($"{t:F}");   // interpolation passes "F" to your ToString
```

## Interview takeaways

- Formatting and parsing depend on the current culture unless you pass a provider.
- `InvariantCulture` for machine data; `CurrentCulture` for UI.
- Use `"o"` to store dates as text; `TryParse`/`ParseExact` to read them back.
