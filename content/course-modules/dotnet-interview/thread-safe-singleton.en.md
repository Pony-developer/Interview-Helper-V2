## Task

"Design a thread-safe Singleton in C#" is a classic Middle question. Complete `AppSettings`:

1. **`Instance`** returns the one and only instance. It must be created **lazily** (not before the first access to `Instance`) and **exactly once**, even when 1,000 parallel calls hit it at the same moment. The constructor is deliberately slow, so a naive `if (instance == null) instance = new AppSettings();` will create several instances.
2. **`Hit()`** increments the hit counter safely from many threads. `hits++` is a read-modify-write and loses updates under contention.

You may add fields to the class. Options for `Instance`, from best to worst:

- `Lazy<T>` (thread-safe by default: `LazyThreadSafetyMode.ExecutionAndPublication`);
- double-checked locking with a `lock` and a `volatile` field;
- a static readonly field initialized inline (thread-safe, but less lazy: it may be created on the first access to any static member).

For `Hit()`: `Interlocked.Increment(ref hits)` or a `lock`.

In a real application you would rather register the class with `services.AddSingleton<AppSettings>()` and inject it; be ready to say why.

Expected output:

```
before first use: 0
constructor calls: 1
distinct instances: 1
hits: 1000
```
