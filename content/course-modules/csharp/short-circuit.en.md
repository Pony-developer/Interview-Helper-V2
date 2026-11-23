C# has two pairs of operators for "and" and "or" on `bool` values, and the difference between them is **whether the right operand is always evaluated**.

| Short-circuit | Full | Meaning |
| --- | --- | --- |
| `a && b` | `a & b` | and |
| `a \|\| b` | `a \| b` | or |

## Short-circuit: `&&` and `||`

They evaluate the right side only if it can still change the answer:

- in `a && b`, if `a` is `false`, the result is `false` whatever `b` is, so `b` is **skipped**;
- in `a || b`, if `a` is `true`, the result is `true` already, so `b` is **skipped**.

## Full: `&` and `|`

They always evaluate **both** sides, and then combine the results.

The difference becomes visible when the right side does something. This method reports that it was called:

```csharp
static bool Check(string name, bool result)
{
    Console.WriteLine("checking " + name);
    return result;
}
```

```csharp
bool x = Check("A", false) && Check("B", true);
// checking A                 (B was skipped)

bool y = Check("A", false) & Check("B", true);
// checking A
// checking B                 (both were evaluated)
```

Both `x` and `y` are `false`. Only the side effects differ.

## Why short-circuit matters

The left operand can **guard** the right one, so that the right one runs only when it is safe:

```csharp
// never divides by zero
if (count != 0 && total / count > 10) { /* ... */ }

// never touches a null string
if (text != null && text.Length > 0) { /* ... */ }

// the same idea with ||
if (text == null || text.Length == 0) { Console.WriteLine("empty"); }
```

Swap the operands, or use `&`, and the first example crashes with `DivideByZeroException` when `count` is `0`, while the second throws `NullReferenceException` when `text` is `null`.

```csharp
string text = null;
Console.WriteLine(text != null & text.Length > 0);   // NullReferenceException
```

The order of conditions is therefore part of the logic: put the guard first, then the check that depends on it.

## Which one to use

Almost always `&&` and `||`. They are faster and safer. Use `&` and `|` on `bool` only when you really want both sides to run, for example when each one performs a check and reports a problem, and you want all the problems reported at once. Even then, many developers prefer to write the calls on separate lines.

## `&` and `|` on integers

On whole numbers the same characters are **bitwise** operators. They work on every bit of the numbers and have nothing to do with conditions:

```csharp
Console.WriteLine(6 & 3);   // 2   (110 and 011 give 010)
Console.WriteLine(6 | 3);   // 7   (110 or 011 give 111)
```

A condition such as `x & 1 == 0` is a mistake: `==` binds more tightly than `&`, so the expression compares `1 == 0` first and then fails to compile. Add parentheses: `(x & 1) == 0`.

## The conditional operator is lazy too

In `condition ? a : b`, only the chosen branch is evaluated:

```csharp
int result = divisor != 0 ? total / divisor : 0;   // safe
```
