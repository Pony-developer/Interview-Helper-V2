## Символи, кодові точки та байти

- **Unicode** присвоює число (*кодову точку*) кожному символу: `A` — U+0041, `€` — U+20AC, `😀` — U+1F600.
- **Кодування** перетворює кодові точки на байти.
- Рядки .NET у пам'яті зберігаються в **UTF-16**: кожен `char` — 16-бітна одиниця. Кодові точки вище U+FFFF потребують двох `char`, **сурогатної пари**.

```csharp
string smile = "😀";
Console.WriteLine(smile.Length);                       // 2 char
Console.WriteLine(char.IsSurrogatePair(smile, 0));     // True
Console.WriteLine(char.ConvertToUtf32(smile, 0));      // 128512
```

`System.Text.Rune` (.NET Core 3.0+) подає одну повну кодову точку і дозволяє коректно обходити текст через `foreach (Rune r in text.EnumerateRunes())`. Для символів, як їх сприймає людина (емодзі з модифікатором кольору шкіри, літера з комбінованими діакритиками), потрібні **кластери графем**: `StringInfo.GetTextElementEnumerator`.

## Поширені кодування

| Кодування | Байтів на кодову точку | Примітки |
| --- | --- | --- |
| **UTF-8** | 1–4 | сумісне з ASCII; стандарт для файлів, вебу та I/O у .NET |
| **UTF-16** | 2 або 4 | формат .NET у пам'яті; API Windows |
| **UTF-32** | 4 | просте, марнотратне; рідкісне |
| **ASCII** | 1 | лише 128 символів; не-ASCII стає `?` |
| **Latin-1 / Windows-1252** | 1 | застарілі західноєвропейські файли |

```csharp
byte[] utf8 = Encoding.UTF8.GetBytes("€uro");   // E2 82 AC 75 72 6F : 6 байтів
string back = Encoding.UTF8.GetString(utf8);
int count = Encoding.UTF8.GetByteCount("€");      // 3
```

У .NET Core/5+ застарілі кодові сторінки (1251, 866, ...) потребують `Encoding.RegisterProvider(CodePagesEncodingProvider.Instance)`, перш ніж запрацює `Encoding.GetEncoding(1251)`.

## Кодування у файловому й потоковому I/O

```csharp
File.WriteAllText(path, text);                          // за замовчуванням UTF-8 без BOM
File.WriteAllText(path, text, new UTF8Encoding(true));  // з маркером порядку байтів
using var reader = new StreamReader(path, Encoding.Latin1);   // прочитати старий файл
```

- **BOM** (byte-order mark) — необов'язковий префікс (`EF BB BF` для UTF-8), що позначає кодування. `StreamReader` розпізнає його автоматично.
- Читання файлу з неправильним кодуванням дає «кракозябри» (`â‚¬` замість `€`) чи символи заміни (`�`).

## Ефективна робота з байтами

```csharp
Span<byte> buffer = stackalloc byte[256];
int written = Encoding.UTF8.GetBytes("hello", buffer);   // без алокації в купі
```

У .NET також є літерали `u8` (C# 11) та `Utf8JsonReader`/`Utf8Formatter`, бо перетворення в UTF-16 і назад — марна робота, коли дані від початку до кінця лишаються в UTF-8.

## Base64 та hex

Двійкові дані, що мають подорожувати як текст (JSON, URL, конфігурація), кодують, а не «перетворюють на рядок»:

```csharp
string b64 = Convert.ToBase64String(bytes);
byte[] raw = Convert.FromBase64String(b64);
string hex = Convert.ToHexString(bytes);   // .NET 5+
```

Ніколи не застосовуйте `Encoding.UTF8.GetString` до довільних двійкових даних, як-от хешу чи зашифрованого блоку: некоректні послідовності тихо замінюються, і дані втрачаються.

## Що сказати на співбесіді

- Рядки .NET — UTF-16; `Length` рахує `char`, а не символи.
- UTF-8 — стандарт для файлів і мережі; читаючи старі дані, завжди вказуйте кодування явно.
- Двійкове → текст: Base64 чи hex, ніколи текстове кодування.
