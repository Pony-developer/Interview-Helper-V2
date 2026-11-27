## Task

"Implement a calculator. Now add Roman numerals." Complete `Roman`:

1. **`ToRoman(int value)`** converts 1..3999 to a Roman numeral (`1994` → `MCMXCIV`, `4` → `IV`). Outside that range throw `ArgumentOutOfRangeException`: Roman numerals have no zero and no negatives. Hint: walk a table of the values `1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1` and their symbols, greedily.
2. **`FromRoman(string roman)`** converts back. A symbol smaller than the one after it is subtracted (`IV` = 5 − 1, `XC` = 100 − 10).
3. **`Calculate(string expression)`** evaluates `"XIV + IX"`: two Roman operands and one of `+ - * /` (integer division), separated by single spaces, and returns the result as a Roman numeral. If the result cannot be written in Roman numerals (zero or negative), let the `ArgumentOutOfRangeException` from `ToRoman` propagate.

Notice the design: the arithmetic works on `int`; Roman numerals are only parsing and formatting at the edges.

Expected output:

```
MCMXCIV IV MMMCMXCIX
1994 42
XIV + IX = XXIII
C - I = XCIX
XII * XII = CXLIV
X / III = III
V - X = out of range
```
