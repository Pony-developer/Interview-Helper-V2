## Why concurrency

Concurrency means more than one thing happening at a time. In .NET you need it for:

- **responsive UIs**: keep the UI thread free while work happens elsewhere;
- **scalable servers**: handle many requests at once without a thread per waiting request;
- **parallel computation**: use every CPU core for CPU-heavy work;
- **speculative work**: start something early in case it's needed.

## Creating a thread

```csharp
var worker = new Thread(() =>
{
    for (int i = 0; i < 3; i++) Console.WriteLine($"worker {i}");
});
worker.Name = "worker";
worker.Start();
worker.Join();                     // block until it finishes (Join(timeout) returns false on timeout)
Console.WriteLine("main continues");
```

A thread has its own **stack**: local variables are private to each thread and each call. Threads share the **heap**: any object reachable from two threads can be read and written by both.

```csharp
bool done = false;                 // captured by both lambdas → shared
void Work() { if (!done) { done = true; Console.WriteLine("done"); } }
new Thread(Work).Start();
Work();                            // may print "done" once or twice: a race condition
```

## Thread safety: the first taste

The fix for the race above is mutual exclusion:

```csharp
var gate = new object();
void SafeWork()
{
    lock (gate)
    {
        if (!done) { done = true; Console.WriteLine("done"); }
    }
}
```

`lock` lets only one thread at a time into the block. Shared mutable state needs synchronization; the advanced threading module covers locks in depth.

## Passing data

```csharp
string message = "hello";
var t = new Thread(() => Print(message));        // a lambda capturing what it needs
var t2 = new Thread(state => Print((string)state!)); t2.Start("hi");   // ParameterizedThreadStart
```

Beware capturing loop variables in `for` loops (the closure trap): every thread may see the final value.

## Foreground and background threads

- **Foreground** threads (the default) keep the process alive until they finish.
- **Background** threads (`IsBackground = true`; all thread-pool threads) are killed abruptly when the last foreground thread ends: their `finally` blocks don't run.

## Exceptions

An unhandled exception in any thread **terminates the process**. A `try/catch` around `thread.Start()` can't catch it, because the exception happens on the other thread. Every thread entry method needs its own handling (or use tasks, which capture exceptions for you).

## Other members

- `Thread.Sleep(ms)` blocks; `Thread.Sleep(0)`/`Thread.Yield()` give up the rest of the time slice.
- `Thread.CurrentThread.ManagedThreadId` identifies the current thread.
- `Priority` exists but rarely helps; `Abort` no longer works in .NET Core (use cancellation tokens).

## Blocking vs spinning

A **blocked** thread waits without using CPU (Sleep, Join, waiting on a lock or I/O). A **spinning** thread loops checking a condition and burns CPU. Spinning is only worth it for waits of a few microseconds (`SpinWait`, `SpinLock`).

## In practice

Creating raw `Thread`s is rare in modern code: they're expensive (about 1 MB of stack, OS scheduling). Use **tasks** and **async/await** for most concurrency and reserve dedicated threads for long-running loops.

## Interview takeaways

- Each thread has its own stack (locals) but shares the heap (objects).
- Shared mutable state + no synchronization = race conditions.
- Unhandled exceptions on any thread crash the process; background threads die with the process.
