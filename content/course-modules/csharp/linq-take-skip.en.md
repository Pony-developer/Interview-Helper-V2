These methods choose **how many** items to take, and where to start.

```csharp
var numbers = new[] { 10, 20, 30, 40, 50 };

Console.WriteLine(string.Join(" ", numbers.Take(2).Select(n => n.ToString())));    // 10 20
Console.WriteLine(string.Join(" ", numbers.Skip(3).Select(n => n.ToString())));    // 40 50
Console.WriteLine(numbers.TakeWhile(n => n < 30).Count());                         // 2: stops at the first 30
Console.WriteLine(numbers.SkipWhile(n => n < 30).First());                         // 30
```

- `Take(n)` gives the first `n` items;
- `Skip(n)` skips the first `n` items and gives the rest;
- `TakeWhile` and `SkipWhile` do the same, but they stop at the first item that fails a test.

Taking more items than exist is not an error: `numbers.Take(100)` gives all five.

## Paging

`Skip` and `Take` together give a page of results, which is how lists in web pages are split:

```csharp
int pageSize = 2;
int pageNumber = 2;                              // the second page
var page = numbers.Skip((pageNumber - 1) * pageSize).Take(pageSize);   // 30, 40
```

## Getting a concrete result

Most LINQ methods give a sequence that is read lazily. `ToArray()` and `ToList()` read it all **now** and store the items:

```csharp
int[] copy = numbers.Take(3).ToArray();          // an array of 10, 20, 30
List<int> list = numbers.Skip(1).ToList();       // a list of 20, 30, 40, 50
```

Use them when you need to read the result several times, when you change the list afterwards, or when the source might change before you read it.

## First, Last and single items

`First()` gives the first item, and throws an exception if there is none. `FirstOrDefault()` gives the default value (`0` or `null`) instead. The same holds for `Last` and `Single`.
