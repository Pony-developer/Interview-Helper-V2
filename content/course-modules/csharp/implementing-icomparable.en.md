How does `Array.Sort` know which of two objects goes first? For numbers and strings it is built in. For **your** class, `Array.Sort` cannot guess: should the books be ordered by title, by year, by price? Try it:

```csharp
Book[] books = { new Book("Dune"), new Book("Emma") };
Array.Sort(books);                         // InvalidOperationException: "Failed to compare two elements in the array"
```

The solution is the interface **`IComparable<T>`**. A class that implements it says: "I know how to compare myself with another object of my type". The interface has one method:

```csharp
interface IComparable<T>
{
    int CompareTo(T other);
}
```

## The contract of CompareTo

`a.CompareTo(b)` returns an `int`, and only its **sign** matters:

- **a negative** number, if `a` goes **before** `b`;
- **zero**, if they are **equal** in the order;
- **a positive** number, if `a` goes **after** `b`.

```csharp
Console.WriteLine(3.CompareTo(5));         // -1: 3 goes before 5
Console.WriteLine(5.CompareTo(5));         // 0
Console.WriteLine("b".CompareTo("a"));     // 1: "b" goes after "a"
```

Do not rely on the exact values `-1` and `1`: some types return other negative and positive numbers.

## Implementing it

```csharp
class Book : IComparable<Book>
{
    public string Title { get; }
    public int Year { get; }

    public Book(string title, int year)
    {
        Title = title;
        Year = year;
    }

    public int CompareTo(Book other)
    {
        return Year.CompareTo(other.Year);          // older books first
    }
}

Book[] books = { new Book("Emma", 1815), new Book("Dune", 1965), new Book("Ulysses", 1922) };
Array.Sort(books);                                   // now it works
foreach (Book b in books)
{
    Console.WriteLine(b.Year + " " + b.Title);       // 1815 Emma, 1922 Ulysses, 1965 Dune
}
```

Now `Array.Sort`, `List<Book>.Sort()` and other methods that need an order work for `Book`. This is the **natural order** of the class: the one that is meant when nobody says otherwise.

## Comparing by several fields

When the first fields are equal, compare the next ones. The standard way:

```csharp
public int CompareTo(Book other)
{
    int byYear = Year.CompareTo(other.Year);
    if (byYear != 0)
    {
        return byYear;                     // the years differ: the answer is clear
    }
    return string.CompareOrdinal(Title, other.Title);    // the same year: by title
}
```

To reverse a direction (newest first), swap the operands: `other.Year.CompareTo(Year)`. **Do not return `Year - other.Year`**: for large numbers the subtraction can overflow and give a wrong sign.

## Strings: culture or ordinal

`"a".CompareTo("B")` follows the rules of the **current culture** (a language-aware order, where letters are compared ignoring the case first), and its result may depend on the computer's settings. `string.CompareOrdinal(x, y)` simply compares the **character codes**: it is fast and the same everywhere. All uppercase letters come before all lowercase ones (`"Z"` before `"a"`). For the tasks in this course, we use `CompareOrdinal` when the order of the output must be exactly predictable.

## The rules of a good comparison

For `Array.Sort` to work correctly, the comparison must be **consistent**:

- `a.CompareTo(a)` is `0`;
- if `a` is before `b`, then `b` is after `a` (the signs are opposite);
- if `a` is before `b` and `b` is before `c`, then `a` is before `c`.

A comparison that breaks these rules can give a strange order, or an exception, and the error is hard to find.

## The non-generic IComparable

There is an older interface `IComparable` (without `<T>`) with the method `CompareTo(object other)`. All numbers and strings implement both. It lets you write code that works for **any comparable thing**, without a generic type: `static IComparable Max(IComparable a, IComparable b)`. The price: the argument arrives as `object`, so it needs a cast, and comparing a number with a string throws `ArgumentException`.

## Operators

Only `CompareTo` is required. If you want to write `a < b` for your class, you must **also** define the operators `<`, `>`, `<=` and `>=` (in pairs), as in the `Vector` task. Usually `CompareTo` is enough.
