A shop prints receipts, and the columns must line up. Your job is to generate the text of a receipt.

Implement `Receipt(names, quantities, prices)`. It receives three arrays of the same length and returns the receipt as **one string**, with the lines separated by `\n` and no line break at the end.

The receipt has:

1. One line per item, in the format `{name,-10}{quantity,3} x {price,7:F2} = {total,8:F2}`: the name left-aligned in 10 characters, the quantity right-aligned in 3, then ` x `, the price right-aligned in 7 characters with 2 decimals, then ` = `, and the line total (quantity × price) right-aligned in 8 characters with 2 decimals.
2. A line of 34 hyphens `-`.
3. The line `TOTAL`, left-aligned in 26 characters, followed by the grand total right-aligned in 8 characters with 2 decimals.

Format the numbers with `CultureInfo.InvariantCulture`, so the decimal separator is always a dot (`using System.Globalization;` is already there). For `Tea`, `Coffee` and `Cake`, with the quantities 2, 1 and 3 and the prices 3.5, 4.25 and 12.9, the receipt is:

```text
Tea         2 x    3.50 =     7.00
Coffee      1 x    4.25 =     4.25
Cake        3 x   12.90 =    38.70
----------------------------------
TOTAL                        49.95
```

Do not change `Main`, which prints the result of your method.

Hint: `string.Format(CultureInfo.InvariantCulture, "{0,-10}{1,3} x {2,7:F2} = {3,8:F2}", ...)`, or interpolation with the same placeholders. For the hyphens, a loop or `new string('-', 34)`. Collect the lines in a `List<string>` and use `string.Join("\n", lines)`.
