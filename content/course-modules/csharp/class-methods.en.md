You have written static methods since the module on methods. In a class, most methods are **instance** methods: they work with the data of the object they are called on. This lecture covers what is specific to them.

## An instance method

```csharp
class Rectangle
{
    public double Width { get; }
    public double Height { get; }

    public Rectangle(double width, double height)
    {
        Width = width;
        Height = height;
    }

    public double Area() => Width * Height;
    public double Perimeter() => 2 * (Width + Height);
    public bool IsSquare() => Width == Height;
}

var r = new Rectangle(3, 4);
Console.WriteLine(r.Area());       // 12
Console.WriteLine(r.IsSquare());   // False
```

The methods take no `Width` and `Height` as parameters: they read them from `this`, the object the method is called on. This is the benefit of OOP: the data and the code that uses it travel together, so the calls are short.

## Parameters of other objects

A method often works with **another** object of the same class:

```csharp
public bool IsBiggerThan(Rectangle other) => Area() > other.Area();

var small = new Rectangle(1, 2);
var large = new Rectangle(5, 5);
Console.WriteLine(large.IsBiggerThan(small));   // True
```

Inside the class, a method can read even the **private** members of the other object of the same class.

## Changing the object, or returning a new one?

A method can **mutate** the object (change its data), or **return a new object** and leave the original alone:

```csharp
class Vector
{
    public double X { get; private set; }
    public double Y { get; private set; }

    public Vector(double x, double y) { X = x; Y = y; }

    public void ScaleInPlace(double k)          // mutates this object; returns nothing
    {
        X *= k;
        Y *= k;
    }

    public Vector Scaled(double k)              // returns a NEW object; this one is unchanged
    {
        return new Vector(X * k, Y * k);
    }
}
```

| Style | Name | Effect |
| --- | --- | --- |
| mutating | a verb: `Add`, `Clear`, `ScaleInPlace` | changes the object, usually returns `void` |
| returning a new value | a noun or an adjective: `Scaled`, `Normalized`, `Plus` | the original stays the same |

Returning new objects, as `string` does (`ToUpper` returns a new string), makes the code easier to follow, and the objects safe to share. It costs a little memory.

## Overloading

Several methods can share a **name**, if their **parameters differ** in number or in type:

```csharp
class Printer
{
    public void Print(int number) => Console.WriteLine("int: " + number);
    public void Print(string text) => Console.WriteLine("text: " + text);
    public void Print(string text, int times)
    {
        for (int i = 0; i < times; i++) Console.WriteLine(text);
    }
}
```

The compiler picks the one that fits the arguments. The return type alone does not make an overload.

## Overloaded constructors and chaining

A class can offer several ways to be created. To avoid repeating code, one constructor can call another with `: this(...)`:

```csharp
class Book
{
    public string Title { get; }
    public int Pages { get; }

    public Book(string title, int pages)
    {
        Title = title;
        Pages = pages;
    }

    public Book(string title) : this(title, 100)      // calls the constructor above
    {
    }
}
```

## Optional and named parameters

```csharp
public string Describe(bool withPages = true) => withPages ? Title + " (" + Pages + ")" : Title;

book.Describe();                       // withPages is true
book.Describe(withPages: false);       // a named argument
```

## The methods every object has

Every class inherits a few methods from `object`, which you can **override** to make them meaningful.

**`ToString()`**: the text for the object.

```csharp
public override string ToString() => Title + " (" + Pages + " pages)";

Console.WriteLine(book);               // calls ToString: The Hobbit (310 pages)
string text = "Book: " + book;         // also calls it
```

**`Equals()`** and **`GetHashCode()`**: by default, two objects are equal only if they are the **same** object (the same reference). For a class whose objects should be equal when their **data** is equal, override both:

```csharp
public override bool Equals(object obj)
{
    var other = obj as Point;
    return other != null && X == other.X && Y == other.Y;
}

public override int GetHashCode() => X.GetHashCode() ^ Y.GetHashCode();
```

Override them together: objects that are equal must have the same hash code, otherwise a `Dictionary` or a `HashSet` will misbehave.

## Operators

You can give a class the familiar operators. An operator is a **static** method with a special name:

```csharp
class Vector
{
    public double X { get; }
    public double Y { get; }
    public Vector(double x, double y) { X = x; Y = y; }

    public static Vector operator +(Vector a, Vector b) => new Vector(a.X + b.X, a.Y + b.Y);
    public static Vector operator -(Vector a, Vector b) => new Vector(a.X - b.X, a.Y - b.Y);
    public static Vector operator *(Vector v, double k) => new Vector(v.X * k, v.Y * k);

    public override string ToString() => "(" + X + ", " + Y + ")";
}

var v = new Vector(1, 2) + new Vector(3, 4);       // (4, 6)
var w = v * 2;                                      // (8, 12)
```

Use operators only when the meaning is obvious and mathematical (vectors, fractions, money). If you have to explain what `a + b` does, use a method with a clear name.

## Designing methods

- **One job** per method, and a name that says it: a verb for an action (`Deposit`), a question for a check (`IsEmpty`, `Contains`).
- **Few parameters.** More than three or four is a sign that they belong in an object of their own.
- **Validate** what comes from outside: a negative amount, a null reference.
- **Do not mix calculating and printing.** A method that returns a value can be tested, and one that prints cannot.
- **Return** a value, and let the caller decide what to do with it. A method called `Withdraw` can return `bool` for success, instead of printing a message.

## Methods and properties

When something reads like a **value** of the object (`Area`, `FullName`), a computed property is natural. When it reads like an **action** or needs a parameter (`Deposit(100)`, `ReadingDays(40)`), use a method. A getter should be cheap, and have no surprising side effects.

## The summary

- An instance method works with `this`: the data and the behaviour travel together.
- Decide whether it **changes** the object or **returns** a new one, and make the name say so.
- Overload for convenience, chain constructors to avoid repeating code.
- Override `ToString`, and `Equals` with `GetHashCode`, when the default behaviour is not right.
- Operators are static methods, to be used sparingly.
