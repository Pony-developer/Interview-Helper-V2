Methods such as `GetBalance()` and `SetQuantity(...)` work, but there are many of them, and the calls look heavy: `order.SetQuantity(order.GetQuantity() + 1)`. C# has a better tool: a **property**. It looks like a field from the outside, and works like a pair of methods inside.

## The syntax

```csharp
class Order
{
    private int quantity;                          // the backing field: hidden

    public int Quantity                            // the property: public
    {
        get { return quantity; }                   // runs when the value is READ
        set                                        // runs when the value is WRITTEN
        {
            if (value < 0)
            {
                throw new ArgumentOutOfRangeException("value", "The quantity cannot be negative");
            }
            quantity = value;                      // "value" is what the caller assigned
        }
    }
}

var order = new Order();
order.Quantity = 5;                                // calls set, with value == 5
Console.WriteLine(order.Quantity);                 // calls get: 5
order.Quantity += 1;                               // get, then set: 6
// order.Quantity = -3;                            // ArgumentOutOfRangeException, right here
```

For the caller, `order.Quantity` is as simple as a field. For the class, it is a place where the **rules** live. The caller cannot skip the check, and cannot tell (and need not know) that there is a check at all.

- `get` returns the value, and it must `return` something of the type of the property;
- `set` has the hidden parameter **`value`**: the value from the right side of the assignment;
- the **backing field** (`quantity`) is `private`, and the property (`Quantity`) is `public`. By convention, the property starts with a capital letter and the field with a small one.

## Read-only and write-only

A property may have only one part:

```csharp
public int Quantity { get { return quantity; } }       // read-only: nobody outside can write it
```

Such a property is the right way to **show** a value that the outside code must not change. The class can still change the field itself, inside its own methods.

## Auto-properties

Most properties do not have any rules: they are just "a field with a public face". For them, C# can write the field for you:

```csharp
public string Name { get; set; }                       // a hidden field is created by the compiler
public int Id { get; }                                 // read-only: set only in the constructor
public int Count { get; private set; }                 // everybody reads, only the class writes
```

This is shorter than a public field, and it is **better**: it is a property, so you can add a check later (turning it into a full property) and **no outside code changes**. A public field cannot be changed to a property without breaking the code that uses it.

## A property is not a method, but it is code

A property looks like a field, but `get` and `set` are real code that runs. A good property is:

- **fast**: it does not search a database or a file;
- **honest**: reading it twice in a row gives the same result, if nothing changed;
- **free of surprises**: reading never changes the object.

If the work is heavy, or the operation may fail often, make it a **method** (`LoadReport()`), not a property.

## Naming and style

```csharp
public decimal Balance { get; private set; }           // PascalCase for properties
private decimal balance;                               // camelCase for private fields
```

A common rule of thumb from now on: **a field is private, and the outside world sees only properties and methods**.
