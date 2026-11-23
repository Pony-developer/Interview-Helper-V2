**LINQ** (Language Integrated Query) is a set of methods for working with collections: filter them, transform them, sort them and group them. Instead of writing a loop with an `if` and a temporary list, you describe **what** you want:

```csharp
int[] numbers = { 3, 8, 5, 10, 1, 6 };

// the loop way
var evens = new List<int>();
foreach (int n in numbers)
{
    if (n % 2 == 0) evens.Add(n * n);
}

// the LINQ way: the same result, described in one line
var evenSquares = numbers.Where(n => n % 2 == 0).Select(n => n * n).ToList();
```

Both give `64, 100, 36`. The LINQ version reads as a description of the result: take the even numbers, square them, make a list.

## Two syntaxes

LINQ can be written in **method syntax** (above) or in **query syntax**, which looks like SQL:

```csharp
var evenSquares = from n in numbers
                  where n % 2 == 0
                  select n * n;
```

The compiler turns query syntax into method calls, so both are the same. Most programmers use method syntax, because it works with every method and every operator, and it is easier to chain.

## Where LINQ comes from

The methods are **extension methods** of `IEnumerable<T>`, defined in `System.Linq`. Any collection that implements `IEnumerable<T>` gets them: arrays, lists, dictionaries, strings and your own iterators. This is why the `yield return` module mattered: a LINQ query is built from iterators.

```csharp
using System.Linq;
```

## The main idea

A LINQ method does not change the collection it is called on. It returns a **new sequence** that describes the result. The actual work happens when the sequence is read. The lecture "Behind the scenes" explains this in detail.
