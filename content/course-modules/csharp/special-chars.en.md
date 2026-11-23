Some characters cannot be typed inside a string literal in the usual way: a line break, a tab, a quote. And a `char` is more than a letter: it is also a number. This lecture covers both.

## Escape sequences

A backslash starts a special character:

| Written | Character |
| --- | --- |
| `\n` | new line (line feed) |
| `\r` | carriage return (Windows line endings are `\r\n`) |
| `\t` | tab |
| `\\` | a backslash |
| `\"` | a double quote inside a string |
| `\'` | a single quote inside a `char` |
| `\0` | the null character (code 0) |
| `\u0436` | the character with the Unicode code 0436 hex (here, Cyrillic ж) |
| `\x41` | the character with the hex code 41 (A) |

```csharp
Console.WriteLine("Name:\tAnn\nAge:\t31");
```

```text
Name:   Ann
Age:    31
```

```csharp
Console.WriteLine("She said \"hi\"");   // She said "hi"
Console.WriteLine("C:\\temp\\file.txt"); // C:\temp\file.txt
```

A **verbatim string** `@"..."` takes backslashes literally, and a line break in the source becomes a line break in the string. The quote is doubled inside it:

```csharp
string path = @"C:\temp\file.txt";
string poem = @"roses are red
violets are blue";
string quoted = @"She said ""hi""";
```

## A platform-independent line break

`\n` is enough on most systems, but Windows text files use `\r\n`. When the exact platform convention matters, use `Environment.NewLine`. `Console.WriteLine` already does it for you.

## char is a number

A `char` holds a **UTF-16 code unit**, a number from 0 to 65535, which is displayed as a character. You can convert between the two:

```csharp
char letter = 'A';
int code = letter;                 // 65
char next = (char)(letter + 1);    // 'B'
Console.WriteLine((int)'a');       // 97
Console.WriteLine((char)100);      // d
```

Arithmetic on a `char` gives an `int`, so a cast back is needed: `letter + 1` is `66`, not `'B'`.

Within the alphabet, the codes of the letters are consecutive, and that allows tricks:

```csharp
int position = 'e' - 'a';                  // 4: 'e' is the fifth letter
char third = (char)('a' + 2);              // 'c'
bool isLower = c >= 'a' && c <= 'z';       // a range check
```

The capital letters `'A'`–`'Z'` are 65–90, the lower-case ones `'a'`–`'z'` are 97–122, and the digits `'0'`–`'9'` are 48–57. This is why `'7' - '0'` is the number `7`, and the difference between a lower-case letter and its capital is 32.

## The char helpers

```csharp
char.IsLetter('x')         // True
char.IsDigit('7')          // True
char.IsLetterOrDigit('_')  // False
char.IsUpper('Q')          // True
char.IsLower('Q')          // False
char.IsWhiteSpace(' ')     // True (also tab and newline)
char.IsPunctuation('!')    // True
char.ToUpper('a')          // 'A'
char.ToLower('Z')          // 'z'
```

These understand all alphabets, not only English letters: `char.IsLetter('ж')` is `True`.

## Unicode and the console

C# strings are Unicode, so `"Привіт"` and `"こんにちは"` are valid. Whether they **appear** correctly depends on the console and its encoding. If you see `?` or boxes, the data is fine, and the display is the problem.

A few details:

- `Length` counts UTF-16 code units. Most characters take one. Some, such as many emoji, take **two**, called a surrogate pair, so `"😀".Length` is `2`.
- `ToUpper` and `ToLower` depend on the language rules. Turkish, for example, has the special `İ` and `ı`. For comparisons that must not depend on the language, use `ToUpperInvariant()` and `ToLowerInvariant()`.

## Typical uses

**Is this word made of letters only?**

```csharp
static bool IsWord(string s)
{
    foreach (char c in s)
    {
        if (!char.IsLetter(c)) return false;
    }
    return s.Length > 0;
}
```

**The digit characters to a number**

```csharp
int value = 0;
foreach (char c in "472")
{
    value = value * 10 + (c - '0');
}
Console.WriteLine(value);   // 472
```
