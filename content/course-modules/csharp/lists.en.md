An array has a fixed size. When you do not know in advance how many elements there will be, or you need to add and remove them, use `List<T>`. It lives in `System.Collections.Generic`, so the file needs `using System.Collections.Generic;`.

```csharp
List<int> numbers = new List<int>();
var names = new List<string> { "Ann", "Bo", "Cy" };   // with initial values
```

`T` is the type of the elements, and it is chosen when you create the list: a list of `int`, of `string`, even a list of lists.

## The basics

```csharp
var items = new List<string>();
items.Add("tea");            // tea
items.Add("coffee");         // tea, coffee
items.Insert(1, "milk");     // tea, milk, coffee
items.Remove("milk");        // tea, coffee  (removes the first match)
items.RemoveAt(0);           // coffee       (removes by position)

Console.WriteLine(items.Count);        // 1   (Count, not Length)
Console.WriteLine(items[0]);           // coffee
items[0] = "cocoa";                    // replace by index
```

You read and write elements with `[ ]`, exactly as with an array, and indexes also start at 0. Going beyond the list throws `ArgumentOutOfRangeException`.

## Searching

```csharp
var list = new List<int> { 5, 8, 5, 2 };
list.Contains(8);       // True
list.IndexOf(5);        // 0: the first position, or -1 if absent
list.LastIndexOf(5);    // 2
```

## Changing the whole list

```csharp
list.Sort();            // 2 5 5 8, in place
list.Reverse();         // 8 5 5 2
list.AddRange(new[] { 1, 1 });   // adds several at once
list.Clear();           // empties the list
```

## Converting

```csharp
int[] array = list.ToArray();                 // a list to an array
var copy = new List<int>(array);              // an array (or another list) to a new list
```

Note that `new List<int>(other)` makes an **independent copy**, while `var same = other;` only gives the list a second name (the same rules as for arrays).

## Going through a list

```csharp
foreach (int n in list)
{
    Console.WriteLine(n);
}

for (int i = 0; i < list.Count; i++)
{
    Console.WriteLine(i + ": " + list[i]);
}
```

**Do not add or remove elements inside a `foreach` over the same list.** The next step throws `InvalidOperationException`: "Collection was modified". If you need to change the list while going over it, use a `for` loop that counts **backwards**, so that removals do not shift the elements you have not seen yet:

```csharp
for (int i = list.Count - 1; i >= 0; i--)
{
    if (list[i] % 2 == 0)
    {
        list.RemoveAt(i);    // removes the even numbers
    }
}
```

Or build a **new** list with the elements you want to keep.

## How it works inside

A `List<T>` keeps an ordinary array inside. When the array is full, the list creates a bigger one (about twice as large) and copies everything over. That is why `Add` at the end is fast on average, while `Insert` and `RemoveAt` near the beginning are slower: they have to shift the elements after them.

`Count` is the number of elements in the list. `Capacity` is the size of the inner array, and you rarely need it.

## List or array?

| | Array | List&lt;T&gt; |
| --- | --- | --- |
| Size | fixed | grows and shrinks |
| Length | `Length` | `Count` |
| Add / remove | no | yes |
| Multi-dimensional | yes | no (use a list of lists) |
| When | the size is known and fixed | the size changes, or is unknown |

A **list of lists** gives a table with rows of different lengths:

```csharp
var table = new List<List<int>>();
table.Add(new List<int> { 1, 2 });
table.Add(new List<int> { 3 });
Console.WriteLine(table[0][1]);   // 2
```

## Typical mistakes

- Using `Length` instead of `Count`, or `Count` for an array.
- Calling `Remove` and not noticing that it removes only the **first** match, and returns `false` when nothing was found.
- Creating the list with `null` instead of `new List<T>()`, and then calling `Add` on `null`.
- Modifying the list during `foreach`.
