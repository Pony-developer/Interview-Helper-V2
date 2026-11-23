Write the generic class `LimitedStack<T>`: a stack with a fixed **capacity**. It keeps its items in an array of that size, and it must never grow beyond it.

- the constructor `LimitedStack(int capacity)`;
- `Count`: the number of items;
- `IsFull`: `true` when `Count` equals the capacity;
- `Push(item)`: adds an item. On a full stack, throw an `InvalidOperationException`;
- `Pop()`: removes and returns the top item. On an empty stack, throw an `InvalidOperationException`. Clear the array slot after taking the item, so that the stack does not keep the old object alive;
- `Peek()`: returns the top item without removing it. On an empty stack, throw the same exception.

Do not change `Main`. Expected output:

```text
True
full
2
1
1
empty
ba
```

The lines in order: the stack of capacity 2 is full after two pushes; a third push throws (`full`); `Pop` gives `2`; `Peek` gives `1`; the count is `1`; after the second `Pop`, another `Pop` on the empty stack throws (`empty`); and two pops of a string stack give `ba`, because the last pushed comes out first.

Hint: keep `private readonly T[] items;` and `private int count;`. The next free slot is `items[count]`, and the top item is `items[count - 1]`. `default(T)` gives an empty value for the slot you clear.
