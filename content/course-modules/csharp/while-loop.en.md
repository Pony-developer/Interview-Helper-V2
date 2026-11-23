The basic form is already familiar:

```csharp
while (condition)
{
    // body
}
```

C# checks the condition. If it is `true`, the body runs once and the condition is checked again. When it becomes `false`, the loop ends and the program continues after it. Each run of the body is an **iteration**. If the condition is `false` from the start, there are zero iterations.

## Tracing a loop

To understand a loop, play the computer: write down the variables after every iteration. Here is the sum of the digits of `472`:

```csharp
int n = 472;
int sum = 0;
while (n > 0)
{
    sum += n % 10;   // add the last digit
    n /= 10;         // drop the last digit
}
Console.WriteLine(sum);   // 13
```

| Iteration | `n` before | `n % 10` | `sum` after | `n` after |
| --- | --- | --- | --- | --- |
| 1 | 472 | 2 | 2 | 47 |
| 2 | 47 | 7 | 9 | 4 |
| 3 | 4 | 4 | 13 | 0 |

The check `n > 0` is then false, and the loop stops. A trace table finds most bugs before you run anything.

## Common patterns

**Counting**: repeat a fixed number of times.

```csharp
int i = 0;
while (i < 3)
{
    Console.WriteLine("Hello");
    i++;
}
```

**Accumulating**: build up a total, a product or a text.

```csharp
int product = 1;
int k = 1;
while (k <= 5)
{
    product *= k;
    k++;
}
Console.WriteLine(product);   // 120
```

**Shrinking or growing until a goal**: you do not know the number of steps in advance. This is the case where `while` is better than `for`.

```csharp
int steps = 0;
int n = 100;
while (n > 1)
{
    n /= 2;
    steps++;
}
Console.WriteLine(steps);   // 6   (100 -> 50 -> 25 -> 12 -> 6 -> 3 -> 1)
```

**Taking a number apart**: `n % 10` is the last digit, and `n / 10` is the number without it. Repeat until nothing is left, as in the example above.

**Waiting for a signal** (a *sentinel*): continue until a special value appears, for example until the input is `"quit"`.

## Making sure the loop ends

Something inside the body must bring the condition closer to `false`. If nothing does, the loop is endless:

```csharp
int i = 0;
while (i < 5)
{
    Console.WriteLine(i);
    // forgot i++, so this never ends
}
```

Before you write a loop, answer three questions:

1. What is true **before** the first iteration?
2. What changes in **every** iteration?
3. Why will the condition **eventually** become false?

Sometimes an endless loop is intended. `while (true)` with a `break` inside is a legitimate way to write "repeat until something happens in the middle of the body".

## Overflow can make a loop endless

This loop looks innocent:

```csharp
int power = 1;
while (power < n)
{
    power *= 2;
}
```

If `n` is larger than 2³⁰ (about a billion), `power` overflows an `int` after 2³⁰: the next doubling becomes negative, `power < n` stays `true` forever, and the loop never ends. When the values can be large, use `long`.

## do-while

`do { ... } while (condition);` checks **after** the body, so the body runs at least once. Remember the semicolon at the end.

```csharp
int x = 10;
do
{
    x++;
}
while (x < 5);
Console.WriteLine(x);   // 11: the body ran once even though 10 < 5 is false
```

## Edge cases to test

- The loop must do nothing when it should do nothing: zero iterations (`n = 0`).
- Exactly one iteration.
- The boundary value of the condition: does the loop stop at `n`, or one before?
- The largest input. Is it fast enough, and does it fit in the type?
