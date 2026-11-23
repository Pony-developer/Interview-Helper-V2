A few classic examples show the range of what recursion does well.

## Greatest common divisor

Euclid's algorithm is recursive by nature: `gcd(a, b) = gcd(b, a mod b)`, and `gcd(a, 0) = a`.

```csharp
static int Gcd(int a, int b)
{
    if (b == 0) return a;          // base case
    return Gcd(b, a % b);          // the numbers shrink quickly
}
```

`Gcd(48, 18)` calls `Gcd(18, 12)`, then `Gcd(12, 6)`, then `Gcd(6, 0)` and returns 6. This is a **chain** with O(log n) calls.

## A power by halving

`x¹⁰ = (x⁵)²`, and `x⁵ = x · (x²)²`. Halving the exponent makes **log p** levels instead of `p`:

```csharp
static long FastPower(long x, int p)
{
    if (p == 0) return 1;
    long half = FastPower(x, p / 2);          // ONE call, used twice
    return p % 2 == 0 ? half * half : half * half * x;
}
```

Note that the recursive call is made **once** and its result is reused. Writing `FastPower(x, p/2) * FastPower(x, p/2)` would make two calls and bring back the full `p` steps.

## Binary search

```csharp
static int Search(int[] sorted, int value, int left, int right)
{
    if (left > right) return -1;                       // an empty range
    int middle = left + (right - left) / 2;
    if (sorted[middle] == value) return middle;
    if (sorted[middle] < value)
        return Search(sorted, value, middle + 1, right);
    return Search(sorted, value, left, middle - 1);
}
```

The range halves with every call. Often a recursive **helper** with extra parameters (here `left` and `right`) is hidden behind a simple public method.

## A sum over an array

```csharp
static int Sum(int[] a, int index)
{
    if (index == a.Length) return 0;
    return a[index] + Sum(a, index + 1);
}
```

Here the "smaller problem" is "the rest of the array, starting from the next index". The array itself is never copied.

## The Tower of Hanoi

Three pegs, and `n` disks of different sizes on the first one. Move them all to another peg, one at a time, never putting a bigger disk on a smaller one.

The recursive thought: to move `n` disks from A to C, (1) move the top `n − 1` disks from A to B, (2) move the largest disk from A to C, (3) move the `n − 1` disks from B to C.

```csharp
static void Hanoi(int n, char from, char to, char via)
{
    if (n == 0) return;
    Hanoi(n - 1, from, via, to);
    Console.WriteLine("Move disk " + n + " from " + from + " to " + to);
    Hanoi(n - 1, via, to, from);
}
```

For two disks, `Hanoi(2, 'A', 'C', 'B')` prints:

```text
Move disk 1 from A to B
Move disk 2 from A to C
Move disk 1 from B to C
```

The number of moves is `M(n) = 2 · M(n − 1) + 1`, that is, **2ⁿ − 1**. For 10 disks, 1 023 moves, for 64 disks about 1.8 · 10¹⁹: no hardware will ever finish. It is a recursion that is easy to write and impossible to speed up, because the output itself is exponential.

## Counting the ways

How many ways can you climb `n` stairs, if you take either 1 or 2 steps at a time? The last move was either a 1-step (from `n − 1`) or a 2-step (from `n − 2`):

```csharp
static long Ways(int n)
{
    if (n <= 2) return n;                    // 1 way for 1 stair, 2 ways for 2
    return Ways(n - 1) + Ways(n - 2);
}
```

This is the Fibonacci recursion again, with the same repeated sub-problems, so memoize it for larger `n`.

## Recursion on a structure

Recursion is natural for **nested** data. Simple examples are the **sum of the digits** of a number, or **nested lists**: "the sum of everything in a list" is "the sum of the numbers plus the sum of everything in each inner list". The inner list is a smaller problem of the same kind. Trees, folders on a disk, XML and JSON documents and expressions in a compiler are all handled this way.

## Choosing the order

Where you put the work relative to the recursive call changes the output:

```csharp
static void Down(int n)
{
    if (n == 0) return;
    Console.Write(n + " ");      // BEFORE the call: 3 2 1
    Down(n - 1);
}

static void Up(int n)
{
    if (n == 0) return;
    Up(n - 1);
    Console.Write(n + " ");      // AFTER the call: 1 2 3
}
```

The first prints on the way **down**, and the second on the way **back up**. The Hanoi code above prints in the **middle**.

## A checklist for a new recursion

1. What is the **smallest** input, and what is its answer?
2. How can I make the input **smaller**?
3. How do I **combine** the answer for the smaller input with the current element?
4. Does the call tree have **repeated** nodes (memoize), or too much depth (use a loop)?
