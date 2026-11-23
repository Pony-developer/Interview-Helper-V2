Before generics existed, a universal container had to store `object`. Such a queue accepts anything, but every item comes out as `object`, and you must **downcast** it to use it:

```csharp
class ObjectQueue
{
    private readonly List<object> items = new List<object>();

    public void Enqueue(object item) { items.Add(item); }

    public object Dequeue()
    {
        object first = items[0];
        items.RemoveAt(0);
        return first;
    }
}

var q = new ObjectQueue();
q.Enqueue(5);
q.Enqueue("five");

int n = (int)q.Dequeue();      // fine
int s = (int)q.Dequeue();      // InvalidCastException at run time: "five" is a string
```

Two problems come from this design:

- **Nothing stops the mistake** until run time. The compiler accepts `q.Enqueue("five")` in a queue that is meant for numbers.
- **Every value is boxed** (see the lecture about boxing), and every read needs a downcast.

## The downcast is a symptom

A downcast says "I know what this object is, trust me". When you write many downcasts, the design has lost information. The type of the items was known when they went in, but the container threw it away.

## The generic solution

A generic queue keeps the type, and the compiler checks every use:

```csharp
var q = new Queue<int>();
q.Enqueue(5);
// q.Enqueue("five");          // compile error, at once
int n = q.Dequeue();           // no cast, and no boxing for int
```

A downcast is still needed when the design truly works with a base type (for example, `Animal` in a list of mixed animals). Use `is` or `as` for that, as in the inheritance lectures. But a container of one known type should be generic.
