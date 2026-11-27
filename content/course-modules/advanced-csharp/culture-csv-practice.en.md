## Task

`Main` deliberately sets the current culture to **de-DE**, where the decimal separator is a comma and dates look like `05.03.2024`. Your code must produce machine-readable output anyway.

1. **`Invoice.ToCsv(date, customer, amount, currency)`** builds one CSV line:
   - the date as `yyyy-MM-dd`, the amount with exactly two decimals and a dot (`1234.50`), both with `CultureInfo.InvariantCulture`;
   - fields joined with commas;
   - a text field that contains a comma or a double quote is wrapped in double quotes, and every quote inside is doubled (`The "Best" Shop` → `"The ""Best"" Shop"`).
2. **`Invoice.ParseAmount(text, cultureName)`** parses an amount typed in the given culture (`"1.234,50"` in de-DE, `"1,234.50"` in en-US) with `decimal.TryParse` and `NumberStyles.Number`. It returns `null` for invalid text.

Note that `Main` prints the parsed decimals with the **current** (German) culture, which is why they appear as `1234,50`.

Expected output:

```
2024-03-05,ACME Ltd,1234.50,EUR
2024-03-05,"Smith, John",99.00,USD
2024-03-05,"The ""Best"" Shop",0.10,UAH
1234,50
1234,50
invalid
1;2;3
```
