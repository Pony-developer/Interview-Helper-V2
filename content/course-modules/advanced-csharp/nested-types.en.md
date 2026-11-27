## A type inside a type

```csharp
public class LinkedStack<T>
{
    private Node _head;

    private class Node              // nested, private: invisible outside LinkedStack
    {
        public T Value;              // can use the outer type parameter T
        public Node Next;
    }

    public void Push(T value) => _head = new Node { Value = value, Next = _head };

    public T Pop()
    {
        if (_head == null) throw new InvalidOperationException("Stack is empty");
        T value = _head.Value;
        _head = _head.Next;
        return value;
    }
}
```

## What nesting gives you

- **Access to the enclosing type's private members.** A nested class can read and write private fields of its outer class (given an instance).
- **Any access modifier.** Top-level types can only be `public` or `internal`; nested types can also be `private`, `protected`, `private protected` or `protected internal`. The default for a nested type is `private`.
- **The outer type's generic parameters.** In the example, `Node` uses `T` without declaring it.
- **Scoping.** Outside code refers to a public nested type with a qualified name: `Outer.Inner`.

## Where you see it in practice

- **Enumerators**: `List<T>.Enumerator` is a public nested struct returned by `GetEnumerator()`.
- **Implementation details** such as nodes, builders or comparers that make sense only next to their outer class.
- **Compiler-generated types**: closures (`<>c__DisplayClass`), iterator and async state machines are emitted as private nested classes.
- **Builders**: `Order.Builder` that has privileged access to the `Order` constructor.

```csharp
public class Order
{
    private readonly List<string> _items;
    private Order(List<string> items) => _items = items;

    public class Builder
    {
        private readonly List<string> _items = new();
        public Builder Add(string item) { _items.Add(item); return this; }
        public Order Build() => new Order(_items);   // can call the private constructor
    }
}

var order = new Order.Builder().Add("pen").Add("ink").Build();
```

## When not to nest

Nesting is not a namespace. If a type is used broadly by other code, make it a top-level type: `Outer.Inner` names are clumsy in signatures, and nested types make the outer file large.

## Interview takeaways

- Nested types see the outer type's private members and generic parameters.
- They can be `private`, which is the default.
- Good for implementation details (nodes, enumerators, builders); bad as a substitute for namespaces.
