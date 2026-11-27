## Quantifiers

| Quantifier | Meaning |
| --- | --- |
| `*` | 0 or more |
| `+` | 1 or more |
| `?` | 0 or 1 (optional) |
| `{n}` | exactly n |
| `{n,}` | n or more |
| `{n,m}` | between n and m |

```csharp
Regex.IsMatch("colour", @"^colou?r$");          // u is optional
Regex.IsMatch("2024-3-5", @"^\d{4}-\d{1,2}-\d{1,2}$");
```

A quantifier applies to the single item before it: a character, a class, or a group in parentheses: `(ab)+` repeats `ab`.

## Greedy vs lazy

By default quantifiers are **greedy**: they take as much as possible, then give back (backtrack) only if the rest of the pattern fails. Adding `?` makes them **lazy**: as little as possible.

```csharp
string html = "<b>one</b> and <b>two</b>";
Regex.Match(html, "<b>.*</b>").Value;    // "<b>one</b> and <b>two</b>": greedy runs to the LAST </b>
Regex.Match(html, "<b>.*?</b>").Value;   // "<b>one</b>": lazy stops at the FIRST </b>
```

Often an even better choice is a negated class that can't overrun: `<b>[^<]*</b>`.

## Zero-width assertions

Assertions check a condition at a **position** without consuming characters.

| Assertion | Succeeds where |
| --- | --- |
| `^`, `$`, `\A`, `\z` | start/end of input (or line in Multiline mode) |
| `\b` | a word boundary (between `\w` and `\W`) |
| `\B` | not a word boundary |
| `(?=...)` | **lookahead**: what follows matches |
| `(?!...)` | **negative lookahead**: what follows doesn't match |
| `(?<=...)` | **lookbehind**: what precedes matches |
| `(?<!...)` | **negative lookbehind** |

```csharp
// whole words only
Regex.Matches("cat concatenate cat.", @"\bcat\b").Count;   // 2

// password rule: 8+ chars, at least one digit and one uppercase letter
Regex.IsMatch(pwd, @"^(?=.*\d)(?=.*[A-Z]).{8,}$");

// a price number preceded by a currency sign, without capturing the sign
Regex.Match("Total: $42.50", @"(?<=\$)\d+(\.\d{2})?").Value;   // 42.50

// "error" not followed by "-free"
Regex.IsMatch(text, @"\berror\b(?!-free)");
```

Lookaheads are the standard way to express several independent conditions ("contains a digit AND an uppercase letter") in a single pattern. .NET supports **variable-length lookbehind**, which many other engines don't.

## Options that change matching

| Option | Inline | Effect |
| --- | --- | --- |
| `IgnoreCase` | `(?i)` | case-insensitive |
| `Multiline` | `(?m)` | `^`/`$` match at line starts/ends |
| `Singleline` | `(?s)` | `.` also matches `\n` |
| `IgnorePatternWhitespace` | `(?x)` | allow spaces and `#` comments in the pattern |
| `ExplicitCapture` | `(?n)` | only named groups capture |

```csharp
var phone = new Regex(@"
    ^\+?(?<country>\d{1,3})?   # optional country code
    [\s-]?\(?(?<area>\d{3})\)? # area code, maybe in parentheses
    [\s-]?(?<number>\d{3}[\s-]?\d{4})$", RegexOptions.IgnorePatternWhitespace);
```

## Interview takeaways

- `*`, `+`, `?`, `{n,m}` quantify the item before them; greedy by default, lazy with a trailing `?`.
- `\b` and lookarounds check positions without consuming text.
- Lookaheads combine independent conditions; `IgnorePatternWhitespace` makes complex patterns readable.
