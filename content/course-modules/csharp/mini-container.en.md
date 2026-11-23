Write a tiny DI container to see what `ServiceCollection` does inside. `Container` has three methods:

- `AddTransient<T>(Func<Container, T> factory)`: remembers the factory; every `Resolve<T>()` calls it and returns a **new** object;
- `AddSingleton<T>(Func<Container, T> factory)`: remembers the factory; the **first** `Resolve<T>()` calls it, and every later call returns the **same** object;
- `Resolve<T>()`: creates or returns the object for `T`. If `T` was never registered, it throws an `InvalidOperationException` with the message `No registration for <name of T>` (use `typeof(T).Name`).

A factory receives the container itself, so it can resolve its own dependencies: `c => new Greeter(c.Resolve<IClock>())`.

Do not change `Main` or the services. Expected output:

```text
Good morning, Ann
Same greeter: False
Same clock: True
Clocks created: 1
No registration for ILogger
```

The clock is a singleton, so it is created once, although two greeters and two direct calls asked for it.

Hint: keep a `Dictionary<Type, Func<Container, object>>` of factories, a `HashSet<Type>` of the types registered as singletons, and a `Dictionary<Type, object>` of the singletons already created. A `Func<Container, T>` can be stored as `c => factory(c)`.
