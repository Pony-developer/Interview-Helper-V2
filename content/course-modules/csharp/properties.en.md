Public fields are easy, but they let anyone put the object into a nonsense state:

```csharp
book.Pages = -500;       // a book with negative pages
```

A **property** looks like a field to the code that uses it, and it is a pair of small methods inside, so the class keeps control.

## A property with a backing field

```csharp
class Book
{
    private int pages;                     // the backing field, hidden

    public int Pages
    {
        get { return pages; }              // runs when you READ book.Pages
        set                                // runs when you WRITE book.Pages = ...
        {
            if (value < 0) throw new ArgumentException("Pages cannot be negative");
            pages = value;                 // "value" is what was assigned
        }
    }
}

var book = new Book();
book.Pages = 310;                          // calls the set accessor
Console.WriteLine(book.Pages);             // calls the get accessor
book.Pages = -5;                           // ArgumentException
```

The outside code uses the same syntax as for a field. The class can **validate**, **log**, **compute** or **notify** whenever the value is read or written, and it can change its inner design later without breaking anyone.

## Auto-properties

Most properties do nothing special. For those, C# writes the backing field for you:

```csharp
public string Title { get; set; }          // an auto-property: a hidden field and trivial accessors
```

It is shorter, and it still allows adding a check later without changing the callers. This is why **public data should always be a property, never a field**.

## Controlling who can write

The accessors can have different access levels, or one of them can be missing:

```csharp
public string Title { get; set; }              // read and write for everyone
public int Id { get; }                         // read-only: can be set only in the constructor
public int Pages { get; private set; }         // everyone reads, only the class writes
```

A **read-only** property is the key to **immutable** objects, which cannot change after creation. They are easy to reason about, and safe to share:

```csharp
class Point
{
    public double X { get; }
    public double Y { get; }

    public Point(double x, double y)
    {
        X = x;
        Y = y;
    }
}
```

## Computed properties

A property does not need to store anything. It can calculate its value on every read:

```csharp
public double Area => Width * Height;                        // read-only, expression-bodied
public string FullName => FirstName + " " + LastName;
public bool IsLong => Pages >= 300;
```

`=>` after the name is the short form for `{ get { return ...; } }`. It is a good fit for values that **follow** from other data: they cannot go out of date, because they are not stored.

## Initial values and object initializers

An auto-property can get a value right at the declaration:

```csharp
public int Level { get; set; } = 1;
public List<string> Tags { get; } = new List<string>();
```

An **object initializer** sets the properties right after `new`, in braces:

```csharp
var book = new Book { Title = "The Hobbit", Pages = 310 };
```

It calls the parameterless constructor, and then the setters. It reads well, especially for classes with many optional properties.

## Fields or properties?

| | Field | Property |
| --- | --- | --- |
| Validation on write | no | yes |
| Computed value | no | yes |
| Different read/write access | no | yes |
| Can be changed to something smarter later without breaking callers | no | yes |
| Good for | **private** internal state | everything **public** |

The convention: a **private field** starts with a lower-case letter (or `_`) and a **public property** with a capital letter.

## readonly fields

A private field can be marked `readonly`: it can be assigned only in the declaration or in a constructor, and never afterwards.

```csharp
private readonly string id;

public Book(string id)
{
    this.id = id;          // allowed here, and nowhere else
}
```

Use `readonly` and read-only properties as much as you can: less that can change means fewer bugs.

## The summary

- A property is a field with a **door**, and the class decides what happens at the door.
- `{ get; set; }` is the shortest form, and it is already better than a public field.
- `{ get; }` and `private set` protect against outside changes.
- `=>` makes a computed, read-only property.
- An object initializer sets properties right after `new`.
