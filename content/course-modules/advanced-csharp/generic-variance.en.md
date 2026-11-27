## The question variance answers

`string` derives from `object`. Does that make a `List<string>` a `List<object>`? **No**, and for good reason:

```csharp
List<string> names = new List<string>();
List<object> objects = names;   // error, and here is what it would allow:
objects.Add(42);                // an int inside a List<string>!
```

But reading is safe: anything you *get* out of a sequence of strings is an object. Variance lets you express exactly that.

## Covariance: `out T`

A type parameter marked `out` appears only in **output** positions (return values, read-only properties). Then a `Producer<Derived>` can be used as a `Producer<Base>`.

```csharp
IEnumerable<string> strings = new[] { "a", "b" };
IEnumerable<object> objects = strings;          // ok: IEnumerable<out T>

Func<string> makeName = () => "Ann";
Func<object> makeObject = makeName;             // ok: Func<out TResult>

IReadOnlyList<Cat> cats = new List<Cat>();
IReadOnlyList<Animal> animals = cats;           // ok
```

## Contravariance: `in T`

A type parameter marked `in` appears only in **input** positions (method parameters). Then a `Consumer<Base>` can be used as a `Consumer<Derived>`: something that can handle any animal can certainly handle a cat.

```csharp
Action<object> print = o => Console.WriteLine(o);
Action<string> printString = print;             // ok: Action<in T>

IComparer<Animal> byWeight = new WeightComparer();
IComparer<Cat> catComparer = byWeight;          // ok: IComparer<in T>
```

## Declaring variance

Only **interfaces and delegates** can declare variance; classes like `List<T>` are always invariant.

```csharp
public interface IProducer<out T> { T Produce(); }
public interface IConsumer<in T>  { void Consume(T item); }
public delegate TResult Converter<in TInput, out TResult>(TInput input);
```

The compiler checks that an `out` parameter is never used as input and vice versa.

## Limits

- Variance works only for **reference types**: `IEnumerable<int>` is not an `IEnumerable<object>`, because converting would need boxing.
- Arrays are covariant by legacy design, which is unsafe:

```csharp
object[] arr = new string[2];
arr[0] = 42;   // compiles, then throws ArrayTypeMismatchException at run time
```

## Memory aid

- **out** = things come **out** of it = producers = covariant (`IEnumerable`, `Func` result, `IReadOnlyList`).
- **in** = things go **in** = consumers = contravariant (`Action`, `IComparer`, `IEqualityComparer`, `Func` parameters).

## Interview takeaways

- `List<Derived>` is not a `List<Base>` (invariance protects writes).
- `IEnumerable<Derived>` is an `IEnumerable<Base>` (covariance, `out`).
- `Action<Base>` is an `Action<Derived>` (contravariance, `in`).
- Only interfaces and delegates, only reference types.
