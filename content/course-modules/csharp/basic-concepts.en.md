Before comparing algorithms, we need to agree on what exactly we compare. This lecture introduces the basic vocabulary.

## What is an algorithm

An **algorithm** is a precise sequence of steps that solves a problem. A recipe for a cake is not an algorithm in this sense, but a procedure with these properties is:

- **Input**: it takes some data (zero or more values).
- **Output**: it produces a result.
- **Definiteness**: every step is exact and unambiguous.
- **Finiteness**: it stops after a finite number of steps for every valid input.
- **Effectiveness**: every step is simple enough to be carried out.

A program is an algorithm written in a programming language. One algorithm can be written in many languages, and one problem can be solved by many algorithms. We compare **algorithms**, not languages.

## The size of the input

The work depends on how much data there is. We call that amount **n**, the **size of the input**. What `n` means depends on the problem:

| Problem | n |
| --- | --- |
| find the maximum in an array | the number of elements |
| search a word in a text | the length of the text |
| sort a list | the number of items |
| find a route in a map | the number of places and roads |
| check whether a number is prime | the number of **digits** of the number (see a later lecture) |

Always say what `n` is, before you say how fast something is.

## How to measure the cost

The simplest idea is to run the program with a stopwatch:

```csharp
var timer = System.Diagnostics.Stopwatch.StartNew();
Run(data);
timer.Stop();
Console.WriteLine(timer.ElapsedMilliseconds + " ms");
```

It is useful, but a stopwatch measures the **computer** as much as the algorithm. The result depends on the processor, the language, other running programs, and the particular data. A time of 50 ms on your laptop tells nothing about the same code on a server, or about twice as much data.

So in theory we **count the operations** instead: comparisons, assignments, arithmetic. The count does not depend on the machine, and it shows how the work **grows** when `n` grows.

## Time complexity

The **time complexity** of an algorithm is a function `T(n)`: the number of elementary operations for an input of size `n`.

```csharp
static int Sum(int[] a)
{
    int sum = 0;                       // 1 operation
    for (int i = 0; i < a.Length; i++) // the loop runs n times
    {
        sum += a[i];                   // 1 operation per pass
    }
    return sum;                        // 1 operation
}
```

Counting the additions only, `T(n) = n`. Counting everything, including the loop's own work, we might get `T(n) = 3n + 2`. The exact number depends on what we call an "operation". What matters is that the work grows **in proportion to n**, and the lectures on Big O show how to say it formally.

## Space complexity

The **space complexity** is how much **extra memory** the algorithm needs, as a function of `n`.

- `Sum` above needs only two variables, whatever `n` is: constant memory.
- A method that builds a **copy** of the array needs memory in proportion to `n`.

The memory for the input itself is usually not counted. Often there is a **trade-off**: a `HashSet` makes duplicate detection fast, but costs memory.

## Best, worst and average case

The work may depend not only on the **size** of the input, but also on the **data**. Consider a linear search for a value in an array of `n` elements:

| Case | When | Comparisons |
| --- | --- | --- |
| **best** | the value is the first element | 1 |
| **worst** | the value is the last, or is missing | n |
| **average** | the value is somewhere in the middle | about n / 2 |

Which one to use? The **worst case** is what we normally analyze: it is a guarantee ("it will never be slower than this"), and the one that matters when the program must stay responsive for every input. The **average case** needs assumptions about the data, and the **best case** is too optimistic to plan with.

## Elementary operations

We assume that a "basic" operation takes a constant time, regardless of the size of the data: adding two numbers, comparing, assigning, reading `array[i]`, a dictionary lookup (on average). That is the model. It is wrong for huge numbers (adding two million-digit numbers is not one step), and the lecture on numbers returns to this.

## What you have learned

- An algorithm is judged by **how the cost grows** with the input size `n`, not by seconds on one computer.
- We count operations, and normally for the **worst case**.
- Time and memory are two different resources, and sometimes one is exchanged for the other.
