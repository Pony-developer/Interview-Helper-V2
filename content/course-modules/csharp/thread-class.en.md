The class `System.Threading.Thread` creates and controls a thread. You give it a method to run, and start it:

```csharp
using System.Threading;

static void Greet()
{
    Console.WriteLine("hello from a thread");
}

var thread = new Thread(Greet);     // the method group becomes a ThreadStart delegate
thread.Start();                     // the method now runs on the new thread
thread.Join();                      // the main thread waits here until Greet finishes
Console.WriteLine("done");
```

## The most important methods

- `Start()` begins the execution of the thread.
- `Join()` blocks the calling thread until the other thread finishes. Without it, the program may end before the thread does its work.
- `Sleep(ms)` pauses the current thread for a time. It is handy for demonstrations, but rarely right in production code.

## Passing data

A thread takes a method without parameters, or one with a single `object` parameter. For other data, use a closure or a small class:

```csharp
int n = 5;
var worker = new Thread(() => Console.WriteLine(n * 2));   // the lambda captures n
worker.Start();
worker.Join();
```

## The result of a thread

A thread cannot return a value directly. Store the result in a variable that the thread writes and the main thread reads after `Join()`. The lectures on locks show how to share such a variable safely.

## Threads are not free

Each thread has its own stack, which takes memory, and switching between threads takes time. Creating a thread for each small job is wasteful. The later lectures on `Parallel` and tasks show better ways to use many small jobs.
