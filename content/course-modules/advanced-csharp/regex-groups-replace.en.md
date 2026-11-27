## Capturing groups

Parentheses group part of a pattern and **capture** what it matched:

```csharp
Match m = Regex.Match("Order #1042 for 99.50 EUR", @"#(\d+) for (\d+\.\d{2}) (\w{3})");
string id = m.Groups[1].Value;        // 1042
string amount = m.Groups[2].Value;    // 99.50
string currency = m.Groups[3].Value;  // EUR
// Groups[0] is the whole match
```

**Named groups** are clearer and survive pattern edits:

```csharp
var rx = new Regex(@"#(?<id>\d+) for (?<amount>\d+\.\d{2}) (?<cur>[A-Z]{3})");
Match m2 = rx.Match(text);
if (m2.Success)
{
    int id = int.Parse(m2.Groups["id"].Value);
    decimal amount = decimal.Parse(m2.Groups["amount"].Value, CultureInfo.InvariantCulture);
}
```

- `(?:...)` groups **without** capturing (for alternation or quantifiers): `(?:https?|ftp)://`.
- An optional group that didn't participate has `Success == false` and an empty `Value`: check `Success` before parsing.
- A group under a quantifier keeps every repetition in `Group.Captures`.
- **Backreferences** match the same text again: `\b(\w+)\s+\1\b` finds doubled words ("the the"); named: `\k<word>`.

## Replacing

```csharp
// replacement patterns: $1, ${name}, $0 (the whole match), $$ (a literal $)
string iso = Regex.Replace("05.03.2024", @"(?<d>\d{2})\.(?<m>\d{2})\.(?<y>\d{4})", "${y}-${m}-${d}");   // 2024-03-05

// a MatchEvaluator computes each replacement in code
string masked = Regex.Replace(log, @"\b\d{12}(\d{4})\b", m => new string('*', 12) + m.Groups[1].Value);

string doubled = Regex.Replace("price 10, tax 2", @"\d+", m => (int.Parse(m.Value) * 2).ToString());   // price 20, tax 4
```

Use `${name}` with braces when the group name or number is followed by digits (`${1}0` vs `$10`).

## Splitting

```csharp
string[] fields = Regex.Split("pens ,ink;;  pads", @"\s*[,;]+\s*");   // pens | ink | pads
string[] keep = Regex.Split("a1b2c", @"(\d)");                          // a | 1 | b | 2 | c: captured separators are included
```

For simple single-character separators, `string.Split` is faster; use `Regex.Split` when separators vary.

## A small cookbook

| Task | Pattern |
| --- | --- |
| collapse whitespace | `\s+` → `" "` |
| trim each line | `(?m)^\s+|\s+$` → `""` |
| doubled words | `\b(\w+)\s+\1\b` |
| simple e-mail check | `^[^@\s]+@[^@\s]+\.[^@\s]+$` (real validation: send a confirmation mail) |
| ISO date | `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` |
| key=value pairs | `(?<key>\w+)=(?<value>[^;]*)` |
| camelCase to words | `(?<=[a-z])(?=[A-Z])` → `" "` |

Don't parse HTML, JSON or XML with regexes: use a real parser.

## Interview takeaways

- `( )` captures, `(?<name> )` names, `(?: )` only groups; check `Group.Success`.
- Replacement patterns use `$1`/`${name}`; a `MatchEvaluator` computes replacements in code.
- `Regex.Split` handles varying separators; captured separators are kept.
