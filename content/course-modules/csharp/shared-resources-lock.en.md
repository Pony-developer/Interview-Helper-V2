When two threads change the same variable, the result can be wrong. Consider `counter++`, which is really three steps: read, add, write. Two threads can read the same old value and both write it back plus one:

```csharp
int counter = 0;

var a = new Thread(() => { for (int i = 0; i < 100000; i++) counter++; });
var b = new Thread(() => { for (int i = 0; i < 100000; i++) counter++; });
a.Start(); b.Start();
a.Join(); b.Join();
Console.WriteLine(counter);             // often less than 200000: the increments were lost
```

This situation is a **race condition**: the result depends on the timing of the threads.

## lock: one thread at a time

The `lock` statement lets only one thread run the block at a time. The threads share a private object that acts as the lock:

```csharp
int counter = 0;
object sync = new object();              // a private object used only as the lock

var a = new Thread(() => { for (int i = 0; i < 100000; i++) { lock (sync) counter++; } });
var b = new Thread(() => { for (int i = 0; i < 100000; i++) { lock (sync) counter++; } });
a.Start(); b.Start();
a.Join(); b.Join();
Console.WriteLine(counter);              // always 200000
```

## Rules for locks

- Lock on a **private, readonly** object, so that no other code can lock on it by mistake.
- Keep the locked block **short**. Other threads wait while you hold the lock.
- Do not call slow operations (files, networks, user input) inside a lock.
- For a single increment, `Interlocked.Increment(ref counter)` is faster and needs no lock.

## Deadlock

If thread A holds lock 1 and waits for lock 2, while thread B holds lock 2 and waits for lock 1, both wait forever. This is a **deadlock**. The usual cure is to always take several locks in the same order.
