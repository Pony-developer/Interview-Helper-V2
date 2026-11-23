You can write a program that gives the right answer and still be unable to use it. The reason is often not a bug, but the **choice of the algorithm**.

## One problem, two algorithms

Find a name in a phone book of 1 000 000 entries, sorted alphabetically.

- **Scan** from the first page: up to 1 000 000 looks.
- **Open in the middle**, decide which half to keep, and repeat: at most **20** looks, because 2²⁰ ≈ 1 000 000.

Both give the right answer. One is 50 000 times faster, and the gap **grows** with the size of the book. For a phone book of a billion names, the scan needs a billion looks, and the halving needs 30.

## The same idea in numbers

A modern processor does something like 10⁸ to 10⁹ simple operations per second. Let us take 10⁸:

| Operations | Time |
| --- | --- |
| 10⁶ | 0.01 s |
| 10⁸ | 1 s |
| 10¹⁰ | 100 s (almost 2 minutes) |
| 10¹² | 10 000 s (almost 3 hours) |
| 10¹⁵ | 10⁷ s (about 4 months) |

Now compare two ways of sorting 1 000 000 numbers:

- a simple method that compares every pair, about n² = 10¹² operations: **3 hours**;
- a good method, such as the one behind `Array.Sort`, about n · log₂ n ≈ 2 · 10⁷ operations: **0.2 seconds**.

The same computer, the same data, the same correct result.

## A faster computer does not rescue a bad algorithm

Suppose your computer becomes **100 times faster**. How much bigger a problem can you solve in the same time?

| Algorithm | The size you can handle |
| --- | --- |
| about n steps | 100 times larger |
| about n² steps | only **10** times larger |
| about 2ⁿ steps | just **7** more elements (since 2⁷ ≈ 100) |

For a slow-growing algorithm, a better machine helps a lot. For a fast-growing one, almost nothing. Waiting for faster hardware is not a plan: a better algorithm is.

## Even a formula is an algorithm

Add up the numbers from 1 to n:

```csharp
long sum = 0;
for (int i = 1; i <= n; i++)
    sum += i;                      // n steps
```

```csharp
long sum = (long)n * (n + 1) / 2;  // 1 step, whatever n is
```

The second version does not loop at all, and it takes the same time for n = 10 and for n = 10 000 000 000.

## Famous costs of a bad choice

**Fibonacci by the definition**

```csharp
static long Fib(int n) => n < 2 ? n : Fib(n - 1) + Fib(n - 2);
```

`Fib(50)` makes more than 10¹⁰ calls, because the same values are calculated again and again. A loop that remembers the last two numbers needs **50** steps.

**Checking every pair for duplicates**

Compare every element with every other element: n² steps. Put the elements into a `HashSet` and ask "have I seen this?": about n steps. For a million elements, that is 10¹² against 10⁶.

## Where it matters

Almost everything you use is made of algorithms that were chosen with their cost in mind: search engines and maps (routes, nearest places), sorting and filtering lists, compression of files and video, spell checkers, recommendations, databases (indexes make a query logarithmic instead of linear), encryption.

## Algorithm first, micro-optimization later

Making a loop 20% faster by rewriting its body is a small win. Replacing an O(n²) algorithm with an O(n log n) one for a large input is a win of thousands of times. So the order is:

1. Make it correct.
2. Choose an algorithm of a suitable complexity.
3. Only then, and only if it is measured to be slow, tune the details.

This module gives you the vocabulary, **complexity** and **Big O**, to compare algorithms before running them.
