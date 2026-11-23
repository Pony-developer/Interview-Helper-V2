The powers of two are 1, 2, 4, 8, 16, 32 and so on. For a given `n`, find the **smallest power of two that is greater than or equal to `n`**.

Implement `PowerOfTwo(n)`. It returns the text `n: 2^k = p`, where `p` is that power of two and `k` is its exponent. Use a `while` loop and double a value until it reaches `n`, counting the steps.

Examples:

- for `5` the answer is `8`, which is 2³, so the text is `5: 2^3 = 8`;
- for `16` the answer is `16` itself (2⁴), because 16 is already a power of two;
- for `1` the answer is `1` (2⁰).

Do not change `Main`. Expected output:

```text
1: 2^0 = 1
5: 2^3 = 8
16: 2^4 = 16
17: 2^5 = 32
1000: 2^10 = 1024
1000000: 2^20 = 1048576
```

Hint: start with `power = 1` and `k = 0`. While `power < n`, double `power` and add one to `k`. The loop body runs zero times when `n` is 1.
