**Recursion** is when a method calls **itself** to solve a smaller version of the same problem. It sounds circular, but it works, as long as the chain of smaller problems ends somewhere.

## The idea in one example

The factorial of a number: `5! = 5 · 4 · 3 · 2 · 1`. Notice that `5! = 5 · 4!`, and `4! = 4 · 3!`, and so on. A problem is described through a smaller copy of itself:

```csharp
static long Factorial(int n)
{
    if (n <= 1)                    // base case: the answer is known
    {
        return 1;
    }
    return n * Factorial(n - 1);   // recursive case: a smaller problem
}
```

Every recursive method has these two parts:

1. **The base case**: the simplest input, for which the answer is given directly, with no further calls. Without it, the calls never stop.
2. **The recursive case**: the method calls itself with a **smaller** input, and uses the result.

## What happens when it runs

Calling `Factorial(4)`:

```text
Factorial(4)
  = 4 * Factorial(3)
        = 3 * Factorial(2)
              = 2 * Factorial(1)
                    = 1                 <- the base case
              = 2 * 1 = 2
        = 3 * 2 = 6
  = 4 * 6 = 24
```

First the calls go **down** until the base case, and then the results come back **up**, and each level multiplies its own `n` by what it received. No call finishes until the call below it has returned.

## The call stack

How does the computer remember where it was? Every call gets its own **stack frame**: a small block of memory with the parameters and local variables of that call. A new call pushes a frame, and a return pops it. For `Factorial(4)`, at the deepest moment, there are four frames on the stack, each with its own `n`.

The stack is small. If the depth grows too much, you get a **stack overflow** (`StackOverflowException`), and the program ends at once: you cannot catch it. Typically that happens at a depth of some tens of thousands of calls.

```csharp
static int Bad(int n)
{
    return Bad(n + 1);     // no base case: it never ends
}
```

## Three rules for writing a recursive method

1. **Write the base case first.** What is the smallest input, and what is its answer?
2. **Make progress.** Every recursive call must be **closer** to the base case: a smaller number, a shorter string, a smaller range.
3. **Trust the call.** Assume that the recursive call returns the right answer for the smaller input, and think only about how to build the answer for the current input from it. Do not try to follow all the levels in your head.

## More small examples

**The sum of numbers 1..n**

```csharp
static int SumTo(int n)
{
    if (n == 0) return 0;
    return n + SumTo(n - 1);
}
```

**A power**

```csharp
static long Power(long x, int p)
{
    if (p == 0) return 1;
    return x * Power(x, p - 1);
}
```

**The number of digits**

```csharp
static int CountDigits(int n)
{
    if (n < 10) return 1;                // a single digit
    return 1 + CountDigits(n / 10);      // drop the last digit
}
```

**Reversing a string**

```csharp
static string Reverse(string s)
{
    if (s.Length <= 1) return s;
    return Reverse(s.Substring(1)) + s[0];
}
```

**A palindrome**: the first and the last characters must match, and what is in the middle must be a palindrome.

```csharp
static bool IsPalindrome(string s)
{
    if (s.Length <= 1) return true;
    if (s[0] != s[s.Length - 1]) return false;
    return IsPalindrome(s.Substring(1, s.Length - 2));
}
```

Look at what they share: a **simple base case** (`0`, `1`, a single digit, an empty string), and a call on a **smaller** input (`n - 1`, `n / 10`, a shorter string).

## Recursion or a loop?

Every recursion can be written as a loop, and the other way round. For `Factorial`, the loop is shorter and faster. Recursion is the right choice when the problem is **naturally self-similar**:

- a folder that contains folders;
- an expression with sub-expressions in parentheses;
- "try a choice, then solve what is left", as for subsets, permutations and puzzles (the next lectures);
- "split in halves and solve each half" (divide and conquer).

For such problems, the recursive code follows the structure of the problem, and the loop version would need an explicit stack of your own.

## The cost

- Each call costs **time** and a stack **frame**. A loop with a million passes is fine, and a recursion that is a million levels deep is not.
- C# does not promise to eliminate the stack growth when the recursive call is the last thing a method does (**tail-call optimization**, which some other languages have). So do not count on it.
- The same sub-problem may be solved many times (the lecture on the recursion tree shows how, and what to do about it).

## Typical mistakes

- **No base case**, or a base case that cannot be reached (for example, the call is `n + 1` while the base case is `n == 0`).
- **A wrong base case**: `Factorial(0)` returning `0` makes everything `0`.
- **No progress**: calling with the same arguments.
- **Forgetting to use or return the result** of the recursive call.
- **Too deep a recursion** for large inputs: use a loop there.

When a recursion misbehaves, print the arguments with an **indentation by the depth**, and you will see the calls as a tree:

```csharp
static long Factorial(int n, int depth = 0)
{
    Console.WriteLine(new string(' ', depth * 2) + "Factorial(" + n + ")");
    if (n <= 1) return 1;
    return n * Factorial(n - 1, depth + 1);
}
```
