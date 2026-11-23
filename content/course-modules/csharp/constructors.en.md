A property can check every change, but one moment is still dangerous: **the creation** of the object. If the object starts empty (`new Order()`), then for some time it has no quantity and no price, and the invariants do not hold yet. The **constructor** closes this gap: it makes the object **valid from the first moment of its life**.

```csharp
class Order
{
    public int Quantity { get; }
    public decimal PricePerItem { get; }

    public Order(int quantity, decimal pricePerItem)       // the only way to create an Order
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException("quantity");
        if (pricePerItem < 0) throw new ArgumentOutOfRangeException("pricePerItem");
        Quantity = quantity;
        PricePerItem = pricePerItem;
    }
}

var order = new Order(3, 9.99m);                           // fine
// var empty = new Order();                                // error: there is no constructor without arguments
// var bad = new Order(-1, 5m);                            // an exception: the object is never created
```

If the constructor throws, the object is **never created**: no code can get a half-built or invalid `Order`. This is the strongest guarantee, and the main reason to prefer constructors with parameters for the **required** data.

## The default constructor disappears

If a class has **no constructor at all**, C# creates an empty one with no parameters. As soon as you write **any** constructor, the empty one is **not created**. This is useful: by declaring the constructor with parameters, you forbid `new Order()`.

## Several constructors: overloading

A class may have many constructors with different parameters:

```csharp
class Point
{
    public double X { get; }
    public double Y { get; }

    public Point(double x, double y) { X = x; Y = y; }
    public Point() : this(0, 0) { }                        // delegates to the first constructor
    public Point(double both) : this(both, both) { }
}
```

**`: this(...)`** calls **another constructor of the same class**. Use it to avoid copying the checks: the whole logic lives in **one** main constructor, and the others only supply the default values. Compare with `: base(...)`, which calls the constructor of the **base class**.

## Constructors and `readonly`

A constructor is the place where the `readonly` fields and get-only properties are set. After it ends, they cannot change (next lecture).

## Factory methods

Sometimes a constructor is not the best way. A **static factory method** has a **name**, and it can explain **what** is created, or return `null`, or choose between types:

```csharp
class Temperature
{
    public double Celsius { get; }

    private Temperature(double celsius) { Celsius = celsius; }       // private: use the factories

    public static Temperature FromCelsius(double c) { return new Temperature(c); }
    public static Temperature FromFahrenheit(double f) { return new Temperature((f - 32) * 5 / 9); }
}

var t = Temperature.FromFahrenheit(212);                   // clearer than new Temperature(100)
```

Two constructors cannot both be `Temperature(double)` for Celsius and for Fahrenheit, because they would have the same signature. Named factories remove the problem.

## What a constructor should do

- **Set the fields** and check the arguments.
- **Not** do heavy work (no network, no long file reading), and **not** call `virtual` methods (a derived class is not ready yet).
- If an object needs many optional settings, you can use the object initializer after the constructor of the required ones:

```csharp
var report = new Report("Sales") { Landscape = true, Copies = 2 };
```

## Order of events when creating an object

1. The memory is allocated, and all the fields get their **default** values (`0`, `false`, `null`).
2. The field initializers run (`private int count = 5;`).
3. The **base** constructor runs.
4. The body of your constructor runs.

By the end of step 4, the object must satisfy all its invariants.
