Loops repeat a block of code while a condition holds.

## while

```csharp
var n = 1;
while (n < 100)
    n *= 2;
Console.WriteLine(n); // 128
```

The condition is checked **before** each pass, so the body may run zero times. `do { ... } while (condition);` checks after, so it always runs at least once.

## for

When you know how many times to repeat, `for` keeps the counter in one place:

```csharp
for (var i = 0; i < 5; i++)
    Console.Write(i + " ");   // 0 1 2 3 4
```

The three parts are the start, the condition and the step. Counting from 0 and stopping **before** the length (`i < 5`) is the C# habit, and it matches array indexes.

## break and continue

```csharp
for (var i = 1; i <= 10; i++)
{
    if (i % 2 == 0) continue; // skip to the next pass
    if (i > 7) break;         // leave the loop
    Console.Write(i + " ");   // 1 3 5 7
}
```

## Common mistakes

- **Off-by-one**: `i <= 5` instead of `i < 5` runs one extra time.
- **Endless loop**: the condition never becomes false because the variable is not updated.
- **Changing the counter inside the body**: it makes the loop hard to follow. Prefer `while` if the step varies.
