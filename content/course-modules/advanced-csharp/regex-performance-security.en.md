## How the engine works

.NET's default engine is a **backtracking** engine: it tries to match the pattern step by step and, when a path fails, goes back and tries the next alternative (a shorter greedy match, another branch of `|`). That's what makes backreferences and lookarounds possible, and also what can make some patterns extremely slow.

## Four ways to run a regex

| Approach | Construction | Matching | Use for |
| --- | --- | --- | --- |
| `new Regex(p)` (interpreted) | fast | slowest | one-off patterns |
| `RegexOptions.Compiled` | slow (generates IL) | fast | hot patterns reused many times |
| `[GeneratedRegex]` (.NET 7) | at build time | fast, no startup cost | known patterns; works with Native AOT |
| `RegexOptions.NonBacktracking` (.NET 7) | moderate | linear time guaranteed | untrusted input |

```csharp
public static partial class Patterns
{
    [GeneratedRegex(@"^\d{4}-\d{2}-\d{2}$", RegexOptions.CultureInvariant)]
    public static partial Regex IsoDate();
}

bool ok = Patterns.IsoDate().IsMatch(input);
```

In all cases, create the `Regex` once (a static field) and reuse it; instances are thread-safe.

## Catastrophic backtracking and ReDoS

Some patterns, on some inputs, make a backtracking engine try an **exponential** number of paths:

```csharp
var evil = new Regex(@"^(a+)+$");
evil.IsMatch(new string('a', 30) + "!");   // practically never finishes
```

Nested quantifiers over the same characters (`(a+)+`, `(\w+\s?)*`, `(.*,)*`) can split the input in countless ways, and when the overall match fails the engine tries them all. If an attacker controls the input, this is a **Regular expression Denial of Service (ReDoS)**: one request pins a CPU core.

Defenses:

1. **Always set a timeout** for patterns applied to untrusted input:

```csharp
var rx = new Regex(pattern, RegexOptions.None, matchTimeout: TimeSpan.FromMilliseconds(100));
try { rx.IsMatch(input); }
catch (RegexMatchTimeoutException) { /* reject the input */ }
// or process-wide: AppContext.SetData("REGEX_DEFAULT_MATCH_TIMEOUT", TimeSpan.FromSeconds(1));
```

2. **Write unambiguous patterns**: avoid nested quantifiers on overlapping character sets; prefer specific classes (`[^,]*` instead of `.*`); anchor the pattern.
3. Use **atomic groups** `(?>...)` (or possessive behavior) to forbid backtracking into a sub-match.
4. For untrusted input in .NET 7+, use **`RegexOptions.NonBacktracking`**: it guarantees linear time (no backreferences or lookarounds allowed).
5. Never build patterns from user input without `Regex.Escape`.

## Other performance tips

- Use `RegexOptions.CultureInvariant` with `IgnoreCase` to avoid culture surprises (Turkish i).
- `ExplicitCapture` (or `(?:...)`) avoids allocating groups you don't need.
- `Regex.EnumerateMatches` (.NET 7) and `IsMatch(ReadOnlySpan<char>)` avoid allocating `Match` objects.
- For simple checks, plain string methods (`StartsWith`, `IndexOfAny`, `char.IsDigit` loops) beat regexes and are easier to read.

## Interview takeaways

- The default engine backtracks; nested ambiguous quantifiers can take exponential time.
- ReDoS defenses: timeouts, unambiguous patterns, atomic groups, `NonBacktracking`, escaping user input.
- Reuse `Regex` instances; prefer `[GeneratedRegex]` for known patterns.
