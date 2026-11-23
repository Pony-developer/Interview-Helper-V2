Text typed by a user, read from a file or received over the network is always a **string**, even when it looks like a number. A string cannot be used in arithmetic, and `+` just glues it:

```csharp
string a = "12";
string b = "30";
Console.WriteLine(a + b);   // 1230, not 42
```

To calculate, convert the text to a number first. This is called **parsing**.

## Parse

Every numeric type has a `Parse` method:

```csharp
int n = int.Parse("42");
double d = double.Parse("3.5", CultureInfo.InvariantCulture);
long big = long.Parse("9000000000");
Console.WriteLine(n + 1);   // 43
```

`CultureInfo` lives in `System.Globalization`, so add `using System.Globalization;` at the top. Without it, `double.Parse` uses the **regional settings** of the computer: on a Ukrainian system the decimal separator is a comma, so `"3.5"` fails there and `"3,5"` works. `CultureInfo.InvariantCulture` means "always a dot", the same everywhere.

`Parse` is forgiving about spaces around the number (`int.Parse(" 42 ")` is fine) and strict about everything else. When the text is not a valid number, it throws an exception:

| Input | What happens with `int.Parse` |
| --- | --- |
| `"abc"` | `FormatException` |
| `"3.5"` | `FormatException` (not a whole number) |
| `""` | `FormatException` |
| `"99999999999"` | `OverflowException` (does not fit in `int`) |
| `null` | `ArgumentNullException` |

## TryParse

When the input can be wrong, ask politely instead of crashing. `TryParse` returns `true` or `false` and hands the number back through an `out` parameter:

```csharp
string text = "42x";

if (int.TryParse(text, out int number))
{
    Console.WriteLine("Got " + number);
}
else
{
    Console.WriteLine("Not a number");   // this branch runs
}
```

On failure `number` is set to `0`, and nothing is thrown. The `if` statement is covered in a later module; for now, notice that the call evaluates to `true` or `false`.

`double.TryParse` works the same way and also accepts a culture:

```csharp
double.TryParse("3.5", NumberStyles.Float, CultureInfo.InvariantCulture, out double value);
```

## Convert

`Convert.ToInt32` and friends are a third option. They behave like `Parse`, except that `null` becomes `0`. They are also the tool that **rounds** when given a double, while a cast truncates:

```csharp
Console.WriteLine(Convert.ToInt32("42"));   // 42
Console.WriteLine(Convert.ToInt32(3.7));    // 4
Console.WriteLine((int)3.7);                // 3
```

## Which one to use

- Trusted data, such as a literal in your own code: `Parse`.
- Anything typed by a person or coming from outside: `TryParse`.

## Number to string

The reverse direction is easier. `ToString()` works on every type, and so does string interpolation:

```csharp
int n = 42;
string text = n.ToString();      // "42"
string same = $"{n}";            // "42"
Console.WriteLine(n.ToString().Length);   // 2
```
