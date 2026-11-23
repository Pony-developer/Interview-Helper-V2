You already know that `lock` lets one thread at a time into a block. Interviews go further: what `lock` really is, what you may lock on, and why `await` is forbidden inside it.

## `lock` is `Monitor`

```csharp
lock (sync)
{
    balance += amount;
}
```

compiles into:

```csharp
bool taken = false;
try
{
    Monitor.Enter(sync, ref taken);
    balance += amount;
}
finally
{
    if (taken) Monitor.Exit(sync);
}
```

So the lock is always released, even after an exception. Every object in .NET can serve as a lock, because the runtime can attach a lock record to any object.

`lock` is **reentrant**: a thread that already holds the lock can enter it again (for example, through a recursive call) without blocking itself.

## What to lock on

Lock on a **private readonly object** that exists only for this purpose:

```csharp
private readonly object sync = new object();
```

Do not lock on:

- `this`: any outside code that has a reference to your object can lock on it too and block you;
- `typeof(MyClass)`: it is shared by the whole process;
- a **string**: string literals are interned, so `lock ("key")` in two unrelated classes is the same lock;
- a value type: it is boxed into a new object every time, so the lock never works (the compiler forbids it).

Since .NET 9 there is a dedicated type `System.Threading.Lock`: `private readonly Lock sync = new();`. It is a little faster and says clearly what it is for.

## No `await` inside `lock`

```csharp
lock (sync)
{
    await SaveAsync();   // compile error CS1996
}
```

A monitor belongs to a **thread**, and after `await` the method may continue on another thread, which would then try to release a lock it does not own. For async code, use `SemaphoreSlim` and `WaitAsync` (the next lecture).

## Deadlocks and timeouts

Two threads that take two locks in opposite orders can wait for each other forever. The cures:

- take locks always **in the same order**;
- hold a lock as briefly as possible, and never call unknown code (events, callbacks) inside it;
- use `Monitor.TryEnter(sync, timeout)` to give up instead of waiting forever.

## Visibility and `volatile`

Without synchronization, a compiler or processor may keep a value in a register or reorder reads and writes. A loop `while (!stop) { }` may never see that another thread set `stop = true`. `lock`, `Interlocked` and `Volatile.Read`/`Volatile.Write` all create **memory barriers** that make changes visible. The keyword `volatile` on a field does the same for simple flags, but it does not make `count++` atomic.

## Lazy initialization

The classic "double-checked locking" for a singleton is easy to get wrong. Use `Lazy<T>`, which is thread-safe by default:

```csharp
private static readonly Lazy<Config> config = new Lazy<Config>(() => Config.Load());
public static Config Instance => config.Value;   // Load runs once, even with many threads
```

## The rule

Lock on a private object, keep the block short and free of `await` and unknown code, take several locks in one fixed order, and prefer ready-made tools such as `Interlocked` and `Lazy<T>` to hand-written synchronization.
