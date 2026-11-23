A whole number can be taken apart digit by digit with `n % 10` (the last digit) and `n / 10` (the number without it).

Implement two methods for non-negative whole numbers:

- `DigitSum(n)` returns the sum of the digits: `DigitSum(12345)` is `1 + 2 + 3 + 4 + 5 = 15`.
- `Reverse(n)` returns the number with its digits in reverse order: `Reverse(12345)` is `54321`. Zeros at the end of the original become leading zeros, which a number does not show: `Reverse(1200)` is `21`.

Do not convert the number to a string: use a `while` loop and arithmetic. Do not change `Main`. Expected output:

```text
15
0
27
1
54321
21
709
0
7
```

Hint: in `Reverse`, keep a `result`, and in every iteration shift it left by one digit and add the last digit of `n`: `result = result * 10 + n % 10`.
