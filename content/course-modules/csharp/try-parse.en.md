Write the method `DoubleIt(text)`. It receives text from a form and:

- if the text is a valid whole number (`int`), returns that number **doubled**, as text;
- otherwise returns the text `invalid`.

The method must not crash on any input, including `"abc"`, the empty string, `"3.5"` and `"99999999999"` (too big for an `int`). Use `int.TryParse` with the pattern from the lecture:

```csharp
if (int.TryParse(text, out int number))
{
    // here number holds the parsed value
}
```

Do not change `Main`. Expected output:

```text
84
invalid
invalid
-30
invalid
invalid
```

Hint: `(number * 2).ToString()` turns the result back into text.
