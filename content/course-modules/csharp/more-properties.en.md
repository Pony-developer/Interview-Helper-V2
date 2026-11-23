Properties can do more than "return a field". Here are the patterns that you will use all the time.

## Computed properties

A property does not need a field at all. It can **calculate** the value from other data:

```csharp
class Rectangle
{
    public int Width { get; }
    public int Height { get; }

    public Rectangle(int width, int height) { Width = width; Height = height; }

    public int Area => Width * Height;                      // computed every time it is read
    public bool IsSquare => Width == Height;
}
```

`=>` here is the short form of `{ get { return ...; } }`. The great advantage: the value **cannot get out of date**. If `Area` was a stored field, then each change of `Width` would need a recalculation, and one forgotten update gives a wrong answer. A computed property is always right, because it has nothing to keep in sync.

```csharp
// the stored version: a trap
public int Area;                                            // who updates it when Width changes?
```

## Different access for `get` and `set`

The two parts can have different levels of access. The most useful combination: **everybody reads, only the class writes**:

```csharp
class Counter
{
    public int Value { get; private set; }                  // the outside code cannot change it

    public void Increment() { Value++; }                    // only the class does
}
```

```csharp
var c = new Counter();
c.Increment();
Console.WriteLine(c.Value);                                  // 1
// c.Value = 100;                                            // error: the set accessor is inaccessible
```

## Validation, normalization and the "changed" logic

A setter is a good place not only for checks, but also for **keeping the data in a convenient form**:

```csharp
private string name = "";

public string Name
{
    get { return name; }
    set
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("The name cannot be empty", "value");
        }
        name = value.Trim();                                 // always without extra spaces
    }
}
```

Keep a setter **short**. Heavy work inside makes the simple line `x.Name = "..."` slow and surprising.

## Object initializers

When a class has settable properties, you can create an object and fill it in one expression:

```csharp
var order = new Order { Quantity = 2, PricePerItem = 9.99m };
```

This calls the parameterless constructor, and then each `set`, **so the checks still work**. If any value is bad, the exception comes out here. The next lecture shows when a constructor with parameters is the better choice.

## Static properties

A property can be `static`: it belongs to the class, not to an object. For example, `DateTime.Now`, `Environment.NewLine`, `Math.PI` (a constant). Use them for values that **do not depend on a specific object**.

## Properties in interfaces

An interface can require a property too:

```csharp
interface IShape
{
    double Area { get; }                                     // the implementer chooses: computed or stored
}
```

## Recipe

1. Start with an **auto-property**: `public int X { get; set; }`.
2. If the value must not change from outside, make it `{ get; private set; }` or `{ get; }`.
3. If it must be validated, turn it into a **full property** with a backing field.
4. If it can be calculated, make it **computed**, and remove the field.

In all the steps, the code that **uses** the property stays the same.
