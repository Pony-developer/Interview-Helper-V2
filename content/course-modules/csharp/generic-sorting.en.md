Generics let one sorting method work for any type, as long as the type can be compared. The method needs two things: a **constraint** that guarantees `CompareTo`, and a generic `Swap` helper.

```csharp
static void Swap<T>(T[] items, int i, int j)
{
    T temp = items[i];
    items[i] = items[j];
    items[j] = temp;
}

static void BubbleSort<T>(T[] items) where T : IComparable<T>
{
    for (int pass = 0; pass < items.Length - 1; pass++)
    {
        for (int i = 0; i < items.Length - 1 - pass; i++)
        {
            if (items[i].CompareTo(items[i + 1]) > 0)
            {
                Swap(items, i, i + 1);
            }
        }
    }
}

int[] numbers = { 5, 2, 9, 1 };
BubbleSort(numbers);                       // 1 2 5 9

string[] words = { "pear", "apple", "plum" };
BubbleSort(words);                         // apple pear plum
```

The same code sorts integers and strings. The compiler generates the right version for each type, and `Swap` needs no constraint at all, because it only moves values.

## The constraint is the contract

Without `where T : IComparable<T>`, the call `items[i].CompareTo(...)` does not compile. The constraint says: "`T` promises to be comparable". Any type that keeps this promise can be sorted, including your own classes.

## The built-in sort

In practice, `Array.Sort` and `List<T>.Sort` are generic too, and faster. Use them in real code; write your own sort to understand how generic algorithms work.
