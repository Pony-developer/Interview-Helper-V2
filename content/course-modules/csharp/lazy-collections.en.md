A collection built with `yield return` is **lazy**: it computes each item only when someone asks for it. Nothing is stored in advance, so a sequence can even be infinite:

```csharp
static IEnumerable<int> Naturals()
{
    int n = 1;
    while (true)                      // never ends
    {
        yield return n;
        n++;
    }
}

foreach (int n in Naturals())
{
    if (n > 3) break;                 // we stop it ourselves
    Console.Write(n + " ");           // 1 2 3
}
```

A list would need infinite memory. The iterator needs only one number at a time.

## Pipelines run item by item

Chained LINQ methods on a lazy sequence form a **pipeline**. Each item goes through all the steps before the next item starts:

```csharp
static IEnumerable<int> Trace(IEnumerable<int> items)
{
    foreach (int x in items)
    {
        Console.WriteLine("produce " + x);
        yield return x;
    }
}

var result = Trace(new[] { 1, 2, 3 }).Where(x => x % 2 == 1);
foreach (int x in result)
{
    Console.WriteLine("use " + x);
}
// produce 1
// use 1
// produce 2
// produce 3
// use 3
```

The item `2` is produced, filtered out, and never used. Nothing waits for all the items to be produced first.

## Laziness does not cache

A lazy sequence is **re-run every time** it is enumerated. Two loops over the same `Trace(...)` call produce the items twice. If you need the results twice, store them once:

```csharp
var stored = Trace(new[] { 1, 2 }).ToList();   // the work is done once, here
```

## When laziness helps

- reading a huge file line by line, without loading it all;
- stopping early: `First()` or a `break` does not compute the rest;
- infinite or very long generated sequences;
- passing a sequence through several methods without making copies.

## When it hurts

If the source changes between the moment you create the sequence and the moment you read it, you see the new data. And an exception inside the iterator appears only when the sequence is enumerated, not when the method is called. The special cases section of the yield return lecture returns to this.
