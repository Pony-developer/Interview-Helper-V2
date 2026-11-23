A rectangle comes in as text: `width`, `height` and a `rate`. Turn the strings into numbers and print:

1. the area of the rectangle (`width × height`) as a whole number;
2. the area multiplied by `rate`.

Expected output:

```text
60
30
```

Use `int.Parse` for the whole numbers and `double.Parse(..., CultureInfo.InvariantCulture)` for `rate`. The `using System.Globalization;` line is already there.

Hint: `"12" * "5"` is not allowed, and `"12" + "5"` gives `"125"`. Convert first, calculate second.
