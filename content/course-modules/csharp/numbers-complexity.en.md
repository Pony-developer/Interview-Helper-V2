With an array, `n` is the number of elements, and it is clear. With **numbers** there is a trap. What is the size of the input when the input is the number 1 000 000?

## The size of a number is its length

A number is written with digits. The number 1 000 000 has 7 digits, and a number a thousand times larger has only 3 more. The amount of information in `N` is about **log N**: the number of digits, or the number of bits.

So for algorithms with numbers, the honest input size is **b = log₂ N**, the number of bits. An algorithm that does `N` steps does about `2ᵇ` steps. It is **exponential** in the size of the input, even though it looks "linear in N".

This is why counting from 1 to N is a slow thing to do for a large N: it is fast only because "large" numbers in everyday programs have few digits.

## Digit tasks: O(log N)

A loop that peels off one digit at a time runs as many times as there are digits:

```csharp
static int DigitSum(long n)
{
    int sum = 0;
    while (n > 0)
    {
        sum += (int)(n % 10);
        n /= 10;
    }
    return sum;
}
```

For `n = 10¹⁸` it does 19 passes. The complexity is **O(log N)**, that is, **O(b)** in the size of the input: linear in the number of digits. This is genuinely fast.

## Trial division: O(√N)

The simplest primality test tries the divisors up to the square root:

```csharp
static bool IsPrime(long n)
{
    if (n < 2) return false;
    for (long d = 2; d * d <= n; d++)
        if (n % d == 0) return false;
    return true;
}
```

It does up to √N steps. For `N` around 10¹² that is 10⁶: instant. For `N` around 10¹⁸ it is 10⁹: about a second. But in terms of the **size of the input** `b = log₂ N`, `√N = 2^(b/2)`: exponential. A number of 300 digits would need about 10¹⁵⁰ steps, which is out of reach forever. That is exactly why the encryption of the internet is based on the **difficulty of factoring** large numbers: nobody knows a fast algorithm.

## Euclid's algorithm: O(log N)

The greatest common divisor of two numbers: replace the pair `(a, b)` by `(b, a mod b)` until `b` is zero.

```csharp
static long Gcd(long a, long b)
{
    while (b != 0)
    {
        long r = a % b;
        a = b;
        b = r;
    }
    return a;
}
```

After every two steps the numbers at least halve, so the number of steps is **O(log min(a, b))**, at most about five times the number of digits. Contrast it with the naive way, trying all the numbers from the smaller one down to 1: **O(N)**, exponential in the number of digits. For `Gcd(10¹⁸, 10¹⁷ + 3)`, Euclid takes under a hundred steps, while the naive way would take 10¹⁷.

## Power by repeated squaring: O(log p)

To calculate `xᵖ` by multiplying `x` by itself `p − 1` times is O(p). But `x¹⁶ = (((x²)²)²)²`: four squarings instead of fifteen multiplications.

```csharp
static long Power(long x, int p)
{
    long result = 1;
    while (p > 0)
    {
        if (p % 2 == 1) result *= x;   // this bit of p is 1
        x *= x;                        // square
        p /= 2;                        // the next bit
    }
    return result;
}
```

It makes about `log₂ p` rounds. Computing `x¹⁰⁰⁰⁰⁰⁰⁰⁰⁰` takes about 30 rounds instead of a billion. The same trick, with a remainder after each multiplication, is the heart of modern cryptography. (Mind the overflow: `long` holds only about 9 · 10¹⁸.)

## Factorial and Fibonacci

- `n!` by a loop makes `n` multiplications: **O(n)**. But the **numbers get huge**: 20! already fills a `long`, and `1000!` has 2 568 digits. With such numbers, a multiplication is not one step, but grows with the number of digits.
- The `n`-th Fibonacci number by a loop with two variables: **O(n)** additions. By the matrix method, or "fast doubling", **O(log n)** multiplications. The naive recursion is O(2ⁿ).

## The sieve of Eratosthenes

To find **all** the primes up to `N`, crossing out the multiples is much faster than testing each number separately:

```csharp
bool[] isComposite = new bool[N + 1];
for (int i = 2; (long)i * i <= N; i++)
    if (!isComposite[i])
        for (int j = i * i; j <= N; j += i)
            isComposite[j] = true;
```

The time is **O(N log log N)**: nearly linear. The price is **memory**: O(N) for the array. This is a typical trade of space for time.

## Pseudo-polynomial algorithms

Sometimes an algorithm is polynomial in the **value** of a number, but exponential in its **length**. Counting to N, trial division, and the standard dynamic-programming solution of the knapsack problem (time proportional to the capacity `W`) are like that. They are fine when the numbers are small, and hopeless when they have hundreds of digits. Always ask: *is the complexity in terms of the value, or of the number of digits?*

## Summary

| Task | Steps | In terms of the digits `b` |
| --- | --- | --- |
| sum of the digits | log N | linear |
| Euclid's gcd | log N | linear |
| power by squaring | log p | linear |
| trial division | √N | exponential |
| counting from 1 to N | N | exponential |
| gcd by trying all the numbers | N | exponential |

Remember to **check what `n` is** before you say "linear".
