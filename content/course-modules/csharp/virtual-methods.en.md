A base class can give a method a **default** behaviour, and let derived classes **replace** it. Two keywords do it:

- **`virtual`** in the base class: "this method may be replaced";
- **`override`** in the derived class: "this is the replacement".

```csharp
class Animal
{
    public string Name { get; }

    public Animal(string name) { Name = name; }

    public virtual string Sound()                  // the default
    {
        return "...";
    }

    public string Speak()
    {
        return Name + " says " + Sound();          // calls the version that fits the object
    }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }

    public override string Sound()                 // replaces the default
    {
        return "Woof";
    }
}

class Fish : Animal
{
    public Fish(string name) : base(name) { }      // no override: it keeps the default
}
```

```csharp
Animal[] animals = { new Dog("Rex"), new Fish("Nemo"), new Animal("Thing") };
foreach (Animal a in animals)
{
    Console.WriteLine(a.Speak());
}
// Rex says Woof
// Nemo says ...
// Thing says ...
```

Look at `Speak()`: it is written **once**, in `Animal`, and it calls `Sound()`. For a `Dog` object, the call runs `Dog.Sound()`, even though the code of `Speak` is in the base class. This is **dynamic dispatch**: the version is chosen by the **actual type** of the object.

## The rules

- A method that is not marked `virtual` **cannot** be overridden.
- The `override` method must have exactly the same **name, parameters and return type**, and the same access.
- A derived class that does not override the method **inherits** the base version.
- Properties can be `virtual` and `override` too.

## Calling the base version: `base.`

An override can extend the base behaviour instead of replacing it completely:

```csharp
class Puppy : Dog
{
    public Puppy(string name) : base(name) { }

    public override string Sound()
    {
        return base.Sound() + "! (squeaky)";       // the result of Dog.Sound() plus more
    }
}
```

## abstract: a method without a default

Sometimes there is **no sensible default**: what sound does "an animal" make? Then the method is **`abstract`**: it has no body, and every non-abstract derived class **must** override it. A class with an abstract member must itself be `abstract`, and you cannot create its objects with `new`:

```csharp
abstract class Shape
{
    public abstract double Area();                         // no body

    public string Describe()
    {
        return GetType().Name + " with the area " + Math.Round(Area(), 2);
    }
}

class Circle : Shape
{
    private readonly double radius;
    public Circle(double radius) { this.radius = radius; }

    public override double Area() { return Math.PI * radius * radius; }
}

// var s = new Shape();                        // error: cannot create an instance of an abstract class
Shape shape = new Circle(1);                   // fine: a variable of the abstract type
Console.WriteLine(shape.Describe());           // Circle with the area 3.14
```

An abstract class is a good place for the **shared** code (`Describe`) that depends on the **specific** parts (`Area`) that every derived class provides.

## `new` is not `override`

If a derived class declares a method with the same name **without** `override`, the compiler warns you and treats it as a **new, unrelated** method that *hides* the old one. The result depends on the **static** type of the variable, and it is a typical source of confusion:

```csharp
class A { public virtual string Who() { return "A"; } }
class B : A { public new string Who() { return "B"; } }     // hides, does not override
class C : A { public override string Who() { return "C"; } }

A b = new B();
A c = new C();
Console.WriteLine(b.Who());                    // A   (the static type decides)
Console.WriteLine(c.Who());                    // C   (the actual type decides)
```

Use `override` when you want polymorphism. A compiler warning *"hides inherited member, use the new keyword"* means that you probably forgot `override`.

## Stopping the inheritance: `sealed`

`sealed class Name { }` cannot be a base class. `sealed override` stops the further overriding of one method. Use it when a class was not designed to be extended.

## Every class has virtual methods: ToString

The class `object` has the virtual methods `ToString()`, `Equals(object)` and `GetHashCode()`. So any class can **override** them. The most useful is `ToString()`:

```csharp
class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y) { X = x; Y = y; }

    public override string ToString()
    {
        return "(" + X + ", " + Y + ")";
    }
}

var p = new Point(3, 4);
Console.WriteLine(p);                          // (3, 4)
Console.WriteLine("The point is " + p);        // The point is (3, 4)
Console.WriteLine(string.Join("; ", new List<Point> { p, new Point(0, 0) }));   // (3, 4); (0, 0)
```

Without the override, `Console.WriteLine(p)` prints the name of the type, `Point`. `Console.WriteLine`, the string concatenation with `+`, `string.Join` and the debugger all call `ToString()` for you. That is polymorphism again: they work with `object`, and every object answers in its own way.

## A warning: virtual calls in a constructor

Avoid calling a `virtual` method from a **constructor**. The base constructor runs **before** the derived one, so the overridden method would work with an object whose derived part is **not built yet** (its fields are still zero).
