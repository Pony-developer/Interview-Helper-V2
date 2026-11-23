An **abstract class** describes something **incomplete**: a general idea that is not a finished thing. "A shape" has an area, but there is no way to calculate the area of "just a shape". The area is known only for a circle, a rectangle, a triangle. An abstract class lets you say it in code.

```csharp
abstract class Shape                                  // "abstract": objects of it cannot be created
{
    public abstract double Area { get; }              // abstract member: the signature only, no body
    public abstract string Name { get; }

    public string Describe()                          // an ordinary member, with code
    {
        return Name + " with the area " + Math.Round(Area, 2);
    }
}
```

## What an abstract class can have

- **abstract members** (methods, properties): no body, and they **must** be overridden in a non-abstract derived class;
- **ordinary members** with code: methods, properties, fields, constructors, `virtual` methods. These are the **shared** parts that all the derived classes get for free;
- any level of access, `protected` members included.

## Deriving from it

```csharp
class Circle : Shape
{
    private readonly double radius;

    public Circle(double radius) { this.radius = radius; }

    public override double Area => Math.PI * radius * radius;     // must be overridden
    public override string Name => "Circle";
}

class Square : Shape
{
    private readonly double side;

    public Square(double side) { this.side = side; }

    public override double Area => side * side;
    public override string Name => "Square";
}
```

```csharp
// Shape s = new Shape();                              // error CS0144: cannot create an instance of an abstract class

Shape[] shapes = { new Circle(1), new Square(2) };      // but a variable of an abstract type is fine
foreach (Shape shape in shapes)
{
    Console.WriteLine(shape.Describe());                // Describe is written once, for all
}
```

`Describe()` uses `Area` and `Name`, which are not yet written when the base class is compiled. This is the point: **the shared code is written against the abstract parts**, and every derived class supplies the details.

## The rules

- If a class has **at least one** abstract member, **the class must be `abstract`**.
- A derived class must **override all** abstract members, or be `abstract` itself.
- Abstract members are implicitly **virtual**, and in the derived class they are written with `override`.
- An abstract class **can** have a constructor, and it runs when a derived object is created (the derived constructor calls it through `: base(...)`). Its access is usually `protected`, to show that it is for the derived classes only.
- A class can derive from **one** abstract class.
- `static`, `sealed` and `abstract` cannot be mixed for the same class: `sealed` forbids derived classes, and `abstract` requires them.

## abstract or virtual?

| | `virtual` | `abstract` |
|---|---|---|
| Has a default body | Yes | No |
| Must it be overridden | No, it is optional | Yes, it is required |
| Where it may be declared | In any class | Only in an abstract class |

Use `virtual` when there is a **sensible default**. Use `abstract` when **there is no sensible default**, and each derived class has to decide.

## When to create an abstract class

1. Several classes **share code and data** and also have a **common role**.
2. The base class alone makes **no sense** as an object ("an animal", "a shape", "a document").
3. You want to **force** the derived classes to provide some parts.

A guard: the compiler will tell you, with an error, if somebody forgets to implement a required part. It is much better than a comment "do not forget to...".
