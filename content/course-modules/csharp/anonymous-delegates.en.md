Before lambda expressions (C# 3), a delegate could be written inline, without a separate method, with the **anonymous method** syntax:

```csharp
Operation twice = delegate (int a, int b)
{
    return (a + b) * 2;
};

Console.WriteLine(twice(1, 2));     // 6
```

The keyword `delegate` is followed by the parameter list and a block. There is no name of a method, so the code is written right where it is used. This is handy for a short piece of behaviour that is needed only once.

## What it can do that a method cannot

The anonymous method **sees the local variables** of the place where it is written, and can read and change them:

```csharp
int bonus = 10;
Func<int, int> addBonus = delegate (int x)
{
    return x + bonus;               // uses the local variable "bonus"
};

Console.WriteLine(addBonus(5));      // 15
```

This is called a **closure**, and the lecture about closures explains how it works.

## Anonymous delegates without parameters

If the delegate takes no parameters, the parentheses can be left out:

```csharp
Action hello = delegate { Console.WriteLine("hello"); };
hello();
```

## Today

Anonymous methods are older. New code uses lambda expressions, which are shorter and do the same job. You will still meet `delegate { }` in older code, and it is worth being able to read it.
