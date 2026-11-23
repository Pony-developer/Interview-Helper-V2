C# has four loops: `while`, `do-while`, `for` and `foreach`. Any of the first three can be written with any other, so the choice is about **readability**: pick the loop that tells the reader what is going on.

## The same task, three ways

Print the numbers from 1 to 5:

```csharp
// for
for (int i = 1; i <= 5; i++)
{
    Console.WriteLine(i);
}

// while
int n = 1;
while (n <= 5)
{
    Console.WriteLine(n);
    n++;
}

// do-while
int k = 1;
do
{
    Console.WriteLine(k);
    k++;
}
while (k <= 5);
```

They do the same thing. In the `for` version the whole plan is visible in one line, and that is what makes it the best choice here.

## How to choose

| Situation | Loop |
| --- | --- |
| the number of repetitions is known (or is the length of something) | `for` |
| you repeat until something happens, and cannot predict when | `while` |
| the body must run **at least once**, whatever the condition | `do-while` |
| you go through every element of a collection or a string, and only read it | `foreach` |
| you repeat until something happens in the **middle** of the body | `while (true)` with `break` |

Examples:

- "print the first 10 squares": `for`
- "halve the number until it is below 1": `while` (the number of steps depends on the data)
- "ask the user until the answer is valid": `do-while`
- "count the spaces in a text": `foreach` or `for`

## The same in both forms

| `for` | `while` |
| --- | --- |
| `for (int i = 0; i < n; i++)` | `int i = 0; while (i < n) { ...; i++; }` |
| the counter is declared in the header, and is not visible after the loop | the variable lives on after the loop |
| it is hard to forget the step | it is easy to forget `i++`, and the loop becomes endless |

## Equivalence checks

```csharp
for (int i = 0; i < 3; i++)
{
    if (i == 1) continue;
    Console.Write(i);
}
// 02
```

With `continue`, a `for` loop **still runs the step** (`i++`). In the `while` form you have to be careful: if `i++` is at the end of the body, `continue` skips it, and the loop gets stuck.

```csharp
int i = 0;
while (i < 3)
{
    if (i == 1) continue;   // skips i++ below: endless loop!
    Console.Write(i);
    i++;
}
```

This is one more reason to prefer `for` when the loop is counter-driven.

## break, continue and return

- `break` leaves the nearest loop.
- `continue` skips the rest of the body and goes on to the next iteration (to the step in a `for`, to the condition in a `while`).
- `return` leaves the whole method, which is the cleanest way out of nested loops.

## The rule of thumb

1. Can you say "for each ..."? Use `foreach`.
2. Can you say "N times" or "from a to b"? Use `for`.
3. Is the end determined by a condition? Use `while`.
4. Must the first pass happen no matter what? Use `do-while`.
5. Is the code complicated? Extract the loop into a method with a clear name and a `return`.
