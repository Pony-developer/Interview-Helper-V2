## Characters, code points and bytes

- **Unicode** assigns a number (a *code point*) to every character: `A` is U+0041, `€` is U+20AC, `😀` is U+1F600.
- An **encoding** turns code points into bytes.
- .NET strings are **UTF-16** in memory: each `char` is a 16-bit unit. Code points above U+FFFF need two `char`s, a **surrogate pair**.

```csharp
string smile = "😀";
Console.WriteLine(smile.Length);                       // 2 chars
Console.WriteLine(char.IsSurrogatePair(smile, 0));     // True
Console.WriteLine(char.ConvertToUtf32(smile, 0));      // 128512
```

`System.Text.Rune` (.NET Core 3.0+) represents one full code point and lets you iterate correctly with `foreach (Rune r in text.EnumerateRunes())`. For user-perceived characters (an emoji with a skin-tone modifier, a letter with combining accents) you need **grapheme clusters**: `StringInfo.GetTextElementEnumerator`.

## The common encodings

| Encoding | Bytes per code point | Notes |
| --- | --- | --- |
| **UTF-8** | 1–4 | ASCII-compatible; the default for files, the web and .NET I/O |
| **UTF-16** | 2 or 4 | .NET's in-memory format; Windows APIs |
| **UTF-32** | 4 | simple, wasteful; rare |
| **ASCII** | 1 | only 128 characters; non-ASCII becomes `?` |
| **Latin-1 / Windows-1252** | 1 | legacy Western European files |

```csharp
byte[] utf8 = Encoding.UTF8.GetBytes("€uro");   // E2 82 AC 75 72 6F : 6 bytes
string back = Encoding.UTF8.GetString(utf8);
int count = Encoding.UTF8.GetByteCount("€");      // 3
```

On .NET Core/5+, legacy code pages (1251, 866, ...) need `Encoding.RegisterProvider(CodePagesEncodingProvider.Instance)` before `Encoding.GetEncoding(1251)` works.

## Encodings in file and stream I/O

```csharp
File.WriteAllText(path, text);                          // UTF-8 without BOM by default
File.WriteAllText(path, text, new UTF8Encoding(true));  // with a byte-order mark
using var reader = new StreamReader(path, Encoding.Latin1);   // read a legacy file
```

- A **BOM** (byte-order mark) is an optional prefix (`EF BB BF` for UTF-8) that identifies the encoding. `StreamReader` detects it automatically.
- Reading a file with the wrong encoding produces *mojibake* (`â‚¬` instead of `€`) or replacement characters (`�`).

## Working with bytes efficiently

```csharp
Span<byte> buffer = stackalloc byte[256];
int written = Encoding.UTF8.GetBytes("hello", buffer);   // no heap allocation
```

.NET also has `u8` literals (C# 11) and `Utf8JsonReader`/`Utf8Formatter`, because converting to UTF-16 and back is wasted work when data stays UTF-8 end to end.

## Base64 and hex

Binary data that must travel as text (JSON, URLs, config) is encoded, not "converted to a string":

```csharp
string b64 = Convert.ToBase64String(bytes);
byte[] raw = Convert.FromBase64String(b64);
string hex = Convert.ToHexString(bytes);   // .NET 5+
```

Never use `Encoding.UTF8.GetString` on arbitrary binary data such as a hash or an encrypted blob: invalid sequences are silently replaced, and the data is lost.

## Interview takeaways

- .NET strings are UTF-16; `Length` counts `char`s, not characters.
- UTF-8 is the default for files and networks; always be explicit when reading legacy data.
- Binary → text: Base64 or hex, never a text encoding.
