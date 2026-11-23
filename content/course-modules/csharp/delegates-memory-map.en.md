A delegate is an **object**. Like any object, it lives on the heap, and a variable of a delegate type holds a reference to it. The delegate object stores two things: the method to call, and the object the method belongs to (its target). For a static method the target is `null`.

```csharp
delegate int Operation(int a, int b);
static int Add(int a, int b) { return a + b; }

Operation f = Add;     // f is a reference
Operation g = f;       // g is a second reference to the SAME delegate object
g = Multiply;          // g now refers to a NEW delegate object; f is unchanged
```

## The picture

```text
stack                       heap
-----                       ----
f  -------------------->  [delegate: method = Add,      target = null]
g  -------------------->  [delegate: method = Multiply, target = null]
```

Assignment copies the reference, never the delegate. Changing `g` does not change `f`.

## Instance methods on the heap

```text
counter  ----------------->  [Counter object: total = 5]
f        ----------------->  [delegate: method = Counter.Add, target = counter]
```

The delegate keeps the counter object alive, even when the variable `counter` goes out of scope. This is important for the closures in the later lectures.

## Delegates are immutable

Combining or removing methods (the next module part) creates a **new** delegate object. The old one does not change. This is why `a + b` on delegates returns a new value.

## The null delegate

A variable of a delegate type is `null` until it is assigned. Calling a `null` delegate throws a `NullReferenceException`, so check before calling:

```csharp
Operation h = null;
if (h != null)
{
    Console.WriteLine(h(1, 2));
}
```
