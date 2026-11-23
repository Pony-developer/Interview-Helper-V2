The standard `Queue<T>` is ready-made, but it helps to see how a queue is built. The simplest one is a **linked list**: each item is a node that holds a value and a reference to the next node.

```csharp
class Node<T>
{
    public T Value;
    public Node<T> Next;

    public Node(T value)
    {
        Value = value;
    }
}
```

A queue keeps two references: `head` (the front, where items leave) and `tail` (the back, where items arrive). Both operations then take the same time, no matter how many items there are:

```csharp
class LinkedQueue<T>
{
    private Node<T> head;
    private Node<T> tail;
    private int count;

    public int Count { get { return count; } }

    public void Enqueue(T item)
    {
        var node = new Node<T>(item);
        if (tail == null)
        {
            head = node;                 // the queue was empty
        }
        else
        {
            tail.Next = node;            // link the new node after the last one
        }
        tail = node;
        count++;
    }

    public T Dequeue()
    {
        if (head == null)
        {
            throw new InvalidOperationException("The queue is empty");
        }
        T value = head.Value;
        head = head.Next;
        if (head == null)
        {
            tail = null;                 // the last item left
        }
        count--;
        return value;
    }
}
```

## Why it is fast

Adding to the tail and removing from the head each touch **a fixed number of references**. An array-based queue that shifts all items on every removal would take time proportional to its size. This is why the standard `Queue<T>` and linked-list queues are both O(1) per operation.

## Two details that cause bugs

- When the queue becomes empty, **both** `head` and `tail` must become `null`. Otherwise the next `Enqueue` links to an old node.
- In `Enqueue`, the empty case is special: `head` must also be set, because there is no previous node to link from.
