Every field of a struct gets a default value, but a struct local variable has a rule that a class variable does not: **its fields must be assigned before they are read**.

```csharp
struct Point
{
    public int X;
    public int Y;
}

Point p;
// Console.WriteLine(p.X);         // error CS0170: use of unassigned field
p.X = 1;
p.Y = 2;
Console.WriteLine(p.X + p.Y);      // 3, now fine
```

The compiler checks this for each local struct. The simple ways to make sure every field is set are:

```csharp
Point a = new Point();                  // all fields are 0
Point b = new Point { X = 3, Y = 4 };   // object initializer
```

## A constructor for a struct

A struct may have a constructor with parameters. In C# 7 such a constructor **must assign every field**, otherwise it does not compile:

```csharp
struct Point
{
    public int X;
    public int Y;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}

Point p = new Point(3, 4);
```

A struct cannot have a **parameterless** constructor written by you in C# 7 (the default one always exists). Use an object initializer or a factory method when you need a different starting value.

## Field initializers

In C# 7, a struct cannot have field initializers such as `public int X = 5;`. The fields get their values from the constructor or from the code that uses the struct. This is one more reason to keep structs small and simple.
