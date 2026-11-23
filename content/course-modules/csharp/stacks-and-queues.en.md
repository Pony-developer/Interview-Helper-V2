A **stack** and a **queue** are containers that differ only in **the order** in which items leave them.

- A **stack** is **LIFO**: last in, first out. Like a pile of plates: you put a plate on the top and take the top plate.
- A **queue** is **FIFO**: first in, first out. Like a line at a shop: the first person in line is served first.

```csharp
using System.Collections.Generic;

var stack = new Stack<int>();
stack.Push(1);
stack.Push(2);
stack.Push(3);
Console.WriteLine(stack.Pop());       // 3: the last one pushed comes out first
Console.WriteLine(stack.Peek());      // 2: looks at the top without removing it

var queue = new Queue<int>();
queue.Enqueue(1);
queue.Enqueue(2);
queue.Enqueue(3);
Console.WriteLine(queue.Dequeue());   // 1: the first one enqueued comes out first
Console.WriteLine(queue.Peek());      // 2
```

## The operations

| Stack | Queue | What it does |
|---|---|---|
| `Push(x)` | `Enqueue(x)` | adds an item |
| `Pop()` | `Dequeue()` | removes and returns the item that comes out next |
| `Peek()` | `Peek()` | returns that item without removing it |
| `Count` | `Count` | the number of items |

Taking an item from an **empty** stack or queue throws an `InvalidOperationException`. Check `Count > 0` first, or be ready to catch the exception.

## Where they are used

- **Stacks**: the undo button of an editor, the call stack of a program (every method call is pushed, every return pops), checking brackets, evaluating expressions.
- **Queues**: print jobs, requests waiting for a server, the order of the tasks in a game, the breadth-first search in graphs.

## Why the order matters

Put the numbers 1, 2, 3 in both containers and the output of `Pop` and `Dequeue` is reversed. Choose the structure by the question you need answered: "what was the **most recent** thing?" is a stack; "what **waited the longest**?" is a queue.

The next lectures show how to build these containers yourself, and how to use them in real tasks.
