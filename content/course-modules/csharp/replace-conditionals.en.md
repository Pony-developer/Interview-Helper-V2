One of the most useful skills is to recognize a **chain of checks that should be polymorphism**. It looks like this:

```csharp
static double Area(object shape)
{
    if (shape is Circle c)
    {
        return Math.PI * c.Radius * c.Radius;
    }
    else if (shape is Square s)
    {
        return s.Side * s.Side;
    }
    else if (shape is Rectangle r)
    {
        return r.Width * r.Height;
    }
    throw new ArgumentException("Unknown shape");
}
```

Or the same with a **type code**:

```csharp
class Employee
{
    public int Type;                         // 1 = developer, 2 = manager, 3 = intern
}

static int Pay(Employee e)
{
    switch (e.Type)
    {
        case 1: return 3000;
        case 2: return 4000 + 100 * e.Reports;
        case 3: return e.Hours * 15;
        default: throw new ArgumentException("Unknown type");
    }
}
```

## Why it hurts

- **Every new kind** (a `Triangle`, a `Contractor`) needs a **new branch** in this function, and in every **other** function that checks the type: `Perimeter`, `Draw`, `Describe`, `Save`. A forgotten one gives the exception "Unknown shape" at run time, in production.
- The knowledge about one kind is **scattered** over the program, and the code of one shape is in ten places.
- The compiler **cannot help**: it does not tell you which `switch` to update.

This is called a **violation of the open/closed principle**: the code should be **open** for the addition of new kinds, and **closed** for editing the code that already works.

## The refactoring

1. Find the **common idea** of the branches: here, "something that has an area".
2. Add it to the base type as a **virtual or abstract** member: `public abstract double Area { get; }`.
3. **Move each branch** into the class that it belongs to: the `Circle` branch goes to `Circle.Area`, and so on.
4. Replace the whole chain with **one call**: `shape.Area`.
5. **Delete** the old function.

```csharp
abstract class Shape { public abstract double Area { get; } }

class Circle : Shape
{
    private readonly double radius;
    public Circle(double radius) { this.radius = radius; }
    public override double Area => Math.PI * radius * radius;      // the branch lives with its data
}

class Square : Shape { /* ... */ }
```

After that, the **new** kind is **one new class**. No existing code changes, and the compiler checks that the new class has everything required (the `abstract` members).

The data also improves: the fields `Radius` or `Side` can be **private**, because the code that needed them from outside is now inside the class.

For a type **code**, create a class for **each value**, and turn the `switch` into a virtual method. The field `Type` disappears, because the type of the object **is** the code.

## Are all `switch` statements bad?

No. A `switch` is fine when:

- the choice is among a **small, stable set** of values (the days of the week, the commands of a menu), and a new value is rare;
- it is in **one** place, usually where objects are **created** from input (a **factory**): `case "circle": return new Circle(...)`;
- it works on **plain data** (an `enum`), and there are no different behaviours to attach.

A `switch` is a **smell** when the **same** `switch` or `if`-chain appears in **several functions**, and every new kind needs edits in all of them.

## Pattern matching at the border

C# 7 has `switch` with type patterns, which is a neater way to write the "bad" chain:

```csharp
switch (shape)
{
    case Circle c: return Math.PI * c.Radius * c.Radius;
    case Square s: return s.Side * s.Side;
    default: throw new ArgumentException("Unknown shape");
}
```

It is shorter and clearer, but it is the **same** design with the same problems. It fits at the **edge** of the system, when you get objects of types that you cannot change (for example, from a library) and cannot add a method to. For your own classes, a virtual method is usually the better answer.

## A short checklist

1. Does the code ask an object **what it is**, and then **do something with it**?
2. Does the same question appear in several places?
3. Would a new kind of the object mean editing old code?

If the answer is "yes", **move the behaviour into the object**. This idea is sometimes put in the words **"tell, don't ask"**: do not ask the object about its type and decide for it, but tell it to do the work.
