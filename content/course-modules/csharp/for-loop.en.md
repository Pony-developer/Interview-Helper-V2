`for` is the loop to use when you know how many times to repeat, or when the repetition is driven by a counter. It gathers the three parts that `while` scatters into one line.

```csharp
for (int i = 0; i < 5; i++)
{
    Console.Write(i + " ");   // 0 1 2 3 4
}
```

## The three parts

```csharp
for (initialization; condition; step)
{
    body
}
```

1. **Initialization** runs once, before the loop.
2. **Condition** is checked before every iteration. When it is `false`, the loop ends.
3. **Step** runs after every iteration.

It is exactly the same as:

```csharp
{
    int i = 0;
    while (i < 5)
    {
        // body
        i++;
    }
}
```

## How many iterations?

- `for (i = a; i < b; i++)` runs `b − a` times (for `b > a`).
- `for (i = a; i <= b; i++)` runs `b − a + 1` times.

Counting from 0 and stopping **before** the length is the C# habit. It matches indexes: a string with 5 characters has the positions 0 to 4.

## Variations

```csharp
for (int i = 10; i > 0; i--)         // counting down: 10 9 8 ... 1
for (int i = 0; i < 20; i += 5)      // a bigger step: 0 5 10 15
for (int i = 10; i > 0; i -= 3)      // 10 7 4 1
```

You can have **two counters** in one loop. Separate the parts with commas:

```csharp
for (int i = 0, j = 5; i < j; i++, j--)
{
    Console.WriteLine(i + " " + j);   // 0 5, then 1 4, then 2 3
}
```

Any part may be left empty. `for (;;)` is an endless loop, like `while (true)`.

## Scope of the counter

A variable declared in the `for` header exists only inside the loop:

```csharp
for (int i = 0; i < 3; i++) { }
Console.WriteLine(i);   // error: the name 'i' does not exist in the current context
```

This is a feature: two loops one after another can both use `i`. If you need the value after the loop, declare the variable **before** it:

```csharp
int i;
for (i = 0; i < 5; i++) { }
Console.WriteLine(i);   // 5
```

## Going through a string

```csharp
string word = "hello";
for (int i = 0; i < word.Length; i++)
{
    Console.WriteLine(word[i]);
}
```

Here are some patterns:

```csharp
// reversing: count down from the last index
string reversed = "";
for (int i = word.Length - 1; i >= 0; i--)
{
    reversed += word[i];
}
Console.WriteLine(reversed);   // olleh

// counting the characters that match a rule
int vowels = 0;
for (int i = 0; i < word.Length; i++)
{
    if (word[i] == 'a' || word[i] == 'e' || word[i] == 'i' || word[i] == 'o' || word[i] == 'u')
    {
        vowels++;
    }
}
Console.WriteLine(vowels);   // 2
```

If you only read the characters, `foreach` is simpler, because there is no index to get wrong:

```csharp
foreach (char c in word)
{
    Console.Write(c + "-");   // h-e-l-l-o-
}
```

## Pitfalls

- **Off-by-one**: `i <= word.Length` goes one step too far, and `word[word.Length]` throws `IndexOutOfRangeException`.
- **Changing the counter inside the body** makes the loop hard to follow. If the step is irregular, use `while`.
- **`double` counters**: `for (double x = 0; x < 1; x += 0.1)` may run 11 times instead of 10, because 0.1 is not exact in binary (see the lecture on comparing floating-point numbers). Loop over an `int` and compute the `double` inside: `double x = i / 10.0;`.
- **A semicolon after the header**: `for (int i = 0; i < 3; i++);` is a loop with an empty body, and the following block runs once.
- **Building text with `+=` in a long loop** creates a new string every time. That is fine for small texts. For large ones, there is `StringBuilder`.
