"Asynchronous" and "multithreaded" are often used as if they meant the same thing. They solve different problems, and a program often needs one, the other, or both.

- **Multithreading** means doing several things at the same time on several threads, so that a processor with several cores can work on them in parallel. It is about **doing work faster**, or keeping the program responsive while some work runs elsewhere.
- **Asynchrony** means not waiting: a program starts an operation and continues, and it learns about the result later. It is about **not blocking while waiting**.

## Waiting is the key difference

Most of the time a program that downloads a file, reads a database or asks a web server is **waiting**, not computing. An asynchronous operation of that kind does not need a thread while it waits: the operating system completes the operation, and then the code continues.

```csharp
// Asynchronous I/O: no thread sits idle during the wait
string text = await File.ReadAllTextAsync("notes.txt");

// Multithreading: a thread does the computation
int total = await Task.Run(() => SlowCalculation());
```

`await Task.Delay(1000)` waits a second and occupies no thread. `Thread.Sleep(1000)` also waits a second, but it blocks the thread it runs on, which is wasteful.

## An async method is not a thread

This is the most common mistake. An `async` method runs on the calling thread **until its first `await`**. If there is no `await` inside, nothing moves to another thread at all:

```csharp
static async Task<int> NotParallel()
{
    return SlowCalculation();                 // still runs on the caller's thread
}

static Task<int> Parallel1()
{
    return Task.Run(() => SlowCalculation()); // this one really runs on a pool thread
}
```

## The comparison

| | Asynchronous | Multithreaded |
|---|---|---|
| The goal | do not block while waiting | do work at the same time |
| What it waits for | I/O: files, networks, databases, timers | CPU: calculations |
| Threads used | usually none while waiting | one thread for each piece of work |
| Typical tools | `await`, `Task.Delay`, async I/O methods | `Task.Run`, `Parallel`, `Thread` |

## Which one to choose

- A program that **waits** for the outside world (I/O): use asynchrony, because waiting costs almost nothing.
- A program that **computes** heavily: use multithreading, to spread the work over the cores.
- A user interface: use asynchrony to keep the window responsive, and move heavy computation to another thread with `Task.Run`.
- Often both are combined: await the downloads, and run the processing of each result on the thread pool.

The next lectures show the tools in detail, starting with tasks.
