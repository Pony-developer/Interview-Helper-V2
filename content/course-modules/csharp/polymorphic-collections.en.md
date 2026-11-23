The greatest power of polymorphism shows when objects of **different classes live in one collection**. The collection has the type of a **base class** or an **interface**, and the code that goes through it treats everyone in the same way.

```csharp
abstract class Animal
{
    public string Name { get; }
    protected Animal(string name) { Name = name; }
    public abstract string Sound();
}

class Dog : Animal { public Dog(string n) : base(n) { } public override string Sound() { return "Woof"; } }
class Cat : Animal { public Cat(string n) : base(n) { } public override string Sound() { return "Meow"; } }
class Cow : Animal { public Cow(string n) : base(n) { } public override string Sound() { return "Moo"; } }

var farm = new List<Animal> { new Dog("Rex"), new Cat("Tom"), new Cow("Bess"), new Dog("Fido") };

foreach (Animal a in farm)
{
    Console.WriteLine(a.Name + ": " + a.Sound());       // each animal answers in its own way
}
```

The list has **one** element type, `Animal`, and holds objects of three classes. `farm.Add(new Cat("Kit"))` works, and so does any class derived from `Animal` that will be written next year.

## Other collections

The same works for any collection of a base type or an interface:

```csharp
IShape[] shapes = { new Circle(1), new Square(2) };

var byName = new Dictionary<string, Animal>
{
    { "dog", new Dog("Rex") },
    { "cat", new Cat("Tom") }
};
Console.WriteLine(byName["cat"].Sound());                // Meow: a lookup and a polymorphic call

var queue = new Queue<ICommand>();                       // a queue of different commands
queue.Enqueue(new MoveCommand());
queue.Enqueue(new SaveCommand());
while (queue.Count > 0) queue.Dequeue().Execute();       // each does its own work
```

A **list of commands**, where each element is an object with the method `Execute()`, is a very frequent design: undo stacks, task queues, game events, menus.

## Operations on the whole collection

You can write the algorithm **once**, in terms of the base type:

```csharp
static double TotalArea(IEnumerable<IShape> shapes)
{
    double total = 0;
    foreach (IShape s in shapes) total += s.Area;
    return total;
}
```

It adds up circles, squares and the shapes of the future. If you need only some elements, filter by a **property** (`if (a.IsDangerous)`), not by a **type** (`if (a is Dog)`).

## Which type to put in the list

| Need | Type of the element |
|---|---|
| A common role, no shared code | An interface |
| A common role with shared code and data | An abstract (or ordinary) base class |
| "Anything at all" | `object`, which is a last resort: you must cast |

## Casts inside a collection

If the list has the type `List<Animal>`, then `farm[0]` is an `Animal`, and its **declared** type is `Animal`. To use something that only `Dog` has, you need a cast:

```csharp
Dog dog = farm[0] as Dog;
if (dog != null) dog.Fetch();                  // possible, but a warning sign
```

A loop with many `is` and `as` checks means that the design lacks a **virtual method** in the base type. The next lecture shows how to remove such checks.

## Variance of collections

Can a list of dogs be used as a list of animals? It is a subtle point:

```csharp
List<Dog> dogs = new List<Dog> { new Dog("Rex") };

IEnumerable<Animal> animals = dogs;            // OK: IEnumerable<T> only GIVES objects out
// List<Animal> list = dogs;                   // error: a List<Animal> must also ACCEPT a Cat,
                                               //        and a list of dogs would break
```

`IEnumerable<T>` is **covariant**: a sequence of dogs **is** a sequence of animals, because you can only **read** from it. A `List<T>` can be written to, so it is **invariant**. This is why methods that only **read** should take `IEnumerable<T>`, as in `TotalArea` above: it accepts a `List<Circle>`, an array `Circle[]` and a `List<IShape>`.

## Sorting a mixed collection

Elements of a base type can be sorted if the base type (or the interface) defines an **order**: `IComparable<Animal>` in `Animal`, or a separate `IComparer<Animal>`. The comparison uses the **common** properties, so it works for any mix of derived classes.
