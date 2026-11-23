A method returns one value. To return **several** values, there are three common ways.

## Way 1: out parameters

```csharp
static void SplitTime(int seconds, out int minutes, out int rest)
{
    minutes = seconds / 60;
    rest = seconds % 60;
}

int m, s;
SplitTime(125, out m, out s);
Console.WriteLine(m + ":" + s);        // 2:5
```

Every `out` parameter must be assigned before the method returns. This is the pattern of `int.TryParse`, which returns a `bool` and the number together.

## Way 2: a small class or struct

When the results belong together, give them a name:

```csharp
struct TimeParts
{
    public int Minutes;
    public int Seconds;
}

static TimeParts Split(int seconds)
{
    return new TimeParts { Minutes = seconds / 60, Seconds = seconds % 60 };
}

TimeParts t = Split(125);
Console.WriteLine(t.Minutes + ":" + t.Seconds);      // 2:5
```

The names of the fields document what each value means. This is usually the clearest choice.

## Way 3: tuples (C# 7)

C# 7 added a short syntax for an unnamed group of values, `(int, int)`, with names such as `(int minutes, int seconds)`. The method returns the tuple and the caller reads its items by name:

```csharp
// C# 7 syntax, shown here for reference
static (int minutes, int seconds) Split(int total)
{
    return (total / 60, total % 60);
}

var t = Split(125);
Console.WriteLine(t.minutes + ":" + t.seconds);
```

Tuples are short, but they are not a name for the group, so use them for a local helper or a private method. A public API with several values is clearer with a named type.
