Now put the rules to work. Read the code, find what `n` is, find the loops, and watch for the costs that are hidden in method calls.

## A method for estimating

1. **What is `n`?** The array length, the text length, a number's size?
2. **Which loops depend on `n`?** Count the passes of each.
3. **Nested or sequential?** Multiply or add.
4. **What do the calls cost?** `Contains`, `Sort`, `Substring`, dictionary access...
5. **Which case?** Worst, unless the question says otherwise.
6. **Keep the dominant term**, and drop the constants.

## Practice examples

**A.** One pass.

```csharp
int max = a[0];
for (int i = 1; i < a.Length; i++)
    if (a[i] > max) max = a[i];
```

**O(n)**.

**B.** A loop, then another one (not nested).

```csharp
for (int i = 0; i < n; i++) Step1();
for (int i = 0; i < n; i++) Step2();
```

n + n = 2n, so **O(n)**.

**C.** Every pair.

```csharp
for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
        Compare(a[i], a[j]);
```

n(n − 1)/2 passes: **O(n²)**.

**D.** The counter doubles.

```csharp
for (int i = 1; i < n; i *= 2)
    Work();
```

**O(log n)**.

**E.** A linear loop with a logarithmic one inside.

```csharp
for (int i = 0; i < n; i++)
    for (int j = 1; j < n; j *= 2)
        Work();
```

**O(n log n)**.

**F.** The inner loop is limited by the outer one, but halving it.

```csharp
for (int i = n; i >= 1; i /= 2)
    for (int j = 0; j < i; j++)
        Work();
```

The inner loop runs `n`, then `n/2`, then `n/4`, ...: the sum is `n + n/2 + n/4 + ... < 2n`. It is **O(n)**, not O(n log n): a trap to avoid.

**G.** A loop up to the square root.

```csharp
for (int d = 2; d * d <= n; d++)
    if (n % d == 0) return false;
```

**O(√n)**.

**H.** Three nested loops.

```csharp
for (i...n) for (j...n) for (k...n) Work();
```

**O(n³)**.

## Hidden costs in the library

| Call | Complexity |
| --- | --- |
| `array[i]`, `list[i]` | O(1) |
| `list.Add(x)` | O(1) amortized |
| `list.Insert(0, x)`, `list.RemoveAt(0)` | O(n): shifts the elements |
| `list.Contains(x)`, `list.IndexOf(x)` | O(n) |
| `list.Sort()`, `Array.Sort(a)` | O(n log n) |
| `Array.BinarySearch` (sorted) | O(log n) |
| `dict[key]`, `dict.ContainsKey(key)`, `set.Contains(x)` | O(1) on average |
| `string.Length`, `s[i]` | O(1) |
| `s.Contains(t)`, `s.IndexOf(t)`, `s.Substring(a, b)` | O(length) |
| `s + t` | O(length of s + length of t) |

"**Amortized**" O(1) means that one call may occasionally be expensive (the list has to grow), but the cost **averaged over many calls** is constant.

## Examples with hidden costs

**I.** A search in a list inside a loop.

```csharp
foreach (int x in a)
    if (list.Contains(x)) count++;      // Contains is O(m)
```

**O(n · m)**, which is O(n²) when the sizes are similar. With a `HashSet` instead of the list, **O(n + m)**.

**J.** Building a string.

```csharp
string s = "";
for (int i = 0; i < n; i++)
    s += "x";                           // copies all of s on each pass
```

The copies have the lengths 1, 2, ..., n, so **O(n²)**. With a `StringBuilder`, **O(n)**.

**K.** Sorting first.

```csharp
Array.Sort(a);                          // O(n log n)
for (int i = 1; i < n; i++)             // O(n)
    if (a[i] == a[i - 1]) return true;
return false;                           // total: O(n log n)
```

Looking for duplicates by sorting first is O(n log n), better than comparing every pair, which is O(n²). A `HashSet` does it in O(n) on average.

**L.** Recursion.

```csharp
static long Fib(int n) => n < 2 ? n : Fib(n - 1) + Fib(n - 2);
```

Each call makes two more, so the number of calls grows exponentially: about 1.6ⁿ, which we write as **O(2ⁿ)**. With a loop that remembers the last two numbers, it is **O(n)**.

**M.** Halving recursion.

```csharp
static int Count(int n) => n <= 1 ? 0 : 1 + Count(n / 2);
```

**O(log n)** calls.

## Best, worst, average

```csharp
static int IndexOf(int[] a, int value)
{
    for (int i = 0; i < a.Length; i++)
        if (a[i] == value) return i;
    return -1;
}
```

Best case O(1), worst case O(n), average case about n/2, which is O(n). When we say "linear search is O(n)", we mean the worst case.

## Space

Count the extra memory the same way:

- a few variables: O(1);
- a new array or a list of size `n`: O(n);
- a table of `n × n`: O(n²);
- a recursion that goes `n` levels deep uses O(n) of stack.

## A checklist

- Write down what `n` is.
- Write the cost of every loop and call, next to the line.
- Combine them with the rules: add, multiply, keep the largest.
- Check the hidden costs of the methods you call.
- If it is too slow for the stated limits (see the table in the lecture on growth), look for a better idea: sort first, use a `HashSet` or a `Dictionary`, or halve the problem.
