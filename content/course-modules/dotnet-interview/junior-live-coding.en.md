The practical tasks in the DOU list (calculator, primes, minimum, FizzBuzz, folder tree) are usually solved live — in a shared editor or on a whiteboard. How you work matters as much as the result.

## A process that works

1. **Restate the task and ask questions.** "So the input is a string without digits, and I return the encoded string? What about an empty string? Uppercase and lowercase are different characters?"
2. **Write 2–3 examples, including edge cases**, before coding: `"aaab" → "a3b"`, `"" → ""`, `"a" → "a"`, a run of 12.
3. **Say the plan and its complexity.** "One pass with two indexes, O(n) time, O(n) for the output."
4. **Code the simple version first.** Clear names, small helpers, no premature cleverness.
5. **Test by hand** with your examples — walk through the loop out loud.
6. **Improve and discuss**: edge cases, complexity, what you'd do in production (tests, validation, `StringBuilder`, `Span<T>`).

## Talk while you think

Silence is the worst signal. Narrate: "I need to know where a run ends… I'll keep `j` moving while the character is the same." If you're stuck, say what you've tried and ask for a hint — taking a hint well is a positive signal.

## Checklist of edge cases

- empty input, `null`, a single element;
- all elements equal, all different;
- negative numbers, zero, `int.MaxValue` / overflow;
- duplicates; already sorted / reverse sorted;
- very large input (does the algorithm still fit in time and memory?);
- Unicode and case for strings.

## C# habits that look good in an interview

```csharp
ArgumentNullException.ThrowIfNull(text);                 // guard clauses
if (text.Length == 0) return string.Empty;               // early return for edge cases
var sb = new StringBuilder(text.Length);                  // StringBuilder for building strings
foreach (var (key, count) in counts) { … }               // deconstruction
return items.Where(x => x > 0).OrderBy(x => x).ToList(); // LINQ when it's clearer, loops when they're faster
```

And habits that look bad: one-letter names everywhere, giant `Main`, swallowing exceptions, magic numbers, ignoring the edge cases you yourself listed.

## Complexity cheat sheet

| Pattern | Typical complexity |
|---|---|
| one pass over the input | O(n) |
| nested loops over the input | O(n²) |
| sort, then scan | O(n log n) |
| hash set / dictionary lookup in a loop | O(n) |
| binary search | O(log n) |
| trying all subsets / permutations | O(2ⁿ) / O(n!) |

The practice — run-length encoding — is a typical 15–20 minute live-coding task: simple to state, with several edge cases (runs of one, multi-digit counts, invalid input).
