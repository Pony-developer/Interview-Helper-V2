**Aggregate** functions reduce a whole sequence to one value: a count, a sum, a minimum, an average.

```csharp
var numbers = new[] { 4, 9, 1, 7 };

Console.WriteLine(numbers.Count());                    // 4
Console.WriteLine(numbers.Sum());                      // 21
Console.WriteLine(numbers.Min());                      // 1
Console.WriteLine(numbers.Max());                      // 9
Console.WriteLine(numbers.Average());                  // 5.25
```

Most of them accept a lambda that selects the value to aggregate:

```csharp
var words = new[] { "pear", "fig", "apple" };
Console.WriteLine(words.Sum(w => w.Length));           // 12
Console.WriteLine(words.Max(w => w.Length));           // 5
Console.WriteLine(words.Count(w => w.Length > 3));     // 2
```

## Empty sequences

`Count` and `Sum` of an empty sequence give `0`. `Min`, `Max` and `Average` throw an `InvalidOperationException`, because there is no minimum of nothing. Use `DefaultIfEmpty` or check `Any()` first when the sequence may be empty.

## Yes or no questions

```csharp
Console.WriteLine(numbers.Any());                      // True: there is at least one item
Console.WriteLine(numbers.Any(n => n > 8));            // True
Console.WriteLine(numbers.All(n => n > 0));            // True: every item passes
```

`Any` stops at the first item that passes, so it is cheaper than `Count() > 0`.

## Aggregate: your own reduction

`Aggregate` combines the items with a function, step by step, from a starting value:

```csharp
int product = numbers.Aggregate(1, (acc, n) => acc * n);    // 252
string joined = words.Aggregate((a, b) => a + ", " + b);     // "pear, fig, apple"
```

`Sum` is just `Aggregate` with addition. Use `Aggregate` whenever you would write a loop that accumulates one value.

## Cost

Each aggregate reads the whole sequence once. If you need several results from the same data, store the sequence in a list first (with `ToList()`), so that the source is not read again for every function.
