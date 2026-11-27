## Постачальники формату та культура

`ToString`, `Parse`, `string.Format` та інтерполяція залежать від **постачальника формату**, зазвичай `CultureInfo`. Якщо його не передано, використовується `CultureInfo.CurrentCulture` поточного потоку.

```csharp
decimal price = 1234.5m;
price.ToString("N2", new CultureInfo("en-US"));   // 1,234.50
price.ToString("N2", new CultureInfo("de-DE"));   // 1.234,50
price.ToString("N2", new CultureInfo("uk-UA"));   // 1 234,50
price.ToString(CultureInfo.InvariantCulture);     // 1234.5
```

- `CurrentCulture`: форматування чисел, дат і валют для **людей**.
- `CurrentUICulture`: які мовні ресурси (перекладені рядки) завантажувати.
- `InvariantCulture`: фіксований, незалежний від культури формат для **машин**: файли, логи, JSON, SQL, конфігурація.

Класична помилка: застосунок пише `12.5` через `ToString()` на сервері в Німеччині (`12,5`), а інший сервіс розбирає це в США. Для даних, які не показують людині, завжди використовуйте `InvariantCulture`.

## Стандартні числові рядки формату

| Формат | Приклад (en-US, 1234.567) | Значення |
| --- | --- | --- |
| `N2` | 1,234.57 | число з роздільниками груп |
| `F2` | 1234.57 | фіксована кома, без роздільників |
| `C` | $1,234.57 | валюта |
| `P1` | (0.256 →) 25.6% | відсоток (множить на 100) |
| `E3` | 1.235E+003 | експоненційний |
| `D6` | (42 →) 000042 | ціле, доповнене нулями |
| `X` | (255 →) FF | шістнадцятковий |
| `R` / `G17` | | точний round-trip для `double` |

Власні формати: `"0.00"`, `"#,##0"`, `"00000"`, `"0.##"`, `"+0;-0;zero"` (секції для додатних/від'ємних/нуля).

## Рядки формату дати й часу

| Формат | Приклад | Примітки |
| --- | --- | --- |
| `d` / `D` | 3/5/2024 / Tuesday, March 5, 2024 | коротка / довга дата, залежить від культури |
| `t` / `T` | 2:30 PM / 2:30:00 PM | короткий / довгий час |
| `o` | 2024-03-05T14:30:00.0000000+02:00 | **round-trip ISO 8601**: для зберігання |
| `s` | 2024-03-05T14:30:00 | сортований |
| `u` | 2024-03-05 12:30:00Z | універсальний сортований |
| власний | `yyyy-MM-dd HH:mm` | `MM` — місяць, `mm` — хвилини; `HH` 24-годинний, `hh` 12-годинний |

## Розбір

```csharp
int n = int.Parse("42");                                     // кидає FormatException на поганому вході
bool ok = decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out decimal value);
var when = DateTime.ParseExact("05.03.2024", "dd.MM.yyyy", CultureInfo.InvariantCulture);
var stamp = DateTimeOffset.Parse("2024-03-05T14:30:00+02:00", CultureInfo.InvariantCulture);
```

- Для введення користувача віддавайте перевагу **`TryParse`**: без винятків на очікуваних невдачах.
- **`ParseExact`** — коли формат фіксований (імпорт файлів).
- **`NumberStyles`** керує дозволеним: `AllowThousands`, `AllowCurrencySymbol`, `AllowHexSpecifier`, `Float`, `Any`.
- **`DateTimeStyles`**: `AssumeUniversal`, `AdjustToUniversal`, `RoundtripKind`.

## Інші механізми перетворення

- `Convert.ToInt32(object)`, `Convert.ToBase64String`, `Convert.ChangeType(value, type)`: загальні перетворення між базовими типами з округленням (`Convert.ToInt32(2.5)` дає 2, банківське округлення).
- `XmlConvert` форматує значення за стандартом XML, без культури.
- `TypeConverter` (`TypeDescriptor.GetConverter(type)`) використовують дизайнери та прив'язування конфігурації.
- `BitConverter` перетворює примітиви на байти й назад (з урахуванням порядку байтів машини; для фіксованого порядку — `BinaryPrimitives`).

## Власне форматування: IFormattable

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

Console.WriteLine($"{t:F}");   // інтерполяція передає "F" у ваш ToString
```

## Що сказати на співбесіді

- Форматування й розбір залежать від поточної культури, якщо не передати постачальника.
- `InvariantCulture` — для машинних даних; `CurrentCulture` — для UI.
- Щоб зберігати дати текстом, беріть `"o"`; читайте назад через `TryParse`/`ParseExact`.
