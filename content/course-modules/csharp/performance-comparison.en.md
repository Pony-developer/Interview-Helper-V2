Linear search is O(n), and binary search is O(log n). That settles the argument on paper. In practice you should know **how big** the difference is, **when** it appears, and how to measure it honestly.

## The numbers of steps

For one successful search in the worst case:

| n | Linear search | Binary search | The ratio |
| --- | --- | --- | --- |
| 10 | 10 | 4 | 2.5× |
| 100 | 100 | 7 | 14× |
| 1 000 | 1 000 | 10 | 100× |
| 1 000 000 | 1 000 000 | 20 | 50 000× |
| 1 000 000 000 | 1 000 000 000 | 30 | 33 000 000× |

The gap grows with `n`. At a million elements, one linear search does about as much work as 50 000 binary searches.

## It is not only the search: add the sorting

Binary search needs sorted data. Suppose the data is **not** sorted, and you have `k` queries. Compare:

- **Linear searches**: `k` queries, each at most `n` steps: about **k · n**.
- **Sort, then binary searches**: **n · log n** for the sort, then **k · log n**: about **(n + k) · log n**.

For `n = 1 000 000`:

| k (the number of queries) | Linear: k · n | Sort + binary: (n + k) · 20 |
| --- | --- | --- |
| 1 | 10⁶ | about 2 · 10⁷ (**worse**) |
| 20 | 2 · 10⁷ | about 2 · 10⁷ (equal) |
| 1 000 | 10⁹ | about 2 · 10⁷ (**50 times better**) |
| 1 000 000 | 10¹² | about 4 · 10⁷ (**25 000 times better**) |

The **break-even point** is around `k ≈ log n`. For one search, sorting is a waste. For a thousand, it is a bargain. If the data is already sorted (read from a database with an index, kept sorted on insertion), you pay no sorting cost at all.

## A third option: a hash table

A `Dictionary` or `HashSet` answers "is it there?" in **O(1)** on average, and building it from the data costs O(n):

| Method | Preparation | One query |
| --- | --- | --- |
| Linear search | none | O(n) |
| Binary search | sort, O(n log n) | O(log n) |
| `HashSet` | build, O(n) | O(1) on average |

For plain membership, a `HashSet` usually wins. Binary search still has uses that a hash table does not have:

- it works on **ordered** data: "the first element that is not smaller than x", "the closest element", "how many are between a and b" (the **bounds**, in this module's practice tasks);
- it needs no extra memory when the array is already there;
- it gives a deterministic worst case, with no hash collisions.

## Measuring honestly

Counting comparisons is exact and is the same on every computer. Sometimes you want real time, too. In .NET, use `Stopwatch`:

```csharp
using System.Diagnostics;

var data = new int[1_000_000];
for (int i = 0; i < data.Length; i++) data[i] = i * 2;     // sorted, all even

var timer = Stopwatch.StartNew();
int found = 0;
for (int x = 0; x < 1000; x++)                              // 1000 queries
    if (Array.BinarySearch(data, x * 2) >= 0) found++;
timer.Stop();

Console.WriteLine(found + " found in " + timer.Elapsed.TotalMilliseconds + " ms");
```

(Digit separators such as `1_000_000` need C# 7 or later.)

A benchmark that tells the truth is harder to write than it looks:

- **Warm up.** The first run includes the time to compile the code just in time, to load libraries and to fill the caches. Run the code once before you start the timer.
- **Repeat and take the median.** One measurement is noise. Run it many times, and look at the middle value or the minimum.
- **Use release mode.** A debug build disables optimizations, and the numbers say nothing about the real program.
- **Do not let the work disappear.** If you throw the result away, a smart compiler may remove the whole computation. Use the result: print it or add it to a total.
- **Measure what you mean.** Do not include the time to build the data, or to print, in the time of the search.
- **Compare like with like**: the same data, on the same computer, with nothing else running.

For serious measurements, there is a library, **BenchmarkDotNet**, which does the warming up, the repetition and the statistics for you.

## When linear search wins

Constants matter for small `n`. A linear search loop is very simple, and reads memory in order, which the processor loves. Binary search jumps around the array and makes a **hard-to-predict branch** at every step. For arrays of up to a few dozen elements, a linear scan is often as fast as binary search or faster, and it needs no sorting.

So the right question is never just "which has the smaller O?". Ask:

1. How big is `n`?
2. How many searches will there be?
3. Is the data sorted, or can it be kept sorted cheaply?
4. Is the data changing? (Keeping an array sorted under insertions costs O(n) each time.)

## Counting instead of timing

To compare the two in this course, we **count the steps**. The result does not depend on the machine, and it is exactly repeatable, which suits a task whose answer must be checked by comparing the output.

```csharp
static int LinearSteps(int[] a, int value)
{
    int steps = 0;
    for (int i = 0; i < a.Length; i++)
    {
        steps++;
        if (a[i] == value) break;
    }
    return steps;
}
```

You wrote exactly such counters in the practice task "Counting the steps" of the module on complexity.

## The summary

- Binary search is **astronomically** faster for big sorted data: 30 steps against a billion.
- Sorting is an investment: it pays off after about `log n` queries.
- A hash table is often better for pure membership tests, and binary search for questions about **order**.
- For tiny arrays, do not bother: a simple loop is just as good.
- Measure honestly, or count the steps.
