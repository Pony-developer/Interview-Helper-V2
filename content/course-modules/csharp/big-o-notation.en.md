The previous lectures counted operations and found expressions such as `3n² + 5n + 2`. **Big-O notation** is a way of saying "how fast does this grow?" without the details that do not matter for large inputs.

## The idea

For a large `n`, the largest term dominates, and the constant factors depend on the computer anyway. So we keep only the **shape**:

```text
T(n) = 3n² + 5n + 2      →      O(n²)
```

| n | 3n² | 5n | 2 | the sum |
| --- | --- | --- | --- | --- |
| 10 | 300 | 50 | 2 | 352 |
| 100 | 30 000 | 500 | 2 | 30 502 |
| 10 000 | 300 000 000 | 50 000 | 2 | 300 050 002 |

At `n = 10 000`, the `n²` term is more than 99.98% of the total. The rest is noise.

## The definition

We say that `f(n)` is **O(g(n))** if, from some size on, `f` is never larger than a constant multiple of `g`:

```text
f(n) ≤ c · g(n)    for all n ≥ n₀
```

for some constants `c` and `n₀`.

For example, `3n² + 5n + 2` is O(n²): choose `c = 4` and `n₀ = 6`. For `n ≥ 6`, we have `n² − 5n − 2 ≥ 0`, so `3n² + 5n + 2 ≤ 4n²`.

You do not need to prove it every time. The **rules** below are enough.

## The rules

**1. Drop the constant factors.**
`5n` is O(n), `100 · n²` is O(n²), and `n / 2` is O(n).

**2. Keep only the fastest-growing term.**
`n² + 1000n + 7` is O(n²). `n log n + n` is O(n log n). `2ⁿ + n¹⁰⁰` is O(2ⁿ).

**3. Sequential parts add, and the larger wins.**
O(n) followed by O(n²) is O(n + n²) = **O(n²)**.

**4. Nested parts multiply.**
A loop of n passes, with an O(log n) loop inside, is O(n · log n).

**5. Different variables stay different.**
Two nested loops over `n` and `m` elements are O(n · m), and two consecutive ones are O(n + m).

**6. The base of a logarithm is irrelevant.**
O(log₂ n) = O(log₁₀ n) = O(log n).

**7. A polynomial is as big as its highest power.**
`4n³ + 2n² + 9` is O(n³).

## O is an upper bound

`O(g)` promises that the growth is **at most** `g`. That means that a linear algorithm is **also** O(n²), and O(n³), and O(2ⁿ): all of those are true, just not informative. By convention we give the **smallest** class that we can prove.

Related notations say more:

| Notation | Meaning | In words |
| --- | --- | --- |
| **O(g)** | at most g (an upper bound) | "no worse than" |
| **Ω(g)** | at least g (a lower bound) | "no better than" |
| **Θ(g)** | both at most and at least g (a tight bound) | "exactly this growth" |

For example, linear search is **O(n)** and also Ω(1) in general: in the best case it finds the value at once. Summing an array is **Θ(n)**: it always takes about `n` steps, never fewer. When people say "O(n)" in everyday speech, they usually mean the tight Θ(n).

## O is not "the worst case"

These are two different things:

- **Case**: best, average, worst. It says *which input* we are analysing.
- **Notation**: O, Ω, Θ. It says *whether* we give an upper, a lower or a tight bound.

You can give an O bound for the best case, or for the average, or for the worst. But the most common statement, "the worst case is O(n)", is exactly an upper bound on the worst case.

## Examples

| Code | Complexity |
| --- | --- |
| `x = a[5]` | O(1) |
| a loop over `n` elements | O(n) |
| halving `n` until 1 | O(log n) |
| a loop of `n`, with a halving loop inside | O(n log n) |
| two nested loops over `n` | O(n²) |
| three nested loops over `n` | O(n³) |
| all the subsets of `n` elements | O(2ⁿ) |
| all the permutations of `n` elements | O(n!) |

## Common mistakes

- **Writing the constants**: "O(2n)". Just O(n).
- **Writing the small terms**: "O(n² + n)". Just O(n²).
- **Treating O as an exact time**: O(n²) does not say that it takes `n²` seconds.
- **Saying that an O(n) algorithm is always faster than an O(n²) one.** Only for large enough `n`. Both may have different constants: an algorithm that takes `100n` steps is slower than one that takes `n²` for any `n < 100`.
- **Ignoring memory**: you can also describe the space with Big O.
- **Forgetting what `n` is.** If an algorithm works on a number rather than on an array, `n` is often the number of digits (see the lecture on numbers).

## Why constants still matter

Big O is about growth for **large** inputs. For small ones, and in practice, the constants, memory access patterns and the cost of simple operations all count. This is why real libraries often switch to a simple O(n²) algorithm for tiny arrays, and use a smarter one for the big ones. Big O tells you which algorithm to *consider*. A measurement tells you which one is *faster on your data*.
