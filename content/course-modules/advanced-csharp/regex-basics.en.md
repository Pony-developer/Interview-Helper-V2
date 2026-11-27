## What a regular expression is

A regular expression (regex) is a pattern that describes a set of strings. .NET's engine lives in `System.Text.RegularExpressions`:

```csharp
bool valid = Regex.IsMatch("SKU-1042", @"^SKU-\d{4}$");               // test
Match m = Regex.Match("Order 42 shipped", @"\d+");                     // first match
Console.WriteLine(m.Value + " at " + m.Index);                         // 42 at 6
foreach (Match x in Regex.Matches("a1 b22 c333", @"\d+")) Console.Write(x.Value + " ");   // 1 22 333
string clean = Regex.Replace("too    many   spaces", @"\s+", " ");     // collapse whitespace
string[] parts = Regex.Split("a, b;c", @"\s*[,;]\s*");                 // split on several separators
```

Write patterns as **verbatim strings** (`@"..."`) so `\d` reaches the engine unchanged.

## Building blocks

| Pattern | Matches |
| --- | --- |
| `abc` | the literal text |
| `.` | any character except newline |
| `\d` / `\D` | a digit / a non-digit |
| `\w` / `\W` | a word character (letters, digits, `_`) / anything else |
| `\s` / `\S` | whitespace / non-whitespace |
| `[aeiou]`, `[a-z0-9]` | one character from a set or range |
| `[^0-9]` | one character **not** in the set |
| `\.` `\(` `\\` | escaped metacharacters, taken literally |
| `a\|b` | alternation: `a` or `b` |
| `^` / `$` | start / end of the input (or of a line with `Multiline`) |

Characters with special meaning (`. * + ? ( ) [ ] { } ^ $ | \`) need a backslash to be literal. `Regex.Escape(userText)` escapes a whole string, which is essential when user input becomes part of a pattern.

Note that in .NET `\d` and `\w` are **Unicode-aware**: `\d` also matches Arabic-Indic and other digits. Use `[0-9]` or `RegexOptions.ECMAScript` when you mean ASCII digits only.

## Anchors matter

`IsMatch` looks for the pattern **anywhere** in the input:

```csharp
Regex.IsMatch("my code is 12345!", @"\d{4}");      // True: "1234" is in there
Regex.IsMatch("my code is 12345!", @"^\d{4}$");    // False: the whole input must be 4 digits
```

For validation, always anchor. `\A` and `\z` are the strict "start/end of input" anchors (`$` also accepts a trailing newline).

## The Regex object

```csharp
private static readonly Regex Sku = new(@"^SKU-\d{4}$", RegexOptions.Compiled | RegexOptions.IgnoreCase);
bool ok = Sku.IsMatch(input);
```

Creating a `Regex` parses the pattern (and, with `Compiled`, generates IL), so create it once and reuse it: instances are thread-safe. The static helper methods cache recently used patterns (`Regex.CacheSize`, 15 by default).

## Interview takeaways

- `IsMatch`, `Match`/`Matches`, `Replace`, `Split` cover most needs.
- Escape metacharacters (and user input with `Regex.Escape`); use verbatim strings.
- Anchor validation patterns with `^...$` or `\A...\z`; reuse `Regex` instances.
