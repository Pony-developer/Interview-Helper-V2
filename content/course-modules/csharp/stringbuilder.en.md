A `string` cannot be changed. Every `+`, `Replace` or `Insert` builds a **new** string and copies the characters into it. When you assemble a long text from many small pieces, that copying adds up.

```csharp
string result = "";
for (int i = 0; i < 100000; i++)
{
    result += "x";    // 100000 new strings, each one a little longer than the last
}
```

The work grows with the **square** of the number of appends. `StringBuilder` is the tool for this job: it keeps a buffer that can be changed in place.

```csharp
using System.Text;

var sb = new StringBuilder();
for (int i = 0; i < 100000; i++)
{
    sb.Append("x");
}
string result = sb.ToString();
```

## The basics

`StringBuilder` is in `System.Text`, so add `using System.Text;` at the top.

```csharp
var sb = new StringBuilder();
sb.Append("Hello");         // Hello
sb.Append(", ");            // Hello, 
sb.Append("world");         // Hello, world
sb.Append('!');             // Hello, world!   (a char works)
sb.Append(42);              // Hello, world!42 (numbers are converted)
sb.AppendLine();            // adds a line break
Console.WriteLine(sb.ToString());
```

`ToString()` returns the finished text as a normal string. `Console.WriteLine(sb)` would call it for you.

## Chaining

Each `Append` returns the builder itself, so the calls can be chained:

```csharp
string line = new StringBuilder()
    .Append("Total: ")
    .Append(12.5)
    .Append(" USD")
    .ToString();
```

## Changing what is already there

```csharp
var sb = new StringBuilder("Hello, world");
sb.Insert(0, ">> ");              // >> Hello, world
sb.Replace("world", "C#");        // >> Hello, C#
sb.Remove(0, 3);                  // Hello, C#
sb[0] = 'J';                      // Jello, C#  (a character can be assigned!)
Console.WriteLine(sb.Length);     // 9
sb.Clear();                       // empty
```

Unlike a string, a `StringBuilder` can be indexed **and assigned**: `sb[i] = 'x'`. Its `Length` is the current length, and you can also set it to cut the text.

## Building text from a loop

```csharp
var sb = new StringBuilder();
for (int i = 1; i <= 5; i++)
{
    if (i > 1) sb.Append(", ");
    sb.Append(i * i);
}
Console.WriteLine(sb);     // 1, 4, 9, 16, 25
```

The `if (i > 1)` trick puts a separator **between** items without a trailing one. For simple cases, `string.Join` is shorter.

## Transforming text character by character

A typical use is building a transformed copy:

```csharp
static string Mask(string card)
{
    var sb = new StringBuilder();
    for (int i = 0; i < card.Length; i++)
    {
        bool last4 = i >= card.Length - 4;
        sb.Append(last4 ? card[i] : '*');
    }
    return sb.ToString();
}

Console.WriteLine(Mask("1234567812345678"));   // ************5678
```

## Capacity

The buffer inside is a char array that grows when needed, by about doubling. If you know the final size, you can say so in advance, which avoids regrowth:

```csharp
var sb = new StringBuilder(1000);
```

It is only an optimization: the builder works without it.

## When to use it

| Situation | Use |
| --- | --- |
| a few pieces, one statement | `+` or `$"..."` |
| joining items from a collection | `string.Join` |
| many appends in a **loop**, or building text step by step | `StringBuilder` |
| changing characters of an existing text | `ToCharArray()`, or a `StringBuilder` |

Do not reach for `StringBuilder` by reflex. For short texts, `+` is clearer and just as fast. The builder wins when the number of appends is large or unknown.

## Pitfalls

- Forgetting `ToString()`: a `StringBuilder` is not a `string`, so `string s = sb;` does not compile.
- Comparing builders with `==`: they are different objects. Compare `sb.ToString()` values, or use `sb.Equals(other)`.
- Using `sb.Append(a + b)` for every piece: you build a temporary string again. Write `sb.Append(a).Append(b)`.
