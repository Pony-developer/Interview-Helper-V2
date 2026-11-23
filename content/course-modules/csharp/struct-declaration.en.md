A **struct** is a type that, like `int` or `double`, is a **value type**. It is declared with the keyword `struct` and looks much like a class:

```csharp
struct Point
{
    public int X;
    public int Y;

    public int Sum()
    {
        return X + Y;
    }
}

Point p = new Point();
p.X = 3;
p.Y = 4;
Console.WriteLine(p.Sum());        // 7
```

A struct can have fields, properties, methods, constructors, and it can implement interfaces. What it **cannot** do is inherit from a class (or be a base class for another struct). A struct is always derived from `System.ValueType`, and that is the whole family tree.

## Value type and reference type

The important difference is **what a variable holds**:

- a **class** variable holds a **reference** to an object, which lives elsewhere (on the heap);
- a **struct** variable holds **the data itself**, inline.

```csharp
class PointClass { public int X; }
struct PointStruct { public int X; }

var c1 = new PointClass();
var c2 = c1;                       // c2 is a second reference to the SAME object
c2.X = 10;
Console.WriteLine(c1.X);           // 10

var s1 = new PointStruct();
var s2 = s1;                       // s2 is a COPY of all the data
s2.X = 10;
Console.WriteLine(s1.X);           // 0
```

Assignment of a struct **copies** it. Each variable then has its own independent values.

## The default value

Every struct has a built-in **parameterless constructor** that sets all the fields to their default values (`0`, `false`, `null`). `new Point()` gives `X = 0, Y = 0`. Even without `new`, a struct variable has a default value, which is why it is not "empty" like a reference set to `null`.

## When is a struct the right choice?

Use a struct for a small value that behaves like a number: a point, a color, a money amount, a date range. The next lecture shows how the data is passed around, and the lecture "Why do we need structs" compares the two kinds in detail.
