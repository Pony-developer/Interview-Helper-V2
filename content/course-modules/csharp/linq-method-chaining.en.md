Most LINQ methods return a sequence, and a sequence has the same methods. So calls can be **chained**, one after another, to build a query step by step:

```csharp
var people = new[] { "Ann:31", "Bob:17", "Cy:45", "Dan:17", "Eve:28" };

var adults = people
    .Select(p => p.Split(':'))              // ["Ann", "31"], ...
    .Select(parts => new { Name = parts[0], Age = int.Parse(parts[1]) })
    .Where(p => p.Age >= 18)
    .OrderBy(p => p.Age)
    .Select(p => p.Name)
    .ToList();                              // Ann, Eve, Cy
```

Each line is one step. The reader can follow the data from top to bottom: parse, convert, filter, sort, take names, collect.

## Formatting the chain

Put one method per line, and the dots at the beginning of each line. This is the standard style, and it makes it easy to add or remove a step.

## Chains are lazy until the end

Every method in the chain returns a new sequence that remembers what to do. Nothing runs until the chain is **read**. Only `ToList()`, `ToArray()`, `Count()`, `First()`, `Sum()` and `foreach` read it:

```csharp
var query = people.Where(p => p.Length > 3);   // nothing has run yet
people = new[] { "Zed:50" };                  // the source changed
Console.WriteLine(query.Count());              // the query runs now, on the new data
```

This is the price of laziness: the result reflects the source at the moment of reading, not at the moment of the query.

## Read the chain as a sentence

Good chains are short and named: a variable with a clear name for each step, when a step is complicated. A chain of ten steps with complicated lambdas is hard to read. Break it into two named parts.
