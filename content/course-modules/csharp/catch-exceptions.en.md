The method `Divide` takes two numbers as text and returns their quotient. It works for good input, but on bad input the program crashes after the first line.

Make `Divide` handle the failures with `try` and `catch`, and return a message instead of throwing:

| Problem | Exception | Returned text |
| --- | --- | --- |
| division by zero | `DivideByZeroException` | `Cannot divide by zero` |
| text is not a number | `FormatException` | `Not a number` |
| number does not fit in `int` | `OverflowException` | `Number is too big` |

On success it returns `Result: ` followed by the quotient. Do not change `Main`. Expected output:

```text
Result: 5
Cannot divide by zero
Not a number
Number is too big
Done
```

Catch each exception type separately, and do not use a bare `catch (Exception)`.
