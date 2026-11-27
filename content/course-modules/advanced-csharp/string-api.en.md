## Creating and inspecting strings

```csharp
string dashes = new string('-', 20);
string fromChars = new string(new[] { 'a', 'b', 'c' });
string empty = string.Empty;                 // same as ""

bool blank = string.IsNullOrWhiteSpace(input);
int pos = "invoice-2024".IndexOf('-');       // 7
bool has = path.EndsWith(".json", StringComparison.OrdinalIgnoreCase);
char last = name[^1];
```

Every method that seems to modify a string returns a **new** one: `Trim`, `Replace`, `Insert`, `Remove`, `PadLeft`, `ToUpperInvariant`, `Substring`.

## Splitting and joining

```csharp
string[] parts = "a, b,,c".Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
// { "a", "b", "c" }   (TrimEntries: .NET 5+)

string csv = string.Join(",", new[] { 1, 2, 3 });   // "1,2,3"
string all = string.Concat(words);                  // no separator
```

## Comparing strings: the most important decision

| Comparison | Use for |
| --- | --- |
| `Ordinal` | identifiers, keys, file paths, protocol tokens, anything machine-readable |
| `OrdinalIgnoreCase` | the same, case-insensitively (HTTP headers, file names on Windows) |
| `CurrentCulture` / `InvariantCulture` | text shown to users and sorted for humans |

```csharp
bool same = string.Equals(a, b, StringComparison.OrdinalIgnoreCase);
var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
list.Sort(StringComparer.CurrentCulture);
```

Culture-sensitive comparison can surprise you: in Turkish, `"file".ToUpper()` gives `"FİLE"` (dotted İ), so `"FILE" == "file".ToUpper()` fails. Always pass a `StringComparison` explicitly, and use `ToUpperInvariant`/`ToLowerInvariant` for non-user text.

`==` on strings is **ordinal** and case-sensitive. `CompareTo` and `string.Compare` without arguments are **culture-sensitive**: an easy source of bugs.

## String interning

String literals are **interned**: identical literals in an assembly share one instance. `string.Intern(s)` adds runtime strings to that pool. It rarely helps application code and keeps strings alive forever.

## StringBuilder

```csharp
var sb = new StringBuilder(capacity: 256);
foreach (var line in lines)
    sb.Append(line.Id).Append(';').AppendLine(line.Name);
sb.Insert(0, "Report\n").Replace(';', ',');
string report = sb.ToString();
```

`StringBuilder` keeps a resizable buffer (internally a linked list of chunks), so each `Append` is amortized O(1). Rules of thumb:

- a few concatenations in one expression → `+` or interpolation (the compiler turns `a + b + c` into one `string.Concat`);
- a loop or an unknown number of pieces → `StringBuilder` or `string.Join`;
- `sb.Clear()` lets you reuse the buffer.

## Interpolation, efficiently

C# 10 rewrote interpolated strings to use `DefaultInterpolatedStringHandler`: `$"{id}: {total}"` no longer boxes `id` and `total` and builds the result with pooled buffers. Libraries can accept their own handlers, which is how logging can skip building a message when the log level is disabled.

## Interview takeaways

- Strings are immutable; every "change" allocates a new string.
- Pass `StringComparison` explicitly: `Ordinal` for machines, culture for humans.
- `StringBuilder` for loops; plain `+` or interpolation for a fixed number of parts.
