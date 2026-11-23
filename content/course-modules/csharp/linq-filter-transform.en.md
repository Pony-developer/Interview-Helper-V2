Two methods make up most LINQ queries: **`Where`** keeps the items that pass a test, and **`Select`** turns each item into something else.

```csharp
var words = new[] { "pear", "fig", "apple", "kiwi" };

var longWords = words.Where(w => w.Length > 3);         // pear, apple, kiwi
var lengths = words.Select(w => w.Length);              // 4, 3, 5, 4
var labels = words.Select(w => "word: " + w);           // each word gets a prefix
```

`Where` takes a **predicate**: a function from an item to `true` or `false`. `Select` takes a **projection**: a function from an item to a new value. The result of `Select` can have a different type from the input: `string` in, `int` out.

## The index

Both methods have overloads that also give the position of the item:

```csharp
var numbered = words.Select((w, i) => (i + 1) + ". " + w);   // "1. pear", "2. fig", ...
var skipFirstTwo = words.Where((w, i) => i >= 2);             // apple, kiwi
```

## Chaining

The two methods combine naturally. Filter first, then transform:

```csharp
var numbers = new[] { 3, 8, 5, 10, 1, 6 };
var result = numbers.Where(n => n > 4).Select(n => n * 10);   // 80, 50, 100, 60
```

Notice the order: `Where` looks at the original numbers, and `Select` multiplies only the numbers that passed. Doing it the other way round gives the same answer here, but it may cost more work.

## Query syntax for the same thing

```csharp
var result2 = from n in numbers
              where n > 4
              select n * 10;
```

Both versions compile to the same method calls.
