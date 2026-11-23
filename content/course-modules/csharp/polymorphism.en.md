**Polymorphism** ("many forms") is the ability to use objects of different classes **through the same type**, and let each object do the action **in its own way**.

You have already seen the first half: an `IShape` variable can hold a `Circle` or a `Square`. The second half is the key: when you call `shape.Area()`, **the object decides** which code runs.

```csharp
IShape[] shapes = { new Circle(1), new Square(2), new Circle(0.5) };

foreach (IShape shape in shapes)
{
    Console.WriteLine(shape.Name + ": " + Math.Round(shape.Area(), 2));
}
// Circle: 3.14
// Square: 4
// Circle: 0.79
```

The loop has one line of code, and three objects behave in three ways. The line is the same for every shape, and it works for a shape that **does not exist yet**: add a `Triangle : IShape`, and the loop needs no change.

## Without polymorphism

The same program without it needs a **type check** for each case:

```csharp
foreach (object shape in shapes)
{
    if (shape is Circle c)
    {
        total += Math.PI * c.Radius * c.Radius;
    }
    else if (shape is Square s)
    {
        total += s.Side * s.Side;
    }
    // a Triangle? Find every such place in the program and add a branch...
}
```

Such a chain of `if` and `is` is a **warning sign**. Every new class means edits in every place where the chain is repeated, and a missed place is a silent bug. Polymorphism replaces the chain with **one call**: "tell it to do it, and it knows how".

## Dynamic dispatch

When the program runs `shape.Area()`, the compiler knows only the **static** type, `IShape`. The version of the method is chosen **while the program runs**, by the **dynamic** (actual) type of the object. This is called **dynamic dispatch**, or **late binding**.

```csharp
IShape shape = new Square(2);
shape = new Circle(1);                       // the same variable, another object
Console.WriteLine(shape.Area());             // Circle's Area runs
```

## Two ways to get polymorphism

1. Through an **interface**: different classes implement the same contract (the previous lectures).
2. Through a **base class with virtual methods**: derived classes **override** the behaviour of the base class (the next lecture).

Both give the same effect for the code that uses them. An interface is better when the classes are unrelated or only share a role. A base class is better when they also share the **data** and some of the **code**.

## Example: a base class and a list

```csharp
var animals = new List<Animal> { new Dog(), new Cat(), new Cow() };
foreach (Animal animal in animals)
{
    Console.WriteLine(animal.Sound());        // Woof, Meow, Moo
}
```

The list has one element type, `Animal`, and holds objects of three classes. Each of them answers `Sound()` in its own way.

## Why it matters

- **Less code**: no copies of methods for each type, no chains of `if` / `is`.
- **Easier changes**: a new kind of object is a new class, and the old code is not touched.
- **Testing**: a real object can be replaced with a simple fake one, if the code asks for an interface.

The rest of the module shows how to **make** a method that behaves in this way: `virtual` and `override`.
