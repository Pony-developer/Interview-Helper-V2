When a struct is passed to a method, the method receives a **copy**. Changes made inside the method do not reach the caller's variable.

```csharp
struct Point
{
    public int X;
}

static void Move(Point p)
{
    p.X = 100;                 // changes the copy only
}

Point a = new Point { X = 1 };
Move(a);
Console.WriteLine(a.X);        // 1: the caller's struct is unchanged
```

This is the same rule as for `int`: passing an `int` to a method cannot change the caller's number. A class object would behave differently, because only the reference is copied:

```csharp
static void MoveObject(PointClass p)
{
    p.X = 100;                 // changes the shared object
}
```

## Returning a struct

A method can return a struct. The caller gets a new copy, which is the usual way to produce a changed value without modifying the original:

```csharp
static Point Shifted(Point p, int dx)
{
    return new Point { X = p.X + dx };
}

Point a = new Point { X = 1 };
Point b = Shifted(a, 5);
Console.WriteLine(a.X + " " + b.X);     // 1 6
```

## The cost of copying

A copy of a small struct is cheap. A large struct (many fields) is copied on every call, which costs time and memory. For big data, or when a method must change the caller's variable, pass it by **reference** with `ref`, the subject of the next lecture.
