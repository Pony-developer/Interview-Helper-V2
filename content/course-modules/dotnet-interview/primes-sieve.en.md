## Task

"Write a program that checks whether a number is prime" is on the Junior list. The interviewer then asks: "And if you need all primes up to a million?" and "How would you factorize a number?" Complete `Primes`:

1. **`IsPrime(n)`** — trial division. Numbers below 2 are not prime; 2 is the only even prime; then check odd divisors `d` while `d * d <= n`. It must handle `int.MaxValue` (2147483647, a prime) quickly and without overflow — compute `d * d` in `long`.
2. **`Sieve(limit)`** — all primes up to `limit` with the **sieve of Eratosthenes**: a `bool[]` of "composite" flags; for each prime `i`, mark `i*i, i*i + i, …` as composite. O(n log log n) instead of n separate checks. Return an empty list for `limit < 2`.
3. **`Factorize(n)`** — prime factors in ascending order (`360` → `2 2 2 3 3 5`): divide by `d` while it divides, for `d` from 2 while `d * d <= n`; whatever is left above 1 is the last prime factor.

Expected output:

```
2 3 5 7 11 13 17 19 23 29
True False True
15 primes up to 50, last 47
[]
2 2 2 3 3 5
97
7 11 13
```
