## A delegate is a type-safe method pointer

A delegate **type** describes a method signature. A delegate **instance** refers to one or more methods with that signature and can call them.

```csharp
delegate int Transformer(int x);          // the delegate type

static int Square(int x) => x * x;

Transformer t = Square;                   // instance pointing to Square
int result = t(3);                        // 9: same as t.Invoke(3)
```

Because methods become values, you can pass behavior into other methods:

```csharp
static void TransformAll(int[] values, Transformer t)
{
    for (int i = 0; i < values.Length; i++) values[i] = t(values[i]);
}

int[] data = { 1, 2, 3 };
TransformAll(data, Square);               // { 1, 4, 9 }
```

This is the essence of a **plug-in method**: `TransformAll` doesn't know or care what the transformation is.

## Instance and static targets

A delegate that points to an instance method remembers the object too:

```csharp
var counter = new Counter();
Action tick = counter.Increment;
tick(); tick();
Console.WriteLine(tick.Target == counter);   // True: Target is the object
Console.WriteLine(tick.Method.Name);         // Increment
```

That also means a delegate keeps its target object **alive**: a long-lived delegate (for example in a static event) can cause a memory leak.

## Multicast delegates

All delegates can hold a list of methods. `+=` adds, `-=` removes, and invoking calls them **in order**.

```csharp
Action<string> log = Console.WriteLine;
log += s => File.AppendAllText("log.txt", s + "\n");
log("started");                             // writes to the console AND the file

log -= Console.WriteLine;                   // remove one
```

Things to know:

- **Delegates are immutable.** `+=` creates a new delegate combining the old list and the new method. Another variable that referred to the old delegate is unaffected.
- Removing the last method leaves the variable **null**.
- If the delegate returns a value, every method runs but the caller gets **only the last return value**. Multicast is meant for `void` delegates.
- If one method throws, the remaining ones **don't run**. To run all of them regardless, iterate `GetInvocationList()` and wrap each call in `try`.

## Generic delegate types

```csharp
public delegate T Transformer<T>(T arg);
Transformer<double> half = x => x / 2;
```

You rarely need to declare your own: `Func` and `Action` (next lecture) cover almost every signature.

## Delegates vs interfaces

Anything a delegate does could be done with an interface with one method. Prefer a delegate when:

- the interface would have just one method;
- a caller may want to supply **several** implementations (multicast);
- the implementation is naturally a lambda or a method of an unrelated class.

Prefer an interface when the contract has several related methods or carries state and identity.

## Interview takeaways

- A delegate type is a signature; an instance is a callable reference to methods.
- Delegates are immutable and multicast; `+=` builds a new delegate.
- A non-void multicast delegate returns only the last result.
- A delegate keeps its target alive.
