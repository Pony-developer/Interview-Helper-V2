Four recursive methods have been written quickly, and **each of them has one bug**. `Main` runs ten checks, in the same style as in the testing module, and most of them are red.

The methods:

- `Factorial(n)` is `n!`, and `0! = 1`.
- `SumTo(n)` is the sum `1 + 2 + ... + n`, and `SumTo(0) = 0`.
- `Power(x, p)` is `x` to the power `p`, and anything to the power 0 is 1.
- `CountDigits(n)` is the number of digits of a non-negative number. The number `0` has **one** digit.

Find the bugs and fix them. Do not change the checks. Think about each method, the **base case** and the **recursive case**, and look for the one that does not fit the definition above. When everything is right, the output is:

```text
ok: Factorial(5)
ok: Factorial(0)
ok: SumTo(10)
ok: SumTo(0)
ok: Power(2, 10)
ok: Power(5, 0)
ok: Power(3, 3)
ok: CountDigits(12345)
ok: CountDigits(7)
ok: CountDigits(0)
```

Hint: a wrong base case spoils **every** answer, because all the results are built from it. A wrong operator in the recursive case shows up for the inputs that need at least one recursive call. Trace a small input by hand, such as `SumTo(2)`, to see what each level returns.
