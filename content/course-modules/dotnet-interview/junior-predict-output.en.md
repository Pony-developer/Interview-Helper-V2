"What does this code print?" is a favourite Junior format: it checks that you understand how the runtime really behaves. Read each snippet, decide, then check the answer.

## Exceptions and finally

```csharp
static int Get()
{
    try { return 1; }
    finally { Console.Write("F"); }
}
Console.Write(Get());          // "F1": finally runs before the value reaches the caller
```

```csharp
try
{
    try { throw new InvalidOperationException("inner"); }
    finally { Console.Write("1"); }
}
catch (Exception ex) { Console.Write("2" + ex.Message); }
// "12inner": the inner finally runs while the exception travels up
```

```csharp
static int Count()
{
    int x = 1;
    try { return x; }
    finally { x = 10; }        // the return value was already copied: the method returns 1
}
```

## Delegates and closures

```csharp
var actions = new List<Action>();
for (int i = 0; i < 3; i++) actions.Add(() => Console.Write(i));
actions.ForEach(a => a());     // "333": one shared i, already 3
foreach (var n in new[] { 0, 1, 2 }) actions.Add(() => Console.Write(n));   // these print 012
```

```csharp
Func<int, int> twice = x => x * 2;
Func<int, int> plusOne = x => x + 1;
Console.Write(twice(plusOne(3)));   // 8
Action a = () => Console.Write("A");
a += () => Console.Write("B");
a -= () => Console.Write("A");      // a NEW lambda instance: nothing is removed
a();                                // "AB"
```

## LINQ

```csharp
var numbers = new List<int> { 3, 1, 2 };
var sorted = numbers.OrderBy(n => n);
numbers.Add(0);
Console.Write(string.Join(",", sorted));   // "0,1,2,3": deferred, sees the added 0

var evens = numbers.Where(n => { Console.Write("?"); return n % 2 == 0; });
var first = evens.First();                 // prints "???" and returns 2
```

The last one is a classic trap: `First()` pulls items one at a time, so the predicate runs only until the first match. With `{ 3, 1, 2, 0 }` it runs for 3, 1 and 2, prints `???` and never looks at 0. Laziness also means side effects inside `Where` are unpredictable — keep predicates pure.

```csharp
var words = new[] { "apple", "avocado", "banana" };
var groups = words.GroupBy(w => w[0]);
Console.Write(groups.Count());                         // 2
Console.Write(words.Any(w => w.Length > 6));           // True
Console.Write(words.Select(w => w.Length).Sum());      // 18
```

## Strings and types

```csharp
string s = "abc";
s.Replace("a", "x");
Console.Write(s);              // "abc": strings are immutable, the result was discarded

object o1 = 5, o2 = 5;
Console.Write(o1 == o2);       // False: two boxes, reference comparison
Console.Write(o1.Equals(o2));  // True: Int32.Equals compares values

int? n = null;
Console.Write(n > 0);          // False
Console.Write(n == null);      // True
```

The quiz after this lecture has more snippets of exactly this kind.
