A `string` is an `object`. Is a `List<string>` a `List<object>`? **No**, and for a good reason:

```csharp
List<string> names = new List<string>();
List<object> things = names;   // compile error, and here is why:
things.Add(42);                // this would put an int into a list of strings
```

A list both **gives out** items (`names[0]`) and **takes in** items (`Add`). Allowing the conversion would break one of the two directions. Such a type is **invariant**.

## Covariance: `out T`

`IEnumerable<T>` only **gives out** items: there is no `Add`. So it is safe to treat a sequence of strings as a sequence of objects:

```csharp
IEnumerable<string> names = new List<string> { "Ann", "Bob" };
IEnumerable<object> things = names;   // OK: IEnumerable<out T>
```

The interface is declared as `IEnumerable<out T>`. The keyword `out` promises that `T` appears only in **output** positions (return values). The compiler checks the promise: a method `void Add(T item)` in such an interface is an error.

Covariance keeps the direction of inheritance: `string` → `object` gives `IEnumerable<string>` → `IEnumerable<object>`.

## Contravariance: `in T`

`Action<T>` only **takes in** a `T`. An action that can handle any `object` can certainly handle a `string`:

```csharp
Action<object> print = x => Console.WriteLine(x);
Action<string> printName = print;     // OK: Action<in T>
printName("Ann");
```

The keyword `in` promises that `T` appears only in **input** positions (parameters). The direction is reversed: `string` → `object` gives `Action<object>` → `Action<string>`. Another example is `IComparer<in T>`: a comparer of animals can compare dogs.

`Func<in T, out TResult>` uses both: it takes `T` in and gives `TResult` out.

## Limits

- Variance works only for **interfaces and delegates**, not for classes: `List<T>` can never be variant.
- It works only for **reference types**: `IEnumerable<int>` is not an `IEnumerable<object>`, because an `int` would need boxing.
- Arrays are covariant (`string[]` → `object[]`), but that is an old, **unsafe** exception: storing an `int` into such an array throws `ArrayTypeMismatchException` at run time.

## Declaring your own

```csharp
interface IProducer<out T> { T Produce(); }          // only gives T
interface IConsumer<in T>  { void Consume(T item); } // only takes T
```

A mnemonic: **out** = the value goes **out**, so you may see it as a more general type; **in** = the value comes **in**, so the receiver may accept a more general type than needed.

## The rule

Mark a type parameter `out` when your interface only returns it, and `in` when it only accepts it. Callers then get the conversions they expect, and the compiler guarantees they are safe.
