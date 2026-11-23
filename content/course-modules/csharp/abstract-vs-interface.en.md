C# gives two tools for an incomplete type: the **abstract class** and the **interface**. They look alike, and beginners often ask which to choose. Here is a map.

## A comparison

| | Abstract class | Interface |
|---|---|---|
| Has code (bodies of methods) | Yes | No (only signatures) |
| Has fields and constructors | Yes | No |
| Several for one class | **No**, one base class | **Yes**, as many as needed |
| Access modifiers for members | Any | All public |
| Relation | "is a kind of" | "can do / has the role" |
| Can unrelated classes share it | Awkward | Natural |
| Changing it later | Adding a normal member is safe | Adding a member breaks all implementers |

## The questions that decide

**1. Is it a role or a kind?**

- `IComparable<T>`, `IDisposable`, `IEnumerable<T>`: **roles**. A `Book`, a `string` and a `Version` can all be comparable, and they have nothing in common otherwise. **Interface.**
- `Shape`, `Animal`, `Document`: **kinds** of things that share a structure. **Abstract class.**

**2. Is there shared code or data?** If the derived classes need the same **fields** and the same **code** (for example, a `Describe()` that uses the abstract parts), put it in an abstract class. An interface cannot hold it, and copying is the problem that we started with.

**3. Does a class need several roles?** A class has only **one** base class, but it can implement **many** interfaces. If the roles must combine (`Report` is `IPrintable`, `ISavable` and `IComparable<Report>`), these have to be interfaces.

**4. Will outsiders implement it?** If other people will write their own classes (plugins, tests with fakes), an **interface** is the friendlier contract: it asks them for nothing except the methods.

## Use both

The two tools combine well. A common design: an **interface** is the contract for the outside world, and an **abstract class** is a ready helper that implements most of it:

```csharp
interface IShape
{
    double Area { get; }
    string Describe();
}

abstract class ShapeBase : IShape                      // a helper: the shared part of the implementation
{
    public abstract double Area { get; }
    public string Describe() { return GetType().Name + " " + Math.Round(Area, 2); }
}

class Circle : ShapeBase { /* only the circle's own part */ }
```

The code that uses shapes asks for `IShape`. A class that wants the help derives from `ShapeBase`. A class that cannot (it already has a base class) implements `IShape` itself.

## Composition over inheritance

Inheritance is a **strong** link: a derived class depends on all the details of the base class, and a change in the base can break the derived ones. A common guideline: **prefer composition** ("has a") to inheritance ("is a"), and use inheritance when the "is a" relation is **real** and stable.

```csharp
// inheritance: "a Stack IS a List"... then anybody can insert into the middle of the stack
class Stack : List<int> { }

// composition: a Stack HAS a list, and shows only the stack operations
class Stack
{
    private readonly List<int> items = new List<int>();
    public void Push(int x) { items.Add(x); }
    public int Pop() { int x = items[items.Count - 1]; items.RemoveAt(items.Count - 1); return x; }
}
```

The second version gives the class **control** of its own interface, which is the idea of abstraction and encapsulation together.

## Small interfaces

A good interface is **small**: one or two members. `IComparable<T>` has one method. A "fat" interface with twenty methods forces implementers to write what they do not need. If you see such an interface, **split** it into several, each with one role. This is the "interface segregation" principle.

## A short guide

1. Need only a **contract** or a **role**: **interface**.
2. Need a contract **and** shared code or data for a **family** of types: **abstract class** (and maybe an interface in front).
3. Not sure: start with an **interface**. It is easier to add an abstract helper later than to remove an inheritance link.
