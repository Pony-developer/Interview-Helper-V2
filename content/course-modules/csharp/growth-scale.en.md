To compare algorithms, we need a feeling for how different functions grow. Some grow so slowly that you can ignore them, and others explode.

## The common functions

From the slowest to the fastest:

| Function | Name | Example |
| --- | --- | --- |
| 1 | constant | an array element, a dictionary lookup |
| log₂ n | logarithmic | binary search |
| √n | square root | trial division up to √n |
| n | linear | one pass over the data |
| n · log₂ n | linearithmic | an efficient sort |
| n² | quadratic | every pair of elements |
| n³ | cubic | the naive multiplication of two n × n matrices |
| 2ⁿ | exponential | all the subsets of a set |
| n! | factorial | all the orders (permutations) of n items |

## The numbers

Here are the values for several sizes. "Huge" means a number far beyond anything countable in practice.

| n | log₂ n | n · log₂ n | n² | n³ | 2ⁿ | n! |
| --- | --- | --- | --- | --- | --- | --- |
| 10 | 3 | 33 | 100 | 1 000 | 1 024 | 3 628 800 |
| 20 | 4 | 86 | 400 | 8 000 | about 10⁶ | about 2.4 · 10¹⁸ |
| 100 | 7 | 664 | 10 000 | 10⁶ | about 1.3 · 10³⁰ | huge |
| 1 000 | 10 | 9 966 | 10⁶ | 10⁹ | huge | huge |
| 1 000 000 | 20 | 2 · 10⁷ | 10¹² | 10¹⁸ | huge | huge |

Look at the row for 1 000 000: the logarithm is only **20**. The linear algorithm needs a million steps, and the quadratic one a million million.

## What it means in time

Take a computer that does 10⁹ operations a second:

| Operations | Time |
| --- | --- |
| 2 · 10⁷ (n log n, n = 10⁶) | 0.02 seconds |
| 10⁹ (n² with n ≈ 31 600, or n³ with n = 1 000) | 1 second |
| 10¹² (n², n = 10⁶) | about 17 minutes |
| 10¹⁸ (n³, n = 10⁶) | about 32 years |
| 2¹⁰⁰ ≈ 1.3 · 10³⁰ | about 4 · 10¹³ years, which is 3 000 times the age of the Universe |

An algorithm that takes **2ⁿ** steps is useless for `n = 100`, and no hardware will ever change it. This is why the difference between **polynomial** (n, n², n³) and **exponential** (2ⁿ, n!) growth is the most important dividing line in the whole subject.

## What size can you handle in about a second?

A rough guide, for a computer that does about 10⁸ to 10⁹ simple steps in a second:

| Complexity | A comfortable n |
| --- | --- |
| O(n!) | up to about 10 |
| O(2ⁿ) | up to about 25 |
| O(n³) | up to about 500 |
| O(n²) | up to about 10 000 |
| O(n log n) | up to about 10⁶ or 10⁷ |
| O(n) | up to about 10⁸ |
| O(log n) | any input that fits in memory |

This table is useful in the opposite direction, too. If a task says that `n` can be a million, an O(n²) algorithm is out of the question, and you need O(n log n) or better.

## The logarithm

Mathematically, `log₂ n` answers: "to what power must I raise 2 to get n?" In programs it is **how many times you can halve n until you reach 1**.

```text
1000 → 500 → 250 → 125 → 62 → 31 → 15 → 7 → 3 → 1       9 steps (log₂ 1000 ≈ 10)
```

The **base** of the logarithm does not matter for the growth class. `log₁₀ n` and `log₂ n` differ only by a constant factor (about 3.3), because `log₂ n = log₁₀ n / log₁₀ 2`. Constants are dropped, so we simply write **log n**.

A logarithm grows incredibly slowly. If the input doubles, the work grows by **one** step. If it becomes a thousand times larger, by about **ten** steps.

## Polynomial against exponential

The difference between n¹⁰ and 2ⁿ:

| n | n¹⁰ | 2ⁿ |
| --- | --- | --- |
| 10 | 10¹⁰ | 10³ |
| 50 | about 10¹⁷ | about 10¹⁵ |
| 100 | 10²⁰ | about 10³⁰ |
| 1 000 | 10³⁰ | about 10³⁰¹ |

For small `n`, the high-degree polynomial is the larger one. But the exponential **always** wins in the end. That is why "any polynomial" is considered feasible, and "exponential" is considered infeasible, as a matter of principle.

## Reading a graph

If you plot the functions, you see that:

- `log n` is almost a flat line;
- `n` is a straight line;
- `n log n` is a line that bends up slightly;
- `n²` is a parabola, and it climbs fast;
- `2ⁿ` goes up like a wall.

The ability to say, looking at a piece of code, "this is a wall, and that is a flat line" is the practical result of this lecture.
