## Signaling: one thread tells others to proceed

Locks protect data; **signaling** coordinates timing: "wait until the data is ready", "start all workers together", "continue when everyone has finished phase 1".

## Event wait handles

| Type | Behavior |
| --- | --- |
| `ManualResetEventSlim` | a gate: `Set()` opens it for **everyone** until `Reset()` closes it |
| `AutoResetEvent` | a turnstile: `Set()` lets **one** waiting thread through, then closes automatically |
| `CountdownEvent` | opens when it has been signaled N times |

```csharp
var ready = new ManualResetEventSlim(false);

var worker = new Thread(() =>
{
    ready.Wait();                     // blocks until the gate opens
    Console.WriteLine("config loaded, starting");
});
worker.Start();

LoadConfiguration();
ready.Set();                          // opens the gate for every waiter

var done = new CountdownEvent(3);
for (int i = 0; i < 3; i++) ThreadPool.QueueUserWorkItem(_ => { Work(); done.Signal(); });
done.Wait();                          // continues after three signals
```

The `Slim` versions spin briefly before blocking and are faster; the classic `ManualResetEvent`/`AutoResetEvent` are kernel objects that can be named for cross-process signaling and combined with `WaitHandle.WaitAny/WaitAll`.

In async code, prefer `TaskCompletionSource` (a one-shot signal you can await) or `SemaphoreSlim.WaitAsync`.

## Monitor.Wait and Pulse

The low-level primitive behind many blocking structures. Inside a lock, a thread can **wait** for a condition and release the lock while waiting; another thread **pulses** after changing the state:

```csharp
lock (_sync)
{
    while (_queue.Count == 0)        // ALWAYS re-check the condition in a loop
        Monitor.Wait(_sync);         // releases the lock, sleeps, reacquires it when pulsed
    item = _queue.Dequeue();
}

lock (_sync)
{
    _queue.Enqueue(item);
    Monitor.PulseAll(_sync);         // wake the waiters; they re-check their conditions
}
```

- Waiting in a `while` loop handles spurious wakeups and the case where another thread consumed the item first.
- `Pulse` wakes one waiter, `PulseAll` wakes all; `PulseAll` is safer when waiters wait for different conditions.
- `Wait` and `Pulse` must be called while holding the lock.

## Barrier

A `Barrier` makes a fixed group of threads meet at the end of each **phase**:

```csharp
var barrier = new Barrier(participantCount: 3, postPhaseAction: b => Console.WriteLine($"phase {b.CurrentPhaseNumber} done"));

void Worker(int id)
{
    for (int phase = 0; phase < 3; phase++)
    {
        Compute(id, phase);
        barrier.SignalAndWait();   // nobody starts the next phase until all three finished this one
    }
}
```

Typical in simulations and iterative algorithms where each step depends on the results of all workers from the previous step.

## Higher-level options

Most application code shouldn't use these primitives directly. `BlockingCollection<T>` and `Channel<T>` implement producer/consumer queues, `Task.WhenAll` waits for a group, `Parallel.For` partitions work, and `TaskCompletionSource` turns a signal into an awaitable task.

## Interview takeaways

- `ManualResetEventSlim` = gate for all; `AutoResetEvent` = turnstile for one; `CountdownEvent` = after N signals.
- `Monitor.Wait/Pulse`: wait inside a lock, always in a `while` loop re-checking the condition.
- `Barrier` synchronizes phases among a fixed group of threads; in async code use TCS or channels.
