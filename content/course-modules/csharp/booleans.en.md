Every decision a program makes comes down to a question with a yes-or-no answer. C# represents that answer with the type `bool`, which has exactly two values: `true` and `false`. When printed, they appear as `True` and `False`.

```csharp
bool isAdult = true;
bool isEmpty = false;
Console.WriteLine(isAdult);   // True
```

## Comparison operators

A comparison takes two values and produces a `bool`:

| Operator | Meaning | Example | Result |
| --- | --- | --- | --- |
| `==` | equal | `5 == 5` | `True` |
| `!=` | not equal | `5 != 5` | `False` |
| `<` | less than | `3 < 5` | `True` |
| `>` | greater than | `3 > 5` | `False` |
| `<=` | less than or equal | `5 <= 5` | `True` |
| `>=` | greater than or equal | `4 >= 5` | `False` |

`==` compares, `=` assigns. They are easy to mix up, and the compiler helps only partly (see the lecture on typical branching errors).

Strings can be compared with `==` and `!=` too, and the comparison is case-sensitive: `"Ann" == "ann"` is `False`.

## Logical operators

| Operator | Name | True when |
| --- | --- | --- |
| `!a` | not | `a` is false |
| `a && b` | and | both are true |
| `a \|\| b` | or | at least one is true |
| `a ^ b` | exclusive or | exactly one is true |

The complete picture for two values:

| `a` | `b` | `a && b` | `a \|\| b` | `a ^ b` |
| --- | --- | --- | --- | --- |
| true | true | true | true | false |
| true | false | false | true | true |
| false | true | false | true | true |
| false | false | false | false | false |

## Combining conditions

```csharp
int age = 20;
bool teen = age >= 13 && age <= 19;
bool outsideWorkingAge = age < 18 || age > 65;
bool notAdult = !(age >= 18);
```

There is **no** chained comparison like in mathematics. `13 <= age <= 19` does not compile, because `13 <= age` is a `bool`, and a `bool` cannot be compared with `19`. Write both comparisons and join them with `&&`.

For the same reason, `age == 18 || 21` is an error: both sides of `||` must be `bool`. Write `age == 18 || age == 21`.

## Precedence

From the highest to the lowest priority:

1. `!`
2. arithmetic: `*`, `/`, `%`, then `+`, `-`
3. comparisons: `<`, `>`, `<=`, `>=`, then `==`, `!=`
4. `&&`
5. `||`

So `a || b && c` means `a || (b && c)`, in the same way that `2 + 3 * 4` multiplies first. Do not make the reader remember this table: add parentheses.

## De Morgan's laws

When you negate a combined condition, `&&` turns into `||` and the other way round, and every part is negated:

```csharp
!(a && b)   // the same as   !a || !b
!(a || b)   // the same as   !a && !b
```

Use them to simplify. "It is not true that the user is an adult and has a ticket" is the same as "the user is not an adult, or has no ticket":

```csharp
!(isAdult && hasTicket)  ==  !isAdult || !hasTicket
```

## Good style for bool

- Name `bool` variables and methods as statements or questions: `isReady`, `hasDiscount`, `IsEven`.
- Do not write `if (isReady == true)`. The variable is already a `bool`: `if (isReady)`. Likewise `if (!isReady)` instead of `isReady == false`.
- Return a comparison directly instead of wrapping it in an `if`:

```csharp
static bool IsEven(int n)
{
    return n % 2 == 0;
}
```

- A `bool` cannot be converted to a number or the other way round: `if (1)` is an error in C#, unlike in some other languages.
