## Task

A typical 15-minute live-coding task in the spirit of the Junior practical tasks. Complete `Rle`:

1. **`Encode(text)`** — replace each run of the same character with the character followed by the run length; a run of one keeps just the character: `"aaabccdddd"` → `"a3bc2d4"`, `""` → `""`. The input never contains digits. Use a `StringBuilder` and two indexes: `i` at the start of a run, `j` moving while the character is the same.
2. **`Decode(encoded)`** — the reverse. Counts may have **several digits** (`"x12y"` → twelve `x` and one `y`), and a character without a count appears once. If the text **starts with a digit**, throw `FormatException`.

Think about the edge cases before you code: empty string, runs of one, runs longer than 9, the last run of the string.

Expected output:

```
'aaabccdddd' -> 'a3bc2d4'
'abc' -> 'abc'
'' -> ''
'zzzzzzzzzzzzy' -> 'z12y'
'a3bc2d4' -> 'aaabccdddd'
'x12y' -> 'xxxxxxxxxxxxy'
'q' -> 'q'
w100ab10 True
FormatException
```
