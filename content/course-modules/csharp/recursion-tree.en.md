To understand a recursion, **draw it**. Every call is a **node**, and the calls it makes are its **children**. The picture is the **recursion tree**.

## A linear recursion: a chain

```csharp
static int SumTo(int n) => n == 0 ? 0 : n + SumTo(n - 1);
```

`SumTo(3)` makes a chain, because each call makes exactly one more:

```text
SumTo(3)
  └─ SumTo(2)
       └─ SumTo(1)
            └─ SumTo(0)       <- a leaf: the base case
```

There are `n + 1` nodes, and the **depth** is also `n`. The work is linear.

## A branching recursion: a real tree

The Fibonacci numbers: `Fib(n) = Fib(n − 1) + Fib(n − 2)`.

```csharp
static long Fib(int n) => n < 2 ? n : Fib(n - 1) + Fib(n - 2);
```

The tree of `Fib(4)`:

```text
                    Fib(4)
                  /        \
            Fib(3)          Fib(2)
           /      \         /     \
      Fib(2)    Fib(1)   Fib(1)  Fib(0)
      /    \
  Fib(1)  Fib(0)
```

Count the nodes: 9 calls to find `Fib(4) = 3`. Look at the **repetition**: `Fib(2)` is solved twice, and `Fib(1)` three times. The same sub-problem is calculated again and again.

## Counting the calls

Let `calls(n)` be the number of calls. For `Fib`, `calls(n) = 1 + calls(n − 1) + calls(n − 2)`, and it grows like the Fibonacci numbers themselves:

| n | 5 | 10 | 20 | 30 | 40 |
| --- | --- | --- | --- | --- | --- |
| calls | 15 | 177 | 21 891 | 2 692 537 | 331 160 281 |

For `n = 40`, that is more than 330 million calls to compute a number that a loop finds in 40 steps. The growth is **exponential**: about 1.6ⁿ, which we write O(2ⁿ).

## Depth against the number of nodes

Two different measures:

- The **number of nodes** is the total **time**.
- The **depth** (the longest chain from the root to a leaf) is the **stack memory**, because only one path, from the root down to the current call, is on the stack at any moment.

`Fib(40)` makes 331 million calls, but the stack never holds more than about **40** frames. So an exponential-time recursion can still be safe for the stack, and a linear one (`SumTo(1 000 000)`) can overflow it.

## Other shapes of trees

| Recursion | Tree | Time |
| --- | --- | --- |
| `F(n) = F(n − 1) + O(1)` | a chain of `n` nodes | O(n) |
| `F(n) = F(n / 2) + O(1)` | a chain of `log₂ n` nodes | O(log n) |
| `F(n) = 2 · F(n / 2) + O(1)` | a balanced tree with `n` leaves | O(n) |
| `F(n) = 2 · F(n / 2) + O(n)` | `log₂ n` levels, each doing `n` work | O(n log n) |
| `F(n) = 2 · F(n − 1) + O(1)` | every call makes two, `n` levels | O(2ⁿ) |
| `F(n) = n · F(n − 1)` | `n` children, then `n − 1`, ... | O(n!) |

To get the total time, **add up the work of all the nodes**. A good way is by levels: how many nodes there are on each level, how much each one does, and how many levels there are.

## Removing the repetition: memoization

If the same sub-problem appears again and again, **remember the answer** the first time:

```csharp
static Dictionary<int, long> cache = new Dictionary<int, long>();

static long FibMemo(int n)
{
    if (n < 2) return n;
    long known;
    if (cache.TryGetValue(n, out known)) return known;

    long result = FibMemo(n - 1) + FibMemo(n - 2);
    cache[n] = result;
    return result;
}
```

Now each `FibMemo(k)` is calculated **once**, and every later request is a quick lookup. The tree shrinks to a chain with short branches: only about `2n` calls. The time changes from O(2ⁿ) to **O(n)**, at the price of O(n) memory. This technique is the foundation of **dynamic programming**.

(The field `cache` is declared next to the methods, with `static`, so that all the calls share it. It is a field of the class, not a local variable.)

## Tracing a recursion

To see the tree for yourself, print on entering and on leaving, with an indentation:

```csharp
static long Fib(int n, int depth)
{
    string pad = new string(' ', depth * 2);
    Console.WriteLine(pad + "Fib(" + n + ")");
    long result = n < 2 ? n : Fib(n - 1, depth + 1) + Fib(n - 2, depth + 1);
    Console.WriteLine(pad + "= " + result);
    return result;
}
```

Run it for a small `n`, and you will see the order of the calls: **depth first**, left to right. A call waits for all of its children before it returns.

## How to read a recursion

1. Find the **base cases**: the leaves of the tree.
2. Find the **branching**: how many recursive calls does one call make?
3. Find how the input **shrinks**: by one, by half, by removing an item.
4. From these three, you know the **depth**, the **number of nodes** and the **time**.
5. Look for **repeated** nodes: if the same arguments appear many times, memoize.
