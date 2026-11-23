A method has to report two things: the **result**, and whether the operation **succeeded**. There are two common ways to do it.

## Way 1: an exception

```csharp
static int Divide(int a, int b)
{
    if (b == 0)
    {
        throw new DivideByZeroException("The divisor is zero");
    }
    return a / b;
}

try
{
    Console.WriteLine(Divide(10, 0));
}
catch (DivideByZeroException)
{
    Console.WriteLine("cannot divide");
}
```

Use an exception for an **unexpected** problem: a bug, or a broken state that the caller should not have caused. The caller cannot ignore it, because the program stops unless someone catches it.

## Way 2: the Try pattern

For an **expected** failure, such as a user typing text that is not a number, a method returns `bool` and gives the result through an `out` parameter. This is the pattern of `int.TryParse`:

```csharp
static bool TryDivide(int a, int b, out int result)
{
    if (b == 0)
    {
        result = 0;
        return false;
    }
    result = a / b;
    return true;
}

int q;
if (TryDivide(10, 0, out q))
{
    Console.WriteLine(q);
}
else
{
    Console.WriteLine("cannot divide");
}
```

The `out` parameter must be assigned in every path, including the failure path, which is why `result = 0` appears in the `false` branch.

## Choosing

| Situation | Better choice |
|---|---|
| A wrong argument from the programmer | Exception |
| Bad user input, which is expected | `bool` with `out` (the Try pattern) |
| A failure that the caller may need to explain | Exception with a clear message |

Do not use exceptions for normal control flow. Throwing and catching costs time, and a loop that relies on exceptions is hard to read.
