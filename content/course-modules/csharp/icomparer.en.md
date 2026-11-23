`IComparable<T>` gives a class **one** natural order. But the same books may need different orders at different moments: by year for the catalogue, by title for the reader, by price for the shop. And sometimes the class is **not yours**, so you cannot add `CompareTo` to it.

The interface **`IComparer<T>`** moves the comparison **out** of the class, into a separate small object, a **comparer**:

```csharp
interface IComparer<T>
{
    int Compare(T x, T y);                 // the same contract as CompareTo: negative / 0 / positive
}
```

The namespace is `System.Collections.Generic`, so the file needs `using System.Collections.Generic;`.

## Writing a comparer

```csharp
class Book
{
    public string Title { get; }
    public int Year { get; }

    public Book(string title, int year) { Title = title; Year = year; }
}

class ByTitle : IComparer<Book>
{
    public int Compare(Book x, Book y)
    {
        return string.CompareOrdinal(x.Title, y.Title);
    }
}

class ByYearDescending : IComparer<Book>
{
    public int Compare(Book x, Book y)
    {
        return y.Year.CompareTo(x.Year);               // swapped: newest first
    }
}
```

## Using a comparer

Pass it as the second argument of the sorting methods:

```csharp
Book[] books = { new Book("Emma", 1815), new Book("Dune", 1965), new Book("Ulysses", 1922) };

Array.Sort(books, new ByTitle());                      // Dune, Emma, Ulysses
Array.Sort(books, new ByYearDescending());             // Dune (1965), Ulysses (1922), Emma (1815)

var list = new List<Book>(books);
list.Sort(new ByTitle());                              // the same for lists
```

The class `Book` itself did not change. One class, many orders: this is the reason for the interface.

## A comparer with a setting

A comparer is an ordinary object, so it can have **fields** and a constructor:

```csharp
class ByDistanceFrom : IComparer<int>
{
    private readonly int center;

    public ByDistanceFrom(int center) { this.center = center; }

    public int Compare(int x, int y)
    {
        return Math.Abs(x - center).CompareTo(Math.Abs(y - center));
    }
}

int[] numbers = { 10, 3, 7, 5, 1 };
Array.Sort(numbers, new ByDistanceFrom(6));            // 5 and 7 first (in either order), then 3, 10, 1: the distances are 1 1 3 4 5
```

Note that `5` and `7` are **equal** for this comparer (both are at the distance 1). A sort may leave equal elements in **any** order, so do not count on the order between them. If you need a fixed answer, add a **second rule**, as in the multi-field `CompareTo`.

## Shorter: a comparison as a lambda

For a one-time order, writing a whole class is heavy. `Array.Sort` and `List.Sort` also accept a **lambda**, a short function written in place:

```csharp
Array.Sort(books, (a, b) => string.CompareOrdinal(a.Title, b.Title));
```

It means "given `a` and `b`, the result is...". It does the same as the comparer class, and the comparison is visible exactly where it is used. A class is better when the order is used in many places, has settings, or is tested separately.

## IComparable or IComparer?

| | `IComparable<T>` | `IComparer<T>` |
|---|---|---|
| Who implements it | The class being compared | A separate class |
| How many orders | One, "natural" | As many as you like |
| Needs access to the class code | Yes | No |
| Usage | `Array.Sort(items)` | `Array.Sort(items, comparer)` |

Give the class a natural order with `IComparable<T>`, if there is an obvious one, and add comparers for all the other orders.

## One more thing: a stable result

When two objects are "equal" for the order, `Array.Sort` may swap them. If the output must be the same on every run, make the order **total**: compare by the next field until the two objects can be told apart. It is a good habit in the tasks of this course, because the answer is compared with the expected text exactly.
