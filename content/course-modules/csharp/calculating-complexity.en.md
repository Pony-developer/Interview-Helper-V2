To find the complexity of a piece of code, you count how many times its operations run, as a function of `n`. A few rules cover almost every case.

## The rules

**1. A simple statement is one step.**

```csharp
int x = a + b;       // 1
```

**2. Statements one after another: add.**

```csharp
x = 1;               // 1
y = 2;               // 1
z = x + y;           // 1       total: 3
```

**3. A loop: multiply the number of passes by the cost of the body.**

```csharp
for (int i = 0; i < n; i++)     // n passes
{
    sum += a[i];                // 1 step each       total: n
}
```

**4. Loops inside loops: multiply.**

```csharp
for (int i = 0; i < n; i++)         // n passes
    for (int j = 0; j < n; j++)     // n passes each
        count++;                    // total: n · n = n²
```

**5. Loops with different limits stay different.**

```csharp
for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++)
        count++;                    // n · m   (not n²!)
```

**6. A condition: take the more expensive branch (the worst case).**

```csharp
if (a[0] > 0)
    DoCheap();           // 1
else
    DoExpensive();       // n          cost: n
```

**7. A call: add the cost of the method that is called.**

## Loops whose counter changes in other ways

| Loop | Passes |
| --- | --- |
| `for (i = 0; i < n; i++)` | n |
| `for (i = 0; i < n; i += 2)` | n / 2 |
| `for (i = 0; i < n; i += k)` | n / k |
| `for (i = n; i > 0; i--)` | n |
| `for (i = 1; i < n; i *= 2)` | log₂ n |
| `for (i = n; i > 1; i /= 2)` | log₂ n |
| `for (i = 1; i * i <= n; i++)` | √n |

A loop that **multiplies or divides** the counter runs a **logarithmic** number of times: how many times can you double 1 before you reach `n`? For `n = 1024`, exactly 10 times.

## The triangle: a dependent inner loop

```csharp
for (int i = 0; i < n; i++)
    for (int j = 0; j < i; j++)     // the inner limit depends on i
        count++;
```

The inner body runs 0 times for `i = 0`, then 1, 2, ..., `n − 1`. The total is

```text
0 + 1 + 2 + ... + (n − 1) = n · (n − 1) / 2
```

For `n = 5`: 0 + 1 + 2 + 3 + 4 = 10, and 5 · 4 / 2 = 10. This is about **n² / 2**: half of the square, but still **quadratic**. The same sum appears whenever the code looks at every pair of elements once.

A useful sum to remember: `1 + 2 + ... + n = n · (n + 1) / 2`.

## Logarithm times n

```csharp
for (int i = 0; i < n; i++)             // n passes
    for (int j = 1; j < n; j *= 2)      // log₂ n passes each
        count++;                        // n · log₂ n
```

This shape, a linear loop with a halving or doubling loop inside, is typical of efficient sorting.

## A worked example

```csharp
static int Example(int[] a)
{
    int n = a.Length;
    int count = 0;                              // 1

    for (int i = 0; i < n; i++)                 // A: n passes
        count += a[i];                          //    1 step each

    for (int i = 0; i < n; i++)                 // B: n passes
        for (int j = 0; j < n; j++)             //    n passes each
            if (a[i] == a[j]) count++;          //    1 step each

    return count;                               // 1
}
```

The cost is `T(n) = 1 + n + n² + 1 = n² + n + 2`. For large `n` the `n²` term dominates: for `n = 1000`, it is 1 000 000 against 1 000 for the `n` term. So the code is quadratic, in other words **O(n²)**. (The next lectures explain why we drop the smaller terms and the constants.)

## What to count

- Count the **dominant** operation, the one in the innermost loop, and ignore bookkeeping.
- For **recursion**, write down how many calls are made and how much work each does. A method that calls itself twice, with `n − 1` each time, makes about 2ⁿ calls. A method that calls itself once with `n / 2` makes about log₂ n calls.
- Do not forget the **hidden loops**: `Contains`, `IndexOf`, `Substring`, `string +`, `Insert(0, x)` all take time in proportion to the data they touch.
- Say which **case** you are analysing: worst, best or average.

## A check by experiment

You can verify a count by running code and counting:

```csharp
long count = 0;
for (int i = 0; i < n; i++)
    for (int j = 0; j < i; j++)
        count++;
Console.WriteLine(count);    // n = 1000 gives 499500 = 1000 · 999 / 2
```

Doubling `n` and watching the count is a quick test of the growth: if the count becomes about 4 times larger, the algorithm is quadratic.
