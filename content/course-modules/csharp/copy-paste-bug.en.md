The program prints three price lines, each with VAT of 20%. The same code was copied three times, and one of the copies has a typo, so the third line is wrong.

Refactor the program:

1. Replace the magic number `20` with a constant named `VatPercent`.
2. Extract the repeated lines into a method `PrintWithVat(string name, int price)`.
3. Replace the three blocks in `Main` with three calls.

The bug disappears because only one copy of the logic is left. Expected output:

```text
Laptop: 100 + VAT 20 = 120
Mouse: 40 + VAT 8 = 48
Cable: 15 + VAT 3 = 18
```

Check the format: `name: price + VAT vat = total`.
