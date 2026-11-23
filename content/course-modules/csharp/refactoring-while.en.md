A loop that works is not always a loop that is easy to read. Refactoring a loop means rewriting it so that it **does the same thing** in a simpler form. Change one thing at a time and rerun your checks after each step.

## 1. Replace a flag with the condition itself

A boolean flag that exists only to stop the loop is a sign that the logic is turned inside out:

```csharp
// before
bool finished = false;
int steps = 0;
while (!finished)
{
    if (n == 1)
    {
        finished = true;
    }
    else
    {
        if (n % 2 == 0) n = n / 2;
        else n = 3 * n + 1;
        steps++;
    }
}

// after
int steps = 0;
while (n != 1)
{
    n = n % 2 == 0 ? n / 2 : 3 * n + 1;
    steps++;
}
```

Both versions count how many steps the sequence takes to reach 1, but the second one says it in a single condition.

## 2. Remove duplicated code around the loop

When the first value has to be obtained before the loop and again at the end of the body, the same code is written twice. Two cures:

```csharp
// before
int value = Next();
while (value != 0)
{
    Process(value);
    value = Next();       // the same call as above
}

// after: "do-while"
int value;
do
{
    value = Next();
    if (value != 0) Process(value);
}
while (value != 0);

// or: "while (true)" with break
while (true)
{
    int value = Next();
    if (value == 0) break;
    Process(value);
}
```

The last form is often the clearest: there is one call, and the way out is where it happens.

## 3. Use `return` or `break` instead of a search flag

```csharp
// before
bool found = false;
int i = 2;
while (i < n && !found)
{
    if (n % i == 0) found = true;
    else i++;
}
// found tells whether n has a divisor

// after: a method that returns as soon as it knows the answer
static bool HasDivisor(int n)
{
    for (int i = 2; i < n; i++)
    {
        if (n % i == 0) return true;
    }
    return false;
}
```

## 4. Turn a `while` into a `for` when the counter is obvious

If a variable is initialized right before the loop, tested in the condition and changed at the end of the body, it is a `for` loop in disguise:

```csharp
// before
int i = 0;
while (i < 10)
{
    Console.WriteLine(i);
    i++;
}

// after
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(i);
}
```

The start, the condition and the step now sit in one line, and it is impossible to forget the step.

## 5. Flatten nesting with `continue`

```csharp
// before
for (int i = 1; i <= 100; i++)
{
    if (i % 3 == 0)
    {
        if (i % 5 == 0)
        {
            Console.WriteLine(i);
        }
    }
}

// after
for (int i = 1; i <= 100; i++)
{
    if (i % 15 != 0) continue;
    Console.WriteLine(i);
}
```

Guard conditions that reject the uninteresting cases first leave the main work at one level of indentation.

## 6. Move constant work out of the loop

```csharp
// before: Math.Sqrt is recalculated on every iteration
for (int i = 2; i <= Math.Sqrt(n); i++) { /* ... */ }

// after
int limit = (int)Math.Sqrt(n);
for (int i = 2; i <= limit; i++) { /* ... */ }
```

## 7. Give the condition and the body names

A complicated condition can become a method, and a long body can be split into methods too:

```csharp
// before
while (a > 0 && b > 0 && (a % 2 == 0 || b % 2 == 0)) { /* ... */ }

// after
while (CanContinue(a, b)) { /* ... */ }
```

## Safe refactoring

- Know the expected result before you start. Keep a few inputs and the outputs they must still produce, including the edge cases.
- Change one thing, run, and compare. If something changes, undo and take a smaller step.
- Do not mix refactoring with changing what the code does.
- Stop when it is clear. A loop does not need to be clever.
