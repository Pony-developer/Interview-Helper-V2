Every member of a class is either an **instance** member or a **static** member. The difference decides **whom it belongs to**.

## Instance members belong to an object

Every object has its **own** instance fields, and instance methods work with **that** object's data:

```csharp
class Counter
{
    public int Value;                    // instance field: one for every Counter

    public void Increment()              // instance method: works on "this" counter
    {
        Value++;
    }
}

var a = new Counter();
var b = new Counter();
a.Increment();
a.Increment();
b.Increment();
Console.WriteLine(a.Value + " " + b.Value);    // 2 1: separate data
```

You must have an **object** to use them: `a.Increment()`.

## Static members belong to the class

A **static** member exists **once**, for the whole class, whether there are objects or not. You use it through the **class name**:

```csharp
class Counter
{
    public int Value;
    public static int Created;           // static field: ONE for the whole class

    public Counter()
    {
        Created++;                       // every new counter increases the shared number
    }
}

var a = new Counter();
var b = new Counter();
Console.WriteLine(Counter.Created);      // 2: read through the class name
```

You already know static members: `Math.Sqrt`, `Console.WriteLine`, `int.Parse`, `string.Join`, `Array.Sort`. They are called through the class, because they do not work with any particular object.

## A comparison

| | Instance | Static |
| --- | --- | --- |
| Belongs to | each object | the class itself |
| Needs an object to use | yes | no |
| Reached through | `object.Member` | `ClassName.Member` |
| Count of copies | one per object | exactly one |
| Can use `this` | yes | **no** |
| Lives | as long as the object | for the whole program |

## What can use what

- An **instance** method can use both instance and static members.
- A **static** method has **no `this`**, so it cannot use instance members directly: there is no object to ask. It must be given an object as a parameter.

```csharp
class Counter
{
    public int Value;
    public static int Created;

    public void Show() => Console.WriteLine(Value + " of " + Created);    // both: fine

    public static void Reset()
    {
        Created = 0;                  // fine: a static member
        // Value = 0;                 // error: which counter's Value?
    }
}
```

## Choosing: static or instance?

Ask: **does this belong to one particular object, or to the idea as a whole?**

- A book's title: **instance**. Different books have different titles.
- The number of books created: **static**. It is one number for all.
- A method that calculates something from its own data (`book.ReadingDays(40)`): **instance**.
- A method that does not touch any object's data (`Math.Max(a, b)`, `int.Parse(text)`): **static**.
- A **factory** that makes objects: often static (`Point.Origin`, `Color.FromRgb(...)`).

A good rule: if a method has to take an object of its own class as the **first parameter**, it probably wants to be an instance method.

## Static constants

A value that **never changes** and is the same for everybody is a **constant**:

```csharp
class Circle
{
    public const double Pi = 3.14159;                      // compile-time constant, implicitly static
    public static readonly Circle Unit = new Circle(1);    // a static value created at run time

    public double Radius;
    public Circle(double radius) { Radius = radius; }
    public double Area => Pi * Radius * Radius;
}

Console.WriteLine(Circle.Pi);
```

`const` is for values known at compile time (numbers, strings). `static readonly` is for values that have to be created when the program starts, such as objects.

## Static constructors

A class can have **one** static constructor. It runs automatically, once, before the class is first used, and it sets up static data:

```csharp
class Settings
{
    public static readonly string[] Names;
    static Settings()
    {
        Names = new[] { "low", "medium", "high" };
    }
}
```

## The dangers of static state

A **mutable static field** is a **global variable**. Everyone can change it, from anywhere, and it lives as long as the program:

- the code that uses it is hard to **understand**: the result of a method depends on what some other code did earlier;
- it is hard to **test**: one test leaves its trace for the next;
- it is **not safe** when several threads use it at once.

Static **constants** and **read-only** values are fine. Static **mutable** state should be rare, and well hidden. The lecture on static classes returns to this.

## Static and memory

Instance data is created with each `new`, and it can be collected when nobody refers to the object any more. Static data stays until the program ends. A static collection that only grows (a "cache" with no limit) is a **memory leak**.

## The summary

- **Instance**: one per object, needs an object, can use `this`.
- **Static**: one per class, used through the class name, has no `this`.
- Choose by asking whom the member **belongs to**.
- Use static for constants and for functions that do not need any object's data. Avoid shared mutable static state.
