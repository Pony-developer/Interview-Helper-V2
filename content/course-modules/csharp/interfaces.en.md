A class can have **only one** base class. But a real object plays several roles: a document can be *printable*, *savable*, *comparable*. An **interface** describes one such role, as a **contract**: a list of members that a type promises to have. It does not say **how** they work.

## Declaring an interface

```csharp
interface IShape
{
    double Area();                         // no body, no access modifier
    string Name { get; }                   // a property is allowed too
}
```

By convention, the names of interfaces start with **`I`**. All the members of an interface are `public` automatically, and they have **no code**. An interface has no fields and no constructors.

## Implementing an interface

A class that **implements** the interface writes all its members. The syntax is the same colon as for inheritance:

```csharp
class Circle : IShape
{
    private readonly double radius;

    public Circle(double radius) { this.radius = radius; }

    public double Area() { return Math.PI * radius * radius; }
    public string Name { get { return "Circle"; } }
}

class Square : IShape
{
    private readonly double side;

    public Square(double side) { this.side = side; }

    public double Area() { return side * side; }
    public string Name { get { return "Square"; } }
}
```

If a class forgets a member, you get a compile error: *"`Circle` does not implement interface member `IShape.Area()`"*. The contract is checked by the compiler.

## An interface is a type

A variable can have the type of an interface, and it can hold **any object whose class implements it**:

```csharp
IShape shape = new Circle(1);
Console.WriteLine(shape.Name + ": " + Math.Round(shape.Area(), 2));    // Circle: 3.14

IShape[] shapes = { new Circle(1), new Square(2), new Circle(0.5) };
double total = 0;
foreach (IShape s in shapes)
{
    total += s.Area();                     // each object counts its own area
}
```

The code that uses `IShape` does not know, and does not **need** to know, which class stands behind it. It is the same idea as with a base class, but without any shared code and without the restriction of one parent. The casts from the previous lecture work here as well: `shape is Circle`, `shape as Square`.

## Several interfaces

A class can implement **as many interfaces as it wants**, and have one base class at the same time. The base class goes first:

```csharp
class Report : Document, IPrintable, ISavable
{
    // ...
}
```

## Interface or base class?

- A **base class** says what an object **is**, and it can share **code** and **data** with the derived classes.
- An **interface** says what an object **can do**, and it shares only the **contract**. Unrelated classes (a `Report`, a `Photo`, a `Chair`) can implement the same interface.

When a part of a program needs only "something that can be compared" or "something with an area", ask for an **interface**. It makes the code easy to extend and to test.

## Interfaces from the standard library

You have already used them without noticing:

| Interface | The contract | Where you meet it |
|---|---|---|
| `IComparable<T>` | "I can be compared with another `T`" | `Array.Sort`, `List.Sort` |
| `IComparer<T>` | "I compare two `T` objects" | `Array.Sort` with a custom order |
| `IEnumerable<T>` | "I can be walked through" | `foreach`, LINQ |
| `IDisposable` | "I must be cleaned up" | `using` |

`foreach` works for arrays, lists and strings, because they all implement `IEnumerable`. The next lectures show how `IComparable<T>` and `IComparer<T>` give an order to your own classes.

## Abstract classes: in the middle

An **abstract class** is a base class that is not completed: some members have no code (`abstract`), and objects of it cannot be created. It sits between a class and an interface:

```csharp
abstract class Shape
{
    public abstract double Area();                    // derived classes must write this
    public string Describe() { return "Area " + Area(); }   // shared code
}
```

We meet `abstract` again in the lecture about virtual methods.
