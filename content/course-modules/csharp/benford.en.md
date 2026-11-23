**Benford's law** says that in many real collections of numbers, the leading digit is not spread evenly. The digit 1 leads about 30% of the numbers, and 9 only about 5%. The sequences that grow exponentially, such as the Fibonacci numbers, follow it nicely.

Check it on the first 50 Fibonacci numbers: `1, 1, 2, 3, 5, 8, 13, 21, ...` (each number is the sum of the two before it).

Implement three methods:

- `Fibonacci(count)` returns a `long[]` with the first `count` Fibonacci numbers, starting with two ones.
- `FirstDigit(n)` returns the first digit of a positive number: `FirstDigit(4096)` is `4`. Do not convert to a string: divide by 10 while the number is 10 or larger.
- `CountFirstDigits(numbers)` returns an `int[]` of length 10, where the element `d` is how many numbers start with the digit `d`. The element 0 stays 0.

`Main` prints how many Fibonacci numbers out of the first 50 start with each of the digits 1 to 9. Do not change `Main`. Expected output:

```text
1: 16
2: 9
3: 6
4: 4
5: 4
6: 3
7: 3
8: 3
9: 2
```

The counts add up to 50, and 16 of 50 is 32%, close to Benford's 30%.

Hint: the 50th Fibonacci number is 12 586 269 025, which does not fit in an `int`, so use `long`.
