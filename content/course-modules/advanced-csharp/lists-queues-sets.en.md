## List<T>: the workhorse

`List<T>` wraps an array. When it fills up, it allocates an array **twice as large** and copies the items, so `Add` is O(1) amortized.

```csharp
var list = new List<int>(capacity: 1000);   // pre-size when you know the count
list.Add(5); list.AddRange(new[] { 6, 7 });
list.Insert(0, 4);                          // O(n): shifts everything right
list.RemoveAt(list.Count - 1);              // O(1) at the end
list.RemoveAll(x => x % 2 == 0);            // O(n), one pass
int i = list.BinarySearch(6);               // on a sorted list
list.Sort(); list.Reverse();
list.TrimExcess();                          // release unused capacity
var span = CollectionsMarshal.AsSpan(list); // .NET 5: direct access to the internal array
```

Removing items in a loop: iterate **backwards** with `for`, or use `RemoveAll`. Calling `Remove` inside `foreach` throws.

## LinkedList<T>

A doubly linked list of `LinkedListNode<T>`. Adding or removing **at a known node** is O(1); finding a node is O(n). Each node is a separate object, so it uses more memory and is cache-unfriendly. Its niche: when you keep references to nodes, as in an LRU cache.

```csharp
var ll = new LinkedList<string>();
LinkedListNode<string> node = ll.AddLast("b");
ll.AddBefore(node, "a"); ll.AddAfter(node, "c");
ll.Remove(node);                     // O(1) given the node
```

## Queue<T> and Stack<T>

```csharp
var queue = new Queue<Job>();        // FIFO: first in, first out
queue.Enqueue(job);
Job next = queue.Dequeue();          // throws when empty
if (queue.TryDequeue(out var j)) { } // .NET Core 2.0+

var stack = new Stack<string>();     // LIFO: last in, first out
stack.Push("a"); stack.Push("b");
string top = stack.Pop();            // "b"
stack.TryPeek(out var peek);
```

Both are backed by a circular array/array and are O(1) for the main operations. Typical uses: BFS (queue), DFS and undo history (stack), parsing brackets (stack).

## PriorityQueue<TElement, TPriority> (.NET 6)

```csharp
var pq = new PriorityQueue<string, int>();
pq.Enqueue("low", 5);
pq.Enqueue("urgent", 1);
pq.Enqueue("normal", 3);
while (pq.TryDequeue(out var item, out var priority))
    Console.WriteLine($"{priority}: {item}");   // 1: urgent, 3: normal, 5: low
```

A binary heap (actually 4-ary): O(log n) enqueue and dequeue, **lowest** priority first. It doesn't guarantee FIFO among equal priorities, and you can't update a priority in place. Great for Dijkstra, schedulers, top-K problems.

## HashSet<T> and SortedSet<T>

```csharp
var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
bool added = seen.Add("Kyiv");        // false if already present
seen.Contains("kyiv");                // true, O(1)

var a = new HashSet<int> { 1, 2, 3 };
a.IntersectWith(new[] { 2, 3, 4 });   // a = {2, 3}
a.UnionWith(new[] { 9 });             // {2, 3, 9}
a.ExceptWith(new[] { 2 });            // {3, 9}
a.IsSubsetOf(new[] { 1, 3, 9 });      // true

var sorted = new SortedSet<int> { 5, 1, 3 };   // red-black tree, kept in order
sorted.Min; sorted.Max;
sorted.GetViewBetween(2, 4);          // {3}
```

`HashSet<T>` makes no ordering promise. The set operations **modify the set in place**; use LINQ's `Intersect`/`Union` for new sequences.

## BitArray

A compact array of `bool`s (1 bit each) with `And`, `Or`, `Xor`, `Not`. Useful for large flag sets or Bloom filters.

## Interview takeaways

- `List<T>`: O(1) indexing and appending; O(n) inserting at the front.
- `LinkedList<T>` only shines when you hold node references.
- `Queue`/`Stack` O(1); `PriorityQueue` O(log n), lowest priority first.
- `HashSet<T>` set operations mutate the set.
