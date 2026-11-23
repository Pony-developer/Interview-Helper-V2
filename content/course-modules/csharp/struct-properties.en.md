Structs can have properties and methods, just like classes. But a struct is a **value**, and that creates one trap that surprises almost everyone: a change to a struct **obtained through a property or a list** can be lost.

```csharp
struct Point
{
    public int X;
    public int Y;
}

class Shape
{
    public Point Location;
    public Point Center { get; set; }
}
```

## Changing a field of a struct returned by a property

```csharp
var shape = new Shape();
shape.Location.X = 5;          // works: Location is a field, so it is a variable
// shape.Center.X = 5;         // error CS1612: cannot modify the return value of a property,
                               // because a property returns a COPY of the struct
```

The property `Center` returns a copy. Changing the copy changes nothing. The correct way is to read the copy, change it, and write it back:

```csharp
Point c = shape.Center;
c.X = 5;
shape.Center = c;              // now the change is kept
```

## The same trap with a list

```csharp
var points = new List<Point> { new Point { X = 1 } };
// points[0].X = 5;            // error CS1612: the indexer returns a copy
Point first = points[0];
first.X = 5;
points[0] = first;             // write it back
```

An **array** is different: `points[0].X = 5` works, because an array element is a variable, not a copy returned by a method.

```csharp
Point[] arr = { new Point { X = 1 } };
arr[0].X = 5;                  // works: an array element is a real storage location
```

## The rule

When you change part of a struct, make sure it is a **variable**: a local variable, a field, or an array element. A property, or a method's return value, gives a copy that is thrown away. This is why many experienced programmers prefer structs that are **immutable**, with no setters at all.
