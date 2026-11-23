Lambdas shine when they are passed to methods of collections. Here are the common patterns:

```csharp
var people = new List<string> { "Ann", "Bob", "Cy", "Dan" };

string firstShort = people.Find(p => p.Length <= 2);   // "Cy"
List<string> withA = people.FindAll(p => p.Contains("a"));   // "Dan" (Ann has 'A' in uppercase only)
bool anyLong = people.Exists(p => p.Length > 5);       // False
people.Sort((x, y) => y.Length.CompareTo(x.Length));   // longest first
people.ForEach(p => Console.WriteLine(p));              // prints each name
```

## Transforming a list

`ConvertAll` builds a new list by applying a lambda to every item:

```csharp
var numbers = new List<int> { 1, 2, 3 };
List<string> labels = numbers.ConvertAll(n => "item " + n);   // "item 1", "item 2", "item 3"
```

## Lambdas that capture a value

A lambda can use a variable from the outside, as long as the variable is in scope:

```csharp
int limit = 10;
List<int> small = numbers.FindAll(n => n < limit);
```

The lambda reads `limit` at the moment it runs. The closure lecture explains this in detail.

## A method that returns a lambda

A method can return a delegate, and a lambda is the usual value to return:

```csharp
static Func<int, int> Multiplier(int factor)
{
    return x => x * factor;             // the returned lambda remembers "factor"
}

Func<int, int> triple = Multiplier(3);
Console.WriteLine(triple(7));           // 21
```

This is the most important use of lambdas: writing behaviour that is built from data at run time.
