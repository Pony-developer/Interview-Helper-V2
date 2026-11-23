`Contains(item)` answers one question: is there an element equal to `item`? To answer it, a list checks the items one by one, from the start:

```csharp
var numbers = new List<int> { 4, 8, 15 };
Console.WriteLine(numbers.Contains(8));    // True
Console.WriteLine(numbers.Contains(9));    // False
```

Searching an unsorted list costs **O(n)**: in the worst case every item is looked at. `IndexOf` returns the position of the first match, and `Remove` deletes the first match.

## What "equal" means

For numbers and strings, equal means equal value. For your own class, the list uses the method `Equals`, through the default comparer. If `Equals` is not overridden, two different objects with the same data are **not** equal:

```csharp
class Point
{
    public int X;
    public int Y;
}

var points = new List<Point> { new Point { X = 1, Y = 2 } };
Console.WriteLine(points.Contains(new Point { X = 1, Y = 2 }));   // False!
```

The two points have the same data, but they are different objects, and the default `Equals` compares the references. The fix is to override `Equals`, which the next lecture shows.

## The same for Remove and IndexOf

`Remove(item)` and `IndexOf(item)` use the same comparison. If a class does not define equality, you cannot find or remove its objects by value. Keep this in mind when you design a class that will be stored in lists.
