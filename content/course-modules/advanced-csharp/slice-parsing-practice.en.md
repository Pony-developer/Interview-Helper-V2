## Task

The practice runtime is an older Mono without `Span<T>`, so you'll build the core idea yourself: a `readonly struct Slice` that is a **view** (text + start + length) over a string. Creating, trimming and sub-slicing it never copies characters; only `ToString()` allocates.

1. **`Sub(start, length)`**: a narrower view relative to this slice. Throw `ArgumentOutOfRangeException` if it would go outside the slice.
2. **`Trim()`**: move the start forward past spaces and the end backward past spaces; return the narrower view.
3. **`TryParseInt(out value)`**: parse digits directly (`value = value * 10 + (ch - '0')`), returning false for an empty slice or any non-digit. No `Substring`, no `int.Parse`.
4. **`Csv.SumColumn(text, column)`**: walk the text **forward only** with `IndexOf('\n')` and `IndexOf(',')`, slicing out lines and fields, and sum the requested column (trimmed); skip values that don't parse.

This is exactly how span-based parsers in modern .NET avoid creating a string per field.

Expected output:

```
[order-42 ,  1500] start=2 length=16
[1500] True 1500
False 0
False
qty total: 42
price total: 14
out of range
```
