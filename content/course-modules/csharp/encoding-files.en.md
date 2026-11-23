A file holds **bytes**, not characters. An **encoding** is the agreement on how characters are turned into bytes and back. If the writer and the reader disagree, the text turns into gibberish, such as `РџСЂРёРІС–С‚` instead of `Привіт`.

## Common encodings

| Encoding | Bytes per character | Notes |
| --- | --- | --- |
| **ASCII** | 1 | only 128 characters: English letters, digits, punctuation |
| **UTF-8** | 1 to 4 | covers all of Unicode; ASCII text is unchanged; the standard on the web and in modern files |
| **UTF-16** (`Encoding.Unicode`) | 2 or 4 | the internal form of a C# `string`; used by Windows |
| **UTF-32** | 4 | simple, and wasteful |
| **Windows-1251**, **KOI8-U** | 1 | old single-byte code pages for Cyrillic |

The number of bytes is not the number of characters. In UTF-8 an English letter is one byte, a Cyrillic letter is two, and many emoji are four:

```csharp
using System.Text;

Console.WriteLine(Encoding.UTF8.GetBytes("A").Length);        // 1
Console.WriteLine(Encoding.UTF8.GetBytes("Привіт").Length);   // 12: six letters, two bytes each
Console.WriteLine(Encoding.Unicode.GetBytes("Привіт").Length);// 12: UTF-16, two bytes each
Console.WriteLine(Encoding.UTF32.GetBytes("Привіт").Length);  // 24
Console.WriteLine(Encoding.ASCII.GetBytes("Привіт").Length);  // 6: every letter is replaced with '?'
```

ASCII cannot represent Cyrillic, so it substitutes `?`. The text is **lost**, not merely displayed incorrectly.

## Encoding bytes and decoding them

```csharp
byte[] bytes = Encoding.UTF8.GetBytes("Hi, Ann");
string text = Encoding.UTF8.GetString(bytes);        // back to "Hi, Ann"
Console.WriteLine(bytes[0]);                         // 72: the code of 'H'
```

A round trip through the **same** encoding returns the same text. Decoding with a different one produces a different, wrong text.

## Encodings in file operations

The `File` methods and the streams default to **UTF-8**, so for everyday work you need not do anything. To be explicit, or to read an old file, pass an encoding:

```csharp
File.WriteAllText("a.txt", "Привіт", Encoding.UTF8);
string text = File.ReadAllText("a.txt", Encoding.UTF8);

using (var reader = new StreamReader("old.txt", Encoding.GetEncoding(1251)))
{
    Console.WriteLine(reader.ReadToEnd());
}
```

On modern .NET, code pages such as 1251 must first be registered with `Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);` in your project. The recommended way is to convert old files to UTF-8 and keep UTF-8 everywhere.

## The BOM

A **byte order mark** is a few bytes at the start of a file that announce the encoding (for UTF-8 it is `EF BB BF`). Some tools write it, and some do not need it. `File.ReadAllText` recognizes it and does not include it in the text. If a stray `ï»¿` appears at the start of your data, a BOM was read as characters in the wrong encoding.

## Line endings

Windows files usually end lines with `\r\n`, and Linux and macOS use `\n`. Reading through `ReadLine`, `ReadAllLines` or `ReadLines` handles both for you. Splitting text by hand with `Split('\n')` leaves a stray `\r` at the end of each line in a Windows file, so prefer the line-reading methods, or call `Trim()`.

## Reading a file line by line

A typical job is to process each line of a file, for example to count or to collect values:

```csharp
int total = 0;
foreach (string line in File.ReadAllLines("numbers.txt"))
{
    if (int.TryParse(line.Trim(), out int n))
    {
        total += n;
    }
}
Console.WriteLine(total);
```

It tolerates blank lines and bad lines: `TryParse` simply skips them. The same loop works on text in memory. With a `StringReader`, you can run this code on a literal string, with no file at all:

```csharp
var reader = new StringReader("10\n20\noops\n30");
string line;
int total = 0;
while ((line = reader.ReadLine()) != null)
{
    int n;
    if (int.TryParse(line, out n)) total += n;
}
Console.WriteLine(total);   // 60
```

## Text and binary

A **text** file contains characters in some encoding, and you read it with the text methods. A **binary** file (an image, an archive, a program) is just bytes. Never read it as text: the conversion would corrupt it. Use `File.ReadAllBytes` and `File.WriteAllBytes`, or a `FileStream`:

```csharp
byte[] data = File.ReadAllBytes("photo.jpg");
Console.WriteLine(data.Length + " bytes");
File.WriteAllBytes("copy.jpg", data);
```

## Good habits

- Choose UTF-8 for everything new, and say so explicitly in the code that must work on other computers.
- Never build a path with `+`; use `Path.Combine`.
- Close files (`using`), and handle the exceptions you can recover from.
- Put the file-reading in one small method and the **processing** of the text in another that takes a `string`. The second can then be tested without any file, which is exactly how the practice task for this module works.
